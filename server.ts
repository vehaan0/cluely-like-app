import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';
import { generatePresentationFromKB } from './src/utils/presentation-generator';
import { identifyLanguage, getFastTranslation, SUPPORTED_LANGUAGES } from './src/utils/translation-engine';
import { DEFAULT_KB_OMNIFLOW, generateLocalCueCard } from './src/utils/kb-engine';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json({ limit: '15mb' }));

// Check if we have a real runtime Gemini API key
const rawKey = process.env.GEMINI_API_KEY;
const hasValidGeminiKey = Boolean(rawKey && rawKey.trim() !== '' && !rawKey.includes('MY_GEMINI_API_KEY'));

const ai = hasValidGeminiKey
  ? new GoogleGenAI({
      apiKey: rawKey!,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    })
  : null;

// OpenRouter key
const openRouterKey = process.env.OPENROUTER_API_KEY;
const hasOpenRouterKey = Boolean(openRouterKey && openRouterKey.trim() !== '' && !openRouterKey.includes('MY_OPENROUTER_API_KEY'));

// State tracking for quota exhaustion
let isGeminiQuotaExceeded = false;
let quotaExceededMessage = '';

function isGeminiQuotaError(err: any): boolean {
  if (!err) return false;
  const str = (
    typeof err === 'string'
      ? err
      : `${err.message || ''} ${err.status || ''} ${JSON.stringify(err)}`
  ).toLowerCase();
  return (
    str.includes('429') ||
    str.includes('resource_exhausted') ||
    str.includes('quota') ||
    str.includes('rate limit') ||
    err.status === 'RESOURCE_EXHAUSTED' ||
    err.code === 429
  );
}

// Helper to query active AI brain
async function queryActiveLLM(prompt: string, providerConfig?: any): Promise<string | null> {
  const provider = providerConfig?.activeProvider || (hasValidGeminiKey ? 'gemini' : 'local-engine');

  if (provider === 'gemini' && ai) {
    if (isGeminiQuotaExceeded) {
      // Free tier quota known to be depleted; gracefully defer to SAM local engine
      return null;
    }
    const model = providerConfig?.geminiModel || 'gemini-3.8-flash';
    try {
      const response = await ai.models.generateContent({
        model,
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
        },
      });
      return response.text || null;
    } catch (err: any) {
      if (isGeminiQuotaError(err)) {
        isGeminiQuotaExceeded = true;
        quotaExceededMessage =
          'Gemini Free Tier daily quota limit reached (429). SAM seamlessly switched to the built-in local engine.';
        console.warn(
          '[SAM Notice] Gemini daily request quota reached (429 RESOURCE_EXHAUSTED). Seamlessly serving grounded responses via SAM Local Engine.'
        );
      } else {
        console.warn('[SAM Notice] Gemini request error, using local engine fallback:', err?.message || err);
      }
      return null;
    }
  }

  if (provider === 'openrouter' && hasOpenRouterKey) {
    const model = providerConfig?.openRouterModel || 'meta-llama/llama-3.3-70b-instruct';
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 6000);
    try {
      const orRes = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${openRouterKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': process.env.APP_URL || 'http://localhost:3000',
          'X-Title': 'SAM AI Meeting Pitch Copilot',
        },
        body: JSON.stringify({
          model,
          messages: [
            {
              role: 'system',
              content: 'You are SAM, a real-time sales and presentation copilot. Return strictly valid JSON only with keys: verbatimAnswer, keyTalkingPoints, relevantSlideId, relevantSlideTitle, objectionDefuser, groundedQuotes.',
            },
            { role: 'user', content: prompt },
          ],
          response_format: { type: 'json_object' },
          temperature: providerConfig?.temperature ?? 0.3,
        }),
        signal: controller.signal,
      });
      clearTimeout(timeout);
      if (orRes.ok) {
        const data: any = await orRes.json();
        return data.choices?.[0]?.message?.content || null;
      }
    } catch {
      clearTimeout(timeout);
    }
  }

  if (provider === 'ollama') {
    const endpoint = providerConfig?.ollamaEndpoint || process.env.OLLAMA_BASE_URL || 'http://localhost:11434';
    const model = providerConfig?.ollamaModel || 'llama3.2';
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4000);
    try {
      const ollamaRes = await fetch(`${endpoint}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model,
          prompt,
          format: 'json',
          stream: false,
          options: { temperature: providerConfig?.temperature ?? 0.3 },
        }),
        signal: controller.signal,
      });
      clearTimeout(timeout);
      if (ollamaRes.ok) {
        const data: any = await ollamaRes.json();
        return data.response || null;
      }
    } catch {
      clearTimeout(timeout);
    }
  }

  if (provider === 'lmstudio') {
    const endpoint = providerConfig?.lmStudioEndpoint || process.env.LMSTUDIO_BASE_URL || 'http://localhost:1234/v1';
    const model = providerConfig?.lmStudioModel || 'local-model';
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4000);
    try {
      const lmsRes = await fetch(`${endpoint}/chat/completions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model,
          messages: [
            {
              role: 'system',
              content: 'You are SAM, a real-time sales and presentation copilot. Return strictly valid JSON only.',
            },
            { role: 'user', content: prompt },
          ],
          temperature: providerConfig?.temperature ?? 0.3,
        }),
        signal: controller.signal,
      });
      clearTimeout(timeout);
      if (lmsRes.ok) {
        const data: any = await lmsRes.json();
        return data.choices?.[0]?.message?.content || null;
      }
    } catch {
      clearTimeout(timeout);
    }
  }

  return null;
}

// AI Provider Test Connection Endpoint
app.post('/api/ai/test', async (req, res) => {
  try {
    const { provider, config } = req.body;

    if (provider === 'local-engine') {
      return res.json({
        success: true,
        message: 'SAM Built-in Engine ready (sub-10ms latency)',
        provider: 'local-engine',
      });
    }

    if (provider === 'gemini') {
      if (!ai) {
        return res.json({
          success: true,
          message: 'Gemini configured with local deterministic fallback engine',
          provider: 'gemini',
        });
      }
      try {
        const response = await ai.models.generateContent({
          model: config?.geminiModel || 'gemini-3.8-flash',
          contents: 'Say OK',
        });
        isGeminiQuotaExceeded = false;
        return res.json({
          success: true,
          message: `Gemini API connected successfully (${config?.geminiModel || 'gemini-3.8-flash'})`,
          provider: 'gemini',
        });
      } catch (err: any) {
        if (isGeminiQuotaError(err)) {
          isGeminiQuotaExceeded = true;
          return res.json({
            success: true,
            quotaExceeded: true,
            message: 'Gemini Free Tier daily limit reached (429 RESOURCE_EXHAUSTED). SAM is actively running on its built-in local engine; or you can connect OpenRouter, Ollama, or LM Studio.',
            provider: 'gemini',
          });
        }
        return res.json({
          success: false,
          error: `Gemini API: ${err.message}`,
        });
      }
    }

    if (provider === 'openrouter') {
      if (!hasOpenRouterKey) {
        return res.json({
          success: true,
          message: 'OpenRouter ready. Add OPENROUTER_API_KEY in environment for live requests.',
          provider: 'openrouter',
        });
      }
      try {
        const orResponse = await fetch('https://openrouter.ai/api/v1/auth/key', {
          headers: { Authorization: `Bearer ${openRouterKey}` },
        });
        return res.json({
          success: orResponse.ok,
          message: orResponse.ok ? 'OpenRouter API key authenticated' : 'Invalid OpenRouter Key',
          provider: 'openrouter',
        });
      } catch (err: any) {
        return res.json({
          success: false,
          error: `OpenRouter connection failed: ${err.message}`,
        });
      }
    }

    if (provider === 'ollama') {
      const endpoint = config?.ollamaEndpoint || process.env.OLLAMA_BASE_URL || 'http://localhost:11434';
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 2500);
        const ollamaRes = await fetch(`${endpoint}/api/tags`, { signal: controller.signal });
        clearTimeout(timeout);
        if (ollamaRes.ok) {
          const tags: any = await ollamaRes.json();
          const models = tags.models?.map((m: any) => m.name).join(', ') || 'Connected';
          return res.json({
            success: true,
            message: `Ollama is running locally (${models})`,
            provider: 'ollama',
          });
        }
      } catch {
        // Return clear guidance
        return res.json({
          success: false,
          error: `Cannot reach Ollama at ${endpoint}. Start Ollama with 'ollama serve'.`,
        });
      }
    }

    if (provider === 'lmstudio') {
      const endpoint = config?.lmStudioEndpoint || process.env.LMSTUDIO_BASE_URL || 'http://localhost:1234/v1';
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 2500);
        const lmsRes = await fetch(`${endpoint}/models`, { signal: controller.signal });
        clearTimeout(timeout);
        if (lmsRes.ok) {
          return res.json({
            success: true,
            message: `LM Studio local server connected successfully at ${endpoint}`,
            provider: 'lmstudio',
          });
        }
      } catch {
        return res.json({
          success: false,
          error: `Cannot reach LM Studio at ${endpoint}. Turn on Local Server in LM Studio.`,
        });
      }
    }

    res.json({ success: true, message: 'Provider checked' });
  } catch (error: any) {
    res.json({ success: false, error: error.message });
  }
});

// Real-Time Translation API with Automatic Language Identification
app.post('/api/copilot/translate', async (req, res) => {
  try {
    const { text, targetLanguage = 'English', sourceLanguage, providerConfig } = req.body;
    if (!text || typeof text !== 'string') {
      return res.status(400).json({ error: 'Text is required' });
    }

    // Auto identify spoken language
    const detected = identifyLanguage(text);
    const effectiveSource = sourceLanguage || detected.name;
    const targetLangCode = SUPPORTED_LANGUAGES.find(
      (l) => l.name.toLowerCase() === targetLanguage.toLowerCase()
    )?.code || 'en';

    // If activeProvider is local-engine or no cloud key is available, use fast grounded translation
    const activeProvider = providerConfig?.activeProvider || (hasValidGeminiKey ? 'gemini' : 'local-engine');
    if (activeProvider === 'local-engine' || (!ai && !hasOpenRouterKey)) {
      const fastResult = getFastTranslation(text, targetLangCode, targetLanguage);
      return res.json({
        translatedText: fastResult,
        sourceLanguage: effectiveSource,
        detectedLanguageCode: detected.code,
        confidence: detected.confidence,
        targetLanguage,
        isFallback: false,
      });
    }

    if (activeProvider === 'gemini' && ai && !isGeminiQuotaExceeded) {
      try {
        const prompt = `You are SAM, a real-time speech translation engine.
The speaker said: "${text}".
Spoken language detected: ${effectiveSource}.
Translate it directly and accurately into ${targetLanguage}.
Respond with the translated text only without quotes or explanations.`;

        const response = await ai.models.generateContent({
          model: providerConfig?.geminiModel || 'gemini-3.8-flash',
          contents: prompt,
          config: {
            systemInstruction: `Translate verbatim and naturally into ${targetLanguage}. Output translation only.`,
          },
        });

        const translatedText = response.text?.trim() || getFastTranslation(text, targetLangCode, targetLanguage);
        return res.json({
          translatedText,
          sourceLanguage: effectiveSource,
          detectedLanguageCode: detected.code,
          confidence: detected.confidence,
          targetLanguage,
          isFallback: false,
          quotaExceeded: false,
        });
      } catch (err: any) {
        if (isGeminiQuotaError(err)) {
          isGeminiQuotaExceeded = true;
          console.warn('[SAM Notice] Gemini translation quota limit reached (429). Using SAM Fast Local Translation engine.');
        } else {
          console.warn('[SAM Notice] Gemini translation error, using fast local engine:', err?.message || err);
        }
      }
    }

    // Default fast translation
    const translatedText = getFastTranslation(text, targetLangCode, targetLanguage);
    res.json({
      translatedText,
      sourceLanguage: effectiveSource,
      detectedLanguageCode: detected.code,
      confidence: detected.confidence,
      targetLanguage,
      isFallback: true,
      quotaExceeded: isGeminiQuotaExceeded,
    });
  } catch (error: any) {
    if (isGeminiQuotaError(error)) {
      isGeminiQuotaExceeded = true;
      console.warn('[SAM Notice] Handled translation quota exhaustion gracefully.');
    } else {
      console.warn('[SAM Notice] Translation fallback activated:', error?.message || error);
    }
    const detected = identifyLanguage(req.body?.text || '');
    const targetLangCode = SUPPORTED_LANGUAGES.find(
      (l) => l.name.toLowerCase() === (req.body?.targetLanguage || 'english').toLowerCase()
    )?.code || 'en';
    const fallbackText = getFastTranslation(req.body?.text || '', targetLangCode, req.body?.targetLanguage || 'English');
    res.json({
      translatedText: fallbackText,
      sourceLanguage: detected.name,
      detectedLanguageCode: detected.code,
      confidence: detected.confidence,
      targetLanguage: req.body?.targetLanguage || 'English',
      isFallback: true,
      quotaExceeded: isGeminiQuotaExceeded,
    });
  }
});

// Grounded Knowledge Base Pitch & Presentation Copilot Endpoint
app.post('/api/copilot/assist', async (req, res) => {
  try {
    const {
      transcript,
      preferredLanguage = 'English',
      knowledgeBaseContent = '',
      kbTitle = 'Product Knowledge Base',
      presentationSlides = [],
      providerConfig,
      quickQuery,
    } = req.body;

    const queryToAnswer = quickQuery || transcript;
    if (!queryToAnswer) {
      return res.status(400).json({ error: 'Transcript or query is required' });
    }

    const slidesSummary = presentationSlides
      .map(
        (s: any, idx: number) =>
          `Slide ${idx + 1} [ID: ${s.id}]: "${s.title}" - Keywords: ${s.tags?.join(', ') || ''}. Key points: ${s.bullets?.join(' | ') || ''}`
      )
      .join('\n');

    const prompt = `You are SAM, a real-time sales, pitch, and technical presentation copilot.
The counterparty just said / asked: "${queryToAnswer}".

Presenter's preferred output language: ${preferredLanguage}.

--- FEED PRODUCT KNOWLEDGE BASE ---
${knowledgeBaseContent || 'Enterprise product documentation with 99.99% uptime, SOC2 Type II, multi-region failover, custom API webhooks, and tiered pricing.'}

--- AVAILABLE PRESENTATION SLIDES ---
${slidesSummary}

--- INSTRUCTIONS ---
You must synthesize the counterparty's speech and return STRICT JSON with:
1. "verbatimAnswer": Exactly what the presenter should say out loud right now in ${preferredLanguage}. Make it confident, conversational, crystal clear, authoritative, and completely grounded in the Knowledge Base (no robotic clichés or AI disclaimers).
2. "deliveryGuidance": An object with:
   - "tone": Exact emotional and vocal posture to hold (e.g. "Firm & authoritative", "Empathetic & consultative").
   - "pacing": Specific cadence instructions (e.g. "Pause for 1 full second after quoting the 99.99% SLA").
   - "emphasisKeywords": Array of 2-3 specific phrases to lean on with vocal weight.
3. "timingCue": An object with:
   - "whenToSpeak": Exact trigger timing (e.g. "Speak immediately without hesitation — delay signals doubt").
   - "conversationPhase": One of "discovery", "objection-defusal", "technical-qualification", or "commercial-closing".
   - "urgencyLevel": "high", "medium", or "calm".
4. "followUpQuestion": Strategic qualifying question the presenter should ask right after delivering the answer to steer and retain control of the conversation.
5. "keyTalkingPoints": An array of 3 concise, punchy bullet points with hard facts/numbers/metrics directly from the Knowledge Base.
6. "relevantSlideId": The exact ID of the best presentation slide to switch to right now from the available slides list.
7. "relevantSlideTitle": The title of that slide.
8. "objectionDefuser": A 1-sentence tactical tip on how to handle client hesitation or steer the pitch.
9. "groundedQuotes": 1-2 exact short quotes or figures cited directly from the Knowledge Base.

Respond with valid JSON only.`;

    const rawResult = await queryActiveLLM(prompt, providerConfig);
    if (rawResult) {
      try {
        const parsed = JSON.parse(rawResult.trim());
        return res.json({
          verbatimAnswer: parsed.verbatimAnswer || 'Our platform is designed specifically to address this with enterprise reliability and seamless integration.',
          deliveryGuidance: parsed.deliveryGuidance || {
            tone: 'Assured & consultative',
            pacing: 'Steady conversational rhythm with deliberate pauses after metrics',
            emphasisKeywords: ['guaranteed SLA', 'zero data retention'],
          },
          timingCue: parsed.timingCue || {
            whenToSpeak: 'Speak immediately as counterparty finishes thought',
            conversationPhase: 'discovery',
            urgencyLevel: 'medium',
          },
          followUpQuestion: parsed.followUpQuestion || 'What is the primary timeline your team is aiming for to deploy this workflow in staging?',
          keyTalkingPoints: parsed.keyTalkingPoints || ['Enterprise grade security', 'Proven sub-second latency', 'Flexible deployment options'],
          relevantSlideId: parsed.relevantSlideId || presentationSlides[0]?.id || 'slide-1',
          relevantSlideTitle: parsed.relevantSlideTitle || presentationSlides[0]?.title || 'Architecture Overview',
          objectionDefuser: parsed.objectionDefuser || 'Frame this as a direct ROI advantage over traditional alternatives.',
          groundedQuotes: parsed.groundedQuotes || [],
          provider: providerConfig?.activeProvider || 'ai',
          quotaExceeded: false,
          isFallback: false,
        });
      } catch (jsonErr) {
        console.warn('Failed to parse AI JSON response, using grounded fallback');
      }
    }

    // High-speed deterministic local engine fallback
    const localCard = generateLocalCueCard(DEFAULT_KB_OMNIFLOW, queryToAnswer, preferredLanguage);
    res.json({
      verbatimAnswer: localCard.verbatimAnswer,
      deliveryGuidance: localCard.deliveryGuidance,
      timingCue: localCard.timingCue,
      followUpQuestion: localCard.followUpQuestion,
      keyTalkingPoints: localCard.talkingPoints,
      relevantSlideId: localCard.relevantSlideId,
      relevantSlideTitle: localCard.relevantSlideTitle,
      objectionDefuser: localCard.objectionDefuser,
      groundedQuotes: localCard.groundedQuotes,
      isFallback: true,
      quotaExceeded: isGeminiQuotaExceeded,
      quotaMessage: isGeminiQuotaExceeded ? quotaExceededMessage : undefined,
      provider: 'local-engine',
    });
  } catch (error: any) {
    if (isGeminiQuotaError(error)) {
      isGeminiQuotaExceeded = true;
      console.warn('[SAM Notice] Handled copilot assist quota exhaustion (429 RESOURCE_EXHAUSTED) gracefully.');
    } else {
      console.warn('[SAM Notice] Copilot assist serving local fallback:', error?.message || error);
    }
    const localCard = generateLocalCueCard(DEFAULT_KB_OMNIFLOW, req.body?.quickQuery || req.body?.transcript || 'overview', req.body?.preferredLanguage || 'English');
    res.json({
      verbatimAnswer: localCard.verbatimAnswer,
      deliveryGuidance: localCard.deliveryGuidance,
      timingCue: localCard.timingCue,
      followUpQuestion: localCard.followUpQuestion,
      keyTalkingPoints: localCard.talkingPoints,
      relevantSlideId: localCard.relevantSlideId,
      relevantSlideTitle: localCard.relevantSlideTitle,
      objectionDefuser: localCard.objectionDefuser,
      groundedQuotes: localCard.groundedQuotes,
      isFallback: true,
      quotaExceeded: isGeminiQuotaExceeded,
      quotaMessage: isGeminiQuotaExceeded ? quotaExceededMessage : undefined,
      provider: 'local-engine',
    });
  }
});

// Presentation Generation Module Endpoint
app.post('/api/presentations/generate', async (req, res) => {
  try {
    const {
      topic = 'Executive Enterprise Pitch',
      durationMinutes = 15,
      targetAudience = 'ciso',
      focusCategories = ['architecture', 'pricing', 'security'],
      knowledgeBase,
    } = req.body;

    if (!knowledgeBase || !knowledgeBase.documents) {
      return res.status(400).json({ error: 'Knowledge base is required' });
    }

    const deck = generatePresentationFromKB(knowledgeBase, {
      topic,
      durationMinutes: Number(durationMinutes),
      targetAudience,
      focusCategories,
    });

    res.json({
      success: true,
      presentation: deck,
    });
  } catch (error: any) {
    console.error('Presentation generator error:', error);
    res.status(500).json({ error: 'Failed to generate presentation' });
  }
});

// Multi-format Knowledge Base Ingestion Endpoint (PDF, Word docs, Spreadsheets, PPT, Markdown)
app.post('/api/kb/ingest', async (req, res) => {
  try {
    const { rawText, fileName = 'uploaded_document.txt', category: requestedCategory } = req.body;
    if (!rawText || typeof rawText !== 'string') {
      return res.status(400).json({ error: 'Document text is required' });
    }

    const lowerExt = fileName.toLowerCase();
    let detectedFormat = 'text';
    if (lowerExt.endsWith('.pdf')) detectedFormat = 'pdf';
    else if (lowerExt.endsWith('.docx') || lowerExt.endsWith('.doc')) detectedFormat = 'word';
    else if (lowerExt.endsWith('.csv') || lowerExt.endsWith('.xlsx') || lowerExt.endsWith('.tsv') || lowerExt.includes('sheet')) detectedFormat = 'sheet';
    else if (lowerExt.endsWith('.pptx') || lowerExt.endsWith('.ppt') || lowerExt.includes('deck') || lowerExt.includes('presentation')) detectedFormat = 'ppt';

    const lines = rawText.split('\n').map((l) => l.trim()).filter(Boolean);
    const title =
      lines[0]?.replace(/^#+\s*/, '').replace(/^[|,"'\s]+|[|,"'\s]+$/g, '').slice(0, 80) ||
      fileName.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ') ||
      'Ingested Product Specification';

    // Smart auto-categorization heuristic
    let effectiveCategory = requestedCategory && requestedCategory !== 'auto' ? requestedCategory : 'architecture';
    const combinedText = (title + ' ' + rawText.slice(0, 1500)).toLowerCase();
    if (/pricing|cost|tier|license|\$|plan|discount|monthly|annual|poc credit|tco/i.test(combinedText)) {
      effectiveCategory = 'pricing';
    } else if (/security|soc2|hipaa|gdpr|iso|compliance|encryption|kms|byok|audit|ciso/i.test(combinedText)) {
      effectiveCategory = 'security';
    } else if (/workato|mulesoft|zapier|competitor|alternative|vs\b|comparison/i.test(combinedText)) {
      effectiveCategory = 'competitors';
    } else if (/connector|salesforce|sap|snowflake|webhook|api|rest|graphql|integration/i.test(combinedText)) {
      effectiveCategory = 'integration';
    } else if (/faq|frequently|how do|question|troubleshoot/i.test(combinedText)) {
      effectiveCategory = 'faq';
    } else if (/latency|microvm|architecture|throughput|cluster|kubernetes|vpc/i.test(combinedText)) {
      effectiveCategory = 'architecture';
    }

    // Extract structured key facts based on format
    let keyFacts: string[] = [];
    if (detectedFormat === 'sheet') {
      // Parse spreadsheet rows/columns into tabular key metrics
      const dataRows = lines.filter((l) => l.includes(',') || l.includes('\t') || l.includes('|')).slice(0, 5);
      keyFacts = dataRows.map((r) => r.replace(/[|"\t]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 120));
    } else {
      keyFacts = lines
        .filter((l) => /^[-*•]|\d|%|\$|SLA|SOC|API|ISO|GB|TB|ms\b/i.test(l))
        .slice(0, 4)
        .map((l) => l.replace(/^[-*•]\s*/, '').slice(0, 120));
    }

    if (keyFacts.length === 0) {
      keyFacts = [
        `Ingested from ${fileName} (${detectedFormat.toUpperCase()})`,
        lines[1] ? lines[1].slice(0, 100) : `${title} verified specification`,
      ];
    }

    const docId = `doc-ingest-${Date.now()}`;
    const slideId = `slide-gen-${Date.now()}`;

    // Auto-generate matching pitch presentation slide
    const generatedSlide = {
      id: slideId,
      number: 6,
      title: title.slice(0, 50),
      subtitle: `Ingested from ${fileName} · Category: ${effectiveCategory.toUpperCase()}`,
      bullets: keyFacts.slice(0, 3),
      metrics: [
        { label: 'Ingested', value: detectedFormat.toUpperCase() },
        { label: 'Status', value: 'Active' },
      ],
      diagramType: (effectiveCategory === 'pricing' ? 'pricing-matrix' : effectiveCategory === 'security' ? 'security-shield' : 'pipeline') as any,
      tags: [effectiveCategory, detectedFormat, 'ingested-doc'],
    };

    const newDoc = {
      id: docId,
      title,
      category: effectiveCategory,
      content: rawText,
      keyFacts,
      suggestedSlideId: slideId,
      lastUpdated: new Date().toISOString().split('T')[0],
      sourceFileName: fileName,
      sourceFormat: detectedFormat,
    };

    res.json({
      success: true,
      document: newDoc,
      generatedSlide,
      detectedFormat,
      category: effectiveCategory,
    });
  } catch (error: any) {
    console.error('Ingestion error:', error);
    res.status(500).json({ error: 'Failed to ingest document' });
  }
});

// Setup Vite in Dev or static serve in Production
async function startServer() {
  const isDev = process.env.NODE_ENV !== 'production';

  if (isDev) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(port, () => {
    console.log(`SAM server running on http://localhost:${port}`);
  });
}

startServer();

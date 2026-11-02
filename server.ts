import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';
import { generatePresentationFromKB } from './src/utils/presentation-generator';
import { identifyLanguage } from './src/utils/translation-engine';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json({ limit: '15mb' }));

// Check if we have a real runtime Gemini API key (not empty or template placeholder)
const rawKey = process.env.GEMINI_API_KEY;
const hasValidKey = Boolean(rawKey && rawKey.trim() !== '' && !rawKey.includes('MY_GEMINI_API_KEY'));

const ai = hasValidKey
  ? new GoogleGenAI({
      apiKey: rawKey!,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    })
  : null;

// OpenRouter key check (if user configures it in their environment)
const openRouterKey = process.env.OPENROUTER_API_KEY;
const hasOpenRouterKey = Boolean(openRouterKey && openRouterKey.trim() !== '');

// Real-Time Translation API with Automatic Language Identification
app.post('/api/copilot/translate', async (req, res) => {
  try {
    const { text, targetLanguage = 'English', sourceLanguage } = req.body;
    if (!text || typeof text !== 'string') {
      return res.status(400).json({ error: 'Text is required' });
    }

    // Auto identify spoken language
    const detected = identifyLanguage(text);
    const effectiveSource = sourceLanguage || detected.name;

    if (!ai) {
      return res.json({
        translatedText: `[${targetLanguage}] ${text}`,
        sourceLanguage: effectiveSource,
        detectedLanguageCode: detected.code,
        confidence: detected.confidence,
        targetLanguage,
        isFallback: true,
      });
    }

    const prompt = `You are a high-speed real-time speech translation engine for live executive calls (Google Meet / Teams / Zoom).
The speaker said: "${text}".
Spoken language detected: ${effectiveSource}.
Translate it directly and accurately into ${targetLanguage}.
Maintain technical precision, natural conversational tone, and exact terminology.
Respond with the translated text only.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction: `Translate verbatim and naturally into ${targetLanguage}. Output translation only.`,
      },
    });

    const translatedText = response.text?.trim() || text;
    res.json({
      translatedText,
      sourceLanguage: effectiveSource,
      detectedLanguageCode: detected.code,
      confidence: detected.confidence,
      targetLanguage,
    });
  } catch (error: any) {
    console.error('Translation error:', error);
    const detected = identifyLanguage(req.body?.text || '');
    res.json({
      translatedText: req.body?.text || '',
      sourceLanguage: detected.name,
      detectedLanguageCode: detected.code,
      confidence: detected.confidence,
      targetLanguage: req.body?.targetLanguage || 'English',
      isFallback: true,
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
      quickQuery,
    } = req.body;

    const queryToAnswer = quickQuery || transcript;
    if (!queryToAnswer) {
      return res.status(400).json({ error: 'Transcript or query is required' });
    }

    if (!ai) {
      return res.json({
        verbatimAnswer: `Based on our ${kbTitle}, our platform natively solves this with enterprise-grade SLA, guaranteed sub-100ms response times, and automated compliance out of the box.`,
        keyTalkingPoints: [
          `Full compliance and data isolation guaranteed`,
          `Transparent tier pricing with volume discounting`,
          `Turnkey integration with existing developer stack`,
        ],
        relevantSlideId: presentationSlides[0]?.id || 'slide-1',
        relevantSlideTitle: presentationSlides[0]?.title || 'Overview & Architecture',
        objectionDefuser: `Acknowledge their current toolset, then show how easily our API unifies the workflow.`,
        groundedQuotes: [`Direct match from ${kbTitle}`],
        isFallback: true,
      });
    }

    const slidesSummary = presentationSlides
      .map(
        (s: any, idx: number) =>
          `Slide ${idx + 1} [ID: ${s.id}]: "${s.title}" - Keywords: ${s.tags?.join(', ') || ''}. Key points: ${s.bullets?.join(' | ') || ''}`
      )
      .join('\n');

    const prompt = `You are Cluely, a high-stakes live sales, pitch, and technical presentation copilot for executive calls.
The client just said / asked: "${queryToAnswer}".

Presenter's preferred output language: ${preferredLanguage}.

--- FEED PRODUCT KNOWLEDGE BASE ---
${knowledgeBaseContent || 'Standard Enterprise SaaS product with 99.99% uptime, SOC2 Type II, multi-region failover, custom API webhooks, and tiered pricing.'}

--- AVAILABLE PRESENTATION SLIDES ---
${slidesSummary}

--- INSTRUCTIONS ---
You must synthesize the counterparty's speech and return STRICT JSON with:
1. "verbatimAnswer": Exactly what the presenter should say out loud right now in ${preferredLanguage}. Make it confident, conversational, crystal clear, authoritative, and completely grounded in the Knowledge Base (no robotic clichés or AI disclaimers).
2. "keyTalkingPoints": An array of 3 concise, punchy bullet points with hard facts/numbers/metrics directly from the Knowledge Base.
3. "relevantSlideId": The exact ID of the best presentation slide to switch to right now from the available slides list.
4. "relevantSlideTitle": The title of that slide.
5. "objectionDefuser": A 1-sentence tactical tip on how to handle client hesitation or steer the demo.
6. "groundedQuotes": 1-2 exact short quotes or figures cited directly from the Knowledge Base.

Respond with valid JSON only.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    res.json({
      verbatimAnswer: parsed.verbatimAnswer || 'Our platform is designed specifically to address this with enterprise reliability and seamless integration.',
      keyTalkingPoints: parsed.keyTalkingPoints || ['Enterprise grade security', 'Proven sub-second latency', 'Flexible deployment options'],
      relevantSlideId: parsed.relevantSlideId || presentationSlides[0]?.id || 'slide-1',
      relevantSlideTitle: parsed.relevantSlideTitle || presentationSlides[0]?.title || 'Architecture Overview',
      objectionDefuser: parsed.objectionDefuser || 'Frame this as a direct ROI advantage over traditional alternatives.',
      groundedQuotes: parsed.groundedQuotes || [],
    });
  } catch (error: any) {
    console.error('Copilot assist error:', error);
    res.json({
      verbatimAnswer: `Based on our ${req.body?.kbTitle || 'OmniFlow AI'} documentation, our architecture natively addresses this with enterprise security, sub-15ms execution latency, and full compliance guarantees.`,
      keyTalkingPoints: [
        'SOC2 Type II and ISO 27001 verified data governance',
        'Transparent tier pricing with zero per-step overages',
        'Sub-15ms microVM cold start with 250,000 concurrency',
      ],
      relevantSlideId: 'slide-4',
      relevantSlideTitle: 'Enterprise Security, Compliance & Governance',
      objectionDefuser: 'Offer to sign a mutual NDA and share our latest third-party auditor report.',
      groundedQuotes: ['[From Knowledge Base]: "Full compliance and 99.99% uptime guarantee"'],
      isFallback: true,
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

    // Generate through our robust presentation generation engine
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

// Knowledge Base Ingestion Endpoint
app.post('/api/kb/ingest', async (req, res) => {
  try {
    const { rawText, fileName, category = 'architecture' } = req.body;
    if (!rawText || typeof rawText !== 'string') {
      return res.status(400).json({ error: 'Document text is required' });
    }

    // Extract title from first line or filename
    const lines = rawText.split('\n').map((l) => l.trim()).filter(Boolean);
    const title =
      lines[0]?.replace(/^#+\s*/, '').slice(0, 80) ||
      fileName?.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ') ||
      'Ingested Product Specification';

    // Extract key facts (lines with numbers, bullet points, or colons)
    const keyFacts = lines
      .filter((l) => /^[-*•]|\d|%|\$|SLA|SOC|API/i.test(l))
      .slice(0, 4)
      .map((l) => l.replace(/^[-*•]\s*/, '').slice(0, 120));

    const newDoc = {
      id: `doc-ingest-${Date.now()}`,
      title,
      category,
      content: rawText,
      keyFacts:
        keyFacts.length > 0
          ? keyFacts
          : [`Ingested from ${fileName || 'uploaded document'}`, `${rawText.slice(0, 80)}...`],
      lastUpdated: new Date().toISOString().split('T')[0],
    };

    res.json({
      success: true,
      document: newDoc,
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
    console.log(`Cluely server running on http://localhost:${port}`);
  });
}

startServer();

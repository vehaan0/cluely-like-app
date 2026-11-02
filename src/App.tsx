import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  KnowledgeBase,
  PresentationSlide,
  CopilotCueCard,
  TranscriptItem,
  MeetingScenario,
  ActiveTab,
  AIProviderConfig,
} from './types';
import {
  DEFAULT_KB_OMNIFLOW,
  generateLocalCueCard,
} from './utils/kb-engine';
import {
  SupportedLanguage,
  SUPPORTED_LANGUAGES,
  MEETING_SCENARIOS,
  getFastTranslation,
  identifyLanguage,
} from './utils/translation-engine';
import { Header } from './components/Header';
import { LiveMeetingHUD } from './components/LiveMeetingHUD';
import { KnowledgeBaseEditor } from './components/KnowledgeBaseEditor';
import { PresentationDeck } from './components/PresentationDeck';
import { PresentationGeneratorView } from './components/PresentationGeneratorView';
import { AIProvidersView } from './components/AIProvidersView';
import { Radio, Wand2, BookOpen, Cpu } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('hud');

  // Dynamic Knowledge Base state persisted in localStorage
  const [knowledgeBase, setKnowledgeBase] = useState<KnowledgeBase>(() => {
    const saved = localStorage.getItem('sam_kb');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {}
    }
    return DEFAULT_KB_OMNIFLOW;
  });

  const handleUpdateKnowledgeBase = (kb: KnowledgeBase) => {
    setKnowledgeBase(kb);
    localStorage.setItem('sam_kb', JSON.stringify(kb));
  };

  const [preferredLanguage, setPreferredLanguage] = useState<SupportedLanguage>(SUPPORTED_LANGUAGES[0]); // English

  // Dynamic Scenarios persisted in localStorage
  const [scenarios, setScenarios] = useState<MeetingScenario[]>(() => {
    const saved = localStorage.getItem('sam_scenarios');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {}
    }
    return MEETING_SCENARIOS;
  });

  const [currentScenario, setCurrentScenario] = useState<MeetingScenario>(() => scenarios[0] || MEETING_SCENARIOS[0]);
  const [scenarioStepIndex, setScenarioStepIndex] = useState(0);

  const [isListening, setIsListening] = useState(true);
  const [isSimulatingSpeaker, setIsSimulatingSpeaker] = useState(false);
  const [isLoadingAi, setIsLoadingAi] = useState(false);

  const [activeSlideId, setActiveSlideId] = useState<string>(
    knowledgeBase.slides[0]?.id || DEFAULT_KB_OMNIFLOW.slides[0].id
  );
  const [selectedSlideForView, setSelectedSlideForView] = useState<PresentationSlide | null>(null);

  // Theme management: default to light (Parakeet AI / Cluely clean porcelain)
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('sam_theme');
    if (saved === 'dark' || saved === 'light') return saved;
    return 'light';
  });

  useEffect(() => {
    localStorage.setItem('sam_theme', theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  // PWA install prompt handler
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [canInstall, setCanInstall] = useState(false);

  useEffect(() => {
    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setCanInstall(true);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstallPWA = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setCanInstall(false);
      setDeferredPrompt(null);
    }
  };

  // AI Provider configuration
  const [providerConfig, setProviderConfig] = useState<AIProviderConfig>(() => {
    const saved = localStorage.getItem('sam_provider_config');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {}
    }
    return {
      activeProvider: 'gemini',
      geminiModel: 'gemini-3.8-flash',
      openRouterModel: 'meta-llama/llama-3.3-70b-instruct',
      ollamaEndpoint: 'http://localhost:11434',
      ollamaModel: 'llama3.2',
      lmStudioEndpoint: 'http://localhost:1234/v1',
      lmStudioModel: 'local-model',
      temperature: 0.3,
    };
  });

  const [transcripts, setTranscripts] = useState<TranscriptItem[]>([]);
  const [currentSubtitle, setCurrentSubtitle] = useState<{
    original: string;
    translated: string;
    speaker: string;
  } | null>(null);

  const [activeCueCard, setActiveCueCard] = useState<CopilotCueCard | null>(null);
  const [isQuotaExceeded, setIsQuotaExceeded] = useState(false);

  const speechRecognitionRef = useRef<any>(null);

  // Helper to fetch assistance from backend API or fallback locally
  const requestCopilotAssistance = useCallback(
    async (
      queryText: string,
      sourceLang: string = currentScenario.nativeLanguage
    ) => {
      setIsLoadingAi(true);
      try {
        const response = await fetch('/api/copilot/assist', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            transcript: queryText,
            preferredLanguage: preferredLanguage.name,
            kbTitle: knowledgeBase.name,
            knowledgeBaseContent: knowledgeBase.documents
              .map((d) => `${d.title} (${d.category}): ${d.content}`)
              .join('\n\n'),
            presentationSlides: knowledgeBase.slides,
            providerConfig,
          }),
        });

        if (response.ok) {
          const data = await response.json();
          if (data.quotaExceeded) {
            setIsQuotaExceeded(true);
          }
          const newCueCard: CopilotCueCard = {
            id: `cue-${Date.now()}`,
            triggerTranscript: queryText,
            verbatimAnswer: data.verbatimAnswer,
            deliveryGuidance: data.deliveryGuidance || {
              tone: 'Confident, consultative, authoritative',
              pacing: 'Deliberate and unhurried',
              emphasisKeywords: [],
            },
            timingCue: data.timingCue || {
              whenToSpeak: 'Wait 1.2s until speaker concludes before responding.',
              conversationPhase: 'discovery',
              urgencyLevel: 'medium',
            },
            followUpQuestion: data.followUpQuestion || '',
            talkingPoints: data.keyTalkingPoints || [],
            relevantSlideId: data.relevantSlideId || knowledgeBase.slides[0]?.id || 'slide-1',
            relevantSlideTitle: data.relevantSlideTitle || knowledgeBase.slides[0]?.title || 'Overview',
            objectionDefuser: data.objectionDefuser || '',
            groundedQuotes: data.groundedQuotes || [],
            confidence: 98,
            timestamp: new Date().toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit',
            }),
          };
          setActiveCueCard(newCueCard);
          return newCueCard;
        }
      } catch (err) {
        console.warn('Backend API assist call failed, using dynamic local engine:', err);
      } finally {
        setIsLoadingAi(false);
      }

      // Fallback to pure local grounded engine with comprehensive sales coaching
      const localCard = generateLocalCueCard(knowledgeBase, queryText, preferredLanguage.name);
      setActiveCueCard(localCard);
      return localCard;
    },
    [knowledgeBase, preferredLanguage, currentScenario, providerConfig]
  );

  // Trigger dialogue step in scenario
  const handleScenarioStep = useCallback(
    async (stepIdx: number, scenarioToPlay: MeetingScenario) => {
      if (!scenarioToPlay.dialogueSteps || scenarioToPlay.dialogueSteps.length === 0) return;
      const step = scenarioToPlay.dialogueSteps[stepIdx % scenarioToPlay.dialogueSteps.length];
      if (!step) return;

      setIsSimulatingSpeaker(true);

      // Automatic Language Identification
      const detectedLang = identifyLanguage(step.speakerText);

      // Fast translation into preferred language
      const translated = getFastTranslation(
        step.speakerText,
        preferredLanguage.code,
        preferredLanguage.name
      );

      // Show live subtitle
      setCurrentSubtitle({
        original: step.speakerText,
        translated,
        speaker: scenarioToPlay.counterpartyName,
      });

      // Generate Copilot Cue Card
      const cueCard = await requestCopilotAssistance(step.englishTranslation, detectedLang.name);

      // Add to transcript log
      const newTranscript: TranscriptItem = {
        id: `tr-${Date.now()}`,
        speaker: scenarioToPlay.counterpartyName,
        speakerRole: scenarioToPlay.counterpartyTitle,
        originalText: step.speakerText,
        sourceLanguage: detectedLang.name,
        translatedText: translated,
        targetLanguage: preferredLanguage.name,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isUser: false,
        cueCard,
      };

      setTranscripts((prev) => [newTranscript, ...prev]);

      setTimeout(() => {
        setIsSimulatingSpeaker(false);
      }, 2500);
    },
    [preferredLanguage, requestCopilotAssistance]
  );

  // Initialize with the first scenario question on mount
  useEffect(() => {
    handleScenarioStep(0, currentScenario);
  }, []);

  const handleUpdateProviderConfig = (cfg: AIProviderConfig) => {
    setProviderConfig(cfg);
    localStorage.setItem('sam_provider_config', JSON.stringify(cfg));
  };

  const handleTriggerNextQuestion = () => {
    const nextIdx = scenarioStepIndex + 1;
    setScenarioStepIndex(nextIdx);
    handleScenarioStep(nextIdx, currentScenario);
  };

  const handleAddCustomScenario = (newSc: MeetingScenario) => {
    setScenarios((prev) => {
      const updated = [newSc, ...prev];
      localStorage.setItem('sam_scenarios', JSON.stringify(updated));
      return updated;
    });
    setCurrentScenario(newSc);
    setScenarioStepIndex(0);
    handleScenarioStep(0, newSc);
  };

  // Direct foreign speech test handler (supports arbitrary sentences in any language)
  const handleDirectForeignSpeech = useCallback(
    async (foreignText: string, speakerName: string = 'Counterparty') => {
      setIsLoadingAi(true);
      try {
        const detected = identifyLanguage(foreignText);
        const transRes = await fetch('/api/copilot/translate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            text: foreignText,
            targetLanguage: preferredLanguage.name,
            providerConfig,
          }),
        });

        let translated = foreignText;
        let detectedSource = detected.name;
        if (transRes.ok) {
          const transData = await transRes.json();
          translated = transData.translatedText || foreignText;
          detectedSource = transData.sourceLanguage || detected.name;
        } else {
          translated = getFastTranslation(foreignText, preferredLanguage.code, preferredLanguage.name);
        }

        setCurrentSubtitle({
          original: foreignText,
          translated,
          speaker: speakerName,
        });

        const cueCard = await requestCopilotAssistance(translated, detectedSource);

        const newTranscript: TranscriptItem = {
          id: `tr-${Date.now()}`,
          speaker: speakerName,
          speakerRole: 'Participant',
          originalText: foreignText,
          sourceLanguage: detectedSource,
          translatedText: translated,
          targetLanguage: preferredLanguage.name,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          isUser: false,
          cueCard,
        };

        setTranscripts((prev) => [newTranscript, ...prev]);
      } catch (err) {
        console.warn('Direct speech processing error:', err);
      } finally {
        setIsLoadingAi(false);
      }
    },
    [preferredLanguage, providerConfig, requestCopilotAssistance]
  );

  // User asks a quick query or clicks quick prompt
  const handleAskCopilot = async (query: string) => {
    const userTranscript: TranscriptItem = {
      id: `tr-${Date.now()}`,
      speaker: 'You',
      speakerRole: 'Presenter',
      originalText: query,
      sourceLanguage: preferredLanguage.name,
      translatedText: query,
      targetLanguage: preferredLanguage.name,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isUser: true,
    };

    setTranscripts((prev) => [userTranscript, ...prev]);

    // Request Copilot guidance
    await requestCopilotAssistance(query, preferredLanguage.name);
  };

  // Microphone toggle with Web Speech Recognition
  const handleToggleListening = () => {
    if (isListening) {
      if (speechRecognitionRef.current) {
        try {
          speechRecognitionRef.current.stop();
        } catch {}
      }
      setIsListening(false);
      return;
    }

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setIsListening(true);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = false;
      recognition.lang = preferredLanguage.code === 'en' ? 'en-US' : `${preferredLanguage.code}`;

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        const lastResult = event.results[event.results.length - 1];
        if (lastResult.isFinal) {
          const spokenText = lastResult[0].transcript.trim();
          if (spokenText) {
            handleAskCopilot(spokenText);
          }
        }
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition notice:', event.error);
      };

      recognition.onend = () => {
        // Can re-arm if user keeps listening active
      };

      speechRecognitionRef.current = recognition;
      recognition.start();
      setIsListening(true);
    } catch (err) {
      console.warn('Speech recognition initialization notice:', err);
      setIsListening(true);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-[#07080c] text-slate-900 dark:text-slate-100 flex flex-col font-sans relative selection:bg-amber-500/20 selection:text-amber-800 dark:selection:text-amber-200 transition-colors duration-200">
      {/* Ambient background glows for Parakeet AI & Cluely light glassmorphism */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden z-0" aria-hidden="true">
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[800px] h-[380px] bg-gradient-to-b from-amber-400/15 dark:from-amber-500/10 to-transparent blur-[120px] rounded-full" />
        <div className="absolute top-1/4 -left-40 w-[600px] h-[600px] bg-indigo-500/[0.06] dark:bg-indigo-600/[0.07] blur-[150px] rounded-full" />
        <div className="absolute -bottom-20 right-0 w-[550px] h-[550px] bg-amber-500/[0.05] blur-[140px] rounded-full" />
        {/* Subtle grid mesh overlay */}
        <div className="absolute inset-0 bg-[radial-gradient(#0000000a_1px,transparent_1px)] dark:bg-[radial-gradient(#ffffff08_1px,transparent_1px)] [background-size:24px_24px] opacity-40" />
      </div>

      <div className="relative z-10 flex flex-col min-h-screen">
        {/* SAM Top Bar Navigation */}
        <Header
          activeTab={activeTab}
          onTabChange={setActiveTab}
          preferredLanguage={preferredLanguage}
          onLanguageChange={(newLang) => {
            setPreferredLanguage(newLang);
            if (currentSubtitle) {
              const retranslated = getFastTranslation(
                currentSubtitle.original,
                newLang.code,
                newLang.name
              );
              setCurrentSubtitle((prev) =>
                prev ? { ...prev, translated: retranslated } : null
              );
            }
          }}
          isListening={isListening}
          onToggleListening={handleToggleListening}
          providerConfig={providerConfig}
          theme={theme}
          onToggleTheme={() => setTheme((t) => (t === 'light' ? 'dark' : 'light'))}
          canInstall={canInstall}
          onInstall={handleInstallPWA}
        />

        {/* Main SAM Workspace */}
        <main className="flex-1 flex flex-col">
          {/* Tab 1: Live Audio Translation & Pitch Teleprompter HUD */}
          {activeTab === 'hud' && (
            <LiveMeetingHUD
              cueCard={activeCueCard}
              transcripts={transcripts}
              preferredLanguage={preferredLanguage}
              onLanguageChange={setPreferredLanguage}
              slides={knowledgeBase.slides}
              activeSlideId={activeSlideId}
              onSelectSlide={(slideId) => {
                setActiveSlideId(slideId);
                const found = knowledgeBase.slides.find((s) => s.id === slideId);
                if (found) setSelectedSlideForView(found);
              }}
              isListening={isListening}
              onToggleListening={handleToggleListening}
              onAskCopilot={handleAskCopilot}
              onClearTranscripts={() => setTranscripts([])}
              currentSubtitle={currentSubtitle}
              scenario={currentScenario}
              scenarios={scenarios}
              onSelectScenario={(sc) => {
                setCurrentScenario(sc);
                setScenarioStepIndex(0);
                handleScenarioStep(0, sc);
              }}
              onTriggerScenarioStep={handleTriggerNextQuestion}
              onAddCustomScenario={handleAddCustomScenario}
              onDirectForeignSpeech={handleDirectForeignSpeech}
              isSimulatingSpeaker={isSimulatingSpeaker}
              providerConfig={providerConfig}
              isLoadingAi={isLoadingAi}
              isQuotaExceeded={isQuotaExceeded}
              onSwitchToProviders={() => setActiveTab('providers')}
              knowledgeBase={knowledgeBase}
            />
          )}

          {/* Tab 2: Presentation Generator Module */}
          {activeTab === 'generator' && (
            <PresentationGeneratorView
              knowledgeBase={knowledgeBase}
              onApplyGeneratedSlides={(newSlides) => {
                handleUpdateKnowledgeBase({ ...knowledgeBase, slides: newSlides });
                setActiveSlideId(newSlides[0]?.id || '');
              }}
              onLaunchMeetingWithDeck={(newSlides) => {
                handleUpdateKnowledgeBase({ ...knowledgeBase, slides: newSlides });
                setActiveSlideId(newSlides[0]?.id || '');
                setActiveTab('hud');
              }}
            />
          )}

          {/* Tab 3: Knowledge Base Feed & Ingestion System */}
          {activeTab === 'kb' && (
            <KnowledgeBaseEditor
              knowledgeBase={knowledgeBase}
              onUpdateKnowledgeBase={handleUpdateKnowledgeBase}
              slides={knowledgeBase.slides}
            />
          )}

          {/* Tab 4: AI Providers & Local LLMs Hub */}
          {activeTab === 'providers' && (
            <AIProvidersView
              config={providerConfig}
              onUpdateConfig={handleUpdateProviderConfig}
            />
          )}

          {/* Slide Viewer Dialog (when user clicks "View Slide" from HUD) */}
          {selectedSlideForView && (
            <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
              <div className="max-w-4xl w-full max-h-[85vh] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden shadow-2xl flex flex-col">
                <div className="flex items-center justify-between px-5 py-3 bg-slate-100 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 text-xs">
                  <span className="font-bold text-slate-900 dark:text-white">Recommended Pitch Slide Preview</span>
                  <button
                    onClick={() => setSelectedSlideForView(null)}
                    className="px-3 py-1 bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded text-xs font-semibold cursor-pointer"
                  >
                    Close
                  </button>
                </div>
                <div className="p-4 flex-1 overflow-y-auto">
                  <PresentationDeck
                    slides={knowledgeBase.slides}
                    activeSlideId={selectedSlideForView.id}
                    onSelectSlide={(slideId) => {
                      const found = knowledgeBase.slides.find((s) => s.id === slideId);
                      if (found) setSelectedSlideForView(found);
                    }}
                  />
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

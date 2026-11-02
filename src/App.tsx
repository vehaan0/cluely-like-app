import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  KnowledgeBase,
  PresentationSlide,
  CopilotCueCard,
  TranscriptItem,
  MeetingScenario,
  ActiveTab,
  HudMode,
  MeetingPlatform,
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
import { MeetSimulator } from './components/MeetSimulator';
import { CluelyHud } from './components/CluelyHud';
import { KnowledgeBaseEditor } from './components/KnowledgeBaseEditor';
import { PresentationDeck } from './components/PresentationDeck';
import { PresentationGeneratorView } from './components/PresentationGeneratorView';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('meet');
  const [activePlatform, setActivePlatform] = useState<MeetingPlatform>('google-meet');
  const [knowledgeBase, setKnowledgeBase] = useState<KnowledgeBase>(DEFAULT_KB_OMNIFLOW);
  const [preferredLanguage, setPreferredLanguage] = useState<SupportedLanguage>(SUPPORTED_LANGUAGES[0]); // English
  const [currentScenario, setCurrentScenario] = useState<MeetingScenario>(MEETING_SCENARIOS[0]); // Tokyo
  const [scenarioStepIndex, setScenarioStepIndex] = useState(0);

  const [isCallActive, setIsCallActive] = useState(true);
  const [isMicActive, setIsMicActive] = useState(false);
  const [isSharingScreen, setIsSharingScreen] = useState(false);
  const [isSimulatingSpeaker, setIsSimulatingSpeaker] = useState(false);
  const [isLoadingAi, setIsLoadingAi] = useState(false);

  const [hudMode, setHudMode] = useState<HudMode>('docked-right');
  const [activeSlideId, setActiveSlideId] = useState<string>(DEFAULT_KB_OMNIFLOW.slides[0].id);

  const [transcripts, setTranscripts] = useState<TranscriptItem[]>([]);
  const [currentSubtitle, setCurrentSubtitle] = useState<{
    original: string;
    translated: string;
    speaker: string;
  } | null>(null);

  const [activeCueCard, setActiveCueCard] = useState<CopilotCueCard | null>(null);

  const speechRecognitionRef = useRef<any>(null);

  // Initialize with the first scenario question on mount
  useEffect(() => {
    handleScenarioStep(0, currentScenario);
  }, []);

  // When scenario changes, reset and trigger first question
  const handleSelectScenario = (newScenario: MeetingScenario) => {
    setCurrentScenario(newScenario);
    setScenarioStepIndex(0);
    handleScenarioStep(0, newScenario);
  };

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
          }),
        });

        if (response.ok) {
          const data = await response.json();
          const newCueCard: CopilotCueCard = {
            id: `cue-${Date.now()}`,
            triggerTranscript: queryText,
            verbatimAnswer: data.verbatimAnswer,
            talkingPoints: data.keyTalkingPoints || [],
            relevantSlideId: data.relevantSlideId || knowledgeBase.slides[0].id,
            relevantSlideTitle: data.relevantSlideTitle || knowledgeBase.slides[0].title,
            objectionDefuser: data.objectionDefuser || '',
            groundedQuotes: data.groundedQuotes || [],
            confidence: 96,
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
        console.warn('Backend API assist call failed, using high-speed local engine:', err);
      } finally {
        setIsLoadingAi(false);
      }

      // Fallback to pure local grounded engine
      const localCard = generateLocalCueCard(knowledgeBase, queryText, preferredLanguage.name);
      setActiveCueCard(localCard);
      return localCard;
    },
    [knowledgeBase, preferredLanguage, currentScenario]
  );

  // Trigger dialogue step in scenario
  const handleScenarioStep = useCallback(
    async (stepIdx: number, scenario: MeetingScenario) => {
      const step = scenario.dialogueSteps[stepIdx % scenario.dialogueSteps.length];
      if (!step) return;

      setIsSimulatingSpeaker(true);

      // Automatic Language Identification
      const detectedLang = identifyLanguage(step.speakerText);

      // Fast translation
      const translated = getFastTranslation(
        step.speakerText,
        preferredLanguage.code,
        preferredLanguage.name
      );

      // Show live subtitle
      setCurrentSubtitle({
        original: step.speakerText,
        translated,
        speaker: scenario.counterpartyName,
      });

      // Generate Copilot Cue Card
      const cueCard = await requestCopilotAssistance(step.englishTranslation, detectedLang.name);

      // Add to transcript log
      const newTranscript: TranscriptItem = {
        id: `tr-${Date.now()}`,
        speaker: scenario.counterpartyName,
        speakerRole: scenario.counterpartyTitle,
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

  const handleTriggerNextQuestion = () => {
    const nextIdx = scenarioStepIndex + 1;
    setScenarioStepIndex(nextIdx);
    handleScenarioStep(nextIdx, currentScenario);
  };

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
    await requestCopilotAssistance(query);
  };

  // Web Speech API for real microphone capture
  const handleToggleMic = () => {
    if (isMicActive) {
      if (speechRecognitionRef.current) {
        speechRecognitionRef.current.stop();
      }
      setIsMicActive(false);
      return;
    }

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert('Speech Recognition is not supported in this browser. You can still use the quick query bar or scenario runner.');
      setIsMicActive(true);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = false;
      recognition.lang = preferredLanguage.code === 'en' ? 'en-US' : `${preferredLanguage.code}`;

      recognition.onstart = () => {
        setIsMicActive(true);
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
        console.warn('Speech recognition error:', event.error);
        setIsMicActive(false);
      };

      recognition.onend = () => {
        setIsMicActive(false);
      };

      speechRecognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      console.warn('Speech recognition initialization failed:', err);
      setIsMicActive(false);
    }
  };

  // Handle deck generated and user wanting to present it on the call
  const handleLaunchMeetingWithDeck = (newSlides: PresentationSlide[]) => {
    setKnowledgeBase((prev) => ({ ...prev, slides: newSlides }));
    setActiveSlideId(newSlides[0]?.id || '');
    setIsSharingScreen(true);
    setActiveTab('meet');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Top Bar Navigation */}
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
        isCallActive={isCallActive}
        onToggleCall={() => setIsCallActive((prev) => !prev)}
        activePlatform={activePlatform}
        onChangePlatform={setActivePlatform}
      />

      {/* Main Viewport */}
      <main className="flex-1 flex flex-col">
        {/* Tab 1: Live Call Copilot (Google Meet, Teams, Zoom) */}
        {activeTab === 'meet' && (
          <div className="flex-1 p-4 lg:p-6 max-w-[1600px] w-full mx-auto flex flex-col gap-4">
            {/* Top Teleprompter Mode (when chosen) */}
            {hudMode === 'top-teleprompter' && (
              <div className="w-full">
                <CluelyHud
                  cueCard={activeCueCard}
                  transcripts={transcripts}
                  preferredLanguage={preferredLanguage}
                  slides={knowledgeBase.slides}
                  onSelectSlide={(slideId) => {
                    setActiveSlideId(slideId);
                    setIsSharingScreen(true);
                  }}
                  onAskCopilot={handleAskCopilot}
                  hudMode={hudMode}
                  onChangeHudMode={setHudMode}
                  isLoadingAi={isLoadingAi}
                />
              </div>
            )}

            {/* Split Screen Grid: Call Simulator on Left / Center, Cluely HUD on Right */}
            <div
              className={`grid gap-4 items-stretch ${
                hudMode === 'top-teleprompter'
                  ? 'grid-cols-1'
                  : 'grid-cols-1 lg:grid-cols-12'
              }`}
            >
              {/* Call Simulator (Google Meet / Microsoft Teams / Zoom) */}
              <div
                className={`${
                  hudMode === 'top-teleprompter'
                    ? 'w-full'
                    : 'lg:col-span-7 xl:col-span-8'
                } flex flex-col min-h-[580px]`}
              >
                <MeetSimulator
                  scenario={currentScenario}
                  onSelectScenario={handleSelectScenario}
                  isCallActive={isCallActive}
                  onToggleCall={() => setIsCallActive((prev) => !prev)}
                  transcripts={transcripts}
                  currentSubtitle={currentSubtitle}
                  preferredLanguage={preferredLanguage}
                  slides={knowledgeBase.slides}
                  activeSlideId={activeSlideId}
                  onSelectSlide={setActiveSlideId}
                  isMicActive={isMicActive}
                  onToggleMic={handleToggleMic}
                  isSharingScreen={isSharingScreen}
                  onToggleScreenShare={() => setIsSharingScreen((prev) => !prev)}
                  hudMode={hudMode}
                  onTriggerScenarioStep={handleTriggerNextQuestion}
                  isSimulatingSpeaker={isSimulatingSpeaker}
                  activePlatform={activePlatform}
                  onChangePlatform={setActivePlatform}
                />
              </div>

              {/* Cluely HUD Docked Right */}
              {hudMode !== 'top-teleprompter' && (
                <div className="lg:col-span-5 xl:col-span-4 flex flex-col min-h-[580px]">
                  <CluelyHud
                    cueCard={activeCueCard}
                    transcripts={transcripts}
                    preferredLanguage={preferredLanguage}
                    slides={knowledgeBase.slides}
                    onSelectSlide={(slideId) => {
                      setActiveSlideId(slideId);
                      setIsSharingScreen(true);
                    }}
                    onAskCopilot={handleAskCopilot}
                    hudMode={hudMode}
                    onChangeHudMode={setHudMode}
                    isLoadingAi={isLoadingAi}
                  />
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 2: Presentation Generator Module */}
        {activeTab === 'generator' && (
          <PresentationGeneratorView
            knowledgeBase={knowledgeBase}
            onApplyGeneratedSlides={(newSlides) => {
              setKnowledgeBase((prev) => ({ ...prev, slides: newSlides }));
              setActiveSlideId(newSlides[0]?.id || '');
            }}
            onLaunchMeetingWithDeck={handleLaunchMeetingWithDeck}
          />
        )}

        {/* Tab 3: Knowledge Base Feed & Ingestion System */}
        {activeTab === 'kb' && (
          <KnowledgeBaseEditor
            knowledgeBase={knowledgeBase}
            onUpdateKnowledgeBase={setKnowledgeBase}
            slides={knowledgeBase.slides}
          />
        )}

        {/* Tab 4: Full Slide Deck Presenter */}
        {activeTab === 'deck' && (
          <div className="max-w-6xl mx-auto w-full p-6 flex-1 flex flex-col">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h1 className="text-xl font-bold text-white">Full Slide Deck Presenter</h1>
                <p className="text-xs text-slate-400">
                  Grounded with {knowledgeBase.name} documentation · Synced live with Meet Copilot
                </p>
              </div>
              <button
                onClick={() => {
                  setIsSharingScreen(true);
                  setActiveTab('meet');
                }}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold text-xs rounded-lg transition-colors shadow-sm"
              >
                Present Deck to Call
              </button>
            </div>
            <div className="flex-1 min-h-[560px]">
              <PresentationDeck
                slides={knowledgeBase.slides}
                activeSlideId={activeSlideId}
                onSelectSlide={setActiveSlideId}
                isSharingScreen={isSharingScreen}
                onToggleScreenShare={() => setIsSharingScreen((prev) => !prev)}
              />
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

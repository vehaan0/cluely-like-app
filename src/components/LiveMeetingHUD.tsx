import React, { useState } from 'react';
import {
  CopilotCueCard,
  TranscriptItem,
  PresentationSlide,
  HudMode,
  MeetingScenario,
  AIProviderConfig,
} from '../types';
import {
  SupportedLanguage,
  MEETING_SCENARIOS,
  identifyLanguage,
} from '../utils/translation-engine';
import {
  Mic,
  MicOff,
  Sparkles,
  Volume2,
  Copy,
  Check,
  Globe,
  Shield,
  Lightbulb,
  CornerDownLeft,
  Layout,
  Presentation,
  Trash2,
  Clock,
  Target,
  Zap,
  ArrowRight,
  HelpCircle,
  MessageSquare,
  Activity,
  Layers,
} from 'lucide-react';

interface LiveMeetingHUDProps {
  cueCard: CopilotCueCard | null;
  transcripts: TranscriptItem[];
  preferredLanguage: SupportedLanguage;
  onLanguageChange: (lang: SupportedLanguage) => void;
  slides: PresentationSlide[];
  activeSlideId: string;
  onSelectSlide: (slideId: string) => void;
  isListening: boolean;
  onToggleListening: () => void;
  onAskCopilot: (query: string) => void;
  onClearTranscripts: () => void;
  currentSubtitle: { original: string; translated: string; speaker: string } | null;
  scenario: MeetingScenario;
  onSelectScenario: (sc: MeetingScenario) => void;
  onTriggerScenarioStep: () => void;
  isSimulatingSpeaker: boolean;
  providerConfig: AIProviderConfig;
  isLoadingAi: boolean;
  isQuotaExceeded?: boolean;
  onSwitchToProviders?: () => void;
}

export const LiveMeetingHUD: React.FC<LiveMeetingHUDProps> = ({
  cueCard,
  transcripts,
  preferredLanguage,
  slides,
  activeSlideId,
  onSelectSlide,
  isListening,
  onToggleListening,
  onAskCopilot,
  onClearTranscripts,
  currentSubtitle,
  scenario,
  onSelectScenario,
  onTriggerScenarioStep,
  isSimulatingSpeaker,
  isLoadingAi,
  isQuotaExceeded = false,
  onSwitchToProviders,
}) => {
  const [hudMode, setHudMode] = useState<HudMode>('docked-full');
  const [mobileTab, setMobileTab] = useState<'stream' | 'cuecard'>('cuecard');
  const [copiedVerbatim, setCopiedVerbatim] = useState(false);
  const [copiedQuestion, setCopiedQuestion] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [manualQuery, setManualQuery] = useState('');

  const detectedSpeakerLang = currentSubtitle
    ? identifyLanguage(currentSubtitle.original)
    : { code: scenario.nativeLanguageCode, name: scenario.nativeLanguage, confidence: 98 };

  const handleCopyVerbatim = () => {
    if (!cueCard?.verbatimAnswer) return;
    navigator.clipboard.writeText(cueCard.verbatimAnswer);
    setCopiedVerbatim(true);
    setTimeout(() => setCopiedVerbatim(false), 2000);
  };

  const handleCopyQuestion = () => {
    if (!cueCard?.followUpQuestion) return;
    navigator.clipboard.writeText(cueCard.followUpQuestion);
    setCopiedQuestion(true);
    setTimeout(() => setCopiedQuestion(false), 2000);
  };

  const handleSpeakText = (text: string) => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = preferredLanguage.code;
    utterance.rate = 1.02;
    utterance.onstart = () => setIsPlayingAudio(true);
    utterance.onend = () => setIsPlayingAudio(false);
    utterance.onerror = () => setIsPlayingAudio(false);
    window.speechSynthesis.speak(utterance);
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualQuery.trim()) return;
    onAskCopilot(manualQuery.trim());
    setManualQuery('');
  };

  const quickPrompts = [
    'How do we handle GDPR & EU data?',
    'What is our uptime SLA guarantee?',
    'Compare our pricing vs Workato',
    'Explain our 30-day POC credit',
  ];

  return (
    <div className="flex-1 p-3 sm:p-4 lg:p-6 max-w-[1600px] w-full mx-auto flex flex-col gap-4 sm:gap-5 pb-24 md:pb-8">
      {/* Active Quota Notification / Offline Fast Engine Notice */}
      {isQuotaExceeded && (
        <div className="glass-panel border-amber-500/30 rounded-2xl px-4 py-3 flex flex-wrap items-center justify-between gap-3 text-xs shadow-[0_4px_20px_rgba(245,158,11,0.12)]">
          <div className="flex items-center gap-2.5 text-amber-600 dark:text-amber-300">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse shadow-[0_0_10px_#f59e0b]" />
            <span className="font-bold tracking-wide uppercase text-[11px]">SAM Offline Grounded Engine:</span>
            <span className="text-slate-600 dark:text-slate-300">
              Cloud AI quota reached (429). SAM is seamlessly synthesizing grounded answers and translations with sub-10ms latency.
            </span>
          </div>
          {onSwitchToProviders && (
            <button
              onClick={onSwitchToProviders}
              className="px-3 py-1.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold rounded-lg transition-all text-xs shadow-sm shrink-0 cursor-pointer"
            >
              Switch AI Brain / Connect Ollama
            </button>
          )}
        </div>
      )}

      {/* Top Teleprompter Mode (when chosen) */}
      {hudMode === 'teleprompter-notch' && (
        <div className="w-full max-w-4xl mx-auto glass-panel-amber rounded-2xl p-5 sm:p-6 shadow-2xl space-y-4 animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="flex items-center justify-between pb-3 border-b border-amber-500/20 text-xs">
            <div className="flex items-center gap-2.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse shadow-[0_0_8px_#f59e0b]" />
              <span className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-xs">
                SAM Eye-Level Notch (Look directly into webcam while reading)
              </span>
            </div>
            <button
              onClick={() => setHudMode('docked-full')}
              className="text-xs text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white px-3 py-1 rounded-lg bg-black/5 dark:bg-white/[0.05] hover:bg-black/10 dark:hover:bg-white/[0.1] transition-colors cursor-pointer"
            >
              Dock Back to Standard View
            </button>
          </div>

          {cueCard ? (
            <div className="space-y-3">
              <div className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white leading-relaxed tracking-tight">
                "{cueCard.verbatimAnswer}"
              </div>
              <div className="flex items-center gap-4 text-xs text-slate-600 dark:text-slate-300 pt-1">
                <button
                  onClick={handleCopyVerbatim}
                  className="px-3 py-1.5 rounded-lg bg-black/5 dark:bg-white/[0.08] hover:bg-black/10 dark:hover:bg-white/[0.15] text-slate-800 dark:text-slate-100 flex items-center gap-1.5 border border-slate-200 dark:border-white/10 transition-colors cursor-pointer"
                >
                  {copiedVerbatim ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5 text-amber-500" />}
                  <span>{copiedVerbatim ? 'Copied' : 'Copy'}</span>
                </button>
                <span>·</span>
                <span className="text-amber-600 dark:text-amber-400 font-semibold">Recommended Slide: {cueCard.relevantSlideTitle}</span>
              </div>
            </div>
          ) : (
            <p className="text-xs text-slate-500 italic">Listening for meeting speech...</p>
          )}
        </div>
      )}

      {/* Interactive Simulation & Audio Control Bar */}
      <div className="glass-panel rounded-2xl p-4 lg:p-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Audio status & Soundwaves */}
          <div className="flex items-center gap-3 sm:gap-4">
            <button
              onClick={onToggleListening}
              className={`w-12 h-12 rounded-2xl transition-all shadow-md flex items-center justify-center shrink-0 border cursor-pointer ${
                isListening
                  ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/25 shadow-[0_0_20px_rgba(16,185,129,0.25)] ring-4 ring-emerald-500/10'
                  : 'bg-rose-500/15 border-rose-500/40 text-rose-600 dark:text-rose-400 hover:bg-rose-500/25'
              }`}
              title={isListening ? 'Pause listening' : 'Start audio capture'}
            >
              {isListening ? <Mic className="w-5 h-5 animate-pulse" /> : <MicOff className="w-5 h-5" />}
            </button>

            <div>
              <div className="flex items-center gap-2.5">
                <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                  {isListening ? 'Real-Time Audio Stream Active' : 'Microphone Stream Paused'}
                </h2>
                {isListening && (
                  <div className="flex items-center gap-1 h-5 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30">
                    <span className="w-1 bg-emerald-500 dark:bg-emerald-400 rounded-full animate-wave-1" />
                    <span className="w-1 bg-emerald-500 dark:bg-emerald-400 rounded-full animate-wave-2" />
                    <span className="w-1 bg-emerald-500 dark:bg-emerald-400 rounded-full animate-wave-3" />
                    <span className="w-1 bg-emerald-500 dark:bg-emerald-400 rounded-full animate-wave-4" />
                    <span className="w-1 bg-emerald-500 dark:bg-emerald-400 rounded-full animate-wave-2" />
                    <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 ml-1 font-bold">LIVE</span>
                  </div>
                )}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {isListening
                  ? 'Transcribing counterparty speech into ' + preferredLanguage.name
                  : 'Click microphone to begin listening to your meeting or microphone'}
              </p>
            </div>
          </div>

          {/* Interactive Simulation Controls */}
          <div className="flex flex-wrap items-center gap-2.5 pt-2 lg:pt-0 border-t lg:border-t-0 border-slate-200/80 dark:border-white/[0.06]">
            {/* Persona Segmented Buttons */}
            <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-black/40 border border-slate-200 dark:border-white/[0.08] rounded-xl overflow-x-auto max-w-full">
              {MEETING_SCENARIOS.map((sc) => {
                const isSelected = sc.id === scenario.id;
                return (
                  <button
                    key={sc.id}
                    onClick={() => onSelectScenario(sc)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
                      isSelected
                        ? 'bg-amber-500/20 text-slate-900 dark:text-white border border-amber-500/40 shadow-sm font-semibold'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-white/60 dark:hover:bg-white/[0.04]'
                    }`}
                  >
                    <span>{sc.counterpartyName.split(' ')[0]}</span>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">({sc.nativeLanguage.slice(0, 2).toUpperCase()})</span>
                  </button>
                );
              })}
            </div>

            {/* Simulate Next Question Trigger */}
            <button
              onClick={onTriggerScenarioStep}
              disabled={isSimulatingSpeaker}
              className="px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 text-xs font-bold rounded-xl transition-all shadow-[0_2px_12px_rgba(245,158,11,0.25)] flex items-center gap-2 disabled:opacity-50 cursor-pointer shrink-0"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Simulate Counterparty ({scenario.nativeLanguage})</span>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile-Only Segmented View Switcher (<1024px) */}
      <div className="lg:hidden flex items-center p-1 bg-slate-100 dark:bg-white/[0.05] border border-slate-200 dark:border-white/10 rounded-xl">
        <button
          onClick={() => setMobileTab('cuecard')}
          className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-2 ${
            mobileTab === 'cuecard'
              ? 'bg-white dark:bg-amber-500/20 text-slate-900 dark:text-white shadow-sm border border-slate-200 dark:border-amber-500/30'
              : 'text-slate-600 dark:text-slate-400'
          }`}
        >
          <Target className="w-3.5 h-3.5 text-amber-500" />
          <span>What / How / When to Speak</span>
        </button>
        <button
          onClick={() => setMobileTab('stream')}
          className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-2 ${
            mobileTab === 'stream'
              ? 'bg-white dark:bg-amber-500/20 text-slate-900 dark:text-white shadow-sm border border-slate-200 dark:border-amber-500/30'
              : 'text-slate-600 dark:text-slate-400'
          }`}
        >
          <MessageSquare className="w-3.5 h-3.5 text-indigo-500" />
          <span>Live Translation Stream ({transcripts.length})</span>
        </button>
      </div>

      {/* Main 2-Column Responsive Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Column 1: Live Audio Translation Stream */}
        <div className={`lg:col-span-6 flex flex-col gap-4 ${mobileTab === 'stream' ? 'block' : 'hidden lg:flex'}`}>
          {/* Active Live Speaking Banner */}
          {currentSubtitle && (
            <div className="glass-panel-amber rounded-2xl p-4 shadow-lg border border-amber-500/30 animate-in fade-in zoom-in-95 duration-200">
              <div className="flex items-center justify-between text-xs mb-2.5 pb-2 border-b border-amber-500/20">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-amber-700 dark:text-amber-300 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
                    {currentSubtitle.speaker} is speaking:
                  </span>
                  <span className="bg-slate-100 dark:bg-white/[0.08] text-slate-700 dark:text-slate-300 rounded-md px-2 py-0.5 text-[10px] font-mono flex items-center gap-1 border border-slate-200 dark:border-white/10">
                    <Globe className="w-3 h-3 text-amber-500" />
                    <span>{detectedSpeakerLang.name} ({detectedSpeakerLang.confidence}%)</span>
                  </span>
                </div>
                <span className="text-[11px] text-slate-500 dark:text-slate-400 font-mono font-medium">
                  → {preferredLanguage.name}
                </span>
              </div>

              {/* Source Speech */}
              <div className="text-xs text-slate-500 dark:text-slate-400 italic mb-2 font-serif">
                "{currentSubtitle.original}"
              </div>

              {/* Target Translation */}
              <div className="text-sm md:text-base font-semibold text-slate-900 dark:text-white leading-snug tracking-tight">
                "{currentSubtitle.translated}"
              </div>
            </div>
          )}

          {/* Real-time Subtitles Feed */}
          <div className="glass-panel rounded-2xl p-4 sm:p-5 flex flex-col flex-1 min-h-[460px] max-h-[580px]">
            <div className="flex items-center justify-between pb-3.5 border-b border-slate-200/80 dark:border-white/[0.08] text-xs">
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-900 dark:text-white text-sm">Live Bilingual Stream</span>
                <span className="text-slate-500 dark:text-slate-400 text-xs font-mono">({transcripts.length})</span>
              </div>

              {transcripts.length > 0 && (
                <button
                  onClick={onClearTranscripts}
                  className="text-slate-500 hover:text-rose-500 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-white/[0.04] transition-colors cursor-pointer"
                  title="Clear transcript history"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <div className="flex-1 overflow-y-auto space-y-3 py-3 pr-1">
              {transcripts.map((item) => (
                <div
                  key={item.id}
                  className={`p-3.5 rounded-xl border text-xs leading-relaxed transition-all ${
                    item.isUser
                      ? 'bg-slate-50 dark:bg-white/[0.04] border-slate-200 dark:border-white/10 ml-6 sm:ml-8'
                      : 'bg-white/80 dark:bg-black/30 border-slate-200/90 dark:border-white/[0.06] hover:border-amber-400/40'
                  }`}
                >
                  <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 mb-1.5">
                    <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                      <span>{item.speaker}</span>
                      <span className="text-slate-500 dark:text-slate-400 font-normal">· {item.speakerRole}</span>
                    </span>
                    <span className="font-mono text-[10px] text-slate-500 tabular-nums">{item.timestamp}</span>
                  </div>

                  <div className="text-slate-500 dark:text-slate-400 text-xs italic mb-2 pl-3 border-l-2 border-slate-200 dark:border-white/10">
                    "{item.originalText}"
                  </div>

                  <div className="text-slate-800 dark:text-amber-200/90 font-medium text-xs pt-2 border-t border-slate-200/70 dark:border-white/[0.06] flex items-start gap-1.5">
                    <span className="text-[10px] text-amber-600 dark:text-amber-400 font-mono uppercase font-bold shrink-0 mt-0.5">
                      [{item.targetLanguage}]:
                    </span>
                    <span className="leading-snug">{item.translatedText}</span>
                  </div>
                </div>
              ))}

              {transcripts.length === 0 && (
                <div className="py-20 text-center text-slate-500 dark:text-slate-400 text-xs space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.08] flex items-center justify-center mx-auto text-slate-400">
                    <Volume2 className="w-6 h-6" />
                  </div>
                  <p className="font-medium text-slate-700 dark:text-slate-300">No meeting speech recorded yet.</p>
                  <p className="text-[11px] text-slate-500 max-w-sm mx-auto">
                    Speak into your microphone or click "Simulate Counterparty" above to see live foreign language transcription & translation.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Column 2: Grounded Real-Time Sales Guidance (WHAT, HOW, and WHEN to speak) */}
        <div className={`lg:col-span-6 flex flex-col gap-4 ${mobileTab === 'cuecard' ? 'block' : 'hidden lg:flex'}`}>
          <div className="glass-panel rounded-2xl p-4 sm:p-5 shadow-2xl flex flex-col min-h-[640px]">
            {/* Cue Card Top Toolbar */}
            <div className="flex items-center justify-between pb-3.5 border-b border-slate-200/80 dark:border-white/[0.08] text-xs">
              <div className="flex items-center gap-2.5">
                <span className="w-7 h-7 rounded-lg bg-gradient-to-br from-amber-400 to-amber-600 text-slate-950 font-black flex items-center justify-center text-xs shadow-sm">
                  S
                </span>
                <div>
                  <div className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-2">
                    <span>Sales Execution Copilot</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full font-mono font-bold bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30">
                      Grounded
                    </span>
                  </div>
                </div>
              </div>

              {/* Notch view toggle */}
              <button
                onClick={() => setHudMode(hudMode === 'teleprompter-notch' ? 'docked-full' : 'teleprompter-notch')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer border ${
                  hudMode === 'teleprompter-notch'
                    ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md font-bold'
                    : 'bg-slate-100 dark:bg-white/[0.04] hover:bg-slate-200 dark:hover:bg-white/[0.08] text-slate-700 dark:text-slate-300 border-slate-200 dark:border-white/[0.08]'
                }`}
                title="Toggle Eye-Level Teleprompter Notch"
              >
                <Layout className="w-3.5 h-3.5" />
                <span>Teleprompter Mode</span>
              </button>
            </div>

            {/* Active Cue Card Content */}
            <div className="flex-1 overflow-y-auto py-4 space-y-4">
              {cueCard ? (
                <>
                  {/* Trigger question header */}
                  <div className="bg-slate-50 dark:bg-black/30 border border-slate-200 dark:border-white/[0.06] rounded-xl p-3.5">
                    <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 mb-1">
                      <span className="font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider text-[10px]">
                        Client Inquiry / Raised Objection
                      </span>
                      <span className="font-mono text-slate-500 tabular-nums">{cueCard.timestamp}</span>
                    </div>
                    <p className="text-xs text-slate-800 dark:text-slate-200 font-medium italic">
                      "{cueCard.triggerTranscript}"
                    </p>
                  </div>

                  {/* SECTION 1: WHEN TO SPEAK (Turn-taking guidance) */}
                  {cueCard.timingCue && (
                    <div className="p-3.5 rounded-xl border border-sky-500/30 bg-sky-500/[0.06] flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-sky-500/15 border border-sky-500/30 flex items-center justify-center text-sky-600 dark:text-sky-400 shrink-0 mt-0.5">
                        <Clock className="w-4 h-4" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-sky-700 dark:text-sky-300 flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-sky-500 animate-pulse" />
                            WHEN TO SPEAK (Turn-Taking)
                          </span>
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-sky-500/15 text-sky-700 dark:text-sky-300 font-mono">
                            {cueCard.timingCue.conversationPhase}
                          </span>
                        </div>
                        <p className="text-xs text-slate-800 dark:text-slate-200 font-medium leading-relaxed">
                          {cueCard.timingCue.whenToSpeak}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* SECTION 2: WHAT TO SPEAK (Verbatim Response) */}
                  <div className="glass-panel-amber rounded-2xl p-5 shadow-lg relative">
                    <div className="flex items-center justify-between pb-3 border-b border-amber-500/20 mb-3">
                      <div className="flex items-center gap-2 text-xs font-bold text-amber-700 dark:text-amber-300 uppercase tracking-wider">
                        <Target className="w-4 h-4 text-amber-500" />
                        <span>WHAT TO SPEAK (Say Out Loud)</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={handleCopyVerbatim}
                          className="px-3 py-1.5 rounded-lg bg-white/80 dark:bg-black/40 hover:bg-white dark:hover:bg-black/60 text-slate-800 dark:text-slate-200 text-xs font-semibold flex items-center gap-1.5 border border-slate-200 dark:border-white/10 transition-colors cursor-pointer shadow-sm"
                        >
                          {copiedVerbatim ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-emerald-500" />
                              <span className="text-emerald-600 dark:text-emerald-400 font-bold">Copied</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5 text-amber-500" />
                              <span>Copy Pitch</span>
                            </>
                          )}
                        </button>

                        <button
                          onClick={() => handleSpeakText(cueCard.verbatimAnswer)}
                          disabled={isPlayingAudio}
                          className="px-3 py-1.5 rounded-lg bg-white/80 dark:bg-black/40 hover:bg-white dark:hover:bg-black/60 text-slate-800 dark:text-slate-200 text-xs font-semibold flex items-center gap-1.5 border border-slate-200 dark:border-white/10 transition-colors disabled:opacity-50 cursor-pointer shadow-sm"
                        >
                          <Volume2 className="w-3.5 h-3.5 text-amber-500" />
                          <span>{isPlayingAudio ? 'Speaking...' : 'Listen Audio'}</span>
                        </button>
                      </div>
                    </div>

                    <p className="text-base md:text-lg font-bold text-slate-900 dark:text-white leading-relaxed tracking-tight">
                      "{cueCard.verbatimAnswer}"
                    </p>

                    {cueCard.groundedQuotes.length > 0 && (
                      <div className="mt-4 pt-3 border-t border-amber-500/20 text-xs text-slate-600 dark:text-slate-300 flex items-center gap-2">
                        <Shield className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                        <span className="truncate">{cueCard.groundedQuotes[0]}</span>
                      </div>
                    )}
                  </div>

                  {/* SECTION 3: HOW TO SPEAK (Delivery Guidance) */}
                  {cueCard.deliveryGuidance && (
                    <div className="p-4 rounded-xl border border-indigo-500/30 bg-indigo-500/[0.05] space-y-2.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-700 dark:text-indigo-300 flex items-center gap-1.5">
                          <Zap className="w-3.5 h-3.5 text-indigo-500" />
                          HOW TO DELIVER (Tone & Vocal Pacing)
                        </span>
                        <div className="flex items-center gap-2 text-[11px] font-mono">
                          <span className="px-2 py-0.5 rounded bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 font-semibold">
                            {cueCard.deliveryGuidance.tone}
                          </span>
                          <span className="px-2 py-0.5 rounded bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 font-semibold">
                            {cueCard.deliveryGuidance.pacing}
                          </span>
                        </div>
                      </div>

                      {cueCard.deliveryGuidance.emphasisKeywords?.length > 0 && (
                        <div className="flex items-center gap-1.5 flex-wrap pt-1 text-xs">
                          <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">Emphasize:</span>
                          {cueCard.deliveryGuidance.emphasisKeywords.map((kw, i) => (
                            <span
                              key={i}
                              className="px-2 py-0.5 rounded-md bg-amber-500/15 text-amber-800 dark:text-amber-300 font-semibold text-[11px] border border-amber-500/30"
                            >
                              "{kw}"
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* SECTION 4: WHAT TO ASK NEXT (High-Leverage Steer Question) */}
                  {cueCard.followUpQuestion && (
                    <div className="p-4 rounded-xl border border-emerald-500/30 bg-emerald-500/[0.06] flex items-start justify-between gap-3">
                      <div className="flex items-start gap-2.5 flex-1">
                        <HelpCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                        <div>
                          <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-300 mb-1">
                            WHAT TO ASK NEXT (Regain Deal Control)
                          </div>
                          <p className="text-xs font-semibold text-slate-900 dark:text-white leading-relaxed">
                            "{cueCard.followUpQuestion}"
                          </p>
                        </div>
                      </div>

                      <button
                        onClick={handleCopyQuestion}
                        className="p-1.5 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 transition-colors shrink-0 cursor-pointer"
                        title="Copy question"
                      >
                        {copiedQuestion ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  )}

                  {/* Verified Knowledge Base Talking Points */}
                  <div className="bg-slate-50 dark:bg-black/30 border border-slate-200 dark:border-white/[0.06] rounded-xl p-4">
                    <div className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                      <Check className="w-3.5 h-3.5 text-emerald-500" /> Verified Knowledge Base Facts & Metrics
                    </div>
                    <div className="space-y-2">
                      {cueCard.talkingPoints.map((pt, idx) => (
                        <div key={idx} className="flex items-start gap-2.5 text-xs text-slate-700 dark:text-slate-200 leading-snug">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0 shadow-[0_0_6px_#f59e0b]" />
                          <span>{pt}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Suggested Presentation Slide */}
                  <div className="bg-slate-50 dark:bg-black/30 border border-slate-200 dark:border-white/[0.06] rounded-xl p-4 flex items-center justify-between gap-3 hover:border-amber-500/40 transition-colors">
                    <div className="flex items-center gap-3 overflow-hidden">
                      <div className="w-9 h-9 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-600 dark:text-amber-400 shrink-0">
                        <Presentation className="w-4 h-4" />
                      </div>
                      <div className="truncate">
                        <div className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-bold tracking-wider">Recommended Pitch Slide</div>
                        <div className="text-xs font-semibold text-slate-900 dark:text-white truncate">
                          {cueCard.relevantSlideTitle}
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => onSelectSlide(cueCard.relevantSlideId)}
                      className="px-3.5 py-1.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 shrink-0 shadow-sm cursor-pointer"
                    >
                      <span>Jump to Slide</span>
                    </button>
                  </div>

                  {/* Objection Defuser Strategy */}
                  {cueCard.objectionDefuser && (
                    <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-3.5 text-xs flex items-start gap-2.5">
                      <Lightbulb className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold text-amber-800 dark:text-amber-300">Tactical Strategy: </span>
                        <span className="text-slate-700 dark:text-slate-200">{cueCard.objectionDefuser}</span>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="py-24 text-center text-slate-500 dark:text-slate-400 text-xs space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center mx-auto text-amber-600 dark:text-amber-400 shadow-md">
                    <Sparkles className="w-6 h-6 animate-pulse" />
                  </div>
                  <div className="font-bold text-slate-900 dark:text-white text-sm">SAM is Standing By...</div>
                  <p className="max-w-md mx-auto text-slate-500 dark:text-slate-400 text-xs leading-relaxed">
                    As speech is detected from your call or microphone, SAM will instantly coach you on exactly WHAT to say, HOW to modulate your tone, and WHEN to take the floor.
                  </p>
                </div>
              )}
            </div>

            {/* Manual Query Bar */}
            <div className="pt-3.5 border-t border-slate-200/80 dark:border-white/[0.08] space-y-2.5">
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-[11px]">
                {quickPrompts.map((prompt, idx) => (
                  <button
                    key={idx}
                    onClick={() => onAskCopilot(prompt)}
                    className="px-3 py-1 rounded-lg bg-slate-100 dark:bg-white/[0.04] hover:bg-slate-200 dark:hover:bg-white/[0.08] text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-white/[0.06] whitespace-nowrap transition-colors shrink-0 cursor-pointer"
                  >
                    {prompt}
                  </button>
                ))}
              </div>

              <form onSubmit={handleManualSubmit} className="relative flex items-center">
                <input
                  type="text"
                  placeholder="Ask anything or simulate objection (e.g. 'How do you handle EU GDPR data?')..."
                  value={manualQuery}
                  onChange={(e) => setManualQuery(e.target.value)}
                  className="w-full bg-slate-100/90 dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded-xl pl-3.5 pr-20 py-2.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/50 transition-all"
                />
                <button
                  type="submit"
                  disabled={!manualQuery.trim() || isLoadingAi}
                  className="absolute right-1.5 px-3 py-1.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 text-xs font-bold rounded-lg transition-all disabled:opacity-40 flex items-center gap-1 cursor-pointer shadow-sm"
                >
                  <span>Ask</span>
                  <CornerDownLeft className="w-3 h-3" />
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

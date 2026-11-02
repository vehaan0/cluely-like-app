import React, { useState, useMemo } from 'react';
import {
  CopilotCueCard,
  TranscriptItem,
  PresentationSlide,
  HudMode,
  MeetingScenario,
  AIProviderConfig,
  KnowledgeBase,
} from '../types';
import {
  SupportedLanguage,
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
  Plus,
  UserPlus,
  Send,
  X,
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
  scenarios: MeetingScenario[];
  onSelectScenario: (sc: MeetingScenario) => void;
  onTriggerScenarioStep: () => void;
  onAddCustomScenario: (sc: MeetingScenario) => void;
  onDirectForeignSpeech: (foreignText: string, speakerName?: string) => void;
  isSimulatingSpeaker: boolean;
  providerConfig: AIProviderConfig;
  isLoadingAi: boolean;
  isQuotaExceeded?: boolean;
  onSwitchToProviders?: () => void;
  knowledgeBase: KnowledgeBase;
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
  scenarios,
  onSelectScenario,
  onTriggerScenarioStep,
  onAddCustomScenario,
  onDirectForeignSpeech,
  isSimulatingSpeaker,
  isLoadingAi,
  isQuotaExceeded = false,
  onSwitchToProviders,
  knowledgeBase,
}) => {
  const [hudMode, setHudMode] = useState<HudMode>('docked-full');
  const [mobileTab, setMobileTab] = useState<'stream' | 'cuecard'>('cuecard');
  const [copiedVerbatim, setCopiedVerbatim] = useState(false);
  const [copiedQuestion, setCopiedQuestion] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [manualQuery, setManualQuery] = useState('');

  // Direct foreign speech testing input
  const [foreignInputText, setForeignInputText] = useState('');
  const [foreignSpeakerName, setForeignSpeakerName] = useState('Counterparty');

  // Custom Scenario Modal state
  const [isCustomScenarioModalOpen, setIsCustomScenarioModalOpen] = useState(false);
  const [customName, setCustomName] = useState('');
  const [customTitle, setCustomTitle] = useState('Senior Decision Maker');
  const [customCompany, setCustomCompany] = useState('Global Enterprise');
  const [customLang, setCustomLang] = useState('Japanese');
  const [customLangCode, setCustomLangCode] = useState('ja');
  const [customSpeech, setCustomSpeech] = useState('');

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

  const handleDirectForeignSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!foreignInputText.trim()) return;
    onDirectForeignSpeech(foreignInputText.trim(), foreignSpeakerName.trim() || 'Counterparty');
    setForeignInputText('');
  };

  const handleCreateCustomScenario = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customName.trim() || !customSpeech.trim()) return;

    const detected = identifyLanguage(customSpeech);
    const newSc: MeetingScenario = {
      id: `custom-sc-${Date.now()}`,
      title: `${customCompany}: ${customName}`,
      counterpartyName: customName.trim(),
      counterpartyTitle: customTitle.trim(),
      counterpartyCompany: customCompany.trim(),
      counterpartyLocation: 'Client HQ',
      nativeLanguage: customLang || detected.name,
      nativeLanguageCode: customLangCode || detected.code,
      avatarSeed: customName.trim(),
      isCustom: true,
      dialogueSteps: [
        {
          speakerText: customSpeech.trim(),
          englishTranslation: customSpeech.trim(),
          expectedTopic: 'Custom evaluation inquiry',
          delayMs: 3000,
        },
      ],
    };

    onAddCustomScenario(newSc);
    onSelectScenario(newSc);
    setIsCustomScenarioModalOpen(false);
    setCustomName('');
    setCustomSpeech('');
  };

  // Dynamically derive quick prompts from the loaded knowledge base documents
  const dynamicQuickPrompts = useMemo(() => {
    const list: string[] = [];
    if (knowledgeBase.documents && knowledgeBase.documents.length > 0) {
      knowledgeBase.documents.forEach((d) => {
        list.push(`How do we handle ${d.title}?`);
        if (d.keyFacts && d.keyFacts[0]) {
          list.push(d.keyFacts[0].slice(0, 42));
        }
      });
    }
    if (list.length === 0) {
      list.push(`How does ${knowledgeBase.name} ensure enterprise reliability?`);
      list.push(`What is our deployment architecture?`);
      list.push(`Explain our pricing & ROI model`);
      list.push(`What compliance certifications do we hold?`);
    }
    return list.slice(0, 6);
  }, [knowledgeBase]);

  return (
    <div className="flex-1 p-3 sm:p-4 lg:p-6 max-w-[1600px] w-full mx-auto flex flex-col gap-4 sm:gap-5 pb-24 md:pb-8">
      {/* Active Quota Notification / Offline Fast Engine Notice */}
      {isQuotaExceeded && (
        <div className="glass-panel border-amber-500/30 rounded-2xl px-4 py-3 flex flex-wrap items-center justify-between gap-3 text-xs shadow-[0_4px_20px_rgba(245,158,11,0.12)]">
          <div className="flex items-center gap-2.5 text-amber-600 dark:text-amber-300">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse shadow-[0_0_10px_#f59e0b]" />
            <span className="font-bold tracking-wide uppercase text-[11px]">SAM Offline Grounded Engine:</span>
            <span className="text-slate-600 dark:text-slate-300">
              Cloud AI quota reached (429). SAM is seamlessly synthesizing grounded answers and translations from your active Knowledge Base with sub-10ms latency.
            </span>
          </div>
          {onSwitchToProviders && (
            <button
              onClick={onSwitchToProviders}
              className="px-3 py-1.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold rounded-lg transition-all text-xs shadow-sm shrink-0 cursor-pointer"
            >
              Switch AI Brain / Enter Custom Key
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
              {scenarios.map((sc) => {
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

              <button
                onClick={() => setIsCustomScenarioModalOpen(true)}
                className="px-2.5 py-1.5 rounded-lg text-xs font-semibold text-amber-600 dark:text-amber-400 hover:bg-amber-500/10 transition-colors flex items-center gap-1 shrink-0 cursor-pointer"
                title="Add custom counterparty persona"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Persona</span>
              </button>
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

      {/* Custom Counterparty Scenario Modal */}
      {isCustomScenarioModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#0c0e17] border border-slate-200 dark:border-white/10 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-white/10">
              <div className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-white">
                <UserPlus className="w-4 h-4 text-amber-500" />
                <span>Add Custom Counterparty Persona</span>
              </div>
              <button
                onClick={() => setIsCustomScenarioModalOpen(false)}
                className="p-1 rounded text-slate-400 hover:text-slate-700 dark:hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateCustomScenario} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Speaker Full Name</label>
                <input
                  type="text"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  placeholder="e.g. Jean-Luc Dupont or Sarah Miller"
                  required
                  className="w-full bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Company</label>
                  <input
                    type="text"
                    value={customCompany}
                    onChange={(e) => setCustomCompany(e.target.value)}
                    placeholder="e.g. BNP Paribas"
                    className="w-full bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Job Title</label>
                  <input
                    type="text"
                    value={customTitle}
                    onChange={(e) => setCustomTitle(e.target.value)}
                    placeholder="e.g. CTO / Head of Infra"
                    className="w-full bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Native Language</label>
                  <input
                    type="text"
                    value={customLang}
                    onChange={(e) => setCustomLang(e.target.value)}
                    placeholder="e.g. French, German, Spanish"
                    className="w-full bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Language Code</label>
                  <input
                    type="text"
                    value={customLangCode}
                    onChange={(e) => setCustomLangCode(e.target.value)}
                    placeholder="e.g. fr, de, es, ja"
                    className="w-full bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Their Speech / Objection Question
                </label>
                <textarea
                  rows={3}
                  value={customSpeech}
                  onChange={(e) => setCustomSpeech(e.target.value)}
                  placeholder="Type their foreign sentence or meeting question..."
                  required
                  className="w-full bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded-xl p-3 text-xs text-slate-900 dark:text-white font-mono leading-relaxed focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-200 dark:border-white/10">
                <button
                  type="button"
                  onClick={() => setIsCustomScenarioModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-white/[0.05] text-slate-700 dark:text-slate-300 text-xs font-medium cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 text-xs font-bold cursor-pointer"
                >
                  Create & Select Persona
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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

              <div className="space-y-2">
                <p className="text-sm font-medium text-slate-900 dark:text-slate-100 leading-relaxed font-sans">
                  "{currentSubtitle.original}"
                </p>
                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-slate-900 dark:text-white font-semibold text-xs leading-relaxed flex items-start gap-2">
                  <span className="text-amber-600 dark:text-amber-400 font-bold shrink-0">Translated:</span>
                  <span>{currentSubtitle.translated}</span>
                </div>
              </div>
            </div>
          )}

          {/* Direct Speech / Meeting Audio Tester Box */}
          <div className="glass-panel rounded-2xl p-4 space-y-2.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-indigo-500" />
                <span>Test Arbitrary Foreign Speech / Real Call Audio</span>
              </span>
              <span className="text-[11px] text-slate-500">Auto-detects any language</span>
            </div>
            <form onSubmit={handleDirectForeignSubmit} className="flex gap-2">
              <input
                type="text"
                placeholder="Type or paste any foreign sentence (e.g. in Japanese, German, Spanish, French, Hindi)..."
                value={foreignInputText}
                onChange={(e) => setForeignInputText(e.target.value)}
                className="flex-1 bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-amber-500"
              />
              <button
                type="submit"
                disabled={!foreignInputText.trim() || isLoadingAi}
                className="px-3.5 py-2 bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-400 hover:to-indigo-500 text-white text-xs font-bold rounded-xl transition-all disabled:opacity-40 flex items-center gap-1.5 shrink-0 cursor-pointer shadow-sm"
              >
                <Send className="w-3 h-3" />
                <span>Translate & Coach</span>
              </button>
            </form>
          </div>

          {/* Bilingual Transcript Log */}
          <div className="glass-panel rounded-2xl p-4 flex flex-col h-[520px]">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200/80 dark:border-white/[0.08] text-xs">
              <div className="flex items-center gap-2">
                <Activity className="w-3.5 h-3.5 text-amber-500" />
                <span className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[11px]">
                  Real-Time Meeting Log ({transcripts.length})
                </span>
              </div>
              {transcripts.length > 0 && (
                <button
                  onClick={onClearTranscripts}
                  className="text-slate-400 hover:text-rose-500 text-[11px] flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>Clear</span>
                </button>
              )}
            </div>

            <div className="flex-1 overflow-y-auto space-y-3 pt-3 pr-1">
              {transcripts.map((item) => (
                <div
                  key={item.id}
                  className={`p-3.5 rounded-xl border transition-all ${
                    item.isUser
                      ? 'bg-amber-500/10 border-amber-500/30 ml-4'
                      : 'bg-white/90 dark:bg-black/30 border-slate-200/90 dark:border-white/[0.06] mr-4'
                  }`}
                >
                  <div className="flex items-center justify-between text-[11px] mb-1.5">
                    <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                      <span>{item.speaker}</span>
                      {item.speakerRole && (
                        <span className="text-slate-400 font-normal">({item.speakerRole})</span>
                      )}
                    </span>
                    <span className="text-slate-400 font-mono text-[10px]">{item.timestamp}</span>
                  </div>

                  <p className="text-xs text-slate-800 dark:text-slate-200 leading-relaxed font-sans">
                    {item.originalText}
                  </p>

                  {!item.isUser && item.translatedText && (
                    <div className="mt-2 pt-2 border-t border-slate-100 dark:border-white/[0.06] flex items-start gap-1.5 text-xs text-amber-800 dark:text-amber-200 font-medium">
                      <span className="text-[10px] font-mono uppercase text-amber-600 dark:text-amber-400 font-bold shrink-0">
                        {item.targetLanguage}:
                      </span>
                      <span>{item.translatedText}</span>
                    </div>
                  )}
                </div>
              ))}

              {transcripts.length === 0 && (
                <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400 dark:text-slate-500 text-xs space-y-2">
                  <MessageSquare className="w-8 h-8 text-amber-500/40" />
                  <span className="font-semibold text-slate-700 dark:text-slate-300">Live Transcript Empty</span>
                  <p className="max-w-xs text-slate-500 dark:text-slate-400 text-[11px]">
                    Turn on the microphone above, simulate dialogue, or type counterparty speech to begin live transcription.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Column 2: WHAT / HOW / WHEN Real-Time Sales Guidance */}
        <div className={`lg:col-span-6 flex flex-col gap-4 ${mobileTab === 'cuecard' ? 'block' : 'hidden lg:flex'}`}>
          <div className="glass-panel-amber rounded-2xl p-5 shadow-xl relative overflow-hidden flex flex-col min-h-[560px]">
            {/* Top Guidance Header */}
            <div className="flex items-center justify-between pb-3 border-b border-amber-500/20 text-xs">
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                <span className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-xs">
                  Real-Time Sales Teleprompter
                </span>
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setHudMode(hudMode === 'teleprompter-notch' ? 'docked-full' : 'teleprompter-notch')}
                  className="px-2.5 py-1 text-[11px] rounded-lg bg-black/5 dark:bg-white/[0.05] hover:bg-black/10 dark:hover:bg-white/[0.1] text-slate-700 dark:text-slate-300 font-semibold border border-slate-200 dark:border-white/10 transition-colors cursor-pointer"
                >
                  {hudMode === 'teleprompter-notch' ? 'Dock HUD' : 'Webcam Eye-Level Mode'}
                </button>
              </div>
            </div>

            {/* Cue Card Body */}
            <div className="flex-1 py-4 space-y-4">
              {cueCard ? (
                <>
                  {/* Micro-Timing & Posture Strip (WHEN to speak & Conversation Phase) */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                    <div className="bg-white/80 dark:bg-white/[0.05] border border-slate-200 dark:border-white/10 rounded-xl p-3 flex items-start gap-2.5 shadow-xs">
                      <Clock className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                      <div>
                        <div className="text-[10px] uppercase font-bold text-amber-600 dark:text-amber-400 tracking-wider">
                          WHEN to Speak (Micro-Timing)
                        </div>
                        <div className="font-semibold text-slate-900 dark:text-white text-xs mt-0.5">
                          {cueCard.timingCue?.whenToSpeak || 'Speak as speaker concludes thought.'}
                        </div>
                      </div>
                    </div>

                    <div className="bg-white/80 dark:bg-white/[0.05] border border-slate-200 dark:border-white/10 rounded-xl p-3 flex items-start gap-2.5 shadow-xs">
                      <Zap className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
                      <div>
                        <div className="text-[10px] uppercase font-bold text-indigo-600 dark:text-indigo-400 tracking-wider">
                          Sales Phase & Urgency
                        </div>
                        <div className="font-semibold text-slate-900 dark:text-white text-xs mt-0.5 capitalize flex items-center gap-2">
                          <span>{cueCard.timingCue?.conversationPhase || 'Discovery Qualification'}</span>
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-600 font-mono font-bold">
                            {cueCard.timingCue?.urgencyLevel || 'Calm'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* HOW to Speak (Delivery & Modulation Guidance) */}
                  <div className="bg-amber-500/10 border border-amber-500/25 rounded-xl p-3.5 text-xs space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-amber-800 dark:text-amber-300 text-[11px] uppercase tracking-wider">
                        HOW to Speak (Tone & Cadence)
                      </span>
                      <span className="text-slate-600 dark:text-slate-400 font-mono text-[10px]">
                        Tone: {cueCard.deliveryGuidance?.tone || 'Assured & consultative'}
                      </span>
                    </div>
                    <div className="text-slate-700 dark:text-slate-200 leading-snug">
                      {cueCard.deliveryGuidance?.pacing || 'Keep steady cadence; pause deliberately after key metrics.'}
                    </div>
                    {cueCard.deliveryGuidance?.emphasisKeywords && cueCard.deliveryGuidance.emphasisKeywords.length > 0 && (
                      <div className="flex items-center gap-1.5 flex-wrap pt-1">
                        <span className="text-[10px] font-bold text-slate-500">Emphasis Keywords:</span>
                        {cueCard.deliveryGuidance.emphasisKeywords.map((kw, idx) => (
                          <span
                            key={idx}
                            className="text-[10px] bg-white/90 dark:bg-black/40 border border-amber-500/30 text-amber-800 dark:text-amber-200 font-bold px-2 py-0.5 rounded-md"
                          >
                            "{kw}"
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* WHAT to Speak: Verbatim Grounded Speech */}
                  <div className="bg-white/90 dark:bg-white/[0.04] border border-slate-200 dark:border-white/10 rounded-2xl p-4 shadow-sm space-y-3">
                    <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                      <span className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[11px]">
                        WHAT to Speak (Verbatim Grounded Answer)
                      </span>
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleSpeakText(cueCard.verbatimAnswer)}
                          className="p-1.5 rounded-lg bg-slate-100 dark:bg-white/[0.05] hover:bg-slate-200 dark:hover:bg-white/[0.1] text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
                          title="Read out loud (TTS)"
                        >
                          <Volume2 className={`w-3.5 h-3.5 ${isPlayingAudio ? 'text-amber-500 animate-pulse' : ''}`} />
                        </button>
                        <button
                          onClick={handleCopyVerbatim}
                          className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-white/[0.05] hover:bg-slate-200 dark:hover:bg-white/[0.1] text-slate-700 dark:text-slate-300 text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                        >
                          {copiedVerbatim ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3 text-amber-500" />}
                          <span>{copiedVerbatim ? 'Copied' : 'Copy'}</span>
                        </button>
                      </div>
                    </div>

                    <div className="text-base sm:text-lg font-bold text-slate-900 dark:text-white leading-relaxed tracking-tight">
                      "{cueCard.verbatimAnswer}"
                    </div>
                  </div>

                  {/* Follow-up Strategic Question (Retain Conversational Control) */}
                  {cueCard.followUpQuestion && (
                    <div className="bg-indigo-500/10 border border-indigo-500/25 rounded-xl p-3.5 text-xs space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-indigo-700 dark:text-indigo-300 text-[11px] uppercase tracking-wider">
                          Follow-Up Steering Question (Ask Next)
                        </span>
                        <button
                          onClick={handleCopyQuestion}
                          className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer flex items-center gap-1"
                        >
                          {copiedQuestion ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                          <span>{copiedQuestion ? 'Copied' : 'Copy Question'}</span>
                        </button>
                      </div>
                      <div className="font-semibold text-slate-900 dark:text-white text-xs sm:text-sm leading-snug">
                        "{cueCard.followUpQuestion}"
                      </div>
                    </div>
                  )}

                  {/* Grounded Key Facts Talking Points */}
                  {cueCard.talkingPoints && cueCard.talkingPoints.length > 0 && (
                    <div className="space-y-1.5">
                      <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                        Grounded Facts to Lean On:
                      </div>
                      <div className="space-y-1">
                        {cueCard.talkingPoints.map((tp, idx) => (
                          <div key={idx} className="flex items-start gap-2 text-xs text-slate-700 dark:text-slate-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                            <span>{tp}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Recommended Presentation Slide to Show */}
                  <div className="bg-slate-50/90 dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 rounded-xl p-3 flex items-center justify-between gap-3 shadow-xs">
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

                  {/* Tactical Objection Defuser Strategy */}
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

            {/* Dynamic Grounded Quick Prompts Bar & Manual Query Bar */}
            <div className="pt-3.5 border-t border-slate-200/80 dark:border-white/[0.08] space-y-2.5">
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-[11px]">
                {dynamicQuickPrompts.map((prompt, idx) => (
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
                  placeholder="Ask anything or simulate client query..."
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

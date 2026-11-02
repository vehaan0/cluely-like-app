import React, { useState } from 'react';
import {
  CopilotCueCard,
  TranscriptItem,
  HudMode,
  PresentationSlide,
} from '../types';
import { SupportedLanguage } from '../utils/translation-engine';
import {
  Sparkles,
  Copy,
  Check,
  Volume2,
  Presentation,
  Shield,
  Lightbulb,
  CornerDownLeft,
  ChevronDown,
  Layout,
  Maximize2,
  Minimize2,
  FileText,
  Clock,
  ArrowRight,
} from 'lucide-react';

interface CluelyHudProps {
  cueCard: CopilotCueCard | null;
  transcripts: TranscriptItem[];
  preferredLanguage: SupportedLanguage;
  slides: PresentationSlide[];
  onSelectSlide: (slideId: string) => void;
  onAskCopilot: (query: string) => void;
  hudMode: HudMode;
  onChangeHudMode: (mode: HudMode) => void;
  isLoadingAi?: boolean;
}

export const CluelyHud: React.FC<CluelyHudProps> = ({
  cueCard,
  transcripts,
  preferredLanguage,
  slides,
  onSelectSlide,
  onAskCopilot,
  hudMode,
  onChangeHudMode,
  isLoadingAi = false,
}) => {
  const [copied, setCopied] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [manualQuery, setManualQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'copilot' | 'transcript'>('copilot');

  const handleCopyVerbatim = () => {
    if (!cueCard?.verbatimAnswer) return;
    navigator.clipboard.writeText(cueCard.verbatimAnswer);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSpeakText = (text: string) => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = preferredLanguage.code;
    utterance.rate = 1.05;
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
    <div
      className={`flex flex-col bg-slate-900/95 border border-slate-700/80 rounded-xl backdrop-blur-xl shadow-2xl transition-all duration-300 overflow-hidden ${
        hudMode === 'top-teleprompter'
          ? 'w-full max-w-4xl mx-auto border-amber-500/40 ring-1 ring-amber-500/20'
          : hudMode === 'minimal-notch'
          ? 'w-full max-w-xl mx-auto'
          : 'w-full h-full'
      }`}
    >
      {/* Top HUD Header bar */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-slate-950/80 border-b border-slate-800 text-xs">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 font-bold text-white tracking-wide">
            <span className="w-5 h-5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center text-[11px] font-extrabold">
              C
            </span>
            <span>Cluely Teleprompter HUD</span>
          </div>
          <span className="text-slate-600">·</span>
          <span className="text-amber-400 font-medium text-[11px] flex items-center gap-1">
            <Sparkles className="w-3 h-3" /> Live KB Grounded
          </span>
        </div>

        {/* Controls: Segmented View + Dock mode toggles */}
        <div className="flex items-center gap-2">
          {/* Segmented Tab */}
          <div className="flex items-center bg-slate-900 border border-slate-800 rounded-lg p-0.5 text-[11px]">
            <button
              onClick={() => setActiveTab('copilot')}
              className={`px-2.5 py-1 rounded font-medium transition-colors ${
                activeTab === 'copilot'
                  ? 'bg-amber-500 text-slate-950 font-semibold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Cue Cards
            </button>
            <button
              onClick={() => setActiveTab('transcript')}
              className={`px-2.5 py-1 rounded font-medium transition-colors ${
                activeTab === 'transcript'
                  ? 'bg-amber-500 text-slate-950 font-semibold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Live Subtitles ({transcripts.length})
            </button>
          </div>

          {/* Docking Mode selector */}
          <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 rounded-lg p-0.5">
            <button
              onClick={() => onChangeHudMode('top-teleprompter')}
              title="Top Teleprompter (Eye-level above Google Meet)"
              className={`p-1 rounded text-xs transition-colors ${
                hudMode === 'top-teleprompter'
                  ? 'bg-slate-800 text-amber-400'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Layout className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onChangeHudMode('docked-right')}
              title="Docked Right Sidebar"
              className={`p-1 rounded text-xs transition-colors ${
                hudMode === 'docked-right'
                  ? 'bg-slate-800 text-amber-400'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 max-h-[580px]">
        {activeTab === 'copilot' ? (
          /* Copilot Cue Cards */
          <>
            {cueCard ? (
              <div className="space-y-3.5">
                {/* Trigger question header */}
                <div className="bg-slate-950/60 border border-slate-800 rounded-lg p-3">
                  <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                    <span className="font-medium text-amber-400 uppercase tracking-wide">
                      Counterparty Question
                    </span>
                    <span className="font-mono tabular-nums">{cueCard.timestamp}</span>
                  </div>
                  <p className="text-xs text-slate-200 font-medium italic">
                    "{cueCard.triggerTranscript}"
                  </p>
                </div>

                {/* Primary Card: Verbatim Response ("What to say right now") */}
                <div className="bg-gradient-to-br from-amber-500/10 via-slate-900 to-slate-950 border border-amber-500/40 rounded-xl p-4 shadow-lg relative">
                  <div className="flex items-center justify-between pb-2 border-b border-amber-500/20 mb-2.5">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-amber-400 uppercase tracking-wider">
                      <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
                      <span>Say This Out Loud Right Now</span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={handleCopyVerbatim}
                        className="px-2 py-1 rounded bg-slate-800/80 hover:bg-slate-700 text-slate-200 text-[11px] flex items-center gap-1 transition-colors"
                      >
                        {copied ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-400" />
                            <span className="text-emerald-400">Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span>Copy</span>
                          </>
                        )}
                      </button>

                      <button
                        onClick={() => handleSpeakText(cueCard.verbatimAnswer)}
                        disabled={isPlayingAudio}
                        className="px-2 py-1 rounded bg-slate-800/80 hover:bg-slate-700 text-slate-200 text-[11px] flex items-center gap-1 transition-colors disabled:opacity-50"
                      >
                        <Volume2 className="w-3 h-3 text-amber-400" />
                        <span>{isPlayingAudio ? 'Speaking...' : 'Listen'}</span>
                      </button>
                    </div>
                  </div>

                  <p className="text-sm md:text-base font-semibold text-white leading-relaxed tracking-tight">
                    {cueCard.verbatimAnswer}
                  </p>

                  {/* Grounded Citation */}
                  {cueCard.groundedQuotes.length > 0 && (
                    <div className="mt-3 pt-2.5 border-t border-slate-800/80 text-[11px] text-slate-400 flex items-center gap-1.5">
                      <Shield className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span className="truncate">{cueCard.groundedQuotes[0]}</span>
                    </div>
                  )}
                </div>

                {/* Key Talking Points */}
                <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3.5">
                  <div className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 text-emerald-400" /> Verified Knowledge Base Facts
                  </div>
                  <div className="space-y-1.5">
                    {cueCard.talkingPoints.map((pt, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-xs text-slate-200 leading-snug">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 shrink-0" />
                        <span>{pt}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Suggested Slide Trigger Button */}
                <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3.5 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5 overflow-hidden">
                    <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shrink-0">
                      <Presentation className="w-4 h-4" />
                    </div>
                    <div className="truncate">
                      <div className="text-[10px] text-slate-400 uppercase font-medium">Recommended Pitch Slide</div>
                      <div className="text-xs font-semibold text-white truncate">
                        {cueCard.relevantSlideTitle}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => onSelectSlide(cueCard.relevantSlideId)}
                    className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1 shrink-0 shadow-sm"
                  >
                    <span>Show Slide</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Objection Defuser */}
                {cueCard.objectionDefuser && (
                  <div className="bg-slate-950/50 border border-slate-800/80 rounded-lg p-3 text-xs flex items-start gap-2">
                    <Lightbulb className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-semibold text-amber-400">Tactical Pointer: </span>
                      <span className="text-slate-300">{cueCard.objectionDefuser}</span>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="py-12 text-center text-slate-400 text-xs space-y-3">
                <Sparkles className="w-8 h-8 text-amber-400/60 mx-auto animate-pulse" />
                <div className="font-semibold text-slate-200 text-sm">Cluely Copilot Listening...</div>
                <p className="max-w-md mx-auto text-slate-400">
                  When your Google Meet counterparty speaks or when you ask a quick question, Cluely will generate verbatim pitch cues grounded in your Knowledge Base.
                </p>
              </div>
            )}
          </>
        ) : (
          /* Live Subtitle Transcript Stream */
          <div className="space-y-3">
            {transcripts.map((item) => (
              <div
                key={item.id}
                className={`p-3 rounded-lg border text-xs leading-relaxed ${
                  item.isUser
                    ? 'bg-slate-950 border-slate-800 ml-4'
                    : 'bg-slate-950/90 border-slate-800/80'
                }`}
              >
                <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                  <span className="font-semibold text-white">
                    {item.speaker}{' '}
                    <span className="text-slate-500 font-normal">({item.speakerRole})</span>
                  </span>
                  <span className="font-mono text-[10px] tabular-nums">{item.timestamp}</span>
                </div>

                {/* Original incoming speech */}
                <div className="text-slate-400 text-xs italic mb-1.5 flex items-start gap-1.5">
                  <span className="text-[10px] text-slate-500 uppercase shrink-0 font-mono">
                    [{item.sourceLanguage}]
                  </span>
                  <span>{item.originalText}</span>
                </div>

                {/* Translated into preferred language */}
                <div className="text-amber-300 font-medium text-xs flex items-start gap-1.5 pt-1 border-t border-slate-800/60">
                  <span className="text-[10px] text-amber-400 uppercase shrink-0 font-mono">
                    [{item.targetLanguage}]
                  </span>
                  <span>{item.translatedText}</span>
                </div>
              </div>
            ))}

            {transcripts.length === 0 && (
              <div className="py-12 text-center text-slate-500 text-xs">
                No meeting speech recorded yet. Start speaking or click "Start Meet Simulation".
              </div>
            )}
          </div>
        )}
      </div>

      {/* Manual Quick Query Bar at the bottom */}
      <div className="p-3 bg-slate-950/90 border-t border-slate-800 space-y-2">
        {/* Quick Prompts */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-[11px]">
          {quickPrompts.map((prompt, idx) => (
            <button
              key={idx}
              onClick={() => onAskCopilot(prompt)}
              className="px-2.5 py-1 rounded bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 whitespace-nowrap transition-colors shrink-0"
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* Input Form */}
        <form onSubmit={handleManualSubmit} className="relative flex items-center">
          <input
            type="text"
            placeholder="Type any client question or objection to pull KB cue card..."
            value={manualQuery}
            onChange={(e) => setManualQuery(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700/80 rounded-lg pl-3 pr-20 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
          />
          <button
            type="submit"
            disabled={!manualQuery.trim() || isLoadingAi}
            className="absolute right-1.5 px-3 py-1 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-semibold rounded-md transition-colors disabled:opacity-40 flex items-center gap-1"
          >
            <span>Ask</span>
            <CornerDownLeft className="w-3 h-3" />
          </button>
        </form>
      </div>
    </div>
  );
};

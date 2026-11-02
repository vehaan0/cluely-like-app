import React, { useState, useEffect } from 'react';
import {
  MeetingScenario,
  TranscriptItem,
  PresentationSlide,
  HudMode,
  MeetingPlatform,
} from '../types';
import {
  SupportedLanguage,
  MEETING_SCENARIOS,
  SUPPORTED_PLATFORMS,
  identifyLanguage,
} from '../utils/translation-engine';
import { PresentationDeck } from './PresentationDeck';
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  Share2,
  PhoneOff,
  Subtitles,
  Sparkles,
  Users,
  Volume2,
  Radio,
  SlidersHorizontal,
  Globe,
  Monitor,
} from 'lucide-react';

interface MeetSimulatorProps {
  scenario: MeetingScenario;
  onSelectScenario: (sc: MeetingScenario) => void;
  isCallActive: boolean;
  onToggleCall: () => void;
  transcripts: TranscriptItem[];
  currentSubtitle: { original: string; translated: string; speaker: string } | null;
  preferredLanguage: SupportedLanguage;
  slides: PresentationSlide[];
  activeSlideId: string;
  onSelectSlide: (slideId: string) => void;
  isMicActive: boolean;
  onToggleMic: () => void;
  isSharingScreen: boolean;
  onToggleScreenShare: () => void;
  hudMode: HudMode;
  onTriggerScenarioStep: () => void;
  isSimulatingSpeaker: boolean;
  activePlatform: MeetingPlatform;
  onChangePlatform: (plat: MeetingPlatform) => void;
}

export const MeetSimulator: React.FC<MeetSimulatorProps> = ({
  scenario,
  onSelectScenario,
  isCallActive,
  onToggleCall,
  transcripts,
  currentSubtitle,
  preferredLanguage,
  slides,
  activeSlideId,
  onSelectSlide,
  isMicActive,
  onToggleMic,
  isSharingScreen,
  onToggleScreenShare,
  hudMode,
  onTriggerScenarioStep,
  isSimulatingSpeaker,
  activePlatform,
  onChangePlatform,
}) => {
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [showSubtitles, setShowSubtitles] = useState(true);
  const [callDuration, setCallDuration] = useState(142); // 02:22 start

  useEffect(() => {
    if (!isCallActive) return;
    const interval = setInterval(() => {
      setCallDuration((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [isCallActive]);

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const currentPlatformConfig =
    SUPPORTED_PLATFORMS.find((p) => p.id === activePlatform) || SUPPORTED_PLATFORMS[0];

  // Auto-detect current speaker language info
  const detectedSpeakerLang = currentSubtitle
    ? identifyLanguage(currentSubtitle.original)
    : { code: scenario.nativeLanguageCode, name: scenario.nativeLanguage, confidence: 98 };

  return (
    <div
      className={`flex flex-col h-full bg-slate-950 border rounded-xl overflow-hidden shadow-2xl relative transition-all ${
        activePlatform === 'microsoft-teams'
          ? 'border-indigo-500/40 ring-1 ring-indigo-500/20'
          : activePlatform === 'zoom'
          ? 'border-sky-500/40 ring-1 ring-sky-500/20'
          : 'border-slate-800'
      }`}
    >
      {/* Platform & Call Top Header Bar */}
      <div
        className={`flex items-center justify-between px-4 py-2.5 text-xs text-slate-300 border-b ${
          activePlatform === 'microsoft-teams'
            ? 'bg-indigo-950/70 border-indigo-900/60'
            : activePlatform === 'zoom'
            ? 'bg-slate-900/90 border-sky-950/60'
            : 'bg-slate-900 border-slate-800'
        }`}
      >
        <div className="flex items-center gap-3">
          {/* Platform Switcher */}
          <div className="flex items-center gap-1.5 bg-slate-950/80 border border-slate-800 rounded-lg px-2.5 py-1 text-xs">
            <Monitor className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-slate-400 font-normal hidden sm:inline">Platform:</span>
            <select
              value={activePlatform}
              onChange={(e) => onChangePlatform(e.target.value as MeetingPlatform)}
              aria-label="Meeting Platform"
              className="bg-transparent text-white font-semibold focus:outline-none cursor-pointer"
            >
              <option value="google-meet" className="bg-slate-900 text-white">Google Meet</option>
              <option value="microsoft-teams" className="bg-slate-900 text-white">Microsoft Teams</option>
              <option value="zoom" className="bg-slate-900 text-white">Zoom Workplace</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5 font-medium text-slate-200">
            <span
              className="w-2.5 h-2.5 rounded-full animate-pulse"
              style={{ backgroundColor: currentPlatformConfig.accentColor }}
            />
            <span className="font-mono text-xs hidden md:inline">
              {currentPlatformConfig.meetingUrlPrefix}
            </span>
          </div>
          <span className="text-slate-600 hidden md:inline">·</span>
          <span className="font-mono text-slate-400 tabular-nums">{formatTimer(callDuration)}</span>
        </div>

        {/* Scenario Switcher dropdown */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1 text-xs">
            <SlidersHorizontal className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-slate-400 hidden sm:inline">Client:</span>
            <select
              value={scenario.id}
              onChange={(e) => {
                const found = MEETING_SCENARIOS.find((s) => s.id === e.target.value);
                if (found) onSelectScenario(found);
              }}
              aria-label="Select meeting scenario"
              className="bg-transparent text-white font-medium focus:outline-none cursor-pointer"
            >
              {MEETING_SCENARIOS.map((sc) => (
                <option key={sc.id} value={sc.id} className="bg-slate-900 text-white">
                  {sc.title}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1 text-slate-400">
            <Users className="w-4 h-4" />
            <span className="text-[11px] font-mono">2</span>
          </div>
        </div>
      </div>

      {/* Main Video Call Stage */}
      <div className="flex-1 relative bg-slate-950 p-4 flex flex-col justify-center items-center overflow-hidden min-h-[440px]">
        {/* If screen sharing, present the slides as the primary screen */}
        {isSharingScreen ? (
          <div className="w-full h-full max-w-4xl max-h-[500px]">
            <PresentationDeck
              slides={slides}
              activeSlideId={activeSlideId}
              onSelectSlide={onSelectSlide}
              isSharingScreen={isSharingScreen}
              onToggleScreenShare={onToggleScreenShare}
              compact={true}
            />
          </div>
        ) : (
          /* Normal Counterparty Video View */
          <div className="w-full max-w-3xl aspect-video bg-gradient-to-br from-slate-900 via-slate-900/90 to-slate-950 border border-slate-800/90 rounded-2xl flex flex-col justify-between p-6 shadow-2xl relative overflow-hidden">
            {/* Ambient Speaking Pulse Effect */}
            {isSimulatingSpeaker && (
              <div
                className="absolute inset-0 border-2 rounded-2xl pointer-events-none animate-pulse"
                style={{ borderColor: currentPlatformConfig.accentColor }}
              />
            )}

            {/* Top info badge inside video */}
            <div className="flex items-center justify-between z-10">
              <div className="bg-slate-950/80 backdrop-blur-md border border-slate-800 rounded-lg px-3 py-1.5 text-xs flex items-center gap-2">
                <span className="font-semibold text-white">{scenario.counterpartyName}</span>
                <span className="text-slate-500">·</span>
                <span className="text-slate-400">{scenario.counterpartyCompany}</span>
              </div>

              {isSimulatingSpeaker && (
                <div className="bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 rounded-full px-2.5 py-0.5 text-[11px] font-medium flex items-center gap-1.5 animate-pulse">
                  <Volume2 className="w-3.5 h-3.5" />
                  <span>Speaking ({detectedSpeakerLang.name})</span>
                </div>
              )}
            </div>

            {/* Center Avatar / Video Graphic */}
            <div className="flex flex-col items-center justify-center my-auto z-10 text-center">
              <div className="relative">
                {/* SVG Stylized Avatar Portrait */}
                <div
                  className="w-24 h-24 rounded-full p-1 shadow-xl"
                  style={{
                    background: `linear-gradient(135deg, ${currentPlatformConfig.accentColor}, #d97706)`,
                  }}
                >
                  <div className="w-full h-full rounded-full bg-slate-900 flex items-center justify-center text-white font-bold text-2xl border border-slate-800">
                    {scenario.counterpartyName.charAt(0)}
                  </div>
                </div>

                {isSimulatingSpeaker && (
                  <span
                    className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full border-2 border-slate-950 flex items-center justify-center"
                    style={{ backgroundColor: currentPlatformConfig.accentColor }}
                  >
                    <Radio className="w-3 h-3 text-slate-950 animate-spin" />
                  </span>
                )}
              </div>

              <div className="mt-3">
                <h3 className="text-base font-bold text-white">{scenario.counterpartyName}</h3>
                <p className="text-xs text-slate-400">{scenario.counterpartyTitle}</p>
                <p className="text-[11px] text-slate-500 mt-0.5">{scenario.counterpartyLocation}</p>
              </div>

              {/* Action trigger: simulate client asking next question */}
              <div className="mt-4">
                <button
                  onClick={onTriggerScenarioStep}
                  disabled={isSimulatingSpeaker}
                  className="px-4 py-2 rounded-lg bg-slate-800/90 hover:bg-slate-700 text-white text-xs font-semibold border border-slate-700 transition-all flex items-center gap-2 shadow-sm disabled:opacity-50"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>Prompt Client Question ({scenario.nativeLanguage})</span>
                </button>
              </div>
            </div>

            {/* Video footer tag */}
            <div className="flex items-center justify-between z-10 text-[11px] text-slate-500">
              <span className="flex items-center gap-1.5">
                <span className="font-semibold text-slate-300">{currentPlatformConfig.badge}</span>
                <span>· 1080p WebRTC</span>
              </span>
              <span className="font-mono">{detectedSpeakerLang.name} Audio</span>
            </div>
          </div>
        )}

        {/* Presenter Self-View (Picture-in-Picture in Top Right) */}
        <div className="absolute top-4 right-4 w-36 h-24 bg-slate-900/90 backdrop-blur-md border border-slate-700/80 rounded-xl overflow-hidden shadow-2xl flex flex-col justify-between p-2 z-20">
          <div className="flex items-center justify-between text-[10px] text-slate-400">
            <span className="font-semibold text-white">You (Presenter)</span>
            {isMicActive ? (
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            ) : (
              <span className="w-2 h-2 rounded-full bg-slate-600" />
            )}
          </div>

          <div className="flex flex-col items-center justify-center my-auto">
            <div className="w-7 h-7 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center font-bold text-xs">
              ME
            </div>
            <div className="text-[9px] text-slate-300 mt-0.5">
              {isMicActive ? 'Mic Active' : 'Mic Muted'}
            </div>
          </div>

          <div className="text-[9px] text-slate-400 text-center font-mono">
            {preferredLanguage.flag} {preferredLanguage.name}
          </div>
        </div>

        {/* Live Bilingual Subtitle Banner with Language Identification */}
        {showSubtitles && currentSubtitle && (
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-11/12 max-w-2xl bg-slate-950/95 backdrop-blur-md border border-slate-800 rounded-xl p-3.5 shadow-2xl z-30 transition-all">
            <div className="flex items-center justify-between text-[11px] mb-1.5 pb-1 border-b border-slate-800/80">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-amber-400">
                  {currentSubtitle.speaker}
                </span>
                <span className="bg-slate-800 text-slate-300 rounded px-1.5 py-0.5 text-[10px] font-mono flex items-center gap-1">
                  <Globe className="w-3 h-3 text-amber-400" />
                  <span>Detected: {detectedSpeakerLang.name} ({detectedSpeakerLang.confidence}%)</span>
                </span>
              </div>
              <span className="text-[10px] text-slate-400 font-mono">
                Live Translation to {preferredLanguage.name}
              </span>
            </div>

            {/* Original foreign speech */}
            <div className="text-xs text-slate-400 italic mb-1.5 flex items-start gap-1">
              <span className="text-slate-500 font-mono uppercase text-[10px] shrink-0">
                [{detectedSpeakerLang.code.toUpperCase()}]:
              </span>
              <span>"{currentSubtitle.original}"</span>
            </div>

            {/* Live translation in target preferred language */}
            <div className="text-sm font-semibold text-white leading-snug flex items-start gap-1">
              <span className="text-amber-400 font-mono uppercase text-[10px] shrink-0 mt-0.5">
                [{preferredLanguage.code.toUpperCase()}]:
              </span>
              <span>"{currentSubtitle.translated}"</span>
            </div>
          </div>
        )}
      </div>

      {/* Platform Call Controls Bar */}
      <div
        className={`flex items-center justify-between px-6 py-3 border-t text-xs ${
          activePlatform === 'microsoft-teams'
            ? 'bg-indigo-950/80 border-indigo-900/60'
            : activePlatform === 'zoom'
            ? 'bg-slate-900/90 border-slate-800'
            : 'bg-slate-900 border-slate-800'
        }`}
      >
        {/* Left: Meeting info & Platform indicator */}
        <div className="text-slate-400 text-xs font-mono hidden md:flex items-center gap-2">
          <span className="font-semibold text-slate-200">{currentPlatformConfig.name}</span>
          <span>·</span>
          <span>{preferredLanguage.flag} {preferredLanguage.name} HUD</span>
        </div>

        {/* Center: Essential Call Action Buttons */}
        <div className="flex items-center gap-3">
          {/* Mic Button */}
          <button
            onClick={onToggleMic}
            className={`p-3 rounded-full transition-all shadow-sm ${
              isMicActive
                ? 'bg-slate-800 text-white hover:bg-slate-700'
                : 'bg-rose-500 text-white hover:bg-rose-600'
            }`}
            title={isMicActive ? 'Mute microphone' : 'Unmute microphone'}
          >
            {isMicActive ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
          </button>

          {/* Video Camera Button */}
          <button
            onClick={() => setIsVideoOn((prev) => !prev)}
            className={`p-3 rounded-full transition-all shadow-sm ${
              isVideoOn
                ? 'bg-slate-800 text-white hover:bg-slate-700'
                : 'bg-rose-500 text-white hover:bg-rose-600'
            }`}
            title={isVideoOn ? 'Turn off camera' : 'Turn on camera'}
          >
            {isVideoOn ? <Video className="w-4 h-4" /> : <VideoOff className="w-4 h-4" />}
          </button>

          {/* Subtitles Button */}
          <button
            onClick={() => setShowSubtitles((prev) => !prev)}
            className={`p-3 rounded-full transition-all shadow-sm ${
              showSubtitles
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
            title={showSubtitles ? 'Hide subtitles' : 'Show subtitles'}
          >
            <Subtitles className="w-4 h-4" />
          </button>

          {/* Screen Share Button */}
          <button
            onClick={onToggleScreenShare}
            className={`p-3 rounded-full transition-all shadow-sm ${
              isSharingScreen
                ? 'bg-emerald-500 text-slate-950 font-bold'
                : activePlatform === 'zoom'
                ? 'bg-emerald-600/90 text-white hover:bg-emerald-500'
                : 'bg-slate-800 text-white hover:bg-slate-700'
            }`}
            title={isSharingScreen ? 'Stop screen sharing' : 'Present Slide Deck to Call'}
          >
            <Share2 className="w-4 h-4" />
          </button>

          {/* End Call Button */}
          <button
            onClick={onToggleCall}
            className="p-3 rounded-full bg-rose-600 hover:bg-rose-700 text-white transition-all shadow-lg"
            title="Leave call"
          >
            <PhoneOff className="w-4 h-4" />
          </button>
        </div>

        {/* Right: Quick Question Prompt */}
        <div className="flex items-center gap-2">
          <button
            onClick={onTriggerScenarioStep}
            disabled={isSimulatingSpeaker}
            className="px-3 py-1.5 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 disabled:opacity-50"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Next Client Question</span>
          </button>
        </div>
      </div>
    </div>
  );
};

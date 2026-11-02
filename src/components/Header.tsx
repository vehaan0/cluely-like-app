import React from 'react';
import { ActiveTab, MeetingPlatform } from '../types';
import { SupportedLanguage, SUPPORTED_LANGUAGES, SUPPORTED_PLATFORMS } from '../utils/translation-engine';
import { Globe, Video, BookOpen, Presentation, Sparkles, Wand2 } from 'lucide-react';

interface HeaderProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  preferredLanguage: SupportedLanguage;
  onLanguageChange: (lang: SupportedLanguage) => void;
  isCallActive: boolean;
  onToggleCall: () => void;
  activePlatform: MeetingPlatform;
  onChangePlatform: (plat: MeetingPlatform) => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onTabChange,
  preferredLanguage,
  onLanguageChange,
  isCallActive,
  onToggleCall,
  activePlatform,
  onChangePlatform,
}) => {
  return (
    <header className="flex items-center justify-between gap-8 px-6 py-3.5 border-b border-slate-800 bg-slate-900/90 backdrop-blur-md sticky top-0 z-40">
      {/* Zone 1: Single Brand Wordmark */}
      <div className="flex items-center gap-3 shrink-0">
        <a
          href="#meet"
          onClick={(e) => {
            e.preventDefault();
            onTabChange('meet');
          }}
          className="text-lg font-bold tracking-tight text-white whitespace-nowrap shrink-0 flex items-center gap-2"
        >
          <span className="w-7 h-7 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 font-extrabold text-sm shadow-sm">
            C
          </span>
          <span>Cluely Meet</span>
          <span className="text-xs font-medium text-slate-400 border border-slate-700/60 rounded px-1.5 py-0.5 ml-1 hidden sm:inline-block">
            Copilot HUD
          </span>
        </a>
      </div>

      {/* Zone 2: 4 Concise single-line text nav links */}
      <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-300">
        <button
          onClick={() => onTabChange('meet')}
          className={`flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 pb-0.5 border-b-2 ${
            activeTab === 'meet'
              ? 'text-white border-amber-400'
              : 'text-slate-400 border-transparent hover:text-slate-200'
          }`}
        >
          <Video className="w-4 h-4" />
          <span>Live Call Copilot</span>
        </button>

        <button
          onClick={() => onTabChange('generator')}
          className={`flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 pb-0.5 border-b-2 ${
            activeTab === 'generator'
              ? 'text-white border-amber-400'
              : 'text-slate-400 border-transparent hover:text-slate-200'
          }`}
        >
          <Wand2 className="w-4 h-4" />
          <span>Deck Generator</span>
        </button>

        <button
          onClick={() => onTabChange('kb')}
          className={`flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 pb-0.5 border-b-2 ${
            activeTab === 'kb'
              ? 'text-white border-amber-400'
              : 'text-slate-400 border-transparent hover:text-slate-200'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Knowledge Ingestion</span>
        </button>

        <button
          onClick={() => onTabChange('deck')}
          className={`flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 pb-0.5 border-b-2 ${
            activeTab === 'deck'
              ? 'text-white border-amber-400'
              : 'text-slate-400 border-transparent hover:text-slate-200'
          }`}
        >
          <Presentation className="w-4 h-4" />
          <span>Slide Deck</span>
        </button>
      </nav>

      {/* Zone 3: 1 Primary Action & Preferred Language Selector */}
      <div className="flex items-center gap-3 shrink-0">
        {/* Preferred Target Language */}
        <div className="relative flex items-center gap-1.5 bg-slate-800/80 border border-slate-700/80 rounded-lg px-2.5 py-1.5 text-xs text-slate-200">
          <Globe className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <span className="text-slate-400 hidden lg:inline">Translate to:</span>
          <select
            value={preferredLanguage.code}
            onChange={(e) => {
              const selected = SUPPORTED_LANGUAGES.find((l) => l.code === e.target.value);
              if (selected) onLanguageChange(selected);
            }}
            aria-label="Preferred target language"
            className="bg-transparent text-white font-medium text-xs focus:outline-none cursor-pointer pr-1"
          >
            {SUPPORTED_LANGUAGES.map((lang) => (
              <option key={lang.code} value={lang.code} className="bg-slate-900 text-white">
                {lang.flag} {lang.name} ({lang.nativeName})
              </option>
            ))}
          </select>
        </div>

        {/* Primary Call Action */}
        <button
          onClick={onToggleCall}
          className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all shadow-sm flex items-center gap-2 whitespace-nowrap shrink-0 ${
            isCallActive
              ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 hover:bg-rose-500/30'
              : 'bg-amber-500 text-slate-950 hover:bg-amber-400'
          }`}
        >
          {isCallActive ? (
            <>
              <span className="w-2 h-2 rounded-full bg-rose-400 animate-ping" />
              <span>Leave Call</span>
            </>
          ) : (
            <>
              <Sparkles className="w-3.5 h-3.5" />
              <span>Join Call</span>
            </>
          )}
        </button>
      </div>
    </header>
  );
};

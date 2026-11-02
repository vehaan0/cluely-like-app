import React from 'react';
import { ActiveTab, AIProviderConfig } from '../types';
import { SupportedLanguage, SUPPORTED_LANGUAGES } from '../utils/translation-engine';
import {
  Globe,
  BookOpen,
  Wand2,
  Cpu,
  Mic,
  MicOff,
  Radio,
  Sun,
  Moon,
  Smartphone,
  Download,
} from 'lucide-react';

interface HeaderProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  preferredLanguage: SupportedLanguage;
  onLanguageChange: (lang: SupportedLanguage) => void;
  isListening: boolean;
  onToggleListening: () => void;
  providerConfig: AIProviderConfig;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  canInstall?: boolean;
  onInstall?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onTabChange,
  preferredLanguage,
  onLanguageChange,
  isListening,
  onToggleListening,
  providerConfig,
  theme,
  onToggleTheme,
  canInstall = false,
  onInstall,
}) => {
  return (
    <header className="sticky top-0 z-40 px-4 lg:px-8 py-2.5 backdrop-blur-2xl bg-white/85 dark:bg-[#090b12]/75 border-b border-slate-200/90 dark:border-white/[0.08] shadow-[0_4px_25px_rgba(0,0,0,0.03)] dark:shadow-[0_4px_30px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.08)] transition-colors duration-200">
      <div className="max-w-[1600px] mx-auto flex items-center justify-between gap-4">
        {/* Zone 1: Brand Wordmark: SAM */}
        <div className="flex items-center gap-3 shrink-0">
          <a
            href="#hud"
            onClick={(e) => {
              e.preventDefault();
              onTabChange('hud');
            }}
            className="text-base md:text-lg font-bold tracking-tight text-slate-900 dark:text-white whitespace-nowrap shrink-0 flex items-center gap-2.5 group"
          >
            <span className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-400 via-amber-500 to-amber-600 flex items-center justify-center text-slate-950 font-black text-sm shadow-[0_0_20px_rgba(245,158,11,0.35)] ring-1 ring-white/20 group-hover:scale-105 transition-transform">
              S
            </span>
            <div className="flex items-baseline gap-1.5">
              <span className="tracking-wide text-slate-950 dark:text-white font-extrabold text-base md:text-lg">
                SAM
              </span>
              <span className="text-[10px] tracking-wider uppercase font-bold text-amber-600 dark:text-amber-400/90 font-mono hidden sm:inline">
                PITCH COPILOT
              </span>
            </div>
          </a>
        </div>

        {/* Zone 2: Cluely & Parakeet AI Segmented Glass Navigation (Desktop) */}
        <nav className="hidden md:flex items-center bg-slate-100/90 dark:bg-white/[0.03] border border-slate-200/80 dark:border-white/[0.08] p-1 rounded-xl backdrop-blur-md">
          <button
            onClick={() => onTabChange('hud')}
            className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-medium rounded-lg transition-all ${
              activeTab === 'hud'
                ? 'bg-white dark:bg-white/[0.1] text-slate-900 dark:text-white shadow-sm border border-slate-200/80 dark:border-white/[0.1] font-bold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-white/50 dark:hover:bg-white/[0.02]'
            }`}
          >
            <Radio className={`w-3.5 h-3.5 ${activeTab === 'hud' ? 'text-amber-500 dark:text-amber-400 animate-pulse' : 'text-slate-400'}`} />
            <span>Live Audio & HUD</span>
          </button>

          <button
            onClick={() => onTabChange('generator')}
            className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-medium rounded-lg transition-all ${
              activeTab === 'generator'
                ? 'bg-white dark:bg-white/[0.1] text-slate-900 dark:text-white shadow-sm border border-slate-200/80 dark:border-white/[0.1] font-bold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-white/50 dark:hover:bg-white/[0.02]'
            }`}
          >
            <Wand2 className="w-3.5 h-3.5" />
            <span>Deck Generator</span>
          </button>

          <button
            onClick={() => onTabChange('kb')}
            className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-medium rounded-lg transition-all ${
              activeTab === 'kb'
                ? 'bg-white dark:bg-white/[0.1] text-slate-900 dark:text-white shadow-sm border border-slate-200/80 dark:border-white/[0.1] font-bold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-white/50 dark:hover:bg-white/[0.02]'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Knowledge Base</span>
          </button>

          <button
            onClick={() => onTabChange('providers')}
            className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-medium rounded-lg transition-all ${
              activeTab === 'providers'
                ? 'bg-white dark:bg-white/[0.1] text-slate-900 dark:text-white shadow-sm border border-slate-200/80 dark:border-white/[0.1] font-bold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-white/50 dark:hover:bg-white/[0.02]'
            }`}
          >
            <Cpu className="w-3.5 h-3.5" />
            <span>AI Brains</span>
          </button>
        </nav>

        {/* Zone 3: Actions, Language Picker, Theme Switcher, Audio Button */}
        <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
          {/* Target Language Dropdown */}
          <div className="relative flex items-center gap-1.5 bg-slate-100/90 dark:bg-white/[0.03] border border-slate-200/90 dark:border-white/[0.08] rounded-xl px-2.5 py-1.5 text-xs text-slate-700 dark:text-slate-200 hover:border-amber-400/50 transition-colors">
            <Globe className="w-3.5 h-3.5 text-amber-500 shrink-0" />
            <select
              value={preferredLanguage.code}
              onChange={(e) => {
                const selected = SUPPORTED_LANGUAGES.find((l) => l.code === e.target.value);
                if (selected) onLanguageChange(selected);
              }}
              aria-label="Preferred target language"
              className="bg-transparent text-slate-900 dark:text-white font-medium text-xs focus:outline-none cursor-pointer pr-1"
            >
              {SUPPORTED_LANGUAGES.map((lang) => (
                <option key={lang.code} value={lang.code} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">
                  {lang.flag} {lang.name}
                </option>
              ))}
            </select>
          </div>

          {/* Theme Toggle Button (Light Parakeet / Dark Cluely) */}
          <button
            onClick={onToggleTheme}
            aria-label="Toggle light or dark theme"
            className="p-1.5 rounded-xl bg-slate-100/90 dark:bg-white/[0.04] border border-slate-200/90 dark:border-white/[0.08] text-slate-600 dark:text-slate-300 hover:text-amber-500 transition-colors cursor-pointer"
            title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode (Parakeet AI)'}
          >
            {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4 text-amber-400" />}
          </button>

          {/* Mobile Install App Button */}
          {canInstall && (
            <button
              onClick={onInstall}
              className="hidden sm:flex items-center gap-1 px-3 py-1.5 rounded-xl bg-amber-500/15 border border-amber-500/40 text-amber-600 dark:text-amber-400 font-bold text-xs hover:bg-amber-500/25 transition-colors cursor-pointer"
              title="Install Mobile Application"
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>Install App</span>
            </button>
          )}

          {/* Master Microphone & Audio Toggle */}
          <button
            onClick={onToggleListening}
            className={`px-3 sm:px-3.5 py-1.5 text-xs font-semibold rounded-xl transition-all shadow-sm flex items-center gap-1.5 sm:gap-2 whitespace-nowrap shrink-0 border cursor-pointer ${
              isListening
                ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-500/25 shadow-[0_0_12px_rgba(16,185,129,0.15)] font-bold'
                : 'bg-slate-100 dark:bg-white/[0.05] border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            {isListening ? (
              <>
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_#10b981]" />
                <Mic className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span className="hidden sm:inline">Audio Active</span>
                <span className="sm:hidden">Live</span>
              </>
            ) : (
              <>
                <MicOff className="w-3.5 h-3.5 text-slate-400" />
                <span className="hidden sm:inline">Audio Paused</span>
                <span className="sm:hidden">Paused</span>
              </>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};

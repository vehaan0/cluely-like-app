import React, { useState } from 'react';
import { AIProviderConfig, AIProviderType } from '../types';
import {
  Cpu,
  Server,
  Zap,
  CheckCircle2,
  AlertCircle,
  Save,
  RefreshCw,
  HardDrive,
  Cloud,
  Key,
  Eye,
  EyeOff,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';

interface AIProvidersViewProps {
  config: AIProviderConfig;
  onUpdateConfig: (cfg: AIProviderConfig) => void;
}

export const AIProvidersView: React.FC<AIProvidersViewProps> = ({
  config,
  onUpdateConfig,
}) => {
  const [localConfig, setLocalConfig] = useState<AIProviderConfig>(config);
  const [showGeminiKey, setShowGeminiKey] = useState(false);
  const [showOpenRouterKey, setShowOpenRouterKey] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [customModelMode, setCustomModelMode] = useState(false);

  const [testStatus, setTestStatus] = useState<{
    provider: AIProviderType;
    status: 'idle' | 'testing' | 'success' | 'quota-exceeded' | 'error';
    latencyMs?: number;
    message?: string;
  }>({ provider: config.activeProvider, status: 'idle' });

  const handleTestConnection = async (provider: AIProviderType) => {
    setTestStatus({ provider, status: 'testing' });
    const startTime = performance.now();

    try {
      const response = await fetch('/api/ai/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider,
          config: localConfig,
        }),
      });

      const elapsed = Math.round(performance.now() - startTime);
      const data = await response.json();

      if (response.ok && data.success) {
        if (data.quotaExceeded) {
          setTestStatus({
            provider,
            status: 'quota-exceeded',
            latencyMs: elapsed,
            message: data.message || 'Free tier daily quota reached. SAM built-in local engine active.',
          });
        } else {
          setTestStatus({
            provider,
            status: 'success',
            latencyMs: elapsed,
            message: data.message || `Connected successfully (${elapsed}ms)`,
          });
        }
      } else {
        setTestStatus({
          provider,
          status: 'error',
          latencyMs: elapsed,
          message: data.error || 'Connection check failed. Ensure server, key, or local LLM is running.',
        });
      }
    } catch (err: any) {
      setTestStatus({
        provider,
        status: 'error',
        message: err.message || 'Network error connecting to provider.',
      });
    }
  };

  const handleSave = () => {
    onUpdateConfig(localConfig);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  const providers = [
    {
      id: 'gemini' as AIProviderType,
      name: 'Google Gemini',
      badge: 'Cloud Native',
      icon: Cloud,
      description: 'Ultra-low latency reasoning and speech translation powered by Gemini 3.8 Flash & Argon.',
      supportsApiKey: true,
      apiKeyField: 'customGeminiKey' as const,
      modelField: 'geminiModel',
      models: ['gemini-3.8-flash', 'gemini-4-argon', 'gemini-2.5-flash', 'gemini-2.0-flash-exp'],
      infoNote: 'Enter your personal Google Gemini API key to bypass default limits, or use the cloud runtime.',
    },
    {
      id: 'openrouter' as AIProviderType,
      name: 'OpenRouter Gateway',
      badge: 'Multi-LLM Hub',
      icon: Zap,
      description: 'Route to Claude 3.5, Llama 3.3, DeepSeek R1, or Mistral via single unified API.',
      supportsApiKey: true,
      apiKeyField: 'customOpenRouterKey' as const,
      modelField: 'openRouterModel',
      models: ['meta-llama/llama-3.3-70b-instruct', 'anthropic/claude-3.5-sonnet', 'deepseek/deepseek-r1'],
      infoNote: 'Connect your OpenRouter key (sk-or-v1-...). Keys are stored locally in your browser.',
    },
    {
      id: 'ollama' as AIProviderType,
      name: 'Ollama (Local Offline)',
      badge: 'Local Machine',
      icon: HardDrive,
      description: '100% private local execution on your Mac or PC without sending tokens to cloud.',
      supportsApiKey: false,
      modelField: 'ollamaModel',
      models: ['llama3.2', 'mistral', 'qwen2.5:7b', 'phi3'],
      endpointField: 'ollamaEndpoint',
      infoNote: 'Connects directly to your local Ollama port http://localhost:11434.',
    },
    {
      id: 'lmstudio' as AIProviderType,
      name: 'LM Studio (Local GUI)',
      badge: 'Local Machine',
      icon: Server,
      description: 'Run quantized GGUF models with Apple Silicon Metal or NVIDIA CUDA acceleration.',
      supportsApiKey: false,
      modelField: 'lmStudioModel',
      models: ['local-model'],
      endpointField: 'lmStudioEndpoint',
      infoNote: 'Connects to your local LM Studio server at http://localhost:1234/v1.',
    },
    {
      id: 'local-engine' as AIProviderType,
      name: 'SAM Grounded Engine',
      badge: 'Built-in Offline',
      icon: Sparkles,
      description: 'Deterministic semantic engine running directly on your loaded Knowledge Base with 0ms latency.',
      supportsApiKey: false,
      modelField: '',
      models: ['deterministic-retrieval'],
      infoNote: 'Completely offline and private. Requires no keys, tokens, or network connection.',
    },
  ];

  return (
    <div className="max-w-[1600px] w-full mx-auto px-4 lg:px-8 py-6 pb-24 md:pb-8 flex flex-col gap-6">
      {/* Header Banner */}
      <div className="glass-panel rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-amber-600 dark:text-amber-400 font-semibold tracking-wide uppercase">
            <Cpu className="w-4 h-4" />
            <span>AI Brain & Local Inference Hub</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight mt-1">
            Connect AI Providers & Local LLMs
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-0.5">
            Configure dynamic API keys for Gemini & OpenRouter, or run local offline models (Ollama, LM Studio).
          </p>
        </div>

        <button
          onClick={handleSave}
          className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs rounded-xl transition-all flex items-center gap-2 shadow-sm cursor-pointer shrink-0"
        >
          {saveSuccess ? <CheckCircle2 className="w-4 h-4 text-slate-950" /> : <Save className="w-4 h-4" />}
          <span>{saveSuccess ? 'Configuration Saved!' : 'Save Active Configuration'}</span>
        </button>
      </div>

      {/* Provider Selector Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {providers.map((p) => {
          const isSelected = localConfig.activeProvider === p.id;
          const IconComponent = p.icon;

          return (
            <div
              key={p.id}
              onClick={() => setLocalConfig({ ...localConfig, activeProvider: p.id })}
              className={`p-4 sm:p-5 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between ${
                isSelected
                  ? 'bg-white dark:bg-white/[0.08] border-amber-500 shadow-md ring-2 ring-amber-500/20'
                  : 'bg-white/80 dark:bg-black/30 border-slate-200 dark:border-white/[0.08] hover:border-amber-400/50'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                        isSelected
                          ? 'bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/40 shadow-xs'
                          : 'bg-slate-100 dark:bg-white/[0.05] text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      <IconComponent className="w-4 h-4" />
                    </div>
                    <span className="font-bold text-slate-900 dark:text-white text-xs sm:text-sm">{p.name}</span>
                  </div>
                  {isSelected && (
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse shadow-xs" />
                  )}
                </div>

                <div className="text-[10px] font-mono font-bold text-amber-600 dark:text-amber-400 mb-1.5">{p.badge}</div>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-4">{p.description}</p>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-white/[0.06] flex items-center justify-between text-xs">
                <span className="text-slate-500 text-[10px] font-medium">{isSelected ? 'Active Brain' : 'Click to Select'}</span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleTestConnection(p.id);
                  }}
                  className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-white/[0.05] hover:bg-slate-200 dark:hover:bg-white/[0.1] text-slate-800 dark:text-slate-200 text-[10px] font-semibold transition-colors cursor-pointer border border-slate-200 dark:border-white/10"
                >
                  Test Ping
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Provider Detailed Configuration */}
      <div className="glass-panel rounded-2xl p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-200 dark:border-white/10">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span>Configure Provider:</span>
              <span className="text-amber-600 dark:text-amber-400">
                {providers.find((p) => p.id === localConfig.activeProvider)?.name}
              </span>
            </h2>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
              Customize API keys, models, inference parameters, and local host ports dynamically.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-xl border border-emerald-500/20">
            <ShieldCheck className="w-4 h-4" />
            <span>Zero hardcoded keys · Stored locally</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Dynamic API Key Input for Google Gemini */}
          {localConfig.activeProvider === 'gemini' && (
            <div className="space-y-1.5 md:col-span-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Key className="w-3.5 h-3.5 text-amber-500" />
                  <span>Custom Google Gemini API Key (Optional)</span>
                </label>
                <span className="text-[11px] text-slate-500">Bypasses free quota limits</span>
              </div>
              <div className="relative flex items-center">
                <input
                  type={showGeminiKey ? 'text' : 'password'}
                  value={localConfig.customGeminiKey || ''}
                  onChange={(e) => setLocalConfig({ ...localConfig, customGeminiKey: e.target.value })}
                  placeholder="Paste your AIzaSy... key here (leaves default env key if blank)"
                  className="w-full bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded-xl pl-3.5 pr-10 py-2.5 text-xs text-slate-900 dark:text-white font-mono focus:outline-none focus:border-amber-500"
                />
                <button
                  type="button"
                  onClick={() => setShowGeminiKey(!showGeminiKey)}
                  className="absolute right-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                >
                  {showGeminiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-[11px] text-slate-500">
                Your key is stored securely in your browser's local storage and passed securely via proxy headers.
              </p>
            </div>
          )}

          {/* Dynamic API Key Input for OpenRouter */}
          {localConfig.activeProvider === 'openrouter' && (
            <div className="space-y-1.5 md:col-span-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Key className="w-3.5 h-3.5 text-amber-500" />
                  <span>OpenRouter API Key (sk-or-v1-...)</span>
                </label>
                <span className="text-[11px] text-slate-500">Required for live OpenRouter calls</span>
              </div>
              <div className="relative flex items-center">
                <input
                  type={showOpenRouterKey ? 'text' : 'password'}
                  value={localConfig.customOpenRouterKey || ''}
                  onChange={(e) => setLocalConfig({ ...localConfig, customOpenRouterKey: e.target.value })}
                  placeholder="sk-or-v1-xxxxxxxxxxxxxxxxxxxx"
                  className="w-full bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded-xl pl-3.5 pr-10 py-2.5 text-xs text-slate-900 dark:text-white font-mono focus:outline-none focus:border-amber-500"
                />
                <button
                  type="button"
                  onClick={() => setShowOpenRouterKey(!showOpenRouterKey)}
                  className="absolute right-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                >
                  {showOpenRouterKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-[11px] text-slate-500">
                OpenRouter proxies to Claude 3.5, Llama 3.3, and DeepSeek R1 models.
              </p>
            </div>
          )}

          {/* Endpoint Input for Ollama / LM Studio */}
          {localConfig.activeProvider === 'ollama' && (
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Ollama Daemon Endpoint URL
              </label>
              <input
                type="text"
                value={localConfig.ollamaEndpoint}
                onChange={(e) => setLocalConfig({ ...localConfig, ollamaEndpoint: e.target.value })}
                placeholder="http://localhost:11434"
                className="w-full bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2.5 text-xs text-slate-900 dark:text-white font-mono focus:outline-none focus:border-amber-500"
              />
              <span className="text-[11px] text-slate-500 mt-1 block">
                Standard local port is 11434. SAM proxies requests securely through the backend.
              </span>
            </div>
          )}

          {localConfig.activeProvider === 'lmstudio' && (
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                LM Studio Local Server Base URL
              </label>
              <input
                type="text"
                value={localConfig.lmStudioEndpoint}
                onChange={(e) => setLocalConfig({ ...localConfig, lmStudioEndpoint: e.target.value })}
                placeholder="http://localhost:1234/v1"
                className="w-full bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2.5 text-xs text-slate-900 dark:text-white font-mono focus:outline-none focus:border-amber-500"
              />
              <span className="text-[11px] text-slate-500 mt-1 block">
                Standard local port is 1234/v1 with OpenAI-compatible API format.
              </span>
            </div>
          )}

          {/* Model Name Input / Select */}
          {localConfig.activeProvider === 'gemini' && (
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Gemini Model Selection
                </label>
                <button
                  type="button"
                  onClick={() => setCustomModelMode(!customModelMode)}
                  className="text-[11px] text-amber-600 dark:text-amber-400 hover:underline cursor-pointer"
                >
                  {customModelMode ? 'Choose Preset' : 'Type Custom Model'}
                </button>
              </div>
              {customModelMode ? (
                <input
                  type="text"
                  value={localConfig.geminiModel}
                  onChange={(e) => setLocalConfig({ ...localConfig, geminiModel: e.target.value })}
                  placeholder="gemini-3.8-flash or gemini-2.5-flash"
                  className="w-full bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2.5 text-xs text-slate-900 dark:text-white font-mono focus:outline-none focus:border-amber-500"
                />
              ) : (
                <select
                  value={localConfig.geminiModel}
                  onChange={(e) => setLocalConfig({ ...localConfig, geminiModel: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-amber-500"
                >
                  <option value="gemini-3.8-flash">gemini-3.8-flash (Recommended · Ultra Fast)</option>
                  <option value="gemini-4-argon">gemini-4-argon (Complex Technical Reasoning)</option>
                  <option value="gemini-2.5-flash">gemini-2.5-flash</option>
                  <option value="gemini-2.0-flash-exp">gemini-2.0-flash-exp</option>
                </select>
              )}
            </div>
          )}

          {localConfig.activeProvider === 'openrouter' && (
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                OpenRouter Model ID
              </label>
              <input
                type="text"
                value={localConfig.openRouterModel}
                onChange={(e) => setLocalConfig({ ...localConfig, openRouterModel: e.target.value })}
                placeholder="meta-llama/llama-3.3-70b-instruct"
                className="w-full bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2.5 text-xs text-slate-900 dark:text-white font-mono focus:outline-none focus:border-amber-500"
              />
            </div>
          )}

          {localConfig.activeProvider === 'ollama' && (
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Ollama Model Tag
              </label>
              <input
                type="text"
                value={localConfig.ollamaModel}
                onChange={(e) => setLocalConfig({ ...localConfig, ollamaModel: e.target.value })}
                placeholder="llama3.2 or mistral or qwen2.5"
                className="w-full bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2.5 text-xs text-slate-900 dark:text-white font-mono focus:outline-none focus:border-amber-500"
              />
            </div>
          )}

          {localConfig.activeProvider === 'lmstudio' && (
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                LM Studio Model Identifier
              </label>
              <input
                type="text"
                value={localConfig.lmStudioModel}
                onChange={(e) => setLocalConfig({ ...localConfig, lmStudioModel: e.target.value })}
                placeholder="local-model"
                className="w-full bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2.5 text-xs text-slate-900 dark:text-white font-mono focus:outline-none focus:border-amber-500"
              />
            </div>
          )}

          {localConfig.activeProvider === 'local-engine' && (
            <div className="md:col-span-2 p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl text-xs text-slate-700 dark:text-slate-300 space-y-1">
              <div className="font-bold text-amber-800 dark:text-amber-300">Deterministic Local Grounding Engine</div>
              <p>
                Synthesizes instant sales guidance and translations directly from your active Knowledge Base documents with 0 network latency.
              </p>
            </div>
          )}

          {/* Temperature Parameter */}
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Reasoning Temperature: <span className="font-mono text-amber-600 dark:text-amber-400">{localConfig.temperature}</span>
              </label>
              <span className="text-[10px] text-slate-500">Lower = More Deterministic</span>
            </div>
            <input
              type="range"
              min={0}
              max={1}
              step={0.1}
              value={localConfig.temperature}
              onChange={(e) => setLocalConfig({ ...localConfig, temperature: parseFloat(e.target.value) })}
              className="w-full accent-amber-500 cursor-pointer"
            />
          </div>
        </div>

        {/* Live Test Status Banner */}
        {testStatus.status !== 'idle' && (
          <div
            className={`mt-4 p-4 rounded-xl border text-xs flex items-center justify-between ${
              testStatus.status === 'testing'
                ? 'bg-slate-50 dark:bg-black/30 border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300'
                : testStatus.status === 'success'
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-800 dark:text-emerald-300'
                : testStatus.status === 'quota-exceeded'
                ? 'bg-amber-500/10 border-amber-500/30 text-amber-800 dark:text-amber-300'
                : 'bg-rose-500/10 border-rose-500/30 text-rose-800 dark:text-rose-300'
            }`}
          >
            <div className="flex items-center gap-2">
              {testStatus.status === 'testing' && <RefreshCw className="w-4 h-4 animate-spin text-amber-500" />}
              {testStatus.status === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
              {testStatus.status === 'quota-exceeded' && <AlertCircle className="w-4 h-4 text-amber-500" />}
              {testStatus.status === 'error' && <AlertCircle className="w-4 h-4 text-rose-500" />}
              <div>
                <span className="font-bold">{testStatus.provider.toUpperCase()} Ping: </span>
                <span>{testStatus.message}</span>
              </div>
            </div>

            {testStatus.latencyMs && (
              <span className="font-mono text-[11px] tabular-nums bg-white dark:bg-black/40 px-2 py-0.5 rounded-md border border-slate-200 dark:border-white/10">
                {testStatus.latencyMs}ms
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

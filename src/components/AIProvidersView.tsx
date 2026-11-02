import React, { useState } from 'react';
import { AIProviderConfig, AIProviderType } from '../types';
import {
  Cpu,
  Server,
  Zap,
  CheckCircle2,
  AlertCircle,
  Save,
  Radio,
  RefreshCw,
  HardDrive,
  Cloud,
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
          message: data.error || 'Connection check failed. Ensure server or local LLM is running.',
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
  };

  const providers = [
    {
      id: 'gemini' as AIProviderType,
      name: 'Google Gemini',
      badge: 'Cloud Native',
      icon: Cloud,
      description: 'Ultra-low latency reasoning and speech translation powered by Gemini 3.8 Flash.',
      modelField: 'geminiModel',
      models: ['gemini-3.8-flash', 'gemini-4-argon'],
      endpointField: null,
      infoNote: 'Configured via GEMINI_API_KEY environment secret on the backend proxy.',
    },
    {
      id: 'openrouter' as AIProviderType,
      name: 'OpenRouter / Any LLM',
      badge: 'Cloud Gateway',
      icon: Zap,
      description: 'Route to Claude 3.5, Llama 3.3, DeepSeek R1, or Mistral via single unified API.',
      modelField: 'openRouterModel',
      models: ['meta-llama/llama-3.3-70b-instruct', 'anthropic/claude-3.5-sonnet', 'deepseek/deepseek-r1'],
      endpointField: null,
      infoNote: 'Uses server-side proxy route to keep your OpenRouter credentials protected.',
    },
    {
      id: 'ollama' as AIProviderType,
      name: 'Ollama (Local Offline)',
      badge: 'Local Machine',
      icon: HardDrive,
      description: '100% private local execution on your Mac or PC without sending tokens to cloud.',
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
      modelField: 'lmStudioModel',
      models: ['local-model'],
      endpointField: 'lmStudioEndpoint',
      infoNote: 'Connects to your local LM Studio server at http://localhost:1234/v1.',
    },
  ];

  return (
    <div className="max-w-[1600px] w-full mx-auto px-4 lg:px-8 py-6 pb-24 md:pb-8 flex flex-col gap-6">
      {/* Header Banner */}
      <div className="glass-panel rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-amber-600 dark:text-amber-400 font-semibold tracking-wide uppercase">
            <Cpu className="w-4 h-4" />
            <span>AI Brain & Local Inference Engine Hub</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight mt-1">
            Connect AI Providers & Local LLMs
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-0.5">
            Switch seamlessly between Google Gemini, OpenRouter, and local offline models (Ollama & LM Studio).
          </p>
        </div>

        <button
          onClick={handleSave}
          className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs rounded-xl transition-all flex items-center gap-2 shadow-sm cursor-pointer shrink-0"
        >
          <Save className="w-4 h-4" />
          <span>Save Active Configuration</span>
        </button>
      </div>

      {/* Provider Selector Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {providers.map((p) => {
          const isSelected = localConfig.activeProvider === p.id;
          const IconComponent = p.icon;

          return (
            <div
              key={p.id}
              onClick={() => setLocalConfig({ ...localConfig, activeProvider: p.id })}
              className={`p-5 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between ${
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
                    <span className="font-bold text-slate-900 dark:text-white text-sm">{p.name}</span>
                  </div>
                  {isSelected && (
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse shadow-xs" />
                  )}
                </div>

                <div className="text-[11px] font-mono font-bold text-amber-600 dark:text-amber-400 mb-1.5">{p.badge}</div>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-4">{p.description}</p>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-white/[0.06] flex items-center justify-between text-xs">
                <span className="text-slate-500 text-[11px] font-medium">{isSelected ? 'Active Brain' : 'Click to Select'}</span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleTestConnection(p.id);
                  }}
                  className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-white/[0.05] hover:bg-slate-200 dark:hover:bg-white/[0.1] text-slate-800 dark:text-slate-200 text-[11px] font-semibold transition-colors cursor-pointer border border-slate-200 dark:border-white/10"
                >
                  Test Connection
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Provider Detailed Configuration */}
      <div className="glass-panel rounded-2xl p-6">
        <h2 className="text-base font-bold text-slate-900 dark:text-white mb-1 flex items-center gap-2">
          <span>Configure:</span>
          <span className="text-amber-600 dark:text-amber-400">
            {providers.find((p) => p.id === localConfig.activeProvider)?.name}
          </span>
        </h2>
        <p className="text-xs text-slate-600 dark:text-slate-400 mb-6">
          Adjust the model selection, local endpoint, and inference parameters.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Gemini Model Selection
              </label>
              <select
                value={localConfig.geminiModel}
                onChange={(e) => setLocalConfig({ ...localConfig, geminiModel: e.target.value })}
                className="w-full bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-amber-500"
              >
                <option value="gemini-3.8-flash">gemini-3.8-flash (Recommended · Ultra Fast)</option>
                <option value="gemini-4-argon">gemini-4-argon (Complex Technical Reasoning)</option>
              </select>
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
            className={`mt-6 p-4 rounded-xl border text-xs flex items-center justify-between ${
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

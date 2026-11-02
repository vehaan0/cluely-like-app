import React, { useState } from 'react';
import {
  KnowledgeBase,
  PresentationSlide,
  PresentationConfig,
  GeneratedPresentation,
} from '../types';
import { generatePresentationFromKB } from '../utils/presentation-generator';
import { PresentationDeck } from './PresentationDeck';
import {
  Sparkles,
  Clock,
  UserCheck,
  CheckCircle2,
  Share2,
  Copy,
  Check,
  Download,
  Layers,
} from 'lucide-react';

interface PresentationGeneratorViewProps {
  knowledgeBase: KnowledgeBase;
  onApplyGeneratedSlides: (slides: PresentationSlide[]) => void;
  onLaunchMeetingWithDeck: (slides: PresentationSlide[]) => void;
}

export const PresentationGeneratorView: React.FC<PresentationGeneratorViewProps> = ({
  knowledgeBase,
  onApplyGeneratedSlides,
  onLaunchMeetingWithDeck,
}) => {
  const [topic, setTopic] = useState('OmniFlow AI: Enterprise Architecture & SLA Review');
  const [durationMinutes, setDurationMinutes] = useState(15);
  const [targetAudience, setTargetAudience] = useState<PresentationConfig['targetAudience']>('ciso');
  const [focusCategories, setFocusCategories] = useState<PresentationConfig['focusCategories']>([
    'architecture',
    'security',
    'pricing',
  ]);
  const [generatedDeck, setGeneratedDeck] = useState<GeneratedPresentation | null>(() =>
    generatePresentationFromKB(knowledgeBase, {
      topic: 'OmniFlow AI: Enterprise Architecture & SLA Review',
      durationMinutes: 15,
      targetAudience: 'ciso',
      focusCategories: ['architecture', 'security', 'pricing'],
    })
  );
  const [isGenerating, setIsGenerating] = useState(false);
  const [copiedMarkdown, setCopiedMarkdown] = useState(false);

  const handleCopyMarkdown = () => {
    if (!generatedDeck) return;
    const md = `# ${generatedDeck.title}
Audience: ${generatedDeck.targetAudience.toUpperCase()} | Duration: ${generatedDeck.durationMinutes} min
Generated: ${generatedDeck.createdAt}
Summary: ${generatedDeck.summary}

${generatedDeck.slides
  .map(
    (s, i) => `## Slide ${i + 1}: ${s.title}
*${s.subtitle}* (Tags: ${s.tags.join(', ')})

Key Talking Points:
${s.bullets.map((b) => `- ${b}`).join('\n')}

Key Metrics:
${s.metrics.map((m) => `- ${m.label}: ${m.value}${m.unit ? ` ${m.unit}` : ''}`).join('\n')}
`
  )
  .join('\n---\n\n')}`;
    navigator.clipboard.writeText(md);
    setCopiedMarkdown(true);
    setTimeout(() => setCopiedMarkdown(false), 2000);
  };

  const handleDownloadJson = () => {
    if (!generatedDeck) return;
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(generatedDeck, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `${topic.toLowerCase().replace(/[^a-z0-9]/g, '_')}_deck.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const presetTopics = [
    { label: '5-Min Fast Pitch', topic: 'OmniFlow AI: 5-Minute Executive Solution Pitch', duration: 5, audience: 'executive' as const },
    { label: 'Security & CISO Deep-Dive', topic: 'Enterprise Security, SOC2 & Zero-Retention Compliance', duration: 15, audience: 'ciso' as const },
    { label: 'CFO Pricing & ROI', topic: 'Commercial Tiers, TCO Reduction & 30-Day POC Terms', duration: 15, audience: 'cfo' as const },
    { label: 'CTO Technical Architecture', topic: 'High-Throughput MicroVM Architecture & Connectors', duration: 30, audience: 'cto' as const },
  ];

  const toggleCategory = (cat: 'architecture' | 'pricing' | 'security' | 'integration' | 'competitors' | 'faq') => {
    if (focusCategories.includes(cat)) {
      if (focusCategories.length > 1) {
        setFocusCategories(focusCategories.filter((c) => c !== cat));
      }
    } else {
      setFocusCategories([...focusCategories, cat]);
    }
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const response = await fetch('/api/presentation/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic,
          durationMinutes,
          targetAudience,
          focusCategories,
          knowledgeBaseContent: knowledgeBase.documents
            .map((d) => `[${d.category}] ${d.title}: ${d.content} (Key facts: ${d.keyFacts.join(', ')})`)
            .join('\n\n'),
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.slides && data.slides.length > 0) {
          const newDeck: GeneratedPresentation = {
            id: `deck-${Date.now()}`,
            title: data.title || topic,
            subtitle: data.subtitle || 'Knowledge Base Grounded Presentation',
            topic,
            targetAudience,
            durationMinutes,
            summary: data.summary || `Custom tailored deck for ${targetAudience.toUpperCase()}`,
            slides: data.slides,
            createdAt: new Date().toISOString().split('T')[0],
          };
          setGeneratedDeck(newDeck);
          onApplyGeneratedSlides(data.slides);
          setIsGenerating(false);
          return;
        }
      }
    } catch (e) {
      console.warn('Backend generation failed, using local generator:', e);
    }

    // Local generation fallback
    const deck = generatePresentationFromKB(knowledgeBase, {
      topic,
      durationMinutes,
      targetAudience,
      focusCategories,
    });
    setGeneratedDeck(deck);
    onApplyGeneratedSlides(deck.slides);
    setIsGenerating(false);
  };

  return (
    <div className="max-w-[1600px] w-full mx-auto px-4 lg:px-8 py-6 pb-24 md:pb-8 flex flex-col gap-6">
      {/* Header Banner */}
      <div className="glass-panel rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-amber-600 dark:text-amber-400 font-semibold tracking-wide uppercase">
            <Sparkles className="w-4 h-4" />
            <span>AI Presentation Generation Module</span>
            <span className="text-slate-400">·</span>
            <span className="text-slate-600 dark:text-slate-400 normal-case font-mono">Grounded directly in {knowledgeBase.name} KB</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight mt-1">
            Dynamic Pitch Deck Generator
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-0.5">
            Create structured, client-tailored slide decks formatted for Google Meet, Microsoft Teams, and Zoom.
          </p>
        </div>

        {generatedDeck && (
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleCopyMarkdown}
              className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-white/[0.05] dark:hover:bg-white/[0.1] text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-white/10 font-semibold text-xs rounded-xl transition-all flex items-center gap-1.5 shadow-sm cursor-pointer"
              title="Copy entire slide deck outline with notes in Markdown format"
            >
              {copiedMarkdown ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedMarkdown ? 'Copied Markdown' : 'Copy Markdown'}</span>
            </button>

            <button
              onClick={handleDownloadJson}
              className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-white/[0.05] dark:hover:bg-white/[0.1] text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-white/10 font-semibold text-xs rounded-xl transition-all flex items-center gap-1.5 shadow-sm cursor-pointer"
              title="Download presentation JSON format"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export JSON</span>
            </button>

            <button
              onClick={() => onLaunchMeetingWithDeck(generatedDeck.slides)}
              className="px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs rounded-xl transition-all flex items-center gap-2 shadow-md cursor-pointer"
            >
              <Share2 className="w-4 h-4" />
              <span>Present in Call</span>
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Generation Parameters */}
        <div className="lg:col-span-5 space-y-5">
          {/* Quick Presets */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
              Quick Pitch Presets
            </label>
            <div className="grid grid-cols-2 gap-2">
              {presetTopics.map((preset, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setTopic(preset.topic);
                    setDurationMinutes(preset.duration);
                    setTargetAudience(preset.audience);
                  }}
                  className={`p-3 rounded-xl border text-left text-xs transition-all cursor-pointer ${
                    topic === preset.topic
                      ? 'bg-amber-500/15 border-amber-500/50 text-slate-900 dark:text-amber-300 font-bold shadow-sm'
                      : 'bg-white dark:bg-black/30 border-slate-200 dark:border-white/[0.08] text-slate-700 dark:text-slate-300 hover:border-amber-400/50'
                  }`}
                >
                  <div className="font-semibold">{preset.label}</div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 font-mono">
                    {preset.duration} min · {preset.audience.toUpperCase()}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Topic Input */}
          <div className="glass-panel rounded-2xl p-5 space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Presentation Topic & Focus
              </label>
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g. Enterprise VPC Peering & High-Uptime SLA Guarantee"
                className="w-full bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            {/* Target Audience & Duration in 2 Columns */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1">
                  <UserCheck className="w-3.5 h-3.5 text-amber-500" />
                  <span>Audience Persona</span>
                </label>
                <select
                  value={targetAudience}
                  onChange={(e) => setTargetAudience(e.target.value as any)}
                  className="w-full bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-amber-500"
                >
                  <option value="ciso">CISO / Security Arch</option>
                  <option value="cfo">CFO / Procurement</option>
                  <option value="cto">CTO / VP Engineering</option>
                  <option value="executive">Executive / VP Ops</option>
                  <option value="general">General Enterprise</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-amber-500" />
                  <span>Call Duration</span>
                </label>
                <select
                  value={durationMinutes}
                  onChange={(e) => setDurationMinutes(Number(e.target.value))}
                  className="w-full bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-amber-500"
                >
                  <option value={5}>5 min (3 slides)</option>
                  <option value={15}>15 min (5 slides)</option>
                  <option value={30}>30 min (7 slides)</option>
                </select>
              </div>
            </div>

            {/* Knowledge Base Categories to incorporate */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                Knowledge Base Focus Categories
              </label>
              <div className="flex flex-wrap gap-1.5">
                {[
                  { id: 'architecture', label: 'Architecture' },
                  { id: 'security', label: 'Security & SOC2' },
                  { id: 'pricing', label: 'Pricing & POC' },
                  { id: 'integration', label: 'Integrations' },
                  { id: 'competitors', label: 'Competitors' },
                ].map((cat) => {
                  const isChecked = focusCategories.includes(cat.id as any);
                  return (
                    <button
                      key={cat.id}
                      onClick={() => toggleCategory(cat.id as any)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                        isChecked
                          ? 'bg-amber-500/20 text-slate-900 dark:text-amber-300 border border-amber-500/40 font-bold'
                          : 'bg-slate-100 dark:bg-black/30 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-white/[0.08] hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      {cat.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Submit generate button */}
            <button
              onClick={handleGenerate}
              disabled={isGenerating}
              className="w-full py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-2 shadow-sm disabled:opacity-50 cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              <span>{isGenerating ? 'Synthesizing Knowledge Base...' : 'Generate Structured Presentation'}</span>
            </button>
          </div>

          {/* Generated Deck Summary Card */}
          {generatedDeck && (
            <div className="glass-panel rounded-2xl p-4 text-xs space-y-2">
              <div className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>Presentation Generated Successfully</span>
              </div>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">{generatedDeck.summary}</p>
              <div className="pt-2 border-t border-slate-200 dark:border-white/10 flex items-center justify-between text-[11px] text-slate-500 font-mono">
                <span>{generatedDeck.slides.length} Slides</span>
                <span>{generatedDeck.createdAt}</span>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Live Presentation Slide Deck Preview */}
        <div className="lg:col-span-7">
          {generatedDeck ? (
            <div className="sticky top-20">
              <PresentationDeck
                slides={generatedDeck.slides}
                activeSlideId={generatedDeck.slides[0]?.id || ''}
                onSelectSlide={() => {}}
                compact={false}
              />
            </div>
          ) : (
            <div className="h-[460px] glass-panel rounded-2xl flex flex-col items-center justify-center text-slate-500 text-xs text-center p-8">
              <Layers className="w-10 h-10 text-slate-400 mb-3" />
              <p>Configure parameters on the left and click "Generate Structured Presentation".</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

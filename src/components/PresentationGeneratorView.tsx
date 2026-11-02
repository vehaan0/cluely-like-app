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
  Sliders,
  Clock,
  UserCheck,
  CheckCircle2,
  Share2,
  FileText,
  RotateCcw,
  Layers,
  ArrowRight,
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
      // Call server presentation endpoint
      const response = await fetch('/api/presentations/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic,
          durationMinutes,
          targetAudience,
          focusCategories,
          knowledgeBase,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.presentation) {
          setGeneratedDeck(data.presentation);
          onApplyGeneratedSlides(data.presentation.slides);
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
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-xs text-amber-400 font-semibold tracking-wide uppercase">
            <Sparkles className="w-4 h-4" />
            <span>AI Presentation Generation Module</span>
            <span className="text-slate-600">·</span>
            <span className="text-slate-400 normal-case font-normal">Grounded directly in {knowledgeBase.name} KB</span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight mt-1">
            Dynamic Pitch Deck Generator
          </h1>
          <p className="text-sm text-slate-400 mt-0.5">
            Create structured, client-tailored slide decks formatted for Google Meet, Microsoft Teams, and Zoom.
          </p>
        </div>

        {generatedDeck && (
          <button
            onClick={() => onLaunchMeetingWithDeck(generatedDeck.slides)}
            className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-lg transition-all flex items-center gap-2 shadow-lg"
          >
            <Share2 className="w-4 h-4" />
            <span>Present This Deck in Call</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-6">
        {/* Left Column: Generation Parameters */}
        <div className="lg:col-span-5 space-y-5">
          {/* Quick Presets */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
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
                  className={`p-2.5 rounded-lg border text-left text-xs transition-colors ${
                    topic === preset.topic
                      ? 'bg-amber-500/10 border-amber-500/50 text-amber-300'
                      : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <div className="font-semibold">{preset.label}</div>
                  <div className="text-[11px] text-slate-400 mt-0.5 font-mono">
                    {preset.duration} min · {preset.audience.toUpperCase()}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Topic Input */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Presentation Topic & Focus
              </label>
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g. Enterprise VPC Peering & High-Uptime SLA Guarantee"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
              />
            </div>

            {/* Target Audience & Duration in 2 Columns */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1">
                  <UserCheck className="w-3.5 h-3.5 text-amber-400" />
                  <span>Audience Persona</span>
                </label>
                <select
                  value={targetAudience}
                  onChange={(e) => setTargetAudience(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                >
                  <option value="ciso">CISO / Security Arch</option>
                  <option value="cfo">CFO / Procurement</option>
                  <option value="cto">CTO / VP Engineering</option>
                  <option value="executive">Executive / VP Ops</option>
                  <option value="general">General Enterprise</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-amber-400" />
                  <span>Call Duration</span>
                </label>
                <select
                  value={durationMinutes}
                  onChange={(e) => setDurationMinutes(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                >
                  <option value={5}>5 min (3 slides)</option>
                  <option value={15}>15 min (5 slides)</option>
                  <option value={30}>30 min (7 slides)</option>
                </select>
              </div>
            </div>

            {/* Knowledge Base Categories to incorporate */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-2">
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
                      className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                        isChecked
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                          : 'bg-slate-950 text-slate-400 border border-slate-800 hover:text-white'
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
              className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-lg transition-colors flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4" />
              <span>{isGenerating ? 'Synthesizing Knowledge Base...' : 'Generate Structured Presentation'}</span>
            </button>
          </div>

          {/* Generated Deck Summary Card */}
          {generatedDeck && (
            <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 text-xs space-y-2">
              <div className="font-semibold text-white flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Presentation Generated Successfully</span>
              </div>
              <p className="text-slate-400 leading-relaxed">{generatedDeck.summary}</p>
              <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-500 font-mono">
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
            <div className="h-[460px] bg-slate-900 border border-slate-800 rounded-xl flex flex-col items-center justify-center text-slate-400 text-xs text-center p-8">
              <Layers className="w-10 h-10 text-slate-600 mb-3" />
              <p>Configure parameters on the left and click "Generate Structured Presentation".</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

import React from 'react';
import { PresentationSlide } from '../types';
import {
  ChevronLeft,
  ChevronRight,
  Maximize2,
  ShieldCheck,
  Cpu,
  Layers,
  TrendingUp,
  DollarSign,
  Share2,
} from 'lucide-react';

interface PresentationDeckProps {
  slides: PresentationSlide[];
  activeSlideId: string;
  onSelectSlide: (slideId: string) => void;
  isSharingScreen?: boolean;
  onToggleScreenShare?: () => void;
  compact?: boolean;
}

export const PresentationDeck: React.FC<PresentationDeckProps> = ({
  slides,
  activeSlideId,
  onSelectSlide,
  isSharingScreen = false,
  onToggleScreenShare,
  compact = false,
}) => {
  const currentIndex = Math.max(
    0,
    slides.findIndex((s) => s.id === activeSlideId)
  );
  const currentSlide = slides[currentIndex] || slides[0];

  const handlePrev = () => {
    if (currentIndex > 0) {
      onSelectSlide(slides[currentIndex - 1].id);
    }
  };

  const handleNext = () => {
    if (currentIndex < slides.length - 1) {
      onSelectSlide(slides[currentIndex + 1].id);
    }
  };

  const renderDiagram = (slide: PresentationSlide) => {
    switch (slide.diagramType) {
      case 'architecture':
        return (
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 my-4">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-3 pb-2 border-b border-slate-800">
              <span className="flex items-center gap-1.5 font-medium text-slate-300">
                <Cpu className="w-3.5 h-3.5 text-amber-400" /> Distributed MicroVM Architecture
              </span>
              <span className="font-mono text-emerald-400">Isolated VPC Boundary</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
              <div className="bg-slate-950 border border-slate-800 rounded-lg p-3">
                <div className="text-amber-400 font-semibold mb-1">Inbound Traffic Gateway</div>
                <div className="text-slate-400 text-xs">TLS 1.3 · mTLS Authentication · Webhook Ingestion</div>
                <div className="mt-2 text-emerald-400 font-mono text-[11px]">&lt;2ms Edge Latency</div>
              </div>
              <div className="bg-slate-950 border border-amber-500/30 rounded-lg p-3 relative">
                <div className="text-white font-semibold mb-1 flex items-center justify-between">
                  <span>MicroVM Agent Swarm</span>
                  <span className="text-[10px] bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded">Active</span>
                </div>
                <div className="text-slate-400 text-xs">250,000 Concurrent Task Threads · Sub-15ms Boot</div>
                <div className="mt-2 text-amber-400 font-mono text-[11px]">Zero-lock Actor Fabric</div>
              </div>
              <div className="bg-slate-950 border border-slate-800 rounded-lg p-3">
                <div className="text-sky-400 font-semibold mb-1">State & Persistence</div>
                <div className="text-slate-400 text-xs">Redis Cluster + Kafka Log + Encrypted KMS Storage</div>
                <div className="mt-2 text-slate-300 font-mono text-[11px]">Zero Prompt Retention</div>
              </div>
            </div>
          </div>
        );

      case 'pricing-matrix':
        return (
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 my-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="bg-slate-950 border border-slate-800 rounded-lg p-3 text-xs">
                <div className="text-slate-400">Team Edition</div>
                <div className="text-xl font-bold text-white mt-1 font-mono tabular-nums">$1,400<span className="text-xs text-slate-400 font-normal">/mo</span></div>
                <div className="text-slate-400 text-[11px] mt-2">500,000 Executions · 99.9% SLA</div>
              </div>
              <div className="bg-slate-950 border border-amber-500/40 rounded-lg p-3 text-xs ring-1 ring-amber-500/20">
                <div className="text-amber-400 font-medium">Enterprise Pro (Recommended)</div>
                <div className="text-xl font-bold text-white mt-1 font-mono tabular-nums">$4,800<span className="text-xs text-slate-400 font-normal">/mo</span></div>
                <div className="text-slate-300 text-[11px] mt-2">5,000,000 Executions · 99.99% SLA · Dedicated VPC</div>
              </div>
              <div className="bg-slate-950 border border-slate-800 rounded-lg p-3 text-xs">
                <div className="text-slate-400">Global Scale</div>
                <div className="text-xl font-bold text-white mt-1 font-mono tabular-nums">$12,500<span className="text-xs text-slate-400 font-normal">/mo</span></div>
                <div className="text-slate-400 text-[11px] mt-2">Multi-Region Active-Active · 99.995% Fin-Backed SLA</div>
              </div>
            </div>
          </div>
        );

      case 'security-shield':
        return (
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 my-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 text-xs">
              <div className="bg-slate-950 border border-slate-800 rounded-lg p-2.5 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
                <div>
                  <div className="font-semibold text-white">SOC2 Type II</div>
                  <div className="text-[11px] text-slate-400">Certified Annually</div>
                </div>
              </div>
              <div className="bg-slate-950 border border-slate-800 rounded-lg p-2.5 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
                <div>
                  <div className="font-semibold text-white">ISO 27001</div>
                  <div className="text-[11px] text-slate-400">Global Standard</div>
                </div>
              </div>
              <div className="bg-slate-950 border border-slate-800 rounded-lg p-2.5 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
                <div>
                  <div className="font-semibold text-white">HIPAA & GDPR</div>
                  <div className="text-[11px] text-slate-400">Zero Retention</div>
                </div>
              </div>
              <div className="bg-slate-950 border border-slate-800 rounded-lg p-2.5 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
                <div>
                  <div className="font-semibold text-white">BYOK Encryption</div>
                  <div className="text-[11px] text-slate-400">AES-256 at Rest</div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'benchmark':
        return (
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 my-4">
            <div className="space-y-2 text-xs">
              <div>
                <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                  <span>OmniFlow AI Execution Latency</span>
                  <span className="font-mono text-emerald-400">14ms (P99)</span>
                </div>
                <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden">
                  <div className="bg-emerald-500 h-full rounded-full" style={{ width: '15%' }} />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                  <span>Legacy Enterprise iPaaS (Workato / MuleSoft)</span>
                  <span className="font-mono text-rose-400">320ms - 1,200ms</span>
                </div>
                <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden">
                  <div className="bg-rose-500/70 h-full rounded-full" style={{ width: '85%' }} />
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return (
          <div className="bg-slate-900/50 border border-slate-800/80 rounded-xl p-4 my-3 text-xs text-slate-300">
            <div className="flex items-center gap-2 text-amber-400 mb-2 font-medium">
              <Layers className="w-4 h-4" /> Connected Enterprise Flow
            </div>
            <p className="text-slate-400 leading-relaxed">
              Real-time synchronization across legacy databases, ERP systems, and modern AI agent swarms with zero data leakage.
            </p>
          </div>
        );
    }
  };

  return (
    <div
      className={`flex flex-col bg-slate-950 border border-slate-800 rounded-xl overflow-hidden ${
        compact ? 'h-full' : 'shadow-xl'
      }`}
    >
      {/* Deck Toolbar */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-slate-900/90 border-b border-slate-800 text-xs">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-white">Product Pitch Deck</span>
          <span className="text-slate-500">·</span>
          <span className="font-mono text-slate-400 tabular-nums">
            Slide {currentIndex + 1} of {slides.length}
          </span>
          {isSharingScreen && (
            <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded text-[11px] font-medium flex items-center gap-1">
              <Share2 className="w-3 h-3" /> Screen Shared to Meet
            </span>
          )}
        </div>

        <div className="flex items-center gap-1">
          {onToggleScreenShare && (
            <button
              onClick={onToggleScreenShare}
              className={`px-2.5 py-1 rounded text-xs font-medium transition-colors flex items-center gap-1.5 ${
                isSharingScreen
                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 hover:bg-rose-500/30'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
              }`}
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>{isSharingScreen ? 'Stop Sharing' : 'Share to Meet'}</span>
            </button>
          )}

          <div className="flex items-center gap-1 ml-2">
            <button
              onClick={handlePrev}
              disabled={currentIndex === 0}
              aria-label="Previous slide"
              className="p-1 rounded bg-slate-800 text-slate-300 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={handleNext}
              disabled={currentIndex === slides.length - 1}
              aria-label="Next slide"
              className="p-1 rounded bg-slate-800 text-slate-300 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Slide Canvas */}
      <div className="flex-1 p-6 flex flex-col justify-between bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-mono text-amber-400 uppercase tracking-wider font-semibold">
              Slide 0{currentSlide.number}
            </span>
            <span className="text-slate-600">·</span>
            <span className="text-xs text-slate-400 capitalize">{currentSlide.diagramType}</span>
          </div>

          <h2 className="text-xl md:text-2xl font-bold text-white tracking-tight leading-snug">
            {currentSlide.title}
          </h2>
          <p className="text-sm text-slate-300 mt-1 mb-4">{currentSlide.subtitle}</p>

          {/* Diagram / Visual block */}
          {renderDiagram(currentSlide)}

          {/* Bullets */}
          <div className="space-y-2 mt-4">
            {currentSlide.bullets.map((bullet, idx) => (
              <div key={idx} className="flex items-start gap-2.5 text-xs text-slate-300 leading-relaxed">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 shrink-0" />
                <span>{bullet}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Metrics Footer */}
        <div className="grid grid-cols-3 gap-3 pt-5 mt-6 border-t border-slate-800/80">
          {currentSlide.metrics.map((m, idx) => (
            <div key={idx} className="bg-slate-900/60 border border-slate-800 rounded-lg p-3">
              <div className="text-[11px] text-slate-400">{m.label}</div>
              <div className="text-lg font-bold text-white font-mono tabular-nums mt-0.5">
                {m.value}
                {m.unit && <span className="text-xs font-normal text-amber-400 ml-0.5">{m.unit}</span>}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Thumbnails rail */}
      <div className="flex items-center gap-2 p-2 bg-slate-950 border-t border-slate-800 overflow-x-auto">
        {slides.map((s, idx) => (
          <button
            key={s.id}
            onClick={() => onSelectSlide(s.id)}
            className={`px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap transition-all flex items-center gap-1.5 ${
              s.id === activeSlideId
                ? 'bg-amber-500 text-slate-950 font-semibold shadow-sm'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <span className="font-mono text-[10px]">0{idx + 1}</span>
            <span className="truncate max-w-[120px]">{s.title.split(':')[0]}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

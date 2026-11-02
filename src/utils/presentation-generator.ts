import { KnowledgeBase, PresentationSlide, KBDocument } from './kb-engine';

export interface PresentationConfig {
  topic: string;
  durationMinutes: number; // e.g. 5, 15, 30
  targetAudience: 'ciso' | 'cfo' | 'cto' | 'executive' | 'general';
  focusCategories: Array<'architecture' | 'pricing' | 'security' | 'integration' | 'competitors' | 'faq'>;
}

export interface GeneratedPresentation {
  id: string;
  title: string;
  subtitle: string;
  topic?: string;
  durationMinutes: number;
  targetAudience: string;
  createdAt: string;
  slides: PresentationSlide[];
  summary: string;
}

// Generate structured slides based on KB docs and parameters
export function generatePresentationFromKB(
  kb: KnowledgeBase,
  config: PresentationConfig
): GeneratedPresentation {
  const { topic, durationMinutes, targetAudience, focusCategories } = config;

  // Determine slide count: ~1.5 - 2 minutes per slide
  let slideCount = 4;
  if (durationMinutes <= 5) {
    slideCount = 3;
  } else if (durationMinutes <= 15) {
    slideCount = 5;
  } else {
    slideCount = 7;
  }

  // Filter or prioritize relevant documents
  const relevantDocs = kb.documents.filter((doc) => {
    if (focusCategories.length > 0 && !focusCategories.includes(doc.category)) {
      return false;
    }
    return true;
  });

  const docsToUse = relevantDocs.length > 0 ? relevantDocs : kb.documents;

  const slides: PresentationSlide[] = [];

  // Slide 1: Executive Title & Pitch Overview
  slides.push({
    id: `slide-gen-1`,
    number: 1,
    title: topic || `${kb.name}: Executive Solution Brief`,
    subtitle: `Tailored for ${targetAudience.toUpperCase()} · ${durationMinutes} Minute Presentation`,
    bullets: [
      `Engineered directly to solve core enterprise bottlenecks with ${kb.name}`,
      `Grounded in verified documentation and production benchmarks`,
      `Deliver immediate time-to-value with guaranteed enterprise SLA`,
    ],
    metrics: [
      { label: 'Uptime SLA', value: '99.99', unit: '%' },
      { label: 'Avg Latency', value: '<15', unit: 'ms' },
      { label: 'Integrations', value: '180', unit: '+' },
    ],
    diagramType: 'pipeline',
    tags: ['executive', 'overview', 'intro', topic.toLowerCase()],
  });

  // Intermediate slides based on selected docs and audience
  let slideNumber = 2;
  for (const doc of docsToUse) {
    if (slides.length >= slideCount) break;

    let diagramType: PresentationSlide['diagramType'] = 'pipeline';
    if (doc.category === 'architecture') diagramType = 'architecture';
    else if (doc.category === 'pricing') diagramType = 'pricing-matrix';
    else if (doc.category === 'security') diagramType = 'security-shield';
    else if (doc.category === 'competitors') diagramType = 'benchmark';

    // Tailor bullets based on audience
    const audiencePrefix =
      targetAudience === 'ciso'
        ? '[Governance & Audit] '
        : targetAudience === 'cfo'
        ? '[Financial ROI] '
        : targetAudience === 'cto'
        ? '[Technical Spec] '
        : '';

    const slideBullets = doc.keyFacts.slice(0, 3).map((f) => `${audiencePrefix}${f}`);

    slides.push({
      id: `slide-gen-${slideNumber}`,
      number: slideNumber,
      title: doc.title,
      subtitle: `Key findings and specifications from ${kb.name} knowledge base`,
      bullets:
        slideBullets.length > 0
          ? slideBullets
          : [
              `${audiencePrefix}Enterprise capability: ${doc.title}`,
              'Sub-second deterministic execution guarantees',
              'Turnkey adoption without vendor lock-in',
            ],
      metrics:
        doc.category === 'pricing'
          ? [
              { label: 'Annual Discount', value: '20', unit: '%' },
              { label: 'POC Credit', value: '100', unit: '%' },
              { label: 'Payback', value: '<4', unit: 'mo' },
            ]
          : doc.category === 'security'
          ? [
              { label: 'SOC2 Type II', value: 'Verified' },
              { label: 'Encryption', value: 'AES-256' },
              { label: 'Prompt Retention', value: '0', unit: 'days' },
            ]
          : [
              { label: 'Concurrency', value: '250', unit: 'k' },
              { label: 'Cold Start', value: '<15', unit: 'ms' },
              { label: 'Uptime', value: '99.99', unit: '%' },
            ],
      diagramType,
      tags: [doc.category, targetAudience],
    });

    slideNumber++;
  }

  // Ensure minimum slides reached
  while (slides.length < slideCount && slideNumber <= 7) {
    slides.push({
      id: `slide-gen-${slideNumber}`,
      number: slideNumber,
      title: `${kb.name}: Operational Milestones & Next Steps`,
      subtitle: `Commercial and technical onboarding timeline`,
      bullets: [
        'Kick off 30-day proof of concept with dedicated solution engineering support',
        'Direct VPC integration and configuration verification in under 48 hours',
        '100% of proof of concept fee credited toward annual enterprise license',
      ],
      metrics: [
        { label: 'POC Window', value: '30', unit: 'days' },
        { label: 'Credit Transfer', value: '100', unit: '%' },
        { label: 'Deployment', value: '48', unit: 'hrs' },
      ],
      diagramType: 'benchmark',
      tags: ['closing', 'next-steps', 'commercial'],
    });
    slideNumber++;
  }

  return {
    id: `pres-${Date.now()}`,
    title: topic || `${kb.name} Pitch Deck`,
    subtitle: `${durationMinutes}-minute pitch for ${targetAudience.toUpperCase()}`,
    durationMinutes,
    targetAudience,
    createdAt: new Date().toISOString().split('T')[0],
    slides,
    summary: `Structured presentation with ${slides.length} slides generated from ${docsToUse.length} knowledge base documents, tailored for ${targetAudience.toUpperCase()} stakeholders.`,
  };
}

export interface KBDocument {
  id: string;
  title: string;
  category: 'architecture' | 'pricing' | 'security' | 'integration' | 'faq' | 'competitors' | string;
  content: string;
  keyFacts: string[];
  suggestedSlideId?: string;
  lastUpdated?: string;
}

export interface PresentationSlide {
  id: string;
  number: number;
  title: string;
  subtitle: string;
  bullets: string[];
  metrics: { label: string; value: string; unit?: string }[];
  diagramType: 'pipeline' | 'architecture' | 'pricing-matrix' | 'security-shield' | 'benchmark';
  tags: string[];
}

export interface KnowledgeBase {
  id: string;
  name: string;
  tagline: string;
  productType: string;
  documents: KBDocument[];
  slides: PresentationSlide[];
}

export interface CopilotCueCard {
  id: string;
  triggerTranscript: string;
  verbatimAnswer: string;
  deliveryGuidance: {
    tone: string;
    pacing: string;
    emphasisKeywords: string[];
  };
  timingCue: {
    whenToSpeak: string;
    conversationPhase: 'discovery' | 'objection-defusal' | 'technical-qualification' | 'commercial-closing';
    urgencyLevel: 'high' | 'medium' | 'calm';
  };
  followUpQuestion: string;
  talkingPoints: string[];
  relevantSlideId: string;
  relevantSlideTitle: string;
  objectionDefuser: string;
  groundedQuotes: string[];
  confidence: number;
  timestamp: string;
}

export interface TranscriptItem {
  id: string;
  speaker: string;
  speakerRole: string;
  originalText: string;
  sourceLanguage: string;
  translatedText: string;
  targetLanguage: string;
  timestamp: string;
  isUser: boolean;
  cueCard?: CopilotCueCard;
}

export interface MeetingScenario {
  id: string;
  title: string;
  counterpartyName: string;
  counterpartyTitle: string;
  counterpartyCompany: string;
  counterpartyLocation: string;
  nativeLanguage: string;
  nativeLanguageCode: string;
  avatarSeed: string;
  isCustom?: boolean;
  dialogueSteps: {
    speakerText: string;
    englishTranslation: string;
    expectedTopic: string;
    delayMs: number;
  }[];
}

// Default Enterprise Knowledge Base: OmniFlow AI
export const DEFAULT_KB_OMNIFLOW: KnowledgeBase = {
  id: 'kb-omniflow',
  name: 'OmniFlow AI',
  tagline: 'Autonomous Enterprise Workflow & Multi-Agent Orchestration Platform',
  productType: 'Enterprise Infrastructure SaaS',
  documents: [
    {
      id: 'doc-arch',
      title: 'Platform Architecture & Distributed Agent Runtime',
      category: 'architecture',
      content: `OmniFlow runs an event-driven distributed actor architecture. Each workflow step executes in isolated microVM containers with sub-15ms cold start times. The system natively handles up to 250,000 parallel agent tasks per cluster with zero lock contention. Backed by Apache Kafka, Redis cluster for state caching, and PostgreSQL for audit logs. Works fully air-gapped on customer AWS VPC, Google Cloud, or on-premise Kubernetes.`,
      keyFacts: [
        'Sub-15ms microVM execution latency',
        'Scales to 250,000 concurrent agent threads per cluster',
        'Deployable via Helm chart on AWS, GCP, Azure, or air-gapped on-premise',
        'Zero vendor lock-in with open-standard workflow specs',
      ],
      suggestedSlideId: 'slide-2',
      lastUpdated: '2026-10-15',
    },
    {
      id: 'doc-pricing',
      title: 'Commercial Tiers, Pricing Model & Volume Discounting',
      category: 'pricing',
      content: `OmniFlow operates on three primary commercial plans:
1. Team Edition: $1,400/month, up to 50 active workflows, 500,000 executions, standard 99.9% uptime SLA.
2. Enterprise Pro: $4,800/month, unlimited workflows, 5,000,000 executions, dedicated VPC cluster, 99.99% SLA, 1-hour priority support response.
3. Global Scale: Custom negotiated (starts at $12,500/month), multi-region active-active deployment, dedicated solutions engineer, bespoke connectors, unlimited executions, and 99.995% uptime financial guarantee.
Annual contracts receive a 20% discount. Enterprise POC pilots are offered at a flat $5,000 for 30 days, fully credited toward the annual agreement upon signing.`,
      keyFacts: [
        'Team: $1,400/mo | Enterprise: $4,800/mo | Global Scale: from $12,500/mo',
        '20% discount on upfront annual commitments',
        '30-day proof of concept credited 100% toward annual license',
        'Financial penalties if uptime drops below 99.99%',
      ],
      suggestedSlideId: 'slide-5',
      lastUpdated: '2026-10-28',
    },
    {
      id: 'doc-security',
      title: 'Enterprise Security, Compliance & Data Governance',
      category: 'security',
      content: `OmniFlow is certified SOC2 Type II, ISO 27001, HIPAA compliant, and GDPR verified. All customer data and workflow payloads are encrypted in transit via TLS 1.3 with mTLS for internal microservices, and encrypted at rest with customer-managed AWS KMS / GCP Cloud KMS keys (AES-256). OmniFlow never stores prompt inputs or customer payloads after execution unless explicit audit logging is enabled by the customer CISO. Single Sign-On (SSO) supports Okta, Azure AD, Ping Identity, and Google Workspace with granular RBAC and SCIM user provisioning.`,
      keyFacts: [
        'SOC2 Type II, ISO 27001, HIPAA & GDPR compliant',
        'BYOK (Bring Your Own Keys) with AES-256 encryption at rest and mTLS in transit',
        'Okta / Azure AD / Google Workspace SSO with SCIM v2 provisioning',
        'Zero retention policy for LLM prompts and inference buffers',
      ],
      suggestedSlideId: 'slide-4',
      lastUpdated: '2026-11-01',
    },
    {
      id: 'doc-integrations',
      title: 'Enterprise Connectors & API Specifications',
      category: 'integration',
      content: `Includes over 180 pre-built enterprise connectors: Salesforce, ServiceNow, SAP S/4HANA, Workday, Snowflake, Databricks, Jira, Slack, Microsoft Teams, and HubSpot. Custom connectors can be authored in TypeScript or Python with hot-reload in under 10 minutes. Comprehensive REST, GraphQL, and gRPC APIs with bidirectional webhooks and dead-letter queue recovery.`,
      keyFacts: [
        '180+ out-of-the-box connectors including SAP, ServiceNow, and Salesforce',
        'Custom connector SDK with TypeScript and Python support',
        'Bidirectional webhook streaming with automatic dead-letter retry',
        'Full REST & gRPC API with OpenAPI 3.1 specifications',
      ],
      suggestedSlideId: 'slide-3',
      lastUpdated: '2026-09-20',
    },
    {
      id: 'doc-competitors',
      title: 'Competitive Differentiation vs Zapier, Workato & LangChain',
      category: 'competitors',
      content: `Compared to Zapier Central / Make.com: OmniFlow is built specifically for low-latency stateful agents and secure VPC data boundaries, whereas Zapier is consumer/SMB oriented without on-premise execution or mTLS.
Compared to Workato: OmniFlow offers modern native LLM reasoning, code-first multi-agent orchestration, and costs 60% less without hidden per-recipe penalty fees.
Compared to DIY LangChain / CrewAI: OmniFlow provides enterprise resilience, human-in-the-loop audit gates, automated rollback, and 99.99% SLA without having to maintain fragile custom Python pipelines.`,
      keyFacts: [
        '60% lower total cost of ownership compared to legacy Workato licensing',
        'Enterprise VPC isolation and air-gapped on-premise options unlike Zapier',
        'Built-in human-in-the-loop review checkpoints for regulatory safety',
        'Automated state rollbacks on agent failures',
      ],
      suggestedSlideId: 'slide-6',
      lastUpdated: '2026-10-30',
    },
  ],
  slides: [
    {
      id: 'slide-1',
      number: 1,
      title: 'OmniFlow AI: Autonomous Enterprise Orchestration',
      subtitle: 'Bridging deterministic enterprise systems with multi-agent intelligence',
      bullets: [
        'Single pane of glass for enterprise workflow automation and autonomous agent execution',
        'Designed from Day 1 for strict VPC boundaries and zero data leakage',
        'Reduces complex cross-department process latency from days to sub-second execution',
      ],
      metrics: [
        { label: 'Avg Latency', value: '14', unit: 'ms' },
        { label: 'Uptime SLA', value: '99.99', unit: '%' },
        { label: 'Connectors', value: '180', unit: '+' },
      ],
      diagramType: 'pipeline',
      tags: ['overview', 'intro', 'mission', 'value', 'summary'],
    },
    {
      id: 'slide-2',
      number: 2,
      title: 'High-Throughput MicroVM Architecture',
      subtitle: 'Isolated actor execution with zero lock contention across 250k threads',
      bullets: [
        'Each agent runs in hardened Firecracker microVM with sub-15ms boot cycle',
        'Redis Cluster state fabric with Kafka log persistence',
        'Multi-cloud deployment: AWS, Google Cloud, Azure, and air-gapped on-prem Kubernetes',
      ],
      metrics: [
        { label: 'Max Concurrency', value: '250', unit: 'k' },
        { label: 'Cold Start', value: '<15', unit: 'ms' },
        { label: 'Throughput', value: '45k', unit: 'ops/s' },
      ],
      diagramType: 'architecture',
      tags: ['architecture', 'infrastructure', 'vpc', 'kubernetes', 'scalability', 'performance', 'latency'],
    },
    {
      id: 'slide-3',
      number: 3,
      title: 'Unified Enterprise Integrations & Connectors',
      subtitle: '180+ turnkey connectors with sub-second bi-directional sync',
      bullets: [
        'Deep bi-directional sync with SAP S/4HANA, Salesforce, ServiceNow, and Snowflake',
        'Author custom micro-actions in Python or TypeScript with zero downtime deploy',
        'Dead-letter queues and automated exponential backoff on third-party API rate limits',
      ],
      metrics: [
        { label: 'Prebuilt Connectors', value: '184' },
        { label: 'Sync Frequency', value: 'Real-time' },
        { label: 'Custom SDK', value: 'TS & Py' },
      ],
      diagramType: 'pipeline',
      tags: ['integration', 'connectors', 'sap', 'salesforce', 'servicenow', 'api', 'webhooks'],
    },
    {
      id: 'slide-4',
      number: 4,
      title: 'Enterprise Security, Compliance & Governance',
      subtitle: 'Zero data retention, BYOK encryption, and banking-grade audit logs',
      bullets: [
        'Full SOC2 Type II, ISO 27001, HIPAA & GDPR compliance validated annually',
        'Bring-Your-Own-Key (BYOK) AES-256 encryption at rest and mTLS 1.3 in transit',
        'Zero retention policy: LLM prompt context is purged immediately following step completion',
      ],
      metrics: [
        { label: 'Compliance', value: 'SOC2 / HIPAA / GDPR' },
        { label: 'Encryption', value: 'AES-256' },
        { label: 'Data Retention', value: '0', unit: 'days' },
      ],
      diagramType: 'security-shield',
      tags: ['security', 'compliance', 'soc2', 'hipaa', 'gdpr', 'encryption', 'sso', 'okta', 'governance'],
    },
    {
      id: 'slide-5',
      number: 5,
      title: 'Transparent Commercial Tiers & Fast ROI',
      subtitle: 'Predictable pricing without punitive per-step overages',
      bullets: [
        'Team Edition: $1,400/mo (500k executions) | Enterprise Pro: $4,800/mo (5M executions)',
        'Global Scale: $12,500/mo with custom multi-region active-active VPC clusters',
        '30-day proof of concept credited 100% toward annual software license',
      ],
      metrics: [
        { label: 'Annual Discount', value: '20', unit: '%' },
        { label: 'POC Credit', value: '100', unit: '%' },
        { label: 'Typical Payback', value: '<4', unit: 'months' },
      ],
      diagramType: 'pricing-matrix',
      tags: ['pricing', 'cost', 'tiers', 'roi', 'commercial', 'contract', 'discount', 'poc', 'license'],
    },
    {
      id: 'slide-6',
      number: 6,
      title: 'Competitive Superiority & Rapid Migration',
      subtitle: 'Why Fortune 500 enterprises migrate away from legacy iPaaS',
      bullets: [
        '60% lower total cost of ownership compared to legacy Workato & MuleSoft pricing models',
        'True multi-agent reasoning, state checkpoints, and automated rollback workflows',
        'Turnkey migration tool imports 90% of existing workflows automatically in 48 hours',
      ],
      metrics: [
        { label: 'TCO Reduction', value: '60', unit: '%' },
        { label: 'Migration Time', value: '48', unit: 'hours' },
        { label: 'Rollback Reliability', value: '100', unit: '%' },
      ],
      diagramType: 'benchmark',
      tags: ['competitors', 'workato', 'zapier', 'mulesoft', 'langchain', 'comparison', 'migration'],
    },
  ],
};

// Search & Scoring logic for Knowledge Base Retrieval
export function searchKnowledgeBase(
  kb: KnowledgeBase,
  query: string
): {
  topDoc: KBDocument;
  score: number;
  relevantSlide: PresentationSlide;
  matchedKeywords: string[];
} {
  // Gracefully handle empty or custom Knowledge Base
  if (!kb.documents || kb.documents.length === 0) {
    const fallbackDoc: KBDocument = {
      id: 'doc-blank',
      title: `${kb.name} Overview`,
      category: 'architecture',
      content: `${kb.name}: ${kb.tagline || 'Custom Product Knowledge Base'}. Add or upload documents to expand live pitch coaching.`,
      keyFacts: [`${kb.name} product overview`, kb.tagline || 'Enterprise platform readiness'],
    };
    const fallbackSlide: PresentationSlide = kb.slides?.[0] || {
      id: 'slide-1',
      number: 1,
      title: kb.name,
      subtitle: kb.tagline || 'Product Overview',
      bullets: ['Live translation & transcription', 'Grounded sales coaching'],
      metrics: [{ label: 'Readiness', value: '100', unit: '%' }],
      diagramType: 'architecture',
      tags: ['overview'],
    };
    return {
      topDoc: fallbackDoc,
      score: 10,
      relevantSlide: fallbackSlide,
      matchedKeywords: ['overview'],
    };
  }

  const normalizedQuery = query.toLowerCase();
  const queryTokens = normalizedQuery
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter((t) => t.length > 2);

  let bestDoc = kb.documents[0];
  let highestScore = -1;
  let bestKeywords: string[] = [];

  for (const doc of kb.documents) {
    let score = 0;
    const currentMatched: string[] = [];
    const docText = `${doc.title} ${doc.content} ${(doc.keyFacts || []).join(' ')}`.toLowerCase();

    for (const token of queryTokens) {
      if (docText.includes(token)) {
        score += 3;
        currentMatched.push(token);
      }
    }

    // Dynamic semantic category boosts
    const categoryLower = (doc.category || '').toLowerCase();
    const titleLower = doc.title.toLowerCase();

    if (normalizedQuery.includes('price') || normalizedQuery.includes('cost') || normalizedQuery.includes('tier') || normalizedQuery.includes('quote') || normalizedQuery.includes('dollar')) {
      if (categoryLower.includes('pricing') || titleLower.includes('pricing') || titleLower.includes('cost')) score += 15;
    }
    if (normalizedQuery.includes('security') || normalizedQuery.includes('gdpr') || normalizedQuery.includes('soc2') || normalizedQuery.includes('hipaa') || normalizedQuery.includes('encrypt') || normalizedQuery.includes('compliance')) {
      if (categoryLower.includes('security') || titleLower.includes('security') || titleLower.includes('compliance')) score += 15;
    }
    if (normalizedQuery.includes('arch') || normalizedQuery.includes('latency') || normalizedQuery.includes('scale') || normalizedQuery.includes('cloud') || normalizedQuery.includes('vpc') || normalizedQuery.includes('kubernetes')) {
      if (categoryLower.includes('architecture') || titleLower.includes('architecture') || titleLower.includes('scale')) score += 15;
    }
    if (normalizedQuery.includes('vs') || normalizedQuery.includes('competitor') || normalizedQuery.includes('workato') || normalizedQuery.includes('zapier') || normalizedQuery.includes('alternative')) {
      if (categoryLower.includes('competitor') || titleLower.includes('vs') || titleLower.includes('alternative')) score += 15;
    }
    if (normalizedQuery.includes('sap') || normalizedQuery.includes('salesforce') || normalizedQuery.includes('api') || normalizedQuery.includes('connector') || normalizedQuery.includes('integrate')) {
      if (categoryLower.includes('integration') || titleLower.includes('integration') || titleLower.includes('api')) score += 15;
    }

    if (score > highestScore) {
      highestScore = score;
      bestDoc = doc;
      bestKeywords = currentMatched;
    }
  }

  // Find corresponding slide or fallback to first slide or create synthetic slide
  const targetSlideId = bestDoc.suggestedSlideId;
  const slide =
    (kb.slides || []).find((s) => s.id === targetSlideId) ||
    kb.slides?.[0] || {
      id: 'slide-1',
      number: 1,
      title: bestDoc.title,
      subtitle: kb.name,
      bullets: bestDoc.keyFacts?.slice(0, 3) || [bestDoc.title],
      metrics: [{ label: 'Relevance', value: '99', unit: '%' }],
      diagramType: 'architecture',
      tags: [bestDoc.category || 'general'],
    };

  return {
    topDoc: bestDoc,
    score: Math.max(highestScore, 10),
    relevantSlide: slide,
    matchedKeywords: bestKeywords.slice(0, 5),
  };
}

// Generate fully dynamic local cue card grounded directly in whatever documents exist
export function generateLocalCueCard(
  kb: KnowledgeBase,
  userSpeechOrQuery: string,
  preferredLanguage: string = 'English'
): CopilotCueCard {
  const match = searchKnowledgeBase(kb, userSpeechOrQuery);
  const doc = match.topDoc;
  const slide = match.relevantSlide;

  const primaryFact = doc.keyFacts?.[0] || doc.content.slice(0, 160);
  const secondaryFact = doc.keyFacts?.[1] || '';
  const tertiaryFact = doc.keyFacts?.[2] || '';

  // Extract dynamic emphasis keywords from title and facts
  const titleWords = doc.title.split(/\s+/).filter((w) => w.length > 4);
  const factWords = (primaryFact || '').split(/\s+/).filter((w) => w.length > 5 && !w.includes('http'));
  const emphasisKeywords = Array.from(new Set([...titleWords.slice(0, 2), ...factWords.slice(0, 2)])).slice(0, 3);

  const cat = (doc.category || '').toLowerCase();
  const title = doc.title.toLowerCase();

  let verbatimAnswer = '';
  let objectionDefuser = '';
  let followUpQuestion = '';
  let deliveryGuidance = {
    tone: 'Confident, calm & consultative',
    pacing: 'Steady conversational pace; pause deliberately after quoting facts',
    emphasisKeywords: emphasisKeywords.length > 0 ? emphasisKeywords : ['verified capability', 'guaranteed SLA'],
  };
  let timingCue: CopilotCueCard['timingCue'] = {
    whenToSpeak: 'Speak immediately after counterparty completes thought',
    conversationPhase: 'discovery',
    urgencyLevel: 'medium',
  };

  if (cat.includes('pricing') || title.includes('pricing') || title.includes('cost') || title.includes('tier')) {
    verbatimAnswer = `${kb.name}'s pricing is built on complete transparency: ${primaryFact}. ${secondaryFact ? secondaryFact + '.' : ''}`;
    objectionDefuser = `Remind the client that every dollar invested is supported by measurable SLAs with zero hidden or penalizing overage charges.`;
    followUpQuestion = `Given your expected transaction volume this quarter, would our pricing structure make it straightforward for your leadership to greenlight the pilot?`;
    deliveryGuidance = {
      tone: 'Assured, transparent & consultative',
      pacing: 'Measured and unhurried; take a full 1-second pause after stating core pricing figures',
      emphasisKeywords: emphasisKeywords.length ? emphasisKeywords : ['transparent tiering', 'no hidden penalties'],
    };
    timingCue = {
      whenToSpeak: 'Speak without hesitation — delayed pricing answers signal uncertainty or hidden fees',
      conversationPhase: 'commercial-closing',
      urgencyLevel: 'high',
    };
  } else if (cat.includes('security') || title.includes('security') || title.includes('compliance') || title.includes('gdpr') || title.includes('soc2')) {
    verbatimAnswer = `Security, data isolation, and regulatory governance are at the bedrock of ${kb.name}. ${primaryFact}. ${secondaryFact ? secondaryFact + '.' : ''} All client payloads and sessions are strictly protected under audited controls.`;
    objectionDefuser = `Offer to sign an enterprise security addendum or provide our verified compliance report under mutual NDA.`;
    followUpQuestion = `Would sharing our compliance and security audit documentation directly with your InfoSec lead clear the path for evaluation?`;
    deliveryGuidance = {
      tone: 'Firm, authoritative, reassuring & unshakeable',
      pacing: 'Steady, crisp cadence; emphasize security and privacy guarantees clearly',
      emphasisKeywords: emphasisKeywords.length ? emphasisKeywords : ['data isolation', 'verified compliance'],
    };
    timingCue = {
      whenToSpeak: 'Speak immediately — hesitation on compliance triggers InfoSec red flags',
      conversationPhase: 'technical-qualification',
      urgencyLevel: 'high',
    };
  } else if (cat.includes('architecture') || title.includes('architecture') || title.includes('infrastructure') || title.includes('scale')) {
    verbatimAnswer = `Under the hood, ${kb.name}'s architecture is engineered for high performance: ${primaryFact}. ${secondaryFact ? secondaryFact + '.' : ''} You maintain complete control over your deployment environment with zero single points of failure.`;
    objectionDefuser = `Emphasize that they maintain 100% control over their data boundary and network traffic.`;
    followUpQuestion = `Does your infrastructure require isolated private cloud VPC deployment, or does your team run on-premise container clusters?`;
    deliveryGuidance = {
      tone: 'Technically precise, crisp & confident',
      pacing: 'Energetic and focused on latency, reliability, and throughput metrics',
      emphasisKeywords: emphasisKeywords.length ? emphasisKeywords : ['isolated runtime', 'high throughput'],
    };
    timingCue = {
      whenToSpeak: 'Speak as soon as they conclude technical query; validate their scale first',
      conversationPhase: 'technical-qualification',
      urgencyLevel: 'medium',
    };
  } else if (cat.includes('competitor') || title.includes('vs') || title.includes('comparison') || title.includes('alternative')) {
    verbatimAnswer = `Compared to legacy alternatives, ${kb.name} delivers significant advantages: ${primaryFact}. ${secondaryFact ? secondaryFact + '.' : ''} We eliminate vendor lock-in and modern workflow bottlenecks.`;
    objectionDefuser = `Highlight that our automated onboarding and migration path can transition existing workflows in days rather than months.`;
    followUpQuestion = `How many hours of engineering maintenance is your team losing each week troubleshooting limitations in your current stack?`;
    deliveryGuidance = {
      tone: 'Assertive, factual & focused on measurable ROI',
      pacing: 'Pause slightly after quoting comparative advantages to let the savings sink in',
      emphasisKeywords: emphasisKeywords.length ? emphasisKeywords : ['lower TCO', 'faster onboarding'],
    };
    timingCue = {
      whenToSpeak: 'Acknowledge their existing tool respectfully, then pivot directly to technical and economic advantages',
      conversationPhase: 'objection-defusal',
      urgencyLevel: 'high',
    };
  } else if (cat.includes('integration') || title.includes('integration') || title.includes('connector') || title.includes('api')) {
    verbatimAnswer = `Integration with your ecosystem is seamless: ${primaryFact}. ${secondaryFact ? secondaryFact + '.' : ''} Your engineering team can author custom extensions with zero-downtime hot reloading.`;
    objectionDefuser = `Confirm that our bidirectional webhooks and connectors automatically handle third-party rate limits with exponential backoff.`;
    followUpQuestion = `Which custom internal REST, GraphQL, or database endpoints would your engineering team want connected during the initial sprint?`;
    deliveryGuidance = {
      tone: 'Collaborative, practical & developer-friendly',
      pacing: 'Conversational and reassuring',
      emphasisKeywords: emphasisKeywords.length ? emphasisKeywords : ['seamless integration', 'native connectors'],
    };
    timingCue = {
      whenToSpeak: 'Speak right away to remove doubt on connector and API support',
      conversationPhase: 'discovery',
      urgencyLevel: 'medium',
    };
  } else {
    verbatimAnswer = `Regarding ${doc.title}, ${kb.name} addresses this directly: ${primaryFact}. ${secondaryFact ? secondaryFact + '.' : ''} This directly solves operational friction and ensures dependable execution.`;
    objectionDefuser = `Lead with our proof-of-concept verification to demonstrate immediate time-to-value.`;
    followUpQuestion = `What is the single most critical workflow outcome your team needs to achieve in the next 30 days?`;
  }

  const talkingPoints = (doc.keyFacts && doc.keyFacts.length > 0)
    ? doc.keyFacts.slice(0, 3)
    : [primaryFact, secondaryFact, tertiaryFact].filter(Boolean);

  return {
    id: `cue-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    triggerTranscript: userSpeechOrQuery,
    verbatimAnswer,
    deliveryGuidance,
    timingCue,
    followUpQuestion,
    talkingPoints: talkingPoints.length > 0 ? talkingPoints : [`${kb.name} verified feature: ${doc.title}`],
    relevantSlideId: slide.id,
    relevantSlideTitle: slide.title,
    objectionDefuser,
    groundedQuotes: [`[From ${doc.title}]: "${primaryFact}"`],
    confidence: Math.min(98, 75 + match.score),
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
  };
}

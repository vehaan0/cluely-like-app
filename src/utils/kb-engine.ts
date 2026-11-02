export interface KBDocument {
  id: string;
  title: string;
  category: 'architecture' | 'pricing' | 'security' | 'integration' | 'faq' | 'competitors';
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
    const docText = `${doc.title} ${doc.content} ${doc.keyFacts.join(' ')}`.toLowerCase();

    for (const token of queryTokens) {
      if (docText.includes(token)) {
        score += 3;
        currentMatched.push(token);
      }
    }

    // Category boosts
    if (normalizedQuery.includes('price') || normalizedQuery.includes('cost') || normalizedQuery.includes('tier') || normalizedQuery.includes('quote') || normalizedQuery.includes('dollar')) {
      if (doc.category === 'pricing') score += 15;
    }
    if (normalizedQuery.includes('security') || normalizedQuery.includes('gdpr') || normalizedQuery.includes('soc2') || normalizedQuery.includes('hipaa') || normalizedQuery.includes('encrypt') || normalizedQuery.includes('compliance')) {
      if (doc.category === 'security') score += 15;
    }
    if (normalizedQuery.includes('arch') || normalizedQuery.includes('latency') || normalizedQuery.includes('scale') || normalizedQuery.includes('cloud') || normalizedQuery.includes('vpc') || normalizedQuery.includes('kubernetes')) {
      if (doc.category === 'architecture') score += 15;
    }
    if (normalizedQuery.includes('vs') || normalizedQuery.includes('competitor') || normalizedQuery.includes('workato') || normalizedQuery.includes('zapier') || normalizedQuery.includes('alternative')) {
      if (doc.category === 'competitors') score += 15;
    }
    if (normalizedQuery.includes('sap') || normalizedQuery.includes('salesforce') || normalizedQuery.includes('api') || normalizedQuery.includes('connector') || normalizedQuery.includes('integrate')) {
      if (doc.category === 'integration') score += 15;
    }

    if (score > highestScore) {
      highestScore = score;
      bestDoc = doc;
      bestKeywords = currentMatched;
    }
  }

  // Find corresponding slide
  const targetSlideId = bestDoc.suggestedSlideId;
  const slide = kb.slides.find((s) => s.id === targetSlideId) || kb.slides[0];

  return {
    topDoc: bestDoc,
    score: Math.max(highestScore, 10),
    relevantSlide: slide,
    matchedKeywords: bestKeywords.slice(0, 5),
  };
}

// Generate deterministic local cue card
export function generateLocalCueCard(
  kb: KnowledgeBase,
  userSpeechOrQuery: string,
  preferredLanguage: string = 'English'
): CopilotCueCard {
  const match = searchKnowledgeBase(kb, userSpeechOrQuery);
  const doc = match.topDoc;
  const slide = match.relevantSlide;

  // Domain-crafted pitch response based on matched category
  let verbatimAnswer = '';
  let objectionDefuser = '';

  if (doc.category === 'pricing') {
    verbatimAnswer = `Our pricing is structured with complete transparency to scale alongside your usage. Our Enterprise Pro plan starts at $4,800 monthly with 5 million executions and guaranteed 99.99% uptime. Furthermore, if you commit annually, we offer a 20% discount, and your initial 30-day proof-of-concept fee is credited 100% directly toward your contract.`;
    objectionDefuser = `Remind the client that unlike legacy iPaaS providers, we never charge penalizing per-step overage fees.`;
  } else if (doc.category === 'security') {
    verbatimAnswer = `Security and regulatory governance are at the bedrock of ${kb.name}. We are certified SOC2 Type II, ISO 27001, HIPAA, and GDPR compliant. Crucially, we enforce a strict Zero Data Retention policy—your LLM prompts and payloads are purged immediately upon execution. We also support BYOK AES-256 encryption and full Okta SSO with SCIM provisioning.`;
    objectionDefuser = `Offer to sign an enterprise BAA or provide our latest third-party SOC2 auditor report under mutual NDA.`;
  } else if (doc.category === 'architecture') {
    verbatimAnswer = `Under the hood, our architecture utilizes isolated microVMs with sub-15ms cold start times, scaling effortlessly to 250,000 concurrent agent threads. You can deploy directly into your private AWS or Google Cloud VPC via Helm chart, or run completely air-gapped on your internal Kubernetes infrastructure.`;
    objectionDefuser = `Emphasize that they maintain 100% control over their VPC data boundary and private network traffic.`;
  } else if (doc.category === 'competitors') {
    verbatimAnswer = `Compared to legacy platforms like Workato or MuleSoft, our customers see an average 60% reduction in total cost of ownership. More importantly, we provide native multi-agent reasoning, state checkpoints, and automated rollback workflows that legacy tools simply cannot support.`;
    objectionDefuser = `Highlight that our automated migration toolkit can import up to 90% of their existing workflows in under 48 hours.`;
  } else if (doc.category === 'integration') {
    verbatimAnswer = `We offer 180+ native enterprise connectors out of the box for SAP S/4HANA, Salesforce, ServiceNow, and Snowflake. In addition, your engineering team can write bespoke connectors in TypeScript or Python using our SDK with zero-downtime hot reloading.`;
    objectionDefuser = `Confirm that our bidirectional webhooks automatically handle third-party rate limits with exponential backoff.`;
  } else {
    verbatimAnswer = `${kb.name} solves this directly. Our platform combines enterprise reliability, guaranteed sub-15ms latency, and turnkey integration into your existing systems with full compliance out of the box.`;
    objectionDefuser = `Lead with our 30-day proof-of-concept guarantee to demonstrate immediate time-to-value.`;
  }

  return {
    id: `cue-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    triggerTranscript: userSpeechOrQuery,
    verbatimAnswer,
    talkingPoints: doc.keyFacts.slice(0, 3),
    relevantSlideId: slide.id,
    relevantSlideTitle: slide.title,
    objectionDefuser,
    groundedQuotes: [`[From ${doc.title}]: "${doc.keyFacts[0]}"`],
    confidence: Math.min(98, 75 + match.score),
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
  };
}

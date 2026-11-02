import { MeetingScenario } from './kb-engine';

export interface SupportedLanguage {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
}

export type MeetingPlatform = 'google-meet' | 'microsoft-teams' | 'zoom';

export interface PlatformConfig {
  id: MeetingPlatform;
  name: string;
  badge: string;
  accentColor: string;
  meetingUrlPrefix: string;
}

export const SUPPORTED_PLATFORMS: PlatformConfig[] = [
  {
    id: 'google-meet',
    name: 'Google Meet',
    badge: 'Meet HD',
    accentColor: '#10B981', // emerald
    meetingUrlPrefix: 'meet.google.com/omni-pitch-2026',
  },
  {
    id: 'microsoft-teams',
    name: 'Microsoft Teams',
    badge: 'Teams Enterprise',
    accentColor: '#6366F1', // indigo / blurple
    meetingUrlPrefix: 'teams.microsoft.com/l/meetup-join/omni-flow',
  },
  {
    id: 'zoom',
    name: 'Zoom Workplace',
    badge: 'Zoom Pro',
    accentColor: '#0284C7', // sky
    meetingUrlPrefix: 'zoom.us/j/84920491823',
  },
];

export const SUPPORTED_LANGUAGES: SupportedLanguage[] = [
  { code: 'en', name: 'English', nativeName: 'English (US)', flag: '🇺🇸' },
  { code: 'ja', name: 'Japanese', nativeName: '日本語', flag: '🇯🇵' },
  { code: 'es', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸' },
  { code: 'de', name: 'German', nativeName: 'Deutsch', flag: '🇩🇪' },
  { code: 'fr', name: 'French', nativeName: 'Français', flag: '🇫🇷' },
  { code: 'zh', name: 'Mandarin Chinese', nativeName: '中文 (简体)', flag: '🇨🇳' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', flag: '🇮🇳' },
  { code: 'pt', name: 'Portuguese', nativeName: 'Português', flag: '🇧🇷' },
  { code: 'it', name: 'Italian', nativeName: 'Italiano', flag: '🇮🇹' },
  { code: 'ko', name: 'Korean', nativeName: '한국어', flag: '🇰🇷' },
];

export interface DetectedLanguageResult {
  code: string;
  name: string;
  confidence: number;
}

// Automatic Language Identification Logic
export function identifyLanguage(text: string): DetectedLanguageResult {
  if (!text || text.trim() === '') {
    return { code: 'en', name: 'English', confidence: 50 };
  }

  // 1. Script-based unicode range detection
  const hasJapaneseKana = /[\u3040-\u30ff]/.test(text);
  const hasChinese = /[\u4e00-\u9fa5]/.test(text);
  const hasKoreanHangul = /[\uac00-\ud7af]/.test(text);
  const hasDevanagari = /[\u0900-\u097f]/.test(text);
  const hasArabic = /[\u0600-\u06ff]/.test(text);

  if (hasJapaneseKana) return { code: 'ja', name: 'Japanese', confidence: 99 };
  if (hasKoreanHangul) return { code: 'ko', name: 'Korean', confidence: 99 };
  if (hasDevanagari) return { code: 'hi', name: 'Hindi', confidence: 98 };
  if (hasArabic) return { code: 'ar', name: 'Arabic', confidence: 98 };
  if (hasChinese) return { code: 'zh', name: 'Mandarin Chinese', confidence: 96 };

  // 2. Lexical & token patterns for Latin alphabet languages
  const lower = text.toLowerCase();

  // German distinctive tokens
  const germanTokens = ['guten', 'für', 'und', 'wie', 'nicht', 'dsgvo', 'latenz', 'wir', 'ist', 'mit', 'konformität', 'aufschlussreich'];
  const germanHits = germanTokens.filter((w) => lower.includes(w)).length;
  if (germanHits >= 2 || lower.includes('ä') || lower.includes('ö') || lower.includes('ü') || lower.includes('ß')) {
    return { code: 'de', name: 'German', confidence: 95 };
  }

  // French distinctive tokens
  const frenchTokens = ['bonjour', 'nous', 'dans', 'pourriez', 'avec', 'système', 'très', 'votre', 'durant', 'pics'];
  const frenchHits = frenchTokens.filter((w) => lower.includes(w)).length;
  if (frenchHits >= 2 || lower.includes('c’est') || lower.includes('d’un') || lower.includes('é') || lower.includes('è') || lower.includes('à')) {
    return { code: 'fr', name: 'French', confidence: 94 };
  }

  // Spanish distinctive tokens
  const spanishTokens = ['hola', 'cómo', 'nuestros', 'para', 'gracias', 'precios', 'todos', 'nuestro', 'interesa', 'despliegue'];
  const spanishHits = spanishTokens.filter((w) => lower.includes(w)).length;
  if (spanishHits >= 2 || lower.includes('¿') || lower.includes('¡') || lower.includes('ñ')) {
    return { code: 'es', name: 'Spanish', confidence: 95 };
  }

  // Portuguese tokens
  const ptTokens = ['olá', 'obrigado', 'você', 'nossos', 'relação', 'estamos', 'como'];
  const ptHits = ptTokens.filter((w) => lower.includes(w)).length;
  if (ptHits >= 2 || lower.includes('ç') || lower.includes('ã') || lower.includes('õ')) {
    return { code: 'pt', name: 'Portuguese', confidence: 92 };
  }

  // Italian tokens
  const itTokens = ['buongiorno', 'ciao', 'grazie', 'nostro', 'nostri', 'come', 'piacere'];
  const itHits = itTokens.filter((w) => lower.includes(w)).length;
  if (itHits >= 2) {
    return { code: 'it', name: 'Italian', confidence: 91 };
  }

  return { code: 'en', name: 'English', confidence: 90 };
}

export const MEETING_SCENARIOS: MeetingScenario[] = [
  {
    id: 'tokyo-enterprise',
    title: 'Tokyo MegaCorp - VPC & High-SLA Review',
    counterpartyName: 'Kenji Sato (佐藤 健司)',
    counterpartyTitle: 'VP of Digital Infrastructure & IT Operations',
    counterpartyCompany: 'Nomura Digital Holdings, Tokyo',
    counterpartyLocation: 'Tokyo, Japan (JST)',
    nativeLanguage: 'Japanese',
    nativeLanguageCode: 'ja',
    avatarSeed: 'Kenji',
    dialogueSteps: [
      {
        speakerText: 'はじめまして。弊社のオンプレミス環境および専用VPCへの導入におけるセキュリティ要件と、稼働率SLAの保証について伺えますか？',
        englishTranslation: 'Nice to meet you. Could you explain your security requirements for on-premise and dedicated VPC deployment, as well as your uptime SLA guarantee?',
        expectedTopic: 'security and uptime SLA',
        delayMs: 3500,
      },
      {
        speakerText: 'ありがとうございます。価格体系についてですが、月額費用や年間契約での割引、および事前検証POCの条件はどうなっていますでしょうか？',
        englishTranslation: 'Thank you. Regarding pricing tiers, what are your monthly costs, annual commitment discounts, and terms for a 30-day proof of concept?',
        expectedTopic: 'pricing, annual discount and POC',
        delayMs: 4000,
      },
      {
        speakerText: '素晴らしいですね。SAP S/4HANAや既存の社内ワークフローとの連携実績、および大量トランザクション時の処理遅延についてはいかがですか？',
        englishTranslation: 'Impressive. What is your track record integrating with SAP S/4HANA and existing enterprise workflows, and what latency do you experience during peak transaction loads?',
        expectedTopic: 'SAP integration and latency benchmarks',
        delayMs: 4200,
      },
    ],
  },
  {
    id: 'berlin-architecture',
    title: 'Berlin FinTech - GDPR & Cloud Infrastructure Review',
    counterpartyName: 'Dr. Greta Weiss',
    counterpartyTitle: 'Chief Enterprise Systems Architect',
    counterpartyCompany: 'FinTech EuroNexus AG, Munich/Berlin',
    counterpartyLocation: 'Berlin, Germany (CET)',
    nativeLanguage: 'German',
    nativeLanguageCode: 'de',
    avatarSeed: 'Greta',
    dialogueSteps: [
      {
        speakerText: 'Guten Tag. Für uns in der Europäischen Union sind die DSGVO-Konformität und die Speicherung aller Daten innerhalb der Region Frankfurt absolute Priorität. Wie gewährleisten Sie das?',
        englishTranslation: 'Good day. For us in the EU, GDPR compliance and storing all data strictly within the Frankfurt region are absolute priorities. How do you guarantee this?',
        expectedTopic: 'GDPR compliance and EU data residency',
        delayMs: 3500,
      },
      {
        speakerText: 'Sehr aufschlussreich. Welche Latenzzeiten und Durchsatzraten können wir bei 200.000 gleichzeitigen Agentenaufgaben in unserer Kubernetes-Cluster-Umgebung erwarten?',
        englishTranslation: 'Very insightful. What latency and throughput figures can we expect at 200,000 concurrent agent tasks within our Kubernetes cluster environment?',
        expectedTopic: 'architecture latency and concurrency',
        delayMs: 4000,
      },
      {
        speakerText: 'Wir evaluieren derzeit auch Workato und MuleSoft. Warum sollten wir Ihre Plattform bevorzugen und wie hoch ist der Migrationsaufwand?',
        englishTranslation: 'We are currently also evaluating Workato and MuleSoft. Why should we choose your platform, and what is the migration effort required?',
        expectedTopic: 'competitor comparison Workato and migration',
        delayMs: 4200,
      },
    ],
  },
  {
    id: 'paris-retail',
    title: 'Paris Luxury Brands - Global Scale & Peak Black Friday Pitch',
    counterpartyName: 'Julien Laurent',
    counterpartyTitle: 'Head of Omnichannel Engineering',
    counterpartyCompany: 'LVM Prestige Retail Group, Paris',
    counterpartyLocation: 'Paris, France (CET)',
    nativeLanguage: 'French',
    nativeLanguageCode: 'fr',
    avatarSeed: 'Julien',
    dialogueSteps: [
      {
        speakerText: 'Bonjour. Durant les pics comme le Black Friday, notre système subit des volumes critiques. Comment votre infrastructure garantit-elle une haute disponibilité sans dégradation de performance ?',
        englishTranslation: 'Hello. During peak traffic like Black Friday, our systems handle critical volume. How does your infrastructure ensure high availability without performance degradation?',
        expectedTopic: 'high availability and peak performance',
        delayMs: 3600,
      },
      {
        speakerText: 'C’est rassurant. Quel est le modèle de licence pour une équipe mondiale, et disposez-vous d’un support dédié avec temps de réponse garanti ?',
        englishTranslation: 'That is reassuring. What is the licensing model for a global team, and do you offer dedicated enterprise support with a guaranteed response SLA?',
        expectedTopic: 'licensing tiers and dedicated support',
        delayMs: 4100,
      },
    ],
  },
  {
    id: 'madrid-logistics',
    title: 'Madrid Logistics Corp - API Integrations & Rapid Onboarding',
    counterpartyName: 'Elena Ramos',
    counterpartyTitle: 'VP of Supply Chain Technology',
    counterpartyCompany: 'Iberia Global Logistics, Madrid',
    counterpartyLocation: 'Madrid, Spain (CET)',
    nativeLanguage: 'Spanish',
    nativeLanguageCode: 'es',
    avatarSeed: 'Elena',
    dialogueSteps: [
      {
        speakerText: 'Hola a todos. Nos interesa saber cómo se conecta su plataforma con nuestros sistemas ERP existentes y si podemos crear conectores personalizados en TypeScript o Python.',
        englishTranslation: 'Hello everyone. We would like to know how your platform connects with our existing ERP systems and whether our team can author custom connectors in TypeScript or Python.',
        expectedTopic: 'ERP connectors and custom SDK',
        delayMs: 3500,
      },
      {
        speakerText: 'Perfecto. ¿Tienen planes de prueba de concepto reembolsables y cómo funciona la política de retención cero de datos de los prompts?',
        englishTranslation: 'Perfect. Do you have a refundable proof-of-concept program, and how does your zero-retention policy for prompt data work?',
        expectedTopic: 'POC credit and zero retention security',
        delayMs: 3800,
      },
    ],
  },
];

// Offline instant translation mapping for simulated phrases to ensure instant responsiveness
const PHRASE_TRANSLATIONS: Record<string, Record<string, string>> = {
  // Japanese step 1
  'はじめまして。弊社のオンプレミス環境および専用VPCへの導入におけるセキュリティ要件と、稼働率SLAの保証について伺えますか？': {
    en: 'Nice to meet you. Could you explain your security requirements for on-premise and dedicated VPC deployment, as well as your uptime SLA guarantee?',
    es: 'Mucho gusto. ¿Podría explicar sus requisitos de seguridad para despliegues on-premise y VPC dedicada, así como la garantía de SLA?',
    fr: 'Ravi de vous rencontrer. Pourriez-vous détailler vos exigences de sécurité pour le déploiement sur site et VPC dédié, ainsi que votre garantie SLA ?',
    de: 'Schön Sie kennenzulernen. Könnten Sie Ihre Sicherheitsanforderungen für On-Premise- und dedizierte VPC-Bereitstellungen sowie Ihre Verfügbarkeits-SLA erläutern?',
    hi: 'आपसे मिलकर अच्छा लगा। क्या आप ऑन-प्रेमिस और समर्पित वीपीसी परिनियोजन के लिए अपनी सुरक्षा आवश्यकताओं और अपटाइम एसएलए गारंटी की व्याख्या कर सकते हैं?',
    zh: '很高兴认识您。能否请您介绍一下本地部署和专用VPC的安全合规要求，以及系统的运行时间SLA保障？',
    pt: 'Prazer em conhecê-lo. Você poderia explicar seus requisitos de segurança para implantação local e VPC dedicada, bem como a garantia de SLA de disponibilidade?',
    it: 'Piacere di conoscerti. Potresti spiegare i tuoi requisiti di sicurezza per il deployment on-premise e su VPC dedicata, nonché la garanzia SLA di uptime?',
    ja: 'はじめまして。弊社のオンプレミス環境および専用VPCへの導入におけるセキュリティ要件と、稼働率SLAの保証について伺えますか？',
    ko: '만나서 반갑습니다. 온프레미스 및 전용 VPC 배포를 위한 보안 요구사항과 가동 시간 SLA 보증에 대해 설명해 주시겠습니까?',
  },
  // Japanese step 2
  'ありがとうございます。価格体系についてですが、月額費用や年間契約での割引、および事前検証POCの条件はどうなっていますでしょうか？': {
    en: 'Thank you. Regarding pricing tiers, what are your monthly costs, annual commitment discounts, and terms for a 30-day proof of concept?',
    es: 'Gracias. Con respecto a los precios, ¿cuáles son los costos mensuales, los descuentos por contrato anual y las condiciones para una prueba de concepto?',
    fr: 'Merci. Concernant la tarification, quels sont vos coûts mensuels, les remises pour engagement annuel et les modalités d’un POC de 30 jours ?',
    de: 'Vielen Dank. Was die Preisstufen betrifft: Wie hoch sind die monatlichen Kosten, Jahresrabatte und Konditionen für einen 30-tägigen Proof of Concept?',
    hi: 'धन्यवाद। मूल्य निर्धारण के संबंध में, आपकी मासिक लागत, वार्षिक छूट और 30-दिवसीय प्रूफ ऑफ कॉन्सेप्ट की शर्तें क्या हैं?',
    zh: '谢谢。关于价格层级，请问每月的费用、年度合同折扣以及为期30天的概念验证（POC）条件是怎样的？',
    pt: 'Obrigado. Em relação aos preços, quais são os custos mensais, descontos contratuais anuais e termos para uma prova de conceito de 30 dias?',
    it: 'Grazie. Per quanto riguarda i prezzi, quali sono i costi mensili, gli sconti per contratti annuali e i termini per una prova di concetto di 30 giorni?',
    ja: 'ありがとうございます。価格体系についてですが、月額費用や年間契約での割引、および事前検証POCの条件はどうなっていますでしょうか？',
    ko: '감사합니다. 요금제와 관련하여 월 비용, 연간 약정 할인 및 30일 개념 증명(POC) 조건은 어떻게 됩니까?',
  },
  // Japanese step 3
  '素晴らしいですね。SAP S/4HANAや既存の社内ワークフローとの連携実績、および大量トランザクション時の処理遅延についてはいかがですか？': {
    en: 'Impressive. What is your track record integrating with SAP S/4HANA and existing enterprise workflows, and what latency do you experience during peak transaction loads?',
    es: 'Impresionante. ¿Cuál es su experiencia integrando con SAP S/4HANA y qué latencia registran durante picos de transacciones masivas?',
    fr: 'Impressionnant. Quel est votre historique d’intégration avec SAP S/4HANA et quelle latence observez-vous lors des pics de charge transactionnelle ?',
    de: 'Beeindruckend. Welche Erfahrung haben Sie bei der Integration mit SAP S/4HANA und welche Latenzzeiten treten bei Spitzenlasten auf?',
    hi: 'शानदार। एसएपी S/4HANA के साथ एकीकरण और पीक लेनदेन के दौरान प्रोसेसिंग विलंबता (latency) का आपका क्या अनुभव है?',
    zh: '令人印象深刻。请问与SAP S/4HANA及现有企业工作流的集成经验如何，在高负载交易峰值时的系统延迟表现怎样？',
    pt: 'Impressionante. Qual é o seu histórico de integração com o SAP S/4HANA e qual latência vocês observam durante picos de transação?',
    it: 'Notevole. Qual è la vostra esperienza nell’integrazione con SAP S/4HANA e quale latenza registrate durante i picchi di carico delle transazioni?',
    ja: '素晴らしいですね。SAP S/4HANAや既存の社内ワークフローとの連携実績、および大量トランザクション時の処理遅延についてはいかがですか？',
    ko: '인상적입니다. SAP S/4HANA 및 기존 엔터프라이즈 워크플로우와의 연동 실적과 피크 트랜잭션 부하 시 지연 시간은 어떻습니까?',
  },
  // German step 1
  'Guten Tag. Für uns in der Europäischen Union sind die DSGVO-Konformität und die Speicherung aller Daten innerhalb der Region Frankfurt absolute Priorität. Wie gewährleisten Sie das?': {
    en: 'Good day. For us in the EU, GDPR compliance and storing all data strictly within the Frankfurt region are absolute priorities. How do you guarantee this?',
    es: 'Buenos días. Para nosotros en la Unión Europea, el cumplimiento del RGPD y el almacenamiento en Frankfurt son prioridad absoluta. ¿Cómo lo garantizan?',
    fr: 'Bonjour. Pour nous dans l’UE, la conformité RGPD et l’hébergement des données à Francfort sont prioritaires. Comment le garantissez-vous ?',
    de: 'Guten Tag. Für uns in der Europäischen Union sind die DSGVO-Konformität und die Speicherung aller Daten innerhalb der Region Frankfurt absolute Priorität. Wie gewährleisten Sie das?',
    ja: 'こんにちは。欧州連合の当社にとって、GDPR（一般データ保護規則）の遵守とフランクフルト地域内での厳格なデータ保管は最優先事項です。これをどのように保証していますか？',
    zh: '您好。对于欧盟企业而言，GDPR合规性和将数据严格存储在法兰克福地区是重中之重。请问您如何保障？',
    hi: 'नमस्ते। यूरोपीय संघ में हमारे लिए जीडीपीआर अनुपालन और फ्रैंकफर्ट क्षेत्र के भीतर सभी डेटा भंडारण पहली प्राथमिकता है। आप इसे कैसे सुनिश्चित करते हैं?',
    pt: 'Bom dia. Para nós na UE, a conformidade com o GDPR e o armazenamento em Frankfurt são prioridades absolutas. Como garantem isso?',
    it: 'Buongiorno. Per noi nell’UE, la conformità al GDPR e la memorizzazione a Francoforte sono priorità assolute. Come lo garantite?',
    ko: '안녕하세요. EU에 있는 당사로서는 GDPR 준수와 프랑크푸르트 리전 내 데이터 저장이 최우선 과제입니다. 이를 어떻게 보장합니까?',
  },
};

// Translate speech with local dictionary or fallback
export function getFastTranslation(
  sourceText: string,
  targetLangCode: string,
  targetLangName: string = 'English'
): string {
  const normalizedSource = sourceText.trim();
  const dict = PHRASE_TRANSLATIONS[normalizedSource];
  if (dict && dict[targetLangCode]) {
    return dict[targetLangCode];
  }

  // Check matching by partial content
  for (const [key, mapping] of Object.entries(PHRASE_TRANSLATIONS)) {
    if (key.includes(normalizedSource.slice(0, 15)) || normalizedSource.includes(key.slice(0, 15))) {
      if (mapping[targetLangCode]) return mapping[targetLangCode];
    }
  }

  // Fallback translation representation
  return `[${targetLangName}] ${sourceText}`;
}

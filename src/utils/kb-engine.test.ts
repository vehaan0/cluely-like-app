import test from 'node:test';
import assert from 'node:assert/strict';
import {
  DEFAULT_KB_OMNIFLOW,
  searchKnowledgeBase,
  generateLocalCueCard,
} from './kb-engine';
import { getFastTranslation, SUPPORTED_LANGUAGES, identifyLanguage } from './translation-engine';

test('DEFAULT_KB_OMNIFLOW contains expected documents and slides', () => {
  assert.equal(DEFAULT_KB_OMNIFLOW.documents.length >= 5, true);
  assert.equal(DEFAULT_KB_OMNIFLOW.slides.length >= 6, true);
  assert.equal(DEFAULT_KB_OMNIFLOW.name, 'OmniFlow AI');
});

test('searchKnowledgeBase routes pricing queries to pricing document and slide', () => {
  const result = searchKnowledgeBase(
    DEFAULT_KB_OMNIFLOW,
    'What are your pricing tiers, monthly cost and POC terms?'
  );
  assert.equal(result.topDoc.category, 'pricing');
  assert.equal(result.relevantSlide.id, 'slide-5');
  assert.equal(result.score > 10, true);
});

test('searchKnowledgeBase routes security queries to SOC2/HIPAA security document and slide', () => {
  const result = searchKnowledgeBase(
    DEFAULT_KB_OMNIFLOW,
    'Can you tell us about your SOC2 compliance, HIPAA, and data encryption?'
  );
  assert.equal(result.topDoc.category, 'security');
  assert.equal(result.relevantSlide.id, 'slide-4');
});

test('searchKnowledgeBase routes architecture and latency queries correctly', () => {
  const result = searchKnowledgeBase(
    DEFAULT_KB_OMNIFLOW,
    'How does your microVM architecture achieve low latency at scale?'
  );
  assert.equal(result.topDoc.category, 'architecture');
  assert.equal(result.relevantSlide.id, 'slide-2');
});

test('generateLocalCueCard produces complete grounded pitch cue card with WHAT, HOW, and WHEN sales guidance', () => {
  const cueCard = generateLocalCueCard(
    DEFAULT_KB_OMNIFLOW,
    'What is your pricing model for enterprise scale?'
  );
  assert.ok(cueCard.verbatimAnswer);
  assert.equal(typeof cueCard.verbatimAnswer, 'string');
  assert.equal(cueCard.talkingPoints.length > 0, true);
  assert.ok(cueCard.relevantSlideId);
  assert.ok(cueCard.objectionDefuser);
  assert.ok(cueCard.confidence >= 70);

  // Assert Tri-Part Sales Guidance System
  assert.ok(cueCard.timingCue);
  assert.ok(cueCard.timingCue.whenToSpeak);
  assert.ok(cueCard.timingCue.conversationPhase);
  assert.ok(cueCard.timingCue.urgencyLevel);

  assert.ok(cueCard.deliveryGuidance);
  assert.ok(cueCard.deliveryGuidance.tone);
  assert.ok(cueCard.deliveryGuidance.pacing);
  assert.equal(Array.isArray(cueCard.deliveryGuidance.emphasisKeywords), true);
  assert.equal(cueCard.deliveryGuidance.emphasisKeywords.length > 0, true);

  assert.ok(cueCard.followUpQuestion);
  assert.equal(typeof cueCard.followUpQuestion, 'string');
});

test('getFastTranslation delivers target translation in selected language', () => {
  const sampleJapanese =
    'はじめまして。弊社のオンプレミス環境および専用VPCへの導入におけるセキュリティ要件と、稼働率SLAの保証について伺えますか？';
  const english = getFastTranslation(sampleJapanese, 'en', 'English');
  assert.match(english, /security requirements for on-premise/);

  const spanish = getFastTranslation(sampleJapanese, 'es', 'Spanish');
  assert.match(spanish, /requisitos de seguridad/);
});

test('SUPPORTED_LANGUAGES lists expected core languages', () => {
  const codes = SUPPORTED_LANGUAGES.map((l) => l.code);
  assert.ok(codes.includes('en'));
  assert.ok(codes.includes('ja'));
  assert.ok(codes.includes('es'));
  assert.ok(codes.includes('de'));
  assert.ok(codes.includes('fr'));
});

test('identifyLanguage accurately detects spoken language', () => {
  const ja = identifyLanguage('はじめまして。弊社のオンプレミス環境');
  assert.equal(ja.code, 'ja');
  assert.equal(ja.name, 'Japanese');

  const de = identifyLanguage('Guten Tag. Für uns in der Europäischen Union sind die DSGVO-Konformität und Latenz wichtig.');
  assert.equal(de.code, 'de');
  assert.equal(de.name, 'German');

  const es = identifyLanguage('Hola a todos. Nos interesa saber cómo se conecta su plataforma.');
  assert.equal(es.code, 'es');
  assert.equal(es.name, 'Spanish');

  const en = identifyLanguage('Hello, what are your enterprise uptime SLA guarantees?');
  assert.equal(en.code, 'en');
  assert.equal(en.name, 'English');
});

test('Dynamic KB: handles blank/empty knowledge base gracefully without errors', () => {
  const blankKb = {
    id: 'kb-custom-empty',
    name: 'Aura Health AI',
    tagline: 'Cardiology Diagnostics Assistant',
    productType: 'MedTech',
    documents: [],
    slides: [],
  };

  const searchRes = searchKnowledgeBase(blankKb, 'What is the accuracy rate?');
  assert.ok(searchRes.topDoc);
  assert.match(searchRes.topDoc.title, /Aura Health AI Overview/);

  const cueCard = generateLocalCueCard(blankKb, 'What is the accuracy rate?');
  assert.ok(cueCard.verbatimAnswer);
  assert.match(cueCard.verbatimAnswer, /Aura Health AI/);
  assert.ok(cueCard.timingCue);
  assert.ok(cueCard.deliveryGuidance);
});

test('Dynamic KB: derives verbatim answer and facts directly from custom user uploaded document', () => {
  const customKb = {
    id: 'kb-fintech',
    name: 'FinSafe Global',
    tagline: 'High Frequency Fraud Prevention',
    productType: 'FinTech',
    documents: [
      {
        id: 'doc-custom-1',
        title: 'Real-Time Fraud Prevention Engine',
        category: 'fraud-detection',
        content: 'FinSafe screens 500,000 transactions per second with a verified 99.98% fraud catch rate and sub-2ms transaction delay.',
        keyFacts: [
          '500,000 transactions per second throughput',
          '99.98% verified fraud catch rate',
          'Sub-2ms transaction authorization latency',
        ],
      },
    ],
    slides: [],
  };

  const cueCard = generateLocalCueCard(customKb, 'Tell us about your transaction throughput and fraud catch rate');
  assert.match(cueCard.verbatimAnswer, /FinSafe Global/);
  assert.match(cueCard.verbatimAnswer, /500,000 transactions per second/);
  assert.equal(cueCard.talkingPoints[0], '500,000 transactions per second throughput');
  assert.match(cueCard.groundedQuotes[0], /Real-Time Fraud Prevention Engine/);
});



import test from 'node:test';
import assert from 'node:assert/strict';
import { DEFAULT_KB_OMNIFLOW } from './kb-engine';
import {
  generatePresentationFromKB,
  PresentationConfig,
} from './presentation-generator';

test('generatePresentationFromKB produces structured 3-slide deck for 5-minute pitch', () => {
  const config: PresentationConfig = {
    topic: 'OmniFlow Fast 5-Min Executive Overview',
    durationMinutes: 5,
    targetAudience: 'ciso',
    focusCategories: ['security', 'pricing'],
  };

  const deck = generatePresentationFromKB(DEFAULT_KB_OMNIFLOW, config);
  assert.equal(deck.slides.length, 3);
  assert.equal(deck.durationMinutes, 5);
  assert.equal(deck.targetAudience, 'ciso');
  assert.ok(deck.slides[0].title.includes('Fast 5-Min'));
  assert.ok(deck.slides[1].bullets[0].includes('[Governance & Audit]'));
});

test('generatePresentationFromKB scales slide count for 30-minute deep dive', () => {
  const config: PresentationConfig = {
    topic: 'Full Architecture & Commercial Review',
    durationMinutes: 30,
    targetAudience: 'cto',
    focusCategories: ['architecture', 'integration', 'competitors'],
  };

  const deck = generatePresentationFromKB(DEFAULT_KB_OMNIFLOW, config);
  assert.equal(deck.slides.length >= 5, true);
  assert.equal(deck.durationMinutes, 30);
  assert.ok(deck.slides[1].bullets[0].includes('[Technical Spec]'));
});

test('generatePresentationFromKB populates metrics and diagram types correctly', () => {
  const config: PresentationConfig = {
    topic: 'Financial ROI & Pricing',
    durationMinutes: 15,
    targetAudience: 'cfo',
    focusCategories: ['pricing'],
  };

  const deck = generatePresentationFromKB(DEFAULT_KB_OMNIFLOW, config);
  const pricingSlide = deck.slides.find((s) => s.diagramType === 'pricing-matrix');
  assert.ok(pricingSlide);
  assert.ok(pricingSlide.metrics.length > 0);
});

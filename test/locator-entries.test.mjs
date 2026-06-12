import { test } from 'node:test';
import assert from 'node:assert/strict';
import { locatorEntries } from '../src/scripts/locator-entries.js';

// Fixture mirrors the real shape: denoiser is slugless but carries a slugged
// variant (DiT) and a slugless one (U-Net); generator-discriminator is slugless
// with no variants and must not appear at all.
const DATA = {
  primitives: [
    { id: 'attention', name: 'attention', slug: 'attention-mechanisms' },
    { id: 'recurrence', name: 'recurrence', slug: 'recurrent-neural-networks' },
  ],
  modules: [
    { id: 'encoder', name: 'encoder', slug: 'encoder' },
    {
      id: 'denoiser', name: 'denoiser', slug: null,
      variants: [
        { name: 'U-Net (convolutional)', slug: null },
        { name: 'DiT (transformer)', slug: 'diffusion-transformer' },
      ],
    },
    { id: 'generator-discriminator', name: 'generator + discriminator', slug: null },
    { id: 'output-head', name: 'output head', slug: 'output-head' },
  ],
  modifiers: [{ id: 'moe', name: 'MoE', slug: 'mixture-of-experts' }],
  families: [{ id: 'llm', name: 'LLM', slug: 'large-language-models' }],
};

test('module tier: slugged variants are inserted after their parent, slugless skipped', () => {
  assert.deepEqual(locatorEntries('module', DATA).map((e) => e.slug),
    ['encoder', 'diffusion-transformer', 'output-head']);
});

test('variant entries point their map hash at the parent module node', () => {
  const dit = locatorEntries('module', DATA).find((e) => e.slug === 'diffusion-transformer');
  assert.equal(dit.mapId, 'denoiser');
  assert.equal(dit.name, 'DiT (transformer)');
});

test('top-level entries map to their own id', () => {
  const enc = locatorEntries('module', DATA).find((e) => e.slug === 'encoder');
  assert.equal(enc.mapId, 'encoder');
});

test('non-module tiers are plain slugged nodes in data order', () => {
  assert.deepEqual(locatorEntries('primitive', DATA).map((e) => [e.slug, e.mapId]), [
    ['attention-mechanisms', 'attention'],
    ['recurrent-neural-networks', 'recurrence'],
  ]);
  assert.deepEqual(locatorEntries('family', DATA).map((e) => e.mapId), ['llm']);
});

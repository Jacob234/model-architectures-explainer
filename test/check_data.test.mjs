import { test } from 'node:test';
import assert from 'node:assert/strict';
import { validate } from '../scripts/check_data.mjs';

const base = () => ({
  primitives: [
    { id: 'attention', name: 'attention', tier: 'core', blurb: 'b', slug: 'attention-mechanisms', modifiedBy: ['gqa'] },
    { id: 'feed-forward', name: 'ffn', tier: 'core', blurb: 'b', slug: null },
  ],
  modules: [
    { id: 'encoder', name: 'encoder', blurb: 'b', slug: 'encoder', primitives: ['attention', 'feed-forward'],
      variants: [{ name: 'DiT', slug: 'diffusion-transformer' }] },
  ],
  modifiers: [
    { id: 'gqa', name: 'GQA', appliesTo: 'attention', blurb: 'b', slug: null },
  ],
  objectives: [
    { id: 'masked', name: 'masked', color: '#fff', blurb: 'b' },
  ],
  families: [
    { id: 'bert', name: 'BERT', tier: 'core', kind: 'architecture', modules: ['encoder'],
      objective: 'masked', blurb: 'b', slug: 'bert' },
    { id: 'cnn', name: 'CNN', tier: 'core', kind: 'backbone', modules: [],
      primitives: ['feed-forward'], objective: 'varies', blurb: 'b', slug: null },
  ],
});
const files = ['attention-mechanisms.md', 'encoder.md', 'diffusion-transformer.md', 'bert.md'];

test('valid data + complete files -> no errors', () => {
  assert.deepEqual(validate(base(), files), []);
});

test('module referencing unknown primitive -> error', () => {
  const d = base(); d.modules[0].primitives.push('nonexistent');
  assert.match(validate(d, files).join('\n'), /module encoder: unknown primitive "nonexistent"/);
});

test('family referencing unknown module -> error', () => {
  const d = base(); d.families[0].modules.push('ghost');
  assert.match(validate(d, files).join('\n'), /family bert: unknown module "ghost"/);
});

test('family with unknown objective -> error', () => {
  const d = base(); d.families[0].objective = 'psychic';
  assert.match(validate(d, files).join('\n'), /family bert: unknown objective "psychic"/);
});

test('objective "varies" is allowed', () => {
  assert.deepEqual(validate(base(), files), []);
});

test('slug without matching file -> error', () => {
  const d = base(); d.families[0].slug = 'missing-page';
  assert.match(validate(d, files).join('\n'), /family bert: slug "missing-page"/);
});

test('module variant slug without file -> error', () => {
  const d = base(); d.modules[0].variants[0].slug = 'gone';
  assert.match(validate(d, files).join('\n'), /variant DiT: slug "gone"/);
});

test('modifier appliesTo unknown primitive -> error', () => {
  const d = base(); d.modifiers[0].appliesTo = 'warp';
  assert.match(validate(d, files).join('\n'), /modifier gqa: appliesTo unknown primitive "warp"/);
});

test('primitive modifiedBy unknown modifier -> error', () => {
  const d = base(); d.primitives[0].modifiedBy = ['phantom'];
  assert.match(validate(d, files).join('\n'), /primitive attention: unknown modifier "phantom"/);
});

test('duplicate id within a collection -> error', () => {
  const d = base(); d.primitives.push({ ...d.primitives[0] });
  assert.match(validate(d, files).join('\n'), /primitives: duplicate id "attention"/);
});

// --- body-link lint ---
import { validateBodyLinks } from '../scripts/check_data.mjs';

const slugs = new Set(['bert', 'encoder']);

test('relative links to existing pages + external/hash links -> no errors', () => {
  const pages = { 'bert.md': 'See the [encoder](../encoder/), [paper](https://arxiv.org/abs/1810.04805), [below](#how-it-works).' };
  assert.deepEqual(validateBodyLinks(pages, slugs), []);
});

test('absolute internal link -> error (bypasses base path)', () => {
  const pages = { 'bert.md': 'See the [encoder](/concepts/encoder/).' };
  const errors = validateBodyLinks(pages, slugs);
  assert.equal(errors.length, 1);
  assert.match(errors[0], /absolute internal link/);
});

test('relative link to missing page -> error (dangling)', () => {
  const pages = { 'bert.md': 'See [tokenizers](../tokenization/).' };
  const errors = validateBodyLinks(pages, slugs);
  assert.equal(errors.length, 1);
  assert.match(errors[0], /missing concept page "tokenization"/);
});

test('unrecognized internal link shape -> error', () => {
  const pages = { 'bert.md': 'See [x](./weird/path).' };
  const errors = validateBodyLinks(pages, slugs);
  assert.equal(errors.length, 1);
  assert.match(errors[0], /unrecognized internal link/);
});

// --- differentiator lint ---
import { validateDifferentiators } from '../scripts/check_data.mjs';

test('collision group members all need differentiators', () => {
  const fams = [
    { id: 'a', modules: ['x'], objective: 'o', differentiator: 'plain' },
    { id: 'b', modules: ['x'], objective: 'o' },
  ];
  assert.match(validateDifferentiators(fams).join('\n'),
    /family b: shares recipe with a but has no differentiator/);
});

test('differentiator outside a collision group is flagged', () => {
  const fams = [
    { id: 'a', modules: ['x'], objective: 'o', differentiator: 'stray' },
    { id: 'b', modules: ['y'], objective: 'o' },
  ];
  assert.match(validateDifferentiators(fams).join('\n'),
    /family a: has a differentiator but no recipe collision/);
});

test('varies families are exempt from collision grouping', () => {
  const fams = [
    { id: 'cnn', modules: [], objective: 'varies' },
    { id: 'rnn', modules: [], objective: 'varies' },
  ];
  assert.deepEqual(validateDifferentiators(fams), []);
});

test('complete collision group passes', () => {
  const fams = [
    { id: 'a', modules: ['x'], objective: 'o', differentiator: 'one' },
    { id: 'b', modules: ['x'], objective: 'o', differentiator: 'two' },
  ];
  assert.deepEqual(validateDifferentiators(fams), []);
});

test('whitespace-only differentiator counts as missing', () => {
  const fams = [
    { id: 'a', modules: ['x'], objective: 'o', differentiator: '   ' },
    { id: 'b', modules: ['x'], objective: 'o', differentiator: 'real' },
  ];
  assert.match(validateDifferentiators(fams).join('\n'),
    /family a: shares recipe with b but has no differentiator/);
});

test('varies family with a stray differentiator is flagged', () => {
  const fams = [
    { id: 'cnn', modules: [], objective: 'varies', differentiator: 'stray' },
  ];
  assert.match(validateDifferentiators(fams).join('\n'),
    /family cnn: has a differentiator but no recipe collision/);
});

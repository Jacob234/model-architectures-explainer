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

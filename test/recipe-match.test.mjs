import { test } from 'node:test';
import assert from 'node:assert/strict';
import { matchRecipe } from '../src/scripts/recipe-match.js';

// Minimal fixture mirroring the real data's shapes (recipe-relevant fields only).
const FAMILIES = [
  { id: 'llm', modules: ['decoder', 'output-head'], objective: 'autoregressive' },
  { id: 'rag', modules: ['decoder', 'output-head'], objective: 'autoregressive' },
  { id: 'bert', modules: ['encoder', 'output-head'], objective: 'masked' },
  { id: 'vit', modules: ['encoder', 'output-head'], objective: 'varies' },
  { id: 'cnn', modules: [], objective: 'varies' },
  { id: 'energy', modules: [], objective: 'energy' },
  { id: 'vae', modules: ['encoder', 'decoder'], objective: 'reconstruction' },
];

const ids = (arr) => arr.map((f) => f.id);

test('exact match: module-set equality + objective equality', () => {
  const r = matchRecipe({ modules: ['output-head', 'encoder'], objective: 'masked' }, FAMILIES);
  assert.deepEqual(ids(r.exact), ['bert']); // order-insensitive module sets
});

test('collision: multiple exact matches returned together', () => {
  const r = matchRecipe({ modules: ['decoder', 'output-head'], objective: 'autoregressive' }, FAMILIES);
  assert.deepEqual(ids(r.exact), ['llm', 'rag']);
});

test('alsoFits: varies families match any objective on module equality', () => {
  const r = matchRecipe({ modules: ['encoder', 'output-head'], objective: 'masked' }, FAMILIES);
  assert.deepEqual(ids(r.alsoFits), ['vit']);
});

test('zero-module backbones surface only on empty module selection', () => {
  // null = no objective selected; never equals a real objective, so only 'varies' tiers can hit
  const empty = matchRecipe({ modules: [], objective: null }, FAMILIES);
  assert.deepEqual(ids(empty.alsoFits), ['cnn']);
  const nonEmpty = matchRecipe({ modules: ['encoder'], objective: null }, FAMILIES);
  assert.ok(!ids(nonEmpty.alsoFits).includes('cnn'));
});

test('energy-based: empty modules + concrete objective is an exact match', () => {
  const r = matchRecipe({ modules: [], objective: 'energy' }, FAMILIES);
  assert.deepEqual(ids(r.exact), ['energy']);
});

test('same modules but wrong concrete objective matches nothing', () => {
  const r = matchRecipe({ modules: ['encoder', 'decoder'], objective: 'masked' }, FAMILIES);
  assert.deepEqual(ids(r.exact), []); // vae needs reconstruction
  assert.deepEqual(ids(r.alsoFits), []);
});

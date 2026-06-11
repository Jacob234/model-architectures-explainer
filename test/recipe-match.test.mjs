import { test } from 'node:test';
import assert from 'node:assert/strict';
import { matchRecipe, editHint } from '../src/scripts/recipe-match.js';

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

test('oneStep: one module added', () => {
  const r = matchRecipe({ modules: ['decoder'], objective: 'autoregressive' }, FAMILIES);
  assert.ok(ids(r.oneStep).includes('llm')); // add output-head → llm
});

test('oneStep: objective swap counts as one edit', () => {
  const r = matchRecipe({ modules: ['encoder', 'decoder'], objective: 'masked' }, FAMILIES);
  assert.ok(ids(r.oneStep).includes('vae')); // swap masked → reconstruction
});

test('oneStep: varies objective contributes zero edits', () => {
  // encoder vs vit {encoder,output-head}: one module edit; objective wildcard free.
  const r = matchRecipe({ modules: ['encoder'], objective: 'contrastive' }, FAMILIES);
  assert.ok(ids(r.oneStep).includes('vit'));
});

test('oneStep excludes exact and alsoFits families, caps at 4', () => {
  const many = [
    { id: 'x1', modules: ['a'], objective: 'o' }, { id: 'x2', modules: ['b'], objective: 'o' },
    { id: 'x3', modules: ['c'], objective: 'o' }, { id: 'x4', modules: ['d'], objective: 'o' },
    { id: 'x5', modules: ['e'], objective: 'o' }, { id: 'hit', modules: [], objective: 'o' },
  ];
  const r = matchRecipe({ modules: [], objective: 'o' }, many);
  assert.deepEqual(ids(r.exact), ['hit']);
  assert.equal(r.oneStep.length, 4);
  assert.ok(!ids(r.oneStep).includes('hit'));
});

test('fallback: 2-edit neighbors only when all other tiers are empty', () => {
  const r = matchRecipe({ modules: ['encoder', 'predictor'], objective: 'reconstruction' }, FAMILIES);
  assert.equal(r.exact.length + r.alsoFits.length + r.oneStep.length, 0);
  assert.ok(ids(r.fallback).includes('vae')); // drop predictor + add decoder = 2 edits, objective matches
  const exactCase = matchRecipe({ modules: [], objective: 'energy' }, FAMILIES);
  assert.deepEqual(exactCase.fallback, []); // exact tier hit → no fallback
});

test('editHint describes the single edit', () => {
  const llm = FAMILIES[0];
  assert.deepEqual(editHint({ modules: ['decoder'], objective: 'autoregressive' }, llm),
    { kind: 'add', what: 'output-head' });
  assert.deepEqual(editHint({ modules: ['decoder', 'output-head', 'encoder'], objective: 'autoregressive' }, llm),
    { kind: 'drop', what: 'encoder' });
  assert.deepEqual(editHint({ modules: ['decoder', 'output-head'], objective: 'masked' }, llm),
    { kind: 'swap-objective', what: 'autoregressive' });
});

test('oneStep includes concrete-objective family when user has no objective set', () => {
  const r = matchRecipe({ modules: [], objective: null }, FAMILIES);
  // cnn goes to alsoFits (varies); energy is distance-1 (objective penalty only)
  assert.ok(ids(r.oneStep).includes('energy'));
  assert.deepEqual(editHint({ modules: [], objective: null }, FAMILIES.find((f) => f.id === 'energy')),
    { kind: 'swap-objective', what: 'energy' });
});

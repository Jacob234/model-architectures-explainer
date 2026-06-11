import { test } from 'node:test';
import assert from 'node:assert/strict';
import { extractFrontmatterSources, validateSources } from '../scripts/check_data.mjs';

const page = (sources) => `---
title: bert
tier: family
summary: s
sources:
${sources}
---

Body text.
`;

const goodSources = `  - label: "BERT (Devlin et al., 2018)"
    url: "https://arxiv.org/abs/1810.04805"
    type: paper
  - label: "The Illustrated BERT (Jay Alammar, 2018)"
    url: "https://jalammar.github.io/illustrated-bert/"
    type: blog`;

const slugs = new Set(['bert', 'encoder']);
const candidate = () => ({
  id: 'tokenization', name: 'tokenization', tier: 'primitive', blurb: 'b', note: 'n',
  sources: [{ label: 'Karpathy tokenizer video', url: 'https://www.youtube.com/watch?v=zduSFxRajkE', type: 'video' }],
});

test('frontmatter extraction round-trips a realistic page', () => {
  const { sources, declared } = extractFrontmatterSources(page(goodSources));
  assert.equal(declared, 2);
  assert.deepEqual(sources, [
    { label: 'BERT (Devlin et al., 2018)', url: 'https://arxiv.org/abs/1810.04805', type: 'paper' },
    { label: 'The Illustrated BERT (Jay Alammar, 2018)', url: 'https://jalammar.github.io/illustrated-bert/', type: 'blog' },
  ]);
});

test('page without frontmatter or sources -> empty extraction', () => {
  assert.deepEqual(extractFrontmatterSources('no frontmatter here'), { sources: [], declared: 0 });
  const { sources, declared } = extractFrontmatterSources('---\ntitle: x\n---\nbody');
  assert.deepEqual({ sources, declared }, { sources: [], declared: 0 });
});

test('valid pages + candidates -> no errors', () => {
  const errors = validateSources({ pages: { 'bert.md': page(goodSources) }, candidates: [candidate()], conceptSlugs: slugs });
  assert.deepEqual(errors, []);
});

test('source entry missing type -> formatting error (declared vs parsed mismatch)', () => {
  const src = `  - label: "BERT"\n    url: "https://arxiv.org/abs/1810.04805"`;
  const errors = validateSources({ pages: { 'bert.md': page(src) }, candidates: [], conceptSlugs: slugs });
  assert.equal(errors.length, 1);
  assert.match(errors[0], /1 source entry declared but only 0 parse/);
});

test('unknown source type -> error', () => {
  const c = candidate(); c.sources[0].type = 'podcast';
  const errors = validateSources({ pages: {}, candidates: [c], conceptSlugs: slugs });
  assert.match(errors.join('\n'), /unknown type "podcast"/);
});

test('non-https url -> error', () => {
  const c = candidate(); c.sources[0].url = 'http://example.com/x';
  const errors = validateSources({ pages: {}, candidates: [c], conceptSlugs: slugs });
  assert.match(errors.join('\n'), /must use https/);
});

test('invalid url -> error', () => {
  const c = candidate(); c.sources[0].url = 'not a url';
  const errors = validateSources({ pages: {}, candidates: [c], conceptSlugs: slugs });
  assert.match(errors.join('\n'), /invalid url/);
});

test('duplicate url within one topic -> error; across topics -> allowed', () => {
  const dup = `${goodSources}
  - label: "Same paper again"
    url: "https://arxiv.org/abs/1810.04805"
    type: paper`;
  const within = validateSources({ pages: { 'bert.md': page(dup) }, candidates: [], conceptSlugs: slugs });
  assert.match(within.join('\n'), /duplicate source url/);
  const across = validateSources({
    pages: { 'bert.md': page(goodSources), 'encoder.md': page(goodSources) },
    candidates: [], conceptSlugs: slugs,
  });
  assert.deepEqual(across, []);
});

test('candidate id colliding with concept slug -> error', () => {
  const c = candidate(); c.id = 'bert';
  const errors = validateSources({ pages: {}, candidates: [c], conceptSlugs: slugs });
  assert.match(errors.join('\n'), /candidate "bert" collides/);
});

test('candidate with bad tier or non-array sources -> error', () => {
  const c = candidate(); c.tier = 'mega'; c.sources = 'nope';
  const errors = validateSources({ pages: {}, candidates: [c], conceptSlugs: slugs });
  assert.match(errors.join('\n'), /unknown tier "mega"/);
  assert.match(errors.join('\n'), /sources must be an array/);
});

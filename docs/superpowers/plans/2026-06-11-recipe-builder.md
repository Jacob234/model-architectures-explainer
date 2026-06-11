# Recipe Builder Island Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** An interactive `/builder/` page where users compose module + objective recipes and see which model families match, with explore-mode deep links from family concept pages.

**Architecture:** Pure-JS matcher (`recipe-match.js`, node:test-covered) consumed by a Svelte 5 island (`RecipeBuilder.svelte`, the site's first hydration framework) on a static Astro page. New `differentiator` one-liners in `explainer.json` for the 4 recipe-collision groups, enforced by a new lint in `check_data.mjs`.

**Tech Stack:** Astro 5, Svelte 5 (runes), `node:test`, vanilla JS data layer. No other new dependencies.

**Spec:** `docs/superpowers/specs/2026-06-11-recipe-builder-design.md`. One deviation: the spec mentions a zod field for `differentiator` — zod only validates markdown frontmatter, not `explainer.json`, so validation is `check_data.mjs` only.

**Repo conventions that bite:**
- `npm test` glob requires the quoted form already in package.json; run single files as `node --test test/<file>.test.mjs`.
- `explainer.json` is hand-formatted — edit textually, never `JSON.stringify` the whole file; parse-check after editing.
- All internal links must be base-path aware (`import.meta.env.BASE_URL`), site deploys under `/model-architectures-explainer/`.
- `.claude/` stays local; everything else is a public repo.

---

### Task 1: Add the Svelte integration

**Files:**
- Modify: `astro.config.mjs`, `package.json` (via `astro add`)

- [ ] **Step 1: Run the official integration installer**

```bash
npx astro add svelte --yes
```

Expected: installs `@astrojs/svelte` + `svelte` into `package.json` dependencies and rewrites `astro.config.mjs` to:

```js
import { defineConfig } from 'astro/config';
import svelte from '@astrojs/svelte';

export default defineConfig({
  site: 'https://jacob234.github.io',
  base: '/model-architectures-explainer',
  integrations: [svelte()],
});
```

If the installer reorders/reformats beyond this, hand-edit back to match the original file plus the two svelte lines.

- [ ] **Step 2: Verify the build still passes with zero islands**

Run: `npm run build`
Expected: success, 42 pages (unchanged).

- [ ] **Step 3: Verify existing gates**

Run: `npm run check && npm test`
Expected: check prints `OK ... families=24 concepts=40 candidates=0 sources=147`; 24 tests pass.

- [ ] **Step 4: Commit**

```bash
git add package.json package-lock.json astro.config.mjs
git commit -m "Add Svelte 5 integration — first island framework (per recipe-builder spec)"
```

---

### Task 2: Matcher — exact and alsoFits tiers (TDD)

**Files:**
- Create: `src/scripts/recipe-match.js`
- Test: `test/recipe-match.test.mjs`

- [ ] **Step 1: Write the failing tests**

Create `test/recipe-match.test.mjs`:

```js
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
  const empty = matchRecipe({ modules: [], objective: null }, FAMILIES);
  assert.deepEqual(ids(empty.alsoFits), ['cnn']);
  const nonEmpty = matchRecipe({ modules: ['encoder'], objective: null }, FAMILIES);
  assert.ok(!ids(nonEmpty.alsoFits).includes('cnn'));
});

test('energy-based: empty modules + concrete objective is an exact match', () => {
  const r = matchRecipe({ modules: [], objective: 'energy' }, FAMILIES);
  assert.deepEqual(ids(r.exact), ['energy']);
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `node --test test/recipe-match.test.mjs`
Expected: FAIL — `Cannot find module .../src/scripts/recipe-match.js`

- [ ] **Step 3: Implement the two tiers**

Create `src/scripts/recipe-match.js`:

```js
// Pure recipe matcher for the builder island. No DOM, no Svelte — keep it
// importable by node:test directly.
const setEq = (a, b) => a.size === b.size && [...a].every((x) => b.has(x));

export function matchRecipe({ modules, objective }, families) {
  const sel = new Set(modules);
  const exact = [];
  const alsoFits = [];
  for (const f of families) {
    const fam = new Set(f.modules ?? []);
    if (!setEq(sel, fam)) continue;
    if (f.objective === objective) exact.push(f);
    else if (f.objective === 'varies') alsoFits.push(f);
  }
  return { exact, alsoFits, oneStep: [], fallback: [] };
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `node --test test/recipe-match.test.mjs`
Expected: 5 pass.

- [ ] **Step 5: Commit**

```bash
git add src/scripts/recipe-match.js test/recipe-match.test.mjs
git commit -m "Add recipe matcher: exact + alsoFits tiers"
```

---

### Task 3: Matcher — oneStep hints, fallback, editHint (TDD)

**Files:**
- Modify: `src/scripts/recipe-match.js`
- Test: `test/recipe-match.test.mjs`

- [ ] **Step 1: Write the failing tests** (append to `test/recipe-match.test.mjs`)

```js
import { editHint } from '../src/scripts/recipe-match.js';

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
```

- [ ] **Step 2: Run tests to verify the new ones fail**

Run: `node --test test/recipe-match.test.mjs`
Expected: first 5 pass; new 6 FAIL (oneStep empty / editHint not exported).

- [ ] **Step 3: Implement distance, tiers 3–4, and editHint**

Replace the body of `src/scripts/recipe-match.js` with:

```js
// Pure recipe matcher for the builder island. No DOM, no Svelte — keep it
// importable by node:test directly.
const setEq = (a, b) => a.size === b.size && [...a].every((x) => b.has(x));

// Edit distance between a selection and a family recipe: one per module
// added/dropped, one for an objective mismatch. 'varies' objectives are
// wildcards and contribute zero edits.
function distance(sel, objective, f) {
  const fam = new Set(f.modules ?? []);
  let d = 0;
  for (const m of fam) if (!sel.has(m)) d += 1;
  for (const m of sel) if (!fam.has(m)) d += 1;
  if (f.objective !== 'varies' && f.objective !== objective) d += 1;
  return d;
}

export function matchRecipe({ modules, objective }, families) {
  const sel = new Set(modules);
  const exact = [];
  const alsoFits = [];
  const rest = [];
  for (const f of families) {
    const fam = new Set(f.modules ?? []);
    if (setEq(sel, fam) && f.objective === objective) exact.push(f);
    else if (setEq(sel, fam) && f.objective === 'varies') alsoFits.push(f);
    else rest.push(f);
  }
  const oneStep = rest.filter((f) => distance(sel, objective, f) === 1).slice(0, 4);
  const fallback = exact.length || alsoFits.length || oneStep.length
    ? []
    : rest.filter((f) => distance(sel, objective, f) === 2).slice(0, 4);
  return { exact, alsoFits, oneStep, fallback };
}

// Describe the single edit separating a oneStep family from the selection.
// Only meaningful for distance-1 families.
export function editHint({ modules, objective }, f) {
  const sel = new Set(modules);
  const fam = new Set(f.modules ?? []);
  const add = [...fam].filter((m) => !sel.has(m));
  const drop = [...sel].filter((m) => !fam.has(m));
  if (add.length === 1 && drop.length === 0) return { kind: 'add', what: add[0] };
  if (drop.length === 1 && add.length === 0) return { kind: 'drop', what: drop[0] };
  return { kind: 'swap-objective', what: f.objective };
}
```

- [ ] **Step 4: Run the full suite**

Run: `npm test`
Expected: 35 pass (24 existing + 11 matcher).

- [ ] **Step 5: Commit**

```bash
git add src/scripts/recipe-match.js test/recipe-match.test.mjs
git commit -m "Add matcher oneStep hints, 2-edit fallback, and editHint"
```

---

### Task 4: Differentiators — collision-coverage lint (TDD) + the 9 data lines

**Files:**
- Modify: `scripts/check_data.mjs`, `src/data/explainer.json`
- Test: `test/check_data.test.mjs`

- [ ] **Step 1: Write the failing lint tests** (append to `test/check_data.test.mjs`)

```js
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
```

- [ ] **Step 2: Run to verify failure**

Run: `node --test test/check_data.test.mjs`
Expected: FAIL — `validateDifferentiators` is not exported.

- [ ] **Step 3: Implement the lint**

In `scripts/check_data.mjs`, add after `validateSources` (before the `if (process.argv[1]...)` block):

```js
// --- differentiator lint ---
// Families sharing an exact (modules-set, objective) recipe MUST each carry a
// `differentiator` one-liner (the builder shows these at collision time), and
// only collision members may carry one — keeps the field meaningful.
// 'varies' objectives are wildcard backbones, exempt from grouping.
export function validateDifferentiators(families) {
  const errors = [];
  const groups = new Map();
  for (const f of families) {
    if (f.objective === 'varies') continue;
    const key = `${[...(f.modules ?? [])].sort().join('+')}|${f.objective}`;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(f);
  }
  const inCollision = new Set();
  for (const members of groups.values()) {
    if (members.length < 2) continue;
    for (const f of members) {
      inCollision.add(f.id);
      if (typeof f.differentiator !== 'string' || !f.differentiator.trim()) {
        const others = members.filter((m) => m !== f).map((m) => m.id).join(', ');
        errors.push(`family ${f.id}: shares recipe with ${others} but has no differentiator`);
      }
    }
  }
  for (const f of families) {
    if (f.differentiator != null && !inCollision.has(f.id)) {
      errors.push(`family ${f.id}: has a differentiator but no recipe collision`);
    }
  }
  return errors;
}
```

Then wire it into the CLI main block — after the `errors.push(...validateSources(...))` line add:

```js
  errors.push(...validateDifferentiators(data.families));
```

- [ ] **Step 4: Run lint tests, then the real check (expect the real check to FAIL)**

Run: `node --test test/check_data.test.mjs`
Expected: all pass.
Run: `npm run check`
Expected: FAIL listing 9 families missing differentiators (autoencoder, vae, vq-vae, vlm, vla, llm, retrieval-augmented, flow-matching, rectified-flow) — this proves the lint sees the real collisions.

- [ ] **Step 5: Add the 9 differentiator lines to `explainer.json`**

> **Wording checkpoint:** these drafts follow the spec convention (short, contrastive, lowercase fragment). The project author wants editorial say here — offer them the chance to reword before committing.

Edit `src/data/explainer.json` **textually** (preserve hand formatting; never reserialize the file). For each family below, insert one line immediately before its `"slug":` line, indented 5 spaces to match continuation lines:

| family id | line to insert |
|---|---|
| `llm` | `"differentiator": "answers from weights alone — everything it knows was baked in at training",` |
| `retrieval-augmented` | `"differentiator": "bolts a retriever on — fetches documents into context at inference time",` |
| `vlm` | `"differentiator": "a vision encoder feeds image tokens to a language decoder that talks about them",` |
| `vla` | `"differentiator": "same wiring, but the decoder outputs robot actions instead of just text",` |
| `vae` | `"differentiator": "the latent is a probability distribution you can sample new data from",` |
| `autoencoder` | `"differentiator": "the plain version — compress through a bottleneck and rebuild, nothing else",` |
| `vq-vae` | `"differentiator": "the latent snaps to a discrete codebook entry — tokens for images",` |
| `flow-matching` | `"differentiator": "learns a velocity field along any noise-to-data path",` |
| `rectified-flow` | `"differentiator": "straightens that path so generation takes only a few steps",` |

Example (`vae` entry after edit):

```json
    {"id": "vae", "name": "VAE", "tier": "core", "kind": "generative-framework",
     "modules": ["encoder", "decoder"], "objective": "reconstruction",
     "blurb": "An autoencoder whose bottleneck is a probability distribution — rebuild the input, but keep the latent space smooth enough to sample new data from (ELBO = reconstruction + KL).",
     "differentiator": "the latent is a probability distribution you can sample new data from",
     "slug": "variational-autoencoders"},
```

- [ ] **Step 6: Parse-check and run gates**

Run: `python3 -c "import json; json.load(open('src/data/explainer.json')); print('parse ok')"`
Expected: `parse ok`
Run: `npm run check && npm test`
Expected: check prints OK (families=24, all 9 differentiators satisfied); all tests pass.

- [ ] **Step 7: Commit**

```bash
git add scripts/check_data.mjs test/check_data.test.mjs src/data/explainer.json
git commit -m "Add differentiator one-liners for the 4 recipe-collision groups + coverage lint"
```

---

### Task 5: The island — `RecipeBuilder.svelte` + `/builder/` page + nav

**Files:**
- Create: `src/components/RecipeBuilder.svelte`
- Create: `src/pages/builder.astro`
- Modify: `src/layouts/Base.astro:7-10` (navLinks array)

- [ ] **Step 1: Create the Svelte component**

Create `src/components/RecipeBuilder.svelte`:

```svelte
<script>
  import { onMount } from 'svelte';
  import data from '../data/explainer.json';
  import { matchRecipe, editHint } from '../scripts/recipe-match.js';

  const moduleDefs = data.modules;
  const objectiveDefs = data.objectives;
  const families = data.families;
  const base = import.meta.env.BASE_URL.replace(/\/$/, '');

  let mods = $state([]);
  let objective = $state(null);
  let exploring = $state(null); // family object while the explore-mode header shows

  const pristine = $derived(mods.length === 0 && objective === null);
  const result = $derived(matchRecipe({ modules: mods, objective }, families));

  onMount(() => {
    const q = new URLSearchParams(location.search);
    const fam = families.find((f) => f.id === q.get('family'));
    if (fam) {
      mods = [...(fam.modules ?? [])];
      objective = fam.objective === 'varies' ? null : fam.objective;
      exploring = fam;
      return;
    }
    mods = (q.get('m') ?? '').split(',').filter((id) => moduleDefs.some((d) => d.id === id));
    const o = q.get('o');
    objective = objectiveDefs.some((d) => d.id === o) ? o : null;
  });

  function syncURL() {
    exploring = null; // first edit dismisses the explore header
    const q = new URLSearchParams();
    if (mods.length) q.set('m', mods.join(','));
    if (objective) q.set('o', objective);
    history.replaceState(null, '', q.size ? `?${q}` : location.pathname);
  }
  function toggleModule(id) {
    mods = mods.includes(id) ? mods.filter((x) => x !== id) : [...mods, id];
    syncURL();
  }
  function setObjective(id) {
    objective = objective === id ? null : id;
    syncURL();
  }

  const moduleName = (id) => moduleDefs.find((d) => d.id === id)?.name ?? id;
  const famHref = (f) => (f.slug ? `${base}/concepts/${f.slug}/` : null);
  function hintText(f) {
    const h = editHint({ modules: mods, objective }, f);
    if (h.kind === 'add') return `add ${moduleName(h.what)}`;
    if (h.kind === 'drop') return `drop ${moduleName(h.what)}`;
    return `swap objective to ${h.what}`;
  }
</script>

{#if exploring}
  <p class="explore-note">
    exploring <strong>{exploring.name}</strong>'s recipe — mutate it and see where you land
  </p>
{/if}

<section class="picker" aria-label="Recipe inputs">
  <h2>modules</h2>
  <div class="chips">
    {#each moduleDefs as m (m.id)}
      <button class="chip" class:on={mods.includes(m.id)} aria-pressed={mods.includes(m.id)}
        title={m.blurb} onclick={() => toggleModule(m.id)}>{m.name}</button>
    {/each}
  </div>
  <h2>objective</h2>
  <div class="chips">
    {#each objectiveDefs as o (o.id)}
      <button class="chip obj" class:on={objective === o.id} aria-pressed={objective === o.id}
        style={`--obj: ${o.color}`} title={o.blurb} onclick={() => setObjective(o.id)}>{o.name}</button>
    {/each}
  </div>
</section>

<section class="results" aria-live="polite" aria-label="Matching families">
  {#if pristine}
    <p class="muted">pick some modules and an objective — or open a family from its page</p>
  {:else}
    {#if result.exact.length}
      <h2>{result.exact.length === 1 ? 'you built' : `${result.exact.length} families share this recipe`}</h2>
      <ul>
        {#each result.exact as f (f.id)}
          <li>
            {#if famHref(f)}<a href={famHref(f)}>{f.name}</a>{:else}<strong>{f.name}</strong>{/if}
            <span class="why">— {result.exact.length > 1 ? f.differentiator : f.blurb}</span>
          </li>
        {/each}
      </ul>
    {/if}
    {#if result.alsoFits.length}
      <h2>also fits <span class="muted">(objective is your choice)</span></h2>
      <ul>
        {#each result.alsoFits as f (f.id)}
          <li>
            {#if famHref(f)}<a href={famHref(f)}>{f.name}</a>{:else}<strong>{f.name}</strong>{/if}
            <span class="why">— {f.blurb}</span>
          </li>
        {/each}
      </ul>
    {/if}
    {#if result.oneStep.length}
      <h2>one step away</h2>
      <ul>
        {#each result.oneStep as f (f.id)}
          <li><span class="hint">{hintText(f)}</span> →
            {#if famHref(f)}<a href={famHref(f)}>{f.name}</a>{:else}<strong>{f.name}</strong>{/if}
          </li>
        {/each}
      </ul>
    {/if}
    {#if !result.exact.length && !result.alsoFits.length && !result.oneStep.length}
      <h2>nothing canonical has this recipe (yet)</h2>
      {#if result.fallback.length}
        <p class="muted">nearest neighbors:</p>
        <ul>
          {#each result.fallback as f (f.id)}
            <li>{#if famHref(f)}<a href={famHref(f)}>{f.name}</a>{:else}<strong>{f.name}</strong>{/if}</li>
          {/each}
        </ul>
      {/if}
    {/if}
  {/if}
</section>

<style>
  .picker h2, .results h2 { font-size: 13px; text-transform: uppercase; letter-spacing: 0.06em;
    color: var(--muted, #9aa3ad); margin: 18px 0 8px; }
  .chips { display: flex; flex-wrap: wrap; gap: 8px; }
  .chip { background: var(--node); border: 1px solid var(--edge); border-radius: 6px;
    color: inherit; font: inherit; font-size: 13.5px; padding: 5px 11px; cursor: pointer; }
  .chip:hover { border-color: var(--accent); }
  .chip.on { border-color: var(--accent); background: var(--node-hi); }
  .chip.obj.on { border-color: var(--obj); box-shadow: inset 0 0 0 1px var(--obj); }
  .results ul { list-style: none; padding: 0; margin: 0 0 14px; }
  .results li { padding: 4px 0; }
  .why { color: var(--muted, #9aa3ad); }
  .hint { color: var(--muted, #9aa3ad); font-style: italic; }
  .muted { color: var(--muted, #9aa3ad); }
  .explore-note { border: 1px dashed var(--edge); border-radius: 8px; padding: 8px 12px;
    color: var(--muted, #9aa3ad); }
</style>
```

- [ ] **Step 2: Create the page**

Create `src/pages/builder.astro`:

```astro
---
import Base from '../layouts/Base.astro';
import RecipeBuilder from '../components/RecipeBuilder.svelte';
const base = import.meta.env.BASE_URL.replace(/\/$/, '');
---
<Base title="Recipe Builder — Model Architectures"
  description="Compose modules and a training objective; see which model families match.">
  <main class="builder-page">
    <h1>Recipe builder</h1>
    <p>
      Every family on the <a href={`${base}/`}>map</a> is a recipe:
      <strong>modules + a training objective</strong>. Pick parts and see what
      you've built — recipes that match several families are the interesting ones.
    </p>
    <RecipeBuilder client:load />
    <noscript><p>The builder needs JavaScript — explore the <a href={`${base}/`}>map</a> instead.</p></noscript>
  </main>
</Base>

<style>
  .builder-page { max-width: 760px; margin: 0 auto; padding: 24px 20px 64px; }
</style>
```

- [ ] **Step 3: Add the nav link**

In `src/layouts/Base.astro`, change the `navLinks` array (lines 7–10) to:

```js
const navLinks = [
  { href: `${base}/`, label: 'map' },
  { href: `${base}/sources/`, label: 'sources' },
  { href: `${base}/builder/`, label: 'builder' },
];
```

- [ ] **Step 4: Build and verify the page + island made it into dist**

Run: `npm run build`
Expected: success, **43 pages** (was 42).
Run: `ls dist/builder/index.html && grep -rl "one step away" dist/_astro/ | head -1`
Expected: both paths print (island JS bundle contains the results-panel strings).

- [ ] **Step 5: Manual smoke test in dev**

Run: `npm run dev` then open `http://localhost:4321/model-architectures-explainer/builder/`
Check: chips toggle; selecting encoder+decoder+reconstruction shows the 3-way collision with differentiators; URL rewrites to `?m=...&o=...`; `?family=vae` seeds explore mode with a header that disappears on first edit; empty selection shows the 4 backbones under "also fits".

- [ ] **Step 6: Run all gates**

Run: `npm run check && npm test`
Expected: all green.

- [ ] **Step 7: Commit**

```bash
git add src/components/RecipeBuilder.svelte src/pages/builder.astro src/layouts/Base.astro
git commit -m "Add recipe-builder island: /builder/ page, Svelte component, nav link"
```

---

### Task 6: Deep links from family concept pages

**Files:**
- Modify: `src/pages/concepts/[slug].astro`

- [ ] **Step 1: Add the family lookup and link**

In `src/pages/concepts/[slug].astro`, add to the frontmatter (after the existing `base` line at line 12):

```js
import explainer from '../../data/explainer.json';
const family = explainer.families.find((f) => f.slug === entry.id);
```

Then in the template, directly after the `<p class="summary">…</p>` line, add:

```astro
    {family && (
      <p class="builder-link">
        <a href={`${base}/builder/?family=${family.id}`}>▸ open this recipe in the builder</a>
      </p>
    )}
```

- [ ] **Step 2: Build and spot-check**

Run: `npm run build`
Expected: success, 43 pages.
Run: `grep -o 'builder/?family=vae' dist/concepts/variational-autoencoders/index.html && grep -c 'builder/?family=' dist/concepts/attention-mechanisms/index.html || true`
Expected: first grep prints the link; second prints `0` (primitives get no builder link).

- [ ] **Step 3: Run all gates**

Run: `npm run check && npm test`
Expected: all green.

- [ ] **Step 4: Commit**

```bash
git add src/pages/concepts/[slug].astro
git commit -m "Link family pages into the recipe builder (?family= deep links)"
```

---

### Task 7: Ship and verify live

**Files:** none (deploy + verification only)

- [ ] **Step 1: Final full gate run**

Run: `npm run build && npm run check && npm test`
Expected: 43 pages, check OK, all tests pass.

- [ ] **Step 2: Push (this triggers the Pages deploy)**

```bash
git push origin main
```

- [ ] **Step 3: Wait for the deploy workflow**

```bash
until gh run list --branch main --limit 1 --json status --jq '.[0].status' | grep -q completed; do sleep 20; done
gh run list --branch main --limit 1
```

Expected: latest run `success`.

- [ ] **Step 4: Verify live (Pages HTML cache is ~10 min — retry if stale)**

```bash
curl -s -o /dev/null -w "%{http_code}\n" https://jacob234.github.io/model-architectures-explainer/builder/
curl -s https://jacob234.github.io/model-architectures-explainer/concepts/variational-autoencoders/ | grep -o 'builder/?family=vae' | head -1
```

Expected: `200` and the deep link string.

- [ ] **Step 5: Update the spec status line**

In `docs/superpowers/specs/2026-06-11-recipe-builder-design.md`, change `**Status:** Approved (brainstorm complete)` to `**Status:** Implemented (2026-06-11)`, then:

```bash
git add docs/superpowers/specs/2026-06-11-recipe-builder-design.md
git commit -m "Mark recipe-builder spec implemented"
git push origin main
```

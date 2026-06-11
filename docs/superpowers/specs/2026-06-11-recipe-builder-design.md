# Recipe Builder Island — Design

**Date:** 2026-06-11
**Status:** Approved (brainstorm complete)
**Context:** First interactive island beyond the ladder map. Survived the
"interactive exists" filter on /sources/ — no external explainer covers this
site's modules + objective recipe framing.

## Purpose

An interactive widget that makes the site's central idea manipulable: every
model family is a recipe of **modules + a training objective**. Users compose
recipes from chips and see which families match — or start from a family and
mutate its recipe to see where they land.

The pedagogical payoff is deliberate: recipes **collide**. Four groups of
families share an exact recipe (e.g. encoder + decoder + reconstruction is
autoencoder, VAE, *and* VQ-VAE). The builder surfaces the collision and shows
the one-line differentiator for each member — the recipe grammar gets you to a
neighborhood; the differentiators (and concept pages) split the neighbors.

## Decisions (made during brainstorm)

1. **Core loop: both directions.** Free-form build mode (blank canvas) and
   explore mode (seeded from a family, launched from its concept page). One
   engine serves both; the only difference is initial state.
2. **Placement: dedicated `/builder/` page** joining the `map · sources` nav.
   Family concept pages deep-link in with `?family={id}`.
3. **Collisions: new `differentiator` one-liners** (9 lines across 4 groups),
   stored in `explainer.json`, lint-enforced.
4. **Misfit families: wildcard + secondary tier.** `objective: "varies"`
   families match any objective and render in an "also fits" tier;
   zero-module backbones appear only on an empty module selection.
5. **Tech: Svelte 5** (`@astrojs/svelte`) — the site's first hydration
   framework, adopted deliberately. Supersedes v1's zero-framework invariant:
   the map stays vanilla; new interactive work defaults to Svelte islands.
   Runes fit the widget exactly (`$state` selection, `$derived` matches);
   scoped styles match the Astro authoring model; compiles to a few kB.

## Data model

### `explainer.json`

Families that share an exact recipe with another family gain:

```json
"differentiator": "latent is a distribution you can sample from"
```

Current collision groups (computed from recipes, 9 lines total):

| Shared recipe | Members |
| --- | --- |
| encoder + decoder + reconstruction | autoencoder, vae, vq-vae |
| encoder + decoder + autoregressive | vlm, vla |
| decoder + output-head + autoregressive | llm, retrieval-augmented |
| denoiser + flow-matching | flow-matching, rectified-flow |

Editorial convention: short, contrastive, lowercase fragment (reads after the
family name with an em-dash); contrasts against the *other group members*,
not a standalone description. Final wording is an implementation-phase
deliverable, drafted against the concept pages' own framing.

### Validation

- Zod (content config / data schema): optional `differentiator` string on
  families.
- `check_data.mjs` gains a **collision-coverage lint**: compute collision
  groups from `(modules-set, objective)` keys; every member of a >1 group
  must have a `differentiator`, and no family outside a collision group may
  have one (keeps the field meaningful). New fixture tests follow the
  existing pattern. A future third-ring family that creates a new collision
  fails `npm run check` until its contrastive lines are written.

## Matcher

`src/scripts/recipe-match.js` — pure, framework-free, no DOM.

```
matchRecipe({ modules: Set<string>, objective: string|null }, families)
  → { exact: [...], alsoFits: [...], oneStep: [...] }
```

Tiers:

1. **Exact** — module-set equality AND objective equality. Multiple hits
   render with differentiators.
2. **Also fits** — module-set equality, family objective is `"varies"`.
   Zero-module backbones (cnn, rnn, ssm, gnn) therefore surface only when no
   modules are selected. `energy-based` (zero modules, concrete objective)
   needs no special case: empty selection + energy objective is an exact
   match by rule 1.
3. **One step away** — recipe differs by exactly one edit (add a module,
   drop a module, or swap objective). For `"varies"` families the objective
   contributes zero edits (wildcard), so e.g. world-models is one edit from a
   JEPA selection (add decoder). Rendered as actionable hints ("add an
   output-head → LLM"). Capped at 4; excludes exact- and alsoFits-tier
   families.

Empty result across all tiers → friendly dead-end: "nothing canonical has
this recipe (yet)" + nearest 2-edit families as fallback hints.

**Out of scope (v1):** modifiers (MoE, GQA) — they apply to primitives, a
different grammar layer. Candidate v2 axis.

## Components & files

| File | Role |
| --- | --- |
| `src/components/RecipeBuilder.svelte` | The island: module chips (7), objective radios (9), three-tier results panel. `$state` selection, `$derived` via matcher. Scoped styles reuse the site's chip/pill look. |
| `src/scripts/recipe-match.js` | Pure matcher (above). |
| `src/pages/builder.astro` | Static shell: title, one-paragraph framing, `<RecipeBuilder client:load />`, `<noscript>` pointing at the map. |
| `astro.config.mjs` + `package.json` | Add `@astrojs/svelte` + `svelte` (only new deps). |
| `src/layouts/Base.astro` | Nav becomes `map · sources · builder`. |
| `src/pages/concepts/[slug].astro` | Family pages (entries with a recipe) get "open in recipe builder ›" → `{base}/builder/?family={id}`. |

Hydration: `client:load` — the page exists solely for the widget; deferring
hydration only adds first-click latency.

## URL state

- `?family=vae` → explore mode: seed selection with that family's recipe;
  show a header "exploring **VAE**'s recipe — mutate it and see where you
  land," dismissed on first edit.
- After any interaction, rewrite via `history.replaceState` to canonical
  `?m=encoder,decoder&o=reconstruction` — every state shareable.
- No params → blank canvas.
- Invalid params (unknown family/module/objective tokens) → silently
  dropped, fall back to blank canvas. No error UI.
- All links base-path aware (GitHub Pages subpath), matching existing pages.

## Error handling

The widget has no failable user actions: inputs are toggles over a closed
vocabulary, bad URLs degrade to blank canvas, and the no-match state is a
designed outcome, not an error. `<noscript>` covers JS-off.

## Testing & gates

- `test/recipe-match.test.mjs` (node:test, existing glob): exact match; each
  collision group; wildcard tier; backbones on empty selection; energy-based
  exact-on-empty; one-edit hints (add/drop/swap); hint cap; exact-tier
  exclusion from hints; empty-state fallback.
- `check_data.mjs` fixture tests for the collision-coverage lint (both
  directions: missing differentiator in a group; stray differentiator
  outside one).
- `npm run build` now exercises the Svelte compile (42 → 43 pages).
- Deploy-verify: curl `/builder/` for 200; grep the dist bundle for the
  island.

## Non-goals (v1)

- Modifiers (MoE/GQA) as a build axis.
- Backbone selector as a third grammar dimension.
- Embedding the island inline on concept pages (deep links instead).
- Animation / drag-and-drop.

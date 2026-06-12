# Content inventory — what the site knows vs. what it shows

**Date**: 2026-06-11 · **State audited**: `main` @ `8aefdc8` (recipe builder shipped)
**Scope**: every information unit in `src/data/explainer.json`, the 40 concept pages,
and the four UI surfaces (map, concept pages, /sources/, /builder/) — cross-referenced
to find (a) gaps in coverage and (b) data that exists but is hidden or under-surfaced.

> **Clarified**: the "attached materials" are the site's *outward links* — the
> external sources the site delegates coverage to. Analyzed in §5.

---

## 1. Raw stock — what exists

### explainer.json (the data spine)

| Collection | Count | Fields | Optional fields (count carrying them) |
|---|---|---|---|
| primitives | 11 | id, name, tier, blurb, slug | `modifiedBy` (2: attention→gqa, feed-forward→moe) |
| modules | 7 | id, name, blurb, primitives, slug | `variants` (1: denoiser → U-Net *(no slug)*, DiT *(slug)*); slug is null on 2 (denoiser, generator-discriminator) |
| modifiers | 2 | id, name, appliesTo, blurb, slug | — |
| objectives | 9 | id, name, color, blurb | — (no slug field at all; objectives can never have pages today) |
| families | 24 | id, name, tier, kind, modules, objective, blurb, slug | `variants` prose (5: llm, encoder-decoder, clip, vlm, world-models) · `differentiator` (9, lint-pinned to the 4 collision groups) · `deepDive` (4: llm, cnn, diffusion, gan) · direct `primitives` (6: cnn, rnn, ssm, gnn, energy-based, retrieval-augmented) |

### Concept pages (src/content/concepts/, 40 files)

- Tiers: 24 family · 8 primitive · 6 module · 2 modifier.
- Frontmatter: title, tier, kind (families only), summary, sources (label/url/type).
- **147 sources**: 69 paper · 48 blog · 21 explainer · 9 video. Zero pages with no sources.
- Bodies: 196–616 words, relative `../slug/` cross-links (linted).
- Three pages serve two nodes each (primitive + family share a slug): CNN, RNN, SSM.
- `diffusion-transformer.md` exists only as a denoiser *variant* slug — not a
  top-level module entry.

### Other stock

- `candidates.json`: **empty**. The queue mechanism (typed sources for page-less
  topics, rendered on /sources/, id-collision lint) exists but holds nothing.
- Derived-at-runtime data: family primitive-set union (`famPrims`), recipe
  collision groups, builder edit-distance hints, /sources/ "interactive exists"
  flag (≥1 explainer-type source), map reading order.

## 2. Surfaces — where information can appear

1. **Map grid** (`/`): node name, kind badge, objective dot/color, tier (advanced toggle), blurb (hover tooltip).
2. **Map detail panel** (on click): blurb, kind, recipe (module chips + objective chip), "Uses primitives" line, family `variants` caveat, module `variants` list, modifier `appliesTo`, page link, `deepDive` button. Hash deep-links (`#family-llm`).
3. **Concept page**: frontmatter (tier · kind, title, summary), prose body, sources list with type tags, builder deep link (families only), Locator (back-to-map hash + prev/next within tier).
4. **/sources/**: all 147 sources grouped by tier in map reading order, per-topic summary, "interactive exists" tag, candidates section (currently hidden — empty).
5. **/builder/**: module chips (7) + objective chips (9) with blurb *tooltips*, match tiers (exact/alsoFits/oneStep/fallback), family blurb or differentiator, family page links, edit hints, URL state (`?family=`, `?m=&o=`).
6. **Nav**: map · sources · builder.

## 3. Inventory matrix — information unit × surface

Legend: ● fully surfaced · ◐ partial/conditional (see note) · ✗ not surfaced.

| Information unit | Map | Concept page | /sources/ | Builder | Notes |
|---|---|---|---|---|---|
| Node name, tier | ● | ● | ● | ◐ | Builder shows modules/objectives/families only |
| Blurb (json) | ◐ | ✗ | ✗ | ◐ | Hover tooltip on map; `title` attr on builder chips — **invisible on touch / to screen readers as content** |
| Summary (frontmatter) | ✗ | ● | ● | ✗ | Parallel one-liner to blurb; independently written, can drift |
| Family kind | ● | ● | ✗ | ✗ | |
| Family recipe (modules + objective) | ● detail | ◐ | ✗ | ● | Page has only the "open in builder" link — recipe is never *stated* on the page itself |
| Family direct `primitives` / famPrims union | ● detail | ✗ | ✗ | ✗ | "Uses primitives" line, map only |
| Module → primitives composition | ◐ | ✗ | ✗ | ✗ | Map shows it by *highlighting* only; no text anywhere lists what an encoder is made of |
| Primitive `modifiedBy` | ◐ | ✗ | ✗ | ✗ | Highlight-only (select attention → GQA lights up); zero text |
| Modifier `appliesTo` | ● detail | ✗ | ✗ | ✗ | Text in detail panel; reverse direction (above) is not |
| Family `variants` prose (5) | ● detail | ✗ | ✗ | ✗ | The "LLM is a category, not one architecture" caveats live only in the map panel |
| Module `variants` (denoiser: U-Net, DiT) | ● detail | ✗ | ✗ | ✗ | Only place U-Net is mentioned as a denoiser variant |
| `differentiator` (9) | ✗ | ✗ | ✗ | ◐ | **Only** when ≥2 exact matches collide; never on the family's own page |
| `deepDive` (4) | ● detail | ◐ | ◐ | ✗ | On page/directory it's an ordinary source row — its "canonical interactive" status is map-only |
| Objective blurbs (9) | ◐ | ✗ | ✗ | ◐ | Legend tooltip / chip `title` — hover-only on both surfaces |
| Objective color coding | ● | ✗ | ✗ | ● | |
| Sources (147, typed) | ✗ | ● | ● | ✗ | Map detail shows deepDive only, not source count/types |
| "Interactive exists" flag | ✗ | ✗ | ● | ✗ | Derivable everywhere, shown only on /sources/ |
| Recipe collisions as pedagogy | ✗ | ✗ | ✗ | ● | "3 families share this recipe" exists nowhere outside the builder |
| Edit-distance neighborhoods | ✗ | ✗ | ✗ | ● | oneStep/fallback tiers; pages don't say "one edit away from MAE" |
| Map hash deep links | ● | ◐ | ✗ | ✗ | Locator back-link uses them; **DiT page gets no hash and no prev/next** (variant not in `data.modules`) |
| Candidates queue | ✗ | ✗ | ◐ | ✗ | Renders only when non-empty; currently empty |
| **User's attached materials** | — | — | — | — | **Not yet supplied — slot reserved (§5)** |

## 4. Gap list — content that doesn't exist

**G1. Slugless modules.** `denoiser` and `generator-discriminator` have no concept
pages. They appear on the map and as builder chips, but clicking through is
impossible; in builder collision lists they render as unlinked bold text.

**G2. U-Net.** Exists only as a name string in denoiser's variants (`slug: null`).
Already on the third-ring candidate list.

**G3. Objectives have no pages — and structurally can't.** The schema has no slug
field on objectives. The thesis is "modules + objective", and one whole axis has
9 hover-tooltip blurbs as its *entire* explanation. Largest conceptual gap.

**G4. Empty candidates queue.** The third-ring list from the parent handoff
(U-Net, LoRA, quantization, distillation, contrastive-learning, agentic/tool-use)
was never entered into candidates.json, so the "queue with teeth" guards nothing.

**G5. Modifiers absent from builder grammar.** MoE/GQA are a known v1 cut; noting
here as the builder's representational gap (a recipe can't express "LLM + MoE").

**G6. deepDive sparsity.** 4 families carry deepDive, but 21 explainer-type
sources exist across pages. Candidates like Perceiver/SSM may have map-worthy
interactives already catalogued in frontmatter that the map never links.

**G7. No CI for check:links** (inherited; still manual-only).

## 5. The external link layer — what the site delegates

The site's philosophy is to link out rather than rebuild: external interactives
*replace* homegrown ones. So the 147 outward links are part of the content
stock — coverage the site owns by reference.

- **Type mix**: 69 paper · 48 blog · 21 explainer · 9 video. Every page has ≥1
  source; papers anchor provenance, blogs/videos carry the teaching load.
- **Interactive coverage**: **17 of 40 pages** have at least one explainer-type
  (interactive) source — but only **4** are promoted to a map `deepDive` button
  (llm, cnn, diffusion, gan). The other 13 (attention, autoencoders, clip, DiT,
  energy-based, gnn, output-head, seq2seq, ssm, tokenization, transformer-block,
  vae, world-models) have map-worthy interactives the map never shows → directly
  feeds **G6/S6**.
- **23 pages have no interactive source** — these are where a homegrown
  interactive would not be displacing anything (relevant when weighing future
  islands), and where explainer-hunting for the source directory has headroom.
- The /sources/ build enforces deepDive ⊆ page sources, so the map and the
  directory cannot disagree about a canonical explainer — but nothing flags the
  reverse direction (an explainer source that *should* become a deepDive).

## 6. Surfacing proposals — hidden data, ranked

Cheap = data + template already exist; just render.

**S1. Recipe block on family pages** *(cheap, high value)*. State the recipe in
text where the deep link already sits: module chips + objective chip, mirroring
the map detail panel. The page for VAE currently never says "encoder + decoder +
reconstruction".

**S2. "vs. siblings" block on collision-family pages** *(cheap, high value)*.
The 9 differentiators answer exactly the question a reader on the VAE page has
("how is this not an autoencoder?") but render only mid-builder-session. Show
each collision group's differentiators on its members' pages. *(Open question 2
from the handoff — recommend: yes, surface on pages; the lint already guarantees
group completeness.)*

**S3. Family `variants` prose on pages** *(cheap)*. The five "this is a category,
not one wiring" caveats are pedagogically central and map-detail-only.

**S4. Objective explanations somewhere visible** *(medium)*. Minimum: render the
selected objective's blurb as visible text in the builder (touch users currently
get nothing). Better: an objectives section/page reachable from legend + chips —
pairs with G3.

**S5. Textual composition lines** *(cheap)*. "Made of: attention · feed-forward ·
…" in the map detail for modules, and "modified by: GQA" for primitives —
today's highlight-only links, said in words. Fixes the screen-reader hole too.

**S6. "Interactive exists" tag beyond /sources/** *(cheap)*. Derivable from
frontmatter everywhere; show on concept-page source lists and/or map detail.

**S7. Locator support for variant modules** *(cheap bugfix-shaped)*. Include
module variants in the Locator's lookup so the DiT page gets its map hash and
prev/next neighbors.

**S8. Blurb/summary reconciliation** *(decision, then mechanical)*. Decide
whether json `blurb` and frontmatter `summary` are intentionally different
registers (map-voice vs page-voice) or drift risk. If the latter: lint that
they match, or single-source one from the other.

**S9. Neighborhood block on family pages** *(medium, v2-flavored)*. The matcher
already computes "one edit away"; a static "neighbors: swap objective → MAE"
line per family page would reuse `recipe-match.js` at build time.

### Suggested order (updated with §7 decisions)

1. S7 (Locator fix) + S1+S2+S3 in one pages-template pass (S2 per decision 1).
2. S5 (map detail textual pass) + S4a (visible objective blurbs, decision 2a).
3. Populate candidates.json with the three decided batches (decision 4) —
   includes extending the candidates lint with an `objective` tier.
4. S6 (interactive-exists tag beyond /sources/, fed by §5's 13-page list).
5. Then page-writing waves: page-debt modules → training-efficiency →
   objective pages (decision 2b, schema change). S8 resolved (no code); S9 later.

## 7. Decisions (resolved 2026-06-11)

1. **Differentiators on pages (S2): YES** — "same recipe, different idea" block
   on each collision-family's page: the recipe line, siblings' differentiators
   with links, this family's own differentiator, link to the builder collision.
2. **Objectives: BOTH, STAGED** — (a) now: render the selected objective's blurb
   as visible text in the builder; map legend click also shows the blurb in the
   detail area. (b) queued: full objective pages via candidates.json — requires
   adding an `objective` tier to the candidates lint and, at page time, a slug
   field on objectives.
3. **Blurb vs summary: TWO VOICES BY DESIGN** — blurb = terse map/builder voice
   (~10 words, glanceable); summary = standalone page//sources/ voice (~25
   words). Register rule documented here; no lint, no consolidation.
4. **Candidates queue: three batches enter candidates.json** —
   (a) page-debt first: denoiser, generator-discriminator (+ U-Net, folded into
   the denoiser story or standalone); (b) training-efficiency trio: LoRA,
   quantization, distillation; (c) the 9 objectives (per decision 2b).
   Agentic/tool-use: deferred, not queued.
5. **"Attached materials" = the outward links** — resolved as §5.

### Writing-voice rule (per decision 3)

- `blurb` (explainer.json): what you'd say pointing at the node — fragment OK,
  no terminal period needed, target ≤ ~12 words.
- `summary` (frontmatter): a complete standalone sentence that works with no
  map visible — it is the page's subtitle and its /sources/ description.

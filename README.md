# Model Architectures Explainer

An explorable map of neural-network model architectures, organized along two axes:
the **compositional hierarchy** (primitives → modules → families, plus modifiers)
and the **learning objective**. The map is the table of contents — every node links
to one of 33 curated concept pages written for readers without an ML background.

**Live site:** https://jacob234.github.io/model-architectures-explainer/

## Development

```sh
npm install
npm run dev      # serves at http://localhost:4321/model-architectures-explainer/
```

Note the base path: the site is configured (`astro.config.mjs`) for deployment under
`/model-architectures-explainer/`, and the dev server serves it at that path too.

## Quality gates

```sh
npm run build    # builds 34 static pages into dist/
npm run check    # data-integrity validator (slugs ↔ concept files, referential checks)
npm test         # fixture tests for the validator
```

The build itself also asserts that every slug referenced in `src/data/explainer.json`
has a matching concept page — deleting a page fails the build with a named error.

## Architecture

- [Astro 5](https://astro.build/), fully static output, zero hydration frameworks —
  the interactive ladder map is one plain bundled script (`src/scripts/ladder.js`)
- Concept pages are an Astro content collection (`src/content/concepts/`,
  schema in `src/content.config.ts`)
- The map data lives in `src/data/explainer.json`

## Deployment

Pushes to `main` deploy automatically to GitHub Pages via
[`withastro/action`](https://github.com/withastro/action)
(`.github/workflows/deploy.yml`).

## Provenance

Extracted from a personal knowledge vault. The concept pages are standalone curated
rewrites of vault notes — drift from the originals is accepted by design.

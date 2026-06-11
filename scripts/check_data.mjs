#!/usr/bin/env node
// Referential-integrity + slug-resolution validator for src/data/explainer.json.
// Mirror of scripts/check_explainer_data.py (which guards the frozen HTML artifact).
import { readFileSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

export function validate(data, conceptFiles) {
  const errors = [];
  const collect = (arr) => new Set(arr.map((x) => x.id));
  for (const [arr, label] of [
    [data.primitives, 'primitives'], [data.modules, 'modules'], [data.modifiers, 'modifiers'],
    [data.objectives, 'objectives'], [data.families, 'families'],
  ]) {
    const seen = new Set();
    for (const x of arr) {
      if (seen.has(x.id)) errors.push(`${label}: duplicate id "${x.id}"`);
      seen.add(x.id);
    }
  }
  const prims = collect(data.primitives), mods = collect(data.modules),
        objs = collect(data.objectives), mfs = collect(data.modifiers);
  const slugSet = new Set(conceptFiles.filter((f) => f.endsWith('.md')).map((f) => f.slice(0, -3)));
  const checkSlug = (slug, ctx) => {
    if (slug != null && !slugSet.has(slug)) errors.push(`${ctx}: slug "${slug}" has no concept page`);
  };

  for (const p of data.primitives) {
    checkSlug(p.slug, `primitive ${p.id}`);
    for (const m of p.modifiedBy ?? []) if (!mfs.has(m)) errors.push(`primitive ${p.id}: unknown modifier "${m}"`);
  }
  for (const m of data.modules) {
    checkSlug(m.slug, `module ${m.id}`);
    for (const p of m.primitives ?? []) if (!prims.has(p)) errors.push(`module ${m.id}: unknown primitive "${p}"`);
    for (const v of m.variants ?? []) checkSlug(v.slug, `module ${m.id} variant ${v.name}`);
  }
  for (const x of data.modifiers) {
    checkSlug(x.slug, `modifier ${x.id}`);
    if (!prims.has(x.appliesTo)) errors.push(`modifier ${x.id}: appliesTo unknown primitive "${x.appliesTo}"`);
  }
  for (const f of data.families) {
    checkSlug(f.slug, `family ${f.id}`);
    for (const m of f.modules ?? []) if (!mods.has(m)) errors.push(`family ${f.id}: unknown module "${m}"`);
    for (const p of f.primitives ?? []) if (!prims.has(p)) errors.push(`family ${f.id}: unknown primitive "${p}"`);
    if (f.objective !== 'varies' && !objs.has(f.objective)) errors.push(`family ${f.id}: unknown objective "${f.objective}"`);
  }
  return errors;
}

// Body-link lint for concept-page markdown. Two invariants:
// 1. No absolute-path internal links — `](/concepts/x/)` bypasses Astro's `base`
//    and 404s on GitHub Pages (shipped once, 2026-06-11). Internal links must be
//    relative (`](../x/)`), which resolves correctly under any base.
// 2. Every relative concept link must target an existing page slug.
export function validateBodyLinks(pages, slugSet) {
  const errors = [];
  for (const [file, body] of Object.entries(pages)) {
    for (const m of body.matchAll(/\]\(([^)]+)\)/g)) {
      const target = m[1];
      if (/^(https?:)?\/\//.test(target) || target.startsWith('#') || target.startsWith('mailto:')) continue;
      if (target.startsWith('/')) {
        errors.push(`${file}: absolute internal link "${target}" (use a relative ../slug/ link)`);
      } else {
        const rel = target.match(/^\.\.\/([a-z0-9-]+)\/?(?:#.*)?$/);
        if (!rel) errors.push(`${file}: unrecognized internal link "${target}"`);
        else if (!slugSet.has(rel[1])) errors.push(`${file}: link to missing concept page "${rel[1]}"`);
      }
    }
  }
  return errors;
}

// --- source-directory lint ---
// Frontmatter `sources` are also zod-validated at build time (content.config.ts);
// this offline pass exists so `npm run check` catches them too, and so
// candidates.json (which zod never sees) gets the same rules.
export const SOURCE_TYPES = new Set(['paper', 'explainer', 'blog', 'video']);

// Narrow regex extraction matched to this repo's consistent frontmatter style:
//   sources:
//     - label: "..."
//       url: "..."
//       type: paper
export function extractFrontmatterSources(body) {
  const fm = body.match(/^---\n([\s\S]*?)\n---/);
  if (!fm) return { sources: [], declared: 0 };
  const sources = [];
  const re = /^ {2}- label: "(.*)"\n {4}url: "(.*)"\n {4}type: (\S+)$/gm;
  for (const m of fm[1].matchAll(re)) {
    sources.push({ label: m[1], url: m[2], type: m[3] });
  }
  // Catch entries the strict triple-line regex missed (wrong order/indent/missing type).
  const declared = (fm[1].match(/^ {2}- label:/gm) ?? []).length;
  return { sources, declared };
}

export function validateSources({ pages, candidates, conceptSlugs }) {
  const errors = [];
  const checkList = (sources, ctx) => {
    const seen = new Set();
    for (const s of sources) {
      if (!SOURCE_TYPES.has(s.type)) errors.push(`${ctx}: source "${s.label}" has unknown type "${s.type}"`);
      let url;
      try { url = new URL(s.url); } catch { errors.push(`${ctx}: source "${s.label}" has invalid url "${s.url}"`); }
      if (url && url.protocol !== 'https:') errors.push(`${ctx}: source "${s.label}" must use https ("${s.url}")`);
      if (seen.has(s.url)) errors.push(`${ctx}: duplicate source url "${s.url}"`);
      seen.add(s.url);
    }
  };
  for (const [file, body] of Object.entries(pages)) {
    const { sources, declared } = extractFrontmatterSources(body);
    if (declared !== sources.length) {
      errors.push(`${file}: ${declared} source entr${declared === 1 ? 'y' : 'ies'} declared but only ` +
        `${sources.length} parse as label/url/type — check formatting`);
    }
    checkList(sources, file);
  }
  for (const c of candidates) {
    if (conceptSlugs.has(c.id)) {
      errors.push(`candidate "${c.id}" collides with an existing concept slug — move its sources to frontmatter and delete the entry`);
    }
    if (!['primitive', 'module', 'modifier', 'family'].includes(c.tier)) {
      errors.push(`candidate "${c.id}": unknown tier "${c.tier}"`);
    }
    if (!Array.isArray(c.sources)) errors.push(`candidate "${c.id}": sources must be an array`);
    else checkList(c.sources, `candidate "${c.id}"`);
  }
  return errors;
}

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
    const key = `${[...(f.modules ?? [])].sort().join('+')}|${f.objective}`; // spread: sort() is in-place
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

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
  const data = JSON.parse(readFileSync(path.join(root, 'src/data/explainer.json'), 'utf8'));
  let files = [];
  try { files = readdirSync(path.join(root, 'src/content/concepts')); } catch { /* dir absent until Task 4 */ }
  const errors = validate(data, files);
  const conceptsDir = path.join(root, 'src/content/concepts');
  const pages = Object.fromEntries(files.filter((f) => f.endsWith('.md'))
    .map((f) => [f, readFileSync(path.join(conceptsDir, f), 'utf8')]));
  const slugSet = new Set(Object.keys(pages).map((f) => f.slice(0, -3)));
  errors.push(...validateBodyLinks(pages, slugSet));
  const { candidates } = JSON.parse(readFileSync(path.join(root, 'src/data/candidates.json'), 'utf8'));
  errors.push(...validateSources({ pages, candidates, conceptSlugs: slugSet }));
  errors.push(...validateDifferentiators(data.families));
  if (errors.length) { console.error(errors.join('\n')); process.exit(1); }
  const sourceCount = Object.values(pages).reduce((n, b) => n + extractFrontmatterSources(b).sources.length, 0) +
    candidates.reduce((n, c) => n + c.sources.length, 0);
  console.log(`OK primitives=${data.primitives.length} modules=${data.modules.length} ` +
    `modifiers=${data.modifiers.length} objectives=${data.objectives.length} ` +
    `families=${data.families.length} concepts=${files.filter((f) => f.endsWith('.md')).length} ` +
    `candidates=${candidates.length} sources=${sourceCount}`);
}

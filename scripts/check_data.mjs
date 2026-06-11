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

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
  const data = JSON.parse(readFileSync(path.join(root, 'src/data/explainer.json'), 'utf8'));
  let files = [];
  try { files = readdirSync(path.join(root, 'src/content/concepts')); } catch { /* dir absent until Task 4 */ }
  const errors = validate(data, files);
  if (errors.length) { console.error(errors.join('\n')); process.exit(1); }
  console.log(`OK primitives=${data.primitives.length} modules=${data.modules.length} ` +
    `modifiers=${data.modifiers.length} objectives=${data.objectives.length} ` +
    `families=${data.families.length} concepts=${files.filter((f) => f.endsWith('.md')).length}`);
}

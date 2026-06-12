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
  // slice(0, 4): cap per spec; families-array order determines which 4 survive
  const oneStep = rest.filter((f) => distance(sel, objective, f) === 1).slice(0, 4);
  const fallback = exact.length || alsoFits.length || oneStep.length
    ? []
    : rest.filter((f) => distance(sel, objective, f) === 2).slice(0, 4);
  return { exact, alsoFits, oneStep, fallback };
}

// All families sharing this family's exact (module-set, objective) recipe,
// including itself, in data order — or [] when its recipe is unique. Same
// grouping rule as the differentiator lint: 'varies' never groups.
export function collisionGroup(family, families) {
  if (family.objective === 'varies') return [];
  const fam = new Set(family.modules ?? []);
  const members = families.filter((f) =>
    f.objective === family.objective && setEq(new Set(f.modules ?? []), fam));
  return members.length > 1 ? members : [];
}

// Describe the single edit separating a oneStep family from the selection.
// Only valid for distance-1 families; for distance > 1 the fall-through
// branch fires with a misleading result, not an error.
export function editHint({ modules, objective }, f) {
  const sel = new Set(modules);
  const fam = new Set(f.modules ?? []);
  const add = [...fam].filter((m) => !sel.has(m));
  const drop = [...sel].filter((m) => !fam.has(m));
  if (add.length === 1 && drop.length === 0) return { kind: 'add', what: add[0] };
  if (drop.length === 1 && add.length === 0) return { kind: 'drop', what: drop[0] };
  return { kind: 'swap-objective', what: f.objective };
}

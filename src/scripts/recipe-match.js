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

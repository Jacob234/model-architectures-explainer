// Page-bearing nodes for one Locator tier, in map reading order. Pure and
// node:test-importable, like recipe-match.js.
//
// Module variants (e.g. DiT under denoiser) have concept pages but no map node
// of their own, so they're folded in right after their parent — mirroring the
// /sources/ reading order — with `mapId` pointing at the parent's map node.
export function locatorEntries(tier, data) {
  const arr = { primitive: data.primitives, module: data.modules,
                modifier: data.modifiers, family: data.families }[tier];
  const entries = [];
  for (const node of arr) {
    if (node.slug) entries.push({ name: node.name, slug: node.slug, mapId: node.id });
    for (const v of node.variants ?? []) {
      if (v.slug) entries.push({ name: v.name, slug: v.slug, mapId: node.id });
    }
  }
  return entries;
}

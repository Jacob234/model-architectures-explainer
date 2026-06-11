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

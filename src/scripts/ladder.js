import data from '../data/explainer.json';
  const index = arr => Object.fromEntries(arr.map(x => [x.id, x]));
  const P = index(data.primitives), M = index(data.modules),
        F = index(data.families), O = index(data.objectives), X = index(data.modifiers);

  // A family's primitive set = union of its modules' primitives + its direct primitives.
  const famPrims = f => {
    const s = new Set(f.primitives || []);
    (f.modules || []).forEach(id => (M[id].primitives || []).forEach(p => s.add(p)));
    return s;
  };

  const state = { sel: null, advanced: false, objFilter: null };

  const badgeHTML = f => {
    const obj = f.objective === 'varies' ? null : O[f.objective];
    const dot = obj
      ? `<span class="obj-dot" style="background:${obj.color}" title="${obj.name}"></span>`
      : `<span class="obj-dot varies" title="objective: varies"></span>`;
    return `<span class="badges"><span class="kind">${f.kind}</span>${dot}</span>`;
  };

  const mkNode = (item, type) => {
    const b = document.createElement('button');
    b.className = `node ${type}`;
    b.dataset.type = type;
    b.dataset.id = item.id;
    b.dataset.tier = item.tier || 'core';
    b.dataset.tip = item.blurb;
    b.innerHTML = `<span class="node-name">${item.name}</span>` +
                  (type === 'family' ? badgeHTML(item) : '');
    if (type === 'family' && item.objective !== 'varies')
      b.style.setProperty('--obj-c', O[item.objective].color);
    b.addEventListener('click', () => select(type, item.id));
    return b;
  };

  document.querySelector('#col-primitives > .col-body')
    .append(...data.primitives.map(p => mkNode(p, 'primitive')));
  document.querySelector('#col-modules > .col-body')
    .append(...data.modules.map(m => mkNode(m, 'module')));
  document.querySelector('#col-families > .col-body')
    .append(...data.families.map(f => mkNode(f, 'family')));
  document.querySelector('#modifier-strip > .col-body')
    .append(...data.modifiers.map(x => mkNode(x, 'modifier')));

  const legend = document.getElementById('legend');
  data.objectives.forEach(o => {
    const b = document.createElement('button');
    b.className = 'legend-item';
    b.dataset.obj = o.id;
    b.dataset.tip = o.blurb;
    b.innerHTML = `<span class="obj-dot" style="background:${o.color}"></span>${o.name}`;
    b.addEventListener('click', () => {
      state.objFilter = state.objFilter === o.id ? null : o.id;
      state.sel = null;
      refresh();
    });
    legend.append(b);
  });

  function select(type, id) {
    state.objFilter = null;
    state.sel = (state.sel && state.sel.type === type && state.sel.id === id)
      ? null : { type, id };
    history.replaceState(null, '', state.sel ? `#${state.sel.type}-${state.sel.id}` : location.pathname);
    refresh();
  }

  // Which nodes light up for the current selection / filter. null → no dimming at all.
  function litSets() {
    const lit = { primitive: new Set(), module: new Set(), family: new Set(), modifier: new Set() };
    if (state.objFilter) {
      data.families.filter(f => f.objective === state.objFilter)
        .forEach(f => lit.family.add(f.id));
      return lit;
    }
    const s = state.sel;
    if (!s) return null;
    if (s.type === 'family') {
      const f = F[s.id];
      lit.family.add(f.id);
      (f.modules || []).forEach(m => lit.module.add(m));
      famPrims(f).forEach(p => lit.primitive.add(p));
    } else if (s.type === 'module') {
      lit.module.add(s.id);
      (M[s.id].primitives || []).forEach(p => lit.primitive.add(p));
      data.families.forEach(f => { if ((f.modules || []).includes(s.id)) lit.family.add(f.id); });
    } else if (s.type === 'primitive') {
      lit.primitive.add(s.id);
      data.modules.forEach(m => { if ((m.primitives || []).includes(s.id)) lit.module.add(m.id); });
      data.families.forEach(f => { if (famPrims(f).has(s.id)) lit.family.add(f.id); });
      (P[s.id].modifiedBy || []).forEach(x => lit.modifier.add(x));
    } else if (s.type === 'modifier') {
      lit.modifier.add(s.id);
      const p = X[s.id].appliesTo;
      lit.primitive.add(p);
      data.families.forEach(f => { if (famPrims(f).has(p)) lit.family.add(f.id); });
    }
    return lit;
  }

  function refresh() {
    const lit = litSets();
    document.querySelectorAll('.node').forEach(n => {
      const on = lit && lit[n.dataset.type].has(n.dataset.id);
      n.classList.toggle('lit', !!on);
      n.classList.toggle('dim', !!lit && !on);
      n.classList.toggle('selected',
        !!state.sel && state.sel.type === n.dataset.type && state.sel.id === n.dataset.id);
    });
    document.querySelectorAll('.legend-item').forEach(l =>
      l.classList.toggle('active', l.dataset.obj === state.objFilter));
    renderDetail();
  }

  const BASE = import.meta.env.BASE_URL.replace(/\/$/, '');
  const conceptUrl = (slug) => `${BASE}/concepts/${slug}/`;

  function renderDetail() {
    const panel = document.getElementById('detail');
    if (!state.sel) {
      // An active legend filter gets the detail panel too — objectives have no
      // map node of their own, so this is their only visible (non-tooltip) text.
      if (state.objFilter) {
        const o = O[state.objFilter];
        const fams = data.families.filter(f => f.objective === o.id);
        panel.innerHTML = `<p class="detail-type">objective</p><h2>${o.name}</h2>` +
          `<p class="blurb">${o.blurb}</p>` +
          `<h3>Families trained with it</h3>` +
          `<p class="prims-line">${fams.map(f => `<b>${f.name}</b>`).join(' · ')}</p>`;
        return;
      }
      panel.innerHTML = document.getElementById('detail-intro').innerHTML;
      return;
    }
    const { type, id } = state.sel;
    const item = { primitive: P, module: M, family: F, modifier: X }[type][id];
    let html = `<p class="detail-type">${type}</p>` +
      `<h2>${item.slug ? `<a href="${conceptUrl(item.slug)}">${item.name}</a>` : item.name}</h2>`;
    if (type === 'family') html += `<p><span class="kind big">${item.kind}</span></p>`;
    html += `<p class="blurb">${item.blurb}</p>`;
    if (type === 'family') {
      const obj = item.objective === 'varies'
        ? `<span class="obj-chip varies">objective: varies</span>`
        : `<span class="obj-chip" style="--c:${O[item.objective].color}"><span class="obj-dot" style="background:${O[item.objective].color}"></span>${O[item.objective].name}</span>`;
      const mods = (item.modules || [])
        .map(m => `<span class="chip">${M[m].name}</span>`)
        .join(`<span class="plus">+</span>`);
      html += `<h3>Recipe</h3><p class="recipe">${mods || `<span class="chip">primitives, wired directly</span>`}<span class="plus">+</span>${obj}</p>`;
      html += `<h3>Uses primitives</h3><p class="prims-line">${[...famPrims(item)].map(p => `<b>${P[p].name}</b>`).join(' · ')}</p>`;
      if (item.variants) html += `<div class="caveat">⚠ ${item.variants}</div>`;
    }
    // Say the highlight-only relationships in words too (touch / screen readers).
    if (type === 'module' && (item.primitives || []).length) {
      html += `<h3>Made of</h3><p class="prims-line">${item.primitives.map(p => `<b>${P[p].name}</b>`).join(' · ')}</p>`;
    }
    if (type === 'primitive' && (item.modifiedBy || []).length) {
      html += `<h3>Modified by</h3><p class="prims-line">${item.modifiedBy.map(x => `<b>${X[x].name}</b>`).join(' · ')}</p>`;
    }
    if (type === 'module' && item.variants) {
      html += `<h3>Variants</h3><ul>` + item.variants.map(v =>
        v.slug
          ? `<li>${v.name} — <a href="${conceptUrl(v.slug)}">read more →</a></li>`
          : `<li>${v.name}</li>`).join('') + `</ul>`;
    }
    if (type === 'modifier') html += `<h3>Applies to</h3><p>${P[item.appliesTo].name}</p>`;
    html += `<div class="links">`;
    if (item.slug)
      html += `<a class="btn" href="${conceptUrl(item.slug)}">read the full page →</a>`;
    if (item.deepDive)
      html += `<a class="btn" href="${item.deepDive.url}" target="_blank" rel="noopener">${item.deepDive.label} ↗</a>`;
    html += `</div>`;
    panel.innerHTML = html;
  }

  document.getElementById('advanced-toggle').addEventListener('change', e => {
    state.advanced = e.target.checked;
    document.body.classList.toggle('show-advanced', state.advanced);
    if (state.sel) {
      const el = document.querySelector(
        `.node[data-type="${state.sel.type}"][data-id="${state.sel.id}"]`);
      if (el && el.dataset.tier === 'advanced' && !state.advanced) state.sel = null;
    }
    refresh();
  });

  // One floating tooltip; selection (click) is the touch fallback.
  const tip = document.getElementById('tooltip');
  document.addEventListener('mouseover', e => {
    const t = e.target.closest('[data-tip]');
    if (!t) { tip.hidden = true; return; }
    tip.textContent = t.dataset.tip;
    tip.hidden = false;
  });
  document.addEventListener('mousemove', e => {
    if (tip.hidden) return;
    tip.style.left = Math.min(e.clientX + 14, innerWidth - tip.offsetWidth - 8) + 'px';
    tip.style.top = (e.clientY + 16) + 'px';
  });

  const m = location.hash.match(/^#(primitive|module|family|modifier)-(.+)$/);
  if (m) {
    const [, type, id] = m;
    const pool = { primitive: P, module: M, family: F, modifier: X }[type];
    if (pool[id]) {
      state.sel = { type, id };
      if ((pool[id].tier || 'core') === 'advanced') {
        state.advanced = true;
        document.getElementById('advanced-toggle').checked = true;
        document.body.classList.add('show-advanced');
      }
    }
  }

  refresh();

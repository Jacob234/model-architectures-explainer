#!/usr/bin/env node
// Network liveness check for every external source URL (frontmatter + candidates
// + map deepDive links). Deliberately NOT part of `npm run check` — that gate
// stays offline/deterministic; run this one before a deploy or on demand.
import { readFileSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { extractFrontmatterSources } from './check_data.mjs';

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const conceptsDir = path.join(root, 'src/content/concepts');

const urls = new Map(); // url -> first context seen
const add = (url, ctx) => { if (!urls.has(url)) urls.set(url, ctx); };

for (const f of readdirSync(conceptsDir).filter((f) => f.endsWith('.md'))) {
  const { sources } = extractFrontmatterSources(readFileSync(path.join(conceptsDir, f), 'utf8'));
  for (const s of sources) add(s.url, f);
}
const { candidates } = JSON.parse(readFileSync(path.join(root, 'src/data/candidates.json'), 'utf8'));
for (const c of candidates) for (const s of c.sources) add(s.url, `candidate ${c.id}`);
const data = JSON.parse(readFileSync(path.join(root, 'src/data/explainer.json'), 'utf8'));
for (const fam of data.families) if (fam.deepDive) add(fam.deepDive.url, `family ${fam.id} deepDive`);

const UA = 'model-architectures-explainer link check (github.com/Jacob234/model-architectures-explainer)';
async function probe(url) {
  for (const method of ['HEAD', 'GET']) {
    try {
      const res = await fetch(url, {
        method, redirect: 'follow', signal: AbortSignal.timeout(15000),
        headers: { 'user-agent': UA, accept: 'text/html,*/*' },
      });
      if (res.ok) return { status: res.status, ok: true };
      // Some hosts reject HEAD outright; only the GET verdict is final.
      if (method === 'GET') {
        const throttled = [403, 429].includes(res.status);
        return { status: res.status, ok: false, warnOnly: throttled };
      }
    } catch (err) {
      if (method === 'GET') return { status: `error: ${err.cause?.code ?? err.name}`, ok: false };
    }
  }
}

const entries = [...urls.entries()];
const results = [];
const CONCURRENCY = 5;
let next = 0;
await Promise.all(Array.from({ length: CONCURRENCY }, async () => {
  while (next < entries.length) {
    const [url, ctx] = entries[next++];
    results.push({ url, ctx, ...(await probe(url)) });
  }
}));

const failed = results.filter((r) => !r.ok && !r.warnOnly);
const warned = results.filter((r) => r.warnOnly);
for (const r of warned) console.warn(`WARN ${r.status} ${r.url} (${r.ctx}) — likely bot-throttling, verify by hand`);
for (const r of failed) console.error(`FAIL ${r.status} ${r.url} (${r.ctx})`);
console.log(`checked ${results.length} urls: ${results.length - failed.length - warned.length} ok, ` +
  `${warned.length} warned, ${failed.length} failed`);
if (failed.length) process.exit(1);

// GET /api/content  -> the published content (what visitors see). Public, cached briefly.
import { json } from '../_lib/util.js';

export async function onRequestGet({ env }) {
  const { results } = await env.DB.prepare('SELECT key, json, version, updated_at FROM content').all();
  if (!results.length) return json({ periods: {}, home: null }, 200, { 'cache-control': 'public, max-age=20' });
  const out = { periods: {}, home: null, updated_at: 0 };
  for (const r of results) {
    const doc = JSON.parse(r.json);
    if (r.key === 'home') out.home = doc; else out.periods[r.key] = doc;
    out.updated_at = Math.max(out.updated_at, r.updated_at);
  }
  return json(out, 200, { 'cache-control': 'public, max-age=20' });
}

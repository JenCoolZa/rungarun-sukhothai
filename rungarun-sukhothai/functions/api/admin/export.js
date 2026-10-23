// GET /api/admin/export?days=90 (or days=all)  -> visits as CSV   |   ?what=content -> all content as one JSON file
import { dayOffset, json } from '../../_lib/util.js';

export async function onRequestGet({ request, env }) {
  const sp = new URL(request.url).searchParams;
  if (sp.get('what') === 'content') {
    const { results } = await env.DB.prepare('SELECT key, json FROM content').all();
    const out = {};
    for (const r of results) out[r.key] = JSON.parse(r.json);
    return new Response(JSON.stringify(out, null, 2), {
      headers: { 'content-type': 'application/json; charset=utf-8', 'content-disposition': 'attachment; filename="content-backup.json"', 'cache-control': 'no-store' },
    });
  }
  const all = sp.get('days') === 'all';
  const since = all ? '0000-00-00' : dayOffset((parseInt(sp.get('days'), 10) || 30) - 1);
  const { results } = await env.DB.prepare(
    'SELECT ts, day, hour, type, period, event_id, sid, country, device, ref FROM visits WHERE day>=? ORDER BY id DESC LIMIT 50000').bind(since).all();
  const cols = ['ts', 'day', 'hour', 'type', 'period', 'event_id', 'sid', 'country', 'device', 'ref'];
  const esc = (v) => { v = v == null ? '' : String(v); return /[",\n]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v; };
  const csv = '\ufeff' + cols.join(',') + '\n' + results.map((r) => cols.map((c) => esc(r[c])).join(',')).join('\n');
  return new Response(csv, {
    headers: { 'content-type': 'text/csv; charset=utf-8', 'content-disposition': 'attachment; filename="visits.csv"', 'cache-control': 'no-store' },
  });
}

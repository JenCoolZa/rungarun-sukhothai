// GET  /api/admin/history?key=sukhothai  -> list of previous versions (newest first)
// POST /api/admin/history { id }          -> restore that version (current one is snapshotted first)
import { DOC_KEYS, json } from '../../_lib/util.js';

export async function onRequestGet({ request, env }) {
  const key = new URL(request.url).searchParams.get('key');
  if (!DOC_KEYS.includes(key)) return json({ error: 'key ไม่ถูกต้อง' }, 400);
  const { results } = await env.DB.prepare('SELECT id, version, saved_at, note, LENGTH(json) AS size FROM content_history WHERE key=? ORDER BY id DESC LIMIT 50').bind(key).all();
  return json({ items: results });
}

export async function onRequestPost({ request, env }) {
  const b = await request.json().catch(() => ({}));
  const h = await env.DB.prepare('SELECT key, json, version FROM content_history WHERE id=?').bind(+b.id || 0).first();
  if (!h) return json({ error: 'ไม่พบเวอร์ชันนี้' }, 404);
  const cur = await env.DB.prepare('SELECT json, version FROM content WHERE key=?').bind(h.key).first();
  const now = Date.now();
  const version = (cur?.version || 0) + 1;
  const stmts = [];
  if (cur) stmts.push(env.DB.prepare('INSERT INTO content_history (key, json, version, saved_at, note) VALUES (?,?,?,?,?)').bind(h.key, cur.json, cur.version, now, `ก่อนย้อนกลับไปเวอร์ชัน ${h.version}`));
  stmts.push(env.DB.prepare(
    'INSERT INTO content (key, json, version, updated_at, updated_by) VALUES (?,?,?,?,?) ON CONFLICT(key) DO UPDATE SET json=excluded.json, version=excluded.version, updated_at=excluded.updated_at, updated_by=excluded.updated_by'
  ).bind(h.key, h.json, version, now, 'admin (restore)'));
  await env.DB.batch(stmts);
  return json({ ok: true, key: h.key, version });
}

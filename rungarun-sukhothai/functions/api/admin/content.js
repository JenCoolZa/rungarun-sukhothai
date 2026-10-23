// GET /api/admin/content            -> all documents (full JSON) + meta
// PUT /api/admin/content { key, doc, note } -> validate, snapshot the old version into history, save
import { DOC_KEYS, json } from '../../_lib/util.js';
import { validateDoc } from '../../_lib/validate.js';

export async function onRequestGet({ env }) {
  const { results } = await env.DB.prepare('SELECT key, json, version, updated_at, updated_by FROM content').all();
  const docs = {};
  for (const r of results) docs[r.key] = { doc: JSON.parse(r.json), version: r.version, updated_at: r.updated_at };
  return json({ docs });
}

export async function onRequestPut({ request, env }) {
  let b;
  try { b = await request.json(); } catch { return json({ error: 'JSON ไม่ถูกต้อง' }, 400); }
  if (!DOC_KEYS.includes(b.key)) return json({ error: 'key ไม่ถูกต้อง' }, 400);
  let doc;
  try { doc = validateDoc(b.key, b.doc); } catch (e) { return json({ error: e.message }, 422); }
  const text = JSON.stringify(doc);
  if (text.length > 90000) return json({ error: 'เนื้อหาของสมัยนี้ใหญ่เกินไป (เกิน ~90 KB)' }, 413);

  const now = Date.now();
  const cur = await env.DB.prepare('SELECT json, version FROM content WHERE key=?').bind(b.key).first();
  if (cur && b.baseVersion && b.baseVersion !== cur.version)
    return json({ error: 'มีคนแก้ไขเอกสารนี้ไปแล้ว กรุณารีโหลดหน้าก่อนบันทึก', conflict: true }, 409);

  const version = (cur?.version || 0) + 1;
  const stmts = [];
  if (cur) {
    stmts.push(env.DB.prepare('INSERT INTO content_history (key, json, version, saved_at, note) VALUES (?,?,?,?,?)')
      .bind(b.key, cur.json, cur.version, now, String(b.note || '').slice(0, 200)));
    stmts.push(env.DB.prepare('DELETE FROM content_history WHERE key=? AND id NOT IN (SELECT id FROM content_history WHERE key=? ORDER BY id DESC LIMIT 50)').bind(b.key, b.key));
  }
  stmts.push(env.DB.prepare(
    'INSERT INTO content (key, json, version, updated_at, updated_by) VALUES (?,?,?,?,?) ON CONFLICT(key) DO UPDATE SET json=excluded.json, version=excluded.version, updated_at=excluded.updated_at, updated_by=excluded.updated_by'
  ).bind(b.key, text, version, now, 'admin'));
  await env.DB.batch(stmts);
  return json({ ok: true, version, updated_at: now, doc });
}

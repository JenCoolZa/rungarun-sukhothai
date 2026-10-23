// POST /api/admin/login { password }   |   DELETE -> logout   |   GET -> { ok } session check
import { json, makeSession, safeEqual, sessionCookie, checkSession, sha256Hex } from '../../_lib/util.js';

export async function onRequestGet({ request, env }) {
  return json({ ok: await checkSession(request, env) });
}

export async function onRequestDelete() {
  return json({ ok: true }, 200, { 'set-cookie': sessionCookie('', 0) });
}

export async function onRequestPost({ request, env }) {
  if (!env.ADMIN_PASSWORD || !env.SESSION_SECRET) return json({ error: 'ยังไม่ได้ตั้งค่า ADMIN_PASSWORD และ SESSION_SECRET บนเซิร์ฟเวอร์' }, 500);
  const ip = request.headers.get('cf-connecting-ip') || 'unknown';
  const ipHash = (await sha256Hex(`${env.SESSION_SECRET}:${ip}`)).slice(0, 24);
  const now = Date.now();

  const { n } = await env.DB.prepare('SELECT COUNT(*) AS n FROM login_attempts WHERE ip_hash=? AND ok=0 AND ts>?')
    .bind(ipHash, now - 10 * 60 * 1000).first();
  if (n >= 5) return json({ error: 'ลองผิดหลายครั้ง กรุณารอ 10 นาทีแล้วลองใหม่' }, 429);

  let body = {};
  try { body = await request.json(); } catch {}
  const ok = typeof body.password === 'string' && safeEqual(body.password, env.ADMIN_PASSWORD);
  await env.DB.prepare('INSERT INTO login_attempts (ts, ip_hash, ok) VALUES (?,?,?)').bind(now, ipHash, ok ? 1 : 0).run();
  if (!ok) return json({ error: 'รหัสผ่านไม่ถูกต้อง' }, 401);
  await env.DB.prepare('DELETE FROM login_attempts WHERE ts<?').bind(now - 7 * 86400000).run();
  return json({ ok: true }, 200, { 'set-cookie': sessionCookie(await makeSession(env)) });
}

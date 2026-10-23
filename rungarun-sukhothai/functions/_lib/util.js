// Shared helpers for the Pages Functions API.
export const PERIOD_KEYS = ['sukhothai', 'ayutthaya', 'thonburi', 'rattanakosin'];
export const DOC_KEYS = ['home', ...PERIOD_KEYS];

export const json = (data, status = 200, headers = {}) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store', ...headers },
  });

const enc = new TextEncoder();
const b64u = (buf) => btoa(String.fromCharCode(...new Uint8Array(buf))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

async function hmac(secret, msg) {
  const k = await crypto.subtle.importKey('raw', enc.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  return b64u(await crypto.subtle.sign('HMAC', k, enc.encode(msg)));
}

export function safeEqual(a, b) {
  const x = enc.encode(String(a)), y = enc.encode(String(b));
  let d = x.length ^ y.length;
  for (let i = 0; i < Math.max(x.length, y.length); i++) d |= (x[i] || 0) ^ (y[i] || 0);
  return d === 0;
}

export async function sha256Hex(text) {
  const h = await crypto.subtle.digest('SHA-256', enc.encode(text));
  return [...new Uint8Array(h)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

export const COOKIE = 'th_admin';
const TTL = 12 * 3600; // seconds

export async function makeSession(env) {
  const exp = Math.floor(Date.now() / 1000) + TTL;
  const body = `admin.${exp}`;
  return `${body}.${await hmac(env.SESSION_SECRET, body)}`;
}

export async function checkSession(request, env) {
  if (!env.SESSION_SECRET) return false;
  const m = (request.headers.get('cookie') || '').match(new RegExp(`(?:^|;\\s*)${COOKIE}=([^;]+)`));
  if (!m) return false;
  const [who, exp, sig] = m[1].split('.');
  if (who !== 'admin' || !exp || !sig || +exp < Date.now() / 1000) return false;
  return safeEqual(sig, await hmac(env.SESSION_SECRET, `${who}.${exp}`));
}

export const sessionCookie = (value, maxAge = TTL) =>
  `${COOKIE}=${value}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=${maxAge}`;

// Asia/Bangkok (UTC+7, no DST)
export function bkk(ts = Date.now()) {
  const d = new Date(ts + 7 * 3600 * 1000);
  return { day: d.toISOString().slice(0, 10), hour: d.getUTCHours() };
}
export const dayOffset = (days) => bkk(Date.now() - days * 86400000).day;

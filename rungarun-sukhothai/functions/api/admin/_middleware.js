// Guards every /api/admin/* route except login. Cookie session (HMAC-signed, HttpOnly, SameSite=Strict).
import { checkSession, json } from '../../_lib/util.js';

export async function onRequest(ctx) {
  const { request, env, next } = ctx;
  const path = new URL(request.url).pathname;
  if (path.endsWith('/login')) return next();
  if (!(await checkSession(request, env))) return json({ error: 'unauthorized' }, 401);
  // CSRF belt-and-braces: state-changing calls must carry our custom header (cross-site forms/fetches can't add it).
  if (request.method !== 'GET' && request.headers.get('x-requested-with') !== 'th-admin') return json({ error: 'bad request' }, 400);
  return next();
}

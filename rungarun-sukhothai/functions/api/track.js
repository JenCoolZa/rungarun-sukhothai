// POST /api/track  { type, period, event, sid, ref, w }  -> stores one anonymous visit row. No IP is kept.
import { PERIOD_KEYS, bkk } from '../_lib/util.js';

const BOT = /bot|crawl|spider|slurp|facebookexternalhit|preview|monitor|curl|wget|headless|lighthouse/i;
const TYPES = new Set(['visit', 'view', 'event']);

export async function onRequestPost({ request, env }) {
  try {
    const ua = request.headers.get('user-agent') || '';
    if (BOT.test(ua)) return new Response(null, { status: 204 });
    const raw = await request.text();
    if (raw.length > 1024) return new Response(null, { status: 413 });
    const b = JSON.parse(raw);

    const type = TYPES.has(b.type) ? b.type : null;
    const period = b.period === 'home' || b.period === 'learn' || PERIOD_KEYS.includes(b.period) ? b.period : '';
    const event = /^[a-z0-9-]{1,40}$/i.test(b.event || '') ? b.event : '';
    const sid = /^[\w-]{4,64}$/.test(b.sid || '') ? b.sid : '';
    if (!type || !sid) return new Response(null, { status: 400 });

    const w = +b.w || 0;
    const device = /ipad|tablet/i.test(ua) ? 'tablet' : /mobi|android|iphone/i.test(ua) || (w && w < 700) ? 'mobile' : 'desktop';
    const ref = /^[a-z0-9.-]{1,80}$/i.test(b.ref || '') ? b.ref.toLowerCase() : '';
    const country = request.cf?.country || '';
    const now = Date.now();
    const { day, hour } = bkk(now);

    await env.DB.prepare(
      'INSERT INTO visits (ts, day, hour, type, period, event_id, sid, country, device, ref) VALUES (?,?,?,?,?,?,?,?,?,?)'
    ).bind(now, day, hour, type, period, event, sid, country, device, ref).run();
    return new Response(null, { status: 204 });
  } catch {
    return new Response(null, { status: 400 });
  }
}

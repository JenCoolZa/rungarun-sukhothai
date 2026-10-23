// GET /api/admin/stats?days=30  -> aggregated visit analytics for the dashboard
import { dayOffset, json } from '../../_lib/util.js';

export async function onRequestGet({ request, env }) {
  const days = Math.max(1, Math.min(365, parseInt(new URL(request.url).searchParams.get('days'), 10) || 30));
  const since = dayOffset(days - 1), d7 = dayOffset(6), d1 = dayOffset(0);
  const q = (sql, ...a) => env.DB.prepare(sql).bind(...a);

  const kpi = (from) => q(
    `SELECT SUM(type='visit') AS visits, COUNT(DISTINCT sid) AS visitors, SUM(type='view') AS views, SUM(type='event') AS events FROM visits WHERE day>=?`, from);

  const [daily, today, week, range, byPeriod, topEvents, device, country, refs, hours, recent, total] = await env.DB.batch([
    q(`SELECT day, SUM(type='visit') AS visits, COUNT(DISTINCT sid) AS visitors, SUM(type='view') AS views, SUM(type='event') AS events
       FROM visits WHERE day>=? GROUP BY day ORDER BY day`, since),
    kpi(d1), kpi(d7), kpi(since),
    q(`SELECT period, COUNT(*) AS n FROM visits WHERE type='view' AND day>=? GROUP BY period ORDER BY n DESC`, since),
    q(`SELECT event_id, period, COUNT(*) AS n FROM visits WHERE type='event' AND day>=? GROUP BY event_id, period ORDER BY n DESC LIMIT 10`, since),
    q(`SELECT device, COUNT(*) AS n FROM visits WHERE type='visit' AND day>=? GROUP BY device ORDER BY n DESC`, since),
    q(`SELECT country, COUNT(*) AS n FROM visits WHERE type='visit' AND day>=? AND country<>'' GROUP BY country ORDER BY n DESC LIMIT 8`, since),
    q(`SELECT ref, COUNT(*) AS n FROM visits WHERE type='visit' AND day>=? AND ref<>'' GROUP BY ref ORDER BY n DESC LIMIT 8`, since),
    q(`SELECT hour, COUNT(*) AS n FROM visits WHERE type IN ('view','event') AND day>=? GROUP BY hour ORDER BY hour`, since),
    q(`SELECT ts, type, period, event_id, country, device FROM visits ORDER BY id DESC LIMIT 20`),
    q(`SELECT COUNT(*) AS rows, MIN(ts) AS first_ts FROM visits`),
  ]);

  return json({
    days, since,
    daily: daily.results,
    kpi: { today: today.results[0], week: week.results[0], range: range.results[0] },
    byPeriod: byPeriod.results, topEvents: topEvents.results, device: device.results,
    country: country.results, refs: refs.results, hours: hours.results, recent: recent.results,
    total: total.results[0],
  });
}

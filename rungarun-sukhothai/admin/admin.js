/* Admin console (separate page at /admin/). Vanilla JS, no popups: every screen is a route. */
(function () {
'use strict';
var API = '/api/admin';
var NAMES = { sukhothai: 'สุโขทัย', ayutthaya: 'กรุงศรีอยุธยา', thonburi: 'ธนบุรี', rattanakosin: 'รัตนโกสินทร์', home: 'หน้าหลัก' };
var KEYS = ['home', 'sukhothai', 'ayutthaya', 'thonburi', 'rattanakosin'];
var MOODS = { '': 'อัตโนมัติตามเนื้อหา', peace: 'สงบเขียวชอุ่ม', war: 'สงคราม (ไฟ)', joy: 'เฉลิมฉลอง', glory: 'รุ่งโรจน์ (ทอง)', sorrow: 'สูญเสีย (เถ้าถ่าน)', sea: 'ค้าขายและทะเล', wisdom: 'ปัญญาและปฏิรูป (น้ำเงิน)' };
var COLORS = { cyan: '#22D3EE', violet: '#8B5CF6', pink: '#F472B6', lime: '#A3E635', amber: '#FBBF24' };

var S = { authed: null, docs: null, draft: {}, days: 30, stats: null, msg: '', msgType: '', hist: null, histKey: 'sukhothai', edit: null, arm: '' };
var app = document.getElementById('app');

/* ---------- tiny DOM helpers ---------- */
function add(e, c) { if (c == null || c === false) return; if (Array.isArray(c)) c.forEach(function (x) { add(e, x); }); else e.appendChild(c.nodeType ? c : document.createTextNode(String(c))); }
function h(tag, a) {
  var e = document.createElement(tag); a = a || {};
  for (var k in a) {
    var v = a[k]; if (v == null || v === false) continue;
    if (k === 'class') e.className = v;
    else if (k === 'on') { for (var ev in v) e.addEventListener(ev, v[ev]); }
    else if (k === 'html') e.innerHTML = v;            /* only ever used for numeric-built SVG strings */
    else if (k === 'for') e.htmlFor = v;
    else if (k === 'style' || k === 'aria-current' || k === 'aria-pressed' || k === 'role' || k === 'download' || k === 'viewBox') e.setAttribute(k, v === true ? '' : v);
    else if (k in e) { try { e[k] = v; } catch (_) { e.setAttribute(k, v); } }
    else e.setAttribute(k, v === true ? '' : v);
  }
  for (var i = 2; i < arguments.length; i++) add(e, arguments[i]);
  return e;
}
function clone(o) { return JSON.parse(JSON.stringify(o)); }
function nf(n) { return (n || 0).toLocaleString('en-US'); }
function icon(d) { return h('span', { html: '<svg viewBox="0 0 24 24" aria-hidden="true">' + d + '</svg>' }).firstChild; }
var ICONS = {
  dash: '<path d="M3 13h4v8H3zM10 3h4v18h-4zM17 9h4v12h-4z"/>',
  doc: '<path d="M6 3h9l4 4v14H6z"/><path d="M14 3v5h5M9 13h7M9 17h7"/>',
  hist: '<path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5M12 7v5l3 2"/>',
  cog: '<circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M19 5l-2 2M7 17l-2 2"/>',
  out: '<path d="M9 21H5V3h4M16 17l5-5-5-5M21 12H9"/>'
};

/* ---------- api ---------- */
function api(path, opt) {
  opt = opt || {};
  var o = { method: opt.method || 'GET', credentials: 'same-origin', headers: { 'x-requested-with': 'th-admin' } };
  if (opt.body) { o.headers['content-type'] = 'application/json'; o.body = JSON.stringify(opt.body); }
  return fetch(API + path, o).then(function (r) {
    return r.json().catch(function () { return {}; }).then(function (d) {
      if (r.status === 401 && path.indexOf('/login') !== 0) { S.authed = false; render(); }
      if (!r.ok) { var e = new Error(d.error || ('HTTP ' + r.status)); e.status = r.status; e.data = d; throw e; }
      return d;
    });
  });
}

/* ---------- helpers: docs / drafts ---------- */
function docOf(k) { return S.draft[k] || (S.docs && S.docs[k] && S.docs[k].doc) || null; }
function draftOf(k) { if (!S.draft[k]) S.draft[k] = clone(S.docs[k].doc); return S.draft[k]; }
function dirtyKeys() { return Object.keys(S.draft); }
function eventTitle(period, id) {
  var d = docOf(period); if (!d || !d.events) return id;
  for (var i = 0; i < d.events.length; i++) if (d.events[i].id === id) return d.events[i].title;
  return id;
}
function fmtTime(ts) { return new Date(ts).toLocaleString('th-TH', { timeZone: 'Asia/Bangkok', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }); }
function flash(msg, type, keep) {
  S.msg = msg; S.msgType = type || ''; renderBar();
  if (!keep) setTimeout(function () { if (S.msg === msg) { S.msg = ''; renderBar(); } }, 4500);
}
function saveDoc(k, note) {
  var base = S.docs[k] ? S.docs[k].version : 0;
  flash('กำลังบันทึก…', '', true);
  return api('/content', { method: 'PUT', body: { key: k, doc: S.draft[k], baseVersion: base, note: note || '' } }).then(function (r) {
    S.docs[k] = { doc: r.doc, version: r.version, updated_at: r.updated_at };
    delete S.draft[k]; S.hist = null; flash('บันทึกและเผยแพร่แล้ว · ผู้ชมจะเห็นภายในไม่กี่วินาที', 'ok'); return true;
  }).catch(function (e) { flash(e.message, 'err', true); return false; });
}
function saveAll() {
  var ks = dirtyKeys(), p = Promise.resolve(true);
  ks.forEach(function (k) { p = p.then(function (ok) { return ok ? saveDoc(k) : false; }); });
  return p.then(function () { render(); });
}

/* ---------- form field builders (write straight into the draft; no re-render so the cursor stays) ---------- */
function field(label, value, onInput, o) {
  o = o || {};
  var input = o.area ? h('textarea', { rows: o.rows || 3, value: value || '' }) : h('input', { type: 'text', value: value || '', placeholder: o.ph || '' });
  input.addEventListener('input', function () { onInput(input.value); renderBar(); });
  return h('label', { class: 'fld' + (o.wide ? ' wide' : '') }, h('span', null, label), input, o.hint ? h('div', { class: 'hint' }, o.hint) : null);
}
function lines(v) { return v.split('\n').map(function (x) { return x.trim(); }).filter(Boolean); }

/* ---------- charts (plain SVG, numbers only) ---------- */
function daysBetween(since) {
  var out = [], t = Date.parse(since + 'T00:00:00Z'), end = Date.parse(new Date(Date.now() + 7 * 3600e3).toISOString().slice(0, 10) + 'T00:00:00Z');
  for (; t <= end; t += 86400000) out.push(new Date(t).toISOString().slice(0, 10));
  return out;
}
function niceMax(m) { if (m <= 5) return 5; var p = Math.pow(10, Math.floor(Math.log10(m))), n = m / p; return (n <= 1 ? 1 : n <= 2 ? 2 : n <= 5 ? 5 : 10) * p; }
function lineChart(labels, series) {
  var W = 760, H = 250, L = 38, R = 10, T = 12, B = 26, iw = W - L - R, ih = H - T - B;
  var max = niceMax(Math.max.apply(null, [1].concat(series.map(function (s) { return Math.max.apply(null, s.vals); }))));
  var n = labels.length, X = function (i) { return L + (n === 1 ? iw / 2 : i * iw / (n - 1)); }, Y = function (v) { return T + ih - v / max * ih; };
  var svg = '<defs>' + series.map(function (s, i) { return '<linearGradient id="ga' + i + '" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="' + s.color + '" stop-opacity=".38"/><stop offset="1" stop-color="' + s.color + '" stop-opacity="0"/></linearGradient>'; }).join('') + '<filter id="glow"><feGaussianBlur stdDeviation="3" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs>';
  for (var g = 0; g <= 4; g++) { var gv = max * g / 4, gy = Y(gv); svg += '<line class="gl" x1="' + L + '" x2="' + (W - R) + '" y1="' + gy + '" y2="' + gy + '"/><text class="ax" x="' + (L - 7) + '" y="' + (gy + 4) + '" text-anchor="end">' + Math.round(gv) + '</text>'; }
  var step = Math.ceil(n / 8);
  labels.forEach(function (d, i) { if (i % step === 0 || i === n - 1) svg += '<text class="ax" x="' + X(i) + '" y="' + (H - 6) + '" text-anchor="middle">' + d.slice(8) + '/' + d.slice(5, 7) + '</text>'; });
  series.forEach(function (s, si) {
    var pts = s.vals.map(function (v, i) { return X(i).toFixed(1) + ',' + Y(v).toFixed(1); });
    if (si === 0) svg += '<polygon points="' + L + ',' + (T + ih) + ' ' + pts.join(' ') + ' ' + X(n - 1).toFixed(1) + ',' + (T + ih) + '" fill="url(#ga0)"/>';
    svg += '<polyline points="' + pts.join(' ') + '" fill="none" stroke="' + s.color + '" stroke-width="2.4" stroke-linejoin="round" stroke-linecap="round" filter="url(#glow)"/>';
  });
  svg += '<line id="cx" y1="' + T + '" y2="' + (T + ih) + '" stroke="rgba(255,255,255,.35)" stroke-dasharray="3 4" opacity="0"/>';
  series.forEach(function (s, si) { svg += '<circle id="cd' + si + '" r="4.5" fill="' + s.color + '" stroke="#060914" stroke-width="2" opacity="0"/>'; });
  svg += '<rect id="hit" x="' + L + '" y="' + T + '" width="' + iw + '" height="' + ih + '" fill="transparent"/>';
  var wrap = h('div', null);
  var read = h('div', { class: 'readout' }, 'เลื่อนเมาส์หรือแตะบนกราฟเพื่อดูรายวัน');
  var legend = h('div', { class: 'legend' }, series.map(function (s) { return h('span', null, h('i', { style: 'background:' + s.color }), s.name); }));
  var el = h('div', { html: '<svg class="chart" viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="กราฟการเข้าชมรายวัน">' + svg + '</svg>' });
  var sv = el.firstChild;
  function move(ev) {
    var r = sv.getBoundingClientRect(), x = (ev.clientX - r.left) / r.width * W;
    var i = Math.max(0, Math.min(n - 1, Math.round((x - L) / iw * (n - 1))));
    var cx = sv.querySelector('#cx'); cx.setAttribute('x1', X(i)); cx.setAttribute('x2', X(i)); cx.setAttribute('opacity', 1);
    series.forEach(function (s, si) { var c = sv.querySelector('#cd' + si); c.setAttribute('cx', X(i)); c.setAttribute('cy', Y(s.vals[i])); c.setAttribute('opacity', 1); });
    read.innerHTML = ''; add(read, [h('b', null, labels[i]), series.map(function (s) { return h('span', { style: 'color:' + s.color }, s.name + ' ' + nf(s.vals[i])); })]);
  }
  var hit = sv.querySelector('#hit'); hit.addEventListener('pointermove', move); hit.addEventListener('pointerdown', move);
  add(wrap, [legend, el, read]); return wrap;
}
function donut(items) {
  var tot = items.reduce(function (a, b) { return a + b.n; }, 0) || 1, C = 2 * Math.PI * 52, off = 0, s = '<circle cx="66" cy="66" r="52" fill="none" stroke="rgba(255,255,255,.07)" stroke-width="16"/>';
  items.forEach(function (it) { var len = it.n / tot * C; s += '<circle cx="66" cy="66" r="52" fill="none" stroke="' + it.color + '" stroke-width="16" stroke-dasharray="' + len.toFixed(2) + ' ' + (C - len).toFixed(2) + '" stroke-dashoffset="' + (-off).toFixed(2) + '" transform="rotate(-90 66 66)"/>'; off += len; });
  s += '<text x="66" y="72" text-anchor="middle" fill="#E8EEFF" font-size="20" font-family="Space Grotesk,sans-serif" font-weight="600">' + nf(tot) + '</text>';
  return h('div', { class: 'donut-wrap' }, h('div', { html: '<svg viewBox="0 0 132 132" aria-hidden="true">' + s + '</svg>' }).firstChild,
    h('div', null, items.map(function (it) { return h('div', { class: 'sm', style: 'margin:4px 0' }, h('i', { style: 'display:inline-block;width:10px;height:10px;border-radius:3px;margin-right:8px;background:' + it.color }), it.label + ' ', h('b', { class: 'mono' }, Math.round(it.n / tot * 100) + '%')); })));
}
function barList(rows, fmtLabel) {
  var max = Math.max.apply(null, [1].concat(rows.map(function (r) { return r.n; })));
  if (!rows.length) return h('div', { class: 'empty' }, 'ยังไม่มีข้อมูล');
  return h('div', { class: 'bars' }, rows.map(function (r) {
    return h('div', { class: 'row' }, h('span', { class: 't', title: fmtLabel(r) }, fmtLabel(r)), h('div', { class: 'bar' }, h('i', { style: 'width:' + (r.n / max * 100) + '%' })), h('b', { class: 'mono' }, nf(r.n)));
  }));
}

/* ---------- screens ---------- */
function kpi(label, color, o) {
  return h('div', { class: 'card kpi', style: '--c:' + color }, h('div', { class: 'lb' }, label), h('div', { class: 'v' }, nf(o.range)),
    h('div', { class: 'sub' }, h('span', null, 'วันนี้ ', h('b', null, nf(o.today))), h('span', null, '7 วัน ', h('b', null, nf(o.week)))));
}
function viewDashboard() {
  var st = S.stats, box = h('div');
  var chips = h('div', { class: 'chips', role: 'group', 'aria-label': 'ช่วงเวลา' }, [7, 30, 90].map(function (d) {
    return h('button', { type: 'button', 'aria-pressed': String(S.days === d), on: { click: function () { S.days = d; S.stats = null; render(); } } }, d + ' วัน');
  }));
  add(box, h('div', { class: 'top' }, h('div', null, h('h1', null, 'ภาพรวมการเข้าชม'), h('p', null, 'ข้อมูลจริงจากฐานข้อมูล D1 · เวลาประเทศไทย')), chips));
  if (!st) { add(box, h('div', { class: 'card empty' }, 'กำลังโหลดข้อมูล…')); return box; }
  var k = st.kpi, T = k.today || {}, W = k.week || {}, R = k.range || {};
  add(box, h('div', { class: 'grid g4' },
    kpi('ผู้เข้าชม (ไม่ซ้ำ)', COLORS.cyan, { range: R.visitors, today: T.visitors, week: W.visitors }),
    kpi('การเข้าเว็บ (session)', COLORS.violet, { range: R.visits, today: T.visits, week: W.visits }),
    kpi('การเปิดหน้า', COLORS.pink, { range: R.views, today: T.views, week: W.views }),
    kpi('การเปิดอ่านเหตุการณ์', COLORS.lime, { range: R.events, today: T.events, week: W.events })));
  var days = daysBetween(st.since), map = {}; st.daily.forEach(function (d) { map[d.day] = d; });
  function col(key) { return days.map(function (d) { return map[d] ? map[d][key] : 0; }); }
  var hours = []; for (var i = 0; i < 24; i++) hours.push(0); st.hours.forEach(function (x) { hours[x.hour] = x.n; });
  var hmax = Math.max.apply(null, [1].concat(hours));
  var devNames = { mobile: 'มือถือ', desktop: 'คอมพิวเตอร์', tablet: 'แท็บเล็ต' }, devCol = { mobile: COLORS.cyan, desktop: COLORS.violet, tablet: COLORS.pink };
  add(box, h('div', { class: 'grid g-main mt' },
    h('div', { class: 'card' }, h('h3', null, 'การเข้าชมรายวัน'), lineChart(days, [{ name: 'เปิดหน้า', color: COLORS.cyan, vals: col('views') }, { name: 'เข้าเว็บ', color: COLORS.violet, vals: col('visits') }, { name: 'อ่านเหตุการณ์', color: COLORS.lime, vals: col('events') }])),
    h('div', { class: 'card' }, h('h3', null, 'อุปกรณ์'), st.device.length ? donut(st.device.map(function (d) { return { n: d.n, label: devNames[d.device] || d.device || 'ไม่ทราบ', color: devCol[d.device] || COLORS.amber }; })) : h('div', { class: 'empty' }, 'ยังไม่มีข้อมูล'),
      h('h3', { style: 'margin-top:22px' }, 'ช่วงเวลาที่คนเข้าชม (0–23 น.)'),
      h('div', { class: 'hours', role: 'img', 'aria-label': 'จำนวนการเข้าชมตามชั่วโมง' }, hours.map(function (v, hr) { return h('i', { style: 'height:' + Math.max(2, v / hmax * 100) + '%', title: hr + ':00 · ' + v }); })),
      h('div', { class: 'hours-ax' }, h('span', null, '0'), h('span', null, '6'), h('span', null, '12'), h('span', null, '18'), h('span', null, '23')))));
  add(box, h('div', { class: 'grid g3 mt' },
    h('div', { class: 'card' }, h('h3', null, 'สมัยที่ถูกเปิดมากที่สุด'), barList(st.byPeriod.filter(function (p) { return p.period; }), function (r) { return r.period === 'learn' ? 'เรื่องน่ารู้' : (NAMES[r.period] || r.period); })),
    h('div', { class: 'card' }, h('h3', null, 'เหตุการณ์ยอดนิยม'), barList(st.topEvents, function (r) { return eventTitle(r.period, r.event_id); })),
    h('div', { class: 'card' }, h('h3', null, 'ประเทศ'), barList(st.country, function (r) { return r.country; }), h('h3', { style: 'margin-top:20px' }, 'มาจากเว็บไหน'), barList(st.refs, function (r) { return r.ref; }))));
  var tl = { visit: ['เข้าเว็บ', COLORS.violet], view: ['เปิดหน้า', COLORS.cyan], event: ['อ่านเหตุการณ์', COLORS.lime] };
  add(box, h('div', { class: 'grid g2 mt' },
    h('div', { class: 'card' }, h('h3', null, 'ความเคลื่อนไหวล่าสุด'), st.recent.length ? h('ul', { class: 'feed' }, st.recent.map(function (r) {
      var t = tl[r.type] || [r.type, COLORS.amber];
      return h('li', null, h('i', { class: 'dot', style: 'background:' + t[1] + ';box-shadow:0 0 8px ' + t[1] }), h('span', null, t[0] + ' ', h('b', null, r.event_id ? eventTitle(r.period, r.event_id) : (NAMES[r.period] || r.period || '')), r.country ? ' · ' + r.country : ''), h('time', null, fmtTime(r.ts)));
    })) : h('div', { class: 'empty' }, 'ยังไม่มีผู้เข้าชม')),
    h('div', { class: 'card' }, h('h3', null, 'ข้อมูลที่เก็บไว้'),
      h('p', { class: 'muted', style: 'margin-top:0' }, 'ทุกการเข้าชมถูกบันทึกถาวรในฐานข้อมูล D1 ไม่ลบอัตโนมัติ และไม่เก็บ IP ผู้เข้าชม'),
      h('div', { class: 'kpi' }, h('div', { class: 'v', style: '--c:#8B5CF6' }, nf(st.total.rows)), h('div', { class: 'lb' }, 'แถวข้อมูลทั้งหมด' + (st.total.first_ts ? ' · เริ่มเก็บ ' + fmtTime(st.total.first_ts) : ''))),
      h('div', { class: 'actions' }, [30, 90, 'all'].map(function (d) { return h('a', { class: 'btn sm', href: API + '/export?days=' + d, download: 'visits.csv' }, 'ดาวน์โหลด CSV ' + (d === 'all' ? 'ทั้งหมด' : d + ' วัน')); })))));
  return box;
}

function viewContentList() {
  var box = h('div');
  add(box, h('div', { class: 'top' }, h('div', null, h('h1', null, 'จัดการเนื้อหา'), h('p', null, 'เลือกสมัยที่ต้องการแก้ไข · บันทึกแล้วเผยแพร่ทันที และย้อนเวอร์ชันได้'))));
  if (!S.docs || !Object.keys(S.docs).length) { add(box, h('div', { class: 'card empty' }, 'ฐานข้อมูลยังไม่มีเนื้อหา รันคำสั่ง npm run db:seed ก่อน (ดู README)')); return box; }
  add(box, h('div', { class: 'pcards' }, KEYS.filter(function (k) { return S.docs[k]; }).map(function (k) {
    var d = docOf(k), n = d.events ? d.events.length : 0, hid = d.events ? d.events.filter(function (e) { return e.hidden; }).length : 0;
    return h('a', { class: 'card pcard', href: '#/content/' + k }, h('div', { class: 'muted sm' }, k === 'home' ? 'หน้าแรก' : (d.range || '')), h('h2', null, NAMES[k]),
      k === 'home' ? h('p', { class: 'muted sm' }, 'ข้อความหัวเว็บ คำบรรยาย ข้อเท็จจริงสั้น ๆ') : h('div', { class: 'n' }, n, h('span', { class: 'muted sm', style: '-webkit-text-fill-color:#8C9AC0' }, ' เหตุการณ์' + (hid ? ' (ซ่อน ' + hid + ')' : ''))),
      h('div', { class: 'sm muted' }, 'เวอร์ชัน ' + S.docs[k].version + ' · ' + fmtTime(S.docs[k].updated_at)), S.draft[k] ? h('span', { class: 'badge warn' }, 'มีการแก้ที่ยังไม่บันทึก') : null);
  })));
  return box;
}

function viewDocEditor(k) {
  var box = h('div');
  if (!S.docs || !S.docs[k]) { add(box, h('div', { class: 'card empty' }, 'ไม่พบเอกสาร')); return box; }
  var d = docOf(k), isHome = k === 'home';
  var dr = function () { return draftOf(k); };
  add(box, h('div', { class: 'crumbs' }, h('a', { href: '#/content' }, 'เนื้อหา'), ' / ' + NAMES[k]));
  add(box, h('div', { class: 'top' }, h('div', null, h('h1', null, isHome ? 'หน้าหลัก' : 'สมัย' + NAMES[k]), h('p', null, 'ข้อความหัวเว็บ' + (isHome ? '' : ' ยุคย่อย แหล่งอ้างอิง และเหตุการณ์')))));

  var f = h('div', { class: 'card' }, h('h3', null, 'ข้อความหัวเว็บ'), h('div', { class: 'form' },
    field('หัวข้อใหญ่', d.title, function (v) { dr().title = v; }),
    field('ข้อความเล็กด้านบนหัวข้อ', d.eyebrow, function (v) { dr().eyebrow = v; }),
    field('คำบรรยายใต้หัวข้อ', d.lede, function (v) { dr().lede = v; }, { area: 1, wide: 1 }),
    isHome ? null : field('ชื่อสมัย (แสดงในเมนู/การ์ด)', d.name, function (v) { dr().name = v; }),
    isHome ? null : field('ป้ายเมนู (เช่น สมัยสุโขทัย)', d.label, function (v) { dr().label = v; }),
    isHome ? null : field('ช่วงปี', d.range, function (v) { dr().range = v; }),
    isHome ? null : field('คำอธิบายบนการ์ดหน้าหลัก', d.blurb, function (v) { dr().blurb = v; }, { area: 1, wide: 1 }),
    field('ข้อเท็จจริงสั้น ๆ', (d.facts || []).join('\n'), function (v) { dr().facts = lines(v); }, { area: 1, wide: 1, hint: 'บรรทัดละ 1 ข้อ' })));
  add(box, f);
  if (isHome) return box;

  /* eras */
  var erasCard = h('div', { class: 'card mt' }, h('h3', null, 'ยุคย่อย (ใช้เป็นตัวกรองไทม์ไลน์)'));
  Object.keys(d.eras).sort().forEach(function (n) {
    erasCard.appendChild(h('div', { class: 'sub-rows' }, h('b', { class: 'mono' }, 'ยุค ' + n),
      h('input', { type: 'text', value: d.eras[n].name, 'aria-label': 'ชื่อยุค ' + n, on: { input: function (e) { dr().eras[n].name = e.target.value; renderBar(); } } }),
      h('input', { type: 'text', value: d.eras[n].range, 'aria-label': 'ช่วงปียุค ' + n, on: { input: function (e) { dr().eras[n].range = e.target.value; renderBar(); } } }), h('span')));
  });
  add(box, erasCard);

  /* sources */
  var srcCard = h('div', { class: 'card mt' }, h('h3', null, 'แหล่งอ้างอิง'));
  (d.src || []).forEach(function (s, i) {
    srcCard.appendChild(h('div', { class: 'sub-rows src' },
      h('input', { type: 'text', value: s.t, placeholder: 'ชื่อแหล่งอ้างอิง', on: { input: function (e) { dr().src[i].t = e.target.value; renderBar(); } } }),
      h('input', { type: 'url', value: s.u, placeholder: 'https://…', on: { input: function (e) { dr().src[i].u = e.target.value; renderBar(); } } }),
      h('button', { class: 'btn sm danger', type: 'button', on: { click: function () { dr().src.splice(i, 1); render(); } } }, 'ลบ')));
  });
  srcCard.appendChild(h('div', { class: 'actions' }, h('button', { class: 'btn sm', type: 'button', on: { click: function () { dr().src = dr().src || []; dr().src.push({ t: '', u: 'https://' }); render(); } } }, '+ เพิ่มแหล่งอ้างอิง')));
  add(box, srcCard);

  /* events */
  var evCard = h('div', { class: 'card mt' }, h('h3', null, 'เหตุการณ์ (' + d.events.length + ')', h('a', { class: 'btn sm pri', href: '#/edit/' + k + '/new' }, '+ เพิ่มเหตุการณ์')));
  var list = h('div', { class: 'rows' });
  d.events.forEach(function (e, i) {
    var armKey = k + ':' + e.id;
    list.appendChild(h('div', { class: 'rowi' + (e.hidden ? ' off' : '') },
      h('span', { class: 'y' }, (e.pre || '') + ' ' + (e.big || '')), h('span', { class: 't', title: e.title }, e.title, e.hidden ? [' ', h('span', { class: 'badge warn' }, 'ซ่อนอยู่')] : null),
      h('span', { class: 'b' },
        h('button', { class: 'btn sm', type: 'button', 'aria-label': 'เลื่อนขึ้น', disabled: i === 0, on: { click: function () { var a = dr().events; a.splice(i - 1, 0, a.splice(i, 1)[0]); render(); } } }, '▲'),
        h('button', { class: 'btn sm', type: 'button', 'aria-label': 'เลื่อนลง', disabled: i === d.events.length - 1, on: { click: function () { var a = dr().events; a.splice(i + 1, 0, a.splice(i, 1)[0]); render(); } } }, '▼'),
        h('a', { class: 'btn sm', href: '#/edit/' + k + '/' + encodeURIComponent(e.id) }, 'แก้ไข'),
        h('button', { class: 'btn sm', type: 'button', on: { click: function () { var ev = dr().events[i]; if (ev.hidden) delete ev.hidden; else ev.hidden = true; render(); } } }, e.hidden ? 'แสดง' : 'ซ่อน'),
        h('button', { class: 'btn sm danger' + (S.arm === armKey ? ' armed' : ''), type: 'button', on: { click: function () { if (S.arm === armKey) { dr().events.splice(i, 1); S.arm = ''; } else S.arm = armKey; render(); } } }, S.arm === armKey ? 'ยืนยันลบ?' : 'ลบ'))));
  });
  evCard.appendChild(list); add(box, evCard);
  return box;
}

function viewEventEditor(k, id) {
  var box = h('div');
  if (!S.docs || !S.docs[k]) { add(box, h('div', { class: 'card empty' }, 'ไม่พบเอกสาร')); return box; }
  var d = docOf(k), isNew = id === 'new';
  if (!S.edit || S.edit.key !== k || S.edit.id !== id) {
    var src = isNew ? { id: 'ev-' + Date.now().toString(36), era: +Object.keys(d.eras)[0] || 1, pre: 'พ.ศ.', big: '', title: '', sum: '', people: [], story: [''], note: '' } : clone(d.events.filter(function (e) { return e.id === id; })[0] || null);
    if (!src) { add(box, h('div', { class: 'card empty' }, 'ไม่พบเหตุการณ์ ', h('a', { href: '#/content/' + k }, 'กลับ'))); return box; }
    S.edit = { key: k, id: id, isNew: isNew, e: src };
  }
  var E = S.edit.e, set = function (f) { return function (v) { E[f] = v; }; };
  add(box, h('div', { class: 'crumbs' }, h('a', { href: '#/content' }, 'เนื้อหา'), ' / ', h('a', { href: '#/content/' + k }, NAMES[k]), ' / ' + (isNew ? 'เหตุการณ์ใหม่' : 'แก้ไขเหตุการณ์')));
  add(box, h('div', { class: 'top' }, h('div', null, h('h1', null, isNew ? 'เพิ่มเหตุการณ์ใหม่' : 'แก้ไขเหตุการณ์'), h('p', null, 'สมัย' + NAMES[k]))));

  var eraSel = h('select', { on: { change: function (e) { E.era = +e.target.value; } } }, Object.keys(d.eras).sort().map(function (n) { return h('option', { value: n, selected: +n === +E.era }, 'ยุค ' + n + ' · ' + d.eras[n].name); }));
  var moodSel = h('select', { on: { change: function (e) { if (e.target.value) E.mood = e.target.value; else delete E.mood; } } }, Object.keys(MOODS).map(function (m) { return h('option', { value: m, selected: (E.mood || '') === m }, MOODS[m]); }));
  var artOpts = [h('option', { value: '' }, E.art ? 'มีภาพวาดกำหนดเอง (เลือกเพื่อเปลี่ยน)' : 'คงภาพวาดเดิม')];
  var artSrc = {};
  KEYS.forEach(function (kk) { if (kk === 'home' || !S.docs[kk]) return; docOf(kk).events.forEach(function (x) { var spec = x.art || (window.TH_ART && window.TH_ART.ARTS[x.id]); if (spec) { artSrc[kk + '|' + x.id] = spec; artOpts.push(h('option', { value: kk + '|' + x.id }, 'ใช้ภาพวาดของ: ' + x.title)); } }); });
  artOpts.push(h('option', { value: '__clear' }, 'ล้างภาพวาดกำหนดเอง (ใช้ภาพมาตรฐาน)'));
  var artSel = h('select', { on: { change: function (e) { var v = e.target.value; if (v === '__clear') delete E.art; else if (v) E.art = clone(artSrc[v]); } } }, artOpts);

  var imgBox = h('div'), audBox = h('div');
  var safe = function (u) { return /^https:\/\/[^\s"'<>]+$/.test(u) || /^\/[A-Za-z0-9_\-./]+$/.test(u); };
  function pv() {
    imgBox.innerHTML = ''; audBox.innerHTML = '';
    if (E.img && safe(E.img)) imgBox.appendChild(h('img', { class: 'preview', src: E.img, alt: 'ตัวอย่างรูป' }));
    if (E.audio && safe(E.audio)) audBox.appendChild(h('audio', { controls: true, preload: 'none', src: E.audio, style: 'margin-top:8px;width:100%' }));
  }
  pv();

  add(box, h('div', { class: 'card' }, h('div', { class: 'form' },
    isNew ? field('รหัสเหตุการณ์ (id)', E.id, set('id'), { hint: 'a-z 0-9 และ - เท่านั้น ใช้อ้างอิงภายใน เปลี่ยนภายหลังไม่ได้' }) : null,
    field('คำนำหน้าปี', E.pre, set('pre'), { hint: 'เช่น พ.ศ. หรือ ราว พ.ศ.' }), field('ปี / ช่วงปี', E.big, set('big'), { hint: 'เช่น 2310 หรือ 2311–13' }),
    field('ชื่อเหตุการณ์', E.title, set('title'), { wide: 1 }),
    h('label', { class: 'fld' }, h('span', null, 'ยุคย่อย'), eraSel), h('label', { class: 'fld' }, h('span', null, 'บรรยากาศพื้นหลังเมื่อเลื่อนมาถึง'), moodSel),
    field('สรุปสั้น (แสดงบนการ์ด)', E.sum, set('sum'), { area: 1, wide: 1 }),
    field('คำสำคัญ', (E.people || []).join('\n'), function (v) { E.people = lines(v); }, { area: 1, wide: 1, hint: 'บรรทัดละ 1 คำ' }),
    field('เนื้อเรื่อง (ใช้เป็นเสียงบรรยายด้วย)', (E.story || []).join('\n\n'), function (v) { E.story = v.split(/\n\s*\n/).map(function (x) { return x.trim(); }).filter(Boolean); }, { area: 1, rows: 12, wide: 1, hint: 'เว้นบรรทัดว่าง 1 บรรทัดเพื่อแบ่งย่อหน้า' }),
    field('ข้อควรรู้', E.note, set('note'), { area: 1, wide: 1 }),
    h('div', { class: 'fld wide' }, field('ลิงก์รูปภาพ (ไม่บังคับ)', E.img || '', function (v) { if (v) E.img = v; else delete E.img; pv(); }, { ph: 'https://…/image.jpg', hint: 'ถ้าไม่ใส่ จะใช้ภาพวาดประกอบเดิม' }), imgBox),
    h('div', { class: 'fld wide' }, field('ลิงก์ไฟล์เสียงบรรยาย (ไม่บังคับ)', E.audio || '', function (v) { if (v) E.audio = v; else delete E.audio; pv(); }, { ph: 'https://…/voice.mp3', hint: 'ถ้าไม่ใส่ จะใช้เสียงอ่านอัตโนมัติของเบราว์เซอร์' }), audBox),
    h('label', { class: 'fld wide' }, h('span', null, 'ภาพวาดประกอบ'), artSel),
    h('label', { class: 'fld wide', style: 'display:flex;gap:10px;align-items:center' }, h('input', { type: 'checkbox', style: 'width:auto;min-height:0', checked: !!E.hidden, on: { change: function (e) { if (e.target.checked) E.hidden = true; else delete E.hidden; } } }), h('span', { style: 'margin:0' }, 'ซ่อนเหตุการณ์นี้จากผู้ชม')))));

  var msg = h('div', { class: 'status', role: 'status' });
  add(box, h('div', { class: 'actions' },
    h('button', { class: 'btn pri', type: 'button', on: { click: function () {
      if (!E.title.trim()) { msg.className = 'status err'; msg.textContent = 'กรุณากรอกชื่อเหตุการณ์'; return; }
      var dr = draftOf(k), idx = -1; dr.events.forEach(function (x, i) { if (x.id === (isNew ? E.id : id)) idx = i; });
      if (isNew && idx >= 0) { msg.className = 'status err'; msg.textContent = 'รหัสนี้ถูกใช้แล้ว'; return; }
      if (idx >= 0) dr.events[idx] = clone(E); else dr.events.push(clone(E));
      saveDoc(k, (isNew ? 'เพิ่ม: ' : 'แก้ไข: ') + E.title).then(function (ok) { if (ok) { S.edit = null; location.hash = '#/content/' + k; } else { render(); } });
    } } }, 'บันทึกและเผยแพร่'),
    h('a', { class: 'btn', href: '#/content/' + k, on: { click: function () { S.edit = null; } } }, 'ยกเลิก'), msg));
  return box;
}

function viewHistory() {
  var box = h('div');
  add(box, h('div', { class: 'top' }, h('div', null, h('h1', null, 'ประวัติการแก้ไข'), h('p', null, 'ทุกครั้งที่บันทึกจะเก็บเวอร์ชันเดิมไว้ (50 เวอร์ชันล่าสุดต่อเอกสาร) · ย้อนกลับได้'))),
    h('div', { class: 'chips', role: 'group' }, KEYS.map(function (k) { return h('button', { type: 'button', 'aria-pressed': String(S.histKey === k), on: { click: function () { S.histKey = k; S.hist = null; render(); } } }, NAMES[k]); })));
  var card = h('div', { class: 'card' });
  if (!S.hist) card.appendChild(h('div', { class: 'empty' }, 'กำลังโหลด…'));
  else if (!S.hist.length) card.appendChild(h('div', { class: 'empty' }, 'ยังไม่มีเวอร์ชันเก่าของเอกสารนี้'));
  else card.appendChild(h('div', { class: 'rows' }, S.hist.map(function (it) {
    var ak = 'h' + it.id;
    return h('div', { class: 'rowi' }, h('span', { class: 'y' }, 'v' + it.version), h('span', { class: 't' }, fmtTime(it.saved_at) + (it.note ? ' · ' + it.note : ''), ' ', h('span', { class: 'muted sm' }, (it.size / 1024).toFixed(1) + ' KB')),
      h('span', { class: 'b' }, h('button', { class: 'btn sm danger' + (S.arm === ak ? ' armed' : ''), type: 'button', on: { click: function () {
        if (S.arm !== ak) { S.arm = ak; render(); return; }
        S.arm = ''; api('/history', { method: 'POST', body: { id: it.id } }).then(function () { return loadDocs(); }).then(function () { S.hist = null; flash('ย้อนกลับเป็นเวอร์ชัน ' + it.version + ' แล้ว', 'ok'); render(); }).catch(function (e) { flash(e.message, 'err', true); });
      } } }, S.arm === ak ? 'ยืนยันย้อนกลับ?' : 'ย้อนกลับมาใช้')));
  })));
  add(box, card);
  if (!S.hist) api('/history?key=' + S.histKey).then(function (r) { S.hist = r.items; if (route().p === 'history') render(); }).catch(function (e) { flash(e.message, 'err', true); });
  return box;
}

function viewSettings() {
  var box = h('div');
  add(box, h('div', { class: 'top' }, h('div', null, h('h1', null, 'ตั้งค่าและสำรองข้อมูล'), h('p', null, 'รหัสผ่านและคีย์ลับตั้งบนเซิร์ฟเวอร์ ไม่ได้อยู่ในโค้ดหน้าเว็บ'))));
  add(box, h('div', { class: 'grid g2' },
    h('div', { class: 'card' }, h('h3', null, 'สำรองข้อมูล'), h('p', { class: 'muted', style: 'margin-top:0' }, 'ดาวน์โหลดสำเนาเนื้อหาทั้งหมด (JSON) เก็บเข้า Git หรือไว้ในเครื่อง'),
      h('div', { class: 'actions', style: 'margin-top:0' }, h('a', { class: 'btn', href: API + '/export?what=content', download: 'content-backup.json' }, 'ดาวน์โหลดเนื้อหา (JSON)'), h('a', { class: 'btn', href: API + '/export?days=all', download: 'visits.csv' }, 'ดาวน์โหลดประวัติเข้าชม (CSV)'))),
    h('div', { class: 'card' }, h('h3', null, 'เปลี่ยนรหัสผ่านแอดมิน'), h('p', { class: 'muted', style: 'margin-top:0' }, 'รันในเครื่องที่โฟลเดอร์โปรเจกต์ แล้วใส่รหัสใหม่เมื่อถูกถาม'),
      h('pre', { style: 'margin:0;padding:12px;border-radius:12px;background:rgba(5,8,20,.7);border:1px solid var(--line);overflow:auto;font:13px var(--f-num)' }, 'npx wrangler pages secret put ADMIN_PASSWORD')),
    h('div', { class: 'card' }, h('h3', null, 'ออกจากระบบ'), h('p', { class: 'muted', style: 'margin-top:0' }, 'เซสชันหมดอายุเองใน 12 ชั่วโมง'), h('button', { class: 'btn danger', type: 'button', on: { click: logout } }, 'ออกจากระบบ'))));
  return box;
}

function viewLogin() {
  var pw = h('input', { type: 'password', id: 'pw', autocomplete: 'current-password', required: true }), msg = h('div', { class: 'status err', role: 'alert' });
  var form = h('form', { class: 'card login', on: { submit: function (ev) {
    ev.preventDefault(); msg.textContent = '';
    api('/login', { method: 'POST', body: { password: pw.value } }).then(function () { S.authed = true; boot(); }).catch(function (e) { msg.textContent = e.message; pw.value = ''; pw.focus(); });
  } } }, h('div', { class: 'orb' }, 'ร'), h('h1', null, 'หลังบ้าน'), h('p', null, 'รุ่งอรุณสุโขทัย · สำหรับผู้ดูแลเท่านั้น'), h('label', { for: 'pw' }, 'รหัสผ่าน'), pw, h('button', { class: 'btn pri', type: 'submit' }, 'เข้าสู่ระบบ'), msg);
  setTimeout(function () { pw.focus(); }, 30);
  return h('div', { class: 'login-wrap' }, form);
}

/* ---------- shell / routing ---------- */
function route() { var p = (location.hash || '#/dashboard').replace(/^#\/?/, '').split('/'); return { p: p[0] || 'dashboard', a: p[1] ? decodeURIComponent(p[1]) : '', b: p[2] ? decodeURIComponent(p[2]) : '' }; }
function logout() { api('/login', { method: 'DELETE' }).finally(function () { S.authed = false; S.docs = null; render(); }); }
function loadDocs() { return api('/content').then(function (r) { S.docs = r.docs; }); }
function loadStats() { return api('/stats?days=' + S.days).then(function (r) { S.stats = r; if (route().p === 'dashboard') render(); }).catch(function (e) { flash(e.message, 'err', true); }); }

function nav(r) {
  var items = [['dashboard', 'ภาพรวม', ICONS.dash], ['content', 'เนื้อหา', ICONS.doc], ['edit', null], ['history', 'ประวัติแก้ไข', ICONS.hist], ['settings', 'ตั้งค่า', ICONS.cog]];
  var on = r.p === 'edit' ? 'content' : r.p;
  return h('nav', { class: 'nav', 'aria-label': 'เมนูหลังบ้าน' }, items.filter(function (i) { return i[1]; }).map(function (i) {
    var a = h('a', { href: '#/' + i[0], 'aria-current': on === i[0] ? 'page' : null }); a.appendChild(h('span', { html: '<svg viewBox="0 0 24 24" aria-hidden="true">' + i[2] + '</svg>' }).firstChild); a.appendChild(document.createTextNode(i[1])); return a;
  }));
}
function renderBar() {
  var old = document.getElementById('savebar'); if (old) old.remove();
  if (!S.authed) return;
  var dk = dirtyKeys();
  if (!dk.length && !S.msg) return;
  var bar = h('div', { id: 'savebar', class: 'savebar' + (S.msgType === 'ok' ? ' ok' : S.msgType === 'err' ? ' err' : ''), role: 'status' });
  var left = h('div', { class: 'status ' + S.msgType }, S.msg || ('มีการเปลี่ยนแปลงที่ยังไม่บันทึก: ' + dk.map(function (k) { return NAMES[k]; }).join(', ')));
  add(bar, left);
  if (dk.length) add(bar, h('div', { style: 'display:flex;gap:8px' },
    h('button', { class: 'btn sm', type: 'button', on: { click: function () { S.draft = {}; S.msg = ''; S.arm = ''; render(); } } }, 'ทิ้งการแก้ไข'),
    h('button', { class: 'btn sm pri', type: 'button', on: { click: saveAll } }, 'บันทึกและเผยแพร่')));
  document.body.appendChild(bar);
}
function render() {
  app.innerHTML = '';
  if (S.authed === null) { app.appendChild(h('div', { class: 'login-wrap' }, h('div', { class: 'empty' }, 'กำลังโหลด…'))); return; }
  if (!S.authed) { app.appendChild(viewLogin()); renderBar(); return; }
  var r = route(), main;
  if (r.p === 'content' && r.a) main = viewDocEditor(r.a);
  else if (r.p === 'content') main = viewContentList();
  else if (r.p === 'edit') main = viewEventEditor(r.a, r.b);
  else if (r.p === 'history') main = viewHistory();
  else if (r.p === 'settings') main = viewSettings();
  else main = viewDashboard();
  if (r.p !== 'edit') S.edit = null;
  var side = h('aside', { class: 'side' }, h('div', { class: 'brand' }, h('i', null, 'ร'), h('div', null, 'รุ่งอรุณสุโขทัย', h('small', null, 'Control Room'))), nav(r), h('div', { class: 'sp' }),
    h('button', { class: 'btn sm', type: 'button', on: { click: logout } }, 'ออกจากระบบ'), h('div', { class: 'foot' }, 'ข้อมูลเก็บบน Cloudflare D1'));
  app.appendChild(h('div', { class: 'shell' }, side, h('main', { class: 'main', id: 'main' }, main)));
  if (r.p === 'dashboard' && !S.stats) loadStats();
  renderBar();
}
window.addEventListener('hashchange', function () { S.arm = ''; render(); window.scrollTo(0, 0); });
window.addEventListener('beforeunload', function (ev) { if (dirtyKeys().length) { ev.preventDefault(); ev.returnValue = ''; } });

function boot() {
  return loadDocs().then(function () { render(); }).catch(function (e) { if (e.status !== 401) flash(e.message, 'err', true); render(); });
}
api('/login').then(function (r) { S.authed = !!r.ok; if (S.authed) return boot(); render(); }).catch(function () { S.authed = false; render(); });
render();
})();

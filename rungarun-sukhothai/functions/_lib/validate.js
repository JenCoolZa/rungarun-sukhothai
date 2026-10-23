// Server-side validation of content documents before they reach D1 (and then every visitor).
const SAFE_URL = /^https?:\/\/[^\s"'<>]+$/;
const SAFE_PATH = /^\/[A-Za-z0-9_\-./]+$/;
const ID = /^[a-z0-9][a-z0-9-]{0,39}$/i;
const MOODS = new Set(['', 'peace', 'war', 'joy', 'glory', 'sorrow', 'sea', 'wisdom']);

const str = (v, max, name) => {
  if (typeof v !== 'string') throw new Error(`${name} ต้องเป็นข้อความ`);
  if (v.length > max) throw new Error(`${name} ยาวเกิน ${max} ตัวอักษร`);
  return v;
};
const strList = (v, maxItems, maxLen, name) => {
  if (!Array.isArray(v) || v.length > maxItems) throw new Error(`${name} ต้องเป็นรายการไม่เกิน ${maxItems} รายการ`);
  return v.map((x, i) => str(x, maxLen, `${name}[${i + 1}]`));
};
const media = (v, name) => {
  if (v === undefined || v === '') return '';
  str(v, 500, name);
  if (!SAFE_URL.test(v) && !SAFE_PATH.test(v)) throw new Error(`${name} ต้องเป็นลิงก์ https:// หรือพาธที่ขึ้นต้นด้วย /`);
  return v;
};

function validateEvent(e, i) {
  const n = `เหตุการณ์ที่ ${i + 1}`;
  if (!e || typeof e !== 'object') throw new Error(`${n} ไม่ถูกต้อง`);
  if (!ID.test(e.id || '')) throw new Error(`${n}: รหัส (id) ใช้ได้เฉพาะ a-z 0-9 และ - ไม่เกิน 40 ตัว`);
  const out = {
    id: e.id,
    era: Math.max(1, Math.min(9, parseInt(e.era, 10) || 1)),
    pre: str(e.pre ?? '', 40, `${n} คำนำหน้าปี`),
    big: str(e.big ?? '', 60, `${n} ปี`),
    title: str(e.title ?? '', 200, `${n} ชื่อ`),
    sum: str(e.sum ?? '', 600, `${n} สรุป`),
    people: strList(e.people ?? [], 30, 120, `${n} คำสำคัญ`),
    story: strList(e.story ?? [], 40, 4000, `${n} เนื้อเรื่อง`),
    note: str(e.note ?? '', 1500, `${n} ข้อควรรู้`),
  };
  if (!out.title.trim()) throw new Error(`${n}: ต้องมีชื่อเหตุการณ์`);
  if (e.mood) { if (!MOODS.has(e.mood)) throw new Error(`${n}: บรรยากาศไม่ถูกต้อง`); out.mood = e.mood; }
  if (e.img) out.img = media(e.img, `${n} รูป`);
  if (e.audio) out.audio = media(e.audio, `${n} เสียง`);
  if (e.hidden) out.hidden = true;
  if (e.art) {
    const a = e.art;
    if (!a || typeof a !== 'object' || !Array.isArray(a.items) || a.items.length > 40) throw new Error(`${n}: ภาพวาด (art) ไม่ถูกต้อง`);
    for (const it of a.items) {
      if (!Array.isArray(it) || typeof it[0] !== 'string' || !/^[a-z0-9]{1,20}$/i.test(it[0])) throw new Error(`${n}: ภาพวาด (art) ไม่ถูกต้อง`);
      if (it.slice(1, 4).some((x) => typeof x !== 'number')) { if (it.length > 1) throw new Error(`${n}: ภาพวาด (art) ไม่ถูกต้อง`); }
    }
    if (a.sky && !/^[a-z]{2,10}$/.test(a.sky)) throw new Error(`${n}: sky ไม่ถูกต้อง`);
    out.art = a;
  }
  return out;
}

export function validateDoc(key, doc) {
  if (!doc || typeof doc !== 'object') throw new Error('เอกสารไม่ถูกต้อง');
  if (key === 'home') {
    return {
      key, order: Array.isArray(doc.order) ? doc.order.filter((k) => /^[a-z]+$/.test(k)) : undefined,
      eyebrow: str(doc.eyebrow ?? '', 200, 'eyebrow'), title: str(doc.title ?? '', 120, 'หัวข้อ'),
      lede: str(doc.lede ?? '', 800, 'คำบรรยาย'), facts: strList(doc.facts ?? [], 8, 120, 'ข้อเท็จจริง'),
    };
  }
  const eras = {};
  for (const [k, v] of Object.entries(doc.eras || {})) {
    if (!/^[1-9]$/.test(k)) throw new Error('ยุคย่อยต้องมีเลข 1-9');
    eras[k] = { name: str(v?.name ?? '', 120, 'ชื่อยุค'), range: str(v?.range ?? '', 80, 'ช่วงปียุค') };
  }
  if (!Object.keys(eras).length) throw new Error('ต้องมียุคย่อยอย่างน้อย 1 ยุค');
  const src = (doc.src || []).map((s, i) => {
    const u = str(s?.u ?? '', 500, `แหล่งอ้างอิง ${i + 1} ลิงก์`);
    if (!SAFE_URL.test(u)) throw new Error(`แหล่งอ้างอิง ${i + 1}: ลิงก์ต้องขึ้นต้นด้วย http(s):// และห้ามมีช่องว่างหรืออัญประกาศ`);
    return { t: str(s?.t ?? '', 300, `แหล่งอ้างอิง ${i + 1} ชื่อ`), u };
  });
  if (!Array.isArray(doc.events) || doc.events.length > 200) throw new Error('events ไม่ถูกต้อง');
  const events = doc.events.map(validateEvent);
  const ids = new Set();
  for (const e of events) { if (ids.has(e.id)) throw new Error(`รหัสซ้ำ: ${e.id}`); ids.add(e.id); if (!eras[e.era]) throw new Error(`เหตุการณ์ "${e.title}" อ้างถึงยุคย่อย ${e.era} ที่ไม่มี`); }
  return {
    key, label: str(doc.label ?? '', 80, 'label'), name: str(doc.name ?? '', 80, 'ชื่อสมัย'), range: str(doc.range ?? '', 80, 'ช่วงปี'),
    blurb: str(doc.blurb ?? '', 500, 'blurb'), eyebrow: str(doc.eyebrow ?? '', 200, 'eyebrow'), title: str(doc.title ?? '', 120, 'หัวข้อ'),
    lede: str(doc.lede ?? '', 800, 'คำบรรยาย'), facts: strList(doc.facts ?? [], 8, 120, 'ข้อเท็จจริง'), eras, src, events,
  };
}

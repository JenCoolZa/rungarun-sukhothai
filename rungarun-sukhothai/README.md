# รุ่งอรุณสุโขทัย — โปรเจกต์แยกไฟล์ + Cloudflare D1

```
src/
  index.html            โครงหน้าเว็บ (เทมเพลต)
  partials/             body.html (เนื้อหาหน้า) · svg-defs.html (ไล่สีท้องฟ้า)
  styles/               CSS แยกตามส่วน (tokens-base, hero, timeline, sheet, player ...)
  js/art.js             ชุดภาพประกอบ SVG (ฉากต่าง ๆ ของแต่ละเหตุการณ์)
  js/app.js             ตัวแอปหลัก (ไทม์ไลน์ เสียงบรรยาย แผนที่ ฯลฯ)
  js/content.js         เชื่อม /api (ดึงเนื้อหาล่าสุด + บันทึกสถิติ)
  data/                 เนื้อหา JSON: home / sukhothai / ayutthaya / thonburi / rattanakosin
  site.config.json      รหัสผ่านหน้าแรก (gateCode) — ว่างไว้ = ไม่มีหน้าใส่รหัส
admin/                  หลังบ้าน (หน้าแยก /admin/): index.html, admin.css, admin.js
functions/api/          Cloudflare Pages Functions (เชื่อม D1)
db/schema.sql           โครงตาราง D1
build.mjs               รวมทุกอย่างเป็นไฟล์เดียว -> dist/ และสร้าง db/seed.sql
wrangler.toml           ผูก D1 (account_id, database_id) ไว้แล้ว
```

## ขั้นตอนติดตั้ง (ครั้งแรก)

```bash
npm install
npx wrangler login

npm run db:schema        # สร้างตารางใน D1
npm run db:seed          # ใส่เนื้อหาตั้งต้นจาก src/data/*.json

# ตั้งรหัสลับบนเซิร์ฟเวอร์ (ไม่เก็บในโค้ด)
npx wrangler pages project create rungarun-sukhothai --production-branch main
npx wrangler pages secret put ADMIN_PASSWORD --project-name rungarun-sukhothai
npx wrangler pages secret put SESSION_SECRET --project-name rungarun-sukhothai   # สุ่มยาว ๆ 32+ ตัวอักษร

npm run deploy           # build + เผยแพร่
```

หน้าเว็บ: `https://<project>.pages.dev/`  ·  หลังบ้าน: `https://<project>.pages.dev/admin/`

## ทดสอบในเครื่อง

```bash
cp .dev.vars.example .dev.vars       # แก้รหัสผ่าน
npm run db:schema:local && npm run db:seed:local
npm run dev                          # http://localhost:8788
```

## หลักการทำงาน

- **ผู้ชม**: หน้าเว็บมีเนื้อหาฝังมาจาก `src/data/*.json` (เปิดเร็ว ใช้ได้แม้ออฟไลน์) แล้วดึง `/api/content` จาก D1 มาแทนที่ถ้าแอดมินแก้ไว้
- **แอดมินแก้เนื้อหา** -> บันทึกลง D1 ทันที (ผ่านการตรวจข้อมูลฝั่งเซิร์ฟเวอร์) และเก็บเวอร์ชันเก่าไว้ย้อนกลับได้ 50 เวอร์ชัน/เอกสาร
- **อยากให้ Git เป็นต้นฉบับ**: หลังบ้าน > ตั้งค่า > ดาวน์โหลดเนื้อหา (JSON) แล้วแยกไปทับ `src/data/` ได้ แล้ว commit
- **สถิติ**: ทุกการเข้าชมเก็บในตาราง `visits` (ไม่เก็บ IP) ดาวน์โหลด CSV ได้จากหน้าภาพรวม
- ⚠️ `npm run db:seed` จะ **เขียนทับ** เนื้อหาใน D1 ด้วยไฟล์ใน `src/data/` — ดาวน์โหลดสำรองก่อนทุกครั้งถ้าแอดมินเคยแก้ไว้

## ความปลอดภัย

- ห้ามใส่ API Token ของ Cloudflare ในหน้าเว็บ — เบราว์เซอร์เรียก D1 ตรงไม่ได้ ต้องผ่าน Functions ในโปรเจกต์นี้
- รหัสแอดมินตรวจฝั่งเซิร์ฟเวอร์ คุกกี้ HttpOnly + SameSite=Strict หมดอายุ 12 ชม. ล็อกชั่วคราวเมื่อกรอกผิด 5 ครั้งใน 10 นาที
- `gateCode` ของหน้าแรกเป็นเพียงด่านกั้นแบบง่าย (อยู่ในโค้ดฝั่งผู้ชม) ไม่ใช่การป้องกันข้อมูลจริง

-- Cloudflare D1 schema  (run: npm run db:schema)
CREATE TABLE IF NOT EXISTS content (
  key        TEXT PRIMARY KEY,            -- 'home' | 'sukhothai' | 'ayutthaya' | 'thonburi' | 'rattanakosin'
  json       TEXT NOT NULL,
  version    INTEGER NOT NULL DEFAULT 1,
  updated_at INTEGER NOT NULL,            -- epoch ms
  updated_by TEXT
);

CREATE TABLE IF NOT EXISTS content_history (
  id       INTEGER PRIMARY KEY AUTOINCREMENT,
  key      TEXT NOT NULL,
  json     TEXT NOT NULL,
  version  INTEGER,
  saved_at INTEGER NOT NULL,
  note     TEXT
);
CREATE INDEX IF NOT EXISTS idx_hist_key ON content_history(key, saved_at DESC);

-- one row per page view / event open. No IP address is stored.
CREATE TABLE IF NOT EXISTS visits (
  id       INTEGER PRIMARY KEY AUTOINCREMENT,
  ts       INTEGER NOT NULL,              -- epoch ms
  day      TEXT NOT NULL,                 -- YYYY-MM-DD (Asia/Bangkok)
  hour     INTEGER NOT NULL,              -- 0-23 (Asia/Bangkok)
  type     TEXT NOT NULL,                 -- 'visit' (session start) | 'view' (period page) | 'event' (opened an event)
  period   TEXT,
  event_id TEXT,
  sid      TEXT,                          -- random id kept in the visitor's browser
  country  TEXT,
  device   TEXT,                          -- mobile | tablet | desktop
  ref      TEXT                           -- referrer hostname
);
CREATE INDEX IF NOT EXISTS idx_visits_day  ON visits(day);
CREATE INDEX IF NOT EXISTS idx_visits_type ON visits(type, day);
CREATE INDEX IF NOT EXISTS idx_visits_evt  ON visits(event_id);

CREATE TABLE IF NOT EXISTS login_attempts (
  id      INTEGER PRIMARY KEY AUTOINCREMENT,
  ts      INTEGER NOT NULL,
  ip_hash TEXT NOT NULL,
  ok      INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_login_ip ON login_attempts(ip_hash, ts);

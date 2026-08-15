-- D1 Database Schema for Notes & Shares Storage (Optional D1 Backend)
-- Allows full migration from KV to D1 or hybrid dual-storage operation

CREATE TABLE IF NOT EXISTS notes (
    path TEXT PRIMARY KEY,
    content TEXT NOT NULL DEFAULT '',
    metadata TEXT NOT NULL DEFAULT '{}',
    created_at INTEGER NOT NULL DEFAULT (unixepoch()),
    updated_at INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE TABLE IF NOT EXISTS shares (
    share_id TEXT PRIMARY KEY,
    path TEXT NOT NULL,
    created_at INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE INDEX IF NOT EXISTS idx_notes_updated_at ON notes(updated_at);
CREATE INDEX IF NOT EXISTS idx_shares_path ON shares(path);

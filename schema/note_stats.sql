CREATE TABLE IF NOT EXISTS note_stats (
    path TEXT PRIMARY KEY,
    view_count INTEGER NOT NULL DEFAULT 0 CHECK (view_count >= 0),
    last_viewed_at INTEGER NOT NULL
);

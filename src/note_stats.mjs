export function getNoteStatsDb() {
    return globalThis?.APP_DB || globalThis?.NOTE_HISTORY_DB || null
}

export function shouldCountShareView({
    method,
    presentationMode,
    embedMode,
    acceptsMarkdown,
}) {
    return method === 'GET'
        && presentationMode !== true
        && embedMode !== true
        && acceptsMarkdown !== true
}

export async function getNoteViewCount(db, path) {
    if (!db || typeof path !== 'string' || !path) return null

    const row = await db.prepare(`
        SELECT view_count
        FROM note_stats
        WHERE path = ?
        LIMIT 1
    `).bind(path).first()
    const count = Number(row?.view_count ?? 0)

    return Number.isSafeInteger(count) && count >= 0 ? count : 0
}

export async function incrementNoteViewCount(db, path, nowSeconds = Math.floor(Date.now() / 1000)) {
    if (!db || typeof path !== 'string' || !path) return false

    await db.prepare(`
        INSERT INTO note_stats (path, view_count, last_viewed_at)
        VALUES (?, 1, ?)
        ON CONFLICT (path) DO UPDATE SET
            view_count = note_stats.view_count + 1,
            last_viewed_at = excluded.last_viewed_at
    `).bind(path, nowSeconds).run()

    return true
}

const DEFAULT_NOTE_HISTORY_LIMIT = 10
const DEFAULT_NOTE_HISTORY_MIN_INTERVAL_SECONDS = 300

function readRuntimeVar(name) {
    return globalThis?.[name]
}

function parseInteger(value, fallback) {
    const parsed = Number.parseInt(String(value ?? '').trim(), 10)
    return Number.isFinite(parsed) ? parsed : fallback
}

function parseNonNegativeInteger(value, fallback) {
    const parsed = parseInteger(value, fallback)
    return parsed >= 0 ? parsed : fallback
}

export function getNoteHistoryDb() {
    return readRuntimeVar('NOTE_HISTORY_DB') || null
}

export function getNoteHistoryLimit() {
    return parseNonNegativeInteger(readRuntimeVar('SCN_NOTE_HISTORY_LIMIT'), DEFAULT_NOTE_HISTORY_LIMIT)
}

export function getNoteHistoryMinIntervalSeconds() {
    return parseNonNegativeInteger(
        readRuntimeVar('SCN_NOTE_HISTORY_MIN_INTERVAL_SECONDS'),
        DEFAULT_NOTE_HISTORY_MIN_INTERVAL_SECONDS,
    )
}

export function isNoteHistoryConfigured() {
    return String(readRuntimeVar('SCN_ENABLE_NOTE_HISTORY') || '0').trim() === '1'
}

export function getNoteHistoryConfig() {
    const enabled = isNoteHistoryConfigured()
    return {
        enabled,
        limit: getNoteHistoryLimit(),
        minIntervalSeconds: getNoteHistoryMinIntervalSeconds(),
        db: enabled ? getNoteHistoryDb() : null,
    }
}

export function shouldSaveNoteHistory({
    enabled,
    limit,
    previousContent,
    nextContent,
    latestVersion = null,
    nowSeconds,
    minIntervalSeconds,
    force = false,
}) {
    if (!enabled || limit <= 0) return false

    const before = typeof previousContent === 'string' ? previousContent : String(previousContent || '')
    const after = typeof nextContent === 'string' ? nextContent : String(nextContent || '')

    if (before === after) return false
    if (!before && !latestVersion) return false

    if (latestVersion?.content === before) return false

    if (!force && latestVersion?.created_at) {
        const lastSavedAt = Number(latestVersion.created_at)
        if (Number.isFinite(lastSavedAt) && nowSeconds - lastSavedAt < minIntervalSeconds) {
            return false
        }
    }

    return true
}

async function getFirstResult(statement) {
    if (!statement) return null
    if (typeof statement.first === 'function') return await statement.first()
    const result = await statement.all()
    if (Array.isArray(result?.results)) return result.results[0] || null
    return null
}

async function getAllResults(statement) {
    if (!statement) return []
    const result = await statement.all()
    return Array.isArray(result?.results) ? result.results : []
}

export async function getLatestNoteHistoryVersion(db, path) {
    if (!db) return null
    return await getFirstResult(
        db.prepare(`
            SELECT id, path, content, created_at
            FROM note_history
            WHERE path = ?
            ORDER BY created_at DESC, id DESC
            LIMIT 1
        `).bind(path)
    )
}

export async function listNoteHistoryVersions(db, path, limit) {
    if (!db || limit <= 0) return []
    return await getAllResults(
        db.prepare(`
            SELECT id, path, content, created_at, length(content) AS content_length
            FROM note_history
            WHERE path = ?
            ORDER BY created_at DESC, id DESC
            LIMIT ?
        `).bind(path, limit)
    )
}

export async function getNoteHistoryCounts(db, paths = []) {
    if (!db || !Array.isArray(paths) || paths.length === 0) return new Map()

    const uniquePaths = [...new Set(paths.filter(path => typeof path === 'string' && path))]
    if (uniquePaths.length === 0) return new Map()

    const counts = new Map()
    // Keep each statement comfortably below SQLite/D1 bound-variable limits.
    for (let index = 0; index < uniquePaths.length; index += 100) {
        const chunk = uniquePaths.slice(index, index + 100)
        const placeholders = chunk.map(() => '?').join(', ')
        const result = await db.prepare(`
            SELECT path, COUNT(*) AS version_count
            FROM note_history
            WHERE path IN (${placeholders})
            GROUP BY path
        `).bind(...chunk).all()

        for (const row of result?.results || []) {
            counts.set(row.path, Number(row.version_count || 0))
        }
    }

    return counts
}

export async function getNoteHistoryVersionById(db, path, id) {
    if (!db) return null
    return await getFirstResult(
        db.prepare(`
            SELECT id, path, content, created_at
            FROM note_history
            WHERE path = ? AND id = ?
            LIMIT 1
        `).bind(path, id)
    )
}

export async function insertNoteHistoryVersion(db, { path, content, createdAt }) {
    if (!db) return null
    return await db.prepare(`
        INSERT INTO note_history (path, content, created_at)
        VALUES (?, ?, ?)
    `).bind(path, content, createdAt).run()
}

export async function pruneNoteHistoryVersions(db, path, limit) {
    if (!db) return null

    if (limit <= 0) {
        return await db.prepare(`
            DELETE FROM note_history
            WHERE path = ?
        `).bind(path).run()
    }

    return await db.prepare(`
        DELETE FROM note_history
        WHERE path = ?
          AND id NOT IN (
              SELECT id
              FROM note_history
              WHERE path = ?
              ORDER BY created_at DESC, id DESC
              LIMIT ?
          )
    `).bind(path, path, limit).run()
}

export async function deleteNoteHistoryVersions(db, path) {
    if (!db) return null
    return await db.prepare(`
        DELETE FROM note_history
        WHERE path = ?
    `).bind(path).run()
}

export async function saveNoteHistoryVersionIfNeeded({
    db,
    enabled,
    limit,
    minIntervalSeconds,
    path,
    previousContent,
    nextContent,
    nowSeconds = Math.floor(Date.now() / 1000),
    force = false,
}) {
    if (!db) return { saved: false, reason: 'db_unavailable' }

    const latestVersion = await getLatestNoteHistoryVersion(db, path)
    const shouldSave = shouldSaveNoteHistory({
        enabled,
        limit,
        previousContent,
        nextContent,
        latestVersion,
        nowSeconds,
        minIntervalSeconds,
        force,
    })

    if (!shouldSave) {
        return { saved: false, reason: 'skipped', latestVersion }
    }

    await insertNoteHistoryVersion(db, {
        path,
        content: typeof previousContent === 'string' ? previousContent : String(previousContent || ''),
        createdAt: nowSeconds,
    })
    await pruneNoteHistoryVersions(db, path, limit)

    return { saved: true, latestVersion }
}

export {
    DEFAULT_NOTE_HISTORY_LIMIT,
    DEFAULT_NOTE_HISTORY_MIN_INTERVAL_SECONDS,
}

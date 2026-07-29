export function getNoteStatsDb() {
    return globalThis?.APP_DB || globalThis?.NOTE_HISTORY_DB || null
}

const VIEW_DEVICE_ID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
const VIEW_DEVICE_HASH_PATTERN = /^[0-9a-f]{64}$/i

export function resolveViewDeviceId(cookieValue, createDeviceId = () => crypto.randomUUID()) {
    if (typeof cookieValue === 'string' && VIEW_DEVICE_ID_PATTERN.test(cookieValue)) {
        return {
            deviceId: cookieValue,
            isNew: false,
        }
    }

    const deviceId = createDeviceId()
    if (typeof deviceId !== 'string' || !VIEW_DEVICE_ID_PATTERN.test(deviceId)) {
        throw new Error('Unable to create a valid view device id')
    }

    return {
        deviceId,
        isNew: true,
    }
}

export async function hashViewDeviceId(deviceId) {
    if (typeof deviceId !== 'string' || !VIEW_DEVICE_ID_PATTERN.test(deviceId)) return null

    const digest = await crypto.subtle.digest(
        'SHA-256',
        new TextEncoder().encode(deviceId),
    )

    return [...new Uint8Array(digest)]
        .map(byte => byte.toString(16).padStart(2, '0'))
        .join('')
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

export async function recordUniqueNoteView(db, path, deviceHash, nowSeconds = Math.floor(Date.now() / 1000)) {
    if (
        !db
        || typeof db.batch !== 'function'
        || typeof path !== 'string'
        || !path
        || typeof deviceHash !== 'string'
        || !VIEW_DEVICE_HASH_PATTERN.test(deviceHash)
    ) {
        return {
            viewCount: null,
            isUnique: false,
        }
    }

    const results = await db.batch([
        db.prepare(`
            INSERT OR IGNORE INTO note_view_devices (path, device_hash, first_viewed_at)
            VALUES (?, ?, ?)
        `).bind(path, deviceHash, nowSeconds),
        db.prepare(`
            INSERT INTO note_stats (path, view_count, last_viewed_at)
            SELECT ?, 1, ?
            WHERE changes() = 1
            ON CONFLICT (path) DO UPDATE SET
                view_count = note_stats.view_count + 1,
                last_viewed_at = excluded.last_viewed_at
        `).bind(path, nowSeconds),
        db.prepare(`
            SELECT view_count
            FROM note_stats
            WHERE path = ?
            LIMIT 1
        `).bind(path),
    ])

    const insertionChanges = Number(results?.[0]?.meta?.changes ?? 0)
    const count = Number(results?.[2]?.results?.[0]?.view_count ?? 0)

    return {
        viewCount: Number.isSafeInteger(count) && count >= 0 ? count : 0,
        isUnique: insertionChanges === 1,
    }
}

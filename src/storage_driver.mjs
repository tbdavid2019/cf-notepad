/**
 * Pluggable Storage Driver for CF-Notepad (david888 wiki)
 * Supports:
 *  - 'kv': Cloudflare Workers KV (Default, zero D1 requirements)
 *  - 'd1': Cloudflare D1 Database (SQLite)
 *  - 'auto' / 'dual': Hybrid Migration Driver.
 *     Reads: Tries D1 first -> falls back to KV if not yet in D1.
 *     Writes: Writes to both D1 (if available) and KV to guarantee zero data loss.
 */

function readRuntimeVar(name) {
    return globalThis?.[name]
}

export function getStorageDriverName() {
    const driver = String(readRuntimeVar('SCN_STORAGE_DRIVER') || 'auto').trim().toLowerCase()
    if (['kv', 'd1', 'auto', 'dual'].includes(driver)) {
        return driver === 'dual' ? 'auto' : driver
    }
    return 'auto'
}

export function getStorageDb() {
    return readRuntimeVar('NOTES_DB') || readRuntimeVar('NOTE_HISTORY_DB') || readRuntimeVar('DB') || null
}

export function getNotesKv() {
    return readRuntimeVar('NOTES') || null
}

export function getShareKv() {
    return readRuntimeVar('SHARE') || null
}

/**
 * Query note content and metadata
 * @param {string} path - Note path
 * @returns {Promise<{ value: string, metadata: object }>}
 */
export async function driverQueryNote(path) {
    const driver = getStorageDriverName()
    const db = getStorageDb()
    const kv = getNotesKv()

    // Try D1 if driver is 'd1' or 'auto'
    if ((driver === 'd1' || driver === 'auto') && db) {
        try {
            const row = await db.prepare('SELECT content, metadata FROM notes WHERE path = ?').bind(path).first()
            if (row) {
                let parsedMeta = {}
                try {
                    parsedMeta = typeof row.metadata === 'string' ? JSON.parse(row.metadata) : (row.metadata || {})
                } catch {
                    parsedMeta = {}
                }
                return {
                    value: row.content || '',
                    metadata: parsedMeta,
                }
            }
        } catch (err) {
            // If table doesn't exist yet or DB error in auto mode, proceed to fallback
            if (driver === 'd1') {
                console.error('D1 Query Error:', err)
            }
        }
    }

    // Fallback to KV if driver is 'kv' or 'auto'
    if (kv) {
        const result = await kv.getWithMetadata(path)
        return {
            value: result?.value || '',
            metadata: result?.metadata || {},
        }
    }

    return { value: '', metadata: {} }
}

/**
 * Write note content and metadata
 * @param {string} path - Note path
 * @param {string} content - Markdown or block note content
 * @param {object} metadata - Note metadata
 */
export async function driverPutNote(path, content = '', metadata = {}) {
    const driver = getStorageDriverName()
    const db = getStorageDb()
    const kv = getNotesKv()

    const metaString = JSON.stringify(metadata || {})

    // Write to D1 if driver is 'd1' or 'auto'
    if ((driver === 'd1' || driver === 'auto') && db) {
        try {
            await db.prepare(`
                INSERT INTO notes (path, content, metadata, updated_at)
                VALUES (?, ?, ?, unixepoch())
                ON CONFLICT(path) DO UPDATE SET
                    content = excluded.content,
                    metadata = excluded.metadata,
                    updated_at = unixepoch()
            `).bind(path, content, metaString).run()
        } catch (err) {
            if (driver === 'd1') {
                console.error('D1 Put Note Error:', err)
                throw err
            }
        }
    }

    // Write to KV if driver is 'kv' or 'auto'
    if (kv) {
        await kv.put(path, content, { metadata })
    }
}

/**
 * Delete a note from storage
 * @param {string} path - Note path
 */
export async function driverDeleteNote(path) {
    const db = getStorageDb()
    const kv = getNotesKv()

    if (db) {
        try {
            await db.prepare('DELETE FROM notes WHERE path = ?').bind(path).run()
        } catch (err) {
            console.warn('D1 Delete Note Error:', err)
        }
    }

    if (kv) {
        await kv.delete(path)
    }
}

/**
 * Query a share mapping (shareId -> path)
 * @param {string} shareId - Share ID or slug
 * @returns {Promise<string|null>} Target note path
 */
export async function driverQueryShare(shareId) {
    const driver = getStorageDriverName()
    const db = getStorageDb()
    const kv = getShareKv()

    if ((driver === 'd1' || driver === 'auto') && db) {
        try {
            const row = await db.prepare('SELECT path FROM shares WHERE share_id = ?').bind(shareId).first()
            if (row && row.path) return row.path
        } catch (err) {
            if (driver === 'd1') console.error('D1 Query Share Error:', err)
        }
    }

    if (kv) {
        return await kv.get(shareId)
    }

    return null
}

/**
 * Put a share mapping (shareId -> path)
 * @param {string} shareId - Share ID
 * @param {string} path - Target note path
 */
export async function driverPutShare(shareId, path) {
    const driver = getStorageDriverName()
    const db = getStorageDb()
    const kv = getShareKv()

    if ((driver === 'd1' || driver === 'auto') && db) {
        try {
            await db.prepare(`
                INSERT INTO shares (share_id, path)
                VALUES (?, ?)
                ON CONFLICT(share_id) DO UPDATE SET path = excluded.path
            `).bind(shareId, path).run()
        } catch (err) {
            if (driver === 'd1') {
                console.error('D1 Put Share Error:', err)
                throw err
            }
        }
    }

    if (kv) {
        await kv.put(shareId, path)
    }
}

/**
 * Delete a share mapping
 * @param {string} shareId - Share ID
 */
export async function driverDeleteShare(shareId) {
    const db = getStorageDb()
    const kv = getShareKv()

    if (db) {
        try {
            await db.prepare('DELETE FROM shares WHERE share_id = ?').bind(shareId).run()
        } catch (err) {
            console.warn('D1 Delete Share Error:', err)
        }
    }

    if (kv) {
        await kv.delete(shareId)
    }
}

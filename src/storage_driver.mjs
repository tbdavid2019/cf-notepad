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
async function md5Hex(str) {
    const input = String(str || '')
    try {
        if (typeof crypto !== 'undefined' && crypto.subtle) {
            const msgUint8 = new TextEncoder().encode(input)
            const hashBuffer = await crypto.subtle.digest('MD5', msgUint8)
            const hashArray = Array.from(new Uint8Array(hashBuffer))
            return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
        }
    } catch (_) {}
    try {
        const mod = 'node:' + 'crypto'
        const nodeCrypto = await import(/* webpackIgnore: true */ mod)
        return nodeCrypto.createHash('md5').update(input).digest('hex')
    } catch (_) {}
    return ''
}

export async function driverQueryShare(shareId) {
    const driver = getStorageDriverName()
    const db = getStorageDb()
    const kv = getShareKv()

    if ((driver === 'd1' || driver === 'auto') && db) {
        try {
            const row = await db.prepare('SELECT path FROM shares WHERE share_id = ?').bind(shareId).first()
            if (row && row.path) return row.path

            // Fallback for D1: check if share_id matches shareSlug, shareId, or note path with share=1
            const noteRow = await db.prepare(`
                SELECT path FROM notes 
                WHERE (
                    json_extract(metadata, '$.shareSlug') = ? 
                    OR json_extract(metadata, '$.shareId') = ?
                    OR path = ?
                )
                AND (json_extract(metadata, '$.share') = 1 OR json_extract(metadata, '$.share') = true)
                LIMIT 1
            `).bind(shareId, shareId, shareId).first()
            if (noteRow && noteRow.path) {
                // Self-heal the share mapping in shares table
                db.prepare(`
                    INSERT INTO shares (share_id, path)
                    VALUES (?, ?)
                    ON CONFLICT(share_id) DO UPDATE SET path = excluded.path
                `).bind(shareId, noteRow.path).run().catch(() => {})
                return noteRow.path
            }

            // Fallback for D1: if shareId is a 32-char hex string, check if it matches MD5(path)
            if (/^[a-f0-9]{32}$/i.test(shareId)) {
                const candidates = await db.prepare(`
                    SELECT path FROM notes 
                    WHERE (json_extract(metadata, '$.share') = 1 OR json_extract(metadata, '$.share') = true)
                `).all()
                if (candidates && candidates.results) {
                    for (const candidate of candidates.results) {
                        const hash = await md5Hex(candidate.path)
                        if (hash.toLowerCase() === shareId.toLowerCase()) {
                            db.prepare(`
                                INSERT INTO shares (share_id, path)
                                VALUES (?, ?)
                                ON CONFLICT(share_id) DO UPDATE SET path = excluded.path
                            `).bind(shareId, candidate.path).run().catch(() => {})
                            return candidate.path
                        }
                    }
                }
            }
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
export async function driverPutShare(shareId, path, options = {}) {
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
        const kvOptions = {}
        const now = Math.floor(Date.now() / 1000)
        if (options?.expiration && Number(options.expiration) > now + 60) {
            kvOptions.expiration = Number(options.expiration)
        } else if (options?.expirationTtl && Number(options.expirationTtl) >= 60) {
            kvOptions.expirationTtl = Number(options.expirationTtl)
        }
        await kv.put(shareId, path, kvOptions)
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

/**
 * Record share status (e.g. burned, expired) in tombstone cache
 * @param {string} shareId
 * @param {'burned' | 'expired' | 'unshared'} status
 * @param {object} details
 */
export async function driverSetShareStatus(shareId, status, details = {}) {
    if (!shareId) return
    const kv = getShareKv()
    if (!kv) return
    if (!status) {
        try {
            await kv.delete(`SHARE_STATUS:${shareId}`)
        } catch (err) {
            console.warn('KV Delete Share Status Error:', err)
        }
        return
    }
    try {
        await kv.put(`SHARE_STATUS:${shareId}`, JSON.stringify({
            status,
            ...details,
            updatedAt: Math.floor(Date.now() / 1000),
        }), { expirationTtl: 7 * 86400 })
    } catch (err) {
        console.warn('KV Set Share Status Error:', err)
    }
}

/**
 * Retrieve recorded share status from tombstone cache
 * @param {string} shareId
 */
export async function driverGetShareStatus(shareId) {
    if (!shareId) return null
    const kv = getShareKv()
    if (kv) {
        try {
            const raw = await kv.get(`SHARE_STATUS:${shareId}`)
            if (raw) return JSON.parse(raw)
        } catch {}
    }
    return null
}

/**
 * Find note metadata and content by shareSlug, shareId, or path in D1
 * @param {string} shareId
 */
export async function driverFindNoteByShareId(shareId) {
    const db = getStorageDb()
    if (!db || !shareId) return null
    try {
        const row = await db.prepare(`
            SELECT path, metadata, content FROM notes
            WHERE (
                json_extract(metadata, '$.shareSlug') = ?
                OR json_extract(metadata, '$.shareId') = ?
                OR path = ?
            )
            LIMIT 1
        `).bind(shareId, shareId, shareId).first()
        if (row) {
            let metadata = {}
            try {
                metadata = typeof row.metadata === 'string' ? JSON.parse(row.metadata) : (row.metadata || {})
            } catch {}
            return { path: row.path, metadata, value: row.content || '' }
        }
    } catch (err) {
        console.warn('driverFindNoteByShareId error:', err)
    }
    return null
}

const IN_FLIGHT_CLAIMS = new Map()

/**
 * Atomically claim a burn-after-reading note to prevent concurrent double-read
 * @param {string} shareId
 * @param {string} path
 * @param {number} now
 * @returns {Promise<boolean>} true if successfully claimed, false if already burned
 */
export async function driverClaimBurnShare(shareId, path, now = Math.floor(Date.now() / 1000)) {
    if (!shareId || !path) return false
    const db = getStorageDb()
    const kv = getShareKv()
    const notesKv = getNotesKv()

    // Fast-path in-memory lock on current isolate to block concurrent promises
    if (IN_FLIGHT_CLAIMS.has(shareId)) {
        return false
    }
    IN_FLIGHT_CLAIMS.set(shareId, now)
    // Clean up memory lock after 10 seconds
    setTimeout(() => IN_FLIGHT_CLAIMS.delete(shareId), 10000)

    // 1. Check KV tombstone first
    const tombstone = await driverGetShareStatus(shareId)
    if (tombstone?.status === 'burned') {
        return false
    }

    // 2. If D1 is available, atomic check-and-set via UPDATE
    if (db) {
        try {
            const res = await db.prepare(`
                UPDATE notes
                SET metadata = json_set(metadata, '$.share', 0, '$.shareBurnedAt', ?)
                WHERE path = ?
                  AND (
                      json_extract(metadata, '$.share') = 1
                      OR json_extract(metadata, '$.share') = true
                  )
                  AND json_extract(metadata, '$.shareBurnedAt') IS NULL
            `).bind(now, path).run()
            if (res && typeof res.meta?.changes === 'number' && res.meta.changes === 0) {
                return false
            }
        } catch (err) {
            console.warn('D1 Claim Burn Share Error:', err)
        }
    }

    // 3. In KV-only mode (or parallel KV storage), perform two-phase claim check with unique nonce
    if (kv) {
        try {
            const claimKey = `SHARE_CLAIM:${shareId}`
            const claimNonce = `${now}-${Math.random().toString(36).slice(2)}`
            await kv.put(claimKey, claimNonce, { expirationTtl: 300 })
            const registeredNonce = await kv.get(claimKey)
            if (registeredNonce && registeredNonce !== claimNonce) {
                return false
            }
        } catch (err) {
            console.warn('KV Claim Nonce Error:', err)
        }
    }

    // 4. Mark tombstone in SHARE kv immediately
    await driverSetShareStatus(shareId, 'burned', { burnedAt: now, path })

    // 5. Update KV note metadata as well
    if (notesKv) {
        try {
            const current = await notesKv.getWithMetadata(path)
            if (current?.metadata) {
                const nextMeta = { ...current.metadata, share: false, shareBurnedAt: now }
                await notesKv.put(path, current.value || '', { metadata: nextMeta })
            }
        } catch {}
    }

    return true
}

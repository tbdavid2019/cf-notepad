const DEFAULT_ANNOTATION_PAGE_SIZE = 20
const MAX_ANNOTATION_PAGE_SIZE = 25
const MAX_ANNOTATION_MESSAGES_PER_THREAD = 50

export function getAnnotationDb() {
    return globalThis?.APP_DB || globalThis?.NOTE_HISTORY_DB || null
}

export async function computeSourceRevision(content) {
    const bytes = new TextEncoder().encode(typeof content === 'string' ? content : String(content || ''))
    const digest = await crypto.subtle.digest('SHA-256', bytes)
    return Array.from(new Uint8Array(digest), byte => byte.toString(16).padStart(2, '0')).join('')
}

export function encodeAnnotationCursor({ updatedAt, id }) {
    if (!Number.isSafeInteger(updatedAt) || updatedAt < 0 || typeof id !== 'string' || !id) return null
    return btoa(`${updatedAt}:${id}`)
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/g, '')
}

export function decodeAnnotationCursor(value) {
    if (typeof value !== 'string' || !/^[A-Za-z0-9_-]{1,180}$/.test(value)) return null

    try {
        const padded = value.replace(/-/g, '+').replace(/_/g, '/').padEnd(Math.ceil(value.length / 4) * 4, '=')
        const decoded = atob(padded)
        const separator = decoded.indexOf(':')
        if (separator <= 0) return null

        const updatedAt = Number(decoded.slice(0, separator))
        const id = decoded.slice(separator + 1)
        if (!Number.isSafeInteger(updatedAt) || updatedAt < 0 || !/^[A-Za-z0-9_-]{1,80}$/.test(id)) return null

        return { updatedAt, id }
    } catch {
        return null
    }
}

function getResults(result) {
    return Array.isArray(result?.results) ? result.results : []
}

function normalizeLimit(value) {
    const parsed = Number.parseInt(String(value ?? ''), 10)
    if (!Number.isFinite(parsed) || parsed <= 0) return DEFAULT_ANNOTATION_PAGE_SIZE
    return Math.min(parsed, MAX_ANNOTATION_PAGE_SIZE)
}

function presentMessage(row) {
    return {
        id: row.id,
        authorName: row.author_name,
        body: row.body,
        createdAt: Number(row.created_at || 0),
    }
}

function presentThread(row, messages, messageCount) {
    return {
        id: row.id,
        anchor: {
            exact: row.quote_exact,
            prefix: row.quote_prefix,
            suffix: row.quote_suffix,
            startOffset: Number(row.start_offset),
            endOffset: Number(row.end_offset),
            sourceRevision: row.source_revision,
        },
        isResolved: row.is_resolved === 1,
        createdAt: Number(row.created_at || 0),
        updatedAt: Number(row.updated_at || 0),
        messageCount,
        hasMoreMessages: messageCount > messages.length,
        messages,
    }
}

export async function listAnnotationThreads(db, path, { cursor = null, limit } = {}) {
    if (!db || typeof path !== 'string' || !path) {
        return { threads: [], nextCursor: null }
    }

    const pageSize = normalizeLimit(limit)
    const decodedCursor = cursor ? decodeAnnotationCursor(cursor) : null
    if (cursor && !decodedCursor) throw new Error('Invalid annotation cursor')

    const cursorClause = decodedCursor
        ? 'AND (updated_at < ? OR (updated_at = ? AND id < ?))'
        : ''
    const threadStatement = db.prepare(`
        SELECT
            id,
            quote_exact,
            quote_prefix,
            quote_suffix,
            start_offset,
            end_offset,
            source_revision,
            is_resolved,
            created_at,
            updated_at
        FROM annotation_threads
        WHERE path = ?
        ${cursorClause}
        ORDER BY updated_at DESC, id DESC
        LIMIT ?
    `)
    const threadBindings = decodedCursor
        ? [path, decodedCursor.updatedAt, decodedCursor.updatedAt, decodedCursor.id, pageSize + 1]
        : [path, pageSize + 1]
    const threadRows = getResults(await threadStatement.bind(...threadBindings).all())
    const pageRows = threadRows.slice(0, pageSize)

    if (pageRows.length === 0) {
        return { threads: [], nextCursor: null }
    }

    const placeholders = pageRows.map(() => '?').join(', ')
    const messageRows = getResults(await db.prepare(`
        SELECT id, thread_id, author_name, body, created_at, total_count
        FROM (
            SELECT
                id,
                thread_id,
                author_name,
                body,
                created_at,
                ROW_NUMBER() OVER (
                    PARTITION BY thread_id
                    ORDER BY created_at ASC, id ASC
                ) AS message_rank,
                COUNT(*) OVER (PARTITION BY thread_id) AS total_count
            FROM annotation_messages
            WHERE thread_id IN (${placeholders})
              AND deleted_at IS NULL
        )
        WHERE message_rank <= ${MAX_ANNOTATION_MESSAGES_PER_THREAD}
        ORDER BY thread_id ASC, created_at ASC, id ASC
    `).bind(...pageRows.map(row => row.id)).all())
    const messagesByThread = new Map(pageRows.map(row => [row.id, []]))
    const messageCountsByThread = new Map(pageRows.map(row => [row.id, 0]))

    for (const message of messageRows) {
        messagesByThread.get(message.thread_id)?.push(presentMessage(message))
        messageCountsByThread.set(message.thread_id, Number(message.total_count || 0))
    }

    const hasMore = threadRows.length > pageSize
    const lastRow = pageRows[pageRows.length - 1]

    return {
        threads: pageRows.map(row => {
            const messages = messagesByThread.get(row.id) || []
            const messageCount = messageCountsByThread.get(row.id) || messages.length
            return presentThread(row, messages, messageCount)
        }),
        nextCursor: hasMore
            ? encodeAnnotationCursor({ updatedAt: Number(lastRow.updated_at || 0), id: lastRow.id })
            : null,
    }
}

export {
    DEFAULT_ANNOTATION_PAGE_SIZE,
    MAX_ANNOTATION_MESSAGES_PER_THREAD,
    MAX_ANNOTATION_PAGE_SIZE,
}

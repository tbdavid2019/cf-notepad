import test from 'node:test'
import assert from 'node:assert/strict'

import {
    hashViewDeviceId,
    getNoteStatsDb,
    getNoteViewCount,
    recordUniqueNoteView,
    resolveViewDeviceId,
    shouldCountShareView,
} from '../src/note_stats.mjs'

test('note stats uses APP_DB and falls back to the existing history database binding', () => {
    const previousAppDb = globalThis.APP_DB
    const previousHistoryDb = globalThis.NOTE_HISTORY_DB
    const appDb = { name: 'app' }
    const historyDb = { name: 'history' }

    try {
        globalThis.APP_DB = appDb
        globalThis.NOTE_HISTORY_DB = historyDb
        assert.equal(getNoteStatsDb(), appDb)

        delete globalThis.APP_DB
        assert.equal(getNoteStatsDb(), historyDb)
    } finally {
        if (previousAppDb === undefined) delete globalThis.APP_DB
        else globalThis.APP_DB = previousAppDb
        if (previousHistoryDb === undefined) delete globalThis.NOTE_HISTORY_DB
        else globalThis.NOTE_HISTORY_DB = previousHistoryDb
    }
})

test('only normal HTML GET share pages count as views', () => {
    assert.equal(shouldCountShareView({
        method: 'GET',
        presentationMode: false,
        embedMode: false,
        acceptsMarkdown: false,
    }), true)

    for (const excluded of [
        { method: 'HEAD', presentationMode: false, embedMode: false, acceptsMarkdown: false },
        { method: 'GET', presentationMode: true, embedMode: false, acceptsMarkdown: false },
        { method: 'GET', presentationMode: false, embedMode: true, acceptsMarkdown: false },
        { method: 'GET', presentationMode: false, embedMode: false, acceptsMarkdown: true },
    ]) {
        assert.equal(shouldCountShareView(excluded), false)
    }
})

test('getNoteViewCount returns a safe non-negative integer', async () => {
    const db = {
        prepare() {
            return {
                bind(path) {
                    assert.equal(path, 'article-one')
                    return {
                        async first() {
                            return { view_count: 12 }
                        },
                    }
                },
            }
        },
    }

    assert.equal(await getNoteViewCount(db, 'article-one'), 12)
    assert.equal(await getNoteViewCount(null, 'article-one'), null)
})

test('resolveViewDeviceId reuses a valid device id and replaces invalid input', () => {
    const existing = '20fb5a34-2f56-43f2-8d3f-c3dd2cd8fbbb'

    assert.deepEqual(resolveViewDeviceId(existing), {
        deviceId: existing,
        isNew: false,
    })
    assert.deepEqual(resolveViewDeviceId('not-a-device-id', () => '54ced3ea-f824-4918-b8dd-2819934bf769'), {
        deviceId: '54ced3ea-f824-4918-b8dd-2819934bf769',
        isNew: true,
    })
})

test('hashViewDeviceId creates a stable anonymous SHA-256 identifier', async () => {
    assert.equal(
        await hashViewDeviceId('20fb5a34-2f56-43f2-8d3f-c3dd2cd8fbbb'),
        'ad408530c9c3273db2a5658e1a241df1c2891b382c297d7a079f49d408f61ecd',
    )
})

test('recordUniqueNoteView increments only when the path and device pair is new', async () => {
    const calls = []
    const db = {
        prepare(sql) {
            const call = { sql }
            calls.push(call)
            return {
                bind(...values) {
                    call.values = values
                    return call
                },
            }
        },
        async batch(statements) {
            assert.equal(statements.length, 3)
            return [
                { success: true, meta: { changes: 1 }, results: [] },
                { success: true, meta: { changes: 1 }, results: [] },
                { success: true, meta: { changes: 0 }, results: [{ view_count: 13 }] },
            ]
        },
    }

    const result = await recordUniqueNoteView(
        db,
        'article-one',
        'ad408530c9c3273db2a5658e1a241df1c2891b382c297d7a079f49d408f61ecd',
        123456,
    )

    assert.deepEqual(result, { viewCount: 13, isUnique: true })
    assert.match(calls[0].sql, /INSERT OR IGNORE INTO note_view_devices/i)
    assert.deepEqual(calls[0].values, [
        'article-one',
        'ad408530c9c3273db2a5658e1a241df1c2891b382c297d7a079f49d408f61ecd',
        123456,
    ])
    assert.match(calls[1].sql, /WHERE changes\(\) = 1/i)
    assert.match(calls[1].sql, /view_count\s*=\s*note_stats\.view_count\s*\+\s*1/i)
    assert.deepEqual(calls[1].values, ['article-one', 123456])
    assert.match(calls[2].sql, /SELECT view_count/i)
    assert.deepEqual(calls[2].values, ['article-one'])
})

test('recordUniqueNoteView reports an unchanged total for a repeated device', async () => {
    const db = {
        prepare(sql) {
            return {
                bind(...values) {
                    return { sql, values }
                },
            }
        },
        async batch() {
            return [
                { success: true, meta: { changes: 0 }, results: [] },
                { success: true, meta: { changes: 0 }, results: [] },
                { success: true, meta: { changes: 0 }, results: [{ view_count: 13 }] },
            ]
        },
    }

    assert.deepEqual(
        await recordUniqueNoteView(
            db,
            'article-one',
            'ad408530c9c3273db2a5658e1a241df1c2891b382c297d7a079f49d408f61ecd',
            123457,
        ),
        { viewCount: 13, isUnique: false },
    )
})

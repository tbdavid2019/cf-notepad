import test from 'node:test'
import assert from 'node:assert/strict'

import {
    getNoteStatsDb,
    getNoteViewCount,
    incrementNoteViewCount,
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

test('incrementNoteViewCount performs a parameterized atomic upsert', async () => {
    const calls = []
    const db = {
        prepare(sql) {
            calls.push({ sql })
            return {
                bind(...values) {
                    calls[0].values = values
                    return {
                        async run() {
                            return { success: true }
                        },
                    }
                },
            }
        },
    }

    await incrementNoteViewCount(db, 'article-one', 123456)

    assert.match(calls[0].sql, /ON CONFLICT\s*\(path\)\s*DO UPDATE/i)
    assert.match(calls[0].sql, /view_count\s*=\s*note_stats\.view_count\s*\+\s*1/i)
    assert.deepEqual(calls[0].values, ['article-one', 123456])
})

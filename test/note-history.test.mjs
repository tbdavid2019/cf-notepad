import test from 'node:test'
import assert from 'node:assert/strict'

import {
    DEFAULT_NOTE_HISTORY_LIMIT,
    DEFAULT_NOTE_HISTORY_MIN_INTERVAL_SECONDS,
    getNoteHistoryConfig,
    getNoteHistoryLimit,
    getNoteHistoryMinIntervalSeconds,
    isNoteHistoryConfigured,
    shouldSaveNoteHistory,
} from '../src/note_history.mjs'

const RUNTIME_KEYS = [
    'SCN_ENABLE_NOTE_HISTORY',
    'SCN_NOTE_HISTORY_LIMIT',
    'SCN_NOTE_HISTORY_MIN_INTERVAL_SECONDS',
    'NOTE_HISTORY_DB',
]

function withRuntimeVars(vars, run) {
    const previous = new Map(RUNTIME_KEYS.map(key => [key, globalThis[key]]))

    for (const key of RUNTIME_KEYS) {
        if (Object.prototype.hasOwnProperty.call(vars, key)) {
            globalThis[key] = vars[key]
        } else {
            delete globalThis[key]
        }
    }

    try {
        return run()
    } finally {
        for (const [key, value] of previous.entries()) {
            if (value === undefined) {
                delete globalThis[key]
            } else {
                globalThis[key] = value
            }
        }
    }
}

test('note history config defaults to disabled with 10 retained versions', () => {
    withRuntimeVars({}, () => {
        assert.equal(isNoteHistoryConfigured(), false)
        assert.equal(getNoteHistoryLimit(), DEFAULT_NOTE_HISTORY_LIMIT)
        assert.equal(getNoteHistoryMinIntervalSeconds(), DEFAULT_NOTE_HISTORY_MIN_INTERVAL_SECONDS)

        assert.deepEqual(getNoteHistoryConfig(), {
            enabled: false,
            limit: DEFAULT_NOTE_HISTORY_LIMIT,
            minIntervalSeconds: DEFAULT_NOTE_HISTORY_MIN_INTERVAL_SECONDS,
            db: null,
        })
    })
})

test('note history config reads explicit runtime vars', () => {
    const fakeDb = { binding: 'ok' }

    withRuntimeVars({
        SCN_ENABLE_NOTE_HISTORY: '1',
        SCN_NOTE_HISTORY_LIMIT: '7',
        SCN_NOTE_HISTORY_MIN_INTERVAL_SECONDS: '120',
        NOTE_HISTORY_DB: fakeDb,
    }, () => {
        assert.equal(isNoteHistoryConfigured(), true)
        assert.equal(getNoteHistoryLimit(), 7)
        assert.equal(getNoteHistoryMinIntervalSeconds(), 120)
        assert.equal(getNoteHistoryConfig().db, fakeDb)
    })
})

test('shouldSaveNoteHistory skips unchanged or empty initial content', () => {
    assert.equal(shouldSaveNoteHistory({
        enabled: true,
        limit: 10,
        previousContent: '',
        nextContent: 'new',
        latestVersion: null,
        nowSeconds: 100,
        minIntervalSeconds: 300,
    }), false)

    assert.equal(shouldSaveNoteHistory({
        enabled: true,
        limit: 10,
        previousContent: 'same',
        nextContent: 'same',
        latestVersion: null,
        nowSeconds: 100,
        minIntervalSeconds: 300,
    }), false)
})

test('shouldSaveNoteHistory enforces dedupe and min interval unless forced', () => {
    const latestVersion = { content: 'before', created_at: 100 }

    assert.equal(shouldSaveNoteHistory({
        enabled: true,
        limit: 10,
        previousContent: 'before',
        nextContent: 'after',
        latestVersion,
        nowSeconds: 500,
        minIntervalSeconds: 300,
    }), false)

    assert.equal(shouldSaveNoteHistory({
        enabled: true,
        limit: 10,
        previousContent: 'older',
        nextContent: 'after',
        latestVersion: { content: 'different', created_at: 490 },
        nowSeconds: 500,
        minIntervalSeconds: 30,
    }), false)

    assert.equal(shouldSaveNoteHistory({
        enabled: true,
        limit: 10,
        previousContent: 'older',
        nextContent: 'after',
        latestVersion: { content: 'different', created_at: 490 },
        nowSeconds: 500,
        minIntervalSeconds: 30,
        force: true,
    }), true)
})

test('shouldSaveNoteHistory saves eligible prior versions', () => {
    assert.equal(shouldSaveNoteHistory({
        enabled: true,
        limit: 10,
        previousContent: 'draft v1',
        nextContent: 'draft v2',
        latestVersion: { content: 'older', created_at: 10 },
        nowSeconds: 400,
        minIntervalSeconds: 300,
    }), true)
})

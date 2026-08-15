import test from 'node:test'
import assert from 'node:assert/strict'
import {
    getStorageDriverName,
    driverQueryNote,
    driverPutNote,
    driverDeleteNote,
    driverQueryShare,
    driverPutShare,
    driverDeleteShare,
} from '../src/storage_driver.mjs'

test('storage driver defaults to auto mode', () => {
    delete globalThis.SCN_STORAGE_DRIVER
    assert.equal(getStorageDriverName(), 'auto')
})

test('storage driver honors SCN_STORAGE_DRIVER configuration', () => {
    globalThis.SCN_STORAGE_DRIVER = 'kv'
    assert.equal(getStorageDriverName(), 'kv')
    globalThis.SCN_STORAGE_DRIVER = 'd1'
    assert.equal(getStorageDriverName(), 'd1')
    globalThis.SCN_STORAGE_DRIVER = 'dual'
    assert.equal(getStorageDriverName(), 'auto')
    delete globalThis.SCN_STORAGE_DRIVER
})

test('storage driver query and put note with KV backend', async () => {
    const kvStore = new Map()
    globalThis.SCN_STORAGE_DRIVER = 'kv'
    globalThis.NOTES = {
        getWithMetadata: async (key) => kvStore.get(key) || { value: null, metadata: null },
        put: async (key, value, { metadata }) => kvStore.set(key, { value, metadata }),
        delete: async (key) => kvStore.delete(key),
    }

    await driverPutNote('test-note-1', '# Hello KV', { share: true })
    const result = await driverQueryNote('test-note-1')
    assert.equal(result.value, '# Hello KV')
    assert.equal(result.metadata.share, true)

    await driverDeleteNote('test-note-1')
    const deletedResult = await driverQueryNote('test-note-1')
    assert.equal(deletedResult.value, '')

    delete globalThis.NOTES
    delete globalThis.SCN_STORAGE_DRIVER
})

test('storage driver query and put note with D1 backend and fallback in auto mode', async () => {
    const d1Notes = new Map()
    const kvNotes = new Map()

    globalThis.SCN_STORAGE_DRIVER = 'auto'
    globalThis.NOTES = {
        getWithMetadata: async (key) => kvNotes.get(key) || { value: null, metadata: null },
        put: async (key, value, { metadata }) => kvNotes.set(key, { value, metadata }),
        delete: async (key) => kvNotes.delete(key),
    }
    globalThis.NOTES_DB = {
        prepare: (sql) => {
            return {
                bind: (...args) => ({
                    first: async () => {
                        if (sql.includes('SELECT content, metadata FROM notes')) {
                            const note = d1Notes.get(args[0])
                            return note ? { content: note.content, metadata: JSON.stringify(note.metadata) } : null
                        }
                        return null
                    },
                    run: async () => {
                        if (sql.includes('INSERT INTO notes')) {
                            const [path, content, metadata] = args
                            d1Notes.set(path, { content, metadata: JSON.parse(metadata) })
                        }
                        if (sql.includes('DELETE FROM notes')) {
                            d1Notes.delete(args[0])
                        }
                        return { success: true }
                    },
                })
            }
        }
    }

    // 1. Existing note in KV should be read via fallback
    kvNotes.set('legacy-kv-note', { value: '# Legacy Note', metadata: { share: true } })
    const fallbackResult = await driverQueryNote('legacy-kv-note')
    assert.equal(fallbackResult.value, '# Legacy Note')
    assert.equal(fallbackResult.metadata.share, true)

    // 2. Writing note in auto mode writes to D1 and updates KV
    await driverPutNote('new-auto-note', '# Dual Note', { theme: 'serif' })
    const d1Result = await driverQueryNote('new-auto-note')
    assert.equal(d1Result.value, '# Dual Note')
    assert.equal(d1Result.metadata.theme, 'serif')
    assert.ok(kvNotes.has('new-auto-note'))

    delete globalThis.NOTES
    delete globalThis.NOTES_DB
    delete globalThis.SCN_STORAGE_DRIVER
})

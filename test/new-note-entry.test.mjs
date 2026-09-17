import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

import {
    formatNewNoteTitle,
    isNewNoteEntry,
} from '../src/note_meta.js'

import worker from '../src/index.js'

const indexSource = readFileSync(new URL('../src/index.js', import.meta.url), 'utf8')
const constantsSource = readFileSync(new URL('../src/constant.js', import.meta.url), 'utf8')

test('only an empty unpersisted path carrying the homepage marker is a new-note entry', () => {
    assert.equal(isNewNoteEntry('https://wiki.david888.com/abcd?new=1', '', {}), true)
    assert.equal(isNewNoteEntry('https://wiki.david888.com/abcd', '', {}), false)
    assert.equal(isNewNoteEntry('https://wiki.david888.com/abcd?new=1', '# Existing', {}), false)
    assert.equal(isNewNoteEntry('https://wiki.david888.com/abcd?new=1', '', { theme: 'retro' }), false)
})

test('a pre-created note can retain the new-note marker when it only has immutable format metadata', () => {
    assert.equal(isNewNoteEntry(
        'https://wiki.david888.com/abcd?new=1',
        '',
        { editorFormat: 'block', blockDocumentVersion: 2 },
    ), true)
})

test('new-note tab title randomly chooses one of the wiki opening prompts', () => {
    assert.equal(formatNewNoteTitle('zh-TW', () => 0), '序章 / 一切故事的開始')
    assert.equal(formatNewNoteTitle('zh-TW', () => 0.4), '天工開物 / 建立你的個人知識宇宙')
    assert.equal(formatNewNoteTitle('zh-TW', () => 0.999999), '見微知著 / 這裡慢慢萌芽長大')

    assert.equal(formatNewNoteTitle('en-US', () => 0), 'Prologue / Where Every Story Begins')
    assert.equal(formatNewNoteTitle('en-US', () => 0.4), 'The Art of Creation / Build Your Personal Knowledge Universe')
    assert.equal(formatNewNoteTitle('en-US', () => 0.999999), 'From Small Signs / Let Your Ideas Take Root and Grow')
})

test('the Traditional Chinese empty editor has no first-visitor prompt', () => {
    assert.doesNotMatch(constantsSource, /看來你是第一個到這裡的人/)
})

test('homepage marks its generated path and note rendering consumes that marker', () => {
    assert.match(indexSource, /nextUrl\.searchParams\.set\('new', '1'\)/)
    assert.match(indexSource, /isNewNoteEntry\(request\.url, value, metadata\)/)
    assert.match(indexSource, /formatNewNoteTitle\(lang\)/)
})

test('dedicated creation routes persist a locked editor format before redirecting', () => {
    assert.match(indexSource, /async function createNewNote\(request, editorFormat\)/)
    assert.match(indexSource, /new URL\(`\/\$\{path\}`, originUrl\)/)
    assert.match(indexSource, /blockDocumentVersion: editorFormat === 'block' \? 2 : undefined/)
    assert.match(indexSource, /router\.get\('\/new\/block', request => createNewNote\(request, 'block'\)\)/)
    assert.match(indexSource, /router\.get\('\/new\/markdown', request => createNewNote\(request, 'markdown'\)\)/)
})

test('worker.fetch successfully handles /new/canvas, /new/block, and /new/markdown without ReferenceError', async () => {
    const store = new Map()
    const env = {
        SCN_STORAGE_DRIVER: 'kv',
        NOTES: {
            getWithMetadata: async (key) => store.get(key) || { value: null, metadata: null },
            put: async (key, value, { metadata } = {}) => { store.set(key, { value, metadata }) },
            delete: async (key) => { store.delete(key) },
        },
    }
    const ctx = { waitUntil: () => {} }

    // 1. /new/canvas
    const canvasRes = await worker.fetch(new Request('https://wiki.david888.com/new/canvas'), env, ctx)
    assert.equal(canvasRes.status, 302)
    const canvasLoc = canvasRes.headers.get('Location')
    assert.ok(canvasLoc && canvasLoc.includes('?new=1'))
    const canvasPath = new URL(canvasLoc).pathname.slice(1)
    const canvasRecord = store.get(canvasPath)
    assert.ok(canvasRecord, 'Canvas note should be stored')
    assert.equal(canvasRecord.metadata.editorFormat, 'canvas')
    const parsedCanvas = JSON.parse(canvasRecord.value)
    assert.deepEqual(parsedCanvas, { nodes: [], edges: [] })

    // 2. /new/canvas with share parameters
    const shareRes = await worker.fetch(new Request('https://wiki.david888.com/new/canvas?title=Idea&text=Detail'), env, ctx)
    assert.equal(shareRes.status, 302)
    const shareLoc = shareRes.headers.get('Location')
    const sharePath = new URL(shareLoc).pathname.slice(1)
    const shareRecord = store.get(sharePath)
    assert.ok(shareRecord)
    const parsedShareCanvas = JSON.parse(shareRecord.value)
    assert.equal(parsedShareCanvas.nodes.length, 1)
    assert.match(parsedShareCanvas.nodes[0].text, /# Idea/)
    assert.match(parsedShareCanvas.nodes[0].text, /Detail/)

    // 3. /new/block
    const blockRes = await worker.fetch(new Request('https://wiki.david888.com/new/block'), env, ctx)
    assert.equal(blockRes.status, 302)
    const blockLoc = blockRes.headers.get('Location')
    const blockPath = new URL(blockLoc).pathname.slice(1)
    const blockRecord = store.get(blockPath)
    assert.ok(blockRecord)
    assert.equal(blockRecord.metadata.editorFormat, 'block')
    assert.equal(blockRecord.metadata.blockDocumentVersion, 2)
    assert.equal(blockRecord.value, '')

    // 4. /new/markdown
    const mdRes = await worker.fetch(new Request('https://wiki.david888.com/new/markdown'), env, ctx)
    assert.equal(mdRes.status, 302)
    const mdLoc = mdRes.headers.get('Location')
    const mdPath = new URL(mdLoc).pathname.slice(1)
    const mdRecord = store.get(mdPath)
    assert.ok(mdRecord)
    assert.equal(mdRecord.metadata.editorFormat, 'markdown')
    assert.equal(mdRecord.value, '')
})


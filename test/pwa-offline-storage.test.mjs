import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { JSDOM } from 'jsdom'

import { createOfflinePageResponse } from '../src/offline_page.js'
import { HTML } from '../src/templates/base.js'

const staticFile = file => readFileSync(new URL(`../static/${file}`, import.meta.url), 'utf8')
const workerSource = readFileSync(new URL('../src/index.js', import.meta.url), 'utf8')
const baseTemplateSource = readFileSync(new URL('../src/templates/base.js', import.meta.url), 'utf8')

test('manifest and worker route define File Handling API for markdown and text files', () => {
    const manifest = JSON.parse(staticFile('app.webmanifest'))
    assert.ok(Array.isArray(manifest.file_handlers), 'file_handlers should be an array')
    const mdHandler = manifest.file_handlers.find(h => h.accept && h.accept['text/markdown'])
    assert.ok(mdHandler, 'Should define text/markdown handler')
    assert.ok(mdHandler.accept['text/markdown'].includes('.md'))
    assert.ok(mdHandler.accept['text/markdown'].includes('.markdown'))
    assert.ok(mdHandler.accept['text/plain'].includes('.txt'))

    assert.match(workerSource, /file_handlers/)
    assert.match(workerSource, /text\/markdown/)
})

test('offline store module provides hybrid storage, export, and file opening methods', async () => {
    const offlineStoreModule = await import('../static/js/offline-store.mjs')
    assert.ok(offlineStoreModule.offlineStore, 'offlineStore instance exists')
    assert.equal(typeof offlineStoreModule.exportMarkdownFile, 'function')
    assert.equal(typeof offlineStoreModule.openLocalMarkdownFile, 'function')

    // Test offline store save and retrieve in node environment (memory fallback)
    const store = offlineStoreModule.offlineStore
    await store.saveNote('test-note-1', {
        title: 'Test Note Title',
        content: '# Hello World\nThis is content',
        theme: 'tokyo-night',
        syncStatus: 'draft'
    })

    const note = await store.getNote('test-note-1')
    assert.ok(note)
    assert.equal(note.title, 'Test Note Title')
    assert.equal(note.content, '# Hello World\nThis is content')
    assert.equal(note.theme, 'tokyo-night')

    await store.deleteNote('test-note-1')
    const deleted = await store.getNote('test-note-1')
    assert.equal(deleted, null)
})

test('offline page provides interactive offline workspace with local cache listing and export button', async () => {
    const response = createOfflinePageResponse()
    const html = await response.text()
    assert.equal(response.status, 200)
    assert.match(html, /離線工作區/)
    assert.match(html, /本機快取筆記/)
    assert.match(html, /導出 Markdown/)
    assert.match(html, /開啟本機 \.md/)
    assert.match(html, /\/js\/offline-store\.mjs/)
})

test('base template integrates offline store, Cmd+S shortcut, and PWA launch queue', () => {
    assert.match(baseTemplateSource, /src="\/js\/offline-store\.mjs"/)
    assert.match(baseTemplateSource, /window\.offlineStore/)
    assert.match(baseTemplateSource, /window\.__openLocalFileContent/)
    assert.match(baseTemplateSource, /key === 's'/)
    assert.match(baseTemplateSource, /key === 'o'/)
})

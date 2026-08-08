import test from 'node:test'
import assert from 'node:assert/strict'
import vm from 'node:vm'
import { HTML } from '../src/templates/base.js'

test('editor inline script remains syntactically valid when AI translation is available', () => {
    const page = HTML({
        lang: 'zh-TW',
        title: 'AI test',
        content: '# Hello',
        ext: {},
        tips: [],
        isEdit: true,
        path: 'ai-test',
        shareId: '',
    })
    const scripts = [...page.matchAll(/<script([^>]*)>([\s\S]*?)<\/script>/g)]
    const editorScript = scripts.find(match => match[2].includes('const APP_STATE ='))

    assert.ok(editorScript)
    assert.doesNotThrow(() => new vm.Script(editorScript[2]))
})

test('all rendered modals start hidden from assistive technology and use the shared focus manager', () => {
    const page = HTML({
        lang: 'zh-TW',
        title: 'Modal test',
        content: '# Test',
        ext: { noteHistoryEnabled: true },
        isEdit: true,
        path: 'modal-test',
    })

    assert.match(page, /const modalFocusState = new WeakMap\(\)/)
    assert.match(page, /const openModal = \(modal/)
    assert.match(page, /const closeModal = \(modal/)
    assert.match(page, /prefers-reduced-motion/)
    assert.equal((page.match(/class="modal [^"]+"[^>]*aria-hidden="true"/g) || []).length >= 6, true)
})

test('publication status date formatter is hoisted before initial UI synchronization', () => {
    const page = HTML({
        lang: 'zh-TW',
        title: 'Published note',
        content: '# Visible preview',
        ext: { share: true, updateAt: 123 },
        isEdit: true,
        path: 'published-note',
        shareId: 'share-id',
    })
    const editorScript = [...page.matchAll(/<script([^>]*)>([\s\S]*?)<\/script>/g)]
        .find(match => match[2].includes('const APP_STATE ='))

    assert.ok(editorScript)
    assert.match(editorScript[2], /function formatPublicationUpdatedAt\(timestamp\)/)
    assert.match(editorScript[2], /function syncPublicIndexButton\(\)/)
    assert.doesNotMatch(editorScript[2], /const formatPublicationUpdatedAt\s*=/)
    assert.doesNotMatch(editorScript[2], /const syncPublicIndexButton\s*=/)
})

import test from 'node:test'
import assert from 'node:assert/strict'
import { JSDOM } from 'jsdom'

test('block editor writes structural edits back to the hidden JSON source', async () => {
    const dom = new JSDOM('<div id="block-editor"></div><textarea id="contents">{"version":1,"blocks":[]}</textarea>', {
        url: 'https://example.test/note',
    })
    const previous = {
        window: globalThis.window,
        document: globalThis.document,
        Event: globalThis.Event,
        FormData: globalThis.FormData,
    }

    Object.assign(globalThis, {
        window: dom.window,
        document: dom.window.document,
        Event: dom.window.Event,
        FormData: dom.window.FormData,
    })

    try {
        await import(`../static/js/block-editor.mjs?runtime-test=${Date.now()}`)
        const addType = dom.window.document.querySelector('.block-add-select')
        addType.value = 'heading'
        addType.dispatchEvent(new dom.window.Event('change', { bubbles: true }))

        const heading = dom.window.document.querySelector('.block-text-input')
        heading.textContent = 'A real block title'
        heading.dispatchEvent(new dom.window.Event('input', { bubbles: true }))

        const saved = JSON.parse(dom.window.document.querySelector('#contents').value)
        assert.equal(saved.version, 1)
        assert.equal(saved.blocks.length, 1)
        assert.match(saved.blocks[0].id, /.+/)
        assert.equal(saved.blocks[0].type, 'heading')
        assert.deepEqual(saved.blocks[0].props, { level: 2, text: 'A real block title' })
    } finally {
        Object.assign(globalThis, previous)
        dom.window.close()
    }
})

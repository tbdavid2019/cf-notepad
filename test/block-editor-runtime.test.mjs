import test from 'node:test'
import assert from 'node:assert/strict'
import { JSDOM } from 'jsdom'

test('Tiptap block editor writes structural edits back to the hidden JSON source', async () => {
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
        assert.ok(dom.window.document.querySelector('.ProseMirror'))
        assert.ok(dom.window.document.querySelector('.tiptap-slash-menu'))
        const headingButton = [...dom.window.document.querySelectorAll('.tiptap-toolbar-button')]
            .find(button => button.dataset.command === 'heading1')
        headingButton.click()

        const saved = JSON.parse(dom.window.document.querySelector('#contents').value)
        assert.equal(saved.type, 'doc')
        assert.equal(saved.content[0].type, 'heading')
        assert.equal(saved.content[0].attrs.level, 1)
    } finally {
        Object.assign(globalThis, previous)
        dom.window.close()
    }
})

import test from 'node:test'
import assert from 'node:assert/strict'
import { JSDOM } from 'jsdom'

import { FOOTER, URL_IMPORT_MODAL, SVG_ICONS } from '../src/templates/common.js'

const createWindow = html => new JSDOM(html, { url: 'https://wiki.david888.com/' }).window

test('SVG_ICONS has settings defined and not undefined', () => {
    assert.ok(SVG_ICONS.settings, 'SVG_ICONS.settings should be defined')
    assert.notEqual(SVG_ICONS.settings, undefined)
    assert.match(SVG_ICONS.settings, /<svg/)
})

test('footer dropdown contains url to markdown import button and updated settings label', () => {
    const html = `${FOOTER({ lang: 'zh-TW', isEdit: true, mode: 'md', editorFormat: 'markdown' })}${URL_IMPORT_MODAL('zh-TW')}`
    const window = createWindow(html)
    const { document } = window

    const importUrlBtn = document.querySelector('#dropdown-import-url-btn')
    assert.ok(importUrlBtn, '#dropdown-import-url-btn should exist')
    assert.match(importUrlBtn.textContent, /匯入網站/)

    const preferenceBtn = document.querySelector('#editor-preference-btn')
    assert.ok(preferenceBtn, '#editor-preference-btn should exist')
    assert.match(preferenceBtn.textContent, /設定預設編輯器模式/)
    assert.doesNotMatch(preferenceBtn.innerHTML, /undefined/)

    const urlModal = document.querySelector('#url-import-modal')
    assert.ok(urlModal, '#url-import-modal should exist in DOM')
})

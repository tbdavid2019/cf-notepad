import test from 'node:test'
import assert from 'node:assert/strict'
import { JSDOM } from 'jsdom'

import { EDITOR_PREFERENCE_MODAL, FOOTER } from '../src/templates/common.js'
import {
    DEFAULT_EDITOR_FORMAT,
    EDITOR_PREFERENCE_STORAGE_KEY,
    EDITOR_SESSION_PREFERENCE_KEY,
    getEditorPreference,
    initializeEditorPreference,
    saveEditorPreference,
} from '../static/js/editor-preference.mjs'

const createWindow = html => new JSDOM(html, { url: 'https://wiki.david888.com/' }).window

test('editor preference defaults to Block and supports persistent or session-only choices', () => {
    const window = createWindow('')

    assert.deepEqual(getEditorPreference(window), { format: DEFAULT_EDITOR_FORMAT, remembered: false })

    saveEditorPreference('markdown', { remember: false, windowRef: window })
    assert.deepEqual(getEditorPreference(window), { format: 'markdown', remembered: false })
    assert.equal(window.localStorage.getItem(EDITOR_PREFERENCE_STORAGE_KEY), null)
    assert.equal(window.sessionStorage.getItem(EDITOR_SESSION_PREFERENCE_KEY), 'markdown')

    saveEditorPreference('block', { remember: true, windowRef: window })
    assert.deepEqual(getEditorPreference(window), { format: 'block', remembered: true })
    assert.equal(window.localStorage.getItem(EDITOR_PREFERENCE_STORAGE_KEY), 'block')
    assert.throws(() => saveEditorPreference('html', { windowRef: window }), /Invalid editor format/)
})

test('footer setting changes the one-click new-note target without converting the current note', () => {
    const window = createWindow(`${FOOTER({ lang: 'zh-TW', isEdit: true, mode: 'md', editorFormat: 'markdown' })}${EDITOR_PREFERENCE_MODAL('zh-TW')}`)
    const { document } = window
    initializeEditorPreference(document, window, { navigate: () => assert.fail('settings should not navigate') })

    const primary = document.querySelector('#new-note-link')
    const settings = document.querySelector('#editor-preference-btn')
    settings.click()
    assert.equal(document.querySelector('[data-editor-preference-dialog]').getAttribute('aria-hidden'), 'false')

    document.querySelector('input[value="markdown"]').click()
    document.querySelector('[data-editor-preference-remember]').checked = true
    document.querySelector('[data-editor-preference-form]').dispatchEvent(new window.Event('submit', { bubbles: true, cancelable: true }))

    assert.equal(primary.getAttribute('href'), '/new/markdown')
    assert.equal(window.localStorage.getItem(EDITOR_PREFERENCE_STORAGE_KEY), 'markdown')
    assert.equal(document.querySelector('[data-editor-preference-dialog]').getAttribute('aria-hidden'), 'true')
    assert.equal(document.activeElement, settings)
})

test('homepage asks only until it has a session or remembered editor choice', () => {
    const firstWindow = createWindow(EDITOR_PREFERENCE_MODAL('zh-TW', { autoOpen: true }))
    const firstNavigations = []
    initializeEditorPreference(firstWindow.document, firstWindow, { navigate: format => firstNavigations.push(format) })

    const dialog = firstWindow.document.querySelector('[data-editor-preference-dialog]')
    assert.equal(dialog.getAttribute('aria-hidden'), 'false')
    assert.equal(firstNavigations.length, 0)

    firstWindow.document.querySelector('input[value="markdown"]').click()
    firstWindow.document.querySelector('[data-editor-preference-form]').dispatchEvent(new firstWindow.Event('submit', { bubbles: true, cancelable: true }))
    assert.deepEqual(firstNavigations, ['markdown'])
    assert.equal(firstWindow.sessionStorage.getItem(EDITOR_SESSION_PREFERENCE_KEY), 'markdown')
    assert.equal(firstWindow.localStorage.getItem(EDITOR_PREFERENCE_STORAGE_KEY), null)

    const secondNavigations = []
    initializeEditorPreference(firstWindow.document, firstWindow, { navigate: format => secondNavigations.push(format) })
    assert.deepEqual(secondNavigations, ['markdown'])
})

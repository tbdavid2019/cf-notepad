import test from 'node:test'
import assert from 'node:assert/strict'
import { JSDOM } from 'jsdom'

import { EDITOR_PREFERENCE_MODAL, FOOTER } from '../src/templates/common.js'
import {
    DEFAULT_EDITOR_FORMAT,
    EDITOR_PREFERENCE_STORAGE_KEY,
    EDITOR_SESSION_PREFERENCE_KEY,
    getEditorPreference,
    hasEditorPreference,
    initializeEditorPreference,
    saveEditorPreference,
} from '../static/js/editor-preference.mjs'

const createWindow = html => new JSDOM(html, { url: 'https://wiki.david888.com/' }).window

test('editor preference defaults to Markdown and supports persistent choices in localStorage', () => {
    const window = createWindow('')

    assert.equal(DEFAULT_EDITOR_FORMAT, 'markdown')
    assert.deepEqual(getEditorPreference(window), { format: 'markdown', remembered: false })
    assert.equal(hasEditorPreference(window), false)

    saveEditorPreference('block', { remember: false, windowRef: window })
    assert.deepEqual(getEditorPreference(window), { format: 'markdown', remembered: false })
    assert.equal(hasEditorPreference(window), false)
    assert.equal(window.localStorage.getItem(EDITOR_PREFERENCE_STORAGE_KEY), null)

    saveEditorPreference('block', { remember: true, windowRef: window })
    assert.deepEqual(getEditorPreference(window), { format: 'block', remembered: true })
    assert.equal(hasEditorPreference(window), true)
    assert.equal(window.localStorage.getItem(EDITOR_PREFERENCE_STORAGE_KEY), 'block')

    saveEditorPreference('markdown', { remember: true, windowRef: window })
    assert.deepEqual(getEditorPreference(window), { format: 'markdown', remembered: true })
    assert.equal(window.localStorage.getItem(EDITOR_PREFERENCE_STORAGE_KEY), 'markdown')
    assert.throws(() => saveEditorPreference('html', { windowRef: window }), /Invalid editor format/)
})

test('primary new-note action asks for a format when no preference exists and supports one-click card action', () => {
    const window = createWindow(`${FOOTER({ lang: 'zh-TW', isEdit: true, mode: 'md', editorFormat: 'markdown' })}${EDITOR_PREFERENCE_MODAL('zh-TW')}`)
    const navigations = []
    const controller = initializeEditorPreference(window.document, window, { navigate: format => navigations.push(format) })

    const dialog = window.document.querySelector('[data-editor-preference-dialog]')
    controller.open({ startNewNote: true })
    assert.equal(dialog.getAttribute('aria-hidden'), 'false')

    // Click direct card button for markdown
    const mdButton = window.document.querySelector('[data-editor-format-choice="markdown"]')
    assert.ok(mdButton)
    mdButton.click()
    assert.deepEqual(navigations, ['markdown'])
})

test('footer setting changes the default new-note format preference', () => {
    const window = createWindow(`${FOOTER({ lang: 'zh-TW', isEdit: true, mode: 'md', editorFormat: 'markdown' })}${EDITOR_PREFERENCE_MODAL('zh-TW')}`)
    const { document } = window
    initializeEditorPreference(document, window, { navigate: () => assert.fail('settings should not navigate') })

    const settings = document.querySelector('#editor-preference-btn')
    settings.click()
    assert.equal(document.querySelector('[data-editor-preference-dialog]').getAttribute('aria-hidden'), 'false')

    document.querySelector('input[value="markdown"]').click()
    document.querySelector('[data-editor-preference-remember]').checked = true
    document.querySelector('[data-editor-preference-form]').dispatchEvent(new window.Event('submit', { bubbles: true, cancelable: true }))

    assert.equal(window.localStorage.getItem(EDITOR_PREFERENCE_STORAGE_KEY), 'markdown')
    assert.equal(document.querySelector('[data-editor-preference-dialog]').getAttribute('aria-hidden'), 'true')
    assert.equal(document.activeElement, settings)
})

test('homepage asks until it has a remembered editor choice', () => {
    const firstWindow = createWindow(EDITOR_PREFERENCE_MODAL('zh-TW', { autoOpen: true }))
    const firstNavigations = []
    initializeEditorPreference(firstWindow.document, firstWindow, { navigate: format => firstNavigations.push(format) })

    const dialog = firstWindow.document.querySelector('[data-editor-preference-dialog]')
    assert.equal(dialog.getAttribute('aria-hidden'), 'false')
    assert.equal(firstNavigations.length, 0)

    firstWindow.document.querySelector('input[value="markdown"]').click()
    firstWindow.document.querySelector('[data-editor-preference-remember]').checked = true
    firstWindow.document.querySelector('[data-editor-preference-form]').dispatchEvent(new firstWindow.Event('submit', { bubbles: true, cancelable: true }))
    assert.deepEqual(firstNavigations, ['markdown'])
    assert.equal(firstWindow.localStorage.getItem(EDITOR_PREFERENCE_STORAGE_KEY), 'markdown')

    const secondNavigations = []
    initializeEditorPreference(firstWindow.document, firstWindow, { navigate: format => secondNavigations.push(format) })
    assert.deepEqual(secondNavigations, ['markdown'])
})

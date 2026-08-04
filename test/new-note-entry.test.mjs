import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

import {
    formatNewNoteTitle,
    isNewNoteEntry,
} from '../src/note_meta.js'

const indexSource = readFileSync(new URL('../src/index.js', import.meta.url), 'utf8')

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

test('new-note tab title uses a human timestamp instead of the random path', () => {
    const date = new Date('2026-07-30T01:05:00.000Z')

    assert.equal(formatNewNoteTitle('zh-TW', date), '新筆記 · 07/30 09:05')
    assert.equal(formatNewNoteTitle('en-US', date), 'New note · 07/30 09:05')
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

import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

import {
    formatNewNoteTitle,
    isNewNoteEntry,
} from '../src/note_meta.js'

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

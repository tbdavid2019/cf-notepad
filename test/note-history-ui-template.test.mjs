import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const commonTemplate = readFileSync(new URL('../src/templates/common.js', import.meta.url), 'utf8')

test('note history UI uses a separate modal from recent shares', () => {
    assert.match(commonTemplate, /class="modal note-history-modal"/)
    assert.match(commonTemplate, /data-note-history-list/)
    assert.match(commonTemplate, /data-note-history-restore/)
    assert.doesNotMatch(commonTemplate, /data-share-history-tab="history"/)
})

test('footer keeps recent shares and adds a separate history button only on edit pages', () => {
    assert.match(commonTemplate, /id="share-history-btn"/)
    assert.match(commonTemplate, /id="note-history-btn"/)
    assert.match(commonTemplate, /const showNoteHistory = noteHistoryEnabled === true && isEdit/)
})

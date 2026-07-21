import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

import {
    AUTOSAVE_IDLE_MS,
    canPersistNoteContent,
    getSaveBlockedMessage,
} from '../src/save_policy.mjs'

const baseTemplateSource = readFileSync(new URL('../src/templates/base.js', import.meta.url), 'utf8')
const commonTemplateSource = readFileSync(new URL('../src/templates/common.js', import.meta.url), 'utf8')
const indexSource = readFileSync(new URL('../src/index.js', import.meta.url), 'utf8')

test('private notes cannot persist content while published notes can', () => {
    assert.equal(canPersistNoteContent({ share: false }), false)
    assert.equal(canPersistNoteContent({ share: true }), true)
    assert.equal(canPersistNoteContent({}), false)
})

test('autosave waits ten seconds and explains that publishing is required', () => {
    assert.equal(AUTOSAVE_IDLE_MS, 10000)
    assert.match(getSaveBlockedMessage('zh-TW'), /發布.*閱讀鎖/)
    assert.match(getSaveBlockedMessage('en-US'), /publish.*read lock/i)
})

test('editor exposes opt-in autosave and manual save controls', () => {
    assert.match(commonTemplateSource, /id="save-note-btn"/)
    assert.match(commonTemplateSource, /id="autosave-toggle"/)
    assert.match(commonTemplateSource, /app-dialog-modal/)
    assert.match(commonTemplateSource, /readLockTitle/)
    assert.match(baseTemplateSource, /AUTOSAVE_IDLE_MS/)
    assert.match(baseTemplateSource, /window\.showAppDialog/)
    assert.doesNotMatch(baseTemplateSource, /\$textarea\.oninput\s*=\s*throttle/)
    assert.match(baseTemplateSource, /beforeunload/)
})

test('editor resizer applies horizontal width to panes and vertical height to panes', () => {
    assert.match(baseTemplateSource, /const \$editorPane = document\.querySelector\('\.editor-pane'\)/)
    assert.match(baseTemplateSource, /\$editorPane\?\.style\.removeProperty\('flex'\)/)
    assert.match(baseTemplateSource, /firstPaneSize = isVertical \? \$editorPane\.getBoundingClientRect\(\)\.height : \$editorPane\.getBoundingClientRect\(\)\.width/)
    assert.match(baseTemplateSource, /\$editorPane\.style\.flex =/)
})

test('unpublished publish prompt waits for input inactivity and saves while publishing', () => {
    assert.match(baseTemplateSource, /schedulePublishNudge[\s\S]*setTimeout\([\s\S]*AUTOSAVE_IDLE_MS/)
    assert.match(baseTemplateSource, /\$textarea\.addEventListener\('input', \(\) => \{[\s\S]*schedulePublishNudge\(\)/)
    assert.doesNotMatch(baseTemplateSource, /setTimeout\([^\n]*180000/)
    assert.match(baseTemplateSource, /publishAndSave/)
    assert.match(baseTemplateSource, /body: JSON\.stringify\(\{ share: true, content:/)
})

test('publishing asks whether to enable autosave and persists an affirmative choice', () => {
    assert.match(baseTemplateSource, /const promptEnableAutosave = async \(\) =>/)
    assert.match(baseTemplateSource, /autosaveNudgeTitle/)
    assert.match(baseTemplateSource, /await window\.showAppDialog\(\{[\s\S]*confirm: true/)
    assert.match(baseTemplateSource, /localStorage\.setItem\('cf-notepad-autosave', 'true'\)/)
    assert.match(baseTemplateSource, /if \(!wasPublished\) promptEnableAutosave\(\)/)
})

test('markdown export prefers the note title for the downloaded filename', () => {
    assert.match(baseTemplateSource, /const source = APP_STATE\.title \|\| APP_STATE\.path \|\| 'note'/)
})

test('publishing can persist the current editor content in the same request', () => {
    assert.match(baseTemplateSource, /body: JSON\.stringify\(\{ share: true, content:/)
    assert.match(indexSource, /const \{ share, theme, width, shareFont, publicIndex, content \}/)
    assert.match(indexSource, /typeof content === 'string'/)
})

test('ordinary content saves are guarded by the published state', () => {
    assert.match(indexSource, /canPersistNoteContent\(metadata\)/)
    assert.match(indexSource, /return returnJSON\(10005, getSaveBlockedMessage\(getI18n\(request\)\)\)/)
})

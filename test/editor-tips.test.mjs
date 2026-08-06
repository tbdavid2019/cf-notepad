import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const tips = JSON.parse(readFileSync(new URL('../static/data/editor-tips.json', import.meta.url), 'utf8'))
const baseTemplate = readFileSync(new URL('../src/templates/base.js', import.meta.url), 'utf8')
const editorCss = readFileSync(new URL('../src/styles/editor.css.js', import.meta.url), 'utf8')

test('tips data contains localized, non-empty entries', () => {
    assert.equal(tips.version, 1)
    assert.ok(Array.isArray(tips.tips) && tips.tips.length >= 3)
    tips.tips.forEach(tip => {
        assert.ok(tip.id)
        assert.ok(tip['zh-TW'])
        assert.ok(tip['en-US'])
    })
})

test('a new editor presents poem and tip as a centered welcome panel', () => {
    assert.match(baseTemplate, /fetch\('\/data\/editor-tips\.json'\)/)
    assert.match(baseTemplate, /Math\.random\(\)\s*\*\s*tips\.length/)
    assert.match(baseTemplate, /StrayBirds/)
    assert.match(baseTemplate, /id="editor-welcome"/)
    assert.match(baseTemplate, /editor-welcome__section/)
    assert.match(baseTemplate, /APP_STATE\.isNewEntry/)
    assert.match(baseTemplate, /syncWelcomeVisibility/)
    assert.match(editorCss, /\.editor-welcome\s*\{[\s\S]*place-content:\s*center/)
    assert.match(editorCss, /\.editor-welcome__section/)
})

import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const tips = JSON.parse(readFileSync(new URL('../static/data/editor-tips.json', import.meta.url), 'utf8'))
const baseTemplate = readFileSync(new URL('../src/templates/base.js', import.meta.url), 'utf8')

test('tips data contains localized, non-empty entries', () => {
    assert.equal(tips.version, 1)
    assert.ok(Array.isArray(tips.tips) && tips.tips.length >= 3)
    tips.tips.forEach(tip => {
        assert.ok(tip.id)
        assert.ok(tip['zh-TW'])
        assert.ok(tip['en-US'])
    })
})

test('editor loads a random tip into the shared typewriter welcome text', () => {
    assert.match(baseTemplate, /fetch\('\/data\/editor-tips\.json'\)/)
    assert.match(baseTemplate, /Math\.random\(\)\s*\*\s*tips\.length/)
    assert.match(baseTemplate, /StrayBirds/)
    assert.match(baseTemplate, /welcomeText\.slice\(0, currentIdx \+ 1\)/)
})

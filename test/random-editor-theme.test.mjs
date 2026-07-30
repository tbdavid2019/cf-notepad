import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

import { resolvePageTheme } from '../src/templates/base.js'

const baseTemplateSource = readFileSync(new URL('../src/templates/base.js', import.meta.url), 'utf8')

const themes = {
    alpha: 'alpha css',
    beta: 'beta css',
    gamma: 'gamma css',
}

test('only a homepage-created new note chooses a random theme', () => {
    assert.equal(resolvePageTheme({ randomize: true, storedTheme: 'beta', themes, random: () => 0 }), 'alpha')
    assert.equal(resolvePageTheme({ randomize: true, storedTheme: 'beta', themes, random: () => 0.999999 }), 'gamma')
})

test('existing edit and share pages retain the persisted article theme', () => {
    assert.equal(resolvePageTheme({ randomize: false, storedTheme: 'beta', themes }), 'beta')
    assert.equal(resolvePageTheme({ randomize: false, storedTheme: 'missing', themes }), 'alpha')
})

test('the initial random theme is published to server metadata', () => {
    assert.match(baseTemplateSource, /randomize: isEdit && ext\.isNewEntry === true/)
    assert.match(baseTemplateSource, /THEMES\[pageTheme\]/)
    assert.match(baseTemplateSource, /FOOTER\(\{[\s\S]*theme: pageTheme/)
    assert.match(
        baseTemplateSource,
        /APP_STATE\.isNewEntry[\s\S]*persistSetting\(\{ theme: APP_STATE\.theme \}\)/,
    )
    assert.match(baseTemplateSource, /JSON\.stringify\(\{ share: true, content:[\s\S]*theme: currentTheme/)
    assert.match(baseTemplateSource, /history\.replaceState/)
})

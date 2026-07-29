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

test('edit pages choose a theme from the complete theme registry on each render', () => {
    assert.equal(resolvePageTheme({ isEdit: true, storedTheme: 'beta', themes, random: () => 0 }), 'alpha')
    assert.equal(resolvePageTheme({ isEdit: true, storedTheme: 'beta', themes, random: () => 0.999999 }), 'gamma')
})

test('share pages retain the article theme and invalid themes use a safe fallback', () => {
    assert.equal(resolvePageTheme({ isEdit: false, storedTheme: 'beta', themes }), 'beta')
    assert.equal(resolvePageTheme({ isEdit: false, storedTheme: 'missing', themes }), 'alpha')
})

test('the random editor theme drives both preview CSS and the theme selector', () => {
    assert.match(baseTemplateSource, /const pageTheme = resolvePageTheme\(\{ isEdit, storedTheme: ext\.theme \}\)/)
    assert.match(baseTemplateSource, /THEMES\[pageTheme\]/)
    assert.match(baseTemplateSource, /FOOTER\(\{[\s\S]*theme: pageTheme/)
})

import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const commonTemplateSource = readFileSync(new URL('../src/templates/common.js', import.meta.url), 'utf8')
const baseTemplateSource = readFileSync(new URL('../src/templates/base.js', import.meta.url), 'utf8')

test('share menu renders both states so publishing can update it without reload', () => {
    assert.match(commonTemplateSource, /class="share-menu-published"/)
    assert.match(commonTemplateSource, /class="share-menu-unpublished"/)
    assert.match(commonTemplateSource, /share-menu-published" \$\{share && shareId \? '' : 'hidden'\}/)
    assert.match(commonTemplateSource, /share-menu-unpublished" \$\{share && shareId \? 'hidden' : ''\}/)
})

test('publishing synchronizes the live share id and menu state', () => {
    assert.match(baseTemplateSource, /APP_STATE\.shareId = res\.data/)
    assert.match(baseTemplateSource, /function syncShareMenuUI\(\)/)
    assert.match(baseTemplateSource, /syncShareMenuUI\(\)/)
    assert.match(baseTemplateSource, /share-menu-published.*hidden/s)
    assert.match(baseTemplateSource, /share-menu-unpublished.*hidden/s)
})

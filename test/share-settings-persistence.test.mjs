import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const indexSource = readFileSync(new URL('../src/index.js', import.meta.url), 'utf8')
const baseTemplateSource = readFileSync(new URL('../src/templates/base.js', import.meta.url), 'utf8')

test('setting route persists share, theme, width, share font, and publicIndex metadata', () => {
    assert.match(indexSource, /const\s+\{\s*share,\s*theme,\s*width,\s*shareFont,\s*publicIndex,\s*content\s*\}\s*=\s*await request\.json\(\)/)
    assert.match(indexSource, /\.\.\.width !== undefined && \{ width \}/)
    assert.match(indexSource, /\.\.\.shareFont !== undefined && \{ shareFont \}/)
    assert.doesNotMatch(indexSource, /\.\.\.splitDirection !== undefined/)
    assert.doesNotMatch(indexSource, /\.\.\.previewDevice !== undefined/)
})

test('base template initializes reader appearance from metadata and local editor preferences from localStorage', () => {
    assert.match(baseTemplateSource, /const initialPreviewWidth = APP_STATE\.noteSettings\.width \|\| savedPreviewWidth \|\| \(APP_STATE\.isEdit \? '1200px' : '100%'\)/)
    assert.match(baseTemplateSource, /const initialPreviewDevice = savedPreviewDevice \|\| 'desktop'/)
    assert.match(baseTemplateSource, /const initialSplitDirection = savedSplitDirection === 'vertical' \? 'vertical' : 'horizontal'/)
    assert.match(baseTemplateSource, /const savedShareFont = canPersistSettings \? window\.localStorage\.getItem\(SHARE_FONT_STORAGE_KEY\) : '';/)
    assert.match(baseTemplateSource, /const initialShareFont = APP_STATE\.noteSettings\.shareFont/)
    assert.match(baseTemplateSource, /savedShareFont === 'maple' \|\| savedShareFont === 'true'/)
})

test('share appearance changes stay local and only edit pages persist settings', () => {
    assert.match(baseTemplateSource, /const canPersistSettings = APP_STATE\.isEdit === true/)
    assert.match(baseTemplateSource, /if \(!canPersistSettings\) return null/)
    assert.match(baseTemplateSource, /if \(canPersistSettings\) \{\s*window\.localStorage\.setItem\(PREVIEW_WIDTH_STORAGE_KEY/s)
    assert.match(baseTemplateSource, /if \(canPersistSettings\) \{\s*window\.localStorage\.setItem\(SHARE_FONT_STORAGE_KEY/s)
    assert.match(baseTemplateSource, /if \(canPersistSettings\) persistSetting\(\{ theme \}\)/)
})

test('editor persists default preview width to APP_STATE and server when publishing or changing selector', () => {
    assert.match(baseTemplateSource, /APP_STATE\.noteSettings\.width = initialPreviewWidth/)
    assert.match(baseTemplateSource, /publishCurrentNote[\s\S]*width:\s*currentWidth/)
    assert.match(baseTemplateSource, /previewWidthSelector\.addEventListener\('wa-change'/)
    assert.match(baseTemplateSource, /function initUiTheme/)
    assert.match(baseTemplateSource, /document\.getElementById\('ui-theme-toggle-btn'\)/)
})



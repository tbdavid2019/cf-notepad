import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const indexSource = readFileSync(new URL('../src/index.js', import.meta.url), 'utf8')
const baseTemplateSource = readFileSync(new URL('../src/templates/base.js', import.meta.url), 'utf8')

test('setting route persists width, share font, preview device, and split direction metadata', () => {
    assert.match(indexSource, /const\s+\{\s*mode,\s*share,\s*theme,\s*width,\s*shareFont,\s*previewDevice,\s*splitDirection,\s*publicIndex,\s*autosave,\s*content\s*\}\s*=\s*await request\.json\(\)/)
    assert.match(indexSource, /\.\.\.width !== undefined && \{ width \}/)
    assert.match(indexSource, /\.\.\.shareFont !== undefined && \{ shareFont \}/)
    assert.match(indexSource, /\.\.\.previewDevice !== undefined && \{ previewDevice \}/)
    assert.match(indexSource, /\.\.\.splitDirection !== undefined && \{ splitDirection \}/)
})

test('base template initializes note-specific appearance from metadata before local storage', () => {
    assert.match(baseTemplateSource, /const initialPreviewWidth = APP_STATE\.noteSettings\.width \|\| savedPreviewWidth \|\| \(APP_STATE\.isEdit \? '1200px' : '100%'\)/)
    assert.match(baseTemplateSource, /const initialPreviewDevice = .*APP_STATE\.noteSettings\.previewDevice.*savedPreviewDevice.*'desktop'/)
    assert.match(baseTemplateSource, /const initialSplitDirection = APP_STATE\.noteSettings\.splitDirection === 'vertical' \? 'vertical' : 'horizontal'/)
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

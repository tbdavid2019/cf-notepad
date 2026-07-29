import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

import { FOOTER } from '../src/templates/common.js'
import { resolveAnnotationsEnabled } from '../src/note_meta.js'

const indexSource = readFileSync(new URL('../src/index.js', import.meta.url), 'utf8')
const baseTemplateSource = readFileSync(new URL('../src/templates/base.js', import.meta.url), 'utf8')

test('published notes default annotations on unless the author explicitly disabled them', () => {
    assert.equal(resolveAnnotationsEnabled({ share: true }), true)
    assert.equal(resolveAnnotationsEnabled({ share: true, annotationsEnabled: true }), true)
    assert.equal(resolveAnnotationsEnabled({ share: true, annotationsEnabled: false }), false)
    assert.equal(resolveAnnotationsEnabled({ share: false }), false)
})

test('note setting route defaults annotations on when publishing and disables them on unpublish', () => {
    assert.match(indexSource, /annotationsEnabled/)
    assert.match(indexSource, /annotationsEnabled !== undefined && \{ annotationsEnabled: annotationsEnabled === true \}/)
    assert.match(indexSource, /share === true && metadata\.share !== true && annotationsEnabled === undefined/)
    assert.match(indexSource, /if \(share === false\) \{[\s\S]*nextMetadata\.annotationsEnabled = false/)
})

test('published editor footer exposes a paragraph annotation control', () => {
    const disabledFooter = FOOTER({
        lang: 'zh-TW',
        isEdit: true,
        share: true,
        shareId: 'abc123',
        annotationsEnabled: false,
    })
    const enabledFooter = FOOTER({
        lang: 'zh-TW',
        isEdit: true,
        share: true,
        shareId: 'abc123',
        annotationsEnabled: true,
    })

    assert.match(disabledFooter, /id="annotations-enabled-btn"/)
    assert.match(disabledFooter, /段落註解/)
    assert.match(disabledFooter, /data-annotations-enabled="false"/)
    assert.match(disabledFooter, />關閉</)
    assert.match(enabledFooter, /data-annotations-enabled="true"/)
    assert.match(enabledFooter, />開放</)
})

test('editor state persists annotation changes and restores the button state', () => {
    assert.match(baseTemplateSource, /resolveAnnotationsEnabled\(ext\)/)
    assert.match(baseTemplateSource, /await persistSetting\(\{ annotationsEnabled: nextValue \}\)/)
    assert.match(baseTemplateSource, /APP_STATE\.annotationsEnabled = nextSettings\.annotationsEnabled === true/)
    assert.match(baseTemplateSource, /syncAnnotationsEnabledButton/)
})

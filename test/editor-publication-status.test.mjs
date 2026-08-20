import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const baseTemplateSource = readFileSync(new URL('../src/templates/base.js', import.meta.url), 'utf8')
const baseCssSource = readFileSync(new URL('../src/styles/base.css.js', import.meta.url), 'utf8')
const indexSource = readFileSync(new URL('../src/index.js', import.meta.url), 'utf8')
const constantSource = readFileSync(new URL('../src/constant.js', import.meta.url), 'utf8')

test('edit preview renders a publication status strip at the bottom of preview pane', () => {
    assert.match(baseTemplateSource, /class="editor-publication-status"/)
    assert.match(baseTemplateSource, /id="publication-share-url"/)
    assert.match(baseTemplateSource, /id="publication-copy-url"/)
    assert.match(baseTemplateSource, /id="publication-public-index"/)
    assert.match(baseTemplateSource, /id="publication-version-count"/)
    assert.match(baseTemplateSource, /id="publication-view-count"/)
    assert.match(baseTemplateSource, /class="contents markdown-body"><\/div>\$\{EDITOR_PUBLICATION_STATUS/)
})

test('publication status uses existing D1 history and unique-view metrics', () => {
    assert.match(indexSource, /getNoteViewCount/)
    assert.match(indexSource, /getNoteHistoryCounts/)
    assert.match(indexSource, /versionCount/)
    assert.match(indexSource, /viewCount/)
    assert.match(baseTemplateSource, /versionCount: Number\.isSafeInteger/)
    assert.match(baseTemplateSource, /viewCount: Number\.isSafeInteger/)
})

test('publication status stays outside the scrolling article and adapts to mobile preview', () => {
    assert.match(baseCssSource, /\.preview-pane \{[\s\S]*flex-direction: column;/)
    assert.match(baseCssSource, /\.editor-publication-status \{[\s\S]*flex: 0 0 auto;/)
    assert.match(baseCssSource, /body\.preview-device-mobile:not\(\.share-view\) \.editor-publication-status/)
    assert.match(baseCssSource, /@media \(max-width: 640px\)[\s\S]*\.editor-publication-status/)
    assert.match(baseCssSource, /\.editor-publication-status \{[\s\S]*height: 32px;[\s\S]*min-height: 32px;/)
    assert.match(baseCssSource, /\.editor-publication-status \{[\s\S]*white-space: nowrap;/)
})

test('dark UI theme gives the publication strip and footer a consistent high-contrast chrome palette', () => {
    assert.match(baseCssSource, /html\[data-ui-theme="dark"\][\s\S]*--status-bg: #0c3b63;/)
    assert.match(baseCssSource, /\.editor-publication-status \{[\s\S]*background: var\(--status-bg\);[\s\S]*color: var\(--status-text\);/)
    assert.match(baseCssSource, /\.publication-state\.is-published \{[\s\S]*background: var\(--status-success-bg\);[\s\S]*color: var\(--status-success-text\);/)
    assert.match(baseCssSource, /\.footer :is\(button, a, label\) \{[\s\S]*font-weight: 700;/)
})

test('dark UI theme distinguishes publish, layout, font, and language active states with a cohesive cool palette', () => {
    assert.match(baseCssSource, /html\[data-ui-theme="dark"\][\s\S]*--toolbar-publish-bg: #0f6f78;/)
    assert.match(baseCssSource, /html\[data-ui-theme="dark"\][\s\S]*--toolbar-layout-bg: #1d70b0;/)
    assert.match(baseCssSource, /html\[data-ui-theme="dark"\][\s\S]*--toolbar-appearance-bg: #5366b6;/)
    assert.match(baseCssSource, /html\[data-ui-theme="dark"\][\s\S]*--toolbar-language-bg: #7058a4;/)
    assert.match(baseCssSource, /\.share-menu-trigger\.is-published/)
    assert.match(baseCssSource, /#share-font-selector \.footer-rail-switch \{[\s\S]*--rail-checked-bg: var\(--toolbar-appearance-bg\);/)
    assert.match(baseCssSource, /#language-selector \.footer-rail-switch \{[\s\S]*--rail-checked-bg: var\(--toolbar-language-bg\);/)
})

test('publication status labels are localized', () => {
    assert.match(constantSource, /publicationDraft: 'Draft'/)
    assert.match(constantSource, /publicationVersions: 'Retained versions'/)
    assert.match(constantSource, /publicationViews: 'Unique views'/)
    assert.match(constantSource, /publicationDraft: '尚未發布'/)
    assert.match(constantSource, /publicationVersions: '保留版本'/)
    assert.match(constantSource, /publicationViews: '不重複瀏覽'/)
})

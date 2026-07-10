import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const indexSource = readFileSync(new URL('../src/index.js', import.meta.url), 'utf8')
const commonTemplateSource = readFileSync(new URL('../src/templates/common.js', import.meta.url), 'utf8')
const baseTemplateSource = readFileSync(new URL('../src/templates/base.js', import.meta.url), 'utf8')
const constantSource = readFileSync(new URL('../src/constant.js', import.meta.url), 'utf8')

test('setting route persists publicIndex metadata and clears it on unpublish', () => {
    assert.match(indexSource, /const\s+\{\s*mode,\s*share,\s*theme,\s*width,\s*shareFont,\s*previewDevice,\s*publicIndex\s*\}\s*=\s*await request\.json\(\)/)
    assert.match(indexSource, /publicIndex !== undefined && \{ publicIndex: publicIndex === true \}/)
    assert.match(indexSource, /if \(share === false\) \{\s*nextMetadata\.publicIndex = false/s)
})

test('published footer exposes public index control and removes published label prefix', () => {
    assert.match(commonTemplateSource, /id="public-index-btn"/)
    assert.match(commonTemplateSource, /id="share-open-link"/)
    assert.match(commonTemplateSource, /t\.publicIndexOn : t\.publicIndexOff/)
    assert.doesNotMatch(commonTemplateSource, /publish-status/)
})

test('share modal prompts for public index approval after publish', () => {
    assert.match(commonTemplateSource, /share-index-prompt/)
    assert.match(commonTemplateSource, /share-index-approve/)
    assert.match(commonTemplateSource, /share-index-decline/)
    assert.match(baseTemplateSource, /const setPublicIndex = async enabled =>/)
    assert.match(baseTemplateSource, /if \(\$shareIndexPrompt\) \{\s*\$shareIndexPrompt\.style\.display = APP_STATE\.publicIndex \? 'none' : 'flex';/s)
})

test('language strings cover public index actions', () => {
    assert.match(constantSource, /publicIndexEnable: 'Add to sitemap'/)
    assert.match(constantSource, /publicIndexPromptApprove: 'Yes, add it'/)
    assert.match(constantSource, /publicIndexEnable: '加入 sitemap'/)
    assert.match(constantSource, /publicIndexPromptApprove: '同意加入'/)
})

test('footer skill link points to the built-in well-known skill endpoint', () => {
    assert.match(commonTemplateSource, /href="\/\.well-known\/agent-skills\/david888-wiki-publisher\/SKILL\.md"/)
    assert.match(commonTemplateSource, /href="\/docs\/api"/)
    assert.match(commonTemplateSource, /class="toolbar-icon-link"/)
    assert.doesNotMatch(commonTemplateSource, /github\.com\/tbdavid2019\/cf-notepad\/blob\/main\/skills\/SKILL\.md/)
})

test('footer uses compact saved-time display and shortened theme labels', () => {
    assert.match(commonTemplateSource, /savedAtTitle/)
    assert.match(commonTemplateSource, /getAbsoluteTime\(updateAt, lang\)/)
    assert.match(commonTemplateSource, /cp-macchiato/)
    assert.match(commonTemplateSource, /playful-geo/)
    assert.match(commonTemplateSource, />◷<\/span>/)
    assert.match(constantSource, /savedAtTitle: 'Saved at'/)
    assert.match(constantSource, /savedAtTitle: '保存時間'/)
})

test('footer exposes markdown import export and PDF tools without reusing existing controls', () => {
    assert.match(commonTemplateSource, /id="import-md-btn"/)
    assert.match(commonTemplateSource, /id="export-md-btn"/)
    assert.match(commonTemplateSource, /id="export-pdf-btn"/)
    assert.match(commonTemplateSource, /id="import-md-input"/)
    assert.match(baseTemplateSource, /\$exportMdBtn\.addEventListener\('click'/)
    assert.match(baseTemplateSource, /window\.print\(\)/)
    assert.match(baseTemplateSource, /FileReader\(\)/)
    assert.match(constantSource, /importMarkdown: 'Import markdown file'/)
    assert.match(constantSource, /exportPdf: 'Print or export PDF'/)
})

test('edit footer uses icon locks and share link opens in a new tab', () => {
    assert.match(commonTemplateSource, /class="toolbar-icon-button opt-pw/)
    assert.match(commonTemplateSource, /class="toolbar-icon-button opt-pw-view/)
    assert.match(commonTemplateSource, /id="share-open-link"/)
    assert.match(commonTemplateSource, /target="_blank"/)
    assert.match(baseTemplateSource, /const \$shareOpenLink = document\.querySelector\('#share-open-link'\);/)
    assert.match(baseTemplateSource, /recordShareHistory\('created', shareUrl, APP_STATE\.title\);/)
    assert.match(constantSource, /shareLinkTitle: 'Open shared page in a new tab'/)
    assert.match(constantSource, /editLockTitle: 'Edit lock'/)
})

test('footer uses icon-first controls for history and docs', () => {
    assert.match(commonTemplateSource, /id="share-history-btn" class="toolbar-icon-button share-history-trigger"/)
    assert.match(commonTemplateSource, /id="note-history-btn" class="toolbar-icon-button note-history-trigger"/)
    assert.match(commonTemplateSource, /class="sr-only">\$\{t\.recentSharesTitle\}<\/span>/)
    assert.match(commonTemplateSource, /class="sr-only">\$\{t\.historyTitle\}<\/span>/)
    assert.match(constantSource, /recentSharesTitle: 'Recent shares'/)
    assert.match(constantSource, /historyTitle: 'Version history'/)
})

test('share routes support short slugs while keeping legacy md5 compatibility', () => {
    assert.match(indexSource, /const SHARE_SLUG_LENGTH = 6/)
    assert.match(indexSource, /async function generateUniqueShareSlug\(\)/)
    assert.match(indexSource, /async function getShareIdForPath\(path, metadata = \{\}\)/)
    assert.match(indexSource, /return metadata\.shareSlug \|\| await MD5\(path\)/)
    assert.match(indexSource, /await getShareNamespace\(\)\.put\(legacyShareId, path\)/)
    assert.match(indexSource, /await getShareNamespace\(\)\.put\(metadata\.shareSlug, path\)/)
    assert.match(indexSource, /router\.get\('\/share\/:shareId'/)
    assert.match(indexSource, /router\.post\('\/share\/:shareId\/auth'/)
})

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
    assert.doesNotMatch(commonTemplateSource, /github\.com\/tbdavid2019\/cf-notepad\/blob\/main\/skills\/SKILL\.md/)
})

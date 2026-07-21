import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const indexSource = readFileSync(new URL('../src/index.js', import.meta.url), 'utf8')
const baseTemplateSource = readFileSync(new URL('../src/templates/base.js', import.meta.url), 'utf8')

test('share pages expose the WebTalk page ID without changing editor pages', () => {
    assert.match(indexSource, /return returnPage\('NeedPasswd', \{[\s\S]*shareId,/)
    assert.match(baseTemplateSource, /ext\.sharePath && shareId && !isEdit[\s\S]*meta name="webtalk-page-id"/)
    assert.match(indexSource, /webtalk: getWebtalkConfig\(\)/)
    assert.match(baseTemplateSource, /ext\.webtalk\?\.enabled && ext\.sharePath && shareId && !isEdit/)
    assert.match(baseTemplateSource, /<script\n\s+defer\n\s+src="\$\{escapeHtml\(ext\.webtalk\.scriptUrl\)\}"/)
    assert.match(baseTemplateSource, /src="\$\{escapeHtml\(ext\.webtalk\.scriptUrl\)\}"/)
    assert.match(baseTemplateSource, /data-webtalk-scope="\$\{escapeHtml\(ext\.webtalk\.scope\)\}"/)
    assert.match(baseTemplateSource, /data-webtalk-site-id="\$\{escapeHtml\(ext\.webtalk\.siteId\)\}"/)
    assert.match(baseTemplateSource, /data-webtalk-ai-endpoint="\$\{escapeHtml\(ext\.webtalk\.aiEndpoint\)\}"/)
    assert.match(baseTemplateSource, /\$\{webtalkScript\}/)
})

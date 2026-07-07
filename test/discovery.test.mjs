import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

import {
    AGENT_SKILL_MARKDOWN,
    AUTH_MD_MARKDOWN,
    applyDiscoveryHeaders,
    buildMarkdownDocument,
    buildAgentSkillsIndex,
    buildApiCatalog,
    buildRobotsTxt,
    requestAcceptsMarkdown,
} from '../src/discovery.mjs'

const indexSource = readFileSync(new URL('../src/index.js', import.meta.url), 'utf8')
const baseTemplateSource = readFileSync(new URL('../src/templates/base.js', import.meta.url), 'utf8')

test('robots.txt publishes explicit crawler rules for discovery and AI agents', () => {
    const robots = buildRobotsTxt()

    assert.match(robots, /User-agent: \*/)
    assert.match(robots, /Allow: \/\.well-known\/api-catalog/)
    assert.match(robots, /Allow: \/\.well-known\/agent-skills\//)
    assert.match(robots, /Content-Signal: ai-train=no, search=yes, ai-input=no/)
    assert.match(robots, /Disallow: \/api\//)
    assert.match(robots, /User-agent: GPTBot/)
    assert.match(robots, /User-agent: OAI-SearchBot/)
    assert.match(robots, /User-agent: Claude-Web/)
    assert.match(robots, /User-agent: Google-Extended/)
})

test('api catalog includes required API discovery relations', () => {
    const catalog = buildApiCatalog('https://example.com')
    const entry = catalog.linkset[0]

    assert.equal(entry.anchor, 'https://example.com/api')
    assert.equal(entry['service-desc'][0].href, 'https://example.com/openapi.json')
    assert.equal(entry['service-doc'][0].href, 'https://example.com/docs/api')
    assert.equal(entry.status[0].href, 'https://example.com/api/health')
})

test('agent skills index uses v0.2.0 schema and sha256 digests', async () => {
    const index = await buildAgentSkillsIndex()
    const skill = index.skills[0]

    assert.equal(index.$schema, 'https://schemas.agentskills.io/discovery/0.2.0/schema.json')
    assert.equal(skill.name, 'david888-wiki-publisher')
    assert.equal(skill.type, 'skill-md')
    assert.equal(skill.url, '/.well-known/agent-skills/david888-wiki-publisher/SKILL.md')
    assert.match(skill.digest, /^sha256:[0-9a-f]{64}$/)
    assert.match(AGENT_SKILL_MARKDOWN, /^---\nname: david888-wiki-publisher\n/m)
})

test('auth.md is published as markdown guidance for agents', () => {
    assert.match(AUTH_MD_MARKDOWN, /^# Auth/m)
    assert.match(AUTH_MD_MARKDOWN, /Protected note reads support/)
    assert.match(AUTH_MD_MARKDOWN, /does not currently offer OAuth client registration/i)
})

test('markdown negotiation helper only activates on text/markdown requests', () => {
    assert.equal(requestAcceptsMarkdown(new Request('https://example.com', {
        headers: { Accept: 'text/markdown, text/html;q=0.8' },
    })), true)

    assert.equal(requestAcceptsMarkdown(new Request('https://example.com', {
        headers: { Accept: 'text/html,application/xhtml+xml' },
    })), false)

    const markdown = buildMarkdownDocument('# Title', {
        title: 'Doc',
        canonical_url: 'https://example.com/doc',
    })

    assert.match(markdown, /^---\ntitle: "Doc"\ncanonical_url: "https:\/\/example.com\/doc"\n---\n\n# Title$/)
})

test('discovery headers expose api catalog and API docs links', () => {
    const headers = applyDiscoveryHeaders(new Headers())
    const values = headers.get('Link')

    assert.ok(values)
    assert.match(values, /rel="api-catalog"/)
    assert.match(values, /rel="service-doc"/)
    assert.match(values, /rel="service-desc"/)
})

test('worker registers discovery routes before dynamic note routes', () => {
    assert.match(indexSource, /router\.get\('\/robots\.txt'/)
    assert.match(indexSource, /router\.head\('\/robots\.txt'/)
    assert.match(indexSource, /router\.get\(API_CATALOG_PATH/)
    assert.match(indexSource, /router\.head\(API_CATALOG_PATH/)
    assert.match(indexSource, /router\.get\(API_DOCS_PATH/)
    assert.match(indexSource, /router\.head\(API_DOCS_PATH/)
    assert.match(indexSource, /router\.get\(AUTH_MD_PATH/)
    assert.match(indexSource, /router\.head\(AUTH_MD_PATH/)
    assert.match(indexSource, /router\.get\(OPENAPI_PATH/)
    assert.match(indexSource, /router\.head\(OPENAPI_PATH/)
    assert.match(indexSource, /router\.get\(API_HEALTH_PATH/)
    assert.match(indexSource, /router\.head\(API_HEALTH_PATH/)
    assert.match(indexSource, /router\.get\(AGENT_SKILLS_INDEX_PATH/)
    assert.match(indexSource, /router\.head\(AGENT_SKILLS_INDEX_PATH/)
    assert.match(indexSource, /router\.get\(AGENT_SKILL_PATH/)
    assert.match(indexSource, /router\.head\(AGENT_SKILL_PATH/)
    assert.match(indexSource, /router\.get\('\/\.well-known\/agent-skills\/:asset'/)
    assert.match(indexSource, /router\.get\('\/\.well-known\/agent-skills\/:skillName\/:fileName'/)
    assert.match(indexSource, /const headers = new Headers\(response\.headers\)/)
    assert.match(indexSource, /applyDiscoveryHeaders\(headers\)/)
    assert.match(indexSource, /requestAcceptsMarkdown\(request\)/)
})

test('base template registers a guarded WebMCP context', () => {
    assert.match(baseTemplateSource, /const initWebMcp = \(\) => \{/)
    assert.match(baseTemplateSource, /navigator\.modelContext && navigator\.modelContext\.provideContext/)
    assert.match(baseTemplateSource, /name: 'read-current-markdown'/)
    assert.match(baseTemplateSource, /name: 'copy-share-link'/)
    assert.match(baseTemplateSource, /name: 'open-presentation'/)
    assert.match(baseTemplateSource, /provideContext\.call\(navigator\.modelContext, \{ tools \}\)/)
})

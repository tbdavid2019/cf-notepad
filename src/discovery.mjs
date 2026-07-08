import { AGENT_SKILL_MARKDOWN } from './generated/agent-skill.generated.mjs'
import { API_DOCS_MARKDOWN } from './generated/api-docs.generated.mjs'

export { AGENT_SKILL_MARKDOWN }
export { API_DOCS_MARKDOWN }

const AGENT_SKILL_NAME = 'david888-wiki-publisher'
const AGENT_SKILL_PATH = `/.well-known/agent-skills/${AGENT_SKILL_NAME}/SKILL.md`
const API_CATALOG_PATH = '/.well-known/api-catalog'
const API_DOCS_PATH = '/docs/api'
const AUTH_MD_PATH = '/auth.md'
const OPENAPI_PATH = '/openapi.json'
const API_HEALTH_PATH = '/api/health'
const AGENT_SKILLS_INDEX_PATH = '/.well-known/agent-skills/index.json'
const SITEMAP_PATH = '/sitemap.xml'
const AGENT_SKILLS_SCHEMA = 'https://schemas.agentskills.io/discovery/0.2.0/schema.json'
const API_CATALOG_PROFILE = 'https://www.rfc-editor.org/info/rfc9727'

export const AUTH_MD_MARKDOWN = `# Auth

This service exposes note publishing and reading APIs for agents.

## Supported Access Modes

- Public note APIs can be used without OAuth when the target note is not password-protected.
- Protected note reads support \`Authorization: Bearer <password>\` or \`?pw=<password>\`.
- Protected note edits use the same note-level password model.

## Current Limitations

- This domain does not currently offer OAuth client registration for agents.
- This domain does not currently publish OpenID Connect or OAuth authorization server metadata for agent login flows.
- Access control is note-scoped and password-based rather than tenant-wide OAuth.

## Discovery Links

- API catalog: \`/.well-known/api-catalog\`
- API docs: \`/docs/api\`
- OpenAPI description: \`/openapi.json\`
- Agent skill: \`/.well-known/agent-skills/david888-wiki-publisher/SKILL.md\`

## Practical Guidance

- Use public share URLs for human-facing read-only access.
- Use the REST API for agent writes and reads.
- If a protected note returns \`401\` or \`403\`, request the note password from the user.
`

export function getDiscoveryLinks() {
    return [
        { href: API_CATALOG_PATH, rel: 'api-catalog' },
        { href: API_DOCS_PATH, rel: 'service-doc', type: 'text/markdown' },
        { href: OPENAPI_PATH, rel: 'service-desc', type: 'application/openapi+json' },
    ]
}

export function applyDiscoveryHeaders(headers) {
    for (const link of getDiscoveryLinks()) {
        const params = [`<${link.href}>`, `rel="${link.rel}"`]
        if (link.type) params.push(`type="${link.type}"`)
        headers.append('Link', params.join('; '))
    }
    return headers
}

function escapeXml(value) {
    return String(value)
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&apos;')
}

export function buildSitemapXml(entries = []) {
    const urls = entries.map(({ loc, lastmod }) => [
        '  <url>',
        `    <loc>${escapeXml(loc)}</loc>`,
        lastmod ? `    <lastmod>${escapeXml(lastmod)}</lastmod>` : null,
        '  </url>',
    ].filter(Boolean).join('\n')).join('\n')

    return [
        '<?xml version="1.0" encoding="UTF-8"?>',
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
        urls,
        '</urlset>',
    ].filter(Boolean).join('\n')
}

export function buildRobotsTxt(origin = '') {
    const sitemapUrl = origin ? `${origin}${SITEMAP_PATH}` : SITEMAP_PATH

    return [
        `Sitemap: ${sitemapUrl}`,
        'User-agent: *',
        'Content-Signal: ai-train=no, search=yes, ai-input=no',
        'Allow: /.well-known/api-catalog',
        'Allow: /.well-known/agent-skills/',
        'Allow: /auth.md',
        'Allow: /docs/api',
        'Allow: /openapi.json',
        'Allow: /api/health',
        'Allow: /sitemap.xml',
        'Allow: /share/',
        'Disallow: /api/',
        'Disallow: /upload',
        '',
        'User-agent: GPTBot',
        'Content-Signal: ai-train=no, search=yes, ai-input=no',
        'Allow: /share/',
        'Allow: /.well-known/api-catalog',
        'Allow: /.well-known/agent-skills/',
        'Allow: /auth.md',
        'Allow: /docs/api',
        'Allow: /openapi.json',
        'Allow: /api/health',
        'Allow: /sitemap.xml',
        'Disallow: /api/',
        'Disallow: /',
        '',
        'User-agent: OAI-SearchBot',
        'Content-Signal: ai-train=no, search=yes, ai-input=no',
        'Allow: /share/',
        'Allow: /.well-known/api-catalog',
        'Allow: /auth.md',
        'Allow: /docs/api',
        'Allow: /openapi.json',
        'Allow: /api/health',
        'Allow: /sitemap.xml',
        'Disallow: /api/',
        'Disallow: /',
        '',
        'User-agent: Claude-Web',
        'Content-Signal: ai-train=no, search=yes, ai-input=no',
        'Allow: /share/',
        'Allow: /.well-known/api-catalog',
        'Allow: /.well-known/agent-skills/',
        'Allow: /auth.md',
        'Allow: /docs/api',
        'Allow: /openapi.json',
        'Allow: /api/health',
        'Allow: /sitemap.xml',
        'Disallow: /api/',
        'Disallow: /',
        '',
        'User-agent: Google-Extended',
        'Content-Signal: ai-train=no, search=yes, ai-input=no',
        'Allow: /share/',
        'Allow: /.well-known/api-catalog',
        'Allow: /auth.md',
        'Allow: /docs/api',
        'Allow: /openapi.json',
        'Allow: /api/health',
        'Allow: /sitemap.xml',
        'Disallow: /api/',
        'Disallow: /',
        '',
    ].join('\n')
}

export function buildOpenApiDocument(origin) {
    return {
        openapi: '3.1.0',
        info: {
            title: 'CF Notepad API',
            version: '1.0.0',
            description: 'Markdown note publishing API for reading, writing, uploads, and optional note history.',
        },
        servers: [
            { url: origin },
        ],
        paths: {
            '/api/{path}': {
                get: {
                    summary: 'Read a note',
                    parameters: [
                        {
                            name: 'path',
                            in: 'path',
                            required: true,
                            schema: { type: 'string' },
                        },
                    ],
                    responses: {
                        '200': {
                            description: 'Note content or JSON metadata.',
                        },
                    },
                },
                post: {
                    summary: 'Create, overwrite, or append a note',
                    parameters: [
                        {
                            name: 'path',
                            in: 'path',
                            required: true,
                            schema: { type: 'string' },
                        },
                    ],
                    responses: {
                        '200': {
                            description: 'Save result with edit and share URLs.',
                        },
                    },
                },
            },
            '/api/upload': {
                post: {
                    summary: 'Upload an image when R2 uploads are enabled',
                    responses: {
                        '200': {
                            description: 'Uploaded image URL.',
                        },
                    },
                },
            },
            '/api/{path}/history': {
                get: {
                    summary: 'List saved note history versions',
                    parameters: [
                        {
                            name: 'path',
                            in: 'path',
                            required: true,
                            schema: { type: 'string' },
                        },
                    ],
                    responses: {
                        '200': {
                            description: 'History version summaries.',
                        },
                    },
                },
            },
            '/api/{path}/history/{versionId}': {
                get: {
                    summary: 'Read one saved history version',
                    parameters: [
                        {
                            name: 'path',
                            in: 'path',
                            required: true,
                            schema: { type: 'string' },
                        },
                        {
                            name: 'versionId',
                            in: 'path',
                            required: true,
                            schema: { type: 'integer' },
                        },
                    ],
                    responses: {
                        '200': {
                            description: 'Historical note content.',
                        },
                    },
                },
            },
            '/api/{path}/history/{versionId}/restore': {
                post: {
                    summary: 'Restore one saved history version',
                    parameters: [
                        {
                            name: 'path',
                            in: 'path',
                            required: true,
                            schema: { type: 'string' },
                        },
                        {
                            name: 'versionId',
                            in: 'path',
                            required: true,
                            schema: { type: 'integer' },
                        },
                    ],
                    responses: {
                        '200': {
                            description: 'Restore result.',
                        },
                    },
                },
            },
            [API_HEALTH_PATH]: {
                get: {
                    summary: 'Health check',
                    responses: {
                        '200': {
                            description: 'Worker health response.',
                        },
                    },
                },
            },
        },
    }
}

export function requestAcceptsMarkdown(request) {
    const accept = String(request.headers.get('Accept') || '').toLowerCase()
    return accept.includes('text/markdown')
}

function yamlScalar(value) {
    return JSON.stringify(String(value || ''))
}

export function buildMarkdownDocument(markdown, metadata = {}) {
    const fields = Object.entries(metadata).filter(([, value]) => value !== undefined && value !== null && value !== '')
    if (fields.length === 0) return String(markdown || '')

    const frontmatter = fields
        .map(([key, value]) => `${key}: ${yamlScalar(value)}`)
        .join('\n')

    return `---\n${frontmatter}\n---\n\n${String(markdown || '')}`
}

export function createMarkdownResponse(markdown, extraHeaders = {}) {
    return createDiscoveryResponse(
        markdown,
        'text/markdown; charset=UTF-8',
        extraHeaders,
    )
}

export function buildApiCatalog(origin) {
    return {
        linkset: [
            {
                anchor: `${origin}/api`,
                item: [
                    {
                        href: `${origin}/api/{path}`,
                    },
                ],
                'service-desc': [
                    {
                        href: `${origin}${OPENAPI_PATH}`,
                        type: 'application/openapi+json',
                    },
                ],
                'service-doc': [
                    {
                        href: `${origin}${API_DOCS_PATH}`,
                        type: 'text/markdown',
                    },
                ],
                status: [
                    {
                        href: `${origin}${API_HEALTH_PATH}`,
                        type: 'application/json',
                    },
                ],
            },
        ],
    }
}

async function sha256Hex(input) {
    const bytes = new TextEncoder().encode(input)
    const digest = await crypto.subtle.digest('SHA-256', bytes)
    return Array.from(new Uint8Array(digest), byte => byte.toString(16).padStart(2, '0')).join('')
}

export async function buildAgentSkillsIndex() {
    return {
        $schema: AGENT_SKILLS_SCHEMA,
        skills: [
            {
                name: AGENT_SKILL_NAME,
                type: 'skill-md',
                description: 'Publish, read, and append markdown content directly to the David888 Wiki using its REST API.',
                url: AGENT_SKILL_PATH,
                digest: `sha256:${await sha256Hex(AGENT_SKILL_MARKDOWN)}`,
            },
        ],
    }
}

export function createDiscoveryResponse(body, contentType, extraHeaders = {}) {
    const headers = new Headers({
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=3600',
        ...extraHeaders,
    })
    applyDiscoveryHeaders(headers)
    return new Response(body, { headers })
}

export function getDiscoveryConstants() {
    return {
        AGENT_SKILL_PATH,
        AGENT_SKILLS_INDEX_PATH,
        API_CATALOG_PATH,
        API_CATALOG_PROFILE,
        API_DOCS_PATH,
        AUTH_MD_PATH,
        API_HEALTH_PATH,
        OPENAPI_PATH,
        SITEMAP_PATH,
    }
}

const AGENT_SKILL_NAME = 'david888-wiki-publisher'
const AGENT_SKILL_PATH = `/.well-known/agent-skills/${AGENT_SKILL_NAME}/SKILL.md`
const API_CATALOG_PATH = '/.well-known/api-catalog'
const API_DOCS_PATH = '/docs/api'
const AUTH_MD_PATH = '/auth.md'
const OPENAPI_PATH = '/openapi.json'
const API_HEALTH_PATH = '/api/health'
const AGENT_SKILLS_INDEX_PATH = '/.well-known/agent-skills/index.json'
const AGENT_SKILLS_SCHEMA = 'https://schemas.agentskills.io/discovery/0.2.0/schema.json'
const API_CATALOG_PROFILE = 'https://www.rfc-editor.org/info/rfc9727'

export const AGENT_SKILL_MARKDOWN = `---
name: david888-wiki-publisher
description: Publish, read, and append markdown content directly to the David888 Wiki using its REST API. Use when asked to write a report, save text, upload images, or read from wiki.david888.com.
---

# David888 Wiki Publisher Skill

You have the ability to read, write, and append markdown content natively to \`wiki.david888.com\` using HTTP requests (cURL or Python requests).

**API Base URL**: \`https://wiki.david888.com/api\`

## Quick Start Guide

### 1. Read a Wiki Page (GET)
\`\`\`bash
curl -X GET "https://wiki.david888.com/api/<path>"
\`\`\`
*If protected, use \`?pw=<password>\` or \`Authorization: Bearer <password>\`.*

### 2. Create/Overwrite a Page (POST)
\`\`\`bash
curl -X POST "https://wiki.david888.com/api/<path>" \\
  -H "Content-Type: application/json" \\
  -d '{
    "text": "# Title\\nContent",
    "public": true,
    "theme": "retro"
  }'
\`\`\`
### 2.1 Upload a Full Markdown File Directly
If you already have a local \`.md\` file, prefer raw markdown upload instead of embedding the whole document inside JSON.

\`\`\`bash
curl -X POST "https://wiki.david888.com/api/<path>?public=true&theme=retro" \\
  -H "Content-Type: text/markdown; charset=UTF-8" \\
  --data-binary @article.md
\`\`\`

This is safer for long markdown because it avoids JSON escaping problems.

### 2.2 Multipart Markdown File Upload
\`\`\`bash
curl -X POST "https://wiki.david888.com/api/<path>" \\
  -F "file=@article.md;type=text/markdown" \\
  -F "public=true" \\
  -F "theme=retro"
\`\`\`

Use form fields \`append\`, \`public\`, \`share\`, \`theme\`, \`pw\`, and \`vpw\` when needed.

### 2.3 Available Themes
Choose a theme to wow the user: \`ayu-light\`, \`bauhaus\`, \`botanical\`, \`catppuccin-latte\`, \`catppuccin-macchiato\`, \`green-simple\`, \`kanagawa\`, \`maximalism\`, \`neo-brutalism\`, \`newsprint\`, \`organic\`, \`playful-geometric\`, \`professional\`, \`retro\`, \`sketch\`, \`terminal\`, \`tokyo-night\`.
> [!IMPORTANT]
> **CRITICAL: READ THE RESPONSE CAREFULLY!**
> The response contains TWO URLs:
> 1. \`url\`: This is the **internal edit URL**. It always points to the same path. **DO NOT GIVE THIS TO THE USER.**
> 2. \`shareUrl\`: This is the **public read-only URL**. It uses a hash (e.g., \`/share/abc123\`).
>
> **YOU MUST ALWAYS GIVE THE \`shareUrl\` TO THE USER.** If you give the \`url\`, the user will likely see an empty or error page.
>
> If the content is intended to be viewed as slides, you may also derive a presentation link by appending \`/present\` to \`shareUrl\`.
> Example: \`https://wiki.david888.com/share/abc123/present#/2\`
> Use the Reveal hash suffix to point to a specific slide when useful.

### 3. Append to a Page (POST)
\`\`\`bash
curl -X POST "https://wiki.david888.com/api/<path>" \\
  -H "Content-Type: application/json" \\
  -d '{ "text": "\\n\\n## Update\\n...", "append": true }'
\`\`\`

If appending from a local markdown file, use:
\`\`\`bash
curl -X POST "https://wiki.david888.com/api/<path>?append=true" \\
  -H "Content-Type: text/markdown; charset=UTF-8" \\
  --data-binary @update.md
\`\`\`

## Common Scenarios & Templates

### A. Saving a Research Report
**Action**: Create a new path (e.g., \`report-2024-03\`) and POST the content.
**Prompt for self**: "I will save this report to the wiki at path \`report-2024-03\` so the user can share it."

### A.1 Large Context / Skill Files
If the material is a long source document such as \`SKILL.md\`, API docs, logs, or raw context exports, do **not** paste the full file into the wiki by default.

Use this pattern instead:
- Write a concise summary of the important points.
- Include the original repo path, local path, or canonical URL.
- Only publish the full raw text when the human explicitly asks for a full mirror/copy.

Example:
\`\`\`md
# Skill Summary
- Purpose: publish markdown to the wiki API
- Key rule: return \`shareUrl\`, not \`url\`

# Source
- Repo path: \`skills/SKILL.md\`
\`\`\`

### B. Appending to a Task Log
**Action**: Use \`append: true\` to avoid reading large history.
**Prompt for self**: "I'll append this status update to the \`task-log\` instead of overwriting."

### C. Handling Local Images
1. **Upload**: \`curl -X POST "https://wiki.david888.com/api/upload" -F "image=@/local/path.png"\`
2. **Replace**: Extract the returned URL and replace \`/local/path.png\` in your markdown.
3. **Publish**: POST the final markdown.

## Auth Rules
- **Edit Password (\`pw\`)**: Required to overwrite an existing protected page.
- **View Password (\`vpw\`)**: Required to GET a protected page.
- If you get a **401/403**, ask the user: "This page is protected, please provide the password."

## Troubleshooting
- **Error 1101**: A server-side exception occurred. I have added logging; check the returned JSON \`msg\` for the stack trace or error details.
- **500 on a very long article/context dump**: Treat this as a payload-size or backend-runtime risk, even if auth is correct. The pragmatic fallback is to publish a concise summary plus the original file path/URL instead of embedding the entire long source document.
- **Markdown with lots of quotes / backslashes / code fences keeps failing in curl**: Prefer \`Content-Type: text/markdown\` with \`--data-binary @file.md\`, or multipart \`-F "file=@file.md"\`, instead of wrapping the full markdown inside JSON.
- **The URL is always the same / IP Restriction?**: No! The \`url\` field is the *permanent edit link* for that path. If you see the same URL, it means you successfully updated the same page. This is NOT an IP block. **Always check the \`shareUrl\` for the unique view link.**
- **Missing \`shareUrl\`**: Ensure you are looking at the \`.data.shareUrl\` field in the JSON response.
- **Need a slideshow link?**: If the page is slide-oriented, derive it from \`shareUrl + '/present'\`. For a specific slide, append a Reveal hash like \`#/2\`.
`

export const API_DOCS_MARKDOWN = `# API Documentation

This site exposes a simple markdown publishing API for agents and scripts.

## Endpoints

- \`GET /api/:path\`: read note content as markdown. Protected notes require \`Authorization: Bearer <password>\` or \`?pw=<password>\`.
- \`GET /api/:path?format=json\`: read note content plus safe metadata.
- \`POST /api/:path\`: create, overwrite, or append note content using \`application/json\`, \`text/markdown\`, \`text/plain\`, or \`multipart/form-data\`.
- \`POST /api/upload\`: upload an image file when R2 uploads are enabled.
- \`GET /api/:path/history\`, \`GET /api/:path/history/:versionId\`, \`POST /api/:path/history/:versionId/restore\`: optional note-history endpoints for edit-authorized callers.

## Request Body

For \`POST /api/:path\`, the main fields are:

- \`text\`: markdown content to write.
- \`append\`: when \`true\`, append instead of overwrite.
- \`share\` or \`public\`: control whether a public share URL is created.
- \`theme\`: choose a bundled share theme.
- \`pw\`: edit password.
- \`vpw\`: view password.

## Response Notes

Successful writes return both:

- \`url\`: the edit URL.
- \`shareUrl\`: the public read-only URL.

Agents should return \`shareUrl\` to humans when public viewing is intended.
`

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

export function buildRobotsTxt() {
    return [
        'User-agent: *',
        'Content-Signal: ai-train=no, search=yes, ai-input=no',
        'Allow: /.well-known/api-catalog',
        'Allow: /.well-known/agent-skills/',
        'Allow: /auth.md',
        'Allow: /docs/api',
        'Allow: /openapi.json',
        'Allow: /api/health',
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
    }
}

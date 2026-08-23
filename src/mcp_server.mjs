import dayjs from 'dayjs'
import { driverQueryNote, driverPutNote, driverQueryShare, driverPutShare } from './storage_driver.mjs'
import { renderMarkdownToHtml, extractMarkdownData, lintMarkdownText } from './markdown-processor.mjs'
import { getNoteStatsDb, getNoteViewCount } from './note_stats.mjs'
import { resolvePasswordRole } from './password_policy.mjs'
import { DEFAULT_PREVIEW_WIDTH, normalizePreviewWidth } from './constant.js'
import { canPersistNoteContent } from './save_policy.mjs'
import { getNoteHistoryConfig, saveNoteHistoryVersionIfNeeded } from './note_history.mjs'
import { AGENT_SKILL_MARKDOWN } from './generated/agent-skill.generated.mjs'

export const MCP_SERVER_INFO = {
    name: 'david888-wiki',
    version: '1.0.0',
    protocolVersion: '2024-11-05',
    description: 'David888 Wiki native MCP Server. Supports Markdown publishing, 2D slide decks (---/--), dual-pane Book Mode (/book), and rich formatting. When composing multi-article books, 2D presentations, or advanced layouts, call "get_authoring_skill_guide" or fetch "https://wiki.david888.com/.well-known/agent-skills/david888-wiki-publisher/SKILL.md" for the complete authoring SOP.',
}

export const MCP_TOOLS_DEFINITIONS = [
    {
        name: 'get_authoring_skill_guide',
        description: 'Retrieve the complete David888 Wiki authoring guide and multi-article Book Orchestration SOP (Markdown formatting, 2D slide decks, Book Mode /book, KaTeX, citations, themes) from SKILL.md.',
        inputSchema: {
            type: 'object',
            properties: {},
            additionalProperties: false,
        },
    },
    {
        name: 'read_note',
        description: 'Retrieve the markdown content and metadata of a note from David888 Wiki / Cloud Notepad.',
        inputSchema: {
            type: 'object',
            properties: {
                path: {
                    type: 'string',
                    description: 'The unique slug/path of the note (e.g. "my-project-note" or "meeting-summary").',
                },
                password: {
                    type: 'string',
                    description: 'Optional View Lock or Edit Lock password if the note is password-protected.',
                },
            },
            required: ['path'],
        },
    },
    {
        name: 'write_note',
        description: 'Create or overwrite a markdown note on David888 Wiki / Cloud Notepad. Returns both the edit URL and the public Share URL. Supports 2D slide presentations ("---"/"--") and Book Mode ("/book"). For the multi-chapter Book Orchestration SOP, call "get_authoring_skill_guide".',
        inputSchema: {
            type: 'object',
            properties: {
                path: {
                    type: 'string',
                    description: 'The unique slug/path for the note (kebab-case recommended).',
                },
                text: {
                    type: 'string',
                    description: 'The complete markdown content to write.',
                },
                password: {
                    type: 'string',
                    description: 'Optional Edit Lock password. Required if the note already has an edit password.',
                },
                view_password: {
                    type: 'string',
                    description: 'Optional View Lock password to restrict reader access.',
                },
                make_private: {
                    type: 'boolean',
                    description: 'Set to true to disable public sharing (default: false / public).',
                },
                theme: {
                    type: 'string',
                    description: 'Optional visual theme (e.g., "claude-canvas", "retro", "notion-clean", "terminal").',
                },
                width: {
                    type: 'string',
                    description: 'Optional layout width: "100%", "960px", "1200px", or "1440px" (default: "1200px").',
                },
            },
            required: ['path', 'text'],
        },
    },
    {
        name: 'append_note',
        description: 'Append markdown content to the bottom of an existing note on David888 Wiki / Cloud Notepad.',
        inputSchema: {
            type: 'object',
            properties: {
                path: {
                    type: 'string',
                    description: 'The slug/path of the note.',
                },
                text: {
                    type: 'string',
                    description: 'New markdown text to append to the bottom of the article.',
                },
                password: {
                    type: 'string',
                    description: 'Optional Edit Lock credential if the note is protected.',
                },
            },
            required: ['path', 'text'],
        },
    },
    {
        name: 'render_markdown',
        description: 'Render raw markdown text into styled HTML with custom typography and themes.',
        inputSchema: {
            type: 'object',
            properties: {
                markdown: {
                    type: 'string',
                    description: 'The raw markdown content to render.',
                },
                theme: {
                    type: 'string',
                    description: 'Optional theme name (default: "claude-canvas").',
                },
                title: {
                    type: 'string',
                    description: 'Optional document title.',
                },
            },
            required: ['markdown'],
        },
    },
    {
        name: 'lint_markdown',
        description: 'Validate and auto-fix markdown syntax issues such as unclosed code fences, missing spaces after headings, and broken diagram syntax.',
        inputSchema: {
            type: 'object',
            properties: {
                markdown: {
                    type: 'string',
                    description: 'The markdown text to validate and fix.',
                },
            },
            required: ['markdown'],
        },
    },
    {
        name: 'extract_markdown_meta',
        description: 'Extract document title, heading hierarchy, links, plain text, and word count / reading time statistics from markdown.',
        inputSchema: {
            type: 'object',
            properties: {
                markdown: {
                    type: 'string',
                    description: 'The markdown content to analyze.',
                },
            },
            required: ['markdown'],
        },
    },
    {
        name: 'get_view_stats',
        description: 'Retrieve unique visitor count and statistics for a published note path on David888 Wiki.',
        inputSchema: {
            type: 'object',
            properties: {
                path: {
                    type: 'string',
                    description: 'The note path/slug.',
                },
            },
            required: ['path'],
        },
    },
    {
        name: 'get_api_catalog',
        description: 'Retrieve machine-readable API catalog, skill specifications, and discovery endpoints for David888 Wiki.',
        inputSchema: {
            type: 'object',
            properties: {},
        },
    },
]

const CORS_HEADERS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS, HEAD',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, Accept, X-Requested-With',
    'Access-Control-Max-Age': '86400',
}

export const genRandomStr = (n = 4) => {
    const charset = '2345679abcdefghjkmnpqrstwxyz'
    return Array(n)
        .join()
        .split(',')
        .map(() => charset.charAt(Math.floor(Math.random() * charset.length)))
        .join('')
}

async function md5Hex(str) {
    const input = String(str || '')
    try {
        if (typeof crypto !== 'undefined' && crypto.subtle) {
            const msgUint8 = new TextEncoder().encode(input)
            const hashBuffer = await crypto.subtle.digest('MD5', msgUint8)
            const hashArray = Array.from(new Uint8Array(hashBuffer))
            return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
        }
    } catch (_) {}
    try {
        const mod = 'node:' + 'crypto'
        const nodeCrypto = await import(/* webpackIgnore: true */ mod)
        return nodeCrypto.createHash('md5').update(input).digest('hex')
    } catch (_) {}
    return ''
}

async function saltPassword(password) {
    const salt = globalThis.SCN_SALT || ''
    const hashPw = await md5Hex(password)
    return await md5Hex(`${hashPw}+${salt}`)
}

async function checkPasswordMatch(password, storedHash) {
    if (!storedHash) return false
    const current = await saltPassword(password)
    if (storedHash === current) return true
    const legacy = await md5Hex(`${await md5Hex(password)}+undefined`)
    return storedHash === legacy
}

async function checkPasswordRole(password, metadata) {
    return resolvePasswordRole(password, metadata, checkPasswordMatch)
}

function createJsonResponse(data, status = 200) {
    return new Response(JSON.stringify(data), {
        status,
        headers: {
            'Content-Type': 'application/json; charset=UTF-8',
            'Cache-Control': 'no-store',
            ...CORS_HEADERS,
        },
    })
}

async function ensureMcpShareMetadata(path, metadata = {}) {
    if (metadata?.share !== true) return { ...metadata }
    const existingSlug = metadata?.shareSlug || metadata?.shareId
    if (existingSlug) {
        return {
            ...metadata,
            shareSlug: existingSlug,
            shareId: existingSlug,
        }
    }
    let attempts = 0
    let candidate = ''
    while (attempts < 8) {
        const gen = genRandomStr(6)
        const existing = await driverQueryShare(gen)
        if (!existing || existing === path) {
            candidate = gen
            break
        }
        attempts += 1
    }
    if (!candidate) {
        candidate = `${path}-${Date.now().toString(36).slice(-4)}`
    }
    return {
        ...metadata,
        shareSlug: candidate,
        shareId: candidate,
    }
}

async function persistMcpNote({ path, content, metadata, previousContent }) {
    await driverPutNote(path, content, metadata)

    if (metadata.share === true) {
        const legacyShareId = await md5Hex(path)
        if (legacyShareId) {
            await driverPutShare(legacyShareId, path)
        }
        if (metadata.shareSlug) {
            await driverPutShare(metadata.shareSlug, path)
        }
        if (metadata.shareId && metadata.shareId !== metadata.shareSlug) {
            await driverPutShare(metadata.shareId, path)
        }
    }

    const historyConfig = getNoteHistoryConfig()
    if (historyConfig.enabled && historyConfig.db) {
        try {
            await saveNoteHistoryVersionIfNeeded({
                db: historyConfig.db,
                enabled: historyConfig.enabled,
                limit: historyConfig.limit,
                minIntervalSeconds: historyConfig.minIntervalSeconds,
                path,
                previousContent,
                nextContent: content,
                nowSeconds: dayjs().unix(),
            })
        } catch (err) {
            console.error(`[MCP] Note history save failed for ${path}:`, err?.message || err)
        }
    }
}

async function executeMcpTool(name, args = {}, requestUrl) {
    const origin = requestUrl ? `${requestUrl.protocol}//${requestUrl.host}` : 'https://wiki.david888.com'

    switch (name) {
        case 'get_authoring_skill_guide': {
            return {
                isError: false,
                text: AGENT_SKILL_MARKDOWN,
            }
        }

        case 'read_note': {
            const path = String(args.path || '').trim()
            if (!path) {
                return { isError: true, text: 'Error: "path" parameter is required.' }
            }
            const { value, metadata } = await driverQueryNote(path)
            if (value === null && (!metadata || Object.keys(metadata).length === 0)) {
                return { isError: true, text: `Error: Note "${path}" not found.` }
            }

            // Check passwords if protected
            if (metadata.pw || metadata.vpw) {
                const password = args.password || ''
                let authorized = false
                if (metadata.pw && await checkPasswordMatch(password, metadata.pw)) authorized = true
                if (metadata.vpw && await checkPasswordMatch(password, metadata.vpw)) authorized = true

                if (!authorized) {
                    return {
                        isError: true,
                        text: `Error: Password required to access protected note "${path}". Please provide the "password" argument.`,
                    }
                }
            }

            const shareSlug = metadata.share && (metadata.shareSlug || metadata.shareId)
            const shareUrl = shareSlug ? `${origin}/share/${shareSlug}` : null
            let responseText = value || ''
            if (shareUrl) {
                responseText += `\n\n---\n*Share URL:* ${shareUrl}`
            }
            return { isError: false, text: responseText }
        }

        case 'write_note': {
            const path = String(args.path || '').trim()
            const text = typeof args.text === 'string' ? args.text : ''
            if (!path) {
                return { isError: true, text: 'Error: "path" parameter is required.' }
            }

            const { value: prevValue, metadata: prevMeta } = await driverQueryNote(path)
            const metadata = prevMeta || {}

            // Check edit permission if note has an existing lock
            if (metadata.pw || metadata.vpw) {
                const password = args.password || ''
                const role = await checkPasswordRole(password, metadata)
                if (role !== 'edit') {
                    return {
                        isError: true,
                        text: `Error: Edit password required to modify note "${path}". Please provide a valid "password" argument.`,
                    }
                }
            }

            let nextMetadata = {
                ...metadata,
                updateAt: dayjs().unix(),
                share: args.make_private !== true,
                theme: args.theme || metadata.theme || 'claude-canvas',
                width: normalizePreviewWidth(args.width, metadata.width || DEFAULT_PREVIEW_WIDTH),
            }

            if (args.password) {
                nextMetadata.pw = await saltPassword(args.password)
            }
            if (args.view_password) {
                nextMetadata.vpw = await saltPassword(args.view_password)
            }

            if (nextMetadata.share === true && metadata.share !== true) {
                nextMetadata.annotationsEnabled = true
            }
            if (nextMetadata.share === false) {
                nextMetadata.publicIndex = false
                nextMetadata.annotationsEnabled = false
            }

            nextMetadata = await ensureMcpShareMetadata(path, nextMetadata)

            if (!canPersistNoteContent(nextMetadata)) {
                return { isError: true, text: 'Error: Note saving is currently blocked by server policy.' }
            }

            await persistMcpNote({
                path,
                content: text,
                metadata: nextMetadata,
                previousContent: prevValue,
            })

            const editUrl = `${origin}/${path}`
            const shareSlug = nextMetadata.share && (nextMetadata.shareSlug || nextMetadata.shareId)
            const shareUrl = shareSlug ? `${origin}/share/${shareSlug}` : null
            const hasSlideDividers = /(?:^|\n)(?:---|--)\s*(?:\n|$)/.test(text)
            const hasChapterLinks = /(?:^|\n)\s*(?:[-*+]|\d+\.)\s*\[.+?\]\((?:https?:\/\/|\/|\w).+?\)/.test(text)

            let resText = `Successfully saved note "${path}"!\n`
            if (shareUrl) {
                resText += `Public Share URL: ${shareUrl} (Give this link to readers)\n`
                if (hasChapterLinks) {
                    resText += `Book Mode: ${shareUrl}/book (Dual-pane TOC eBook)\n`
                }
                if (hasSlideDividers) {
                    resText += `Presentation Mode: ${shareUrl}/present (2D Slide Deck)\n`
                }
            }
            resText += `Edit URL: ${editUrl}`

            return { isError: false, text: resText }
        }

        case 'append_note': {
            const path = String(args.path || '').trim()
            const text = typeof args.text === 'string' ? args.text : ''
            if (!path) {
                return { isError: true, text: 'Error: "path" parameter is required.' }
            }
            if (!text) {
                return { isError: true, text: 'Error: "text" parameter is required.' }
            }

            const { value: prevValue, metadata: prevMeta } = await driverQueryNote(path)
            const metadata = prevMeta || {}

            if (metadata.pw || metadata.vpw) {
                const password = args.password || ''
                const role = await checkPasswordRole(password, metadata)
                if (role !== 'edit') {
                    return {
                        isError: true,
                        text: `Error: Edit password required to append to note "${path}".`,
                    }
                }
            }

            const newContent = prevValue ? `${prevValue}\n\n${text}` : text
            let nextMetadata = {
                ...metadata,
                updateAt: dayjs().unix(),
                share: metadata.share !== false,
            }
            nextMetadata = await ensureMcpShareMetadata(path, nextMetadata)

            await persistMcpNote({
                path,
                content: newContent,
                metadata: nextMetadata,
                previousContent: prevValue,
            })

            const shareSlug = nextMetadata.share && (nextMetadata.shareSlug || nextMetadata.shareId)
            const shareUrl = shareSlug ? `${origin}/share/${shareSlug}` : null
            let resText = `Successfully appended to note "${path}".\n`
            if (shareUrl) {
                resText += `Share URL: ${shareUrl}`
            }
            return { isError: false, text: resText }
        }

        case 'render_markdown': {
            const markdown = typeof args.markdown === 'string' ? args.markdown : ''
            const theme = args.theme || 'claude-canvas'
            const title = args.title || 'Document'
            const rendered = renderMarkdownToHtml(markdown, { theme, title, fullHtml: false })
            const html = typeof rendered === 'string' ? rendered : (rendered?.html || '')
            return { isError: false, text: html }
        }

        case 'lint_markdown': {
            const markdown = typeof args.markdown === 'string' ? args.markdown : ''
            const result = lintMarkdownText(markdown)
            return { isError: false, text: JSON.stringify(result, null, 2) }
        }

        case 'extract_markdown_meta': {
            const markdown = typeof args.markdown === 'string' ? args.markdown : ''
            const data = extractMarkdownData(markdown)
            return { isError: false, text: JSON.stringify(data, null, 2) }
        }

        case 'get_view_stats': {
            const path = String(args.path || '').trim()
            if (!path) {
                return { isError: true, text: 'Error: "path" parameter is required.' }
            }
            const db = getNoteStatsDb()
            const viewCount = await getNoteViewCount(db, path)
            return {
                isError: false,
                text: JSON.stringify({ path, uniqueViews: viewCount }, null, 2),
            }
        }

        case 'get_api_catalog': {
            const catalog = {
                name: 'David888 Wiki (Cloud Notepad)',
                mcpEndpoint: `${origin}/mcp`,
                skillDoc: `${origin}/.well-known/agent-skills/david888-wiki-publisher/SKILL.md`,
                llmsTxt: `${origin}/llms.txt`,
                llmsFullTxt: `${origin}/llms-full.txt`,
                apiDocs: `${origin}/api-docs.md`,
                rfc9727Catalog: `${origin}/.well-known/api-catalog`,
                openapi: `${origin}/openapi.json`,
            }
            return { isError: false, text: JSON.stringify(catalog, null, 2) }
        }

        default:
            return { isError: true, text: `Unknown tool: "${name}"` }
    }
}

/**
 * Handle MCP Request over HTTP (JSON-RPC 2.0)
 * Supports:
 *  - OPTIONS: CORS Preflight
 *  - GET / HEAD: Server Metadata and Tools info
 *  - POST: JSON-RPC 2.0 (initialize, tools/list, tools/call, ping, etc.)
 */
export async function handleMcpRequest(request) {
    const method = request.method.toUpperCase()

    if (method === 'OPTIONS') {
        return new Response(null, {
            status: 204,
            headers: CORS_HEADERS,
        })
    }

    const requestUrl = new URL(request.url)

    if (method === 'GET' || method === 'HEAD') {
        const info = {
            ...MCP_SERVER_INFO,
            endpoints: {
                mcp: `${requestUrl.origin}/mcp`,
                api: `${requestUrl.origin}/api`,
                skill: `${requestUrl.origin}/.well-known/agent-skills/david888-wiki-publisher/SKILL.md`,
                llms: `${requestUrl.origin}/llms.txt`,
            },
            tools: MCP_TOOLS_DEFINITIONS,
        }
        return createJsonResponse(info)
    }

    if (method !== 'POST') {
        return createJsonResponse({ error: 'Method Not Allowed' }, 405)
    }

    let rpc
    try {
        rpc = await request.json()
    } catch {
        return createJsonResponse({
            jsonrpc: '2.0',
            id: null,
            error: {
                code: -32700,
                message: 'Parse error: Invalid JSON payload.',
            },
        }, 400)
    }

    const isBatch = Array.isArray(rpc)
    const requests = isBatch ? rpc : [rpc]

    const responses = await Promise.all(requests.map(async (req) => {
        if (!req || typeof req !== 'object') {
            return {
                jsonrpc: '2.0',
                id: null,
                error: { code: -32600, message: 'Invalid Request' },
            }
        }

        const id = req.id !== undefined ? req.id : null
        const rpcMethod = req.method

        if (typeof rpcMethod !== 'string') {
            return {
                jsonrpc: '2.0',
                id,
                error: { code: -32600, message: 'Invalid Request: "method" must be a string.' },
            }
        }

        switch (rpcMethod) {
            case 'initialize': {
                return {
                    jsonrpc: '2.0',
                    id,
                    result: {
                        protocolVersion: MCP_SERVER_INFO.protocolVersion,
                        capabilities: {
                            tools: {
                                listChanged: false,
                            },
                            prompts: {},
                            resources: {},
                            logging: {},
                        },
                        serverInfo: {
                            name: MCP_SERVER_INFO.name,
                            version: MCP_SERVER_INFO.version,
                        },
                    },
                }
            }

            case 'notifications/initialized':
            case 'initialized': {
                return id !== null ? { jsonrpc: '2.0', id, result: {} } : null
            }

            case 'ping': {
                return {
                    jsonrpc: '2.0',
                    id,
                    result: {},
                }
            }

            case 'tools/list': {
                return {
                    jsonrpc: '2.0',
                    id,
                    result: {
                        tools: MCP_TOOLS_DEFINITIONS,
                    },
                }
            }

            case 'tools/call': {
                const params = req.params || {}
                const toolName = params.name
                const toolArgs = params.arguments || {}

                if (!toolName) {
                    return {
                        jsonrpc: '2.0',
                        id,
                        error: {
                            code: -32602,
                            message: 'Invalid params: "name" is required for tools/call.',
                        },
                    }
                }

                try {
                    const result = await executeMcpTool(toolName, toolArgs, requestUrl)
                    return {
                        jsonrpc: '2.0',
                        id,
                        result: {
                            content: [
                                {
                                    type: 'text',
                                    text: result.text,
                                },
                            ],
                            isError: result.isError === true,
                        },
                    }
                } catch (err) {
                    return {
                        jsonrpc: '2.0',
                        id,
                        result: {
                            content: [
                                {
                                    type: 'text',
                                    text: `Execution error: ${err?.message || err}`,
                                },
                            ],
                            isError: true,
                        },
                    }
                }
            }

            default: {
                return {
                    jsonrpc: '2.0',
                    id,
                    error: {
                        code: -32601,
                        message: `Method not found: "${rpcMethod}"`,
                    },
                }
            }
        }
    }))

    const validResponses = responses.filter(Boolean)
    if (validResponses.length === 0) {
        return new Response(null, { status: 204, headers: CORS_HEADERS })
    }

    return createJsonResponse(isBatch ? validResponses : validResponses[0])
}

import test from 'node:test'
import assert from 'node:assert/strict'
import { handleMcpRequest, MCP_SERVER_INFO, MCP_TOOLS_DEFINITIONS } from '../src/mcp_server.mjs'

function createMockStorage() {
    const notesStore = new Map()
    const shareStore = new Map()

    globalThis.NOTES = {
        getWithMetadata: async (key) => {
            const item = notesStore.get(key)
            if (!item) return { value: null, metadata: null }
            return { value: item.value, metadata: item.metadata }
        },
        put: async (key, value, options = {}) => {
            notesStore.set(key, { value, metadata: options.metadata || {} })
        },
    }

    globalThis.SHARE = {
        get: async (key) => shareStore.get(key) || null,
        put: async (key, value) => {
            shareStore.set(key, value)
        },
    }

    globalThis.SCN_STORAGE_DRIVER = 'kv'
    globalThis.SCN_SALT = 'test-salt-uuid'

    return { notesStore, shareStore }
}

test('OPTIONS /mcp returns 204 with CORS preflight headers', async () => {
    const req = new Request('https://wiki.david888.com/mcp', { method: 'OPTIONS' })
    const res = await handleMcpRequest(req)

    assert.equal(res.status, 204)
    assert.equal(res.headers.get('Access-Control-Allow-Origin'), '*')
    assert.match(res.headers.get('Access-Control-Allow-Methods'), /POST/)
})

test('GET /mcp returns server info, capabilities, and tool definitions', async () => {
    const req = new Request('https://wiki.david888.com/mcp', { method: 'GET' })
    const res = await handleMcpRequest(req)

    assert.equal(res.status, 200)
    const body = await res.json()
    assert.equal(body.name, 'david888-wiki')
    assert.equal(body.protocolVersion, '2024-11-05')
    assert.ok(Array.isArray(body.tools))
    assert.ok(body.tools.some(t => t.name === 'read_note'))
    assert.ok(body.tools.some(t => t.name === 'write_note'))
})

test('POST /mcp handles initialize method', async () => {
    const req = new Request('https://wiki.david888.com/mcp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            jsonrpc: '2.0',
            id: 1,
            method: 'initialize',
            params: {
                protocolVersion: '2024-11-05',
                capabilities: {},
                clientInfo: { name: 'test-client', version: '1.0' },
            },
        }),
    })
    const res = await handleMcpRequest(req)
    assert.equal(res.status, 200)
    const body = await res.json()
    assert.equal(body.jsonrpc, '2.0')
    assert.equal(body.id, 1)
    assert.equal(body.result.protocolVersion, '2024-11-05')
    assert.equal(body.result.serverInfo.name, 'david888-wiki')
    assert.ok(body.result.capabilities.tools)
})

test('POST /mcp handles tools/list method', async () => {
    const req = new Request('https://wiki.david888.com/mcp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            jsonrpc: '2.0',
            id: 2,
            method: 'tools/list',
        }),
    })
    const res = await handleMcpRequest(req)
    assert.equal(res.status, 200)
    const body = await res.json()
    assert.equal(body.id, 2)
    assert.ok(Array.isArray(body.result.tools))
    assert.equal(body.result.tools.length, MCP_TOOLS_DEFINITIONS.length)
})

test('POST /mcp tools/call: render_markdown', async () => {
    const req = new Request('https://wiki.david888.com/mcp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            jsonrpc: '2.0',
            id: 3,
            method: 'tools/call',
            params: {
                name: 'render_markdown',
                arguments: {
                    markdown: '# Hello WebMCP\nThis is **bold**.',
                    theme: 'claude-canvas',
                },
            },
        }),
    })
    const res = await handleMcpRequest(req)
    assert.equal(res.status, 200)
    const body = await res.json()
    assert.equal(body.id, 3)
    assert.equal(body.result.isError, false)
    assert.match(body.result.content[0].text, /<h1.*>Hello WebMCP<\/h1>/)
})

test('POST /mcp tools/call: lint_markdown and extract_markdown_meta', async () => {
    // lint_markdown
    const lintReq = new Request('https://wiki.david888.com/mcp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            jsonrpc: '2.0',
            id: 4,
            method: 'tools/call',
            params: {
                name: 'lint_markdown',
                arguments: {
                    markdown: '#HeadingWithoutSpace\n```\nUnclosed fence',
                },
            },
        }),
    })
    const lintRes = await handleMcpRequest(lintReq)
    const lintBody = await lintRes.json()
    assert.equal(lintBody.result.isError, false)
    const lintParsed = JSON.parse(lintBody.result.content[0].text)
    assert.equal(lintParsed.valid, false)
    assert.ok(lintParsed.fixedMarkdown)

    // extract_markdown_meta
    const extractReq = new Request('https://wiki.david888.com/mcp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            jsonrpc: '2.0',
            id: 5,
            method: 'tools/call',
            params: {
                name: 'extract_markdown_meta',
                arguments: {
                    markdown: '# Sample Note\nParagraph with [Link](https://example.com).',
                },
            },
        }),
    })
    const extractRes = await handleMcpRequest(extractReq)
    const extractBody = await extractRes.json()
    assert.equal(extractBody.result.isError, false)
    const extractParsed = JSON.parse(extractBody.result.content[0].text)
    assert.equal(extractParsed.title, 'Sample Note')
    assert.equal(extractParsed.links[0].url, 'https://example.com')
})

test('POST /mcp tools/call: write_note, read_note, append_note workflow', async () => {
    createMockStorage()

    // 1. Write Note
    const writeReq = new Request('https://wiki.david888.com/mcp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            jsonrpc: '2.0',
            id: 10,
            method: 'tools/call',
            params: {
                name: 'write_note',
                arguments: {
                    path: 'mcp-test-note',
                    text: '# MCP Test\nCreated via native WebMCP endpoint.',
                    theme: 'terminal',
                },
            },
        }),
    })
    const writeRes = await handleMcpRequest(writeReq)
    const writeBody = await writeRes.json()
    assert.equal(writeBody.result.isError, false)
    assert.match(writeBody.result.content[0].text, /Successfully saved note "mcp-test-note"/)
    assert.match(writeBody.result.content[0].text, /Public Share URL:/)

    // 2. Read Note
    const readReq = new Request('https://wiki.david888.com/mcp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            jsonrpc: '2.0',
            id: 11,
            method: 'tools/call',
            params: {
                name: 'read_note',
                arguments: {
                    path: 'mcp-test-note',
                },
            },
        }),
    })
    const readRes = await handleMcpRequest(readReq)
    const readBody = await readRes.json()
    assert.equal(readBody.result.isError, false)
    assert.match(readBody.result.content[0].text, /Created via native WebMCP endpoint\./)

    // 3. Append Note
    const appendReq = new Request('https://wiki.david888.com/mcp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            jsonrpc: '2.0',
            id: 12,
            method: 'tools/call',
            params: {
                name: 'append_note',
                arguments: {
                    path: 'mcp-test-note',
                    text: '## Appended Section\nAdded via append_note tool.',
                },
            },
        }),
    })
    const appendRes = await handleMcpRequest(appendReq)
    const appendBody = await appendRes.json()
    assert.equal(appendBody.result.isError, false)
    assert.match(appendBody.result.content[0].text, /Successfully appended to note "mcp-test-note"/)

    // 4. Verify read after append
    const readAfterReq = new Request('https://wiki.david888.com/mcp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            jsonrpc: '2.0',
            id: 13,
            method: 'tools/call',
            params: {
                name: 'read_note',
                arguments: {
                    path: 'mcp-test-note',
                },
            },
        }),
    })
    const readAfterRes = await handleMcpRequest(readAfterReq)
    const readAfterBody = await readAfterRes.json()
    assert.match(readAfterBody.result.content[0].text, /## Appended Section/)
})

test('POST /mcp tools/call: get_authoring_skill_guide returns SKILL.md markdown', async () => {
    const req = new Request('https://wiki.david888.com/mcp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            jsonrpc: '2.0',
            id: 14,
            method: 'tools/call',
            params: {
                name: 'get_authoring_skill_guide',
                arguments: {},
            },
        }),
    })
    const res = await handleMcpRequest(req)
    assert.equal(res.status, 200)
    const body = await res.json()
    assert.equal(body.id, 14)
    assert.equal(body.result.isError, false)
    assert.match(body.result.content[0].text, /# David888 Wiki Publisher Skill/)
    assert.match(body.result.content[0].text, /Book Mode & Multi-Article Orchestration/)
})

test('POST /mcp returns method not found for unknown method', async () => {
    const req = new Request('https://wiki.david888.com/mcp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            jsonrpc: '2.0',
            id: 99,
            method: 'unknown_method_xyz',
        }),
    })
    const res = await handleMcpRequest(req)
    assert.equal(res.status, 200)
    const body = await res.json()
    assert.equal(body.error.code, -32601)
    assert.match(body.error.message, /Method not found/)
})

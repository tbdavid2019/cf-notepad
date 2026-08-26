import test from 'node:test'
import assert from 'node:assert/strict'
import worker from '../src/index.js'

test('POST /:path/ai-format handles AI edit mode without undefined reference errors', async () => {
    let capturedModel = null
    let capturedMessages = null

    const fakeAi = {
        run: async (model, opts) => {
            capturedModel = model
            capturedMessages = opts.messages
            return { response: '| Item | Days |\n|---|---|\n| Fanpokka | 63 |' }
        }
    }
    const env = { AI: fakeAi }
    const ctx = { waitUntil: () => {} }

    const req = new Request('https://wiki.david888.com/my-note/ai-format', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            text: 'Fanpokka: 63 days\nCodex: 7 days',
            mode: 'edit',
            instruction: '要求整理成表格',
            selectionStart: 0,
            selectionEnd: 17,
        }),
    })

    const res = await worker.fetch(req, env, ctx)
    assert.equal(res.status, 200)
    const json = await res.json()
    assert.equal(json.err, 0)
    assert.equal(json.data.scope, 'selection')
    assert.match(json.data.result, /Item/)
    assert.equal(capturedModel, '@cf/openai/gpt-oss-120b')
    assert.ok(capturedMessages.some(m => m.content.includes('要求整理成表格')))
})

test('POST /:path/ai-format handles AI format mode', async () => {
    const fakeAi = {
        run: async () => ({ response: '# Clean Document\n\nProperly formatted paragraph.' })
    }
    const env = { AI: fakeAi }
    const ctx = { waitUntil: () => {} }

    const req = new Request('https://wiki.david888.com/my-note/ai-format', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            text: '# clean document\nproperly formatted paragraph.',
            mode: 'format',
        }),
    })

    const res = await worker.fetch(req, env, ctx)
    assert.equal(res.status, 200)
    const json = await res.json()
    assert.equal(json.err, 0)
    assert.equal(json.data.scope, 'document')
    assert.match(json.data.result, /Clean Document/)
})

test('POST /:path/ai-format handles AI translation mode with valid target language', async () => {
    let capturedSystem = null
    const fakeAi = {
        run: async (model, opts) => {
            capturedSystem = opts.messages.find(m => m.role === 'system')?.content
            return { response: '這是一段翻譯文字。' }
        }
    }
    const env = { AI: fakeAi }
    const ctx = { waitUntil: () => {} }

    const req = new Request('https://wiki.david888.com/my-note/ai-format', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            text: 'This is a translated text.',
            mode: 'translate',
            targetLanguage: '繁體中文',
        }),
    })

    const res = await worker.fetch(req, env, ctx)
    assert.equal(res.status, 200)
    const json = await res.json()
    assert.equal(json.err, 0)
    assert.match(capturedSystem, /Target language: 繁體中文/)
})

test('POST /:path/ai-format validates invalid parameters cleanly', async () => {
    const env = { AI: { run: async () => ({}) } }
    const ctx = { waitUntil: () => {} }

    // Missing text
    const res1 = await worker.fetch(new Request('https://wiki.david888.com/my-note/ai-format', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode: 'format' }),
    }), env, ctx)
    assert.equal(res1.status, 400)

    // Edit mode without instruction
    const res2 = await worker.fetch(new Request('https://wiki.david888.com/my-note/ai-format', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: 'sample text', mode: 'edit' }),
    }), env, ctx)
    assert.equal(res2.status, 400)

    // Translate mode without target language
    const res3 = await worker.fetch(new Request('https://wiki.david888.com/my-note/ai-format', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: 'sample text', mode: 'translate' }),
    }), env, ctx)
    assert.equal(res3.status, 400)
})

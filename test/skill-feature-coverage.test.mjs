import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const skill = readFileSync(new URL('../skills/SKILL.md', import.meta.url), 'utf8')
const apiDocs = readFileSync(new URL('../LLM_API_DOCS.md', import.meta.url), 'utf8')
const mcpReadme = readFileSync(new URL('../mcp/README.md', import.meta.url), 'utf8')
const mcpServer = readFileSync(new URL('../mcp/server.py', import.meta.url), 'utf8')

test('agent skill documents editor features and bilingual startup tips', () => {
    for (const phrase of [
        'echarts',
        'editor-tips.json',
        'Ctrl-Alt-7',
        'Ctrl-Alt-8',
        'Ctrl-Alt-9',
        'Inline code',
        'Undo / Redo',
        'Image Insertion',
        'Footer Copy',
    ]) {
        assert.match(skill, new RegExp(phrase.replace(/[.*+?^${}()|[\[\]\\]/g, '\\$&'), 'i'))
    }
})

test('agent-facing lock documentation matches the current password policy', () => {
    for (const document of [skill, apiDocs, mcpReadme, mcpServer]) {
        assert.match(document, /only a View Lock exists[\s\S]*sole owner credential/i)
        assert.match(document, /both locks exist[\s\S]*View Lock is read-only[\s\S]*Edit Lock is required/i)
    }
})

test('MCP documentation explains how editor chart Markdown is transported', () => {
    assert.match(mcpReadme, /echarts[\s\S]*Markdown[\s\S]*does not render the chart itself/i)
    assert.match(mcpServer, /complete markdown content/i)
})

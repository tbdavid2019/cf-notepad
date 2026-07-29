import test from 'node:test'
import assert from 'node:assert/strict'
import vm from 'node:vm'
import { HTML } from '../src/templates/base.js'

test('editor inline script remains syntactically valid when AI translation is available', () => {
    const page = HTML({
        lang: 'zh-TW',
        title: 'AI test',
        content: '# Hello',
        ext: {},
        tips: [],
        isEdit: true,
        path: 'ai-test',
        shareId: '',
    })
    const scripts = [...page.matchAll(/<script([^>]*)>([\s\S]*?)<\/script>/g)]
    const editorScript = scripts.find(match => match[2].includes('const APP_STATE ='))

    assert.ok(editorScript)
    assert.doesNotThrow(() => new vm.Script(editorScript[2]))
})

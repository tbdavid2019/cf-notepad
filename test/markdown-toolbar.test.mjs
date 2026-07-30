import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

import {
    applyMarkdownCommand,
    getEditorCursorStatus,
    createLineNumbers,
    createEditorHistory,
    createUploadedAssetMarkdown,
    getImageAltText,
} from '../static/js/markdown-toolbar.mjs'

const baseTemplate = readFileSync(new URL('../src/templates/base.js', import.meta.url), 'utf8')
const commonTemplate = readFileSync(new URL('../src/templates/common.js', import.meta.url), 'utf8')
const editorCss = readFileSync(new URL('../src/styles/editor.css.js', import.meta.url), 'utf8')
const markdownCss = readFileSync(new URL('../src/styles/markdown.css.js', import.meta.url), 'utf8')
const toolbarSource = readFileSync(new URL('../static/js/markdown-toolbar.mjs', import.meta.url), 'utf8')

const apply = (text, command, start = text.length, end = start, lang) =>
    applyMarkdownCommand(text, start, end, command, lang)

test('wraps selected text with inline Markdown markers', () => {
    assert.deepEqual(apply('hello world', 'bold', 6, 11), {
        text: 'hello **world**',
        selectionStart: 8,
        selectionEnd: 13,
    })
})

test('inserts and selects a placeholder for an inline command without a selection', () => {
    assert.deepEqual(apply('', 'italic'), {
        text: '*斜體文字*',
        selectionStart: 1,
        selectionEnd: 5,
    })
})

test('uses English placeholders when the editor language is English', () => {
    assert.deepEqual(apply('', 'inlineCode', 0, 0, 'en-US'), {
        text: '`code`',
        selectionStart: 1,
        selectionEnd: 5,
    })
    assert.deepEqual(apply('', 'codeBlock', 0, 0, 'en-US'), {
        text: '```\ncode\n```',
        selectionStart: 4,
        selectionEnd: 8,
    })
})

test('tracks undo and redo states and drops the redo branch after new input', () => {
    const history = createEditorHistory({ value: 'one', selectionStart: 3, selectionEnd: 3 })
    history.record({ value: 'two', selectionStart: 3, selectionEnd: 3 })
    history.record({ value: 'three', selectionStart: 5, selectionEnd: 5 })

    assert.equal(history.canUndo(), true)
    assert.deepEqual(history.undo(), { value: 'two', selectionStart: 3, selectionEnd: 3 })
    assert.deepEqual(history.redo(), { value: 'three', selectionStart: 5, selectionEnd: 5 })
    assert.deepEqual(history.undo(), { value: 'two', selectionStart: 3, selectionEnd: 3 })

    history.record({ value: 'new branch', selectionStart: 10, selectionEnd: 10 })
    assert.equal(history.canRedo(), false)
})

test('creates a Markdown link and selects its URL placeholder', () => {
    assert.deepEqual(apply('請參考文件', 'link', 3, 5), {
        text: '請參考[文件](https://example.com)',
        selectionStart: 8,
        selectionEnd: 27,
    })
})

test('applies block prefixes to every selected line', () => {
    assert.deepEqual(apply('one\ntwo', 'bullet', 0, 7), {
        text: '- one\n- two',
        selectionStart: 0,
        selectionEnd: 11,
    })
})

test('changes an existing heading level instead of stacking markers', () => {
    assert.deepEqual(apply('## Existing title', 'heading1', 0, 17), {
        text: '# Existing title',
        selectionStart: 0,
        selectionEnd: 16,
    })
})

test('inserts task list, code block, table, and image snippets', () => {
    assert.match(apply('item', 'task', 0, 4).text, /^- \[ \] item$/)
    assert.match(apply('code', 'codeBlock', 0, 4).text, /^```\ncode\n```$/)
    assert.match(apply('', 'table').text, /^\| 欄位 1 \| 欄位 2 \| 欄位 3 \|\n\| --- \| --- \| --- \|/)
    const image = apply('', 'image')
    assert.match(image.text, /^!\[圖片說明\]\(https:\/\/example\.com\/image\.png\)$/)
    assert.deepEqual([image.selectionStart, image.selectionEnd], [8, 37])
})

test('wraps selected content in two-column and three-column layouts', () => {
    const selected = '### One\n\nFirst\n\n### Two\n\nSecond'
    assert.equal(
        apply(selected, 'twoColumns', 0, selected.length).text,
        `<div class="two-column-layout">\n\n${selected}\n\n</div>`,
    )

    const threeColumns = apply('', 'threeColumns', 0, 0, 'en-US')
    assert.match(threeColumns.text, /^<div class="three-column-layout">\n\n### Column 1/)
    assert.match(threeColumns.text, /### Column 3[\s\S]*<\/div>$/)
})

test('inserts a standalone TOC placeholder at the cursor', () => {
    assert.deepEqual(apply('', 'toc'), {
        text: '[TOC]',
        selectionStart: 0,
        selectionEnd: 5,
    })
    assert.deepEqual(apply('前言', 'toc', 2, 2), {
        text: '前言\n[TOC]',
        selectionStart: 3,
        selectionEnd: 8,
    })
})

test('creates one line number per editor line', () => {
    assert.equal(createLineNumbers('第一行\n第二行\n'), '1\n2\n3')
})

test('reports the cursor line, column, and total editor length', () => {
    assert.equal(getEditorCursorStatus('第一行\n第二行', 4, 'zh-TW'), '第 2 行・第 1 欄・總長度 7')
    assert.equal(getEditorCursorStatus('one\ntwo', 6, 'en-US'), 'Line 2, Column 3, Length 7')
})

test('renders the toolbar for editable pages', () => {
    assert.match(baseTemplate, /<div class="editor-pane">\s*\$\{EDITOR_TOOLBAR\(lang\)\}/)
    assert.match(commonTemplate, /data-markdown-toolbar/)
    assert.match(
        commonTemplate,
        /data-language="\$\{lang\}" role="toolbar"[^>]*>\s*<button type="button" id="editor-ai-format-btn"/
    )
    assert.match(commonTemplate, /id="editor-ai-edit-btn"[^>]*data-ai-action="edit"/)
    assert.match(commonTemplate, /id="editor-ai-edit-btn"[^>]*>\s*<span[^>]*>\$\{SVG_ICONS\.magic\}<\/span>\s*<\/button>/)
    assert.match(commonTemplate, /id="editor-ai-translate-btn"[^>]*>\s*<span[^>]*>\$\{SVG_ICONS\.languages\}<\/span>\s*<\/button>/)
    assert.match(commonTemplate, /id="editor-ai-format-btn"[^>]*>\s*<span[^>]*>\$\{SVG_ICONS\.sparkles\}<\/span>\s*<\/button>/)
    assert.doesNotMatch(commonTemplate, /markdown-toolbar-ai-label/)
    assert.match(commonTemplate, /data-command="\$\{item\.command\}"/)
    assert.match(commonTemplate, /glyph: '&lt;\/&gt;'/)
    assert.match(commonTemplate, /markdown-toolbar-image-input/)
    assert.match(commonTemplate, /markdown-toolbar-asset-input/)
    assert.match(commonTemplate, /command: 'asset'/)
    assert.match(commonTemplate, /command: 'toc'/)
    assert.match(commonTemplate, /command: 'twoColumns'/)
    assert.match(commonTemplate, /command: 'threeColumns'/)
    assert.doesNotMatch(commonTemplate, /command: 'citation'/)
    assert.match(commonTemplate, /accept="video\/\*,audio\/\*,application\/pdf/)
    assert.match(commonTemplate, /command: 'fullscreen'/)
    assert.match(commonTemplate, /command: 'undo'/)
    assert.match(commonTemplate, /command: 'redo'/)
    assert.match(commonTemplate, /id="editor-ai-format-btn"/)
    assert.match(baseTemplate, /src="\/js\/markdown-toolbar\.mjs"/)
    assert.match(baseTemplate, /id="editor-line-numbers"/)
    assert.match(baseTemplate, /id="editor-status"/)
    assert.doesNotMatch(baseTemplate, /remarkHackmdCitation/)
    assert.doesNotMatch(markdownCss, /\.markdown-citation/)
    assert.match(editorCss, /\.editor-line-numbers/)
    assert.match(editorCss, /\.editor-status/)
    assert.match(toolbarSource, /textarea\.addEventListener\('scroll', syncLineNumbers, \{ passive: true \}\)/)
})

test('renders a TOC placeholder from resolved Markdown heading anchors', () => {
    assert.match(baseTemplate, /const renderTableOfContents = node =>/)
    assert.match(baseTemplate, /paragraph\.textContent\.trim\(\)\.toUpperCase\(\) === '\[TOC\]'/)
    assert.match(baseTemplate, /heading\.tagName\.slice\(1\)/)
    assert.match(baseTemplate, /anchor\.href = '#' \+ heading\.id/)
    assert.match(baseTemplate, /decorateHeadingAnchors\(node\);\s*renderTableOfContents\(node\);/)
    assert.match(markdownCss, /\.markdown-toc/)
})

test('top AI edit control reuses the document AI editing workflow', () => {
    assert.match(baseTemplate, /const \$editorAiEditBtn = document\.querySelector\('#editor-ai-edit-btn'\)/)
    assert.match(baseTemplate, /\$editorAiEditBtn\.disabled = true/)
    assert.match(baseTemplate, /\$editorAiEditBtn\.disabled = false/)
    assert.match(baseTemplate, /\$editorAiEditBtn\.addEventListener\('click', \(\) => runAiAssistant\('edit'\)\)/)
})

test('keeps the Markdown toolbar when preview mode is turned off', () => {
    assert.match(baseTemplate, /\$\{isEdit \? '<script type="module" src="\/js\/markdown-toolbar\.mjs"><\/script>' : ''\}/)
    assert.match(baseTemplate, /divide-line/)
})

test('toolbar uses horizontal scrolling instead of wrapping', () => {
    assert.match(editorCss, /\.markdown-editor-toolbar\s*\{[\s\S]*flex-wrap:\s*nowrap;/)
    assert.match(editorCss, /\.markdown-editor-toolbar\s*\{[\s\S]*overflow-x:\s*auto;/)
    assert.match(editorCss, /@media \(max-width: 640px\)[\s\S]*\.markdown-toolbar-separator\s*\{[\s\S]*display:\s*none;/)
})

test('creates Markdown for uploaded 888box assets by media type', () => {
    assert.equal(
        createUploadedAssetMarkdown('https://box.glsoft.ai/storage/video/demo.mp4', 'Demo Clip.mp4', 'video/mp4'),
        '<video controls src="https://box.glsoft.ai/storage/video/demo.mp4"></video>'
    )
    assert.equal(
        createUploadedAssetMarkdown('https://box.glsoft.ai/storage/audio/demo.mp3', 'Demo Audio.mp3', 'audio/mpeg'),
        '<audio controls src="https://box.glsoft.ai/storage/audio/demo.mp3"></audio>'
    )
    assert.equal(
        createUploadedAssetMarkdown('https://box.glsoft.ai/storage/file/demo.pdf', 'Project Plan.pdf', 'application/pdf'),
        '[Project Plan](https://box.glsoft.ai/storage/file/demo.pdf)'
    )
})

test('toolbar uploads attachments directly to the public 888box API', () => {
    assert.match(commonTemplate, /command: 'asset'/)
    assert.match(commonTemplate, /markdown-toolbar-asset-input/)
    assert.match(commonTemplate, /選擇要上傳的附件/)
    assert.match(commonTemplate, /Choose an attachment to upload/)
    assert.match(
        readFileSync(new URL('../static/js/markdown-toolbar.mjs', import.meta.url), 'utf8'),
        /https:\/\/box\.glsoft\.ai\/api\.php\?action=upload/
    )
})

test('creates a safe image alt label from a filename', () => {
    assert.equal(getImageAltText('my [chart].png'), 'my chart')
    assert.equal(getImageAltText(''), 'image')
})

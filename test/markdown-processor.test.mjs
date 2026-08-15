import test from 'node:test'
import assert from 'node:assert/strict'
import {
    renderMarkdownToHtml,
    parseHtmlToMarkdown,
    extractMarkdownData,
    lintMarkdownText,
} from '../src/markdown-processor.mjs'

test('renderMarkdownToHtml converts headings, bold, inline code, links and lists correctly', () => {
    const md = `# Title\n\nThis is **bold** text and \`code\`.\n\n- Item 1\n- Item 2\n\n[Link](https://example.com)`
    const html = renderMarkdownToHtml(md)
    assert.match(html, /<h1 id="title">Title<\/h1>/)
    assert.match(html, /<strong>bold<\/strong>/)
    assert.match(html, /<code>code<\/code>/)
    assert.match(html, /<ul>\s*<li>Item 1<\/li>\s*<li>Item 2<\/li>\s*<\/ul>/)
    assert.match(html, /<a href="https:\/\/example\.com" target="_blank" rel="noopener noreferrer">Link<\/a>/)
})

test('renderMarkdownToHtml supports fullHtml wrapper with theme style', () => {
    const md = `# Document\nContent`
    const html = renderMarkdownToHtml(md, { fullHtml: true, theme: 'retro', title: 'Test Page' })
    assert.match(html, /<!DOCTYPE html>/)
    assert.match(html, /<title>Test Page<\/title>/)
    assert.match(html, /<div class="markdown-body">/)
})

test('parseHtmlToMarkdown converts basic HTML elements into Markdown', () => {
    const html = `<h1>Hello World</h1><p>This is <strong>bold</strong> and <em>italic</em>.</p><ul><li>One</li><li>Two</li></ul><a href="https://example.com">Link</a>`
    const md = parseHtmlToMarkdown(html)
    assert.match(md, /# Hello World/)
    assert.match(md, /\*\*bold\*\*/)
    assert.match(md, /\*italic\*/)
    assert.match(md, /- One\n- Two/)
    assert.match(md, /\[Link\]\(https:\/\/example\.com\)/)
})

test('extractMarkdownData extracts title, headings, links, and accurate stats', () => {
    const md = `# Main Topic\n\nSome intro text.\n\n## Subtopic\n\nRead more at [Google](https://google.com) and check ![Logo](https://example.com/logo.png)`
    const data = extractMarkdownData(md)
    assert.equal(data.title, 'Main Topic')
    assert.equal(data.headings.length, 2)
    assert.equal(data.headings[0].level, 1)
    assert.equal(data.headings[0].text, 'Main Topic')
    assert.equal(data.headings[1].level, 2)
    assert.equal(data.headings[1].text, 'Subtopic')
    assert.equal(data.links.length, 1)
    assert.equal(data.links[0].text, 'Google')
    assert.equal(data.links[0].url, 'https://google.com')
    assert.equal(data.images.length, 1)
    assert.equal(data.images[0].alt, 'Logo')
    assert.ok(data.stats.words > 0)
    assert.ok(data.stats.characters > 0)
})

test('lintMarkdownText catches unclosed code fence and missing heading space', () => {
    const md = `#HeadingWithoutSpace\n\`\`\`javascript\nconst a = 1;`
    const result = lintMarkdownText(md)
    assert.equal(result.valid, false)
    assert.ok(result.issues.some(i => i.type === 'heading-missing-space'))
    assert.ok(result.issues.some(i => i.type === 'unclosed-code-fence'))
    assert.match(result.fixedMarkdown, /# HeadingWithoutSpace/)
    assert.match(result.fixedMarkdown, /```$/)
})

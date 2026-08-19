import test from 'node:test'
import assert from 'node:assert/strict'
import { JSDOM } from 'jsdom'
import { readFileSync } from 'node:fs'

import {
    decorateColumnLayouts,
    expandHackmdImageSizes,
    expandPandocCitations,
    expandTextHighlights,
    expandCustomColors,
    expandMarkdownExtensions,
    decorateFootnoteAndCitationPopovers,
    decorateCodeBlocks,
} from '../static/js/markdown-extensions.mjs'

const baseTemplate = readFileSync(new URL('../src/templates/base.js', import.meta.url), 'utf8')
const markdownCss = readFileSync(new URL('../src/styles/markdown.css.js', import.meta.url), 'utf8')

test('converts HackMD image dimensions into safe image attributes', () => {
    assert.equal(
        expandHackmdImageSizes('![image](https://hackmd.io/_uploads/demo.png =600x)'),
        '<img src="https://hackmd.io/_uploads/demo.png" alt="image" width="600">',
    )
    assert.equal(
        expandHackmdImageSizes('![chart](https://example.com/chart.png =600x400)'),
        '<img src="https://example.com/chart.png" alt="chart" width="600" height="400">',
    )
    assert.equal(
        expandHackmdImageSizes('![poster](https://example.com/poster.png =x400)'),
        '<img src="https://example.com/poster.png" alt="poster" height="400">',
    )
})

test('leaves invalid and ordinary Markdown images unchanged', () => {
    assert.equal(
        expandHackmdImageSizes('![image](https://example.com/image.png)'),
        '![image](https://example.com/image.png)',
    )
    assert.equal(
        expandHackmdImageSizes('![image](https://example.com/image.png =wide)'),
        '![image](https://example.com/image.png =wide)',
    )
    assert.equal(
        expandHackmdImageSizes('`![image](https://example.com/image.png =600x)`'),
        '`![image](https://example.com/image.png =600x)`',
    )
    assert.equal(
        expandHackmdImageSizes('```\n![image](https://example.com/image.png =600x)\n```'),
        '```\n![image](https://example.com/image.png =600x)\n```',
    )
})

test('expands Pandoc academic citations into structured citation links', () => {
    const single = expandPandocCitations('According to [@smith04], distributed systems scale.')
    assert.match(single, /class="pandoc-citation"/)
    assert.match(single, /data-citation-key="smith04"/)
    assert.match(single, /href="#fn-smith04"/)

    const withLocator = expandPandocCitations('See [@doe2023, pp. 45-48] for details.')
    assert.match(withLocator, /data-citation-key="doe2023"/)
    assert.match(withLocator, /data-locator="pp\. 45-48"/)

    const multiple = expandPandocCitations('Multiple works agree [@smith04; @doe2023, p. 10].')
    assert.match(multiple, /data-citation-key="smith04"/)
    assert.match(multiple, /data-citation-key="doe2023"/)

    const inText = expandPandocCitations('As @lamport82 [p. 15] proposed, Byzantine faults occur.')
    assert.match(inText, /class="pandoc-citation in-text"/)
    assert.match(inText, /data-citation-key="lamport82"/)

    // Preserves inside code block
    const codeBlock = '```\n[@not_a_citation]\n```'
    assert.equal(expandPandocCitations(codeBlock), codeBlock)

    // Preserves inside inline code
    const inlineCode = 'Use `[@citationKey]` in text.'
    assert.equal(expandPandocCitations(inlineCode), inlineCode)
})

test('decorates footnote references with hover popover listeners', () => {
    const dom = new JSDOM(`
        <!DOCTYPE html>
        <html>
        <body>
            <div id="content">
                <p>Text referencing note<sup class="footnote-ref"><a href="#fn-1" id="fnref-1" data-footnote-ref>1</a></sup> and citation <cite class="pandoc-citation"><a href="#fn-smith04" class="citation-ref" data-citation-key="smith04">[@smith04]</a></cite></p>
                <section class="footnotes">
                    <ol>
                        <li id="fn-1"><p>Footnote 1 text <a href="#fnref-1" class="data-footnote-backref">↩</a></p></li>
                        <li id="fn-smith04"><p>Smith, John. (2004). <em>Distributed Systems</em>. <a href="#fnref-smith04" class="data-footnote-backref">↩</a></p></li>
                    </ol>
                </section>
            </div>
        </body>
        </html>
    `)
    const root = dom.window.document.getElementById('content')
    const count = decorateFootnoteAndCitationPopovers(root)
    assert.equal(count, 2)
    assert.ok(dom.window.document.getElementById('footnote-popover'))
})

test('groups heading sections into two-column and three-column layout items', () => {
    const dom = new JSDOM(`
        <main>
            <div class="two-column-layout">
                <h3>One</h3><p>First</p>
                <h4>Detail</h4><p>Still first</p>
                <h3>Two</h3><p>Second</p>
            </div>
            <div class="three-column-layout">
                <h3>A</h3><p>Alpha</p>
                <h3>B</h3><p>Beta</p>
                <h3>C</h3><p>Gamma</p>
            </div>
        </main>
    `)
    const root = dom.window.document.querySelector('main')

    assert.equal(decorateColumnLayouts(root), 2)
    assert.equal(root.querySelectorAll('.two-column-layout > .column-layout-item').length, 2)
    assert.equal(root.querySelectorAll('.three-column-layout > .column-layout-item').length, 3)
    assert.equal(
        root.querySelector('.two-column-layout > .column-layout-item:first-child').textContent.replace(/\s+/g, ''),
        'OneFirstDetailStillfirst',
    )
})

test('expands text highlight syntax ==text== into mark elements', () => {
    assert.equal(
        expandTextHighlights('This is ==highlighted== text.'),
        'This is <mark class="markdown-highlight">highlighted</mark> text.',
    )
    assert.equal(
        expandTextHighlights('==天啊我會發光==、或是 ==螢==火蟲'),
        '<mark class="markdown-highlight">天啊我會發光</mark>、或是 <mark class="markdown-highlight">螢</mark>火蟲',
    )
    // Preserved inside code fence
    const fence = '```\n==not highlight==\n```'
    assert.equal(expandTextHighlights(fence), fence)
    // Preserved inside inline code
    const inline = 'Use `==text==` to highlight.'
    assert.equal(expandTextHighlights(inline), inline)
})

test('expands custom font color and background color tags', () => {
    assert.equal(
        expandCustomColors('[color=red]Red text[/color]'),
        '<span style="color: red">Red text</span>',
    )
    assert.equal(
        expandCustomColors('[color=#3b82f6 bg=#eff6ff]Blue on light blue[/color]'),
        '<span style="color: #3b82f6; background-color: #eff6ff">Blue on light blue</span>',
    )
    assert.equal(
        expandCustomColors('[bg=yellow]Yellow background[/bg]'),
        '<span style="background-color: yellow">Yellow background</span>',
    )
    // Preserved inside code fence
    const fence = '```\n[color=red]not red[/color]\n```'
    assert.equal(expandCustomColors(fence), fence)
})

test('decorates code blocks with filename tabs, line numbers, and copy buttons', () => {
    const dom = new JSDOM(`
        <!DOCTYPE html>
        <html>
        <body>
            <div id="content">
                <pre><code class="language-javascript=10 [server.mjs]">console.log("Hello");\nconsole.log("World");</code></pre>
            </div>
        </body>
        </html>
    `)
    const root = dom.window.document.getElementById('content')
    const count = decorateCodeBlocks(root)
    assert.equal(count, 1)

    const wrapper = root.querySelector('.code-block-wrapper')
    assert.ok(wrapper, 'Code block wrapper should exist')
    const header = wrapper.querySelector('.code-block-header')
    assert.ok(header, 'Code block header should exist')
    assert.match(header.textContent, /server\.mjs/)
    const copyBtn = header.querySelector('.code-copy-btn')
    assert.ok(copyBtn, 'Copy button should exist')

    const lineNumbers = wrapper.querySelector('.code-line-numbers')
    assert.ok(lineNumbers, 'Line numbers gutter should exist')
    assert.match(lineNumbers.textContent, /10/)
    assert.match(lineNumbers.textContent, /11/)
})

test('connects HackMD and citation extensions to rendering and responsive layout styles', () => {
    assert.match(baseTemplate, /expandMarkdownExtensions\(text\)/)
    assert.match(baseTemplate, /decorateColumnLayouts\(node\)/)
    assert.match(baseTemplate, /decorateFootnoteAndCitationPopovers\(node\)/)
    assert.match(baseTemplate, /decorateCodeBlocks\(node\)/)
    assert.match(markdownCss, /\.markdown-body \.two-column-layout/)
    assert.match(markdownCss, /\.footnote-popover/)
    assert.match(markdownCss, /\.pandoc-citation/)
    assert.match(markdownCss, /\.markdown-highlight/)
    assert.match(markdownCss, /\.code-block-wrapper/)
    assert.match(markdownCss, /grid-template-columns:\s*repeat\(3,\s*minmax\(0,\s*1fr\)\)/)
    assert.match(markdownCss, /@media \(max-width: 720px\)/)
})

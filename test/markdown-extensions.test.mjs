import test from 'node:test'
import assert from 'node:assert/strict'
import { JSDOM } from 'jsdom'
import { readFileSync } from 'node:fs'

import {
    decorateColumnLayouts,
    expandHackmdImageSizes,
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

test('connects HackMD extensions to rendering and responsive layout styles', () => {
    assert.match(baseTemplate, /expandHackmdImageSizes\(text\)/)
    assert.match(baseTemplate, /decorateColumnLayouts\(node\)/)
    assert.match(markdownCss, /\.markdown-body \.two-column-layout/)
    assert.match(markdownCss, /grid-template-columns:\s*repeat\(3,\s*minmax\(0,\s*1fr\)\)/)
    assert.match(markdownCss, /@media \(max-width: 720px\)/)
})

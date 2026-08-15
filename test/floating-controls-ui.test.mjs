import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'
import { JSDOM } from 'jsdom'

import { FOOTER } from '../src/templates/common.js'
import { setupDropdownMenus, setupFloatingTooltips } from '../static/js/floating-controls.mjs'

const baseTemplateSource = readFileSync(new URL('../src/templates/base.js', import.meta.url), 'utf8')
const baseCssSource = readFileSync(new URL('../src/styles/base.css.js', import.meta.url), 'utf8')
const editorCssSource = readFileSync(new URL('../src/styles/editor.css.js', import.meta.url), 'utf8')

const renderFooter = overrides => new JSDOM(FOOTER({
    lang: 'zh-TW',
    isEdit: false,
    mode: 'md',
    share: true,
    shareId: 'share-id',
    path: 'note-path',
    sharePath: 'share/share-id',
    theme: 'claude-canvas',
    width: '100%',
    ...overrides,
})).window.document

test('share desktop and mobile actions all expose localized floating tooltip text', () => {
    const document = renderFooter()
    const selectors = [
        '.readonly-edit-link',
        '#export-menu-btn',
        '#copy-menu-btn',
        '#copy-embed-code-btn',
        '#mobile-more-btn',
    ]

    for (const selector of selectors) {
        const control = document.querySelector(selector)
        assert.ok(control, `${selector} should be rendered`)
        assert.match(control.dataset.tooltip || '', /[\u3400-\u9fff]/, `${selector} should have a Chinese tooltip`)
    }
})

test('edit share options trigger exposes the same localized tooltip contract', () => {
    const document = renderFooter({ isEdit: true })
    assert.match(document.querySelector('#share-menu-btn')?.dataset.tooltip || '', /發布|分享/)
})

test('footer provides a primary new-note action, explicit format choices, and a default-editor setting', () => {
    const document = renderFooter({ isEdit: true })
    const firstSection = document.querySelector('.footer-sections > .footer-section:first-child')
    const trigger = document.querySelector('#new-note-menu-btn')

    assert.equal(firstSection?.classList.contains('footer-section-create'), true)
    assert.equal(trigger?.classList.contains('dropdown-trigger'), true)
    assert.equal(trigger?.querySelector('.new-note-plus')?.textContent.trim(), '＋')
    assert.equal(trigger?.querySelector('.toolbar-button-label')?.textContent.trim(), '新增')
    assert.equal(document.querySelector('#new-markdown-note-link')?.getAttribute('href'), '/new/markdown')
    assert.equal(document.querySelector('#new-block-note-link')?.getAttribute('href'), '/new/block')
    assert.match(document.querySelector('#editor-preference-btn')?.textContent || '', /預設編輯器/)
})

test('Block note menus expose imports that convert content into blocks', () => {
    const document = renderFooter({ isEdit: true, editorFormat: 'block' })

    assert.match(document.querySelector('#dropdown-import-doc-btn')?.textContent || '', /轉成 Block/)
    assert.match(document.querySelector('#dropdown-import-url-btn')?.textContent || '', /轉成 Block/)
    assert.ok(document.querySelector('#import-md-input'))
    assert.ok(document.querySelector('#import-md-btn'))
    assert.ok(document.querySelector('#new-block-note-link'))
})

test('scrolling toolbars delegate unclipped tooltips and dropdowns to a body-level floating layer', () => {
    assert.match(baseTemplateSource, /\/js\/floating-controls\.mjs/)
    assert.match(baseCssSource, /\.footer\s*\{[\s\S]*overflow-x:\s*auto;/)
    assert.match(editorCssSource, /\.markdown-editor-toolbar\s*\{[\s\S]*overflow-x:\s*auto;/)
    assert.match(baseCssSource, /\.floating-tooltip\s*\{/)
    assert.match(baseCssSource, /\.dropdown-menu\.floating-menu-open\s*\{/)
})

test('mobile edit share menu is portaled outside the filtered scrolling footer', () => {
    const dom = new JSDOM(`
        <footer class="footer">
            <div class="dropdown-container">
                <button class="dropdown-trigger" aria-expanded="false">...</button>
                <div class="dropdown-menu"><button class="dropdown-item">開啟</button></div>
            </div>
        </footer>
    `)
    const { document } = dom.window
    const trigger = document.querySelector('.dropdown-trigger')
    const menu = document.querySelector('.dropdown-menu')
    trigger.getBoundingClientRect = () => ({ left: 330, right: 362, top: 700, bottom: 732, width: 32, height: 32 })
    menu.getBoundingClientRect = () => ({ left: 0, right: 220, top: 0, bottom: 200, width: 220, height: 200 })
    Object.defineProperty(dom.window, 'innerWidth', { configurable: true, value: 390 })
    Object.defineProperty(dom.window, 'innerHeight', { configurable: true, value: 844 })

    setupDropdownMenus(document, dom.window)
    trigger.dispatchEvent(new dom.window.MouseEvent('click', { bubbles: true }))

    assert.equal(menu.parentElement, document.body)
    assert.equal(menu.classList.contains('floating-menu-open'), true)
    assert.equal(trigger.getAttribute('aria-expanded'), 'true')
    assert.equal(menu.style.position, 'fixed')
    assert.equal(menu.style.left, '162px')
    assert.equal(menu.style.top, '492px')

    document.body.dispatchEvent(new dom.window.MouseEvent('click', { bubbles: true }))
    assert.equal(menu.closest('.dropdown-container')?.classList.contains('show'), false)
    assert.equal(trigger.getAttribute('aria-expanded'), 'false')
})

test('toolbar tooltip is rendered below its control in a body-level layer', () => {
    const dom = new JSDOM('<div class="markdown-editor-toolbar"><button data-tooltip="粗體">B</button></div>')
    const { document } = dom.window
    const button = document.querySelector('button')
    button.getBoundingClientRect = () => ({ left: 20, right: 44, top: 10, bottom: 34, width: 24, height: 24 })
    Object.defineProperty(dom.window, 'innerWidth', { configurable: true, value: 390 })
    Object.defineProperty(dom.window, 'innerHeight', { configurable: true, value: 844 })

    const { tooltip } = setupFloatingTooltips(document, dom.window)
    tooltip.getBoundingClientRect = () => ({ left: 0, right: 60, top: 0, bottom: 24, width: 60, height: 24 })
    button.dispatchEvent(new dom.window.MouseEvent('pointerover', { bubbles: true }))

    assert.equal(tooltip.parentElement, document.body)
    assert.equal(tooltip.hidden, false)
    assert.equal(tooltip.textContent, '粗體')
    assert.equal(tooltip.classList.contains('floating-placement-below'), true)
    assert.equal(tooltip.style.top, '42px')
})

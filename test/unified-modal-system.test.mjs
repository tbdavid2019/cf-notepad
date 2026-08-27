import test from 'node:test'
import assert from 'node:assert/strict'
import { MODAL, CITE_MODAL, URL_IMPORT_MODAL, MATH_FORMAT_MODAL } from '../src/templates/common.js'
import { getBaseCss } from '../src/styles/base.css.js'
import { HTML } from '../src/templates/base.js'

test('MODAL renders standardized close buttons and data-modal-close attributes', () => {
    const zhHtml = MODAL('zh-TW', { noteHistoryEnabled: true })
    const enHtml = MODAL('en-US', { noteHistoryEnabled: true })

    // Check data-modal-close on masks
    assert.match(zhHtml, /class="modal-mask" data-modal-close/)
    // Check standardized close buttons with multiplication sign × and aria-label
    assert.match(zhHtml, /class="close-btn share-modal-close" data-modal-close aria-label="關閉">×<\/button>/)
    assert.match(zhHtml, /class="close-btn share-history-close" data-modal-close aria-label="關閉">×<\/button>/)
    assert.match(zhHtml, /class="close-btn embed-modal-close" data-modal-close aria-label="關閉">×<\/button>/)
    assert.match(zhHtml, /class="close-btn password-modal-close" data-modal-close aria-label="取消">×<\/button>/)
    assert.match(zhHtml, /class="close-btn note-history-close" data-modal-close aria-label="關閉">×<\/button>/)

    assert.match(enHtml, /class="close-btn share-modal-close" data-modal-close aria-label="Close">×<\/button>/)
    assert.match(enHtml, /class="close-btn share-history-close" data-modal-close aria-label="Close">×<\/button>/)
    assert.match(enHtml, /class="close-btn embed-modal-close" data-modal-close aria-label="Close">×<\/button>/)
    assert.match(enHtml, /class="close-btn password-modal-close" data-modal-close aria-label="Cancel">×<\/button>/)
    assert.match(enHtml, /class="close-btn note-history-close" data-modal-close aria-label="Close">×<\/button>/)
})

test('CITE_MODAL, URL_IMPORT_MODAL, and MATH_FORMAT_MODAL render data-modal-close attributes', () => {
    const citeZh = CITE_MODAL('zh-TW')
    const urlZh = URL_IMPORT_MODAL('zh-TW')
    const mathZh = MATH_FORMAT_MODAL('zh-TW')

    assert.match(citeZh, /id="cite-modal-mask" data-modal-close/)
    assert.match(citeZh, /id="cite-modal-close-btn" data-modal-close/)
    assert.match(citeZh, /id="cite-modal-cancel-btn" data-modal-close/)

    assert.match(urlZh, /id="url-import-mask" data-modal-close/)
    assert.match(urlZh, /id="url-import-close-btn" data-modal-close/)
    assert.match(urlZh, /id="url-import-cancel-btn" data-modal-close/)

    assert.match(mathZh, /id="math-format-mask" data-modal-close/)
    assert.match(mathZh, /id="math-format-close-btn" data-modal-close/)
    assert.match(mathZh, /id="math-format-cancel-btn" data-modal-close/)
})

test('BASE_CSS defines standard modal variables and cards across light and dark themes', () => {
    const css = getBaseCss()

    // Light Theme variables
    assert.match(css, /--modal-bg:\s*#ffffff;/)
    assert.match(css, /--modal-border:\s*#d0d7de;/)
    assert.match(css, /--modal-text:\s*#24292f;/)
    assert.match(css, /--modal-surface:\s*#f6f8fa;/)

    // Dark Theme variables
    assert.match(css, /html\[data-ui-theme="dark"\][\s\S]*--modal-bg:\s*#1e293b;/)
    assert.match(css, /html\[data-ui-theme="dark"\][\s\S]*--modal-border:\s*#334155;/)
    assert.match(css, /html\[data-ui-theme="dark"\][\s\S]*--modal-text:\s*#f1f5f9;/)
    assert.match(css, /html\[data-ui-theme="dark"\][\s\S]*--modal-surface:\s*#0f172a;/)
    assert.match(css, /html\[data-ui-theme="dark"\][\s\S]*--modal-accent:\s*#38bdf8;/)

    // Standardized modal cards using CSS variables
    assert.match(css, /\.modal-content\s*\{[\s\S]*background:\s*var\(--modal-bg/)
    assert.match(css, /\.embed-modal-content\s*\{[\s\S]*background:\s*var\(--modal-bg/)
    assert.match(css, /\.url-import-modal-content\s*\{[\s\S]*background:\s*var\(--modal-bg/)
    assert.match(css, /\.cite-modal-content\s*\{[\s\S]*background:\s*var\(--modal-bg/)
    assert.match(css, /\.editor-preference-content\s*\{[\s\S]*background:\s*var\(--modal-bg/)
    assert.match(css, /\.publish-nudge-content\s*\{[\s\S]*background:\s*var\(--modal-bg/)
    assert.match(css, /\.password-modal-content\s*\{[\s\S]*background:\s*var\(--modal-bg/)
    assert.match(css, /\.app-dialog-content\s*\{[\s\S]*background:\s*var\(--modal-bg/)
    assert.match(css, /\.modal \.close-btn/)
})

test('HTML base template openModal supports Escape, Tab focus trap, and data-modal-close delegation', () => {
    const template = HTML({
        title: 'Modal System Test',
        body: '',
        path: 'modal-system-test',
        isPublished: true,
    })

    assert.match(template, /const openModal = \(modal/)
    assert.match(template, /event\.key === 'Escape'/)
    assert.match(template, /event\.target\.matches\('\[data-modal-close\], \.modal-mask, \.close-btn'\)/)
    assert.match(template, /closeModal\(modal\)/)
})

import test from 'node:test'
import assert from 'node:assert/strict'
import { JSDOM } from 'jsdom'

import { initPwaInstallPrompt, isAndroid, isStandalonePwa } from '../static/js/pwa-install.mjs'

const ANDROID_USER_AGENT = 'Mozilla/5.0 (Linux; Android 15) AppleWebKit/537.36 Chrome/138.0 Mobile Safari/537.36'

const createPromptDom = ({ userAgent = ANDROID_USER_AGENT } = {}) => {
    const dom = new JSDOM(`
    <aside id="pwa-install-prompt" hidden>
        <button type="button" id="pwa-install-button">Install app</button>
        <button type="button" id="pwa-install-dismiss">×</button>
    </aside>
`, { url: 'https://wiki.example/note' })
    Object.defineProperty(dom.window.navigator, 'userAgent', {
        configurable: true,
        value: userAgent,
    })
    return dom
}

test('does not show the install prompt when the page runs as an installed standalone PWA', () => {
    const dom = createPromptDom()
    Object.defineProperty(dom.window, 'matchMedia', {
        value: () => ({ matches: true }),
    })

    assert.equal(isStandalonePwa(dom.window), true)
    initPwaInstallPrompt(dom.window.document, dom.window)
    dom.window.dispatchEvent(new dom.window.Event('beforeinstallprompt', { cancelable: true }))

    assert.equal(dom.window.document.querySelector('#pwa-install-prompt').hidden, true)
})

test('does not offer the Android-only install promotion on macOS', () => {
    const dom = createPromptDom({ userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)' })
    Object.defineProperty(dom.window, 'matchMedia', {
        value: () => ({ matches: false }),
    })

    assert.equal(isAndroid(dom.window), false)
    initPwaInstallPrompt(dom.window.document, dom.window)
    dom.window.dispatchEvent(new dom.window.Event('beforeinstallprompt', { cancelable: true }))

    assert.equal(dom.window.document.querySelector('#pwa-install-prompt').hidden, true)
})

test('keeps the install prompt hidden after the user dismisses it', () => {
    const dom = createPromptDom()
    Object.defineProperty(dom.window, 'matchMedia', {
        value: () => ({ matches: false }),
    })
    initPwaInstallPrompt(dom.window.document, dom.window)

    assert.equal(isAndroid(dom.window), true)

    const firstEvent = new dom.window.Event('beforeinstallprompt', { cancelable: true })
    dom.window.dispatchEvent(firstEvent)
    assert.equal(dom.window.document.querySelector('#pwa-install-prompt').hidden, false)

    dom.window.document.querySelector('#pwa-install-dismiss').click()
    assert.equal(dom.window.document.querySelector('#pwa-install-prompt').hidden, true)

    dom.window.dispatchEvent(new dom.window.Event('beforeinstallprompt', { cancelable: true }))
    assert.equal(dom.window.document.querySelector('#pwa-install-prompt').hidden, true)
})

import test from 'node:test'
import assert from 'node:assert/strict'
import { JSDOM } from 'jsdom'

import { initPwaInstallPrompt, isStandalonePwa } from '../static/js/pwa-install.mjs'

const createPromptDom = () => {
    const dom = new JSDOM(`
    <div id="toast-container"></div>
    <button type="button" id="pwa-install-manual-btn" class="pwa-install-manual-btn">Install</button>
`, { url: 'https://wiki.example/note' })
    return dom
}

test('does not show the manual install button when the page runs as an installed standalone PWA', () => {
    const dom = createPromptDom()
    Object.defineProperty(dom.window, 'matchMedia', {
        value: () => ({ matches: true }),
    })

    assert.equal(isStandalonePwa(dom.window), true)
    initPwaInstallPrompt(dom.window.document, dom.window)
    dom.window.dispatchEvent(new dom.window.Event('beforeinstallprompt', { cancelable: true }))

    assert.equal(dom.window.document.querySelector('#pwa-install-manual-btn').hidden, true)
})

test('captures early prompt from window.__deferredPwaPrompt and manual button triggers prompt', async () => {
    const dom = createPromptDom()
    Object.defineProperty(dom.window, 'matchMedia', {
        value: () => ({ matches: false }),
    })

    let promptCalled = false
    const earlyEvent = new dom.window.Event('beforeinstallprompt', { cancelable: true })
    earlyEvent.prompt = async () => {
        promptCalled = true
    }
    earlyEvent.userChoice = Promise.resolve({ outcome: 'accepted' })
    dom.window.__deferredPwaPrompt = earlyEvent

    initPwaInstallPrompt(dom.window.document, dom.window)

    const manualBtn = dom.window.document.querySelector('#pwa-install-manual-btn')
    assert.equal(manualBtn.hidden, false)

    await manualBtn.click()
    assert.equal(promptCalled, true)
})

test('manual install button displays fallback toast when no prompt is available', () => {
    const dom = createPromptDom()
    Object.defineProperty(dom.window, 'matchMedia', {
        value: () => ({ matches: false }),
    })
    let toastMessage = ''
    dom.window.showToast = msg => {
        toastMessage = msg
    }
    initPwaInstallPrompt(dom.window.document, dom.window)

    const manualBtn = dom.window.document.querySelector('#pwa-install-manual-btn')
    manualBtn.click()

    assert.ok(toastMessage.length > 0)
})

test('appinstalled event clears prompt and hides manual install button', () => {
    const dom = createPromptDom()
    Object.defineProperty(dom.window, 'matchMedia', {
        value: () => ({ matches: false }),
    })
    initPwaInstallPrompt(dom.window.document, dom.window)

    const event = new dom.window.Event('beforeinstallprompt', { cancelable: true })
    event.prompt = async () => {}
    dom.window.dispatchEvent(event)

    dom.window.dispatchEvent(new dom.window.Event('appinstalled'))
    assert.equal(dom.window.document.querySelector('#pwa-install-manual-btn').hidden, true)
})

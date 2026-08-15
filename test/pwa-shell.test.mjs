import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

import { HTML } from '../src/templates/base.js'

const staticFile = file => readFileSync(new URL(`../static/${file}`, import.meta.url), 'utf8')
const homeTemplate = readFileSync(new URL('../src/templates/pages.js', import.meta.url), 'utf8')
const workerSource = readFileSync(new URL('../src/index.js', import.meta.url), 'utf8')
const offlinePageSource = readFileSync(new URL('../src/offline_page.js', import.meta.url), 'utf8')
const baseCssSource = readFileSync(new URL('../src/styles/base.css.js', import.meta.url), 'utf8')
const installPromptSource = staticFile('js/pwa-install.mjs')

test('every rendered page advertises the installable web app manifest', () => {
    const page = HTML({
        lang: 'zh-TW',
        title: 'PWA test',
        content: '',
        ext: {},
        isEdit: true,
        path: 'pwa-test',
        shareId: '',
    })

    assert.match(page, /<link rel="manifest" href="\/app\.webmanifest" \/>/)
    assert.match(page, /navigator\.serviceWorker\.register\('\/sw\.js'\)/)
})

test('the homepage registers the PWA before it redirects to a new note', () => {
    assert.match(homeTemplate, /<link rel="manifest" href="\/app\.webmanifest" \/>/)
    assert.match(homeTemplate, /navigator\.serviceWorker\.register\('\/sw\.js'\)/)
})

test('manifest describes a standalone david888 wiki installation', () => {
    const manifest = JSON.parse(staticFile('app.webmanifest'))

    assert.equal(manifest.name, 'david888 wiki')
    assert.equal(manifest.start_url, '/')
    assert.equal(manifest.scope, '/')
    assert.equal(manifest.display, 'standalone')
    assert.ok(manifest.icons.some(icon => icon.src === '/notepad-icon-192.png' && icon.sizes === '192x192'))
    assert.ok(manifest.icons.some(icon => icon.src === '/notepad-icon.png' && icon.sizes === '512x512'))
})

test('service worker precaches only the safe application shell and falls back offline for navigation', () => {
    const worker = staticFile('sw.js')

    assert.match(worker, /const PRECACHE_URLS = \[/)
    assert.match(worker, /const OFFLINE_URL = '\/_pwa-offline'/)
    assert.match(worker, /request\.method !== 'GET'/)
    assert.match(worker, /request\.mode === 'navigate'/)
    assert.match(worker, /caches\.match\(OFFLINE_URL\)/)
    assert.doesNotMatch(worker, /\/share\//)
    assert.doesNotMatch(worker, /\/api\//)
})

test('the offline fallback has a dedicated Worker route before dynamic note routing', () => {
    assert.match(workerSource, /router\.get\('\/_pwa-offline', \(\) => createOfflinePageResponse\(\)\)/)
    assert.match(offlinePageSource, /目前離線中/)
    assert.match(offlinePageSource, /You.re offline/)
})

test('installable browsers receive an in-app install action that triggers the deferred prompt', () => {
    const page = HTML({
        lang: 'zh-TW',
        title: 'PWA install',
        content: '',
        ext: {},
        isEdit: true,
        path: 'pwa-install',
        shareId: '',
    })

    assert.match(page, /id="pwa-install-manual-btn"/)
    assert.doesNotMatch(page, /id="pwa-install-prompt"/)
    assert.match(page, /window\.__deferredPwaPrompt/)
    assert.match(page, /src="\/js\/pwa-install\.mjs"/)
    assert.match(installPromptSource, /beforeinstallprompt/)
    assert.match(installPromptSource, /activePrompt\.prompt\(\)/)
    assert.match(installPromptSource, /appinstalled/)
    assert.match(baseCssSource, /\.pwa-install-manual-btn\[hidden\]/)
    assert.match(baseCssSource, /@media \(display-mode: standalone\)/)
})

/**
 * src/templates/pages.js
 * NeedPasswd and Page404 template functions
 */
import { SUPPORTED_LANG } from '../constant'
import { HTML } from './base'
import { EDITOR_PREFERENCE_MODAL } from './common.js'

const escapeHtml = value => String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')

export const NeedPasswd = data => HTML({ tips: SUPPORTED_LANG[data.lang].tipEncrypt, showPwPrompt: true, ...data })
export const Page404 = data => HTML({ tips: SUPPORTED_LANG[data.lang].tip404, ...data })

export const Home = ({ lang = 'zh-TW', canonicalUrl, ogImageUrl }) => `
<!DOCTYPE html>
<html lang="${lang === 'zh-TW' ? 'zh-Hant-TW' : 'en'}">
<head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>DAVID888 WIKI - Markdown wiki for You</title>
    <meta name="description" content="DAVID888 WIKI is a fast Markdown wiki for writing, publishing, and sharing notes." />
    <meta name="robots" content="index,follow" />
    <meta name="theme-color" content="#0f172a" />
    <link rel="manifest" href="/app.webmanifest" />
    <link rel="canonical" href="${escapeHtml(canonicalUrl)}" />
    <meta property="og:site_name" content="DAVID888 WIKI" />
    <meta property="og:locale" content="en_US" />
    <meta property="og:type" content="website" />
    <meta property="og:title" content="DAVID888 WIKI - Markdown wiki for You" />
    <meta property="og:description" content="DAVID888 WIKI is a fast Markdown wiki for writing, publishing, and sharing notes." />
    <meta property="og:url" content="${escapeHtml(canonicalUrl)}" />
    <meta property="og:image" content="${escapeHtml(ogImageUrl)}" />
    <meta property="og:image:secure_url" content="${escapeHtml(ogImageUrl)}" />
    <meta property="og:image:type" content="image/png" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    <meta property="og:image:alt" content="DAVID888 WIKI social card" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="DAVID888 WIKI - Markdown wiki for You" />
    <meta name="twitter:description" content="DAVID888 WIKI is a fast Markdown wiki for writing, publishing, and sharing notes." />
    <meta name="twitter:image" content="${escapeHtml(ogImageUrl)}" />
    <meta name="twitter:image:alt" content="DAVID888 WIKI social card" />
    <script type="application/ld+json">{"@context":"https://schema.org","@type":"WebSite","name":"DAVID888 WIKI","description":"DAVID888 WIKI is a fast Markdown wiki for writing, publishing, and sharing notes.","url":"${escapeHtml(canonicalUrl)}","image":"${escapeHtml(ogImageUrl)}"}</script>
    <style>
        :root { color-scheme: light; font-family: Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; }
        body { min-height: 100vh; margin: 0; background: #f8f7f3; color: #2c2a29; }
        .home-shell { display: grid; min-height: 100vh; place-items: center; padding: 24px; box-sizing: border-box; }
        .home-brand { text-align: center; color: #716c65; font-size: 14px; letter-spacing: .04em; }
        .modal { display: none; }
        .modal-mask { position: fixed; inset: 0; z-index: 1000; background: rgba(37, 35, 32, .48); }
        .editor-preference-content { position: fixed; top: 50%; left: 50%; z-index: 1001; width: min(560px, calc(100vw - 32px)); box-sizing: border-box; padding: 26px; transform: translate(-50%, -50%); border: 1px solid #e2dacd; border-radius: 14px; background: #fff; box-shadow: 0 18px 48px rgba(37,35,32,.24); }
        .editor-preference-content h2 { margin: 0 0 8px; font-size: 20px; }
        .editor-preference-content > p { margin: 0 0 18px; color: #6b6965; font-size: 14px; line-height: 1.55; }
        .editor-preference-options { display: grid; gap: 10px; margin: 0; padding: 0; border: 0; }
        .editor-preference-grid { grid-template-columns: repeat(auto-fit, minmax(210px, 1fr)); gap: 12px; }
        .editor-preference-option { display: flex; gap: 11px; align-items: flex-start; padding: 14px; border: 1.5px solid #e2dacd; border-radius: 12px; cursor: pointer; background: #fff; transition: border-color 0.16s ease, background 0.16s ease, transform 0.14s ease, box-shadow 0.14s ease; }
        .editor-preference-option:hover { border-color: #c8654b; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05); }
        .editor-preference-option:has(input:checked), .editor-preference-option.is-selected { border-color: #c8654b; background: #faf2ed; }
        .editor-preference-option.is-recommended { border-color: #c8654b; }
        .editor-preference-option input { margin-top: 3px; accent-color: #c8654b; }
        .editor-preference-copy { display: flex !important; flex-direction: column; gap: 6px; width: 100%; }
        .editor-preference-header { display: flex; align-items: center; justify-content: space-between; gap: 6px; }
        .editor-preference-badge { font-size: 11px; font-weight: 600; padding: 2px 7px; border-radius: 999px; background: rgba(0, 0, 0, 0.06); color: #6b6965; white-space: nowrap; }
        .editor-preference-badge-accent { background: #fae8e3; color: #c8654b; }
        .editor-card-action { margin-top: 6px; width: 100%; font-size: 13px; height: 32px; }
        .editor-preference-option span { display: grid; gap: 3px; }
        .editor-preference-option strong { font-size: 14px; }
        .editor-preference-option small { color: #6b6965; font-size: 12px; line-height: 1.45; }
        .editor-preference-remember { display: inline-flex; gap: 8px; align-items: center; margin-top: 16px; font-size: 13px; cursor: pointer; }
        .editor-preference-remember input { accent-color: #c8654b; }
        .editor-preference-actions { display: flex; justify-content: flex-end; gap: 8px; margin-top: 20px; }
        .opt-button { min-width: 76px; height: 36px; padding: 0 12px; border: 1px solid #d8d0c4; border-radius: 7px; background: #fff; color: #2c2a29; font-weight: 700; cursor: pointer; }
        .opt-button-accent { border-color: #c8654b; background: #c8654b; color: #fff; }
        .opt-button:focus-visible, .editor-preference-option:has(input:focus-visible) { outline: 2px solid #c8654b; outline-offset: 2px; }
        .sr-only { position: absolute; width: 1px; height: 1px; padding: 0; overflow: hidden; clip: rect(0,0,0,0); white-space: nowrap; border: 0; }
        @media (prefers-reduced-motion: reduce) { *, *::before, *::after { scroll-behavior: auto !important; transition-duration: .01ms !important; animation-duration: .01ms !important; } }
    </style>
</head>
<body>
    <main class="home-shell"><p class="home-brand">DAVID888 WIKI</p></main>
    ${EDITOR_PREFERENCE_MODAL(lang, { autoOpen: true })}
    <script type="module" src="/js/editor-preference.mjs"></script>
    <script>if ('serviceWorker' in navigator) navigator.serviceWorker.register('/sw.js').catch(() => {})</script>
</body>
</html>
`

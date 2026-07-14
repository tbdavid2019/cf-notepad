/**
 * src/templates/pages.js
 * NeedPasswd and Page404 template functions
 */
import { SUPPORTED_LANG } from '../constant'
import { HTML } from './base'

const escapeHtml = value => String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')

const escapeScriptJson = value => JSON.stringify(String(value || '')).replace(/</g, '\\u003c')

export const NeedPasswd = data => HTML({ tips: SUPPORTED_LANG[data.lang].tipEncrypt, showPwPrompt: true, ...data })
export const Page404 = data => HTML({ tips: SUPPORTED_LANG[data.lang].tip404, ...data })

export const Home = ({ nextUrl, canonicalUrl, ogImageUrl }) => `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>DAVID888 WIKI - Markdown wiki for You</title>
    <meta name="description" content="DAVID888 WIKI is a fast Markdown wiki for writing, publishing, and sharing notes." />
    <meta name="robots" content="index,follow" />
    <meta name="theme-color" content="#0f172a" />
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
</head>
<body>
    <main>
        <h1>DAVID888 WIKI</h1>
        <p>Markdown wiki for You</p>
        <a href="${escapeHtml(nextUrl)}">Open a new note</a>
    </main>
    <script>window.location.replace(${escapeScriptJson(nextUrl)})</script>
</body>
</html>
`

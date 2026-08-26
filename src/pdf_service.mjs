/**
 * Takumi-PDF Rendering Service for CF-Notepad / David888 Wiki
 * Generates paged, selectable-text vector PDF documents from Markdown/HTML without Chromium.
 */

import * as takumi from 'takumi-pdf'
import { fromHtml } from '@takumi-rs/helpers/html'
import { googleFonts } from '@takumi-rs/helpers'
import { extractEmojis } from '@takumi-rs/helpers/emoji'
import { renderMarkdownToHtml } from './markdown-processor.mjs'

// In-memory cache for loaded font subsets to eliminate repeated Google Font network round-trips
let cachedFonts = null
let fontFetchPromise = null

/**
 * Ensures Google Fonts (Noto Sans TC, JetBrains Mono, Inter) are loaded
 * @returns {Promise<Array>} Loaded font subsets
 */
export async function getPdfFonts() {
    if (cachedFonts) return cachedFonts
    if (fontFetchPromise) return fontFetchPromise

    fontFetchPromise = (async () => {
        try {
            const fonts = await googleFonts(['Noto Sans TC', 'JetBrains Mono', 'Inter'])
            cachedFonts = fonts
            return fonts
        } catch (err) {
            console.warn('[takumi-pdf] Failed to fetch Google Fonts:', err)
            return []
        } finally {
            fontFetchPromise = null
        }
    })()

    return fontFetchPromise
}

/**
 * Builds base typography CSS styles for PDF rendering
 * @returns {string} Inlined CSS styles
 */
export function getPdfBaseStyles() {
    return `
        font-family: 'Noto Sans TC', 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        color: #1f2937;
        line-height: 1.65;
        font-size: 13px;
        padding: 0;
        margin: 0;
    `
}

/**
 * Formats Markdown or HTML into a styled container for Takumi-PDF
 * @param {string} rawHtml - HTML content
 * @param {object} meta - Document metadata
 * @returns {string} Fully styled HTML string
 */
export function buildPdfDocumentHtml(rawHtml, meta = {}) {
    const { title = '' } = meta
    const titleHeader = title ? `<h1 style="font-size: 24px; font-weight: 700; color: #111827; border-bottom: 2px solid #e5e7eb; padding-bottom: 10px; margin-bottom: 20px; margin-top: 0;">${title}</h1>` : ''

    return `
        <div style="${getPdfBaseStyles()}">
            <style>
                h1, h2, h3, h4, h5, h6 { color: #111827; font-weight: 700; line-height: 1.3; margin-top: 20px; margin-bottom: 10px; }
                h1 { font-size: 22px; border-bottom: 1px solid #e5e7eb; padding-bottom: 8px; }
                h2 { font-size: 17px; border-bottom: 1px solid #f3f4f6; padding-bottom: 6px; }
                h3 { font-size: 15px; }
                h4 { font-size: 13px; }
                p { margin-top: 0; margin-bottom: 12px; }
                strong { font-weight: 700; color: #111827; }
                em { font-style: italic; }
                a { color: #2563eb; text-decoration: none; }
                blockquote {
                    margin: 14px 0;
                    padding: 8px 14px;
                    border-left: 4px solid #3b82f6;
                    background-color: #f8fafc;
                    color: #4b5563;
                    border-radius: 0 6px 6px 0;
                }
                pre {
                    background-color: #f8fafc;
                    border: 1px solid #e2e8f0;
                    border-radius: 6px;
                    padding: 12px 14px;
                    margin: 14px 0;
                    overflow: hidden;
                    font-family: 'JetBrains Mono', monospace;
                    font-size: 11.5px;
                    line-height: 1.5;
                    color: #0f172a;
                    break-inside: avoid;
                }
                code {
                    font-family: 'JetBrains Mono', monospace;
                    font-size: 11.5px;
                    background-color: #f1f5f9;
                    padding: 2px 5px;
                    border-radius: 4px;
                    color: #0f172a;
                }
                pre code {
                    background-color: transparent;
                    padding: 0;
                    border-radius: 0;
                }
                table {
                    width: 100%;
                    border-collapse: collapse;
                    margin: 16px 0;
                    font-size: 12px;
                    break-inside: avoid;
                }
                th, td {
                    border: 1px solid #e5e7eb;
                    padding: 7px 10px;
                    text-align: left;
                }
                th {
                    background-color: #f9fafb;
                    font-weight: 600;
                    color: #374151;
                }
                tr:nth-child(even) td {
                    background-color: #fcfdfd;
                }
                ul, ol {
                    margin-top: 0;
                    margin-bottom: 12px;
                    padding-left: 20px;
                }
                li {
                    margin-bottom: 4px;
                }
                hr {
                    border: 0;
                    border-top: 1px solid #e5e7eb;
                    margin: 20px 0;
                }
                img {
                    max-width: 100%;
                    height: auto;
                    border-radius: 6px;
                    margin: 12px 0;
                }
                mark, .markdown-highlight {
                    background-color: #fef08a;
                    color: #854d0e;
                    padding: 1px 3px;
                    border-radius: 3px;
                }
                .github-alert {
                    margin: 14px 0;
                    padding: 10px 14px;
                    border-radius: 6px;
                    border-left: 4px solid #3b82f6;
                    background-color: #eff6ff;
                    color: #1e40af;
                }
            </style>
            ${titleHeader}
            ${rawHtml}
        </div>
    `
}

/**
 * Renders Markdown text to a PDF binary buffer (Uint8Array)
 * @param {string} markdown - Input Markdown content
 * @param {object} options - PDF rendering options
 * @returns {Promise<Uint8Array>} PDF binary bytes
 */
export async function renderMarkdownToPdf(markdown = '', options = {}) {
    const {
        title = 'Document',
        author = 'David888 Wiki',
        size = 'a4',
        margin = { top: 40, right: 36, bottom: 40, left: 36 },
        landscape = false,
        theme = 'claude-canvas',
        siteUrl = 'https://wiki.david888.com',
    } = options

    // 1. Render Markdown to HTML string
    const rawHtml = renderMarkdownToHtml(markdown, { theme, fullHtml: false, title })

    // 2. Wrap with styled layout
    const documentHtml = buildPdfDocumentHtml(rawHtml, { title })

    // 3. Parse to Takumi node tree and extract Emojis
    const { node } = fromHtml(documentHtml)
    const processedNode = extractEmojis(node, 'twemoji')

    // 4. Build Header & Footer nodes with page counters
    const safeTitle = (title || 'David888 Wiki').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    const headerHtml = `
        <div style="display: flex; justify-content: space-between; align-items: center; width: 100%; font-size: 8.5px; color: #9ca3af; border-bottom: 1px solid #e5e7eb; padding-bottom: 5px; font-family: 'Noto Sans TC', 'Inter', sans-serif;">
            <span style="font-weight: 600; color: #6b7280;">David888 Wiki</span>
            <span style="color: #9ca3af; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 60%;">${safeTitle}</span>
        </div>
    `
    const footerHtml = `
        <div style="display: flex; justify-content: space-between; align-items: center; width: 100%; font-size: 8.5px; color: #9ca3af; border-top: 1px solid #e5e7eb; padding-top: 5px; font-family: 'Noto Sans TC', 'Inter', sans-serif;">
            <span style="color: #9ca3af;">${siteUrl}</span>
            <span>Page <span class="pageNumber"></span> of <span class="totalPages"></span></span>
        </div>
    `

    const headerNode = extractEmojis(fromHtml(headerHtml).node, 'twemoji')
    const footerNode = extractEmojis(fromHtml(footerHtml).node, 'twemoji')

    // 5. Fetch / reuse Google Fonts (Noto Sans TC, JetBrains Mono, Inter)
    const fonts = await getPdfFonts()

    // 6. Execute Takumi-PDF vector rendering
    const pdfBytes = await takumi.render(processedNode, {
        size,
        landscape,
        margin,
        header: headerNode,
        footer: footerNode,
        fonts,
        metadata: {
            title,
            authors: [author],
            creator: 'David888 Wiki',
            creationDate: new Date().toISOString().split('.')[0] + 'Z',
        },
    })

    return pdfBytes
}

/**
 * Creates a standard downloadable PDF Response
 * @param {Uint8Array} pdfBytes - PDF binary data
 * @param {string} filename - Download file name
 * @returns {Response} HTTP response with application/pdf headers
 */
export function createPdfResponse(pdfBytes, filename = 'document.pdf') {
    const safeFilename = filename.endsWith('.pdf') ? filename : `${filename}.pdf`
    const asciiFilename = safeFilename.replace(/[^\x20-\x7E]/g, '_') || 'document.pdf'
    const encodedFilename = encodeURIComponent(safeFilename)

    return new Response(pdfBytes, {
        status: 200,
        headers: {
            'Content-Type': 'application/pdf',
            'Content-Disposition': `attachment; filename="${asciiFilename}"; filename*=UTF-8''${encodedFilename}`,
            'Content-Length': String(pdfBytes.length),
            'Cache-Control': 'public, max-age=60, s-maxage=300',
        },
    })
}

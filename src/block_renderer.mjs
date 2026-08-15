import { isTiptapBlockDocument, normalizeTiptapBlockDocument } from './block_document.mjs'

export const BLOCK_DOCUMENT_VERSION = 1

const BLOCK_TYPES = new Set([
    'paragraph', 'heading', 'bulletList', 'taskList', 'code', 'quote',
    'divider', 'slideBreak', 'image', 'file', 'youtube', 'pdf',
    'mermaid', 'echarts', 'raw',
])

function escapeHtml(value = '') {
    return String(value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;')
}

function text(value = '') {
    return typeof value === 'string' ? value : ''
}

function safeUrl(value = '') {
    const raw = text(value).trim()
    if (!raw) return ''
    if (raw.startsWith('/') && !raw.startsWith('//')) return raw

    try {
        const parsed = new URL(raw)
        return parsed.protocol === 'https:' || parsed.protocol === 'http:' ? parsed.href : ''
    } catch {
        return ''
    }
}

function safeDimension(value = '') {
    const match = text(value).trim().match(/^(\d{1,4})(px|%)$/)
    if (!match) return ''
    const size = Number(match[1])
    if (size < 1 || (match[2] === '%' && size > 100) || (match[2] === 'px' && size > 5000)) return ''
    return `${size}${match[2]}`
}

function getYouTubeVideoId(props = {}) {
    const directId = text(props.videoId).trim()
    if (/^[a-zA-Z0-9_-]{11}$/.test(directId)) return directId

    const url = safeUrl(props.url)
    if (!url || url.startsWith('/')) return ''
    try {
        const parsed = new URL(url)
        const host = parsed.hostname.toLowerCase().replace(/^www\./, '')
        if (host === 'youtu.be') return /^[a-zA-Z0-9_-]{11}$/.test(parsed.pathname.slice(1)) ? parsed.pathname.slice(1) : ''
        if (host === 'youtube.com' || host === 'm.youtube.com') {
            const candidate = parsed.searchParams.get('v') || parsed.pathname.match(/^\/embed\/([a-zA-Z0-9_-]{11})/)?.[1] || ''
            return /^[a-zA-Z0-9_-]{11}$/.test(candidate) ? candidate : ''
        }
    } catch {}
    return ''
}

function getDocumentForRendering(blockInput) {
    try {
        if (typeof blockInput === 'string') return parseBlockDocument(blockInput, { allowTextFallback: false })
        return validateBlockDocument(blockInput || createEmptyBlockDocument())
    } catch {
        return createEmptyBlockDocument()
    }
}

function renderTiptapInline(nodes = []) {
    return nodes.map(node => {
        if (!node || typeof node !== 'object') return ''
        if (node.type === 'hardBreak') return '<br>'
        if (node.type !== 'text') return renderTiptapInline(node.content || [])

        let output = escapeHtml(text(node.text))
        for (const mark of node.marks || []) {
            if (!mark || typeof mark !== 'object') continue
            if (mark.type === 'bold') output = `<strong>${output}</strong>`
            else if (mark.type === 'italic') output = `<em>${output}</em>`
            else if (mark.type === 'strike') output = `<s>${output}</s>`
            else if (mark.type === 'underline') output = `<u>${output}</u>`
            else if (mark.type === 'code') output = `<code>${output}</code>`
            else if (mark.type === 'link') {
                const href = safeUrl(mark.attrs?.href)
                output = href ? `<a href="${escapeHtml(href)}" target="_blank" rel="noopener noreferrer">${output}</a>` : output
            }
        }
        return output
    }).join('')
}

function renderTiptapNode(node = {}) {
    const content = Array.isArray(node.content) ? node.content : []
    const attrs = node.attrs && typeof node.attrs === 'object' ? node.attrs : {}
    switch (node.type) {
        case 'doc': return content.map(renderTiptapNode).join('\n')
        case 'text':
        case 'hardBreak': return renderTiptapInline([node])
        case 'paragraph': return `<p>${renderTiptapInline(content)}</p>`
        case 'heading': {
            const level = Math.min(Math.max(parseInt(attrs.level, 10) || 1, 1), 6)
            return `<h${level}>${renderTiptapInline(content)}</h${level}>`
        }
        case 'blockquote': return `<blockquote>${content.map(renderTiptapNode).join('')}</blockquote>`
        case 'bulletList': return `<ul class="block-bullet-list">${content.map(renderTiptapNode).join('')}</ul>`
        case 'orderedList': return `<ol>${content.map(renderTiptapNode).join('')}</ol>`
        case 'listItem': return `<li>${content.map(renderTiptapNode).join('')}</li>`
        case 'taskList': return `<ul class="contains-task-list block-task-list">${content.map(renderTiptapNode).join('')}</ul>`
        case 'taskItem': return `<li class="task-list-item"><input type="checkbox" class="task-list-item-checkbox"${attrs.checked === true ? ' checked' : ''} disabled> ${content.map(renderTiptapNode).join('')}</li>`
        case 'table': return `<div class="block-table-wrap"><table class="block-table">${content.map(renderTiptapNode).join('')}</table></div>`
        case 'tableRow': return `<tr>${content.map(renderTiptapNode).join('')}</tr>`
        case 'tableHeader':
        case 'tableCell': {
            const tag = node.type === 'tableHeader' ? 'th' : 'td'
            const colspan = Number.isInteger(Number(attrs.colspan)) && Number(attrs.colspan) > 1 && Number(attrs.colspan) <= 100 ? ` colspan="${Number(attrs.colspan)}"` : ''
            const rowspan = Number.isInteger(Number(attrs.rowspan)) && Number(attrs.rowspan) > 1 && Number(attrs.rowspan) <= 100 ? ` rowspan="${Number(attrs.rowspan)}"` : ''
            const alignment = ['left', 'center', 'right', 'justify'].includes(attrs.textAlignment) ? ` style="text-align:${attrs.textAlignment}"` : ''
            return `<${tag}${colspan}${rowspan}${alignment}>${renderTiptapInline(content)}</${tag}>`
        }
        case 'codeBlock': {
            const language = text(attrs.language).replace(/[^a-zA-Z0-9_+-]/g, '')
            return `<pre><code${language ? ` class="language-${language}"` : ''}>${escapeHtml(content.map(item => text(item.text)).join(''))}</code></pre>`
        }
        case 'horizontalRule': return '<hr>'
        case 'image': return renderBlockToHtml({ version: 1, blocks: [{ type: 'image', props: attrs }] })
        case 'david888Embed': {
            const kind = text(attrs.kind)
            return BLOCK_TYPES.has(kind) ? renderBlockToHtml({ version: 1, blocks: [{ type: kind, props: attrs }] }) : ''
        }
        default: return content.map(renderTiptapNode).join('')
    }
}

function markdownTiptapInline(nodes = []) {
    return nodes.map(node => {
        if (!node || typeof node !== 'object') return ''
        if (node.type === 'hardBreak') return '\n'
        if (node.type !== 'text') return markdownTiptapInline(node.content || [])
        let output = text(node.text)
        for (const mark of node.marks || []) {
            if (mark?.type === 'bold') output = `**${output}**`
            else if (mark?.type === 'italic') output = `*${output}*`
            else if (mark?.type === 'strike') output = `~~${output}~~`
            else if (mark?.type === 'code') output = `\`${output}\``
            else if (mark?.type === 'link' && safeUrl(mark.attrs?.href)) output = `[${output}](${safeUrl(mark.attrs.href)})`
        }
        return output
    }).join('')
}

function tableCellMarkdown(node = {}) {
    return markdownTiptapInline(node.content || []).replace(/\n/g, '<br>').replace(/\|/g, '\\|')
}

function blockTableToMarkdown(node = {}) {
    const rows = (node.content || []).filter(row => row?.type === 'tableRow')
    if (rows.length === 0) return ''
    const cells = rows.map(row => (row.content || []).filter(cell => cell?.type === 'tableCell' || cell?.type === 'tableHeader'))
    const hasSpans = cells.some(row => row.some(cell => Number(cell?.attrs?.colspan) > 1 || Number(cell?.attrs?.rowspan) > 1))
    const hasHeader = Number(node.attrs?.headerRows) > 0 || cells[0].some(cell => cell?.type === 'tableHeader')
    if (hasSpans || !hasHeader) return renderTiptapNode(node)

    const width = Math.max(...cells.map(row => row.length))
    const normalize = row => Array.from({ length: width }, (_, index) => tableCellMarkdown(row[index]))
    const header = normalize(cells[0])
    const alignment = Array.from({ length: width }, (_, index) => {
        const value = cells[0][index]?.attrs?.textAlignment
        return value === 'left' ? ':---' : value === 'center' ? ':---:' : value === 'right' ? '---:' : '---'
    })
    const body = cells.slice(1).map(row => `| ${normalize(row).join(' | ')} |`)
    return [`| ${header.join(' | ')} |`, `| ${alignment.join(' | ')} |`, ...body].join('\n')
}

function blockToMarkdownFromTiptap(node = {}) {
    const content = Array.isArray(node.content) ? node.content : []
    const attrs = node.attrs && typeof node.attrs === 'object' ? node.attrs : {}
    switch (node.type) {
        case 'doc': return content.map(blockToMarkdownFromTiptap).filter(Boolean).join('\n\n')
        case 'paragraph': return markdownTiptapInline(content)
        case 'heading': return '#'.repeat(Math.min(Math.max(parseInt(attrs.level, 10) || 1, 1), 6)) + ' ' + markdownTiptapInline(content)
        case 'blockquote': return content.map(blockToMarkdownFromTiptap).map(line => `> ${line}`).join('\n')
        case 'bulletList': return content.map(blockToMarkdownFromTiptap).map(line => `- ${line}`).join('\n')
        case 'orderedList': return content.map((item, index) => `${index + 1}. ${blockToMarkdownFromTiptap(item)}`).join('\n')
        case 'listItem': return content.map(blockToMarkdownFromTiptap).join('\n')
        case 'taskList': return content.map(blockToMarkdownFromTiptap).join('\n')
        case 'taskItem': return `- ${attrs.checked ? '[x]' : '[ ]'} ${content.map(blockToMarkdownFromTiptap).join('')}`
        case 'table': return blockTableToMarkdown(node)
        case 'codeBlock': return `\`\`\`${text(attrs.language)}\n${content.map(item => text(item.text)).join('')}\n\`\`\``
        case 'horizontalRule': return '---'
        case 'image': return blockToMarkdown({ version: 1, blocks: [{ type: 'image', props: attrs }] })
        case 'david888Embed': return BLOCK_TYPES.has(text(attrs.kind)) ? blockToMarkdown({ version: 1, blocks: [{ type: attrs.kind, props: attrs }] }) : ''
        default: return content.map(blockToMarkdownFromTiptap).join('\n')
    }
}

export function createEmptyBlockDocument() {
    return { version: BLOCK_DOCUMENT_VERSION, blocks: [] }
}

export function validateBlockDocument(input) {
    if (isTiptapBlockDocument(input)) return normalizeTiptapBlockDocument(input)
    if (!input || typeof input !== 'object' || Array.isArray(input) || !Array.isArray(input.blocks)) {
        throw new TypeError('Invalid block document')
    }

    const version = Number.isInteger(input.version) ? input.version : BLOCK_DOCUMENT_VERSION
    if (version !== BLOCK_DOCUMENT_VERSION) throw new TypeError('Unsupported block document version')

    return {
        version,
        blocks: input.blocks.map((block, index) => {
            if (!block || typeof block !== 'object' || Array.isArray(block)) {
                throw new TypeError(`Invalid block at index ${index}`)
            }
            if (!BLOCK_TYPES.has(block.type)) throw new TypeError(`Unsupported block type at index ${index}`)
            if (block.props !== undefined && (!block.props || typeof block.props !== 'object' || Array.isArray(block.props))) {
                throw new TypeError(`Invalid block props at index ${index}`)
            }
            return {
                id: text(block.id).slice(0, 128),
                type: block.type,
                props: block.props || {},
            }
        }),
    }
}

export function parseBlockDocument(value = '', { allowTextFallback = true } = {}) {
    if (value === '' || value === null || value === undefined) return createEmptyBlockDocument()
    if (typeof value !== 'string') throw new TypeError('Block document must be a JSON string')

    try {
        return validateBlockDocument(JSON.parse(value))
    } catch (error) {
        if (!allowTextFallback) throw error
    }

    const trimmed = value.trim()
    return trimmed
        ? { version: BLOCK_DOCUMENT_VERSION, blocks: [{ id: 'b-init', type: 'paragraph', props: { text: trimmed } }] }
        : createEmptyBlockDocument()
}

export function renderBlockToHtml(blockInput) {
    const document = getDocumentForRendering(blockInput)
    if (isTiptapBlockDocument(document)) return renderTiptapNode(document) || '<p></p>'
    const { blocks } = document
    if (blocks.length === 0) return '<p></p>'

    const htmlParts = []
    let currentListType = null
    const closeListIfNeeded = () => {
        if (currentListType) htmlParts.push('</ul>')
        currentListType = null
    }

    for (const block of blocks) {
        const { id, type, props } = block
        const dataAttr = id ? ` data-block-id="${escapeHtml(id)}"` : ''
        if (type !== 'bulletList' && type !== 'taskList') closeListIfNeeded()

        switch (type) {
            case 'heading': {
                const level = Math.min(Math.max(parseInt(props.level, 10) || 1, 1), 6)
                htmlParts.push(`<h${level}${dataAttr}>${escapeHtml(text(props.text))}</h${level}>`)
                break
            }
            case 'bulletList': {
                if (currentListType !== 'bullet') {
                    closeListIfNeeded()
                    htmlParts.push('<ul class="block-bullet-list">')
                    currentListType = 'bullet'
                }
                htmlParts.push(`<li${dataAttr}>${escapeHtml(text(props.text))}</li>`)
                break
            }
            case 'taskList': {
                if (currentListType !== 'task') {
                    closeListIfNeeded()
                    htmlParts.push('<ul class="contains-task-list block-task-list">')
                    currentListType = 'task'
                }
                const checked = props.checked === true ? ' checked' : ''
                htmlParts.push(`<li class="task-list-item"${dataAttr}><input type="checkbox" class="task-list-item-checkbox"${checked} disabled> ${escapeHtml(text(props.text))}</li>`)
                break
            }
            case 'code': {
                const language = text(props.language).replace(/[^a-zA-Z0-9_+-]/g, '')
                const langClass = language ? ` class="language-${language}"` : ''
                htmlParts.push(`<pre${dataAttr}><code${langClass}>${escapeHtml(text(props.text))}</code></pre>`)
                break
            }
            case 'quote':
                htmlParts.push(`<blockquote${dataAttr}><p>${escapeHtml(text(props.text))}</p></blockquote>`)
                break
            case 'divider':
                htmlParts.push(`<hr${dataAttr}>`)
                break
            case 'slideBreak':
                htmlParts.push(`<hr class="slide-break"${dataAttr} data-slide-break="true">`)
                break
            case 'image': {
                const src = safeUrl(props.src)
                if (src) {
                    const width = safeDimension(props.width)
                    htmlParts.push(`<p${dataAttr}><img src="${escapeHtml(src)}" alt="${escapeHtml(text(props.alt))}"${width ? ` style="width: ${width};"` : ''}></p>`)
                }
                break
            }
            case 'youtube': {
                const videoId = getYouTubeVideoId(props)
                if (videoId) {
                    htmlParts.push(`<div class="youtube-embed-wrapper"${dataAttr}><iframe src="https://www.youtube-nocookie.com/embed/${videoId}" frameborder="0" allowfullscreen title="${escapeHtml(text(props.title) || 'YouTube video')}"></iframe></div>`)
                } else {
                    const url = safeUrl(props.url)
                    if (url) htmlParts.push(`<p${dataAttr}><a href="${escapeHtml(url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(url)}</a></p>`)
                }
                break
            }
            case 'pdf': {
                const url = safeUrl(props.url)
                if (url) htmlParts.push(`<div class="pdf-embed-wrapper"${dataAttr}><iframe src="${escapeHtml(url)}" width="100%" height="600" title="${escapeHtml(text(props.title) || 'PDF Document')}"></iframe></div>`)
                break
            }
            case 'mermaid':
                htmlParts.push(`<div class="mermaid-block-container"${dataAttr}><pre class="mermaid">${escapeHtml(text(props.source) || text(props.text))}</pre></div>`)
                break
            case 'echarts': {
                const optionJson = typeof props.optionJson === 'string' ? props.optionJson : JSON.stringify(props.optionJson || {})
                htmlParts.push(`<div class="echarts-block-container"${dataAttr}><div class="echarts" data-echarts-options="${escapeHtml(optionJson)}" style="width:100%;height:350px;"></div></div>`)
                break
            }
            case 'file': {
                const url = safeUrl(props.url)
                if (!url) break
                const mime = text(props.mimeType).toLowerCase()
                if (mime.startsWith('video/')) htmlParts.push(`<div class="media-video-wrapper"${dataAttr}><video controls src="${escapeHtml(url)}"></video></div>`)
                else if (mime.startsWith('audio/')) htmlParts.push(`<div class="media-audio-wrapper"${dataAttr}><audio controls src="${escapeHtml(url)}"></audio></div>`)
                else htmlParts.push(`<p${dataAttr}><a class="file-download-link" href="${escapeHtml(url)}" download target="_blank" rel="noopener noreferrer">📎 ${escapeHtml(text(props.name) || url)}</a></p>`)
                break
            }
            case 'raw':
                htmlParts.push(`<pre class="raw-block"${dataAttr}><code>${escapeHtml(text(props.content))}</code></pre>`)
                break
            case 'paragraph':
                htmlParts.push(`<p${dataAttr}>${escapeHtml(text(props.text))}</p>`)
                break
        }
    }

    closeListIfNeeded()
    return htmlParts.join('\n') || '<p></p>'
}

export function blockToMarkdown(blockInput) {
    const document = getDocumentForRendering(blockInput)
    if (isTiptapBlockDocument(document)) return blockToMarkdownFromTiptap(document)
    const { blocks } = document
    const lines = []

    for (const { type, props } of blocks) {
        switch (type) {
            case 'heading': {
                const level = Math.min(Math.max(parseInt(props.level, 10) || 1, 1), 6)
                lines.push('#'.repeat(level) + ' ' + text(props.text))
                break
            }
            case 'bulletList': lines.push('- ' + text(props.text)); break
            case 'taskList': lines.push(`- ${props.checked ? '[x]' : '[ ]'} ${text(props.text)}`); break
            case 'code': lines.push(`\`\`\`${text(props.language)}\n${text(props.text)}\n\`\`\``); break
            case 'quote': lines.push('> ' + text(props.text)); break
            case 'divider': lines.push('---'); break
            case 'slideBreak': lines.push('---'); break
            case 'image': lines.push(`![${text(props.alt)}](${safeUrl(props.src)})`); break
            case 'youtube': lines.push(safeUrl(props.url) || `https://www.youtube.com/watch?v=${getYouTubeVideoId(props)}`); break
            case 'pdf': lines.push(`[PDF Document](${safeUrl(props.url)})`); break
            case 'mermaid': lines.push(`\`\`\`mermaid\n${text(props.source) || text(props.text)}\n\`\`\``); break
            case 'echarts': lines.push(`\`\`\`echarts\n${typeof props.optionJson === 'string' ? props.optionJson : JSON.stringify(props.optionJson || {}, null, 2)}\n\`\`\``); break
            case 'file': lines.push(`[${text(props.name) || 'File'}](${safeUrl(props.url)})`); break
            case 'raw': lines.push(`\`\`\`html\n${text(props.content)}\n\`\`\``); break
            case 'paragraph': lines.push(text(props.text)); break
        }
        lines.push('')
    }
    return lines.join('\n').trim()
}

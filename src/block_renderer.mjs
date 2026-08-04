function escapeHtml(str = '') {
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;')
}

function escapeAttr(str = '') {
    return escapeHtml(str)
}

export function parseBlockDocument(value = '') {
    if (!value || typeof value !== 'string') {
        return { version: 1, blocks: [] }
    }
    try {
        const parsed = JSON.parse(value)
        if (parsed && typeof parsed === 'object' && Array.isArray(parsed.blocks)) {
            return parsed
        }
    } catch (e) {}
    const trimmed = String(value).trim()
    return {
        version: 1,
        blocks: trimmed ? [{ id: 'b-init', type: 'paragraph', props: { text: trimmed } }] : []
    }
}

export function renderBlockToHtml(blockInput, options = {}) {
    const doc = typeof blockInput === 'string' ? parseBlockDocument(blockInput) : (blockInput || { version: 1, blocks: [] })
    const blocks = Array.isArray(doc.blocks) ? doc.blocks : []

    if (blocks.length === 0) {
        return '<p></p>'
    }

    const htmlParts = []
    let currentListType = null

    const closeListIfNeeded = () => {
        if (currentListType === 'bullet') {
            htmlParts.push('</ul>')
            currentListType = null
        } else if (currentListType === 'task') {
            htmlParts.push('</ul>')
            currentListType = null
        }
    }

    for (const block of blocks) {
        const id = block.id || ''
        const type = block.type || 'paragraph'
        const props = block.props || {}
        const dataAttr = id ? ` data-block-id="${escapeAttr(id)}"` : ''

        if (type !== 'bulletList' && type !== 'taskList') {
            closeListIfNeeded()
        }

        switch (type) {
            case 'heading': {
                const level = Math.min(Math.max(parseInt(props.level, 10) || 1, 1), 6)
                htmlParts.push(`<h${level}${dataAttr}>${escapeHtml(props.text || '')}</h${level}>`)
                break
            }
            case 'bulletList': {
                if (currentListType !== 'bullet') {
                    closeListIfNeeded()
                    htmlParts.push('<ul class="block-bullet-list">')
                    currentListType = 'bullet'
                }
                htmlParts.push(`<li${dataAttr}>${escapeHtml(props.text || '')}</li>`)
                break
            }
            case 'taskList': {
                if (currentListType !== 'task') {
                    closeListIfNeeded()
                    htmlParts.push('<ul class="contains-task-list block-task-list">')
                    currentListType = 'task'
                }
                const checked = props.checked === true ? 'checked' : ''
                htmlParts.push(`<li class="task-list-item"${dataAttr}><input type="checkbox" class="task-list-item-checkbox" ${checked} disabled> ${escapeHtml(props.text || '')}</li>`)
                break
            }
            case 'code': {
                const lang = props.language ? ` class="language-${escapeAttr(props.language)}"` : ''
                htmlParts.push(`<pre${dataAttr}><code${lang}>${escapeHtml(props.text || '')}</code></pre>`)
                break
            }
            case 'quote': {
                htmlParts.push(`<blockquote${dataAttr}><p>${escapeHtml(props.text || '')}</p></blockquote>`)
                break
            }
            case 'divider': {
                htmlParts.push(`<hr${dataAttr}>`)
                break
            }
            case 'slideBreak': {
                htmlParts.push(`<hr class="slide-break"${dataAttr} data-slide-break="true">`)
                break
            }
            case 'image': {
                const src = props.src || ''
                const alt = props.alt || ''
                const width = props.width ? ` style="width: ${escapeAttr(props.width)};"` : ''
                htmlParts.push(`<p${dataAttr}><img src="${escapeAttr(src)}" alt="${escapeAttr(alt)}"${width}></p>`)
                break
            }
            case 'youtube': {
                const videoId = props.videoId || (props.url ? (props.url.match(/(?:v=|\/embed\/|youtu\.be\/)([a-zA-Z0-9_-]{11})/) || [])[1] : '')
                if (videoId) {
                    htmlParts.push(`<div class="youtube-embed-wrapper"${dataAttr}><iframe src="https://www.youtube-nocookie.com/embed/${escapeAttr(videoId)}" frameborder="0" allowfullscreen title="${escapeAttr(props.title || 'YouTube video')}"></iframe></div>`)
                } else {
                    htmlParts.push(`<p${dataAttr}><a href="${escapeAttr(props.url || '')}" target="_blank" rel="noopener noreferrer">${escapeHtml(props.url || 'YouTube link')}</a></p>`)
                }
                break
            }
            case 'pdf': {
                const url = props.url || ''
                htmlParts.push(`<div class="pdf-embed-wrapper"${dataAttr}><iframe src="${escapeAttr(url)}" width="100%" height="600px" title="${escapeAttr(props.title || 'PDF Document')}"></iframe></div>`)
                break
            }
            case 'mermaid': {
                const source = props.source || props.text || ''
                htmlParts.push(`<div class="mermaid-block-container"${dataAttr}><pre class="mermaid">${escapeHtml(source)}</pre></div>`)
                break
            }
            case 'echarts': {
                const optionJson = typeof props.optionJson === 'string' ? props.optionJson : JSON.stringify(props.optionJson || {})
                htmlParts.push(`<div class="echarts-block-container"${dataAttr}><div class="echarts" data-echarts-options="${escapeAttr(optionJson)}" style="width:100%;height:350px;"></div></div>`)
                break
            }
            case 'file': {
                const url = props.url || ''
                const name = props.name || props.url || 'Download File'
                const mime = props.mimeType || ''
                if (mime.startsWith('video/')) {
                    htmlParts.push(`<div class="media-video-wrapper"${dataAttr}><video controls src="${escapeAttr(url)}"></video></div>`)
                } else if (mime.startsWith('audio/')) {
                    htmlParts.push(`<div class="media-audio-wrapper"${dataAttr}><audio controls src="${escapeAttr(url)}"></audio></div>`)
                } else {
                    htmlParts.push(`<p${dataAttr}><a class="file-download-link" href="${escapeAttr(url)}" download target="_blank" rel="noopener noreferrer">📎 ${escapeHtml(name)}</a></p>`)
                }
                break
            }
            case 'raw': {
                htmlParts.push(`<div class="raw-block"${dataAttr}>${props.content || ''}</div>`)
                break
            }
            case 'paragraph':
            default: {
                htmlParts.push(`<p${dataAttr}>${escapeHtml(props.text || '')}</p>`)
                break
            }
        }
    }

    closeListIfNeeded()
    return htmlParts.join('\n')
}

export function blockToMarkdown(blockInput) {
    const doc = typeof blockInput === 'string' ? parseBlockDocument(blockInput) : (blockInput || { version: 1, blocks: [] })
    const blocks = Array.isArray(doc.blocks) ? doc.blocks : []

    const lines = []
    for (const block of blocks) {
        const type = block.type || 'paragraph'
        const props = block.props || {}

        switch (type) {
            case 'heading': {
                const level = Math.min(Math.max(parseInt(props.level, 10) || 1, 1), 6)
                lines.push('#'.repeat(level) + ' ' + (props.text || ''))
                break
            }
            case 'bulletList': {
                lines.push('- ' + (props.text || ''))
                break
            }
            case 'taskList': {
                const check = props.checked ? '[x]' : '[ ]'
                lines.push(`- ${check} ` + (props.text || ''))
                break
            }
            case 'code': {
                const lang = props.language || ''
                lines.push('```' + lang)
                lines.push(props.text || '')
                lines.push('```')
                break
            }
            case 'quote': {
                lines.push('> ' + (props.text || ''))
                break
            }
            case 'divider': {
                lines.push('---')
                break
            }
            case 'slideBreak': {
                lines.push('\n---\n')
                break
            }
            case 'image': {
                lines.push(`![${props.alt || ''}](${props.src || ''})`)
                break
            }
            case 'youtube': {
                lines.push(props.url || `https://www.youtube.com/watch?v=${props.videoId || ''}`)
                break
            }
            case 'pdf': {
                lines.push(`[PDF Document](${props.url || ''})`)
                break
            }
            case 'mermaid': {
                lines.push('```mermaid')
                lines.push(props.source || props.text || '')
                lines.push('```')
                break
            }
            case 'echarts': {
                lines.push('```echarts')
                lines.push(typeof props.optionJson === 'string' ? props.optionJson : JSON.stringify(props.optionJson || {}, null, 2))
                lines.push('```')
                break
            }
            case 'file': {
                lines.push(`[${props.name || 'File'}](${props.url || ''})`)
                break
            }
            case 'paragraph':
            default: {
                lines.push(props.text || '')
                break
            }
        }
        lines.push('')
    }
    return lines.join('\n').trim()
}

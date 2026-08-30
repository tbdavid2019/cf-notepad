const EMBED_BLOCK_TYPES = new Set([
    'image', 'file', 'youtube', 'pdf', 'audio', 'mermaid', 'echarts', 'raw', 'slideBreak',
])

function text(value = '') {
    return typeof value === 'string' ? value : ''
}

function textContent(value = '') {
    const valueText = text(value)
    return valueText ? [{ type: 'text', text: valueText }] : undefined
}

function propsForEmbed(type, props = {}) {
    const safeProps = props && typeof props === 'object' && !Array.isArray(props) ? props : {}
    const attrs = { kind: type }
    for (const [key, value] of Object.entries(safeProps)) {
        if (typeof value === 'string' || typeof value === 'boolean' || typeof value === 'number') attrs[key] = value
    }
    return attrs
}

export function createTiptapBlockDocument(content = [{ type: 'paragraph' }]) {
    return { type: 'doc', content }
}

export function isTiptapBlockDocument(value) {
    return Boolean(value && typeof value === 'object' && !Array.isArray(value)
        && value.type === 'doc' && Array.isArray(value.content))
}

export function normalizeTiptapBlockDocument(value) {
    if (!isTiptapBlockDocument(value) || value.content.length === 0) return createTiptapBlockDocument()
    return value
}

export function legacyBlockDocumentToTiptapDocument(value = {}) {
    const blocks = Array.isArray(value?.blocks) ? value.blocks : []
    const content = []

    for (const block of blocks) {
        if (!block || typeof block !== 'object') continue
        const props = block.props && typeof block.props === 'object' ? block.props : {}
        switch (block.type) {
            case 'heading':
                content.push({ type: 'heading', attrs: { level: Math.min(Math.max(Number(props.level) || 1, 1), 6) }, content: textContent(props.text) })
                break
            case 'bulletList':
                content.push({ type: 'bulletList', content: [{ type: 'listItem', content: [{ type: 'paragraph', content: textContent(props.text) }] }] })
                break
            case 'taskList':
                content.push({ type: 'taskList', content: [{ type: 'taskItem', attrs: { checked: props.checked === true }, content: [{ type: 'paragraph', content: textContent(props.text) }] }] })
                break
            case 'code':
                content.push({ type: 'codeBlock', attrs: { language: text(props.language) || null }, content: textContent(props.text) })
                break
            case 'quote':
                content.push({ type: 'blockquote', content: [{ type: 'paragraph', content: textContent(props.text) }] })
                break
            case 'divider':
                content.push({ type: 'horizontalRule' })
                break
            case 'paragraph':
                content.push({ type: 'paragraph', content: textContent(props.text) })
                break
            default:
                if (EMBED_BLOCK_TYPES.has(block.type)) content.push({ type: 'david888Embed', attrs: propsForEmbed(block.type, props) })
        }
    }

    return normalizeTiptapBlockDocument(createTiptapBlockDocument(content))
}

export function toTiptapBlockDocument(value) {
    if (isTiptapBlockDocument(value)) return normalizeTiptapBlockDocument(value)
    if (value && typeof value === 'object' && Array.isArray(value.blocks)) return legacyBlockDocumentToTiptapDocument(value)
    return createTiptapBlockDocument()
}

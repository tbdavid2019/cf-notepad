import { createTiptapBlockDocument, toTiptapBlockDocument } from './block_document.mjs'

const EMBED_KINDS = new Set(['image', 'file', 'youtube', 'pdf', 'mermaid', 'echarts', 'raw', 'slideBreak'])

const text = value => typeof value === 'string' ? value : ''

function toBlockNoteInline(nodes = []) {
    const output = []
    for (const node of nodes) {
        if (node?.type === 'hardBreak') {
            output.push({ type: 'text', text: '\n', styles: {} })
            continue
        }
        if (node?.type !== 'text') continue
        const styles = {}
        let href = ''
        for (const mark of node.marks || []) {
            if (mark?.type === 'bold') styles.bold = true
            if (mark?.type === 'italic') styles.italic = true
            if (mark?.type === 'underline') styles.underline = true
            if (mark?.type === 'strike') styles.strike = true
            if (mark?.type === 'code') styles.code = true
            if (mark?.type === 'link') href = text(mark.attrs?.href)
        }
        const item = { type: 'text', text: text(node.text), styles }
        output.push(href ? { type: 'link', href, content: [item] } : item)
    }
    return output
}

function toBlockNoteBlock(node = {}) {
    const attrs = node.attrs && typeof node.attrs === 'object' ? node.attrs : {}
    const content = Array.isArray(node.content) ? node.content : []
    if (node.type === 'paragraph') return { type: 'paragraph', content: toBlockNoteInline(content) }
    if (node.type === 'heading') return { type: 'heading', props: { level: Math.min(6, Math.max(1, Number(attrs.level) || 1)) }, content: toBlockNoteInline(content) }
    if (node.type === 'codeBlock') return { type: 'codeBlock', props: { language: text(attrs.language) }, content: toBlockNoteInline(content) }
    if (node.type === 'blockquote') return { type: 'quote', content: toBlockNoteInline(content[0]?.content || []) }
    if (node.type === 'horizontalRule') return { type: 'divider' }
    if (node.type === 'bulletList' || node.type === 'orderedList' || node.type === 'taskList') {
        const type = node.type === 'bulletList' ? 'bulletListItem' : (node.type === 'orderedList' ? 'numberedListItem' : 'checkListItem')
        return content.filter(item => item?.type === 'listItem' || item?.type === 'taskItem').map(item => ({
            type,
            props: type === 'checkListItem' ? { checked: item.attrs?.checked === true } : undefined,
            content: toBlockNoteInline(item.content?.[0]?.content || []),
        }))
    }
    if (node.type === 'image') return { type: 'davidEmbed', props: { kind: 'image', ...attrs } }
    if (node.type === 'david888Embed' && EMBED_KINDS.has(text(attrs.kind))) return { type: 'davidEmbed', props: attrs }
    return null
}

/** Convert the persisted Tiptap block document into the BlockNote document used in the editor. */
export function tiptapToBlockNoteDocument(value) {
    const document = toTiptapBlockDocument(value)
    const blocks = []
    for (const node of document.content || []) {
        const block = toBlockNoteBlock(node)
        if (Array.isArray(block)) blocks.push(...block)
        else if (block) blocks.push(block)
    }
    return blocks.length ? blocks : [{ type: 'paragraph' }]
}

function toTiptapInline(content = []) {
    const nodes = []
    for (const item of content || []) {
        if (typeof item === 'string') {
            if (item) nodes.push({ type: 'text', text: item })
            continue
        }
        if (!item || typeof item !== 'object') continue
        if (item.type === 'link') {
            const children = toTiptapInline(item.content)
            for (const child of children) child.marks = [...(child.marks || []), { type: 'link', attrs: { href: text(item.href) } }]
            nodes.push(...children)
            continue
        }
        if (item.type !== 'text' || !text(item.text)) continue
        const marks = []
        const styles = item.styles || {}
        for (const type of ['bold', 'italic', 'underline', 'strike', 'code']) if (styles[type] === true) marks.push({ type })
        nodes.push({ type: 'text', text: item.text, ...(marks.length ? { marks } : {}) })
    }
    return nodes
}

function tiptapEmbed(kind, props = {}) {
    const attrs = { kind }
    for (const [key, value] of Object.entries(props)) if (typeof value === 'string' || typeof value === 'boolean' || typeof value === 'number') attrs[key] = value
    return { type: 'david888Embed', attrs }
}

function fromBlockNoteBlock(block = {}) {
    const props = block.props && typeof block.props === 'object' ? block.props : {}
    const content = toTiptapInline(block.content)
    if (block.type === 'paragraph') return { type: 'paragraph', content }
    if (block.type === 'heading') return { type: 'heading', attrs: { level: Math.min(6, Math.max(1, Number(props.level) || 1)) }, content }
    if (block.type === 'codeBlock') return { type: 'codeBlock', attrs: { language: text(props.language) || null }, content }
    if (block.type === 'quote') return { type: 'blockquote', content: [{ type: 'paragraph', content }] }
    if (block.type === 'divider') return { type: 'horizontalRule' }
    if (block.type === 'davidEmbed') return tiptapEmbed(text(props.kind) || 'file', props)
    if (block.type === 'image') return tiptapEmbed('image', { src: props.url, alt: props.name, width: props.previewWidth })
    if (block.type === 'file' || block.type === 'audio' || block.type === 'video') return tiptapEmbed('file', { url: props.url, name: props.name, mimeType: props.mime })
    return null
}

/** Convert BlockNote editor changes back to the existing server-supported Tiptap document. */
export function blockNoteToTiptapDocument(blocks = []) {
    const content = []
    for (const block of blocks) {
        if (block?.type === 'bulletListItem' || block?.type === 'numberedListItem' || block?.type === 'checkListItem') {
            const listType = block.type === 'bulletListItem' ? 'bulletList' : (block.type === 'numberedListItem' ? 'orderedList' : 'taskList')
            const itemType = block.type === 'checkListItem' ? 'taskItem' : 'listItem'
            const item = { type: itemType, ...(itemType === 'taskItem' ? { attrs: { checked: block.props?.checked === true } } : {}), content: [{ type: 'paragraph', content: toTiptapInline(block.content) }] }
            const previous = content.at(-1)
            if (previous?.type === listType) previous.content.push(item)
            else content.push({ type: listType, content: [item] })
            continue
        }
        const node = fromBlockNoteBlock(block)
        if (node) content.push(node)
    }
    return createTiptapBlockDocument(content.length ? content : [{ type: 'paragraph' }])
}

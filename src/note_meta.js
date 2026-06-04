export function extractNoteTitle(value = '', metadataTitle = '', fallback = '') {
    const firstLine = value.split('\n')[0] || ''
    return metadataTitle || firstLine.replace(/^#+\s*/, '').substring(0, 70).trim() || fallback
}

export function extractNoteDescription(value = '', fallbackTitle = '') {
    const plain = value
        .replace(/```[\s\S]*?```/g, ' ')
        .replace(/`[^`]*`/g, ' ')
        .replace(/!\[[^\]]*\]\([^)]+\)/g, ' ')
        .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
        .replace(/^#{1,6}\s+/gm, '')
        .replace(/^\s*[-*+]\s+/gm, '')
        .replace(/^\s*\d+\.\s+/gm, '')
        .replace(/[>*_~|]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()

    return (plain || fallbackTitle || 'Shared note on david888 wiki').substring(0, 180)
}

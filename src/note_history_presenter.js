const COLLAPSE_WHITESPACE_PATTERN = /\s+/g
const LEADING_MARKDOWN_PATTERN = /^([#>\-\*\d\.\)\]\s`~:_|]+)+/

function normalizeLine(line = '') {
    return String(line || '')
        .replace(LEADING_MARKDOWN_PATTERN, '')
        .replace(COLLAPSE_WHITESPACE_PATTERN, ' ')
        .trim()
}

function truncateText(text, maxLength) {
    const value = String(text || '').trim()
    if (!value || value.length <= maxLength) return value
    return value.slice(0, Math.max(0, maxLength - 1)).trimEnd() + '…'
}

export function summarizeHistoryContent(content) {
    const lines = String(content || '')
        .split(/\r?\n/)
        .map(normalizeLine)
        .filter(Boolean)

    const titleSource = lines[0] || ''
    const previewSource = lines.find((line, index) => index > 0 && line !== titleSource) || titleSource

    return {
        title: truncateText(titleSource || 'Untitled version', 72),
        preview: truncateText(previewSource || '', 140),
    }
}

export function formatHistoryCharacterCount(content) {
    return String(content || '').length
}

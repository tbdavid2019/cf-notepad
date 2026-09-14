const finite = value => Number.isFinite(Number(value)) ? Number(value) : null

const getBounds = poly => {
    const points = Array.isArray(poly) ? poly : []
    const coordinates = points
        .map(point => Array.isArray(point) ? { x: finite(point[0]), y: finite(point[1]) } : null)
        .filter(point => point && point.x !== null && point.y !== null)
    if (!coordinates.length) return { top: 0, left: 0, height: 0 }
    const xs = coordinates.map(point => point.x)
    const ys = coordinates.map(point => point.y)
    return {
        top: Math.min(...ys),
        left: Math.min(...xs),
        height: Math.max(...ys) - Math.min(...ys),
    }
}

export const normalizeOcrItems = (items = []) => items
    .filter(item => item && typeof item.text === 'string' && item.text.trim())
    .map(item => ({
        text: item.text.trim(),
        score: finite(item.score),
        poly: Array.isArray(item.poly) ? item.poly : [],
        bounds: getBounds(item.poly),
    }))
    .sort((left, right) => {
        const yDelta = left.bounds.top - right.bounds.top
        const lineTolerance = Math.max(4, Math.min(left.bounds.height || 0, right.bounds.height || 0) * 0.45)
        return Math.abs(yDelta) <= lineTolerance ? left.bounds.left - right.bounds.left : yDelta
    })
    .map(({ text, score, poly }) => ({ text, score, poly }))

export const ocrItemsToText = items => normalizeOcrItems(items).map(item => item.text).join('\n')

export const insertTextAtSelection = (source = '', insertedText = '', start = source.length, end = start) => {
    const value = String(source)
    const text = String(insertedText || '').trim()
    if (!text) return { text: value, selectionStart: start, selectionEnd: end }
    const safeStart = Math.max(0, Math.min(value.length, Number.isFinite(Number(start)) ? Number(start) : value.length))
    const safeEnd = Math.max(safeStart, Math.min(value.length, Number.isFinite(Number(end)) ? Number(end) : safeStart))
    const before = value.slice(0, safeStart)
    const after = value.slice(safeEnd)
    const prefix = before && !before.endsWith('\n\n') ? (before.endsWith('\n') ? '\n' : '\n\n') : ''
    const suffix = after && !after.startsWith('\n\n') ? (after.startsWith('\n') ? '\n' : '\n\n') : ''
    const insertion = prefix + text + suffix
    const nextText = before + insertion + after
    const cursor = before.length + insertion.length
    return { text: nextText, selectionStart: cursor, selectionEnd: cursor }
}

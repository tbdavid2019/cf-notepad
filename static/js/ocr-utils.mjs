const finite = value => Number.isFinite(Number(value)) ? Number(value) : null

const getBounds = poly => {
    const points = Array.isArray(poly) ? poly : []
    const coordinates = points
        .map(point => Array.isArray(point) ? { x: finite(point[0]), y: finite(point[1]) } : null)
        .filter(point => point && point.x !== null && point.y !== null)
    if (!coordinates.length) return { top: 0, left: 0, height: 0, width: 0 }
    const xs = coordinates.map(point => point.x)
    const ys = coordinates.map(point => point.y)
    return {
        top: Math.min(...ys),
        left: Math.min(...xs),
        height: Math.max(...ys) - Math.min(...ys),
        width: Math.max(...xs) - Math.min(...xs),
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

/**
 * 2D 幾何表格重構演算法（純前端本地運算，無深度學習大模型負擔）
 * 依據 OCR 偵測到的文字塊幾何座標 (x, y, w, h)，自動計算水平列 (Row) 與垂直欄 (Column)，
 * 映射為二維結構化表格，並生成標準 GFM Markdown Table。
 */
export const reconstructTableFromOcrBoxes = (items = [], options = {}) => {
    const { rowOverlapThreshold = 0.45, minCols = 2, minRows = 2 } = options

    if (!Array.isArray(items) || items.length === 0) {
        return {
            grid: [],
            markdown: '',
            rowCount: 0,
            colCount: 0,
            isTable: false,
        }
    }

    const getItemBox = item => {
        if (item.box && Number.isFinite(Number(item.box.x)) && Number.isFinite(Number(item.box.y))) {
            return {
                x: Number(item.box.x),
                y: Number(item.box.y),
                width: Math.max(0, Number(item.box.width) || 0),
                height: Math.max(0, Number(item.box.height) || 0),
            }
        }
        const bounds = item.bounds || getBounds(item.poly)
        return {
            x: bounds.left ?? 0,
            y: bounds.top ?? 0,
            width: Math.max(0, bounds.width ?? 0),
            height: Math.max(0, bounds.height ?? 0),
        }
    }

    const validItems = items
        .filter(it => it && typeof it.text === 'string' && it.text.trim().length > 0)
        .map(it => ({
            ...it,
            text: it.text.trim(),
            box: getItemBox(it),
        }))
        .filter(it => it.box.width > 0 && it.box.height > 0)
        .sort((a, b) => {
            if (Math.abs(a.box.y - b.box.y) < 4) {
                return a.box.x - b.box.x
            }
            return a.box.y - b.box.y
        })

    if (validItems.length === 0) {
        return {
            grid: [],
            markdown: '',
            rowCount: 0,
            colCount: 0,
            isTable: false,
        }
    }

    // 1. 水平行分群 (Row Clustering by vertical overlap)
    const rows = []
    for (const item of validItems) {
        const itemTop = item.box.y
        const itemBottom = item.box.y + item.box.height
        const itemHeight = item.box.height

        let bestRowIndex = -1
        let maxOverlap = 0

        for (let r = 0; r < rows.length; r++) {
            const row = rows[r]
            const overlapTop = Math.max(itemTop, row.top)
            const overlapBottom = Math.min(itemBottom, row.bottom)
            const overlap = Math.max(0, overlapBottom - overlapTop)
            const minHeight = Math.min(itemHeight, row.bottom - row.top)

            if (minHeight > 0) {
                const ratio = overlap / minHeight
                if (ratio >= rowOverlapThreshold && overlap > maxOverlap) {
                    maxOverlap = overlap
                    bestRowIndex = r
                }
            }
        }

        if (bestRowIndex >= 0) {
            const row = rows[bestRowIndex]
            row.items.push(item)
            row.top = Math.min(row.top, itemTop)
            row.bottom = Math.max(row.bottom, itemBottom)
        } else {
            rows.push({
                top: itemTop,
                bottom: itemBottom,
                items: [item],
            })
        }
    }

    // 2. 行內文字依 X 軸排序，並將水平微距（同一儲存格）就地融合 (Inline Merging)
    for (const row of rows) {
        row.items.sort((a, b) => a.box.x - b.box.x)
        const mergedItems = []
        for (const item of row.items) {
            if (mergedItems.length === 0) {
                mergedItems.push({ ...item, box: { ...item.box } })
                continue
            }
            const prev = mergedItems[mergedItems.length - 1]
            const gap = item.box.x - (prev.box.x + prev.box.width)
            const avgHeight = (prev.box.height + item.box.height) / 2
            if (gap >= -5 && gap < avgHeight * 0.8) {
                prev.text = `${prev.text} ${item.text}`.trim()
                const newRight = Math.max(prev.box.x + prev.box.width, item.box.x + item.box.width)
                prev.box.width = newRight - prev.box.x
                prev.box.height = Math.max(prev.box.height, item.box.height)
                if (Number.isFinite(item.score) && Number.isFinite(prev.score)) {
                    prev.score = (prev.score + item.score) / 2
                }
            } else {
                mergedItems.push({ ...item, box: { ...item.box } })
            }
        }
        row.items = mergedItems
    }

    // 3. 垂直欄分群 (Column Clustering)
    const columns = []
    for (const row of rows) {
        for (const item of row.items) {
            const left = item.box.x
            const right = item.box.x + item.box.width
            const center = left + item.box.width / 2

            let matchedCol = -1
            let minDistance = Infinity

            for (let c = 0; c < columns.length; c++) {
                const col = columns[c]
                const overlap = Math.max(0, Math.min(right, col.maxX) - Math.max(left, col.minX))
                const span = Math.min(item.box.width, col.maxX - col.minX)

                if (span > 0 && overlap / span > 0.35) {
                    matchedCol = c
                    break
                }

                const dist = Math.abs(center - col.center)
                if (dist < minDistance && dist < Math.max(item.box.width, 30) * 0.7) {
                    minDistance = dist
                    matchedCol = c
                }
            }

            if (matchedCol >= 0) {
                const col = columns[matchedCol]
                col.minX = Math.min(col.minX, left)
                col.maxX = Math.max(col.maxX, right)
                col.center = (col.minX + col.maxX) / 2
            } else {
                columns.push({
                    center,
                    minX: left,
                    maxX: right,
                })
            }
        }
    }
    columns.sort((a, b) => a.minX - b.minX)

    const numRows = rows.length
    const numCols = Math.max(1, columns.length)
    const isTable = numRows >= minRows && numCols >= minCols

    // 4. 構建二維陣列 (Grid Matrix)
    const grid = Array.from({ length: numRows }, () => Array.from({ length: numCols }, () => ''))

    for (let r = 0; r < numRows; r++) {
        const row = rows[r]
        for (const item of row.items) {
            const left = item.box.x
            const right = item.box.x + item.box.width
            const center = left + item.box.width / 2

            let bestColIndex = 0
            let bestScore = -Infinity

            for (let c = 0; c < numCols; c++) {
                const col = columns[c]
                const overlap = Math.max(0, Math.min(right, col.maxX) - Math.max(left, col.minX))
                const distance = Math.abs(center - col.center)
                const score = overlap * 2 - distance

                if (score > bestScore) {
                    bestScore = score
                    bestColIndex = c
                }
            }

            const existingText = grid[r][bestColIndex]
            const textToAppend = item.text.trim()
            grid[r][bestColIndex] = existingText ? `${existingText} ${textToAppend}` : textToAppend
        }
    }

    // 5. 生成標準 GFM Markdown 表格
    let markdown = ''
    if (numRows > 0) {
        const header = `| ${grid[0].map(c => c.replace(/\|/g, '\\|') || ' ').join(' | ')} |`
        const separator = `| ${grid[0].map(() => '---').join(' | ')} |`
        const bodyLines = []
        for (let r = 1; r < numRows; r++) {
            bodyLines.push(`| ${grid[r].map(c => c.replace(/\|/g, '\\|') || ' ').join(' | ')} |`)
        }
        markdown = [header, separator, ...bodyLines].join('\n')
    }

    return {
        grid,
        markdown,
        rowCount: numRows,
        colCount: numCols,
        isTable,
    }
}

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

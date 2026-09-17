/**
 * JSON Canvas (jsoncanvas.org) Document utilities for cf-notepad Infinite Canvas.
 */

export const DEFAULT_CANVAS_NODES = [
    {
        id: 'node-welcome',
        type: 'text',
        x: 80,
        y: 80,
        width: 380,
        height: 220,
        text: '# 🎨 無限畫布 (Infinite Canvas)\n\n歡迎使用基於 **JSON Canvas** 開源規範的無限畫布！\n\n- **雙擊卡片**：直接切換編輯 Markdown\n- **拉動邊緣點**：建立連線 (Edges)\n- **拖曳角落**：縮放卡片大小\n- **上方工具列**：新增卡片、便籤或 Wiki 引用',
    },
    {
        id: 'node-sticky-tip',
        type: 'sticky',
        x: 520,
        y: 80,
        width: 240,
        height: 180,
        color: '#fff9c4',
        text: '💡 **靈感便籤**\n\n隨手記錄微小想法，相容 Obsidian Canvas！',
    },
]

export const DEFAULT_CANVAS_EDGES = [
    {
        id: 'edge-welcome-sticky',
        fromNode: 'node-welcome',
        toNode: 'node-sticky-tip',
        fromSide: 'right',
        toSide: 'left',
        toEnd: 'arrow',
        label: '延伸關聯',
    },
]

export function parseCanvasDocument(value) {
    if (!value || typeof value !== 'string') {
        return { nodes: [...DEFAULT_CANVAS_NODES], edges: [...DEFAULT_CANVAS_EDGES] }
    }
    try {
        const parsed = JSON.parse(value)
        if (parsed && typeof parsed === 'object') {
            const nodes = Array.isArray(parsed.nodes) ? parsed.nodes : []
            const edges = Array.isArray(parsed.edges) ? parsed.edges : []
            if (nodes.length === 0 && edges.length === 0) {
                return { nodes: [...DEFAULT_CANVAS_NODES], edges: [...DEFAULT_CANVAS_EDGES] }
            }
            return { nodes, edges }
        }
    } catch {}
    return { nodes: [...DEFAULT_CANVAS_NODES], edges: [...DEFAULT_CANVAS_EDGES] }
}

export function validateCanvasDocument(doc) {
    if (!doc || typeof doc !== 'object') {
        throw new TypeError('Canvas document must be an object')
    }
    if (!Array.isArray(doc.nodes)) {
        throw new TypeError('Canvas document nodes must be an array')
    }
    if (!Array.isArray(doc.edges)) {
        throw new TypeError('Canvas document edges must be an array')
    }
    return true
}

export function canvasToMarkdown(doc) {
    if (!doc || !Array.isArray(doc.nodes)) return ''
    return doc.nodes
        .map(node => {
            const title = node.label || (node.type === 'file' ? `[Note: ${node.file}]` : '')
            const text = node.text || ''
            return [title ? `### ${title}` : '', text].filter(Boolean).join('\n\n')
        })
        .filter(Boolean)
        .join('\n\n---\n\n')
}

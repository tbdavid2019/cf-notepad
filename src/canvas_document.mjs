/**
 * JSON Canvas (jsoncanvas.org) document utilities for cf-notepad Infinite Canvas.
 * Canvas data uses the JSON Canvas 1.0 core. DAVID888-only presentation details
 * live under the optional `david888` extension object so other apps can ignore it.
 */

const JSON_CANVAS_NODE_TYPES = new Set(['text', 'file', 'link', 'group'])
const JSON_CANVAS_SIDES = new Set(['top', 'right', 'bottom', 'left'])
const JSON_CANVAS_ENDS = new Set(['none', 'arrow'])
const MAX_CANVAS_NODES = 2_000
const MAX_CANVAS_EDGES = 8_000
const MAX_NODE_TEXT_LENGTH = 200_000
const MAX_ID_LENGTH = 256

export const DEFAULT_CANVAS_NODES = [
    {
        id: 'node-welcome',
        type: 'text',
        x: 80,
        y: 80,
        width: 380,
        height: 220,
        text: '# 🎨 Canvas 畫布\n\n歡迎使用基於 **JSON Canvas** 開源規範的 2D 卡片畫布！\n\n- **雙擊卡片**：直接切換編輯 Markdown\n- **拖曳四邊連接點**：建立關係線\n- **拖曳角落**：縮放卡片大小\n- **上方工具列**：新增卡片、便籤或 Wiki 引用',
    },
    {
        id: 'node-sticky-tip',
        type: 'text',
        x: 520,
        y: 80,
        width: 240,
        height: 180,
        color: '#fff9c4',
        text: '💡 **靈感便籤**\n\n隨手記錄微小想法，相容 Obsidian Canvas！',
        david888: { cardType: 'sticky' },
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

function cloneDefaultCanvas() {
    return {
        nodes: DEFAULT_CANVAS_NODES.map(node => structuredClone(node)),
        edges: DEFAULT_CANVAS_EDGES.map(edge => structuredClone(edge)),
    }
}

function isPlainObject(value) {
    return Boolean(value && typeof value === 'object' && !Array.isArray(value))
}

function normalizeNode(node) {
    if (!isPlainObject(node)) return node
    if (node.type !== 'sticky') return node

    const david888 = isPlainObject(node.david888) ? node.david888 : {}
    return {
        ...node,
        type: 'text',
        david888: { ...david888, cardType: 'sticky' },
    }
}

export function normalizeCanvasDocument(value) {
    if (!isPlainObject(value)) throw new TypeError('Canvas document must be an object')
    return {
        ...value,
        nodes: value.nodes === undefined ? [] : value.nodes.map(normalizeNode),
        edges: value.edges === undefined ? [] : value.edges,
    }
}

/**
 * Parse persisted Canvas JSON. Editing pages may fall back to a welcome canvas,
 * while write boundaries must pass allowFallback: false and reject bad input.
 */
export function parseCanvasDocument(value, { allowFallback = true } = {}) {
    if (typeof value === 'string' && !value.trim()) {
        return { nodes: [], edges: [] }
    }
    try {
        if (typeof value !== 'string') throw new TypeError('Canvas document must be JSON')
        return normalizeCanvasDocument(JSON.parse(value))
    } catch (error) {
        if (allowFallback) return { nodes: [], edges: [] }
        throw error
    }
}

function assertString(value, name, { allowEmpty = false, maxLength = MAX_ID_LENGTH } = {}) {
    if (typeof value !== 'string' || (!allowEmpty && !value.trim())) {
        throw new TypeError(`${name} must be a non-empty string`)
    }
    if (value.length > maxLength) throw new TypeError(`${name} exceeds the maximum length`)
}

function assertInteger(value, name, { min = Number.MIN_SAFE_INTEGER } = {}) {
    if (!Number.isInteger(value) || value < min) throw new TypeError(`${name} must be an integer${min > Number.MIN_SAFE_INTEGER ? ` >= ${min}` : ''}`)
}

function assertOptionalString(value, name, maxLength = MAX_NODE_TEXT_LENGTH) {
    if (value !== undefined) assertString(value, name, { allowEmpty: true, maxLength })
}

function assertSafeLinkUrl(value) {
    assertString(value, 'link node url', { maxLength: 8_192 })
    let parsed
    try {
        parsed = new URL(value)
    } catch {
        throw new TypeError('link node url must be an absolute http or https URL')
    }
    if (!['http:', 'https:'].includes(parsed.protocol)) {
        throw new TypeError('link node url must use http or https')
    }
}

function validateNode(node, seenIds) {
    if (!isPlainObject(node)) throw new TypeError('canvas node must be an object')
    assertString(node.id, 'canvas node id')
    if (seenIds.has(node.id)) throw new TypeError(`duplicate canvas node id: ${node.id}`)
    seenIds.add(node.id)

    if (!JSON_CANVAS_NODE_TYPES.has(node.type)) throw new TypeError(`unsupported JSON Canvas node type: ${node.type}`)
    assertInteger(node.x, 'canvas node x')
    assertInteger(node.y, 'canvas node y')
    assertInteger(node.width, 'canvas node width', { min: 1 })
    assertInteger(node.height, 'canvas node height', { min: 1 })
    assertOptionalString(node.color, 'canvas node color', 64)

    if (node.type === 'text') {
        if (typeof node.text !== 'string') throw new TypeError('text node text must be a string')
        if (node.text.length > MAX_NODE_TEXT_LENGTH) throw new TypeError('text node text exceeds the maximum length')
    }
    if (node.type === 'file') {
        assertString(node.file ?? '', 'file node file', { allowEmpty: true, maxLength: 8_192 })
        assertOptionalString(node.subpath, 'file node subpath', 8_192)
    }
    if (node.type === 'link') {
        if (node.url) assertSafeLinkUrl(node.url)
        else assertString(node.url ?? '', 'link node url', { allowEmpty: true, maxLength: 8_192 })
    }
    if (node.type === 'group') {
        assertOptionalString(node.label, 'group node label', 8_192)
        assertOptionalString(node.background, 'group node background', 8_192)
        if (node.backgroundStyle !== undefined && !['cover', 'ratio', 'repeat'].includes(node.backgroundStyle)) {
            throw new TypeError('group node backgroundStyle must be cover, ratio, or repeat')
        }
    }

    if (node.david888 !== undefined) {
        if (!isPlainObject(node.david888)) throw new TypeError('david888 extension must be an object')
        if (node.david888.cardType !== undefined && node.david888.cardType !== 'sticky') {
            throw new TypeError('unsupported david888 cardType')
        }
    }
}

function validateEdge(edge, nodeIds, seenIds) {
    if (!isPlainObject(edge)) throw new TypeError('canvas edge must be an object')
    assertString(edge.id, 'canvas edge id')
    if (seenIds.has(edge.id)) throw new TypeError(`duplicate canvas edge id: ${edge.id}`)
    seenIds.add(edge.id)

    assertString(edge.fromNode, 'canvas edge fromNode')
    assertString(edge.toNode, 'canvas edge toNode')
    if (!nodeIds.has(edge.fromNode) || !nodeIds.has(edge.toNode)) {
        throw new TypeError('canvas edge references an unknown node')
    }
    for (const [key, value] of [['fromSide', edge.fromSide], ['toSide', edge.toSide]]) {
        if (value !== undefined && !JSON_CANVAS_SIDES.has(value)) throw new TypeError(`canvas edge ${key} is invalid`)
    }
    for (const [key, value] of [['fromEnd', edge.fromEnd], ['toEnd', edge.toEnd]]) {
        if (value !== undefined && !JSON_CANVAS_ENDS.has(value)) throw new TypeError(`canvas edge ${key} is invalid`)
    }
    assertOptionalString(edge.color, 'canvas edge color', 64)
    assertOptionalString(edge.label, 'canvas edge label', 8_192)

    if (edge.david888 !== undefined) {
        if (!isPlainObject(edge.david888)) throw new TypeError('david888 extension on edge must be an object')
        if (edge.david888.lineStyle !== undefined && !['solid', 'dashed', 'dotted'].includes(edge.david888.lineStyle)) {
            throw new TypeError('edge david888 lineStyle is invalid')
        }
        if (edge.david888.strokeWidth !== undefined && ![1.5, 2.5, 4].includes(Number(edge.david888.strokeWidth))) {
            throw new TypeError('edge david888 strokeWidth is invalid')
        }
    }
}

export function validateCanvasDocument(doc) {
    if (!isPlainObject(doc)) throw new TypeError('Canvas document must be an object')
    if (!Array.isArray(doc.nodes)) throw new TypeError('Canvas document nodes must be an array')
    if (!Array.isArray(doc.edges)) throw new TypeError('Canvas document edges must be an array')
    if (doc.nodes.length > MAX_CANVAS_NODES) throw new TypeError(`Canvas document supports at most ${MAX_CANVAS_NODES} nodes`)
    if (doc.edges.length > MAX_CANVAS_EDGES) throw new TypeError(`Canvas document supports at most ${MAX_CANVAS_EDGES} edges`)

    const nodeIds = new Set()
    for (const node of doc.nodes) validateNode(node, nodeIds)
    const edgeIds = new Set()
    for (const edge of doc.edges) validateEdge(edge, nodeIds, edgeIds)
    return doc
}

export function canvasToMarkdown(doc) {
    if (!doc || !Array.isArray(doc.nodes)) return ''
    return doc.nodes
        .map(node => {
            if (node.type === 'file') {
                const path = `${node.file || ''}${node.subpath || ''}`
                return [`### [Note: ${path}]`, node.text || ''].filter(Boolean).join('\n\n')
            }
            if (node.type === 'link') return `[${node.url}](${node.url})`
            if (node.type === 'group') return node.label ? `## ${node.label}` : ''
            return node.text || ''
        })
        .filter(Boolean)
        .join('\n\n---\n\n')
}

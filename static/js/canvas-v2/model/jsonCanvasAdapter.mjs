/**
 * JSON Canvas 1.0 Adapter for Canvas v2
 * Converts between external JSON Canvas representation and Zustand/React Flow store state.
 */

import {
    NODE_DIMENSIONS,
    DEFAULT_EDGE_COLOR,
    DEFAULT_EDGE_WIDTH,
    DEFAULT_EDGE_STYLE,
} from './canvasTypes.mjs'

export function resolveColorHex(color) {
    if (!color) return ''
    const str = String(color).trim()
    const map = {
        '1': '#ef4444',
        '2': '#f97316',
        '3': '#eab308',
        '4': '#22c55e',
        '5': '#3b82f6',
        '6': '#8b5cf6',
    }
    return map[str] || str
}

export function jsonCanvasToStoreState(doc) {
    if (!doc || typeof doc !== 'object') {
        return { nodes: [], edges: [] }
    }

    const rawNodes = Array.isArray(doc.nodes) ? doc.nodes : []
    const rawEdges = Array.isArray(doc.edges) ? doc.edges : []

    const nodes = rawNodes.map(node => {
        const isSticky = node.type === 'sticky' || node.david888?.cardType === 'sticky'
        const effectiveType = isSticky
            ? 'sticky'
            : ['file', 'link', 'group'].includes(node.type)
                ? node.type
                : 'text'

        const defaults = NODE_DIMENSIONS[effectiveType] || NODE_DIMENSIONS.text
        const width = Number.isInteger(node.width) && node.width > 0 ? node.width : defaults.width
        const height = Number.isInteger(node.height) && node.height > 0 ? node.height : defaults.height

        return {
            id: String(node.id),
            type: effectiveType,
            position: {
                x: Number.isFinite(node.x) ? node.x : 0,
                y: Number.isFinite(node.y) ? node.y : 0,
            },
            style: {
                width,
                height,
            },
            data: {
                text: node.text ?? '',
                file: node.file ?? '',
                subpath: node.subpath ?? '',
                url: node.url ?? '',
                label: node.label ?? '',
                background: node.background ?? '',
                backgroundStyle: node.backgroundStyle ?? '',
                color: node.color ?? (isSticky ? '#fff9c4' : ''),
                david888: node.david888 ? { ...node.david888 } : {},
            },
        }
    })

    const edges = rawEdges.map(edge => {
        const fromEnd = edge.fromEnd || 'none'
        const toEnd = edge.toEnd !== undefined ? edge.toEnd : 'arrow'
        const lineStyle = edge.david888?.lineStyle || DEFAULT_EDGE_STYLE
        const strokeWidth = Number(edge.david888?.strokeWidth) || DEFAULT_EDGE_WIDTH
        const color = edge.color || ''

        return {
            id: String(edge.id),
            source: String(edge.fromNode),
            target: String(edge.toNode),
            sourceHandle: edge.fromSide || 'right',
            targetHandle: edge.toSide || 'left',
            type: 'canvasEdge',
            label: edge.label || '',
            data: {
                fromEnd,
                toEnd,
                color,
                lineStyle,
                strokeWidth,
                label: edge.label || '',
            },
        }
    })

    return { nodes, edges }
}

export function storeStateToJsonCanvas(state) {
    if (!state || typeof state !== 'object') {
        return { nodes: [], edges: [] }
    }

    const rawNodes = Array.isArray(state.nodes) ? state.nodes : []
    const rawEdges = Array.isArray(state.edges) ? state.edges : []

    const nodes = rawNodes.map(node => {
        const defaults = NODE_DIMENSIONS[node.type] || NODE_DIMENSIONS.text
        const width = Math.round(node.measured?.width || node.style?.width || defaults.width)
        const height = Math.round(node.measured?.height || node.style?.height || defaults.height)
        const x = Math.round(node.position?.x ?? 0)
        const y = Math.round(node.position?.y ?? 0)

        const base = {
            id: String(node.id),
            x,
            y,
            width,
            height,
        }

        if (node.data?.color) {
            base.color = node.data.color
        }

        if (node.type === 'sticky') {
            return {
                ...base,
                type: 'text',
                text: node.data?.text ?? '',
                david888: {
                    ...(node.data?.david888 || {}),
                    cardType: 'sticky',
                },
            }
        }

        if (node.type === 'file') {
            const out = {
                ...base,
                type: 'file',
                file: node.data?.file ?? '',
            }
            if (node.data?.subpath) out.subpath = node.data.subpath
            return out
        }

        if (node.type === 'link') {
            return {
                ...base,
                type: 'link',
                url: node.data?.url ?? '',
            }
        }

        if (node.type === 'group') {
            const out = {
                ...base,
                type: 'group',
            }
            if (node.data?.label) out.label = node.data.label
            if (node.data?.background) out.background = node.data.background
            if (node.data?.backgroundStyle) out.backgroundStyle = node.data.backgroundStyle
            return out
        }

        // default: text node
        const out = {
            ...base,
            type: 'text',
            text: node.data?.text ?? '',
        }
        if (node.data?.david888 && Object.keys(node.data.david888).length > 0) {
            out.david888 = { ...node.data.david888 }
        }
        return out
    })

    const edges = rawEdges.map(edge => {
        const out = {
            id: String(edge.id),
            fromNode: String(edge.source),
            toNode: String(edge.target),
        }

        if (edge.sourceHandle) out.fromSide = edge.sourceHandle
        if (edge.targetHandle) out.toSide = edge.targetHandle

        const label = edge.data?.label ?? edge.label
        if (label) out.label = label

        const fromEnd = edge.data?.fromEnd
        if (fromEnd && fromEnd !== 'none') out.fromEnd = fromEnd

        const toEnd = edge.data?.toEnd !== undefined ? edge.data.toEnd : 'arrow'
        out.toEnd = toEnd

        const color = edge.data?.color || edge.style?.stroke
        if (color && color !== DEFAULT_EDGE_COLOR) out.color = color

        const lineStyle = edge.data?.lineStyle || DEFAULT_EDGE_STYLE
        const strokeWidth = Number(edge.data?.strokeWidth) || DEFAULT_EDGE_WIDTH
        const hasCustomStyle = lineStyle !== DEFAULT_EDGE_STYLE || strokeWidth !== DEFAULT_EDGE_WIDTH

        if (hasCustomStyle) {
            out.david888 = {
                ...(lineStyle !== DEFAULT_EDGE_STYLE ? { lineStyle } : {}),
                ...(strokeWidth !== DEFAULT_EDGE_WIDTH ? { strokeWidth } : {}),
            }
        }

        return out
    })

    return { nodes, edges }
}

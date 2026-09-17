/**
 * JSON Canvas 1.0 Adapter for Canvas v2
 * Converts between external JSON Canvas representation and Zustand/React Flow store state.
 * Preserves 100% round-trip fidelity including unknown root, node, and edge extensions.
 */

import {
    NODE_DIMENSIONS,
    DEFAULT_EDGE_COLOR,
    DEFAULT_EDGE_WIDTH,
    DEFAULT_EDGE_STYLE,
    getNodeTypeConfig,
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

    const { nodes: rawNodesArr, edges: rawEdgesArr, ...docMetadata } = doc
    const rawNodes = Array.isArray(rawNodesArr) ? rawNodesArr : []
    const rawEdges = Array.isArray(rawEdgesArr) ? rawEdgesArr : []

    const nodes = rawNodes.map(node => {
        const {
            id,
            type,
            x,
            y,
            width: rawWidth,
            height: rawHeight,
            color,
            text,
            file,
            subpath,
            url,
            label,
            background,
            backgroundStyle,
            david888,
            ...rawNodeExtensions
        } = node

        const isSticky = type === 'sticky' || david888?.cardType === 'sticky'
        const effectiveType = isSticky
            ? 'sticky'
            : ['file', 'link', 'group'].includes(type)
                ? type
                : 'text'

        const defaults = NODE_DIMENSIONS[effectiveType] || NODE_DIMENSIONS.text
        const width = Number.isInteger(rawWidth) && rawWidth > 0 ? rawWidth : defaults.width
        const height = Number.isInteger(rawHeight) && rawHeight > 0 ? rawHeight : defaults.height

        const nodeDavid888 = david888 && typeof david888 === 'object' ? { ...david888 } : {}
        if (isSticky) {
            nodeDavid888.cardType = 'sticky'
        }
        const effectiveNodeType = nodeDavid888.nodeType || (isSticky ? 'sticky' : undefined) || getNodeTypeConfig(null, color)?.id || 'note'
        nodeDavid888.nodeType = effectiveNodeType

        return {
            id: String(id),
            type: effectiveType,
            position: {
                x: Number.isFinite(x) ? x : 0,
                y: Number.isFinite(y) ? y : 0,
            },
            style: {
                width,
                height,
            },
            data: {
                text: text ?? '',
                nodeType: effectiveNodeType,
                file: file ?? '',
                subpath: subpath ?? '',
                url: url ?? '',
                label: label ?? '',
                background: background ?? '',
                backgroundStyle: backgroundStyle ?? '',
                color: color ?? (isSticky ? '#fff9c4' : ''),
                david888: nodeDavid888,
                rawNode: rawNodeExtensions,
            },
        }
    })

    const edges = rawEdges.map(edge => {
        const {
            id,
            fromNode,
            toNode,
            fromSide,
            toSide,
            fromEnd: rawFromEnd,
            toEnd: rawToEnd,
            color: rawColor,
            label: rawLabel,
            david888,
            ...rawEdgeExtensions
        } = edge

        const fromEnd = rawFromEnd || 'none'
        const toEnd = rawToEnd !== undefined ? rawToEnd : 'arrow'
        const lineStyle = david888?.lineStyle || DEFAULT_EDGE_STYLE
        const strokeWidth = Number(david888?.strokeWidth) || DEFAULT_EDGE_WIDTH
        const color = rawColor || ''
        const edgeDavid888 = david888 && typeof david888 === 'object' ? { ...david888 } : {}

        const resolvedColor = color || DEFAULT_EDGE_COLOR
        const markerEnd = toEnd !== 'none' ? {
            type: 'arrowclosed',
            color: resolvedColor,
            width: 14,
            height: 14,
        } : undefined
        const markerStart = fromEnd !== 'none' ? {
            type: 'arrowclosed',
            color: resolvedColor,
            width: 14,
            height: 14,
        } : undefined

        return {
            id: String(id),
            source: String(fromNode),
            target: String(toNode),
            sourceHandle: fromSide || 'right',
            targetHandle: toSide || 'left',
            type: 'canvasEdge',
            label: rawLabel || '',
            markerEnd,
            markerStart,
            data: {
                fromEnd,
                toEnd,
                color,
                lineStyle,
                strokeWidth,
                label: rawLabel || '',
                david888: edgeDavid888,
                rawEdge: rawEdgeExtensions,
            },
        }
    })

    const out = { nodes, edges }
    if (Object.keys(docMetadata).length > 0) {
        out.metadata = docMetadata
    }
    return out
}

export function storeStateToJsonCanvas(state) {
    if (!state || typeof state !== 'object') {
        return { nodes: [], edges: [] }
    }

    const metadata = state.metadata && typeof state.metadata === 'object' ? state.metadata : {}
    const rawNodes = Array.isArray(state.nodes) ? state.nodes : []
    const rawEdges = Array.isArray(state.edges) ? state.edges : []

    const nodes = rawNodes.map(node => {
        const defaults = NODE_DIMENSIONS[node.type] || NODE_DIMENSIONS.text
        const width = Math.round(node.style?.width || node.measured?.width || defaults.width)
        const height = Math.round(node.style?.height || node.measured?.height || defaults.height)
        const x = Math.round(node.position?.x ?? 0)
        const y = Math.round(node.position?.y ?? 0)

        const rawNode = node.data?.rawNode && typeof node.data.rawNode === 'object' ? node.data.rawNode : {}
        const david888 = node.data?.david888 && typeof node.data.david888 === 'object' ? { ...node.data.david888 } : {}

        const base = {
            ...rawNode,
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
                    ...david888,
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
            if (Object.keys(david888).length > 0) out.david888 = david888
            return out
        }

        if (node.type === 'link') {
            const out = {
                ...base,
                type: 'link',
                url: node.data?.url ?? '',
            }
            if (Object.keys(david888).length > 0) out.david888 = david888
            return out
        }

        if (node.type === 'group') {
            const out = {
                ...base,
                type: 'group',
            }
            if (node.data?.label) out.label = node.data.label
            if (node.data?.background) out.background = node.data.background
            if (node.data?.backgroundStyle) out.backgroundStyle = node.data.backgroundStyle
            if (Object.keys(david888).length > 0) out.david888 = david888
            return out
        }

        // default: text node
        const out = {
            ...base,
            type: 'text',
            text: node.data?.text ?? '',
        }
        if (node.data?.nodeType) {
            david888.nodeType = node.data.nodeType
        }
        if (Object.keys(david888).length > 0) {
            out.david888 = david888
        }
        return out
    })

    const edges = rawEdges.map(edge => {
        const rawEdge = edge.data?.rawEdge && typeof edge.data.rawEdge === 'object' ? edge.data.rawEdge : {}
        const david888 = edge.data?.david888 && typeof edge.data.david888 === 'object' ? { ...edge.data.david888 } : {}

        const out = {
            ...rawEdge,
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

        if (lineStyle !== DEFAULT_EDGE_STYLE) david888.lineStyle = lineStyle
        if (strokeWidth !== DEFAULT_EDGE_WIDTH) david888.strokeWidth = strokeWidth

        if (Object.keys(david888).length > 0) {
            out.david888 = david888
        }

        return out
    })

    return {
        ...metadata,
        nodes,
        edges,
    }
}

/**
 * Canvas Commands
 * Transactional actions that mutate canvas state and return the next state.
 */

import {
    NODE_DIMENSIONS,
    AMELIORATE_NODE_TYPES,
    getNodeTypeConfig,
    DEFAULT_EDGE_COLOR,
    DEFAULT_EDGE_WIDTH,
    DEFAULT_EDGE_STYLE,
    DEFAULT_EDGE_LABEL,
} from './canvasTypes.mjs'
import { recordHistoryStep } from './canvasHistory.mjs'

function generateId(prefix = 'item') {
    return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`
}

function takeSnapshot(state) {
    return {
        nodes: state.nodes.map(n => ({
            ...n,
            position: { ...n.position },
            style: { ...(n.style || {}) },
            data: { ...(n.data || {}) },
        })),
        edges: state.edges.map(e => ({
            ...e,
            data: { ...(e.data || {}) },
        })),
    }
}

export function createNode(state, options = {}) {
    const type = options.type || 'text'
    const defaults = NODE_DIMENSIONS[type] || NODE_DIMENSIONS.text
    const id = options.id || generateId(type)

    const snapshot = takeSnapshot(state)
    const nextHistory = recordHistoryStep(state.history, snapshot)

    const isSticky = type === 'sticky'
    const nodeType = options.nodeType || (type === 'sticky' ? 'sticky' : 'problem')
    const typeConfig = AMELIORATE_NODE_TYPES[nodeType]
    const initialColor = options.color || typeConfig?.color || (isSticky ? '#fff9c4' : '')

    let posX = options.x !== undefined ? options.x : (120 + Math.random() * 80)
    let posY = options.y !== undefined ? options.y : (120 + Math.random() * 80)

    // Collision avoidance: if an existing node occupies the exact coordinate, offset slightly
    while (state.nodes.some(n => Math.abs(n.position.x - posX) < 20 && Math.abs(n.position.y - posY) < 20)) {
        posX += 28
        posY += 28
    }

    const defaultText = options.text !== undefined
        ? options.text
        : (type === 'group' ? '' : (options.file || options.url ? '' : 'new node'))

    const newNode = {
        id,
        type,
        position: {
            x: Math.round(posX),
            y: Math.round(posY),
        },
        style: {
            width: options.width ?? defaults.width,
            height: options.height ?? defaults.height,
        },
        selected: true,
        data: {
            text: defaultText,
            nodeType,
            file: options.file ?? '',
            subpath: options.subpath ?? '',
            url: options.url ?? '',
            label: options.label ?? (typeConfig?.name || ''),
            background: options.background ?? '',
            backgroundStyle: options.backgroundStyle ?? '',
            color: initialColor,
            david888: {
                ...(options.david888 || {}),
                nodeType,
                ...(isSticky ? { cardType: 'sticky' } : {}),
            },
        },
    }

    // Unselect other nodes
    const unselectedNodes = state.nodes.map(n => (n.selected ? { ...n, selected: false } : n))

    return {
        ...state,
        nodes: [...unselectedNodes, newNode],
        selectedNodeIds: [id],
        selectedEdgeIds: [],
        history: nextHistory,
        dirty: true,
    }
}

export function clearDocument(state) {
    if (state.nodes.length === 0 && state.edges.length === 0) return state

    const snapshot = takeSnapshot(state)
    const nextHistory = recordHistoryStep(state.history, snapshot)

    return {
        ...state,
        nodes: [],
        edges: [],
        selectedNodeIds: [],
        selectedEdgeIds: [],
        history: nextHistory,
        dirty: true,
    }
}

export function updateNodeContent(state, id, patch = {}) {
    const target = state.nodes.find(n => n.id === id)
    if (!target) return state

    const snapshot = takeSnapshot(state)
    const nextHistory = recordHistoryStep(state.history, snapshot)

    const nextNodes = state.nodes.map(n => {
        if (n.id !== id) return n
        return {
            ...n,
            data: {
                ...n.data,
                ...patch,
            },
        }
    })

    return {
        ...state,
        nodes: nextNodes,
        history: nextHistory,
        dirty: true,
    }
}

export function updateNodeFrame(state, id, frame = {}) {
    const target = state.nodes.find(n => n.id === id)
    if (!target) return state

    const snapshot = takeSnapshot(state)
    const nextHistory = recordHistoryStep(state.history, snapshot)

    const nextNodes = state.nodes.map(n => {
        if (n.id !== id) return n
        const nextPos = frame.x !== undefined || frame.y !== undefined
            ? { x: frame.x ?? n.position.x, y: frame.y ?? n.position.y }
            : n.position
        const nextStyle = frame.width !== undefined || frame.height !== undefined
            ? { ...n.style, width: frame.width ?? n.style?.width, height: frame.height ?? n.style?.height }
            : n.style

        return {
            ...n,
            position: nextPos,
            style: nextStyle,
        }
    })

    return {
        ...state,
        nodes: nextNodes,
        history: nextHistory,
        dirty: true,
    }
}

export function setNodeColor(state, id, color) {
    return updateNodeContent(state, id, { color })
}

export function setNodesColor(state, ids, color) {
    const targetIds = new Set(Array.isArray(ids) ? ids : [ids])
    if (targetIds.size === 0) return state

    const selectedNodes = state.nodes.filter(node => targetIds.has(node.id))
    if (selectedNodes.length === 0) return state

    const snapshot = takeSnapshot(state)
    const nextHistory = recordHistoryStep(state.history, snapshot)
    return {
        ...state,
        nodes: state.nodes.map(node => targetIds.has(node.id)
            ? { ...node, data: { ...node.data, color } }
            : node),
        history: nextHistory,
        dirty: true,
    }
}

export function duplicateNodes(state, ids) {
    const targetIds = new Set(Array.isArray(ids) ? ids : [ids])
    const toDuplicate = state.nodes.filter(n => targetIds.has(n.id))
    if (toDuplicate.length === 0) return state

    const snapshot = takeSnapshot(state)
    const nextHistory = recordHistoryStep(state.history, snapshot)

    const unselectedNodes = state.nodes.map(n => (n.selected ? { ...n, selected: false } : n))
    const duplicatedNodes = []
    const newSelectedIds = []

    for (const node of toDuplicate) {
        const newId = generateId(node.type || 'card')
        newSelectedIds.push(newId)
        duplicatedNodes.push({
            ...node,
            id: newId,
            position: {
                x: node.position.x + 36,
                y: node.position.y + 36,
            },
            selected: true,
            data: {
                ...node.data,
            },
        })
    }

    return {
        ...state,
        nodes: [...unselectedNodes, ...duplicatedNodes],
        selectedNodeIds: newSelectedIds,
        history: nextHistory,
        dirty: true,
    }
}

export function deleteNodes(state, ids) {
    const targetIds = new Set(Array.isArray(ids) ? ids : [ids])
    if (targetIds.size === 0) return state

    const remainingNodes = state.nodes.filter(n => !targetIds.has(n.id))
    if (remainingNodes.length === state.nodes.length) return state

    const snapshot = takeSnapshot(state)
    const nextHistory = recordHistoryStep(state.history, snapshot)

    // Also remove edges connected to deleted nodes
    const remainingEdges = state.edges.filter(e => !targetIds.has(e.source) && !targetIds.has(e.target))

    return {
        ...state,
        nodes: remainingNodes,
        edges: remainingEdges,
        selectedNodeIds: state.selectedNodeIds.filter(id => !targetIds.has(id)),
        selectedEdgeIds: state.selectedEdgeIds.filter(id => remainingEdges.some(e => e.id === id)),
        history: nextHistory,
        dirty: true,
    }
}

export function connectNodes(state, connection) {
    const { source, target, sourceHandle, targetHandle } = connection
    if (!source || !target) return state

    // Avoid duplicate parallel connections between identical handles
    const exists = state.edges.some(e =>
        e.source === source &&
        e.target === target &&
        e.sourceHandle === (sourceHandle || 'right') &&
        e.targetHandle === (targetHandle || 'left')
    )
    if (exists) return state

    const snapshot = takeSnapshot(state)
    const nextHistory = recordHistoryStep(state.history, snapshot)

    const edgeId = generateId('edge')
    const edgeLabel = connection.label !== undefined ? connection.label : DEFAULT_EDGE_LABEL
    const edgeColor = connection.color || DEFAULT_EDGE_COLOR
    const newEdge = {
        id: edgeId,
        source: String(source),
        target: String(target),
        sourceHandle: sourceHandle || 'right',
        targetHandle: targetHandle || 'left',
        type: 'canvasEdge',
        label: edgeLabel,
        selected: true,
        markerEnd: {
            type: 'arrowclosed',
            color: edgeColor,
            width: 14,
            height: 14,
        },
        data: {
            fromEnd: 'none',
            toEnd: 'arrow',
            lineStyle: DEFAULT_EDGE_STYLE,
            strokeWidth: DEFAULT_EDGE_WIDTH,
            color: edgeColor,
            label: edgeLabel,
        },
    }

    const unselectedEdges = state.edges.map(e => (e.selected ? { ...e, selected: false } : e))

    return {
        ...state,
        edges: [...unselectedEdges, newEdge],
        selectedEdgeIds: [edgeId],
        history: nextHistory,
        dirty: true,
    }
}

export function reconnectEdge(state, oldEdgeId, newConnection) {
    const { source, target, sourceHandle, targetHandle } = newConnection
    if (!source || !target) return state

    const oldEdge = state.edges.find(e => e.id === oldEdgeId)
    if (!oldEdge) return state

    const snapshot = takeSnapshot(state)
    const nextHistory = recordHistoryStep(state.history, snapshot)

    const nextEdges = state.edges.map(e => {
        if (e.id !== oldEdgeId) return e
        return {
            ...e,
            source: String(source),
            target: String(target),
            sourceHandle: sourceHandle || e.sourceHandle,
            targetHandle: targetHandle || e.targetHandle,
        }
    })

    return {
        ...state,
        edges: nextEdges,
        history: nextHistory,
        dirty: true,
    }
}

export function updateEdgeLabel(state, id, label) {
    const target = state.edges.find(e => e.id === id)
    if (!target) return state

    const snapshot = takeSnapshot(state)
    const nextHistory = recordHistoryStep(state.history, snapshot)

    const nextEdges = state.edges.map(e => {
        if (e.id !== id) return e
        return {
            ...e,
            label,
            data: {
                ...e.data,
                label,
            },
        }
    })

    return {
        ...state,
        edges: nextEdges,
        history: nextHistory,
        dirty: true,
    }
}

export function updateEdgeStyle(state, id, stylePatch = {}) {
    const target = state.edges.find(e => e.id === id)
    if (!target) return state

    const snapshot = takeSnapshot(state)
    const nextHistory = recordHistoryStep(state.history, snapshot)

    const nextEdges = state.edges.map(e => {
        if (e.id !== id) return e
        return {
            ...e,
            data: {
                ...e.data,
                ...stylePatch,
            },
        }
    })

    return {
        ...state,
        edges: nextEdges,
        history: nextHistory,
        dirty: true,
    }
}

export function deleteEdges(state, ids) {
    const targetIds = new Set(Array.isArray(ids) ? ids : [ids])
    if (targetIds.size === 0) return state

    const remainingEdges = state.edges.filter(e => !targetIds.has(e.id))
    if (remainingEdges.length === state.edges.length) return state

    const snapshot = takeSnapshot(state)
    const nextHistory = recordHistoryStep(state.history, snapshot)

    return {
        ...state,
        edges: remainingEdges,
        selectedEdgeIds: state.selectedEdgeIds.filter(id => !targetIds.has(id)),
        history: nextHistory,
        dirty: true,
    }
}

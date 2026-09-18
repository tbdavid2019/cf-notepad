/**
 * Zustand Canvas Store for Canvas v2
 * Adapted from Ameliorate diagramStore architecture.
 */

import { create } from 'zustand'
import {
    createHistoryState,
    undoHistoryStep,
    redoHistoryStep,
    recordHistoryStep,
} from '../model/canvasHistory.mjs'
import * as commands from '../model/canvasCommands.mjs'
import { jsonCanvasToStoreState, storeStateToJsonCanvas } from '../model/jsonCanvasAdapter.mjs'

function cloneSnapshot(nodes, edges) {
    return {
        nodes: nodes.map(n => ({
            ...n,
            position: { ...n.position },
            style: { ...(n.style || {}) },
            data: { ...(n.data || {}) },
        })),
        edges: edges.map(e => ({
            ...e,
            data: { ...(e.data || {}) },
        })),
    }
}

export function createCanvasStore(initialDoc = { nodes: [], edges: [] }, { isEdit = true } = {}) {
    const initialState = jsonCanvasToStoreState(initialDoc)

    return create((set, get) => ({
        // document state
        nodes: initialState.nodes,
        edges: initialState.edges,
        metadata: initialState.metadata || {},

        // selection state
        selectedNodeIds: [],
        selectedEdgeIds: [],

        // ui state
        isEdit,
        activeTool: 'select',
        openPopover: null,
        editingNodeId: null,
        editingEdgeId: null,

        // persistence & sync state
        dirty: false,
        syncStatus: 'idle',

        // history state
        history: createHistoryState(),

        // commands
        createNode: (options) => set(state => commands.createNode(state, options)),
        clearDocument: () => set(state => commands.clearDocument(state)),
        updateNodeContent: (id, patch) => set(state => commands.updateNodeContent(state, id, patch)),
        updateNodeFrame: (id, frame) => set(state => commands.updateNodeFrame(state, id, frame)),
        setNodeColor: (id, color) => set(state => commands.setNodeColor(state, id, color)),
        setNodesColor: (ids, color) => set(state => commands.setNodesColor(state, ids, color)),
        duplicateNodes: (ids) => set(state => commands.duplicateNodes(state, ids)),
        deleteNodes: (ids) => set(state => commands.deleteNodes(state, ids)),
        connectNodes: (connection) => set(state => commands.connectNodes(state, connection)),
        reconnectEdge: (oldEdgeId, newConnection) => set(state => commands.reconnectEdge(state, oldEdgeId, newConnection)),
        updateEdgeLabel: (id, label) => set(state => commands.updateEdgeLabel(state, id, label)),
        updateEdgeStyle: (id, patch) => set(state => commands.updateEdgeStyle(state, id, patch)),
        deleteEdges: (ids) => set(state => commands.deleteEdges(state, ids)),

        // Direct nodes & edges updaters for React Flow
        setNodes: (nodesOrUpdater) => set(state => ({
            nodes: typeof nodesOrUpdater === 'function' ? nodesOrUpdater(state.nodes) : nodesOrUpdater,
        })),
        setEdges: (edgesOrUpdater) => set(state => ({
            edges: typeof edgesOrUpdater === 'function' ? edgesOrUpdater(state.edges) : edgesOrUpdater,
        })),

        // Record history snapshot explicitly (for drag-end / resize-end)
        commitTransaction: (snapshotBefore) => set(state => ({
            history: recordHistoryStep(state.history, snapshotBefore),
            dirty: true,
        })),

        // Selection
        setSelection: ({ nodeIds = [], edgeIds = [] }) => set(state => {
            const nextNodeIds = Array.isArray(nodeIds) ? nodeIds : []
            const nextEdgeIds = Array.isArray(edgeIds) ? edgeIds : []
            const nodeSet = new Set(nextNodeIds)
            const edgeSet = new Set(nextEdgeIds)
            return {
                selectedNodeIds: nextNodeIds,
                selectedEdgeIds: nextEdgeIds,
                nodes: state.nodes.map(n => ({ ...n, selected: nodeSet.has(n.id) })),
                edges: state.edges.map(e => ({ ...e, selected: edgeSet.has(e.id) })),
            }
        }),
        setSelectedNode: (id) => set(state => ({
            selectedNodeIds: id ? [id] : [],
            selectedEdgeIds: [],
            nodes: state.nodes.map(n => ({ ...n, selected: n.id === id })),
            edges: state.edges.map(e => ({ ...e, selected: false })),
        })),
        setSelectedEdge: (id) => set(state => ({
            selectedEdgeIds: id ? [id] : [],
            selectedNodeIds: [],
            edges: state.edges.map(e => ({ ...e, selected: e.id === id })),
            nodes: state.nodes.map(n => ({ ...n, selected: false })),
        })),
        clearSelection: () => set(state => ({
            selectedNodeIds: [],
            selectedEdgeIds: [],
            nodes: state.nodes.map(n => ({ ...n, selected: false })),
            edges: state.edges.map(e => ({ ...e, selected: false })),
        })),

        // Undo / Redo
        undo: () => set(state => {
            const currentSnapshot = cloneSnapshot(state.nodes, state.edges)
            const res = undoHistoryStep(state.history, currentSnapshot)
            if (!res) return state
            return {
                ...state,
                nodes: res.snapshot.nodes,
                edges: res.snapshot.edges,
                history: res.history,
                dirty: true,
            }
        }),
        redo: () => set(state => {
            const currentSnapshot = cloneSnapshot(state.nodes, state.edges)
            const res = redoHistoryStep(state.history, currentSnapshot)
            if (!res) return state
            return {
                ...state,
                nodes: res.snapshot.nodes,
                edges: res.snapshot.edges,
                history: res.history,
                dirty: true,
            }
        }),

        // Document replace / load
        loadDocument: (doc) => {
            const converted = jsonCanvasToStoreState(doc)
            set(() => ({
                nodes: converted.nodes,
                edges: converted.edges,
                metadata: converted.metadata || {},
                selectedNodeIds: [],
                selectedEdgeIds: [],
                history: createHistoryState(),
                dirty: false,
            }))
        },

        // Export helper
        toJsonCanvas: () => {
            const state = get()
            return storeStateToJsonCanvas({
                nodes: state.nodes,
                edges: state.edges,
                metadata: state.metadata,
            })
        },

        // Status & UI actions
        setDirty: (dirty) => set({ dirty }),
        setSyncStatus: (syncStatus) => set({ syncStatus }),
        setEditingNodeId: (editingNodeId) => set({ editingNodeId }),
        setEditingEdgeId: (editingEdgeId) => set({ editingEdgeId }),
        setOpenPopover: (openPopover) => set({ openPopover }),
    }))
}

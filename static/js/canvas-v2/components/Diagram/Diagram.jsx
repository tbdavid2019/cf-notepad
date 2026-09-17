import React, { useCallback, useMemo, useRef } from 'react'
import {
    ReactFlow,
    Background,
    BackgroundVariant,
    Controls,
    MiniMap,
    ConnectionMode,
    applyNodeChanges,
    applyEdgeChanges,
    useReactFlow,
} from '@xyflow/react'

import { MarkdownNode } from '../Node/MarkdownNode.jsx'
import { StickyNode } from '../Node/StickyNode.jsx'
import { WikiNode } from '../Node/WikiNode.jsx'
import { LinkNode } from '../Node/LinkNode.jsx'
import { GroupNode } from '../Node/GroupNode.jsx'
import { CanvasEdge } from '../Edge/CanvasEdge.jsx'
import { setReactFlowInstance } from './viewportHelpers.mjs'
import { selectNodes, selectEdges, selectIsEdit } from '../../store/selectors.mjs'

const NODE_TYPES = {
    text: MarkdownNode,
    sticky: StickyNode,
    file: WikiNode,
    link: LinkNode,
    group: GroupNode,
}

const EDGE_TYPES = {
    canvasEdge: CanvasEdge,
    default: CanvasEdge,
    smoothstep: CanvasEdge,
}

export function Diagram({ store }) {
    const rawNodes = store(selectNodes)
    const rawEdges = store(selectEdges)
    const isEdit = store(selectIsEdit)

    const reactFlowInstance = useReactFlow()
    setReactFlowInstance(reactFlowInstance)

    const dragSnapshotRef = useRef(null)
    const resizeSnapshotRef = useRef(null)

    const handleResizeStart = useCallback(() => {
        const currentNodes = store.getState().nodes
        const currentEdges = store.getState().edges
        resizeSnapshotRef.current = {
            nodes: currentNodes.map(n => ({
                ...n,
                position: { ...n.position },
                style: { ...(n.style || {}) },
                data: { ...(n.data || {}) },
            })),
            edges: currentEdges.map(e => ({
                ...e,
                data: { ...(e.data || {}) },
            })),
        }
    }, [store])

    const handleResizeEnd = useCallback(() => {
        if (resizeSnapshotRef.current) {
            store.getState().commitTransaction(resizeSnapshotRef.current)
            resizeSnapshotRef.current = null
        }
    }, [store])

    // Memoized actions for nodes to preserve referential stability
    const nodeActions = useMemo(() => ({
        onUpdateContent: (id, patch) => store.getState().updateNodeContent(id, patch),
        onDuplicate: (id) => store.getState().duplicateNodes(id),
        onDelete: (id) => store.getState().deleteNodes(id),
        onChangeColor: (id, color) => store.getState().setNodeColor(id, color),
        onSelectNode: (id) => store.getState().setSelectedNode(id),
        onResizeStart: handleResizeStart,
        onResizeEnd: handleResizeEnd,
    }), [store, handleResizeStart, handleResizeEnd])

    // Memoized actions for edges
    const edgeActions = useMemo(() => ({
        onChangeEdgeLabel: (id, label) => store.getState().updateEdgeLabel(id, label),
        onChangeEdgeStyle: (id, patch) => store.getState().updateEdgeStyle(id, patch),
        onDeleteEdge: (id) => store.getState().deleteEdges(id),
        onSelectEdge: (id) => store.getState().setSelectedEdge(id),
    }), [store])

    // Node actions injected into node.data
    const nodesWithData = useMemo(() => {
        return rawNodes.map(node => ({
            ...node,
            data: {
                ...node.data,
                isEdit,
                ...nodeActions,
            },
        }))
    }, [rawNodes, isEdit, nodeActions])

    // Edge actions injected into edge.data
    const edgesWithData = useMemo(() => {
        return rawEdges.map(edge => ({
            ...edge,
            data: {
                ...edge.data,
                isEdit,
                ...edgeActions,
            },
        }))
    }, [rawEdges, isEdit, edgeActions])

    const handleNodesChange = useCallback((changes) => {
        const nextNodes = applyNodeChanges(changes, store.getState().nodes).map(node => {
            const dimChange = changes.find(c => c.id === node.id && c.type === 'dimensions')
            if (dimChange?.dimensions) {
                return {
                    ...node,
                    style: {
                        ...(node.style || {}),
                        width: Math.round(dimChange.dimensions.width),
                        height: Math.round(dimChange.dimensions.height),
                    },
                }
            }
            return node
        })
        store.getState().setNodes(nextNodes)
    }, [store])

    const handleEdgesChange = useCallback((changes) => {
        const nextEdges = applyEdgeChanges(changes, store.getState().edges)
        store.getState().setEdges(nextEdges)
    }, [store])

    const handleSelectionChange = useCallback(({ nodes, edges }) => {
        store.getState().setSelection({
            nodeIds: nodes.map(n => n.id),
            edgeIds: edges.map(e => e.id),
        })
    }, [store])

    const handleNodeDragStart = useCallback(() => {
        const currentNodes = store.getState().nodes
        const currentEdges = store.getState().edges
        dragSnapshotRef.current = {
            nodes: currentNodes.map(n => ({
                ...n,
                position: { ...n.position },
                style: { ...(n.style || {}) },
                data: { ...(n.data || {}) },
            })),
            edges: currentEdges.map(e => ({
                ...e,
                data: { ...(e.data || {}) },
            })),
        }
    }, [store])

    const handleNodeDragStop = useCallback(() => {
        if (dragSnapshotRef.current) {
            store.getState().commitTransaction(dragSnapshotRef.current)
            dragSnapshotRef.current = null
        }
    }, [store])

    const handleConnect = useCallback((connection) => {
        if (!isEdit) return
        store.getState().connectNodes(connection)
    }, [isEdit, store])

    const handleReconnect = useCallback((oldEdge, newConnection) => {
        if (!isEdit) return
        store.getState().reconnectEdge(oldEdge.id, newConnection)
    }, [isEdit, store])

    const handlePaneClick = useCallback(() => {
        store.getState().clearSelection()
    }, [store])

    return (
        <div className="canvas-v2-container">
            <ReactFlow
                nodes={nodesWithData}
                edges={edgesWithData}
                nodeTypes={NODE_TYPES}
                edgeTypes={EDGE_TYPES}
                onNodesChange={handleNodesChange}
                onEdgesChange={handleEdgesChange}
                onSelectionChange={handleSelectionChange}
                onNodeClick={(e, node) => store.getState().setSelectedNode(node.id)}
                onEdgeClick={(e, edge) => store.getState().setSelectedEdge(edge.id)}
                onNodeDragStart={handleNodeDragStart}
                onNodeDragStop={handleNodeDragStop}
                onConnect={handleConnect}
                onReconnect={handleReconnect}
                onPaneClick={handlePaneClick}
                connectionMode={ConnectionMode.Loose}
                nodesDraggable={isEdit}
                nodesConnectable={isEdit}
                elementsSelectable={true}
                elevateEdgesOnSelect={true}
                fitView
                fitViewOptions={{ maxZoom: 1, padding: 0.2 }}
                minZoom={0.1}
                maxZoom={2.5}
                deleteKeyCode={['Backspace', 'Delete']}
            >
                <Background variant={BackgroundVariant.Dots} gap={20} size={1.5} />
                <Controls showInteractive={false} position="bottom-left" />
                <MiniMap
                    nodeStrokeWidth={3}
                    zoomable
                    pannable
                    position="bottom-right"
                    style={{ width: 120, height: 80, margin: 16 }}
                />
            </ReactFlow>
        </div>
    )
}

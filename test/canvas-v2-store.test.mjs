import test from 'node:test'
import assert from 'node:assert/strict'
import { createCanvasStore } from '../static/js/canvas-v2/store/createCanvasStore.mjs'
import { validateCanvasDocument } from '../src/canvas_document.mjs'

test('createCanvasStore initializes with empty or provided document', () => {
    const store = createCanvasStore()
    const state = store.getState()
    assert.deepEqual(state.nodes, [])
    assert.deepEqual(state.edges, [])
    assert.equal(state.isEdit, true)
    assert.equal(state.dirty, false)
})

test('createNode adds node and supports undo/redo', () => {
    const store = createCanvasStore()

    store.getState().createNode({ type: 'text', text: 'Hello World' })
    let state = store.getState()
    assert.equal(state.nodes.length, 1)
    assert.equal(state.nodes[0].data.text, 'Hello World')
    assert.equal(state.history.past.length, 1)

    // Undo
    store.getState().undo()
    state = store.getState()
    assert.equal(state.nodes.length, 0)
    assert.equal(state.history.future.length, 1)

    // Redo
    store.getState().redo()
    state = store.getState()
    assert.equal(state.nodes.length, 1)
    assert.equal(state.nodes[0].data.text, 'Hello World')
})

test('duplicateNodes clones nodes with offset and selects duplicates', () => {
    const store = createCanvasStore()
    store.getState().createNode({ type: 'sticky', text: 'Sticky note' })
    const initialId = store.getState().nodes[0].id

    store.getState().duplicateNodes(initialId)
    const state = store.getState()
    assert.equal(state.nodes.length, 2)
    assert.notEqual(state.nodes[0].id, state.nodes[1].id)
    assert.equal(state.nodes[1].type, 'sticky')
    assert.equal(state.nodes[1].data.text, 'Sticky note')
    assert.equal(state.selectedNodeIds[0], state.nodes[1].id)
})

test('connectNodes creates valid edge and deleteNodes cascades to connected edges', () => {
    const store = createCanvasStore()
    store.getState().createNode({ id: 'node-1', type: 'text', text: 'First' })
    store.getState().createNode({ id: 'node-2', type: 'text', text: 'Second' })

    store.getState().connectNodes({
        source: 'node-1',
        target: 'node-2',
        sourceHandle: 'right',
        targetHandle: 'left',
    })

    let state = store.getState()
    assert.equal(state.edges.length, 1)
    assert.equal(state.edges[0].source, 'node-1')
    assert.equal(state.edges[0].target, 'node-2')
    assert.equal(state.edges[0].sourceHandle, 'right')
    assert.equal(state.edges[0].targetHandle, 'left')

    // Delete node-1 should cascade delete edge
    store.getState().deleteNodes('node-1')
    state = store.getState()
    assert.equal(state.nodes.length, 1)
    assert.equal(state.edges.length, 0)

    // Undo should restore both node-1 and the edge
    store.getState().undo()
    state = store.getState()
    assert.equal(state.nodes.length, 2)
    assert.equal(state.edges.length, 1)
})

test('updateEdgeLabel and updateEdgeStyle mutate edge properties', () => {
    const store = createCanvasStore()
    store.getState().createNode({ id: 'n1', type: 'text' })
    store.getState().createNode({ id: 'n2', type: 'text' })
    store.getState().connectNodes({ source: 'n1', target: 'n2' })

    const edgeId = store.getState().edges[0].id
    store.getState().updateEdgeLabel(edgeId, 'connects to')
    store.getState().updateEdgeStyle(edgeId, {
        lineStyle: 'dashed',
        strokeWidth: 4,
        color: '#ef4444',
        fromEnd: 'arrow',
        toEnd: 'arrow',
    })

    const edge = store.getState().edges[0]
    assert.equal(edge.label, 'connects to')
    assert.equal(edge.data.lineStyle, 'dashed')
    assert.equal(edge.data.strokeWidth, 4)
    assert.equal(edge.data.color, '#ef4444')
    assert.equal(edge.data.fromEnd, 'arrow')
    assert.equal(edge.data.toEnd, 'arrow')

    // Verify exported JSON Canvas validates
    const jsonCanvas = store.getState().toJsonCanvas()
    assert.doesNotThrow(() => validateCanvasDocument(jsonCanvas))
    assert.equal(jsonCanvas.edges[0].label, 'connects to')
    assert.equal(jsonCanvas.edges[0].fromEnd, 'arrow')
    assert.equal(jsonCanvas.edges[0].toEnd, 'arrow')
    assert.equal(jsonCanvas.edges[0].color, '#ef4444')
    assert.equal(jsonCanvas.edges[0].david888.lineStyle, 'dashed')
    assert.equal(jsonCanvas.edges[0].david888.strokeWidth, 4)
})

test('reconnectEdge changes source or target handle of existing edge', () => {
    const store = createCanvasStore()
    store.getState().createNode({ id: 'n1', type: 'text' })
    store.getState().createNode({ id: 'n2', type: 'text' })
    store.getState().createNode({ id: 'n3', type: 'text' })
    store.getState().connectNodes({ source: 'n1', target: 'n2' })

    const edgeId = store.getState().edges[0].id
    store.getState().reconnectEdge(edgeId, { source: 'n1', target: 'n3' })

    const edge = store.getState().edges[0]
    assert.equal(edge.target, 'n3')
})

import test from 'node:test'
import assert from 'node:assert/strict'
import { createCanvasStore } from '../static/js/canvas-v2/store/createCanvasStore.mjs'
import { createPersistenceBridge } from '../static/js/canvas-v2/store/persistence.mjs'
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

test('persistence bridge restores a newer local canvas draft after reload', async () => {
    const originalWindow = globalThis.window
    const localDraft = JSON.stringify({
        nodes: [{ id: 'draft-node', type: 'text', x: 24, y: 36, width: 320, height: 180, text: 'Recovered draft' }],
        edges: [],
    })
    const listeners = new Map()
    globalThis.window = {
        APP_STATE: { path: 'canvas-draft' },
        offlineStore: {
            async getNote(path) {
                assert.equal(path, 'canvas-draft')
                return {
                    path,
                    content: localDraft,
                    format: 'canvas',
                    syncStatus: 'draft',
                }
            },
        },
        addEventListener(type, handler) {
            listeners.set(type, handler)
        },
        removeEventListener(type, handler) {
            if (listeners.get(type) === handler) listeners.delete(type)
        },
        showToast() {},
    }

    try {
        const store = createCanvasStore({ nodes: [], edges: [] })
        const fakeTextarea = {
            value: '',
            events: [],
            dispatchEvent(evt) {
                this.events.push(evt.type)
                return true
            },
        }

        const cleanup = createPersistenceBridge(store, fakeTextarea, { debounceMs: 500 })
        await new Promise(resolve => setTimeout(resolve, 10))

        assert.equal(store.getState().nodes[0].data.text, 'Recovered draft')
        assert.equal(JSON.parse(fakeTextarea.value).nodes[0].text, 'Recovered draft')
        cleanup()
    } finally {
        if (originalWindow === undefined) delete globalThis.window
        else globalThis.window = originalWindow
    }
})

test('persistence bridge updates contentsElement.value immediately synchronously and supports flush', () => {
    const store = createCanvasStore()
    const fakeTextarea = {
        value: '',
        events: [],
        dispatchEvent(evt) {
            this.events.push(evt.type)
            return true
        },
    }

    import('../static/js/canvas-v2/store/persistence.mjs').then(({ createPersistenceBridge }) => {
        const cleanup = createPersistenceBridge(store, fakeTextarea, { debounceMs: 500 })

        // Create a node
        store.getState().createNode({ id: 'imm-1', type: 'text', text: 'Immediate Sync' })

        // Check immediate synchronous update of fakeTextarea.value
        assert.ok(fakeTextarea.value.includes('Immediate Sync'), 'contentsElement.value must update synchronously on store mutation')
        assert.equal(fakeTextarea.events.length, 0, 'debounce should delay the input event dispatch')

        // Trigger flush
        cleanup.flush()
        assert.ok(fakeTextarea.events.includes('input'), 'flush() must dispatch the input event immediately')

        cleanup()
    })
})

test('clearDocument creates an undoable transaction', () => {
    const store = createCanvasStore()
    store.getState().createNode({ id: 'c1', type: 'text', text: 'Card 1' })
    store.getState().createNode({ id: 'c2', type: 'text', text: 'Card 2' })
    assert.equal(store.getState().nodes.length, 2)

    store.getState().clearDocument()
    assert.equal(store.getState().nodes.length, 0)
    assert.ok(store.getState().history.past.length > 0)

    // Undo restores the cleared canvas
    store.getState().undo()
    assert.equal(store.getState().nodes.length, 2)
    assert.equal(store.getState().nodes[0].id, 'c1')
    assert.equal(store.getState().nodes[1].id, 'c2')
})

test('resize transaction captures snapshot and supports undo/redo', () => {
    const store = createCanvasStore()
    store.getState().createNode({ id: 'res-1', type: 'text', width: 200, height: 100 })

    // Simulate handleResizeStart snapshot
    const initialSnapshot = {
        nodes: store.getState().nodes.map(n => ({ ...n, position: { ...n.position }, style: { ...n.style }, data: { ...n.data } })),
        edges: store.getState().edges.map(e => ({ ...e, data: { ...e.data } })),
    }

    // Simulate resizing changes
    store.getState().setNodes(store.getState().nodes.map(n => ({
        ...n,
        style: { ...n.style, width: 450, height: 320 },
    })))
    assert.equal(store.getState().nodes[0].style.width, 450)

    // Commit resize transaction
    store.getState().commitTransaction(initialSnapshot)

    // Undo should restore original 200x100 dimensions
    store.getState().undo()
    assert.equal(store.getState().nodes[0].style.width, 200)
    assert.equal(store.getState().nodes[0].style.height, 100)

    // Redo should restore resized 450x320 dimensions
    store.getState().redo()
    assert.equal(store.getState().nodes[0].style.width, 450)
    assert.equal(store.getState().nodes[0].style.height, 320)
})

test('computeEdgeToolbarPosition avoids collision and respects narrow viewports', async () => {
    const { computeEdgeToolbarPosition } = await import('../static/js/canvas-v2/components/Edge/edgePositionHelpers.mjs')

    // Normal position
    const normal = computeEdgeToolbarPosition({ labelX: 400, labelY: 300, viewportWidth: 800, viewportHeight: 600 })
    assert.equal(normal.x, 400)
    assert.equal(normal.y, 300 - 32)

    // Flip below label when too close to top
    const nearTop = computeEdgeToolbarPosition({ labelX: 400, labelY: 20, viewportWidth: 800, viewportHeight: 600 })
    assert.equal(nearTop.y, 20 + 32)

    // Narrow 320px viewport clamps x
    const narrow = computeEdgeToolbarPosition({ labelX: 10, labelY: 200, toolbarWidth: 140, viewportWidth: 320, viewportHeight: 600 })
    assert.ok(narrow.x >= 16 + 70, `Expected clamped x >= 86, got ${narrow.x}`)
})

test('computeContrastTheme calculates high-contrast text and border colors', async () => {
    const { computeContrastTheme } = await import('../static/js/canvas-v2/model/contrastHelpers.mjs')

    // Light yellow sticky note
    const light = computeContrastTheme('#fff9c4')
    assert.equal(light.isLightBg, true)
    assert.equal(light.color, '#0f172a') // dark text

    // Dark navy card
    const dark = computeContrastTheme('#0f172a')
    assert.equal(dark.isLightBg, false)
    assert.equal(dark.color, '#f8fafc') // light text
})

test('performance benchmark: store handles 100 nodes and 300 edges efficiently', () => {
    const nodes = []
    for (let i = 0; i < 100; i++) {
        nodes.push({
            id: `bench-node-${i}`,
            type: i % 2 === 0 ? 'text' : 'sticky',
            x: (i % 10) * 260,
            y: Math.floor(i / 10) * 180,
            width: 240,
            height: 140,
            text: `Card content for benchmark item ${i}`,
        })
    }

    const edges = []
    for (let i = 0; i < 300; i++) {
        const fromIdx = i % 100
        const toIdx = (i + 1) % 100
        edges.push({
            id: `bench-edge-${i}`,
            fromNode: `bench-node-${fromIdx}`,
            toNode: `bench-node-${toIdx}`,
            fromSide: 'right',
            toSide: 'left',
            toEnd: 'arrow',
        })
    }

    const start = performance.now()
    const store = createCanvasStore({ nodes, edges })
    const state = store.getState()
    const exportDoc = state.toJsonCanvas()
    const duration = performance.now() - start

    assert.equal(state.nodes.length, 100)
    assert.equal(state.edges.length, 300)
    assert.equal(exportDoc.nodes.length, 100)
    assert.equal(exportDoc.edges.length, 300)
    assert.doesNotThrow(() => validateCanvasDocument(exportDoc))
    assert.ok(duration < 200, `Benchmark took ${duration.toFixed(2)}ms, expected < 200ms`)
})

test('Ameliorate node types and causes relation connect correctly', () => {
    const store = createCanvasStore()

    // 1. Create Problem node
    store.getState().createNode({ nodeType: 'problem' })
    let state = store.getState()
    assert.equal(state.nodes.length, 1)
    const probNode = state.nodes[0]
    assert.equal(probNode.data.nodeType, 'problem')
    assert.equal(probNode.data.text, 'new node')
    assert.equal(probNode.data.color, '#9333ea')

    // 2. Create Benefit node
    store.getState().createNode({ nodeType: 'benefit' })
    state = store.getState()
    assert.equal(state.nodes.length, 2)
    const benNode = state.nodes[1]
    assert.equal(benNode.data.nodeType, 'benefit')
    assert.equal(benNode.data.text, 'new node')
    assert.equal(benNode.data.color, '#16a34a')

    // 3. Connect Problem -> Benefit
    store.getState().connectNodes({
        source: probNode.id,
        target: benNode.id,
        sourceHandle: 'bottom',
        targetHandle: 'top',
    })
    state = store.getState()
    assert.equal(state.edges.length, 1)
    const edge = state.edges[0]
    assert.equal(edge.label, '')
    assert.equal(edge.sourceHandle, 'bottom')
    assert.equal(edge.targetHandle, 'top')
    store.getState().updateEdgeLabel(edge.id, 'causes')
    assert.equal(store.getState().edges[0].label, 'causes')

    // 4. Export to JSON Canvas 1.0
    const json = state.toJsonCanvas()
    assert.equal(json.nodes.length, 2)
    assert.equal(json.edges.length, 1)
    assert.equal(json.edges[0].label, 'causes')
    assert.equal(json.nodes[0].david888.nodeType, 'problem')
    assert.equal(json.nodes[1].david888.nodeType, 'benefit')
    assert.doesNotThrow(() => validateCanvasDocument(json))
})


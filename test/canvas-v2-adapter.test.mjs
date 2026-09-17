import test from 'node:test'
import assert from 'node:assert/strict'
import {
    jsonCanvasToStoreState,
    storeStateToJsonCanvas,
    resolveColorHex,
} from '../static/js/canvas-v2/model/jsonCanvasAdapter.mjs'
import {
    validateCanvasDocument,
    parseCanvasDocument,
    DEFAULT_CANVAS_NODES,
    DEFAULT_CANVAS_EDGES,
} from '../src/canvas_document.mjs'

test('resolveColorHex handles preset color ids and raw colors', () => {
    assert.equal(resolveColorHex('1'), '#ef4444')
    assert.equal(resolveColorHex('2'), '#f97316')
    assert.equal(resolveColorHex('3'), '#eab308')
    assert.equal(resolveColorHex('4'), '#22c55e')
    assert.equal(resolveColorHex('5'), '#3b82f6')
    assert.equal(resolveColorHex('6'), '#8b5cf6')
    assert.equal(resolveColorHex('#123456'), '#123456')
    assert.equal(resolveColorHex(''), '')
})

test('jsonCanvasToStoreState handles null or empty document gracefully', () => {
    const empty1 = jsonCanvasToStoreState(null)
    assert.deepEqual(empty1, { nodes: [], edges: [] })

    const empty2 = jsonCanvasToStoreState({})
    assert.deepEqual(empty2, { nodes: [], edges: [] })
})

test('round-trips default canvas document with semantic equality', () => {
    const originalDoc = {
        nodes: DEFAULT_CANVAS_NODES,
        edges: DEFAULT_CANVAS_EDGES,
    }

    const storeState = jsonCanvasToStoreState(originalDoc)
    assert.equal(storeState.nodes.length, 2)
    assert.equal(storeState.edges.length, 1)
    assert.equal(storeState.nodes[0].type, 'text')
    assert.equal(storeState.nodes[1].type, 'sticky')

    const exportedDoc = storeStateToJsonCanvas(storeState)
    assert.equal(exportedDoc.nodes.length, 2)
    assert.equal(exportedDoc.edges.length, 1)
    assert.doesNotThrow(() => validateCanvasDocument(exportedDoc))

    assert.equal(exportedDoc.nodes[0].id, 'node-welcome')
    assert.equal(exportedDoc.nodes[1].id, 'node-sticky-tip')
    assert.equal(exportedDoc.nodes[1].type, 'text')
    assert.equal(exportedDoc.nodes[1].david888.cardType, 'sticky')
    assert.equal(exportedDoc.edges[0].fromNode, 'node-welcome')
    assert.equal(exportedDoc.edges[0].toNode, 'node-sticky-tip')
})

test('round-trips all 5 node types: text, sticky, file, link, group', () => {
    const doc = {
        nodes: [
            { id: 'n-text', type: 'text', x: 10, y: 20, width: 320, height: 180, text: 'Markdown text', color: '1' },
            { id: 'n-sticky', type: 'text', x: 350, y: 20, width: 240, height: 160, text: 'Sticky note', color: '#fff9c4', david888: { cardType: 'sticky' } },
            { id: 'n-file', type: 'file', x: 10, y: 220, width: 280, height: 132, file: 'wiki-target', subpath: '#section' },
            { id: 'n-link', type: 'link', x: 310, y: 220, width: 280, height: 132, url: 'https://example.com/docs' },
            { id: 'n-group', type: 'group', x: 0, y: 0, width: 620, height: 400, label: 'Research Group', background: 'https://example.com/bg.png', backgroundStyle: 'cover' },
        ],
        edges: [
            {
                id: 'e-1',
                fromNode: 'n-text',
                toNode: 'n-sticky',
                fromSide: 'right',
                toSide: 'left',
                fromEnd: 'none',
                toEnd: 'arrow',
                label: 'relates to',
                color: '#ef4444',
                david888: { lineStyle: 'dashed', strokeWidth: 4 },
            },
            {
                id: 'e-2',
                fromNode: 'n-file',
                toNode: 'n-link',
                fromSide: 'bottom',
                toSide: 'top',
                fromEnd: 'arrow',
                toEnd: 'arrow',
                david888: { lineStyle: 'dotted', strokeWidth: 1.5 },
            },
        ],
    }

    const storeState = jsonCanvasToStoreState(doc)
    assert.equal(storeState.nodes.find(n => n.id === 'n-text').type, 'text')
    assert.equal(storeState.nodes.find(n => n.id === 'n-sticky').type, 'sticky')
    assert.equal(storeState.nodes.find(n => n.id === 'n-file').type, 'file')
    assert.equal(storeState.nodes.find(n => n.id === 'n-link').type, 'link')
    assert.equal(storeState.nodes.find(n => n.id === 'n-group').type, 'group')

    const exported = storeStateToJsonCanvas(storeState)
    assert.doesNotThrow(() => validateCanvasDocument(exported))

    const exportedSticky = exported.nodes.find(n => n.id === 'n-sticky')
    assert.equal(exportedSticky.type, 'text')
    assert.equal(exportedSticky.david888?.cardType, 'sticky')

    const exportedFile = exported.nodes.find(n => n.id === 'n-file')
    assert.equal(exportedFile.type, 'file')
    assert.equal(exportedFile.file, 'wiki-target')
    assert.equal(exportedFile.subpath, '#section')

    const exportedLink = exported.nodes.find(n => n.id === 'n-link')
    assert.equal(exportedLink.type, 'link')
    assert.equal(exportedLink.url, 'https://example.com/docs')

    const exportedGroup = exported.nodes.find(n => n.id === 'n-group')
    assert.equal(exportedGroup.type, 'group')
    assert.equal(exportedGroup.label, 'Research Group')
    assert.equal(exportedGroup.background, 'https://example.com/bg.png')
    assert.equal(exportedGroup.backgroundStyle, 'cover')

    const exportedEdge1 = exported.edges.find(e => e.id === 'e-1')
    assert.equal(exportedEdge1.fromSide, 'right')
    assert.equal(exportedEdge1.toSide, 'left')
    assert.equal(exportedEdge1.label, 'relates to')
    assert.equal(exportedEdge1.color, '#ef4444')
    assert.equal(exportedEdge1.david888?.lineStyle, 'dashed')
    assert.equal(exportedEdge1.david888?.strokeWidth, 4)

    const exportedEdge2 = exported.edges.find(e => e.id === 'e-2')
    assert.equal(exportedEdge2.fromEnd, 'arrow')
    assert.equal(exportedEdge2.toEnd, 'arrow')
    assert.equal(exportedEdge2.david888?.lineStyle, 'dotted')
    assert.equal(exportedEdge2.david888?.strokeWidth, 1.5)
})

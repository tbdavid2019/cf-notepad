import test from 'node:test'
import assert from 'node:assert/strict'
import { buildWikiLinkCanvas, extractWikiLinks } from '../static/js/canvas-v2/model/wikiGraphGenerator.mjs'

test('extractWikiLinks deduplicates targets and preserves aliases', () => {
    assert.deepEqual(
        extractWikiLinks('# Source\n\n[[alpha]] [[alpha|Alpha label]] [[beta#section|Beta]]'),
        [
            { path: 'alpha', label: 'alpha' },
            { path: 'beta', label: 'Beta' },
        ],
    )
})

test('buildWikiLinkCanvas creates valid root, target nodes, and edges', () => {
    const graph = buildWikiLinkCanvas({
        sourcePath: 'source-note',
        markdown: '# Source title\n\nSee [[target-a]] and [[target-b|Target B]].',
    })
    assert.equal(graph.nodes.length, 3)
    assert.equal(graph.edges.length, 2)
    assert.equal(graph.nodes[0].file, 'source-note')
    assert.equal(graph.edges[0].fromNode, graph.nodes[0].id)
    assert.equal(graph.edges[0].toEnd, 'arrow')
})

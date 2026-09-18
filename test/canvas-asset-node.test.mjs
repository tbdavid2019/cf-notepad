import test from 'node:test'
import assert from 'node:assert/strict'
import {
    jsonCanvasToStoreState,
    storeStateToJsonCanvas,
    isAssetUrlOrExtension,
} from '../static/js/canvas-v2/model/jsonCanvasAdapter.mjs'
import {
    validateCanvasDocument,
    normalizeCanvasDocument,
} from '../src/canvas_document.mjs'
import {
    isImageFile,
    isAudioFile,
    isVideoFile,
    detectMimeType,
    formatFileSize,
} from '../static/js/canvas-v2/model/assetUpload.mjs'

test('isAssetUrlOrExtension recognizes asset URLs and media file extensions', () => {
    assert.equal(isAssetUrlOrExtension('https://s3.wiki.david888.com/images/123.png'), true)
    assert.equal(isAssetUrlOrExtension('https://box.david888.com/files/audio.mp3'), true)
    assert.equal(isAssetUrlOrExtension('https://box.aiurl.tw/doc.pdf'), true)
    assert.equal(isAssetUrlOrExtension('photo.jpg'), true)
    assert.equal(isAssetUrlOrExtension('video.mp4'), true)
    assert.equal(isAssetUrlOrExtension('document.docx'), true)
    assert.equal(isAssetUrlOrExtension('notes/my-meeting-note'), false)
    assert.equal(isAssetUrlOrExtension('wiki-page'), false)
})

test('mime and file type helpers correctly classify assets', () => {
    assert.equal(isImageFile({ type: 'image/png' }), true)
    assert.equal(isImageFile({ name: 'test.jpg' }), true)
    assert.equal(isAudioFile({ type: 'audio/mpeg' }), true)
    assert.equal(isAudioFile({ name: 'recording.m4a' }), true)
    assert.equal(isVideoFile({ type: 'video/mp4' }), true)
    assert.equal(isVideoFile({ name: 'clip.webm' }), true)

    assert.equal(detectMimeType(null, 'photo.png'), 'image/png')
    assert.equal(detectMimeType(null, 'song.mp3'), 'audio/mpeg')
    assert.equal(detectMimeType(null, 'report.pdf'), 'application/pdf')

    assert.equal(formatFileSize(500), '500 B')
    assert.equal(formatFileSize(2048), '2.0 KB')
    assert.equal(formatFileSize(5 * 1024 * 1024), '5.0 MB')
})

test('normalizeCanvasDocument normalizes type asset to type file with subType asset', () => {
    const raw = {
        nodes: [
            {
                id: 'asset-1',
                type: 'asset',
                x: 100,
                y: 100,
                width: 320,
                height: 240,
                file: 'https://s3.wiki.david888.com/images/cat.png',
                david888: {
                    asset: {
                        name: 'cat.png',
                        mime: 'image/png',
                        size: 10240,
                        provider: 'r2',
                    },
                },
            },
        ],
        edges: [],
    }

    const normalized = normalizeCanvasDocument(raw)
    assert.equal(normalized.nodes[0].type, 'file')
    assert.equal(normalized.nodes[0].david888.subType, 'asset')
    assert.equal(normalized.nodes[0].david888.asset.name, 'cat.png')
    assert.doesNotThrow(() => validateCanvasDocument(normalized))
})

test('round-trips asset node through jsonCanvasAdapter with standard file node and david888.asset', () => {
    const jsonCanvasDoc = {
        nodes: [
            {
                id: 'asset-img-1',
                type: 'file',
                x: 50,
                y: 50,
                width: 320,
                height: 240,
                file: 'https://s3.wiki.david888.com/images/diagram.png',
                david888: {
                    subType: 'asset',
                    asset: {
                        name: 'diagram.png',
                        mime: 'image/png',
                        size: 45000,
                        provider: 'r2',
                    },
                },
            },
            {
                id: 'asset-audio-1',
                type: 'file',
                x: 400,
                y: 50,
                width: 320,
                height: 140,
                file: 'https://box.david888.com/podcast.mp3',
                david888: {
                    subType: 'asset',
                    asset: {
                        name: 'podcast.mp3',
                        mime: 'audio/mpeg',
                        size: 12000000,
                        provider: '888box',
                    },
                },
            },
        ],
        edges: [],
    }

    // Convert to store state
    const storeState = jsonCanvasToStoreState(jsonCanvasDoc)
    assert.equal(storeState.nodes.length, 2)
    assert.equal(storeState.nodes[0].type, 'asset')
    assert.equal(storeState.nodes[0].data.david888.subType, 'asset')
    assert.equal(storeState.nodes[0].data.david888.asset.provider, 'r2')

    assert.equal(storeState.nodes[1].type, 'asset')
    assert.equal(storeState.nodes[1].data.david888.subType, 'asset')
    assert.equal(storeState.nodes[1].data.david888.asset.provider, '888box')

    // Export back to standard JSON Canvas
    const exported = storeStateToJsonCanvas(storeState)
    assert.equal(exported.nodes.length, 2)
    assert.equal(exported.nodes[0].type, 'file')
    assert.equal(exported.nodes[0].file, 'https://s3.wiki.david888.com/images/diagram.png')
    assert.equal(exported.nodes[0].david888.subType, 'asset')
    assert.equal(exported.nodes[0].david888.asset.name, 'diagram.png')

    assert.equal(exported.nodes[1].type, 'file')
    assert.equal(exported.nodes[1].file, 'https://box.david888.com/podcast.mp3')
    assert.equal(exported.nodes[1].david888.subType, 'asset')
    assert.equal(exported.nodes[1].david888.asset.provider, '888box')

    assert.doesNotThrow(() => validateCanvasDocument(exported))
})

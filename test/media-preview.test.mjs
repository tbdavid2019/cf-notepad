import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import {
    getMediaPreviewDescriptor,
    getYouTubeVideoId,
} from '../static/js/media-preview.mjs'

const baseTemplateSource = readFileSync(new URL('../src/templates/base.js', import.meta.url), 'utf8')
const markdownCssSource = readFileSync(new URL('../src/styles/markdown.css.js', import.meta.url), 'utf8')

test('detects YouTube watch, short, and youtu.be URLs as privacy-enhanced embeds', () => {
    assert.equal(getYouTubeVideoId('https://www.youtube.com/watch?v=dQw4w9WgXcQ'), 'dQw4w9WgXcQ')
    assert.equal(getYouTubeVideoId('https://youtu.be/dQw4w9WgXcQ?t=42'), 'dQw4w9WgXcQ')
    assert.equal(getYouTubeVideoId('https://www.youtube.com/shorts/dQw4w9WgXcQ'), 'dQw4w9WgXcQ')

    assert.deepEqual(getMediaPreviewDescriptor('https://www.youtube.com/watch?v=dQw4w9WgXcQ'), {
        kind: 'youtube',
        src: 'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ?rel=0',
    })
})

test('detects PDF, video, and audio assets while retaining query strings', () => {
    assert.deepEqual(getMediaPreviewDescriptor('https://box.david888.com/file/report.PDF?download=0'), {
        kind: 'pdf',
        src: 'https://box.david888.com/file/report.PDF?download=0',
    })
    assert.deepEqual(getMediaPreviewDescriptor('https://box.david888.com/video/demo.mp4?token=abc'), {
        kind: 'video',
        src: 'https://box.david888.com/video/demo.mp4?token=abc',
    })
    assert.deepEqual(getMediaPreviewDescriptor('https://box.david888.com/audio/demo.m4a'), {
        kind: 'audio',
        src: 'https://box.david888.com/audio/demo.m4a',
    })
})

test('rejects unsafe URLs and unrelated links', () => {
    assert.equal(getMediaPreviewDescriptor('javascript:alert(1)'), null)
    assert.equal(getMediaPreviewDescriptor('data:text/html,<h1>bad</h1>'), null)
    assert.equal(getMediaPreviewDescriptor('https://example.com/document.txt'), null)
    assert.equal(getYouTubeVideoId('https://evil.example/watch?v=dQw4w9WgXcQ'), null)
})

test('renderer loads media decoration after sanitizing Markdown HTML', () => {
    assert.match(baseTemplateSource, /import \{ decorateMediaPreviews \} from '\/js\/media-preview\.mjs'/)
    assert.match(baseTemplateSource, /node\.innerHTML = clean;[\s\S]*decorateMediaPreviews\(node\)/)
    assert.match(markdownCssSource, /\.media-preview/)
})

/**
 * Excalidraw Whiteboard document utilities for cf-notepad.
 * Provides validation, parsing, and Markdown projection for search/SEO/LLMs.
 */

export const DEFAULT_WHITEBOARD_DOCUMENT = {
    type: 'excalidraw',
    version: 2,
    source: 'https://wiki.david888.com',
    elements: [
        {
            id: 'wb-welcome-rect',
            type: 'rectangle',
            x: 100,
            y: 80,
            width: 360,
            height: 200,
            strokeColor: '#1e1e1e',
            backgroundColor: '#e7f5ff',
            fillStyle: 'solid',
            strokeWidth: 2,
            strokeStyle: 'solid',
            roughness: 1,
            opacity: 100,
            groupIds: [],
            roundness: { type: 3 },
            seed: 104729,
            version: 1,
            versionNonce: 1,
            isDeleted: false,
            boundElements: null,
            updated: 1,
            link: null,
            locked: false,
        },
        {
            id: 'wb-welcome-text',
            type: 'text',
            x: 125,
            y: 110,
            width: 310,
            height: 140,
            fontSize: 20,
            fontFamily: 1,
            text: '🎨 Excalidraw 手繪白板\n\n歡迎使用自由手繪白板！\n• 支援色鉛筆手繪、箭頭連線與便籤\n• 100% 相容 Obsidian Excalidraw\n• 隨時匯出高清 PNG / SVG 圖形',
            textAlign: 'left',
            verticalAlign: 'top',
            baseline: 18,
            strokeColor: '#1e1e1e',
            backgroundColor: 'transparent',
            fillStyle: 'solid',
            strokeWidth: 1,
            strokeStyle: 'solid',
            roughness: 1,
            opacity: 100,
            groupIds: [],
            roundness: null,
            seed: 104730,
            version: 1,
            versionNonce: 1,
            isDeleted: false,
            boundElements: null,
            updated: 1,
            link: null,
            locked: false,
        },
    ],
    appState: {
        viewBackgroundColor: '#ffffff',
        gridSize: 20,
    },
    files: {},
}

function isPlainObject(value) {
    return Boolean(value && typeof value === 'object' && !Array.isArray(value))
}

export function isWhiteboardContent(content) {
    if (!content || typeof content !== 'string') return false
    const trimmed = content.trim()
    if (!trimmed.startsWith('{')) return false
    try {
        const parsed = JSON.parse(trimmed)
        return Boolean(
            parsed &&
            (parsed.type === 'excalidraw' || (Array.isArray(parsed.elements) && isPlainObject(parsed.appState)))
        )
    } catch {
        return false
    }
}

export function parseWhiteboardDocument(input) {
    if (isPlainObject(input)) return input
    if (typeof input !== 'string') return DEFAULT_WHITEBOARD_DOCUMENT
    const trimmed = input.trim()
    if (!trimmed) return DEFAULT_WHITEBOARD_DOCUMENT
    try {
        const parsed = JSON.parse(trimmed)
        if (isPlainObject(parsed) && Array.isArray(parsed.elements)) {
            return parsed
        }
    } catch {}
    return DEFAULT_WHITEBOARD_DOCUMENT
}

export function validateWhiteboardDocument(doc) {
    if (!isPlainObject(doc)) {
        throw new TypeError('Whiteboard document must be an object')
    }
    if (!Array.isArray(doc.elements)) {
        throw new TypeError('Whiteboard document must contain an "elements" array')
    }
    for (let i = 0; i < doc.elements.length; i++) {
        const el = doc.elements[i]
        if (!isPlainObject(el) || typeof el.type !== 'string') {
            throw new TypeError(`Whiteboard element at index ${i} must have a valid type`)
        }
    }
    return true
}

export function whiteboardToMarkdown(doc) {
    const parsed = parseWhiteboardDocument(doc)
    const elements = Array.isArray(parsed?.elements) ? parsed.elements : []
    const texts = []

    for (const el of elements) {
        if (el && !el.isDeleted && el.type === 'text' && typeof el.text === 'string') {
            const cleanText = el.text.trim()
            if (cleanText) texts.push(cleanText)
        }
    }

    if (texts.length === 0) {
        return '# 🎨 Excalidraw Whiteboard\n\n*(Empty whiteboard or non-text sketch elements)*\n'
    }

    const sections = texts.map(t => `- ${t.replace(/\n+/g, ' ')}`).join('\n')
    return `# 🎨 Excalidraw Whiteboard\n\n${sections}\n`
}

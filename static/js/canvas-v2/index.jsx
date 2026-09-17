import React from 'react'
import { createRoot } from 'react-dom/client'
import '@xyflow/react/dist/style.css'
import './canvas-v2.css'
import { CanvasEditorApp } from './CanvasEditorApp.jsx'
import { parseCanvasDocument, validateCanvasDocument } from '../../../src/canvas_document.mjs'

export function mountCanvasEditor(rootElement, contentsElement, { isEdit = true } = {}) {
    if (!rootElement || !contentsElement) {
        throw new Error('Canvas editor requires both rootElement and contentsElement')
    }

    let initialDoc
    try {
        const raw = contentsElement.value || ''
        const parsed = parseCanvasDocument(raw, { allowFallback: isEdit })
        initialDoc = validateCanvasDocument(parsed)
    } catch (err) {
        console.warn('[canvas-v2] initial document validation warning, using default:', err)
        initialDoc = parseCanvasDocument('', { allowFallback: true })
    }

    const root = createRoot(rootElement)
    root.render(
        <CanvasEditorApp
            initialDoc={initialDoc}
            isEdit={isEdit}
            contentsElement={contentsElement}
        />
    )

    return () => {
        root.unmount()
    }
}

export { CanvasEditorApp }

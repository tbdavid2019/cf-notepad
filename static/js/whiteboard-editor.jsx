/**
 * Excalidraw Whiteboard Editor entry point
 * 100% turnkey Excalidraw React component with standard JSON persistence.
 */

import React, { useEffect, useRef, useState, useCallback } from 'react'
import { createRoot } from 'react-dom/client'
import '@excalidraw/excalidraw/index.css'
import { Excalidraw } from '@excalidraw/excalidraw'

if (typeof window !== 'undefined' && !window.EXCALIDRAW_ASSET_PATH) {
    window.EXCALIDRAW_ASSET_PATH = 'https://unpkg.com/@excalidraw/excalidraw@0.18.1/dist/prod/'
}

function getInitialTheme() {
    if (typeof document === 'undefined') return 'light'
    const attr = document.documentElement.getAttribute('data-ui-theme')
    if (attr === 'dark') return 'dark'
    if (attr === 'light') return 'light'
    return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

function parseInitialData(rawText) {
    if (!rawText || typeof rawText !== 'string') return null
    try {
        const parsed = JSON.parse(rawText)
        if (parsed && (parsed.type === 'excalidraw' || Array.isArray(parsed.elements))) {
            return {
                elements: parsed.elements || [],
                appState: parsed.appState || {},
                files: parsed.files || {},
            }
        }
    } catch {}
    return null
}

export function WhiteboardApp({ contentsEl, isEdit }) {
    const initialDataRef = useRef(null)
    if (!initialDataRef.current) {
        initialDataRef.current = parseInitialData(contentsEl.value)
    }

    const [theme, setTheme] = useState(getInitialTheme)
    const saveTimerRef = useRef(null)

    useEffect(() => {
        const observer = new MutationObserver(() => {
            setTheme(getInitialTheme())
        })
        observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-ui-theme'] })
        return () => observer.disconnect()
    }, [])

    const handleChange = useCallback((elements, appState, files) => {
        if (!isEdit) return
        if (saveTimerRef.current) clearTimeout(saveTimerRef.current)

        saveTimerRef.current = setTimeout(() => {
            const safeAppState = {
                viewBackgroundColor: appState.viewBackgroundColor,
                gridSize: appState.gridSize,
            }
            const payload = {
                type: 'excalidraw',
                version: 2,
                source: 'https://wiki.david888.com',
                elements,
                appState: safeAppState,
                files: files || {},
            }
            contentsEl.value = JSON.stringify(payload, null, 2)
            contentsEl.dispatchEvent(new Event('input', { bubbles: true }))
        }, 300)
    }, [contentsEl, isEdit])

    const isZh = () => {
        if (typeof document === 'undefined') return true
        const lang = document.documentElement.getAttribute('lang') || document.body.getAttribute('data-lang')
        return lang && lang.startsWith('zh')
    }

    return (
        <div style={{ width: '100%', height: '100%', position: 'relative' }}>
            <Excalidraw
                initialData={initialDataRef.current}
                onChange={handleChange}
                viewModeEnabled={!isEdit}
                zenModeEnabled={false}
                gridModeEnabled={false}
                theme={theme}
                langCode={isZh() ? 'zh-TW' : 'en'}
                UIOptions={{
                    canvasActions: {
                        loadScene: isEdit,
                        saveAsImage: true,
                        export: isEdit,
                    },
                }}
            />
        </div>
    )
}

export function mountWhiteboardEditor(rootEl, contentsEl, options = {}) {
    const isEdit = options.isEdit === true
    const reactRoot = createRoot(rootEl)
    reactRoot.render(<WhiteboardApp contentsEl={contentsEl} isEdit={isEdit} />)
    return reactRoot
}

const root = document.querySelector('#whiteboard-editor')
const source = document.querySelector('#contents')

if (root && source) {
    const isEditableMode = root.getAttribute('data-editable') === 'true' || window.APP_STATE?.isEdit === true
    mountWhiteboardEditor(root, source, { isEdit: isEditableMode })
}

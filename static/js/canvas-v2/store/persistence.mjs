/**
 * Persistence bridge for Canvas v2
 * Bridges the Zustand store with #contents, local drafts, and offline storage.
 */

import { parseCanvasDocument, validateCanvasDocument } from '../../../../src/canvas_document.mjs'

export function createPersistenceBridge(store, contentsElement, options = {}) {
    if (!contentsElement) return () => {}

    const isZh = () => {
        const lang = typeof document !== 'undefined' ? document.documentElement?.getAttribute('lang') : null
        if (lang && lang.startsWith('zh')) return true
        return typeof window !== 'undefined' && window.APP_STATE?.lang?.startsWith?.('zh')
    }

    let saveTimer = null

    const flush = () => {
        if (saveTimer) {
            clearTimeout(saveTimer)
            saveTimer = null
        }
        try {
            const state = store.getState()
            if (!state.isEdit) return
            const jsonCanvas = state.toJsonCanvas()
            const serialized = JSON.stringify(jsonCanvas, null, 2)
            if (contentsElement.value !== serialized) {
                contentsElement.value = serialized
            }
            contentsElement.dispatchEvent(new Event('input', { bubbles: true }))
        } catch (err) {
            console.error('[canvas-v2] failed to flush canvas document:', err)
        }
    }

    // Subscribe to store changes to update #contents
    const unsubscribe = store.subscribe((state, prevState) => {
        if (!state.isEdit) return
        if (state.nodes === prevState?.nodes && state.edges === prevState?.edges) return

        // 1. Immediately update contentsElement.value synchronously to avoid race condition on immediate publish/pagehide
        try {
            const jsonCanvas = state.toJsonCanvas()
            const serialized = JSON.stringify(jsonCanvas, null, 2)
            if (contentsElement.value !== serialized) {
                contentsElement.value = serialized
            }
        } catch (err) {
            console.error('[canvas-v2] failed to serialize canvas document synchronously:', err)
            store.getState().setSyncStatus('error')
            return
        }

        // 2. Debounce the input event (autosave schedule) and set dirty
        if (saveTimer) clearTimeout(saveTimer)
        saveTimer = setTimeout(() => {
            saveTimer = null
            contentsElement.dispatchEvent(new Event('input', { bubbles: true }))
            store.getState().setSyncStatus('dirty')
        }, options.debounceMs ?? 300)
    })

    // Listeners for flush & sync status events
    const handleFlush = () => flush()
    const handleVisibilityChange = () => {
        if (typeof document !== 'undefined' && document.visibilityState === 'hidden') {
            flush()
        }
    }
    const handleSyncing = () => store.getState().setSyncStatus('syncing')
    const handleSynced = () => {
        store.getState().setSyncStatus('synced')
        store.getState().setDirty(false)
    }
    const handleError = () => store.getState().setSyncStatus('error')

    if (typeof window !== 'undefined') {
        window.addEventListener('pagehide', handleFlush)
        window.addEventListener('beforeunload', handleFlush)
        window.addEventListener('canvas:flush', handleFlush)
        window.addEventListener('canvas:syncing', handleSyncing)
        window.addEventListener('canvas:synced', handleSynced)
        window.addEventListener('canvas:error', handleError)
        window.canvasBridge = {
            flush,
            store,
            contentsElement,
        }
    }
    if (typeof document !== 'undefined') {
        document.addEventListener('visibilitychange', handleVisibilityChange)
    }

    const cleanup = () => {
        unsubscribe()
        if (saveTimer) clearTimeout(saveTimer)
        if (typeof window !== 'undefined') {
            window.removeEventListener('pagehide', handleFlush)
            window.removeEventListener('beforeunload', handleFlush)
            window.removeEventListener('canvas:flush', handleFlush)
            window.removeEventListener('canvas:syncing', handleSyncing)
            window.removeEventListener('canvas:synced', handleSynced)
            window.removeEventListener('canvas:error', handleError)
            if (window.canvasBridge?.flush === flush) {
                delete window.canvasBridge
            }
        }
        if (typeof document !== 'undefined') {
            document.removeEventListener('visibilitychange', handleVisibilityChange)
        }
    }

    cleanup.flush = flush
    return cleanup
}

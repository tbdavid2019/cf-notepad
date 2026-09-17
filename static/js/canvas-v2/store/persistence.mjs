/**
 * Persistence bridge for Canvas v2
 * Bridges the Zustand store with #contents, local drafts, and offline storage.
 */

import { parseCanvasDocument, validateCanvasDocument } from '../../../../src/canvas_document.mjs'

export function createPersistenceBridge(store, contentsElement, options = {}) {
    if (!contentsElement) return () => {}

    const isZh = () => {
        const lang = document.documentElement.getAttribute('lang')
        if (lang && lang.startsWith('zh')) return true
        return typeof window !== 'undefined' && window.APP_STATE?.lang?.startsWith?.('zh')
    }

    let saveTimer = null

    // Subscribe to store changes to update #contents
    const unsubscribe = store.subscribe((state, prevState) => {
        if (!state.isEdit) return
        if (state.nodes === prevState?.nodes && state.edges === prevState?.edges) return

        if (saveTimer) clearTimeout(saveTimer)
        saveTimer = setTimeout(() => {
            try {
                const jsonCanvas = state.toJsonCanvas()
                const serialized = JSON.stringify(jsonCanvas, null, 2)
                if (contentsElement.value !== serialized) {
                    contentsElement.value = serialized
                    contentsElement.dispatchEvent(new Event('input', { bubbles: true }))
                    store.getState().setSyncStatus('dirty')
                }
            } catch (err) {
                console.error('[canvas-v2] failed to serialize canvas document:', err)
                store.getState().setSyncStatus('error')
            }
        }, options.debounceMs ?? 300)
    })

    // Local draft restoration from offlineStore
    const restoreLocalDraft = async () => {
        if (!store.getState().isEdit || typeof window === 'undefined' || !window.offlineStore || !window.APP_STATE?.path) {
            return
        }
        try {
            const note = await window.offlineStore.getNote(window.APP_STATE.path)
            if (!note || note.format !== 'canvas' || !['draft', 'pending'].includes(note.syncStatus)) {
                return
            }
            if (!note.content || note.content === contentsElement.value) {
                return
            }

            const parsed = parseCanvasDocument(note.content, { allowFallback: false })
            const validated = validateCanvasDocument(parsed)
            store.getState().loadDocument(validated)
            contentsElement.value = note.content
            contentsElement.dispatchEvent(new Event('input', { bubbles: true }))

            window.showToast?.(
                isZh() ? '已恢復本機 Canvas 草稿' : 'Restored local Canvas draft'
            )
        } catch (err) {
            console.warn('[canvas-v2] draft restoration skipped or invalid:', err)
        }
    }

    // Schedule draft restoration asynchronously after initial mount
    const draftTimer = setTimeout(restoreLocalDraft, 0)

    return () => {
        unsubscribe()
        if (saveTimer) clearTimeout(saveTimer)
        clearTimeout(draftTimer)
    }
}

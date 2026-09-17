import React, { useEffect, useCallback } from 'react'
import { ReactFlowProvider } from '@xyflow/react'
import { Diagram } from './components/Diagram/Diagram.jsx'
import { MainToolbar } from './components/Toolbar/MainToolbar.jsx'
import { fitView } from './components/Diagram/viewportHelpers.mjs'
import { selectIsEdit } from './store/selectors.mjs'

export function CanvasEditorView({ store }) {
    const isEdit = store(selectIsEdit)

    // Keyboard shortcuts
    const handleKeyDown = useCallback((e) => {
        const isCmdOrCtrl = e.metaKey || e.ctrlKey
        const targetTag = e.target?.tagName?.toLowerCase()
        const isInput = targetTag === 'input' || targetTag === 'textarea'

        if (isCmdOrCtrl && e.key.toLowerCase() === 'z') {
            if (isInput) return
            e.preventDefault()
            if (e.shiftKey) {
                store.getState().redo()
            } else {
                store.getState().undo()
            }
        } else if (isCmdOrCtrl && e.key.toLowerCase() === 'y') {
            if (isInput) return
            e.preventDefault()
            store.getState().redo()
        } else if (e.key === 'Delete' || e.key === 'Backspace') {
            if (isInput) return
            const state = store.getState()
            if (state.selectedNodeIds.length > 0) {
                e.preventDefault()
                state.deleteNodes(state.selectedNodeIds)
            } else if (state.selectedEdgeIds.length > 0) {
                e.preventDefault()
                state.deleteEdges(state.selectedEdgeIds)
            }
        }
    }, [store])

    useEffect(() => {
        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [handleKeyDown])

    return (
        <ReactFlowProvider>
            <div className="canvas-v2-root">
                <Diagram store={store} />
                <MainToolbar store={store} onFitView={() => fitView({ padding: 0.2, duration: 400 })} />
            </div>
        </ReactFlowProvider>
    )
}

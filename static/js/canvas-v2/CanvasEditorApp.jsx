import React, { useState, useEffect } from 'react'
import { createCanvasStore } from './store/createCanvasStore.mjs'
import { createPersistenceBridge } from './store/persistence.mjs'
import { CanvasEditorView } from './CanvasEditorView.jsx'

export function CanvasEditorApp({ initialDoc, isEdit = true, contentsElement }) {
    const [store] = useState(() => createCanvasStore(initialDoc, { isEdit }))

    useEffect(() => {
        if (!contentsElement) return
        const cleanupBridge = createPersistenceBridge(store, contentsElement)
        return () => cleanupBridge()
    }, [store, contentsElement])

    return <CanvasEditorView store={store} />
}

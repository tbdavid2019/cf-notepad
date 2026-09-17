import React, { useRef, useEffect } from 'react'
import { parseCanvasDocument, validateCanvasDocument } from '../../../../../src/canvas_document.mjs'

export function FileMenu({ isOpen = false, onClose, store }) {
    const fileInputRef = useRef(null)
    const menuRef = useRef(null)

    useEffect(() => {
        if (!isOpen) return

        const handleKeyDown = (e) => {
            if (e.key === 'Escape') {
                e.preventDefault()
                onClose?.()
            }
        }

        const handlePointerDown = (e) => {
            if (menuRef.current && !menuRef.current.contains(e.target)) {
                onClose?.()
            }
        }

        window.addEventListener('keydown', handleKeyDown)
        window.addEventListener('pointerdown', handlePointerDown)
        return () => {
            window.removeEventListener('keydown', handleKeyDown)
            window.removeEventListener('pointerdown', handlePointerDown)
        }
    }, [isOpen, onClose])

    if (!isOpen) return null

    const isZh = () => {
        const lang = document.documentElement.getAttribute('lang')
        return lang && lang.startsWith('zh')
    }
    const zh = isZh()

    const handleImportClick = () => {
        fileInputRef.current?.click()
    }

    const handleFileChange = (e) => {
        const file = e.target.files?.[0]
        if (!file) return

        const reader = new FileReader()
        reader.onload = (event) => {
            try {
                const text = event.target?.result
                const parsed = parseCanvasDocument(text, { allowFallback: false })
                const validated = validateCanvasDocument(parsed)
                store.getState().loadDocument(validated)
                store.getState().setDirty(true)
                window.showToast?.(zh ? '已成功匯入 Canvas 檔案' : 'Canvas imported successfully')
            } catch (err) {
                console.error('[canvas-v2] import failed:', err)
                window.showToast?.(zh ? '匯入失敗：格式不正確' : 'Import failed: Invalid format')
            }
        }
        reader.readAsText(file)
        e.target.value = ''
        onClose?.()
    }

    const handleExport = () => {
        try {
            const jsonCanvas = store.getState().toJsonCanvas()
            const blob = new Blob([JSON.stringify(jsonCanvas, null, 2)], { type: 'application/json' })
            const url = URL.createObjectURL(blob)
            const a = document.createElement('a')
            const title = window.APP_STATE?.title || 'canvas'
            a.href = url
            a.download = `${title}.canvas`
            a.click()
            URL.revokeObjectURL(url)
            onClose?.()
        } catch (err) {
            console.error('[canvas-v2] export failed:', err)
        }
    }

    const handleClear = () => {
        if (confirm(zh ? '確定要清空畫布上的所有卡片與連線嗎？（可透過 Undo 復原）' : 'Are you sure you want to clear the canvas? (Undoable)')) {
            store.getState().clearDocument()
        }
        onClose?.()
    }

    return (
        <div
            ref={menuRef}
            className="canvas-menu-dropdown nodrag nopan"
            role="menu"
            aria-label={zh ? '檔案選單' : 'File Menu'}
            onClick={(e) => e.stopPropagation()}
        >
            <input
                ref={fileInputRef}
                type="file"
                accept=".canvas,application/json"
                style={{ display: 'none' }}
                onChange={handleFileChange}
            />

            <button type="button" role="menuitem" className="canvas-menu-item" onClick={handleImportClick}>
                <span>📥</span>
                <span>{zh ? '匯入 .canvas 檔案' : 'Import .canvas'}</span>
            </button>

            <button type="button" role="menuitem" className="canvas-menu-item" onClick={handleExport}>
                <span>📤</span>
                <span>{zh ? '匯出 .canvas 檔案' : 'Export .canvas'}</span>
            </button>

            <div className="canvas-toolbar-divider" style={{ width: '100%', height: '1px' }} />

            <button type="button" role="menuitem" className="canvas-menu-item" style={{ color: 'var(--canvas-danger)' }} onClick={handleClear}>
                <span>🗑️</span>
                <span>{zh ? '清空畫布' : 'Clear Canvas'}</span>
            </button>
        </div>
    )
}

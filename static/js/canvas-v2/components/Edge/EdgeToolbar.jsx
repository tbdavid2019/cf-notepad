import React, { useState, useRef, useEffect } from 'react'
import { EdgeStylePopover } from './EdgeStylePopover.jsx'

export function EdgeToolbar({
    id,
    data = {},
    selected = false,
    isEdit = true,
    onStartEditLabel,
    onChangeStyle,
    onDelete,
}) {
    const [isPopoverOpen, setIsPopoverOpen] = useState(false)
    const toolbarRef = useRef(null)

    useEffect(() => {
        if (!isPopoverOpen) return

        const handleKeyDown = (e) => {
            if (e.key === 'Escape') {
                e.preventDefault()
                setIsPopoverOpen(false)
            }
        }

        const handlePointerDown = (e) => {
            if (toolbarRef.current && !toolbarRef.current.contains(e.target)) {
                setIsPopoverOpen(false)
            }
        }

        window.addEventListener('keydown', handleKeyDown)
        window.addEventListener('pointerdown', handlePointerDown)
        return () => {
            window.removeEventListener('keydown', handleKeyDown)
            window.removeEventListener('pointerdown', handlePointerDown)
        }
    }, [isPopoverOpen])

    if (!selected || !isEdit) return null

    const isZh = () => {
        const lang = document.documentElement.getAttribute('lang')
        return lang && lang.startsWith('zh')
    }
    const zh = isZh()

    return (
        <div ref={toolbarRef} className="canvas-edge-toolbar nodrag nopan" style={{ position: 'relative' }}>
            <button
                type="button"
                className="canvas-btn-icon"
                title={zh ? '編輯標籤' : 'Edit label'}
                aria-label={zh ? '編輯標籤' : 'Edit label'}
                onClick={() => onStartEditLabel?.()}
            >
                🏷️
            </button>

            <button
                type="button"
                className={`canvas-btn-icon ${isPopoverOpen ? 'is-active' : ''}`}
                title={zh ? '線條樣式設定' : 'Line style settings'}
                aria-label={zh ? '線條樣式設定' : 'Line style settings'}
                aria-haspopup="dialog"
                aria-expanded={isPopoverOpen}
                onClick={() => setIsPopoverOpen(!isPopoverOpen)}
            >
                ⚙️
            </button>

            <button
                type="button"
                className="canvas-btn-icon is-danger"
                title={zh ? '刪除連線' : 'Delete edge'}
                aria-label={zh ? '刪除連線' : 'Delete edge'}
                onClick={() => onDelete?.(id)}
            >
                ✕
            </button>

            <EdgeStylePopover
                id={id}
                data={data}
                isOpen={isPopoverOpen}
                onClose={() => setIsPopoverOpen(false)}
                onChangeStyle={onChangeStyle}
            />
        </div>
    )
}

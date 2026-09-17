import React, { useState } from 'react'
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

    if (!selected || !isEdit) return null

    const isZh = () => {
        const lang = document.documentElement.getAttribute('lang')
        return lang && lang.startsWith('zh')
    }
    const zh = isZh()

    return (
        <div className="canvas-edge-toolbar nodrag nopan" style={{ position: 'relative' }}>
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

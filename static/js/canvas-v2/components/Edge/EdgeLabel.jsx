import React, { useState, useEffect } from 'react'
import { Check } from 'lucide-react'

export function EdgeLabel({
    id,
    label = '',
    hasArrow = true,
    selected = false,
    isEdit = true,
    isEditing = false,
    onStartEdit,
    onFinishEdit,
    onSelect,
}) {
    const [localText, setLocalText] = useState(label)

    useEffect(() => {
        setLocalText(label)
    }, [label])

    const isZh = () => {
        const lang = document.documentElement.getAttribute('lang')
        return lang && lang.startsWith('zh')
    }
    const zh = isZh()

    const handleSave = () => {
        onFinishEdit?.(localText.trim())
    }

    if (isEditing && isEdit) {
        return (
            <div className="nodrag nopan ameliorate-edge-edit" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <input
                    type="text"
                    autoFocus
                    className="canvas-edge-input"
                    value={localText}
                    onChange={(e) => setLocalText(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSave()
                        if (e.key === 'Escape') onFinishEdit?.(label)
                    }}
                    placeholder={zh ? '關係標籤...' : 'Edge label...'}
                />
                <button
                    type="button"
                    className="canvas-btn-icon-subtle"
                    onClick={handleSave}
                    title={zh ? '確定' : 'Done'}
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                    <Check size={12} />
                </button>
            </div>
        )
    }

    const display = label || (selected ? (zh ? '+ 標籤' : '+ Label') : '')
    if (!display && !selected) return null

    return (
        <div
            className={`canvas-edge-label-badge ameliorate-edge-label nodrag nopan ${selected ? 'is-selected' : ''}`}
            onClick={(e) => {
                e.stopPropagation()
                onSelect?.()
                if (selected && isEdit) onStartEdit?.()
            }}
            title={isEdit ? (zh ? '點擊編輯標籤' : 'Click to edit label') : ''}
        >
            {display && <span className="ameliorate-edge-text">{display}</span>}
        </div>
    )
}

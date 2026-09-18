import React from 'react'
import { Palette, Trash2 } from 'lucide-react'
import { CANVAS_COLOR_PRESETS } from '../../model/canvasTypes.mjs'

export function SelectionToolbar({ store }) {
    const selectedNodeIds = store(state => state.selectedNodeIds)
    const isEdit = store(state => state.isEdit)
    if (!isEdit || selectedNodeIds.length < 2) return null

    const isZh = document.documentElement.getAttribute('lang')?.startsWith('zh')
    const handleColor = (color) => {
        store.getState().setNodesColor(selectedNodeIds, color)
    }

    return (
        <div className="canvas-selection-toolbar nodrag nopan" role="toolbar" aria-label={isZh ? '批次編輯選取卡片' : 'Bulk edit selected cards'}>
            <span className="canvas-selection-count">
                {isZh ? `已選 ${selectedNodeIds.length} 張` : `${selectedNodeIds.length} selected`}
            </span>
            <span className="canvas-toolbar-divider" />
            <Palette size={14} aria-hidden="true" />
            <div className="canvas-selection-colors" role="group" aria-label={isZh ? '批次變更顏色' : 'Change selected colors'}>
                {CANVAS_COLOR_PRESETS.map(preset => (
                    <button
                        key={preset.id}
                        type="button"
                        className="canvas-color-dot"
                        style={{ backgroundColor: preset.value || 'var(--canvas-paper)' }}
                        title={preset.label}
                        aria-label={preset.label}
                        onClick={() => handleColor(preset.value)}
                    />
                ))}
            </div>
            <span className="canvas-toolbar-divider" />
            <button
                type="button"
                className="canvas-selection-delete"
                title={isZh ? '刪除選取卡片' : 'Delete selected cards'}
                aria-label={isZh ? '刪除選取卡片' : 'Delete selected cards'}
                onClick={() => store.getState().deleteNodes(selectedNodeIds)}
            >
                <Trash2 size={14} />
            </button>
        </div>
    )
}

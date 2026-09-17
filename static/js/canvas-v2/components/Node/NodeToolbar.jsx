import React from 'react'
import { NodeToolbar as FlowNodeToolbar, Position } from '@xyflow/react'
import { Copy, Trash2, Palette } from 'lucide-react'
import { CANVAS_COLOR_PRESETS, STICKY_PALETTE } from '../../model/canvasTypes.mjs'
import { resolveColorHex } from '../../model/jsonCanvasAdapter.mjs'

export function NodeToolbar({ id, data, type, selected, isEdit, onDuplicate, onDelete, onChangeColor }) {
    if (!isEdit || !selected) return null

    const palette = type === 'sticky' ? STICKY_PALETTE : CANVAS_COLOR_PRESETS
    const currentColor = data?.color || ''
    const currentHex = resolveColorHex(currentColor) || '#ffffff'

    const isZh = () => {
        const lang = document.documentElement.getAttribute('lang')
        return lang && lang.startsWith('zh')
    }
    const zh = isZh()

    return (
        <FlowNodeToolbar isVisible={selected && isEdit} position={Position.Top} offset={10}>
            <div className="canvas-node-toolbar nodrag nopan">
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    {palette.map(preset => (
                        <button
                            key={preset.id}
                            type="button"
                            className={`canvas-color-dot ${currentColor === preset.value || currentHex === preset.value ? 'is-active' : ''}`}
                            style={{ backgroundColor: preset.preview || preset.value || '#ffffff' }}
                            title={preset.label}
                            aria-label={preset.label}
                            onClick={() => onChangeColor?.(id, preset.value)}
                        />
                    ))}
                    <label
                        className="canvas-btn-icon"
                        title={zh ? '自訂顏色' : 'Custom color'}
                        style={{ cursor: 'pointer', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', width: 24, height: 24, background: 'transparent', border: 'none', color: '#475569', borderRadius: 4, padding: 0 }}
                    >
                        <Palette size={13} />
                        <input
                            type="color"
                            value={currentHex}
                            style={{ opacity: 0, position: 'absolute', inset: 0, cursor: 'pointer', width: '100%', height: '100%' }}
                            onChange={(e) => onChangeColor?.(id, e.target.value)}
                        />
                    </label>
                </div>

                <div className="canvas-toolbar-divider" />

                <button
                    type="button"
                    className="canvas-btn-icon"
                    title={zh ? '複製卡片' : 'Duplicate card'}
                    aria-label={zh ? '複製卡片' : 'Duplicate card'}
                    onClick={() => onDuplicate?.(id)}
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 24, height: 24, background: 'transparent', border: 'none', color: '#475569', borderRadius: 4, padding: 0, cursor: 'pointer' }}
                >
                    <Copy size={13} />
                </button>

                <button
                    type="button"
                    className="canvas-btn-icon is-danger"
                    title={zh ? '刪除卡片' : 'Delete card'}
                    aria-label={zh ? '刪除卡片' : 'Delete card'}
                    onClick={() => onDelete?.(id)}
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 24, height: 24, background: 'transparent', border: 'none', color: '#dc2626', borderRadius: 4, padding: 0, cursor: 'pointer' }}
                >
                    <Trash2 size={13} />
                </button>
            </div>
        </FlowNodeToolbar>
    )
}

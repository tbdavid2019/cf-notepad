import React from 'react'
import {
    EDGE_ARROW_OPTIONS,
    EDGE_LINE_OPTIONS,
    EDGE_WIDTH_OPTIONS,
    EDGE_COLORS,
} from '../../model/canvasTypes.mjs'

export function EdgeStylePopover({
    id,
    data = {},
    isOpen = false,
    onClose,
    onChangeStyle,
}) {
    if (!isOpen) return null

    const isZh = () => {
        const lang = document.documentElement.getAttribute('lang')
        return lang && lang.startsWith('zh')
    }
    const zh = isZh()

    const fromEnd = data.fromEnd || 'none'
    const toEnd = data.toEnd !== undefined ? data.toEnd : 'arrow'
    const currentArrow = `${fromEnd}:${toEnd}`
    const lineStyle = data.lineStyle || 'solid'
    const strokeWidth = String(data.strokeWidth || '2.5')
    const color = data.color || '#2563a6'

    return (
        <div
            className="canvas-menu-dropdown nodrag nopan"
            style={{ minWidth: '180px', gap: '8px', padding: '8px' }}
            role="dialog"
            aria-label={zh ? '線條樣式設定' : 'Line style settings'}
            onClick={(e) => e.stopPropagation()}
        >
            {/* Arrow direction */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <span style={{ fontSize: '11px', color: 'var(--canvas-text-muted)' }}>
                    {zh ? '箭頭方向' : 'Arrow Direction'}
                </span>
                <select
                    className="canvas-edge-select"
                    value={currentArrow}
                    onChange={(e) => {
                        const [nextFrom, nextTo] = e.target.value.split(':')
                        onChangeStyle?.(id, { fromEnd: nextFrom, toEnd: nextTo })
                    }}
                >
                    {EDGE_ARROW_OPTIONS.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                </select>
            </div>

            {/* Line style */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <span style={{ fontSize: '11px', color: 'var(--canvas-text-muted)' }}>
                    {zh ? '線條樣式' : 'Line Style'}
                </span>
                <select
                    className="canvas-edge-select"
                    value={lineStyle}
                    onChange={(e) => onChangeStyle?.(id, { lineStyle: e.target.value })}
                >
                    {EDGE_LINE_OPTIONS.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                </select>
            </div>

            {/* Line width */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <span style={{ fontSize: '11px', color: 'var(--canvas-text-muted)' }}>
                    {zh ? '線條粗細' : 'Stroke Width'}
                </span>
                <select
                    className="canvas-edge-select"
                    value={strokeWidth}
                    onChange={(e) => onChangeStyle?.(id, { strokeWidth: Number(e.target.value) })}
                >
                    {EDGE_WIDTH_OPTIONS.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                </select>
            </div>

            {/* Color palette */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <span style={{ fontSize: '11px', color: 'var(--canvas-text-muted)' }}>
                    {zh ? '線條顏色' : 'Color'}
                </span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexWrap: 'wrap' }}>
                    {EDGE_COLORS.map(c => (
                        <button
                            key={c.id}
                            type="button"
                            className={`canvas-color-dot ${color === c.value ? 'is-active' : ''}`}
                            style={{ backgroundColor: c.value }}
                            title={c.label}
                            aria-label={c.label}
                            onClick={() => onChangeStyle?.(id, { color: c.value })}
                        />
                    ))}
                    <input
                        type="color"
                        value={color}
                        title={zh ? '自訂線條顏色' : 'Custom edge color'}
                        style={{ width: '18px', height: '18px', padding: 0, border: 'none', cursor: 'pointer' }}
                        onChange={(e) => onChangeStyle?.(id, { color: e.target.value })}
                    />
                </div>
            </div>
        </div>
    )
}

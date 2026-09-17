import React, { useMemo } from 'react'
import { NodeResizer } from '@xyflow/react'
import { NodeHandles } from './NodeHandle.jsx'
import { NodeToolbar } from './NodeToolbar.jsx'
import { resolveColorHex } from '../../model/jsonCanvasAdapter.mjs'
import { computeContrastTheme } from '../../model/contrastHelpers.mjs'

export { computeContrastTheme }

export function FlowNode({
    id,
    type,
    data = {},
    selected = false,
    minWidth = 180,
    minHeight = 100,
    icon = '📄',
    title = 'Card',
    isEdit = true,
    isEditing = false,
    onToggleEdit,
    onDuplicate,
    onDelete,
    onChangeColor,
    children,
    headerRight = null,
}) {
    const isZh = () => {
        const lang = document.documentElement.getAttribute('lang')
        return lang && lang.startsWith('zh')
    }
    const zh = isZh()

    const colorHex = resolveColorHex(data.color)
    const contrast = useMemo(() => computeContrastTheme(colorHex), [colorHex])

    const customStyle = useMemo(() => {
        if (!colorHex) return {}
        if (type === 'sticky') {
            return {
                backgroundColor: colorHex,
                borderColor: contrast?.borderColor || 'rgba(0, 0, 0, 0.15)',
                color: contrast?.color || '#1e293b',
                '--canvas-text': contrast?.color || '#1e293b',
                '--canvas-text-muted': contrast?.mutedColor || '#475569',
            }
        }
        return {
            backgroundColor: colorHex,
            borderColor: colorHex,
            color: contrast?.color,
            '--canvas-text': contrast?.color,
            '--canvas-text-muted': contrast?.mutedColor,
        }
    }, [colorHex, type, contrast])

    return (
        <div
            className={`canvas-node-shell ${selected ? 'is-selected' : ''} ${type === 'sticky' ? 'is-sticky' : ''} ${type === 'group' ? 'is-group' : ''}`}
            style={customStyle}
            onClick={() => {
                if (!selected && isEdit && data.onSelectNode) {
                    data.onSelectNode(id)
                }
            }}
            onDoubleClick={() => isEdit && onToggleEdit?.()}
        >
            <NodeResizer
                minWidth={minWidth}
                minHeight={minHeight}
                isVisible={selected && isEdit}
                lineClassName="canvas-resizer-line"
                handleClassName="canvas-resizer-handle"
                onResizeStart={data.onResizeStart}
                onResizeEnd={data.onResizeEnd}
            />

            <NodeHandles isEdit={isEdit} />

            <NodeToolbar
                id={id}
                data={data}
                type={type}
                selected={selected}
                isEdit={isEdit}
                onDuplicate={onDuplicate}
                onDelete={onDelete}
                onChangeColor={onChangeColor}
            />

            {type !== 'group' && (
                <div className="canvas-node-header">
                    <div className="canvas-node-title">
                        <span className="canvas-node-icon">{icon}</span>
                        <span>{title}</span>
                    </div>

                    <div className="canvas-node-actions nodrag">
                        {headerRight}
                        {isEdit && onToggleEdit && (
                            <button
                                type="button"
                                className="canvas-btn-icon"
                                title={isEditing ? (zh ? '完成' : 'Done') : (zh ? '編輯' : 'Edit')}
                                aria-label={isEditing ? (zh ? '完成' : 'Done') : (zh ? '編輯' : 'Edit')}
                                onClick={(e) => {
                                    e.stopPropagation()
                                    onToggleEdit()
                                }}
                            >
                                {isEditing ? '✓' : '✎'}
                            </button>
                        )}
                        {isEdit && onDelete && (
                            <button
                                type="button"
                                className="canvas-btn-icon is-danger"
                                title={zh ? '刪除卡片' : 'Delete card'}
                                aria-label={zh ? '刪除卡片' : 'Delete card'}
                                onClick={(e) => {
                                    e.stopPropagation()
                                    onDelete(id)
                                }}
                            >
                                ✕
                            </button>
                        )}
                    </div>
                </div>
            )}

            <div className="canvas-node-body nowheel">
                {children}
            </div>
        </div>
    )
}

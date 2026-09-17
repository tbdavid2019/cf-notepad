import React, { useState, useMemo } from 'react'
import { NodeResizer } from '@xyflow/react'
import { NodeHandles } from './NodeHandle.jsx'
import { NodeToolbar } from './NodeToolbar.jsx'
import { resolveColorHex } from '../../model/jsonCanvasAdapter.mjs'

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
    const customStyle = useMemo(() => {
        if (!colorHex) return {}
        if (type === 'sticky') {
            return {
                backgroundColor: colorHex,
                borderColor: 'rgba(0, 0, 0, 0.15)',
                color: '#1e293b',
            }
        }
        return {
            backgroundColor: colorHex,
            borderColor: colorHex,
        }
    }, [colorHex, type])

    return (
        <div
            className={`canvas-node-shell ${selected ? 'is-selected' : ''} ${type === 'sticky' ? 'is-sticky' : ''} ${type === 'group' ? 'is-group' : ''}`}
            style={customStyle}
            onDoubleClick={() => isEdit && onToggleEdit?.()}
        >
            <NodeResizer
                minWidth={minWidth}
                minHeight={minHeight}
                isVisible={selected && isEdit}
                lineClassName="canvas-resizer-line"
                handleClassName="canvas-resizer-handle"
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
                <div className="canvas-node-header nodrag">
                    <div className="canvas-node-title">
                        <span className="canvas-node-icon">{icon}</span>
                        <span>{title}</span>
                    </div>

                    <div className="canvas-node-actions">
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

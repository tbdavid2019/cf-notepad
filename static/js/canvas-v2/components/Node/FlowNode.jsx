import React, { useMemo } from 'react'
import { NodeResizer } from '@xyflow/react'
import { Check, Pencil, Trash2 } from 'lucide-react'
import { NodeHandles } from './NodeHandle.jsx'
import { NodeToolbar } from './NodeToolbar.jsx'
import { NodeLucideIcon } from './nodeIcons.jsx'
import { resolveColorHex } from '../../model/jsonCanvasAdapter.mjs'
import { computeContrastTheme } from '../../model/contrastHelpers.mjs'
import { getNodeTypeConfig } from '../../model/canvasTypes.mjs'

export { computeContrastTheme }

export function FlowNode({
    id,
    type,
    data = {},
    selected = false,
    minWidth = 140,
    minHeight = 56,
    icon,
    title,
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
    const nodeType = data.nodeType || (type === 'sticky' ? 'sticky' : 'problem')
    const typeConfig = useMemo(() => getNodeTypeConfig(nodeType, colorHex), [nodeType, colorHex])

    const effectiveTitle = title || (data.label || (zh ? typeConfig.nameZh : typeConfig.name))

    const customStyle = useMemo(() => {
        if (type === 'sticky') {
            const bg = colorHex || '#fef9c3'
            const isLight = contrast?.isLightBg !== false
            return {
                '--node-bg': bg,
                '--node-border': contrast?.borderColor || '#fef08a',
                '--node-badge-bg': '#fef08a',
                '--node-badge-text': '#713f12',
                '--node-text': isLight ? '#0f172a' : '#ffffff',
            }
        }
        if (type === 'group') {
            return {
                '--node-bg': 'rgba(241, 245, 249, 0.4)',
                '--node-border': colorHex || '#94a3b8',
                '--node-badge-bg': colorHex || '#cbd5e1',
                '--node-badge-text': '#1e293b',
                '--node-text': '#1e293b',
            }
        }

        const isCustomColor = Boolean(
            colorHex &&
            colorHex.toLowerCase() !== (typeConfig.color || '').toLowerCase() &&
            colorHex.toLowerCase() !== (typeConfig.badgeBg || '').toLowerCase()
        )

        let badgeBg = typeConfig.badgeBg
        let badgeText = typeConfig.textColor
        let border = typeConfig.borderLight
        const bg = '#ffffff'

        if (isCustomColor) {
            badgeBg = colorHex
            badgeText = contrast?.isLightBg ? '#0f172a' : '#ffffff'
            border = colorHex
        }

        return {
            '--node-bg': bg,
            '--node-border': border,
            '--node-badge-bg': badgeBg,
            '--node-badge-text': badgeText,
            '--node-text': '#0f172a',
        }
    }, [colorHex, type, typeConfig, contrast])

    return (
        <div
            className={`canvas-node-shell ameliorate-node ${selected ? 'is-selected' : ''} ${type === 'sticky' ? 'is-sticky' : ''} ${type === 'group' ? 'is-group' : ''}`}
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
                <div className="canvas-node-top">
                    <div className="canvas-node-type-badge">
                        <span className="canvas-node-type-icon">
                            {icon || <NodeLucideIcon type={nodeType} size={11} />}
                        </span>
                        <span className="canvas-node-type-text">{effectiveTitle}</span>
                    </div>

                    <div className="canvas-node-quick-actions nodrag">
                        {headerRight}
                        {isEdit && onToggleEdit && (
                            <button
                                type="button"
                                className="canvas-btn-icon-subtle"
                                title={isEditing ? (zh ? '預覽' : 'Preview') : (zh ? '編輯' : 'Edit')}
                                aria-label={isEditing ? (zh ? '預覽' : 'Preview') : (zh ? '編輯' : 'Edit')}
                                onClick={(e) => {
                                    e.stopPropagation()
                                    onToggleEdit()
                                }}
                            >
                                {isEditing ? <Check size={11} /> : <Pencil size={11} />}
                            </button>
                        )}
                        {isEdit && onDelete && (
                            <button
                                type="button"
                                className="canvas-btn-icon-subtle is-danger"
                                title={zh ? '刪除卡片' : 'Delete card'}
                                aria-label={zh ? '刪除卡片' : 'Delete card'}
                                onClick={(e) => {
                                    e.stopPropagation()
                                    onDelete(id)
                                }}
                            >
                                <Trash2 size={11} />
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

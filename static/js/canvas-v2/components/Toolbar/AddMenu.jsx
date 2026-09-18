import React, { useRef, useEffect } from 'react'
import { AMELIORATE_NODE_TYPES } from '../../model/canvasTypes.mjs'
import { NodeLucideIcon } from '../Node/nodeIcons.jsx'

export function AddMenu({ isOpen = false, onClose, onAddNode }) {
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

    const thoughtNodes = [
        AMELIORATE_NODE_TYPES.problem,
        AMELIORATE_NODE_TYPES.benefit,
        AMELIORATE_NODE_TYPES.solution,
        AMELIORATE_NODE_TYPES.cause,
        AMELIORATE_NODE_TYPES.criterion,
        AMELIORATE_NODE_TYPES.detriment,
        AMELIORATE_NODE_TYPES.question,
        AMELIORATE_NODE_TYPES.note,
    ]

    return (
        <div
            ref={menuRef}
            className="canvas-menu-dropdown nodrag nopan"
            role="menu"
            aria-label={zh ? '新增思考卡片' : 'Add Card'}
            onClick={(e) => e.stopPropagation()}
            style={{ maxHeight: '420px', overflowY: 'auto' }}
        >
            <div className="canvas-menu-header">
                {zh ? '思考節點 (Thought Nodes)' : 'Thought Nodes'}
            </div>

            {thoughtNodes.map(cfg => (
                <button
                    key={cfg.id}
                    type="button"
                    role="menuitem"
                    className="canvas-menu-item"
                    onClick={() => {
                        onAddNode?.({ type: 'text', nodeType: cfg.id, color: cfg.color })
                        onClose?.()
                    }}
                >
                    <span
                        className="canvas-menu-icon"
                        style={{
                            backgroundColor: cfg.badgeBg,
                            color: cfg.textColor,
                            padding: '3px 6px',
                            borderRadius: '4px',
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            border: `1px solid ${cfg.borderLight}`,
                        }}
                    >
                        <NodeLucideIcon type={cfg.id} size={12} />
                    </span>
                    <span style={{ fontWeight: 600, fontSize: '12px' }}>{cfg.name}</span>
                    <span style={{ color: 'var(--canvas-text-muted)', fontSize: '11px', marginLeft: 'auto' }}>
                        {zh ? cfg.nameZh : ''}
                    </span>
                </button>
            ))}

            <div className="canvas-menu-divider" />
            <div className="canvas-menu-header">
                {zh ? '擴充項目 (Extensions)' : 'Extensions'}
            </div>

            <button
                type="button"
                role="menuitem"
                className="canvas-menu-item"
                onClick={() => {
                    onAddNode?.({ type: 'sticky' })
                    onClose?.()
                }}
            >
                <span
                    className="canvas-menu-icon"
                    style={{
                        backgroundColor: '#fef9c3',
                        color: '#854d0e',
                        padding: '3px 6px',
                        borderRadius: '4px',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: '1px solid #fef08a',
                    }}
                >
                    <NodeLucideIcon type="sticky" size={12} />
                </span>
                <span>{zh ? '靈感便籤' : 'Sticky Note'}</span>
            </button>

            <button
                type="button"
                role="menuitem"
                className="canvas-menu-item"
                onClick={() => {
                    onAddNode?.({ type: 'file' })
                    onClose?.()
                }}
            >
                <span
                    className="canvas-menu-icon"
                    style={{
                        backgroundColor: '#f1f5f9',
                        color: '#334155',
                        padding: '3px 6px',
                        borderRadius: '4px',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: '1px solid #e2e8f0',
                    }}
                >
                    <NodeLucideIcon type="file" size={12} />
                </span>
                <span>{zh ? '引用 Wiki 筆記' : 'Reference Wiki Note'}</span>
            </button>

            <button
                type="button"
                role="menuitem"
                className="canvas-menu-item"
                onClick={() => {
                    onAddNode?.({ type: 'asset' })
                    onClose?.()
                }}
            >
                <span
                    className="canvas-menu-icon"
                    style={{
                        backgroundColor: '#e0f2fe',
                        color: '#0369a1',
                        padding: '3px 6px',
                        borderRadius: '4px',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: '1px solid #bae6fd',
                    }}
                >
                    <NodeLucideIcon type="asset" size={12} />
                </span>
                <span>{zh ? '圖片／檔案資源' : 'Image / File Asset'}</span>
            </button>

            <button
                type="button"
                role="menuitem"
                className="canvas-menu-item"
                onClick={() => {
                    onAddNode?.({ type: 'link' })
                    onClose?.()
                }}
            >
                <span
                    className="canvas-menu-icon"
                    style={{
                        backgroundColor: '#f1f5f9',
                        color: '#334155',
                        padding: '3px 6px',
                        borderRadius: '4px',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: '1px solid #e2e8f0',
                    }}
                >
                    <NodeLucideIcon type="link" size={12} />
                </span>
                <span>{zh ? '外部網頁連結' : 'Web Link'}</span>
            </button>

            <button
                type="button"
                role="menuitem"
                className="canvas-menu-item"
                onClick={() => {
                    onAddNode?.({ type: 'group' })
                    onClose?.()
                }}
            >
                <span
                    className="canvas-menu-icon"
                    style={{
                        backgroundColor: '#f1f5f9',
                        color: '#334155',
                        padding: '3px 6px',
                        borderRadius: '4px',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: '1px solid #e2e8f0',
                    }}
                >
                    <NodeLucideIcon type="group" size={12} />
                </span>
                <span>{zh ? '卡片分組' : 'Group'}</span>
            </button>
        </div>
    )
}

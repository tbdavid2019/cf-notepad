import React from 'react'

export function AddMenu({ isOpen = false, onClose, onAddNode }) {
    if (!isOpen) return null

    const isZh = () => {
        const lang = document.documentElement.getAttribute('lang')
        return lang && lang.startsWith('zh')
    }
    const zh = isZh()

    return (
        <div className="canvas-menu-dropdown nodrag nopan" onClick={(e) => e.stopPropagation()}>
            <button
                type="button"
                className="canvas-menu-item"
                onClick={() => {
                    onAddNode?.({ type: 'text' })
                    onClose?.()
                }}
            >
                <span>📄</span>
                <span>{zh ? '新增 Markdown 卡片' : 'New Markdown Card'}</span>
            </button>

            <button
                type="button"
                className="canvas-menu-item"
                onClick={() => {
                    onAddNode?.({ type: 'sticky' })
                    onClose?.()
                }}
            >
                <span>💡</span>
                <span>{zh ? '新增靈感便籤' : 'New Sticky Note'}</span>
            </button>

            <button
                type="button"
                className="canvas-menu-item"
                onClick={() => {
                    onAddNode?.({ type: 'file' })
                    onClose?.()
                }}
            >
                <span>📖</span>
                <span>{zh ? '引用 Wiki 筆記' : 'Reference Wiki Note'}</span>
            </button>

            <button
                type="button"
                className="canvas-menu-item"
                onClick={() => {
                    onAddNode?.({ type: 'link' })
                    onClose?.()
                }}
            >
                <span>🔗</span>
                <span>{zh ? '新增外部網頁連結' : 'New Web Link'}</span>
            </button>

            <button
                type="button"
                className="canvas-menu-item"
                onClick={() => {
                    onAddNode?.({ type: 'group' })
                    onClose?.()
                }}
            >
                <span>📁</span>
                <span>{zh ? '新增卡片群組' : 'New Group'}</span>
            </button>
        </div>
    )
}

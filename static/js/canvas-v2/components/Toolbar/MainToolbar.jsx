import React, { useState } from 'react'
import { AddMenu } from './AddMenu.jsx'
import { FileMenu } from './FileMenu.jsx'
import { getViewportCenter } from '../Diagram/viewportHelpers.mjs'
import { NODE_DIMENSIONS } from '../../model/canvasTypes.mjs'
import {
    selectCanUndo,
    selectCanRedo,
    selectIsEdit,
    selectSyncStatus,
} from '../../store/selectors.mjs'

export function MainToolbar({ store, onFitView }) {
    const [isAddMenuOpen, setIsAddMenuOpen] = useState(false)
    const [isFileMenuOpen, setIsFileMenuOpen] = useState(false)

    const canUndo = store(selectCanUndo)
    const canRedo = store(selectCanRedo)
    const isEdit = store(selectIsEdit)
    const syncStatus = store(selectSyncStatus)

    const isZh = () => {
        const lang = document.documentElement.getAttribute('lang')
        return lang && lang.startsWith('zh')
    }
    const zh = isZh()

    const handleAddNode = (opts) => {
        const center = getViewportCenter()
        const defaults = NODE_DIMENSIONS[opts.type] || NODE_DIMENSIONS.text
        const x = Math.round(center.x - (defaults?.width || 320) / 2)
        const y = Math.round(center.y - (defaults?.height || 180) / 2)
        store.getState().createNode({ ...opts, x, y })
    }

    return (
        <div className="canvas-main-toolbar nodrag nopan" onClick={(e) => e.stopPropagation()}>
            {isEdit ? (
                <>
                    <div style={{ position: 'relative' }}>
                        <button
                            type="button"
                            className={`canvas-tb-btn ${isAddMenuOpen ? 'is-active' : ''}`}
                            title={zh ? '新增卡片' : 'Add card'}
                            aria-label={zh ? '新增卡片' : 'Add card'}
                            aria-haspopup="menu"
                            aria-expanded={isAddMenuOpen}
                            onClick={() => {
                                setIsFileMenuOpen(false)
                                setIsAddMenuOpen(!isAddMenuOpen)
                            }}
                        >
                            <span>➕</span>
                            <span>{zh ? '新增' : 'Add'}</span>
                        </button>
                        <AddMenu
                            isOpen={isAddMenuOpen}
                            onClose={() => setIsAddMenuOpen(false)}
                            onAddNode={handleAddNode}
                        />
                    </div>

                    <div className="canvas-toolbar-divider" />

                    <button
                        type="button"
                        className="canvas-tb-btn"
                        disabled={!canUndo}
                        title={zh ? '復原 (Cmd+Z)' : 'Undo (Cmd+Z)'}
                        aria-label={zh ? '復原' : 'Undo'}
                        onClick={() => store.getState().undo()}
                    >
                        <span>↶</span>
                    </button>

                    <button
                        type="button"
                        className="canvas-tb-btn"
                        disabled={!canRedo}
                        title={zh ? '重做 (Cmd+Shift+Z)' : 'Redo (Cmd+Shift+Z)'}
                        aria-label={zh ? '重做' : 'Redo'}
                        onClick={() => store.getState().redo()}
                    >
                        <span>↷</span>
                    </button>

                    <div className="canvas-toolbar-divider" />
                </>
            ) : (
                <div style={{ padding: '0 8px', fontSize: '11px', color: 'var(--canvas-text-muted)' }}>
                    <span>🔒 {zh ? '唯讀模式' : 'Read-only'}</span>
                </div>
            )}

            <button
                type="button"
                className="canvas-tb-btn"
                title={zh ? '適應畫面' : 'Fit view'}
                aria-label={zh ? '適應畫面' : 'Fit view'}
                onClick={() => onFitView?.()}
            >
                <span>⛶</span>
                <span>{zh ? '置中' : 'Fit'}</span>
            </button>

            <div className="canvas-toolbar-divider" />

            <div style={{ position: 'relative' }}>
                <button
                    type="button"
                    className={`canvas-tb-btn ${isFileMenuOpen ? 'is-active' : ''}`}
                    title={zh ? '檔案選單' : 'File menu'}
                    aria-label={zh ? '檔案選單' : 'File menu'}
                    aria-haspopup="menu"
                    aria-expanded={isFileMenuOpen}
                    onClick={() => {
                        setIsAddMenuOpen(false)
                        setIsFileMenuOpen(!isFileMenuOpen)
                    }}
                >
                    <span>📁</span>
                </button>
                <FileMenu
                    isOpen={isFileMenuOpen}
                    onClose={() => setIsFileMenuOpen(false)}
                    store={store}
                />
            </div>

            {syncStatus === 'syncing' && (
                <span className="canvas-status-badge is-syncing" title={zh ? '正在同步至雲端...' : 'Syncing...'}>
                    🔄
                </span>
            )}
            {syncStatus === 'dirty' && (
                <span className="canvas-status-badge is-dirty" title={zh ? '有未儲存的變更' : 'Unsaved changes'}>
                    •
                </span>
            )}
            {syncStatus === 'error' && (
                <span className="canvas-status-badge is-error" style={{ color: 'var(--canvas-danger)' }} title={zh ? '儲存失敗' : 'Save failed'}>
                    ⚠️
                </span>
            )}
        </div>
    )
}

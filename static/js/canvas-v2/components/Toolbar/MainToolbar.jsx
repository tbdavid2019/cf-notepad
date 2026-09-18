import React, { useState } from 'react'
import { Plus, Undo2, Redo2, Maximize2, FolderDown, Lock } from 'lucide-react'
import { AddMenu } from './AddMenu.jsx'
import { FileMenu } from './FileMenu.jsx'
import { SelectionToolbar } from './SelectionToolbar.jsx'
import { CanvasSearch } from './CanvasSearch.jsx'
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

    const uploadAsset = async (file) => {
        const isImage = file.type.startsWith('image/')
        const endpoints = isImage
            ? ['/upload', 'https://box.david888.com/api.php?action=upload', 'https://box.aiurl.tw/api.php?action=upload', 'https://box.glsoft.ai/api.php?action=upload']
            : ['https://box.david888.com/api.php?action=upload', 'https://box.aiurl.tw/api.php?action=upload', 'https://box.glsoft.ai/api.php?action=upload']

        let lastError
        for (const endpoint of endpoints) {
            try {
                const form = new FormData()
                form.append(endpoint === '/upload' ? 'image' : 'file', file)
                if (endpoint !== '/upload') form.append('title', file.name || 'canvas-asset')
                const response = await fetch(endpoint, { method: 'POST', body: form })
                const payload = await response.json()
                const url = payload?.data?.url || (typeof payload?.data === 'string' ? payload.data : '') || payload?.url
                if (response.ok && url && (endpoint === '/upload' ? payload?.err === 0 : payload?.result === 'success' || payload?.data?.url || payload?.url)) {
                    return url
                }
                lastError = new Error(payload?.msg || payload?.message || 'Asset upload failed')
            } catch (error) {
                lastError = error
            }
        }
        throw lastError || new Error('Asset upload failed')
    }

    const handleAddAsset = async (file) => {
        try {
            const url = await uploadAsset(file)
            const center = getViewportCenter()
            const defaults = NODE_DIMENSIONS.file
            const assetKind = file.type.startsWith('image/')
                ? 'image'
                : file.type.startsWith('audio/')
                    ? 'audio'
                    : file.type.startsWith('video/')
                        ? 'video'
                        : 'file'
            store.getState().createNode({
                type: 'file',
                file: url,
                x: Math.round(center.x - defaults.width / 2),
                y: Math.round(center.y - defaults.height / 2),
                david888: {
                    asset: {
                        kind: assetKind,
                        name: file.name || 'Canvas asset',
                        mimeType: file.type || 'application/octet-stream',
                        size: file.size || 0,
                    },
                },
            })
        } catch (error) {
            window.showToast?.(zh ? `上傳失敗：${error.message}` : `Upload failed: ${error.message}`)
        }
    }

    return (
        <>
            <SelectionToolbar store={store} />
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
                            <Plus size={15} />
                            <span>{zh ? '新增' : 'Add'}</span>
                        </button>
                        <AddMenu
                            isOpen={isAddMenuOpen}
                            onClose={() => setIsAddMenuOpen(false)}
                            onAddNode={handleAddNode}
                            onAddAsset={handleAddAsset}
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
                        <Undo2 size={15} />
                    </button>

                    <button
                        type="button"
                        className="canvas-tb-btn"
                        disabled={!canRedo}
                        title={zh ? '重做 (Cmd+Shift+Z)' : 'Redo (Cmd+Shift+Z)'}
                        aria-label={zh ? '重做' : 'Redo'}
                        onClick={() => store.getState().redo()}
                    >
                        <Redo2 size={15} />
                    </button>

                    <div className="canvas-toolbar-divider" />
                </>
            ) : (
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '0 8px', fontSize: '11px', color: 'var(--canvas-text-muted)' }}>
                    <Lock size={12} />
                    <span>{zh ? '唯讀模式' : 'Read-only'}</span>
                </div>
            )}

            <button
                type="button"
                className="canvas-tb-btn"
                title={zh ? '適應畫面' : 'Fit view'}
                aria-label={zh ? '適應畫面' : 'Fit view'}
                onClick={() => onFitView?.()}
            >
                <Maximize2 size={14} />
                <span>{zh ? '置中' : 'Fit'}</span>
            </button>

            <CanvasSearch store={store} />

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
                    <FolderDown size={15} />
                </button>
                <FileMenu
                    isOpen={isFileMenuOpen}
                    onClose={() => setIsFileMenuOpen(false)}
                    store={store}
                />
            </div>

            {syncStatus === 'syncing' && (
                <span className="canvas-status-badge is-syncing" title={zh ? '正在同步至雲端...' : 'Syncing...'}>
                    •
                </span>
            )}
            {syncStatus === 'dirty' && (
                <span className="canvas-status-badge is-dirty" title={zh ? '有未儲存的變更' : 'Unsaved changes'}>
                    •
                </span>
            )}
            {syncStatus === 'error' && (
                <span className="canvas-status-badge is-error" title={zh ? '同步發生錯誤' : 'Sync error'}>
                    !
                </span>
            )}
            </div>
        </>
    )
}

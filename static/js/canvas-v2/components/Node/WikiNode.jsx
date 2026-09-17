import React, { useState, useEffect } from 'react'
import { FlowNode } from './FlowNode.jsx'
import { NODE_DIMENSIONS } from '../../model/canvasTypes.mjs'

function sanitizeWikiPath(val) {
    const raw = String(val || '').trim()
    if (!raw || raw.startsWith('//') || raw.includes('://') || raw.startsWith('javascript:')) {
        return ''
    }
    return '/' + raw.replace(/^\/+/, '')
}

export function WikiNode(props) {
    const { id, data = {}, selected = false } = props
    const [isEditing, setIsEditing] = useState(!data.file && data.isEdit !== false)
    const [localFile, setLocalFile] = useState(data.file || '')

    useEffect(() => {
        setLocalFile(data.file || '')
    }, [data.file])

    const isZh = () => {
        const lang = document.documentElement.getAttribute('lang')
        return lang && lang.startsWith('zh')
    }
    const zh = isZh()

    const handleSave = () => {
        setIsEditing(false)
        if (localFile !== data.file) {
            data.onUpdateContent?.(id, { file: localFile })
        }
    }

    const noteHref = sanitizeWikiPath(localFile)

    return (
        <FlowNode
            id={id}
            type="file"
            data={data}
            selected={selected}
            minWidth={NODE_DIMENSIONS.file.minWidth}
            minHeight={NODE_DIMENSIONS.file.minHeight}
            icon="📖"
            title={zh ? 'Wiki 筆記引用' : 'Wiki Note Reference'}
            isEdit={data.isEdit !== false}
            isEditing={isEditing}
            onToggleEdit={() => setIsEditing(!isEditing)}
            onDuplicate={data.onDuplicate}
            onDelete={data.onDelete}
            onChangeColor={data.onChangeColor}
        >
            <div className="canvas-wiki-card">
                {isEditing ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }} className="nodrag">
                        <input
                            type="text"
                            autoFocus
                            className="canvas-edge-input"
                            style={{ width: '100%', boxSizing: 'border-box' }}
                            value={localFile}
                            onChange={(e) => setLocalFile(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') handleSave()
                                if (e.key === 'Escape') setIsEditing(false)
                            }}
                            placeholder={zh ? '輸入文章路徑 (例如: my-note)...' : 'Enter note path (e.g. my-note)...'}
                        />
                        <button
                            type="button"
                            className="canvas-tb-btn"
                            style={{ alignSelf: 'flex-start', background: 'var(--canvas-accent)', color: '#fff' }}
                            onClick={handleSave}
                        >
                            {zh ? '儲存' : 'Save'}
                        </button>
                    </div>
                ) : (
                    <>
                        <div style={{ fontWeight: 600, fontSize: '13px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {localFile || (zh ? '未設定筆記路徑' : 'No note path set')}
                        </div>
                        {noteHref && (
                            <a
                                href={noteHref}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="canvas-wiki-link-btn nodrag"
                            >
                                <span>📖</span>
                                <span>{zh ? '開啟筆記 ↗' : 'Open Note ↗'}</span>
                            </a>
                        )}
                    </>
                )}
            </div>
        </FlowNode>
    )
}

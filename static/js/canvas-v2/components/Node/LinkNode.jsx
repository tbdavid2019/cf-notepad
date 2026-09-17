import React, { useState, useEffect } from 'react'
import { FlowNode } from './FlowNode.jsx'
import { NODE_DIMENSIONS } from '../../model/canvasTypes.mjs'

function sanitizeExternalUrl(val) {
    try {
        const parsed = new URL(val)
        if (['http:', 'https:'].includes(parsed.protocol)) {
            return parsed.href
        }
    } catch {}
    return ''
}

export function LinkNode(props) {
    const { id, data = {}, selected = false } = props
    const [isEditing, setIsEditing] = useState(!data.url && data.isEdit !== false)
    const [localUrl, setLocalUrl] = useState(data.url || '')

    useEffect(() => {
        setLocalUrl(data.url || '')
    }, [data.url])

    const isZh = () => {
        const lang = document.documentElement.getAttribute('lang')
        return lang && lang.startsWith('zh')
    }
    const zh = isZh()

    const handleSave = () => {
        setIsEditing(false)
        if (localUrl !== data.url) {
            data.onUpdateContent?.(id, { url: localUrl })
        }
    }

    const safeHref = sanitizeExternalUrl(localUrl)

    return (
        <FlowNode
            id={id}
            type="link"
            data={data}
            selected={selected}
            minWidth={NODE_DIMENSIONS.link.minWidth}
            minHeight={NODE_DIMENSIONS.link.minHeight}
            icon="🔗"
            title={zh ? '外部連結' : 'Web Link'}
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
                            type="url"
                            autoFocus
                            className="canvas-edge-input"
                            style={{ width: '100%', boxSizing: 'border-box' }}
                            value={localUrl}
                            onChange={(e) => setLocalUrl(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') handleSave()
                                if (e.key === 'Escape') setIsEditing(false)
                            }}
                            placeholder="https://"
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
                            {localUrl || (zh ? '未設定網址' : 'No URL set')}
                        </div>
                        {safeHref && (
                            <a
                                href={safeHref}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="canvas-wiki-link-btn nodrag"
                            >
                                <span>🔗</span>
                                <span>{zh ? '開啟連結 ↗' : 'Open Link ↗'}</span>
                            </a>
                        )}
                    </>
                )}
            </div>
        </FlowNode>
    )
}

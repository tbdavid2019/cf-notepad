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
    const [metadata, setMetadata] = useState(data.david888?.ogPreview || null)

    useEffect(() => {
        setLocalUrl(data.url || '')
    }, [data.url])

    useEffect(() => {
        setMetadata(data.david888?.ogPreview || null)
    }, [data.david888?.ogPreview])

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

    useEffect(() => {
        if (!safeHref || isEditing || data.david888?.ogPreview) return undefined
        const controller = new AbortController()
        fetch('/api/url-meta', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ url: safeHref }),
            signal: controller.signal,
        })
            .then(response => response.ok ? response.json() : null)
            .then(payload => {
                if (payload?.err !== 0 || !payload.data) return
                setMetadata(payload.data)
                data.onUpdateContent?.(id, {
                    david888: {
                        ...(data.david888 || {}),
                        ogPreview: payload.data,
                    },
                })
            })
            .catch(() => {})
        return () => controller.abort()
    }, [safeHref, isEditing, data.david888, data.onUpdateContent, id])

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
                    <div className="canvas-wiki-form nodrag">
                        <input
                            type="url"
                            autoFocus
                            className="canvas-edge-input"
                            style={{ width: '100%', boxSizing: 'border-box' }}
                            value={localUrl}
                            onChange={(e) => setLocalUrl(e.target.value)}
                            onBlur={handleSave}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') handleSave()
                                if (e.key === 'Escape') setIsEditing(false)
                            }}
                            placeholder="https://"
                        />
                    </div>
                ) : (
                    <div className="canvas-wiki-preview">
                        <div className="canvas-wiki-title">
                            {metadata?.title || (safeHref ? new URL(safeHref).hostname : (localUrl || (zh ? '未設定網址' : 'No URL set')))}
                        </div>
                        {metadata?.siteName && <div className="canvas-wiki-status">{metadata.siteName}</div>}
                        {(metadata?.description || safeHref) && (
                            <p className="canvas-wiki-excerpt">{metadata?.description || new URL(safeHref).pathname}</p>
                        )}
                        {metadata?.image && (
                            <img className="canvas-link-preview-image" src={metadata.image} alt="" loading="lazy" referrerPolicy="no-referrer" />
                        )}
                        {safeHref && (
                            <a
                                href={safeHref}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="canvas-wiki-link-btn nodrag"
                            >
                                <span>{zh ? '開啟連結 ↗' : 'Open Link ↗'}</span>
                            </a>
                        )}
                    </div>
                )}
            </div>
        </FlowNode>
    )
}

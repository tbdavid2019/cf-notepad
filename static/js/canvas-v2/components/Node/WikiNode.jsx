import React, { useState, useEffect } from 'react'
import { FlowNode } from './FlowNode.jsx'
import { NODE_DIMENSIONS } from '../../model/canvasTypes.mjs'

function resolveWikiUrl(val) {
    const raw = String(val || '').trim()
    if (!raw || raw.startsWith('javascript:')) {
        return ''
    }

    try {
        const origin = typeof window !== 'undefined' ? window.location.origin : 'https://wiki.david888.com'
        const parsed = raw.startsWith('//')
            ? new URL(`https:${raw}`)
            : raw.includes('://')
                ? new URL(raw)
                : new URL('/' + raw.replace(/^\/+/, ''), origin)
        if (!['http:', 'https:'].includes(parsed.protocol)) return ''
        if (typeof window !== 'undefined' && parsed.host !== window.location.host) return ''
        return parsed.href
    } catch {
        return ''
    }
}

function extractWikiPreview(value) {
    const raw = String(value || '').trim()
    if (!raw) return { title: '', excerpt: '' }

    try {
        const parsed = JSON.parse(raw)
        if (Array.isArray(parsed?.nodes)) {
            const texts = parsed.nodes
                .map(node => String(node?.text || '').trim())
                .filter(Boolean)
            return {
                title: texts[0]?.replace(/^#+\s*/, '').split('\n')[0] || '',
                excerpt: texts.slice(1).join(' · ').replace(/\s+/g, ' ').slice(0, 180),
            }
        }
    } catch {}

    const lines = raw.split(/\r?\n/).map(line => line.trim()).filter(Boolean)
    const titleLine = lines.find(line => /^#\s+/.test(line))
    const title = titleLine ? titleLine.replace(/^#+\s*/, '') : ''
    const excerpt = lines
        .filter(line => !/^#/.test(line) && !/^```/.test(line) && !/^[-*>]/.test(line))
        .join(' ')
        .replace(/[*_`]/g, '')
        .replace(/\s+/g, ' ')
        .slice(0, 180)
    return { title, excerpt }
}

export function WikiNode(props) {
    const { id, data = {}, selected = false } = props
    const [isEditing, setIsEditing] = useState(!data.file && data.isEdit !== false)
    const [localFile, setLocalFile] = useState(data.file || '')
    const [preview, setPreview] = useState({ status: 'idle', title: '', excerpt: '' })

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

    const noteHref = resolveWikiUrl(localFile)
    const asset = data.david888?.asset
    const isAsset = Boolean(asset?.kind && localFile)

    useEffect(() => {
        if (!noteHref || isEditing) {
            setPreview({ status: 'idle', title: '', excerpt: '' })
            return undefined
        }

        const controller = new AbortController()
        setPreview(current => ({ ...current, status: 'loading' }))
        fetch(noteHref, {
            headers: { Accept: 'text/markdown' },
            signal: controller.signal,
        })
            .then(response => {
                if (!response.ok) throw new Error(`Wiki note request failed: ${response.status}`)
                return response.text()
            })
            .then(content => setPreview({ status: 'ready', ...extractWikiPreview(content) }))
            .catch(error => {
                if (error.name !== 'AbortError') setPreview({ status: 'error', title: '', excerpt: '' })
            })

        return () => controller.abort()
    }, [noteHref, isEditing])

    return (
        <FlowNode
            id={id}
            type="file"
            data={data}
            selected={selected}
            minWidth={NODE_DIMENSIONS.file.minWidth}
            minHeight={NODE_DIMENSIONS.file.minHeight}
            icon="📖"
            title={isAsset ? (asset.name || (zh ? '檔案資產' : 'Canvas Asset')) : (zh ? 'Wiki 筆記引用' : 'Wiki Note Reference')}
            isEdit={data.isEdit !== false}
            isEditing={isEditing}
            onToggleEdit={() => setIsEditing(!isEditing)}
            onDuplicate={data.onDuplicate}
            onDelete={data.onDelete}
            onChangeColor={data.onChangeColor}
        >
            <div className={`canvas-wiki-card ${isAsset ? 'canvas-asset-card' : ''}`}>
                {isAsset && !isEditing ? (
                    <div className="canvas-wiki-preview">
                        {asset.kind === 'image' && <img className="canvas-asset-preview-image" src={localFile} alt={asset.name || ''} loading="lazy" />}
                        {asset.kind === 'audio' && <audio className="canvas-asset-player" controls src={localFile} />}
                        {asset.kind === 'video' && <video className="canvas-asset-player" controls src={localFile} />}
                        <div className="canvas-wiki-title">{asset.name || (zh ? '檔案資產' : 'Canvas Asset')}</div>
                        <a href={localFile} target="_blank" rel="noopener noreferrer" className="canvas-wiki-link-btn nodrag">
                            {zh ? '開啟資產 ↗' : 'Open asset ↗'}
                        </a>
                    </div>
                ) : isEditing ? (
                    <div className="canvas-wiki-form nodrag">
                        <input
                            type="text"
                            autoFocus
                            className="canvas-edge-input"
                            style={{ width: '100%', boxSizing: 'border-box' }}
                            value={localFile}
                            onChange={(e) => setLocalFile(e.target.value)}
                            onBlur={handleSave}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') handleSave()
                                if (e.key === 'Escape') setIsEditing(false)
                            }}
                            placeholder={zh ? '輸入文章路徑 (例如: my-note)...' : 'Enter note path (e.g. my-note)...'}
                        />
                    </div>
                ) : (
                    <div className="canvas-wiki-preview">
                        <div className="canvas-wiki-title">
                            {preview.title || localFile || (zh ? '未設定筆記路徑' : 'No note path set')}
                        </div>
                        {preview.status === 'loading' && <div className="canvas-wiki-status">{zh ? '載入筆記中...' : 'Loading note...'}</div>}
                        {preview.excerpt && <p className="canvas-wiki-excerpt">{preview.excerpt}</p>}
                        {noteHref && (
                            <a
                                href={noteHref}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="canvas-wiki-link-btn nodrag"
                            >
                                <span>{zh ? '開啟筆記 ↗' : 'Open Note ↗'}</span>
                            </a>
                        )}
                    </div>
                )}
            </div>
        </FlowNode>
    )
}

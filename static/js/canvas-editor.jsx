import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { createRoot } from 'react-dom/client'
import {
    ReactFlow,
    Background,
    Controls,
    MiniMap,
    Panel,
    useNodesState,
    useEdgesState,
    addEdge,
    Handle,
    Position,
    NodeResizer,
    NodeToolbar,
    EdgeLabelRenderer,
    BaseEdge,
    getSmoothStepPath,
    MarkerType,
    ConnectionMode,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import { parseCanvasDocument, validateCanvasDocument } from '../../src/canvas_document.mjs'

const root = document.querySelector('#canvas-editor')
const source = document.querySelector('#contents')
if (!root || !source) throw new Error('Canvas editor requires #canvas-editor and #contents')

const isEditableMode = root.getAttribute('data-editable') === 'true' || window.APP_STATE?.isEdit === true
const DEFAULT_EDGE_COLOR = '#2563a6'
const EDGE_STYLE = { stroke: DEFAULT_EDGE_COLOR, strokeWidth: 2.5 }

// Obsidian Canvas preset color map (presets 1-6) and custom hex colors
export const CANVAS_COLOR_PRESETS = [
    { id: 'none', label: '預設 / Default', value: '', preview: 'var(--canvas-card-bg, #ffffff)' },
    { id: '1', label: '紅色 / Red', value: '#ef4444', preview: '#ef4444' },
    { id: '2', label: '橙色 / Orange', value: '#f97316', preview: '#f97316' },
    { id: '3', label: '黃色 / Yellow', value: '#eab308', preview: '#eab308' },
    { id: '4', label: '綠色 / Green', value: '#22c55e', preview: '#22c55e' },
    { id: '5', label: '藍色 / Blue', value: '#3b82f6', preview: '#3b82f6' },
    { id: '6', label: '紫色 / Purple', value: '#8b5cf6', preview: '#8b5cf6' },
]

export const STICKY_PALETTE = [
    { id: 'yellow', value: '#fff9c4', label: '鵝黃 / Yellow' },
    { id: 'green', value: '#dcedc8', label: '薄荷綠 / Green' },
    { id: 'blue', value: '#bbdefb', label: '天空藍 / Blue' },
    { id: 'pink', value: '#f8bbd0', label: '櫻花粉 / Pink' },
    { id: 'purple', value: '#e1bee7', label: '淺紫 / Purple' },
    { id: 'orange', value: '#ffe0b2', label: '蜜橙 / Orange' },
]

export const EDGE_COLORS = [
    { id: 'default', value: '#2563a6', label: '經典藍 / Blue' },
    { id: 'gray', value: '#64748b', label: '石板灰 / Slate' },
    { id: 'green', value: '#10b981', label: '翡翠綠 / Green' },
    { id: 'yellow', value: '#f59e0b', label: '琥珀黃 / Amber' },
    { id: 'red', value: '#ef4444', label: '玫瑰紅 / Red' },
    { id: 'purple', value: '#8b5cf6', label: '神秘紫 / Purple' },
]

export function resolveCanvasColor(colorVal) {
    if (!colorVal) return ''
    if (colorVal === '1') return '#ef4444'
    if (colorVal === '2') return '#f97316'
    if (colorVal === '3') return '#eab308'
    if (colorVal === '4') return '#22c55e'
    if (colorVal === '5') return '#3b82f6'
    if (colorVal === '6') return '#8b5cf6'
    return String(colorVal)
}

function safeExternalUrl(value) {
    try {
        const url = new URL(value)
        return ['http:', 'https:'].includes(url.protocol) ? url.href : ''
    } catch {
        return ''
    }
}

export function safeWikiNotePath(value) {
    const path = String(value || '').trim()
    if (!path || path.startsWith('//') || path.includes('://') || path.startsWith('javascript:')) return ''
    return '/' + path.replace(/^\/+/, '')
}

const resolveCanvasTheme = () => {
    const selectedTheme = document.documentElement.getAttribute('data-ui-theme')
    if (selectedTheme === 'dark') return 'dark'
    if (selectedTheme === 'light') return 'light'
    return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

function useCanvasTheme() {
    const [theme, setTheme] = useState(resolveCanvasTheme)
    useEffect(() => {
        const syncTheme = () => setTheme(resolveCanvasTheme())
        const observer = new MutationObserver(syncTheme)
        const mediaQuery = window.matchMedia?.('(prefers-color-scheme: dark)')
        observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-ui-theme'] })
        mediaQuery?.addEventListener?.('change', syncTheme)
        window.addEventListener('cf-notepad-ui-theme-change', syncTheme)
        return () => {
            observer.disconnect()
            mediaQuery?.removeEventListener?.('change', syncTheme)
            window.removeEventListener('cf-notepad-ui-theme-change', syncTheme)
        }
    }, [])
    return theme
}

const resolveCanvasLang = () => {
    const htmlLang = document.documentElement.getAttribute('lang')
    if (htmlLang && htmlLang.startsWith('zh')) return 'zh-TW'
    if (typeof window !== 'undefined' && window.APP_STATE?.lang) return window.APP_STATE.lang
    return 'en-US'
}

// Markdown renderer helper inside card
function MarkdownPreview({ text, isDark }) {
    const containerRef = useRef(null)

    useEffect(() => {
        const el = containerRef.current
        if (!el) return
        if (typeof window.renderMarkdown === 'function') {
            window.renderMarkdown(el, text || '')
        } else if (window.marked && typeof window.marked.parse === 'function') {
            el.innerHTML = window.marked.parse(text || '')
        } else {
            el.textContent = text || ''
        }
    }, [text])

    return <div ref={containerRef} className="canvas-card-markdown-preview markdown-body" />
}

function CardHandles({ isEdit }) {
    return <>
        <Handle type="source" position={Position.Top} id="top" isConnectableStart={isEdit} isConnectableEnd={isEdit} />
        <Handle type="source" position={Position.Right} id="right" isConnectableStart={isEdit} isConnectableEnd={isEdit} />
        <Handle type="source" position={Position.Bottom} id="bottom" isConnectableStart={isEdit} isConnectableEnd={isEdit} />
        <Handle type="source" position={Position.Left} id="left" isConnectableStart={isEdit} isConnectableEnd={isEdit} />
    </>
}

// Interactive Custom Edge with EdgeToolbar and EdgeLabelRenderer
export function CanvasCustomEdge({
    id,
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
    style = {},
    markerStart,
    markerEnd,
    label,
    selected,
    data = {},
}) {
    const isEdit = isEditableMode
    const isZh = resolveCanvasLang() === 'zh-TW'
    const [isEditingLabel, setIsEditingLabel] = useState(false)
    const [labelText, setLabelText] = useState(label || '')

    useEffect(() => {
        setLabelText(label || '')
    }, [label])

    const [edgePath, labelX, labelY] = getSmoothStepPath({
        sourceX,
        sourceY,
        sourcePosition,
        targetX,
        targetY,
        targetPosition,
        borderRadius: 12,
    })

    const fromEnd = data.fromEnd || 'none'
    const toEnd = data.toEnd !== undefined ? data.toEnd : 'arrow'
    const lineStyle = data.lineStyle || 'solid'
    const strokeWidth = Number(data.strokeWidth) || 2.5
    const strokeColor = data.color || style.stroke || DEFAULT_EDGE_COLOR

    let strokeDasharray = undefined
    if (lineStyle === 'dashed') strokeDasharray = '6 4'
    else if (lineStyle === 'dotted') strokeDasharray = '2 3'

    const computedStyle = {
        ...style,
        stroke: strokeColor,
        strokeWidth,
        strokeDasharray,
    }

    const computedMarkerStart = fromEnd === 'arrow'
        ? { type: MarkerType.ArrowClosed, color: strokeColor }
        : undefined
    const computedMarkerEnd = toEnd === 'arrow'
        ? { type: MarkerType.ArrowClosed, color: strokeColor }
        : undefined

    const handleSaveLabel = () => {
        setIsEditingLabel(false)
        data.onChangeEdgeLabel?.(id, labelText.trim())
    }

    const handleToggleArrows = () => {
        let nextFrom = 'none'
        let nextTo = 'none'
        if (fromEnd === 'none' && toEnd === 'arrow') {
            nextFrom = 'arrow'
            nextTo = 'none'
        } else if (fromEnd === 'arrow' && toEnd === 'none') {
            nextFrom = 'arrow'
            nextTo = 'arrow'
        } else if (fromEnd === 'arrow' && toEnd === 'arrow') {
            nextFrom = 'none'
            nextTo = 'none'
        } else {
            nextFrom = 'none'
            nextTo = 'arrow'
        }
        data.onChangeEdgeArrows?.(id, nextFrom, nextTo)
    }

    const handleToggleLineStyle = () => {
        const next = lineStyle === 'solid' ? 'dashed' : (lineStyle === 'dashed' ? 'dotted' : 'solid')
        data.onChangeEdgeStyle?.(id, { lineStyle: next })
    }

    const handleToggleStrokeWidth = () => {
        const next = strokeWidth === 1.5 ? 2.5 : (strokeWidth === 2.5 ? 4 : 1.5)
        data.onChangeEdgeStyle?.(id, { strokeWidth: next })
    }

    const arrowIcon = useMemo(() => {
        if (fromEnd === 'arrow' && toEnd === 'arrow') return '◄─►'
        if (fromEnd === 'arrow') return '◄──'
        if (toEnd === 'arrow') return '──►'
        return '──'
    }, [fromEnd, toEnd])

    const lineStyleIcon = useMemo(() => {
        if (lineStyle === 'dashed') return isZh ? '╌ 虛線' : '╌ Dash'
        if (lineStyle === 'dotted') return isZh ? '⋯ 點線' : '⋯ Dot'
        return isZh ? '─ 實線' : '─ Solid'
    }, [lineStyle, isZh])

    return (
        <>
            <BaseEdge
                id={id}
                path={edgePath}
                markerStart={computedMarkerStart}
                markerEnd={computedMarkerEnd}
                style={computedStyle}
                className="canvas-edge-style"
                interactionWidth={24}
            />
            <EdgeLabelRenderer>
                <div
                    style={{
                        position: 'absolute',
                        transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
                        pointerEvents: 'all',
                    }}
                    className="nodrag nopan canvas-edge-interactive-container"
                >
                    {isEdit && selected ? (
                        <div className="canvas-edge-toolbar">
                            {isEditingLabel ? (
                                <div className="canvas-edge-label-editor">
                                    <input
                                        type="text"
                                        autoFocus
                                        className="canvas-edge-label-input"
                                        value={labelText}
                                        onChange={e => setLabelText(e.target.value)}
                                        onKeyDown={e => {
                                            if (e.key === 'Enter') handleSaveLabel()
                                            if (e.key === 'Escape') setIsEditingLabel(false)
                                        }}
                                        placeholder={isZh ? '輸入關係文字...' : 'Edge label...'}
                                    />
                                    <button type="button" className="canvas-edge-tb-btn" onClick={handleSaveLabel} title={isZh ? '確定' : 'Done'}>✓</button>
                                    <button type="button" className="canvas-edge-tb-btn" onClick={() => { setLabelText(''); data.onChangeEdgeLabel?.(id, '') }} title={isZh ? '清除' : 'Clear'}>✕</button>
                                </div>
                            ) : (
                                <>
                                    <button
                                        type="button"
                                        className="canvas-edge-tb-btn canvas-edge-label-btn"
                                        onClick={() => setIsEditingLabel(true)}
                                        title={isZh ? '編輯關係文字' : 'Edit Label'}
                                    >
                                        🏷️ {labelText || (isZh ? '+ 標籤' : '+ Label')}
                                    </button>
                                    <span className="canvas-tb-divider" />
                                    <button
                                        type="button"
                                        className="canvas-edge-tb-btn"
                                        onClick={handleToggleArrows}
                                        title={isZh ? `切換箭頭方向 (${arrowIcon})` : `Arrow Direction (${arrowIcon})`}
                                    >
                                        {arrowIcon}
                                    </button>
                                    <button
                                        type="button"
                                        className="canvas-edge-tb-btn"
                                        onClick={handleToggleLineStyle}
                                        title={isZh ? '切換線條樣式 (實線/虛線/點線)' : 'Line Style (Solid/Dashed/Dotted)'}
                                    >
                                        {lineStyleIcon}
                                    </button>
                                    <button
                                        type="button"
                                        className="canvas-edge-tb-btn"
                                        onClick={handleToggleStrokeWidth}
                                        title={isZh ? `切換粗細 (${strokeWidth}px)` : `Width (${strokeWidth}px)`}
                                    >
                                        {strokeWidth}px
                                    </button>
                                    <span className="canvas-tb-divider" />
                                    <div className="canvas-toolbar-colors">
                                        {EDGE_COLORS.map(c => (
                                            <button
                                                key={c.id}
                                                type="button"
                                                className={`canvas-color-dot ${strokeColor === c.value ? 'is-active' : ''}`}
                                                style={{ backgroundColor: c.value }}
                                                title={c.label}
                                                onClick={() => data.onChangeEdgeStyle?.(id, { color: c.value })}
                                            />
                                        ))}
                                    </div>
                                    <span className="canvas-tb-divider" />
                                    <button
                                        type="button"
                                        className="canvas-edge-tb-btn canvas-btn-delete"
                                        onClick={() => data.onDeleteEdge?.(id)}
                                        title={isZh ? '刪除連線' : 'Delete Edge'}
                                    >
                                        ✕
                                    </button>
                                </>
                            )}
                        </div>
                    ) : label ? (
                        <div
                            className="canvas-edge-label-badge"
                            onClick={() => {
                                if (isEdit) data.onSelectEdge?.(id)
                            }}
                            title={isEdit ? (isZh ? '點擊編輯連線樣式與標籤' : 'Click to edit') : ''}
                        >
                            {label}
                        </div>
                    ) : null}
                </div>
            </EdgeLabelRenderer>
        </>
    )
}

// Custom Markdown Card Node with NodeToolbar
function TextCardNode({ id, data, selected }) {
    const isEdit = isEditableMode
    const [isEditing, setIsEditing] = useState(false)
    const [text, setText] = useState(data.text || '')
    const theme = useCanvasTheme()
    const isDark = theme === 'dark'
    const isZh = resolveCanvasLang() === 'zh-TW'
    const color = data.color || ''
    const resolvedColor = resolveCanvasColor(color)

    const handleBlur = () => {
        setIsEditing(false)
        if (data.onChangeText && text !== data.text) {
            data.onChangeText(id, text)
        }
    }

    const handleKeyDown = e => {
        if (e.key === 'Escape' || (e.key === 'Enter' && (e.metaKey || e.ctrlKey))) {
            e.preventDefault()
            handleBlur()
        }
    }

    const cardStyle = useMemo(() => {
        const base = { width: '100%', height: '100%' }
        if (!resolvedColor) return base
        return {
            ...base,
            borderColor: resolvedColor,
            boxShadow: `0 0 0 1.5px ${resolvedColor}66, 0 4px 12px rgba(0,0,0,0.08)`,
        }
    }, [resolvedColor])

    return (
        <div
            className={`canvas-node-card canvas-card-text ${selected ? 'is-selected' : ''} ${isDark ? 'is-dark' : 'is-light'}`}
            style={cardStyle}
        >
            <NodeResizer minWidth={200} minHeight={120} isVisible={selected && isEdit} lineClassName="canvas-resizer-line" handleClassName="canvas-resizer-handle" />

            <CardHandles isEdit={isEdit} />

            {isEdit && (
                <NodeToolbar isVisible={selected && isEdit} position={Position.Top} offset={8}>
                    <div className="canvas-node-toolbar nodrag nopan">
                        <div className="canvas-toolbar-colors">
                            {CANVAS_COLOR_PRESETS.map(c => (
                                <button
                                    key={c.id}
                                    type="button"
                                    className={`canvas-color-dot ${(color === c.value || (!color && c.id === 'none')) ? 'is-active' : ''}`}
                                    style={{ backgroundColor: c.preview }}
                                    title={c.label}
                                    onClick={() => data.onChangeColor?.(id, c.value)}
                                />
                            ))}
                        </div>
                        <span className="canvas-tb-divider" />
                        <button
                            type="button"
                            className="canvas-node-tb-btn"
                            onClick={() => data.onDuplicateNode?.(id)}
                            title={isZh ? '複製卡片' : 'Duplicate Card'}
                        >
                            📋
                        </button>
                        <button
                            type="button"
                            className="canvas-node-tb-btn canvas-btn-delete"
                            onClick={() => data.onDeleteNode?.(id)}
                            title={isZh ? '刪除卡片' : 'Delete Card'}
                        >
                            ✕
                        </button>
                    </div>
                </NodeToolbar>
            )}

            <div className="canvas-card-header" style={resolvedColor ? { borderTop: `3px solid ${resolvedColor}` } : {}}>
                <div className="canvas-card-header-title">
                    <span className="canvas-card-icon">📄</span>
                    <span className="canvas-card-title-text">{data.label || (isZh ? '筆記卡片' : 'Note Card')}</span>
                </div>
                {isEdit && (
                    <div className="canvas-card-header-actions nodrag">
                        <button
                            type="button"
                            className="canvas-btn-icon"
                            onClick={() => setIsEditing(!isEditing)}
                            title={isEditing ? (isZh ? '完成' : 'Done') : (isZh ? '編輯' : 'Edit')}
                        >
                            {isEditing ? '✓' : '✎'}
                        </button>
                        {data.onDeleteNode && (
                            <button
                                type="button"
                                className="canvas-btn-icon canvas-btn-delete"
                                onClick={() => data.onDeleteNode(id)}
                                title={isZh ? '刪除卡片' : 'Delete'}
                            >
                                ✕
                            </button>
                        )}
                    </div>
                )}
            </div>

            <div
                className="canvas-card-body nowheel"
                onDoubleClick={() => {
                    if (isEdit) setIsEditing(true)
                }}
            >
                {isEditing ? (
                    <textarea
                        autoFocus
                        className="canvas-card-textarea nodrag"
                        value={text}
                        onChange={e => setText(e.target.value)}
                        onBlur={handleBlur}
                        onKeyDown={handleKeyDown}
                        placeholder={isZh ? '輸入 Markdown 內文 (按 Esc 或 Cmd+Enter 完成)...' : 'Write markdown (Esc or Cmd+Enter to finish)...'}
                    />
                ) : (
                    <MarkdownPreview text={text} isDark={isDark} />
                )}
            </div>
        </div>
    )
}

// Custom Sticky Note Node with NodeToolbar
function StickyCardNode({ id, data, selected }) {
    const isEdit = isEditableMode
    const [isEditing, setIsEditing] = useState(false)
    const [text, setText] = useState(data.text || '')
    const isZh = resolveCanvasLang() === 'zh-TW'
    const color = data.color || '#fff9c4'

    const handleBlur = () => {
        setIsEditing(false)
        if (data.onChangeText && text !== data.text) {
            data.onChangeText(id, text)
        }
    }

    const handleKeyDown = e => {
        if (e.key === 'Escape' || (e.key === 'Enter' && (e.metaKey || e.ctrlKey))) {
            e.preventDefault()
            handleBlur()
        }
    }

    return (
        <div
            className={`canvas-node-card canvas-card-sticky ${selected ? 'is-selected' : ''}`}
            style={{ width: '100%', height: '100%', backgroundColor: color }}
        >
            <NodeResizer minWidth={160} minHeight={120} isVisible={selected && isEdit} lineClassName="canvas-resizer-line" handleClassName="canvas-resizer-handle" />

            <CardHandles isEdit={isEdit} />

            {isEdit && (
                <NodeToolbar isVisible={selected && isEdit} position={Position.Top} offset={8}>
                    <div className="canvas-node-toolbar nodrag nopan">
                        <div className="canvas-toolbar-colors">
                            {STICKY_PALETTE.map(c => (
                                <button
                                    key={c.id}
                                    type="button"
                                    className={`canvas-color-dot ${color === c.value ? 'is-active' : ''}`}
                                    style={{ backgroundColor: c.value }}
                                    title={c.label}
                                    onClick={() => data.onChangeColor?.(id, c.value)}
                                />
                            ))}
                        </div>
                        <span className="canvas-tb-divider" />
                        <button
                            type="button"
                            className="canvas-node-tb-btn"
                            onClick={() => data.onDuplicateNode?.(id)}
                            title={isZh ? '複製便籤' : 'Duplicate Sticky'}
                        >
                            📋
                        </button>
                        <button
                            type="button"
                            className="canvas-node-tb-btn canvas-btn-delete"
                            onClick={() => data.onDeleteNode?.(id)}
                            title={isZh ? '刪除便籤' : 'Delete Sticky'}
                        >
                            ✕
                        </button>
                    </div>
                </NodeToolbar>
            )}

            <div className="canvas-card-header canvas-sticky-header">
                <span className="canvas-card-icon">📌</span>
                {isEdit && (
                    <div className="canvas-card-header-actions nodrag">
                        <button
                            type="button"
                            className="canvas-btn-icon"
                            onClick={() => setIsEditing(!isEditing)}
                            title={isEditing ? (isZh ? '完成' : 'Done') : (isZh ? '編輯' : 'Edit')}
                        >
                            {isEditing ? '✓' : '✎'}
                        </button>
                        {data.onDeleteNode && (
                            <button
                                type="button"
                                className="canvas-btn-icon canvas-btn-delete"
                                onClick={() => data.onDeleteNode(id)}
                                title={isZh ? '刪除便籤' : 'Delete'}
                            >
                                ✕
                            </button>
                        )}
                    </div>
                )}
            </div>

            <div
                className="canvas-card-body canvas-sticky-body nowheel"
                onDoubleClick={() => {
                    if (isEdit) setIsEditing(true)
                }}
            >
                {isEditing ? (
                    <textarea
                        autoFocus
                        className="canvas-card-textarea nodrag canvas-sticky-textarea"
                        value={text}
                        onChange={e => setText(e.target.value)}
                        onBlur={handleBlur}
                        onKeyDown={handleKeyDown}
                        placeholder={isZh ? '輸入便籤內容...' : 'Write sticky note...'}
                    />
                ) : (
                    <MarkdownPreview text={text} isDark={false} />
                )}
            </div>
        </div>
    )
}

// Custom Wiki Link Node with NodeToolbar
function WikiLinkNode({ id, data, selected }) {
    const isEdit = isEditableMode
    const isZh = resolveCanvasLang() === 'zh-TW'
    const theme = useCanvasTheme()
    const isDark = theme === 'dark'
    const [file, setFile] = useState(data.file || '')
    const [isEditing, setIsEditing] = useState(!data.file && isEdit)
    const color = data.color || ''
    const resolvedColor = resolveCanvasColor(color)

    const handleSave = () => {
        setIsEditing(false)
        if (data.onChangeFile && file !== data.file) {
            data.onChangeFile(id, file)
        }
    }

    const noteHref = safeWikiNotePath(file)

    return (
        <div
            className={`canvas-node-card canvas-card-wiki ${selected ? 'is-selected' : ''} ${isDark ? 'is-dark' : 'is-light'}`}
            style={{
                width: '100%',
                height: '100%',
                ...(resolvedColor ? { borderColor: resolvedColor, boxShadow: `0 0 0 1.5px ${resolvedColor}66` } : {}),
            }}
        >
            <NodeResizer minWidth={220} minHeight={100} isVisible={selected && isEdit} lineClassName="canvas-resizer-line" handleClassName="canvas-resizer-handle" />

            <CardHandles isEdit={isEdit} />

            {isEdit && (
                <NodeToolbar isVisible={selected && isEdit} position={Position.Top} offset={8}>
                    <div className="canvas-node-toolbar nodrag nopan">
                        <div className="canvas-toolbar-colors">
                            {CANVAS_COLOR_PRESETS.map(c => (
                                <button
                                    key={c.id}
                                    type="button"
                                    className={`canvas-color-dot ${(color === c.value || (!color && c.id === 'none')) ? 'is-active' : ''}`}
                                    style={{ backgroundColor: c.preview }}
                                    title={c.label}
                                    onClick={() => data.onChangeColor?.(id, c.value)}
                                />
                            ))}
                        </div>
                        <span className="canvas-tb-divider" />
                        <button
                            type="button"
                            className="canvas-node-tb-btn"
                            onClick={() => data.onDuplicateNode?.(id)}
                            title={isZh ? '複製引用卡片' : 'Duplicate'}
                        >
                            📋
                        </button>
                        <button
                            type="button"
                            className="canvas-node-tb-btn canvas-btn-delete"
                            onClick={() => data.onDeleteNode?.(id)}
                            title={isZh ? '刪除卡片' : 'Delete'}
                        >
                            ✕
                        </button>
                    </div>
                </NodeToolbar>
            )}

            <div className="canvas-card-header" style={resolvedColor ? { borderTop: `3px solid ${resolvedColor}` } : {}}>
                <div className="canvas-card-header-title">
                    <span className="canvas-card-icon">🔗</span>
                    <span className="canvas-card-title-text">{isZh ? 'Wiki 筆記引用' : 'Wiki Note Reference'}</span>
                </div>
                {isEdit && data.onDeleteNode && (
                    <div className="canvas-card-header-actions nodrag">
                        <button
                            type="button"
                            className="canvas-btn-icon canvas-btn-delete"
                            onClick={() => data.onDeleteNode(id)}
                            title={isZh ? '刪除' : 'Delete'}
                        >
                            ✕
                        </button>
                    </div>
                )}
            </div>

            <div className="canvas-card-body canvas-wiki-body">
                {isEditing ? (
                    <div className="canvas-wiki-edit-form nodrag">
                        <input
                            type="text"
                            className="canvas-wiki-input"
                            value={file}
                            onChange={e => setFile(e.target.value)}
                            placeholder={isZh ? '輸入文章路徑 (例如 my-note)...' : 'Enter note path (e.g. my-note)...'}
                        />
                        <button type="button" className="canvas-btn-primary" onClick={handleSave}>
                            {isZh ? '儲存' : 'Save'}
                        </button>
                    </div>
                ) : (
                    <div className="canvas-wiki-content">
                        <div className="canvas-wiki-title">📖 {file || '未設定筆記路徑'}</div>
                        <div className="canvas-wiki-actions nodrag">
                            {noteHref && <a href={noteHref} target="_blank" rel="noopener noreferrer" className="canvas-wiki-link">
                                {isZh ? '開啟筆記 ↗' : 'Open Note ↗'}
                            </a>}
                            {isEdit && (
                                <button type="button" className="canvas-btn-subtle" onClick={() => setIsEditing(true)}>
                                    {isZh ? '修改路徑' : 'Edit'}
                                </button>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

function ExternalLinkNode({ id, data, selected }) {
    const isEdit = isEditableMode
    const isZh = resolveCanvasLang() === 'zh-TW'
    const [url, setUrl] = useState(data.url || '')
    const [isEditing, setIsEditing] = useState(!data.url && isEdit)

    const save = () => {
        setIsEditing(false)
        if (data.onChangeUrl && url !== data.url) data.onChangeUrl(id, url)
    }

    const safeUrl = safeExternalUrl(url)
    return <div className={`canvas-node-card canvas-card-link ${selected ? 'is-selected' : ''}`} style={{ width: '100%', height: '100%' }}>
        <NodeResizer minWidth={220} minHeight={100} isVisible={selected && isEdit} lineClassName="canvas-resizer-line" handleClassName="canvas-resizer-handle" />
        <CardHandles isEdit={isEdit} />
        <div className="canvas-card-header"><span className="canvas-card-icon">🔗</span><span className="canvas-card-title-text">{isZh ? '外部連結' : 'Web Link'}</span></div>
        <div className="canvas-card-body canvas-wiki-body">
            {isEditing ? <div className="canvas-wiki-edit-form nodrag">
                <input type="url" className="canvas-wiki-input" value={url} onChange={event => setUrl(event.target.value)} placeholder="https://" />
                <button type="button" className="canvas-btn-primary" onClick={save}>{isZh ? '儲存' : 'Save'}</button>
            </div> : <div className="canvas-wiki-content">
                <div className="canvas-wiki-title">{url || (isZh ? '未設定網址' : 'No URL set')}</div>
                {(safeUrl || isEdit) && <div className="canvas-wiki-actions nodrag">{safeUrl && <a href={safeUrl} target="_blank" rel="noopener noreferrer" className="canvas-wiki-link">{isZh ? '開啟連結 ↗' : 'Open Link ↗'}</a>}{isEdit && <button type="button" className="canvas-btn-subtle" onClick={() => setIsEditing(true)}>{isZh ? '修改' : 'Edit'}</button>}</div>}
            </div>}
        </div>
    </div>
}

function GroupNode({ data, selected }) {
    const isEdit = isEditableMode
    return <div className={`canvas-group-node ${selected ? 'is-selected' : ''}`} style={{ width: '100%', height: '100%' }}>
        <NodeResizer minWidth={120} minHeight={80} isVisible={selected && isEdit} lineClassName="canvas-resizer-line" handleClassName="canvas-resizer-handle" />
        <CardHandles isEdit={isEdit} />
        {data.label && <span className="canvas-group-label">{data.label}</span>}
    </div>
}

const nodeTypes = {
    text: TextCardNode,
    sticky: StickyCardNode,
    file: WikiLinkNode,
    link: ExternalLinkNode,
    group: GroupNode,
}

const edgeTypes = {
    canvasEdge: CanvasCustomEdge,
    smoothstep: CanvasCustomEdge,
    default: CanvasCustomEdge,
}

// Convert JSON Canvas to React Flow elements
function jsonCanvasToReactFlow(canvasData, handlers, edgeHandlers) {
    const nodes = (canvasData.nodes || []).map(node => {
        const type = node.type === 'sticky' || node.david888?.cardType === 'sticky'
            ? 'sticky'
            : ['file', 'link', 'group'].includes(node.type) ? node.type : 'text'
        return {
            id: String(node.id),
            type,
            position: { x: Number(node.x) || 0, y: Number(node.y) || 0 },
            style: {
                width: Number(node.width) || (type === 'sticky' ? 240 : 320),
                height: Number(node.height) || (type === 'sticky' ? 180 : 200),
            },
            data: {
                text: node.text || '',
                file: node.file || '',
                label: node.label || '',
                url: node.url || '',
                subpath: node.subpath || '',
                background: node.background || '',
                backgroundStyle: node.backgroundStyle || '',
                color: node.color || (type === 'sticky' ? '#fff9c4' : ''),
                onChangeText: handlers.onChangeText,
                onChangeFile: handlers.onChangeFile,
                onChangeUrl: handlers.onChangeUrl,
                onDeleteNode: handlers.onDeleteNode,
                onChangeColor: handlers.onChangeColor,
                onDuplicateNode: handlers.onDuplicateNode,
            },
        }
    })

    const edges = (canvasData.edges || []).map(edge => {
        const fromEnd = edge.fromEnd || 'none'
        const toEnd = edge.toEnd !== undefined ? edge.toEnd : 'arrow'
        const strokeColor = resolveCanvasColor(edge.color) || DEFAULT_EDGE_COLOR
        const lineStyle = edge.david888?.lineStyle || 'solid'
        const strokeWidth = Number(edge.david888?.strokeWidth) || 2.5

        let strokeDasharray = undefined
        if (lineStyle === 'dashed') strokeDasharray = '6 4'
        else if (lineStyle === 'dotted') strokeDasharray = '2 3'

        return {
            id: String(edge.id),
            source: String(edge.fromNode),
            target: String(edge.toNode),
            sourceHandle: edge.fromSide || 'right',
            targetHandle: edge.toSide || 'left',
            label: edge.label || '',
            type: 'canvasEdge',
            markerStart: fromEnd === 'arrow' ? { type: MarkerType.ArrowClosed, color: strokeColor } : undefined,
            markerEnd: toEnd === 'arrow' ? { type: MarkerType.ArrowClosed, color: strokeColor } : undefined,
            className: 'canvas-edge-style',
            style: { stroke: strokeColor, strokeWidth, strokeDasharray },
            data: {
                fromEnd,
                toEnd,
                color: edge.color || '',
                lineStyle,
                strokeWidth,
                label: edge.label || '',
                onChangeEdgeLabel: edgeHandlers?.onChangeEdgeLabel,
                onChangeEdgeArrows: edgeHandlers?.onChangeEdgeArrows,
                onChangeEdgeStyle: edgeHandlers?.onChangeEdgeStyle,
                onDeleteEdge: edgeHandlers?.onDeleteEdge,
                onSelectEdge: edgeHandlers?.onSelectEdge,
            },
        }
    })

    return { nodes, edges }
}

// Convert React Flow elements to JSON Canvas specification
function reactFlowToJsonCanvas(nodes, edges) {
    return {
        nodes: nodes.map(n => {
            const base = {
                id: n.id,
                x: Math.round(n.position.x),
                y: Math.round(n.position.y),
                width: Math.round(n.measured?.width || n.style?.width || (n.type === 'sticky' ? 240 : 320)),
                height: Math.round(n.measured?.height || n.style?.height || (n.type === 'sticky' ? 180 : 200)),
                ...(n.data?.color ? { color: n.data.color } : {}),
            }
            if (n.type === 'sticky') return { ...base, type: 'text', text: n.data?.text || '', david888: { cardType: 'sticky' } }
            if (n.type === 'file') return { ...base, type: 'file', file: n.data?.file || '', ...(n.data?.subpath ? { subpath: n.data.subpath } : {}) }
            if (n.type === 'link') return { ...base, type: 'link', url: n.data?.url || '' }
            if (n.type === 'group') return {
                ...base,
                type: 'group',
                ...(n.data?.label ? { label: n.data.label } : {}),
                ...(n.data?.background ? { background: n.data.background } : {}),
                ...(n.data?.backgroundStyle ? { backgroundStyle: n.data.backgroundStyle } : {}),
            }
            return { ...base, type: 'text', text: n.data?.text || '' }
        }),
        edges: edges.map(e => ({
            id: e.id,
            fromNode: e.source,
            toNode: e.target,
            ...(e.sourceHandle ? { fromSide: e.sourceHandle } : {}),
            ...(e.targetHandle ? { toSide: e.targetHandle } : {}),
            ...(e.data?.label || e.label ? { label: e.data?.label || e.label } : {}),
            ...(e.data?.fromEnd && e.data.fromEnd !== 'none' ? { fromEnd: e.data.fromEnd } : {}),
            ...(e.data?.toEnd !== undefined ? { toEnd: e.data.toEnd } : { toEnd: 'arrow' }),
            ...(e.data?.color ? { color: e.data.color } : (e.style?.stroke && e.style.stroke !== DEFAULT_EDGE_COLOR ? { color: e.style.stroke } : {})),
            ...((e.data?.lineStyle && e.data.lineStyle !== 'solid') || (e.data?.strokeWidth && e.data.strokeWidth !== 2.5) ? {
                david888: {
                    ...(e.data?.lineStyle && e.data.lineStyle !== 'solid' ? { lineStyle: e.data.lineStyle } : {}),
                    ...(e.data?.strokeWidth && e.data.strokeWidth !== 2.5 ? { strokeWidth: e.data.strokeWidth } : {}),
                }
            } : {}),
        })),
    }
}

function CanvasEditorApp() {
    const isEdit = isEditableMode
    const theme = useCanvasTheme()
    const isDark = theme === 'dark'
    const isZh = resolveCanvasLang() === 'zh-TW'
    const fileInputRef = useRef(null)

    // Save helper: Writes to #contents and dispatches input event for autosave
    const triggerSave = useCallback((newNodes, newEdges) => {
        if (!isEdit) return
        const canvasDoc = reactFlowToJsonCanvas(newNodes, newEdges)
        source.value = JSON.stringify(canvasDoc, null, 2)
        source.dispatchEvent(new Event('input', { bubbles: true }))
    }, [isEdit])

    // Node handlers
    const onChangeText = useCallback((nodeId, newText) => {
        setNodes(nds => {
            const next = nds.map(n => (n.id === nodeId ? { ...n, data: { ...n.data, text: newText } } : n))
            triggerSave(next, edgesRef.current)
            return next
        })
    }, [triggerSave])

    const onChangeFile = useCallback((nodeId, newFile) => {
        setNodes(nds => {
            const next = nds.map(n => (n.id === nodeId ? { ...n, data: { ...n.data, file: newFile } } : n))
            triggerSave(next, edgesRef.current)
            return next
        })
    }, [triggerSave])

    const onChangeUrl = useCallback((nodeId, newUrl) => {
        setNodes(nds => {
            const next = nds.map(n => (n.id === nodeId ? { ...n, data: { ...n.data, url: newUrl } } : n))
            triggerSave(next, edgesRef.current)
            return next
        })
    }, [triggerSave])

    const onChangeColor = useCallback((nodeId, color) => {
        setNodes(nds => {
            const next = nds.map(n => (n.id === nodeId ? { ...n, data: { ...n.data, color } } : n))
            triggerSave(next, edgesRef.current)
            return next
        })
    }, [triggerSave])

    const onDuplicateNode = useCallback((nodeId) => {
        setNodes(nds => {
            const target = nds.find(n => n.id === nodeId)
            if (!target) return nds
            const newId = (target.type || 'card') + '-' + Date.now().toString(36)
            const cloned = {
                ...structuredClone(target),
                id: newId,
                position: { x: target.position.x + 40, y: target.position.y + 40 },
                selected: true,
                data: {
                    ...structuredClone(target.data),
                },
            }
            const next = nds.map(n => ({ ...n, selected: false })).concat(cloned)
            triggerSave(next, edgesRef.current)
            return next
        })
    }, [triggerSave])

    const onDeleteNode = useCallback((nodeId) => {
        setNodes(nds => {
            const nextNodes = nds.filter(n => n.id !== nodeId)
            setEdges(eds => {
                const nextEdges = eds.filter(e => e.source !== nodeId && e.target !== nodeId)
                triggerSave(nextNodes, nextEdges)
                return nextEdges
            })
            return nextNodes
        })
    }, [triggerSave])

    // Edge handlers
    const onChangeEdgeLabel = useCallback((edgeId, newLabel) => {
        setEdges(eds => {
            const next = eds.map(e => (e.id === edgeId ? { ...e, label: newLabel, data: { ...e.data, label: newLabel } } : e))
            triggerSave(nodesRef.current, next)
            return next
        })
    }, [triggerSave])

    const onChangeEdgeArrows = useCallback((edgeId, fromEnd, toEnd) => {
        setEdges(eds => {
            const next = eds.map(e => {
                if (e.id !== edgeId) return e
                const color = resolveCanvasColor(e.data?.color) || e.style?.stroke || DEFAULT_EDGE_COLOR
                return {
                    ...e,
                    data: { ...e.data, fromEnd, toEnd },
                    markerStart: fromEnd === 'arrow' ? { type: MarkerType.ArrowClosed, color } : undefined,
                    markerEnd: toEnd === 'arrow' ? { type: MarkerType.ArrowClosed, color } : undefined,
                }
            })
            triggerSave(nodesRef.current, next)
            return next
        })
    }, [triggerSave])

    const onChangeEdgeStyle = useCallback((edgeId, styleUpdates) => {
        setEdges(eds => {
            const next = eds.map(e => {
                if (e.id !== edgeId) return e
                const nextData = { ...e.data, ...styleUpdates }
                const color = resolveCanvasColor(nextData.color) || DEFAULT_EDGE_COLOR
                const strokeWidth = Number(nextData.strokeWidth) || 2.5
                let strokeDasharray = undefined
                if (nextData.lineStyle === 'dashed') strokeDasharray = '6 4'
                else if (nextData.lineStyle === 'dotted') strokeDasharray = '2 3'

                return {
                    ...e,
                    data: nextData,
                    style: { ...e.style, stroke: color, strokeWidth, strokeDasharray },
                    markerStart: nextData.fromEnd === 'arrow' ? { type: MarkerType.ArrowClosed, color } : undefined,
                    markerEnd: nextData.toEnd === 'arrow' ? { type: MarkerType.ArrowClosed, color } : undefined,
                }
            })
            triggerSave(nodesRef.current, next)
            return next
        })
    }, [triggerSave])

    const onDeleteEdge = useCallback((edgeId) => {
        setEdges(eds => {
            const next = eds.filter(e => e.id !== edgeId)
            triggerSave(nodesRef.current, next)
            return next
        })
    }, [triggerSave])

    const onSelectEdge = useCallback((edgeId) => {
        setEdges(eds => eds.map(e => ({ ...e, selected: e.id === edgeId })))
    }, [])

    const handlers = useMemo(() => ({
        onChangeText,
        onChangeFile,
        onChangeUrl,
        onDeleteNode,
        onChangeColor,
        onDuplicateNode,
    }), [onChangeText, onChangeFile, onChangeUrl, onDeleteNode, onChangeColor, onDuplicateNode])

    const edgeHandlers = useMemo(() => ({
        onChangeEdgeLabel,
        onChangeEdgeArrows,
        onChangeEdgeStyle,
        onDeleteEdge,
        onSelectEdge,
    }), [onChangeEdgeLabel, onChangeEdgeArrows, onChangeEdgeStyle, onDeleteEdge, onSelectEdge])

    // Parse initial content from #contents
    const initialCanvasDoc = useMemo(() => {
        try {
            const doc = parseCanvasDocument(source.value, { allowFallback: false })
            return validateCanvasDocument(doc)
        } catch {
            return parseCanvasDocument('')
        }
    }, [])

    const initialElements = useMemo(() => jsonCanvasToReactFlow(initialCanvasDoc, handlers, edgeHandlers), [initialCanvasDoc, handlers, edgeHandlers])

    const [nodes, setNodes, onNodesChange] = useNodesState(initialElements.nodes)
    const [edges, setEdges, onEdgesChange] = useEdgesState(initialElements.edges)

    const nodesRef = useRef(nodes)
    const edgesRef = useRef(edges)
    nodesRef.current = nodes
    edgesRef.current = edges

    // Save changes when dragging/connecting
    const handleNodesChange = useCallback(changes => {
        onNodesChange(changes)
        clearTimeout(window.__canvasSaveTimer)
        window.__canvasSaveTimer = setTimeout(() => {
            triggerSave(nodesRef.current, edgesRef.current)
        }, 400)
    }, [onNodesChange, triggerSave])

    const handleEdgesChange = useCallback(changes => {
        onEdgesChange(changes)
        clearTimeout(window.__canvasSaveTimer)
        window.__canvasSaveTimer = setTimeout(() => {
            triggerSave(nodesRef.current, edgesRef.current)
        }, 400)
    }, [onEdgesChange, triggerSave])

    const onConnect = useCallback(params => {
        setEdges(eds => {
            const next = addEdge({
                ...params,
                type: 'canvasEdge',
                markerEnd: { type: MarkerType.ArrowClosed, color: DEFAULT_EDGE_COLOR },
                className: 'canvas-edge-style',
                style: EDGE_STYLE,
                data: {
                    fromEnd: 'none',
                    toEnd: 'arrow',
                    lineStyle: 'solid',
                    strokeWidth: 2.5,
                    color: DEFAULT_EDGE_COLOR,
                    label: '',
                    onChangeEdgeLabel,
                    onChangeEdgeArrows,
                    onChangeEdgeStyle,
                    onDeleteEdge,
                    onSelectEdge,
                },
            }, eds)
            if (next.length === eds.length) {
                window.showToast?.(isZh ? '這兩個連接點已有關係線。' : 'These connection points are already linked.')
            }
            triggerSave(nodesRef.current, next)
            return next
        })
    }, [setEdges, triggerSave, isZh, onChangeEdgeLabel, onChangeEdgeArrows, onChangeEdgeStyle, onDeleteEdge, onSelectEdge])

    // Toolbar actions
    const addCard = useCallback(() => {
        const id = 'card-' + Date.now().toString(36)
        const newNode = {
            id,
            type: 'text',
            position: { x: 120 + Math.random() * 80, y: 120 + Math.random() * 80 },
            style: { width: 320, height: 200 },
            data: {
                text: isZh ? '## 新卡片\n\n點兩下開始輸入文字...' : '## New Card\n\nDouble-click to edit...',
                ...handlers,
            },
        }
        setNodes(nds => {
            const next = [...nds, newNode]
            triggerSave(next, edgesRef.current)
            return next
        })
    }, [handlers, isZh, setNodes, triggerSave])

    const addSticky = useCallback(() => {
        const colors = ['#fff9c4', '#dcedc8', '#bbdefb', '#f8bbd0', '#e1bee7', '#ffe0b2']
        const color = colors[Math.floor(Math.random() * colors.length)]
        const id = 'sticky-' + Date.now().toString(36)
        const newNode = {
            id,
            type: 'sticky',
            position: { x: 180 + Math.random() * 80, y: 180 + Math.random() * 80 },
            style: { width: 240, height: 180 },
            data: {
                text: isZh ? '📌 新靈感便籤\n\n雙擊輸入內容...' : '📌 New Sticky Note\n\nDouble click to edit...',
                color,
                ...handlers,
            },
        }
        setNodes(nds => {
            const next = [...nds, newNode]
            triggerSave(next, edgesRef.current)
            return next
        })
    }, [handlers, isZh, setNodes, triggerSave])

    const addWikiLink = useCallback(() => {
        const id = 'wiki-' + Date.now().toString(36)
        const newNode = {
            id,
            type: 'file',
            position: { x: 220 + Math.random() * 80, y: 220 + Math.random() * 80 },
            style: { width: 260, height: 120 },
            data: {
                file: '',
                ...handlers,
            },
        }
        setNodes(nds => {
            const next = [...nds, newNode]
            triggerSave(next, edgesRef.current)
            return next
        })
    }, [handlers, setNodes, triggerSave])

    const exportJsonCanvas = useCallback(() => {
        const canvasDoc = reactFlowToJsonCanvas(nodesRef.current, edgesRef.current)
        const blob = new Blob([JSON.stringify(canvasDoc, null, 2)], { type: 'application/json' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `canvas-${window.location.pathname.replace(/^\/+/, '') || 'note'}.canvas`
        a.click()
        URL.revokeObjectURL(url)
    }, [])

    const handleImportFile = useCallback(event => {
        const file = event.target.files?.[0]
        if (!file) return
        const reader = new FileReader()
        reader.onload = e => {
            try {
                const parsed = validateCanvasDocument(parseCanvasDocument(e.target.result, { allowFallback: false }))
                const converted = jsonCanvasToReactFlow(parsed, handlers, edgeHandlers)
                setNodes(converted.nodes)
                setEdges(converted.edges)
                triggerSave(converted.nodes, converted.edges)
            } catch (err) {
                alert(isZh ? '匯入失敗：無效的 JSON Canvas 檔案' : 'Import failed: Invalid JSON Canvas file')
            }
        }
        reader.readAsText(file)
        event.target.value = ''
    }, [handlers, edgeHandlers, isZh, setEdges, setNodes, triggerSave])

    return (
        <div className={`david-canvas-app ${isDark ? 'theme-dark' : 'theme-light'}`} style={{ width: '100%', height: '100%' }}>
            <ReactFlow
                nodes={nodes}
                edges={edges}
                nodeTypes={nodeTypes}
                edgeTypes={edgeTypes}
                onNodesChange={isEdit ? handleNodesChange : undefined}
                onEdgesChange={isEdit ? handleEdgesChange : undefined}
                onConnect={isEdit ? onConnect : undefined}
                nodesDraggable={isEdit}
                nodesConnectable={isEdit}
                connectionMode={ConnectionMode.Loose}
                defaultEdgeOptions={{ type: 'canvasEdge', markerEnd: { type: MarkerType.ArrowClosed, color: DEFAULT_EDGE_COLOR }, className: 'canvas-edge-style', style: EDGE_STYLE }}
                elementsSelectable={true}
                colorMode={isDark ? 'dark' : 'light'}
                fitView
                minZoom={0.1}
                maxZoom={3}
            >
                <Background variant="dots" gap={20} size={1} color={isDark ? '#444' : '#ccc'} />
                <Controls showInteractive={false} />
                <MiniMap
                    nodeStrokeWidth={3}
                    zoomable
                    pannable
                    nodeColor={n => (n.type === 'sticky' ? (n.data?.color || '#ffeb3b') : (isDark ? '#333' : '#fff'))}
                />

                <Panel position="top-left" className="canvas-floating-toolbar">
                    {isEdit ? (
                        <>
                            <button type="button" className="canvas-tb-btn" onClick={addCard} title={isZh ? '新增 Markdown 卡片' : 'Add Card'}>
                                ➕ {isZh ? '新增卡片' : 'Add Card'}
                            </button>
                            <button type="button" className="canvas-tb-btn" onClick={addSticky} title={isZh ? '新增靈感便籤' : 'Add Sticky'}>
                                📌 {isZh ? '靈感便籤' : 'Sticky'}
                            </button>
                            <button type="button" className="canvas-tb-btn" onClick={addWikiLink} title={isZh ? '引用 Wiki 筆記' : 'Wiki Note'}>
                                🔗 {isZh ? '引用筆記' : 'Wiki Note'}
                            </button>
                            <span className="canvas-tb-divider" />
                            <button type="button" className="canvas-tb-btn" onClick={exportJsonCanvas} title={isZh ? '匯出 Obsidian .canvas' : 'Export .canvas'}>
                                📤 {isZh ? '匯出 .canvas' : 'Export'}
                            </button>
                            <button type="button" className="canvas-tb-btn" onClick={() => fileInputRef.current?.click()} title={isZh ? '匯入 Obsidian .canvas' : 'Import .canvas'}>
                                📥 {isZh ? '匯入 .canvas' : 'Import'}
                            </button>
                            <input ref={fileInputRef} type="file" accept=".canvas,.json" style={{ display: 'none' }} onChange={handleImportFile} />
                        </>
                    ) : (
                        <>
                            <span className="canvas-tb-tag">👀 {isZh ? '唯讀預覽中' : 'Read-only View'}</span>
                            <button type="button" className="canvas-tb-btn" onClick={exportJsonCanvas} title={isZh ? '匯出 Obsidian .canvas' : 'Export .canvas'}>
                                📤 {isZh ? '匯出 .canvas' : 'Export'}
                            </button>
                        </>
                    )}
                </Panel>
            </ReactFlow>
        </div>
    )
}

const reactRoot = createRoot(root)
reactRoot.render(<CanvasEditorApp />)

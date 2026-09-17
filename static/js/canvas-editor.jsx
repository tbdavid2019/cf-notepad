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
    MarkerType,
    ConnectionMode,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import { parseCanvasDocument, validateCanvasDocument } from '../../src/canvas_document.mjs'

const root = document.querySelector('#canvas-editor')
const source = document.querySelector('#contents')
if (!root || !source) throw new Error('Canvas editor requires #canvas-editor and #contents')

const isEditableMode = root.getAttribute('data-editable') === 'true' || window.APP_STATE?.isEdit === true
const EDGE_STYLE = { stroke: '#2563a6', strokeWidth: 2.5 }

function safeExternalUrl(value) {
    try {
        const url = new URL(value)
        return ['http:', 'https:'].includes(url.protocol) ? url.href : ''
    } catch {
        return ''
    }
}

function safeWikiNotePath(value) {
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

// Custom Markdown Card Node
function TextCardNode({ id, data, selected }) {
    const isEdit = isEditableMode
    const [isEditing, setIsEditing] = useState(false)
    const [text, setText] = useState(data.text || '')
    const theme = useCanvasTheme()
    const isDark = theme === 'dark'
    const isZh = resolveCanvasLang() === 'zh-TW'

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
            className={`canvas-node-card canvas-card-text ${selected ? 'is-selected' : ''} ${isDark ? 'is-dark' : 'is-light'}`}
            style={{ width: '100%', height: '100%' }}
        >
            <NodeResizer minWidth={200} minHeight={120} isVisible={selected && isEdit} lineClassName="canvas-resizer-line" handleClassName="canvas-resizer-handle" />

            <CardHandles isEdit={isEdit} />

            <div className="canvas-card-header">
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

// Custom Sticky Note Node
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

// Custom Wiki Link Node
function WikiLinkNode({ id, data, selected }) {
    const isEdit = isEditableMode
    const isZh = resolveCanvasLang() === 'zh-TW'
    const theme = useCanvasTheme()
    const isDark = theme === 'dark'
    const [file, setFile] = useState(data.file || '')
    const [isEditing, setIsEditing] = useState(!data.file && isEdit)

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
            style={{ width: '100%', height: '100%' }}
        >
            <NodeResizer minWidth={220} minHeight={100} isVisible={selected && isEdit} lineClassName="canvas-resizer-line" handleClassName="canvas-resizer-handle" />

            <CardHandles isEdit={isEdit} />

            <div className="canvas-card-header">
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

// Convert JSON Canvas to React Flow elements
function jsonCanvasToReactFlow(canvasData, handlers) {
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
                onDeleteNode: handlers.onDeleteNode,
            },
        }
    })

    const edges = (canvasData.edges || []).map(edge => ({
        id: String(edge.id),
        source: String(edge.fromNode),
        target: String(edge.toNode),
        sourceHandle: edge.fromSide || 'right',
        targetHandle: edge.toSide || 'left',
        label: edge.label || '',
        type: 'smoothstep',
        markerEnd: { type: MarkerType.ArrowClosed },
        className: 'canvas-edge-style',
        style: edge.color ? { ...EDGE_STYLE, stroke: edge.color } : EDGE_STYLE,
    }))

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
            ...(e.label ? { label: e.label } : {}),
            toEnd: 'arrow',
            ...(e.style?.stroke ? { color: e.style.stroke } : {}),
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

    const handlers = useMemo(() => ({
        onChangeText,
        onChangeFile,
        onChangeUrl,
        onDeleteNode,
    }), [onChangeText, onChangeFile, onChangeUrl, onDeleteNode])

    // Parse initial content from #contents
    const initialCanvasDoc = useMemo(() => {
        try {
            const doc = parseCanvasDocument(source.value, { allowFallback: false })
            return validateCanvasDocument(doc)
        } catch {
            return parseCanvasDocument('')
        }
    }, [])
    const initialElements = useMemo(() => jsonCanvasToReactFlow(initialCanvasDoc, handlers), [initialCanvasDoc, handlers])

    const [nodes, setNodes, onNodesChange] = useNodesState(initialElements.nodes)
    const [edges, setEdges, onEdgesChange] = useEdgesState(initialElements.edges)

    const nodesRef = useRef(nodes)
    const edgesRef = useRef(edges)
    nodesRef.current = nodes
    edgesRef.current = edges

    // Save changes when dragging/connecting
    const handleNodesChange = useCallback(changes => {
        onNodesChange(changes)
        // debounce save after position/dimension changes
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
                type: 'smoothstep',
                markerEnd: { type: MarkerType.ArrowClosed },
                className: 'canvas-edge-style',
                style: EDGE_STYLE,
            }, eds)
            if (next.length === eds.length) {
                window.showToast?.(isZh ? '這兩個連接點已有關係線。' : 'These connection points are already linked.')
            }
            triggerSave(nodesRef.current, next)
            return next
        })
    }, [setEdges, triggerSave, isZh])

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
        const colors = ['#fff9c4', '#dcedc8', '#bbdefb', '#f8bbd0', '#e1bee7']
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
                const converted = jsonCanvasToReactFlow(parsed, handlers)
                setNodes(converted.nodes)
                setEdges(converted.edges)
                triggerSave(converted.nodes, converted.edges)
            } catch (err) {
                alert(isZh ? '匯入失敗：無效的 JSON Canvas 檔案' : 'Import failed: Invalid JSON Canvas file')
            }
        }
        reader.readAsText(file)
        event.target.value = ''
    }, [handlers, isZh, setEdges, setNodes, triggerSave])

    return (
        <div className={`david-canvas-app ${isDark ? 'theme-dark' : 'theme-light'}`} style={{ width: '100%', height: '100%' }}>
            <ReactFlow
                nodes={nodes}
                edges={edges}
                nodeTypes={nodeTypes}
                onNodesChange={isEdit ? handleNodesChange : undefined}
                onEdgesChange={isEdit ? handleEdgesChange : undefined}
                onConnect={isEdit ? onConnect : undefined}
                nodesDraggable={isEdit}
                nodesConnectable={isEdit}
                connectionMode={ConnectionMode.Loose}
                defaultEdgeOptions={{ type: 'smoothstep', markerEnd: { type: MarkerType.ArrowClosed }, className: 'canvas-edge-style', style: EDGE_STYLE }}
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

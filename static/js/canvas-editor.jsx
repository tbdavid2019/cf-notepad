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
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import { parseCanvasDocument } from '../../src/canvas_document.mjs'

const root = document.querySelector('#canvas-editor')
const source = document.querySelector('#contents')
if (!root || !source) throw new Error('Canvas editor requires #canvas-editor and #contents')

const isEditableMode = root.getAttribute('data-editable') === 'true' || window.APP_STATE?.isEdit === true

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

            <Handle type="target" position={Position.Top} id="top" isConnectable={isEdit} />
            <Handle type="source" position={Position.Right} id="right" isConnectable={isEdit} />
            <Handle type="source" position={Position.Bottom} id="bottom" isConnectable={isEdit} />
            <Handle type="target" position={Position.Left} id="left" isConnectable={isEdit} />

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

            <Handle type="target" position={Position.Top} id="top" isConnectable={isEdit} />
            <Handle type="source" position={Position.Right} id="right" isConnectable={isEdit} />
            <Handle type="source" position={Position.Bottom} id="bottom" isConnectable={isEdit} />
            <Handle type="target" position={Position.Left} id="left" isConnectable={isEdit} />

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

    const noteHref = file.startsWith('/') ? file : `/${file}`

    return (
        <div
            className={`canvas-node-card canvas-card-wiki ${selected ? 'is-selected' : ''} ${isDark ? 'is-dark' : 'is-light'}`}
            style={{ width: '100%', height: '100%' }}
        >
            <NodeResizer minWidth={220} minHeight={100} isVisible={selected && isEdit} lineClassName="canvas-resizer-line" handleClassName="canvas-resizer-handle" />

            <Handle type="target" position={Position.Top} id="top" isConnectable={isEdit} />
            <Handle type="source" position={Position.Right} id="right" isConnectable={isEdit} />
            <Handle type="source" position={Position.Bottom} id="bottom" isConnectable={isEdit} />
            <Handle type="target" position={Position.Left} id="left" isConnectable={isEdit} />

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
                            <a href={noteHref} target="_blank" rel="noopener noreferrer" className="canvas-wiki-link">
                                {isZh ? '開啟筆記 ↗' : 'Open Note ↗'}
                            </a>
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

const nodeTypes = {
    text: TextCardNode,
    sticky: StickyCardNode,
    file: WikiLinkNode,
}

// Convert JSON Canvas to React Flow elements
function jsonCanvasToReactFlow(canvasData, handlers) {
    const nodes = (canvasData.nodes || []).map(node => {
        const type = node.type === 'sticky' ? 'sticky' : node.type === 'file' ? 'file' : 'text'
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
    }))

    return { nodes, edges }
}

// Convert React Flow elements to JSON Canvas specification
function reactFlowToJsonCanvas(nodes, edges) {
    return {
        nodes: nodes.map(n => ({
            id: n.id,
            type: n.type || 'text',
            x: Math.round(n.position.x),
            y: Math.round(n.position.y),
            width: Math.round(n.measured?.width || n.style?.width || (n.type === 'sticky' ? 240 : 320)),
            height: Math.round(n.measured?.height || n.style?.height || (n.type === 'sticky' ? 180 : 200)),
            ...(n.data?.color ? { color: n.data.color } : {}),
            ...(n.data?.text ? { text: n.data.text } : {}),
            ...(n.data?.file ? { file: n.data.file } : {}),
            ...(n.data?.label ? { label: n.data.label } : {}),
        })),
        edges: edges.map(e => ({
            id: e.id,
            fromNode: e.source,
            toNode: e.target,
            ...(e.sourceHandle ? { fromSide: e.sourceHandle } : {}),
            ...(e.targetHandle ? { toSide: e.targetHandle } : {}),
            ...(e.label ? { label: e.label } : {}),
            toEnd: 'arrow',
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
        onDeleteNode,
    }), [onChangeText, onChangeFile, onDeleteNode])

    // Parse initial content from #contents
    const initialCanvasDoc = useMemo(() => parseCanvasDocument(source.value), [])
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
            }, eds)
            triggerSave(nodesRef.current, next)
            return next
        })
    }, [setEdges, triggerSave])

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
                const parsed = JSON.parse(e.target.result)
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

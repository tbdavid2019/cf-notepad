import React, { useState, useEffect, useRef } from 'react'
import { FlowNode } from './FlowNode.jsx'
import { NODE_DIMENSIONS } from '../../model/canvasTypes.mjs'

export function MarkdownPreview({ text = '' }) {
    const containerRef = useRef(null)

    useEffect(() => {
        const el = containerRef.current
        if (!el) return
        if (typeof window !== 'undefined' && typeof window.renderMarkdown === 'function') {
            window.renderMarkdown(el, text || '')
        } else if (typeof window !== 'undefined' && window.marked && typeof window.marked.parse === 'function') {
            const rawHtml = window.marked.parse(text || '')
            if (window.DOMPurify && typeof window.DOMPurify.sanitize === 'function') {
                el.innerHTML = window.DOMPurify.sanitize(rawHtml)
            } else {
                el.textContent = text || ''
            }
        } else {
            el.textContent = text || ''
        }
    }, [text])

    return <div ref={containerRef} className="canvas-node-markdown markdown-body" />
}

export function MarkdownNode(props) {
    const { id, data = {}, selected = false } = props
    const [isEditing, setIsEditing] = useState(false)
    const [localText, setLocalText] = useState(data.text || '')

    useEffect(() => {
        setLocalText(data.text || '')
    }, [data.text])

    const isZh = () => {
        const lang = document.documentElement.getAttribute('lang')
        return lang && lang.startsWith('zh')
    }
    const zh = isZh()

    const handleBlur = () => {
        setIsEditing(false)
        if (localText !== data.text) {
            data.onUpdateContent?.(id, { text: localText })
        }
    }

    const handleKeyDown = (e) => {
        if (e.key === 'Escape' || (e.key === 'Enter' && (e.metaKey || e.ctrlKey))) {
            e.preventDefault()
            handleBlur()
        }
    }

    return (
        <FlowNode
            id={id}
            type="text"
            data={data}
            selected={selected}
            minWidth={NODE_DIMENSIONS.text.minWidth}
            minHeight={NODE_DIMENSIONS.text.minHeight}
            icon="📄"
            title={data.label || (zh ? '筆記卡片' : 'Note Card')}
            isEdit={data.isEdit !== false}
            isEditing={isEditing}
            onToggleEdit={() => setIsEditing(!isEditing)}
            onDuplicate={data.onDuplicate}
            onDelete={data.onDelete}
            onChangeColor={data.onChangeColor}
        >
            {isEditing ? (
                <textarea
                    autoFocus
                    className="canvas-node-textarea nodrag"
                    value={localText}
                    onChange={(e) => setLocalText(e.target.value)}
                    onBlur={handleBlur}
                    onKeyDown={handleKeyDown}
                    placeholder={zh ? '輸入 Markdown 內容 (按 Esc 或 Cmd+Enter 完成)...' : 'Write markdown (Esc or Cmd+Enter to finish)...'}
                />
            ) : (
                <MarkdownPreview text={localText} />
            )}
        </FlowNode>
    )
}

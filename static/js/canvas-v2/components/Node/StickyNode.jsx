import React, { useState, useEffect } from 'react'
import { FlowNode } from './FlowNode.jsx'
import { MarkdownPreview } from './MarkdownNode.jsx'
import { NODE_DIMENSIONS } from '../../model/canvasTypes.mjs'

export function StickyNode(props) {
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
            type="sticky"
            data={data}
            selected={selected}
            minWidth={NODE_DIMENSIONS.sticky.minWidth}
            minHeight={NODE_DIMENSIONS.sticky.minHeight}
            icon="💡"
            title={zh ? '靈感便籤' : 'Sticky Note'}
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
                    placeholder={zh ? '輸入便籤想法...' : 'Write note...'}
                />
            ) : (
                <MarkdownPreview text={localText} />
            )}
        </FlowNode>
    )
}

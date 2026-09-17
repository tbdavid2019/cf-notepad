import React, { useState, useEffect } from 'react'
import { FlowNode } from './FlowNode.jsx'
import { NODE_DIMENSIONS } from '../../model/canvasTypes.mjs'

export function GroupNode(props) {
    const { id, data = {}, selected = false } = props
    const [isEditing, setIsEditing] = useState(false)
    const [localLabel, setLocalLabel] = useState(data.label || '')

    useEffect(() => {
        setLocalLabel(data.label || '')
    }, [data.label])

    const isZh = () => {
        const lang = document.documentElement.getAttribute('lang')
        return lang && lang.startsWith('zh')
    }
    const zh = isZh()

    const handleSave = () => {
        setIsEditing(false)
        if (localLabel !== data.label) {
            data.onUpdateContent?.(id, { label: localLabel })
        }
    }

    return (
        <FlowNode
            id={id}
            type="group"
            data={data}
            selected={selected}
            minWidth={NODE_DIMENSIONS.group.minWidth}
            minHeight={NODE_DIMENSIONS.group.minHeight}
            icon="📁"
            title={data.label || (zh ? '群組' : 'Group')}
            isEdit={data.isEdit !== false}
            isEditing={isEditing}
            onToggleEdit={() => setIsEditing(!isEditing)}
            onDuplicate={data.onDuplicate}
            onDelete={data.onDelete}
            onChangeColor={data.onChangeColor}
        >
            <div className="canvas-group-label nodrag">
                {isEditing ? (
                    <input
                        type="text"
                        autoFocus
                        className="canvas-edge-input"
                        value={localLabel}
                        onChange={(e) => setLocalLabel(e.target.value)}
                        onBlur={handleSave}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') handleSave()
                            if (e.key === 'Escape') setIsEditing(false)
                        }}
                        placeholder={zh ? '群組名稱...' : 'Group label...'}
                    />
                ) : (
                    <span>{localLabel || (zh ? '未命名群組' : 'Untitled Group')}</span>
                )}
            </div>
        </FlowNode>
    )
}

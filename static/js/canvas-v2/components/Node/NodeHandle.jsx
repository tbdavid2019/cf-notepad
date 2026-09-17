import React, { memo } from 'react'
import { Handle, Position } from '@xyflow/react'

const SIDES = [
    { id: 'top', position: Position.Top, className: 'canvas-handle canvas-handle-top' },
    { id: 'right', position: Position.Right, className: 'canvas-handle canvas-handle-right' },
    { id: 'bottom', position: Position.Bottom, className: 'canvas-handle canvas-handle-bottom' },
    { id: 'left', position: Position.Left, className: 'canvas-handle canvas-handle-left' },
]

function NodeHandlesBase({ isEdit = true }) {
    return (
        <>
            {SIDES.map(({ id, position, className }) => (
                <React.Fragment key={id}>
                    <Handle
                        id={id}
                        type="target"
                        position={position}
                        className={className}
                        isConnectable={isEdit}
                    />
                    <Handle
                        id={id}
                        type="source"
                        position={position}
                        className={className}
                        isConnectable={isEdit}
                    />
                </React.Fragment>
            ))}
        </>
    )
}

export const NodeHandles = memo(NodeHandlesBase)


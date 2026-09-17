import React, { memo } from 'react'
import { Handle, Position } from '@xyflow/react'

function NodeHandlesBase({ isEdit = true }) {
    return (
        <>
            <Handle
                id="top"
                type="source"
                position={Position.Top}
                className="canvas-handle canvas-handle-top"
                isConnectableStart={isEdit}
                isConnectableEnd={isEdit}
            />
            <Handle
                id="right"
                type="source"
                position={Position.Right}
                className="canvas-handle canvas-handle-right"
                isConnectableStart={isEdit}
                isConnectableEnd={isEdit}
            />
            <Handle
                id="bottom"
                type="source"
                position={Position.Bottom}
                className="canvas-handle canvas-handle-bottom"
                isConnectableStart={isEdit}
                isConnectableEnd={isEdit}
            />
            <Handle
                id="left"
                type="source"
                position={Position.Left}
                className="canvas-handle canvas-handle-left"
                isConnectableStart={isEdit}
                isConnectableEnd={isEdit}
            />
        </>
    )
}

export const NodeHandles = memo(NodeHandlesBase)

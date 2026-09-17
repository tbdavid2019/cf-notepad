import React, { useState, useMemo } from 'react'
import {
    BaseEdge,
    EdgeLabelRenderer,
    EdgeToolbar as FlowEdgeToolbar,
    getSmoothStepPath,
    MarkerType,
} from '@xyflow/react'
import { EdgeLabel } from './EdgeLabel.jsx'
import { EdgeToolbar } from './EdgeToolbar.jsx'
import { computeEdgeToolbarPosition } from './edgePositionHelpers.mjs'
import {
    DEFAULT_EDGE_COLOR,
    DEFAULT_EDGE_WIDTH,
    DEFAULT_EDGE_STYLE,
} from '../../model/canvasTypes.mjs'

export function CanvasEdge(props) {
    const {
        id,
        sourceX,
        sourceY,
        targetX,
        targetY,
        sourcePosition,
        targetPosition,
        selected = false,
        label,
        data = {},
        style = {},
    } = props

    const [isEditingLabel, setIsEditingLabel] = useState(false)

    const [edgePath, labelX, labelY] = getSmoothStepPath({
        sourceX,
        sourceY,
        sourcePosition,
        targetX,
        targetY,
        targetPosition,
        borderRadius: 12,
    })

    const toolbarPos = useMemo(() => {
        return computeEdgeToolbarPosition({
            labelX,
            labelY,
            viewportWidth: typeof window !== 'undefined' ? window.innerWidth : 800,
            viewportHeight: typeof window !== 'undefined' ? window.innerHeight : 600,
        })
    }, [labelX, labelY])

    const color = data.color || style.stroke || DEFAULT_EDGE_COLOR
    const strokeWidth = Number(data.strokeWidth) || style.strokeWidth || DEFAULT_EDGE_WIDTH
    const lineStyle = data.lineStyle || DEFAULT_EDGE_STYLE

    let strokeDasharray
    if (lineStyle === 'dashed') strokeDasharray = '6 4'
    else if (lineStyle === 'dotted') strokeDasharray = '2 3'

    const markerStart = data.fromEnd === 'arrow'
        ? { type: MarkerType.ArrowClosed, color }
        : undefined

    const markerEnd = (data.toEnd === 'arrow' || (data.toEnd === undefined && !data.fromEnd))
        ? { type: MarkerType.ArrowClosed, color }
        : undefined

    const edgeStyle = {
        ...style,
        stroke: color,
        strokeWidth,
        strokeDasharray,
    }

    return (
        <>
            <BaseEdge
                id={id}
                path={edgePath}
                markerStart={markerStart}
                markerEnd={markerEnd}
                style={edgeStyle}
                interactionWidth={20}
                className="canvas-edge-path"
            />

            {selected && (
                <FlowEdgeToolbar
                    edgeId={id}
                    x={toolbarPos.x}
                    y={toolbarPos.y}
                    isVisible={selected}
                    className="nodrag nopan"
                >
                    <EdgeToolbar
                        id={id}
                        data={data}
                        selected={selected}
                        isEdit={data.isEdit !== false}
                        onStartEditLabel={() => setIsEditingLabel(true)}
                        onChangeStyle={data.onChangeEdgeStyle}
                        onDelete={data.onDeleteEdge}
                    />
                </FlowEdgeToolbar>
            )}

            <EdgeLabelRenderer>
                <div
                    style={{
                        position: 'absolute',
                        transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
                        pointerEvents: 'all',
                        display: 'flex',
                        alignItems: 'center',
                    }}
                    className="nodrag nopan"
                >
                    <EdgeLabel
                        id={id}
                        label={data.label || label || ''}
                        selected={selected}
                        isEdit={data.isEdit !== false}
                        isEditing={isEditingLabel}
                        onStartEdit={() => setIsEditingLabel(true)}
                        onFinishEdit={(newLabel) => {
                            setIsEditingLabel(false)
                            data.onChangeEdgeLabel?.(id, newLabel)
                        }}
                        onSelect={() => data.onSelectEdge?.(id)}
                    />
                </div>
            </EdgeLabelRenderer>
        </>
    )
}

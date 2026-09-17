/**
 * Viewport helpers adapted from Ameliorate externalFlowStore and flowHooks.
 */

let flowInstance = null

export function setReactFlowInstance(instance) {
    flowInstance = instance
}

export function getReactFlowInstance() {
    return flowInstance
}

export function fitView(options = { padding: 0.2, duration: 400 }) {
    if (!flowInstance) return
    flowInstance.fitView(options)
}

export function zoomIn(options = { duration: 300 }) {
    if (!flowInstance) return
    flowInstance.zoomIn(options)
}

export function zoomOut(options = { duration: 300 }) {
    if (!flowInstance) return
    flowInstance.zoomOut(options)
}

export function centerNode(nodeId, zoom = 1, duration = 400) {
    if (!flowInstance) return
    const node = flowInstance.getNode(nodeId)
    if (!node) return
    flowInstance.setCenter(node.position.x + (node.measured?.width || 200) / 2, node.position.y + (node.measured?.height || 100) / 2, { zoom, duration })
}

export function getViewportCenter() {
    if (!flowInstance) return { x: 120, y: 120 }
    const width = typeof window !== 'undefined' ? window.innerWidth : 800
    const height = typeof window !== 'undefined' ? window.innerHeight : 600
    if (typeof flowInstance.screenToFlowPosition === 'function') {
        return flowInstance.screenToFlowPosition({ x: width / 2, y: height / 2 })
    }
    const vp = flowInstance.getViewport?.() || { x: 0, y: 0, zoom: 1 }
    return {
        x: Math.round((width / 2 - vp.x) / (vp.zoom || 1)),
        y: Math.round((height / 2 - vp.y) / (vp.zoom || 1)),
    }
}

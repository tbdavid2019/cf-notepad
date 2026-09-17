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

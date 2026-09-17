/**
 * Selectors for Canvas v2 store
 */

export const selectNodes = (state) => state.nodes
export const selectEdges = (state) => state.edges
export const selectCanUndo = (state) => state.history.past.length > 0
export const selectCanRedo = (state) => state.history.future.length > 0
export const selectIsEdit = (state) => state.isEdit
export const selectSyncStatus = (state) => state.syncStatus
export const selectDirty = (state) => state.dirty
export const selectSelectedNodeIds = (state) => state.selectedNodeIds
export const selectSelectedEdgeIds = (state) => state.selectedEdgeIds
export const selectSelectedNode = (state) => state.nodes.find(n => state.selectedNodeIds.includes(n.id))
export const selectSelectedEdge = (state) => state.edges.find(e => state.selectedEdgeIds.includes(e.id))
export const selectOpenPopover = (state) => state.openPopover

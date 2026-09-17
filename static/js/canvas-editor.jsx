/**
 * Infinite Canvas Editor entry point
 * Mounts Canvas v2 powered by Ameliorate architecture and React Flow.
 */

import { mountCanvasEditor } from './canvas-v2/index.jsx'

const root = document.querySelector('#canvas-editor')
const source = document.querySelector('#contents')
if (!root || !source) throw new Error('Canvas editor requires #canvas-editor and #contents')

const isEditableMode = root.getAttribute('data-editable') === 'true' || window.APP_STATE?.isEdit === true

mountCanvasEditor(root, source, { isEdit: isEditableMode })

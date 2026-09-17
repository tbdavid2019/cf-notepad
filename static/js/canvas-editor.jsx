/**
 * Infinite Canvas Editor entry point
 * Canvas v2 (Ameliorate architecture) with JSON Canvas 1.0 standard.
 */

import { mountCanvasEditor } from './canvas-v2/index.jsx'

// Clean up any stale legacy flag to guarantee zero legacy regression
if (typeof localStorage !== 'undefined') {
    try {
        localStorage.removeItem('CANVAS_EDITOR_VERSION')
    } catch {}
}

const root = document.querySelector('#canvas-editor')
const source = document.querySelector('#contents')
if (!root || !source) throw new Error('Canvas editor requires #canvas-editor and #contents')

const isEditableMode = root.getAttribute('data-editable') === 'true' || window.APP_STATE?.isEdit === true

mountCanvasEditor(root, source, { isEdit: isEditableMode })


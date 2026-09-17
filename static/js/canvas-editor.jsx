/**
 * Infinite Canvas Editor entry point
 * Defaults to Canvas v2 (Ameliorate architecture), with runtime switch to legacy
 * via ?v=legacy, ?canvas_version=legacy, or window/localStorage CANVAS_EDITOR_VERSION=legacy.
 */

import { mountCanvasEditor as mountV2 } from './canvas-v2/index.jsx'
import { mountCanvasEditor as mountLegacy } from './canvas-legacy/index.jsx'

const root = document.querySelector('#canvas-editor')
const source = document.querySelector('#contents')
if (!root || !source) throw new Error('Canvas editor requires #canvas-editor and #contents')

const isEditableMode = root.getAttribute('data-editable') === 'true' || window.APP_STATE?.isEdit === true

const searchParams = new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '')
const versionOverride = searchParams.get('canvas_version') || searchParams.get('v') || (typeof window !== 'undefined' ? window.CANVAS_EDITOR_VERSION : null) || (typeof localStorage !== 'undefined' ? localStorage.getItem('CANVAS_EDITOR_VERSION') : null)

if (versionOverride === 'legacy' || versionOverride === 'v1') {
    mountLegacy(root, source, { isEdit: isEditableMode })
} else {
    mountV2(root, source, { isEdit: isEditableMode })
}

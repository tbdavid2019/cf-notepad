/**
 * src/scripts/editor.js
 * Editor page client-side logic.
 * Handles: textarea input, scroll sync, resizable split pane, paste image.
 * Returns the script as a string for inlining in the edit template.
 *
 * NOTE: This module exports the editor script string.
 * Currently the editor logic is embedded inline in src/templates/base.js
 * as part of the HTML template. This file serves as a reference extraction
 * and can be used in future refactoring to serve the script as a static file.
 */

/**
 * Get the editor initialization script as a string.
 * This is the complete client-side logic for the editor page.
 */
export const getEditorScript = () => `
// Editor page logic is embedded in the base HTML template (src/templates/base.js)
// See the DOMContentLoaded listener in that file for:
// - Textarea input handler with throttled auto-save
// - Scroll sync between textarea and preview
// - Resizable split pane via drag handle (.divide-line)
// - Paste image handler (when ENABLE_R2 is enabled)
`

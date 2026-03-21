/**
 * src/template.js
 * Re-export barrel - preserves backward compatibility for all existing imports.
 * All template functions are now organized in subdirectories:
 *   - src/templates/common.js  → SWITCHER, FOOTER, MODAL
 *   - src/templates/base.js    → HTML (base page wrapper)
 *   - src/templates/edit.js    → Edit
 *   - src/templates/share.js   → Share
 *   - src/templates/admin.js   → Admin
 *   - src/templates/pages.js   → NeedPasswd, Page404
 *   - src/styles/base.css.js   → getBaseCss
 *   - src/styles/editor.css.js → getEditorCss
 *   - src/styles/admin.css.js  → getAdminCss
 *   - src/styles/markdown.css.js → getMarkdownCss
 *   - src/scripts/admin.js     → getAdminScript (AdminController)
 *   - src/scripts/editor.js    → getEditorScript
 */
export { Edit } from './templates/edit'
export { Share } from './templates/share'
export { Admin } from './templates/admin'
export { NeedPasswd, Page404 } from './templates/pages'

// Also re-export shared utilities for any code that imports them from template.js
export { FOOTER, MODAL, SWITCHER } from './templates/common'
export { HTML } from './templates/base'
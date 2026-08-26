/**
 * src/templates/edit.js
 * Edit page template - delegates to base HTML wrapper
 */
import { HTML } from './base.js'

export const Edit = data => HTML({ isEdit: true, ...data })

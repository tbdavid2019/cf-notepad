## Why

The current `template.js` file has grown to over 1300 lines, combining HTML templates, inline CSS, inline JavaScript, and admin UI logic into a single monolithic file. This makes maintenance extremely difficult. The admin interface has multiple UX issues including broken sorting, unreliable batch deletion, and lack of user feedback after operations. Attempts to fix these issues have been unsuccessful due to code complexity and tight coupling.

## What Changes

- Split monolithic `template.js` into modular components (templates, styles, scripts)
- Refactor admin UI into separate HTML template with external JavaScript
- Fix admin interface bugs:
  - **Sorting**: Repair table column sorting functionality
  - **Batch delete**: Fix checkbox selection and batch deletion
  - **User feedback**: Add confirmation messages after delete operations
  - **Empty page cleanup**: Ensure "delete empty pages" feature works reliably
- Separate concerns: move inline styles to CSS files, inline scripts to JS modules
- Improve code organization and maintainability

## Capabilities

### New Capabilities

- `admin-ui-module`: Standalone admin interface with proper separation of concerns (HTML, CSS, JS)
- `template-system`: Modular template system replacing monolithic template.js
- `admin-batch-operations`: Reliable batch operations (select all, batch delete, delete empty pages)
- `user-feedback-system`: User-friendly notifications and confirmations for admin actions

### Modified Capabilities

<!-- No existing capabilities are being modified at requirement level -->

## Impact

**Code Structure:**
- `src/template.js`: Split into multiple files (templates/, styles/, scripts/)
- New directory structure for better organization
- Backend route handlers may need updates to use new template modules

**Admin Interface:**
- Complete rewrite of admin UI JavaScript
- Improved UX with proper feedback and error handling
- All existing admin features remain functional

**Dependencies:**
- No new external dependencies required
- May introduce build step for CSS/JS bundling (optional)

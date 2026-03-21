## Context

The current `src/template.js` file contains 1300+ lines mixing multiple concerns:
- HTML template generation functions (Edit, Share, Admin, etc.)
- Inline CSS styles for all pages
- Inline JavaScript for client-side interactions
- Admin UI logic including sorting, batch operations, and event handlers

This monolithic structure has led to:
- Difficult debugging (hard to isolate issues)
- Failed attempts to fix bugs (sorting, batch delete)
- Poor code reusability
- No clear separation of concerns

The admin interface specifically suffers from:
- Unreliable event handling (sorting clicks, checkbox changes)
- Race conditions in async operations
- Lack of user feedback after actions
- Complex inline JavaScript that's hard to test

## Goals / Non-Goals

**Goals:**
- Create modular file structure with clear separation of concerns
- Fix all identified admin UI bugs (sorting, batch delete, user feedback)
- Improve maintainability without changing functionality
- Keep backward compatibility with existing route handlers

**Non-Goals:**
- Rewriting backend API endpoints (only updating template calls if needed)
- Adding new admin features beyond fixing existing bugs
- Migrating to a frontend framework (React, Vue, etc.)
- Changing the KV storage schema

## Decisions

### 1. File Structure Organization

**Decision:** Split into domain-based modules while keeping template.js as entry point

```
src/
├── template.js (re-export functions, minimal code)
├── templates/
│   ├── edit.js
│   ├── share.js
│   ├── admin.js
│   ├── common.js (shared components: FOOTER, MODAL, etc.)
│   └── base.js (HTML wrapper function)
├── styles/
│   ├── base.css (reset, layout)
│   ├── editor.css (editor-specific styles)
│   ├── admin.css (admin-specific styles)
│   └── markdown.css (markdown rendering styles)
└── scripts/
    ├── editor.js (editor page client-side logic)
    └── admin.js (admin page client-side logic)
```

**Rationale:**
- Preserves existing import paths (`import { Admin } from './template'`)
- Clear domain boundaries (templates vs styles vs scripts)
- CSS files can be served separately or inlined (flexible)

**Alternative Considered:** Complete rewrite with build tool (Webpack/Vite)
- Rejected: Too much scope, requires infrastructure changes

### 2. Admin UI Event Handling

**Decision:** Refactor to use event delegation and proper state management

Current issues:
- Multiple event listeners on same elements
- Direct onclick attributes mixed with addEventListener
- Global function pollution

New approach:
```javascript
// Centralized event handling
class AdminController {
  constructor() {
    this.selectedPaths = new Set()
    this.sortState = { column: null, ascending: true }
  }

  init() {
    this.setupEventDelegation()
    this.renderState()
  }

  setupEventDelegation() {
    document.addEventListener('click', this.handleClick.bind(this))
    document.addEventListener('change', this.handleChange.bind(this))
  }

  handleClick(e) {
    // Single handler for all clicks
  }
}
```

**Rationale:**
- Single source of truth for state
- Prevents duplicate handlers
- Easier to debug and test

### 3. Sorting Implementation

**Decision:** Fix sorting by ensuring consistent data-val attributes and proper type coercion

Current bug: Mixed string/number comparison, missing data-val on some cells

Fix:
- Ensure all sortable cells have `data-val` attribute
- Explicit number vs string comparison logic
- Maintain sort direction state properly

### 4. Batch Operations

**Decision:** Implement proper async/await error handling with loading states

Current bug: Race conditions, no error feedback, button state issues

Fix:
```javascript
async batchDelete() {
  this.setLoading(true)
  try {
    const paths = Array.from(this.selectedPaths)
    const result = await this.api.batchDelete(paths)
    this.showSuccess(`Deleted ${result.count} items`)
    setTimeout(() => location.reload(), 1000)
  } catch (error) {
    this.showError(`Failed: ${error.message}`)
  } finally {
    this.setLoading(false)
  }
}
```

**Rationale:**
- Clear loading states prevent double-clicks
- User feedback before reload
- Proper error handling and recovery

### 5. CSS Extraction Strategy

**Decision:** Generate CSS files but keep inline option for backward compatibility

Approach:
- Create separate CSS files in `src/styles/`
- Template functions can inline CSS (current behavior) OR link to external files
- Add utility to generate combined CSS bundle

**Rationale:**
- No breaking changes to deployment
- Enables future optimization (CDN, caching)
- Developers can choose inline vs external

## Risks / Trade-offs

**Risk: Breaking existing imports**
→ Mitigation: Keep `src/template.js` as re-export barrel, all imports stay valid

**Risk: Template.js still referenced in many places**
→ Mitigation: Phase 1 keeps interface identical, Phase 2 can update call sites

**Trade-off: No build step**
→ CSS/JS still shipped inline initially, can optimize later
→ Keeps deployment simple, no new tooling required

**Risk: Admin script bugs persist**
→ Mitigation: Rewrite with clear patterns, add console logging for debugging

**Trade-off: Not using modern framework**
→ Vanilla JS is harder to maintain long-term but avoids big rewrite
→ Team decides if future framework migration is worth it

## Migration Plan

### Phase 1: Extract and Fix (Non-breaking)
1. Create new file structure
2. Move template functions to `templates/` (keep exports in template.js)
3. Fix admin.js with new event handling
4. Test admin UI thoroughly
5. Deploy (no backend changes needed)

### Phase 2: Optimize (Optional)
1. Move from inline CSS to `<link>` tags
2. Serve static CSS/JS files via CDN or static route
3. Add minification

### Rollback
If issues found post-deploy:
- Revert to previous template.js version
- All functionality is in single file, easy to rollback

## 1. Admin Console Fixes

- [x] 1.1 Locate and remove the stray `<!DOCTYPE html>` string from the admin template view.
- [x] 1.2 Debug and fix the column sorting logic (especially "Last Modified") in the admin data grid.
- [x] 1.3 Refactor the "Select All", "Delete", and "Delete Selected" button event listeners to ensure they correctly identify and process rows.
- [x] 1.4 Test admin console list rendering, sorting, and bulk deletion.

## 2. Mermaid Rendering Fixes

- [x] 2.1 Update the Mermaid initialization config (`startOnLoad`, `securityLevel`, theme variables) in `src/template.js` to fix text overlapping.
- [x] 2.2 Add or modify CSS rules targeting `.diagram-mermaid-render` to ensure node bounding boxes scale with text properly.
- [x] 2.3 Test rendering a Markdown note with a complex multi-line Mermaid diagram to verify legibility.

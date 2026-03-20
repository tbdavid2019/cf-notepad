## Context

The Cloudflare Notepad application provides an admin console for managing notes (viewing, sorting, deleting) and renders Markdown with Mermaid diagrams for end users. Currently, several bugs are degrading the experience:
1. Mermaid diagram text overlapping/clipping issues.
2. The admin console sorting functionality by "last modified" is broken.
3. A stray `< !DOCTYPE html >` tag is visible at the top of the admin page.
4. The admin console's bulk select, delete, and delete-selected features are malfunctioning.

## Goals / Non-Goals

**Goals:**
- Fix the Mermaid diagram rendering configuration or CSS to prevent text overlapping.
- Fix the admin console data grid sorting logic so all columns sort correctly.
- Fix the admin console HTML template to remove the stray DOCTYPE text.
- Overhaul the admin console's selection and deletion logic to ensure reliable bulk operations.

**Non-Goals:**
- We are not redesigning the admin console UI or adding new features beyond bug fixes.
- We are not changing the underlying Cloudflare Workers storage architecture or API design unless strictly required for these fixes.

## Decisions

1. **Mermaid Rendering Fix**: We will adjust the Mermaid initialization parameters (e.g. `securityLevel`, font configurations) or apply CSS overrides to ensure text bounding boxes are calculated correctly, preventing overlap.
2. **Admin Console Template Fix**: We will locate the stray `< !DOCTYPE html >` literal in the admin HTML template (`src/template.js` or backend router) and fix the escaping/placement.
3. **Admin Console Logic Overhaul**: We will debug and rewrite the client-side JavaScript responsible for selecting rows, tracking selected IDs, and dispatching delete requests to ensure it correctly maps to the DOM and backend API.

## Risks / Trade-offs

- **Risk**: Modifying the admin DOM structure or JS might break other untested features in the admin area.
  **Mitigation**: The fixes will be scoped directly to the event listeners and state management for selection/sorting.
- **Risk**: Mermaid rendering changes might affect other diagram types.
  **Mitigation**: We will ensure CSS/config changes are specific to the `.diagram-mermaid-render` container.

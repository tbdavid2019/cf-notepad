## Why

The current admin console has several critical bugs impacting usability, including broken sorting, malfunctioning selection/deletion logic, and a UI glitch exposing HTML doctype tags. Additionally, Mermaid diagrams are rendering incorrectly with text overlap issues, preventing users from properly viewing diagrams. Fixing these is essential to restore core administrative and viewing experiences.

## What Changes

- Fix the visible `< !DOCTYPE html >` text glitch at the top of the admin console.
- Fix the sorting functionality in the admin console so clicking "Last Modified" and other sortable columns works properly.
- Fix the selection and deletion logic in the admin console (Select All, Delete, Delete Selected) to ensure they manage records correctly.
- Fix the Mermaid rendering issue where the second line of text gets covered or overlaps.

## Capabilities

### New Capabilities
- `admin-console-fixes`: Restores full functionality to the admin management interface (sorting, bulk actions, UI rendering).
- `mermaid-rendering`: Ensures Mermaid diagrams render correctly without text clipping or overlapping.

### Modified Capabilities

## Impact

- `src/template.js`: Will have fixes to the Markdown/Mermaid rendering logic and the admin console UI elements.
- `src/worker.js` (potentially): If admin API endpoints or data processing for sorting/deletion need backend fixes.
- End users reading Markdown notes will see accurate diagrams.
- Administrators will be able to properly manage notes through the admin interface.

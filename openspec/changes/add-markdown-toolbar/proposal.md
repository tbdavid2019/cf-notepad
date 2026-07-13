## Why

The editor currently exposes document-level actions in the footer, but common Markdown editing actions require manually typing syntax. An inline toolbar will make everyday formatting faster while preserving the existing lightweight textarea and Markdown storage model.

## What Changes

- Add an editor-only toolbar above the Markdown textarea.
- Provide buttons for headings, emphasis, links, lists, quotes, code, rules, tables, and image syntax.
- Apply commands to the current selection and preserve a useful selection/caret position.
- Add keyboard-accessible labels, tooltips, and responsive overflow behavior.
- Keep the existing footer tools, raw Markdown format, preview renderer, and auto-save behavior unchanged.

## Capabilities

### New Capabilities
- `markdown-editor-toolbar`: Inline Markdown editing commands and toolbar interaction behavior.

### Modified Capabilities
- None.

## Impact

- Affects the edit-page template, editor styles, client-side editor behavior, and UI tests.
- No backend routes, storage schema, or new runtime dependency is required.

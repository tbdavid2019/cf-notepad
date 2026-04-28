## Why

Users currently can only view their notes as static documents. By integrating a Slidev-inspired presentation mode, users can instantly transform their Markdown notes into interactive, professional slides using a simple `---` separator, making the notepad a powerful tool for quick presentations and knowledge sharing.

## What Changes

- **New "Present" Button**: Added to the footer of both the Edit and Share pages.
- **Fullscreen Presentation Overlay**: A dedicated, distraction-free mode for presenting slides using Reveal.js.
- **Slidev-compatible Parsing**: Content will be automatically split into slides using the `---` separator.
- **Dynamic Slide Layouts**: Support for basic Slidev-style layouts (e.g., center, cover) via slide-level metadata.
- **On-demand Asset Loading**: Presentation-related scripts (Reveal.js) and styles will be loaded only when the user enters presentation mode to maintain fast initial page loads.

## Capabilities

### New Capabilities
- `slide-presentation-mode`: Core logic for parsing Markdown into slides and managing the fullscreen presentation lifecycle.

### Modified Capabilities
- `template-system`: Updates to the HTML base template and footer to accommodate the new presentation trigger and container.

## Impact

- **Frontend**: `src/templates/base.js`, `src/templates/common.js`, and `src/styles/` will be updated.
- **Dependencies**: Added client-side dependency on Reveal.js (loaded via CDN).
- **UX**: New "Present" mode that overrides the standard view when active.

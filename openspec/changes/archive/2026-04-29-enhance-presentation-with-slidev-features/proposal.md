# Proposal: Enhance Presentation Mode with Slidev Features

## Goal
Transform the basic Reveal.js presentation mode into a "Slidev-Lite" experience by adding support for layouts, enhanced aesthetics, and click-to-reveal fragments.

## Proposed Changes
- **src/templates/base.js**: Update the `initPresentation` logic to include the Slidev-Lite parser.
- **src/styles/base.css.js**: Add CSS classes for the new layouts and Slidev theme.

## Success Criteria
- Users can create 2-column slides using `::left::` and `::right::`.
- Slides use `Inter` font and Slidev-inspired colors.
- `v-click` correctly triggers fragments.

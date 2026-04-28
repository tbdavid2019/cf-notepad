## 1. UI Updates

- [x] 1.1 Add "Present" button to `src/templates/common.js` FOOTER component.
- [x] 1.2 Add `#presentation-container` and `#presentation-styles` to `src/templates/base.js` HTML wrapper.
- [x] 1.3 Add CSS for the presentation trigger and fullscreen overlay container.

## 2. Core Logic Implementation

- [x] 2.1 Implement the `initPresentation` function within the client-side script in `src/templates/base.js`.
- [x] 2.2 Add Markdown splitting logic to divide content by the `---` separator.
- [x] 2.3 Implement dynamic asset loading for Reveal.js (JS/CSS) via CDN.
- [x] 2.4 Add logic to transform Markdown chunks into Reveal.js `<section>` elements.

## 3. Integration & Polish

- [x] 3.1 Bind the "Present" button click event to the initialization logic.
- [x] 3.2 Implement "Exit" functionality via the `Esc` key and a floating close button.
- [x] 3.3 Verify consistent behavior across Edit, Share, and Preview modes.
- [x] 3.4 Update CHANGELOG.md and README.md with new feature details.

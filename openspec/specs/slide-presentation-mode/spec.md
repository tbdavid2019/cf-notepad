## ADDED Requirements

### Requirement: Two-column slide layout syntax
The system SHALL support a two-column slide layout syntax in presentation mode using `::left::` and `::right::` markers within a slide.

#### Scenario: Render a slide with two columns
- **WHEN** a slide contains both `::left::` and `::right::` markers
- **THEN** the presentation renders the left and right content in a two-column layout

#### Scenario: Preserve introductory content above two columns
- **WHEN** content appears before the `::left::` marker in the same slide
- **THEN** that content remains visible above the two-column layout in the rendered slide

### Requirement: Click-to-reveal syntax
The system SHALL support Slidev-style click-to-reveal behavior using the `{v-click}` marker in presentation mode.

#### Scenario: Reveal a fragment progressively
- **WHEN** slide content contains `{v-click}`
- **THEN** the rendered presentation treats the affected content as a Reveal.js fragment that appears progressively during navigation

### Requirement: Slidev-Lite presentation theme
The system SHALL apply a Slidev-Lite inspired presentation theme while the presentation overlay is active.

#### Scenario: Apply presentation-specific typography and background
- **WHEN** presentation mode is active
- **THEN** slides use the enhanced presentation font stack and dark background styling

#### Scenario: Apply enhanced code block styling
- **WHEN** a slide contains code blocks in presentation mode
- **THEN** the presentation uses the enhanced code block styling and scrollbar treatment defined for the Slidev-Lite theme
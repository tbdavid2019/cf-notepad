## MODIFIED Requirements

### Requirement: Base HTML wrapper is shared
The HTML function in `src/templates/base.js` SHALL provide the root document structure and support the injection of a presentation overlay container.

#### Scenario: Presentation container support
- **WHEN** any template is rendered via the HTML function
- **THEN** it includes an empty `<div id="presentation-container"></div>` at the end of the body
- **THEN** it provides the base HTML wrapper for all pages

### Requirement: Common components are reusable
The `FOOTER` component in `src/templates/common.js` SHALL be updated to include the presentation trigger.

#### Scenario: Present button inclusion in Footer
- **WHEN** the FOOTER is rendered for Edit or Share pages
- **THEN** it includes a "Present" button
- **THEN** it remains reusable across multiple templates

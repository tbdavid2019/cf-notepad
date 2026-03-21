## ADDED Requirements

### Requirement: Template system SHALL be modular and composable
The template system SHALL split monolithic template.js into domain-specific modules while maintaining a clean export interface.

#### Scenario: Template functions are organized by domain
- **WHEN** developer needs to modify edit page template
- **THEN** they can find the code in `src/templates/edit.js`

#### Scenario: Common components are reusable
- **WHEN** multiple templates need FOOTER component
- **THEN** they import it from `src/templates/common.js`

#### Scenario: Base HTML wrapper is shared
- **WHEN** any template needs HTML document structure
- **THEN** they use the HTML function from `src/templates/base.js`

### Requirement: Template exports SHALL maintain backward compatibility
All template exports (Edit, Share, Admin, NeedPasswd, Page404) SHALL remain available through src/template.js.

#### Scenario: Existing imports work unchanged
- **WHEN** backend imports template functions
- **THEN** all exports are available: `import { Edit, Share, Admin, NeedPasswd, Page404 } from './template'`

#### Scenario: Template function signatures unchanged
- **WHEN** route handler calls template function with same parameters
- **THEN** function returns valid HTML string with identical behavior

### Requirement: Styles SHALL be extractable to external files
CSS styles SHALL be organized in separate files but remain inlinable for backward compatibility.

#### Scenario: Styles are organized by concern
- **WHEN** developer needs to modify base layout styles
- **THEN** they can edit `src/styles/base.css`

#### Scenario: Inline styles option preserved
- **WHEN** template is rendered with inline styles (current behavior)
- **THEN** CSS is embedded in `<style>` tags within HTML

#### Scenario: External stylesheet option available
- **WHEN** template is configured to use external CSS
- **THEN** HTML includes `<link>` tags pointing to CSS files

### Requirement: Scripts SHALL be extractable to external files
JavaScript code SHALL be organized in separate files but remain inlinable for backward compatibility.

#### Scenario: Scripts are organized by page type
- **WHEN** developer needs to modify editor page logic
- **THEN** they can edit `src/scripts/editor.js`

#### Scenario: Inline scripts option preserved
- **WHEN** template is rendered with inline scripts (current behavior)
- **THEN** JavaScript is embedded in `<script>` tags within HTML

#### Scenario: External script option available
- **WHEN** template is configured to use external JS
- **THEN** HTML includes `<script src="...">` tags pointing to JS files

## ADDED Requirements

### Requirement: Admin interface SHALL be modular with separated concerns
The admin UI code SHALL be organized into separate modules for HTML templates, CSS styles, and JavaScript logic, eliminating the monolithic structure.

#### Scenario: Styles are in dedicated CSS file
- **WHEN** developer needs to modify admin UI styling
- **THEN** they can edit `src/styles/admin.css` without touching template code

#### Scenario: Scripts are in dedicated JS file
- **WHEN** developer needs to fix admin UI JavaScript behavior
- **THEN** they can edit `src/scripts/admin.js` without touching template or style code

#### Scenario: Templates use composition
- **WHEN** admin template is rendered
- **THEN** it composes reusable components from `src/templates/common.js`

### Requirement: Admin template SHALL maintain backward compatibility
The admin template function SHALL preserve the same export signature and behavior as the current implementation.

#### Scenario: Existing imports continue to work
- **WHEN** backend code imports `{ Admin } from './template'`
- **THEN** the function is available and works identically to before refactor

#### Scenario: Admin function signature unchanged
- **WHEN** route handler calls `Admin({ lang, notes, error })`
- **THEN** function returns valid HTML string with same structure

### Requirement: Admin UI SHALL be maintainable and debuggable
The admin UI code SHALL follow clear patterns that make debugging and modification straightforward.

#### Scenario: Event handlers are centralized
- **WHEN** developer needs to debug a click event
- **THEN** they can find all click handling logic in one place (AdminController.handleClick)

#### Scenario: State management is explicit
- **WHEN** developer needs to understand current UI state
- **THEN** they can inspect AdminController properties (selectedPaths, sortState)

#### Scenario: Console logging aids debugging
- **WHEN** user performs admin action
- **THEN** relevant debug information is logged to browser console

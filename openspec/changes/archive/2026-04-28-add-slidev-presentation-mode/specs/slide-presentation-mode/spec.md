## ADDED Requirements

### Requirement: Presentation trigger mechanism
The system SHALL provide a clear and accessible button to trigger the presentation mode in both Edit and Share views.

#### Scenario: Present button visibility in Editor
- **WHEN** user is on the Edit page
- **THEN** a "Present" button is visible in the footer

#### Scenario: Present button visibility in Share view
- **WHEN** user is viewing a shared note
- **THEN** a "Present" button is visible in the footer

### Requirement: Markdown slide splitting
The system SHALL automatically split the document content into slides using the `---` separator (preceded and followed by newlines).

#### Scenario: Single slide content
- **WHEN** note content contains no `---` separators
- **THEN** the presentation contains exactly one slide with the full content

#### Scenario: Multiple slides content
- **WHEN** note content contains `---` separators
- **THEN** the presentation contains multiple slides, each containing content between the separators

### Requirement: Fullscreen presentation overlay
The system SHALL display the presentation in a fullscreen overlay that covers the entire browser window.

#### Scenario: Entering presentation mode
- **WHEN** user clicks the "Present" button
- **THEN** an overlay container is displayed covering all other UI elements
- **THEN** the presentation starts from the first slide

#### Scenario: Exiting presentation mode
- **WHEN** user presses the `Esc` key or clicks a close button
- **THEN** the presentation overlay is removed and the original page is restored

### Requirement: On-demand asset loading
The system SHALL load presentation-related external libraries (Reveal.js) only when the presentation mode is requested.

#### Scenario: Initial page load
- **WHEN** the Edit or Share page is initially loaded
- **THEN** Reveal.js scripts and styles are NOT loaded

#### Scenario: First presentation request
- **WHEN** user clicks "Present" for the first time in a session
- **THEN** Reveal.js JS and CSS assets are dynamically injected and initialized

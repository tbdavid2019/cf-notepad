## ADDED Requirements

### Requirement: Presentation share route
The system SHALL provide a dedicated presentation route for shared notes at `/share/:md5/present`.

#### Scenario: Open presentation route directly
- **WHEN** a user opens `/share/:md5/present`
- **THEN** the system renders the shared note in presentation mode without requiring an extra Present button click

#### Scenario: Keep existing share route unchanged
- **WHEN** a user opens `/share/:md5`
- **THEN** the system renders the existing non-presentation share view

### Requirement: Slide state deep linking
The system SHALL allow presentation links to restore the addressed slide via URL state.

#### Scenario: Open a specific slide from a presentation link
- **WHEN** a user opens `/share/:md5/present` with a Reveal slide hash that points to a slide index
- **THEN** the presentation starts on the addressed slide instead of always starting from the first slide

#### Scenario: Open presentation route without slide hash
- **WHEN** a user opens `/share/:md5/present` without any slide hash
- **THEN** the presentation starts from the first slide

### Requirement: Presentation exit navigation
The system SHALL define a deterministic way to leave the dedicated presentation route.

#### Scenario: Exit presentation from dedicated route
- **WHEN** a user exits presentation mode from `/share/:md5/present`
- **THEN** the system returns the user to `/share/:md5`

#### Scenario: Refresh while in presentation route
- **WHEN** a user refreshes `/share/:md5/present`
- **THEN** the system remains in presentation mode after reload

### Requirement: Password-protected presentation destination
The system SHALL preserve the requested presentation destination for password-protected shared notes.

#### Scenario: Authenticate before entering a presentation deep link
- **WHEN** a user opens a password-protected `/share/:md5/present` link and successfully completes authentication
- **THEN** the system returns the user to the requested presentation route
- **THEN** the addressed slide hash is preserved if one was provided

#### Scenario: Failed authentication for presentation route
- **WHEN** a user opens a password-protected `/share/:md5/present` link and authentication fails or is cancelled
- **THEN** the system does not reveal the protected presentation content
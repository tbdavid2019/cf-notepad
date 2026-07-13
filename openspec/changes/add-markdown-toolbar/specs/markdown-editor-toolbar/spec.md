## ADDED Requirements

### Requirement: Show an editor toolbar
The edit page SHALL show an inline Markdown toolbar above the editable textarea, and read-only/share pages SHALL NOT show editing commands.

#### Scenario: Edit page
- **WHEN** a user opens an editable Markdown note
- **THEN** the toolbar is visible before the textarea
- **AND** each icon-only control has an accessible label and tooltip

#### Scenario: Read-only page
- **WHEN** a user opens a share or read-only page
- **THEN** the inline editing toolbar is absent

### Requirement: Apply inline Markdown commands
The toolbar SHALL apply common inline Markdown syntax to the current selection or insert a sensible placeholder when no text is selected.

#### Scenario: Bold selected text
- **WHEN** the user selects text and activates Bold
- **THEN** the selection is wrapped in `**` markers
- **AND** the editor value changes through the normal input pipeline

#### Scenario: Link selected text
- **WHEN** the user selects text and activates Link
- **THEN** the text becomes Markdown link syntax with an editable URL placeholder

### Requirement: Apply block Markdown commands
The toolbar SHALL provide heading, quote, unordered list, ordered list, task list, code block, horizontal rule, table, and image insertion commands.

#### Scenario: Apply a block command
- **WHEN** the caret or selection is inside one or more lines and the user activates a block command
- **THEN** the command applies at line boundaries without deleting unrelated document content
- **AND** the editor dispatches an input event so preview and auto-save update

### Requirement: Preserve editing focus
After a command completes, the textarea SHALL remain focused and the resulting selection/caret SHALL be positioned at the inserted or transformed content.

#### Scenario: Continue editing after a command
- **WHEN** the user activates a toolbar command
- **THEN** the textarea remains focused
- **AND** the transformed text remains selected when a placeholder or URL needs editing

### Requirement: Undo and redo editing changes
The toolbar SHALL provide undo and redo controls for changes made through typing, Markdown commands, image insertion, and paste handling.

#### Scenario: Undo a toolbar command
- **WHEN** the user applies a toolbar command and activates Undo
- **THEN** the editor restores the previous content and selection
- **AND** preview and auto-save update through the normal input pipeline

#### Scenario: Redo an undone change
- **WHEN** the user activates Redo after Undo
- **THEN** the editor restores the undone content and selection
- **AND** a new edit after Undo clears the redo branch

### Requirement: Responsive toolbar
The toolbar SHALL remain usable on narrow screens by permitting horizontal scrolling and shall not cover the editor content.

#### Scenario: Narrow viewport
- **WHEN** the editor is displayed below the desktop breakpoint
- **THEN** the toolbar remains horizontally scrollable
- **AND** the textarea and preview retain their available vertical space

### Requirement: AI formatting access
The editable Markdown toolbar SHALL provide an AI formatting control that invokes the same document-formatting workflow as the existing footer control.

#### Scenario: Format the current note from the editor toolbar
- **WHEN** the user activates AI Format in the editor toolbar
- **THEN** the existing formatting prompt and AI request flow is used
- **AND** the resulting Markdown replaces the current editor content through the normal input pipeline

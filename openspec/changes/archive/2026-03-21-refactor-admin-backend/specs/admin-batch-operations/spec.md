## ADDED Requirements

### Requirement: Table sorting SHALL work reliably
Admin table sorting SHALL correctly sort by any column with proper type handling for numbers and strings.

#### Scenario: Sort by numeric column ascending
- **WHEN** admin clicks on "Views" column header
- **THEN** table rows are sorted by view count in ascending order

#### Scenario: Sort by numeric column descending
- **WHEN** admin clicks on already-ascending "Views" column header
- **THEN** table rows are sorted by view count in descending order

#### Scenario: Sort by text column alphabetically
- **WHEN** admin clicks on "Title / URL" column header
- **THEN** table rows are sorted alphabetically by title

#### Scenario: Sort indicator shows current state
- **WHEN** table is sorted by a column
- **THEN** column header displays sort direction arrow (↑ or ↓)

### Requirement: Checkbox selection SHALL work reliably
Checkbox selection for batch operations SHALL correctly maintain selection state.

#### Scenario: Select all checkboxes
- **WHEN** admin clicks "select all" checkbox
- **THEN** all individual note checkboxes become checked

#### Scenario: Deselect all checkboxes
- **WHEN** admin unchecks "select all" checkbox
- **THEN** all individual note checkboxes become unchecked

#### Scenario: Individual selection updates select-all state
- **WHEN** admin manually checks all individual checkboxes
- **THEN** "select all" checkbox automatically becomes checked

#### Scenario: Individual deselection updates select-all state
- **WHEN** admin unchecks any individual checkbox
- **THEN** "select all" checkbox automatically becomes unchecked

### Requirement: Batch delete SHALL work reliably
Batch delete operation SHALL successfully delete all selected notes with proper error handling.

#### Scenario: Delete multiple selected notes
- **WHEN** admin selects 3 notes and clicks "Delete Selected"
- **THEN** confirmation dialog appears asking to confirm deletion of 3 notes

#### Scenario: Batch delete success
- **WHEN** admin confirms batch delete of 3 notes
- **THEN** backend deletes all 3 notes and page reloads showing updated list

#### Scenario: Batch delete with errors
- **WHEN** batch delete encounters errors for some notes
- **THEN** user sees error message indicating which notes failed and why

#### Scenario: Batch delete button state
- **WHEN** no notes are selected
- **THEN** "Delete Selected" button is disabled with reduced opacity

#### Scenario: Selection count display
- **WHEN** admin selects 5 notes
- **THEN** UI displays "已選中 5 項" (5 items selected)

### Requirement: Delete empty pages SHALL work reliably
Delete empty pages operation SHALL identify and remove all notes with empty or near-empty content.

#### Scenario: Identify empty pages correctly
- **WHEN** admin clicks "Delete Empty Pages"
- **THEN** system identifies all pages with content length ≤ 10 characters

#### Scenario: Delete empty pages success
- **WHEN** admin confirms delete empty pages operation
- **THEN** all empty pages are deleted and success message shows count

#### Scenario: Delete empty pages confirmation
- **WHEN** admin clicks "Delete Empty Pages"
- **THEN** confirmation dialog explains what will be deleted (pages with ≤ 10 characters)

#### Scenario: Delete empty pages with no empty pages
- **WHEN** admin clicks "Delete Empty Pages" but no empty pages exist
- **THEN** operation completes successfully showing "0 pages deleted"

### Requirement: Batch operations SHALL prevent race conditions
Batch operations SHALL properly handle loading states to prevent duplicate submissions.

#### Scenario: Button disabled during operation
- **WHEN** admin clicks batch delete button
- **THEN** button becomes disabled and shows loading indicator

#### Scenario: Multiple clicks prevented
- **WHEN** admin double-clicks batch delete button rapidly
- **THEN** only one delete request is sent to backend

#### Scenario: Button re-enabled after completion
- **WHEN** batch operation completes (success or error)
- **THEN** button returns to enabled state with original text

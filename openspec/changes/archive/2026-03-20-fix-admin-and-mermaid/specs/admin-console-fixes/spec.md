## ADDED Requirements

### Requirement: Admin console template correctly formatted
The admin console HTML template SHALL NOT expose raw HTML tags like `<!DOCTYPE html>` as visible text on the page.

#### Scenario: Viewing admin console
- **WHEN** the user navigates to the admin console page
- **THEN** the stray `<!DOCTYPE html>` text is not visible at the top of the page

### Requirement: Admin console data sorting
The admin console SHALL support sorting by all sortable columns, specifically including the "Last Modified" column.

#### Scenario: Sorting by Last Modified
- **WHEN** the user clicks the "Last Modified" column header
- **THEN** the notes list is sorted by the modification date correctly

### Requirement: Admin console bulk selection and deletion
The admin console SHALL support bulk selection and deletion of notes. The "Select All", "Delete", and "Delete Selected" buttons MUST accurately reflect and process the chosen records.

#### Scenario: Selecting and deleting multiple notes
- **WHEN** the user selects multiple notes using checkboxes and clicks "Delete Selected"
- **THEN** only the selected notes are deleted from the system

#### Scenario: Select All functionality
- **WHEN** the user clicks the master checkbox or "Select All"
- **THEN** all visible notes in the list are selected for bulk action

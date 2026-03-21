## ADDED Requirements

### Requirement: User SHALL receive confirmation before destructive actions
All destructive admin operations SHALL require user confirmation with clear messaging.

#### Scenario: Single note delete confirmation
- **WHEN** admin clicks delete button for a note
- **THEN** confirmation dialog appears asking "Delete this note?"

#### Scenario: Batch delete confirmation
- **WHEN** admin clicks "Delete Selected" with 5 notes selected
- **THEN** confirmation dialog appears asking "確定要刪除這 5 個筆記嗎？" (Confirm delete of 5 notes?)

#### Scenario: Delete empty pages confirmation
- **WHEN** admin clicks "Delete Empty Pages"
- **THEN** confirmation dialog explains operation and asks for confirmation

#### Scenario: Unpublish share link confirmation
- **WHEN** admin clicks unpublish button on share link
- **THEN** confirmation dialog asks "確定要取消發布此分享連結嗎？" (Confirm unpublish share link?)

### Requirement: User SHALL receive success feedback after operations
Successful admin operations SHALL display clear success messages before page refresh.

#### Scenario: Single delete success
- **WHEN** admin successfully deletes a note
- **THEN** page refreshes showing updated list (implicit success)

#### Scenario: Batch delete success
- **WHEN** admin successfully batch deletes notes
- **THEN** success alert appears: "刪除成功" (Delete successful) followed by page reload

#### Scenario: Empty pages deletion success
- **WHEN** admin successfully deletes empty pages
- **THEN** success alert shows count: "成功刪除 5 個空白頁面！" (Successfully deleted 5 empty pages!)

#### Scenario: Settings update success
- **WHEN** admin successfully updates settings (password, theme, share, etc.)
- **THEN** success message appears before page reload

### Requirement: User SHALL receive error feedback when operations fail
Failed admin operations SHALL display clear error messages with actionable information.

#### Scenario: Batch delete partial failure
- **WHEN** batch delete succeeds for some notes but fails for others
- **THEN** error message shows which notes failed and why

#### Scenario: Network error
- **WHEN** admin operation fails due to network error
- **THEN** error alert shows: "請求錯誤: [error details]" (Request error: [details])

#### Scenario: Backend error
- **WHEN** backend returns error response
- **THEN** error alert shows: "刪除失敗: [error message]" (Delete failed: [message])

#### Scenario: Authentication error
- **WHEN** admin session expires during operation
- **THEN** error message prompts user to re-authenticate

### Requirement: User SHALL see loading indicators during async operations
Long-running operations SHALL display loading indicators to inform user of progress.

#### Scenario: Batch delete loading indicator
- **WHEN** admin initiates batch delete
- **THEN** button text changes to "⏳ 刪除中..." (Deleting...) and button is disabled

#### Scenario: Empty pages deletion loading indicator
- **WHEN** admin initiates empty pages deletion
- **THEN** button text changes to "⏳ 清理中..." (Cleaning...) and button is disabled

#### Scenario: Content save loading indicator
- **WHEN** editor auto-saves content
- **THEN** loading spinner appears in top-right corner during save

#### Scenario: Loading indicator removed on completion
- **WHEN** async operation completes (success or error)
- **THEN** loading indicator is removed and UI returns to normal state

### Requirement: User SHALL receive visual feedback for UI state changes
UI state changes SHALL be reflected with clear visual indicators.

#### Scenario: Button enable/disable state
- **WHEN** batch delete button is disabled (no selection)
- **THEN** button has reduced opacity (0.5) and cursor shows "not-allowed"

#### Scenario: Button enable state
- **WHEN** batch delete button is enabled (items selected)
- **THEN** button has full opacity (1.0) and cursor shows "pointer"

#### Scenario: Selection count display
- **WHEN** admin selects notes
- **THEN** selection count badge updates in real-time showing "已選中 N 項" (N items selected)

#### Scenario: Sort indicator visual
- **WHEN** column is sorted ascending
- **THEN** column header shows "↑" with full opacity

#### Scenario: Sort indicator descending
- **WHEN** column is sorted descending
- **THEN** column header shows "↓" with full opacity

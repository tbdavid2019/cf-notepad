## 1. Setup and File Structure

- [x] 1.1 Create new directory structure: src/templates/, src/styles/, src/scripts/
- [x] 1.2 Create placeholder files for modular architecture
- [x] 1.3 Create src/templates/common.js for shared components (FOOTER, MODAL, SWITCHER)
- [x] 1.4 Create src/templates/base.js for HTML wrapper function

## 2. Extract and Modularize Templates

- [x] 2.1 Move Edit template function to src/templates/edit.js
- [x] 2.2 Move Share template function to src/templates/share.js
- [x] 2.3 Move Admin template function to src/templates/admin.js
- [x] 2.4 Move NeedPasswd and Page404 templates to src/templates/pages.js
- [x] 2.5 Update src/template.js to re-export all template functions from new modules
- [x] 2.6 Verify all template exports work with existing imports

## 3. Extract CSS Styles

- [x] 3.1 Create src/styles/base.css with reset and layout styles
- [x] 3.2 Create src/styles/editor.css with editor-specific styles
- [x] 3.3 Create src/styles/admin.css with admin-specific styles
- [x] 3.4 Create src/styles/markdown.css with markdown rendering styles
- [x] 3.5 Update templates to reference new CSS files (inline option preserved)

## 4. Refactor Admin UI JavaScript

- [x] 4.1 Create AdminController class in src/scripts/admin.js
- [x] 4.2 Implement centralized state management (selectedPaths, sortState)
- [x] 4.3 Implement setupEventDelegation method for centralized event handling
- [x] 4.4 Migrate select-all checkbox logic to AdminController
- [x] 4.5 Migrate individual checkbox logic to AdminController
- [x] 4.6 Add updateBatchDeleteButton method to manage button state

## 5. Fix Table Sorting

- [x] 5.1 Ensure all sortable table cells have data-val attributes
- [x] 5.2 Implement proper numeric vs string comparison in sortTable function
- [x] 5.3 Fix sort direction state management (asc/desc classes)
- [x] 5.4 Add visual sort indicators (↑/↓) to column headers
- [ ] 5.5 Test sorting on all columns (Title, Views, Password, Last Modified)

## 6. Fix Batch Delete Operation

- [x] 6.1 Implement async batchDelete method with proper error handling
- [x] 6.2 Add loading state management (button disabled, text change to "⏳ 刪除中...")
- [x] 6.3 Add success feedback alert before page reload
- [x] 6.4 Add error feedback with specific error messages
- [x] 6.5 Prevent race conditions with proper async/await and button state
- [ ] 6.6 Test batch delete with multiple selections

## 7. Fix Delete Empty Pages

- [x] 7.1 Implement async deleteEmptyPages method
- [x] 7.2 Add confirmation dialog explaining operation criteria (≤ 10 characters)
- [x] 7.3 Add loading state management for delete empty button
- [x] 7.4 Add success feedback showing count of deleted pages
- [x] 7.5 Handle case where no empty pages exist
- [ ] 7.6 Test delete empty pages with various content lengths

## 8. Implement User Feedback System

- [x] 8.1 Create showSuccess utility method for success messages
- [x] 8.2 Create showError utility method for error messages
- [x] 8.3 Add confirmation dialogs for all destructive operations
- [x] 8.4 Implement loading indicators for async operations
- [x] 8.5 Add visual feedback for button state changes (opacity, cursor)
- [x] 8.6 Add selection count display that updates in real-time

## 9. Extract Editor JavaScript

- [x] 9.1 Create src/scripts/editor.js for editor page logic
- [x] 9.2 Move textarea input handler to editor.js
- [x] 9.3 Move scroll sync logic to editor.js
- [x] 9.4 Move resizable split pane logic to editor.js
- [x] 9.5 Move paste image handler to editor.js
- [x] 9.6 Ensure editor script is properly included in Edit template

## 10. Testing and Verification

- [ ] 10.1 Test admin login and authentication
- [ ] 10.2 Test table sorting on all columns (ascending and descending)
- [ ] 10.3 Test select-all checkbox functionality
- [ ] 10.4 Test batch delete with various selections (1 item, multiple items, all items)
- [ ] 10.5 Test delete empty pages with empty and non-empty notes
- [ ] 10.6 Test error scenarios (network errors, backend errors)
- [ ] 10.7 Test all confirmation dialogs appear correctly
- [ ] 10.8 Test success/error messages display correctly
- [ ] 10.9 Test loading indicators appear and disappear correctly
- [ ] 10.10 Test Edit, Share, NeedPasswd, Page404 templates still work
- [ ] 10.11 Verify no regressions in existing functionality

## 11. Documentation and Cleanup

- [x] 11.1 Add comments to AdminController methods
- [x] 11.2 Add comments to complex sorting logic
- [ ] 11.3 Update README if needed with new file structure
- [x] 11.4 Remove old commented-out code
- [x] 11.5 Verify console.log statements are appropriate for production

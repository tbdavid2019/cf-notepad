/**
 * src/scripts/admin.js
 * Admin page client-side logic via AdminController class.
 * Handles: centralized state, event delegation, sorting, batch delete, delete empty pages, user feedback.
 * Returns the script as a string for inlining in the admin template.
 */
export const getAdminScript = () => `
(function() {
    'use strict';

    /**
     * AdminController - centralized state and event handling for the admin page.
     * All click/change events are handled through delegation from a single listener.
     */
    class AdminController {
        constructor() {
            // State: currently selected note paths
            this.selectedPaths = new Set();
            // State: current sort column and direction
            this.sortState = { column: null, ascending: true };
        }

        /**
         * Initialize the controller: set up event delegation and render initial state.
         */
        init() {
            console.log('[Admin] Initializing AdminController');
            this.setupEventDelegation();
            this.updateBatchDeleteButton();
        }

        /**
         * Set up centralized event delegation.
         * All click and change events flow through here to avoid duplicate handlers.
         */
        setupEventDelegation() {
            // Single click handler for the entire document
            document.addEventListener('click', (e) => this.handleClick(e));
            // Single change handler for the entire document
            document.addEventListener('change', (e) => this.handleChange(e));
        }

        /**
         * Centralized click handler.
         * Routes clicks to appropriate methods based on target.
         */
        handleClick(e) {
            // Sortable column header
            const th = e.target.closest('th.sortable');
            if (th) {
                const colIndex = parseInt(th.getAttribute('data-col'));
                if (!isNaN(colIndex)) {
                    console.log('[Admin] Sort clicked, column:', colIndex);
                    this.sortTable(colIndex);
                }
                return;
            }

            // Batch delete button
            const batchBtn = e.target.closest('#batch-delete-btn');
            if (batchBtn && !batchBtn.disabled) {
                this.batchDelete();
                return;
            }

            // Delete empty pages button
            const deleteEmptyBtn = e.target.closest('#delete-empty-btn');
            if (deleteEmptyBtn && !deleteEmptyBtn.disabled) {
                this.deleteEmptyPages();
                return;
            }
        }

        /**
         * Centralized change handler.
         * Routes change events for select-all and individual checkboxes.
         */
        handleChange(e) {
            // Select-all checkbox
            if (e.target && e.target.id === 'select-all') {
                console.log('[Admin] Select-all changed:', e.target.checked);
                const checkboxes = document.querySelectorAll('.note-checkbox');
                console.log('[Admin] Found checkboxes:', checkboxes.length);
                checkboxes.forEach(cb => {
                    cb.checked = e.target.checked;
                    if (e.target.checked) {
                        this.selectedPaths.add(cb.value);
                    } else {
                        this.selectedPaths.delete(cb.value);
                    }
                });
                this.updateBatchDeleteButton();
                return;
            }

            // Individual note checkbox
            if (e.target && e.target.classList.contains('note-checkbox')) {
                console.log('[Admin] Individual checkbox changed:', e.target.value, e.target.checked);
                if (e.target.checked) {
                    this.selectedPaths.add(e.target.value);
                } else {
                    this.selectedPaths.delete(e.target.value);
                }
                this.updateBatchDeleteButton();
                return;
            }
        }

        /**
         * Update the batch delete button state based on current selection.
         * Also updates the selection count badge and select-all indeterminate state.
         */
        updateBatchDeleteButton() {
            const selected = document.querySelectorAll('.note-checkbox:checked');
            const total = document.querySelectorAll('.note-checkbox');
            const btn = document.getElementById('batch-delete-btn');
            const count = document.getElementById('selected-count');
            const selectAll = document.getElementById('select-all');

            if (!btn) return;

            if (selected.length > 0) {
                btn.disabled = false;
                btn.style.opacity = '1';
                btn.style.cursor = 'pointer';
                if (count) count.textContent = '已選中 ' + selected.length + ' 項';
            } else {
                btn.disabled = true;
                btn.style.opacity = '0.5';
                btn.style.cursor = 'not-allowed';
                if (count) count.textContent = '';
            }

            // Sync select-all checkbox state
            if (selectAll) {
                selectAll.indeterminate = selected.length > 0 && selected.length < total.length;
                selectAll.checked = total.length > 0 && selected.length === total.length;
            }
        }

        /**
         * Show a temporary success notification banner.
         * @param {string} message - The success message to display
         */
        showSuccess(message) {
            console.log('[Admin] Success:', message);
            this._showNotice(message, 'success');
        }

        /**
         * Show a temporary error notification banner.
         * @param {string} message - The error message to display
         */
        showError(message) {
            console.error('[Admin] Error:', message);
            this._showNotice(message, 'error');
        }

        /**
         * Internal: create and display a notification banner.
         * Auto-dismisses after 3 seconds.
         */
        _showNotice(message, type) {
            // Remove any existing notice
            const existing = document.querySelector('.admin-notice');
            if (existing) existing.remove();

            const notice = document.createElement('div');
            notice.className = 'admin-notice ' + type;
            notice.textContent = message;
            document.body.appendChild(notice);

            setTimeout(() => {
                notice.style.opacity = '0';
                setTimeout(() => notice.remove(), 300);
            }, 3000);
        }

        /**
         * Set loading state on a button element.
         * @param {HTMLElement} btn - The button to update
         * @param {boolean} loading - Whether to show loading state
         * @param {string} loadingText - Text to show during loading
         * @param {string} originalText - Text to restore after loading
         */
        setButtonLoading(btn, loading, loadingText, originalText) {
            if (!btn) return;
            if (loading) {
                btn._originalText = originalText || btn.innerHTML;
                btn.innerHTML = loadingText;
                btn.disabled = true;
                btn.style.opacity = '0.7';
                btn.style.cursor = 'not-allowed';
            } else {
                btn.innerHTML = btn._originalText || originalText || btn.innerHTML;
                btn.disabled = false;
                btn.style.opacity = '1';
                btn.style.cursor = 'pointer';
            }
        }

        /**
         * Perform async batch delete of selected notes.
         * Shows loading state, confirmation dialog, success/error feedback.
         */
        async batchDelete() {
            console.log('[Admin] batchDelete called');
            const selected = document.querySelectorAll('.note-checkbox:checked');
            console.log('[Admin] Selected items:', selected.length);

            if (selected.length === 0) {
                alert('請先選擇要刪除的項目');
                return;
            }

            if (!confirm('確定要刪除這 ' + selected.length + ' 個筆記嗎？此操作無法撤銷！')) return;

            const paths = Array.from(selected).map(cb => cb.value);
            console.log('[Admin] Paths to delete:', paths);

            const btn = document.getElementById('batch-delete-btn');
            this.setButtonLoading(btn, true, '⏳ 刪除中...', '🗑 刪除選中項');

            try {
                console.log('[Admin] Sending batch-delete request to:', window.location.pathname);
                const response = await fetch(window.location.pathname, {
                    method: 'POST',
                    credentials: 'same-origin',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ action: 'batch-delete', paths })
                });

                console.log('[Admin] Response status:', response.status);
                const result = await response.json();
                console.log('[Admin] Response:', result);

                if (result.success) {
                    this.showSuccess('✅ 成功刪除 ' + paths.length + ' 個筆記！');
                    setTimeout(() => location.reload(), 1200);
                } else {
                    this.showError('❌ 刪除失敗: ' + (result.message || '未知錯誤'));
                    this.setButtonLoading(btn, false);
                }
            } catch (e) {
                console.error('[Admin] batchDelete error:', e);
                this.showError('❌ 請求錯誤: ' + e.message);
                this.setButtonLoading(btn, false);
            }
        }

        /**
         * Perform async deletion of all empty pages (content ≤ 10 characters).
         * Shows loading state, confirmation dialog, success/error feedback.
         */
        async deleteEmptyPages() {
            console.log('[Admin] deleteEmptyPages called');
            if (!confirm('確定要刪除所有空白頁面嗎？此操作無法撤銷！\\n\\n空白頁面定義：內容長度 ≤ 10 個字符')) {
                return;
            }

            const btn = document.getElementById('delete-empty-btn');
            this.setButtonLoading(btn, true, '⏳ 清理中...', '🧹 刪除所有空白頁面');

            try {
                console.log('[Admin] Sending delete-empty request');
                const response = await fetch(window.location.pathname, {
                    method: 'POST',
                    credentials: 'same-origin',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ action: 'delete-empty' })
                });

                console.log('[Admin] Response status:', response.status);
                const result = await response.json();
                console.log('[Admin] Response:', result);

                if (result.success) {
                    if (result.deleted > 0) {
                        this.showSuccess('✅ 成功刪除 ' + result.deleted + ' 個空白頁面！');
                        if (result.errors && result.errors.length > 0) {
                            console.warn('[Admin] 部分頁面刪除失敗:', result.errors);
                        }
                        setTimeout(() => location.reload(), 1200);
                    } else {
                        this.showSuccess('ℹ️ 沒有發現空白頁面。');
                        this.setButtonLoading(btn, false);
                    }
                } else {
                    this.showError('❌ 刪除失敗: ' + (result.message || '未知錯誤'));
                    this.setButtonLoading(btn, false);
                }
            } catch (error) {
                console.error('[Admin] deleteEmptyPages error:', error);
                this.showError('❌ 刪除過程中發生錯誤: ' + error.message);
                this.setButtonLoading(btn, false);
            }
        }

        /**
         * Sort the notes table by the specified column index.
         * Toggles ascending/descending direction and updates visual indicators.
         * Uses numeric comparison for Views/Password/Date columns, string comparison otherwise.
         *
         * @param {number} colIndex - The 1-based column index to sort by (matches data-col attribute)
         */
        sortTable(colIndex) {
            console.log('[Admin] sortTable called, column:', colIndex);
            try {
                const table = document.getElementById('notesTable');
                if (!table) { console.error('[Admin] Table not found'); return; }
                const tbody = table.querySelector('tbody');
                if (!tbody) { console.error('[Admin] Tbody not found'); return; }

                const rows = Array.from(tbody.querySelectorAll('tr'));
                if (rows.length === 0) { console.warn('[Admin] No rows to sort'); return; }

                const ths = table.querySelectorAll('th.sortable');
                const targetTh = Array.from(ths).find(th => th.getAttribute('data-col') == colIndex);
                if (!targetTh) { console.error('[Admin] Target th not found for column:', colIndex); return; }

                // Toggle direction: if already ascending, switch to descending
                const isAsc = this.sortState.column === colIndex ? !this.sortState.ascending : true;
                this.sortState = { column: colIndex, ascending: isAsc };

                // Update visual indicators on all sortable headers
                ths.forEach(th => th.classList.remove('asc', 'desc'));
                targetTh.classList.add(isAsc ? 'asc' : 'desc');

                // Sort rows: cellIndex = colIndex (0=checkbox, 1=title, 2=views, 3=password, 4=date)
                rows.sort((rowA, rowB) => {
                    const cellA = rowA.cells[colIndex];
                    const cellB = rowB.cells[colIndex];
                    if (!cellA || !cellB) return 0;

                    // Prefer data-val attribute for reliable comparison values
                    const valA = cellA.getAttribute('data-val') !== null
                        ? cellA.getAttribute('data-val')
                        : cellA.innerText.trim().toLowerCase();
                    const valB = cellB.getAttribute('data-val') !== null
                        ? cellB.getAttribute('data-val')
                        : cellB.innerText.trim().toLowerCase();

                    console.log('[Admin] Comparing:', valA, 'vs', valB);

                    // Numeric comparison if both values are numbers
                    const numA = parseFloat(valA);
                    const numB = parseFloat(valB);
                    if (!isNaN(numA) && !isNaN(numB) && valA !== '' && valB !== '') {
                        return isAsc ? numA - numB : numB - numA;
                    }

                    // String comparison (locale-aware)
                    return isAsc
                        ? String(valA).localeCompare(String(valB))
                        : String(valB).localeCompare(String(valA));
                });

                // Re-append rows in sorted order
                rows.forEach(row => tbody.appendChild(row));
                console.log('[Admin] Sorting complete, direction:', isAsc ? 'asc' : 'desc');
            } catch (e) {
                console.error('[Admin] sortTable error:', e);
                alert('排序錯誤: ' + e.message);
            }
        }
    }

    // Bootstrap the controller when DOM is ready
    window.adminController = new AdminController();
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => window.adminController.init());
    } else {
        window.adminController.init();
    }

})();
`

/**
 * src/styles/base.css.js
 * Base CSS styles: reset, layout, loading, footer, utilities
 * Returns CSS as a string for inlining in templates
 */
export const getBaseCss = () => `
@font-face {
    font-family: "Maple Mono";
    src: url("/fonts/MapleMonoNormal-Medium.woff2") format("woff2");
    font-style: normal;
    font-weight: 500;
    font-display: swap;
}

@font-face {
    font-family: "JetBrains Mono";
    src: url("/fonts/JetBrainsMono-Medium.woff2") format("woff2");
    font-style: normal;
    font-weight: 500;
    font-display: swap;
}

@font-face {
    font-family: "GenJyuu Gothic CJK";
    src: url("/fonts/GenJyuuGothic-Medium.woff2") format("woff2");
    font-style: normal;
    font-weight: 500;
    font-display: swap;
    unicode-range: U+3000-303F, U+3040-30FF, U+3100-312F, U+31A0-31BF, U+3400-4DBF, U+4E00-9FFF, U+F900-FAFF, U+FF00-FFEF, U+20000-2EBEF;
}

:root {
    --editor-font-family: "GenJyuu Gothic CJK", "Maple Mono", "Menlo", "Monaco", "Courier New", monospace;
    --share-font-jetbrains-family: "GenJyuu Gothic CJK", "JetBrains Mono", "SF Mono", "Monaco", "Cascadia Code", "Fira Code", "JetBrains Mono NL", "Roboto Mono", "Consolas", "Menlo", monospace;
    --share-font-maple-family: "GenJyuu Gothic CJK", "Maple Mono", "Menlo", "Monaco", "Courier New", monospace;
    --preview-max-width: 100%;
    --toolbar-height: 28px;
    --toolbar-radius: 4px;
    --toolbar-border: #e2dacd;
    --toolbar-bg: #f4f0e8;
    --toolbar-bg-hover: #eae3d5;
    --toolbar-bg-active: #f0e6d8;
    --toolbar-text: #2c2a29;
    --toolbar-muted: #706c66;
    --toolbar-accent: #c8654b;
    --toolbar-success: #5db8a6;
    --toolbar-danger: #c64545;
    --footer-bg: #f4f0e8;
    --footer-border: #e2dacd;
    --footer-text: #4a4640;
}

html[data-ui-theme="dark"],
html[data-ui-theme="dark"] body {
    --toolbar-border: #165b99;
    --toolbar-bg: #0f4c81;
    --toolbar-bg-hover: #1a65a7;
    --toolbar-bg-active: #cc785c;
    --toolbar-text: #ffffff;
    --toolbar-muted: #93bde1;
    --toolbar-accent: #e07a5f;
    --footer-bg: #0f4c81;
    --footer-border: #165b99;
    --footer-text: #ffffff;
    color-scheme: dark;
}

@media (prefers-color-scheme: dark) {
    html[data-ui-theme="auto"],
    html[data-ui-theme="auto"] body,
    html:not([data-ui-theme]),
    html:not([data-ui-theme]) body {
        --toolbar-border: #165b99;
        --toolbar-bg: #0f4c81;
        --toolbar-bg-hover: #1a65a7;
        --toolbar-bg-active: #cc785c;
        --toolbar-text: #ffffff;
        --toolbar-muted: #93bde1;
        --toolbar-accent: #e07a5f;
        --footer-bg: #0f4c81;
        --footer-border: #165b99;
        --footer-text: #ffffff;
        color-scheme: dark;
    }
}

/* Reset & Base */
body { padding: 0; margin: 0; background: #f9f6f0; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; color: #333; height: 100vh; height: 100dvh; overflow: hidden; }
* { box-sizing: border-box; }

/* Scrollbar */
::-webkit-scrollbar { width: 8px; height: 8px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { background: #bcc0c4; border-radius: 4px; }
::-webkit-scrollbar-thumb:hover { background: #999; }

/* Layout */
.note-container { height: 100vh; height: 100dvh; display: flex; flex-direction: column; }
.stack { flex: 1; display: flex; flex-direction: column; overflow: hidden; position: relative; }
.layer_1, .layer_2, .layer_3 { height: 100%; display: flex; flex-direction: column; }
.layer_3 { flex-direction: row; background: #fff; }

/* Utilities */
.hide { display: none !important; }
.divide-line {
    width: 8px;
    background-color: #f6f8fa;
    border-left: 1px solid #e1e4e8;
    border-right: 1px solid #e1e4e8;
    cursor: col-resize;
    z-index: 10;
    flex-shrink: 0;
    transition: background-color 0.2s;
}
.divide-line:hover { background-color: #e1e4e8; }

/* Loading spinner */
#loading { position: fixed; top: 10px; right: 10px; width: 20px; height: 20px; border: 2px solid #f3f3f3; border-top: 2px solid #3498db; border-radius: 50%; animation: spin 1s linear infinite; display: none; z-index: 9999; }
@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }

/* Tips / overlays */
.tips { position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); color: #ccc; font-size: 32px; pointer-events: none; }
.modal { display: none; }
.modal-mask { position: fixed; inset: 0; background: rgba(0,0,0,0.5); z-index: 1000; }
.modal-content { position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); background: white; padding: 20px; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.15); z-index: 1001; width: 400px; display: flex; gap: 10px; }
.embed-modal-content { position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); background: var(--panel-bg, #fff); color: var(--text-color, #222); padding: 24px; border-radius: 10px; box-shadow: 0 8px 28px rgba(0,0,0,0.22); z-index: 1001; width: min(620px, calc(100vw - 32px)); box-sizing: border-box; }
.embed-modal-content h2 { margin: 0 0 8px; }
.embed-modal-content p { margin: 0 0 14px; }
.embed-modal-code { width: 100%; min-height: 110px; box-sizing: border-box; resize: vertical; margin-bottom: 12px; font: 12px/1.5 ui-monospace, SFMono-Regular, Menlo, monospace; }
.modal-content input { flex: 1; padding: 8px; border: 1px solid #ddd; border-radius: 4px; }
.modal-content .close-btn { position: absolute; right: 10px; top: 5px; cursor: pointer; font-size: 18px; color: #999; }
.share-index-prompt {
    display: flex;
    flex-direction: column;
    gap: 8px;
    margin-top: 6px;
}
.share-index-prompt strong {
    color: #24292f;
    font-size: 14px;
    line-height: 1.45;
}
.share-index-prompt p {
    margin: 0;
    color: #57606a;
    font-size: 12px;
    line-height: 1.55;
}
.share-index-actions {
    display: flex;
    justify-content: flex-end;
    gap: 8px;
}
.publish-nudge-content {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: #fff;
    color: #24292f;
    border-radius: 8px;
    box-shadow: 0 18px 40px rgba(31, 35, 40, 0.22);
    z-index: 1001;
    width: min(420px, calc(100vw - 32px));
    padding: 22px;
}
.publish-nudge-content h2 {
    margin: 0 28px 8px 0;
    font-size: 18px;
    line-height: 1.35;
}
.publish-nudge-content p {
    margin: 0 0 18px;
    color: #57606a;
    font-size: 14px;
    line-height: 1.6;
}
.publish-nudge-content .close-btn {
    position: absolute;
    right: 12px;
    top: 10px;
    border: 0;
    background: transparent;
    color: #6e7781;
    cursor: pointer;
    font-size: 18px;
}
.publish-nudge-actions {
    display: flex;
    justify-content: flex-end;
    gap: 10px;
}
.publish-nudge-later {
    background: #f6f8fa;
    color: #24292f;
    border: 1px solid #d0d7de;
}
.publish-nudge-later:hover { background: #eef1f4; }
.publish-nudge-publish { background: #1f883d; }
.publish-nudge-publish:hover { background: #1a7f37; }
.password-modal-content {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: #fff;
    color: #24292f;
    border-radius: 8px;
    box-shadow: 0 18px 40px rgba(31, 35, 40, 0.22);
    z-index: 1001;
    width: min(420px, calc(100vw - 32px));
    padding: 22px;
}
.password-modal-content h2 {
    margin: 0 28px 8px 0;
    font-size: 18px;
    line-height: 1.35;
}
.password-modal-message {
    margin: 0 0 14px;
    color: #57606a;
    font-size: 14px;
    line-height: 1.55;
}
.password-modal-input {
    width: 100%;
    height: 38px;
    padding: 0 12px;
    border: 1px solid #d0d7de;
    border-radius: 6px;
    font-size: 14px;
    margin-bottom: 16px;
}
.password-modal-input:focus-visible {
    outline: 2px solid #0969da;
    outline-offset: 1px;
}
.password-modal-content .close-btn {
    position: absolute;
    right: 12px;
    top: 10px;
    border: 0;
    background: transparent;
    color: #6e7781;
    cursor: pointer;
    font-size: 18px;
}
.password-modal-actions {
    display: flex;
    justify-content: flex-end;
    gap: 10px;
}
.password-modal-cancel {
    background: #f6f8fa;
    color: #24292f;
    border: 1px solid #d0d7de;
}
.password-modal-cancel:hover { background: #eef1f4; }
.app-dialog-content {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    z-index: 1001;
    width: min(440px, calc(100vw - 32px));
    display: grid;
    grid-template-columns: 34px 1fr;
    gap: 12px;
    padding: 22px;
    border: 1px solid #e6dfd8;
    border-radius: 10px;
    background: #fff;
    color: #24292f;
    box-shadow: 0 18px 40px rgba(31, 35, 40, 0.22);
}
.app-dialog-icon {
    width: 30px;
    height: 30px;
    display: grid;
    place-items: center;
    border-radius: 50%;
    background: #f2f4f7;
    color: #57606a;
    font-size: 16px;
    font-weight: 800;
}
.app-dialog-content[data-dialog-kind="error"] .app-dialog-icon {
    background: #fff1f0;
    color: #cf222e;
}
.app-dialog-content[data-dialog-kind="confirm"] .app-dialog-icon {
    background: #fff8c5;
    color: #9a6700;
}
.app-dialog-copy h2 {
    margin: 0 28px 6px 0;
    font-size: 17px;
    line-height: 1.35;
}
.app-dialog-copy p {
    margin: 0;
    color: #57606a;
    font-size: 14px;
    line-height: 1.6;
    white-space: pre-wrap;
}
.app-dialog-actions {
    grid-column: 2;
    display: flex;
    justify-content: flex-end;
    gap: 8px;
    margin-top: 4px;
}
.app-dialog-cancel { background: #f6f8fa; color: #24292f; border: 1px solid #d0d7de; }
.app-dialog-cancel:hover { background: #eef1f4; }
.app-dialog-modal .modal-mask { z-index: 1000; }

/* SVG Icon Utility */
.svg-icon {
    width: 14px;
    height: 14px;
    display: inline-block;
    vertical-align: middle;
    stroke-width: 2px;
    flex-shrink: 0;
    transition: transform 0.15s ease;
}
.lock-combo-icon {
    width: 18px;
    height: 18px;
}
.toolbar-icon-button .lock-combo-icon {
    margin-right: 5px;
}
.opt-button .svg-icon,
.toolbar-icon-button .svg-icon,
.dropdown-item .svg-icon {
    margin-right: 4px;
}
.toolbar-icon-button .svg-icon {
    margin-right: 0;
}

.dropdown-trigger {
    display: inline-flex !important;
    align-items: center;
    gap: 4px;
}
.btn-label {
    margin-left: 4px;
    display: inline;
}

/* Dropdown Menu */
.dropdown-container {
    position: relative;
    display: inline-block;
}
.dropdown-menu {
    position: absolute;
    bottom: calc(100% + 8px);
    left: 0;
    z-index: 1060;
    min-width: 170px;
    background: var(--toolbar-bg, #fff);
    border: 1px solid var(--toolbar-border, #d0d7de);
    border-radius: 6px;
    box-shadow: 0 8px 24px rgba(140, 149, 159, 0.16);
    padding: 6px 0;
    display: none;
    flex-direction: column;
    animation: dropdownFadeIn 0.15s cubic-bezier(0.16, 1, 0.3, 1);
}
.share-menu-published,
.share-menu-unpublished {
    display: flex;
    flex-direction: column;
}
.share-menu-published[hidden],
.share-menu-unpublished[hidden] {
    display: none;
}
.dropdown-container.show .dropdown-menu {
    display: flex;
}
.dropdown-menu.floating-menu-open {
    display: flex;
    z-index: 20020;
}
.dropdown-item {
    display: flex;
    align-items: center;
    width: 100%;
    padding: 8px 12px;
    font-size: 13px;
    color: var(--toolbar-text, #24292f);
    background: transparent;
    border: 0;
    text-align: left;
    cursor: pointer;
    text-decoration: none;
    box-sizing: border-box;
    gap: 6px;
}
.dropdown-item:hover {
    background: var(--toolbar-bg-hover, #f5f0e8);
}
.dropdown-item:hover:not(.dropdown-danger-item) {
    color: var(--toolbar-accent);
}
.dropdown-item-toggle {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 6px 12px;
    font-size: 13px;
    color: var(--toolbar-text, #24292f);
}
.dropdown-divider {
    height: 1px;
    background-color: var(--toolbar-border, #d0d7de);
    margin: 6px 0;
}
.dropdown-danger-item {
    color: var(--toolbar-danger, #cf222e);
}
.dropdown-danger-item:hover {
    background: #ffebe9;
    color: var(--toolbar-danger, #cf222e);
}
@keyframes dropdownFadeIn {
    from { opacity: 0; transform: translateY(4px); }
    to { opacity: 1; transform: translateY(0); }
}

/* Share Dropdown Specifics */
.share-dropdown .dropdown-menu {
    min-width: 220px;
}

/* Share button: icon control */
.footer-section-publish .toolbar-button-label {
    display: none !important;
}
.footer-section-publish .toolbar-icon-button {
    width: var(--toolbar-height) !important;
    padding: 0 !important;
}

/* Share dropdown: direct link + menu trigger */
.share-dropdown {
    display: inline-flex;
    align-items: center;
    gap: 0;
}
.share-direct-link {
    border-radius: 6px 0 0 6px !important;
    border-right: 1px solid var(--toolbar-border, #e6dfd8) !important;
}
.share-menu-trigger {
    width: 28px !important;
    padding: 0 !important;
    border-radius: 0 6px 6px 0 !important;
    display: inline-flex !important;
    align-items: center;
    justify-content: center;
}
.share-menu-trigger .toolbar-button-label {
    display: none !important;
}

/* Mobile more button: hidden on desktop, shown on mobile */
.mobile-more-btn {
    display: none !important;
}

/* Shared state indicator: green dot */
.share-dropdown .dropdown-trigger::after {
    content: '';
    position: absolute;
    top: 6px;
    right: 6px;
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: #2da44e;
    border: 1.5px solid var(--toolbar-bg, #faf9f5);
}
.share-dropdown {
    position: relative;
}
.share-state-toggle {
    display: flex;
    align-items: center;
    gap: 2px;
    padding: 0;
}
.share-state-switcher {
    --rail-checked-bg: var(--toolbar-success);
    flex-shrink: 0;
}
.share-menu-small {
    padding: 2px 4px;
    min-width: auto;
}

.selection-ai-menu {
    position: fixed;
    z-index: 20010;
    display: none;
    align-items: center;
    gap: 5px;
    padding: 4px;
    border: 1px solid #b95f42;
    border-radius: 8px;
    background: #24221f;
    box-shadow: 0 8px 24px rgba(37, 35, 32, 0.24);
}
.selection-ai-menu.visible {
    display: inline-flex;
}
.selection-ai-button {
    appearance: none;
    border: 0;
    padding: 7px 11px;
    border-radius: 5px;
    background: transparent;
    color: #fff;
    font-size: 12px;
    font-weight: 700;
    line-height: 1;
    cursor: pointer;
}
.selection-ai-button:hover {
    background: #cc785c;
}

/* Bottom Sheet (Mobile) */
.bottom-sheet {
    position: fixed;
    inset: 0;
    z-index: 1050;
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
    pointer-events: none;
}
.bottom-sheet.show {
    pointer-events: auto;
}
.bottom-sheet-backdrop {
    position: absolute;
    inset: 0;
    background: rgba(37, 35, 32, 0.4);
    backdrop-filter: blur(2px);
    opacity: 0;
    transition: opacity 0.25s ease;
    pointer-events: none;
}
.bottom-sheet.show .bottom-sheet-backdrop {
    opacity: 1;
    pointer-events: auto;
}
.bottom-sheet-content {
    position: relative;
    background: #faf9f5;
    border-radius: 16px 16px 0 0;
    box-shadow: 0 -8px 30px rgba(108, 106, 100, 0.15);
    width: 100%;
    max-height: 80dvh;
    display: flex;
    flex-direction: column;
    transform: translateY(100%);
    transition: transform 0.28s cubic-bezier(0.32, 0.94, 0.6, 1);
    z-index: 1;
}
.bottom-sheet.show .bottom-sheet-content {
    transform: translateY(0);
}
.bottom-sheet-drag-handle {
    width: 36px;
    height: 4px;
    background: var(--toolbar-border, #d0d7de);
    border-radius: 2px;
    margin: 8px auto 0;
    cursor: grab;
}
.bottom-sheet-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px 16px 8px;
    border-bottom: 1px solid var(--toolbar-border, #d0d7de);
}
.bottom-sheet-header h3 {
    margin: 0;
    font-size: 15px;
    font-weight: 600;
    color: var(--toolbar-text, #24292f);
}
.bottom-sheet-close-btn {
    background: transparent;
    border: 0;
    color: var(--toolbar-muted, #57606a);
    padding: 4px;
    cursor: pointer;
    display: flex;
    align-items: center;
}
.bottom-sheet-body {
    padding: 16px 16px calc(16px + env(safe-area-inset-bottom));
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    gap: 16px;
    touch-action: pan-y;
}
.bottom-sheet-body .footer-section {
    width: 100%;
    flex-wrap: wrap;
    align-items: flex-start;
    border-right: 0;
    border-bottom: 1px solid var(--toolbar-border, #d8dee4);
    padding: 0 0 16px;
}
.bottom-sheet-body .footer-section:last-child {
    border-bottom: 0;
    padding-bottom: 0;
}
.bottom-sheet-body .footer-section-body {
    width: 100%;
    flex-wrap: wrap;
    gap: 10px;
}

/* Toast System */
#toast-container {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    z-index: 20000;
    display: flex;
    flex-direction: column;
    gap: 8px;
    pointer-events: none;
    width: min(520px, calc(100vw - 32px));
    align-items: center;
}
.toast {
    background: rgba(20, 20, 19, 0.95);
    border: 1px solid rgba(230, 223, 216, 0.15);
    backdrop-filter: blur(8px);
    color: #fff;
    padding: 10px 18px;
    border-radius: 8px;
    font-size: 13px;
    font-weight: 500;
    box-shadow: 0 8px 24px rgba(108, 106, 100, 0.15);
    display: flex;
    align-items: center;
    gap: 6px;
    max-width: 100%;
    text-align: center;
    opacity: 0;
    transform: translateY(-8px);
    transition: opacity 0.22s ease, transform 0.22s ease;
}
.toast.show {
    opacity: 1;
    transform: translateY(0);
}
.toast-check {
    font-weight: bold;
    margin-right: 2px;
    color: #cc785c;
}

/* Footer */
.footer {
    font-weight: bold;
    min-height: 48px;
    background: var(--footer-bg, #faf9f5);
    border-top: 1px solid var(--footer-border, #e6dfd8);
    display: block;
    padding: 0 12px;
    font-size: 13px;
    color: var(--footer-text, #5c5a54);
    position: relative;
    z-index: 100;
    overflow-x: auto;
    scrollbar-width: none;
    -webkit-overflow-scrolling: touch;
    transition: transform 0.22s ease, opacity 0.22s ease, background-color 0.2s ease, color 0.2s ease, border-color 0.2s ease;
}
.footer::-webkit-scrollbar {
    display: none;
}
.footer-sections {
    min-height: 48px;
    display: flex;
    align-items: stretch;
    gap: 10px;
    flex-wrap: nowrap;
    white-space: nowrap;
    padding: 5px 0 6px;
}
.footer-section {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 4px 10px 4px 0;
    border-right: 1px solid var(--footer-border, #e6dfd8);
    background: transparent;
}
.footer-section:last-child {
    border-right: 0;
    padding-right: 0;
}
.footer-section-edit {
    flex: 0 0 auto;
}
.footer-section-publish {
    flex: 0 0 auto;
}
.footer-section-appearance {
    flex: 1 1 auto;
    min-width: max-content;
}
.footer-section-info {
    flex: 0 0 auto;
}
.footer-section-body {
    display: flex;
    align-items: center;
    gap: 6px;
    flex-wrap: nowrap;
}
.footer-select {
    display: inline-block;
    width: auto;
    font-size: 12px;
    vertical-align: middle;
    --wa-input-border-radius: var(--toolbar-radius);
}
.footer-select::part(combobox) {
    height: var(--toolbar-height);
    min-height: var(--toolbar-height);
    border-color: var(--toolbar-border);
    border-radius: var(--toolbar-radius);
    background: var(--toolbar-bg);
    color: var(--toolbar-text);
    transition: border-color 0.15s ease, background-color 0.15s ease;
}
.footer-select::part(display-input) {
    font-size: 12px;
    color: var(--toolbar-text);
}
.footer-select::part(icon) {
    color: var(--toolbar-text);
}
.footer-select::part(listbox) {
    width: min(360px, calc(100vw - 16px));
    max-width: calc(100vw - 16px);
    overflow-x: hidden;
}
.footer-select::part(combobox):hover {
    background-color: var(--toolbar-bg-hover);
    border-color: var(--toolbar-accent);
}
#preview-width-selector {
    width: 112px;
    max-width: 112px;
}
#theme-selector {
    width: auto;
    min-width: 104px;
    max-width: 130px;
}
.footer-control-group {
    display: inline-flex;
    flex-direction: column;
    align-items: center;
    gap: 1px;
}
#share-analytics-hook {
    display: inline-flex;
    align-items: center;
}
.share-view-count {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    height: var(--toolbar-height);
    padding: 0 8px;
    color: var(--toolbar-text);
    font-size: 12px;
    white-space: nowrap;
}
.share-view-count .svg-icon {
    width: 15px;
    height: 15px;
}
.footer-toggle-control-group {
    height: var(--toolbar-height);
    justify-content: center;
}
#language-selector,
#share-font-selector {
    display: inline-flex;
    align-items: center;
    height: var(--toolbar-height);
    line-height: 0;
}
.footer-view-settings-group {
    display: inline-flex;
    align-items: center;
    gap: 0; /* Primer button group collapses gap */
    height: var(--toolbar-height);
    padding: 0;
    border: 0;
    background: transparent;
}
.footer-view-settings-group .footer-control-group {
    display: inline-flex;
    gap: 0;
}
.footer-view-settings-group .footer-rail-switch {
    border-radius: 0;
    margin-right: -1px;
}
.footer-view-settings-group > :first-child .footer-rail-switch {
    border-top-left-radius: 4px;
    border-bottom-left-radius: 4px;
}
.footer-view-settings-group > :last-child .footer-rail-switch {
    border-top-right-radius: 4px;
    border-bottom-right-radius: 4px;
    margin-right: 0;
}
.footer-view-settings-group .footer-rail-switch:hover,
.footer-view-settings-group .footer-rail-switch:focus-visible,
.footer-view-settings-group .footer-rail-switch.is-checked {
    z-index: 1;
}
.footer-control-label {
    font-size: 10px;
    font-weight: 600;
    color: var(--toolbar-muted, #6c6a64);
    line-height: 1;
    pointer-events: none;
}
.save-control-group {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 2px 4px;
    border: 1px solid var(--toolbar-border, #e6dfd8);
    border-radius: var(--toolbar-radius, 6px);
    background: color-mix(in srgb, var(--toolbar-bg, #faf9f5) 92%, var(--toolbar-accent, #cc785c));
}
.autosave-toggle-label {
    display: inline-flex;
    align-items: center;
    gap: 3px;
    min-height: var(--toolbar-height);
    padding: 0 4px;
    color: var(--toolbar-muted, #6c6a64);
    font-size: 10px;
    font-weight: 600;
    line-height: 1;
    white-space: nowrap;
    cursor: pointer;
}
.autosave-toggle-label input {
    margin: 0;
    accent-color: var(--toolbar-accent, #cc785c);
}
.autosave-toggle-label input:disabled {
    cursor: not-allowed;
}

/* Thumb-free 3D Flip Card Toggle Switch */
.footer-rail-switch {
    perspective: 400px;
    position: relative;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: var(--toolbar-height);
    height: var(--toolbar-height);
    padding: 0;
    border: 1px solid var(--toolbar-border, #e2dacd);
    border-radius: 4px;
    background: transparent;
    color: var(--toolbar-text, #2c2a29);
    cursor: pointer;
    box-sizing: border-box;
}
.footer-rail-switch:focus-visible {
    outline: 2px solid var(--toolbar-accent, #c8654b);
    outline-offset: 1px;
}

.footer-rail-switch .btn-flip-front,
.footer-rail-switch .btn-flip-back {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
    backface-visibility: hidden;
    transition: transform 0.24s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.2s ease;
    border-radius: inherit;
    padding: 0 8px;
    gap: 4px;
    background: var(--toolbar-bg-hover, #eae3d5);
    box-sizing: border-box;
}

.footer-rail-switch .btn-flip-front {
    position: relative;
    transform: rotateY(0deg);
}

.footer-rail-switch .btn-flip-back {
    position: absolute;
    inset: 0;
    background: var(--toolbar-accent, #c8654b);
    color: #ffffff;
    transform: rotateY(-180deg);
}

.footer-rail-switch.is-checked .btn-flip-front {
    transform: rotateY(180deg);
    opacity: 0;
}
.footer-rail-switch.is-checked .btn-flip-back {
    transform: rotateY(0deg);
    opacity: 1;
}

.footer-rail-switch .footer-rail-value {
    font-size: 11px;
    font-weight: 700;
    line-height: 1;
    white-space: nowrap;
}
.footer-rail-switch .footer-rail-icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
}
.footer-rail-switch .svg-icon {
    width: 13px;
    height: 13px;
    stroke-width: 2.2;
}


/* Body-level floating tooltip: remains visible outside horizontal scrollers. */
.floating-tooltip {
    position: fixed;
    z-index: 20030;
    max-width: calc(100vw - 16px);
    padding: 4px 8px;
    background: var(--tooltip-bg, #2c2a29);
    color: var(--tooltip-text, #f9f6f0);
    font-size: 11px;
    font-weight: 600;
    line-height: 1.2;
    white-space: nowrap;
    border-radius: 5px;
    box-shadow: 0 4px 14px rgba(0, 0, 0, 0.22);
    pointer-events: none;
    animation: floatingTooltipIn 0.1s ease-out;
}
.floating-tooltip[hidden] {
    display: none;
}
@keyframes floatingTooltipIn {
    from { opacity: 0; transform: translateY(3px) scale(0.96); }
    to { opacity: 1; transform: translateY(0) scale(1); }
}

.share-font-toggle {
    display: inline-flex;
    align-items: center;
}
.share-font-switch {
    width: 62px;
}
.share-font-switch.is-checked .footer-rail-thumb {
    transform: translateX(34px);
}
#split-direction-selector .footer-rail-switch {
    width: 58px;
}
#split-direction-selector .footer-rail-switch.is-checked .footer-rail-thumb {
    transform: translateX(30px);
}
.preview-device-toggle {
    width: 70px;
}
.preview-device-toggle.is-checked .footer-rail-thumb {
    transform: translateX(42px);
}
.footer-select:hover {
    cursor: pointer;
}
.footer-select:focus-visible {
    outline: 2px solid var(--toolbar-accent);
    outline-offset: 1px;
}
.segmented-toggle {
    display: inline-flex;
    align-items: center;
    height: var(--toolbar-height);
    border: 1px solid var(--toolbar-border);
    border-radius: var(--toolbar-radius);
    background: var(--toolbar-bg);
    overflow: hidden;
}
.segmented-toggle-btn {
    min-width: 34px;
    height: calc(var(--toolbar-height) - 2px);
    padding: 0 8px;
    border: 0;
    border-right: 1px solid var(--toolbar-border);
    background: transparent;
    color: var(--toolbar-muted);
    cursor: pointer;
    font-size: 12px;
    font-weight: 600;
    line-height: calc(var(--toolbar-height) - 2px);
    transition: background-color 0.15s ease, color 0.15s ease;
}
.segmented-toggle-btn:last-child {
    border-right: 0;
}
.segmented-toggle-btn:hover {
    background: var(--toolbar-bg-hover);
    color: var(--toolbar-text);
}
.segmented-toggle-btn.active {
    background: var(--toolbar-bg-active);
    color: #fff;
}
.segmented-toggle-btn:focus-visible {
    position: relative;
    z-index: 1;
    outline: 2px solid #0969da;
    outline-offset: -2px;
}
.preview-device-toggle .segmented-toggle-btn {
    min-width: 48px;
}
.footer-label {
    font-size: 12px;
    color: #586069;
    white-space: nowrap;
    margin-right: 4px;
}
.opt-button {
    height: var(--toolbar-height);
    min-width: var(--toolbar-height);
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 5px;
    padding: 0 10px;
    border: 1px solid var(--toolbar-border);
    border-radius: var(--toolbar-radius);
    background: var(--toolbar-bg);
    color: var(--toolbar-text);
    cursor: pointer;
    font-size: 12px;
    font-weight: 650;
    line-height: 1;
    text-decoration: none;
    transition: background 0.12s ease, border-color 0.12s ease, color 0.12s ease, transform 0.08s ease;
}
.opt-button:active,
.toolbar-icon-button:active {
    transform: scale(0.95);
}
.opt-button:hover,
.toolbar-icon-button:hover {
    background: var(--toolbar-bg-hover);
    border-color: #afb8c1;
}
.opt-button:focus-visible,
.toolbar-icon-button:focus-visible {
    outline: 2px solid var(--toolbar-accent);
    outline-offset: 1px;
}
.opt-button:disabled,
.toolbar-icon-button:disabled {
    cursor: not-allowed;
    color: #8c959f;
    background: #f6f8fa;
}
.opt-button-icon {
    width: var(--toolbar-height);
    padding: 0;
    font-size: 14px;
}
.toolbar-icon-button,
.toolbar-icon-link {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    height: var(--toolbar-height);
    width: var(--toolbar-height);
    min-width: var(--toolbar-height);
    padding: 0;
    font-size: 14px;
    box-sizing: border-box;
    border-radius: 4px;
    background: transparent;
    border: 1px solid var(--toolbar-border, #e2dacd);
    color: var(--toolbar-text, #2c2a29);
    transition: background-color 0.16s ease, border-color 0.16s ease, color 0.16s ease, transform 0.1s ease;
}
.toolbar-icon-button:hover,
.toolbar-icon-link:hover {
    background: var(--toolbar-bg-hover, #eae3d5);
    color: var(--toolbar-accent, #c8654b);
    border-color: var(--toolbar-accent, #c8654b);
}

.toolbar-button-label {
    display: none !important;
}

.copy-button-icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-height: 14px;
}
.copy-button-icon-success { display: none; }
.copy-md-button.copy-success {
    color: var(--toolbar-success, #1a7f37);
    border-color: var(--toolbar-success, #1a7f37);
    background: color-mix(in srgb, var(--toolbar-success, #1a7f37) 12%, var(--toolbar-bg, #fff));
}
.copy-md-button.copy-success .copy-button-icon-default { display: none; }
.copy-md-button.copy-success .copy-button-icon-success { display: inline-flex; }
.copy-md-button.copy-success .toolbar-button-label { color: var(--toolbar-success, #1a7f37); }
.copy-md-button.copy-success .copy-button-icon-success .svg-icon {
    animation: copy-check-pop 240ms ease-out;
}
@keyframes copy-check-pop {
    0% { transform: scale(0.55); opacity: 0.25; }
    70% { transform: scale(1.16); opacity: 1; }
    100% { transform: scale(1); opacity: 1; }
}
.opt-button-accent {
    color: var(--toolbar-accent);
}
.opt-button-accent:hover {
    border-color: #8cbbf7;
    background: #ddf4ff;
}
.toolbar-danger-button {
    color: var(--toolbar-danger);
}
.toolbar-danger-button:hover {
    border-color: #ffb3ad;
    background: #ffebe9;
}
.toolbar-active-button {
    border-color: #8cbbf7;
    background: #ddf4ff;
    color: var(--toolbar-accent);
}
.opt-switcher {
    height: var(--toolbar-height);
    display: inline-flex;
    align-items: center;
    gap: 7px;
    cursor: pointer;
    padding: 0 8px;
    border: 1px solid var(--toolbar-border);
    border-radius: var(--toolbar-radius);
    background: var(--toolbar-bg);
    color: var(--toolbar-muted);
    font-size: 12px;
    font-weight: 650;
}
.opt-switcher:hover {
    background: var(--toolbar-bg-hover);
}
.opt-switcher input { display: none; }
.opt-switcher .slider {
    width: 32px;
    height: 16px;
    background: #d8dee4;
    border-radius: 16px;
    position: relative;
    transition: background 0.16s ease;
}
.opt-switcher .slider:before {
    content: "";
    position: absolute;
    height: 12px;
    width: 12px;
    left: 2px;
    bottom: 2px;
    background: white;
    border-radius: 50%;
    transition: transform 0.16s ease;
    box-shadow: 0 1px 2px rgba(31, 35, 40, 0.25);
}
.opt-switcher input:checked + .slider { background: var(--toolbar-success); }
.opt-switcher input:checked + .slider:before { transform: translateX(16px); }
.opt-share-link {
    height: var(--toolbar-height);
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 0 4px 0 8px;
    border: 1px solid #9be9a8;
    border-radius: var(--toolbar-radius);
    background: #dafbe1;
}
.publish-status {
    color: #116329;
    font-size: 12px;
    font-weight: 650;
    line-height: 1;
}
.share-url-link {
    min-width: 0;
    height: calc(var(--toolbar-height) - 2px);
    display: inline-flex;
    align-items: center;
    gap: 5px;
    padding: 0 10px;
    border-radius: calc(var(--toolbar-radius) - 1px);
    background: rgba(255, 255, 255, 0.65);
    color: var(--toolbar-accent);
    font-size: 12px;
    font-weight: 650;
    text-decoration: none;
}
.share-url-link:hover {
    background: #fff;
    text-decoration: none;
}
.public-index-btn {
    min-width: 68px;
    padding: 0 8px;
    font-size: 11px;
}
.share-font-toggle .segmented-toggle-btn {
    min-width: 28px;
    padding: 0 7px;
}
.share-history-trigger,
.note-history-trigger {
    color: var(--toolbar-accent);
}
.share-history-trigger:hover,
.note-history-trigger:hover {
    border-color: #8cbbf7;
    background: #ddf4ff;
}
.toolbar-icon-link,
.github-link,
.doc-link {
    height: var(--toolbar-height);
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 5px;
    padding: 0 8px;
    border: 1px solid transparent;
    border-radius: var(--toolbar-radius);
    color: var(--toolbar-text);
    text-decoration: none;
    font-size: 13px;
    font-weight: 650;
}
.toolbar-icon-link {
    width: auto;
    min-width: var(--toolbar-height);
    padding: 1px 7px;
    border: 1px solid transparent;
    display: inline-flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 1px;
    font-size: 14px;
}
.toolbar-icon-link:hover {
    border-color: var(--toolbar-border);
    background: var(--toolbar-bg-hover);
}
.ui-theme-toggle-btn .ui-theme-icon-sun {
    display: none;
}
.ui-theme-toggle-btn .ui-theme-icon-moon {
    display: inline-flex;
}
.ui-theme-toggle-btn.is-dark .ui-theme-icon-sun {
    display: inline-flex;
}
.ui-theme-toggle-btn.is-dark .ui-theme-icon-moon {
    display: none;
}
.sr-only,
.visually-hidden-file-input {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
}
.share-history-content {
    position: fixed;
    right: 24px;
    bottom: 76px;
    z-index: 1001;
    width: min(440px, calc(100vw - 32px));
    max-height: min(520px, calc(100dvh - 112px));
    display: flex;
    flex-direction: column;
    gap: 12px;
    padding: 18px;
    border: 1px solid #d0d7de;
    border-radius: 12px;
    background: #fff;
    color: #24292f;
    box-shadow: 0 18px 44px rgba(31, 35, 40, 0.2);
}
.share-history-content h2 {
    margin: 0 28px 0 0;
    font-size: 17px;
    line-height: 1.35;
}
.share-history-close {
    position: absolute;
    top: 10px;
    right: 12px;
    border: 0;
    background: transparent;
    color: #6e7781;
    cursor: pointer;
    font-size: 18px;
}
.share-history-tabs {
    display: flex;
    padding: 3px;
    border: 1px solid #d0d7de;
    border-radius: 8px;
    background: #f6f8fa;
}
.share-history-tab {
    flex: 1;
    border: 0;
    border-radius: 6px;
    background: transparent;
    color: #57606a;
    cursor: pointer;
    font-size: 13px;
    font-weight: 700;
    padding: 7px 10px;
}
.share-history-tab.active {
    background: #24292f;
    color: #fff;
}
.share-history-list {
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    gap: 8px;
    flex: 1;
}
.share-history-empty {
    margin: 8px 0 4px;
    color: #6e7781;
    font-size: 13px;
    line-height: 1.6;
}
.share-history-item {
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
    gap: 6px 10px;
    padding: 10px;
    border: 1px solid #d8dee4;
    border-radius: 8px;
    background: #fff;
}
.share-history-link {
    min-width: 0;
    color: #0969da;
    font-size: 13px;
    font-weight: 700;
    line-height: 1.4;
    overflow: hidden;
    text-decoration: none;
    text-overflow: ellipsis;
    white-space: nowrap;
}
.share-history-link:hover {
    text-decoration: underline;
}
.share-history-meta {
    grid-column: 1 / -1;
    color: #6e7781;
    font-size: 11px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}
.share-history-copy {
    border: 1px solid #d0d7de;
    border-radius: 6px;
    background: #f6f8fa;
    color: #24292f;
    cursor: pointer;
    font-size: 12px;
    padding: 4px 8px;
}
.share-history-copy:hover {
    background: #eef1f4;
}
.note-history-content {
    position: fixed;
    right: 24px;
    bottom: 76px;
    z-index: 1001;
    width: min(920px, calc(100vw - 32px));
    max-height: min(680px, calc(100dvh - 112px));
    display: flex;
    flex-direction: column;
    gap: 12px;
    padding: 18px;
    border: 1px solid #d0d7de;
    border-radius: 12px;
    background: #fff;
    color: #24292f;
    box-shadow: 0 18px 44px rgba(31, 35, 40, 0.2);
}
.note-history-content h2 {
    margin: 0 28px 0 0;
    font-size: 17px;
    line-height: 1.35;
}
.note-history-close {
    position: absolute;
    top: 10px;
    right: 12px;
    border: 0;
    background: transparent;
    color: #6e7781;
    cursor: pointer;
    font-size: 18px;
}
.note-history-toolbar {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 8px;
}
.note-history-render-toggle {
    margin-right: auto;
}
.note-history-layout {
    min-height: 0;
    display: grid;
    grid-template-columns: minmax(220px, 280px) minmax(0, 1fr);
    gap: 12px;
    flex: 1;
}
.note-history-list {
    min-height: 0;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    gap: 8px;
    padding-right: 4px;
}
.note-history-entry {
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 5px;
    padding: 10px;
    border: 1px solid #d8dee4;
    border-radius: 8px;
    background: #fff;
    color: #24292f;
    cursor: pointer;
    text-align: left;
}
.note-history-entry:hover {
    border-color: #0969da;
    background: #f6f8fa;
}
.note-history-entry.active {
    border-color: #0969da;
    background: #edf4ff;
}
.note-history-entry-title {
    color: #0969da;
    font-size: 13px;
    font-weight: 700;
    line-height: 1.45;
}
.note-history-entry-preview {
    color: #57606a;
    font-size: 12px;
    line-height: 1.5;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
}
.note-history-entry-meta {
    color: #6e7781;
    font-size: 11px;
    line-height: 1.4;
}
.note-history-viewer {
    min-width: 0;
    min-height: 0;
    display: flex;
    flex-direction: column;
    border: 1px solid #d8dee4;
    border-radius: 10px;
    background: #f6f8fa;
    overflow: hidden;
}
.note-history-viewer-header {
    display: flex;
    flex-direction: column;
    gap: 2px;
    padding: 12px 14px;
    border-bottom: 1px solid #d8dee4;
    background: #fff;
}
.note-history-viewer-header strong {
    color: #24292f;
    font-size: 13px;
    line-height: 1.45;
}
.note-history-viewer-header span {
    color: #6e7781;
    font-size: 11px;
    line-height: 1.4;
}
.note-history-body {
    min-height: 0;
    flex: 1;
    overflow: auto;
    padding: 14px;
    background: #fff;
    color: #24292f;
    font-size: 13px;
    line-height: 1.65;
    white-space: pre-wrap;
    overflow-wrap: anywhere;
}
.note-history-body.markdown-body {
    white-space: normal;
}
.note-history-status {
    color: #6e7781;
}
.note-history-status.error {
    color: #cf222e;
}
@media (max-width: 860px) {
    .note-history-layout {
        grid-template-columns: 1fr;
    }
    .note-history-list {
        max-height: 220px;
    }
}
@media (max-width: 640px) {
    .share-history-content,
    .note-history-content {
        right: 12px;
        left: 12px;
        bottom: 68px;
        width: auto;
        max-height: calc(100dvh - 92px);
        padding: 14px;
    }
    .note-history-toolbar > * {
        width: 100%;
    }
}
.share-back-to-top {
    position: fixed;
    right: 22px;
    bottom: 78px;
    z-index: 130;
    width: 38px;
    height: 38px;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 1px solid rgba(208, 215, 222, 0.92);
    border-radius: 999px;
    background: rgba(36, 41, 47, 0.86);
    color: #fff;
    cursor: pointer;
    font-size: 20px;
    line-height: 1;
    opacity: 0;
    pointer-events: none;
    transform: translateY(8px);
    transition: opacity 0.18s ease, transform 0.18s ease, background 0.18s ease;
    box-shadow: 0 10px 24px rgba(31, 35, 40, 0.18);
}
.share-back-to-top:hover {
    background: rgba(9, 105, 218, 0.92);
}
.share-back-to-top.visible {
    opacity: 1;
    pointer-events: auto;
    transform: translateY(0);
}
.opt,
.share-footer-actions,
.footer-spacer,
.footer-controls {
    display: contents;
}

.preview-pane {
    flex: 1;
    min-width: 0;
    height: 100%;
    display: flex;
    overflow: hidden;
    background: #fff;
}

.preview-pane > .contents {
    width: 100%;
}

.reading-progress-host { position: relative; }
.reading-progress {
    position: absolute;
    top: 18px;
    left: 8px;
    z-index: 15;
    display: grid;
    justify-items: center;
    gap: 5px;
    color: rgba(87, 96, 106, 0.82);
    opacity: 0.72;
    transition: opacity 0.16s ease;
}
.reading-progress:hover,
.reading-progress:focus-within { opacity: 1; }
.reading-progress.is-hidden { display: none; }
.reading-progress-track {
    position: relative;
    width: 16px;
    height: 96px;
    padding: 0;
    border: 0;
    border-radius: 999px;
    background: rgba(87, 96, 106, 0.16);
    cursor: pointer;
}
.reading-progress-track:focus-visible { outline: 2px solid #0969da; outline-offset: 2px; }
.reading-progress-indicator {
    position: absolute;
    top: var(--reading-progress, 0%);
    left: 50%;
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: currentColor;
    box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.8);
    transform: translate(-50%, -50%);
}
.reading-progress-value {
    min-width: 28px;
    color: inherit;
    font: 10px/1 var(--editor-font-family);
    text-align: center;
}
body.share-view .reading-progress {
    position: fixed;
    top: 50%;
    transform: translateY(-50%);
}

@media (max-width: 640px) {
    .reading-progress { top: 10px; left: 4px; }
    .reading-progress-track { height: 72px; }
}

@media (min-width: 961px) {
    body.preview-split-vertical:not(.share-view) .layer_3 {
        flex-direction: column;
    }
    body.preview-split-vertical:not(.share-view) .divide-line {
        width: 100%;
        height: 8px;
        min-height: 8px;
        cursor: row-resize;
        border-left: 0;
        border-right: 0;
        border-top: 1px solid #e1e4e8;
        border-bottom: 1px solid #e1e4e8;
    }
    body.preview-split-vertical:not(.share-view) textarea.contents,
    body.preview-split-vertical:not(.share-view) .preview-pane {
        width: 100%;
        height: 50%;
        min-height: 0;
    }
}

body.preview-device-mobile:not(.share-view) .preview-pane {
    align-items: center;
    justify-content: center;
    padding: 16px;
    background: #161b22;
}

body.preview-device-mobile:not(.share-view) #preview-md.contents,
body.preview-device-mobile:not(.share-view) #preview-plain.contents {
    flex: 0 0 390px;
    width: min(390px, calc(100% - 32px));
    max-width: 390px;
    height: 100%;
    margin: 0;
    padding: 34px 18px 24px;
    border: 10px solid #24292f;
    border-radius: 34px;
    box-shadow: 0 16px 40px rgba(31, 35, 40, 0.28);
    overflow-y: auto;
}

body.preview-device-mobile:not(.share-view) #preview-md.contents::before,
body.preview-device-mobile:not(.share-view) #preview-plain.contents::before {
    content: "";
    position: sticky;
    top: -24px;
    display: block;
    width: 72px;
    height: 8px;
    margin: -18px auto 16px;
    border-radius: 999px;
    background: #24292f;
}

body.preview-device-mobile:not(.share-view) #preview-md.markdown-body,
body.preview-device-mobile:not(.share-view) #preview-plain.markdown-body {
    font-size: 15px;
    line-height: 1.72;
}

body.preview-device-mobile:not(.share-view) #preview-md.markdown-body h1,
body.preview-device-mobile:not(.share-view) #preview-plain.markdown-body h1 {
    font-size: 1.8em;
}

body.preview-device-mobile:not(.share-view) #preview-md.markdown-body table,
body.preview-device-mobile:not(.share-view) #preview-plain.markdown-body table {
    display: table !important;
    width: 100% !important;
    min-width: 0 !important;
    max-width: 100% !important;
    table-layout: fixed !important;
    overflow: hidden !important;
    font-size: 11px !important;
}

body.preview-device-mobile:not(.share-view) #preview-md.markdown-body th,
body.preview-device-mobile:not(.share-view) #preview-md.markdown-body td,
body.preview-device-mobile:not(.share-view) #preview-plain.markdown-body th,
body.preview-device-mobile:not(.share-view) #preview-plain.markdown-body td {
    min-width: 0 !important;
    padding: 6px 5px !important;
    white-space: normal !important;
    overflow-wrap: anywhere !important;
    word-break: break-word !important;
}

body.preview-device-mobile:not(.share-view) #preview-md.markdown-body td code,
body.preview-device-mobile:not(.share-view) #preview-md.markdown-body th code,
body.preview-device-mobile:not(.share-view) #preview-plain.markdown-body td code,
body.preview-device-mobile:not(.share-view) #preview-plain.markdown-body th code {
    white-space: normal !important;
    overflow-wrap: anywhere !important;
    word-break: break-word !important;
}

body.preview-device-mobile:not(.share-view) #preview-md.markdown-body > pre,
body.preview-device-mobile:not(.share-view) #preview-md.markdown-body > table,
body.preview-device-mobile:not(.share-view) #preview-md.markdown-body > .media-preview {
    margin-left: -18px !important;
    margin-right: -18px !important;
    border-radius: 0 !important;
    width: calc(100% + 36px) !important;
    max-width: calc(100% + 36px) !important;
}

.mobile-ascii-diagram {
    width: 100%;
    overflow: hidden;
}

.mobile-ascii-diagram-inner {
    display: inline-block;
    transform-origin: top left;
    will-change: transform;
}

.mobile-ascii-diagram.is-scaled pre {
    overflow: visible !important;
}

/* Diagram Source - Hidden */
.diagram-source { display: none !important; }

/* Mermaid Renderer Specific Fixes */
.diagram-mermaid-render {
    line-height: normal;
    font-size: 14px;
    overflow-x: auto;
    overflow-y: visible;
}
.diagram-mermaid-render svg {
    display: block;
    max-width: 100%;
    height: auto;
    overflow: visible;
}
.diagram-mermaid-render text,
.diagram-mermaid-render tspan,
.diagram-mermaid-render .label {
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang TC", "PingFang SC", "Hiragino Sans GB", "Microsoft JhengHei", "Microsoft YaHei", "Noto Sans CJK TC", "Noto Sans CJK SC", "Source Han Sans TC", "Source Han Sans SC", Helvetica, Arial, sans-serif;
}

/* Presentation Mode Overlay */
#presentation-container {
    --presentation-safe-inline: 76px;
    --presentation-safe-top: 64px;
    --presentation-safe-bottom: 72px;
    position: fixed;
    inset: 0;
    z-index: 10000;
    width: 100vw;
    height: 100dvh;
    background: #070b12;
    display: none;
}
#presentation-container.active {
    display: block;
}
#presentation-close-btn {
    position: fixed;
    top: max(14px, env(safe-area-inset-top));
    right: max(14px, env(safe-area-inset-right));
    z-index: 10001;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-height: 40px;
    background: rgba(7, 11, 18, 0.78);
    color: white;
    border: 1px solid rgba(226, 232, 240, 0.38);
    padding: 8px 14px;
    border-radius: 999px;
    cursor: pointer;
    font-size: 14px;
    backdrop-filter: blur(10px);
    transition: all 0.2s;
}
#presentation-close-btn:hover {
    background: rgba(255, 255, 255, 0.3);
    transform: scale(1.05);
}
#presentation-container .reveal {
    width: 100%;
    height: 100%;
    font-size: 30px;
    color: #e2e8f0;
}

/* Slidev-Lite Theme Extensions */
#presentation-container.active {
    font-family: "GenJyuu Gothic CJK", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
    background:
        radial-gradient(circle at 50% 42%, rgba(30, 41, 59, 0.7) 0%, rgba(7, 11, 18, 0) 58%),
        #070b12;
}

#presentation-container .reveal .slides {
    box-sizing: border-box;
    overflow: hidden;
    border: 1px solid rgba(148, 163, 184, 0.34);
    border-radius: 12px;
    background: linear-gradient(145deg, #172236 0%, #111a2c 100%);
    box-shadow:
        0 28px 70px rgba(0, 0, 0, 0.38),
        0 0 0 1px rgba(255, 255, 255, 0.025) inset;
}

#presentation-container .reveal .slides section {
    width: 100%;
    height: 100%;
    text-align: left;
    font-family: "GenJyuu Gothic CJK", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
    color: #e2e8f0;
    line-height: 1.45;
    box-sizing: border-box;
    padding:
        var(--presentation-safe-top)
        var(--presentation-safe-inline)
        var(--presentation-safe-bottom) !important;
    overflow: hidden;
    scrollbar-width: thin;
    scrollbar-color: rgba(103, 232, 249, 0.6) transparent;
}

#presentation-container .reveal .slides section.presentation-slide-overflow {
    overflow-x: hidden;
    overflow-y: auto;
    padding-bottom: calc(var(--presentation-safe-bottom) + 36px) !important;
}

#presentation-container.presentation-authoring .reveal .slides section.presentation-slide-overflow::after {
    content: attr(data-overflow-label);
    position: sticky;
    left: 0;
    bottom: -24px;
    display: table;
    margin: 18px 0 0 auto;
    padding: 6px 10px;
    border: 1px solid rgba(251, 191, 36, 0.55);
    border-radius: 999px;
    background: rgba(120, 53, 15, 0.9);
    color: #fef3c7;
    font-size: 14px;
    line-height: 1.2;
    box-shadow: 0 6px 18px rgba(0, 0, 0, 0.22);
}

#presentation-container .reveal .slides section p,
#presentation-container .reveal .slides section li,
#presentation-container .reveal .slides section a,
#presentation-container .reveal .slides section code,
#presentation-container .reveal .slides section th,
#presentation-container .reveal .slides section td {
    overflow-wrap: anywhere;
    word-break: break-word;
}

#presentation-container .reveal blockquote {
    width: auto;
    margin: 0.6em 0 0.85em;
    padding: 0.7em 0.9em;
    border-left: 4px solid #67e8f9;
    border-radius: 0 8px 8px 0;
    background: rgba(148, 163, 184, 0.09);
    color: #dbe4f3;
    font-size: 0.78em;
    font-style: normal;
    line-height: 1.45;
}

#presentation-container .reveal blockquote p {
    margin: 0 0 0.35em;
}

#presentation-container .reveal blockquote p:last-child {
    margin-bottom: 0;
}

/* Custom Scrollbar for Code Blocks */
.reveal pre::-webkit-scrollbar {
    width: 8px;
    height: 8px;
}
.reveal pre::-webkit-scrollbar-track {
    background: #0f172a;
}
.reveal pre::-webkit-scrollbar-thumb {
    background: #334155;
    border-radius: 4px;
}
.reveal pre::-webkit-scrollbar-thumb:hover {
    background: #475569;
}

#presentation-container .reveal h1,
#presentation-container .reveal h2,
#presentation-container .reveal h3 {
    color: #fff;
    text-transform: none;
    font-weight: 700;
    letter-spacing: 0;
    line-height: 1.18;
    overflow-wrap: anywhere;
}

#presentation-container .reveal h1 {
    margin: 0 0 0.55em;
    font-size: 1.65em;
}

#presentation-container .reveal h2 {
    margin: 0.75em 0 0.45em;
    font-size: 1.35em;
}

#presentation-container .reveal h3 {
    margin: 0.65em 0 0.4em;
    font-size: 1.12em;
}

#presentation-container .reveal pre {
    max-width: 100%;
    max-height: 330px;
    overflow: auto;
    white-space: pre-wrap;
    background: #0f172a;
    border: 1px solid #334155;
    border-radius: 8px;
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
    padding: 1em;
}

#presentation-container .reveal code {
    font-family: "JetBrains Mono", "Maple Mono", monospace;
    font-size: 0.85em;
    color: #94a3b8;
}

#presentation-container .reveal section img,
#presentation-container .reveal section video,
#presentation-container .reveal section iframe,
#presentation-container .reveal section svg:not(.controls-arrow) {
    display: block;
    max-width: 100%;
    max-height: 380px;
    margin-inline: auto;
    object-fit: contain;
}

#presentation-container .reveal table {
    width: max-content;
    max-width: none;
    border-collapse: collapse;
    font-size: 0.72em;
    line-height: 1.22;
}

#presentation-container .reveal table th,
#presentation-container .reveal table td {
    padding: 0.32em 0.5em;
    white-space: normal;
}

.presentation-table-fit {
    display: block;
    max-width: 100%;
    overflow: visible;
    transform-origin: top left;
}

.presentation-table-fit.presentation-table-overflow {
    overflow-x: auto;
    overflow-y: hidden;
}

.presentation-table-fit table {
    margin: 0;
    transform-origin: top left;
}

/* Layouts */
.slidev-layout-two-cols {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 2em;
    align-items: start;
    width: 100%;
}

.col-left, .col-right {
    min-width: 0;
    width: 100%;
}

.presentation-orientation-hint {
    display: none;
}

.reveal .fragment.v-click {
    visibility: hidden;
}
.reveal .fragment.v-click.visible {
    visibility: visible;
}

@media (orientation: portrait) and (max-width: 720px) {
    #presentation-container .reveal {
        opacity: 0.08;
        pointer-events: none;
    }

    #presentation-container .presentation-orientation-hint {
        position: fixed;
        inset: 0;
        z-index: 10000;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 72px 28px;
        color: #f8fafc;
        font-size: 18px;
        line-height: 1.55;
        text-align: center;
    }
}

/* Tablets and smaller screens text labels hiding */
@media (max-width: 1024px) {
    .btn-label {
        display: none !important;
    }
    .opt-button .svg-icon,
    .toolbar-icon-button .svg-icon {
        margin-right: 0 !important;
    }
}

@media (max-width: 960px) {
    .desktop-split-control {
        display: none !important;
    }
    /* Show mobile more button */
    .mobile-more-btn {
        display: inline-flex !important;
    }
    body.keyboard-open:not(.share-view) .footer {
        display: none !important;
        pointer-events: none;
    }

    /* Mobile edit: stack editor + preview vertically */
    body:not(.share-view) .layer_3 {
        flex-direction: column !important;
    }
    body:not(.share-view) .divide-line {
        width: 100% !important;
        height: 8px !important;
        min-height: 8px !important;
        cursor: row-resize !important;
        border-left: 0 !important;
        border-right: 0 !important;
        border-top: 1px solid #e1e4e8 !important;
        border-bottom: 1px solid #e1e4e8 !important;
    }
    body:not(.share-view) .preview-pane {
        height: 50% !important;
        min-height: 0 !important;
    }

    /* Polaris Bleed-inspired full-width tables & code blocks on mobile */
    body.share-view #preview-md.markdown-body > pre,
    body.share-view #preview-md.markdown-body > table,
    body.share-view #preview-md.markdown-body > .media-preview,
    body:not(.share-view) #preview-md.markdown-body > pre,
    body:not(.share-view) #preview-md.markdown-body > table,
    body:not(.share-view) #preview-md.markdown-body > .media-preview {
        margin-left: -30px !important;
        margin-right: -30px !important;
        border-radius: 0 !important;
        width: calc(100% + 60px) !important;
        max-width: calc(100% + 60px) !important;
    }

    .footer {
        position: fixed;
        left: 0;
        right: 0;
        bottom: 0;
        z-index: 120;
        min-height: 56px !important;
        max-height: none !important;
        height: auto !important;
        border-top: 1px solid var(--toolbar-border) !important;
        border-left: 0 !important;
        border-right: 0 !important;
        border-bottom: 0 !important;
        border-radius: 0 !important;
        box-shadow: 0 -4px 20px rgba(108, 106, 100, 0.08) !important;
        background: var(--toolbar-bg, rgba(250, 249, 245, 0.95)) !important;
        backdrop-filter: blur(8px) !important;
        -webkit-backdrop-filter: blur(8px) !important;
        padding: 8px 12px calc(8px + env(safe-area-inset-bottom)) !important;
        overflow-x: auto !important;
        scrollbar-width: none !important;
        display: block !important;
        transition: transform 0.24s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.24s ease;
    }

    .footer::-webkit-scrollbar {
        display: none !important;
    }

    .footer.footer-hidden {
        opacity: 0;
        pointer-events: none;
        transform: translateY(100%);
    }

    .footer-sections {
        width: max-content !important;
        display: flex !important;
        flex-direction: row !important;
        flex-wrap: nowrap !important;
        gap: 10px !important;
        align-items: center !important;
        min-height: 0 !important;
        padding: 0 !important;
    }

    .footer-section {
        border-right: 1px solid var(--footer-border, #e6dfd8) !important;
        border-bottom: 0 !important;
        padding: 4px 10px 4px 0 !important;
        margin: 0 !important;
        width: auto !important;
        display: flex !important;
        align-items: center !important;
        background: transparent !important;
    }
    .footer-section:last-child {
        border-right: 0 !important;
    }

    .footer-section-edit,
    .footer-section-appearance,
    .footer-section-info {
        flex: 0 0 auto !important;
        width: auto !important;
        display: flex !important;
    }

    .mobile-more-btn {
        display: none !important;
    }

    .footer-section-edit .footer-section-body,
    .footer-section-appearance .footer-section-body,
    .footer-section-info .footer-section-body {
        display: flex !important;
        flex-wrap: nowrap !important;
        gap: 8px !important;
        justify-content: flex-start !important;
        align-items: center !important;
        width: auto !important;
    }

    body:not(.share-view) .footer-section-edit {
        min-width: 0 !important;
    }
    body:not(.share-view) .footer-section-edit .footer-section-body {
        flex-wrap: nowrap !important;
        justify-content: flex-start !important;
        gap: 6px !important;
        overflow: visible !important;
    }
    body:not(.share-view) .footer-section-edit .footer-section-body > * {
        display: inline-flex !important;
        flex: 0 0 auto !important;
    }
    body:not(.share-view) .footer-section-edit .footer-section-body > input.visually-hidden-file-input {
        display: none !important;
    }
    body:not(.share-view) .footer-section-edit .save-control-group {
        gap: 4px !important;
        padding: 2px 4px !important;
    }

    /* Padding for note container on mobile share/edit views */
    body.share-view #preview-md,
    body.share-view #preview-plain,
    .preview-pane,
    textarea.contents {
        padding-bottom: 72px !important;
        transition: padding-bottom 0.2s ease;
    }

    body.share-view .footer-select {
        max-width: none;
        flex: 1;
    }

    body.share-view .share-history-content,
    .share-history-content,
    .note-history-content {
        left: 8px;
        right: 8px;
        bottom: 64px;
        width: auto;
        max-height: 55dvh;
    }

    body.share-view .share-back-to-top {
        right: 14px;
        bottom: 64px;
        width: 36px;
        height: 36px;
        font-size: 18px;
    }

    body.share-view .markdown-body table {

        display: table !important;
        width: 100% !important;
        min-width: 0 !important;
        max-width: 100% !important;
        table-layout: fixed !important;
        overflow: hidden !important;
        font-size: 11px !important;
    }

    body.share-view .markdown-body th,
    body.share-view .markdown-body td {
        min-width: 0 !important;
        padding: 6px 5px !important;
        white-space: normal !important;
        overflow-wrap: anywhere !important;
        word-break: break-word !important;
    }

    body.share-view .markdown-body th code,
    body.share-view .markdown-body td code {
        white-space: normal !important;
        overflow-wrap: anywhere !important;
        word-break: break-word !important;
    }

    body.share-view .mobile-ascii-diagram {
        margin-bottom: 16px;
    }
}

/* Scroll Indicator Arrow */
.scroll-indicator-arrow {
    width: 24px;
    height: 24px;
    border-radius: 50%;
    background: var(--toolbar-bg-hover, rgba(0, 0, 0, 0.08));
    color: var(--toolbar-accent, #cc785c);
    display: flex;
    align-items: center;
    justify-content: center;
    pointer-events: none;
    opacity: 0;
    transition: opacity 0.3s ease;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.scroll-indicator-arrow.show:not(.user-scrolled) {
    opacity: 0.9;
}

.scroll-indicator-arrow-icon {
    display: flex;
    align-items: center;
    justify-content: center;
}

.scroll-indicator-arrow.show:not(.user-scrolled) .scroll-indicator-arrow-icon {
    animation: wiggle-right-icon 1.6s ease-in-out infinite;
}

.pwa-install-prompt {
    align-items: center;
    background: #0f172a;
    border: 1px solid rgba(255, 255, 255, 0.22);
    border-radius: 999px;
    bottom: calc(16px + env(safe-area-inset-bottom));
    box-shadow: 0 10px 30px rgba(15, 23, 42, 0.28);
    color: #fff;
    display: flex;
    gap: 8px;
    left: 50%;
    max-width: calc(100vw - 32px);
    padding: 8px 10px 8px 14px;
    position: fixed;
    transform: translateX(-50%);
    z-index: 1200;
}

.pwa-install-prompt[hidden] {
    display: none !important;
}

.pwa-install-title {
    font-size: 13px;
    font-weight: 700;
    white-space: nowrap;
}

.pwa-install-button,
.pwa-install-dismiss {
    border: 0;
    cursor: pointer;
    font: inherit;
}

.pwa-install-button {
    background: #fff;
    border-radius: 999px;
    color: #0f172a;
    font-size: 13px;
    font-weight: 800;
    padding: 7px 11px;
}

.pwa-install-button:disabled { opacity: 0.65; cursor: wait; }

.pwa-install-dismiss {
    background: transparent;
    color: #cbd5e1;
    font-size: 20px;
    line-height: 1;
    min-height: 32px;
    min-width: 32px;
    padding: 2px 3px;
    touch-action: manipulation;
}

.pwa-install-button:focus-visible,
.pwa-install-dismiss:focus-visible {
    outline: 2px solid #fff;
    outline-offset: 2px;
}

@media (display-mode: standalone) {
    .pwa-install-prompt {
        display: none !important;
    }
}

@keyframes wiggle-right-icon {
    0%, 100% { transform: translate3d(0, 0, 0); }
    50% { transform: translate3d(4px, 0, 0); }
}

@media print {
    /* Hide non-printable elements */
    .footer,
    .share-footer,
    .divide-line,
    textarea#contents,
    #loading,
    .pwa-install-prompt,
    .tips,
    .modal,
    .publish-nudge-modal,
    .publish-nudge-content,
    #presentation-close-btn,
    #presentation-container,
    .toolbar-container,
    .toolbar,
    #toolbar,
    .markdown-editor-toolbar-wrap,
    .markdown-editor-toolbar,
    .bottom-sheet,
    #mobile-bottom-sheet,
    .bottom-sheet-backdrop,
    .bottom-sheet-content,
    .reader-controls,
    #reader-controls,
    .floating-tooltip,
    .share-back-to-top,
    #share-back-to-top,
    #toast-container,
    .dropdown-menu,
    .share-menu-dropdown,
    .reading-progress-container,
    #reading-progress-bar,
    .annotation-rail-button,
    .annotation-selection-button,
    .annotation-sidebar,
    .annotation-popover,
    .annotation-card,
    .share-annotations-layer,
    #share-annotations-root,
    .share-annotations-trigger,
    .share-annotations-popover,
    [class*="webtalk"],
    [id*="webtalk"] {
        display: none !important;
    }

    /* Reset layouts for page flow */
    html, body {
        height: auto !important;
        min-height: 100% !important;
        overflow: visible !important;
        background: #fff !important;
        color: #000 !important;
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
    }

    .note-container,
    .stack,
    .layer_1,
    .layer_2,
    .layer_3,
    .preview-pane {
        height: auto !important;
        min-height: 0 !important;
        overflow: visible !important;
        display: block !important;
        float: none !important;
        position: static !important;
        border: none !important;
        box-shadow: none !important;
        padding: 0 !important;
        margin: 0 !important;
    }

    /* Print content page formatting */
    #preview-md,
    #preview-plain,
    .markdown-body {
        height: auto !important;
        overflow: visible !important;
        padding: 0 !important;
        margin: 0 auto !important;
        background: transparent !important;
        color: #000 !important;
        max-width: 100% !important;
        font-size: 12pt !important;
        line-height: 1.6 !important;
    }

    .markdown-body {
        background-color: transparent !important;
        color: #000 !important;
    }

    /* High specificity reset to override body.share-view #preview-md.markdown-body > table negative margins */
    body #preview-md.markdown-body > pre,
    body #preview-md.markdown-body > table,
    body #preview-md.markdown-body > .media-preview,
    body.share-view #preview-md.markdown-body > pre,
    body.share-view #preview-md.markdown-body > table,
    body.share-view #preview-md.markdown-body > .media-preview,
    body.preview-device-mobile #preview-md.markdown-body > pre,
    body.preview-device-mobile #preview-md.markdown-body > table,
    body.preview-device-mobile #preview-md.markdown-body > .media-preview,
    .markdown-body > pre,
    .markdown-body > table,
    .markdown-body > .media-preview,
    .markdown-body table {
        margin-left: 0 !important;
        margin-right: 0 !important;
        width: 100% !important;
        max-width: 100% !important;
        box-sizing: border-box !important;
    }

    .markdown-body table {
        display: table !important;
        table-layout: auto !important;
        border-collapse: collapse !important;
        word-break: break-word !important;
        overflow: visible !important;
    }

    .markdown-body table th,
    .markdown-body table td {
        padding: 6px 8px !important;
        font-size: 10pt !important;
        line-height: 1.4 !important;
        word-break: break-word !important;
        overflow-wrap: anywhere !important;
        white-space: normal !important;
        box-sizing: border-box !important;
    }

    /* Keep page breaks clean */
    h1, h2, h3, h4, h5, h6 {
        page-break-after: avoid !important;
        break-after: avoid !important;
        page-break-inside: avoid !important;
        break-inside: avoid !important;
    }
    
    pre, blockquote, tr, img, figure {
        page-break-inside: avoid !important;
        break-inside: avoid !important;
    }
    
    a {
        color: #000 !important;
        text-decoration: underline !important;
    }
}
`

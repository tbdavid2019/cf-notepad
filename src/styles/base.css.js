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

:root {
    --editor-font-family: "Maple Mono", "Menlo", "Monaco", "Courier New", monospace;
    --share-font-jetbrains-family: "JetBrains Mono", "SF Mono", "Monaco", "Cascadia Code", "Fira Code", "JetBrains Mono NL", "Roboto Mono", "Consolas", "Menlo", monospace;
    --share-font-maple-family: "Maple Mono", "Menlo", "Monaco", "Courier New", monospace;
    --preview-max-width: 100%;
}

/* Reset & Base */
body { padding: 0; margin: 0; background: #f0f2f5; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; color: #333; height: 100vh; height: 100dvh; overflow: hidden; }
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
.modal-content input { flex: 1; padding: 8px; border: 1px solid #ddd; border-radius: 4px; }
.modal-content .close-btn { position: absolute; right: 10px; top: 5px; cursor: pointer; font-size: 18px; color: #999; }
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

/* Footer */
.footer {
    min-height: 56px;
    background: #fafbfc;
    border-top: 1px solid #e1e4e8;
    display: block;
    padding: 0 20px;
    font-size: 13px;
    color: #586069;
    overflow-x: auto;
    overflow-y: hidden;
    transition: transform 0.22s ease, opacity 0.22s ease;
}
.footer-sections {
    min-height: 56px;
    display: flex;
    align-items: stretch;
    gap: 12px;
    flex-wrap: nowrap;
    white-space: nowrap;
    padding: 8px 0;
}
.footer-section {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 6px 10px;
    border: 1px solid #e5e7eb;
    border-radius: 10px;
    background: #fff;
}
.footer-section-actions {
    flex: 0 0 auto;
}
.footer-section-appearance {
    flex: 1 1 auto;
    min-width: max-content;
}
.footer-section-meta {
    flex: 0 0 auto;
}
.footer-section-label {
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: #6b7280;
}
.footer-section-body {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-wrap: nowrap;
}
.footer-select {
    padding: 4px 8px;
    border-radius: 4px;
    border: 1px solid #e1e4e8;
    font-size: 12px;
    background: #fff;
    color: #24292f;
}
.segmented-toggle {
    display: inline-flex;
    align-items: center;
    border: 1px solid #d0d7de;
    border-radius: 4px;
    background: #fff;
    overflow: hidden;
}
.segmented-toggle-btn {
    min-width: 34px;
    height: 26px;
    padding: 0 8px;
    border: 0;
    border-right: 1px solid #d0d7de;
    background: transparent;
    color: #57606a;
    cursor: pointer;
    font-size: 12px;
    font-weight: 600;
}
.segmented-toggle-btn:last-child {
    border-right: 0;
}
.segmented-toggle-btn:hover {
    background: #f6f8fa;
    color: #24292f;
}
.segmented-toggle-btn.active {
    background: #24292f;
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
}
.opt-button { cursor: pointer; padding: 4px 12px; border-radius: 6px; background: #0366d6; color: white; border: none; font-size: 12px; transition: background 0.2s; }
.opt-button:hover { background: #005cc5; }
.opt-switcher { display: flex; align-items: center; cursor: pointer; }
.opt-switcher input { display: none; }
.opt-switcher .slider { width: 32px; height: 16px; background: #ccc; border-radius: 16px; position: relative; transition: .4s; margin-left: 8px; }
.opt-switcher .slider:before { content: ""; position: absolute; height: 12px; width: 12px; left: 2px; bottom: 2px; background: white; border-radius: 50%; transition: .4s; }
.opt-switcher input:checked + .slider { background: #2ea44f; }
.opt-switcher input:checked + .slider:before { transform: translateX(16px); }
.share-font-toggle .segmented-toggle-btn {
    min-width: 28px;
    padding: 0 7px;
}
.share-history-trigger {
    background: #57606a;
}
.share-history-trigger:hover {
    background: #424a53;
}
.mobile-footer-more-trigger {
    display: none;
    background: #6e7781;
    min-width: 34px;
    padding-left: 10px;
    padding-right: 10px;
}
.mobile-footer-more-trigger:hover {
    background: #57606a;
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
@media (max-width: 640px) {
    .share-history-content {
        right: 12px;
        left: 12px;
        bottom: 68px;
        width: auto;
        max-height: calc(100dvh - 92px);
        padding: 14px;
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
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    z-index: 10000;
    background: #1a1a2e;
    display: none;
}
#presentation-container.active {
    display: block;
}
#presentation-close-btn {
    position: fixed;
    top: 20px;
    right: 20px;
    z-index: 10001;
    background: rgba(255, 255, 255, 0.15);
    color: white;
    border: 1px solid rgba(255, 255, 255, 0.3);
    padding: 8px 16px;
    border-radius: 20px;
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
    font-size: 28px;
}

/* Slidev-Lite Theme Extensions */
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700&family=Roboto+Mono&display=swap');

#presentation-container.active {
    font-family: 'Inter', sans-serif;
    background: radial-gradient(circle at 50% 50%, #1e293b 0%, #0f172a 100%);
}

#presentation-container .reveal .slides section {
    text-align: left;
    font-family: 'Inter', sans-serif;
    color: #e2e8f0;
    line-height: 1.45;
    box-sizing: border-box;
    padding-bottom: 56px !important;
    overflow: hidden;
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

.reveal pre {
    background: #0f172a;
    border: 1px solid #334155;
    border-radius: 8px;
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
    padding: 1em;
}

.reveal code {
    font-family: 'Roboto Mono', monospace;
    font-size: 0.85em;
    color: #94a3b8;
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
    overflow: visible;
    transform-origin: top left;
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
    width: 100%;
}

.reveal .fragment.v-click {
    visibility: hidden;
}
.reveal .fragment.v-click.visible {
    visibility: visible;
}

@media (max-width: 960px) {
    .footer {
        padding: 0 12px;
    }

    .footer-sections {
        gap: 10px;
        padding: 8px 0 10px;
    }

    .footer-section {
        padding: 6px 8px;
    }

    .footer-section-label {
        font-size: 10px;
    }

    body.share-view #preview-md,
    body.share-view #preview-plain {
        padding-bottom: 96px;
    }

    body.share-view .footer {
        position: fixed;
        left: 8px;
        right: 8px;
        bottom: 8px;
        z-index: 120;
        min-height: 0;
        max-height: 30dvh;
        overflow-y: auto;
        border: 1px solid #d0d7de;
        border-radius: 8px;
        box-shadow: 0 10px 30px rgba(31, 35, 40, 0.16);
        padding: 6px;
        overflow-x: hidden;
    }

    body.share-view .footer.footer-hidden {
        opacity: 0;
        pointer-events: none;
        transform: translateY(calc(100% + 12px));
    }

    body.share-view .footer-sections {
        width: 100%;
        flex-wrap: wrap;
        gap: 8px;
        padding: 0;
    }

    body.share-view .footer-section {
        width: 100%;
        flex-wrap: wrap;
        align-items: flex-start;
    }

    body.share-view:not(.mobile-footer-expanded) .footer-section-appearance,
    body.share-view:not(.mobile-footer-expanded) .footer-section-meta {
        display: none;
    }

    body.share-view .footer-section-actions {
        padding: 5px 7px;
    }

    body.share-view .footer-section-actions .footer-section-label {
        display: none;
    }

    body.share-view .footer-section-body {
        width: 100%;
        flex-wrap: wrap;
        gap: 6px;
    }

    body.share-view .opt-button {
        padding: 4px 8px;
    }

    body.share-view .mobile-footer-more-trigger {
        display: inline-flex;
        align-items: center;
        justify-content: center;
    }

    body.share-view .footer-select {
        max-width: 132px;
    }

    body.share-view .share-history-content,
    .share-history-content {
        left: 8px;
        right: 8px;
        bottom: 58px;
        width: auto;
        max-height: 58dvh;
    }

    body.share-view .share-back-to-top {
        right: 14px;
        bottom: 58px;
        width: 34px;
        height: 34px;
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

@media print {
    /* Hide non-printable elements */
    .footer,
    .divide-line,
    textarea#contents,
    #loading,
    .tips,
    .modal,
    .publish-nudge-modal,
    .publish-nudge-content,
    #presentation-close-btn,
    #presentation-container {
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

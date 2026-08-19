/**
 * src/styles/markdown.css.js
 * Markdown rendering styles: typography, tables, code, alerts, GitHub-style
 */
export const getMarkdownCss = () => `
.markdown-body {
    font-family: var(--editor-font-family);
    font-size: 16px;
    line-height: 1.5;
    word-wrap: break-word;
}
.markdown-body h1, .markdown-body h2, .markdown-body h3, .markdown-body h4, .markdown-body h5, .markdown-body h6 { margin-top: 24px; margin-bottom: 16px; font-weight: 600; line-height: 1.25; }
.markdown-body h1 { font-size: 2em; padding-bottom: 0.3em; border-bottom: 1px solid #eaecef; }
.markdown-body h2 { font-size: 1.5em; padding-bottom: 0.3em; border-bottom: 1px solid #eaecef; }
.markdown-body h3 { font-size: 1.25em; }
.markdown-body h4 { font-size: 1em; }
.markdown-body p { margin-top: 0; margin-bottom: 16px; }
.markdown-body blockquote { margin: 0; padding: 0 1em; color: #6a737d; border-left: 0.25em solid #dfe2e5; }
.markdown-body .markdown-toc { margin: 0 0 24px; }
.markdown-body .markdown-toc-list { margin: 0; padding-left: 1.5em; }
.markdown-body .markdown-toc-list .markdown-toc-list { margin: 4px 0; }
.markdown-body .markdown-toc-link { color: inherit; }
.markdown-body ul, .markdown-body ol { padding-left: 2em; margin-top: 0; margin-bottom: 16px; }
.markdown-body table { display: block; width: 100%; overflow: auto; margin-top: 0; margin-bottom: 16px; border-spacing: 0; border-collapse: collapse; }
.markdown-body table tr { border-top: 1px solid #c6cbd1; }
.markdown-body table th, .markdown-body table td { padding: 6px 13px; border: 1px solid #dfe2e5; }
.markdown-body table th { font-weight: 600; }
.markdown-body code { padding: 0.2em 0.4em; margin: 0; font-size: 85%; border-radius: 3px; font-family: var(--editor-font-family); }
.markdown-body pre { padding: 16px; overflow: auto; font-size: 85%; line-height: 1.45; border-radius: 3px; }
.markdown-body pre code { display: inline; padding: 0; margin: 0; overflow: visible; line-height: inherit; word-wrap: normal; background-color: transparent; border: 0; }
.markdown-body hr { height: 0.25em; padding: 0; margin: 24px 0; background-color: #e1e4e8; border: 0; }
.markdown-body a { color: #0366d6; text-decoration: none; }
.markdown-body a:hover { text-decoration: underline; }
.markdown-body img { max-width: 100%; box-sizing: content-box; }
.markdown-body .two-column-layout,
.markdown-body .three-column-layout {
    display: grid;
    gap: clamp(20px, 3vw, 40px);
    align-items: start;
    margin: 20px 0;
}
.markdown-body .two-column-layout {
    grid-template-columns: repeat(2, minmax(0, 1fr));
}
.markdown-body .three-column-layout {
    grid-template-columns: repeat(3, minmax(0, 1fr));
}
.markdown-body .column-layout-item {
    min-width: 0;
}
.markdown-body .column-layout-item > :first-child {
    margin-top: 0;
}
.markdown-body .column-layout-item > :last-child {
    margin-bottom: 0;
}
@media (max-width: 720px) {
    .markdown-body .two-column-layout,
    .markdown-body .three-column-layout {
        grid-template-columns: minmax(0, 1fr);
    }
}
.markdown-body .media-preview { margin: 20px 0; padding: 12px; border: 1px solid rgba(127, 127, 127, 0.28); border-radius: 8px; background: rgba(127, 127, 127, 0.06); }
.markdown-body .media-preview-player { display: block; width: 100%; max-width: 100%; border: 0; border-radius: 4px; }
.markdown-body .media-preview-youtube { padding: 0; overflow: hidden; }
.markdown-body .media-preview-youtube .media-preview-player { aspect-ratio: 16 / 9; width: 100%; height: auto; min-height: 0; background: #000; }
.markdown-body .media-preview-pdf .media-preview-player { min-height: min(75vh, 760px); background: #fff; }
.markdown-body .media-preview-video .media-preview-player { max-height: min(75vh, 720px); background: #000; }
.markdown-body .media-preview-audio .media-preview-player { min-height: 42px; }
.markdown-body .media-preview figcaption { margin-top: 8px; font-size: 0.82em; overflow-wrap: anywhere; }
.markdown-body .media-preview-fallback { color: inherit; }

/* Apache ECharts code fences */
.diagram-echarts-render {
    width: 100%;
    min-height: 360px;
    margin: 20px 0;
    overflow: hidden;
    border-radius: 6px;
}
.diagram-echarts-render canvas {
    max-width: 100%;
}
.diagram-render-error {
    min-height: 0;
    padding: 12px 16px;
    overflow-x: auto;
    border: 1px solid #f1aeb5;
    border-radius: 6px;
    background: #fff5f5;
    color: #842029;
    font-family: var(--editor-font-family);
    font-size: 13px;
    white-space: pre-wrap;
}

/* GitHub Alerts */
.markdown-alert { padding: 8px 16px; margin-bottom: 16px; border-left: 0.25em solid; border-radius: 6px; }
.markdown-alert > :first-child { margin-top: 0; }
.markdown-alert > :last-child { margin-bottom: 0; }
.markdown-alert-note { border-color: #0969da; background-color: #f1f8ff; color: #0d1117; }
.markdown-alert-note::before { content: "ℹ️ Note"; font-weight: 600; display: block; margin-bottom: 4px; color: #0969da; }
.markdown-alert-tip { border-color: #1a7f37; background-color: #f0fdf4; color: #0d1117; }
.markdown-alert-tip::before { content: "💡 Tip"; font-weight: 600; display: block; margin-bottom: 4px; color: #1a7f37; }
.markdown-alert-important { border-color: #8250df; background-color: #f6f0ff; color: #0d1117; }
.markdown-alert-important::before { content: "💬 Important"; font-weight: 600; display: block; margin-bottom: 4px; color: #8250df; }
.markdown-alert-warning { border-color: #9a6700; background-color: #fff8c5; color: #0d1117; }
.markdown-alert-warning::before { content: "⚠️ Warning"; font-weight: 600; display: block; margin-bottom: 4px; color: #9a6700; }
.markdown-alert-caution { border-color: #cf222e; background-color: #ffebe9; color: #0d1117; }
.markdown-alert-caution::before { content: "🛑 Caution"; font-weight: 600; display: block; margin-bottom: 4px; color: #cf222e; }

/* Pandoc Academic Citations & Footnotes */
.markdown-body .pandoc-citation,
.pandoc-citation {
    font-style: normal;
    display: inline;
}
.markdown-body .citation-ref,
.citation-ref {
    color: var(--theme-accent, #0969da);
    text-decoration: none;
    font-weight: 500;
    padding: 1px 5px;
    border-radius: 4px;
    background-color: rgba(9, 105, 218, 0.08);
    transition: background-color 0.15s ease, color 0.15s ease;
    cursor: pointer;
    white-space: nowrap;
}
.markdown-body .citation-ref:hover,
.citation-ref:hover {
    background-color: rgba(9, 105, 218, 0.18);
    color: var(--theme-accent-hover, #0550ae);
    text-decoration: none;
}
.markdown-body .footnote-ref a,
.footnote-ref a,
[data-footnote-ref] {
    cursor: pointer;
    padding: 1px 4px;
    border-radius: 3px;
    transition: background-color 0.15s ease;
}
.markdown-body .footnote-ref a:hover,
.footnote-ref a:hover,
[data-footnote-ref]:hover {
    background-color: rgba(9, 105, 218, 0.15);
}

/* Footnote & Citation Hover Popover */
.footnote-popover {
    position: fixed;
    z-index: 10050;
    max-width: 420px;
    min-width: 240px;
    max-height: 280px;
    background: rgba(255, 255, 255, 0.96);
    color: #1e293b;
    border: 1px solid rgba(0, 0, 0, 0.12);
    border-radius: 12px;
    box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.15), 0 8px 10px -6px rgba(0, 0, 0, 0.1);
    backdrop-filter: blur(16px) saturate(180%);
    -webkit-backdrop-filter: blur(16px) saturate(180%);
    padding: 12px 14px;
    font-size: 13.5px;
    line-height: 1.55;
    opacity: 0;
    visibility: hidden;
    transform: translateY(4px);
    transition: opacity 0.18s cubic-bezier(0.16, 1, 0.3, 1), transform 0.18s cubic-bezier(0.16, 1, 0.3, 1), visibility 0.18s;
    pointer-events: none;
    overflow-y: auto;
}
.footnote-popover.visible,
.footnote-popover[data-active="true"] {
    opacity: 1;
    visibility: visible;
    transform: translateY(0);
    pointer-events: auto;
}
.footnote-popover-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 8px;
    padding-bottom: 6px;
    border-bottom: 1px solid rgba(0, 0, 0, 0.08);
}
.footnote-popover-badge {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    font-size: 11.5px;
    font-weight: 600;
    color: #475569;
    text-transform: uppercase;
    letter-spacing: 0.03em;
}
.footnote-popover-badge svg {
    color: #0969da;
}
.footnote-popover-close {
    background: transparent;
    border: none;
    cursor: pointer;
    font-size: 16px;
    line-height: 1;
    color: #94a3b8;
    padding: 2px 6px;
    border-radius: 4px;
    transition: color 0.15s, background-color 0.15s;
}
.footnote-popover-close:hover {
    color: #1e293b;
    background-color: rgba(0, 0, 0, 0.06);
}
.footnote-popover-body {
    word-break: break-word;
    color: #334155;
}
.footnote-popover-body p {
    margin: 0 0 6px;
}
.footnote-popover-body p:last-child {
    margin-bottom: 0;
}
.footnote-popover-body code {
    font-size: 12px;
    padding: 2px 5px;
    border-radius: 4px;
    background: rgba(0, 0, 0, 0.06);
}
.footnote-popover-body a {
    color: #0969da;
    text-decoration: underline;
    text-underline-offset: 2px;
}

/* Markdown Text Highlight */
.markdown-body mark,
.markdown-highlight {
    background-color: rgba(254, 240, 138, 0.75);
    color: inherit;
    padding: 1px 5px;
    border-radius: 4px;
    box-decoration-break: clone;
    -webkit-box-decoration-break: clone;
}
[data-ui-theme="dark"] .markdown-body mark,
[data-ui-theme="dark"] .markdown-highlight {
    background-color: rgba(234, 179, 8, 0.32);
    color: #fef08a;
}

/* Code Block Enhancements (Line numbers, Header, Filename, Copy button) */
.code-block-wrapper {
    position: relative;
    margin: 1.2em 0;
    border-radius: 8px;
    border: 1px solid rgba(0, 0, 0, 0.12);
    background: rgba(0, 0, 0, 0.02);
    overflow: hidden;
}
[data-ui-theme="dark"] .code-block-wrapper {
    border-color: rgba(255, 255, 255, 0.12);
    background: rgba(0, 0, 0, 0.2);
}
.code-block-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 6px 12px;
    background: rgba(0, 0, 0, 0.05);
    border-bottom: 1px solid rgba(0, 0, 0, 0.08);
    font-size: 12px;
    font-family: var(--font-mono, ui-monospace, SFMono-Regular, Menlo, monospace);
    color: #555;
}
[data-ui-theme="dark"] .code-block-header {
    background: rgba(255, 255, 255, 0.05);
    border-bottom-color: rgba(255, 255, 255, 0.08);
    color: #aaa;
}
.code-block-title {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    font-weight: 600;
    font-size: 11.5px;
    letter-spacing: 0.04em;
}
.code-file-icon {
    font-size: 13px;
}
.code-copy-btn {
    background: rgba(255, 255, 255, 0.8);
    border: 1px solid rgba(0, 0, 0, 0.15);
    border-radius: 5px;
    padding: 3px 8px;
    font-size: 11px;
    font-weight: 500;
    color: #444;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    gap: 4px;
    transition: all 0.15s ease;
}
[data-ui-theme="dark"] .code-copy-btn {
    background: rgba(255, 255, 255, 0.1);
    border-color: rgba(255, 255, 255, 0.18);
    color: #ddd;
}
.code-copy-btn:hover {
    background: var(--toolbar-accent, #2563eb);
    color: #ffffff;
    border-color: var(--toolbar-accent, #2563eb);
}
.code-copy-btn.copied {
    background: #16a34a;
    color: #ffffff;
    border-color: #16a34a;
}
.code-block-wrapper pre {
    margin: 0 !important;
    border: none !important;
    border-radius: 0 !important;
}
pre.has-line-numbers {
    display: flex !important;
    padding-left: 0 !important;
}
.code-line-numbers {
    flex: 0 0 auto;
    padding: 12px 10px 12px 14px;
    text-align: right;
    user-select: none;
    color: rgba(0, 0, 0, 0.35);
    border-right: 1px solid rgba(0, 0, 0, 0.08);
    font-family: var(--font-mono, monospace);
    font-size: inherit;
    line-height: inherit;
}
[data-ui-theme="dark"] .code-line-numbers {
    color: rgba(255, 255, 255, 0.3);
    border-right-color: rgba(255, 255, 255, 0.08);
}
.code-line-numbers .line-number {
    display: block;
}
`

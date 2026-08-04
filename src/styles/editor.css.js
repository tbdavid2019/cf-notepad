/**
 * src/styles/editor.css.js
 * Editor-specific styles: textarea, preview areas, contents layout
 */
export const getEditorCss = () => `
/* Editor & Preview Areas */
.editor-pane {
    flex: 1;
    min-width: 0;
    min-height: 0;
    height: 100%;
    display: flex;
    flex-direction: column;
    overflow: hidden;
}

.editor-code-shell {
    flex: 1;
    min-width: 0;
    min-height: 0;
    display: flex;
    overflow: hidden;
    background: #282a36;
}

.editor-code-shell > textarea.contents {
    width: 100%;
    min-height: 0;
}

.block-editor-pane {
    overflow: hidden;
    background: var(--editor-surface, #fff);
}

.block-editor {
    width: min(900px, 100%);
    height: 100%;
    margin: 0 auto;
    padding: 18px 22px 42px;
    overflow: auto;
    color: var(--text-color, #24292f);
}

.block-editor-toolbar,
.block-card-controls,
.block-body,
.block-field {
    display: flex;
    align-items: center;
    gap: 8px;
}

.block-editor-toolbar {
    position: sticky;
    top: -18px;
    z-index: 2;
    justify-content: space-between;
    margin: -18px -22px 16px;
    padding: 12px 22px;
    border-bottom: 1px solid var(--toolbar-border, #e2dacd);
    background: color-mix(in srgb, var(--editor-surface, #fff) 94%, transparent);
    backdrop-filter: blur(8px);
}

.block-add-select,
.block-type-select,
.block-heading-level,
.block-field-input,
.block-source-input,
.block-action {
    border: 1px solid var(--toolbar-border, #d0d7de);
    border-radius: 6px;
    background: var(--status-control-bg, #fff);
    color: inherit;
    font: inherit;
}

.block-add-select,
.block-type-select,
.block-heading-level,
.block-field-input {
    min-height: 32px;
    padding: 4px 8px;
}

.block-list { display: grid; gap: 10px; }

.block-card {
    padding: 10px 12px 12px;
    border: 1px solid transparent;
    border-radius: 8px;
}

.block-card:hover,
.block-card:focus-within {
    border-color: var(--toolbar-border, #d0d7de);
    background: color-mix(in srgb, var(--status-control-bg, #fff) 94%, #d0d7de);
}

.block-card-controls { justify-content: flex-end; min-height: 28px; }
.block-type-select { margin-right: auto; font-size: 13px; }
.block-action { width: 28px; height: 28px; cursor: pointer; }
.block-action:disabled { opacity: .35; cursor: default; }
.block-action-danger { color: #b42318; }

.block-body { align-items: flex-start; flex-wrap: wrap; }
.block-text-input {
    flex: 1 1 360px;
    min-height: 36px;
    padding: 6px 4px;
    outline: none;
    font-size: 17px;
    line-height: 1.65;
    white-space: pre-wrap;
}
.block-text-input:empty::before { content: attr(placeholder); color: #8c959f; pointer-events: none; }
.block-body-heading .block-text-input { font-size: 26px; font-weight: 700; }
.block-body-quote .block-text-input { padding-left: 14px; border-left: 3px solid var(--toolbar-accent, #c8654b); }
.block-body-bulletList .block-text-input::before { content: '• '; color: var(--toolbar-muted, #6e7781); }

.block-field { flex: 1 1 190px; flex-direction: column; align-items: stretch; font-size: 12px; color: var(--toolbar-muted, #57606a); }
.block-field-input { width: 100%; color: var(--text-color, #24292f); }
.block-source-field { flex-basis: 100%; }
.block-source-input { width: 100%; min-height: 110px; padding: 9px; resize: vertical; font: 13px/1.5 var(--editor-font-family); }
.block-static-help { margin: 4px 0; color: var(--toolbar-muted, #57606a); font-size: 13px; }
.block-upload-button { position: relative; overflow: hidden; display: inline-flex; align-items: center; min-height: 32px; padding: 4px 10px; border: 1px solid var(--toolbar-border, #d0d7de); border-radius: 6px; cursor: pointer; font-size: 13px; }
.block-file-picker { position: absolute; inset: 0; opacity: 0; cursor: pointer; }

@media (max-width: 640px) {
    .block-editor { padding: 12px 12px 32px; }
    .block-editor-toolbar { top: -12px; margin: -12px -12px 12px; padding: 10px 12px; }
    .block-card { padding: 8px; }
    .block-card-controls { gap: 5px; }
    .block-type-select { max-width: 150px; }
}

.editor-status {
    flex: 0 0 auto;
    min-height: 24px;
    padding: 4px 10px;
    overflow: hidden;
    border-top: 1px solid rgba(248, 248, 242, 0.12);
    background: #20212b;
    color: #a7a9bf;
    font-family: var(--editor-font-family);
    font-size: 11px;
    line-height: 16px;
    white-space: nowrap;
}

.editor-line-numbers {
    flex: 0 0 42px;
    min-width: 42px;
    box-sizing: border-box;
    padding: 20px 8px 20px 6px;
    overflow: hidden;
    border-right: 1px solid rgba(248, 248, 242, 0.12);
    background: #282a36;
    color: #8b8da8;
    font-family: var(--editor-font-family);
    font-size: 16px;
    line-height: 1.6;
    text-align: right;
    white-space: pre;
    user-select: none;
    pointer-events: none;
}

.markdown-editor-toolbar {
    flex: 0 0 auto;
    display: flex;
    align-items: center;
    flex-wrap: nowrap;
    gap: 2px;
    min-height: 32px;
    padding: 3px 6px;
    position: relative;
    z-index: 100;
    overflow-x: auto;
    overflow-y: hidden;
    border-bottom: 1px solid var(--toolbar-border, #e2dacd);
    background: var(--toolbar-bg, #f4f0e8);
    color: var(--toolbar-text, #2c2a29);
    scrollbar-width: none;
    -webkit-overflow-scrolling: touch;
    transition: background-color 0.2s ease, color 0.2s ease, border-color 0.2s ease;
}

.markdown-editor-toolbar::-webkit-scrollbar {
    display: none;
}

.markdown-toolbar-button {
    flex: 0 0 24px;
    width: 24px;
    height: 24px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border: 1px solid transparent;
    border-radius: var(--toolbar-radius, 4px);
    background: transparent;
    color: inherit;
    cursor: pointer;
    font: inherit;
    padding: 0;
    transition: background 0.12s ease, border-color 0.12s ease, color 0.12s ease, transform 0.08s ease;
}

.markdown-toolbar-button:active {
    transform: scale(0.92);
}

.markdown-toolbar-button:hover,
.markdown-toolbar-button:focus-visible {
    border-color: var(--toolbar-border, #e2dacd);
    background: var(--toolbar-bg-hover, #eae3d5);
    color: var(--toolbar-accent, #c8654b);
}

.markdown-toolbar-button.is-active {
    border-color: var(--toolbar-border, #e2dacd);
    background: var(--toolbar-bg-active, #f0e6d8);
    color: var(--toolbar-accent, #c8654b);
}

.markdown-toolbar-button:focus-visible {
    outline: 2px solid var(--toolbar-accent, #c8654b);
    outline-offset: 1px;
}

.markdown-toolbar-button:disabled {
    opacity: 0.38;
    cursor: default;
}

.markdown-toolbar-button {
    position: relative;
}

.markdown-toolbar-button .svg-icon {
    display: block;
    flex: 0 0 16px;
    width: 16px;
    height: 16px;
    stroke-width: 2.2;
}

.markdown-toolbar-glyph {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 16px;
    min-height: 16px;
    font-size: 13px;
    line-height: 1;
    white-space: nowrap;
}

.markdown-toolbar-glyph.is-bold { font-weight: 800; }
.markdown-toolbar-glyph.is-italic { font-style: italic; font-family: Georgia, serif; }
.markdown-toolbar-glyph.is-strike { text-decoration: line-through; }
.markdown-toolbar-glyph.is-code { font-family: var(--editor-font-family); font-size: 11px; }
.markdown-toolbar-glyph.is-table,
.markdown-toolbar-glyph.is-image,
.markdown-toolbar-glyph.is-ai { font-size: 16px; }

.markdown-toolbar-separator {
    flex: 0 0 1px;
    width: 1px;
    height: 16px;
    margin: 0 1px;
    background: var(--toolbar-border, #e2dacd);
}

.editor-pane:fullscreen,
.editor-pane.toolbar-fullscreen {
    width: 100%;
    height: 100%;
    background: var(--editor-surface, #282a36);
}

.contents {
    flex: 1;
    min-width: 0;
    height: 100%;
    padding: 20px 30px;
    border: none;
    outline: none;
    overflow-y: auto;
    font-size: 16px;
    line-height: 1.8;
    font-family: var(--editor-font-family);
}

/* Editor Specific (Dark Mode) */
textarea#contents {
    flex: 1;
    background-color: #282a36;
    color: #f8f8f2;
    resize: none;
    line-height: 1.6;
}

@media (min-width: 961px) {
    body.preview-split-vertical:not(.share-view) .editor-pane {
        width: 100%;
        height: 50%;
    }
}

@media (max-width: 960px) {
    body:not(.share-view) .editor-pane {
        width: 100%;
        height: 50%;
        min-height: 0;
    }

    .markdown-editor-toolbar {
        min-height: 34px;
        padding: 3px 5px;
    }
}

@media (max-width: 640px) {
    .markdown-editor-toolbar {
        flex-wrap: nowrap !important;
        overflow-x: auto !important;
        justify-content: flex-start !important;
        gap: 2px !important;
        padding: 3px 5px !important;
        scrollbar-width: none; /* Firefox */
        -webkit-overflow-scrolling: touch;
    }
    .markdown-editor-toolbar::-webkit-scrollbar {
        display: none; /* Safari and Chrome */
    }
    .markdown-toolbar-button {
        flex: 0 0 24px !important;
        width: 24px !important;
        height: 24px !important;
    }
    .markdown-toolbar-separator {
        display: none;
    }
    .editor-line-numbers {
        flex-basis: 36px;
        min-width: 36px;
        padding-right: 6px;
        font-size: 14px;
    }
}

/* Preview Specific - background/color controlled by themes */
#preview-md, #preview-plain {
}
`

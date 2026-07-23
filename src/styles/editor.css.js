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
    width: 14px;
    height: 14px;
    stroke-width: 2.2;
}

.markdown-toolbar-ai-edit {
    flex-basis: auto;
    width: auto;
    min-width: 68px;
    gap: 4px;
    padding: 0 7px;
    color: var(--toolbar-accent, #c8654b);
}

.markdown-toolbar-ai-label {
    font-size: 11px;
    font-weight: 700;
    line-height: 1;
    white-space: nowrap;
}

.markdown-toolbar-glyph {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 14px;
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
    .markdown-toolbar-ai-edit {
        flex-basis: auto !important;
        width: auto !important;
        min-width: 68px;
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

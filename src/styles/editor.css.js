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

.editor-pane > textarea.contents {
    width: 100%;
    min-height: 0;
}

.markdown-editor-toolbar {
    flex: 0 0 auto;
    display: flex;
    align-items: center;
    gap: 3px;
    min-height: 42px;
    padding: 5px 10px;
    overflow-x: auto;
    overscroll-behavior-x: contain;
    border-bottom: 1px solid var(--toolbar-border, #e6dfd8);
    background: var(--toolbar-bg, rgba(250, 249, 245, 0.96));
    color: var(--toolbar-text, #3d3a36);
    scrollbar-width: thin;
}

.markdown-toolbar-button {
    flex: 0 0 32px;
    width: 32px;
    height: 32px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border: 1px solid transparent;
    border-radius: var(--toolbar-radius, 4px);
    background: transparent;
    color: inherit;
    cursor: pointer;
    font: inherit;
    transition: background 0.12s ease, border-color 0.12s ease, color 0.12s ease;
}

.markdown-toolbar-button:hover,
.markdown-toolbar-button:focus-visible {
    border-color: var(--toolbar-border, #d0d7de);
    background: var(--toolbar-bg-hover, rgba(0, 0, 0, 0.06));
    color: var(--toolbar-accent, #cc785c);
}

.markdown-toolbar-button:focus-visible {
    outline: 2px solid var(--toolbar-accent, #cc785c);
    outline-offset: 1px;
}

.markdown-toolbar-button:disabled {
    opacity: 0.38;
    cursor: default;
}

.markdown-toolbar-glyph {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 22px;
    font-size: 14px;
    line-height: 1;
    white-space: nowrap;
}

.markdown-toolbar-glyph.is-bold { font-weight: 800; }
.markdown-toolbar-glyph.is-italic { font-style: italic; font-family: Georgia, serif; }
.markdown-toolbar-glyph.is-strike { text-decoration: line-through; }
.markdown-toolbar-glyph.is-code { font-family: var(--editor-font-family); font-size: 11px; }
.markdown-toolbar-glyph.is-table,
.markdown-toolbar-glyph.is-image,
.markdown-toolbar-glyph.is-ai { font-size: 18px; }

.markdown-toolbar-separator {
    flex: 0 0 1px;
    width: 1px;
    height: 22px;
    margin: 0 4px;
    background: var(--toolbar-border, #e6dfd8);
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
        min-height: 40px;
        padding: 4px 8px;
    }
}

/* Preview Specific - background/color controlled by themes */
#preview-md, #preview-plain {
}
`

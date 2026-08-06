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
    position: relative;
    overflow: hidden;
    background: #282a36;
}

.editor-code-shell > textarea.contents {
    width: 100%;
    min-height: 0;
}

.editor-welcome {
    position: absolute;
    inset: 0 0 0 42px;
    z-index: 1;
    display: grid;
    place-content: center;
    width: auto;
    padding: clamp(28px, 8vh, 88px) clamp(32px, 8vw, 120px);
    color: #abb2c5;
    font-family: var(--editor-font-family);
    pointer-events: none;
    text-align: center;
}

.editor-welcome__section {
    width: min(100%, 44rem);
}

.editor-welcome__section--tip {
    margin-top: 24px;
    padding-top: 22px;
    border-top: 1px solid rgba(248, 248, 242, .16);
}

.editor-welcome__label {
    margin: 0 0 10px;
    color: #e4e7ef;
    font-size: 15px;
    font-weight: 700;
    letter-spacing: .01em;
    line-height: 1.45;
}

.editor-welcome__copy {
    font-size: 15px;
    line-height: 1.82;
}

.editor-welcome__copy p {
    margin: 0;
}

.editor-welcome__copy p.is-typing::after {
    content: '▋';
    display: inline-block;
    margin-left: 2px;
    font-size: 0.85em;
    color: #38bdf8;
    animation: welcomeCaret 0.7s infinite;
}

@keyframes welcomeCaret {
    0%, 100% { opacity: 1; }
    50% { opacity: 0; }
}

@media (max-width: 640px) {
    .editor-welcome {
        inset-left: 36px;
        padding: 28px 24px 72px;
    }

    .editor-welcome__section--tip {
        margin-top: 20px;
        padding-top: 18px;
    }

    .editor-welcome__label,
    .editor-welcome__copy {
        font-size: 14px;
    }
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

/* Tiptap Block Editor */
.block-editor-pane { background: var(--editor-surface, #fff); }
.block-editor { width: 100%; max-width: none; padding: 0; }
.tiptap-editor-shell { position: relative; width: min(920px, 100%); min-height: 100%; margin: 0 auto; padding: 18px 28px 72px; }
.tiptap-editor-toolbar {
    position: sticky; top: -18px; z-index: 5; display: flex; align-items: center; gap: 3px;
    min-height: 42px; margin: -18px -28px 30px; padding: 8px 28px; overflow-x: auto;
    border-bottom: 1px solid color-mix(in srgb, var(--toolbar-border, #d0d7de) 80%, transparent);
    background: color-mix(in srgb, var(--editor-surface, #fff) 92%, transparent); backdrop-filter: blur(14px);
    scrollbar-width: none;
}
.tiptap-editor-toolbar::-webkit-scrollbar { display: none; }
.tiptap-toolbar-button, .tiptap-insert-menu {
    flex: 0 0 auto; min-width: 30px; height: 30px; padding: 0 7px; border: 1px solid transparent; border-radius: 6px;
    background: transparent; color: var(--text-color, #24292f); font: 600 13px/1 var(--editor-font-family); cursor: pointer;
}
.tiptap-toolbar-button:hover, .tiptap-toolbar-button:focus-visible, .tiptap-toolbar-button.is-active,
.tiptap-insert-menu:hover, .tiptap-insert-menu:focus-visible { border-color: var(--toolbar-border, #d0d7de); background: var(--toolbar-bg-hover, #f0f2f4); color: var(--toolbar-accent, #c8654b); }
.tiptap-toolbar-button:focus-visible, .tiptap-insert-menu:focus-visible { outline: 2px solid var(--toolbar-accent, #c8654b); outline-offset: 1px; }
.tiptap-insert-menu { width: auto; min-width: 72px; font-weight: 500; }
.tiptap-editor-canvas { min-height: calc(100vh - 220px); cursor: text; }
.tiptap-editor-canvas .ProseMirror { min-height: inherit; outline: none; color: var(--text-color, #24292f); font: 17px/1.8 var(--editor-font-family); }
.tiptap-editor-canvas .ProseMirror > :first-child { margin-top: 0; }
.tiptap-editor-canvas .ProseMirror :is(h1, h2, h3) { margin: 1.25em 0 .48em; line-height: 1.28; letter-spacing: -.025em; }
.tiptap-editor-canvas .ProseMirror h1 { font-size: 2.15em; }
.tiptap-editor-canvas .ProseMirror h2 { font-size: 1.65em; }
.tiptap-editor-canvas .ProseMirror h3 { font-size: 1.34em; }
.tiptap-editor-canvas .ProseMirror p { margin: .62em 0; }
.tiptap-editor-canvas .ProseMirror :is(ul, ol) { padding-left: 1.55em; }
.tiptap-editor-canvas .ProseMirror li p { margin: .25em 0; }
.tiptap-editor-canvas .ProseMirror blockquote { margin: 1em 0; padding-left: 1em; border-left: 3px solid var(--toolbar-accent, #c8654b); color: var(--toolbar-muted, #57606a); }
.tiptap-editor-canvas .ProseMirror pre { margin: 1em 0; padding: 14px 16px; overflow-x: auto; border-radius: 8px; background: #20212b; color: #eef0f3; font: 13px/1.65 var(--editor-font-family); }
.tiptap-editor-canvas .ProseMirror code { padding: .12em .28em; border-radius: 4px; background: color-mix(in srgb, var(--toolbar-border, #d0d7de) 35%, transparent); font: .88em var(--editor-font-family); }
.tiptap-editor-canvas .ProseMirror pre code { padding: 0; background: transparent; font-size: inherit; }
.tiptap-editor-canvas .ProseMirror hr { margin: 1.6em 0; border: 0; border-top: 1px solid var(--toolbar-border, #d0d7de); }
.tiptap-editor-canvas .ProseMirror .is-editor-empty:first-child::before { content: attr(data-placeholder); float: left; height: 0; color: #9aa1a9; pointer-events: none; }
.tiptap-embed-card { margin: 1.1em 0; overflow: hidden; border: 1px solid var(--toolbar-border, #d0d7de); border-radius: 10px; background: color-mix(in srgb, var(--status-control-bg, #fff) 97%, #d0d7de); box-shadow: 0 1px 2px rgba(0, 0, 0, .04); }
.tiptap-embed-card.ProseMirror-selectednode { outline: 2px solid var(--toolbar-accent, #c8654b); outline-offset: 2px; }
.tiptap-embed-card-header { display: flex; align-items: center; justify-content: space-between; padding: 7px 10px; border-bottom: 1px solid color-mix(in srgb, var(--toolbar-border, #d0d7de) 75%, transparent); font-size: 12px; color: var(--toolbar-muted, #57606a); }
.tiptap-embed-delete { width: 24px; height: 24px; border: 0; border-radius: 5px; background: transparent; color: #b42318; cursor: pointer; font-size: 17px; }
.tiptap-embed-delete:hover { background: #fff0ef; }
.tiptap-embed-preview { display: grid; min-height: 52px; place-items: start; padding: 12px; color: var(--toolbar-muted, #57606a); font-size: 13px; }
.tiptap-embed-preview img { display: block; max-width: 100%; max-height: 360px; border-radius: 5px; }
.tiptap-embed-preview pre { width: 100%; margin: 0; white-space: pre-wrap; font: 12px/1.5 var(--editor-font-family); }
.tiptap-slash-menu { position: absolute; z-index: 10; left: 28px; bottom: 28px; display: grid; width: min(340px, calc(100% - 56px)); max-height: 330px; padding: 6px; overflow-y: auto; border: 1px solid var(--toolbar-border, #d0d7de); border-radius: 10px; background: var(--status-control-bg, #fff); box-shadow: 0 14px 35px rgba(0, 0, 0, .16); }
.tiptap-slash-item { display: grid; gap: 2px; padding: 9px 10px; border: 0; border-radius: 7px; background: transparent; color: inherit; text-align: left; cursor: pointer; }
.tiptap-slash-item:hover, .tiptap-slash-item:focus-visible { background: var(--toolbar-bg-hover, #f0f2f4); outline: none; }
.tiptap-slash-item small { color: var(--toolbar-muted, #57606a); }
.tiptap-bubble-menu { display: flex; gap: 3px; padding: 5px; border: 1px solid var(--toolbar-border, #d0d7de); border-radius: 8px; background: var(--status-control-bg, #fff); box-shadow: 0 8px 20px rgba(0, 0, 0, .15); }
.david888-drag-handle { display: grid; width: 24px; height: 28px; place-items: center; border: 0; border-radius: 5px; background: transparent; color: var(--toolbar-muted, #57606a); cursor: grab; font-size: 19px; line-height: 1; }
.david888-drag-handle:hover { background: var(--toolbar-bg-hover, #f0f2f4); color: var(--toolbar-accent, #c8654b); }
.david888-drag-handle:active { cursor: grabbing; }

@media (max-width: 640px) {
    .tiptap-editor-shell { padding: 12px 16px 48px; }
    .tiptap-editor-toolbar { top: -12px; margin: -12px -16px 22px; padding: 7px 16px; }
    .tiptap-editor-canvas .ProseMirror { font-size: 16px; }
    .tiptap-editor-canvas .ProseMirror h1 { font-size: 1.9em; }
    .tiptap-slash-menu { position: fixed; right: 12px; bottom: max(12px, env(safe-area-inset-bottom)); left: 12px; width: auto; }
    .david888-drag-handle { display: none !important; }
    .tiptap-bubble-menu { max-width: calc(100vw - 24px); overflow-x: auto; }
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

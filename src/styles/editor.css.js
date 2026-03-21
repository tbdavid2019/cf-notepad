/**
 * src/styles/editor.css.js
 * Editor-specific styles: textarea, preview areas, contents layout
 */
export const getEditorCss = () => `
/* Editor & Preview Areas */
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
}

/* Editor Specific (Dark Mode) */
textarea#contents {
    background-color: #282a36;
    color: #f8f8f2;
    font-family: 'Menlo', 'Monaco', 'Courier New', monospace;
    resize: none;
    line-height: 1.6;
}

/* Preview Specific */
#preview-md, #preview-plain {
    background-color: #fff;
    color: #24292e;
}
`

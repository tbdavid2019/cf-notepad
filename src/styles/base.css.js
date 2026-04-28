/**
 * src/styles/base.css.js
 * Base CSS styles: reset, layout, loading, footer, utilities
 * Returns CSS as a string for inlining in templates
 */
export const getBaseCss = () => `
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

/* Footer */
.footer {
    height: 40px;
    background: #fafbfc;
    border-top: 1px solid #e1e4e8;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 20px;
    font-size: 13px;
    color: #586069;
}
.opt { display: flex; align-items: center; gap: 15px; }
.opt-button { cursor: pointer; padding: 4px 12px; border-radius: 6px; background: #0366d6; color: white; border: none; font-size: 12px; transition: background 0.2s; }
.opt-button:hover { background: #005cc5; }
.opt-switcher { display: flex; align-items: center; cursor: pointer; }
.opt-switcher input { display: none; }
.opt-switcher .slider { width: 32px; height: 16px; background: #ccc; border-radius: 16px; position: relative; transition: .4s; margin-left: 8px; }
.opt-switcher .slider:before { content: ""; position: absolute; height: 12px; width: 12px; left: 2px; bottom: 2px; background: white; border-radius: 50%; transition: .4s; }
.opt-switcher input:checked + .slider { background: #2ea44f; }
.opt-switcher input:checked + .slider:before { transform: translateX(16px); }

/* Diagram Source - Hidden */
.diagram-source { display: none !important; }

/* Mermaid Renderer Specific Fixes */
.diagram-mermaid-render { line-height: normal; font-size: 14px; }
.diagram-mermaid-render svg { max-width: 100%; height: auto; }

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
}

/* Slidev-Lite Theme Extensions */
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700&family=Roboto+Mono&display=swap');

#presentation-container.active {
    font-family: 'Inter', sans-serif;
    background: radial-gradient(circle at 50% 50%, #1e293b 0%, #0f172a 100%);
}

.reveal .slides section {
    text-align: left;
    font-family: 'Inter', sans-serif;
    color: #e2e8f0;
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

.reveal h1, .reveal h2, .reveal h3 {
    color: #fff;
    text-transform: none;
    font-weight: 700;
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
`

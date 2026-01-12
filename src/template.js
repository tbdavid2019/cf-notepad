import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import { CDN_PREFIX, SUPPORTED_LANG, APP_NAME } from './constant'

dayjs.extend(relativeTime)

const SWITCHER = (text, open, className = '') => `
<span class="opt-desc">${text}</span>
<label class="opt-switcher ${className}">
  <input type="checkbox" ${open ? 'checked' : ''}>
  <span class="slider round"></span>
</label>
`
const FOOTER = ({ lang, isEdit, updateAt, pw, vpw, mode, share, shareId, path, views }) => `
    <div class="footer">
        ${isEdit ? `
            <div class="opt">
                <button class="opt-button opt-pw" data-type="edit">${pw ? SUPPORTED_LANG[lang].changePW : SUPPORTED_LANG[lang].setPW}</button>
                <button class="opt-button opt-pw-view" data-type="view">${vpw ? SUPPORTED_LANG[lang].changeViewPW : SUPPORTED_LANG[lang].setViewPW}</button>
                ${SWITCHER('Markdown', mode === 'md', 'opt-mode')}
                ${share && shareId ? `
                    <div class="opt-share-link" style="display:flex;align-items:center;gap:5px;background:#e8f5e9;padding:2px 8px;border-radius:4px;border:1px solid #4caf50;">
                        <span style="font-size:12px;color:#2e7d32;font-weight:500;">✓ 已發布:</span>
                        <input class="share-url-input" readonly value="/share/${shareId}" onclick="this.select()" style="border:none;background:transparent;width:200px;font-size:12px;color:#1976d2;font-weight:500;">
                        <button id="copy-share-btn" style="border:none;background:none;cursor:pointer;opacity:0.8;padding:2px 6px;font-size:16px;" title="Copy">📋</button>
                        <button class="unpublish-btn" style="border:none;background:#ff5722;color:white;cursor:pointer;padding:2px 8px;border-radius:3px;font-size:11px;margin-left:4px;" title="取消發布">✕</button>
                    </div>
                ` : SWITCHER(SUPPORTED_LANG[lang].share, share, 'opt-share')}
            </div>
            ` : (path ? `<a href="/${path}" class="opt-button" style="text-decoration:none;background:#2196f3;color:white;padding:6px 16px;border-radius:4px;font-weight:500;">✏️ 返回編輯</a>` : '')
    }
        <a class="github-link" title="Github" target="_blank" href="https://github.com/tbdavid2019/cf-notepad" rel="noreferrer">
            <svg viewBox="64 64 896 896" focusable="false" data-icon="github" width="1em" height="1em" fill="currentColor" aria-hidden="true"><path d="M511.6 76.3C264.3 76.2 64 276.4 64 523.5 64 718.9 189.3 885 363.8 946c23.5 5.9 19.9-10.8 19.9-22.2v-77.5c-135.7 15.9-141.2-73.9-150.3-88.9C215 726 171.5 718 184.5 703c30.9-15.9 62.4 4 98.9 57.9 26.4 39.1 77.9 32.5 104 26 5.7-23.5 17.9-44.5 34.7-60.8-140.6-25.2-199.2-111-199.2-213 0-49.5 16.3-95 48.3-131.7-20.4-60.5 1.9-112.3 4.9-120 58.1-5.2 118.5 41.6 123.2 45.3 33-8.9 70.7-13.6 112.9-13.6 42.4 0 80.2 4.9 113.5 13.9 11.3-8.6 67.3-48.8 121.3-43.9 2.9 7.7 24.7 58.3 5.5 118 32.4 36.8 48.9 82.7 48.9 132.3 0 102.2-59 188.1-200 212.9a127.5 127.5 0 0138.1 91v112.5c.8 9 0 17.9 15 17.9 177.1-59.7 304.6-227 304.6-424.1 0-247.2-200.4-447.3-447.5-447.3z"></path></svg>
        </a>
        ${views ? `<span class="views-count" style="margin-left:10px;">👁 ${views} views</span>` : ''}
        ${updateAt ? `<span class="last-modified">${SUPPORTED_LANG[lang].lastModified} ${dayjs.unix(updateAt).fromNow()}</span>` : ''}
    </div>
`
const MODAL = lang => `
<div class="modal share-modal">
    <div class="modal-mask"></div>
    <div class="modal-content">
        <span class="close-btn">x</span>
        <div class="modal-body">
            <input type="text" readonly value="" />
            <button class="opt-button">${SUPPORTED_LANG[lang].copy}</button>
        </div>
    </div>
</div>
`
const HTML = ({ lang, title, content, ext = {}, tips, isEdit, showPwPrompt, path, shareId }) => `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${title} - ${APP_NAME}</title>
    <style>
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
/* Flattening the layers structure visually, assuming they were for shadows/borders which we might simplify for full-screen feel or keep */
.layer_1, .layer_2, .layer_3 { height: 100%; display: flex; flex-direction: column; } /* Ensure height propagation */
.layer_3 { flex-direction: row; background: #fff; }

/* Editor & Preview Areas */
.contents {
    flex: 1;
    min-width: 0; /* Prevent flex overflow */
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
    background-color: #282a36; /* Dracula-like dark */
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
.markdown-body { 
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji";
    font-size: 16px;
    line-height: 1.5;
    word-wrap: break-word;
}

.markdown-body h1, .markdown-body h2, .markdown-body h3, .markdown-body h4, .markdown-body h5, .markdown-body h6 {
    margin-top: 24px;
    margin-bottom: 16px;
    font-weight: 600;
    line-height: 1.25;
}
.markdown-body h1 { font-size: 2em; padding-bottom: 0.3em; border-bottom: 1px solid #eaecef; }
.markdown-body h2 { font-size: 1.5em; padding-bottom: 0.3em; border-bottom: 1px solid #eaecef; }
.markdown-body h3 { font-size: 1.25em; }
.markdown-body h4 { font-size: 1em; }

.markdown-body p { margin-top: 0; margin-bottom: 16px; }
.markdown-body blockquote { margin: 0; padding: 0 1em; color: #6a737d; border-left: 0.25em solid #dfe2e5; }
.markdown-body ul, .markdown-body ol { padding-left: 2em; margin-top: 0; margin-bottom: 16px; }

/* Tables (HackMD / GitHub Style) */
.markdown-body table {
    display: block;
    width: 100%;
    overflow: auto;
    margin-top: 0;
    margin-bottom: 16px;
    border-spacing: 0;
    border-collapse: collapse;
}
.markdown-body table tr {
    background-color: #fff;
    border-top: 1px solid #c6cbd1;
}
.markdown-body table tr:nth-child(2n) {
    background-color: #f6f8fa;
}
.markdown-body table th, .markdown-body table td {
    padding: 6px 13px;
    border: 1px solid #dfe2e5;
}
.markdown-body table th {
    font-weight: 600;
    background-color: #f6f8fa; /* Header background */
}
.markdown-body code {
    padding: 0.2em 0.4em;
    margin: 0;
    font-size: 85%;
    background-color: rgba(27,31,35,0.05);
    border-radius: 3px;
    font-family: SFMono-Regular, Consolas, "Liberation Mono", Menlo, monospace;
}
.markdown-body pre {
    padding: 16px;
    overflow: auto;
    font-size: 85%;
    line-height: 1.45;
    background-color: #f6f8fa;
    border-radius: 3px;
}
.markdown-body pre code {
    display: inline;
    padding: 0;
    margin: 0;
    overflow: visible;
    line-height: inherit;
    word-wrap: normal;
    background-color: transparent;
    border: 0;
}
.markdown-body hr {
    height: 0.25em;
    padding: 0;
    margin: 24px 0;
    background-color: #e1e4e8;
    border: 0;
}
.markdown-body a { color: #0366d6; text-decoration: none; }
.markdown-body a:hover { text-decoration: underline; }
.markdown-body img { max-width: 100%; box-sizing: content-box; background-color: #fff; }

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

/* Loading */
#loading { position: fixed; top: 10px; right: 10px; width: 20px; height: 20px; border: 2px solid #f3f3f3; border-top: 2px solid #3498db; border-radius: 50%; animation: spin 1s linear infinite; display: none; z-index: 9999; }
@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }

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

/* Tips/Modals */
.tips { position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); color: #ccc; font-size: 32px; pointer-events: none; }
.modal { display: none; }
.modal-mask { position: fixed; inset: 0; background: rgba(0,0,0,0.5); z-index: 1000; }
.modal-content { position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); background: white; padding: 20px; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.15); z-index: 1001; width: 400px; display: flex; gap: 10px; }
.modal-content input { flex: 1; padding: 8px; border: 1px solid #ddd; border-radius: 4px; }
.modal-content .close-btn { position: absolute; right: 10px; top: 5px; cursor: pointer; font-size: 18px; color: #999; }

/* GitHub Alerts */
.markdown-alert { padding: 8px 16px; margin-bottom: 16px; border-left: 0.25em solid; border-radius: 6px; }
.markdown-alert > :first-child { margin-top: 0; }
.markdown-alert > :last-child { margin-bottom: 0; }

.markdown-alert-note { border-color: #0969da; background-color: #f1f8ff; color: #0d1117;} /* Light theme defaults */
.markdown-alert-note::before { content: "ℹ️ Note"; font-weight: 600; display: block; margin-bottom: 4px; color: #0969da; }

.markdown-alert-tip { border-color: #1a7f37; background-color: #f0fdf4; color: #0d1117;}
.markdown-alert-tip::before { content: "💡 Tip"; font-weight: 600; display: block; margin-bottom: 4px; color: #1a7f37; }

.markdown-alert-important { border-color: #8250df; background-color: #f6f0ff; color: #0d1117;}
.markdown-alert-important::before { content: "💬 Important"; font-weight: 600; display: block; margin-bottom: 4px; color: #8250df; }

.markdown-alert-warning { border-color: #9a6700; background-color: #fff8c5; color: #0d1117;}
.markdown-alert-warning::before { content: "⚠️ Warning"; font-weight: 600; display: block; margin-bottom: 4px; color: #9a6700; }

.markdown-alert-caution { border-color: #cf222e; background-color: #ffebe9; color: #0d1117;}
.markdown-alert-caution::before { content: "🛑 Caution"; font-weight: 600; display: block; margin-bottom: 4px; color: #cf222e; }


/* Diagram Source - Hidden */
.diagram-source { display: none !important; }

    </style>
    <link href="${CDN_PREFIX}/favicon.ico" rel="shortcut icon" type="image/ico" />
</head>
<body>
    <div class="note-container">
        <div class="stack">
            <div class="layer_1">
                <div class="layer_2">
                    <div class="layer_3">
                        ${tips ? `<div class="tips">${tips}</div>` : ''}
                        <textarea id="contents" class="contents ${isEdit ? '' : 'hide'}" spellcheck="false" placeholder="${SUPPORTED_LANG[lang].emptyPH}">${content}</textarea>
                        ${(isEdit && (ext.mode || 'md') === 'md') ? '<div class="divide-line"></div>' : ''}
                        ${tips || (isEdit && (ext.mode || 'md') !== 'md') ? '' : `<div id="preview-${(ext.mode || 'md') === 'md' ? 'md' : 'plain'}" class="contents markdown-body"></div>`}
                    </div>
                </div>
            </div>
        </div>
        ${FOOTER({ ...ext, mode: ext.mode || 'md', isEdit, lang, path, shareId })}
    </div>
    <div id="loading"></div>
    ${MODAL(lang)}
    ${((ext.mode || 'md') === 'md' || ext.share || !isEdit) ? `<script src="${CDN_PREFIX}/dompurify@3.0.6/dist/purify.min.js"></script>` : ''}
    
    <!-- KaTeX CSS -->
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.css">
    
    <!-- Remark / Unified Ecosystem -->
    ${((ext.mode || 'md') === 'md' || !isEdit) ? `
    <script type="module">
        import { unified } from 'https://esm.sh/unified@11.0.4?bundle';
        import remarkParse from 'https://esm.sh/remark-parse@11.0.0?bundle';
        import remarkGfm from 'https://esm.sh/remark-gfm@4.0.0?bundle';
        import remarkMath from 'https://esm.sh/remark-math@6.0.0?bundle';
        import remarkRehype from 'https://esm.sh/remark-rehype@11.1.0?bundle';
        import rehypeKatex from 'https://esm.sh/rehype-katex@7.0.0?bundle';
        import rehypeStringify from 'https://esm.sh/rehype-stringify@10.0.0?bundle';
        import remarkBreaks from 'https://esm.sh/remark-breaks@4.0.0?bundle';
        import { visit } from 'https://esm.sh/unist-util-visit@5.0.0?bundle';

        // GitHub Alerts Plugin
        function remarkGithubAlerts() {
            return (tree) => {
                visit(tree, 'blockquote', (node) => {
                    const paragraph = node.children[0];
                    if (paragraph && paragraph.type === 'paragraph' && paragraph.children[0] && paragraph.children[0].type === 'text') {
                        const text = paragraph.children[0].value;
                        const match = text.match(new RegExp('^\\\\x5B!([A-Z]+)\\\\x5D'));
                        if (match) {
                            const alertType = match[1];
                            const typeLower = alertType.toLowerCase();
                            
                            node.data = node.data || {};
                            node.data.hProperties = node.data.hProperties || {};
                            node.data.hProperties.className = ['markdown-alert', 'markdown-alert-' + typeLower];
                            
                            const markerLength = match[0].length;
                            let newText = text.slice(markerLength);
                            
                            if (!newText.trim()) {
                                paragraph.children.shift();
                            } else {
                                paragraph.children[0].value = newText;
                            }
                        }
                    }
                });
            };
        }

        // Diagram Detection Plugin
        function remarkDiagramPlugin() {
            return (tree) => {
                visit(tree, 'code', (node, index, parent) => {
                    const lang = node.lang;
                    if (!lang) return;
                    
                    // Support aliases
                    let type = null;
                    if (lang === 'mermaid') type = 'mermaid';
                    else if (lang === 'sequence') type = 'sequence';
                    else if (lang === 'flow') type = 'flow';
                    else if (lang === 'graphviz') type = 'graphviz';
                    else if (lang === 'abc') type = 'abc';
                    
                    if (type) {
                        // Transform to HTML node
                        // We use a div with the raw code inside, which we will extract later
                        // escaping: simplistic escaping for extraction safety
                        const safeValue = node.value.replace(/</g, '&lt;').replace(/>/g, '&gt;');
                        parent.children[index] = {
                            type: 'html',
                            value: \`<div class="diagram-\${type}-container diagram-source" style="display:none">\${safeValue}</div><div class="diagram-\${type}-render"></div>\`
                        };
                    }
                });
            };
        }

        const processor = unified()
            .use(remarkParse)
            .use(remarkGithubAlerts)
            .use(remarkDiagramPlugin) // Add diagram plugin
            .use(remarkGfm)
            .use(remarkMath)
            .use(remarkBreaks)
            .use(remarkRehype, { allowDangerousHtml: true }) // Allow our div containers
            .use(rehypeKatex)
            .use(rehypeStringify, { allowDangerousHtml: true });

        // Helper to load scripts
        const loadScript = (src) => new Promise((resolve, reject) => {
            if (document.querySelector(\`script[src = "\${src}"]\`)) return resolve();
            const s = document.createElement('script');
            s.src = src;
            s.onload = resolve;
            s.onerror = reject;
            document.head.appendChild(s);
        });

        // Initialize Diagrams (Lazy Load)
        const initDiagrams = async () => {
            // 1. Mermaid
            const mermaidNodes = document.querySelectorAll('.diagram-mermaid-render');
            console.log('Mermaid nodes found:', mermaidNodes.length);
            
            if (mermaidNodes.length > 0) {
                 const { default: mermaid } = await import('https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.esm.min.mjs');
                 mermaid.initialize({ startOnLoad: false });

                 for (let i = 0; i < mermaidNodes.length; i++) {
                     const renderNode = mermaidNodes[i];
                     const container = renderNode.previousElementSibling;
                     if (container && !renderNode.hasAttribute('data-processed')) {
                         try {
                              const code = container.textContent.replace(/&lt;/g, '<').replace(/&gt;/g, '>');
                              const id = \`mermaid-svg-\${Date.now()}-\${i}\`;
                              console.log('Rendering mermaid:', id);
                              
                              const { svg } = await mermaid.render(id, code);
                              renderNode.innerHTML = svg;
                              renderNode.setAttribute('data-processed', 'true');
                         } catch (e) {
                              console.error('Mermaid render error', e);
                              renderNode.innerHTML = \`<pre style="color:red; background:#fee; padding:10px; border:1px solid red;">Mermaid Render Error: \${e.message}</pre>\`;
                         }
                     }
                 }
            }
            
            // 2. Flowchart.js (Needs Raphael)
            if (document.querySelectorAll('.diagram-flow-render').length > 0) {
                 try {
                     await loadScript('https://cdnjs.cloudflare.com/ajax/libs/raphael/2.3.0/raphael.min.js');
                     await loadScript('https://cdnjs.cloudflare.com/ajax/libs/flowchart/1.17.1/flowchart.min.js');
                     
                     document.querySelectorAll('.diagram-flow-render').forEach(el => {
                         if (el.hasAttribute('data-processed')) return;
                         const code = el.previousElementSibling.textContent.replace(/&lt;/g, '<').replace(/&gt;/g, '>');
                         el.innerHTML = ''; // clear
                         const chart = flowchart.parse(code);
                         chart.drawSVG(el);
                         el.setAttribute('data-processed', 'true');
                     });
                 } catch(e) { console.error('Flowchart load failed', e); }
            }
            
            // 3. Sequence (js-sequence-diagrams) (Needs Raphael, Underscore)
           if (document.querySelectorAll('.diagram-sequence-render').length > 0) {
                 try {
                     await loadScript('https://cdnjs.cloudflare.com/ajax/libs/raphael/2.3.0/raphael.min.js');
                     await loadScript('https://cdnjs.cloudflare.com/ajax/libs/underscore.js/1.13.6/underscore-min.js');
                     await loadScript('https://cdnjs.cloudflare.com/ajax/libs/js-sequence-diagrams/1.0.6/sequence-diagram-min.js');
                     
                     document.querySelectorAll('.diagram-sequence-render').forEach(el => {
                         if (el.hasAttribute('data-processed')) return;
                         const code = el.previousElementSibling.textContent.replace(/&lt;/g, '<').replace(/&gt;/g, '>');
                         el.innerHTML = ''; 
                         const diagram = Diagram.parse(code);
                         diagram.drawSVG(el, {theme: 'simple'});
                         el.setAttribute('data-processed', 'true');
                     });
                 } catch(e) { console.error('Sequence load failed', e); }
            }
            
            // 4. Graphviz (Viz.js)
            if (document.querySelectorAll('.diagram-graphviz-render').length > 0) {
                 try {
                     // Using @hpcc-js/wasm via unpkg or CDN
                     const { Graphviz } = await import('https://cdn.jsdelivr.net/npm/@hpcc-js/wasm/dist/index.js');
                     const graphviz = await Graphviz.load();
                     
                     document.querySelectorAll('.diagram-graphviz-render').forEach(el => {
                         if (el.hasAttribute('data-processed')) return;
                         const code = el.previousElementSibling.textContent.replace(/&lt;/g, '<').replace(/&gt;/g, '>');
                         el.innerHTML = graphviz.layout(code, "svg", "dot");
                         el.setAttribute('data-processed', 'true');
                     });
                 } catch(e) { console.error('Graphviz load failed', e); }
            }
             
            // 5. ABC.js
             if (document.querySelectorAll('.diagram-abc-render').length > 0) {
                 try {
                     await loadScript('https://cdn.jsdelivr.net/npm/abcjs@6.2.2/dist/abcjs-basic-min.js');
                     
                     document.querySelectorAll('.diagram-abc-render').forEach(el => {
                         if (el.hasAttribute('data-processed')) return;
                         const code = el.previousElementSibling.textContent.replace(/&lt;/g, '<').replace(/&gt;/g, '>');
                         ABCJS.renderAbc(el, code);
                         el.setAttribute('data-processed', 'true');
                     });
                 } catch(e) { console.error('ABC load failed', e); }
            }
        }

        window.renderMarkdown = async (node, text) => {
            console.log('Markdown render requested for node:', node);
            if (!node) return;
            try {
                console.time('remark-process');
                const file = await processor.process(text);
                console.timeEnd('remark-process');
                
                const clean = DOMPurify.sanitize(String(file), {
                    ADD_TAGS: ['math', 'annotation', 'semantics', 'mtext', 'mn', 'mo', 'mi', 'sup', 'sub', 'mrow', 'table', 'thead', 'tbody', 'tr', 'td', 'th', 'input', 'div', 'svg', 'path', 'circle', 'rect', 'line', 'text', 'g', 'polygon', 'ellipse'],
                    ADD_ATTR: ['class', 'style', 'aria-hidden', 'viewBox', 'd', 'xmlns', 'type', 'checked', 'disabled', 'width', 'height', 'fill', 'stroke', 'stroke-width', 'transform', 'font-family', 'font-size', 'text-anchor', 'id', 'data-processed'],
                    WHOLE_DOCUMENT: false,
                    FORCE_BODY: true // Ensure it treats it as fragment
                });
                
                node.innerHTML = clean;
                console.log('Sanitized HTML:', clean);
                console.log('Markdown render completed successfully');
                
                // Init Lazy Loaded Diagrams
                initDiagrams();
                
            } catch (e) {
                console.error('Markdown rendering error:', e);
                node.innerHTML = '<p style="color:red">Rendering Error: ' + e.message + '</p>';
            }
        };

        // Trigger initial render if needed (content already loaded)
         window.dispatchEvent(new Event('markdown-ready'));

    </script>
    ` : ''}

<script>
    function makeError(){return new DOMException("The request is not allowed","NotAllowedError")}async function copyClipboardApi(e){if(!navigator.clipboard)throw makeError();return navigator.clipboard.writeText(e)}async function copyExecCommand(e){const o=document.createElement("span");o.textContent=e,o.style.whiteSpace="pre",o.style.webkitUserSelect="auto",o.style.userSelect="all",document.body.appendChild(o);const t=window.getSelection(),n=window.document.createRange();t.removeAllRanges(),n.selectNode(o),t.addRange(n);let r=!1;try{r = window.document.execCommand("copy")}finally{t.removeAllRanges(), window.document.body.removeChild(o)}if(!r)throw makeError()}async function clipboardCopy(e){try{await copyClipboardApi(e)}catch(o){try{await copyExecCommand(e)}catch(e){throw e||o||makeError()}}}

    // Inlined app.js to avoid static file issues
    const DEFAULT_LANG = 'zh-TW'
    const SUPPORTED_LANG = {
        'en': {
        err: 'Error',
    pepw: 'Please enter password.',
    pwcnbe: 'Password is empty!',
    enpw: 'Enter a new password (Keeping it empty will remove the current password)',
    pwss: 'Password set successfully.',
    pwrs: 'Password removed successfully.',
    cpys: 'Copied!',
        },
    'zh': {
        err: '出错了',
    pepw: '请输入密码',
    pwcnbe: '密码不能为空！',
    enpw: '输入新密码（留空可清除当前密码）',
    pwss: '密码设置成功！',
    pwrs: '密码清除成功！',
    cpys: '已复制',
        },
    'zh-TW': {
        err: '出錯了',
    pepw: '請輸入密碼',
    pwcnbe: '密碼不能為空！',
    enpw: '輸入新密碼（留空可清除當前密碼）',
    pwss: '密碼設置成功！',
    pwrs: '密碼清除成功！',
    cpys: '已複製',
        }
    }

    const getI18n = key => {
        const lang = navigator.language || navigator.userLanguage || DEFAULT_LANG
    // First try exact match (e.g., zh-TW)
    if (SUPPORTED_LANG[lang]) {
            return SUPPORTED_LANG[lang][key]
        }
    // Then try base language (e.g., zh from zh-TW)
    const userLang = lang.split('-')[0]
        const targetLang = Object.keys(SUPPORTED_LANG).find(l => l === userLang) || DEFAULT_LANG
    return SUPPORTED_LANG[targetLang][key]
    }

    const errHandle = (err) => {
        alert(getI18n('err') + ': ' + err)
    }

    const throttle = (func, delay) => {
        let tid = null

        return (...arg) => {
            if (tid) return;

            tid = setTimeout(() => {
        func(...arg)
                tid = null
            }, delay)
        }
    }

    const passwdPrompt = () => {
        const passwd = window.prompt(getI18n('pepw'))
    if (passwd == null) return;

    if (!passwd.trim()) {
        alert(getI18n('pwcnbe'))
    }
    const path = location.pathname
    window.fetch(path + '/auth', {
        method: 'POST',
    headers: {
        'Content-Type': 'application/json',
            },
    body: JSON.stringify({
        passwd,
            }),
        })
            .then(res => res.json())
            .then(res => {
                if (res.err !== 0) {
                    return errHandle(res.msg)
                }
    if (res.data.refresh) {
        window.location.reload()
    }
            })
            .catch(err => errHandle(err))
    }

    const renderPlain = (node, text) => {
        if (node) {
        node.innerHTML = DOMPurify.sanitize(text)
    }
    }

    // Wrapper to handle async module loading
    const triggerRender = (node, text) => {
        if (window.renderMarkdown) {
        window.renderMarkdown(node, text)
    } else {
        // Queue it or wait
        window.addEventListener('markdown-ready', () => {
            window.renderMarkdown(node, text)
        }, { once: true })
    }
    }

    window.addEventListener('DOMContentLoaded', function () {
        const $textarea = document.querySelector('#contents')
    const $loading = document.querySelector('#loading')
    const $pwBtn = document.querySelector('.opt-pw')
        const $modeBtn = document.querySelector('.opt-mode > input')
        const $shareBtn = document.querySelector('.opt-share > input')
    const $previewPlain = document.querySelector('#preview-plain')
    const $previewMd = document.querySelector('#preview-md')
    const $shareModal = document.querySelector('.share-modal')
    const $closeBtn = document.querySelector('.share-modal .close-btn')
    const $copyBtn = document.querySelector('.share-modal .opt-button')
    const $shareInput = document.querySelector('.share-modal input')

    renderPlain($previewPlain, $textarea.value)
    triggerRender($previewMd, $textarea.value)

    // Scroll Sync Logic
    let isSyncingLeft = false;
    let isSyncingRight = false;
    let syncTimeout = null;

    const syncScroll = (source, target) => {
        const percentage = source.scrollTop / (source.scrollHeight - source.clientHeight);
    target.scrollTop = percentage * (target.scrollHeight - target.clientHeight);
    }

    if ($textarea && ($previewMd || $previewPlain)) {
        const $preview = $previewMd || $previewPlain;

        $textarea.addEventListener('scroll', () => {
            if (isSyncingLeft) return;
    isSyncingRight = true;
    syncScroll($textarea, $preview);
    clearTimeout(syncTimeout);
            syncTimeout = setTimeout(() => isSyncingRight = false, 50);
        });

        $preview.addEventListener('scroll', () => {
            if (isSyncingRight) return;
    isSyncingLeft = true;
    syncScroll($preview, $textarea);
    clearTimeout(syncTimeout);
            syncTimeout = setTimeout(() => isSyncingLeft = false, 50);
        });
    }

    // Resizable Split Pane Logic
    const $resizer = document.querySelector('.divide-line');
    if ($resizer && $textarea && ($previewMd || $previewPlain)) {
        const $preview = $previewMd || $previewPlain;
        
        let x = 0;
        let leftWidth = 0;
        let parentWidth = 0;

        const mouseDownHandler = function(e) {
            x = e.clientX;
            const leftRect = $textarea.getBoundingClientRect();
            leftWidth = leftRect.width;
            parentWidth = $resizer.parentNode.getBoundingClientRect().width;

            document.addEventListener('mousemove', mouseMoveHandler);
            document.addEventListener('mouseup', mouseUpHandler);
            
            $resizer.style.borderLeft = '1px solid #0366d6';
            $resizer.style.borderRight = '1px solid #0366d6';
            document.body.style.cursor = 'col-resize';
            $textarea.style.pointerEvents = 'none';
            $preview.style.pointerEvents = 'none';
        };

        const mouseMoveHandler = function(e) {
            const dx = e.clientX - x;
            const newLeftPercent = ((leftWidth + dx) * 100) / parentWidth;
            
            // Constrain
            if (newLeftPercent < 10) return;
            if (newLeftPercent > 90) return;

            $textarea.style.flex = \`0 0 \${newLeftPercent}%\`;
            $preview.style.flex = \`0 0 calc(\${100 - newLeftPercent}% - 8px)\`;
        };

        const mouseUpHandler = function() {
            document.removeEventListener('mousemove', mouseMoveHandler);
            document.removeEventListener('mouseup', mouseUpHandler);
            
            $resizer.style.borderLeft = null;
            $resizer.style.borderRight = null;
            document.body.style.cursor = null;
            $textarea.style.removeProperty('pointer-events');
            $preview.style.removeProperty('pointer-events');
        };

        $resizer.addEventListener('mousedown', mouseDownHandler);
    }

    if ($textarea) {
            // Paste Image Handler
            if (window.ENABLE_R2) {
        $textarea.addEventListener('paste', function (e) {
            const items = (e.clipboardData || e.originalEvent.clipboardData).items
            for (let index in items) {
                const item = items[index]
                if (item.kind === 'file' && item.type.startsWith('image/')) {
                    e.preventDefault()
                    const blob = item.getAsFile()

                    // Insert loading text
                    const start = $textarea.selectionStart
                    const loadingText = '![Uploading...]()'
                    $textarea.value = $textarea.value.substring(0, start) + loadingText + $textarea.value.substring($textarea.selectionEnd)
                    $textarea.selectionStart = $textarea.selectionEnd = start + loadingText.length

                    const formData = new FormData()
                    formData.append('image', blob)

                    window.fetch('/upload', {
                        method: 'POST',
                        body: formData
                    })
                        .then(res => res.json())
                        .then(res => {
                            if (res.err === 0) {
                                const url = res.data
                                const imageText = '![image](' + url + ')'
                                $textarea.value = $textarea.value.replace(loadingText, imageText)
                                triggerRender($previewMd, $textarea.value)
                            } else {
                                $textarea.value = $textarea.value.replace(loadingText, '[Upload Failed: ' + res.msg + ']')
                                alert('Upload Failed: ' + res.msg)
                            }
                        })
                        .catch(err => {
                            $textarea.value = $textarea.value.replace(loadingText, '[Upload Failed]')
                            alert('Upload Error: ' + err)
                        })
                    return;
                }
            }
        })
    }

    $textarea.oninput = throttle(function () {
        triggerRender($previewMd, $textarea.value)

                $loading.style.display = 'inline-block'
    const data = {
        t: $textarea.value,
                }

    window.fetch('', {
        method: 'POST',
    headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
                    },
    body: new URLSearchParams(data),
                })
                    .then(res => res.json())
                    .then(res => {
                        if (res.err !== 0) {
        errHandle(res.msg)
    }
                    })
                    .catch(err => errHandle(err))
                    .finally(() => {
        $loading.style.display = 'none'
    })
            }, 1000)
        }

        // Password button handlers
        const bindPwHandler = (btnSelector, type) => {
            const btn = document.querySelector(btnSelector);
    if (btn) {
        btn.onclick = function () {
            const passwd = window.prompt(getI18n('enpw'))
            if (passwd == null) return;

            const path = window.location.pathname
            window.fetch(path + '/pw', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    passwd: passwd.trim(),
                    type: type,
                }),
            })
                .then(res => res.json())
                .then(res => {
                    if (res.err !== 0) {
                        return errHandle(res.msg)
                    }
                    alert(passwd ? getI18n('pwss') : getI18n('pwrs'))
                    location.reload()
                })
                .catch(err => errHandle(err))
        }
    }
        }

    bindPwHandler('.opt-pw', 'edit');
    bindPwHandler('.opt-pw-view', 'view');

    if ($modeBtn) {
        $modeBtn.onclick = function (e) {
            const isMd = e.target.checked
            const path = window.location.pathname
            window.fetch(path + '/setting', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    mode: isMd ? 'md' : 'plain',
                }),
            })
                .then(res => res.json())
                .then(res => {
                    if (res.err !== 0) {
                        return errHandle(res.msg)
                    }

                    window.location.reload()
                })
                .catch(err => errHandle(err))
        }
    }

        // Handle published share URL
    const $shareUrlInput = document.querySelector('.share-url-input');
    const $shareCopyBtn = document.querySelector('#copy-share-btn');
    const $unpublishBtn = document.querySelector('.unpublish-btn');

    if ($shareUrlInput && $shareCopyBtn) {
            // Update input with full URL
            try {
                const currentValue = $shareUrlInput.getAttribute('value') || $shareUrlInput.value;
    $shareUrlInput.value = window.location.origin + currentValue;
            } catch(e) {
        console.error('Failed to update share URL:', e);
            }

            // Copy button handler
            $shareCopyBtn.addEventListener('click', async () => {
                try {
        await clipboardCopy($shareUrlInput.value);
    const originalText = $shareCopyBtn.innerText;
    $shareCopyBtn.innerText = '✅';
                    setTimeout(() => $shareCopyBtn.innerText = originalText, 2000);
                } catch (e) {
        alert('Copy failed');
                }
            });
        }

    // Unpublish button handler
    if ($unpublishBtn) {
        $unpublishBtn.addEventListener('click', () => {
            if (!confirm('確定要取消發布此分享連結嗎？')) return;

            const path = window.location.pathname;
            window.fetch(path + '/setting', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ share: false }),
            })
                .then(res => res.json())
                .then(res => {
                    if (res.err !== 0) {
                        return errHandle(res.msg);
                    }
                    window.location.reload();
                })
                .catch(err => errHandle(err));
        });
        }

    if ($shareBtn) {
        $shareBtn.onclick = function (e) {
            const isShare = e.target.checked
            const path = window.location.pathname
            window.fetch(path + '/setting', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    share: isShare,
                }),
            })
                .then(res => res.json())
                .then(res => {
                    if (res.err !== 0) {
                        return errHandle(res.msg)
                    }

                    if (isShare) {
                        const origin = window.location.origin
                        const url = origin + '/share/' + res.data
                        // show modal
                        $shareInput.value = url
                        $shareModal.style.display = 'block'
                    }
                })
                .catch(err => errHandle(err))
        }
    }

    if ($shareModal) {
        $closeBtn.onclick = function () {
            $shareModal.style.display = 'none'

        }
            $copyBtn.onclick = function () {
        clipboardCopy($shareInput.value)
                const originText = $copyBtn.innerHTML
    const originColor = $copyBtn.style.background
    $copyBtn.innerHTML = getI18n('cpys')
    $copyBtn.style.background = 'orange'
                window.setTimeout(() => {
        $shareModal.style.display = 'none'
                    $copyBtn.innerHTML = originText
    $copyBtn.style.background = originColor
                }, 1500)
            }
        }

    })
</script>
    ${ext.enableR2 ? '<script>window.ENABLE_R2=true</script>' : ''}
    ${showPwPrompt ? '<script>passwdPrompt()</script>' : ''}
</body >
</html >
    `

export const Edit = data => HTML({ isEdit: true, ...data })
export const Share = data => HTML(data)
export const NeedPasswd = data => HTML({ tips: SUPPORTED_LANG[data.lang].tipEncrypt, showPwPrompt: true, ...data })
export const Page404 = data => HTML({ tips: SUPPORTED_LANG[data.lang].tip404, ...data })

export const Admin = ({ lang, notes, error }) => `
    < !DOCTYPE html >
        <html>
            <head>
                <meta charset="utf-8" />
                <meta name="viewport" content="width=device-width, initial-scale=1.0" />
                <title>Admin — Cloud Notepad</title>
                <link href="${CDN_PREFIX}/favicon.ico" rel="shortcut icon" type="image/ico" />
                <link href="${CDN_PREFIX}/css/app.min.css" rel="stylesheet" media="screen" />
                <style>
                    body {font - family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; background-color: #f0f2f5; padding: 20px; }
                    .admin-container {max - width: 900px; margin: 0 auto; background: #fff; padding: 30px; border-radius: 8px; box-shadow: 0 2px 12px rgba(0,0,0,0.1); }
                    h1 {margin - top: 0; color: #333; }
                    table {width: 100%; border-collapse: collapse; margin-top: 20px; }
                    th, td {padding: 12px 15px; text-align: left; border-bottom: 1px solid #eee; }
                    th {background - color: #f8f9fa; font-weight: 600; color: #555; cursor: pointer; user-select: none; position: relative; }
                    th:hover {background - color: #e9ecef; }
                    th::after {content: '↕'; position: absolute; right: 8px; opacity: 0.3; font-size: 12px; }
                    th.asc::after {content: '↑'; opacity: 1; }
                    th.desc::after {content: '↓'; opacity: 1; }
                    tr:hover {background - color: #f5f5f5; }
                    a {color: #007bff; text-decoration: none; }
                    a:hover {text - decoration: underline; }
                    .login-form {text - align: center; margin-top: 40px; }
                    .login-form input {padding: 12px; margin: 10px 0; width: 100%; max-width: 300px; border: 1px solid #ddd; border-radius: 4px; box-sizing: border-box; }
                    .login-form button {padding: 12px 40px; background-color: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 16px; transition: background 0.2s; }
                    .login-form button:hover {background - color: #0056b3; }
                    .error {background - color: #ffebee; color: #c62828; padding: 12px; border-radius: 4px; margin-bottom: 20px; border: 1px solid #ffcdd2; }
                </style>
            </head>
            <body>
                <div class="admin-container">
                    <h1>Cloud Notepad Admin</h1>
                    ${error ? `<div class="error">${error}</div>` : ''}
                    ${notes ? `
    <div style="margin-bottom: 15px; display: flex; gap: 10px; align-items: center;">
        <button id="batch-delete-btn" onclick="batchDelete()" disabled style="padding: 8px 16px; background-color: #dc3545; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 14px; opacity: 0.5;">
            🗑 刪除選中項
        </button>
        <form method="POST" style="display: inline; margin: 0;">
            <input type="hidden" name="action" value="delete-empty">
            <button type="submit" style="padding: 8px 16px; background-color: #ff9800; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 14px;">
                🧹 刪除所有空白頁面
            </button>
        </form>
        <span id="selected-count" style="color: #666; font-size: 14px;"></span>
    </div>
    <table id="notesTable">
        <thead>
            <tr>
                <th style="width: 40px; cursor: default;">
                    <input type="checkbox" id="select-all" onchange="toggleSelectAll(this)" style="cursor: pointer;">
                </th>
                <th onclick="sortTable(1)">Title / URL</th>
                <th onclick="sortTable(2)">Views</th>
                <th onclick="sortTable(3)">Password</th>
                <th onclick="sortTable(4)">Last Modified</th>
                <th style="cursor: default;">Action</th>
            </tr>
        </thead>
        <tbody>
            ${notes.map(n => `
            <tr>
                <td>
                    <input type="checkbox" class="note-checkbox" value="${n.name}" onchange="updateBatchDeleteButton()" style="cursor: pointer;">
                </td>
                <td data-val="${n.extractedTitle || decodeURIComponent(n.name)}">
                    ${n.extractedTitle ? `
                        <a href="/${n.name}" target="_blank" style="font-weight:500;">${n.extractedTitle}</a>
                        <br><small style="color:#888;">/${decodeURIComponent(n.name)}</small>
                    ` : `
                        <a href="/${n.name}" target="_blank">${decodeURIComponent(n.name)}</a>
                    `}
                </td>
                <td data-val="${n.metadata?.views || 0}">${n.metadata?.views || 0}</td>
                <td data-val="${n.metadata?.pw ? 1 : 0}">${n.metadata?.pw ? '🔒 Yes' : '—'}</td>
                <td data-val="${n.metadata?.updateAt || 0}">${n.metadata?.updateAt ? dayjs.unix(n.metadata.updateAt).fromNow() : '-'}</td>
                <td>
                    <form method="POST" onsubmit="return confirm('Delete this note?');" style="display:inline;">
                        <input type="hidden" name="action" value="delete" />
                        <input type="hidden" name="path" value="${n.name}" />
                        <button type="submit" style="background:none;border:none;cursor:pointer;color:red;">🗑</button>
                    </form>
                </td>
            </tr>
            `).join('')}
        </tbody>
    </table>
    <script>
    function toggleSelectAll(source) {
        checkboxes = document.querySelectorAll('.note-checkbox');
        for(var i=0, n=checkboxes.length;i<n;i++) {
            checkboxes[i].checked = source.checked;
        }
        updateBatchDeleteButton();
    }

    function updateBatchDeleteButton() {
        const selectedCheckboxes = document.querySelectorAll('.note-checkbox:checked');
        const batchDeleteBtn = document.getElementById('batch-delete-btn');
        const selectedCountSpan = document.getElementById('selected-count');
        
        if (selectedCheckboxes.length > 0) {
            batchDeleteBtn.disabled = false;
            batchDeleteBtn.style.opacity = '1';
            batchDeleteBtn.style.cursor = 'pointer';
            selectedCountSpan.textContent = '已選中 ' + selectedCheckboxes.length + ' 項';
        } else {
            batchDeleteBtn.disabled = true;
            batchDeleteBtn.style.opacity = '0.5';
            batchDeleteBtn.style.cursor = 'not-allowed';
            selectedCountSpan.textContent = '';
        }

        const allCheckboxes = document.querySelectorAll('.note-checkbox');
        const selectAllCheckbox = document.getElementById('select-all');
        if (allCheckboxes.length > 0 && selectedCheckboxes.length === allCheckboxes.length) {
            selectAllCheckbox.checked = true;
        } else {
            selectAllCheckbox.checked = false;
        }
    }

    async function batchDelete() {
        const selectedCheckboxes = document.querySelectorAll('.note-checkbox:checked');
        if (selectedCheckboxes.length === 0) {
            alert('請選擇要刪除的筆記。');
            return;
        }

        if (!confirm('確定要刪除這 ' + selectedCheckboxes.length + ' 個筆記嗎？')) {
            return;
        }

        const pathsToDelete = Array.from(selectedCheckboxes).map(cb => cb.value);

        try {
            const response = await fetch(window.location.pathname, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    action: 'batch-delete',
                    paths: pathsToDelete,
                }),
            });

            const result = await response.json();

            if (result.success) {
                alert('選中的筆記已成功刪除！');
                location.reload();
            } else {
                alert('刪除失敗: ' + (result.message || '未知錯誤'));
            }
        } catch (error) {
            console.error('Error during batch delete:', error);
            alert('刪除過程中發生錯誤。');
        }
    }

    async function deleteEmptyPages() {
        if (!confirm('確定要刪除所有空白頁面嗎？此操作無法撤銷！\n\n空白頁面定義：內容長度 ≤ 10 個字符')) {
            return;
        }

        const btn = document.getElementById('delete-empty-btn');
        const originalText = btn.innerHTML;
        btn.innerHTML = '⏳ 清理中...';
        btn.disabled = true;

        try {
            const response = await fetch(window.location.pathname, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'delete-empty' }),
            });

            const result = await response.json();

            if (result.success) {
                alert('成功刪除 ' + result.deleted + ' 個空白頁面！');
                if (result.errors.length > 0) {
                    console.warn('部分頁面刪除失敗:', result.errors);
                }
                location.reload();
            } else {
                alert('刪除失敗: ' + (result.message || '未知錯誤'));
            }
        } catch (error) {
            console.error('Error during empty page deletion:', error);
            alert('刪除過程中發生錯誤。');
        } finally {
            btn.innerHTML = originalText;
            btn.disabled = false;
        }
    }

    function sortTable(n) {
        var table, rows, switching, i, x, y, shouldSwitch, dir, switchcount = 0;
        table = document.getElementById("notesTable");
        switching = true;
        dir = "asc";
        
        // Reset headers
        var headers = table.getElementsByTagName("th");
        for (var h = 0; h < headers.length; h++) {
            headers[h].classList.remove("asc", "desc");
        }

        while (switching) {
            switching = false;
            rows = table.rows;
            for (i = 1; i < (rows.length - 1); i++) {
                shouldSwitch = false;
                x = rows[i].getElementsByTagName("TD")[n];
                y = rows[i + 1].getElementsByTagName("TD")[n];
                
                var xVal = x.getAttribute('data-val') || x.innerHTML.toLowerCase();
                var yVal = y.getAttribute('data-val') || y.innerHTML.toLowerCase();
                
                // Try number 
                if (!isNaN(xVal) && !isNaN(yVal)) {
                    xVal = parseFloat(xVal);
                    yVal = parseFloat(yVal);
                }

                if (dir == "asc") {
                    if (xVal > yVal) { shouldSwitch = true; break; }
                } else if (dir == "desc") {
                    if (xVal < yVal) { shouldSwitch = true; break; }
                }
            }
            if (shouldSwitch) {
                rows[i].parentNode.insertBefore(rows[i + 1], rows[i]);
                switching = true;
                switchcount ++;
            } else {
                if (switchcount == 0 && dir == "asc") {
                    dir = "desc";
                    switching = true;
                }
            }
        }
        // Set header class
        headers[n].classList.add(dir);
    }
    </script>
    ` : `
    <form method="POST" class="login-form">
        <input type="password" name="password" placeholder="Enter Admin Password" required />
        <br />
        <button type="submit">Login</button>
    </form>
    `}
                </div>
            </body>
        </html>
`
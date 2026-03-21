/**
 * src/templates/base.js
 * HTML wrapper function (base page structure for editor/share pages)
 */
import { CDN_PREFIX, SUPPORTED_LANG, APP_NAME } from '../constant'
import { THEMES } from '../theme_data'
import { FOOTER, MODAL } from './common'
import { getBaseCss } from '../styles/base.css.js'
import { getEditorCss } from '../styles/editor.css.js'
import { getMarkdownCss } from '../styles/markdown.css.js'

export const HTML = ({ lang, title, content, ext = {}, tips, isEdit, showPwPrompt, path, shareId }) => `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${title} - ${APP_NAME}</title>
    <style>
${getBaseCss()}
${getEditorCss()}
${getMarkdownCss()}
    </style>
    <style id="theme-style">${THEMES[ext.theme || 'github-light'] || ''}</style>
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
                    
                    let type = null;
                    if (lang === 'mermaid') type = 'mermaid';
                    else if (lang === 'sequence') type = 'sequence';
                    else if (lang === 'flow') type = 'flow';
                    else if (lang === 'graphviz') type = 'graphviz';
                    else if (lang === 'abc') type = 'abc';
                    
                    if (type) {
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
            .use(remarkDiagramPlugin)
            .use(remarkGfm)
            .use(remarkMath)
            .use(remarkBreaks)
            .use(remarkRehype, { allowDangerousHtml: true })
            .use(rehypeKatex)
            .use(rehypeStringify, { allowDangerousHtml: true });

        const loadScript = (src) => new Promise((resolve, reject) => {
            if (document.querySelector(\`script[src = "\${src}"]\`)) return resolve();
            const s = document.createElement('script');
            s.src = src;
            s.onload = resolve;
            s.onerror = reject;
            document.head.appendChild(s);
        });

        const initDiagrams = async () => {
            const mermaidNodes = document.querySelectorAll('.diagram-mermaid-render');
            if (mermaidNodes.length > 0) {
                 const { default: mermaid } = await import('https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.esm.min.mjs');
                 mermaid.initialize({ startOnLoad: false, securityLevel: 'loose', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif' });
                 for (let i = 0; i < mermaidNodes.length; i++) {
                     const renderNode = mermaidNodes[i];
                     const container = renderNode.previousElementSibling;
                     if (container && !renderNode.hasAttribute('data-processed')) {
                         try {
                              const code = container.textContent.replace(/&lt;/g, '<').replace(/&gt;/g, '>');
                              const id = \`mermaid-svg-\${Date.now()}-\${i}\`;
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
            
            if (document.querySelectorAll('.diagram-flow-render').length > 0) {
                 try {
                     await loadScript('https://cdnjs.cloudflare.com/ajax/libs/raphael/2.3.0/raphael.min.js');
                     await loadScript('https://cdnjs.cloudflare.com/ajax/libs/flowchart/1.17.1/flowchart.min.js');
                     document.querySelectorAll('.diagram-flow-render').forEach(el => {
                         if (el.hasAttribute('data-processed')) return;
                         const code = el.previousElementSibling.textContent.replace(/&lt;/g, '<').replace(/&gt;/g, '>');
                         el.innerHTML = '';
                         const chart = flowchart.parse(code);
                         chart.drawSVG(el);
                         el.setAttribute('data-processed', 'true');
                     });
                 } catch(e) { console.error('Flowchart load failed', e); }
            }
            
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
            
            if (document.querySelectorAll('.diagram-graphviz-render').length > 0) {
                 try {
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
            if (!node) return;
            try {
                const file = await processor.process(text);
                const clean = DOMPurify.sanitize(String(file), {
                    ADD_TAGS: ['math', 'annotation', 'semantics', 'mtext', 'mn', 'mo', 'mi', 'sup', 'sub', 'mrow', 'table', 'thead', 'tbody', 'tr', 'td', 'th', 'input', 'div', 'svg', 'path', 'circle', 'rect', 'line', 'text', 'g', 'polygon', 'ellipse'],
                    ADD_ATTR: ['class', 'style', 'aria-hidden', 'viewBox', 'd', 'xmlns', 'type', 'checked', 'disabled', 'width', 'height', 'fill', 'stroke', 'stroke-width', 'transform', 'font-family', 'font-size', 'text-anchor', 'id', 'data-processed'],
                    WHOLE_DOCUMENT: false,
                    FORCE_BODY: true
                });
                node.innerHTML = clean;
                initDiagrams();
            } catch (e) {
                console.error('Markdown rendering error:', e);
                node.innerHTML = '<p style="color:red">Rendering Error: ' + e.message + '</p>';
            }
        };

        window.dispatchEvent(new Event('markdown-ready'));

    </script>
    ` : ''}

<script>
    function makeError(){return new DOMException("The request is not allowed","NotAllowedError")}async function copyClipboardApi(e){if(!navigator.clipboard)throw makeError();return navigator.clipboard.writeText(e)}async function copyExecCommand(e){const o=document.createElement("span");o.textContent=e,o.style.whiteSpace="pre",o.style.webkitUserSelect="auto",o.style.userSelect="all",document.body.appendChild(o);const t=window.getSelection(),n=window.document.createRange();t.removeAllRanges(),n.selectNode(o),t.addRange(n);let r=!1;try{r = window.document.execCommand("copy")}finally{t.removeAllRanges(), window.document.body.removeChild(o)}if(!r)throw makeError()}async function clipboardCopy(e){try{await copyClipboardApi(e)}catch(o){try{await copyExecCommand(e)}catch(e){throw e||o||makeError()}}}

    const DEFAULT_LANG = 'zh-TW'
    const SUPPORTED_LANG = {
        'en': { err: 'Error', pepw: 'Please enter password.', pwcnbe: 'Password is empty!', enpw: 'Enter a new password (Keeping it empty will remove the current password)', pwss: 'Password set successfully.', pwrs: 'Password removed successfully.', cpys: 'Copied!' },
        'zh': { err: '出错了', pepw: '请输入密码', pwcnbe: '密码不能为空！', enpw: '输入新密码（留空可清除当前密码）', pwss: '密码设置成功！', pwrs: '密码清除成功！', cpys: '已复制' },
        'zh-TW': { err: '出錯了', pepw: '請輸入密碼', pwcnbe: '密碼不能為空！', enpw: '輸入新密碼（留空可清除當前密碼）', pwss: '密碼設置成功！', pwrs: '密碼清除成功！', cpys: '已複製' }
    }

    const getI18n = key => {
        const lang = navigator.language || navigator.userLanguage || DEFAULT_LANG
        if (SUPPORTED_LANG[lang]) return SUPPORTED_LANG[lang][key]
        const userLang = lang.split('-')[0]
        const targetLang = Object.keys(SUPPORTED_LANG).find(l => l === userLang) || DEFAULT_LANG
        return SUPPORTED_LANG[targetLang][key]
    }

    const errHandle = (err) => { alert(getI18n('err') + ': ' + err) }

    const throttle = (func, delay) => {
        let tid = null
        return (...arg) => {
            if (tid) return;
            tid = setTimeout(() => { func(...arg); tid = null }, delay)
        }
    }

    const passwdPrompt = () => {
        const passwd = window.prompt(getI18n('pepw'))
        if (passwd == null) return;
        if (!passwd.trim()) { alert(getI18n('pwcnbe')) }
        const path = location.pathname
        window.fetch(path + '/auth', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ passwd }) })
            .then(res => res.json())
            .then(res => { if (res.err !== 0) { return errHandle(res.msg) } if (res.data.refresh) { window.location.reload() } })
            .catch(err => errHandle(err))
    }

    const renderPlain = (node, text) => { if (node) { node.innerHTML = DOMPurify.sanitize(text) } }

    const triggerRender = (node, text) => {
        if (window.renderMarkdown) { window.renderMarkdown(node, text) }
        else { window.addEventListener('markdown-ready', () => { window.renderMarkdown(node, text) }, { once: true }) }
    }

    window.addEventListener('DOMContentLoaded', function () {
        const $textarea = document.querySelector('#contents')
        const $loading = document.querySelector('#loading')
        const $modeBtn = document.querySelector('.opt-mode > input')
        const $shareBtn = document.querySelector('.opt-share > input')
        const $previewPlain = document.querySelector('#preview-plain')
        const $previewMd = document.querySelector('#preview-md')
        const $shareModal = document.querySelector('.share-modal')
        const $closeBtn = document.querySelector('.share-modal .close-btn')
        const $copyBtn = document.querySelector('.share-modal .opt-button')
        const $shareInput = document.querySelector('.share-modal input')

        renderPlain($previewPlain, $textarea ? $textarea.value : '')
        triggerRender($previewMd, $textarea ? $textarea.value : '')

        // Scroll Sync
        let isSyncingLeft = false, isSyncingRight = false, syncTimeout = null;
        const syncScroll = (source, target) => {
            const percentage = source.scrollTop / (source.scrollHeight - source.clientHeight);
            target.scrollTop = percentage * (target.scrollHeight - target.clientHeight);
        }
        if ($textarea && ($previewMd || $previewPlain)) {
            const $preview = $previewMd || $previewPlain;
            $textarea.addEventListener('scroll', () => {
                if (isSyncingLeft) return; isSyncingRight = true; syncScroll($textarea, $preview);
                clearTimeout(syncTimeout); syncTimeout = setTimeout(() => isSyncingRight = false, 50);
            });
            $preview.addEventListener('scroll', () => {
                if (isSyncingRight) return; isSyncingLeft = true; syncScroll($preview, $textarea);
                clearTimeout(syncTimeout); syncTimeout = setTimeout(() => isSyncingLeft = false, 50);
            });
        }

        // Resizable Split Pane
        const $resizer = document.querySelector('.divide-line');
        if ($resizer && $textarea && ($previewMd || $previewPlain)) {
            const $preview = $previewMd || $previewPlain;
            let x = 0, leftWidth = 0, parentWidth = 0;
            const mouseDownHandler = function(e) {
                x = e.clientX; leftWidth = $textarea.getBoundingClientRect().width;
                parentWidth = $resizer.parentNode.getBoundingClientRect().width;
                document.addEventListener('mousemove', mouseMoveHandler); document.addEventListener('mouseup', mouseUpHandler);
                $resizer.style.borderLeft = '1px solid #0366d6'; $resizer.style.borderRight = '1px solid #0366d6';
                document.body.style.cursor = 'col-resize'; $textarea.style.pointerEvents = 'none'; $preview.style.pointerEvents = 'none';
            };
            const mouseMoveHandler = function(e) {
                const dx = e.clientX - x; const newLeftPercent = ((leftWidth + dx) * 100) / parentWidth;
                if (newLeftPercent < 10 || newLeftPercent > 90) return;
                $textarea.style.flex = \`0 0 \${newLeftPercent}%\`; $preview.style.flex = \`0 0 calc(\${100 - newLeftPercent}% - 8px)\`;
            };
            const mouseUpHandler = function() {
                document.removeEventListener('mousemove', mouseMoveHandler); document.removeEventListener('mouseup', mouseUpHandler);
                $resizer.style.borderLeft = null; $resizer.style.borderRight = null; document.body.style.cursor = null;
                $textarea.style.removeProperty('pointer-events'); $preview.style.removeProperty('pointer-events');
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
                            const start = $textarea.selectionStart
                            const loadingText = '![Uploading...]()'
                            $textarea.value = $textarea.value.substring(0, start) + loadingText + $textarea.value.substring($textarea.selectionEnd)
                            $textarea.selectionStart = $textarea.selectionEnd = start + loadingText.length
                            const formData = new FormData()
                            formData.append('image', blob)
                            window.fetch('/upload', { method: 'POST', body: formData })
                                .then(res => res.json())
                                .then(res => {
                                    if (res.err === 0) { $textarea.value = $textarea.value.replace(loadingText, '![image](' + res.data + ')'); triggerRender($previewMd, $textarea.value) }
                                    else { $textarea.value = $textarea.value.replace(loadingText, '[Upload Failed: ' + res.msg + ']'); alert('Upload Failed: ' + res.msg) }
                                })
                                .catch(err => { $textarea.value = $textarea.value.replace(loadingText, '[Upload Failed]'); alert('Upload Error: ' + err) })
                            return;
                        }
                    }
                })
            }

            $textarea.oninput = throttle(function () {
                triggerRender($previewMd, $textarea.value)
                $loading.style.display = 'inline-block'
                window.fetch('', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: new URLSearchParams({ t: $textarea.value }) })
                    .then(res => res.json())
                    .then(res => { if (res.err !== 0) { errHandle(res.msg) } })
                    .catch(err => errHandle(err))
                    .finally(() => { $loading.style.display = 'none' })
            }, 1000)
        }

        // Password buttons
        const bindPwHandler = (btnSelector, type) => {
            const btn = document.querySelector(btnSelector);
            if (btn) { btn.onclick = function () {
                const passwd = window.prompt(getI18n('enpw'))
                if (passwd == null) return;
                window.fetch(window.location.pathname + '/pw', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ passwd: passwd.trim(), type }) })
                    .then(res => res.json())
                    .then(res => { if (res.err !== 0) { return errHandle(res.msg) } alert(passwd ? getI18n('pwss') : getI18n('pwrs')); location.reload() })
                    .catch(err => errHandle(err))
            }}
        }
        bindPwHandler('.opt-pw', 'edit');
        bindPwHandler('.opt-pw-view', 'view');

        if ($modeBtn) {
            $modeBtn.onclick = function (e) {
                const isMd = e.target.checked
                window.fetch(window.location.pathname + '/setting', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ mode: isMd ? 'md' : 'plain' }) })
                    .then(res => res.json()).then(res => { if (res.err !== 0) { return errHandle(res.msg) } window.location.reload() }).catch(err => errHandle(err))
            }
        }

        // Published share URL
        const $shareUrlInput = document.querySelector('.share-url-input');
        const $shareCopyBtn = document.querySelector('#copy-share-btn');
        const $unpublishBtn = document.querySelector('.unpublish-btn');
        if ($shareUrlInput && $shareCopyBtn) {
            try { $shareUrlInput.value = window.location.origin + ($shareUrlInput.getAttribute('value') || $shareUrlInput.value); } catch(e) {}
            $shareCopyBtn.addEventListener('click', async () => {
                try { await clipboardCopy($shareUrlInput.value); const orig = $shareCopyBtn.innerText; $shareCopyBtn.innerText = '✅'; setTimeout(() => $shareCopyBtn.innerText = orig, 2000); } catch (e) { alert('Copy failed'); }
            });
        }
        if ($unpublishBtn) {
            $unpublishBtn.addEventListener('click', () => {
                if (!confirm('確定要取消發布此分享連結嗎？')) return;
                window.fetch(window.location.pathname + '/setting', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ share: false }) })
                    .then(res => res.json()).then(res => { if (res.err !== 0) { return errHandle(res.msg); } window.location.reload(); }).catch(err => errHandle(err));
            });
        }

        if ($shareBtn) {
            $shareBtn.onclick = function (e) {
                const isShare = e.target.checked
                window.fetch(window.location.pathname + '/setting', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ share: isShare }) })
                    .then(res => res.json())
                    .then(res => { if (res.err !== 0) { return errHandle(res.msg) } if (isShare) { $shareInput.value = window.location.origin + '/share/' + res.data; $shareModal.style.display = 'block' } })
                    .catch(err => errHandle(err))
            }
        }

        if ($shareModal) {
            $closeBtn.onclick = function () { $shareModal.style.display = 'none' }
            $copyBtn.onclick = function () {
                clipboardCopy($shareInput.value)
                const originText = $copyBtn.innerHTML; const originColor = $copyBtn.style.background;
                $copyBtn.innerHTML = getI18n('cpys'); $copyBtn.style.background = 'orange';
                window.setTimeout(() => { $shareModal.style.display = 'none'; $copyBtn.innerHTML = originText; $copyBtn.style.background = originColor; }, 1500)
            }
        }
    })
</script>
    ${ext.enableR2 ? '<script>window.ENABLE_R2=true</script>' : ''}
    ${showPwPrompt ? '<script>passwdPrompt()</script>' : ''}

    <script>
        const THEMES = ${JSON.stringify(THEMES)};
        const themeSelector = document.getElementById('theme-selector');
        if (themeSelector) {
            themeSelector.addEventListener('change', function() {
                const theme = this.value;
                document.getElementById('theme-style').textContent = THEMES[theme];
                fetch(location.pathname + '/setting', { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({ theme }) });
            });
        }
    </script>
</body>
</html >
    `

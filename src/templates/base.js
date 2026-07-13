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

const PUBLIC_ICON_SVG_URL = '/icon.svg'
const PUBLIC_ICON_PNG_URL = '/icon.png'

const escapeHtml = value => String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')

const getLangText = lang => SUPPORTED_LANG[lang] || SUPPORTED_LANG['en-US']

const PUBLISH_NUDGE_MODAL = lang => {
    const t = getLangText(lang)
    return `
    <div class="modal publish-nudge-modal" role="dialog" aria-modal="true" aria-labelledby="publish-nudge-title">
        <div class="modal-mask"></div>
        <div class="publish-nudge-content">
            <button type="button" class="close-btn publish-nudge-close" aria-label="${escapeHtml(t.later)}">x</button>
            <h2 id="publish-nudge-title">${escapeHtml(t.publishNudgeTitle)}</h2>
            <p>${escapeHtml(t.publishNudgeText)}</p>
            <div class="publish-nudge-actions">
                <button type="button" class="opt-button publish-nudge-later">${escapeHtml(t.later)}</button>
                <button type="button" class="opt-button publish-nudge-publish">${escapeHtml(t.publishNow)}</button>
            </div>
        </div>
    </div>
    `
}

export const HTML = ({ lang, title, content = '', ext = {}, tips, isEdit, showPwPrompt, path, shareId }) => {
    const gaMeasurementId = ext.gaMeasurementId ? String(ext.gaMeasurementId).trim() : ''
    const initialShareFont = ext.shareFont === 'maple' ? 'maple' : 'jetbrains'
    const ogSiteNameMeta = ext.meta?.siteName === false
        ? ''
        : `<meta property="og:site_name" content="${escapeHtml(ext.meta?.siteName || APP_NAME)}" />`
    const gaScript = gaMeasurementId ? `
    <script async src="https://www.googletagmanager.com/gtag/js?id=${escapeHtml(gaMeasurementId)}"></script>
    <script>
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());
        gtag('config', ${JSON.stringify(gaMeasurementId)});
    </script>` : ''

    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${escapeHtml(title)} - ${escapeHtml(APP_NAME)}</title>
    <meta name="description" content="${escapeHtml(ext.meta?.description || tips || title || APP_NAME)}" />
    <meta name="robots" content="${escapeHtml(ext.meta?.robots || 'noindex,nofollow')}" />
    ${ogSiteNameMeta}
    <meta property="og:type" content="${escapeHtml(ext.meta?.ogType || 'website')}" />
    <meta property="og:title" content="${escapeHtml(title || APP_NAME)}" />
    <meta property="og:description" content="${escapeHtml(ext.meta?.description || tips || title || APP_NAME)}" />
    <meta name="twitter:card" content="${escapeHtml(ext.meta?.twitterCard || 'summary')}" />
    <meta name="twitter:title" content="${escapeHtml(title || APP_NAME)}" />
    <meta name="twitter:description" content="${escapeHtml(ext.meta?.description || tips || title || APP_NAME)}" />
    ${ext.meta?.canonicalUrl ? `<link rel="canonical" href="${escapeHtml(ext.meta.canonicalUrl)}" />` : ''}
    ${ext.meta?.canonicalUrl ? `<meta property="og:url" content="${escapeHtml(ext.meta.canonicalUrl)}" />` : ''}
    ${ext.meta?.ogImageUrl ? `<meta property="og:image" content="${escapeHtml(ext.meta.ogImageUrl)}" />` : ''}
    ${ext.meta?.ogImageUrl ? `<meta name="twitter:image" content="${escapeHtml(ext.meta.ogImageUrl)}" />` : ''}
    <style>
${getBaseCss()}
${getEditorCss()}
${getMarkdownCss()}
    </style>
    <style id="theme-style">${THEMES[ext.theme || 'claude-canvas'] || ''}</style>
    <style>
        #preview-md.markdown-body,
        #preview-plain.markdown-body {
            max-width: var(--preview-max-width);
            margin-left: auto;
            margin-right: auto;
            width: 100%;
        }

        body.share-view #preview-md.markdown-body,
        body.share-view #preview-plain.markdown-body {
            font-size: 16px;
            line-height: 1.8;
        }

        body.share-view #preview-md.markdown-body h1,
        body.share-view #preview-plain.markdown-body h1 {
            font-size: 2em;
        }

        body.share-view #preview-md.markdown-body h2,
        body.share-view #preview-plain.markdown-body h2 {
            font-size: 1.55em;
        }

        body.share-view #preview-md.markdown-body h3,
        body.share-view #preview-plain.markdown-body h3 {
            font-size: 1.28em;
        }

        body.share-view #preview-md.markdown-body h4,
        body.share-view #preview-plain.markdown-body h4,
        body.share-view #preview-md.markdown-body h5,
        body.share-view #preview-plain.markdown-body h5,
        body.share-view #preview-md.markdown-body h6,
        body.share-view #preview-plain.markdown-body h6 {
            font-size: 1em;
        }

        body.share-view #preview-md.markdown-body code,
        body.share-view #preview-plain.markdown-body code {
            font-size: 0.92em;
        }

        body.share-view #preview-md.markdown-body pre code,
        body.share-view #preview-plain.markdown-body pre code {
            font-size: 0.92em;
        }

        body.share-view.share-font-jetbrains {
            --share-font-family: var(--share-font-jetbrains-family);
        }

        body.share-view.share-font-maple {
            --share-font-family: var(--share-font-maple-family);
        }

        body.share-view:is(.share-font-jetbrains, .share-font-maple) #preview-md,
        body.share-view:is(.share-font-jetbrains, .share-font-maple) #preview-plain,
        body.share-view:is(.share-font-jetbrains, .share-font-maple) #preview-md.markdown-body,
        body.share-view:is(.share-font-jetbrains, .share-font-maple) #preview-plain.markdown-body,
        body.share-view:is(.share-font-jetbrains, .share-font-maple) #preview-md.markdown-body :is(
            p, li, dd, dt, blockquote, strong, b, em, i, del, s, strike, mark, small,
            span, a, figcaption, summary, table, thead, tbody, tfoot, tr, th, td,
            ul, ol, dl, h1, h2, h3, h4, h5, h6
        ),
        body.share-view:is(.share-font-jetbrains, .share-font-maple) #preview-md.markdown-body code,
        body.share-view:is(.share-font-jetbrains, .share-font-maple) #preview-md.markdown-body pre,
        body.share-view:is(.share-font-jetbrains, .share-font-maple) #preview-md.markdown-body pre code,
        body.share-view:is(.share-font-jetbrains, .share-font-maple) #preview-plain.markdown-body code {
            font-family: var(--share-font-family);
        }

        body.share-view:is(.share-font-jetbrains, .share-font-maple) #preview-plain.markdown-body :is(
            p, li, dd, dt, blockquote, strong, b, em, i, del, s, strike, mark, small,
            span, a, figcaption, summary, table, thead, tbody, tfoot, tr, th, td,
            ul, ol, dl, h1, h2, h3, h4, h5, h6
        ),
        body.share-view:is(.share-font-jetbrains, .share-font-maple) #preview-plain.markdown-body pre,
        body.share-view:is(.share-font-jetbrains, .share-font-maple) #preview-plain.markdown-body pre code {
            font-family: var(--share-font-family);
        }

        #preview-md.markdown-body thead th,
        #preview-plain.markdown-body thead th {
            font-weight: 800;
            letter-spacing: 0.035em;
            box-shadow: inset 0 -2px 0 rgba(0, 0, 0, 0.12);
        }
    </style>
    <link rel="icon" href="${PUBLIC_ICON_SVG_URL}" type="image/svg+xml" />
    <link rel="alternate icon" href="/favicon.ico" type="image/x-icon" />
    <link rel="shortcut icon" href="/favicon.ico" type="image/x-icon" />
    <link rel="apple-touch-icon" href="${PUBLIC_ICON_PNG_URL}" />
    ${gaScript}
</head>
<body class="${ext.sharePath && !isEdit ? `share-view share-font-${initialShareFont}` : ''}">
    <div class="note-container">
        <div class="stack">
            <div class="layer_1">
                <div class="layer_2">
                    <div class="layer_3">
                        ${tips ? `<div class="tips">${tips}</div>` : ''}
                         <article style="display:none;" id="bot-accessible-content">${content}</article>
                        <textarea id="contents" class="contents ${isEdit ? '' : 'hide'}" spellcheck="false" placeholder="${SUPPORTED_LANG[lang].emptyPH}">${content}</textarea>
                        ${(isEdit && (ext.mode || 'md') === 'md') ? '<div class="divide-line"></div>' : ''}
                        ${tips || (isEdit && (ext.mode || 'md') !== 'md') ? '' : (
                            isEdit
                                ? `<div class="preview-pane"><div id="preview-${(ext.mode || 'md') === 'md' ? 'md' : 'plain'}" class="contents markdown-body"></div></div>`
                                : `<div id="preview-${(ext.mode || 'md') === 'md' ? 'md' : 'plain'}" class="contents markdown-body"></div>`
                        )}
                    </div>
                </div>
            </div>
        </div>
        ${FOOTER({ ...ext, mode: ext.mode || 'md', isEdit, lang, path, shareId, sharePath: ext.sharePath })}
    </div>
    ${ext.sharePath && !isEdit ? '<button type="button" id="share-back-to-top" class="share-back-to-top" aria-label="Back to top">＾</button>' : ''}
    <div id="loading"></div>
    ${MODAL(lang, { noteHistoryEnabled: ext.noteHistoryEnabled === true && isEdit })}
    ${isEdit ? PUBLISH_NUDGE_MODAL(lang) : ''}
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

        const slugifyHeading = value => String(value || '')
            .trim()
            .toLowerCase()
            .normalize('NFKD')
            .replace(/[\\u0300-\\u036f]/g, '')
            .replace(/['"“”‘’]/g, '')
            .replace(/[()[\\]{}<>《》「」『』【】（）]/g, ' ')
            .replace(/[!#$%&*+,./:;=?@\\\\^|~，。！？、：；]/g, '')
            .replace(/\\s+/g, '-')
            .replace(/-+/g, '-')
            .replace(/^-|-$/g, '');

        const slugifyCompactHeading = value => String(value || '')
            .trim()
            .toLowerCase()
            .normalize('NFKD')
            .replace(/[\\u0300-\\u036f]/g, '')
            .replace(/['"“”‘’]/g, '')
            .replace(/[【】「」『』《》]/g, '')
            .replace(/[()[\\]{}<>（）]/g, ' ')
            .replace(/[!#$%&*+,./:;=?@\\\\^|~，。！？、：；]/g, '')
            .replace(/\\s+/g, '-')
            .replace(/-+/g, '-')
            .replace(/^-|-$/g, '');

        const getHeadingSlugAliases = text => {
            const aliases = [slugifyCompactHeading(text), slugifyHeading(text)];
            return aliases.filter((alias, index) => alias && aliases.indexOf(alias) === index);
        };

        const decorateHeadingAnchors = node => {
            if (!node) return;
            const seen = new Map();
            node.querySelectorAll('h1, h2, h3, h4, h5, h6').forEach(heading => {
                const aliases = getHeadingSlugAliases(heading.textContent);
                const baseId = aliases[0];
                if (!baseId) return;
                const count = seen.get(baseId) || 0;
                seen.set(baseId, count + 1);
                const headingId = count ? baseId + '-' + count : baseId;
                heading.id = headingId;
                heading.style.scrollMarginTop = '18px';
                aliases.slice(1).forEach(alias => {
                    const aliasId = count ? alias + '-' + count : alias;
                    if (!aliasId || aliasId === headingId || document.getElementById(aliasId)) return;
                    const anchor = document.createElement('span');
                    anchor.id = aliasId;
                    anchor.className = 'heading-anchor-alias';
                    anchor.setAttribute('aria-hidden', 'true');
                    heading.parentNode.insertBefore(anchor, heading);
                });
            });
        };

        const scrollToLocationHash = () => {
            if (!location.hash) return;
            let targetId = '';
            try {
                targetId = decodeURIComponent(location.hash.slice(1));
            } catch (e) {
                targetId = location.hash.slice(1);
            }
            if (!targetId) return;
            const escapedId = window.CSS && CSS.escape ? CSS.escape(targetId) : targetId.replace(/"/g, '\\\\"');
            const target = document.getElementById(targetId) || document.querySelector('[name="' + escapedId + '"]');
            if (!target) return;
            const scrollParent = target.closest('.contents') || document.scrollingElement || document.documentElement;
            const top = target.getBoundingClientRect().top - scrollParent.getBoundingClientRect().top + scrollParent.scrollTop - 12;
            scrollParent.scrollTop = Math.max(0, top);
        };

        const scheduleHashScroll = () => {
            [0, 100, 350, 900].forEach(delay => window.setTimeout(scrollToLocationHash, delay));
        };

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
                 const mermaidFontFamily = '-apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang TC", "PingFang SC", "Hiragino Sans GB", "Microsoft JhengHei", "Microsoft YaHei", "Noto Sans CJK TC", "Noto Sans CJK SC", "Source Han Sans TC", "Source Han Sans SC", Helvetica, Arial, sans-serif';
                 if (document.fonts?.ready) {
                     try {
                         await document.fonts.ready;
                     } catch (e) {
                         console.warn('Font readiness check failed before Mermaid render', e);
                     }
                 }
                 mermaid.initialize({
                     startOnLoad: false,
                     securityLevel: 'loose',
                     fontFamily: mermaidFontFamily,
                     themeVariables: {
                         fontFamily: mermaidFontFamily
                     },
                     flowchart: {
                         htmlLabels: false,
                         useMaxWidth: true
                     }
                 });
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
                decorateHeadingAnchors(node);
                initDiagrams();
                scheduleHashScroll();
            } catch (e) {
                console.error('Markdown rendering error:', e);
                node.innerHTML = '<p style="color:red">Rendering Error: ' + e.message + '</p>';
            }
        };

        window.addEventListener('hashchange', scheduleHashScroll);
        window.dispatchEvent(new Event('markdown-ready'));

    </script>
    ` : ''}

<script>
    function makeError(){return new DOMException("The request is not allowed","NotAllowedError")}async function copyClipboardApi(e){if(!navigator.clipboard)throw makeError();return navigator.clipboard.writeText(e)}async function copyExecCommand(e){const o=document.createElement("span");o.textContent=e,o.style.whiteSpace="pre",o.style.webkitUserSelect="auto",o.style.userSelect="all",document.body.appendChild(o);const t=window.getSelection(),n=window.document.createRange();t.removeAllRanges(),n.selectNode(o),t.addRange(n);let r=!1;try{r = window.document.execCommand("copy")}finally{t.removeAllRanges(), window.document.body.removeChild(o)}if(!r)throw makeError()}async function clipboardCopy(e){try{await copyClipboardApi(e)}catch(o){try{await copyExecCommand(e)}catch(e){throw e||o||makeError()}}}

    const APP_STATE = ${JSON.stringify({
        authPath: ext.authPath || '',
        sharePath: ext.sharePath || '',
        presentationPath: ext.presentationPath || '',
        settingPath: ext.settingPath || (path ? '/' + path + '/setting' : ''),
        path: path || '',
        shareId: shareId || '',
        presentationEntry: ext.presentationEntry === true,
        autoPresent: ext.autoPresent === true,
        isEdit: isEdit === true,
        isPublished: ext.share === true,
        noteHistoryEnabled: ext.noteHistoryEnabled === true,
        publicIndex: ext.publicIndex === true,
        noteSettings: {
            width: ext.width || '',
            shareFont: ext.shareFont || '',
            previewDevice: ext.previewDevice || '',
            splitDirection: ext.splitDirection || '',
        },
        lang,
        title: title || '',
        i18n: getLangText(lang),
    })}
    const PENDING_PRESENTATION_KEY = 'cf-notepad:pending-presentation-destination'
    const LANG_COOKIE_MAX_AGE = 60 * 60 * 24 * 365

    const getI18n = key => {
        return (APP_STATE.i18n && APP_STATE.i18n[key]) || key
    }

    const setLanguage = lang => {
        document.cookie = 'lang=' + encodeURIComponent(lang) + '; path=/; max-age=' + LANG_COOKIE_MAX_AGE + '; SameSite=Lax'
        window.location.reload()
    }

    const errHandle = (err) => { alert(getI18n('err') + ': ' + err) }

    const summarizeErrorText = text => {
        const normalized = String(text || '').replace(/\s+/g, ' ').trim()
        if (!normalized) return 'Empty response'
        return normalized.length > 240 ? normalized.slice(0, 237) + '...' : normalized
    }

    const parseJsonResponse = async response => {
        const rawText = await response.text()
        let payload = null
        try {
            payload = rawText ? JSON.parse(rawText) : null
        } catch (error) {
            const statusText = response.status ? 'HTTP ' + response.status : 'Unknown status'
            throw new Error(statusText + ' - ' + summarizeErrorText(rawText || error.message || 'Invalid JSON response'))
        }

        if (!payload || typeof payload !== 'object') {
            throw new Error('Invalid API response payload')
        }

        return payload
    }

    const fetchJson = async (input, init, timeoutMs = 30000) => {
        const controller = new AbortController()
        const timeoutId = window.setTimeout(() => controller.abort(new Error('Request timeout')), timeoutMs)
        try {
            const response = await window.fetch(input, {
                ...init,
                signal: controller.signal,
            })
            return parseJsonResponse(response)
        } finally {
            window.clearTimeout(timeoutId)
        }
    }

    const initWebMcp = () => {
        const provideContext = navigator.modelContext && navigator.modelContext.provideContext
        if (typeof provideContext !== 'function') return

        const getCurrentMarkdown = () => {
            const textarea = document.getElementById('contents')
            if (textarea && !textarea.classList.contains('hide')) return textarea.value || ''

            const article = document.getElementById('bot-accessible-content')
            return article ? (article.textContent || '') : ''
        }

        const tools = [
            {
                name: 'read-current-markdown',
                description: 'Return the current note or share page markdown content.',
                inputSchema: {
                    type: 'object',
                    properties: {},
                    additionalProperties: false,
                },
                execute: async () => ({
                    markdown: getCurrentMarkdown(),
                    title: APP_STATE.title || document.title || '',
                    path: APP_STATE.path || '',
                    sharePath: APP_STATE.sharePath || '',
                }),
            },
        ]

        if (APP_STATE.sharePath) {
            tools.push({
                name: 'copy-share-link',
                description: 'Copy the current note share URL to the clipboard and return it.',
                inputSchema: {
                    type: 'object',
                    properties: {},
                    additionalProperties: false,
                },
                execute: async () => {
                    const shareUrl = window.location.origin + APP_STATE.sharePath
                    await clipboardCopy(shareUrl)
                    return { shareUrl }
                },
            })
        }

        if (APP_STATE.presentationPath) {
            tools.push({
                name: 'open-presentation',
                description: 'Open the current shared note in presentation mode.',
                inputSchema: {
                    type: 'object',
                    properties: {},
                    additionalProperties: false,
                },
                execute: async () => {
                    const presentationUrl = window.location.origin + APP_STATE.presentationPath
                    window.location.href = presentationUrl
                    return { presentationUrl }
                },
            })
        }

        Promise.resolve(provideContext.call(navigator.modelContext, { tools })).catch(error => {
            console.warn('WebMCP context registration failed:', error)
        })
    }

        const getAuthPath = () => APP_STATE.authPath || (location.pathname + '/auth')
        const getSettingPath = () => APP_STATE.settingPath || (location.pathname + '/setting')
        const persistSetting = async nextSettings => {
            const payload = await fetchJson(getSettingPath(), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(nextSettings),
            })
            if (payload.err !== 0) throw new Error(payload.msg || 'setting update failed')
            APP_STATE.noteSettings = { ...APP_STATE.noteSettings, ...nextSettings }
            return payload
        }

    const rememberPresentationDestination = () => {
        if (!APP_STATE.presentationEntry) return ''
        const destination = location.pathname + location.hash
        try { sessionStorage.setItem(PENDING_PRESENTATION_KEY, destination) } catch (e) {}
        return destination
    }

    const consumePresentationDestination = () => {
        try {
            const destination = sessionStorage.getItem(PENDING_PRESENTATION_KEY)
            sessionStorage.removeItem(PENDING_PRESENTATION_KEY)
            return destination
        } catch (e) {
            return ''
        }
    }

    const openPasswordModal = ({ title, initialValue = '', allowEmpty = false } = {}) => new Promise(resolve => {
        const modal = document.querySelector('.password-modal')
        const input = modal ? modal.querySelector('.password-modal-input') : null
        const titleNode = modal ? modal.querySelector('#password-modal-title') : null
        const messageNode = modal ? modal.querySelector('.password-modal-message') : null
        const confirmBtn = modal ? modal.querySelector('.password-modal-confirm') : null
        const cancelBtn = modal ? modal.querySelector('.password-modal-cancel') : null
        const closeBtn = modal ? modal.querySelector('.password-modal-close') : null
        const mask = modal ? modal.querySelector('.modal-mask') : null

        if (!modal || !input || !titleNode || !confirmBtn || !cancelBtn || !closeBtn || !mask) {
            resolve(window.prompt(title || getI18n('pepw')))
            return
        }

        let settled = false
        const cleanup = result => {
            if (settled) return
            settled = true
            modal.style.display = 'none'
            input.value = ''
            input.removeEventListener('keydown', onKeyDown)
            confirmBtn.removeEventListener('click', onConfirm)
            cancelBtn.removeEventListener('click', onCancel)
            closeBtn.removeEventListener('click', onCancel)
            mask.removeEventListener('click', onCancel)
            resolve(result)
        }

        const onConfirm = () => {
            const value = input.value
            if (!allowEmpty && !value.trim()) {
                alert(getI18n('pwcnbe'))
                input.focus()
                return
            }
            cleanup(value)
        }

        const onCancel = () => cleanup(null)
        const onKeyDown = event => {
            if (event.key === 'Enter') {
                event.preventDefault()
                onConfirm()
            }
            if (event.key === 'Escape') {
                event.preventDefault()
                onCancel()
            }
        }

        titleNode.textContent = title || getI18n('pepw')
        if (messageNode) {
            messageNode.textContent = allowEmpty ? getI18n('enpw') : getI18n('pepw')
        }
        input.value = initialValue
        modal.style.display = 'block'
        input.addEventListener('keydown', onKeyDown)
        confirmBtn.addEventListener('click', onConfirm)
        cancelBtn.addEventListener('click', onCancel)
        closeBtn.addEventListener('click', onCancel)
        mask.addEventListener('click', onCancel)
        window.setTimeout(() => input.focus(), 0)
    })

    const throttle = (func, delay) => {
        let tid = null
        return (...arg) => {
            if (tid) return;
            tid = setTimeout(() => { func(...arg); tid = null }, delay)
        }
    }

    const passwdPrompt = async () => {
        const passwd = await openPasswordModal({ title: getI18n('pepw') })
        if (passwd == null) return;
        const normalizedPasswd = passwd.trim()
        if (!normalizedPasswd) { alert(getI18n('pwcnbe')); return; }
        const destination = rememberPresentationDestination() || (location.pathname + location.hash)
        fetchJson(getAuthPath(), { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ passwd: normalizedPasswd }) })
            .then(res => {
                if (res.err !== 0) { return errHandle(res.msg) }
                if (res.data.refresh) {
                    if (APP_STATE.presentationEntry) {
                        consumePresentationDestination()
                        window.location.reload()
                        return;
                    }
                    window.location.reload()
                }
            })
            .catch(err => errHandle(err))
    }

    const renderPlain = (node, text) => { if (node) { node.innerHTML = DOMPurify.sanitize(text) } }

    const triggerRender = (node, text) => {
        if (window.renderMarkdown) { window.renderMarkdown(node, text) }
        else { window.addEventListener('markdown-ready', () => { window.renderMarkdown(node, text) }, { once: true }) }
    }

    const SHARE_HISTORY_LIMIT = 20
    const SHARE_HISTORY_STORAGE_KEYS = {
        created: 'cf-notepad:share-history:created',
        viewed: 'cf-notepad:share-history:viewed',
    }

    const readShareHistory = type => {
        try {
            const key = SHARE_HISTORY_STORAGE_KEYS[type]
            const items = JSON.parse(window.localStorage.getItem(key) || '[]')
            return Array.isArray(items) ? items : []
        } catch (e) {
            return []
        }
    }

    const writeShareHistory = (type, items) => {
        try {
            window.localStorage.setItem(SHARE_HISTORY_STORAGE_KEYS[type], JSON.stringify(items.slice(0, SHARE_HISTORY_LIMIT)))
        } catch (e) {}
    }

    const recordShareHistory = (type, url, title) => {
        if (!SHARE_HISTORY_STORAGE_KEYS[type] || !url) return;
        const normalizedUrl = String(url).split('#')[0]
        const items = readShareHistory(type).filter(item => String(item.url || '').split('#')[0] !== normalizedUrl)
        items.unshift({
            url: String(url),
            title: String(title || APP_STATE.title || document.title || 'Share').replace(/\\s+-\\s+[^-]+$/, '').trim(),
            savedAt: Date.now(),
        })
        writeShareHistory(type, items)
    }

    const formatShareHistoryTime = savedAt => {
        const diffSeconds = Math.max(0, Math.floor((Date.now() - Number(savedAt || 0)) / 1000))
        const zh = APP_STATE.lang === 'zh-TW'
        if (diffSeconds < 60) return zh ? '剛剛' : 'now'
        const minutes = Math.floor(diffSeconds / 60)
        if (minutes < 60) return zh ? minutes + ' 分前' : minutes + 'm ago'
        const hours = Math.floor(minutes / 60)
        if (hours < 24) return zh ? hours + ' 小時前' : hours + 'h ago'
        return new Date(Number(savedAt || Date.now())).toLocaleDateString(zh ? 'zh-TW' : 'en-US')
    }

    const setupShareHistory = () => {
        const modal = document.querySelector('.share-history-modal')
        const openBtn = document.querySelector('#share-history-btn')
        const closeBtn = document.querySelector('.share-history-close')
        const mask = modal ? modal.querySelector('.modal-mask') : null
        const list = modal ? modal.querySelector('[data-share-history-list]') : null
        const tabs = modal ? modal.querySelectorAll('[data-share-history-tab]') : []
        if (!modal || !openBtn || !list) return;

        let activeType = 'created'
        const render = () => {
            const items = readShareHistory(activeType)
            if (!items.length) {
                list.innerHTML = '<p class="share-history-empty">' + (APP_STATE.lang === 'zh-TW' ? '目前沒有紀錄。分享或開啟 share URL 後會自動出現在這裡。' : 'No links yet. Created and viewed share URLs will appear here automatically.') + '</p>'
                return
            }

            list.innerHTML = ''
            items.forEach(item => {
                const row = document.createElement('div')
                row.className = 'share-history-item'

                const link = document.createElement('a')
                link.className = 'share-history-link'
                link.href = item.url
                link.textContent = item.title || item.url
                link.title = item.url

                const copy = document.createElement('button')
                copy.type = 'button'
                copy.className = 'share-history-copy'
                copy.textContent = getI18n('copy')
                copy.addEventListener('click', async () => {
                    try {
                        await clipboardCopy(item.url)
                        const original = copy.textContent
                        copy.textContent = getI18n('copied')
                        setTimeout(() => { copy.textContent = original }, 1200)
                    } catch (e) {
                        alert(getI18n('copyFailed'))
                    }
                })

                const meta = document.createElement('div')
                meta.className = 'share-history-meta'
                meta.textContent = formatShareHistoryTime(item.savedAt) + ' · ' + item.url

                row.appendChild(link)
                row.appendChild(copy)
                row.appendChild(meta)
                list.appendChild(row)
            })
        }

        const open = () => {
            modal.style.display = 'block'
            openBtn.setAttribute('aria-expanded', 'true')
            render()
        }
        const close = () => {
            modal.style.display = 'none'
            openBtn.setAttribute('aria-expanded', 'false')
        }

        tabs.forEach(tab => {
            tab.addEventListener('click', function() {
                activeType = this.getAttribute('data-share-history-tab') === 'viewed' ? 'viewed' : 'created'
                tabs.forEach(other => {
                    const active = other === this
                    other.classList.toggle('active', active)
                    other.setAttribute('aria-selected', active ? 'true' : 'false')
                })
                render()
            })
        })

        openBtn.addEventListener('click', open)
        if (closeBtn) closeBtn.addEventListener('click', close)
        if (mask) mask.addEventListener('click', close)
        modal.addEventListener('keydown', e => {
            if (e.key === 'Escape') close()
        })

        if (document.body.classList.contains('share-view') && !APP_STATE.isEdit) {
            recordShareHistory('viewed', window.location.origin + window.location.pathname + window.location.hash, APP_STATE.title)
        }
    }

    const setupNoteHistory = ({ textarea = null, previewMarkdownNode = null, previewPlainNode = null } = {}) => {
        if (!APP_STATE.noteHistoryEnabled || !APP_STATE.isEdit) return;

        const modal = document.querySelector('.note-history-modal')
        const openBtn = document.querySelector('#note-history-btn')
        const closeBtn = modal ? modal.querySelector('.note-history-close') : null
        const mask = modal ? modal.querySelector('.modal-mask') : null
        const list = modal ? modal.querySelector('[data-note-history-list]') : null
        const titleNode = modal ? modal.querySelector('[data-note-history-title]') : null
        const metaNode = modal ? modal.querySelector('[data-note-history-meta]') : null
        const bodyNode = modal ? modal.querySelector('[data-note-history-body]') : null
        const refreshBtn = modal ? modal.querySelector('[data-note-history-refresh]') : null
        const copyBtn = modal ? modal.querySelector('[data-note-history-copy]') : null
        const restoreBtn = modal ? modal.querySelector('[data-note-history-restore]') : null
        const renderModeButtons = modal ? modal.querySelectorAll('[data-note-history-render-mode]') : []
        if (!modal || !openBtn || !list || !bodyNode) return;

        let versions = []
        let selectedVersion = null
        let selectedVersionId = null
        let renderMode = 'preview'
        let loaded = false
        let loading = false

        const apiBase = () => '/api' + window.location.pathname + '/history'
        const getCurrentContent = () => textarea ? textarea.value || '' : ''
        const setActionsDisabled = () => {
            const disabled = !selectedVersion
            if (copyBtn) copyBtn.disabled = disabled
            if (restoreBtn) restoreBtn.disabled = disabled
        }
        const formatHistoryTime = value => formatShareHistoryTime(Number(value || 0) * 1000)
        const formatHistorySize = value => String(Number(value || 0)) + ' ' + getI18n('historyChars')

        const renderStatus = (message, error = false) => {
            if (titleNode) titleNode.textContent = message
            if (metaNode) metaNode.textContent = ''
            bodyNode.className = 'note-history-body note-history-status' + (error ? ' error' : '')
            bodyNode.textContent = message
            setActionsDisabled()
        }

        const renderVersionBody = () => {
            if (!selectedVersion) {
                renderStatus(getI18n('historyNoSelection'))
                return
            }

            bodyNode.className = renderMode === 'preview'
                ? 'note-history-body markdown-body'
                : 'note-history-body'

            const content = selectedVersion.content || ''
            if (renderMode === 'preview' && window.renderMarkdown) {
                triggerRender(bodyNode, content)
            } else {
                bodyNode.textContent = content
            }
        }

        const renderSelectedVersion = () => {
            if (!selectedVersion) {
                renderStatus(getI18n('historyNoSelection'))
                return
            }
            if (titleNode) titleNode.textContent = selectedVersion.title || getI18n('historySelectedVersion')
            if (metaNode) {
                metaNode.textContent = formatHistoryTime(selectedVersion.createdAt) + ' · ' + formatHistorySize(selectedVersion.contentLength || selectedVersion.content?.length)
            }
            renderVersionBody()
            setActionsDisabled()
        }

        const renderList = () => {
            if (loading) {
                list.innerHTML = '<p class="share-history-empty">' + getI18n('historyLoading') + '</p>'
                return
            }
            if (!versions.length) {
                list.innerHTML = '<p class="share-history-empty">' + getI18n('historyEmpty') + '</p>'
                renderSelectedVersion()
                return
            }

            list.innerHTML = ''
            versions.forEach(version => {
                const button = document.createElement('button')
                button.type = 'button'
                button.className = 'note-history-entry' + (selectedVersionId === version.id ? ' active' : '')
                button.setAttribute('data-note-history-version-id', String(version.id))

                const title = document.createElement('div')
                title.className = 'note-history-entry-title'
                title.textContent = version.title || getI18n('history')

                const preview = document.createElement('div')
                preview.className = 'note-history-entry-preview'
                preview.textContent = version.preview || ''

                const meta = document.createElement('div')
                meta.className = 'note-history-entry-meta'
                meta.textContent = formatHistoryTime(version.createdAt) + ' · ' + formatHistorySize(version.contentLength)

                button.appendChild(title)
                if (version.preview) button.appendChild(preview)
                button.appendChild(meta)
                button.addEventListener('click', () => selectVersion(version.id))
                list.appendChild(button)
            })
        }

        const fetchVersion = async versionId => {
            const payload = await fetchJson(apiBase() + '/' + encodeURIComponent(versionId))
            if (payload.err !== 0) throw new Error(payload.msg || 'history fetch failed')
            return payload.data
        }

        const selectVersion = async versionId => {
            selectedVersionId = versionId
            selectedVersion = null
            renderList()
            renderStatus(getI18n('historyLoading'))

            try {
                const details = await fetchVersion(versionId)
                const summary = versions.find(item => item.id === versionId) || {}
                selectedVersion = { ...summary, ...details }
                renderList()
                renderSelectedVersion()
            } catch (error) {
                selectedVersion = null
                renderStatus(String(error.message || error), true)
            }
        }

        const refreshHistory = async ({ force = false } = {}) => {
            if (loading) return
            if (loaded && !force) {
                renderList()
                renderSelectedVersion()
                return
            }

            let refreshError = null
            loading = true
            renderList()
            renderStatus(getI18n('historyLoading'))

            try {
                const payload = await fetchJson(apiBase())
                if (payload.err !== 0) throw new Error(payload.msg || 'history list failed')

                versions = Array.isArray(payload.data?.versions) ? payload.data.versions : []
                loaded = true
                if (!versions.some(item => item.id === selectedVersionId)) {
                    selectedVersionId = versions[0]?.id || null
                    selectedVersion = null
                }
            } catch (error) {
                versions = []
                loaded = false
                selectedVersionId = null
                selectedVersion = null
                refreshError = error
            } finally {
                loading = false
                renderList()
                if (refreshError) {
                    renderStatus(String(refreshError.message || refreshError), true)
                } else if (selectedVersionId && !selectedVersion) {
                    selectVersion(selectedVersionId)
                } else {
                    renderSelectedVersion()
                }
            }
        }

        const open = () => {
            modal.style.display = 'block'
            openBtn.setAttribute('aria-expanded', 'true')
            refreshHistory()
        }
        const close = () => {
            modal.style.display = 'none'
            openBtn.setAttribute('aria-expanded', 'false')
        }

        renderModeButtons.forEach(button => {
            button.addEventListener('click', function() {
                renderMode = this.getAttribute('data-note-history-render-mode') === 'raw' ? 'raw' : 'preview'
                renderModeButtons.forEach(other => {
                    const active = other === this
                    other.classList.toggle('active', active)
                    other.setAttribute('aria-pressed', active ? 'true' : 'false')
                })
                renderVersionBody()
            })
        })

        if (refreshBtn) refreshBtn.addEventListener('click', () => refreshHistory({ force: true }))
        if (copyBtn) {
            copyBtn.addEventListener('click', async () => {
                if (!selectedVersion) return
                try {
                    await clipboardCopy(selectedVersion.content || '')
                    alert(getI18n('historyCopiedContent'))
                } catch (e) {
                    alert(getI18n('copyFailed'))
                }
            })
        }
        if (restoreBtn) {
            restoreBtn.addEventListener('click', async () => {
                if (!selectedVersion) return
                if (!confirm(getI18n('historyRestoreConfirm'))) return
                try {
                    const payload = await fetchJson(apiBase() + '/' + encodeURIComponent(selectedVersion.id) + '/restore', { method: 'POST' })
                    if (payload.err !== 0) throw new Error(payload.msg || 'history restore failed')
                    if (textarea) {
                        textarea.value = selectedVersion.content || ''
                        if (previewMarkdownNode) triggerRender(previewMarkdownNode, textarea.value)
                        if (previewPlainNode) {
                            if (window.DOMPurify) {
                                renderPlain(previewPlainNode, textarea.value)
                            } else {
                                previewPlainNode.textContent = textarea.value
                            }
                        }
                    }
                    loaded = false
                    selectedVersion = null
                    await refreshHistory({ force: true })
                    alert(getI18n('historyRestoreDone'))
                } catch (error) {
                    errHandle(error.message || error)
                }
            })
        }

        openBtn.addEventListener('click', open)
        if (closeBtn) closeBtn.addEventListener('click', close)
        if (mask) mask.addEventListener('click', close)
        modal.addEventListener('keydown', e => {
            if (e.key === 'Escape') close()
        })

        renderStatus(getI18n('historyNoSelection'))
    }

    const setupShareBackToTop = scrollTarget => {
        const button = document.querySelector('#share-back-to-top')
        if (!button || !scrollTarget || !document.body.classList.contains('share-view')) return;

        const updateVisibility = () => {
            button.classList.toggle('visible', scrollTarget.scrollTop > 600)
        }

        button.addEventListener('click', () => {
            scrollTarget.scrollTo({ top: 0, behavior: 'smooth' })
        })
        scrollTarget.addEventListener('scroll', updateVisibility, { passive: true })
        updateVisibility()
    }

    window.addEventListener('DOMContentLoaded', function () {
        const $textarea = document.querySelector('#contents')
        const $loading = document.querySelector('#loading')
        const $modeBtn = document.querySelector('.opt-mode')
        const $shareBtn = document.querySelector('.opt-share')
        const $previewPlain = document.querySelector('#preview-plain')
        const $previewMd = document.querySelector('#preview-md')
        const $shareModal = document.querySelector('.share-modal')
        const $closeBtn = document.querySelector('.share-modal .close-btn')
        const $copyBtn = document.querySelector('.share-modal-copy-btn')
        const $shareInput = document.querySelector('.share-modal input')
        const $shareIndexPrompt = document.querySelector('.share-index-prompt')
        const $shareIndexApprove = document.querySelector('.share-index-approve')
        const $shareIndexDecline = document.querySelector('.share-index-decline')
        const $languageSelector = document.querySelector('#language-selector')
        const $publishNudgeModal = document.querySelector('.publish-nudge-modal')
        const $publishNudgePublish = document.querySelector('.publish-nudge-publish')
        const $publishNudgeLater = document.querySelector('.publish-nudge-later')
        const $publishNudgeClose = document.querySelector('.publish-nudge-close')
        const $importMdBtn = document.querySelector('#import-md-btn')
        const $importMdInput = document.querySelector('#import-md-input')
        const $exportMdBtn = document.querySelector('#export-md-btn')
        const $exportPdfBtn = document.querySelector('#export-pdf-btn')

        setupShareHistory()
        syncShareStateUI()
        setupNoteHistory({
            textarea: $textarea,
            previewMarkdownNode: $previewMd,
            previewPlainNode: $previewPlain,
        })
        renderPlain($previewPlain, $textarea ? $textarea.value : '')
        triggerRender($previewMd, $textarea ? $textarea.value : '')
        setupShareBackToTop($previewMd || $previewPlain)

        // Fetch a random Tagore poem to display in the empty placeholder
        if (\$textarea) {
            fetch('https://answerbook.david888.com/StrayBirds')
                .then(res => res.json())
                .then(data => {
                    if (data && data.poem) {
                        const originalPlaceholder = \$textarea.placeholder || '';
                        const title = data.poem.title || 'Stray Birds';
                        const english = data.poem.english || '';
                        const chinese = data.poem.chinese || '';
                        
                        const isZh = APP_STATE.lang === 'zh-TW';
                        const displayTitle = isZh ? title : ('Stray Birds - No. ' + (data.poem.num || ''));
                        const poemBody = isZh ? chinese : english;
                        const poemText = '\\n\\n📖 ' + displayTitle + '\\n' + poemBody;
                        
                        // Typing effect for the poem part
                        let currentIdx = 0;
                        let typingTimer = setInterval(() => {
                            if (\$textarea.value || document.activeElement === \$textarea) {
                                clearInterval(typingTimer);
                                \$textarea.placeholder = originalPlaceholder + poemText;
                                return;
                            }
                            
                            if (currentIdx < poemText.length) {
                                \$textarea.placeholder = originalPlaceholder + poemText.slice(0, currentIdx + 1);
                                currentIdx++;
                            } else {
                                clearInterval(typingTimer);
                            }
                        }, 40);
                        
                        \$textarea.addEventListener('focus', () => {
                            if (typingTimer) {
                                clearInterval(typingTimer);
                                \$textarea.placeholder = originalPlaceholder + poemText;
                            }
                        }, { once: true });
                    }
                })
                .catch(err => {
                    console.error('Failed to fetch StrayBirds poem:', err);
                });
        }

        const getCurrentMarkdownForExport = () => {
            if ($textarea && !$textarea.classList.contains('hide')) return $textarea.value || ''
            const article = document.querySelector('#bot-accessible-content')
            return article ? (article.textContent || '') : ''
        }

        const getMarkdownFilename = () => {
            const source = APP_STATE.path || APP_STATE.title || 'note'
            const sanitized = String(source)
                .trim()
                .replace(/[\\/:*?"<>|]+/g, '-')
                .replace(/\s+/g, '-')
                .replace(/-+/g, '-')
                .replace(/^-|-$/g, '')
            return (sanitized || 'note') + '.md'
        }

        if ($exportMdBtn) {
            $exportMdBtn.addEventListener('click', () => {
                const blob = new Blob([getCurrentMarkdownForExport()], { type: 'text/markdown;charset=utf-8' })
                const url = URL.createObjectURL(blob)
                const link = document.createElement('a')
                link.href = url
                link.download = getMarkdownFilename()
                document.body.appendChild(link)
                link.click()
                link.remove()
                window.setTimeout(() => URL.revokeObjectURL(url), 0)
            })
        }

        if ($exportPdfBtn) {
            $exportPdfBtn.addEventListener('click', () => {
                window.print()
            })
        }

        const $aiFormatBtn = document.querySelector('#ai-format-btn')
        const $aiEditBtn = document.querySelector('#ai-edit-btn')

        const runAiAssistant = async mode => {
            if (!$textarea) return;

            const rawText = $textarea.value || ''
            if (!rawText.trim()) {
                window.showToast(APP_STATE.lang === 'zh-TW' ? '請先輸入內容' : 'Please input content first')
                return;
            }

            const isEdit = mode === 'edit'
            const selectionStart = isEdit ? $textarea.selectionStart : 0
            const selectionEnd = isEdit ? $textarea.selectionEnd : 0
            const hasSelection = isEdit && selectionEnd > selectionStart
            const instructionPrompt = isEdit
                ? (APP_STATE.lang === 'zh-TW'
                    ? (hasSelection
                        ? '請輸入圈選文字的修改要求，例如：精簡、改寫語氣、修正文句'
                        : '請輸入編輯要求，例如：在第二段後插入一段說明，或全文微調但保留原意')
                    : (hasSelection
                        ? 'Enter instructions for the selected text, for example: shorten it, change its tone, or improve the wording'
                        : 'Enter editing instructions, for example: insert a paragraph after section two, or refine the full note while preserving its meaning'))
                : (APP_STATE.lang === 'zh-TW'
                    ? '請輸入排版需求，例如：補標題、整理段落、改成條列重點'
                    : 'Enter formatting instructions, for example: add headings, clean paragraphs, and turn key points into bullets')
            const instruction = window.prompt(instructionPrompt, '')
            if (instruction === null) return;
            if (isEdit && !instruction.trim()) {
                window.showToast(APP_STATE.lang === 'zh-TW' ? '請輸入編輯要求' : 'Please enter editing instructions')
                return;
            }

            const loadingMsg = APP_STATE.lang === 'zh-TW' ? 'AI 正在處理中，請稍候...' : 'AI processing, please wait...'
            window.showToast(loadingMsg)

            if ($aiFormatBtn) $aiFormatBtn.disabled = true
            if ($aiEditBtn) $aiEditBtn.disabled = true

            try {
                const res = await fetchJson('/' + encodeURIComponent(APP_STATE.path || '') + '/ai-format', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ text: rawText, mode, instruction, selectionStart, selectionEnd })
                }, 130000)

                if (res.err === 0 && res.data?.result) {
                    if (res.data.scope === 'selection' && hasSelection) {
                        $textarea.value = rawText.slice(0, selectionStart) + res.data.result + rawText.slice(selectionEnd)
                        const nextCursor = selectionStart + res.data.result.length
                        $textarea.setSelectionRange(selectionStart, nextCursor)
                    } else {
                        $textarea.value = res.data.result
                    }
                    renderPlain($previewPlain, $textarea.value)
                    triggerRender($previewMd, $textarea.value)
                    $textarea.dispatchEvent(new Event('input', { bubbles: true }))
                    window.showToast(APP_STATE.lang === 'zh-TW' ? 'AI 輔助完成' : 'AI completed')
                    return;
                }

                alert((APP_STATE.lang === 'zh-TW' ? 'AI 處理失敗：' : 'AI processing failed: ') + (res.msg || 'Unknown error'))
            } catch (err) {
                console.error('AI assistant error:', err)
                const message = err && err.name === 'AbortError'
                    ? (APP_STATE.lang === 'zh-TW' ? 'AI 處理逾時，請再試一次' : 'AI request timed out, please try again')
                    : ((APP_STATE.lang === 'zh-TW' ? 'AI 處理錯誤：' : 'AI processing error: ') + err.message)
                alert(message)
            } finally {
                if ($aiFormatBtn) $aiFormatBtn.disabled = false
                if ($aiEditBtn) $aiEditBtn.disabled = false
            }
        }

        if ($aiFormatBtn) {
            $aiFormatBtn.addEventListener('click', () => runAiAssistant('format'))
        }
        if ($aiEditBtn) {
            $aiEditBtn.addEventListener('click', () => runAiAssistant('edit'))
        }

        if ($textarea) {
            const selectionAiButton = document.createElement('button')
            selectionAiButton.type = 'button'
            selectionAiButton.className = 'selection-ai-button'
            selectionAiButton.textContent = APP_STATE.lang === 'zh-TW' ? 'AI 編輯' : 'AI Edit'
            selectionAiButton.setAttribute('aria-label', APP_STATE.lang === 'zh-TW' ? '使用 AI 編輯圈選文字' : 'Edit selected text with AI')
            document.body.appendChild(selectionAiButton)

            const hideSelectionAiButton = () => selectionAiButton.classList.remove('visible')
            const showSelectionAiButton = event => {
                if ($textarea.selectionEnd <= $textarea.selectionStart) {
                    hideSelectionAiButton()
                    return
                }
                const editorRect = $textarea.getBoundingClientRect()
                const left = event?.clientX || editorRect.right - 90
                const top = event?.clientY || editorRect.top + 16
                selectionAiButton.style.left = Math.min(window.innerWidth - 100, Math.max(8, left + 10)) + 'px'
                selectionAiButton.style.top = Math.min(window.innerHeight - 48, Math.max(8, top - 42)) + 'px'
                selectionAiButton.classList.add('visible')
            }

            selectionAiButton.addEventListener('mousedown', event => event.preventDefault())
            selectionAiButton.addEventListener('click', () => {
                hideSelectionAiButton()
                runAiAssistant('edit')
            })
            $textarea.addEventListener('mouseup', showSelectionAiButton)
            $textarea.addEventListener('keyup', event => {
                if (event.shiftKey) showSelectionAiButton()
            })
            $textarea.addEventListener('input', hideSelectionAiButton)
            $textarea.addEventListener('scroll', hideSelectionAiButton, { passive: true })
            window.addEventListener('resize', hideSelectionAiButton)
        }

        if ($importMdBtn && $importMdInput && $textarea) {
            $importMdBtn.addEventListener('click', () => {
                $importMdInput.click()
            })
            $importMdInput.addEventListener('change', () => {
                const file = $importMdInput.files && $importMdInput.files[0]
                if (!file) return;
                const reader = new FileReader()
                reader.onload = () => {
                    const text = typeof reader.result === 'string' ? reader.result : ''
                    $textarea.value = text
                    renderPlain($previewPlain, text)
                    triggerRender($previewMd, text)
                    $textarea.dispatchEvent(new Event('input', { bubbles: true }))
                    alert(getI18n('markdownImported'))
                    $importMdInput.value = ''
                }
                reader.onerror = () => {
                    alert(getI18n('markdownImportFailed'))
                    $importMdInput.value = ''
                }
                reader.readAsText(file, 'utf-8')
            })
        }

        const showShareModal = (shareId) => {
            if (!$shareModal || !$shareInput || !shareId) return;
            $shareInput.value = window.location.origin + '/share/' + shareId;
            if ($shareIndexPrompt) {
                $shareIndexPrompt.style.display = APP_STATE.publicIndex ? 'none' : 'flex';
            }
            $shareModal.style.display = 'block';
        }

        const setPublicIndex = async enabled => {
            const payload = await fetchJson(window.location.pathname + '/setting', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ publicIndex: enabled })
            })
            if (payload.err !== 0) throw new Error(payload.msg || 'public index update failed')
            APP_STATE.publicIndex = enabled === true
            return payload
        }

        const syncPublicIndexButton = () => {
            const button = document.querySelector('#public-index-btn')
            if (!button) return
            const enabled = APP_STATE.publicIndex === true
            button.dataset.publicIndex = enabled ? 'true' : 'false'
            button.textContent = enabled ? getI18n('publicIndexOn') : getI18n('publicIndexOff')
            button.classList.toggle('opt-button-accent', enabled)
            const label = enabled ? getI18n('publicIndexDisable') : getI18n('publicIndexEnable')
            button.title = label
            button.setAttribute('aria-label', label)
        }

        function syncShareStateUI() {
            const switcher = document.querySelector('.share-state-switcher')
            if (!switcher) return
            const isPublished = APP_STATE.isPublished
            switcher.classList.toggle('is-checked', isPublished)
            switcher.classList.toggle('share-published', isPublished)
            switcher.setAttribute('aria-pressed', isPublished ? 'true' : 'false')
        }

        const publishCurrentNote = () => {
            return fetchJson(window.location.pathname + '/setting', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ share: true })
            })
                .then(res => {
                    if (res.err !== 0) {
                        if ($shareBtn) {
                            $shareBtn.classList.remove('is-checked')
                            $shareBtn.setAttribute('aria-pressed', 'false')
                        }
                        errHandle(res.msg);
                        return false;
                    }
                    APP_STATE.isPublished = true;
                    if ($shareBtn) {
                        $shareBtn.classList.add('is-checked')
                        $shareBtn.setAttribute('aria-pressed', 'true')
                    }
                    syncShareStateUI();
                    recordShareHistory('created', window.location.origin + '/share/' + res.data, APP_STATE.title);
                    syncPublicIndexButton();
                    showShareModal(res.data);
                    return true;
                })
                .catch(err => {
                    if ($shareBtn) {
                        $shareBtn.classList.remove('is-checked')
                        $shareBtn.setAttribute('aria-pressed', 'false')
                    }
                    errHandle(err);
                    return false;
                })
        }

        const closePublishNudge = () => {
            if ($publishNudgeModal) $publishNudgeModal.style.display = 'none';
        }

        const showPublishNudge = () => {
            if (!$publishNudgeModal || APP_STATE.isPublished || !APP_STATE.isEdit) return;
            if (!$textarea || !$textarea.value.trim()) return;
            $publishNudgeModal.style.display = 'block';
            if ($publishNudgePublish) $publishNudgePublish.focus();
        }

        if ($languageSelector) {
            const languageSwitch = $languageSelector.querySelector('.footer-rail-switch')
            if (languageSwitch) languageSwitch.addEventListener('click', function() {
                const checked = this.getAttribute('aria-pressed') === 'true'
                const nextLang = checked
                    ? this.getAttribute('data-rail-unchecked-value')
                    : this.getAttribute('data-rail-checked-value')
                if (nextLang && nextLang !== APP_STATE.lang) setLanguage(nextLang)
            })
        }

        if ($publishNudgePublish) {
            $publishNudgePublish.addEventListener('click', () => {
                closePublishNudge();
                publishCurrentNote();
            });
        }
        if ($publishNudgeLater) $publishNudgeLater.addEventListener('click', closePublishNudge);
        if ($publishNudgeClose) $publishNudgeClose.addEventListener('click', closePublishNudge);
        if ($publishNudgeModal) {
            $publishNudgeModal.addEventListener('keydown', e => {
                if (e.key === 'Escape') closePublishNudge();
            });
        }

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
            const $previewPane = document.querySelector('.preview-pane') || $preview;
            const resetSplitPane = function() {
                $textarea.style.removeProperty('flex');
                $previewPane.style.removeProperty('flex');
            };
            window.resetEditorSplitPane = resetSplitPane;
            let startPosition = 0, firstPaneSize = 0, parentSize = 0, isVertical = false;
            const mouseDownHandler = function(e) {
                isVertical = document.body.classList.contains('preview-split-vertical') || window.matchMedia('(max-width: 960px)').matches;
                startPosition = isVertical ? e.clientY : e.clientX;
                firstPaneSize = isVertical ? $textarea.getBoundingClientRect().height : $textarea.getBoundingClientRect().width;
                const parentRect = $resizer.parentNode.getBoundingClientRect();
                parentSize = isVertical ? parentRect.height : parentRect.width;
                document.addEventListener('mousemove', mouseMoveHandler); document.addEventListener('mouseup', mouseUpHandler);
                document.body.style.cursor = isVertical ? 'row-resize' : 'col-resize';
                $textarea.style.pointerEvents = 'none'; $preview.style.pointerEvents = 'none';
            };
            const mouseMoveHandler = function(e) {
                const currentPosition = isVertical ? e.clientY : e.clientX;
                const newFirstPercent = ((firstPaneSize + currentPosition - startPosition) * 100) / parentSize;
                if (newFirstPercent < 10 || newFirstPercent > 90) return;
                $textarea.style.flex = \`0 0 \${newFirstPercent}%\`;
                $previewPane.style.flex = \`0 0 calc(\${100 - newFirstPercent}% - 8px)\`;
            };
            const mouseUpHandler = function() {
                document.removeEventListener('mousemove', mouseMoveHandler); document.removeEventListener('mouseup', mouseUpHandler);
                document.body.style.cursor = null;
                $textarea.style.removeProperty('pointer-events'); $preview.style.removeProperty('pointer-events');
            };
            $resizer.addEventListener('mousedown', mouseDownHandler);
            $resizer.addEventListener('dblclick', resetSplitPane);
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
                            const loadingText = '![' + getI18n('uploading') + ']()'
                            $textarea.value = $textarea.value.substring(0, start) + loadingText + $textarea.value.substring($textarea.selectionEnd)
                            $textarea.selectionStart = $textarea.selectionEnd = start + loadingText.length
                            const formData = new FormData()
                            formData.append('image', blob)
                            fetchJson('/upload', { method: 'POST', body: formData })
                                .then(res => {
                                    if (res.err === 0) { $textarea.value = $textarea.value.replace(loadingText, '![image](' + res.data + ')'); triggerRender($previewMd, $textarea.value) }
                                    else { $textarea.value = $textarea.value.replace(loadingText, '[' + getI18n('uploadFailed') + ': ' + res.msg + ']'); alert(getI18n('uploadFailed') + ': ' + res.msg) }
                                })
                                .catch(err => { $textarea.value = $textarea.value.replace(loadingText, '[' + getI18n('uploadFailed') + ']'); alert(getI18n('uploadError') + err) })
                            return;
                        }
                    }
                })
            }

            let publishNudgeTimer = null;
            let publishNudgeShown = false;
            const clearPublishNudgeTimer = () => {
                if (publishNudgeTimer) {
                    clearTimeout(publishNudgeTimer);
                    publishNudgeTimer = null;
                }
            }
            const schedulePublishNudge = () => {
                clearPublishNudgeTimer();
                if (publishNudgeShown || APP_STATE.isPublished || !$textarea.value.trim()) return;
                publishNudgeTimer = setTimeout(() => {
                    if (document.activeElement !== $textarea) return;
                    publishNudgeShown = true;
                    showPublishNudge();
                }, 180000);
            }
            $textarea.addEventListener('focus', schedulePublishNudge);
            $textarea.addEventListener('blur', clearPublishNudgeTimer);

            $textarea.oninput = throttle(function () {
                schedulePublishNudge();
                triggerRender($previewMd, $textarea.value)
                $loading.style.display = 'inline-block'
                fetchJson('', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: new URLSearchParams({ t: $textarea.value }) })
                    .then(res => { if (res.err !== 0) { errHandle(res.msg) } })
                    .catch(err => errHandle(err))
                    .finally(() => { $loading.style.display = 'none' })
            }, 1000)
        }

        // Password buttons
        const bindPwHandler = (btnSelector, type) => {
            const btn = document.querySelector(btnSelector);
            if (btn) { btn.onclick = async function () {
                const passwd = await openPasswordModal({ title: getI18n('enpw'), allowEmpty: true })
                if (passwd == null) return;
                fetchJson(window.location.pathname + '/pw', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ passwd: passwd.trim(), type }) })
                    .then(res => { if (res.err !== 0) { return errHandle(res.msg) } alert(passwd ? getI18n('pwss') : getI18n('pwrs')); location.reload() })
                    .catch(err => errHandle(err))
            }}
        }
        bindPwHandler('.opt-pw', 'edit');
        bindPwHandler('.opt-pw-view', 'view');

        if ($modeBtn) {
            $modeBtn.onclick = function (e) {
                const previousIsMd = this.getAttribute('aria-pressed') === 'true'
                const isMd = !previousIsMd
                this.classList.toggle('is-checked', isMd)
                this.setAttribute('aria-pressed', isMd ? 'true' : 'false')
                fetchJson(window.location.pathname + '/setting', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ mode: isMd ? 'md' : 'plain' }) })
                    .then(res => {
                        if (res.err !== 0) {
                            this.classList.toggle('is-checked', previousIsMd)
                            this.setAttribute('aria-pressed', previousIsMd ? 'true' : 'false')
                            return errHandle(res.msg)
                        }
                        window.location.reload()
                    })
                    .catch(err => {
                        this.classList.toggle('is-checked', previousIsMd)
                        this.setAttribute('aria-pressed', previousIsMd ? 'true' : 'false')
                        errHandle(err)
                    })
            }
        }

        // Published share URL
        const $shareOpenLink = document.querySelector('#share-open-link');
        const $shareCopyBtn = document.querySelector('#copy-share-btn');
        const $copyPresentShareBtn = document.querySelector('#copy-present-share-btn');
        const $publicIndexBtn = document.querySelector('#public-index-btn');
        const $unpublishBtn = document.querySelector('.unpublish-btn');
        const $sharePublishMenuBtn = document.querySelector('.share-publish-menu-btn');
        const $readonlyEditBtn = document.querySelector('#readonly-edit-btn');
        if ($shareOpenLink && $shareCopyBtn) {
            const shareUrl = new URL($shareOpenLink.getAttribute('href') || '', window.location.origin).toString()
            $shareOpenLink.href = shareUrl
            recordShareHistory('created', shareUrl, APP_STATE.title);
            $shareCopyBtn.addEventListener('click', async () => {
                try { 
                    await clipboardCopy(shareUrl); 
                    window.showToast(getI18n('copied') || 'Copied!'); 
                } catch (e) { 
                    alert(getI18n('copyFailed')); 
                }
            });
        }
        if ($shareOpenLink && $copyPresentShareBtn) {
            $copyPresentShareBtn.addEventListener('click', async () => {
                const presentationUrl = new URL(($shareOpenLink.getAttribute('href') || '') + '/present', window.location.origin).toString();
                try { 
                    await clipboardCopy(presentationUrl); 
                    window.showToast(getI18n('copied') || 'Copied!'); 
                } catch (e) { 
                    alert(getI18n('copyFailed')); 
                }
            });
        }
        if ($publicIndexBtn) {
            syncPublicIndexButton();
            $publicIndexBtn.addEventListener('click', async () => {
                const nextValue = APP_STATE.publicIndex !== true
                try {
                    await setPublicIndex(nextValue)
                    syncPublicIndexButton()
                    alert(getI18n(nextValue ? 'publicIndexUpdatedOn' : 'publicIndexUpdatedOff'))
                } catch (error) {
                    errHandle(error.message || error)
                }
            })
        }
        if ($unpublishBtn) {
            $unpublishBtn.addEventListener('click', () => {
                if (!confirm(getI18n('unpublishConfirm'))) return;
                fetchJson(window.location.pathname + '/setting', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ share: false }) })
                    .then(res => { if (res.err !== 0) { return errHandle(res.msg); } window.location.reload(); }).catch(err => errHandle(err));
            });
        }
        if ($sharePublishMenuBtn) {
            $sharePublishMenuBtn.addEventListener('click', publishCurrentNote)
        }

        if ($shareBtn) {
            $shareBtn.onclick = function () {
                if (APP_STATE.isPublished) {
                    fetchJson(window.location.pathname + '/setting', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ share: false }) })
                        .then(res => { if (res.err !== 0) { return errHandle(res.msg) } APP_STATE.isPublished = false; window.location.reload(); })
                        .catch(err => errHandle(err))
                } else {
                    publishCurrentNote();
                }
            }
        }

        if ($shareModal) {
            $closeBtn.onclick = function () { $shareModal.style.display = 'none' }
            $copyBtn.onclick = function () {
                clipboardCopy($shareInput.value)
                const originText = $copyBtn.innerHTML; const originColor = $copyBtn.style.background;
                $copyBtn.innerHTML = getI18n('copied'); $copyBtn.style.background = 'orange';
                window.setTimeout(() => { $shareModal.style.display = 'none'; $copyBtn.innerHTML = originText; $copyBtn.style.background = originColor; }, 1500)
            }
            if ($shareIndexApprove) {
                $shareIndexApprove.onclick = async function () {
                    try {
                        await setPublicIndex(true)
                        syncPublicIndexButton()
                        if ($shareIndexPrompt) $shareIndexPrompt.style.display = 'none'
                    } catch (error) {
                        errHandle(error.message || error)
                    }
                }
            }
            if ($shareIndexDecline) {
                $shareIndexDecline.onclick = function () {
                    if ($shareIndexPrompt) $shareIndexPrompt.style.display = 'none'
                }
            }
        }

        if ($readonlyEditBtn) {
            $readonlyEditBtn.addEventListener('click', () => passwdPrompt())
        }

        const setupMobileShareFooter = () => {
            const footer = document.querySelector('.footer');
            const scrollTarget = $previewMd || $previewPlain;
            if (!document.body.classList.contains('share-view') || !footer || !scrollTarget) return;
            const media = window.matchMedia('(max-width: 960px)');
            let lastScrollTop = scrollTarget.scrollTop;

            const showFooter = () => footer.classList.remove('footer-hidden');
            const hideFooter = () => {
                if (media.matches) footer.classList.add('footer-hidden');
            }
            const handleScroll = () => {
                if (!media.matches) {
                    showFooter();
                    return;
                }

                const currentScrollTop = scrollTarget.scrollTop;
                
                // Near top or near bottom triggers forced show for better accessibility
                const isNearTop = currentScrollTop <= 15;
                const isNearBottom = scrollTarget.scrollHeight - scrollTarget.scrollTop <= scrollTarget.clientHeight + 15;

                if (isNearTop || isNearBottom || currentScrollTop < lastScrollTop) {
                    showFooter();
                } else {
                    hideFooter();
                }
                lastScrollTop = Math.max(currentScrollTop, 0);
            }

            scrollTarget.addEventListener('scroll', handleScroll, { passive: true });
            if (media.addEventListener) {
                media.addEventListener('change', showFooter);
            } else if (media.addListener) {
                media.addListener(showFooter);
            }
        }
        setupMobileShareFooter();

        // --- Custom Dropdown Menus Logic ---
        const setupDropdowns = () => {
            document.querySelectorAll('.dropdown-trigger').forEach(trigger => {
                trigger.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const container = trigger.closest('.dropdown-container');
                    const isShown = container.classList.contains('show');
                    
                    // Close other dropdowns
                    document.querySelectorAll('.dropdown-container').forEach(c => {
                        if (c !== container) c.classList.remove('show');
                    });
                    
                    container.classList.toggle('show', !isShown);

                    // Dynamic viewport boundary detection (prevent clipping on top edge)
                    if (!isShown) {
                        const menu = container.querySelector('.dropdown-menu');
                        if (menu) {
                            menu.style.bottom = '';
                            menu.style.top = '';
                            const rect = menu.getBoundingClientRect();
                            if (rect.top < 0) {
                                menu.style.bottom = 'auto';
                                menu.style.top = 'calc(100% + 8px)';
                            }
                        }
                    }
                });
            });
        }
        setupDropdowns();

        // Close dropdowns on clicking outside (Guaranteed single registration)
        if (!window.__dropdownListenerBound) {
            document.addEventListener('click', () => {
                document.querySelectorAll('.dropdown-container').forEach(c => c.classList.remove('show'));
            });
            window.__dropdownListenerBound = true;
        }

        // --- Mobile Footer Collapse/Expand Toggle ---
        const setupMobileFooterToggle = () => {
            const mobileMoreBtn = document.getElementById('mobile-more-btn');
            const footer = document.querySelector('.footer');
            if (mobileMoreBtn && footer) {
                mobileMoreBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const isExpanded = footer.classList.toggle('footer-expanded');
                    document.body.classList.toggle('footer-expanded', isExpanded);
                });
            }
        }
        setupMobileFooterToggle();

        // --- Keyboard Viewport Adjuster for Mobile Input ---
        const setupKeyboardViewport = () => {
            if (window.visualViewport) {
                const initialHeight = window.innerHeight;
                window.visualViewport.addEventListener('resize', () => {
                    const currentHeight = window.visualViewport.height;
                    // If height shrinks by more than 150px, keyboard is likely open
                    if (initialHeight - currentHeight > 150) {
                        document.body.classList.add('keyboard-open');
                    } else {
                        document.body.classList.remove('keyboard-open');
                    }
                });
            }
        }
        setupKeyboardViewport();

        // --- Toast Notification Utility ---
        window.showToast = (message) => {
            const container = document.getElementById('toast-container');
            if (!container) return;
            
            const toast = document.createElement('div');
            toast.className = 'toast';
            toast.innerHTML = '<span class="toast-check">✓</span> <span>' + message + '</span>';
            container.appendChild(toast);
            
            // Fade-in trigger
            setTimeout(() => toast.classList.add('show'), 15);
            
            // Auto fade-out & remove
            setTimeout(() => {
                toast.classList.remove('show');
                setTimeout(() => toast.remove(), 250);
            }, 2000);
        }
    })
</script>
    ${ext.enableR2 ? '<script>window.ENABLE_R2=true</script>' : ''}
    ${showPwPrompt ? '<script>passwdPrompt()</script>' : ''}

    <script>
        const THEMES = ${JSON.stringify(THEMES)};
        const PREVIEW_WIDTH_STORAGE_KEY = 'cf-notepad-preview-width';
        const PREVIEW_DEVICE_STORAGE_KEY = 'cf-notepad-preview-device';
        const SHARE_FONT_STORAGE_KEY = 'cf-notepad-share-font';
        const themeStyleNode = document.getElementById('theme-style');
        const themeSelector = document.getElementById('theme-selector');
        const previewWidthSelector = document.getElementById('preview-width-selector');
        const previewDeviceSelector = document.getElementById('preview-device-selector');
        const splitDirectionSelector = document.getElementById('split-direction-selector');
        const languageSelector = document.getElementById('language-selector');
        const previewWidthRoot = document.documentElement;
        const shareFontSelector = document.getElementById('share-font-selector');
        const shareViewBody = document.body;

        function applyPreviewWidth(value) {
            const width = value || '100%';
            previewWidthRoot.style.setProperty('--preview-max-width', width);
            if (previewWidthSelector && previewWidthSelector.value !== width) {
                previewWidthSelector.value = width;
            }
        }

        function setSegmentedActive(selector, dataAttribute, activeValue) {
            if (!selector) return;
            selector.querySelectorAll('button').forEach(button => {
                const active = button.getAttribute(dataAttribute) === activeValue;
                button.classList.toggle('active', active);
                button.setAttribute('aria-pressed', active ? 'true' : 'false');
            });
        }

        function getRailSwitch(selector) {
            if (!selector) return null;
            return selector.matches('.footer-rail-switch') ? selector : selector.querySelector('.footer-rail-switch');
        }

        function setRailSwitchState(selector, checked) {
            const switcher = getRailSwitch(selector);
            if (!switcher) return;
            switcher.classList.toggle('is-checked', checked === true);
            switcher.setAttribute('aria-pressed', checked === true ? 'true' : 'false');
        }

        function applyPreviewDevice(value) {
            const device = value === 'mobile' ? 'mobile' : 'desktop';
            if (typeof window.resetEditorSplitPane === 'function') {
                window.resetEditorSplitPane();
            }
            document.body.classList.toggle('preview-device-mobile', device === 'mobile');
            document.body.classList.toggle('preview-device-desktop', device === 'desktop');
            setRailSwitchState(previewDeviceSelector, device === 'desktop');
            if (previewWidthSelector) {
                previewWidthSelector.disabled = device === 'mobile';
            }
        }

        function applySplitDirection(value) {
            const direction = value === 'vertical' ? 'vertical' : 'horizontal';
            if (typeof window.resetEditorSplitPane === 'function') {
                window.resetEditorSplitPane();
            }
            document.body.classList.toggle('preview-split-vertical', direction === 'vertical');
            document.body.classList.toggle('preview-split-horizontal', direction === 'horizontal');
            setRailSwitchState(splitDirectionSelector, direction === 'horizontal');
        }

        function applyShareFont(value) {
            const shareFont = value === 'maple' ? 'maple' : 'jetbrains';
            if (shareViewBody.classList.contains('share-view')) {
                shareViewBody.classList.toggle('share-font-jetbrains', shareFont === 'jetbrains');
                shareViewBody.classList.toggle('share-font-maple', shareFont === 'maple');
            }
            setSegmentedActive(shareFontSelector, 'data-share-font', shareFont);
        }

        const savedPreviewWidth = window.localStorage.getItem(PREVIEW_WIDTH_STORAGE_KEY);
        const initialPreviewWidth = APP_STATE.noteSettings.width || savedPreviewWidth || '100%';
        applyPreviewWidth(initialPreviewWidth);

        if (previewDeviceSelector) {
            const savedPreviewDevice = window.localStorage.getItem(PREVIEW_DEVICE_STORAGE_KEY);
            const initialPreviewDevice = APP_STATE.noteSettings.previewDevice || savedPreviewDevice || 'desktop';
            applyPreviewDevice(initialPreviewDevice);
            const previewDeviceSwitch = getRailSwitch(previewDeviceSelector)
            if (previewDeviceSwitch) previewDeviceSwitch.addEventListener('click', function() {
                const current = this.getAttribute('aria-pressed') === 'true' ? 'desktop' : 'mobile';
                const device = current === 'desktop' ? 'mobile' : 'desktop';
                applyPreviewDevice(device);
                window.localStorage.setItem(PREVIEW_DEVICE_STORAGE_KEY, device);
                persistSetting({ previewDevice: device }).catch(err => errHandle(err.message || err));
            });
        }

        if (splitDirectionSelector) {
            const initialSplitDirection = APP_STATE.noteSettings.splitDirection === 'vertical' ? 'vertical' : 'horizontal';
            applySplitDirection(initialSplitDirection);
            const splitDirectionSwitch = getRailSwitch(splitDirectionSelector)
            if (splitDirectionSwitch) splitDirectionSwitch.addEventListener('click', function() {
                const current = this.getAttribute('aria-pressed') === 'true' ? 'horizontal' : 'vertical';
                const direction = current === 'horizontal' ? 'vertical' : 'horizontal';
                applySplitDirection(direction);
                persistSetting({ splitDirection: direction }).catch(err => errHandle(err.message || err));
            });
        }

        if (shareViewBody.classList.contains('share-view') || shareFontSelector) {
            const savedShareFont = window.localStorage.getItem(SHARE_FONT_STORAGE_KEY);
            const initialShareFont = APP_STATE.noteSettings.shareFont
                || (savedShareFont === 'maple' || savedShareFont === 'true'
                ? 'maple'
                : 'jetbrains');
            applyShareFont(initialShareFont);
        }

        if (previewWidthSelector) {
            previewWidthSelector.addEventListener('change', function() {
                const width = this.value;
                applyPreviewWidth(width);
                window.localStorage.setItem(PREVIEW_WIDTH_STORAGE_KEY, width);
                persistSetting({ width }).catch(err => errHandle(err.message || err));
            });
        }

        if (languageSelector) {
            setRailSwitchState(languageSelector, APP_STATE.lang === 'zh-TW');
        }

        if (shareFontSelector) {
            shareFontSelector.querySelectorAll('[data-share-font]').forEach(button => {
                button.addEventListener('click', function() {
                    const shareFont = this.getAttribute('data-share-font') === 'maple' ? 'maple' : 'jetbrains';
                    applyShareFont(shareFont);
                    window.localStorage.setItem(SHARE_FONT_STORAGE_KEY, shareFont);
                    persistSetting({ shareFont }).catch(err => errHandle(err.message || err));
                });
            });
        }

        if (themeSelector) {
            themeSelector.addEventListener('change', function() {
                const theme = this.value;
                themeStyleNode.textContent = THEMES[theme];
                persistSetting({ theme }).catch(err => errHandle(err.message || err));
            });
        }

        initWebMcp()
    </script>
    <div id="presentation-container"></div>
    \u003cscript\u003e
    // --- Presentation Mode Engine (Final Robust Version) ---
    (function() {
        console.log('Presentation Engine Loading...');
        var _loaded = false;
        var _reveal = null;
        var _autoStarted = false;
        var _tableResizeHandler = null;

        function loadAssets() {
            return new Promise(function(resolve, reject) {
                if (_loaded) return resolve();
                ['reveal.css', 'theme/black.css'].forEach(function(p) {
                    var l = document.createElement('link');
                    l.rel = 'stylesheet';
                    l.href = 'https://cdn.jsdelivr.net/npm/reveal.js@5.1.0/dist/' + p;
                    document.head.appendChild(l);
                });
                var s = document.createElement('script');
                s.src = 'https://cdn.jsdelivr.net/npm/reveal.js@5.1.0/dist/reveal.js';
                s.onload = function() {
                    var m = document.createElement('script');
                    m.src = 'https://cdn.jsdelivr.net/npm/reveal.js@5.1.0/plugin/markdown/markdown.js';
                    m.onload = function() { _loaded = true; resolve(); };
                    m.onerror = reject;
                    document.head.appendChild(m);
                };
                s.onerror = reject;
                document.head.appendChild(s);
            });
        }

        function preparePresentationTables(container) {
            container.querySelectorAll('.reveal section table').forEach(function(table) {
                if (table.closest('.presentation-table-fit')) return;
                var wrapper = document.createElement('div');
                wrapper.className = 'presentation-table-fit';
                table.parentNode.insertBefore(wrapper, table);
                wrapper.appendChild(table);
            });
        }

        function fitPresentationTables(container) {
            var reveal = container.querySelector('.reveal');
            if (!reveal) return;

            preparePresentationTables(container);

            reveal.querySelectorAll('.presentation-table-fit').forEach(function(wrapper) {
                var table = wrapper.querySelector('table');
                var section = wrapper.closest('section');
                if (!table || !section) return;

                table.style.transform = '';
                wrapper.style.width = '';
                wrapper.style.height = '';

                var sectionWidth = section.clientWidth || 1000;
                var sectionHeight = section.clientHeight || 700;
                var availableWidth = Math.max(120, sectionWidth - 24);
                var availableHeight = Math.max(90, sectionHeight - wrapper.offsetTop - 24);
                var tableWidth = table.scrollWidth || table.offsetWidth;
                var tableHeight = table.scrollHeight || table.offsetHeight;

                if (!tableWidth || !tableHeight) return;

                var scale = Math.min(1, availableWidth / tableWidth, availableHeight / tableHeight);
                if (!Number.isFinite(scale) || scale <= 0) scale = 1;
                scale = Math.max(0.18, Math.min(1, scale));

                table.style.transform = 'scale(' + scale + ')';
                wrapper.style.width = (tableWidth * scale) + 'px';
                wrapper.style.height = (tableHeight * scale) + 'px';
                wrapper.classList.toggle('presentation-table-scaled', scale < 0.999);
            });
        }

        function fitPresentationSlides(container) {
            var reveal = container.querySelector('.reveal');
            if (!reveal) return;

            var availableWidth = 960;
            var availableHeight = 600;
            var baseFontSize = 28;
            var minimumFontSize = 13;

            reveal.querySelectorAll('.slides section').forEach(function(section) {
                section.style.fontSize = baseFontSize + 'px';
            });

            fitPresentationTables(container);

            reveal.querySelectorAll('.slides section').forEach(function(section) {
                var contentWidth = Math.max(section.scrollWidth, section.offsetWidth);
                var contentHeight = section.scrollHeight;
                if (!contentWidth || !contentHeight) return;

                var scale = Math.min(1, availableWidth / contentWidth, availableHeight / contentHeight);
                if (!Number.isFinite(scale) || scale <= 0) scale = 1;

                var fittedFontSize = Math.max(minimumFontSize, Math.floor(baseFontSize * scale));
                section.style.fontSize = fittedFontSize + 'px';
                section.classList.toggle('presentation-slide-scaled', fittedFontSize < baseFontSize);
            });

            fitPresentationTables(container);
        }

        function schedulePresentationFit(container) {
            requestAnimationFrame(function() {
                requestAnimationFrame(function() {
                    fitPresentationSlides(container);
                });
            });
        }

        window.initPresentation = async function() {
            console.log('initPresentation triggered');
            var content = '';
            var edit = document.getElementById('contents');
            var share = document.getElementById('bot-accessible-content');
            
            if (edit && !edit.classList.contains('hide')) {
                content = edit.value;
            } else if (share) {
                content = share.innerText || share.textContent || '';
            }

            if (!content || !content.trim()) { alert(getI18n('presentationUnavailable')); return; }

            var container = document.getElementById('presentation-container');
            container.innerHTML = '\u003cbutton id="presentation-close-btn"\u003e✕ ' + getI18n('presentationClose') + '\u003c/button\u003e' +
                                 '\u003cdiv class="reveal"\u003e\u003cdiv class="slides"\u003e\u003c/div\u003e\u003c/div\u003e';
            
            document.getElementById('presentation-close-btn').onclick = window.exitPresentation;
            
            var slidesDiv = container.querySelector('.slides');
            // Split by standalone '---' - Use 4 backslashes for double escaping in template literal
            var chunks = content.split(/\\r?\\n\\s*---\\s*\\r?\\n/);
            console.log('Slides split into ' + chunks.length + ' chunks');

            chunks.forEach(function(c) {
                var processed = c.trim();
                
                // 1. Layouts: ::left:: / ::right::
                if (processed.includes('::left::') && processed.includes('::right::')) {
                    var parts = processed.split(/::left::|::right::/);
                    if (parts.length >= 3) {
                        var before = parts[0].trim();
                        var left = parts[1].trim();
                        var right = parts[2].trim();
                        processed = (before ? before + '\\n\\n' : '') + 
                            '\\u003cdiv class="slidev-layout-two-cols"\\u003e\\u003cdiv class="col-left"\\u003e\\n\\n' + left + '\\n\\n\\u003c/div\\u003e\\u003cdiv class="col-right"\\u003e\\n\\n' + right + '\\n\\n\\u003c/div\\u003e\\n\\u003c/div\\u003e';
                    }
                }

                // 2. Click Animations: {v-click} -> Reveal fragments
                processed = processed.replace(/\{v-click\}/g, '\\u003c!-- .element: class="fragment" --\\u003e');

                var sec = document.createElement('section');
                sec.setAttribute('data-markdown', '');
                var script = document.createElement('script');
                script.type = 'text/template';
                script.textContent = processed;
                sec.appendChild(script);
                slidesDiv.appendChild(sec);
            });

            container.classList.add('active');
            document.body.style.overflow = 'hidden';

            try {
                await loadAssets();
                if (_reveal) { try { _reveal.destroy(); } catch(e) {} }
                _reveal = new Reveal(container.querySelector('.reveal'), {
                    plugins: [RevealMarkdown],
                    center: false, hash: true, transition: 'fade',
                    width: 1000, height: 700, margin: 0.1,
                    controls: true, progress: true, slideNumber: true
                });
                if (_reveal.on) {
                    _reveal.on('ready', function() { schedulePresentationFit(container); });
                    _reveal.on('slidechanged', function() { schedulePresentationFit(container); });
                    _reveal.on('resize', function() { schedulePresentationFit(container); });
                }
                await _reveal.initialize();
                if (_tableResizeHandler) window.removeEventListener('resize', _tableResizeHandler);
                _tableResizeHandler = function() { schedulePresentationFit(container); };
                window.addEventListener('resize', _tableResizeHandler);
                schedulePresentationFit(container);
                console.log('Reveal.js initialized (Slidev-Lite mode)');
            } catch(e) {
                console.error('Presentation error:', e);
                alert(getI18n('presentationFailed') + e);
                window.exitPresentation();
            }
        };

        window.exitPresentation = function() {
            var c = document.getElementById('presentation-container');
            var shouldReturnToShare = APP_STATE.autoPresent && APP_STATE.sharePath && window.location.pathname === APP_STATE.presentationPath;
            c.classList.remove('active');
            if (_reveal) { try { _reveal.destroy(); } catch(e) {} _reveal = null; }
            if (_tableResizeHandler) {
                window.removeEventListener('resize', _tableResizeHandler);
                _tableResizeHandler = null;
            }
            c.innerHTML = '';
            document.body.style.overflow = '';
            if (shouldReturnToShare) {
                window.location.replace(APP_STATE.sharePath);
            }
        };

        function maybeAutoStart() {
            if (!APP_STATE.autoPresent || _autoStarted) return;
            _autoStarted = true;
            window.initPresentation();
        }

        // Bind present button — only exists when mode === 'md' or in share view
        (function() {
            var btn = document.getElementById('present-btn');
            if (btn) btn.onclick = window.initPresentation;
        })();
        maybeAutoStart();

        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && document.getElementById('presentation-container').classList.contains('active')) {
                window.exitPresentation();
            }
        });
    })();
    \u003c/script\u003e
\u003c/body\u003e
\u003c/html\u003e
`
}

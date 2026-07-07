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
    <style id="theme-style">${THEMES[ext.theme || 'catppuccin-macchiato'] || ''}</style>
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
        noteSettings: {
            width: ext.width || '',
            shareFont: ext.shareFont || '',
            previewDevice: ext.previewDevice || '',
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
            const response = await window.fetch(getSettingPath(), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(nextSettings),
            })
            const payload = await response.json()
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
        const normalizedPasswd = passwd.trim()
        if (!normalizedPasswd) { alert(getI18n('pwcnbe')); return; }
        const destination = rememberPresentationDestination() || (location.pathname + location.hash)
        window.fetch(getAuthPath(), { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ passwd: normalizedPasswd }) })
            .then(res => res.json())
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
            const response = await window.fetch(apiBase() + '/' + encodeURIComponent(versionId))
            const payload = await response.json()
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
                const response = await window.fetch(apiBase())
                const payload = await response.json()
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
                    const response = await window.fetch(apiBase() + '/' + encodeURIComponent(selectedVersion.id) + '/restore', { method: 'POST' })
                    const payload = await response.json()
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
        const $modeBtn = document.querySelector('.opt-mode > input')
        const $shareBtn = document.querySelector('.opt-share > input')
        const $previewPlain = document.querySelector('#preview-plain')
        const $previewMd = document.querySelector('#preview-md')
        const $shareModal = document.querySelector('.share-modal')
        const $closeBtn = document.querySelector('.share-modal .close-btn')
        const $copyBtn = document.querySelector('.share-modal .opt-button')
        const $shareInput = document.querySelector('.share-modal input')
        const $languageSelector = document.querySelector('#language-selector')
        const $publishNudgeModal = document.querySelector('.publish-nudge-modal')
        const $publishNudgePublish = document.querySelector('.publish-nudge-publish')
        const $publishNudgeLater = document.querySelector('.publish-nudge-later')
        const $publishNudgeClose = document.querySelector('.publish-nudge-close')
        const $mobileFooterMoreBtn = document.querySelector('#mobile-footer-more-btn')

        setupShareHistory()
        setupNoteHistory({
            textarea: $textarea,
            previewMarkdownNode: $previewMd,
            previewPlainNode: $previewPlain,
        })
        if ($mobileFooterMoreBtn) {
            $mobileFooterMoreBtn.addEventListener('click', () => {
                const expanded = !document.body.classList.contains('mobile-footer-expanded')
                document.body.classList.toggle('mobile-footer-expanded', expanded)
                $mobileFooterMoreBtn.setAttribute('aria-expanded', expanded ? 'true' : 'false')
            })
        }
        renderPlain($previewPlain, $textarea ? $textarea.value : '')
        triggerRender($previewMd, $textarea ? $textarea.value : '')
        setupShareBackToTop($previewMd || $previewPlain)

        const showShareModal = (shareId) => {
            if (!$shareModal || !$shareInput || !shareId) return;
            $shareInput.value = window.location.origin + '/share/' + shareId;
            $shareModal.style.display = 'block';
        }

        const publishCurrentNote = () => {
            return window.fetch(window.location.pathname + '/setting', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ share: true })
            })
                .then(res => res.json())
                .then(res => {
                    if (res.err !== 0) {
                        if ($shareBtn) $shareBtn.checked = false;
                        errHandle(res.msg);
                        return false;
                    }
                    APP_STATE.isPublished = true;
                    if ($shareBtn) $shareBtn.checked = true;
                    recordShareHistory('created', window.location.origin + '/share/' + res.data, APP_STATE.title);
                    showShareModal(res.data);
                    return true;
                })
                .catch(err => {
                    if ($shareBtn) $shareBtn.checked = false;
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
            $languageSelector.querySelectorAll('[data-lang]').forEach(button => {
                button.addEventListener('click', function() {
                    const nextLang = this.getAttribute('data-lang') === 'zh-TW' ? 'zh-TW' : 'en-US';
                    if (nextLang !== APP_STATE.lang) setLanguage(nextLang);
                });
            });
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
                $textarea.style.flex = \`0 0 \${newLeftPercent}%\`; $previewPane.style.flex = \`0 0 calc(\${100 - newLeftPercent}% - 8px)\`;
            };
            const mouseUpHandler = function() {
                document.removeEventListener('mousemove', mouseMoveHandler); document.removeEventListener('mouseup', mouseUpHandler);
                $resizer.style.borderLeft = null; $resizer.style.borderRight = null; document.body.style.cursor = null;
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
                            window.fetch('/upload', { method: 'POST', body: formData })
                                .then(res => res.json())
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
        const $copyPresentShareBtn = document.querySelector('#copy-present-share-btn');
        const $unpublishBtn = document.querySelector('.unpublish-btn');
        if ($shareUrlInput && $shareCopyBtn) {
            try { $shareUrlInput.value = window.location.origin + ($shareUrlInput.getAttribute('value') || $shareUrlInput.value); } catch(e) {}
            recordShareHistory('created', $shareUrlInput.value, APP_STATE.title);
            $shareCopyBtn.addEventListener('click', async () => {
                try { await clipboardCopy($shareUrlInput.value); const orig = $shareCopyBtn.innerText; $shareCopyBtn.innerText = '✅'; setTimeout(() => $shareCopyBtn.innerText = orig, 2000); } catch (e) { alert(getI18n('copyFailed')); }
            });
        }
        if ($shareUrlInput && $copyPresentShareBtn) {
            $copyPresentShareBtn.addEventListener('click', async () => {
                const presentationUrl = ($shareUrlInput.value || '') + '/present';
                try { await clipboardCopy(presentationUrl); const orig = $copyPresentShareBtn.innerText; $copyPresentShareBtn.innerText = '✅'; setTimeout(() => $copyPresentShareBtn.innerText = orig, 2000); } catch (e) { alert(getI18n('copyFailed')); }
            });
        }
        if ($unpublishBtn) {
            $unpublishBtn.addEventListener('click', () => {
                if (!confirm(getI18n('unpublishConfirm'))) return;
                window.fetch(window.location.pathname + '/setting', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ share: false }) })
                    .then(res => res.json()).then(res => { if (res.err !== 0) { return errHandle(res.msg); } window.location.reload(); }).catch(err => errHandle(err));
            });
        }

        if ($shareBtn) {
            $shareBtn.onclick = function (e) {
                const isShare = e.target.checked
                if (isShare) {
                    publishCurrentNote();
                    return;
                }
                window.fetch(window.location.pathname + '/setting', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ share: false }) })
                    .then(res => res.json())
                    .then(res => { if (res.err !== 0) { return errHandle(res.msg) } APP_STATE.isPublished = false; })
                    .catch(err => errHandle(err))
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
        }

        const setupMobileShareFooter = () => {
            const footer = document.querySelector('.footer');
            const scrollTarget = $previewMd || $previewPlain;
            if (!document.body.classList.contains('share-view') || !footer || !scrollTarget) return;
            const media = window.matchMedia('(max-width: 960px)');
            let lastScrollTop = scrollTarget.scrollTop;
            let revealTimer = null;

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
                if (currentScrollTop <= 8 || currentScrollTop < lastScrollTop) {
                    showFooter();
                } else {
                    hideFooter();
                }
                lastScrollTop = Math.max(currentScrollTop, 0);

                clearTimeout(revealTimer);
                revealTimer = setTimeout(showFooter, 900);
            }

            scrollTarget.addEventListener('scroll', handleScroll, { passive: true });
            if (media.addEventListener) {
                media.addEventListener('change', showFooter);
            } else if (media.addListener) {
                media.addListener(showFooter);
            }
        }
        setupMobileShareFooter();
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

        function applyPreviewDevice(value) {
            const device = value === 'mobile' ? 'mobile' : 'desktop';
            if (typeof window.resetEditorSplitPane === 'function') {
                window.resetEditorSplitPane();
            }
            document.body.classList.toggle('preview-device-mobile', device === 'mobile');
            document.body.classList.toggle('preview-device-desktop', device === 'desktop');
            setSegmentedActive(previewDeviceSelector, 'data-preview-device', device);
            if (previewWidthSelector) {
                previewWidthSelector.disabled = device === 'mobile';
            }
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
            previewDeviceSelector.querySelectorAll('[data-preview-device]').forEach(button => {
                button.addEventListener('click', function() {
                    const device = this.getAttribute('data-preview-device') === 'mobile' ? 'mobile' : 'desktop';
                    applyPreviewDevice(device);
                    window.localStorage.setItem(PREVIEW_DEVICE_STORAGE_KEY, device);
                    persistSetting({ previewDevice: device }).catch(err => errHandle(err.message || err));
                });
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
            setSegmentedActive(languageSelector, 'data-lang', APP_STATE.lang);
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

        // Ensure binding even if DOM is still hydrating
        function bind() {
            var btn = document.getElementById('present-btn');
            if (btn) {
                btn.onclick = window.initPresentation;
                console.log('Present button bound successfully');
            } else {
                console.warn('Present button not found, retrying in 500ms...');
                setTimeout(bind, 500);
            }
        }
        bind();
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

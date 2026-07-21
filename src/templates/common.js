/**
 * src/templates/common.js
 * Shared template components: SWITCHER, FOOTER, MODAL
 */
import dayjs from 'dayjs'
import { SUPPORTED_LANG } from '../constant'
import { THEMES } from '../theme_data'

const getLangText = lang => SUPPORTED_LANG[lang] || SUPPORTED_LANG['en-US']

const THEME_OPTION_LABELS = {
    'ayu-light': { 'zh-TW': '極簡溫暖', 'en-US': 'Minimal warmth' },
    'bauhaus': { 'zh-TW': '幾何藝術', 'en-US': 'Geometric art' },
    'botanical': { 'zh-TW': '植物圖鑑', 'en-US': 'Botanical field guide' },
    'catppuccin-latte': { 'zh-TW': '柔和亮色', 'en-US': 'Soft light' },
    'catppuccin-macchiato': { 'zh-TW': '柔和暗色', 'en-US': 'Soft dark' },
    'claude-canvas': { 'zh-TW': '人文溫暖', 'en-US': 'Warm humanist' },
    'green-simple': { 'zh-TW': '簡潔綠色', 'en-US': 'Clean green' },
    'kanagawa': { 'zh-TW': '日本墨水', 'en-US': 'Japanese ink' },
    'neo-brutalism': { 'zh-TW': '粗野主義', 'en-US': 'Neo-brutalist' },
    'newsprint': { 'zh-TW': '報紙印刷', 'en-US': 'Newsprint' },
    'notion-clean': { 'zh-TW': '極簡白板', 'en-US': 'Minimal whiteboard' },
    'organic': { 'zh-TW': '侘寂陶藝', 'en-US': 'Wabi-sabi ceramic' },
    'playful-geometric': { 'zh-TW': '活潑幾何', 'en-US': 'Playful geometry' },
    'professional': { 'zh-TW': '專業商務', 'en-US': 'Professional business' },
    'retro': { 'zh-TW': '90年代懷舊', 'en-US': '90s nostalgia' },
    'shopify-mint': { 'zh-TW': '清新薄荷', 'en-US': 'Fresh mint' },
    'sketch': { 'zh-TW': '手繪草圖', 'en-US': 'Hand-drawn sketch' },
    'terminal': { 'zh-TW': '終端暗色', 'en-US': 'Terminal dark' },
    'tokyo-night': { 'zh-TW': '東京夜景', 'en-US': 'Tokyo night' },
    'x-ai': { 'zh-TW': '科技深黑', 'en-US': 'Tech black' },
}

const SVG_ICONS = {
    editLock: `<svg class="svg-icon lock-combo-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="10" width="11" height="10" rx="2"></rect><path d="M7 10V7a3 3 0 0 1 5.5-1.7"></path><path d="m13.5 16.5 5.7-5.7a1.4 1.4 0 0 1 2 2l-5.7 5.7-3 1z"></path><path d="m17.8 12.2 2 2"></path></svg>`,
    readLock: `<svg class="svg-icon lock-combo-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><rect x="2.5" y="10" width="10.5" height="10" rx="2"></rect><path d="M5.5 10V7a3 3 0 0 1 5.5-1.7"></path><path d="M14.5 14.5s2-3 4.5-3 4.5 3 4.5 3-2 3-4.5 3-4.5-3-4.5-3z"></path><circle cx="19" cy="14.5" r="1.1"></circle></svg>`,
    link: `<svg class="svg-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="7" y1="17" x2="17" y2="7"></line><polyline points="7 7 17 7 17 17"></polyline></svg>`,
    copy: `<svg class="svg-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>`,
    check: `<svg class="svg-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m5 12 4 4L19 6"></path></svg>`,
    play: `<svg class="svg-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>`,
    close: `<svg class="svg-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>`,
    import: `<svg class="svg-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>`,
    export: `<svg class="svg-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>`,
    pdf: `<svg class="svg-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>`,
    shareHistory: `<svg class="svg-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>`,
    history: `<svg class="svg-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>`,
    more: `<svg class="svg-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="1"></circle><circle cx="19" cy="12" r="1"></circle><circle cx="5" cy="12" r="1"></circle></svg>`,
    sparkles: `<svg class="svg-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m0-12.728l.707.707m11.314 11.314l.707-.707M12 5a7 7 0 1 0 0 14 7 7 0 0 0 0-14z"></path></svg>`,
    magic: `<svg class="svg-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m11.5 12.5 9-9M16 3l5 5M6.5 17.5l-4 4M2 17h5M2 22v-5M12.5 18.5l-.5-2.5-2.5-.5 2.5-.5.5-2.5.5 2.5 2.5.5-2.5.5zM5 8.5 4.5 6 2 5.5 4.5 5 5 2.5 5.5 5 8 5.5 5.5 6z"></path></svg>`,
    apiDocs: `<svg class="svg-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><path d="M8 13l3 3-3 3M16 19h-3"></path></svg>`,
    clock: `<svg class="svg-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>`
}

const EDITOR_TOOLBAR_COMMANDS = [
    { command: 'undo', glyph: '↶', zh: '復原', en: 'Undo' },
    { command: 'redo', glyph: '↷', zh: '重做', en: 'Redo' },
    { separator: true },
    { command: 'heading1', glyph: 'H1', zh: '一級標題', en: 'Heading 1' },
    { command: 'heading2', glyph: 'H2', zh: '二級標題', en: 'Heading 2' },
    { command: 'heading3', glyph: 'H3', zh: '三級標題', en: 'Heading 3' },
    { separator: true },
    { command: 'bold', glyph: 'B', glyphClass: 'is-bold', zh: '粗體', en: 'Bold' },
    { command: 'italic', glyph: 'I', glyphClass: 'is-italic', zh: '斜體', en: 'Italic' },
    { command: 'strike', glyph: 'S', glyphClass: 'is-strike', zh: '刪除線', en: 'Strikethrough' },
    { command: 'link', glyph: '↗', zh: '連結', en: 'Link' },
    { separator: true },
    { command: 'quote', glyph: '❝', zh: '引用', en: 'Quote' },
    { command: 'bullet', glyph: '☷', zh: '無序清單', en: 'Bullet list' },
    { command: 'ordered', glyph: '1.', zh: '有序清單', en: 'Numbered list' },
    { command: 'task', glyph: '☑', zh: '待辦清單', en: 'Task list' },
    { separator: true },
    { command: 'inlineCode', glyph: '&lt;/&gt;', glyphClass: 'is-code', zh: '行內程式碼', en: 'Inline code' },
    { command: 'codeBlock', glyph: '{ }', glyphClass: 'is-code', zh: '程式碼區塊', en: 'Code block' },
    { command: 'rule', glyph: '―', zh: '分隔線', en: 'Horizontal rule' },
    { command: 'table', glyph: '▦', glyphClass: 'is-table', zh: '插入表格', en: 'Insert table' },
    { command: 'image', glyph: '▧', glyphClass: 'is-image', zh: '上傳圖片', en: 'Upload image' },
    { command: 'asset', glyph: '⇧', glyphClass: 'is-asset', zh: '上傳附件', en: 'Upload attachment' },
    { separator: true },
    { command: 'fullscreen', glyph: '⛶', zh: '全螢幕編輯', en: 'Fullscreen editor' },
]

export const EDITOR_TOOLBAR = lang => {
    const isZh = lang === 'zh-TW'
    const label = isZh ? 'Markdown 編輯工具' : 'Markdown editing tools'
    return `
    <div class="markdown-editor-toolbar-wrap">
    <div class="markdown-editor-toolbar" data-markdown-toolbar data-language="${lang}" role="toolbar" aria-label="${label}">
        ${EDITOR_TOOLBAR_COMMANDS.map(item => item.separator
            ? '<span class="markdown-toolbar-separator" role="separator" aria-hidden="true"></span>'
            : `<button type="button" class="markdown-toolbar-button" data-command="${item.command}" title="${isZh ? item.zh : item.en}" aria-label="${isZh ? item.zh : item.en}"><span class="markdown-toolbar-glyph ${item.glyphClass || ''}" aria-hidden="true">${item.glyph}</span></button>`
        ).join('')}
        <span class="markdown-toolbar-separator" role="separator" aria-hidden="true"></span>
        <button type="button" id="editor-ai-format-btn" class="markdown-toolbar-button" data-ai-action="format" title="${isZh ? 'AI 格式化排版' : 'AI Format Document'}" aria-label="${isZh ? 'AI 格式化排版' : 'AI Format Document'}"><span class="markdown-toolbar-glyph is-ai" aria-hidden="true">✦</span></button>
    </div>
    <input id="markdown-toolbar-image-input" class="visually-hidden-file-input" type="file" accept="image/*" aria-label="${isZh ? '選擇要上傳的圖片' : 'Choose an image to upload'}">
    <input id="markdown-toolbar-asset-input" class="visually-hidden-file-input" type="file" accept="video/*,audio/*,application/pdf,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.md,.zip,.rar,.7z" aria-label="${isZh ? '選擇要上傳的附件' : 'Choose an attachment to upload'}">
    </div>
    `
}

export const RAIL_SWITCH = ({ className = '', checked = false, checkedTitle = '', uncheckedTitle = '', checkedText, uncheckedText, ariaLabel, checkedValue, uncheckedValue }) => `
<button
  type="button"
  class="footer-rail-switch ${className} ${checked ? 'is-checked' : ''}"
  aria-label="${ariaLabel}"
  aria-pressed="${checked ? 'true' : 'false'}"
  ${checkedValue ? `data-rail-checked-value="${checkedValue}"` : ''}
  ${uncheckedValue ? `data-rail-unchecked-value="${uncheckedValue}"` : ''}
>
  <span class="footer-rail-text footer-rail-text-checked"><span class="footer-rail-caption">${checkedTitle}</span><span class="footer-rail-value">${checkedText}</span></span>
  <span class="footer-rail-text footer-rail-text-unchecked"><span class="footer-rail-caption">${uncheckedTitle}</span><span class="footer-rail-value">${uncheckedText}</span></span>
  <span class="footer-rail-thumb" aria-hidden="true"></span>
</button>
`

// Keep the legacy export available for callers outside the footer template.
export const SWITCHER = (text, open, className = '') => `
<label class="opt-switcher ${className}">
  <input type="checkbox" ${open ? 'checked' : ''}>
  <span class="slider round"></span>
</label>
<span class="footer-control-label">${text}</span>
`

export const FOOTER = ({ lang, isEdit, updateAt, pw, vpw, mode, share, shareId, path, theme, sharePath, noteHistoryEnabled, publicIndex, authPath, autosave }) => {
    const t = getLangText(lang)
    const showNoteHistory = noteHistoryEnabled === true && isEdit
    const shareFontAriaLabel = lang === 'zh-TW' ? '分享頁字型' : 'Share font'
    const jetbrainsTitle = lang === 'zh-TW' ? '切換為 JetBrains Mono' : 'Switch to JetBrains Mono'
    const mapleTitle = lang === 'zh-TW' ? '切換為 Maple Mono' : 'Switch to Maple Mono'
    const copyShareTitle = lang === 'zh-TW' ? '複製分享連結' : 'Copy share link'
    const copyPresentTitle = lang === 'zh-TW' ? '複製簡報連結' : 'Copy presentation link'
    const unpublishTitle = lang === 'zh-TW' ? '取消發布' : 'Unpublish'
    const publicIndexTitle = publicIndex === true ? t.publicIndexDisable : t.publicIndexEnable
    const moreToolsTitle = lang === 'zh-TW' ? '顯示更多工具' : 'Show more tools'
    const getThemeLabel = themeName => {
        const description = THEME_OPTION_LABELS[themeName]?.[lang] || ''
        return description ? `${themeName} · ${description}` : themeName
    }
    return `
    <div class="footer">
        <div class="footer-sections">
            <div class="footer-section footer-section-edit">
                <div class="footer-section-body">
                    ${isEdit ? `
                        <div class="footer-control-group">
                            <div class="dropdown-container share-dropdown share-state-toggle">
                                ${RAIL_SWITCH({
                                    className: `share-state-switcher opt-share ${share ? 'share-published' : ''}`,
                                    checked: share,
                                    checkedTitle: lang === 'zh-TW' ? '發布' : 'Publish',
                                    uncheckedTitle: lang === 'zh-TW' ? '發布' : 'Publish',
                                    checkedText: lang === 'zh-TW' ? '已發布' : 'Live',
                                    uncheckedText: lang === 'zh-TW' ? '待發布' : 'Draft',
                                    ariaLabel: t.shareLinkTitle,
                                })}
                                <button type="button" id="share-menu-btn" class="toolbar-icon-button share-menu-trigger dropdown-trigger share-menu-small" title="${lang === 'zh-TW' ? '分享選項' : 'Share options'}" aria-label="${lang === 'zh-TW' ? '分享選項' : 'Share options'}" aria-haspopup="menu" aria-expanded="false">
                                    ${SVG_ICONS.more}
                                </button>
                                <div class="dropdown-menu" role="menu">
                                    <div class="share-menu-published" ${share && shareId ? '' : 'hidden'}>
                                    <a id="share-open-link" class="dropdown-item" href="/share/${shareId}" target="_blank" rel="noreferrer">
                                        ${SVG_ICONS.link} <span>${lang === 'zh-TW' ? '打開分享頁面' : 'Open share'}</span>
                                    </a>
                                    <button type="button" id="copy-share-btn" class="dropdown-item" title="${copyShareTitle}">
                                        ${SVG_ICONS.copy} <span>${copyShareTitle}</span>
                                    </button>
                                    <button type="button" id="copy-present-share-btn" class="dropdown-item" title="${copyPresentTitle}">
                                        ${SVG_ICONS.play} <span>${copyPresentTitle}</span>
                                    </button>
                                    <div class="dropdown-divider"></div>
                                    <div class="dropdown-item-toggle">
                                        <span>${lang === 'zh-TW' ? '公開索引' : 'Public Index'}</span>
                                        <button type="button" id="public-index-btn" class="opt-button public-index-btn ${publicIndex === true ? 'opt-button-accent' : ''}" data-public-index="${publicIndex === true ? 'true' : 'false'}">${publicIndex === true ? t.publicIndexOn : t.publicIndexOff}</button>
                                    </div>
                                    <div class="dropdown-divider"></div>
                                    <button type="button" class="dropdown-item dropdown-danger-item unpublish-btn" title="${unpublishTitle}">
                                        ${SVG_ICONS.close} <span>${unpublishTitle}</span>
                                    </button>
                                    </div>
                                    <div class="share-menu-unpublished" ${share && shareId ? 'hidden' : ''}>
                                    <button type="button" class="dropdown-item share-publish-menu-btn">
                                        ${SVG_ICONS.link} <span>${lang === 'zh-TW' ? '發布並建立分享連結' : 'Publish and create share link'}</span>
                                    </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="save-control-group" aria-label="${lang === 'zh-TW' ? '儲存設定' : 'Save settings'}">
                            <button type="button" id="save-note-btn" class="toolbar-icon-button" title="${lang === 'zh-TW' ? '儲存文章' : 'Save note'}" aria-label="${lang === 'zh-TW' ? '儲存文章' : 'Save note'}">
                                ${SVG_ICONS.check}
                                <span class="toolbar-button-label">${lang === 'zh-TW' ? '儲存' : 'Save'}</span>
                            </button>
                            <label class="autosave-toggle-label" title="${share ? (lang === 'zh-TW' ? '停止輸入 10 秒後自動儲存' : 'Save automatically after 10 seconds of inactivity') : (lang === 'zh-TW' ? '請先發布文章才能啟用 autosave' : 'Publish this note before enabling autosave')}" aria-label="${lang === 'zh-TW' ? '啟用文章自動儲存' : 'Enable note autosave'}">
                                <input type="checkbox" id="autosave-toggle" ${autosave === true && share === true ? 'checked' : ''} ${share === true ? '' : 'disabled'}>
                                <span>${lang === 'zh-TW' ? '自動儲存' : 'Autosave'}</span>
                            </label>
                        </div>
                        <button class="toolbar-icon-button opt-pw ${pw ? 'toolbar-active-button' : ''}" data-type="edit" title="${t.editLockTitle}" aria-label="${t.editLockTitle}">
                            ${SVG_ICONS.editLock}
                            <span class="toolbar-button-label">${t.editLockTitle}</span>
                        </button>
                        <button class="toolbar-icon-button opt-pw-view ${vpw ? 'toolbar-active-button' : ''}" data-type="view" title="${t.readLockTitle}" aria-label="${t.readLockTitle}">
                            ${SVG_ICONS.readLock}
                            <span class="toolbar-button-label">${t.readLockTitle}</span>
                        </button>
                        <input id="import-md-input" type="file" accept=".md,.markdown,text/markdown,text/plain" class="visually-hidden-file-input" aria-hidden="true">
                        <button type="button" id="import-md-btn" class="toolbar-icon-button" title="${t.importMarkdown}" aria-label="${t.importMarkdown}">
                            ${SVG_ICONS.import}
                            <span class="toolbar-button-label">${lang === 'zh-TW' ? '匯入' : 'Import'}</span>
                        </button>
                        <button type="button" id="export-md-btn" class="toolbar-icon-button" title="${t.exportMarkdown}" aria-label="${t.exportMarkdown}">
                            ${SVG_ICONS.export}
                            <span class="toolbar-button-label">${lang === 'zh-TW' ? '匯出' : 'Export'}</span>
                        </button>
                        <button type="button" id="copy-md-btn" class="toolbar-icon-button copy-md-button" title="${lang === 'zh-TW' ? '複製內容' : 'Copy content'}" aria-label="${lang === 'zh-TW' ? '複製內容' : 'Copy content'}">
                            <span class="copy-button-icon copy-button-icon-default">${SVG_ICONS.copy}</span>
                            <span class="copy-button-icon copy-button-icon-success" aria-hidden="true">${SVG_ICONS.check}</span>
                            <span class="toolbar-button-label">${lang === 'zh-TW' ? '複製' : 'Copy'}</span>
                        </button>
                        <button type="button" id="export-pdf-btn" class="toolbar-icon-button" title="${t.exportPdf}" aria-label="${t.exportPdf}">
                            ${SVG_ICONS.pdf}
                            <span class="toolbar-button-label">${lang === 'zh-TW' ? '列印' : 'Print'}</span>
                        </button>
                        ${showNoteHistory ? `
                            <button type="button" id="note-history-btn" class="toolbar-icon-button note-history-trigger" aria-haspopup="dialog" aria-expanded="false" title="${t.historyTitle}" aria-label="${t.historyTitle}">
                                ${SVG_ICONS.history}
                                <span class="sr-only">${t.historyTitle}</span>
                            </button>
                        ` : ''}
                        <button type="button" id="ai-format-btn" class="toolbar-icon-button" title="${lang === 'zh-TW' ? 'AI 格式化排版' : 'AI Format Document'}" aria-label="${lang === 'zh-TW' ? 'AI 格式化排版' : 'AI Format Document'}">
                            ${SVG_ICONS.sparkles}
                            <span class="toolbar-button-label">${lang === 'zh-TW' ? 'AI排版' : 'Format'}</span>
                        </button>
                        <button type="button" id="ai-edit-btn" class="toolbar-icon-button" title="${lang === 'zh-TW' ? 'AI 輔助編輯' : 'AI Edit Document'}" aria-label="${lang === 'zh-TW' ? 'AI 輔助編輯' : 'AI Edit Document'}">
                            ${SVG_ICONS.magic}
                            <span class="toolbar-button-label">${lang === 'zh-TW' ? 'AI編輯' : 'AI Edit'}</span>
                        </button>
                        ${mode === 'md' ? `<button id="present-btn" class="toolbar-icon-button" title="${t.presentTitle}" aria-label="${t.presentTitle}">${SVG_ICONS.play}<span class="toolbar-button-label">${t.present}</span></button>` : ''}
                        <button type="button" id="share-history-btn" class="toolbar-icon-button share-history-trigger" title="${lang === 'zh-TW' ? '最近分享紀錄' : 'Recent shares'}" aria-label="${lang === 'zh-TW' ? '最近分享紀錄' : 'Recent shares'}" aria-haspopup="dialog" aria-expanded="false">
                            ${SVG_ICONS.shareHistory}
                            <span class="sr-only">${t.recentSharesTitle}</span>
                        </button>
                        <div class="footer-view-settings-group" aria-label="${lang === 'zh-TW' ? '編輯器視圖設定' : 'Editor view settings'}">
                            <div class="footer-preview-group footer-control-group">
                                ${RAIL_SWITCH({
                                    className: 'opt-mode',
                                    checked: mode === 'md',
                                    checkedTitle: lang === 'zh-TW' ? '預覽' : 'Preview',
                                    uncheckedTitle: lang === 'zh-TW' ? '預覽' : 'Preview',
                                    checkedText: lang === 'zh-TW' ? '開預覽' : 'On',
                                    uncheckedText: lang === 'zh-TW' ? '關預覽' : 'Off',
                                    ariaLabel: t.preview,
                                    checkedValue: 'md',
                                    uncheckedValue: 'plain',
                                })}
                            </div>
                            ${mode === 'md' ? `
                                <div class="footer-control-group desktop-split-control">
                                    <div id="split-direction-selector">
                                        ${RAIL_SWITCH({
                                            checked: true,
                                            checkedTitle: 'Layout',
                                            uncheckedTitle: 'Layout',
                                            checkedText: lang === 'zh-TW' ? '左右' : 'Side',
                                            uncheckedText: lang === 'zh-TW' ? '上下' : 'Stack',
                                            ariaLabel: lang === 'zh-TW' ? '編輯預覽排列' : 'Editor preview layout',
                                            checkedValue: 'horizontal',
                                            uncheckedValue: 'vertical',
                                        })}
                                    </div>
                                </div>
                                <div class="footer-control-group">
                                    <div id="preview-device-selector">
                                        ${RAIL_SWITCH({
                                            className: 'preview-device-toggle',
                                            checked: true,
                                            checkedTitle: 'Device',
                                            uncheckedTitle: 'Device',
                                            checkedText: t.desktop,
                                            uncheckedText: t.mobile,
                                            ariaLabel: t.previewDevice,
                                            checkedValue: 'desktop',
                                            uncheckedValue: 'mobile',
                                        })}
                                    </div>
                                </div>
                            ` : ''}
                        </div>
                    ` : (path ? `
                        ${authPath
                            ? `<button type="button" id="readonly-edit-btn" class="toolbar-icon-button" title="${t.backToEdit}" aria-label="${t.backToEdit}">${SVG_ICONS.editLock}<span class="toolbar-button-label">${lang === 'zh-TW' ? '編輯' : 'Edit'}</span></button>`
                            : `<a href="/${path}" class="toolbar-icon-button" title="${t.backToEdit}" aria-label="${t.backToEdit}">${SVG_ICONS.editLock}<span class="toolbar-button-label">${lang === 'zh-TW' ? '編輯' : 'Edit'}</span></a>`
                        }
                        <button type="button" id="export-md-btn" class="toolbar-icon-button" title="${t.exportMarkdown}" aria-label="${t.exportMarkdown}">
                            ${SVG_ICONS.export}
                            <span class="toolbar-button-label">${lang === 'zh-TW' ? '匯出' : 'Export'}</span>
                        </button>
                        <button type="button" id="copy-md-btn" class="toolbar-icon-button copy-md-button" title="${lang === 'zh-TW' ? '複製內容' : 'Copy content'}" aria-label="${lang === 'zh-TW' ? '複製內容' : 'Copy content'}">
                            <span class="copy-button-icon copy-button-icon-default">${SVG_ICONS.copy}</span>
                            <span class="copy-button-icon copy-button-icon-success" aria-hidden="true">${SVG_ICONS.check}</span>
                            <span class="toolbar-button-label">${lang === 'zh-TW' ? '複製' : 'Copy'}</span>
                        </button>
                        ${sharePath && shareId ? `
                        <button type="button" id="copy-embed-code-btn" class="toolbar-icon-button" title="${lang === 'zh-TW' ? '嵌入分享頁' : 'Embed share page'}" aria-label="${lang === 'zh-TW' ? '嵌入分享頁' : 'Embed share page'}">
                            ${SVG_ICONS.link}
                            <span class="toolbar-button-label">${lang === 'zh-TW' ? '嵌入' : 'Embed'}</span>
                        </button>
                        ` : ''}
                        <button type="button" id="export-pdf-btn" class="toolbar-icon-button" title="${t.exportPdf}" aria-label="${t.exportPdf}">
                            ${SVG_ICONS.pdf}
                            <span class="toolbar-button-label">${lang === 'zh-TW' ? '列印' : 'Print'}</span>
                        </button>
                    ` : '')}
                    <button type="button" class="toolbar-icon-button mobile-more-btn" id="mobile-more-btn" title="${moreToolsTitle}" aria-label="${moreToolsTitle}">
                        ${SVG_ICONS.more}
                        <span class="toolbar-button-label">${lang === 'zh-TW' ? '更多' : 'More'}</span>
                    </button>
                </div>
            </div>

            <div class="footer-section footer-section-appearance">
                <div class="footer-section-body">
                    ${(sharePath || isEdit) ? `
                        <div class="footer-control-group footer-toggle-control-group">
                            <div id="share-font-selector" class="share-font-toggle" role="group" aria-label="${shareFontAriaLabel}">
                                ${RAIL_SWITCH({
                                    className: 'share-font-switch',
                                    checked: true,
                                    checkedTitle: 'Font',
                                    uncheckedTitle: 'Font',
                                    checkedText: 'JB',
                                    uncheckedText: 'Maple',
                                    ariaLabel: shareFontAriaLabel,
                                    checkedValue: 'jetbrains',
                                    uncheckedValue: 'maple',
                                })}
                            </div>
                        </div>
                    ` : ''}
                    <div class="footer-control-group footer-toggle-control-group">
                        <div id="language-selector">
                            ${RAIL_SWITCH({
                                checked: lang === 'zh-TW',
                                checkedTitle: 'Lang',
                                uncheckedTitle: 'Lang',
                                checkedText: '中',
                                uncheckedText: 'En',
                                ariaLabel: t.language,
                                checkedValue: 'zh-TW',
                                uncheckedValue: 'en-US',
                            })}
                        </div>
                    </div>
                    ${!isEdit || mode === 'md' ? `
                        <div class="footer-control-group">
                            <wa-select id="preview-width-selector" class="footer-select" size="s" appearance="outlined" placement="top" aria-label="${t.width}">
                                <wa-option value="100%">${t.width}: ${t.full}</wa-option>
                                <wa-option value="960px">${t.width}: 960</wa-option>
                                <wa-option value="1200px">${t.width}: 1200</wa-option>
                                <wa-option value="1440px">${t.width}: 1440</wa-option>
                            </wa-select>
                        </div>
                        <div class="footer-control-group">
                            <wa-select id="theme-selector" class="footer-select" size="s" appearance="outlined" placement="top" aria-label="${lang === 'zh-TW' ? '主題' : 'Theme'}" value="${theme || 'catppuccin-macchiato'}">
                                ${Object.keys(THEMES).map(themeName => `<wa-option value="${themeName}" ${themeName === (theme || 'catppuccin-macchiato') ? 'selected' : ''}>${getThemeLabel(themeName)}</wa-option>`).join('')}
                            </wa-select>
                        </div>
                    ` : ''}
                    ${sharePath ? '<div id="share-analytics-hook"></div>' : ''}
                </div>
            </div>

            <div class="footer-section footer-section-info">
                <div class="footer-section-body">
                    <a class="toolbar-icon-link" title="Github" target="_blank" href="https://github.com/tbdavid2019/cf-notepad" rel="noreferrer">
                        <svg viewBox="64 64 896 896" focusable="false" data-icon="github" width="1.25em" height="1.25em" fill="currentColor" aria-hidden="true"><path d="M511.6 76.3C264.3 76.2 64 276.4 64 523.5 64 718.9 189.3 885 363.8 946c23.5 5.9 19.9-10.8 19.9-22.2v-77.5c-135.7 15.9-141.2-73.9-150.3-88.9C215 726 171.5 718 184.5 703c30.9-15.9 62.4 4 98.9 57.9 26.4 39.1 77.9 32.5 104 26 5.7-23.5 17.9-44.5 34.7-60.8-140.6-25.2-199.2-111-199.2-213 0-49.5 16.3-95 48.3-131.7-20.4-60.5 1.9-112.3 4.9-120 58.1-5.2 118.5 41.6 123.2 45.3 33-8.9 70.7-13.6 112.9-13.6 42.4 0 80.2 4.9 113.5 13.9 11.3-8.6 67.3-48.8 121.3-43.9 2.9 7.7 24.7 58.3 5.5 118 32.4 36.8 48.9 82.7 48.9 132.3 0 102.2-59 188.1-200 212.9a127.5 127.5 0 0138.1 91v112.5c.8 9 0 17.9 15 17.9 177.1-59.7 304.6-227 304.6-424.1 0-247.2-200.4-447.3-447.3z"></path></svg>
                        <span class="toolbar-button-label">GitHub</span>
                    </a>
                    <a class="toolbar-icon-link" title="${t.skillTitle}" aria-label="${t.skillTitle}" target="_blank" href="/.well-known/agent-skills/david888-wiki-publisher/SKILL.md" rel="noreferrer">
                        ${SVG_ICONS.sparkles}
                        <span class="toolbar-button-label">Skill</span>
                    </a>
                    <a class="toolbar-icon-link" title="${t.apiDocTitle}" aria-label="${t.apiDocTitle}" target="_blank" href="/docs/api" rel="noreferrer">
                        ${SVG_ICONS.apiDocs}
                        <span class="toolbar-button-label">API</span>
                    </a>
                </div>
            </div>
        </div>
    </div>

    <!-- 行動版 Bottom Sheet -->
    <div class="bottom-sheet" id="mobile-bottom-sheet">
        <div class="bottom-sheet-backdrop"></div>
        <div class="bottom-sheet-content">
            <div class="bottom-sheet-drag-handle"></div>
            <div class="bottom-sheet-header">
                <h3>${lang === 'zh-TW' ? '設定與工具' : 'Settings & Tools'}</h3>
                <button type="button" class="bottom-sheet-close-btn" aria-label="Close">
                    ${SVG_ICONS.close}
                </button>
            </div>
            <div class="bottom-sheet-body">
                <div class="bottom-sheet-section bottom-sheet-section-publish">
                    <h4 class="bottom-sheet-section-title">${lang === 'zh-TW' ? '發佈' : 'Publish'}</h4>
                    <div class="bottom-sheet-section-content"></div>
                </div>
                <div class="bottom-sheet-section bottom-sheet-section-appearance">
                    <h4 class="bottom-sheet-section-title">${lang === 'zh-TW' ? '外觀' : 'Appearance'}</h4>
                    <div class="bottom-sheet-section-content"></div>
                </div>
                <div class="bottom-sheet-section bottom-sheet-section-info">
                    <h4 class="bottom-sheet-section-title">${lang === 'zh-TW' ? '資訊' : 'Info'}</h4>
                    <div class="bottom-sheet-section-content"></div>
                </div>
            </div>
        </div>
    </div>
    
    <!-- Toast 通知容器 -->
    <div id="toast-container"></div>
`
}

export const MODAL = (lang, { noteHistoryEnabled = false } = {}) => {
    const t = getLangText(lang)
    const showNoteHistory = noteHistoryEnabled === true
    return `
<div class="modal share-modal">
    <div class="modal-mask"></div>
    <div class="modal-content">
        <span class="close-btn">x</span>
        <div class="modal-body">
            <input type="text" readonly value="" />
            <button class="opt-button share-modal-copy-btn">${t.copy}</button>
            <div class="share-index-prompt">
                <strong>${t.publicIndexPromptTitle}</strong>
                <p>${t.publicIndexPromptText}</p>
                <div class="share-index-actions">
                    <button type="button" class="opt-button opt-button-accent share-index-approve">${t.publicIndexPromptApprove}</button>
                    <button type="button" class="opt-button share-index-decline">${t.publicIndexPromptDecline}</button>
                </div>
            </div>
        </div>
</div>
</div>
<div class="modal share-history-modal" role="dialog" aria-modal="true" aria-labelledby="share-history-title">
    <div class="modal-mask"></div>
    <div class="share-history-content">
        <button type="button" class="close-btn share-history-close" aria-label="${t.later}">x</button>
        <h2 id="share-history-title">${lang === 'zh-TW' ? '最近分享紀錄' : 'Recent Share Links'}</h2>
        <div class="share-history-tabs" role="tablist">
            <button type="button" class="share-history-tab active" data-share-history-tab="created" aria-selected="true">${lang === 'zh-TW' ? '我分享的' : 'Created'}</button>
            <button type="button" class="share-history-tab" data-share-history-tab="viewed" aria-selected="false">${lang === 'zh-TW' ? '我看過的' : 'Viewed'}</button>
        </div>
        <div class="share-history-list" data-share-history-list></div>
</div>
</div>
<div class="modal embed-modal" role="dialog" aria-modal="true" aria-labelledby="embed-modal-title">
    <div class="modal-mask"></div>
    <div class="embed-modal-content">
        <button type="button" class="close-btn embed-modal-close" aria-label="${t.later}">x</button>
        <h2 id="embed-modal-title">${lang === 'zh-TW' ? '嵌入分享頁' : 'Embed share page'}</h2>
        <p>${lang === 'zh-TW' ? '將以下 iframe 程式碼貼到你的網站即可嵌入此分享頁。' : 'Copy this iframe code into your website to embed this shared page.'}</p>
        <textarea class="embed-modal-code" readonly spellcheck="false" aria-label="${lang === 'zh-TW' ? '嵌入程式碼' : 'Embed code'}"></textarea>
        <button type="button" class="opt-button opt-button-accent embed-modal-copy-btn">${t.copy}</button>
    </div>
</div>
<div class="modal password-modal" role="dialog" aria-modal="true" aria-labelledby="password-modal-title">
    <div class="modal-mask"></div>
    <div class="password-modal-content">
        <button type="button" class="close-btn password-modal-close" aria-label="${t.passwordCancel}">x</button>
        <h2 id="password-modal-title"></h2>
        <p class="password-modal-message"></p>
        <input type="password" class="password-modal-input" autocomplete="current-password" />
        <div class="password-modal-actions">
            <button type="button" class="opt-button password-modal-cancel">${t.passwordCancel}</button>
            <button type="button" class="opt-button opt-button-accent password-modal-confirm">${t.passwordConfirm}</button>
        </div>
    </div>
</div>
<div class="modal app-dialog-modal" role="alertdialog" aria-modal="true" aria-labelledby="app-dialog-title" aria-describedby="app-dialog-message">
    <div class="modal-mask"></div>
    <div class="app-dialog-content" data-dialog-kind="info">
        <div class="app-dialog-icon" aria-hidden="true">i</div>
        <div class="app-dialog-copy">
            <h2 id="app-dialog-title"></h2>
            <p id="app-dialog-message"></p>
        </div>
        <div class="app-dialog-actions">
            <button type="button" class="opt-button app-dialog-cancel">${t.passwordCancel}</button>
            <button type="button" class="opt-button opt-button-accent app-dialog-confirm">${t.passwordConfirm}</button>
        </div>
    </div>
</div>
${showNoteHistory ? `
<div class="modal note-history-modal" role="dialog" aria-modal="true" aria-labelledby="note-history-title">
    <div class="modal-mask"></div>
    <div class="note-history-content">
        <button type="button" class="close-btn note-history-close" aria-label="${t.later}">x</button>
        <h2 id="note-history-title">${t.history}</h2>
        <div class="note-history-toolbar">
            <div class="segmented-toggle note-history-render-toggle" role="group" aria-label="${t.history}">
                <button type="button" class="segmented-toggle-btn active" data-note-history-render-mode="preview" aria-pressed="true">${t.historyPreview}</button>
                <button type="button" class="segmented-toggle-btn" data-note-history-render-mode="raw" aria-pressed="false">${t.historyRaw}</button>
            </div>
            <button type="button" class="share-history-copy" data-note-history-refresh>${t.historyRefresh}</button>
            <button type="button" class="share-history-copy" data-note-history-copy disabled>${t.historyCopyContent}</button>
            <button type="button" class="opt-button" data-note-history-restore disabled>${t.historyRestore}</button>
        </div>
        <div class="note-history-layout">
            <div class="note-history-list" data-note-history-list></div>
            <section class="note-history-viewer">
                <header class="note-history-viewer-header">
                    <strong data-note-history-title>${t.historyNoSelection}</strong>
                    <span data-note-history-meta></span>
                </header>
                <div class="note-history-body" data-note-history-body>${t.historyNoSelection}</div>
            </section>
        </div>
    </div>
</div>
` : ''}
`
}

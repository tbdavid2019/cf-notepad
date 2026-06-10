/**
 * src/templates/common.js
 * Shared template components: SWITCHER, FOOTER, MODAL
 */
import dayjs from 'dayjs'
import { SUPPORTED_LANG } from '../constant'
import { THEMES } from '../theme_data'

const getLangText = lang => SUPPORTED_LANG[lang] || SUPPORTED_LANG['en-US']
const getCompactRelativeTime = (unixTime, lang) => {
    const savedAt = Number(unixTime || 0)
    const diffSeconds = Math.max(0, dayjs().unix() - savedAt)
    const isZh = lang === 'zh-TW'

    if (diffSeconds < 60) return isZh ? '剛剛' : 'now'

    const minutes = Math.floor(diffSeconds / 60)
    if (minutes < 60) return isZh ? `${minutes}m前` : `${minutes}m ago`

    const hours = Math.floor(minutes / 60)
    if (hours < 24) return isZh ? `${hours}h前` : `${hours}h ago`

    const days = Math.floor(hours / 24)
    if (days < 30) return isZh ? `${days}d前` : `${days}d ago`

    return dayjs.unix(savedAt).format('M/D')
}

export const SWITCHER = (text, open, className = '') => `
<span class="opt-desc">${text}</span>
<label class="opt-switcher ${className}">
  <input type="checkbox" ${open ? 'checked' : ''}>
  <span class="slider round"></span>
</label>
`

export const FOOTER = ({ lang, isEdit, updateAt, pw, vpw, mode, share, shareId, path, theme, sharePath }) => {
    const t = getLangText(lang)
    const sectionActions = lang === 'zh-TW' ? '操作' : 'Actions'
    const sectionAppearance = lang === 'zh-TW' ? '外觀' : 'Appearance'
    const sectionMeta = lang === 'zh-TW' ? '資訊' : 'Meta'
    const shareFontAriaLabel = lang === 'zh-TW' ? '分享頁字型' : 'Share font'
    const jetbrainsTitle = lang === 'zh-TW' ? '切換為 JetBrains Mono' : 'Switch to JetBrains Mono'
    const mapleTitle = lang === 'zh-TW' ? '切換為 Maple Mono' : 'Switch to Maple Mono'
    return `
    <div class="footer">
        <div class="footer-sections">
            <div class="footer-section footer-section-actions">
                <span class="footer-section-label">${sectionActions}</span>
                <div class="footer-section-body">
                    ${isEdit ? `
                        <button class="opt-button opt-pw" data-type="edit">${pw ? t.changePW : t.setPW}</button>
                        <button class="opt-button opt-pw-view" data-type="view">${vpw ? t.changeViewPW : t.setViewPW}</button>
                        ${SWITCHER(t.preview, mode === 'md', 'opt-mode')}
                        ${share && shareId ? `
                            <div class="opt-share-link" style="display:flex;align-items:center;gap:5px;background:#e8f5e9;padding:2px 8px;border-radius:4px;border:1px solid #4caf50;">
                                <span style="font-size:12px;color:#2e7d32;font-weight:500;">✓ ${t.published}</span>
                                <input class="share-url-input" readonly value="/share/${shareId}" onclick="this.select()" style="border:none;background:transparent;width:200px;font-size:12px;color:#1976d2;font-weight:500;">
                                <button id="copy-share-btn" style="border:none;background:none;cursor:pointer;opacity:0.8;padding:2px 6px;font-size:16px;" title="Copy">📋</button>
                                <button id="copy-present-share-btn" style="border:none;background:none;cursor:pointer;opacity:0.8;padding:2px 6px;font-size:16px;" title="Copy presentation link">📽️</button>
                                <button class="unpublish-btn" style="border:none;background:#ff5722;color:white;cursor:pointer;padding:2px 8px;border-radius:3px;font-size:11px;margin-left:4px;" title="取消發布">✕</button>
                            </div>
                        ` : SWITCHER(t.share, share, 'opt-share')}
                        ${mode === 'md' ? `<button id="present-btn" class="opt-button" style="background:#673ab7;color:white;padding:4px 10px;border-radius:4px;font-weight:500;display:flex;align-items:center;gap:4px;" title="${t.presentTitle}">📽️ ${t.present}</button>` : ''}
                    ` : (path ? `
                        <a href="/${path}" class="opt-button" style="text-decoration:none;background:#2196f3;color:white;padding:6px 12px;border-radius:4px;font-weight:500;" title="${t.backToEdit}" aria-label="${t.backToEdit}">✎</a>
                        <button id="present-btn" class="opt-button" style="background:#673ab7;color:white;padding:4px 10px;border-radius:4px;font-weight:500;display:flex;align-items:center;gap:4px;" title="${t.presentTitle}">📽️ ${t.present}</button>
                    ` : '')}
                </div>
            </div>

            <div class="footer-section footer-section-appearance">
                <span class="footer-section-label">${sectionAppearance}</span>
                <div class="footer-section-body">
                    ${sharePath ? `
                        <div id="share-font-selector" class="segmented-toggle share-font-toggle" role="group" aria-label="${shareFontAriaLabel}" title="${shareFontAriaLabel}">
                            <button type="button" class="segmented-toggle-btn active" data-share-font="jetbrains" aria-pressed="true" title="${jetbrainsTitle}" aria-label="${jetbrainsTitle}">J</button>
                            <button type="button" class="segmented-toggle-btn" data-share-font="maple" aria-pressed="false" title="${mapleTitle}" aria-label="${mapleTitle}">M</button>
                        </div>
                    ` : ''}
                    <div id="language-selector" class="segmented-toggle" role="group" aria-label="${t.language}">
                        <button type="button" class="segmented-toggle-btn ${lang === 'zh-TW' ? 'active' : ''}" data-lang="zh-TW" aria-pressed="${lang === 'zh-TW' ? 'true' : 'false'}">Zh</button>
                        <button type="button" class="segmented-toggle-btn ${lang === 'en-US' ? 'active' : ''}" data-lang="en-US" aria-pressed="${lang === 'en-US' ? 'true' : 'false'}">En</button>
                    </div>
                    ${isEdit && mode === 'md' ? `
                        <div id="preview-device-selector" class="segmented-toggle preview-device-toggle" role="group" aria-label="${t.previewDevice}">
                            <button type="button" class="segmented-toggle-btn active" data-preview-device="desktop" aria-pressed="true">${t.desktop}</button>
                            <button type="button" class="segmented-toggle-btn" data-preview-device="mobile" aria-pressed="false">${t.mobile}</button>
                        </div>
                    ` : ''}
                    ${!isEdit || mode === 'md' ? `
                        <label class="footer-label" for="preview-width-selector">${t.width}</label>
                        <select id="preview-width-selector" class="footer-select">
                            <option value="100%">${t.full}</option>
                            <option value="960px">960</option>
                            <option value="1200px">1200</option>
                            <option value="1440px">1440</option>
                        </select>
                        <select id="theme-selector" class="footer-select">
                            ${Object.keys(THEMES).map(themeName => `<option value="${themeName}" ${themeName === (theme || 'catppuccin-macchiato') ? 'selected' : ''}>${themeName}</option>`).join('')}
                        </select>
                    ` : ''}
                    ${sharePath ? '<div id="share-analytics-hook"></div>' : ''}
                </div>
            </div>

            <div class="footer-section footer-section-meta">
                <span class="footer-section-label">${sectionMeta}</span>
                <div class="footer-section-body">
                    <a class="github-link" title="Github" target="_blank" href="https://github.com/tbdavid2019/cf-notepad" rel="noreferrer">
                    <svg viewBox="64 64 896 896" focusable="false" data-icon="github" width="1em" height="1em" fill="currentColor" aria-hidden="true"><path d="M511.6 76.3C264.3 76.2 64 276.4 64 523.5 64 718.9 189.3 885 363.8 946c23.5 5.9 19.9-10.8 19.9-22.2v-77.5c-135.7 15.9-141.2-73.9-150.3-88.9C215 726 171.5 718 184.5 703c30.9-15.9 62.4 4 98.9 57.9 26.4 39.1 77.9 32.5 104 26 5.7-23.5 17.9-44.5 34.7-60.8-140.6-25.2-199.2-111-199.2-213 0-49.5 16.3-95 48.3-131.7-20.4-60.5 1.9-112.3 4.9-120 58.1-5.2 118.5 41.6 123.2 45.3 33-8.9 70.7-13.6 112.9-13.6 42.4 0 80.2 4.9 113.5 13.9 11.3-8.6 67.3-48.8 121.3-43.9 2.9 7.7 24.7 58.3 5.5 118 32.4 36.8 48.9 82.7 48.9 132.3 0 102.2-59 188.1-200 212.9a127.5 127.5 0 0138.1 91v112.5c.8 9 0 17.9 15 17.9 177.1-59.7 304.6-227 304.6-424.1 0-247.2-200.4-447.3-447.3z"></path></svg>
                    </a>
                    <a class="skill-link" title="AI Skill Doc" target="_blank" href="https://github.com/tbdavid2019/cf-notepad/blob/main/skills/SKILL.md" style="text-decoration:none;font-size:18px;display:flex;align-items:center;" rel="noreferrer">
                    <span style="font-size:14px;margin-right:4px;">🤖 ${t.skill}</span>
                    </a>
                    ${updateAt ? `<span class="last-modified">${t.lastModified} ${getCompactRelativeTime(updateAt, lang)}</span>` : ''}
                </div>
            </div>
        </div>
    </div>
`
}

export const MODAL = lang => {
    const t = getLangText(lang)
    return `
<div class="modal share-modal">
    <div class="modal-mask"></div>
    <div class="modal-content">
        <span class="close-btn">x</span>
        <div class="modal-body">
            <input type="text" readonly value="" />
            <button class="opt-button">${t.copy}</button>
        </div>
    </div>
</div>
`
}

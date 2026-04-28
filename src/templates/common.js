/**
 * src/templates/common.js
 * Shared template components: SWITCHER, FOOTER, MODAL
 */
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import { SUPPORTED_LANG } from '../constant'
import { THEMES } from '../theme_data'

dayjs.extend(relativeTime)

export const SWITCHER = (text, open, className = '') => `
<span class="opt-desc">${text}</span>
<label class="opt-switcher ${className}">
  <input type="checkbox" ${open ? 'checked' : ''}>
  <span class="slider round"></span>
</label>
`

export const FOOTER = ({ lang, isEdit, updateAt, pw, vpw, mode, share, shareId, path, views, theme }) => `
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
        <div style="flex:1"></div>
        <button id="present-btn" class="opt-button" style="background:#673ab7;color:white;margin-right:10px;padding:4px 10px;border-radius:4px;font-weight:500;display:flex;align-items:center;gap:4px;" title="進入全螢幕簡報模式">📽️ Present</button>
        <select id="theme-selector" style="margin-right:10px;padding:4px;border-radius:4px;border:1px solid #e1e4e8;font-size:12px;background:#fff;">
            ${Object.keys(THEMES).map(t => `<option value="${t}" ${t === (theme || 'github-light') ? 'selected' : ''}>${t}</option>`).join('')}
        </select>
        <a class="github-link" title="Github" target="_blank" href="https://github.com/tbdavid2019/cf-notepad" rel="noreferrer">
            <svg viewBox="64 64 896 896" focusable="false" data-icon="github" width="1em" height="1em" fill="currentColor" aria-hidden="true"><path d="M511.6 76.3C264.3 76.2 64 276.4 64 523.5 64 718.9 189.3 885 363.8 946c23.5 5.9 19.9-10.8 19.9-22.2v-77.5c-135.7 15.9-141.2-73.9-150.3-88.9C215 726 171.5 718 184.5 703c30.9-15.9 62.4 4 98.9 57.9 26.4 39.1 77.9 32.5 104 26 5.7-23.5 17.9-44.5 34.7-60.8-140.6-25.2-199.2-111-199.2-213 0-49.5 16.3-95 48.3-131.7-20.4-60.5 1.9-112.3 4.9-120 58.1-5.2 118.5 41.6 123.2 45.3 33-8.9 70.7-13.6 112.9-13.6 42.4 0 80.2 4.9 113.5 13.9 11.3-8.6 67.3-48.8 121.3-43.9 2.9 7.7 24.7 58.3 5.5 118 32.4 36.8 48.9 82.7 48.9 132.3 0 102.2-59 188.1-200 212.9a127.5 127.5 0 0138.1 91v112.5c.8 9 0 17.9 15 17.9 177.1-59.7 304.6-227 304.6-424.1 0-247.2-200.4-447.3-447.3z"></path></svg>
        </a>
        <a class="skill-link" title="AI Skill Doc" target="_blank" href="https://github.com/tbdavid2019/cf-notepad/blob/main/skills/SKILL.md" style="margin-left:10px;text-decoration:none;font-size:18px;display:flex;align-items:center;" rel="noreferrer">
            <span style="font-size:14px;margin-right:4px;">🤖 Skill</span>
        </a>
        ${views ? `<span class="views-count" style="margin-left:10px;">👁 ${views} views</span>` : ''}
        ${updateAt ? `<span class="last-modified">${SUPPORTED_LANG[lang].lastModified} ${dayjs.unix(updateAt).fromNow()}</span>` : ''}
    </div>
`

export const MODAL = lang => `
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

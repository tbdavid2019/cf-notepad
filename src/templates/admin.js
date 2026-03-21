/**
 * src/templates/admin.js
 * Admin page template with separate CSS and JS references
 * Supports: notes table with sorting, batch delete, delete empty pages, login form
 */
import dayjs from 'dayjs'
import { CDN_PREFIX } from '../constant'
import { getAdminCss } from '../styles/admin.css.js'
import { getAdminScript } from '../scripts/admin.js'

export const Admin = ({ lang, notes, error }) => `
    <!DOCTYPE html>
        <html>
            <head>
                <meta charset="utf-8" />
                <meta name="viewport" content="width=device-width, initial-scale=1.0" />
                <title>Admin — Cloud Notepad</title>
                <link href="${CDN_PREFIX}/favicon.ico" rel="shortcut icon" type="image/ico" />
                <style>
${getAdminCss()}
                </style>
            </head>
            <body>
                <div class="admin-container">
                    <h1>Cloud Notepad Admin</h1>
                    ${error ? `<div class="error">${error}</div>` : ''}
                    ${notes ? `
    <div class="admin-actions">
        <button id="batch-delete-btn" disabled class="btn btn-danger" style="opacity:0.5;">
            🗑 刪除選中項
        </button>
        <button id="delete-empty-btn" class="btn btn-warning">
            🧹 刪除所有空白頁面
        </button>
        <span id="selected-count" class="selection-count"></span>
    </div>
    <table id="notesTable">
        <thead>
            <tr>
                <th style="width: 40px; cursor: default;">
                    <input type="checkbox" id="select-all" style="cursor: pointer;">
                </th>
                <th class="sortable" data-col="1">Title / URL</th>
                <th class="sortable" data-col="2">Views</th>
                <th class="sortable" data-col="3">Password</th>
                <th class="sortable" data-col="4">Last Modified</th>
                <th style="cursor: default;">Action</th>
            </tr>
        </thead>
        <tbody>
            ${notes.map(n => `
            <tr>
                <td>
                    <input type="checkbox" class="note-checkbox" value="${n.name}" style="cursor: pointer;">
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
                <td data-val="${n.metadata?.updateAt || 0}">${n.metadata?.updateAt ? dayjs.unix(n.metadata.updateAt).format('YYYY-MM-DD HH:mm:ss') : '-'}</td>
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
${getAdminScript()}
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

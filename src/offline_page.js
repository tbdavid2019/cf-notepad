import { APP_NAME } from './constant.js'

export const createOfflinePageResponse = () => {
    const appName = APP_NAME || 'david888 wiki'
    const html = `<!doctype html>
<html lang="zh-Hant-TW">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
    <meta name="theme-color" content="#0f172a">
    <link rel="manifest" href="/app.webmanifest">
    <link rel="icon" href="/notepad-icon-192.png">
    <title>離線工作區 · ${appName}</title>
    <style>
        :root {
            color-scheme: light dark;
            --bg-color: #0f172a;
            --surface-bg: #1e293b;
            --card-bg: #1e293b;
            --sidebar-bg: #0f172a;
            --text-color: #f8fafc;
            --text-muted: #94a3b8;
            --border-color: #334155;
            --primary-color: #3b82f6;
            --primary-hover: #60a5fa;
            --accent-bg: rgba(59, 130, 246, 0.15);
            --danger-color: #ef4444;
            --success-color: #10b981;
            --warning-color: #f59e0b;
            --editor-bg: #0b1120;
            --preview-bg: #0f172a;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
        }

        body.theme-light {
            color-scheme: light;
            --bg-color: #f8fafc;
            --surface-bg: #ffffff;
            --card-bg: #ffffff;
            --sidebar-bg: #f1f5f9;
            --text-color: #0f172a;
            --text-muted: #64748b;
            --border-color: #e2e8f0;
            --primary-color: #2563eb;
            --primary-hover: #1d4ed8;
            --accent-bg: #eff6ff;
            --editor-bg: #ffffff;
            --preview-bg: #f8fafc;
        }

        body.theme-tokyo-night {
            color-scheme: dark;
            --bg-color: #1a1b26;
            --surface-bg: #24283b;
            --card-bg: #24283b;
            --sidebar-bg: #16161e;
            --text-color: #c0caf5;
            --text-muted: #7aa2f7;
            --border-color: #414868;
            --primary-color: #7aa2f7;
            --primary-hover: #bb9af7;
            --accent-bg: rgba(122, 162, 247, 0.2);
            --editor-bg: #1f2335;
            --preview-bg: #1a1b26;
        }

        body.theme-dracula {
            color-scheme: dark;
            --bg-color: #282a36;
            --surface-bg: #44475a;
            --card-bg: #44475a;
            --sidebar-bg: #21222c;
            --text-color: #f8f8f2;
            --text-muted: #6272a4;
            --border-color: #6272a4;
            --primary-color: #bd93f9;
            --primary-hover: #ff79c6;
            --accent-bg: rgba(189, 147, 249, 0.2);
            --editor-bg: #282a36;
            --preview-bg: #21222c;
        }

        body.theme-nord {
            color-scheme: dark;
            --bg-color: #2e3440;
            --surface-bg: #3b4252;
            --card-bg: #3b4252;
            --sidebar-bg: #242933;
            --text-color: #eceff4;
            --text-muted: #d8dee9;
            --border-color: #4c566a;
            --primary-color: #88c0d0;
            --primary-hover: #81a1c1;
            --accent-bg: rgba(136, 192, 208, 0.2);
            --editor-bg: #2e3440;
            --preview-bg: #242933;
        }

        * { box-sizing: border-box; margin: 0; padding: 0; }
        body {
            background: var(--bg-color);
            color: var(--text-color);
            min-height: 100vh;
            display: flex;
            flex-direction: column;
            overflow: hidden;
        }

        header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 10px 16px;
            background: var(--surface-bg);
            border-bottom: 1px solid var(--border-color);
            gap: 12px;
            flex-wrap: wrap;
            z-index: 10;
        }

        .header-left {
            display: flex;
            align-items: center;
            gap: 10px;
        }

        .header-title {
            display: flex;
            align-items: center;
            gap: 8px;
            font-weight: 700;
            font-size: 15px;
        }

        .offline-badge {
            display: inline-flex;
            align-items: center;
            gap: 4px;
            background: rgba(245, 158, 11, 0.2);
            color: var(--warning-color);
            padding: 3px 8px;
            border-radius: 999px;
            font-size: 11px;
            font-weight: 600;
            border: 1px solid rgba(245, 158, 11, 0.3);
            transition: all 0.3s ease;
        }
        .offline-badge.online {
            background: rgba(16, 185, 129, 0.2);
            color: var(--success-color);
            border-color: rgba(16, 185, 129, 0.3);
        }

        .header-controls {
            display: flex;
            align-items: center;
            gap: 6px;
            flex-wrap: wrap;
        }

        .btn-group {
            display: inline-flex;
            border: 1px solid var(--border-color);
            border-radius: 6px;
            overflow: hidden;
            background: var(--card-bg);
        }

        .btn-group .btn {
            border: none;
            border-radius: 0;
            border-right: 1px solid var(--border-color);
        }
        .btn-group .btn:last-child {
            border-right: none;
        }

        .btn {
            display: inline-flex;
            align-items: center;
            gap: 5px;
            padding: 5px 11px;
            border-radius: 6px;
            font-size: 12.5px;
            font-weight: 500;
            cursor: pointer;
            border: 1px solid var(--border-color);
            background: var(--card-bg);
            color: var(--text-color);
            transition: all 0.15s ease;
            white-space: nowrap;
        }
        .btn:hover {
            border-color: var(--primary-color);
            color: var(--primary-color);
        }
        .btn.active {
            background: var(--primary-color);
            color: #ffffff;
            border-color: var(--primary-color);
        }
        .btn-primary {
            background: var(--primary-color);
            border-color: var(--primary-color);
            color: #ffffff;
        }
        .btn-primary:hover {
            background: var(--primary-hover);
            color: #ffffff;
        }
        .btn-sm {
            padding: 3px 8px;
            font-size: 11px;
        }
        .btn-danger {
            color: var(--danger-color);
        }
        .btn-danger:hover {
            background: rgba(239, 68, 68, 0.15);
            border-color: var(--danger-color);
        }

        select.theme-select {
            padding: 4px 8px;
            border-radius: 6px;
            border: 1px solid var(--border-color);
            background: var(--card-bg);
            color: var(--text-color);
            font-size: 12px;
            outline: none;
            cursor: pointer;
        }

        main {
            display: flex;
            flex: 1;
            overflow: hidden;
        }

        .sidebar {
            width: 290px;
            min-width: 240px;
            border-right: 1px solid var(--border-color);
            background: var(--sidebar-bg);
            display: flex;
            flex-direction: column;
            overflow: hidden;
            transition: transform 0.2s ease;
        }

        .sidebar-search {
            padding: 10px;
            border-bottom: 1px solid var(--border-color);
        }
        .search-input {
            width: 100%;
            padding: 6px 10px;
            border-radius: 6px;
            border: 1px solid var(--border-color);
            background: var(--card-bg);
            color: var(--text-color);
            font-size: 12.5px;
            outline: none;
        }
        .search-input:focus {
            border-color: var(--primary-color);
        }

        .sidebar-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 8px 12px;
            font-size: 11px;
            font-weight: 700;
            color: var(--text-muted);
            text-transform: uppercase;
            letter-spacing: 0.5px;
            border-bottom: 1px solid var(--border-color);
        }

        .note-list {
            list-style: none;
            flex: 1;
            overflow-y: auto;
        }

        .note-item {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 10px 12px;
            border-bottom: 1px solid var(--border-color);
            cursor: pointer;
            transition: background 0.12s;
            position: relative;
        }
        .note-item:hover, .note-item.active {
            background: var(--accent-bg);
        }
        .note-item.active {
            border-left: 3px solid var(--primary-color);
        }

        .note-item-info {
            flex: 1;
            min-width: 0;
        }

        .note-item-title {
            font-size: 13.5px;
            font-weight: 600;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            margin-bottom: 2px;
        }

        .note-item-meta {
            font-size: 11px;
            color: var(--text-muted);
            display: flex;
            align-items: center;
            gap: 6px;
        }

        .note-badge {
            font-size: 10px;
            padding: 1px 5px;
            border-radius: 4px;
            font-weight: 500;
        }
        .note-badge.pending {
            background: rgba(245, 158, 11, 0.2);
            color: var(--warning-color);
        }
        .note-badge.synced {
            background: rgba(16, 185, 129, 0.2);
            color: var(--success-color);
        }
        .note-badge.draft {
            background: rgba(148, 163, 184, 0.2);
            color: var(--text-muted);
        }

        .note-item-delete {
            opacity: 0;
            background: none;
            border: none;
            color: var(--danger-color);
            cursor: pointer;
            padding: 4px;
            border-radius: 4px;
            transition: opacity 0.15s;
            font-size: 13px;
        }
        .note-item:hover .note-item-delete {
            opacity: 0.8;
        }
        .note-item-delete:hover {
            opacity: 1 !important;
            background: rgba(239, 68, 68, 0.15);
        }

        .sidebar-footer {
            padding: 10px;
            border-top: 1px solid var(--border-color);
            display: flex;
            gap: 6px;
            background: var(--surface-bg);
        }

        .workspace-area {
            flex: 1;
            display: flex;
            flex-direction: column;
            overflow: hidden;
            background: var(--bg-color);
        }

        .editor-topbar {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 8px 14px;
            background: var(--surface-bg);
            border-bottom: 1px solid var(--border-color);
            gap: 10px;
        }

        .editor-title {
            flex: 1;
            font-size: 16px;
            font-weight: 600;
            padding: 6px 10px;
            background: var(--card-bg);
            border: 1px solid var(--border-color);
            border-radius: 6px;
            color: var(--text-color);
            outline: none;
        }
        .editor-title:focus {
            border-color: var(--primary-color);
        }

        .note-path-tag {
            font-size: 11px;
            color: var(--text-muted);
            font-family: monospace;
            background: var(--card-bg);
            padding: 4px 8px;
            border-radius: 4px;
            border: 1px solid var(--border-color);
        }

        .content-split-container {
            flex: 1;
            display: flex;
            overflow: hidden;
        }

        .pane {
            flex: 1;
            display: flex;
            flex-direction: column;
            overflow: hidden;
        }

        .editor-textarea {
            flex: 1;
            font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
            font-size: 14px;
            line-height: 1.65;
            padding: 16px;
            background: var(--editor-bg);
            border: none;
            border-right: 1px solid var(--border-color);
            color: var(--text-color);
            resize: none;
            outline: none;
            overflow-y: auto;
        }

        .preview-area {
            flex: 1;
            padding: 20px 24px;
            background: var(--preview-bg);
            overflow-y: auto;
            color: var(--text-color);
            line-height: 1.7;
        }

        /* Preview Markdown Typography */
        .preview-area h1, .preview-area h2, .preview-area h3 { margin-top: 1.2em; margin-bottom: 0.5em; font-weight: 700; }
        .preview-area h1 { font-size: 1.8em; border-bottom: 1px solid var(--border-color); padding-bottom: 0.3em; }
        .preview-area h2 { font-size: 1.4em; }
        .preview-area h3 { font-size: 1.15em; }
        .preview-area p { margin-bottom: 1em; }
        .preview-area code { font-family: monospace; font-size: 0.9em; background: rgba(148, 163, 184, 0.15); padding: 2px 6px; border-radius: 4px; }
        .preview-area pre { background: var(--surface-bg); padding: 12px; border-radius: 6px; overflow-x: auto; margin-bottom: 1em; border: 1px solid var(--border-color); }
        .preview-area pre code { background: none; padding: 0; }
        .preview-area blockquote { border-left: 3px solid var(--primary-color); padding-left: 12px; color: var(--text-muted); margin: 1em 0; }
        .preview-area table { border-collapse: collapse; width: 100%; margin-bottom: 1em; }
        .preview-area th, .preview-area td { border: 1px solid var(--border-color); padding: 6px 10px; text-align: left; }
        .preview-area th { background: var(--surface-bg); }
        .preview-area ul, .preview-area ol { padding-left: 24px; margin-bottom: 1em; }
        .preview-area a { color: var(--primary-color); text-decoration: none; }
        .preview-area hr { border: none; border-top: 1px solid var(--border-color); margin: 1.5em 0; }
        .preview-area img { max-width: 100%; border-radius: 6px; }

        /* View Mode Layouts */
        body.mode-edit .preview-area { display: none; }
        body.mode-edit .editor-textarea { border-right: none; }
        body.mode-preview .editor-textarea { display: none; }

        .editor-statusbar {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 4px 12px;
            background: var(--surface-bg);
            border-top: 1px solid var(--border-color);
            font-size: 11.5px;
            color: var(--text-muted);
        }

        .status-left, .status-right {
            display: flex;
            align-items: center;
            gap: 12px;
        }

        .toast {
            position: fixed;
            bottom: 24px;
            right: 24px;
            background: var(--surface-bg);
            color: var(--text-color);
            border: 1px solid var(--border-color);
            padding: 10px 18px;
            border-radius: 8px;
            font-size: 13px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.4);
            opacity: 0;
            transform: translateY(12px);
            transition: all 0.25s ease;
            pointer-events: none;
            z-index: 99999;
            display: flex;
            align-items: center;
            gap: 8px;
        }
        .toast.show {
            opacity: 1;
            transform: translateY(0);
        }

        @media (max-width: 768px) {
            header {
                padding: 8px 12px;
                gap: 8px;
            }
        /* Conflict Diff Modal */
        .modal-overlay {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.65);
            backdrop-filter: blur(4px);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 99990;
            padding: 16px;
        }
        .modal-card {
            background: var(--surface-bg);
            border: 1px solid var(--border-color);
            border-radius: 10px;
            width: 100%;
            max-width: 800px;
            max-height: 90vh;
            display: flex;
            flex-direction: column;
            box-shadow: 0 20px 40px rgba(0,0,0,0.5);
            overflow: hidden;
        }
        .modal-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 12px 16px;
            border-bottom: 1px solid var(--border-color);
        }
        .modal-body {
            padding: 16px;
            overflow-y: auto;
            flex: 1;
            display: flex;
            flex-direction: column;
            gap: 10px;
        }
        .modal-tip {
            font-size: 13px;
            color: var(--text-muted);
        }
        .diff-container {
            display: flex;
            gap: 12px;
            height: 300px;
        }
        .diff-pane {
            flex: 1;
            display: flex;
            flex-direction: column;
            border: 1px solid var(--border-color);
            border-radius: 6px;
            overflow: hidden;
        }
        .diff-title {
            padding: 6px 10px;
            font-size: 12px;
            font-weight: 600;
            background: var(--card-bg);
            border-bottom: 1px solid var(--border-color);
        }
        .diff-textarea {
            flex: 1;
            padding: 10px;
            font-family: ui-monospace, monospace;
            font-size: 12.5px;
            line-height: 1.5;
            background: var(--editor-bg);
            color: var(--text-color);
            border: none;
            outline: none;
            resize: none;
        }
        .modal-footer {
            display: flex;
            align-items: center;
            justify-content: flex-end;
            gap: 8px;
            padding: 12px 16px;
            border-top: 1px solid var(--border-color);
            flex-wrap: wrap;
        }
        @media (max-width: 640px) {
            .diff-container { flex-direction: column; height: 360px; }
            .modal-footer { justify-content: stretch; }
            .modal-footer .btn { flex: 1; min-width: 120px; justify-content: center; }
        }
    </style>
</head>
<body class="mode-split">
    <header>
        <div class="header-left">
            <div class="header-title">
                <span>📝 ${appName}</span>
                <span class="offline-badge" id="network-badge">⚡ 目前離線中 / You’re offline</span>
            </div>
        </div>

        <div class="header-controls">
            <!-- View Mode Selector -->
            <div class="btn-group">
                <button type="button" class="btn" id="mode-edit-btn" title="純編輯模式">✏️ 編輯</button>
                <button type="button" class="btn active" id="mode-split-btn" title="雙欄對照">🌗 雙欄</button>
                <button type="button" class="btn" id="mode-preview-btn" title="預覽模式">👁️ 預覽</button>
            </div>

            <!-- Theme Selector -->
            <select class="theme-select" id="theme-selector">
                <option value="default">🎨 預設主題 (Dark)</option>
                <option value="light">☀️ 明亮白 (Light)</option>
                <option value="tokyo-night">🌃 東京之夜 (Tokyo Night)</option>
                <option value="dracula">🧛 德古拉 (Dracula)</option>
                <option value="nord">❄️ 極光北歐 (Nord)</option>
            </select>

            <button type="button" class="btn" id="new-note-btn">➕ 新增</button>
            <button type="button" class="btn" id="open-local-btn">📂 開啟本機 .md</button>
            <button type="button" class="btn" id="export-md-btn">⭳ 導出 Markdown</button>
            <button type="button" class="btn" id="backup-btn" title="備份全部快取筆記">💾 備份 JSON</button>
            <button type="button" class="btn btn-primary" id="save-note-btn">💾 儲存</button>
        </div>
    </header>

    <main>
        <aside class="sidebar">
            <div class="sidebar-search">
                <input type="text" class="search-input" id="search-notes" placeholder="🔍 搜尋離線筆記 (Search)...">
            </div>
            <div class="sidebar-header">
                <span>本機快取筆記 (<span id="notes-count">0</span>)</span>
            </div>
            <ul class="note-list" id="note-list">
                <!-- Dynamic Note Items -->
            </ul>
            <div class="sidebar-footer">
                <button type="button" class="btn btn-sm" id="import-backup-btn" style="flex:1;">📥 匯入備份</button>
                <button type="button" class="btn btn-sm btn-danger" id="clear-all-btn" title="清空離線快取">🗑️ 清空</button>
            </div>
        </aside>

        <section class="workspace-area">
            <div class="editor-topbar">
                <input type="text" class="editor-title" id="note-title" placeholder="輸入標題 (Title)..." value="離線草稿">
                <span class="note-path-tag" id="note-path-display">local/draft</span>
            </div>

            <div class="content-split-container">
                <textarea class="editor-textarea" id="note-content" placeholder="在此輸入 Markdown 內容... (支援離線編輯與本地儲存)"></textarea>
                <div class="preview-area" id="preview-area"></div>
            </div>

            <div class="editor-statusbar">
                <div class="status-left">
                    <span id="save-status">🟢 本機已存 (IndexedDB)</span>
                    <span id="sync-status">待同步</span>
                </div>
                <div class="status-right">
                    <span id="word-count">字數: 0</span>
                    <span id="reading-time">預估閱讀: 1 分鐘</span>
                </div>
            </div>
        </section>
    </main>

    <!-- Conflict Diff Modal -->
    <div id="conflict-modal" class="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="conflict-dialog-title" style="display: none;">
        <div class="modal-card">
            <div class="modal-header">
                <h3 id="conflict-dialog-title"><span aria-hidden="true">⚠️ </span>雲端版本衝突 (Sync Conflict)</h3>
                <button type="button" class="btn btn-sm" id="conflict-close-btn" aria-label="關閉對話框 (Close)">✕</button>
            </div>
            <div class="modal-body">
                <p class="modal-tip">此筆記在雲端已被其他裝置修改，內容與您離線編輯的版本不同。請選擇處理方式：</p>
                <div class="diff-container">
                    <div class="diff-pane">
                        <div class="diff-title"><span aria-hidden="true">🖥️ </span>本機離線版本 (Local)</div>
                        <textarea class="diff-textarea" id="diff-local" readonly aria-label="本機離線版本內容"></textarea>
                    </div>
                    <div class="diff-pane">
                        <div class="diff-title"><span aria-hidden="true">☁️ </span>雲端最新版本 (Cloud Remote)</div>
                        <textarea class="diff-textarea" id="diff-remote" readonly aria-label="雲端最新版本內容"></textarea>
                    </div>
                </div>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-primary" id="conflict-keep-local"><span aria-hidden="true">🟢 </span>保留本機修改（覆蓋雲端）</button>
                <button type="button" class="btn" id="conflict-keep-remote"><span aria-hidden="true">🔵 </span>採用雲端版本（更新本機）</button>
                <button type="button" class="btn" id="conflict-save-copy"><span aria-hidden="true">📑 </span>另存衝突副本</button>
            </div>
        </div>
    </div>

    <div id="toast" class="toast" role="status" aria-live="polite"></div>

    <script type="module" src="/js/marked.min.js"></script>
    <script type="module" src="/js/purify.min.js"></script>
    <script type="module">
        import { offlineStore, exportMarkdownFile, openLocalMarkdownFile } from '/js/offline-store.mjs'

        const $title = document.getElementById('note-title')
        const $content = document.getElementById('note-content')
        const $preview = document.getElementById('preview-area')
        const $pathDisplay = document.getElementById('note-path-display')
        const $saveBtn = document.getElementById('save-note-btn')
        const $exportBtn = document.getElementById('export-md-btn')
        const $backupBtn = document.getElementById('backup-btn')
        const $newBtn = document.getElementById('new-note-btn')
        const $openLocalBtn = document.getElementById('open-local-btn')
        const $importBackupBtn = document.getElementById('import-backup-btn')
        const $clearAllBtn = document.getElementById('clear-all-btn')
        const $noteList = document.getElementById('note-list')
        const $notesCount = document.getElementById('notes-count')
        const $searchInput = document.getElementById('search-notes')
        const $themeSelect = document.getElementById('theme-selector')
        const $badge = document.getElementById('network-badge')
        const $saveStatus = document.getElementById('save-status')
        const $syncStatus = document.getElementById('sync-status')
        const $wordCount = document.getElementById('word-count')
        const $readingTime = document.getElementById('reading-time')
        const $toast = document.getElementById('toast')

        const $conflictModal = document.getElementById('conflict-modal')
        const $diffLocal = document.getElementById('diff-local')
        const $diffRemote = document.getElementById('diff-remote')
        const $conflictCloseBtn = document.getElementById('conflict-close-btn')
        const $conflictKeepLocal = document.getElementById('conflict-keep-local')
        const $conflictKeepRemote = document.getElementById('conflict-keep-remote')
        const $conflictSaveCopy = document.getElementById('conflict-save-copy')

        const $modeEdit = document.getElementById('mode-edit-btn')
        const $modeSplit = document.getElementById('mode-split-btn')
        const $modePreview = document.getElementById('mode-preview-btn')

        let currentPath = 'offline-draft'
        let currentSyncStatus = 'draft'
        let debounceTimer = null
        let activeConflictInfo = null

        function showToast(msg) {
            $toast.textContent = msg
            $toast.classList.add('show')
            setTimeout(() => $toast.classList.remove('show'), 3000)
        }

        function normalizeText(str) {
            return String(str || '').replace(/\\r\\n/g, '\\n')
        }

        function showConflictModal(path, localText, remoteText) {
            activeConflictInfo = { path, localText, remoteText }
            $diffLocal.value = localText
            $diffRemote.value = remoteText
            $conflictModal.style.display = 'flex'
            $conflictKeepLocal.focus()
        }

        function closeConflictModal() {
            $conflictModal.style.display = 'none'
            activeConflictInfo = null
        }
        $conflictCloseBtn.onclick = closeConflictModal

        $conflictKeepLocal.onclick = async () => {
            if (!activeConflictInfo) return
            const { path, localText } = activeConflictInfo
            closeConflictModal()
            await syncNoteToServer(path, localText, { isForce: true })
            showToast('✅ 已保留本機版本並同步覆蓋雲端！')
        }

        $conflictKeepRemote.onclick = async () => {
            if (!activeConflictInfo) return
            const { path, remoteText } = activeConflictInfo
            closeConflictModal()
            $content.value = remoteText
            const title = String(remoteText || '').split('\\n')[0]?.replace(/^#*\\s*/, '').trim() || path
            $title.value = title
            await offlineStore.saveNote(path, {
                title,
                content: remoteText,
                syncStatus: 'synced',
            })
            renderPreview()
            await renderNoteList()
            showToast('✅ 已採用雲端最新版本！')
        }

        $conflictSaveCopy.onclick = async () => {
            if (!activeConflictInfo) return
            const { path, localText, remoteText } = activeConflictInfo
            closeConflictModal()
            const copyPath = path + '-conflict-' + Date.now().toString(36)
            await offlineStore.saveNote(copyPath, {
                title: ($title.value || path) + ' (本機衝突副本)',
                content: localText,
                syncStatus: 'draft',
            })
            $content.value = remoteText
            const title = String(remoteText || '').split('\\n')[0]?.replace(/^#*\\s*/, '').trim() || path
            $title.value = title
            await offlineStore.saveNote(path, {
                title,
                content: remoteText,
                syncStatus: 'synced',
            })
            renderPreview()
            await renderNoteList()
            showToast('📑 已另存本機副本為：' + copyPath)
        }

        // Render Markdown content to Preview pane
        function renderPreview() {
            const raw = $content.value || ''
            if (typeof marked !== 'undefined' && typeof DOMPurify !== 'undefined') {
                $preview.innerHTML = DOMPurify.sanitize(marked.parse(raw))
            } else if (typeof marked !== 'undefined') {
                $preview.innerHTML = marked.parse(raw)
            } else {
                // Fallback lightweight parser
                const lines = raw.split('\\n').map(l => {
                    if (l.startsWith('# ')) return '<h1>' + escapeHtml(l.slice(2)) + '</h1>'
                    if (l.startsWith('## ')) return '<h2>' + escapeHtml(l.slice(3)) + '</h2>'
                    if (l.startsWith('### ')) return '<h3>' + escapeHtml(l.slice(4)) + '</h3>'
                    if (l.startsWith('- ')) return '<li>' + escapeHtml(l.slice(2)) + '</li>'
                    return l ? '<p>' + escapeHtml(l) + '</p>' : ''
                }).join('')
                $preview.innerHTML = lines || '<p style="color:var(--text-muted);">（預覽區域）</p>'
            }
            updateStats()
        }

        function escapeHtml(str) {
            return String(str || '')
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/"/g, '&quot;')
                .replace(/'/g, '&#39;')
                .replace(/\`/g, '&#96;')
        }

        function updateStats() {
            const text = $content.value || ''
            const charCount = text.length
            const wordCount = (text.match(/\\S+/g) || []).length
            const minutes = Math.max(1, Math.ceil(wordCount / 200))
            $wordCount.textContent = '字數: ' + charCount + ' (' + wordCount + ' 字詞)'
            $readingTime.textContent = '預估閱讀: ' + minutes + ' 分鐘'
        }

        async function saveCurrent(options = { showNotification: true, manualSync: false }) {
            const title = $title.value.trim() || '未命名筆記'
            const content = $content.value
            const isManualOrReconnection = options.manualSync || currentSyncStatus === 'pending'
            currentSyncStatus = navigator.onLine ? (currentSyncStatus === 'pending' ? 'pending' : 'synced') : 'pending'
            await offlineStore.saveNote(currentPath, {
                title,
                content,
                theme: $themeSelect.value,
                syncStatus: currentSyncStatus
            })
            $pathDisplay.textContent = currentPath
            $syncStatus.textContent = currentSyncStatus === 'synced' ? '🟢 已與雲端同步' : '🟡 待同步至雲端'
            $saveStatus.textContent = '🟢 已儲存至本地 IndexedDB (' + new Date().toLocaleTimeString() + ')'
            await renderNoteList()
            if (options.showNotification) {
                showToast('💾 已儲存至本地 IndexedDB')
            }
            if (navigator.onLine && options.manualSync) {
                // Server sync ONLY on manual save or explicit sync trigger, avoiding server spam during typing
                syncNoteToServer(currentPath, content, { checkConflict: isManualOrReconnection })
            }
        }

        async function syncNoteToServer(path, content, options = { checkConflict: false, isForce: false }) {
            if (!navigator.onLine) return
            try {
                const targetPath = path.startsWith('local/') ? path.replace('local/', '') : path
                if (!targetPath || targetPath.startsWith('offline-draft')) return

                // Conflict check ONLY when syncing pending offline notes or manual sync
                if (options.checkConflict && !options.isForce) {
                    try {
                        const checkRes = await fetch('/' + encodeURIComponent(targetPath), {
                            headers: { 'Accept': 'text/plain' }
                        })
                        if (checkRes.ok && checkRes.status === 200) {
                            const serverRaw = await checkRes.text()
                            if (serverRaw && normalizeText(serverRaw) !== normalizeText(content) && currentSyncStatus === 'pending') {
                                showConflictModal(path, content, serverRaw)
                                return
                            }
                        }
                    } catch (checkErr) {}
                }

                const res = await fetch('/' + encodeURIComponent(targetPath), {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                    body: new URLSearchParams({ t: content }),
                })
                const data = await res.json()
                if (data.err === 0) {
                    currentSyncStatus = 'synced'
                    await offlineStore.updateSyncStatus(path, 'synced')
                    $syncStatus.textContent = '🟢 雲端已同步'
                    await renderNoteList()
                }
            } catch (err) {
                console.warn('Sync failed:', err)
            }
        }

        async function loadNote(path) {
            // Cancel running debounce timer before switching notes
            if (debounceTimer) {
                clearTimeout(debounceTimer)
                debounceTimer = null
            }
            currentPath = path
            $pathDisplay.textContent = path
            const note = await offlineStore.getNote(path)
            if (note) {
                $title.value = note.title || ''
                $content.value = note.content || ''
                currentSyncStatus = note.syncStatus || 'draft'
                if (note.theme && $themeSelect.querySelector('option[value="' + note.theme + '"]')) {
                    setTheme(note.theme)
                }
            } else {
                $title.value = '未命名筆記'
                $content.value = ''
                currentSyncStatus = 'draft'
            }
            renderPreview()
            await renderNoteList()
        }

        async function renderNoteList(filterQuery = '') {
            const list = filterQuery ? await offlineStore.searchNotes(filterQuery) : offlineStore.getAllNotesMetadata()
            $notesCount.textContent = list.length
            $noteList.innerHTML = ''
            if (!list.length) {
                const li = document.createElement('li')
                li.className = 'note-item active'
                li.innerHTML = '<div class="note-item-info"><div class="note-item-title">' + escapeHtml($title.value || '離線草稿') + '</div><div class="note-item-meta">無搜尋結果或暫無快取</div></div>'
                $noteList.appendChild(li)
                return
            }
            list.forEach(meta => {
                const li = document.createElement('li')
                li.className = 'note-item' + (meta.path === currentPath ? ' active' : '')
                const dateStr = meta.updatedAt ? new Date(meta.updatedAt).toLocaleDateString() : ''
                const badgeClass = meta.syncStatus === 'synced' ? 'synced' : (meta.syncStatus === 'pending' ? 'pending' : 'draft')
                const badgeLabel = meta.syncStatus === 'synced' ? '已同步' : (meta.syncStatus === 'pending' ? '待同步' : '本機')

                li.innerHTML = \`
                    <div class="note-item-info">
                        <div class="note-item-title">\${escapeHtml(meta.title || meta.path)}</div>
                        <div class="note-item-meta">
                            <span>\${dateStr}</span>
                            <span>·</span>
                            <span>\${meta.size || 0} B</span>
                            <span class="note-badge \${badgeClass}">\${badgeLabel}</span>
                        </div>
                    </div>
                    <button type="button" class="note-item-delete" title="刪除本機快取" aria-label="刪除本機快取">🗑️</button>
                \`

                li.onclick = (e) => {
                    if (e.target.closest('.note-item-delete')) return
                    loadNote(meta.path)
                }

                const delBtn = li.querySelector('.note-item-delete')
                delBtn.onclick = async (e) => {
                    e.stopPropagation()
                    if (confirm('確定要刪除「' + (meta.title || meta.path) + '」的本機離線快取嗎？')) {
                        await offlineStore.deleteNote(meta.path)
                        showToast('🗑️ 已刪除本機快取筆記')
                        if (currentPath === meta.path) {
                            currentPath = 'offline-draft-' + Date.now().toString(36)
                            $title.value = '新離線筆記'
                            $content.value = ''
                            renderPreview()
                        }
                        await renderNoteList($searchInput.value)
                    }
                }

                $noteList.appendChild(li)
            })
        }

        // View Mode Switcher
        function setViewMode(mode) {
            document.body.classList.remove('mode-edit', 'mode-split', 'mode-preview')
            document.body.classList.add('mode-' + mode)
            $modeEdit.classList.toggle('active', mode === 'edit')
            $modeSplit.classList.toggle('active', mode === 'split')
            $modePreview.classList.toggle('active', mode === 'preview')
            if (mode !== 'edit') renderPreview()
        }
        $modeEdit.onclick = () => setViewMode('edit')
        $modeSplit.onclick = () => setViewMode('split')
        $modePreview.onclick = () => setViewMode('preview')

        // Theme Switcher
        function setTheme(theme) {
            document.body.classList.remove('theme-light', 'theme-tokyo-night', 'theme-dracula', 'theme-nord')
            if (theme !== 'default') {
                document.body.classList.add('theme-' + theme)
            }
            $themeSelect.value = theme
            localStorage.setItem('cf-notepad-offline-theme', theme)
        }
        $themeSelect.onchange = () => setTheme($themeSelect.value)

        // Event listeners
        $content.addEventListener('input', () => {
            renderPreview()
            if (debounceTimer) clearTimeout(debounceTimer)
            debounceTimer = setTimeout(() => {
                saveCurrent({ showNotification: false })
            }, 600)
        })

        $title.addEventListener('input', () => {
            if (debounceTimer) clearTimeout(debounceTimer)
            debounceTimer = setTimeout(() => {
                saveCurrent({ showNotification: false })
            }, 600)
        })

        $searchInput.addEventListener('input', () => {
            renderNoteList($searchInput.value.trim())
        })

        $saveBtn.onclick = () => saveCurrent({ showNotification: true, manualSync: true })

        $newBtn.onclick = async () => {
            if (debounceTimer) clearTimeout(debounceTimer)
            currentPath = 'offline-draft-' + Date.now().toString(36)
            $title.value = '新離線筆記'
            $content.value = ''
            $pathDisplay.textContent = currentPath
            renderPreview()
            await saveCurrent({ showNotification: false })
            showToast('📄 已建立新離線草稿')
        }

        $exportBtn.onclick = () => {
            const title = $title.value.trim() || 'note'
            exportMarkdownFile(title + '.md', $content.value)
            showToast('📄 已匯出 Markdown 檔案')
        }

        $backupBtn.onclick = async () => {
            const json = await offlineStore.exportBackupJson()
            const blob = new Blob([json], { type: 'application/json;charset=utf-8' })
            const url = URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = 'david888-wiki-offline-backup-' + new Date().toISOString().slice(0,10) + '.json'
            a.click()
            URL.revokeObjectURL(url)
            showToast('💾 已下載離線快取 JSON 備份檔')
        }

        $openLocalBtn.onclick = async () => {
            const file = await openLocalMarkdownFile()
            if (file) {
                if (debounceTimer) clearTimeout(debounceTimer)
                $title.value = file.name.replace(/\\.md$/i, '')
                $content.value = file.text
                currentPath = 'local/' + file.name
                $pathDisplay.textContent = currentPath
                renderPreview()
                await saveCurrent({ showNotification: true })
                showToast('📂 已載入本地檔案：' + file.name)
            }
        }

        $importBackupBtn.onclick = () => {
            const input = document.createElement('input')
            input.type = 'file'
            input.accept = '.json'
            input.onchange = async () => {
                if (input.files && input.files[0]) {
                    const text = await input.files[0].text()
                    const res = await offlineStore.importBackupJson(text)
                    if (res.success) {
                        showToast('📥 成功匯入 ' + res.count + ' 篇離線筆記！')
                        await renderNoteList()
                    } else {
                        showToast('❌ 匯入失敗：' + res.error)
                    }
                }
            }
            input.click()
        }

        $clearAllBtn.onclick = async () => {
            if (confirm('⚠️ 警告：確定要清空所有離線快取筆記嗎？此操作不可逆！')) {
                if (debounceTimer) clearTimeout(debounceTimer)
                await offlineStore.clearAllNotes()
                currentPath = 'offline-draft'
                $title.value = '離線筆記'
                $content.value = ''
                renderPreview()
                await renderNoteList()
                showToast('🗑️ 已清空全部離線快取')
            }
        }

        // Shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && $conflictModal.style.display === 'flex') {
                closeConflictModal()
            } else if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 's') {
                e.preventDefault()
                saveCurrent({ showNotification: true, manualSync: true })
            } else if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'o') {
                e.preventDefault()
                $openLocalBtn.click()
            } else if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'e') {
                e.preventDefault()
                const modes = ['edit', 'split', 'preview']
                const cur = document.body.classList.contains('mode-edit') ? 0 : (document.body.classList.contains('mode-split') ? 1 : 2)
                setViewMode(modes[(cur + 1) % 3])
            }
        })

        // Online & Offline State handling
        function updateNetworkState() {
            if (navigator.onLine) {
                $badge.textContent = '🟢 網路已連線 / Online'
                $badge.classList.add('online')
                if ('serviceWorker' in navigator) {
                    navigator.serviceWorker.ready.then(reg => {
                        if (reg && 'sync' in reg) {
                            reg.sync.register('sync-pending-notes').catch(() => {})
                        }
                    }).catch(() => {})
                }
                // Background sync all pending notes
                offlineStore.getPendingSyncNotes().then(pending => {
                    if (pending.length > 0) {
                        showToast('🔄 正在同步 ' + pending.length + ' 篇離線筆記至雲端...')
                        Promise.all(pending.map(p => syncNoteToServer(p.path, p.content, { checkConflict: true }))).then(() => {
                            showToast('☁️ 離線筆記已全數同步至雲端！')
                        })
                    }
                })
            } else {
                $badge.textContent = '⚡ 目前離線中 / You’re offline'
                $badge.classList.remove('online')
            }
        }
        window.addEventListener('online', updateNetworkState)
        window.addEventListener('offline', updateNetworkState)

        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.addEventListener('message', (event) => {
                if (event.data?.type === 'BACKGROUND_SYNC_TRIGGER') {
                    updateNetworkState()
                }
            })
        }

        // Initialize from storage
        const savedTheme = localStorage.getItem('cf-notepad-offline-theme') || 'default'
        setTheme(savedTheme)

        offlineStore.init().then(async () => {
            updateNetworkState()
            const list = offlineStore.getAllNotesMetadata()
            
            // Check if URL specifies a target note to load
            const urlParams = new URLSearchParams(window.location.search)
            const targetNotePath = urlParams.get('note') || (window.location.pathname !== '/_pwa-offline' ? window.location.pathname.replace(/^\\//, '') : '')
            
            if (targetNotePath && (await offlineStore.getNote(targetNotePath))) {
                await loadNote(targetNotePath)
            } else if (list.length > 0) {
                await loadNote(list[0].path)
            } else {
                renderPreview()
                await renderNoteList()
            }
        })
    </script>
</body>
</html>`

    return new Response(html, {
        headers: {
            'Content-Type': 'text/html; charset=UTF-8',
            'Cache-Control': 'no-store',
        },
    })
}


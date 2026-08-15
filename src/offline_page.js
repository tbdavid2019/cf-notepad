import { APP_NAME } from './constant.js'

export const createOfflinePageResponse = () => {
    const appName = APP_NAME || 'david888 wiki'
    const html = `<!doctype html>
<html lang="zh-Hant-TW">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="theme-color" content="#0f172a">
    <link rel="manifest" href="/app.webmanifest">
    <link rel="icon" href="/notepad-icon-192.png">
    <title>離線工作區 · ${appName}</title>
    <style>
        :root {
            color-scheme: light dark;
            --bg-color: #f8fafc;
            --card-bg: #ffffff;
            --text-color: #0f172a;
            --text-muted: #64748b;
            --border-color: #e2e8f0;
            --primary-color: #2563eb;
            --primary-hover: #1d4ed8;
            --accent-bg: #eff6ff;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        }
        @media (prefers-color-scheme: dark) {
            :root {
                --bg-color: #0f172a;
                --card-bg: #1e293b;
                --text-color: #f8fafc;
                --text-muted: #94a3b8;
                --border-color: #334155;
                --primary-color: #3b82f6;
                --primary-hover: #60a5fa;
                --accent-bg: #1e293b;
            }
        }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body {
            background: var(--bg-color);
            color: var(--text-color);
            min-height: 100vh;
            display: flex;
            flex-direction: column;
        }
        header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 12px 20px;
            background: var(--card-bg);
            border-bottom: 1px solid var(--border-color);
        }
        .header-title {
            display: flex;
            align-items: center;
            gap: 8px;
            font-weight: 600;
            font-size: 16px;
        }
        .offline-badge {
            background: #fef3c7;
            color: #92400e;
            padding: 3px 8px;
            border-radius: 999px;
            font-size: 12px;
            font-weight: 500;
        }
        @media (prefers-color-scheme: dark) {
            .offline-badge {
                background: #78350f;
                color: #fde68a;
            }
        }
        .header-actions {
            display: flex;
            align-items: center;
            gap: 8px;
        }
        .btn {
            display: inline-flex;
            align-items: center;
            gap: 6px;
            padding: 6px 14px;
            border-radius: 6px;
            font-size: 13px;
            font-weight: 500;
            cursor: pointer;
            border: 1px solid var(--border-color);
            background: var(--card-bg);
            color: var(--text-color);
            transition: all 0.15s ease;
        }
        .btn:hover {
            border-color: var(--primary-color);
            color: var(--primary-color);
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
        main {
            display: flex;
            flex: 1;
            overflow: hidden;
        }
        .sidebar {
            width: 280px;
            border-right: 1px solid var(--border-color);
            background: var(--card-bg);
            display: flex;
            flex-direction: column;
            overflow-y: auto;
        }
        .sidebar-header {
            padding: 12px 16px;
            font-size: 12px;
            font-weight: 600;
            color: var(--text-muted);
            text-transform: uppercase;
            letter-spacing: 0.5px;
            border-bottom: 1px solid var(--border-color);
        }
        .note-list {
            list-style: none;
            flex: 1;
        }
        .note-item {
            padding: 12px 16px;
            border-bottom: 1px solid var(--border-color);
            cursor: pointer;
            transition: background 0.1s;
        }
        .note-item:hover, .note-item.active {
            background: var(--accent-bg);
        }
        .note-item-title {
            font-size: 14px;
            font-weight: 500;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            margin-bottom: 4px;
        }
        .note-item-meta {
            font-size: 12px;
            color: var(--text-muted);
        }
        .editor-area {
            flex: 1;
            display: flex;
            flex-direction: column;
            background: var(--bg-color);
            padding: 16px;
            gap: 12px;
        }
        .editor-title {
            font-size: 18px;
            font-weight: 600;
            padding: 8px 12px;
            background: var(--card-bg);
            border: 1px solid var(--border-color);
            border-radius: 6px;
            color: var(--text-color);
            outline: none;
        }
        .editor-textarea {
            flex: 1;
            font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
            font-size: 14px;
            line-height: 1.6;
            padding: 16px;
            background: var(--card-bg);
            border: 1px solid var(--border-color);
            border-radius: 6px;
            color: var(--text-color);
            resize: none;
            outline: none;
        }
        .toast {
            position: fixed;
            bottom: 20px;
            right: 20px;
            background: #1e293b;
            color: #f8fafc;
            padding: 10px 18px;
            border-radius: 8px;
            font-size: 13px;
            box-shadow: 0 10px 25px rgba(0,0,0,0.3);
            opacity: 0;
            transform: translateY(10px);
            transition: all 0.2s ease;
            pointer-events: none;
            z-index: 9999;
        }
        .toast.show {
            opacity: 1;
            transform: translateY(0);
        }
    </style>
</head>
<body>
    <header>
        <div class="header-title">
            <span>📝 ${appName}</span>
            <span class="offline-badge">⚡ 目前離線中 / You’re offline</span>
        </div>
        <div class="header-actions">
            <button type="button" class="btn" id="open-local-btn">📂 開啟本機 .md</button>
            <button type="button" class="btn" id="export-md-btn">⭳ 導出 Markdown</button>
            <button type="button" class="btn btn-primary" id="save-note-btn">💾 儲存 (Cmd/Ctrl + S)</button>
        </div>
    </header>
    <main>
        <aside class="sidebar">
            <div class="sidebar-header">本機快取筆記 (Local Cache)</div>
            <ul class="note-list" id="note-list">
                <li class="note-item active" data-path="local-draft">
                    <div class="note-item-title">新離線筆記 (Draft)</div>
                    <div class="note-item-meta">本地即時儲存</div>
                </li>
            </ul>
        </aside>
        <section class="editor-area">
            <input type="text" class="editor-title" id="note-title" placeholder="輸入標題 (Title)..." value="離線筆記">
            <textarea class="editor-textarea" id="note-content" placeholder="在此輸入 Markdown 內容... (支援離線編輯與本地儲存)"></textarea>
        </section>
    </main>
    <div id="toast" class="toast"></div>

    <script type="module">
        import { offlineStore, exportMarkdownFile, openLocalMarkdownFile } from '/js/offline-store.mjs'

        const $title = document.getElementById('note-title')
        const $content = document.getElementById('note-content')
        const $saveBtn = document.getElementById('save-note-btn')
        const $exportBtn = document.getElementById('export-md-btn')
        const $openLocalBtn = document.getElementById('open-local-btn')
        const $noteList = document.getElementById('note-list')
        const $toast = document.getElementById('toast')

        let currentPath = 'offline-draft'

        function showToast(msg) {
            $toast.textContent = msg
            $toast.classList.add('show')
            setTimeout(() => $toast.classList.remove('show'), 2500)
        }

        async function saveCurrent() {
            const title = $title.value.trim() || '未命名筆記'
            const content = $content.value
            await offlineStore.saveNote(currentPath, {
                title,
                content,
                syncStatus: 'pending'
            })
            renderNoteList()
            showToast('✅ 已儲存至本地 IndexedDB / LocalStorage')
        }

        async function loadNote(path) {
            currentPath = path
            const note = await offlineStore.getNote(path)
            if (note) {
                $title.value = note.title || ''
                $content.value = note.content || ''
            }
            renderNoteList()
        }

        function renderNoteList() {
            const list = offlineStore.getAllNotesMetadata()
            $noteList.innerHTML = ''
            if (!list.length) {
                const li = document.createElement('li')
                li.className = 'note-item active'
                li.innerHTML = '<div class="note-item-title">' + ($title.value || '離線草稿') + '</div><div class="note-item-meta">本地草稿</div>'
                $noteList.appendChild(li)
                return
            }
            list.forEach(meta => {
                const li = document.createElement('li')
                li.className = 'note-item' + (meta.path === currentPath ? ' active' : '')
                li.onclick = () => loadNote(meta.path)
                const dateStr = meta.updatedAt ? new Date(meta.updatedAt).toLocaleTimeString() : ''
                li.innerHTML = '<div class="note-item-title">' + (meta.title || meta.path) + '</div><div class="note-item-meta">' + dateStr + ' · ' + (meta.size || 0) + ' B</div>'
                $noteList.appendChild(li)
            })
        }

        // Initialize from store
        offlineStore.init().then(async () => {
            const list = offlineStore.getAllNotesMetadata()
            if (list.length > 0) {
                await loadNote(list[0].path)
            } else {
                renderNoteList()
            }
        })

        $saveBtn.onclick = saveCurrent
        $exportBtn.onclick = () => {
            const title = $title.value.trim() || 'note'
            exportMarkdownFile(title + '.md', $content.value)
            showToast('📄 已匯出 Markdown 檔案')
        }
        $openLocalBtn.onclick = async () => {
            const file = await openLocalMarkdownFile()
            if (file) {
                $title.value = file.name.replace(/\\.md$/i, '')
                $content.value = file.text
                currentPath = 'local/' + file.name
                await saveCurrent()
                showToast('📂 已載入本地檔案：' + file.name)
            }
        }

        document.addEventListener('keydown', (e) => {
            if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 's') {
                e.preventDefault()
                saveCurrent()
            }
        })

        window.addEventListener('online', () => {
            showToast('🟢 網路連線已恢復！正在重新連線...')
            setTimeout(() => window.location.reload(), 1200)
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

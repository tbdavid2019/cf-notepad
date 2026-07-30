const OFFLINE_PAGE_HTML = `<!doctype html>
<html lang="zh-Hant-TW">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="theme-color" content="#0f172a">
    <title>目前離線中 · Cloud Notepad</title>
    <style>
        :root { color-scheme: light dark; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; }
        body { align-items: center; background: #f9f6f0; color: #2c2a29; display: flex; justify-content: center; margin: 0; min-height: 100vh; padding: 24px; text-align: center; }
        main { max-width: 30rem; }
        h1 { font-size: clamp(1.5rem, 5vw, 2.25rem); margin: 0 0 1rem; }
        p { color: #706c66; line-height: 1.7; margin: 0; }
        @media (prefers-color-scheme: dark) { body { background: #0f172a; color: #f8fafc; } p { color: #cbd5e1; } }
    </style>
</head>
<body>
    <main>
        <h1>目前離線中</h1>
        <p>請在恢復連線後重新開啟筆記。<br>You’re offline. Reconnect to open your notes.</p>
    </main>
</body>
</html>`

export const createOfflinePageResponse = () => new Response(OFFLINE_PAGE_HTML, {
    headers: {
        'Content-Type': 'text/html; charset=UTF-8',
        'Cache-Control': 'no-store',
    },
})

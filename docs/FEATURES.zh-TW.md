# 888wiki 功能詳情（繁體中文）

回到[繁體中文專案首頁](../README.zh-TW.md) · [使用指南](USAGE.zh-TW.md) · [安裝指南](INSTALLATION.zh-TW.md) · [更新紀錄](../CHANGELOG.md)

888wiki **從 Markdown 起家**：以可攜的 Markdown 純文字為基礎，再依需求使用 Block、Canvas 或 Whiteboard。Markdown 預覽與閱讀版面提供 20 款繽紛主題。

## 編輯器畫面

![Markdown 編輯器的搜尋與取代功能](../orca-paste-1787127718063-d5855e68-4e94-4779-a053-a962fb11cbd0.png)

![編輯工作區](../orca-paste-1787127786636-d3cf3fb4-c057-41ef-8c77-9fa2db22a43e.png)

![Markdown 語法與渲染範例](../image.png)

## ⚡ 強大亮點功能一覽 (Feature Highlights)

### 🤖 1. AI 智慧寫作特助與 Agent 生態

- **🎙️ 音訊匯入與語音轉逐字稿 (Groq whisper-large-v3 主力 + 多層級備援 + 原生時間戳記 `[mm:ss]`)**：點擊左下角「＋ 新增」選單，位於匯入區塊最上方，可直接上傳常見音訊檔案（`.mp3`, `.m4a`, `.wav`, `.aac`, `.ogg`, `.webm`, `.flac`, `.opus`, `.mp4` 等）。
  - **極速多層級 STT 引擎**：
    1. **主力模型 (Primary)**：**Groq `whisper-large-v3`**（超高速推論，秒級完成長篇語音轉錄，原生 `verbose_json` 時間段落）。
    2. **第一備援 (Fallback 1)**：**Groq `whisper-large-v3-turbo`**。
    3. **第二備援 (Fallback 2)**：Cloudflare Workers AI **`@cf/openai/whisper-large-v3-turbo`**（解析原生 WebVTT 字幕時間流）。
    4. **第三備援 (Fallback 3)**：Cloudflare Workers AI **`@cf/openai/whisper`**。
  - **原生時間戳記與自動分段**：解決純逐字稿擠成一整坨的痛點，依據語音停頓自動生成帶有 `**[00:15]**` 時間標記的獨立段落，兼顧 Markdown 預覽與 BlockNote 區塊編輯。
  - **雙模式自主切換**：
    1. **🎙️ 匯入音訊（逐字稿）**（**推薦預設**）：輸出 100% 原音忠實逐字稿附帶精確時間戳記，**零幻覺、零額外摘要、無多餘大綱腦補**，極速且純淨。
    2. **✨ 匯入音訊（智慧排版）**（**可選模式**）：Whisper 先產出結構化時間逐字稿，再由 LLM 釐清語句、整理重點與 Markdown 排版；不自行捏造原文沒有的事實。
- **AI 排版優化 (AI Format)**：採用 Workers AI / Groq 彈性雙軌推論（`gpt-oss-20b`），具備無縫自動容錯備援，自動梳理 Markdown 標題、清單與空白，100% 保留原文語言與內容。支援圈選局部排版。
- **AI 輔助編輯與生成 (AI Edit &amp; Draft)**：採用 `gpt-oss-120b` 模型（支援 Workers AI 與 Groq 自動容錯備援），提供指令式的段落改寫、表格整理、內容擴充或整篇文稿生成。
- **AI 翻譯／雙語生成 (AI Translate &amp; Bilingual)**：一鍵將文章翻譯為指定目標語言，或產生排版完美的「原文 + 譯文」雙語對照版本。
- **選取文字浮動 AI 捷徑**：在編輯器中選取任意文字，自動彈出浮動選單，一鍵觸發排版、AI 編輯或翻譯。
- **Agent 生態 (MCP, WebMCP &amp; Skills)**：提供原生 HTTP JSON-RPC 2.0 端點（`/mcp`，完美相容 Cloudflare WebMCP 1-Click 整合與 Chrome 146+ `document.modelContext`）、遠端 Python FastMCP 伺服器 (`uv run server.py`)，並發布 `/.well-known/agent-skills/david888-wiki-publisher/SKILL.md`，可直接作為 Antigravity、Cursor、Claude Desktop 或 n8n 的發文大腦。

```text
👉 ChatGPT / Claude 一鍵發文 Prompt：
這是一台架設好的 Wiki 記事本，具備無頭 CMS 的發文 API：`https://wiki.david888.com/api`。
請你擔任我的寫作助理，根據我的需求撰寫文章並發布。
操作指南請閱讀以下檔案內容（請運用你的上網 / 執行工具讀取）：
👉 https://wiki.david888.com/.well-known/agent-skills/david888-wiki-publisher/SKILL.md
請你使用上述檔案的 cURL/HTTP 請求，完成寫作後將內容存檔，並把最後發布的文章網址給我。
```

---

### 🎨 2. 極致寫作、媒體與排版體驗

- **剪貼簿直貼、R2 圖片上傳、圖片 OCR 與本地優先表格幾何重構**：貼上或拖曳圖片時可選擇「上傳圖片」、「OCR 轉文字」、「辨識表格」或「取消」。本機 OCR 使用 PP-OCRv6，優先 WebGPU、回退 WASM，圖片完全留在瀏覽器本地；表格模式採用**純前端二維幾何拓撲重構演算法優先**，利用文字座標即時還原欄列並輸出標準 GFM Markdown Table，若處於手機端、記憶體限制或模型載入失敗時，平滑 fallback 至後端三層表格辨識服務。首次本機 OCR 會顯示模型下載狀態，若 Worker、WebGPU、模型或表格服務失敗也會顯示處理建議。
- **888box 多媒體附件上傳**：工具列支援將影片、音訊、文件、壓縮檔等大檔上傳至 `box.david888.com`（具自動 fallback 機制），自動插入 `<video>`、`<audio>` 或下載連結。
- **📊 Mermaid 與圖表懸浮工具列與一鍵複製 PNG/代碼**：所有渲染後的 Mermaid 流程圖、架構圖、循序圖與 Flowchart/Sequence/Graphviz/ABC/ECharts 圖表右上角均自動掛載毛玻璃懸浮操作列，提供「🖼️ 複製 PNG（2x 高解析透明點陣圖，可直接貼入 Slack、Notion、PPT、Word）」、「📋 複製代碼」、「📐 複製 SVG」與「💾 下載 PNG」，具備即時動畫回饋與雙語 Toast 提示。
- **ECharts 動態圖表渲染**：支援在 Markdown 中撰寫 `echarts { JSON }`  程式碼區塊，即時渲染互動式餅圖、折線圖、柱狀圖等 ECharts 圖表。
- **自動 `[TOC]` 文章目錄**：插入 `[TOC]` 標籤自動掃描文件標題階層（`#` ~ `###`），生成可點擊平滑跳轉的索引目錄。
- **二欄／三欄多欄版面**：工具列一鍵圈選文字生成 `<div class="two-column-layout">` 或 `three-column-layout` 橫向多欄排版（手機自動切換單欄）。
- **多媒體網址自動預覽**：自動將 YouTube 連結轉為隱私保護播放器、PDF 轉為嵌入式閱覽器、MP4/MP3 轉為原生播放器。
- **四種固定筆記格式與建立入口 (Markdown / Block / Canvas / Whiteboard)**：Footer 最左側的「＋ 新增」選單支援建立 [Markdown 筆記](https://wiki.david888.com/new/markdown)、[Block 筆記](https://wiki.david888.com/new/block)、[Canvas 畫布](https://wiki.david888.com/new/canvas) 或 [Excalidraw 白板](https://wiki.david888.com/new/whiteboard)。建立後格式鎖定；Markdown 保留可攜純文字工作流，Block 提供可編輯內容區塊，Canvas 專注 2D 空間卡片與關係線，Whiteboard 則提供自由手繪草圖、塗鴉與便籤。
- **🎨 Canvas v2 畫布整體架構 (Canvas v2 with Ameliorate Architecture &amp; JSON Canvas)**：專為空間視覺化思考與卡片盒筆記（Zettelkasten）打造的第三種原生模式 (`editorFormat: 'canvas'`)。全面升級為 Canvas v2 架構，深度對齊開源專案 **Ameliorate**（`0cacee5577438979b651dd808793c4cbd13864ee`，MIT License，版權致謝於 `THIRD_PARTY_NOTICES.md`）：
  - **Ameliorate 思考節點與精緻低彩度色票**：卡片左上角內嵌典雅的類型標籤（`Problem`, `Benefit`, `Solution`, `Cause`, `Criterion`, `Detriment`, `Question`, `Note`），圓角貼合卡片外緣。依據 Frontend Design 與 Impeccable 準則重構為低彩度色票（文字對比度 ≥ 5.5:1～8:1，符合 WCAG AA/AAA），搭配純淨白底卡片與細緻 1px 邊框（`#e2e8f0`），徹底告別高飽和熒光刺眼感。
  - **全套 Lucide 向量圖示庫**：整合 `lucide-react`，全面取代系統 Emoji 與方塊字符，卡片角標、頂部快捷列（複製、刪除、色彩）、置底主工具列（新增、復原、重做、適應、檔案）、右上懸浮膠囊（多語、語音、書本）與連線工具列全面換裝為洗鍊的 Lucide SVG 向量圖示。
  - **高對比連線、動態箭頭與雙向錨點 (`CanvasEdge` &amp; `EdgeToolbar`)**：連線採用高對比深石板灰（`#475569`，2px 線寬，選取時高亮為 2.5px 寶藍 `#2563eb`），四邊錨點（上右下左）重構為雙向 Handles（同時具備 source 與 target），確保 React Flow 100% 正確繪製平滑貝茲曲線 (`getBezierPath`) 並完整渲染 `markerEnd` 箭頭；關係文字預設為乾淨無標籤（點擊選取或雙擊才顯示標籤輸入），杜絕浮空膠囊；選取時透過 React Flow 原生 `EdgeToolbar` 門戶彈出連線面板，自動避讓視口邊界與窄螢幕 (320px) 碰撞。
  - **右上角懸浮操作膠囊 (`TopFloatingBar`)**：畫布右上角提供玻璃擬態快捷膠囊，支援多語切換、Web Speech 語音朗讀選取卡片內容與書本閱讀模式。
  - **本機草稿恢復、純淨空白與公開分享自動探測**：畫布先載入伺服器端 `#contents`，若 IndexedDB 有較新的 `draft`／`pending` Canvas 草稿，重新整理後會安全載回、重新適應視口並提示使用者；未發布筆記的草稿仍以本機 IndexedDB 為保存範圍，發布或已發布筆記的 autosave 才會同步雲端。新建畫布以純淨空白起始 (`{ nodes: [], edges: [] }`)，杜絕任何強制模板；公開分享頁面 (`/share/:shareId`) 具備內容格式自動探測與快取穿透版本號，無縫呈現唯讀畫布。底層相容 JSON Canvas 規範（`text`、`file`、`link`、`group` 節點與 `edges`），透過 `model/jsonCanvasAdapter.mjs` 完整保留未識別之 Root Metadata、Node/Edge 自訂屬性與 `david888` 擴充，確保 round-trip 100% 無損。
  - **即時同步與安全 Flush**：Store 異動立即同步寫入底層表單 `#contents.value`，徹底消除 300ms 防抖儲存與離頁（`pagehide`、`beforeunload`、`visibilitychange`）及發布競態；全域提供 `window.canvasBridge.flush()`。
  - **順暢卡片拖曳、縮放與雙擊行內編輯**：單擊卡片立即獲得焦點並可隨意拖曳移動，邊緣 8 點可任意縮放尺寸並納入 Zustand 交易歷史（支援 Cmd+Z/Cmd+Shift+Z 復原重做）；雙擊卡片或點選編輯按鈕無縫進入等寬行內編輯，按 Esc 或 Cmd+Enter 即刻儲存。
  - **導航控件、視口中心建立與檔案操作**：內建 React Flow `Controls`（縮放、適應視圖、鎖定）與右下角 `MiniMap` 小地圖；置底工具列 (`MainToolbar`) 新增選單依 Ameliorate 思考框架提供 8 款思考節點，點選自動定位於當前視口中心並具備碰撞位移防重疊；檔案選單支援 `.canvas` 匯入、匯出與可隨時 Undo 復原的「清空畫布 (`clearDocument`)」。
  - **圖片與多媒體檔案資源節點 (`AssetNode`)**：新增專屬「圖片／檔案資源」卡片入口與全畫布拖曳上傳支援。圖片自動存入 R2，音訊、影片與文件自動透過多層容錯的 888box API 上傳。符合 JSON Canvas 1.0 標準，以標準 `type: 'file'` 儲存並在 `david888.asset` 紀錄檔名、大小與 MIME 類型；卡片依檔案類型自適應渲染圖片預覽、音訊播放器、影片播放器或附帶一鍵下載的文件卡片，支援四邊連線、縮放與替換操作。
  - **LLM Agent Canvas 工具與 Book 模式相容**：WebMCP 原生提供 `validate_canvas`、`write_canvas`、`read_canvas`，REST API 透過 `editorFormat: 'canvas'` 接收完整 JSON Canvas 文件，並回傳可供人員驗收的 `shareUrl`。Agent 遇到關係圖、架構圖、概念圖或卡片關聯需求時可直接建立 Canvas；Markdown Book 章節清單加入 Canvas 路徑或 Share URL 後，`/book` 會以唯讀互動 Canvas 載入該章節。Skill、OpenAPI、`llms.txt` 與 `llms-full.txt` 均同步提供契約。
  - **純淨無包袱架構與獨立隔離樣式**：徹底拔除舊版 Canvas 遺留代碼與本機降級開關，自動清除殘留之 localStorage 標記，純淨運作於 Canvas v2；樣式獨立於 `static/js/canvas-v2/canvas-v2.css` 與語意化 `tokens.css`，零污染核心筆記佈局，支援 20 款主題與深淺色模式，唯讀分享模式鎖定座標防誤觸。
  - **P1／P2 互動能力**：支援畫布框選多選、多卡片拖曳、批次換色／刪除、Cmd／Ctrl+F 搜尋、SVG／PNG 匯出、從 Markdown `[[WikiLink]]` 產生關聯圖，以及右上角 Camera Tour 導覽。
  - **Canvas 標題編輯**：畫布左上方可直接修改筆記標題，儲存後同步瀏覽器分頁標題、note metadata 與公開分享頁。
  - **新增選單欄位對齊**：Thought Nodes 與六個 Extensions 項目共用固定 icon 欄與左側文字基準線，支援中英文標籤與窄螢幕選單捲動。
- **🎨 Excalidraw 自由手繪白板模式 (`editorFormat: 'whiteboard'`)**：
  - **雙軌畫布分流 (/new/whiteboard)**：引入官方 `@excalidraw/excalidraw@0.18.1` React 組件，打造第四種原生格式。Canvas 專注邏輯關聯與架構圖，Whiteboard 專注自由手繪、線條塗鴉、幾何圖形與便籤。
  - **100% 官方標準封裝**：零發明客製畫布組件，採用 esbuild 打包至 `static/js/whiteboard-editor.bundle.mjs` 與 `bundle.css`，字型由 unpkg CDN 動態載入。
  - **資料相容與唯讀分享**：狀態透過 `#contents.value` 防抖同步，完整保留 Excalidraw JSON (`elements` 與 `appState`) 於 D1/KV 資料庫，無需更改 schema；分享頁 (`/share/:id`) 自動呈現唯讀手繪畫布 (`viewModeEnabled: true`)，支援 20 款深淺主題切換與 PNG/SVG 高清匯出。
  - **LLM Agent WebMCP 與 REST API**：原生提供 `validate_whiteboard`、`write_whiteboard`、`read_whiteboard`，REST API 透過 `editorFormat: 'whiteboard'` 接收完整 Excalidraw 文件；自動提取文字投影供搜尋與 LLM 讀取。
- **Block 區塊編輯與即時錄音**：Block 筆記使用 BlockNote，內建游標左側的 `＋`、拖曳把手、slash menu、浮動格式工具列與行動版介面。支援 `/record`、`/錄音` 斜線指令與底欄選單一鍵啟動「🎙️ 即時錄音」，透過靈動島懸浮 HUD 即時計時並自動經由 Whisper AI 轉錄為文字區塊。可插入圖片、連結、YouTube、PDF、音訊、檔案、Mermaid、ECharts 與 Raw HTML；嵌入區塊可直接編輯，網址與圖表 JSON 會先驗證。既有筆記仍以原本 Tiptap JSON 格式保存，分享頁與 API 完全相容。Block 編輯頁支援 PNG、HTML、PDF／列印匯出；Markdown 匯出保留在 Markdown 編輯頁。
- **雙欄小訣竅與打字機歡迎畫面 (Split Welcome View & Parallel Typewriter)**：建立新筆記時，左側編輯區專注呈現泰戈爾《飛鳥集》中英詩句，右側預覽區則獨立呈現隨機精選寫作技巧（`#preview-welcome`），雙欄平行展開流暢打字機動畫，作者開始打字時兩側自動淡出隱藏。
- **可及性的對話視窗**：所有編輯器對話視窗都具備正確 dialog 語意、Tab 焦點鎖定、關閉後回到原觸發按鈕與 Escape 關閉行為；系統設定「減少動態效果」時，介面會停用不必要的動畫。
- **網址轉 Markdown 剪藏 (URL to Markdown Clipper)**：Footer「＋ 新增」選單內建「從網址匯入」功能。貼上任意公開網頁網址，即由 Worker 後端 API (`/api/url2md`，具備 `http://2md.aiurl.tw/` 主服務與 `2md.glsoft.ai` / `create360.ai` 三層 Failover 備援) 擷取文章標題與乾淨的 Markdown 內文，可選擇插入/取代目前編輯器或自動新建筆記。
- **瀏覽器端多格式文件匯入**：Markdown 編輯器的 Footer「匯入」與「＋ 新增」選單可直接讀取 Markdown、Word、PowerPoint、Excel、OpenDocument、RTF、EPUB、CSV 與文字型 PDF，於瀏覽器內轉為 Markdown。既有文章可選擇「插入游標處」、「取代內容」或取消；取消不會載入或執行轉檔器。轉檔使用同網域受控的 WebAssembly 靜態資產，文件內容不會上傳至 Wiki 伺服器。
- **命令列轉檔發布**：[`scripts/doc2wiki.sh`](../scripts/doc2wiki.sh) 可將本機文件轉為 Markdown 後發布到指定 Wiki path；預設為私有，僅在明確傳入 `true` 時公開，且只輸出可分享的 `shareUrl`。
- **🔍 編輯器全功能搜尋與取代 (Search & Replace)**：按 `Cmd+F` (Ctrl+F) 立即呼叫懸浮搜尋列，按 `Cmd+H` (Ctrl+H) 展開取代面板，亦可透過工具列「🔍」開啟；支援即時匹配筆數 (`3 / 15`)、`Enter` / `Shift+Enter` 上下筆導覽、大小寫區分 (`Aa`)、全字匹配 (`\b`)、正規表達式 (`.*`)、單筆取代與全部取代。
- **🖍️ 螢光筆高亮語法 (`==text==`)**：支援 HackMD 標準 `==螢光筆文字==` 語法，渲染為柔和黃色 `<mark class="markdown-highlight">` 標籤，適配 20 款深淺主題；工具列提供「🖍️ 螢光筆 (HL)」快捷按鈕。
- **🎨 自訂文字與背景顏色語法 (`[color=...]`, `[bg=...]`)**：支援 `[color=red]文字[/color]`、`[bg=yellow]文字[/bg]` 以及複合標籤 `[color=#3b82f6 bg=#eff6ff]文字[/color]`，靈活強調重點排版。
- **🔢 程式碼區塊行號與檔名標籤**：支援起始行號 ```` ```js= ```` (第 1 行起) 或 ```` ```js=10 ```` (指定行號起)，以及檔案名稱標籤 ```` ```js [app.js] ```` 或 ```` ```js=1 [server.mjs] ````，自動生成獨立行號槽與檔名 Header。
- **📋 程式碼區塊一鍵複製按鈕**：所有程式碼區塊自動掛載一鍵複製按鈕，點擊提供即時狀態反饋與 Toast 提示。
- **💬 GitHub Alert 提示區塊自動補完與工具列**：行首輸入 `> [!` 即時彈出 NOTE、TIP、IMPORTANT、WARNING、CAUTION 快速選單，支援鍵盤導覽與 Enter 插入；工具列同步提供「⚠️ GitHub 提示區塊」按鈕。
- **📖 書本模式 (Book Mode - `/share/:id/book`)**：在任何包含章節清單連結的筆記進入書本模式，自動解析左側樹狀目錄欄（支援章節搜尋過濾、層級收折、當前章節高亮），支援**滑鼠與觸控拖拉調整側邊欄寬度（Splitter Resizer）**，自動保存寬度偏好並支援雙擊重設（290px）；右側採用高規格原生嵌入渲染（`?embed=1`），零秒極速切換章節，頂部提供導覽列與快捷鍵（`[` 上一章、`]` 下一章），**支援 PWA 一鍵離線預抓快取整本書**與**三合一多格式匯出（合併 Markdown、單一離線 HTML 電子書、列印 PDF）**，行動版也能安全匯出離線 HTML。
- **📽️ 簡報模式 2D 矩陣升級 (Vertical Sub-Slides `--` & YAML)**：橫向投影片使用 `---`，縱向深入子投影片使用 `--`；支援方向鍵四向導覽（`↑` `↓` `←` `→`）與大綱總覽（`O`）2D 矩陣縮圖，文首支援 YAML 宣告自訂轉場效果（`fade`, `slide`, `zoom` 等）。
- **📊 Excel / Google Sheets 複製貼上自動轉 Markdown 表格**：在編輯器直接貼上來自 Excel、Google Sheets、Numbers 或網頁選取的表格，自動秒轉為標準對齊的 Markdown 表格（`| ... |`），並修復選取範圍後半段造成的貼上錯誤。
- **📝 論文級雙向註腳與毛玻璃預覽 (`[^1]` / `^[...]`)**：支援標準註腳 `[^1]` 與 Pandoc/HackMD 行內註腳 `^[說明]`，自動進行數字編號與文末清單聚合；游標懸浮註腳編號立即彈出毛玻璃卡片（Hover Popover）預覽註釋內容，點擊平滑雙向跳轉（`↩` 一鍵返回內文定位點），修復深層錨點與文章目錄 (`[TOC]`) 乾淨排版；工具列提供「插入註腳 ([^1])」快捷按鈕。
- **📂 多格式拖曳匯入與智慧分流 (Drag & Drop File Handling)**：直接將檔案拖曳進 Markdown 編輯器：
  - **PDF 文件**：彈窗智慧分流「📑 AnyDocs 本地轉檔為 Markdown」或「☁️ 上傳至 888box 作為附件連結」。
  - **音訊檔案**：彈窗提供三合一選項，預設「🎙️ 匯入音訊（逐字稿）」，亦可選擇「✨ 匯入音訊（智慧排版）」或「☁️ 上傳至 888box 嵌入 `<audio controls>` 播放器」。
  - **圖片檔案**：直傳 Cloudflare R2 並在游標處插入 `![alt](url)`。
  - **Office / Markdown 文件**：支援 DOCX/PPTX/XLSX WASM 本地轉檔或 888box 上傳；拖曳 `.md`/`.txt` 提示游標插入或全篇替換。
- **🎙️ 工具列錄音與逐字稿 (Toolbar Recording & Transcript)**：Markdown 編輯器頂部提供麥克風控制，可開始、暫停、繼續與停止錄音。完成的 WebM 錄音先存入瀏覽器 IndexedDB 並插入本機播放器；連線後轉錄依序嘗試 Groq `whisper-large-v3`、Groq Turbo，再回退至 Cloudflare Workers AI Whisper。發布／同步時，音訊附件會上傳至外部 888box 服務並將本機播放器網址換成永久 HTTPS 網址。錄音上限為 25 MB，開始前必須確認所有參與者同意錄音。
- **🔑 管理員 Touch ID / FIDO2 指紋一鍵登入 (Admin Passkey & Touch ID)**：後台登入介面支援 WebAuthn / FIDO2 生物辨識一鍵刷指紋進入；後台支援隨時綁定新裝置（Mac Touch ID、iPhone Face ID、Windows Hello）與管理憑證。
- **📐 自適應緊湊行號槽與自動折行同步 (Adaptive Line Numbers Gutter with Auto-Wrap Sync)**：行號區塊採用動態寬度計算（1~99 行超緊湊 ~26px，並隨百行、千行、萬行平滑動態擴展），搭配 13px 輔助字號與垂直精準像素對齊；獨家內建**長行折行高度鏡像同步 (Mirror DOM Line Height Sync)**，超長段落自動對齊行首，視窗縮放或雙欄調整時即時重新量測，確保行號與文字內容 1:1 精準對齊。
- **🎨 全面深色模式與標準化彈窗 (Unified Modal Architecture & Full Dark Mode)**：全站彈出視窗（`.share-modal`, `.embed-modal`, `.url-import-modal`, `#cite-modal`, `#math-format-modal`, `.password-modal`, `.note-history-modal`, `.app-dialog-modal`, `.file-drop-modal`）全面導入標準化 Design System，統一採用 `--modal-*` CSS 變數適配 20 款深淺主題；內建全域 Escape 鍵關閉、Tab 焦點鎖定 (Focus Trap)、`data-modal-close` 事件委派與無障礙關閉按鈕。
- **字體與 20 款主題**：預設繁中 `GenJyuu Gothic` 與程式碼 `Maple Mono` / `JetBrains Mono`。Footer 提供 20 款 CSS 主題（預設 `claude-canvas`）與寬度切換；編輯器預設固定為桌面預覽（100% 全寬度），並支援隨時切換左右／上下分割與桌面／手機模式。
- **⚡ 即時動態標題同步 (Real-time Dynamic Title Sync)**：在編輯器內輸入或修改 `# 標題` 時，瀏覽器分頁標籤（`<title>`）與全域應用狀態即時同步更新，無需重新整理頁面。同時強化後端標題提取器，優先抓取 `# Title` 並自動跳過前置 `[TOC]`、提示區塊與寒暄前綴。
- **卡片化分組發布與分享選單 (Card-Grouped Share Menu)**：點擊底部分享按鈕彈出的浮動選單全面採用結構化卡片分組（`.dropdown-group-card`），明確劃分「檢視閱讀模式」（打開分享頁面、簡報模式、書本模式）、「快速複製連結」（複製分享網址、簡報網址、書本網址）、「分享設定」（公開索引、段落註解開關）與「取消發布」。每一條目皆具備統一的呼吸間距、清晰的標題與補充目的地說明，避免標題和副標題重複；Edit、Share、Block Edit 的 New／Export／Copy／Theme／Width 選單共用完整對齊的 hover/focus 表面，並支援長選單依視窗高度滾動，100% 完美相容 20 款深淺主題。
- **整合式發布設定與狀態列**：發布對話窗集中設定「發布、自動儲存、公開索引」，預設三項全開並記住這台裝置的選擇。發布後，Edit 預覽上方會顯示分享 URL、公開索引、保留版本、不重複瀏覽與最後儲存時間；深色介面下狀態列與底部控制列會使用一致的高對比冷色系，並以青藍、亮藍、靛藍與紫藍區分發布、版面、字體與語言操作。
- **🔒 Seal 存取控制與 10 款快速情境範本 (Seal Access Control, 10 Quick Start Presets & Security Hardening)**：
  - **正交存取控制核心哲學 (Orthogonal Access Control Philosophy)**：借鑒 888box (`box.david888.com/seal/`) 架構，將內容機密性與釋出生命週期徹底解耦——「**密碼保護內容，Seal 控制何時或如何釋出**」。無論筆記是否已設定編輯密碼或閱讀密碼，均可獨立加蓋或解除 Seal；建立或解除立即生效。
  - **4 種進階釋出控制模式**：
    - **定時解鎖／時間膠囊 (Time-Locked Capsule)**：封印機密內容至指定日期時間釋出。訪客檢視時返回 423 狀態碼並顯示 `David888 Wiki / Seal` 深色品牌卡片與即時跳動倒數計時器（日、時、分、秒）；作者享有專屬預覽橫幅與提前解封調整權限。
    - **閱後即焚 (Burn-After-Reading / Ephemeral)**：公開分享達自訂瀏覽上限（預設 1 次）後，分享連結會永久銷毀；作者原始筆記仍保留在 Wiki。兩階段確認揭示卡可避免連結預覽爬蟲消耗瀏覽次數；作者編輯與預覽不計次。分享銷毀後訪客會看到 410 墓碑頁。
    - **亡者開關／保活心跳 (Dead Man's Switch)**：在作者定期打卡保活期間持續維持機密封印（支援自訂分鐘數或快捷晶片 1 天、3 天、7 天、14 天、30 天等）。作者編輯存檔、在 Seal 彈窗點擊「⚡ 立即簽到保活 (Pulse)」或透過私有 Webhook (`/api/shares/:id/pulse?token=...`) 刷新心跳；若作者超期失聯未簽到，保險庫自動對外公開並展示解封橫幅。
    - **標準發布與保留期限 (Standard & Expiration)**：自訂分享過期時間（10 分鐘、1 小時、1 天、7 天、30 天或永久），結合 Cloudflare KV 原生 TTL 與 Worker 雙重檢查，到期自動下架並返回 410 友好墓碑頁。
    - **底欄獨立入口與極簡分享選單**：底欄右側提供獨立「🔒 Seal」按鈕（`#vault-presets-toolbar-btn` / `.seal-toolbar-btn`），當筆記已加蓋 Seal 時點亮青色圓點指示燈（`.seal-dot-indicator`）；分享選單徹底移除舊版冗餘之保險庫下拉選單，回歸極簡專注，僅以單列動態展示「🔒 Seal 存取控制」即時狀態。
    - **精美卡片式彈窗與三欄式網格排版 (3-Column Grid & Dedicated Scroll)**：支援電腦版三欄網格、平板雙欄與手機單欄自適應；右上角關閉鈕與雙語切換分離絕不重疊；情境卡片去除重複徽章贅詞更清爽緊湊；內建內部捲軸與固定底部操作列，所有範本均可輕鬆檢視。全數採用官方 Lucide SVG 向量圖標，頂部展示即時狀態徽章（未設定、定時解鎖、閱後即焚、亡者開關），支援中／英雙語切換、快捷晶片（`+1h`、`+1d` 等）以及一鍵「解除 Seal」與「建立 Seal」。
    - **10 款快速情境範本**：純釋出參數配置，點選自動代入最佳 Seal 模式與釋出參數，**嚴格不修改、不注入任何筆記內文**：
      1. **一次性密碼 (One-Time Password)** (`shieldAlert`)：單次瀏覽憑據分享，1 小時到期；此範本不會產生或驗證 OTP 驗證碼。
      2. **加密資產傳承 (Crypto Inheritance)** (`bitcoin`)：亡者開關 (`deadman`)，30 天心跳，守護冷錢包與繼承指引。
      3. **吹哨揭弊保護 (Whistleblower)** (`megaphone`)：亡者開關 (`deadman`)，7 天心跳，失聯即釋出公共利益事證。
      4. **產品發布解鎖 (Product Launch)** (`rocket`)：時間膠囊 (`timelock`)，7 天後解鎖正式公告與促銷代碼。
      5. **生日驚喜禮物 (Birthday Gift)** (`gift`)：時間膠囊 (`timelock`)，1 天後 (生日當天) 揭曉驚喜兌換券。
      6. **司法保全留存 (Legal Hold)** (`scale`)：標準分享 (`standard`)，30 天後自動過期下架。
      7. **闖關尋寶線索 (Scavenger Hunt)** (`target`)：時間膠囊 (`timelock`)，1 小時後解密下一道謎題。
      8. **課程定時教材 (Course Content)** (`graduationCap`)：時間膠囊 (`timelock`)，7 天後隨課堂進度定時解鎖講義與作業解答。
      9. **緊急災備通道 (Emergency Backup)** (`lifeBuoy`)：亡者開關 (`deadman`)，14 天無簽到自動釋出應急救援 SSH 與主控台存取。
      10. **機密金鑰分享 (Shared Secret)** (`key`)：單次瀏覽 `.env` 憑據分享，1 天後到期。
  - **🛡️ 訪客鎖定頁品牌升級與嚴格安全防護 (Visitor Seal Lock Pages & Security Hardening)**：
    - 訪客封印頁採用 `David888 Wiki / Seal` 品牌深石板色高質感卡片，呈現受保護資產資訊與即時跳動的日、時、分、秒倒數計時器。
    - 實作防範雙重揭密的高併發原子鎖標記、強制閱讀密碼校驗、PDF 匯出銷毀保護、預覽過渡頁不洩漏任何機密內文、動態 UUID 隔離密鑰。
  - **全格式通用支援**：通用於 Markdown 文章、Block 筆記、Canvas 畫布、Whiteboard 白板與簡報／PDF 匯出，全格式均受 Seal 存取控制生命週期管線防護。
  - **WebMCP / REST API 完整支援**：`write_note`、`write_canvas`、`write_whiteboard` 原生支援 `seal_mode`、`seal_unlock_at`、`seal_max_views`、`seal_pulse_minutes` 參數，自動生成 pulse webhook 與到期資訊。

    ┌──────────────────────────────────────┬───────────────────────────────────┬─────────────────────────────────┐
    │ 1. 操作區 (Publish / Read Actions)   │ 2. 外觀設定區 (Appearance)        │ 3. 系統與開發者資訊區 (Info)    │
    ├──────────────────────────────────────┼───────────────────────────────────┼─────────────────────────────────┤
    │ [編輯] [匯出▾] [複製▾] [引用] [公式]   │ [字體: JB/Maple] [語系: 中/En]   │ [ GitHub ]                      │
    │ [簡報] [書本] [嵌入] [🧭 紀錄]       │ [寬度 ▾] [🎨 主題 ▾] [☀️/🌙 深淺] │ [ 📥 安裝 App ]                 │
    │                                      │ [👁️ 閱讀次數]                     │ [ ✨ Skill ] [ 📄 API ]         │
    └──────────────────────────────────────┴───────────────────────────────────┴─────────────────────────────────┘


### 📚 3. 書本模式使用與製作指南 (Book Mode Guide)

任何包含**章節清單與超連結**的 Markdown 筆記，都能一秒變身為現代化的**線上雙欄電子書**！

#### 🛠️ 如何製作一本多章節電子書（語法範例）
只要在筆記內撰寫結構化的目錄清單（支援 H3 分組與層級縮排）：

````markdown
# 📚 雲端技術手冊與架構指南 (Cloud Architecture Book)

> 本手冊收錄系統核心設計、架構規格與進階擴充功能驗收。

## 📖 目錄與章節導覽 (Book Table of Contents)

### 第一部分：核心架構概論
- [01. 系統架構與設計概念](https://wiki.david888.com/share/qt7xmd)
- [02. 編輯器擴充與排版特性](https://wiki.david888.com/extended-writing-features-demo)
  - [02-1. 深入排版細節 (子章節)](https://wiki.david888.com/share/qt7xmd)

### 第二部分：進階功能驗收
- [03. Excel 與 Google Sheets 表格自動貼上驗證](https://wiki.david888.com/share/qt7xmd)
- [04. 2D 簡報模式垂直探索展示](https://wiki.david888.com/share/qt7xmd/present)
- [05. 外部參考文獻與協議規範](https://wiki.david888.com/mcp)
````

#### 🚀 進入與操作書本模式
1. **進入網址**：在任何分享頁後方加上 `/book`（例如 `https://wiki.david888.com/share/:shareId/book`）或編輯頁加上 `/book`。
2. **左側目錄與自訂寬度**：
   - 自動解析所有章節連結與分組標題，支援**章節即時搜尋過濾**。
   - **側邊欄拖拉調整寬度（Splitter Resizer）**：滑鼠懸停於側邊欄邊緣左右拖曳即可調整寬度（180px～65% 螢幕寬度），雙擊分隔把手一鍵重設為預設 290px，寬度偏好自動記憶於瀏覽器。
3. **右側極速原生渲染（`?embed=1`）**：
   - 點擊左側章節立即載入對應文章，零秒原生渲染，KaTeX 公式、程式碼行號、Alert 提示框、Mermaid 圖表與主題樣式全數支援。
4. **翻頁與導航**：
   - 頂部提供「← 上一章」與「下一章 →」切換按鈕，支援鍵盤快速鍵 `[`（上一章）與 `]`（下一章）以及手機左右滑動翻頁手勢。
   - 頂部 `↗` 按鈕可一鍵在新分頁開啟當前章節。
   - 左上角「`← 退出書本`」可精確返回標準閱讀或編輯模式。
5. **📥 一鍵離線快取整本書 (Offline Cache)**：
   - 點擊頂部「📥 離線快取」按鈕，背景自動並行預載整本書所有章節與插圖至 Service Worker Cache，斷網或飛行模式下依然能完整閱讀！
6. **📤 三合一電子書匯出 (Multi-Format Book Export)**：
   - **📄 合併 Markdown (.md)**：一鍵整合全書所有章節為單一完整的 Markdown 檔案。
   - **🌐 單一離線 HTML 電子書 (.html)**：匯出包含雙欄目錄與所有章節內容的獨立 HTML 檔案，離線雙擊即可瀏覽。
   - **🖨️ 匯出 PDF / 列印 (.pdf)**：自動將全書章節排版並加入分頁符號，一鍵列印為 PDF 手冊。

#### 🤖 AI Agent 4 步驟自動串書工作流 (Multi-Article Book Orchestration SOP for LLMs)
當要求 AI 撰寫一整套教學、技術文檔手冊或系列課程時，LLM 應依循標準 4 步驟自主發布電子書：
1. **大綱規劃**：規劃章節架構並為各章命名語意清晰的 Path Slug（如 `ts-ch01`, `ts-ch02`）。
2. **逐篇發布章節**：透過 `write_note` 或 API 逐篇寫入發布並收集各篇的 `shareUrl`（亦可在章節中混排 `/present` 簡報模式）。
3. **建立總目錄文章 (Manifest Hub Note)**：以 Markdown 列表將所有章節連結整合為目錄文章（支援 H3 分組與 2 格縮排子章節）。
4. **交付電子書連結**：取得總目錄文章之 `shareUrl` 並加上 `/book`，回傳如 `https://wiki.david888.com/share/<hub-id>/book` 給使用者。

---

#### 🔗 實例展示與功能驗收 (Live Demo & Feature Showcase)

- 📖 **書本模式極速體驗 (Book Mode)**：[https://wiki.david888.com/share/47eqhm/book](https://wiki.david888.com/share/47eqhm/book)
- ✏️ **書本目錄編輯頁面 (Book Editor Demo)**：[https://wiki.david888.com/book-and-2d-slides-demo](https://wiki.david888.com/book-and-2d-slides-demo)
- 📖 **公開閱讀與渲染頁面 (Share URL)**：[https://wiki.david888.com/share/qt7xmd](https://wiki.david888.com/share/qt7xmd)
- 🖥️ **全螢幕 2D 簡報模式 (2D Slide Presentation)**：[https://wiki.david888.com/share/qt7xmd/present](https://wiki.david888.com/share/qt7xmd/present)
- ✏️ **編輯器進階寫作展示 (Extended Writing Kit)**：[https://wiki.david888.com/extended-writing-features-demo](https://wiki.david888.com/extended-writing-features-demo)


| 功能項目 | 語法範例 / 操作方式 | 驗收方式與效果 |
| :--- | :--- | :--- |
| **1. 📖 書本模式與拖拉側邊欄** | `/share/:id/book` | 檢視 `/share/47eqhm/book`，左側拖曳把手調整寬度，點擊章節 0 秒無縫換頁。 |
| **2. 📽️ 2D 簡報模式** | `---` (橫向) / `--` (縱向) | 進入 `/share/qt7xmd/present`，支援四向方向鍵 `↑` `↓` `←` `→` 與 `O` 矩陣總覽。 |
| **3. 📊 Excel 表格自動貼上** | 複製 Excel/Sheets 直接貼上 | 在編輯器按 `Cmd+V`，自動將剪貼簿 HTML/TSV 表格轉換為 Markdown 表格。 |
| **4. 📝 行內註腳與工具列** | `^[行內註腳內容]` 或工具列 `[^1]` | 正文撰寫 `^[說明]`，自動在文末生成編號對應註腳，懸停浮層預覽。 |
| **5. 🖍️ 螢光筆高亮** | `==螢光筆文字==` | 呈現柔和黃色高光 `<mark>`，適配淺色與 20 款深色主題。 |
| **6. 🎨 自訂字體/背景色** | `[color=red]...[/color]`<br>`[bg=yellow]...[/bg]` | 支援 Hex, RGB, CSS 色彩與 `[color=... bg=...]` 複合標籤。 |
| **7. 🔢 行號與檔名標籤** | ```` ```js=1 [server.mjs] ```` | 程式碼頂部渲染檔名 Header，左側生成防圈選獨立行號槽。 |
| **8. 📋 程式碼一鍵複製** | 自動掛載於 Code Header | 點擊程式碼區塊右上角的「📋 複製」，顯示綠色打勾反饋。 |
| **9. 💬 GitHub Alert 提示** | `> [!NOTE]` / `> [!TIP]` 等 5 種 | 顯示 Note、Tip、Important、Warning、Caution 提示框。 |
| **10. 📖 維基百科腳註懸停** | `[^1]` 與 `[@lamport78]` | 滑鼠移至標號上方，即時就地彈出毛玻璃懸浮卡片。 |
| **11. 🔍 編輯器搜尋與取代** | `Cmd+F` (搜尋) / `Cmd+H` (取代) | 按下快捷鍵開啟懸浮面板，支援即時匹配計數、正則與單筆/全部取代。 |
| **12. ⚡ Alert 自動補完選單** | 行首鍵入 `> [!` | 自動彈出 5 種 Alert 類型下拉選單，方向鍵與 Enter 快速插入。 |

---

### 🔐 3. 隱私、版本控制、簡報與劃線互動

- **雙重密碼鎖定 (Edit Lock vs View Lock)**：獨立設定「編輯鎖」（限制修改）與「閱讀鎖」（限制閱讀），均以 Salted MD5 雜湊保護。
- **D1 歷史版本快照**：Cloudflare D1 自動儲存 10 份版本快照（5 分鐘防刷節流），提供對比、還原與複製。
- **簡報模式 (Slidev-Lite 2.0 演示)**：使用 `---` 進行 Markdown 分頁，一鍵轉換為 16:9 專業投影片簡報。支援 KaTeX 數學公式、Mermaid 流程圖、ECharts 圖表即時繪製；配備底部快捷懸浮導覽列（大綱 Overview、數位雷射筆 `L`、黑屏暫停 `B`、全螢幕 `F`、頁碼跳轉）；深度繼承 20 款主題色彩與字型；支援封面頁 (`<!-- layout: cover -->`)、雙欄/三欄版型、自訂背景與程式碼逐行高亮；支援一鍵匯出 PDF 簡報與單張 Slide 圖片。

  ![Markdown 以主題樣式呈現為簡報](../orca-paste-1787127752557-b13cd284-bb9c-450a-8846-cff0c9992951.png)
- **全能導出與多目標複製矩陣 (`[ ⭳ 匯出 ▾ ]` & `[ 📋 複製 ▾ ]`)**：
  - **檔案導出 (`[ ⭳ 匯出 ▾ ]`)**：
    - **長圖導出 (.png)**：動態載入 `html2canvas`，以 2x Retina 高解析度輸出完整文章長圖。
    - **純 Markdown 檔案 (.md)**：一鍵下載原始 Markdown。
    - **單一離線 HTML 網頁 (.html)**：打包當前選定樣式與 KaTeX 字型，收件者隨點隨看。
    - **另存 PDF / 列印預覽**：最佳化 A4 列印排版與無邊界 PDF 輸出。
  - **多目標剪貼簿複製 (`[ 📋 複製 ▾ ]`)**：
    - **一般富文字 (Rich Text)**：內嵌排版樣式與表格，可直接貼入 Word、Google Docs、Apple Notes、Email。
    - **純 Markdown**：乾淨原始碼，適合貼入 Obsidian、VS Code、GitHub、ChatGPT。
    - **Notion 相容格式**：公式相容 `$$...$$`，貼上自動轉為 Notion 區塊。
    - **Jira / Confluence**：自動轉換為 Jira Wiki 標記語法（`h1.`、`{code}`、`{quote}`、`||` 表格）。
    - **飛書 / Lark**：相容飛書雲文檔排版與公式結構。
    - **複製長圖 (Image)**：2x 高解析度透明 PNG 寫入剪貼簿。
    - **學術與文獻引用 (Cite)**：一鍵產生並複製 **APA (7th)**、**IEEE**、**BibTeX (LaTeX/Zotero)**、**MLA (9th)**、**Markdown 超連結/腳註** 或 **Chicago (17th)** 引用代碼。
- **📜 學術與技術文獻引用產生器 (Cite Modal)**：
  - 在分享頁底欄提供獨立「引用」按鈕與「複製」選單捷徑，彈出專屬 Cite Modal。
  - 即時抓取文章標題、作者、網站與發表時間，支援 6 大主流學術格式一鍵切換與複製。
- **📖 維基百科式腳註懸停預覽 (Footnote Popover) 與 Pandoc 引用語法 (`[@key]`)**：
  - **懸停預覽**：滑鼠懸停於正文腳註 `[^1]`、`[^key]` 或引用標籤 `[@key]`，就地彈出毛玻璃卡片即時閱讀文獻內容，無須跳頁滾動。
  - **Pandoc 語法**：支援 `[@smith04]`、`[@doe2023, p. 42]`、`[@key1; @key2]` 與 `@smith04 [p. 10]`，自動對應腳註、BibTeX 或文獻清單。
- **KaTeX 數學公式點擊複製 (7 種格式) 與智慧貨幣金額保護**：
  - 點擊分享頁或預覽中的任一 KaTeX 數學公式即刻複製到剪貼簿。
  - 提供專屬設定選單（`fx` 按鈕），支援 7 種格式：自動判斷 (Auto)、LaTeX (含 $)、LaTeX 純文字 (無 $，適合 Desmos/WolframAlpha)、Notion (雙 $)、MathML (貼入 Word 轉為原生方程式)、PNG 圖片、SVG 向量。
  - **💵 智慧貨幣保護 (Smart Currency Protection)**：自動辨識筆記與帳單中的貨幣金額（如 `$10.00`、`$0.32`、`$3.87`、`NT$100`、`US$50`、`$10-$20`），嚴格遵照 Pandoc 規範防範單 `$` 貪婪匹配，徹底解決金額之間的文字被誤判為公式、吞噬 `**` 粗體標籤的渲染問題；同時 100% 完美保留真實 LaTeX 數學公式（如 `$E = mc^2$`、`$10$`、`$1 + 1 = 2$`、`$10 < x < 20$`）。
- **Share 模式「編輯 / 新增」分割膠囊鈕與外觀深淺模式直覺分組**：
  - **分割複合膠囊鈕 (Split Action Capsule in Share Mode)**：在 Share 閱讀頁面底欄左側，將「返回編輯」與「＋ 新增」整合成現代化分割膠囊。左側為「`✏️ 編輯`」主動作，右側為「`＋ ▾`」延伸選單（含「編輯目前這篇筆記」、新增 Markdown、新增 Block 與多格式匯入），大幅節省水平排版空間。
  - **最近分享紀錄 (Recent Shares in Share Mode)**：在 Share 閱讀頁面底欄提供「`最近分享紀錄`」按鈕，訪客與作者皆可在閱讀時隨時開啟彈窗，自由在「我分享的」與「我看過的」分頁切換並快速複製網址。
  - **外觀與深淺主題統一歸類 (Appearance Group)**：底欄「深淺模式切換按鈕 (`☀️/🌙`)」歸入「外觀設定區」，與 20 種 Markdown 主題、預覽寬度、字體與語系切換並列；底欄「資訊區」專注於 GitHub、App 安裝、Agent Skill 與 API 開發者文件。
- **🌐 編輯器偏好選擇彈窗「即時雙語切換」支援 (Interactive En/中 Language Switcher)**：
  - 在「選擇你的編輯方式 (`EDITOR_PREFERENCE_MODAL`)」彈窗右上角提供「`中 / En`」即時語言切換鈕，外國訪客可一鍵切換英文，標題、說明與卡片即刻轉換，並同步記住語系設定。
- **Share 模式圈選文字浮動工具列與 AI 原位小卡**：
  - 讀者在分享頁圈選任意文字，即刻彈出流暢的毛玻璃膠囊浮動工具列（`.selection-action-toolbar`）。
  - **📋 複製**：一鍵複製選取內容至剪貼簿。
  - **🌐 翻譯**：自動辨識語系進行中英雙向 AI 翻譯，並在原位小卡（Inline Popover）展示譯文與一鍵複製。
  - **💬 註解**：一鍵開啟段落劃線討論側邊欄，支援連續多段劃線發起討論與平滑自動聚焦捲動，免重新載入頁面即可流暢連續註解。
- **段落劃線註解與就地預覽 (Inline Popover & Deep Link)**：

  ![公開 Markdown 筆記與段落註解側欄](../orca-paste-1787127786636-d3cf3fb4-c057-41ef-8c77-9fa2db22a43e.png)
  - 讀者可在分享頁劃線進行段落討論與「複製精準連結」，開啟時會自動跳轉並高亮指定段落。
  - **連續劃線討論 (Continuous Annotations)**：圈選並送出留言後，工具列隨選即用，側邊欄留言框自動平滑捲動至視窗範圍內，支援連續多段劃線發起不同討論串。
  - **桌機 Hover 預覽**：滑鼠懸停劃線段落即時彈出迷你浮層（Tooltip），快速瀏覽最新留言與作者。
  - **手機 Tap 喚起**：觸控輕點劃線段落彈出原位小卡或一鍵拉起底部抽屜討論區，並自動滾動與閃爍聚焦對應卡片。
  - **🗑️ 留言自行刪除與作者管理**：訪客可自行刪除自己在此裝置發布的留言（HMAC Token 鑑權，無法刪除他人留言）；文章擁有者（持有編輯權限）具備全域管理刪除權限。
- **📄 原生向量 PDF 直接導出引擎 (Native Vector PDF Export)**：
  - **Chromium-Free 毫秒級向量編譯**：整合基於 Rust/WebAssembly 的向量排版引擎，免啟動 Chromium 即可直接在邊緣端將 Markdown 編譯為高解析度向量 PDF。
  - **一鍵直接下載**：編輯模式匯出選單提供「🚀 直接導出 PDF (.pdf)」，點擊直接下載完整檔案，不再彈出繁瑣的瀏覽器列印視窗；同時保留「🖨️ 瀏覽器列印預覽 (Print)」雙軌選項。
  - **Mermaid 向量架構圖與流程圖轉譯**：無論是瀏覽器編輯匯出或 headless API 請求，Mermaid 代碼區塊皆自動轉譯為清晰的向量 `<svg>` 嵌入 PDF，不再輸出原始文字碼。
  - **自動字型子集與 Emoji**：自動按需下載 Google Fonts (`Noto Sans TC`, `JetBrains Mono`, `Inter`) 字型子集，完美支援繁體中文、日韓文與 `twemoji` 向量圖示，零破圖零亂碼。
  - **全書 PDF 編譯**：電子書手冊模式 (`/share/:shareId/book`) 支援一鍵將全書所有章節合併編譯為完整 PDF 電子書。
  - **REST API 與 MCP 端點**：提供 `POST /api/pdf/export`（支援 `markdown` 與 `html`）、`GET /:path/export/pdf`、`GET /share/:shareId/export/pdf` 與 MCP `export_pdf` 工具。
- **PWA 獨立應用、Web Share Target、跨裝置檔案關聯、衝突比對與全功能離線工作站 (PWA Offline Workstation)**：
  - **可安裝與桌面無縫整合 (Standalone & Window Controls Overlay)**：支援 macOS、Windows、iOS、Android 瀏覽器安裝為獨立 PWA 應用程式，桌面版支援 Window Controls Overlay 沉浸式頂部整合。
  - **跨裝置與 Android 檔案關聯 (File Handling & WebAPK Intent)**：作業系統（macOS Finder、Windows 檔案總管）或 Android 檔案管理員中點擊 `.md` / `.markdown` / `.txt` 檔案，可直接以 `wiki.david888.com` 開啟並載入編輯！
  - **Web Share Target API**：可在手機或電腦的其他 App（如瀏覽器、社群媒體、檔案管理器）透過系統「分享」選單，直接將網頁連結與文字一鍵分享至 david888 wiki 建立新筆記。
  - **雲端版本衝突可視化比對 (Visual 3-Way Conflict Diff)**：連線同步時若偵測到雲端已被其他裝置修改，自動彈出 Diff 對照視窗，提供「保留本機（覆蓋雲端）」、「採用雲端版本」與「另存衝突副本」三種彈性選擇。
  - **全功能雙欄 Markdown 離線工作站 (`/_pwa-offline`)**：斷網時自動啟用獨立離線工作站，提供「✏️ 編輯 / 🌗 雙欄 / 👁️ 預覽」模式切換、Dark/Light/Tokyo Night/Dracula/Nord 主題切換、即時搜尋過濾、筆記管理、獨立「⭳ 導出 HTML」網頁與一鍵 JSON 備份/匯入。
  - **即時 Markdown-to-HTML 預覽與離線格式工具列 (Live Preview & Markdown Toolbar)**：內建離線格式工具列（粗體、斜體、螢光筆、H1-H3 標題、引用、行內/區塊代碼、清單、表格、超連結、圖片、GitHub Alert 提示框、雙欄佈局），注入完整 Markdown CSS 排版樣式（`.markdown-body`）與雙向捲動同步，支援 `Cmd+B`、`Cmd+I`、`Cmd+K` 與 `Tab` 縮排。
  - **Service Worker v6 智慧快取與 CDN 動態攔截 (Stale-While-Revalidate & CDN Caching)**：全面升級至 `v6`，預先快取核心 Markdown 渲染管道（`marked`、`purify`、`markdown-extensions`、`media-preview`），並自動動態快取外部 CDN 依賴（`esm.sh`、`cdn.jsdelivr.net`、`cdnjs.cloudflare.com`）與 R2 圖床媒體庫，離線閱讀圖文筆記零破圖。
  - **Local-First 本機離線錄音、Dynamic Island 懸浮提醒膠囊、連線 ASR 轉錄與發布時 888box 附件同步 (Local-First Offline Audio Recording, Dynamic Island Recording HUD, Online ASR & Deferred 888box Upload)**：
    - **Dynamic Island 錄音提醒懸浮膠囊 (Dynamic Island Recording HUD)**：錄音時頂部優雅滑下毛玻璃懸浮膠囊，提供呼吸脈衝紅點、4 柱聲波動畫、`MM:SS` 即時計時器，並內建純向量 SVG「⏸️ 暫停 / ▶️ 繼續」、「⏹️ 完成並插入」主按鈕與「✕ 放棄」取消鈕；頂部 Markdown 工具列保持極簡純粹。
    - **250ms 精密切片與緩衝沖刷 (250ms Audio Chunking & Guaranteed Finalization)**：採用 250ms 短切片與停止前主動 `requestData()`，徹底解決短秒數錄音無音檔產生的問題。
    - **本機即時播放**：錄音完成音檔立即存入客戶端 **IndexedDB (IndexedDB database -> `audios` store)**，游標處插入本機播放器 `<audio controls data-offline-audio-id="rec_..." src="blob:..."></audio>`，提供 0ms 本機即時播放。
    - **本機暫存與連線轉錄**：錄音 Blob 先存入 IndexedDB 並插入本機播放器。連線後將音訊送至轉錄端點：優先使用 Groq `whisper-large-v3`，再依序回退至 Groq Turbo 與 Cloudflare Workers AI Whisper。
    - **發布／同步時上傳附件**：使用者發布或同步筆記時，IndexedDB 音訊 Blob 才會上傳至外部 888box 附件服務；系統再以永久 HTTPS URL 取代本機播放器來源。
    - 離線工作站 (`/_pwa-offline`) 工具列也支援錄音與 IndexedDB 暫存；待筆記同步時再將錄音附件上傳至 888box。
  - **混合儲存架構**：元數據同步儲存於 `localStorage`，完整內文與歷史儲存於 `IndexedDB`（IndexedDB database），支援 memory fallback 降級備援。
  - **快捷鍵支援**：
    - `Cmd/Ctrl + S`：編輯模式即時存入 IndexedDB 與雲端（顯示存檔 Toast）；分享/檢視模式一鍵下載 `.md` 檔案。
    - `Cmd/Ctrl + O`：編輯模式快速選擇本機 Markdown 檔案載入。
    - `Cmd/Ctrl + E`：離線工作站快速切換編輯/雙欄/預覽檢視。
    - `Cmd/Ctrl + B` / `I` / `K`：離線工具列粗體、斜體、插入連結快捷鍵。


---

## 💾 Local-First 儲存架構與可插拔後端驅動 (Storage Architecture)

本專案採用現代化的 **Local-First（本地優先）** 混合儲存機制：
1. **本機 0ms 即時保存**：編輯時擊鍵即時存入客戶端 **IndexedDB (IndexedDB database)**，狀態顯示 `🟢 本機已存`，享受原生桌面級無延遲寫作體驗。
2. **智慧低頻雲端同步**：停止輸入 3.5 秒、定期週期性間隔、或關閉分頁（透過 `visibilitychange` / `keepalive`）時自動向 Cloudflare 同步，**大幅節省 90% 以上的雲端寫入請求**，完美規避 Cloudflare KV 每天 1,000 次 Writes 的免費額度硬上限！
3. **可插拔後端驅動 (KV / D1 / Auto Dual)**：
   - 開發者可透過環境變數 `SCN_STORAGE_DRIVER` 自由選擇後端儲存方案：
     - `auto` (預設/相容模式)：優先讀寫 D1，若未在 D1 則自動無縫 Fallback 讀取舊有 KV 文章，並於儲存時自動雙寫同步。
     - `kv`：純 Cloudflare KV 儲存（零資料庫依賴）。
     - `d1`：純 Cloudflare D1 儲存（SQLite 高效關聯式儲存，每日 10 萬次免費寫入）。

### Server / Cloudflare

| 儲存位置              | 保存內容                                                                                       | 說明                                 |
| ----------------- | ------------------------------------------------------------------------------------------ | ---------------------------------- |
| `NOTES` KV        | Markdown 文章內容與屬性 (`theme`, `width`, `shareFont`, `publicIndex`, `autosave`, `pw`/`vpw` 雜湊) | 未發布文章不保存內容；新開筆記時儲存初始主題             |
| `SHARE` KV        | Share slug 到文章 path 的對照                                                                    | 不保存文章本文                            |
| D1 `notes`        | (選用) 文章全量內容與 JSON 元數據                                                             | 透過 `schema/notes_d1.sql` 建立，提供高達 10 萬次/日寫入額度 |
| D1 `shares`       | (選用) Share slug 與 path 對照表                                                              | 透過 `schema/notes_d1.sql` 建立         |
| D1 `note_history` | 歷史版本快照 (path、舊內容、建立時間)                                                                     | 留存最新 10 份歷史                        |
| D1 `note_stats`   | 文章瀏覽數、最後瀏覽時間、匿名裝置 UUID hash                                                                | Server 不留存原始 UUID，僅保存 SHA-256 hash |
| D1 `annotation_*` | 劃線段落錨點、原文摘錄、留言與回覆                                                                          | 原文修改後討論紀錄仍留存                       |
| `IMAGES` R2       | 圖片上傳儲存桶                                                                                    | 文章內僅保存公開圖片 URL                     |


### Browser (localStorage / IndexedDB / Cookie)

| 類型           | Key / Database                                                                       | 用途                                          |
| ------------ | ------------------------------------------------------------------------------------ | ------------------------------------------- |
| IndexedDB    | IndexedDB `notes` store                                              | 本機完整 Markdown 文章內容、離線草稿與歷史快照（大容量非同步儲存，0ms 延遲）  |
| IndexedDB    | IndexedDB `audios` store                                             | 本機 WebM Opus 離線錄音 Blob 暫存與待同步清單（支援大容量二進位檔案）         |
| localStorage | Note metadata cache                                                          | 本機快取筆記元數據清單（path、title、updatedAt、size、syncStatus） |
| localStorage | Preview, device, font, and theme preferences | 介面佈局與視覺偏好鏡像                                 |
| localStorage | Publishing preferences                                                     | 發布、自動儲存與公開索引的上次勾選偏好；首次預設全部開啟                |
| localStorage | Recent share history and annotation author                                   | 本機近 20 筆分享紀錄與註解留言名稱                         |
| Cookie       | `auth` / `cn_device` / `admin_session`                                               | 具 path scope 的驗證 JWT、匿名裝置 hash 與管理員 session |

### 📊 文章瀏覽次數統計與去重架構 (Unique View Stats & Deduplication)

系統採用**基於筆記路徑（`path`）的不重複訪客計算模型**，而非個別版本獨立計算：

#### 1. 以「筆記路徑（`path`）」為計算核心
* **持續累計**：瀏覽次數記錄在 Cloudflare D1 的 `note_stats` 表中（以 `path` 為 Primary Key），無論作者修改發布了幾次新版本或回退歷史版本，該篇筆記的累積瀏覽次數均會完整保留並繼續累計。
* **裝置記錄**：D1 的 `note_view_devices` 表以 `(path, device_hash)` 為複合主鍵，記錄造訪過的每台裝置。

#### 2. 不重複訪客（Unique Views）匿名去重機制
為避免讀者重新整理（F5）或重複瀏覽導致計數灌水，系統採用隱私友善的裝置指紋機制：
1. **核發裝置 Cookie**：讀者首次造訪時，伺服器配發長效（365 天）、安全（`HttpOnly` + `Secure` + `SameSite=Lax`）的 `cn_device` Cookie（UUID 格式）。
2. **SHA-256 匿名雜湊**：伺服器將裝置 UUID 經由 SHA-256 雜湊轉換為匿名 `device_hash`，完全不留存使用者原始識別資訊。
3. **資料庫去重判定**：
   * 同一台裝置在 365 天內重複開啟同篇筆記：`(path, device_hash)` 衝突被忽略，`view_count` **不重複累計**。
   * 不同裝置（或不同瀏覽器/無痕視窗）首次造訪：成功記錄新裝置，`view_count` **自動 +1**。

#### 3. 計數過濾規則

| 存取方式 | 是否計入瀏覽次數 | 說明 |
| :--- | :---: | :--- |
| **一般公開分享頁（HTML GET）** |  **會** | 真人讀者透過瀏覽器正常閱覽文章。 |
| **簡報模式（`/present`）** | ❌ 不會 | 演講/展示模式不重複計算。 |
| **嵌入模式（`?embed=1`）** | ❌ 不會 | 作為 iframe 嵌入時不計入。 |
| **AI Agent / Markdown 協商請求** | ❌ 不會 | 標頭帶有 `Accept: text/markdown` 的 API 抓取不計入。 |
| **同一台裝置重複瀏覽** | ❌ 不會 | 365 天內由 Cookie 去重。 |

---

## 🛡️ 全方位安全架構與防禦標準 (Full-Stack Security & Hardening Standards)

本專案遵循 Cloudflare 官方開源安全標準（`cloudflare/security-audit-skill`）進行全面防護與持續回歸測試：

1. **XSS 深度防禦與 DOM 淨化 (Zero-XSS Policy)**：
   - 伺服端模板全量字串轉義：包含 Textarea 內容、Bot 索引標籤與 `APP_STATE` 內嵌 Script JSON，徹底杜絕標籤逃逸。
   - 客戶端 Mermaid 與 Graphviz 圖表強制採用嚴格模式 (`securityLevel: 'strict'`)，所有生成之動態 SVG 均通過 `DOMPurify.sanitize()` 過濾惡意腳本。
2. **存取控制與密碼學權杖安全 (RBAC & Cryptographic Tokens)**：
   - 明確區隔「閱讀鎖 (`vpw`)」與「編輯鎖 (`pw`)」，閱讀鎖通過後僅核發唯讀權限 (`role: 'view'`)。
   - 所有 JWT 認證權杖均包含 `exp` 有效期宣告，Cookie 配置 `HttpOnly`、`Secure` 與 `SameSite`。
   - 管理員後台廢止明文 Session Cookie，全面改用密碼學簽名之 Admin JWT 與 WebAuthn / FIDO2 Passkey 雙重認證。
   - 密碼驗證採用常數時間比對 (`constantTimeStringCompare`)，杜絕時序側信道攻擊。
3. **儲存一致性與資源防護 (Storage Consistency & Rate Protection)**：
   - D1 SQLite 查詢使用欄位參數化綁定，完全免疫 SQL Injection。
   - 排程 Cron 清理作業整合 Storage Driver 同步清理 D1 與 KV，且僅刪除真正為空（長度 0）且無密碼保護之筆記。
   - R2 檔案上傳嚴格校驗 MIME 格式副檔名白名單與 10MB 大小上限；MCP 伺服器限制 JSON-RPC 2.0 Batch 請求上限（最多 20 筆）。

---

## 🔍 系統發現端點 (Discovery Endpoints)

部署完成後，站點提供以下自動化檢視端點：

- `GET /mcp` / `POST /mcp`：原生 Model Context Protocol (MCP) JSON-RPC 2.0 端點，支援 Cloudflare WebMCP 橋接與外部 Agent。
- `GET /.well-known/api-catalog`：RFC 9727 Linkset JSON。
- `GET /.well-known/agent-skills/david888-wiki-publisher/SKILL.md`：LLM Agent Skill 規格書。
- `GET /auth.md`：API 認證說明規範。
- `GET /llms.txt`：面向 LLM 的精簡網站導覽，連結公開 Skill、API 文件與規格。
- `GET /llms-full.txt`：面向 LLM 的完整網站架構、API 規範與系統說明文件。
- `GET /robots.txt`：AI 爬蟲規則與聲明。
- `Accept: text/markdown` 標頭：請求 `/share/...` 或 `/:path` 時直接回傳原始 Markdown。

### 🛠️ Markdown 轉換與無狀態工具 API

- `POST /api/markdown/render`：傳入 Markdown 渲染為包含主題樣式的 HTML。
- `POST /api/markdown/parse`：傳入 HTML 字串或網頁 URL 轉換為乾淨 Markdown。
- `POST /api/markdown/extract`：提取 Markdown 純文字、文章標題、標題大綱清單、超連結與字數統計。
- `POST /api/markdown/lint`：檢查 Markdown 語法問題（未閉合程式碼區塊、缺少空白標題、損毀連結、未加引號之 Mermaid 節點）並輸出修復後的 Markdown。
- `POST /api/audio/transcribe`：語音轉文字 API，支援 `multipart/form-data`、二進位音訊串流或 Base64 JSON，輸出包含精確時間標記 `[mm:ss]` 的 Markdown 段落，可傳入 `?format=smart` 讓 Whisper 逐字稿再經 LLM 釐清整理與 Markdown 排版。

### 💬 劃線註解與討論串 API

- `GET /api/shares/:shareId/annotations`：獲取公開分享頁面的所有劃線討論串。
- `POST /api/shares/:shareId/annotations`：對特定段落新增劃線討論串。
- `POST /api/shares/:shareId/annotations/:threadId/messages`：回覆特定劃線討論串。
- `DELETE /api/shares/:shareId/annotations/:threadId/messages/:messageId`：刪除特定註解留言（需留言者 `deleteToken` 或文章作者權限）。
- `DELETE /api/shares/:shareId/annotations/:threadId`：刪除整個劃線討論串（需發起者 `deleteToken` 或文章作者權限）。
- `POST /api/shares/:shareId/ai-assistant`：針對文章或劃線段落向 AI 提問。

---

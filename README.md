# Cloud Notepad - 基於 Cloudflare Workers 的無伺服器 Wiki 記事本

### Block Edit （類似Notion / Wordpress like 編輯器）

![](orca-paste-1786412891983-91d2563f-ec8a-48c9-b164-0580fe8bb564.png)



### Markdown Edit 編輯器

![](orca-paste-1786412963175-b84e9a93-3a2c-418e-b031-e5ff91bdcda1.png)



![Banner](image.png)



### 強大的匯入功能

![](orca-paste-1786413057952-e921e491-7e07-48bb-b3c7-287cb5a0cc1c.png)



![](orca-paste-1786413092921-8c46fc96-76ea-4b68-ac46-3f2a1914cd71.png)



這是一個運行在 Cloudflare Workers 上的輕量級、極速且對 AI 友善的雲端記事本與無頭 CMS 平台。不僅支援 Markdown 即時預覽、密碼保護、D1 版本歷史與簡報模式，更整合了 **AI 寫作特助 (排版/改寫/翻譯)**、**剪貼簿直接貼圖與 R2 上傳**、**888box 大檔附件**、**ECharts 動態圖表**、**段落劃線討論**與 **MCP / AI Agent Skills** 生態。

👉 **⚠️ 給 AI 與開發者：若需使用 API 進行讀寫，請存取專屬 Skill 規格表：[SKILL.md](https://wiki.david888.com/.well-known/agent-skills/david888-wiki-publisher/SKILL.md) 或 [LLM_API_DOCS.md](./LLM_API_DOCS.md) ⚠️**

---

## 語言 / Languages

- [繁體中文 (Traditional Chinese)](#繁體中文)
- [English Version](#english-version)

---

# 繁體中文

## ⚡ 強大亮點功能一覽 (Feature Highlights)

### 🤖 1. AI 智慧寫作特助與 Agent 生態

- **🎙️ 音訊匯入與 AI 發言者區分逐字稿 (Whisper + GPT-OSS 120B)**：點擊左下角「＋ 新增」選單中的「🎙️ 匯入音訊轉逐字稿」或底欄匯入按鈕，可直接上傳錄音檔（`.mp3`, `.m4a`, `.wav`, `.aac`, `.ogg`, `.webm`, `.flac`, `.opus`, `.mp4`）。由 Cloudflare Workers AI 原生 **`@cf/openai/whisper-large-v3-turbo`** 極速語音轉錄，並由旗艦 **`@cf/openai/gpt-oss-120b`** 大模型自動進行 Speaker Diarization，智慧識別「**🎤 主持人**」與「**👤 來賓 / 發言者**」，並產生核心重點摘要與結構化對話 Markdown！
- **AI 排版優化 (AI Format)**：採用 Workers AI（`gpt-oss-20b`），自動梳理 Markdown 標題、清單與空白，100% 保留原文語言與內容。支援圈選局部排版。
- **AI 輔助編輯與生成 (AI Edit &amp; Draft)**：採用 `gpt-oss-120b` 模型，提供指令式的段落改寫、內容擴充或整篇文稿生成。
- **AI 翻譯／雙語生成 (AI Translate &amp; Bilingual)**：一鍵將文章翻譯為指定目標語言，或產生排版完美的「原文 + 譯文」雙語對照版本。
- **選取文字浮動 AI 捷徑**：在編輯器中選取任意文字，自動彈出浮動選單，一鍵觸發排版、AI 編輯或翻譯。
- **Agent 生態 (MCP &amp; Skills)**：提供符合 Model Context Protocol 的遠端 MCP 伺服器 (`uv run server.py`)，並發布 `/.well-known/agent-skills/david888-wiki-publisher/SKILL.md`，可直接作為 Antigravity、Cursor、Claude Desktop 或 n8n 的發文大腦。

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

- **剪貼簿直貼與 R2 圖片上傳**：支援剪貼簿直接貼圖 (Paste)、檔案拖曳 (Drag &amp; Drop) 或工具列點選上傳至 Cloudflare R2，自動插入 Markdown 圖片語法。
- **888box 多媒體附件上傳**：工具列支援將影片、音訊、文件、壓縮檔等大檔上傳至 `box.david888.com`（具自動 fallback 機制），自動插入 `<video>`、`<audio>` 或下載連結。
- **ECharts 動態圖表渲染**：支援在 Markdown 中撰寫 `echarts { JSON }`  程式碼區塊，即時渲染互動式餅圖、折線圖、柱狀圖等 ECharts 圖表。
- **自動 `[TOC]` 文章目錄**：插入 `[TOC]` 標籤自動掃描文件標題階層（`#` ~ `###`），生成可點擊平滑跳轉的索引目錄。
- **二欄／三欄多欄版面**：工具列一鍵圈選文字生成 `<div class="two-column-layout">` 或 `three-column-layout` 橫向多欄排版（手機自動切換單欄）。
- **多媒體網址自動預覽**：自動將 YouTube 連結轉為隱私保護播放器、PDF 轉為嵌入式閱覽器、MP4/MP3 轉為原生播放器。
- **HackMD 圖片尺寸標記**：支援 `![alt](url =600x400)` 設定精準響應式圖片大小。
- **雙軌筆記格式與建立入口**：Footer 最左側的「＋ 新增」可建立 [Markdown 筆記](/new/markdown) 或 [Block 筆記](/new/block)。建立後格式固定，Markdown 保持原始文字工作流；Block 則使用單欄 WYSIWYG 編輯器，兩者不互相轉換。
- **Notion-like Block 編輯體驗**：Block 筆記使用 BlockNote 的現成 Notion 式畫布，內建游標左側的 `＋`、拖曳把手、slash menu、浮動格式工具列與行動版介面。可插入圖片、連結、YouTube、PDF、檔案、Mermaid、ECharts 與 Raw HTML；嵌入區塊可直接編輯，網址與圖表 JSON 會先驗證。既有筆記仍以原本 Tiptap JSON 格式保存，分享頁與 API 完全相容。
- **可及性的對話視窗**：所有編輯器對話視窗都具備正確 dialog 語意、Tab 焦點鎖定、關閉後回到原觸發按鈕與 Escape 關閉行為；系統設定「減少動態效果」時，介面會停用不必要的動畫。
- **網址轉 Markdown 剪藏 (URL to Markdown Clipper)**：Footer「＋ 新增」選單內建「從網址匯入」功能。貼上任意公開網頁網址，即由 Worker 後端 API (`/api/url2md`，具備 `http://2md.aiurl.tw/` 主服務與 `2md.glsoft.ai` / `create360.ai` 三層 Failover 備援) 擷取文章標題與乾淨的 Markdown 內文，可選擇插入/取代目前編輯器或自動新建筆記。
- **瀏覽器端多格式文件匯入**：Markdown 編輯器的 Footer「匯入」與「＋ 新增」選單可直接讀取 Markdown、Word、PowerPoint、Excel、OpenDocument、RTF、EPUB、CSV 與文字型 PDF，於瀏覽器內轉為 Markdown。既有文章可選擇「插入游標處」、「取代內容」或取消；取消不會載入或執行轉檔器。轉檔使用同網域受控的 WebAssembly 靜態資產，文件內容不會上傳至 Wiki 伺服器。
- **命令列轉檔發布**：[`scripts/doc2wiki.sh`](./scripts/doc2wiki.sh) 可將本機文件轉為 Markdown 後發布到指定 Wiki path；預設為私有，僅在明確傳入 `true` 時公開，且只輸出可分享的 `shareUrl`。
- **新筆記歡迎引導**：新建 Markdown 筆記會顯示置中的《飛鳥集》與小訣竅逐字效果；在同一分頁重整前都會保留，開始輸入後自動隱藏。
- **字體與 20+ 款主題**：預設繁中 `GenJyuu Gothic` 與程式碼 `Maple Mono` / `JetBrains Mono`。Footer 提供 20+ 款 CSS 主題（預設 `claude-canvas`）與寬度切換；新筆記編輯器會隨機從桌面或手機預覽開始，方便作者先檢查窄版排版。
- **整合式發布設定與狀態列**：發布對話窗集中設定「發布、自動儲存、公開索引」，預設三項全開並記住這台裝置的選擇。發布後，Edit 預覽上方會顯示分享 URL、公開索引、保留版本、不重複瀏覽與最後儲存時間；深色介面下狀態列與底部控制列會使用一致的高對比冷色系，並以青藍、亮藍、靛藍與紫藍區分發布、版面、字體與語言操作。

---

### 🔐 3. 隱私、版本控制、簡報與劃線互動

- **雙重密碼鎖定 (Edit Lock vs View Lock)**：獨立設定「編輯鎖」（限制修改）與「閱讀鎖」（限制閱讀），均以 Salted MD5 雜湊保護。
- **D1 歷史版本快照**：Cloudflare D1 自動儲存 10 份版本快照（5 分鐘防刷節流），提供對比、還原與複製。
- **簡報模式 (Slidev-Lite 2.0 演示)**：使用 `---` 進行 Markdown 分頁，一鍵轉換為 16:9 專業投影片簡報。支援 KaTeX 數學公式、Mermaid 流程圖、ECharts 圖表即時繪製；配備底部快捷懸浮導覽列（大綱 Overview、數位雷射筆 `L`、黑屏暫停 `B`、全螢幕 `F`、頁碼跳轉）；深度繼承 20 款主題色彩與字型；支援封面頁 (`<!-- layout: cover -->`)、雙欄/三欄版型、自訂背景與程式碼逐行高亮；支援一鍵導出 PDF 簡報與單張 Slide 圖片。
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
- **KaTeX 數學公式點擊複製 (7 種格式)**：
  - 點擊分享頁或預覽中的任一 KaTeX 數學公式即刻複製到剪貼簿。
  - 提供專屬設定選單（`fx` 按鈕），支援 7 種格式：自動判斷 (Auto)、LaTeX (含 $)、LaTeX 純文字 (無 $，適合 Desmos/WolframAlpha)、Notion (雙 $)、MathML (貼入 Word 轉為原生方程式)、PNG 圖片、SVG 向量。
- **Share 模式圈選文字浮動工具列與 AI 原位小卡**：
  - 讀者在分享頁圈選任意文字，即刻彈出流暢的毛玻璃膠囊浮動工具列（`.selection-action-toolbar`）。
  - **📋 複製**：一鍵複製選取內容至剪貼簿。
  - **🌐 翻譯**：自動辨識語系進行中英雙向 AI 翻譯，並在原位小卡（Inline Popover）展示譯文與一鍵複製。
  - **✨ 詢問 AI**：提供「🔍 解釋概念」、「💡 重點摘要」、「📐 公式推導」、「💻 程式碼解析」4 大快捷晶片與自訂問題輸入框，針對選取段落直接對答。
  - **💬 註解**：一鍵開啟段落劃線討論側邊欄。
- **段落劃線註解與精準連結**：讀者可在分享頁劃線進行段落討論與「複製精準連結」，開啟時會自動跳轉並高亮指定段落。
- **PDF 匯出與列印優化**：`@media print` 徹底重置頁面與表格邊界，自動隱藏所有工具列，確保表格文字完全不被裁剪。
- **PWA 獨立應用、檔案關聯 (File Handling) 與離線工作區 (Offline Workspace)**：
  - **可安裝 (Add to Home Screen)**：支援 macOS、Windows、iOS、Android 瀏覽器安裝為獨立 PWA 應用程式。
  - **檔案關聯 (File Handling API)**：作業系統（macOS Finder 或 Windows 檔案總管）中右鍵點擊 `.md` / `.markdown` / `.txt` 檔案，可直接以 `wiki.david888.com` 開啟並載入編輯！
  - **離線工作區 (Offline Workspace)**：斷網時自動進入離線編輯模式，支援建立離線草稿、檢視所有本機快取筆記與匯出 `.md`。
  - **混合儲存架構**：元數據同步儲存於 `localStorage`，完整內文與歷史儲存於 `IndexedDB`（`CloudNotepadOfflineDB`），在無痕模式或不支援時自動降級至記憶體快取。
  - **快捷鍵支援**：
    - `Cmd/Ctrl + S`：編輯模式即時存入 IndexedDB 與雲端（顯示存檔 Toast）；分享/檢視模式一鍵下載 `.md` 檔案。
    - `Cmd/Ctrl + O`：編輯模式快速選擇本機 Markdown 檔案載入。

![權限防護設計](image-2.png)

---

## 💾 Local-First 儲存架構與可插拔後端驅動 (Storage Architecture)

本專案採用現代化的 **Local-First（本地優先）** 混合儲存機制：
1. **本機 0ms 即時保存**：編輯時擊鍵即時存入客戶端 **IndexedDB (`CloudNotepadOfflineDB`)**，狀態顯示 `🟢 本機已存`，享受原生桌面級無延遲寫作體驗。
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
| IndexedDB    | `CloudNotepadOfflineDB` (`notes` store)                                              | 本機完整 Markdown 文章內容、離線草稿與歷史快照（大容量非同步儲存，0ms 延遲）  |
| localStorage | `cf-notepad:notes-metadata`                                                          | 本機快取筆記元數據清單（path、title、updatedAt、size、syncStatus） |
| localStorage | `cf-notepad-preview-width` / `cf-notepad-preview-device` / `share-font` / `ui-theme` | 介面佈局與視覺偏好鏡像                                 |
| localStorage | `cf-notepad:publish-preferences`                                                     | 發布、自動儲存與公開索引的上次勾選偏好；首次預設全部開啟                |
| localStorage | `cf-notepad:share-history:*` / `annotation-author`                                   | 本機近 20 筆分享紀錄與註解留言名稱                         |
| Cookie       | `auth` / `cn_device` / `admin_session`                                               | 具 path scope 的驗證 JWT、匿名裝置 hash 與管理員 session |



---

## 🛠️ 部署教學

### 前置準備

- Node.js 與 npm
- Cloudflare 帳號與 Wrangler CLI: `npm install -g wrangler`

### 1. 初始化專案與建立 KV

```bash
cp wrangler.toml.example wrangler.toml
wrangler kv:namespace create "NOTES"
wrangler kv:namespace create "SHARE"
```

將生成的 KV ID 填入 `wrangler.toml` 的 `kv_namespaces` 欄位。

### 2. 建立 D1 資料庫 (選用)

```bash
wrangler d1 create cloud-notepad-history
wrangler d1 execute cloud-notepad-history --file=./schema/note_history.sql
```

將 `database_id` 填入 `wrangler.toml` 內的 `[[d1_databases]]`。

### 3. 設定 R2 圖片儲存桶 (選用)

在 Cloudflare 建立 R2 Bucket 並綁定公開網域，於 `wrangler.toml` 中設定 `bucket_name` 與環境變數 `SCN_ENABLE_R2="1"`、`SCN_R2_DOMAIN="https://s3.wiki.david888.com"`。

### 4. 設定環境密鑰 (Secrets)

透過 `wrangler secret put <變數名稱>` 或網頁後台設定：

- `SCN_SALT`: 加鹽 UUID
- `SCN_SECRET`: JWT 密鑰
- `SCN_ADMIN_PATH`: 超級管理員後台路徑 (如 `/admin333`)
- `SCN_ADMIN_PW`: 管理員密碼
- `SCN_SLUG_LENGTH`: 隨機網址長度 (預設 `4`)
- `SCN_ENABLE_NOTE_HISTORY`: 設為 `"1"` 啟用 D1 版本紀錄

### 5. 執行部署

```bash
npm install
npm run deploy
```

---

## 🔍 系統發現端點 (Discovery Endpoints)

部署完成後，站點提供以下自動化檢視端點：

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

### 💬 劃線註解與討論串 API

- `GET /api/shares/:shareId/annotations`：獲取公開分享頁面的所有劃線討論串。
- `POST /api/shares/:shareId/annotations`：對特定段落新增劃線討論串。
- `POST /api/shares/:shareId/annotations/:threadId/messages`：回覆特定劃線討論串。
- `POST /api/shares/:shareId/ai-assistant`：針對文章或劃線段落向 AI 提問。

---

---

# English Version

## ⚡ Feature Highlights

### 🤖 1. AI Writing Assistant &amp; Agent Ecosystem

- **🎙️ Audio Transcription &amp; AI Speaker Diarization (Whisper + GPT-OSS 120B)**: Upload audio files (`.mp3`, `.m4a`, `.wav`, `.aac`, `.ogg`, `.webm`, `.flac`, `.opus`, `.mp4`) via the `+ New` menu or Footer Import button. Employs Cloudflare Workers AI **`@cf/openai/whisper-large-v3-turbo`** for ultra-fast multi-language ASR and flagship **`@cf/openai/gpt-oss-120b`** for intelligent Speaker Diarization to distinguish between **Host**, **Guest**, and **Speakers** with structured dialogue Markdown and executive summaries!
- **AI Formatting (AI Format)**: Workers AI (`gpt-oss-20b`) restructures Markdown headings, lists, and whitespace while preserving original language and text. Supports selection-only formatting.
- **AI Editing &amp; Drafting (AI Edit)**: `gpt-oss-120b` model provides instruction-based section rewrites, content expansion, or full article generation.
- **AI Translation &amp; Bilingual Output**: Translate content to target languages or generate side-by-side bilingual documents.
- **Floating Selection AI Menu**: Selecting text in the editor automatically triggers floating AI Format, AI Edit, and Translate shortcuts.
- **Agent Ecosystem (MCP &amp; Skills)**: Serves a remote Model Context Protocol server (`uv run server.py`) and standard Agent Skill at `/.well-known/agent-skills/david888-wiki-publisher/SKILL.md`.

```text
👉 One-Click Prompt for ChatGPT / Claude Web:
This is a deployed Wiki platform functioning as a Headless CMS publishing API: `https://wiki.david888.com/api`.
Please act as my writing assistant to draft and publish articles based on my requests.
For operational guidelines, please read the following document (use your web-browsing/execution tools to fetch it):
👉 https://wiki.david888.com/.well-known/agent-skills/david888-wiki-publisher/SKILL.md
Use the cURL/HTTP request tools detailed in that document to save the content once you finish writing, and give me the URL of the published article.
```

---

### 🎨 2. Rich Editing, Media &amp; Layout

- **Direct Clipboard Paste &amp; R2 Uploads**: Paste images directly from clipboard, drag-and-drop, or click the toolbar to upload to Cloudflare R2 with automatic Markdown image links.
- **888box Multimedia Attachments**: Upload videos, audio, documents, and archives directly to `box.david888.com` (with fallback nodes), inserting `<video>`, `<audio>`, or download links.
- **ECharts Interactive Charts**: Render interactive ECharts graphs directly from `echarts { JSON }`  code blocks in Markdown.
- **Automatic `[TOC]` Table of Contents**: Insert `[TOC]` to scan document heading hierarchy and render smooth-scrolling TOC jump links.
- **Two/Three-Column Layouts**: Wrap selected text in `<div class="two-column-layout">` or `three-column-layout` for multi-column presentation (stacks on mobile).
- **Auto Media Previews**: Automatically converts YouTube URLs to privacy-enhanced players, PDFs to embedded viewers, and MP4/MP3 links to native players.
- **HackMD Image Dimensions**: Supports `![alt](url =600x400)` responsive image sizing.
- **Two Fixed Note Formats &amp; Creation Menu**: The leftmost Footer `+ New` menu creates either a [Markdown note](/new/markdown) or a [Block note](/new/block). The format is fixed after creation: Markdown retains its plain-text workflow, while Block uses a single-column WYSIWYG editor; the two formats are not converted between each other.
- **Notion-like Block Editing**: Block notes use BlockNote's ready-made Notion-style canvas, including the cursor-side `+`, drag handle, slash menu, floating formatting toolbar, and mobile UI. It supports images, links, YouTube, PDFs, files, Mermaid, ECharts, and raw HTML. Existing notes continue to serialize to the compatible Tiptap JSON format, so Share pages and APIs remain unchanged.
- **Accessible Dialogs**: Editor dialogs use proper dialog semantics, trap Tab focus, restore focus to their trigger when closed, and support Escape. The interface also honors the system `prefers-reduced-motion` setting.
- **Browser-side Multi-format Document Import**: The Markdown editor's Footer Import button and `+ New` menu accept Markdown, Word, PowerPoint, Excel, OpenDocument, RTF, EPUB, CSV, and text-based PDFs, then convert them to Markdown in the browser. Existing content can be inserted at the cursor, replaced, or left untouched by cancelling; cancelling does not load or run the converter. Conversion uses same-origin, version-locked WebAssembly static assets, so document bytes never upload to the Wiki server.
- **CLI Conversion and Publishing**: [`scripts/doc2wiki.sh`](./scripts/doc2wiki.sh) converts a local document and publishes the Markdown to a specified Wiki path. It defaults to private, requires explicit `true` to publish, and prints only the shareable `shareUrl`.
- **New-note Welcome**: A fresh Markdown note shows centered *Stray Birds* copy and a focused tip with a typewriter effect. It remains available across reloads in the same browser tab and disappears as soon as the author starts typing.
- **Typography &amp; 20+ Themes**: Traditional Chinese defaults to `GenJyuu Gothic`; Latin text uses `Maple Mono` / `JetBrains Mono`. Features 20+ CSS preview themes (default `claude-canvas`) and width toggles. New editor notes randomly start in a desktop or mobile preview so authors can check narrow layouts early.
- **Unified Publishing &amp; Status Strip**: One dialog controls Publish, Autosave, and Public Index; all three default on and the confirmed choices are remembered on this device. After publishing, the Edit preview shows the Share URL, index state, retained versions, unique views, and last-saved time; dark UI mode uses a consistent high-contrast cool palette, with teal-blue, blue, indigo, and violet-blue distinguishing publish, layout, font, and language actions.

![Editor and Real-Time Preview](image-1.png)

---

### 🔐 3. Privacy, Versioning, Slides &amp; Annotations

- **Edit Lock vs View Lock**: Separate Salted MD5 password controls for editing permissions versus reading permissions.
- **D1 Snapshot History**: Cloudflare D1 automatically backs up content (5-minute cooldown, retains 10 snapshots) for preview and restoration.
- **Slide Presentation Mode (Slidev-Lite 2.0)**: Splice notes using `---` dividers for 16:9 fullscreen slide presentations. Features KaTeX math, Mermaid diagrams, interactive ECharts, floating translucent toolbar (Overview `O`, Laser `L`, Blackout `B`, Fullscreen `F`), 20 theme color inheritances, and PDF/Slide export.
- **Paragraph Annotations & REST API**: Highlight text on Share pages for inline discussions and deep-linking, backed by Cloudflare D1 persistence and standard REST endpoints (`/api/shares/:shareId/annotations`).
- **Stateless Markdown Processing Utilities**:
  - `POST /api/markdown/render`: Markdown to HTML with 20 CSS theme choices.
  - `POST /api/markdown/parse`: HTML / Web URL to clean Markdown.
  - `POST /api/markdown/extract`: Extract plain text, heading hierarchy, links, and word/reading-time statistics.
  - `POST /api/markdown/lint`: Validate and auto-fix unclosed code fences, missing heading spaces, etc.
- **PDF Export & Print Optimization**: `@media print` rules hide UI overlays and reset table margins to prevent text clipping.
- **PWA App, File Handling & Offline Workspace**:
  - **OS File Association (File Handling API)**: Right-click `.md` files in macOS Finder or Windows Explorer to open directly in `wiki.david888.com`.
  - **Offline Workspace (`/_pwa-offline`)**: Work completely offline with local draft creation, caching, and export.
  - **Local-First Hybrid Storage**: 0ms local saves to IndexedDB (`CloudNotepadOfflineDB`), synchronous metadata in `localStorage`, and smart background cloud sync with visible status badge (`🟢 Saved locally`, `☁️ Cloud synced`).

![Access Control Diagram](image-2.png)

---

## 💾 Local-First Storage Architecture & Pluggable Drivers

1. **0ms Local Saves (IndexedDB)**: Keystrokes are immediately saved to client-side **IndexedDB (`CloudNotepadOfflineDB`)** with status `🟢 Saved locally`, providing desktop-grade fluid writing without network latency.
2. **Smart Cloud Sync**: Automatically syncs in the background upon 3.5s inactivity pause, periodic intervals, or page close (`visibilitychange` / `keepalive` / `sendBeacon`), **saving >90% of cloud write requests** and eliminating KV write limit concerns.
3. **Pluggable Backend Storage Drivers (`SCN_STORAGE_DRIVER`)**:
   - `auto` (Default / Hybrid): Reads D1 first with seamless fallback to legacy KV notes; dual-writes to migrate edited KV notes to D1.
   - `kv`: Pure Cloudflare KV storage (zero database dependency).
   - `d1`: Pure Cloudflare D1 storage (SQLite with 100,000 free writes/day).

### Server / Cloudflare

| Storage           | Data                                                                                                          | Description                                                              |
| ----------------- | ------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------ |
| `NOTES` KV        | Markdown content & metadata (`theme`, `width`, `shareFont`, `publicIndex`, `autosave`, `pw`/`vpw` hashes) | Unpublished notes are browser-only; saves initial theme on note creation |
| `SHARE` KV        | Share slug to note path mapping                                                                               | Does not store article body                                              |
| D1 `notes`        | (Optional) Full note content & JSON metadata                                                                  | Created via `schema/notes_d1.sql`, provides 100,000 writes/day           |
| D1 `shares`       | (Optional) Share slug to path mapping table                                                                   | Created via `schema/notes_d1.sql`                                        |
| D1 `note_history` | Historical version snapshots (path, text, created time)                                                       | Retains latest 10 versions                                               |
| D1 `note_stats`   | View count, last view time, anonymous device UUID hash                                                        | Stores SHA-256 hash only                                                 |
| D1 `annotation_*` | Paragraph anchors, source quotes, comments & replies                                                          | Retains discussion threads after text edits                              |
| `IMAGES` R2       | Image upload bucket                                                                                           | Stores public image URLs                                                 |

### Browser (localStorage / IndexedDB / Cookie)

| Type         | Key                                                                                  | Description                                                                          |
| ------------ | ------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------ |
| IndexedDB    | `CloudNotepadOfflineDB` (`notes` store)                                              | Complete Markdown note content, offline drafts & snapshots (0ms local-first storage) |
| localStorage | `cf-notepad:notes-metadata`                                                          | Fast synchronous note metadata list (path, title, updatedAt, size, syncStatus)        |
| localStorage | `cf-notepad-preview-width` / `cf-notepad-preview-device` / `share-font` / `ui-theme` | Mirror of layout and visual preferences                                              |
| localStorage | `cf-notepad:publish-preferences`                                                     | Last confirmed Publish, Autosave, and Public Index choices; all enabled on first use |
| localStorage | `cf-notepad:share-history:*` / `annotation-author`                                   | Local history of 20 recent shares & author name                                  |
| Cookie       | `auth` / `cn_device` / `admin_session`                                               | Path-scoped JWT, anonymous device hash & admin session                           |


---

## 🛠️ Deployment Guide

### Prerequisites

- Node.js and npm installed
- Cloudflare account &amp; Wrangler CLI: `npm install -g wrangler`

### 1. Initialize Project &amp; Create KV

```bash
cp wrangler.toml.example wrangler.toml
wrangler kv:namespace create "NOTES"
wrangler kv:namespace create "SHARE"
```

Paste the namespace IDs into `wrangler.toml`.

### 2. Create D1 Database (Optional)

```bash
wrangler d1 create cloud-notepad-history
wrangler d1 execute cloud-notepad-history --file=./schema/note_history.sql
```

Paste `database_id` into `wrangler.toml`.

### 3. Setup R2 Image Uploads (Optional)

Create an R2 Bucket in Cloudflare and enable public domain access. Set `bucket_name` in `wrangler.toml` and secrets `SCN_ENABLE_R2="1"` and `SCN_R2_DOMAIN="https://s3.wiki.david888.com"`.

### 4. Set Environment Secrets

Set secrets via `wrangler secret put <VAR>`:

- `SCN_SALT`: Password hashing salt UUID
- `SCN_SECRET`: JWT encryption secret
- `SCN_ADMIN_PATH`: Admin dashboard path (e.g., `/admin333`)
- `SCN_ADMIN_PW`: Admin dashboard password
- `SCN_SLUG_LENGTH`: Length of random share URLs (default `4`)
- `SCN_ENABLE_NOTE_HISTORY`: Set to `"1"` for D1 history

### 5. Deploy

```bash
npm install
npm run deploy
```

---

## 🔍 Discovery Endpoints

- `GET /.well-known/api-catalog`: RFC 9727 Linkset JSON.
- `GET /.well-known/agent-skills/david888-wiki-publisher/SKILL.md`: LLM Agent Skill spec.
- `GET /auth.md`: Authentication specification.
- `GET /llms.txt`: Concise LLM entry point linking to the public Skill, API docs, and specifications.
- `GET /llms-full.txt`: Comprehensive LLM site architecture, API specs, and extended system documentation.
- `GET /robots.txt`: AI Crawler rules.
- `Accept: text/markdown`: Requesting `/share/...` or `/:path` returns raw Markdown.

---

## 🧭 Maintenance for Contributors &amp; LLMs

When adding or changing a user-facing feature, update these three files:

1. `CHANGELOG.md` for release records.
2. `README.md` for feature documentation.
3. `static/data/editor-tips.json` for bilingual startup tips (`zh-TW` and `en-US`).

Keep agent guidance synchronized across `skills/SKILL.md`, `LLM_API_DOCS.md`, and `mcp/README.md`. Run `node scripts/generate-agent-skill.mjs` after changing generated source documents.

`node scripts/generate-agent-skill.mjs` also copies the locked `@firecrawl/anydoc-wasm` JavaScript and `.wasm` files from `node_modules` to `static/wasm/`; this runs automatically before tests and deployment. Do not hand-edit those generated static files.

---

*See full developer logs in [CHANGELOG.md](./CHANGELOG.md).*
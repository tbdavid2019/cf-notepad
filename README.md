# Cloud Notepad - 基於 Cloudflare Workers 的無伺服器記事本

![Banner](image.png)

Cloud Notepad 是一個運行在 Cloudflare Workers 上的輕量級、極速且對 AI 友善的雲端記事本與無頭 CMS 平台。支援 Markdown 即時預覽、密碼保護、版本歷史、幻燈片簡報模式，並內建超級管理員後台、MCP 伺服器與 AI Agent 專屬 Skills。

👉 **⚠️ 給 AI 與開發者：若需使用 API 進行讀寫，請務必先閱讀完整規格表：[LLM_API_DOCS.md](./LLM_API_DOCS.md) ⚠️**

---

## 語言 / Languages

- [繁體中文 (Traditional Chinese)](#繁體中文)
- [English Version](#english-version)

---

# 繁體中文

## 🤖 AI Agent 與 LLM 生態整合

本專案原生支援被 AI 代理（如 Antigravity、Cursor、Claude Desktop、OpenClaw 或 n8n）當作「外部大腦」或「自動發文平台」使用。

### 1. 零安裝啟動 MCP 伺服器
我們提供了符合 Model Context Protocol (MCP) 的伺服器，可直接透過 Python `uv` 遠端執行，無須下載任何程式碼。
- **Cursor / Claude Desktop 設定**：
  - **Type**: `command`
  - **Command**: `uv run https://raw.githubusercontent.com/tbdavid2019/cf-notepad/main/mcp/server.py`
  - *(詳細說明請見 [mcp/README.md](./mcp/README.md))*

### 2. Antigravity AI Skills
本專案內建專屬技能 Prompt。只需將 `skills/` 資料夾下的內容複製到您的 `~/.gemini/antigravity/skills/` 目錄中即可。
- **自動發現**：Agent 亦可透過 `/.well-known/agent-skills/david888-wiki-publisher/SKILL.md` 自動探索載入。

### 3. 一鍵呼叫發文 (給 GPT/Claude 網頁版的 Prompt)
複製以下文字貼給 ChatGPT 或 Claude 網頁版，AI 即可自動為您寫作並發布至您的站點：
```text
這是一台架設好的 Wiki 記事本，具備無頭 CMS 的發文 API：`https://your-wiki-domain.com/api`。
請你擔任我的寫作助理，根據我的需求撰寫文章並發布。
操作指南請閱讀以下文件內容（請運用你的上網 / 執行工具讀取）：
👉 https://raw.githubusercontent.com/tbdavid2019/cf-notepad/main/LLM_API_DOCS.md
請你使用上述文件的 cURL/HTTP 請求，完成寫作後將內容存檔，並把最後發布的文章網址給我。
```

---

## ✨ 整合功能特色

### 🚀 1. 寫作與編輯體驗 (Writing & Editing)
- **精美字體與佈局**：中文預設使用 `GenJyuu Gothic`，英文字母與程式碼仍維持 `Maple Mono`／`JetBrains Mono`，兼顧中文字形與既有英文閱讀感。Footer 內建寬度切換（Full / 960 / 1200 / 1440）與 20+ 款精美 CSS 預覽主題（預設為 `claude-canvas` 人文風格），且版面支援拖曳分割，雙擊可快速重設 50/50。
- **Footer 與工具列控制**：採用 Lucide / GitHub Octicons 精緻筆劃型 SVG 微圖示，配合掛載於頁面最上層的 **0ms 極速漂浮氣泡標籤**（Hover、Touch、Focus 時即時浮現，不受橫向捲動容器裁切）；編輯頁與分享頁的圖示按鈕皆提供繁中／英文提示。發布、字型、語言與裝置切換採用無滑塊 **3D 翻轉卡片開關 (3D Flip Card Toggle)**，寬度自動自適應。提示訊息與確認視窗統一置中顯示。
- **儲存策略**：未發布文章不會寫入內容；發布時會同步儲存目前編輯內容。發布後可使用「儲存」按鈕，或逐篇開啟 Autosave，停止輸入 10 秒後才會儲存；若不想開放公開閱讀，可搭配閱讀鎖。
- **編輯器視圖設定**：`預覽`、`排列` 與 `裝置` 會集中在同一個視圖設定群組，方便快速調整編輯器佈局。
- **閱讀進度與編輯狀態**：預覽／分享頁左側會顯示可點擊的垂直閱讀進度尺，讓讀者知道目前閱讀位置與文章長度；編輯區左下角則即時顯示第幾行、第幾欄與全文總長度。
- **複製內容**：Footer 的 Markdown `匯出` 右側提供 `複製`，會同時寫入 rich HTML 與 Markdown/plain-text fallback；rich HTML 使用媒體 preview 建立前的安全 HTML，不會把 YouTube／PDF iframe 貼進 Jira、Confluence 或其他編輯器；成功後顯示勾勾動畫與複製提示。
- **Theme 特色說明**：主題選單保留完整名稱，並依介面語言顯示繁中或英文風格描述，方便使用者依視覺特色挑選主題。
- **新筆記隨機 Theme**：只有從網站根目錄建立全新隨機編號筆記時才會抽選 Theme，並立即保存到 Server metadata；原作者重新打開既有 Edit 會沿用已保存的 Theme。空白新筆記的瀏覽器標題使用「新筆記 · 月/日 時:分」，不顯示對人類無意義的隨機路徑。
- **HackMD 圖片尺寸**：支援 `![圖片](URL =600x)`、`=600x400` 與 `=x400`；尺寸只接受安全的數字值，圖片仍受文章容器最大寬度限制。
- **二欄／三欄版面**：Edit 工具列可將圈選內容包成 `<div class="two-column-layout">` 或 `<div class="three-column-layout">`。容器內以標題分隔各欄，窄螢幕會自動改為單欄。
- **動態空白頁歡迎提示**：當新建或清空編輯器時，會自動載入一首隨機的泰戈爾詩歌，以及 `static/data/editor-tips.json` 中的一則雙語小訣竅；兩者會在漂鳥集下方以同步的**打字機動畫效果**出現。
- **AI 寫作特助**：
  - **AI 排版優化**：內建 Workers AI（`gpt-oss-20b`），只整理 Markdown 結構、空白、標題與清單；會保留原文的語言、文字、連結與內容，不會翻譯或改寫。純英文文件若收到含中文的結果，系統會拒絕取代原文。若先圈選內容，僅會排版該片段。
  - **AI 翻譯／雙語**：上方 Markdown 工具列提供純圖示的獨立翻譯按鈕（`gpt-oss-120b`）。先指定目標語言，再選擇只翻譯或保留原文並產生雙語版本；若先圈選內容，僅翻譯該片段。
  - **編輯器 AI 排版**：AI 排版可直接從上方 Markdown 工具列啟動。
  - **AI 編輯與生成**：採用 `gpt-oss-120b` 模型，提供指令式的段落插入、部分改寫或整篇筆記內容生成。
  - **選取文字 AI 捷徑**：在編輯器中選取任意文字時，會自動彈出「排版」、「AI 編輯」與「翻譯」三個捷徑；三者只會處理圈選區塊，其餘內容原封不動。
- **Markdown 編輯工具列**：編輯區上方提供標題、粗體、斜體、刪除線、連結、引用、清單、行內程式碼、程式碼區塊、分隔線、三欄表格、圖片、全螢幕、Undo / Redo、AI 排版、AI 翻譯／雙語與「製作目錄」。目錄按鈕會插入獨立的 `[TOC]`，預覽時自動依 `#`、`##`、`###` 等標題產生可跳轉的索引。工具列會依目前語言顯示 placeholder 與提示文字。
- **圖片插入**：啟用 R2 後，可從工具列選擇圖片上傳，系統會自動插入 Markdown 圖片連結；未啟用 R2 時則插入可手動修改網址的圖片範本。
- **888box 附件上傳**：工具列提供附件按鈕，可將影片、音訊、文件、壓縮檔與一般檔案直接上傳到 `box.david888.com`；失敗時依序 fallback 到 `box.aiurl.tw`、`box.glsoft.ai`，並依檔案類型插入 `<video>`、`<audio>` 或 Markdown 連結。圖片仍維持使用內建 R2。
- **媒體 URL 預覽**：預覽區會辨識 PDF、YouTube、影片與音訊連結，分別顯示 PDF iframe、privacy-enhanced YouTube iframe，或原生 video/audio player；每個 preview 都保留原始連結作為 fallback。
- **WebTalk 頁面識別**：share 頁會在 `<head>` 提供 `<meta name="webtalk-page-id" content="...">`，讓外掛聊天室依 share ID 綁定到正確 Wiki 頁面。
- **ECharts 圖表**：支援使用 `echarts` fenced code block 撰寫 JSON 圖表設定，編輯器會在預覽區動態載入並繪製圖表。
- **視圖快捷鍵**：`⌘-⌥-7` / `Ctrl-Alt-7` 切換所見即所得左右排列，`⌘-⌥-8` / `Ctrl-Alt-8` 切換純 Markdown，`⌘-⌥-9` / `Ctrl-Alt-9` 切換所見即所得上下排列。
- **鎖定邏輯**：`編輯鎖`限制修改，`閱讀鎖`限制閱讀；若只有閱讀鎖，該密碼會作為唯一的擁有者密碼，可完成驗證後編輯。兩種鎖同時存在時，閱讀鎖只能閱讀，編輯鎖才能修改。

```echarts
{
  "title": { "text": "Traffic sources" },
  "tooltip": { "trigger": "item" },
  "series": [{
    "type": "pie",
    "data": [
      { "value": 1048, "name": "Search" },
      { "value": 735, "name": "Direct" },
      { "value": 580, "name": "Referral" }
    ]
  }]
}
```
- **極致行動適應性**：
  - **單列橫向工具列**：手機版的編輯與分享 Footer 維持單列排列並支援觸控橫向捲動；所有圖示控制都有即時繁中／英文浮動提示，發布狀態旁的 `...` 分享選單會浮在 Footer 外，不會被裁切。
  - **行動自適應閱讀**：手機版表格支援自動換行與防溢出；長網頁滾動時會出現 `＾` 回到頂部按鈕。
- **可安裝 PWA 與安全離線提示**：在支援的 Android Chromium 瀏覽器中，當瀏覽器判定可安裝時，頁面底部會出現「安裝 App」；點擊後開啟原生安裝確認。已安裝的獨立 App 會由 CSS 直接隱藏此提示；點擊 `×` 也會立即關閉，即使提示模組尚未載入。也可從瀏覽器選單選擇「安裝 App」或「加入主畫面」，以獨立視窗開啟。離線時導覽會顯示內建提示頁；目前不快取筆記、Share 頁或 API 回應，因此不支援離線閱讀／編輯，也不會將受保護內容存入瀏覽器快取。

我們來看看編輯與預覽的實際版面：
![編輯器與即時預覽](image-1.png)

### 🔐 2. 隱私、版本控制與安全分享 (Privacy, Versioning & Sharing)
- **編輯鎖與閱讀鎖分離**：支援設定筆記密碼。`編輯鎖`僅限制未授權者的修改權，訪客仍可閱讀並透過左下角「編輯」按鈕輸入密碼解鎖；`閱讀鎖`則限制整篇筆記的閱讀與修改，密碼均經 Salted MD5 雜湊保護。英文介面使用 `Edit Lock` 與 `View Lock`。
- **D1 歷史版本快照**：透過 Cloudflare D1 資料庫自動儲存版本歷史。預設開啟 5 分鐘快照防刷節流，每篇保留最近 10 份快照，可在 Footer 「版本」選單中預覽、複製或一鍵還原。
- **簡報模式與 PDF 導出**：支援以標準 `---` 進行 Markdown 分頁，一鍵將 Markdown 轉為幻燈片全螢幕簡報。針對 `@media print` 進行版面優化，列印或導出為 PDF 時會自動隱藏所有工具列，解決內容被裁剪或高度限制的痛點。
- **發布控制與 SEO 優化**：支援生成唯讀分享頁，並提供 localStorage 分享紀錄。建立分享後可選擇是否加入公開網站地圖（`/sitemap.xml`）。分享頁支援 Open Graph 與 Twitter 社群預覽卡片。

以下是安全存取權限的整合規劃：
![權限防護設計](image-2.png)

### 🤖 3. 無頭 CMS 與 AI Agent 生態 (Headless CMS & AI Agent Integration)
- **LLM & AI Agent API**：支援外部 App 透過 REST API (`/api/:path`) 讀寫與接續撰寫 (Append)。支援 JSON、`text/markdown` 與 `multipart/form-data` 多種格式，降低 LLM 寫長文時的跳脫字元失敗率。
- **原生圖片上傳**：支援 API 圖片上傳 (`/api/upload`) 與自動 Markdown 連結。
- **Discovery 發現端點**：部署完成後，站點會提供 `/.well-known/api-catalog`、`/.well-known/agent-skills/index.json` 等 AI 探索入口，支援 RFC 9727 格式。

---

## 💾 儲存位置盤點

### Server / Cloudflare

| 儲存位置 | 保存內容 | 備註 |
| --- | --- | --- |
| `NOTES` KV | Markdown 文章內容與逐篇 metadata：`theme`、`width`、`shareFont`、`mode`、`share`、`shareSlug`、`publicIndex`、`autosave`、`annotationsEnabled`、`updateAt`、`pw`／`vpw` 雜湊，以及相容舊資料的 `title`／`views` | 未發布文章不保存 Markdown 內容；但從首頁建立新筆記時，隨機 Theme 會立即寫入一次 metadata |
| `SHARE` KV | Share slug／舊版 MD5 Share ID 到文章 path 的對照 | 不保存文章本文 |
| D1 `note_history` | 歷史版本的文章 path、舊內容與建立時間 | 受版本上限與最短快照間隔控制 |
| D1 `note_stats`、`note_view_devices` | 文章瀏覽總數、最後瀏覽時間、文章與匿名裝置 hash 的去重紀錄 | Server 不保存原始裝置 UUID，只保存 SHA-256 hash |
| D1 `annotation_threads`、`annotation_messages` | 段落錨點、原文摘錄、前後文、來源 revision、留言與回覆 | 原文刪除後討論仍保留 |
| `IMAGES` R2 | 透過內建圖片上傳保存的圖片檔案 | 文章只保存公開圖片 URL |
| 外部服務 | 888box 附件與 WebTalk 自己管理的資料 | 不在此專案的 KV／D1／R2 內 |

Markdown 預覽 Theme 的正式來源是 `NOTES` KV metadata。它不保存在 localStorage；只有新筆記第一次從首頁開啟時隨機抽選，之後 Edit 與 Share 都讀取 Server 已保存值。

### Browser localStorage

| Key | 保存內容 | 是否同步 Server |
| --- | --- | --- |
| `cf-notepad-preview-width` | 最近使用的預覽寬度 fallback | 是；逐篇 `width` 也保存到 KV，Server 值優先 |
| `cf-notepad-preview-device` | Desktop／Mobile 預覽裝置 | 否 |
| `cf-notepad-split-direction` | 左右／上下編輯器排列 | 否 |
| `cf-notepad-share-font` | 最近使用的 Share 字型 fallback | 是；逐篇 `shareFont` 也保存到 KV，Server 值優先 |
| `cf-notepad-ui-theme` | 編輯器介面的 `auto`／`light`／`dark` | 否；這不是 Markdown 預覽 Theme |
| `cf-notepad-autosave` | Autosave UI 的本機鏡像／相容值 | 真正逐篇 Autosave 狀態保存在 KV |
| `cf-notepad:share-history:created` | 本裝置最近建立的 Share，最多 20 筆 | 否 |
| `cf-notepad:share-history:viewed` | 本裝置最近瀏覽的 Share，最多 20 筆 | 否 |
| `cf-notepad:annotation-author` | 留言表單最近使用的顯示名稱 | 否 |

### sessionStorage 與 Cookie

| 類型 | Key | 用途 |
| --- | --- | --- |
| sessionStorage | `cf-notepad:pending-presentation-destination` | 密碼驗證前暫存簡報返回位置；同一分頁使用後即刪除 |
| Cookie | `lang` | 介面語言偏好 |
| HttpOnly Cookie | `auth` | 逐篇、具 path scope 的 Edit／View JWT，預設 7 天 |
| HttpOnly Cookie | `cn_device` | 匿名瀏覽裝置 UUID，D1 只保存其 hash，預設 1 年 |
| HttpOnly Cookie | `admin_session` | 管理後台 session，預設 1 天 |

---

## 🛠️ 部署教學

### 前置準備
- 已安裝 Node.js 與 npm。
- 擁有 Cloudflare 帳戶並安裝 Wrangler CLI：`npm install -g wrangler`

### 1. 初始化專案與建立 KV
```bash
cp wrangler.toml.example wrangler.toml
wrangler kv:namespace create "NOTES"
wrangler kv:namespace create "SHARE"
```
將生成的 ID 填入 `wrangler.toml` 的 `kv_namespaces` 部分。

### 2. 建立 D1 歷史版本資料庫（選用）
```bash
wrangler d1 create cloud-notepad-history
wrangler d1 execute cloud-notepad-history --file=./schema/note_history.sql
```
將生成的 `database_id` 填入 `wrangler.toml` 內 `[[d1_databases]]`。

### 3. 設定 R2 圖片上傳（選用）
在 Cloudflare 建立一個 R2 Bucket 並綁定公開網域：
- 於 `wrangler.toml` 中解除 `[[r2_buckets]]` 的註解並設定 `bucket_name`。
- 設定環境變數 `SCN_ENABLE_R2="1"` 與 `SCN_R2_DOMAIN="你的公開網址"`。

### 4. 設定環境密鑰 (Secrets)
請於 Cloudflare 網頁後台設定以下環境變數，或使用 `wrangler secret put <變數名稱>` 寫入：
- `SCN_SALT`: 加鹽字串（建議 UUID，越長越安全）
- `SCN_SECRET`: JWT 密鑰字串
- `SCN_ADMIN_PATH`: 後台管理路徑（例如 `/super-admin-777`）
- `SCN_ADMIN_PW`: 後台管理密碼
- `SCN_SLUG_LENGTH`: 隨機網址長度（預設為 `3`）
- `SCN_ENABLE_NOTE_HISTORY`: 設為 `"1"` 啟用 D1 版本紀錄
- `SCN_GA_MEASUREMENT_ID`: GA 追蹤碼（選用）

後台路徑與密碼會在每次 request 讀取 Cloudflare Worker bindings；修改 `SCN_ADMIN_PATH` 後重新部署，即可使用設定的路徑進入超級管理員後台。

超級管理員後台提供：URL 總數、發佈／Sitemap／鎖定摘要、標題／URL 搜尋、Markdown 全文搜尋、最後修改日期區間、點擊欄位排序、分頁、批次刪除、空白頁清理，以及 D1 保留版本數。`views` 僅顯示舊 metadata 中仍存在的累計值，目前不會被自動遞增。

### 5. 部署
```bash
npm install
npm run deploy
```

---

## 🔍 系統發現端點 (Discovery Endpoints)

部署完成後，站點會提供以下 Crawler-Friendly 與 Agent 友善端點：
- `GET /.well-known/api-catalog`：回傳 RFC 9727 格式 Linkset JSON。
- `GET /.well-known/agent-skills/index.json`：Agent Skills Discovery 索引。
- `GET /.well-known/agent-skills/david888-wiki-publisher/SKILL.md`：Agent 可直讀的 Skill 說明書。
- `GET /auth.md`：說明目前的 API 認證方式。
- `GET /robots.txt`：搜尋引擎與 AI 爬蟲（AI Crawler）的 Allow/Disallow 規則與偏好聲明。
- `Accept: text/markdown` 協商：當請求帶有此 Header 時，`/share/...` 或 `/:path` 將直接回傳原始 Markdown 文字而非 HTML。

---
---

# English Version

## 🤖 AI Agent & LLM Integration

This project natively supports being used by AI Agents (e.g., Antigravity, Cursor, Claude Desktop, OpenClaw, or n8n) as an "external brain" or "auto-publishing platform".

### 1. Zero-Install MCP Server
We provide a Python-based Model Context Protocol (MCP) server that runs remotely via Python `uv`:
- **Cursor / Claude Desktop Configuration**:
  - **Type**: `command`
  - **Command**: `uv run https://raw.githubusercontent.com/tbdavid2019/cf-notepad/main/mcp/server.py`
  - *(See details in [mcp/README.md](./mcp/README.md))*

### 2. Antigravity AI Skills
Copy the contents of the `skills/` directory to your `~/.gemini/antigravity/skills/` directory.
- **Auto-Discovery**: Agents can discover and load this skill at `/.well-known/agent-skills/david888-wiki-publisher/SKILL.md`.
- **Feature Coverage**: The published skill documents the browser editor toolbar, ECharts, bilingual startup tips, keyboard shortcuts, Copy, image insertion, 888box attachment uploads, view locks, and the admin dashboard. It is generated from `skills/SKILL.md`.
- **Freshness Rule**: Agents must fetch the canonical skill URL before every skill invocation with `Cache-Control: no-cache`; local or cached guidance is only a documented fallback when the website is unavailable.

### 3. One-Click Prompt (For ChatGPT / Claude Web)
Copy this prompt and paste it to ChatGPT or Claude to let them draft and auto-publish directly to your wiki:
```text
This is a deployed Wiki platform functioning as a Headless CMS publishing API: `https://your-wiki-domain.com/api`.
Please act as my writing assistant to draft and publish articles based on my requests.
For operational guidelines, please read the following document (use your web-browsing/execution tools to fetch it):
👉 https://raw.githubusercontent.com/tbdavid2019/cf-notepad/main/LLM_API_DOCS.md
Use the cURL/HTTP request tools detailed in that document to save the content once you finish writing, and give me the URL of the published article.
```

---

## ✨ Integrated Features

### 🚀 1. Writing & Editing Experience
- **Typography & Layout**: Chinese text defaults to `GenJyuu Gothic`, while Latin text and code retain `Maple Mono` / `JetBrains Mono` for the existing English reading experience. Features a `Width` selector (Full / 960 / 1200 / 1440), 20+ polished CSS themes (defaulting to the humanist `claude-canvas`), and a draggable pane layout (double-click to reset 50/50).
- **Compact Footer Controls**: Preview, publishing, saving, lock, font, language, layout, and device controls use compact icon and two-state controls. Editor and Share actions expose localized instant floating tooltips on hover, touch, and keyboard focus; the body-level tooltip layer stays visible outside horizontal scrollers. Width options include their own context so the footer stays compact. Toasts and confirmations use a centered in-app treatment.
- **Save Policy**: Unpublished note content is not persisted. Publishing saves the current editor content in the same operation; published notes offer a manual Save button and optional per-note Autosave that waits 10 seconds after typing stops. Use the View Lock when a published note should not be openly readable.
- **Editor View Settings**: Preview, layout, and device controls are grouped together as one editor view-settings group for faster layout adjustments.
- **Reading Progress & Editor Status**: A clickable vertical progress rail at the left of Preview and Share pages shows the reader's position through a long article. The editor's bottom-left status bar reports the current line, column, and total text length.
- **Copy Rendered Content**: The Footer places Copy beside Markdown Export and writes rich HTML plus Markdown/plain-text fallback for editors such as Notion and Jira. Rich HTML comes from the sanitized snapshot before media preview decoration, so YouTube/PDF iframes are not pasted into external editors. A check animation confirms successful copying.
- **Theme Descriptions**: Theme names remain complete and are paired with localized Traditional Chinese or English descriptions, with the selected theme's full description available through its tooltip.
- **Random Theme for New Notes**: A theme is randomized only when the root site creates a brand-new random note path, then immediately persisted to server metadata. Reopening an existing author Edit keeps its saved theme. Empty new tabs use a human title such as `New note · 07/30 09:05` instead of exposing the random path.
- **HackMD Image Dimensions**: Supports `![image](URL =600x)`, `=600x400`, and `=x400` with numeric-only dimensions and responsive maximum width.
- **Two/Three-Column Layouts**: Edit toolbar actions wrap selected Markdown in `two-column-layout` or `three-column-layout` containers. Heading sections become columns and stack on narrow screens.
- **Dynamic Welcome Tips**: On each new or empty editor load, a random bilingual tip from `static/data/editor-tips.json` is typed below the Tagore poem with the same synchronized **typewriter animation**.
- **AI-Assisted Writing**:
  - **AI Formatting**: The `gpt-oss-20b` formatter only improves Markdown structure, whitespace, headings, and lists. It preserves the source language, prose, links, and content rather than translating or rewriting; an English note is not replaced if the result introduces Chinese. With a selection, it formats only that selection.
  - **AI Translate / Bilingual**: A separate icon-only top-toolbar translation action uses `gpt-oss-120b`. Choose the target language, then choose a translation-only result or a bilingual document that retains the original text. With a selection, it translates only that selection.
  - **Editor Toolbar AI Formatting**: Start the formatting-only flow directly from the top Markdown toolbar.
  - **AI Editing & Generation**: Integrated "AI Edit" button leveraging the `gpt-oss-120b` model, allowing instruction-based section insertion, partial rewriting, or full-note copy refinement and content generation.
  - **Contextual Selection Shortcut**: Selecting text inside the editor exposes floating Format, AI Edit, and Translate shortcuts. Each action changes only the highlighted selection and leaves the remainder of the note untouched.
- **Markdown Editor Toolbar**: Editable Markdown notes include headings, emphasis, strikethrough, links, quotes, lists, task lists, inline code, code blocks, horizontal rules, a three-column table template, image insertion, attachment upload, fullscreen editing, Undo / Redo, AI formatting, AI Translate / Bilingual, and a Table of Contents action. The Table of Contents action inserts a standalone `[TOC]`, which renders a linked outline from `#`, `##`, `###`, and deeper headings. Labels and placeholders follow the selected interface language.
- **Image Insertion**: With R2 enabled, choose an image from the toolbar to upload it and insert a Markdown image link automatically. Without R2, the toolbar inserts an editable Markdown image placeholder.
- **888box Attachment Uploads**: Use the toolbar attachment button to upload videos, audio, documents, archives, and generic files to `box.david888.com`, falling back to `box.aiurl.tw` and then `box.glsoft.ai`. The editor inserts `<video>` for videos, `<audio>` for audio, and Markdown links for files. Images continue to use the built-in R2 upload flow.
- **Media URL Previews**: The preview pane detects PDF, YouTube, video, and audio links, rendering PDF and privacy-enhanced YouTube iframes or native video/audio players while retaining the original link as a fallback.
- **WebTalk Page Identity**: Share pages expose `<meta name="webtalk-page-id" content="...">` in the document head so an embedded chat can bind itself to the correct Wiki share ID.
- **ECharts Charts**: Use fenced `echarts` blocks containing JSON chart options to render interactive charts in the preview.
- **View Shortcuts**: `⌘-⌥-7` / `Ctrl-Alt-7` selects side-by-side WYSIWYG, `⌘-⌥-8` / `Ctrl-Alt-8` selects pure Markdown, and `⌘-⌥-9` / `Ctrl-Alt-9` selects stacked WYSIWYG.
- **Lock Policy**: `Edit Lock` protects modifications and `View Lock` protects reading. When only a View Lock exists, its password is the sole owner credential and can unlock editing; when both locks exist, the View Lock is read-only and the Edit Lock is required to modify the note.

```echarts
{
  "title": { "text": "Traffic sources" },
  "tooltip": { "trigger": "item" },
  "series": [{
    "type": "pie",
    "data": [
      { "value": 1048, "name": "Search" },
      { "value": 735, "name": "Direct" },
      { "value": 580, "name": "Referral" }
    ]
  }]
}
```
- **Responsive Mobile Layout**: Keeps Edit and Share footers in one touch-scrollable row. Every icon control has an instant localized floating tooltip, and the published-state `...` menu floats outside the footer instead of being clipped by it.
- **Mobile-Friendly Reading**: Tables wrap cell texts and code snippets safely; long pages feature a smooth `＾` back-to-top button.
- **Installable PWA with Safe Offline Handling**: In supported Android Chromium browsers, an in-page Install app action appears after the browser reports the PWA is installable; clicking it opens the native install confirmation. CSS directly suppresses this promotion in installed standalone windows, and `×` closes it immediately even before the prompt module loads. You can also choose Install app or Add to Home Screen from the browser menu to launch the notepad in a standalone window. Offline navigation shows a built-in fallback page. Notes, Share pages, and API responses are deliberately not cached, so offline reading/editing is not available and protected content is never stored in browser cache.

See the real editor and preview interface here:
![Editor and Real-Time Preview](image-1.png)

## 💾 Storage Inventory

### Server / Cloudflare

| Storage | Data |
| --- | --- |
| `NOTES` KV | Markdown content and per-note metadata, including theme, width, Share font, mode, publishing state, Share slug, sitemap state, Autosave, annotations, update time, and password hashes |
| `SHARE` KV | Share slug and legacy Share-ID mappings to note paths |
| D1 | Version history, unique view totals/device hashes, annotation threads, anchors, messages, and replies |
| `IMAGES` R2 | Images uploaded through the built-in image flow |
| External services | 888box attachments and WebTalk-managed data are not stored in this project's KV, D1, or R2 |

The persisted Markdown preview theme lives in `NOTES` KV metadata, not localStorage. Unpublished Markdown content remains browser-only, while the initial randomized theme for a root-created new note is written to metadata once.

### Browser localStorage

| Key | Data |
| --- | --- |
| `cf-notepad-preview-width` | Last preview-width fallback; per-note width also exists on the server |
| `cf-notepad-preview-device` | Desktop/mobile preview mode |
| `cf-notepad-split-direction` | Side-by-side/stacked editor layout |
| `cf-notepad-share-font` | Last Share-font fallback; per-note font also exists on the server |
| `cf-notepad-ui-theme` | Editor chrome auto/light/dark preference; not the Markdown theme |
| `cf-notepad-autosave` | Local UI mirror; actual per-note Autosave state is server metadata |
| `cf-notepad:share-history:created` | Up to 20 recently created Share links |
| `cf-notepad:share-history:viewed` | Up to 20 recently viewed Share links |
| `cf-notepad:annotation-author` | Last annotation display name |

`sessionStorage` only keeps `cf-notepad:pending-presentation-destination`. Cookies keep language, path-scoped authentication, the anonymous view-device UUID, and the admin session; D1 stores only the SHA-256 device hash.

## 🧭 開發維護 / Maintenance for Contributors and LLMs

新增或修改使用者可見功能時，請同步更新以下三個地方：

1. `CHANGELOG.md`：記錄本次變更。
2. `README.md`：補充功能說明與使用方式。
3. `static/data/editor-tips.json`：若功能值得在編輯器啟動時提醒使用者，加入 `id`、`zh-TW` 與 `en-US` 三個欄位。

When adding or changing a user-facing feature, update all three sources together: `CHANGELOG.md` for the release record, `README.md` for the feature documentation, and `static/data/editor-tips.json` when the feature deserves a startup tip. Keep every tip localized with both `zh-TW` and `en-US` fields.

Keep agent-facing guidance synchronized as well: update `skills/SKILL.md` for the published agent skill, `LLM_API_DOCS.md` for HTTP/API agents, and `mcp/README.md` plus MCP tool docstrings for MCP clients. Run `node scripts/generate-agent-skill.mjs` after changing either generated source document.

### 🔐 2. Privacy, Versioning & Secure Sharing
- **Access Control Separation**: Distinct "Edit Lock" and "View Lock" policies use Salted MD5 hashes and in-page password modals. An Edit Lock restricts writing; a View Lock restricts reading; with only a View Lock it is also the sole owner/edit credential, while with both locks the View Lock is read-only and the Edit Lock is required to write.
- **D1 Snapshot History**: Automatically saves content snapshots to Cloudflare D1 with a 5-minute cooldown and a max limit of 10 versions. Editors can preview, restore, or copy text from historical versions.
- **Presentation Mode & PDF Export**: Splice slides using standard `---` page breaks for fullscreen Slidev-like presentations. Presentations use a bordered 16:9 canvas with safe content margins, readable overflow handling, and a landscape prompt on portrait phones. Custom `@media print` CSS hides controls, overrides page heights, and prevents text clipping during PDF exports.
- **Public Index Sitemap**: Opt-in public indexing allows you to choose which shared pages appear in `sitemap.xml`. Shared pages emit server-rendered Open Graph / Twitter metadata and prefer stronger human-readable titles when available.

This is the integrated diagram of our access control model:
![Access Control Diagram](image-2.png)

### 🤖 3. Headless CMS & AI Agent Integration
- **LLM / API Publishing**: `POST /api/:path` supports JSON, raw `text/markdown`, and `multipart/form-data` uploads.
- **Native Image Upload**: The API supports image upload at `/api/upload` with automatic markdown image tags.
- **Discovery Endpoints**: The homepage emits standard Link headers, RFC 9727 Linksets, and sitemaps so AI agents can query API capabilities and documentation dynamically.

---

## 🛠️ Deployment Guide

### Prerequisites
- Node.js and npm installed.
- A Cloudflare account and Wrangler CLI: `npm install -g wrangler`

### 1. Initialize Project & Create KV
```bash
cp wrangler.toml.example wrangler.toml
wrangler kv:namespace create "NOTES"
wrangler kv:namespace create "SHARE"
```
Paste the IDs into the `kv_namespaces` array in `wrangler.toml`.

### 2. Create D1 Version History Database (Optional)
```bash
wrangler d1 create cloud-notepad-history
wrangler d1 execute cloud-notepad-history --file=./schema/note_history.sql
```
Paste the `database_id` into the `[[d1_databases]]` section of `wrangler.toml`.

### 3. Setup R2 Image Uploads (Optional)
Create an R2 Bucket in Cloudflare and allow public domain access:
- Uncomment `[[r2_buckets]]` and set `bucket_name` in `wrangler.toml`.
- Set secrets `SCN_ENABLE_R2="1"` and `SCN_R2_DOMAIN="https://your-r2-domain.com"`.

### 4. Set Environment Secrets
Set the following secrets in your Cloudflare dashboard or via `wrangler secret put <VAR_NAME>`:
- `SCN_SALT`: Password hashing salt (use a long random UUID).
- `SCN_SECRET`: JWT encryption key.
- `SCN_ADMIN_PATH`: Admin dashboard path (e.g., `/super-admin-777`).
- `SCN_ADMIN_PW`: Admin dashboard password.
- `SCN_SLUG_LENGTH`: Length of random share URLs (default is `3`).
- `SCN_ENABLE_NOTE_HISTORY`: Set to `"1"` to enable the D1 history panel.
- `SCN_GA_MEASUREMENT_ID`: Google Analytics tracking ID (Optional).

The admin path and password are resolved from Cloudflare Worker bindings per request. After changing `SCN_ADMIN_PATH`, redeploy the Worker before opening the configured super-admin route.

The super-admin dashboard includes URL totals, published/Sitemap/protected summaries, title/URL search, Markdown full-text search, modified-date filters, clickable column sorting, pagination, batch cleanup, and retained D1 version counts. `views` is shown only as a legacy metadata total; it is not currently incremented.

### 5. Deploy
```bash
npm install
npm run deploy
```

---

## 🔍 Discovery Endpoints

Once deployed, your wiki exposes these standard discovery entry points:
- `GET /.well-known/api-catalog`：RFC 9727 Linkset JSON detailing endpoints.
- `GET /.well-known/agent-skills/index.json`：Agent Skills Discovery index.
- `GET /.well-known/agent-skills/david888-wiki-publisher/SKILL.md`：Skill instructions for LLM ingestion.
- `GET /auth.md`：Authentication specification.
- `GET /robots.txt`：Allow/Disallow rules and preference declarations for AI crawlers.
- `Accept: text/markdown` Negotiation: When requested, `/share/...` or `/:path` pages directly return raw Markdown strings.

---

*Forked from [s0urcelab/serverless-cloud-notepad](https://github.com/s0urcelab/serverless-cloud-notepad).*

*See full developer logs in [CHANGELOG.md](./CHANGELOG.md).*

### API Write Demo:
```bash
curl -X POST "https://wiki.david888.com/api/api_test_demo_2" \
  -H "Content-Type: application/json" \
  -d '{
    "content": "## Headless API Write Test\nWritten via API."
  }'
```

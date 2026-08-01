# Cloud Notepad - Serverless Wiki Notepad on Cloudflare Workers

![Banner](image.png)

Cloud Notepad is a lightweight cloud notepad and headless CMS. It runs on Cloudflare Workers. It supports live Markdown preview, password locks, D1 version history, presentation slides, an admin dashboard, an MCP server, and AI Agent Skills.

👉 **⚠️ 給 AI 與開發者：若需使用 API 進行讀寫，請存取專屬 Skill 規格表：[SKILL.md](https://wiki.david888.com/.well-known/agent-skills/david888-wiki-publisher/SKILL.md) 或 [LLM_API_DOCS.md](./LLM_API_DOCS.md) ⚠️**

---

## 語言 / Languages

- [繁體中文 (Traditional Chinese)](#繁體中文)
- [English Version](#english-version)

---

# 繁體中文

## 🤖 AI Agent 與 LLM 生態整合

AI 代理（如 Antigravity、Cursor、Claude Desktop、OpenClaw 或 n8n）可以直接將本專案當作外部大腦與發文平台使用。

### 1. 一鍵呼叫發文 Prompt (給 GPT / Claude 網頁版)
複製以下文字並貼給 ChatGPT 或 Claude 網頁版，AI 即可自動撰寫文章並發布：

```text
這是一台架設好的 Wiki 記事本，具備無頭 CMS 的發文 API：`https://wiki.david888.com/api`。
請你擔任我的寫作助理，根據我的需求撰寫文章並發布。
操作指南請閱讀以下檔案內容（請運用你的上網 / 執行工具讀取）：
👉 https://wiki.david888.com/.well-known/agent-skills/david888-wiki-publisher/SKILL.md
請你使用上述檔案的 cURL/HTTP 請求，完成寫作後將內容存檔，並把最後發布的文章網址給我。
```

### 2. Antigravity AI Skills
專屬 Skill 規格書可於 `https://wiki.david888.com/.well-known/agent-skills/david888-wiki-publisher/SKILL.md` 自動探索與讀取。您也可以將 `skills/` 資料夾複製到本機 `~/.gemini/antigravity/skills/` 目錄。

### 3. 零安裝 MCP 伺服器
提供符合 Model Context Protocol (MCP) 規範的伺服器，使用 Python `uv` 遠端執行：
- **Cursor / Claude Desktop 設定**：
  - **Type**: `command`
  - **Command**: `uv run https://raw.githubusercontent.com/tbdavid2019/cf-notepad/main/mcp/server.py`
  - *(詳細說明請見 [mcp/README.md](./mcp/README.md))*

---

## ✨ 核心功能特色

### 🚀 1. 寫作與編輯體驗
- **字體與主題**：繁體中文預設使用 `GenJyuu Gothic`，英文與程式碼使用 `Maple Mono`／`JetBrains Mono`。Footer 內建寬度切換（Full / 960 / 1200 / 1440）與 20+ 款 CSS 預覽主題（預設 `claude-canvas`）。
- **工具列功能**：提供標題、粗體、斜體、清單、行內程式碼、程式碼區塊、表格、圖片、附件上傳、全螢幕、Undo/Redo、AI 排版、AI 翻譯/雙語與 `[TOC]` 目錄。
- **附件與圖片儲存**：工具列支援將影片、音訊、文件直接上傳至 `box.david888.com`；圖片上傳使用內建 Cloudflare R2 儲存。
- **媒體與 ECharts 圖表**：預覽區可繪製 `echarts` 圖表，並自動解析 YouTube、PDF 與影音 Player。
- **多欄排版與 PWA**：支援二欄/三欄 Markdown 排版。支援 Android、Mac 與桌面瀏覽器安裝為 PWA 獨立 App。

![編輯器與即時預覽](image-1.png)

### 🔐 2. 隱私與安全分享
- **編輯鎖與閱讀鎖**：提供獨立的「編輯鎖」（限制修改）與「閱讀鎖」（限制閱讀），採用 Salted MD5 雜湊加密。
- **D1 歷史版本快照**：使用 Cloudflare D1 資料庫自動保存版本歷史（5 分鐘節流，保留最近 10 份快照），支援預覽與還原。
- **簡報模式與 PDF 導出**：使用 `---` 分頁切換 16:9 簡報模式。優化 `@media print` 樣式，匯出 PDF 時自動隱藏工具列並防止表格內容截斷。
- **段落註解與精準連結**：讀者可在分享頁劃線進行段落討論並複製精準連結，開啟時會自動捲動並高亮指定段落。

![權限防護設計](image-2.png)

### 🤖 3. 無頭 CMS API
- **REST Publishing API**：`POST /api/:path` 端點接受 JSON、`text/markdown` 與 `multipart/form-data` 格式寫入。
- **Discovery 探索端點**：提供 `/.well-known/api-catalog`、`/.well-known/agent-skills/david888-wiki-publisher/SKILL.md` 與 `Accept: text/markdown` 標頭協商。

---

## 💾 儲存架構盤點

### Server / Cloudflare
| 儲存位置 | 保存內容 | 說明 |
| --- | --- | --- |
| `NOTES` KV | Markdown 文章內容與屬性 (`theme`, `width`, `shareFont`, `publicIndex`, `autosave`, `pw`/`vpw` 雜湊) | 未發布文章不保存內容；新開筆記時儲存初始主題 |
| `SHARE` KV | Share slug 到文章 path 的對照 | 不保存文章本文 |
| D1 `note_history` | 歷史版本快照 (path、舊內容、建立時間) | 留存最新 10 份歷史 |
| D1 `note_stats` | 文章瀏覽數、最後瀏覽時間、匿名裝置 UUID hash | 僅保存 SHA-256 hash |
| D1 `annotation_*` | 劃線段落錨點、原文摘錄、留言與回覆 | 原文修改後討論紀錄仍留存 |
| `IMAGES` R2 | 圖片上傳儲存桶 | 文章內僅保存公開圖片 URL |

### Browser (localStorage / Cookie)
| 類型 | Key | 用途 |
| --- | --- | --- |
| localStorage | `cf-notepad-preview-width` / `share-font` / `ui-theme` | 介面佈局與視覺偏好鏡像 |
| localStorage | `cf-notepad:share-history:*` / `annotation-author` | 本機近 20 筆分享紀錄與註解留言名稱 |
| Cookie | `auth` / `cn_device` / `admin_session` | 具 path scope 的驗證 JWT、匿名裝置 hash 與管理員 session |

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
- `GET /robots.txt`：AI 爬蟲規則與聲明。
- `Accept: text/markdown` 標頭：請求 `/share/...` 或 `/:path` 時直接回傳原始 Markdown。

---
---

# English Version

## 🤖 AI Agent & LLM Integration

AI agents (such as Antigravity, Cursor, Claude Desktop, OpenClaw, or n8n) can use this project directly as an external brain or an auto-publishing platform.

### 1. One-Click Prompt (For ChatGPT / Claude Web)
Copy this prompt and paste it into ChatGPT or Claude Web:

```text
This is a deployed Wiki platform functioning as a Headless CMS publishing API: `https://wiki.david888.com/api`.
Please act as my writing assistant to draft and publish articles based on my requests.
For operational guidelines, please read the following document (use your web-browsing/execution tools to fetch it):
👉 https://wiki.david888.com/.well-known/agent-skills/david888-wiki-publisher/SKILL.md
Use the cURL/HTTP request tools detailed in that document to save the content once you finish writing, and give me the URL of the published article.
```

### 2. Antigravity AI Skills
The canonical skill specification is available at `https://wiki.david888.com/.well-known/agent-skills/david888-wiki-publisher/SKILL.md`.

### 3. Zero-Install MCP Server
Execute the remote MCP server via Python `uv`:
- **Cursor / Claude Desktop Config**:
  - **Type**: `command`
  - **Command**: `uv run https://raw.githubusercontent.com/tbdavid2019/cf-notepad/main/mcp/server.py`
  - *(See details in [mcp/README.md](./mcp/README.md))*

---

## ✨ Features

### 🚀 1. Writing & Editing Experience
- **Typography & Themes**: Defaults to `GenJyuu Gothic` (TC) and `Maple Mono` / `JetBrains Mono` (Latin/Code). Includes 20+ CSS themes, responsive width controls, and draggable split panes.
- **Rich Markdown Tooling**: Headings, formatting, lists, tables, image upload, 888box attachment uploads, ECharts code blocks, TOC generation, Undo/Redo, and AI Translate/Formatting.
- **Media Previews & Columns**: Includes players for YouTube, PDF, Video/Audio links, and two/three-column Markdown layout support.
- **PWA & Offline Guard**: Supports mobile PWA installation and displays a clean offline fallback page.

### 🔐 2. Privacy, Versioning & Sharing
- **Edit & View Locks**: Provides separate Salted MD5 password controls for editing versus reading.
- **D1 Snapshot History**: Automatically backs up content to Cloudflare D1 (5-minute cooldown, retains 10 snapshots).
- **Slide Presentation & PDF Export**: Converts notes to 16:9 slides with `---` dividers. Optimized `@media print` CSS hides UI overlays and prevents table text clipping.
- **Paragraph Annotations**: Select text to start discussions with deep links that scroll and highlight cited text upon opening.

### 🤖 3. Headless CMS API
- **REST Publishing API**: `POST /api/:path` accepts JSON, raw `text/markdown`, and `multipart/form-data`.
- **Discovery Endpoints**: Exposes RFC 9727 Linksets, Agent Skill endpoints, and `Accept: text/markdown` content negotiation.

---

## 🛠️ Quick API Write Demo

```bash
curl -X POST "https://wiki.david888.com/api/api_test_demo" \
  -H "Content-Type: application/json" \
  -d '{
    "content": "## Headless API Write Test\nWritten via API."
  }'
```

---

## 🧭 Maintenance for Contributors & LLMs

When you add or change a user-facing feature, update these three files:
1. `CHANGELOG.md` for the release record.
2. `README.md` for feature documentation.
3. `static/data/editor-tips.json` for bilingual startup tips (`zh-TW` and `en-US`).

Keep agent guidance synchronized across `skills/SKILL.md`, `LLM_API_DOCS.md`, and `mcp/README.md`. Run `node scripts/generate-agent-skill.mjs` after changing generated source documents.

---
*Forked from [s0urcelab/serverless-cloud-notepad](https://github.com/s0urcelab/serverless-cloud-notepad).*  
*See full developer logs in [CHANGELOG.md](./CHANGELOG.md).*

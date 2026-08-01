# Cloud Notepad - 基於 Cloudflare Workers 的無伺服器 Wiki 記事本

![Banner](image.png)

Cloud Notepad 是一個運行在 Cloudflare Workers 上的輕量級、極速且對 AI 友善的雲端記事本與無頭 CMS 平台。支援 Markdown 即時預覽、密碼保護、D1 版本歷史、幻燈片簡報模式，並內建超級管理員後台、MCP 伺服器與 AI Agent 專屬 Skills。

👉 **⚠️ 給 AI 與開發者：若需使用 API 進行讀寫，請存取專屬 Skill 規格表：[SKILL.md](https://wiki.david888.com/.well-known/agent-skills/david888-wiki-publisher/SKILL.md) 或 [LLM_API_DOCS.md](./LLM_API_DOCS.md) ⚠️**

---

## 語言 / Languages

- [繁體中文 (Traditional Chinese)](#繁體中文)
- [English Version](#english-version)

---

# 繁體中文

## 🤖 AI Agent 與 LLM 生態整合

本專案原生支援被 AI 代理（如 Antigravity、Cursor、Claude Desktop、OpenClaw 或 n8n）當作「外部大腦」或「自動發文平台」使用。

### 1. 一鍵呼叫發文 Prompt (給 GPT / Claude 網頁版)
複製以下文字貼給 ChatGPT 或 Claude 網頁版，AI 即可自動為您寫作並發布至您的站點：

```text
這是一台架設好的 Wiki 記事本，具備無頭 CMS 的發文 API：`https://wiki.david888.com/api`。
請你擔任我的寫作助理，根據我的需求撰寫文章並發布。
操作指南請閱讀以下檔案內容（請運用你的上網 / 執行工具讀取）：
👉 https://wiki.david888.com/.well-known/agent-skills/david888-wiki-publisher/SKILL.md
請你使用上述檔案的 cURL/HTTP 請求，完成寫作後將內容存檔，並把最後發布的文章網址給我。
```

### 2. Antigravity AI Skills
本專案內建專屬技能 Skill 說明書。只需將 `skills/` 資料夾下的內容複製到您的 `~/.gemini/antigravity/skills/` 目錄中即可。
- **自動探索與動態載入**：Agent 亦可透過 `https://wiki.david888.com/.well-known/agent-skills/david888-wiki-publisher/SKILL.md` 讀取最新規範。

### 3. 零安裝啟動 MCP 伺服器
我們提供了符合 Model Context Protocol (MCP) 的伺服器，可直接透過 Python `uv` 遠端執行，無須下載任何程式碼：
- **Cursor / Claude Desktop 設定**：
  - **Type**: `command`
  - **Command**: `uv run https://raw.githubusercontent.com/tbdavid2019/cf-notepad/main/mcp/server.py`
  - *(詳細說明請見 [mcp/README.md](./mcp/README.md))*

---

## ✨ 核心功能特色

### 🚀 1. 寫作與編輯體驗 (Writing & Editing)
- **精美字體與佈局**：中文預設使用 `GenJyuu Gothic`，英文字母與程式碼維持 `Maple Mono`／`JetBrains Mono`。Footer 內建寬度切換（Full / 960 / 1200 / 1440）與 20+ 款精美 CSS 預覽主題（預設 `claude-canvas`），支援雙擊 50/50 快速重設分頁。
- **編輯器與工具列**：提供標題、粗體、斜體、刪除線、連結、引用、清單、行內程式碼、程式碼區塊、分隔線、三欄表格、圖片、附件上傳、全螢幕、Undo/Redo、AI 排版、AI 翻譯/雙語與 `[TOC]` 目錄。
- **888box 附件與圖片**：工具列支援將影片、音訊、文件、壓縮檔直接上傳至 `box.david888.com`（備用 fallback 到 `box.aiurl.tw` / `box.glsoft.ai`）；圖片上傳使用內建 Cloudflare R2 儲存。
- **媒體與 ECharts 圖表**：預覽區可動態繪製 `echarts` 區塊，並自動解析 YouTube、PDF、Video/Audio Player 預覽。
- **二欄／三欄排版**：支援 `<div class="two-column-layout">` / `three-column-layout` 多欄橫向佈局。
- **可安裝 PWA 與離線提示**：支援 Android / Mac / 桌面版瀏覽器安裝為 PWA 獨立 App；斷網時顯示離線防護頁面。

![編輯器與即時預覽](image-1.png)

### 🔐 2. 隱私、版本控制與安全分享 (Privacy, Versioning & Sharing)
- **編輯鎖與閱讀鎖分離**：支援獨立的「編輯鎖」（限制修改）與「閱讀鎖」（限制閱讀），均經 Salted MD5 雜湊保護。
- **D1 歷史版本快照**：透過 Cloudflare D1 資料庫自動儲存版本歷史（5 分鐘節流，保留最近 10 份快照），支援預覽、複製與一鍵還原。
- **簡報模式與 PDF 導出**：支援使用 `---` 分頁一鍵切換 16:9 簡報模式；優化 `@media print` 列印樣式，PDF 導出與列印時自動隱藏工具列並防止文字與表格截斷。
- **段落註解與精準連結**：讀者可在分享頁劃線進行段落討論與「複製連結」，收件者開啟後會自動跳轉並高亮指定段落。

![權限防護設計](image-2.png)

### 🤖 3. 無頭 CMS API (Headless CMS & Discovery)
- **LLM & REST API**：支援 `/api/:path` 端點，接受 JSON、`text/markdown` 與 `multipart/form-data` 多種格式寫入與 Append。
- **Discovery 探索端點**：提供 `/.well-known/api-catalog`、`/.well-known/agent-skills/david888-wiki-publisher/SKILL.md`、`/robots.txt` 及 `Accept: text/markdown` 標頭協商。

---

## 💾 儲存架構盤點

### Server / Cloudflare

| 儲存位置 | 保存內容 | 說明 |
| --- | --- | --- |
| `NOTES` KV | Markdown 文章內容與屬性 (`theme`, `width`, `shareFont`, `publicIndex`, `autosave`, `pw`/`vpw` 雜湊) | 未發布文章不保存內容；從首頁新開筆記時自動儲存初始主題 |
| `SHARE` KV | Share slug 到文章 path 的對照 | 不保存文章本文 |
| D1 `note_history` | 歷史版本快照 (path、舊內容、建立時間) | 自動留存最新 10 份歷史 |
| D1 `note_stats` | 文章瀏覽數、最後瀏覽時間、匿名裝置 UUID hash | Server 不留存原始 UUID，僅保存 SHA-256 hash |
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

Native integration for AI Agents (Antigravity, Cursor, Claude Desktop, OpenClaw, or n8n) as a Headless CMS publishing platform.

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
Canonical skill specification is published dynamically at `https://wiki.david888.com/.well-known/agent-skills/david888-wiki-publisher/SKILL.md`.

### 3. Zero-Install MCP Server
Remote MCP server execution via Python `uv`:
- **Cursor / Claude Desktop Config**:
  - **Type**: `command`
  - **Command**: `uv run https://raw.githubusercontent.com/tbdavid2019/cf-notepad/main/mcp/server.py`
  - *(See details in [mcp/README.md](./mcp/README.md))*

---

## ✨ Features

### 🚀 1. Writing & Editing Experience
- **Typography & Themes**: Defaults to `GenJyuu Gothic` (TC) and `Maple Mono` / `JetBrains Mono` (Latin/Code). Includes 20+ CSS themes, responsive width controls, and draggable split panes.
- **Rich Markdown Tooling**: Headings, formatting, lists, tables, image upload, 888box attachment uploads, ECharts code blocks, TOC generation, Undo/Redo, and AI Translate/Formatting.
- **Media Previews & Columns**: Built-in players for YouTube, PDF, Video/Audio links, and two/three-column Markdown layout support.
- **PWA & Offline Guard**: Mobile PWA installation support and clean offline fallback page.

### 🔐 2. Privacy, Versioning & Sharing
- **Edit & View Locks**: Distinct Salted MD5 password controls for editing vs reading.
- **D1 Snapshot History**: Automated D1 database backups (5-min cooldown, 10 snapshots retained).
- **Slide Presentation & PDF Export**: Convert notes to 16:9 slides using `---` dividers. Optimized `@media print` hides UI overlays and prevents table text clipping.
- **Paragraph Annotations**: Highlight text to initiate discussion, with deep links that scroll and highlight cited text upon load.

### 🤖 3. Headless CMS API
- **REST Publishing API**: `POST /api/:path` accepts JSON, raw `text/markdown`, and `multipart/form-data`.
- **Discovery**: Exposes RFC 9727 Linksets, Agent Skill endpoints, and `Accept: text/markdown` content negotiation.

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

When adding or changing a user-facing feature, update all three sources together:
1. `CHANGELOG.md` for the release record.
2. `README.md` for feature documentation.
3. `static/data/editor-tips.json` for bilingual startup tips (`zh-TW` and `en-US`).

Keep agent guidance synchronized across `skills/SKILL.md`, `LLM_API_DOCS.md`, and `mcp/README.md`. Run `node scripts/generate-agent-skill.mjs` after changing generated source documents.

---
*Forked from [s0urcelab/serverless-cloud-notepad](https://github.com/s0urcelab/serverless-cloud-notepad).*  
*See full developer logs in [CHANGELOG.md](./CHANGELOG.md).*

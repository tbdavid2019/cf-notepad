# Cloud Notepad - 基於 Cloudflare Workers 的無伺服器記事本
![alt text](image.png)
是一個運行在 Cloudflare Workers 上的輕量級雲端記事本。

它支援 Markdown 預覽、密碼保護、分享功能，以及一個隱藏的超級管理員介面。

👉 **⚠️ 給 AI 與開發生態：若需使用 API 寫入/讀取文章，請務必先閱讀完整規格表：[LLM_API_DOCS.md](./LLM_API_DOCS.md) ⚠️**

## 功能特色

- **核心能力**
  - **輕量快速**：基於 Cloudflare Edge Network，全球存取速度極快。
  - **Markdown 支援**：內建 Markdown 渲染 (marked.js) 與 DOMPurify 安全過濾。
  - **Mermaid 圖表穩定渲染**：針對 Mermaid 流程圖補強 CJK 字型量測與 SVG 邊界設定，降低中英混排節點文字被截斷或裁切的機率。
  - **站內 Icon**：內建 note SVG icon，Worker 會同時輸出 `/icon.svg`、`/icon.png`、`/favicon.ico`，並作為分享頁的社群預覽圖示（OG / Twitter image）。

- **編輯與閱讀體驗**
  - **編輯體驗升級**：編輯區與預覽區預設使用 `Maple Mono` 字體，長文與程式碼閱讀更一致。
  - **介面語系**：目前維護 `zh-TW` 與 `en-US` 兩套 UI 文案；中文瀏覽器語系會使用繁中介面，其他語言預設英文，footer 可手動切換 `En / Zh`。
  - **桌面 / 手機預覽切換**：編輯頁 footer 提供 `桌面 / 手機` 分段按鈕，可將右側 Markdown 預覽切換為 mobile 模擬寬度；目前會寫入該篇筆記 metadata，重新開啟同一篇 note 時會沿用同一組 preview device 設定。
  - **預覽分隔線**：左右 pane 可拖曳調整；切換桌面/手機時會回到 50/50，雙擊分隔線也可重設中央。
  - **預覽寬度快捷控制**：footer 內建 `Width` 切換，可快速在 `Full / 960 / 1200 / 1440` 間切換；設定會寫入該篇筆記 metadata，share 頁會沿用相同寬度，而不是只存在單一瀏覽器。
  - **多款預覽主題**：內建 `ayu-light`、`bauhaus`、`botanical`、`catppuccin-latte`、`catppuccin-macchiato`、`claude-canvas`、`green-simple`、`kanagawa`、`maximalism`、`neo-brutalism`、`newsprint`、`notion-clean`、`organic`、`playful-geometric`、`professional`、`retro`、`shopify-mint`、`sketch`、`terminal`、`tokyo-night`、`x-ai` 等多種 Markdown 預覽主題；目前全站預設為 `catppuccin-macchiato`。
  - **分享頁字體切換**：editor / share footer 內建 `Font: JB Mono / Maple` 字型切換，預設使用 `JetBrains Mono`，也可切回 `Maple Mono`；設定會寫入該篇筆記 metadata，share 連結打開後所有讀者都會看到相同字型。
  - **分享頁字級統一**：分享模式會以一致的閱讀字級統一正文、標題與程式碼字級，避免切換主題時忽大忽小。
  - **分享頁行動版 Bottom Sheet 與滾動優化**：在手機上 Footer 重構為精簡的圓角膠囊工具列，僅保留編輯區按鈕；點擊 footer 其他區域時，會從底部平滑滑出精美 Bottom Sheet 抽屜面板，以卡片式分區收納「發佈 / 外觀 / 資訊」設定，支援向下滑動手勢關閉與觸控防穿透。向下閱讀時會自動隱藏，向上滑動或滑到頁面頂端/底部時會自動顯示（方向感知，去除了 900ms 強制彈出閃爍的問題）。
  - **手機表格自適應**：手機模擬與真實 mobile share 頁會使用固定欄位布局，長文字、參數與 inline code 可自動換行，不再凸出 viewport。
  - **長文閱讀輔助**：share 頁長文向下閱讀後會出現 `＾` 回到頂部按鈕，可快速回到文章開頭。
  - **分享錨點連結**：分享頁 Markdown 標題會產生穩定的 heading id，支援直接用 `#...` 跳到指定章節，包含中英文混合標題；同時支援既有 TOC 常見的 compact slug。
  - **分享預覽優化**：分享頁現在會輸出 server-side 的 Open Graph / Twitter metadata，Slack 與其他 unfurl 工具能更穩定讀到標題與摘要；若 metadata title 是短 slug，會改用正文中較完整的可讀標題，且分享卡不強調站名以避免壓過文章標題。
  - **Footer 四欄邏輯分區**：Footer 從三欄重組為四欄邏輯分區：**編輯**（Lock、Preview、檔案匯入匯出、版本紀錄）、**發佈**（Share、Present、最近分享紀錄）、**外觀**（Font、Lang、Width、Theme）、**資訊**（GitHub、Docs、Saved time）。版本紀錄（D1）與最近分享紀錄（localStorage）明確分開，不再混在同一個下拉選單。

- **分享、隱私與內容生命週期**
  - **隱私保護**：可為個別筆記設定密碼 (Salted MD5 雜湊儲存)。
  - **編輯鎖 / 閱讀鎖語義分離**：`編輯鎖 (Edit Lock)` 只會鎖定編輯權限，未授權訪客仍可閱讀；`閱讀鎖 (Read Lock)` 會同時鎖定閱讀與編輯，必須先通過密碼驗證。
  - **唯讀轉編輯解鎖**：當筆記只有 `編輯鎖` 時，訪客打開直連頁會看到唯讀內容，左下 `edit` 可直接喚起密碼框並升級進入編輯畫面。
  - **遮蔽密碼輸入**：站內密碼輸入已改為頁內遮蔽 modal，不再使用會明文顯示的瀏覽器 `prompt()`。
  - **分享功能**：可產生唯讀的分享連結。
  - **最近分享紀錄**：footer 提供「最近分享」入口，使用瀏覽器 localStorage 分別保存「我分享的」與「我看過的」share URL，不增加後端 KV 寫入。
  - **發布引導**：使用者在編輯輸入區停留 3 分鐘且內容尚未發布時，會跳出發布分享提示，協助取得 share URL。
  - **公開索引 Opt-In**：分享連結建立後，系統會額外詢問是否加入公開索引；預設不加入，只有明確同意的分享才會標記進入根目錄的 `/sitemap.xml`。
  - **分享頁不追蹤瀏覽數**：預設不寫入 share view 計數，避免 Cloudflare 免費方案持續消耗 KV 寫入額度。
  - **可選 D1 歷史版本**：可透過 D1 為筆記保留歷史快照；功能預設關閉，開啟後預設每篇保留最近 `10` 份版本，並且預設以 5 分鐘節流，避免 editor 自動儲存時把資料量衝高。啟用後，編輯頁 footer 會顯示獨立「版本」入口，可檢視舊版、切換預覽/原文、複製內容或還原。
  - **排程清理 (Scheduled Cleanup)**：每日（UTC 01:00 / 台灣 09:00）自動執行 Cron Job，清理內容少於 10 字的空白筆記，保持資料庫整潔。

- **AI / API / Agent 生態**
  - **LLM & AI Agent API (無頭 CMS)**：支援外部 App 或 AI Agent (如 OpenClaw, n8n) 透過 REST API (`/api/:path`) 讀寫與接續撰寫 (Append)。
  - **多種 API 寫入格式**：`/api/:path` 支援 JSON、`text/markdown`、`text/plain` 與 `multipart/form-data`，降低 LLM 用 `curl` 寫長文時的跳脫字元失敗率。
  - **原生圖片上傳**：支援 API 圖片上傳 (`/api/upload`) 與 Markdown 連結。
  - **API 歷史快照管理**：啟用歷史版本後，可使用 `GET /api/:path/history`、`GET /api/:path/history/:versionId`、`POST /api/:path/history/:versionId/restore` 管理歷史快照。
  - **MCP 與專屬技能**：內建符合 PEP-723 的零安裝 Python MCP 伺服器，也提供專給代理人的 `skills/SKILL.md`。
  - **Skill 單一來源**：站內 `/.well-known/agent-skills/david888-wiki-publisher/SKILL.md` 由 `skills/SKILL.md` build-time 產生，避免 repo 文檔與實際 discovery 輸出各自漂移。
  - **Crawler-Friendly 輸出**：分享連結 (`/share/...`) 原生提供無 JavaScript 依賴的純文字 HTML 結構 (`<article>`)，方便 ChatGPT、ClaudeBot、n8n 等爬蟲工具抓取內容。
  - **Markdown 協商**：對本來就有 markdown 原文的頁面（如 note/share 頁）支援 `Accept: text/markdown`，agent 可直接拿到 `text/markdown` 而不是 HTML。
  - **Agent Discovery**：首頁 `/` 會輸出 `Link` response headers，並提供 `/.well-known/api-catalog`、`/.well-known/agent-skills/index.json`、`/.well-known/agent-skills/david888-wiki-publisher/SKILL.md` 與 `/auth.md`。
  - **robots.txt 與 Content-Signal**：站點根目錄提供 `/robots.txt`，含一般爬蟲與 AI crawler 的明確 `Allow` / `Disallow` 規則，並加入 `Content-Signal` 偏好宣告。
  - **WebMCP**：在支援的瀏覽器中會保守註冊 WebMCP tools，讓 agent 可讀取當前 markdown、複製 share link、或切到簡報模式。

- **展示與輸出**
  - **Slidev 風格全螢幕簡報模式 (Presentation Mode)** 📽️：支援將 Markdown 直接轉化為互動式簡報，使用標準 `---` 分頁，並支援 `::left::` / `::right::` 雙欄與 `{v-click}` 點擊動畫。
  - **PDF 與列印自適應優化** 🖨️：新增 `@media print` 列印媒體查詢，列印或「另存為 PDF」時會自動隱藏編輯控制項，解除單頁高度限制，防止標題、程式碼區塊、引用或表格被強行截斷，並保留主題邊框與底色設計。
  - **GA4 支援**：設定 Cloudflare 參數 `SCN_GA_MEASUREMENT_ID` 後，編輯頁、share 頁與 share 簡報頁都會自動載入 Google Analytics。
  - **分享頁分析預留點**：分享 footer 保留 `#share-analytics-hook` 供未來插入 GA / analytics 程式碼；目前不對 share 頁新增 KV view 寫入。
  - **Footer UI 精緻度提升**：全站圖標改為向量 SVG，儲存時間以 `Saved 3m ago` 與 tooltip 呈現。主題選擇器與寬度選擇器自訂了 CSS 下拉箭頭，美化原生 `<select>`。分段切換按鈕加入 CSS transition 開啟平滑切換動畫。
  - **Dropdown 工具收納**：將 Markdown 匯入匯出、PDF 產生等工具收進編輯區的「檔案與匯出」下拉選單；版本紀錄收進編輯區的「歷史紀錄」下拉選單；近期分享紀錄收進發佈區的「歷史紀錄」下拉選單，大幅精簡 Footer 按鈕數量。
  - **發布區塊優化 (Share Dropdown)**：已發布狀態下不再展開 5 個按鈕，改為精緻的「分享中 ▾」下拉選單，內含開啟分享、複製連結、複製簡報、公開索引與取消發布，並將敏感的 `Unpublish` 移動到選單底部作為紅色警告項，預防誤觸。
  - **短分享網址相容層**：新分享會優先使用較短的 `shareSlug`，但系統仍保留舊的 `md5(path)` share key，因此既有長 share URL 不會失效。

- **維運與管理**
  - **超級管理員介面**：
    - 檢視所有筆記列表。
    - 檢查是否設定了密碼。
    - 直接刪除違規或過期的筆記。
## 擴充套件：MCP 與 AI Skills (無頭 CMS)

Cloud Notepad 現在完整支援被 AI Agent（如 Claude, Cursor, Antigravity, OpenClaw）當作「外部大腦」或「發文平台」使用！

### 1. 啟動 MCP Server (免安裝)
我們提供了一個零安裝 (Zero-Install) 的 MCP 伺服器，直接透過 Python `uv` 遠端執行，無須下載任何程式碼：

*   **對於 Cursor 或 Claude Desktop 用戶**，請在 MCP Server 設定中新增：
    *   **Type**: `command`
    *   **指令**: `uv run https://raw.githubusercontent.com/tbdavid2019/cf-notepad/main/mcp/server.py`
    *   *(詳細的環境變數與自架說明請見 [mcp/README.md](./mcp/README.md))*

### 2. Antigravity AI Skills
如果你使用的是 Google DeepMind 提供的工作流引擎或類 Antigravity 代理，我們也在開源專案內建了專用的 Prompt Skills。
*   **如何安裝**：只需將 `skills/` 資料夾下的內容複製到你的 `~/.gemini/antigravity/skills/` 目錄下即可。
*   這能讓 Agent 直接學習透過 cURL 呼叫 API，原生執行上傳圖片與產生文章回你的 Wiki 站點。
*   若要讓外部 Agent 自動發現技能，也可直接讀取：
    * `/.well-known/agent-skills/index.json`
    * `/.well-known/agent-skills/david888-wiki-publisher/SKILL.md`

### 3. 一鍵詠唱 (給其他 LLM 的 Prompt)
如果你想請 ChatGPT、Claude 網頁版等 AI 幫你寫文章並**自動發布**，請直接複製以下整段文字（Prompt）貼給你的 AI：

```text
這是一台架設好的 Wiki 平台，具備無頭 CMS 的發文 API：`https://wiki.david888.com/api` 。
請你擔任我的寫作助理，根據我的需求撰寫文章並發布。

操作指南請閱讀以下文件內容（請運用你的上網 / 執行工具讀取）：
👉 https://raw.githubusercontent.com/tbdavid2019/cf-notepad/main/LLM_API_DOCS.md

請你使用上述文件的 cURL/HTTP 請求工具，完成寫作後將內容存檔，並把最後發布的文章網址給我。
```

詳細的 API 規格表可參考：[LLM_API_DOCS.md](./LLM_API_DOCS.md)。

### 4. Well-Known Discovery Endpoints

部署完成後，站點會額外提供以下 discovery 入口：

- `GET /.well-known/api-catalog`
  - 回傳 RFC 9727 Linkset JSON，列出 API 入口、`service-desc`、`service-doc`、`status`。
- `GET /.well-known/agent-skills/index.json`
  - 回傳 Agent Skills Discovery v0.2.0 index。
- `GET /.well-known/agent-skills/david888-wiki-publisher/SKILL.md`
  - 回傳可直接被 agent 載入的技能說明。
- `GET /auth.md`
  - 回傳目前站點支援的 agent / API 存取方式說明。
- `GET /robots.txt`
  - 回傳明確的搜尋引擎與 AI crawler 規則，以及 `Content-Signal` 偏好。
- `HEAD /`
  - 會帶出 `Link` headers，指向 API catalog 與 API docs / OpenAPI 描述。
- `GET /share/...` 或 `GET /:path` 搭配 `Accept: text/markdown`
  - 若該頁本身具備原始 markdown，則直接回傳 `text/markdown` 給 agent。

---

## 部署教學

### 前置準備

- 已安裝 **Node.js** 與 **npm**。
- 擁有 Cloudflare 帳號 (需開通 Workers 與 KV)。
- 安裝 Wrangler CLI：
  ```bash
  npm install -g wrangler
  ```

### 1. 初始化專案

複製 `wrangler.toml.example` 為 `wrangler.toml`：

```bash
cp wrangler.toml.example wrangler.toml
```

### 2. 建立 KV Namespaces

你需要建立兩個 KV 用來儲存筆記與分享連結：

```bash
wrangler kv:namespace create "NOTES"
wrangler kv:namespace create "SHARE"
```

執行後會得到兩個 ID，請填入 `wrangler.toml` 對應位置：

```toml
kv_namespaces = [
  { binding = "NOTES", id = "你的_NOTES_ID" },
  { binding = "SHARE", id = "你的_SHARE_ID" }
]
```

### 2.1 歷史版本 D1（選用）

若要啟用歷史版本，請另外建立一個 D1 資料庫：

```bash
wrangler d1 create cloud-notepad-history
wrangler d1 execute cloud-notepad-history --file=./schema/note_history.sql
```

然後把輸出的 `database_id` 填入 `wrangler.toml`：

```toml
[[d1_databases]]
binding = "NOTE_HISTORY_DB"
database_name = "cloud-notepad-history"
database_id = "你的_D1_DATABASE_ID"
```

### 3. 設定環境變數與密鑰

為了安全性與管理功能，請在 Cloudflare Dashboard 設定以下環境變數 (Environment Variables)，或使用 `wrangler secret put`：

**必要變數：**

> *建議：`SCN_SALT` 與 `SCN_SECRET` 可使用 `uuidgen` 或隨機亂碼生成，建議長度至少 16-32 字元，越長越安全。*

```bash
# 1. 密碼加鹽 (任意隨機字串)
wrangler secret put SCN_SALT

# 2. JWT 加密密鑰 (任意隨機字串)
wrangler secret put SCN_SECRET

# 3. 超級管理員後台路徑 (建議設為隱密路徑，例如 /super-admin-999)
wrangler secret put SCN_ADMIN_PATH

# 4. 超級管理員密碼
wrangler secret put SCN_ADMIN_PW

# 5. 隨機網址長度 (預設為 3)
wrangler secret put SCN_SLUG_LENGTH

# 6. 啟用 R2 圖片上傳功能 (為了圖片保存)
# 設為 "1" 開啟，設為 "0" 關閉 (預設關閉)
wrangler secret put SCN_ENABLE_R2

# 7. R2 Bucket 公開網域 (若開啟功能則必須)
# 例如: https://images.your-domain.com
wrangler secret put SCN_R2_DOMAIN

# 8. Google Analytics Measurement ID（選用，套用於編輯頁與 share 頁）
# 例如: G-XXXXXXXXXX
wrangler secret put SCN_GA_MEASUREMENT_ID

# 9. 是否啟用歷史版本（選用，預設關閉）
# 設為 "1" 開啟，設為 "0" 關閉
wrangler secret put SCN_ENABLE_NOTE_HISTORY

# 10. 每篇最多保留幾份歷史版本（選用，預設 10）
wrangler secret put SCN_NOTE_HISTORY_LIMIT

# 11. 歷史版本最小保存間隔秒數（選用，預設 300 秒）
# 用來避免 editor 自動儲存每秒都寫一份歷史
wrangler secret put SCN_NOTE_HISTORY_MIN_INTERVAL_SECONDS
```

*注意：`SCN_ADMIN_PATH` 預設為 `/admin`，但強烈建議修改以避免被掃描。*

### 3.1 Google Analytics（選用）

若要在站內啟用 GA4，設定 Cloudflare 變數 `SCN_GA_MEASUREMENT_ID` 即可。

值範例：

```text
G-XXXXXXXXXX
```

啟用後會自動載入於：

- 一般編輯頁
- `/share/:id`
- `/share/:id/present`

### 3.2 歷史版本（選用）

歷史版本功能預設關閉。要啟用時，請同時滿足：

1. `wrangler.toml` 有綁定 `NOTE_HISTORY_DB`
2. `SCN_ENABLE_NOTE_HISTORY` 設為 `1`

相關參數：

- `SCN_NOTE_HISTORY_LIMIT`：每篇最多保留幾份歷史版本，預設 `10`
- `SCN_NOTE_HISTORY_MIN_INTERVAL_SECONDS`：兩份歷史快照最小間隔秒數，預設 `300`

目前策略是保留「前一個內容版本」到 D1，並在超過上限時自動刪除舊版本。

啟用後，編輯頁 footer 會多出獨立的「版本」按鈕；此 UI 與「最近分享」分開，不會改變既有分享紀錄功能。

### 6. R2 圖片上傳設定 (選用)

若要像 HackMD 一樣直接貼上圖片，請先在 Cloudflare 建立 R2 Bucket，並開啟 Public Access 或綁定網域。

1. 修改 `wrangler.toml` (解除註解並填入 Bucket Name):
   ```toml
   [[r2_buckets]]
   binding = "IMAGES"
   bucket_name = "<你的_BUCKET_NAME>"
   ```
2. 設定 `SCN_ENABLE_R2` 為 `1`。
3. 設定 `SCN_R2_DOMAIN` 為該 Bucket 的公開網址。

### 4. 部署
DEV
```
npx wrangler dev --local

npm start
```

正式區
```bash
npm install
wrangler deploy
```

也可以使用 npm script：

```bash
npm run deploy
```

部署完成後，你的記事本即可使用！

### 5. 使用管理員介面

訪問你設定的 `SCN_ADMIN_PATH` (例如 `https://your-worker.workers.dev/super-admin-999`)，輸入 `SCN_ADMIN_PW` 即可登入後台進行管理與刪除操作。

---

# CF-Notepad (david888 wiki)

A lightweight, powerful, and AI-friendly markdown notepad/wiki hosted on Cloudflare Workers.

## 🤖 AI Agent & LLM Integration

This project is designed to be natively used by AI agents (like Antigravity, OpenClaw, or ChatGPT).

### 1. Agent Skills
We provide a structured Skill for agents to natively interact with the wiki.
- **Skill Location**: [skills/SKILL.md](./skills/SKILL.md)
- **Canonical Published URL**: `/.well-known/agent-skills/david888-wiki-publisher/SKILL.md`
- **Maintenance Model**: `skills/SKILL.md` is the single editable source; `npm run prepare:skill-doc` regenerates the bundled Worker artifact before test/dev/deploy.
- **What it does**: Teaches LLMs how to read, write, and append to the wiki using simple `curl` commands.

### 2. MCP Server (Model Context Protocol)
For more advanced integrations, use our MCP server:
- **Server File**: [mcp/server.py](./mcp/server.py)
- **Usage**: `uv run mcp/server.py`
- **Capabilities**: Read, Write, Append, and Image Upload tools with built-in AI guidance.

---

It supports Markdown preview, password protection, sharing, and a hidden Super Admin interface.

👉 **⚠️ For AI Agents and Developers: If you need to read/write articles via API, you MUST read the full specification here: [LLM_API_DOCS.md](./LLM_API_DOCS.md) ⚠️**

The API docs now also cover:
- markdown negotiation on note/share pages
- `pw` vs `vpw` lock semantics
- persisted appearance values such as width, share font, and preview device
- presentation authoring syntax
- authenticated editor-session routes like `/:path/setting`

## Features

- **Core**
  - **Lightweight & Fast**: Powered by Cloudflare Edge Network.
  - **Markdown Support**: Built-in rendering (marked.js) and sanitation (DOMPurify).
  - **Mermaid Diagram Stability**: Mermaid flowcharts use stricter font and SVG overflow guards to reduce clipping on mixed Chinese/English labels.
  - **Built-in Icon Routes**: The Worker serves `/icon.svg`, `/icon.png`, `/favicon.ico`, and `/og-image.png` directly from the bundled assets.

- **Editing & Reading**
  - **Interface Language**: UI copy is maintained for `en-US` and `zh-TW`, with an `En / Zh` footer switcher.
  - **Desktop / Mobile Preview Toggle**: The editor footer can switch the Markdown preview into a mobile simulation width.
  - **Preview Divider**: The split panes remain draggable, and double-click resets the layout to 50/50.
  - **Preview Width Presets**: The footer includes `Full / 960 / 1200 / 1440` width presets.
  - **Built-in Theme Set**: The app ships with multiple bundled preview themes, with `catppuccin-macchiato` as the current default.
  - **Share Font Switcher**: Shared-note footers use an explicit `Font: JB Mono / Maple` switcher instead of cryptic buttons to improve clarity.
  - **Optimized & Grouped Footer Layout**: Editor and share footers are reorganized into four logical sections: **Edit** (locks, preview, file tools, version history), **Publish** (share, present, recent share history), **Appearance** (font, language, width, theme), and **Info** (GitHub, docs, saved time). Version history (D1-based) and share history (localStorage-based) are clearly separated into different sections.
  - **Responsive Mobile Tables**: Mobile simulation and real mobile share pages wrap long cell text and inline code safely.
  - **Back-to-Top for Long Shares**: Shared long-form pages show a compact `＾` control after scrolling down.
  - **Share Anchor Links**: Shared-note headings get stable IDs so `#...` links can jump directly to sections.
  - **Share Metadata & Unfurling**: Shared pages emit server-rendered Open Graph / Twitter metadata and prefer stronger human-readable titles when available.
  - **Mobile Pill Bar & Bottom Sheet**: The mobile footer is redesigned as a compact floating Pill bar (`48px` height) showing only the Edit section. Tapping the footer area (outside Edit) slides up a card-based **BottomSheet** drawer with Publish, Appearance, and Info sections. Supports swipe-down dismiss, backdrop tap close, and auto-hides on keyboard focus or scroll-down (directional sensing).

- **Sharing, Privacy & Lifecycle**
  - **Privacy**: Password protection for individual notes (stored as Salted MD5 hash).
  - **Sharing**: Generate read-only share links.
  - **Recent Shares**: The footer includes a `Recent shares` entry backed by browser `localStorage`.
  - **Publish Nudge**: If a user stays focused in the editor input for 3 minutes with non-empty unpublished content, the UI prompts them to publish and get a share URL.
  - **Public Index Opt-In**: After creating a share link, the UI can explicitly ask whether that share should be added to the public root sitemap at `/sitemap.xml`; the default remains private.
  - **No Share View Tracking by Default**: Shared-note views are not counted or written to Cloudflare KV by default.
  - **Optional D1 Note History**: Notes can keep historical snapshots in D1, with retention and save throttling controls.
  - **Scheduled Cleanup**: A daily Cron job removes empty notes automatically.

- **AI, API & Agent Ecosystem**
  - **LLM / API Publishing**: `POST /api/:path` supports JSON, raw `text/markdown` / `text/plain`, and `multipart/form-data` uploads.
  - **Native Image Upload**: The API supports image upload at `/api/upload`.
  - **History APIs**: When note history is enabled, `GET /api/:path/history`, `GET /api/:path/history/:versionId`, and `POST /api/:path/history/:versionId/restore` are available.
  - **MCP & Skills**: The repo includes a zero-install Python MCP server and an agent skill document in `skills/SKILL.md`.
  - **Crawler-Friendly Output**: Share links expose bare semantic `<article>` tags containing markdown for bots and agents that do not execute JavaScript.
  - **Markdown Negotiation**: Note and share pages can return `text/markdown` when the client sends `Accept: text/markdown`.
  - **Agent Discovery**: The homepage emits `Link` headers and the site publishes `/.well-known/api-catalog`, `/.well-known/agent-skills/index.json`, `/.well-known/agent-skills/david888-wiki-publisher/SKILL.md`, and `/auth.md`.
  - **robots.txt & Content Signals**: The site publishes crawler rules and `Content-Signal` preferences in `/robots.txt`.
  - **WebMCP**: On supported browsers, the site registers guarded WebMCP tools for reading markdown, copying share links, and opening presentation mode.

- **Presentation, Print & Analytics**
  - **Slidev-style Presentation Mode** 📽️: Transform markdown into fullscreen slides with `---` separators, `::left::` / `::right::` layouts, and `{v-click}` progressive reveals.
  - **PDF & Print Optimization** 🖨️: Print styles hide editor chrome, remove viewport constraints, and preserve theme visuals when exporting to PDF.
  - **GA4 Support**: Set `SCN_GA_MEASUREMENT_ID` in Cloudflare to automatically load Google Analytics on editor, share, and presentation pages.
  - **Analytics Placeholder**: Shared-note footers include a `#share-analytics-hook` placeholder for future analytics code.

- **Administration**
  - **Super Admin Interface**:
    - List all notes.
    - Check password status.
    - Batch-delete selected notes.
    - Delete empty notes in one action.
    - Delete notes directly from the dashboard.

## Deployment Guide

### Prerequisites

- **Node.js** and **npm** installed.
- A Cloudflare account (Workers & KV enabled).
- Wrangler CLI installed:
  ```bash
  npm install -g wrangler
  ```

### 1. Initialize Project

Copy the config example:

```bash
cp wrangler.toml.example wrangler.toml
```

### 2. Create KV Namespaces

Create two KV namespaces for notes and share links:

```bash
wrangler kv:namespace create "NOTES"
wrangler kv:namespace create "SHARE"
```

Replace the `id` values in your `wrangler.toml` with the output from above:

```toml
kv_namespaces = [
  { binding = "NOTES", id = "YOUR_NOTES_ID" },
  { binding = "SHARE", id = "YOUR_SHARE_ID" }
]
```

### 2.1 Optional D1 Database for Note History

If you want note history, create a D1 database and apply the schema:

```bash
wrangler d1 create cloud-notepad-history
wrangler d1 execute cloud-notepad-history --file=./schema/note_history.sql
```

Then add the binding to `wrangler.toml`:

```toml
[[d1_databases]]
binding = "NOTE_HISTORY_DB"
database_name = "cloud-notepad-history"
database_id = "YOUR_D1_DATABASE_ID"
```

### 3. Set Environment Secrets

Set the following secrets using `wrangler secret put` or via the Cloudflare Dashboard:

**Required Secrets:**

> *Tip: Generate `SCN_SALT` and `SCN_SECRET` using `uuidgen` or random strings. Recommended length: 16-32+ characters for better security.*

```bash
# 1. Salt for password hashing (random string)
wrangler secret put SCN_SALT

# 2. JWT Secret (random string)
wrangler secret put SCN_SECRET

# 3. Super Admin Path (Set to a secret path, e.g., /secret-admin)
wrangler secret put SCN_ADMIN_PATH

# 4. Super Admin Password
wrangler secret put SCN_ADMIN_PW

# 5. Random Slug Length (Default: 3)
wrangler secret put SCN_SLUG_LENGTH

# 6. Enable R2 Image Upload
# Set to "1" to enable, "0" to disable (Default: 0)
wrangler secret put SCN_ENABLE_R2

# 7. R2 Bucket Public Domain (Required if R2 enabled)
# Example: https://images.your-domain.com
wrangler secret put SCN_R2_DOMAIN

# 8. Google Analytics Measurement ID (Optional, editor + share pages)
# Example: G-XXXXXXXXXX
wrangler secret put SCN_GA_MEASUREMENT_ID

# 9. Enable note history (Optional, default: 0)
wrangler secret put SCN_ENABLE_NOTE_HISTORY

# 10. Max retained history versions per note (Optional, default: 10)
wrangler secret put SCN_NOTE_HISTORY_LIMIT

# 11. Minimum seconds between history snapshots (Optional, default: 300)
wrangler secret put SCN_NOTE_HISTORY_MIN_INTERVAL_SECONDS
```

*Note: `SCN_ADMIN_PATH` defaults to `/admin` if not set, but changing it is highly recommended.*

### 3.1 Google Analytics (Optional)

To enable GA4 across the site, set `SCN_GA_MEASUREMENT_ID`.

Example value:

```text
G-XXXXXXXXXX
```

When set, GA loads on:

- editor pages
- `/share/:id`
- `/share/:id/present`

### 3.2 Note History (Optional)

Note history stays disabled unless both of the following are true:

1. `NOTE_HISTORY_DB` is bound in `wrangler.toml`
2. `SCN_ENABLE_NOTE_HISTORY` is set to `1`

Related knobs:

- `SCN_NOTE_HISTORY_LIMIT`: max retained versions per note, default `10`
- `SCN_NOTE_HISTORY_MIN_INTERVAL_SECONDS`: minimum seconds between snapshots, default `300`

The current implementation stores the previous saved content into D1 and prunes older rows automatically once the retention limit is exceeded.

### 6. R2 Image Upload (Optional)

To enable "Paste to Upload" (like HackMD):

1. Create an R2 Bucket in Cloudflare and allow public access or bind a domain.
2. Edit `wrangler.toml` (Uncomment and set Bucket Name):
   ```toml
   [[r2_buckets]]
   binding = "IMAGES"
   bucket_name = "<YOUR_BUCKET_NAME>"
   ```
3. Set `SCN_ENABLE_R2` to `1`.
4. Set `SCN_R2_DOMAIN` to the public URL of your bucket.

### 4. Deploy

```bash
npm install
wrangler deploy
```

You can also use the npm script:

```bash
npm run deploy
```

### 5. Admin Interface

Visit your configured `SCN_ADMIN_PATH` (e.g., `https://your-worker.workers.dev/secret-admin`), enter your `SCN_ADMIN_PW` to manage and delete notes.

## Extensions: MCP & AI Skills (Headless CMS)

Cloud Notepad now fully supports being used by AI Agents (like Claude, Cursor, Antigravity, OpenClaw) as an "external brain" or "publishing platform"!

### 1. Launching the MCP Server (Zero-Install)
We provide a zero-install MCP Server that executes remotely via Python `uv` without downloading any code:

*   **For Cursor or Claude Desktop users**, add this command to your MCP Server settings:
    *   **Type**: `command`
    *   **Command**: `uv run https://raw.githubusercontent.com/tbdavid2019/cf-notepad/main/mcp/server.py`
    *   *(For detailed env vars and self-hosting, see [mcp/README.md](./mcp/README.md))*

### 2. Antigravity AI Skills
If you use Google DeepMind's workflow engine or Antigravity-like agents, we have built-in Prompt Skills.
*   **Install**: Just copy the `skills/` folder contents to your `~/.gemini/antigravity/skills/` directory.

### 3. One-Click Prompt (For other LLMs)
If you want ChatGPT, Claude Web, or other AI assistants to write articles and **auto-publish** them for you, just copy and paste the following prompt to your AI:

```text
This is a deployed Wiki platform functioning as a Headless CMS publishing API: `https://wiki.david888.com/api`.
Please act as my writing assistant to draft and publish articles based on my requests.

For operational guidelines, please read the following document (use your web-browsing/execution tools to fetch it):
👉 https://raw.githubusercontent.com/tbdavid2019/cf-notepad/main/LLM_API_DOCS.md

Use the cURL/HTTP request tools detailed in that document to save the content once you finish writing, and give me the URL of the published article.

If you need to preserve a very long reference file (for example a full `SKILL.md`, raw logs, or long API docs), do not inline the entire source text by default. Publish a concise summary plus the original file path or source URL unless I explicitly ask for the full text to be mirrored.

If you already have a local markdown file, prefer uploading it directly with `Content-Type: text/markdown` and `--data-binary @file.md`, or multipart `-F "file=@file.md"`, instead of embedding the full markdown inside JSON.
```

For the detailed API specification, please refer to: [LLM_API_DOCS.md](./LLM_API_DOCS.md).

---
本專案 fork 自 [s0urcelab/serverless-cloud-notepad](https://github.com/s0urcelab/serverless-cloud-notepad)。

開發與變更紀錄請見：[CHANGELOG.md](./CHANGELOG.md)


### DEMO

```
curl -X POST "https://wiki.david888.com/api/api_test_demo_2" \
  -H "Content-Type: application/json" \
  -d '{
    "content": "## 錯誤欄位防呆測試\n雖然我傳送的是 content，但因為剛才在 index.js "
  }'
```

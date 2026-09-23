# 安裝 888wiki

[繁體中文專案首頁](../README.zh-TW.md) · [English](INSTALLATION.md) · [功能詳情](FEATURES.zh-TW.md) · [更新紀錄](../CHANGELOG.md)

## 一鍵部署（推薦）

[![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/tbdavid2019/888wiki)

1. 點擊 **Deploy to Cloudflare**，登入 GitHub 與 Cloudflare。
2. 選擇新 GitHub repository 與 Worker 名稱。
3. 在部署精靈或 Worker 的 **Settings → Variables and Secrets** 設定下方 3 個必填 Secrets。
4. 啟動部署。Cloudflare 會複製 repository、連接 Workers Builds，並依 `wrangler.toml` 建立 Cloudflare 資源。
5. 部署腳本會建立筆記歷史、瀏覽統計與段落註解所需的 D1 資料表。建置完成後開啟 Worker 網址。

Cloudflare Deploy 會讀取 `wrangler.toml` 的資源綁定，以及 `.dev.vars.example` 的 Secret 名稱。大多數執行變數已有可用預設值，部署時不必逐項輸入。下方列出新部署會使用的完整設定。

## 必填 Secrets

| Secret | 用途 | 設定方式 |
| --- | --- | --- |
| `SCN_SALT` | 密碼雜湊用 salt | 為此安裝產生獨立的隨機值。 |
| `SCN_SECRET` | 簽署登入工作階段與認證權杖 | 另外產生一組獨立的隨機值。 |
| `SCN_ADMIN_PW` | 管理後台密碼 | 設定高強度密碼。管理後台預設路徑為 `/admin`。 |

可分別執行兩次 `openssl rand -hex 32`，產生 `SCN_SALT` 與 `SCN_SECRET` 的隨機值；`SCN_ADMIN_PW` 請自行設定高強度密碼。

請在 Cloudflare 部署精靈設定 Secrets；也可在部署後前往 **Worker → Settings → Variables and Secrets** 新增。使用 Wrangler 時，對每個 Secret 執行 `npx wrangler secret put <名稱>`。請勿將密鑰寫入 `wrangler.toml` 或提交至 Git。

## `wrangler.toml` 會建立的 Cloudflare 資源

| 綁定名稱 | 資源 | 用途 |
| --- | --- | --- |
| `NOTES` | KV Namespace | 筆記儲存與備援。 |
| `SHARE` | KV Namespace | 已發布筆記與分享中繼資料。 |
| `NOTE_HISTORY_DB` | D1 Database | 混合式儲存、筆記歷史、瀏覽統計與段落註解；部署腳本會建立所需資料表。 |
| `IMAGES` | R2 Bucket | 圖片上傳。未設定自訂網域時由 Worker 提供圖片。 |

Worker 也會從 `static/` 提供靜態檔案，並依設定每天於 UTC 01:00（台灣時間 09:00）執行清理 Cron。Cloudflare 會自動建立這些資源，並將 Wrangler 範本中的預設 ID 更新為新資源 ID。

## 執行變數與預設值

以下設定已寫在 `wrangler.toml`。若要調整，請修改 Cloudflare 複製到你 GitHub 帳戶的 repository；每次 push 都會觸發部署。

| 變數 | 預設值 | 作用 |
| --- | --- | --- |
| `SCN_STORAGE_DRIVER` | `auto` | `auto` 使用 D1 並以 KV 備援；`kv` 僅用 KV；`d1` 使用 D1 模式。 |
| `SCN_APP_NAME` | `888wiki` | 介面顯示的應用名稱。 |
| `SCN_ADMIN_PATH` | `/admin` | 管理後台路徑；可改成較難猜測的路徑。 |
| `SCN_SLUG_LENGTH` | `4` | 自動產生的筆記網址長度。 |
| `SCN_ENABLE_R2` | `1` | 啟用已建立的 R2 圖片上傳。 |
| `SCN_R2_DOMAIN` | 空白 | 選用的公開圖片網域；空白時透過 Worker 提供圖片。 |
| `SCN_GA_MEASUREMENT_ID` | 空白 | 提供自己的 Google Analytics Measurement ID 後才會啟用追蹤。 |
| `SCN_ENABLE_WEBTALK` | `0` | 預設關閉 WebTalk，設定好自己的服務後再開啟。 |
| `SCN_WEBTALK_SCRIPT_URL` | 空白 | 自有 WebTalk 用戶端 Script 網址。 |
| `SCN_WEBTALK_AI_ENDPOINT` | 空白 | 自有 WebTalk AI 端點。 |
| `SCN_WEBTALK_SCOPE` | `meta` | WebTalk Widget 範圍。 |
| `SCN_WEBTALK_SITE_ID` | 空白 | 在 WebTalk 服務登記的 Site ID。 |
| `SCN_ENABLE_NOTE_HISTORY` | `1` | 啟用 D1 歷史、統計與註解功能。 |
| `SCN_NOTE_HISTORY_LIMIT` | `10` | 每篇筆記保留的歷史版本數量。 |
| `SCN_NOTE_HISTORY_MIN_INTERVAL_SECONDS` | `300` | 自動建立歷史快照的最短間隔秒數。 |

## 選填參數與整合服務

| 參數 | 預設值 | 需要設定的情況 |
| --- | --- | --- |
| `GROQ_API_KEY` Secret | 未設定 | 啟用 Groq AI 寫作與音訊轉錄。AI 功能需要這組 Key 或 Workers AI 綁定。 |
| `SCN_R2_DOMAIN` | 空白 | 透過自己的公開網域提供上傳圖片，而非使用 Worker 網址。 |
| `SCN_GA_MEASUREMENT_ID` | 未設定 | 將流量資料送至自己的 Google Analytics 資源。 |
| `SCN_ENABLE_WEBTALK` | `0` | 完成下方 WebTalk 設定後才改為 `1`。 |
| `SCN_WEBTALK_SCRIPT_URL` | 空白 | 載入自有 WebTalk 用戶端 Script。 |
| `SCN_WEBTALK_AI_ENDPOINT` | 空白 | 連接自有 WebTalk AI 端點。 |
| `SCN_WEBTALK_SCOPE` | `meta` | 調整 WebTalk Widget 使用的 DOM 範圍。 |
| `SCN_WEBTALK_SITE_ID` | 空白 | 提供註冊於 WebTalk 服務的站台 ID。 |
| Workers AI 綁定 `AI` | 未設定 | 使用 Cloudflare Workers AI 支援的功能；設定後會優先於 Groq 備援。請將綁定加入 `wrangler.toml`。 |
| Worker 自訂網域 | `workers.dev` 網址 | 使用自己的網域；部署後在 Cloudflare Dashboard 設定。 |

WebTalk 預設關閉，部署設定中的 Script 與 AI 端點也留空。請先填入自己管理的服務資訊，再開啟功能。

## 使用 Wrangler 部署

手動部署步驟如下：

1. 複製專案並安裝依賴套件：

   ```bash
   git clone https://github.com/tbdavid2019/888wiki.git
   cd 888wiki
   npm install
   npx wrangler login
   ```

2. 建立 KV Namespace，並將 Wrangler 回傳的 `demo` ID 填入 `wrangler.toml`：

   ```bash
   npx wrangler kv namespace create NOTES
   npx wrangler kv namespace create SHARE
   ```

3. 建立 `wrangler.toml` 設定的 D1 資料庫與 R2 Bucket，並將 D1 回傳的 ID 填入 `database_id`：

   ```bash
   npx wrangler d1 create 888wiki-history
   npx wrangler r2 bucket create 888wiki-images
   ```

4. 使用 `npx wrangler secret put <名稱>` 設定 `SCN_SALT`、`SCN_SECRET` 與 `SCN_ADMIN_PW`。需要 Groq AI 時，再設定 `GROQ_API_KEY`。
5. 建置、初始化 D1 資料表並部署：

   ```bash
   npm run deploy
   ```

每個安裝環境都應使用獨立的 Secrets。Cloudflare Deploy 的官方說明請參閱 [Deploy to Cloudflare buttons](https://developers.cloudflare.com/workers/platform/deploy-buttons/)。

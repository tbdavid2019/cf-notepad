# 安裝 888wiki

[繁體中文專案首頁](../README.zh-TW.md) · [English](INSTALLATION.md) · [功能詳情](FEATURES.zh-TW.md) · [更新紀錄](../CHANGELOG.md)

## 一鍵部署（推薦）

[![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/tbdavid2019/888wiki)

1. 點擊 **Deploy to Cloudflare**，登入 GitHub 與 Cloudflare。
2. 選擇要建立的 GitHub 專案名稱與 Worker 名稱。
3. 設定必填密鑰：`SCN_SALT`、`SCN_SECRET`、`SCN_ADMIN_PW`。請為每次部署產生新的隨機值。
4. 可選填 `GROQ_API_KEY`，啟用 Groq AI 功能。
5. 啟動部署。Cloudflare 會複製專案至你的 GitHub 帳戶、建立 Workers Builds，並依 `wrangler.toml` 建立 KV、D1、R2 資源。部署腳本會初始化筆記歷史、瀏覽統計與段落註解所需的 D1 資料表。
6. 開啟 Worker 網址。管理後台路徑由 `SCN_ADMIN_PATH` 設定（預設 `/admin`），登入密碼使用 `SCN_ADMIN_PW`。

預設由 Worker 提供圖片存取。如需自訂圖片網域，可在部署後設定 `SCN_R2_DOMAIN`。

## 使用 Wrangler 部署

一鍵部署會自動建立並連接所需資源。手動設定步驟如下：

1. 複製專案並安裝依賴套件：

   ```bash
   git clone https://github.com/tbdavid2019/888wiki.git
   cd 888wiki
   npm install
   npx wrangler login
   ```

2. 建立兩個 KV Namespace，並將 Wrangler 回傳的 ID 填入 `wrangler.toml`：

   ```bash
   npx wrangler kv namespace create NOTES
   npx wrangler kv namespace create SHARE
   ```

3. 建立 `wrangler.toml` 設定的 D1 資料庫與 R2 Bucket，並將 D1 回傳的 ID 填入 `database_id`：

   ```bash
   npx wrangler d1 create 888wiki-history
   npx wrangler r2 bucket create 888wiki-images
   ```

4. 建立必填 Secrets。Wrangler 會提示輸入各密鑰：

   ```bash
   npx wrangler secret put SCN_SALT
   npx wrangler secret put SCN_SECRET
   npx wrangler secret put SCN_ADMIN_PW
   ```

   如需 Groq AI 功能，再設定 `GROQ_API_KEY`。

5. 建置編輯器資產、初始化 D1 資料表並部署：

   ```bash
   npm run deploy
   ```

`npm run deploy` 會執行編輯器資產建置、套用 D1 Schema，然後部署 Worker。每個安裝環境都應使用獨立的 salt、簽署密鑰與管理員密碼。

## 選用設定

- `SCN_ADMIN_PATH`：管理後台路徑，預設 `/admin`。
- `SCN_SLUG_LENGTH`：隨機筆記網址長度。
- `SCN_ENABLE_NOTE_HISTORY`：啟用 D1 版本紀錄；使用已設定的 D1 時設為 `"1"`。
- `SCN_R2_DOMAIN`：自訂圖片公開網域。留空時由 Worker 提供圖片。
- `GROQ_API_KEY`：Groq API 金鑰，供 AI 寫作與音訊轉錄使用。

Cloudflare 部署精靈的細節請參閱[官方 Deploy to Cloudflare 文件](https://developers.cloudflare.com/workers/platform/deploy-buttons/)。

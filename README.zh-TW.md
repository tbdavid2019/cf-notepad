# 888wiki

**可自行部署的 Wiki 與寫作工作區，提供四種創作模式、AI 寫作協作，以及可自行設定的分享釋出控制。**

快速筆記可用 Markdown；結構化內容可用區塊編輯器；概念與關係可放進 Canvas；自由草圖則交給 Whiteboard。完成後可部署到自己的 Cloudflare 帳戶並發布分享。

[![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/tbdavid2019/888wiki)

[線上網站](https://wiki.david888.com) · [API](https://wiki.david888.com/api) · [Agent Skill](https://wiki.david888.com/.well-known/agent-skills/david888-wiki-publisher/SKILL.md)

## 四種創作模式

| 模式 | 適合用途 | 主要特色 |
| --- | --- | --- |
| **Markdown** | 文章、筆記、技術文件 | 即時預覽、數學公式、圖表、引用、多格式匯入、搜尋取代與彈性版面。 |
| **Block** | 結構化頁面與多媒體內容 | Notion 風格區塊、Slash 指令、拖曳排序、可編輯嵌入內容與直接匯出。 |
| **Canvas** | 心智圖、計畫與關聯整理 | 可移動的思考卡片、關係連線、多媒體卡片、復原重做，以及 `.canvas`／PNG／SVG 匯出。 |
| **Whiteboard** | 草圖與視覺說明 | Excalidraw 自由手繪、唯讀分享，以及 PNG／SVG 匯出。 |

## 使用 Seal 掌握分享時機

Seal 控制「已發布筆記何時、如何釋出」。可選擇指定時間解鎖、達到瀏覽次數後銷毀、作者停止簽到後自動解鎖，或設定保留期限。Seal 與密碼保護分開設定。內含 10 種情境範本，可快速設定安全分享參數，且不會改寫筆記內容。

## 不只是一個文字編輯器

- **AI 寫作工具：** 整理格式、改寫與翻譯草稿；設定 Groq 或 Workers AI 後，可將音訊轉成含時間戳記的逐字稿。
- **完整發布工具：** 公開或私密分享、D1 版本還原、段落討論，以及書本或簡報模式。
- **圖片與文件匯入：** 圖片上傳至 R2、瀏覽器本機 OCR／表格辨識、Office 文件轉 Markdown，並支援大型附件。
- **離線寫作：** 草稿保存在 IndexedDB，恢復連線後同步變更。
- **Agent 串接：** 透過原生 MCP、REST API 與 Agent Skill 連接相容工具。

## 開始使用

- [部署與設定 888wiki](docs/INSTALLATION.zh-TW.md) · [English installation guide](docs/INSTALLATION.md)
- [四種編輯器與 Seal 使用指南](docs/USAGE.zh-TW.md) · [English usage guide](docs/USAGE.md)
- [完整功能詳情](docs/FEATURES.zh-TW.md) · [English feature guide](docs/FEATURES.md)
- [English project homepage](README.md) · [更新紀錄](CHANGELOG.md)

Deploy 按鈕會在你的 GitHub 帳戶建立 repository 副本，並設定 Worker 所需資源。安裝指南列出必填 Secrets、所有選填參數，以及部署設定中已提供的預設值。

## 專案連結

- [原始碼](https://github.com/tbdavid2019/888wiki)
- [回報問題](https://github.com/tbdavid2019/888wiki/issues)
- 授權：MIT

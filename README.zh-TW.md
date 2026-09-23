# 888wiki

**部署在自己 Cloudflare 帳戶中的 Notion 風格知識庫。** 擷取錄音、檔案與網頁，用四種模式撰寫，再以 Seal 控制內容何時釋出。

[![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/tbdavid2019/888wiki)

[線上網站](https://wiki.david888.com) · [API](https://wiki.david888.com/api) · [Agent Skill](https://wiki.david888.com/.well-known/agent-skills/david888-wiki-publisher/SKILL.md)

## 一個選單，收進語音、檔案與網頁

**＋ 新增**選單可將不同來源的內容直接帶進筆記：

- **即時錄音：** 錄下想法、保留音訊播放器，並加入含時間戳記的逐字稿。
- **匯入音訊（逐字稿）：** 取得忠實原音、附時間標記的逐字稿。
- **匯入音訊（智慧排版）：** 使用 AI 將語音整理成段落與章節。
- **匯入檔案：** 將 Markdown、Office 文件、PDF、試算表等轉成筆記。支援的文件可在瀏覽器本機轉換；若想保留原始檔，可拖曳檔案並選擇上傳為附件。
- **匯入網站：** 將公開網頁剪藏成乾淨 Markdown，再插入或取代內容，也可建立新筆記。

同一套匯入功能可建立 Markdown 筆記，或將內容轉成可編輯的 Block 文件。

## 依想法選擇創作空間

| 模式 | 適合用途 | 主要特色 |
| --- | --- | --- |
| **Markdown** | 文章、研究與技術筆記 | 即時預覽、數學公式、圖表、引用、匯入、搜尋取代與彈性版面。 |
| **Block** | 結構化頁面與多媒體內容 | Notion 風格區塊、Slash 指令、拖曳排序、可編輯嵌入內容與直接匯出。 |
| **Canvas** | 心智圖、計畫與關聯整理 | 八種思考卡片、關係連線、多媒體卡片、復原／重做，以及 `.canvas`／PNG／SVG 匯出。 |
| **Whiteboard** | 草圖與視覺說明 | Excalidraw 繪圖工具、唯讀分享，以及 PNG／SVG 匯出。 |

## Seal：預約發布，或讓規則決定釋出時機

Seal 將內容密碼與釋出時機分開設定。可預約時間解鎖、設定瀏覽次數後銷毀、作者漏掉簽到後自動釋出，或設定連結到期。10 種範本涵蓋一次性密碼（瀏覽 1 次後銷毀、1 小時到期）、機密金鑰（瀏覽 1 次後銷毀、1 天到期）、加密資產傳承、緊急災備、吹哨揭弊、產品發布、生日驚喜、司法保全、闖關線索與課程教材。範本只設定釋出規則，不會改寫筆記內容。

## 寫作與發布工作區

- **AI 寫作：** 整理格式、改寫與翻譯草稿；設定 Groq 或 Workers AI 後，可將錄音轉成含時間戳記的逐字稿。
- **發布與展示：** 公開或密碼保護分享、還原 D1 版本、討論選取段落，並以書本或簡報展示內容。
- **離線工作：** 草稿保存在瀏覽器 IndexedDB，恢復連線後同步待處理變更。
- **自行管理技術堆疊：** 一鍵部署至自己的 Cloudflare 帳戶，使用 KV、D1、R2 與原生 MCP／REST API。

## 開始使用

- [部署與設定 888wiki](docs/INSTALLATION.zh-TW.md) · [English installation guide](docs/INSTALLATION.md)
- [從擷取、撰寫到發布與 Seal](docs/USAGE.zh-TW.md) · [English usage guide](docs/USAGE.md)
- [完整功能詳情](docs/FEATURES.zh-TW.md) · [English feature guide](docs/FEATURES.md)
- [English project homepage](README.md) · [更新紀錄](CHANGELOG.md)

安裝指南列出必填 Secrets、所有選填參數，以及部署設定中已提供的預設值。

## 專案連結

- [原始碼](https://github.com/tbdavid2019/888wiki)
- [回報問題](https://github.com/tbdavid2019/888wiki/issues)
- 授權：AGPL-3.0

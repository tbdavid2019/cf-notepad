# Changelog

## [2026-08-16]

- **🎙️ 音訊匯入、語音轉逐字稿與 Groq 高速主力管線 (`Groq whisper-large-v3` + `Workers AI Fallback`)**
  - **極速多層級 STT 引擎**：
    1. **主力模型**：Groq `whisper-large-v3`（超高速推論、高準確率）。
    2. **第一備援**：Groq `whisper-large-v3-turbo`。
    3. **第二備援**：Cloudflare Workers AI `@cf/openai/whisper-large-v3-turbo`。
    4. **第三備援**：Cloudflare Workers AI `@cf/openai/whisper`。
  - **純淨無干擾的 UI 選項**：
    - 去除「Whisper」或「AI」等技術贅字與雜訊，提供乾淨純粹的介面：
      - **`🎙️ 匯入音訊（逐字稿）`**（預設推薦）：100% 原音忠實轉錄，無任何加工或幻覺。
      - **`✨ 匯入音訊（區分發言者）`**（可選）：嚴格逐字對齊，標註發言者輪替。
  - **多格式音訊支援**：支援上傳常見音訊檔案（`.mp3`, `.m4a`, `.wav`, `.aac`, `.ogg`, `.webm`, `.flac`, `.opus`, `.mp4` 等）。
  - **REST API 端點**：提供 `POST /api/audio/transcribe` 與 `POST /:path/transcribe`，支援 `multipart/form-data`、二進位串流與 JSON Base64，支援以 `?diarize=1` 參數開啟發言者分離。
  - **流暢編輯整合**：支援「取代全文」或「插入游標處」，並提供即時 Toast 轉錄進度與完成提示。

- **📱 PWA 常駐主動安裝按鈕與跨平台體驗**
  - 於右下角 GitHub 連結旁新增常駐「安裝 App」按鈕（`#pwa-install-manual-btn`）。
  - 移除桌面與手機端隨機自動彈出的提示橫幅，改為主動安裝機制。
  - 在 HTML `<head>` 最前端即時捕獲 `beforeinstallprompt` 事件，並支援 macOS Safari / iOS Safari 精確 Toast 指引，提升 Service Worker 快取版本至 `v4`。

- **⚡ Local-First 本地優先儲存架構與智慧雲端同步**
  - **0ms 本地即時存檔**：編輯打字時以 300ms 防抖即時寫入客戶端 **IndexedDB (`CloudNotepadOfflineDB`)**，狀態顯示 `🟢 本機已存`，享受原生桌面級流暢體驗。
  - **智慧節流雲端同步**：停止輸入 3.5 秒、定期週期性間隔、或關閉/切換分頁（透過 `visibilitychange` / `keepalive` / `sendBeacon`）時自動向雲端同步，節省 90% 以上寫入請求，徹底解決 Cloudflare KV 1,000 次/天寫入上限。
  - **斷網離線與自動恢復**：離線草稿標記為 `pending`，網路恢復時（`online` 事件）自動背景同步至雲端。
- **🔌 可插拔後端儲存驅動 (`src/storage_driver.mjs`) 與 D1 相容遷移支援**
  - 提供統一儲存介面，透過 `SCN_STORAGE_DRIVER` 支援 `auto`（預設）、`kv`、`d1` 三種模式。
  - **`auto` 雙寫與相容模式**：優先讀寫 D1，若舊文章未在 D1 則自動 Fallback 讀取 KV，並於編輯儲存時自動雙寫同步至 D1，保證歷史 KV 文章 100% 平滑遷移與零停機。
  - 提供 `schema/notes_d1.sql` 資料庫遷移 Schema。
- **🛠️ Markdown 轉換與無狀態分析工具 API**
  - **`POST /api/markdown/render`**：支援 Markdown 渲染為 HTML，支援指定 20 款 CSS 主題、整頁 HTML 包裝與自訂標題。
  - **`POST /api/markdown/parse`**：支援 HTML 字串或網頁 URL 解析轉換為乾淨 Markdown。
  - **`POST /api/markdown/extract`**：提取 Markdown 純文字、文章標題、大綱目錄 (Headings)、超連結、圖片與精準字數/預估閱讀時間統計。
  - **`POST /api/markdown/lint`**：自動檢查 Markdown 語法問題（未閉合程式碼區塊、標題缺少空格、空連結、未加引號 Mermaid 節點）並輸出自動修復的 Markdown。
- **💬 劃線註解與討論串 REST API (D1 持久化)**
  - `GET /api/shares/:shareId/annotations`：獲取公開分享頁面的所有劃線註解與討論串。
  - `POST /api/shares/:shareId/annotations`：傳入段落錨點（`selectedText`、`prefix`、`suffix`）建立劃線註解討論串。
  - `POST /api/shares/:shareId/annotations/:threadId/messages`：回覆特定討論串。
  - `POST /api/shares/:shareId/ai-assistant`：針對文章或劃線段落進行 AI 概念解釋與問答。
- **🤖 LLM 標準索引 (`/llms.txt` & `/llms-full.txt`)**
  - 符合 llmstxt.org 標準，提供面向 AI Agent 與 LLM 的精簡與完整架構索引、OpenAPI 規格與 Skill 文檔指引。
- **📱 PWA 支援、檔案關聯 (File Handling API) 與離線工作區 (Offline Workspace)**
  - **📂 檔案關聯 (File Handling API)**：
    - 在 `app.webmanifest` 與 Worker 路由中註冊 `file_handlers`（關聯 `.md`、`.markdown`、`.txt` 檔案）。
    - 支援透過 PWA Launch Queue 在作業系統（macOS Finder 或 Windows 檔案總管）中右鍵點擊 `.md` 檔案直接使用 `wiki.david888.com` 開啟並載入編輯器。
  - **⚡ 離線工作區 (Offline Workspace)**：
    - 全面升級 `/_pwa-offline`，在無網路環境下提供完整的本機 Markdown 編輯器介面。
    - 支援離線瀏覽與編輯所有本機快取筆記、建立新離線草稿、開啟本機檔案與即時匯出 `.md` 檔案。
  - **💾 混合本機存儲架構 (`static/js/offline-store.mjs`)**：
    - **LocalStorage**：同步儲存輕量元數據（`path`、`title`、`updatedAt`、`size`、`theme`、`syncStatus`），提供快速即時索引。
    - **IndexedDB (`CloudNotepadOfflineDB`)**：非同步儲存完整 Markdown 內文與歷史草稿，徹底突破 LocalStorage 5MB 上限。
    - **記憶體自動降級 (Memory Fallback)**：於無痕模式或不支援 IndexedDB 的極端環境下自動無縫降級為記憶體快取。
  - **⌨️ 快捷鍵支援 (`Cmd/Ctrl + S` & `Cmd/Ctrl + O`)**：
    - `Cmd/Ctrl + S`：於編輯模式即時將文章儲存至本機 IndexedDB 與雲端（若已發布）；於檢視/分享模式觸發 Markdown 檔案下載。
    - `Cmd/Ctrl + O`：於編輯模式快速喚起系統檔案選擇器，載入本地 Markdown 檔案。
  - **📱 常駐 PWA 主動安裝按鈕 (`#pwa-install-manual-btn`)**：
    - 於頁面右下角工具列（GitHub 按鈕旁）新增常駐「安裝 App」按鈕。
    - 支援主動呼叫瀏覽器原生安裝確認彈窗（`deferredInstallPrompt`），即使先前已關閉頂部提示橫幅亦可隨時手動安裝。
    - 針對 Safari / iOS 提供安裝指引提示（「分享 ➔ 加入主畫面」），並於獨立 App 模式（Standalone）下自動隱藏。
  - **🌐 連線狀態即時感應**：監聽 `online` 與 `offline` 事件，斷網時自動進入離線本地保護模式，聯網恢復時自動提示並增量同步修改。

## [2026-08-15]

### Added

- **簡報模式全面升級 (Slidev-Lite 2.0: KaTeX / Mermaid / ECharts / 懸浮工具列 / 主題綁定 / 現代版型 / 導出)**
  - **📊 豐富組件繪製**：簡報中全面支援 KaTeX 數學方程式即時渲染、Mermaid 流程圖轉 SVG 自動適配、ECharts 動態圖表初始化與自動縮放，確保在 16:9 投影片中等比例縮放且不破版。
  - **🎛️ 底部簡報快捷懸浮工具列 (`#presentation-toolbar`)**：
    - 半透明毛玻璃膠囊導覽列，閒置 2.8 秒自動平滑淡出，滑鼠移動即時喚醒。
    - **◀ / ▶ 翻頁與頁碼跳轉**：即時顯示目前頁碼與總頁數，點擊頁碼可直接輸入跳轉。
    - **🔲 大綱總覽 (Overview)**：按鍵 `O` 或點擊按鈕，展開全 slide 網格縮圖快速導覽。
    - **🔴 數位雷射筆 (Laser Pointer)**：按鍵 `L` 或點擊按鈕，滑鼠化身為帶有光暈的紅色雷射亮點。
    - **⚫ 黑屏暫停 (Pause Blackout)**：按鍵 `B` 或 `.` 進入演講暫停黑屏。
    - **⛶ 全螢幕切換**：按鍵 `F` 或點擊按鈕切換全螢幕簡報。
  - **🎨 筆記主題與字型深度同步 (`data-presentation-theme`)**：
    - 自動繼承當前筆記所選定的 20 款 Markdown 主題色調（如 `retro`、`tokyo-night`、`notion-clean`、`green-simple`、`ayu-light` 等）與字型，大幅提升演講視覺質感。
  - **📑 擴充 Slidev 現代語法**：
    - **封面頁 (Cover Layout)**：支援 `<!-- layout: cover -->` 或 `<!-- cover -->`（或首頁單一 H1 自動識別），套用大標題置中封面設計。
    - **多欄排版**：支援雙欄 `::left::` + `::right::` 與三欄 `::left::` + `::center::` + `::right::`。
    - **自訂背景**：支援 `<!-- bg: #color -->`、`<!-- bg: url(...) -->`、`<!-- bg: linear-gradient(...) -->`。
    - **程式碼逐行高亮**：支援 ````lang [1-2|4-6]```` 或 ````lang {1-2|4-6}```` 逐行聚焦點亮動畫。
  - **📄 簡報導出功能**：
    - **另存 PDF 簡報**：直接觸發最佳化投影片列印引擎。
    - **導出當前頁圖片 (PNG)**：以 2x Retina 解析度將當前投影片繪製為獨立 PNG 檔案並自動下載。
    - **複製投影片連結**：一鍵複製包含當前頁碼 Hash 的精準簡報分享連結。

- **Share 模式「圈選文字浮動工具列（📋 複製 / 🌐 翻譯 / ✨ 詢問 AI / 💬 註解）」與原位小卡 (Inline Popover)**
  - 將分享頁原本單一的劃線註解按鈕升級為現代化多功能膠囊浮動工具列（`.selection-action-toolbar`），具備毛玻璃磨砂質感、高對比陰影與流暢彈出動畫。
  - **📋 複製 (Copy)**：一鍵複製選取文字至剪貼簿並彈出 Toast 提示。
  - **🌐 翻譯 (Translate)**：自動判定中英雙向翻譯（含中文字自動翻為 English，其他翻為繁體中文），無縫呼叫後端 `/api/shares/:shareId/ai-assistant`，並在原位小卡中顯示譯文與一鍵複製譯文。
  - **✨ 詢問 AI (Ask AI)**：提供 4 組快捷預設晶片（`🔍 解釋概念`、`💡 重點摘要`、`📐 公式推導`、`💻 程式碼解析`）與自訂問題輸入框，即時解答讀者提問。
  - **💬 註解 (Annotate)**：保留原有強大的段落錨點討論功能，無縫展開側邊註解欄。
  - **智慧定位與點擊穿透保護**：浮動工具列與 AI 小卡依據選取區塊（`Range.getBoundingClientRect()`）智慧偵測上方/下方視窗可用空間進行自動翻轉與水平居中；支援點擊外部自動收合與 Escape 快速鍵。

- **獨立「複製內容」與「匯出」下拉選單 (`[ 📋 複製 ▾ ]` & `[ ⭳ 匯出 ▾ ]`)**
  - 將原本塞在匯出選單中的「整篇內容複製」獨立為專屬的 **`[ 📋 複製 ▾ ]`** 下拉選單（富文字、純 Markdown、Notion、Jira/Confluence、飛書、長圖）。
  - **`[ ⭳ 匯出 ▾ ]`** 專注於檔案下載與列印（長圖 .png、Markdown .md、離線 HTML .html、另存 PDF / 列印）。
  - Consolidated export, document copying, and print controls in Edit and Share modes into a single, cohesive **`[ ⭳ 匯出 ▾ ]`** dropdown menu.
  - **長圖導出 (.png)**: Integrated dynamic on-demand loading of `html2canvas` in an isolated rendering sandbox with 2x Retina pixel ratio for full-height, unclipped image exports of Markdown and mathematical equations.
  - **複製圖片 (Copy Image)**: One-click copy of the rendered 2x long image directly to system clipboard (`image/png`).
  - **整篇內容複製到 (Copy Document To)**:
    - **一般富文字 (Rich Text)**: Inlines full typography theme styles to paste directly into Microsoft Word, Google Docs, Apple Notes, and Email.
    - **純 Markdown**: Clean raw Markdown copy for Obsidian, VS Code, GitHub, and ChatGPT.
    - **Notion 相容格式**: Auto-formats equation delimiters (`$$...$$`) and blocks for instant Notion block creation.
    - **Jira / Confluence**: Converts Markdown headings (`h1.`), code blocks (`{code}`), quotes (`{quote}`), tables, and bold/italic into native Jira Wiki Markup.
    - **飛書 / Lark**: Inlines clean document structures and formula notations for seamless pasting into Feishu Cloud Docs.
  - **匯出 Markdown (.md)**: Clean, instant download of note source Markdown.
  - **匯出 HTML 網頁 (.html)**: Self-contained, standalone offline webpage export containing the active typography theme CSS and KaTeX math fonts.
  - **另存 PDF / 列印預覽**: Direct shortcut to browser print engine with A4 print-optimized styling.

- **Theme Palette & Preview Width Dropdown Menus (`[ 🎨 主題 ▾ ]` & `[ ⬌ 寬度 ▾ ]`)**
  - Replaced native select controls with sleek, unified dropdown menus (`#theme-dropdown` and `#width-dropdown`) in the appearance toolbar section.
  - **Width Dropdown**: Provides instant selection between 100% (全寬), 960px (緊湊), 1200px (標準), and 1440px (寬版) with active checkmark indicators (`✓`) and instant layout adjustments.
  - **Theme Dropdown**: Displays all 20 curated Markdown typography styles in a scrollable menu with active checkmark indicators (`✓`) and live CSS switching.

- **Math Formula Click-to-Copy & 7 Output Formats (Share & Preview Modes)**
  - Clicking any rendered KaTeX formula in Share mode or Editor Preview instantly copies the equation with toast feedback and visual highlight animation.
  - Added **Formula Copy Format (`公式複製格式`)** configuration modal (`#math-format-btn` in footer toolbar and settings), supporting 7 versatile output formats:
    1. **自動判斷 (Auto)**: Inline with `$...$`, display blocks with `$$...$$`.
    2. **LaTeX (含 $)**: Always with `$` or `$$` delimiters.
    3. **LaTeX 純文字**: Raw formula syntax without `$` (ideal for Desmos, WolframAlpha).
    4. **Notion (雙 $)**: Always with `$$...$$` delimiters for Notion equations.
    5. **MathML (Word)**: Native XML math structure written to clipboard as HTML/text.
    6. **圖片 PNG**: 2x high-resolution transparent PNG image blob copied to clipboard.
    7. **SVG (進階)**: Clean vector SVG markup for Illustrator, Figma, and web design.
  - User format selection is persisted to `localStorage` (`cf-notepad:math-copy-format`, defaulting to `auto`).

- **Wikipedia-Inspired Dual-Card Editor Onboarding & Markdown Default**
  - Redesigned editor preference modal (`EDITOR_PREFERENCE_MODAL`) into side-by-side interactive cards with zero-friction one-click action buttons (`以 Markdown 開始` / `以 Block 開始`).
  - Set **Markdown 編輯器** as the recommended default format (`DEFAULT_EDITOR_FORMAT = 'markdown'`) with prominent badge highlighting.
  - Fixed preference session persistence: when "記住我的選擇" is not checked, every click on the "＋" New Note button reliably prompts the format selection modal.

### Changed

- **Streamlined Footer Toolbar & Natural Math Button Placement**
  - Moved the **`fx 公式`** (Math Formula Copy Format) button directly next to the **`複製 (Copy)`** button in both Edit and Share modes for cohesive content action grouping.
  - Simplified the **`＋`** New Note button into a balanced, compact icon button by removing the redundant text label, creating a clean split button alongside the `▾` creation menu.
- **Clean Git Working Tree for Screenshot Paste Files**
  - Added `orca-paste-*` pattern to `.gitignore` to prevent chat screenshot artifacts from cluttering source control.

## [2026-08-10]

### Added

- **llms.txt Standard Integration & Extended Documentation (`llms-full.txt`)**
  - Updated `/llms.txt` according to `llmstxt.org` specification, organizing core pages, agent skills, API discovery, development team info, and extended documentation links.
  - Added `/llms-full.txt` dynamic worker endpoint and static fallback file (`static/llms-full.txt`) providing comprehensive system architecture, route indexes, REST API contracts, and security policies.
  - Updated discovery headers to inject `Link: </llms.txt>; rel="llms-txt"; type="text/markdown"`.
  - Added dynamic origin resolution for `/llms.txt` and `/llms-full.txt` worker responses.
  - Updated `robots.txt` crawler policies and documented `/llms-full.txt` in project `README.md`.

### Fixed

- **Mobile RWD Table Border Clipping & Print Formatting Reset**
  - Resolved table clipping in mobile responsive view by removing negative margins (`margin-left: -30px`) and setting container-bound width (`100%`) with responsive horizontal overflow (`overflow-x: auto`).
  - Fixed print mechanism (`@media print`) by adding standard `@page` margins (`12mm 15mm`), hiding block editor drag handles (`.david888-drag-handle`, `.tiptap-block-handle`), resetting table box shadows, and preventing right-edge text clipping in PDF exports and printed pages.

## [2026-08-09]

### Added

- **URL to Markdown Web Clipper Import**
  - Added `🌐 從網址匯入 (URL 轉 Markdown)` entry to the `＋ 新增` / `+ New` dropdown menu.
  - Implemented high-availability 3-tier backend proxy (`/api/url2md`): Primary (`http://2md.aiurl.tw/`) with automatic Failover to Backup 1 (`https://2md.glsoft.ai/`) and Backup 2 (`https://create360.ai/`).
  - Supports extracting article title and clean Markdown from any public web page, inserting or replacing into current editor or automatically creating a new note via `/api/new-note`.
- **LLM Website Entry Point**
  - Added `https://wiki.david888.com/llms.txt`, a concise, canonical Markdown index for LLMs and agents.
  - Links only to public, stable discovery resources: Agent Skill, API documentation, OpenAPI, authentication guidance, API catalog, skill index, robots policy, and public sitemap.
- **New-note Editor Preference**
  - First-time visitors choose Block or Markdown for new notes, with Block selected by default.
  - The choice can be remembered across visits or retained only for the current browser session.
  - The footer `＋ 新增` action now creates a note with the preferred editor, while its adjacent menu keeps explicit format choices and a preference setting.

- **Notion-like Block Editor Dialogs**
  - Replaced browser prompt dialogs with an in-editor, keyboard-accessible block dialog for links, image URLs, YouTube, PDFs, files, Mermaid, ECharts, and raw HTML.
  - Added an Edit action to every embedded block, so existing media and structured blocks can be changed without deleting and recreating them.
  - Validates HTTP(S) URLs and ECharts JSON before a block is inserted or updated.

### Fixed

- **Default Editor Preference Menu Icon & Label**
  - Fixed missing `SVG_ICONS.settings` definition which caused `undefined 編輯預設編輯器` string rendering in the dropdown menu.
  - Clarified confusing label to **`⚙️ 設定預設編輯器模式`** (`Set Default Editor Mode`) for choosing default format (Block or Markdown).

### Changed

- **BlockNote Editor Migration**
  - Replaced the hand-built Block editor UI with BlockNote's ready-made Notion-style React interface: side `+` menu, drag-and-drop controls, slash commands, floating formatting toolbar, and responsive mobile UI.
  - Kept the persisted Tiptap block-document format as a compatibility boundary, so existing notes, Share rendering, and APIs continue to work without a data migration.
- **Block Editor Touch Targets**
  - Enlarged mobile editor controls and dialog actions for more reliable touch interaction.
- **Notion-style Block Controls**
  - Replaced the wide, always-visible formatting toolbar with a compact add/undo/redo control and a cursor-side `+` block menu.
  - Moved slash commands next to the caret and constrained the selected-text formatting menu to its content width.

### Fixed

- **BlockNote Dark-mode Synchronization**
  - BlockNote now follows the site’s light, dark, and automatic theme settings immediately, including system theme changes.
  - Removed the forced light theme and the editor surface override that prevented BlockNote’s native dark palette from rendering.

- **Modal Keyboard and Motion Accessibility**
  - Standardized dialog semantics and hidden state across editor modals, including the mobile bottom sheet.
  - Added focus trapping while a modal is open and returns focus to the initiating control after it closes.
  - Added a reduced-motion mode for people who enable `prefers-reduced-motion` in their operating system or browser.

## [2026-08-06]

### Added

- **AnyDoc WebAssembly Multi-Format Document Import**
  - Integrated `@firecrawl/anydoc-wasm` for client-side WebAssembly document-to-Markdown conversion directly inside the browser tab.
  - Expanded editor file import (`#import-md-input`) to support Word (`.doc`, `.docx`, `.docm`), PowerPoint (`.ppt`, `.pptx`, `.pps`, `.pot`), Excel (`.xls`, `.xlsx`, `.xlsm`, `.csv`), PDF, EPUB, ODT, ODS, ODP, and RTF.
  - Self-hosted WebAssembly assets under `/wasm/anydoc_wasm.js` and `/wasm/anydoc_wasm_bg.wasm` with lockfile-guaranteed versioning and CDN fallback.
  - Added an import document action (`#dropdown-import-doc-btn`) to the `＋ 新增` / `+ New` dropdown menu for quick access.
- **Pre-Conversion Import Options Modal**
  - Added `.import-options-modal` dialog prompting users BEFORE file reading or WASM conversion when the editor has existing content.
  - Supports **Replace All (`取代全文`)**, **Insert at Cursor (`插入游標處`)**, or **Cancel (`取消`)**.
  - Cancelling immediately aborts execution without loading WASM or consuming mobile CPU/RAM.
- **Stray Birds & Startup Tips Typewriter Animation**
  - Re-implemented smooth character-by-character typewriter animation (`typeText`) for Tagore poem quotes and startup tips when creating new notes.
  - Added blinking caret cursor (`▋`) styling and instant hide behavior upon user typing.
  - Added a new bilingual startup tip for multi-format document conversion in `static/data/editor-tips.json`.
- **CLI Document Publishing Helper (`scripts/doc2wiki.sh`)**
  - Added executable helper script to convert local office/PDF files via `@firecrawl/anydoc` CLI and publish directly to `wiki.david888.com` API with theme and share link extraction.

## [2026-08-04]

### Added

- **Block Editor Architecture & Dedicated Creation Routes**
  - Added support for `editorFormat: "block"` immutable note format in metadata, enabling single-column WYSIWYG block-based notes alongside standard Markdown notes.
  - Registered `/new/block` and `/new/markdown` creation endpoints that allocate unique note slugs with locked format metadata.
  - Added the leftmost Footer `＋ 新增` / `+ New` menu: desktop exposes its label, mobile keeps a compact plus button, and both formats are available from its dropdown.
  - Implemented `src/block_renderer.mjs` supporting JSON document parsing, safe HTML rendering for all core blocks (`heading`, `paragraph`, `bulletList`, `taskList`, `code`, `quote`, `divider`, `slideBreak`, `image`, `youtube`, `pdf`, `mermaid`, `echarts`, `file`, `raw`), and Markdown export.
  - Updated title and description extraction in `src/note_meta.js` to parse block JSON documents seamlessly.
- **Vanilla Block Editing and Rich Block Rendering**
  - Added a single-column Block editor canvas with structural controls, mobile-friendly move buttons, and no persistent Markdown preview.
  - Connected image upload to the existing R2 endpoint and file upload to the existing 888box fallback endpoints.
  - Added safe Mermaid and ECharts enhancement on rendered Block pages; `slideBreak` blocks become Reveal.js slide separators.
- **Unified Publish Choices**
  - Consolidated Publish, Autosave, and Public Index into one checkbox dialog instead of asking three consecutive questions.
  - All three choices default to enabled. Confirmed choices are remembered in localStorage and restored the next time the dialog opens on the same device.
  - The first publish writes content, share state, Autosave, and Public Index together in one settings request.
- **Editor Preview Publication Status**
  - Added a compact status strip above the Edit preview with the Share URL, copy/open controls, Public Index state, retained D1 version count, unique D1 view count, and last-saved time.
  - Draft notes show a short publish hint; desktop shows the full status while narrow and phone previews use a compact layout.

### Changed

- **Save Control Group & History Button Placement**
  - Moved `Recent Shares` (`#share-history-btn`) and `Version History` (`#note-history-btn`) buttons inside the footer `.save-control-group` before the `Save` button, grouping all save and history operations together.
- **Autosave Rail Switch UI**
  - Replaced the standard checkbox UI for `Autosave` with a 3D flip-card `RAIL_SWITCH` button matching the `Zh / En` language toggle style (`Auto` / `Manual` / `自動` / `手動`).
- **Fullscreen Presentation Mode Relocation**
  - Relocated the `Fullscreen Presentation Mode` button (`#present-btn`) from the editor footer toolbar to the preview header status bar right before the publication state badge (`Live` / `Draft`).
- **Random New-Note Preview Device**
  - Brand-new editor notes now start with either desktop or mobile preview at random, giving authors an early chance to check narrow-screen layout.
  - Existing notes keep their saved editor preview preference, and Share pages remain responsive to each reader's actual viewport.
- **Publish Follow-up Flow**
  - Removed the separate post-publish Autosave and Public Index questions. Public Index remains enabled by default in the unified dialog to support sitemap discovery.

### Fixed

- **Block Format Integrity and Rendering Safety**
  - `/new/block` and `/new/markdown` now persist a locked format before redirecting; API, publish, and form saves reject invalid Block JSON and format changes.
  - Block renderers now validate every block, accept only HTTP(S) or same-origin media URLs, and display `raw` content as escaped source code rather than executable HTML.
  - Block Share pages render server-side HTML rather than treating JSON as Markdown; explicit Markdown responses use the documented best-effort export.

- **Dark Mode Dropdown Danger Item Contrast**
  - Updated `--toolbar-danger` (`#ff7b72`) and `--toolbar-danger-bg-hover` (`rgba(248, 81, 73, 0.2)`) in dark theme palettes.
  - Ensured the "Unpublish" (`取消發布`) action text in the share dropdown menu remains high-contrast, clearly legible, and stylishly highlighted in dark mode.
- **Edit Preview Rendering and Alignment**
  - Fixed publication-status initialization errors that stopped the Markdown renderer before it could populate the preview.
  - Matched the publication status strip to the editor toolbar's 32px height so both content panes and their scroll origins align vertically.
  - Centered the Edit preview reading-progress rail vertically, matching its Share-page position.
- **Dark Editor Chrome Consistency**
  - Made the Edit preview publication strip inherit the dark UI palette instead of retaining its light background.
  - Changed published/indexed states to the same blue color family in dark mode, and strengthened footer control labels to bold high-contrast text.
  - Gave active footer controls distinct cool-tone roles: teal-blue for publishing, blue for preview/layout, indigo for font, and violet-blue for language.

### Documentation

- **Mermaid Render Error Safeguards in Skill Docs**
  - Updated both `skills/SKILL.md` (canonical site documentation) and `.agent/skills/david888-wiki-publisher/SKILL.md` (local agent skill) with critical safeguards against Mermaid lexical syntax errors.
  - Required LLMs to enclose node labels in double quotes `"..."` to prevent unquoted slashes (e.g. `[/api/proxy]`) from triggering Mermaid parallelogram token (`[/.../]`) parsing failures.
  - Re-generated `src/generated/agent-skill.generated.mjs` so `https://wiki.david888.com/.well-known/agent-skills/david888-wiki-publisher/SKILL.md` serves the updated instructions.

### Removed

- **Editor View Shortcuts**
  - Removed the non-functional `⌘-⌥-7` / `Ctrl-Alt-7`, `⌘-⌥-8` / `Ctrl-Alt-8`, and `⌘-⌥-9` / `Ctrl-Alt-9` shortcuts, including their startup tip and documentation.
## [2026-08-01]

### Fixed

- **Print & PDF Export Layout Cleanliness**
  - Updated `@media print` CSS rules in `base.css.js` and `share-annotations.css` to hide all non-content floating UI overlays during print or PDF export, including mobile bottom sheets (`.bottom-sheet`), floating tooltips (`.floating-tooltip`), toolbars (`.toolbar`), reader controls (`#reader-controls`), and annotation rail buttons (`.annotation-rail-button`).
  - Overrode mobile negative bleed margins (`margin-left: -30px` / `-18px`) during print for `.markdown-body > table`, `.markdown-body > pre`, and `.markdown-body > .media-preview` with `margin-left: 0 !important; width: 100% !important;`, preventing left/right text clipping on printed paper and PDF exports.
  - Added compact cell padding (`5px 6px`), reduced font sizing (`9.5pt`), and automatic word wrapping (`overflow-wrap: anywhere; word-break: break-word`) for print table cells (`th, td`), preventing multi-column tables from overflowing the right printable boundary.

- **Annotation Rail Button Positioning**
  - Repositioned the default initial placement of `.annotation-rail-button` to the top-right corner (`top: 16px; right: 14px`), preventing it from obscuring the mobile back-to-top button.

## [2026-07-31]

### Added

- **Share Annotation Navigation and Deep Links**
  - Moved the Share-page reading-progress rail to the vertical center on desktop while retaining the compact top placement on mobile.
  - Moved the paragraph-annotation launcher below the right-side controls; readers can drag it to any viewport position, which is remembered separately for each Share page.
  - Added `複製連結` / Copy link beside `定位原文` / Locate in article. Opening the copied annotation URL expands the annotation sidebar, centers the cited text, and flashes its source. Password query values are intentionally excluded from copied URLs.

- **Installable PWA Shell**
  - Added a Web App Manifest, 192px/512px app icons, and Service Worker registration so the notepad can be installed as a standalone app.
  - Added an in-app `安裝 App` / Install app prompt for Android Chromium browsers after they report that the PWA is installable; clicking it opens the browser's native install confirmation.
  - Kept the cross-platform installation flow with a 24-hour renewal cycle: `×` closes the promotion for 24 hours. If the app remains uninstalled, the prompt will ask again after 24 hours have elapsed.
  - Added a bilingual offline page that appears when navigation is attempted without a network connection.
  - The Service Worker precaches only the PWA shell, manifest, and icons. It never caches notes, Share pages, or API responses, so protected content is not persisted in browser cache.

### Fixed

- **PWA Install Prompt Dismissal**
  - Added `.pwa-install-prompt[hidden]` CSS rule to ensure setting `prompt.hidden = true` immediately hides the PWA install prompt on screen when the `×` button is clicked.
- **PWA Manifest App Name**
  - Updated Web App Manifest (`app.webmanifest`) and added a dynamic route handler to serve the configured application name (`david888 wiki` / `SCN_APP_NAME`) instead of default `Cloud Notepad`.

### Documentation

- Documented PWA installation and the intentionally limited offline behavior in both README language sections.

## [2026-07-30]

### Added

- **HackMD Image Size Compatibility**
  - Markdown images now accept HackMD-style `=600x`, `=600x400`, and `=x400` dimensions while retaining responsive maximum width.
- **Two- and Three-Column Content Layouts**
  - Added Edit toolbar actions that wrap selected Markdown in `two-column-layout` or `three-column-layout` containers.
  - Column sections are grouped by headings and collapse to one column on narrow screens.

### Changed

- **Initial-Only Random Theme**
  - Random Theme selection now runs only for a brand-new note created from the site root; reopening an existing author Edit restores its persisted Theme.
  - The initial Theme is written to Server metadata immediately and is included again in the first publish request.
- **Human New-Note Titles**
  - Empty new notes use a localized Taiwan-time title such as `新筆記 · 07/30 09:05` or `New note · 07/30 09:05` instead of displaying the random note path.

### Fixed

- **Annotation Source Navigation**
  - `定位原文` / `Locate in article` now scrolls the actual nested article container and centers the exact annotated range before flashing its source element.

### Documentation

- Added a README storage inventory covering Server KV, D1, R2, external services, localStorage, sessionStorage, and Cookies.
- Clarified that Markdown Themes are Server metadata, while editor chrome and layout preferences use browser storage.

## [2026-07-29]
### Added
- **D1 Share View Counter**
  - Added a per-note D1 view counter to normal HTML Share pages and displayed the total in the Share footer.
  - Excluded HEAD requests, Markdown responses, embeds, and presentation pages from view counting.
  - Kept article delivery resilient: missing or unavailable D1 stats do not block a Share page from loading.
- **Per-Note Paragraph Annotation Control**
  - Added an author-only `段落註解` / Paragraph annotations switch to the published Share menu.
  - Published notes default to open; an author's explicit choice is persisted in KV note metadata and restored on reload.
  - Unpublishing closes annotations without deleting any annotation records.
- **D1 Annotation Read Model**
  - Added independent D1 thread and message tables that retain the selected quote, surrounding context, source offsets, and source revision even when the article changes.
  - Added a paginated Share annotation read API with opaque cursors and bounded thread/message results.
  - When an author closes annotations, retained discussions are hidden rather than deleted.
- **Paragraph Annotation Write API**
  - Added same-origin Share APIs for creating a text-anchored discussion and replying to an existing thread.
  - Enforced author, comment, quote, context, offset, and source-revision validation before writing parameterized D1 transactions.
  - Preserved Share view-password checks and rejected new threads when the article changed after text selection.
- **Share Text Selection Annotations**
  - Enabled readers to select rendered Share text and open a nearby annotation action that carries the quote into a discussion composer.
  - Added a responsive annotation sidebar with thread history, replies, source highlighting, source navigation, loading/error/empty states, and keyboard focus treatment.
  - Reattaches discussions with exact quote plus surrounding context after article edits; when the quoted text is gone, the retained thread is labeled `原文已移除`.
- **Dedicated AI Translation and Bilingual Output**
  - Added a separate top-toolbar `AI 翻譯` / AI Translate action. It asks for the target language and lets the author choose translation-only output or a bilingual document that keeps each original Markdown block.

### Changed
- **Random Theme on Every Edit**
  - Each Edit page render now picks one theme at random from the complete bundled theme registry and keeps the selector synchronized with the preview.
  - The random preview does not write KV merely by opening the editor; Share pages retain their persisted article theme until the author explicitly chooses another theme.
- **Annotations Enabled by Default**
  - Existing published notes without an annotation preference now expose paragraph annotations automatically, without a KV migration.
  - New and republished notes start with annotations enabled, while notes explicitly disabled by their authors remain closed.
- **Format-Only AI Formatting**
  - AI formatting now has an explicit format-only policy: it may improve Markdown structure, whitespace, headings, and lists, but must preserve the source language, prose, links, code, and meaning.
  - Pure-English documents reject a formatting response that introduces Chinese characters, keeping the original text unchanged instead of applying an unintended translation.
  - Fixed an editor-script syntax error that had stopped Markdown previews from rendering. The three AI controls are now adjacent icon-only buttons, and formatting or translation applies only to a selected fragment when one is selected.
  - The selection shortcut now exposes `排版` / Format, `AI 編輯` / AI Edit, and `翻譯` / Translate, all scoped to the selected fragment. Removed a stale wide-button style so the three toolbar icons use consistent sizing and spacing.
- **Edit Preview Typography and Icon Safety**
  - The edit preview reapplies the CJK-aware GenJyuu/Maple font stack after a theme stylesheet loads, so Chinese preview text no longer falls back to a theme font.
  - Replaced the invalid footer GitHub SVG path with a browser-safe 24px icon, removed the presentation engine's production debug log, and placed the password input in a proper submit form.

### Fixed
- **Unique Share Views Per Device**
  - Share view totals now increase only once per browser/device for each article; reloading the same Share page no longer increases the count.
  - Added a one-year, secure, HTTP-only anonymous device cookie and stores only its SHA-256 hash in D1.
  - Preserved existing view totals while applying the new unique-view rule to future visits.
- **Selection-Only AI Translation**
  - The floating selection toolbar now snapshots the textarea range before its button receives focus, so Format, AI Edit, and Translate keep the intended fragment.
  - Selection translation sends only the highlighted Markdown to Workers AI; surrounding paragraphs are no longer included as model context and cannot be translated accidentally.

### Documentation
- Updated the Traditional Chinese and English README descriptions for the separated formatting and translation workflows.

## [2026-07-28]
### Changed
- **Bounded 16:9 Presentation Canvas**
  - Replaced the 1000×700 presentation stage with a bordered 1280×720 canvas and consistent internal safe areas.
  - Preserved a readable 22px authoring minimum; slides that still overflow become scrollable and show an editor-only split-slide warning instead of silently clipping content.
  - Added wrapping for long URLs and code, readable table overflow, media height constraints, and a portrait-phone prompt to rotate into landscape.

### Fixed
- **Fullscreen Presentation Mode Entry Restored in Share Views**
  - Added `打開簡報頁面` (Open Presentation Page: `/share/:shareId/present`) back to the published Share Dropdown Menu in the editor.
  - Restored the `演示` (Present) button to the read-only Share Page (`/share/:shareId`) footer controls, allowing readers to launch full-screen Reveal.js/Slidev presentations directly.
  - Synchronized `share-present-open-link` dynamically upon publishing or share state updates.
  - Added unit test coverage in `test/share-presentation-ui.test.mjs`.

## [2026-07-24]
### Added
- **Reading Progress and Editor Status**
  - Added a compact, clickable vertical reading-progress rail to the left edge of Preview and Share pages. It reports reading percentage and lets readers jump through long articles.
  - Added an editor status bar at bottom left that updates the current line, column, and total document length as the cursor moves.
- **Markdown Navigation and Editing Helpers**
  - Added standalone `[TOC]` rendering. It creates a linked, nested table of contents from Markdown headings, including `#`, `##`, `###`, and deeper levels.
  - Added a `製作目錄` / Table of Contents toolbar button immediately after Quote; it inserts `[TOC]` at the cursor.
  - Added a three-column Markdown table template and editor line numbers.

### Changed
- **Chinese Typography**
  - Bundled `GenJyuuGothic-Medium.woff2` and made it the default for Chinese glyphs in the editor, preview, and share views.
  - Preserved the existing Maple Mono and JetBrains Mono font choices for Latin text and code.

### Removed
- Removed the source-citation toolbar action after confirming that it did not match the desired Table of Contents workflow.

### Documentation
- Updated the README in Traditional Chinese and English with the reading-progress rail, editor status, `[TOC]` usage, table template, and Chinese font behavior.

## [2026-07-23]
### Fixed
- **Mobile Publish, Share Link, and Autosave State Synchronization**
  - Fixed a page-startup `ReferenceError` caused by initializing the shared URL helper after the first UI synchronization. The failure had stopped both Markdown-to-HTML rendering and mobile share-action event binding on published Edit pages.
  - Fixed `複製分享連結` returning `/share/null` after publishing from mobile Edit mode. Open Share, Copy Share Link, and Copy Presentation Link now derive their URL from the current live `shareId` at click time instead of retaining the draft page's initial link.
  - Added a guard that rejects a publish response without a valid share ID, preventing the editor from displaying a false published state or exposing invalid share actions.
  - Fixed the post-publish `開啟自動儲存` confirmation appearing to do nothing. The choice is now persisted in note metadata before the toggle, autosave timer, and success message are updated.
  - Restored saved autosave state when reopening a published Edit page and removed the page-load logic that silently reset autosave depending on navigation history.
  - Sequenced the autosave confirmation before the share modal so overlapping dialogs cannot swallow mobile input.
  - Unified PC and mobile published actions around the same `APP_STATE.shareId`, publication state, and autosave metadata instead of mixing live state with page-load DOM values and browser-only storage.
  - Added regression coverage for draft-to-published menu synchronization, null/stale share URLs, presentation URLs, autosave persistence, and mobile floating share controls.
- **Complete Floating Tooltips Across Editor and Share Views**
  - Added localized floating tooltip text to every icon-only Share action on desktop and mobile, including Edit, Export, Copy, Embed, Print, More, and the editor Share options trigger.
  - Replaced container-bound pseudo-element tooltips with a shared body-level floating layer so tooltips remain visible outside horizontally scrollable toolbars and footers.
  - Added touch, pointer, and keyboard-focus support while retaining instant display and viewport-edge positioning.
- **Mobile Published Share Menu**
  - Fixed the `...` button beside the published state in mobile Edit mode opening its menu outside the visible viewport.
  - The share dropdown is now portaled to the document body while open, avoiding clipping and incorrect fixed positioning caused by the mobile footer's scrolling and backdrop filter.
  - Restored horizontal scrolling for the Markdown toolbar and footer without sacrificing tooltip or dropdown visibility.

## [2026-07-22]
### Added / Improved
- **Instant 0ms Floating Tooltip Badge System (Zero-Lag Hover Text Labels)**
  - Replaced native delayed `title` hover tooltips and experimental layout-shifting flip cards with a **Custom 0ms Instant Floating Tooltip Badge** (`[data-tooltip]`).
  - Dark floating badges (`#2c2a29`) with crisp white text instantly appear on hover/focus across both top Markdown editor toolbar and bottom footer controls without any JavaScript `setTimeout` lag.
  - Implemented directional popups: Top toolbar buttons pop DOWN (`top: calc(100% + 6px)`), and Footer buttons pop UP (`bottom: calc(100% + 7px)`), ensuring badges are never clipped by screen edges.
- **Full Container Unclipping (`overflow: visible` & Elevated `z-index`)**
  - Resolved container clipping issues by setting `overflow: visible` and `z-index: 100` on `.footer` and `.markdown-editor-toolbar`.
  - Floating tooltip badges now float freely over the editor and preview panes without being cut off by W3C CSS `overflow-x: auto` computed boundary rules.
- **Enhanced Light Mode Icon Contrast**
  - Updated single-icon buttons (`.toolbar-icon-button`, `.toolbar-icon-link`) in Light Mode to use dark charcoal strokes (`#2c2a29`) and crisp borders (`#e2dacd`).
  - Added terracotta hover states (`#c8654b`) for visual feedback.
- **Thumb-Free 3D Flip Card Toggle Switch (Segmented Control Fix)**
  - Transformed legacy sliding rail switches (Publish/Draft, Font, Language, Device) into **Thumb-Free 3D Flip Card Toggles**.
  - Enabled auto-resizing text containers (`position: relative` on front face) to prevent long text labels from being obscured by sliding thumbs.

## [2026-07-21]
### Added
- **Single-Row Horizontal Scrollable Toolbar & Footer with Visual Wiggle Indicators (PC & Mobile)**
  - Replaced editor toolbar buttons wrapping with a clean, single-row horizontally scrollable layout (`overflow-x: auto; flex-wrap: nowrap;`) on both PC and mobile viewports.
  - Implemented the same horizontal touch-scroll behavior (`overflow-x: auto; flex-wrap: nowrap;`) for the bottom footer on all viewport sizes, including mobile and desktop, showing all edit, appearance, and sitemap/info elements inline.
  - Added dynamically positioned, floating wiggling scroll indicators (arrow icons with `wiggle-right-icon` CSS animation) to prompt the user that horizontal scrolling is available. The indicators auto-fade out immediately once the user starts scrolling.
  - Positioned footer dropdowns using fixed positioning (`position: fixed`) relative to their triggers to prevent clipping inside the scrollable footer.
  - Added micro-interaction tactile feedback with a scale-down effect (`transform: scale(...)`) on active states (`:active`) for all toolbar buttons and footer switches.
  - Retained the classic box-style 4px border-radius switches as requested.
- **UI Dark Mode (Toolbars & Footer)**
  - Added a dark mode toggle button (`ui-theme-toggle-btn`) in the footer info bar next to the GitHub link, with Sun/Moon SVG icons.
  - Automatically detects system OS dark mode preference (`prefers-color-scheme: dark`) and persists user preference to `localStorage`.
  - Added zero-FOUC inline script in `<head>` and dark mode theme variables for `.markdown-editor-toolbar`, `.footer`, `.footer-select`, `.footer-rail-switch`, `.dropdown-menu`, and `.bottom-sheet`.

### Fixed
- **Critical Template Syntax Error**
  - Fixed an orphaned `catch` block in the autosave initialization logic that caused a syntax error in the generated client-side script, breaking Markdown rendering, share mode, and UI interactions.
- **Dark Mode UI Adjustments**
  - Updated the default dark mode palette to use Pantone 19-4052 Classic Blue (`#0f4c81`) as requested.
  - Set the footer text to `font-weight: bold` by default to improve readability.
  - Fixed Web Awesome `wa-select` components (Width and Theme dropdowns) being unreadable in dark mode by explicitly passing `--toolbar-text` color to the `display-input` and `icon` parts.
  - Automatically toggles the `wa-theme-dark` class on the root element so Web Awesome components properly match the UI dark mode preference.
- **Default Theme Correction**
  - Fixed an issue where the frontend UI components would incorrectly fall back to `catppuccin-macchiato` instead of `claude-canvas` when no theme was saved.
- **Preview Width Persistence & Cloudflare KV Quota Optimization**
  - Included `width` in the publish payload (`publishCurrentNote()`) so published/shared notes reliably keep the editor's selected preview width (1200px / 960px / 1440px / 100%).
  - Removed automatic page-load KV write requests when initializing 1200px width in memory, eliminating redundant KV write calls and protecting Cloudflare Free Tier quota.
  - Refactored local editor preferences (`splitDirection`, `previewDevice`, `mode`, `autosave`) to be managed entirely via browser `localStorage` without sending KV API writes.
  - Pre-selected the `value="${effectiveWidth}"` attribute on `<wa-select id="preview-width-selector">` in SSR HTML.
  - Supported `width` parameter in Headless API (`POST /api/:path`) via query parameters, JSON body, and multipart form-data.

## [2026-07-17]
### Fixed
- **Compact Editor Toolbar and Plain Edit Mode**
  - Compressed toolbar button sizes, spacing, and padding after responsive wrapping.
  - The Markdown toolbar now remains available when preview mode is turned off; only the preview pane and splitter are removed.
- **Responsive Markdown Toolbar**
  - Narrow editor widths now wrap toolbar buttons onto additional rows instead of showing a horizontal scrollbar.
  - Very small screens use compact toolbar buttons and remove separators to keep the layout readable.
- **Web Awesome Appearance Selectors**
  - Replaced the footer's native width and theme selectors with Web Awesome `wa-select` and `wa-option` components.
  - Pinned Web Awesome to 3.10.0 and styled its exposed CSS parts to match the existing toolbar.
  - Re-applies the edit preview width after the custom element finishes loading, preserving the 1200px default.
- **Publish Menu State Sync**
  - The share menu now switches from `發布並建立分享連結` to the published share actions immediately after publishing, without requiring a page reload.
  - The newly returned share ID is applied to the open, copy, and presentation share actions in the live editor.
  - Added keyboard navigation, Escape-to-close behavior, and expanded-state ARIA attributes to the share dropdown.
- **Editor Preview Width**
  - New edit pages now default to a 1200px preview width when no note-specific or browser-saved width preference exists.

## [2026-07-15]
### Added
- **Media URL Previews**
  - Added safe preview detection for PDF, YouTube, video, and audio links in editor and share previews.
  - YouTube links use `youtube-nocookie.com` embeds; native media previews retain a fallback link.
  - Set YouTube previews to a responsive 16:9 player instead of the browser's default short iframe height.
  - Removed the fixed minimum height so the player scales correctly on narrow mobile layouts.
  - Copying rendered content now uses the sanitized HTML snapshot from before media preview decoration, keeping iframe previews out of Jira, Confluence, and similar editors.
  - Kept the Markdown parser unchanged and apply preview decoration after DOMPurify sanitization.
- **WebTalk Page Identity**
  - Added `meta[name="webtalk-page-id"]` to share and password-protected share pages using the existing share ID.

### Fixed
- **Share Embed and Viewer Settings**
  - Restored the share-page Embed button, iframe code modal, `?embed=1` route, and iframe height messaging.
  - Share-only theme, width, and font changes now stay local to the current viewer; edit pages remain persistent.
- **Attachment Upload Fallbacks**
  - Uploads now prefer `box.david888.com`, followed by `box.aiurl.tw` and `box.glsoft.ai`.

## [2026-07-14]
### Changed
- **Editor Layout and Save Prompts**
  - Fixed the draggable editor/preview divider so horizontal resizing changes pane width without leaving blank space below the editor; stacked layouts now resize the complete editor pane as well.
  - Unpublished notes now show a save-and-publish prompt after 10 seconds of stopped input, with explicit publish/save or later choices.
  - Newly published notes ask whether to enable per-note autosave.
  - Markdown downloads now prefer the note title for the filename, falling back to the note path when needed.
  - Shared-note Open Graph metadata now uses `DAVID888 WIKI` as the site name.
- **Open Graph Branding and Homepage Metadata**
  - Replaced the social-card image branding with `DAVID888 WIKI`.
  - Added a stable, indexable homepage OG payload with title, description, canonical URL, image dimensions, and large-image Twitter metadata.
  - Versioned the OG image URL so social crawlers do not keep serving the previous immutable image cache.
  - Added OG image alt text, locale, theme color, JSON-LD, an HTML language attribute, and a crawlable share-page H1.
  - Kept the root new-note workflow: browsers still open a fresh editor slug automatically, while crawlers can read the homepage metadata.
- **Runtime Slug Length Configuration**
  - Fixed the homepage's random editor URL generator so `SCN_SLUG_LENGTH` is read after Cloudflare Worker runtime bindings are injected.
  - Added a regression test covering a runtime-configured four-character slug length.
- **Public-Gated Note Saving**
  - Unpublished notes no longer persist editor content to KV.
  - Publishing saves the current editor content and publishes the note in one operation.
  - Published notes provide a manual Save button and a per-note Autosave option, disabled by default; enabled autosave waits 10 seconds after typing stops before saving.
  - Leaving a page with unsaved published content triggers the browser's native leave-page warning.
  - The UI explains that a published note can still use the View Lock when public reading should remain restricted.
- **Unified Editor Feedback and Lock Controls**
  - Centered toast messages and standardized editor alerts and confirmations with the same in-app dialog treatment.
  - Moved Save beside Publish and labeled the lock controls explicitly as Edit Lock / View Lock.
  - Replaced the standalone pencil and eye symbols with combined lock-plus-pencil and lock-plus-eye icons.

## [2026-07-13]
### Added
- **Markdown Editor Toolbar**
  - Added a localized toolbar above editable Markdown notes.
  - Added headings, emphasis, strikethrough, links, quotes, lists, task lists, inline code, code blocks, horizontal rules, tables, image insertion, and fullscreen editing.
  - Added Undo / Redo buttons and `Ctrl/Cmd+Z`, `Ctrl/Cmd+Shift+Z`, and `Ctrl/Cmd+Y` shortcuts with selection-aware editor history.
  - Added the existing AI formatting workflow to the editor toolbar while retaining the footer button.
- **Image Insertion**
  - Added file selection from the editor toolbar.
  - When R2 is enabled, selected images upload through `/upload` and are inserted as Markdown image links using the uploaded file name as the alt text.
  - When R2 is disabled, the toolbar inserts a Markdown image placeholder for manual URL editing.
- **888box Attachment Uploads**
  - Added a toolbar attachment button for video, audio, document, archive, and generic file uploads.
  - Attachments upload directly to `https://box.glsoft.ai/api.php?action=upload` and insert media-aware Markdown or HTML snippets.
  - Image uploads remain unchanged and continue to use the built-in R2 image flow.
- **ECharts Code Blocks**
  - Added support for fenced `echarts` blocks containing JSON chart options.
  - Charts load ECharts on demand, resize with the editor layout, expose an accessible label, and dispose old instances before re-rendering.
- **Editor View Shortcuts**
  - Added `⌘-⌥-7` / `Ctrl-Alt-7` for side-by-side WYSIWYG, `⌘-⌥-8` / `Ctrl-Alt-8` for pure Markdown, and `⌘-⌥-9` / `Ctrl-Alt-9` for stacked WYSIWYG.
- **Localized Startup Tips**
  - Added `static/data/editor-tips.json` as the bilingual source of editor usage tips.
  - The editor now chooses one tip at random on each load and types it below the Stray Birds placeholder in the same animation.
- **Footer Copy**
  - Added Copy beside Markdown Export in the Footer.
  - Copies rich HTML plus Markdown/plain-text fallback for Notion, Jira, and similar editors.
  - Shows a localized check animation and copied status after success.
- **Admin Dashboard**
  - Added URL totals, published/protected/Sitemap counts, legacy view totals, and retained version totals.
  - Added title/URL search, Markdown full-text search, modified-date range filters, sorting, and server-side pagination.
  - Added clickable column sorting and per-note publish, Sitemap, lock, view, version, and last-modified status columns.

### Fixed
- **Pasted Image Upload Persistence**
  - Fixed pasted images reverting to `![Uploading...]()` after reload even though the image had uploaded successfully to R2.
  - The uploaded image URL now triggers the editor auto-save flow immediately after the upload completes.
- **Password Lock Consistency**
  - Fixed share-page authentication rejecting a correct Edit Lock when no View Lock was configured.
  - Unified direct-note and share authentication for Edit Lock, View Lock, and both-lock combinations.
  - Prevented view-only sessions from saving notes, changing settings, changing locks, or invoking AI editing endpoints.
  - A View Lock without a separate Edit Lock now acts as the sole owner credential, so the note remains recoverable after enabling it.
- **Admin Route Runtime Configuration**
  - Fixed `SCN_ADMIN_PATH` and `SCN_ADMIN_PW` being read before Cloudflare Worker bindings were available.
  - The configured god-mode backend route, such as `/admin333`, is now resolved per request before the dynamic note route.
- **Toolbar Localization**
  - Inline code and other inserted placeholders now follow the current English or Traditional Chinese editor language instead of always using Chinese text.
- **Inline Code Icon**
  - Escaped the `</>` glyph so it renders correctly in the HTML toolbar.
- **Footer View Settings Grouping**
  - Grouped Preview, Layout, and Device controls together as one editor view-settings group.
- **Share Link Navigation**
  - Markdown links rendered inside share URLs now open in a new tab with `noopener noreferrer`.

### Changed
- **Compact Footer Controls**
  - Reduced the desktop footer height to reclaim vertical workspace while keeping two-line labels readable.
  - Standardized preview, publishing, font, language, layout, and device controls as square-corner rail switches.
  - Moved control names and current values inside the rails, such as `Layout / Side` and `Device / Desktop`.
  - Removed redundant `Width` and `Theme` footer labels; width context now appears in each select option.
- **Theme Selector Descriptions**
  - Restored full theme names and added localized Traditional Chinese and English style descriptions.
  - Added a tooltip for the selected theme so the full description remains discoverable without widening the footer.
- **Lock Labels**
  - Changed the English lock labels to `Edit` and `View`, with `Edit lock` and `View lock` tooltips for clarity.

### Documentation
- Future user-facing changes must update `README.md`, `CHANGELOG.md`, and `static/data/editor-tips.json` when a startup tip is appropriate.
- Synchronized `skills/SKILL.md`, `LLM_API_DOCS.md`, and MCP guidance with the current editor features, ECharts authoring, bilingual tips, and `pw` / `vpw` lock policy.
- Added a mandatory pre-invocation freshness check: agents must fetch the canonical website-hosted `SKILL.md` before using the skill.

## [2026-07-12]
### Fixed
- **Theme CSS Specificity Override**
  - Changed `bundle_themes.js` selector replacement from `.markdown-body` to `#preview-md.markdown-body, #preview-plain.markdown-body`, giving theme CSS specificity (1,1,0) that beats `editor.css.js` `#preview-md` (1,0,0).
  - This fixes all dark themes (xAI, Tokyo Night, Kanagawa, Terminal, Catppuccin Macchiato) whose background and text colors were silently overridden by the base white canvas.
  - Removed hardcoded `background-color` from `markdown.css.js` for `table tr`, `code`, `pre`, and `img`, allowing themes full control over element backgrounds.
- **xAI Theme Colors**
  - Fixed heading colors for dark background: H2 `#ffffff`, H3 `#ff7a17` (sunset orange), H4 `#dadbdf`, H5-H6 `#9aa0a6`.
  - Body text changed to pure white `#ffffff` for maximum readability on `#0a0a0a` background.

### Added
- **Dynamic Stray Birds (Tagore) Placeholder**
  - Added dynamic fetching of a random Stray Birds poem from `https://answerbook.david888.com/StrayBirds` on page load.
  - The poem is appended to the editor's empty placeholder to keep the starting page engaging.
- **Desktop Preview Split Direction**
  - Added a persisted `Layout` control that lets desktop editors switch between side-by-side and stacked editor/preview panes.
  - Mobile editing remains stacked automatically.
- **Selection AI Edit Shortcut**
  - Show a contextual AI Edit button after text is selected in the editor and reuse the existing GPT-OSS 120B selection replacement flow.
- **GPT-OSS 120B AI Editing**
  - Added a separate AI editing button powered by `@cf/openai/gpt-oss-120b` for instruction-based passage insertion, partial editing, or full-note refinement.
  - Capture textarea selections before prompting and splice the model's replacement text into the exact selection range, guaranteeing that unselected content remains unchanged.
  - Require an explicit editing instruction and return the complete edited Markdown, including untouched content, while keeping the existing GLM formatting action unchanged.

### Fixed
- **Share Toggle and Editor Preview Regression**
  - Restored the published/unpublished share toggle and its options menu after a share toolbar rewrite disconnected the published control from its click handler.
  - Hoisted share-state initialization so it no longer throws before Markdown rendering, which had left the editor preview pane blank.
  - Reused the Preview toggle geometry for the share toggle instead of applying a conflicting smaller set of slider dimensions.
  - Moved the published/unpublished label below the toggle row to match the footer's two-line icon/control-over-label layout.
- **xAI Theme Heading Contrast**
  - Added explicit dark heading colors for the app's white preview canvas while retaining the black H1 panel, so every title level remains visible.
  - Ensure heading links inherit the heading color instead of being obscured by generic link styles.
- **AI Format Response Handling**
  - Fixed successful Workers AI output being passed to `returnJSON()` as HTTP headers, which caused `Invalid header value` for Chinese or multiline Markdown.
  - Return the formatted Markdown in the JSON response body and read it from `data.result` before replacing the full editor content.
  - Reduced unnecessary model reasoning, capped completion output, and extended the AI request timeout to tolerate Workers AI latency spikes.
  - Verified the production `@cf/zai-org/glm-4.7-flash` flow with Traditional Chinese input and output.
- **Present Button Infinite Retry**
  - Removed the broken `bind()` retry loop that spammed console with "Present button not found" every 500ms in edit/write mode.
  - Present button now binds once at DOM ready — only exists when mode is `md` or in share view.
- **Share Button Click Handler**
  - Fixed share button not responding to clicks. JS was selecting `.opt-share > input` (checkbox) but HTML is a plain `<button>`.
  - Changed selector to `.opt-share` and updated handler to use `APP_STATE.isPublished` instead of `e.target.checked`.
- **Share Button Visibility on Mobile**
  - Share button label (`toolbar-button-label`) now always shows even on mobile (≤960px), overriding the global hide rule.
  - Added green dot indicator on share dropdown when note is published, so users can see shared status at a glance.
- **Mobile Edit Layout**
  - Changed editor+preview from side-by-side to vertical (top-bottom) stack on mobile (≤960px).
  - Each pane takes 50% height; divider line switches from vertical to horizontal.
- **Theme Completeness**
  - Added missing CSS selectors to ALL 20 themes for complete markdown rendering.
  - Added: `thead`, `tbody tr:hover`, `figure`, `figcaption`, `kbd`, `dt`, `dd`, `dl`, `li::marker`.
  - All themes now have balanced braces and complete selector coverage.

### Changed
- **Unified Mobile Footer & Collapse Toggle**
  - Redesigned the mobile footer to match the PC version's two-line layout: icon on top, label description below.
  - Hides the developer/info section (GitHub, Skill, API) on mobile entirely.
  - Displays only the first row (edit actions) by default, and reveals the second row (appearance, language switcher, theme settings) when clicking the `...` (More) button.
  - Leverages smooth CSS transitions to expand the footer and adjust body padding from 72px to 180px, avoiding viewport overlapping.
  - Resolves the missing language switcher bug on mobile share views by rendering the "More" button outside the edit conditional.
- **AI Formatting Model**
  - Switched the focused formatting action from GLM 4.7 Flash to `@cf/openai/gpt-oss-20b` for lower-latency formatting with behavior consistent with the GPT-OSS 120B editing assistant.
- **Theme Selector Enhancement**
  - Added visual indicators (☀️/🌙) and descriptive labels to theme selector for better UX.
  - Themes now show: `ayu ☀️ 極簡温暖`, `bauhaus ☀️ 幾何藝術`, `botanical ☀️ 植物圖鑑`, etc.
  - Dark themes marked with 🌙: `cp-macchiato 🌙 柔和暗色`, `kanagawa 🌙 日本墨水`, etc.
- **Default Theme Changed**
  - Switched the default preview theme from `catppuccin-macchiato` to `claude-canvas` (warm humanist editorial style).
- **Footer Tools - Direct Buttons**
  - Removed dropdown menu for Import/Export/PDF buttons.
  - All three buttons now appear directly in the footer: 匯入 (Import), 匯出 (Export), 列印 (Print).
  - Share mode shows Export and Print buttons directly (no Import since it's read-only).
- **Footer Controls - Two-Line Layout**
  - All footer controls now use consistent two-line layout (control on top, label below).
  - Font selector, Language toggle, Preview switcher, Width selector, Theme selector all show labels below controls.
  - Added text labels: "Font", "Lang", "Device", "Width", "Theme" below each control.
- **Footer Info Section - Two-Line Buttons**
  - Changed GitHub, Skill, and API Doc links to two-line style (icon on top, text on bottom).
  - Added text labels: "GitHub", "Skill", "API" below each icon.
- **Share Button Layout**
  - Changed share button to icon+text two-line layout (icon on top, text on bottom) for consistency with other footer buttons.
- **Wrangler Updated**
  - Updated wrangler from v3 to v4.86.0.
  - Updated compatibility_date to 2024-12-01.

## [2026-07-11 23:30 CST]
### Changed
- **Footer Four-Section Reorganization**
  - Reorganized the footer from three sections (`Actions` / `Appearance` / `Meta`) into four logically-grouped columns: **Edit** / **Publish** / **Appearance** / **Info**.
  - **Edit** section: Lock buttons, Preview switcher, File & Export dropdown, Version History dropdown.
  - **Publish** section: Share dropdown/toggle, Present button, Recent Shares dropdown.
  - **Appearance** section: Font selector, Language toggle, Preview device, Width, Theme.
  - **Info** section: GitHub, Skill docs, API docs, Saved time.
  - This separation ensures editing tools never mix with publishing controls, and version history (D1-based) is clearly distinct from share history (localStorage-based).
- **Mobile Bottom Sheet Card Layout**
  - The mobile Bottom Sheet now displays Publish, Appearance, and Info sections as individual cards with section titles, improving scannability.
  - Removed the legacy `⋯` more button; the footer itself now triggers the Bottom Sheet on mobile tap (outside the Edit section).

## [2026-07-11 22:30 CST]
### Changed
- **Claude Canvas Style Theme**: Added a new humanist editorial theme inspired by Anthropic's Claude website design, featuring a warm cream canvas background (`#faf9f5`), coral active highlightings (`#cc785c`), a humanist sans-serif body layout with serif headers, dark-surface code blocks, and custom styled alert blocks. Integrated it fully with the Vite/Wrangler theme bundling process and API lists.
- **Footer UI/UX Redesign & Optimization**
  - **SVG Icon Conversion**: Replaced all abstract Unicode symbols (`✎`, `◌`, `↗`, `▶`, `⧉`, `×`, `⤴`, `⤵`, `▣`, `◷`, `⋯`, `◇`, `◫`) with a unified, lightweight SVG icon system.
  - **Secondary Actions Dropdown Grouping**:
    - Grouped the cluttered 5 share-related actions into a clean "Share ▾" dropdown, moving `Unpublish` to the bottom as a styled warning item to prevent misclicks.
    - Moved Markdown Import, Export, and PDF generation into a unified "File & Export" dropdown.
    - Grouped Recent Shares and Version History into a unified "History" dropdown.
    - This reduces actions list buttons from 10+ down to 4-5 neat sections, reducing visual noise.
  - **Mobile Pill Bar & Bottom Sheet**:
    - Converted the mobile footer layout into a modern floating Pill bar (`48px` height).
    - Shuffled appearance/meta sections into a custom sliding **BottomSheet** drawer on mobile screen widths (under 960px).
    - Equipped the mobile drawer with a fuzzy glass backdrop, swipe-down to dismiss gesture support, and scroll-bubbling prevention.
  - **Directional Scroll Hiding**: Refined the share-view mobile auto-hide logic to hide on page scroll-down and show on scroll-up (directional sensing) with near-edge sticky logic, removing the abrupt 900ms timer showing.
  - **Select & Segmented Toggle Enhancements**:
    - Custom styled theme & width dropdowns by eliminating native `<select>` arrows and using CSS-driven SVG arrows.
    - Added CSS transitions for `segmented-toggle-btn` to make state switching smoother.
    - Improved the font switcher label to a clear `Font: JB Mono / Maple` instead of the cryptic J / M toggle.
  - **Mobile Keyboard Avoidance**: Automatically hid the mobile footer Pill bar when the virtual keyboard is active (via `visualViewport` height resize tracking).
  - **Toast Notifications**: Replaced intrusive browser alerts and raw button label mutations with clear, smooth, frosted-glass toast notifications for copy actions.
  - **Edge Cases & Stack Level Fixes**:
    - **Dynamic Dropdown Boundary Sensing**: Added viewport boundary detection on dropdown trigger clicks to automatically flip the dropdown downward (`top: 100%`) when it risks overflowing the top edge of the viewport.
    - **Z-Index Fine-tuning**: Increased `.dropdown-menu` z-index to `1060` to prevent conflicts with `.bottom-sheet` (z-index `1050`) and boosted toast notifications to `20000` to keep them visible over presentation mode's slides.

## [2026-07-11 16:20 CST]
### Changed
- **Footer File Tools**
  - Added compact footer icon tools for `Import Markdown`, `Export Markdown`, and `Print / Export PDF` without changing the existing preview/edit interaction model.
  - Added a direct footer `API` documentation link next to the built-in `Skill` link, both with explicit tooltip / aria labels.
  - Kept the controls text-light so the footer remains narrow on constrained widths.
- **Footer Share / Lock Cleanup**
  - Replaced the raw published share URL field with a compact `Share / 分享頁` button that opens the shared page in a new tab, while keeping dedicated copy buttons for share and presentation URLs.
  - Converted `Edit Lock / Read Lock` into icon controls with active visual state to reduce footer width.
  - Reduced saved-time chrome further from `Saved ◷` / `保存 ◷` to a single `◷` icon with the absolute timestamp kept in the tooltip.
- **Short Share Slug Compatibility**
  - New shared notes now prefer a short `shareSlug` while preserving the legacy `md5(path)` share key for backward compatibility.
  - Existing long share URLs remain valid because the Worker now accepts both short slugs and legacy MD5-based share ids.
- **Footer Icon Consistency**
  - Converted `Recent Shares / History / Skill / API` into icon-first footer controls with tooltip and aria-label coverage, keeping the footer visually tighter without dropping discoverability.
### Documentation
- Updated `README.md` to describe the new footer file tools and compact API / Skill doc entry points.

## [2026-07-11 15:55 CST]
### Changed
- **Footer Width Tuning**
  - Kept the stable footer interaction model intact, but reduced visual width usage by changing saved-time display to a compact `Saved ◷` label with the absolute timestamp in a tooltip.
  - Shortened theme selector labels such as `catppuccin-macchiato` to compact forms like `cp-macchiato` and reduced the selector width to better fit narrow footer layouts.
### Documentation
- Updated `README.md` to describe the compact saved-time display and shortened theme labels.

## [2026-07-08 12:40 CST]
### Fixed
- **Share Page Edit Link Regression**
  - Fixed shared-note footer `edit` behavior so unlocked share pages link directly back to the note path instead of incorrectly opening the password prompt flow.
  - Limited share-page `authPath` injection to actually locked notes only, preventing public shares from being treated like password-protected edit entries.

## [2026-07-08 10:50 CST]
### Changed
- **Agent Skill Single Source**
  - Made `skills/SKILL.md` the only human-edited source for the published agent skill document.
  - Added `scripts/generate-agent-skill.mjs` plus npm pre-hooks so test/dev/deploy regenerate the bundled Worker skill artifact before use.
  - Updated the built-in footer skill link to point at the site-local `/.well-known/agent-skills/david888-wiki-publisher/SKILL.md` endpoint instead of the GitHub blob URL.
- **LLM Docs Coverage**
  - Expanded `LLM_API_DOCS.md` to document markdown negotiation, `publicIndex`, lock semantics (`pw` vs `vpw`), persisted appearance values, slide authoring syntax, and the editor-session routes `/:path/setting` and `/:path/pw`.

### Fixed
- **Skill Drift Risk**
  - Added test coverage that fails when the generated Worker skill markdown diverges from `skills/SKILL.md`.

## [2026-07-07 13:30 CST]
### Fixed
- **Edit Lock vs Read Lock Semantics**
  - Corrected direct note route behavior so `編輯鎖 / Edit Lock` only blocks editing and no longer blocks normal reading.
  - Kept `閱讀鎖 / Read Lock` as the stronger mode that blocks both reading and editing until authentication succeeds.
- **Readonly-to-Edit Upgrade Flow**
  - Changed the readonly note footer `edit` control from a plain link into an auth-triggering action, so locked notes can prompt for the edit password and upgrade into the editor correctly.
- **Password Auth Reliability**
  - Moved secret/salt reads to runtime instead of module-load time, preventing worker failures such as `secret must be a string`.
  - Added compatibility for legacy password hashes created during the broken runtime-config window, so existing edit locks continue to work.
- **Password Entry UX**
  - Replaced plaintext browser `prompt()` password entry with a masked in-page password modal for both unlock and password-setting flows.
- **Client Error Handling**
  - Hardened frontend JSON API parsing so non-JSON Worker error pages surface as readable errors instead of crashing with `Unexpected token 'W'`.
- **New Note Creation Flow**
  - Restored the root-to-random-slug workflow so `https://wiki.david888.com/` redirects to a fresh slug that opens the editor directly instead of falling into a 404-like blocked state.

## [2026-07-07 00:00 CST]
### Added
- **Well-Known API Discovery**
  - Added `/.well-known/api-catalog` and return an RFC 9727-compatible Linkset document as `application/linkset+json`.
  - Added `/docs/api`, `/openapi.json`, and `/api/health` so the API catalog can point to real machine-readable and human-readable API resources.
- **Agent Skills Discovery Index**
  - Added `/.well-known/agent-skills/index.json` using the Agent Skills Discovery v0.2.0 schema.
  - Added a published skill artifact at `/.well-known/agent-skills/david888-wiki-publisher/SKILL.md`.
- **Agent-Oriented Markdown Discovery**
  - Added `/auth.md` as a markdown agent-auth guidance document.
  - Added markdown content negotiation for note/share pages that already have raw markdown sources, returning `text/markdown` when `Accept: text/markdown` is sent.
  - Added guarded browser-side WebMCP tool registration for reading the current markdown, copying share links, and opening presentation mode.
  - Added a note-level `publicIndex` metadata flag for future sitemap inclusion decisions.

### Changed
- **Homepage Discovery Headers**
  - Added `Link` response headers on `/` advertising `api-catalog`, `service-doc`, and `service-desc` resources for automated agent discovery.
- **Share Publishing UI**
  - Removed the redundant `Published:` prefix from the published share URL area.
  - Reused the published-toolbar space for a sitemap opt-in control that toggles whether a shared note should join the future public index.
  - Added a post-publish prompt asking whether the new share link should be added to the public index, with a default private state and an explicit approval action.

### Fixed
- **robots.txt Coverage**
  - Added a plain-text `/robots.txt` route served by the Worker.
  - Published explicit `User-agent` rules for `GPTBot`, `OAI-SearchBot`, `Claude-Web`, and `Google-Extended`, alongside default crawler rules for key public and private paths.
  - Added `Content-Signal: ai-train=no, search=yes, ai-input=no` directives to declare AI content preferences.

## [2026-07-02 00:00 CST]
### Fixed
- **Share Appearance Settings Now Persist Per Note**
  - Persisted `Width`, `J / M` share font, and editor `Desktop / Mobile` preview device into note metadata instead of leaving them only in browser localStorage.
  - Shared notes now initialize width and font from the note's saved metadata, so other viewers see the same appearance choices.
  - Added metadata-aware fallback logic so older notes can still fall back to existing browser localStorage values until they are re-saved.

### Changed
- **Appearance Controls Save Through Canonical Note Settings**
  - Share/footer appearance controls now save through the note's canonical `/:path/setting` route when a backing note path is available.
  - Exposed the `J / M` share-font selector in the editor footer as well, so editors can set the shared reader font before distributing the share URL.

## [2026-06-26 00:00 CST]
### Added
- **Independent Note History UI**
  - Added a separate editor footer "版本 / History" entry when D1 note history is enabled.
  - Added a dedicated history modal for listing saved versions, viewing preview/raw content, copying an old version, and restoring it into the current editor.
  - Kept the existing "最近分享 / Recent shares" modal independent so share-link history remains unchanged.

### Changed
- **Footer Toolbar Refresh**
  - Reworked footer controls into a flatter, more consistent toolbar style with unified button height, radius, border, hover, and focus states.
  - Removed legacy inline footer styles from publish, copy, presentation, edit-back, and skill controls.
  - Normalized icon-like actions with stable Unicode glyphs so toolbar controls no longer vary heavily by emoji sizing.

## [2026-06-25 12:30 CST]
### Added
- **Optional D1 Note History**
  - Added an opt-in D1-backed note history system controlled by `SCN_ENABLE_NOTE_HISTORY` and `NOTE_HISTORY_DB`.
  - Added history API endpoints: `GET /api/:path/history`, `GET /api/:path/history/:versionId`, and `POST /api/:path/history/:versionId/restore`.
  - Added `schema/note_history.sql` for initializing the D1 history table.

### Changed
- **History Retention Defaults**
  - History retention now defaults to `10` versions per note via `SCN_NOTE_HISTORY_LIMIT`.
  - Added `SCN_NOTE_HISTORY_MIN_INTERVAL_SECONDS` with a default of `300` seconds so editor autosave does not create a history row on every keystroke.
- **Note Deletion Cleanup**
  - Admin deletes and empty-note cleanup now remove matching history rows from D1 when note history is enabled.

### Fixed
- **Emergency Rollback for Editor UI Regression**
  - Rolled back the new history-tab editor UI after it caused a client-side regression in the shared editor flow.
  - Restored the previous `Recent shares` modal while keeping the D1 history backend and APIs in place.
  - Fixed `checkAuth()` caller regressions where some routes still treated the returned object as a boolean.

## [2026-06-18 11:30 CST]
### Added
- **Raw Markdown API Uploads**
  - Added `POST /api/:path` support for `Content-Type: text/markdown` and `text/plain`.
  - Agents and shell scripts can now upload a local `.md` file with `--data-binary @file.md` instead of JSON-escaping the entire document.
- **Multipart Markdown API Uploads**
  - Added `POST /api/:path` support for `multipart/form-data` markdown uploads.
  - Accepts form fields such as `file`, `markdown`, or `text`, plus `append`, `public`, `share`, `theme`, `pw`, and `vpw`.

### Changed
- **LLM / curl API Guidance**
  - Updated `README.md`, `LLM_API_DOCS.md`, and `skills/SKILL.md` to recommend direct markdown/file upload for long documents.
  - Kept the existing guidance to prefer a concise summary plus source path/URL for very large reference files that do not need full mirroring.

## [2026-06-17 15:10 CST]
### Added
- **Browser-Local Share History**
  - Added a footer "Recent shares" entry that stores share links in browser localStorage.
  - Tracks "Created" share URLs when a note is published or an already-published editor page is opened.
  - Tracks "Viewed" share URLs when a browser opens a shared note, keeping the feature client-side without adding KV writes.
  - Moved the "Recent shares" entry into the footer `Actions` group because it behaves like a navigation/action utility.
- **Share Page Back-to-Top Control**
  - Added a compact `＾` button on shared-note pages for long articles.
  - Shows only after the reader scrolls down, then smoothly returns the article container to the top.

### Fixed
- **Share Page Anchor Links**
  - Added stable heading IDs after client-side Markdown rendering so shared-note hash links can jump to headings.
  - Re-runs hash scrolling after Markdown hydration and on `hashchange`, fixing links that previously failed because the browser handled the hash before the rendered heading existed.
  - Uses a GitHub-style slug compatible with Chinese/English mixed headings, including links like `#主題二輸入bd-轉接之甲方需求與變更申請自動化-client-demand-to-backlog-engine`.
  - Added compact heading aliases for existing TOC links that omit punctuation between Chinese labels and English terms.

### Changed
- **Mobile Share Footer**
  - Mobile share pages now keep the footer compact by showing only `Actions` by default.
  - Added a `...` control to expand appearance/meta tools only when needed.

## [2026-06-16 00:00 CST]
### Fixed
- **Share Metadata Title Extraction**
  - Updated shared-note title extraction to ignore weak short slug-like metadata titles such as `gkfp` when the note body contains a stronger human-readable title.
  - Keeps explicit descriptive metadata titles as the first choice, while falling back to the first meaningful content title for Open Graph, Twitter, and browser titles.
  - Deployed the fix with Wrangler and verified the live share page now emits the full `og:title`.
- **Share Card Branding Weight**
  - Stopped emitting `og:site_name` on shared-note pages so IM/social previews emphasize the note title instead of the `david888 wiki` app name.

## [2026-06-15 15:20 CST]
### Fixed
- **Mermaid CJK Text Clipping**
  - Updated Mermaid initialization to wait for browser font readiness before rendering diagrams, reducing incorrect text measurements during first paint.
  - Switched Mermaid flowcharts to SVG text labels instead of HTML labels, avoiding truncated mixed Chinese/English node text in shared diagrams.
  - Added Mermaid-specific SVG overflow and font-family guards so long node titles and top-aligned labels are less likely to be clipped.

## [2026-06-13 18:30 CST]
### Fixed
- **Print & PDF Layout Stylesheet**
  - Added dedicated `@media print` layout styles in `base.css.js` to ensure the document paginates correctly when printed or exported using the browser's "Save as PDF" feature.
  - Hid non-printable UI elements such as footers, split dividers, edit panels, modals, and loading icons.
  - Removed view-port constraints (`height: 100vh`, `overflow: hidden`) on all layout levels (`html`, `body`, `.note-container`, `.stack`, `.layer_3`, and `.preview-pane`) to allow full multi-page flow.
  - Configured `-webkit-print-color-adjust: exact` to retain themes' premium visual features like table borders, blockquote decorations, and alert block background tints.
  - Prevented orphan headers and mid-element page-splits on code pre blocks, quotes, tables, and images.

## [2026-06-10 10:40 CST]
### Fixed
- **Share Font Assets on Cloudflare**
  - Configured Wrangler static asset serving for the `static/` directory so bundled share-page fonts are delivered correctly in browsers, including Android.
  - Switched the bundled font URLs from `/static/fonts/...` to `/fonts/...` and verified both `JetBrainsMono-Medium.woff2` and `MapleMonoNormal-Medium.woff2` return `font/woff2`.

### Changed
- **Share Footer Font Switcher**
  - Replaced the old share-page `Maple Mono` on/off toggle with compact `J / M` buttons for `JetBrains Mono` and `Maple Mono`.
  - Set `JetBrains Mono` as the default share-page reader font, while keeping `Maple Mono` as the alternate option saved in localStorage.
  - Added native hover tooltips to the `J`, `M`, and edit buttons so the compact footer controls remain self-explanatory.
- **Footer Information Architecture**
  - Reorganized the editor and share footers into grouped `Actions`, `Appearance`, and `Meta` sections.
  - Moved appearance-related controls such as `J / M`, `Zh / En`, width, theme, and preview device into the same visual group for faster scanning.

## [2026-06-09 15:00 CST]
### Added
- **Share-Page Google Analytics Config**
  - Added `SCN_GA_MEASUREMENT_ID` support for loading Google Analytics on shared-note and shared-presentation pages.
  - Documented the Cloudflare / Wrangler setup in `README.md` and `wrangler.toml.example`.

### Changed
- **Site-Wide Google Analytics Loading**
  - Expanded `SCN_GA_MEASUREMENT_ID` loading from share pages to editor pages as well, so `wiki.david888.com` traffic is tracked without extra footer code.
- **Built-In Icon Routes**
  - Replaced the old external icon URL with Worker-served `/icon.svg`, `/icon.png`, and `/favicon.ico`.
  - Updated OG / Twitter preview images to use the built-in icon asset.
- **Social Card Branding**
  - Updated the social card title to `Notepad 888` and subtitle to `Markdown wiki for You`.
  - Switched `/og-image.png` to a dedicated 1200x630 social card instead of the plain icon image.

## [2026-06-09 14:47 CST]
### Changed
- **Share View Tracking Disabled**
  - Removed footer view-count display from the editor/share UI.
  - Stopped writing per-visitor share view counters into Cloudflare KV to avoid ongoing free-plan write usage.

## [2026-06-09 14:36 CST]
### Fixed
- **Centered Editor Split**
  - Resets the editor and preview panes to an exact 50/50 split when switching between desktop and mobile preview modes.
  - Added double-click reset behavior to the draggable divider.

## [2026-06-09 14:31 CST]
### Fixed
- **Responsive Mobile Tables**
  - Added fixed-layout table fitting for the editor mobile simulator and real mobile share pages.
  - Allows long cell text, inline code, parameters, and URLs to wrap instead of overflowing the mobile viewport.

## [2026-06-09 14:25 CST]
### Fixed
- **Presentation Bottom Safe Area**
  - Reserved a 56px bottom safe area above Reveal.js progress, slide number, and navigation controls.
  - Updated slide fitting to account for the smaller usable height so long slides do not stick to the bottom edge.

## [2026-06-09 14:22 CST]
### Fixed
- **Presentation Quote and Slide Fit**
  - Reduced presentation body and blockquote typography so quoted metadata remains compact.
  - Added per-slide font fitting when content exceeds the presentation viewport, followed by a second table-fit pass.

## [2026-06-09 14:18 CST]
### Fixed
- **Presentation Heading Scale**
  - Reduced presentation-mode `h1`, `h2`, and `h3` sizes and spacing so long Chinese headings no longer dominate the slide.

## [2026-06-09 14:13 CST]
### Fixed
- **Editor Footer and Mobile Preview Layout**
  - Prevented the editor footer controls from wrapping into a second row.
  - Kept the editor/preview divider near its existing split position when mobile simulation is enabled by placing the phone frame inside a full-width preview pane.

### Changed
- **Preview Toggle Label**
  - Renamed the `Markdown` switch to `預覽` / `Preview`.
  - Preview-only controls are hidden when preview mode is disabled.

## [2026-06-09 14:00 CST]
### Added
- **Desktop / Mobile Preview Toggle**
  - Added an editor footer segmented toggle for switching the right-side Markdown preview between desktop and mobile simulation modes.
  - Saves the selected preview device mode in localStorage.

### Changed
- **Compact Footer Lock Labels**
  - Shortened password control labels to `編輯鎖` / `閱讀鎖` and `Edit Lock` / `Read Lock`.

## [2026-06-09 13:45 CST]
### Changed
- **Footer Compact Controls**
  - Shortened the last-saved footer text to compact relative time, such as `保存 5h前` and `Saved 5h ago`.
  - Replaced the language dropdown with a front-positioned `Zh / En` segmented toggle.

## [2026-06-09 13:42 CST]
### Fixed
- **Presentation Table Fit**
  - Added presentation-mode table auto-fitting so wide or tall Markdown tables are scaled to remain on the same slide.
  - Re-runs table fitting after Reveal.js initialization, slide changes, and viewport resize events.

## [2026-06-09 13:38 CST]
### Added
- **Publish Nudge + Language / Share Footer UX**
  - Added an editor-side publish nudge that appears after the user stays focused in the input area for 3 minutes with non-empty unpublished content.
  - Consolidated UI localization to maintained `en-US` and `zh-TW` strings, with Chinese browser languages mapped to `zh-TW` and all other browser languages mapped to `en-US`.
  - Added an `En / Zh` footer selector backed by a `lang` cookie so users can override automatic language detection.
  - Added mobile share-page footer auto-hide behavior while scrolling, with the footer reappearing when scrolling up or after scrolling pauses.
  - Added a `#share-analytics-hook` placeholder in the share footer for future GA / analytics injection without adding KV-backed share view writes.

### Changed
- **Wrangler Script Cleanup**
  - Updated npm scripts to use `wrangler deploy` instead of the deprecated `wrangler publish` command.

## [2026-05 之前]
### Added
- **Default Theme Refresh + Documentation Cleanup**
  - Switched the default preview theme fallback from `tokyo-night` to `catppuccin-macchiato` for newly created or unthemed notes.
  - Added `catppuccin-macchiato` and `catppuccin-latte` to the TypeScript theme registry so the theme selector and bundled preview metadata stay aligned.
  - Moved the legacy `20251229 開發日誌` section out of `README.md` into this changelog and left a direct changelog link in the README.

- **Share Metadata + Site Icon Polish**
  - Added server-rendered Open Graph and Twitter card metadata for shared notes so Slack and other unfurlers can read stable titles and descriptions without relying on client-side rendering.
  - Switched page head metadata to use the repo-provided notepad icon as the favicon and social preview image for shared notes.
  - Added note-title and note-description extraction helpers so shared-note metadata is generated consistently from note content on the server side.

- **Share Theme Consistency + Font Toggle**
  - Added a share-page `Maple Mono` on/off toggle next to the `返回編輯` button, backed by localStorage so each browser can keep its own preference.
  - Reused the bundled `static/fonts/MapleMonoNormal-Medium.woff2` asset as the optional share font instead of duplicating another copy.
  - Standardized share-page body typography to the `tokyo-night` baseline (`16px` body size, `1.8` line-height) so theme switches no longer visibly shrink or enlarge paragraph text.
  - Standardized share-page heading and inline-code sizing to the `tokyo-night` scale so themes like `newsprint` no longer render noticeably smaller than dark themes.

- **Theme Table Color Fixes**
  - Fixed dark-theme table body colors in `tokyo-night` so rows no longer fall back to white backgrounds.
  - Fixed dark-theme table body colors in `kanagawa` so rows no longer fall back to white backgrounds.
  - Fixed `terminal` table body rows and cells so the terminal theme keeps a dark background instead of leaking the base markdown table white fill.
  - Fixed table header backgrounds for `playful-geometric`, `organic`, `retro`, `botanical`, `bauhaus`, `maximalism`, and `terminal`/other affected themes by explicitly styling `thead th`.

- **Theme Table Header Contrast Refresh**
  - Strengthened table header contrast for the `tokyo-night` and `kanagawa` preview themes with clearer header backgrounds, brighter label color, and stronger separation from table rows.
  - Added a small shared table-header emphasis layer in the base template so low-contrast headers remain more legible across themes.

- **Editor Font + Dark Preview Themes**
  - Added bundled `Maple Mono` as the default font for both the editor pane and preview pane.
  - Added two new preview themes inspired by popular Neovim colorschemes: `tokyo-night` and `kanagawa`.
  - Switched the default preview theme fallback from `github-light` to `tokyo-night` for newly created or unthemed notes.
  - Removed fixed preview content widths from bundled themes so split-view previews can fully use available space.
  - Added a footer `Width` selector with persistent browser-side preference (`Full`, `960`, `1200`, `1440`) for quick preview width control.

- **Dedicated Presentation Share Entry**
  - Added a dedicated presentation route at `/share/:md5/present` so shared notes can open directly in slideshow mode.
  - Presentation links now preserve Reveal slide hash deep-links, allowing links such as `/share/<id>/present#/24` to open a targeted slide.
  - Password-protected shared notes preserve the requested presentation destination and return to the same slide after successful authentication.
  - Added a presentation-link copy action alongside the existing shared-link copy action in the editor footer.
  - Updated Skill and MCP guidance so AI clients can surface presentation links derived from `shareUrl`.

- **LLM/Crawler Support (Share URL Optimization)**
  - Intercepts `HEAD` HTTP requests globally to safely return HTTP 200 (with an empty body), preventing Cloudflare Workers from throwing `500 Internal Server Errors` when bots probe the site.
  - Injects a visually hidden, SEO-friendly `<article>` element containing raw markdown content into the base template. This resolves the issue where Client-Side Rendered (CSR) markdown inside `<textarea>` is completely ignored by bots (like ChatGPT-User, ClaudeBot, and generic URL unfurlers) that do not execute JavaScript.

- **Slidev-style Presentation Mode (Reveal.js Integration)** 📽️
  - Added a "Present" button to enter a fullscreen, interactive slideshow mode.
  - Supports Markdown slide splitting using the standard `---` separator (Slidev/Marp style).
  - Powered by Reveal.js with smart lazy loading (loads assets only on demand).
  - Seamlessly works in both Edit mode and Share mode.

- **Slidev-Lite Enhancement (Version 2.0)** 🚀
  - **Layouts**: Added support for `::left::` and `::right::` split-screen layouts.
  - **Click Animations**: Support for `{v-click}` syntax for interactive slide elements.
  - **Premium Aesthetics**: Integrated Inter font, dark theme optimization, and enhanced code block styling.
  - **UX Polish**: Switched to fade transitions and top-left alignment for a more professional feel.

## [2025-12-29]
### Changed
- **核心穩定性修復 (v2.0)**
  - 環境變數在模組載入時無法訪問，改用 getter 函數在運行時讀取。
  - `enableR2` 資料結構不匹配，已合併回 `ext` 物件以統一頁面渲染上下文。
  - 修復資料覆寫風險：將瀏覽計數自筆記正文讀寫流程中拆離，改存於 `SHARE` KV 的 `views::{path}` 鍵，避免 GET 與 POST 並發時舊內容覆蓋新內容。
  - 修復權限判斷：編輯頁面只接受編輯密碼，分享頁則接受查看密碼或編輯密碼，區分 `edit` / `view` 權限。
  - 修復分享頁渲染：確保 Share 模式下正確載入 `marked.js` 與 `DOMPurify`，避免頁面空白。
  - 導入 `visitor_id` Cookie 做獨立訪客計數，避免重複刷新灌水。

### Added
- **高級圖表支援 (Advanced Diagrams)**
  - 新增 Mermaid (` ```mermaid `)、Flowchart.js (` ```flow `)、JS Sequence Diagrams (` ```sequence `)、Graphviz / Viz.js (` ```graphviz `) 與 ABC.js (` ```abc `) 支援。
  - 圖表引擎採用智慧懶加載，只在頁面偵測到對應程式碼區塊時才載入外部函式庫。

- **其他增強**
  - 新增可拖曳的編輯器 / 預覽分隔欄，支援調整左右面板寬度。

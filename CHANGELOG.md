# Changelog

## [2026-07-07 00:00 CST]
### Added
- **Well-Known API Discovery**
  - Added `/.well-known/api-catalog` and return an RFC 9727-compatible Linkset document as `application/linkset+json`.
  - Added `/docs/api`, `/openapi.json`, and `/api/health` so the API catalog can point to real machine-readable and human-readable API resources.
- **Agent Skills Discovery Index**
  - Added `/.well-known/agent-skills/index.json` using the Agent Skills Discovery v0.2.0 schema.
  - Added a published skill artifact at `/.well-known/agent-skills/david888-wiki-publisher/SKILL.md`.

### Changed
- **Homepage Discovery Headers**
  - Added `Link` response headers on `/` advertising `api-catalog`, `service-doc`, and `service-desc` resources for automated agent discovery.

### Fixed
- **robots.txt Coverage**
  - Added a plain-text `/robots.txt` route served by the Worker.
  - Published explicit `User-agent` rules for `GPTBot`, `OAI-SearchBot`, `Claude-Web`, and `Google-Extended`, alongside default crawler rules for key public and private paths.

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

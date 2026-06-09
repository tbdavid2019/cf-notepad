# Changelog

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

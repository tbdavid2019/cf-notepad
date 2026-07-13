# Changelog

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

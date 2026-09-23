# 888wiki Feature Guide

Back to the [project homepage](../README.md) · [Usage guide](USAGE.md) · [Installation](INSTALLATION.md) · [Changelog](../CHANGELOG.md)

## Editor screenshots

![Markdown editor and live preview](../orca-paste-1787127718063-d5855e68-4e94-4779-a053-a962fb11cbd0.png)

![Editor workspace](../orca-paste-1787127786636-d3cf3fb4-c057-41ef-8c77-9fa2db22a43e.png)

## ⚡ Feature Highlights

### 🤖 1. AI Writing Assistant &amp; Agent Ecosystem

- **🎙️ Audio Transcription with Native Timestamps &amp; Smart Formatting (`[mm:ss]`)**: Upload audio files (`.mp3`, `.m4a`, `.wav`, `.aac`, `.ogg`, `.webm`, `.flac`, `.opus`, `.mp4`) via the `+ New` menu or Footer Import button.
  - **Multi-tier STT Engine**: Primary Groq `whisper-large-v3` (`verbose_json`), Fallback 1 Groq `whisper-large-v3-turbo`, Fallback 2 Cloudflare Workers AI `@cf/openai/whisper-large-v3-turbo` (WebVTT parsing), and Fallback 3 `@cf/openai/whisper`.
  - **Timestamped Paragraph Segmentation**: Eliminates single-block text walls by automatically grouping spoken cues into structured paragraphs prefixed with `**[mm:ss]**` timestamps.
  - **Dual Modes**: **Transcript Only** (100% faithful verbatim transcription with timestamps) or **Smart Layout** (LLM clarifies wording, organizes headings, and structures Markdown).
- **AI Formatting (AI Format)**: Workers AI / Groq resilient dual-engine (`gpt-oss-20b`) restructures Markdown headings, lists, and whitespace while preserving original language and text. Supports selection-only formatting.
- **AI Editing &amp; Drafting (AI Edit)**: `gpt-oss-120b` model (with automatic Workers AI and Groq fallback) provides instruction-based section rewrites, table formatting, content expansion, or full article generation.
- **AI Translation &amp; Bilingual Output**: Translate content to target languages or generate side-by-side bilingual documents.
- **Floating Selection AI Menu**: Selecting text in the editor automatically triggers floating AI Format, AI Edit, and Translate shortcuts.
- **Agent Ecosystem (MCP, WebMCP &amp; Skills)**: Serves a native HTTP JSON-RPC 2.0 MCP endpoint (`/mcp`, fully compatible with Cloudflare WebMCP 1-Click toggle and Chrome 146+ `document.modelContext`), a remote Python FastMCP server (`uv run server.py`), and standard Agent Skill at `/.well-known/agent-skills/david888-wiki-publisher/SKILL.md`.

```text
👉 One-Click Prompt for ChatGPT / Claude Web:
This is a deployed Wiki platform functioning as a Headless CMS publishing API: `https://wiki.david888.com/api`.
Please act as my writing assistant to draft and publish articles based on my requests.
For operational guidelines, please read the following document (use your web-browsing/execution tools to fetch it):
👉 https://wiki.david888.com/.well-known/agent-skills/david888-wiki-publisher/SKILL.md
Use the cURL/HTTP request tools detailed in that document to save the content once you finish writing, and give me the URL of the published article.
```

---

### 🎨 2. Rich Editing, Media &amp; Layout

- **Direct Clipboard Paste, R2 Uploads, Image OCR &amp; Local-First Table Reconstruction**: Pasting or dropping an image opens Upload image, Run local OCR, Recognize table, and Cancel choices. Local PP-OCRv6 runs in the browser with WebGPU first and WASM fallback; the image stays local during OCR. Table recognition prioritizes **pure client-side 2D geometric table reconstruction** (`reconstructTableFromOcrBoxes`) using detected bounding boxes to instantly restore rows/columns and output standard GFM Markdown tables; for mobile browsers, memory-constrained devices, or model load failures, it gracefully falls back to the three-tier remote server table OCR endpoints. The first local OCR run shows model/runtime download status, with actionable guidance for Worker, WebGPU, model, or table-service failures.
- **888box Multimedia Attachments**: Upload videos, audio, documents, and archives directly to `box.david888.com` (with fallback nodes), inserting `<video>`, `<audio>`, or download links.
- **📊 Mermaid &amp; Diagram Floating Toolbar (Copy PNG / Code / SVG / Download)**: All rendered Mermaid flowcharts, sequence diagrams, architecture graphs, and Flowchart/Sequence/Graphviz/ABC/ECharts charts automatically mount a glassmorphic floating action toolbar in the top-right corner, offering one-click "🖼️ Copy PNG" (2x high-resolution transparent image for Slack, Notion, PPT, Word), "📋 Copy Code", "📐 Copy SVG", and "💾 Download PNG" with animated feedback and bilingual toast notifications.
- **ECharts Interactive Charts**: Render interactive ECharts graphs directly from `echarts { JSON }`  code blocks in Markdown.
- **Automatic `[TOC]` Table of Contents**: Insert `[TOC]` to scan document heading hierarchy and render smooth-scrolling TOC jump links.
- **Two/Three-Column Layouts**: Wrap selected text in `<div class="two-column-layout">` or `three-column-layout` for multi-column presentation (stacks on mobile).
- **Auto Media Previews**: Automatically converts YouTube URLs to privacy-enhanced players, PDFs to embedded viewers, and MP4/MP3 links to native players.
- **Four Fixed Note Formats &amp; Creation Menu (Markdown / Block / Canvas / Whiteboard)**: The leftmost Footer `+ New` menu creates a [Markdown note](https://wiki.david888.com/new/markdown), a [Block note](https://wiki.david888.com/new/block), a [Canvas](https://wiki.david888.com/new/canvas), or an [Excalidraw Whiteboard](https://wiki.david888.com/new/whiteboard). The format is fixed after creation: Markdown retains its linear workflow, Block uses a Notion-like WYSIWYG editor, Canvas provides 2D cards and relationship lines, and Whiteboard offers freeform sketch drawing, doodles, and sticky notes.
- **🎨 Canvas v2 Architecture (Canvas v2 with Ameliorate Architecture &amp; JSON Canvas)**: A third native format (`editorFormat: 'canvas'`) for visual thinking, mind-mapping, and Zettelkasten card linking. Fully upgraded to Canvas v2 with deep parity to the open-source **Ameliorate** project (`0cacee5577438979b651dd808793c4cbd13864ee`, MIT License, credited in `THIRD_PARTY_NOTICES.md`):
  - **Ameliorate Thought Nodes & Low-Chroma Design System**: Cards feature Ameliorate's signature corner badge with refined, low-chroma type tags (`Problem`, `Benefit`, `Solution`, `Cause`, `Criterion`, `Detriment`, `Question`, `Note`), meeting strict WCAG AA/AAA contrast guidelines (≥ 5.5:1–8:1). Built with clean white card surfaces and subtle 1px borders (`#e2e8f0`) to avoid oversaturated neon colors.
  - **Full Lucide SVG Vector Icon Suite**: Integrated `lucide-react` across corner badges, quick node action buttons (copy, delete, palette), the bottom MainToolbar (add, undo, redo, fit, file), top-right floating pill (language, text-to-speech, book mode), and edge toolbar, replacing inconsistent platform emojis with crisp, elegant vector icons.
  - **High-Contrast Edges, Dynamic Arrowheads & Dual Handles (`CanvasEdge` &amp; `EdgeToolbar`)**: Four-sided handles (top, right, bottom, left) provide dual source and target connection support, ensuring React Flow reliably calculates and renders smooth Bézier curve paths (`getBezierPath`) with high-contrast Dark Slate strokes (`#475569`, 2px width, highlighted to 2.5px `#2563eb` on select) and dynamic `markerEnd` arrowheads; default edge labels remain clean and blank until selected or edited; selected edges reveal React Flow's native `EdgeToolbar` portal for arrow directions, line styles, weights, and color adjustments with automatic viewport collision avoidance.
  - **Top-Right Floating Action Pill (`TopFloatingBar`)**: A glassmorphic quick-action pill in the top-right corner provides bilingual language switching, Web Speech API card text-to-speech, and full Book / Reader mode.
  - **Local Draft Recovery, Clean Blank Slate & Public Share Auto-Detection**: Canvas loads the server-side `#contents` first, then safely restores a newer IndexedDB `draft` or `pending` Canvas document after refresh, refits the viewport, and shows a localized recovery notice. Mobile fit view keeps an initial minimum zoom of `0.85x` so card labels remain readable while the canvas remains pannable. The edge SVG layer is explicitly sized to the flow viewport so stored relationship paths render visibly. Unpublished-note drafts remain local to IndexedDB; publishing or autosave on a published note is the cloud-sync boundary. Blank canvases initialize completely clean (`{ nodes: [], edges: [] }`) without intrusive template cards. Public Share (`/share/:shareId`) automatically detects canvas JSON content even when legacy metadata is missing, mounting the read-only canvas with version-busted assets (`?v=3.9`). Strictly compatible with JSON Canvas 1.0 specifications (`text`, `file`, `link`, `group` nodes and `edges`) via `model/jsonCanvasAdapter.mjs`, preserving unhandled root metadata, custom node/edge properties, and `david888` extensions without data loss.
  - **Instant Persistence & Safe Flushes**: State mutations sync synchronously to underlying `#contents.value`, eliminating race conditions between 300ms debounce saves, navigation/unload events (`pagehide`, `beforeunload`, `visibilitychange`), and publishing; exposes `window.canvasBridge.flush()` globally.
  - **Reliable Card Dragging, Multidirectional Resizing & Double-Click Inline Editing**: Single-clicking any card selects it and allows dragging smoothly across the 2D canvas; clicking activates 8-direction resize handles that update dimensions in real-time and join Zustand's transactional history for seamless Cmd+Z / Cmd+Shift+Z Undo and Redo. Double-clicking enters monospace inline editing with Esc or Cmd+Enter to commit.
  - **Navigation Controls, Viewport-Center Card Creation & File Actions**: Includes React Flow `Controls` (zoom, fit-view, lock) and a bottom-right `MiniMap`; bottom `MainToolbar` Add menu provides 8 Ameliorate thought node categories created centered in the viewport with anti-overlap offsets; File menu supports `.canvas` import, export, and fully undoable Clear Canvas (`clearDocument`).
  - **Image & Multimedia Asset Nodes (`AssetNode`)**: Introduces dedicated asset resource nodes with canvas-level drag-and-drop file upload. Images automatically upload to R2, while audio, video, and documents route through the resilient multi-tier 888box API. Strictly adheres to the JSON Canvas 1.0 standard with `type: 'file'` and `david888.asset` metadata; cards adaptively render image previews, native audio/video players, or document cards with one-click download, full four-sided connection handles, and resize controls.
  - **LLM Agent Canvas Tools & Book Mode Compatibility**: Native WebMCP exposes `validate_canvas`, `write_canvas`, and `read_canvas`; the REST API accepts complete JSON Canvas documents with `editorFormat: 'canvas'` and returns `shareUrl` for human review. Agents can choose Canvas for relationship maps, architecture diagrams, concept graphs, or connected card plans when visual structure improves clarity. Markdown Book chapter lists can include a Canvas path or share URL, and `/book` loads it as a read-only interactive Canvas. Skill, OpenAPI, `llms.txt`, and `llms-full.txt` publish the same contract.
  - **Zero-Legacy Clean Slate & Isolated Stylesheet**: Completely eliminated legacy canvas fallback code and runtime flags, clearing any stale client-side localStorage overrides to run purely on Canvas v2. Styles are completely isolated in `static/js/canvas-v2/canvas-v2.css` and `tokens.css`, ensuring zero style bleed, dark/light theme support, and read-only gesture locking in share views.
  - **P1/P2 Interaction Capabilities**: Supports box selection, multi-card dragging, bulk recoloring/deletion, Cmd/Ctrl+F search, SVG/PNG export, WikiLink-to-Canvas graph generation, and a top-right Camera Tour.
  - **Editable Canvas Title**: The top-left Canvas title editor updates the browser tab, note metadata, and public share title together.
  - **Add Menu Alignment**: Thought Nodes and all six Extensions share a fixed icon column and one left-aligned text baseline, with bilingual labels and narrow-viewport scrolling.
- **🎨 Excalidraw Freeform Whiteboard (`editorFormat: 'whiteboard'`)**:
  - **Dual-Canvas Specialization (/new/whiteboard)**: Integrates the official `@excalidraw/excalidraw@0.18.1` React component as the fourth native note format. Canvas focuses on structured logic graphs and architecture maps, while Whiteboard specializes in hand-drawn sketches, wireframes, doodles, and sticky notes.
  - **100% Official Standard Component**: Zero reinvented canvas controls. Bundled with esbuild into `static/js/whiteboard-editor.bundle.mjs` and `bundle.css`, with on-demand runtime fonts loaded via unpkg CDN.
  - **Seamless Persistence &amp; Read-Only Sharing**: Synchronizes Excalidraw JSON (`elements` and `appState`) through `#contents.value` into existing D1/KV storage without schema alterations. Public shares (`/share/:id`) render in read-only mode (`viewModeEnabled: true`), dynamically matching dark/light themes and supporting PNG/SVG export.
  - **LLM Agent WebMCP &amp; REST API**: Native WebMCP exposes `validate_whiteboard`, `write_whiteboard`, and `read_whiteboard`; REST API accepts complete Excalidraw JSON via `editorFormat: 'whiteboard'` and projects clean text for search indexing and LLMs.
- **Notion-like Block Editing & Live Voice Recording**: Block notes use BlockNote's ready-made Notion-style canvas, including the cursor-side `+`, drag handle, slash menu, floating formatting toolbar, and mobile UI. Supports `/record` or `/錄音` slash commands and '+ New' footer menu to trigger live microphone voice recording with the Dynamic Island HUD and automated Whisper AI transcription into block notes. It supports images, links, YouTube, PDFs, audio, files, Mermaid, ECharts, and raw HTML. Existing notes continue to serialize to the compatible Tiptap JSON format, so Share pages and APIs remain unchanged. Block edit pages support PNG, standalone HTML, PDF, and print export; Markdown export remains available in Markdown edit pages.
- **Split Welcome View & Parallel Typewriter Effect**: A fresh Markdown note presents Stray Birds poetry on the left editor pane and randomly selected writing tips on the right preview pane (`#preview-welcome`) with synchronized, parallel typewriter animations, disappearing seamlessly as soon as the author begins typing.
- **Accessible Dialogs**: Editor dialogs use proper dialog semantics, trap Tab focus, restore focus to their trigger when closed, and support Escape. The interface also honors the system `prefers-reduced-motion` setting.
- **Card-Grouped Share & Publish Menu**: The floating share menu triggered by the globe icon in the footer is structured into clear, card-grouped sections (`.dropdown-group-card`) distinguishing View Modes (Share page, Presentation, Book mode), Quick Copy URLs, Share Settings (Public Index, Paragraph Annotations), and Unpublish, with consistent vertical rhythm, concise destination subtitles that do not repeat the action title, full-row aligned hover/focus surfaces across Edit, Share, and Block Edit menus, viewport-aware scrolling for long menus, and complete dark/light theme support.
- **Real-Time Dynamic Document Title Sync**: Typing or editing `# Heading` in the editor instantly updates the browser tab `<title>` and application state in real time without requiring a page reload. Server-side title extraction has also been hardened to prioritize H1 headings while automatically ignoring TOC directives, alert blocks, and conversational AI preambles.
- **Browser-side Multi-format Document Import**: The Markdown editor's Footer Import button and `+ New` menu accept Markdown, Word, PowerPoint, Excel, OpenDocument, RTF, EPUB, CSV, and text-based PDFs, then convert them to Markdown in the browser. Existing content can be inserted at the cursor, replaced, or left untouched by cancelling; cancelling does not load or run the converter. Conversion uses same-origin, version-locked WebAssembly static assets, so document bytes never upload to the Wiki server.
- **CLI Conversion and Publishing**: [`scripts/doc2wiki.sh`](../scripts/doc2wiki.sh) converts a local document and publishes the Markdown to a specified Wiki path. It defaults to private, requires explicit `true` to publish, and prints only the shareable `shareUrl`.
- **Academic &amp; Technical Citations (Cite Modal)**: Dedicated standalone "Cite" button in Share footer and Edit mode to instantly generate and copy **APA (7th)**, **IEEE**, **BibTeX (LaTeX/Zotero)**, **MLA (9th)**, **Markdown**, or **Chicago (17th)** citation formats.
- **Academic Footnotes, Glassmorphic Popovers &amp; Pandoc Citations (`[^1]` / `^[...]` / `[@key]`)**:
  - **Footnote Popovers & Smooth Jump**: Hovering over any footnote reference (`[^1]`, `[^key]`) or citation badge (`[@key]`) immediately reveals an in-place glassmorphic tooltip with full citation details, avoiding disruptive scrolling. Clicking jumps smoothly with bidirectional backlink return (`↩`) and clean, non-polluted `[TOC]` heading anchors.
  - **Pandoc Citations**: Supports bracketed citations `[@smith04]`, locators `[@doe2023, p. 42]`, multiple citations `[@key1; @key2]`, author suppression `[-@key]`, and in-text `@key [locator]`, automatically mapping to footnotes, BibTeX blocks, or bibliography lists.
- **🔍 Full-Featured Search &amp; Replace**: Press `Cmd+F` (Ctrl+F) to summon the floating search bar or `Cmd+H` (Ctrl+H) for the replace panel; includes live match counters (`3 / 15`), Next/Prev navigation, match case (`Aa`), whole words (`\b`), regex (`.*`), and one-click replace all.
- **🖍️ Text Highlighting (`==text==`)**: HackMD-compliant `==highlighted text==` rendered as `<mark class="markdown-highlight">` with soft yellow glow across 20 dark and light themes, plus a dedicated toolbar button (`HL`).
- **🎨 Custom Font and Background Colors (`[color=...]`, `[bg=...]`)**: Supports `[color=red]text[/color]`, `[bg=yellow]text[/bg]`, and combined `[color=#3b82f6 bg=#eff6ff]text[/color]` with strict sanitization.
- **🔢 Code Block Line Numbers &amp; Filename Tabs**: Specify starting line numbers with ```` ```js= ```` (start from line 1) or ```` ```js=10 ````, and title headers with ```` ```js [app.js] ```` or ```` ```js=1 [server.mjs] ````.
- **📋 Code Block One-Click Copy**: Automatically mounts an instant copy button on every code block with animated state feedback.
- **💬 GitHub Alert Autocomplete &amp; Toolbar Button**: Typing `> [!` on a new line immediately summons a popup menu to choose `NOTE`, `TIP`, `IMPORTANT`, `WARNING`, or `CAUTION` with keyboard navigation and Enter insertion; also available via toolbar button (`⚠️`).
- **📖 Book Mode (`/share/:id/book`)**: Dual-pane reading shell with collapsible sidebar TOC, real-time chapter search filtering, active progress indicator, smooth native embed chapter loading (`?embed=1`), draggable sidebar resizer with local storage persistence and double-click reset, next/prev chapter flip cards, keyboard navigation (`[` and `]`), **PWA one-click offline pre-caching for the entire book**, and **3-in-1 multi-format export (Combined Markdown, Standalone Offline HTML eBook, and Print PDF)**, including safe standalone HTML export on mobile.
- **📽️ 2D Vertical Sub-Slides (`--`) &amp; YAML Frontmatter**: Use `---` for horizontal slides and `--` for deep-dive vertical sub-slides with 2D arrow navigation (`↑` `↓` `←` `→`) and overview matrix (`O`); customize transitions (`fade`, `slide`, `zoom`) via top YAML frontmatter.
- **📊 Excel &amp; Google Sheets Paste Auto-Conversion**: Pasting rich tabular data (`Cmd+V` / `Ctrl+V`) from Excel, Google Sheets, or web tables into the editor automatically converts them to clean Markdown tables (`| ... |`), with the selection-tail insertion bug fixed.
- **📂 Multi-Format Drag & Drop Import & Smart Choice Modal**: Drag files directly into the Markdown editor:
  - **PDF Documents**: Modal provides choices between "📑 AnyDocs Local Markdown Conversion" and "☁️ Upload to 888box as Attachment Link".
  - **Audio Files**: Modal provides a 3-way choice matching the menu, defaulting to "🎙️ Import audio (Transcript)", with options for "✨ Import audio (Smart format)" or "☁️ Upload to 888box Embedded `<audio controls>` Player".
  - **Images**: Direct upload to Cloudflare R2 and inserts `![alt](url)` at cursor.
  - **Office Documents & Markdown**: WASM AnyDocs conversion for DOCX/PPTX/XLSX or 888box attachment; dragging `.md`/`.txt` prompts insert at cursor or replace whole note.
- **🎙️ Toolbar Recording & Transcript**: The Markdown toolbar provides microphone controls to start, pause, resume, and stop recording. A finished WebM recording is saved in browser IndexedDB and inserted as a local player. When online, transcription tries Groq `whisper-large-v3`, then Groq Turbo, then Cloudflare Workers AI Whisper fallbacks. Publishing or syncing uploads the audio attachment to the external 888box service and replaces the local player URL. Recordings are capped at 25 MB, and the user must confirm participant consent before recording.
- **🔑 Admin Touch ID / WebAuthn FIDO2 Biometric Login**: Admin login screen features one-click Touch ID / Passkey authentication using zero-dependency Web Crypto ECDSA P-256; admin dashboard allows binding and managing authenticators (MacBook Touch ID, iPhone Face ID, Windows Hello).
- **📐 Adaptive &amp; Compact Line Numbers Gutter with Auto-Wrap Sync**: Dynamic digit-based gutter auto-sizing (~26px for 1-99 lines, smoothly expanding for hundreds/thousands of lines) with subtle 13px typography and pixel-perfect line-height matching; features **Mirror DOM Line Height Sync** to accurately measure and match soft-wrapped long paragraphs with real-time recalculation on resize and layout adjustments.
- **🎨 Unified Modal Dialog Architecture &amp; Full Dark Mode**: All popup dialogs (`.share-modal`, `.embed-modal`, `.url-import-modal`, `#cite-modal`, `#math-format-modal`, `.password-modal`, `.note-history-modal`, `.app-dialog-modal`, `.file-drop-modal`) adhere to a standardized Design System powered by `--modal-*` CSS variables across 20 dark and light themes, featuring global Escape-to-close, Tab focus traps, `data-modal-close` delegation, and accessible close buttons.
- **Unified Publishing &amp; Status Strip**: One dialog controls Publish, Autosave, and Public Index; all three default on and the confirmed choices are remembered on this device. After publishing, the Edit preview shows the Share URL, index state, retained versions, unique views, and last-saved time; dark UI mode uses a consistent high-contrast cool palette, with teal-blue, blue, indigo, and violet-blue distinguishing publish, layout, font, and language actions.
- **🔒 Seal Access Control & 10 Quick Start Scenario Presets (Orthogonal Architecture & Hardening)**:
  - **Orthogonal Access Control Philosophy**: Inspired by the 888box (`box.david888.com/seal/`) model, access control is strictly separated from password protection: **"Password protects confidential content; Seal controls when and how it is released."** Whether a note has an edit password or reader password, it can independently have a Seal attached or removed, taking effect immediately.
  - **4 Advanced Release Control Modes**:
    - **Time-Locked Capsule (`timelock`)**: Keeps a public share unavailable until its designated release date and time. Visitors receive an HTTP 423 Locked response with the branded `David888 Wiki / Seal` slate card and a live countdown; authors retain preview banners and can adjust the release time.
    - **Burn-After-Reading (`burn`)**: Permanently destroys the public share after it reaches its view limit (`maxViews`, default 1); the author's original note remains in the wiki. A **Two-Step Interstitial Reveal Card** prevents link-preview crawlers from consuming a view, and author edits and previews are exempt from the burn count. Burned shares return a 410 Gone page.
    - **Dead Man's Switch (`deadman`)**: Keeps confidential notes sealed while the author checks in within the configured pulse interval (custom minutes or shortcut chips for 1d, 3d, 7d, 14d, 30d). Heartbeats are refreshed via note edits, one-click "⚡ Pulse Now" in the Seal modal, or a private webhook (`/api/shares/:id/pulse?token=...`). If the author misses check-ins, the vault automatically releases to the public.
    - **Standard & Retention (`standard`)**: Optional expiration timers (`10m`, `1h`, `1d`, `7d`, `30d`, or never) enforced by Cloudflare KV native TTL and Worker runtime checks, serving a friendly 410 tombstone page upon expiration.
  - **Dedicated Seal Access Control Modal & Toolbar Dot Indicator**:
    - **Independent Toolbar Button & Clean Share Menu**: A dedicated "🔒 Seal" button (`#vault-presets-toolbar-btn` / `.seal-toolbar-btn`) sits in the footer toolbar, glowing with a teal dot indicator (`.seal-dot-indicator`) whenever a Seal is active. All obsolete legacy vault dropdowns have been eliminated from the share menu, providing a focused single-row live Seal status indicator.
    - **Dedicated Modal, 3-Column Grid & Dedicated Scroll**: Features an ergonomic 3-column responsive card grid on desktop, free of redundant badges for compact clarity. The top-right close button and language switcher are cleanly separated in flex flow to eliminate overlaps. All presets and parameters scroll smoothly within `.seal-modal-body-scroll` while action buttons remain pinned at the bottom. Includes live status badges, bilingual switcher, quick increment chips (`+1h`, `+1d`), and one-click "Remove Seal" and "Create Seal" controls.
    - **10 Quick Scenario Presets**: Configures optimal release parameters without ever modifying or overwriting existing note content:
      1. **One-Time Password** (`shieldAlert`): A single-view credential share with a 1h expiration. This preset does not generate or verify OTP codes.
      2. **Crypto Inheritance** (`bitcoin`): Dead man's switch (`deadman`), 30d pulse, cold wallet seed phrase guide.
      3. **Whistleblower** (`megaphone`): Dead man's switch (`deadman`), 7d pulse, public interest disclosure proof.
      4. **Product Launch** (`rocket`): Time-locked capsule (`timelock`), 7d unlock, launch announcement and coupon.
      5. **Birthday Gift** (`gift`): Time-locked capsule (`timelock`), 1d unlock on birthday.
      6. **Legal Hold** (`scale`): Standard share (`standard`), 30d legal hold retention.
      7. **Scavenger Hunt** (`target`): Time-locked capsule (`timelock`), 1h clue reveal.
      8. **Course Content** (`graduationCap`): Time-locked capsule (`timelock`), 7d scheduled curriculum and solution release.
      9. **Emergency Backup** (`lifeBuoy`): Dead man's switch (`deadman`), 14d backup SSH credentials.
      10. **Shared Secret** (`key`): Single-view `.env` credential share with a 1-day expiration.
  - **🛡️ Visitor Lock Page Branding & Security Hardening**:
    - Branded `David888 Wiki / Seal` high-contrast card display on locked visitor pages with live ticking countdowns.
    - Concurrent atomic burn claiming, mandatory password verification on reveal, explicit confirmation (`?burn_confirm=true`) for PDF exports on burn notes, zero secret leaks in interstitial DOM, and dynamic runtime ephemeral secrets.
  - **Universal Format Compatibility**: Supported seamlessly across Markdown, BlockNote, JSON Canvas, Excalidraw Whiteboard, and presentation/PDF exports.
  - **Native WebMCP & REST API Support**: `write_note`, `write_canvas`, and `write_whiteboard` accept `seal_mode`, `seal_unlock_at`, `seal_max_views`, and `seal_pulse_minutes` parameters, returning share URLs, expiration metadata, and private pulse webhooks.
- **⚡ PWA Offline Workstation, Background Sync & Media Caching (`/_pwa-offline`)**:
  - **Full-Featured Markdown Workspace**: Standalone offline application supporting Edit, Split, and Preview view modes, 5 customizable color themes (Dark, Light, Tokyo Night, Dracula, Nord), live sidebar note search, draft management, and one-click JSON backup & restore.
  - **Visual 3-Way Conflict Diff Modal**: Protects offline edits from remote cloud overwrites with side-by-side Diff comparison (Local vs Remote) and 3 resolution actions: Keep Local, Adopt Remote, or Save as Conflict Copy.
  - **Zero-GET Keystroke Saving & Background Sync**: Keystrokes save locally to IndexedDB with 0ms delay and zero redundant network GET requests. Reconnecting to the network automatically registers Service Worker Background Sync (`sync-pending-notes`) to synchronize pending notes silently without disrupting user flow.
  - **LRU Media Caching**: Service Worker v5 automatically precaches Markdown rendering assets and maintains an LRU-managed image cache (max 60 items) for R2 media (`s3.wiki.david888.com`).
  - **Cross-Device File Associations & Web Share Target**: Directly open and edit `.md`, `.markdown`, and `.txt` files from Desktop and Android systems (WebAPK intent filters); share text and URLs directly into new Wiki notes via Web Share Target.


### 📚 3. Book Mode Guide (Multi-Chapter Documentation)

Any Markdown note containing a structured list of chapter hyperlinks instantly transforms into an interactive **dual-pane online eBook**!

#### 🛠️ How to Create an Online Book (Syntax Example)
Simply author a table of contents list with Markdown links (supports H3 group headers and sub-item indentation):

````markdown
# 📚 Cloud Architecture Book & Technical Guide

> This handbook compiles core system design, architecture specs, and feature verification.

## 📖 Book Table of Contents

### Part 1: Core Architecture Concepts
- [01. System Architecture & Design Concepts](https://wiki.david888.com/share/qt7xmd)
- [02. Extended Writing & Formatting Features](https://wiki.david888.com/extended-writing-features-demo)
  - [02-1. Deep Dive Layout Details (Sub-chapter)](https://wiki.david888.com/share/qt7xmd)

### Part 2: Advanced Feature Verification
- [03. Excel & Google Sheets Auto Table Paste](https://wiki.david888.com/share/qt7xmd)
- [04. 2D Slide Deck Vertical Exploration](https://wiki.david888.com/share/qt7xmd/present)
- [05. External References & API Specifications](https://wiki.david888.com/mcp)
````

#### 🚀 Accessing & Using Book Mode
1. **Access URL**: Append `/book` to any share link (e.g. `https://wiki.david888.com/share/:shareId/book`) or edit link.
2. **Left Sidebar & Draggable Resizer**:
   - Automatically parses all chapter links, sections, and nested items with **instant chapter search filtering**.
   - **Splitter Resizer**: Hover over the sidebar border to drag and resize width (180px to 65% viewport width); double-click to reset to default 290px. Preferences are remembered in browser `localStorage`.
3. **Right Content Native Embed (`?embed=1`)**:
   - Clicking a chapter loads content immediately via native Workers edge rendering with full KaTeX formulas, code block tabs, GitHub alerts, Mermaid diagrams, and CSS themes.
4. **Navigation & Shortcuts**:
   - Top bar provides "← Previous" and "Next →" buttons, with keyboard shortcuts `[` (previous) and `]` (next) as well as mobile touch swipe gestures.
   - Top `↗` button opens the current chapter in a new tab.
   - Left top "← Exit Book" returns precisely to standard reading or edit mode.
5. **📥 One-Click Offline Book Pre-caching (Offline Cache)**:
   - Click "📥 Offline Cache" on the top bar to automatically pre-load all chapters and media into Service Worker Cache, allowing 100% offline reading in flight or disconnected environments!
6. **📤 3-in-1 Multi-Format Book Export**:
   - **📄 Combined Markdown (.md)**: Merges all chapters into a single master `.full.md` document for LLMs or offline notes.
   - **🌐 Standalone HTML eBook (.html)**: Packages the complete dual-pane reader and all chapter contents into an offline `.html` file with instant zero-server switching.
   - **🖨️ Print / Export PDF (.pdf)**: Automatically formats all chapters with print page breaks for clean one-click PDF generation.

#### 🤖 AI Agent 4-Step Multi-Article Book Orchestration SOP (For LLMs)
When asked to author a tutorial series, documentation handbook, or comprehensive course, AI agents should follow this standard 4-step SOP:
1. **Outline Planning**: Structure chapters logically and assign clean path slugs (e.g. `ts-ch01`, `ts-ch02`).
2. **Iterative Chapter Publishing**: Publish each chapter via `write_note` or API and collect the returned `shareUrl` (supports mixing 2D slide decks `/share/id/present` as chapters).
3. **Author Manifest Hub Note**: Aggregate all chapter links in an index note with H3 section groupings and 2-space indented sub-chapters.
4. **Deliver Book Reader URL**: Append `/book` to the hub note's `shareUrl` and present `https://wiki.david888.com/share/<hub-id>/book` to the user.

---

#### 🔗 Live Demo & Feature Showcase

- 📖 **Book Mode Live Experience**: [https://wiki.david888.com/share/47eqhm/book](https://wiki.david888.com/share/47eqhm/book)
- ✏️ **Book Table of Contents Editor**: [https://wiki.david888.com/book-and-2d-slides-demo](https://wiki.david888.com/book-and-2d-slides-demo)
- 📖 **Public Reader View (Share URL)**: [https://wiki.david888.com/share/qt7xmd](https://wiki.david888.com/share/qt7xmd)
- 🖥️ **Fullscreen 2D Slide Presentation**: [https://wiki.david888.com/share/qt7xmd/present](https://wiki.david888.com/share/qt7xmd/present)
- ✏️ **Editor Extended Writing Kit**: [https://wiki.david888.com/extended-writing-features-demo](https://wiki.david888.com/extended-writing-features-demo)


| Feature | Syntax / Usage | Verification & Visual Behavior |
| :--- | :--- | :--- |
| **1. 📖 Book Mode & Resizer** | `/share/:id/book` | View `/share/47eqhm/book`, drag splitter to resize, click chapters for 0s seamless switch. |
| **2. 📽️ 2D Presentation** | `---` (horiz) / `--` (vert) | Open `/share/qt7xmd/present`, 4-way arrow keys `↑` `↓` `←` `→` & `O` matrix overview. |
| **3. 📊 Excel Table Auto-Paste** | Direct clipboard paste | Press `Cmd+V` in editor to auto-convert HTML/TSV table to Markdown table syntax. |
| **4. 📝 Inline Footnotes** | `^[inline footnote text]` | Write `^[note]`, auto-generates bottom numbered definitions and hover tooltip popover. |
| **5. 🖍️ Text Highlighting** | `==highlighted text==` | Rendered as soft yellow glow `<mark>` across light/dark themes. |
| **6. 🎨 Custom Font/BG Color** | `[color=red]...[/color]`<br>`[bg=yellow]...[/bg]` | Supports Hex, RGB, CSS colors and `[color=... bg=...]` composite badges. |
| **7. 🔢 Line Numbers & Tabs** | ```` ```js=1 [server.mjs] ```` | Title header tab on top, line numbers gutter on the left. |
| **8. 📋 One-Click Code Copy** | Mounted on Code Header | Click "📋 Copy" on code blocks to trigger instant green checkmark state. |
| **9. 💬 GitHub Alerts** | `> [!NOTE]` / `> [!TIP]` etc. | Renders Note, Tip, Important, Warning, Caution alert boxes. |
| **10. 📖 Footnote Hover Popover** | `[^1]` & `[@lamport78]` | Hover over markers to summon in-place glassmorphic popover card. |
| **11. 🔍 Search & Replace** | `Cmd+F` (Find) / `Cmd+H` (Replace) | Shortcut opens floating bar with match count, regex, and one-click replace all. |
| **12. ⚡ Alert Autocomplete** | Type `> [!` on a new line | Summons 5 alert options with arrow keys and Enter/Tab insertion. |



---

### 🔐 3. Privacy, Versioning, Slides &amp; Annotations

- **Edit Lock vs View Lock**: Separate Salted MD5 password controls for editing permissions versus reading permissions.
- **D1 Snapshot History**: Cloudflare D1 automatically backs up content (5-minute cooldown, retains 10 snapshots) for preview and restoration.
- **Recent Share Links in Share Mode & Appearance Grouping**:
  - **Split Action Capsule (`.split-action-group`) in Share Mode**: Merges the standalone "Back to edit" and "New note" dropdown into a modern split capsule button on the left of the Share page footer. Left action triggers "Edit" for the current note, while the right dropdown trigger provides quick note creation and multi-format importing.
  - **Recent Shares (`#share-history-btn`) in Share Mode**: Readers and authors can now open the "Recent Share Links" modal directly from the Share page footer, easily toggling between "Created" and "Viewed" tabs to jump to previous notes.
  - **Dark Mode Toggle in Appearance Group**: Re-positioned the UI Dark/Light mode toggle (`☀️/🌙`) into the Appearance footer group alongside themes and font toggles, keeping the Info group cleanly focused on GitHub, App install, Agent Skill, and API docs.
- **Interactive Language Switcher in Editor Preference Modal**:
  - Embedded `En / 中` toggle pill buttons in the top-right of the "Choose your editor" dialog (`EDITOR_PREFERENCE_MODAL`). International visitors can switch to English with zero page reloads, instantly updating card descriptions, badges, and action buttons.
- **Slide Presentation Mode (Slidev-Lite 2.0)**: Splice notes using `---` dividers for 16:9 fullscreen slide presentations. Features KaTeX math, Mermaid diagrams, interactive ECharts, floating translucent toolbar (Overview `O`, Laser `L`, Blackout `B`, Fullscreen `F`), 20 theme color inheritances, and PDF/Slide export.
- **KaTeX Math Formula Copy (7 Formats) & Smart Currency Protection**:
  - Click any KaTeX math equation in preview or share mode to copy it directly to the clipboard.
  - Dedicated copy format menu (`fx` button) supports 7 formats: Auto Detect, LaTeX (with $), Plain LaTeX (without $, for Desmos/WolframAlpha), Notion (double $$), MathML (pastes into Microsoft Word as native formulas), PNG Image, and SVG Vector.
  - **💵 Smart Currency Protection**: Automatically protects monetary dollar amounts (e.g. `$10.00`, `$0.32`, `$3.87`, `NT$100`, `US$50`, `$10-$20`) from being misidentified by `remark-math` as LaTeX math delimiters, preserving bold tags `**` and surrounding formatting, while flawlessly preserving genuine LaTeX equations (such as `$E = mc^2$`, `$10$`, `$1 + 1 = 2$`, and `$10 < x < 20$`).
- **Paragraph Annotations & REST API**: Highlight text on Share pages for inline discussions and deep-linking, backed by Cloudflare D1 persistence and standard REST endpoints (`/api/shares/:shareId/annotations`). Features consecutive annotation creation across multiple text passages without reloading, smooth composer auto-scrolling, hover preview cards, touch action sheets, and device HMAC delete tokens.
- **Stateless Markdown Processing Utilities**:
  - `POST /api/markdown/render`: Markdown to HTML with 20 CSS theme choices.
  - `POST /api/markdown/parse`: HTML / Web URL to clean Markdown.
  - `POST /api/markdown/extract`: Extract plain text, heading hierarchy, links, and word/reading-time statistics.
  - `POST /api/markdown/lint`: Validate and auto-fix unclosed code fences, missing heading spaces, etc.
- **📄 Native Vector PDF Export Engine**:
  - **Chromium-Free Vector Rendering**: Integrated Rust/WebAssembly-powered vector rendering engine to compile Markdown directly into crisp, selectable, searchable paged vector PDFs on Cloudflare Workers in milliseconds without headless browsers.
  - **Direct Download Without Print Dialog**: The export menu provides "🚀 Direct Export PDF (.pdf)" to download `.pdf` files instantly without triggering system print dialogs, while keeping "🖨️ Browser Print Preview" as an alternative.
  - **Mermaid Vector Diagram Rendering**: Both browser exports and headless API requests automatically translate Mermaid code fences into vector `<svg>` graphics embedded inside the PDF.
  - **Font Subsetting & Emoji Support**: Automatic Google Fonts (`Noto Sans TC`, `JetBrains Mono`, `Inter`) subsetting and `twemoji` vector graphics prevent missing glyphs across Traditional Chinese, CJK, and emojis.
  - **Book Mode Full-Volume Compilation**: eBook Mode (`/share/:shareId/book`) supports one-click compilation of all chapters into a unified PDF eBook manual.
  - **REST API & MCP Tool**: Endpoints `POST /api/pdf/export` (supports `markdown` and `html`), `GET /:path/export/pdf`, `GET /share/:shareId/export/pdf`, and MCP tool `export_pdf`.
- **PWA Application, Web Share Target, Multi-Device File Handling, Conflict Diff & Offline Workstation**:
  - **Standalone & Window Controls Overlay**: Installs seamlessly on macOS, Windows, iOS, and Android; desktop versions support Window Controls Overlay for titlebar integration.
  - **Multi-Device & Android File Association (File Handling & WebAPK Intent)**: Click or open `.md` / `.markdown` / `.txt` files directly in macOS Finder, Windows Explorer, or Android file managers to launch and edit in `wiki.david888.com`.
  - **Web Share Target API**: Share text, links, or articles directly from any mobile or desktop app into david888 wiki to instantly create a new note.
  - **Visual 3-Way Conflict Diff Modal**: Detects remote server changes during sync and provides an interactive side-by-side Diff modal with "Keep Local", "Keep Remote", and "Save as Conflict Copy" actions.
  - **Full-Featured Dual-Pane Offline Workstation (`/_pwa-offline`)**: Work completely offline with Edit/Split/Preview views, multi-theme selector (Dark, Light, Tokyo Night, Dracula, Nord), full-text search & filtering, note management, standalone "⭳ Export HTML", and one-click JSON backup export/import.
  - **Live Markdown-to-HTML Preview & Offline Formatting Toolbar**: Built-in formatting toolbar (Bold, Italic, Strikethrough, Highlight, H1-H3, Blockquote, Inline/Fenced Code, Lists, Tasks, Tables, Links, Images, GitHub Alerts, Two Columns), injected with complete Markdown CSS typography (`.markdown-body`), bidirectional scroll synchronization, and keyboard shortcuts (`Cmd+B`, `Cmd+I`, `Cmd+K`, `Tab` 4-space indent).
  - **Service Worker v6 Resilient Caching & Dynamic CDN Cache**: Precaches core Markdown rendering pipeline (`marked`, `purify`, `markdown-extensions`, `media-preview`) and dynamically intercepts & caches external CDN dependencies (`esm.sh`, `cdn.jsdelivr.net`, `cdnjs.cloudflare.com`) and R2 media images to guarantee zero broken images or missing styles while offline.
  - **Local-First Offline Audio Recording, Dynamic Island Recording HUD, Online ASR & Deferred 888box Upload**:
    - **Dynamic Island Recording HUD**: Unfolds a responsive glassmorphism HUD pill at the top of the viewport with pulsing live red dot, 4-bar equalizer wave animation, `MM:SS` live duration timer, and pure SVG controls ("⏸️ Pause / ▶️ Resume", "⏹️ Done & Insert", and "✕ Cancel & Discard").
    - **250ms Audio Slicing & Guaranteed Finalization**: Slices audio in 250ms chunks and actively requests buffer data on stop, ensuring zero missing audio chunks even on short recordings.
    - **Instant Local Playback**: Instant microphone recording directly to client-side **IndexedDB (IndexedDB database -> `audios` store)**; inserts `<audio controls data-offline-audio-id="rec_..." src="blob:..."></audio>` for 0ms local playback.
    - **Online Transcription**: While online or after reconnecting, a copy of the audio is sent to the Worker transcription endpoint, which tries Groq `whisper-large-v3`, then Groq Turbo, then Cloudflare Workers AI Whisper fallbacks. The original recording Blob remains in IndexedDB until attachment sync.
    - **Upload on Publish / Sync**: Publishing or syncing uploads the IndexedDB audio Blob to the external 888box attachment service, replaces the local player URL with its permanent HTTPS URL, and updates the status to `☁️ Cloud synced`. Audio attachments therefore use this external service rather than the installer's R2 bucket.
    - The offline workstation (`/_pwa-offline`) also records to IndexedDB and uploads pending audio to 888box when the note syncs.
  - **Local-First Hybrid Storage**: 0ms local saves to IndexedDB (IndexedDB database), synchronous metadata in `localStorage`, and smart background cloud sync with visible status badges (`🟢 Saved locally`, `☁️ Cloud synced`).
  - **Keyboard Shortcuts**:
    - `Cmd/Ctrl + S`: Instant save to IndexedDB & cloud in edit mode; download `.md` in share mode.
    - `Cmd/Ctrl + O`: Fast local Markdown file picker in edit mode.
    - `Cmd/Ctrl + E`: Toggle Edit / Split / Preview mode in offline workstation.
    - `Cmd/Ctrl + B` / `I` / `K`: Offline toolbar shortcuts for bold, italic, and links.


---

## 💾 Local-First Storage Architecture & Pluggable Drivers

1. **0ms Local Saves (IndexedDB)**: Keystrokes are immediately saved to client-side **IndexedDB (IndexedDB database)** with status `🟢 Saved locally`, providing desktop-grade fluid writing without network latency.
2. **Smart Cloud Sync**: Automatically syncs in the background upon 3.5s inactivity pause, periodic intervals, or page close (`visibilitychange` / `keepalive` / `sendBeacon`), **saving >90% of cloud write requests** and eliminating KV write limit concerns.
3. **Pluggable Backend Storage Drivers (`SCN_STORAGE_DRIVER`)**:
   - `auto` (Default / Hybrid): Reads D1 first with seamless fallback to legacy KV notes; dual-writes to migrate edited KV notes to D1.
   - `kv`: Pure Cloudflare KV storage (zero database dependency).
   - `d1`: Pure Cloudflare D1 storage (SQLite with 100,000 free writes/day).

### Server / Cloudflare

| Storage           | Data                                                                                                          | Description                                                              |
| ----------------- | ------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------ |
| `NOTES` KV        | Markdown content & metadata (`theme`, `width`, `shareFont`, `publicIndex`, `autosave`, `pw`/`vpw` hashes) | Unpublished notes are browser-only; saves initial theme on note creation |
| `SHARE` KV        | Share slug to note path mapping                                                                               | Does not store article body                                              |
| D1 `notes`        | (Optional) Full note content & JSON metadata                                                                  | Created via `schema/notes_d1.sql`, provides 100,000 writes/day           |
| D1 `shares`       | (Optional) Share slug to path mapping table                                                                   | Created via `schema/notes_d1.sql`                                        |
| D1 `note_history` | Historical version snapshots (path, text, created time)                                                       | Retains latest 10 versions                                               |
| D1 `note_stats`   | View count, last view time, anonymous device UUID hash                                                        | Stores SHA-256 hash only                                                 |
| D1 `annotation_*` | Paragraph anchors, source quotes, comments & replies                                                          | Retains discussion threads after text edits                              |
| `IMAGES` R2       | Image upload bucket                                                                                           | Stores public image URLs                                                 |

### Browser (localStorage / IndexedDB / Cookie)

| Type         | Key                                                                                  | Description                                                                          |
| ------------ | ------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------ |
| IndexedDB    | IndexedDB `notes` store                                              | Complete Markdown note content, offline drafts & snapshots (0ms local-first storage) |
| IndexedDB    | IndexedDB `audios` store                                             | Local WebM Opus offline audio Blob storage & pending sync queue                      |
| localStorage | Note metadata cache                                                          | Fast synchronous note metadata list (path, title, updatedAt, size, syncStatus)        |
| localStorage | Preview, device, font, and theme preferences | Mirror of layout and visual preferences                                              |
| localStorage | Publishing preferences                                                     | Last confirmed Publish, Autosave, and Public Index choices; all enabled on first use |
| localStorage | Recent share history and annotation author                                   | Local history of 20 recent shares & author name                                  |
| Cookie       | `auth` / `cn_device` / `admin_session`                                               | Path-scoped JWT, anonymous device hash & admin session                           |


---

## 🛡️ Full-Stack Security & Hardening Standards

The project follows Cloudflare's open-source security benchmark (`cloudflare/security-audit-skill`) with continuous regression testing:

1. **XSS Defense-in-Depth & DOM Sanitization**:
   - Server-side template escaping for all user content (Textarea, Bot index markup, and embedded `APP_STATE` JSON scripts with `\u003c` protection).
   - Client-side Mermaid strict mode (`securityLevel: 'strict'`) and dynamic SVG sanitization via `DOMPurify.sanitize()` across Mermaid and Graphviz (`@hpcc-js/wasm`).
2. **Access Control & Cryptographic Token Security**:
   - Explicit separation of View Locks (`vpw`) and Edit Locks (`pw`), ensuring readers never receive unauthorized edit capabilities.
   - JWT tokens include standard `exp` expiration claims with `HttpOnly`, `Secure`, and `SameSite` cookies.
   - Master admin dashboard authenticated via cryptographically signed JWTs and WebAuthn / FIDO2 Passkey assertions.
   - Constant-time password comparisons (`constantTimeStringCompare`) to prevent timing side-channel attacks.
3. **Storage Consistency & Resource Protection**:
   - Parameterized SQL statement bindings on D1 SQLite queries (0 SQLi).
   - Scheduled cron cleanups synchronize D1 SQLite and KV deletions, preserving memos with valid content or active password protection.
   - Strict MIME format allowlists and 10MB file size limits on R2 uploads; JSON-RPC 2.0 batch request limits on Worker MCP (max 20).

---

## 🔍 Discovery Endpoints

- `GET /.well-known/api-catalog`: RFC 9727 Linkset JSON.
- `GET /.well-known/agent-skills/david888-wiki-publisher/SKILL.md`: LLM Agent Skill spec.
- `GET /auth.md`: Authentication specification.
- `GET /llms.txt`: Concise LLM entry point linking to the public Skill, API docs, and specifications.
- `GET /llms-full.txt`: Comprehensive LLM site architecture, API specs, and extended system documentation.
- `GET /robots.txt`: AI Crawler rules.
- `Accept: text/markdown`: Requesting `/share/...` or `/:path` returns raw Markdown.

---

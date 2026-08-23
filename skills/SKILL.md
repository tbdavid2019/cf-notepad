---
name: david888-wiki-publisher
description: Publish, read, and append markdown content directly to the David888 Wiki using its REST API. Continuous feature evolution is active—always fetch the latest live SKILL.md before execution to leverage newly released formatting syntax, layouts, and tools.
---

# David888 Wiki Publisher Skill

You have the ability to read, write, and append markdown content natively to `wiki.david888.com` using HTTP requests (cURL or Python requests).

**API Base URL**: `https://wiki.david888.com/api`

## ⚡ Mandatory Freshness Check & Continuous Feature Evolution

> [!IMPORTANT]
> **Continuous Feature Evolution — Always Fetch the Latest Live Version**:
> David888 Wiki is under continuous active development with frequent releases of powerful new authoring capabilities (e.g. academic multi-column layouts, automatic TOC trees, 2D slide decks, Book Mode, rich text highlights, diagram toolbars, LaTeX formulas, and Pandoc citations).
>
> **Before every invocation of this skill, AI agents MUST fetch and read the latest complete skill document from the canonical website URL.** Do not assume a local, repository, or previously cached copy is current.

```bash
curl -fsSL -H "Cache-Control: no-cache" \
  "https://wiki.david888.com/.well-known/agent-skills/david888-wiki-publisher/SKILL.md"
```

Apply the fetched version's instructions for the rest of the task. If the canonical URL is temporarily unavailable, only use a local or cached copy as a fallback, clearly note that freshness could not be verified, and avoid assuming that undocumented behavior is supported. Always keep an eye out for newly added formatting tags and modern layout structures!

## Quick Start Guide

### 1. Read a Wiki Page (GET)
```bash
curl -X GET "https://wiki.david888.com/api/<path>"
```
*If protected, use `?pw=<password>` or `Authorization: Bearer <password>`.*

### 1.1 Read Markdown Instead of Rendered HTML
If you are reading a normal note page or a public share page, do not scrape the rendered HTML first. Ask the server for markdown directly.

```bash
curl -X GET "https://wiki.david888.com/share/<share-id>" \
  -H "Accept: text/markdown"
```

You can use the same header on `https://wiki.david888.com/<path>`.

Reading priority for agents:
1. Prefer `GET /api/<path>` when you know the note path.
2. Otherwise use `GET /share/<share-id>` with `Accept: text/markdown`.
3. Only fall back to HTML parsing when markdown negotiation is unavailable.

### 2. Create/Overwrite a Page (POST)
```bash
curl -X POST "https://wiki.david888.com/api/<path>" \
  -H "Content-Type: application/json" \
  -d '{
    "text": "# Title\nContent",
    "public": true,
    "theme": "retro"
  }'
```
### 2.1 Upload a Full Markdown File Directly
If you already have a local `.md` file, prefer raw markdown upload instead of embedding the whole document inside JSON.

```bash
curl -X POST "https://wiki.david888.com/api/<path>?public=true&theme=retro" \
  -H "Content-Type: text/markdown; charset=UTF-8" \
  --data-binary @article.md
```

This is safer for long markdown because it avoids JSON escaping problems.

### 2.2 Multipart Markdown File Upload
```bash
curl -X POST "https://wiki.david888.com/api/<path>" \
  -F "file=@article.md;type=text/markdown" \
  -F "public=true" \
  -F "theme=retro"
```

Use form fields `append`, `public`, `share`, `publicIndex`, `theme`, `width`, `pw`, and `vpw` when needed. Supported widths are `100%`, `960px`, `1200px`, and `1440px`; if omitted, a note without a stored width defaults to `1200px`.

### 2.3 Available Themes
Choose a theme to wow the user: `ayu-light`, `bauhaus`, `botanical`, `catppuccin-latte`, `catppuccin-macchiato`, `claude-canvas`, `green-simple`, `kanagawa`, `neo-brutalism`, `newsprint`, `notion-clean`, `organic`, `playful-geometric`, `professional`, `retro`, `shopify-mint`, `sketch`, `terminal`, `tokyo-night`, `x-ai`.
> [!IMPORTANT]
> **CRITICAL: READ THE RESPONSE CAREFULLY!**
> The response contains TWO URLs:
> 1. `url`: This is the **internal edit URL**. It always points to the same path. **DO NOT GIVE THIS TO THE USER.**
> 2. `shareUrl`: This is the **public read-only URL**. It uses a hash (e.g., `/share/abc123`).
> 
> **YOU MUST ALWAYS GIVE THE `shareUrl` TO THE USER.** If you give the `url`, the user will likely see an empty or error page.
>
> If the content is intended to be viewed as slides, you may also derive a presentation link by appending `/present` to `shareUrl`.
> Example: `https://wiki.david888.com/share/abc123/present#/2`
> Use the Reveal hash suffix to point to a specific slide when useful.

### 2.4 Note Settings Route (Browser/Edit Session)
There is also a note settings route for the normal editor:

```bash
curl -X POST "https://wiki.david888.com/<path>/setting" \
  -H "Content-Type: application/json" \
  -H "Cookie: auth=<editor-session-cookie>" \
  -d '{
    "theme": "retro",
    "width": "1200px",
    "shareFont": "jetbrains",
    "previewDevice": "desktop",
    "publicIndex": false
  }'
```

Important:
- This route uses the normal edit-session cookie flow, not the note API password flow.
- Use it when an agent is operating inside the authenticated editor/browser context.
- For headless publishing, prefer `POST /api/<path>` first. It can persist `width` directly; use `/:path/setting` only when you need browser/editor settings such as share font.

Supported JSON fields on `POST /:path/setting`:
- `mode`: note mode metadata
- `share`: whether the note has a public share link
- `theme`: persisted theme name
- `width`: preview/share width metadata
- `shareFont`: `jetbrains` or `maple`
- `previewDevice`: `desktop` or `mobile`
- `publicIndex`: whether the shared note should be included in `/sitemap.xml`

If `share` is set to `false`, `publicIndex` is automatically forced to `false`.

### 3. Append to a Page (POST)
```bash
curl -X POST "https://wiki.david888.com/api/<path>" \
  -H "Content-Type: application/json" \
  -d '{ "text": "\n\n## Update\n...", "append": true }'
```

If appending from a local markdown file, use:
```bash
curl -X POST "https://wiki.david888.com/api/<path>?append=true" \
  -H "Content-Type: text/markdown; charset=UTF-8" \
  --data-binary @update.md
```

### 4. Markdown Processing Utilities (Stateless)

#### 4.1 Render Markdown to HTML (`POST /api/markdown/render`)
```bash
curl -X POST "https://wiki.david888.com/api/markdown/render" \
  -H "Content-Type: application/json" \
  -d '{
    "markdown": "# Hello World\nThis is **bold** text.",
    "theme": "claude-canvas",
    "fullHtml": false
  }'
```
Returns: `{"err": 0, "data": {"html": "<div class=\"markdown-body\">...</div>", "theme": "claude-canvas", "fullHtml": false}}`

#### 4.2 Parse HTML / Webpage to Markdown (`POST /api/markdown/parse`)
```bash
# Convert raw HTML
curl -X POST "https://wiki.david888.com/api/markdown/parse" \
  -H "Content-Type: application/json" \
  -d '{"html": "<h1>Title</h1><p>Paragraph</p>"}'

# Or fetch & convert from URL
curl -X POST "https://wiki.david888.com/api/markdown/parse" \
  -H "Content-Type: application/json" \
  -d '{"url": "https://example.com/article"}'
```
Returns: `{"err": 0, "data": {"markdown": "# Title\n\nParagraph"}}`

#### 4.3 Extract Text & Structure (`POST /api/markdown/extract`)
```bash
curl -X POST "https://wiki.david888.com/api/markdown/extract" \
  -H "Content-Type: application/json" \
  -d '{"markdown": "# Title\nParagraph content with [Link](https://example.com)"}'
```
Returns: `{"err": 0, "data": {"title": "Title", "text": "...", "headings": [...], "links": [...], "images": [...], "stats": {"characters": 120, "words": 25, "lines": 5, "readingTimeMinutes": 1}}}`

#### 4.4 Lint & Auto-fix Markdown (`POST /api/markdown/lint`)
```bash
curl -X POST "https://wiki.david888.com/api/markdown/lint" \
  -H "Content-Type: application/json" \
  -d '{"markdown": "#HeadingWithoutSpace\n```\nUnclosed code"}'
```
Returns: `{"err": 0, "data": {"valid": false, "issues": [...], "fixedMarkdown": "# HeadingWithoutSpace\n```\nUnclosed code\n```"}}`

### 5. Line-Anchored Annotations & Discussions (`/api/shares/:shareId/annotations`)

#### 5.1 List Annotations
```bash
curl -X GET "https://wiki.david888.com/api/shares/<shareId>/annotations"
```

#### 5.2 Create an Annotation Thread
```bash
curl -X POST "https://wiki.david888.com/api/shares/<shareId>/annotations" \
  -H "Content-Type: application/json" \
  -d '{
    "anchor": {
      "selectedText": "Target passage text",
      "prefix": "Text before target...",
      "suffix": "...text after target",
      "sourceRevision": "<currentRevision>"
    },
    "authorName": "David",
    "body": "Annotation comment body"
  }'
```

#### 5.3 Reply to an Annotation Thread
```bash
curl -X POST "https://wiki.david888.com/api/shares/<shareId>/annotations/<threadId>/messages" \
  -H "Content-Type: application/json" \
  -d '{"authorName": "Alice", "body": "Reply comment text"}'
```

## Common Scenarios & Templates

### A. Saving a Research Report
**Action**: Create a new path (e.g., `report-2024-03`) and POST the content.
**Prompt for self**: "I will save this report to the wiki at path `report-2024-03` so the user can share it."

### A.1 Large Context / Skill Files
If the material is a long source document such as `SKILL.md`, API docs, logs, or raw context exports, do **not** paste the full file into the wiki by default.

Use this pattern instead:
- Write a concise summary of the important points.
- Include the original repo path, local path, or canonical URL.
- Only publish the full raw text when the human explicitly asks for a full mirror/copy.

Example:
```md
# Skill Summary
- Purpose: publish markdown to the wiki API
- Key rule: return `shareUrl`, not `url`

# Source
- Repo path: `skills/SKILL.md`
```

### B. Appending to a Task Log
**Action**: Use `append: true` to avoid reading large history.
**Prompt for self**: "I'll append this status update to the `task-log` instead of overwriting."

### C. Handling Local Images
1. **Upload**: `curl -X POST "https://wiki.david888.com/api/upload" -F "image=@/local/path.png"`
2. **Replace**: Extract the returned URL and replace `/local/path.png` in your markdown.
3. **Publish**: POST the final markdown.

### D. Writing Mermaid and Flow Diagrams
Use fenced code blocks with language `mermaid`. Prefer standard Mermaid syntax and keep node labels plain.

````md
```mermaid
flowchart TD
    A["Start"] --> B{"Need share URL?"}
    B -->|Yes| C["Return shareUrl"]
    B -->|No| D["Keep editing"]
```
````

Practical rules:
- Prefer `flowchart TD` or `flowchart LR` for process diagrams.
- Keep one diagram per code fence.
- Avoid wrapping Mermaid inside HTML blocks.
- Use short node labels when possible, especially for mixed CJK and English text.
- When the user asks for a flowchart, sequence diagram, state diagram, gantt chart, or mindmap, emit Mermaid markdown directly unless they explicitly ask for an image.

> [!CRITICAL]
> **Mermaid Syntax & Lexical Safeguards (Preventing Parser/Render Errors):**
> 1. **ALWAYS wrap node text in double quotes `"`**: Write `NODE["Label Text"]` instead of `NODE[Label Text]`.
> 2. **NEVER put unquoted URL paths or slashes inside node brackets**:
>    - ❌ **BAD**: `PROXY[/api/proxy]` (Mermaid treats `[/` as the start of a parallelogram node shape `[/.../]` and fails with a lexical error when finding `]`).
>    - ✅ **GOOD**: `PROXY["/api/proxy"]`
> 3. **Escape or quote special characters**: Characters like `/`, `\`, `(`, `)`, `[`, `]`, `{`, `}`, `:`, and `|` MUST be inside double quotes `"..."`.
>    - ❌ **BAD**: `CRM[CRM System (V2)]` or `CRM[` (incomplete bracket)
>    - ✅ **GOOD**: `CRM["CRM System (V2)"]`
> 4. **Always ensure brackets are balanced**: Ensure every opening bracket (`[`, `(`, `{`) has its matching closing bracket on the same line before connecting arrows `-->`.

### E. Appearance Settings and Allowed Values
When an agent needs to preserve the reader/editor presentation, use these persisted metadata values:

- `theme`: one of the bundled theme names listed above
- `width`: `100%`, `960px`, `1200px`, or `1440px`
- `shareFont`: `jetbrains` or `maple`
  - `jetbrains` = JetBrains Mono
  - `maple` = Maple Mono
- `previewDevice`: `desktop` or `mobile`
- `publicIndex`: `true` or `false`

Practical guidance:
- Use `width: "100%"` when the user does not specify a reading width.
- Use `shareFont: "jetbrains"` as the default shared-reader font.
- Use `previewDevice: "mobile"` only when the human explicitly wants a phone-oriented preview state saved with the note.
- If you are only publishing content and do not need to control note appearance, you can omit all of these fields.

### F. Writing 2D Presentation Slides (Slidev-Lite 2.0)
Presentation mode is available at `shareUrl + '/present'`.

Authoring rules:
- Use `---` for horizontal slide transitions.
- Use `--` for vertical deep-dive sub-slides (e.g. detailed breakdown of a parent slide).
- Navigation supports 4-way arrow keys (`↑` `↓` `←` `→`), laser pointer (`L`), blackout pause (`B`), fullscreen (`F`), and 2D matrix overview grid (`O`).
- Use YAML frontmatter at the very top of the markdown note to configure transitions and themes:
  ```yaml
  ---
  transition: slide
  theme: claude-canvas
  ---
  ```
- Use `::left::` and `::right::` for a two-column slide layout.
- Use `{v-click}` for progressive reveal items.

Example:

````md
---
transition: fade
---

# Product Architecture Update

---

## High-Level Architecture
- Distributed Cloudflare Workers
- Hybrid D1 Database & KV Storage

--

### Vertical Sub-Slide: D1 Storage Deep-Dive
- 10 version snapshots with rollback
- Anonymous unique view deduplication

---

::left::
## Frontend Features
- Instant Markdown rendering
- 20+ CSS Themes

::right::
```mermaid
flowchart TD
    A["Draft"] --> B["Publish"]
    B --> C["Share Link"]
```
````

### G. Writing Books & Multi-Chapter Manuals (Book Mode & Multi-Article Orchestration)
Any note containing a list of chapter links automatically functions as a **Book Manifest**. Readers can view the collection as a modern dual-pane interactive eBook by appending `/book` to the share link: `shareUrl + '/book'`.

#### G.1 The 4-Step Standard SOP for AI Agents to Build a Multi-Article Book
When a human asks you to create a comprehensive course, tutorial series, documentation handbook, or multi-chapter book:

1. **Step 1: Outline & Chapter Planning**
   - Design a logical module/chapter structure (e.g. Overview, Module 1, Module 2, Advanced Topics, Case Studies).
   - Determine unique, descriptive path slugs for each chapter (e.g. `ts-intro`, `ts-generics`, `ts-decorators`, `ts-handbook-hub`).

2. **Step 2: Iteratively Author & Publish Every Chapter Note**
   - Write and publish each chapter as an independent, fully-formatted markdown note via `write_note` (or `POST /api/<chapter-path>`).
   - Collect each chapter's returned `shareUrl` (or relative share path like `/share/<id>` or direct path `/<path>`).
   - *Tip*: You can freely mix normal Markdown chapters with 2D slide decks (`/share/<id>/present`) inside the book!

3. **Step 3: Author the Book Manifest / Hub Note**
   - Create a central hub note (e.g. `ts-complete-handbook`) containing the master Table of Contents.
   - **Manifest Structure Rules**:
     - Use `# Book Title` (H1) for the main book title.
     - Add a blockquote `> ...` for the book's executive summary, target audience, or reading guide.
     - Use `## Module Title` or `### Section Title` for chapter groupings.
     - Use `- [Chapter Name](/share/<id>)` or `1. [Chapter Name](/<path>)` for chapter links.
     - Use 2-space indentation `- [Sub-Chapter Name](/share/<id>)` for hierarchical nested sub-chapters.

4. **Step 4: Deliver the Interactive Book Reader URL to the User**
   - Take the Hub Note's returned `shareUrl` and append `/book`.
   - **Always return the `/book` link to the human**: `https://wiki.david888.com/share/<hub-share-id>/book`.

#### G.2 Example Book Manifest Note (`ts-complete-handbook`)

````md
# 📘 TypeScript 現代全端實戰手冊 (TypeScript Modern Fullstack Handbook)

> 本書為全端工程師設計，從底層型別推導到分散式架構實戰，涵蓋現代 TypeScript 所有關鍵技術。

## 📖 核心章節目錄 (Table of Contents)

### 第一單元：現代型別核心基礎
- [01. TypeScript 5.x 核心觀念與型別系統概覽](/share/ts-ch01)
- [02. 泛型 (Generics) 與條件型別實戰](/share/ts-ch02)
  - [02-1. 深入 infer 與樣板字面型別 (Template Literal Types)](/share/ts-ch02-infer)
- [03. 型別守衛與斷言技巧](/share/ts-ch03)

### 第二單元：架構模式與簡報
- [04. Clean Architecture 與領域驅動設計](/share/ts-ch04)
- [05. 2D 簡報：分散式系統型別安全架構](/share/ts-ch05/present)

### 第三單元：邊緣運算與 API 整合
- [06. Cloudflare Workers + D1 全端型別共享](/share/ts-ch06)
- [07. WebMCP 與 AI Agent 工具端點開發](/share/ts-ch07)
````

#### G.3 Reader Features Supported in Book Mode (`/book`)
- **Dual-Pane Split Layout**: Left pane displays the hierarchical table of contents with live search filtering; right pane renders the chapter via fast embed (`?embed=1`).
- **Draggable Splitter**: Readers can freely drag the boundary between sidebar and reading pane (180px to 65% width) or double-click to reset.
- **Embedded Slides & Media**: Slides (`/present`), code copy tabs, KaTeX formulas, Mermaid diagrams, and zoomable images all render natively without leaving the book interface.
- **Keyboard Shortcuts**: Readers can press `[` (Previous Chapter) and `]` (Next Chapter) to navigate through the entire book.

### H. Extended Markdown Syntax & Rich Formatting Reference
When authoring content on David888 Wiki, AI agents can leverage these rich formatting syntaxes:

| Syntax Feature | Markdown Syntax Example | Visual & Render Output |
| :--- | :--- | :--- |
| **🖍️ Text Highlighter** | `==highlighted text==` | `<mark class="markdown-highlight">` with soft yellow glow across light/dark themes. |
| **🎨 Custom Text/BG Colors** | `[color=red]red text[/color]`<br>`[bg=yellow]yellow bg[/bg]`<br>`[color=#3b82f6 bg=#eff6ff]badge[/color]` | Custom font and background colors with sanitized Hex, RGB, and CSS color names. |
| **🔢 Code Block Line Numbers** | ```` ```js=1 ```` (start from line 1)<br>```` ```js=10 ```` (start from line 10) | Generates non-selectable line numbers gutter on the left of code fences. |
| **📑 Code Block Title Tabs** | ```` ```js [app.js] ````<br>```` ```js=1 [server.mjs] ```` | Renders filename tab header with language badge and one-click copy button. |
| **💬 GitHub Alerts** | `> [!NOTE]` / `> [!TIP]`<br>`> [!IMPORTANT]` / `> [!WARNING]`<br>`> [!CAUTION]` | Styled callout boxes with icons and theme-adaptive border and background. |
| **📝 Standard Footnotes** | `Text with note[^1]`<br>`[^1]: Footnote text` | Numbered footnote with glassmorphic hover card popover and smooth scroll. |
| **📝 Inline Footnotes** | `Text with ^[inline note text]` | Pandoc/HackMD inline footnotes, auto-numbered with bottom definition list. |
| **🎓 Pandoc Citations** | `[@smith04]`, `[@doe2023, p. 42]` | Hover popover cards with academic citation details (APA, IEEE, BibTeX, MLA). |
| **📊 Tables** | `\| Col 1 \| Col 2 \|`<br>`\| --- \| --- \|`<br>`\| Val 1 \| Val 2 \|` | Formatted responsive tables (auto-converts from copied Excel/Google Sheets). |
| **📑 Table of Contents** | `[TOC]` (on its own line) | Generates interactive, smooth-scrolling nested TOC navigation tree. |
| **🔤 Multi-Column Layouts** | `<div class="two-column-layout">...</div>`<br>`<div class="three-column-layout">...</div>` | Academic paper / magazine 2-column or 3-column layout (stacks on mobile). |

### H.1 Multi-Column Layouts (Academic & Magazine Layout)
For research papers, executive briefings, feature comparisons, or bilingual side-by-side text, wrap content inside `<div class="two-column-layout">` or `<div class="three-column-layout">`. Sections are automatically partitioned by the child headings (e.g. `###`):

````html
<div class="two-column-layout">

### 1. Traditional Architecture
- Monolithic backend servers
- Centralized database bottlenecks
- High regional latency

### 2. Modern Edge Architecture
- Distributed Cloudflare Workers
- Hybrid D1 database + KV caching
- Sub-50ms global latency

</div>
````

For three parallel columns:
````html
<div class="three-column-layout">

### 🚀 Speed
Edge computing delivers instant response times worldwide.

### 🛡️ Reliability
Multi-tier failover and distributed snapshots prevent downtime.

### 🔌 Extensibility
Native MCP, WebMCP, and REST APIs for full AI agent integration.

</div>
````

### H.2 Automatic Table of Contents (`[TOC]`)
For comprehensive reports, technical specs, long-form articles, and documentation, **AI agents are strongly encouraged to include `[TOC]`** near the top of the article (right after the title or executive summary):

````md
# 📚 Distributed Systems & Edge Storage Architecture Report

> Executive Summary: An in-depth evaluation of serverless edge storage engines.

[TOC]

## 1. Introduction & Background
...

## 2. Core Architecture
...

### 2.1 Cloudflare Workers Runtime
...

### 2.2 D1 Hybrid Database Storage
...

## 3. Experimental Evaluation
...
````
- Inserting `[TOC]` automatically scans all `#` through `######` headings and builds an accessible `<nav class="markdown-toc">` with nested lists and smooth-scrolling deep anchor links.

### H.3 Academic References & Footnotes (`[^1]` & `^[inline]`)
**AI agents and LLMs are strongly encouraged to actively use footnotes** whenever citing research papers, quoting sources, referencing external GitHub repositories/tools, or adding supplementary annotations:

1. **Standard Footnotes (`[^1]` / `[^key]`)**:
   Use inline references like `[^1]` or `[^voko]` in sentences, and define them at the bottom of the article:
   ````md
   Modern multi-agent systems rely on secure process sandboxing[^1] and distributed channels[^2].

   ---

   ## 8. 參考資源與官方連結

   [^1]: **VOKO 運行時倉庫**：[https://github.com/laoyudashu/voko](https://github.com/laoyudashu/voko)
   [^2]: **Ranxy/laelia 協作平台**：[https://github.com/Ranxy/laelia](https://github.com/Ranxy/laelia)
   ````
2. **Inline Footnotes (`^[inline explanation]`)**:
   Use Pandoc/HackMD inline footnotes directly inside paragraphs:
   ````md
   Edge database storage^[Cloudflare D1 runs SQLite at the edge with automated read replication] ensures global sub-50ms latency.
   ````
   The renderer automatically numbers, extracts, and places them into the bottom footnotes list.
3. **Interactive Reader Experience**:
   - **Glassmorphic Hover Cards**: Readers hovering over footnote numbers see an instant glassmorphic popover preview without losing their reading spot.
   - **Smooth Bidirectional Jump**: Clicking jumps smoothly to the target definition, and clicking `↩` returns directly to the referring text passage.


## Editor Features and Operational Tips

The wiki also includes a browser-based Markdown editor. When helping a user author a note, these features are available:

- **Markdown toolbar**: headings, bold, italic, strikethrough, links, blockquotes, unordered/ordered/task lists, **Inline code**, fenced code blocks, horizontal rules, tables, image insertion, attachment upload, fullscreen editing, Undo / Redo, and AI formatting. Toolbar labels and inserted placeholders follow the selected interface language.
- **Image Insertion**: the toolbar image button opens a file picker. With R2 enabled, the image is uploaded and a Markdown image URL is inserted automatically. Without R2, an editable Markdown image placeholder is inserted.
- **888box Attachment Uploads**: the toolbar attachment button uploads videos, audio, documents, archives, and generic files to `box.david888.com`, falling back to `box.aiurl.tw` and then `box.glsoft.ai`. The editor inserts `<video>` for videos, `<audio>` for audio, and Markdown links for files. Images remain on the built-in R2 image upload flow.
- **ECharts**: put valid JSON chart options in an `echarts` fenced code block to render an interactive chart in the preview. Keep the fence language exactly `echarts`; malformed JSON cannot be rendered as a chart.

````md
```echarts
{
  "title": { "text": "Traffic sources" },
  "tooltip": { "trigger": "item" },
  "series": [{
    "type": "pie",
    "data": [
      { "value": 1048, "name": "Search" },
      { "value": 735, "name": "Direct" },
      { "value": 580, "name": "Referral" }
    ]
  }]
}
```
````

- **Undo / Redo** tracks typing, toolbar Markdown commands, image insertion, and pasted content. Use the toolbar or the normal `Ctrl/Cmd+Z`, `Ctrl/Cmd+Shift+Z`, and `Ctrl/Cmd+Y` shortcuts.
- **AI formatting** is available in both the top toolbar and the footer. It restructures Markdown while preserving the draft's meaning. AI Edit can rewrite a selected passage or the full note only after the user supplies an explicit instruction.
- **Footer Copy** is beside Markdown Export. It prefers rich HTML and includes Markdown/plain-text fallback for editors such as Notion and Jira, then shows a localized check animation after success.
- **Grouped view controls**: Preview, Layout, and Device are one footer group. Layout switches between side-by-side and stacked panes; Device switches between desktop and mobile preview. The editor defaults to desktop preview (`100%` width), and authors can toggle to mobile preview or stacked layouts anytime.
- **Share links**: links in rendered Markdown on `/share/...` pages open in a new tab with `noopener noreferrer`.
- **Startup tips**: the editor randomly chooses a bilingual tip from `static/data/editor-tips.json` and types it below the Stray Birds placeholder with the same typewriter animation. Future user-facing features that deserve a hint must add one object with `id`, `zh-TW`, and `en-US` fields, then update `README.md` and `CHANGELOG.md`.
- **Admin dashboard**: the route is configured by the runtime `SCN_ADMIN_PATH` binding. The dashboard supports URL/title search, Markdown full-text search, modified-date filters, sortable columns, pagination, URL/public/protected/Sitemap totals, and retained version counts. `views` is a legacy field and may not be available in current data.

## Auth Rules
- **Edit Password (`pw`)**: This is the edit lock. It protects editing.
- **View Password (`vpw`)**: This is the read/view lock. It protects reading and is stronger than the edit lock.
- If a note has `vpw`, readers must authenticate before reading the note/share page.
- If a note only has `pw`, the direct note page can still be readable to visitors, but editing remains locked.
- If only a View Lock exists, its password is the sole owner credential and grants edit access after authentication.
- If both locks exist, the View Lock is read-only and the Edit Lock is required to modify the note, change settings, change locks, restore history, or invoke AI editing.
- For a share page with both locks, a valid `vpw` can read the content but must not be treated as edit authorization.
- For `GET /api/<path>`, if either `pw` or `vpw` is set, provide a password through `Authorization: Bearer <password>` or `?pw=<password>`.
- For API reads, either valid password is sufficient to read protected content; API writes require the edit password or an edit-role session.
- For `POST /api/<path>`, `pw` and `vpw` can be used to set or update those locks as part of the save request.
- In the editor/browser flow, `POST /:path/pw` can also update locks with JSON `{ "passwd": "...", "type": "edit" }` or `{ "passwd": "...", "type": "view" }` after edit-session authentication.
- If you get a **401/403**, ask the user: "This page is protected, please provide the password."

## Troubleshooting
- **Error 1101**: A server-side exception occurred. I have added logging; check the returned JSON `msg` for the stack trace or error details.
- **500 on a very long article/context dump**: Treat this as a payload-size or backend-runtime risk, even if auth is correct. The pragmatic fallback is to publish a concise summary plus the original file path/URL instead of embedding the entire long source document.
- **Markdown with lots of quotes / backslashes / code fences keeps failing in curl**: Prefer `Content-Type: text/markdown` with `--data-binary @file.md`, or multipart `-F "file=@file.md"`, instead of wrapping the full markdown inside JSON.
- **I fetched a share page and only got full HTML**: Retry with `Accept: text/markdown`. For public reads, prefer `GET /share/<id>` or `GET /<path>` with that header instead of parsing rendered DOM output.
- **The URL is always the same / IP Restriction?**: No! The `url` field is the *permanent edit link* for that path. If you see the same URL, it means you successfully updated the same page. This is NOT an IP block. **Always check the `shareUrl` for the unique view link.**
- **Missing `shareUrl`**: Ensure you are looking at the `.data.shareUrl` field in the JSON response.
- **Need a slideshow link?**: If the page is slide-oriented, derive it from `shareUrl + '/present'`. For a specific slide, append a Reveal hash like `#/2`.

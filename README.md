# 888wiki

**A Notion-style wiki you can run in your own Cloudflare account.** Capture voice, files, and web pages; write in four formats; then publish with Seal-controlled release.

[![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/tbdavid2019/888wiki)

[Live site](https://wiki.david888.com) · [API](https://wiki.david888.com/api) · [Agent Skill](https://wiki.david888.com/.well-known/agent-skills/david888-wiki-publisher/SKILL.md)

## Capture voice, files, or web pages in one menu

The **+ New** menu moves content from wherever it starts into a note:

- **Live recording:** Record a thought, keep the audio player, and add a timestamped transcript.
- **Import audio (Transcript):** Get a faithful transcript with timestamps.
- **Import audio (Smart format):** Turn speech into organized sections with AI.
- **Import file:** Convert Markdown, Office documents, PDFs, spreadsheets, and more into a note. Supported document conversion runs in the browser; drag and drop also offers attachment upload when you want to keep the original file.
- **Import website:** Clip a public web page into clean Markdown, then insert or replace content or create a new note.

The same import choices can create Markdown notes or convert content into editable Block documents.

## Choose the right workspace for the idea

| Mode | Best for | What you get |
| --- | --- | --- |
| **Markdown** | Articles, research, and technical notes | Live preview, math, diagrams, citations, imports, search and replace, and flexible layouts. |
| **Block** | Structured pages and mixed media | Notion-style blocks, slash commands, drag-to-reorder, editable embeds, and direct exports. |
| **Canvas** | Maps, plans, and connected ideas | Eight kinds of thought cards, labeled relationships, media cards, undo/redo, and `.canvas` / PNG / SVG export. |
| **Whiteboard** | Sketches and visual explanations | Excalidraw drawing tools, read-only sharing, and PNG / SVG export. |

## Seal: publish on a schedule, or let a rule decide

Seal separates content passwords from release timing. Set a scheduled unlock, burn a note after a chosen number of views, release it after a missed check-in, or expire a link on a deadline. Ten presets cover One-Time Passwords (one view, one-hour expiry), Shared Secrets (one view, one-day expiry), Crypto Inheritance, Emergency Backup, Whistleblower disclosures, Product Launches, Birthday Gifts, Legal Holds, Scavenger Hunts, and Course Content. A preset configures release settings without changing the note body.

## Your writing and publishing workspace

- **AI writing:** Format, rewrite, and translate drafts; turn recordings into timestamped transcripts with Groq or Workers AI.
- **Publish and present:** Share public or password-protected notes, restore D1 history, discuss selected passages, and present content as books or slides.
- **Work offline:** Keep browser drafts in IndexedDB and sync pending changes when the connection returns.
- **Keep control of the stack:** One-click deploy to your Cloudflare account with KV, D1, R2, and a native MCP/REST API.

## Get started

- [Deploy and configure 888wiki](docs/INSTALLATION.md) · [繁體中文安裝指南](docs/INSTALLATION.zh-TW.md)
- [How to capture, write, publish, and use Seal](docs/USAGE.md) · [繁體中文使用指南](docs/USAGE.zh-TW.md)
- [Complete feature guide](docs/FEATURES.md) · [繁體中文功能詳情](docs/FEATURES.zh-TW.md)
- [繁體中文專案首頁](README.zh-TW.md) · [Changelog](CHANGELOG.md)

The installation guide lists required secrets, every optional parameter, and the defaults included in the deployment configuration.

## Project

- [Source code](https://github.com/tbdavid2019/888wiki)
- [Report an issue](https://github.com/tbdavid2019/888wiki/issues)
- License: AGPL-3.0

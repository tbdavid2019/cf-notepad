# 888wiki

**A self-hosted wiki and writing workspace with four ways to create, AI-assisted editing, and precise control over how every page is shared.**

Write a quick Markdown note, build a structured document with blocks, map ideas on a spatial canvas, or sketch on a freeform whiteboard. Publish to your own Cloudflare account when you are ready.

[![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/tbdavid2019/888wiki)

[Live site](https://wiki.david888.com) · [API](https://wiki.david888.com/api) · [Agent Skill](https://wiki.david888.com/.well-known/agent-skills/david888-wiki-publisher/SKILL.md)

## Four ways to create

| Mode | Best for | What it gives you |
| --- | --- | --- |
| **Markdown** | Articles, notes, technical writing | Live preview, math, diagrams, citations, import, search and replace, and flexible layouts. |
| **Block** | Structured pages and mixed media | Notion-style blocks, slash commands, drag-to-reorder, editable embeds, and direct exports. |
| **Canvas** | Maps, plans, and connected ideas | Moveable thought cards, labeled relationships, media cards, undo and redo, and `.canvas` / PNG / SVG export. |
| **Whiteboard** | Sketches and visual explanation | Freeform drawing with Excalidraw tools, read-only sharing, and PNG / SVG export. |

## Share on your terms with Seal

Seal controls **when and how a published note is released**. Choose a scheduled unlock, a view limit that burns the note, a check-in timer that releases it if you stop responding, or a retention deadline. Password protection remains a separate control. Ten scenario presets help configure common cases without changing the note content.

## More than a text editor

- **AI writing tools:** Format, rewrite, and translate drafts. Turn audio into timestamped transcripts when you configure Groq or Workers AI.
- **Rich publishing:** Share private or public notes, restore D1 history, discuss selected passages, and present content as books or slides.
- **Images and imports:** Upload images to R2, recognize text or tables in the browser, convert Office documents to Markdown, and attach larger files.
- **Offline writing:** Keep local drafts in IndexedDB and sync changes when the connection returns.
- **Agent access:** Use the native MCP endpoint, REST API, or published Agent Skill to connect compatible tools.

## Get started

- [Deploy and configure 888wiki](docs/INSTALLATION.md) · [繁體中文安裝指南](docs/INSTALLATION.zh-TW.md)
- [How to use the four editors and Seal](docs/USAGE.md) · [繁體中文使用指南](docs/USAGE.zh-TW.md)
- [Complete feature guide](docs/FEATURES.md) · [繁體中文功能詳情](docs/FEATURES.zh-TW.md)
- [繁體中文專案首頁](README.zh-TW.md) · [Changelog](CHANGELOG.md)

The Deploy button creates a repository copy in your GitHub account and sets up the Worker resources. The installation guide lists required secrets, every optional parameter, and the defaults already included in the deployment configuration.

## Project

- [Source code](https://github.com/tbdavid2019/888wiki)
- [Report an issue](https://github.com/tbdavid2019/888wiki/issues)
- License: MIT

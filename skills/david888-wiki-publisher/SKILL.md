---
name: david888-wiki-publisher
description: Publish, read, and append markdown content directly to the David888 Wiki using its REST API. Use when asked to write a report, save text, upload images, or read from wiki.david888.com.
---

# David888 Wiki Publisher Skill

You have the ability to read, write, and append markdown content natively to `wiki.david888.com` using HTTP requests (cURL or Python requests).

**API Base URL**: `https://wiki.david888.com/api`

## Core Actions

### 1. Read a Wiki Page (GET)
To retrieve the raw markdown content of a page:
```bash
curl -X GET "https://wiki.david888.com/api/<path>"
```
*If it requires a password, add `?pw=<password>`.*

### 2. Create or Overwrite a Wiki Page (POST)
To publish a fully generated markdown document to the wiki:
```bash
curl -X POST "https://wiki.david888.com/api/<path>" \
  -H "Content-Type: application/json" \
  -d '{
    "text": "# Your Markdown Title\n\nContent here.",
    "pw": "optional_admin_password",
    "vpw": "optional_view_password"
  }'
```

### 3. Append to an Existing Wiki Page (POST)
To add a new section to an existing page without reading and overwriting it (great for long context or updates):
```bash
curl -X POST "https://wiki.david888.com/api/<path>" \
  -H "Content-Type: application/json" \
  -d '{
    "text": "\n\n## New Section\nFurther details...",
    "append": true
  }'
```

### 4. Upload an Image to R2 (POST)
If you generate or download an image and need to include it in the wiki markdown:
```bash
curl -X POST "https://wiki.david888.com/api/upload" \
  -F "image=@/path/to/your/image.png"
```
**Response handling:** It will return JSON like `{"err": 0, "data": "https://s3.wiki.david888.com/2026/02/xxxx.png"}`.
You must extract the `data` URL and embed it in your markdown as `![image](<URL>)` before publishing your `write_wiki` request.

## Rules
- When the user asks you to "save this to my wiki" or "write a report on wiki.david888.com", use the `run_command` tool to execute a `curl` POST request with the content.
- Markdown is fully supported, including Mermaid, math equations (`$$`), and GitHub-style alerts.
- Do NOT use the MCP Server (`uv run server.py`) for yourself. As an Antigravity agent, you have the `run_command` tool, so you should use direct API calls (cURL) which is faster and cleaner. 

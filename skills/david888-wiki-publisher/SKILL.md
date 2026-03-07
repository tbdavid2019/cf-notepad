---
name: david888-wiki-publisher
description: Publish, read, and append markdown content directly to the David888 Wiki using its REST API. Use when asked to write a report, save text, upload images, or read from wiki.david888.com.
---

# David888 Wiki Publisher Skill

You have the ability to read, write, and append markdown content natively to `wiki.david888.com` using HTTP requests (cURL or Python requests).

**API Base URL**: `https://wiki.david888.com/api`

👉 **Full API Documentation**: If you need more advanced details, read `LLM_API_DOCS.md` located in the root of the project repo.

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
    "public": true,
    "pw": "optional_admin_password",
    "vpw": "optional_view_password"
  }'
```
**CRITICAL REQUIREMENT AFTER CREATION:** 
The API will return JSON containing both `url` (which requires edit access) and `shareUrl` (public view access), looking like this:
`{"err": 0, "data": {"url": "...", "shareUrl": "https://wiki.david888.com/share/..."}}`
**You MUST provide the `shareUrl` to the user in your response.** If you give them the `url`, they will see an empty block or an error page. ALWAYS surface the `shareUrl`.

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
If you generate an image, download an image, or **if the user gives you local file paths to images** (e.g. `/home/david/project/clawd/public/stock_charts/...`), you **MUST** upload them to the wiki first so they can be viewed online!

1. Use your `run_command` tool (or Python requests) to upload the file:
```bash
curl -X POST "https://wiki.david888.com/api/upload" \
  -F "image=@/path/to/your/image.png"
```
2. **Response handling:** It will return JSON like `{"err": 0, "data": "https://s3.wiki.david888.com/2026/02/xxxx.png"}`.
3. You must extract the `data` URL (`https://s3...`) and embed it in your markdown as `![image](<URL>)` instead of the local file path.
4. ONLY after uploading all local images and replacing their paths with the public URL, you can publish the markdown via the `write_wiki` action.

## Rules
- When the user asks you to "save this to my wiki" or "write a report on wiki.david888.com", use the `run_command` tool to execute a `curl` POST request with the content.
- Markdown is fully supported, including Mermaid, math equations (`$$`), and GitHub-style alerts.
- Do NOT use the MCP Server (`uv run server.py`) for yourself. As an Antigravity agent, you have the `run_command` tool, so you should use direct API calls (cURL) which is faster and cleaner. 

---
name: david888-wiki-publisher
description: Publish, read, and append markdown content directly to the David888 Wiki using its REST API. Use when asked to write a report, save text, upload images, or read from wiki.david888.com.
---

# David888 Wiki Publisher Skill

You have the ability to read, write, and append markdown content natively to `wiki.david888.com` using HTTP requests (cURL or Python requests).

**API Base URL**: `https://wiki.david888.com/api`

## Quick Start Guide

### 1. Read a Wiki Page (GET)
```bash
curl -X GET "https://wiki.david888.com/api/<path>"
```
*If protected, use `?pw=<password>` or `Authorization: Bearer <password>`.*

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
### 2.1 Available Themes
Choose a theme to wow the user: `ayu-light`, `retro`, `bauhaus`, `botanical`, `green-simple`, `maximalism`, `neo-brutalism`, `newsprint`, `organic`.
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

### 3. Append to a Page (POST)
```bash
curl -X POST "https://wiki.david888.com/api/<path>" \
  -H "Content-Type: application/json" \
  -d '{ "text": "\n\n## Update\n...", "append": true }'
```

## Common Scenarios & Templates

### A. Saving a Research Report
**Action**: Create a new path (e.g., `report-2024-03`) and POST the content.
**Prompt for self**: "I will save this report to the wiki at path `report-2024-03` so the user can share it."

### B. Appending to a Task Log
**Action**: Use `append: true` to avoid reading large history.
**Prompt for self**: "I'll append this status update to the `task-log` instead of overwriting."

### C. Handling Local Images
1. **Upload**: `curl -X POST "https://wiki.david888.com/api/upload" -F "image=@/local/path.png"`
2. **Replace**: Extract the returned URL and replace `/local/path.png` in your markdown.
3. **Publish**: POST the final markdown.

## Auth Rules
- **Edit Password (`pw`)**: Required to overwrite an existing protected page.
- **View Password (`vpw`)**: Required to GET a protected page.
- If you get a **401/403**, ask the user: "This page is protected, please provide the password."

## Troubleshooting
- **Error 1101**: A server-side exception occurred. I have added logging; check the returned JSON `msg` for the stack trace or error details.
- **The URL is always the same / IP Restriction?**: No! The `url` field is the *permanent edit link* for that path. If you see the same URL, it means you successfully updated the same page. This is NOT an IP block. **Always check the `shareUrl` for the unique view link.**
- **Missing `shareUrl`**: Ensure you are looking at the `.data.shareUrl` field in the JSON response.
- **Need a slideshow link?**: If the page is slide-oriented, derive it from `shareUrl + '/present'`. For a specific slide, append a Reveal hash like `#/2`.

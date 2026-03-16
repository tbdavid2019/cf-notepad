# LLM API Documentation (wiki.david888.com)

This document explains how AI agents (like OpenClaw, n8n, ChatGPT) or external scripts can programmatically interact directly with the CF-Notepad (david888 wiki) server.

## Overview
The wiki supports **reading**, **writing**, **appending**, and **image uploading** via simple HTTP requests.

The maximum text length for a single wiki page is **25 MB** (over 10 million words), which means you do **not** need to split your responses unless specifically configured to do so. You can safely overwrite or append massive texts to a single post path.

### 1. Reading Content (`GET /api/:path`)

Retrieve the content of any post.

*   **URL Endpoint:** `GET /api/<path>` (e.g., `/api/tsladavid888123`)
*   **Returns:** Raw markdown text (`text/markdown`).

**Parameters / Auth:**
If the post is password-protected, provide the password using **one** of the following methods:
*   `Authorization: Bearer <password>` header
*   `?pw=<password>` query parameter

**JSON Format (Optional):**
If you need view counts or update times, append `?format=json`.
*   Returns: `{"err": 0, "data": {"content": "...", "metadata": {"views": ...}}}`

### 2. Writing / Appending Content (`POST /api/:path`)

Create a new post, overwrite an existing post, or append text to the bottom.

*   **URL Endpoint:** `POST /api/<path>`
*   **Headers:** `Content-Type: application/json`
*   **Returns:** `{"err": 0, "msg": "Saved successfully", "data": {"url": "https://wiki.david888.com/...", "shareUrl": "https://wiki.david888.com/share/..."}}`

**CRITICAL INSTRUCTION FOR LLMS:**
When you successfully write or create a post via this API, it will return both `url` (the edit link) and `shareUrl` (the public read-only link). **You MUST provide the `shareUrl`** to the human user so they can safely view the content without needing edit permissions. Do not give them `url`.

**JSON Body Specifications:**

| Field | Type | Description |
| :--- | :--- | :--- |
| `text` | string | The markdown content to write. |
| `append` | boolean | (Optional) Defaults to `false`. If `true`, the `text` is appended to the bottom of the existing post content instead of erasing the whole file. |
| `pw` | string | (Optional) Sets or verifies the **edit password**. Required if the existing post has an edit password. |
| `vpw` | string | (Optional) Sets the **view password**. Only people (or LLMs) with this password can GET the page. |
| `public` | boolean | (Optional) Defaults to `true` unconditionally for API creations. Set to `false` to keep it private. (`share` is an accepted alias). |
| `theme` | string | (Optional) Choose a visual theme: `ayu-light`, `retro`, `bauhaus`, `botanical`, `green-simple`, `maximalism`, `neo-brutalism`, `newsprint`, `organic`. |

**Important Note for Appending Context:**
If you only need to add an update section, DO NOT read the whole page and overwrite. Simply send `{"text": "\n\n## Update\n...", "append": true}` to automatically stick it at the bottom.

### 3. Uploading Images (`POST /api/upload`)

If you generate an image, download an image, or **if the user gives you local file paths to images** (e.g., `/home/user/images/chart.png`), you **MUST** use this native R2 upload endpoint to host the image online before embedding it.

*   **URL Endpoint:** `POST /api/upload`
*   **Headers:** `Content-Type: multipart/form-data`
*   **Form Data:**
    *   `image` (or `file`): The binary file payload of the image (PNG/JPG/WEBP).

*   **Returns:**
    *   `{"err": 0, "data": "https://s3.wiki.david888.com/2026/02/xxxx.png"}`

**Workflow for Document Generation with Images:**
1. For EVERY local image path you are given, POST the image binary to `/api/upload`.
2. Extract the `data` URL string (`https://s3...`) from the response.
3. Replace the local file path in your text with the public URL: `![Generated Image](https://s3.wiki.david888.com/.../xxxx.png)`.
4. ONLY after uploading all local images and replacing their paths with the public URLs, call `POST /api/:path` with the final markdown text.

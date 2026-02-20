# 🌐 David888 Wiki MCP Service (Zero-Install)

This is an awesome **Model Context Protocol (MCP)** endpoint that allows any AI assistant (like Claude Desktop, Cursor, or OpenClaw) to natively interact with `wiki.david888.com` as a remote service!

### 🚀 The Magic: Zero Installation Required
LLMs and external tools **do not** need to clone this repository, download scripts, or maintain dependencies. 

Since `uv` natively supports executing remote Python scripts safely from URLs (PEP 723), all an AI agent needs to do is run:
```bash
uv run https://raw.githubusercontent.com/tbdavid2019/cf-notepad/main/mcp/server.py
```

That's it! `uv` will instantly fetch the logic, build an invisible temporary environment, and connect the LLM to your Wiki. No `package.json`, no `pip install`. It just works.

---

## 🔌 Connecting Al Assistants to the Wiki

Here is exactly what to paste into various AI tools so they can use your Wiki as their brain / publishing platform. You only need `uv` installed on the host machine.

### 1. Cursor
1. Go to **Settings > Features > MCP**.
2. Click **+ Add new MCP server**.
3. Set the Type to **command**.
4. Set the Name to **david888-wiki**.
5. Set the Command to exactly: 
   `uv run https://raw.githubusercontent.com/tbdavid2019/cf-notepad/main/mcp/server.py`

### 2. Claude Desktop
Edit your `claude_desktop_config.json` file:
*(Mac: `~/Library/Application Support/Claude/claude_desktop_config.json`)*
*(Windows: `%APPDATA%\Claude\claude_desktop_config.json`)*

```json
{
  "mcpServers": {
    "david888-wiki": {
      "command": "uv",
      "args": [
        "run",
        "https://raw.githubusercontent.com/tbdavid2019/cf-notepad/main/mcp/server.py"
      ]
    }
  }
}
```

### 3. OpenClaw / Custom Agents
For an autonomous agent written in Node.js, Python, or Go, simply spawn the client process pointing to the URL:
```bash
uv run https://raw.githubusercontent.com/tbdavid2019/cf-notepad/main/mcp/server.py
```

---

## 🛠️ Built-in AI Tools (Capabilities)
Once connected, the AI automatically gains the following powers on `wiki.david888.com`:

1. **`read_wiki(path, password)`**: It can read massive context docs or fetch existing reports.
2. **`write_wiki(path, text, password, new_view_password)`**: It can generate full markdown articles, including images uploaded to R2, and publish them to a specific URL path.
3. **`append_wiki(path, text, password)`**: It can continuously stream/append updates to the bottom of long, running research pages without pulling down the whole text.

*Note: If developers wish to fork this and point the MCP to a different Cloudflare Notepad backend, they can pass the `WIKI_BASE_URL` environment variable to the `uv` command.*

## Why

Currently, LLM agents (like ChatGPT or Claude) and generic web crawlers fail to read the content of shared notes on the platform. The notes are stored as raw markdown in a hidden `<textarea>` and rendered dynamically into a `div` via client-side JavaScript. Since bots typically do not execute JS and often skip `<textarea>` inputs during text extraction, they perceive these pages as blank. Additionally, some bots ping URLs with a `HEAD` request first, but because the Cloudflare Worker implicitly serves the HTML body even for `HEAD`, it triggers a 500 Internal Server Error, causing bots to abort scraping entirely.

## What Changes

- Intercept `HEAD` HTTP requests globally in the Cloudflare Fetch listener to return an empty body, avoiding the Cloudflare 500 Error exception.
- Add an invisible `<article>` tag to the base HTML template that duplicates the raw markdown, enabling DOM-parsing bots to extract the text without breaking the visual interface for human users.

## Capabilities

### New Capabilities
- `bot-scraping-support`: Ensures the platform elegantly supports unauthenticated generic bot crawlers, web scrapers, and AI indexing agents.

### Modified Capabilities
<!-- No requirement changes to existing specs. -->

## Impact

- **Cloudflare Worker Core (`src/index.js`)**: Modifies the global `fetch` event listener to gracefully adapt `HEAD` method responses.
- **Frontend Template (`src/templates/base.js`)**: Modifies the HTML string structure slightly, marginally inflating byte size per page load.
- No impact on existing authentication or user behavior flows.

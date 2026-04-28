# Changelog

## [Unreleased]
### Added
- **LLM/Crawler Support (Share URL Optimization)**
  - Intercepts `HEAD` HTTP requests globally to safely return HTTP 200 (with an empty body), preventing Cloudflare Workers from throwing `500 Internal Server Errors` when bots probe the site.
  - Injects a visually hidden, SEO-friendly `<article>` element containing raw markdown content into the base template. This resolves the issue where Client-Side Rendered (CSR) markdown inside `<textarea>` is completely ignored by bots (like ChatGPT-User, ClaudeBot, and generic URL unfurlers) that do not execute JavaScript.

- **Slidev-style Presentation Mode (Reveal.js Integration)** 📽️
  - Added a "Present" button to enter a fullscreen, interactive slideshow mode.
  - Supports Markdown slide splitting using the standard `---` separator (Slidev/Marp style).
  - Powered by Reveal.js with smart lazy loading (loads assets only on demand).
  - Seamlessly works in both Edit mode and Share mode.

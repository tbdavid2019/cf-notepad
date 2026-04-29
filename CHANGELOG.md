# Changelog

## [Unreleased]
### Added
- **Dedicated Presentation Share Entry**
  - Added a dedicated presentation route at `/share/:md5/present` so shared notes can open directly in slideshow mode.
  - Presentation links now preserve Reveal slide hash deep-links, allowing links such as `/share/<id>/present#/24` to open a targeted slide.
  - Password-protected shared notes preserve the requested presentation destination and return to the same slide after successful authentication.
  - Added a presentation-link copy action alongside the existing shared-link copy action in the editor footer.
  - Updated Skill and MCP guidance so AI clients can surface presentation links derived from `shareUrl`.

- **LLM/Crawler Support (Share URL Optimization)**
  - Intercepts `HEAD` HTTP requests globally to safely return HTTP 200 (with an empty body), preventing Cloudflare Workers from throwing `500 Internal Server Errors` when bots probe the site.
  - Injects a visually hidden, SEO-friendly `<article>` element containing raw markdown content into the base template. This resolves the issue where Client-Side Rendered (CSR) markdown inside `<textarea>` is completely ignored by bots (like ChatGPT-User, ClaudeBot, and generic URL unfurlers) that do not execute JavaScript.

- **Slidev-style Presentation Mode (Reveal.js Integration)** 📽️
  - Added a "Present" button to enter a fullscreen, interactive slideshow mode.
  - Supports Markdown slide splitting using the standard `---` separator (Slidev/Marp style).
  - Powered by Reveal.js with smart lazy loading (loads assets only on demand).
  - Seamlessly works in both Edit mode and Share mode.

- **Slidev-Lite Enhancement (Version 2.0)** 🚀
  - **Layouts**: Added support for `::left::` and `::right::` split-screen layouts.
  - **Click Animations**: Support for `{v-click}` syntax for interactive slide elements.
  - **Premium Aesthetics**: Integrated Inter font, dark theme optimization, and enhanced code block styling.
  - **UX Polish**: Switched to fade transitions and top-left alignment for a more professional feel.

# Changelog

## [Unreleased]
### Added
- **Share Metadata + Site Icon Polish**
  - Added server-rendered Open Graph and Twitter card metadata for shared notes so Slack and other unfurlers can read stable titles and descriptions without relying on client-side rendering.
  - Added a dedicated `/icon.svg` site icon route and switched page head metadata to use the repo-provided notepad icon for favicon and social previews.
  - Added note-title and note-description extraction helpers so shared-note metadata is generated consistently from note content on the server side.

- **Share Theme Consistency + Font Toggle**
  - Added a share-page `Maple Mono` on/off toggle next to the `返回編輯` button, backed by localStorage so each browser can keep its own preference.
  - Reused the bundled `static/fonts/MapleMonoNormal-Medium.woff2` asset as the optional share font instead of duplicating another copy.
  - Standardized share-page body typography to the `tokyo-night` baseline (`16px` body size, `1.8` line-height) so theme switches no longer visibly shrink or enlarge paragraph text.
  - Standardized share-page heading and inline-code sizing to the `tokyo-night` scale so themes like `newsprint` no longer render noticeably smaller than dark themes.

- **Theme Table Color Fixes**
  - Fixed dark-theme table body colors in `tokyo-night` so rows no longer fall back to white backgrounds.
  - Fixed dark-theme table body colors in `kanagawa` so rows no longer fall back to white backgrounds.
  - Fixed `terminal` table body rows and cells so the terminal theme keeps a dark background instead of leaking the base markdown table white fill.
  - Fixed table header backgrounds for `playful-geometric`, `organic`, `retro`, `botanical`, `bauhaus`, `maximalism`, and `terminal`/other affected themes by explicitly styling `thead th`.

- **Theme Table Header Contrast Refresh**
  - Strengthened table header contrast for the `tokyo-night` and `kanagawa` preview themes with clearer header backgrounds, brighter label color, and stronger separation from table rows.
  - Added a small shared table-header emphasis layer in the base template so low-contrast headers remain more legible across themes.

- **Editor Font + Dark Preview Themes**
  - Added bundled `Maple Mono` as the default font for both the editor pane and preview pane.
  - Added two new preview themes inspired by popular Neovim colorschemes: `tokyo-night` and `kanagawa`.
  - Switched the default preview theme fallback from `github-light` to `tokyo-night` for newly created or unthemed notes.
  - Removed fixed preview content widths from bundled themes so split-view previews can fully use available space.
  - Added a footer `Width` selector with persistent browser-side preference (`Full`, `960`, `1200`, `1440`) for quick preview width control.

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

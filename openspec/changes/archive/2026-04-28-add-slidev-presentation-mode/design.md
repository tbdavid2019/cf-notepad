## Context

`cf-notepad` is a Markdown-based notepad application running on Cloudflare Workers. It uses client-side rendering with the `unified` ecosystem. Currently, there is no way to present notes as slides.

## Goals / Non-Goals

**Goals:**
- Implement a "Present" mode that transforms Markdown into a Slidev-like presentation.
- Use `---` as the slide separator.
- Maintain the lightweight nature of the app by loading presentation assets on demand.
- Support basic Slidev-style layouts via Frontmatter/Metadata.

**Non-Goals:**
- Implementing a full-blown Slidev engine (Vue-based build system).
- Supporting complex Slidev plugins or themes that require Node.js.
- Offline presentation support.

## Decisions

- **Engine Selection**: **Reveal.js** will be used as the presentation engine. It is mature, supports Markdown, and can be easily loaded via CDN at runtime.
- **UI Integration**: A "Present" button will be added to the footer. When clicked, it will trigger a client-side script to parse the current content and initialize Reveal.js.
- **Overlay Approach**: The presentation will occur in a `fixed` position `div` with `z-index: 10000`, covering the entire viewport. This prevents UI conflicts with the split-pane editor.
- **Asset Loading**: Reveal.js JS and CSS will be injected into the document only when the user first clicks "Present".
- **Parsing Logic**: A regex-based splitter will be used to divide the content. Simple frontmatter (YAML) at the top of slides will be used to determine layouts.

## Risks / Trade-offs

- **CSS Scoping**: Reveal.js styles might leak into the main application. We will use specific container IDs and scoped selectors where possible.
- **Complexity**: Adding a presentation layer increases the frontend code complexity. We will keep the implementation modular within `base.js`.
- **Latency**: Loading Reveal.js from CDN might introduce a slight delay the first time "Present" is clicked.

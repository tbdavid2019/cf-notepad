## Context

LLM agents (e.g., Claude, ChatGPT) and generic bots often scan website content. The `cf-notepad` share pages currently rely entirely on client-side JS (`marked.js`/`unified`) to render markdown stored in a `<textarea>`. Since bots generally do not execute scripts and tend to ignore `<textarea>` nodes, they extract zero text from the page. Furthermore, Cloudflare Workers strictly forbid sending an HTML body with a `HEAD` request (often used by bots to probe), resulting in a `500 Internal Server Error`, breaking the crawl.

## Goals / Non-Goals

**Goals:**
- Ensure share pages (`/share/:md5`) return 200 OK for `HEAD` requests.
- Provide a bot-readable plaintext version of the markdown document in the HTML payload without affecting human users.

**Non-Goals:**
- We are NOT implementing Server-Side Rendering (SSR) for markdown. Bringing `remark` or `marked` to the worker would increase bundle size unnecessarily.
- We are NOT building specialized API endpoints strictly for bots (we solve this via standard HTML).

## Decisions

- **Global HEAD Interceptor in `fetch` Event:** 
  Instead of mutating every `router.get` endpoint or `returnPage` helper individually, we will intercept the response object directly in the `addEventListener('fetch')` block. If `method === 'HEAD'`, we clone the response headers and strip the body. This provides a bulletproof guarantee that no `HEAD` request ever throws a 500 error.
- **Using `<article style="display:none">`:**
  To serve text to bots, we'll emit the raw markdown inside `<article style="display:none;" id="bot-accessible-content">${content}</article>`. We chose `<article>` over `<noscript>` because some modern bots still strip `<noscript>` tags during parsing, while `<article>` is a universally recognized semantic content tag that bots heavily prioritize.

## Risks / Trade-offs

- **Risk:** HTML payload size increases.
  **Mitigation:** The raw markdown is duplicated (once in textarea, once in article). For typical notes, this is negligible (adding ~1-5KB). If a note is massive, it might add a bit of bandwidth overhead, but avoiding SSR is a worthwhile trade-off here.
- **Risk:** Raw markdown escaping.
  **Mitigation:** The markdown is currently injected raw into `<textarea>`. Moving it into `<article>` is similarly safe, though we rely on DomPurify strictly on the client-side for rendering. Bots will just see raw markdown.

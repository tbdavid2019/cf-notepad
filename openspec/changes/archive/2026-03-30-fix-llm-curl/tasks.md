## 1. Routing / Cloudflare Worker Fixes

- [x] 1.1 Update `src/index.js` `fetch` event listener to intercept `HEAD` requests and strip the response body before resolving, returning standard headers and an HTTP 200.

## 2. Platform HTML Template Changes

- [x] 2.1 Update `src/templates/base.js` to include `<article style="display:none;" id="bot-accessible-content">${content}</article>` immediately before the `<textarea id="contents">` element.

## 3. Verification

- [x] 3.1 Verify a `HEAD` request to a note path returns `HTTP/2 200` without throwing a 500 error in Cloudflare.
- [x] 3.2 Verify a `GET` request returns HTML that successfully embeds the markdown inside the `<article>` tag.

## ADDED Requirements

### Requirement: Support HEAD Requests
The system MUST handle `HEAD` HTTP requests globally without attempting to send a response body, preventing Cloudflare Worker 500 errors.

#### Scenario: Bot sends HEAD request
- **WHEN** a bot sends a `HEAD` request to a valid share URL
- **THEN** the server MUST return an HTTP 200 response with headers intact but with a null body

### Requirement: Expose content to DOM parsers
The system MUST include the raw markdown content in a semantic HTML tag that is accessible to standard web scrapers and LLM agents that do not execute JavaScript.

#### Scenario: Bot parses HTML
- **WHEN** a bot sends a `GET` request to a share URL
- **THEN** the returned HTML MUST contain the raw markdown content inside a hidden `<article>` tag

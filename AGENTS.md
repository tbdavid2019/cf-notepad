# AGENTS.md — AI Agent Guidelines & Workflow Rules

This document outlines the mandatory operational guidelines, coding standards, and lifecycle requirements for all AI coding assistants (Google Antigravity, Claude Code, Cursor, Copilot, Codex, etc.) working on the **cf-notepad** (`wiki.david888.com`) repository.

---

## 🚨 Top Priority Rules (核心強制規則)

### 1. 📝 Automatic Documentation Sync (文檔自動同步 — 嚴禁等待使用者提醒)
Whenever you implement, modify, fix, or refactor ANY feature, UI element, API endpoint, or tool:
- **`CHANGELOG.md` MUST be updated immediately**:
  - Add release bullets under the current date `## [YYYY-MM-DD]`.
  - Clearly describe what was added/changed, including key options and technical details.
- **`README.md` MUST be updated immediately**:
  - Update **BOTH** the Traditional Chinese (`🇹🇼`) and English (`🇺🇸`) feature lists and documentation sections.
- **Editor Tips & Skills**:
  - If new user features/tips are introduced, update `static/data/editor-tips.json` (bilingual `zh-TW` / `en-US`).
  - Run `node scripts/generate-agent-skill.mjs` to keep `.agent/skills/` synchronized with the codebase.
- **Never wait for the user to say "did you update readme/changelog" — do it automatically in the same turn.**

---

## 🧪 2. Testing & Verification Standard (測試驗證標準)

Before considering any task complete:
1. **Run Full Test Suite**:
   ```bash
   npm test
   ```
   All tests (currently >315 tests) MUST pass with `0` failures and `0` errors.
2. **Template String & Client Script Escaping**:
   - `test/share-presentation-ui.test.mjs` verifies that every `<script>` tag rendered across all page configurations can be parsed by `new Function(code)` without syntax errors.
   - When generating client-side JavaScript inside server-side template literals (e.g. `src/templates/base.js`), always ensure backslashes in regexes (`\\/`, `\\s`) and newlines (`\\n`) are properly escaped.
3. **No Console Pollution**:
   - Do not leave `console.log` debug statements in production templates or modules.

---

## 🚀 3. Deployment & Git Workflow (部署與 Git 規範)

1. **Deploying to Cloudflare Workers**:
   ```bash
   npm run deploy
   ```
   - Triggers `predeploy` (`prepare:skill-doc` + `build:block-editor`) and executes `wrangler deploy`.
   - Always verify the returned `Current Version ID` and confirm live deployment on `https://wiki.david888.com`.
2. **Git Commit & Push**:
   - Use standard Conventional Commits:
     - `feat(...)`: New features (e.g., `feat(share): add citation generator`)
     - `fix(...)`: Bug fixes (e.g., `fix(editor): resolve formula escape issue`)
     - `refactor(...)`: Code refactoring without behavior change
     - `docs(...)`: Documentation updates
     - `test(...)`: Adding or modifying tests
   - Always push clean commits to `origin/main`:
     ```bash
     git add .
     git commit -m "feat/fix(...): description"
     git push
     ```
   - Never commit Syncthing conflict files (`*.sync-conflict-*`) or scratch scripts.

---

## 🏗️ 4. Project Architecture & Conventions (專案架構與規範)

- **Platform**: Cloudflare Workers + KV + D1 (`cloud-notepad-history`) + R2 (`wikidavid888`).
- **Storage Driver (`SCN_STORAGE_DRIVER`)**: Default `auto` (hybrid D1 with seamless KV fallback and migration).
- **Markdown Pipeline**:
  - Client-side: Unified + Remark (GFM, Math, Breaks, Alerts, Pandoc Citations) + Rehype (KaTeX) + DOMPurify + extensions (`static/js/markdown-extensions.mjs`).
  - Serverless: Stateless API in `src/markdown-processor.mjs` and native Worker MCP server in `src/mcp_server.mjs` (`/mcp`).
- **Bilingual & Theming**:
  - UI labels support Traditional Chinese (`zh-TW`) and English (`en-US`).
  - All 20 CSS themes (in `src/theme_data.js` and `src/styles/base.css.js`) must be respected when adding new UI elements.
  - Interactive popovers and modals must support both Dark mode and Light mode with proper backdrop blur and responsive boundaries.

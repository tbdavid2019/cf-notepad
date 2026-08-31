# 全站下拉選單密度與互動表面 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 統一 Edit、Share、Block Edit 的下拉選單密度與 hover/focus 表面，修復 rich item 被壓扁及分組背景不對齊。

**Architecture:** 保留現有 `common.js` HTML 結構與 floating portal 行為，只在共用 `base.css.js` 修正 flex sizing、spacing、surface clipping 與主題 token。以 CSS source regression tests 鎖定直接項目與 group card 兩種拓撲。

**Tech Stack:** Cloudflare Workers、原生 CSS-in-JS template、Node test runner、JSDOM、Chrome DevTools。

---

### Task 1: 鎖定所有選單的視覺契約

**Files:**
- Modify: `test/export-and-theme-dropdown.test.mjs`
- Modify: `src/styles/base.css.js`

- [x] **Step 1: Write the failing test** — 驗證 menu padding、group card full-bleed surface、`height: auto`、flex no-shrink、rich item spacing，以及 theme/width 共用 hover token。
- [x] **Step 2: Run test to verify it fails** — `node --test test/export-and-theme-dropdown.test.mjs`，在實作前因新 CSS 契約不存在而失敗。
- [x] **Step 3: Implement the minimal CSS** — 調整共用 dropdown selectors，讓 direct item 與 group-card item 都使用相同尺寸規則。
- [x] **Step 4: Run test to verify it passes** — `node --test test/export-and-theme-dropdown.test.mjs`，應為 11/11 passing。

### Task 2: 文件與生成物同步

**Files:**
- Modify: `README.md`
- Modify: `CHANGELOG.md`
- Run: `node scripts/generate-agent-skill.mjs`

- [x] **Step 1: Update bilingual documentation** — 在中英文功能說明加入全站 dropdown density、完整 hover/focus 與長選單 viewport 邊界修正。
- [x] **Step 2: Add current-date changelog entry** — 記錄 Web Awesome fixed-height/flex-shrink root cause 與 Edit/Share/Block Edit coverage。
- [x] **Step 3: Regenerate skill docs** — 執行 `node scripts/generate-agent-skill.mjs` 並確認沒有非預期修改。

### Task 3: Full verification and deployment

**Files:**
- Verify: `src/styles/base.css.js`, `test/export-and-theme-dropdown.test.mjs`, `README.md`, `CHANGELOG.md`

- [x] **Step 1: Run full tests** — `npm test`，預期 0 failures、0 errors。
- [x] **Step 2: Run UI detector and diff checks** — 執行 impeccable layout detector 與 `git diff --check`，只接受已解釋的既有 detector findings。
- [x] **Step 3: Verify representative browser states** — 用 Chrome DevTools 檢查 Edit 的 Export/Share、Share 的 group card、Block Edit 的 Export，確認 rich subtitle 不裁切且 hover 對齊。
- [ ] **Step 4: Commit and push** — 使用 Conventional Commit，push 至 `origin/main`。
- [ ] **Step 5: Deploy Worker** — `npm run deploy`，記錄 `Current Version ID`。
- [ ] **Step 6: Verify production** — `curl -fsSIL https://wiki.david888.com/new/markdown` 並以 Chrome DevTools 重載線上頁面確認 CSS 生效。

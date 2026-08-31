# Share Menu Copy Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remove repeated action words from the Traditional Chinese share-menu subtitles while preserving every menu title and action.

**Architecture:** Keep the existing server-rendered footer template and event IDs unchanged. Update only the explanatory `<small>` text for the three published-share copy buttons, and add render-level assertions that verify the title/subtitle hierarchy in Traditional Chinese and the existing English copy.

**Tech Stack:** Node.js ESM, `node:test`, JSDOM, Cloudflare Workers templates, npm test/deploy scripts.

---

### Task 1: Lock the intended copy hierarchy with a regression test

**Files:**
- Modify: `test/export-and-theme-dropdown.test.mjs`
- Test: `src/templates/common.js` via `FOOTER`

- [ ] **Step 1: Write the failing test**

Add a test that renders the published Traditional Chinese footer and asserts that each copy action keeps its title but uses a non-redundant subtitle:

```js
test('published share copy actions keep titles and avoid repeating the copy verb in subtitles', () => {
    const html = FOOTER({
        lang: 'zh-TW',
        isEdit: true,
        share: true,
        shareId: 'abc123',
    })
    const doc = new JSDOM(html).window.document

    assert.equal(doc.querySelector('#copy-share-btn strong').textContent, '複製分享連結')
    assert.equal(doc.querySelector('#copy-share-btn small').textContent, '閱讀頁面網址')
    assert.equal(doc.querySelector('#copy-present-share-btn strong').textContent, '複製簡報連結')
    assert.equal(doc.querySelector('#copy-present-share-btn small').textContent, '簡報播放網址')
    assert.equal(doc.querySelector('#copy-book-share-btn strong').textContent, '複製書本連結')
    assert.equal(doc.querySelector('#copy-book-share-btn small').textContent, '書本閱讀網址')

    const englishDoc = new JSDOM(FOOTER({
        lang: 'en-US',
        isEdit: true,
        share: true,
        shareId: 'abc123',
    })).window.document
    assert.equal(englishDoc.querySelector('#copy-share-btn small').textContent, 'Copy share URL')
})
```

- [ ] **Step 2: Run the focused test and verify it fails for the current duplicated subtitles**

Run: `node --test test/export-and-theme-dropdown.test.mjs`

Expected: the new test fails because the current Traditional Chinese subtitles still begin with `複製`.

### Task 2: Apply the minimal template and documentation update

**Files:**
- Modify: `src/templates/common.js:537-551`
- Modify: `CHANGELOG.md` under `## [2026-08-31]`
- Modify: `README.md` in both Traditional Chinese and English feature sections

- [ ] **Step 1: Replace only the redundant Traditional Chinese subtitles**

Use these exact values while leaving titles, IDs, event wiring, and English text unchanged:

```js
<small>${lang === 'zh-TW' ? '閱讀頁面網址' : 'Copy share URL'}</small>
<small>${lang === 'zh-TW' ? '簡報播放網址' : 'Copy presentation URL'}</small>
<small>${lang === 'zh-TW' ? '書本閱讀網址' : 'Copy book mode URL'}</small>
```

- [ ] **Step 2: Document the copy cleanup in both project languages**

Add a dated changelog bullet and update the existing Card-Grouped Share & Publish Menu descriptions so they state that subtitles explain the destination without repeating the title’s copy action.

### Task 3: Verify, synchronize generated skill docs, commit, and deploy

**Files:**
- Generate/update: `.agent/skills/` through `node scripts/generate-agent-skill.mjs`

- [ ] **Step 1: Run the focused regression test**

Run: `node --test test/export-and-theme-dropdown.test.mjs`

Expected: all tests in the file pass, including the new title/subtitle assertions.

- [ ] **Step 2: Run the required generated-doc synchronization**

Run: `node scripts/generate-agent-skill.mjs`

Expected: the generated agent skill reflects the updated bilingual documentation.

- [ ] **Step 3: Run the full test suite**

Run: `npm test`

Expected: exit code 0, with 0 failures and 0 errors.

- [ ] **Step 4: Run the UI mechanical detector**

Run: `node /Users/david/.agents/skills/impeccable/scripts/detect.mjs --json src/templates/common.js README.md CHANGELOG.md`

Expected: no actionable copy or layout finding caused by this change.

- [ ] **Step 5: Commit the verified change**

Run:

```bash
git add src/templates/common.js test/export-and-theme-dropdown.test.mjs README.md CHANGELOG.md .agent/skills docs/superpowers/plans/2026-08-31-share-menu-copy-plan.md
git commit -m "fix(share): remove redundant copy menu subtitles"
```

- [ ] **Step 6: Deploy and verify the reported Cloudflare version**

Run: `npm run deploy`

Expected: predeploy completes, `wrangler deploy` exits 0, and output includes a new `Current Version ID` for `https://wiki.david888.com`.

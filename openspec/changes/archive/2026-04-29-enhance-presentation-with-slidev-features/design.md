## Context

現有的 presentation mode 已經能把筆記內容切成 Reveal.js 投影片，但在版型與視覺表現上仍偏向通用簡報外觀。這個 change 的目標是在不引入完整 Slidev runtime 的前提下，補上幾個高價值的 Slidev 使用體驗，包括雙欄布局、點擊顯示片段，以及更精緻的預設簡報樣式。

這項改動同時影響 presentation 的前處理流程與簡報專用 CSS，因此屬於同一個 rendering pipeline 的增強，而不是新的路由或資料模型變更。

## Goals / Non-Goals

**Goals:**
- 讓使用者可在 markdown 中使用 `::left::` / `::right::` 建立雙欄投影片
- 讓 `{v-click}` 語法對應到 Reveal.js fragment 行為
- 提供更接近 Slidev 風格的 presentation 視覺主題，包括字體、背景與 code block 樣式
- 保持目前 Reveal.js on-demand 載入方式與既有 presentation 入口不變

**Non-Goals:**
- 不整合完整 Slidev 編譯器或其生態套件
- 不支援更廣泛的 Slidev 指令語法，如 frontmatter、layout registry 或 presenter mode
- 不改動分享路由、權限模型或簡報 deep-link 機制

## Decisions

### 1. 以字串前處理實作 Slidev-Lite 語法
在 `initPresentation` 的內容切頁後流程中，直接對各 slide 的 markdown 內容做字串層級轉換，而不建立新的 parser。

Rationale:
- 目前的 presentation engine 已經在前端持有完整 markdown 字串，插入少量前處理邏輯即可完成需求
- 可避免引入額外依賴與解析成本

Alternatives considered:
- 建立完整 AST parser：擴充性較高，但對當前需求過重

### 2. 將 `v-click` 對應為 Reveal fragment 註解語法
`{v-click}` 轉換為 Reveal markdown plugin 可識別的 fragment 標記，延續既有 Reveal.js runtime。

Rationale:
- 直接重用 Reveal 既有功能，避免自建動畫控制邏輯
- 與目前 presentation overlay 架構完全相容

Alternatives considered:
- 自訂 CSS class 與 JS 控制顯示：實作成本更高，且與 Reveal 內建行為重疊

### 3. 將 Slidev-Lite 視覺樣式集中在簡報 CSS 擴充區塊
所有新樣式維持在 `src/styles/base.css.js` 的 presentation 區段中，而非分散到一般頁面樣式。

Rationale:
- 避免污染非 presentation 頁面
- 比較容易持續維護與回退

Alternatives considered:
- 建立獨立 CSS asset：結構較清楚，但對目前 inline template 結構不是必要條件

## Risks / Trade-offs

- [Risk] 以字串規則轉換 layout 語法，可能對複雜 markdown 組合不夠健壯 → Mitigation: 僅支援明確的 `::left::` / `::right::` 配對模式
- [Risk] 新字體與深色視覺可能與既有 theme selector 互動產生風格不一致 → Mitigation: 將新樣式限制在 presentation overlay 範圍
- [Risk] Reveal markdown plugin 對 fragment 註解格式相依，未來升級可能破壞行為 → Mitigation: 維持最小轉換邏輯並在升級時驗證

## Migration Plan

這是一項向後相容的 presentation 增強。

- 舊有不使用 `::left::`、`::right::` 或 `{v-click}` 的簡報內容不需修改
- 新語法只在 presentation mode 中生效，不影響編輯器內容儲存格式
- 若增強樣式或語法有問題，可移除前處理與 CSS 擴充區塊回到原本 Reveal 顯示方式

## Open Questions

- 是否要在後續 change 支援更多 Slidev 語法，例如逐頁 layout 指定或封面模板
- 是否要把 Slidev-Lite 主題與一般 note theme selector 做更清楚的權責分離
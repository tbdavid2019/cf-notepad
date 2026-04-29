## Context

目前的 presentation mode 由分享頁或編輯頁中的 Present 按鈕觸發，前端在頁面載入後動態建立 Reveal.js overlay。雖然 Reveal 已啟用 hash，但這個 hash 只有在 overlay 已啟動時才有意義，因此無法作為可分享的簡報入口。

這次 change 的重點不是擴充簡報語法，而是讓分享頁具備明確的 presentation route，並讓該 route 能從 URL 還原 slide 狀態。這會同時碰到後端路由、前端初始化時機、瀏覽器返回行為，以及密碼保護分享頁的驗證流程。

## Goals / Non-Goals

**Goals:**
- 提供明確且可分享的簡報入口，例如 `/share/:md5/present`
- 讓簡報入口可與 Reveal hash 共存，支援直接開啟指定 slide
- 讓 password-protected share page 在完成驗證後仍能回到 presentation route 與目標 slide
- 讓一般 share view 與 presentation view 的切換行為可預期且一致

**Non-Goals:**
- 不重新設計簡報渲染引擎或替換 Reveal.js
- 不新增簡報註解、講者模式或多人同步功能
- 不為 edit page 建立獨立的 presentation permalink

## Decisions

### 1. 採用 path-based presentation route
選擇 `/share/:md5/present` 作為明確入口，而不是 `?view=present`。

Rationale:
- 路徑語意更清楚，使用者可直觀看出這是 share view 的一種子視圖
- 可避免 query 參數與未來其他 share page 設定混用，降低 URL state 歧義
- 與 Reveal hash 的組合更直觀：`/share/:md5/present#/24`

Alternatives considered:
- `?view=present&slide=25`: 較容易在既有頁面內實作，但 URL state 會分散在 query 與 hash 兩處，且 presentation route 不夠明確

### 2. presentation route 仍重用現有分享頁資料來源
後端 presentation route 不建立新的內容來源，而是沿用 share page 既有的 md5 -> path 解析與權限檢查，再把 presentation initial state 傳給同一組 HTML/template。

Rationale:
- 避免把 share 權限、內容查詢、metadata 組裝拆成兩套流程
- 保持 share page 與 presentation route 的內容一致性

Alternatives considered:
- 建立完全獨立的 presentation template：畫面可更純粹，但會增加維護成本與功能漂移風險

### 3. 由頁面初始化邏輯主動進入 presentation mode
當前端偵測目前位於 presentation route 時，頁面載入完成後自動執行 present 初始化，而不是要求使用者再次點擊 Present。

Rationale:
- 這是 deep-link 可用性的必要條件
- 可直接讓 Reveal 讀取 hash 並定位到指定 slide

Alternatives considered:
- 先渲染一般 share view，再彈提示讓使用者進入 present：不符合 deep-link 預期

### 4. 密碼驗證成功後保留原始 destination
若分享頁需要驗證，系統應在 auth 流程中保留原始 presentation destination，驗證完成後回到 `/share/:md5/present`，並保留 hash 指向的 slide。

Rationale:
- 這是使用者從外部點擊 deep link 時最直覺的行為
- 若驗證後回到一般 share view，deep-link 目的會失效

Alternatives considered:
- 驗證後固定回一般 share page：實作較簡單，但與分享指定 slide 的需求相衝突

## Risks / Trade-offs

- [Risk] route 與前端 overlay state 不一致，導致關閉簡報後 URL 卡在 `/present` → Mitigation: 明確定義 exit 行為，關閉時回到 `/share/:md5`
- [Risk] Reveal hash 與應用程式自有 URL state 互相覆寫 → Mitigation: 只讓應用程式負責 route，slide 位置交由 Reveal hash 管理
- [Risk] 密碼保護流程遺失 hash fragment → Mitigation: 在前端保存完整 destination，驗證成功後以 client-side redirect 還原
- [Risk] 未來若要支援 edit page deep-link，現行設計不足 → Mitigation: 本 change 限定 share page，保留後續擴充空間

## Migration Plan

此 change 為向後相容的新增功能。

- 既有 `/share/:md5` 保持不變
- 新增 `/share/:md5/present` 後，舊分享連結仍可正常使用
- 若新 route 有問題，可回退為只保留一般 share page 與手動 Present 按鈕

## Open Questions

- 是否要在 presentation view 中提供「複製目前投影片連結」的明確 UI，而不只依賴瀏覽器網址列
- slide 編號在產品文案上是否要用 1-based 顯示，但在 Reveal hash 維持現有索引表示
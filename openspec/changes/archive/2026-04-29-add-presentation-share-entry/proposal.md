## Why

目前簡報模式只能在分享頁內手動點擊 Present 進入，投影片頁碼狀態也只存在於前端 overlay 的 Reveal 執行期。這讓使用者無法把特定投影片頁面直接分享給同事，對簡報協作與 review 流程不夠友善。

## What Changes

- 新增明確的簡報分享入口，讓分享頁可透過專用 URL 直接進入 presentation view。
- 支援從 URL 還原指定投影片位置，讓開啟連結的使用者直接看到目標頁面，而不是永遠從第一頁開始。
- 定義 presentation view 與一般 share view 的切換、關閉與回退行為，避免使用者在瀏覽器返回與重新整理時出現不一致狀態。
- 補齊分享頁在有密碼保護時的 presentation deep-link 行為，確保驗證後仍可回到指定投影片。

## Capabilities

### New Capabilities
- `presentation-share-entry`: 提供可分享、可還原投影片頁碼的獨立簡報入口與 URL state 規則

### Modified Capabilities

## Impact

- 受影響程式：分享頁路由與模板、presentation 初始化流程、footer 中的 Present 操作與 share link 產生方式
- 受影響路徑：`src/index.js`、`src/templates/base.js`、`src/templates/common.js`、可能新增的 presentation share 路由處理
- 對外行為：分享連結將可表達簡報模式與目標 slide，需定義 URL 格式與相容策略
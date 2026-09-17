# Canvas v2 程式審查報告

日期：2026-09-17
審查 commit：`6e10685 feat(canvas): replace canvas architecture with Canvas v2 based on Ameliorate`
審查結論：**Changes requested**

## 範圍

- Canvas v2 model、store、persistence
- React Flow nodes、edges、toolbar、viewport
- JSON Canvas 1.0 round-trip
- Ameliorate attribution
- CSS isolation、light／dark、responsive
- 測試、bundle、production assets、dependencies

## 已完成驗證

- `npm test`：445 tests passed，0 failures
- `npm run build:canvas-editor`：通過
- `https://wiki.david888.com/new/canvas`：HTTP 200
- production JS 含 `canvas-v2-root` 與 local draft restore
- production CSS 含 `canvas-v2-root`、`canvas-main-toolbar`、`canvas-edge-toolbar`
- Ameliorate attribution、固定 commit 與 MIT notice 已建立
- JS bundle：424,517 bytes；前版 420,880 bytes
- CSS bundle：26,232 bytes；前版 15,869 bytes

## Findings

### Critical 1：發布與 pagehide 可能讀到 300ms 前的舊 Canvas

**位置：** `static/js/canvas-v2/store/persistence.mjs:20`

Store 更新後，`#contents` 會等待 300ms debounce 才更新：

```js
saveTimer = setTimeout(() => {
    const jsonCanvas = state.toJsonCanvas()
    contentsElement.value = JSON.stringify(jsonCanvas, null, 2)
    contentsElement.dispatchEvent(new Event('input', { bubbles: true }))
}, 300)
```

既有 publish、manual save、pagehide beacon 都以 `#contents.value` 為資料來源。使用者修改後在 300ms 內發布、儲存或離頁，伺服器會收到前一版 Canvas。

**已重現：**

```text
immediateContainsLatest = false
afterDebounceContainsLatest = true
```

**影響：** 發布頁與編輯畫布內容不一致；快速離頁存在資料遺失窗口。

**修正：**

1. Store mutation 後同步更新 `#contents.value`。
2. debounce 只控制 `input` event／autosave 排程。
3. bridge 提供 `flush()`，publish、manual save、pagehide 前強制呼叫。
4. 新增 immediate publish 與 pagehide regression tests。

### Critical 2：「100% round-trip」目前會丟失 extension 與未知欄位

**位置：**

- `static/js/canvas-v2/model/jsonCanvasAdapter.mjs:27`
- `static/js/canvas-v2/model/jsonCanvasAdapter.mjs:101`

Adapter 只重建已知欄位。以下資料會消失：

- document root 自訂欄位
- node 自訂欄位
- file、link、group node 的 `david888` extension
- edge `david888` 裡 lineStyle／strokeWidth 之外的欄位
- 未知且合法的 forward-compatible metadata

**已重現：** 輸入 `customTop`、`customNode`、`david888.custom` 後，輸出只剩標準 file node。

**影響：** 匯入第三方 `.canvas` 後再儲存／匯出會永久移除未知資料。文件中的「100% round-trip 保真」與實際行為不一致。

**修正：**

1. Adapter 保存 `raw`／`extensions` sidecar。
2. 匯出時以原始物件為基底，覆寫受管理欄位。
3. sticky migration 合併完整 `david888`。
4. 新增 unknown root／node／edge extension round-trip tests。

### High 1：Resize 未進入 Undo／Redo transaction

**位置：**

- `static/js/canvas-v2/components/Node/FlowNode.jsx:53`
- `static/js/canvas-v2/components/Diagram/Diagram.jsx:85`

`NodeResizer` 只設定 min size 與 visibility。History snapshot 只在 `onNodeDragStart`／`onNodeDragStop` 建立。Resize changes 經 `onNodesChange` 直接更新 store，history 沒有 resize transaction。

**影響：** 調整卡片尺寸後按 Undo，尺寸無法回復；報告宣稱的 transaction-level Undo／Redo 覆蓋不完整。

**修正：** 將 `onResizeStart` 保存 snapshot，`onResizeEnd` commit transaction。新增 resize undo／redo test。

### High 2：EdgeToolbar 仍綁在 EdgeLabelRenderer 中點，碰撞避讓尚未實作

**位置：**

- `static/js/canvas-v2/components/Edge/CanvasEdge.jsx:78`
- `static/js/canvas-v2/components/Edge/EdgeToolbar.jsx:23`
- `static/js/canvas-v2/components/Edge/EdgeStylePopover.jsx:31`

Toolbar 是一般 `<div>`，與 label 共用 edge 中點的 flex column。它沒有使用 React Flow `EdgeToolbar` portal，也沒有 viewport／node collision positioning。Style popover 也是同一定位上下文。

**影響：** edge 中點靠近 node 或 viewport 邊界時，toolbar／popover 仍會遮住卡片或被裁切。這正是 v1 的主要回歸來源。

**修正：**

1. 使用 `@xyflow/react` 的 `EdgeToolbar`。
2. 以 labelX／labelY 為 anchor，加入 top／bottom／left／right fallback。
3. Popover 採 portal 或 fixed positioning。
4. 加入 320px width boundary 與 narrow viewport fixture。

### High 3：新增卡片使用固定世界座標，平移後可能出現在視窗外

**位置：** `static/js/canvas-v2/model/canvasCommands.mjs:45`

新 node 預設位置固定在 `x: 120–200`、`y: 120–200`。Main toolbar 在任何 viewport 都呼叫相同 command。

**影響：** 使用者平移到遠處後新增卡片，畫面看不到新卡片，使用者會判斷新增操作失敗。多次新增也集中重疊在同一區域。

**修正：** Main toolbar 取得 viewport center，透過 `screenToFlowPosition()` 傳入 create command；加入 collision offset。

### High 4：Canvas v2 直接取代 legacy，缺少計劃要求的切換與回退入口

**位置：** `static/js/canvas-editor.jsx:1`

入口目前直接 mount Canvas v2。Legacy implementation 已從檔案移除，repo 內沒有 `CANVAS_EDITOR_VERSION=legacy|v2` switch。

**影響：** production 發生資料或互動回歸時，只能透過 git revert 與重新部署回復。計劃要求的平行驗收與一版 fallback 尚未完成。

**修正：** 在 manual E2E 完成前恢復 legacy bundle／entry，加入 runtime feature switch；完成 Checkpoint E 後再移除。

### High 5：「全套規範完成」與現有功能矩陣存在差距

**位置：** `static/js/canvas-v2/components/Diagram/Diagram.jsx:117`

目前 Diagram 只包含 `ReactFlow` 與 `Background`。以下計劃項目仍待完成：

- React Flow `Controls`
- `MiniMap`
- Delete／Backspace keyboard delete（目前 `deleteKeyCode={null}`）
- Store-backed multi-selection commands
- Lasso／rectangle／eraser／freehand whiteboard phases
- 20 themes semantic mapping；目前只有 light／dark tokens
- performance acceptance：100 nodes／300 edges

**影響：** 部署內容屬於 Canvas v2 foundation，尚未達到計劃中的完整 Canvas v2。

**修正：** README／CHANGELOG 改為 foundation status，或完成缺少項目後再宣告全套完成。

### High 6：Clear Canvas 清空 history，使用者無法 Undo

**位置：**

- `static/js/canvas-v2/components/Toolbar/FileMenu.jsx:59`
- `static/js/canvas-v2/store/createCanvasStore.mjs:130`

Clear Canvas 呼叫 `loadDocument({ nodes: [], edges: [] })`。`loadDocument` 會建立空 history。

**影響：** 清空全部內容後 Undo 無法恢復。這是高風險破壞性操作。

**修正：** 建立 `clearDocument` transaction command，先記錄完整 snapshot，再清空 nodes／edges。

### Medium 1：所有 node／edge 在任一變動時重建 data 與 callbacks

**位置：** `static/js/canvas-v2/components/Diagram/Diagram.jsx:45`

`nodesWithData` 與 `edgesWithData` 每次 map 全陣列並建立新 callback。拖曳單一 node 時，全部 nodes 都獲得新的 data object。

**影響：** 大型 Canvas 會產生全量 node re-render。計劃中的 2,000 nodes／8,000 edges 上限與此模式衝突。

**修正：**

- actions 使用 stable callbacks／store API context
- node data 保持 referential stability
- 將 selection／layout 與 domain data 分離
- 加入 React profiler 或 render-count performance test

### Medium 2：`zustand` 屬於直接 import，package.json 目前依賴傳遞安裝

**位置：**

- `static/js/canvas-v2/store/createCanvasStore.mjs:6`
- `package.json:38`

程式直接 `import { create } from 'zustand'`，package.json 只宣告 `@xyflow/react`。目前 `zustand@4.5.7` 由 `@xyflow/react` 傳遞依賴提供。

**影響：** 上游調整 dependency layout、npm dedupe 改變、切換 pnpm 後可能出現 module resolution failure。

**修正：** 將相容版本的 Zustand 加入 direct dependencies，鎖檔同步更新。

### Medium 3：Sync status 只會進入 dirty／error，缺少 syncing／synced 回寫

**位置：**

- `static/js/canvas-v2/store/persistence.mjs:32`
- `static/js/canvas-v2/components/Toolbar/MainToolbar.jsx:121`

Bridge 序列化後設定 `dirty`。既有 base save pipeline 完成雲端同步時沒有通知 Canvas store。`dirty` 與 `syncStatus` 也各自保存，狀態可能分歧。

**影響：** Toolbar 的 dirty indicator 在雲端保存成功後仍可能保持；使用者無法從 Canvas v2 看出真實同步狀態。

**修正：** 定義單一 sync state machine，base save pipeline 透過 event 更新 Canvas store。

### Medium 4：Store selection 與 React Flow selection 分成兩套狀態

**位置：**

- `static/js/canvas-v2/store/createCanvasStore.mjs:39`
- `static/js/canvas-v2/components/Diagram/Diagram.jsx:75`

React Flow selection changes 只更新 node／edge 的 `selected` property。`selectedNodeIds`／`selectedEdgeIds` 沒有同步更新。只有 edge label click 會呼叫 `setSelectedEdge`。

**影響：** selectors 回傳 stale selection；未來 multi-select、delete、toolbar actions 會讀到不同狀態。

**修正：** 以 React Flow `onSelectionChange` 同步 store，或移除 duplicated selection arrays，以一個來源為準。

### Medium 5：Custom card color 缺少文字對比計算

**位置：** `static/js/canvas-v2/components/Node/FlowNode.jsx:31`

一般 node 選色後直接使用完整 hex 作背景，文字仍使用 theme token。深色背景搭配深色文字、亮色背景搭配白字時可能低於 WCAG 4.5:1。

**影響：** 六色 palette 與 custom color 在部分 light／dark 組合下可讀性不足。

**修正：** 建立 luminance／contrast helper，為每個 card background 選擇前景色與 muted color。

### Medium 6：Menus／popovers 缺少完整 keyboard 與 dismiss 行為

**位置：**

- `static/js/canvas-v2/components/Toolbar/MainToolbar.jsx:31`
- `static/js/canvas-v2/components/Toolbar/AddMenu.jsx:12`
- `static/js/canvas-v2/components/Toolbar/FileMenu.jsx:67`
- `static/js/canvas-v2/components/Edge/EdgeStylePopover.jsx:9`

目前缺少：

- `aria-expanded`／`aria-haspopup`
- menu／menuitem roles
- Escape close
- outside click close
- focus return
- arrow-key navigation

`EdgeStylePopover` 接收 `onClose`，函式內沒有使用。

**影響：** 鍵盤與輔助技術操作不完整；popover 容易停留在畫布上。

**修正：** 採用既有 app popover／menu primitive，或建立單一 accessible CanvasMenu component。

### Medium 7：Markdown fallback 可直接插入未淨化 HTML

**位置：** `static/js/canvas-v2/components/Node/MarkdownNode.jsx:13`

主路徑使用 `window.renderMarkdown`，其內含 DOMPurify。Fallback 直接執行：

```js
el.innerHTML = window.marked.parse(text || '')
```

**影響：** 主 renderer 初始化失敗而 marked 可用時，惡意 HTML 可進入 DOM。

**修正：** fallback 經 `window.DOMPurify.sanitize()`；DOMPurify 缺席時使用 `textContent`。

### Low 1：未使用／未完成狀態增加維護成本

**位置：**

- `MainToolbar.closeAll`
- `EdgeStylePopover.onClose`
- store `activeTool`、`openPopover`、`editingNodeId`、`editingEdgeId`
- CSS `.canvas-edge-interactive`

這些 API 或 state 目前沒有完整 consumer。後續實作可完成其用途，或移除以降低誤導。

## Dependency audit

`npm audit --omit=dev`：

| Severity | Count | 主要來源 |
|---|---:|---|
| High | 1 | `@tiptap/core@3.29.2` |
| Moderate | 10 | Tiptap extensions／React |
| Low | 1 | direct `cookie@0.5.0` |

Tiptap 可用修正版為 3.31.3；BlockNote 最新版為 0.54.2。這組問題在 Canvas v2 之前已存在，仍屬 production dependency risk。`cookie` 的 audit fix 指向 semver-major 2.0.1，需要相容性檢查。

## 測試覆蓋評估

目前新增測試有效覆蓋：

- 五種 node 基本轉換
- 已知 edge styles
- create／duplicate／connect／delete
- basic undo／redo
- reconnect

目前測試多數 source contract 使用 regex。下列 regression tests應加入：

1. store mutation 後立即 publish／pagehide flush
2. unknown extensions round-trip
3. resize undo／redo
4. clear canvas undo
5. create node at viewport center
6. selection source synchronization
7. EdgeToolbar collision／viewport boundary pure helper
8. sync status state machine
9. custom color contrast
10. 100 nodes／300 edges render-count benchmark

## 建議處理順序

### P0：資料安全

1. 同步更新 `#contents` 並建立 persistence `flush()`
2. 保留 JSON Canvas unknown extensions
3. Clear Canvas 改成可 Undo transaction
4. 恢復 legacy／v2 runtime switch，完成手動 E2E 前保留 fallback

### P1：核心互動

1. Resize history transaction
2. 新 node 建立於 viewport center
3. EdgeToolbar portal 與 collision positioning
4. Selection 單一來源
5. Delete keyboard 與 multi-select commands

### P2：品質

1. Node／edge referential stability
2. Sync status state machine
3. Accessible menus／popovers
4. Card color contrast
5. Direct Zustand dependency
6. Markdown fallback sanitize

### P3：規格完成

1. Controls、MiniMap
2. 20 themes token mapping
3. Lasso、rectangle、eraser、freehand phases
4. Performance acceptance
5. README／CHANGELOG 狀態改為與實際功能一致

## Merge／Production 建議

目前版本適合作為 Canvas v2 foundation。完成 P0 與 P1、通過使用者手動 E2E 後，再標記為完整替換版本。Production 目前已部署，建議優先修復 Critical 1，縮短資料不一致窗口。

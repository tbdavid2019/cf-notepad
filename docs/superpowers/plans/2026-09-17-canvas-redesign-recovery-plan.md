# Canvas 編輯器重建與恢復計劃

日期：2026-09-17  
狀態：待確認後執行  
目標頁面：Canvas 編輯模式與唯讀分享模式  
主要程式：`static/js/canvas-editor.jsx`、`src/styles/editor.css.js`、`src/canvas_document.mjs`

## 1. 目標

把目前的 Canvas 編輯器恢復成一個成熟、清楚、完整的空間筆記畫布：使用者能快速新增卡片、編輯內容、建立關係線、調整樣式、復原操作、匯入／匯出與發布分享；每個控制都具有穩定位置、明確層級與一致外觀。

本次重建以 React Flow 官方 Feature Overview、NodeToolbar、EdgeToolbar、NodeResizer 與 Whiteboard examples 為實作基準。官方範例的元件結構、互動模式與控制位置直接作為驗收參考；cf-notepad 僅加入自身必要的 Markdown、Wiki、JSON Canvas、保存與發布能力。

## 2. 使用者工作情境

- 使用者進入 Canvas 後，第一個動作通常是新增文字卡、便籤或 Wiki 引用。
- 使用者需要拖曳卡片、調整尺寸、從四邊建立連線並標記關係。
- 使用者需要快速修改卡片顏色、複製、刪除、Undo／Redo。
- 使用者需要在桌面、窄視窗、淺色與深色模式下維持相同操作邏輯。
- 分享頁需要完整呈現同一份位置、尺寸、顏色、文字與關係線資料。

成功標準：使用者在 30 秒內完成「新增卡片 → 編輯文字 → 建立連線 → 修改關係標籤 → Undo → 發布 → 分享頁確認」完整流程。

## 3. 現況診斷

### 3.1 EdgeToolbar 佔用畫布

目前 `.canvas-edge-toolbar` 使用：

- `width: max-content`
- `max-width: min(760px, calc(100vw - 32px))`
- `overflow-x: auto`
- 單層排列標籤、方向、線型、粗細、色票與刪除

結果是工具列形成大型橫向面板，遮住卡片與線段。窄視窗時面板仍保留桌面密度，水平捲軸直接出現在畫布中央。

### 3.2 控制層級混在一起

節點工具列、edge 工具列、卡片 hover actions、頂部 command bar 都使用不同按鈕規格。主操作、進階樣式與危險操作同時出現，使用者需要掃描整列才能找到目標。

### 3.3 卡片視覺規則互相覆蓋

`src/styles/editor.css.js` 內存在多組 Canvas 規則與重複的 `.canvas-node-card` 定義。卡片 header、content、hover actions、Markdown typography、theme overrides 分散在同一大型檔案內，修改一處容易影響其他節點。

### 3.4 UI 與資料邏輯集中在單一檔案

`static/js/canvas-editor.jsx` 同時處理：

- JSON Canvas ↔ React Flow 轉換
- 本機草稿恢復與 autosave
- Undo／Redo
- 所有 node components
- custom edge 與 toolbar
- 匯入／匯出
- theme 與語言

目前單檔超過 1,600 行，視覺修改容易碰到資料與連線行為。

### 3.5 測試覆蓋偏向 source regex

現有測試能確認字串與結構存在，互動狀態的驗證密度較低。Toolbar 開關、edge mapping、Undo history、local draft 與 publish payload 需要各自具備可單元測試的純函式。

## 4. 設計方向

### 4.1 視覺原則

- Operate mode：畫布內容是主角，控制介面保持清楚、熟悉、低干擾。
- 一套元件語言：卡片、按鈕、select、popover、toolbar 使用同一圓角、邊框、字級與 focus ring。
- 一個 accent：藍色只負責選取、focus、連線與主要動作。
- 卡片顏色屬於內容：紅、橙、黃、綠、藍、紫只出現在使用者選定的卡片或 edge。
- Overlay 採 portal：NodeToolbar、EdgeToolbar、popover 直接浮於 viewport，保有固定尺寸並避開 clipping。
- 工具列採 progressive disclosure：常用操作直接顯示，完整樣式集中在 popover。

### 4.2 畫布布局

桌面：

- 左上：主要 command bar（新增卡片、便籤、Wiki 引用、Undo、Redo）
- 左下：React Flow `Controls`，採官方水平配置
- 右下：`MiniMap`
- 右上：檔案操作（匯入、匯出）與唯讀狀態
- 中央：純畫布工作區

窄視窗：

- command bar 收斂成底部 action bar
- 「新增」開啟 compact menu
- Undo／Redo 保持直接可用
- 匯入／匯出進入 More menu
- Context toolbar 最大寬度以 viewport 計算，採單列 primary actions + popover

### 4.3 卡片 anatomy

所有節點共用官方 React Flow UI `BaseNode` anatomy：

```text
BaseNode
├── BaseNodeHeader
│   ├── 類型 icon
│   ├── title
│   └── optional metadata
├── BaseNodeContent
│   └── editor / preview
└── BaseNodeFooter（只在內容需要時出現）
```

卡片規格：

| 類型 | 預設尺寸 | 最小尺寸 | 內容策略 |
|---|---:|---:|---|
| Markdown | 320 × 180 | 220 × 120 | 預覽與 textarea 共用 typography tokens |
| Sticky | 240 × 160 | 180 × 120 | 短文字優先，保留實心背景 |
| Wiki 引用 | 280 × 132 | 220 × 100 | 顯示文章路徑與開啟動作 |
| Web Link | 280 × 132 | 220 × 100 | 顯示網址與安全外連 |
| Group | 480 × 300 | 240 × 160 | 低對比範圍框與標籤 |

既有 JSON Canvas 寬高直接保留；新節點使用上述預設值。

### 4.4 NodeToolbar

選取節點後顯示 compact toolbar：

1. 顏色按鈕：開啟 palette popover
2. Duplicate
3. Delete

Resize 使用 `NodeResizer` 邊角控制。卡片內編輯動作保留在內容區，toolbar 專注物件層操作。

### 4.5 EdgeToolbar

選取 edge 後顯示寬度受控的 compact toolbar：

1. Label：點擊進入 inline edit
2. Direction：四態按鈕或短 select
3. Style：開啟 popover，內含線型、粗細與顏色
4. Delete

規格：

- toolbar 位置固定在 edge 中點上方 12px
- 最大寬度 360px
- hover 僅提高 edge hit-area 與 highlight
- selection 才顯示 toolbar
- toolbar 與相鄰 node 發生碰撞時，依序切換上方、下方、左側、右側
- 窄視窗採 icon buttons，文字放入 tooltip

### 4.6 連線互動

- 四邊皆提供 12px 視覺 handle 與至少 24px hit target
- handle 在 node hover／selected 時進入高對比狀態
- 拖曳連線時所有合法 target handles 顯示 active state
- 新 edge 預設為單向、實線、中等粗細、theme accent
- Edge hit area 維持至少 20px
- `fromSide`、`toSide`、`fromEnd`、`toEnd`、label、color 與 `david888` extension 完整 round-trip

### 4.7 配色系統

Canvas 使用獨立 semantic tokens，再映射現有 20 款主題：

```text
--canvas-bg
--canvas-grid
--canvas-panel
--canvas-panel-border
--canvas-text
--canvas-muted
--canvas-accent
--canvas-selection
--canvas-danger
--canvas-focus-ring
```

Light baseline：中性 slate surface + blue accent。  
Dark baseline：深 slate surface + sky accent。  
Card palette：Obsidian 相容 6 色 + custom color。  
所有主題需通過文字 4.5:1、large text 3:1 的對比要求。

## 5. 目標架構

```text
static/js/canvas/
├── CanvasEditorApp.jsx
├── model/
│   ├── json-canvas-adapter.mjs
│   ├── canvas-validation.mjs
│   └── canvas-history.mjs
├── components/
│   ├── CanvasCommandBar.jsx
│   ├── CanvasFileActions.jsx
│   ├── CanvasEmptyState.jsx
│   ├── nodes/
│   │   ├── BaseNoteNode.jsx
│   │   ├── MarkdownNode.jsx
│   │   ├── StickyNode.jsx
│   │   ├── WikiNode.jsx
│   │   ├── LinkNode.jsx
│   │   └── GroupNode.jsx
│   └── edges/
│       ├── CanvasEdge.jsx
│       ├── EdgeToolbar.jsx
│       └── EdgeStylePopover.jsx
├── canvas-editor.css
└── index.jsx
```

Canvas CSS 由 `canvas-editor.css` 進入獨立 bundle。`src/styles/editor.css.js` 僅保留 Canvas 容器尺寸與頁面整合規則。

## 6. 實作階段

### Phase 0：恢復可用性

#### Task 0.1：收斂 EdgeToolbar

**描述：** 把目前大型 toolbar 收斂為四個 primary controls，完整線條樣式放入 popover。

**驗收條件：**

- [ ] toolbar 最大寬度 360px
- [ ] toolbar 不遮住 source／target node
- [ ] toolbar 只在 edge selected 時出現
- [ ] label、方向、樣式、刪除功能完整

**驗證：**

- [ ] `npm run build:canvas-editor`
- [ ] `node --test test/canvas-editor.test.mjs`
- [ ] 手動確認桌面與窄視窗 edge toolbar

**相依：** 無  
**預估：** M，3–5 files

#### Task 0.2：建立 UI rollback 邊界

**描述：** 標記目前資料與保存層基準，後續 visual rebuild 只替換 UI modules。

**驗收條件：**

- [ ] JSON Canvas adapter 測試固定輸入輸出
- [ ] publish payload 測試固定完整 Canvas JSON
- [ ] local draft restore 測試固定 draft／pending 行為

**驗證：**

- [ ] `npm test`
- [ ] 匯入後立即匯出，JSON semantic equality 成立

**相依：** 無  
**預估：** S，1–2 files

### Checkpoint A：可用性

- [ ] EdgeToolbar 已停止遮擋內容
- [ ] 四邊連線可操作
- [ ] 保存、重新整理、發布、分享資料一致
- [ ] 全套測試通過

### Phase 1：拆分資料與視覺層

#### Task 1.1：抽離 JSON Canvas adapter

**描述：** 將 `jsonCanvasToReactFlow`、`reactFlowToJsonCanvas` 與 validation glue 移到純函式 module。

**驗收條件：**

- [ ] adapter 不依賴 React DOM
- [ ] nodes／edges round-trip 測試涵蓋所有類型
- [ ] callback injection 留在 app layer

**驗證：** `node --test test/canvas-editor.test.mjs`  
**相依：** Task 0.2  
**預估：** M，3 files

#### Task 1.2：抽離 history 與 persistence orchestration

**描述：** 將 Undo／Redo snapshot 與 triggerSave 轉成可測試 hooks／helpers。

**驗收條件：**

- [ ] 50-step history limit 可測試
- [ ] 新操作清空 redo stack
- [ ] restore snapshot 保留 callback injection

**驗證：** history unit tests  
**相依：** Task 1.1  
**預估：** M，3–4 files

### Checkpoint B：核心分層

- [ ] model tests 全數通過
- [ ] Canvas UI 可替換而不影響 JSON schema
- [ ] bundle build 成功

### Phase 2：官方 UI 元件層

#### Task 2.1：建立 Canvas tokens 與 isolated stylesheet

**描述：** 建立 `canvas-editor.css`，集中 semantic tokens、light/dark mapping、focus 與 responsive rules。

**驗收條件：**

- [ ] Canvas 規則從 `editor.css.js` 移出
- [ ] 每個 token 具有 light/dark 值
- [ ] 20 款主題均映射至相同 semantic roles

**驗證：** CSS build、contrast audit、detector  
**相依：** Checkpoint B  
**預估：** M，3 files

#### Task 2.2：建立共用 BaseNode components

**描述：** 依 React Flow UI BaseNode anatomy 建立 node shell、header、content、footer、handle、resizer。

**驗收條件：**

- [ ] 五種 node 共用同一 shell
- [ ] selected／hover／focus／editing state 一致
- [ ] interactive children 使用 `nodrag`／`nowheel`

**驗證：** component source tests、build、手動鍵盤操作  
**相依：** Task 2.1  
**預估：** M，4–5 files

#### Task 2.3：重建五種 nodes

**描述：** 逐一遷移 Markdown、Sticky、Wiki、Link、Group。

**驗收條件：**

- [ ] 每種 node 遵循尺寸與 anatomy 規格
- [ ] editor／preview typography 一致
- [ ] custom color 與 dark mode 文字對比穩定

**驗證：** node tests、匯入現有 Canvas fixture  
**相依：** Task 2.2  
**預估：** 拆成五個 S tasks，各 1–2 files

### Checkpoint C：節點完成

- [ ] 現有 Canvas 文件可直接開啟
- [ ] 卡片位置與尺寸保持
- [ ] 桌面／窄視窗／dark mode 均可操作
- [ ] 全套測試通過

### Phase 3：控制列與 Edge UX

#### Task 3.1：重建 command bar

**描述：** 依桌面與窄視窗布局重新組合新增、history 與檔案操作。

**驗收條件：**

- [ ] 桌面操作一列完成
- [ ] 窄視窗以 action bar + menus 呈現
- [ ] 所有按鈕具 tooltip、focus、disabled state

**驗證：** desktop／narrow manual checklist  
**相依：** Task 2.1  
**預估：** M，3 files

#### Task 3.2：重建 NodeToolbar

**描述：** 使用 palette popover、duplicate、delete 三組操作。

**驗收條件：**

- [ ] toolbar 寬度穩定
- [ ] palette 支援 preset 與 native color picker
- [ ] delete 使用 danger state

**驗證：** node toolbar state tests  
**相依：** Task 2.2  
**預估：** S，2 files

#### Task 3.3：重建 CanvasEdge 與 EdgeToolbar

**描述：** 使用 `BaseEdge`、`EdgeToolbar` 與 style popover，加入碰撞避讓。

**驗收條件：**

- [ ] selected edge toolbar 始終可見且不遮卡片
- [ ] hover 僅高亮 edge
- [ ] label／direction／line style／width／color round-trip

**驗證：** edge unit tests、desktop／narrow manual checklist  
**相依：** Task 1.1、Task 2.1  
**預估：** M，4 files

### Checkpoint D：完整編輯流程

- [ ] 新增、編輯、連線、調色、複製、刪除、Undo／Redo 完整
- [ ] 匯入／匯出 `.canvas` 完整
- [ ] reload 與 publish/share 一致
- [ ] 全套測試通過

### Phase 4：白板能力

#### Task 4.1：框選與多選

- 使用 React Flow selection 與 lasso example pattern
- 支援批次移動、刪除與複製

#### Task 4.2：矩形／Group 工具

- 依 Rectangle 與 sub-flow examples 建立範圍與群組操作
- JSON Canvas group 保持標準格式

#### Task 4.3：Eraser

- 依官方 Eraser example 實作 mode tool
- 刪除 node 時同步清理 edges

#### Task 4.4：Freehand 評估與落地

- React Flow Pro example 可作為授權路徑
- MIT 相容方案可採獨立 stroke layer，資料放入明確 extension
- 完成 licensing 與 JSON Canvas extension 決策後進入實作

### Checkpoint E：Canvas v2

- [ ] 核心筆記 Canvas 流程完成
- [ ] Whiteboard tools 與 JSON Canvas 相容策略完成
- [ ] accessibility、keyboard、touch、theme、responsive 驗收完成
- [ ] release notes、README、tips、llms、skill 同步

## 7. 驗證矩陣

| 面向 | 驗證內容 |
|---|---|
| 資料 | JSON Canvas round-trip、empty canvas、link/file/group/sticky、edge extensions |
| 連線 | 四邊 handles、direction、line style、width、color、label、delete |
| History | node/edge create、move、resize、edit、style、delete、import |
| Persistence | local draft、autosave、manual save、publish、share reload |
| Layout | desktop、1024px、768px、窄視窗、200% zoom |
| Theme | light、dark、20 themes、custom card colors |
| Accessibility | keyboard selection、focus ring、labels、contrast、reduced motion |
| Performance | 100 nodes、300 edges、drag FPS、bundle size、initial load |

依使用者要求，瀏覽器 E2E 由使用者手動執行。自動驗證使用 Node test、build、source-level contracts 與純函式 unit tests。

## 8. 風險與控制

| 風險 | 影響 | 控制方式 |
|---|---|---|
| UI 重建碰到資料 schema | 高 | 先完成 adapter contract tests，再替換 UI |
| Toolbar 再次遮擋 | 高 | compact primary actions、popover、collision fallback、viewport bounds |
| CSS 規則互相覆蓋 | 高 | Canvas stylesheet 獨立 bundle、semantic tokens、移除重複 selector |
| 現有 Canvas 尺寸改變 | 高 | imported width/height 原值優先，defaults 僅作用新節點 |
| 20 themes 對比不一致 | 中 | semantic mapping + contrast matrix |
| 窄視窗 controls 過密 | 中 | bottom action bar、menus、icon + tooltip |
| Whiteboard extension 互通性 | 中 | 標準 JSON Canvas 核心 + namespaced extension |

## 9. 執行順序

```text
Phase 0 可用性恢復
    ↓
Phase 1 資料與視覺分層
    ↓
Phase 2 BaseNode 與五種節點
    ↓
Phase 3 command bar、NodeToolbar、EdgeToolbar
    ↓
Phase 4 whiteboard tools
    ↓
最終驗證、文件同步、部署
```

每個 Checkpoint 都保留可運作版本與獨立 commit。實作過程採小步提交，部署只發生在 Checkpoint 通過後。

## 10. 第一個實作批次

第一批只執行 Phase 0：

1. EdgeToolbar 收斂為 compact controls + style popover。
2. hover 改為 edge highlight，selection 才開 toolbar。
3. 建立 adapter／publish／local draft contract tests。
4. 完整執行 `npm test`。
5. 交付使用者手動驗證，再進入 Phase 1。

這個批次優先恢復目前畫布的可用性，並建立後續重建的安全邊界。

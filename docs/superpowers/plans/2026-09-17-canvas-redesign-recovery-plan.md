# Canvas v2 整體替換計劃

日期：2026-09-17  
狀態：已選定技術基底，等待實作
執行者建議：Codex 5.6 Luna
目標：以成熟開源 React Flow 專案取代現有 Canvas UI 與互動層

## 1. 最終決策

Canvas 採「UI 與互動層整體替換」。

保留 cf-notepad 已驗證的資料與服務契約：

- JSON Canvas 1.0 文件格式
- `src/canvas_document.mjs` 驗證與 Markdown 投影
- D1／KV 儲存
- local draft、autosave、publish、share
- `.canvas` 匯入／匯出
- Markdown renderer
- 中英文與現有主題設定

新建 Canvas v2：

- 新 node、edge、toolbar、selection、history 與 viewport architecture
- 新 isolated Canvas stylesheet
- 新 Zustand canvas store
- 新 React Flow composition root
- 新 JSON Canvas adapter boundary

Canvas v2 完成驗收後切換入口，接著移除舊 `canvas-editor.jsx` UI 與舊 Canvas CSS。

## 2. 開源移植來源

### 2.1 主基底：Ameliorate

- Repository：<https://github.com/amelioro/ameliorate>
- Showcase：<https://reactflow.dev/showcase>
- License：MIT
- 固定參考 commit：`0cacee5577438979b651dd808793c4cbd13864ee`
- React Flow：`@xyflow/react 12.10.0`
- cf-notepad：`@xyflow/react 12.11.6`

選擇理由：

- 定位是 tools-for-thought、知識節點與關係圖
- React Flow major/minor 與 cf-notepad 接近
- Diagram、Node、Edge、Toolbar、Store 已分層
- 具備 selection、handles、context actions、viewport、keyboard、state 與 history architecture
- MIT 允許複製、修改與再散布，保留 copyright／license notice 即可

### 2.2 直接移植的上游模組

| Ameliorate source | Canvas v2 用途 | 移植方式 |
|---|---|---|
| `src/web/topic/components/Diagram/Diagram.tsx` | React Flow composition、selection、viewport | 保留結構，替換 domain store |
| `src/web/topic/components/Diagram/Diagram.styles.tsx` | Canvas surface、selection／spotlight states | 提取視覺規則到 isolated CSS |
| `src/web/topic/components/Diagram/externalFlowStore.ts` | 對外暴露 viewport helpers | 改為 Canvas app API |
| `src/web/topic/components/Node/FlowNode.tsx` | 共用 node shell、handles、selected states | 換成 JSON Canvas node data |
| `src/web/topic/components/Node/EditableNode.tsx` | 文字編輯與 node content | 接入 Markdown／Wiki／Link editors |
| `src/web/topic/components/Node/NodeHandle.tsx` | 四邊連線點與 connecting states | 保留 interaction pattern |
| `src/web/topic/components/Node/NodeToolbar.tsx` | compact contextual actions | 改成 color／duplicate／delete |
| `src/web/topic/components/Edge/Edge.tsx` | edge path、20px hit area、label portal | 接入 JSON Canvas edge styles |
| `src/web/topic/components/Edge/Edge.styles.tsx` | edge selected／hover／spotlight | 保留 state grammar |
| `src/web/topic/components/Edge/svgPathDrawer.ts` | edge path 與 label placement | 視 JSON Canvas routing 需求裁切 |
| `src/web/topic/components/TopicWorkspace/MainToolbar.tsx` | 底部 compact toolbar | 換成 Canvas commands |
| `src/web/topic/diagramStore/store.ts` | Zustand store 組織 | 建立精簡 Canvas store |
| `src/web/topic/diagramStore/createDeleteActions.ts` | node／edge create/delete | 改用 JSON Canvas command actions |
| `src/web/topic/hooks/flowHooks.ts` | pan、zoom、fit view helpers | 直接適配 React Flow 12.11 |

### 2.3 Attribution

新增：

```text
THIRD_PARTY_NOTICES.md
```

內容需列出：

- Ameliorate repository URL
- 固定參考 commit
- Copyright (c) 2022 Joel Keyser
- MIT License 全文或 LICENSE 路徑
- 實際移植與修改的檔案清單

## 3. 其他 Showcase 候選的角色

| 專案 | 授權／定位 | 本計劃用途 |
|---|---|---|
| Ideation Studio | 媒體 inspiration board；README 將 arrows／freehand 列為 nice-to-have | 視覺密度與自由擺放參考 |
| JSON Sea | MIT；JSON graph viewer | 大量節點的 minimap／dark mode 參考 |
| Graphologue | MIT；LLM diagram | edge label 與知識閱讀參考 |
| Dafthunk | workflow automation | toolbar 與 Cloudflare 部署結構參考 |

Canvas v2 的程式移植來源鎖定 Ameliorate；其他候選只提供產品與視覺參考。

## 4. 目標使用體驗

使用者能在 30 秒內完成：

```text
新增 Markdown 卡片
    → 輸入內容
    → 新增便籤
    → 四邊 handle 建立連線
    → 編輯 edge label／direction／style
    → Undo
    → Publish
    → Share 頁看到相同畫布
```

操作原則：

- 畫布內容保持最高視覺優先級
- Toolbar 使用 compact icon controls
- 常用操作直接顯示
- 進階 edge styling 進入 popover
- hover 顯示 affordance
- selected 顯示 contextual actions
- editing 狀態與 object selection 清楚分離
- desktop、narrow viewport、light、dark 使用相同操作模型

## 5. Canvas v2 目標結構

```text
static/js/canvas-v2/
├── index.jsx
├── CanvasEditorApp.jsx
├── CanvasEditorView.jsx
├── attribution.md
├── model/
│   ├── jsonCanvasAdapter.mjs
│   ├── canvasCommands.mjs
│   ├── canvasHistory.mjs
│   └── canvasTypes.mjs
├── store/
│   ├── createCanvasStore.mjs
│   ├── selectors.mjs
│   └── persistence.mjs
├── components/
│   ├── Diagram/
│   │   ├── Diagram.jsx
│   │   └── viewportHelpers.mjs
│   ├── Node/
│   │   ├── FlowNode.jsx
│   │   ├── NodeHandle.jsx
│   │   ├── NodeToolbar.jsx
│   │   ├── MarkdownNode.jsx
│   │   ├── StickyNode.jsx
│   │   ├── WikiNode.jsx
│   │   ├── LinkNode.jsx
│   │   └── GroupNode.jsx
│   ├── Edge/
│   │   ├── CanvasEdge.jsx
│   │   ├── EdgeLabel.jsx
│   │   ├── EdgeToolbar.jsx
│   │   └── EdgeStylePopover.jsx
│   └── Toolbar/
│       ├── MainToolbar.jsx
│       ├── AddMenu.jsx
│       └── FileMenu.jsx
├── canvas-v2.css
└── tokens.css
```

現有入口：

```text
static/js/canvas-editor.jsx
```

在 migration 期間只負責：

1. 讀取 `#contents`
2. mount `CanvasEditorApp`
3. 透過 feature switch 選擇 legacy 或 v2

## 6. 資料契約

### 6.1 JSON Canvas 為唯一持久化格式

Canvas v2 store 使用適合互動的內部 state；保存時一律經過 adapter 產生 JSON Canvas。

```text
JSON Canvas
    ↓ load
jsonCanvasToCanvasState()
    ↓ edit
Zustand Canvas Store
    ↓ save
canvasStateToJsonCanvas()
    ↓ validate
validateCanvasDocument()
    ↓ persist
#contents / local draft / publish
```

### 6.2 保留欄位

Nodes：

- `id`
- `type`
- `x`, `y`, `width`, `height`
- `text`, `file`, `url`, `label`
- `color`
- `background`, `backgroundStyle`
- `david888.cardType`

Edges：

- `id`
- `fromNode`, `toNode`
- `fromSide`, `toSide`
- `fromEnd`, `toEnd`
- `label`, `color`
- `david888.lineStyle`
- `david888.strokeWidth`

### 6.3 Adapter 驗收

- 所有 node types round-trip
- empty canvas 保持 empty
- empty Wiki／Link draft 保持可編輯
- custom colors 保持
- edge direction／line style／width 保持
- imported Obsidian `.canvas` 再匯出保持 semantic equality

## 7. Store 與 Commands

Canvas v2 採 Zustand store，借用 Ameliorate 的 diagramStore 分層概念。

State slices：

- `documentSlice`：nodes、edges
- `selectionSlice`：selected node／edge ids
- `viewportSlice`：viewport state 與 helpers
- `historySlice`：undo／redo
- `uiSlice`：active tool、open popover、editing object
- `persistenceSlice`：dirty、local、syncing、synced、error

Commands：

- `createNode`
- `updateNodeContent`
- `updateNodeFrame`
- `setNodeColor`
- `duplicateNodes`
- `deleteNodes`
- `connectNodes`
- `reconnectEdge`
- `updateEdgeLabel`
- `updateEdgeStyle`
- `deleteEdges`
- `importDocument`
- `undo`
- `redo`

每個 command：

1. 驗證輸入
2. 產生單一 history transaction
3. 更新 store
4. 排程 persistence

## 8. UI 規格

### 8.1 MainToolbar

採 Ameliorate `MainToolbar` 的 compact icon group：

- Add
- Undo
- Redo
- Fit view
- File menu
- Read-only indicator

Desktop：底部中央。
Narrow viewport：底部 safe-area 上方，主要動作保持一列。
所有按鈕具 title、aria-label、focus、active、disabled state。

### 8.2 Nodes

借用 `FlowNode`、`EditableNode`、`NodeHandle` 的結構：

- node shell 只負責 frame、selection、hover、handles
- node content component 負責 Markdown／Sticky／Wiki／Link
- NodeToolbar 只負責 object actions
- handles 使用 visibility 保留 React Flow measurement
- selected node 顯示 toolbar
- connecting 時合法 handles 顯示 active state

預設尺寸：

| 類型 | Width | Height | Min |
|---|---:|---:|---:|
| Markdown | 320 | 180 | 220 × 120 |
| Sticky | 240 | 160 | 180 × 120 |
| Wiki | 280 | 132 | 220 × 100 |
| Link | 280 | 132 | 220 × 100 |
| Group | 480 | 300 | 240 × 160 |

既有文件尺寸原值優先。

### 8.3 NodeToolbar

採 Ameliorate vertical compact toolbar pattern：

- Color
- Duplicate
- More

Delete 放入 More menu，並以 danger state 顯示。

### 8.4 Edges

借用 Ameliorate `Edge.tsx`：

- visible path
- 20px invisible interaction path
- label 使用 `EdgeLabelRenderer`
- selected／neighbor／normal spotlight states
- label container 是 edge 的選取入口

EdgeToolbar 只在 selected state 顯示：

- Edit label
- Direction
- Style popover
- Delete

Style popover：

- Solid／Dashed／Dotted
- Thin／Medium／Thick
- Preset colors／custom color

Toolbar 最大寬度 320px，使用 portal 與 viewport collision positioning。

### 8.5 配色

移植 Ameliorate 的 restrained tool UI，映射到 cf-notepad semantic tokens：

```css
--canvas-bg
--canvas-grid
--canvas-paper
--canvas-paper-muted
--canvas-border
--canvas-text
--canvas-text-muted
--canvas-accent
--canvas-selection
--canvas-danger
--canvas-focus
```

主 UI 使用 neutral surface + single accent。卡片與 edge 的六色 palette 由使用者內容決定。

## 9. 實作階段

### Phase A：建立移植基底

#### A1. Vendor 與 attribution

**工作：**

- 新增 `THIRD_PARTY_NOTICES.md`
- 記錄 upstream commit 與 MIT notice
- 建立 `static/js/canvas-v2/`

**驗收：**

- [ ] attribution 完整
- [ ] upstream source mapping 完整
- [ ] v2 bundle 可獨立 build

#### A2. JSON Canvas adapter contract

**工作：**

- 抽離 legacy conversion functions
- 建立 v2 adapter unit tests
- 建立 fixtures：text、sticky、file、link、group、edges

**驗收：**

- [ ] round-trip tests 全部通過
- [ ] publish payload 與 legacy semantic equality
- [ ] import/export semantic equality

### Checkpoint A

- [ ] v2 空殼可 mount
- [ ] adapter tests 通過
- [ ] legacy editor 保持現有入口
- [ ] `npm test` 通過

### Phase B：移植 Diagram 與 Store

#### B1. Zustand Canvas store

- 建立 state slices 與 commands
- 將 callback injection 改成 store actions
- 建立 dirty／sync status

#### B2. Diagram composition

- 移植 `Diagram.tsx` composition
- 接入 React Flow Provider、nodes、edges、selection、viewport
- 接入 Background、Controls、MiniMap

#### B3. History

- 導入 zundo 或等效 Zustand temporal pattern
- command 級 transaction
- drag／resize 一次操作只產生一筆 history

### Checkpoint B

- [ ] create／move／resize／connect／delete 可運作
- [ ] Undo／Redo command tests 通過
- [ ] 100 nodes／300 edges 基本效能通過
- [ ] legacy editor 仍可切回

### Phase C：移植 Node 系統

#### C1. FlowNode shell 與 NodeHandle

- 移植 selected／hover／connecting visibility pattern
- 移植 20px interaction affordance
- 保留四邊 JSON Canvas sides

#### C2. 五種 node content

- MarkdownNode
- StickyNode
- WikiNode
- LinkNode
- GroupNode

每種 node 各自一個 commit，各自完成 fixture 與 adapter 驗證。

#### C3. NodeToolbar

- Color popover
- Duplicate
- More menu
- Delete

### Checkpoint C

- [ ] 五種 nodes 全部可編輯
- [ ] light／dark／20 themes mapping 通過
- [ ] desktop／narrow viewport 操作一致
- [ ] imported dimensions 保持

### Phase D：移植 Edge 系統

#### D1. CanvasEdge

- 移植 visible／interactive paths
- 接入 smoothstep path
- 接入 markers、direction 與 spotlight states

#### D2. EdgeLabel

- compact label badge
- click selects edge
- inline editing

#### D3. EdgeToolbar 與 StylePopover

- compact four-action toolbar
- advanced styles 進入 popover
- viewport collision positioning

### Checkpoint D

- [ ] EdgeToolbar 最大寬度 320px
- [ ] toolbar 與 node 無重疊
- [ ] hover 只高亮 edge
- [ ] selection 開啟 toolbar
- [ ] label／direction／style／width／color 完整保存

### Phase E：整合保存與切換

#### E1. Persistence bridge

- `#contents` 更新
- local draft restore
- autosave
- publish/share
- error state

#### E2. Import／Export

- `.canvas` import
- `.canvas` export
- invalid document recovery

#### E3. Feature switch

- 開發期間：`CANVAS_EDITOR_VERSION=legacy|v2`
- 驗收後：default 切到 v2
- 保留一次 release 的 legacy fallback

### Checkpoint E

- [ ] reload 保持 nodes／edges／viewport data
- [ ] publish 與 share 一致
- [ ] import／export round-trip
- [ ] 全套測試通過
- [ ] 使用者完成手動 E2E

### Phase F：移除 legacy

- 移除舊 node／edge／toolbar code
- 移除 `editor.css.js` 裡 Canvas CSS
- 移除 legacy switch
- 更新 bundle、README、CHANGELOG、tips、llms、skill
- 記錄 migration 與 attribution

## 10. 測試策略

依使用者要求，自動化流程使用 Node tests 與 build；瀏覽器 E2E 由使用者執行。

Unit tests：

- JSON Canvas adapter
- Commands
- History transactions
- Edge style mapping
- Local draft restore decision
- Publish payload
- Import validation

Build checks：

- `npm run build:canvas-editor`
- `npm test`
- `git diff --check`
- Impeccable detector once after UI 完成

手動 E2E checklist：

1. 建立五種 nodes
2. 四邊連線
3. edge label／direction／style
4. node resize／duplicate／delete
5. Undo／Redo
6. reload
7. import／export
8. publish／share
9. light／dark
10. narrow viewport

## 11. Commit 與回滾策略

建議 commit sequence：

```text
chore(canvas-v2): add Ameliorate attribution and scaffold
test(canvas-v2): lock JSON Canvas adapter contracts
feat(canvas-v2): port Zustand diagram store
feat(canvas-v2): port diagram and viewport layer
feat(canvas-v2): port node system
feat(canvas-v2): port edge system
feat(canvas-v2): integrate persistence and import export
feat(canvas-v2): switch default editor to v2
refactor(canvas): remove legacy canvas UI
docs(canvas): document v2 architecture and attribution
```

每個 Checkpoint 都保留可 deploy commit。切換前，legacy 與 v2 共存；切換後遇到資料回歸時可將入口切回 legacy，Canvas 文件保持同一 JSON schema。

## 12. Luna 執行指令

執行順序：

1. 讀本計劃全文。
2. 讀 repo `AGENTS.md`。
3. clone Ameliorate 固定 commit `0cacee5577438979b651dd808793c4cbd13864ee` 到 temp directory。
4. 建立 attribution 與 v2 scaffold。
5. 先完成 Phase A 並提交。
6. 每個 Checkpoint 執行完整 `npm test`。
7. 保持 JSON Canvas schema 與 publish contracts。
8. 保留 legacy 入口直到 Checkpoint E 通過。
9. 使用者負責瀏覽器 E2E。
10. Checkpoint E 通過後執行 Phase F。

核心準則：直接移植 Ameliorate 已成熟的 Diagram／Node／Edge／Toolbar／Store architecture，cf-notepad 的工作集中在 JSON Canvas adapter、Markdown content 與 persistence bridge。

# 全站下拉選單密度與互動表面設計

## 背景

Edit、Share、Block Edit 共用下拉選單骨架，但 `.dropdown-item-rich` 同時受 Web Awesome 原生 `button` 高度與不同層級的 flex shrink 影響。Share mode 的 rich item 又包在 `.dropdown-group-card` 內，導致副標被裁切、hover 背景縮進卡片、Export/Copy/New/Theme/Width 各自呈現不同密度。

## 設計決策

- 建立單一下拉選單 spacing scale：menu 以 10px/8px 留白，section label、divider、rich item 使用固定節奏。
- 所有 dropdown item 明確使用 `height: auto`，並禁止 menu 與 group card 內的子項目因 flex shrink 被壓扁；長選單以 viewport-aware max-height 滾動。
- group card 不再用內側 padding 製造 hover 留白，改由 card 裁切圓角，rich item 直接填滿內框，讓 hover/focus 與 card 邊界對齊。
- Export、Copy、New、Share、Theme、Width 共用同一個 hover/focus token 與 8px 圓角；保留 active、danger 與現有主題 token。

## 範圍與驗收

- Edit mode：New、Export、Copy、Theme、Width、Math 相關入口。
- Share mode：New、Export、Copy、Theme、Width，以及 published/unpublished Share 分組卡片。
- Block Edit：Export、Theme、Width 與現有 block editor 選單不被影響。
- rich item 的 title 與 subtitle 必須完整可見；hover/focus 背景必須填滿其所屬 menu/group card 內框；長內容不得被固定高度裁切。
- 保持既有文案、操作事件、鍵盤導航、深淺主題與手機 viewport 行為。

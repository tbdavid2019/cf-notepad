# 888wiki Usage Guide

[Project homepage](../README.md) · [Traditional Chinese](USAGE.zh-TW.md) · [Installation](INSTALLATION.md) · [Feature guide](FEATURES.md)

This guide covers the four note formats, the shared publish flow, and Seal release controls.

## 1. Create a note in the right format

Open **+ New** and choose **Markdown**, **Block**, **Canvas**, or **Whiteboard**. Each new note keeps its selected format. Choose Markdown for flowing text, Block for rearrangeable content sections, Canvas for connected cards, or Whiteboard for freeform drawings.

## 2. Write in Markdown

Create a [Markdown note](https://wiki.david888.com/new/markdown). The editor has a source pane and a rendered preview. Use the footer controls to change the layout and preview device. The toolbar and import menu help you insert common Markdown structures, files, images, audio, and links.

Markdown supports GFM, math, Mermaid and Graphviz diagrams, ECharts, citations and footnotes, GitHub-style alerts, and the project's extended formatting syntax. Use `Cmd/Ctrl+F` to search and `Cmd/Ctrl+H` to search and replace. Paste or drop an image to choose direct R2 upload, local OCR, or table recognition.

For audio, choose transcript import or smart formatting. The transcript can include timestamps. You can also record from the toolbar; review participant consent before recording.

## 3. Build a Block document

Create a [Block note](https://wiki.david888.com/new/block). Click the inline **+** to add a block, type `/` to search block types, and drag a block handle to reorder content. Use the floating formatting toolbar to style selected text.

Insert text, headings, lists, tables, images, files, links, YouTube, PDF, audio, Mermaid, ECharts, and supported embeds. Supported embedded blocks can be edited in place. Use the footer export actions for PNG, HTML, or PDF/print. Markdown export is available from Markdown notes.

## 4. Map ideas in Canvas

Create a [Canvas note](https://wiki.david888.com/new/canvas). A new Canvas starts empty.

1. Select **Add** in the bottom toolbar.
2. Choose a thought card: Problem, Benefit, Solution, Cause, Criterion, Detriment, Question, or Note.
3. Drag cards to arrange them. Double-click a card to edit its text; drag a resize handle to change its size.
4. Connect cards from their edge handles. Select a connection to change its direction, line style, weight, or color.
5. Use Undo/Redo while arranging. Use Fit to bring the graph into view, and search to find card text.
6. Open the file menu to import or export `.canvas`, export PNG/SVG, create a graph from Markdown WikiLinks, or clear the Canvas. Clear can be undone.

The Add menu also accepts image and file assets. Images use R2; audio, video, and document attachments use the configured 888box upload service. Published Canvas notes open as read-only interactive graphs.

## 5. Sketch on a Whiteboard

Create a [Whiteboard note](https://wiki.david888.com/new/whiteboard). Use the Excalidraw canvas tools to draw, add shapes and text, and arrange a visual explanation. Whiteboard is suited to freeform sketches; use Canvas when cards and labeled relationships are central.

Published Whiteboards are read-only. Export a drawing as PNG or SVG from the Whiteboard export controls.

## 6. Publish and share

Use the footer's **Share** controls to publish a note and create its share link. The publication dialog controls publishing, autosave, and public indexing. You can also configure reader/edit passwords and paragraph annotations. Copy the share URL to send the published page.

Readers can open supported notes as a book or slide presentation. The detailed feature guide covers book structure, presentation separators, exports, and other reader tools.

## 7. Control release with Seal

Seal is configured independently from reader and edit passwords. In the editor, open the footer's **Seal** button, choose a mode, enter its parameters, then select **Create Seal**. The Seal indicator shows when a release rule is active. **Remove Seal** clears the rule. Changes take effect immediately.

| Seal mode | What happens | Configure |
| --- | --- | --- |
| **Time Lock** | Visitors see a countdown page until the release time, then the note becomes available. | Pick the date and time, or use a `+1h`, `+1d`, `+3d`, `+7d`, or `+30d` shortcut. |
| **Burn After Read** | The note is destroyed after it reaches its view limit. | Set the maximum number of views. A reveal step helps prevent link preview crawlers from consuming a view. |
| **Dead Man's Switch** | The note stays sealed while you check in on schedule; it is released if the interval passes without a pulse. | Set the interval in minutes. Send a pulse in the Seal dialog or use its private pulse URL. Saving an edit also refreshes the pulse. |
| **Expiration** | The share expires and is removed when its retention period ends. | Choose `10m`, `1h`, `1d`, `7d`, or `30d`. |

The Seal dialog includes ten scenario presets for common cases such as a one-time password, scheduled announcement, course release, and emergency backup. A preset fills Seal settings only; it does not edit the note body. Review the selected mode, dates, and limits before creating the Seal.

## 8. Keep writing offline

The offline workstation saves drafts to browser storage first and syncs pending changes when the network returns. Use its draft list and conflict choices to compare local and cloud versions before resolving a conflict. Export a backup regularly when working offline for long periods.

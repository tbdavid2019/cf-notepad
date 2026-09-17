# Third-Party Software Notices and Information

This project incorporates components from the following third-party open-source projects:

---

## Ameliorate

- **Repository**: <https://github.com/amelioro/ameliorate>
- **Showcase**: <https://reactflow.dev/showcase>
- **Reference Commit**: `0cacee5577438979b651dd808793c4cbd13864ee`
- **License**: MIT License
- **Copyright**: Copyright (c) 2022 Joel Keyser

### MIT License

```text
MIT License

Copyright (c) 2022 Joel Keyser

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

### Ported and Adapted Components in `static/js/canvas-v2/`

The Canvas v2 user interface and interaction layer adapts the architecture, patterns, and component structures from Ameliorate:

| Ameliorate Upstream Source | Canvas v2 Target | Adaptation / Notes |
|---|---|---|
| `src/web/topic/components/Diagram/Diagram.tsx` | `static/js/canvas-v2/components/Diagram/Diagram.jsx` | React Flow composition, loose connection mode, elevate edges, viewport controls |
| `src/web/topic/components/Diagram/Diagram.styles.tsx` | `static/js/canvas-v2/canvas-v2.css` | Isolated canvas stylesheet, spotlight / selected states |
| `src/web/topic/components/Diagram/externalFlowStore.ts` | `static/js/canvas-v2/components/Diagram/viewportHelpers.mjs` | Viewport zoom / fit / pan helpers |
| `src/web/topic/components/Node/FlowNode.tsx` | `static/js/canvas-v2/components/Node/FlowNode.jsx` | Base node shell, handles placement, selection, resizing |
| `src/web/topic/components/Node/EditableNode.tsx` | `static/js/canvas-v2/components/Node/*.jsx` | Specialized card editors (Markdown, Sticky, Wiki, Link, Group) |
| `src/web/topic/components/Node/NodeHandle.tsx` | `static/js/canvas-v2/components/Node/NodeHandle.jsx` | 4-sided loose handles with visibility-based measurement preservation |
| `src/web/topic/components/Node/NodeToolbar.tsx` | `static/js/canvas-v2/components/Node/NodeToolbar.jsx` | Compact contextual action bar (colors, duplicate, delete) |
| `src/web/topic/components/Edge/Edge.tsx` | `static/js/canvas-v2/components/Edge/CanvasEdge.jsx` | Smoothstep edge path, 20px hit area, EdgeLabelRenderer |
| `src/web/topic/components/Edge/Edge.styles.tsx` | `static/js/canvas-v2/canvas-v2.css` | Edge spotlight and hover interaction styling |
| `src/web/topic/components/TopicWorkspace/MainToolbar.tsx` | `static/js/canvas-v2/components/Toolbar/MainToolbar.jsx` | Compact bottom toolbar for adding nodes, undo/redo, fit view, import/export |
| `src/web/topic/diagramStore/store.ts` | `static/js/canvas-v2/store/createCanvasStore.mjs` | Zustand store with history temporal pattern |
| `src/web/topic/diagramStore/createDeleteActions.ts` | `static/js/canvas-v2/model/canvasCommands.mjs` | Node/Edge transactional commands |

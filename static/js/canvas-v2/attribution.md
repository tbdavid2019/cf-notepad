# Canvas v2 Architecture & Attribution

This directory contains the Canvas v2 interaction layer and UI components, ported and adapted from **Ameliorate** (<https://github.com/amelioro/ameliorate>).

- **Upstream Commit**: `0cacee5577438979b651dd808793c4cbd13864ee`
- **Copyright**: (c) 2022 Joel Keyser
- **License**: MIT (see `THIRD_PARTY_NOTICES.md` at repository root)

## Design Principles

1. **Strict JSON Canvas 1.0 Boundary**:
   Internal store representations cleanly map to and from JSON Canvas 1.0 via `model/jsonCanvasAdapter.mjs`.

2. **Isolated Stylesheet**:
   All canvas component styling resides in `canvas-v2.css` and `tokens.css`, preventing style leaks into and from the core notepad layout.

3. **Zustand Command-Driven History**:
   Diagram mutations go through transactional commands with single-step undo/redo for batch drag, resize, and styling operations.

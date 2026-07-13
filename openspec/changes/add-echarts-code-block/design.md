## Context

The current browser renderer transforms supported diagram fences into hidden source plus a render container, then lazily loads each diagram library from a CDN. ECharts follows the same lifecycle, but its chart instance must be initialized after the container has width and height and resized when the preview layout changes.

## Goals / Non-Goals

**Goals:**

- Support the user's JSON ` ```echarts ` example and common ECharts option objects.
- Load ECharts only when an ECharts block is present.
- Avoid executing arbitrary JavaScript from note content.
- Dispose prior chart instances before Markdown preview replacement to avoid leaks.
- Keep chart rendering compatible with desktop split view, stacked view, and mobile preview.

**Non-Goals:**

- Support JavaScript function values in options such as function formatters or custom series.
- Add a server-side ECharts dependency or render charts in Worker code.
- Add chart editing controls beyond the existing Markdown editor.

## Decisions

- Use JSON.parse for fenced content. This intentionally supports JSON options and rejects JavaScript object-literal syntax or executable functions.
- Use the Apache ECharts 6.1.0 browser bundle from jsDelivr, pinned to a release version. The library is loaded lazily through the existing script loader.
- Use a dedicated static ES module for parsing and chart lifecycle. It exposes pure parsing/render helpers for tests and keeps the large inline renderer smaller.
- Use a `ResizeObserver` when available and window resize as a fallback. Dispose every chart and observer when the preview is re-rendered.
- Set the chart container's accessible role and label from the option title when available.

## Risks / Trade-offs

- [Risk] Invalid JSON or unsupported executable-style options fail to render → show an inline error message while preserving the source block.
- [Risk] CDN failure prevents charts from loading → isolate the failure to ECharts blocks and leave other Markdown rendering available.
- [Risk] Large or complex options consume client resources → load only on demand and dispose instances on replacement.
- [Risk] ECharts SVG/canvas content may not match every theme → give the option object control of chart colors and keep a neutral container style.

## Migration Plan

1. Add parser/lifecycle tests.
2. Add ECharts fence detection and lazy rendering.
3. Add responsive/error styles and verify the provided pie-chart option.
4. Deploy; rollback is removing the ECharts branch and static helper.

## Open Questions

- None for JSON-only ECharts option blocks.

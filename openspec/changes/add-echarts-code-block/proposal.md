## Why

Notes already support several diagram code fences, but ECharts option blocks are currently shown only as code. Adding ECharts rendering enables interactive charts directly inside notes without changing the stored Markdown format.

## What Changes

- Recognize fenced code blocks tagged `echarts`.
- Parse the block body strictly as JSON and render it with Apache ECharts.
- Provide a fixed responsive chart container and resize it when the preview layout changes.
- Show a readable error state for invalid JSON or chart initialization failures.
- Keep the original Markdown source intact and preserve all existing diagram types.

## Capabilities

### New Capabilities
- `echarts-code-block`: Render JSON ECharts options embedded in Markdown code fences.

### Modified Capabilities
- None.

## Impact

- Affects the browser Markdown renderer, diagram styles, static client helper, and tests.
- Adds one pinned CDN asset request for Apache ECharts 6.1.0 when a note contains an ECharts block.
- No backend route, storage schema, or Markdown migration is required.

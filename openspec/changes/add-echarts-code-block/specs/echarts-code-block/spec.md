## ADDED Requirements

### Requirement: Recognize ECharts fences
The Markdown renderer SHALL recognize fenced code blocks whose language is `echarts` and replace them with a chart render container while retaining the source option for diagnostics.

#### Scenario: ECharts fence in a note
- **WHEN** Markdown contains a ` ```echarts ` block with a JSON option object
- **THEN** the preview renders an ECharts chart in place of the code block
- **AND** the stored Markdown remains unchanged

#### Scenario: Other code fences
- **WHEN** Markdown contains a non-ECharts code fence
- **THEN** its existing rendering behavior remains unchanged

### Requirement: Parse options without code execution
The ECharts renderer SHALL accept valid JSON objects only and SHALL NOT evaluate JavaScript from the note content.

#### Scenario: Valid JSON option
- **WHEN** the block body parses to a non-array JSON object
- **THEN** the object is passed to ECharts as the chart option

#### Scenario: Invalid or non-object JSON
- **WHEN** the block body is invalid JSON, a JSON array, or a primitive
- **THEN** the chart is not initialized
- **AND** an inline error state is shown

### Requirement: Responsive lifecycle
The chart container SHALL have a usable default height, resize with its container, and dispose its ECharts instance before the preview is replaced.

#### Scenario: Preview layout changes
- **WHEN** the preview pane or viewport changes size
- **THEN** the chart instance receives a resize operation

#### Scenario: Markdown re-render
- **WHEN** the note preview is rendered again
- **THEN** prior ECharts instances and observers are disposed before new charts are initialized

### Requirement: Accessible chart output
The rendered chart container SHALL expose an image-like accessible role and a useful label derived from the chart title when available.

#### Scenario: Titled chart
- **WHEN** the option includes `title.text`
- **THEN** the render container has `role="img"` and uses that title as its accessible label

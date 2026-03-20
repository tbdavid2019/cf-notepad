## ADDED Requirements

### Requirement: Mermaid diagram text rendering
The system SHALL render Mermaid diagrams with correct text bounding boxes and line spacing, ensuring that multi-line text does not overlap or get clipped.

#### Scenario: Rendering a complex workflow diagram
- **WHEN** a Markdown document contains a Mermaid diagram with multi-line text nodes
- **THEN** the diagram renders with adequate spacing and all text is fully legible without overlapping

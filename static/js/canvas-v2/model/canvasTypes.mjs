/**
 * Canvas v2 Types & Constants
 * Ported from Ameliorate design system, adapted for JSON Canvas 1.0.
 */

export const NODE_DIMENSIONS = {
    text: { width: 320, height: 180, minWidth: 220, minHeight: 120 },
    sticky: { width: 240, height: 160, minWidth: 180, minHeight: 120 },
    file: { width: 280, height: 132, minWidth: 220, minHeight: 100 },
    link: { width: 280, height: 132, minWidth: 220, minHeight: 100 },
    group: { width: 480, height: 300, minWidth: 240, minHeight: 160 },
}

export const CANVAS_COLOR_PRESETS = [
    { id: 'none', label: '預設 / Default', value: '', preview: 'var(--canvas-paper, #ffffff)' },
    { id: '1', label: '紅色 / Red', value: '#ef4444', preview: '#ef4444' },
    { id: '2', label: '橙色 / Orange', value: '#f97316', preview: '#f97316' },
    { id: '3', label: '黃色 / Yellow', value: '#eab308', preview: '#eab308' },
    { id: '4', label: '綠色 / Green', value: '#22c55e', preview: '#22c55e' },
    { id: '5', label: '藍色 / Blue', value: '#3b82f6', preview: '#3b82f6' },
    { id: '6', label: '紫色 / Purple', value: '#8b5cf6', preview: '#8b5cf6' },
]

export const STICKY_PALETTE = [
    { id: 'yellow', value: '#fff9c4', label: '鵝黃 / Yellow' },
    { id: 'green', value: '#dcedc8', label: '薄荷綠 / Green' },
    { id: 'blue', value: '#bbdefb', label: '天空藍 / Blue' },
    { id: 'pink', value: '#f8bbd0', label: '櫻花粉 / Pink' },
    { id: 'purple', value: '#e1bee7', label: '淺紫 / Purple' },
    { id: 'orange', value: '#ffe0b2', label: '蜜橙 / Orange' },
]

export const EDGE_COLORS = [
    { id: 'default', value: '#2563a6', label: '經典藍 / Blue' },
    { id: 'gray', value: '#64748b', label: '石板灰 / Slate' },
    { id: 'green', value: '#10b981', label: '翡翠綠 / Green' },
    { id: 'yellow', value: '#f59e0b', label: '琥珀黃 / Amber' },
    { id: 'red', value: '#ef4444', label: '玫瑰紅 / Red' },
    { id: 'purple', value: '#8b5cf6', label: '神秘紫 / Purple' },
]

export const EDGE_ARROW_OPTIONS = [
    { value: 'none:none', label: '無箭頭 / None' },
    { value: 'none:arrow', label: '終點箭頭 / End' },
    { value: 'arrow:none', label: '起點箭頭 / Start' },
    { value: 'arrow:arrow', label: '雙向箭頭 / Both' },
]

export const EDGE_LINE_OPTIONS = [
    { value: 'solid', label: '實線 / Solid' },
    { value: 'dashed', label: '虛線 / Dashed' },
    { value: 'dotted', label: '點線 / Dotted' },
]

export const EDGE_WIDTH_OPTIONS = [
    { value: '1.5', label: '細 / Thin' },
    { value: '2.5', label: '中 / Medium' },
    { value: '4', label: '粗 / Thick' },
]

export const DEFAULT_EDGE_COLOR = '#2563a6'
export const DEFAULT_EDGE_WIDTH = 2.5
export const DEFAULT_EDGE_STYLE = 'solid'

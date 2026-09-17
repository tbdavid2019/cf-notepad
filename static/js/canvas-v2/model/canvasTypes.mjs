/**
 * Canvas v2 Types & Constants
 * Ported from Ameliorate design system, adapted for JSON Canvas 1.0.
 */

export const NODE_DIMENSIONS = {
    text: { width: 200, height: 76, minWidth: 140, minHeight: 56 },
    sticky: { width: 200, height: 120, minWidth: 140, minHeight: 80 },
    file: { width: 220, height: 80, minWidth: 160, minHeight: 60 },
    link: { width: 220, height: 80, minWidth: 160, minHeight: 60 },
    group: { width: 440, height: 260, minWidth: 200, minHeight: 120 },
}

export const AMELIORATE_NODE_TYPES = {
    problem: {
        id: 'problem',
        name: 'Problem',
        nameZh: '問題',
        icon: '🧩',
        color: '#c084fc',
        borderColor: '#a855f7',
        badgeBg: '#c084fc',
        bgLight: '#f5efff',
        bgDark: '#2e1065',
        borderLight: '#a855f7',
        borderDark: '#c084fc',
        textColor: '#1e1b4b',
    },
    benefit: {
        id: 'benefit',
        name: 'Benefit',
        nameZh: '效益',
        icon: '🌱',
        color: '#86efac',
        borderColor: '#4ade80',
        badgeBg: '#86efac',
        bgLight: '#f0fdf4',
        bgDark: '#052e16',
        borderLight: '#4ade80',
        borderDark: '#86efac',
        textColor: '#064e3b',
    },
    solution: {
        id: 'solution',
        name: 'Solution',
        nameZh: '解決方案',
        icon: '💡',
        color: '#93c5fd',
        borderColor: '#3b82f6',
        badgeBg: '#93c5fd',
        bgLight: '#eff6ff',
        bgDark: '#082f49',
        borderLight: '#60a5fa',
        borderDark: '#93c5fd',
        textColor: '#0c4a6e',
    },
    cause: {
        id: 'cause',
        name: 'Cause',
        nameZh: '成因',
        icon: '🔀',
        color: '#fdba74',
        borderColor: '#f97316',
        badgeBg: '#fdba74',
        bgLight: '#fff7ed',
        bgDark: '#431407',
        borderLight: '#fb923c',
        borderDark: '#fdba74',
        textColor: '#7c2d12',
    },
    criterion: {
        id: 'criterion',
        name: 'Criterion',
        nameZh: '評估標準',
        icon: '📋',
        color: '#fde047',
        borderColor: '#eab308',
        badgeBg: '#fde047',
        bgLight: '#fefce8',
        bgDark: '#422006',
        borderLight: '#facc15',
        borderDark: '#fde047',
        textColor: '#713f12',
    },
    detriment: {
        id: 'detriment',
        name: 'Detriment',
        nameZh: '缺點 / 風險',
        icon: '⚠️',
        color: '#fda4af',
        borderColor: '#f43f5e',
        badgeBg: '#fda4af',
        bgLight: '#fff1f2',
        bgDark: '#4c0519',
        borderLight: '#fb7185',
        borderDark: '#fda4af',
        textColor: '#881337',
    },
    question: {
        id: 'question',
        name: 'Question',
        nameZh: '疑問',
        icon: '❓',
        color: '#67e8f9',
        borderColor: '#06b6d4',
        badgeBg: '#67e8f9',
        bgLight: '#ecfeff',
        bgDark: '#083344',
        borderLight: '#22d3ee',
        borderDark: '#67e8f9',
        textColor: '#164e63',
    },
    note: {
        id: 'note',
        name: 'Note',
        nameZh: '筆記',
        icon: '📄',
        color: '#cbd5e1',
        borderColor: '#94a3b8',
        badgeBg: '#cbd5e1',
        bgLight: '#f8fafc',
        bgDark: '#0f172a',
        borderLight: '#94a3b8',
        borderDark: '#cbd5e1',
        textColor: '#1e293b',
    },
}

export function getNodeTypeConfig(nodeType, color) {
    if (nodeType && AMELIORATE_NODE_TYPES[nodeType]) {
        return AMELIORATE_NODE_TYPES[nodeType]
    }
    if (color) {
        const hex = String(color).toLowerCase()
        for (const key of Object.keys(AMELIORATE_NODE_TYPES)) {
            const cfg = AMELIORATE_NODE_TYPES[key]
            if (cfg.color.toLowerCase() === hex || cfg.borderColor.toLowerCase() === hex || cfg.badgeBg.toLowerCase() === hex) {
                return cfg
            }
        }
    }
    return AMELIORATE_NODE_TYPES.note
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
    { id: 'default', value: '#94a3b8', label: '石板灰 / Slate' },
    { id: 'blue', value: '#2563a6', label: '經典藍 / Blue' },
    { id: 'green', value: '#10b981', label: '翡翠綠 / Green' },
    { id: 'yellow', value: '#f59e0b', label: '琥珀黃 / Amber' },
    { id: 'red', value: '#ef4444', label: '玫瑰紅 / Red' },
    { id: 'purple', value: '#8b5cf6', label: '神秘紫 / Purple' },
]

export const EDGE_ARROW_OPTIONS = [
    { value: 'none:arrow', label: '終點箭頭 / End (▷)' },
    { value: 'none:none', label: '無箭頭 / None' },
    { value: 'arrow:none', label: '起點箭頭 / Start (◁)' },
    { value: 'arrow:arrow', label: '雙向箭頭 / Both (◁▷)' },
]

export const EDGE_LINE_OPTIONS = [
    { value: 'solid', label: '實線 / Solid' },
    { value: 'dashed', label: '虛線 / Dashed' },
    { value: 'dotted', label: '點線 / Dotted' },
]

export const EDGE_WIDTH_OPTIONS = [
    { value: '1.5', label: '細 / Thin (1.5px)' },
    { value: '2.5', label: '中 / Medium (2.5px)' },
    { value: '4', label: '粗 / Thick (4px)' },
]

export const DEFAULT_EDGE_COLOR = '#94a3b8'
export const DEFAULT_EDGE_WIDTH = 1.5
export const DEFAULT_EDGE_STYLE = 'solid'
export const DEFAULT_EDGE_LABEL = 'causes'


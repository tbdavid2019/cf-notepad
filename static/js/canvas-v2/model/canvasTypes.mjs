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
        color: '#9333ea',
        borderColor: '#e9d5ff',
        badgeBg: '#f3e8ff',
        bgLight: '#ffffff',
        bgDark: '#1e1035',
        borderLight: '#e9d5ff',
        borderDark: '#581c87',
        textColor: '#6b21a8',
    },
    benefit: {
        id: 'benefit',
        name: 'Benefit',
        nameZh: '效益',
        icon: '🌱',
        color: '#16a34a',
        borderColor: '#bbf7d0',
        badgeBg: '#dcfce7',
        bgLight: '#ffffff',
        bgDark: '#052e16',
        borderLight: '#bbf7d0',
        borderDark: '#166534',
        textColor: '#15803d',
    },
    solution: {
        id: 'solution',
        name: 'Solution',
        nameZh: '解決方案',
        icon: '💡',
        color: '#2563eb',
        borderColor: '#bfdbfe',
        badgeBg: '#dbeafe',
        bgLight: '#ffffff',
        bgDark: '#0c2340',
        borderLight: '#bfdbfe',
        borderDark: '#1e40af',
        textColor: '#1d4ed8',
    },
    cause: {
        id: 'cause',
        name: 'Cause',
        nameZh: '成因',
        icon: '🔀',
        color: '#ea580c',
        borderColor: '#fed7aa',
        badgeBg: '#ffedd5',
        bgLight: '#ffffff',
        bgDark: '#2e1505',
        borderLight: '#fed7aa',
        borderDark: '#9a3412',
        textColor: '#c2410c',
    },
    criterion: {
        id: 'criterion',
        name: 'Criterion',
        nameZh: '評估標準',
        icon: '📋',
        color: '#ca8a04',
        borderColor: '#fef08a',
        badgeBg: '#fef9c3',
        bgLight: '#ffffff',
        bgDark: '#2a1e05',
        borderLight: '#fef08a',
        borderDark: '#854d0e',
        textColor: '#854d0e',
    },
    detriment: {
        id: 'detriment',
        name: 'Detriment',
        nameZh: '缺點 / 風險',
        icon: '⚠️',
        color: '#e11d48',
        borderColor: '#fecdd3',
        badgeBg: '#ffe4e6',
        bgLight: '#ffffff',
        bgDark: '#2f0814',
        borderLight: '#fecdd3',
        borderDark: '#9f1239',
        textColor: '#be123c',
    },
    question: {
        id: 'question',
        name: 'Question',
        nameZh: '疑問',
        icon: '❓',
        color: '#0891b2',
        borderColor: '#99f6e4',
        badgeBg: '#ccfbf1',
        bgLight: '#ffffff',
        bgDark: '#042727',
        borderLight: '#99f6e4',
        borderDark: '#115e59',
        textColor: '#0f766e',
    },
    note: {
        id: 'note',
        name: 'Note',
        nameZh: '筆記',
        icon: '📄',
        color: '#475569',
        borderColor: '#e2e8f0',
        badgeBg: '#f1f5f9',
        bgLight: '#ffffff',
        bgDark: '#0f172a',
        borderLight: '#e2e8f0',
        borderDark: '#334155',
        textColor: '#334155',
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
    { id: '1', label: '薄暮紅 / Rose', value: '#ffe4e6', preview: '#f43f5e' },
    { id: '2', label: '暖杏橙 / Peach', value: '#ffedd5', preview: '#f97316' },
    { id: '3', label: '麥金黃 / Amber', value: '#fef9c3', preview: '#eab308' },
    { id: '4', label: '薄荷綠 / Sage', value: '#dcfce7', preview: '#22c55e' },
    { id: '5', label: '靜海藍 / Sky', value: '#dbeafe', preview: '#3b82f6' },
    { id: '6', label: '丁香紫 / Violet', value: '#f3e8ff', preview: '#a855f7' },
]

export const STICKY_PALETTE = [
    { id: 'yellow', value: '#fef9c3', label: '奶油黃 / Butter' },
    { id: 'green', value: '#dcfce7', label: '淺青綠 / Sage' },
    { id: 'blue', value: '#dbeafe', label: '淡水藍 / Sky' },
    { id: 'pink', value: '#ffe4e6', label: '柔和粉 / Rose' },
    { id: 'purple', value: '#f3e8ff', label: '淡香芋 / Lilac' },
    { id: 'orange', value: '#ffedd5', label: '杏仁橘 / Peach' },
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


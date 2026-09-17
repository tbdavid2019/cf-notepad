/**
 * Color luminance and WCAG contrast helpers for Canvas cards and nodes.
 */

export function computeContrastTheme(colorHex) {
    if (!colorHex) return null
    let hex = String(colorHex).trim().replace('#', '')
    if (hex.length === 3) {
        hex = hex.split('').map(c => c + c).join('')
    }
    if (hex.length !== 6) return null
    const r = parseInt(hex.substring(0, 2), 16)
    const g = parseInt(hex.substring(2, 4), 16)
    const b = parseInt(hex.substring(4, 6), 16)
    if (Number.isNaN(r) || Number.isNaN(g) || Number.isNaN(b)) return null
    const luminance = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255
    const isLightBg = luminance > 0.45
    return {
        isLightBg,
        color: isLightBg ? '#0f172a' : '#f8fafc',
        mutedColor: isLightBg ? '#475569' : '#cbd5e1',
        borderColor: isLightBg ? 'rgba(0, 0, 0, 0.15)' : 'rgba(255, 255, 255, 0.2)',
    }
}

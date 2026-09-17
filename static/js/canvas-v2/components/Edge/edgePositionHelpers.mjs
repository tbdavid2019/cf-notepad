/**
 * Edge positioning and viewport collision avoidance helpers.
 * Ensures EdgeToolbar and popovers stay within visible canvas boundaries.
 */

export function computeEdgeToolbarPosition({
    labelX,
    labelY,
    toolbarWidth = 140,
    toolbarHeight = 36,
    viewportWidth = 800,
    viewportHeight = 600,
    padding = 16,
    offsetY = 32,
}) {
    let x = Number.isFinite(labelX) ? labelX : 0
    let y = Number.isFinite(labelY) ? labelY - offsetY : 0

    // Collision avoidance with top viewport edge
    if (y - toolbarHeight / 2 < padding) {
        y = labelY + offsetY // flip below label
    }

    // Collision avoidance with bottom viewport edge
    const maxY = viewportHeight - padding - toolbarHeight / 2
    if (y > maxY) {
        y = maxY
    }

    // Horizontal boundaries (supporting narrow 320px screens)
    const minX = padding + toolbarWidth / 2
    const maxX = viewportWidth - padding - toolbarWidth / 2

    if (maxX >= minX) {
        if (x < minX) x = minX
        if (x > maxX) x = maxX
    } else {
        x = viewportWidth / 2
    }

    return {
        x: Math.round(x),
        y: Math.round(y),
    }
}

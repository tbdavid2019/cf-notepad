const VIEW_SHORTCUTS = Object.freeze({
    '7': Object.freeze({ mode: 'md', splitDirection: 'horizontal' }),
    '8': Object.freeze({ mode: 'plain' }),
    '9': Object.freeze({ mode: 'md', splitDirection: 'vertical' }),
})

export const getEditorViewShortcut = event => {
    if (!event || (!event.metaKey && !event.ctrlKey) || !event.altKey || event.shiftKey) return null
    return VIEW_SHORTCUTS[String(event.key)] || null
}

// The editor template is intentionally kept as a classic script because it
// contains the application state. Expose only this pure mapping to it.
if (typeof window !== 'undefined') window.getEditorViewShortcut = getEditorViewShortcut


/**
 * History manager for Canvas v2
 * Provides transactional undo/redo for canvas mutations.
 */

const MAX_HISTORY_STEPS = 50

export function createHistoryState() {
    return {
        past: [],
        future: [],
    }
}

export function recordHistoryStep(history, snapshot) {
    const nextPast = [...history.past.slice(-(MAX_HISTORY_STEPS - 1)), snapshot]
    return {
        past: nextPast,
        future: [],
    }
}

export function undoHistoryStep(history, currentSnapshot) {
    if (history.past.length === 0) return null
    const newPast = [...history.past]
    const previousSnapshot = newPast.pop()
    const nextFuture = [currentSnapshot, ...history.future.slice(0, MAX_HISTORY_STEPS - 1)]

    return {
        history: {
            past: newPast,
            future: nextFuture,
        },
        snapshot: previousSnapshot,
    }
}

export function redoHistoryStep(history, currentSnapshot) {
    if (history.future.length === 0) return null
    const newFuture = [...history.future]
    const nextSnapshot = newFuture.shift()
    const nextPast = [...history.past.slice(-(MAX_HISTORY_STEPS - 1)), currentSnapshot]

    return {
        history: {
            past: nextPast,
            future: newFuture,
        },
        snapshot: nextSnapshot,
    }
}

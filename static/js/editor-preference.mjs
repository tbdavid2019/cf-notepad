export const EDITOR_PREFERENCE_STORAGE_KEY = 'cf-notepad:editor-preference'
export const EDITOR_SESSION_PREFERENCE_KEY = 'cf-notepad:editor-session-preference'
export const DEFAULT_EDITOR_FORMAT = 'block'

const isEditorFormat = value => value === 'block' || value === 'markdown'

const storageGet = (storage, key) => {
    try { return storage?.getItem(key) || '' } catch { return '' }
}

const storageSet = (storage, key, value) => {
    try { storage?.setItem(key, value) } catch {}
}

const storageRemove = (storage, key) => {
    try { storage?.removeItem(key) } catch {}
}

export function hasEditorPreference(windowRef = window) {
    const remembered = storageGet(windowRef.localStorage, EDITOR_PREFERENCE_STORAGE_KEY)
    if (isEditorFormat(remembered)) return true

    return isEditorFormat(storageGet(windowRef.sessionStorage, EDITOR_SESSION_PREFERENCE_KEY))
}

export function getEditorPreference(windowRef = window) {
    const remembered = storageGet(windowRef.localStorage, EDITOR_PREFERENCE_STORAGE_KEY)
    if (isEditorFormat(remembered)) return { format: remembered, remembered: true }

    const session = storageGet(windowRef.sessionStorage, EDITOR_SESSION_PREFERENCE_KEY)
    if (isEditorFormat(session)) return { format: session, remembered: false }

    return { format: DEFAULT_EDITOR_FORMAT, remembered: false }
}

export function saveEditorPreference(format, { remember = false, windowRef = window } = {}) {
    if (!isEditorFormat(format)) throw new TypeError('Invalid editor format')
    storageSet(windowRef.sessionStorage, EDITOR_SESSION_PREFERENCE_KEY, format)
    if (remember) storageSet(windowRef.localStorage, EDITOR_PREFERENCE_STORAGE_KEY, format)
    else storageRemove(windowRef.localStorage, EDITOR_PREFERENCE_STORAGE_KEY)
    return { format, remembered: remember }
}

const getFocusable = modal => [...modal.querySelectorAll('button:not([disabled]), [href], input:not([disabled]), [tabindex]:not([tabindex="-1"])')]
    .filter(element => !element.hidden && !element.closest('[hidden]'))

export function initializeEditorPreference(documentRef = document, windowRef = window, { navigate } = {}) {
    const modal = documentRef.querySelector('[data-editor-preference-dialog]')
    const primaryLinks = [...documentRef.querySelectorAll('#new-note-link')]
    const settingsButtons = [...documentRef.querySelectorAll('#editor-preference-btn')]
    const goToNewNote = navigate || (format => windowRef.location.assign(`/new/${format}`))

    const applyPrimaryLink = format => {
        primaryLinks.forEach(link => link.setAttribute('href', `/new/${format}`))
    }
    const requirePrimaryChoice = () => {
        primaryLinks.forEach(link => {
            link.setAttribute('href', '#choose-editor')
            link.dataset.editorPreferenceRequired = 'true'
        })
    }

    const currentPreference = () => getEditorPreference(windowRef)
    if (hasEditorPreference(windowRef)) applyPrimaryLink(currentPreference().format)
    else requirePrimaryChoice()
    if (!modal) return { open: () => {}, close: () => {}, getPreference: currentPreference }

    const form = modal.querySelector('[data-editor-preference-form]')
    const rememberInput = modal.querySelector('[data-editor-preference-remember]')
    const closeButtons = [...modal.querySelectorAll('[data-editor-preference-close]')]
    const options = [...modal.querySelectorAll('input[name="editor-format"]')]
    const autoOpen = modal.dataset.editorPreferenceAutoOpen === 'true'
    let trigger = null
    let keyHandler = null
    let pendingNewNote = false

    const selectedFormat = () => options.find(option => option.checked)?.value || DEFAULT_EDITOR_FORMAT
    const syncOptionState = () => options.forEach(option => {
        option.closest('.editor-preference-option')?.classList.toggle('is-selected', option.checked)
    })
    const fill = preference => {
        const option = options.find(item => item.value === preference.format) || options.find(item => item.value === DEFAULT_EDITOR_FORMAT)
        if (option) option.checked = true
        if (rememberInput) rememberInput.checked = preference.remembered
        syncOptionState()
    }
    const close = ({ restoreFocus = true } = {}) => {
        if (autoOpen) return
        modal.style.display = 'none'
        modal.setAttribute('aria-hidden', 'true')
        if (keyHandler) modal.removeEventListener('keydown', keyHandler)
        keyHandler = null
        pendingNewNote = false
        if (restoreFocus && trigger?.isConnected) trigger.focus()
        trigger = null
    }
    const open = ({ opener = documentRef.activeElement, startNewNote = false } = {}) => {
        trigger = opener
        pendingNewNote = startNewNote
        fill(currentPreference())
        modal.style.display = 'block'
        modal.setAttribute('aria-hidden', 'false')
        keyHandler = event => {
            if (event.key === 'Escape' && !autoOpen) {
                event.preventDefault()
                close()
                return
            }
            if (event.key !== 'Tab') return
            const focusable = getFocusable(modal)
            if (!focusable.length) return
            const first = focusable[0]
            const last = focusable.at(-1)
            if (event.shiftKey && documentRef.activeElement === first) {
                event.preventDefault()
                last.focus()
            } else if (!event.shiftKey && documentRef.activeElement === last) {
                event.preventDefault()
                first.focus()
            }
        }
        modal.addEventListener('keydown', keyHandler)
        windowRef.setTimeout(() => (modal.querySelector('[data-editor-preference-confirm]') || getFocusable(modal)[0])?.focus(), 0)
    }

    options.forEach(option => option.addEventListener('change', syncOptionState))
    primaryLinks.forEach(link => link.addEventListener('click', event => {
        if (hasEditorPreference(windowRef)) return
        event.preventDefault()
        open({ opener: link, startNewNote: true })
    }))
    settingsButtons.forEach(button => button.addEventListener('click', event => {
        event.preventDefault()
        open({ opener: button })
    }))
    closeButtons.forEach(button => button.addEventListener('click', () => close()))
    form?.addEventListener('submit', event => {
        event.preventDefault()
        const preference = saveEditorPreference(selectedFormat(), {
            remember: rememberInput?.checked === true,
            windowRef,
        })
        applyPrimaryLink(preference.format)
        if (autoOpen || pendingNewNote) {
            pendingNewNote = false
            goToNewNote(preference.format)
        }
        else close()
    })

    if (autoOpen) {
        const preference = currentPreference()
        if (preference.remembered || storageGet(windowRef.sessionStorage, EDITOR_SESSION_PREFERENCE_KEY)) goToNewNote(preference.format)
        else open({ opener: null })
    }

    return { open, close, getPreference: currentPreference }
}

if (typeof document !== 'undefined') {
    const start = () => initializeEditorPreference()
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, { once: true })
    else start()
}

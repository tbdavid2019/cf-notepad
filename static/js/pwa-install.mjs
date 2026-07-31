export const isStandalonePwa = windowRef => {
    const standaloneDisplayMode = windowRef.matchMedia?.('(display-mode: standalone)').matches === true
    return standaloneDisplayMode || windowRef.navigator?.standalone === true
}

const DISMISSED_STORAGE_KEY = 'cf-notepad:pwa-install-dismissed'

const wasDismissed = windowRef => {
    try {
        return windowRef.localStorage?.getItem(DISMISSED_STORAGE_KEY) === '1'
    } catch {
        return false
    }
}

const rememberDismissal = windowRef => {
    try {
        windowRef.localStorage?.setItem(DISMISSED_STORAGE_KEY, '1')
    } catch {
        // Closing the prompt must still work when storage is unavailable.
    }
}

export const initPwaInstallPrompt = (documentRef = document, windowRef = window) => {
    const prompt = documentRef.getElementById('pwa-install-prompt')
    const installButton = documentRef.getElementById('pwa-install-button')
    const dismissButton = documentRef.getElementById('pwa-install-dismiss')
    if (!prompt || !installButton || !dismissButton) return false

    let deferredInstallPrompt = null
    let dismissed = wasDismissed(windowRef) || isStandalonePwa(windowRef)

    const hidePrompt = () => {
        deferredInstallPrompt = null
        prompt.hidden = true
    }

    windowRef.addEventListener('beforeinstallprompt', event => {
        event.preventDefault()
        if (dismissed || isStandalonePwa(windowRef)) return
        deferredInstallPrompt = event
        prompt.hidden = false
    })

    dismissButton.addEventListener('click', () => {
        dismissed = true
        rememberDismissal(windowRef)
        hidePrompt()
    })

    installButton.addEventListener('click', async () => {
        if (!deferredInstallPrompt) return
        installButton.disabled = true
        try {
            await deferredInstallPrompt.prompt()
        } finally {
            installButton.disabled = false
            hidePrompt()
        }
    })

    windowRef.addEventListener('appinstalled', () => {
        dismissed = true
        rememberDismissal(windowRef)
        hidePrompt()
    })

    return true
}

if (typeof window !== 'undefined' && typeof document !== 'undefined') {
    initPwaInstallPrompt()
}

export const isStandalonePwa = windowRef => {
    const standaloneDisplayMode = windowRef.matchMedia?.('(display-mode: standalone)').matches === true
    return standaloneDisplayMode || windowRef.navigator?.standalone === true
}

export const isAndroid = windowRef => /Android/i.test(windowRef.navigator?.userAgent || '')

export const initPwaInstallPrompt = (documentRef = document, windowRef = window) => {
    const prompt = documentRef.getElementById('pwa-install-prompt')
    const installButton = documentRef.getElementById('pwa-install-button')
    const dismissButton = documentRef.getElementById('pwa-install-dismiss')
    if (!prompt || !installButton || !dismissButton) return false

    let deferredInstallPrompt = null
    let dismissed = !isAndroid(windowRef) || isStandalonePwa(windowRef)

    const hidePrompt = () => {
        deferredInstallPrompt = null
        prompt.hidden = true
    }

    windowRef.addEventListener('beforeinstallprompt', event => {
        if (dismissed || !isAndroid(windowRef) || isStandalonePwa(windowRef)) return
        event.preventDefault()
        deferredInstallPrompt = event
        prompt.hidden = false
    })

    dismissButton.addEventListener('click', () => {
        dismissed = true
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
        hidePrompt()
    })

    return true
}

if (typeof window !== 'undefined' && typeof document !== 'undefined') {
    initPwaInstallPrompt()
}

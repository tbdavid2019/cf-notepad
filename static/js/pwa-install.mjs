export const isStandalonePwa = windowRef => {
    const standaloneDisplayMode = windowRef.matchMedia?.('(display-mode: standalone)').matches === true
    return standaloneDisplayMode || windowRef.navigator?.standalone === true
}

const DISMISSED_STORAGE_KEY = 'cf-notepad:pwa-install-dismissed'
export const DISMISSAL_TTL_MS = 24 * 60 * 60 * 1000

export const wasDismissed = windowRef => {
    try {
        const val = windowRef.localStorage?.getItem(DISMISSED_STORAGE_KEY)
        if (!val) return false
        const timestamp = Number(val)
        if (Number.isNaN(timestamp)) {
            return true
        }
        const now = windowRef.Date?.now ? windowRef.Date.now() : Date.now()
        return now - timestamp < DISMISSAL_TTL_MS
    } catch {
        return false
    }
}

export const rememberDismissal = windowRef => {
    try {
        const now = windowRef.Date?.now ? windowRef.Date.now() : Date.now()
        windowRef.localStorage?.setItem(DISMISSED_STORAGE_KEY, String(now))
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

    const hidePrompt = () => {
        deferredInstallPrompt = null
        prompt.hidden = true
    }

    windowRef.addEventListener('beforeinstallprompt', event => {
        event.preventDefault()
        if (wasDismissed(windowRef) || isStandalonePwa(windowRef)) return
        deferredInstallPrompt = event
        prompt.hidden = false
    })

    dismissButton.addEventListener('click', () => {
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
        rememberDismissal(windowRef)
        hidePrompt()
    })

    return true
}

export const initPwaFileHandling = (windowRef = window) => {
    if (typeof windowRef === 'undefined') return false
    if ('launchQueue' in windowRef && typeof windowRef.launchQueue?.setConsumer === 'function') {
        windowRef.launchQueue.setConsumer(async (launchParams) => {
            if (!launchParams.files || !launchParams.files.length) return
            try {
                for (const fileHandle of launchParams.files) {
                    const file = await fileHandle.getFile()
                    const text = await file.text()
                    if (typeof windowRef.__openLocalFileContent === 'function') {
                        windowRef.__openLocalFileContent({ name: file.name, text, handle: fileHandle })
                    } else {
                        // Store pending launch file in window
                        windowRef.__pendingLaunchFile = { name: file.name, text, handle: fileHandle }
                    }
                }
            } catch (err) {
                console.warn('PWA File Launch failed:', err)
            }
        })
        return true
    }
    return false
}

if (typeof window !== 'undefined' && typeof document !== 'undefined') {
    initPwaInstallPrompt()
    initPwaFileHandling()
}


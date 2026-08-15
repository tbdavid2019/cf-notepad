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

const safeShowToast = (windowRef, message) => {
    if (typeof windowRef?.showToast === 'function') {
        windowRef.showToast(message)
        return
    }
    const doc = windowRef?.document || (typeof document !== 'undefined' ? document : null)
    if (!doc) return
    let container = doc.getElementById('toast-container')
    if (!container) {
        container = doc.createElement('div')
        container.id = 'toast-container'
        doc.body?.appendChild(container)
    }
    const toast = doc.createElement('div')
    toast.className = 'toast show'
    const icon = doc.createElement('span')
    icon.className = 'toast-check'
    icon.textContent = 'ℹ️'
    const text = doc.createElement('span')
    text.textContent = String(message ?? '')
    toast.append(icon, text)
    container.appendChild(toast)
    setTimeout(() => {
        toast.classList.remove('show')
        setTimeout(() => toast.remove(), 300)
    }, 3500)
}

export const initPwaInstallPrompt = (documentRef = document, windowRef = window) => {
    const manualButtons = Array.from(documentRef.querySelectorAll ? documentRef.querySelectorAll('#pwa-install-manual-btn, .pwa-install-manual-btn') : [])

    let deferredInstallPrompt = windowRef.__deferredPwaPrompt || null

    const updateUiState = () => {
        const isStandalone = isStandalonePwa(windowRef)
        manualButtons.forEach(btn => {
            if (isStandalone) {
                btn.hidden = true
            }
        })
    }

    windowRef.__onPwaPromptReady = event => {
        deferredInstallPrompt = event
        windowRef.__deferredPwaPrompt = event
        updateUiState()
    }

    updateUiState()

    windowRef.addEventListener?.('beforeinstallprompt', event => {
        event.preventDefault?.()
        deferredInstallPrompt = event
        windowRef.__deferredPwaPrompt = event
        updateUiState()
    })

    const handleManualInstall = async btn => {
        const activePrompt = deferredInstallPrompt || windowRef.__deferredPwaPrompt

        if (activePrompt) {
            if (btn) btn.disabled = true
            try {
                await activePrompt.prompt()
                const choice = await activePrompt.userChoice
                if (choice && choice.outcome === 'accepted') {
                    deferredInstallPrompt = null
                    windowRef.__deferredPwaPrompt = null
                    const isZh = (documentRef?.documentElement?.lang || '').toLowerCase().startsWith('zh') || (windowRef?.navigator?.language || '').toLowerCase().startsWith('zh')
                    safeShowToast(windowRef, isZh ? '🎉 正在安裝 DAVID888 WIKI App...' : '🎉 Installing DAVID888 WIKI App...')
                }
            } catch (err) {
                console.warn('PWA install prompt error:', err)
            } finally {
                if (btn) btn.disabled = false
            }
        } else {
            const docLang = documentRef?.documentElement?.lang || ''
            const navLang = windowRef?.navigator?.language || ''
            const isZh = docLang.toLowerCase().startsWith('zh') || navLang.toLowerCase().startsWith('zh')
            const ua = windowRef?.navigator?.userAgent || ''
            const platform = windowRef?.navigator?.platform || ''
            const maxTouch = windowRef?.navigator?.maxTouchPoints || 0
            const isIOS = /iPad|iPhone|iPod/.test(ua) || (platform === 'MacIntel' && maxTouch > 1)
            const isMacSafari = /Safari/.test(ua) && !/Chrome|Chromium|Edg|OPR|Brave/.test(ua)

            let message = ''
            if (isStandalonePwa(windowRef)) {
                message = isZh ? 'DAVID888 WIKI 已經是獨立 App 模式！' : 'DAVID888 WIKI is already installed as an app!'
            } else if (isIOS) {
                message = isZh ? '📱 iOS 安裝方式：請點擊 Safari 底部的「分享」按鈕 ➔ 選擇「加入主畫面」' : '📱 iOS install: Tap Share button in Safari ➔ Add to Home Screen'
            } else if (isMacSafari) {
                message = isZh ? '🖥️ macOS Safari：請至上方選單「檔案」➔「加入 Dock」，或使用 Chrome 瀏覽器安裝' : '🖥️ macOS Safari: Go to File ➔ Add to Dock, or use Chrome browser'
            } else {
                message = isZh ? '💡 請點擊瀏覽器網址列右側的「⊕ 安裝」圖示，或在選單中選擇「安裝應用程式」' : '💡 Click the install icon in your browser address bar or select "Install app" in menu'
            }

            safeShowToast(windowRef, message)
        }
    }

    manualButtons.forEach(btn => {
        btn.addEventListener('click', () => handleManualInstall(btn))
    })

    windowRef.addEventListener?.('appinstalled', () => {
        rememberDismissal(windowRef)
        deferredInstallPrompt = null
        windowRef.__deferredPwaPrompt = null
        manualButtons.forEach(btn => { btn.hidden = true })
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


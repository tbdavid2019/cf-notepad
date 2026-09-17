import React, { useState } from 'react'

export function TopFloatingBar({ selectedNode }) {
    const [isPlaying, setIsPlaying] = useState(false)

    const isZh = () => {
        const lang = document.documentElement.getAttribute('lang')
        return lang && lang.startsWith('zh')
    }
    const zh = isZh()

    const handleToggleLang = () => {
        const currentLang = document.documentElement.getAttribute('lang') || 'zh-TW'
        const nextLang = currentLang.startsWith('zh') ? 'en-US' : 'zh-TW'
        document.documentElement.setAttribute('lang', nextLang)
        if (typeof window !== 'undefined' && window.APP_STATE) {
            window.APP_STATE.lang = nextLang
        }
        window.dispatchEvent(new CustomEvent('canvas:lang-change', { detail: { lang: nextLang } }))
        window.showToast?.(nextLang.startsWith('zh') ? '已切換為繁體中文' : 'Switched to English')
    }

    const handleSpeak = () => {
        if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
            window.showToast?.(zh ? '此瀏覽器不支援語音合成' : 'Text-to-speech not supported')
            return
        }

        if (isPlaying) {
            window.speechSynthesis.cancel()
            setIsPlaying(false)
            return
        }

        const textToRead = selectedNode?.data?.text || (zh ? '歡迎使用思考畫布' : 'Welcome to Canvas')
        const utterance = new SpeechSynthesisUtterance(textToRead)
        utterance.lang = zh ? 'zh-TW' : 'en-US'
        utterance.onend = () => setIsPlaying(false)
        utterance.onerror = () => setIsPlaying(false)

        setIsPlaying(true)
        window.speechSynthesis.speak(utterance)
    }

    const handleBookMode = () => {
        if (typeof window === 'undefined') return
        const path = window.location.pathname
        if (path.includes('/share/')) {
            window.open(path.replace(/\/+$/, '') + '/book', '_blank')
        } else {
            window.showToast?.(zh ? '分享發布後即可開啟書本閱讀模式' : 'Publish note to access Book Mode')
        }
    }

    return (
        <div className="canvas-top-floating-bar nodrag nopan">
            <button
                type="button"
                className="canvas-top-floating-btn"
                onClick={handleToggleLang}
                title={zh ? '切換中英文 (Language)' : 'Toggle Language'}
                aria-label="Toggle Language"
            >
                文A
            </button>

            <button
                type="button"
                className={`canvas-top-floating-btn ${isPlaying ? 'is-active' : ''}`}
                onClick={handleSpeak}
                title={isPlaying ? (zh ? '停止朗讀' : 'Stop Speaking') : (zh ? '朗讀卡片文字' : 'Read Aloud')}
                aria-label="Read Aloud"
            >
                {isPlaying ? '⏹' : '🔊'}
            </button>

            <button
                type="button"
                className="canvas-top-floating-btn"
                onClick={handleBookMode}
                title={zh ? '書本閱讀模式' : 'Book / Reader Mode'}
                aria-label="Book Mode"
            >
                📖
            </button>
        </div>
    )
}

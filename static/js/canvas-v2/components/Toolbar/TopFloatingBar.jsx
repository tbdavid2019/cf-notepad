import React, { useEffect, useRef, useState } from 'react'
import { useReactFlow } from '@xyflow/react'
import { Languages, Volume2, Square, BookOpen, PlayCircle } from 'lucide-react'

export function TopFloatingBar({ selectedNode, store }) {
    const [isPlaying, setIsPlaying] = useState(false)
    const [isTouring, setIsTouring] = useState(false)
    const tourTimerRef = useRef(null)
    const reactFlow = useReactFlow()

    const isZh = () => {
        const lang = document.documentElement.getAttribute('lang')
        return lang && lang.startsWith('zh')
    }
    const zh = isZh()

    useEffect(() => () => {
        if (tourTimerRef.current) window.clearTimeout(tourTimerRef.current)
    }, [])

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

    const stopTour = () => {
        if (tourTimerRef.current) window.clearTimeout(tourTimerRef.current)
        tourTimerRef.current = null
        setIsTouring(false)
    }

    const handleCameraTour = () => {
        if (isTouring) {
            stopTour()
            return
        }

        const nodes = (store?.getState().nodes || [])
            .filter(node => node.hidden !== true)
            .slice()
            .sort((a, b) => {
                const aOrder = a.data?.david888?.cameraTour?.order ?? Number.MAX_SAFE_INTEGER
                const bOrder = b.data?.david888?.cameraTour?.order ?? Number.MAX_SAFE_INTEGER
                return aOrder - bOrder || a.position.y - b.position.y || a.position.x - b.position.x
            })
        if (nodes.length === 0) {
            window.showToast?.(zh ? '畫布目前沒有可導覽的卡片' : 'There are no cards to tour')
            return
        }

        let index = 0
        setIsTouring(true)
        const visitNext = () => {
            if (index >= nodes.length) {
                stopTour()
                return
            }
            const node = reactFlow.getNode(nodes[index].id) || nodes[index]
            reactFlow.fitView({ nodes: [node], padding: 0.42, duration: 650 })
            index += 1
            tourTimerRef.current = window.setTimeout(visitNext, 1700)
        }
        visitNext()
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
                <Languages size={14} />
            </button>

            <button
                type="button"
                className={`canvas-top-floating-btn ${isPlaying ? 'is-active' : ''}`}
                onClick={handleSpeak}
                title={isPlaying ? (zh ? '停止朗讀' : 'Stop Speaking') : (zh ? '朗讀卡片文字' : 'Read Aloud')}
                aria-label="Read Aloud"
            >
                {isPlaying ? <Square size={13} fill="currentColor" /> : <Volume2 size={14} />}
            </button>

            <button
                type="button"
                className="canvas-top-floating-btn"
                onClick={handleBookMode}
                title={zh ? '書本閱讀模式' : 'Book Mode'}
                aria-label="Book Mode"
            >
                <BookOpen size={14} />
            </button>

            <button
                type="button"
                className={`canvas-top-floating-btn ${isTouring ? 'is-active' : ''}`}
                onClick={handleCameraTour}
                title={isTouring ? (zh ? '停止導覽' : 'Stop Camera Tour') : (zh ? '播放畫布導覽' : 'Play Camera Tour')}
                aria-label={isTouring ? 'Stop Camera Tour' : 'Play Camera Tour'}
            >
                {isTouring ? <Square size={13} fill="currentColor" /> : <PlayCircle size={14} />}
            </button>
        </div>
    )
}

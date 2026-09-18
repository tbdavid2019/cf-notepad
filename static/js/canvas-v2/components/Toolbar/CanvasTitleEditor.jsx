import React, { useEffect, useState } from 'react'
import { Check, Pencil, X } from 'lucide-react'

export function CanvasTitleEditor({ isEdit = true }) {
    const initialTitle = () => window.APP_STATE?.title || window.APP_STATE?.path || 'Canvas'
    const [title, setTitle] = useState(initialTitle)
    const [draft, setDraft] = useState(initialTitle)
    const [isEditing, setIsEditing] = useState(false)
    const [isSaving, setIsSaving] = useState(false)
    const isZh = document.documentElement.getAttribute('lang')?.startsWith('zh')

    useEffect(() => {
        const handleTitleChange = (event) => {
            const nextTitle = String(event.detail?.title || initialTitle())
            setTitle(nextTitle)
            setDraft(nextTitle)
        }
        window.addEventListener('canvas:title-change', handleTitleChange)
        return () => window.removeEventListener('canvas:title-change', handleTitleChange)
    }, [])

    const beginEditing = () => {
        if (!isEdit) return
        setDraft(title)
        setIsEditing(true)
    }

    const cancelEditing = () => {
        setDraft(title)
        setIsEditing(false)
    }

    const saveTitle = async () => {
        const nextTitle = draft.trim().slice(0, 200)
        if (!nextTitle) {
            cancelEditing()
            return
        }
        if (nextTitle === title) {
            setIsEditing(false)
            return
        }

        setIsSaving(true)
        try {
            const settingPath = window.APP_STATE?.settingPath || `${window.location.pathname.replace(/\/$/, '')}/setting`
            const response = await fetch(settingPath, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title: nextTitle }),
            })
            const payload = await response.json().catch(() => ({}))
            if (!response.ok || payload.err) throw new Error(payload.msg || 'Title save failed')

            setTitle(nextTitle)
            setDraft(nextTitle)
            setIsEditing(false)
            if (window.APP_STATE) window.APP_STATE.title = nextTitle
            document.title = `${nextTitle} - ${window.APP_STATE?.appName || 'david888 wiki'}`
            window.dispatchEvent(new CustomEvent('canvas:title-change', { detail: { title: nextTitle } }))
            window.showToast?.(isZh ? 'Canvas 標題已更新' : 'Canvas title updated')
        } catch (error) {
            window.showToast?.(isZh ? `標題儲存失敗：${error.message}` : `Title save failed: ${error.message}`)
        } finally {
            setIsSaving(false)
        }
    }

    if (isEditing) {
        return (
            <form
                className="canvas-title-editor is-editing nodrag nopan"
                onSubmit={(event) => {
                    event.preventDefault()
                    saveTitle()
                }}
            >
                <input
                    autoFocus
                    value={draft}
                    maxLength={200}
                    onChange={event => setDraft(event.target.value)}
                    onKeyDown={event => {
                        if (event.key === 'Escape') {
                            event.preventDefault()
                            cancelEditing()
                        }
                    }}
                    aria-label={isZh ? 'Canvas 標題' : 'Canvas title'}
                />
                <button type="submit" disabled={isSaving} aria-label={isZh ? '儲存標題' : 'Save title'} title={isZh ? '儲存' : 'Save'}>
                    <Check size={15} />
                </button>
                <button type="button" onClick={cancelEditing} aria-label={isZh ? '取消編輯' : 'Cancel'} title={isZh ? '取消' : 'Cancel'}>
                    <X size={15} />
                </button>
            </form>
        )
    }

    return (
        <div className="canvas-title-editor nodrag nopan">
            <span className="canvas-title-text" title={title}>{title}</span>
            {isEdit && (
                <button type="button" onClick={beginEditing} aria-label={isZh ? '編輯 Canvas 標題' : 'Edit Canvas title'} title={isZh ? '編輯標題' : 'Edit title'}>
                    <Pencil size={14} />
                </button>
            )}
        </div>
    )
}

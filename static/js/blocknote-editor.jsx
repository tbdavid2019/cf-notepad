import React, { useEffect, useMemo, useRef, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { BlockNoteSchema } from '@blocknote/core'
import { filterSuggestionItems, insertOrUpdateBlockForSlashMenu } from '@blocknote/core/extensions'
import { BlockNoteView } from '@blocknote/mantine'
import { SuggestionMenuController, createReactBlockSpec, getDefaultReactSlashMenuItems, useCreateBlockNote } from '@blocknote/react'
import '@blocknote/mantine/style.css'
import { blockNoteToTiptapDocument, tiptapToBlockNoteDocument } from '../../src/blocknote_document.mjs'

const root = document.querySelector('#block-editor')
const source = document.querySelector('#contents')
if (!root || !source) throw new Error('BlockNote editor requires #block-editor and #contents')

const resolveBlockNoteTheme = () => {
    const selectedTheme = document.documentElement.getAttribute('data-ui-theme')
    if (selectedTheme === 'dark') return 'dark'
    if (selectedTheme === 'light') return 'light'
    return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

function useBlockNoteTheme() {
    const [theme, setTheme] = useState(resolveBlockNoteTheme)

    useEffect(() => {
        const syncTheme = () => setTheme(resolveBlockNoteTheme())
        const rootThemeObserver = new MutationObserver(syncTheme)
        const mediaQuery = window.matchMedia?.('(prefers-color-scheme: dark)')
        rootThemeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['data-ui-theme'] })
        mediaQuery?.addEventListener?.('change', syncTheme)
        window.addEventListener('cf-notepad-ui-theme-change', syncTheme)
        return () => {
            rootThemeObserver.disconnect()
            mediaQuery?.removeEventListener?.('change', syncTheme)
            window.removeEventListener('cf-notepad-ui-theme-change', syncTheme)
        }
    }, [])

    return theme
}

const EMBED_KINDS = {
    youtube: { title: 'YouTube', detail: '嵌入 YouTube 影片', icon: '▶' },
    pdf: { title: 'PDF', detail: '嵌入 PDF 文件', icon: 'PDF' },
    file: { title: '附件連結', detail: '插入檔案網址', icon: '↗' },
    audio: { title: '音訊播放器', detail: '播放錄音或音訊檔案', icon: '🎙️' },
    mermaid: { title: 'Mermaid', detail: '插入流程圖', icon: '◇' },
    echarts: { title: 'ECharts', detail: '插入互動圖表', icon: '▥' },
    raw: { title: 'HTML 原始碼', detail: '以安全文字保留 HTML', icon: '</>' },
    slideBreak: { title: '簡報換頁', detail: '開始下一張投影片', icon: '—' },
}

const EMBED_PROP_SCHEMA = {
    kind: { default: 'file', values: ['image', 'file', 'youtube', 'pdf', 'mermaid', 'echarts', 'raw', 'slideBreak', 'audio'] },
    url: { default: '' }, title: { default: '' }, name: { default: '' }, alt: { default: '' }, src: { default: '' },
    source: { default: '' }, optionJson: { default: '' }, content: { default: '' }, mimeType: { default: '' }, width: { default: '' }, audioId: { default: '' },
}

const DavidEmbed = createReactBlockSpec({
    type: 'davidEmbed',
    propSchema: EMBED_PROP_SCHEMA,
    content: 'none',
}, {
    render: ({ block }) => {
        const props = block.props
        const kind = props.kind || 'file'
        const label = EMBED_KINDS[kind]?.title || (kind === 'image' ? '圖片' : '嵌入內容')
        const preview = kind === 'image' && props.src
            ? <img src={props.src} alt={props.alt || ''} />
            : (kind === 'audio' || (kind === 'file' && (props.mimeType?.startsWith('audio/') || props.url?.match(/\.(mp3|wav|ogg|m4a|webm|aac|flac)$/i))))
                ? <div className="david-blocknote-audio-wrap">
                    <audio controls src={props.url || props.src} style={{ width: '100%', maxWidth: '100%', marginTop: '6px' }} />
                    {props.name && <div style={{ fontSize: '12px', color: 'var(--text-muted, #888)', marginTop: '4px' }}>🎙️ {props.name}</div>}
                  </div>
                : kind === 'youtube' && props.url
                    ? <span>{props.title || props.url}</span>
                    : kind === 'pdf' && props.url
                        ? <span>{props.title || props.url}</span>
                        : kind === 'mermaid'
                            ? <pre>{props.source}</pre>
                            : kind === 'echarts'
                                ? <pre>{props.optionJson}</pre>
                                : kind === 'raw'
                                    ? <pre>{props.content}</pre>
                                    : <span>{props.title || props.name || props.url || '尚未設定內容'}</span>
        return <section className="david-blocknote-embed" data-kind={kind} contentEditable={false}>
            <header><strong>{label}</strong><button type="button" onClick={() => window.dispatchEvent(new CustomEvent('david-blocknote-edit', { detail: { block } }))}>編輯</button></header>
            <div className="david-blocknote-embed-preview">{preview}</div>
        </section>
    },
})

const schema = BlockNoteSchema.create().extend({ blockSpecs: { davidEmbed: DavidEmbed() } })

const inlineContentToText = content => {
    if (typeof content === 'string') return content
    if (!Array.isArray(content)) return ''
    return content.map(item => {
        if (typeof item === 'string') return item
        if (item?.type === 'link') return inlineContentToText(item.content)
        return typeof item?.text === 'string' ? item.text : ''
    }).join('')
}

const normalizeImportedBlocks = blocks => blocks.flatMap(block => {
    if (block?.type === 'audio') {
        return [{ type: 'davidEmbed', props: { kind: 'audio', url: block.props?.url, name: block.props?.name } }]
    }
    if (block?.type !== 'codeBlock') return [block]

    const language = String(block.props?.language || '').trim().toLowerCase()
    if (!['mermaid', 'echarts', 'html'].includes(language)) return [block]

    const sourceText = inlineContentToText(block.content)
    if (language === 'mermaid') return [{ type: 'davidEmbed', props: { kind: 'mermaid', source: sourceText } }]
    if (language === 'echarts') return [{ type: 'davidEmbed', props: { kind: 'echarts', optionJson: sourceText } }]
    if (language === 'html') {
        const audioMatch = sourceText.match(/<audio[^>]*src="([^"]+)"[^>]*>/i)
        if (audioMatch) {
            const idMatch = sourceText.match(/data-offline-audio-id="([^"]+)"/i)
            return [{ type: 'davidEmbed', props: { kind: 'audio', url: audioMatch[1], audioId: idMatch ? idMatch[1] : '' } }]
        }
    }
    return [{ type: 'davidEmbed', props: { kind: 'raw', content: sourceText } }]
})

const safeHttpUrl = value => {
    try {
        const url = new URL(String(value || '').trim())
        return url.protocol === 'https:' || url.protocol === 'http:'
    } catch {
        return false
    }
}

async function uploadFile(file) {
    if (file.type.startsWith('image/')) {
        const form = new FormData()
        form.append('image', file)
        const response = await fetch('/upload', { method: 'POST', body: form })
        const payload = await response.json()
        if (!response.ok || payload?.err !== 0 || !payload?.data) throw new Error(payload?.msg || '圖片上傳失敗')
        return payload.data
    }
    let lastError
    for (const endpoint of ['https://box.david888.com/api.php?action=upload', 'https://box.aiurl.tw/api.php?action=upload', 'https://box.glsoft.ai/api.php?action=upload']) {
        try {
            const form = new FormData()
            form.append('file', file)
            const response = await fetch(endpoint, { method: 'POST', body: form })
            const payload = await response.json()
            const url = payload?.url || payload?.data?.url
            if (!response.ok || payload?.result !== 'success' || !url) throw new Error(payload?.message || '附件上傳失敗')
            return url
        } catch (error) {
            lastError = error
        }
    }
    throw lastError || new Error('附件上傳失敗')
}

function EmbedDialog({ state, editor, onClose }) {
    const [error, setError] = useState('')
    const [draft, setDraft] = useState(() => ({ ...state.block?.props, kind: state.kind }))
    const cardRef = useRef(null)
    const kind = state.kind
    const label = EMBED_KINDS[kind]?.title || kind
    const isCode = ['mermaid', 'echarts', 'raw'].includes(kind)

    useEffect(() => {
        const card = cardRef.current
        const previousFocus = document.activeElement
        const focusable = () => [...card?.querySelectorAll('button:not([disabled]), input:not([disabled]), textarea:not([disabled])') || []]
        const first = focusable()[0]
        first?.focus()
        const onKeyDown = event => {
            if (event.key === 'Escape') { event.preventDefault(); onClose(); return }
            if (event.key !== 'Tab') return
            const items = focusable()
            if (!items.length) return
            if (event.shiftKey && document.activeElement === items[0]) { event.preventDefault(); items.at(-1).focus() }
            else if (!event.shiftKey && document.activeElement === items.at(-1)) { event.preventDefault(); items[0].focus() }
        }
        card?.addEventListener('keydown', onKeyDown)
        return () => {
            card?.removeEventListener('keydown', onKeyDown)
            if (previousFocus?.isConnected) previousFocus.focus()
        }
    }, [onClose])

    const submit = event => {
        event.preventDefault()
        const value = isCode ? String(draft.source || draft.optionJson || draft.content || '').trim() : String(draft.url || '').trim()
        if (!isCode && kind !== 'slideBreak' && !safeHttpUrl(value)) return setError('請輸入有效的 http 或 https 網址。')
        if (kind === 'mermaid' && !String(draft.source || '').trim()) return setError('Mermaid 語法不可空白。')
        if (kind === 'raw' && !String(draft.content || '').trim()) return setError('HTML 原始碼不可空白。')
        if (kind === 'echarts') {
            try {
                const option = JSON.parse(draft.optionJson || '')
                if (!option || Array.isArray(option) || typeof option !== 'object') throw new Error('invalid')
            } catch { return setError('請輸入有效的 ECharts option JSON 物件。') }
        }
        editor.updateBlock(state.block, { props: { ...state.block.props, ...draft, kind } })
        onClose()
    }

    return <div className="david-blocknote-dialog" role="dialog" aria-modal="true" aria-labelledby="david-blocknote-dialog-title">
        <div className="david-blocknote-dialog-backdrop" onClick={onClose} />
        <form ref={cardRef} className="david-blocknote-dialog-card" onSubmit={submit}>
            <header><h2 id="david-blocknote-dialog-title">設定 {label}</h2><button type="button" onClick={onClose} aria-label="關閉">×</button></header>
            {isCode ? <label>
                <span>{kind === 'mermaid' ? 'Mermaid 語法' : kind === 'echarts' ? 'ECharts option JSON' : 'HTML 原始碼'}</span>
                <textarea value={kind === 'mermaid' ? draft.source : kind === 'echarts' ? draft.optionJson : draft.content} onChange={event => setDraft(current => ({ ...current, [kind === 'mermaid' ? 'source' : kind === 'echarts' ? 'optionJson' : 'content']: event.target.value }))} rows="10" />
            </label> : <>
                {kind !== 'slideBreak' && <label><span>網址</span><input type="url" inputMode="url" value={draft.url || ''} onChange={event => setDraft(current => ({ ...current, url: event.target.value }))} placeholder="https://" /></label>}
                {kind !== 'slideBreak' && <label><span>標題（可留空）</span><input value={draft.title || ''} onChange={event => setDraft(current => ({ ...current, title: event.target.value }))} /></label>}
            </>}
            <p className="david-blocknote-dialog-error" aria-live="polite">{error}</p>
            <footer><button type="button" onClick={onClose}>取消</button><button type="submit">儲存</button></footer>
        </form>
    </div>
}

function BlockNoteEditorApp() {
    const initialContent = useMemo(() => {
        try { return tiptapToBlockNoteDocument(JSON.parse(source.value || '{}')) } catch { return [{ type: 'paragraph' }] }
    }, [])
    const [dialog, setDialog] = useState(null)
    const blockNoteTheme = useBlockNoteTheme()
    const editor = useCreateBlockNote({
        schema,
        initialContent,
        uploadFile,
        tables: { headers: true, splitCells: true, cellBackgroundColor: true, cellTextColor: true },
    })

    useEffect(() => {
        const open = event => {
            const block = event.detail?.block
            if (block?.type === 'davidEmbed') setDialog({ kind: block.props.kind, block })
        }
        window.addEventListener('david-blocknote-edit', open)
        return () => window.removeEventListener('david-blocknote-edit', open)
    }, [])

    useEffect(() => {
        window.__insertBlockEditorMarkdown = markdown => {
            window.dispatchEvent(new CustomEvent('cf-notepad-block-import', {
                detail: { markdown, mode: 'insert' }
            }))
        }
        const handleInsertAudio = event => {
            const detail = event.detail || {}
            const audioUrl = detail.url || detail.audioUrl
            if (!audioUrl) return
            const audioBlock = {
                type: 'davidEmbed',
                props: {
                    kind: 'audio',
                    url: audioUrl,
                    name: detail.name || 'recording.webm',
                    audioId: detail.audioId || '',
                }
            }
            try {
                const cursorBlock = editor.getTextCursorPosition()?.block
                const reference = cursorBlock || editor.document.at(-1)
                if (reference) {
                    editor.insertBlocks([audioBlock], reference.id, 'after')
                } else {
                    editor.insertBlocks([audioBlock], editor.document[0]?.id, 'after')
                }
                save()
            } catch (err) {
                console.error('Failed to insert audio block into BlockNote:', err)
            }
        }
        window.addEventListener('cf-notepad-block-insert-audio', handleInsertAudio)
        return () => {
            delete window.__insertBlockEditorMarkdown
            window.removeEventListener('cf-notepad-block-insert-audio', handleInsertAudio)
        }
    }, [editor])

    useEffect(() => {
        const importMarkdown = event => {
            const markdown = typeof event.detail?.markdown === 'string' ? event.detail.markdown : ''
            if (!markdown.trim()) return

            try {
                const parsedBlocks = normalizeImportedBlocks(editor.tryParseMarkdownToBlocks(markdown))
                if (!parsedBlocks.length) throw new Error('匯入內容沒有可用的區塊。')

                if (event.detail?.mode === 'insert') {
                    const reference = editor.getTextCursorPosition()?.block || editor.document.at(-1)
                    if (!reference) throw new Error('找不到目前區塊。')
                    editor.insertBlocks(parsedBlocks, reference.id, 'after')
                } else {
                    editor.replaceBlocks(editor.document, parsedBlocks)
                }
                save()
            } catch (error) {
                console.error('Block Markdown import failed:', error)
                window.showAppDialog?.({
                    title: '匯入失敗',
                    message: error?.message || '無法將內容轉換成 Block 區塊。',
                    kind: 'error',
                })
            }
        }

        window.addEventListener('cf-notepad-block-import', importMarkdown)
        return () => window.removeEventListener('cf-notepad-block-import', importMarkdown)
    }, [editor])

    const items = useMemo(() => [
        ...getDefaultReactSlashMenuItems(editor),
        {
            title: '即時錄音',
            subtext: '啟動麥克風即時錄音並自動轉錄為區塊內容',
            aliases: ['record', 'voice', 'audio', 'mic', '錄音', '語音', '即時錄音'],
            group: 'DAVID888 語音與嵌入',
            icon: <span className="david-blocknote-menu-icon">🎙️</span>,
            onItemClick: () => {
                window.dispatchEvent(new CustomEvent('cf-notepad-start-record'))
            },
        },
        ...Object.entries(EMBED_KINDS).map(([kind, definition]) => ({
            title: definition.title,
            subtext: definition.detail,
            aliases: [kind, definition.title.toLowerCase()],
            group: 'DAVID888 語音與嵌入',
            icon: <span className="david-blocknote-menu-icon">{definition.icon}</span>,
            onItemClick: () => {
                const block = insertOrUpdateBlockForSlashMenu(editor, { type: 'davidEmbed', props: { kind } })
                if (kind === 'slideBreak') return
                setDialog({ kind, block })
            },
        })),
    ], [editor])

    const save = () => {
        source.value = JSON.stringify(blockNoteToTiptapDocument(editor.document))
        source.dispatchEvent(new Event('input', { bubbles: true }))
    }

    return <div className="david-blocknote-app" data-blocknote-theme={blockNoteTheme}>
        <BlockNoteView editor={editor} theme={blockNoteTheme} slashMenu={false} onChange={save} className="david-blocknote-view">
            <SuggestionMenuController triggerCharacter="/" getItems={async query => filterSuggestionItems(items, query)} />
        </BlockNoteView>
        {dialog && <EmbedDialog state={dialog} editor={editor} onClose={() => setDialog(null)} />}
    </div>
}

const reactRoot = createRoot(root)
reactRoot.render(<BlockNoteEditorApp />)

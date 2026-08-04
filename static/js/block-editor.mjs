import { Editor, Node } from '@tiptap/core'
import StarterKit from '@tiptap/starter-kit'
import Image from '@tiptap/extension-image'
import BubbleMenu from '@tiptap/extension-bubble-menu'
import DragHandle from '@tiptap/extension-drag-handle'
import FileHandler from '@tiptap/extension-file-handler'
import Placeholder from '@tiptap/extension-placeholder'
import TaskItem from '@tiptap/extension-task-item'
import TaskList from '@tiptap/extension-task-list'
import { toTiptapBlockDocument } from '../../src/block_document.mjs'

const root = document.querySelector('#block-editor')
const source = document.querySelector('#contents')
if (!root || !source) throw new Error('Block editor requires #block-editor and #contents')

const EMBED_LABELS = {
    image: '圖片', youtube: 'YouTube', pdf: 'PDF', file: '附件', mermaid: 'Mermaid',
    echarts: 'ECharts', raw: 'HTML 原始碼', slideBreak: '簡報換頁',
}

const BOX_UPLOAD_ENDPOINTS = [
    'https://box.david888.com/api.php?action=upload',
    'https://box.aiurl.tw/api.php?action=upload',
    'https://box.glsoft.ai/api.php?action=upload',
]

const createButton = ({ label, title, command, className = '' }) => {
    const button = document.createElement('button')
    button.type = 'button'
    button.className = `tiptap-toolbar-button ${className}`.trim()
    button.dataset.command = command || ''
    button.title = title || label
    button.setAttribute('aria-label', title || label)
    button.textContent = label
    return button
}

const David888Embed = Node.create({
    name: 'david888Embed',
    group: 'block',
    atom: true,
    selectable: true,
    addAttributes() {
        return Object.fromEntries([
            'kind', 'src', 'alt', 'width', 'url', 'title', 'videoId', 'name', 'mimeType', 'source', 'optionJson', 'content',
        ].map(name => [name, { default: null }]))
    },
    parseHTML() {
        return [{ tag: 'div[data-david888-embed]' }]
    },
    renderHTML({ HTMLAttributes }) {
        return ['div', { 'data-david888-embed': HTMLAttributes.kind || 'embed', 'data-embed-payload': JSON.stringify(HTMLAttributes) }]
    },
    addNodeView() {
        return ({ node, editor, getPos }) => {
            const dom = document.createElement('section')
            dom.className = 'tiptap-embed-card'
            dom.contentEditable = 'false'
            const kind = node.attrs.kind || 'file'
            const header = document.createElement('div')
            header.className = 'tiptap-embed-card-header'
            const title = document.createElement('strong')
            title.textContent = EMBED_LABELS[kind] || kind
            const remove = createButton({ label: '×', title: '刪除區塊', className: 'tiptap-embed-delete' })
            remove.addEventListener('click', () => {
                const position = typeof getPos === 'function' ? getPos() : null
                if (typeof position === 'number') editor.chain().focus().deleteRange({ from: position, to: position + node.nodeSize }).run()
            })
            header.append(title, remove)

            const preview = document.createElement('div')
            preview.className = 'tiptap-embed-preview'
            if (kind === 'image' && node.attrs.src) {
                const image = document.createElement('img')
                image.src = node.attrs.src
                image.alt = node.attrs.alt || ''
                preview.append(image)
            } else if (kind === 'mermaid' || kind === 'echarts' || kind === 'raw') {
                const code = document.createElement('pre')
                code.textContent = node.attrs.source || node.attrs.optionJson || node.attrs.content || ''
                preview.append(code)
            } else {
                const summary = document.createElement('span')
                summary.textContent = node.attrs.title || node.attrs.name || node.attrs.url || node.attrs.videoId || '尚未設定內容'
                preview.append(summary)
            }
            dom.append(header, preview)
            return { dom }
        }
    },
})

function parseStoredDocument() {
    try {
        return toTiptapBlockDocument(JSON.parse(source.value || '{}'))
    } catch {
        return toTiptapBlockDocument()
    }
}

function insertEmbed(editor, attrs) {
    editor.chain().focus().insertContent({ type: 'david888Embed', attrs }).run()
}

function readEmbedInput(kind) {
    if (kind === 'slideBreak') return { kind }
    if (kind === 'mermaid') return { kind, source: window.prompt('輸入 Mermaid 語法') || '' }
    if (kind === 'echarts') return { kind, optionJson: window.prompt('輸入 ECharts option JSON') || '{}' }
    if (kind === 'raw') return { kind, content: window.prompt('輸入 HTML 原始碼（分享頁僅作安全文字顯示）') || '' }
    const url = window.prompt(`輸入 ${EMBED_LABELS[kind] || kind} URL`)
    if (!url) return null
    const title = kind === 'image' ? window.prompt('圖片替代文字') || '' : window.prompt('標題（可留空）') || ''
    return kind === 'image' ? { kind, src: url, alt: title } : { kind, url, title }
}

function uploadImage(file, editor) {
    const form = new FormData()
    form.append('image', file)
    return fetch('/upload', { method: 'POST', body: form })
        .then(response => response.json().then(payload => ({ response, payload })))
        .then(({ response, payload }) => {
            if (!response.ok || payload?.err !== 0 || !payload?.data) throw new Error(payload?.msg || 'Image upload failed')
            insertEmbed(editor, { kind: 'image', src: payload.data, alt: file.name.replace(/\.[^.]+$/, '') })
        })
}

async function uploadAttachment(file, editor) {
    let lastError
    for (const endpoint of BOX_UPLOAD_ENDPOINTS) {
        try {
            const form = new FormData()
            form.append('file', file)
            const response = await fetch(endpoint, { method: 'POST', body: form })
            const payload = await response.json()
            const url = payload?.url || payload?.data?.url
            if (!response.ok || payload?.result !== 'success' || !url) throw new Error(payload?.message || 'Attachment upload failed')
            insertEmbed(editor, { kind: 'file', url, name: file.name, mimeType: file.type || '' })
            return
        } catch (error) { lastError = error }
    }
    throw lastError || new Error('Attachment upload failed')
}

async function uploadFiles(files, editor) {
    for (const file of files) {
        if (file.type.startsWith('image/')) await uploadImage(file, editor)
        else await uploadAttachment(file, editor)
    }
}

const shell = document.createElement('div')
shell.className = 'tiptap-editor-shell'
const toolbar = document.createElement('div')
toolbar.className = 'tiptap-editor-toolbar'
toolbar.setAttribute('role', 'toolbar')
toolbar.setAttribute('aria-label', '文章格式工具')
const canvas = document.createElement('div')
canvas.className = 'tiptap-editor-canvas'
const slashMenu = document.createElement('div')
slashMenu.className = 'tiptap-slash-menu'
slashMenu.hidden = true
slashMenu.setAttribute('role', 'menu')
const bubbleMenu = document.createElement('div')
bubbleMenu.className = 'tiptap-bubble-menu'
bubbleMenu.setAttribute('role', 'toolbar')
bubbleMenu.setAttribute('aria-label', '選取文字格式工具')
for (const [label, title, command] of [['B', '粗體', 'bold'], ['I', '斜體', 'italic'], ['S', '刪除線', 'strike'], ['⌁', '連結', 'link']]) {
    bubbleMenu.append(createButton({ label, title, command }))
}
shell.append(toolbar, canvas, slashMenu, bubbleMenu)
root.replaceChildren(shell)

const toolbarItems = [
    ['B', '粗體', 'bold'], ['I', '斜體', 'italic'], ['S', '刪除線', 'strike'], ['⌁', '連結', 'link'],
    ['H1', '標題 1', 'heading1'], ['H2', '標題 2', 'heading2'], ['•', '項目清單', 'bulletList'], ['☑', '待辦清單', 'taskList'],
    ['❝', '引言', 'blockquote'], ['</>', '程式碼區塊', 'codeBlock'], ['—', '分隔線', 'horizontalRule'], ['↶', '復原', 'undo'], ['↷', '重做', 'redo'],
]
for (const [label, title, command] of toolbarItems) toolbar.append(createButton({ label, title, command }))
const insertMenu = document.createElement('select')
insertMenu.className = 'tiptap-insert-menu'
insertMenu.setAttribute('aria-label', '插入媒體區塊')
insertMenu.innerHTML = `<option value="">插入…</option>${Object.entries(EMBED_LABELS).map(([kind, label]) => `<option value="${kind}">${label}</option>`).join('')}`
toolbar.append(insertMenu)
const uploadInput = document.createElement('input')
uploadInput.type = 'file'
uploadInput.hidden = true
toolbar.append(uploadInput)

const editor = new Editor({
    element: canvas,
    content: parseStoredDocument(),
    extensions: [
        StarterKit.configure({ link: { openOnClick: false } }),
        Image.configure({ inline: false, allowBase64: false }),
        TaskList,
        TaskItem.configure({ nested: true }),
        Placeholder.configure({ placeholder: '輸入 / 開啟指令，或直接開始撰寫…' }),
        BubbleMenu.configure({
            element: bubbleMenu,
            updateDelay: 0,
            shouldShow: ({ state }) => !state.selection.empty,
        }),
        DragHandle.configure({
            render: () => {
                const handle = document.createElement('button')
                handle.type = 'button'
                handle.className = 'david888-drag-handle'
                handle.setAttribute('aria-label', '拖曳移動區塊')
                handle.title = '拖曳移動區塊'
                handle.textContent = '⠿'
                return handle
            },
        }),
        FileHandler.configure({
            consumePasteEvent: true,
            onPaste: (currentEditor, files) => uploadFiles(files, currentEditor).catch(error => window.showToast?.(error.message || 'Upload failed')),
            onDrop: (currentEditor, files) => uploadFiles(files, currentEditor).catch(error => window.showToast?.(error.message || 'Upload failed')),
        }),
        David888Embed,
    ],
    editorProps: {
        attributes: { class: 'tiptap ProseMirror', 'aria-label': 'Block note editor' },
    },
    onUpdate: ({ editor: currentEditor }) => {
        source.value = JSON.stringify(currentEditor.getJSON())
        source.dispatchEvent(new Event('input', { bubbles: true }))
        refreshToolbar()
        refreshSlashMenu()
    },
    onSelectionUpdate: () => {
        refreshToolbar()
        refreshSlashMenu()
    },
})

function runCommand(command) {
    const chain = editor.chain().focus()
    if (command === 'bold') chain.toggleBold().run()
    else if (command === 'italic') chain.toggleItalic().run()
    else if (command === 'strike') chain.toggleStrike().run()
    else if (command === 'heading1') chain.toggleHeading({ level: 1 }).run()
    else if (command === 'heading2') chain.toggleHeading({ level: 2 }).run()
    else if (command === 'bulletList') chain.toggleBulletList().run()
    else if (command === 'taskList') chain.toggleTaskList().run()
    else if (command === 'blockquote') chain.toggleBlockquote().run()
    else if (command === 'codeBlock') chain.toggleCodeBlock().run()
    else if (command === 'horizontalRule') chain.setHorizontalRule().run()
    else if (command === 'undo') chain.undo().run()
    else if (command === 'redo') chain.redo().run()
    else if (command === 'link') {
        const href = window.prompt('連結 URL')
        if (href) chain.setLink({ href }).run()
        else chain.unsetLink().run()
    }
}

toolbar.addEventListener('click', event => {
    const command = event.target.closest('button')?.dataset.command
    if (command) runCommand(command)
})
bubbleMenu.addEventListener('click', event => {
    const command = event.target.closest('button')?.dataset.command
    if (command) runCommand(command)
})

insertMenu.addEventListener('change', () => {
    const kind = insertMenu.value
    insertMenu.value = ''
    if (!kind) return
    if (kind === 'image' || kind === 'file') {
        uploadInput.accept = kind === 'image' ? 'image/*' : ''
        uploadInput.dataset.kind = kind
        uploadInput.click()
        return
    }
    const attrs = readEmbedInput(kind)
    if (attrs) insertEmbed(editor, attrs)
})

uploadInput.addEventListener('change', async () => {
    const file = uploadInput.files?.[0]
    if (!file) return
    try {
        if (uploadInput.dataset.kind === 'image') await uploadImage(file, editor)
        else await uploadAttachment(file, editor)
    } catch (error) {
        window.showToast?.(error.message || 'Upload failed') || window.alert(error.message || 'Upload failed')
    } finally {
        uploadInput.value = ''
    }
})

const slashCommands = [
    { label: '文字', detail: '一般段落', run: () => editor.chain().focus().setParagraph().run() },
    { label: '標題 1', detail: '大標題', run: () => editor.chain().focus().toggleHeading({ level: 1 }).run() },
    { label: '標題 2', detail: '中標題', run: () => editor.chain().focus().toggleHeading({ level: 2 }).run() },
    { label: '項目清單', detail: '建立 bullet list', run: () => editor.chain().focus().toggleBulletList().run() },
    { label: '待辦清單', detail: '可勾選任務', run: () => editor.chain().focus().toggleTaskList().run() },
    { label: '程式碼', detail: 'Code block', run: () => editor.chain().focus().toggleCodeBlock().run() },
    { label: '分隔線', detail: 'Divider', run: () => editor.chain().focus().setHorizontalRule().run() },
    { label: '圖片', detail: '上傳或插入圖片', run: () => { uploadInput.dataset.kind = 'image'; uploadInput.accept = 'image/*'; uploadInput.click() } },
]

let activeSlashCommand = null
function refreshSlashMenu() {
    const { state } = editor
    const beforeCursor = state.doc.textBetween(Math.max(0, state.selection.from - 80), state.selection.from, '\n', '\n')
    const match = beforeCursor.match(/(?:^|\s)\/([^\s/]*)$/)
    if (!match) {
        activeSlashCommand = null
        slashMenu.hidden = true
        return
    }
    const query = match[1].toLocaleLowerCase()
    const matches = slashCommands.filter(command => `${command.label} ${command.detail}`.toLocaleLowerCase().includes(query))
    if (!matches.length) { slashMenu.hidden = true; return }
    activeSlashCommand = { from: state.selection.from - match[0].trimStart().length, commands: matches }
    slashMenu.replaceChildren(...matches.map((command, index) => {
        const item = document.createElement('button')
        item.type = 'button'
        item.className = 'tiptap-slash-item'
        item.dataset.index = String(index)
        item.innerHTML = `<strong>${command.label}</strong><small>${command.detail}</small>`
        return item
    }))
    slashMenu.hidden = false
}

function chooseSlashCommand(index = 0) {
    const command = activeSlashCommand?.commands[index]
    if (!command || !activeSlashCommand) return
    editor.chain().focus().deleteRange({ from: activeSlashCommand.from, to: editor.state.selection.from }).run()
    command.run()
    activeSlashCommand = null
    slashMenu.hidden = true
}

slashMenu.addEventListener('click', event => {
    const index = Number(event.target.closest('button')?.dataset.index)
    if (Number.isSafeInteger(index)) chooseSlashCommand(index)
})

canvas.addEventListener('keydown', event => {
    if (!activeSlashCommand) return
    if (event.key === 'Escape') { event.preventDefault(); activeSlashCommand = null; slashMenu.hidden = true }
    else if (event.key === 'Enter') { event.preventDefault(); chooseSlashCommand() }
})

function refreshToolbar() {
    const active = {
        bold: editor.isActive('bold'), italic: editor.isActive('italic'), strike: editor.isActive('strike'), link: editor.isActive('link'),
        heading1: editor.isActive('heading', { level: 1 }), heading2: editor.isActive('heading', { level: 2 }),
        bulletList: editor.isActive('bulletList'), taskList: editor.isActive('taskList'), blockquote: editor.isActive('blockquote'), codeBlock: editor.isActive('codeBlock'),
    }
    toolbar.querySelectorAll('[data-command]').forEach(button => button.classList.toggle('is-active', active[button.dataset.command] === true))
}

refreshToolbar()
canvas.querySelector('.ProseMirror')?.focus()

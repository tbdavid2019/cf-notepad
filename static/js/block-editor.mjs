const BLOCK_TYPES = [
    ['paragraph', 'Paragraph'], ['heading', 'Heading'], ['bulletList', 'Bullet list'],
    ['taskList', 'Task'], ['quote', 'Quote'], ['code', 'Code'], ['divider', 'Divider'],
    ['slideBreak', 'Slide break'], ['image', 'Image'], ['youtube', 'YouTube'], ['pdf', 'PDF'],
    ['file', 'File / audio / video'], ['mermaid', 'Mermaid'], ['echarts', 'ECharts'], ['raw', 'HTML source'],
]
const BOX_UPLOAD_ENDPOINTS = [
    'https://box.david888.com/api.php?action=upload',
    'https://box.aiurl.tw/api.php?action=upload',
    'https://box.glsoft.ai/api.php?action=upload',
]

const root = document.querySelector('#block-editor')
const source = document.querySelector('#contents')
if (!root || !source) throw new Error('Block editor requires #block-editor and #contents')

const typeLabel = Object.fromEntries(BLOCK_TYPES)
const makeId = () => globalThis.crypto?.randomUUID?.() || `block-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
const emptyDocument = () => ({ version: 1, blocks: [] })

function defaultProps(type) {
    switch (type) {
        case 'heading': return { level: 2, text: '' }
        case 'taskList': return { text: '', checked: false }
        case 'code': return { language: '', text: '' }
        case 'image': return { src: '', alt: '', width: '' }
        case 'youtube': return { url: '', title: '' }
        case 'pdf': return { url: '', title: '' }
        case 'file': return { url: '', name: '', mimeType: '' }
        case 'mermaid': return { source: '' }
        case 'echarts': return { optionJson: '{\n  "title": { "text": "Chart" }\n}' }
        case 'raw': return { content: '' }
        default: return { text: '' }
    }
}

function normaliseDocument(value) {
    try {
        const parsed = JSON.parse(value)
        if (parsed && parsed.version === 1 && Array.isArray(parsed.blocks)) {
            return {
                version: 1,
                blocks: parsed.blocks
                    .filter(block => block && typeof block === 'object' && typeof block.type === 'string')
                    .map(block => ({ id: typeof block.id === 'string' ? block.id : makeId(), type: typeLabel[block.type] ? block.type : 'paragraph', props: block.props && typeof block.props === 'object' ? block.props : {} })),
            }
        }
    } catch {}
    return emptyDocument()
}

const documentModel = normaliseDocument(source.value)

function sync() {
    source.value = JSON.stringify(documentModel)
    source.dispatchEvent(new Event('input', { bubbles: true }))
}

function el(tag, options = {}, children = []) {
    const node = document.createElement(tag)
    if (options.className) node.className = options.className
    if (options.text !== undefined) node.textContent = options.text
    if (options.type) node.type = options.type
    if (options.title) node.title = options.title
    if (options.ariaLabel) node.setAttribute('aria-label', options.ariaLabel)
    if (options.placeholder) node.placeholder = options.placeholder
    if (options.value !== undefined) node.value = options.value
    if (options.hidden) node.hidden = true
    for (const child of children) node.append(child)
    return node
}

function inputField(block, key, label, placeholder = '', type = 'text') {
    const input = el('input', { className: 'block-field-input', type, value: String(block.props[key] || ''), placeholder })
    input.addEventListener('input', () => {
        block.props[key] = input.value
        sync()
    })
    return el('label', { className: 'block-field' }, [el('span', { text: label }), input])
}

function sourceField(block, key, label, placeholder = '') {
    const textarea = el('textarea', { className: 'block-source-input', value: String(block.props[key] || ''), placeholder })
    textarea.addEventListener('input', () => {
        block.props[key] = textarea.value
        sync()
    })
    return el('label', { className: 'block-field block-source-field' }, [el('span', { text: label }), textarea])
}

function textField(block, key, placeholder = '') {
    const field = el('div', { className: 'block-text-input', placeholder })
    field.contentEditable = 'true'
    field.spellcheck = true
    field.textContent = String(block.props[key] || '')
    field.addEventListener('input', () => {
        block.props[key] = field.textContent || ''
        sync()
    })
    return field
}

function createBlockBody(block) {
    const body = el('div', { className: `block-body block-body-${block.type}` })
    if (['paragraph', 'bulletList', 'quote'].includes(block.type)) return body.append(textField(block, 'text', 'Write…')), body
    if (block.type === 'heading') {
        const level = el('select', { className: 'block-heading-level' })
        for (let index = 1; index <= 6; index += 1) level.append(el('option', { value: String(index), text: `H${index}` }))
        level.value = String(block.props.level || 2)
        level.addEventListener('change', () => { block.props.level = Number(level.value); sync() })
        body.append(level, textField(block, 'text', 'Heading'))
        return body
    }
    if (block.type === 'taskList') {
        const checked = el('input', { type: 'checkbox' })
        checked.checked = block.props.checked === true
        checked.addEventListener('change', () => { block.props.checked = checked.checked; sync() })
        body.append(checked, textField(block, 'text', 'Task'))
        return body
    }
    if (block.type === 'code') {
        body.append(inputField(block, 'language', 'Language', 'js'), sourceField(block, 'text', 'Code'))
        return body
    }
    if (block.type === 'image') {
        body.append(inputField(block, 'src', 'Image URL', 'https://…'), inputField(block, 'alt', 'Alt text'))
        const upload = el('input', { className: 'block-file-picker', type: 'file' })
        upload.accept = 'image/*'
        upload.addEventListener('change', () => uploadImage(upload.files?.[0], block, upload))
        body.append(el('label', { className: 'block-upload-button', text: 'Upload image' }, [upload]))
        return body
    }
    if (block.type === 'youtube' || block.type === 'pdf') {
        body.append(inputField(block, 'url', 'URL', 'https://…'), inputField(block, 'title', 'Title'))
        return body
    }
    if (block.type === 'file') {
        body.append(inputField(block, 'url', 'File URL', 'https://…'), inputField(block, 'name', 'Name'), inputField(block, 'mimeType', 'MIME type', 'audio/mpeg'))
        const upload = el('input', { className: 'block-file-picker', type: 'file' })
        upload.addEventListener('change', () => uploadAttachment(upload.files?.[0], block, upload))
        body.append(el('label', { className: 'block-upload-button', text: 'Upload file' }, [upload]))
        return body
    }
    if (block.type === 'mermaid') return body.append(sourceField(block, 'source', 'Mermaid source', 'graph TD\n  A --> B')), body
    if (block.type === 'echarts') return body.append(sourceField(block, 'optionJson', 'ECharts option JSON')), body
    if (block.type === 'raw') return body.append(sourceField(block, 'content', 'HTML source (rendered as code for safety)')), body
    if (block.type === 'divider' || block.type === 'slideBreak') {
        body.append(el('p', { className: 'block-static-help', text: block.type === 'slideBreak' ? 'Starts a new Reveal.js slide.' : 'Visual content divider.' }))
        return body
    }
    return body
}

function updateBlockType(block, nextType) {
    const previousText = typeof block.props.text === 'string' ? block.props.text : ''
    block.type = nextType
    block.props = defaultProps(nextType)
    if (previousText && Object.hasOwn(block.props, 'text')) block.props.text = previousText
    sync()
    render()
}

function moveBlock(index, direction) {
    const target = index + direction
    if (target < 0 || target >= documentModel.blocks.length) return
    ;[documentModel.blocks[index], documentModel.blocks[target]] = [documentModel.blocks[target], documentModel.blocks[index]]
    sync()
    render()
}

function render() {
    root.replaceChildren()
    const toolbar = el('div', { className: 'block-editor-toolbar' })
    const addType = el('select', { className: 'block-add-select' })
    addType.append(el('option', { value: '', text: 'Add block…' }))
    for (const [type, label] of BLOCK_TYPES) addType.append(el('option', { value: type, text: label }))
    addType.addEventListener('change', () => {
        if (!addType.value) return
        documentModel.blocks.push({ id: makeId(), type: addType.value, props: defaultProps(addType.value) })
        sync()
        render()
        root.querySelector('.block-card:last-child .block-text-input, .block-card:last-child .block-source-input')?.focus()
    })
    toolbar.append(el('strong', { text: 'Block editor' }), addType)
    root.append(toolbar)

    const list = el('div', { className: 'block-list' })
    documentModel.blocks.forEach((block, index) => {
        const card = el('section', { className: 'block-card' })
        const controls = el('div', { className: 'block-card-controls' })
        const type = el('select', { className: 'block-type-select' })
        for (const [value, label] of BLOCK_TYPES) type.append(el('option', { value, text: label }))
        type.value = block.type
        type.addEventListener('change', () => updateBlockType(block, type.value))
        const up = el('button', { type: 'button', className: 'block-action', text: '↑', title: 'Move up', ariaLabel: 'Move block up' })
        up.disabled = index === 0
        up.addEventListener('click', () => moveBlock(index, -1))
        const down = el('button', { type: 'button', className: 'block-action', text: '↓', title: 'Move down', ariaLabel: 'Move block down' })
        down.disabled = index === documentModel.blocks.length - 1
        down.addEventListener('click', () => moveBlock(index, 1))
        const remove = el('button', { type: 'button', className: 'block-action block-action-danger', text: '×', title: 'Delete block', ariaLabel: 'Delete block' })
        remove.addEventListener('click', () => { documentModel.blocks.splice(index, 1); sync(); render() })
        controls.append(type, up, down, remove)
        card.append(controls, createBlockBody(block))
        list.append(card)
    })
    root.append(list)
}

async function uploadImage(file, block, control) {
    if (!file) return
    control.disabled = true
    try {
        const form = new FormData()
        form.append('image', file)
        const response = await fetch('/upload', { method: 'POST', body: form })
        const payload = await response.json()
        if (!response.ok || payload.err !== 0 || !payload.data) throw new Error(payload.msg || 'Image upload failed')
        block.props.src = payload.data
        block.props.alt ||= file.name.replace(/\.[^.]+$/, '')
        sync()
        render()
    } catch (error) {
        window.showToast?.(error.message || 'Image upload failed')
    } finally {
        control.disabled = false
    }
}

async function uploadAttachment(file, block, control) {
    if (!file) return
    control.disabled = true
    let lastError
    try {
        for (const endpoint of BOX_UPLOAD_ENDPOINTS) {
            try {
                const form = new FormData()
                form.append('file', file)
                const response = await fetch(endpoint, { method: 'POST', body: form })
                const payload = await response.json()
                const url = payload?.url || payload?.data?.url
                if (!response.ok || payload?.result !== 'success' || !url) throw new Error(payload?.message || 'Attachment upload failed')
                block.props = { url, name: file.name, mimeType: file.type || '' }
                sync()
                render()
                return
            } catch (error) { lastError = error }
        }
        throw lastError || new Error('Attachment upload failed')
    } catch (error) {
        window.showToast?.(error.message || 'Attachment upload failed')
    } finally {
        control.disabled = false
    }
}

render()

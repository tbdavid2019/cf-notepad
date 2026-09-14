import { ocrItemsToText } from './ocr-utils.mjs'

// Official browser SDK: https://github.com/PaddlePaddle/PaddleOCR/tree/main/paddleocr-js
// WebGPU provider fallback: https://onnxruntime.ai/docs/tutorials/web/ep-webgpu.html
const MAX_OCR_IMAGE_BYTES = 10 * 1024 * 1024
export const TABLE_OCR_ENDPOINTS = Object.freeze([
    'https://2md.aiurl.tw/api/ocr?mode=table',
    'https://create360.ai/api/ocr?mode=table',
    'https://2md.glsoft.ai/api/ocr?mode=table',
])
let ocrInstancePromise = null
let paddleOcrRuntimePromise = null
let ocrReady = false

const loadPaddleOcrRuntime = async () => {
    if (!paddleOcrRuntimePromise) {
        paddleOcrRuntimePromise = import('./paddleocr-runtime.bundle.mjs').catch(error => {
            paddleOcrRuntimePromise = null
            throw error
        })
    }
    return paddleOcrRuntimePromise
}

const validateImage = file => {
    if (!file || typeof file.arrayBuffer !== 'function') {
        throw new Error('Please choose a readable image file.')
    }
    if (file.type && !file.type.toLowerCase().startsWith('image/')) {
        throw new Error('Only image files can be sent to OCR.')
    }
    if (Number(file.size) > MAX_OCR_IMAGE_BYTES) {
        throw new Error('Image exceeds the 10MB OCR limit.')
    }
}

const isGfmTableRow = line => /^\s*\|.*\|\s*$/.test(line)
const isGfmTableSeparator = line => /^\s*\|(?:\s*:?-{3,}:?\s*\|)+\s*$/.test(line)

const firstGfmTable = markdown => {
    const lines = String(markdown || '').replace(/\r\n?/g, '\n').trim().split('\n')
    for (let start = 0; start < lines.length - 1; start += 1) {
        if (!isGfmTableRow(lines[start]) || !isGfmTableSeparator(lines[start + 1])) continue
        let end = start + 2
        while (end < lines.length && isGfmTableRow(lines[end])) end += 1
        const rows = lines.slice(start, end)
        if (rows.length >= 3) {
            return rows.map(row => row.replace(/</g, '&lt;').replace(/>/g, '&gt;')).join('\n').trim()
        }
    }
    return ''
}

export const extractTableMarkdown = payload => {
    const data = payload?.data && typeof payload.data === 'object' ? payload.data : payload
    const candidates = [data?.tableMarkdown, data?.markdown]
    for (const candidate of candidates) {
        const table = firstGfmTable(candidate)
        if (table) return table
    }
    return ''
}

export const toUserFacingOcrError = error => {
    const message = String(error?.message || '').toLowerCase()
    if (message.includes('worker') || message.includes('offscreen')) {
        return 'OCR Worker 載入失敗，請重新整理頁面後再試。'
    }
    if (message.includes('webgpu') || message.includes('adapter') || message.includes('execution provider')) {
        return '此瀏覽器的 WebGPU 不可用，請改用最新版 Chrome 或 Edge。'
    }
    if (message.includes('download') || message.includes('http') || message.includes('fetch') || message.includes('model asset')) {
        return 'OCR 模型下載失敗，請確認網路連線後再試。'
    }
    return 'OCR 無法處理這張圖片，請換一張較清晰的圖片或重新整理頁面。'
}

const getOcrInstance = async () => {
    if (!ocrInstancePromise) {
        ocrInstancePromise = loadPaddleOcrRuntime().then(({ PaddleOCR }) => PaddleOCR.create({
            lang: 'ch',
            ocrVersion: 'PP-OCRv6',
            worker: true,
            ortOptions: {
                backend: 'auto',
                disableWasmProxy: true,
            },
        })).then(instance => {
            ocrReady = true
            return instance
        }).catch(error => {
            ocrInstancePromise = null
            throw error
        })
    }
    return ocrInstancePromise
}

export const recognizeImage = async file => {
    validateImage(file)
    try {
        const ocr = await getOcrInstance()
        const [result] = await ocr.predict(file)
        const text = ocrItemsToText(result?.items || [])
        if (!text) throw new Error('No readable text was found in the image.')
        return {
            text,
            items: result.items,
            metrics: result.metrics || null,
            runtime: result.runtime || null,
        }
    } catch (error) {
        if (error?.message === 'No readable text was found in the image.') throw error
        throw new Error(toUserFacingOcrError(error))
    }
}

export const recognizeTableImage = async file => {
    validateImage(file)
    let lastError = null
    for (const endpoint of TABLE_OCR_ENDPOINTS) {
        try {
            const formData = new FormData()
            formData.append('file', file, file.name || 'table.png')
            formData.append('lang', 'chinese_cht')
            const controller = new AbortController()
            const timeout = setTimeout(() => controller.abort(), 60000)
            let response
            try {
                response = await fetch(endpoint, {
                    method: 'POST',
                    mode: 'cors',
                    credentials: 'omit',
                    headers: { Accept: 'application/json' },
                    body: formData,
                    signal: controller.signal,
                })
            } finally {
                clearTimeout(timeout)
            }
            const raw = await response.text()
            let payload = null
            try { payload = raw ? JSON.parse(raw) : null } catch { payload = null }
            if (!response.ok) throw new Error(`Table OCR request returned HTTP ${response.status}.`)
            const markdown = extractTableMarkdown(payload)
            if (!markdown) throw new Error('No table was detected in the image.')
            return {
                markdown,
                lines: Array.isArray(payload?.data?.lines) ? payload.data.lines : [],
                tables: Array.isArray(payload?.data?.tables) ? payload.data.tables : [],
                durationMs: payload?.data?.durationMs ?? null,
            }
        } catch (error) {
            lastError = error?.name === 'AbortError' ? new Error('Table OCR service timed out.') : error
        }
    }
    throw new Error(lastError?.message || 'Table OCR service is unavailable. Try again later.')
}

export const disposeOcr = async () => {
    const instance = await ocrInstancePromise?.catch(() => null)
    if (instance?.dispose) await instance.dispose()
    ocrInstancePromise = null
    ocrReady = false
}

export const getStatus = () => ({ ready: ocrReady })

if (typeof window !== 'undefined') {
    window.cfNotepadOcr = { recognizeImage, recognizeTableImage, disposeOcr, getStatus }
}

import { ocrItemsToText } from './ocr-utils.mjs'

// Official browser SDK: https://github.com/PaddlePaddle/PaddleOCR/tree/main/paddleocr-js
// WebGPU provider fallback: https://onnxruntime.ai/docs/tutorials/web/ep-webgpu.html
const MAX_OCR_IMAGE_BYTES = 10 * 1024 * 1024
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

export const disposeOcr = async () => {
    const instance = await ocrInstancePromise?.catch(() => null)
    if (instance?.dispose) await instance.dispose()
    ocrInstancePromise = null
    ocrReady = false
}

export const getStatus = () => ({ ready: ocrReady })

if (typeof window !== 'undefined') {
    window.cfNotepadOcr = { recognizeImage, disposeOcr, getStatus }
}

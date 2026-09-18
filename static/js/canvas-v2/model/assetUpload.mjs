/**
 * Asset Upload & MIME Detection Pipeline for Canvas v2
 * Handles R2 image uploads and 888box fallback uploads for media, audio, video, documents.
 */

export const BOX_UPLOAD_ENDPOINTS = [
    'https://box.david888.com/api.php?action=upload',
    'https://box.aiurl.tw/api.php?action=upload',
    'https://box.glsoft.ai/api.php?action=upload',
]

export function isImageFile(file) {
    if (file?.type && typeof file.type === 'string' && file.type.startsWith('image/')) return true
    const name = (file?.name || String(file || '')).toLowerCase()
    return /\.(png|jpe?g|gif|webp|svg|bmp|ico)$/.test(name)
}

export function isAudioFile(file) {
    if (file?.type && typeof file.type === 'string' && file.type.startsWith('audio/')) return true
    const name = (file?.name || String(file || '')).toLowerCase()
    return /\.(mp3|wav|m4a|aac|ogg|flac|opus|weba)$/.test(name)
}

export function isVideoFile(file) {
    if (file?.type && typeof file.type === 'string' && file.type.startsWith('video/')) return true
    const name = (file?.name || String(file || '')).toLowerCase()
    return /\.(mp4|webm|mov|mkv|avi)$/.test(name)
}

export function detectMimeType(file, url = '') {
    if (file?.type && typeof file.type === 'string' && file.type.length > 0) return file.type
    const testStr = (file?.name || url || '').split('?')[0].split('#')[0].toLowerCase()
    if (/\.(png)$/.test(testStr)) return 'image/png'
    if (/\.(jpe?g)$/.test(testStr)) return 'image/jpeg'
    if (/\.(webp)$/.test(testStr)) return 'image/webp'
    if (/\.(gif)$/.test(testStr)) return 'image/gif'
    if (/\.(svg)$/.test(testStr)) return 'image/svg+xml'
    if (/\.(bmp)$/.test(testStr)) return 'image/bmp'
    if (/\.(ico)$/.test(testStr)) return 'image/x-icon'

    if (/\.(mp3)$/.test(testStr)) return 'audio/mpeg'
    if (/\.(wav)$/.test(testStr)) return 'audio/wav'
    if (/\.(m4a)$/.test(testStr)) return 'audio/mp4'
    if (/\.(aac)$/.test(testStr)) return 'audio/aac'
    if (/\.(ogg|opus)$/.test(testStr)) return 'audio/ogg'
    if (/\.(flac)$/.test(testStr)) return 'audio/flac'

    if (/\.(mp4)$/.test(testStr)) return 'video/mp4'
    if (/\.(webm)$/.test(testStr)) return 'video/webm'
    if (/\.(mov)$/.test(testStr)) return 'video/quicktime'
    if (/\.(mkv)$/.test(testStr)) return 'video/x-matroska'

    if (/\.(pdf)$/.test(testStr)) return 'application/pdf'
    if (/\.(docx)$/.test(testStr)) return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    if (/\.(doc)$/.test(testStr)) return 'application/msword'
    if (/\.(xlsx)$/.test(testStr)) return 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    if (/\.(xls)$/.test(testStr)) return 'application/vnd.ms-excel'
    if (/\.(pptx)$/.test(testStr)) return 'application/vnd.openxmlformats-officedocument.presentationml.presentation'
    if (/\.(ppt)$/.test(testStr)) return 'application/vnd.ms-powerpoint'
    if (/\.(zip)$/.test(testStr)) return 'application/zip'
    if (/\.(rar)$/.test(testStr)) return 'application/vnd.rar'
    if (/\.(7z)$/.test(testStr)) return 'application/x-7z-compressed'
    if (/\.(tar)$/.test(testStr)) return 'application/x-tar'
    if (/\.(gz)$/.test(testStr)) return 'application/gzip'

    return 'application/octet-stream'
}

export function formatFileSize(bytes) {
    if (typeof bytes !== 'number' || isNaN(bytes) || bytes <= 0) return ''
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

/**
 * Upload an asset file. Images route through R2, media/documents route through 888box.
 * @param {File|Blob} file - The file to upload
 * @returns {Promise<{url: string, provider: 'r2'|'888box', name: string, mime: string, size: number}>}
 */
export async function uploadCanvasAsset(file) {
    if (!file) {
        throw new Error('No file provided for upload')
    }

    const fileName = file.name || 'unnamed-file'
    const fileSize = file.size || 0
    const isImage = isImageFile(file)

    if (isImage) {
        // 1. Try global helper if available
        if (typeof window !== 'undefined' && typeof window.uploadImageToR2 === 'function') {
            try {
                const url = await window.uploadImageToR2(file)
                if (url) {
                    return {
                        url,
                        provider: 'r2',
                        name: fileName,
                        mime: detectMimeType(file, url),
                        size: fileSize,
                    }
                }
            } catch (err) {
                console.warn('[canvas asset] window.uploadImageToR2 failed, trying direct endpoint:', err?.message)
            }
        }

        // 2. Direct POST to /upload (R2 endpoint)
        const formData = new FormData()
        formData.append('image', file)
        const response = await fetch('/upload', { method: 'POST', body: formData })
        if (!response.ok) {
            const errText = await response.text().catch(() => '')
            throw new Error(`R2 upload failed (${response.status}): ${errText || 'Upload error'}`)
        }
        const payload = await response.json()
        if (payload?.err !== 0 || !payload?.data) {
            throw new Error(payload?.msg || 'R2 image upload failed')
        }
        const url = payload.data
        return {
            url,
            provider: 'r2',
            name: fileName,
            mime: detectMimeType(file, url),
            size: fileSize,
        }
    }

    // Non-image files: route through 888box fallback API
    if (typeof window !== 'undefined' && typeof window.uploadTo888Box === 'function') {
        try {
            const url = await window.uploadTo888Box(file)
            if (url) {
                return {
                    url,
                    provider: '888box',
                    name: fileName,
                    mime: detectMimeType(file, url),
                    size: fileSize,
                }
            }
        } catch (err) {
            console.warn('[canvas asset] window.uploadTo888Box failed, trying fallback endpoints:', err?.message)
        }
    }

    let lastError = null
    for (const endpoint of BOX_UPLOAD_ENDPOINTS) {
        try {
            const formData = new FormData()
            formData.append('file', file)
            formData.append('title', fileName)
            const response = await fetch(endpoint, { method: 'POST', body: formData })
            const payload = await response.json().catch(() => null)
            const url = payload?.data?.url || payload?.url
            if (response.ok && (payload?.result === 'success' || url) && url) {
                return {
                    url,
                    provider: '888box',
                    name: fileName,
                    mime: detectMimeType(file, url),
                    size: fileSize,
                }
            }
            lastError = new Error(payload?.message || `Upload to ${endpoint} failed with HTTP ${response.status}`)
        } catch (err) {
            lastError = err
        }
    }

    throw lastError || new Error('Upload to 888box failed across all fallback endpoints')
}

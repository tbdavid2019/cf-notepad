const VIDEO_EXTENSIONS = new Set(['mp4', 'm4v', 'webm', 'ogv', 'mov', 'm3u8'])
const AUDIO_EXTENSIONS = new Set(['mp3', 'm4a', 'aac', 'wav', 'oga', 'ogg', 'flac', 'opus'])

const getHttpUrl = value => {
    try {
        const url = new URL(String(value || '').trim())
        return url.protocol === 'http:' || url.protocol === 'https:' ? url : null
    } catch (error) {
        return null
    }
}

const isYouTubeHost = hostname => {
    const host = String(hostname || '').toLowerCase()
    return host === 'youtu.be'
        || host === 'youtube.com'
        || host.endsWith('.youtube.com')
        || host === 'youtube-nocookie.com'
        || host.endsWith('.youtube-nocookie.com')
}

export const getYouTubeVideoId = value => {
    const url = getHttpUrl(value)
    if (!url || !isYouTubeHost(url.hostname)) return null

    let videoId = ''
    if (url.hostname.toLowerCase() === 'youtu.be') {
        videoId = url.pathname.split('/').filter(Boolean)[0] || ''
    } else if (url.pathname === '/watch') {
        videoId = url.searchParams.get('v') || ''
    } else {
        const pathParts = url.pathname.split('/').filter(Boolean)
        if (['embed', 'shorts', 'live'].includes(pathParts[0])) videoId = pathParts[1] || ''
    }

    return /^[A-Za-z0-9_-]{6,}$/.test(videoId) ? videoId : null
}

const getFileExtension = url => {
    const lastPathPart = url.pathname.split('/').pop() || ''
    const dotIndex = lastPathPart.lastIndexOf('.')
    return dotIndex === -1 ? '' : lastPathPart.slice(dotIndex + 1).toLowerCase()
}

export const getMediaPreviewDescriptor = value => {
    const url = getHttpUrl(value)
    if (!url) return null

    const youtubeId = getYouTubeVideoId(url.toString())
    if (youtubeId) {
        return {
            kind: 'youtube',
            src: `https://www.youtube-nocookie.com/embed/${youtubeId}?rel=0`,
        }
    }

    const extension = getFileExtension(url)
    if (extension === 'pdf') return { kind: 'pdf', src: url.toString() }
    if (VIDEO_EXTENSIONS.has(extension)) return { kind: 'video', src: url.toString() }
    if (AUDIO_EXTENSIONS.has(extension)) return { kind: 'audio', src: url.toString() }
    return null
}

const getPreviewTitle = anchor => {
    const label = String(anchor?.textContent || '').trim()
    return label || 'Media preview'
}

const createMediaElement = (documentRef, descriptor, title) => {
    if (descriptor.kind === 'youtube' || descriptor.kind === 'pdf') {
        const iframe = documentRef.createElement('iframe')
        iframe.src = descriptor.src
        iframe.title = title
        iframe.loading = 'lazy'
        iframe.referrerPolicy = 'strict-origin-when-cross-origin'
        if (descriptor.kind === 'youtube') {
            iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share'
            iframe.allowFullscreen = true
        }
        return iframe
    }

    const media = documentRef.createElement(descriptor.kind)
    media.src = descriptor.src
    media.controls = true
    media.preload = 'metadata'
    if (descriptor.kind === 'video') media.playsInline = true
    return media
}

export const decorateMediaPreviews = (root, documentRef = typeof document === 'undefined' ? null : document) => {
    if (!root || !documentRef?.createElement) return 0

    let decoratedCount = 0
    root.querySelectorAll('a[href]').forEach(anchor => {
        if (anchor.closest('.media-preview')) return
        const descriptor = getMediaPreviewDescriptor(anchor.getAttribute('href'))
        if (!descriptor) return

        const title = getPreviewTitle(anchor)
        const wrapper = documentRef.createElement('figure')
        wrapper.className = `media-preview media-preview-${descriptor.kind}`
        wrapper.dataset.mediaPreview = descriptor.kind

        const media = createMediaElement(documentRef, descriptor, title)
        media.className = 'media-preview-player'
        media.setAttribute('aria-label', title)

        const caption = documentRef.createElement('figcaption')
        const fallbackLink = anchor.cloneNode(true)
        fallbackLink.classList.add('media-preview-fallback')
        caption.appendChild(fallbackLink)
        wrapper.appendChild(media)
        wrapper.appendChild(caption)
        anchor.replaceWith(wrapper)
        decoratedCount += 1
    })

    return decoratedCount
}

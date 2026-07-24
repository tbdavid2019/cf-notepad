export const getReadingProgress = ({ scrollTop = 0, scrollHeight = 0, clientHeight = 0 } = {}) => {
    const maxScroll = Math.max(0, Number(scrollHeight) - Number(clientHeight))
    const currentScroll = Math.max(0, Math.min(Number(scrollTop) || 0, maxScroll))
    const percent = maxScroll ? Math.round((currentScroll / maxScroll) * 100) : 0

    return { percent, maxScroll, isScrollable: maxScroll > 0 }
}

const getProgressLabels = doc => {
    const isZh = doc.documentElement.lang.toLowerCase().startsWith('zh')
    return isZh
        ? { label: '閱讀進度', value: percent => `已閱讀 ${percent}%` }
        : { label: 'Reading progress', value: percent => `${percent}% read` }
}

export const initReadingProgress = (root = document) => {
    const preview = root.querySelector('#preview-md, #preview-plain')
    if (!preview) return false

    const host = preview.closest('.preview-pane') || preview.parentElement
    if (!host || host.querySelector('.reading-progress')) return true

    const doc = preview.ownerDocument
    const labels = getProgressLabels(doc)
    host.classList.add('reading-progress-host')

    const widget = doc.createElement('aside')
    widget.className = 'reading-progress is-hidden'
    widget.setAttribute('aria-label', labels.label)
    const track = doc.createElement('button')
    track.type = 'button'
    track.className = 'reading-progress-track'
    track.setAttribute('aria-label', labels.label)
    const indicator = doc.createElement('span')
    indicator.className = 'reading-progress-indicator'
    indicator.setAttribute('aria-hidden', 'true')
    track.append(indicator)
    const value = doc.createElement('output')
    value.className = 'reading-progress-value'
    widget.append(track, value)
    host.append(widget)

    const update = () => {
        const progress = getReadingProgress(preview)
        widget.classList.toggle('is-hidden', !progress.isScrollable)
        widget.style.setProperty('--reading-progress', `${progress.percent}%`)
        track.setAttribute('aria-label', labels.value(progress.percent))
        value.value = String(progress.percent)
        value.textContent = `${progress.percent}%`
        track.title = labels.value(progress.percent)
    }

    track.addEventListener('click', event => {
        const rect = track.getBoundingClientRect()
        const ratio = Math.max(0, Math.min(1, (event.clientY - rect.top) / rect.height))
        preview.scrollTop = ratio * getReadingProgress(preview).maxScroll
        update()
    })
    preview.addEventListener('scroll', update, { passive: true })
    const MutationObserverCtor = doc.defaultView?.MutationObserver
    if (MutationObserverCtor) new MutationObserverCtor(update).observe(preview, { childList: true, subtree: true })
    doc.defaultView?.addEventListener('resize', update, { passive: true })
    if (typeof window !== 'undefined') window.updateReadingProgress = update
    update()
    return true
}

if (typeof document !== 'undefined') {
    const initialize = () => initReadingProgress(document)
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initialize, { once: true })
    else initialize()
}

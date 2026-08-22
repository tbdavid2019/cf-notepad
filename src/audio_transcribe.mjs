/**
 * audio_transcribe.mjs
 * Audio transcription helpers: VTT parsing, segment normalization, and timestamped Markdown formatting.
 */

export function parseVttTimestamp(ts) {
    if (!ts || typeof ts !== 'string') return 0
    const clean = ts.trim().replace(',', '.')
    const parts = clean.split(':')
    if (parts.length === 2) {
        const [min, sec] = parts
        return Math.max(0, (parseFloat(min) || 0) * 60 + (parseFloat(sec) || 0))
    } else if (parts.length === 3) {
        const [hr, min, sec] = parts
        return Math.max(0, (parseFloat(hr) || 0) * 3600 + (parseFloat(min) || 0) * 60 + (parseFloat(sec) || 0))
    }
    const val = parseFloat(clean)
    return isNaN(val) ? 0 : Math.max(0, val)
}

export function formatSecondsToTimestamp(seconds, { forceHours = false } = {}) {
    if (typeof seconds !== 'number' || isNaN(seconds) || seconds < 0) return '00:00'
    const totalSecs = Math.floor(seconds)
    const hrs = Math.floor(totalSecs / 3600)
    const mins = Math.floor((totalSecs % 3600) / 60)
    const secs = totalSecs % 60
    if (hrs > 0 || forceHours) {
        return `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
    }
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
}

export function parseVttToSegments(vttContent) {
    if (!vttContent || typeof vttContent !== 'string') return []
    const segments = []
    const lines = vttContent.replace(/\r\n/g, '\n').split('\n')
    let currentStart = null
    let currentEnd = null
    let currentTextLines = []

    const flushCurrent = () => {
        if (currentStart !== null && currentTextLines.length > 0) {
            const rawText = currentTextLines.join(' ')
                .replace(/<[^>]+>/g, '') // remove WebVTT tags like <v Speaker>, <b>, etc.
                .trim()
            if (rawText) {
                segments.push({
                    start: currentStart,
                    end: currentEnd ?? currentStart,
                    text: rawText,
                })
            }
        }
        currentStart = null
        currentEnd = null
        currentTextLines = []
    }

    const timeRegex = /^((?:\d{1,2}:)?\d{2}:\d{2}(?:[.,]\d{1,3})?)\s*-->\s*((?:\d{1,2}:)?\d{2}:\d{2}(?:[.,]\d{1,3})?)/

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim()
        if (!line) {
            flushCurrent()
            continue
        }
        if (line.startsWith('WEBVTT') || line.startsWith('NOTE') || line.startsWith('STYLE')) {
            continue
        }
        const timeMatch = line.match(timeRegex)
        if (timeMatch) {
            flushCurrent()
            currentStart = parseVttTimestamp(timeMatch[1])
            currentEnd = parseVttTimestamp(timeMatch[2])
            currentTextLines = []
        } else if (currentStart !== null) {
            currentTextLines.push(line)
        }
    }
    flushCurrent()
    return segments
}

export function normalizeTranscriptionSegments(rawSegments) {
    if (!Array.isArray(rawSegments) || rawSegments.length === 0) return []
    const normalized = []
    for (const seg of rawSegments) {
        if (!seg) continue
        const text = String(seg.text || '')
            .replace(/<[^>]+>/g, '')
            .trim()
        if (!text) continue
        const start = typeof seg.start === 'number' && !isNaN(seg.start) ? Math.max(0, seg.start) : 0
        const end = typeof seg.end === 'number' && !isNaN(seg.end) ? Math.max(start, seg.end) : start
        normalized.push({ start, end, text })
    }
    return normalized
}

export function formatTranscriptSegments(segments, rawFallbackText = '') {
    const validSegments = normalizeTranscriptionSegments(segments)
    if (validSegments.length === 0) {
        return String(rawFallbackText || '').trim()
    }

    // Check if any audio duration exceeds 1 hour so timestamps use hh:mm:ss consistently
    const maxTime = Math.max(...validSegments.map(s => Math.max(s.start, s.end)))
    const forceHours = maxTime >= 3600

    const paragraphs = []
    for (const seg of validSegments) {
        const timestampStr = formatSecondsToTimestamp(seg.start, { forceHours })
        paragraphs.push(`**[${timestampStr}]** ${seg.text}`)
    }

    return paragraphs.join('\n\n')
}

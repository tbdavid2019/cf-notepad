import jwt from '@tsndr/cloudflare-worker-jwt'
import Cookies from 'cookie'
import * as TEMPL from './template'
import { SUPPORTED_LANG, getGaMeasurementId, getSalt, getSecret } from './constant'
import { getNoteHistoryConfig, deleteNoteHistoryVersions } from './note_history.mjs'

const getNotesNamespace = () => globalThis.NOTES
const getShareNamespace = () => globalThis.SHARE

// generate random string
export const genRandomStr = n => {
    // remove char that confuse user
    const charset = '2345679abcdefghjkmnpqrstwxyz'
    return Array(n)
        .join()
        .split(',')
        .map(() => charset.charAt(Math.floor(Math.random() * charset.length)))
        .join('')
}

export function returnPage(type, data, headers = {}) {
    const ext = {
        ...(data?.ext || {}),
        gaMeasurementId: data?.ext?.gaMeasurementId ?? getGaMeasurementId(),
        noteHistoryEnabled: data?.ext?.noteHistoryEnabled ?? getNoteHistoryConfig().enabled,
    }

    return new Response(TEMPL[type]({ ...data, ext }), {
        headers: {
            'content-type': 'text/html;charset=UTF-8',
            ...headers,
        },
    });
}

export function returnJSON(code, data, headers = {}) {
    const successTempl = {
        err: 0,
        msg: 'ok',
        ...data && { data },
    }
    const errTempl = {
        err: code,
        msg: JSON.stringify(data),
    }
    const ret = code ? errTempl : successTempl
    return new Response(JSON.stringify(ret), {
        headers: {
            'content-type': 'application/json;charset=UTF-8',
            ...headers,
        },
    })
}

export async function MD5(str) {
    if (typeof str !== 'string') {
        console.warn('MD5: Input is not a string, converting', str)
        str = String(str || '')
    }
    try {
        const msgUint8 = new TextEncoder().encode(str)
        const hashBuffer = await crypto.subtle.digest('MD5', msgUint8)
        const hashArray = Array.from(new Uint8Array(hashBuffer))
        return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
    } catch (e) {
        console.error('MD5 Error:', e)
        throw new Error(`MD5 Hashing failed: ${e.message}`)
    }
}

export async function saltPw(password) {
    const hashPw = await MD5(password)
    return await MD5(`${hashPw}+${getSalt() || ''}`)
}

async function legacySaltPw(password) {
    const hashPw = await MD5(password)
    return await MD5(`${hashPw}+undefined`)
}

export async function passwordMatches(password, storedHash) {
    if (!storedHash) return false
    const currentHash = await saltPw(password)
    if (storedHash === currentHash) return true

    const legacyHash = await legacySaltPw(password)
    return storedHash === legacyHash
}

export async function checkAuth(cookie, path) {
    if (cookie.auth) {
        try {
            const secret = getSecret()
            if (typeof secret !== 'string' || !secret) {
                return { valid: false, role: null }
            }

            const valid = await jwt.verify(cookie.auth, secret)
            if (valid) {
                const payload = jwt.decode(cookie.auth)
                // Backward compatibility: if no role, assume 'edit' (old tokens)
                const role = payload.role || 'edit'
                if (payload.path === path) {
                    return { valid: true, role }
                }
            }
        } catch (error) {
            console.warn('Auth verification failed:', error?.message || error)
        }
    }
    return { valid: false, role: null }
}

export async function queryNote(key) {
    const result = await getNotesNamespace().getWithMetadata(key)
    return {
        value: result.value || '',
        metadata: result.metadata || {},
    }
}

export async function deleteNoteHistoryForPath(path) {
    const { enabled, db } = getNoteHistoryConfig()
    if (!enabled || !db || !path) return
    await deleteNoteHistoryVersions(db, path)
}

export function getI18n(request) {
    const DEFAULT_LANG = 'zh-TW'
    const FALLBACK_LANG = 'en-US'
    const normalizeLang = (rawLang = '') => {
        const lang = rawLang.trim().toLowerCase()
        if (!lang) return ''
        if (lang.startsWith('zh')) return DEFAULT_LANG
        if (lang === 'en' || lang.startsWith('en-')) return FALLBACK_LANG
        return FALLBACK_LANG
    }

    const cookie = Cookies.parse(request.headers.get('Cookie') || '')
    const cookieLang = normalizeLang(cookie.lang || '')
    if (cookieLang && SUPPORTED_LANG[cookieLang]) return cookieLang

    const al = request.headers.get('Accept-Language') || ''
    const acceptList = al.split(',').map(lang => lang.split(';')[0].trim()).filter(Boolean)
    const detectedLang = acceptList.map(normalizeLang).find(lang => SUPPORTED_LANG[lang])

    return detectedLang || DEFAULT_LANG
}

/**
 * Delete all empty pages (content length <= 10 characters)
 * @returns {Promise<{deleted: number, errors: string[]}>}
 */
export async function deleteEmptyPages() {
    const deleted = []
    const errors = []

    try {
        const list = await getNotesNamespace().list()

        for (const note of list.keys) {
            try {
                const value = await getNotesNamespace().get(note.name)

                // Check if page is empty (no content or very short content)
                if (!value || value.trim().length <= 10) {
                    await getNotesNamespace().delete(note.name)

                    // Also delete share link if exists
                    const md5 = await MD5(note.name)
                    await getShareNamespace().delete(md5)
                    await deleteNoteHistoryForPath(note.name)

                    deleted.push(note.name)
                }
            } catch (e) {
                errors.push(`Failed to process ${note.name}: ${e.message}`)
            }
        }
    } catch (e) {
        errors.push(`Failed to list notes: ${e.message}`)
    }

    return { deleted: deleted.length, errors }
}

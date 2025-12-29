import jwt from '@tsndr/cloudflare-worker-jwt'
import * as TEMPL from './template'
import { SALT, SECRET, SUPPORTED_LANG } from './constant'

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
    return new Response(TEMPL[type](data), {
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
    const msgUint8 = new TextEncoder().encode(str)
    const hashBuffer = await crypto.subtle.digest('MD5', msgUint8)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
}

export async function saltPw(password) {
    const hashPw = await MD5(password)
    return await MD5(`${hashPw}+${SALT}`)
}

export async function checkAuth(cookie, path) {
    if (cookie.auth) {
        const valid = await jwt.verify(cookie.auth, SECRET)
        if (valid) {
            const payload = jwt.decode(cookie.auth)
            if (payload.path === path) {
                return true
            }
        }
    }
    return false
}

export async function queryNote(key) {
    const result = await NOTES.getWithMetadata(key)
    return {
        value: result.value || '',
        metadata: result.metadata || {},
    }
}

export function getI18n(request) {
    const DEFAULT_LANG = 'zh-TW'
    const al = request.headers.get('Accept-Language') || DEFAULT_LANG
    const acceptList = al.split(',').map(lang => lang.split(';')[0].trim())
    return acceptList.find(lang => Object.keys(SUPPORTED_LANG).includes(lang)) || DEFAULT_LANG
}

/**
 * Delete all empty pages (content length <= 10 characters)
 * @returns {Promise<{deleted: number, errors: string[]}>}
 */
export async function deleteEmptyPages() {
    const deleted = []
    const errors = []

    try {
        const list = await NOTES.list()

        for (const note of list.keys) {
            try {
                const value = await NOTES.get(note.name)

                // Check if page is empty (no content or very short content)
                if (!value || value.trim().length <= 10) {
                    await NOTES.delete(note.name)

                    // Also delete share link if exists
                    const md5 = await MD5(note.name)
                    await SHARE.delete(md5)

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

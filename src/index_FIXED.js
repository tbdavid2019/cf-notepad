import { Router } from 'itty-router'
import jwt from '@tsndr/cloudflare-worker-jwt'
import * as Cookies from 'cookie'
import dayjs from 'dayjs'
import { Edit, Share, NeedPasswd, Page404, Admin } from './template'
import { SUPPORTED_LANG, APP_NAME } from './constant'

const router = Router()

const ENABLE_R2 = SCN_ENABLE_R2 === '1'
const SLUG_LENGTH = parseInt(SCN_SLUG_LENGTH) || 4
const SALT = SCN_SALT
const SECRET = SCN_SECRET
const ADMIN_PATH = SCN_ADMIN_PATH || '/admin'
const ADMIN_PW = SCN_ADMIN_PW

const MD5 = async (text) => {
    const encoder = new TextEncoder()
    const data = encoder.encode(text)
    const hashBuffer = await crypto.subtle.digest('MD5', data)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
}

const saltPw = async (passwd) => {
    return await MD5(SALT + passwd)
}

const checkAuth = async (cookie, path) => {
    if (!cookie.auth) return false
    try {
        const { payload } = await jwt.verify(cookie.auth, SECRET)
        return payload.path === path
    } catch {
        return false
    }
}

const getI18n = (request) => {
    const lang = request.headers.get('Accept-Language')?.split(',')[0]?.split('-')[0] || 'zh'
    return SUPPORTED_LANG[lang] ? lang : 'zh'
}

const queryNote = async (path) => {
    const value = await NOTES.get(path)
    const metadata = await NOTES.getWithMetadata(path)
    return { value: value || '', metadata: metadata.metadata || {} }
}

const returnPage = (template, data) => {
    const templates = { Edit, Share, NeedPasswd, Page404 }
    return new Response(templates[template](data), {
        headers: { 'Content-Type': 'text/html;charset=UTF-8' }
    })
}

const returnJSON = (err, data, headers = {}) => {
    return new Response(JSON.stringify({ err, data }), {
        headers: { 'Content-Type': 'application/json', ...headers }
    })
}

router.get('/share/:md5', async (request) => {
    const lang = getI18n(request)
    const { md5 } = request.params
    const path = await SHARE.get(md5)

    if (!path) {
        return returnPage('Page404', { lang, title: '404' })
    }

    const { value, metadata } = await queryNote(path)
    const title = metadata?.title || value.split('\n')[0].replace(/^#+\s*/, '').substring(0, 50).trim() || decodeURIComponent(path)

    // Check view password
    if (metadata.vpw) {
        const cookie = Cookies.parse(request.headers.get('Cookie') || '')
        if (!cookie[`view_${md5}`]) {
            return returnPage('NeedPasswd', { lang, title, showPwPrompt: true })
        }
    }

    return returnPage('Share', {
        lang,
        title,
        content: value,
        ext: metadata,
        path: path,
    })
})

router.get('/:path', async (request) => {
    const lang = getI18n(request)
    const { path } = request.params
    const cookie = Cookies.parse(request.headers.get('Cookie') || '')
    const { value, metadata } = await queryNote(path)
    const title = metadata?.title || value.split('\n')[0].substring(0, 50).trim() || decodeURIComponent(path)

    // Calculate shareId
    const shareId = await MD5(path)

    // Auto-share: save MD5 mapping
    if (request.event) {
        request.event.waitUntil(Promise.all([
            NOTES.put(path, value, {
                metadata: {
                    ...metadata,
                    views: (metadata.views || 0) + 1
                }
            }),
            SHARE.put(shareId, path)
        ]))
    }

    if (!metadata.pw) {
        return returnPage('Edit', {
            lang,
            title,
            content: value,
            ext: metadata,
            enableR2: ENABLE_R2,
            shareId,
            path,
        })
    }

    const valid = await checkAuth(cookie, path)
    if (valid) {
        return returnPage('Edit', {
            lang,
            title,
            content: value,
            ext: metadata,
            enableR2: ENABLE_R2,
            shareId,
            path,
        })
    }

    return returnPage('NeedPasswd', { lang, title })
})

router.post('/:path/auth', async request => {
    const { path } = request.params
    if (request.headers.get('Content-Type') === 'application/json') {
        const { passwd } = await request.json()
        const { metadata } = await queryNote(path)

        if (metadata.pw) {
            const storePw = await saltPw(passwd)
            if (metadata.pw === storePw) {
                const token = await jwt.sign({ path }, SECRET)
                return returnJSON(0, {
                    refresh: true,
                }, {
                    'Set-Cookie': Cookies.serialize('auth', token, {
                        path: `/${path}`,
                        expires: dayjs().add(7, 'day').toDate(),
                        httpOnly: true,
                    })
                })
            }
        }
    }
    return returnJSON(10002, 'Password auth failed!')
})

router.post('/:path/pw', async request => {
    const { path } = request.params
    if (request.headers.get('Content-Type') === 'application/json') {
        const cookie = Cookies.parse(request.headers.get('Cookie') || '')
        const { passwd, type } = await request.json()

        const { value, metadata } = await queryNote(path)
        const valid = await checkAuth(cookie, path)

        if (!metadata.pw || valid) {
            const pwField = type === 'view' ? 'vpw' : 'pw'
            const newPw = passwd ? await saltPw(passwd) : undefined

            try {
                await NOTES.put(path, value, {
                    metadata: {
                        ...metadata,
                        [pwField]: newPw,
                    },
                })

                return returnJSON(0, null, {
                    'Set-Cookie': Cookies.serialize('auth', '', {
                        path: `/${path}`,
                        expires: dayjs().subtract(100, 'day').toDate(),
                        httpOnly: true,
                    })
                })
            } catch (error) {
                console.error(error)
                return returnJSON(10001, error.message)
            }
        }
    }
    return returnJSON(10002, 'Unauthorized')
})

// ... rest of the routes remain the same

export default {
    async fetch(request, env, ctx) {
        Object.assign(globalThis, env)
        request.event = ctx
        return router.handle(request).catch(err => {
            console.error(err)
            return new Response('Internal Error', { status: 500 })
        })
    }
}

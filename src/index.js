import dayjs from 'dayjs'
import { Router } from 'itty-router'
import Cookies from 'cookie'
import jwt from '@tsndr/cloudflare-worker-jwt'
import { queryNote, MD5, checkAuth, genRandomStr, returnPage, returnJSON, saltPw, getI18n, deleteEmptyPages } from './helper'

import { SECRET, ADMIN_PATH, ADMIN_PW, SLUG_LENGTH, getEnableR2, getR2Domain } from './constant'

// init
const router = Router()

router.get('/', ({ url }) => {
    const newHash = genRandomStr(SLUG_LENGTH)
    // redirect to new page
    return Response.redirect(`${url}${newHash}`, 302)
})

router.get(ADMIN_PATH, async (request) => {
    const lang = getI18n(request)
    const cookie = Cookies.parse(request.headers.get('Cookie') || '')

    // Check if logged in
    if (cookie.admin_session === ADMIN_PW && ADMIN_PW) {
        // Logged in, list notes
        try {
            const list = await NOTES.list()

            // Fetch content for each note to extract title
            const notesWithTitles = await Promise.all(
                list.keys.map(async (note) => {
                    try {
                        const value = await NOTES.get(note.name)
                        const firstLine = value ? value.split('\n')[0] : ''
                        const title = note.metadata?.title || firstLine.replace(/^#+\s*/, '').substring(0, 50).trim() || ''

                        return {
                            ...note,
                            extractedTitle: title
                        }
                    } catch (e) {
                        return {
                            ...note,
                            extractedTitle: ''
                        }
                    }
                })
            )

            return returnPage('Admin', { lang, notes: notesWithTitles })
        } catch (e) {
            return returnPage('Admin', { lang, error: 'Failed to retrieve notes: ' + e.message })
        }
    }

    return returnPage('Admin', { lang })
})

router.post(ADMIN_PATH, async (request) => {
    const lang = getI18n(request)
    try {
        const cookie = Cookies.parse(request.headers.get('Cookie') || '')

        // Check if it's JSON request (batch delete)
        if (request.headers.get('Content-Type') === 'application/json') {
            if (cookie.admin_session === ADMIN_PW && ADMIN_PW) {
                const { action, paths } = await request.json()

                if (action === 'batch-delete' && Array.isArray(paths)) {
                    try {
                        // Delete all selected notes
                        await Promise.all(paths.map(async (path) => {
                            await NOTES.delete(path)
                            const md5 = await MD5(path)
                            await SHARE.delete(md5)
                        }))

                        return new Response(JSON.stringify({ success: true }), {
                            headers: { 'Content-Type': 'application/json' }
                        })
                    } catch (e) {
                        return new Response(JSON.stringify({ success: false, message: e.message }), {
                            headers: { 'Content-Type': 'application/json' }
                        })
                    }
                }

                // Delete all empty pages
                if (action === 'delete-empty') {
                    try {
                        const result = await deleteEmptyPages()
                        return new Response(JSON.stringify({
                            success: true,
                            deleted: result.deleted,
                            errors: result.errors
                        }), {
                            headers: { 'Content-Type': 'application/json' }
                        })
                    } catch (e) {
                        return new Response(JSON.stringify({ success: false, message: e.message }), {
                            headers: { 'Content-Type': 'application/json' }
                        })
                    }
                }
            }
            return new Response(JSON.stringify({ success: false, message: 'Unauthorized' }), {
                headers: { 'Content-Type': 'application/json' }
            })
        }

        // Original formData logic
        const formData = await request.formData()
        const password = formData.get('password')
        const action = formData.get('action')

        // Login Logic
        if (password === ADMIN_PW && ADMIN_PW) {
            return new Response(null, {
                status: 302,
                headers: {
                    'Location': ADMIN_PATH,
                    'Set-Cookie': Cookies.serialize('admin_session', ADMIN_PW, {
                        path: ADMIN_PATH,
                        expires: dayjs().add(1, 'day').toDate(),
                        httpOnly: true,
                        sameSite: 'Strict'
                    })
                }
            })
        }

        // Action Logic (Delete)
        // Check session for actions
        if (cookie.admin_session === ADMIN_PW && ADMIN_PW) {
            if (action === 'delete') {
                const path = formData.get('path')
                if (path) {
                    await NOTES.delete(path)
                    const md5 = await MD5(path)
                    await SHARE.delete(md5)
                }
                return Response.redirect(new URL(ADMIN_PATH, request.url).href, 302)
            }

            // Handle delete-empty action
            if (action === 'delete-empty') {
                const result = await deleteEmptyPages()
                // Redirect back to admin page (the page will reload and show updated list)
                return Response.redirect(new URL(ADMIN_PATH, request.url).href, 302)
            }
        }

    } catch (e) {
        console.error('Admin Error:', e)
        return returnPage('Admin', { lang, error: `Exception: ${e.message}` })
    }

    const debugInfo = `Auth Failed. Cookie: ${cookie.admin_session ? 'Present' : 'Missing'}, Match: ${cookie.admin_session === ADMIN_PW}, Action: ${action || 'None'}`
    return returnPage('Admin', { lang, error: `Operation Failed: ${debugInfo}` })
})

router.post('/upload', async (request) => {
    if (!getEnableR2()) return returnJSON(403, 'R2 Upload Disabled')
    try {
        const formData = await request.formData()
        const image = formData.get('image')
        if (!image) return returnJSON(400, 'No image found')

        const type = image.type.split('/')[1] || 'png'
        const filename = `${dayjs().format('YYYY/MM')}/${genRandomStr(16)}.${type}`

        await IMAGES.put(filename, image)
        const url = getR2Domain() ? `${getR2Domain()}/${filename}` : `/img/${filename}`

        return returnJSON(0, url)
    } catch (e) {
        return returnJSON(500, e.message)
    }
})

router.get('/share/:md5', async (request) => {
    const lang = getI18n(request)
    const { md5 } = request.params
    const path = await SHARE.get(md5)

    if (!!path) {
        const { value, metadata } = await queryNote(path)

        // Extract title from first line of content, remove markdown # symbols
        const firstLine = value.split('\n')[0] || ''
        const title = metadata?.title || firstLine.replace(/^#+\s*/, '').substring(0, 50).trim() || decodeURIComponent(path)

        return returnPage('Share', {
            lang,
            title,
            content: value,
            ext: metadata,
            path,
        })
    }

    return returnPage('Page404', { lang, title: '404' })
})

router.get('/:path', async (request) => {
    const lang = getI18n(request)

    const { path } = request.params

    const cookie = Cookies.parse(request.headers.get('Cookie') || '')

    const { value, metadata } = await queryNote(path)

    // Extract title from first line of content, remove markdown # symbols
    const firstLine = value.split('\n')[0] || ''
    const title = metadata?.title || firstLine.replace(/^#+\s*/, '').substring(0, 50).trim() || decodeURIComponent(path)

    // Calculate shareId only if sharing is enabled
    const shareId = metadata.share ? await MD5(path) : null

    // View Tracking with visitor deduplication
    if (request.event) {
        request.event.waitUntil(
            (async () => {
                try {
                    // Get or create visitor ID from cookie
                    let visitorId = cookie.visitor_id
                    if (!visitorId) {
                        visitorId = genRandomStr(16)
                    }

                    // Get list of visitors who have viewed this page
                    const viewedBy = metadata.viewedBy || []

                    // Only increment view count if this is a new visitor
                    if (!viewedBy.includes(visitorId)) {
                        viewedBy.push(visitorId)

                        await NOTES.put(path, value, {
                            metadata: {
                                ...metadata,
                                views: (metadata.views || 0) + 1,
                                viewedBy: viewedBy
                            }
                        })
                    }
                } catch (e) {
                    console.error('View tracking error:', e)
                }
            })()
        )
    }

    // Generate visitor ID if not exists
    let visitorId = cookie.visitor_id
    let visitorCookie = {}
    if (!visitorId) {
        visitorId = genRandomStr(16)
        visitorCookie = {
            'Set-Cookie': Cookies.serialize('visitor_id', visitorId, {
                path: '/',
                expires: dayjs().add(365, 'day').toDate(),
                httpOnly: true,
                sameSite: 'Lax'
            })
        }
    }

    if (!metadata.pw) {
        return returnPage('Edit', {
            lang,
            title,
            content: value,
            ext: { ...metadata, enableR2: getEnableR2() },
            shareId,
            path,
        }, visitorCookie)
    }

    const valid = await checkAuth(cookie, path)
    if (valid) {
        return returnPage('Edit', {
            lang,
            title,
            content: value,
            ext: { ...metadata, enableR2: getEnableR2() },
            shareId,
            path,
        }, visitorCookie)
    }

    return returnPage('NeedPasswd', { lang, title }, visitorCookie)
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
            const pw = passwd ? await saltPw(passwd) : undefined
            try {
                await NOTES.put(path, value, {
                    metadata: {
                        ...metadata,
                        [pwField]: pw,
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
            }
        }

        return returnJSON(10003, 'Password setting failed!')
    }
})

router.post('/:path/setting', async request => {
    const { path } = request.params
    if (request.headers.get('Content-Type') === 'application/json') {
        const cookie = Cookies.parse(request.headers.get('Cookie') || '')
        const { mode, share } = await request.json()

        const { value, metadata } = await queryNote(path)
        const valid = await checkAuth(cookie, path)

        if (!metadata.pw || valid) {
            try {
                await NOTES.put(path, value, {
                    metadata: {
                        ...metadata,
                        ...mode !== undefined && { mode },
                        ...share !== undefined && { share },
                    },
                })

                const md5 = await MD5(path)
                if (share) {
                    await SHARE.put(md5, path)
                    return returnJSON(0, md5)
                }
                if (share === false) {
                    await SHARE.delete(md5)
                }


                return returnJSON(0)
            } catch (error) {
                console.error(error)
            }
        }

        return returnJSON(10004, 'Update Setting failed!')
    }
})

router.post('/:path', async request => {
    const { path } = request.params
    const { value, metadata } = await queryNote(path)

    const cookie = Cookies.parse(request.headers.get('Cookie') || '')
    const valid = await checkAuth(cookie, path)

    if (!metadata.pw || valid) {
        // OK
    } else {
        return returnJSON(10002, 'Password auth failed! Try refreshing this page if you had just set a password.')
    }

    const formData = await request.formData();
    const content = formData.get('t')

    // const { metadata } = await queryNote(path)

    try {
        await NOTES.put(path, content, {
            metadata: {
                ...metadata,
                updateAt: dayjs().unix(),
            },
        })

        return returnJSON(0)
    } catch (error) {
        console.error(error)
    }

    return returnJSON(10001, 'KV insert fail!')
})

router.all('*', (request) => {
    const lang = getI18n(request)
    returnPage('Page404', { lang, title: '404' })
})

addEventListener('fetch', event => {
    event.request.event = event
    event.respondWith(router.handle(event.request, event))
})

// Cron job: Delete empty pages daily at 9 AM Taiwan time (1 AM UTC)
addEventListener('scheduled', async (event) => {
    console.log('Cron triggered at:', new Date().toISOString())

    try {
        const result = await deleteEmptyPages()
        console.log(`Cron cleanup completed: ${result.deleted} pages deleted`)

        if (result.errors.length > 0) {
            console.error('Cron cleanup errors:', result.errors)
        }
    } catch (e) {
        console.error('Cron cleanup failed:', e)
    }
})

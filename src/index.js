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



router.post('/share/:md5/auth', async request => {
    const { md5 } = request.params
    const path = await SHARE.get(md5)

    if (!!path) {
        if (request.headers.get('Content-Type') === 'application/json') {
            const { passwd } = await request.json()
            const { metadata } = await queryNote(path)

            if (metadata.vpw) {
                const storePw = await saltPw(passwd)

                // Check View Password
                if (metadata.vpw === storePw) {
                    const token = await jwt.sign({ path, role: 'view' }, SECRET)
                    return returnJSON(0, {
                        refresh: true,
                    }, {
                        'Set-Cookie': Cookies.serialize('auth', token, {
                            path: `/share/${md5}`,
                            expires: dayjs().add(7, 'day').toDate(),
                            httpOnly: true,
                        })
                    })
                }

                // Check Edit Password (allow admin to view share page too)
                if (metadata.pw === storePw) {
                    // Even if using edit password, on share page we give view role (or edit role?)
                    // Let's give view role to keep it safe/simple for share page context, 
                    // or edit role if we want to track who is who.
                    // Since router.get('/share/:md5') doesn't check specific role (just valid token), either works.
                    // Giving 'view' role is safer for the cookie on share path.
                    const token = await jwt.sign({ path, role: 'view' }, SECRET)
                    return returnJSON(0, {
                        refresh: true,
                    }, {
                        'Set-Cookie': Cookies.serialize('auth', token, {
                            path: `/share/${md5}`,
                            expires: dayjs().add(7, 'day').toDate(),
                            httpOnly: true,
                        })
                    })
                }
            }
        }
        return returnJSON(10002, 'Password auth failed!')
    }
    return returnJSON(404, 'Share not found')
})

router.get('/share/:md5', async (request) => {
    const lang = getI18n(request)
    const { md5 } = request.params
    const path = await SHARE.get(md5)

    if (!!path) {
        const cookie = Cookies.parse(request.headers.get('Cookie') || '')
        const { value, metadata } = await queryNote(path)

        // Check if View Password is set
        if (metadata.vpw) {
            const { valid } = await checkAuth(cookie, path)
            // If valid token exists (edit or view role), allow access
            // If not valid, show password prompt
            // Note: We use 'NeedPasswd' template but need to ensure it posts to /:path/auth
            // Since we are at /share/:md5, we need to pass 'path' for the frontend to construct the correct URL?
            // Actually, the current template uses window.location.pathname.
            // On share page, pathname is /share/xxx. We need it to POST to /note_path/auth.
            // But we don't want to expose the real note path in the HTML if possible (though it's in the auth token).
            // Let's modify the template logic later if needed, but for now passing 'path' to template
            // allows us to potentially adjust the fetch URL in frontend if we change template.

            if (!valid) {
                // For Share page, we need a way to tell frontend where to auth
                // Currently 'NeedPasswd' template uses current pathname. 
                // We will need to update template.js or handle /share/xxx/auth route?
                // Simpler: Allow frontend to know the real path for auth, 
                // OR implement /share/:md5/auth route.
                // Let's stick to using the real path for auth for now as it's simpler.
                // We pass 'path' to the template so we can use it.
                // Wait, exposing 'path' (real URL) might be okay if it's protected by password?
                // If vpw is set, we just need to auth.

                // If we strictly follow "don't expose path", we need a /share/:md5/auth route.
                // But let's assume exposing path for auth purpose is acceptable for now 
                // as the user just wants to view content.

                return returnPage('NeedPasswd', { lang, title: 'Password Protected', path })
            }
        }

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

    // Parallel fetch: Note content and View stats
    // Use SHARE KV for view tracking to avoid race condition with content updates
    const viewKey = `views::${path}`
    const [noteResult, viewDataRaw] = await Promise.all([
        queryNote(path),
        SHARE.get(viewKey, { type: 'json' })
    ])

    const { value, metadata } = noteResult

    // Extract title from first line of content, remove markdown # symbols
    const firstLine = value.split('\n')[0] || ''
    const title = metadata?.title || firstLine.replace(/^#+\s*/, '').substring(0, 50).trim() || decodeURIComponent(path)

    // Calculate shareId only if sharing is enabled
    const shareId = metadata.share ? await MD5(path) : null

    // Prepare view data (migrate from metadata if separate store is empty)
    let currentViews = viewDataRaw?.views || metadata.views || 0
    let currentViewedBy = viewDataRaw?.viewedBy || metadata.viewedBy || []

    // Update metadata object with correct views for display (without persisting to NOTES)
    const displayMetadata = {
        ...metadata,
        views: currentViews
    }

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

                    // Only increment view count if this is a new visitor
                    if (!currentViewedBy.includes(visitorId)) {
                        currentViewedBy.push(visitorId)
                        currentViews += 1

                        // Save to SHARE KV instead of NOTES KV
                        await SHARE.put(viewKey, JSON.stringify({
                            views: currentViews,
                            viewedBy: currentViewedBy
                        }))
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
            ext: { ...displayMetadata, enableR2: getEnableR2() },
            shareId,
            path,
        }, visitorCookie)
    }

    // Strict Mode: Edit Page only allows Edit Role
    const { valid, role } = await checkAuth(cookie, path)
    if (valid && role === 'edit') {
        return returnPage('Edit', {
            lang,
            title,
            content: value,
            ext: { ...displayMetadata, enableR2: getEnableR2() },
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

            // Check Edit Password
            if (metadata.pw === storePw) {
                const token = await jwt.sign({ path, role: 'edit' }, SECRET)
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

            // Check View Password
            if (metadata.vpw && metadata.vpw === storePw) {
                const token = await jwt.sign({ path, role: 'view' }, SECRET)
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

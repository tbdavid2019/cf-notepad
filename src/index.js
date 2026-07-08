import dayjs from 'dayjs'
import { Router } from 'itty-router'
import Cookies from 'cookie'
import jwt from '@tsndr/cloudflare-worker-jwt'
import { queryNote, MD5, checkAuth, genRandomStr, returnPage, returnJSON, saltPw, passwordMatches, getI18n, deleteEmptyPages, deleteNoteHistoryForPath } from './helper'
import { ADMIN_PATH, ADMIN_PW, SLUG_LENGTH, getEnableR2, getR2Domain, getGaMeasurementId, getSecret } from './constant'
import { NOTEPAD_ICON_SVG } from './icon'
import { NOTEPAD_FAVICON_ICO, NOTEPAD_ICON_PNG, NOTEPAD_OG_IMAGE_PNG } from './icon_assets'
import { extractNoteDescription, extractNoteTitle } from './note_meta'
import { summarizeHistoryContent } from './note_history_presenter'
import {
    AGENT_SKILL_MARKDOWN,
    AUTH_MD_MARKDOWN,
    API_DOCS_MARKDOWN,
    applyDiscoveryHeaders,
    buildMarkdownDocument,
    buildAgentSkillsIndex,
    buildApiCatalog,
    buildOpenApiDocument,
    buildRobotsTxt,
    buildSitemapXml,
    createMarkdownResponse,
    createDiscoveryResponse,
    getDiscoveryConstants,
    requestAcceptsMarkdown,
} from './discovery.mjs'
import {
    getNoteHistoryConfig,
    getNoteHistoryVersionById,
    listNoteHistoryVersions,
    saveNoteHistoryVersionIfNeeded,
} from './note_history.mjs'

// init
const router = Router()
const getNotesNamespace = () => globalThis.NOTES
const getShareNamespace = () => globalThis.SHARE
const getImagesBucket = () => globalThis.IMAGES
const {
    AGENT_SKILL_PATH,
    AGENT_SKILLS_INDEX_PATH,
    API_CATALOG_PATH,
    API_CATALOG_PROFILE,
    API_DOCS_PATH,
    AUTH_MD_PATH,
    API_HEALTH_PATH,
    OPENAPI_PATH,
} = getDiscoveryConstants()

const iconSvgResponse = () => new Response(NOTEPAD_ICON_SVG, {
    headers: {
        'Content-Type': 'image/svg+xml; charset=UTF-8',
        'Cache-Control': 'public, max-age=31536000, immutable',
    }
})

const iconPngResponse = () => new Response(NOTEPAD_ICON_PNG, {
    headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'public, max-age=31536000, immutable',
    }
})

const ogImageResponse = () => new Response(NOTEPAD_OG_IMAGE_PNG, {
    headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'public, max-age=31536000, immutable',
    }
})

const faviconResponse = () => new Response(NOTEPAD_FAVICON_ICO, {
    headers: {
        'Content-Type': 'image/x-icon',
        'Cache-Control': 'public, max-age=31536000, immutable',
    }
})

function parseBooleanValue(value) {
    if (typeof value === 'boolean') return value
    if (typeof value !== 'string') return undefined

    const normalized = value.trim().toLowerCase()
    if (normalized === 'true' || normalized === '1' || normalized === 'yes' || normalized === 'on') return true
    if (normalized === 'false' || normalized === '0' || normalized === 'no' || normalized === 'off') return false

    return undefined
}

function readStringField(value) {
    return typeof value === 'string' ? value : undefined
}

async function readMultipartTextField(value) {
    if (typeof value === 'string') return value
    if (value && typeof value.text === 'function') return await value.text()
    return undefined
}

function readApiPassword(request, bodyPassword) {
    const url = new URL(request.url)
    const queryPw = url.searchParams.get('pw')
    const authHeader = request.headers.get('Authorization')
    const headerPw = authHeader ? authHeader.replace('Bearer ', '').trim() : null
    return queryPw || headerPw || bodyPassword || null
}

function formatSitemapLastmod(updateAt) {
    const unixSeconds = Number(updateAt)
    if (!Number.isFinite(unixSeconds) || unixSeconds <= 0) return undefined
    return dayjs.unix(unixSeconds).format('YYYY-MM-DD')
}

async function buildSitemapEntries(origin) {
    const keys = []
    let cursor

    do {
        const page = await getNotesNamespace().list(cursor ? { cursor } : undefined)
        keys.push(...page.keys)
        cursor = page.list_complete ? undefined : page.cursor
    } while (cursor)

    const publicKeys = keys.filter(note =>
        note?.metadata?.share === true && note?.metadata?.publicIndex === true
    )

    return Promise.all(publicKeys.map(async note => ({
        loc: `${origin}/share/${await MD5(note.name)}`,
        lastmod: formatSitemapLastmod(note.metadata?.updateAt),
    })))
}

async function requireApiEditAccess(request, metadata, bodyPassword) {
    if (!metadata?.pw) {
        return { ok: true }
    }

    const cookie = Cookies.parse(request.headers.get('Cookie') || '')
    const { valid, role } = await checkAuth(cookie, request.params?.path)
    if (valid && role === 'edit') {
        return { ok: true }
    }

    const providedPw = readApiPassword(request, bodyPassword)
    if (!providedPw) {
        return { ok: false, response: returnJSON(401, 'Unauthorized: Password required to edit') }
    }

    if (!(await passwordMatches(providedPw, metadata.pw))) {
        return { ok: false, response: returnJSON(403, 'Forbidden: Incorrect edit password') }
    }

    return { ok: true }
}

async function persistNoteContent({
    path,
    content,
    metadata,
    previousContent,
}) {
    await getNotesNamespace().put(path, content, { metadata })

    const historyConfig = getNoteHistoryConfig()
    if (!historyConfig.enabled || !historyConfig.db) {
        return
    }

    try {
        await saveNoteHistoryVersionIfNeeded({
            db: historyConfig.db,
            enabled: historyConfig.enabled,
            limit: historyConfig.limit,
            minIntervalSeconds: historyConfig.minIntervalSeconds,
            path,
            previousContent,
            nextContent: content,
            nowSeconds: dayjs().unix(),
        })
    } catch (error) {
        console.error(`Note history save failed for ${path}:`, error)
    }
}

async function backupCurrentNoteBeforeRestore({
    path,
    currentContent,
    restoredContent,
}) {
    const historyConfig = getNoteHistoryConfig()
    if (!historyConfig.enabled || !historyConfig.db) {
        return
    }

    await saveNoteHistoryVersionIfNeeded({
        db: historyConfig.db,
        enabled: historyConfig.enabled,
        limit: historyConfig.limit,
        minIntervalSeconds: historyConfig.minIntervalSeconds,
        path,
        previousContent: currentContent,
        nextContent: restoredContent,
        nowSeconds: dayjs().unix(),
        force: true,
    })
}

router.get('/', ({ url }) => {
    const newHash = genRandomStr(SLUG_LENGTH)
    // redirect to new page
    return Response.redirect(`${url}${newHash}`, 302)
})

router.head('/', ({ url }) => {
    const newHash = genRandomStr(SLUG_LENGTH)
    return Response.redirect(`${url}${newHash}`, 302)
})

router.get(ADMIN_PATH, async (request) => {
    const lang = getI18n(request)
    const cookie = Cookies.parse(request.headers.get('Cookie') || '')

    // Check if logged in
    if (cookie.admin_session === ADMIN_PW && ADMIN_PW) {
        // Logged in, list notes
        try {
            const list = await getNotesNamespace().list()

            // Fetch content for each note to extract title
            const notesWithTitles = await Promise.all(
                list.keys.map(async (note) => {
                    try {
                        const value = await getNotesNamespace().get(note.name)
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
        const contentType = request.headers.get('Content-Type') || '';
        if (contentType.includes('application/json')) {
            if (cookie.admin_session === ADMIN_PW && ADMIN_PW) {
                const body = await request.json();
                const { action, paths } = body;

                if (action === 'batch-delete' && Array.isArray(paths)) {
                    try {
                        // Delete all selected notes
                        await Promise.all(paths.map(async (path) => {
                            await getNotesNamespace().delete(path)
                            const md5 = await MD5(path)
                            await getShareNamespace().delete(md5)
                            await deleteNoteHistoryForPath(path)
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
                    await getNotesNamespace().delete(path)
                    const md5 = await MD5(path)
                    await getShareNamespace().delete(md5)
                    await deleteNoteHistoryForPath(path)
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

        await getImagesBucket().put(filename, image)
        const url = getR2Domain() ? `${getR2Domain()}/${filename}` : `/img/${filename}`

        return returnJSON(0, url)
    } catch (e) {
        return returnJSON(500, e.message)
    }
})



router.post('/share/:md5/auth', async request => {
    const { md5 } = request.params
    const path = await getShareNamespace().get(md5)

    if (!!path) {
        if (request.headers.get('Content-Type') === 'application/json') {
            const { passwd } = await request.json()
            const { metadata } = await queryNote(path)

            if (metadata.vpw) {
                // Check View Password
                if (await passwordMatches(passwd, metadata.vpw)) {
                    const token = await jwt.sign({ path, role: 'view' }, getSecret())
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
                if (await passwordMatches(passwd, metadata.pw)) {
                    // Even if using edit password, on share page we give view role (or edit role?)
                    // Let's give view role to keep it safe/simple for share page context, 
                    // or edit role if we want to track who is who.
                    // Since router.get('/share/:md5') doesn't check specific role (just valid token), either works.
                    // Giving 'view' role is safer for the cookie on share path.
                    const token = await jwt.sign({ path, role: 'view' }, getSecret())
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

async function renderSharePage(request, presentationMode = false) {
    const lang = getI18n(request)
    const { md5 } = request.params
    const path = await getShareNamespace().get(md5)
    const sharePath = `/share/${md5}`
    const presentationPath = `${sharePath}/present`
    const authPath = `${sharePath}/auth`
    const gaMeasurementId = getGaMeasurementId()

    if (!!path) {
        const cookie = Cookies.parse(request.headers.get('Cookie') || '')
        const { value, metadata } = await queryNote(path)
        const origin = new URL(request.url).origin

        // Check if View Password is set
        if (metadata.vpw) {
            const { valid } = await checkAuth(cookie, path)

            if (!valid) {
                return returnPage('NeedPasswd', {
                    lang,
                    title: 'Password Protected',
                    path,
                    ext: {
                        authPath,
                        sharePath,
                        presentationPath,
                        gaMeasurementId,
                        presentationEntry: presentationMode,
                        autoPresent: false,
                    },
                })
            }
        }

        const title = extractNoteTitle(value, metadata?.title, decodeURIComponent(path))
        const description = extractNoteDescription(value, title)
        const canonicalPath = presentationMode ? presentationPath : sharePath
        const canonicalUrl = `${origin}${canonicalPath}`

        if (requestAcceptsMarkdown(request)) {
            return createMarkdownResponse(
                buildMarkdownDocument(value, {
                    title,
                    description,
                    canonical_url: canonicalUrl,
                    share_url: `${origin}${sharePath}`,
                    presentation_url: presentationMode ? canonicalUrl : `${origin}${presentationPath}`,
                    note_path: path,
                }),
            )
        }

        return returnPage('Share', {
            lang,
            title,
            content: value,
            ext: {
                ...metadata,
                ...(metadata.pw || metadata.vpw ? { authPath } : {}),
                sharePath,
                presentationPath,
                gaMeasurementId,
                presentationEntry: presentationMode,
                autoPresent: presentationMode,
                meta: {
                    canonicalUrl,
                    description,
                    ogImageUrl: `${origin}/og-image.png`,
                    ogType: 'article',
                    robots: 'index,follow',
                    siteName: false,
                    twitterCard: 'summary',
                },
            },
            path,
        })
    }

    return returnPage('Page404', { lang, title: '404' })
}

router.get('/share/:md5', async (request) => {
    return renderSharePage(request, false)
})

router.head('/share/:md5', async (request) => {
    return renderSharePage(request, false)
})

router.get('/share/:md5/present', async (request) => {
    return renderSharePage(request, true)
})

router.head('/share/:md5/present', async (request) => {
    return renderSharePage(request, true)
})

router.get('/icon.svg', iconSvgResponse)
router.head('/icon.svg', iconSvgResponse)

router.get('/icon.png', iconPngResponse)
router.head('/icon.png', iconPngResponse)

router.get('/og-image.png', ogImageResponse)
router.head('/og-image.png', ogImageResponse)

router.get('/favicon.ico', faviconResponse)
router.head('/favicon.ico', faviconResponse)

router.get('/robots.txt', (request) => createDiscoveryResponse(
    buildRobotsTxt(new URL(request.url).origin),
    'text/plain; charset=UTF-8',
))

router.head('/robots.txt', (request) => createDiscoveryResponse(
    buildRobotsTxt(new URL(request.url).origin),
    'text/plain; charset=UTF-8',
))

router.get('/sitemap.xml', async (request) => {
    const origin = new URL(request.url).origin
    return createDiscoveryResponse(
        buildSitemapXml(await buildSitemapEntries(origin)),
        'application/xml; charset=UTF-8',
    )
})

router.head('/sitemap.xml', async (request) => {
    const origin = new URL(request.url).origin
    return createDiscoveryResponse(
        buildSitemapXml(await buildSitemapEntries(origin)),
        'application/xml; charset=UTF-8',
    )
})

router.get(API_CATALOG_PATH, async (request) => {
    const origin = new URL(request.url).origin
    return createDiscoveryResponse(
        JSON.stringify(buildApiCatalog(origin), null, 2),
        `application/linkset+json; charset=UTF-8; profile="${API_CATALOG_PROFILE}"`,
    )
})

router.head(API_CATALOG_PATH, async (request) => {
    const origin = new URL(request.url).origin
    return createDiscoveryResponse(
        JSON.stringify(buildApiCatalog(origin), null, 2),
        `application/linkset+json; charset=UTF-8; profile="${API_CATALOG_PROFILE}"`,
    )
})

router.get(API_DOCS_PATH, () => createDiscoveryResponse(
    API_DOCS_MARKDOWN,
    'text/markdown; charset=UTF-8',
))

router.head(API_DOCS_PATH, () => createDiscoveryResponse(
    API_DOCS_MARKDOWN,
    'text/markdown; charset=UTF-8',
))

router.get(AUTH_MD_PATH, () => createDiscoveryResponse(
    AUTH_MD_MARKDOWN,
    'text/markdown; charset=UTF-8',
))

router.head(AUTH_MD_PATH, () => createDiscoveryResponse(
    AUTH_MD_MARKDOWN,
    'text/markdown; charset=UTF-8',
))

router.get(OPENAPI_PATH, async (request) => {
    const origin = new URL(request.url).origin
    return createDiscoveryResponse(
        JSON.stringify(buildOpenApiDocument(origin), null, 2),
        'application/openapi+json; charset=UTF-8',
    )
})

router.head(OPENAPI_PATH, async (request) => {
    const origin = new URL(request.url).origin
    return createDiscoveryResponse(
        JSON.stringify(buildOpenApiDocument(origin), null, 2),
        'application/openapi+json; charset=UTF-8',
    )
})

router.get(API_HEALTH_PATH, () => createDiscoveryResponse(
    JSON.stringify({
        status: 'ok',
    }),
    'application/json; charset=UTF-8',
))

router.head(API_HEALTH_PATH, () => createDiscoveryResponse(
    JSON.stringify({
        status: 'ok',
    }),
    'application/json; charset=UTF-8',
))

router.get(AGENT_SKILLS_INDEX_PATH, async () => createDiscoveryResponse(
    JSON.stringify(await buildAgentSkillsIndex(), null, 2),
    'application/json; charset=UTF-8',
))

router.head(AGENT_SKILLS_INDEX_PATH, async () => createDiscoveryResponse(
    JSON.stringify(await buildAgentSkillsIndex(), null, 2),
    'application/json; charset=UTF-8',
))

router.get(AGENT_SKILL_PATH, () => createDiscoveryResponse(
    AGENT_SKILL_MARKDOWN,
    'text/markdown; charset=UTF-8',
))

router.head(AGENT_SKILL_PATH, () => createDiscoveryResponse(
    AGENT_SKILL_MARKDOWN,
    'text/markdown; charset=UTF-8',
))

router.get('/.well-known/agent-skills/:asset', async (request) => {
    if (request.params.asset !== 'index.json') {
        const lang = getI18n(request)
        return returnPage('Page404', { lang, title: '404' })
    }

    return createDiscoveryResponse(
        JSON.stringify(await buildAgentSkillsIndex(), null, 2),
        'application/json; charset=UTF-8',
    )
})

router.head('/.well-known/agent-skills/:asset', async (request) => {
    if (request.params.asset !== 'index.json') {
        const lang = getI18n(request)
        return returnPage('Page404', { lang, title: '404' })
    }

    return createDiscoveryResponse(
        JSON.stringify(await buildAgentSkillsIndex(), null, 2),
        'application/json; charset=UTF-8',
    )
})

router.get('/.well-known/agent-skills/:skillName/:fileName', (request) => {
    if (request.params.skillName !== 'david888-wiki-publisher' || request.params.fileName !== 'SKILL.md') {
        const lang = getI18n(request)
        return returnPage('Page404', { lang, title: '404' })
    }

    return createDiscoveryResponse(
        AGENT_SKILL_MARKDOWN,
        'text/markdown; charset=UTF-8',
    )
})

router.head('/.well-known/agent-skills/:skillName/:fileName', (request) => {
    if (request.params.skillName !== 'david888-wiki-publisher' || request.params.fileName !== 'SKILL.md') {
        const lang = getI18n(request)
        return returnPage('Page404', { lang, title: '404' })
    }

    return createDiscoveryResponse(
        AGENT_SKILL_MARKDOWN,
        'text/markdown; charset=UTF-8',
    )
})

router.get('/api/:path/history', async (request) => {
    const { path } = request.params
    const { metadata } = await queryNote(path)
    const auth = await requireApiEditAccess(request, metadata)
    if (!auth.ok) return auth.response

    const historyConfig = getNoteHistoryConfig()
    if (!historyConfig.enabled) {
        return returnJSON(404, 'Note history is disabled')
    }
    if (!historyConfig.db) {
        return returnJSON(500, 'Note history database is not configured')
    }

    try {
        const versions = await listNoteHistoryVersions(historyConfig.db, path, historyConfig.limit)
        return returnJSON(0, {
            enabled: true,
            limit: historyConfig.limit,
            minIntervalSeconds: historyConfig.minIntervalSeconds,
            versions: versions.map(version => ({
                id: version.id,
                createdAt: Number(version.created_at || 0),
                contentLength: Number(version.content_length || 0),
                ...summarizeHistoryContent(version.content || ''),
            })),
        })
    } catch (error) {
        console.error('History List Error:', error)
        return returnJSON(500, `History List Error: ${error.message}`)
    }
})

router.get('/api/:path/history/:versionId', async (request) => {
    const { path, versionId } = request.params
    const { metadata } = await queryNote(path)
    const auth = await requireApiEditAccess(request, metadata)
    if (!auth.ok) return auth.response

    const historyConfig = getNoteHistoryConfig()
    if (!historyConfig.enabled) {
        return returnJSON(404, 'Note history is disabled')
    }
    if (!historyConfig.db) {
        return returnJSON(500, 'Note history database is not configured')
    }

    try {
        const version = await getNoteHistoryVersionById(historyConfig.db, path, Number(versionId))
        if (!version) {
            return returnJSON(404, 'History version not found')
        }

        return returnJSON(0, {
            id: version.id,
            createdAt: Number(version.created_at || 0),
            content: version.content || '',
        })
    } catch (error) {
        console.error('History Get Error:', error)
        return returnJSON(500, `History Get Error: ${error.message}`)
    }
})

router.post('/api/:path/history/:versionId/restore', async (request) => {
    const { path, versionId } = request.params
    const { value, metadata } = await queryNote(path)
    const auth = await requireApiEditAccess(request, metadata)
    if (!auth.ok) return auth.response

    const historyConfig = getNoteHistoryConfig()
    if (!historyConfig.enabled) {
        return returnJSON(404, 'Note history is disabled')
    }
    if (!historyConfig.db) {
        return returnJSON(500, 'Note history database is not configured')
    }

    try {
        const version = await getNoteHistoryVersionById(historyConfig.db, path, Number(versionId))
        if (!version) {
            return returnJSON(404, 'History version not found')
        }

        const restoredContent = version.content || ''
        await backupCurrentNoteBeforeRestore({
            path,
            currentContent: value,
            restoredContent,
        })

        const nextMetadata = {
            ...metadata,
            updateAt: dayjs().unix(),
        }

        await getNotesNamespace().put(path, restoredContent, {
            metadata: nextMetadata,
        })

        const fullUrl = new URL(request.url)
        const responseData = {
            msg: 'Restored successfully',
            url: `${fullUrl.protocol}//${fullUrl.host}/${path}`,
        }

        if (nextMetadata.share) {
            responseData.shareUrl = `${fullUrl.protocol}//${fullUrl.host}/share/${await MD5(path)}`
        }

        return returnJSON(0, responseData)
    } catch (error) {
        console.error('History Restore Error:', error)
        return returnJSON(500, `History Restore Error: ${error.message}`)
    }
})

router.get('/api/:path', async (request) => {
    const { path } = request.params
    const { value, metadata } = await queryNote(path)
    const url = new URL(request.url)

    if (metadata.pw || metadata.vpw) {
        const queryPw = url.searchParams.get('pw')
        const authHeader = request.headers.get('Authorization')
        const headerPw = authHeader ? authHeader.replace('Bearer ', '').trim() : null

        const providedPw = queryPw || headerPw;
        if (!providedPw) return returnJSON(401, 'Unauthorized: Password required')

        const hasViewAccess = (metadata.vpw && await passwordMatches(providedPw, metadata.vpw)) ||
            (metadata.pw && await passwordMatches(providedPw, metadata.pw))

        if (!hasViewAccess) return returnJSON(403, 'Forbidden: Incorrect password')
    }

    if (url.searchParams.get('format') === 'json') {
        const displayMetadata = { ...metadata }
        delete displayMetadata.pw
        delete displayMetadata.vpw
        return returnJSON(0, { content: value, metadata: displayMetadata })
    }

    return new Response(value || '', {
        headers: {
            'Content-Type': 'text/markdown;charset=UTF-8',
            'Access-Control-Allow-Origin': '*'
        }
    })
})

router.post('/api/upload', async (request) => {
    if (!getEnableR2()) return returnJSON(403, 'R2 Upload Disabled')
    try {
        const formData = await request.formData()
        const image = formData.get('image') || formData.get('file')
        if (!image) return returnJSON(400, 'No image/file found in form data')

        const type = image.type.split('/')[1] || 'png'
        const filename = `${dayjs().format('YYYY/MM')}/${genRandomStr(16)}.${type}`

        await getImagesBucket().put(filename, image)
        const url = getR2Domain() ? `${getR2Domain()}/${filename}` : `/img/${filename}`

        return returnJSON(0, url)
    } catch (e) {
        return returnJSON(500, e.message)
    }
})

router.post('/api/:path', async (request) => {
    const { path } = request.params
    const { value, metadata } = await queryNote(path)
    const url = new URL(request.url)

    let reqBody = {}
    const contentType = request.headers.get('Content-Type') || ''
    if (contentType.includes('application/json')) {
        try {
            reqBody = await request.json()
        } catch (e) {
            return returnJSON(400, 'Invalid JSON body')
        }
    } else if (contentType.includes('text/markdown') || contentType.includes('text/plain')) {
        reqBody = {
            text: await request.text(),
        }

        const append = parseBooleanValue(url.searchParams.get('append'))
        if (append !== undefined) reqBody.append = append

        const share = parseBooleanValue(url.searchParams.get('share'))
        if (share !== undefined) reqBody.share = share

        const publicValue = parseBooleanValue(url.searchParams.get('public'))
        if (publicValue !== undefined) reqBody.public = publicValue

        const publicIndex = parseBooleanValue(url.searchParams.get('publicIndex'))
        if (publicIndex !== undefined) reqBody.publicIndex = publicIndex

        const theme = url.searchParams.get('theme')
        if (theme !== null) reqBody.theme = theme

        const bodyPw = url.searchParams.get('pw')
        if (bodyPw !== null) reqBody.pw = bodyPw

        const vpw = url.searchParams.get('vpw')
        if (vpw !== null) reqBody.vpw = vpw
    } else if (contentType.includes('multipart/form-data')) {
        const formData = await request.formData()
        const multipartText = await readMultipartTextField(
            formData.get('file') || formData.get('markdown') || formData.get('text')
        )

        if (multipartText === undefined) {
            return returnJSON(400, 'No markdown file/text found in form data')
        }

        reqBody = {
            text: multipartText,
        }

        const append = parseBooleanValue(readStringField(formData.get('append')))
        if (append !== undefined) reqBody.append = append

        const share = parseBooleanValue(readStringField(formData.get('share')))
        if (share !== undefined) reqBody.share = share

        const publicValue = parseBooleanValue(readStringField(formData.get('public')))
        if (publicValue !== undefined) reqBody.public = publicValue

        const publicIndex = parseBooleanValue(readStringField(formData.get('publicIndex')))
        if (publicIndex !== undefined) reqBody.publicIndex = publicIndex

        const theme = readStringField(formData.get('theme'))
        if (theme !== undefined) reqBody.theme = theme

        const pwField = readStringField(formData.get('pw'))
        if (pwField !== undefined) reqBody.pw = pwField

        const vpwField = readStringField(formData.get('vpw'))
        if (vpwField !== undefined) reqBody.vpw = vpwField
    } else {
        return returnJSON(400, 'Content-Type must be application/json, text/markdown, text/plain, or multipart/form-data')
    }

    const auth = await requireApiEditAccess(request, metadata, reqBody.pw || null)
    if (!auth.ok) return auth.response

    // Support "content" as a fallback in case LLM sends the wrong json key
    const text = reqBody.text || reqBody.content || ''
    const append = reqBody.append === true

    const newContent = append ? (value ? value + '\n\n' + text : text) : text

    const updateMetadata = {
        ...metadata,
        updateAt: dayjs().unix(),
    }

    if (reqBody.pw !== undefined) updateMetadata.pw = reqBody.pw ? await saltPw(reqBody.pw) : undefined
    if (reqBody.vpw !== undefined) updateMetadata.vpw = reqBody.vpw ? await saltPw(reqBody.vpw) : undefined

    if (reqBody.share !== undefined) {
        updateMetadata.share = reqBody.share === true
    } else if (reqBody.public !== undefined) {
        // Alias public to share
        updateMetadata.share = reqBody.public === true
    } else if (updateMetadata.share === undefined) {
        // Unconditionally default to sharing for notes created via API
        updateMetadata.share = true
    }

    if (reqBody.theme !== undefined) {
        updateMetadata.theme = reqBody.theme
    }

    if (reqBody.publicIndex !== undefined) {
        updateMetadata.publicIndex = reqBody.publicIndex === true
    }

    if (updateMetadata.share === false) {
        updateMetadata.publicIndex = false
    }

    try {
        await persistNoteContent({
            path,
            content: newContent,
            metadata: updateMetadata,
            previousContent: value,
        })

        const md5 = await MD5(path)
        if (updateMetadata.share) {
            await getShareNamespace().put(md5, path)
        } else if (updateMetadata.share === false) {
            await getShareNamespace().delete(md5)
        }

        const fullUrl = new URL(request.url)
        const responseData = {
            msg: 'Saved successfully',
            url: `${fullUrl.protocol}//${fullUrl.host}/${path}`
        }
        
        // Always provide the share URL if it's shared, so the LLM can give a safe link to the human
        if (updateMetadata.share) {
            responseData.shareUrl = `${fullUrl.protocol}//${fullUrl.host}/share/${md5}`
        }

        return returnJSON(0, responseData)
    } catch (error) {
        console.error('API Error:', error)
        return returnJSON(500, `API Internal Error: ${error.message}${error.stack ? '\n' + error.stack : ''}`)
    }
})

router.get('/:path', async (request) => {
    const lang = getI18n(request)

    const { path } = request.params

    const cookie = Cookies.parse(request.headers.get('Cookie') || '')
    const { value, metadata } = await queryNote(path)

    const title = extractNoteTitle(value, metadata?.title, decodeURIComponent(path))

    // Calculate shareId only if sharing is enabled
    const shareId = metadata.share ? await MD5(path) : null

    if (!metadata.pw && !metadata.vpw) {
        if (requestAcceptsMarkdown(request)) {
            return createMarkdownResponse(
                buildMarkdownDocument(value, {
                    title,
                    note_path: path,
                    edit_url: `${new URL(request.url).origin}/${path}`,
                    share_url: shareId ? `${new URL(request.url).origin}/share/${shareId}` : '',
                }),
            )
        }

        return returnPage('Edit', {
            lang,
            title,
            content: value,
            ext: { ...metadata, enableR2: getEnableR2() },
            shareId,
            path,
        })
    }

    const { valid, role } = await checkAuth(cookie, path)

    if (metadata.vpw) {
        if (valid && role === 'edit') {
            if (requestAcceptsMarkdown(request)) {
                return createMarkdownResponse(
                    buildMarkdownDocument(value, {
                        title,
                        note_path: path,
                        edit_url: `${new URL(request.url).origin}/${path}`,
                        share_url: shareId ? `${new URL(request.url).origin}/share/${shareId}` : '',
                    }),
                )
            }

            return returnPage('Edit', {
                lang,
                title,
                content: value,
                ext: { ...metadata, enableR2: getEnableR2() },
                shareId,
                path,
            })
        }

        return returnPage('NeedPasswd', { lang, title })
    }

    if (valid && role === 'edit') {
        if (requestAcceptsMarkdown(request)) {
            return createMarkdownResponse(
                buildMarkdownDocument(value, {
                    title,
                    note_path: path,
                    edit_url: `${new URL(request.url).origin}/${path}`,
                    share_url: shareId ? `${new URL(request.url).origin}/share/${shareId}` : '',
                }),
            )
        }

        return returnPage('Edit', {
            lang,
            title,
            content: value,
            ext: { ...metadata, enableR2: getEnableR2() },
            shareId,
            path,
        })
    }

    return returnPage('Edit', {
        lang,
        title,
        content: value,
        ext: { ...metadata, enableR2: getEnableR2(), authPath: `/${path}/auth` },
        showPwPrompt: true,
        shareId,
        path,
    })
})

router.head('/:path', async (request) => {
    const { path } = request.params

    const cookie = Cookies.parse(request.headers.get('Cookie') || '')
    const { value, metadata } = await queryNote(path)
    const title = extractNoteTitle(value, metadata?.title, decodeURIComponent(path))
    const shareId = metadata.share ? await MD5(path) : null

    if (!metadata.pw && !metadata.vpw) {
        if (requestAcceptsMarkdown(request)) {
            return createMarkdownResponse(
                buildMarkdownDocument(value, {
                    title,
                    note_path: path,
                    edit_url: `${new URL(request.url).origin}/${path}`,
                    share_url: shareId ? `${new URL(request.url).origin}/share/${shareId}` : '',
                }),
            )
        }

        const lang = getI18n(request)
        return returnPage('Edit', {
            lang,
            title,
            content: value,
            ext: { ...metadata, enableR2: getEnableR2() },
            shareId,
            path,
        })
    }

    const lang = getI18n(request)
    const { valid, role } = await checkAuth(cookie, path)

    if (metadata.vpw) {
        if (valid && role === 'edit') {
            if (requestAcceptsMarkdown(request)) {
                return createMarkdownResponse(
                    buildMarkdownDocument(value, {
                        title,
                        note_path: path,
                        edit_url: `${new URL(request.url).origin}/${path}`,
                        share_url: shareId ? `${new URL(request.url).origin}/share/${shareId}` : '',
                    }),
                )
            }

            return returnPage('Edit', {
                lang,
                title,
                content: value,
                ext: { ...metadata, enableR2: getEnableR2() },
                shareId,
                path,
            })
        }

        return returnPage('NeedPasswd', { lang, title })
    }

    if (valid && role === 'edit') {
        if (requestAcceptsMarkdown(request)) {
            return createMarkdownResponse(
                buildMarkdownDocument(value, {
                    title,
                    note_path: path,
                    edit_url: `${new URL(request.url).origin}/${path}`,
                    share_url: shareId ? `${new URL(request.url).origin}/share/${shareId}` : '',
                }),
            )
        }

        return returnPage('Edit', {
            lang,
            title,
            content: value,
            ext: { ...metadata, enableR2: getEnableR2() },
            shareId,
            path,
        })
    }

    return returnPage('Edit', {
        lang,
        title,
        content: value,
        ext: { ...metadata, enableR2: getEnableR2(), authPath: `/${path}/auth` },
        showPwPrompt: true,
        shareId,
        path,
    })
})

router.post('/:path/auth', async request => {
    const { path } = request.params
    if (request.headers.get('Content-Type') === 'application/json') {
        const { passwd } = await request.json()

        const { metadata } = await queryNote(path)

        if (metadata.pw) {
            // Check Edit Password
            if (await passwordMatches(passwd, metadata.pw)) {
                const token = await jwt.sign({ path, role: 'edit' }, getSecret())
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
            if (metadata.vpw && await passwordMatches(passwd, metadata.vpw)) {
                const token = await jwt.sign({ path, role: 'view' }, getSecret())
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
    try {
        if (request.headers.get('Content-Type') === 'application/json') {
            const cookie = Cookies.parse(request.headers.get('Cookie') || '')
            const { passwd, type } = await request.json()

            const { value, metadata } = await queryNote(path)
            const { valid } = await checkAuth(cookie, path)

            if (!metadata.pw || valid) {
                const pwField = type === 'view' ? 'vpw' : 'pw'
                const pw = passwd ? await saltPw(passwd) : undefined
                try {
                    await getNotesNamespace().put(path, value, {
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
                    throw error
                }
            }

            return returnJSON(10003, 'Password setting failed!')
        }
    } catch (error) {
        console.error('PW Error:', error)
        return returnJSON(500, `PW Internal Error: ${error.message}`)
    }
})

router.post('/:path/setting', async request => {
    const { path } = request.params
    try {
        if (request.headers.get('Content-Type') === 'application/json') {
            const cookie = Cookies.parse(request.headers.get('Cookie') || '')
            const { mode, share, theme, width, shareFont, previewDevice, publicIndex } = await request.json()

            const { value, metadata } = await queryNote(path)
            const { valid } = await checkAuth(cookie, path)

            if (!metadata.pw || valid) {
                try {
                    const nextMetadata = {
                        ...metadata,
                        ...mode !== undefined && { mode },
                        ...share !== undefined && { share },
                        ...theme !== undefined && { theme },
                        ...width !== undefined && { width },
                        ...shareFont !== undefined && { shareFont },
                        ...previewDevice !== undefined && { previewDevice },
                        ...publicIndex !== undefined && { publicIndex: publicIndex === true },
                    }

                    if (share === false) {
                        nextMetadata.publicIndex = false
                    }

                    await getNotesNamespace().put(path, value, {
                        metadata: nextMetadata,
                    })

                    const md5 = await MD5(path)
                    if (share) {
                        await getShareNamespace().put(md5, path)
                        return returnJSON(0, md5)
                    }
                    if (share === false) {
                        await getShareNamespace().delete(md5)
                    }


                    return returnJSON(0)
                } catch (error) {
                    console.error(error)
                    throw error
                }
            }

            return returnJSON(10004, 'Update Setting failed!')
        }
    } catch (error) {
        console.error('Setting Error:', error)
        return returnJSON(500, `Setting Internal Error: ${error.message}`)
    }
})

router.post('/:path', async request => {
    const { path } = request.params
    const { value, metadata } = await queryNote(path)

    const cookie = Cookies.parse(request.headers.get('Cookie') || '')
    const { valid } = await checkAuth(cookie, path)

    if (!metadata.pw || valid) {
        // OK
    } else {
        return returnJSON(10002, 'Password auth failed! Try refreshing this page if you had just set a password.')
    }

    const formData = await request.formData();
    const content = formData.get('t')

    // const { metadata } = await queryNote(path)

    try {
        await persistNoteContent({
            path,
            content,
            metadata: {
                ...metadata,
                updateAt: dayjs().unix(),
            },
            previousContent: value,
        })

        return returnJSON(0)
    } catch (error) {
        console.error('Save Error:', error)
        return returnJSON(10001, `KV insert fail: ${error.message}`)
    }
})

router.all('*', (request) => {
    const lang = getI18n(request)
    return returnPage('Page404', { lang, title: '404' })
})

function bindRuntimeEnv(env = {}) {
    Object.assign(globalThis, env)
}

export default {
    async fetch(request, env, ctx) {
        bindRuntimeEnv(env)

        try {
            const response = await router.handle(request, {
                request,
                env,
                waitUntil: promise => ctx.waitUntil(promise),
            })
            const requestPath = new URL(request.url).pathname
            let finalResponse = response

            if (requestPath === '/') {
                const headers = new Headers(response.headers)
                applyDiscoveryHeaders(headers)
                finalResponse = new Response(response.body, {
                    headers,
                    status: response.status,
                    statusText: response.statusText,
                })
            }

            if (request.method === 'HEAD') {
                return new Response(null, {
                    headers: finalResponse.headers,
                    status: finalResponse.status,
                    statusText: finalResponse.statusText,
                })
            }

            return finalResponse
        } catch (err) {
            console.error('Fetch Event Error:', err)
            return new Response(`Worker Error: ${err.message}`, { status: 500 })
        }
    },

    // Cron job: Delete empty pages daily at 9 AM Taiwan time (1 AM UTC)
    async scheduled(event, env) {
        bindRuntimeEnv(env)
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
    },
}

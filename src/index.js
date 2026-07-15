import dayjs from 'dayjs'
import { Router } from 'itty-router'
import Cookies from 'cookie'
import jwt from '@tsndr/cloudflare-worker-jwt'
import { queryNote, MD5, checkAuth, genRandomStr, returnPage, returnJSON, saltPw, passwordMatches, getPasswordRole, getI18n, deleteEmptyPages, deleteNoteHistoryForPath } from './helper'
import { getSlugLength, getAdminPath, getAdminPassword, getEnableR2, getR2Domain, getGaMeasurementId, getSecret } from './constant'
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
    getNoteHistoryCounts,
    getNoteHistoryVersionById,
    listNoteHistoryVersions,
    saveNoteHistoryVersionIfNeeded,
} from './note_history.mjs'
import { filterAdminNotes, normalizeAdminQuery, paginateAdminNotes, sortAdminNotes, summarizeAdminNotes } from './admin_data.mjs'
import { canPersistNoteContent, getSaveBlockedMessage } from './save_policy.mjs'

// init
const router = Router()
const getNotesNamespace = () => globalThis.NOTES
const getShareNamespace = () => globalThis.SHARE
const getImagesBucket = () => globalThis.IMAGES
const SHARE_SLUG_LENGTH = 6
const OG_IMAGE_VERSION = '2026-07-14-david888-wiki'
const getOgImageUrl = origin => new URL(`/og-image.png?v=${OG_IMAGE_VERSION}`, origin).href
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

function normalizeAiText(value) {
    if (typeof value !== 'string') return ''
    return value.replace(/\u0000/g, '').trim()
}

function extractAiText(payload) {
    if (!payload) return ''
    if (typeof payload === 'string') return normalizeAiText(payload)

    const directCandidates = [
        payload.response,
        payload.output_text,
        payload.text,
        payload.content,
        payload.answer,
        payload.result?.response,
        payload.result?.output_text,
        payload.result?.text,
        payload.result?.content,
        payload.choices?.[0]?.message?.content,
        payload.choices?.[0]?.text,
    ]

    for (const candidate of directCandidates) {
        if (typeof candidate === 'string') {
            const normalized = normalizeAiText(candidate)
            if (normalized) return normalized
        }

        if (Array.isArray(candidate)) {
            const joined = candidate
                .map(item => {
                    if (typeof item === 'string') return item
                    if (typeof item?.text === 'string') return item.text
                    if (typeof item?.content === 'string') return item.content
                    return ''
                })
                .filter(Boolean)
                .join('\n')
            const normalized = normalizeAiText(joined)
            if (normalized) return normalized
        }
    }

    const outputCandidates = [
        payload.output,
        payload.result?.output,
        payload.response?.output,
    ]

    for (const output of outputCandidates) {
        if (!Array.isArray(output)) continue

        const text = output
            .flatMap(item => {
                if (typeof item?.text === 'string') return [item.text]
                if (!Array.isArray(item?.content)) return []
                return item.content
                    .map(part => {
                        if (typeof part?.text === 'string') return part.text
                        if (typeof part?.output_text === 'string') return part.output_text
                        return ''
                    })
                    .filter(Boolean)
            })
            .join('\n')

        const normalized = normalizeAiText(text)
        if (normalized) return normalized
    }

    return ''
}

async function runAiWithTimeout(aiBinding, model, payload, timeoutMs = 120000) {
    let timeoutId
    const timeoutPromise = new Promise((_, reject) => {
        timeoutId = setTimeout(() => {
            reject(new Error(`AI request timed out after ${timeoutMs}ms`))
        }, timeoutMs)
    })

    try {
        return await Promise.race([
            aiBinding.run(model, payload),
            timeoutPromise,
        ])
    } finally {
        clearTimeout(timeoutId)
    }
}

async function generateUniqueShareSlug() {
    for (let attempt = 0; attempt < 12; attempt += 1) {
        const candidate = genRandomStr(SHARE_SLUG_LENGTH)
        const existing = await getShareNamespace().get(candidate)
        if (!existing) return candidate
    }
    throw new Error('Failed to generate unique share slug')
}

async function getShareIdForPath(path, metadata = {}) {
    if (metadata.share !== true) return null
    return metadata.shareSlug || await MD5(path)
}

async function ensureShareMetadata(path, metadata = {}) {
    if (metadata.share !== true) return { ...metadata }
    if (metadata.shareSlug) return { ...metadata }
    return {
        ...metadata,
        shareSlug: await generateUniqueShareSlug(),
    }
}

async function syncShareMappings(path, metadata = {}, previousMetadata = {}) {
    const legacyShareId = await MD5(path)

    if (metadata.share === true) {
        await getShareNamespace().put(legacyShareId, path)
        if (metadata.shareSlug) {
            await getShareNamespace().put(metadata.shareSlug, path)
        }
    } else {
        await getShareNamespace().delete(legacyShareId)
        if (previousMetadata.shareSlug) {
            await getShareNamespace().delete(previousMetadata.shareSlug)
        }
        if (metadata.shareSlug && metadata.shareSlug !== previousMetadata.shareSlug) {
            await getShareNamespace().delete(metadata.shareSlug)
        }
    }
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
        loc: `${origin}/share/${await getShareIdForPath(note.name, note.metadata || {})}`,
        lastmod: formatSitemapLastmod(note.metadata?.updateAt),
    })))
}

async function requireApiEditAccess(request, metadata, bodyPassword) {
    if (!metadata?.pw && !metadata?.vpw) {
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

    if ((await getPasswordRole(providedPw, metadata)) !== 'edit') {
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

const homePage = request => {
    const originUrl = new URL(request.url)
    const nextUrl = new URL(genRandomStr(getSlugLength()), originUrl)
    const canonicalUrl = new URL('/', originUrl)
    const ogImageUrl = getOgImageUrl(originUrl)

    return returnPage('Home', {
        lang: getI18n(request),
        nextUrl: nextUrl.href,
        canonicalUrl: canonicalUrl.href,
        ogImageUrl,
    })
}

router.get('/', homePage)
router.head('/', homePage)

const handleAdminGet = async (request) => {
    const lang = getI18n(request)
    const cookie = Cookies.parse(request.headers.get('Cookie') || '')
    const adminPath = getAdminPath()
    const adminPassword = getAdminPassword()

    // Check if logged in
    if (cookie.admin_session === adminPassword && adminPassword) {
        // Logged in, list notes
        try {
            const adminData = await buildAdminData(request)
            return returnPage('Admin', { lang, adminPath, ...adminData })
        } catch (e) {
            return returnPage('Admin', { lang, adminPath, error: 'Failed to retrieve notes: ' + e.message })
        }
    }

    return returnPage('Admin', { lang, adminPath })
}

async function listAllAdminNotes() {
    const notes = []
    let cursor

    do {
        const page = await getNotesNamespace().list(cursor ? { cursor } : undefined)
        notes.push(...(page.keys || []))
        cursor = page.list_complete ? undefined : page.cursor
    } while (cursor)

    return notes
}

async function mapWithConcurrency(items, worker, concurrency = 20) {
    const results = new Array(items.length)
    let nextIndex = 0

    async function consume() {
        while (nextIndex < items.length) {
            const index = nextIndex++
            results[index] = await worker(items[index], index)
        }
    }

    await Promise.all(Array.from({ length: Math.min(concurrency, items.length) }, consume))
    return results
}

function isValidAdminNotePath(path) {
    return typeof path === 'string'
        && path.length > 0
        && path.length <= 512
        && !path.includes('\0')
}

async function buildAdminData(request) {
    const query = normalizeAdminQuery(new URL(request.url).searchParams)
    const listedNotes = await listAllAdminNotes()
    const historyConfig = getNoteHistoryConfig()
    const versionCounts = historyConfig.enabled && historyConfig.db
        ? await getNoteHistoryCounts(historyConfig.db, listedNotes.map(note => note.name))
        : new Map()
    const needsContentScan = Boolean(query.title || query.text || query.sort === 'title')

    const records = await mapWithConcurrency(listedNotes, async note => {
        const metadata = note.metadata || {}
        let content = ''
        let title = metadata.title || ''

        if (needsContentScan) {
            try {
                content = await getNotesNamespace().get(note.name) || ''
                title = extractNoteTitle(content, title, decodeURIComponent(note.name))
            } catch (error) {
                console.warn(`Admin note read failed for ${note.name}:`, error?.message || error)
            }
        }

        return {
            path: note.name,
            title: title || decodeURIComponent(note.name),
            content,
            updatedAt: Number.isFinite(Number(metadata.updateAt)) ? Number(metadata.updateAt) : 0,
            views: Number.isFinite(Number(metadata.views)) ? Number(metadata.views) : 0,
            versionCount: versionCounts.get(note.name) || 0,
            shared: metadata.share === true,
            indexed: metadata.share === true && metadata.publicIndex === true,
            protected: Boolean(metadata.pw || metadata.vpw),
            hasEditLock: Boolean(metadata.pw),
            hasViewLock: Boolean(metadata.vpw),
        }
    })

    const filtered = filterAdminNotes(records, query)
    const sorted = sortAdminNotes(filtered, query)
    const pagination = paginateAdminNotes(sorted, query.page, query.pageSize)

    if (!needsContentScan) {
        pagination.items = await mapWithConcurrency(pagination.items, async note => {
            try {
                const content = await getNotesNamespace().get(note.path) || ''
                return {
                    ...note,
                    title: extractNoteTitle(content, note.title, decodeURIComponent(note.path)),
                }
            } catch (error) {
                return note
            }
        })
    }

    return {
        notes: pagination.items,
        stats: summarizeAdminNotes(records),
        pagination: {
            ...pagination,
            filteredItems: filtered.length,
        },
        filters: query,
        historyEnabled: Boolean(historyConfig.enabled && historyConfig.db),
        contentScanned: needsContentScan,
    }
}

const handleAdminPost = async (request) => {
    const lang = getI18n(request)
    const adminPath = getAdminPath()
    const adminPassword = getAdminPassword()
    try {
        const cookie = Cookies.parse(request.headers.get('Cookie') || '')

        // Check if it's JSON request (batch delete)
            const contentType = request.headers.get('Content-Type') || '';
            if (contentType.includes('application/json')) {
                if (cookie.admin_session === adminPassword && adminPassword) {
                    const body = await request.json();
                    const { action, paths } = body;

                    if (action === 'batch-delete' && (!Array.isArray(paths) || paths.length > 100 || paths.some(path => !isValidAdminNotePath(path)))) {
                        return new Response(JSON.stringify({ success: false, message: 'Invalid note selection' }), {
                            status: 400,
                            headers: { 'Content-Type': 'application/json' },
                        })
                    }

                    if (action === 'batch-delete' && Array.isArray(paths)) {
                    try {
                        // Delete all selected notes
                        await Promise.all(paths.map(async (path) => {
                            const { metadata } = await queryNote(path)
                            await getNotesNamespace().delete(path)
                            await syncShareMappings(path, { share: false }, metadata || {})
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
        if (password === adminPassword && adminPassword) {
            return new Response(null, {
                status: 302,
                headers: {
                    'Location': adminPath,
                    'Set-Cookie': Cookies.serialize('admin_session', adminPassword, {
                        path: adminPath,
                        expires: dayjs().add(1, 'day').toDate(),
                        httpOnly: true,
                        sameSite: 'Strict'
                    })
                }
            })
        }

        // Action Logic (Delete)
        // Check session for actions
        if (cookie.admin_session === adminPassword && adminPassword) {
            if (action === 'delete') {
                const path = formData.get('path')
                if (isValidAdminNotePath(path)) {
                    const { metadata } = await queryNote(path)
                    await getNotesNamespace().delete(path)
                    await syncShareMappings(path, { share: false }, metadata || {})
                    await deleteNoteHistoryForPath(path)
                } else {
                    return returnPage('Admin', { lang, adminPath, error: 'Invalid note path' })
                }
                return Response.redirect(new URL(adminPath, request.url).href, 302)
            }

            // Handle delete-empty action
            if (action === 'delete-empty') {
                const result = await deleteEmptyPages()
                // Redirect back to admin page (the page will reload and show updated list)
                return Response.redirect(new URL(adminPath, request.url).href, 302)
            }
        }

    } catch (e) {
        console.error('Admin Error:', e)
        return returnPage('Admin', { lang, error: `Exception: ${e.message}` })
    }

    const debugInfo = `Auth Failed. Cookie: ${cookie.admin_session ? 'Present' : 'Missing'}, Match: ${cookie.admin_session === adminPassword}, Action: ${action || 'None'}`
    return returnPage('Admin', { lang, error: `Operation Failed: ${debugInfo}` })
}

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



router.post('/share/:shareId/auth', async request => {
    const { shareId } = request.params
    const path = await getShareNamespace().get(shareId)

    if (!!path) {
        if (request.headers.get('Content-Type') === 'application/json') {
            const { passwd } = await request.json()
            const { metadata } = await queryNote(path)

            const role = await getPasswordRole(passwd, metadata)
            if (role) {
                const token = await jwt.sign({ path, role }, getSecret())
                return returnJSON(0, {
                    refresh: true,
                    role,
                }, {
                    'Set-Cookie': Cookies.serialize('auth', token, {
                        path: role === 'edit' ? `/${path}` : `/share/${shareId}`,
                        expires: dayjs().add(7, 'day').toDate(),
                        httpOnly: true,
                    })
                })
            }
        }
        return returnJSON(10002, 'Password auth failed!')
    }
    return returnJSON(404, 'Share not found')
})

async function renderSharePage(request, presentationMode = false) {
    const lang = getI18n(request)
    const { shareId } = request.params
    const embedMode = new URL(request.url).searchParams.get('embed') === '1'
    const path = await getShareNamespace().get(shareId)
    const sharePath = `/share/${shareId}`
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
            shareId,
            ext: {
                ...metadata,
                ...(metadata.pw || metadata.vpw ? { authPath } : {}),
                sharePath,
                presentationPath,
                gaMeasurementId,
                presentationEntry: presentationMode,
                autoPresent: presentationMode,
                embed: embedMode,
                meta: {
                    canonicalUrl,
                    description,
                    ogImageUrl: getOgImageUrl(origin),
                    ogType: 'article',
                    robots: 'index,follow',
                    siteName: 'DAVID888 WIKI',
                    twitterCard: 'summary_large_image',
                },
            },
            path,
        })
    }

    return returnPage('Page404', { lang, title: '404' })
}

router.get('/share/:shareId', async (request) => {
    return renderSharePage(request, false)
})

router.head('/share/:shareId', async (request) => {
    return renderSharePage(request, false)
})

router.get('/share/:shareId/present', async (request) => {
    return renderSharePage(request, true)
})

router.head('/share/:shareId/present', async (request) => {
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
            responseData.shareUrl = `${fullUrl.protocol}//${fullUrl.host}/share/${await getShareIdForPath(path, nextMetadata)}`
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

    let updateMetadata = {
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
    updateMetadata = await ensureShareMetadata(path, updateMetadata)

    if (!canPersistNoteContent(updateMetadata)) {
        return returnJSON(10005, getSaveBlockedMessage(getI18n(request)))
    }

    try {
        await persistNoteContent({
            path,
            content: newContent,
            metadata: updateMetadata,
            previousContent: value,
        })

        await syncShareMappings(path, updateMetadata, metadata)

        const fullUrl = new URL(request.url)
        const responseData = {
            msg: 'Saved successfully',
            url: `${fullUrl.protocol}//${fullUrl.host}/${path}`
        }
        
        // Always provide the share URL if it's shared, so the LLM can give a safe link to the human
        if (updateMetadata.share) {
            responseData.shareUrl = `${fullUrl.protocol}//${fullUrl.host}/share/${await getShareIdForPath(path, updateMetadata)}`
        }

        return returnJSON(0, responseData)
    } catch (error) {
        console.error('API Error:', error)
        return returnJSON(500, `API Internal Error: ${error.message}${error.stack ? '\n' + error.stack : ''}`)
    }
})

// Cloudflare bindings are populated in fetch() after this module is loaded.
// Resolve the configured admin path per request so SCN_ADMIN_PATH is not
// frozen to the local fallback during module evaluation.
router.all('*', async (request) => {
    const adminPath = getAdminPath()
    const requestPath = new URL(request.url).pathname

    if (requestPath !== adminPath) return

    if (request.method === 'GET' || request.method === 'HEAD') {
        return handleAdminGet(request)
    }

    if (request.method === 'POST') {
        return handleAdminPost(request)
    }

    return new Response('Method Not Allowed', { status: 405 })
})

router.get('/:path', async (request) => {
    const lang = getI18n(request)

    const { path } = request.params

    const cookie = Cookies.parse(request.headers.get('Cookie') || '')
    const { value, metadata } = await queryNote(path)

    const title = extractNoteTitle(value, metadata?.title, decodeURIComponent(path))

    // Calculate shareId only if sharing is enabled
    const shareId = await getShareIdForPath(path, metadata)

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

    if (valid && role === 'view') {
        return returnPage('Share', {
            lang,
            title,
            content: value,
            ext: { ...metadata, enableR2: getEnableR2(), authPath: `/${path}/auth` },
            shareId,
            path,
        })
    }

    if (metadata.vpw) return returnPage('NeedPasswd', { lang, title, path, ext: { authPath: `/${path}/auth` } })

    return returnPage('Share', {
        lang,
        title,
        content: value,
        ext: { ...metadata, enableR2: getEnableR2(), authPath: `/${path}/auth` },
        shareId,
        path,
    })
})

router.head('/:path', async (request) => {
    const { path } = request.params

    const cookie = Cookies.parse(request.headers.get('Cookie') || '')
    const { value, metadata } = await queryNote(path)
    const title = extractNoteTitle(value, metadata?.title, decodeURIComponent(path))
    const shareId = await getShareIdForPath(path, metadata)

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

    if (valid && role === 'view') {
        return returnPage('Share', {
            lang,
            title,
            content: value,
            ext: { ...metadata, enableR2: getEnableR2(), authPath: `/${path}/auth` },
            shareId,
            path,
        })
    }

    if (metadata.vpw) return returnPage('NeedPasswd', { lang, title, path, ext: { authPath: `/${path}/auth` } })

    return returnPage('Share', {
        lang,
        title,
        content: value,
        ext: { ...metadata, enableR2: getEnableR2(), authPath: `/${path}/auth` },
        shareId,
        path,
    })
})

router.post('/:path/auth', async request => {
    const { path } = request.params
    if (request.headers.get('Content-Type') === 'application/json') {
        const { passwd } = await request.json()

        const { metadata } = await queryNote(path)

        const role = await getPasswordRole(passwd, metadata)
        if (role) {
            const token = await jwt.sign({ path, role }, getSecret())
            return returnJSON(0, {
                refresh: true,
                role,
            }, {
                'Set-Cookie': Cookies.serialize('auth', token, {
                    path: `/${path}`,
                    expires: dayjs().add(7, 'day').toDate(),
                    httpOnly: true,
                })
            })
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
            const { valid, role } = await checkAuth(cookie, path)

            if ((!metadata.pw && !metadata.vpw) || (valid && role === 'edit')) {
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
            const { mode, share, theme, width, shareFont, previewDevice, splitDirection, publicIndex, autosave, content } = await request.json()

            const { value, metadata } = await queryNote(path)
            const { valid, role } = await checkAuth(cookie, path)

            if ((!metadata.pw && !metadata.vpw) || (valid && role === 'edit')) {
                try {
                    let nextMetadata = {
                        ...metadata,
                        ...mode !== undefined && { mode },
                        ...share !== undefined && { share },
                        ...theme !== undefined && { theme },
                        ...width !== undefined && { width },
                        ...shareFont !== undefined && { shareFont },
                        ...previewDevice !== undefined && { previewDevice },
                        ...splitDirection !== undefined && { splitDirection },
                        ...publicIndex !== undefined && { publicIndex: publicIndex === true },
                    }

                    if (autosave !== undefined) {
                        nextMetadata.autosave = autosave === true && nextMetadata.share === true
                    }

                    if (share === false) {
                        nextMetadata.publicIndex = false
                        nextMetadata.autosave = false
                    }
                    if (typeof content === 'string' && share === true) {
                        nextMetadata.updateAt = dayjs().unix()
                    }
                    nextMetadata = await ensureShareMetadata(path, nextMetadata)

                    if (typeof content === 'string' && share === true) {
                        await persistNoteContent({
                            path,
                            content,
                            metadata: nextMetadata,
                            previousContent: value,
                        })
                    } else {
                        await getNotesNamespace().put(path, value, {
                            metadata: nextMetadata,
                        })
                    }

                    if (share) {
                        await syncShareMappings(path, nextMetadata, metadata)
                        return returnJSON(0, await getShareIdForPath(path, nextMetadata))
                    }
                    if (share === false) {
                        await syncShareMappings(path, nextMetadata, metadata)
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
    const { valid, role } = await checkAuth(cookie, path)

    if ((!metadata.pw && !metadata.vpw) || (valid && role === 'edit')) {
        // OK
    } else {
        return returnJSON(10002, 'Password auth failed! Try refreshing this page if you had just set a password.')
    }

    if (!canPersistNoteContent(metadata)) {
        return returnJSON(10005, getSaveBlockedMessage(getI18n(request)))
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

router.post('/:path/ai-format', async (request, { env }) => {
    const path = decodeURIComponent(request.params.path)

    const { metadata } = await queryNote(path)
    const cookie = Cookies.parse(request.headers.get('Cookie') || '')
    const { valid, role } = await checkAuth(cookie, path)

    if (metadata && (metadata.pw || metadata.vpw) && (!valid || role !== 'edit')) {
        return returnJSON(10002, 'Password auth failed!', { status: 401 })
    }

    console.log('[AI] env.AI type:', typeof env.AI)
    console.log('[AI] env.AI keys:', env.AI ? Object.keys(env.AI) : 'null')

    if (!env.AI) {
        return returnJSON(50001, 'Cloudflare Workers AI service is not configured on this Worker.', { status: 500 })
    }

    let json
    try {
        json = await request.json()
    } catch (e) {
        return returnJSON(40001, 'Invalid JSON body', { status: 400 })
    }

    const { text, mode, instruction, selectionStart, selectionEnd } = json
    if (!text || typeof text !== 'string') {
        return returnJSON(40002, 'Text content is required', { status: 400 })
    }

    const normalizedText = typeof text === 'string' ? text.replace(/\u0000/g, '') : ''
    const userInstruction = typeof instruction === 'string' ? instruction.replace(/\u0000/g, '').trim() : ''

    if (mode !== 'format' && mode !== 'edit') {
        return returnJSON(40003, 'Unsupported AI mode', { status: 400 })
    }

    if (mode === 'edit' && !userInstruction) {
        return returnJSON(40004, 'Editing instructions are required', { status: 400 })
    }

    const hasSelection = mode === 'edit'
        && Number.isInteger(selectionStart)
        && Number.isInteger(selectionEnd)
        && selectionStart >= 0
        && selectionEnd > selectionStart
        && selectionEnd <= normalizedText.length
    const model = mode === 'edit' ? '@cf/openai/gpt-oss-120b' : '@cf/openai/gpt-oss-20b'
    const messages = [
        {
            role: 'system',
            content: hasSelection
                ? 'You are a careful Markdown editing assistant. Rewrite only the selected text according to the user requirements. Use the surrounding text only as context. Return only the replacement text for the selection, with no markers, explanations, quotes, or unchanged surrounding text.'
                : mode === 'edit'
                ? 'You are a careful Markdown editing assistant. Apply the user requirements precisely, whether they request inserting a passage, editing part of the note, or refining the full note. Preserve all untouched content, facts, links, Markdown structure, and the original language unless explicitly asked otherwise. Return the complete edited note, not a summary or patch. Output only the final Markdown with no explanations.'
                : 'You are a Markdown formatting assistant. Rewrite the full note into clean, readable Markdown. Preserve the original meaning and original language. Output only the final Markdown with no explanations.'
        },
        {
            role: 'user',
            content: hasSelection ? [
                'Task: replace the selected text only.',
                `User requirements: ${userInstruction}`,
                '',
                'Text before selection (context only):',
                normalizedText.slice(0, selectionStart),
                '',
                'Selected text to edit:',
                normalizedText.slice(selectionStart, selectionEnd),
                '',
                'Text after selection (context only):',
                normalizedText.slice(selectionEnd),
            ].join('\n') : [
                mode === 'edit' ? 'Task: edit this full note.' : 'Task: format this full note.',
                userInstruction ? `User requirements: ${userInstruction}` : 'User requirements: add headings, improve structure, clean paragraphs, and use lists when helpful.',
                '',
                'Full note:',
                normalizedText,
            ].join('\n')
        }
    ]

    console.log('[AI] Calling model:', model)
    console.log('[AI] Input text length:', normalizedText.length)

    try {
        const aiResponse = await runAiWithTimeout(env.AI, model, {
            messages,
            reasoning_effort: 'low',
            max_completion_tokens: 8192,
        }, 120000)
        console.log('[AI] Response type:', typeof aiResponse)
        console.log('[AI] Response keys:', aiResponse ? Object.keys(aiResponse) : 'null')
        console.log('[AI] Response preview:', JSON.stringify(aiResponse).substring(0, 500))
        const resultText = extractAiText(aiResponse)
        if (resultText) {
            return returnJSON(0, { result: resultText, scope: hasSelection ? 'selection' : 'document', modelUsed: model })
        }
        return returnJSON(50003, `Workers AI returned an empty response for model ${model}`)
    } catch (error) {
        console.error(`[AI] Workers AI model ${model} failed:`, error)
        console.error(`[AI] Error name:`, error.name)
        console.error(`[AI] Error message:`, error.message)
        console.error(`[AI] Error stack:`, error.stack)
        return returnJSON(50003, `Workers AI model ${model} failed: ${error.message}`)
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

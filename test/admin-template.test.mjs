import test from 'node:test'
import assert from 'node:assert/strict'
import { Admin } from '../src/templates/admin.js'

test('admin dashboard renders summary, filters, version counts, and pagination', () => {
    const html = Admin({
        lang: 'zh-TW',
        adminPath: '/admin333',
        notes: [{
            path: 'alpha',
            title: 'Alpha launch',
            updatedAt: 1710000000,
            views: 4,
            versionCount: 3,
            shared: true,
            hasEditLock: true,
            hasViewLock: false,
        }],
        stats: { total: 42, shared: 21, protected: 8, indexed: 13, views: 120, versions: 77 },
        pagination: { page: 2, pageSize: 25, totalItems: 42, totalPages: 2 },
        filters: {
            page: 2,
            pageSize: 25,
            sort: 'updatedAt',
            direction: 'desc',
            title: 'alpha',
            text: '',
            from: '2026-01-01',
            to: '2026-07-13',
        },
        historyEnabled: true,
        contentScanned: true,
    })

    assert.match(html, /URL 總數/)
    assert.match(html, /Sitemap/)
    assert.match(html, /42/)
    assert.match(html, /name="title" value="alpha"/)
    assert.match(html, /已掃描文章內容/)
    assert.match(html, /版本/)
    assert.match(html, /class="sort-link active"[^>]*href="\/admin333\?page=1&amp;pageSize=25&amp;sort=updatedAt&amp;dir=asc/)
    assert.match(html, /class="sort-link"[^>]*href="\/admin333\?page=1&amp;pageSize=25&amp;sort=versionCount&amp;dir=asc/)
    assert.match(html, /第 2 \/ 2 頁/)
    assert.match(html, /admin333\?page=1&amp;pageSize=25/)
})

test('admin dashboard escapes untrusted titles and paths', () => {
    const html = Admin({
        lang: 'en-US',
        adminPath: '/admin333',
        notes: [{
            path: 'safe-path',
            title: '<script>alert(1)</script>',
            updatedAt: 0,
            views: 0,
            versionCount: 0,
            shared: false,
            hasEditLock: false,
            hasViewLock: false,
        }],
        stats: { total: 1, shared: 0, protected: 0, views: 0, versions: 0 },
        pagination: { page: 1, pageSize: 25, totalItems: 1, totalPages: 1 },
        filters: { page: 1, pageSize: 25, sort: 'updatedAt', direction: 'desc', title: '', text: '', from: '', to: '' },
        historyEnabled: false,
    })

    assert.doesNotMatch(html, /<script>alert\(1\)<\/script>/)
    assert.match(html, /&lt;script&gt;alert\(1\)&lt;\/script&gt;/)
})

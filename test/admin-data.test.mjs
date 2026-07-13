import test from 'node:test'
import assert from 'node:assert/strict'
import {
    filterAdminNotes,
    normalizeAdminQuery,
    paginateAdminNotes,
    sortAdminNotes,
    summarizeAdminNotes,
} from '../src/admin_data.mjs'

const notes = [
    {
        path: 'alpha',
        title: 'Alpha Launch Plan',
        content: 'Release checklist and customer rollout.',
        updatedAt: 200,
        views: 4,
        versionCount: 3,
        shared: true,
        indexed: true,
        protected: false,
    },
    {
        path: 'beta',
        title: 'Beta Notes',
        content: 'A private research memo about charts.',
        updatedAt: 100,
        views: 0,
        versionCount: 1,
        shared: false,
        indexed: false,
        protected: true,
    },
    {
        path: 'gamma',
        title: 'Gamma Archive',
        content: 'Old launch material.',
        updatedAt: 300,
        views: 8,
        versionCount: 0,
        shared: true,
        indexed: true,
        protected: true,
    },
]

test('normalizes admin query parameters with safe pagination defaults', () => {
    assert.deepEqual(normalizeAdminQuery(new URLSearchParams('page=0&pageSize=999&sort=unknown&dir=up')), {
        page: 1,
        pageSize: 100,
        sort: 'updatedAt',
        direction: 'desc',
        title: '',
        text: '',
        from: '',
        to: '',
    })
})

test('filters title, full text, and modified date ranges', () => {
    assert.deepEqual(filterAdminNotes(notes, normalizeAdminQuery(new URLSearchParams('title=beta'))).map(note => note.path), ['beta'])
    assert.deepEqual(filterAdminNotes(notes, normalizeAdminQuery(new URLSearchParams('text=charts'))).map(note => note.path), ['beta'])
    assert.deepEqual(filterAdminNotes(notes, normalizeAdminQuery(new URLSearchParams('from=1970-01-01&to=1970-01-01'))).map(note => note.path), ['alpha', 'beta', 'gamma'])
})

test('sorts and paginates notes deterministically', () => {
    const sorted = sortAdminNotes(notes, { sort: 'updatedAt', direction: 'desc' })
    assert.deepEqual(sorted.map(note => note.path), ['gamma', 'alpha', 'beta'])

    const page = paginateAdminNotes(sorted, 2, 2)
    assert.deepEqual(page.items.map(note => note.path), ['beta'])
    assert.equal(page.totalItems, 3)
    assert.equal(page.totalPages, 2)
    assert.equal(page.page, 2)
})

test('summarizes URL, share, protection, views, and history counts', () => {
    assert.deepEqual(summarizeAdminNotes(notes), {
        total: 3,
        shared: 2,
        protected: 2,
        indexed: 2,
        views: 12,
        versions: 4,
    })
})

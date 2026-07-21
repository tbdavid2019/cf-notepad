import test from 'node:test'
import assert from 'node:assert/strict'
import { getWebtalkConfig } from '../src/constant.js'

const WEBTALK_VARS = [
    'SCN_ENABLE_WEBTALK',
    'SCN_WEBTALK_SCRIPT_URL',
    'SCN_WEBTALK_SCOPE',
    'SCN_WEBTALK_SITE_ID',
    'SCN_WEBTALK_AI_ENDPOINT',
]

test('enables Webtalk only when explicitly configured and exposes customizable widget settings', () => {
    const previous = Object.fromEntries(WEBTALK_VARS.map(name => [name, globalThis[name]]))

    Object.assign(globalThis, {
        SCN_ENABLE_WEBTALK: '1',
        SCN_WEBTALK_SCRIPT_URL: 'https://chat.example.com/widget.js',
        SCN_WEBTALK_SCOPE: 'article',
        SCN_WEBTALK_SITE_ID: 'wiki-staging',
        SCN_WEBTALK_AI_ENDPOINT: 'https://chat.example.com/api/ask',
    })

    try {
        assert.deepEqual(getWebtalkConfig(), {
            enabled: true,
            scriptUrl: 'https://chat.example.com/widget.js',
            scope: 'article',
            siteId: 'wiki-staging',
            aiEndpoint: 'https://chat.example.com/api/ask',
        })
    } finally {
        for (const name of WEBTALK_VARS) {
            if (previous[name] === undefined) delete globalThis[name]
            else globalThis[name] = previous[name]
        }
    }
})

test('keeps Webtalk disabled by default and rejects unsafe widget URLs', () => {
    const previous = Object.fromEntries(WEBTALK_VARS.map(name => [name, globalThis[name]]))

    Object.assign(globalThis, {
        SCN_ENABLE_WEBTALK: '1',
        SCN_WEBTALK_SCRIPT_URL: 'javascript:alert(1)',
        SCN_WEBTALK_AI_ENDPOINT: 'data:text/plain,invalid',
    })

    try {
        assert.deepEqual(getWebtalkConfig(), { enabled: false })
    } finally {
        for (const name of WEBTALK_VARS) {
            if (previous[name] === undefined) delete globalThis[name]
            else globalThis[name] = previous[name]
        }
    }
})

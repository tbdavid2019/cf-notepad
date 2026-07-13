import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const constantSource = readFileSync(new URL('../src/constant.js', import.meta.url), 'utf8')
const indexSource = readFileSync(new URL('../src/index.js', import.meta.url), 'utf8')

test('admin path and password are resolved at request time', async () => {
    const previousPath = globalThis.SCN_ADMIN_PATH
    const previousPassword = globalThis.SCN_ADMIN_PW

    try {
        globalThis.SCN_ADMIN_PATH = '/admin333'
        globalThis.SCN_ADMIN_PW = 'test-admin-password'

        const { getAdminPath, getAdminPassword } = await import(`../src/constant.js?admin-runtime-test=${Date.now()}`)

        assert.equal(getAdminPath(), '/admin333')
        assert.equal(getAdminPassword(), 'test-admin-password')
    } finally {
        if (previousPath === undefined) delete globalThis.SCN_ADMIN_PATH
        else globalThis.SCN_ADMIN_PATH = previousPath

        if (previousPassword === undefined) delete globalThis.SCN_ADMIN_PW
        else globalThis.SCN_ADMIN_PW = previousPassword
    }
})

test('configured admin path is checked before the dynamic note route', () => {
    assert.match(indexSource, /const adminPath = getAdminPath\(\)/)
    assert.match(indexSource, /router\.all\('\*', async \(request\) => \{[\s\S]*?if \(requestPath !== adminPath\) return[\s\S]*?handleAdminGet\(request\)[\s\S]*?handleAdminPost\(request\)[\s\S]*?\}\)\n\nrouter\.get\('\/:path'/)
    assert.doesNotMatch(indexSource, /router\.get\(ADMIN_PATH/)
    assert.doesNotMatch(indexSource, /router\.post\(ADMIN_PATH/)
    assert.match(constantSource, /export const getAdminPath = \(\) => readRuntimeVar\('SCN_ADMIN_PATH'\)/)
    assert.match(constantSource, /export const getAdminPassword = \(\) => readRuntimeVar\('SCN_ADMIN_PW'\)/)
})

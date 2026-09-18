import test from 'node:test'
import assert from 'node:assert/strict'
import { parseRequestCookies, serializeResponseCookie } from '../src/cookie_compat.mjs'

test('cookie v2 parser preserves encoded request values and duplicate-name precedence', () => {
    const parsed = parseRequestCookies('session=abc%20123; theme=dark; session=second')
    assert.equal(parsed.session, 'abc 123')
    assert.equal(parsed.theme, 'dark')
})

test('cookie v2 serializer emits Worker-compatible Set-Cookie attributes', () => {
    const header = serializeResponseCookie('session', 'abc 123', {
        path: '/',
        httpOnly: true,
        secure: true,
        sameSite: 'lax',
        maxAge: 3600,
    })
    assert.match(header, /^session=abc%20123;/)
    assert.match(header, /Max-Age=3600/)
    assert.match(header, /Path=\//)
    assert.match(header, /HttpOnly/)
    assert.match(header, /Secure/)
    assert.match(header, /SameSite=Lax/)
})

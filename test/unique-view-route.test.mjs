import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const indexSource = readFileSync(new URL('../src/index.js', import.meta.url), 'utf8')
const schemaSource = readFileSync(new URL('../schema/note_stats.sql', import.meta.url), 'utf8')

test('view schema deduplicates a device per article', () => {
    assert.match(schemaSource, /CREATE TABLE IF NOT EXISTS note_view_devices/)
    assert.match(schemaSource, /PRIMARY KEY\s*\(path,\s*device_hash\)/i)
})

test('share views use an anonymous secure device cookie and unique D1 recording', () => {
    assert.match(indexSource, /resolveViewDeviceId\(cookie\.cn_device\)/)
    assert.match(indexSource, /hashViewDeviceId\(deviceId\)/)
    assert.match(indexSource, /recordUniqueNoteView/)
    assert.match(indexSource, /Cookies\.serialize\('cn_device'/)
    assert.match(indexSource, /httpOnly:\s*true/)
    assert.match(indexSource, /secure:\s*true/)
    assert.match(indexSource, /sameSite:\s*'lax'/)
})

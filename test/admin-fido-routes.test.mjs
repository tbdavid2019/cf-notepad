import test from 'node:test'
import assert from 'node:assert/strict'
import { generateChallenge, storeFidoChallenge, verifyAndConsumeFidoChallenge, getFidoCredentials, saveFidoCredential } from '../src/fido_auth.mjs'

test('FIDO Challenge generation and consumption lifecycle in memory KV', async () => {
    const memoryStore = new Map()
    const kv = {
        get: async (k) => memoryStore.get(k) || null,
        put: async (k, v) => memoryStore.set(k, v),
        delete: async (k) => memoryStore.delete(k)
    }

    const challenge = generateChallenge()
    assert.equal(typeof challenge, 'string')
    assert.ok(challenge.length >= 32)

    await storeFidoChallenge(kv, challenge, 'register', 60)
    
    // First consume should succeed
    const valid = await verifyAndConsumeFidoChallenge(kv, challenge, 'register')
    assert.equal(valid, true)

    // Replay attack prevention: second consume must fail
    const replayValid = await verifyAndConsumeFidoChallenge(kv, challenge, 'register')
    assert.equal(replayValid, false)
})

test('FIDO Credential storage and management in memory KV', async () => {
    const memoryStore = new Map()
    const kv = {
        get: async (k) => memoryStore.get(k) || null,
        put: async (k, v) => memoryStore.set(k, v),
        delete: async (k) => memoryStore.delete(k)
    }

    const initialList = await getFidoCredentials(kv)
    assert.deepEqual(initialList, [])

    const cred = {
        id: 'test-cred-id',
        publicKeyRaw: 'MFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAE...',
        name: 'MacBook Pro Touch ID',
        createdAt: Date.now()
    }

    const updated = await saveFidoCredential(kv, cred)
    assert.equal(updated.length, 1)
    assert.equal(updated[0].id, 'test-cred-id')
    assert.equal(updated[0].name, 'MacBook Pro Touch ID')
})

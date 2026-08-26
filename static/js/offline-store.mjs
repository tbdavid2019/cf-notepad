/**
 * Offline Store for Cloud Notepad (david888 wiki)
 * Hybrid Storage:
 *  - Metadata in LocalStorage (Fast synchronous lookup)
 *  - Full Content in IndexedDB (Large capacity, async)
 *  - In-Memory Fallback when IndexedDB is unavailable
 */

const DB_NAME = 'CloudNotepadOfflineDB'
const DB_VERSION = 2
const STORE_NAME = 'notes'
const AUDIO_STORE_NAME = 'audios'
const META_KEY = 'cf-notepad:notes-metadata'

class OfflineNoteStore {
    constructor() {
        this.db = null
        this.memoryFallback = new Map()
        this.isIndexedDBSupported = typeof indexedDB !== 'undefined'
        this.initPromise = null
    }

    async init() {
        if (!this.initPromise) {
            this.initPromise = this._openDB()
        }
        return this.initPromise
    }

    _openDB() {
        return new Promise((resolve) => {
            if (!this.isIndexedDBSupported) {
                resolve(null)
                return
            }
            try {
                const req = indexedDB.open(DB_NAME, DB_VERSION)
                req.onupgradeneeded = (e) => {
                    const db = e.target.result
                    if (!db.objectStoreNames.contains(STORE_NAME)) {
                        db.createObjectStore(STORE_NAME, { keyPath: 'path' })
                    }
                    if (!db.objectStoreNames.contains(AUDIO_STORE_NAME)) {
                        db.createObjectStore(AUDIO_STORE_NAME, { keyPath: 'id' })
                    }
                }
                req.onsuccess = (e) => {
                    this.db = e.target.result
                    resolve(this.db)
                }
                req.onerror = () => {
                    this.db = null
                    resolve(null)
                }
            } catch (err) {
                this.db = null
                resolve(null)
            }
        })
    }

    getMetadataMap() {
        try {
            if (typeof localStorage === 'undefined') return {}
            const raw = localStorage.getItem(META_KEY)
            return raw ? JSON.parse(raw) : {}
        } catch {
            return {}
        }
    }

    saveMetadata(path, meta) {
        try {
            if (typeof localStorage === 'undefined') return
            const allMeta = this.getMetadataMap()
            allMeta[path] = {
                path,
                title: meta.title || path,
                updatedAt: meta.updatedAt || Date.now(),
                size: typeof meta.size === 'number' ? meta.size : (meta.content ? meta.content.length : 0),
                theme: meta.theme || 'default',
                syncStatus: meta.syncStatus || 'synced',
                format: meta.format || 'markdown',
            }
            localStorage.setItem(META_KEY, JSON.stringify(allMeta))
        } catch (e) {
            // Storage quota exceeded or blocked
        }
    }

    removeMetadata(path) {
        try {
            if (typeof localStorage === 'undefined') return
            const allMeta = this.getMetadataMap()
            delete allMeta[path]
            localStorage.setItem(META_KEY, JSON.stringify(allMeta))
        } catch {}
    }

    async saveNote(path, { title = '', content = '', theme = 'default', format = 'markdown', syncStatus = 'synced' } = {}) {
        await this.init()
        const noteData = {
            path,
            title: title || path,
            content: content || '',
            theme,
            format,
            syncStatus,
            updatedAt: Date.now(),
            size: (content || '').length
        }

        // 1. Save metadata to LocalStorage
        this.saveMetadata(path, noteData)

        // 2. Save full content to IndexedDB (or fallback to Memory)
        if (this.db) {
            return new Promise((resolve) => {
                try {
                    const tx = this.db.transaction(STORE_NAME, 'readwrite')
                    const store = tx.objectStore(STORE_NAME)
                    const req = store.put(noteData)
                    req.onsuccess = () => {
                        this.registerBackgroundSyncIfPending(noteData.syncStatus)
                        resolve(true)
                    }
                    req.onerror = () => {
                        this.memoryFallback.set(path, noteData)
                        resolve(true)
                    }
                } catch {
                    this.memoryFallback.set(path, noteData)
                    resolve(true)
                }
            })
        } else {
            this.memoryFallback.set(path, noteData)
            return true
        }
    }

    registerBackgroundSyncIfPending(syncStatus) {
        if (syncStatus === 'pending' && typeof navigator !== 'undefined' && 'serviceWorker' in navigator) {
            navigator.serviceWorker.ready.then(reg => {
                if (reg && 'sync' in reg) {
                    reg.sync.register('sync-pending-notes').catch(() => {})
                }
            }).catch(() => {})
        }
    }

    async getNote(path) {
        await this.init()
        if (this.db) {
            return new Promise((resolve) => {
                try {
                    const tx = this.db.transaction(STORE_NAME, 'readonly')
                    const store = tx.objectStore(STORE_NAME)
                    const req = store.get(path)
                    req.onsuccess = () => {
                        if (req.result) {
                            resolve(req.result)
                        } else {
                            resolve(this.memoryFallback.get(path) || null)
                        }
                    }
                    req.onerror = () => {
                        resolve(this.memoryFallback.get(path) || null)
                    }
                } catch {
                    resolve(this.memoryFallback.get(path) || null)
                }
            })
        }
        return this.memoryFallback.get(path) || null
    }

    async updateSyncStatus(path, syncStatus = 'synced') {
        await this.init()
        const meta = this.getMetadataMap()[path]
        if (meta) {
            meta.syncStatus = syncStatus
            this.saveMetadata(path, meta)
        }
        if (this.db) {
            try {
                const note = await this.getNote(path)
                if (note) {
                    note.syncStatus = syncStatus
                    const tx = this.db.transaction(STORE_NAME, 'readwrite')
                    tx.objectStore(STORE_NAME).put(note)
                }
            } catch {}
        }
    }

    async deleteNote(path) {
        await this.init()
        this.removeMetadata(path)
        this.memoryFallback.delete(path)
        if (this.db) {
            return new Promise((resolve) => {
                try {
                    const tx = this.db.transaction(STORE_NAME, 'readwrite')
                    const store = tx.objectStore(STORE_NAME)
                    const req = store.delete(path)
                    req.onsuccess = () => resolve(true)
                    req.onerror = () => resolve(false)
                } catch {
                    resolve(false)
                }
            })
        }
        return true
    }

    async getAllNotes() {
        await this.init()
        if (this.memoryFallback.size > 0 && !this.db) {
            return Array.from(this.memoryFallback.values()).sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0))
        }

        if (this.db) {
            return new Promise((resolve) => {
                try {
                    const tx = this.db.transaction([STORE_NAME], 'readonly')
                    const store = tx.objectStore(STORE_NAME)
                    if (typeof store.getAll === 'function') {
                        const req = store.getAll()
                        req.onsuccess = () => {
                            const notes = (req.result || []).sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0))
                            resolve(notes)
                        }
                        req.onerror = () => resolve(this._fallbackGetAllFromMeta())
                    } else {
                        const notes = []
                        const req = store.openCursor()
                        req.onsuccess = (e) => {
                            const cursor = e.target.result
                            if (cursor) {
                                notes.push(cursor.value)
                                cursor.continue()
                            } else {
                                notes.sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0))
                                resolve(notes)
                            }
                        }
                        req.onerror = () => resolve(this._fallbackGetAllFromMeta())
                    }
                } catch {
                    resolve(this._fallbackGetAllFromMeta())
                }
            })
        }

        return this._fallbackGetAllFromMeta()
    }

    async _fallbackGetAllFromMeta() {
        const metaList = this.getAllNotesMetadata()
        const notes = []
        for (const meta of metaList) {
            const note = await this.getNote(meta.path)
            if (note) notes.push(note)
            else notes.push({ ...meta, content: '' })
        }
        return notes
    }

    async getPendingSyncNotes() {
        const notes = await this.getAllNotes()
        return notes.filter(note => note.syncStatus === 'pending')
    }

    async searchNotes(query = '') {
        const q = String(query || '').trim().toLowerCase()
        if (!q) return this.getAllNotesMetadata()

        const all = await this.getAllNotes()
        return all
            .filter(n =>
                (n.title && n.title.toLowerCase().includes(q)) ||
                (n.path && n.path.toLowerCase().includes(q)) ||
                (n.content && n.content.toLowerCase().includes(q))
            )
            .map(n => ({
                path: n.path,
                title: n.title || n.path,
                updatedAt: n.updatedAt,
                size: n.size || (n.content ? n.content.length : 0),
                theme: n.theme || 'default',
                syncStatus: n.syncStatus || 'synced',
                format: n.format || 'markdown',
            }))
    }

    async clearAllNotes() {
        await this.init()
        try {
            if (typeof localStorage !== 'undefined') {
                localStorage.removeItem(META_KEY)
            }
        } catch {}
        this.memoryFallback.clear()
        if (this.db) {
            return new Promise((resolve) => {
                try {
                    const tx = this.db.transaction(STORE_NAME, 'readwrite')
                    const store = tx.objectStore(STORE_NAME)
                    const req = store.clear()
                    req.onsuccess = () => resolve(true)
                    req.onerror = () => resolve(false)
                } catch {
                    resolve(false)
                }
            })
        }
        return true
    }

    async exportBackupJson() {
        const notes = await this.getAllNotes()
        return JSON.stringify({
            version: 1,
            exportedAt: Date.now(),
            notes,
        }, null, 2)
    }

    async importBackupJson(jsonStr) {
        try {
            const parsed = typeof jsonStr === 'string' ? JSON.parse(jsonStr) : jsonStr
            const notes = Array.isArray(parsed?.notes) ? parsed.notes : (Array.isArray(parsed) ? parsed : [])
            let importedCount = 0
            for (const note of notes) {
                if (note && note.path) {
                    await this.saveNote(note.path, {
                        title: note.title || note.path,
                        content: note.content || '',
                        theme: note.theme || 'default',
                        format: note.format || 'markdown',
                        syncStatus: note.syncStatus || 'synced',
                    })
                    importedCount++
                }
            }
            return { success: true, count: importedCount }
        } catch (err) {
            return { success: false, error: err.message }
        }
    }

    getAllNotesMetadata() {
        const metaMap = this.getMetadataMap()
        if (Object.keys(metaMap).length === 0 && this.memoryFallback.size > 0) {
            return Array.from(this.memoryFallback.values()).map(n => ({
                path: n.path,
                title: n.title || n.path,
                updatedAt: n.updatedAt || Date.now(),
                size: n.size || (n.content ? n.content.length : 0),
                theme: n.theme || 'default',
                syncStatus: n.syncStatus || 'synced',
                format: n.format || 'markdown',
            })).sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0))
        }
        return Object.values(metaMap).sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0))
    }

    async saveOfflineAudio(id, { blob, name = '', type = 'audio/webm', notePath = '', syncStatus = 'pending' } = {}) {
        await this.init()
        const audioRecord = {
            id,
            blob,
            name: name || ('recording-' + Date.now() + '.webm'),
            type: type || 'audio/webm',
            notePath: notePath || '',
            syncStatus: syncStatus || 'pending',
            createdAt: Date.now(),
            size: blob?.size || 0
        }
        if (this.db) {
            return new Promise((resolve) => {
                try {
                    const tx = this.db.transaction(AUDIO_STORE_NAME, 'readwrite')
                    const store = tx.objectStore(AUDIO_STORE_NAME)
                    const req = store.put(audioRecord)
                    req.onsuccess = () => resolve(true)
                    req.onerror = () => {
                        this.memoryFallback.set('audio:' + id, audioRecord)
                        resolve(true)
                    }
                } catch {
                    this.memoryFallback.set('audio:' + id, audioRecord)
                    resolve(true)
                }
            })
        } else {
            this.memoryFallback.set('audio:' + id, audioRecord)
            return true
        }
    }

    async getOfflineAudio(id) {
        await this.init()
        if (this.db) {
            return new Promise((resolve) => {
                try {
                    const tx = this.db.transaction(AUDIO_STORE_NAME, 'readonly')
                    const store = tx.objectStore(AUDIO_STORE_NAME)
                    const req = store.get(id)
                    req.onsuccess = () => resolve(req.result || this.memoryFallback.get('audio:' + id) || null)
                    req.onerror = () => resolve(this.memoryFallback.get('audio:' + id) || null)
                } catch {
                    resolve(this.memoryFallback.get('audio:' + id) || null)
                }
            })
        }
        return this.memoryFallback.get('audio:' + id) || null
    }

    async getPendingOfflineAudios(notePath = null, targetStatus = null) {
        await this.init()
        const isTarget = (itemStatus) => {
            if (targetStatus === 'pending') return itemStatus === 'pending'
            if (targetStatus === 'transcribed') return itemStatus === 'transcribed'
            if (targetStatus) return itemStatus === targetStatus
            return itemStatus !== 'synced'
        }
        if (this.db) {
            return new Promise((resolve) => {
                try {
                    const tx = this.db.transaction(AUDIO_STORE_NAME, 'readonly')
                    const store = tx.objectStore(AUDIO_STORE_NAME)
                    if (typeof store.getAll === 'function') {
                        const req = store.getAll()
                        req.onsuccess = () => {
                            let items = (req.result || []).filter(item => isTarget(item.syncStatus))
                            if (notePath) items = items.filter(item => !item.notePath || item.notePath === notePath)
                            resolve(items)
                        }
                        req.onerror = () => resolve([])
                    } else {
                        const items = []
                        const req = store.openCursor()
                        req.onsuccess = (e) => {
                            const cursor = e.target.result
                            if (cursor) {
                                if (isTarget(cursor.value?.syncStatus) && (!notePath || !cursor.value.notePath || cursor.value.notePath === notePath)) {
                                    items.push(cursor.value)
                                }
                                cursor.continue()
                            } else {
                                resolve(items)
                            }
                        }
                        req.onerror = () => resolve([])
                    }
                } catch {
                    resolve([])
                }
            })
        }
        return Array.from(this.memoryFallback.entries())
            .filter(([k, v]) => k.startsWith('audio:') && isTarget(v.syncStatus) && (!notePath || !v.notePath || v.notePath === notePath))
            .map(([, v]) => v)
    }

    async updateOfflineAudioStatus(id, syncStatus = 'synced', permanentUrl = '') {
        await this.init()
        if (this.db) {
            try {
                const item = await this.getOfflineAudio(id)
                if (item) {
                    item.syncStatus = syncStatus
                    if (permanentUrl) item.permanentUrl = permanentUrl
                    const tx = this.db.transaction(AUDIO_STORE_NAME, 'readwrite')
                    tx.objectStore(AUDIO_STORE_NAME).put(item)
                }
            } catch {}
        }
        const mem = this.memoryFallback.get('audio:' + id)
        if (mem) {
            mem.syncStatus = syncStatus
            if (permanentUrl) mem.permanentUrl = permanentUrl
        }
    }

    async deleteOfflineAudio(id) {
        await this.init()
        this.memoryFallback.delete('audio:' + id)
        if (this.db) {
            return new Promise((resolve) => {
                try {
                    const tx = this.db.transaction(AUDIO_STORE_NAME, 'readwrite')
                    const store = tx.objectStore(AUDIO_STORE_NAME)
                    const req = store.delete(id)
                    req.onsuccess = () => resolve(true)
                    req.onerror = () => resolve(false)
                } catch {
                    resolve(false)
                }
            })
        }
        return true
    }
}

export const offlineStore = new OfflineNoteStore()

/**
 * Export content to a local .md file download
 */
export function exportMarkdownFile(filename = 'note.md', content = '') {
    const cleanName = filename.endsWith('.md') ? filename : `${filename}.md`
    const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = cleanName
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
}

/**
 * Open a local Markdown file from disk
 */
export async function openLocalMarkdownFile() {
    if (typeof window.showOpenFilePicker === 'function') {
        try {
            const [fileHandle] = await window.showOpenFilePicker({
                types: [
                    {
                        description: 'Markdown Files',
                        accept: {
                            'text/markdown': ['.md', '.markdown'],
                            'text/plain': ['.txt']
                        }
                    }
                ],
                multiple: false
            })
            const file = await fileHandle.getFile()
            const text = await file.text()
            return { name: file.name, text }
        } catch (err) {
            if (err.name === 'AbortError') return null
            // Fall through to file input fallback
        }
    }

    return new Promise((resolve) => {
        const input = document.createElement('input')
        input.type = 'file'
        input.accept = '.md,.markdown,.txt'
        input.style.display = 'none'
        input.onchange = async () => {
            if (input.files && input.files[0]) {
                const file = input.files[0]
                const text = await file.text()
                resolve({ name: file.name, text })
            } else {
                resolve(null)
            }
            input.remove()
        }
        document.body.appendChild(input)
        input.click()
    })
}

if (typeof window !== 'undefined') {
    window.offlineStore = offlineStore
    window.exportMarkdownFile = exportMarkdownFile
    window.openLocalMarkdownFile = openLocalMarkdownFile
}



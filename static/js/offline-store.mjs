/**
 * Offline Store for Cloud Notepad (david888 wiki)
 * Hybrid Storage:
 *  - Metadata in LocalStorage (Fast synchronous lookup)
 *  - Full Content in IndexedDB (Large capacity, async)
 *  - In-Memory Fallback when IndexedDB is unavailable
 */

const DB_NAME = 'CloudNotepadOfflineDB'
const DB_VERSION = 1
const STORE_NAME = 'notes'
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
                    req.onsuccess = () => resolve(true)
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

    getAllNotesMetadata() {
        const metaMap = this.getMetadataMap()
        return Object.values(metaMap).sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0))
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



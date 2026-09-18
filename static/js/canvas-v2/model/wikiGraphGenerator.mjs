function stableHash(value) {
    let hash = 2166136261
    for (const char of String(value)) {
        hash ^= char.charCodeAt(0)
        hash = Math.imul(hash, 16777619)
    }
    return (hash >>> 0).toString(36)
}

function cleanWikiPath(value) {
    return String(value || '')
        .trim()
        .replace(/^\/+/, '')
        .replace(/\.md$/i, '')
}

export function extractWikiLinks(markdown) {
    const links = []
    const seen = new Set()
    const pattern = /\[\[([^|\]#]+)(?:#[^|\]]+)?(?:\|([^\]]+))?\]\]/g
    let match
    while ((match = pattern.exec(String(markdown || '')))) {
        const path = cleanWikiPath(match[1])
        if (!path || seen.has(path)) continue
        seen.add(path)
        links.push({ path, label: String(match[2] || path).trim() })
    }
    return links
}

function getMarkdownTitle(markdown, fallback) {
    const heading = String(markdown || '').match(/^#\s+(.+)$/m)
    return heading?.[1]?.trim() || fallback
}

export function buildWikiLinkCanvas({ sourcePath, markdown }) {
    const rootPath = cleanWikiPath(sourcePath)
    const links = extractWikiLinks(markdown).filter(link => link.path !== rootPath)
    const rootId = `wiki-${stableHash(rootPath || 'root')}`
    const nodes = [{
        id: rootId,
        type: 'file',
        x: 0,
        y: 0,
        width: 300,
        height: 150,
        file: rootPath,
        text: getMarkdownTitle(markdown, rootPath || 'Source note'),
        david888: { nodeType: 'note', graphPath: rootPath, graphRoot: true },
    }]
    const edges = []
    const radius = Math.max(320, links.length * 42)

    links.forEach((link, index) => {
        const angle = (Math.PI * 2 * index) / Math.max(links.length, 1) - Math.PI / 2
        const id = `wiki-${stableHash(link.path)}`
        nodes.push({
            id,
            type: 'file',
            x: Math.round(Math.cos(angle) * radius + 150),
            y: Math.round(Math.sin(angle) * radius + 100),
            width: 280,
            height: 140,
            file: link.path,
            text: link.label,
            david888: { nodeType: 'note', graphPath: link.path },
        })
        edges.push({
            id: `edge-${stableHash(`${rootPath}->${link.path}`)}`,
            fromNode: rootId,
            toNode: id,
            fromSide: 'right',
            toSide: 'left',
            toEnd: 'arrow',
            label: 'WikiLink',
        })
    })

    return { nodes, edges }
}

export async function fetchMarkdownForWikiGraph(path) {
    const normalized = cleanWikiPath(path)
    if (!normalized) throw new Error('A Markdown note path is required')
    const response = await fetch(`/api/${encodeURIComponent(normalized)}`, {
        headers: { Accept: 'text/markdown' },
    })
    if (!response.ok) throw new Error(`Unable to read Markdown note (${response.status})`)
    return { path: normalized, markdown: await response.text() }
}

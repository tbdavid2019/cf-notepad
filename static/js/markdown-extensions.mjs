const HACKMD_IMAGE_SIZE = /!\[([^\]\n]*)\]\(([^)\s]+)\s+=(\d{0,5})x(\d{0,5})\)/g
const COLUMN_LAYOUT_SELECTOR = '.two-column-layout, .three-column-layout'

const escapeAttribute = value => String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')

const validDimension = value => {
    if (!value) return ''
    const number = Number(value)
    return Number.isInteger(number) && number > 0 && number <= 10000
        ? String(number)
        : ''
}

const expandImageSizesOnLine = line => line.replace(
    HACKMD_IMAGE_SIZE,
    (match, alt, url, rawWidth, rawHeight) => {
        const width = validDimension(rawWidth)
        const height = validDimension(rawHeight)
        if ((!width && rawWidth) || (!height && rawHeight) || (!width && !height)) return match

        const attributes = [
            `src="${escapeAttribute(url)}"`,
            `alt="${escapeAttribute(alt)}"`,
            width ? `width="${width}"` : '',
            height ? `height="${height}"` : '',
        ].filter(Boolean)
        return `<img ${attributes.join(' ')}>`
    },
)

const expandImageSizesOutsideInlineCode = line => {
    const codeSpan = /(`+)(.*?)\1/g
    let cursor = 0
    let output = ''
    let match

    while ((match = codeSpan.exec(line)) !== null) {
        output += expandImageSizesOnLine(line.slice(cursor, match.index))
        output += match[0]
        cursor = match.index + match[0].length
    }
    return output + expandImageSizesOnLine(line.slice(cursor))
}

export function expandHackmdImageSizes(markdown = '') {
    let fence = ''
    return String(markdown).split('\n').map(line => {
        const fenceMatch = line.match(/^\s*(`{3,}|~{3,})/)
        if (fenceMatch) {
            const marker = fenceMatch[1][0]
            if (!fence) fence = marker
            else if (fence === marker) fence = ''
            return line
        }
        return fence ? line : expandImageSizesOutsideInlineCode(line)
    }).join('\n')
}

const isHeading = node => node?.nodeType === 1 && /^H[1-6]$/.test(node.tagName)
const hasMeaningfulContent = node => node?.nodeType === 1 || String(node?.textContent || '').trim()

export function decorateColumnLayouts(root) {
    if (!root?.querySelectorAll) return 0
    let decorated = 0

    root.querySelectorAll(COLUMN_LAYOUT_SELECTOR).forEach(layout => {
        if (layout.dataset.columnLayoutReady === 'true') return

        const nodes = Array.from(layout.childNodes)
        const headingLevels = nodes
            .filter(isHeading)
            .map(node => Number(node.tagName.slice(1)))
        const sectionHeadingLevel = headingLevels.length ? Math.min(...headingLevels) : null
        const sections = []
        let section = null
        const startSection = () => {
            section = layout.ownerDocument.createElement('section')
            section.className = 'column-layout-item'
            sections.push(section)
        }

        nodes.forEach(node => {
            if (
                isHeading(node)
                && Number(node.tagName.slice(1)) === sectionHeadingLevel
                && section
                && Array.from(section.childNodes).some(hasMeaningfulContent)
            ) {
                startSection()
            } else if (!section) {
                startSection()
            }
            section.append(node)
        })

        layout.replaceChildren(...sections.filter(item =>
            Array.from(item.childNodes).some(hasMeaningfulContent)
        ))
        layout.dataset.columnLayoutReady = 'true'
        decorated += 1
    })

    return decorated
}

const PANDOC_CITATION_REGEX = /\[((?:-?@[a-zA-Z0-9_\-]+(?:\s*,\s*[^;\]]+)?)(?:\s*;\s*-?@[a-zA-Z0-9_\-]+(?:\s*,\s*[^;\]]+)?)*)\]/g

const renderPandocCitationItem = rawItem => {
    const trimmed = String(rawItem || '').trim()
    const match = trimmed.match(/^(-)?@([a-zA-Z0-9_\-]+)(?:,\s*(.+))?$/)
    if (!match) return escapeAttribute(trimmed)
    const suppressAuthor = match[1] === '-'
    const key = match[2]
    const locator = match[3] ? match[3].trim() : ''
    const displayText = (suppressAuthor ? '-@' : '@') + key + (locator ? (', ' + locator) : '')
    const locatorAttr = locator ? ` data-locator="${escapeAttribute(locator)}"` : ''
    const suppressAttr = suppressAuthor ? ' data-suppress-author="true"' : ''
    return `<a href="#fn-${escapeAttribute(key)}" class="citation-ref" data-citation-key="${escapeAttribute(key)}"${locatorAttr}${suppressAttr} title="Citation: ${escapeAttribute(displayText)}">${escapeAttribute(displayText)}</a>`
}

const expandPandocCitationsOnLine = line => {
    let result = line.replace(PANDOC_CITATION_REGEX, (match, inner) => {
        const items = inner.split(/\s*;\s*/)
        if (items.length === 1) {
            const itemHtml = renderPandocCitationItem(items[0])
            return `<cite class="pandoc-citation">[${itemHtml}]</cite>`
        }
        const itemsHtml = items.map(renderPandocCitationItem).join('; ')
        return `<cite class="pandoc-citation">[${itemsHtml}]</cite>`
    })

    // In-text citation: @key [p. 42]
    result = result.replace(/(^|[\s([{\'"«“‘])@([a-zA-Z0-9_\-]+)\s*\[([^\]]+)\]/g, (match, prefix, key, locator) => {
        const displayText = '@' + key
        const locatorText = locator.trim()
        const link = `<a href="#fn-${escapeAttribute(key)}" class="citation-ref" data-citation-key="${escapeAttribute(key)}" data-locator="${escapeAttribute(locatorText)}" title="Citation: @${escapeAttribute(key)} [${escapeAttribute(locatorText)}]">${escapeAttribute(displayText)}</a>`
        return `${prefix}<cite class="pandoc-citation in-text">${link} [${escapeAttribute(locatorText)}]</cite>`
    })

    return result
}

const expandPandocCitationsOutsideInlineCode = line => {
    const codeSpan = /(`+)(.*?)\1/g
    let cursor = 0
    let output = ''
    let match

    while ((match = codeSpan.exec(line)) !== null) {
        output += expandPandocCitationsOnLine(line.slice(cursor, match.index))
        output += match[0]
        cursor = match.index + match[0].length
    }
    return output + expandPandocCitationsOnLine(line.slice(cursor))
}

export function expandPandocCitations(markdown = '') {
    let fence = ''
    return String(markdown).split('\n').map(line => {
        const fenceMatch = line.match(/^\s*(`{3,}|~{3,})/)
        if (fenceMatch) {
            const marker = fenceMatch[1][0]
            if (!fence) fence = marker
            else if (fence === marker) fence = ''
            return line
        }
        return fence ? line : expandPandocCitationsOutsideInlineCode(line)
    }).join('\n')
}

export function expandMarkdownExtensions(markdown = '') {
    return expandPandocCitations(expandHackmdImageSizes(markdown))
}

function findFootnoteContent(anchor, rootNode) {
    const href = anchor.getAttribute('href') || ''
    const rawTargetId = href.startsWith('#') ? href.slice(1) : ''
    const citationKey = anchor.getAttribute('data-citation-key') || ''
    const doc = rootNode?.ownerDocument || (typeof document !== 'undefined' ? document : null)
    if (!doc) return null

    const possibleIds = [
        rawTargetId,
        rawTargetId ? `user-content-${rawTargetId}` : '',
        rawTargetId ? rawTargetId.replace(/^user-content-/, '') : '',
        citationKey ? `fn-${citationKey}` : '',
        citationKey ? `user-content-fn-${citationKey}` : '',
        citationKey ? `ref-${citationKey}` : '',
        citationKey ? `user-content-ref-${citationKey}` : '',
    ].filter(Boolean)

    for (const id of possibleIds) {
        const escapedId = typeof CSS !== 'undefined' && CSS.escape ? CSS.escape(id) : id.replace(/"/g, '\\"')
        const el = doc.getElementById(id) || rootNode?.querySelector?.(`[id="${escapedId}"]`)
        if (el) {
            const clone = el.cloneNode(true)
            clone.querySelectorAll('.data-footnote-backref, .footnote-backref, a[href*="fnref"]').forEach(b => b.remove())
            return {
                title: anchor.textContent.trim() || `Footnote ${id}`,
                html: clone.innerHTML.trim() || clone.textContent.trim()
            }
        }
    }

    if (citationKey) {
        const codeBlocks = doc.querySelectorAll('pre code, .diagram-source')
        for (const block of codeBlocks) {
            const text = block.textContent || ''
            const bibRegex = new RegExp(`@([a-zA-Z]+)\\s*\\{\\s*${citationKey}\\s*,([\\s\\S]*?)\\n\\}`, 'i')
            const bibMatch = text.match(bibRegex)
            if (bibMatch) {
                const fieldsRaw = bibMatch[2]
                const getField = (name) => {
                    const m = fieldsRaw.match(new RegExp(`${name}\\s*=\\s*[{"]([^}"]+)[}"]`, 'i'))
                    return m ? m[1].trim() : ''
                }
                const author = getField('author')
                const title = getField('title')
                const year = getField('year')
                const journal = getField('journal') || getField('booktitle') || getField('publisher')
                const howpublished = getField('howpublished') || getField('url')
                const parts = [
                    author ? `<strong>${escapeAttribute(author)}</strong>` : '',
                    year ? `(${escapeAttribute(year)})` : '',
                    title ? `<em>${escapeAttribute(title)}</em>` : '',
                    journal ? `${escapeAttribute(journal)}.` : '',
                    howpublished ? `<span class="footnote-url">${escapeAttribute(howpublished.replace(/^\\url\{|\}$/g, ''))}</span>` : ''
                ].filter(Boolean)
                return {
                    title: `Citation: @${citationKey}`,
                    html: `<p>${parts.join(' ')}</p>`
                }
            }
        }

        const locator = anchor.getAttribute('data-locator')
        return {
            title: `Citation: @${citationKey}`,
            html: `<p class="footnote-placeholder">Academic Citation: <code>@${escapeAttribute(citationKey)}</code>${locator ? ` (${escapeAttribute(locator)})` : ''}</p>`
        }
    }

    return null
}

let activeHideTimer = null
let activeShowTimer = null

function ensureFootnotePopoverElement(doc) {
    let popover = doc.getElementById('footnote-popover')
    if (!popover) {
        popover = doc.createElement('div')
        popover.id = 'footnote-popover'
        popover.className = 'footnote-popover'
        popover.setAttribute('role', 'tooltip')
        popover.setAttribute('aria-hidden', 'true')
        popover.innerHTML = `
            <div class="footnote-popover-header">
                <span class="footnote-popover-badge">
                    <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                        <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z"></path>
                        <path d="M6 6h10"></path>
                        <path d="M6 10h10"></path>
                    </svg>
                    <span class="footnote-popover-title">Footnote</span>
                </span>
                <button type="button" class="footnote-popover-close" aria-label="Close">×</button>
            </div>
            <div class="footnote-popover-body"></div>
        `
        doc.body?.appendChild(popover)

        popover.addEventListener('mouseenter', () => {
            if (activeHideTimer) {
                clearTimeout(activeHideTimer)
                activeHideTimer = null
            }
        })
        popover.addEventListener('mouseleave', () => {
            hideFootnotePopover(popover)
        })
        popover.querySelector('.footnote-popover-close')?.addEventListener('click', (e) => {
            e.stopPropagation()
            hideFootnotePopover(popover, 0)
        })
    }
    return popover
}

function hideFootnotePopover(popover, delay = 220) {
    if (!popover) return
    if (activeHideTimer) clearTimeout(activeHideTimer)
    activeHideTimer = setTimeout(() => {
        popover.classList.remove('visible')
        popover.setAttribute('aria-hidden', 'true')
        activeHideTimer = null
    }, delay)
}

function showFootnotePopover(popover, anchor, rootNode) {
    if (!popover || !anchor) return
    if (activeHideTimer) {
        clearTimeout(activeHideTimer)
        activeHideTimer = null
    }

    const content = findFootnoteContent(anchor, rootNode)
    if (!content || !content.html) return

    const titleEl = popover.querySelector('.footnote-popover-title')
    const bodyEl = popover.querySelector('.footnote-popover-body')
    if (titleEl) titleEl.textContent = content.title || 'Footnote'
    if (bodyEl) bodyEl.innerHTML = content.html

    popover.style.display = 'block'
    popover.classList.add('visible')
    popover.removeAttribute('aria-hidden')

    if (typeof window !== 'undefined' && anchor.getBoundingClientRect) {
        const rect = anchor.getBoundingClientRect()
        const viewportWidth = window.innerWidth || 1024
        const viewportHeight = window.innerHeight || 768
        const popoverWidth = Math.min(380, viewportWidth - 32)
        popover.style.width = `${popoverWidth}px`

        const popoverRect = popover.getBoundingClientRect()
        const spaceAbove = rect.top
        const spaceBelow = viewportHeight - rect.bottom
        const showAbove = spaceAbove >= popoverRect.height + 12 || spaceAbove > spaceBelow

        const top = showAbove
            ? rect.top - popoverRect.height - 8
            : rect.bottom + 8

        let left = rect.left + rect.width / 2 - popoverWidth / 2
        left = Math.max(16, Math.min(left, viewportWidth - popoverWidth - 16))

        popover.style.top = `${Math.round(top)}px`
        popover.style.left = `${Math.round(left)}px`
    }
}

export function decorateFootnoteAndCitationPopovers(rootNode) {
    if (!rootNode?.querySelectorAll) return 0
    const doc = rootNode.ownerDocument || (typeof document !== 'undefined' ? document : null)
    if (!doc) return 0

    const popover = ensureFootnotePopoverElement(doc)
    const refSelector = '.footnote-ref a, [data-footnote-ref], .citation-ref, a[href^="#fn-"], a[href^="#user-content-fn-"]'
    const anchors = Array.from(rootNode.querySelectorAll(refSelector))
    let count = 0

    anchors.forEach(anchor => {
        if (anchor.dataset.popoverReady === 'true') return
        anchor.dataset.popoverReady = 'true'
        count++

        anchor.addEventListener('mouseenter', () => {
            if (activeShowTimer) clearTimeout(activeShowTimer)
            activeShowTimer = setTimeout(() => {
                showFootnotePopover(popover, anchor, rootNode)
                activeShowTimer = null
            }, 120)
        })

        anchor.addEventListener('mouseleave', () => {
            if (activeShowTimer) {
                clearTimeout(activeShowTimer)
                activeShowTimer = null
            }
            hideFootnotePopover(popover)
        })

        anchor.addEventListener('click', (e) => {
            // On mobile / touch or click, trigger popover if target is in-page
            if (window.matchMedia && window.matchMedia('(hover: none)').matches) {
                if (popover.classList.contains('visible')) {
                    hideFootnotePopover(popover, 0)
                } else {
                    e.preventDefault()
                    showFootnotePopover(popover, anchor, rootNode)
                }
            }
        })
    })

    return count
}


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

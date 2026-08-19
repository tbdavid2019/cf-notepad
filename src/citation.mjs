/**
 * Academic & Technical Citation Generator for David888 Wiki
 * Supports: APA (7th), IEEE, BibTeX, MLA (9th), Markdown, Chicago (17th)
 */

export function generateCitations({
    title = 'Untitled Note',
    author = 'DAVID888',
    siteName = 'David888 Wiki',
    url = '',
    publishDate = new Date(),
    accessDate = new Date(),
} = {}) {
    const pubDate = publishDate instanceof Date ? publishDate : (publishDate ? new Date(publishDate) : new Date())
    const accDate = accessDate instanceof Date ? accessDate : (accessDate ? new Date(accessDate) : new Date())

    const validPubDate = isNaN(pubDate.getTime()) ? new Date() : pubDate
    const validAccDate = isNaN(accDate.getTime()) ? new Date() : accDate

    const year = validPubDate.getFullYear()
    const monthNamesEn = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
    const monthShortEn = ['Jan.', 'Feb.', 'Mar.', 'Apr.', 'May', 'June', 'July', 'Aug.', 'Sept.', 'Oct.', 'Nov.', 'Dec.']
    const monthEn = monthNamesEn[validPubDate.getMonth()] || 'August'
    const monthShort = monthShortEn[validPubDate.getMonth()] || 'Aug.'
    const day = validPubDate.getDate()

    const accYear = validAccDate.getFullYear()
    const accMonthShort = monthShortEn[validAccDate.getMonth()] || monthShort
    const accDay = validAccDate.getDate()
    const accIso = validAccDate.toISOString().slice(0, 10)

    const cleanUrl = String(url || '').trim()
    const urlWithoutProtocol = cleanUrl.replace(/^https?:\/\//, '')
    const slugMatch = cleanUrl.match(/\/share\/([a-zA-Z0-9_-]+)/) || cleanUrl.match(/\/([a-zA-Z0-9_-]+)$/)
    const bibtexKey = slugMatch ? `david888wiki_${slugMatch[1]}` : 'david888wiki_note'
    const cleanTitle = String(title || 'Untitled Note').trim()
    const cleanAuthor = String(author || 'DAVID888').trim()
    const cleanSiteName = String(siteName || 'David888 Wiki').trim()

    // 1. APA (7th Edition)
    // Author. (Year, Month Day). Title. Site Name. URL
    const apa = `${cleanAuthor}. (${year}, ${monthEn} ${day}). ${cleanTitle}. ${cleanSiteName}. ${cleanUrl}`

    // 2. IEEE
    // [1] Author, "Title," Site Name, Month Day, Year. [Online]. Available: URL. [Accessed: Month Day, Year].
    const ieee = `[1] ${cleanAuthor}, "${cleanTitle}," ${cleanSiteName}, ${monthShort} ${day}, ${year}. [Online]. Available: ${cleanUrl}. [Accessed: ${accMonthShort} ${accDay}, ${accYear}].`

    // 3. BibTeX
    const bibtex = `@misc{${bibtexKey},
  author = {${cleanAuthor}},
  title = {${cleanTitle}},
  howpublished = {\\url{${cleanUrl}}},
  year = {${year}},
  note = {Accessed: ${accIso}}
}`

    // 4. MLA (9th Edition)
    // Author. "Title." Site Name, Day Month Year, URL. Accessed Day Month Year.
    const mla = `${cleanAuthor}. "${cleanTitle}." ${cleanSiteName}, ${day} ${monthShort.replace('.', '')} ${year}, ${urlWithoutProtocol}. Accessed ${accDay} ${accMonthShort.replace('.', '')} ${accYear}.`

    // 5. Markdown Link & Footnote
    const markdown = `[${cleanTitle} - ${cleanSiteName}](${cleanUrl})`
    const markdownFootnote = `[^1]: ${cleanAuthor}. "${cleanTitle}." ${cleanSiteName}. ${cleanUrl}`

    // 6. Chicago (17th Edition)
    // Author. "Title." Site Name. Last modified Month Day, Year. URL.
    const chicago = `${cleanAuthor}. "${cleanTitle}." ${cleanSiteName}. Last modified ${monthEn} ${day}, ${year}. ${cleanUrl}.`

    return {
        apa,
        ieee,
        bibtex,
        mla,
        markdown,
        markdownFootnote,
        chicago,
    }
}

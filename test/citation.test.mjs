import test from 'node:test'
import assert from 'node:assert/strict'
import { generateCitations } from '../src/citation.mjs'

test('generateCitations produces correct citation formats for APA, IEEE, BibTeX, MLA, Markdown, and Chicago', () => {
    const pubDate = new Date('2026-08-19T10:00:00Z')
    const accDate = new Date('2026-08-19T12:00:00Z')
    const citations = generateCitations({
        title: 'Cloudflare Workers Architecture',
        author: 'DAVID888',
        siteName: 'David888 Wiki',
        url: 'https://wiki.david888.com/share/cf-arch',
        publishDate: pubDate,
        accessDate: accDate,
    })

    // 1. APA
    assert.equal(
        citations.apa,
        'DAVID888. (2026, August 19). Cloudflare Workers Architecture. David888 Wiki. https://wiki.david888.com/share/cf-arch'
    )

    // 2. IEEE
    assert.equal(
        citations.ieee,
        '[1] DAVID888, "Cloudflare Workers Architecture," David888 Wiki, Aug. 19, 2026. [Online]. Available: https://wiki.david888.com/share/cf-arch. [Accessed: Aug. 19, 2026].'
    )

    // 3. BibTeX
    assert.ok(citations.bibtex.includes('@misc{david888wiki_cf-arch,'))
    assert.ok(citations.bibtex.includes('author = {DAVID888}'))
    assert.ok(citations.bibtex.includes('title = {Cloudflare Workers Architecture}'))
    assert.ok(citations.bibtex.includes('howpublished = {\\url{https://wiki.david888.com/share/cf-arch}}'))
    assert.ok(citations.bibtex.includes('year = {2026}'))

    // 4. MLA
    assert.equal(
        citations.mla,
        'DAVID888. "Cloudflare Workers Architecture." David888 Wiki, 19 Aug 2026, wiki.david888.com/share/cf-arch. Accessed 19 Aug 2026.'
    )

    // 5. Markdown
    assert.equal(
        citations.markdown,
        '[Cloudflare Workers Architecture - David888 Wiki](https://wiki.david888.com/share/cf-arch)'
    )

    // 6. Chicago
    assert.equal(
        citations.chicago,
        'DAVID888. "Cloudflare Workers Architecture." David888 Wiki. Last modified August 19, 2026. https://wiki.david888.com/share/cf-arch.'
    )
})

test('generateCitations handles defaults gracefully when params are omitted', () => {
    const citations = generateCitations()
    assert.ok(citations.apa.includes('Untitled Note'))
    assert.ok(citations.ieee.includes('David888 Wiki'))
    assert.ok(citations.bibtex.includes('@misc{david888wiki_note'))
})

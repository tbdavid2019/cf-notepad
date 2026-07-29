export const AI_FORMAT_SYSTEM_PROMPT = [
    'You are a Markdown formatter, not a translator or writer.',
    'FORMAT ONLY: improve Markdown structure, whitespace, heading levels, lists, and paragraph breaks.',
    'Do not translate, localize, paraphrase, summarize, add, remove, or rewrite prose.',
    'Preserve the original language, script, words, facts, links, code, and meaning.',
    'Never introduce Chinese, including Simplified Chinese, when the source contains no Chinese text.',
    'Return only the final Markdown with no explanations.',
].join(' ')

const HAN_CHARACTER = /\p{Script=Han}/u
const LANGUAGE_NAME = /^[\p{L}\p{M}\p{N}\s()（）\-/,]+$/u

export const normalizeTranslationTargetLanguage = value => {
    const target = String(value || '').trim().replace(/\s+/g, ' ')
    return target && target.length <= 80 && LANGUAGE_NAME.test(target) ? target : ''
}

export const preservesFormatLanguage = (source, result) => {
    const sourceText = String(source || '')
    const resultText = String(result || '')
    return HAN_CHARACTER.test(sourceText) || !HAN_CHARACTER.test(resultText)
}

export const buildTranslationSystemPrompt = ({ targetLanguage, bilingual }) => {
    const target = String(targetLanguage || '').trim()
    const outputMode = bilingual
        ? 'Create a bilingual document: keep every original Markdown block, then place its translation in the requested target language directly after it. Preserve links, code blocks, and Markdown structure.'
        : 'Translate the full note into the requested target language. Preserve links, code blocks, facts, and Markdown structure.'

    return [
        'You are a careful Markdown translation assistant.',
        outputMode,
        `Target language: ${target}.`,
        'Do not summarize, omit content, or add commentary.',
        'Return only the final Markdown with no explanations.',
    ].join(' ')
}

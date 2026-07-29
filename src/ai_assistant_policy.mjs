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

export const buildTranslationSystemPrompt = ({ targetLanguage, bilingual, selectionOnly = false }) => {
    const target = String(targetLanguage || '').trim()
    const subject = selectionOnly ? 'selected Markdown only' : 'full note'
    const outputMode = bilingual
        ? `Create a bilingual document for the ${subject}: keep every original Markdown block, then place its translation in the requested target language directly after it. Preserve links, code blocks, and Markdown structure.`
        : `Translate the ${subject} into the requested target language. Preserve links, code blocks, facts, and Markdown structure.`

    return [
        'You are a careful Markdown translation assistant.',
        outputMode,
        `Target language: ${target}.`,
        'Do not summarize, omit content, or add commentary.',
        'Return only the final Markdown with no explanations.',
    ].join(' ')
}

export const buildAiUserPrompt = ({
    mode,
    text,
    instruction = '',
    selectionStart = 0,
    selectionEnd = 0,
    hasSelection = false,
    targetLanguage = '',
    bilingual = false,
}) => {
    const source = String(text || '')
    const requirements = String(instruction || '').trim()

    if (hasSelection && mode === 'translate') {
        return [
            'Task: translate the selected text only.',
            `Target language: ${targetLanguage}. Output mode: ${bilingual === true ? 'bilingual' : 'translation only'}.`,
            '',
            'Selected text to translate:',
            source.slice(selectionStart, selectionEnd),
        ].join('\n')
    }

    if (hasSelection) {
        return [
            mode === 'format' ? 'Task: format the selected text only.' : 'Task: replace the selected text only.',
            `User requirements: ${requirements || 'improve Markdown structure only; do not alter prose or language.'}`,
            '',
            'Text before selection (context only):',
            source.slice(0, selectionStart),
            '',
            'Selected text to edit:',
            source.slice(selectionStart, selectionEnd),
            '',
            'Text after selection (context only):',
            source.slice(selectionEnd),
        ].join('\n')
    }

    return [
        mode === 'edit' ? 'Task: edit this full note.' : mode === 'translate' ? 'Task: translate this full note.' : 'Task: format this full note only.',
        mode === 'translate'
            ? `Target language: ${targetLanguage}. Output mode: ${bilingual === true ? 'bilingual' : 'translation only'}.`
            : requirements ? `User requirements: ${requirements}` : 'User requirements: improve Markdown structure only; do not alter prose or language.',
        '',
        'Full note:',
        source,
    ].join('\n')
}

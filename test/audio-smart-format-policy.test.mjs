import test from 'node:test'
import assert from 'node:assert/strict'
import {
    AUDIO_SMART_FORMAT_SYSTEM_PROMPT,
    buildAudioSmartFormatPrompt,
} from '../src/ai_assistant_policy.mjs'

test('audio smart format policy asks the LLM to clarify, organize, and format the transcript', () => {
    assert.match(AUDIO_SMART_FORMAT_SYSTEM_PROMPT, /clarify/i)
    assert.match(AUDIO_SMART_FORMAT_SYSTEM_PROMPT, /organize/i)
    assert.match(AUDIO_SMART_FORMAT_SYSTEM_PROMPT, /Markdown/)
    assert.match(AUDIO_SMART_FORMAT_SYSTEM_PROMPT, /Do not invent/i)
    assert.doesNotMatch(AUDIO_SMART_FORMAT_SYSTEM_PROMPT, /strict verbatim/i)
})

test('audio smart format prompt includes the complete Whisper transcript and output constraints', () => {
    const transcript = '嗯我們今天先確認版本然後下週一交付。'
    const prompt = buildAudioSmartFormatPrompt(transcript)

    assert.match(prompt, /Raw Whisper transcript/)
    assert.match(prompt, new RegExp(transcript))
    assert.match(prompt, /Return only the final Markdown/i)
    assert.match(prompt, /Do not invent/i)
})

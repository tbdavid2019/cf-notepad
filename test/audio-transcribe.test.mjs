import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { SUPPORTED_LANG } from '../src/constant.js'

const commonSource = readFileSync(new URL('../src/templates/common.js', import.meta.url), 'utf8')
const baseSource = readFileSync(new URL('../src/templates/base.js', import.meta.url), 'utf8')
const indexSource = readFileSync(new URL('../src/index.js', import.meta.url), 'utf8')

test('import-md-input accepts audio file formats and new menu provides explicit audio import item', () => {
    assert.match(commonSource, /accept="[^"]*audio\/\*[^"]*\.mp3[^"]*\.wav[^"]*\.m4a/)
    assert.match(commonSource, /id="dropdown-import-audio-btn"/)
    assert.match(commonSource, /id="dropdown-import-audio-smart-format-btn"/)
    assert.match(commonSource, /id="import-audio-input"/)
    assert.match(commonSource, /id="import-audio-smart-format-input"/)
    assert.ok(SUPPORTED_LANG['zh-TW'].importAudioMarkdown)
    assert.ok(SUPPORTED_LANG['zh-TW'].importAudioSmartFormatMarkdown)
    assert.ok(SUPPORTED_LANG['zh-TW'].importAudioBlock)
    assert.ok(SUPPORTED_LANG['zh-TW'].importAudioSmartFormatBlock)
    assert.ok(SUPPORTED_LANG['en-US'].importAudioMarkdown)
    assert.ok(SUPPORTED_LANG['en-US'].importAudioSmartFormatMarkdown)
    assert.ok(SUPPORTED_LANG['en-US'].importAudioBlock)
    assert.ok(SUPPORTED_LANG['en-US'].importAudioSmartFormatBlock)
    assert.equal(SUPPORTED_LANG['zh-TW'].importAudioSmartFormatMarkdown, '匯入音訊（智慧排版）')
    assert.doesNotMatch(commonSource, /區分發言者/)
})

test('base template routes audio imports to AI transcribe endpoint with bilingual messages', () => {
    assert.match(baseSource, /const isAudio =/)
    assert.match(baseSource, /\/transcribe/)
    assert.match(baseSource, /transcribingAudioSmartFormat/)
    assert.match(baseSource, /audioSmartFormatted/)
    assert.match(baseSource, /const \$dropdownImportAudioBtn = document\.querySelector\('#dropdown-import-audio-btn'\)/)
    assert.match(baseSource, /const \$importAudioInput = document\.querySelector\('#import-audio-input'\)/)
    assert.match(baseSource, /const \$dropdownImportAudioSmartFormatBtn = document\.querySelector\('#dropdown-import-audio-smart-format-btn'\)/)
    assert.match(baseSource, /const \$importAudioSmartFormatInput = document\.querySelector\('#import-audio-smart-format-input'\)/)
    assert.ok(SUPPORTED_LANG['zh-TW'].transcribingAudio)
    assert.ok(SUPPORTED_LANG['zh-TW'].audioTranscribed)
    assert.ok(SUPPORTED_LANG['en-US'].transcribingAudio)
    assert.ok(SUPPORTED_LANG['en-US'].audioTranscribed)
    assert.ok(SUPPORTED_LANG['zh-TW'].transcribingAudioSmartFormat)
    assert.ok(SUPPORTED_LANG['zh-TW'].audioSmartFormatted)
    assert.ok(SUPPORTED_LANG['en-US'].transcribingAudioSmartFormat)
    assert.ok(SUPPORTED_LANG['en-US'].audioSmartFormatted)
    assert.doesNotMatch(baseSource, /diarize=1/)
})

test('index.js registers audio transcribe routes and uses Groq whisper-large-v3 primary with multi-tier fallback pipeline', () => {
    assert.match(indexSource, /router\.post\('\/api\/audio\/transcribe'/)
    assert.match(indexSource, /router\.post\('\/:path\/transcribe'/)
    assert.match(indexSource, /handleAudioTranscription/)
    assert.match(indexSource, /transcribeWithGroq/)
    assert.match(indexSource, /whisper-large-v3/)
    assert.match(indexSource, /whisper-large-v3-turbo/)
    assert.match(indexSource, /@cf\/openai\/whisper-large-v3-turbo/)
    assert.match(indexSource, /formatAudioSmartMarkdown/)
    assert.match(indexSource, /smartFormatParam/)
    assert.doesNotMatch(indexSource, /formatSpeakerDiarization/)
})

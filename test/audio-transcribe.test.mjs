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
    assert.match(indexSource, /formatTranscriptSegments/)
    assert.match(indexSource, /parseVttToSegments/)
    assert.match(indexSource, /verbose_json/)
    assert.doesNotMatch(indexSource, /formatSpeakerDiarization/)
})

import {
    parseVttTimestamp,
    formatSecondsToTimestamp,
    parseVttToSegments,
    normalizeTranscriptionSegments,
    formatTranscriptSegments,
} from '../src/audio_transcribe.mjs'

test('audio_transcribe parseVttTimestamp correctly converts mm:ss and hh:mm:ss timestamps to seconds', () => {
    assert.equal(parseVttTimestamp('00:00.000'), 0)
    assert.equal(parseVttTimestamp('00:04.500'), 4.5)
    assert.equal(parseVttTimestamp('01:30.000'), 90)
    assert.equal(parseVttTimestamp('01:02:03.500'), 3723.5)
    assert.equal(parseVttTimestamp(''), 0)
    assert.equal(parseVttTimestamp(null), 0)
})

test('audio_transcribe formatSecondsToTimestamp formats seconds into [mm:ss] and [hh:mm:ss]', () => {
    assert.equal(formatSecondsToTimestamp(0), '00:00')
    assert.equal(formatSecondsToTimestamp(4.9), '00:04')
    assert.equal(formatSecondsToTimestamp(65), '01:05')
    assert.equal(formatSecondsToTimestamp(3665), '01:01:05')
    assert.equal(formatSecondsToTimestamp(65, { forceHours: true }), '00:01:05')
    assert.equal(formatSecondsToTimestamp(-5), '00:00')
})

test('audio_transcribe parseVttToSegments parses WebVTT cues into structured segments with tags stripped', () => {
    const vtt = `WEBVTT

1
00:00.000 --> 00:04.500
<v Speaker1>各位同仁大家早安，</v>

2
00:04.500 --> 00:09.200
今天我們來討論專案進度。

3
01:02:00.000 --> 01:02:05.500
最後確認上線時間。`

    const segments = parseVttToSegments(vtt)
    assert.equal(segments.length, 3)
    assert.equal(segments[0].start, 0)
    assert.equal(segments[0].end, 4.5)
    assert.equal(segments[0].text, '各位同仁大家早安，')
    assert.equal(segments[1].start, 4.5)
    assert.equal(segments[1].end, 9.2)
    assert.equal(segments[1].text, '今天我們來討論專案進度。')
    assert.equal(segments[2].start, 3720)
    assert.equal(segments[2].end, 3725.5)
    assert.equal(segments[2].text, '最後確認上線時間。')
})

test('audio_transcribe normalizeTranscriptionSegments sanitizes Groq and Workers AI segment payloads', () => {
    const raw = [
        { start: 0, end: 3.5, text: '  第一段文字  ' },
        { start: null, end: undefined, text: '' }, // empty text filtered
        { start: 3.5, end: 8.0, text: '<b>第二段文字</b>' },
    ]
    const normalized = normalizeTranscriptionSegments(raw)
    assert.equal(normalized.length, 2)
    assert.equal(normalized[0].text, '第一段文字')
    assert.equal(normalized[1].text, '第二段文字')
    assert.equal(normalized[1].start, 3.5)
})

test('audio_transcribe formatTranscriptSegments generates formatted Markdown paragraphs with bold timestamps', () => {
    const segments = [
        { start: 0, end: 4.5, text: '各位同仁大家早安。' },
        { start: 15.2, end: 20.0, text: '今天我們來討論新功能。' },
    ]
    const formatted = formatTranscriptSegments(segments, 'fallback')
    assert.equal(
        formatted,
        '**[00:00]** 各位同仁大家早安。\n\n**[00:15]** 今天我們來討論新功能。'
    )

    // Falls back to raw text if segments is empty
    assert.equal(formatTranscriptSegments([], '  raw text fallback  '), 'raw text fallback')
})

test('audio_transcribe formatTranscriptSegments handles audio longer than 1 hour with hh:mm:ss timestamps', () => {
    const segments = [
        { start: 120, end: 130, text: '開場介紹' },
        { start: 3725, end: 3730, text: '一小時後的結論' },
    ]
    const formatted = formatTranscriptSegments(segments)
    assert.equal(
        formatted,
        '**[00:02:00]** 開場介紹\n\n**[01:02:05]** 一小時後的結論'
    )
})


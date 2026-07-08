import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const indexSource = readFileSync(new URL('../src/index.js', import.meta.url), 'utf8')
const helperSource = readFileSync(new URL('../src/helper.js', import.meta.url), 'utf8')
const commonTemplateSource = readFileSync(new URL('../src/templates/common.js', import.meta.url), 'utf8')
const baseTemplateSource = readFileSync(new URL('../src/templates/base.js', import.meta.url), 'utf8')

test('direct note route treats view lock separately from edit lock', () => {
    assert.match(indexSource, /if \(!metadata\.pw && !metadata\.vpw\)/)
    assert.match(indexSource, /if \(metadata\.vpw\) \{/)
    assert.match(indexSource, /return returnPage\('NeedPasswd', \{ lang, title \}\)/)
    assert.match(indexSource, /return returnPage\('Edit', \{\s*lang,\s*title,\s*content: value,/s)
    assert.match(indexSource, /showPwPrompt: true/)
    assert.match(indexSource, /authPath: `\/\$\{path\}\/auth`/)
})

test('share route only exposes authPath when the note is actually locked', () => {
    assert.match(indexSource, /\.\.\.\(metadata\.pw \|\| metadata\.vpw \? \{ authPath \} : \{\}\),/)
})

test('auth helpers read secret and salt at runtime instead of import time', () => {
    assert.match(helperSource, /MD5\(`\$\{hashPw\}\+\$\{getSalt\(\) \|\| ''\}`\)/)
    assert.match(helperSource, /MD5\(`\$\{hashPw\}\+undefined`\)/)
    assert.match(helperSource, /export async function passwordMatches\(password, storedHash\)/)
    assert.match(helperSource, /const secret = getSecret\(\)/)
    assert.match(helperSource, /if \(typeof secret !== 'string' \|\| !secret\)/)
})

test('readonly direct note footer opens password prompt for edit lock', () => {
    assert.match(commonTemplateSource, /id="readonly-edit-btn"/)
    assert.match(commonTemplateSource, /class="modal password-modal"/)
    assert.match(commonTemplateSource, /<input type="password" class="password-modal-input"/)
    assert.match(commonTemplateSource, /authPath\s*\? `<button type="button" id="readonly-edit-btn"/)
    assert.match(baseTemplateSource, /const openPasswordModal = \(\{ title, initialValue = '', allowEmpty = false \} = \{\}\) => new Promise/)
    assert.match(baseTemplateSource, /\$readonlyEditBtn\.addEventListener\('click', \(\) => passwdPrompt\(\)\)/)
})

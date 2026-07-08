import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const repoRoot = resolve(__dirname, '..')
const sourcePath = resolve(repoRoot, 'skills/SKILL.md')
const outputPath = resolve(repoRoot, 'src/generated/agent-skill.generated.mjs')

const markdown = readFileSync(sourcePath, 'utf8').replace(/\r\n/g, '\n')
const generated = [
    '// This file is generated from skills/SKILL.md.',
    '// Do not edit manually; run `node scripts/generate-agent-skill.mjs`.',
    '',
    `export const AGENT_SKILL_MARKDOWN = ${JSON.stringify(markdown)};`,
    '',
].join('\n')

mkdirSync(dirname(outputPath), { recursive: true })
writeFileSync(outputPath, generated, 'utf8')

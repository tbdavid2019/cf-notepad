import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const repoRoot = resolve(__dirname, '..')
const generatedDir = resolve(repoRoot, 'src/generated')

function writeGeneratedModule({ sourcePath, outputPath, exportName }) {
    const markdown = readFileSync(sourcePath, 'utf8').replace(/\r\n/g, '\n')
    const generated = [
        `// This file is generated from ${sourcePath.replace(`${repoRoot}/`, '')}.`,
        '// Do not edit manually; run `node scripts/generate-agent-skill.mjs`.',
        '',
        `export const ${exportName} = ${JSON.stringify(markdown)};`,
        '',
    ].join('\n')

    writeFileSync(outputPath, generated, 'utf8')
}

mkdirSync(generatedDir, { recursive: true })

writeGeneratedModule({
    sourcePath: resolve(repoRoot, 'skills/SKILL.md'),
    outputPath: resolve(generatedDir, 'agent-skill.generated.mjs'),
    exportName: 'AGENT_SKILL_MARKDOWN',
})

writeGeneratedModule({
    sourcePath: resolve(repoRoot, 'LLM_API_DOCS.md'),
    outputPath: resolve(generatedDir, 'api-docs.generated.mjs'),
    exportName: 'API_DOCS_MARKDOWN',
})

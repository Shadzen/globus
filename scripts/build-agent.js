import fs from 'fs'
import path from 'path'
import { execSync } from 'child_process'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.join(__dirname, '..')
const pagesDir = path.join(root, 'src/pages')
const agentDir = path.join(pagesDir, 'agent')
const KEEP_AGENT_ROUTES = new Set(['tour_search', 'tour_search_login'])

/** @type {{ hidden: string, original: string }[]} */
const renames = []

function hideEntry(dir, name, shouldKeep) {
    if (shouldKeep(name) || name.startsWith('_')) return
    const original = path.join(dir, name)
    if (!fs.existsSync(original)) return
    const hidden = path.join(dir, `_${name}`)
    fs.renameSync(original, hidden)
    renames.push({ hidden, original })
}

function hidePagesForAgentBuild() {
    hideEntry(pagesDir, 'index.astro', () => false)
    hideEntry(pagesDir, 'tourist', () => false)
    if (fs.existsSync(agentDir)) {
        for (const name of fs.readdirSync(agentDir)) {
            hideEntry(agentDir, name, (n) => KEEP_AGENT_ROUTES.has(n))
        }
    }
}

function restorePages() {
    for (const { hidden, original } of [...renames].reverse()) {
        if (fs.existsSync(hidden)) {
            fs.renameSync(hidden, original)
        }
    }
    renames.length = 0
}

function run(cmd, env = {}) {
    execSync(cmd, {
        stdio: 'inherit',
        cwd: root,
        env: { ...process.env, ...env },
    })
}

hidePagesForAgentBuild()

function pruneAgentDist() {
    const distAgent = path.join(root, 'dist-agent')
    for (const name of ['dev', 'icons']) {
        const target = path.join(distAgent, name)
        if (fs.existsSync(target)) {
            fs.rmSync(target, { recursive: true, force: true })
        }
    }
}

try {
    run('npx astro build --outDir dist-agent')
    pruneAgentDist()
    run('node scripts/fix-scripts-agent.js', { DIST_DIR: 'dist-agent' })
    run('npx prettier --write "dist-agent/**/*.html" --ignore-path .prettierignore')
} finally {
    restorePages()
}

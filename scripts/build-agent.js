import fs from 'fs'
import path from 'path'
import { execSync } from 'child_process'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.join(__dirname, '..')
const shellPagesDir = path.join(__dirname, 'agent-shell/src/pages/agent')
const AGENT_ROUTES = ['tour_search', 'tour_search_login']

function syncAgentPages() {
    fs.rmSync(shellPagesDir, { recursive: true, force: true })
    for (const route of AGENT_ROUTES) {
        const src = path.join(root, 'src/pages/agent', route, 'index.astro')
        const dest = path.join(shellPagesDir, route, 'index.astro')
        fs.mkdirSync(path.dirname(dest), { recursive: true })
        fs.copyFileSync(src, dest)
    }
}

function pruneAgentDist() {
    const distAgent = path.join(root, 'dist-agent')
    for (const name of ['dev', 'icons']) {
        const target = path.join(distAgent, name)
        if (fs.existsSync(target)) {
            fs.rmSync(target, { recursive: true, force: true })
        }
    }
}

function run(cmd, env = {}) {
    execSync(cmd, {
        stdio: 'inherit',
        cwd: root,
        env: { ...process.env, ...env },
    })
}

syncAgentPages()

try {
    run('npx astro build --config scripts/agent-shell/astro.config.mjs --outDir dist-agent')
    pruneAgentDist()
    run('node scripts/fix-scripts-agent.js', { DIST_DIR: 'dist-agent' })
    run('npx prettier --write "dist-agent/**/*.html" --ignore-path .prettierignore')
} catch (err) {
    console.error(err)
    process.exit(1)
}

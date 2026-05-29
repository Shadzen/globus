import fs from 'fs'
import path from 'path'
import crypto from 'crypto'
import { globby } from 'globby'
import * as esbuild from 'esbuild'

const distDir = process.env.DIST_DIR || 'dist-agent'
const assetsDir = path.join(distDir, 'assets')
const astroDir = path.join(distDir, '_astro')
const base = process.env.GITHUB_ACTIONS ? '/globus/' : '/'

const agentPagePaths = [
    path.join(distDir, 'agent', 'tour_search', 'index.html'),
    path.join(distDir, 'agent', 'tour_search_login', 'index.html'),
]

const KEEP_ASSET_FILES = new Set(['agent.js', 'agent.css'])

function fileHash(filePath) {
    const content = fs.readFileSync(filePath)
    return crypto.createHash('md5').update(content).digest('hex').slice(0, 8)
}

function matchCssHrefs(html) {
    return [...html.matchAll(/<link[^>]*href="([^"]*\/assets\/[^"]+\.css)"[^>]*\/?>/g)].map((m) => m[1])
}

function hrefToAssetPath(href) {
    const withoutLeading = href.replace(/^\//, '')
    const withoutBase = withoutLeading.replace(/^globus\/?/, '')
    return withoutBase
}

function collectAgentCssHrefs() {
    const hrefs = new Set()
    for (const htmlPath of agentPagePaths) {
        matchCssHrefs(fs.readFileSync(htmlPath, 'utf8')).forEach((h) => hrefs.add(h))
    }
    return [...hrefs]
}

async function bundleAgentLayoutFromAstro(astroDir, assetsDir) {
    const agentLayoutFiles = fs
        .readdirSync(astroDir)
        .filter((f) => f.startsWith('AgentLayout.astro') && f.endsWith('.js'))
    if (agentLayoutFiles.length === 0) return null
    const agentEntry = path.join(astroDir, agentLayoutFiles[0])
    const outAgent = path.join(assetsDir, 'agent.js')
    await esbuild.build({
        entryPoints: [agentEntry],
        bundle: true,
        format: 'esm',
        outfile: outAgent,
        minify: true,
        logLevel: 'silent',
    })
    return outAgent
}

async function bundleInlineScriptToAgent(html) {
    const match = html.match(/<script type="module">([\s\S]*?)<\/script>/)
    if (!match) return null
    const entryPath = path.join(assetsDir, '.agent-inline-entry.mjs')
    const outAgent = path.join(assetsDir, 'agent.js')
    fs.writeFileSync(entryPath, match[1].trim())
    try {
        await esbuild.build({
            entryPoints: [entryPath],
            bundle: false,
            format: 'esm',
            outfile: outAgent,
            minify: true,
            logLevel: 'silent',
        })
        return outAgent
    } finally {
        if (fs.existsSync(entryPath)) fs.unlinkSync(entryPath)
    }
}

async function resolveAgentJs(firstHtml) {
    const agentPath = path.join(assetsDir, 'agent.js')
    if (fs.existsSync(agentPath)) return agentPath
    if (fs.existsSync(astroDir)) {
        const fromAstro = await bundleAgentLayoutFromAstro(astroDir, assetsDir)
        if (fromAstro) return fromAstro
    }
    return bundleInlineScriptToAgent(firstHtml)
}

function stripScriptsAndInject(html, scriptSrc) {
    let content = html
    content = content.replace(/<script[^>]*src="[^"]*(?:assets\/|\/_astro\/)[^"]*\.js[^"]*"[^>]*><\/script>/g, '')
    content = content.replace(/<script type="module">[\s\S]*?<\/script>/g, '')
    content = content.replace(
        '</body>',
        `
    <script type="module" src="${scriptSrc}"></script>
    </body>`,
    )
    return content
}

async function fix() {
    if (!agentPagePaths.every((p) => fs.existsSync(p))) {
        console.log('❌ Expected agent tour_search pages in dist-agent.')
        return
    }

    const firstAgentHtml = fs.readFileSync(agentPagePaths[0], 'utf8')
    const agentJsPath = await resolveAgentJs(firstAgentHtml)
    if (!agentJsPath) {
        console.log('❌ Could not produce agent.js (no _astro, inline script, or existing bundle).')
        return
    }
    const agentJsHash = fileHash(agentJsPath)
    const scriptSrc = `${base}assets/agent.js?v=${agentJsHash}`

    const agentCssHrefs = collectAgentCssHrefs()
    let agentPagesCssHash = null

    if (agentCssHrefs.length > 0) {
        const mergedCss = agentCssHrefs
            .map((href) => {
                const filePath = path.join(distDir, hrefToAssetPath(href))
                return fs.existsSync(filePath) ? fs.readFileSync(filePath, 'utf8') : ''
            })
            .filter(Boolean)
            .join('\n')
        const agentPagesCssPath = path.join(assetsDir, 'agent.css')
        fs.writeFileSync(agentPagesCssPath, mergedCss)
        agentPagesCssHash = fileHash(agentPagesCssPath)
        const agentCssLink = `<link rel="stylesheet" href="${base}assets/agent.css?v=${agentPagesCssHash}" />`
        for (const htmlPath of agentPagePaths) {
            let content = fs.readFileSync(htmlPath, 'utf8')
            for (const href of agentCssHrefs) {
                const escaped = href.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
                content = content.replace(
                    new RegExp(`<link[^>]*href="${escaped}"[^>]*\\/?>\\s*`, 'g'),
                    '',
                )
            }
            content = content.replace('</head>', `\n        ${agentCssLink}\n    </head>`)
            content = stripScriptsAndInject(content, scriptSrc)
            fs.writeFileSync(htmlPath, content)
        }
    } else {
        for (const htmlPath of agentPagePaths) {
            const content = stripScriptsAndInject(fs.readFileSync(htmlPath, 'utf8'), scriptSrc)
            fs.writeFileSync(htmlPath, content)
        }
    }

    if (fs.existsSync(assetsDir)) {
        fs.readdirSync(assetsDir).forEach((f) => {
            const fullPath = path.join(assetsDir, f)
            if (fs.lstatSync(fullPath).isDirectory()) {
                if (f === 'astro') {
                    fs.rmSync(fullPath, { recursive: true, force: true })
                }
            } else if (!KEEP_ASSET_FILES.has(f) && (f.endsWith('.js') || f.endsWith('.css'))) {
                fs.unlinkSync(fullPath)
            }
        })
    }

    if (fs.existsSync(astroDir)) {
        fs.rmSync(astroDir, { recursive: true, force: true })
    }

    console.log(
        `✅ Agent build done: agent.js?v=${agentJsHash}` +
            (agentPagesCssHash ? `, agent.css?v=${agentPagesCssHash}` : ''),
    )
}

fix()

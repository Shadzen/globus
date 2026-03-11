import fs from 'fs'
import path from 'path'
import crypto from 'crypto'
import { globby } from 'globby'
import * as esbuild from 'esbuild'

function fileHash(filePath) {
    const content = fs.readFileSync(filePath)
    return crypto.createHash('md5').update(content).digest('hex').slice(0, 8)
}

// Match CSS hrefs: /assets/... or /globus/assets/... (GitHub Pages base)
function matchCssHrefs(html) {
    return [...html.matchAll(/<link[^>]*href="([^"]*\/assets\/[^"]+\.css)"[^>]*\/?>/g)].map((m) => m[1])
}

// Match script src: /assets/... or /_astro/... (Astro 6) or /globus/...
function matchScriptSrcs(html) {
    return [
        ...html.matchAll(/<script[^>]*src="([^"]*(?:\/assets\/|\/_astro\/)[^"]+\.js)[^"]*"[^>]*><\/script>/g),
    ].map((m) => m[1])
}

function hrefToAssetPath(href) {
    // "/assets/foo.css" or "/globus/assets/foo.css" -> "assets/foo.css"
    const withoutLeading = href.replace(/^\//, '')
    const withoutBase = withoutLeading.replace(/^globus\/?/, '')
    return withoutBase
}

// href "/_astro/foo.js" or "/globus/_astro/foo.js" -> "dist/_astro/foo.js"
function scriptHrefToDistPath(href, distDir) {
    const withoutLeading = href.replace(/^\//, '')
    const withoutBase = withoutLeading.replace(/^globus\/?/, '')
    return path.join(distDir, withoutBase)
}

/** Bundle _astro/Layout.*.js and _astro/AgentLayout.*.js into assets/main.js and assets/agent.js via esbuild */
async function bundleAstroScriptsToAssets(distDir, assetsDir, astroDir) {
    const layoutFiles = fs.readdirSync(astroDir).filter((f) => f.startsWith('Layout.astro') && f.endsWith('.js'))
    const agentLayoutFiles = fs
        .readdirSync(astroDir)
        .filter((f) => f.startsWith('AgentLayout.astro') && f.endsWith('.js'))
    if (layoutFiles.length === 0 || agentLayoutFiles.length === 0) {
        console.log('❌ Layout.*.js and/or AgentLayout.*.js not found in _astro.')
        return null
    }
    const layoutEntry = path.join(astroDir, layoutFiles[0])
    const agentEntry = path.join(astroDir, agentLayoutFiles[0])
    const outMain = path.join(assetsDir, 'main.js')
    const outAgent = path.join(assetsDir, 'agent.js')
    await esbuild.build({
        entryPoints: [layoutEntry],
        bundle: true,
        format: 'esm',
        outfile: outMain,
        minify: true,
        logLevel: 'silent',
    })
    await esbuild.build({
        entryPoints: [agentEntry],
        bundle: true,
        format: 'esm',
        outfile: outAgent,
        minify: true,
        logLevel: 'silent',
    })
    return { mainPath: outMain, agentPath: outAgent }
}

async function fix() {
    const distDir = 'dist'
    const assetsDir = path.join(distDir, 'assets')
    const astroDir = path.join(distDir, '_astro')
    const base = process.env.GITHUB_ACTIONS ? '/globus/' : '/'

    const mainPath = path.join(assetsDir, 'main.js')
    const agentPath = path.join(assetsDir, 'agent.js')
    let legacyMode = fs.existsSync(mainPath)

    let jsHash, agentJsHash
    if (legacyMode) {
        jsHash = fileHash(mainPath)
        agentJsHash = fs.existsSync(agentPath) ? fileHash(agentPath) : null
    } else {
        // Astro 6: bundle _astro/*.js into assets/main.js and assets/agent.js
        if (!fs.existsSync(astroDir)) {
            console.log('❌ _astro folder not found (expected Astro 6 scripts).')
            return
        }
        const bundled = await bundleAstroScriptsToAssets(distDir, assetsDir, astroDir)
        if (!bundled) return
        jsHash = fileHash(bundled.mainPath)
        agentJsHash = fileHash(bundled.agentPath)
        legacyMode = true
    }

    const agentPagePaths = [
        path.join(distDir, 'agent', 'tour_search', 'index.html'),
        path.join(distDir, 'agent', 'tour_search_login', 'index.html'),
    ]
    const resolve = (f) => path.resolve(f)
    const isAgentPagePath = (file) => agentPagePaths.some((p) => resolve(p) === resolve(file))

    // 1) Agent pages (other domain): merge their CSS into one file
    const agentPagesExist = agentPagePaths.every((p) => fs.existsSync(p))
    let agentPagesCssHash = null
    if (agentPagesExist) {
        const firstAgentHtml = fs.readFileSync(agentPagePaths[0], 'utf8')
        const agentCssHrefs = matchCssHrefs(firstAgentHtml)
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
                        ''
                    )
                }
                content = content.replace('</head>', `\n        ${agentCssLink}\n    </head>`)
                fs.writeFileSync(htmlPath, content)
            }
        }
    }

    // 2) All other pages: merge their CSS into one main.css
    const htmlFiles = await globby(`${distDir}/**/*.html`)
    const mainSiteHtmlFiles = htmlFiles.filter((f) => !isAgentPagePath(f))
    const mainCssHrefs = new Set()
    for (const file of mainSiteHtmlFiles) {
        const content = fs.readFileSync(file, 'utf8')
        const hrefs = matchCssHrefs(content)
        hrefs.forEach((h) => mainCssHrefs.add(h))
    }
    let mainCssHash = null
    if (mainCssHrefs.size > 0) {
        const sortedHrefs = [...mainCssHrefs].sort()
        const mergedMainCss = sortedHrefs
            .map((href) => {
                const filePath = path.join(distDir, hrefToAssetPath(href))
                return fs.existsSync(filePath) ? fs.readFileSync(filePath, 'utf8') : ''
            })
            .filter(Boolean)
            .join('\n')
        const mainCssPath = path.join(assetsDir, 'main.css')
        fs.writeFileSync(mainCssPath, mergedMainCss)
        mainCssHash = fileHash(mainCssPath)
        const mainCssLink = `<link rel="stylesheet" href="${base}assets/main.css?v=${mainCssHash}" />`
        for (const file of mainSiteHtmlFiles) {
            let content = fs.readFileSync(file, 'utf8')
            for (const href of sortedHrefs) {
                const escaped = href.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
                content = content.replace(
                    new RegExp(`<link[^>]*href="${escaped}"[^>]*\\/?>\\s*`, 'g'),
                    ''
                )
            }
            content = content.replace('</head>', `\n        ${mainCssLink}\n    </head>`)
            fs.writeFileSync(file, content)
        }
    }

    // 3) Fix all HTML (scripts): single main.js or agent.js
    for (const file of htmlFiles) {
        let content = fs.readFileSync(file, 'utf8')
        // Remove all script tags (assets and _astro)
        content = content.replace(
            /<script[^>]*src="[^"]*(?:assets\/|\/_astro\/)[^"]*\.js[^"]*"[^>]*><\/script>/g,
            ''
        )
        const isAgentPage = isAgentPagePath(file)
        const scriptSrc =
            isAgentPage && agentJsHash
                ? `${base}assets/agent.js?v=${agentJsHash}`
                : `${base}assets/main.js?v=${jsHash}`
        content = content.replace(
            '</body>',
            `
    <script type="module" src="${scriptSrc}"></script>
    </body>`
        )
        fs.writeFileSync(file, content)
    }

    // Clean assets: keep only main.js, agent.js, main.css, agent.css
    if (fs.existsSync(assetsDir)) {
        fs.readdirSync(assetsDir).forEach((f) => {
            const fullPath = path.join(assetsDir, f)
            if (fs.lstatSync(fullPath).isDirectory()) {
                if (f === 'astro') {
                    fs.rmSync(fullPath, { recursive: true, force: true })
                }
            } else if (f.endsWith('.js') && f !== 'main.js' && f !== 'agent.js') {
                fs.unlinkSync(fullPath)
            } else if (f.endsWith('.css') && f !== 'main.css' && f !== 'agent.css') {
                fs.unlinkSync(fullPath)
            }
        })
    }

    // Remove _astro folder entirely — scripts are already in assets/main.js and assets/agent.js
    if (fs.existsSync(astroDir)) {
        fs.rmSync(astroDir, { recursive: true, force: true })
    }

    const scriptInfo = `main.js?v=${jsHash}` + (agentJsHash ? `, agent.js?v=${agentJsHash}` : '')
    console.log(
        `✅ Done: ${scriptInfo}` +
            (mainCssHash ? `, main.css?v=${mainCssHash}` : '') +
            (agentPagesCssHash ? `, agent.css?v=${agentPagesCssHash}` : '')
    )
}

fix()

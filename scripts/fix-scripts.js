import fs from 'fs'
import path from 'path'
import crypto from 'crypto'
import { globby } from 'globby'

function fileHash(filePath) {
    const content = fs.readFileSync(filePath)
    return crypto.createHash('md5').update(content).digest('hex').slice(0, 8)
}

async function fix() {
    const distDir = 'dist'
    const assetsDir = path.join(distDir, 'assets')
    const base = process.env.GITHUB_ACTIONS ? '/globus/' : '/'

    const mainPath = path.join(assetsDir, 'main.js')
    const agentPath = path.join(assetsDir, 'agent.js')

    if (!fs.existsSync(mainPath)) {
        console.log('❌ Бандл main.js не найден.')
        return
    }

    // Считаем хеши для версионирования
    const jsHash = fileHash(mainPath)
    const agentJsHash = fs.existsSync(agentPath) ? fileHash(agentPath) : null

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
        const agentCssHrefs = [...firstAgentHtml.matchAll(/<link[^>]*href="(\/assets\/[^"]+\.css)"[^>]*\/?>/g)]
            .map((m) => m[1])
        if (agentCssHrefs.length > 0) {
            const mergedCss = agentCssHrefs
                .map((href) => {
                    const filePath = path.join(distDir, href.slice(1))
                    return fs.existsSync(filePath) ? fs.readFileSync(filePath, 'utf8') : ''
                })
                .filter(Boolean)
                .join('\n')
            const agentPagesCssPath = path.join(assetsDir, 'agent-pages.css')
            fs.writeFileSync(agentPagesCssPath, mergedCss)
            agentPagesCssHash = fileHash(agentPagesCssPath)
            const agentCssLink = `<link rel="stylesheet" href="${base}assets/agent-pages.css?v=${agentPagesCssHash}" />`
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
        const hrefs = [...content.matchAll(/<link[^>]*href="(\/assets\/[^"]+\.css)"[^>]*\/?>/g)].map((m) => m[1])
        hrefs.forEach((h) => mainCssHrefs.add(h))
    }
    let mainCssHash = null
    if (mainCssHrefs.size > 0) {
        const sortedHrefs = [...mainCssHrefs].sort()
        const mergedMainCss = sortedHrefs
            .map((href) => {
                const filePath = path.join(distDir, href.slice(1))
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

    // 3) Правим все HTML (scripts)
    for (const file of htmlFiles) {
        let content = fs.readFileSync(file, 'utf8')

        // Удаляем все script-теги, ссылающиеся на JS из папки assets
        content = content.replace(
            /<script[^>]*src="[^"]*assets\/[^"]*\.js[^"]*"[^>]*><\/script>/g,
            ''
        )

        // Agent pages: one script (agent.js). Others: main.js
        const isAgentPage = isAgentPagePath(file)
        const scriptSrc =
            isAgentPage && agentJsHash
                ? `${base}assets/agent.js?v=${agentJsHash}`
                : `${base}assets/main.js?v=${jsHash}`
        const cleanScripts = `
    <script type="module" src="${scriptSrc}"></script>
    </body>`

        content = content.replace('</body>', cleanScripts)

        fs.writeFileSync(file, content)
    }

    // Чистим assets: только main.js, agent.js, main.css, agent-pages.css
    fs.readdirSync(assetsDir).forEach((f) => {
        const fullPath = path.join(assetsDir, f)
        if (fs.lstatSync(fullPath).isDirectory()) {
            if (f === 'astro') {
                fs.rmSync(fullPath, { recursive: true, force: true })
            }
        } else if (f.endsWith('.js') && f !== 'main.js' && f !== 'agent.js') {
            fs.unlinkSync(fullPath)
        } else if (f.endsWith('.css') && f !== 'main.css' && f !== 'agent-pages.css') {
            fs.unlinkSync(fullPath)
        }
    })

    console.log(
        `✅ Готово: main.js?v=${jsHash}` +
            (agentJsHash ? `, agent.js?v=${agentJsHash}` : '') +
            (mainCssHash ? `, main.css?v=${mainCssHash}` : '') +
            (agentPagesCssHash ? `, agent-pages.css?v=${agentPagesCssHash}` : '')
    )
}

fix()

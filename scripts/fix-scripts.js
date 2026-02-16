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

    if (!fs.existsSync(mainPath)) {
        console.log('❌ Бандл main.js не найден.')
        return
    }

    // Считаем хеши для версионирования
    const jsHash = fileHash(path.join(assetsDir, 'main.js'))
    const cssPath = path.join(assetsDir, 'style.css')
    const cssHash = fs.existsSync(cssPath) ? fileHash(cssPath) : null

    // Правим все HTML
    const htmlFiles = await globby(`${distDir}/**/*.html`)
    for (const file of htmlFiles) {
        let content = fs.readFileSync(file, 'utf8')

        // Удаляем все script-теги, ссылающиеся на JS из папки assets
        content = content.replace(
            /<script[^>]*src="[^"]*assets\/[^"]*\.js[^"]*"[^>]*><\/script>/g,
            ''
        )

        // Добавляем версию к CSS
        if (cssHash) {
            content = content.replace(
                /(<link[^>]*href="[^"]*assets\/style\.css)(")/g,
                `$1?v=${cssHash}$2`,
            )
        }

        // Добавляем единственный скрипт с версией перед закрывающим тегом body
        const cleanScripts = `
    <script type="module" src="${base}assets/main.js?v=${jsHash}"></script>
    </body>`

        content = content.replace('</body>', cleanScripts)

        fs.writeFileSync(file, content)
    }

    // Чистим папку assets от всех JS кроме main.js и удаляем папку astro
    fs.readdirSync(assetsDir).forEach((f) => {
        const fullPath = path.join(assetsDir, f)
        if (fs.lstatSync(fullPath).isDirectory()) {
            if (f === 'astro') {
                fs.rmSync(fullPath, { recursive: true, force: true })
            }
        } else if (f.endsWith('.js') && f !== 'main.js') {
            fs.unlinkSync(fullPath)
        }
    })

    console.log(`✅ Готово: main.js?v=${jsHash}` + (cssHash ? `, style.css?v=${cssHash}` : ''))
}

fix()

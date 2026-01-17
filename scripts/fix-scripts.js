import fs from 'fs'
import path from 'path'
import { globby } from 'globby'

async function fix() {
    const distDir = 'dist'
    const assetsDir = path.join(distDir, 'assets')

    const files = fs.readdirSync(assetsDir)
    const gsapFile = files.find((f) => f.includes('gsap') && f.endsWith('.js'))
    const mainFile = files.find((f) => f.includes('main') && f.endsWith('.js'))

    if (!gsapFile || !mainFile) {
        console.log('❌ Бандлы не найдены.')
        return
    }

    // Переименовываем
    if (gsapFile !== 'gsap.js') {
        if (fs.existsSync(path.join(assetsDir, 'gsap.js')))
            fs.unlinkSync(path.join(assetsDir, 'gsap.js'))
        fs.renameSync(path.join(assetsDir, gsapFile), path.join(assetsDir, 'gsap.js'))
    }
    if (mainFile !== 'main.js') {
        if (fs.existsSync(path.join(assetsDir, 'main.js')))
            fs.unlinkSync(path.join(assetsDir, 'main.js'))
        fs.renameSync(path.join(assetsDir, mainFile), path.join(assetsDir, 'main.js'))
    }

    // Правим все HTML
    const htmlFiles = await globby(`${distDir}/**/*.html`)
    for (const file of htmlFiles) {
        let content = fs.readFileSync(file, 'utf8')

        // Заменяем ЛЮБЫЕ ссылки на JS в папке assets на наши два файла
        content = content.replace(
            /<script[^>]*src="[^"]*assets\/[^"]*gsap[^"]*"[^>]*><\/script>/g,
            ''
        )
        content = content.replace(
            /<script[^>]*src="[^"]*assets\/[^"]*Layout[^"]*"[^>]*><\/script>/g,
            ''
        )
        content = content.replace(
            /<script[^>]*src="[^"]*assets\/[^"]*Footer[^"]*"[^>]*><\/script>/g,
            ''
        )
        content = content.replace(
            /<script[^>]*src="[^"]*assets\/[^"]*main[^"]*"[^>]*><\/script>/g,
            ''
        )

        // Добавляем наши чистые ссылки перед закрывающим тегом body (в футер)
        const base = process.env.GITHUB_ACTIONS ? '/globus/' : '/'
        const cleanScripts = `
    <script type="module" src="${base}assets/gsap.js"></script>
    <script type="module" src="${base}assets/main.js"></script>
    </body>`

        content = content.replace('</body>', cleanScripts)

        // Убираем возможные дубликаты пустых строк
        content = content.replace(/\n\s*\n/g, '\n')

        fs.writeFileSync(file, content)
    }

    // Чистим папку assets от всех JS кроме наших и удаляем папку astro
    fs.readdirSync(assetsDir).forEach((f) => {
        const fullPath = path.join(assetsDir, f)
        if (fs.lstatSync(fullPath).isDirectory()) {
            if (f === 'astro') {
                fs.rmSync(fullPath, { recursive: true, force: true })
            }
        } else if (f.endsWith('.js') && f !== 'gsap.js' && f !== 'main.js') {
            fs.unlinkSync(fullPath)
        }
    })
}

fix()

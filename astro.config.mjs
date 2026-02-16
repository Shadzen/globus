import { defineConfig } from 'astro/config'
import autoprefixer from 'autoprefixer'
import cssnano from 'cssnano'
import { fileURLToPath } from 'url'
import path from 'path'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const isDev = process.env.NODE_ENV !== 'production'

// Интеграция: собираем весь клиентский JS в один файл main.js
function singleChunkIntegration() {
    return {
        name: 'single-chunk',
        hooks: {
            'astro:build:setup': ({ vite, target }) => {
                if (target === 'client') {
                    vite.build ??= {}
                    vite.build.rollupOptions ??= {}
                    vite.build.rollupOptions.output ??= {}
                    const output = Array.isArray(vite.build.rollupOptions.output)
                        ? vite.build.rollupOptions.output[0]
                        : vite.build.rollupOptions.output
                    output.manualChunks = (id) => {
                        if (id.includes('\0')) return
                        if (id.includes('node_modules') || id.includes('src/')) {
                            return 'main'
                        }
                    }
                }
            },
        },
    }
}

// https://astro.build/config
export default defineConfig({
    devToolbar: {
        enabled: false,
    },
    integrations: [singleChunkIntegration()],
    base: process.env.GITHUB_ACTIONS ? '/globus/' : '/',
    compressHTML: false,
    build: {
        inlineStylesheets: 'never',
    },
    vite: {
        resolve: {
            alias: {
                '@': path.resolve(__dirname, './src'),
            },
        },
        css: {
            devSourcemap: true,
            preprocessorOptions: {
                scss: {
                    additionalData: `
                        @use "@/styles/variables.scss" as *;
                        @use "@/styles/mixins.scss" as *;
                    `,
                },
            },
            postcss: {
                plugins: [
                    ...(!isDev ? [autoprefixer(), cssnano()] : []),
                ],
            },
        },
        build: {
            emptyOutDir: true,
            cssCodeSplit: false,
            rollupOptions: {
                output: {
                    // Настраиваем имена для итоговых файлов
                    entryFileNames: 'assets/[name].js',
                    chunkFileNames: 'assets/[name].js',
                    assetFileNames: (assetInfo) => {
                        if (/\.(mp4|webm|ogg|mp3|wav|flac|aac)(\?.*)?$/i.test(assetInfo.name)) {
                            return `assets/media/[name].[ext]`
                        }
                        if (/\.(png|jpe?g|svg|gif|tiff|bmp|ico|webp)(\?.*)?$/i.test(assetInfo.name)) {
                            return `assets/images/[name].[ext]`
                        }
                        if (/\.(woff2?|eot|ttf|otf)(\?.*)?$/i.test(assetInfo.name)) {
                            return `assets/fonts/[name].[ext]`
                        }
                        return `assets/[name].[ext]`
                    },
                },
            },
        },
    },
})

import { defineConfig } from 'astro/config'
import autoprefixer from 'autoprefixer'
import cssnano from 'cssnano'
import { fileURLToPath } from 'url'
import path from 'path'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const isDev = process.env.NODE_ENV !== 'production'

// https://astro.build/config
export default defineConfig({
    devToolbar: {
        enabled: false,
    },
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
                    // Принудительно создаем чанки с нужными именами
                    manualChunks(id) {
                        if (id.includes('node_modules/gsap') || id.includes('src/scripts/gsap.ts')) {
                            return 'gsap'
                        }
                        if (id.includes('src/scripts/main.ts')) {
                            return 'main'
                        }
                    },
                },
            },
        },
    },
})

import { defineConfig } from 'astro/config'
import autoprefixer from 'autoprefixer'
import sortMediaQueries from 'postcss-sort-media-queries'
import cssnano from 'cssnano'
import postcss from 'postcss'
import { fileURLToPath } from 'url'
import path from 'path'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const isDev = process.env.NODE_ENV !== 'production'

// PostCSS plugin: deduplicate conditions in media queries
// @media screen and (max-width:480px) and (max-width:480px) → @media screen and (max-width:480px)
function deduplicateMediaConditions() {
    return {
        postcssPlugin: 'postcss-deduplicate-media-conditions',
        AtRule: {
            media(atRule) {
                const parts = atRule.params.split(/\s+and\s+/)
                const seen = new Set()
                const unique = []
                for (const part of parts) {
                    const normalized = part.trim()
                    if (!seen.has(normalized)) {
                        seen.add(normalized)
                        unique.push(normalized)
                    }
                }
                if (unique.length < parts.length) {
                    atRule.params = unique.join(' and ')
                }
            },
        },
    }
}
deduplicateMediaConditions.postcss = true

// PostCSS plugin: remove impossible media queries
// (min-width:481px) and (max-width:480px) — can never match
function removeImpossibleMediaQueries() {
    return {
        postcssPlugin: 'postcss-remove-impossible-media',
        AtRule: {
            media(atRule) {
                const minMatch = atRule.params.match(/min-width:\s*(\d+)px/)
                const maxMatch = atRule.params.match(/max-width:\s*(\d+)px/)
                if (minMatch && maxMatch) {
                    const minW = parseInt(minMatch[1])
                    const maxW = parseInt(maxMatch[1])
                    if (minW > maxW) {
                        atRule.remove()
                    }
                }
            },
        },
    }
}
removeImpossibleMediaQueries.postcss = true

// Vite plugin: merge duplicate @media in final CSS bundle
// PostCSS runs per-component; this plugin runs on the final bundle
function mergeMediaQueriesPlugin() {
    return {
        name: 'merge-media-queries',
        enforce: 'post',
        async generateBundle(_options, bundle) {
            for (const [filename, asset] of Object.entries(bundle)) {
                if (asset.type === 'asset' && filename.endsWith('.css')) {
                    const result = await postcss([
                        deduplicateMediaConditions(),
                        removeImpossibleMediaQueries(),
                        sortMediaQueries(),
                        cssnano(),
                    ]).process(asset.source, { from: undefined })
                    asset.source = result.css
                }
            }
        },
    }
}

// Vite plugin: bundle all client JS into main.js chunk
// Applied only to client build (not SSR)
function singleChunkPlugin() {
    let isSSR = false
    return {
        name: 'single-chunk',
        configResolved(config) {
            isSSR = !!config.build.ssr
        },
        outputOptions(options) {
            if (!isSSR) {
                options.manualChunks = (id) => {
                    if (id.includes('\0') || id.includes('?')) return
                    // Agent pages: separate chunk so other domain gets only header/menu logic
                    if (id.includes('src/scripts/agent-main') || id.includes('src/scripts/main/header')) return 'agent'
                    if (id.includes('src/scripts/')) return 'main'
                    if (
                        id.includes('node_modules/swiper') ||
                        id.includes('node_modules/gsap') ||
                        id.includes('node_modules/flatpickr') ||
                        id.includes('node_modules/photoswipe')
                    ) {
                        return 'main'
                    }
                }
            }
            return options
        },
    }
}

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
        plugins: [singleChunkPlugin(), ...(!isDev ? [mergeMediaQueriesPlugin()] : [])],
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
                    ...(!isDev ? [autoprefixer(), deduplicateMediaConditions()] : []),
                ],
            },
        },
        build: {
            emptyOutDir: true,
            // true: agent pages (AgentLayout) get a separate CSS chunk for use on another domain
            cssCodeSplit: true,
            rollupOptions: {
                onwarn(warning, warn) {
                    // Unused imports inside Astro package — cosmetic, not our code
                    if (
                        warning.code === 'UNUSED_EXTERNAL_IMPORT' &&
                        String(warning.exporter || '').includes('@astrojs/internal-helpers/remote')
                    ) {
                        return
                    }
                    warn(warning)
                },
                output: {
                    // Output file names
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

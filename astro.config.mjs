import { defineConfig } from 'astro/config'
import autoprefixer from 'autoprefixer'
import cssnano from 'cssnano'
import { fileURLToPath } from 'url'
import path from 'path'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const isDev = process.env.NODE_ENV !== 'production'

// https://astro.build/config
export default defineConfig({
  base: !isDev ? '/globus/' : '/',
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
            cssCodeSplit: false,
            rollupOptions: {
                output: {
                    // Настраиваем имена для итоговых файлов
                    entryFileNames: 'assets/[name].js',
                    chunkFileNames: 'assets/[name].js',
                    assetFileNames: 'assets/[name].[ext]',
                    // Принудительно создаем чанки с нужными именами
                    manualChunks(id) {
                        if (
                            id.includes('node_modules/gsap') ||
                            id.includes('src/scripts/gsap.ts')
                        ) {
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

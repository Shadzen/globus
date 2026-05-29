import path from 'path'
import { fileURLToPath } from 'url'
import parent from '../../astro.config.mjs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(__dirname, '../..')
const mainSrc = path.join(root, 'src')

/** Agent-only build: pages live in agent-shell/src, components/layouts via @ -> main src */
export default {
    ...parent,
    root,
    srcDir: path.join(__dirname, 'src'),
    vite: {
        ...parent.vite,
        resolve: {
            ...parent.vite?.resolve,
            alias: {
                ...parent.vite?.resolve?.alias,
                '@': mainSrc,
            },
        },
    },
}

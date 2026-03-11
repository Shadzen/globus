import Swiper from 'swiper'
import { Navigation } from 'swiper/modules'

// Extend Window for TS
declare global {
    interface Window {
        Swiper: typeof Swiper
    }
}

// Expose Swiper on window for global use
if (typeof window !== 'undefined') {
    window.Swiper = Swiper
    // @ts-expect-error - Swiper is not on globalThis by default
    globalThis.Swiper = Swiper
}

export { Swiper, Navigation }

import Swiper from 'swiper'
import { Navigation } from 'swiper/modules'

// Расширяем Window для TS
declare global {
    interface Window {
        Swiper: typeof Swiper
    }
}

// Инициализация Swiper в глобальной области
if (typeof window !== 'undefined') {
    window.Swiper = Swiper
    // @ts-expect-error - Swiper is not on globalThis by default
    globalThis.Swiper = Swiper
}

export { Swiper, Navigation }

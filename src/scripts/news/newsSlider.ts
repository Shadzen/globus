// src/scripts/news/newsSlider.ts
import { initSlider } from '../swiperHelpers'

export const initNewsSlider = () => {
    return initSlider({
        containerSelector: '.news-slider-wrapper',
        parentSelector: '.news-slider-section',
        // spaceBetweenDesktop: 45,
        // spaceBetweenMobile: 16,
    })
}

// src/scripts/news/newsSlider.ts
import { initSlider } from '../swiperHelpers'

export const initNewsSlider = () => {
    return initSlider({
        containerSelector: '.cards-bottom-grid-wrapper',
        parentSelector: '.news-slider-section',
    })
}

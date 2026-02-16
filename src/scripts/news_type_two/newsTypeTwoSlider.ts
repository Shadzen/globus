// src/scripts/news/newsTypeTwoSlider.ts.ts
import { initSlider } from '../swiperHelpers'

export const initNewsTypeTwoSlider = () => {
    return initSlider({
        containerSelector: '.hotels-slider-wrapper',
        parentSelector: '.news-hotels-section',
    })
}

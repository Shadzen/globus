// src/scripts/main/globusNews.ts
import { initSlider } from '../swiperHelpers'

export const initGlobusNews = () => {
    return initSlider({
        containerSelector: '.cards-bottom-grid-wrapper',
        parentSelector: '.globus-news',
    })
}

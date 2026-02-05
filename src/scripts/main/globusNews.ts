// src/scripts/main/globusNews.ts
import { initSlider } from '../swiperHelpers'

export const initGlobusNews = () => {
    return initSlider({
        containerSelector: '.news-bottom-grid-wrapper',
        parentSelector: '.globus-news',
    })
}

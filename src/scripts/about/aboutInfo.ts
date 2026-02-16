// src/scripts/about/aboutInfo.ts
import { initSlider } from '../swiperHelpers'

export const initAboutInfo = () => {
    return initSlider({
        containerSelector: '.cards-bottom-grid-wrapper',
        parentSelector: '.about-info',
    })
}

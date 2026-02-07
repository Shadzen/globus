// src/scripts/about/aboutInfo.ts
import { initSlider } from '../swiperHelpers'

export const initAboutInfo = () => {
    return initSlider({
        containerSelector: '.team-grid-wrapper',
        parentSelector: '.about-info',
    })
}

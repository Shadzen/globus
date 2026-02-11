// src/scripts/business_tourism/companiesSlider.ts
import { initSlider } from '../swiperHelpers'

export const initCompaniesSlider = () => {
    return initSlider({
        containerSelector: '.companies-slider-wrapper',
        parentSelector: '.mice-companies-section',
    })
}

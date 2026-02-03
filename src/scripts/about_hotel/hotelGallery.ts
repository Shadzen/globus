// src/scripts/about_hotel/hotelGallery.ts
import { Swiper } from '../swiper'
import { adaptive } from '../utils'

export const initHotelGallery = () => {
    const swiperContainer = document.querySelector('.hotel-gallery')

    if (!swiperContainer) return

    const getSpaceBetween = () => adaptive(16, 16)
    const getSlidesOffset = () => adaptive(100, 15)

    const swiper = new Swiper('.hotel-gallery', {
        slidesPerView: 'auto',
        spaceBetween: getSpaceBetween(),
        slidesOffsetBefore: getSlidesOffset(),
        slidesOffsetAfter: getSlidesOffset(),
        grabCursor: true,
    })

    let resizeTimeout: NodeJS.Timeout
    window.addEventListener('resize', () => {
        if (swiper.destroyed) return
        clearTimeout(resizeTimeout)
        resizeTimeout = setTimeout(() => {
            if (swiper.destroyed) return
            const newSpaceBetween = getSpaceBetween()
            const newSlidesOffset = getSlidesOffset()
            swiper.params.spaceBetween = newSpaceBetween
            swiper.params.slidesOffsetBefore = newSlidesOffset
            swiper.params.slidesOffsetAfter = newSlidesOffset

            swiper.update()
        }, 150)
    })

    return swiper
}

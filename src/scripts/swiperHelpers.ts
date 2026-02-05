// src/scripts/swiperHelpers.ts
import { Swiper, Navigation } from './swiper'
import { adaptive } from './utils'

interface InitSliderOptions {
    containerSelector: string
    parentSelector: string
    spaceBetweenDesktop?: number
    spaceBetweenMobile?: number
    slidesOffsetDesktop?: number
    slidesOffsetMobile?: number
}

export const initSlider = ({
    containerSelector,
    parentSelector,
    spaceBetweenDesktop = 16,
    spaceBetweenMobile = 15,
    slidesOffsetDesktop = 100,
    slidesOffsetMobile = 15,
}: InitSliderOptions) => {
    const swiperContainer = document.querySelector(containerSelector)

    if (!swiperContainer) return

    const prevButton = document.querySelector(`${parentSelector} .nav-btn-prev`) as HTMLElement
    const nextButton = document.querySelector(`${parentSelector} .nav-btn-next`) as HTMLElement

    const getSpaceBetween = () => adaptive(spaceBetweenDesktop, spaceBetweenMobile)
    const getSlidesOffset = () => adaptive(slidesOffsetDesktop, slidesOffsetMobile)

    const swiper = new Swiper(containerSelector, {
        modules: [Navigation],
        slidesPerView: 'auto',
        spaceBetween: getSpaceBetween(),
        slidesOffsetBefore: getSlidesOffset(),
        slidesOffsetAfter: getSlidesOffset(),
        grabCursor: true,
        navigation: {
            nextEl: nextButton,
            prevEl: prevButton,
            disabledClass: 'nav-btn-disabled',
        },
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

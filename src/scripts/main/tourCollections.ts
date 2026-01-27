// src/scripts/main/tourCollections.ts
import { Swiper, Navigation } from '../swiper'
import { adaptive, BREAKPOINTS } from '../utils'

export const initTourCollections = () => {
    const swiperContainer = document.querySelector('.collections-grid-wrapper')

    if (!swiperContainer) return

    const prevButton = document.querySelector('.tour-collections .nav-btn-prev') as HTMLElement
    const nextButton = document.querySelector('.tour-collections .nav-btn-next') as HTMLElement

    const getSpaceBetween = () => adaptive(34, 28)
    const getSlidesOffset = () => adaptive(100, 15)

    const swiper = new Swiper('.collections-grid-wrapper', {
        modules: [Navigation],
        slidesPerView: 'auto',
        spaceBetween: getSpaceBetween(),
        slidesOffsetBefore: 0,
        slidesOffsetAfter: 0,
        centeredSlides: true,
        centeredSlidesBounds: false,
        centerInsufficientSlides: true,
        grabCursor: true,
        navigation: {
            nextEl: nextButton,
            prevEl: prevButton,
            disabledClass: 'nav-btn-disabled',
        },
        breakpoints: {
            481: {
                slidesPerView: 5.15,
                spaceBetween: getSpaceBetween(),
                slidesOffsetBefore: getSlidesOffset(),
                slidesOffsetAfter: getSlidesOffset(),
                centeredSlides: false,
                centeredSlidesBounds: false,
                centerInsufficientSlides: false,
                allowTouchMove: true,
            },
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
            const isMobile = window.innerWidth <= BREAKPOINTS.mobile
            swiper.params.spaceBetween = newSpaceBetween
            swiper.params.slidesOffsetBefore = isMobile ? 0 : newSlidesOffset
            swiper.params.slidesOffsetAfter = isMobile ? 0 : newSlidesOffset
            if (swiper.params.breakpoints) {
                swiper.params.breakpoints[481].spaceBetween = newSpaceBetween
                swiper.params.breakpoints[481].slidesOffsetBefore = newSlidesOffset
                swiper.params.breakpoints[481].slidesOffsetAfter = newSlidesOffset
            }
            swiper.update()
        }, 150)
    })

    return swiper
}

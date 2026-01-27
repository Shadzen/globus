// src/scripts/main/globusNews.ts
import { Swiper, Navigation } from '../swiper'
import { adaptive } from '../utils'

export const initGlobusNews = () => {
    const swiperContainer = document.querySelector('.news-bottom-grid-wrapper')

    if (!swiperContainer) return

    const prevButton = document.querySelector('.globus-news .nav-btn-prev') as HTMLElement
    const nextButton = document.querySelector('.globus-news .nav-btn-next') as HTMLElement

    const getSpaceBetween = () => adaptive(16, 15)
    const getSlidesOffset = () => adaptive(100, 15)

    const swiper = new Swiper('.news-bottom-grid-wrapper', {
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

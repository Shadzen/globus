// src/scripts/swiperHelpers.ts
import type { Swiper as SwiperInstance } from 'swiper'
import { Swiper, Navigation } from './swiper'
import { adaptive } from './utils'

interface InitSliderOptions {
    containerSelector: string
    // When set, only containers inside these roots. When omitted, every matching container on the page (nav: preceding sibling with buttons, else first nav inside parentElement).
    parentSelector?: string
    spaceBetweenDesktop?: number
    spaceBetweenMobile?: number
    slidesOffsetDesktop?: number
    slidesOffsetMobile?: number
}

const navButtonDescendantSelector = (
    parentSelector: string,
    navClass: 'nav-btn-prev' | 'nav-btn-next',
) => {
    const s = parentSelector.trim()
    if (s.includes(',')) {
        return `:is(${s}) .${navClass}`
    }
    return `${s} .${navClass}`
}

const getNavButtonsForSwiperContainer = (
    swiperContainer: HTMLElement,
    parent: Element,
): { prev: HTMLElement | null, next: HTMLElement | null } => {
    let el: Element | null = swiperContainer.previousElementSibling
    while (el) {
        const prevBtn = el.querySelector('.nav-btn-prev')
        const nextBtn = el.querySelector('.nav-btn-next')
        if (prevBtn instanceof HTMLElement && nextBtn instanceof HTMLElement) {
            return { prev: prevBtn, next: nextBtn }
        }
        el = el.previousElementSibling
    }

    return {
        prev: parent.querySelector('.nav-btn-prev') as HTMLElement | null,
        next: parent.querySelector('.nav-btn-next') as HTMLElement | null,
    }
}

export const initSlider = ({
    containerSelector,
    parentSelector,
    spaceBetweenDesktop = 16,
    spaceBetweenMobile = 15,
    slidesOffsetDesktop = 100,
    slidesOffsetMobile = 15,
}: InitSliderOptions): SwiperInstance[] => {
    const swipers: SwiperInstance[] = []
    const scopeParents = parentSelector?.trim() ?? ''

    const getSpaceBetween = () => adaptive(spaceBetweenDesktop, spaceBetweenMobile)
    const getSlidesOffset = () => adaptive(slidesOffsetDesktop, slidesOffsetMobile)

    const attachResize = (swiper: SwiperInstance) => {
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
    }

    const createSwiper = (
        el: HTMLElement,
        prevButton: HTMLElement | null,
        nextButton: HTMLElement | null,
    ) => {
        if (el.classList.contains('swiper-initialized')) {
            return
        }

        const swiper = new Swiper(el, {
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

        attachResize(swiper)
        swipers.push(swiper)
    }

    if (!scopeParents) {
        document.querySelectorAll(containerSelector).forEach((node) => {
            if (!(node instanceof HTMLElement)) return
            const scope = node.parentElement
            if (!scope) return

            const { prev: prevButton, next: nextButton } = getNavButtonsForSwiperContainer(
                node,
                scope,
            )

            createSwiper(node, prevButton, nextButton)
        })
        return swipers
    }

    const parents = document.querySelectorAll(scopeParents)
    if (parents.length > 0) {
        parents.forEach((parent) => {
            const containers = parent.querySelectorAll(containerSelector)
            containers.forEach((node) => {
                if (!(node instanceof HTMLElement)) return

                const { prev: prevButton, next: nextButton } = getNavButtonsForSwiperContainer(
                    node,
                    parent,
                )

                createSwiper(node, prevButton, nextButton)
            })
        })
    } else {
        const swiperContainer = document.querySelector(containerSelector)
        if (!swiperContainer || !(swiperContainer instanceof HTMLElement)) {
            return swipers
        }

        const prevButton = document.querySelector(
            navButtonDescendantSelector(scopeParents, 'nav-btn-prev'),
        ) as HTMLElement | null
        const nextButton = document.querySelector(
            navButtonDescendantSelector(scopeParents, 'nav-btn-next'),
        ) as HTMLElement | null

        createSwiper(swiperContainer, prevButton, nextButton)
    }

    return swipers
}

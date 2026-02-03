// src/scripts/about_hotel/hotelGallery.ts
import { Swiper } from '../swiper'
import { adaptive } from '../utils'
import PhotoSwipeLightbox from 'photoswipe/lightbox'
import PhotoSwipe from 'photoswipe'

interface GalleryImage {
    thumbnail: string
    full: string
    width: number
    height: number
    alt: string
}

export const initHotelGallery = () => {
    const swiperContainer = document.querySelector('.about-hotel-gallery') as HTMLElement

    if (!swiperContainer) return

    // Получаем данные галереи из data-атрибута
    const galleryData: GalleryImage[] = JSON.parse(swiperContainer.dataset.gallery || '[]')

    const getSpaceBetween = () => adaptive(16, 16)
    const getSlidesOffset = () => adaptive(100, 15)

    // Инициализация Swiper
    const swiper = new Swiper('.about-hotel-gallery', {
        slidesPerView: 'auto',
        spaceBetween: getSpaceBetween(),
        slidesOffsetBefore: getSlidesOffset(),
        slidesOffsetAfter: getSlidesOffset(),
        grabCursor: true,
    })

    // Инициализация PhotoSwipe
    const lightbox = new PhotoSwipeLightbox({
        dataSource: galleryData.map((img) => ({
            src: img.full,
            width: img.width,
            height: img.height,
            alt: img.alt,
        })),
        pswpModule: PhotoSwipe,
        preload: [1, 2],
    })

    lightbox.init()

    // Обработка кликов на слайды
    const galleryItems = document.querySelectorAll('.about-hotel-gallery .about-hotel-gallery-item')
    galleryItems.forEach((item) => {
        item.addEventListener('click', (e) => {
            e.preventDefault()
            const index = parseInt((item as HTMLElement).dataset.index || '0', 10)
            const isAllPhotos = item.classList.contains('about-hotel-gallery-item-all')

            if (isAllPhotos) {
                lightbox.loadAndOpen(0)
            } else {
                lightbox.loadAndOpen(index)
            }
        })
    })

    // Адаптивность Swiper при ресайзе
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

    return { swiper, lightbox }
}

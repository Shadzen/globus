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

    // Получаем элементы модального окна
    const galleryModal = document.getElementById('galleryModal')
    const modalOverlay = galleryModal?.querySelector('.gallery-modal-overlay')
    const modalContent = galleryModal?.querySelector('.gallery-modal-content')
    const modalClose = galleryModal?.querySelector('.gallery-modal-close')
    const modalItems = galleryModal?.querySelectorAll('.gallery-modal-item')

    // Функция открытия модального окна
    const openModal = () => {
        if (!galleryModal) return
        galleryModal.classList.add('is-active')
        document.body.style.overflow = 'hidden'
    }

    // Функция закрытия модального окна
    const closeModal = () => {
        if (!galleryModal) return
        galleryModal.classList.remove('is-active')
        document.body.style.overflow = ''
    }

    // Обработка кликов на слайды в превью
    const galleryItems = document.querySelectorAll('.about-hotel-gallery .about-hotel-gallery-item')
    galleryItems.forEach((item) => {
        item.addEventListener('click', (e) => {
            e.preventDefault()
            const index = parseInt((item as HTMLElement).dataset.index || '0', 10)
            const isAllPhotos = item.classList.contains('about-hotel-gallery-item-all')

            if (isAllPhotos) {
                // Открываем модальное окно со всеми превьюшками
                openModal()
            } else {
                // Открываем PhotoSwipe сразу
                lightbox.loadAndOpen(index)
            }
        })
    })

    // Обработка кликов на превьюшки в модальном окне
    modalItems?.forEach((item) => {
        item.addEventListener('click', () => {
            const index = parseInt((item as HTMLElement).dataset.index || '0', 10)
            closeModal()
            // Небольшая задержка для плавности
            setTimeout(() => {
                lightbox.loadAndOpen(index)
            }, 100)
        })
    })

    // Закрытие модального окна
    modalOverlay?.addEventListener('click', closeModal)
    modalClose?.addEventListener('click', closeModal)

    // Закрытие при клике на пустое место (не на превьюшки)
    modalContent?.addEventListener('click', (e) => {
        if (e.target === modalContent) {
            closeModal()
        }
    })

    // Закрытие по ESC
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && galleryModal?.classList.contains('is-active')) {
            closeModal()
        }
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

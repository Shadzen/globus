// src/scripts/best_hotels/bestHotels.ts
import { initSlider } from '../swiperHelpers'

const initHotelSlider = () => {
    return initSlider({
        containerSelector: '.hotels-slider-wrapper',
        parentSelector: '.best-hotels',
        spaceBetweenDesktop: 16,
        spaceBetweenMobile: 12,
    })
}

const initHotelSearchForm = () => {
    const starButtons = document.querySelectorAll('.star-btn')
    const ratingInput = document.getElementById('rating-input') as HTMLInputElement

    if (!starButtons.length || !ratingInput) return

    const updateStars = (rating: number) => {
        starButtons.forEach((btn, index) => {
            const img = btn.querySelector('img')
            if (!img) return

            const starNumber = index + 1
            const accentSrc = img.src.includes('star-alt-accent')
                ? img.src
                : img.src.replace('star-alt-white', 'star-alt-accent')
            const whiteSrc = img.src.includes('star-alt-white')
                ? img.src
                : img.src.replace('star-alt-accent', 'star-alt-white')

            if (starNumber <= rating) {
                img.src = accentSrc
            } else {
                img.src = whiteSrc
            }
        })
    }

    starButtons.forEach((btn) => {
        btn.addEventListener('click', () => {
            const rating = parseInt(btn.getAttribute('data-rating') || '0')
            ratingInput.value = rating.toString()
            updateStars(rating)
        })
    })

    // Инициализация с текущим значением
    const initialRating = parseInt(ratingInput.value || '4')
    updateStars(initialRating)
}

export const initBestHotels = () => {
    initHotelSlider()
    initHotelSearchForm()
}

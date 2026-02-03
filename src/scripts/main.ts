// src/scripts/main.ts
import './swiper'
import { initCards } from './main/cards'
import { initAboutPage } from './main/about'
import { initHeader } from './main/header'
import { initSearchForm } from './main/searchForm'
import { initTourCollections } from './main/tourCollections'
import { initGlobusNews } from './main/globusNews'
import { initHotelGallery } from './about_hotel/hotelGallery'

// Запуск при загрузке страницы
const initAll = () => {
    initHeader()
    initCards()
    initAboutPage()
    initSearchForm()
    initTourCollections()
    initGlobusNews()
    initHotelGallery()
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAll)
} else {
    initAll()
}

// Поддержка переходов Astro (View Transitions)
document.addEventListener('astro:after-swap', initAll)

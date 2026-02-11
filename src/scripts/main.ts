// src/scripts/main.ts
import './swiper'
import { initCards } from './main/cards'
import { initAboutPage } from './main/about'
import { initHeader } from './main/header'
import { initSearchForm } from './main/searchForm'
import { initTourCollections } from './main/tourCollections'
import { initGlobusNews } from './main/globusNews'
import { initHotelGallery } from './about_hotel/hotelGallery'
import { initBestHotels } from './best_hotels/bestHotels'
import { initAboutInfo } from './about/aboutInfo'
import { initAboutTimeline } from './about/aboutTimeline'
import { initAboutMap } from './about/aboutMap'
import { initNewsSlider } from './news/newsSlider'
import { initCompaniesSlider } from './mice/companiesSlider'
import { initAccordion } from './common/accordion'

// Запуск при загрузке страницы
const initAll = () => {
    initHeader()
    initCards()
    initAboutPage()
    initSearchForm()
    initTourCollections()
    initGlobusNews()
    initHotelGallery()
    initBestHotels()
    initAboutInfo()
    initAboutTimeline()
    initAboutMap()
    initNewsSlider()
    initCompaniesSlider()
    initAccordion()
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAll)
} else {
    initAll()
}

// Поддержка переходов Astro (View Transitions)
document.addEventListener('astro:after-swap', initAll)

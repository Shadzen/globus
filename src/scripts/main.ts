// src/scripts/main.ts
import './swiper'
import { initHeader } from './main/header'
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
import { initModal } from './common/modal'
import { initDataPswpLightbox } from './common/dataPswpLightbox'

const initAll = () => {
    initHeader()
    initModal()
    initDataPswpLightbox()
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

document.addEventListener('astro:after-swap', initAll)

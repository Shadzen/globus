// src/scripts/main.ts
import './swiper'
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
import { initNewsTypeTwoSlider } from './news_type_two/newsTypeTwoSlider'
import { initCompaniesSlider } from './mice/companiesSlider'
import { initAccordion } from './common/accordion'

const initAll = () => {
    initHeader()
    initSearchForm()
    initTourCollections()
    initGlobusNews()
    initHotelGallery()
    initBestHotels()
    initAboutInfo()
    initAboutTimeline()
    initAboutMap()
    initNewsSlider()
    initNewsTypeTwoSlider()
    initCompaniesSlider()
    initAccordion()
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAll)
} else {
    initAll()
}

document.addEventListener('astro:after-swap', initAll)

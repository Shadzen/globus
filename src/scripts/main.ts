// src/scripts/main.ts
import { initCards } from './main/cards'
import { initAboutPage } from './main/about'
import { initHeader } from './main/header'

// Запуск при загрузке страницы
const initAll = () => {
    initHeader()
    initCards()
    initAboutPage()
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAll)
} else {
    initAll()
}

// Поддержка переходов Astro (View Transitions)
document.addEventListener('astro:after-swap', initAll)

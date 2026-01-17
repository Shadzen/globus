// src/scripts/main.ts
import { initCards } from './main/cards'
import { initAboutPage } from './main/about'

// Запуск при загрузке страницы
const initAll = () => {
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

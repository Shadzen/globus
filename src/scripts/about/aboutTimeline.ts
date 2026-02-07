// src/scripts/about/aboutTimeline.ts

export const initAboutTimeline = () => {
    const container = document.querySelector('.about-timeline')
    if (!container) return

    const slides = container.querySelectorAll('.timeline-slide')
    const navDesktop = container.querySelector('.timeline-nav-desktop')
    if (!navDesktop) return

    // Создаём десктопные кнопки динамически на основе слайдов
    slides.forEach((slide, index) => {
        // Клонируем мобильную кнопку
        const mobileBtn = slide.querySelector('.timeline-dot')
        if (!mobileBtn) return

        const button = mobileBtn.cloneNode(true) as HTMLElement
        if (index === 0) button.classList.add('_active')

        navDesktop.appendChild(button)
    })

    const switchSlide = (index: number) => {
        // Удаляем активный класс со всех точек и слайдов
        const dotsDesktop = container.querySelectorAll('.timeline-nav-desktop .timeline-dot')
        const dotsMobile = container.querySelectorAll('.timeline-slide .timeline-dot')

        dotsDesktop.forEach((dot) => dot.classList.remove('_active'))
        dotsMobile.forEach((dot) => dot.classList.remove('_active'))
        slides.forEach((slide) => slide.classList.remove('_active'))

        // Добавляем активный класс к выбранным элементам
        dotsDesktop[index]?.classList.add('_active')
        dotsMobile[index]?.classList.add('_active')
        slides[index]?.classList.add('_active')
    }

    // Обработчики клика на десктопные точки (динамически созданные)
    const dotsDesktop = container.querySelectorAll('.timeline-nav-desktop .timeline-dot')
    dotsDesktop.forEach((dot, index) => {
        dot.addEventListener('click', () => {
            switchSlide(index)
        })
    })

    // Обработчики клика на мобильные точки
    const dotsMobile = container.querySelectorAll('.timeline-slide .timeline-dot')
    dotsMobile.forEach((dot, index) => {
        dot.addEventListener('click', () => {
            switchSlide(index)
        })
    })
}

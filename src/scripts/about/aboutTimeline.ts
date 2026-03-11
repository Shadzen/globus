// src/scripts/about/aboutTimeline.ts

export const initAboutTimeline = () => {
    const container = document.querySelector('.about-timeline')
    if (!container) return

    const slides = container.querySelectorAll('.timeline-slide')
    const navDesktop = container.querySelector('.timeline-nav-desktop')
    if (!navDesktop) return

    // Create desktop buttons dynamically from slides
    slides.forEach((slide, index) => {
        // Clone mobile button
        const mobileBtn = slide.querySelector('.timeline-dot')
        if (!mobileBtn) return

        const button = mobileBtn.cloneNode(true) as HTMLElement
        if (index === 0) button.classList.add('_active')

        navDesktop.appendChild(button)
    })

    const switchSlide = (index: number) => {
        // Remove active class from all dots and slides
        const dotsDesktop = container.querySelectorAll('.timeline-nav-desktop .timeline-dot')
        const dotsMobile = container.querySelectorAll('.timeline-slide .timeline-dot')

        dotsDesktop.forEach((dot) => dot.classList.remove('_active'))
        dotsMobile.forEach((dot) => dot.classList.remove('_active'))
        slides.forEach((slide) => slide.classList.remove('_active'))

        // Add active class to selected elements
        dotsDesktop[index]?.classList.add('_active')
        dotsMobile[index]?.classList.add('_active')
        slides[index]?.classList.add('_active')
    }

    // Click handlers for desktop dots (dynamically created)
    const dotsDesktop = container.querySelectorAll('.timeline-nav-desktop .timeline-dot')
    dotsDesktop.forEach((dot, index) => {
        dot.addEventListener('click', () => {
            switchSlide(index)
        })
    })

    // Click handlers for mobile dots
    const dotsMobile = container.querySelectorAll('.timeline-slide .timeline-dot')
    dotsMobile.forEach((dot, index) => {
        dot.addEventListener('click', () => {
            switchSlide(index)
        })
    })
}

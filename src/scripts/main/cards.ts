// src/scripts/main/cards.ts

export const initCards = () => {
    const cards = document.querySelectorAll('.card')
    cards.forEach((card) => {
        card.addEventListener('mouseenter', () => {
            if (window.gsap) {
                window.gsap.to(card, {
                    scale: 1.05,
                    duration: 0.4,
                    ease: 'back.out(1.7)',
                    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
                })
            }
        })
        card.addEventListener('mouseleave', () => {
            if (window.gsap) {
                window.gsap.to(card, {
                    scale: 1,
                    duration: 0.2,
                    ease: 'power2.in',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                })
            }
        })
    })
}

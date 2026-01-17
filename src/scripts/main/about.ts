// src/scripts/main/about.ts

export const initAboutPage = () => {
    const button = document.getElementById('alertButton')
    if (button) {
        button.addEventListener('click', () => {
            if (window.gsap) {
                const gsap = window.gsap
                gsap.to(button, {
                    rotation: 360,
                    duration: 0.5,
                    ease: 'back.inOut',
                    onComplete: () => {
                        alert('GSAP анимация завершена!')
                        gsap.set(button, { rotation: 0 })
                    },
                })
            } else {
                console.warn('GSAP еще не загружен')
                alert('Кнопка нажата, но GSAP не найден')
            }
        })
    }
}

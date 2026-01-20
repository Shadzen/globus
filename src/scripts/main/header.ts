// src/scripts/main/header.ts

export const initHeader = () => {
    // User type buttons
    const userTypeBtns = document.querySelectorAll('.user-type-btn')
    
    userTypeBtns.forEach((btn) => {
        btn.addEventListener('click', () => {
            userTypeBtns.forEach((b) => b.classList.remove('active'))
            btn.classList.add('active')
        })
    })

    // Dots button (можно добавить функционал позже)
    const dotsBtn = document.querySelector('.dots-btn')
    if (dotsBtn) {
        dotsBtn.addEventListener('click', () => {
            // Placeholder для будущего функционала
            console.log('Dots button clicked')
        })
    }
}

// src/scripts/main/header.ts

export const initHeader = () => {
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn')
    const headerActions = document.querySelector('.header-actions')

    if (mobileMenuBtn && headerActions) {
        mobileMenuBtn.addEventListener('click', () => {
            // Добавляем класс, что кнопка использовалась (для включения анимации)
            mobileMenuBtn.classList.add('_initialized')
            
            mobileMenuBtn.classList.toggle('_active')
            headerActions.classList.toggle('_active')
            
            // Используем существующий класс для блокировки скролла
            document.body.classList.toggle('_disable-scrolling')
        })

        // Закрытие меню при клике на ссылку
        const menuLinks = headerActions.querySelectorAll('a')
        menuLinks.forEach((link) => {
            link.addEventListener('click', () => {
                mobileMenuBtn.classList.remove('_active')
                headerActions.classList.remove('_active')
                document.body.classList.remove('_disable-scrolling')
            })
        })
    }
}

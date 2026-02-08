// src/scripts/main/header.ts

export const initHeader = () => {
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn')
    const headerActions = document.querySelector('.header-actions')
    const logoWrapper = document.querySelector('.logo-wrapper')

    if (mobileMenuBtn && headerActions) {
        mobileMenuBtn.addEventListener('click', () => {
            // Добавляем класс, что кнопка использовалась (для включения анимации)
            mobileMenuBtn.classList.add('_initialized')
            
            const isActive = mobileMenuBtn.classList.contains('_active')
            
            mobileMenuBtn.classList.toggle('_active')
            headerActions.classList.toggle('_active')
            
            // Используем существующий класс для блокировки скролла
            document.body.classList.toggle('_disable-scrolling')

            // Переключение логотипа для мобильного меню
            if (logoWrapper) {
                if (!isActive) {
                    // Открываем меню - сохраняем оригинальный цвет и переключаем на светлый
                    if (!logoWrapper.hasAttribute('data-original-color')) {
                        const currentColor = logoWrapper.classList.contains('_dark') ? 'dark' : 'light'
                        logoWrapper.setAttribute('data-original-color', currentColor)
                    }
                    logoWrapper.classList.remove('_dark')
                    logoWrapper.classList.add('_light')
                } else {
                    // Закрываем меню - возвращаем исходный цвет
                    if (logoWrapper.hasAttribute('data-original-color')) {
                        const originalColor = logoWrapper.getAttribute('data-original-color')
                        logoWrapper.classList.remove('_light', '_dark')
                        if (originalColor) {
                            logoWrapper.classList.add(`_${originalColor}`)
                        }
                    }
                }
            }
        })

        // Закрытие меню при клике на ссылку
        const menuLinks = headerActions.querySelectorAll('a')
        menuLinks.forEach((link) => {
            link.addEventListener('click', () => {
                mobileMenuBtn.classList.remove('_active')
                headerActions.classList.remove('_active')
                document.body.classList.remove('_disable-scrolling')

                // Возвращаем оригинальный цвет логотипа
                if (logoWrapper && logoWrapper.hasAttribute('data-original-color')) {
                    const originalColor = logoWrapper.getAttribute('data-original-color')
                    logoWrapper.classList.remove('_light', '_dark')
                    if (originalColor) {
                        logoWrapper.classList.add(`_${originalColor}`)
                    }
                }
            })
        })
    }
}

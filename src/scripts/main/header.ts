// src/scripts/main/header.ts

export const initHeader = () => {
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn')
    const headerActions = document.querySelector('.header-actions')
    const logoWrapper = document.querySelector('.logo-wrapper')

    if (mobileMenuBtn && headerActions) {
        mobileMenuBtn.addEventListener('click', () => {
            // Mark button as used (enables animation)
            mobileMenuBtn.classList.add('_initialized')
            
            const isActive = mobileMenuBtn.classList.contains('_active')
            
            mobileMenuBtn.classList.toggle('_active')
            headerActions.classList.toggle('_active')
            
            // Use existing class to lock scroll
            document.body.classList.toggle('_disable-scrolling')

            // Toggle logo for mobile menu
            if (logoWrapper) {
                if (!isActive) {
                    // Open menu — save original color and switch to light
                    if (!logoWrapper.hasAttribute('data-original-color')) {
                        const currentColor = logoWrapper.classList.contains('_dark') ? 'dark' : 'light'
                        logoWrapper.setAttribute('data-original-color', currentColor)
                    }
                    logoWrapper.classList.remove('_dark')
                    logoWrapper.classList.add('_light')
                } else {
                    // Close menu — restore original color
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

        // Close menu on link click
        const menuLinks = headerActions.querySelectorAll('a')
        menuLinks.forEach((link) => {
            link.addEventListener('click', () => {
                mobileMenuBtn.classList.remove('_active')
                headerActions.classList.remove('_active')
                document.body.classList.remove('_disable-scrolling')

                // Restore original logo color
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

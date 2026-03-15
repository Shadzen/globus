// src/scripts/main/header.ts

const SCROLL_THRESHOLD = 50

function updateHeaderScrolled(header: Element, scrolled: boolean) {
    if (scrolled) {
        header.classList.add('_scrolled')
    } else {
        header.classList.remove('_scrolled')
    }
}

export const initHeader = () => {
    const header = document.querySelector('header')
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn')
    const headerActionsWrapper = document.querySelector('.header-actions-wrapper')
    const logoWrapper = document.querySelector('.logo-wrapper')

    if (header) {
        let ticking = false
        const onScroll = () => {
            if (!ticking) {
                requestAnimationFrame(() => {
                    updateHeaderScrolled(header, window.scrollY > SCROLL_THRESHOLD)
                    ticking = false
                })
                ticking = true
            }
        }
        window.addEventListener('scroll', onScroll, { passive: true })
        updateHeaderScrolled(header, window.scrollY > SCROLL_THRESHOLD)
    }

    if (mobileMenuBtn && headerActionsWrapper) {
        mobileMenuBtn.addEventListener('click', () => {
            // Mark button as used (enables animation)
            mobileMenuBtn.classList.add('_initialized')

            const isActive = mobileMenuBtn.classList.contains('_active')

            mobileMenuBtn.classList.toggle('_active')
            headerActionsWrapper.classList.toggle('_active')

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
        const menuLinks = headerActionsWrapper.querySelectorAll('a')
        menuLinks.forEach((link) => {
            link.addEventListener('click', () => {
                mobileMenuBtn.classList.remove('_active')
                headerActionsWrapper.classList.remove('_active')
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

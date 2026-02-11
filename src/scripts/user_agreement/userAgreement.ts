export const initUserAgreementAccordion = () => {
    const accordionButtons = document.querySelectorAll('[data-accordion-button]')
    
    if (accordionButtons.length === 0) return

    accordionButtons.forEach((button) => {
        button.addEventListener('click', () => {
            const isExpanded = button.getAttribute('aria-expanded') === 'true'
            const content = button.nextElementSibling as HTMLElement
            
            if (!content) return

            if (isExpanded) {
                // Close
                button.setAttribute('aria-expanded', 'false')
                content.style.maxHeight = '0'
            } else {
                // Open
                button.setAttribute('aria-expanded', 'true')
                content.style.maxHeight = content.scrollHeight + 'px'
            }
        })
    })
}

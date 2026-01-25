// src/scripts/main/searchForm.ts

export const initSearchForm = () => {
    const searchForm = document.querySelector('.search-form')
    const searchTourBtn = document.querySelector('.search-tour-btn')
    const searchFormClose = document.querySelector('.search-form-close')

    if (!searchForm || !searchTourBtn) return

    // Открытие формы
    searchTourBtn.addEventListener('click', () => {
        searchForm.classList.add('_active')
        document.body.classList.add('_disable-scrolling')
    })

    // Закрытие формы по кнопке
    if (searchFormClose) {
        searchFormClose.addEventListener('click', () => {
            searchForm.classList.remove('_active')
            document.body.classList.remove('_disable-scrolling')
        })
    }

    // Закрытие формы по клику вне её
    searchForm.addEventListener('click', (e) => {
        if (e.target === searchForm) {
            searchForm.classList.remove('_active')
            document.body.classList.remove('_disable-scrolling')
        }
    })
}

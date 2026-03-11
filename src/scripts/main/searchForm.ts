// src/scripts/main/searchForm.ts
import flatpickr from 'flatpickr'
import { Russian } from 'flatpickr/dist/l10n/ru'

interface TouristCounts {
    adults: number
    children: number
    infants: number
}

export const initSearchForm = () => {
    const searchForm = document.querySelector('.hero-search-form')
    const searchTourBtn = document.querySelector('.main-hero .button')
    const searchFormClose = document.querySelector('.hero-search-form-close')

    if (!searchForm) return

    // Open/close form (only when hero button exists)
    if (searchTourBtn) {
        searchTourBtn.addEventListener('click', () => {
            searchForm.classList.add('_active')
            document.body.classList.add('_disable-scrolling')
        })
    }

    // Close on button click and click outside — hero only. Inline (hotel page) is always visible
    const isInlineForm = searchForm.classList.contains('_inline')

    if (searchFormClose) {
        searchFormClose.addEventListener('click', () => {
            searchForm.classList.remove('_active')
            document.body.classList.remove('_disable-scrolling')
        })
    }

    if (!isInlineForm) {
        searchForm.addEventListener('click', (e) => {
            if (e.target === searchForm) {
                searchForm.classList.remove('_active')
                document.body.classList.remove('_disable-scrolling')
            }
        })
    }

    // Init dropdowns
    initDropdowns()

    // Init date picker
    initDatePicker()

    // Init tourists counter
    initTouristsCounter()
}

// Dropdowns for city, country and nights
function initDropdowns() {
    const dropdowns = document.querySelectorAll('.field-dropdown')

    dropdowns.forEach((dropdown) => {
        const input = dropdown.querySelector('.field-input') as HTMLInputElement
        const dropdownList = dropdown.querySelector('.dropdown-list')
        const searchInput = dropdown.querySelector('.dropdown-search') as HTMLInputElement
        const items = dropdown.querySelectorAll('.dropdown-item')

        if (!input || !dropdownList) return

        // Open/close dropdown
        input.addEventListener('click', (e) => {
            e.stopPropagation()
            closeAllDropdowns()
            dropdownList.classList.add('_active')
            if (searchInput) {
                searchInput.value = ''
                searchInput.focus()
                filterItems(items, '')
            }
        })

        // Select item
        items.forEach((item) => {
            item.addEventListener('click', () => {
                const value = item.getAttribute('data-value')
                if (value) {
                    input.value = value
                    dropdownList.classList.remove('_active')
                }
            })
        })

        // Search (if present)
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                const query = (e.target as HTMLInputElement).value.toLowerCase()
                filterItems(items, query)
            })

            searchInput.addEventListener('click', (e) => {
                e.stopPropagation()
            })
        }
    })

    // Close on click outside dropdown
    document.addEventListener('click', () => {
        closeAllDropdowns()
    })
}

function closeAllDropdowns() {
    document.querySelectorAll('.dropdown-list').forEach((list) => {
        list.classList.remove('_active')
    })
}

function filterItems(items: NodeListOf<Element>, query: string) {
    items.forEach((item) => {
        const value = item.getAttribute('data-value')?.toLowerCase() || ''
        if (value.includes(query)) {
            item.classList.remove('_hidden')
        } else {
            item.classList.add('_hidden')
        }
    })
}

// Date picker
function initDatePicker() {
    const datesInput = document.querySelector('#dates') as HTMLInputElement
    if (!datesInput) return

    flatpickr(datesInput, {
        mode: 'range',
        locale: Russian,
        dateFormat: 'd M',
        minDate: 'today',
        defaultDate: [new Date(), new Date(Date.now() + 9 * 24 * 60 * 60 * 1000)],
        onChange: (selectedDates) => {
            if (selectedDates.length === 2) {
                const start = selectedDates[0]
                const end = selectedDates[1]
                const nights = Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
                
                // Update nights field
                const nightsInput = document.querySelector('#nights') as HTMLInputElement
                if (nightsInput) {
                    nightsInput.value = `${nights}`
                }
            }
        },
    })
}

// Tourists counter
function initTouristsCounter() {
    const touristsField = document.querySelector('[data-field="tourists"]')
    if (!touristsField) return

    const input = touristsField.querySelector('#tourists') as HTMLInputElement
    const dropdownList = touristsField.querySelector('.dropdown-list')
    const counterBtns = touristsField.querySelectorAll('.counter-btn')

    if (!input || !dropdownList) return

    const counts: TouristCounts = {
        adults: 2,
        children: 0,
        infants: 0,
    }

    // Open/close
    input.addEventListener('click', (e) => {
        e.stopPropagation()
        closeAllDropdowns()
        dropdownList.classList.add('_active')
    })

    // Increment/decrement buttons
    counterBtns.forEach((btn) => {
        btn.addEventListener('click', () => {
            const action = btn.getAttribute('data-action')
            const type = btn.getAttribute('data-type') as keyof TouristCounts

            if (!action || !type) return

            if (action === 'increase') {
                counts[type]++
            } else if (action === 'decrease' && counts[type] > 0) {
                // Adults must be at least 1
                if (type === 'adults' && counts[type] <= 1) return
                counts[type]--
            }

            updateCounterDisplay(type, counts[type])
            updateTouristsInputValue(counts, input)
            updateButtonStates()
        })
    })

    // Update counter display
    function updateCounterDisplay(type: keyof TouristCounts, value: number) {
        const counter = touristsField?.querySelector(`[data-type="${type}"]`) as HTMLElement
        if (counter) {
            counter.textContent = value.toString()
        }
    }

    // Update input text
    function updateTouristsInputValue(counts: TouristCounts, input: HTMLInputElement) {
        const parts: string[] = []

        if (counts.adults > 0) {
            const word = getWordForm(counts.adults, ['взрослый', 'взрослых', 'взрослых'])
            parts.push(`${counts.adults} ${word}`)
        }

        if (counts.children > 0) {
            const word = getWordForm(counts.children, ['ребёнок', 'ребёнка', 'детей'])
            parts.push(`${counts.children} ${word}`)
        }

        if (counts.infants > 0) {
            const word = getWordForm(counts.infants, ['младенец', 'младенца', 'младенцев'])
            parts.push(`${counts.infants} ${word}`)
        }

        input.value = parts.join(', ')
    }

    // Russian word form (singular/plural)
    function getWordForm(num: number, forms: [string, string, string]): string {
        const mod10 = num % 10
        const mod100 = num % 100

        if (mod100 >= 11 && mod100 <= 19) {
            return forms[2]
        }

        if (mod10 === 1) {
            return forms[0]
        }

        if (mod10 >= 2 && mod10 <= 4) {
            return forms[1]
        }

        return forms[2]
    }

    // Disable buttons at min/max limits
    function updateButtonStates() {
        counterBtns.forEach((btn) => {
            const action = btn.getAttribute('data-action')
            const type = btn.getAttribute('data-type') as keyof TouristCounts

            if (!action || !type) return

            const decreaseBtn = btn as HTMLButtonElement

            if (action === 'decrease') {
                if (type === 'adults') {
                    decreaseBtn.disabled = counts[type] <= 1
                } else {
                    decreaseBtn.disabled = counts[type] <= 0
                }
            }
        })
    }

    // Init initial state
    updateButtonStates()

    // Close on click outside
    document.addEventListener('click', (e) => {
        if (!touristsField?.contains(e.target as Node)) {
            dropdownList.classList.remove('_active')
        }
    })
}

// src/scripts/common/modal.ts
// Binds [data-modal-trigger] to [data-modal], handles open/close, focus, body scroll lock.

const BODY_SCROLL_CLASS = '_disable-scrolling'

function openModal(modal: HTMLElement, _trigger: HTMLElement | null) {
    modal.classList.add('_active')
    modal.setAttribute('aria-hidden', 'false')
    document.body.classList.add(BODY_SCROLL_CLASS)

    const focusTarget = modal.querySelector<HTMLElement>('[data-modal-focus]') ?? modal.querySelector('input, button, [tabindex="0"]') ?? modal.querySelector('.modal-close')
    if (focusTarget) {
        focusTarget.focus()
    }
}

function isMobileMenuOpen(): boolean {
    const menu = document.querySelector('.header-actions-wrapper')
    return menu?.classList.contains('_active') ?? false
}

function closeModal(modal: HTMLElement, returnFocusTo: HTMLElement | null) {
    modal.classList.remove('_active')
    modal.setAttribute('aria-hidden', 'true')
    if (!isMobileMenuOpen()) {
        document.body.classList.remove(BODY_SCROLL_CLASS)
    }

    if (returnFocusTo) {
        returnFocusTo.focus()
    }
}

export const initModal = () => {
    const triggers = document.querySelectorAll<HTMLElement>('[data-modal-trigger]')
    const modals = document.querySelectorAll<HTMLElement>('[data-modal]')

    triggers.forEach((trigger) => {
        const modalId = trigger.getAttribute('data-modal-trigger')
        if (!modalId) return

        const modal = document.querySelector<HTMLElement>(`[data-modal="${modalId}"]`)
        if (!modal) return

        trigger.addEventListener('click', (e) => {
            e.preventDefault()
            openModal(modal, trigger)
        })
    })

    modals.forEach((modal) => {
        const closeBtn = modal.querySelector<HTMLElement>('[data-modal-close]')
        const backdrop = modal.querySelector<HTMLElement>('[data-modal-backdrop]')

        const handleClose = () => {
            const trigger = document.querySelector<HTMLElement>(`[data-modal-trigger="${modal.getAttribute('data-modal')}"]`)
            closeModal(modal, trigger)
        }

        closeBtn?.addEventListener('click', handleClose)
        backdrop?.addEventListener('click', handleClose)
    })

    document.addEventListener('keydown', (e) => {
        if (e.key !== 'Escape') return
        const openModalEl = document.querySelector<HTMLElement>('.modal._active')
        if (!openModalEl) return
        const trigger = document.querySelector<HTMLElement>(`[data-modal-trigger="${openModalEl.getAttribute('data-modal')}"]`)
        closeModal(openModalEl, trigger)
    })
}

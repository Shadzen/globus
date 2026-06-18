// src/scripts/common/modal.ts
// Binds [data-modal-trigger] to [data-modal] via event delegation, handles open/close, focus, body scroll lock.

const BODY_SCROLL_CLASS = '_disable-scrolling'

const lastTriggerByModal = new WeakMap<HTMLElement, HTMLElement>()

let initialized = false

function openModal(modal: HTMLElement) {
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

function closeModal(modal: HTMLElement) {
    const returnFocusTo = lastTriggerByModal.get(modal) ?? null

    modal.classList.remove('_active')
    modal.setAttribute('aria-hidden', 'true')
    if (!isMobileMenuOpen()) {
        document.body.classList.remove(BODY_SCROLL_CLASS)
    }

    if (returnFocusTo) {
        returnFocusTo.focus()
    }
}

function handleTriggerClick(e: Event) {
    const trigger = (e.target as Element).closest<HTMLElement>('[data-modal-trigger]')
    if (!trigger) return

    const modalId = trigger.getAttribute('data-modal-trigger')
    if (!modalId) return

    const modal = document.querySelector<HTMLElement>(`[data-modal="${modalId}"]`)
    if (!modal) return

    e.preventDefault()
    lastTriggerByModal.set(modal, trigger)
    openModal(modal)
}

function handleEscape(e: KeyboardEvent) {
    if (e.key !== 'Escape') return

    const openModalEl = document.querySelector<HTMLElement>('.modal._active')
    if (!openModalEl) return

    closeModal(openModalEl)
}

export const initModal = () => {
    if (initialized) return
    initialized = true

    document.addEventListener('click', handleTriggerClick)
    document.addEventListener('keydown', handleEscape)

    document.querySelectorAll<HTMLElement>('[data-modal]').forEach((modal) => {
        const closeBtn = modal.querySelector<HTMLElement>('[data-modal-close]')
        const backdrop = modal.querySelector<HTMLElement>('[data-modal-backdrop]')

        const handleClose = () => closeModal(modal)

        closeBtn?.addEventListener('click', handleClose)
        backdrop?.addEventListener('click', handleClose)
    })
}

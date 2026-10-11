// src/scripts/business_card/vcard.ts
// "Save contact" button on the e-card page: builds a vCard 3.0 (.vcf) from the card markup.
// Reads [data-vcard] root: data-vcard-org, and [data-vcard-field] children:
// name (text, "Фамилия Имя"), title (text), tel (href tel:, repeatable), email (href mailto:).

function escapeValue(value: string): string {
    return value
        .replace(/\\/g, '\\\\')
        .replace(/\n/g, '\\n')
        .replace(/,/g, '\\,')
        .replace(/;/g, '\\;')
}

function fieldText(card: HTMLElement, field: string): string {
    return card.querySelector(`[data-vcard-field="${field}"]`)?.textContent?.trim() ?? ''
}

function fieldHrefs(card: HTMLElement, field: string, prefix: string): string[] {
    return [...card.querySelectorAll<HTMLAnchorElement>(`a[data-vcard-field="${field}"]`)]
        .map((link) => link.getAttribute('href') ?? '')
        .filter((href) => href.startsWith(prefix))
        .map((href) => decodeURIComponent(href.slice(prefix.length)))
}

function buildVcard(card: HTMLElement): { content: string; fileName: string } {
    const name = fieldText(card, 'name')
    const title = fieldText(card, 'title')
    const org = card.dataset.vcardOrg ?? ''
    const [familyName = '', ...givenNames] = name.split(/\s+/)
    const url = `${location.origin}${location.pathname}`

    const lines = [
        'BEGIN:VCARD',
        'VERSION:3.0',
        `N:${escapeValue(familyName)};${escapeValue(givenNames.join(' '))};;;`,
        `FN:${escapeValue(name)}`,
        org && `ORG:${escapeValue(org)}`,
        title && `TITLE:${escapeValue(title)}`,
        ...fieldHrefs(card, 'tel', 'tel:').map((tel) => `TEL;TYPE=CELL:${tel}`),
        ...fieldHrefs(card, 'email', 'mailto:').map((email) => `EMAIL;TYPE=INTERNET:${email}`),
        `URL:${url}`,
        'END:VCARD',
    ].filter(Boolean)

    return {
        content: lines.join('\r\n'),
        fileName: `${name || 'contact'}.vcf`,
    }
}

function downloadVcard(card: HTMLElement) {
    const { content, fileName } = buildVcard(card)
    const blob = new Blob([content], { type: 'text/vcard;charset=utf-8' })
    const href = URL.createObjectURL(blob)

    const link = document.createElement('a')
    link.href = href
    link.download = fileName
    document.body.append(link)
    link.click()
    link.remove()

    setTimeout(() => URL.revokeObjectURL(href), 1000)
}

export function initVcardDownload() {
    document.querySelectorAll<HTMLElement>('[data-vcard-download]').forEach((button) => {
        if (button.dataset.vcardBound) return
        button.dataset.vcardBound = 'true'

        button.addEventListener('click', () => {
            const card = button.closest<HTMLElement>('[data-vcard]')
            if (card) downloadVcard(card)
        })
    })
}

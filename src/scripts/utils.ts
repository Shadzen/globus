// src/scripts/utils.ts

export const BREAKPOINTS = {
    mobile: 480,
    desktop: 1920,
} as const

export const COMPANY_NAME = 'Глобус-тур'

const WIDE_RATIO = 21 / 9
const WIDE_VW_MULTIPLIER = 0.75

const getViewportWidth = () => window.innerWidth || screen.width || window.screen.availWidth

const getAdaptiveValue = (size: number, base: number) => {
    const width = getViewportWidth()
    const height = window.innerHeight || window.screen.availHeight
    const isWide = width / height >= WIDE_RATIO
    const effectiveWidth = isWide ? width * WIDE_VW_MULTIPLIER : width

    return (size * effectiveWidth) / base
}

export const adaptive = (
    desktopValue: number,
    mobileValue: number,
    desktopBreakpoint: number = BREAKPOINTS.desktop,
    mobileBreakpoint: number = BREAKPOINTS.mobile,
): number => {
    const windowWidth = getViewportWidth()

    if (windowWidth <= mobileBreakpoint) {
        return getAdaptiveValue(mobileValue, mobileBreakpoint)
    }

    return getAdaptiveValue(desktopValue, desktopBreakpoint)
}

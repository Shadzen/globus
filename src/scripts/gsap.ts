import { gsap } from 'gsap'

// Расширяем Window для TS
declare global {
  interface Window {
    gsap: typeof gsap
  }
}

// Инициализация GSAP в глобальной области
if (typeof window !== 'undefined') {
  window.gsap = gsap
  // @ts-expect-error - gsap is not on globalThis by default
  globalThis.gsap = gsap
}

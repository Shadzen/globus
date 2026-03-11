import { gsap } from 'gsap'

// Extend Window for TS
declare global {
  interface Window {
    gsap: typeof gsap
  }
}

// Expose GSAP on window for global use
if (typeof window !== 'undefined') {
  window.gsap = gsap
  // @ts-expect-error - gsap is not on globalThis by default
  globalThis.gsap = gsap
}

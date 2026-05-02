// src/scripts/common/dataPswpLightbox.ts
// Opt-in fullscreen media via PhotoSwipe.
// Image: [data-pswp-lightbox] + data-pswp-src, data-pswp-width, data-pswp-height (optional data-pswp-alt).
// Video: same trigger + data-pswp-media="video" + data-pswp-video-src (optional data-pswp-poster,
// data-pswp-video-type, default video/mp4). Tries programmatic play() with sound on open; browsers may block it — user uses controls then.
import PhotoSwipeLightbox from 'photoswipe/lightbox'
import PhotoSwipe from 'photoswipe'

let lightbox: PhotoSwipeLightbox | null = null
let delegated = false

function escapeAttr(raw: string): string {
    return raw
        .replace(/&/g, '&amp;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;')
        .replace(/</g, '&lt;')
}

function buildVideoSlideHtml(videoSrc: string, poster: string, mimeType: string): string {
    const posterAttr = poster.trim() ? ` poster="${escapeAttr(poster)}"` : ''
    const typeAttr = escapeAttr(mimeType || 'video/mp4')
    return (
        `<div class="pswp-lightbox-video-wrap">`
        + `<video class="pswp-lightbox-video" controls playsinline autoplay preload="metadata"${posterAttr}>`
        + `<source src="${escapeAttr(videoSrc)}" type="${typeAttr}" />`
        + `</video></div>`
    )
}

function pauseLightboxVideos() {
    document.querySelectorAll('.pswp-lightbox-video').forEach((node) => {
        if (node instanceof HTMLVideoElement) {
            node.pause()
        }
    })
}

function findPswpVideoInContent(content: { element?: HTMLElement | null }): HTMLVideoElement | null {
    const root = content?.element
    if (!root) return null
    const found = root.querySelector('video.pswp-lightbox-video')
    return found instanceof HTMLVideoElement ? found : null
}

function tryPlayPswpVideo(video: HTMLVideoElement) {
    const play = () => {
        void video.play().catch(() => {})
    }
    play()
    if (video.readyState < HTMLMediaElement.HAVE_CURRENT_DATA) {
        video.addEventListener('loadeddata', play, { once: true })
        video.addEventListener('canplay', play, { once: true })
    }
    requestAnimationFrame(() => {
        requestAnimationFrame(play)
    })
}

function tryPlayAllPswpLightboxVideos() {
    document.querySelectorAll('.pswp .pswp-lightbox-video').forEach((node) => {
        if (node instanceof HTMLVideoElement) {
            tryPlayPswpVideo(node)
        }
    })
}

function ensureLightbox(): PhotoSwipeLightbox {
    if (!lightbox) {
        lightbox = new PhotoSwipeLightbox({
            dataSource: [{ src: ' ', width: 1, height: 1 }],
            pswpModule: PhotoSwipe,
        })
        lightbox.on('closingAnimationStart', pauseLightboxVideos)
        lightbox.on('contentAppend', (e) => {
            const video = findPswpVideoInContent(e.content)
            if (video) tryPlayPswpVideo(video)
        })
        lightbox.on('openingAnimationEnd', () => {
            tryPlayAllPswpLightboxVideos()
        })
        lightbox.init()
    }
    return lightbox
}

function onDocumentClick(e: MouseEvent) {
    if (e.button !== 0) return
    const target = e.target as HTMLElement | null
    if (!target) return
    const el = target.closest<HTMLElement>('[data-pswp-lightbox]')
    if (!el) return

    if (specialKeyUsed(e)) return
    if ((window as Window & { pswp?: unknown }).pswp) return

    const isVideo = el.dataset.pswpMedia === 'video'
    if (isVideo) {
        const videoSrc = el.dataset.pswpVideoSrc?.trim()
        if (!videoSrc) return
        e.preventDefault()
        const poster = el.dataset.pswpPoster ?? ''
        const mimeType = el.dataset.pswpVideoType ?? 'video/mp4'
        const html = buildVideoSlideHtml(videoSrc, poster, mimeType)
        ensureLightbox().loadAndOpen(0, [{ html }])
        return
    }

    const src = el.dataset.pswpSrc
    const width = parseInt(el.dataset.pswpWidth || '', 10)
    const height = parseInt(el.dataset.pswpHeight || '', 10)
    if (!src?.trim() || !width || !height) return

    e.preventDefault()
    const alt = el.dataset.pswpAlt ?? ''
    ensureLightbox().loadAndOpen(0, [{ src, width, height, alt }])
}

function specialKeyUsed(e: MouseEvent): boolean {
    return e.ctrlKey || e.metaKey || e.altKey || e.shiftKey
}

export const initDataPswpLightbox = () => {
    if (delegated) return
    delegated = true
    document.addEventListener('click', onDocumentClick)
}

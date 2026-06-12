// src/scripts/common/dataPswpLightbox.ts
// Opt-in fullscreen media via PhotoSwipe.
// Image: [data-pswp-lightbox] + data-pswp-src, data-pswp-width, data-pswp-height (optional data-pswp-alt).
// Video: same trigger + data-pswp-media="video" + data-pswp-video-src.
//   - Direct file (mp4, webm, …): optional data-pswp-poster, data-pswp-video-type (default video/mp4).
//   - YouTube / Rutube: pass watch or embed URL; provider is auto-detected.
//     Optional data-pswp-video-provider="file|youtube|rutube" to force type.
import PhotoSwipeLightbox from 'photoswipe/lightbox'
import PhotoSwipe from 'photoswipe'

type VideoProvider = 'file' | 'youtube' | 'rutube'

let lightbox: PhotoSwipeLightbox | null = null
let delegated = false

function escapeAttr(raw: string): string {
    return raw
        .replace(/&/g, '&amp;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;')
        .replace(/</g, '&lt;')
}

function getYouTubeId(url: string): string | null {
    try {
        const parsed = new URL(url)
        const host = parsed.hostname.replace(/^www\./, '')

        if (host === 'youtu.be') {
            const id = parsed.pathname.slice(1).split('/')[0]
            return id || null
        }

        if (host === 'youtube.com' || host === 'm.youtube.com') {
            if (parsed.pathname === '/watch') {
                return parsed.searchParams.get('v')
            }

            const pathMatch = parsed.pathname.match(/^\/(?:embed|shorts|live)\/([^/?]+)/)
            if (pathMatch?.[1]) {
                return pathMatch[1]
            }
        }
    } catch {
        // fall through to regex
    }

    const match = url.match(
        /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/|live\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/,
    )
    return match?.[1] ?? null
}

function getRutubeId(url: string): string | null {
    try {
        const parsed = new URL(url)
        const host = parsed.hostname.replace(/^www\./, '')

        if (host !== 'rutube.ru') {
            return null
        }

        const pathMatch = parsed.pathname.match(/\/(?:video|play\/embed|shorts)\/([a-f0-9-]+)/i)
        return pathMatch?.[1] ?? null
    } catch {
        const match = url.match(/rutube\.ru\/(?:video|play\/embed|shorts)\/([a-f0-9-]+)/i)
        return match?.[1] ?? null
    }
}

function detectVideoProvider(src: string): VideoProvider {
    if (/youtube\.com|youtu\.be/i.test(src)) {
        return 'youtube'
    }

    if (/rutube\.ru/i.test(src)) {
        return 'rutube'
    }

    return 'file'
}

function normalizeVideoProvider(raw?: string): VideoProvider | null {
    const value = raw?.trim().toLowerCase()

    if (value === 'file' || value === 'youtube' || value === 'rutube') {
        return value
    }

    return null
}

function buildFileVideoSlideHtml(videoSrc: string, poster: string, mimeType: string): string {
    const posterAttr = poster.trim() ? ` poster="${escapeAttr(poster)}"` : ''
    const typeAttr = escapeAttr(mimeType || 'video/mp4')
    return (
        `<div class="pswp-lightbox-video-wrap">`
        + `<video class="pswp-lightbox-video" controls playsinline autoplay preload="metadata"${posterAttr}>`
        + `<source src="${escapeAttr(videoSrc)}" type="${typeAttr}" />`
        + `</video></div>`
    )
}

function buildEmbedVideoSlideHtml(embedUrl: string, provider?: 'youtube' | 'rutube'): string {
    const providerAttr = provider ? ` data-embed-provider="${provider}"` : ''
    const allow = provider === 'rutube'
        ? 'clipboard-write; autoplay; fullscreen; picture-in-picture; encrypted-media'
        : 'autoplay; fullscreen; picture-in-picture; encrypted-media'

    return (
        `<div class="pswp-lightbox-video-wrap">`
        + `<iframe class="pswp-lightbox-embed"${providerAttr} src="${escapeAttr(embedUrl)}" `
        + `allow="${allow}" `
        + `allowfullscreen></iframe></div>`
    )
}

function buildRutubeEmbedUrl(videoId: string): string {
    const params = new URLSearchParams({
        autoplay: 'true',
        autostartmute: 'false',
    })
    return `https://rutube.ru/play/embed/${videoId}/?${params.toString()}`
}

function sendRutubePlayCommand(iframe: HTMLIFrameElement) {
    iframe.contentWindow?.postMessage(
        JSON.stringify({ type: 'player:play', data: {} }),
        '*',
    )
}

function tryPlayRutubeEmbed(iframe: HTMLIFrameElement) {
    const play = () => sendRutubePlayCommand(iframe)

    iframe.addEventListener('load', () => {
        play()
        window.setTimeout(play, 300)
        window.setTimeout(play, 800)
    }, { once: true })

    play()
}

function tryPlayAllRutubeEmbeds() {
    document.querySelectorAll('.pswp .pswp-lightbox-embed[data-embed-provider="rutube"]').forEach((node) => {
        if (node instanceof HTMLIFrameElement) {
            tryPlayRutubeEmbed(node)
        }
    })
}

function parseRutubeMessage(data: unknown): { type?: string } | null {
    try {
        const payload = typeof data === 'string' ? JSON.parse(data) : data
        return payload && typeof payload === 'object' ? payload as { type?: string } : null
    } catch {
        return null
    }
}

let rutubeReadyListenerAttached = false

function ensureRutubeReadyListener() {
    if (rutubeReadyListenerAttached) return
    rutubeReadyListenerAttached = true

    window.addEventListener('message', (event) => {
        if (event.origin !== 'https://rutube.ru') return

        const payload = parseRutubeMessage(event.data)
        if (payload?.type !== 'player:ready') return

        document.querySelectorAll('.pswp .pswp-lightbox-embed[data-embed-provider="rutube"]').forEach((node) => {
            if (node instanceof HTMLIFrameElement && node.contentWindow === event.source) {
                sendRutubePlayCommand(node)
            }
        })
    })
}

function buildVideoSlideHtml(
    videoSrc: string,
    poster: string,
    mimeType: string,
    providerHint?: string,
): string | null {
    const provider = normalizeVideoProvider(providerHint) ?? detectVideoProvider(videoSrc)

    if (provider === 'youtube') {
        const videoId = getYouTubeId(videoSrc)
        if (!videoId) return null

        return buildEmbedVideoSlideHtml(
            `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`,
            'youtube',
        )
    }

    if (provider === 'rutube') {
        const videoId = getRutubeId(videoSrc)
        if (!videoId) return null

        return buildEmbedVideoSlideHtml(buildRutubeEmbedUrl(videoId), 'rutube')
    }

    return buildFileVideoSlideHtml(videoSrc, poster, mimeType)
}

function pauseLightboxVideos() {
    document.querySelectorAll('.pswp-lightbox-video').forEach((node) => {
        if (node instanceof HTMLVideoElement) {
            node.pause()
        }
    })
}

function stopLightboxEmbeds() {
    document.querySelectorAll('.pswp-lightbox-embed').forEach((node) => {
        if (node instanceof HTMLIFrameElement) {
            node.src = ''
        }
    })
}

function stopLightboxMedia() {
    pauseLightboxVideos()
    stopLightboxEmbeds()
}

function findPswpRutubeEmbedInContent(content: { element?: HTMLElement | null }): HTMLIFrameElement | null {
    const root = content?.element
    if (!root) return null
    const found = root.querySelector('iframe.pswp-lightbox-embed[data-embed-provider="rutube"]')
    return found instanceof HTMLIFrameElement ? found : null
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
        lightbox.on('closingAnimationStart', stopLightboxMedia)
        lightbox.on('contentAppend', (e) => {
            const video = findPswpVideoInContent(e.content)
            if (video) tryPlayPswpVideo(video)

            const rutubeEmbed = findPswpRutubeEmbedInContent(e.content)
            if (rutubeEmbed) tryPlayRutubeEmbed(rutubeEmbed)
        })
        lightbox.on('openingAnimationEnd', () => {
            tryPlayAllPswpLightboxVideos()
            tryPlayAllRutubeEmbeds()
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
        const providerHint = el.dataset.pswpVideoProvider
        const html = buildVideoSlideHtml(videoSrc, poster, mimeType, providerHint)
        if (!html) return

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
    ensureRutubeReadyListener()
    document.addEventListener('click', onDocumentClick)
}

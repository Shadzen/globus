// src/scripts/about/aboutMap.ts

// eslint-disable-next-line @typescript-eslint/no-explicit-any
declare const ymaps: { ready: (cb: () => void) => void; Map: new (...args: unknown[]) => Record<string, any>; Placemark: new (...args: unknown[]) => unknown }

export const initAboutMap = () => {
    const mapContainer = document.getElementById('about-yandex-map')
    if (!mapContainer) return

    // Не инициализировать повторно
    if (mapContainer.children.length > 0) return

    const lat = parseFloat(mapContainer.dataset.lat || '0')
    const lng = parseFloat(mapContainer.dataset.lng || '0')
    const zoom = parseInt(mapContainer.dataset.zoom || '16', 10)
    const hint = mapContainer.dataset.hint || ''
    const balloon = mapContainer.dataset.balloon || ''
    const preset = mapContainer.dataset.preset || 'islands#redDotIcon'

    const script = document.createElement('script')
    script.src = 'https://api-maps.yandex.ru/2.1/?lang=ru_RU'
    script.onload = () => {
        ymaps.ready(() => {
            const map = new ymaps.Map('about-yandex-map', {
                center: [lat, lng],
                zoom,
                controls: ['zoomControl'],
            })

            const placemark = new ymaps.Placemark(
                [lat, lng],
                {
                    hintContent: hint,
                    balloonContent: balloon,
                },
                {
                    preset,
                },
            )

            map.geoObjects.add(placemark)
            map.behaviors.disable('scrollZoom')
        })
    }
    document.head.appendChild(script)
}

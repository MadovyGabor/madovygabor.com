document.addEventListener("DOMContentLoaded", () => {
    // ─── In-Place Skeleton Loader ─────────────────────────────────
    observeElements();
    initInPlaceSkeleton();

    function initInPlaceSkeleton() {
        const images = document.querySelectorAll('.skeleton-shimmer img, .img-container img, .hero-img, .portfolio-img');
        if (!images.length) return;

        images.forEach(img => {
            const markReady = () => {
                img.classList.add('is-loaded');
                const container = img.closest('.skeleton-shimmer');
                if (container) {
                    container.classList.add('is-loaded');
                    setTimeout(() => {
                        container.classList.remove('skeleton-shimmer');
                    }, 400);
                }
            };

            const handleLoaded = () => {
                if (typeof img.decode === 'function') {
                    img.decode().then(markReady).catch(markReady);
                } else {
                    markReady();
                }
            };

            if (img.complete && img.naturalWidth !== 0) {
                handleLoaded();
            } else {
                img.addEventListener('load', handleLoaded, { once: true });
                img.addEventListener('error', markReady, { once: true });
            }
        });
    }

    // ─── Back / Forward cache (bfcache) ──────────────────────────
    window.addEventListener('pageshow', e => {
        if (!e.persisted) return;
        observeElements();
        initInPlaceSkeleton();
    });

    // ─── Scroll Reveal ───────────────────────────────────────────
    function observeElements() {
        const elements = document.querySelectorAll('.scroll-reveal');
        if (!elements.length) return;

        const observer = new IntersectionObserver((entries, obs) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('active');
                    obs.unobserve(entry.target);
                }
            });
        }, {
            root: null,
            rootMargin: '0px 0px -40px 0px',
            threshold: 0.05
        });

        elements.forEach(el => {
            // Instantly activate any element that is already in or near the viewport on load
            const rect = el.getBoundingClientRect();
            if (rect.top < window.innerHeight + 100) {
                el.classList.add('active');
            } else {
                observer.observe(el);
            }
        });
    }
});

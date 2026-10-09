document.addEventListener('DOMContentLoaded', () => {
    // ─── Mobile Menu Logic ────────────────────────────────────────
    const hamburgerBtn = document.getElementById('hamburgerBtn');
    const navCloseBtn = document.getElementById('navCloseBtn');
    const mobileNavOverlay = document.getElementById('mobileNavOverlay');

    if (hamburgerBtn && navCloseBtn && mobileNavOverlay) {
        function openMenu() {
            mobileNavOverlay.classList.add('active');
            hamburgerBtn.setAttribute('aria-expanded', 'true');
            document.body.style.overflow = 'hidden';
        }

        function closeMenu() {
            mobileNavOverlay.classList.remove('active');
            hamburgerBtn.setAttribute('aria-expanded', 'false');
            document.body.style.overflow = '';
        }

        hamburgerBtn.addEventListener('click', openMenu);
        navCloseBtn.addEventListener('click', closeMenu);
        mobileNavOverlay.addEventListener('click', e => {
            if (e.target === mobileNavOverlay) closeMenu();
        });
        document.addEventListener('keydown', e => {
            if (e.key === 'Escape') closeMenu();
        });
    }

    // ─── Scroll Snapping Dynamic Toggle ───────────────────────────
    const htmlElement = document.documentElement;
    let lastScrollTop = window.pageYOffset || htmlElement.scrollTop;

    window.addEventListener('scroll', () => {
        const currentScrollTop = window.pageYOffset || htmlElement.scrollTop;
        if (currentScrollTop > lastScrollTop) {
            htmlElement.style.scrollSnapType = "y proximity";
        } else if (currentScrollTop < lastScrollTop) {
            htmlElement.style.scrollSnapType = "none";
        }
        lastScrollTop = currentScrollTop <= 0 ? 0 : currentScrollTop;
    }, { passive: true });

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
    // Browser Back restores from cache — page is already rendered
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

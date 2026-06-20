document.addEventListener('DOMContentLoaded', () => {
    // Mobile Menu Logic
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

    // Scroll Snapping Dynamic Toggle
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

    // ─── Skeleton Loader ─────────────────────────────────────────
    const skeleton = document.getElementById('skeleton');

    if (skeleton) {
        const hideSkeleton = () => {
            if (skeleton.classList.contains('hidden')) return;
            skeleton.classList.add('hidden');
            setTimeout(() => {
                skeleton.style.display = 'none';
            }, 600);
            observeElements();
        };

        // Simulate a minimum loading time for skeleton visibility
        setTimeout(() => {
            if (document.readyState === 'complete') {
                hideSkeleton();
            } else {
                window.addEventListener('load', hideSkeleton);
            }
        }, 450);

        // Fallback in case load event already fired or takes too long
        setTimeout(hideSkeleton, 3000);
    } else {
        observeElements();
    }

    // ─── Back / Forward cache (bfcache) ──────────────────────────
    // When the user presses Back, browsers restore from bfcache (e.persisted=true).
    // The page is already rendered — never show the skeleton in this case.
    window.addEventListener('pageshow', e => {
        if (!e.persisted || !skeleton) return;
        skeleton.classList.add('hidden');
        skeleton.style.display = 'none';
        // Still wire up scroll-reveal so animations work after Back navigation
        observeElements();
    });

    // ─── Scroll Reveal ───────────────────────────────────────────
    function observeElements() {
        const initObserver = () => {
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

            elements.forEach(el => observer.observe(el));
        };

        if ('requestIdleCallback' in window) {
            requestIdleCallback(initObserver);
        } else {
            setTimeout(initObserver, 1);
        }
    }
});

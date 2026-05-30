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
    // Strategy: the skeleton starts HIDDEN (via CSS opacity:0 / visibility:hidden).
    // We only make it visible if loading takes longer than SHOW_THRESHOLD ms.
    // If the page loads before the threshold → skeleton is never seen → no flicker.
    // If it takes longer → skeleton fades in gracefully, then hides when done.
    // On browser Back (bfcache restore) → skeleton is never shown at all.

    const skeleton = document.getElementById('skeleton');
    const SHOW_THRESHOLD = 150; // ms — only reveal skeleton for genuinely slow loads
    let skeletonShown = false;
    let loaded = false;

    if (skeleton) {
        // Step 1: after threshold, show the skeleton only if page isn't done yet
        const showTimer = setTimeout(() => {
            if (!loaded) {
                skeleton.classList.add('visible');
                skeletonShown = true;
            }
        }, SHOW_THRESHOLD);

        const hideSkeleton = () => {
            loaded = true;
            clearTimeout(showTimer);

            if (!skeletonShown) {
                // Page loaded before skeleton appeared — just ensure it stays hidden
                skeleton.style.display = 'none';
            } else {
                // Skeleton was visible — fade it out smoothly
                skeleton.classList.remove('visible');
                setTimeout(() => { skeleton.style.display = 'none'; }, 550);
            }
            observeElements();
        };

        if (document.readyState === 'complete') {
            // Already fully loaded (cached page) — hide before threshold fires
            hideSkeleton();
        } else {
            window.addEventListener('load', hideSkeleton, { once: true });
            // Absolute failsafe
            setTimeout(hideSkeleton, 3000);
        }
    } else {
        observeElements();
    }

    // ─── Back / Forward cache (bfcache) ──────────────────────────
    // When the user presses Back, browsers restore from bfcache (e.persisted=true).
    // The page is already rendered — never show the skeleton in this case.
    window.addEventListener('pageshow', e => {
        if (!e.persisted || !skeleton) return;
        clearTimeout(window._skeletonShowTimer);
        skeleton.style.display = 'none';
        // Still wire up scroll-reveal so animations work after Back navigation
        observeElements();
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

        elements.forEach(el => observer.observe(el));
    }
});

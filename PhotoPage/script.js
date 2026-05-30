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

    // ─── Skeleton Loader ─────────────────────────────────────────
    // Skeleton starts invisible. It only fades IN if loading takes longer
    // than SHOW_THRESHOLD ms. Fast/cached pages never see it → no flicker.
    const skeleton = document.getElementById('skeleton');
    const SHOW_THRESHOLD = 150;
    let skeletonShown = false;
    let loaded = false;

    if (skeleton) {
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
                skeleton.style.display = 'none';
            } else {
                skeleton.classList.remove('visible');
                setTimeout(() => { skeleton.style.display = 'none'; }, 550);
            }
            observeElements();
        };

        if (document.readyState === 'complete') {
            hideSkeleton();
        } else {
            window.addEventListener('load', hideSkeleton, { once: true });
            setTimeout(hideSkeleton, 3000);
        }
    } else {
        observeElements();
    }

    // ─── Back / Forward cache (bfcache) ──────────────────────────
    // Browser Back restores from cache — page is already rendered,
    // never show the skeleton.
    window.addEventListener('pageshow', e => {
        if (!e.persisted || !skeleton) return;
        skeleton.style.display = 'none';
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

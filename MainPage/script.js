document.addEventListener("DOMContentLoaded", () => {
    const skeleton = document.getElementById('skeleton');

    const hideSkeleton = () => {
        if (!skeleton) {
            observeElements();
            return;
        }
        if (skeleton.classList.contains('hidden')) return;
        skeleton.classList.add('hidden');
        setTimeout(() => {
            skeleton.style.display = 'none';
        }, 600);
        observeElements();
    };

    if (skeleton) {
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

    // Handle bfcache (Back/Forward Cache)
    window.addEventListener('pageshow', e => {
        if (!e.persisted || !skeleton) return;
        skeleton.classList.add('hidden');
        skeleton.style.display = 'none';
        observeElements();
    });

    function observeElements() {
        const initObserver = () => {
            const observerOptions = {
                root: null,
                rootMargin: '0px',
                threshold: 0.15
            };

            const observer = new IntersectionObserver((entries, observer) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('active');
                        observer.unobserve(entry.target);
                    }
                });
            }, observerOptions);

            document.querySelectorAll('.scroll-reveal').forEach(el => {
                observer.observe(el);
            });
        };

        if ('requestIdleCallback' in window) {
            requestIdleCallback(initObserver);
        } else {
            setTimeout(initObserver, 1);
        }
    }
});

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
    // Browser Back restores from cache — page is already rendered,
    // never show the skeleton.
    window.addEventListener('pageshow', e => {
        if (!e.persisted || !skeleton) return;
        skeleton.classList.add('hidden');
        skeleton.style.display = 'none';
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
    // ─── FAQ Accordion ────────────────────────────────────────────
    function initFaqAccordion() {
        const questions = document.querySelectorAll('.faq-question');
        if (!questions.length) return;

        /**
         * Animate height from 0 → scrollHeight (open) or scrollHeight → 0 (close).
         * We avoid forcing relayout on every frame by caching the target height.
         */
        function openPanel(answer) {
            answer.removeAttribute('hidden');
            answer.classList.add('is-animating');

            // Force a paint so the browser registers height: 0 before transition
            const targetHeight = answer.scrollHeight;
            answer.style.height = '0px';
            answer.style.transition = 'height 0.38s cubic-bezier(0.4, 0, 0.2, 1)';

            // rAF ensures the browser has painted height:0 first
            requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                    answer.style.height = targetHeight + 'px';
                });
            });

            answer.addEventListener('transitionend', function onEnd() {
                answer.removeEventListener('transitionend', onEnd);
                answer.style.height = '';          // let content dictate height
                answer.style.transition = '';
                answer.classList.remove('is-animating');
                answer.classList.add('is-open');
            }, { once: true });
        }

        function closePanel(answer) {
            const currentHeight = answer.scrollHeight;
            answer.style.height = currentHeight + 'px';
            answer.style.transition = 'height 0.32s cubic-bezier(0.4, 0, 0.2, 1)';
            answer.classList.add('is-animating');
            answer.classList.remove('is-open');

            requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                    answer.style.height = '0px';
                });
            });

            answer.addEventListener('transitionend', function onEnd() {
                answer.removeEventListener('transitionend', onEnd);
                answer.setAttribute('hidden', '');
                answer.style.height = '';
                answer.style.transition = '';
                answer.classList.remove('is-animating');
            }, { once: true });
        }

        questions.forEach(btn => {
            btn.addEventListener('click', () => {
                const isOpen = btn.getAttribute('aria-expanded') === 'true';
                const answerId = btn.getAttribute('aria-controls');
                const answer = document.getElementById(answerId);
                if (!answer) return;

                if (isOpen) {
                    btn.setAttribute('aria-expanded', 'false');
                    closePanel(answer);
                } else {
                    // Close any currently open item first
                    questions.forEach(otherBtn => {
                        if (otherBtn !== btn && otherBtn.getAttribute('aria-expanded') === 'true') {
                            otherBtn.setAttribute('aria-expanded', 'false');
                            const otherId = otherBtn.getAttribute('aria-controls');
                            const otherAnswer = document.getElementById(otherId);
                            if (otherAnswer) closePanel(otherAnswer);
                        }
                    });
                    btn.setAttribute('aria-expanded', 'true');
                    openPanel(answer);
                }
            });
        });
    }

    // ─── Nav Dropdown & Mobile Accordion ──────────────────────────
    function initNavDropdown() {
        const pathname = window.location.pathname;
        const isServicesSubpage = pathname.includes('/szolgaltatasok/') || 
                                  pathname.includes('/sluzby/') || 
                                  pathname.includes('/services/');

        // Desktop dropdown
        const dropdown = document.getElementById('servicesDropdown');
        if (dropdown) {
            const trigger = dropdown.querySelector('.nav-dropdown-trigger');
            const menu = dropdown.querySelector('.nav-dropdown-menu, .dropdown-menu');
            let hoverOpenTimeout, hoverCloseTimeout;

            // Ensure active class on services subpages
            if (isServicesSubpage && trigger && !trigger.classList.contains('active')) {
                trigger.classList.add('active');
            }

            function openDropdown() {
                dropdown.classList.add('open');
                if (trigger) trigger.setAttribute('aria-expanded', 'true');
            }

            function closeDropdown() {
                dropdown.classList.remove('open');
                if (trigger) trigger.setAttribute('aria-expanded', 'false');
            }

            // Click toggle
            if (trigger) {
                trigger.addEventListener('click', (e) => {
                    e.stopPropagation();
                    if (dropdown.classList.contains('open')) {
                        closeDropdown();
                    } else {
                        openDropdown();
                    }
                });
            }

            // Hover open/close with delay (desktop only above 1050px)
            dropdown.addEventListener('mouseenter', () => {
                if (window.innerWidth <= 1050) return;
                clearTimeout(hoverCloseTimeout);
                hoverOpenTimeout = setTimeout(openDropdown, 150);
            });

            dropdown.addEventListener('mouseleave', () => {
                if (window.innerWidth <= 1050) return;
                clearTimeout(hoverOpenTimeout);
                hoverCloseTimeout = setTimeout(closeDropdown, 300);
            });

            // Click outside closes
            document.addEventListener('click', (e) => {
                if (!dropdown.contains(e.target)) {
                    closeDropdown();
                }
            });

            // Escape key closes
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape' && dropdown.classList.contains('open')) {
                    closeDropdown();
                    if (trigger) trigger.focus();
                }
            });
        }

        // Mobile accordion
        const accordion = document.getElementById('mobileServicesAccordion');
        if (accordion) {
            const accTrigger = accordion.querySelector('.mobile-nav-accordion-trigger');
            if (isServicesSubpage && accTrigger && !accTrigger.classList.contains('active')) {
                accTrigger.classList.add('active');
            }
            if (accTrigger) {
                accTrigger.addEventListener('click', () => {
                    const isOpen = accordion.classList.contains('open');
                    accordion.classList.toggle('open');
                    accTrigger.setAttribute('aria-expanded', isOpen ? 'false' : 'true');
                });
            }
        }
    }

    initNavDropdown();
    initFaqAccordion();
});

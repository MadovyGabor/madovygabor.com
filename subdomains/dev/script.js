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

// Photo lightbox: full-screen viewer for .photo-card images
document.addEventListener('DOMContentLoaded', () => {
    const cards = Array.from(document.querySelectorAll('.photo-card'));
    if (!cards.length) return;

    const lang = (document.documentElement.lang || 'en').slice(0, 2);
    const t = {
        en: { open: 'View full screen', close: 'Close', prev: 'Previous photo', next: 'Next photo' },
        hu: { open: 'Megnyitás teljes képernyőn', close: 'Bezárás', prev: 'Előző kép', next: 'Következő kép' },
        sk: { open: 'Zobraziť na celú obrazovku', close: 'Zavrieť', prev: 'Predchádzajúca fotografia', next: 'Ďalšia fotografia' }
    }[lang] || {};
    const L = Object.assign({ open: 'View full screen', close: 'Close', prev: 'Previous photo', next: 'Next photo' }, t);

    const icon = {
        expand: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/></svg>',
        close: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>',
        prev: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 5l-7 7 7 7"/></svg>',
        next: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 5l7 7-7 7"/></svg>'
    };

    const items = cards.map(card => {
        const a = card.querySelector('.media-figure-frame');
        const img = card.querySelector('img');
        const title = card.querySelector('.media-figure-title');
        const desc = card.querySelector('.media-figure-desc');
        return {
            card, a,
            src: (a && a.getAttribute('href')) || img.getAttribute('src'),
            alt: img.getAttribute('alt') || '',
            title: title ? title.textContent.trim() : '',
            desc: desc ? desc.textContent.trim() : ''
        };
    });

    const box = document.createElement('div');
    box.className = 'lightbox';
    box.setAttribute('role', 'dialog');
    box.setAttribute('aria-modal', 'true');
    box.hidden = true;
    box.innerHTML =
        '<button type="button" class="lightbox-btn lightbox-close" aria-label="' + L.close + '">' + icon.close + '</button>' +
        '<button type="button" class="lightbox-btn lightbox-prev" aria-label="' + L.prev + '">' + icon.prev + '</button>' +
        '<figure class="lightbox-figure"><img class="lightbox-img" alt=""><figcaption class="lightbox-caption">' +
        '<span class="lightbox-title"></span><span class="lightbox-desc"></span><span class="lightbox-count"></span></figcaption></figure>' +
        '<button type="button" class="lightbox-btn lightbox-next" aria-label="' + L.next + '">' + icon.next + '</button>';
    document.body.appendChild(box);

    const imgEl = box.querySelector('.lightbox-img');
    const titleEl = box.querySelector('.lightbox-title');
    const descEl = box.querySelector('.lightbox-desc');
    const countEl = box.querySelector('.lightbox-count');
    const closeBtn = box.querySelector('.lightbox-close');
    const multi = items.length > 1;
    if (!multi) box.classList.add('lightbox-single');

    let index = 0;
    let lastFocus = null;

    const show = i => {
        index = (i + items.length) % items.length;
        const it = items[index];
        imgEl.src = it.src;
        imgEl.alt = it.alt;
        titleEl.textContent = it.title;
        descEl.textContent = it.desc;
        countEl.textContent = multi ? (index + 1) + ' / ' + items.length : '';
        box.setAttribute('aria-label', it.title || it.alt);
    };

    const open = i => {
        lastFocus = document.activeElement;
        show(i);
        box.hidden = false;
        document.documentElement.classList.add('lightbox-open');
        requestAnimationFrame(() => box.classList.add('is-visible'));
        closeBtn.focus();
    };

    const close = () => {
        box.classList.remove('is-visible');
        document.documentElement.classList.remove('lightbox-open');
        setTimeout(() => { box.hidden = true; imgEl.removeAttribute('src'); }, 200);
        if (lastFocus) lastFocus.focus();
    };

    items.forEach((it, i) => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'photo-expand';
        btn.setAttribute('aria-label', L.open + (it.title ? ': ' + it.title : ''));
        btn.title = L.open;
        btn.innerHTML = icon.expand;
        btn.addEventListener('click', e => { e.preventDefault(); e.stopPropagation(); open(i); });
        it.card.appendChild(btn);
        if (it.a) it.a.addEventListener('click', e => { e.preventDefault(); open(i); });
    });

    closeBtn.addEventListener('click', close);
    box.querySelector('.lightbox-prev').addEventListener('click', () => show(index - 1));
    box.querySelector('.lightbox-next').addEventListener('click', () => show(index + 1));
    box.addEventListener('click', e => { if (e.target === box || e.target.classList.contains('lightbox-figure')) close(); });

    document.addEventListener('keydown', e => {
        if (box.hidden) return;
        if (e.key === 'Escape') close();
        else if (e.key === 'ArrowLeft' && multi) show(index - 1);
        else if (e.key === 'ArrowRight' && multi) show(index + 1);
        else if (e.key === 'Tab') {
            const f = Array.from(box.querySelectorAll('button')).filter(b => b.offsetParent !== null);
            const first = f[0], last = f[f.length - 1];
            if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
            else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
        }
    });

    let startX = null;
    box.addEventListener('touchstart', e => { startX = e.touches[0].clientX; }, { passive: true });
    box.addEventListener('touchend', e => {
        if (startX === null || !multi) return;
        const dx = e.changedTouches[0].clientX - startX;
        if (Math.abs(dx) > 50) show(index + (dx < 0 ? 1 : -1));
        startX = null;
    });
});

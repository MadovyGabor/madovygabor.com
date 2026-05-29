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
            // LEFELÉ GÖRGETÉS: Bekapcsoljuk a finom mágnest
            htmlElement.style.scrollSnapType = "y proximity";
        } else if (currentScrollTop < lastScrollTop) {
            // FELFELÉ GÖRGETÉS: Teljesen lekapcsoljuk, hogy ne akadjon meg
            htmlElement.style.scrollSnapType = "none";
        }

        // Puffer, hogy ne triggereljen be mikromozgásokra az oldal tetején/alján
        lastScrollTop = currentScrollTop <= 0 ? 0 : currentScrollTop;
    }, { passive: true });
});

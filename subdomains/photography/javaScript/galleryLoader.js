// Translation and Path Configuration Systems
const categoryTranslations = {
    en: {
        'Koncertek': 'Concerts',
        'Portrék': 'Portraits',
        'Rendezvények': 'Events',
        'Travel': 'Travel',
        'Hajómalom fesztivál 25': 'Hajómalom Festival 25',
        'Hajomalom fesztivál 26': 'Hajómalom Festival 26',
        'Azahriah Puskás Aréna': 'Azahriah Puskas Arena',
        'Portréim': 'My Portraits',
        'AMTS 25': 'AMTS 25',
        'Felsőszeli ballagás 24': 'Felsőszeli Graduation 24',
        'Rákoczi tábor 24': 'Rákóczi Camp 24',
        'Brno': 'Brno',
        'Tatranská Lomnica': 'Tatranská Lomnica',
        'Ingatlan & Enteriőr': 'Real Estate & Interior',
        'AVA Chatka Motýlik': 'AVA Chatka Motýlik',
        'Apartmánový dom': 'Apartment House',
        'AVA NIGHT 26': 'AVA Night 26',
        'Hangulat': 'Atmosphere',
        'Fesztivál hangulatképek': 'Festival Atmosphere',
        'Csoportképek': 'Group Photos',
        'AVA WARRIORS NIGHT': 'AVA Warriors Night',
        'FERDINAND VS KOSTOVSKI': 'Ferdinand vs Kostovski',
        'OROSZI VS BOLEDOVIČ': 'Oroszi vs Boledovič',
        'Alsószeli Díjátadó': 'Dolné Saliby Awards Gala'
    },
    sk: {
        'Koncertek': 'Koncerty',
        'Portrék': 'Portréty',
        'Rendezvények': 'Podujatia',
        'Travel': 'Cestovanie',
        'Hajómalom fesztivál 25': 'Hajómalom festival 25',
        'Hajomalom fesztivál 26': 'Hajómalom festival 26',
        'Azahriah Puskás Aréna': 'Azahriah Puskas Arena',
        'Portréim': 'Moje portréty',
        'AMTS 25': 'AMTS 25',
        'Felsőszeli ballagás 24': 'Felsőszeli rozlúčka 24',
        'Rákoczi tábor 24': 'Rákócziho tábor 24',
        'Brno': 'Brno',
        'Tatranská Lomnica': 'Tatranská Lomnica',
        'Ingatlan & Enteriőr': 'Nehnuteľnosti & Interiér',
        'AVA Chatka Motýlik': 'AVA Chatka Motýlik',
        'Apartmánový dom': 'Apartmánový dom',
        'AVA NIGHT 26': 'AVA Night 26',
        'Hangulat': 'Atmosféra',
        'Fesztivál hangulatképek': 'Festivalová atmosféra',
        'Csoportképek': 'Skupinové fotografie',
        'AVA WARRIORS NIGHT': 'AVA Warriors Night',
        'FERDINAND VS KOSTOVSKI': 'Ferdinand vs Kostovski',
        'OROSZI VS BOLEDOVIČ': 'Oroszi vs Boledovič',
        'Alsószeli Díjátadó': 'Odovzdávanie cien Dolné Saliby'
    },
    hu: {
        'Travel': 'Utazás',
        'Ingatlan & Enteriőr': 'Ingatlan & Enteriőr',
        'AVA Chatka Motýlik': 'AVA Chatka Motýlik',
        'Apartmánový dom': 'Apartmanház',
        'AVA NIGHT 26': 'AVA Night 26',
        'Hajomalom fesztivál 26': 'Hajómalom fesztivál 26',
        'Hangulat': 'Hangulat',
        'Fesztivál hangulatképek': 'Fesztivál hangulatképek',
        'Csoportképek': 'Csoportképek',
        'AVA WARRIORS NIGHT': 'AVA Warriors Night',
        'FERDINAND VS KOSTOVSKI': 'Ferdinand vs Kostovski',
        'OROSZI VS BOLEDOVIČ': 'Oroszi vs Boledovič',
        'Alsószeli Díjátadó': 'Alsószeli Díjátadó'
    }
};

const uiTranslations = {
    hu: {
        all: 'MINDEN',
        imagePreview: 'Kép előnézet',
        closePreview: 'Előnézet bezárása',
        fullscreenBtn: 'Megnyitás teljes méretben',
        prevImage: 'Előző kép',
        nextImage: 'Következő kép',
        loadError: 'A galéria betöltése nem sikerült. Ellenőrizd az internetkapcsolatot, majd próbáld újra.',
        retry: 'Újrapróbálás'
    },
    en: {
        all: 'ALL',
        imagePreview: 'Image preview',
        closePreview: 'Close preview',
        fullscreenBtn: 'Fullscreen view',
        prevImage: 'Previous image',
        nextImage: 'Next image',
        loadError: 'The gallery could not be loaded. Check your connection and try again.',
        retry: 'Try again'
    },
    sk: {
        all: 'VŠETKO',
        imagePreview: 'Náhľad obrázka',
        closePreview: 'Zatvoriť náhľad',
        fullscreenBtn: 'Otvoriť na celú obrazovku',
        prevImage: 'Predchádzajúci obrázok',
        nextImage: 'Nasledujúci obrázok',
        loadError: 'Galériu sa nepodarilo načítať. Skontrolujte pripojenie a skúste to znova.',
        retry: 'Skúsiť znova'
    }
};

function t(text) {
    const lang = document.documentElement.lang || 'hu';
    if (categoryTranslations[lang] && categoryTranslations[lang][text]) {
        return categoryTranslations[lang][text];
    }
    return text;
}

function tUI(key) {
    const lang = document.documentElement.lang || 'hu';
    const pack = uiTranslations[lang] || uiTranslations.hu;
    return pack[key] || uiTranslations.hu[key] || key;
}

// ---------------------------------------------------------------------------
// State & URL helpers
// ---------------------------------------------------------------------------
let currentCategory = 'all';
let galleryUiWired = false;

// Guarantees unique section ids (first occurrence keeps its id; duplicates get a
// parent-prefix, then a numeric suffix). Idempotent: ids that are already unique are untouched.
function assignUniqueIds(data) {
    const seen = new Set();
    const unique = (candidate, parentId) => {
        if (!seen.has(candidate)) return candidate;
        if (parentId) {
            const prefixed = `${parentId}-${candidate}`;
            if (!seen.has(prefixed)) return prefixed;
            candidate = prefixed;
        }
        let n = 2;
        while (seen.has(`${candidate}-${n}`)) n++;
        return `${candidate}-${n}`;
    };
    const walk = (nodes, parentId) => {
        (nodes || []).forEach(node => {
            node.id = unique(node.id, parentId);
            seen.add(node.id);
            walk(node.subsections, node.id);
        });
    };
    walk(data, '');
}

function sectionExists(nodes, id) {
    return (nodes || []).some(n => n.id === id || sectionExists(n.subsections, id));
}

function getCategoryFromUrl(data) {
    try {
        const c = new URLSearchParams(window.location.search).get('category');
        if (c && data.some(cat => cat.id === c)) return c;
    } catch (e) { /* ignore malformed URLs */ }
    return 'all';
}

function syncCategoryToUrl(categoryId) {
    try {
        const url = new URL(window.location.href);
        if (categoryId === 'all') url.searchParams.delete('category');
        else url.searchParams.set('category', categoryId);
        history.replaceState(history.state, '', url.pathname + url.search + url.hash);
    } catch (e) { /* history API unavailable */ }
}

function updateFilterButtons(categoryId) {
    document.querySelectorAll('.filter-btn').forEach(btn => {
        const on = btn.dataset.category === categoryId;
        btn.classList.toggle('active', on);
        btn.setAttribute('aria-pressed', on ? 'true' : 'false');
    });
}

function setCategory(categoryId, opts = {}) {
    const data = window.galleryData;
    if (!data) return;
    if (categoryId !== 'all' && !data.some(c => c.id === categoryId)) categoryId = 'all';
    currentCategory = categoryId;
    updateFilterButtons(categoryId);
    initGallery(data, categoryId);
    renderSidebar(data, categoryId);
    if (opts.updateUrl !== false) syncCategoryToUrl(categoryId);
}

// Smooth-scroll to the album named in the URL hash. If the target is hidden by the
// active category filter, reset the filter to "all" first.
function scrollToAnchorHash() {
    if (!window.location.hash) return;
    let hashId;
    try {
        hashId = decodeURIComponent(window.location.hash.substring(1));
    } catch (e) {
        return;
    }
    let targetEl = document.getElementById(hashId);
    if (!targetEl && currentCategory !== 'all' && window.galleryData && sectionExists(window.galleryData, hashId)) {
        setCategory('all');
        targetEl = document.getElementById(hashId);
    }
    if (targetEl) {
        setTimeout(() => {
            targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 120);
    }
}

function showGalleryError() {
    const container = document.getElementById('dynamicGalleryContainer');
    if (!container) return;
    container.innerHTML = '';
    const box = document.createElement('div');
    box.className = 'gallery-error';
    box.setAttribute('role', 'alert');

    const msg = document.createElement('p');
    msg.textContent = tUI('loadError');
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'gallery-error-retry';
    btn.textContent = tUI('retry');
    btn.addEventListener('click', () => {
        btn.disabled = true;
        loadGallery();
    });

    box.appendChild(msg);
    box.appendChild(btn);
    container.appendChild(box);
}

function loadGallery() {
    const dataPath = window.galleryDataPath || '../galleryData.json';
    return fetch(dataPath)
        .then(response => {
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            return response.json();
        })
        .then(data => {
            if (!Array.isArray(data)) throw new Error('Invalid gallery data');
            assignUniqueIds(data);
            window.galleryData = data; // store globally for filtering
            currentCategory = getCategoryFromUrl(data);
            initFilterButtons(data);
            renderSidebar(data, currentCategory);
            initGallery(data, currentCategory);
            scrollToAnchorHash();
        })
        .catch(error => {
            console.error('Error loading gallery data:', error);
            showGalleryError();
        });
}

function wireGalleryUi() {
    if (galleryUiWired) return;
    galleryUiWired = true;

    window.addEventListener('hashchange', scrollToAnchorHash);

    // Top-level "All" link: scroll to top
    const allLink = document.querySelector('.sidebar-link[data-category="all"]');
    if (allLink) {
        allLink.addEventListener('click', (e) => {
            e.preventDefault();
            // Close the drawer first: unlocking the page restores the old scroll position,
            // which would otherwise cancel the scroll to the top that follows.
            if (window.innerWidth < 1024) closeSidebarDrawer();
            // Phones (iOS Safari especially) ignore a scroll that is issued in the same moment the
            // page is unlocked, so wait two frames, and jump instantly if the smooth scroll did not run.
            requestAnimationFrame(() => requestAnimationFrame(() => {
                window.scrollTo({ top: 0, behavior: 'smooth' });
                setTimeout(() => { if (window.scrollY > 2) window.scrollTo(0, 0); }, 1200);
            }));

            document.querySelectorAll('.sidebar-link, .sidebar-sublink').forEach(link => {
                link.classList.remove('active');
            });
            allLink.classList.add('active');
        });
    }

    // Floating TOC button and overlay (mobile/tablet)
    const sidebarToggleBtnEl = document.getElementById('sidebarToggleBtn');
    const sidebarOverlayEl = document.getElementById('sidebarOverlay');
    if (sidebarToggleBtnEl) {
        sidebarToggleBtnEl.setAttribute('aria-expanded', 'false');
        sidebarToggleBtnEl.setAttribute('aria-controls', 'dynamicSidebarNav');
        sidebarToggleBtnEl.addEventListener('click', () => {
            const sidebar = document.querySelector('.sidebar-container');
            if (sidebar && sidebar.classList.contains('mobile-open')) {
                closeSidebarDrawer();
            } else {
                openSidebarDrawer();
            }
        });
    }
    if (sidebarOverlayEl) {
        sidebarOverlayEl.addEventListener('click', closeSidebarDrawer);
    }
}

document.addEventListener("DOMContentLoaded", () => {
    wireGalleryUi();
    loadGallery();
});

// Recursive image counter for categories/sections/subsections
function countImages(item) {
    let count = 0;
    if (item.images) {
        count += item.images.length;
    }
    if (item.subsections) {
        item.subsections.forEach(sub => {
            count += countImages(sub);
        });
    }
    return count;
}

// Responsive column count based on viewport width
function getColumnCount() {
    if (window.innerWidth < 640) return 1;
    if (window.innerWidth < 1024) return 2;
    return 3;
}

// Mobile sidebar drawer helpers
function openSidebarDrawer() {
    const sidebar = document.querySelector('.sidebar-container');
    const overlay = document.getElementById('sidebarOverlay');
    const btn = document.getElementById('sidebarToggleBtn');
    if (sidebar) sidebar.classList.add('mobile-open');
    if (overlay) { overlay.style.display = 'block'; requestAnimationFrame(() => overlay.classList.add('active')); }
    if (window.pageScrollLock) window.pageScrollLock.lock('sidebar');
    handleScrollSpy();
    requestAnimationFrame(() => {
        const current = document.querySelector('.sidebar-sublink.active, .sidebar-link.active');
        if (current) keepSidebarLinkVisible(current);
    });
    if (btn) {
        btn.setAttribute('aria-expanded', 'true');
        btn.innerHTML = ICONS.close;
    }
}

function closeSidebarDrawer() {
    const sidebar = document.querySelector('.sidebar-container');
    const overlay = document.getElementById('sidebarOverlay');
    const btn = document.getElementById('sidebarToggleBtn');
    if (sidebar) sidebar.classList.remove('mobile-open');
    if (overlay) {
        overlay.classList.remove('active');
        setTimeout(() => { if (!overlay.classList.contains('active')) overlay.style.display = 'none'; }, 300);
    }
    if (window.pageScrollLock) window.pageScrollLock.unlock('sidebar');
    if (btn) {
        btn.setAttribute('aria-expanded', 'false');
        btn.innerHTML = ICONS.toc;
    }
}

const ICONS = {
    fullscreen: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden="true"><path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z"/></svg>',
    close: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="currentColor" aria-hidden="true"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>',
    toc: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="currentColor" aria-hidden="true"><path d="M3 9h14V7H3v2zm0 4h14v-2H3v2zm0 4h14v-2H3v2zm16 0h2v-2h-2v2zm0-10v2h2V7h-2zm0 6h2v-2h-2v2z"/></svg>',
    graphic_eq: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true"><path d="M7 18h2V6H7v12zm4 4h2V2h-2v20zm-8-8h2v-4H3v4zm12 4h2V6h-2v12zm4-8v4h2v-4h-2z"/></svg>',
    portrait: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true"><path d="M12 12c1.65 0 3-1.35 3-3s-1.35-3-3-3-3 1.35-3 3 1.35 3 3 3zm0-4c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm6 8.58c0-2.5-3.97-3.58-6-3.58s-6 1.08-6 3.58V18h12v-1.42zM8.48 16c.74-.51 2.23-1 3.52-1s2.78.49 3.52 1H8.48zM19 3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14z"/></svg>',
    stadium: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true"><path d="M7 5L3 7V3l4 2zm11-2v4l4-2-4-2zm-7-1v4l4-2-4-2zm2 16h-2l0 4c-5.05-.15-9-1.44-9-3v-9c0-1.66 4.48-3 10-3s10 1.34 10 3v9c0 1.56-3.95 2.85-9 3l0-4zM5 10.04C6.38 10.53 8.77 11 12 11s5.62-.47 7-.96C19 9.86 16.22 9 12 9s-7 .86-7 1.04zM20 11.8c-1.82.73-4.73 1.2-8 1.2s-6.18-.47-8-1.2v6.78c.61.41 2.36 1.01 5 1.28V16h6v3.86c2.64-.27 4.39-.87 5-1.28V11.8z"/></svg>',
    explore: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-5.5-2.5l7.51-3.49L17.5 6.5 9.99 9.99 6.5 17.5zm5.5-6.6c.61 0 1.1.49 1.1 1.1s-.49 1.1-1.1 1.1-1.1-.49-1.1-1.1.49-1.1 1.1-1.1z"/></svg>',
    home: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true"><path d="M12 5.69l5 4.5V18h-2v-6H9v6H7v-7.81l5-4.5M12 3L2 12h3v8h6v-6h2v6h6v-8h3L12 3z"/></svg>',
    photo_camera: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true"><path d="M14.12 4l1.83 2H20v12H4V6h4.05l1.83-2h4.24M15 2H9L7.17 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2h-3.17L15 2zm-3 7c1.65 0 3 1.35 3 3s-1.35 3-3 3-3-1.35-3-3 1.35-3 3-3m0-2c-2.76 0-5 2.24-5 5s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5z"/></svg>'
};

const categoryIcons = {
    'koncertek': 'graphic_eq',
    'portrek': 'portrait',
    'rendezvenyek': 'stadium',
    'travel': 'explore',
    'ingatlan-enterior': 'home'
};

function getCategoryIconSvg(categoryId) {
    const iconName = categoryIcons[categoryId] || 'photo_camera';
    return ICONS[iconName] || ICONS.photo_camera;
}


function initFilterButtons(data) {
    const filterContainer = document.getElementById('dynamicFilterButtons');
    if (!filterContainer) return;

    filterContainer.innerHTML = '';

    const makeBtn = (categoryId, label) => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'filter-btn';
        btn.dataset.category = categoryId;
        btn.textContent = label;
        btn.setAttribute('aria-pressed', 'false');
        filterContainer.appendChild(btn);
    };

    makeBtn('all', tUI('all'));
    data.forEach(category => makeBtn(category.id, t(category.title).toUpperCase()));
    updateFilterButtons(currentCategory);

    // Bind the click handler only once (loadGallery may run again after an error)
    if (filterContainer.dataset.bound === '1') return;
    filterContainer.dataset.bound = '1';

    filterContainer.addEventListener('click', (e) => {
        const btn = e.target.closest('.filter-btn');
        if (!btn) return;

        // Close mobile nav drawer if active
        const mobileNav = document.getElementById('mobileNavOverlay');
        if (mobileNav && mobileNav.classList.contains('active')) {
            mobileNav.classList.remove('active');
            if (window.pageScrollLock) window.pageScrollLock.unlock('nav');
        }

        setCategory(btn.dataset.category);

        // Smooth scroll to top of gallery
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
}

function renderSidebar(data, activeCategoryId) {
    const list = document.getElementById('sidebarCategoryList');
    if (!list) return;
    list.innerHTML = '';

    const allLink = document.querySelector('.sidebar-link[data-category="all"]');
    if (allLink) {
        allLink.href = "#mainGalleryTitle";
        if (activeCategoryId === 'all') {
            allLink.classList.add('active');
        } else {
            allLink.classList.remove('active');
        }
    }

    if (activeCategoryId === 'all') {
        data.forEach(category => {
            // Render Level 1 Category Title (non-clickable)
            const catTitle = document.createElement('div');
            catTitle.className = 'sidebar-category-title';
            catTitle.textContent = t(category.title);
            list.appendChild(catTitle);

            if (category.subsections) {
                category.subsections.forEach(sub => {
                    const link = document.createElement('a');
                    link.href = `#${sub.id}`;
                    link.className = 'sidebar-link';

                    const imgCount = countImages(sub);
                    const iconSvg = getCategoryIconSvg(category.id);

                    link.innerHTML = `
                        <div class="link-inner">
                            ${iconSvg}
                            <span>${t(sub.title)}</span>
                        </div>
                        <span class="link-count">${imgCount}</span>
                    `;
                    link.addEventListener('click', () => { if (window.innerWidth < 1024) closeSidebarDrawer(); });
                    list.appendChild(link);

                    // Level 3 subsections
                    if (sub.subsections) {
                        const sublist = document.createElement('ul');
                        sublist.className = 'sidebar-sublist';

                        sub.subsections.forEach(sub3 => {
                            const li = document.createElement('li');
                            const sublink = document.createElement('a');
                            sublink.href = `#${sub3.id}`;
                            sublink.className = 'sidebar-sublink';
                            sublink.innerHTML = `${t(sub3.title)} <span style="opacity: 0.7; font-size: 9px; margin-left: 4px;">(${countImages(sub3)})</span>`;
                            sublink.addEventListener('click', () => { if (window.innerWidth < 1024) closeSidebarDrawer(); });
                            li.appendChild(sublink);
                            sublist.appendChild(li);
                        });
                        list.appendChild(sublist);
                    }
                });
            }
        });
    } else {
        const category = data.find(cat => cat.id === activeCategoryId);
        if (category && category.subsections) {
            category.subsections.forEach(sub => {
                const link = document.createElement('a');
                link.href = `#${sub.id}`;
                link.className = 'sidebar-link';

                const imgCount = countImages(sub);
                const iconSvg = getCategoryIconSvg(category.id);

                link.innerHTML = `
                    <div class="link-inner">
                        ${iconSvg}
                        <span>${t(sub.title)}</span>
                    </div>
                    <span class="link-count">${imgCount}</span>
                `;
                link.addEventListener('click', () => { if (window.innerWidth < 1024) closeSidebarDrawer(); });
                list.appendChild(link);

                // Level 3 subsections
                if (sub.subsections) {
                    const sublist = document.createElement('ul');
                    sublist.className = 'sidebar-sublist';

                    sub.subsections.forEach(sub3 => {
                        const li = document.createElement('li');
                        const sublink = document.createElement('a');
                        sublink.href = `#${sub3.id}`;
                        sublink.className = 'sidebar-sublink';
                        sublink.innerHTML = `${t(sub3.title)} <span style="opacity: 0.7; font-size: 9px; margin-left: 4px;">(${countImages(sub3)})</span>`;
                        sublink.addEventListener('click', () => { if (window.innerWidth < 1024) closeSidebarDrawer(); });
                        li.appendChild(sublink);
                        sublist.appendChild(li);
                    });
                    list.appendChild(sublist);
                }
            });
        }
    }

    // Set up ScrollSpy
    initScrollSpy();
}

function initGallery(data, filterCategoryId) {
    const container = document.getElementById('dynamicGalleryContainer');
    if (!container) return;
    container.innerHTML = ''; // Clear current gallery items

    data.forEach(category => {
        if (filterCategoryId !== 'all' && category.id !== filterCategoryId) return;

        if (category.subsections) {
            category.subsections.forEach(sub => {
                // If it has Level 3 subsections
                if (sub.subsections) {
                    // Render Level 2 Header
                    const h2Header = document.createElement('div');
                    h2Header.className = 'group-header';
                    h2Header.id = sub.id;
                    h2Header.innerHTML = `
                        <h2>${t(sub.title)}</h2>
                        <div class="group-line"></div>
                        <span class="group-label">${t(category.title).toUpperCase()}</span>
                    `;
                    container.appendChild(h2Header);

                    // Render Level 3 subsections
                    sub.subsections.forEach(sub3 => {
                        const h3Header = document.createElement('div');
                        h3Header.className = 'group-header';
                        h3Header.id = sub3.id;
                        h3Header.innerHTML = `
                            <h3>${t(sub3.title)}</h3>
                            <div class="group-line"></div>
                            <span class="group-label">${t(sub.title).toUpperCase()}</span>
                        `;
                        container.appendChild(h3Header);

                        renderMasonryGrid(container, sub3.images, t(sub.title), t(sub3.title));
                    });
                } else {
                    // Level 2 Section with direct images
                    const h2Header = document.createElement('div');
                    h2Header.className = 'group-header';
                    h2Header.id = sub.id;
                    h2Header.innerHTML = `
                        <h2>${t(sub.title)}</h2>
                        <div class="group-line"></div>
                        <span class="group-label">${t(category.title).toUpperCase()}</span>
                    `;
                    container.appendChild(h2Header);

                    renderMasonryGrid(container, sub.images, t(category.title), t(sub.title));
                }
            });
        }
    });

    // Re-run ScrollSpy since headers were re-created
    initScrollSpy();
}

const GALLERY_SIZES = '(max-width: 639px) 100vw, (max-width: 1023px) 50vw, 30vw';

function encodeAssetPath(path) {
    return encodeURI(path).replace(/,/g, '%2C');
}

// Builds <source>/<img> srcset data from an image entry ({ base, widths, formats }); null if unavailable
function buildResponsiveSources(imgData, prefix) {
    if (!imgData || typeof imgData !== 'object' || !imgData.base || !Array.isArray(imgData.widths) || !imgData.widths.length) {
        return null;
    }
    const widths = imgData.widths.slice().sort((a, b) => a - b);
    const formats = Array.isArray(imgData.formats) && imgData.formats.length ? imgData.formats : ['webp'];
    if (!formats.includes('webp')) return null; // webp is the universal fallback
    const basePath = encodeAssetPath(prefix + imgData.base);
    const makeSet = (fmt) => widths.map(w => `${basePath}-${w}.${fmt} ${w}w`).join(', ');

    // AVIF <source> first; the <img> itself carries the WebP srcset as fallback
    const sources = formats.includes('avif') ? [{ type: 'image/avif', srcset: makeSet('avif') }] : [];
    const midWidth = widths[Math.min(1, widths.length - 1)];
    return {
        sources,
        fallbackSrcset: makeSet('webp'),
        fallbackSrc: `${basePath}-${midWidth}.webp`,
        fullSrc: `${basePath}-${widths[widths.length - 1]}.webp`
    };
}

function renderMasonryGrid(container, images, categoryLabel, sectionTitle) {
    if (!images || images.length === 0) return;

    const tilesDiv = document.createElement('div');
    tilesDiv.className = 'gallery-tiles';

    // Masonry layout: one flex column per breakpoint, with cumulative column heights
    // (in units of width, i.e. 1 / aspectRatio) tracked for balanced placement
    const numCols = getColumnCount();
    const columns = [];
    const colHeights = new Array(numCols).fill(0);
    for (let i = 0; i < numCols; i++) {
        const col = document.createElement('div');
        col.className = 'gallery-row';
        tilesDiv.appendChild(col);
        columns.push(col);
    }

    images.forEach((imgData, imageIndex) => {
        const prefix = window.galleryPathPrefix || '';
        const rawSrc = typeof imgData === 'string' ? imgData : imgData.src;
        const src = prefix + rawSrc;
        const aspectRatio = (typeof imgData === 'object' && imgData.aspect_ratio) ? imgData.aspect_ratio : 1.5;

        // Retrieve or generate alt text (supports localized object { hu, sk, en } or string)
        const currentLang = document.documentElement.lang || 'hu';
        let altText = '';
        if (typeof imgData === 'object' && imgData.alt) {
            if (typeof imgData.alt === 'object' && imgData.alt !== null) {
                altText = imgData.alt[currentLang] || imgData.alt.hu || imgData.alt.sk || imgData.alt.en || '';
            } else {
                altText = imgData.alt;
            }
        } else {
            const filenameWithExt = rawSrc.substring(rawSrc.lastIndexOf('/') + 1);
            const filename = filenameWithExt.substring(0, filenameWithExt.lastIndexOf('.'));
            const cleanName = filename.replace(/[-_]/g, ' ').replace(/\(\d+\)/g, '').trim();
            altText = cleanName.charAt(0).toUpperCase() + cleanName.slice(1);
        }

        let titleText = '';
        if (typeof imgData === 'object' && imgData.title) {
            if (typeof imgData.title === 'object' && imgData.title !== null) {
                titleText = imgData.title[currentLang] || imgData.title.hu || imgData.title.sk || imgData.title.en || '';
            } else {
                titleText = imgData.title;
            }
        }

        const imgContainer = document.createElement('div');
        imgContainer.className = 'img-container skeleton skeleton-shimmer';
        imgContainer.style.aspectRatio = aspectRatio;
        imgContainer.dataset.i = String(imageIndex); // original order, independent of masonry column
        imgContainer.setAttribute('role', 'button');
        imgContainer.setAttribute('tabindex', '0');
        imgContainer.setAttribute('aria-label', `${tUI('fullscreenBtn')}: ${altText}`);

        const img = document.createElement('img');
        img.alt = altText;
        if (titleText) {
            img.title = titleText;
        }
        img.loading = "lazy";
        img.decoding = "async";

        // Add dimension attributes for SEO & layout stability (CLS)
        if (typeof imgData === 'object' && imgData.width && imgData.height) {
            img.width = imgData.width;
            img.height = imgData.height;
            img.style.height = 'auto'; // allow CSS to override visual height while keeping the ratio
        }

        img.style.aspectRatio = aspectRatio;

        // Remove skeleton class from container once image loads/fails
        const handleImageDone = function () {
            img.classList.add('is-loaded');
            imgContainer.classList.remove('skeleton');
            imgContainer.classList.remove('skeleton-shimmer');
            imgContainer.classList.add('is-loaded');
        };
        img.onload = handleImageDone;
        img.onerror = handleImageDone;

        // Responsive variants (<picture> + srcset); falls back to the original file
        // when an image has no generated `widths` yet (backwards compatible)
        const responsive = buildResponsiveSources(imgData, prefix);
        let fullSrc = src;
        if (responsive) {
            const picture = document.createElement('picture');
            responsive.sources.forEach(srcInfo => {
                const source = document.createElement('source');
                source.type = srcInfo.type;
                source.srcset = srcInfo.srcset;
                source.sizes = GALLERY_SIZES;
                picture.appendChild(source);
            });
            img.srcset = responsive.fallbackSrcset;
            img.sizes = GALLERY_SIZES;
            picture.appendChild(img);
            imgContainer.appendChild(picture);
            img.src = responsive.fallbackSrc; // set src after onload/onerror so cache hits trigger the handler
            fullSrc = responsive.fullSrc;
        } else {
            img.src = src;
            imgContainer.appendChild(img);
        }
        imgContainer.dataset.full = fullSrc;

        const overlay = document.createElement('div');
        overlay.className = 'hud-overlay';
        overlay.innerHTML = `
            <div class="hud-top">
                <span class="hud-badge">${categoryLabel.toUpperCase()}</span>
            </div>
            <div class="hud-bottom">
                <div class="hud-details">
                    <span style="font-size: 14px; font-weight: bold; color: white; background: none; border: none; padding: 0; text-align: left;">${sectionTitle}</span>
                </div>
                <span class="hud-fullscreen" aria-hidden="true">
                    ${ICONS.fullscreen}
                </span>
            </div>
        `;
        imgContainer.appendChild(overlay);

        // The whole tile is the click/tap/keyboard target
        imgContainer.addEventListener('click', () => openGridLightbox(imgContainer));
        imgContainer.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                openGridLightbox(imgContainer);
            }
        });

        /**
         * Greedy column balancing:
         * Since column widths are uniform in flex masonry, rendered height is
         * proportional to (1 / aspectRatio). We track cumulative unit height per column
         * and append each photo to whichever column is currently the shortest.
         */
        let minColIndex = 0;
        for (let i = 1; i < numCols; i++) {
            if (colHeights[i] < colHeights[minColIndex]) {
                minColIndex = i;
            }
        }

        columns[minColIndex].appendChild(imgContainer);
        colHeights[minColIndex] += (1 / aspectRatio);
    });

    container.appendChild(tilesDiv);
}

let isScrollListenerAttached = false;
let lastActiveId = null;

let scrollSpyTicking = false;

function onScrollSpy() {
    if (scrollSpyTicking) return;
    scrollSpyTicking = true;
    requestAnimationFrame(() => {
        scrollSpyTicking = false;
        handleScrollSpy();
    });
}

// Keep the active sidebar link in view by scrolling the sidebar itself only,
// never the page (scrollIntoView with smooth behaviour fights the user's own scrolling).
function keepSidebarLinkVisible(link) {
    const container = link.closest('.sidebar-container');
    if (!container) return;
    const isDesktop = window.matchMedia('(min-width: 1024px)').matches;
    if (!isDesktop && !container.classList.contains('mobile-open')) return;
    const c = container.getBoundingClientRect();
    const l = link.getBoundingClientRect();
    if (l.top < c.top || l.bottom > c.bottom) {
        container.scrollTop += (l.top - c.top) - (c.height / 2);
    }
}

// While a drawer or menu is open the page is pinned with position:fixed and window.scrollY reads 0;
// the real position is kept in the body's negative top offset.
function getPageScrollY() {
    const b = document.body;
    if (b.style.position === 'fixed' && b.style.top) {
        const y = -parseFloat(b.style.top);
        if (!isNaN(y)) return y;
    }
    return window.scrollY;
}

function handleScrollSpy() {
    const headers = Array.from(document.querySelectorAll('.group-header'));
    const sidebarLinks = Array.from(document.querySelectorAll('.sidebar-link, .sidebar-sublink'));
    const allLink = document.querySelector('.sidebar-link[data-category="all"]');

    let activeId = null;
    const pageY = getPageScrollY();
    const scrollPosition = pageY + 120; // 120px offset to detect active section

    if (pageY < 100) {
        sidebarLinks.forEach(link => link.classList.remove('active'));
        if (allLink) allLink.classList.add('active');
        lastActiveId = null;
        return;
    }

    for (let i = 0; i < headers.length; i++) {
        const header = headers[i];
        const top = header.offsetTop;
        if (scrollPosition >= top) {
            activeId = header.getAttribute('id');
        } else {
            break;
        }
    }

    if (activeId) {
        if (allLink) allLink.classList.remove('active');

        const activeLinkChanged = (activeId !== lastActiveId);
        lastActiveId = activeId;

        sidebarLinks.forEach(link => {
            const href = link.getAttribute('href');
            if (href === `#${activeId}`) {
                if (!link.classList.contains('active')) link.classList.add('active');
                if (activeLinkChanged) keepSidebarLinkVisible(link);
            } else if (link.classList.contains('active')) {
                link.classList.remove('active');
            }
        });
    }
}

function initScrollSpy() {
    if (!isScrollListenerAttached) {
        window.addEventListener('scroll', onScrollSpy, { passive: true });
        isScrollListenerAttached = true;
    }
    handleScrollSpy();
}

// Remember which section is at the top of the viewport so a re-render (e.g. phone rotation) keeps position
function captureScrollAnchor() {
    const headers = Array.from(document.querySelectorAll('.group-header[id]'));
    if (!headers.length) return null;
    let chosen = headers[0];
    for (const h of headers) {
        if (h.getBoundingClientRect().top <= 120) chosen = h;
        else break;
    }
    return { id: chosen.id, top: chosen.getBoundingClientRect().top };
}

function restoreScrollAnchor(anchor) {
    if (!anchor) return;
    const el = document.getElementById(anchor.id);
    if (!el) return;
    const delta = el.getBoundingClientRect().top - anchor.top;
    if (delta) window.scrollBy({ top: delta, left: 0, behavior: 'instant' });
}

// Re-render gallery when column count changes on resize (debounced)
let galleryResizeTimer = null;
let lastGalleryColumnCount = getColumnCount();

window.addEventListener('resize', () => {
    clearTimeout(galleryResizeTimer);
    galleryResizeTimer = setTimeout(() => {
        const newCount = getColumnCount();
        if (newCount === lastGalleryColumnCount) return;
        lastGalleryColumnCount = newCount;
        if (!window.galleryData) return;
        const anchor = captureScrollAnchor();
        initGallery(window.galleryData, currentCategory);
        restoreScrollAnchor(anchor);
    }, 200);
});

// ---------------------------------------------------------------------------
// Lightbox v2
// ---------------------------------------------------------------------------
const lightboxState = {
    el: null, img: null, counter: null, closeBtn: null, prevBtn: null, nextBtn: null,
    items: [], index: 0, opener: null, isOpen: false, historyPushed: false,
    loadToken: 0, hideTimer: null, preload: []
};

function buildLightbox() {
    if (lightboxState.el) return;
    const s = lightboxState;

    const el = document.createElement('div');
    el.id = 'portfolio-lightbox';
    el.className = 'lightbox';
    el.setAttribute('role', 'dialog');
    el.setAttribute('aria-modal', 'true');
    el.setAttribute('aria-label', tUI('imagePreview'));
    el.tabIndex = -1;
    el.style.display = 'none';
    el.innerHTML = `
        <button type="button" class="lightbox-btn lightbox-close" aria-label="${tUI('closePreview')}">${ICONS.close}</button>
        <button type="button" class="lightbox-btn lightbox-nav lightbox-prev" aria-label="${tUI('prevImage')}">&#8249;</button>
        <button type="button" class="lightbox-btn lightbox-nav lightbox-next" aria-label="${tUI('nextImage')}">&#8250;</button>
        <div class="lightbox-stage"><img class="lightbox-img" id="lightbox-img" alt=""></div>
        <div class="lightbox-counter" aria-live="polite"></div>
    `;
    document.body.appendChild(el);

    s.el = el;
    s.img = el.querySelector('.lightbox-img');
    s.counter = el.querySelector('.lightbox-counter');
    s.closeBtn = el.querySelector('.lightbox-close');
    s.prevBtn = el.querySelector('.lightbox-prev');
    s.nextBtn = el.querySelector('.lightbox-next');
    const stage = el.querySelector('.lightbox-stage');

    s.closeBtn.addEventListener('click', () => closeLightbox());
    s.prevBtn.addEventListener('click', () => showLightboxImage(s.index - 1));
    s.nextBtn.addEventListener('click', () => showLightboxImage(s.index + 1));

    // Dismiss on backdrop click
    el.addEventListener('click', (e) => {
        if (e.target === el || e.target === stage) closeLightbox();
    });

    // Keyboard: arrows, Escape, focus trap
    document.addEventListener('keydown', (e) => {
        if (!s.isOpen) return;
        if (e.key === 'Escape') {
            e.preventDefault();
            closeLightbox();
        } else if (e.key === 'ArrowLeft' && s.items.length > 1) {
            e.preventDefault();
            showLightboxImage(s.index - 1);
        } else if (e.key === 'ArrowRight' && s.items.length > 1) {
            e.preventDefault();
            showLightboxImage(s.index + 1);
        } else if (e.key === 'Tab') {
            const focusables = [s.closeBtn, s.prevBtn, s.nextBtn].filter(b => !b.hidden && b.offsetParent !== null);
            if (!focusables.length) {
                e.preventDefault();
                return;
            }
            const first = focusables[0];
            const last = focusables[focusables.length - 1];
            const active = document.activeElement;
            if (e.shiftKey && (active === first || active === s.el)) {
                e.preventDefault();
                last.focus();
            } else if (!e.shiftKey && (active === last || !s.el.contains(active))) {
                e.preventDefault();
                first.focus();
            }
        }
    });

    // Touch: horizontal swipe = prev/next, pull down = close
    let g = null;
    const resetGesture = () => {
        g = null;
        s.img.style.transition = '';
        s.img.style.transform = '';
        s.el.style.removeProperty('--lb-alpha');
    };
    el.addEventListener('touchstart', (e) => {
        if (e.touches.length !== 1 || e.target.closest('.lightbox-btn')) {
            g = null;
            return;
        }
        const tch = e.touches[0];
        g = { x: tch.clientX, y: tch.clientY, dx: 0, dy: 0, axis: null };
        s.img.style.transition = 'none';
    }, { passive: true });
    el.addEventListener('touchmove', (e) => {
        if (!g) return;
        if (e.touches.length !== 1) {
            resetGesture();
            return;
        }
        const tch = e.touches[0];
        g.dx = tch.clientX - g.x;
        g.dy = tch.clientY - g.y;
        if (!g.axis && (Math.abs(g.dx) > 10 || Math.abs(g.dy) > 10)) {
            g.axis = Math.abs(g.dx) > Math.abs(g.dy) ? 'x' : 'y';
        }
        if (g.axis === 'x' && s.items.length > 1) {
            s.img.style.transform = `translateX(${g.dx}px)`;
        } else if (g.axis === 'y' && g.dy > 0) {
            s.img.style.transform = `translateY(${g.dy}px)`;
            s.el.style.setProperty('--lb-alpha', String(0.95 * (1 - Math.min(g.dy / 300, 0.6))));
        }
    }, { passive: true });
    el.addEventListener('touchend', () => {
        if (!g) return;
        const { dx, dy, axis } = g;
        resetGesture();
        if (axis === 'x' && Math.abs(dx) > 50 && s.items.length > 1) {
            showLightboxImage(dx < 0 ? s.index + 1 : s.index - 1);
        } else if (axis === 'y' && dy > 90) {
            closeLightbox();
        }
    });
    el.addEventListener('touchcancel', resetGesture);

    // Mobile Back button / gesture closes the lightbox instead of leaving the page
    window.addEventListener('popstate', () => {
        if (s.isOpen) {
            s.historyPushed = false;
            closeLightbox(true);
        }
    });
}

function showLightboxImage(i) {
    const s = lightboxState;
    const n = s.items.length;
    if (!n) return;
    s.index = ((i % n) + n) % n;
    const item = s.items[s.index];
    const token = ++s.loadToken;

    // Drop the previous image first so it never flashes while the next one loads
    s.img.classList.remove('is-ready');
    s.img.removeAttribute('src');
    s.img.alt = item.alt || tUI('imagePreview');
    const ready = () => { if (token === s.loadToken) s.img.classList.add('is-ready'); };
    s.img.onload = ready;
    s.img.onerror = ready;
    s.img.src = item.src;

    s.counter.textContent = n > 1 ? `${s.index + 1} / ${n}` : '';

    // Preload neighbours in the background
    s.preload = [];
    if (n > 1) {
        [s.index + 1, s.index - 1].forEach(j => {
            const pre = new Image();
            pre.src = s.items[((j % n) + n) % n].src;
            s.preload.push(pre);
        });
    }
}

function openLightbox(items, index, opener) {
    if (!items || !items.length) return;
    buildLightbox();
    const s = lightboxState;
    clearTimeout(s.hideTimer);
    s.items = items;
    s.opener = opener || document.activeElement;

    const multi = items.length > 1;
    s.prevBtn.hidden = !multi;
    s.nextBtn.hidden = !multi;

    s.el.style.display = 'flex';
    showLightboxImage(index);

    if (!s.isOpen) {
        s.isOpen = true;
        if (window.pageScrollLock) window.pageScrollLock.lock('lightbox');
        try {
            history.pushState({ mgLightbox: true }, '');
            s.historyPushed = true;
        } catch (e) {
            s.historyPushed = false;
        }
        requestAnimationFrame(() => s.el.classList.add('is-open'));
    }
    s.closeBtn.focus({ preventScroll: true });
}

function closeLightbox(fromPopstate) {
    const s = lightboxState;
    if (!s.isOpen) return;

    // Close via history so the pushed entry is consumed; popstate finishes the job
    if (!fromPopstate && s.historyPushed) {
        history.back();
        setTimeout(() => { if (s.isOpen) { s.historyPushed = false; closeLightbox(true); } }, 400);
        return;
    }

    s.historyPushed = false;
    s.isOpen = false;
    s.el.classList.remove('is-open');
    if (window.pageScrollLock) window.pageScrollLock.unlock('lightbox');
    s.hideTimer = setTimeout(() => {
        s.el.style.display = 'none';
        s.img.removeAttribute('src');
    }, 250);

    const opener = s.opener;
    s.opener = null;
    if (opener && document.contains(opener) && typeof opener.focus === 'function') {
        opener.focus({ preventScroll: true });
    }
}

// Opens the lightbox for a tile, paging through its grid in the original image order
function openGridLightbox(tile) {
    const grid = tile.closest('.gallery-tiles');
    if (!grid) return;
    const tiles = Array.from(grid.querySelectorAll('.img-container'))
        .sort((a, b) => Number(a.dataset.i) - Number(b.dataset.i));
    const items = tiles.map(el => {
        const im = el.querySelector('img');
        return { src: el.dataset.full || (im && im.currentSrc) || '', alt: im ? im.alt : '' };
    });
    openLightbox(items, tiles.indexOf(tile), tile);
}

// Backwards-compatible single-image API
window.openFullscreen = function (src, altText) {
    openLightbox([{ src, alt: altText || '' }], 0, document.activeElement);
};

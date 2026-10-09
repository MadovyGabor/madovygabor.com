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
        fullscreenBtn: 'Megnyitás teljes méretben'
    },
    en: {
        all: 'ALL',
        imagePreview: 'Image preview',
        closePreview: 'Close preview',
        fullscreenBtn: 'Fullscreen view'
    },
    sk: {
        all: 'VŠETKO',
        imagePreview: 'Náhľad obrázka',
        closePreview: 'Zatvoriť náhľad',
        fullscreenBtn: 'Otvoriť na celú obrazovku'
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

document.addEventListener("DOMContentLoaded", () => {
    const dataPath = window.galleryDataPath || '../galleryData.json';
    fetch(dataPath)
        .then(response => response.json())
        .then(data => {
            window.galleryData = data; // store globally for filtering
            initFilterButtons(data);
            renderSidebar(data, 'all');
            initGallery(data, 'all');

            // Handle smooth scrolling to target album if anchor hash exists (#amts-25, #felsoszeli-ballagas-24, etc.)
            function scrollToAnchorHash() {
                if (window.location.hash) {
                    const hashId = decodeURIComponent(window.location.hash.substring(1));
                    const targetEl = document.getElementById(hashId);
                    if (targetEl) {
                        setTimeout(() => {
                            targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
                        }, 120);
                    }
                }
            }
            scrollToAnchorHash();
            window.addEventListener('hashchange', scrollToAnchorHash);


            // Set up top-level "All" button scroll-to-top behaviour
            const allLink = document.querySelector('.sidebar-link[data-category="all"]');
            if (allLink) {
                allLink.addEventListener('click', (e) => {
                    e.preventDefault();
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                    if (window.innerWidth < 1024) closeSidebarDrawer();

                    // Also clear other active classes
                    document.querySelectorAll('.sidebar-link, .sidebar-sublink').forEach(link => {
                        link.classList.remove('active');
                    });
                    allLink.classList.add('active');
                });
            }

            // Wire floating TOC button and overlay (mobile/tablet)
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

        })
        .catch(error => console.error('Error loading gallery data:', error));
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
    document.body.style.overflow = 'hidden';
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
    const mobileMenu = document.getElementById('mobileNavOverlay');
    if (!mobileMenu || !mobileMenu.classList.contains('active')) {
        document.body.style.overflow = '';
    }
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

    // Create 'All' filter button for the top bar
    const allBtn = document.createElement('button');
    allBtn.className = 'filter-btn active';
    allBtn.textContent = tUI('all');
    allBtn.dataset.category = 'all';
    filterContainer.appendChild(allBtn);

    data.forEach(category => {
        const filterBtn = document.createElement('button');
        filterBtn.className = 'filter-btn';
        filterBtn.dataset.category = category.id;
        filterBtn.textContent = t(category.title).toUpperCase();
        filterContainer.appendChild(filterBtn);
    });

    // Handle filter button click events
    filterContainer.addEventListener('click', (e) => {
        const btn = e.target.closest('.filter-btn');
        if (!btn) return;

        const categoryId = btn.dataset.category;

        // Update active class on filter buttons
        document.querySelectorAll('.filter-btn').forEach(el => el.classList.remove('active'));
        btn.classList.add('active');

        // Close mobile nav drawer if active
        const mobileNav = document.getElementById('mobileNavOverlay');
        if (mobileNav && mobileNav.classList.contains('active')) {
            mobileNav.classList.remove('active');
            document.body.style.overflow = '';
        }

        // Re-init gallery and sidebar
        initGallery(window.galleryData, categoryId);
        renderSidebar(window.galleryData, categoryId);

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

    images.forEach((imgData) => {
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
        img.src = src; // Set src after onload/onerror to ensure cache hits trigger load handler

        imgContainer.appendChild(img);

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
                <button class="hud-fullscreen" aria-label="${tUI('fullscreenBtn')}">
                    ${ICONS.fullscreen}
                </button>
            </div>
        `;
        const fsBtn = overlay.querySelector('.hud-fullscreen');
        if (fsBtn) {
            fsBtn.addEventListener('click', () => window.openFullscreen(src, altText));
        }
        imgContainer.appendChild(overlay);

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

function handleScrollSpy() {
    const headers = Array.from(document.querySelectorAll('.group-header'));
    const sidebarLinks = Array.from(document.querySelectorAll('.sidebar-link, .sidebar-sublink'));
    const allLink = document.querySelector('.sidebar-link[data-category="all"]');

    let activeId = null;
    const scrollPosition = window.scrollY + 120; // 120px offset to detect active section

    if (window.scrollY < 100) {
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
                link.classList.add('active');
                if (activeLinkChanged) {
                    link.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                }
            } else {
                link.classList.remove('active');
            }
        });
    }
}

function initScrollSpy() {
    if (!isScrollListenerAttached) {
        window.addEventListener('scroll', handleScrollSpy);
        isScrollListenerAttached = true;
    }
    handleScrollSpy();
}

// Re-render gallery when column count changes on resize (debounced)
let galleryResizeTimer = null;
let lastGalleryColumnCount = getColumnCount();

window.addEventListener('resize', () => {
    clearTimeout(galleryResizeTimer);
    galleryResizeTimer = setTimeout(() => {
        const newCount = getColumnCount();
        if (newCount !== lastGalleryColumnCount) {
            lastGalleryColumnCount = newCount;
            if (window.galleryData) {
                const activeFilter = document.querySelector('.filter-btn.active');
                const catId = activeFilter ? activeFilter.dataset.category : 'all';
                initGallery(window.galleryData, catId);
            }
        }
    }, 200);
});

// Lightbox handler (global/window scoped)
window.openFullscreen = function (src, altText) {
    let lightbox = document.getElementById('portfolio-lightbox');
    if (!lightbox) {
        lightbox = document.createElement('div');
        lightbox.id = 'portfolio-lightbox';
        lightbox.setAttribute('role', 'dialog');
        lightbox.setAttribute('aria-modal', 'true');
        lightbox.setAttribute('aria-label', tUI('imagePreview'));
        lightbox.style.cssText = `
            position: fixed; inset: 0; background: rgba(10,10,10,0.95); z-index: 1000;
            display: flex; align-items: center; justify-content: center; opacity: 0;
            transition: opacity 0.3s; backdrop-filter: blur(8px);
        `;

        const closeBtn = document.createElement('button');
        closeBtn.innerHTML = ICONS.close;
        closeBtn.setAttribute('aria-label', tUI('closePreview'));
        closeBtn.style.cssText = `
            position: absolute; top: 24px; right: 24px; background: none; border: none;
            color: white; cursor: pointer; display: flex; align-items: center; justify-content: center;
            padding: 8px;
        `;
        
        function closeLightbox() {
            lightbox.style.opacity = '0';
            document.body.style.overflow = '';
            setTimeout(() => {
                lightbox.style.display = 'none';
            }, 300);
        }

        closeBtn.onclick = closeLightbox;

        // Dismiss on backdrop click
        lightbox.addEventListener('click', (e) => {
            if (e.target === lightbox) {
                closeLightbox();
            }
        });

        // Dismiss on Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && lightbox.style.display === 'flex') {
                closeLightbox();
            }
        });

        const img = document.createElement('img');
        img.id = 'lightbox-img';
        img.style.cssText = 'max-width: 90%; max-height: 90%; object-fit: contain; box-shadow: 0 10px 40px rgba(0,0,0,0.5);';

        lightbox.appendChild(closeBtn);
        lightbox.appendChild(img);
        document.body.appendChild(lightbox);
    }

    const lightboxImg = document.getElementById('lightbox-img');
    lightboxImg.src = src;
    lightboxImg.alt = altText || 'Fullscreen view';
    lightbox.style.display = 'flex';
    document.body.style.overflow = 'hidden';
    setTimeout(() => lightbox.style.opacity = '1', 10);
};
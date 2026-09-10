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

    // ─── In-Place Skeleton Loader ─────────────────────────────────
    observeElements();
    initInPlaceSkeleton();

    function initInPlaceSkeleton() {
        const images = document.querySelectorAll('.hero-image-col img, .portfolio-item img, .occasion-img-wrap img, .photo-carousel-slide img');
        if (!images.length) return;

        images.forEach(img => {
            const handleLoaded = () => {
                img.classList.add('is-loaded');
                const container = img.closest('.skeleton-shimmer');
                if (container) {
                    container.classList.add('is-loaded');
                    setTimeout(() => {
                        container.classList.remove('skeleton-shimmer');
                    }, 400);
                }
            };

            if (img.complete && img.naturalWidth !== 0) {
                handleLoaded();
            } else {
                img.addEventListener('load', handleLoaded, { once: true });
                img.addEventListener('error', handleLoaded, { once: true });
            }
        });
    }

    // ─── Back / Forward cache (bfcache) ──────────────────────────
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

    // ─── Contact Form Prefill from Service Calculator ─────────────
    function initContactPrefill() {
        const eventDateInput = document.getElementById('eventDate');
        if (eventDateInput) {
            eventDateInput.min = new Date().toISOString().split('T')[0];
            eventDateInput.addEventListener('click', () => {
                try {
                    if (typeof eventDateInput.showPicker === 'function') {
                        eventDateInput.showPicker();
                    }
                } catch (e) {
                    // graceful fallback for unsupported browsers
                }
            });
        }

        const subjectSelect = document.getElementById('subject');
        const messageTextarea = document.getElementById('message');
        if (!messageTextarea) return;

        const params = new URLSearchParams(window.location.search);
        if (params.has('service') || params.has('total')) {
            const service = params.get('service');
            const type = params.get('type') || '';
            const hours = params.get('hours') || '';
            const zone = params.get('zone') || '';
            const total = params.get('total') || '';
            const express = params.get('express') === 'true' || params.get('express') === '1';

            // Auto-select subject dropdown
            if (subjectSelect) {
                if (service === 'esemeny' || service === 'event') {
                    const eventOption = Array.from(subjectSelect.options).find(opt =>
                        opt.value === 'eseményfotózás' ||
                        opt.value === 'event' ||
                        opt.value === 'eventove-fotenie' ||
                        opt.text.toLowerCase().includes('esemény') ||
                        opt.text.toLowerCase().includes('event')
                    );
                    if (eventOption) {
                        subjectSelect.value = eventOption.value;
                    }
                } else if (service === 'iskolafotozas' || service === 'iskola' || service === 'school' || service === 'skolske') {
                    const iskolaOption = Array.from(subjectSelect.options).find(opt =>
                        opt.value.toLowerCase().includes('iskola') ||
                        opt.text.toLowerCase().includes('iskola') ||
                        opt.value.toLowerCase().includes('osztály') ||
                        opt.text.toLowerCase().includes('osztály') ||
                        opt.value.toLowerCase().includes('skol') ||
                        opt.text.toLowerCase().includes('škol') ||
                        opt.value.toLowerCase().includes('school') ||
                        opt.text.toLowerCase().includes('school')
                    );
                    if (iskolaOption) {
                        subjectSelect.value = iskolaOption.value;
                    }
                } else if (service === 'tablo' || service === 'tablofotozas' || service === 'yearbook') {
                    const tabloOption = Array.from(subjectSelect.options).find(opt =>
                        opt.value.toLowerCase().includes('tabló') ||
                        opt.value.toLowerCase().includes('tablo') ||
                        opt.value.toLowerCase().includes('yearbook') ||
                        opt.text.toLowerCase().includes('tabló') ||
                        opt.text.toLowerCase().includes('tablo')
                    );
                    if (tabloOption) {
                        subjectSelect.value = tabloOption.value;
                    }
                } else if (service === 'portre' || service === 'portrait' || service === 'portrefotozas') {
                    const portreOption = Array.from(subjectSelect.options).find(opt =>
                        opt.value.toLowerCase().includes('portré') ||
                        opt.value.toLowerCase().includes('portret') ||
                        opt.value.toLowerCase().includes('portrait') ||
                        opt.text.toLowerCase().includes('portré') ||
                        opt.text.toLowerCase().includes('portret')
                    );
                    if (portreOption) {
                        subjectSelect.value = portreOption.value;
                    }
                }
            }

            // Determine language for template
            const htmlLang = document.documentElement.lang || 'hu';
            let summaryText = '';

            const hasCalculatorMetrics = params.has('total') || (params.has('tier') && params.has('rate'));

            if (!hasCalculatorMetrics) {
                if (service === 'esemeny' || service === 'event') {
                    if (htmlLang === 'sk') {
                        summaryText = `Dobrý deň,\n\nMám záujem o eventové fotenie a rád/rada by som zistil/a viac informácií.\n\nĎalšie podrobnosti a poznámky:\n`;
                    } else if (htmlLang === 'en') {
                        summaryText = `Hello,\n\nI would like to inquire about event photography services.\n\nAdditional details and notes:\n`;
                    } else {
                        summaryText = `Szia Gábor!\n\nÉrdeklődni szeretnék eseményfotózással kapcsolatban.\n\nTovábbi részletek és megjegyzések:\n`;
                    }
                } else if (service === 'tablo' || service === 'tablofotozas' || service === 'yearbook') {
                    if (htmlLang === 'sk') {
                        summaryText = `Dobrý deň,\n\nMám záujem o tablové fotenie pre končiaci ročník.\n\nNázov školy, trieda a ďalšie podrobnosti:\n`;
                    } else if (htmlLang === 'en') {
                        summaryText = `Hello,\n\nI would like to inquire about graduating class yearbook photography.\n\nSchool name, class, and additional notes:\n`;
                    } else {
                        summaryText = `Szia Gábor!\n\nÉrdeklődni szeretnék végzős tablófotózással kapcsolatban.\n\nIskola neve, osztály és további részletek:\n`;
                    }
                } else if (service === 'iskolafotozas' || service === 'iskola' || service === 'school' || service === 'skolske') {
                    if (htmlLang === 'sk') {
                        summaryText = `Dobrý deň,\n\nMám záujem o školské a triedne fotenie.\n\nNázov školy, trieda a ďalšie podrobnosti:\n`;
                    } else if (htmlLang === 'en') {
                        summaryText = `Hello,\n\nI would like to inquire about school and class photography.\n\nSchool name, class, and additional notes:\n`;
                    } else {
                        summaryText = `Szia Gábor!\n\nÉrdeklődni szeretnék osztály- és iskolafotózással kapcsolatban.\n\nIskola neve, osztály és további részletek:\n`;
                    }
                } else if (service === 'portre' || service === 'portrait' || service === 'portrefotozas') {
                    if (htmlLang === 'sk') {
                        summaryText = `Dobrý deň,\n\nMám záujem o portrétové fotenie.\n\nĎalšie podrobnosti a poznámky:\n`;
                    } else if (htmlLang === 'en') {
                        summaryText = `Hello,\n\nI would like to inquire about a portrait photography session.\n\nAdditional details and notes:\n`;
                    } else {
                        summaryText = `Szia Gábor!\n\nÉrdeklődni szeretnék portréfotózással kapcsolatban.\n\nTovábbi részletek és megjegyzések:\n`;
                    }
                } else {
                    if (htmlLang === 'sk') {
                        summaryText = `Dobrý deň,\n\nRád/rada by som sa informoval/a o Vašich fotografických službách.\n\nĎalšie podrobnosti a poznámky:\n`;
                    } else if (htmlLang === 'en') {
                        summaryText = `Hello,\n\nI would like to inquire about your photography services.\n\nAdditional details and notes:\n`;
                    } else {
                        summaryText = `Szia Gábor!\n\nÉrdeklődni szeretnék fotózási szolgáltatásaiddal kapcsolatban.\n\nTovábbi részletek és megjegyzések:\n`;
                    }
                }
            } else if (service === 'iskolafotozas' || service === 'iskola' || service === 'school') {
                const tier = params.get('tier') || '';
                const tierName = params.get('tier_name') || tier;
                const rate = params.get('rate') || '';
                const digitalClasses = params.get('digital_classes');
                const archiveTotal = params.get('archive_total');
                const archive = params.get('archive') === 'true' || params.get('archive') === '1' || (digitalClasses && parseInt(digitalClasses, 10) > 0);
                const facultyPhoto = params.get('faculty_photo') === 'true' || params.get('faculty_photo') === '1';
                const friends = params.get('friends') === 'true' || params.get('friends') === '1';

                let archiveTextHu = 'Nem';
                let archiveTextSk = 'Nie';
                let archiveTextEn = 'No';
                if (archive) {
                    if (digitalClasses && archiveTotal) {
                        archiveTextHu = `Igen (${digitalClasses} osztály, +${archiveTotal} €)`;
                        archiveTextSk = `Áno (${digitalClasses} tried, +${archiveTotal} €)`;
                        archiveTextEn = `Yes (${digitalClasses} classes, +${archiveTotal} €)`;
                    } else {
                        archiveTextHu = 'Igen (+10 €/osztály, max. 40 €)';
                        archiveTextSk = 'Áno (+10 €/trieda, max. 40 €)';
                        archiveTextEn = 'Yes (+10 €/class, max. 40 €)';
                    }
                }

                let facultyTextHu = facultyPhoto ? 'Igen (ütemezés szerint, díjmentes)' : 'Nem';
                let facultyTextSk = facultyPhoto ? 'Áno (podľa harmonogramu, bezplatne)' : 'Nie';
                let facultyTextEn = facultyPhoto ? 'Yes (per schedule, complimentary)' : 'No';

                let packageDescHu = tierName ? `${tierName}` : '';
                let packageDescSk = tierName ? `${tierName}` : '';
                let packageDescEn = tierName ? `${tierName}` : '';

                if (rate) {
                    packageDescHu += packageDescHu ? ` (${rate} € / diák)` : `${rate} € / diák`;
                    packageDescSk += packageDescSk ? ` (${rate} € / žiak)` : `${rate} € / žiak`;
                    packageDescEn += packageDescEn ? ` (${rate} € / student)` : `${rate} € / student`;
                }

                if (htmlLang === 'sk') {
                    summaryText = `Dobrý deň,\n\nMám záujem o cenovú ponuku na triedne a školské fotenie:\n- Vybraný balík / kategória: ${packageDescSk}\n- Doprava: Bezplatne v regióne\n- Školský digitálny archív: ${archiveTextSk}\n- Skupinová fotka učiteľského zboru: ${facultyTextSk}\n- Fotenie pre kamarátov: ${friends ? 'Áno (+2 €/účastník s 1 ks tlačenou fotkou)' : 'Nie'}\n\nNázov školy, trieda a ďalšie podrobnosti:\n`;
                } else if (htmlLang === 'en') {
                    summaryText = `Hello,\n\nI would like to request a quote for school and class photography:\n- Selected Package: ${packageDescEn}\n- Travel Fee: Free in the region\n- School Digital Archive: ${archiveTextEn}\n- Faculty / Staff Group Photo: ${facultyTextEn}\n- Friend Groups Photos: ${friends ? 'Yes (+2 €/participant with 1 print)' : 'No'}\n\nSchool name, class, and additional notes:\n`;
                } else {
                    summaryText = `Szia Gábor!\n\nAjánlatot szeretnék kérni osztály- és iskolafotózásra a kiválasztott csomag alapján:\n- Választott csomag: ${packageDescHu}\n- Kiszállási díj: Ingyenes (régióban)\n- Iskolai digitális archívum: ${archiveTextHu}\n- Tanári kar csoportképe: ${facultyTextHu}\n- Baráti fotózás: ${friends ? 'Igen (+2 €/résztvevő 1 db nyomtatott képpel)' : 'Nem'}\n\nIskola neve, osztály és további részletek:\n`;
                }
            } else if (service === 'tablo' || service === 'tablofotozas' || service === 'yearbook') {
                let pkg = params.get('package') || params.get('type') || '';
                if (pkg === 'belteri') {
                    pkg = htmlLang === 'sk' ? 'Tablový portrét v interiéri' : (htmlLang === 'en' ? 'Indoor Yearbook Portrait' : 'Beltéri tablóportré');
                } else if (pkg === 'kulteri') {
                    pkg = htmlLang === 'sk' ? 'Tablový portrét v exteriéri' : (htmlLang === 'en' ? 'Outdoor Yearbook Portrait' : 'Kültéri tablóportré');
                }

                const students = params.get('students') || '';
                const rate = params.get('rate') || '17';
                const paper = params.get('paper') === 'true' || params.get('paper') === '1' || params.get('prints') === 'true' || params.get('prints') === '1';
                const friends = params.get('friends') === 'true' || params.get('friends') === '1';

                const teachersParam = params.get('teachers');
                let teachersSk = 'Nie';
                let teachersEn = 'No';
                let teachersHu = 'Nem';
                if (teachersParam === 'true' || teachersParam === '1') {
                    teachersSk = 'Áno (+5 €/osoba)';
                    teachersEn = 'Yes (+5 €/teacher)';
                    teachersHu = 'Igen (+5 €/fő)';
                } else if (teachersParam && parseInt(teachersParam, 10) > 0) {
                    const tCount = parseInt(teachersParam, 10);
                    teachersSk = `${tCount} pedagógov (+${tCount * 5} €)`;
                    teachersEn = `${tCount} teachers (+${tCount * 5} €)`;
                    teachersHu = `${tCount} pedagógus (+${tCount * 5} €)`;
                }

                let zoneDisplay = zone;
                if (zone === '0') {
                    zoneDisplay = htmlLang === 'sk' ? 'Bezplatná zóna (0 €)' : (htmlLang === 'en' ? 'Free zone (0 €)' : 'Ingyenes zóna (0 €)');
                } else if (zone === '20') {
                    zoneDisplay = htmlLang === 'sk' ? '1. Zóna (+20 €)' : (htmlLang === 'en' ? 'Zone 1 (+20 €)' : '1. Zóna (+20 €)');
                } else if (zone === '35') {
                    zoneDisplay = htmlLang === 'sk' ? '2. Zóna (+35 €)' : (htmlLang === 'en' ? 'Zone 2 (+35 €)' : '2. Zóna (+35 €)');
                } else if (zone === '55') {
                    zoneDisplay = htmlLang === 'sk' ? '3. Zóna (+55 €)' : (htmlLang === 'en' ? 'Zone 3 (+55 €)' : '3. Zóna (+55 €)');
                }

                if (htmlLang === 'sk') {
                    summaryText = `Dobrý deň,\n\nMám záujem o cenovú ponuku na tablové fotenie:\n- Balík: ${pkg}\n- Počet študentov: ${students} žiakov ${rate ? '(' + rate + ' €/žiak)' : ''}\n- Lokalita / Zóna dopravy: ${zoneDisplay}\n- Prémiové papierové fotky: ${paper ? 'Áno (+3 €/žiak)' : 'Nie'}\n- Fotenie pre kamarátov: ${friends ? 'Áno (+2 €/žiak s 1 ks tlačenou fotkou)' : 'Nie'}\n- Fotenie učiteľov: ${teachersSk}\n- Východiskový odhad rozpočtu: ~${total} €\n\nNázov školy, trieda a ďalšie podrobnosti:\n`;
                } else if (htmlLang === 'en') {
                    summaryText = `Hello,\n\nI would like to request a quote for yearbook photography:\n- Package: ${pkg}\n- Student Count: ${students} students ${rate ? '(' + rate + ' €/student)' : ''}\n- Location / Travel Zone: ${zoneDisplay}\n- Premium Paper Prints: ${paper ? 'Yes (+3 €/student)' : 'No'}\n- Friend Photos: ${friends ? 'Yes (+2 €/student with 1 print)' : 'No'}\n- Teacher Portraits: ${teachersEn}\n- Estimated Budget: ~${total} €\n\nSchool name, class, and additional notes:\n`;
                } else {
                    summaryText = `Szia Gábor!\n\nAjánlatot szeretnék kérni végzős tablófotózásra a weboldalon kalkulált adatok alapján:\n- Választott csomag: ${pkg}\n- Tervezett létszám: ${students} diák ${rate ? '(' + rate + ' €/diák)' : ''}\n- Helyszín / Kiszállási zóna: ${zoneDisplay}\n- Nyomtatási alapcsomag: ${paper ? 'Igen (+3 €/diák)' : 'Nem'}\n- Baráti kiscsoportos fotók: ${friends ? 'Igen (+2 €/fő 1 db nyomtatott képpel)' : 'Nem'}\n- Tanárok és osztályfőnök: ${teachersHu}\n- Várható indikatív keretösszeg: ~${total} €\n\nIskola neve, osztály és további részletek:\n`;
                }
            } else if (service === 'portre' || service === 'portrait' || service === 'portrefotozas') {
                const defaultPkg = htmlLang === 'sk' ? 'Klasický exteriér' : (htmlLang === 'en' ? 'Classic Outdoor' : 'Klasszikus Szabadtér');
                const pkg = params.get('package') || params.get('type') || defaultPkg;
                const extras = params.get('extras') || params.get('extraCount') || '0';
                const extraCount = parseInt(extras, 10) || 0;
                const prints = params.get('prints') === 'true' || params.get('prints') === '1' || params.get('paper') === 'true' || params.get('paper') === '1';
                const defaultZone = htmlLang === 'sk' ? 'Dolné Saliby, Galanta a okolie (0 €)' : (htmlLang === 'en' ? 'Dolné Saliby, Galanta and vicinity (0 €)' : 'Alsószeli, Galánta és környéke (0 €)');
                const zone = params.get('zone') || defaultZone;

                let extrasTextHu = extraCount > 0 ? `${extraCount} db (+${extraCount * 7} €)` : 'Nem';
                let extrasTextSk = extraCount > 0 ? `${extraCount} ks (+${extraCount * 7} €)` : 'Nie';
                let extrasTextEn = extraCount > 0 ? `${extraCount} photos (+${extraCount * 7} €)` : 'No';

                let printsTextHu = prints ? 'Igen (+15 €)' : 'Nem';
                let printsTextSk = prints ? 'Áno (+15 €)' : 'Nie';
                let printsTextEn = prints ? 'Yes (+15 €)' : 'No';

                if (htmlLang === 'sk') {
                    summaryText = `Dobrý deň,\n\nMám záujem o cenovú ponuku na exteriérové a kreatívne portrétové fotenie:\n- Balík: ${pkg}\n- Extra retušované digitálne fotky: ${extrasTextSk}\n- Balík tlačených fotiek (10 ks 13×18 cm): ${printsTextSk}\n- Lokalita / Zóna dopravy: ${zone}\n- Východiskový odhad rozpočtu: ~${total} €\n\nĎalšie podrobnosti a poznámky:\n`;
                } else if (htmlLang === 'en') {
                    summaryText = `Hello,\n\nI would like to request a quote for outdoor and creative portrait photography:\n- Selected Package: ${pkg}\n- Extra Retouched Digital Photos: ${extrasTextEn}\n- Print Package (10 pcs 13×18 cm): ${printsTextEn}\n- Location / Travel Zone: ${zone}\n- Estimated Budget: ~${total} €\n\nAdditional details and notes:\n`;
                } else {
                    summaryText = `Szia Gábor!\n\nAjánlatot szeretnék kérni szabadtéri portréfotózásra a weboldalon kalkulált adatok alapján:\n- Választott csomag: ${pkg}\n- Extra retusált digitális képek: ${extrasTextHu}\n- Nyomtatási csomag (10 db 13×18 cm): ${printsTextHu}\n- Helyszín / Kiszállási zóna: ${zone}\n- Várható indikatív keretösszeg: ~${total} €\n\nTovábbi részletek és megjegyzések:\n`;
                }
            } else {
                if (htmlLang === 'sk') {
                    summaryText = `Dobrý deň,\n\nMám záujem o cenovú ponuku na základe kalkulácie z webu:\n- Typ podujatia: ${type}\n- Trvanie: ${hours} hod.\n- Lokalita / Zóna dopravy: ${zone}\n- Expresné 48h dodanie: ${express ? 'Áno' : 'Nie'}\n- Východiskový odhad rozpočtu: ~${total} €\n\nĎalšie podrobnosti a poznámky:\n`;
                } else if (htmlLang === 'en') {
                    summaryText = `Hello,\n\nI would like to request a quote based on the website calculator:\n- Event Type: ${type}\n- Estimated Duration: ${hours} hours\n- Location / Travel Zone: ${zone}\n- Express 48h Delivery: ${express ? 'Yes' : 'No'}\n- Estimated Budget: ~${total} €\n\nAdditional details and notes:\n`;
                } else {
                    summaryText = `Szia Gábor!\n\nAjánlatot szeretnék kérni a weboldalon kalkulált adatok alapján:\n- Esemény típusa: ${type}\n- Tervezett időtartam: ${hours} óra\n- Helyszín / Kiszállási zóna: ${zone}\n- Expressz 48h átadás: ${express ? 'Igen' : 'Nem'}\n- Várható indikatív keretösszeg: ~${total} €\n\nTovábbi részletek és megjegyzések:\n`;
                }
            }

            messageTextarea.value = summaryText;

            // Scroll smoothly to form if user arrived via direct link
            const contactForm = document.getElementById('contactForm');
            if (contactForm) {
                setTimeout(() => {
                    contactForm.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }, 200);
            }
        }
    }

    // ─── Photo Carousel ──────────────────────────────────────────
    function initPhotoCarousel() {
        const track = document.getElementById('photoCarouselTrack');
        const prevBtn = document.getElementById('carouselPrevBtn');
        const nextBtn = document.getElementById('carouselNextBtn');

        if (!track || !prevBtn || !nextBtn) return;

        const getScrollStep = () => {
            const slide = track.querySelector('.photo-carousel-slide');
            if (!slide) return 320;
            const gap = parseInt(window.getComputedStyle(track).gap, 10) || 16;
            return slide.offsetWidth + gap;
        };

        prevBtn.addEventListener('click', () => {
            track.scrollBy({ left: -getScrollStep(), behavior: 'smooth' });
        });

        nextBtn.addEventListener('click', () => {
            track.scrollBy({ left: getScrollStep(), behavior: 'smooth' });
        });
    }

    initNavDropdown();
    initFaqAccordion();
    initContactPrefill();
    initPhotoCarousel();
});


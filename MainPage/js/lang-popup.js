(function () {
    'use strict';

    var STORAGE_KEY = 'lang-suggested';
    var TARGETS = {
        hu: '/hu/',
        sk: '/sk/',
        en: '/'
    };

    var TEXTS = {
        hu: {
            aria: 'Nyelvi javaslat',
            overline: 'Nyelvi javaslat',
            title: 'Magyarul böngészel?',
            text: 'Az oldal magyar nyelven is elérhető. Szeretnél átváltani?',
            accept: 'Magyar oldal',
            dismiss: 'Maradok ezen az oldalon'
        },
        sk: {
            aria: 'Jazykové odporúčanie',
            overline: 'Jazykové odporúčanie',
            title: 'Hovoríte po slovensky?',
            text: 'Stránka je dostupná aj v slovenčine. Chcete prepnúť?',
            accept: 'Slovenská verzia',
            dismiss: 'Zostávam na tejto stránke'
        },
        en: {
            aria: 'Language suggestion',
            overline: 'Language suggestion',
            title: 'Browsing in English?',
            text: 'This page is available in English as well. Want to switch?',
            accept: 'English version',
            dismiss: 'Stay on this page'
        }
    };

    function getSuggestedFlag() {
        try {
            return window.sessionStorage.getItem(STORAGE_KEY) === 'true';
        } catch (error) {
            return false;
        }
    }

    function setSuggestedFlag() {
        try {
            window.sessionStorage.setItem(STORAGE_KEY, 'true');
        } catch (error) {
            // Ignore storage errors and continue without persistence.
        }
    }

    function getPreferredLanguage() {
        var browserLang = (navigator.languages && navigator.languages[0]) || navigator.language || navigator.userLanguage || '';
        var normalized = String(browserLang).toLowerCase();

        if (normalized.indexOf('hu') === 0) {
            return 'hu';
        }

        if (normalized.indexOf('sk') === 0) {
            return 'sk';
        }

        if (normalized.indexOf('en') === 0) {
            return 'en';
        }

        return null;
    }

    function getSuggestion(pathname, preferredLanguage) {
        if (!preferredLanguage) {
            return null;
        }

        if (preferredLanguage === 'hu' && pathname.indexOf('/hu') !== 0) {
            return 'hu';
        }

        if (preferredLanguage === 'sk' && pathname.indexOf('/sk') !== 0) {
            return 'sk';
        }

        if (preferredLanguage === 'en' && pathname !== '/') {
            return 'en';
        }

        return null;
    }

    function renderPopup(popup, contentHost, languageCode) {
        var copy = TEXTS[languageCode];
        var target = TARGETS[languageCode];

        if (!copy || !target) {
            return;
        }

        var overline = popup.querySelector('.lang-popup-overline');
        if (overline) {
            overline.textContent = copy.overline;
        }

        popup.setAttribute('aria-label', copy.aria);

        contentHost.innerHTML =
            '<h3 class="lang-popup-title">' + copy.title + '</h3>' +
            '<p class="lang-popup-text">' + copy.text + '</p>' +
            '<div class="lang-popup-cta">' +
                '<div class="lang-popup-actions">' +
                    '<a href="' + target + '" class="lang-btn lang-btn-primary" data-lang-accept="true">' + copy.accept + '</a>' +
                    '<button class="lang-dismiss" type="button" data-lang-dismiss="true">' + copy.dismiss + '</button>' +
                '</div>' +
            '</div>';
    }

    document.addEventListener('DOMContentLoaded', function () {
        if (getSuggestedFlag()) {
            return;
        }

        var popup = document.getElementById('lang-popup');
        var contentHost = document.getElementById('popup-content');

        if (!popup || !contentHost) {
            return;
        }

        var pathname = (window.location.pathname || '/').toLowerCase();
        var preferredLanguage = getPreferredLanguage();
        var suggestion = getSuggestion(pathname, preferredLanguage);

        if (!suggestion) {
            return;
        }

        renderPopup(popup, contentHost, suggestion);

        var acceptButton = contentHost.querySelector('[data-lang-accept]');
        var dismissButton = contentHost.querySelector('[data-lang-dismiss]');

        if (acceptButton) {
            acceptButton.addEventListener('click', function () {
                setSuggestedFlag();
            });
        }

        if (dismissButton) {
            dismissButton.addEventListener('click', function () {
                popup.classList.remove('is-visible');
                setSuggestedFlag();
            });
        }

        window.setTimeout(function () {
            popup.classList.add('is-visible');
        }, 1000);
    });
})();

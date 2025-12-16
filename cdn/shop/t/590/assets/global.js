function getFocusableElements(container) {
    return Array.from(
        container.querySelectorAll(
            "summary, a[href], button:enabled, [tabindex]:not([tabindex^='-']), [draggable], area, input:not([type=hidden]):enabled, select:enabled, textarea:enabled, object, iframe"
        )
    );
}

function slugify(text) {
    return text.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');
}

function addToAlgoliaStorage(productId, queryId, indexName) {
    const products = JSON.parse(localStorage.getItem('algoliaProducts')) || [];

    products.push({
        productId,
        queryId,
        indexName,
    });

    localStorage.setItem("algoliaProducts", JSON.stringify(products));
}

const sectionSticky = document.querySelectorAll('.section--sticky');
if (sectionSticky) {
    sectionSticky.forEach((section) => {
        var observer = new IntersectionObserver(
            function(entries) {
                if (entries[0].intersectionRatio === 0) {
                    section.classList.add('section--pinned');
                } else {
                    section.classList.remove('section--pinned');
                }
            }, {
                threshold: [0, 1],
            }
        );

        if (section.previousElementSibling) {
            observer.observe(section.previousElementSibling);
        } else {
            observer.observe(section);
        }
    });
}

document.querySelectorAll('[id^="Details-"] summary').forEach((summary) => {
    summary.setAttribute('role', 'button');
    summary.setAttribute('aria-expanded', summary.parentNode.hasAttribute('open'));

    if (summary.nextElementSibling.getAttribute('id')) {
        summary.setAttribute('aria-controls', summary.nextElementSibling.id);
    }

    summary.addEventListener('click', (event) => {
        event.currentTarget.setAttribute('aria-expanded', !event.currentTarget.closest('details').hasAttribute('open'));
    });
    if (summary.closest('header-drawer')) return;
    summary.parentElement.addEventListener('keyup', onKeyUpEscape);
});

const trapFocusHandlers = {};

function trapFocus(container, elementToFocus = container) {
    var elements = getFocusableElements(container);
    var first = elements[0];
    var last = elements[elements.length - 1];

    removeTrapFocus();

    trapFocusHandlers.focusin = (event) => {
        if (event.target !== container && event.target !== last && event.target !== first) return;

        document.addEventListener('keydown', trapFocusHandlers.keydown);
    };

    trapFocusHandlers.focusout = function() {
        document.removeEventListener('keydown', trapFocusHandlers.keydown);
    };

    trapFocusHandlers.keydown = function(event) {
        if (event.code.toUpperCase() !== 'TAB') return; // If not TAB key
        // On the last focusable element and tab forward, focus the first element.
        if (event.target === last && !event.shiftKey) {
            event.preventDefault();
            first.focus();
        }

        //  On the first focusable element and tab backward, focus the last element.
        if ((event.target === container || event.target === first) && event.shiftKey) {
            event.preventDefault();
            last.focus();
        }
    };

    document.addEventListener('focusout', trapFocusHandlers.focusout);
    document.addEventListener('focusin', trapFocusHandlers.focusin);

    elementToFocus.focus();
}

// Here run the querySelector to figure out if the browser supports :focus-visible or not and run code based on it.
try {
    document.querySelector(':focus-visible');
} catch (e) {
    focusVisiblePolyfill();
}

function focusVisiblePolyfill() {
    const navKeys = ['ARROWUP', 'ARROWDOWN', 'ARROWLEFT', 'ARROWRIGHT', 'TAB', 'ENTER', 'SPACE', 'ESCAPE', 'HOME', 'END', 'PAGEUP', 'PAGEDOWN'];
    let currentFocusedElement = null;
    let mouseClick = null;

    window.addEventListener('keydown', (event) => {
        if (navKeys.includes(event.code.toUpperCase())) {
            mouseClick = false;
        }
    });

    window.addEventListener('mousedown', (event) => {
        mouseClick = true;
    });

    window.addEventListener(
        'focus',
        () => {
            if (currentFocusedElement) currentFocusedElement.classList.remove('focused');

            if (mouseClick) return;

            currentFocusedElement = document.activeElement;
            currentFocusedElement.classList.add('focused');
        },
        true
    );
}

function pauseAllMedia() {
    document.querySelectorAll('.js-youtube').forEach((video) => {
        video.contentWindow.postMessage('{"event":"command","func":"' + 'pauseVideo' + '","args":""}', '*');
    });
    document.querySelectorAll('.js-vimeo').forEach((video) => {
        video.contentWindow.postMessage('{"method":"pause"}', '*');
    });
    document.querySelectorAll('video').forEach((video) => video.pause());
    document.querySelectorAll('product-model').forEach((model) => {
        if (model.modelViewerUI) model.modelViewerUI.pause();
    });
}

function removeTrapFocus(elementToFocus = null) {
    document.removeEventListener('focusin', trapFocusHandlers.focusin);
    document.removeEventListener('focusout', trapFocusHandlers.focusout);
    document.removeEventListener('keydown', trapFocusHandlers.keydown);

    if (elementToFocus) elementToFocus.focus();
}

function onKeyUpEscape(event) {
    if (event.code.toUpperCase() !== 'ESCAPE') return;

    const openDetailsElement = event.target.closest('details[open]');
    if (!openDetailsElement) return;

    const summaryElement = openDetailsElement.querySelector('summary');
    openDetailsElement.removeAttribute('open');
    summaryElement.setAttribute('aria-expanded', false);
    summaryElement.focus();
}

class QuantityInput extends HTMLElement {
    constructor() {
        super();
        this.input = this.querySelector('input');
        this.changeEvent = new Event('change', {
            bubbles: true
        });

        this.querySelectorAll('button').forEach((button) => button.addEventListener('click', this.onButtonClick.bind(this)));
    }

    onButtonClick(event) {
        event.preventDefault();
        const previousValue = this.input.value;

        event.target.name === 'plus' ? this.input.stepUp() : this.input.stepDown();
        if (previousValue !== this.input.value) this.input.dispatchEvent(this.changeEvent);
    }
}

customElements.define('quantity-input', QuantityInput);

function debounce(fn, wait) {
    let t;
    return (...args) => {
        clearTimeout(t);
        t = setTimeout(() => fn.apply(this, args), wait);
    };
}

function fetchConfig(type = 'json') {
    return {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Accept: `application/${type}`,
        },
    };
}

/*
 * Shopify Common JS
 *
 */
if (typeof window.Shopify == 'undefined') {
    window.Shopify = {};
}

Shopify.bind = function(fn, scope) {
    return function() {
        return fn.apply(scope, arguments);
    };
};

Shopify.setSelectorByValue = function(selector, value) {
    for (var i = 0, count = selector.options.length; i < count; i++) {
        var option = selector.options[i];
        if (value == option.value || value == option.innerHTML) {
            selector.selectedIndex = i;
            return i;
        }
    }
};

Shopify.addListener = function(target, eventName, callback) {
    target.addEventListener ? target.addEventListener(eventName, callback, false) : target.attachEvent('on' + eventName, callback);
};

Shopify.postLink = function(path, options) {
    options = options || {};
    var method = options['method'] || 'post';
    var params = options['parameters'] || {};

    var form = document.createElement('form');
    form.setAttribute('method', method);
    form.setAttribute('action', path);

    for (var key in params) {
        var hiddenField = document.createElement('input');
        hiddenField.setAttribute('type', 'hidden');
        hiddenField.setAttribute('name', key);
        hiddenField.setAttribute('value', params[key]);
        form.appendChild(hiddenField);
    }
    document.body.appendChild(form);
    form.submit();
    document.body.removeChild(form);
};

Shopify.CountryProvinceSelector = function(country_domid, province_domid, options) {
    this.countryEl = document.getElementById(country_domid);
    this.provinceEl = document.getElementById(province_domid);
    this.provinceContainer = document.getElementById(options['hideElement'] || province_domid);

    Shopify.addListener(this.countryEl, 'change', Shopify.bind(this.countryHandler, this));

    this.initCountry();
    this.initProvince();
};

Shopify.CountryProvinceSelector.prototype = {
    initCountry: function() {
        var value = this.countryEl.getAttribute('data-default');
        Shopify.setSelectorByValue(this.countryEl, value);
        this.countryHandler();
    },

    initProvince: function() {
        var value = this.provinceEl.getAttribute('data-default');
        if (value && this.provinceEl.options.length > 0) {
            Shopify.setSelectorByValue(this.provinceEl, value);
        }
    },

    countryHandler: function(e) {
        var opt = this.countryEl.options[this.countryEl.selectedIndex];
        var raw = opt.getAttribute('data-provinces');
        var provinces = JSON.parse(raw);

        this.clearOptions(this.provinceEl);
        if (provinces && provinces.length == 0) {
            this.provinceContainer.style.display = 'none';
        } else {
            for (var i = 0; i < provinces.length; i++) {
                var opt = document.createElement('option');
                opt.value = provinces[i][0];
                opt.innerHTML = provinces[i][1];
                this.provinceEl.appendChild(opt);
            }

            this.provinceContainer.style.display = '';
        }
    },

    clearOptions: function(selector) {
        while (selector.firstChild) {
            selector.removeChild(selector.firstChild);
        }
    },

    setOptions: function(selector, values) {
        for (var i = 0, count = values.length; i < values.length; i++) {
            var opt = document.createElement('option');
            opt.value = values[i];
            opt.innerHTML = values[i];
            selector.appendChild(opt);
        }
    },
};

Shopify.formatMoney = function(cents, money_format) {
    let priceInCents = cents;

    let val = (priceInCents / 100.0).toLocaleString('en', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });

    let format = money_format || '';

    // Not necessary, but allows for more risk tolerance if Shopify.formatMoney doesn't work as we want
    let regexp = /^([^{}]*)\{\{amount\}\}([^{}]*)$/;
    if (format.match(regexp)) {
        return format.replace(regexp, '$1' + val + '$2');
    }

    regexp = /^([^{}]*)\{\{amount_with_comma_separator\}\}([^{}]*)$/;
    if (format.match(regexp)) {
        let money = val.replace(/[.]/, '|');
        money = money.replace(/[,]/, '.');
        money = money.replace(/[|]/, ',');
        return format.replace(regexp, '$1' + money + '$2');
    }

    return '$' + val;
};

Shopify.handleize = function(str) {
    let string = str
        .normalize('NFD')
        .replace(/[\[\]'()"]+/g, '') // Remove apostrophes, square brackets, and other bits and pieces
        .replace(/[\u0300-\u036f]/g, '') // Remove accents
        .replace(/([^\w]+|\s+)/g, '-') // Replace space and other characters by hyphen
        .replace(/\-\-+/g, '-') // Replaces multiple hyphens by one hyphen
        .replace(/(^-+|-+$)/g, '') // Remove extra hyphens from beginning or end of the string
        .toLowerCase(); // To lowercase

    return string;
};

class MenuDrawer extends HTMLElement {
    constructor() {
        super();

        this.mainDetailsToggle = this.querySelector('details');

        this.addEventListener('keyup', this.onKeyUp.bind(this));
        this.addEventListener('focusout', this.onFocusOut.bind(this));
        this.bindEvents();
    }

    bindEvents() {
        this.querySelectorAll('summary').forEach((summary) => summary.addEventListener('click', this.onSummaryClick.bind(this)));
        this.querySelectorAll('button').forEach((button) => button.addEventListener('click', this.onCloseButtonClick.bind(this)));
    }

    onKeyUp(event) {
        if (event.code.toUpperCase() !== 'ESCAPE') return;

        const openDetailsElement = event.target.closest('details[open]');
        if (!openDetailsElement) return;

        openDetailsElement === this.mainDetailsToggle ? this.closeMenuDrawer(event, this.mainDetailsToggle.querySelector('summary')) : this.closeSubmenu(openDetailsElement);
    }

    onSummaryClick(event) {
        const summaryElement = event.currentTarget;
        const detailsElement = summaryElement.parentNode;
        const isOpen = detailsElement.hasAttribute('open');
        const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

        function addTrapFocus() {
            trapFocus(summaryElement.nextElementSibling, detailsElement.querySelector('button'));
            summaryElement.nextElementSibling.removeEventListener('transitionend', addTrapFocus);
        }

        if (detailsElement === this.mainDetailsToggle) {
            if (isOpen) event.preventDefault();
            isOpen ? this.closeMenuDrawer(event, summaryElement) : this.openMenuDrawer(summaryElement);

            if (window.matchMedia('(max-width: 990px)')) {
                document.documentElement.style.setProperty('--viewport-height', `${window.innerHeight}px`);
            }
        } else {
            setTimeout(() => {
                detailsElement.classList.add('menu-opening');
                summaryElement.setAttribute('aria-expanded', true);
                !reducedMotion || reducedMotion.matches ? addTrapFocus() : summaryElement.nextElementSibling.addEventListener('transitionend', addTrapFocus);
            }, 100);
        }
    }

    openMenuDrawer(summaryElement) {
        setTimeout(() => {
            this.mainDetailsToggle.classList.add('menu-opening');
        });
        summaryElement.setAttribute('aria-expanded', true);
        trapFocus(this.mainDetailsToggle, summaryElement);
        document.body.classList.add(`overflow-hidden-${this.dataset.breakpoint}`);
    }

    closeMenuDrawer(event, elementToFocus = false) {
        if (event === undefined) return;

        this.mainDetailsToggle.classList.remove('menu-opening');
        this.mainDetailsToggle.querySelectorAll('details').forEach((details) => {
            details.removeAttribute('open');
            details.classList.remove('menu-opening');
        });
        document.body.classList.remove(`overflow-hidden-${this.dataset.breakpoint}`);
        removeTrapFocus(elementToFocus);
        this.closeAnimation(this.mainDetailsToggle);
    }

    onFocusOut(event) {
        setTimeout(() => {
            if (this.mainDetailsToggle.hasAttribute('open') && !this.mainDetailsToggle.contains(document.activeElement)) this.closeMenuDrawer();
        });
    }

    onCloseButtonClick(event) {
        const detailsElement = event.currentTarget.closest('details');
        this.closeSubmenu(detailsElement);
    }

    closeSubmenu(detailsElement) {
        detailsElement.querySelector('summary').setAttribute('aria-expanded', false);
        document.body.classList.remove(`overflow-hidden-${this.dataset.breakpoint}`);
        removeTrapFocus(detailsElement.querySelector('summary'));
        this.closeAnimation(detailsElement);
    }

    closeAnimation(detailsElement) {
        let animationStart;

        const handleAnimation = (time) => {
            if (animationStart === undefined) {
                animationStart = time;
            }

            const elapsedTime = time - animationStart;

            if (elapsedTime < 400) {
                window.requestAnimationFrame(handleAnimation);
            } else {
                detailsElement.removeAttribute('open');
                if (detailsElement.closest('details[open]')) {
                    trapFocus(detailsElement.closest('details[open]'), detailsElement.querySelector('summary'));
                }
            }
        };

        window.requestAnimationFrame(handleAnimation);
    }
}

customElements.define('menu-drawer', MenuDrawer);

class HeaderDrawer extends MenuDrawer {
    constructor() {
        super();
    }

    openMenuDrawer(summaryElement) {
        this.header = this.header || document.querySelector('.section-header');

        this.borderOffset = this.borderOffset || this.closest('.header-wrapper').classList.contains('header-wrapper--border-bottom') ? 1 : 0;
        document.documentElement.style.setProperty('--header-bottom-position', `${parseInt(this.header.getBoundingClientRect().bottom - this.borderOffset)}px`);
        this.header.classList.add('menu-open');

        setTimeout(() => {
            this.mainDetailsToggle.classList.add('menu-opening');
        });

        summaryElement.setAttribute('aria-expanded', true);
        trapFocus(this.mainDetailsToggle, summaryElement);
        document.body.classList.add(`overflow-hidden-${this.dataset.breakpoint}`);
    }

    closeMenuDrawer(event, elementToFocus) {
        super.closeMenuDrawer(event, elementToFocus);
        this.header.classList.remove('menu-open');
    }
}

customElements.define('header-drawer', HeaderDrawer);

class ModalDialog extends HTMLElement {
    constructor() {
        super();
        this.querySelector('[id^="ModalClose-"]').addEventListener('click', this.hide.bind(this, false));
        this.addEventListener('keyup', (event) => {
            if (event.code.toUpperCase() === 'ESCAPE') this.hide();
        });
        if (this.classList.contains('media-modal')) {
            this.addEventListener('pointerup', (event) => {
                if (event.pointerType === 'mouse' && !event.target.closest('deferred-media, product-model')) this.hide();
            });
        } else {
            this.addEventListener('click', (event) => {
                if (event.target === this) this.hide();
            });
        }
    }

    connectedCallback() {
        if (this.moved) return;
        this.moved = true;
        document.body.appendChild(this);
    }

    show(opener) {
        this.openedBy = opener;
        const popup = this.querySelector('.template-popup');
        document.body.classList.add('overflow-hidden');
        this.setAttribute('open', '');
        if (popup) popup.loadContent();
        trapFocus(this, this.querySelector('[role="dialog"]'));
        window.pauseAllMedia();
    }

    hide() {
        document.body.classList.remove('overflow-hidden');
        document.body.dispatchEvent(new CustomEvent('modalClosed'));
        this.removeAttribute('open');
        removeTrapFocus(this.openedBy);
        window.pauseAllMedia();
    }
}
customElements.define('modal-dialog', ModalDialog);

class ModalOpener extends HTMLElement {
    constructor() {
        super();

        const button = this.querySelector('button');

        if (!button) return;
        button.addEventListener('click', (e) => {
            e.stopPropagation();
            const modal = document.querySelector(this.getAttribute('data-modal'));
            if (modal) modal.show(button);
        });
    }
}
customElements.define('modal-opener', ModalOpener);

class DeferredMedia extends HTMLElement {
    constructor() {
        super();
        const poster = this.querySelector('[id^="Deferred-Poster-"]');
        if (!poster) return;
        poster.addEventListener('click', this.loadContent.bind(this));
    }

    loadContent(focus = true) {
        window.pauseAllMedia();
        if (!this.getAttribute('loaded')) {
            const content = document.createElement('div');
            content.appendChild(this.querySelector('template').content.firstElementChild.cloneNode(true));

            this.setAttribute('loaded', true);
            const deferredElement = this.appendChild(content.querySelector('video, model-viewer, iframe'));
            if (focus) deferredElement.focus();
        }
    }
}

customElements.define('deferred-media', DeferredMedia);

class SliderComponent extends HTMLElement {
    constructor() {
        super();
        this.waitToLoad = this.getAttribute('data-wait-to-load') === 'true';
        if (this.waitToLoad) return;

        this.slider = this.querySelector('[id^="Slider-"]');
        this.sliderItems = this.querySelectorAll('[id^="Slide-"]:not(.hide-media)');
        this.enableSliderLooping = false;
        this.currentPageElement = this.querySelector('.slider-counter--current');
        this.pageTotalElement = this.querySelector('.slider-counter--total');
        this.prevButton = this.querySelector('button[name="previous"]');
        this.nextButton = this.querySelector('button[name="next"]');

        if (!this.slider || !this.nextButton) return;

        this.initPages();
        const resizeObserver = new ResizeObserver((entries) => this.initPages());
        resizeObserver.observe(this.slider);

        this.slider.addEventListener('scroll', this.update.bind(this));
        this.prevButton.addEventListener('click', this.onButtonClick.bind(this));
        this.nextButton.addEventListener('click', this.onButtonClick.bind(this));
    }

    reload() {
        this.slider = this.querySelector('[id^="Slider-"]');
        this.sliderItems = this.querySelectorAll('[id^="Slide-"]:not(.hide-media)');
        this.enableSliderLooping = false;
        this.currentPageElement = this.querySelector('.slider-counter--current');
        this.pageTotalElement = this.querySelector('.slider-counter--total');
        this.prevButton = this.querySelector('button[name="previous"]');
        this.nextButton = this.querySelector('button[name="next"]');

        if (!this.slider || !this.nextButton) return;

        this.initPages();
        const resizeObserver = new ResizeObserver((entries) => this.initPages());
        resizeObserver.observe(this.slider);

        this.slider.addEventListener('scroll', this.update.bind(this));
        this.prevButton.addEventListener('click', this.onButtonClick.bind(this));
        this.nextButton.addEventListener('click', this.onButtonClick.bind(this));
    }

    initPages() {
        this.sliderItemsToShow = Array.from(this.sliderItems).filter((element) => element.clientWidth > 0);
        if (this.sliderItemsToShow.length < 2) return;
        this.sliderItemOffset = this.sliderItemsToShow[1].offsetLeft - this.sliderItemsToShow[0].offsetLeft;
        this.slidesPerPage = Math.floor((this.slider.clientWidth - this.sliderItemsToShow[0].offsetLeft) / this.sliderItemOffset);
        this.totalPages = this.sliderItemsToShow.length - this.slidesPerPage + 1;
        this.update();
    }

    resetPages() {
        this.slider.scrollLeft = 0;
        this.sliderItems = this.querySelectorAll('[id^="Slide-"]:not(.hide-media)');
        this.initPages();
    }

    update() {
        const previousPage = this.currentPage;
        this.currentPage = Math.round(this.slider.scrollLeft / this.sliderItemOffset) + 1;

        if (this.currentPageElement && this.pageTotalElement) {
            this.currentPageElement.textContent = this.currentPage;
            this.pageTotalElement.textContent = this.totalPages;
        }

        if (this.currentPage != previousPage) {
            this.dispatchEvent(
                new CustomEvent('slideChanged', {
                    detail: {
                        currentPage: this.currentPage,
                        currentElement: this.sliderItemsToShow[this.currentPage - 1],
                    },
                })
            );
        }

        if (this.enableSliderLooping) return;

        if (this.isSlideVisible(this.sliderItemsToShow[0]) && this.slider.scrollLeft === 0) {
            this.prevButton.setAttribute('disabled', 'disabled');
        } else {
            this.prevButton.removeAttribute('disabled');
        }

        if (this.isSlideVisible(this.sliderItemsToShow[this.sliderItemsToShow.length - 1])) {
            this.nextButton.setAttribute('disabled', 'disabled');
        } else {
            this.nextButton.removeAttribute('disabled');
        }
    }

    isSlideVisible(element, offset = 0) {
        const lastVisibleSlide = this.slider.clientWidth + this.slider.scrollLeft - offset;
        return element.offsetLeft + element.clientWidth <= lastVisibleSlide && element.offsetLeft >= this.slider.scrollLeft;
    }

    onButtonClick(event) {
        event.preventDefault();
        const step = event.currentTarget.dataset.step || 1;
        this.slideScrollPosition = event.currentTarget.name === 'next' ? this.slider.scrollLeft + step * this.sliderItemOffset : this.slider.scrollLeft - step * this.sliderItemOffset;
        this.slider.scrollTo({
            left: this.slideScrollPosition,
        });
    }
}

customElements.define('slider-component', SliderComponent);

class SlideshowComponent extends SliderComponent {
    constructor() {
        super();

        this.sliderControlWrapper = this.querySelector('.slider-buttons');
        this.enableSliderLooping = true;

        if (!this.sliderControlWrapper) return;

        this.sliderFirstItemNode = this.slider.querySelector('.slideshow__slide');
        if (this.sliderItemsToShow.length > 0) this.currentPage = 1;

        this.sliderControlLinksArray = Array.from(this.sliderControlWrapper.querySelectorAll('.slider-counter__link'));
        this.sliderControlLinksArray.forEach((link) => link.addEventListener('click', this.linkToSlide.bind(this)));
        this.slider.addEventListener('scroll', this.setSlideVisibility.bind(this));
        this.setSlideVisibility();

        if (this.slider.getAttribute('data-autoplay') === 'true') this.setAutoPlay();
    }

    setAutoPlay() {
        this.sliderAutoplayButton = this.querySelector('.slideshow__autoplay');
        this.autoplaySpeed = this.slider.dataset.speed * 1000;

        this.sliderAutoplayButton.addEventListener('click', this.autoPlayToggle.bind(this));
        this.addEventListener('mouseover', this.focusInHandling.bind(this));
        this.addEventListener('mouseleave', this.focusOutHandling.bind(this));
        this.addEventListener('focusin', this.focusInHandling.bind(this));
        this.addEventListener('focusout', this.focusOutHandling.bind(this));

        this.play();
        this.autoplayButtonIsSetToPlay = true;
    }

    onButtonClick(event) {
        super.onButtonClick(event);
        const isFirstSlide = this.currentPage === 1;
        const isLastSlide = this.currentPage === this.sliderItemsToShow.length;

        if (!isFirstSlide && !isLastSlide) return;

        if (isFirstSlide && event.currentTarget.name === 'previous') {
            this.slideScrollPosition = this.slider.scrollLeft + this.sliderFirstItemNode.clientWidth * this.sliderItemsToShow.length;
        } else if (isLastSlide && event.currentTarget.name === 'next') {
            this.slideScrollPosition = 0;
        }
        this.slider.scrollTo({
            left: this.slideScrollPosition,
        });
    }

    update() {
        super.update();
        this.sliderControlButtons = this.querySelectorAll('.slider-counter__link');
        this.prevButton.removeAttribute('disabled');

        if (!this.sliderControlButtons.length) return;

        this.sliderControlButtons.forEach((link) => {
            link.classList.remove('slider-counter__link--active');
            link.removeAttribute('aria-current');
        });
        this.sliderControlButtons[this.currentPage - 1].classList.add('slider-counter__link--active');
        this.sliderControlButtons[this.currentPage - 1].setAttribute('aria-current', true);
    }

    autoPlayToggle() {
        this.togglePlayButtonState(this.autoplayButtonIsSetToPlay);
        this.autoplayButtonIsSetToPlay ? this.pause() : this.play();
        this.autoplayButtonIsSetToPlay = !this.autoplayButtonIsSetToPlay;
    }

    focusOutHandling(event) {
        const focusedOnAutoplayButton = event.target === this.sliderAutoplayButton || this.sliderAutoplayButton.contains(event.target);
        if (!this.autoplayButtonIsSetToPlay || focusedOnAutoplayButton) return;
        this.play();
    }

    focusInHandling(event) {
        const focusedOnAutoplayButton = event.target === this.sliderAutoplayButton || this.sliderAutoplayButton.contains(event.target);
        if (focusedOnAutoplayButton && this.autoplayButtonIsSetToPlay) {
            this.play();
        } else if (this.autoplayButtonIsSetToPlay) {
            this.pause();
        }
    }

    play() {
        this.slider.setAttribute('aria-live', 'off');
        clearInterval(this.autoplay);
        this.autoplay = setInterval(this.autoRotateSlides.bind(this), this.autoplaySpeed);
    }

    pause() {
        this.slider.setAttribute('aria-live', 'polite');
        clearInterval(this.autoplay);
    }

    togglePlayButtonState(pauseAutoplay) {
        if (pauseAutoplay) {
            this.sliderAutoplayButton.classList.add('slideshow__autoplay--paused');
            this.sliderAutoplayButton.setAttribute('aria-label', window.accessibilityStrings.playSlideshow);
        } else {
            this.sliderAutoplayButton.classList.remove('slideshow__autoplay--paused');
            this.sliderAutoplayButton.setAttribute('aria-label', window.accessibilityStrings.pauseSlideshow);
        }
    }

    autoRotateSlides() {
        const slideScrollPosition = this.currentPage === this.sliderItems.length ? 0 : this.slider.scrollLeft + this.slider.querySelector('.slideshow__slide').clientWidth;
        this.slider.scrollTo({
            left: slideScrollPosition,
        });
    }

    setSlideVisibility() {
        this.sliderItemsToShow.forEach((item, index) => {
            const linkElements = item.querySelectorAll('a');
            if (index === this.currentPage - 1) {
                if (linkElements.length)
                    linkElements.forEach((button) => {
                        button.removeAttribute('tabindex');
                    });
                item.setAttribute('aria-hidden', 'false');
                item.removeAttribute('tabindex');
            } else {
                if (linkElements.length)
                    linkElements.forEach((button) => {
                        button.setAttribute('tabindex', '-1');
                    });
                item.setAttribute('aria-hidden', 'true');
                item.setAttribute('tabindex', '-1');
            }
        });
    }

    linkToSlide(event) {
        event.preventDefault();
        const slideScrollPosition = this.slider.scrollLeft + this.sliderFirstItemNode.clientWidth * (this.sliderControlLinksArray.indexOf(event.currentTarget) + 1 - this.currentPage);
        this.slider.scrollTo({
            left: slideScrollPosition,
        });
    }
}

customElements.define('slideshow-component', SlideshowComponent);

class VariantSelects extends HTMLElement {
    constructor() {
        super();
    }

    connectedCallback() {
        this.addEventListener('change', (event) => {
            this.getInputForEventTarget(event.target);
            this.updateSelectionMetadata(event);
            this.onVariantChange();
        });
    }

    updateSelectionMetadata({
        target
    }) {
        const {
            value,
            tagName
        } = target;

        if (tagName === 'SELECT' && target.selectedOptions.length) {
            Array.from(target.options)
                .find((option) => option.getAttribute('selected'))
                .removeAttribute('selected');
            target.selectedOptions[0].setAttribute('selected', 'selected');

            const swatchValue = target.selectedOptions[0].dataset.optionSwatchValue;
            const selectedDropdownSwatchValue = target.closest('.product-form__input').querySelector('[data-selected-value] > .swatch');
            if (!selectedDropdownSwatchValue) return;
            if (swatchValue) {
                selectedDropdownSwatchValue.style.setProperty('--swatch--background', swatchValue);
                selectedDropdownSwatchValue.classList.remove('swatch--unavailable');
            } else {
                selectedDropdownSwatchValue.style.setProperty('--swatch--background', 'unset');
                selectedDropdownSwatchValue.classList.add('swatch--unavailable');
            }

            selectedDropdownSwatchValue.style.setProperty('--swatch-focal-point', target.selectedOptions[0].dataset.optionSwatchFocalPoint || 'unset');
        } else if (tagName === 'INPUT' && target.type === 'radio') {
            const selectedSwatchValue = target.closest(`.product-form__input`).querySelector('[data-selected-value]');
            if (selectedSwatchValue) selectedSwatchValue.innerHTML = value;
        }
    }

    getInputForEventTarget(target) {
        return target.tagName === 'SELECT' ? target.selectedOptions[0] : target;
    }

    get selectedOptionValues() {
        return Array.from(this.querySelectorAll('select option[selected], fieldset input:checked')).map(({
            value
        }) => value);
    }

    onVariantChange() {
        this.updateMasterId();
        this.toggleAddButton(true, '', false);
        this.removeErrorMessage();
        this.updateVariantStatuses();
        if (!this.currentVariant) {
            this.toggleAddButton(true, '', true);
            this.setUnavailable();
        } else {
            this.updateMedia();
            this.updateURL();
            this.updateVariantInput();
            this.renderProductInfo();
            this.toggleAddButton(!this.currentVariant.available, window.variantStrings.soldOut);
            this.updateShareUrl();
        }
    }

    updateMasterId() {
        this.currentVariant = this.getVariantData().find((variant) => {
            return !variant.options
                .map((option, index) => {
                    return this.selectedOptionValues[index] === option;
                })
                .includes(false);
        });

        this.dispatchEvent(
            new CustomEvent('variantChanged', {
                detail: {
                    selectedVariant: this.currentVariant,
                },
            })
        );
    }

    updateMedia() {
        if (!this.currentVariant) return;
        if (!this.currentVariant.featured_media) return;

        const mediaGalleries = document.querySelectorAll(`[id^="MediaGallery-${this.dataset.section}"]`);
        mediaGalleries.forEach((mediaGallery) => {
            mediaGallery.setActiveMedia(`${this.dataset.section}-${this.currentVariant.featured_media.id}`, true);
            if (mediaGallery.hasAttribute('image-grouping-enabled')) {
                const groupIndex = mediaGallery.dataset.groupIndex ? parseInt(mediaGallery.dataset.groupIndex) : 0;
                const groupValues = mediaGallery.dataset.groupValues ? JSON.parse(mediaGallery.dataset.groupValues) : [];
                const firstVariantOption = this.currentVariant.options[groupIndex];
                const images = mediaGallery.querySelectorAll('[data-media-alt]');
                images.forEach((el) => {
                    el.classList.add('hide-media');
                    if (el.dataset.mediaAlt === firstVariantOption.toLowerCase() || !groupValues.some((value) => el.dataset.mediaAlt === value)) {
                        el.classList.remove('hide-media');
                    }
                });
                mediaGallery.querySelectorAll('slider-component').forEach((slider) => {
                    slider.resetPages();
                });
            }
        });

        const modalContent = document.querySelector(`#ProductModal-${this.dataset.section} .product-media-modal__content`);
        if (!modalContent) return;
    }

    updateURL() {
        if (!this.currentVariant || this.dataset.updateUrl === 'false') return;
        window.history.replaceState({}, '', `${this.dataset.url}?variant=${this.currentVariant.id}`);
    }

    updateShareUrl() {
        const shareButton = document.getElementById(`Share-${this.dataset.section}`);
        if (!shareButton || !shareButton.updateUrl) return;
        shareButton.updateUrl(`${window.shopUrl}${this.dataset.url}?variant=${this.currentVariant.id}`);
    }

    updateVariantInput() {
        const productForms = document.querySelectorAll(`#product-form-${this.dataset.section}, #product-form-installment-${this.dataset.section}`);
        productForms.forEach((productForm) => {
            const input = productForm.querySelector('input[name="id"]');
            input.value = this.currentVariant.id;
            input.dispatchEvent(new Event('change', {
                bubbles: true
            }));
        });
    }

    updateVariantStatuses() {
        const selectedOptionOneVariants = this.variantData.filter((variant) => this.querySelector(':checked').value === variant.option1);

        const inputWrappers = [...this.querySelectorAll('.product-form__input')];
        inputWrappers.forEach((option, index) => {
            if (index === 0) return;
            const optionInputs = [...option.querySelectorAll('input[type="radio"], option')];
            const previousOptionSelected = inputWrappers[index - 1].querySelector(':checked').value;
            const availableOptionInputsValue = selectedOptionOneVariants
                .filter((variant) => variant.available && variant[`option${index}`] === previousOptionSelected)
                .map((variantOption) => variantOption[`option${index + 1}`]);
            this.setInputAvailability(optionInputs, availableOptionInputsValue);
        });
    }

    setInputAvailability(elementList, availableValuesList) {
        elementList.forEach((element) => {
            const value = element.getAttribute('value');
            const availableElement = availableValuesList.includes(value);

            if (element.tagName === 'INPUT') {
                element.classList.toggle('disabled', !availableElement);
                element.classList.toggle('visually-disabled', !availableElement);
                const stockStatus = element.nextElementSibling.querySelector('span.stock-status');
                if (stockStatus) stockStatus.innerText = availableElement ? 'In Stock' : 'Out of Stock';
            } else if (element.tagName === 'OPTION') {
                element.innerText = availableElement ? value : window.variantStrings.unavailable_with_option.replace('[value]', value);
            }
        });
    }

    removeErrorMessage() {
        const section = this.closest('section');
        if (!section) return;

        const productForm = section.querySelector('product-form');
        if (productForm) productForm.handleErrorMessage();
    }

    renderProductInfo() {
        fetch(`${this.dataset.url}?variant=${this.currentVariant.id}&section_id=${this.dataset.originalSection ? this.dataset.originalSection : this.dataset.section}`)
            .then((response) => response.text())
            .then((responseText) => {
                const html = new DOMParser().parseFromString(responseText, 'text/html');
                const destination = document.getElementById(`price-${this.dataset.section}`);
                const source = html.getElementById(`price-${this.dataset.originalSection ? this.dataset.originalSection : this.dataset.section}`);
                if (source && destination) destination.innerHTML = source.innerHTML;

                const price = document.getElementById(`price-${this.dataset.section}`);

                if (price) price.classList.remove('visibility-hidden');

                // const currentVariantSelectsEl = document.querySelector('variant-selects');
                // const futureVariantSelectsEl = html.querySelector('variant-selects');
                // if (currentVariantSelectsEl && futureVariantSelectsEl) currentVariantSelectsEl.replaceWith(futureVariantSelectsEl);

                const currentEtaTextEl = document.querySelector('p:not(.notify).eta-text');
                const futureEtaTextEl = html.querySelector('p:not(.notify).eta-text');
                const klaviyoNotifyEl = document.querySelector('p.notify.eta-text');
                if (currentEtaTextEl) currentEtaTextEl.remove();
                if (futureEtaTextEl && klaviyoNotifyEl) klaviyoNotifyEl.parentElement.insertBefore(futureEtaTextEl, klaviyoNotifyEl);

                const currentPromoBannerEl = document.querySelector('product-promo-banner');
                const futurePromoBannerEl = html.querySelector('product-promo-banner');
                if (currentPromoBannerEl && futurePromoBannerEl) currentPromoBannerEl.replaceWith(futurePromoBannerEl);

                const currentLatteRewardsEarnEls = document.querySelector('.product__rewards-earn');
                const futureLatteRewardsEarnEls = html.querySelector('.product__rewards-earn');

                if (currentLatteRewardsEarnEls && futureLatteRewardsEarnEls) currentLatteRewardsEarnEls.replaceWith(futureLatteRewardsEarnEls);

                const currentVariantInventoryEl = document.querySelector('.product__inventory-quantity');
                const futureVariantInventoryEl = html.querySelector('.product__inventory-quantity');
                if (currentVariantInventoryEl && futureVariantInventoryEl) currentVariantInventoryEl.replaceWith(futureVariantInventoryEl);

                const currentSpecsSkuPropertyValue = document.querySelector('.product-specs__container .product-specs__table .product-spec__value > span[itemprop="sku"]');
                if (this.currentVariant && this.currentVariant.sku && currentSpecsSkuPropertyValue) currentSpecsSkuPropertyValue.textContent = this.currentVariant.sku;

            });
    }

    toggleAddButton(disable = true, text, modifyClass = true) {
        const productForm = document.getElementById(`product-form-${this.dataset.section}`);
        if (!productForm) return;
        const addButton = productForm.querySelector('[name="add"]') || productForm.querySelector('[name="bundle"]');
        const addButtonText = productForm.querySelector('[name="add"] > span') || productForm.querySelector('[name="bundle"] > span');
        if (!addButton) return;

        if (disable) {
            addButton.setAttribute('disabled', 'disabled');
            if (text) addButtonText.textContent = text;
        } else {
            addButton.removeAttribute('disabled');
            if (addButton.name === 'bundle') {
                addButtonText.innerHTML = this.currentVariant.preorder_enabled ? window.variantStrings.preOrderBundle : window.variantStrings.addToCartBundle;
            } else {
                addButtonText.textContent = this.currentVariant.preorder_enabled ? window.variantStrings.preOrder : window.variantStrings.addToCart;
            }
        }

        if (!modifyClass) return;
    }

    setUnavailable() {
        const button = document.getElementById(`product-form-${this.dataset.section}`);
        const addButton = button.querySelector('[name="add"]') || button.querySelector('[name="bundle"]');
        const addButtonText = button.querySelector('[name="add"] > span') || button.querySelector('[name="bundle"] > span');
        const price = document.getElementById(`price-${this.dataset.section}`);
        if (!addButton) return;
        addButtonText.textContent = window.variantStrings.unavailable;
        if (price) price.classList.add('visibility-hidden');
    }

    getVariantData() {
        this.variantData = this.variantData || JSON.parse(this.querySelector('[type="application/json"]').textContent);
        return this.variantData;
    }
}

customElements.define('variant-selects', VariantSelects);

class ProductRecommendations extends HTMLElement {
    constructor() {
        super();
    }

    connectedCallback() {
        const handleIntersection = (entries, observer) => {
            if (!entries[0].isIntersecting) return;
            observer.unobserve(this);

            fetch(this.dataset.url)
                .then((response) => response.text())
                .then((text) => {
                    const html = document.createElement('div');
                    html.innerHTML = text;
                    const recommendations = html.querySelector('product-recommendations');

                    if (recommendations && recommendations.innerHTML.trim().length) {
                        this.innerHTML = recommendations.innerHTML;
                    }

                    if (!this.querySelector('slideshow-component') && this.classList.contains('complementary-products')) {
                        this.remove();
                    }

                    if (html.querySelector('.grid__item')) {
                        this.classList.add('product-recommendations--loaded');
                    }
                })
                .catch((e) => {
                    console.error(e);
                });
        };

        new IntersectionObserver(handleIntersection.bind(this), {
            rootMargin: '0px 0px 400px 0px',
        }).observe(this);
    }
}

customElements.define('product-recommendations', ProductRecommendations);

class SliderPDPComponent extends HTMLElement {
    constructor() {
        super();
        this.slider = this.querySelector('[id^="Slider-"]');
        this.sliderItems = this.querySelectorAll('[id^="Slide-"]');
        this.prevButtons = this.querySelectorAll('button[name="previous"]');
        this.nextButtons = this.querySelectorAll('button[name="next"]');
        this.categoryContainer = this.querySelector('.slider-pdp-categories-list');
        this.slideCategoryButtons = this.querySelectorAll('.slide-category');
        this.categoryPrevButton = this.querySelector('.category-button--prev');
        this.categoryNextButton = this.querySelector('.category-button--next');

        if (!this.slider || !this.nextButtons) return;

        this.initPages();
        const resizeObserver = new ResizeObserver((entries) => this.initPages());
        resizeObserver.observe(this.slider);

        this.slider.addEventListener('scroll', this.update.bind(this));
        Array.from(this.prevButtons).forEach((element) => element.addEventListener('click', this.onButtonClick.bind(this)));
        Array.from(this.nextButtons).forEach((element) => element.addEventListener('click', this.onButtonClick.bind(this)));
        Array.from(this.slideCategoryButtons).forEach((element) => element.addEventListener('click', this.onSlideCategoryButtonClick.bind(this)));
        if (this.categoryPrevButton) this.categoryPrevButton.addEventListener('click', this.onCategoryNavigationButtonClick.bind(this));
        if (this.categoryNextButton) this.categoryNextButton.addEventListener('click', this.onCategoryNavigationButtonClick.bind(this));
    }

    initPages() {
        this.sliderItemsToShow = Array.from(this.sliderItems).filter((element) => element.clientWidth > 0);
        if (this.sliderItemsToShow.length < 2) return;
        this.sliderItemOffset = this.sliderItemsToShow[1].offsetLeft - this.sliderItemsToShow[0].offsetLeft;
        this.slidesPerPage = Math.floor((this.slider.clientWidth - this.sliderItemsToShow[0].offsetLeft) / this.sliderItemOffset);
        this.totalPages = this.sliderItemsToShow.length - this.slidesPerPage;
        this.update();
    }

    resetPages() {
        this.sliderItems = this.querySelectorAll('[id^="Slide-"]');
        this.initPages();
    }

    update() {
        const previousPage = this.currentPage;
        this.currentPage = Math.round(this.slider.scrollLeft / this.sliderItemOffset) + 1;

        if (this.currentPage != previousPage) {
            if (this.currentPage && this.sliderItemsToShow) {
                const category =
                    this.sliderItemsToShow[this.currentPage - 1] && this.sliderItemsToShow[this.currentPage - 1].dataset ? this.sliderItemsToShow[this.currentPage - 1].dataset.category : '';
                this.slideCategoryActive(category);
            }
            this.dispatchEvent(
                new CustomEvent('slideChanged', {
                    detail: {
                        currentPage: this.currentPage,
                        currentElement: this.sliderItemsToShow[this.currentPage - 1],
                    },
                })
            );
        }
    }

    isSlideVisible(element, offset = 0) {
        const lastVisibleSlide = this.slider.clientWidth + this.slider.scrollLeft - offset;
        return element.offsetLeft + element.clientWidth <= lastVisibleSlide && element.offsetLeft >= this.slider.scrollLeft;
    }

    onButtonClick(event) {
        event.preventDefault();
        if (event.currentTarget.name === 'next') {
            const nextPageNum = this.currentPage - 1 + 1 > this.sliderItemsToShow.length - 1 ? 0 : this.currentPage - 1 + 1;
            this.slideScrollPosition = nextPageNum * this.sliderItemOffset;
        }
        if (event.currentTarget.name === 'previous') {
            const previousPageNum = this.currentPage - 1 - 1 < 0 ? this.sliderItemsToShow.length - 1 : this.currentPage - 1 - 1;
            this.slideScrollPosition = previousPageNum * this.sliderItemOffset;
        }
        this.slider.scrollTo({
            left: this.slideScrollPosition,
        });
    }

    onSlideCategoryButtonClick(event) {
        event.preventDefault();
        const index = event.currentTarget.dataset.index || 0;
        this.slideScrollPosition = index * this.sliderItemOffset;
        this.slider.scrollTo({
            left: this.slideScrollPosition,
        });
    }

    onCategoryNavigationButtonClick(event) {
        let categoryButtons = Array.from(this.slideCategoryButtons);
        let activeCategoryIndex = categoryButtons.findIndex((element) => element.classList.contains('active'));
        if (activeCategoryIndex !== null) {
            if (event.currentTarget.name === 'next-category') {
                if (activeCategoryIndex === categoryButtons.length - 1) {
                    activeCategoryIndex = 0;
                } else {
                    activeCategoryIndex++;
                }
            }
            if (event.currentTarget.name === 'previous-category') {
                if (activeCategoryIndex === 0) {
                    activeCategoryIndex = categoryButtons.length - 1;
                } else {
                    activeCategoryIndex--;
                }
            }
            const index = categoryButtons[activeCategoryIndex].dataset.index || 0;
            this.slideScrollPosition = index * this.sliderItemOffset;
            this.slider.scrollTo({
                left: this.slideScrollPosition,
            });
        }
    }

    slideCategoryActive(category) {
        this.slideCategoryButtons.forEach((element) => {
            element.classList.remove('active');
            if (element.dataset.category.toLowerCase() === category.toLowerCase()) {
                element.classList.add('active');
                this.categoryContainer.scrollTo({
                    left: element.dataset.index == 0 ? 0 : element.offsetLeft,
                });
            }
        });
    }
}

customElements.define('slider-pdp-component', SliderPDPComponent);

/* This is for cookies */
function getCookieVal(offset) {
    var endstr = document.cookie.indexOf(';', offset);
    if (endstr == -1) {
        endstr = document.cookie.length;
    }
    return unescape(document.cookie.substring(offset, endstr));
}

function GetCookie(name) {
    var arg = name + '=';
    var alen = arg.length;
    var clen = document.cookie.length;
    var i = 0;
    while (i < clen) {
        var j = i + alen;
        if (document.cookie.substring(i, j) == arg) {
            return getCookieVal(j);
        }
        i = document.cookie.indexOf(' ', i) + 1;
        if (i == 0) break;
    }
    return null;
}

function DeleteCookie(name, path, domain) {
    if (GetCookie(name)) {
        document.cookie = name + '=' + (path ? '; path=' + path : '') + (domain ? '; domain=' + domain : '') + '; expires=Thu, 01-Jan-70 00:00:01 GMT';
    }
}

function SetCookie(name, value, expires, path, domain, secure) {
    document.cookie =
        name +
        '=' +
        escape(value) +
        (expires ? '; expires=' + expires.toGMTString() : '') +
        (path ? '; path=' + path : '') +
        (domain ? '; domain=' + domain : '') +
        (secure ? '; secure' : '');
}

/* Open all external links to a new tab */
var links = document.links;
for (let linkIndex = 0, linksLength = links.length; linkIndex < linksLength; linkIndex++) {
    const validHosts = [window.location.hostname, 'www.wholelattelove.ca', 'wholelattelove.ca', 'www.wholelattelove.com', 'wholelattelove.com'];

    if (!validHosts.includes(links[linkIndex].hostname)) {
        (links[linkIndex].target = '_blank'), (links[linkIndex].rel = 'noopener'), (links[linkIndex].ariaLabel = `Link opens into a new tab ${links[linkIndex].href}.`);
    }
}

/* Product info tooltip */

function showVariantTooltip(event) {
    event.stopPropagation(); // we don't want the window to see the click as well
    hideVariantTooltip();
    this.classList.add('variant-tooltiptext-visible');
}

function hideVariantTooltip() {
    let el = document.querySelector('.variant-tooltiptext-visible');
    if (el) {
        el.classList.remove('variant-tooltiptext-visible');
    }
}

window.addEventListener('click', hideVariantTooltip); //hide the tooltip if the user clicks anywhere on the window

//For each of the elements where we want to show a tooltip add an eventlistener to pick up clicks
const els = document.querySelectorAll('.variant-tooltip');
for (let i = 0; i < els.length; i++) {
    els[i].addEventListener('click', showVariantTooltip);
}

function openLiveChat() {
    if (typeof window.LC_API !== 'undefined') {
        window.LC_API.open_chat_window(); // This opens the LiveChat widget
    } else {
        console.log('LiveChat API not available.');
    }
}

document.addEventListener('DOMContentLoaded', function() {
    const toggleCountry = document.getElementById('toggleCountry');
    const activeCountry = document.querySelector('.country-selector.country-selector__displayed.customer-bar__country-active');
    const countryList = document.getElementById('countryList');

    if (toggleCountry && countryList) {
        activeCountry.addEventListener('click', function() {
            countryList.classList.toggle('hidden-country');
        });

        document.addEventListener('click', function(e) {
            if (!toggleCountry.contains(e.target) && !countryList.contains(e.target)) {
                countryList.classList.add('hidden-country');
            }
        });
    }
});

class RangeSlider extends HTMLElement {
    constructor() {
        super();
    }

    load() {
        this.fromSlider = this.querySelector('.range-slider__input--from');
        this.toSlider = this.querySelector('.range-slider__input--to');

        this.fromInput = this.querySelector('.range-slider__control-input--from');
        this.toInput = this.querySelector('.range-slider__control-input--to');

        if (!this.fromSlider || !this.toSlider || !this.fromInput || !this.toInput) return;

        this.fillSlider();
        this.setToggleAccessible();

        this.fromSlider.addEventListener('input', () => this.controlFromSlider());
        this.toSlider.addEventListener('input', () => this.controlToSlider());

        this.fromInput.addEventListener('input', () => this.controlFromInput());
        this.toInput.addEventListener('input', () => this.controlToInput());
    }

    fillSlider(sliderColor = '#C9C9C9', rangeColor = '#000000') {
        const rangeDistance = this.toSlider.max - this.toSlider.min;
        const fromPosition = this.fromSlider.value - this.toSlider.min;
        const toPosition = this.toSlider.value - this.toSlider.min;

        this.toSlider.style.background = `linear-gradient(
      to right,
      ${sliderColor} 0%,
      ${sliderColor} ${(fromPosition / rangeDistance) * 100}%,
      ${rangeColor} ${(fromPosition / rangeDistance) * 100}%,
      ${rangeColor} ${(toPosition / rangeDistance) * 100}%, 
      ${sliderColor} ${(toPosition / rangeDistance) * 100}%, 
      ${sliderColor} 100%)`;
    }

    controlFromSlider() {
        const fromValue = parseInt(this.fromSlider.value, 10);
        const toValue = parseInt(this.toSlider.value, 10);

        if (fromValue > toValue) {
            this.fromSlider.value = toValue;
            this.fromInput.value = toValue;
        } else {
            this.fromInput.value = fromValue;
        }

        this.fillSlider();
    }

    controlFromInput() {
        const fromValue = parseInt(this.fromInput.value, 10);
        const toValue = parseInt(this.toInput.value, 10);

        if (fromValue > toValue) {
            this.fromSlider.value = toValue;
            this.fromInput.value = toValue;
        } else {
            this.fromInput.value = fromValue;
        }

        this.fillSlider();
    }

    controlToSlider() {
        const fromValue = parseInt(this.fromSlider.value, 10);
        const toValue = parseInt(this.toSlider.value, 10);

        if (fromValue <= toValue) {
            this.toSlider.value = toValue;
            this.toInput.value = toValue;
        } else {
            this.toInput.value = fromValue;
            this.toSlider.value = fromValue;
        }

        this.fillSlider();
        this.setToggleAccessible();
    }

    controlToInput() {
        const fromValue = parseInt(this.fromInput.value, 10);
        const toValue = parseInt(this.toInput.value, 10);

        if (fromValue <= toValue) {
            this.toSlider.value = toValue;
            this.toInput.value = toValue;
        } else {
            this.toInput.value = fromValue;
            this.toSlider.value = fromValue;
        }

        this.fillSlider();
        this.setToggleAccessible();
    }

    setToggleAccessible() {
        if (Number(this.toSlider.value) <= 0) {
            this.toSlider.style.zIndex = 2;
        } else {
            this.toSlider.style.zIndex = 0;
        }
    }
}

customElements.define('range-slider', RangeSlider);

class ARButton extends HTMLElement {
    constructor() {
        super();

        this.addEventListener('click', this.onButtonClick.bind(this));
    }

    onButtonClick() {
        const handle = this.dataset.handle;
        const button = this.querySelector('button');

        fetch(`/products/${handle}?section_id=section_product-3d-viewer-popup`)
            .then((r) => r.text())
            .then((responseText) => {
                const viewerOld = document.querySelector('#ARViewerPopupModal');

                if (viewerOld) {
                    viewerOld.remove();
                }

                const html = new DOMParser().parseFromString(responseText, 'text/html');
                const viewer = html.querySelector('#ARViewerPopupModal');

                if (viewer) {
                    document.body.appendChild(viewer);
                    viewer.show(button);
                }
            });
    }
}

customElements.define('ar-button', ARButton);




class CardSwatches extends HTMLElement {
    constructor() {
        super();

        this.selectedOptions = [null, null, null];
        this.maxSwatches = 3;
    }

    init() {
        this.firstOptionIndex = this.selectedOptions.findIndex((option) => option !== null);
        this.secondOptionIndex = this.selectedOptions.findIndex((option) => option !== null && option !== this.selectedOptions[this.firstOptionIndex]);

        this.addEventListener('change', this.onChange.bind(this));

        this.buildSecondarySwatchList();
    }

    buildSecondarySwatchList(setSecondaryOption = false) {
        this.listing = this.closest('listing-algolia');

        if (this.secondOptionIndex !== -1) {
            // Get all variants that have the option at index firstOptionIndex set to the value of the first option.
            const matchingVariants = this.variantsData.filter((variant) => variant.options[this.firstOptionIndex].value === this.selectedOptions[this.firstOptionIndex]);

            const uniqueSecondaryOptions = matchingVariants.map((variant) => variant.options[this.secondOptionIndex].value).filter((value, index, self) => self.indexOf(value) === index);

            const secondarySwatchList = this.querySelector(`.card__swatch-list[data-option-index="${this.secondOptionIndex}"]`);
            if (secondarySwatchList) {
                secondarySwatchList.remove();
            }

            if (setSecondaryOption) {
                this.setSelectedOption(this.secondOptionIndex, uniqueSecondaryOptions[0]);
            }

            if (uniqueSecondaryOptions.length > 1) {
                const optionName = matchingVariants[0].options[this.secondOptionIndex].name.toLowerCase();

                let swatchCount = 1;
                let swatchData = [];

                if (optionName == 'color' || optionName == 'colour') {
                    swatchData = this.colorData;
                } else if (optionName == 'material') {
                    swatchData = this.materialData;
                } else {
                    return;
                }

                const swatchList = this.generateSwatchList(optionName, this.secondOptionIndex);

                uniqueSecondaryOptions.forEach((option, optionIndex) => {
                    if (option == this.selectedOptions[this.secondOptionIndex]) {
                        const swatch = swatchData.find((swatch) => swatch.name == option);

                        if (swatch) {
                            const swatchItem = this.generateSwatch(swatch, optionIndex, optionName, this.secondOptionIndex, true);
                            swatchList.appendChild(swatchItem);
                        }
                    }
                });

                uniqueSecondaryOptions.forEach((option, optionIndex) => {
                    const swatch = swatchData.find((swatch) => swatch.name == option && swatch.name != this.selectedOptions[this.secondOptionIndex]);

                    if (swatch && swatchCount < this.maxSwatches) {
                        const swatchItem = this.generateSwatch(swatch, optionIndex, optionName, this.secondOptionIndex, false);
                        swatchList.appendChild(swatchItem);

                        swatchCount++;
                    }
                });

                if (uniqueSecondaryOptions.length > this.maxSwatches) {
                    const moreSwatches = document.createElement('div');
                    moreSwatches.classList.add('card__swatch', 'card__swatch--more');

                    const moreSwatchesLink = document.createElement('a');
                    moreSwatchesLink.classList.add('full-unstyled-link');
                    moreSwatchesLink.href = `/products/${this.hit.handle}?variant=${this.hit.objectID}`;
                    moreSwatchesLink.innerHTML = `+`;
                    moreSwatches.appendChild(moreSwatchesLink);

                    swatchList.appendChild(moreSwatches);
                }

                this.appendChild(swatchList);
            }

            if (setSecondaryOption) {
                this.update();
            }
        }
    }

    setMaxSwatches(maxSwatches) {
        this.maxSwatches = maxSwatches;
    }

    setHit(hit) {
        this.hit = hit;
    }

    setVariantData(variantsData) {
        this.variantsData = variantsData;
    }

    setSelectedOption(index, value) {
        this.selectedOptions[index] = value;
    }

    setMaterialData(materialData) {
        this.materialData = materialData;
    }

    setColorData(colorData) {
        this.colorData = colorData;
    }

    onChange(event) {
        this.selectedSwatches = this.querySelectorAll('.swatch__input:checked');

        this.selectedSwatches.forEach((swatch) => {
            this.selectedOptions[parseInt(swatch.dataset.optionIndex)] = swatch.value;
        });

        this.update();
    }

    update() {
        const matchingVariant = this.variantsData.find((variant) => variant.options.every((opt, i) => this.selectedOptions[i] === null || opt.value === this.selectedOptions[i]));

        if (matchingVariant) {
            this.updateCardData(matchingVariant);
        } else {
            this.buildSecondarySwatchList(true);
        }
    }

    updateCardData(variant) {
        this.card = this.closest('.card');
        this.listing = this.closest('listing-algolia');

        const priceContainer = this.card.querySelector('.card__price');

        const compareAtPrice = parseFloat(variant.compareAtPrice);
        const price = parseFloat(variant.price);

        priceContainer.innerHTML = `
      <div 
        class="
          card__price
          ${compareAtPrice > price ? 'price--on-sale' : 'price--no-compare'}
        ">
          <div class="price__container">
            <div class="price__regular">
              <span class="visually-hidden visually-hidden--inline">${window.theme.strings.regularPrice}</span>
              <span class="price-item price-item--regular">
                ${algoliaShopify.formatMoney(price * 100)}
              </span>
            </div>

            ${
              compareAtPrice > price
                ? `
              <div class="price__sale">
                <div class="price__container">
                  <span class="visually-hidden visually-hidden--inline">${window.theme.strings.salePrice}</span>
                  <span class="price-item price-item--sale price-item--last">
                    ${algoliaShopify.formatMoney(price * 100)}
                  </span>
                  <span class="visually-hidden visually-hidden--inline">${window.theme.strings.regularPrice}</span>
                  <span>
                    <s class="price-item price-item--regular">
                      ${algoliaShopify.formatMoney(compareAtPrice * 100)}
                    </s>
                  </span>
                </div>
              </div>
            `
                : ''
            }
          </div>
        </div>
      </div>
    `;

        const imageContainer = this.card.querySelector('.card__media .media');

        const image = document.createElement('img');
        image.classList.add('motion-reduce');
        image.loading = 'lazy';
        image.width = 540;
        image.height = 540;
        image.src = variant.image.url + '&width=1080';
        image.srcset = `${variant.image.url + '&width=180'} 180w, ${variant.image.url + '&width=360'} 360w, ${variant.image.url + '&width=540'} 540w, ${
      variant.image.url + '&width=720'
    } 720w, ${variant.image.url + '&width=900'} 900w, ${variant.image.url + '&width=1080'} 1080w`;
        image.alt = variant.image.altText;
        image.sizes = '(min-width: 1200px) 187.5px, (min-width: 990px) calc((100vw - 450px) / 4), (min-width: 750px) calc((100vw - 120px) / 3), calc((100vw - 84px) / 2)';

        imageContainer.replaceChild(image, imageContainer.firstChild);

        const links = this.card.querySelectorAll('[href]');
        links.forEach((link) => {
            // Replace the variant parameter with the variant.objectID
            link.href = link.href.split('?')[0] + '?variant=' + variant.id;
        });

        if (this.listing) {
            aa('viewedObjectIDs', {
                userToken: getAlgoliaUserToken(),
                eventName: 'Product Viewed',
                index: this.listing.buildIndexParams(),
                objectIDs: [String(variant.id)],
            });
        }
    }

    generateSwatchList(option, optionIndex) {
        const swatchList = document.createElement('div');
        swatchList.classList.add('card__swatch-list', `card__swatch-list--${slugify(option)}`);
        swatchList.dataset.optionName = option;
        swatchList.dataset.optionIndex = optionIndex;

        return swatchList;
    }

    generateSwatch(swatch, swatchIndex, option, optionIndex, selected = false) {
        const swatchItem = document.createElement('div');
        swatchItem.classList.add('card__swatch', `card__swatch--${slugify(option)}`);

        swatchItem.dataset.swatchName = swatch.name;
        swatchItem.dataset.swatchImage = `${swatch.image?.url}&width=20`;
        swatchItem.dataset.swatchHex = swatch.hex;

        const swatchImage = document.createElement('div');
        swatchImage.classList.add('swatch__image');

        if (swatch.image ? .url) {
            swatchImage.innerHTML = `
        <div class="media media--square">
          <img src="${swatch.image.url}&width=20" alt="${swatch.image.altText}" width="20" height="20">
        </div>
      `;
        } else {
            swatchImage.innerHTML = `
        <div class="media media--square" style="background-color: ${swatch.hex};" aria-hidden="true"></div>
        </div>
      `;
        }

        const swatchInput = document.createElement('input');
        swatchInput.classList.add('swatch__input', 'visually-hidden');
        swatchInput.type = 'radio';
        swatchInput.name = `style-${this.hit.objectID}-${option}`;
        swatchInput.value = swatch.name;
        swatchInput.dataset.optionIndex = optionIndex;
        swatchInput.id = `StyleSwatch-${this.hit.objectID}-${option}-${swatchIndex}`;
        if (selected) {
            swatchInput.checked = true;
        }

        const swatchLabel = document.createElement('label');
        swatchLabel.classList.add('swatch__label');
        swatchLabel.setAttribute('for', `StyleSwatch-${this.hit.objectID}-${option}-${swatchIndex}`);
        swatchLabel.setAttribute('title', swatch.name);
        swatchLabel.innerHTML = `<span class="visually-hidden">${swatch.name}</span>`;

        swatchItem.appendChild(swatchImage);
        swatchItem.appendChild(swatchInput);
        swatchItem.appendChild(swatchLabel);

        return swatchItem;
    }
}

customElements.define('card-swatches', CardSwatches);

document.addEventListener('DOMContentLoaded', function() {
    // iPad / iPadOS detection
    var ua = navigator.userAgent || navigator.vendor || window.opera;
    var isIpad = /iPad/i.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

    if (!isIpad) {
        // Do nothing on non-iPad devices – desktop, phones, touch laptops, etc.
        return;
    }

    var megaMenus = document.querySelectorAll('.header__inline-menu details.mega-menu');

    megaMenus.forEach(function(detailsEl) {
        var summaryEl = detailsEl.querySelector('summary.mega-menu__menu-item');
        if (!summaryEl) return;

        var parentLink = summaryEl.querySelector('a.parent-mega-menu__link');
        if (!parentLink) return;

        // Sync aria-expanded
        detailsEl.addEventListener('toggle', function() {
            summaryEl.setAttribute('aria-expanded', detailsEl.open ? 'true' : 'false');
            if (!detailsEl.open) {
                parentLink.dataset.megaArmed = 'false';
            }
        });

        parentLink.addEventListener('click', function(event) {
            // Only intercept clicks on "desktop" header size
            if (window.innerWidth < 990) {
                // Below 990px you probably use the mobile nav; let it behave normally
                return;
            }

            var isOpen = detailsEl.open;
            var isArmed = parentLink.dataset.megaArmed === 'true';

            // FIRST TAP: open mega menu, don't navigate
            if (!isOpen || !isArmed) {
                event.preventDefault();
                event.stopPropagation();

                // Close other open mega menus
                megaMenus.forEach(function(otherDetails) {
                    if (otherDetails !== detailsEl && otherDetails.open) {
                        otherDetails.open = false;
                        var otherSummary = otherDetails.querySelector('summary.mega-menu__menu-item');
                        if (otherSummary) {
                            otherSummary.setAttribute('aria-expanded', 'false');
                        }
                        var otherLink = otherDetails.querySelector('summary.mega-menu__menu-item a.parent-mega-menu__link');
                        if (otherLink) {
                            otherLink.dataset.megaArmed = 'false';
                        }
                    }
                });

                detailsEl.open = true;
                summaryEl.setAttribute('aria-expanded', 'true');
                parentLink.dataset.megaArmed = 'true';
                return;
            }

            // SECOND TAP: navigate explicitly
            event.preventDefault();
            event.stopPropagation();
            parentLink.dataset.megaArmed = 'false';
            window.location.href = parentLink.href;
        });
    });
});
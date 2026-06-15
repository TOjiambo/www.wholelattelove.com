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
        if (this.openedBy) this.openedBy.setAttribute('aria-expanded', 'true');
        this.bodyWasOverflowHidden = document.body.classList.contains('overflow-hidden');
        if (!this.bodyWasOverflowHidden) {
            this.scrollPosition = window.scrollY || window.pageYOffset || document.documentElement.scrollTop || 0;
            document.body.style.top = `-${this.scrollPosition}px`;
        }
        document.body.classList.add('overflow-hidden');
        this.setAttribute('open', '');
        if (popup) popup.loadContent();
        trapFocus(this, this.querySelector('[role="dialog"]'));
        window.pauseAllMedia();
    }

    hide() {
        document.body.classList.remove('overflow-hidden');
        if (!this.bodyWasOverflowHidden) {
            document.body.style.top = '';
            window.scrollTo(0, this.scrollPosition || 0);
        }
        if (this.openedBy) this.openedBy.setAttribute('aria-expanded', 'false');
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

function isVisible(el) {
    // Works with display:none (your .hide-media) and most other hidden cases
    return !el.classList.contains('hide-media') && !el.hidden && el.getClientRects().length > 0;
}

function stripExistingPrefix(text) {
    // If Liquid already wrote "Image X of Y - ..." strip it so we can rebuild correctly
    return (text || '').replace(/^Image\s+\d+\s+of\s+\d+\s*-?\s*/i, '').trim();
}

function stripGroupingSuffix(text) {
    // Turn "Front view || Stainless Steel" into "Front view"
    return (text || '').split('||')[0].trim();
}

function buildNumberedAlt(index, total, originalAlt, productTitle) {
    const cleaned = stripExistingPrefix(originalAlt);

    // If alt contains grouping (|| ...)
    const parts = cleaned.split('||');
    if (parts.length >= 2) {
        const left = parts[0].trim(); // text before ||
        const right = parts[parts.length - 1].trim(); // grouping value after ||

        // If nothing before ||, use product title
        const base = left || (productTitle || '').trim();

        const combined = [base, right].filter(Boolean).join(' || ');
        const prefix = `Image ${index} of ${total}`;
        return combined ? `${prefix} - ${combined}` : prefix;
    }

    // No grouping: if alt is blank, fall back to product title
    const finalText = cleaned.trim() || (productTitle || '').trim();
    const prefix = `Image ${index} of ${total}`;
    return finalText ? `${prefix} - ${finalText}` : prefix;
}

function updateVisibleMediaAltsAndCounter(mediaGallery) {
    const productTitle = mediaGallery.dataset.productTitle || '';
    // MAIN SLIDES (viewer)
    const viewerList = mediaGallery.querySelector('.product__media-list');
    const slides = viewerList ? Array.from(viewerList.children).filter(isVisible) : [];
    const totalSlides = slides.length;

    // Update the UI counter (1 / total)
    const totalEl = mediaGallery.querySelector('.slider-counter--total');
    if (totalEl) totalEl.textContent = totalSlides;

    const currentEl = mediaGallery.querySelector('.slider-counter--current');
    if (currentEl) {
        const activeIdx = slides.findIndex((li) => li.classList.contains('is-active'));
        currentEl.textContent = activeIdx >= 0 ? activeIdx + 1 : 1;
    }

    // Update slide <img alt="">
    // slides.forEach((li, i) => {
    //   const img = li.querySelector('img');
    //   if (!img) return;

    //   const original = img.dataset.originalAlt || img.getAttribute('alt') || '';
    //   img.setAttribute('alt', buildNumberedAlt(i + 1, totalSlides, original, productTitle));
    // });

    // THUMBNAILS
    const thumbList = mediaGallery.querySelector('.thumbnail-list');
    const thumbLis = thumbList ? Array.from(thumbList.children).filter(isVisible) : [];
    const totalThumbs = thumbLis.length;

    thumbLis.forEach((li, i) => {
        const img = li.querySelector('img');
        if (!img) return;

        const original = img.dataset.originalAlt || img.getAttribute('alt') || '';
        img.setAttribute('alt', buildNumberedAlt(i + 1, totalThumbs, original, productTitle));
    });
}

(function initMediaGalleryNumbering() {
    const run = () => {
        document.querySelectorAll('media-gallery[id^="MediaGallery-"]').forEach((mediaGallery) => {
            mediaGallery.querySelectorAll('slider-component').forEach((slider) => {
                if (typeof slider.resetPages === 'function') slider.resetPages();
            });

            updateVisibleMediaAltsAndCounter(mediaGallery);
        });
    };

    const runSoon = () => {
        requestAnimationFrame(run);
        setTimeout(run, 150); // catches late layout/slider init
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', runSoon, {
            once: true
        });
    } else {
        runSoon();
    }
})();

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

        this.cleanupVariantWhitespace();
        this.initValueIndexes();
        this.initGlobalOosToggle();

        // Initial load: chunked to reduce TBT
        setTimeout(() => {
            this.initVariantStatusesChunked(() => {
                this.setAttribute('data-ready', 'true');
            });
        }, 0);
    }

    getAvailabilityIndex() {
        if (this._availabilityIndex) return this._availabilityIndex;

        const variants = this.getVariantData();

        // index 0 => option1 keyed by ''
        // index 1 => option2 keyed by option1
        // index 2 => option3 keyed by 'option1||option2'
        const existing = [new Map(), new Map(), new Map()];
        const purch = [new Map(), new Map(), new Map()];

        const add = (mapArr, idx, key, val) => {
            if (!val) return;
            let set = mapArr[idx].get(key);
            if (!set) {
                set = new Set();
                mapArr[idx].set(key, set);
            }
            set.add(val);
        };

        for (const v of variants) {
            const o1 = v.option1;
            const o2 = v.option2;
            const o3 = v.option3;

            add(existing, 0, '', o1);
            if (v.available) add(purch, 0, '', o1);

            if (o1) {
                add(existing, 1, o1, o2);
                if (v.available) add(purch, 1, o1, o2);
            }

            if (o1 && o2) {
                const key = `${o1}||${o2}`;
                add(existing, 2, key, o3);
                if (v.available) add(purch, 2, key, o3);
            }
        }

        this._availabilityIndex = {
            existing,
            purch
        };
        return this._availabilityIndex;
    }

    updateSelectionMetadata({
        target
    }) {
        const {
            value,
            tagName
        } = target;

        if (tagName === 'SELECT' && target.selectedOptions.length) {
            const prev = Array.from(target.options).find((o) => o.hasAttribute('selected'));
            if (prev) prev.removeAttribute('selected');
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
            if (selectedSwatchValue) selectedSwatchValue.textContent = value;
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

        // If there's no exact variant match, snap to a valid combo
        if (!this.currentVariant) {
            const changed = this.autoFixNonexistentSelection();
            if (changed) {
                this.updateMasterId();
            }
        }

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

            updateVisibleMediaAltsAndCounter(mediaGallery);
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
        const variants = this.getVariantData();
        const wrappers = this._wrappers || (this._wrappers = [...this.querySelectorAll('.product-form__input')]);
        const selected = this.selectedOptionValues;

        const matchesPrior = (v, index) => {
            for (let i = 0; i < index; i++) {
                if (selected[i] !== v[`option${i + 1}`]) return false;
            }
            return true;
        };

        wrappers.forEach((wrapper, index) => {
            const optionInputs = this._optionInputs ? .[index] || (this._optionInputs ? ? = wrappers.map((w) => [...w.querySelectorAll('input[type="radio"], option')]))[index];
            if (!optionInputs.length) return;

            const existingSet = new Set();
            const purchSet = new Set();

            for (const v of variants) {
                if (!matchesPrior(v, index)) continue;
                const val = v[`option${index + 1}`];
                if (!val) continue;

                existingSet.add(val);
                if (v.available) purchSet.add(val);
            }

            const existingValues = [...existingSet];
            const purchasableValues = [...purchSet];

            this.setInputAvailability(optionInputs, existingValues, purchasableValues);
            this.reorderOptionElements(optionInputs, existingValues, purchasableValues);
        });

        this.updateGlobalOosToggleVisibility();
    }

    initVariantStatusesChunked(done) {
        const variants = this.getVariantData();
        const wrappers = this._wrappers || (this._wrappers = [...this.querySelectorAll('.product-form__input')]);

        // Cache input lists once
        this._optionInputs = this._optionInputs || wrappers.map((w) => [...w.querySelectorAll('input[type="radio"], option')]);

        let i = 0;

        const step = () => {
            const selected = this.selectedOptionValues;
            const start = performance.now();

            // Do a little work, then yield (prevents long tasks)
            while (i < wrappers.length && performance.now() - start < 12) {
                const optionInputs = this._optionInputs[i];
                if (optionInputs && optionInputs.length) {
                    const existingSet = new Set();
                    const purchSet = new Set();

                    for (const v of variants) {
                        // match prior selections (0..i-1)
                        let ok = true;
                        for (let p = 0; p < i; p++) {
                            if (selected[p] !== v[`option${p + 1}`]) {
                                ok = false;
                                break;
                            }
                        }
                        if (!ok) continue;

                        const val = v[`option${i + 1}`];
                        if (!val) continue;

                        existingSet.add(val);
                        if (v.available) purchSet.add(val);
                    }

                    const existingValues = [...existingSet];
                    const purchasableValues = [...purchSet];

                    this.setInputAvailability(optionInputs, existingValues, purchasableValues);
                    this.reorderOptionElements(optionInputs, existingValues, purchasableValues);
                }

                i++;
            }

            if (i < wrappers.length) {
                setTimeout(step, 0);
            } else {
                this.updateGlobalOosToggleVisibility();
                done ? .();
            }
        };

        step();
    }

    setInputAvailability(elementList, existingValues, purchasableValues) {
        elementList.forEach((el) => {
            const value = el.getAttribute('value');
            const exists = existingValues.includes(value);
            const purchasable = purchasableValues.includes(value);

            if (el.tagName === 'INPUT') {
                // mark combo state
                el.classList.toggle('is-unavailable', !exists); // nonexistent combo
                el.classList.toggle('is-soldout', exists && !purchasable); // exists but not purchasable

                // Nonexistent combos: truly disable (not a real choice for this selection path)
                if (!exists) {
                    el.setAttribute('disabled', 'disabled');
                    el.classList.add('disabled', 'visually-disabled');
                } else {
                    el.removeAttribute('disabled');

                    // Sold out: keep enabled (so selection logic still works), but style as disabled
                    if (!purchasable) el.classList.add('disabled', 'visually-disabled');
                    else el.classList.remove('disabled', 'visually-disabled');
                }
            }

            if (el.tagName === 'OPTION') {
                // Hide nonexistent combos in dropdowns (but don’t hide if currently selected)
                if (!exists && !el.selected) {
                    el.hidden = true;
                    el.disabled = true;
                } else {
                    el.hidden = false;
                    el.disabled = false;
                }

                // Keep your sold-out text behavior if you want, otherwise just show the value
                el.textContent = value;
            }
        });
    }

    reorderOptionElements(elementList, existingValues, purchasableValues) {
        if (!elementList ? .length) return;
        const first = elementList[0];
        if (first.tagName !== 'INPUT') return;

        // container must be display:flex already (yours is)
        const inputs = elementList.filter((el) => el.tagName === 'INPUT');

        const baseIndex = (input) => {
            const n = parseInt(input.dataset.valueIndex || input.getAttribute('data-value-index') || '0', 10);
            return Number.isFinite(n) ? n : 0;
        };

        const bucket = (input) => {
            const value = input.value;
            const exists = existingValues.includes(value);
            const purch = purchasableValues.includes(value);
            if (!exists) return 2; // nonexistent
            if (!purch) return 1; // sold out
            return 0; // purchasable
        };

        inputs.forEach((input) => {
            const label = input.nextElementSibling;
            if (!label) return;

            // Stable ordering: bucket first, then original index
            const ord = bucket(input) * 1000 + baseIndex(input);
            label.style.order = ord;
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

                const currentVariantInventoryEl = document.querySelector('.product__inventory-quantity');
                const futureVariantInventoryEl = html.querySelector('.product__inventory-quantity');
                if (currentVariantInventoryEl && futureVariantInventoryEl) currentVariantInventoryEl.replaceWith(futureVariantInventoryEl);

                const currentSpecsSkuPropertyValue = document.querySelector('.product-specs__container .product-specs__table .product-spec__value > span[itemprop="sku"]');
                if (this.currentVariant && this.currentVariant.sku && currentSpecsSkuPropertyValue) currentSpecsSkuPropertyValue.textContent = this.currentVariant.sku;

                const sourceSectionId = this.dataset.originalSection ? this.dataset.originalSection : this.dataset.section;

                // Replace the entire badge mount inside media-gallery
                const currentBadgesMount = document.getElementById(`MediaBadges-${this.dataset.section}`);
                const futureBadgesMount = html.getElementById(`MediaBadges-${sourceSectionId}`);

                if (currentBadgesMount && futureBadgesMount) {
                    currentBadgesMount.replaceWith(futureBadgesMount);
                }
            });
    }

    toggleAddButton(disable = true, text, modifyClass = true) {
        const productForm = document.getElementById(`product-form-${this.dataset.section}`);
        if (!productForm) return;

        const addButton = productForm.querySelector('[name="add"]') || productForm.querySelector('[name="bundle"]');
        const addButtonText = productForm.querySelector('[name="add"] > span') || productForm.querySelector('[name="bundle"] > span');
        if (!addButton || !addButtonText) return;

        const isPreorderProduct = productForm.dataset.isPreorderProduct === 'true';

        // Only show preorder label when button is enabled AND variant is available
        const shouldShowPreorder = !disable && this.currentVariant ? .available && (this.currentVariant ? .preorder_enabled || isPreorderProduct);

        if (disable) {
            addButton.setAttribute('disabled', 'disabled');
            addButton.setAttribute('aria-disabled', 'true');
            if (text) addButtonText.textContent = text;
        } else {
            addButton.removeAttribute('disabled');
            addButton.removeAttribute('aria-disabled');

            if (addButton.name === 'bundle') {
                addButtonText.innerHTML = shouldShowPreorder ? window.variantStrings.preOrderBundle : window.variantStrings.addToCartBundle;
            } else {
                addButtonText.innerHTML = shouldShowPreorder ? window.variantStrings.preOrder : window.variantStrings.addToCart;
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

    cleanupVariantWhitespace() {
        this.querySelectorAll('.container_variant-options').forEach((container) => {
            [...container.childNodes].forEach((node) => {
                if (node.nodeType === Node.TEXT_NODE && !node.textContent.trim()) node.remove();
            });
        });
    }

    initValueIndexes() {
        this.querySelectorAll('.product-form__input').forEach((wrapper) => {
            const container = wrapper.querySelector('.container_variant-options');

            if (container) {
                [...container.querySelectorAll('input[type="radio"]')].forEach((input, i) => {
                    input.dataset.valueIndex = String(i);
                });
                return;
            }

            const select = wrapper.querySelector('select');
            if (select) {
                [...select.options].forEach((opt, i) => {
                    opt.dataset.valueIndex = String(i);
                });
            }
        });
    }

    initGlobalOosToggle() {
        this.setAttribute('data-hide-oos', 'true');
        if (!this.hasAttribute('data-show-oos')) this.setAttribute('data-show-oos', 'false');

        if (this.querySelector('.variant-oos-toggle-global')) return;

        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'variant-oos-toggle-global';

        // What this button affects
        if (this.id) btn.setAttribute('aria-controls', this.id);

        // --- Icon (aria-hidden so it doesn't get read) ---
        const iconWrap = document.createElement('span');
        iconWrap.className = 'variant-oos-toggle-global__icon';
        iconWrap.setAttribute('aria-hidden', 'true');
        iconWrap.innerHTML = `
      <svg width="13" height="13" viewBox="0 0 13 13" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="0.5" y="0.5" width="5" height="5" rx="0.5" stroke="currentColor"/>
        <rect x="0.5" y="7.5" width="5" height="5" rx="0.5" stroke="currentColor"/>
        <rect x="7.5" y="0.5" width="5" height="5" rx="0.5" stroke="currentColor"/>
        <rect x="7.5" y="7.5" width="5" height="5" rx="0.5" stroke="currentColor"/>
      </svg>
    `;

        // --- Text node for the label ---
        const text = document.createElement('span');
        text.className = 'variant-oos-toggle-global__text';

        btn.append(iconWrap, text);

        const syncBtn = () => {
            const showing = this.getAttribute('data-show-oos') === 'true';

            btn.setAttribute('aria-pressed', showing ? 'true' : 'false');
            btn.setAttribute('aria-expanded', showing ? 'true' : 'false');

            // Visible label (also serves as accessible name)
            text.textContent = showing ? 'Hide out of stock' : 'Show out of stock';
        };

        btn.addEventListener('click', () => {
            const showing = this.getAttribute('data-show-oos') === 'true';
            const next = showing ? 'false' : 'true';
            this.setAttribute('data-show-oos', next);

            // Update interactivity *immediately* so hidden radios aren’t tabbable
            this.syncSoldOutHiddenState();

            // Update label + announce
            syncBtn();

            this.announceOos(next === 'true' ? 'Showing out-of-stock options.' : 'Hiding out-of-stock options.');

            this.ensureFocusIsNotOnHiddenOos(btn);
        });

        // Insert above first option group (inside the content wrapper if present)
        const content = this.querySelector('.variant-picker__content') || this;
        const firstGroup = content.querySelector('fieldset.product-form__input, .product-form__input--dropdown');

        if (firstGroup && firstGroup.parentNode) {
            firstGroup.parentNode.insertBefore(btn, firstGroup);
        } else {
            content.prepend(btn);
        }

        // Initial sync
        syncBtn();
        this.syncSoldOutHiddenState();
    }

    updateGlobalOosToggleVisibility() {
        const btn = this.querySelector('.variant-oos-toggle-global');
        if (!btn) return;

        const count = this.getSoldOutEligibleInputs().length;
        btn.style.display = count > 0 ? '' : 'none';

        const showing = this.getAttribute('data-show-oos') === 'true';
        btn.setAttribute('aria-pressed', showing ? 'true' : 'false');
        btn.setAttribute('aria-expanded', showing ? 'true' : 'false');

        // IMPORTANT: update the text span if present (do NOT replace button contents)
        const textEl = btn.querySelector('.variant-oos-toggle-global__text');
        if (textEl) {
            textEl.textContent = showing ? 'Hide out of stock' : 'Show out of stock';
        } else {
            // fallback if button got rebuilt without children
            btn.textContent = showing ? 'Hide out of stock' : 'Show out of stock';
        }

        this.syncSoldOutHiddenState ? .();
    }

    isExactVariantMatch(selected) {
        const variants = this.getVariantData();
        return variants.some((v) => v.options.every((opt, i) => opt === selected[i]));
    }

    setOptionSelectionByIndex(index, nextValue) {
        const wrappers = [...this.querySelectorAll('.product-form__input')];
        const wrapper = wrappers[index];
        if (!wrapper) return false;

        const select = wrapper.querySelector('select');
        if (select) {
            if (select.value === nextValue) return false;
            select.value = nextValue;

            // keep Dawn's selected attribute behavior consistent
            Array.from(select.options).forEach((o) => o.removeAttribute('selected'));
            const opt = Array.from(select.options).find((o) => o.value === nextValue);
            if (opt) opt.setAttribute('selected', 'selected');

            // update the legend text / dropdown swatch UI
            this.updateSelectionMetadata({
                target: select
            });
            return true;
        }

        const input = wrapper.querySelector(`input[type="radio"][value="${CSS.escape(nextValue)}"]`);
        if (input) {
            if (input.checked) return false;
            input.checked = true;
            this.updateSelectionMetadata({
                target: input
            });
            return true;
        }

        return false;
    }

    autoFixNonexistentSelection() {
        // prevent loops
        if (this._autoFixing) return false;
        this._autoFixing = true;

        const variants = this.getVariantData();
        const wrappers = [...this.querySelectorAll('.product-form__input')];

        let changed = false;

        // If the selection already matches a real variant, do nothing
        let selected = this.selectedOptionValues;
        if (this.isExactVariantMatch(selected)) {
            this._autoFixing = false;
            return false;
        }

        // Keep option1 (e.g. Color) and fix downstream options to a real variant
        for (let index = 1; index < wrappers.length; index++) {
            selected = this.selectedOptionValues;

            const prior = selected.slice(0, index);

            const matchesPrior = (v) => prior.every((val, i) => v.options[i] === val);

            // Values that exist (real variants) for this option given prior selections
            const existingValues = [...new Set(variants.filter(matchesPrior).map((v) => v.options[index]))];

            if (!existingValues.length) continue;

            // Prefer purchasable values first (available includes backorder)
            const purchasableValues = [...new Set(variants.filter((v) => v.available && matchesPrior(v)).map((v) => v.options[index]))];

            const currentValue = selected[index];

            // If current is not a real option in this path, snap to a valid one
            if (!existingValues.includes(currentValue)) {
                const nextValue = purchasableValues[0] || existingValues[0];
                changed = this.setOptionSelectionByIndex(index, nextValue) || changed;
            }
        }

        this._autoFixing = false;
        return changed;
    }

    ensureOosLiveRegion() {
        if (this._oosLive) return;

        // Reuse if already present
        let region = this.querySelector('[data-oos-live]');
        if (!region) {
            region = document.createElement('p');
            region.className = 'visually-hidden'; // Dawn usually has this utility class
            region.dataset.oosLive = 'true';
            region.setAttribute('role', 'status');
            region.setAttribute('aria-live', 'polite');
            this.prepend(region);
        }
        this._oosLive = region;
    }

    announceOos(message) {
        this.ensureOosLiveRegion();
        // Clear first so repeated messages announce reliably
        this._oosLive.textContent = '';
        window.requestAnimationFrame(() => {
            this._oosLive.textContent = message;
        });
    }

    getSoldOutEligibleInputs() {
        // "sold out" = exists but not purchasable
        // exclude nonexistent combos + exclude checked (we never hide checked)
        return [...this.querySelectorAll('input.is-soldout:not(.is-unavailable):not(:checked)')];
    }

    /**
     * When OOS are hidden, disable those radios so they are NOT tabbable.
     * When OOS are shown, restore enabled state (unless something else disabled them).
     */
    syncSoldOutHiddenState() {
        const show = this.getAttribute('data-show-oos') === 'true';
        const eligible = this.getSoldOutEligibleInputs();

        eligible.forEach((input) => {
            const label = input.nextElementSibling;

            if (!show) {
                // Disable only if we were the ones that disabled it
                if (!input.disabled) {
                    input.disabled = true;
                    input.dataset.oosDisabled = 'true';
                }

                // If label is focusable (your swatches have tabindex="0"), remove it from tab order too
                if (label) {
                    const orig = label.getAttribute('tabindex');
                    if (orig !== null) {
                        label.dataset.oosOrigTabindex = orig;
                        label.setAttribute('tabindex', '-1');
                    }
                }
            } else {
                // Restore only if we disabled it
                if (input.dataset.oosDisabled === 'true') {
                    input.disabled = false;
                    delete input.dataset.oosDisabled;
                }

                if (label && 'oosOrigTabindex' in (label.dataset || {})) {
                    label.setAttribute('tabindex', label.dataset.oosOrigTabindex);
                    delete label.dataset.oosOrigTabindex;
                }
            }
        });
    }

    /** If focus is currently on something we just hid, move it back to the toggle. */
    ensureFocusIsNotOnHiddenOos(toggleBtn) {
        const active = document.activeElement;
        if (!active) return;

        // If the focused element is an OOS label or input that will be hidden, focus toggle
        const isHiddenOos =
            active.matches ? .('input.is-soldout:not(.is-unavailable):not(:checked)') ||
            active.closest ? .('label') ? .previousElementSibling ? .matches ? .('input.is-soldout:not(.is-unavailable):not(:checked)');

        const showing = this.getAttribute('data-show-oos') === 'true';
        if (!showing && isHiddenOos) toggleBtn.focus();
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
        this.inputDelay = 1500;
        this.fromInputTimer = null;
        this.toInputTimer = null;
    }

    connectedCallback() {
        this.load();
    }

    load() {
        this.fromSlider = this.querySelector('.range-slider__input--from');
        this.toSlider = this.querySelector('.range-slider__input--to');

        this.fromInput = this.querySelector('.range-slider__control-input--from');
        this.toInput = this.querySelector('.range-slider__control-input--to');

        if (!this.fromSlider || !this.toSlider || !this.fromInput || !this.toInput) return;

        this.fillSlider();
        this.setToggleAccessible();

        this.fromSlider.addEventListener('input', () => this.updateFromSliderUI());
        this.toSlider.addEventListener('input', () => this.updateToSliderUI());

        this.fromSlider.addEventListener('change', () => this.commitFromSlider());
        this.toSlider.addEventListener('change', () => this.commitToSlider());

        this.fromInput.addEventListener('input', () => this.debounceFromInput());
        this.toInput.addEventListener('input', () => this.debounceToInput());

        this.fromInput.addEventListener('blur', () => this.controlFromInput());
        this.toInput.addEventListener('blur', () => this.controlToInput());

        this.fromInput.addEventListener('keydown', (event) => {
            if (event.key === 'Enter') {
                clearTimeout(this.fromInputTimer);
                this.controlFromInput();
            }
        });

        this.toInput.addEventListener('keydown', (event) => {
            if (event.key === 'Enter') {
                clearTimeout(this.toInputTimer);
                this.controlToInput();
            }
        });
    }

    debounceFromInput() {
        clearTimeout(this.fromInputTimer);

        if (this.fromInput.value.trim() === '') return;

        this.fromInputTimer = setTimeout(() => {
            this.controlFromInput();
        }, this.inputDelay);
    }

    debounceToInput() {
        clearTimeout(this.toInputTimer);

        if (this.toInput.value.trim() === '') return;

        this.toInputTimer = setTimeout(() => {
            this.controlToInput();
        }, this.inputDelay);
    }

    fillSlider(sliderColor = '#969696', rangeColor = '#969696') {
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

    updateFromSliderUI() {
        let fromValue = parseInt(this.fromSlider.value, 10);
        const toValue = parseInt(this.toSlider.value, 10);

        if (fromValue > toValue) {
            fromValue = toValue;
            this.fromSlider.value = fromValue;
        }

        this.fromInput.value = fromValue;
        this.fillSlider();
    }

    updateToSliderUI() {
        const fromValue = parseInt(this.fromSlider.value, 10);
        let toValue = parseInt(this.toSlider.value, 10);

        if (toValue < fromValue) {
            toValue = fromValue;
            this.toSlider.value = toValue;
        }

        this.toInput.value = toValue;
        this.fillSlider();
        this.setToggleAccessible();
    }

    commitFromSlider() {
        this.updateFromSliderUI();
        this.emitPriceChange();
    }

    commitToSlider() {
        this.updateToSliderUI();
        this.emitPriceChange();
    }

    controlFromInput() {
        const rawFrom = this.fromInput.value.trim();

        // Blank = restore previous committed value, no search
        if (rawFrom === '') {
            this.fromInput.value = this.fromSlider.value;
            return;
        }

        let fromValue = parseInt(rawFrom, 10);
        if (Number.isNaN(fromValue)) {
            this.fromInput.value = this.fromSlider.value;
            return;
        }

        const absoluteMin = parseInt(this.fromSlider.min, 10);
        const absoluteMax = parseInt(this.fromSlider.max, 10);
        const currentMax = parseInt(this.toSlider.value, 10);
        const previousFrom = parseInt(this.fromSlider.value, 10);

        fromValue = Math.max(absoluteMin, Math.min(fromValue, absoluteMax));

        if (fromValue > currentMax) {
            fromValue = currentMax;
        }

        this.fromInput.value = fromValue;
        this.fromSlider.value = fromValue;

        this.fillSlider();

        if (fromValue !== previousFrom) {
            this.emitPriceChange();
        }
    }

    controlToInput() {
        const rawTo = this.toInput.value.trim();

        // Blank = restore previous committed value, no search
        if (rawTo === '') {
            this.toInput.value = this.toSlider.value;
            return;
        }

        let toValue = parseInt(rawTo, 10);
        if (Number.isNaN(toValue)) {
            this.toInput.value = this.toSlider.value;
            return;
        }

        const absoluteMin = parseInt(this.toSlider.min, 10);
        const absoluteMax = parseInt(this.toSlider.max, 10);
        const currentMin = parseInt(this.fromSlider.value, 10);
        const previousTo = parseInt(this.toSlider.value, 10);

        toValue = Math.max(absoluteMin, Math.min(toValue, absoluteMax));

        if (toValue < currentMin) {
            toValue = currentMin;
        }

        this.toInput.value = toValue;
        this.toSlider.value = toValue;

        this.fillSlider();
        this.setToggleAccessible();

        if (toValue !== previousTo) {
            this.emitPriceChange();
        }
    }

    emitPriceChange() {
        if (this.fromInput.value.trim() === '' || this.toInput.value.trim() === '') {
            return;
        }

        this.dispatchEvent(
            new CustomEvent('price:change', {
                bubbles: true,
                detail: {
                    min: Number(this.fromSlider.value),
                    max: Number(this.toSlider.value),
                },
            })
        );
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

// ================================
// SHARED ALGOLIA STOCK HELPERS
// (used by Listing, Search, Swatches)
// ================================
function normalizeStockBoolean(value) {
    if (typeof value === 'boolean') return value;

    if (typeof value === 'string') {
        const v = value.trim().toLowerCase();
        if (v === 'true') return true;
        if (v === 'false') return false;
        if (v === '1') return true;
        if (v === '0') return false;
    }

    if (typeof value === 'number') {
        // 0 = out of stock, >0 = in stock
        return value > 0;
    }

    // Fallback
    return Boolean(value);
}

/**
 * For a *hit* (one Algolia record representing a single variant)
 */
function resolveHitInStock(hit) {
    if (!hit) return true; // default

    if (typeof hit.inventory_available !== 'undefined') {
        return normalizeStockBoolean(hit.inventory_available);
    }

    if (typeof hit.inventory_quantity !== 'undefined') {
        return normalizeStockBoolean(hit.inventory_quantity);
    }

    return true;
}

/**
 * For a *variant object* from meta.algolia.all_variants.variants
 * (we can optionally fall back to the hit if needed)
 */
function resolveVariantInStock(variant, hit) {
    if (variant) {
        if (typeof variant.availableForSale !== 'undefined') {
            return normalizeStockBoolean(variant.availableForSale);
        }
        if (typeof variant.available_for_sale !== 'undefined') {
            return normalizeStockBoolean(variant.available_for_sale);
        }
        if (typeof variant.available !== 'undefined') {
            return normalizeStockBoolean(variant.available);
        }
        if (typeof variant.inventory_quantity !== 'undefined') {
            return normalizeStockBoolean(variant.inventory_quantity);
        }
        if (typeof variant.inventoryQuantity !== 'undefined') {
            return normalizeStockBoolean(variant.inventoryQuantity);
        }
    }

    // If variant object doesn't have anything useful, fall back to the hit
    return resolveHitInStock(hit);
}

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

                    const remainingCount = uniqueSecondaryOptions.length - this.maxSwatches;

                    // Normalize label text (optional polish if optionName can be "colour")
                    const optionLabel = optionName === 'colour' ? 'color' : optionName;
                    const srText = `View ${remainingCount} more ${optionLabel} option${remainingCount === 1 ? '' : 's'}`;

                    moreSwatchesLink.title = srText;

                    // Accessible name via real text (visually hidden); "+" is visual only
                    moreSwatchesLink.innerHTML = `
            <span aria-hidden="true">+</span>
            <span class="visually-hidden">${srText}</span>
          `;

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

    setLocation(location) {
        this.location = location;
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

        if (!this.card) return;

        const card = this.card;
        const cardMedia = card.querySelector('.card__media');

        // Use shared helper
        const isVariantInStock = resolveVariantInStock(variant, this.hit);

        const existingCardTags = card.querySelectorAll('.card__tag--promo, .palette--sold-out');

        // Read promo tag consistently from either the raw metafield object or the normalized shape.
        const promoTagContent = variant.promo_tag ? .value ? ? variant.promo_tag;
        const promoText = (promoTagContent ? .text || '').toString().trim();
        const promo = promoText ?
            {
                text: promoText,
                background_color: promoTagContent.background_color || '',
                text_color: promoTagContent.text_color || '',
                icon_url: promoTagContent.icon_url || promoTagContent.icon ? .url || '',
            } :
            null;

        const insertTagBeforeMedia = (tagEl) => {
            if (cardMedia) {
                card.insertBefore(tagEl, cardMedia);
            } else {
                card.appendChild(tagEl);
            }
        };

        // -----------------------------
        // 1. SOLD OUT / PROMO TAGS
        // -----------------------------
        existingCardTags.forEach((tag) => tag.remove());

        if (!isVariantInStock) {
            // OUT OF STOCK
            const soldOutTag = document.createElement('div');
            soldOutTag.classList.add('card__tag', 'palette--sold-out');
            soldOutTag.textContent = 'Sold out';
            insertTagBeforeMedia(soldOutTag);

        } else {
            // IN STOCK
            if (promo) {
                const promoTag = document.createElement('div');
                promoTag.classList.add('card__tag', 'card__tag--promo');
                promoTag.setAttribute('aria-hidden', 'true');

                // data attr (will appear as data-promo-text)
                promoTag.dataset.promoText = promo.text;

                // styles
                if (promo.background_color) promoTag.style.backgroundColor = promo.background_color;
                if (promo.text_color) promoTag.style.color = promo.text_color;

                // icon + text
                if (promo.icon_url) {
                    const img = document.createElement('img');
                    img.src = promo.icon_url;
                    img.alt = '';
                    img.setAttribute('aria-hidden', 'true');
                    img.loading = 'lazy';
                    img.classList.add('promo-badge__icon');
                    promoTag.appendChild(img);

                    const span = document.createElement('span');
                    span.classList.add('promo-badge__text');
                    span.textContent = promo.text;
                    promoTag.appendChild(span);
                } else {
                    promoTag.textContent = promo.text;
                }
                insertTagBeforeMedia(promoTag);
            }
        }

        // -----------------------------
        // 2. PRICE UI + MICRODATA
        // -----------------------------
        const priceWrapper = card.querySelector('.card__price');
        if (priceWrapper && variant) {
            const currency = (window.Shopify && window.Shopify.currency && window.Shopify.currency.active) || (window.theme && window.theme.currencyCode) || 'USD';

            const priceValue = parseFloat(variant.price);
            const compareAtValue = parseFloat(variant.compareAtPrice);
            const hasCompareAt = !isNaN(compareAtValue) && compareAtValue > priceValue;
            const priceContent = !isNaN(priceValue) && isFinite(priceValue) ? priceValue.toFixed(2) : '';

            const priceClasses = `
        card__price
        ${!isVariantInStock ? 'price--sold-out' : ''}
        ${Array.isArray(this.hit?.collections) && this.hit.collections.indexOf('pre-order-hidden') > -1 ? 'price--pre-order' : ''}
        ${Array.isArray(this.hit?.collections) && this.hit.collections.indexOf('new-hidden') > -1 ? 'price--new' : ''}
        ${hasCompareAt ? 'price--on-sale' : 'price--no-compare'}
      `;

            const visualPriceHtml = `
        <div class="price__container">
          <div class="price__regular">
            <span class="visually-hidden visually-hidden--inline">${window.theme.strings.regularPrice}</span>
            <span class="price-item price-item--regular">
              ${algoliaShopify.formatMoney(priceValue * 100)}
            </span>
          </div>

          ${
            hasCompareAt
              ? `
            <div class="price__sale">
              <div class="price__container">
                <span class="visually-hidden visually-hidden--inline">${window.theme.strings.salePrice}</span>
                <span class="price-item price-item--sale price-item--last">
                  ${algoliaShopify.formatMoney(priceValue * 100)}
                </span>
                <span class="visually-hidden visually-hidden--inline">${window.theme.strings.regularPrice}</span>
                <span>
                  <s class="price-item price-item--regular">
                    ${algoliaShopify.formatMoney(compareAtValue * 100)}
                  </s>
                </span>
              </div>
            </div>
          `
              : ''
          }
        </div>
      `;

            const gtinData = this.listing && typeof this.listing.getGtinKeyValue === 'function' ? this.listing.getGtinKeyValue(variant.barcode, this.hit ? .meta ? .custom ? .gtin) : null;

            priceWrapper.innerHTML = `
        <div
          class="${priceClasses.replace(/\s+/g, ' ').trim()}"
          itemprop="offers"
          itemscope
          itemtype="https://schema.org/Offer"
        >
          ${variant.sku ? `<meta itemprop="sku" content="${variant.sku}">` : this.hit?.sku ? `<meta itemprop="sku" content="${this.hit.sku}">` : ''}
          ${gtinData ? `<meta itemprop="${gtinData.key}" content="${gtinData.value}">` : ''}
          ${priceContent ? `<meta itemprop="price" content="${priceContent}">` : ''}
          <meta itemprop="priceCurrency" content="${currency}">
          <link itemprop="availability" href="https://schema.org/${isVariantInStock ? 'InStock' : 'OutOfStock'}">
          <meta itemprop="itemCondition" content="https://schema.org/${
            this.hit?.title && this.hit.title.toLowerCase().includes('refurb') ? 'RefurbishedCondition' : 'NewCondition'
          }">
          ${visualPriceHtml}
        </div>
      `;
        }

        // -----------------------------
        // 3. IMAGE SWAP
        // -----------------------------
        const imageContainer = card.querySelector('.card__media .media');
        if (imageContainer && variant && variant.image && variant.image.url) {
            const buildResponsiveImageUrl = (src, width) => {
                const separator = src.includes('?') ? '&' : '?';
                return `${src}${separator}width=${width}`;
            };

            const buildCardImageSrcset = (src) => {
                const widths = [165, 360, 533, 720, 940, 1066, 1500, 2000];
                return widths.map((width) => `${buildResponsiveImageUrl(src, width)} ${width}w`).join(', ');
            };

            const image = document.createElement('img');
            image.classList.add('motion-reduce');
            image.loading = 'lazy';
            image.width = 540;
            image.height = 540;
            image.src = buildResponsiveImageUrl(variant.image.url, 1066);
            image.srcset = buildCardImageSrcset(variant.image.url);
            image.alt = variant.image.altText || this.hit ? .title || '';
            image.sizes = '(min-width: 1200px) calc((1200px - 130px) / 4), (min-width: 990px) calc((100vw - 130px) / 4), (min-width: 750px) calc((100vw - 120px) / 3), calc((100vw - 35px) / 2)';

            imageContainer.replaceChild(image, imageContainer.firstChild);
        }

        // -----------------------------
        // 4. UPDATE LINKS + ANALYTICS
        // -----------------------------
        if (variant && variant.id) {
            const links = card.querySelectorAll('[href]');
            links.forEach((link) => {
                link.href = link.href.split('?')[0] + '?variant=' + variant.id;
            });

            if (this.listing && typeof aa === 'function') {
                aa('viewedObjectIDs', {
                    userToken: getAlgoliaUserToken(),
                    eventName: 'Product Viewed',
                    index: this.listing.buildIndexParams(),
                    objectIDs: [String(variant.id)],
                });
            }
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
        swatchInput.name = `style-${this.hit.objectID}-${option}-${this.location}`;
        swatchInput.value = swatch.name;
        swatchInput.dataset.optionIndex = optionIndex;
        swatchInput.id = `StyleSwatch-${this.hit.objectID}-${option}-${swatchIndex}-${this.location}`;
        if (selected) {
            swatchInput.checked = true;
        }

        const swatchLabel = document.createElement('label');
        swatchLabel.classList.add('swatch__label');
        swatchLabel.setAttribute('for', `StyleSwatch-${this.hit.objectID}-${option}-${swatchIndex}-${this.location}`);
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
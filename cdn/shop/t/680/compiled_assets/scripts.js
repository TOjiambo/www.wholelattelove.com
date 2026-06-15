(function() {
    var __sections__ = {};
    (function() {
        for (var i = 0, s = document.getElementById('sections-script').getAttribute('data-sections').split(','); i < s.length; i++)
            __sections__[s[i]] = true;
    })();
    (function() {
        if (!__sections__["base_header"]) return;
        try {

            class StickyHeader extends HTMLElement {
                constructor() {
                    super();
                }

                connectedCallback() {
                    this.header = this.parentElement;
                    this.headerBounds = {};
                    this.currentScrollTop = 0;
                    this.preventReveal = false;

                    this.onScrollHandler = this.onScroll.bind(this);
                    this.hideHeaderOnScrollUp = () => this.preventReveal = true;

                    this.addEventListener('preventHeaderReveal', this.hideHeaderOnScrollUp);
                    window.addEventListener('scroll', this.onScrollHandler, false);

                    this.createObserver();
                }

                disconnectedCallback() {
                    this.removeEventListener('preventHeaderReveal', this.hideHeaderOnScrollUp);
                    window.removeEventListener('scroll', this.onScrollHandler);
                }

                createObserver() {
                    let observer = new IntersectionObserver((entries, observer) => {
                        this.headerBounds = entries[0].intersectionRect;
                        observer.disconnect();
                    });

                    observer.observe(this.header);
                }

                onScroll() {
                    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

                    if (scrollTop > this.currentScrollTop && scrollTop > this.headerBounds.bottom) {
                        if (this.preventHide) return;
                        requestAnimationFrame(this.hide.bind(this));
                    } else if (scrollTop < this.currentScrollTop && scrollTop > this.headerBounds.bottom) {
                        if (!this.preventReveal) {
                            requestAnimationFrame(this.reveal.bind(this));
                        } else {
                            window.clearTimeout(this.isScrolling);

                            this.isScrolling = setTimeout(() => {
                                this.preventReveal = false;
                            }, 66);

                            requestAnimationFrame(this.hide.bind(this));
                        }
                    } else if (scrollTop <= this.headerBounds.top) {
                        requestAnimationFrame(this.reset.bind(this));
                    }

                    this.currentScrollTop = scrollTop;
                }

                hide() {
                    this.header.classList.add('shopify-section-header-hidden', 'shopify-section-header-sticky');
                    this.closeMenuDisclosure();
                    this.closeSearchModal();
                }

                reveal() {
                    this.header.classList.add('shopify-section-header-sticky', 'animate');
                    this.header.classList.remove('shopify-section-header-hidden');
                }

                reset() {
                    this.header.classList.remove('shopify-section-header-hidden', 'shopify-section-header-sticky', 'animate');
                }

                closeMenuDisclosure() {
                    this.disclosures = this.disclosures || this.header.querySelectorAll('header-menu');
                    this.disclosures.forEach(disclosure => disclosure.close());
                }

                closeSearchModal() {
                    this.searchBar = this.searchBar || this.header.querySelector('search-bar');
                    this.searchBar.close();
                }
            }

            customElements.define('sticky-header', StickyHeader);

        } catch (e) {
            console.error(e);
        }
    })();
})();
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

    (function() {
        if (!__sections__["section_loyalty-activity"] && !Shopify.designMode) return;
        try {

            function removeThings() {
                const historyRows = document.querySelectorAll('.lion-history-table__row');
                Array.from(historyRows).forEach(historyRow => {
                    const historyType = historyRow.children[1].textContent;
                    const historyAction = historyRow.children[2].textContent;
                    const historyStatus = historyRow.children[4].textContent;
                    if (historyType.toLowerCase().includes('reward') && historyAction === "") {
                        historyRow.remove();
                    }
                });
            }


            function doCoolThings() {
                // Select the node that will be observed for mutations
                const targetNode = document.querySelector("#loyaltylion[data-lion-history-table]");

                if (!targetNode) return;
                // Options for the observer (which mutations to observe)
                const config = {
                    attributes: true,
                    childList: true,
                    subtree: true
                };

                // Callback function to execute when mutations are observed
                const callback = (mutationList, observer) => {
                    for (const mutation of mutationList) {
                        if (mutation.type === "childList") {
                            console.log("A child node has been added or removed.");
                            removeThings()
                        }
                    }
                };

                // Create an observer instance linked to the callback function
                const observer = new MutationObserver(callback);

                // Start observing the target node for configured mutations
                observer.observe(targetNode, config);
            }

            doCoolThings();

        } catch (e) {
            console.error(e);
        }
    })();

    (function() {
        if (!__sections__["section_loyalty-gift-cards"] && !Shopify.designMode) return;
        try {


            function removeStuff() {
                const historyRows = document.querySelectorAll('.lion-claimed-reward-item');
                Array.from(historyRows).forEach(reward => {
                    const rewardText = reward.children[0].textContent;
                    if (rewardText.toLowerCase().includes('gift card')) {
                        reward.remove();
                    }
                });
            }

            function doCoolStuff() {
                // Select the node that will be observed for mutations
                const targetNode = document.querySelector("#loyaltylion[data-lion-claimed-rewards-list]");
                if (!targetNode) return;

                // Options for the observer (which mutations to observe)
                const config = {
                    attributes: true,
                    childList: true,
                    subtree: true
                };

                // Callback function to execute when mutations are observed
                const callback = (mutationList, observer) => {
                    for (const mutation of mutationList) {
                        if (mutation.type === "childList") {
                            console.log("A child node has been added or removed.");
                            removeStuff()
                        }
                    }
                };

                // Create an observer instance linked to the callback function
                const observer = new MutationObserver(callback);

                // Start observing the target node for configured mutations
                observer.observe(targetNode, config);
            }

            doCoolStuff();

        } catch (e) {
            console.error(e);
        }
    })();
})();
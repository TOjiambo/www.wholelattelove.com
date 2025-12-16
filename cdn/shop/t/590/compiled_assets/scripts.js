(function() {
    var __sections__ = {};
    (function() {
        for (var i = 0, s = document.getElementById("sections-script").getAttribute("data-sections").split(","); i < s.length; i++) __sections__[s[i]] = !0
    })(),
    function() {
        if (__sections__.base_header) try {
            class StickyHeader extends HTMLElement {
                constructor() {
                    super()
                }
                connectedCallback() {
                    this.header = this.parentElement, this.headerBounds = {}, this.currentScrollTop = 0, this.preventReveal = !1, this.onScrollHandler = this.onScroll.bind(this), this.hideHeaderOnScrollUp = () => this.preventReveal = !0, this.addEventListener("preventHeaderReveal", this.hideHeaderOnScrollUp), window.addEventListener("scroll", this.onScrollHandler, !1), this.createObserver()
                }
                disconnectedCallback() {
                    this.removeEventListener("preventHeaderReveal", this.hideHeaderOnScrollUp), window.removeEventListener("scroll", this.onScrollHandler)
                }
                createObserver() {
                    new IntersectionObserver((entries, observer2) => {
                        this.headerBounds = entries[0].intersectionRect, observer2.disconnect()
                    }).observe(this.header)
                }
                onScroll() {
                    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
                    if (scrollTop > this.currentScrollTop && scrollTop > this.headerBounds.bottom) {
                        if (this.preventHide) return;
                        requestAnimationFrame(this.hide.bind(this))
                    } else scrollTop < this.currentScrollTop && scrollTop > this.headerBounds.bottom ? this.preventReveal ? (window.clearTimeout(this.isScrolling), this.isScrolling = setTimeout(() => {
                        this.preventReveal = !1
                    }, 66), requestAnimationFrame(this.hide.bind(this))) : requestAnimationFrame(this.reveal.bind(this)) : scrollTop <= this.headerBounds.top && requestAnimationFrame(this.reset.bind(this));
                    this.currentScrollTop = scrollTop
                }
                hide() {
                    this.header.classList.add("shopify-section-header-hidden", "shopify-section-header-sticky"), this.closeMenuDisclosure(), this.closeSearchModal()
                }
                reveal() {
                    this.header.classList.add("shopify-section-header-sticky", "animate"), this.header.classList.remove("shopify-section-header-hidden")
                }
                reset() {
                    this.header.classList.remove("shopify-section-header-hidden", "shopify-section-header-sticky", "animate")
                }
                closeMenuDisclosure() {
                    this.disclosures = this.disclosures || this.header.querySelectorAll("header-menu"), this.disclosures.forEach(disclosure => disclosure.close())
                }
                closeSearchModal() {
                    this.searchBar = this.searchBar || this.header.querySelector("search-bar"), this.searchBar.close()
                }
            }
            customElements.define("sticky-header", StickyHeader)
        } catch (e) {
            console.error(e)
        }
    }(),
    function() {
        if (!(!__sections__["section_loyalty-activity"] && !Shopify.designMode)) try {
            let removeThings2 = function() {
                    const historyRows = document.querySelectorAll(".lion-history-table__row");
                    Array.from(historyRows).forEach(historyRow => {
                        const historyType = historyRow.children[1].textContent,
                            historyAction = historyRow.children[2].textContent,
                            historyStatus = historyRow.children[4].textContent;
                        historyType.toLowerCase().includes("reward") && historyAction === "" && historyRow.remove()
                    })
                },
                doCoolThings2 = function() {
                    const targetNode = document.querySelector("#loyaltylion[data-lion-history-table]");
                    if (!targetNode) return;
                    const config = {
                            attributes: !0,
                            childList: !0,
                            subtree: !0
                        },
                        callback = (mutationList, observer2) => {
                            for (const mutation of mutationList) mutation.type === "childList" && (console.log("A child node has been added or removed."), removeThings2())
                        };
                    new MutationObserver(callback).observe(targetNode, config)
                };
            var removeThings = removeThings2,
                doCoolThings = doCoolThings2;
            doCoolThings2()
        } catch (e) {
            console.error(e)
        }
    }(),
    function() {
        if (!(!__sections__["section_loyalty-gift-cards"] && !Shopify.designMode)) try {
            let removeStuff2 = function() {
                    const historyRows = document.querySelectorAll(".lion-claimed-reward-item");
                    Array.from(historyRows).forEach(reward => {
                        reward.children[0].textContent.toLowerCase().includes("gift card") && reward.remove()
                    })
                },
                doCoolStuff2 = function() {
                    const targetNode = document.querySelector("#loyaltylion[data-lion-claimed-rewards-list]");
                    if (!targetNode) return;
                    const config = {
                            attributes: !0,
                            childList: !0,
                            subtree: !0
                        },
                        callback = (mutationList, observer2) => {
                            for (const mutation of mutationList) mutation.type === "childList" && (console.log("A child node has been added or removed."), removeStuff2())
                        };
                    new MutationObserver(callback).observe(targetNode, config)
                };
            var removeStuff = removeStuff2,
                doCoolStuff = doCoolStuff2;
            doCoolStuff2()
        } catch (e) {
            console.error(e)
        }
    }()
})();
//# sourceMappingURL=/cdn/shop/t/590/compiled_assets/scripts.js.map?601512=
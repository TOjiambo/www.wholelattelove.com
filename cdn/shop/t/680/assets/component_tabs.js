try {
    class TabList extends HTMLElement {
        constructor() {
            super();

            this.tabs = this.querySelectorAll('[role="tab"]');
            this.panels = this.querySelectorAll('[role="tabpanel"]');

            this.swipe_enabled = this.dataset.swipeEnabled;

            this.tabs.forEach((tab) => {
                tab.addEventListener('click', this.update.bind(this));

                tab.addEventListener('keydown', (e) => {
                    if (e.key === 'Enter') {
                        this.update.bind(this);
                    }
                });
            });

            if (this.swipe_enabled) {
                this.panels.forEach((panel) => {
                    panel.addEventListener('touchstart', this.handleTouchStart.bind(this), {
                        passive: true
                    });
                    panel.addEventListener('touchend', this.handleTouchEnd.bind(this));
                });
            }
        }

        update(e) {
            this.tabs.forEach((tab) => {
                tab.setAttribute('aria-selected', 'false');
            });

            e.target.setAttribute('aria-selected', 'true');

            this.panels.forEach((panel) => {
                if (panel.getAttribute('id') == e.target.getAttribute('aria-controls')) {
                    panel.setAttribute('aria-hidden', 'false');
                    panel.focus();
                } else {
                    panel.setAttribute('aria-hidden', 'true');
                }
            });
        }

        nextTab() {
            var tab_index = false;

            this.tabs.forEach((tab, key) => {
                if (tab.getAttribute('aria-selected') == 'true') {
                    tab_index = key + 1;
                    return false;
                }
            });

            if (tab_index !== false && this.tabs[tab_index]) {
                this.tabs[tab_index].click();
            }
        }

        prevTab() {
            var tab_index = false;

            this.tabs.forEach((tab, key) => {
                if (tab.getAttribute('aria-selected') == 'true') {
                    tab_index = key - 1;
                    return false;
                }
            });

            if (tab_index !== false && this.tabs[tab_index]) {
                this.tabs[tab_index].click();
            }
        }

        handleTouchStart(e) {
            if (e.changedTouches) {
                this.touch_start = e.changedTouches[0].screenX;
            } else {
                this.touch_start = e.screenX;
            }
        }

        handleTouchEnd(e) {
            if (e.changedTouches) {
                this.touch_end = e.changedTouches[0].screenX;
            } else {
                this.touch_end = e.screenX;
            }

            this.handleSwipe();
        }

        handleSwipe(e) {
            const delta = Math.abs(this.touch_start - this.touch_end);

            if (delta < 50) {
                return;
            }

            const slider = this.querySelector("[role='tabpanel'][aria-hidden='false'] > .slider");

            if (this.touch_start > this.touch_end) {
                if (slider.scrollWidth - (slider.scrollLeft + slider.clientWidth) == 0) {
                    this.nextTab();
                }
            } else {
                if (slider.scrollLeft == 0) {
                    this.prevTab();
                }
            }
        }
    }

    customElements.define('tab-list', TabList);
} catch (e) {}
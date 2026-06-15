class HeaderMenu extends HTMLElement {
    constructor() {
        super();

        this.detailsContainer = this.querySelector('details');

        if (this.detailsContainer.hasAttribute('mega-menu')) {
            this.detailsContainer.addEventListener('mouseenter', (event) => {
                this.open(event);
            });
            this.detailsContainer.addEventListener('mouseleave', (event) => {
                this.close(event);
            });
        }

        document.querySelectorAll('[id^="MegaDetails-"] summary').forEach((summary) => {
            summary.setAttribute('role', 'button');
            summary.setAttribute('aria-expanded', summary.parentNode.hasAttribute('open'));

            if (summary.nextElementSibling.getAttribute('id')) {
                summary.setAttribute('aria-controls', summary.nextElementSibling.id);
            }

            summary.addEventListener('click', (event) => {
                this.close(event);
                event.currentTarget.setAttribute('aria-expanded', !event.currentTarget.closest('details').hasAttribute('open'));
            });
            if (summary.closest('header-drawer')) return;
            summary.parentElement.addEventListener('keyup', onKeyUpEscape);
        });
    }

    isOpen() {
        return this.detailsContainer.hasAttribute('open');
    }

    previewMenuContent(event) {
        if (this.isOpen()) {
            this.close();
        } else {
            this.open(event);
        }
    }

    open(event) {
        this.detailsContainer.setAttribute('open', true);
    }

    close(event) {
        if (this.isOpen) {
            this.detailsContainer.removeAttribute('open');
        }
    }
}

customElements.define('header-menu', HeaderMenu);
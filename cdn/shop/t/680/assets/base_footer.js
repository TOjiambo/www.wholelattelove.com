class FooterMenus extends HTMLElement {
    constructor() {
        super();

        this.menus = this.querySelectorAll('.footer-menu--menu');

        this.menus.forEach((menu) => {
            let title = menu.querySelector('.footer-menu__title');

            title.addEventListener('click', (node) => {
                menu.toggleAttribute('data-open');
            });
        });
    }
}

customElements.define('footer-menus', FooterMenus);
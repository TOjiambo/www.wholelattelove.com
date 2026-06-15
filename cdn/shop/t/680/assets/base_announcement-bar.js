class AnnouncementBar extends HTMLElement {
    constructor() {
        super();

        const context = this;

        this.close = this.querySelector('[data-announcement-close]');

        this.index = 0;
        this.speed = parseInt(this.dataset.speed) * 1000; // convert seconds to ms
        this.slides = this.querySelectorAll('.announcement-bar__message');

        this.interval = null;

        this.close.addEventListener('click', () => {
            context.hide();
        });

        if (this.slides.length > 1) {
            this.init();
        }

        this.setSize();
        const resizeObserver = new ResizeObserver((entries) => this.setSize());
        resizeObserver.observe(this);
    }

    setSize() {
        this.classList.remove('loaded');

        var max_height = 0;

        this.slides.forEach((node) => {
            if (max_height < node.clientHeight) {
                max_height = node.clientHeight;
            }
        });

        this.style.height = `${max_height}px`;
        this.classList.add('loaded');
    }

    init() {
        this.interval = setInterval(this.next.bind(this), this.speed);
    }

    next() {
        this.index++;

        if (this.index >= this.slides.length) {
            this.index = 0;
        }

        this.setSlide(this.index);
    }

    setSlide(index) {
        this.slides.forEach((slide, key) => {
            if (slide.getAttribute('aria-current') == 'true') {
                slide.classList.add('toggle');

                setTimeout(() => {
                    slide.setAttribute('aria-current', false);
                    slide.classList.remove('toggle');
                }, 300);
            } else if (key == index) {
                slide.setAttribute('aria-current', true);
            } else {
                slide.setAttribute('aria-current', false);
            }
        });
    }

    show() {
        this.style.display = 'block';
    }

    hide() {
        this.style.display = 'none';
    }
}

customElements.define('announcement-bar', AnnouncementBar);
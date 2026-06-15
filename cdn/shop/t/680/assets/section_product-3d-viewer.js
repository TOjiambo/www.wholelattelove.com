class Product3dViewer extends HTMLElement {
    constructor() {
        super();

        this.changeEnvironment = this.changeEnvironment.bind(this);
        this.changeLayout = this.changeLayout.bind(this);

        this.launch3dButton = this.querySelector('.launch-3d-viewer-button');
        this.preModelLoad = this.querySelector('.product-3d-viewer-wrapper .pre-model');
        this.postModelLoad = this.querySelector('.product-3d-viewer-wrapper .post-model');
        this.envmaps = this.querySelectorAll('.envmap-list .envmap');
        this.contentWrapper = this.querySelector('.product-3d-viewer-wrapper .feature-wrapper .feature > .content');
        this.modelViewer = null;
        if (!this.launch3dButton) return;
        this.launch3dButton.addEventListener('click', this.loadProduct3dViewer.bind(this));
        Array.from(this.envmaps).forEach((option) => option.addEventListener('click', this.changeEnvironment.bind(this)));
    }

    loadProduct3dViewer() {
        this.modelViewer = document.createElement('model-viewer');

        if (this.modelViewer) {
            this.modelViewer.setAttribute('id', 'product-3d-viewer-model');
            this.modelViewer.setAttribute('src', `https://static.wholelattelove.com/3dar/${this.dataset.model}/model.glb`);
            this.modelViewer.setAttribute('ios-src', `https://static.wholelattelove.com/3dar/${this.dataset.model}/model.usdz`);
            this.modelViewer.setAttribute('style', `background-color: #f2f2f2`);
            this.modelViewer.setAttribute('alt', `${this.dataset.title}`);
            this.modelViewer.setAttribute('poster', `${this.dataset.poster}`);
            this.modelViewer.setAttribute('shadow-intensity', '1');
            this.modelViewer.setAttribute('interaction-prompt', 'auto');
            this.modelViewer.setAttribute('camera-controls', '');
            this.modelViewer.setAttribute('camera-orbit', '40deg 70deg 105%');
            this.modelViewer.setAttribute('auto-rotate', '');
            this.modelViewer.setAttribute('auto-rotate-delay', '8000');
            this.modelViewer.setAttribute('ar', '');
            this.modelViewer.setAttribute('ar-modes', 'webxr scene-viewer quick-look');
            this.modelViewer.setAttribute('preload', '');
            this.modelViewer.setAttribute('quick-look-browsers', 'safari chrome');

            this.querySelector('.feature__model-viewer').appendChild(this.modelViewer);
            Shopify.loadFeatures([{
                name: 'model-viewer',
                version: '1.12',
                onLoad: this.changeLayout(),
            }, ]);
        }
    }

    changeEnvironment(event) {
        const target = event.currentTarget;
        const envmap = target.dataset.envmap;
        const envmapUrl = `https://static.wholelattelove.com/3dar/envmaps/${envmap}`;

        Array.from(this.envmaps).forEach((option) => option.classList.remove('active'));
        target.classList.add('active');

        if (envmap === 'none') {
            if (this.modelViewer.skyboxImage) this.modelViewer.setAttribute('skybox-image', '');
            this.modelViewer.setAttribute('shadow-intensity', '1');
        } else {
            this.modelViewer.setAttribute('skybox-image', envmapUrl);
            this.modelViewer.setAttribute('shadow-intensity', '0');
        }
    }

    changeLayout() {
        this.launch3dButton.classList.add('hide');
        this.preModelLoad.classList.add('hide');
        this.postModelLoad.classList.add('visible');
        this.contentWrapper.classList.add('reduce-padding');
    }
}

customElements.define('product-3d-viewer', Product3dViewer);
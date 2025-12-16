try {

    // Minimal attributes for each search type used in the search bar
    const SEARCH_BAR_ATTRIBUTES = {
        // Query suggestions (autocomplete terms)
        suggestions: [
            'query',
            'objectID', // used for analytics; Algolia usually returns this anyway
        ],

        // Product hits
        products: [
            'id',
            'objectID',
            'handle',
            'title',
            'image',
            'price',
            'compare_at_price',
            'inventory_available',
            'collections',
            'product_type',
            'vendor',
            'sku',
            'options',
            'option1',
            'option2',
            'option3',
            'option_names',
            'meta.custom.images',
            'meta.custom.gtin',
            'meta.model.s3_folder_file',
            'meta.algolia.all_variants',
            'meta.algolia.variant_promo_tag',
            'meta.variant.coming_soon',
        ],

        // Collection hits
        collections: [
            'handle',
            'title',
            'image',
            'objectID',
        ],

        // Blog article hits (regular articles)
        articles: [
            'title',
            'handle',
            'image',
            'blog',
            'author',
            'body_html_safe', // used for snippet / read time
            'objectID',
        ],

        // “Support Articles” (still using the articles index with a facet filter)
        supportArticles: [
            'title',
            'handle',
            'image',
            'blog',
            'author',
            'body_html_safe',
            'objectID',
        ],

        // Pages (static content)
        pages: [
            'title',
            'handle',
            'objectID',
        ],
    };

    class SearchBar extends HTMLElement {
        constructor() {
            super();

            // Settings
            this.productsToDisplay = Number(this.dataset.productsToDisplay) || 0;
            this.productsToDisplayMobile = Number(this.dataset.productsToDisplayMobile) || 0;

            const isMobile = window.matchMedia('(max-width: 989px)').matches;
            this.productsToFetch = isMobile ? this.productsToDisplayMobile : this.productsToDisplay;

            this.maxSwatches = parseInt(this.dataset.maxSwatches) || 3;
            this.showColorSwatches = this.dataset.showColorSwatches === 'true';
            this.showMaterialSwatches = this.dataset.showMaterialSwatches === 'true';

            // Initialize Algolia Search Client
            this.searchClient = algoliaShopify.externals.algoliasearch(algoliaShopify.config.app_id, algoliaShopify.config.search_api_key);

            this.lastQuery = false;
            this.query = '';

            this.container = this;

            // Left Side
            this.trendingContainer = this.querySelector('#AlgoliaSearchResultsTrending');
            this.pagesContainer = this.querySelector('#AlgoliaSearchResultsPages');
            this.quickLinksContainer = this.querySelector('#AlgoliaSearchResultsQuickLinks');

            this.collectionsContainer = this.querySelector('#AlgoliaSearchResultsCollections');

            // Middle
            this.allResultsLink = this.querySelector('#AlgoliaSearchAllResults');
            this.countContainer = this.querySelector('#AlgoliaSearchResultsCount');
            this.productsContainer = this.querySelector('#AlgoliaSearchResultsProducts');

            this.articlesDesktopContainer = this.querySelector('#AlgoliaSearchResultsArticlesDesktop');
            this.articlesDesktopHeading = this.querySelector('#AlgoliaSearchArticlesHeading');
            this.articlesDesktopCountContainer = this.querySelector('#AlgoliaSearchArticlesCountDesktop');

            this.supportDesktopContainer = this.querySelector('#AlgoliaSearchResultsSupportDesktop');
            this.supportDesktopHeading = this.querySelector('#AlgoliaSearchSupportHeading');
            this.supportDesktopCountContainer = this.querySelector('#AlgoliaSearchSupportCountDesktop');

            // Right Side
            this.articlesContainer = this.querySelector('#AlgoliaSearchResultsArticles');
            this.articlesCountContainer = this.querySelector('#AlgoliaSearchArticlesCount');
            this.supportContainer = this.querySelector('#AlgoliaSearchResultsSupport');

            this.articlesButton = this.querySelector('#HeaderResultsTabArticles');
            this.supportButton = this.querySelector('#HeaderResultsTabSupport');

            this.toggle = this.querySelector('.header__search-toggle');
            this.closeButton = this.querySelector('.header__search-close');
            this.input = this.querySelector('.header__search-input');
            this.form = this.querySelector('.header__search-form');

            this.userToken = getAlgoliaUserToken();

            // Set all the indexes we need
            this.queries = [
                // Suggestions
                {
                    indexName: `shopify_wllusproducts_query_suggestions`,
                    query: this.query,
                    params: {
                        hitsPerPage: 3,
                        attributesToRetrieve: SEARCH_BAR_ATTRIBUTES.suggestions,
                        clickAnalytics: true,
                    },
                },
                // Products
                {
                    indexName: `${algoliaShopify.config.index_prefix}products`,
                    query: this.query,
                    params: {
                        hitsPerPage: this.productsToFetch || algoliaShopify.config.products_autocomplete_hits_per_page,
                        attributesToRetrieve: SEARCH_BAR_ATTRIBUTES.products,
                        filters: 'meta.algolia.ignore:public',
                        userToken: this.userToken,
                        enablePersonalization: true,
                        clickAnalytics: true,
                    },
                },
                // Collections
                {
                    indexName: `${algoliaShopify.config.index_prefix}collections`,
                    query: this.query,
                    params: {
                        hitsPerPage: algoliaShopify.config.collections_autocomplete_hits_per_page,
                        attributesToRetrieve: SEARCH_BAR_ATTRIBUTES.collections,
                        userToken: this.userToken,
                        clickAnalytics: true,
                    },
                },
                // Articles
                {
                    indexName: `${algoliaShopify.config.index_prefix}articles`,
                    query: this.query,
                    params: {
                        hitsPerPage: 5 || algoliaShopify.config.articles_autocomplete_hits_per_page,
                        attributesToRetrieve: SEARCH_BAR_ATTRIBUTES.articles,
                        facetFilters: ['blog.title:-Support Articles'],
                        userToken: this.userToken,
                        clickAnalytics: true,
                    },
                },
                // Support Articles
                {
                    indexName: `${algoliaShopify.config.index_prefix}articles`,
                    query: this.query,
                    params: {
                        hitsPerPage: 6 || algoliaShopify.config.articles_autocomplete_hits_per_page,
                        attributesToRetrieve: SEARCH_BAR_ATTRIBUTES.supportArticles,
                        facetFilters: [
                            ['blog.title:Support Articles', 'blog.title:Customer Service']
                        ],
                        userToken: this.userToken,
                        clickAnalytics: true,
                    },
                },
            ];

            // Pages
            if (this.pagesContainer) {
                this.queries.push({
                    indexName: `${algoliaShopify.config.index_prefix}pages`,
                    query: this.query,
                    params: {
                        hitsPerPage: algoliaShopify.config.pages_autocomplete_hits_per_page,
                        attributesToRetrieve: SEARCH_BAR_ATTRIBUTES.pages,
                        userToken: this.userToken,
                        clickAnalytics: true,
                    }
                }, );
            }

            this.debouncedInput = debounce((event) => {
                this.onSearchInput(event);
            }, 300);

            this.input.addEventListener('focus', this.onSearchFocus.bind(this));
            this.input.addEventListener('input', this.debouncedInput.bind(this));

            this.addEventListener('focusout', this.onFocusOut.bind(this));

            this.toggle.addEventListener('click', this.onToggleClick.bind(this));

            this.closeButton.addEventListener('click', this.onCloseClick.bind(this));
        }

        buildIndexParams() {
            return `${algoliaShopify.config.index_prefix}products`;
        }

        onCloseClick(event) {
            if (window.innerWidth >= 990) {
                return;
            }

            event.preventDefault();

            this.close();
            this.lastQuery = false;
        }

        onToggleClick(event) {
            if (window.innerWidth >= 990) {
                return;
            }

            event.preventDefault();

            if (this.toggle.getAttribute('aria-expanded') === 'true') {
                this.close();
                this.lastQuery = false;
            } else {
                this.open();
                this.onSearchFocus();
            }
        }

        onSearchFocus(event) {
            if (this.lastQuery !== this.query) {
                this.lastQuery = this.query;
                this.search();
            }
        }

        onSearchInput(event) {
            this.query = event.target.value;

            if (this.query.length > 2 || this.query.length === 0) {
                this.search();
            }
        }

        onFocusOut(event) {
            setTimeout(() => {
                if (window.innerWidth < 750) {
                    return;
                }

                if (!this.contains(document.activeElement)) {
                    this.close();
                    this.lastQuery = false;
                }
            });
        }

        search() {
            this.allResultsLink.href = `/search?q=${this.query}`;

            const context = [];

            if (this.query.length === 0) {
                context.push('empty_search');

                this.classList.add('empty_search');

                if (this.quickLinksContainer) {
                    this.quickLinksContainer.classList.remove('hidden');
                }
            } else {
                this.classList.remove('empty_search');

                if (this.quickLinksContainer && window.innerWidth < 990) {
                    this.quickLinksContainer.classList.add('hidden');
                }
            }

            this.queries.forEach((query) => {
                query.query = this.query;
                query.params.ruleContexts = context;
            });

            this.searchClient.multipleQueries(this.queries).then((queries) => {
                // console.log('==== QUERIES RESULTS ====');
                // console.log(queries);

                queries.results.forEach((result, index) => {

                    // // Visual Editor redirects
                    // let redirectUrl = result?.renderingContent?.redirect?.url;

                    // // Manual Editor custom-data redirects
                    // if (!redirectUrl && Array.isArray(result.userData)) {
                    //   const match = result.userData.find((data) => Boolean(data.redirect));
                    //   if (match && match.redirect) {
                    //     redirectUrl = match.redirect;
                    //   }
                    // }

                    // if (redirectUrl) {

                    //   // Redirect ObjectID
                    //   const url = new URL(redirectUrl, window.location.origin);
                    //   const redirectId = `redirect:${url.pathname || "/"}`;

                    //   if (result?.queryID) {
                    //     // Redirect is directly tied to this search => use *AfterSearch* variant
                    //     aa("convertedObjectIDsAfterSearch", {
                    //       userToken: getAlgoliaUserToken(),
                    //       eventName: 'Search Redirected',
                    //       index: result.index,
                    //       queryID: result.queryID,
                    //       objectIDs: [redirectId],
                    //     });
                    //   } else {
                    //     // Fallback: still track redirect, but not tied to a specific query
                    //     aa("convertedObjectIDs", {
                    //       userToken: getAlgoliaUserToken(),
                    //       eventName: 'Search Redirected',
                    //       index: result.index,
                    //       objectIDs: [redirectId],
                    //     });
                    //   }

                    //   window.location.href = redirectUrl;
                    //   return;
                    // }


                    if (result.index == `${algoliaShopify.config.index_prefix}products`) {
                        this.countContainer.innerHTML = `
              ${window.theme.strings.searchResults
                .replace('[start]', result.nbHits === 0 ? 0 : result.page * result.hitsPerPage + 1)
                .replace('[end]', Math.min(result.nbHits, (result.page + 1) * result.hitsPerPage))
                .replace('[total]', result.nbHits)}
            `;

                        const productsContainer = this.productsContainer;

                        productsContainer.innerHTML = '';

                        result.hits.forEach((hit, index) => {
                            if (window.innerWidth >= 990 && index >= this.productsToDisplay) {
                                return;
                            } else if (window.innerWidth < 990 && index >= this.productsToDisplayMobile) {
                                return;
                            }

                            const li = document.createElement('li');
                            li.classList.add('grid__item', 'slider__slide', 'slideshow__slide');

                            const product = document.createElement('div');
                            product.classList.add('card', `standard-card`);

                            product.id = hit.id;
                            product.dataset.productId = hit.id;
                            product.dataset.objectId = hit.objectID;

                            // Variant promo tag from Algolia metafield (only if in stock)
                            const promoTag = this.getPromoTagFromHit(hit);
                            if (promoTag && hit.inventory_available) {
                                const tag = document.createElement('div');
                                tag.className = 'card__tag card__tag--promo';
                                tag.textContent = promoTag;
                                product.appendChild(tag);
                            }

                            // Image
                            const imageWrapper = document.createElement('div');
                            imageWrapper.classList.add('card__media');
                            if (this.linkStyle == 'hover') {
                                imageWrapper.classList.add('card__media--grey');
                            }

                            const imageLink = document.createElement('a');
                            imageLink.classList.add('full-unstyled-link');
                            imageLink.href = `${this.collectionHandle ? `/collections/${this.collectionHandle}` : ''}/products/${hit.handle}?variant=${hit.objectID}`;

                            const imageContainer = document.createElement('div');
                            imageContainer.classList.add('media', `media--square`);

                            let imageList = [hit.image];

                            imageList.forEach((src) => {
                                if (src == null) {
                                    src = window.theme.productDefaultImage;
                                }

                                const image = document.createElement('img');
                                image.classList.add('motion-reduce');
                                image.loading = 'lazy';
                                image.width = 2000;
                                image.height = 2000;
                                image.src = src + '&width=180';
                                image.srcset = `
                  ${src + '&width=165'} 165w,
                  ${src + '&width=240'} 240w,
                  ${src + '&width=360'} 360w,
                  ${src + '&width=533'} 533w,
                  ${src + '&width=720'} 720w,
                  ${src + '&width=940'} 940w,
                  ${src + '&width=1066'} 1066w,
                  ${src + '&width=2000'} 2000w`;
                                image.alt = hit.title;
                                image.sizes = '(min-width: 990px) calc(100vw / 4), (min-width: 750px) calc(100vw / 3), calc(100vw / 2)';

                                imageContainer.appendChild(image);
                            });

                            imageLink.appendChild(imageContainer);
                            imageWrapper.appendChild(imageLink);

                            product.appendChild(imageWrapper);

                            // Details
                            const details = document.createElement('div');
                            details.classList.add('card__inner');

                            const info = document.createElement('div');
                            info.classList.add('card__information', `center`);

                            const title = document.createElement('div');
                            title.classList.add('card__heading', `h6`);

                            const titleLink = document.createElement('a');
                            titleLink.classList.add('full-unstyled-link');
                            titleLink.href = `${this.collectionHandle ? `/collections/${this.collectionHandle}` : ''}/products/${hit.handle}?variant=${hit.objectID}`;
                            titleLink.innerHTML = hit.title;

                            title.appendChild(titleLink);
                            info.appendChild(title);

                            const rating = document.createElement('div');
                            rating.classList.add('card__rating');
                            rating.innerHTML = `
                <a class="yotpo-prod-link" href="${this.collectionHandle ? `/collections/${this.collectionHandle}` : ''}/products/${hit.handle}?variant=${hit.objectID}">
                  <div 
                    class="yotpo-widget-instance"
                    data-yotpo-instance-id="${window.theme.yotpo.bottomlineInstanceId}"
                    data-yotpo-product-id="${hit.id}"
                    data-yotpo-cart-product-id="${hit.id}"
                    data-yotpo-section-id="collection"></div>
                </a>
              `;
                            info.appendChild(rating);

                            if (hit.meta ? .algolia ? .all_variants ? .variants ? .length > 0) {
                                const variantsData = hit.meta.algolia.all_variants;

                                let firstOption = true;

                                let currentColor = false;
                                let currentMaterial = false;

                                if (hit.options.color) {
                                    currentColor = hit.options.color;
                                }

                                if (hit.options.material) {
                                    currentMaterial = hit.options.material;
                                }

                                const cardSwatches = document.createElement('card-swatches');
                                cardSwatches.classList.add('card__swatches');
                                cardSwatches.dataset.productHandle = hit.handle;
                                cardSwatches.dataset.productUrl = `/products/${hit.handle}`;

                                cardSwatches.setSelectedOption(0, hit.option1);
                                cardSwatches.setSelectedOption(1, hit.option2);
                                cardSwatches.setSelectedOption(2, hit.option3);

                                cardSwatches.setHit(hit);
                                cardSwatches.setVariantData(variantsData.variants);
                                cardSwatches.setMaterialData(variantsData.swatch_materials);
                                cardSwatches.setColorData(variantsData.swatch_colors);
                                cardSwatches.setMaxSwatches(this.maxSwatches);

                                hit.option_names.forEach((option, optionIndex) => {
                                    let swatchCount = 0;
                                    let swatchData = [];

                                    if (option == 'color' && this.showColorSwatches && variantsData.swatch_colors.length > 0) {
                                        swatchData = variantsData.swatch_colors;
                                    } else if (option == 'material' && this.showMaterialSwatches && variantsData.swatch_materials.length > 0) {
                                        swatchData = variantsData.swatch_materials;
                                    } else {
                                        cardSwatches.setSelectedOption(optionIndex, null);
                                    }

                                    if (!firstOption) {
                                        return;
                                    }

                                    if (
                                        (option == 'color' && this.showColorSwatches && variantsData.swatch_colors.length > 0) ||
                                        (option == 'material' && this.showMaterialSwatches && variantsData.swatch_materials.length > 0)
                                    ) {
                                        firstOption = false;

                                        const swatchList = cardSwatches.generateSwatchList(option, optionIndex);

                                        swatchData.forEach((swatch, swatchIndex) => {
                                            if (swatch.name == currentColor || swatch.name == currentMaterial) {
                                                const swatchItem = cardSwatches.generateSwatch(swatch, swatchIndex, option, optionIndex, true);
                                                swatchList.appendChild(swatchItem);

                                                swatchCount++;
                                            }
                                        });

                                        swatchData.forEach((swatch, swatchIndex) => {
                                            if (swatch.name != currentColor && swatch.name != currentMaterial && swatchCount < this.maxSwatches) {
                                                const swatchItem = cardSwatches.generateSwatch(swatch, swatchIndex, option, optionIndex, false);
                                                swatchList.appendChild(swatchItem);

                                                swatchCount++;
                                            }
                                        });

                                        if (swatchData.length > this.maxSwatches) {
                                            const moreSwatches = document.createElement('div');
                                            moreSwatches.classList.add('card__swatch', 'card__swatch--more');

                                            const moreSwatchesLink = document.createElement('a');
                                            moreSwatchesLink.classList.add('full-unstyled-link');
                                            moreSwatchesLink.href = `${this.collectionHandle ? `/collections/${this.collectionHandle}` : ''}/products/${hit.handle}?variant=${hit.objectID}`;
                                            moreSwatchesLink.innerHTML = `+`;
                                            moreSwatches.appendChild(moreSwatchesLink);

                                            swatchList.appendChild(moreSwatches);
                                        }

                                        cardSwatches.appendChild(swatchList);
                                    }
                                });

                                info.appendChild(cardSwatches);

                                cardSwatches.init();
                            }

                            const price = document.createElement('div');
                            price.classList.add('card__price');
                            price.innerHTML = `
                <div 
                  class="
                    card__price
                    ${hit.inventory_available == false ? 'price--sold-out' : ''}
                    ${hit.collections.indexOf('pre-order-hidden') > -1 ? 'price--pre-order' : ''}
                    ${hit.collections.indexOf('new-hidden') > -1 ? 'price--new' : ''}
                    ${hit.compare_at_price > hit.price ? 'price--on-sale' : 'price--no-compare'}

                  ">
                    <div class="price__container">
                      <div class="price__regular">
                        <span class="visually-hidden visually-hidden--inline">${window.theme.strings.regularPrice}</span>
                        <span class="price-item price-item--regular">
                          ${algoliaShopify.formatMoney(hit.price * 100)}
                        </span>
                      </div>

                      ${
                        hit.compare_at_price > hit.price
                          ? `
                        <div class="price__sale">
                          <div class="price__container">
                            <span class="visually-hidden visually-hidden--inline">${window.theme.strings.salePrice}</span>
                            <span class="price-item price-item--sale price-item--last">
                              ${algoliaShopify.formatMoney(hit.price * 100)}
                            </span>
                            <span class="visually-hidden visually-hidden--inline">${window.theme.strings.regularPrice}</span>
                            <span>
                              <s class="price-item price-item--regular">
                                ${algoliaShopify.formatMoney(hit.compare_at_price * 100)}
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
                            info.appendChild(price);

                            details.appendChild(info);
                            product.appendChild(details);

                            product.querySelectorAll('a').forEach((a) => {
                                a.addEventListener('click', (event) => {
                                    if (aa) {
                                        aa('clickedObjectIDsAfterSearch', {
                                            userToken: getAlgoliaUserToken(),
                                            eventName: 'Autocomplete: Product Clicked',
                                            index: result.index,
                                            queryID: result.queryID,
                                            objectIDs: [hit.objectID],
                                            positions: [index + 1],
                                        });
                                    }
                                });
                            });

                            li.appendChild(product);
                            productsContainer.appendChild(li);
                        });

                    } else if (result.index == `${algoliaShopify.config.index_prefix}collections`) {
                        const container = this.collectionsContainer.querySelector('.header__results-links-list');
                        container.innerHTML = '';

                        if (result.hits.length > 0) {
                            this.collectionsContainer.classList.remove('hidden');
                        } else {
                            this.collectionsContainer.classList.add('hidden');
                        }

                        result.hits.forEach((hit, index) => {
                            const li = document.createElement('li');
                            li.classList.add('header__results-links-item');

                            const a = document.createElement('a');
                            a.classList.add('header__results-link', 'link', 'full-unstyled-link');
                            a.href = `/collections/${hit.handle}`;
                            a.innerHTML = `
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="11" viewBox="0 0 12 11" fill="none">
                  <path d="M0.531479 9.41435C0.208032 9.67311 0.155591 10.1451 0.414348 10.4685C0.673106 10.792 1.14507 10.8444 1.46852 10.5857L1 10L0.531479 9.41435ZM11.7454 2.08282C11.7912 1.67114 11.4945 1.30033 11.0828 1.25459L4.37411 0.509174C3.96243 0.463432 3.59161 0.760084 3.54587 1.17176C3.50013 1.58344 3.79678 1.95426 4.20846 2L10.1718 2.66259L9.50917 8.62589C9.46343 9.03757 9.76008 9.40839 10.1718 9.45413C10.5834 9.49987 10.9543 9.20322 11 8.79154L11.7454 2.08282ZM1 10L1.46852 10.5857L11.4685 2.58565L11 2L10.5315 1.41435L0.531479 9.41435L1 10Z" fill="#aa5707"></path>
                </svg>
                <span>${hit.title}</span>
              `;

                            a.addEventListener('click', (event) => {
                                if (aa) {
                                    aa('clickedObjectIDsAfterSearch', {
                                        userToken: getAlgoliaUserToken(),
                                        eventName: 'Autocomplete: Collection Clicked',
                                        index: result.index,
                                        queryID: result.queryID,
                                        objectIDs: [hit.objectID],
                                        positions: [(index + 1)],
                                    });
                                }
                            });

                            li.appendChild(a);

                            container.appendChild(li);
                        });

                    } else if (result.index == `${algoliaShopify.config.index_prefix}pages`) {
                        const container = this.pagesContainer.querySelector('.header__results-links-list');
                        container.innerHTML = '';

                        if (result.hits.length > 0) {
                            this.pagesContainer.classList.remove('hidden');
                        } else {
                            this.pagesContainer.classList.add('hidden');
                        }

                        result.hits.forEach((hit, index) => {
                            const li = document.createElement('li');
                            li.classList.add('header__results-links-item');

                            const a = document.createElement('a');
                            a.classList.add('header__results-link', 'link', 'full-unstyled-link');
                            a.href = `/pages/${hit.handle}`;
                            a.innerHTML = `
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="11" viewBox="0 0 12 11" fill="none">
                  <path d="M0.531479 9.41435C0.208032 9.67311 0.155591 10.1451 0.414348 10.4685C0.673106 10.792 1.14507 10.8444 1.46852 10.5857L1 10L0.531479 9.41435ZM11.7454 2.08282C11.7912 1.67114 11.4945 1.30033 11.0828 1.25459L4.37411 0.509174C3.96243 0.463432 3.59161 0.760084 3.54587 1.17176C3.50013 1.58344 3.79678 1.95426 4.20846 2L10.1718 2.66259L9.50917 8.62589C9.46343 9.03757 9.76008 9.40839 10.1718 9.45413C10.5834 9.49987 10.9543 9.20322 11 8.79154L11.7454 2.08282ZM1 10L1.46852 10.5857L11.4685 2.58565L11 2L10.5315 1.41435L0.531479 9.41435L1 10Z" fill="#aa5707"></path>
                </svg>
                <span>${hit.title}</span>
              `;

                            a.addEventListener('click', (event) => {
                                if (aa) {
                                    aa('clickedObjectIDsAfterSearch', {
                                        userToken: getAlgoliaUserToken(),
                                        eventName: 'Autocomplete: Page Clicked',
                                        index: result.index,
                                        queryID: result.queryID,
                                        objectIDs: [hit.objectID],
                                        positions: [(index + 1)],
                                    });
                                }
                            });

                            li.appendChild(a);

                            container.appendChild(li);
                        });

                    } else if (result.index == `${algoliaShopify.config.index_prefix}articles` && !result.params.includes('facetFilters=%5B%5B%22blog.title%3ASupport%20Articles%22%2C%22blog.title%3ACustomer%20Service%22%5D%5D')) {
                        this.articlesContainer.innerHTML = '';
                        this.articlesDesktopContainer.innerHTML = '';

                        this.articlesCountContainer.innerHTML = `
              ${window.theme.strings.searchResults
                .replace('[start]', result.page * result.hitsPerPage + 1)
                .replace('[end]', result.page * result.hitsPerPage + result.hitsPerPage)
                .replace('[total]', result.nbHits)}
            `;

                        this.articlesDesktopCountContainer.innerHTML = `
              ${window.theme.strings.searchResults
                .replace('[start]', result.page * result.hitsPerPage + 1)
                .replace('[end]', result.page * result.hitsPerPage + result.hitsPerPage)
                .replace('[total]', result.nbHits)}
            `;

                        if (result.hits.length > 0) {
                            this.articlesButton.disabled = false;
                        } else {
                            this.articlesButton.disabled = true;
                        }

                        result.hits.forEach((hit, index) => {
                            const li = document.createElement('li');
                            li.classList.add('header__results-article');

                            const a = document.createElement('a');
                            a.classList.add('header__results-article-link', 'full-unstyled-link', 'link');
                            a.href = `/blogs/${hit.blog.handle}/${hit.handle}`;

                            // const imageContainer = document.createElement('div');
                            // imageContainer.classList.add('header__results-article-media');

                            // const media = document.createElement('div');
                            // media.classList.add('media', 'media--square');

                            // const image = document.createElement('img');
                            // if(hit.image != null) {
                            //   image.src = hit.image + '&width=280';
                            // }
                            // else {
                            //   image.src = window.theme.articleDefaultImage;
                            // }
                            // image.alt = hit.title;
                            // image.width = 100;
                            // image.height = 100;

                            const info = document.createElement('div');
                            info.classList.add('header__results-article-info');

                            const title = document.createElement('div');
                            title.classList.add('header__results-article-title');
                            title.innerHTML = hit.title;

                            const readTime = Math.ceil(hit.body_html_safe.length / 250);

                            const author = document.createElement('div');
                            author.classList.add('header__results-article-subtitle');
                            author.innerHTML = `<span class="circle-divider">by ${hit.author.name}</span><span>${readTime} min read</span>`;

                            info.appendChild(title);
                            info.appendChild(author);

                            // media.appendChild(image);
                            // imageContainer.appendChild(media);
                            // a.appendChild(imageContainer);
                            a.appendChild(info);
                            li.appendChild(a);

                            const desktopClone = li.cloneNode(true);
                            const mobileClone = li.cloneNode(true);

                            this.articlesContainer.appendChild(desktopClone);
                            this.articlesDesktopContainer.appendChild(mobileClone);

                            desktopClone.querySelector("a").addEventListener('click', (event) => {
                                if (aa) {
                                    aa('clickedObjectIDsAfterSearch', {
                                        userToken: getAlgoliaUserToken(),
                                        eventName: 'Autocomplete: Article Clicked',
                                        index: result.index,
                                        queryID: result.queryID,
                                        objectIDs: [hit.objectID],
                                        positions: [(index + 1)],
                                    });
                                }
                            });

                            mobileClone.querySelector("a").addEventListener('click', (event) => {
                                if (aa) {
                                    aa('clickedObjectIDsAfterSearch', {
                                        userToken: getAlgoliaUserToken(),
                                        eventName: 'Autocomplete: Article Clicked',
                                        index: result.index,
                                        queryID: result.queryID,
                                        objectIDs: [hit.objectID],
                                        positions: [(index + 1)],
                                    });
                                }
                            });
                        });

                        if (result.hits.length > 0) {
                            const li = document.createElement('li');
                            li.classList.add('header__results-article', 'header__results-article--view-all');

                            const viewAllArticlesLink = document.createElement('a');
                            viewAllArticlesLink.classList.add('uppercase', 'link', 'link--text', 'link--four', 'link--fancy');
                            viewAllArticlesLink.href = `/search?q=${this.query}&index=articles`;
                            viewAllArticlesLink.innerHTML = 'View All Articles';

                            li.appendChild(viewAllArticlesLink);

                            this.articlesContainer.appendChild(li.cloneNode(true));

                            const viewLink = this.articlesDesktopHeading.querySelector('a');
                            if (!viewLink) {
                                this.articlesDesktopHeading.appendChild(viewAllArticlesLink.cloneNode(true));
                            }
                        }
                    } else if (result.index == `${algoliaShopify.config.index_prefix}articles` && result.params.includes('facetFilters=%5B%5B%22blog.title%3ASupport%20Articles%22%2C%22blog.title%3ACustomer%20Service%22%5D%5D')) {
                        this.supportContainer.innerHTML = '';
                        this.supportDesktopContainer.innerHTML = '';

                        if (this.supportButton) {
                            if (result.hits.length > 0) {
                                this.supportButton.disabled = false;
                            } else {
                                this.supportButton.disabled = true;
                            }
                        }

                        this.supportDesktopCountContainer.innerHTML = `
              ${window.theme.strings.searchResults
                .replace('[start]', result.page * result.hitsPerPage + 1)
                .replace('[end]', result.page * result.hitsPerPage + result.hitsPerPage)
                .replace('[total]', result.nbHits)}
            `;

                        result.hits.forEach((hit, index) => {
                            const li = document.createElement('li');
                            li.classList.add('header__results-links-item');

                            const a = document.createElement('a');
                            a.classList.add('header__results-link', 'full-unstyled-link', 'link');
                            a.href = `/blogs/${hit.blog.handle}/${hit.handle}`;

                            a.innerHTML = `
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="11" viewBox="0 0 12 11" fill="none">
                  <path d="M0.531479 9.41435C0.208032 9.67311 0.155591 10.1451 0.414348 10.4685C0.673106 10.792 1.14507 10.8444 1.46852 10.5857L1 10L0.531479 9.41435ZM11.7454 2.08282C11.7912 1.67114 11.4945 1.30033 11.0828 1.25459L4.37411 0.509174C3.96243 0.463432 3.59161 0.760084 3.54587 1.17176C3.50013 1.58344 3.79678 1.95426 4.20846 2L10.1718 2.66259L9.50917 8.62589C9.46343 9.03757 9.76008 9.40839 10.1718 9.45413C10.5834 9.49987 10.9543 9.20322 11 8.79154L11.7454 2.08282ZM1 10L1.46852 10.5857L11.4685 2.58565L11 2L10.5315 1.41435L0.531479 9.41435L1 10Z" fill="#aa5707"></path>
                </svg>
                <span>${hit.title}</span>
              `;

                            li.appendChild(a);

                            const desktopClone = li.cloneNode(true);
                            const mobileClone = li.cloneNode(true);

                            this.supportContainer.appendChild(desktopClone);
                            this.supportDesktopContainer.appendChild(mobileClone);

                            desktopClone.querySelector("a").addEventListener('click', (event) => {
                                if (aa) {
                                    aa('clickedObjectIDsAfterSearch', {
                                        userToken: getAlgoliaUserToken(),
                                        eventName: 'Autocomplete: Support Article Clicked',
                                        index: result.index,
                                        queryID: result.queryID,
                                        objectIDs: [hit.objectID],
                                        positions: [(index + 1)],
                                    });
                                }
                            });

                            mobileClone.querySelector("a").addEventListener('click', (event) => {
                                if (aa) {
                                    aa('clickedObjectIDsAfterSearch', {
                                        userToken: getAlgoliaUserToken(),
                                        eventName: 'Autocomplete: Support Article Clicked',
                                        index: result.index,
                                        queryID: result.queryID,
                                        objectIDs: [hit.objectID],
                                        positions: [(index + 1)],
                                    });
                                }
                            });
                        });

                        if (result.hits.length > 0) {
                            const li = document.createElement('li');
                            li.classList.add('header__results-article', 'header__results-article--view-all');

                            const viewAllSupportLink = document.createElement('a');
                            viewAllSupportLink.classList.add('uppercase', 'link', 'link--text', 'link--four', 'link--fancy');
                            viewAllSupportLink.href = `/pages/support`;
                            viewAllSupportLink.innerHTML = 'View support';

                            li.appendChild(viewAllSupportLink);

                            this.supportContainer.appendChild(li.cloneNode(true));

                            const viewLink = this.supportDesktopHeading.querySelector('a');
                            if (!viewLink) {
                                this.supportDesktopHeading.appendChild(viewAllSupportLink.cloneNode(true));
                            }
                        }
                    } else if (result.index == `shopify_wllusproducts_query_suggestions`) {
                        const container = this.trendingContainer.querySelector('ul');

                        container.innerHTML = '';

                        result.hits.forEach((hit, index) => {
                            const li = document.createElement('li');
                            li.classList.add('header__results-links-item');

                            const a = document.createElement('a');
                            a.classList.add('header__results-link', 'link', 'full-unstyled-link');
                            a.href = `/search?q=${hit.query}`;
                            a.innerHTML = `
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="11" viewBox="0 0 12 11" fill="none">
                  <path d="M0.531479 9.41435C0.208032 9.67311 0.155591 10.1451 0.414348 10.4685C0.673106 10.792 1.14507 10.8444 1.46852 10.5857L1 10L0.531479 9.41435ZM11.7454 2.08282C11.7912 1.67114 11.4945 1.30033 11.0828 1.25459L4.37411 0.509174C3.96243 0.463432 3.59161 0.760084 3.54587 1.17176C3.50013 1.58344 3.79678 1.95426 4.20846 2L10.1718 2.66259L9.50917 8.62589C9.46343 9.03757 9.76008 9.40839 10.1718 9.45413C10.5834 9.49987 10.9543 9.20322 11 8.79154L11.7454 2.08282ZM1 10L1.46852 10.5857L11.4685 2.58565L11 2L10.5315 1.41435L0.531479 9.41435L1 10Z" fill="#aa5707"></path>
                </svg>
                <span>${hit.query}</span>
              `;

                            a.addEventListener('click', (event) => {
                                if (aa) {
                                    aa('clickedObjectIDsAfterSearch', {
                                        userToken: getAlgoliaUserToken(),
                                        eventName: 'Autocomplete: Suggestion Clicked',
                                        index: result.index,
                                        queryID: result.queryID,
                                        objectIDs: [hit.objectID],
                                        positions: [(index + 1)],
                                    });
                                }
                            });

                            li.appendChild(a);

                            container.appendChild(li);
                        });
                    }
                });
            });

            this.open();
        }

        /**
         * Read variant promo tag from Algolia hit.
         * Source: hit.meta.algolia.variant_promo_tag
         *
         * @param {object} hit
         * @returns {string|null}
         */
        getPromoTagFromHit(hit) {
            const value =
                hit &&
                hit.meta &&
                hit.meta.algolia &&
                hit.meta.algolia.variant_promo_tag;

            if (typeof value !== 'string') return null;

            const trimmed = value.trim();
            return trimmed.length ? trimmed : null;
        }

        open() {
            this.toggle.setAttribute('aria-expanded', 'true');

            this.setAttribute('open', true);
            this.input.setAttribute('aria-expanded', true);

            document.body.classList.add('overflow-hidden');
        }

        close() {
            this.toggle.setAttribute('aria-expanded', 'false');

            this.removeAttribute('open');
            this.input.setAttribute('aria-expanded', false);

            document.body.classList.remove('overflow-hidden');
        }
    }

    customElements.define('search-bar', SearchBar);
} catch (e) {}
(() => {
    var Z = Object.create;
    var v = Object.defineProperty;
    var z = Object.getOwnPropertyDescriptor;
    var ee = Object.getOwnPropertyNames;
    var te = Object.getPrototypeOf,
        re = Object.prototype.hasOwnProperty;
    var T = (e, t) => () => (t || e((t = {
            exports: {}
        }).exports, t), t.exports),
        oe = (e, t) => {
            for (var r in t) v(e, r, {
                get: t[r],
                enumerable: !0
            })
        },
        ae = (e, t, r, o) => {
            if (t && typeof t == "object" || typeof t == "function")
                for (let a of ee(t)) !re.call(e, a) && a !== r && v(e, a, {
                    get: () => t[a],
                    enumerable: !(o = z(t, a)) || o.enumerable
                });
            return e
        };
    var se = (e, t, r) => (r = e != null ? Z(te(e)) : {}, ae(t || !e || !e.__esModule ? v(r, "default", {
        value: e,
        enumerable: !0
    }) : r, e));
    var l = (e, t, r) => new Promise((o, a) => {
        var u = f => {
                try {
                    s(r.next(f))
                } catch (x) {
                    a(x)
                }
            },
            n = f => {
                try {
                    s(r.throw(f))
                } catch (x) {
                    a(x)
                }
            },
            s = f => f.done ? o(f.value) : Promise.resolve(f.value).then(u, n);
        s((r = r.apply(e, t)).next())
    });
    var F = T((A, U) => {
        function Y(e, t) {
            if (!e) return [];
            let r = e.slice(0, t);
            return r.length ? [r].concat(Y(e.slice(t, e.length), t)) : e
        }
        A = U.exports = {
            chunk: Y
        }
    });
    var N = T((q, $) => {
        var le = e => t => new Promise(r => setTimeout(() => r(t), e)),
            me = e => e.then(t => ({
                status: "fulfilled",
                value: t
            })).catch(t => ({
                status: "rejected",
                reason: t
            }));
        q = $.exports = {
            sleep: le,
            reflect: me
        }
    });
    var L = T((j, H) => {
        var pe = e => e(),
            ie = e => t => r => e(t(r));
        j = H.exports = {
            identity: pe,
            compose: ie
        }
    });
    var B = T((K, V) => {
        var {
            chunk: xe
        } = F(), {
            sleep: ce,
            reflect: he
        } = N(), {
            identity: Q,
            compose: ye
        } = L(), g = [], Oe = e => t => Promise.all([...t, ...e]), Se = (e, t, r, o) => {
            let a, u, n = "	";
            return o === R.PromiseAllSettled ? (a = ye(he)(Q), u = `f => 
    ${n.repeat(2)}f()
    ${n.repeat(3)}.then(value => ({ status: 'fulfilled', value }))
    ${n.repeat(3)}.catch(reason => ({ status: "rejected", reason }))`) : (a = Q, u = "f => f()"), t === 0 ? (e = Promise.all(r[0].map(a)), g.push(`Promise.all( [ ${r[0].join(", ")} ]
      ${n.repeat(1)}.map(${u})
      )`)) : (e = e.then(s => Oe(r[t].map(a))(s)), g.push(`.then((res) => Promise.all( [ ...res, ...[ ${r[t].join(", ")} ]
      ${n.repeat(1)}.map(${u})
      ]))`)), e
        }, ge = (e, t, r, o) => (o && (e = e.then(a => o(a.slice(-r[t].length), t, a).then(() => a)), g.push(`.then((res) => {
      		return callback(chunkResults, ${t}, allResults).then(() => res);
        })`)), e), De = (e, t) => (t !== void 0 && (e = e.then(ce(t)), g.push(`.then((res) => new Promise(resolve => setTimeout(() => resolve(res), ${t})))`)), e), R = {
            PromiseAll: "PromiseAll",
            PromiseAllSettled: "PromiseAllSettled"
        }, Te = (e, {
            concurrent: t = 1 / 0,
            sleepMs: r,
            callback: o,
            promiseFlavor: a = R.PromiseAll,
            logMe: u = !1
        } = {}) => {
            let n = xe(e, t),
                s = Promise.resolve();
            for (let f = 0; f <= n.length - 1; f++) s = Se(s, f, n, a), s = ge(s, f, n, o), s = De(s, r);
            return u && console.log(g.join(`
`)), s
        }, Ee = class extends Error {};
        K = V.exports = {
            chunkPromise: Te,
            PromiseFlavor: R,
            ChunkPromiseCallbackForceStopError: Ee
        }
    });
    var w = "WebPixel::Render";
    var C = e => shopify.extend(w, e);
    var E = {
        CHECKOUT_COMPLETED: "checkout_completed",
        PRODUCT_REMOVED_FROM_CART: "product_removed_from_cart",
        PRODUCT_ADDED_TO_CART: "product_added_to_cart"
    };
    var c = (e, t = null, r = null) => {
        let o = new URL(e);
        return t && (o.search = new URLSearchParams(t).toString()), r && (o.hash = new URLSearchParams(r).toString()), o.toString()
    };
    var d = e => (t, r) => {
        if (!e(t)) throw r
    };
    var P = e => !isNaN(new Date(e).getTime());
    var $t = d(P);

    function I(e) {
        "@babel/helpers - typeof";
        return I = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
            return typeof t
        } : function(t) {
            return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t
        }, I(e)
    }

    function S(e, t) {
        if (t.length < e) throw new TypeError(e + " argument" + (e > 1 ? "s" : "") + " required, but only " + t.length + " present")
    }

    function M(e) {
        S(1, arguments);
        var t = Object.prototype.toString.call(e);
        return e instanceof Date || I(e) === "object" && t === "[object Date]" ? new Date(e.getTime()) : typeof e == "number" || t === "[object Number]" ? new Date(e) : ((typeof e == "string" || t === "[object String]") && typeof console != "undefined" && (console.warn("Starting with v2.0.0-beta.1 date-fns doesn't accept strings as date arguments. Please use `parseISO` to parse strings. See: https://github.com/date-fns/date-fns/blob/master/docs/upgradeGuide.md#string-arguments"), console.warn(new Error().stack)), new Date(NaN))
    }

    function k(e) {
        return S(1, arguments), M(e).getTime() > Date.now()
    }
    var ue = d(k);
    var sr = d(e => typeof e == "number");
    var ur = d(e => typeof e == "string");
    var W = /^(?:[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}|00000000-0000-0000-0000-000000000000)$/i;

    function de(e) {
        return typeof e == "string" && W.test(e)
    }
    var b = de;
    var yr = d(b);
    var gr = d(e => typeof e == "boolean");
    var Ie = se(B(), 1);
    var h = e => Object.fromEntries(Object.entries(e).map(([t, r]) => {
        let o = r;
        return r === "true" && (o = !0), r === "false" && (o = !1), [t, o]
    }));
    var ke = "__lc_st_customer_id",
        _e = (e, t) => l(null, null, function*() {
            if (e != null && e.getItem) try {
                let r = yield e.getItem(t);
                return r === "null" ? null : r
            } catch (r) {
                console.error(r)
            }
        }),
        y = e => l(null, null, function*() {
            return _e(e, ke)
        });
    var _ = e => ({
        cart_lines: [{
            total_price: e.cost.totalAmount.amount,
            currency: e.cost.totalAmount.currencyCode,
            quantity: e.quantity,
            product: {
                id: e.merchandise.product.id,
                title: e.merchandise.product.title,
                sku: e.merchandise.sku,
                variant_id: e.merchandise.id
            }
        }]
    });
    var X = (e, t = {}) => r => l(null, null, function*() {
        let {
            settings: o,
            browser: a
        } = e, {
            storeUuid: u
        } = h(o), n = yield y(a.localStorage);
        if (!n) return;
        let s = c(`${t.ECOMMERCE_TRACKER_API_URL}/v1/event`);
        try {
            let f = r.data.checkout,
                m = yield fetch(s, {
                    method: "POST",
                    body: JSON.stringify({
                        customer_id: n,
                        platform: "shopify",
                        occurred_at: r.timestamp,
                        event: {
                            name: "store_order_was_created",
                            data: {
                                order: {
                                    id: f.order.id,
                                    currency: f.currencyCode,
                                    total_price: f.totalPrice.amount,
                                    line_items: f.lineItems.map(p => ({
                                        title: p.title,
                                        quantity: p.quantity,
                                        price: p.variant.price.amount,
                                        sku: p.variant.sku || void 0,
                                        variant_id: p.variant.id
                                    }))
                                }
                            }
                        }
                    }),
                    headers: {
                        "Content-Type": "application/json",
                        "X-Store-UUID": u
                    }
                });
            if (m.ok) return;
            let O = yield m.text().catch(p => p);
            console.error("Request failed", O)
        } catch (f) {
            console.error("Checkout Completed Error:", f)
        }
    });
    var J = (e, t = {}) => r => l(null, null, function*() {
        let {
            settings: o,
            browser: a
        } = e, {
            storeUuid: u
        } = h(o), n = yield y(a.localStorage);
        if (n) try {
            let s = r.data;
            if (!s.cartLine) return;
            let f = _(s.cartLine),
                m = yield fetch(c(`${t.ECOMMERCE_TRACKER_API_URL}/v1/event`), {
                    method: "POST",
                    body: JSON.stringify({
                        customer_id: n,
                        platform: "shopify",
                        occurred_at: r.timestamp,
                        event: {
                            name: "store_product_removed_from_cart",
                            data: f
                        }
                    }),
                    headers: {
                        "Content-Type": "application/json",
                        "X-Store-UUID": u
                    }
                });
            if (m.ok) return;
            let O = yield m.text();
            console.error("Request failed", O)
        } catch (s) {
            console.error("Product Removed From Cart Error:", s)
        }
    });
    var G = (e, t = {}) => r => l(null, null, function*() {
        let {
            settings: o,
            browser: a
        } = e, {
            storeUuid: u
        } = h(o), n = yield y(a.localStorage);
        if (n) try {
            let s = r.data;
            if (!s.cartLine) return;
            let f = _(s.cartLine),
                m = yield fetch(c(`${t.ECOMMERCE_TRACKER_API_URL}/v1/event`), {
                    method: "POST",
                    body: JSON.stringify({
                        customer_id: n,
                        platform: "shopify",
                        occurred_at: r.timestamp,
                        event: {
                            name: "store_product_added_to_cart",
                            data: f
                        }
                    }),
                    headers: {
                        "Content-Type": "application/json",
                        "X-Store-UUID": u
                    }
                });
            if (m.ok) return;
            let O = yield m.text();
            console.error("Request failed", O)
        } catch (s) {
            console.error("Product Added To Cart Error:", s)
        }
    });
    var D = {};
    oe(D, {
        API_URL: () => Ce,
        ECOMMERCE_TRACKER_API_URL: () => ve
    });
    var ve = "https://api.text.com/ecommerce-tracker",
        Ce = "https://shopify.livechatinc.com";
    C(e => {
        let {
            analytics: t
        } = e;
        t.subscribe(E.CHECKOUT_COMPLETED, X(e, D)), t.subscribe(E.PRODUCT_REMOVED_FROM_CART, J(e, D)), t.subscribe(E.PRODUCT_ADDED_TO_CART, G(e, D))
    });
})();
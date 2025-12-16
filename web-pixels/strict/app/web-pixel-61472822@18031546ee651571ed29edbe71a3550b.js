(() => {
    var ne = Object.create;
    var mt = Object.defineProperty;
    var se = Object.getOwnPropertyDescriptor;
    var ce = Object.getOwnPropertyNames;
    var ue = Object.getPrototypeOf,
        le = Object.prototype.hasOwnProperty;
    var m = (t, e) => () => (t && (e = t(t = 0)), e);
    var fe = (t, e) => () => (e || t((e = {
        exports: {}
    }).exports, e), e.exports);
    var de = (t, e, i, o) => {
        if (e && typeof e == "object" || typeof e == "function")
            for (let a of ce(e)) !le.call(t, a) && a !== i && mt(t, a, {
                get: () => e[a],
                enumerable: !(o = se(e, a)) || o.enumerable
            });
        return t
    };
    var pe = (t, e, i) => (i = t != null ? ne(ue(t)) : {}, de(e || !t || !t.__esModule ? mt(i, "default", {
        value: t,
        enumerable: !0
    }) : i, t));
    var r = (t, e, i) => new Promise((o, a) => {
        var s = f => {
                try {
                    c(i.next(f))
                } catch (d) {
                    a(d)
                }
            },
            n = f => {
                try {
                    c(i.throw(f))
                } catch (d) {
                    a(d)
                }
            },
            c = f => f.done ? o(f.value) : Promise.resolve(f.value).then(s, n);
        c((i = i.apply(t, e)).next())
    });

    function ge() {
        _e(), ye(), Ee(), Oe()
    }

    function _e() {
        try {
            Object.prototype.entries || Object.defineProperty(Object.prototype, "entries", {
                configurable: !0,
                writable: !0,
                value() {
                    return he(this)
                }
            })
        } catch (t) {}
    }

    function he(t) {
        return Object.keys(t).reduce((e, i) => (e.push([i, t[i]]), e), [])
    }

    function ye() {
        try {
            Object.prototype.values || Object.defineProperty(Object.prototype, "values", {
                configurable: !0,
                writable: !0,
                value() {
                    return me(this)
                }
            })
        } catch (t) {}
    }

    function me(t) {
        return Object.keys(t).reduce((e, i) => (e.push(t[i]), e), [])
    }

    function Ee() {
        try {
            Object.prototype.fromEntries || Object.defineProperty(Object.prototype, "fromEntries", {
                configurable: !0,
                writable: !0,
                value(t) {
                    return Se(t)
                }
            })
        } catch (t) {}
    }

    function Se(t) {
        return t ? t.reduce((e, [i, o]) => (e[i] = o, e), {}) : {}
    }

    function Oe() {
        try {
            Array.prototype.flat || Object.defineProperty(Array.prototype, "flat", {
                configurable: !0,
                writable: !0,
                value() {
                    return Pe(this)
                }
            })
        } catch (t) {}
    }

    function Pe(t) {
        return t.reduce((e, i) => e.concat(i), [])
    }
    var Et = m(() => {
        ge()
    });
    var St, Ot = m(() => {
        St = "WebPixel::Render"
    });
    var V, Pt = m(() => {
        Ot();
        V = t => shopify.extend(St, t)
    });
    var At = m(() => {
        Pt()
    });
    var Ct = m(() => {
        At()
    });

    function xt(t) {
        return r(this, null, function*() {
            let e = [t.cookie.get(Ae), t.cookie.get(Ce)];
            return Promise.all(e).then(([i, o]) => {
                let a = String(i).toLowerCase() === "true",
                    s = new Set(o.split(","));
                return new H(a, s)
            })
        })
    }

    function E(t, e) {
        return new X(t, e)
    }

    function It() {
        return new H(!1, new Set)
    }
    var Ae, Ce, xe, D, X, H, C = m(() => {
        F();
        Ae = "_stag_log_v", Ce = "_stag_log_ctx", xe = "https://ct.pinterest.com/stats/", D = {
            info: "INFO",
            error: "ERROR"
        }, X = class {
            constructor(e, i) {
                this._conf = e, this._context = i
            }
            get conf() {
                return this._conf
            }
            set conf(e) {
                this._conf = e
            }
            get context() {
                return this._context
            }
            set context(e) {
                this._context = e
            }
            print(...e) {
                (this.conf.verbose || this.conf.enabledCtx.has(this.context)) && console.log(`[${D.info}] ${this.context}:`, ...e)
            }
            info(e, i = "") {
                return r(this, null, function*() {
                    (this.conf.verbose || this.conf.enabledCtx.has(this.context)) && console.log(`[${D.info}] ${e}`, i);
                    try {
                        let o = i ? `${i==null?void 0:i.name}: ${i==null?void 0:i.message}` : "";
                        return yield this.sendToServer(D.info, e, o)
                    } catch (o) {
                        return Promise.resolve()
                    }
                })
            }
            error(e, i = "") {
                return r(this, null, function*() {
                    (this.conf.verbose || this.conf.enabledCtx.has(this.context)) && console.error(`[${D.error}] ${e}`, i);
                    try {
                        let o = i ? `${i==null?void 0:i.name}: ${i==null?void 0:i.message}` : "";
                        return yield this.sendToServer(D.error, e, o)
                    } catch (o) {
                        return Promise.resolve()
                    }
                })
            }
            sendToServer(e, i, o = "") {
                return r(this, null, function*() {
                    if (!e || !i) return Promise.resolve();
                    let a = Y(i, 250),
                        s = Y(o, 1e3),
                        n = {
                            messageType: e,
                            message: a,
                            log: `[STAG][${this._context}]${s}`,
                            version: yield G()
                        };
                    try {
                        return fetch(xe, {
                            method: "POST",
                            body: JSON.stringify(n)
                        })
                    } catch (c) {
                        return Promise.resolve()
                    }
                })
            }
        }, H = class t {
            constructor(e = !1, i = new Set) {
                this._verbose = e, this._enabledCtx = t.parseCtx(i)
            }
            get verbose() {
                return this._verbose
            }
            set verbose(e) {
                this._verbose = e
            }
            get enabledCtx() {
                return this._enabledCtx
            }
            set enabledCtx(e) {
                this._enabledCtx = t.parseCtx(e)
            }
            update(e) {
                this.verbose = e.verbose, this.enabledCtx = e.enabledCtx
            }
            static parseCtx(e) {
                return e instanceof Set ? e : Array.isArray(e) ? new Set(e) : typeof e == "string" && e.trim().length > 0 ? new Set(e.split(",")) : new Set
            }
        }
    });
    var Tt, Dt, Ft, p, O, K, g, x, Ie, l, Li, N = m(() => {
        C();
        Tt = /^[a-f0-9]{64}$/i, Dt = /^[a-f0-9]{40}$/i, Ft = /^[a-f0-9]{32}$/i, p = {
            EPIK: "_epik",
            DERIVED_EPIK: "_derived_epik",
            UNAUTH: "_pin_unauth"
        }, O = {
            EPIK: "_epik_ls",
            DERIVED_EPIK: "_derived_epik_ls",
            UNAUTH: "_pin_unauth_ls"
        }, K = {
            LOCAL_STORAGE_ONLY: "ls",
            COOKIE_ONLY: "fpc",
            COOKIE_AND_LOCAL_STORAGE: "fpc_ls"
        }, g = {
            NATIVE_CHECKOUT: "ssp_nsc",
            IAB_ANDROID: "ssp_iaba",
            IAB_IOS: "ssp_iabi"
        }, x = "is_eu", Ie = {
            aemEnabled: !1,
            aemFnLnEnabled: !1,
            aemPhEnabled: !1,
            aemGeEnabled: !1,
            aemDbEnabled: !1,
            aemLocEnabled: !1,
            aemExternalIdEnabled: !1,
            isEu: void 0,
            epikDataSource: void 0,
            derivedEpikDataSource: void 0,
            unauthIdDataSource: void 0,
            piaaEndPoint: void 0
        }, l = {
            loggerConf: It(),
            tagConfig: Ie,
            version: "",
            user_data: {}
        }, Li = E(l.loggerConf, "default")
    });

    function v(t) {
        return r(this, null, function*() {
            yield jt(t);
            let e = $t(t);
            u.print("Sending payload to Waltz", e, t);
            let i = JSON.parse(JSON.stringify(Z));
            if (e.length < Nt && (yield w(e, i)), i.success || (yield we(t, i)), e.length >= Nt && !i.success) {
                yield u.error("Sending normal request to Waltz failed. Last resort: sending reduced payload");
                try {
                    let o = Mt(t),
                        a = $t(o);
                    yield w(a, i)
                } catch (o) {
                    u.print("Failed while sending GET request with reduced payload", o)
                }
            }
            if (!i.success) yield u.error("Unable to send a request to Waltz server");
            else if (!i.sendCookies || i.sendJson) {
                let o = `Initial attempt to send payload failed. Succeeded with:
    Method: ${i.method}, Cookies sent: ${i.sendCookies}, Json payload: ${i.sendJson}`;
                yield u.info(o)
            } else u.print(`Successfully sent payload to Waltz using default options. Method: ${i.method}`);
            yield Re(t)
        })
    }

    function w(t, e) {
        return r(this, null, function*() {
            typeof e == "undefined" && (e = JSON.parse(JSON.stringify(Z))), e.method = "GET";
            try {
                yield wt(t, e), e.success || (e.sendCookies = !1, yield wt(t, e))
            } catch (i) {
                yield u.info("Failed while sending GET request", i)
            }
            return e
        })
    }

    function we(t, e) {
        return r(this, null, function*() {
            typeof e == "undefined" && (e = JSON.parse(JSON.stringify(Z))), e.method = "POST";
            let i = [
                [!0, !1],
                [!1, !1],
                [!0, !0],
                [!1, !0]
            ];
            for (let o = 0; o < i.length && !e.success; o++) try {
                e.sendCookies = i[o][0], e.sendJson = i[o][1], yield Le(t, e)
            } catch (a) {
                yield u.info("Failed while sending POST request", a)
            }
            return e
        })
    }

    function wt(t, e) {
        return r(this, null, function*() {
            try {
                let i = {
                    method: "GET",
                    credentials: e.sendCookies ? "include" : "omit"
                };
                e.response = yield fetch(t, i), e.success = !!e.response.ok
            } catch (i) {
                yield u.info(`Unable to send a GET request to Waltz server. Cookies enabled: ${e.sendCookies}`, i), e.success = !1
            }
            return e
        })
    }

    function Le(t, e) {
        return r(this, null, function*() {
            try {
                let i = kt,
                    o = {
                        method: "POST",
                        credentials: e.sendCookies ? "include" : "omit",
                        headers: {
                            "Content-Type": e.sendJson ? "application/json" : "application/x-www-form-urlencoded"
                        },
                        body: e.sendJson ? JSON.stringify(t) : $e(t)
                    };
                e.response = yield fetch(i, o), e.success = !!e.response.ok
            } catch (i) {
                yield u.info(`Unable to send a POST request to Waltz server. Cookies enabled: ${e.sendCookies}`, i), e.success = !1
            }
            return e
        })
    }

    function $e(t) {
        let e = it(t);
        return new URLSearchParams(Object.fromEntries(e))
    }

    function Re(t) {
        return r(this, null, function*() {
            try {
                if (l.env === "dev") {
                    let e = JSON.stringify({
                        parsedEvent: t
                    });
                    yield u.info("Raw event", e)
                }
            } catch (e) {
                u.print("Failed to send debug data", e)
            }
        })
    }

    function tt(t) {
        return r(this, null, function*() {
            let e = new TextEncoder().encode(t),
                i = yield crypto.subtle.digest("SHA-256", e);
            return Array.from(new Uint8Array(i)).map(a => a.toString(16).padStart(2, "0")).join("")
        })
    }

    function P(t) {
        return r(this, null, function*() {
            return t ? tt(t.trim().toLowerCase()) : ""
        })
    }

    function Lt(t) {
        return r(this, null, function*() {
            if (t == null) return t;
            let e = t.toString().trim().toLowerCase();
            return e === "" || Tt.test(e) || Dt.test(e) || Ft.test(e) ? e : tt(e)
        })
    }

    function Ue(t) {
        return r(this, null, function*() {
            if (t instanceof Array) {
                let e = [];
                for (let i = 0; i < t.length; i += 1) {
                    let o = Lt(t[i]);
                    e.push(o)
                }
                return Promise.all(e)
            }
            return Lt(t)
        })
    }

    function G() {
        return r(this, null, function*() {
            let t = `stag-${l.env}-${l.majorVersion}.${l.minorVersion}`;
            return (yield tt(t)).substring(0, 8)
        })
    }

    function et() {
        return !0
    }

    function jt(t, e = 10, i = 0) {
        return r(this, null, function*() {
            i > e || (b in t && (t[b] = yield Ue(t[b])), yield Promise.all(Object.values(t).filter(o => !Array.isArray(o) && o === Object(o)).map(o => r(null, null, function*() {
                return jt(o, e, i + 1)
            }))))
        })
    }

    function it(t) {
        return Object.entries(t).map(([e, i]) => [e, typeof i == "object" ? JSON.stringify(i) : i])
    }

    function Ht(t, e = !1) {
        return r(this, null, function*() {
            try {
                let i = Mt(t);
                i.event && delete i.event, e && (i[Fe.SKIP_TAG_CONFIG] = !0);
                let o = Gt(De, it(i));
                u.print(`Retrieving data from URL: ${o}`);
                let a = yield w(o);
                if (!a || !a.success) yield u.info("Fetch response from /user is empty");
                else return yield a.response
            } catch (i) {
                yield u.error("Failed to fetch info from /user endpoint", i)
            }
            return Promise.resolve()
        })
    }

    function $t(t) {
        return Gt(kt, it(t))
    }

    function Gt(t, e) {
        let i = e.map(([o, a]) => `${o}=${encodeURIComponent(a)}`).join("&");
        return `${t}?${i}`
    }

    function Kt() {
        return {
            cb: `${Date.now()}`,
            ed: {
                np: "shopify-web-pixel",
                user_data: {
                    em: []
                }
            },
            ad: {},
            pd: {
                np: "shopify-web-pixel"
            },
            ov: {
                tkp: "stag"
            }
        }
    }

    function Mt(t) {
        let e = JSON.parse(JSON.stringify(t)),
            i = e.ed,
            o = e.pd,
            a = e.ad;
        return i && (i.user_data && delete i.user_data, i.line_items && delete i.line_items, i.collection_product_ids && delete i.collection_product_ids), a && a.ua && delete a.ua, o && (o.client_user_agent && delete o.client_user_agent, o.fn && delete o.fn, o.ln && delete o.ln, o.ph && delete o.ph, o.ct && delete o.ct, o.st && delete o.st, o.zp && delete o.zp, o.country && delete o.country), e.ov && delete e.ov, at(e)
    }

    function W(t, e) {
        let i = ke(t, e);
        return i ? i[0] : null
    }

    function ke(t, e) {
        var o, a, s;
        let i = (s = (a = (o = t == null ? void 0 : t.context) == null ? void 0 : o.document) == null ? void 0 : a.location) == null ? void 0 : s.search;
        return je(i, e)
    }

    function je(t, e) {
        return I(t) || I(e) ? [] : (t.startsWith("?") ? t.substring(1) : t).split("&").map(o => o.split("=")).filter(([o]) => J(e, o)).map(([, o]) => o)
    }

    function J(t, e) {
        return t.localeCompare(e, void 0, {
            sensitivity: "base"
        }) === 0
    }

    function L(t, e) {
        return r(this, null, function*() {
            var i;
            try {
                if (!(t != null && t.cookie)) return u.print("Cookies are not available"), Promise.resolve();
                if (A()) return yield(i = t == null ? void 0 : t.cookie) == null ? void 0 : i.get(e)
            } catch (o) {
                yield u.error(`Failed to get a cookie: ${e}`, o)
            }
            return Promise.resolve()
        })
    }

    function z(a, s, n) {
        return r(this, arguments, function*(t, e, i, o = M) {
            var c;
            try {
                if (!(t != null && t.cookie)) return u.print("Cookies are not available"), Promise.resolve();
                if (A()) {
                    let f = `${e}=${i}; expires=${o.toUTCString()}; path=/;`;
                    return u.print(`Setting cookie: ${f}`), yield(c = t == null ? void 0 : t.cookie) == null ? void 0 : c.set(f)
                }
            } catch (f) {
                yield u.error("Failed to write cookie", f)
            }
            return Promise.resolve()
        })
    }

    function He(t, e) {
        return r(this, null, function*() {
            var i;
            try {
                return t != null && t.cookie ? yield(i = t == null ? void 0 : t.cookie) == null ? void 0 : i.set(e, ""): (u.print("Cookies are not available"), Promise.resolve())
            } catch (o) {
                yield u.error(`Failed to delete value from cookies: ${e}`, o)
            }
            return Promise.resolve()
        })
    }

    function $(t, e) {
        return r(this, null, function*() {
            var i;
            try {
                if (!(t != null && t.sessionStorage)) return u.print("Session storage is not available"), Promise.resolve();
                if (A()) return yield(i = t == null ? void 0 : t.sessionStorage) == null ? void 0 : i.getItem(e)
            } catch (o) {
                yield u.error("Failed to read from session storage", o)
            }
            return Promise.resolve()
        })
    }

    function R(t, e, i) {
        return r(this, null, function*() {
            var o;
            try {
                if (!(t != null && t.sessionStorage)) return u.print("Session storage is not available"), Promise.resolve();
                if (A()) return u.print(`Writing to session storage: ${e}:${i}`), yield(o = t == null ? void 0 : t.sessionStorage) == null ? void 0 : o.setItem(e, i)
            } catch (a) {
                yield u.error("Failed to write to session storage", a)
            }
            return Promise.resolve()
        })
    }

    function Rt(t, e) {
        return r(this, null, function*() {
            var i;
            try {
                return t != null && t.sessionStorage ? yield(i = t == null ? void 0 : t.sessionStorage) == null ? void 0 : i.removeItem(e): (u.print("Session storage is not available"), Promise.resolve())
            } catch (o) {
                yield u.error(`Failed to delete value from session storage: ${e}`, o)
            }
            return Promise.resolve()
        })
    }

    function U(t, e, i) {
        return r(this, null, function*() {
            var o;
            try {
                if (!(t != null && t.localStorage)) return u.print("Local storage is not available"), Promise.resolve();
                let a = yield k(t);
                if (zt() && !a && e) return u.print(`Writing to local storage: ${e}:${i}`), yield(o = t == null ? void 0 : t.localStorage) == null ? void 0 : o.setItem(e, Ge(i));
                u.print(`Can't write entry to local storage: ${e}:${i}. Is EU: ${a}`), yield j()
            } catch (a) {
                yield u.error("Failed to write to session storage", a)
            }
            return Promise.resolve()
        })
    }

    function Ge(t) {
        if (!t) return "";
        try {
            return JSON.stringify({
                value: t,
                expires: M
            })
        } catch (e) {
            return u.print("Failed to format local storage value"), t
        }
    }

    function Wt(t, e) {
        return r(this, null, function*() {
            try {
                if (!(t != null && t.localStorage)) return u.print("Local storage is not available"), Promise.resolve();
                let i = yield k(t);
                if (zt() && !i) return yield Ke(t, e)
            } catch (i) {
                yield u.error(`Failed to read entry from local storage: ${e}.`, i)
            }
            return Promise.resolve()
        })
    }

    function Ke(t, e) {
        return r(this, null, function*() {
            var i;
            if (!e) return "";
            try {
                let o = yield(i = t == null ? void 0 : t.localStorage) == null ? void 0 : i.getItem(e);
                try {
                    if (I(o)) return "";
                    let a = JSON.parse(o, (s, n) => s === "expires" ? new Date(n) : n);
                    return a && a.expires >= new Date ? a.value : yield Jt(t, e)
                } catch (a) {
                    return u.print(`Local storage value is not a JSON or format not expected. Key: ${e}; Value: ${o}`, a), o.startsWith("{") || (u.print("Overwriting local storage value as Json"), yield U(t, e, o)), o
                }
            } catch (o) {
                yield u.error(`Unexpected error when parsing local storage value with key=${e}`, o)
            }
            return ""
        })
    }

    function Jt(t, e) {
        return r(this, null, function*() {
            var i;
            try {
                return t != null && t.localStorage ? yield(i = t == null ? void 0 : t.localStorage) == null ? void 0 : i.removeItem(e): (u.print("Local storage is not available"), Promise.resolve())
            } catch (o) {
                yield u.error(`Failed to delete value from session storage: ${e}`, o)
            }
            return Promise.resolve()
        })
    }

    function k(t) {
        return r(this, null, function*() {
            if (l.tagConfig.isEu !== void 0) return l.tagConfig.isEu;
            if (!(t != null && t.sessionStorage)) return !0;
            let e = yield $(t, x);
            return ot(e)
        })
    }

    function ot(t) {
        return !(t === !1 || t === 0 || typeof t == "string" && t.trim().toLowerCase() === "false")
    }

    function B(t) {
        if (!t) return "";
        let e = Ne[t];
        return u.print("Shop event name: ", t), u.print("Pin event name: ", e), e || ""
    }

    function A() {
        return !0
    }

    function zt() {
        return !0
    }

    function j(t) {
        return r(this, null, function*() {
            try {
                let e = Object.values(p).concat(Object.values(O)).map(i => Jt(t, i));
                return yield Promise.all(e)
            } catch (e) {
                yield u.error("Failed to clear 1p local storage")
            }
            return Promise.resolve()
        })
    }

    function Me(t) {
        return r(this, null, function*() {
            try {
                let e = Object.values(g).map(i => Rt(t, i));
                return e.push(Rt(t, x)), yield Promise.all(e)
            } catch (e) {
                yield u.error("Failed to clear 1p session storage")
            }
            return Promise.resolve()
        })
    }

    function We(t) {
        return r(this, null, function*() {
            try {
                let e = Object.values(p).map(i => He(t, i));
                return yield Promise.all(e)
            } catch (e) {
                yield u.error("Failed to clear 1p cookies")
            }
            return Promise.resolve()
        })
    }

    function Bt(t) {
        return r(this, null, function*() {
            return Promise.all([We(t), Me(t), j(t)])
        })
    }

    function qt(t) {
        return t === void 0 || Number(t) !== t ? !1 : new Date().getTime() - t <= Te
    }

    function Vt(t) {
        u.print("Identifiers in context: ", l.user_data), I(l.user_data) || Object.assign(t.pd, l.user_data)
    }

    function at(t) {
        return Q(t, 10, 0)
    }

    function Q(t, e = 10, i = 0) {
        return i >= e || Xt(t) || t !== Object(t) ? t : Array.isArray(t) ? t.map(o => Q(o, e, i + 1)).filter(o => !I(o)) : Object.fromEntries(Object.entries(t).map(([o, a]) => [o, Q(a, e, i + 1)]).filter(([, o]) => !I(o)))
    }

    function I(t) {
        return t === 0 || t === !1 ? !1 : Array.isArray(t) ? t.length === 0 : t === Object(t) ? Object.keys(t).length === 0 : !t
    }

    function Xt(t) {
        return typeof t == "string" || t instanceof String
    }

    function Yt(t, e = 2e3, i = 150) {
        return r(this, null, function*() {
            if (t()) return Promise.resolve();
            let o = Date.now(),
                a = s => {
                    t() || Date.now() - o > e ? s() : (u.print("Waiting for condition: ", t), setTimeout(() => a(s), i))
                };
            return new Promise(a)
        })
    }

    function Y(t, e) {
        if (!t) return "";
        let i = Xt(t) ? t : JSON.stringify(t);
        return i.length > e && (i = `[TRIMMED]${i.substring(0,e)}`), i
    }

    function bt(t) {
        return !t || typeof t != "number" ? t : Math.round((t + Number.EPSILON) * 100) / 100
    }
    var u, Te, Nt, b, Ut, kt, De, Fe, Z, Ne, M, F = m(() => {
        N();
        C();
        u = E(l.loggerConf, "utils"), Te = 3e5, Nt = 1400, b = "em", Ut = "https://ct.pinterest.com", kt = `${Ut}/v3/`, De = `${Ut}/user/`, Fe = {
            SKIP_TAG_CONFIG: "stc"
        }, Z = {
            success: !1,
            method: "GET",
            sendCookies: !0,
            sendJson: !1,
            response: void 0
        }, Ne = {
            checkout_address_info_submitted: "",
            checkout_completed: "Checkout",
            checkout_contact_info_submitted: "",
            checkout_shipping_info_submitted: "",
            checkout_started: "InitiateCheckout",
            collection_viewed: "ViewCategory",
            page_viewed: "PageVisit",
            payment_info_submitted: "AddPaymentInfo",
            product_added_to_cart: "AddToCart",
            product_viewed: "PageVisit",
            search_submitted: "Search"
        }, M = new Date;
        M.setFullYear(M.getFullYear() + 1)
    });

    function Qt(t, e) {
        return r(this, null, function*() {
            var i;
            try {
                if (!t || !e) {
                    _.print("Init or param object is not available");
                    return
                }
                let o = e.pd,
                    a = (i = t == null ? void 0 : t.data) == null ? void 0 : i.customer;
                a && (o.external_id = yield P(a == null ? void 0 : a.id), o.em = yield P(a == null ? void 0 : a.email), o.fn = yield P(a == null ? void 0 : a.firstName), o.ln = yield P(a == null ? void 0 : a.lastName), o.ph = yield P(a == null ? void 0 : a.phone))
            } catch (o) {
                yield _.error("Failed to parse init object in shop_parser", o)
            }
        })
    }

    function Zt(t, e) {
        return r(this, null, function*() {
            try {
                yield Be(t, e), oi(t, e), e.event = e.event || B(t == null ? void 0 : t.name);
                let i = e.event,
                    o = ["Checkout", "InitiateCheckout", "AddPaymentInfo"];
                i ? (i === "AddToCart" && (_.print("Parsing add to cart event:", t), qe(t, e)), o.includes(i) && _.print("Parsing checkout event:", t), i === "ViewCategory" && (_.print("Parsing viewcategory event:", t), Ve(t, e)), i === "Search" && (_.print("Parsing search_submitted event:", t), Xe(t, e)), i === "PageVisit" && (_.print("Parsing page_visit event:", t), Ye(t, e))) : _.print("Can't find the event by name")
            } catch (i) {
                yield _.error("Failed to parse event in shop_parser", i)
            }
        })
    }

    function Be(t, e) {
        return r(this, null, function*() {
            var o, a, s;
            let i = e.ed;
            i.eventID = ((o = e == null ? void 0 : e.ov) == null ? void 0 : o.env) === "dev" ? `stag-${t==null?void 0:t.id}` : t == null ? void 0 : t.id, yield Qe(t, e), (a = t == null ? void 0 : t.data) != null && a.checkout && (yield be((s = t == null ? void 0 : t.data) == null ? void 0 : s.checkout, e))
        })
    }

    function qe(t, e) {
        var a, s, n, c, f, d, y, T;
        let i = e.ed;
        i.timestamp = t == null ? void 0 : t.timestamp, i.currency = (c = (n = (s = (a = t == null ? void 0 : t.data) == null ? void 0 : a.cartLine) == null ? void 0 : s.merchandise) == null ? void 0 : n.price) == null ? void 0 : c.currencyCode, i.line_items = i.line_items || [];
        let o = rt((d = (f = t == null ? void 0 : t.data) == null ? void 0 : f.cartLine) == null ? void 0 : d.merchandise);
        o.product_quantity = (T = (y = t == null ? void 0 : t.data) == null ? void 0 : y.cartLine) == null ? void 0 : T.quantity, i.line_items.push(o)
    }

    function Ve(t, e) {
        var o, a, s, n, c, f;
        let i = e.ed;
        i.category_id = (a = (o = t == null ? void 0 : t.data) == null ? void 0 : o.collection) == null ? void 0 : a.id, i.category_title = (n = (s = t == null ? void 0 : t.data) == null ? void 0 : s.collection) == null ? void 0 : n.title, i.collection_product_ids = (f = (c = t == null ? void 0 : t.data) == null ? void 0 : c.collection) == null ? void 0 : f.productVariants.map(d => d.id).slice(0, Je).join(",")
    }

    function Xe(t, e) {
        var i;
        (i = t == null ? void 0 : t.data) != null && i.searchResult && ii(t.data.searchResult, e)
    }

    function Ye(t, e) {
        var o;
        let i = e.ed;
        if ((t == null ? void 0 : t.name) === "product_viewed") {
            let a = rt((o = t == null ? void 0 : t.data) == null ? void 0 : o.productVariant);
            i.currency = a == null ? void 0 : a.product_currency, i.line_items = i.line_items || [], i.line_items.push(a)
        }
    }

    function be(t, e) {
        return r(this, null, function*() {
            var i, o;
            try {
                let a = e.ed,
                    s = a.user_data || {};
                a.user_data = s, s.em = [t == null ? void 0 : t.email], s.phone = t == null ? void 0 : t.phone, ei(t == null ? void 0 : t.order, e), Ze(t == null ? void 0 : t.lineItems, e), a.order_quantity = a.line_items.map(n => (n == null ? void 0 : n.product_quantity) || 0).reduce((n, c) => n + c), a.value = a.value || ((i = t == null ? void 0 : t.totalPrice) == null ? void 0 : i.amount), a.currency = (o = t == null ? void 0 : t.totalPrice) == null ? void 0 : o.currencyCode
            } catch (a) {
                _.print("Failed to parse checkout object", a)
            }
        })
    }

    function Qe(t, e) {
        return r(this, null, function*() {
            let i = e.pd,
                o = Object.entries(ze).map(n => r(null, [n], function*([a, s]) {
                    try {
                        let c = s.extract(t);
                        c && (i[a] = s.should_hash ? yield P(c): c, l.user_data[a] = i[a])
                    } catch (c) {
                        yield _.error("Failed to parse user identifier fields", c)
                    }
                }));
            return Promise.all(o)
        })
    }

    function Ze(t, e) {
        _.print("Parsing line items:", t), e.ed.line_items = e.ed.line_items || [];
        let i = t.map(a => ti(a));
        e.ed.line_items = e.ed.line_items.concat(i);
        let o = t.map(a => ve(a) || 0).reduce((a, s) => a + s);
        e.ed.value = bt(o), _.print("Parsed line items", e.ed.line_items)
    }

    function ve(t) {
        var e, i;
        try {
            if (!t) return 0;
            let o = ((i = (e = t == null ? void 0 : t.variant) == null ? void 0 : e.price) == null ? void 0 : i.amount) || 0,
                a = (t == null ? void 0 : t.quantity) || 1;
            return o * a
        } catch (o) {
            _.print("Failed to calculate price for line item: ", t)
        }
        return 0
    }

    function ti(t) {
        let e = rt(t == null ? void 0 : t.variant);
        return e.product_name = t == null ? void 0 : t.title, e.line_item_id = t == null ? void 0 : t.id, e.product_quantity = t == null ? void 0 : t.quantity, e
    }

    function ei(t, e) {
        e.ed.order_id = t == null ? void 0 : t.id
    }

    function rt(t) {
        var s, n, c, f, d, y;
        let e = (s = t == null ? void 0 : t.product) == null ? void 0 : s.title,
            i = t == null ? void 0 : t.title,
            o = e || i;
        return e && !e.includes(i) && (o = `${e} - ${i}`), {
            product_name: o,
            product_category: (n = t == null ? void 0 : t.product) == null ? void 0 : n.type,
            product_brand: (c = t == null ? void 0 : t.product) == null ? void 0 : c.vendor,
            product_id: (f = t == null ? void 0 : t.product) == null ? void 0 : f.id,
            product_variant_id: t == null ? void 0 : t.id,
            product_price: (d = t == null ? void 0 : t.price) == null ? void 0 : d.amount,
            product_currency: (y = t == null ? void 0 : t.price) == null ? void 0 : y.currencyCode
        }
    }

    function ii(t, e) {
        let i = e.ed;
        i.search_query = t == null ? void 0 : t.query
    }

    function oi(t, e) {
        var o, a, s, n, c, f, d, y, T, ut, lt, ft, dt, pt, gt, _t, ht, yt;
        let i = e.ad;
        i.ua = (a = (o = t == null ? void 0 : t.context) == null ? void 0 : o.navigator) == null ? void 0 : a.userAgent, i.sh = ((c = (n = (s = t == null ? void 0 : t.context) == null ? void 0 : s.window) == null ? void 0 : n.screen) == null ? void 0 : c.height) || ((d = (f = t == null ? void 0 : t.context) == null ? void 0 : f.window) == null ? void 0 : d.outerHeight), i.sw = ((ut = (T = (y = t == null ? void 0 : t.context) == null ? void 0 : y.window) == null ? void 0 : T.screen) == null ? void 0 : ut.width) || ((ft = (lt = t == null ? void 0 : t.context) == null ? void 0 : lt.window) == null ? void 0 : ft.outerWidth), i.loc = (pt = (dt = t == null ? void 0 : t.context) == null ? void 0 : dt.document) == null ? void 0 : pt.location.href, i.ref = (_t = (gt = t == null ? void 0 : t.context) == null ? void 0 : gt.document) == null ? void 0 : _t.referrer, i.if = !0, i.language = (yt = (ht = t == null ? void 0 : t.context) == null ? void 0 : ht.navigator) == null ? void 0 : yt.language
    }
    var _, Je, ze, vt = m(() => {
        F();
        N();
        C();
        _ = E(l.loggerConf, "shop_parse"), Je = 100, ze = {
            external_id: {
                extract: t => t == null ? void 0 : t.clientId,
                should_hash: !0
            },
            em: {
                extract: t => {
                    var e, i;
                    return (i = (e = t == null ? void 0 : t.data) == null ? void 0 : e.checkout) == null ? void 0 : i.email
                },
                should_hash: !0
            },
            ct: {
                extract: t => {
                    var e, i, o;
                    return (o = (i = (e = t == null ? void 0 : t.data) == null ? void 0 : e.checkout) == null ? void 0 : i.shippingAddress) == null ? void 0 : o.city
                },
                should_hash: !0
            },
            st: {
                extract: t => {
                    var e, i, o;
                    return (o = (i = (e = t == null ? void 0 : t.data) == null ? void 0 : e.checkout) == null ? void 0 : i.shippingAddress) == null ? void 0 : o.province
                },
                should_hash: !0
            },
            country: {
                extract: t => {
                    var e, i, o;
                    return (o = (i = (e = t == null ? void 0 : t.data) == null ? void 0 : e.checkout) == null ? void 0 : i.shippingAddress) == null ? void 0 : o.country
                },
                should_hash: !0
            },
            zp: {
                extract: t => {
                    var e, i, o;
                    return (o = (i = (e = t == null ? void 0 : t.data) == null ? void 0 : e.checkout) == null ? void 0 : i.shippingAddress) == null ? void 0 : o.zip
                },
                should_hash: !0
            },
            ph: {
                extract: t => {
                    var e, i, o;
                    return (o = (i = (e = t == null ? void 0 : t.data) == null ? void 0 : e.checkout) == null ? void 0 : i.shippingAddress) == null ? void 0 : o.phone
                },
                should_hash: !0
            },
            fn: {
                extract: t => {
                    var e, i, o;
                    return (o = (i = (e = t == null ? void 0 : t.data) == null ? void 0 : e.checkout) == null ? void 0 : i.shippingAddress) == null ? void 0 : o.firstName
                },
                should_hash: !0
            },
            ln: {
                extract: t => {
                    var e, i, o;
                    return (o = (i = (e = t == null ? void 0 : t.data) == null ? void 0 : e.checkout) == null ? void 0 : i.shippingAddress) == null ? void 0 : o.lastName
                },
                should_hash: !0
            },
            client_user_agent: {
                extract: t => {
                    var e, i;
                    return (i = (e = t == null ? void 0 : t.context) == null ? void 0 : e.navigator) == null ? void 0 : i.userAgent
                },
                should_hash: !1
            }
        }
    });

    function ie(t, e, i) {
        return r(this, null, function*() {
            try {
                yield ui(t, e, i);
                let o = [];
                return o.push(li(t, e)), o.push(_i(t)), o.push(di(i)), yield Promise.all(o), (yield k(t)) && (yield j()), gi(t, i)
            } catch (o) {
                yield h.error("Failed to parse event in pin_parser", o)
            }
            return Promise.resolve()
        })
    }

    function ui(t, e, i) {
        return r(this, null, function*() {
            try {
                q ? yield Yt(() => q === !1): q = !0, te || (yield pi(t, i), yield fi(t, e), te = !0);
                let o = i.pd;
                o[ee] = yield L(t, p.EPIK), o[ni] = yield L(t, p.UNAUTH), o[ai] = yield L(t, p.DERIVED_EPIK), q = !1
            } catch (o) {
                yield h.info("Failed to load FP cookies", o)
            }
            return Promise.resolve()
        })
    }

    function li(t, e) {
        return r(this, null, function*() {
            var i, o;
            try {
                if (A()) {
                    let a = `${new Date().getTime()}`;
                    W(e, g.NATIVE_CHECKOUT) === "1" && (yield R(t, g.NATIVE_CHECKOUT, a));
                    let s = parseInt(W(e, g.IAB_IOS), 10);
                    qt(s) && (yield R(t, g.IAB_IOS, `${s}`));
                    let n = (o = (i = e == null ? void 0 : e.context) == null ? void 0 : i.document) == null ? void 0 : o.referrer;
                    n && n.startsWith("android-app") && n.includes("com.pinterest") && (yield R(t, g.IAB_ANDROID, a))
                }
            } catch (a) {
                yield h.error("Failed to parse SSP", a)
            }
        })
    }

    function fi(t, e) {
        return r(this, null, function*() {
            let i = W(e, ee);
            return h.print(`Epik is present in URL and is truthy: ${!!i}.`, i), i ? Promise.all([z(t, p.EPIK, i), U(t, O.EPIK, i)]) : Promise.resolve()
        })
    }

    function di(t) {
        return r(this, null, function*() {
            var i, o;
            let e = (o = (i = l) == null ? void 0 : i.tagConfig) == null ? void 0 : o.piaaEndPoint;
            if (e && e.length > 10) try {
                let a = yield w(e);
                if (a && a.success) {
                    let s = a.response,
                        n = JSON.parse(yield s.text());
                    n && (n != null && n.xff) && (t[ci] = n == null ? void 0 : n.xff)
                } else yield h.info("Unable to fetch IP from server")
            } catch (a) {
                yield h.error("piaaEndpointRequestCallBack json error", a)
            }
        })
    }

    function pi(t, e) {
        return r(this, null, function*() {
            try {
                let i = yield Ht(e);
                if (i) {
                    let o = yield i.text(), a = JSON.parse(o);
                    if (Object.entries(a).forEach(([n, c]) => {
                            l.tagConfig[n] = c
                        }), h.print("tag config: ", l.tagConfig), l.tagConfig.isEu === void 0) {
                        let n = ot(a.isEu);
                        l.tagConfig.isEu = n, typeof l.tagConfig.isEu == "boolean" && l.tagConfig.isEu && (yield j()), yield R(t, x, n)
                    }
                    let s = Array.from(i.headers.entries(), ([n, c]) => {
                        h.print(`Waltz response entry: ${n} => ${c}`);
                        let f = [];
                        return J(si, n) && c && (f.push(z(t, p.UNAUTH, c)), f.push(U(t, O.UNAUTH, c))), J(ri, n) && c && (f.push(z(t, p.DERIVED_EPIK, c)), f.push(U(t, O.DERIVED_EPIK, c))), f
                    }).flat();
                    return Promise.all(s)
                }
                yield h.info("Response from /user is empty")
            } catch (i) {
                yield h.error("Failed to call user endpoint", i)
            }
            return Promise.resolve()
        })
    }

    function gi(t, e) {
        return r(this, null, function*() {
            let i = e.ad;
            if (A()) {
                let a = yield $(t, g.NATIVE_CHECKOUT), s = yield $(t, g.IAB_IOS), n = yield $(t, g.IAB_ANDROID);
                a && (i[g.NATIVE_CHECKOUT] = a), s && (i[g.IAB_IOS] = s), n && (i[g.IAB_ANDROID] = n)
            } else yield Bt(t);
            let o = yield k(t);
            return o !== void 0 && (i[x] = o), et() && (i.epikDataSource = l.tagConfig.epikDataSource, i.derivedEpikDataSource = l.tagConfig.derivedEpikDataSource, i.unauthIdDataSource = l.tagConfig.unauthIdDataSource), Promise.resolve()
        })
    }

    function _i(t) {
        return r(this, null, function*() {
            if (!et()) return Promise.resolve();
            try {
                let e = Object.entries(p).map(a => r(null, [a], function*([i, o]) {
                    return hi(t, i, o)
                }));
                return yield Promise.all(e)
            } catch (e) {
                yield h.error("Failed to set datasource flag in automatic data", e)
            }
            return Promise.resolve()
        })
    }

    function hi(t, e, i) {
        return r(this, null, function*() {
            try {
                let o = L(t, i),
                    a = Wt(t, O[e]),
                    [s, n] = yield Promise.all([o, a]), c = !!s, f = !!n;
                switch (i) {
                    case p.EPIK:
                        l.tagConfig.epikDataSource = nt(c, f);
                        break;
                    case p.DERIVED_EPIK:
                        l.tagConfig.derivedEpikDataSource = nt(c, f);
                        break;
                    case p.UNAUTH:
                        l.tagConfig.unauthIdDataSource = nt(c, f);
                        break;
                    default:
                }
            } catch (o) {
                yield h.error(`Failed to set datasource flag for ${e} cookie ${i}`, o)
            }
            return Promise.resolve()
        })
    }

    function nt(t, e) {
        return t && e ? K.COOKIE_AND_LOCAL_STORAGE : t ? K.COOKIE_ONLY : e ? K.LOCAL_STORAGE_ONLY : null
    }
    var ee, ai, ri, ni, si, ci, h, q, te, oe = m(() => {
        F();
        N();
        C();
        ee = "epik", ai = "derived_epik", ri = "Epik", ni = "pin_unauth", si = "Pin-Unauth", ci = "piaa", h = E(l.loggerConf, "pin_parse"), q = !1, te = !1
    });
    var re = fe(ct => {
        Et();
        Ct();
        vt();
        oe();
        F();
        C();
        N();
        l.env = "prod";
        l.majorVersion = 0;
        l.minorVersion = 87;
        var st = `${l.majorVersion}.${l.minorVersion}`,
            S = E(l.loggerConf, "index"),
            ae = !1;
        V(a => r(null, [a], function*({
            analytics: t,
            browser: e,
            settings: i,
            init: o
        }) {
            yield mi(e), S.print("New API: Init object: ", o), S.print(`STAG Version: ${st}`);
            try {
                S.print("Settings: ", i);
                let s = i.tagID,
                    n = Kt();
                n.tid = s, n.ov.version = st, n.ov.env = l.env, n.ad.mh = yield G(), yield Qt(o, n), t.subscribe("all_events", c => r(null, null, function*() {
                    S.print("Shopify event: ", c);
                    let f = B(c == null ? void 0 : c.name);
                    if (f) {
                        let d = JSON.parse(JSON.stringify(n));
                        d.event = f, yield Zt(c, d), yield ie(e, c, d), Vt(d);
                        let y = at(d);
                        S.print(`Parsed event (STAG V.${st}): `, d), f === "PageVisit" && (yield yi(y)), yield v(y)
                    } else S.print("Not a Pinterest Event: ", c)
                }))
            } catch (s) {
                yield S.error("STAG top-level error", s)
            }
        }));

        function yi(t) {
            return r(this, null, function*() {
                var e;
                if (!ae) {
                    ae = !0;
                    try {
                        let i = JSON.parse(JSON.stringify(t));
                        i.event = "init", i.ed && delete i.ed, (e = i == null ? void 0 : i.pd) != null && e.client_user_agent && delete i.pd.client_user_agent, yield v(i)
                    } catch (i) {
                        yield S.error("Failed to emit init event", i)
                    }
                }
            })
        }

        function mi(t) {
            return r(this, null, function*() {
                return xt(t).then(e => {
                    l.loggerConf.update(e)
                })
            })
        }
    });
    var oo = pe(re());
})();
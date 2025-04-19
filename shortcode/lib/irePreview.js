const { toRaw, computed: computed$1, isRef, isReactive, toRef, effectScope, ref, markRaw, hasInjectionContext, inject, watch, reactive, getCurrentScope, onScopeDispose, nextTick, toRefs, defineComponent, openBlock, createElementBlock, createVNode, Transition, withCtx, createElementVNode, toDisplayString, unref, createCommentVNode, Fragment, createTextVNode, normalizeClass, normalizeStyle, renderSlot, createBlock, onMounted, onUnmounted, mergeModels, useModel, withDirectives, renderList, vModelSelect, createStaticVNode, provide, Teleport } = Vue;
/*!
 * pinia v3.0.1
 * (c) 2025 Eduardo San Martin Morote
 * @license MIT
 */
let activePinia;
const setActivePinia = (Le) => activePinia = Le, piniaSymbol = (
  /* istanbul ignore next */
  Symbol()
);
function isPlainObject(Le) {
  return Le && typeof Le == "object" && Object.prototype.toString.call(Le) === "[object Object]" && typeof Le.toJSON != "function";
}
var MutationType;
(function(Le) {
  Le.direct = "direct", Le.patchObject = "patch object", Le.patchFunction = "patch function";
})(MutationType || (MutationType = {}));
function createPinia() {
  const Le = effectScope(!0), _e = Le.run(() => ref({}));
  let ke = [], De = [];
  const Re = markRaw({
    install($e) {
      setActivePinia(Re), Re._a = $e, $e.provide(piniaSymbol, Re), $e.config.globalProperties.$pinia = Re, De.forEach((Be) => ke.push(Be)), De = [];
    },
    use($e) {
      return this._a ? ke.push($e) : De.push($e), this;
    },
    _p: ke,
    // it's actually undefined here
    // @ts-expect-error
    _a: null,
    _e: Le,
    _s: /* @__PURE__ */ new Map(),
    state: _e
  });
  return Re;
}
const noop = () => {
};
function addSubscription(Le, _e, ke, De = noop) {
  Le.push(_e);
  const Re = () => {
    const $e = Le.indexOf(_e);
    $e > -1 && (Le.splice($e, 1), De());
  };
  return !ke && getCurrentScope() && onScopeDispose(Re), Re;
}
function triggerSubscriptions(Le, ..._e) {
  Le.slice().forEach((ke) => {
    ke(..._e);
  });
}
const fallbackRunWithContext = (Le) => Le(), ACTION_MARKER = Symbol(), ACTION_NAME = Symbol();
function mergeReactiveObjects(Le, _e) {
  Le instanceof Map && _e instanceof Map ? _e.forEach((ke, De) => Le.set(De, ke)) : Le instanceof Set && _e instanceof Set && _e.forEach(Le.add, Le);
  for (const ke in _e) {
    if (!_e.hasOwnProperty(ke))
      continue;
    const De = _e[ke], Re = Le[ke];
    isPlainObject(Re) && isPlainObject(De) && Le.hasOwnProperty(ke) && !isRef(De) && !isReactive(De) ? Le[ke] = mergeReactiveObjects(Re, De) : Le[ke] = De;
  }
  return Le;
}
const skipHydrateSymbol = (
  /* istanbul ignore next */
  Symbol()
);
function shouldHydrate(Le) {
  return !isPlainObject(Le) || !Le.hasOwnProperty(skipHydrateSymbol);
}
const { assign } = Object;
function isComputed(Le) {
  return !!(isRef(Le) && Le.effect);
}
function createOptionsStore(Le, _e, ke, De) {
  const { state: Re, actions: $e, getters: Be } = _e, Ne = ke.state.value[Le];
  let ze;
  function Ae() {
    Ne || (ke.state.value[Le] = Re ? Re() : {});
    const Ie = toRefs(ke.state.value[Le]);
    return assign(Ie, $e, Object.keys(Be || {}).reduce((je, Fe) => (je[Fe] = markRaw(computed$1(() => {
      setActivePinia(ke);
      const Ve = ke._s.get(Le);
      return Be[Fe].call(Ve, Ve);
    })), je), {}));
  }
  return ze = createSetupStore(Le, Ae, _e, ke, De, !0), ze;
}
function createSetupStore(Le, _e, ke = {}, De, Re, $e) {
  let Be;
  const Ne = assign({ actions: {} }, ke), ze = { deep: !0 };
  let Ae, Ie, je = [], Fe = [], Ve;
  const He = De.state.value[Le];
  !$e && !He && (De.state.value[Le] = {}), ref({});
  let We;
  function Xe(Ge) {
    let ei;
    Ae = Ie = !1, typeof Ge == "function" ? (Ge(De.state.value[Le]), ei = {
      type: MutationType.patchFunction,
      storeId: Le,
      events: Ve
    }) : (mergeReactiveObjects(De.state.value[Le], Ge), ei = {
      type: MutationType.patchObject,
      payload: Ge,
      storeId: Le,
      events: Ve
    });
    const ii = We = Symbol();
    nextTick().then(() => {
      We === ii && (Ae = !0);
    }), Ie = !0, triggerSubscriptions(je, ei, De.state.value[Le]);
  }
  const Ye = $e ? function() {
    const { state: ei } = ke, ii = ei ? ei() : {};
    this.$patch((oi) => {
      assign(oi, ii);
    });
  } : (
    /* istanbul ignore next */
    noop
  );
  function Ze() {
    Be.stop(), je = [], Fe = [], De._s.delete(Le);
  }
  const Ke = (Ge, ei = "") => {
    if (ACTION_MARKER in Ge)
      return Ge[ACTION_NAME] = ei, Ge;
    const ii = function() {
      setActivePinia(De);
      const oi = Array.from(arguments), ni = [], ti = [];
      function si(li) {
        ni.push(li);
      }
      function ai(li) {
        ti.push(li);
      }
      triggerSubscriptions(Fe, {
        args: oi,
        name: ii[ACTION_NAME],
        store: Ue,
        after: si,
        onError: ai
      });
      let ri;
      try {
        ri = Ge.apply(this && this.$id === Le ? this : Ue, oi);
      } catch (li) {
        throw triggerSubscriptions(ti, li), li;
      }
      return ri instanceof Promise ? ri.then((li) => (triggerSubscriptions(ni, li), li)).catch((li) => (triggerSubscriptions(ti, li), Promise.reject(li))) : (triggerSubscriptions(ni, ri), ri);
    };
    return ii[ACTION_MARKER] = !0, ii[ACTION_NAME] = ei, ii;
  }, qe = {
    _p: De,
    // _s: scope,
    $id: Le,
    $onAction: addSubscription.bind(null, Fe),
    $patch: Xe,
    $reset: Ye,
    $subscribe(Ge, ei = {}) {
      const ii = addSubscription(je, Ge, ei.detached, () => oi()), oi = Be.run(() => watch(() => De.state.value[Le], (ni) => {
        (ei.flush === "sync" ? Ie : Ae) && Ge({
          storeId: Le,
          type: MutationType.direct,
          events: Ve
        }, ni);
      }, assign({}, ze, ei)));
      return ii;
    },
    $dispose: Ze
  }, Ue = reactive(qe);
  De._s.set(Le, Ue);
  const Je = (De._a && De._a.runWithContext || fallbackRunWithContext)(() => De._e.run(() => (Be = effectScope()).run(() => _e({ action: Ke }))));
  for (const Ge in Je) {
    const ei = Je[Ge];
    if (isRef(ei) && !isComputed(ei) || isReactive(ei))
      $e || (He && shouldHydrate(ei) && (isRef(ei) ? ei.value = He[Ge] : mergeReactiveObjects(ei, He[Ge])), De.state.value[Le][Ge] = ei);
    else if (typeof ei == "function") {
      const ii = Ke(ei, Ge);
      Je[Ge] = ii, Ne.actions[Ge] = ei;
    }
  }
  return assign(Ue, Je), assign(toRaw(Ue), Je), Object.defineProperty(Ue, "$state", {
    get: () => De.state.value[Le],
    set: (Ge) => {
      Xe((ei) => {
        assign(ei, Ge);
      });
    }
  }), De._p.forEach((Ge) => {
    assign(Ue, Be.run(() => Ge({
      store: Ue,
      app: De._a,
      pinia: De,
      options: Ne
    })));
  }), He && $e && ke.hydrate && ke.hydrate(Ue.$state, He), Ae = !0, Ie = !0, Ue;
}
/*! #__NO_SIDE_EFFECTS__ */
// @__NO_SIDE_EFFECTS__
function defineStore(Le, _e, ke) {
  let De;
  const Re = typeof _e == "function";
  De = Re ? ke : _e;
  function $e(Be, Ne) {
    const ze = hasInjectionContext();
    return Be = // in test mode, ignore the argument provided as we can always retrieve a
    // pinia instance with getActivePinia()
    Be || (ze ? inject(piniaSymbol, null) : null), Be && setActivePinia(Be), Be = activePinia, Be._s.has(Le) || (Re ? createSetupStore(Le, _e, De, Be) : createOptionsStore(Le, De, Be)), Be._s.get(Le);
  }
  return $e.$id = Le, $e;
}
function storeToRefs(Le) {
  const _e = toRaw(Le), ke = {};
  for (const De in _e) {
    const Re = _e[De];
    Re.effect ? ke[De] = // ...
    computed$1({
      get: () => Le[De],
      set($e) {
        Le[De] = $e;
      }
    }) : (isRef(Re) || isReactive(Re)) && (ke[De] = // ---
    toRef(Le, De));
  }
  return ke;
}
const useGlobalStore = /* @__PURE__ */ defineStore("global", () => {
  const Le = ref(), _e = ref("1"), ke = ref(), De = ref(), Re = (Ae) => {
    var Ie, je, Fe;
    return (Fe = (je = (Ie = ke.value) == null ? void 0 : Ie.meta) == null ? void 0 : je.find(
      (Ve) => (Ve == null ? void 0 : Ve.meta_key) === Ae
    )) == null ? void 0 : Fe.meta_value;
  }, $e = computed$1(() => Re("open_reserved_flat") === "true"), Be = computed$1(() => Re("open_sold_flat") === "true"), Ne = computed$1(() => Re("price_rounded") === "true");
  return {
    // State
    hoverdSvg: Le,
    tooltip: _e,
    shortcodeData: ke,
    translations: De,
    // Geters
    getMetaValue: Re,
    openReservedFlat: $e,
    openSoldFlat: Be,
    priceRounded: Ne,
    // Mutation
    setData: (Ae) => {
      ke.value = Ae;
    }
  };
});
/**
* @vue/shared v3.5.12
* (c) 2018-present Yuxi (Evan) You and Vue contributors
* @license MIT
**/
const extend = Object.assign, isFunction = (Le) => typeof Le == "function", isSymbol = (Le) => typeof Le == "symbol", hasChanged = (Le, _e) => !Object.is(Le, _e);
/**
* @vue/reactivity v3.5.12
* (c) 2018-present Yuxi (Evan) You and Vue contributors
* @license MIT
**/
let activeSub, batchDepth = 0, batchedSub, batchedComputed;
function batch(Le, _e = !1) {
  if (Le.flags |= 8, _e) {
    Le.next = batchedComputed, batchedComputed = Le;
    return;
  }
  Le.next = batchedSub, batchedSub = Le;
}
function startBatch() {
  batchDepth++;
}
function endBatch() {
  if (--batchDepth > 0)
    return;
  if (batchedComputed) {
    let _e = batchedComputed;
    for (batchedComputed = void 0; _e; ) {
      const ke = _e.next;
      _e.next = void 0, _e.flags &= -9, _e = ke;
    }
  }
  let Le;
  for (; batchedSub; ) {
    let _e = batchedSub;
    for (batchedSub = void 0; _e; ) {
      const ke = _e.next;
      if (_e.next = void 0, _e.flags &= -9, _e.flags & 1)
        try {
          _e.trigger();
        } catch (De) {
          Le || (Le = De);
        }
      _e = ke;
    }
  }
  if (Le) throw Le;
}
function prepareDeps(Le) {
  for (let _e = Le.deps; _e; _e = _e.nextDep)
    _e.version = -1, _e.prevActiveLink = _e.dep.activeLink, _e.dep.activeLink = _e;
}
function cleanupDeps(Le) {
  let _e, ke = Le.depsTail, De = ke;
  for (; De; ) {
    const Re = De.prevDep;
    De.version === -1 ? (De === ke && (ke = Re), removeSub(De), removeDep(De)) : _e = De, De.dep.activeLink = De.prevActiveLink, De.prevActiveLink = void 0, De = Re;
  }
  Le.deps = _e, Le.depsTail = ke;
}
function isDirty(Le) {
  for (let _e = Le.deps; _e; _e = _e.nextDep)
    if (_e.dep.version !== _e.version || _e.dep.computed && (refreshComputed(_e.dep.computed) || _e.dep.version !== _e.version))
      return !0;
  return !!Le._dirty;
}
function refreshComputed(Le) {
  if (Le.flags & 4 && !(Le.flags & 16) || (Le.flags &= -17, Le.globalVersion === globalVersion))
    return;
  Le.globalVersion = globalVersion;
  const _e = Le.dep;
  if (Le.flags |= 2, _e.version > 0 && !Le.isSSR && Le.deps && !isDirty(Le)) {
    Le.flags &= -3;
    return;
  }
  const ke = activeSub, De = shouldTrack;
  activeSub = Le, shouldTrack = !0;
  try {
    prepareDeps(Le);
    const Re = Le.fn(Le._value);
    (_e.version === 0 || hasChanged(Re, Le._value)) && (Le._value = Re, _e.version++);
  } catch (Re) {
    throw _e.version++, Re;
  } finally {
    activeSub = ke, shouldTrack = De, cleanupDeps(Le), Le.flags &= -3;
  }
}
function removeSub(Le, _e = !1) {
  const { dep: ke, prevSub: De, nextSub: Re } = Le;
  if (De && (De.nextSub = Re, Le.prevSub = void 0), Re && (Re.prevSub = De, Le.nextSub = void 0), ke.subs === Le && (ke.subs = De, !De && ke.computed)) {
    ke.computed.flags &= -5;
    for (let $e = ke.computed.deps; $e; $e = $e.nextDep)
      removeSub($e, !0);
  }
  !_e && !--ke.sc && ke.map && ke.map.delete(ke.key);
}
function removeDep(Le) {
  const { prevDep: _e, nextDep: ke } = Le;
  _e && (_e.nextDep = ke, Le.prevDep = void 0), ke && (ke.prevDep = _e, Le.nextDep = void 0);
}
let shouldTrack = !0, globalVersion = 0;
class Link {
  constructor(_e, ke) {
    this.sub = _e, this.dep = ke, this.version = ke.version, this.nextDep = this.prevDep = this.nextSub = this.prevSub = this.prevActiveLink = void 0;
  }
}
class Dep {
  constructor(_e) {
    this.computed = _e, this.version = 0, this.activeLink = void 0, this.subs = void 0, this.map = void 0, this.key = void 0, this.sc = 0;
  }
  track(_e) {
    if (!activeSub || !shouldTrack || activeSub === this.computed)
      return;
    let ke = this.activeLink;
    if (ke === void 0 || ke.sub !== activeSub)
      ke = this.activeLink = new Link(activeSub, this), activeSub.deps ? (ke.prevDep = activeSub.depsTail, activeSub.depsTail.nextDep = ke, activeSub.depsTail = ke) : activeSub.deps = activeSub.depsTail = ke, addSub(ke);
    else if (ke.version === -1 && (ke.version = this.version, ke.nextDep)) {
      const De = ke.nextDep;
      De.prevDep = ke.prevDep, ke.prevDep && (ke.prevDep.nextDep = De), ke.prevDep = activeSub.depsTail, ke.nextDep = void 0, activeSub.depsTail.nextDep = ke, activeSub.depsTail = ke, activeSub.deps === ke && (activeSub.deps = De);
    }
    return ke;
  }
  trigger(_e) {
    this.version++, globalVersion++, this.notify(_e);
  }
  notify(_e) {
    startBatch();
    try {
      for (let ke = this.subs; ke; ke = ke.prevSub)
        ke.sub.notify() && ke.sub.dep.notify();
    } finally {
      endBatch();
    }
  }
}
function addSub(Le) {
  if (Le.dep.sc++, Le.sub.flags & 4) {
    const _e = Le.dep.computed;
    if (_e && !Le.dep.subs) {
      _e.flags |= 20;
      for (let De = _e.deps; De; De = De.nextDep)
        addSub(De);
    }
    const ke = Le.dep.subs;
    ke !== Le && (Le.prevSub = ke, ke && (ke.nextSub = Le)), Le.dep.subs = Le;
  }
}
new Set(
  /* @__PURE__ */ Object.getOwnPropertyNames(Symbol).filter((Le) => Le !== "arguments" && Le !== "caller").map((Le) => Symbol[Le]).filter(isSymbol)
);
class ComputedRefImpl {
  constructor(_e, ke, De) {
    this.fn = _e, this.setter = ke, this._value = void 0, this.dep = new Dep(this), this.__v_isRef = !0, this.deps = void 0, this.depsTail = void 0, this.flags = 16, this.globalVersion = globalVersion - 1, this.next = void 0, this.effect = this, this.__v_isReadonly = !ke, this.isSSR = De;
  }
  /**
   * @internal
   */
  notify() {
    if (this.flags |= 16, !(this.flags & 8) && // avoid infinite self recursion
    activeSub !== this)
      return batch(this, !0), !0;
  }
  get value() {
    const _e = this.dep.track();
    return refreshComputed(this), _e && (_e.version = this.dep.version), this._value;
  }
  set value(_e) {
    this.setter && this.setter(_e);
  }
}
function computed(Le, _e, ke = !1) {
  let De, Re;
  return isFunction(Le) ? De = Le : (De = Le.get, Re = Le.set), new ComputedRefImpl(De, Re, ke);
}
const tr = (Le) => {
  var ke;
  return ((ke = useGlobalStore().translations) == null ? void 0 : ke[Le]) || Le;
}, currencySymbol = () => {
  var De, Re, $e, Be;
  const Le = [
    { title: "🇺🇸 USD", value: "usd", symbol: "$" },
    // United States
    { title: "🇪🇺 EUR", value: "eur", symbol: "€" },
    // European Union
    { title: "🇬🇧 GBP", value: "gbp", symbol: "£" },
    // United Kingdom
    { title: "🇯🇵 JPY", value: "jpy", symbol: "¥" },
    // Japan
    { title: "🇦🇺 AUD", value: "aud", symbol: "A$" },
    // Australia
    { title: "🇨🇦 CAD", value: "cad", symbol: "C$" },
    // Canada
    { title: "🇨🇭 CHF", value: "chf", symbol: "CHF" },
    // Switzerland
    { title: "🇨🇳 CNY", value: "cny", symbol: "¥" },
    // China
    { title: "🇮🇳 INR", value: "inr", symbol: "₹" },
    // India
    { title: "🇸🇬 SGD", value: "sgd", symbol: "S$" },
    // Singapore
    { title: "🇳🇿 NZD", value: "nzd", symbol: "NZ$" },
    // New Zealand
    { title: "🇰🇷 KRW", value: "krw", symbol: "₩" },
    // South Korea
    { title: "🇧🇷 BRL", value: "brl", symbol: "R$" },
    // Brazil
    { title: "🇷🇺 RUB", value: "rub", symbol: "₽" },
    // Russia
    { title: "🇿🇦 ZAR", value: "zar", symbol: "R" },
    // South Africa
    { title: "🇲🇽 MXN", value: "mxn", symbol: "Mex$" },
    // Mexico
    { title: "🇭🇰 HKD", value: "hkd", symbol: "HK$" },
    // Hong Kong
    { title: "🇹🇷 TRY", value: "try", symbol: "₺" },
    // Turkey
    { title: "🇸🇪 SEK", value: "sek", symbol: "kr" },
    // Sweden
    { title: "🇳🇴 NOK", value: "nok", symbol: "kr" },
    // Norway
    { title: "🇩🇰 DKK", value: "dkk", symbol: "kr" },
    // Denmark
    { title: "🇵🇱 PLN", value: "pln", symbol: "zł" },
    // Poland
    { title: "🇹🇭 THB", value: "thb", symbol: "฿" },
    // Thailand
    { title: "🇮🇩 IDR", value: "idr", symbol: "Rp" },
    // Indonesia
    { title: "🇲🇾 MYR", value: "myr", symbol: "RM" },
    // Malaysia
    { title: "🇵🇭 PHP", value: "php", symbol: "₱" },
    // Philippines
    { title: "🇦🇪 AED", value: "aed", symbol: "د.إ" },
    // United Arab Emirates
    { title: "🇸🇦 SAR", value: "sar", symbol: "﷼" },
    // Saudi Arabia
    { title: "🇶🇦 QAR", value: "qar", symbol: "﷼" },
    // Qatar
    { title: "🇰🇼 KWD", value: "kwd", symbol: "د.ك" },
    // Kuwait
    { title: "🇧🇭 BHD", value: "bhd", symbol: ".د.ب" },
    // Bahrain
    { title: "🇴🇲 OMR", value: "omr", symbol: "﷼" },
    // Oman
    { title: "🇬🇪 GEL", value: "gel", symbol: "₾" }
    // Georgia
  ], ke = (($e = (Re = (De = useGlobalStore().shortcodeData) == null ? void 0 : De.meta) == null ? void 0 : Re.find(
    (Ne) => Ne.meta_key === "currency"
  )) == null ? void 0 : $e.meta_value) || "usd";
  return ((Be = Le.find((Ne) => Ne.value === ke)) == null ? void 0 : Be.symbol) || "$";
}, getPrice = (Le) => {
  const ke = useGlobalStore().priceRounded ? 0 : 2;
  return Number(Le).toLocaleString("en-US", {
    minimumFractionDigits: ke,
    maximumFractionDigits: ke
  });
}, getArea = (Le) => Number(Le).toLocaleString(), _hoisted_1$h = {
  key: 0,
  class: "irep-tooltip-1 ire-pointer-events-none ire-absolute !ire-bottom-10 !ire-right-10 ire-w-fit ire-select-none ire-rounded-lg ire-border ire-bg-white ire-p-4"
}, _hoisted_2$b = {
  key: 0,
  class: "irep-tooltip-1__floor ire-flex ire-items-center ire-gap-3"
}, _hoisted_3$a = { class: "ire-flex ire-flex-col ire-items-center" }, _hoisted_4$7 = { class: "irep-tooltip-1__floor-number !ire-text-2xl" }, _hoisted_5$3 = { class: "irep-tooltip-1__floor-text !ire-text-sm ire-uppercase" }, _hoisted_6$3 = {
  key: 0,
  class: "ire-rounded-lg ire-bg-gray-100 ire-p-6"
}, _hoisted_7$3 = {
  key: 0,
  class: "irep-tooltip-1__floor-conf !ire-text-2xl"
}, _hoisted_8$3 = { key: 1 }, _hoisted_9$3 = {
  key: 0,
  class: "irep-tooltip-1__floor-status ire-flex ire-items-center ire-gap-2"
}, _hoisted_10$3 = { class: "irep-tooltip-1__floor-status-value ire-min-w-3 !ire-text-2xl" }, _hoisted_11$3 = { class: "irep-tooltip-1__floor-status-text !ire-text-sm ire-uppercase" }, _hoisted_12$3 = {
  key: 1,
  class: "irep-tooltip-1__floor-status ire-flex ire-items-center ire-gap-2"
}, _hoisted_13$2 = { class: "irep-tooltip-1__floor-status-value min-w-3 !ire-text-2xl" }, _hoisted_14$2 = { class: "irep-tooltip-1__floor-status-text !ire-text-sm ire-uppercase" }, _hoisted_15$2 = {
  key: 2,
  class: "irep-tooltip-1__floor-status ire-flex ire-items-center ire-gap-2"
}, _hoisted_16$2 = { class: "irep-tooltip-1__floor-status-value ire-min-w-3 !ire-text-2xl" }, _hoisted_17$2 = { class: "irep-tooltip-1__floor-status-text !ire-text-sm ire-uppercase" }, _hoisted_18$1 = {
  key: 1,
  class: "irep-tooltip-1__block ire-flex ire-items-center ire-gap-3"
}, _hoisted_19$1 = { class: "ire-flex ire-flex-col ire-items-center" }, _hoisted_20$1 = { class: "irep-tooltip-1__block-conf text-sm ire-text-gray-700" }, _hoisted_21$1 = { class: "irep-tooltip-1__block-title !text-2xl" }, _hoisted_22$1 = {
  key: 2,
  class: "irep-tooltip-1__flat ire-flex ire-w-full ire-flex-col ire-items-center ire-gap-3"
}, _hoisted_23$1 = { class: "ire-flex ire-flex-col ire-items-center" }, _hoisted_24$1 = { class: "irep-tooltip-1__flat-number ire-max-w-60 ire-text-center !ire-text-2xl ire-capitalize" }, _hoisted_25$1 = { class: "irep-tooltip-1__flat-aptitle !ire-mt-2 !ire-text-sm ire-uppercase" }, _hoisted_26$1 = { class: "ire-flex ire-min-w-36 ire-flex-col ire-items-center ire-rounded-lg ire-bg-gray-100 ire-px-7 ire-py-3" }, _hoisted_27$1 = {
  key: 0,
  class: "irep-tooltip-1__flat-conf !ire-text-2xl ire-uppercase"
}, _hoisted_28$1 = { class: "irep-tooltip-1__flat-price !ire-text-sm ire-uppercase ire-text-gray-500" }, _hoisted_29$1 = {
  key: 0,
  class: "ire-flex ire-w-fit ire-flex-col ire-items-center ire-py-2"
}, _hoisted_30 = {
  key: 0,
  class: "irep-tooltip-1__flat-price-value ire-whitespace-nowrap !ire-text-2xl"
}, _hoisted_31 = { key: 1 }, _hoisted_32 = { class: "irep-tooltip-1__flat-price-line-value ire-min-w-max !ire-text-sm ire-line-through" }, _hoisted_33 = { class: "irep-tooltip-1__flat-price-value ire-min-w-max ire-whitespace-nowrap !ire-text-2xl" }, _hoisted_34 = { class: "ire-border ire-border-solid ire-border-gray-800 ire-p-2" }, _hoisted_35 = { class: "irep-tooltip-1__flat-area ire-translate-x-3 ire-bg-white" }, _sfc_main$l = /* @__PURE__ */ defineComponent({
  __name: "Tooltip_1",
  props: {
    hoveredData: {},
    type: {}
  },
  setup(Le) {
    const _e = Le, ke = computed$1(() => {
      var De;
      return tr((De = _e.hoveredData) == null ? void 0 : De.conf);
    });
    return (De, Re) => (openBlock(), createElementBlock("div", null, [
      createVNode(Transition, { name: "ire-fade-in-out" }, {
        default: withCtx(() => {
          var $e, Be, Ne, ze, Ae, Ie, je, Fe, Ve, He, We, Xe, Ye, Ze, Ke, qe, Ue, Qe, Je, Ge, ei, ii, oi, ni;
          return [
            De.type && De.hoveredData && De.type !== "tooltip" ? (openBlock(), createElementBlock("div", _hoisted_1$h, [
              De.type === "floor" ? (openBlock(), createElementBlock("div", _hoisted_2$b, [
                createElementVNode("div", _hoisted_3$a, [
                  createElementVNode("div", _hoisted_4$7, toDisplayString(($e = De.hoveredData) == null ? void 0 : $e.floor_number), 1),
                  createElementVNode("div", _hoisted_5$3, toDisplayString(unref(tr)("floor")), 1)
                ]),
                (Be = De.hoveredData) != null && Be.conf || (ze = (Ne = De.hoveredData) == null ? void 0 : Ne.flats) != null && ze.length ? (openBlock(), createElementBlock("div", _hoisted_6$3, [
                  ke.value ? (openBlock(), createElementBlock("div", _hoisted_7$3, toDisplayString(ke.value), 1)) : (openBlock(), createElementBlock("div", _hoisted_8$3, [
                    (Ie = (Ae = De.hoveredData) == null ? void 0 : Ae.counts) != null && Ie.available ? (openBlock(), createElementBlock("div", _hoisted_9$3, [
                      createElementVNode("div", _hoisted_10$3, toDisplayString(((Fe = (je = De.hoveredData) == null ? void 0 : je.counts) == null ? void 0 : Fe.available) || 0), 1),
                      createElementVNode("div", _hoisted_11$3, toDisplayString(unref(tr)("available")), 1)
                    ])) : createCommentVNode("", !0),
                    (He = (Ve = De.hoveredData) == null ? void 0 : Ve.counts) != null && He.reserved ? (openBlock(), createElementBlock("div", _hoisted_12$3, [
                      createElementVNode("div", _hoisted_13$2, toDisplayString((Xe = (We = De.hoveredData) == null ? void 0 : We.counts) == null ? void 0 : Xe.reserved), 1),
                      createElementVNode("div", _hoisted_14$2, toDisplayString(unref(tr)("reserved")), 1)
                    ])) : createCommentVNode("", !0),
                    (Ze = (Ye = De.hoveredData) == null ? void 0 : Ye.counts) != null && Ze.sold ? (openBlock(), createElementBlock("div", _hoisted_15$2, [
                      createElementVNode("div", _hoisted_16$2, toDisplayString((qe = (Ke = De.hoveredData) == null ? void 0 : Ke.counts) == null ? void 0 : qe.sold), 1),
                      createElementVNode("div", _hoisted_17$2, toDisplayString(unref(tr)("sold")), 1)
                    ])) : createCommentVNode("", !0)
                  ]))
                ])) : createCommentVNode("", !0)
              ])) : De.type === "block" ? (openBlock(), createElementBlock("div", _hoisted_18$1, [
                createElementVNode("div", _hoisted_19$1, [
                  createElementVNode("span", _hoisted_20$1, toDisplayString(ke.value), 1),
                  createElementVNode("div", _hoisted_21$1, toDisplayString((Ue = De.hoveredData) == null ? void 0 : Ue.title), 1)
                ])
              ])) : De.type === "flat" ? (openBlock(), createElementBlock("div", _hoisted_22$1, [
                createElementVNode("div", _hoisted_23$1, [
                  createElementVNode("div", _hoisted_24$1, toDisplayString((Qe = De.hoveredData) == null ? void 0 : Qe.flat_number), 1),
                  createElementVNode("div", _hoisted_25$1, toDisplayString(unref(tr)("apartment")), 1)
                ]),
                createElementVNode("div", _hoisted_26$1, [
                  ke.value ? (openBlock(), createElementBlock("div", _hoisted_27$1, toDisplayString(ke.value), 1)) : (openBlock(), createElementBlock(Fragment, { key: 1 }, [
                    createElementVNode("div", _hoisted_28$1, toDisplayString(unref(tr)("price")), 1),
                    (Je = De.hoveredData) != null && Je.price ? (openBlock(), createElementBlock("div", _hoisted_29$1, [
                      createElementVNode("div", null, [
                        (Ge = De.hoveredData) != null && Ge.offer_price ? (openBlock(), createElementBlock("div", _hoisted_31, [
                          createElementVNode("div", _hoisted_32, [
                            createTextVNode(toDisplayString(unref(getPrice)((ei = De.hoveredData) == null ? void 0 : ei.price)) + " ", 1),
                            createElementVNode("span", null, toDisplayString(unref(currencySymbol)()), 1)
                          ]),
                          createElementVNode("div", _hoisted_33, [
                            createTextVNode(toDisplayString(unref(getPrice)((ii = De.hoveredData) == null ? void 0 : ii.offer_price)) + " ", 1),
                            createElementVNode("span", null, toDisplayString(unref(currencySymbol)()), 1)
                          ])
                        ])) : (openBlock(), createElementBlock("div", _hoisted_30, [
                          createTextVNode(toDisplayString(unref(getPrice)(De.hoveredData.price)) + " ", 1),
                          createElementVNode("span", null, toDisplayString(unref(currencySymbol)()), 1)
                        ]))
                      ])
                    ])) : createCommentVNode("", !0)
                  ], 64))
                ]),
                createElementVNode("div", _hoisted_34, [
                  createElementVNode("div", _hoisted_35, [
                    createTextVNode(toDisplayString(unref(getArea)(+((ni = (oi = De.hoveredData) == null ? void 0 : oi.type) == null ? void 0 : ni.area_m2))) + " m", 1),
                    Re[0] || (Re[0] = createElementVNode("sup", { class: "ire-bg-white !ire-text-sm" }, " 2 ", -1))
                  ])
                ])
              ])) : createCommentVNode("", !0)
            ])) : createCommentVNode("", !0)
          ];
        }),
        _: 1
      })
    ]));
  }
}), _hoisted_1$g = {
  key: 0,
  class: "irep-tooltip-2__floor ire-flex ire-flex-col ire-items-center !ire-text-sm"
}, _hoisted_2$a = { class: "ire-flex ire-w-full ire-items-center ire-justify-evenly ire-p-4" }, _hoisted_3$9 = { class: "irep-tooltip-2__floor-number ire-text-3xl ire-capitalize" }, _hoisted_4$6 = {
  key: 0,
  class: "irep-tooltip-2__floor-conf ire-text-2xl ire-uppercase"
}, _hoisted_5$2 = { key: 1 }, _hoisted_6$2 = { class: "irep-tooltip-2__floor-starting ire-text-sm ire-text-gray-400" }, _hoisted_7$2 = { class: "irep-tooltip-2__floor-price" }, _hoisted_8$2 = { class: "ire-right-[2px] ire-text-gray-200" }, _hoisted_9$2 = { class: "ire-flex ire-items-center ire-justify-between ire-gap-2 ire-bg-gray-800 ire-p-2" }, _hoisted_10$2 = { class: "irep-tooltip-2__floor-status ire-flex ire-gap-1 ire-text-center ire-text-sm" }, _hoisted_11$2 = { class: "irep-tooltip-2__floor-status ire-flex ire-gap-1 ire-text-center ire-text-sm" }, _hoisted_12$2 = { class: "irep-tooltip-2__floor-status ire-flex ire-gap-1 ire-text-center ire-text-sm" }, _hoisted_13$1 = {
  key: 1,
  class: "irep-tooltip-2__block ire-flex ire-items-center ire-gap-3 ire-p-4 !ire-text-sm"
}, _hoisted_14$1 = { class: "ire-flex ire-w-max ire-flex-col ire-items-center" }, _hoisted_15$1 = { class: "irep-tooltip-2__block-title" }, _hoisted_16$1 = { class: "irep-tooltip-2__block-conf ire-text-gray-300 ire-opacity-80" }, _hoisted_17$1 = {
  key: 2,
  class: "irep-tooltip-2__flat ire-flex ire-w-full ire-flex-col ire-items-center ire-gap-1"
}, _hoisted_18 = { class: "ire-flex ire-items-center ire-gap-4 ire-p-4" }, _hoisted_19 = { class: "irep-tooltip-2__flat-number ire-max-w-28 ire-text-base ire-capitalize" }, _hoisted_20 = {
  key: 0,
  class: "irep-tooltip-2__flat-conf ire-text-base ire-uppercase"
}, _hoisted_21 = {
  key: 1,
  class: "ire-flex ire-flex-col ire-gap-2"
}, _hoisted_22 = { key: 0 }, _hoisted_23 = { class: "ire-text-sm ire-line-through" }, _hoisted_24 = { class: "irep-tooltip-2__flat-price ire-text-base" }, _hoisted_25 = { class: "ire-right-[2px]" }, _hoisted_26 = {
  key: 1,
  class: "irep-tooltip-2__flat-price ire-text-base"
}, _hoisted_27 = { class: "ire-right-[2px]" }, _hoisted_28 = { class: "irep-tooltip-2__flat-area" }, _hoisted_29 = { class: "ire-right-[2px] ire-text-base" }, _sfc_main$k = /* @__PURE__ */ defineComponent({
  __name: "Tooltip_2",
  props: {
    hoveredData: {},
    type: {},
    mouseTrack: { type: Boolean }
  },
  setup(Le) {
    const _e = Le, ke = inject("mouseX"), De = inject("mouseY"), Re = computed$1(() => {
      var $e;
      return tr(($e = _e.hoveredData) == null ? void 0 : $e.conf);
    });
    return ($e, Be) => {
      var Ne, ze, Ae, Ie, je, Fe, Ve, He, We, Xe, Ye, Ze, Ke, qe, Ue, Qe, Je, Ge;
      return $e.type && $e.hoveredData && $e.type !== "tooltip" ? (openBlock(), createElementBlock("div", {
        key: 0,
        class: normalizeClass(["ire-pointer-events-none ire-absolute ire-select-none", {
          "ire-left-0 ire-top-0": $e.mouseTrack,
          "ire-bottom-4 ire-right-4": !$e.mouseTrack
        }]),
        style: normalizeStyle(
          $e.mouseTrack ? {
            transform: `translateX(${unref(ke) || 0}px) translateY(${unref(De) || 0}px)`
          } : {}
        )
      }, [
        createElementVNode("div", {
          class: normalizeClass(["irep-tooltip irep-tooltip-2 ire-flex ire-origin-top ire-items-center ire-justify-center ire-bg-black ire-text-white ire-transition-transform ire-duration-500 ire-ease-in-out", { "": $e.mouseTrack }])
        }, [
          $e.type === "floor" ? (openBlock(), createElementBlock("div", _hoisted_1$g, [
            createElementVNode("div", _hoisted_2$a, [
              createElementVNode("div", _hoisted_3$9, toDisplayString((Ne = $e.hoveredData) == null ? void 0 : Ne.floor_number), 1),
              Be[0] || (Be[0] = createElementVNode("span", null, "|", -1)),
              Re.value ? (openBlock(), createElementBlock("div", _hoisted_4$6, toDisplayString(Re.value), 1)) : (openBlock(), createElementBlock("div", _hoisted_5$2, [
                createElementVNode("div", _hoisted_6$2, toDisplayString(unref(tr)("starting from")) + ": ", 1),
                createElementVNode("div", _hoisted_7$2, [
                  createTextVNode(toDisplayString(unref(getPrice)(+((Ae = (ze = $e.hoveredData) == null ? void 0 : ze.counts) == null ? void 0 : Ae.minimum_price) || 0)) + " ", 1),
                  createElementVNode("span", _hoisted_8$2, toDisplayString(unref(currencySymbol)()), 1)
                ])
              ]))
            ]),
            createElementVNode("div", _hoisted_9$2, [
              createElementVNode("div", _hoisted_10$2, [
                createElementVNode("span", null, toDisplayString(Re.value ? 0 : ((je = (Ie = $e.hoveredData) == null ? void 0 : Ie.counts) == null ? void 0 : je.available) || 0), 1),
                createTextVNode(" " + toDisplayString(unref(tr)("available")), 1)
              ]),
              Be[1] || (Be[1] = createElementVNode("span", null, "•", -1)),
              createElementVNode("div", _hoisted_11$2, [
                createElementVNode("span", null, toDisplayString(Re.value === "sold" ? ((Fe = $e.hoveredData) == null ? void 0 : Fe.flats.length) || 0 : ((He = (Ve = $e.hoveredData) == null ? void 0 : Ve.counts) == null ? void 0 : He.sold) || 0), 1),
                createTextVNode(" " + toDisplayString(unref(tr)("sold")), 1)
              ]),
              Be[2] || (Be[2] = createElementVNode("span", null, "•", -1)),
              createElementVNode("div", _hoisted_12$2, [
                createElementVNode("span", null, toDisplayString(Re.value === "reserved" ? ((We = $e.hoveredData) == null ? void 0 : We.flats.length) || 0 : ((Ye = (Xe = $e.hoveredData) == null ? void 0 : Xe.counts) == null ? void 0 : Ye.reserved) || 0), 1),
                createTextVNode(" " + toDisplayString(unref(tr)("reserved")), 1)
              ])
            ])
          ])) : $e.type === "block" ? (openBlock(), createElementBlock("div", _hoisted_13$1, [
            createElementVNode("div", _hoisted_14$1, [
              createElementVNode("div", _hoisted_15$1, toDisplayString((Ze = $e.hoveredData) == null ? void 0 : Ze.title), 1),
              createElementVNode("span", _hoisted_16$1, toDisplayString(Re.value), 1)
            ])
          ])) : $e.type === "flat" ? (openBlock(), createElementBlock("div", _hoisted_17$1, [
            createElementVNode("div", _hoisted_18, [
              createElementVNode("div", _hoisted_19, toDisplayString((Ke = $e.hoveredData) == null ? void 0 : Ke.flat_number), 1),
              Be[4] || (Be[4] = createElementVNode("span", null, "|", -1)),
              Re.value ? (openBlock(), createElementBlock("div", _hoisted_20, toDisplayString(Re.value), 1)) : (openBlock(), createElementBlock("div", _hoisted_21, [
                createElementVNode("div", null, [
                  $e.hoveredData.offer_price ? (openBlock(), createElementBlock("div", _hoisted_22, [
                    createElementVNode("div", _hoisted_23, [
                      createTextVNode(toDisplayString(unref(getPrice)(+((qe = $e.hoveredData) == null ? void 0 : qe.price))) + " ", 1),
                      createElementVNode("span", null, toDisplayString(unref(currencySymbol)()), 1)
                    ]),
                    createElementVNode("div", _hoisted_24, [
                      createTextVNode(toDisplayString(unref(getPrice)(+((Ue = $e.hoveredData) == null ? void 0 : Ue.offer_price))) + " ", 1),
                      createElementVNode("span", _hoisted_25, toDisplayString(unref(currencySymbol)()), 1)
                    ])
                  ])) : (openBlock(), createElementBlock("div", _hoisted_26, [
                    createTextVNode(toDisplayString(unref(getPrice)(+((Qe = $e.hoveredData) == null ? void 0 : Qe.price))) + " ", 1),
                    createElementVNode("span", _hoisted_27, toDisplayString(unref(currencySymbol)()), 1)
                  ]))
                ]),
                createElementVNode("div", _hoisted_28, [
                  createElementVNode("span", _hoisted_29, [
                    createTextVNode(toDisplayString(unref(getArea)(+((Ge = (Je = $e.hoveredData) == null ? void 0 : Je.type) == null ? void 0 : Ge.area_m2))) + " m", 1),
                    Be[3] || (Be[3] = createElementVNode("sup", { class: "ire-bg-transparent !ire-text-base" }, " 2 ", -1))
                  ])
                ])
              ]))
            ])
          ])) : createCommentVNode("", !0)
        ], 2)
      ], 6)) : createCommentVNode("", !0);
    };
  }
}), _hoisted_1$f = { class: "irep-tooltip irep-tooltip-3 ire-flex ire-w-fit ire-origin-top ire-items-center ire-justify-center ire-rounded-2xl ire-border ire-bg-white ire-p-4 ire-transition-transform ire-duration-500 ire-ease-in-out" }, _hoisted_2$9 = {
  key: 0,
  class: "irep-tooltip-3__floor ire-flex ire-flex-col ire-items-center ire-gap-3"
}, _hoisted_3$8 = { class: "ire-flex ire-flex-col ire-items-center" }, _hoisted_4$5 = { class: "irep-tooltip-3__floor-number !ire-text-2xl" }, _hoisted_5$1 = { class: "irep-tooltip-3__floor-text !ire-text-sm ire-uppercase" }, _hoisted_6$1 = {
  key: 1,
  class: "irep-tooltip-3__block ire-flex ire-items-center ire-gap-3"
}, _hoisted_7$1 = { class: "ire-flex ire-w-max ire-flex-col ire-items-center" }, _hoisted_8$1 = { class: "irep-tooltip-3__block-title !text-2xl" }, _hoisted_9$1 = {
  key: 2,
  class: "irep-tooltip-3__flat ire-flex ire-w-full ire-flex-col ire-items-center ire-gap-3"
}, _hoisted_10$1 = { class: "ire-flex ire-flex-col ire-items-center" }, _hoisted_11$1 = { class: "irep-tooltip-3__flat-number ire-max-w-52 ire-text-center !ire-text-2xl ire-capitalize" }, _hoisted_12$1 = { class: "irep-tooltip-3__flat-text !ire-mt-2 ire-text-sm ire-uppercase" }, _sfc_main$j = /* @__PURE__ */ defineComponent({
  __name: "Tooltip_3",
  props: {
    hoveredData: {},
    type: {}
  },
  setup(Le) {
    const _e = inject("mouseX"), ke = inject("mouseY");
    return (De, Re) => {
      var $e, Be, Ne;
      return De.type && De.hoveredData && De.type !== "tooltip" ? (openBlock(), createElementBlock("div", {
        key: 0,
        class: "ire-pointer-events-none ire-absolute ire-left-0 ire-top-0 ire-select-none",
        style: normalizeStyle({
          transform: `translateX(${unref(_e) || 0}px) translateY(${unref(ke) || 0}px)`
        })
      }, [
        createElementVNode("div", _hoisted_1$f, [
          De.type === "floor" ? (openBlock(), createElementBlock("div", _hoisted_2$9, [
            createElementVNode("div", _hoisted_3$8, [
              createElementVNode("div", _hoisted_4$5, toDisplayString(($e = De.hoveredData) == null ? void 0 : $e.floor_number), 1),
              createElementVNode("div", _hoisted_5$1, toDisplayString(unref(tr)("floor")), 1)
            ])
          ])) : De.type === "block" ? (openBlock(), createElementBlock("div", _hoisted_6$1, [
            createElementVNode("div", _hoisted_7$1, [
              createElementVNode("div", _hoisted_8$1, toDisplayString((Be = De.hoveredData) == null ? void 0 : Be.title), 1)
            ])
          ])) : De.type === "flat" ? (openBlock(), createElementBlock("div", _hoisted_9$1, [
            createElementVNode("div", _hoisted_10$1, [
              createElementVNode("div", _hoisted_11$1, toDisplayString((Ne = De.hoveredData) == null ? void 0 : Ne.flat_number), 1),
              createElementVNode("div", _hoisted_12$1, toDisplayString(unref(tr)("apartment")), 1)
            ])
          ])) : createCommentVNode("", !0)
        ])
      ], 4)) : createCommentVNode("", !0);
    };
  }
}), _hoisted_1$e = {
  key: 0,
  class: "py-2 ire-mb-3 ire-flex ire-h-[48px] ire-items-center ire-justify-between ire-px-4"
}, _sfc_main$i = /* @__PURE__ */ defineComponent({
  __name: "PreviewLayout",
  props: {
    hoverdData: {},
    type: {}
  },
  setup(Le) {
    const _e = useGlobalStore(), { getMetaValue: ke } = _e, De = inject("showFlatModal"), Re = ref(), $e = ref(!0), Be = computed$1(() => ke("tooltip") || "1");
    return watch(
      () => De == null ? void 0 : De.value,
      () => {
        De != null && De.value ? $e.value = !1 : setTimeout(() => {
          $e.value = !0;
        }, 400);
      }
    ), (Ne, ze) => (openBlock(), createElementBlock("div", {
      ref_key: "canvasRef",
      ref: Re,
      class: "ire-group ire-relative ire-overflow-hidden ire-pt-3"
    }, [
      Ne.$slots.header ? (openBlock(), createElementBlock("div", _hoisted_1$e, [
        renderSlot(Ne.$slots, "header")
      ])) : createCommentVNode("", !0),
      renderSlot(Ne.$slots, "default"),
      createVNode(Transition, { name: "ire-fade-in-out" }, {
        default: withCtx(() => [
          $e.value ? (openBlock(), createElementBlock(Fragment, { key: 0 }, [
            Be.value === "2" ? (openBlock(), createBlock(_sfc_main$k, {
              key: 0,
              "hovered-data": Ne.hoverdData,
              type: Ne.type || "",
              "mouse-track": !0,
              class: "ire-hidden lg:ire-flex [&_.irep-tooltip]:group-active:!ire-scale-110"
            }, null, 8, ["hovered-data", "type"])) : Be.value === "3" ? (openBlock(), createBlock(_sfc_main$k, {
              key: 1,
              "hovered-data": Ne.hoverdData,
              type: Ne.type || "",
              class: "ire-hidden lg:ire-flex"
            }, null, 8, ["hovered-data", "type"])) : Be.value === "4" ? (openBlock(), createBlock(_sfc_main$j, {
              key: 2,
              "hovered-data": Ne.hoverdData,
              type: Ne.type || "",
              class: "ire-hidden lg:ire-flex [&_.irep-tooltip]:group-active:!ire-scale-110"
            }, null, 8, ["hovered-data", "type"])) : (openBlock(), createBlock(_sfc_main$l, {
              key: 3,
              "hovered-data": Ne.hoverdData,
              type: Ne.type || "",
              class: "ire-hidden lg:ire-block"
            }, null, 8, ["hovered-data", "type"]))
          ], 64)) : createCommentVNode("", !0)
        ]),
        _: 1
      })
    ], 512));
  }
}), _hoisted_1$d = { class: "ire-relative ire-h-full ire-select-none ire-overflow-hidden" }, _hoisted_2$8 = ["src"], _hoisted_3$7 = ["innerHTML"], _sfc_main$h = /* @__PURE__ */ defineComponent({
  __name: "ProjectPreview",
  props: {
    project: {},
    floors: {},
    blocks: {},
    flats: {},
    actions: {},
    projectMeta: {}
  },
  emits: ["changeComponent"],
  setup(Le, { emit: _e }) {
    const ke = _e, De = Le, Re = inject("showFlatModal"), $e = useGlobalStore(), { openReservedFlat: Be, openSoldFlat: Ne } = storeToRefs($e), ze = ref(null), Ae = ref(), Ie = ref(null), je = computed(() => {
      if (De.project)
        return De.project.svg;
    }), Fe = (He) => {
      const We = He == null ? void 0 : He.target;
      We && (ze.value = We);
    }, Ve = (He) => {
      var Xe, Ye, Ze;
      const We = He.target;
      (We == null ? void 0 : We.nodeName) === "path" && (((Xe = Ae.value) == null ? void 0 : Xe.conf) === "reserved" && !Be.value || ((Ye = Ae.value) == null ? void 0 : Ye.conf) === "sold" && !Ne.value || ke("changeComponent", ((Ze = Ie.value) == null ? void 0 : Ze.type) || "", Ae == null ? void 0 : Ae.value));
    };
    return watch(
      () => Re == null ? void 0 : Re.value,
      () => {
        Re != null && Re.value || (ze.value = null, Ie.value = null);
      }
    ), watch(
      () => ze.value,
      (He) => {
        var Xe, Ye, Ze, Ke, qe, Ue, Qe;
        if (!He) return;
        $e.hoverdSvg = He;
        const We = He.parentElement;
        if (We && (We == null ? void 0 : We.nodeName) === "g") {
          const Je = We == null ? void 0 : We.getAttribute("id");
          if (!Je || (Ie.value = ((Xe = De.project) == null ? void 0 : Xe.polygon_data.find((ei) => (ei == null ? void 0 : ei.key) === Je)) || null, !Ie.value)) return;
          const Ge = (Ye = Ie.value) == null ? void 0 : Ye.id;
          switch ((Ze = Ie.value) == null ? void 0 : Ze.type) {
            case "floor":
              const ei = (Ke = De.floors) == null ? void 0 : Ke.find(
                (ti) => ti.id === Ge
              );
              Ae.value = ei;
              break;
            case "block":
              const ii = (qe = De.blocks) == null ? void 0 : qe.find(
                (ti) => (ti == null ? void 0 : ti.id) === Ge
              );
              Ae.value = ii;
              break;
            case "flat":
              const oi = (Ue = De.flats) == null ? void 0 : Ue.find(
                (ti) => (ti == null ? void 0 : ti.id) === Ge
              );
              Ae.value = oi;
              break;
            case "tooltip":
              const ni = (Qe = De.actions) == null ? void 0 : Qe.find(
                (ti) => (ti == null ? void 0 : ti.id) === Ge
              );
              Ae.value = ni;
              break;
            default:
              Ae.value = null;
              break;
          }
        } else
          Ie.value = null, Ae.value = null;
      }
    ), onMounted(() => {
      document.addEventListener("mousemove", Fe);
    }), onUnmounted(() => {
      document.removeEventListener("mousemove", Fe);
    }), (He, We) => {
      var Xe;
      return openBlock(), createBlock(_sfc_main$i, {
        hoverdData: Ae.value,
        type: (Xe = Ie.value) == null ? void 0 : Xe.type
      }, {
        default: withCtx(() => {
          var Ye, Ze, Ke, qe, Ue, Qe;
          return [
            createElementVNode("div", _hoisted_1$d, [
              createElementVNode("img", {
                src: (Ke = (Ze = (Ye = He.project) == null ? void 0 : Ye.project_image) == null ? void 0 : Ze[0]) == null ? void 0 : Ke.url,
                alt: "",
                class: "ire-left-0 ire-top-0 ire-h-full ire-w-full"
              }, null, 8, _hoisted_2$8),
              (openBlock(), createElementBlock("div", {
                innerHTML: unref(je),
                key: unref(je),
                class: normalizeClass(["canvas ire-absolute ire-left-0 ire-top-0 ire-h-full ire-w-full [&_path]:ire-cursor-pointer [&_path]:ire-fill-[var(--path-color)] [&_path]:ire-transition-all [&_svg]:ire-h-full [&_svg]:ire-w-full", [
                  {
                    "hover:[&_path]:ire-fill-[var(--reserved-color)]": Ae.value && ((qe = Ae.value) == null ? void 0 : qe.conf) === "reserved",
                    "hover:[&_path]:ire-fill-[var(--sold-color)]": Ae.value && ((Ue = Ae.value) == null ? void 0 : Ue.conf) === "sold",
                    "hover:[&_path]:ire-fill-[var(--path-hover-color)]": !((Qe = Ae.value) != null && Qe.conf)
                  }
                ]]),
                onClick: Ve
              }, null, 10, _hoisted_3$7))
            ])
          ];
        }),
        _: 1
      }, 8, ["hoverdData", "type"]);
    };
  }
}), _hoisted_1$c = { class: "select ire-w-full ire-min-w-[150px] ire-max-w-[200px] ire-border ire-border-slate-200 lg:ire-min-w-[250px]" }, _hoisted_2$7 = {
  key: 0,
  class: "label"
}, _hoisted_3$6 = { class: "ire-relative" }, _hoisted_4$4 = ["value", "disabled"], _sfc_main$g = /* @__PURE__ */ defineComponent({
  __name: "PreviewSelect",
  props: /* @__PURE__ */ mergeModels({
    data: {},
    placeholder: { default: "Choose" },
    label: { default: "" },
    clearable: { type: Boolean, default: !1 },
    required: { type: Boolean }
  }, {
    modelValue: {},
    modelModifiers: {}
  }),
  emits: ["update:modelValue"],
  setup(Le) {
    const _e = useGlobalStore(), { openReservedFlat: ke, openSoldFlat: De } = storeToRefs(_e), Re = useModel(Le, "modelValue");
    return ($e, Be) => (openBlock(), createElementBlock("div", _hoisted_1$c, [
      $e.label ? (openBlock(), createElementBlock("p", _hoisted_2$7, toDisplayString($e.label), 1)) : createCommentVNode("", !0),
      createElementVNode("div", _hoisted_3$6, [
        withDirectives(createElementVNode("select", {
          "onUpdate:modelValue": Be[0] || (Be[0] = (Ne) => Re.value = Ne),
          class: "ire-w-full ire-cursor-pointer ire-appearance-none ire-rounded-none ire-bg-transparent ire-py-2 ire-pl-3 ire-pr-8 ire-text-sm ire-text-slate-700 ire-shadow-sm ire-transition ire-duration-300 ire-ease-linear placeholder:ire-text-slate-400 hover:ire-border-slate-400 focus:ire-border-slate-400 focus:ire-shadow-md focus:ire-outline-none"
        }, [
          (openBlock(!0), createElementBlock(Fragment, null, renderList($e.data, (Ne) => {
            var ze, Ae;
            return openBlock(), createElementBlock("option", {
              value: Ne.value,
              disabled: ((ze = Ne == null ? void 0 : Ne.title) == null ? void 0 : ze.includes("reserved")) && !unref(ke) || ((Ae = Ne == null ? void 0 : Ne.title) == null ? void 0 : Ae.includes("sold")) && !unref(De)
            }, toDisplayString(Ne.title), 9, _hoisted_4$4);
          }), 256))
        ], 512), [
          [vModelSelect, Re.value]
        ]),
        Be[1] || (Be[1] = createElementVNode("svg", {
          xmlns: "http://www.w3.org/2000/svg",
          fill: "none",
          viewBox: "0 0 24 24",
          "stroke-width": "1.2",
          stroke: "currentColor",
          class: "ire-absolute ire-right-2.5 ire-top-2.5 ire-ml-1 ire-h-5 ire-w-5 ire-text-slate-700"
        }, [
          createElementVNode("path", {
            "stroke-linecap": "round",
            "stroke-linejoin": "round",
            d: "M8.25 15 12 18.75 15.75 15m-7.5-6L12 5.25 15.75 9"
          })
        ], -1))
      ])
    ]));
  }
}), _export_sfc = (Le, _e) => {
  const ke = Le.__vccOpts || Le;
  for (const [De, Re] of _e)
    ke[De] = Re;
  return ke;
}, _sfc_main$f = {}, _hoisted_1$b = {
  xmlns: "http://www.w3.org/2000/svg",
  width: "32",
  height: "32",
  viewBox: "0 0 32 32",
  fill: "none"
};
function _sfc_render$3(Le, _e) {
  return openBlock(), createElementBlock("svg", _hoisted_1$b, _e[0] || (_e[0] = [
    createElementVNode("path", {
      d: "M22.7074 16.7076L12.7074 26.7076C12.6145 26.8005 12.5042 26.8742 12.3828 26.9245C12.2614 26.9747 12.1313 27.0006 11.9999 27.0006C11.8686 27.0006 11.7384 26.9747 11.617 26.9245C11.4957 26.8742 11.3854 26.8005 11.2924 26.7076C11.1995 26.6147 11.1258 26.5044 11.0756 26.383C11.0253 26.2616 10.9994 26.1315 10.9994 26.0001C10.9994 25.8687 11.0253 25.7386 11.0756 25.6172C11.1258 25.4958 11.1995 25.3855 11.2924 25.2926L20.5862 16.0001L11.2924 6.70757C11.1048 6.51993 10.9994 6.26543 10.9994 6.00007C10.9994 5.7347 11.1048 5.48021 11.2924 5.29257C11.4801 5.10493 11.7346 4.99951 11.9999 4.99951C12.2653 4.99951 12.5198 5.10493 12.7074 5.29257L22.7074 15.2926C22.8004 15.3854 22.8742 15.4957 22.9245 15.6171C22.9748 15.7385 23.0007 15.8687 23.0007 16.0001C23.0007 16.1315 22.9748 16.2616 22.9245 16.383C22.8742 16.5044 22.8004 16.6147 22.7074 16.7076Z",
      fill: "#44546F"
    }, null, -1)
  ]));
}
const ArrowRight = /* @__PURE__ */ _export_sfc(_sfc_main$f, [["render", _sfc_render$3]]), _hoisted_1$a = { class: "back-button ire-group/button ire-flex ire-w-fit ire-cursor-pointer ire-items-center ire-gap-1 ire-rounded-lg ire-border ire-bg-gray-50 ire-px-4 ire-py-2 ire-shadow-sm ire-transition-all hover:ire-bg-black lg:ire-px-5 lg:ire-py-2" }, _hoisted_2$6 = { class: "back-button-text !ire-text-sm ire-text-black group-hover/button:!ire-text-white lg:!ire-text-balance" }, _sfc_main$e = /* @__PURE__ */ defineComponent({
  __name: "BackButton",
  setup(Le) {
    return (_e, ke) => (openBlock(), createElementBlock("div", _hoisted_1$a, [
      createVNode(ArrowRight, { class: "ire-w-6 ire-rotate-180 group-hover/button:[&_path]:ire-fill-white" }),
      createElementVNode("div", _hoisted_2$6, toDisplayString(unref(tr)("back")), 1)
    ]));
  }
}), _hoisted_1$9 = { class: "ire-w-fit ire-bg-white" }, _hoisted_2$5 = { class: "ire-relative ire-h-full ire-select-none ire-overflow-hidden" }, _hoisted_3$5 = ["src"], _hoisted_4$3 = ["innerHTML"], _sfc_main$d = /* @__PURE__ */ defineComponent({
  __name: "FloorPreview",
  props: {
    flats: {},
    floor: {},
    floors: {},
    blocks: {},
    actions: {}
  },
  emits: ["changeComponent"],
  setup(Le, { emit: _e }) {
    const ke = _e, De = Le, Re = inject("showFlatModal"), $e = useGlobalStore(), { openReservedFlat: Be, openSoldFlat: Ne } = storeToRefs($e), ze = ref(), Ae = ref(null), Ie = ref(), je = ref(null), Fe = ref(), Ve = ref(), He = computed$1(() => {
      var qe;
      if ((qe = De.floor) != null && qe.svg)
        return De.floor.svg;
    }), We = computed$1(() => De.floors.filter(
      (qe) => {
        var Ue, Qe;
        return (
          // floorItem.conf !== "reserved" &&
          // floorItem.conf !== "sold" &&
          (Ue = De.floor) != null && Ue.block_id ? (qe == null ? void 0 : qe.block_id) === ((Qe = De.floor) == null ? void 0 : Qe.block_id) : !(qe != null && qe.block_id)
        );
      }
    ).map((qe) => {
      var Qe, Je;
      const Ue = (Qe = De.blocks) == null ? void 0 : Qe.find(
        (Ge) => {
          var ei;
          return (Ge == null ? void 0 : Ge.id) === ((ei = qe == null ? void 0 : qe.block_id) == null ? void 0 : ei.toString());
        }
      );
      return {
        title: ((Je = qe == null ? void 0 : qe.floor_number) == null ? void 0 : Je.toString()) + ` ${tr("floor")} ` + (Ue != null && Ue.id ? ` - ${Ue == null ? void 0 : Ue.title}` : "") + (qe != null && qe.conf ? " " + qe.conf : ""),
        value: qe == null ? void 0 : qe.id
      };
    }).sort((qe, Ue) => +(qe == null ? void 0 : qe.title) - +(Ue == null ? void 0 : Ue.title)) || []), Xe = (qe) => {
      const Ue = qe.target;
      Ue && (Ae.value = Ue);
    }, Ye = (qe) => {
      var Qe, Je, Ge;
      const Ue = qe.target;
      (Ue == null ? void 0 : Ue.nodeName) === "path" && (je.value && "conf" in je.value && (((Qe = je.value) == null ? void 0 : Qe.conf) === "reserved" && !Be.value || ((Je = je.value) == null ? void 0 : Je.conf) === "sold" && !Ne.value) || ke("changeComponent", ((Ge = Ie.value) == null ? void 0 : Ge.type) || "", je.value));
    }, Ze = () => {
      var qe;
      ze.value && ((qe = ze.value) == null ? void 0 : qe.querySelectorAll("g")).forEach((Qe) => {
        var ei, ii, oi, ni, ti, si;
        const Je = Qe == null ? void 0 : Qe.getAttribute("id"), Ge = (ii = (ei = De.floor) == null ? void 0 : ei.polygon_data) == null ? void 0 : ii.find(
          (ai) => (ai == null ? void 0 : ai.key) === Je
        );
        if (De.flats)
          if ((oi = De.floor) != null && oi.conf)
            Qe.setAttribute("conf", ((ni = De.floor) == null ? void 0 : ni.conf) || "");
          else {
            const ai = (ti = De.flats) == null ? void 0 : ti.find(
              (ri) => (ri == null ? void 0 : ri.id) === (Ge == null ? void 0 : Ge.id)
            );
            Qe == null || Qe.setAttribute("conf", ((si = ai == null ? void 0 : ai.conf) == null ? void 0 : si.toString()) || "");
          }
      });
    }, Ke = () => {
      var qe;
      (qe = De.floor) != null && qe.block_id ? ke("changeComponent", "block", Ve.value) : ke("changeComponent", "project", null);
    };
    return watch(
      () => Ae.value,
      (qe) => {
        var Qe, Je, Ge, ei, ii, oi, ni;
        if (!qe) return;
        $e.hoverdSvg = qe;
        const Ue = qe == null ? void 0 : qe.parentElement;
        if (Ue && (Ue == null ? void 0 : Ue.nodeName) === "g") {
          const ti = Ue.getAttribute("id");
          if (!ti || (Ie.value = ((Je = (Qe = De.floor) == null ? void 0 : Qe.polygon_data) == null ? void 0 : Je.find((si) => (si == null ? void 0 : si.key) === ti)) || null, !Ie.value)) return;
          if (((Ge = Ie.value) == null ? void 0 : Ge.type) === "flat") {
            const si = (ei = De.flats) == null ? void 0 : ei.find(
              (ri) => {
                var li;
                return (ri == null ? void 0 : ri.id) === ((li = Ie.value) == null ? void 0 : li.id);
              }
            ), ai = si ? {
              ...si,
              conf: si.conf || ((ii = De.floor) == null ? void 0 : ii.conf) || ""
            } : null;
            je.value = ai;
          } else if (((oi = Ie.value) == null ? void 0 : oi.type) === "tooltip") {
            const si = (ni = De.actions) == null ? void 0 : ni.find(
              (ai) => {
                var ri;
                return (ai == null ? void 0 : ai.id) === ((ri = Ie.value) == null ? void 0 : ri.id);
              }
            );
            je.value = si ?? null;
          } else
            je.value = null;
        } else
          Ie.value = null;
      }
    ), watch(
      () => Re == null ? void 0 : Re.value,
      () => {
        Re != null && Re.value || (Ae.value = null, Ie.value = null);
      }
    ), watch(
      () => Fe.value,
      () => {
        var Ue;
        const qe = (Ue = De.floors) == null ? void 0 : Ue.find(
          (Qe) => (Qe == null ? void 0 : Qe.id) === (Fe == null ? void 0 : Fe.value)
        );
        qe && ke("changeComponent", "floor", qe), setTimeout(() => {
          Ze();
        }, 0);
      }
    ), onMounted(() => {
      var qe, Ue, Qe;
      Ve.value = (qe = De.blocks) == null ? void 0 : qe.find(
        (Je) => {
          var Ge, ei;
          return (Je == null ? void 0 : Je.id) === ((ei = (Ge = De.floor) == null ? void 0 : Ge.block_id) == null ? void 0 : ei.toString());
        }
      ), Fe.value = (Qe = (Ue = We.value) == null ? void 0 : Ue.find(
        (Je) => {
          var Ge;
          return (Je == null ? void 0 : Je.value) == ((Ge = De.floor) == null ? void 0 : Ge.id);
        }
      )) == null ? void 0 : Qe.value, Ze(), document.addEventListener("mousemove", Xe);
    }), onUnmounted(() => {
      document.removeEventListener("mousemove", Xe);
    }), (qe, Ue) => {
      var Qe;
      return openBlock(), createBlock(_sfc_main$i, {
        hoverdData: je.value,
        type: (Qe = Ie.value) == null ? void 0 : Qe.type
      }, {
        header: withCtx(() => [
          createVNode(_sfc_main$e, { onClick: Ke }),
          createElementVNode("div", _hoisted_1$9, [
            createVNode(_sfc_main$g, {
              modelValue: Fe.value,
              "onUpdate:modelValue": Ue[0] || (Ue[0] = (Je) => Fe.value = Je),
              data: We.value
            }, null, 8, ["modelValue", "data"])
          ])
        ]),
        default: withCtx(() => {
          var Je, Ge, ei;
          return [
            createElementVNode("div", _hoisted_2$5, [
              createElementVNode("img", {
                src: ((ei = (Ge = (Je = qe.floor) == null ? void 0 : Je.floor_image) == null ? void 0 : Ge[0]) == null ? void 0 : ei.url) || "",
                alt: "",
                class: "ire-left-0 ire-top-0 ire-h-full ire-w-full"
              }, null, 8, _hoisted_3$5),
              (openBlock(), createElementBlock("div", {
                ref_key: "svgRef",
                ref: ze,
                innerHTML: He.value,
                key: He.value,
                class: "canvas ire-absolute ire-left-0 ire-top-0 ire-h-full ire-w-full [&_g[conf=reserved]_path]:ire-fill-[var(--reserved-color)] [&_g[conf=sold]_path]:ire-fill-[var(--sold-color)] [&_path]:ire-cursor-pointer [&_path]:ire-fill-[var(--path-color)] [&_path]:!ire-transition-all hover:[&_path]:ire-fill-[var(--path-hover-color)] [&_svg]:ire-h-full [&_svg]:ire-w-full",
                onClick: Ye
              }, null, 8, _hoisted_4$3))
            ])
          ];
        }),
        _: 1
      }, 8, ["hoverdData", "type"]);
    };
  }
}), _sfc_main$c = {}, _hoisted_1$8 = {
  width: "24",
  height: "24",
  viewBox: "0 0 24 24",
  fill: "none",
  xmlns: "http://www.w3.org/2000/svg"
};
function _sfc_render$2(Le, _e) {
  return openBlock(), createElementBlock("svg", _hoisted_1$8, _e[0] || (_e[0] = [
    createStaticVNode('<path d="M5.25 20.25H4.5C4.30109 20.25 4.11032 20.171 3.96967 20.0303C3.82902 19.8897 3.75 19.6989 3.75 19.5V18.75" stroke="white" stroke-linecap="round" stroke-linejoin="round"></path><path d="M10.5 8.25H8.25" stroke="white" stroke-linecap="round" stroke-linejoin="round"></path><path d="M10.5 20.25H9" stroke="white" stroke-linecap="round" stroke-linejoin="round"></path><path d="M15.75 15.75V13.5" stroke="white" stroke-linecap="round" stroke-linejoin="round"></path><path d="M3.75 15V13.5" stroke="white" stroke-linecap="round" stroke-linejoin="round"></path><path d="M14.25 20.25H15C15.1989 20.25 15.3897 20.171 15.5303 20.0303C15.671 19.8897 15.75 19.6989 15.75 19.5V18.75" stroke="white" stroke-linecap="round" stroke-linejoin="round"></path><path d="M14.25 8.25H15C15.1989 8.25 15.3897 8.32902 15.5303 8.46967C15.671 8.61032 15.75 8.80109 15.75 9V9.75" stroke="white" stroke-linecap="round" stroke-linejoin="round"></path><path d="M5.25 8.25H4.5C4.30109 8.25 4.11032 8.32902 3.96967 8.46967C3.82902 8.61032 3.75 8.80109 3.75 9V9.75" stroke="white" stroke-linecap="round" stroke-linejoin="round"></path><path d="M15.75 15.75H19.5C19.6989 15.75 19.8897 15.671 20.0303 15.5303C20.171 15.3897 20.25 15.1989 20.25 15V4.5C20.25 4.30109 20.171 4.11032 20.0303 3.96967C19.8897 3.82902 19.6989 3.75 19.5 3.75H9C8.80109 3.75 8.61032 3.82902 8.46967 3.96967C8.32902 4.11032 8.25 4.30109 8.25 4.5V8.25" stroke="white" stroke-linecap="round" stroke-linejoin="round"></path>', 9)
  ]));
}
const FlatIcon = /* @__PURE__ */ _export_sfc(_sfc_main$c, [["render", _sfc_render$2]]), t = (Le, _e = 1e4) => (Le = parseFloat(Le + "") || 0, Math.round((Le + Number.EPSILON) * _e) / _e), e = function(Le) {
  if (!(Le && Le instanceof Element && Le.offsetParent)) return !1;
  const _e = Le.scrollHeight > Le.clientHeight, ke = window.getComputedStyle(Le).overflowY, De = ke.indexOf("hidden") !== -1, Re = ke.indexOf("visible") !== -1;
  return _e && !De && !Re;
}, i = function(Le, _e = void 0) {
  return !(!Le || Le === document.body || _e && Le === _e) && (e(Le) ? Le : i(Le.parentElement, _e));
}, n = function(Le) {
  var _e = new DOMParser().parseFromString(Le, "text/html").body;
  if (_e.childElementCount > 1) {
    for (var ke = document.createElement("div"); _e.firstChild; ) ke.appendChild(_e.firstChild);
    return ke;
  }
  return _e.firstChild;
}, s = (Le) => `${Le || ""}`.split(" ").filter((_e) => !!_e), o = (Le, _e, ke) => {
  Le && s(_e).forEach((De) => {
    Le.classList.toggle(De, ke || !1);
  });
};
class a {
  constructor(_e) {
    Object.defineProperty(this, "pageX", { enumerable: !0, configurable: !0, writable: !0, value: void 0 }), Object.defineProperty(this, "pageY", { enumerable: !0, configurable: !0, writable: !0, value: void 0 }), Object.defineProperty(this, "clientX", { enumerable: !0, configurable: !0, writable: !0, value: void 0 }), Object.defineProperty(this, "clientY", { enumerable: !0, configurable: !0, writable: !0, value: void 0 }), Object.defineProperty(this, "id", { enumerable: !0, configurable: !0, writable: !0, value: void 0 }), Object.defineProperty(this, "time", { enumerable: !0, configurable: !0, writable: !0, value: void 0 }), Object.defineProperty(this, "nativePointer", { enumerable: !0, configurable: !0, writable: !0, value: void 0 }), this.nativePointer = _e, this.pageX = _e.pageX, this.pageY = _e.pageY, this.clientX = _e.clientX, this.clientY = _e.clientY, this.id = self.Touch && _e instanceof Touch ? _e.identifier : -1, this.time = Date.now();
  }
}
const r = { passive: !1 };
class l {
  constructor(_e, { start: ke = () => !0, move: De = () => {
  }, end: Re = () => {
  } }) {
    Object.defineProperty(this, "element", { enumerable: !0, configurable: !0, writable: !0, value: void 0 }), Object.defineProperty(this, "startCallback", { enumerable: !0, configurable: !0, writable: !0, value: void 0 }), Object.defineProperty(this, "moveCallback", { enumerable: !0, configurable: !0, writable: !0, value: void 0 }), Object.defineProperty(this, "endCallback", { enumerable: !0, configurable: !0, writable: !0, value: void 0 }), Object.defineProperty(this, "currentPointers", { enumerable: !0, configurable: !0, writable: !0, value: [] }), Object.defineProperty(this, "startPointers", { enumerable: !0, configurable: !0, writable: !0, value: [] }), this.element = _e, this.startCallback = ke, this.moveCallback = De, this.endCallback = Re;
    for (const $e of ["onPointerStart", "onTouchStart", "onMove", "onTouchEnd", "onPointerEnd", "onWindowBlur"]) this[$e] = this[$e].bind(this);
    this.element.addEventListener("mousedown", this.onPointerStart, r), this.element.addEventListener("touchstart", this.onTouchStart, r), this.element.addEventListener("touchmove", this.onMove, r), this.element.addEventListener("touchend", this.onTouchEnd), this.element.addEventListener("touchcancel", this.onTouchEnd);
  }
  onPointerStart(_e) {
    if (!_e.buttons || _e.button !== 0) return;
    const ke = new a(_e);
    this.currentPointers.some((De) => De.id === ke.id) || this.triggerPointerStart(ke, _e) && (window.addEventListener("mousemove", this.onMove), window.addEventListener("mouseup", this.onPointerEnd), window.addEventListener("blur", this.onWindowBlur));
  }
  onTouchStart(_e) {
    for (const ke of Array.from(_e.changedTouches || [])) this.triggerPointerStart(new a(ke), _e);
    window.addEventListener("blur", this.onWindowBlur);
  }
  onMove(_e) {
    const ke = this.currentPointers.slice(), De = "changedTouches" in _e ? Array.from(_e.changedTouches || []).map(($e) => new a($e)) : [new a(_e)], Re = [];
    for (const $e of De) {
      const Be = this.currentPointers.findIndex((Ne) => Ne.id === $e.id);
      Be < 0 || (Re.push($e), this.currentPointers[Be] = $e);
    }
    Re.length && this.moveCallback(_e, this.currentPointers.slice(), ke);
  }
  onPointerEnd(_e) {
    _e.buttons > 0 && _e.button !== 0 || (this.triggerPointerEnd(_e, new a(_e)), window.removeEventListener("mousemove", this.onMove), window.removeEventListener("mouseup", this.onPointerEnd), window.removeEventListener("blur", this.onWindowBlur));
  }
  onTouchEnd(_e) {
    for (const ke of Array.from(_e.changedTouches || [])) this.triggerPointerEnd(_e, new a(ke));
  }
  triggerPointerStart(_e, ke) {
    return !!this.startCallback(ke, _e, this.currentPointers.slice()) && (this.currentPointers.push(_e), this.startPointers.push(_e), !0);
  }
  triggerPointerEnd(_e, ke) {
    const De = this.currentPointers.findIndex((Re) => Re.id === ke.id);
    De < 0 || (this.currentPointers.splice(De, 1), this.startPointers.splice(De, 1), this.endCallback(_e, ke, this.currentPointers.slice()));
  }
  onWindowBlur() {
    this.clear();
  }
  clear() {
    for (; this.currentPointers.length; ) {
      const _e = this.currentPointers[this.currentPointers.length - 1];
      this.currentPointers.splice(this.currentPointers.length - 1, 1), this.startPointers.splice(this.currentPointers.length - 1, 1), this.endCallback(new Event("touchend", { bubbles: !0, cancelable: !0, clientX: _e.clientX, clientY: _e.clientY }), _e, this.currentPointers.slice());
    }
  }
  stop() {
    this.element.removeEventListener("mousedown", this.onPointerStart, r), this.element.removeEventListener("touchstart", this.onTouchStart, r), this.element.removeEventListener("touchmove", this.onMove, r), this.element.removeEventListener("touchend", this.onTouchEnd), this.element.removeEventListener("touchcancel", this.onTouchEnd), window.removeEventListener("mousemove", this.onMove), window.removeEventListener("mouseup", this.onPointerEnd), window.removeEventListener("blur", this.onWindowBlur);
  }
}
function c(Le, _e) {
  return _e ? Math.sqrt(Math.pow(_e.clientX - Le.clientX, 2) + Math.pow(_e.clientY - Le.clientY, 2)) : 0;
}
function h(Le, _e) {
  return _e ? { clientX: (Le.clientX + _e.clientX) / 2, clientY: (Le.clientY + _e.clientY) / 2 } : Le;
}
const d = (Le) => typeof Le == "object" && Le !== null && Le.constructor === Object && Object.prototype.toString.call(Le) === "[object Object]", u = (Le, ..._e) => {
  const ke = _e.length;
  for (let De = 0; De < ke; De++) {
    const Re = _e[De] || {};
    Object.entries(Re).forEach(([$e, Be]) => {
      const Ne = Array.isArray(Be) ? [] : {};
      Le[$e] || Object.assign(Le, { [$e]: Ne }), d(Be) ? Object.assign(Le[$e], u(Ne, Be)) : Array.isArray(Be) ? Object.assign(Le, { [$e]: [...Be] }) : Object.assign(Le, { [$e]: Be });
    });
  }
  return Le;
}, p = function(Le, _e) {
  return Le.split(".").reduce((ke, De) => typeof ke == "object" ? ke[De] : void 0, _e);
};
class f {
  constructor(_e = {}) {
    Object.defineProperty(this, "options", { enumerable: !0, configurable: !0, writable: !0, value: _e }), Object.defineProperty(this, "events", { enumerable: !0, configurable: !0, writable: !0, value: /* @__PURE__ */ new Map() }), this.setOptions(_e);
    for (const ke of Object.getOwnPropertyNames(Object.getPrototypeOf(this))) ke.startsWith("on") && typeof this[ke] == "function" && (this[ke] = this[ke].bind(this));
  }
  setOptions(_e) {
    this.options = _e ? u({}, this.constructor.defaults, _e) : {};
    for (const [ke, De] of Object.entries(this.option("on") || {})) this.on(ke, De);
  }
  option(_e, ...ke) {
    let De = p(_e, this.options);
    return De && typeof De == "function" && (De = De.call(this, this, ...ke)), De;
  }
  optionFor(_e, ke, De, ...Re) {
    let $e = p(ke, _e);
    var Be;
    typeof (Be = $e) != "string" || isNaN(Be) || isNaN(parseFloat(Be)) || ($e = parseFloat($e)), $e === "true" && ($e = !0), $e === "false" && ($e = !1), $e && typeof $e == "function" && ($e = $e.call(this, this, _e, ...Re));
    let Ne = p(ke, this.options);
    return Ne && typeof Ne == "function" ? $e = Ne.call(this, this, _e, ...Re, $e) : $e === void 0 && ($e = Ne), $e === void 0 ? De : $e;
  }
  cn(_e) {
    const ke = this.options.classes;
    return ke && ke[_e] || "";
  }
  localize(_e, ke = []) {
    _e = String(_e).replace(/\{\{(\w+).?(\w+)?\}\}/g, (De, Re, $e) => {
      let Be = "";
      return $e ? Be = this.option(`${Re[0] + Re.toLowerCase().substring(1)}.l10n.${$e}`) : Re && (Be = this.option(`l10n.${Re}`)), Be || (Be = De), Be;
    });
    for (let De = 0; De < ke.length; De++) _e = _e.split(ke[De][0]).join(ke[De][1]);
    return _e = _e.replace(/\{\{(.*?)\}\}/g, (De, Re) => Re);
  }
  on(_e, ke) {
    let De = [];
    typeof _e == "string" ? De = _e.split(" ") : Array.isArray(_e) && (De = _e), this.events || (this.events = /* @__PURE__ */ new Map()), De.forEach((Re) => {
      let $e = this.events.get(Re);
      $e || (this.events.set(Re, []), $e = []), $e.includes(ke) || $e.push(ke), this.events.set(Re, $e);
    });
  }
  off(_e, ke) {
    let De = [];
    typeof _e == "string" ? De = _e.split(" ") : Array.isArray(_e) && (De = _e), De.forEach((Re) => {
      const $e = this.events.get(Re);
      if (Array.isArray($e)) {
        const Be = $e.indexOf(ke);
        Be > -1 && $e.splice(Be, 1);
      }
    });
  }
  emit(_e, ...ke) {
    [...this.events.get(_e) || []].forEach((De) => De(this, ...ke)), _e !== "*" && this.emit("*", _e, ...ke);
  }
}
Object.defineProperty(f, "version", { enumerable: !0, configurable: !0, writable: !0, value: "5.0.36" }), Object.defineProperty(f, "defaults", { enumerable: !0, configurable: !0, writable: !0, value: {} });
class g extends f {
  constructor(_e = {}) {
    super(_e), Object.defineProperty(this, "plugins", { enumerable: !0, configurable: !0, writable: !0, value: {} });
  }
  attachPlugins(_e = {}) {
    const ke = /* @__PURE__ */ new Map();
    for (const [De, Re] of Object.entries(_e)) {
      const $e = this.option(De), Be = this.plugins[De];
      Be || $e === !1 ? Be && $e === !1 && (Be.detach(), delete this.plugins[De]) : ke.set(De, new Re(this, $e || {}));
    }
    for (const [De, Re] of ke) this.plugins[De] = Re, Re.attach();
  }
  detachPlugins(_e) {
    _e = _e || Object.keys(this.plugins);
    for (const ke of _e) {
      const De = this.plugins[ke];
      De && De.detach(), delete this.plugins[ke];
    }
    return this.emit("detachPlugins"), this;
  }
}
var m;
(function(Le) {
  Le[Le.Init = 0] = "Init", Le[Le.Error = 1] = "Error", Le[Le.Ready = 2] = "Ready", Le[Le.Panning = 3] = "Panning", Le[Le.Mousemove = 4] = "Mousemove", Le[Le.Destroy = 5] = "Destroy";
})(m || (m = {}));
const v = ["a", "b", "c", "d", "e", "f"], b = { PANUP: "Move up", PANDOWN: "Move down", PANLEFT: "Move left", PANRIGHT: "Move right", ZOOMIN: "Zoom in", ZOOMOUT: "Zoom out", TOGGLEZOOM: "Toggle zoom level", TOGGLE1TO1: "Toggle zoom level", ITERATEZOOM: "Toggle zoom level", ROTATECCW: "Rotate counterclockwise", ROTATECW: "Rotate clockwise", FLIPX: "Flip horizontally", FLIPY: "Flip vertically", FITX: "Fit horizontally", FITY: "Fit vertically", RESET: "Reset", TOGGLEFS: "Toggle fullscreen" }, y = { content: null, width: "auto", height: "auto", panMode: "drag", touch: !0, dragMinThreshold: 3, lockAxis: !1, mouseMoveFactor: 1, mouseMoveFriction: 0.12, zoom: !0, pinchToZoom: !0, panOnlyZoomed: "auto", minScale: 1, maxScale: 2, friction: 0.25, dragFriction: 0.35, decelFriction: 0.05, click: "toggleZoom", dblClick: !1, wheel: "zoom", wheelLimit: 7, spinner: !0, bounds: "auto", infinite: !1, rubberband: !0, bounce: !0, maxVelocity: 75, transformParent: !1, classes: { content: "f-panzoom__content", isLoading: "is-loading", canZoomIn: "can-zoom_in", canZoomOut: "can-zoom_out", isDraggable: "is-draggable", isDragging: "is-dragging", inFullscreen: "in-fullscreen", htmlHasFullscreen: "with-panzoom-in-fullscreen" }, l10n: b }, w = '<circle cx="25" cy="25" r="20"></circle>', x = '<div class="f-spinner"><svg viewBox="0 0 50 50">' + w + w + "</svg></div>", E = (Le) => Le && Le !== null && Le instanceof Element && "nodeType" in Le, S = (Le, _e) => {
  Le && s(_e).forEach((ke) => {
    Le.classList.remove(ke);
  });
}, P = (Le, _e) => {
  Le && s(_e).forEach((ke) => {
    Le.classList.add(ke);
  });
}, C = { a: 1, b: 0, c: 0, d: 1, e: 0, f: 0 }, T = 1e5, M = 1e4, O = "mousemove", A = "drag", L = "content", z = "auto";
let R = null, k = null;
class I extends g {
  get fits() {
    return this.contentRect.width - this.contentRect.fitWidth < 1 && this.contentRect.height - this.contentRect.fitHeight < 1;
  }
  get isTouchDevice() {
    return k === null && (k = window.matchMedia("(hover: none)").matches), k;
  }
  get isMobile() {
    return R === null && (R = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)), R;
  }
  get panMode() {
    return this.options.panMode !== O || this.isTouchDevice ? A : O;
  }
  get panOnlyZoomed() {
    const _e = this.options.panOnlyZoomed;
    return _e === z ? this.isTouchDevice : _e;
  }
  get isInfinite() {
    return this.option("infinite");
  }
  get angle() {
    return 180 * Math.atan2(this.current.b, this.current.a) / Math.PI || 0;
  }
  get targetAngle() {
    return 180 * Math.atan2(this.target.b, this.target.a) / Math.PI || 0;
  }
  get scale() {
    const { a: _e, b: ke } = this.current;
    return Math.sqrt(_e * _e + ke * ke) || 1;
  }
  get targetScale() {
    const { a: _e, b: ke } = this.target;
    return Math.sqrt(_e * _e + ke * ke) || 1;
  }
  get minScale() {
    return this.option("minScale") || 1;
  }
  get fullScale() {
    const { contentRect: _e } = this;
    return _e.fullWidth / _e.fitWidth || 1;
  }
  get maxScale() {
    return this.fullScale * (this.option("maxScale") || 1) || 1;
  }
  get coverScale() {
    const { containerRect: _e, contentRect: ke } = this, De = Math.max(_e.height / ke.fitHeight, _e.width / ke.fitWidth) || 1;
    return Math.min(this.fullScale, De);
  }
  get isScaling() {
    return Math.abs(this.targetScale - this.scale) > 1e-5 && !this.isResting;
  }
  get isContentLoading() {
    const _e = this.content;
    return !!(_e && _e instanceof HTMLImageElement) && !_e.complete;
  }
  get isResting() {
    if (this.isBouncingX || this.isBouncingY) return !1;
    for (const _e of v) {
      const ke = _e == "e" || _e === "f" ? 1e-4 : 1e-5;
      if (Math.abs(this.target[_e] - this.current[_e]) > ke) return !1;
    }
    return !(!this.ignoreBounds && !this.checkBounds().inBounds);
  }
  constructor(_e, ke = {}, De = {}) {
    var Re;
    if (super(ke), Object.defineProperty(this, "pointerTracker", { enumerable: !0, configurable: !0, writable: !0, value: null }), Object.defineProperty(this, "resizeObserver", { enumerable: !0, configurable: !0, writable: !0, value: null }), Object.defineProperty(this, "updateTimer", { enumerable: !0, configurable: !0, writable: !0, value: null }), Object.defineProperty(this, "clickTimer", { enumerable: !0, configurable: !0, writable: !0, value: null }), Object.defineProperty(this, "rAF", { enumerable: !0, configurable: !0, writable: !0, value: null }), Object.defineProperty(this, "isTicking", { enumerable: !0, configurable: !0, writable: !0, value: !1 }), Object.defineProperty(this, "ignoreBounds", { enumerable: !0, configurable: !0, writable: !0, value: !1 }), Object.defineProperty(this, "isBouncingX", { enumerable: !0, configurable: !0, writable: !0, value: !1 }), Object.defineProperty(this, "isBouncingY", { enumerable: !0, configurable: !0, writable: !0, value: !1 }), Object.defineProperty(this, "clicks", { enumerable: !0, configurable: !0, writable: !0, value: 0 }), Object.defineProperty(this, "trackingPoints", { enumerable: !0, configurable: !0, writable: !0, value: [] }), Object.defineProperty(this, "pwt", { enumerable: !0, configurable: !0, writable: !0, value: 0 }), Object.defineProperty(this, "cwd", { enumerable: !0, configurable: !0, writable: !0, value: 0 }), Object.defineProperty(this, "pmme", { enumerable: !0, configurable: !0, writable: !0, value: void 0 }), Object.defineProperty(this, "friction", { enumerable: !0, configurable: !0, writable: !0, value: 0 }), Object.defineProperty(this, "state", { enumerable: !0, configurable: !0, writable: !0, value: m.Init }), Object.defineProperty(this, "isDragging", { enumerable: !0, configurable: !0, writable: !0, value: !1 }), Object.defineProperty(this, "container", { enumerable: !0, configurable: !0, writable: !0, value: void 0 }), Object.defineProperty(this, "content", { enumerable: !0, configurable: !0, writable: !0, value: void 0 }), Object.defineProperty(this, "spinner", { enumerable: !0, configurable: !0, writable: !0, value: null }), Object.defineProperty(this, "containerRect", { enumerable: !0, configurable: !0, writable: !0, value: { width: 0, height: 0, innerWidth: 0, innerHeight: 0 } }), Object.defineProperty(this, "contentRect", { enumerable: !0, configurable: !0, writable: !0, value: { top: 0, right: 0, bottom: 0, left: 0, fullWidth: 0, fullHeight: 0, fitWidth: 0, fitHeight: 0, width: 0, height: 0 } }), Object.defineProperty(this, "dragStart", { enumerable: !0, configurable: !0, writable: !0, value: { x: 0, y: 0, top: 0, left: 0, time: 0 } }), Object.defineProperty(this, "dragOffset", { enumerable: !0, configurable: !0, writable: !0, value: { x: 0, y: 0, time: 0 } }), Object.defineProperty(this, "current", { enumerable: !0, configurable: !0, writable: !0, value: Object.assign({}, C) }), Object.defineProperty(this, "target", { enumerable: !0, configurable: !0, writable: !0, value: Object.assign({}, C) }), Object.defineProperty(this, "velocity", { enumerable: !0, configurable: !0, writable: !0, value: { a: 0, b: 0, c: 0, d: 0, e: 0, f: 0 } }), Object.defineProperty(this, "lockedAxis", { enumerable: !0, configurable: !0, writable: !0, value: !1 }), !_e) throw new Error("Container Element Not Found");
    this.container = _e, this.initContent(), this.attachPlugins(Object.assign(Object.assign({}, I.Plugins), De)), this.emit("attachPlugins"), this.emit("init");
    const $e = this.content;
    if ($e.addEventListener("load", this.onLoad), $e.addEventListener("error", this.onError), this.isContentLoading) {
      if (this.option("spinner")) {
        _e.classList.add(this.cn("isLoading"));
        const Be = n(x);
        !_e.contains($e) || $e.parentElement instanceof HTMLPictureElement ? this.spinner = _e.appendChild(Be) : this.spinner = ((Re = $e.parentElement) === null || Re === void 0 ? void 0 : Re.insertBefore(Be, $e)) || null;
      }
      this.emit("beforeLoad");
    } else queueMicrotask(() => {
      this.enable();
    });
  }
  initContent() {
    const { container: _e } = this, ke = this.cn(L);
    let De = this.option(L) || _e.querySelector(`.${ke}`);
    if (De || (De = _e.querySelector("img,picture") || _e.firstElementChild, De && P(De, ke)), De instanceof HTMLPictureElement && (De = De.querySelector("img")), !De) throw new Error("No content found");
    this.content = De;
  }
  onLoad() {
    const { spinner: _e, container: ke, state: De } = this;
    _e && (_e.remove(), this.spinner = null), this.option("spinner") && ke.classList.remove(this.cn("isLoading")), this.emit("afterLoad"), De === m.Init ? this.enable() : this.updateMetrics();
  }
  onError() {
    this.state !== m.Destroy && (this.spinner && (this.spinner.remove(), this.spinner = null), this.stop(), this.detachEvents(), this.state = m.Error, this.emit("error"));
  }
  getNextScale(_e) {
    const { fullScale: ke, targetScale: De, coverScale: Re, maxScale: $e, minScale: Be } = this;
    let Ne = Be;
    switch (_e) {
      case "toggleMax":
        Ne = De - Be < 0.5 * ($e - Be) ? $e : Be;
        break;
      case "toggleCover":
        Ne = De - Be < 0.5 * (Re - Be) ? Re : Be;
        break;
      case "toggleZoom":
        Ne = De - Be < 0.5 * (ke - Be) ? ke : Be;
        break;
      case "iterateZoom":
        let ze = [1, ke, $e].sort((Ie, je) => Ie - je), Ae = ze.findIndex((Ie) => Ie > De + 1e-5);
        Ne = ze[Ae] || 1;
    }
    return Ne;
  }
  attachObserver() {
    var _e;
    const ke = () => {
      const { container: De, containerRect: Re } = this;
      return Math.abs(Re.width - De.getBoundingClientRect().width) > 0.1 || Math.abs(Re.height - De.getBoundingClientRect().height) > 0.1;
    };
    this.resizeObserver || window.ResizeObserver === void 0 || (this.resizeObserver = new ResizeObserver(() => {
      this.updateTimer || (ke() ? (this.onResize(), this.isMobile && (this.updateTimer = setTimeout(() => {
        ke() && this.onResize(), this.updateTimer = null;
      }, 500))) : this.updateTimer && (clearTimeout(this.updateTimer), this.updateTimer = null));
    })), (_e = this.resizeObserver) === null || _e === void 0 || _e.observe(this.container);
  }
  detachObserver() {
    var _e;
    (_e = this.resizeObserver) === null || _e === void 0 || _e.disconnect();
  }
  attachEvents() {
    const { container: _e } = this;
    _e.addEventListener("click", this.onClick, { passive: !1, capture: !1 }), _e.addEventListener("wheel", this.onWheel, { passive: !1 }), this.pointerTracker = new l(_e, { start: this.onPointerDown, move: this.onPointerMove, end: this.onPointerUp }), document.addEventListener(O, this.onMouseMove);
  }
  detachEvents() {
    var _e;
    const { container: ke } = this;
    ke.removeEventListener("click", this.onClick, { passive: !1, capture: !1 }), ke.removeEventListener("wheel", this.onWheel, { passive: !1 }), (_e = this.pointerTracker) === null || _e === void 0 || _e.stop(), this.pointerTracker = null, document.removeEventListener(O, this.onMouseMove), document.removeEventListener("keydown", this.onKeydown, !0), this.clickTimer && (clearTimeout(this.clickTimer), this.clickTimer = null), this.updateTimer && (clearTimeout(this.updateTimer), this.updateTimer = null);
  }
  animate() {
    this.setTargetForce();
    const _e = this.friction, ke = this.option("maxVelocity");
    for (const De of v) _e ? (this.velocity[De] *= 1 - _e, ke && !this.isScaling && (this.velocity[De] = Math.max(Math.min(this.velocity[De], ke), -1 * ke)), this.current[De] += this.velocity[De]) : this.current[De] = this.target[De];
    this.setTransform(), this.setEdgeForce(), !this.isResting || this.isDragging ? this.rAF = requestAnimationFrame(() => this.animate()) : this.stop("current");
  }
  setTargetForce() {
    for (const _e of v) _e === "e" && this.isBouncingX || _e === "f" && this.isBouncingY || (this.velocity[_e] = (1 / (1 - this.friction) - 1) * (this.target[_e] - this.current[_e]));
  }
  checkBounds(_e = 0, ke = 0) {
    const { current: De } = this, Re = De.e + _e, $e = De.f + ke, Be = this.getBounds(), { x: Ne, y: ze } = Be, Ae = Ne.min, Ie = Ne.max, je = ze.min, Fe = ze.max;
    let Ve = 0, He = 0;
    return Ae !== 1 / 0 && Re < Ae ? Ve = Ae - Re : Ie !== 1 / 0 && Re > Ie && (Ve = Ie - Re), je !== 1 / 0 && $e < je ? He = je - $e : Fe !== 1 / 0 && $e > Fe && (He = Fe - $e), Math.abs(Ve) < 1e-4 && (Ve = 0), Math.abs(He) < 1e-4 && (He = 0), Object.assign(Object.assign({}, Be), { xDiff: Ve, yDiff: He, inBounds: !Ve && !He });
  }
  clampTargetBounds() {
    const { target: _e } = this, { x: ke, y: De } = this.getBounds();
    ke.min !== 1 / 0 && (_e.e = Math.max(_e.e, ke.min)), ke.max !== 1 / 0 && (_e.e = Math.min(_e.e, ke.max)), De.min !== 1 / 0 && (_e.f = Math.max(_e.f, De.min)), De.max !== 1 / 0 && (_e.f = Math.min(_e.f, De.max));
  }
  calculateContentDim(_e = this.current) {
    const { content: ke, contentRect: De } = this, { fitWidth: Re, fitHeight: $e, fullWidth: Be, fullHeight: Ne } = De;
    let ze = Be, Ae = Ne;
    if (this.option("zoom") || this.angle !== 0) {
      const Ie = !(ke instanceof HTMLImageElement) && (window.getComputedStyle(ke).maxWidth === "none" || window.getComputedStyle(ke).maxHeight === "none"), je = Ie ? Be : Re, Fe = Ie ? Ne : $e, Ve = this.getMatrix(_e), He = new DOMPoint(0, 0).matrixTransform(Ve), We = new DOMPoint(0 + je, 0).matrixTransform(Ve), Xe = new DOMPoint(0 + je, 0 + Fe).matrixTransform(Ve), Ye = new DOMPoint(0, 0 + Fe).matrixTransform(Ve), Ze = Math.abs(Xe.x - He.x), Ke = Math.abs(Xe.y - He.y), qe = Math.abs(Ye.x - We.x), Ue = Math.abs(Ye.y - We.y);
      ze = Math.max(Ze, qe), Ae = Math.max(Ke, Ue);
    }
    return { contentWidth: ze, contentHeight: Ae };
  }
  setEdgeForce() {
    if (this.ignoreBounds || this.isDragging || this.panMode === O || this.targetScale < this.scale) return this.isBouncingX = !1, void (this.isBouncingY = !1);
    const { target: _e } = this, { x: ke, y: De, xDiff: Re, yDiff: $e } = this.checkBounds(), Be = this.option("maxVelocity");
    let Ne = this.velocity.e, ze = this.velocity.f;
    Re !== 0 ? (this.isBouncingX = !0, Re * Ne <= 0 ? Ne += 0.14 * Re : (Ne = 0.14 * Re, ke.min !== 1 / 0 && (this.target.e = Math.max(_e.e, ke.min)), ke.max !== 1 / 0 && (this.target.e = Math.min(_e.e, ke.max))), Be && (Ne = Math.max(Math.min(Ne, Be), -1 * Be))) : this.isBouncingX = !1, $e !== 0 ? (this.isBouncingY = !0, $e * ze <= 0 ? ze += 0.14 * $e : (ze = 0.14 * $e, De.min !== 1 / 0 && (this.target.f = Math.max(_e.f, De.min)), De.max !== 1 / 0 && (this.target.f = Math.min(_e.f, De.max))), Be && (ze = Math.max(Math.min(ze, Be), -1 * Be))) : this.isBouncingY = !1, this.isBouncingX && (this.velocity.e = Ne), this.isBouncingY && (this.velocity.f = ze);
  }
  enable() {
    const { content: _e } = this, ke = new DOMMatrixReadOnly(window.getComputedStyle(_e).transform);
    for (const De of v) this.current[De] = this.target[De] = ke[De];
    this.updateMetrics(), this.attachObserver(), this.attachEvents(), this.state = m.Ready, this.emit("ready");
  }
  onClick(_e) {
    var ke;
    _e.type === "click" && _e.detail === 0 && (this.dragOffset.x = 0, this.dragOffset.y = 0), this.isDragging && ((ke = this.pointerTracker) === null || ke === void 0 || ke.clear(), this.trackingPoints = [], this.startDecelAnim());
    const De = _e.target;
    if (!De || _e.defaultPrevented) return;
    if (De.hasAttribute("disabled")) return _e.preventDefault(), void _e.stopPropagation();
    if ((() => {
      const Ve = window.getSelection();
      return Ve && Ve.type === "Range";
    })() && !De.closest("button")) return;
    const Re = De.closest("[data-panzoom-action]"), $e = De.closest("[data-panzoom-change]"), Be = Re || $e, Ne = Be && E(Be) ? Be.dataset : null;
    if (Ne) {
      const Ve = Ne.panzoomChange, He = Ne.panzoomAction;
      if ((Ve || He) && _e.preventDefault(), Ve) {
        let We = {};
        try {
          We = JSON.parse(Ve);
        } catch {
          console && console.warn("The given data was not valid JSON");
        }
        return void this.applyChange(We);
      }
      if (He) return void (this[He] && this[He]());
    }
    if (Math.abs(this.dragOffset.x) > 3 || Math.abs(this.dragOffset.y) > 3) return _e.preventDefault(), void _e.stopPropagation();
    if (De.closest("[data-fancybox]")) return;
    const ze = this.content.getBoundingClientRect(), Ae = this.dragStart;
    if (Ae.time && !this.canZoomOut() && (Math.abs(ze.x - Ae.x) > 2 || Math.abs(ze.y - Ae.y) > 2)) return;
    this.dragStart.time = 0;
    const Ie = (Ve) => {
      this.option("zoom", _e) && Ve && typeof Ve == "string" && /(iterateZoom)|(toggle(Zoom|Full|Cover|Max)|(zoomTo(Fit|Cover|Max)))/.test(Ve) && typeof this[Ve] == "function" && (_e.preventDefault(), this[Ve]({ event: _e }));
    }, je = this.option("click", _e), Fe = this.option("dblClick", _e);
    Fe ? (this.clicks++, this.clicks == 1 && (this.clickTimer = setTimeout(() => {
      this.clicks === 1 ? (this.emit("click", _e), !_e.defaultPrevented && je && Ie(je)) : (this.emit("dblClick", _e), _e.defaultPrevented || Ie(Fe)), this.clicks = 0, this.clickTimer = null;
    }, 350))) : (this.emit("click", _e), !_e.defaultPrevented && je && Ie(je));
  }
  addTrackingPoint(_e) {
    const ke = this.trackingPoints.filter((De) => De.time > Date.now() - 100);
    ke.push(_e), this.trackingPoints = ke;
  }
  onPointerDown(_e, ke, De) {
    var Re;
    if (this.option("touch", _e) === !1) return !1;
    this.pwt = 0, this.dragOffset = { x: 0, y: 0, time: 0 }, this.trackingPoints = [];
    const $e = this.content.getBoundingClientRect();
    if (this.dragStart = { x: $e.x, y: $e.y, top: $e.top, left: $e.left, time: Date.now() }, this.clickTimer) return !1;
    if (this.panMode === O && this.targetScale > 1) return _e.preventDefault(), _e.stopPropagation(), !1;
    const Be = _e.composedPath()[0];
    if (!De.length) {
      if (["TEXTAREA", "OPTION", "INPUT", "SELECT", "VIDEO", "IFRAME"].includes(Be.nodeName) || Be.closest("[contenteditable],[data-selectable],[data-draggable],[data-clickable],[data-panzoom-change],[data-panzoom-action]")) return !1;
      (Re = window.getSelection()) === null || Re === void 0 || Re.removeAllRanges();
    }
    if (_e.type === "mousedown") ["A", "BUTTON"].includes(Be.nodeName) || _e.preventDefault();
    else if (Math.abs(this.velocity.a) > 0.3) return !1;
    return this.target.e = this.current.e, this.target.f = this.current.f, this.stop(), this.isDragging || (this.isDragging = !0, this.addTrackingPoint(ke), this.emit("touchStart", _e)), !0;
  }
  onPointerMove(_e, ke, De) {
    if (this.option("touch", _e) === !1 || !this.isDragging || ke.length < 2 && this.panOnlyZoomed && t(this.targetScale) <= t(this.minScale) || (this.emit("touchMove", _e), _e.defaultPrevented)) return;
    this.addTrackingPoint(ke[0]);
    const { content: Re } = this, $e = h(De[0], De[1]), Be = h(ke[0], ke[1]);
    let Ne = 0, ze = 0;
    if (ke.length > 1) {
      const Ke = Re.getBoundingClientRect();
      Ne = $e.clientX - Ke.left - 0.5 * Ke.width, ze = $e.clientY - Ke.top - 0.5 * Ke.height;
    }
    const Ae = c(De[0], De[1]), Ie = c(ke[0], ke[1]);
    let je = Ae ? Ie / Ae : 1, Fe = Be.clientX - $e.clientX, Ve = Be.clientY - $e.clientY;
    this.dragOffset.x += Fe, this.dragOffset.y += Ve, this.dragOffset.time = Date.now() - this.dragStart.time;
    let He = t(this.targetScale) === t(this.minScale) && this.option("lockAxis");
    if (He && !this.lockedAxis) if (He === "xy" || He === "y" || _e.type === "touchmove") {
      if (Math.abs(this.dragOffset.x) < 6 && Math.abs(this.dragOffset.y) < 6) return void _e.preventDefault();
      const Ke = Math.abs(180 * Math.atan2(this.dragOffset.y, this.dragOffset.x) / Math.PI);
      this.lockedAxis = Ke > 45 && Ke < 135 ? "y" : "x", this.dragOffset.x = 0, this.dragOffset.y = 0, Fe = 0, Ve = 0;
    } else this.lockedAxis = He;
    if (i(_e.target, this.content) && (He = "x", this.dragOffset.y = 0), He && He !== "xy" && this.lockedAxis !== He && t(this.targetScale) === t(this.minScale)) return;
    _e.cancelable && _e.preventDefault(), this.container.classList.add(this.cn("isDragging"));
    const We = this.checkBounds(Fe, Ve);
    this.option("rubberband") ? (this.isInfinite !== "x" && (We.xDiff > 0 && Fe < 0 || We.xDiff < 0 && Fe > 0) && (Fe *= Math.max(0, 0.5 - Math.abs(0.75 / this.contentRect.fitWidth * We.xDiff))), this.isInfinite !== "y" && (We.yDiff > 0 && Ve < 0 || We.yDiff < 0 && Ve > 0) && (Ve *= Math.max(0, 0.5 - Math.abs(0.75 / this.contentRect.fitHeight * We.yDiff)))) : (We.xDiff && (Fe = 0), We.yDiff && (Ve = 0));
    const Xe = this.targetScale, Ye = this.minScale, Ze = this.maxScale;
    Xe < 0.5 * Ye && (je = Math.max(je, Ye)), Xe > 1.5 * Ze && (je = Math.min(je, Ze)), this.lockedAxis === "y" && t(Xe) === t(Ye) && (Fe = 0), this.lockedAxis === "x" && t(Xe) === t(Ye) && (Ve = 0), this.applyChange({ originX: Ne, originY: ze, panX: Fe, panY: Ve, scale: je, friction: this.option("dragFriction"), ignoreBounds: !0 });
  }
  onPointerUp(_e, ke, De) {
    if (De.length) return this.dragOffset.x = 0, this.dragOffset.y = 0, void (this.trackingPoints = []);
    this.container.classList.remove(this.cn("isDragging")), this.isDragging && (this.addTrackingPoint(ke), this.panOnlyZoomed && this.contentRect.width - this.contentRect.fitWidth < 1 && this.contentRect.height - this.contentRect.fitHeight < 1 && (this.trackingPoints = []), i(_e.target, this.content) && this.lockedAxis === "y" && (this.trackingPoints = []), this.emit("touchEnd", _e), this.isDragging = !1, this.lockedAxis = !1, this.state !== m.Destroy && (_e.defaultPrevented || this.startDecelAnim()));
  }
  startDecelAnim() {
    var _e;
    const ke = this.isScaling;
    this.rAF && (cancelAnimationFrame(this.rAF), this.rAF = null), this.isBouncingX = !1, this.isBouncingY = !1;
    for (const Ke of v) this.velocity[Ke] = 0;
    this.target.e = this.current.e, this.target.f = this.current.f, S(this.container, "is-scaling"), S(this.container, "is-animating"), this.isTicking = !1;
    const { trackingPoints: De } = this, Re = De[0], $e = De[De.length - 1];
    let Be = 0, Ne = 0, ze = 0;
    $e && Re && (Be = $e.clientX - Re.clientX, Ne = $e.clientY - Re.clientY, ze = $e.time - Re.time);
    const Ae = ((_e = window.visualViewport) === null || _e === void 0 ? void 0 : _e.scale) || 1;
    Ae !== 1 && (Be *= Ae, Ne *= Ae);
    let Ie = 0, je = 0, Fe = 0, Ve = 0, He = this.option("decelFriction");
    const We = this.targetScale;
    if (ze > 0) {
      Fe = Math.abs(Be) > 3 ? Be / (ze / 30) : 0, Ve = Math.abs(Ne) > 3 ? Ne / (ze / 30) : 0;
      const Ke = this.option("maxVelocity");
      Ke && (Fe = Math.max(Math.min(Fe, Ke), -1 * Ke), Ve = Math.max(Math.min(Ve, Ke), -1 * Ke));
    }
    Fe && (Ie = Fe / (1 / (1 - He) - 1)), Ve && (je = Ve / (1 / (1 - He) - 1)), (this.option("lockAxis") === "y" || this.option("lockAxis") === "xy" && this.lockedAxis === "y" && t(We) === this.minScale) && (Ie = Fe = 0), (this.option("lockAxis") === "x" || this.option("lockAxis") === "xy" && this.lockedAxis === "x" && t(We) === this.minScale) && (je = Ve = 0);
    const Xe = this.dragOffset.x, Ye = this.dragOffset.y, Ze = this.option("dragMinThreshold") || 0;
    Math.abs(Xe) < Ze && Math.abs(Ye) < Ze && (Ie = je = 0, Fe = Ve = 0), (this.option("zoom") && (We < this.minScale - 1e-5 || We > this.maxScale + 1e-5) || ke && !Ie && !je) && (He = 0.35), this.applyChange({ panX: Ie, panY: je, friction: He }), this.emit("decel", Fe, Ve, Xe, Ye);
  }
  onWheel(_e) {
    var ke = [-_e.deltaX || 0, -_e.deltaY || 0, -_e.detail || 0].reduce(function($e, Be) {
      return Math.abs(Be) > Math.abs($e) ? Be : $e;
    });
    const De = Math.max(-1, Math.min(1, ke));
    if (this.emit("wheel", _e, De), this.panMode === O || _e.defaultPrevented) return;
    const Re = this.option("wheel");
    Re === "pan" ? (_e.preventDefault(), this.panOnlyZoomed && !this.canZoomOut() || this.applyChange({ panX: 2 * -_e.deltaX, panY: 2 * -_e.deltaY, bounce: !1 })) : Re === "zoom" && this.option("zoom") !== !1 && this.zoomWithWheel(_e);
  }
  onMouseMove(_e) {
    this.panWithMouse(_e);
  }
  onKeydown(_e) {
    _e.key === "Escape" && this.toggleFS();
  }
  onResize() {
    this.updateMetrics(), this.checkBounds().inBounds || this.requestTick();
  }
  setTransform() {
    this.emit("beforeTransform");
    const { current: _e, target: ke, content: De, contentRect: Re } = this, $e = Object.assign({}, C);
    for (const Xe of v) {
      const Ye = Xe == "e" || Xe === "f" ? M : T;
      $e[Xe] = t(_e[Xe], Ye), Math.abs(ke[Xe] - _e[Xe]) < (Xe == "e" || Xe === "f" ? 0.51 : 1e-3) && (_e[Xe] = ke[Xe]);
    }
    let { a: Be, b: Ne, c: ze, d: Ae, e: Ie, f: je } = $e, Fe = `matrix(${Be}, ${Ne}, ${ze}, ${Ae}, ${Ie}, ${je})`, Ve = De.parentElement instanceof HTMLPictureElement ? De.parentElement : De;
    if (this.option("transformParent") && (Ve = Ve.parentElement || Ve), Ve.style.transform === Fe) return;
    Ve.style.transform = Fe;
    const { contentWidth: He, contentHeight: We } = this.calculateContentDim();
    Re.width = He, Re.height = We, this.emit("afterTransform");
  }
  updateMetrics(_e = !1) {
    var ke;
    if (!this || this.state === m.Destroy || this.isContentLoading) return;
    const De = Math.max(1, ((ke = window.visualViewport) === null || ke === void 0 ? void 0 : ke.scale) || 1), { container: Re, content: $e } = this, Be = $e instanceof HTMLImageElement, Ne = Re.getBoundingClientRect(), ze = getComputedStyle(this.container);
    let Ae = Ne.width * De, Ie = Ne.height * De;
    const je = parseFloat(ze.paddingTop) + parseFloat(ze.paddingBottom), Fe = Ae - (parseFloat(ze.paddingLeft) + parseFloat(ze.paddingRight)), Ve = Ie - je;
    this.containerRect = { width: Ae, height: Ie, innerWidth: Fe, innerHeight: Ve };
    const He = parseFloat($e.dataset.width || "") || ((ti) => {
      let si = 0;
      return si = ti instanceof HTMLImageElement ? ti.naturalWidth : ti instanceof SVGElement ? ti.width.baseVal.value : Math.max(ti.offsetWidth, ti.scrollWidth), si || 0;
    })($e), We = parseFloat($e.dataset.height || "") || ((ti) => {
      let si = 0;
      return si = ti instanceof HTMLImageElement ? ti.naturalHeight : ti instanceof SVGElement ? ti.height.baseVal.value : Math.max(ti.offsetHeight, ti.scrollHeight), si || 0;
    })($e);
    let Xe = this.option("width", He) || z, Ye = this.option("height", We) || z;
    const Ze = Xe === z, Ke = Ye === z;
    typeof Xe != "number" && (Xe = He), typeof Ye != "number" && (Ye = We), Ze && (Xe = He * (Ye / We)), Ke && (Ye = We / (He / Xe));
    let qe = $e.parentElement instanceof HTMLPictureElement ? $e.parentElement : $e;
    this.option("transformParent") && (qe = qe.parentElement || qe);
    const Ue = qe.getAttribute("style") || "";
    qe.style.setProperty("transform", "none", "important"), Be && (qe.style.width = "", qe.style.height = ""), qe.offsetHeight;
    const Qe = $e.getBoundingClientRect();
    let Je = Qe.width * De, Ge = Qe.height * De, ei = Je, ii = Ge;
    Je = Math.min(Je, Xe), Ge = Math.min(Ge, Ye), Be ? { width: Je, height: Ge } = ((ti, si, ai, ri) => {
      const li = ai / ti, ui = ri / si, di = Math.min(li, ui);
      return { width: ti *= di, height: si *= di };
    })(Xe, Ye, Je, Ge) : (Je = Math.min(Je, Xe), Ge = Math.min(Ge, Ye));
    let oi = 0.5 * (ii - Ge), ni = 0.5 * (ei - Je);
    this.contentRect = Object.assign(Object.assign({}, this.contentRect), { top: Qe.top - Ne.top + oi, bottom: Ne.bottom - Qe.bottom + oi, left: Qe.left - Ne.left + ni, right: Ne.right - Qe.right + ni, fitWidth: Je, fitHeight: Ge, width: Je, height: Ge, fullWidth: Xe, fullHeight: Ye }), qe.style.cssText = Ue, Be && (qe.style.width = `${Je}px`, qe.style.height = `${Ge}px`), this.setTransform(), _e !== !0 && this.emit("refresh"), this.ignoreBounds || (t(this.targetScale) < t(this.minScale) ? this.zoomTo(this.minScale, { friction: 0 }) : this.targetScale > this.maxScale ? this.zoomTo(this.maxScale, { friction: 0 }) : this.state === m.Init || this.checkBounds().inBounds || this.requestTick()), this.updateControls();
  }
  calculateBounds() {
    const { contentWidth: _e, contentHeight: ke } = this.calculateContentDim(this.target), { targetScale: De, lockedAxis: Re } = this, { fitWidth: $e, fitHeight: Be } = this.contentRect;
    let Ne = 0, ze = 0, Ae = 0, Ie = 0;
    const je = this.option("infinite");
    if (je === !0 || Re && je === Re) Ne = -1 / 0, Ae = 1 / 0, ze = -1 / 0, Ie = 1 / 0;
    else {
      let { containerRect: Fe, contentRect: Ve } = this, He = t($e * De, M), We = t(Be * De, M), { innerWidth: Xe, innerHeight: Ye } = Fe;
      if (Fe.width === He && (Xe = Fe.width), Fe.width === We && (Ye = Fe.height), _e > Xe) {
        Ae = 0.5 * (_e - Xe), Ne = -1 * Ae;
        let Ze = 0.5 * (Ve.right - Ve.left);
        Ne += Ze, Ae += Ze;
      }
      if ($e > Xe && _e < Xe && (Ne -= 0.5 * ($e - Xe), Ae -= 0.5 * ($e - Xe)), ke > Ye) {
        Ie = 0.5 * (ke - Ye), ze = -1 * Ie;
        let Ze = 0.5 * (Ve.bottom - Ve.top);
        ze += Ze, Ie += Ze;
      }
      Be > Ye && ke < Ye && (Ne -= 0.5 * (Be - Ye), Ae -= 0.5 * (Be - Ye));
    }
    return { x: { min: Ne, max: Ae }, y: { min: ze, max: Ie } };
  }
  getBounds() {
    const _e = this.option("bounds");
    return _e !== z ? _e : this.calculateBounds();
  }
  updateControls() {
    const _e = this, ke = _e.container, { panMode: De, contentRect: Re, targetScale: $e, minScale: Be } = _e;
    let Ne = Be, ze = _e.option("click") || !1;
    ze && (Ne = _e.getNextScale(ze));
    let Ae = _e.canZoomIn(), Ie = _e.canZoomOut(), je = De === A && !!this.option("touch"), Fe = Ie && je;
    if (je && (t($e) < t(Be) && !this.panOnlyZoomed && (Fe = !0), (t(Re.width, 1) > t(Re.fitWidth, 1) || t(Re.height, 1) > t(Re.fitHeight, 1)) && (Fe = !0)), t(Re.width * $e, 1) < t(Re.fitWidth, 1) && (Fe = !1), De === O && (Fe = !1), o(ke, this.cn("isDraggable"), Fe), !this.option("zoom")) return;
    let Ve = Ae && t(Ne) > t($e), He = !Ve && !Fe && Ie && t(Ne) < t($e);
    o(ke, this.cn("canZoomIn"), Ve), o(ke, this.cn("canZoomOut"), He);
    for (const We of ke.querySelectorAll("[data-panzoom-action]")) {
      let Xe = !1, Ye = !1;
      switch (We.dataset.panzoomAction) {
        case "zoomIn":
          Ae ? Xe = !0 : Ye = !0;
          break;
        case "zoomOut":
          Ie ? Xe = !0 : Ye = !0;
          break;
        case "toggleZoom":
        case "iterateZoom":
          Ae || Ie ? Xe = !0 : Ye = !0;
          const Ze = We.querySelector("g");
          Ze && (Ze.style.display = Ae ? "" : "none");
      }
      Xe ? (We.removeAttribute("disabled"), We.removeAttribute("tabindex")) : Ye && (We.setAttribute("disabled", ""), We.setAttribute("tabindex", "-1"));
    }
  }
  panTo({ x: _e = this.target.e, y: ke = this.target.f, scale: De = this.targetScale, friction: Re = this.option("friction"), angle: $e = 0, originX: Be = 0, originY: Ne = 0, flipX: ze = !1, flipY: Ae = !1, ignoreBounds: Ie = !1 }) {
    this.state !== m.Destroy && this.applyChange({ panX: _e - this.target.e, panY: ke - this.target.f, scale: De / this.targetScale, angle: $e, originX: Be, originY: Ne, friction: Re, flipX: ze, flipY: Ae, ignoreBounds: Ie });
  }
  applyChange({ panX: _e = 0, panY: ke = 0, scale: De = 1, angle: Re = 0, originX: $e = -this.current.e, originY: Be = -this.current.f, friction: Ne = this.option("friction"), flipX: ze = !1, flipY: Ae = !1, ignoreBounds: Ie = !1, bounce: je = this.option("bounce") }) {
    const Fe = this.state;
    if (Fe === m.Destroy) return;
    this.rAF && (cancelAnimationFrame(this.rAF), this.rAF = null), this.friction = Ne || 0, this.ignoreBounds = Ie;
    const { current: Ve } = this, He = Ve.e, We = Ve.f, Xe = this.getMatrix(this.target);
    let Ye = new DOMMatrix().translate(He, We).translate($e, Be).translate(_e, ke);
    if (this.option("zoom")) {
      if (!Ie) {
        const Ze = this.targetScale, Ke = this.minScale, qe = this.maxScale;
        Ze * De < Ke && (De = Ke / Ze), Ze * De > qe && (De = qe / Ze);
      }
      Ye = Ye.scale(De);
    }
    Ye = Ye.translate(-$e, -Be).translate(-He, -We).multiply(Xe), Re && (Ye = Ye.rotate(Re)), ze && (Ye = Ye.scale(-1, 1)), Ae && (Ye = Ye.scale(1, -1));
    for (const Ze of v) Ze !== "e" && Ze !== "f" && (Ye[Ze] > this.minScale + 1e-5 || Ye[Ze] < this.minScale - 1e-5) ? this.target[Ze] = Ye[Ze] : this.target[Ze] = t(Ye[Ze], M);
    (this.targetScale < this.scale || Math.abs(De - 1) > 0.1 || this.panMode === O || je === !1) && !Ie && this.clampTargetBounds(), Fe === m.Init ? this.animate() : this.isResting || (this.state = m.Panning, this.requestTick());
  }
  stop(_e = !1) {
    if (this.state === m.Init || this.state === m.Destroy) return;
    const ke = this.isTicking;
    this.rAF && (cancelAnimationFrame(this.rAF), this.rAF = null), this.isBouncingX = !1, this.isBouncingY = !1;
    for (const De of v) this.velocity[De] = 0, _e === "current" ? this.current[De] = this.target[De] : _e === "target" && (this.target[De] = this.current[De]);
    this.setTransform(), S(this.container, "is-scaling"), S(this.container, "is-animating"), this.isTicking = !1, this.state = m.Ready, ke && (this.emit("endAnimation"), this.updateControls());
  }
  requestTick() {
    this.isTicking || (this.emit("startAnimation"), this.updateControls(), P(this.container, "is-animating"), this.isScaling && P(this.container, "is-scaling")), this.isTicking = !0, this.rAF || (this.rAF = requestAnimationFrame(() => this.animate()));
  }
  panWithMouse(_e, ke = this.option("mouseMoveFriction")) {
    if (this.pmme = _e, this.panMode !== O || !_e || t(this.targetScale) <= t(this.minScale)) return;
    this.emit("mouseMove", _e);
    const { container: De, containerRect: Re, contentRect: $e } = this, Be = Re.width, Ne = Re.height, ze = De.getBoundingClientRect(), Ae = (_e.clientX || 0) - ze.left, Ie = (_e.clientY || 0) - ze.top;
    let { contentWidth: je, contentHeight: Fe } = this.calculateContentDim(this.target);
    const Ve = this.option("mouseMoveFactor");
    Ve > 1 && (je !== Be && (je *= Ve), Fe !== Ne && (Fe *= Ve));
    let He = 0.5 * (je - Be) - Ae / Be * 100 / 100 * (je - Be);
    He += 0.5 * ($e.right - $e.left);
    let We = 0.5 * (Fe - Ne) - Ie / Ne * 100 / 100 * (Fe - Ne);
    We += 0.5 * ($e.bottom - $e.top), this.applyChange({ panX: He - this.target.e, panY: We - this.target.f, friction: ke });
  }
  zoomWithWheel(_e) {
    if (this.state === m.Destroy || this.state === m.Init) return;
    const ke = Date.now();
    if (ke - this.pwt < 45) return void _e.preventDefault();
    this.pwt = ke;
    var De = [-_e.deltaX || 0, -_e.deltaY || 0, -_e.detail || 0].reduce(function(Ae, Ie) {
      return Math.abs(Ie) > Math.abs(Ae) ? Ie : Ae;
    });
    const Re = Math.max(-1, Math.min(1, De)), { targetScale: $e, maxScale: Be, minScale: Ne } = this;
    let ze = $e * (100 + 45 * Re) / 100;
    t(ze) < t(Ne) && t($e) <= t(Ne) ? (this.cwd += Math.abs(Re), ze = Ne) : t(ze) > t(Be) && t($e) >= t(Be) ? (this.cwd += Math.abs(Re), ze = Be) : (this.cwd = 0, ze = Math.max(Math.min(ze, Be), Ne)), this.cwd > this.option("wheelLimit") || (_e.preventDefault(), t(ze) !== t($e) && this.zoomTo(ze, { event: _e }));
  }
  canZoomIn() {
    return this.option("zoom") && (t(this.contentRect.width, 1) < t(this.contentRect.fitWidth, 1) || t(this.targetScale) < t(this.maxScale));
  }
  canZoomOut() {
    return this.option("zoom") && t(this.targetScale) > t(this.minScale);
  }
  zoomIn(_e = 1.25, ke) {
    this.zoomTo(this.targetScale * _e, ke);
  }
  zoomOut(_e = 0.8, ke) {
    this.zoomTo(this.targetScale * _e, ke);
  }
  zoomToFit(_e) {
    this.zoomTo("fit", _e);
  }
  zoomToCover(_e) {
    this.zoomTo("cover", _e);
  }
  zoomToFull(_e) {
    this.zoomTo("full", _e);
  }
  zoomToMax(_e) {
    this.zoomTo("max", _e);
  }
  toggleZoom(_e) {
    this.zoomTo(this.getNextScale("toggleZoom"), _e);
  }
  toggleMax(_e) {
    this.zoomTo(this.getNextScale("toggleMax"), _e);
  }
  toggleCover(_e) {
    this.zoomTo(this.getNextScale("toggleCover"), _e);
  }
  iterateZoom(_e) {
    this.zoomTo("next", _e);
  }
  zoomTo(_e = 1, { friction: ke = z, originX: De = z, originY: Re = z, event: $e } = {}) {
    if (this.isContentLoading || this.state === m.Destroy) return;
    const { targetScale: Be, fullScale: Ne, maxScale: ze, coverScale: Ae } = this;
    if (this.stop(), this.panMode === O && ($e = this.pmme || $e), $e || De === z || Re === z) {
      const je = this.content.getBoundingClientRect(), Fe = this.container.getBoundingClientRect(), Ve = $e ? $e.clientX : Fe.left + 0.5 * Fe.width, He = $e ? $e.clientY : Fe.top + 0.5 * Fe.height;
      De = Ve - je.left - 0.5 * je.width, Re = He - je.top - 0.5 * je.height;
    }
    let Ie = 1;
    typeof _e == "number" ? Ie = _e : _e === "full" ? Ie = Ne : _e === "cover" ? Ie = Ae : _e === "max" ? Ie = ze : _e === "fit" ? Ie = 1 : _e === "next" && (Ie = this.getNextScale("iterateZoom")), Ie = Ie / Be || 1, ke = ke === z ? Ie > 1 ? 0.15 : 0.25 : ke, this.applyChange({ scale: Ie, originX: De, originY: Re, friction: ke }), $e && this.panMode === O && this.panWithMouse($e, ke);
  }
  rotateCCW() {
    this.applyChange({ angle: -90 });
  }
  rotateCW() {
    this.applyChange({ angle: 90 });
  }
  flipX() {
    this.applyChange({ flipX: !0 });
  }
  flipY() {
    this.applyChange({ flipY: !0 });
  }
  fitX() {
    this.stop("target");
    const { containerRect: _e, contentRect: ke, target: De } = this;
    this.applyChange({ panX: 0.5 * _e.width - (ke.left + 0.5 * ke.fitWidth) - De.e, panY: 0.5 * _e.height - (ke.top + 0.5 * ke.fitHeight) - De.f, scale: _e.width / ke.fitWidth / this.targetScale, originX: 0, originY: 0, ignoreBounds: !0 });
  }
  fitY() {
    this.stop("target");
    const { containerRect: _e, contentRect: ke, target: De } = this;
    this.applyChange({ panX: 0.5 * _e.width - (ke.left + 0.5 * ke.fitWidth) - De.e, panY: 0.5 * _e.innerHeight - (ke.top + 0.5 * ke.fitHeight) - De.f, scale: _e.height / ke.fitHeight / this.targetScale, originX: 0, originY: 0, ignoreBounds: !0 });
  }
  toggleFS() {
    const { container: _e } = this, ke = this.cn("inFullscreen"), De = this.cn("htmlHasFullscreen");
    _e.classList.toggle(ke);
    const Re = _e.classList.contains(ke);
    Re ? (document.documentElement.classList.add(De), document.addEventListener("keydown", this.onKeydown, !0)) : (document.documentElement.classList.remove(De), document.removeEventListener("keydown", this.onKeydown, !0)), this.updateMetrics(), this.emit(Re ? "enterFS" : "exitFS");
  }
  getMatrix(_e = this.current) {
    const { a: ke, b: De, c: Re, d: $e, e: Be, f: Ne } = _e;
    return new DOMMatrix([ke, De, Re, $e, Be, Ne]);
  }
  reset(_e) {
    if (this.state !== m.Init && this.state !== m.Destroy) {
      this.stop("current");
      for (const ke of v) this.target[ke] = C[ke];
      this.target.a = this.minScale, this.target.d = this.minScale, this.clampTargetBounds(), this.isResting || (this.friction = _e === void 0 ? this.option("friction") : _e, this.state = m.Panning, this.requestTick());
    }
  }
  destroy() {
    this.stop(), this.state = m.Destroy, this.detachEvents(), this.detachObserver();
    const { container: _e, content: ke } = this, De = this.option("classes") || {};
    for (const Re of Object.values(De)) _e.classList.remove(Re + "");
    ke && (ke.removeEventListener("load", this.onLoad), ke.removeEventListener("error", this.onError)), this.detachPlugins();
  }
}
Object.defineProperty(I, "defaults", { enumerable: !0, configurable: !0, writable: !0, value: y }), Object.defineProperty(I, "Plugins", { enumerable: !0, configurable: !0, writable: !0, value: {} });
const D = function(Le, _e) {
  let ke = !0;
  return (...De) => {
    ke && (ke = !1, Le(...De), setTimeout(() => {
      ke = !0;
    }, _e));
  };
}, F = (Le, _e) => {
  let ke = [];
  return Le.childNodes.forEach((De) => {
    De.nodeType !== Node.ELEMENT_NODE || _e && !De.matches(_e) || ke.push(De);
  }), ke;
}, j = { viewport: null, track: null, enabled: !0, slides: [], axis: "x", transition: "fade", preload: 1, slidesPerPage: "auto", initialPage: 0, friction: 0.12, Panzoom: { decelFriction: 0.12 }, center: !0, infinite: !0, fill: !0, dragFree: !1, adaptiveHeight: !1, direction: "ltr", classes: { container: "f-carousel", viewport: "f-carousel__viewport", track: "f-carousel__track", slide: "f-carousel__slide", isLTR: "is-ltr", isRTL: "is-rtl", isHorizontal: "is-horizontal", isVertical: "is-vertical", inTransition: "in-transition", isSelected: "is-selected" }, l10n: { NEXT: "Next slide", PREV: "Previous slide", GOTO: "Go to slide #%d" } };
var B;
(function(Le) {
  Le[Le.Init = 0] = "Init", Le[Le.Ready = 1] = "Ready", Le[Le.Destroy = 2] = "Destroy";
})(B || (B = {}));
const H = (Le) => {
  if (typeof Le == "string" || Le instanceof HTMLElement) Le = { html: Le };
  else {
    const _e = Le.thumb;
    _e !== void 0 && (typeof _e == "string" && (Le.thumbSrc = _e), _e instanceof HTMLImageElement && (Le.thumbEl = _e, Le.thumbElSrc = _e.src, Le.thumbSrc = _e.src), delete Le.thumb);
  }
  return Object.assign({ html: "", el: null, isDom: !1, class: "", customClass: "", index: -1, dim: 0, gap: 0, pos: 0, transition: !1 }, Le);
}, N = (Le = {}) => Object.assign({ index: -1, slides: [], dim: 0, pos: -1 }, Le);
class _ extends f {
  constructor(_e, ke) {
    super(ke), Object.defineProperty(this, "instance", { enumerable: !0, configurable: !0, writable: !0, value: _e });
  }
  attach() {
  }
  detach() {
  }
}
const $ = { classes: { list: "f-carousel__dots", isDynamic: "is-dynamic", hasDots: "has-dots", dot: "f-carousel__dot", isBeforePrev: "is-before-prev", isPrev: "is-prev", isCurrent: "is-current", isNext: "is-next", isAfterNext: "is-after-next" }, dotTpl: '<button type="button" data-carousel-page="%i" aria-label="{{GOTO}}"><span class="f-carousel__dot" aria-hidden="true"></span></button>', dynamicFrom: 11, maxCount: 1 / 0, minCount: 2 };
class W extends _ {
  constructor() {
    super(...arguments), Object.defineProperty(this, "isDynamic", { enumerable: !0, configurable: !0, writable: !0, value: !1 }), Object.defineProperty(this, "list", { enumerable: !0, configurable: !0, writable: !0, value: null });
  }
  onRefresh() {
    this.refresh();
  }
  build() {
    let _e = this.list;
    if (!_e) {
      _e = document.createElement("ul"), P(_e, this.cn("list")), _e.setAttribute("role", "tablist");
      const ke = this.instance.container;
      ke.appendChild(_e), P(ke, this.cn("hasDots")), this.list = _e;
    }
    return _e;
  }
  refresh() {
    var _e;
    const ke = this.instance.pages.length, De = Math.min(2, this.option("minCount")), Re = Math.max(2e3, this.option("maxCount")), $e = this.option("dynamicFrom");
    if (ke < De || ke > Re) return void this.cleanup();
    const Be = typeof $e == "number" && ke > 5 && ke >= $e, Ne = !this.list || this.isDynamic !== Be || this.list.children.length !== ke;
    Ne && this.cleanup();
    const ze = this.build();
    if (o(ze, this.cn("isDynamic"), !!Be), Ne) for (let je = 0; je < ke; je++) ze.append(this.createItem(je));
    let Ae, Ie = 0;
    for (const je of [...ze.children]) {
      const Fe = Ie === this.instance.page;
      Fe && (Ae = je), o(je, this.cn("isCurrent"), Fe), (_e = je.children[0]) === null || _e === void 0 || _e.setAttribute("aria-selected", Fe ? "true" : "false");
      for (const Ve of ["isBeforePrev", "isPrev", "isNext", "isAfterNext"]) S(je, this.cn(Ve));
      Ie++;
    }
    if (Ae = Ae || ze.firstChild, Be && Ae) {
      const je = Ae.previousElementSibling, Fe = je && je.previousElementSibling;
      P(je, this.cn("isPrev")), P(Fe, this.cn("isBeforePrev"));
      const Ve = Ae.nextElementSibling, He = Ve && Ve.nextElementSibling;
      P(Ve, this.cn("isNext")), P(He, this.cn("isAfterNext"));
    }
    this.isDynamic = Be;
  }
  createItem(_e = 0) {
    var ke;
    const De = document.createElement("li");
    De.setAttribute("role", "presentation");
    const Re = n(this.instance.localize(this.option("dotTpl"), [["%d", _e + 1]]).replace(/\%i/g, _e + ""));
    return De.appendChild(Re), (ke = De.children[0]) === null || ke === void 0 || ke.setAttribute("role", "tab"), De;
  }
  cleanup() {
    this.list && (this.list.remove(), this.list = null), this.isDynamic = !1, S(this.instance.container, this.cn("hasDots"));
  }
  attach() {
    this.instance.on(["refresh", "change"], this.onRefresh);
  }
  detach() {
    this.instance.off(["refresh", "change"], this.onRefresh), this.cleanup();
  }
}
Object.defineProperty(W, "defaults", { enumerable: !0, configurable: !0, writable: !0, value: $ });
const X = "disabled", q = "next", Y = "prev";
class V extends _ {
  constructor() {
    super(...arguments), Object.defineProperty(this, "container", { enumerable: !0, configurable: !0, writable: !0, value: null }), Object.defineProperty(this, "prev", { enumerable: !0, configurable: !0, writable: !0, value: null }), Object.defineProperty(this, "next", { enumerable: !0, configurable: !0, writable: !0, value: null }), Object.defineProperty(this, "isDom", { enumerable: !0, configurable: !0, writable: !0, value: !1 });
  }
  onRefresh() {
    const _e = this.instance, ke = _e.pages.length, De = _e.page;
    if (ke < 2) return void this.cleanup();
    this.build();
    let Re = this.prev, $e = this.next;
    Re && $e && (Re.removeAttribute(X), $e.removeAttribute(X), _e.isInfinite || (De <= 0 && Re.setAttribute(X, ""), De >= ke - 1 && $e.setAttribute(X, "")));
  }
  addBtn(_e) {
    var ke;
    const De = this.instance, Re = document.createElement("button");
    Re.setAttribute("tabindex", "0"), Re.setAttribute("title", De.localize(`{{${_e.toUpperCase()}}}`)), P(Re, this.cn("button") + " " + this.cn(_e === q ? "isNext" : "isPrev"));
    const $e = De.isRTL ? _e === q ? Y : q : _e;
    var Be;
    return Re.innerHTML = De.localize(this.option(`${$e}Tpl`)), Re.dataset[`carousel${Be = _e, Be ? Be.match("^[a-z]") ? Be.charAt(0).toUpperCase() + Be.substring(1) : Be : ""}`] = "true", (ke = this.container) === null || ke === void 0 || ke.appendChild(Re), Re;
  }
  build() {
    const _e = this.instance.container, ke = this.cn("container");
    let { container: De, prev: Re, next: $e } = this;
    De || (De = _e.querySelector("." + ke), this.isDom = !!De), De || (De = document.createElement("div"), P(De, ke), _e.appendChild(De)), this.container = De, $e || ($e = De.querySelector("[data-carousel-next]")), $e || ($e = this.addBtn(q)), this.next = $e, Re || (Re = De.querySelector("[data-carousel-prev]")), Re || (Re = this.addBtn(Y)), this.prev = Re;
  }
  cleanup() {
    this.isDom || (this.prev && this.prev.remove(), this.next && this.next.remove(), this.container && this.container.remove()), this.prev = null, this.next = null, this.container = null, this.isDom = !1;
  }
  attach() {
    this.instance.on(["refresh", "change"], this.onRefresh);
  }
  detach() {
    this.instance.off(["refresh", "change"], this.onRefresh), this.cleanup();
  }
}
Object.defineProperty(V, "defaults", { enumerable: !0, configurable: !0, writable: !0, value: { classes: { container: "f-carousel__nav", button: "f-button", isNext: "is-next", isPrev: "is-prev" }, nextTpl: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" tabindex="-1"><path d="M9 3l9 9-9 9"/></svg>', prevTpl: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" tabindex="-1"><path d="M15 3l-9 9 9 9"/></svg>' } });
class Z extends _ {
  constructor() {
    super(...arguments), Object.defineProperty(this, "selectedIndex", { enumerable: !0, configurable: !0, writable: !0, value: null }), Object.defineProperty(this, "target", { enumerable: !0, configurable: !0, writable: !0, value: null }), Object.defineProperty(this, "nav", { enumerable: !0, configurable: !0, writable: !0, value: null });
  }
  addAsTargetFor(_e) {
    this.target = this.instance, this.nav = _e, this.attachEvents();
  }
  addAsNavFor(_e) {
    this.nav = this.instance, this.target = _e, this.attachEvents();
  }
  attachEvents() {
    const { nav: _e, target: ke } = this;
    _e && ke && (_e.options.initialSlide = ke.options.initialPage, _e.state === B.Ready ? this.onNavReady(_e) : _e.on("ready", this.onNavReady), ke.state === B.Ready ? this.onTargetReady(ke) : ke.on("ready", this.onTargetReady));
  }
  onNavReady(_e) {
    _e.on("createSlide", this.onNavCreateSlide), _e.on("Panzoom.click", this.onNavClick), _e.on("Panzoom.touchEnd", this.onNavTouch), this.onTargetChange();
  }
  onTargetReady(_e) {
    _e.on("change", this.onTargetChange), _e.on("Panzoom.refresh", this.onTargetChange), this.onTargetChange();
  }
  onNavClick(_e, ke, De) {
    this.onNavTouch(_e, _e.panzoom, De);
  }
  onNavTouch(_e, ke, De) {
    var Re, $e;
    if (Math.abs(ke.dragOffset.x) > 3 || Math.abs(ke.dragOffset.y) > 3) return;
    const Be = De.target, { nav: Ne, target: ze } = this;
    if (!Ne || !ze || !Be) return;
    const Ae = Be.closest("[data-index]");
    if (De.stopPropagation(), De.preventDefault(), !Ae) return;
    const Ie = parseInt(Ae.dataset.index || "", 10) || 0, je = ze.getPageForSlide(Ie), Fe = Ne.getPageForSlide(Ie);
    Ne.slideTo(Fe), ze.slideTo(je, { friction: (($e = (Re = this.nav) === null || Re === void 0 ? void 0 : Re.plugins) === null || $e === void 0 ? void 0 : $e.Sync.option("friction")) || 0 }), this.markSelectedSlide(Ie);
  }
  onNavCreateSlide(_e, ke) {
    ke.index === this.selectedIndex && this.markSelectedSlide(ke.index);
  }
  onTargetChange() {
    var _e, ke;
    const { target: De, nav: Re } = this;
    if (!De || !Re || Re.state !== B.Ready || De.state !== B.Ready) return;
    const $e = (ke = (_e = De.pages[De.page]) === null || _e === void 0 ? void 0 : _e.slides[0]) === null || ke === void 0 ? void 0 : ke.index, Be = Re.getPageForSlide($e);
    this.markSelectedSlide($e), Re.slideTo(Be, Re.prevPage === null && De.prevPage === null ? { friction: 0 } : void 0);
  }
  markSelectedSlide(_e) {
    const ke = this.nav;
    ke && ke.state === B.Ready && (this.selectedIndex = _e, [...ke.slides].map((De) => {
      De.el && De.el.classList[De.index === _e ? "add" : "remove"]("is-nav-selected");
    }));
  }
  attach() {
    const _e = this;
    let ke = _e.options.target, De = _e.options.nav;
    ke ? _e.addAsNavFor(ke) : De && _e.addAsTargetFor(De);
  }
  detach() {
    const _e = this, ke = _e.nav, De = _e.target;
    ke && (ke.off("ready", _e.onNavReady), ke.off("createSlide", _e.onNavCreateSlide), ke.off("Panzoom.click", _e.onNavClick), ke.off("Panzoom.touchEnd", _e.onNavTouch)), _e.nav = null, De && (De.off("ready", _e.onTargetReady), De.off("refresh", _e.onTargetChange), De.off("change", _e.onTargetChange)), _e.target = null;
  }
}
Object.defineProperty(Z, "defaults", { enumerable: !0, configurable: !0, writable: !0, value: { friction: 0.35 } });
const U = { Navigation: V, Dots: W, Sync: Z }, G = "animationend", K = "isSelected", J = "slide";
class Q extends g {
  get axis() {
    return this.isHorizontal ? "e" : "f";
  }
  get isEnabled() {
    return this.state === B.Ready;
  }
  get isInfinite() {
    let _e = !1;
    const { contentDim: ke, viewportDim: De, pages: Re, slides: $e } = this, Be = $e[0];
    return Re.length >= 2 && Be && ke + Be.dim >= De && (_e = this.option("infinite")), _e;
  }
  get isRTL() {
    return this.option("direction") === "rtl";
  }
  get isHorizontal() {
    return this.option("axis") === "x";
  }
  constructor(_e, ke = {}, De = {}) {
    if (super(), Object.defineProperty(this, "bp", { enumerable: !0, configurable: !0, writable: !0, value: "" }), Object.defineProperty(this, "lp", { enumerable: !0, configurable: !0, writable: !0, value: 0 }), Object.defineProperty(this, "userOptions", { enumerable: !0, configurable: !0, writable: !0, value: {} }), Object.defineProperty(this, "userPlugins", { enumerable: !0, configurable: !0, writable: !0, value: {} }), Object.defineProperty(this, "state", { enumerable: !0, configurable: !0, writable: !0, value: B.Init }), Object.defineProperty(this, "page", { enumerable: !0, configurable: !0, writable: !0, value: 0 }), Object.defineProperty(this, "prevPage", { enumerable: !0, configurable: !0, writable: !0, value: null }), Object.defineProperty(this, "container", { enumerable: !0, configurable: !0, writable: !0, value: void 0 }), Object.defineProperty(this, "viewport", { enumerable: !0, configurable: !0, writable: !0, value: null }), Object.defineProperty(this, "track", { enumerable: !0, configurable: !0, writable: !0, value: null }), Object.defineProperty(this, "slides", { enumerable: !0, configurable: !0, writable: !0, value: [] }), Object.defineProperty(this, "pages", { enumerable: !0, configurable: !0, writable: !0, value: [] }), Object.defineProperty(this, "panzoom", { enumerable: !0, configurable: !0, writable: !0, value: null }), Object.defineProperty(this, "inTransition", { enumerable: !0, configurable: !0, writable: !0, value: /* @__PURE__ */ new Set() }), Object.defineProperty(this, "contentDim", { enumerable: !0, configurable: !0, writable: !0, value: 0 }), Object.defineProperty(this, "viewportDim", { enumerable: !0, configurable: !0, writable: !0, value: 0 }), typeof _e == "string" && (_e = document.querySelector(_e)), !_e || !E(_e)) throw new Error("No Element found");
    this.container = _e, this.slideNext = D(this.slideNext.bind(this), 150), this.slidePrev = D(this.slidePrev.bind(this), 150), this.userOptions = ke, this.userPlugins = De, queueMicrotask(() => {
      this.processOptions();
    });
  }
  processOptions() {
    var _e, ke;
    const De = u({}, Q.defaults, this.userOptions);
    let Re = "";
    const $e = De.breakpoints;
    if ($e && d($e)) for (const [Be, Ne] of Object.entries($e)) window.matchMedia(Be).matches && d(Ne) && (Re += Be, u(De, Ne));
    Re === this.bp && this.state !== B.Init || (this.bp = Re, this.state === B.Ready && (De.initialSlide = ((ke = (_e = this.pages[this.page]) === null || _e === void 0 ? void 0 : _e.slides[0]) === null || ke === void 0 ? void 0 : ke.index) || 0), this.state !== B.Init && this.destroy(), super.setOptions(De), this.option("enabled") === !1 ? this.attachEvents() : setTimeout(() => {
      this.init();
    }, 0));
  }
  init() {
    this.state = B.Init, this.emit("init"), this.attachPlugins(Object.assign(Object.assign({}, Q.Plugins), this.userPlugins)), this.emit("attachPlugins"), this.initLayout(), this.initSlides(), this.updateMetrics(), this.setInitialPosition(), this.initPanzoom(), this.attachEvents(), this.state = B.Ready, this.emit("ready");
  }
  initLayout() {
    const { container: _e } = this, ke = this.option("classes");
    P(_e, this.cn("container")), o(_e, ke.isLTR, !this.isRTL), o(_e, ke.isRTL, this.isRTL), o(_e, ke.isVertical, !this.isHorizontal), o(_e, ke.isHorizontal, this.isHorizontal);
    let De = this.option("viewport") || _e.querySelector(`.${ke.viewport}`);
    De || (De = document.createElement("div"), P(De, ke.viewport), De.append(...F(_e, `.${ke.slide}`)), _e.prepend(De)), De.addEventListener("scroll", this.onScroll);
    let Re = this.option("track") || _e.querySelector(`.${ke.track}`);
    Re || (Re = document.createElement("div"), P(Re, ke.track), Re.append(...Array.from(De.childNodes))), Re.setAttribute("aria-live", "polite"), De.contains(Re) || De.prepend(Re), this.viewport = De, this.track = Re, this.emit("initLayout");
  }
  initSlides() {
    const { track: _e } = this;
    if (!_e) return;
    const ke = [...this.slides], De = [];
    [...F(_e, `.${this.cn(J)}`)].forEach((Re) => {
      if (E(Re)) {
        const $e = H({ el: Re, isDom: !0, index: this.slides.length });
        De.push($e);
      }
    });
    for (let Re of [...this.option("slides", []) || [], ...ke]) De.push(H(Re));
    this.slides = De;
    for (let Re = 0; Re < this.slides.length; Re++) this.slides[Re].index = Re;
    for (const Re of De) this.emit("beforeInitSlide", Re, Re.index), this.emit("initSlide", Re, Re.index);
    this.emit("initSlides");
  }
  setInitialPage() {
    const _e = this.option("initialSlide");
    this.page = typeof _e == "number" ? this.getPageForSlide(_e) : parseInt(this.option("initialPage", 0) + "", 10) || 0;
  }
  setInitialPosition() {
    const { track: _e, pages: ke, isHorizontal: De } = this;
    if (!_e || !ke.length) return;
    let Re = this.page;
    ke[Re] || (this.page = Re = 0);
    const $e = (ke[Re].pos || 0) * (this.isRTL && De ? 1 : -1), Be = De ? `${$e}px` : "0", Ne = De ? "0" : `${$e}px`;
    _e.style.transform = `translate3d(${Be}, ${Ne}, 0) scale(1)`, this.option("adaptiveHeight") && this.setViewportHeight();
  }
  initPanzoom() {
    this.panzoom && (this.panzoom.destroy(), this.panzoom = null);
    const _e = this.option("Panzoom") || {};
    this.panzoom = new I(this.viewport, u({}, { content: this.track, zoom: !1, panOnlyZoomed: !1, lockAxis: this.isHorizontal ? "x" : "y", infinite: this.isInfinite, click: !1, dblClick: !1, touch: (ke) => !(this.pages.length < 2 && !ke.options.infinite), bounds: () => this.getBounds(), maxVelocity: (ke) => Math.abs(ke.target[this.axis] - ke.current[this.axis]) < 2 * this.viewportDim ? 100 : 0 }, _e)), this.panzoom.on("*", (ke, De, ...Re) => {
      this.emit(`Panzoom.${De}`, ke, ...Re);
    }), this.panzoom.on("decel", this.onDecel), this.panzoom.on("refresh", this.onRefresh), this.panzoom.on("beforeTransform", this.onBeforeTransform), this.panzoom.on("endAnimation", this.onEndAnimation);
  }
  attachEvents() {
    const _e = this.container;
    _e && (_e.addEventListener("click", this.onClick, { passive: !1, capture: !1 }), _e.addEventListener("slideTo", this.onSlideTo)), window.addEventListener("resize", this.onResize);
  }
  createPages() {
    let _e = [];
    const { contentDim: ke, viewportDim: De } = this;
    let Re = this.option("slidesPerPage");
    Re = (Re === "auto" || ke <= De) && this.option("fill") !== !1 ? 1 / 0 : parseFloat(Re + "");
    let $e = 0, Be = 0, Ne = 0;
    for (const ze of this.slides) (!_e.length || Be + ze.dim - De > 0.05 || Ne >= Re) && (_e.push(N()), $e = _e.length - 1, Be = 0, Ne = 0), _e[$e].slides.push(ze), Be += ze.dim + ze.gap, Ne++;
    return _e;
  }
  processPages() {
    const _e = this.pages, { contentDim: ke, viewportDim: De, isInfinite: Re } = this, $e = this.option("center"), Be = this.option("fill"), Ne = Be && $e && ke > De && !Re;
    if (_e.forEach((Ie, je) => {
      var Fe;
      Ie.index = je, Ie.pos = ((Fe = Ie.slides[0]) === null || Fe === void 0 ? void 0 : Fe.pos) || 0, Ie.dim = 0;
      for (const [Ve, He] of Ie.slides.entries()) Ie.dim += He.dim, Ve < Ie.slides.length - 1 && (Ie.dim += He.gap);
      Ne && Ie.pos + 0.5 * Ie.dim < 0.5 * De ? Ie.pos = 0 : Ne && Ie.pos + 0.5 * Ie.dim >= ke - 0.5 * De ? Ie.pos = ke - De : $e && (Ie.pos += -0.5 * (De - Ie.dim));
    }), _e.forEach((Ie) => {
      Be && !Re && ke > De && (Ie.pos = Math.max(Ie.pos, 0), Ie.pos = Math.min(Ie.pos, ke - De)), Ie.pos = t(Ie.pos, 1e3), Ie.dim = t(Ie.dim, 1e3), Math.abs(Ie.pos) <= 0.1 && (Ie.pos = 0);
    }), Re) return _e;
    const ze = [];
    let Ae;
    return _e.forEach((Ie) => {
      const je = Object.assign({}, Ie);
      Ae && je.pos === Ae.pos ? (Ae.dim += je.dim, Ae.slides = [...Ae.slides, ...je.slides]) : (je.index = ze.length, Ae = je, ze.push(je));
    }), ze;
  }
  getPageFromIndex(_e = 0) {
    const ke = this.pages.length;
    let De;
    return _e = parseInt((_e || 0).toString()) || 0, De = this.isInfinite ? (_e % ke + ke) % ke : Math.max(Math.min(_e, ke - 1), 0), De;
  }
  getSlideMetrics(_e) {
    var ke, De;
    const Re = this.isHorizontal ? "width" : "height";
    let $e = 0, Be = 0, Ne = _e.el;
    const ze = !(!Ne || Ne.parentNode);
    if (Ne ? $e = parseFloat(Ne.dataset[Re] || "") || 0 : (Ne = document.createElement("div"), Ne.style.visibility = "hidden", (this.track || document.body).prepend(Ne)), P(Ne, this.cn(J) + " " + _e.class + " " + _e.customClass), $e) Ne.style[Re] = `${$e}px`, Ne.style[Re === "width" ? "height" : "width"] = "";
    else {
      ze && (this.track || document.body).prepend(Ne), $e = Ne.getBoundingClientRect()[Re] * Math.max(1, ((ke = window.visualViewport) === null || ke === void 0 ? void 0 : ke.scale) || 1);
      let Ie = Ne[this.isHorizontal ? "offsetWidth" : "offsetHeight"];
      Ie - 1 > $e && ($e = Ie);
    }
    const Ae = getComputedStyle(Ne);
    return Ae.boxSizing === "content-box" && (this.isHorizontal ? ($e += parseFloat(Ae.paddingLeft) || 0, $e += parseFloat(Ae.paddingRight) || 0) : ($e += parseFloat(Ae.paddingTop) || 0, $e += parseFloat(Ae.paddingBottom) || 0)), Be = parseFloat(Ae[this.isHorizontal ? "marginRight" : "marginBottom"]) || 0, ze ? (De = Ne.parentElement) === null || De === void 0 || De.removeChild(Ne) : _e.el || Ne.remove(), { dim: t($e, 1e3), gap: t(Be, 1e3) };
  }
  getBounds() {
    const { isInfinite: _e, isRTL: ke, isHorizontal: De, pages: Re } = this;
    let $e = { min: 0, max: 0 };
    if (_e) $e = { min: -1 / 0, max: 1 / 0 };
    else if (Re.length) {
      const Be = Re[0].pos, Ne = Re[Re.length - 1].pos;
      $e = ke && De ? { min: Be, max: Ne } : { min: -1 * Ne, max: -1 * Be };
    }
    return { x: De ? $e : { min: 0, max: 0 }, y: De ? { min: 0, max: 0 } : $e };
  }
  repositionSlides() {
    let _e, { isHorizontal: ke, isRTL: De, isInfinite: Re, viewport: $e, viewportDim: Be, contentDim: Ne, page: ze, pages: Ae, slides: Ie, panzoom: je } = this, Fe = 0, Ve = 0, He = 0, We = 0;
    je ? We = -1 * je.current[this.axis] : Ae[ze] && (We = Ae[ze].pos || 0), _e = ke ? De ? "right" : "left" : "top", De && ke && (We *= -1);
    for (const Ke of Ie) {
      const qe = Ke.el;
      qe ? (_e === "top" ? (qe.style.right = "", qe.style.left = "") : qe.style.top = "", Ke.index !== Fe ? qe.style[_e] = Ve === 0 ? "" : `${t(Ve, 1e3)}px` : qe.style[_e] = "", He += Ke.dim + Ke.gap, Fe++) : Ve += Ke.dim + Ke.gap;
    }
    if (Re && He && $e) {
      let Ke = getComputedStyle($e), qe = "padding", Ue = ke ? "Right" : "Bottom", Qe = parseFloat(Ke[qe + (ke ? "Left" : "Top")]);
      We -= Qe, Be += Qe, Be += parseFloat(Ke[qe + Ue]);
      for (const Je of Ie) Je.el && (t(Je.pos) < t(Be) && t(Je.pos + Je.dim + Je.gap) < t(We) && t(We) > t(Ne - Be) && (Je.el.style[_e] = `${t(Ve + He, 1e3)}px`), t(Je.pos + Je.gap) >= t(Ne - Be) && t(Je.pos) > t(We + Be) && t(We) < t(Be) && (Je.el.style[_e] = `-${t(He, 1e3)}px`));
    }
    let Xe, Ye, Ze = [...this.inTransition];
    if (Ze.length > 1 && (Xe = Ae[Ze[0]], Ye = Ae[Ze[1]]), Xe && Ye) {
      let Ke = 0;
      for (const qe of Ie) qe.el ? this.inTransition.has(qe.index) && Xe.slides.indexOf(qe) < 0 && (qe.el.style[_e] = `${t(Ke + (Xe.pos - Ye.pos), 1e3)}px`) : Ke += qe.dim + qe.gap;
    }
  }
  createSlideEl(_e) {
    const { track: ke, slides: De } = this;
    if (!ke || !_e || _e.el && _e.el.parentNode) return;
    const Re = _e.el || document.createElement("div");
    P(Re, this.cn(J)), P(Re, _e.class), P(Re, _e.customClass);
    const $e = _e.html;
    $e && ($e instanceof HTMLElement ? Re.appendChild($e) : Re.innerHTML = _e.html + "");
    const Be = [];
    De.forEach((Ie, je) => {
      Ie.el && Be.push(je);
    });
    const Ne = _e.index;
    let ze = null;
    Be.length && (ze = De[Be.reduce((Ie, je) => Math.abs(je - Ne) < Math.abs(Ie - Ne) ? je : Ie)]);
    const Ae = ze && ze.el && ze.el.parentNode ? ze.index < _e.index ? ze.el.nextSibling : ze.el : null;
    ke.insertBefore(Re, ke.contains(Ae) ? Ae : null), _e.el = Re, this.emit("createSlide", _e);
  }
  removeSlideEl(_e, ke = !1) {
    const De = _e == null ? void 0 : _e.el;
    if (!De || !De.parentNode) return;
    const Re = this.cn(K);
    if (De.classList.contains(Re) && (S(De, Re), this.emit("unselectSlide", _e)), _e.isDom && !ke) return De.removeAttribute("aria-hidden"), De.removeAttribute("data-index"), void (De.style.left = "");
    this.emit("removeSlide", _e);
    const $e = new CustomEvent(G);
    De.dispatchEvent($e), _e.el && (_e.el.remove(), _e.el = null);
  }
  transitionTo(_e = 0, ke = this.option("transition")) {
    var De, Re, $e, Be;
    if (!ke) return !1;
    const Ne = this.page, { pages: ze, panzoom: Ae } = this;
    _e = parseInt((_e || 0).toString()) || 0;
    const Ie = this.getPageFromIndex(_e);
    if (!Ae || !ze[Ie] || ze.length < 2 || Math.abs((((Re = (De = ze[Ne]) === null || De === void 0 ? void 0 : De.slides[0]) === null || Re === void 0 ? void 0 : Re.dim) || 0) - this.viewportDim) > 1) return !1;
    let je = _e > Ne ? 1 : -1;
    this.isInfinite && (Ne === 0 && _e === ze.length - 1 && (je = -1), Ne === ze.length - 1 && _e === 0 && (je = 1));
    const Fe = ze[Ie].pos * (this.isRTL ? 1 : -1);
    if (Ne === Ie && Math.abs(Fe - Ae.target[this.axis]) < 1) return !1;
    this.clearTransitions();
    const Ve = Ae.isResting;
    P(this.container, this.cn("inTransition"));
    const He = (($e = ze[Ne]) === null || $e === void 0 ? void 0 : $e.slides[0]) || null, We = ((Be = ze[Ie]) === null || Be === void 0 ? void 0 : Be.slides[0]) || null;
    this.inTransition.add(We.index), this.createSlideEl(We);
    let Xe = He.el, Ye = We.el;
    Ve || ke === J || (ke = "fadeFast", Xe = null);
    const Ze = this.isRTL ? "next" : "prev", Ke = this.isRTL ? "prev" : "next";
    return Xe && (this.inTransition.add(He.index), He.transition = ke, Xe.addEventListener(G, this.onAnimationEnd), Xe.classList.add(`f-${ke}Out`, `to-${je > 0 ? Ke : Ze}`)), Ye && (We.transition = ke, Ye.addEventListener(G, this.onAnimationEnd), Ye.classList.add(`f-${ke}In`, `from-${je > 0 ? Ze : Ke}`)), Ae.current[this.axis] = Fe, Ae.target[this.axis] = Fe, Ae.requestTick(), this.onChange(Ie), !0;
  }
  manageSlideVisiblity() {
    const _e = /* @__PURE__ */ new Set(), ke = /* @__PURE__ */ new Set(), De = this.getVisibleSlides(parseFloat(this.option("preload", 0) + "") || 0);
    for (const Re of this.slides) De.has(Re) ? _e.add(Re) : ke.add(Re);
    for (const Re of this.inTransition) _e.add(this.slides[Re]);
    for (const Re of _e) this.createSlideEl(Re), this.lazyLoadSlide(Re);
    for (const Re of ke) _e.has(Re) || this.removeSlideEl(Re);
    this.markSelectedSlides(), this.repositionSlides();
  }
  markSelectedSlides() {
    if (!this.pages[this.page] || !this.pages[this.page].slides) return;
    const _e = "aria-hidden";
    let ke = this.cn(K);
    if (ke) for (const De of this.slides) {
      const Re = De.el;
      Re && (Re.dataset.index = `${De.index}`, Re.classList.contains("f-thumbs__slide") ? this.getVisibleSlides(0).has(De) ? Re.removeAttribute(_e) : Re.setAttribute(_e, "true") : this.pages[this.page].slides.includes(De) ? (Re.classList.contains(ke) || (P(Re, ke), this.emit("selectSlide", De)), Re.removeAttribute(_e)) : (Re.classList.contains(ke) && (S(Re, ke), this.emit("unselectSlide", De)), Re.setAttribute(_e, "true")));
    }
  }
  flipInfiniteTrack() {
    const { axis: _e, isHorizontal: ke, isInfinite: De, isRTL: Re, viewportDim: $e, contentDim: Be } = this, Ne = this.panzoom;
    if (!Ne || !De) return;
    let ze = Ne.current[_e], Ae = Ne.target[_e] - ze, Ie = 0, je = 0.5 * $e;
    Re && ke ? (ze < -je && (Ie = -1, ze += Be), ze > Be - je && (Ie = 1, ze -= Be)) : (ze > je && (Ie = 1, ze -= Be), ze < -Be + je && (Ie = -1, ze += Be)), Ie && (Ne.current[_e] = ze, Ne.target[_e] = ze + Ae);
  }
  lazyLoadImg(_e, ke) {
    const De = this, Re = "f-fadeIn", $e = "is-preloading";
    let Be = !1, Ne = null;
    const ze = () => {
      Be || (Be = !0, Ne && (Ne.remove(), Ne = null), S(ke, $e), ke.complete && (P(ke, Re), setTimeout(() => {
        S(ke, Re);
      }, 350)), this.option("adaptiveHeight") && _e.el && this.pages[this.page].slides.indexOf(_e) > -1 && (De.updateMetrics(), De.setViewportHeight()), this.emit("load", _e));
    };
    P(ke, $e), ke.src = ke.dataset.lazySrcset || ke.dataset.lazySrc || "", delete ke.dataset.lazySrc, delete ke.dataset.lazySrcset, ke.addEventListener("error", () => {
      ze();
    }), ke.addEventListener("load", () => {
      ze();
    }), setTimeout(() => {
      const Ae = ke.parentNode;
      Ae && _e.el && (ke.complete ? ze() : Be || (Ne = n(x), Ae.insertBefore(Ne, ke)));
    }, 300);
  }
  lazyLoadSlide(_e) {
    const ke = _e && _e.el;
    if (!ke) return;
    const De = /* @__PURE__ */ new Set();
    let Re = Array.from(ke.querySelectorAll("[data-lazy-src],[data-lazy-srcset]"));
    ke.dataset.lazySrc && Re.push(ke), Re.map(($e) => {
      $e instanceof HTMLImageElement ? De.add($e) : $e instanceof HTMLElement && $e.dataset.lazySrc && ($e.style.backgroundImage = `url('${$e.dataset.lazySrc}')`, delete $e.dataset.lazySrc);
    });
    for (const $e of De) this.lazyLoadImg(_e, $e);
  }
  onAnimationEnd(_e) {
    var ke;
    const De = _e.target, Re = De ? parseInt(De.dataset.index || "", 10) || 0 : -1, $e = this.slides[Re], Be = _e.animationName;
    if (!De || !$e || !Be) return;
    const Ne = !!this.inTransition.has(Re) && $e.transition;
    Ne && Be.substring(0, Ne.length + 2) === `f-${Ne}` && this.inTransition.delete(Re), this.inTransition.size || this.clearTransitions(), Re === this.page && (!((ke = this.panzoom) === null || ke === void 0) && ke.isResting) && this.emit("settle");
  }
  onDecel(_e, ke = 0, De = 0, Re = 0, $e = 0) {
    if (this.option("dragFree")) return void this.setPageFromPosition();
    const { isRTL: Be, isHorizontal: Ne, axis: ze, pages: Ae } = this, Ie = Ae.length, je = Math.abs(Math.atan2(De, ke) / (Math.PI / 180));
    let Fe = 0;
    if (Fe = je > 45 && je < 135 ? Ne ? 0 : De : Ne ? ke : 0, !Ie) return;
    let Ve = this.page, He = Be && Ne ? 1 : -1;
    const We = _e.current[ze] * He;
    let { pageIndex: Xe } = this.getPageFromPosition(We);
    Math.abs(Fe) > 5 ? (Ae[Ve].dim < document.documentElement["client" + (this.isHorizontal ? "Width" : "Height")] - 1 && (Ve = Xe), Ve = Be && Ne ? Fe < 0 ? Ve - 1 : Ve + 1 : Fe < 0 ? Ve + 1 : Ve - 1) : Ve = Re === 0 && $e === 0 ? Ve : Xe, this.slideTo(Ve, { transition: !1, friction: _e.option("decelFriction") });
  }
  onClick(_e) {
    const ke = _e.target, De = ke && E(ke) ? ke.dataset : null;
    let Re, $e;
    De && (De.carouselPage !== void 0 ? ($e = "slideTo", Re = De.carouselPage) : De.carouselNext !== void 0 ? $e = "slideNext" : De.carouselPrev !== void 0 && ($e = "slidePrev")), $e ? (_e.preventDefault(), _e.stopPropagation(), ke && !ke.hasAttribute("disabled") && this[$e](Re)) : this.emit("click", _e);
  }
  onSlideTo(_e) {
    const ke = _e.detail || 0;
    this.slideTo(this.getPageForSlide(ke), { friction: 0 });
  }
  onChange(_e, ke = 0) {
    const De = this.page;
    this.prevPage = De, this.page = _e, this.option("adaptiveHeight") && this.setViewportHeight(), _e !== De && (this.markSelectedSlides(), this.emit("change", _e, De, ke));
  }
  onRefresh() {
    let _e = this.contentDim, ke = this.viewportDim;
    this.updateMetrics(), this.contentDim === _e && this.viewportDim === ke || this.slideTo(this.page, { friction: 0, transition: !1 });
  }
  onScroll() {
    var _e;
    (_e = this.viewport) === null || _e === void 0 || _e.scroll(0, 0);
  }
  onResize() {
    this.option("breakpoints") && this.processOptions();
  }
  onBeforeTransform(_e) {
    this.lp !== _e.current[this.axis] && (this.flipInfiniteTrack(), this.manageSlideVisiblity()), this.lp = _e.current.e;
  }
  onEndAnimation() {
    this.inTransition.size || this.emit("settle");
  }
  reInit(_e = null, ke = null) {
    this.destroy(), this.state = B.Init, this.prevPage = null, this.userOptions = _e || this.userOptions, this.userPlugins = ke || this.userPlugins, this.processOptions();
  }
  slideTo(_e = 0, { friction: ke = this.option("friction"), transition: De = this.option("transition") } = {}) {
    if (this.state === B.Destroy) return;
    _e = parseInt((_e || 0).toString()) || 0;
    const Re = this.getPageFromIndex(_e), { axis: $e, isHorizontal: Be, isRTL: Ne, pages: ze, panzoom: Ae } = this, Ie = ze.length, je = Ne && Be ? 1 : -1;
    if (!Ae || !Ie) return;
    if (this.page !== Re) {
      const Ve = new Event("beforeChange", { bubbles: !0, cancelable: !0 });
      if (this.emit("beforeChange", Ve, _e), Ve.defaultPrevented) return;
    }
    if (this.transitionTo(_e, De)) return;
    let Fe = ze[Re].pos;
    if (this.isInfinite) {
      const Ve = this.contentDim, He = Ae.target[$e] * je;
      Ie === 2 ? Fe += Ve * Math.floor(parseFloat(_e + "") / 2) : Fe = [Fe, Fe - Ve, Fe + Ve].reduce(function(We, Xe) {
        return Math.abs(Xe - He) < Math.abs(We - He) ? Xe : We;
      });
    }
    Fe *= je, Math.abs(Ae.target[$e] - Fe) < 1 || (Ae.panTo({ x: Be ? Fe : 0, y: Be ? 0 : Fe, friction: ke }), this.onChange(Re));
  }
  slideToClosest(_e) {
    if (this.panzoom) {
      const { pageIndex: ke } = this.getPageFromPosition();
      this.slideTo(ke, _e);
    }
  }
  slideNext() {
    this.slideTo(this.page + 1);
  }
  slidePrev() {
    this.slideTo(this.page - 1);
  }
  clearTransitions() {
    this.inTransition.clear(), S(this.container, this.cn("inTransition"));
    const _e = ["to-prev", "to-next", "from-prev", "from-next"];
    for (const ke of this.slides) {
      const De = ke.el;
      if (De) {
        De.removeEventListener(G, this.onAnimationEnd), De.classList.remove(..._e);
        const Re = ke.transition;
        Re && De.classList.remove(`f-${Re}Out`, `f-${Re}In`);
      }
    }
    this.manageSlideVisiblity();
  }
  addSlide(_e, ke) {
    var De, Re, $e, Be;
    const Ne = this.panzoom, ze = ((De = this.pages[this.page]) === null || De === void 0 ? void 0 : De.pos) || 0, Ae = ((Re = this.pages[this.page]) === null || Re === void 0 ? void 0 : Re.dim) || 0, Ie = this.contentDim < this.viewportDim;
    let je = Array.isArray(ke) ? ke : [ke];
    const Fe = [];
    for (const Ve of je) Fe.push(H(Ve));
    this.slides.splice(_e, 0, ...Fe);
    for (let Ve = 0; Ve < this.slides.length; Ve++) this.slides[Ve].index = Ve;
    for (const Ve of Fe) this.emit("beforeInitSlide", Ve, Ve.index);
    if (this.page >= _e && (this.page += Fe.length), this.updateMetrics(), Ne) {
      const Ve = (($e = this.pages[this.page]) === null || $e === void 0 ? void 0 : $e.pos) || 0, He = ((Be = this.pages[this.page]) === null || Be === void 0 ? void 0 : Be.dim) || 0, We = this.pages.length || 1, Xe = this.isRTL ? Ae - He : He - Ae, Ye = this.isRTL ? ze - Ve : Ve - ze;
      Ie && We === 1 ? (_e <= this.page && (Ne.current[this.axis] -= Xe, Ne.target[this.axis] -= Xe), Ne.panTo({ [this.isHorizontal ? "x" : "y"]: -1 * Ve })) : Ye && _e <= this.page && (Ne.target[this.axis] -= Ye, Ne.current[this.axis] -= Ye, Ne.requestTick());
    }
    for (const Ve of Fe) this.emit("initSlide", Ve, Ve.index);
  }
  prependSlide(_e) {
    this.addSlide(0, _e);
  }
  appendSlide(_e) {
    this.addSlide(this.slides.length, _e);
  }
  removeSlide(_e) {
    const ke = this.slides.length;
    _e = (_e % ke + ke) % ke;
    const De = this.slides[_e];
    if (De) {
      this.removeSlideEl(De, !0), this.slides.splice(_e, 1);
      for (let Re = 0; Re < this.slides.length; Re++) this.slides[Re].index = Re;
      this.updateMetrics(), this.slideTo(this.page, { friction: 0, transition: !1 }), this.emit("destroySlide", De);
    }
  }
  updateMetrics() {
    const { panzoom: _e, viewport: ke, track: De, slides: Re, isHorizontal: $e, isInfinite: Be } = this;
    if (!De) return;
    const Ne = $e ? "width" : "height", ze = $e ? "offsetWidth" : "offsetHeight";
    if (ke) {
      let je = Math.max(ke[ze], t(ke.getBoundingClientRect()[Ne], 1e3)), Fe = getComputedStyle(ke), Ve = "padding", He = $e ? "Right" : "Bottom";
      je -= parseFloat(Fe[Ve + ($e ? "Left" : "Top")]) + parseFloat(Fe[Ve + He]), this.viewportDim = je;
    }
    let Ae, Ie = 0;
    for (const [je, Fe] of Re.entries()) {
      let Ve = 0, He = 0;
      !Fe.el && Ae ? (Ve = Ae.dim, He = Ae.gap) : ({ dim: Ve, gap: He } = this.getSlideMetrics(Fe), Ae = Fe), Ve = t(Ve, 1e3), He = t(He, 1e3), Fe.dim = Ve, Fe.gap = He, Fe.pos = Ie, Ie += Ve, (Be || je < Re.length - 1) && (Ie += He);
    }
    Ie = t(Ie, 1e3), this.contentDim = Ie, _e && (_e.contentRect[Ne] = Ie, _e.contentRect[$e ? "fullWidth" : "fullHeight"] = Ie), this.pages = this.createPages(), this.pages = this.processPages(), this.state === B.Init && this.setInitialPage(), this.page = Math.max(0, Math.min(this.page, this.pages.length - 1)), this.manageSlideVisiblity(), this.emit("refresh");
  }
  getProgress(_e, ke = !1, De = !1) {
    _e === void 0 && (_e = this.page);
    const Re = this, $e = Re.panzoom, Be = Re.contentDim, Ne = Re.pages[_e] || 0;
    if (!Ne || !$e) return _e > this.page ? -1 : 1;
    let ze = -1 * $e.current.e, Ae = t((ze - Ne.pos) / (1 * Ne.dim), 1e3), Ie = Ae, je = Ae;
    this.isInfinite && De !== !0 && (Ie = t((ze - Ne.pos + Be) / (1 * Ne.dim), 1e3), je = t((ze - Ne.pos - Be) / (1 * Ne.dim), 1e3));
    let Fe = [Ae, Ie, je].reduce(function(Ve, He) {
      return Math.abs(He) < Math.abs(Ve) ? He : Ve;
    });
    return ke ? Fe : Fe > 1 ? 1 : Fe < -1 ? -1 : Fe;
  }
  setViewportHeight() {
    const { page: _e, pages: ke, viewport: De, isHorizontal: Re } = this;
    if (!De || !ke[_e]) return;
    let $e = 0;
    Re && this.track && (this.track.style.height = "auto", ke[_e].slides.forEach((Be) => {
      Be.el && ($e = Math.max($e, Be.el.offsetHeight));
    })), De.style.height = $e ? `${$e}px` : "";
  }
  getPageForSlide(_e) {
    for (const ke of this.pages) for (const De of ke.slides) if (De.index === _e) return ke.index;
    return -1;
  }
  getVisibleSlides(_e = 0) {
    var ke;
    const De = /* @__PURE__ */ new Set();
    let { panzoom: Re, contentDim: $e, viewportDim: Be, pages: Ne, page: ze } = this;
    if (Be) {
      $e = $e + ((ke = this.slides[this.slides.length - 1]) === null || ke === void 0 ? void 0 : ke.gap) || 0;
      let Ae = 0;
      Ae = Re && Re.state !== m.Init && Re.state !== m.Destroy ? -1 * Re.current[this.axis] : Ne[ze] && Ne[ze].pos || 0, this.isInfinite && (Ae -= Math.floor(Ae / $e) * $e), this.isRTL && this.isHorizontal && (Ae *= -1);
      const Ie = Ae - Be * _e, je = Ae + Be * (_e + 1), Fe = this.isInfinite ? [-1, 0, 1] : [0];
      for (const Ve of this.slides) for (const He of Fe) {
        const We = Ve.pos + He * $e, Xe = We + Ve.dim + Ve.gap;
        We < je && Xe > Ie && De.add(Ve);
      }
    }
    return De;
  }
  getPageFromPosition(_e) {
    const { viewportDim: ke, contentDim: De, slides: Re, pages: $e, panzoom: Be } = this, Ne = $e.length, ze = Re.length, Ae = Re[0], Ie = Re[ze - 1], je = this.option("center");
    let Fe = 0, Ve = 0, He = 0, We = _e === void 0 ? -1 * ((Be == null ? void 0 : Be.target[this.axis]) || 0) : _e;
    je && (We += 0.5 * ke), this.isInfinite ? (We < Ae.pos - 0.5 * Ie.gap && (We -= De, He = -1), We > Ie.pos + Ie.dim + 0.5 * Ie.gap && (We -= De, He = 1)) : We = Math.max(Ae.pos || 0, Math.min(We, Ie.pos));
    let Xe = Ie, Ye = Re.find((Ze) => {
      const Ke = Ze.pos - 0.5 * Xe.gap, qe = Ze.pos + Ze.dim + 0.5 * Ze.gap;
      return Xe = Ze, We >= Ke && We < qe;
    });
    return Ye || (Ye = Ie), Ve = this.getPageForSlide(Ye.index), Fe = Ve + He * Ne, { page: Fe, pageIndex: Ve };
  }
  setPageFromPosition() {
    const { pageIndex: _e } = this.getPageFromPosition();
    this.onChange(_e);
  }
  destroy() {
    if ([B.Destroy].includes(this.state)) return;
    this.state = B.Destroy;
    const { container: _e, viewport: ke, track: De, slides: Re, panzoom: $e } = this, Be = this.option("classes");
    _e.removeEventListener("click", this.onClick, { passive: !1, capture: !1 }), _e.removeEventListener("slideTo", this.onSlideTo), window.removeEventListener("resize", this.onResize), $e && ($e.destroy(), this.panzoom = null), Re && Re.forEach((ze) => {
      this.removeSlideEl(ze);
    }), this.detachPlugins(), ke && (ke.removeEventListener("scroll", this.onScroll), ke.offsetParent && De && De.offsetParent && ke.replaceWith(...De.childNodes));
    for (const [ze, Ae] of Object.entries(Be)) ze !== "container" && Ae && _e.classList.remove(Ae);
    this.track = null, this.viewport = null, this.page = 0, this.slides = [];
    const Ne = this.events.get("ready");
    this.events = /* @__PURE__ */ new Map(), Ne && this.events.set("ready", Ne);
  }
}
Object.defineProperty(Q, "Panzoom", { enumerable: !0, configurable: !0, writable: !0, value: I }), Object.defineProperty(Q, "defaults", { enumerable: !0, configurable: !0, writable: !0, value: j }), Object.defineProperty(Q, "Plugins", { enumerable: !0, configurable: !0, writable: !0, value: U });
const tt = function(Le) {
  if (!E(Le)) return 0;
  const _e = window.scrollY, ke = window.innerHeight, De = _e + ke, Re = Le.getBoundingClientRect(), $e = Re.y + _e, Be = Re.height, Ne = $e + Be;
  if (_e > Ne || De < $e) return 0;
  if (_e < $e && De > Ne || $e < _e && Ne > De) return 100;
  let ze = Be;
  $e < _e && (ze -= _e - $e), Ne > De && (ze -= Ne - De);
  const Ae = ze / ke * 100;
  return Math.round(Ae);
}, et = !(typeof window > "u" || !window.document || !window.document.createElement);
let it;
const nt = ["a[href]", "area[href]", 'input:not([disabled]):not([type="hidden"]):not([aria-hidden])', "select:not([disabled]):not([aria-hidden])", "textarea:not([disabled]):not([aria-hidden])", "button:not([disabled]):not([aria-hidden]):not(.fancybox-focus-guard)", "iframe", "object", "embed", "video", "audio", "[contenteditable]", '[tabindex]:not([tabindex^="-"]):not([disabled]):not([aria-hidden])'].join(","), st = (Le) => {
  if (Le && et) {
    it === void 0 && document.createElement("div").focus({ get preventScroll() {
      return it = !0, !1;
    } });
    try {
      if (it) Le.focus({ preventScroll: !0 });
      else {
        const _e = window.scrollY || document.body.scrollTop, ke = window.scrollX || document.body.scrollLeft;
        Le.focus(), document.body.scrollTo({ top: _e, left: ke, behavior: "auto" });
      }
    } catch {
    }
  }
}, ot = () => {
  const Le = document;
  let _e, ke = "", De = "", Re = "";
  return Le.fullscreenEnabled ? (ke = "requestFullscreen", De = "exitFullscreen", Re = "fullscreenElement") : Le.webkitFullscreenEnabled && (ke = "webkitRequestFullscreen", De = "webkitExitFullscreen", Re = "webkitFullscreenElement"), ke && (_e = { request: function($e = Le.documentElement) {
    return ke === "webkitRequestFullscreen" ? $e[ke](Element.ALLOW_KEYBOARD_INPUT) : $e[ke]();
  }, exit: function() {
    return Le[Re] && Le[De]();
  }, isFullscreen: function() {
    return Le[Re];
  } }), _e;
}, at = { animated: !0, autoFocus: !0, backdropClick: "close", Carousel: { classes: { container: "fancybox__carousel", viewport: "fancybox__viewport", track: "fancybox__track", slide: "fancybox__slide" } }, closeButton: "auto", closeExisting: !1, commonCaption: !1, compact: () => window.matchMedia("(max-width: 578px), (max-height: 578px)").matches, contentClick: "toggleZoom", contentDblClick: !1, defaultType: "image", defaultDisplay: "flex", dragToClose: !0, Fullscreen: { autoStart: !1 }, groupAll: !1, groupAttr: "data-fancybox", hideClass: "f-fadeOut", hideScrollbar: !0, idle: 3500, keyboard: { Escape: "close", Delete: "close", Backspace: "close", PageUp: "next", PageDown: "prev", ArrowUp: "prev", ArrowDown: "next", ArrowRight: "next", ArrowLeft: "prev" }, l10n: Object.assign(Object.assign({}, b), { CLOSE: "Close", NEXT: "Next", PREV: "Previous", MODAL: "You can close this modal content with the ESC key", ERROR: "Something Went Wrong, Please Try Again Later", IMAGE_ERROR: "Image Not Found", ELEMENT_NOT_FOUND: "HTML Element Not Found", AJAX_NOT_FOUND: "Error Loading AJAX : Not Found", AJAX_FORBIDDEN: "Error Loading AJAX : Forbidden", IFRAME_ERROR: "Error Loading Page", TOGGLE_ZOOM: "Toggle zoom level", TOGGLE_THUMBS: "Toggle thumbnails", TOGGLE_SLIDESHOW: "Toggle slideshow", TOGGLE_FULLSCREEN: "Toggle full-screen mode", DOWNLOAD: "Download" }), parentEl: null, placeFocusBack: !0, showClass: "f-zoomInUp", startIndex: 0, tpl: { closeButton: '<button data-fancybox-close class="f-button is-close-btn" title="{{CLOSE}}"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" tabindex="-1"><path d="M20 20L4 4m16 0L4 20"/></svg></button>', main: `<div class="fancybox__container" role="dialog" aria-modal="true" aria-label="{{MODAL}}" tabindex="-1">
    <div class="fancybox__backdrop"></div>
    <div class="fancybox__carousel"></div>
    <div class="fancybox__footer"></div>
  </div>` }, trapFocus: !0, wheel: "zoom" };
var rt, lt;
(function(Le) {
  Le[Le.Init = 0] = "Init", Le[Le.Ready = 1] = "Ready", Le[Le.Closing = 2] = "Closing", Le[Le.CustomClosing = 3] = "CustomClosing", Le[Le.Destroy = 4] = "Destroy";
})(rt || (rt = {})), function(Le) {
  Le[Le.Loading = 0] = "Loading", Le[Le.Opening = 1] = "Opening", Le[Le.Ready = 2] = "Ready", Le[Le.Closing = 3] = "Closing";
}(lt || (lt = {}));
let ct = "", ht = !1, dt = !1, ut = null;
const pt = () => {
  let Le = "", _e = "";
  const ke = Oe.getInstance();
  if (ke) {
    const De = ke.carousel, Re = ke.getSlide();
    if (De && Re) {
      let $e = Re.slug || void 0, Be = Re.triggerEl || void 0;
      _e = $e || ke.option("slug") || "", !_e && Be && Be.dataset && (_e = Be.dataset.fancybox || ""), _e && _e !== "true" && (Le = "#" + _e + (!$e && De.slides.length > 1 ? "-" + (Re.index + 1) : ""));
    }
  }
  return { hash: Le, slug: _e, index: 1 };
}, ft = () => {
  const Le = new URL(document.URL).hash, _e = Le.slice(1).split("-"), ke = _e[_e.length - 1], De = ke && /^\+?\d+$/.test(ke) && parseInt(_e.pop() || "1", 10) || 1;
  return { hash: Le, slug: _e.join("-"), index: De };
}, gt = () => {
  const { slug: Le, index: _e } = ft();
  if (!Le) return;
  let ke = document.querySelector(`[data-slug="${Le}"]`);
  if (ke && ke.dispatchEvent(new CustomEvent("click", { bubbles: !0, cancelable: !0 })), Oe.getInstance()) return;
  const De = document.querySelectorAll(`[data-fancybox="${Le}"]`);
  De.length && (ke = De[_e - 1], ke && ke.dispatchEvent(new CustomEvent("click", { bubbles: !0, cancelable: !0 })));
}, mt = () => {
  if (Oe.defaults.Hash === !1) return;
  const Le = Oe.getInstance();
  if ((Le == null ? void 0 : Le.options.Hash) === !1) return;
  const { slug: _e, index: ke } = ft(), { slug: De } = pt();
  Le && (_e === De ? Le.jumpTo(ke - 1) : (ht = !0, Le.close())), gt();
}, vt = () => {
  ut && clearTimeout(ut), queueMicrotask(() => {
    mt();
  });
}, bt = () => {
  window.addEventListener("hashchange", vt, !1), setTimeout(() => {
    mt();
  }, 500);
};
et && (/complete|interactive|loaded/.test(document.readyState) ? bt() : document.addEventListener("DOMContentLoaded", bt));
const yt = "is-zooming-in";
class wt extends _ {
  onCreateSlide(_e, ke, De) {
    const Re = this.instance.optionFor(De, "src") || "";
    De.el && De.type === "image" && typeof Re == "string" && this.setImage(De, Re);
  }
  onRemoveSlide(_e, ke, De) {
    De.panzoom && De.panzoom.destroy(), De.panzoom = void 0, De.imageEl = void 0;
  }
  onChange(_e, ke, De, Re) {
    S(this.instance.container, yt);
    for (const $e of ke.slides) {
      const Be = $e.panzoom;
      Be && $e.index !== De && Be.reset(0.35);
    }
  }
  onClose() {
    var _e;
    const ke = this.instance, De = ke.container, Re = ke.getSlide();
    if (!De || !De.parentElement || !Re) return;
    const { el: $e, contentEl: Be, panzoom: Ne, thumbElSrc: ze } = Re;
    if (!$e || !ze || !Be || !Ne || Ne.isContentLoading || Ne.state === m.Init || Ne.state === m.Destroy) return;
    Ne.updateMetrics();
    let Ae = this.getZoomInfo(Re);
    if (!Ae) return;
    this.instance.state = rt.CustomClosing, De.classList.remove(yt), De.classList.add("is-zooming-out"), Be.style.backgroundImage = `url('${ze}')`;
    const Ie = De.getBoundingClientRect();
    (((_e = window.visualViewport) === null || _e === void 0 ? void 0 : _e.scale) || 1) === 1 && Object.assign(De.style, { position: "absolute", top: `${De.offsetTop + window.scrollY}px`, left: `${De.offsetLeft + window.scrollX}px`, bottom: "auto", right: "auto", width: `${Ie.width}px`, height: `${Ie.height}px`, overflow: "hidden" });
    const { x: je, y: Fe, scale: Ve, opacity: He } = Ae;
    if (He) {
      const We = ((Xe, Ye, Ze, Ke) => {
        const qe = Ye - Xe, Ue = Ke - Ze;
        return (Qe) => Ze + ((Qe - Xe) / qe * Ue || 0);
      })(Ne.scale, Ve, 1, 0);
      Ne.on("afterTransform", () => {
        Be.style.opacity = We(Ne.scale) + "";
      });
    }
    Ne.on("endAnimation", () => {
      ke.destroy();
    }), Ne.target.a = Ve, Ne.target.b = 0, Ne.target.c = 0, Ne.target.d = Ve, Ne.panTo({ x: je, y: Fe, scale: Ve, friction: He ? 0.2 : 0.33, ignoreBounds: !0 }), Ne.isResting && ke.destroy();
  }
  setImage(_e, ke) {
    const De = this.instance;
    _e.src = ke, this.process(_e, ke).then((Re) => {
      const { contentEl: $e, imageEl: Be, thumbElSrc: Ne, el: ze } = _e;
      if (De.isClosing() || !$e || !Be) return;
      $e.offsetHeight;
      const Ae = !!De.isOpeningSlide(_e) && this.getZoomInfo(_e);
      if (this.option("protected") && ze) {
        ze.addEventListener("contextmenu", (Fe) => {
          Fe.preventDefault();
        });
        const je = document.createElement("div");
        P(je, "fancybox-protected"), $e.appendChild(je);
      }
      if (Ne && Ae) {
        const je = Re.contentRect, Fe = Math.max(je.fullWidth, je.fullHeight);
        let Ve = null;
        !Ae.opacity && Fe > 1200 && (Ve = document.createElement("img"), P(Ve, "fancybox-ghost"), Ve.src = Ne, $e.appendChild(Ve));
        const He = () => {
          Ve && (P(Ve, "f-fadeFastOut"), setTimeout(() => {
            Ve && (Ve.remove(), Ve = null);
          }, 200));
        };
        (Ie = Ne, new Promise((We, Xe) => {
          const Ye = new Image();
          Ye.onload = We, Ye.onerror = Xe, Ye.src = Ie;
        })).then(() => {
          De.hideLoading(_e), _e.state = lt.Opening, this.instance.emit("reveal", _e), this.zoomIn(_e).then(() => {
            He(), this.instance.done(_e);
          }, () => {
          }), Ve && setTimeout(() => {
            He();
          }, Fe > 2500 ? 800 : 200);
        }, () => {
          De.hideLoading(_e), De.revealContent(_e);
        });
      } else {
        const je = this.optionFor(_e, "initialSize"), Fe = this.optionFor(_e, "zoom"), Ve = { event: De.prevMouseMoveEvent || De.options.event, friction: Fe ? 0.12 : 0 };
        let He = De.optionFor(_e, "showClass") || void 0, We = !0;
        De.isOpeningSlide(_e) && (je === "full" ? Re.zoomToFull(Ve) : je === "cover" ? Re.zoomToCover(Ve) : je === "max" ? Re.zoomToMax(Ve) : We = !1, Re.stop("current")), We && He && (He = Re.isDragging ? "f-fadeIn" : ""), De.hideLoading(_e), De.revealContent(_e, He);
      }
      var Ie;
    }, () => {
      De.setError(_e, "{{IMAGE_ERROR}}");
    });
  }
  process(_e, ke) {
    return new Promise((De, Re) => {
      var $e;
      const Be = this.instance, Ne = _e.el;
      Be.clearContent(_e), Be.showLoading(_e);
      let ze = this.optionFor(_e, "content");
      if (typeof ze == "string" && (ze = n(ze)), !ze || !E(ze)) {
        if (ze = document.createElement("img"), ze instanceof HTMLImageElement) {
          let Ae = "", Ie = _e.caption;
          Ae = typeof Ie == "string" && Ie ? Ie.replace(/<[^>]+>/gi, "").substring(0, 1e3) : `Image ${_e.index + 1} of ${(($e = Be.carousel) === null || $e === void 0 ? void 0 : $e.pages.length) || 1}`, ze.src = ke || "", ze.alt = Ae, ze.draggable = !1, _e.srcset && ze.setAttribute("srcset", _e.srcset), this.instance.isOpeningSlide(_e) && (ze.fetchPriority = "high");
        }
        _e.sizes && ze.setAttribute("sizes", _e.sizes);
      }
      P(ze, "fancybox-image"), _e.imageEl = ze, Be.setContent(_e, ze, !1), _e.panzoom = new I(Ne, u({ transformParent: !0 }, this.option("Panzoom") || {}, { content: ze, width: (Ae, Ie) => Be.optionFor(_e, "width", "auto", Ie) || "auto", height: (Ae, Ie) => Be.optionFor(_e, "height", "auto", Ie) || "auto", wheel: () => {
        const Ae = Be.option("wheel");
        return (Ae === "zoom" || Ae == "pan") && Ae;
      }, click: (Ae, Ie) => {
        var je, Fe;
        if (Be.isCompact || Be.isClosing() || _e.index !== ((je = Be.getSlide()) === null || je === void 0 ? void 0 : je.index)) return !1;
        if (Ie) {
          const He = Ie.composedPath()[0];
          if (["A", "BUTTON", "TEXTAREA", "OPTION", "INPUT", "SELECT", "VIDEO"].includes(He.nodeName)) return !1;
        }
        let Ve = !Ie || Ie.target && ((Fe = _e.contentEl) === null || Fe === void 0 ? void 0 : Fe.contains(Ie.target));
        return Be.option(Ve ? "contentClick" : "backdropClick") || !1;
      }, dblClick: () => Be.isCompact ? "toggleZoom" : Be.option("contentDblClick") || !1, spinner: !1, panOnlyZoomed: !0, wheelLimit: 1 / 0, on: { ready: (Ae) => {
        De(Ae);
      }, error: () => {
        Re();
      }, destroy: () => {
        Re();
      } } }));
    });
  }
  zoomIn(_e) {
    return new Promise((ke, De) => {
      const Re = this.instance, $e = Re.container, { panzoom: Be, contentEl: Ne, el: ze } = _e;
      Be && Be.updateMetrics();
      const Ae = this.getZoomInfo(_e);
      if (!(Ae && ze && Ne && Be && $e)) return void De();
      const { x: Ie, y: je, scale: Fe, opacity: Ve } = Ae, He = () => {
        _e.state !== lt.Closing && (Ve && (Ne.style.opacity = Math.max(Math.min(1, 1 - (1 - Be.scale) / (1 - Fe)), 0) + ""), Be.scale >= 1 && Be.scale > Be.targetScale - 0.1 && ke(Be));
      }, We = (Ze) => {
        (Ze.scale < 0.99 || Ze.scale > 1.01) && !Ze.isDragging || (S($e, yt), Ne.style.opacity = "", Ze.off("endAnimation", We), Ze.off("touchStart", We), Ze.off("afterTransform", He), ke(Ze));
      };
      Be.on("endAnimation", We), Be.on("touchStart", We), Be.on("afterTransform", He), Be.on(["error", "destroy"], () => {
        De();
      }), Be.panTo({ x: Ie, y: je, scale: Fe, friction: 0, ignoreBounds: !0 }), Be.stop("current");
      const Xe = { event: Be.panMode === "mousemove" ? Re.prevMouseMoveEvent || Re.options.event : void 0 }, Ye = this.optionFor(_e, "initialSize");
      P($e, yt), Re.hideLoading(_e), Ye === "full" ? Be.zoomToFull(Xe) : Ye === "cover" ? Be.zoomToCover(Xe) : Ye === "max" ? Be.zoomToMax(Xe) : Be.reset(0.172);
    });
  }
  getZoomInfo(_e) {
    const { el: ke, imageEl: De, thumbEl: Re, panzoom: $e } = _e, Be = this.instance, Ne = Be.container;
    if (!ke || !De || !Re || !$e || tt(Re) < 3 || !this.optionFor(_e, "zoom") || !Ne || Be.state === rt.Destroy || getComputedStyle(Ne).getPropertyValue("--f-images-zoom") === "0") return !1;
    const ze = window.visualViewport || null;
    if ((ze ? ze.scale : 1) !== 1) return !1;
    let { top: Ae, left: Ie, width: je, height: Fe } = Re.getBoundingClientRect(), { top: Ve, left: He, fitWidth: We, fitHeight: Xe } = $e.contentRect;
    if (!(je && Fe && We && Xe)) return !1;
    const Ye = $e.container.getBoundingClientRect();
    He += Ye.left, Ve += Ye.top;
    const Ze = -1 * (He + 0.5 * We - (Ie + 0.5 * je)), Ke = -1 * (Ve + 0.5 * Xe - (Ae + 0.5 * Fe)), qe = je / We;
    let Ue = this.option("zoomOpacity") || !1;
    return Ue === "auto" && (Ue = Math.abs(je / Fe - We / Xe) > 0.1), { x: Ze, y: Ke, scale: qe, opacity: Ue };
  }
  attach() {
    const _e = this, ke = _e.instance;
    ke.on("Carousel.change", _e.onChange), ke.on("Carousel.createSlide", _e.onCreateSlide), ke.on("Carousel.removeSlide", _e.onRemoveSlide), ke.on("close", _e.onClose);
  }
  detach() {
    const _e = this, ke = _e.instance;
    ke.off("Carousel.change", _e.onChange), ke.off("Carousel.createSlide", _e.onCreateSlide), ke.off("Carousel.removeSlide", _e.onRemoveSlide), ke.off("close", _e.onClose);
  }
}
Object.defineProperty(wt, "defaults", { enumerable: !0, configurable: !0, writable: !0, value: { initialSize: "fit", Panzoom: { maxScale: 1 }, protected: !1, zoom: !0, zoomOpacity: "auto" } }), typeof SuppressedError == "function" && SuppressedError;
const xt = "html", Et = "image", St = "map", Pt = "youtube", Ct = "vimeo", Tt = "html5video", Mt = (Le, _e = {}) => {
  const ke = new URL(Le), De = new URLSearchParams(ke.search), Re = new URLSearchParams();
  for (const [Ne, ze] of [...De, ...Object.entries(_e)]) {
    let Ae = ze + "";
    if (Ne === "t") {
      let Ie = Ae.match(/((\d*)m)?(\d*)s?/);
      Ie && Re.set("start", 60 * parseInt(Ie[2] || "0") + parseInt(Ie[3] || "0") + "");
    } else Re.set(Ne, Ae);
  }
  let $e = Re + "", Be = Le.match(/#t=((.*)?\d+s)/);
  return Be && ($e += `#t=${Be[1]}`), $e;
}, Ot = { ajax: null, autoSize: !0, iframeAttr: { allow: "autoplay; fullscreen", scrolling: "auto" }, preload: !0, videoAutoplay: !0, videoRatio: 16 / 9, videoTpl: `<video class="fancybox__html5video" playsinline controls controlsList="nodownload" poster="{{poster}}">
  <source src="{{src}}" type="{{format}}" />Sorry, your browser doesn't support embedded videos.</video>`, videoFormat: "", vimeo: { byline: 1, color: "00adef", controls: 1, dnt: 1, muted: 0 }, youtube: { controls: 1, enablejsapi: 1, nocookie: 1, rel: 0, fs: 1 } }, At = ["image", "html", "ajax", "inline", "clone", "iframe", "map", "pdf", "html5video", "youtube", "vimeo"];
class Lt extends _ {
  onBeforeInitSlide(_e, ke, De) {
    this.processType(De);
  }
  onCreateSlide(_e, ke, De) {
    this.setContent(De);
  }
  onClearContent(_e, ke) {
    ke.xhr && (ke.xhr.abort(), ke.xhr = null);
    const De = ke.iframeEl;
    De && (De.onload = De.onerror = null, De.src = "//about:blank", ke.iframeEl = null);
    const Re = ke.contentEl, $e = ke.placeholderEl;
    if (ke.type === "inline" && Re && $e) Re.classList.remove("fancybox__content"), getComputedStyle(Re).getPropertyValue("display") !== "none" && (Re.style.display = "none"), setTimeout(() => {
      $e && (Re && $e.parentNode && $e.parentNode.insertBefore(Re, $e), $e.remove());
    }, 0), ke.contentEl = void 0, ke.placeholderEl = void 0;
    else for (; ke.el && ke.el.firstChild; ) ke.el.removeChild(ke.el.firstChild);
  }
  onSelectSlide(_e, ke, De) {
    De.state === lt.Ready && this.playVideo();
  }
  onUnselectSlide(_e, ke, De) {
    var Re, $e;
    if (De.type === Tt) {
      try {
        ($e = (Re = De.el) === null || Re === void 0 ? void 0 : Re.querySelector("video")) === null || $e === void 0 || $e.pause();
      } catch {
      }
      return;
    }
    let Be;
    De.type === Ct ? Be = { method: "pause", value: "true" } : De.type === Pt && (Be = { event: "command", func: "pauseVideo" }), Be && De.iframeEl && De.iframeEl.contentWindow && De.iframeEl.contentWindow.postMessage(JSON.stringify(Be), "*"), De.poller && clearTimeout(De.poller);
  }
  onDone(_e, ke) {
    _e.isCurrentSlide(ke) && !_e.isClosing() && this.playVideo();
  }
  onRefresh(_e, ke) {
    ke.slides.forEach((De) => {
      De.el && (this.resizeIframe(De), this.setAspectRatio(De));
    });
  }
  onMessage(_e) {
    try {
      let ke = JSON.parse(_e.data);
      if (_e.origin === "https://player.vimeo.com") {
        if (ke.event === "ready") for (let De of Array.from(document.getElementsByClassName("fancybox__iframe"))) De instanceof HTMLIFrameElement && De.contentWindow === _e.source && (De.dataset.ready = "true");
      } else if (_e.origin.match(/^https:\/\/(www.)?youtube(-nocookie)?.com$/) && ke.event === "onReady") {
        const De = document.getElementById(ke.id);
        De && (De.dataset.ready = "true");
      }
    } catch {
    }
  }
  loadAjaxContent(_e) {
    const ke = this.instance.optionFor(_e, "src") || "";
    this.instance.showLoading(_e);
    const De = this.instance, Re = new XMLHttpRequest();
    De.showLoading(_e), Re.onreadystatechange = function() {
      Re.readyState === XMLHttpRequest.DONE && De.state === rt.Ready && (De.hideLoading(_e), Re.status === 200 ? De.setContent(_e, Re.responseText) : De.setError(_e, Re.status === 404 ? "{{AJAX_NOT_FOUND}}" : "{{AJAX_FORBIDDEN}}"));
    };
    const $e = _e.ajax || null;
    Re.open($e ? "POST" : "GET", ke + ""), Re.setRequestHeader("Content-Type", "application/x-www-form-urlencoded"), Re.setRequestHeader("X-Requested-With", "XMLHttpRequest"), Re.send($e), _e.xhr = Re;
  }
  setInlineContent(_e) {
    let ke = null;
    if (E(_e.src)) ke = _e.src;
    else if (typeof _e.src == "string") {
      const De = _e.src.split("#", 2).pop();
      ke = De ? document.getElementById(De) : null;
    }
    if (ke) {
      if (_e.type === "clone" || ke.closest(".fancybox__slide")) {
        ke = ke.cloneNode(!0);
        const De = ke.dataset.animationName;
        De && (ke.classList.remove(De), delete ke.dataset.animationName);
        let Re = ke.getAttribute("id");
        Re = Re ? `${Re}--clone` : `clone-${this.instance.id}-${_e.index}`, ke.setAttribute("id", Re);
      } else if (ke.parentNode) {
        const De = document.createElement("div");
        De.classList.add("fancybox-placeholder"), ke.parentNode.insertBefore(De, ke), _e.placeholderEl = De;
      }
      this.instance.setContent(_e, ke);
    } else this.instance.setError(_e, "{{ELEMENT_NOT_FOUND}}");
  }
  setIframeContent(_e) {
    const { src: ke, el: De } = _e;
    if (!ke || typeof ke != "string" || !De) return;
    De.classList.add("is-loading");
    const Re = this.instance, $e = document.createElement("iframe");
    $e.className = "fancybox__iframe", $e.setAttribute("id", `fancybox__iframe_${Re.id}_${_e.index}`);
    for (const [Ne, ze] of Object.entries(this.optionFor(_e, "iframeAttr") || {})) $e.setAttribute(Ne, ze);
    $e.onerror = () => {
      Re.setError(_e, "{{IFRAME_ERROR}}");
    }, _e.iframeEl = $e;
    const Be = this.optionFor(_e, "preload");
    if (_e.type !== "iframe" || Be === !1) return $e.setAttribute("src", _e.src + ""), Re.setContent(_e, $e, !1), this.resizeIframe(_e), void Re.revealContent(_e);
    Re.showLoading(_e), $e.onload = () => {
      if (!$e.src.length) return;
      const Ne = $e.dataset.ready !== "true";
      $e.dataset.ready = "true", this.resizeIframe(_e), Ne ? Re.revealContent(_e) : Re.hideLoading(_e);
    }, $e.setAttribute("src", ke), Re.setContent(_e, $e, !1);
  }
  resizeIframe(_e) {
    const { type: ke, iframeEl: De } = _e;
    if (ke === Pt || ke === Ct) return;
    const Re = De == null ? void 0 : De.parentElement;
    if (!De || !Re) return;
    let $e = _e.autoSize;
    $e === void 0 && ($e = this.optionFor(_e, "autoSize"));
    let Be = _e.width || 0, Ne = _e.height || 0;
    Be && Ne && ($e = !1);
    const ze = Re && Re.style;
    if (_e.preload !== !1 && $e !== !1 && ze) try {
      const Ae = window.getComputedStyle(Re), Ie = parseFloat(Ae.paddingLeft) + parseFloat(Ae.paddingRight), je = parseFloat(Ae.paddingTop) + parseFloat(Ae.paddingBottom), Fe = De.contentWindow;
      if (Fe) {
        const Ve = Fe.document, He = Ve.getElementsByTagName(xt)[0], We = Ve.body;
        ze.width = "", We.style.overflow = "hidden", Be = Be || He.scrollWidth + Ie, ze.width = `${Be}px`, We.style.overflow = "", ze.flex = "0 0 auto", ze.height = `${We.scrollHeight}px`, Ne = He.scrollHeight + je;
      }
    } catch {
    }
    if (Be || Ne) {
      const Ae = { flex: "0 1 auto", width: "", height: "" };
      Be && Be !== "auto" && (Ae.width = `${Be}px`), Ne && Ne !== "auto" && (Ae.height = `${Ne}px`), Object.assign(ze, Ae);
    }
  }
  playVideo() {
    const _e = this.instance.getSlide();
    if (!_e) return;
    const { el: ke } = _e;
    if (!ke || !ke.offsetParent || !this.optionFor(_e, "videoAutoplay")) return;
    if (_e.type === Tt) try {
      const Re = ke.querySelector("video");
      if (Re) {
        const $e = Re.play();
        $e !== void 0 && $e.then(() => {
        }).catch((Be) => {
          Re.muted = !0, Re.play();
        });
      }
    } catch {
    }
    if (_e.type !== Pt && _e.type !== Ct) return;
    const De = () => {
      if (_e.iframeEl && _e.iframeEl.contentWindow) {
        let Re;
        if (_e.iframeEl.dataset.ready === "true") return Re = _e.type === Pt ? { event: "command", func: "playVideo" } : { method: "play", value: "true" }, Re && _e.iframeEl.contentWindow.postMessage(JSON.stringify(Re), "*"), void (_e.poller = void 0);
        _e.type === Pt && (Re = { event: "listening", id: _e.iframeEl.getAttribute("id") }, _e.iframeEl.contentWindow.postMessage(JSON.stringify(Re), "*"));
      }
      _e.poller = setTimeout(De, 250);
    };
    De();
  }
  processType(_e) {
    if (_e.html) return _e.type = xt, _e.src = _e.html, void (_e.html = "");
    const ke = this.instance.optionFor(_e, "src", "");
    if (!ke || typeof ke != "string") return;
    let De = _e.type, Re = null;
    if (Re = ke.match(/(youtube\.com|youtu\.be|youtube\-nocookie\.com)\/(?:watch\?(?:.*&)?v=|v\/|u\/|shorts\/|embed\/?)?(videoseries\?list=(?:.*)|[\w-]{11}|\?listType=(?:.*)&list=(?:.*))(?:.*)/i)) {
      const $e = this.optionFor(_e, Pt), { nocookie: Be } = $e, Ne = function(je, Fe) {
        var Ve = {};
        for (var He in je) Object.prototype.hasOwnProperty.call(je, He) && Fe.indexOf(He) < 0 && (Ve[He] = je[He]);
        if (je != null && typeof Object.getOwnPropertySymbols == "function") {
          var We = 0;
          for (He = Object.getOwnPropertySymbols(je); We < He.length; We++) Fe.indexOf(He[We]) < 0 && Object.prototype.propertyIsEnumerable.call(je, He[We]) && (Ve[He[We]] = je[He[We]]);
        }
        return Ve;
      }($e, ["nocookie"]), ze = `www.youtube${Be ? "-nocookie" : ""}.com`, Ae = Mt(ke, Ne), Ie = encodeURIComponent(Re[2]);
      _e.videoId = Ie, _e.src = `https://${ze}/embed/${Ie}?${Ae}`, _e.thumbSrc = _e.thumbSrc || `https://i.ytimg.com/vi/${Ie}/mqdefault.jpg`, De = Pt;
    } else if (Re = ke.match(/^.+vimeo.com\/(?:\/)?([\d]+)((\/|\?h=)([a-z0-9]+))?(.*)?/)) {
      const $e = Mt(ke, this.optionFor(_e, Ct)), Be = encodeURIComponent(Re[1]), Ne = Re[4] || "";
      _e.videoId = Be, _e.src = `https://player.vimeo.com/video/${Be}?${Ne ? `h=${Ne}${$e ? "&" : ""}` : ""}${$e}`, De = Ct;
    }
    if (!De && _e.triggerEl) {
      const $e = _e.triggerEl.dataset.type;
      At.includes($e) && (De = $e);
    }
    De || typeof ke == "string" && (ke.charAt(0) === "#" ? De = "inline" : (Re = ke.match(/\.(mp4|mov|ogv|webm)((\?|#).*)?$/i)) ? (De = Tt, _e.videoFormat = _e.videoFormat || "video/" + (Re[1] === "ogv" ? "ogg" : Re[1])) : ke.match(/(^data:image\/[a-z0-9+\/=]*,)|(\.(jp(e|g|eg)|gif|png|bmp|webp|svg|ico)((\?|#).*)?$)/i) ? De = Et : ke.match(/\.(pdf)((\?|#).*)?$/i) && (De = "pdf")), (Re = ke.match(/(?:maps\.)?google\.([a-z]{2,3}(?:\.[a-z]{2})?)\/(?:(?:(?:maps\/(?:place\/(?:.*)\/)?\@(.*),(\d+.?\d+?)z))|(?:\?ll=))(.*)?/i)) ? (_e.src = `https://maps.google.${Re[1]}/?ll=${(Re[2] ? Re[2] + "&z=" + Math.floor(parseFloat(Re[3])) + (Re[4] ? Re[4].replace(/^\//, "&") : "") : Re[4] + "").replace(/\?/, "&")}&output=${Re[4] && Re[4].indexOf("layer=c") > 0 ? "svembed" : "embed"}`, De = St) : (Re = ke.match(/(?:maps\.)?google\.([a-z]{2,3}(?:\.[a-z]{2})?)\/(?:maps\/search\/)(.*)/i)) && (_e.src = `https://maps.google.${Re[1]}/maps?q=${Re[2].replace("query=", "q=").replace("api=1", "")}&output=embed`, De = St), De = De || this.instance.option("defaultType"), _e.type = De, De === Et && (_e.thumbSrc = _e.thumbSrc || _e.src);
  }
  setContent(_e) {
    const ke = this.instance.optionFor(_e, "src") || "";
    if (_e && _e.type && ke) {
      switch (_e.type) {
        case xt:
          this.instance.setContent(_e, ke);
          break;
        case Tt:
          const De = this.option("videoTpl");
          De && this.instance.setContent(_e, De.replace(/\{\{src\}\}/gi, ke + "").replace(/\{\{format\}\}/gi, this.optionFor(_e, "videoFormat") || "").replace(/\{\{poster\}\}/gi, _e.poster || _e.thumbSrc || ""));
          break;
        case "inline":
        case "clone":
          this.setInlineContent(_e);
          break;
        case "ajax":
          this.loadAjaxContent(_e);
          break;
        case "pdf":
        case St:
        case Pt:
        case Ct:
          _e.preload = !1;
        case "iframe":
          this.setIframeContent(_e);
      }
      this.setAspectRatio(_e);
    }
  }
  setAspectRatio(_e) {
    const ke = _e.contentEl;
    if (!(_e.el && ke && _e.type && [Pt, Ct, Tt].includes(_e.type))) return;
    let De, Re = _e.width || "auto", $e = _e.height || "auto";
    if (Re === "auto" || $e === "auto") {
      De = this.optionFor(_e, "videoRatio");
      const Ae = (De + "").match(/(\d+)\s*\/\s?(\d+)/);
      De = Ae && Ae.length > 2 ? parseFloat(Ae[1]) / parseFloat(Ae[2]) : parseFloat(De + "");
    } else Re && $e && (De = Re / $e);
    if (!De) return;
    ke.style.aspectRatio = "", ke.style.width = "", ke.style.height = "", ke.offsetHeight;
    const Be = ke.getBoundingClientRect(), Ne = Be.width || 1, ze = Be.height || 1;
    ke.style.aspectRatio = De + "", De < Ne / ze ? ($e = $e === "auto" ? ze : Math.min(ze, $e), ke.style.width = "auto", ke.style.height = `${$e}px`) : (Re = Re === "auto" ? Ne : Math.min(Ne, Re), ke.style.width = `${Re}px`, ke.style.height = "auto");
  }
  attach() {
    const _e = this, ke = _e.instance;
    ke.on("Carousel.beforeInitSlide", _e.onBeforeInitSlide), ke.on("Carousel.createSlide", _e.onCreateSlide), ke.on("Carousel.selectSlide", _e.onSelectSlide), ke.on("Carousel.unselectSlide", _e.onUnselectSlide), ke.on("Carousel.Panzoom.refresh", _e.onRefresh), ke.on("done", _e.onDone), ke.on("clearContent", _e.onClearContent), window.addEventListener("message", _e.onMessage);
  }
  detach() {
    const _e = this, ke = _e.instance;
    ke.off("Carousel.beforeInitSlide", _e.onBeforeInitSlide), ke.off("Carousel.createSlide", _e.onCreateSlide), ke.off("Carousel.selectSlide", _e.onSelectSlide), ke.off("Carousel.unselectSlide", _e.onUnselectSlide), ke.off("Carousel.Panzoom.refresh", _e.onRefresh), ke.off("done", _e.onDone), ke.off("clearContent", _e.onClearContent), window.removeEventListener("message", _e.onMessage);
  }
}
Object.defineProperty(Lt, "defaults", { enumerable: !0, configurable: !0, writable: !0, value: Ot });
const zt = "play", Rt = "pause", kt = "ready";
class It extends _ {
  constructor() {
    super(...arguments), Object.defineProperty(this, "state", { enumerable: !0, configurable: !0, writable: !0, value: kt }), Object.defineProperty(this, "inHover", { enumerable: !0, configurable: !0, writable: !0, value: !1 }), Object.defineProperty(this, "timer", { enumerable: !0, configurable: !0, writable: !0, value: null }), Object.defineProperty(this, "progressBar", { enumerable: !0, configurable: !0, writable: !0, value: null });
  }
  get isActive() {
    return this.state !== kt;
  }
  onReady(_e) {
    this.option("autoStart") && (_e.isInfinite || _e.page < _e.pages.length - 1) && this.start();
  }
  onChange() {
    this.removeProgressBar(), this.pause();
  }
  onSettle() {
    this.resume();
  }
  onVisibilityChange() {
    document.visibilityState === "visible" ? this.resume() : this.pause();
  }
  onMouseEnter() {
    this.inHover = !0, this.pause();
  }
  onMouseLeave() {
    var _e;
    this.inHover = !1, !((_e = this.instance.panzoom) === null || _e === void 0) && _e.isResting && this.resume();
  }
  onTimerEnd() {
    const _e = this.instance;
    this.state === "play" && (_e.isInfinite || _e.page !== _e.pages.length - 1 ? _e.slideNext() : _e.slideTo(0));
  }
  removeProgressBar() {
    this.progressBar && (this.progressBar.remove(), this.progressBar = null);
  }
  createProgressBar() {
    var _e;
    if (!this.option("showProgress")) return null;
    this.removeProgressBar();
    const ke = this.instance, De = ((_e = ke.pages[ke.page]) === null || _e === void 0 ? void 0 : _e.slides) || [];
    let Re = this.option("progressParentEl");
    if (Re || (Re = (De.length === 1 ? De[0].el : null) || ke.viewport), !Re) return null;
    const $e = document.createElement("div");
    return P($e, "f-progress"), Re.prepend($e), this.progressBar = $e, $e.offsetHeight, $e;
  }
  set() {
    const _e = this, ke = _e.instance;
    if (ke.pages.length < 2 || _e.timer) return;
    const De = _e.option("timeout");
    _e.state = zt, P(ke.container, "has-autoplay");
    let Re = _e.createProgressBar();
    Re && (Re.style.transitionDuration = `${De}ms`, Re.style.transform = "scaleX(1)"), _e.timer = setTimeout(() => {
      _e.timer = null, _e.inHover || _e.onTimerEnd();
    }, De), _e.emit("set");
  }
  clear() {
    const _e = this;
    _e.timer && (clearTimeout(_e.timer), _e.timer = null), _e.removeProgressBar();
  }
  start() {
    const _e = this;
    if (_e.set(), _e.state !== kt) {
      if (_e.option("pauseOnHover")) {
        const ke = _e.instance.container;
        ke.addEventListener("mouseenter", _e.onMouseEnter, !1), ke.addEventListener("mouseleave", _e.onMouseLeave, !1);
      }
      document.addEventListener("visibilitychange", _e.onVisibilityChange, !1), _e.emit("start");
    }
  }
  stop() {
    const _e = this, ke = _e.state, De = _e.instance.container;
    _e.clear(), _e.state = kt, De.removeEventListener("mouseenter", _e.onMouseEnter, !1), De.removeEventListener("mouseleave", _e.onMouseLeave, !1), document.removeEventListener("visibilitychange", _e.onVisibilityChange, !1), S(De, "has-autoplay"), ke !== kt && _e.emit("stop");
  }
  pause() {
    const _e = this;
    _e.state === zt && (_e.state = Rt, _e.clear(), _e.emit(Rt));
  }
  resume() {
    const _e = this, ke = _e.instance;
    if (ke.isInfinite || ke.page !== ke.pages.length - 1) if (_e.state !== zt) {
      if (_e.state === Rt && !_e.inHover) {
        const De = new Event("resume", { bubbles: !0, cancelable: !0 });
        _e.emit("resume", De), De.defaultPrevented || _e.set();
      }
    } else _e.set();
    else _e.stop();
  }
  toggle() {
    this.state === zt || this.state === Rt ? this.stop() : this.start();
  }
  attach() {
    const _e = this, ke = _e.instance;
    ke.on("ready", _e.onReady), ke.on("Panzoom.startAnimation", _e.onChange), ke.on("Panzoom.endAnimation", _e.onSettle), ke.on("Panzoom.touchMove", _e.onChange);
  }
  detach() {
    const _e = this, ke = _e.instance;
    ke.off("ready", _e.onReady), ke.off("Panzoom.startAnimation", _e.onChange), ke.off("Panzoom.endAnimation", _e.onSettle), ke.off("Panzoom.touchMove", _e.onChange), _e.stop();
  }
}
Object.defineProperty(It, "defaults", { enumerable: !0, configurable: !0, writable: !0, value: { autoStart: !0, pauseOnHover: !0, progressParentEl: null, showProgress: !0, timeout: 3e3 } });
class Dt extends _ {
  constructor() {
    super(...arguments), Object.defineProperty(this, "ref", { enumerable: !0, configurable: !0, writable: !0, value: null });
  }
  onPrepare(_e) {
    const ke = _e.carousel;
    if (!ke) return;
    const De = _e.container;
    De && (ke.options.Autoplay = u({ autoStart: !1 }, this.option("Autoplay") || {}, { pauseOnHover: !1, timeout: this.option("timeout"), progressParentEl: () => this.option("progressParentEl") || null, on: { start: () => {
      _e.emit("startSlideshow");
    }, set: (Re) => {
      var $e;
      De.classList.add("has-slideshow"), (($e = _e.getSlide()) === null || $e === void 0 ? void 0 : $e.state) !== lt.Ready && Re.pause();
    }, stop: () => {
      De.classList.remove("has-slideshow"), _e.isCompact || _e.endIdle(), _e.emit("endSlideshow");
    }, resume: (Re, $e) => {
      var Be, Ne, ze;
      !$e || !$e.cancelable || ((Be = _e.getSlide()) === null || Be === void 0 ? void 0 : Be.state) === lt.Ready && (!((ze = (Ne = _e.carousel) === null || Ne === void 0 ? void 0 : Ne.panzoom) === null || ze === void 0) && ze.isResting) || $e.preventDefault();
    } } }), ke.attachPlugins({ Autoplay: It }), this.ref = ke.plugins.Autoplay);
  }
  onReady(_e) {
    const ke = _e.carousel, De = this.ref;
    De && ke && this.option("playOnStart") && (ke.isInfinite || ke.page < ke.pages.length - 1) && De.start();
  }
  onDone(_e, ke) {
    const De = this.ref, Re = _e.carousel;
    if (!De || !Re) return;
    const $e = ke.panzoom;
    $e && $e.on("startAnimation", () => {
      _e.isCurrentSlide(ke) && De.stop();
    }), _e.isCurrentSlide(ke) && De.resume();
  }
  onKeydown(_e, ke) {
    var De;
    const Re = this.ref;
    Re && ke === this.option("key") && ((De = document.activeElement) === null || De === void 0 ? void 0 : De.nodeName) !== "BUTTON" && Re.toggle();
  }
  attach() {
    const _e = this, ke = _e.instance;
    ke.on("Carousel.init", _e.onPrepare), ke.on("Carousel.ready", _e.onReady), ke.on("done", _e.onDone), ke.on("keydown", _e.onKeydown);
  }
  detach() {
    const _e = this, ke = _e.instance;
    ke.off("Carousel.init", _e.onPrepare), ke.off("Carousel.ready", _e.onReady), ke.off("done", _e.onDone), ke.off("keydown", _e.onKeydown);
  }
}
Object.defineProperty(Dt, "defaults", { enumerable: !0, configurable: !0, writable: !0, value: { key: " ", playOnStart: !1, progressParentEl: (Le) => {
  var _e;
  return ((_e = Le.instance.container) === null || _e === void 0 ? void 0 : _e.querySelector(".fancybox__toolbar [data-fancybox-toggle-slideshow]")) || Le.instance.container;
}, timeout: 3e3 } });
const Ft = { classes: { container: "f-thumbs f-carousel__thumbs", viewport: "f-thumbs__viewport", track: "f-thumbs__track", slide: "f-thumbs__slide", isResting: "is-resting", isSelected: "is-selected", isLoading: "is-loading", hasThumbs: "has-thumbs" }, minCount: 2, parentEl: null, thumbTpl: '<button class="f-thumbs__slide__button" tabindex="0" type="button" aria-label="{{GOTO}}" data-carousel-index="%i"><img class="f-thumbs__slide__img" data-lazy-src="{{%s}}" alt="" /></button>', type: "modern" };
var jt;
(function(Le) {
  Le[Le.Init = 0] = "Init", Le[Le.Ready = 1] = "Ready", Le[Le.Hidden = 2] = "Hidden";
})(jt || (jt = {}));
const Bt = "isResting", Ht = "thumbWidth", Nt = "thumbHeight", _t = "thumbClipWidth";
let $t = class extends _ {
  constructor() {
    super(...arguments), Object.defineProperty(this, "type", { enumerable: !0, configurable: !0, writable: !0, value: "modern" }), Object.defineProperty(this, "container", { enumerable: !0, configurable: !0, writable: !0, value: null }), Object.defineProperty(this, "track", { enumerable: !0, configurable: !0, writable: !0, value: null }), Object.defineProperty(this, "carousel", { enumerable: !0, configurable: !0, writable: !0, value: null }), Object.defineProperty(this, "thumbWidth", { enumerable: !0, configurable: !0, writable: !0, value: 0 }), Object.defineProperty(this, "thumbClipWidth", { enumerable: !0, configurable: !0, writable: !0, value: 0 }), Object.defineProperty(this, "thumbHeight", { enumerable: !0, configurable: !0, writable: !0, value: 0 }), Object.defineProperty(this, "thumbGap", { enumerable: !0, configurable: !0, writable: !0, value: 0 }), Object.defineProperty(this, "thumbExtraGap", { enumerable: !0, configurable: !0, writable: !0, value: 0 }), Object.defineProperty(this, "state", { enumerable: !0, configurable: !0, writable: !0, value: jt.Init });
  }
  get isModern() {
    return this.type === "modern";
  }
  onInitSlide(Le, _e) {
    const ke = _e.el ? _e.el.dataset : void 0;
    ke && (_e.thumbSrc = ke.thumbSrc || _e.thumbSrc || "", _e[_t] = parseFloat(ke[_t] || "") || _e[_t] || 0, _e[Nt] = parseFloat(ke.thumbHeight || "") || _e[Nt] || 0), this.addSlide(_e);
  }
  onInitSlides() {
    this.build();
  }
  onChange() {
    var Le;
    if (!this.isModern) return;
    const _e = this.container, ke = this.instance, De = ke.panzoom, Re = this.carousel, $e = Re ? Re.panzoom : null, Be = ke.page;
    if (De && Re && $e) {
      if (De.isDragging) {
        S(_e, this.cn(Bt));
        let Ne = ((Le = Re.pages[Be]) === null || Le === void 0 ? void 0 : Le.pos) || 0;
        Ne += ke.getProgress(Be) * (this[_t] + this.thumbGap);
        let ze = $e.getBounds();
        -1 * Ne > ze.x.min && -1 * Ne < ze.x.max && $e.panTo({ x: -1 * Ne, friction: 0.12 });
      } else o(_e, this.cn(Bt), De.isResting);
      this.shiftModern();
    }
  }
  onRefresh() {
    this.updateProps();
    for (const Le of this.instance.slides || []) this.resizeModernSlide(Le);
    this.shiftModern();
  }
  isDisabled() {
    const Le = this.option("minCount") || 0;
    if (Le) {
      const ke = this.instance;
      let De = 0;
      for (const Re of ke.slides || []) Re.thumbSrc && De++;
      if (De < Le) return !0;
    }
    const _e = this.option("type");
    return ["modern", "classic"].indexOf(_e) < 0;
  }
  getThumb(Le) {
    const _e = this.option("thumbTpl") || "";
    return { html: this.instance.localize(_e, [["%i", Le.index], ["%d", Le.index + 1], ["%s", Le.thumbSrc || "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7"]]) };
  }
  addSlide(Le) {
    const _e = this.carousel;
    _e && _e.addSlide(Le.index, this.getThumb(Le));
  }
  getSlides() {
    const Le = [];
    for (const _e of this.instance.slides || []) Le.push(this.getThumb(_e));
    return Le;
  }
  resizeModernSlide(Le) {
    this.isModern && (Le[Ht] = Le[_t] && Le[Nt] ? Math.round(this[Nt] * (Le[_t] / Le[Nt])) : this[Ht]);
  }
  updateProps() {
    const Le = this.container;
    if (!Le) return;
    const _e = (ke) => parseFloat(getComputedStyle(Le).getPropertyValue("--f-thumb-" + ke)) || 0;
    this.thumbGap = _e("gap"), this.thumbExtraGap = _e("extra-gap"), this[Ht] = _e("width") || 40, this[_t] = _e("clip-width") || 40, this[Nt] = _e("height") || 40;
  }
  build() {
    const Le = this;
    if (Le.state !== jt.Init) return;
    if (Le.isDisabled()) return void Le.emit("disabled");
    const _e = Le.instance, ke = _e.container, De = Le.getSlides(), Re = Le.option("type");
    Le.type = Re;
    const $e = Le.option("parentEl"), Be = Le.cn("container"), Ne = Le.cn("track");
    let ze = $e == null ? void 0 : $e.querySelector("." + Be);
    ze || (ze = document.createElement("div"), P(ze, Be), $e ? $e.appendChild(ze) : ke.after(ze)), P(ze, `is-${Re}`), P(ke, Le.cn("hasThumbs")), Le.container = ze, Le.updateProps();
    let Ae = ze.querySelector("." + Ne);
    Ae || (Ae = document.createElement("div"), P(Ae, Le.cn("track")), ze.appendChild(Ae)), Le.track = Ae;
    const Ie = u({}, { track: Ae, infinite: !1, center: !0, fill: Re === "classic", dragFree: !0, slidesPerPage: 1, transition: !1, preload: 0.25, friction: 0.12, Panzoom: { maxVelocity: 0 }, Dots: !1, Navigation: !1, classes: { container: "f-thumbs", viewport: "f-thumbs__viewport", track: "f-thumbs__track", slide: "f-thumbs__slide" } }, Le.option("Carousel") || {}, { Sync: { target: _e }, slides: De }), je = new _e.constructor(ze, Ie);
    je.on("createSlide", (Fe, Ve) => {
      Le.setProps(Ve.index), Le.emit("createSlide", Ve, Ve.el);
    }), je.on("ready", () => {
      Le.shiftModern(), Le.emit("ready");
    }), je.on("refresh", () => {
      Le.shiftModern();
    }), je.on("Panzoom.click", (Fe, Ve, He) => {
      Le.onClick(He);
    }), Le.carousel = je, Le.state = jt.Ready;
  }
  onClick(Le) {
    Le.preventDefault(), Le.stopPropagation();
    const _e = this.instance, { pages: ke, page: De } = _e, Re = (We) => {
      if (We) {
        const Xe = We.closest("[data-carousel-index]");
        if (Xe) return [parseInt(Xe.dataset.carouselIndex || "", 10) || 0, Xe];
      }
      return [-1, void 0];
    }, $e = (We, Xe) => {
      const Ye = document.elementFromPoint(We, Xe);
      return Ye ? Re(Ye) : [-1, void 0];
    };
    let [Be, Ne] = Re(Le.target);
    if (Be > -1) return;
    const ze = this[_t], Ae = Le.clientX, Ie = Le.clientY;
    let [je, Fe] = $e(Ae - ze, Ie), [Ve, He] = $e(Ae + ze, Ie);
    Fe && He ? (Be = Math.abs(Ae - Fe.getBoundingClientRect().right) < Math.abs(Ae - He.getBoundingClientRect().left) ? je : Ve, Be === De && (Be = Be === je ? Ve : je)) : Fe ? Be = je : He && (Be = Ve), Be > -1 && ke[Be] && _e.slideTo(Be);
  }
  getShift(Le) {
    var _e;
    const ke = this, { instance: De } = ke, Re = ke.carousel;
    if (!De || !Re) return 0;
    const $e = ke[Ht], Be = ke[_t], Ne = ke.thumbGap, ze = ke.thumbExtraGap;
    if (!(!((_e = Re.slides[Le]) === null || _e === void 0) && _e.el)) return 0;
    const Ae = 0.5 * ($e - Be), Ie = De.pages.length - 1;
    let je = De.getProgress(0), Fe = De.getProgress(Ie), Ve = De.getProgress(Le, !1, !0), He = 0, We = Ae + ze + Ne;
    const Xe = je < 0 && je > -1, Ye = Fe > 0 && Fe < 1;
    return Le === 0 ? (He = We * Math.abs(je), Ye && je === 1 && (He -= We * Math.abs(Fe))) : Le === Ie ? (He = We * Math.abs(Fe) * -1, Xe && Fe === -1 && (He += We * Math.abs(je))) : Xe || Ye ? (He = -1 * We, He += We * Math.abs(je), He += We * (1 - Math.abs(Fe))) : He = We * Ve, He;
  }
  setProps(Le) {
    var _e;
    const ke = this;
    if (!ke.isModern) return;
    const { instance: De } = ke, Re = ke.carousel;
    if (De && Re) {
      const $e = (_e = Re.slides[Le]) === null || _e === void 0 ? void 0 : _e.el;
      if ($e && $e.childNodes.length) {
        let Be = t(1 - Math.abs(De.getProgress(Le))), Ne = t(ke.getShift(Le));
        $e.style.setProperty("--progress", Be ? Be + "" : ""), $e.style.setProperty("--shift", Ne + "");
      }
    }
  }
  shiftModern() {
    const Le = this;
    if (!Le.isModern) return;
    const { instance: _e, track: ke } = Le, De = _e.panzoom, Re = Le.carousel;
    if (!(_e && ke && De && Re) || De.state === m.Init || De.state === m.Destroy) return;
    for (const Be of _e.slides) Le.setProps(Be.index);
    let $e = (Le[_t] + Le.thumbGap) * (Re.slides.length || 0);
    ke.style.setProperty("--width", $e + "");
  }
  cleanup() {
    const Le = this;
    Le.carousel && Le.carousel.destroy(), Le.carousel = null, Le.container && Le.container.remove(), Le.container = null, Le.track && Le.track.remove(), Le.track = null, Le.state = jt.Init, S(Le.instance.container, Le.cn("hasThumbs"));
  }
  attach() {
    const Le = this, _e = Le.instance;
    _e.on("initSlide", Le.onInitSlide), _e.state === B.Init ? _e.on("initSlides", Le.onInitSlides) : Le.onInitSlides(), _e.on(["change", "Panzoom.afterTransform"], Le.onChange), _e.on("Panzoom.refresh", Le.onRefresh);
  }
  detach() {
    const Le = this, _e = Le.instance;
    _e.off("initSlide", Le.onInitSlide), _e.off("initSlides", Le.onInitSlides), _e.off(["change", "Panzoom.afterTransform"], Le.onChange), _e.off("Panzoom.refresh", Le.onRefresh), Le.cleanup();
  }
};
Object.defineProperty($t, "defaults", { enumerable: !0, configurable: !0, writable: !0, value: Ft });
const Wt = Object.assign(Object.assign({}, Ft), { key: "t", showOnStart: !0, parentEl: null }), Xt = "is-masked", qt = "aria-hidden";
class Yt extends _ {
  constructor() {
    super(...arguments), Object.defineProperty(this, "ref", { enumerable: !0, configurable: !0, writable: !0, value: null }), Object.defineProperty(this, "hidden", { enumerable: !0, configurable: !0, writable: !0, value: !1 });
  }
  get isEnabled() {
    const _e = this.ref;
    return _e && !_e.isDisabled();
  }
  get isHidden() {
    return this.hidden;
  }
  onClick(_e, ke) {
    ke.stopPropagation();
  }
  onCreateSlide(_e, ke) {
    var De, Re, $e;
    const Be = (($e = (Re = (De = this.instance) === null || De === void 0 ? void 0 : De.carousel) === null || Re === void 0 ? void 0 : Re.slides[ke.index]) === null || $e === void 0 ? void 0 : $e.type) || "", Ne = ke.el;
    if (Ne && Be) {
      let ze = `for-${Be}`;
      ["video", "youtube", "vimeo", "html5video"].includes(Be) && (ze += " for-video"), P(Ne, ze);
    }
  }
  onInit() {
    var _e;
    const ke = this, De = ke.instance, Re = De.carousel;
    if (ke.ref || !Re) return;
    const $e = ke.option("parentEl") || De.footer || De.container;
    if (!$e) return;
    const Be = u({}, ke.options, { parentEl: $e, classes: { container: "f-thumbs fancybox__thumbs" }, Carousel: { Sync: { friction: De.option("Carousel.friction") || 0 } }, on: { ready: (Ne) => {
      const ze = Ne.container;
      ze && this.hidden && (ke.refresh(), ze.style.transition = "none", ke.hide(), ze.offsetHeight, queueMicrotask(() => {
        ze.style.transition = "", ke.show();
      }));
    } } });
    Be.Carousel = Be.Carousel || {}, Be.Carousel.on = u(((_e = ke.options.Carousel) === null || _e === void 0 ? void 0 : _e.on) || {}, { click: this.onClick, createSlide: this.onCreateSlide }), Re.options.Thumbs = Be, Re.attachPlugins({ Thumbs: $t }), ke.ref = Re.plugins.Thumbs, ke.option("showOnStart") || (ke.ref.state = jt.Hidden, ke.hidden = !0);
  }
  onResize() {
    var _e;
    const ke = (_e = this.ref) === null || _e === void 0 ? void 0 : _e.container;
    ke && (ke.style.maxHeight = "");
  }
  onKeydown(_e, ke) {
    const De = this.option("key");
    De && De === ke && this.toggle();
  }
  toggle() {
    const _e = this.ref;
    if (_e && !_e.isDisabled()) return _e.state === jt.Hidden ? (_e.state = jt.Init, void _e.build()) : void (this.hidden ? this.show() : this.hide());
  }
  show() {
    const _e = this.ref;
    if (!_e || _e.isDisabled()) return;
    const ke = _e.container;
    ke && (this.refresh(), ke.offsetHeight, ke.removeAttribute(qt), ke.classList.remove(Xt), this.hidden = !1);
  }
  hide() {
    const _e = this.ref, ke = _e && _e.container;
    ke && (this.refresh(), ke.offsetHeight, ke.classList.add(Xt), ke.setAttribute(qt, "true")), this.hidden = !0;
  }
  refresh() {
    const _e = this.ref;
    if (!_e || !_e.state) return;
    const ke = _e.container, De = (ke == null ? void 0 : ke.firstChild) || null;
    ke && De && De.childNodes.length && (ke.style.maxHeight = `${De.getBoundingClientRect().height}px`);
  }
  attach() {
    const _e = this, ke = _e.instance;
    ke.state === rt.Init ? ke.on("Carousel.init", _e.onInit) : _e.onInit(), ke.on("resize", _e.onResize), ke.on("keydown", _e.onKeydown);
  }
  detach() {
    var _e;
    const ke = this, De = ke.instance;
    De.off("Carousel.init", ke.onInit), De.off("resize", ke.onResize), De.off("keydown", ke.onKeydown), (_e = De.carousel) === null || _e === void 0 || _e.detachPlugins(["Thumbs"]), ke.ref = null;
  }
}
Object.defineProperty(Yt, "defaults", { enumerable: !0, configurable: !0, writable: !0, value: Wt });
const Vt = { panLeft: { icon: '<svg><path d="M5 12h14M5 12l6 6M5 12l6-6"/></svg>', change: { panX: -100 } }, panRight: { icon: '<svg><path d="M5 12h14M13 18l6-6M13 6l6 6"/></svg>', change: { panX: 100 } }, panUp: { icon: '<svg><path d="M12 5v14M18 11l-6-6M6 11l6-6"/></svg>', change: { panY: -100 } }, panDown: { icon: '<svg><path d="M12 5v14M18 13l-6 6M6 13l6 6"/></svg>', change: { panY: 100 } }, zoomIn: { icon: '<svg><circle cx="11" cy="11" r="7.5"/><path d="m21 21-4.35-4.35M11 8v6M8 11h6"/></svg>', action: "zoomIn" }, zoomOut: { icon: '<svg><circle cx="11" cy="11" r="7.5"/><path d="m21 21-4.35-4.35M8 11h6"/></svg>', action: "zoomOut" }, toggle1to1: { icon: '<svg><path d="M3.51 3.07c5.74.02 11.48-.02 17.22.02 1.37.1 2.34 1.64 2.18 3.13 0 4.08.02 8.16 0 12.23-.1 1.54-1.47 2.64-2.79 2.46-5.61-.01-11.24.02-16.86-.01-1.36-.12-2.33-1.65-2.17-3.14 0-4.07-.02-8.16 0-12.23.1-1.36 1.22-2.48 2.42-2.46Z"/><path d="M5.65 8.54h1.49v6.92m8.94-6.92h1.49v6.92M11.5 9.4v.02m0 5.18v0"/></svg>', action: "toggleZoom" }, toggleZoom: { icon: '<svg><g><line x1="11" y1="8" x2="11" y2="14"></line></g><circle cx="11" cy="11" r="7.5"/><path d="m21 21-4.35-4.35M8 11h6"/></svg>', action: "toggleZoom" }, iterateZoom: { icon: '<svg><g><line x1="11" y1="8" x2="11" y2="14"></line></g><circle cx="11" cy="11" r="7.5"/><path d="m21 21-4.35-4.35M8 11h6"/></svg>', action: "iterateZoom" }, rotateCCW: { icon: '<svg><path d="M15 4.55a8 8 0 0 0-6 14.9M9 15v5H4M18.37 7.16v.01M13 19.94v.01M16.84 18.37v.01M19.37 15.1v.01M19.94 11v.01"/></svg>', action: "rotateCCW" }, rotateCW: { icon: '<svg><path d="M9 4.55a8 8 0 0 1 6 14.9M15 15v5h5M5.63 7.16v.01M4.06 11v.01M4.63 15.1v.01M7.16 18.37v.01M11 19.94v.01"/></svg>', action: "rotateCW" }, flipX: { icon: '<svg style="stroke-width: 1.3"><path d="M12 3v18M16 7v10h5L16 7M8 7v10H3L8 7"/></svg>', action: "flipX" }, flipY: { icon: '<svg style="stroke-width: 1.3"><path d="M3 12h18M7 16h10L7 21v-5M7 8h10L7 3v5"/></svg>', action: "flipY" }, fitX: { icon: '<svg><path d="M4 12V6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v6M10 18H3M21 18h-7M6 15l-3 3 3 3M18 15l3 3-3 3"/></svg>', action: "fitX" }, fitY: { icon: '<svg><path d="M12 20H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h6M18 14v7M18 3v7M15 18l3 3 3-3M15 6l3-3 3 3"/></svg>', action: "fitY" }, reset: { icon: '<svg><path d="M20 11A8.1 8.1 0 0 0 4.5 9M4 5v4h4M4 13a8.1 8.1 0 0 0 15.5 2m.5 4v-4h-4"/></svg>', action: "reset" }, toggleFS: { icon: '<svg><g><path d="M14.5 9.5 21 3m0 0h-6m6 0v6M3 21l6.5-6.5M3 21v-6m0 6h6"/></g><g><path d="m14 10 7-7m-7 7h6m-6 0V4M3 21l7-7m0 0v6m0-6H4"/></g></svg>', action: "toggleFS" } };
var Zt;
(function(Le) {
  Le[Le.Init = 0] = "Init", Le[Le.Ready = 1] = "Ready", Le[Le.Disabled = 2] = "Disabled";
})(Zt || (Zt = {}));
const Ut = { absolute: "auto", display: { left: ["infobar"], middle: [], right: ["iterateZoom", "slideshow", "fullscreen", "thumbs", "close"] }, enabled: "auto", items: { infobar: { tpl: '<div class="fancybox__infobar" tabindex="-1"><span data-fancybox-current-index></span>/<span data-fancybox-count></span></div>' }, download: { tpl: '<a class="f-button" title="{{DOWNLOAD}}" data-fancybox-download href="javasript:;"><svg><path d="M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2M7 11l5 5 5-5M12 4v12"/></svg></a>' }, prev: { tpl: '<button class="f-button" title="{{PREV}}" data-fancybox-prev><svg><path d="m15 6-6 6 6 6"/></svg></button>' }, next: { tpl: '<button class="f-button" title="{{NEXT}}" data-fancybox-next><svg><path d="m9 6 6 6-6 6"/></svg></button>' }, slideshow: { tpl: '<button class="f-button" title="{{TOGGLE_SLIDESHOW}}" data-fancybox-toggle-slideshow><svg><g><path d="M8 4v16l13 -8z"></path></g><g><path d="M8 4v15M17 4v15"/></g></svg></button>' }, fullscreen: { tpl: '<button class="f-button" title="{{TOGGLE_FULLSCREEN}}" data-fancybox-toggle-fullscreen><svg><g><path d="M4 8V6a2 2 0 0 1 2-2h2M4 16v2a2 2 0 0 0 2 2h2M16 4h2a2 2 0 0 1 2 2v2M16 20h2a2 2 0 0 0 2-2v-2"/></g><g><path d="M15 19v-2a2 2 0 0 1 2-2h2M15 5v2a2 2 0 0 0 2 2h2M5 15h2a2 2 0 0 1 2 2v2M5 9h2a2 2 0 0 0 2-2V5"/></g></svg></button>' }, thumbs: { tpl: '<button class="f-button" title="{{TOGGLE_THUMBS}}" data-fancybox-toggle-thumbs><svg><circle cx="5.5" cy="5.5" r="1"/><circle cx="12" cy="5.5" r="1"/><circle cx="18.5" cy="5.5" r="1"/><circle cx="5.5" cy="12" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="18.5" cy="12" r="1"/><circle cx="5.5" cy="18.5" r="1"/><circle cx="12" cy="18.5" r="1"/><circle cx="18.5" cy="18.5" r="1"/></svg></button>' }, close: { tpl: '<button class="f-button" title="{{CLOSE}}" data-fancybox-close><svg><path d="m19.5 4.5-15 15M4.5 4.5l15 15"/></svg></button>' } }, parentEl: null }, Gt = { tabindex: "-1", width: "24", height: "24", viewBox: "0 0 24 24", xmlns: "http://www.w3.org/2000/svg" }, Kt = "has-toolbar", Jt = "fancybox__toolbar";
class Qt extends _ {
  constructor() {
    super(...arguments), Object.defineProperty(this, "state", { enumerable: !0, configurable: !0, writable: !0, value: Zt.Init }), Object.defineProperty(this, "container", { enumerable: !0, configurable: !0, writable: !0, value: null });
  }
  onReady(_e) {
    var ke;
    if (!_e.carousel) return;
    let De = this.option("display"), Re = this.option("absolute"), $e = this.option("enabled");
    if ($e === "auto") {
      const Ae = this.instance.carousel;
      let Ie = 0;
      if (Ae) for (const je of Ae.slides) (je.panzoom || je.type === "image") && Ie++;
      Ie || ($e = !1);
    }
    $e || (De = void 0);
    let Be = 0;
    const Ne = { left: [], middle: [], right: [] };
    if (De) for (const Ae of ["left", "middle", "right"]) for (const Ie of De[Ae]) {
      const je = this.createEl(Ie);
      je && ((ke = Ne[Ae]) === null || ke === void 0 || ke.push(je), Be++);
    }
    let ze = null;
    if (Be && (ze = this.createContainer()), ze) {
      for (const [Ae, Ie] of Object.entries(Ne)) {
        const je = document.createElement("div");
        P(je, Jt + "__column is-" + Ae);
        for (const Fe of Ie) je.appendChild(Fe);
        Re !== "auto" || Ae !== "middle" || Ie.length || (Re = !0), ze.appendChild(je);
      }
      Re === !0 && P(ze, "is-absolute"), this.state = Zt.Ready, this.onRefresh();
    } else this.state = Zt.Disabled;
  }
  onClick(_e) {
    var ke, De;
    const Re = this.instance, $e = Re.getSlide(), Be = $e == null ? void 0 : $e.panzoom, Ne = _e.target, ze = Ne && E(Ne) ? Ne.dataset : null;
    if (!ze) return;
    if (ze.fancyboxToggleThumbs !== void 0) return _e.preventDefault(), _e.stopPropagation(), void ((ke = Re.plugins.Thumbs) === null || ke === void 0 || ke.toggle());
    if (ze.fancyboxToggleFullscreen !== void 0) return _e.preventDefault(), _e.stopPropagation(), void this.instance.toggleFullscreen();
    if (ze.fancyboxToggleSlideshow !== void 0) {
      _e.preventDefault(), _e.stopPropagation();
      const je = (De = Re.carousel) === null || De === void 0 ? void 0 : De.plugins.Autoplay;
      let Fe = je.isActive;
      return Be && Be.panMode === "mousemove" && !Fe && Be.reset(), void (Fe ? je.stop() : je.start());
    }
    const Ae = ze.panzoomAction, Ie = ze.panzoomChange;
    if ((Ie || Ae) && (_e.preventDefault(), _e.stopPropagation()), Ie) {
      let je = {};
      try {
        je = JSON.parse(Ie);
      } catch {
      }
      Be && Be.applyChange(je);
    } else Ae && Be && Be[Ae] && Be[Ae]();
  }
  onChange() {
    this.onRefresh();
  }
  onRefresh() {
    if (this.instance.isClosing()) return;
    const _e = this.container;
    if (!_e) return;
    const ke = this.instance.getSlide();
    if (!ke || ke.state !== lt.Ready) return;
    const De = ke && !ke.error && ke.panzoom;
    for (const Be of _e.querySelectorAll("[data-panzoom-action]")) De ? (Be.removeAttribute("disabled"), Be.removeAttribute("tabindex")) : (Be.setAttribute("disabled", ""), Be.setAttribute("tabindex", "-1"));
    let Re = De && De.canZoomIn(), $e = De && De.canZoomOut();
    for (const Be of _e.querySelectorAll('[data-panzoom-action="zoomIn"]')) Re ? (Be.removeAttribute("disabled"), Be.removeAttribute("tabindex")) : (Be.setAttribute("disabled", ""), Be.setAttribute("tabindex", "-1"));
    for (const Be of _e.querySelectorAll('[data-panzoom-action="zoomOut"]')) $e ? (Be.removeAttribute("disabled"), Be.removeAttribute("tabindex")) : (Be.setAttribute("disabled", ""), Be.setAttribute("tabindex", "-1"));
    for (const Be of _e.querySelectorAll('[data-panzoom-action="toggleZoom"],[data-panzoom-action="iterateZoom"]')) {
      $e || Re ? (Be.removeAttribute("disabled"), Be.removeAttribute("tabindex")) : (Be.setAttribute("disabled", ""), Be.setAttribute("tabindex", "-1"));
      const Ne = Be.querySelector("g");
      Ne && (Ne.style.display = Re ? "" : "none");
    }
  }
  onDone(_e, ke) {
    var De;
    (De = ke.panzoom) === null || De === void 0 || De.on("afterTransform", () => {
      this.instance.isCurrentSlide(ke) && this.onRefresh();
    }), this.instance.isCurrentSlide(ke) && this.onRefresh();
  }
  createContainer() {
    const _e = this.instance.container;
    if (!_e) return null;
    const ke = this.option("parentEl") || _e;
    let De = ke.querySelector("." + Jt);
    return De || (De = document.createElement("div"), P(De, Jt), ke.prepend(De)), De.addEventListener("click", this.onClick, { passive: !1, capture: !0 }), _e && P(_e, Kt), this.container = De, De;
  }
  createEl(_e) {
    const ke = this.instance, De = ke.carousel;
    if (!De || _e === "toggleFS" || _e === "fullscreen" && !ot()) return null;
    let Re = null;
    const $e = De.slides.length || 0;
    let Be = 0, Ne = 0;
    for (const Ae of De.slides) (Ae.panzoom || Ae.type === "image") && Be++, (Ae.type === "image" || Ae.downloadSrc) && Ne++;
    if ($e < 2 && ["infobar", "prev", "next"].includes(_e)) return Re;
    if (Vt[_e] !== void 0 && !Be || _e === "download" && !Ne) return null;
    if (_e === "thumbs") {
      const Ae = ke.plugins.Thumbs;
      if (!Ae || !Ae.isEnabled) return null;
    }
    if (_e === "slideshow" && (!De.plugins.Autoplay || $e < 2))
      return null;
    if (Vt[_e] !== void 0) {
      const Ae = Vt[_e];
      Re = document.createElement("button"), Re.setAttribute("title", this.instance.localize(`{{${_e.toUpperCase()}}}`)), P(Re, "f-button"), Ae.action && (Re.dataset.panzoomAction = Ae.action), Ae.change && (Re.dataset.panzoomChange = JSON.stringify(Ae.change)), Re.appendChild(n(this.instance.localize(Ae.icon)));
    } else {
      const Ae = (this.option("items") || [])[_e];
      Ae && (Re = n(this.instance.localize(Ae.tpl)), typeof Ae.click == "function" && Re.addEventListener("click", (Ie) => {
        Ie.preventDefault(), Ie.stopPropagation(), typeof Ae.click == "function" && Ae.click.call(this, this, Ie);
      }));
    }
    const ze = Re == null ? void 0 : Re.querySelector("svg");
    if (ze) for (const [Ae, Ie] of Object.entries(Gt)) ze.getAttribute(Ae) || ze.setAttribute(Ae, String(Ie));
    return Re;
  }
  removeContainer() {
    const _e = this.container;
    _e && _e.remove(), this.container = null, this.state = Zt.Disabled;
    const ke = this.instance.container;
    ke && S(ke, Kt);
  }
  attach() {
    const _e = this, ke = _e.instance;
    ke.on("Carousel.initSlides", _e.onReady), ke.on("done", _e.onDone), ke.on(["reveal", "Carousel.change"], _e.onChange), _e.onReady(_e.instance);
  }
  detach() {
    const _e = this, ke = _e.instance;
    ke.off("Carousel.initSlides", _e.onReady), ke.off("done", _e.onDone), ke.off(["reveal", "Carousel.change"], _e.onChange), _e.removeContainer();
  }
}
Object.defineProperty(Qt, "defaults", { enumerable: !0, configurable: !0, writable: !0, value: Ut });
const te = { Hash: class extends _ {
  onReady() {
    ht = !1;
  }
  onChange(Le) {
    ut && clearTimeout(ut);
    const { hash: _e } = pt(), { hash: ke } = ft(), De = Le.isOpeningSlide(Le.getSlide());
    De && (ct = ke === _e ? "" : ke), _e && _e !== ke && (ut = setTimeout(() => {
      try {
        if (Le.state === rt.Ready) {
          let Re = "replaceState";
          De && !dt && (Re = "pushState", dt = !0), window.history[Re]({}, document.title, window.location.pathname + window.location.search + _e);
        }
      } catch {
      }
    }, 300));
  }
  onClose(Le) {
    if (ut && clearTimeout(ut), !ht && dt) return dt = !1, ht = !1, void window.history.back();
    if (!ht) try {
      window.history.replaceState({}, document.title, window.location.pathname + window.location.search + (ct || ""));
    } catch {
    }
  }
  attach() {
    const Le = this.instance;
    Le.on("ready", this.onReady), Le.on(["Carousel.ready", "Carousel.change"], this.onChange), Le.on("close", this.onClose);
  }
  detach() {
    const Le = this.instance;
    Le.off("ready", this.onReady), Le.off(["Carousel.ready", "Carousel.change"], this.onChange), Le.off("close", this.onClose);
  }
  static parseURL() {
    return ft();
  }
  static startFromUrl() {
    gt();
  }
  static destroy() {
    window.removeEventListener("hashchange", vt, !1);
  }
}, Html: Lt, Images: wt, Slideshow: Dt, Thumbs: Yt, Toolbar: Qt }, ee = "with-fancybox", ie = "hide-scrollbar", ne = "--fancybox-scrollbar-compensate", se = "--fancybox-body-margin", oe = "aria-hidden", ae = "is-using-tab", re = "is-animated", le = "is-compact", ce = "is-loading", he = "is-opening", de = "has-caption", ue = "disabled", pe = "tabindex", fe = "download", ge = "href", me = "src", ve = (Le) => typeof Le == "string", be = function() {
  var Le = window.getSelection();
  return !!Le && Le.type === "Range";
};
let ye, we = null, xe = null, Ee = 0, Se = 0, Pe = 0, Ce = 0;
const Te = /* @__PURE__ */ new Map();
let Me = 0;
class Oe extends g {
  get isIdle() {
    return this.idle;
  }
  get isCompact() {
    return this.option("compact");
  }
  constructor(_e = [], ke = {}, De = {}) {
    super(ke), Object.defineProperty(this, "userSlides", { enumerable: !0, configurable: !0, writable: !0, value: [] }), Object.defineProperty(this, "userPlugins", { enumerable: !0, configurable: !0, writable: !0, value: {} }), Object.defineProperty(this, "idle", { enumerable: !0, configurable: !0, writable: !0, value: !1 }), Object.defineProperty(this, "idleTimer", { enumerable: !0, configurable: !0, writable: !0, value: null }), Object.defineProperty(this, "clickTimer", { enumerable: !0, configurable: !0, writable: !0, value: null }), Object.defineProperty(this, "pwt", { enumerable: !0, configurable: !0, writable: !0, value: 0 }), Object.defineProperty(this, "ignoreFocusChange", { enumerable: !0, configurable: !0, writable: !0, value: !1 }), Object.defineProperty(this, "startedFs", { enumerable: !0, configurable: !0, writable: !0, value: !1 }), Object.defineProperty(this, "state", { enumerable: !0, configurable: !0, writable: !0, value: rt.Init }), Object.defineProperty(this, "id", { enumerable: !0, configurable: !0, writable: !0, value: 0 }), Object.defineProperty(this, "container", { enumerable: !0, configurable: !0, writable: !0, value: null }), Object.defineProperty(this, "caption", { enumerable: !0, configurable: !0, writable: !0, value: null }), Object.defineProperty(this, "footer", { enumerable: !0, configurable: !0, writable: !0, value: null }), Object.defineProperty(this, "carousel", { enumerable: !0, configurable: !0, writable: !0, value: null }), Object.defineProperty(this, "lastFocus", { enumerable: !0, configurable: !0, writable: !0, value: null }), Object.defineProperty(this, "prevMouseMoveEvent", { enumerable: !0, configurable: !0, writable: !0, value: void 0 }), ye || (ye = ot()), this.id = ke.id || ++Me, Te.set(this.id, this), this.userSlides = _e, this.userPlugins = De, queueMicrotask(() => {
      this.init();
    });
  }
  init() {
    if (this.state === rt.Destroy) return;
    this.state = rt.Init, this.attachPlugins(Object.assign(Object.assign({}, Oe.Plugins), this.userPlugins)), this.emit("init"), this.emit("attachPlugins"), this.option("hideScrollbar") === !0 && (() => {
      if (!et) return;
      const ke = document, De = ke.body, Re = ke.documentElement;
      if (De.classList.contains(ie)) return;
      let $e = window.innerWidth - Re.getBoundingClientRect().width;
      const Be = parseFloat(window.getComputedStyle(De).marginRight);
      $e < 0 && ($e = 0), Re.style.setProperty(ne, `${$e}px`), Be && De.style.setProperty(se, `${Be}px`), De.classList.add(ie);
    })(), this.initLayout(), this.scale();
    const _e = () => {
      this.initCarousel(this.userSlides), this.state = rt.Ready, this.attachEvents(), this.emit("ready"), setTimeout(() => {
        this.container && this.container.setAttribute(oe, "false");
      }, 16);
    };
    this.option("Fullscreen.autoStart") && ye && !ye.isFullscreen() ? ye.request().then(() => {
      this.startedFs = !0, _e();
    }).catch(() => _e()) : _e();
  }
  initLayout() {
    var _e, ke;
    const De = this.option("parentEl") || document.body, Re = n(this.localize(this.option("tpl.main") || ""));
    if (Re) {
      if (Re.setAttribute("id", `fancybox-${this.id}`), Re.setAttribute("aria-label", this.localize("{{MODAL}}")), Re.classList.toggle(le, this.isCompact), P(Re, this.option("mainClass") || ""), P(Re, he), this.container = Re, this.footer = Re.querySelector(".fancybox__footer"), De.appendChild(Re), P(document.documentElement, ee), we && xe || (we = document.createElement("span"), P(we, "fancybox-focus-guard"), we.setAttribute(pe, "0"), we.setAttribute(oe, "true"), we.setAttribute("aria-label", "Focus guard"), xe = we.cloneNode(), (_e = Re.parentElement) === null || _e === void 0 || _e.insertBefore(we, Re), (ke = Re.parentElement) === null || ke === void 0 || ke.append(xe)), Re.addEventListener("mousedown", ($e) => {
        Ee = $e.pageX, Se = $e.pageY, S(Re, ae);
      }), this.option("closeExisting")) for (const $e of Te.values()) $e.id !== this.id && $e.close();
      else this.option("animated") && (P(Re, re), setTimeout(() => {
        this.isClosing() || S(Re, re);
      }, 350));
      this.emit("initLayout");
    }
  }
  initCarousel(_e) {
    const ke = this.container;
    if (!ke) return;
    const De = ke.querySelector(".fancybox__carousel");
    if (!De) return;
    const Re = this.carousel = new Q(De, u({}, { slides: _e, transition: "fade", Panzoom: { lockAxis: this.option("dragToClose") ? "xy" : "x", infinite: !!this.option("dragToClose") && "y" }, Dots: !1, Navigation: { classes: { container: "fancybox__nav", button: "f-button", isNext: "is-next", isPrev: "is-prev" } }, initialPage: this.option("startIndex"), l10n: this.option("l10n") }, this.option("Carousel") || {}));
    Re.on("*", ($e, Be, ...Ne) => {
      this.emit(`Carousel.${Be}`, $e, ...Ne);
    }), Re.on(["ready", "change"], () => {
      this.manageCaption();
    }), this.on("Carousel.removeSlide", ($e, Be, Ne) => {
      this.clearContent(Ne), Ne.state = void 0;
    }), Re.on("Panzoom.touchStart", () => {
      var $e, Be;
      this.isCompact || this.endIdle(), !(($e = document.activeElement) === null || $e === void 0) && $e.closest(".f-thumbs") && ((Be = this.container) === null || Be === void 0 || Be.focus());
    }), Re.on("settle", () => {
      this.idleTimer || this.isCompact || !this.option("idle") || this.setIdle(), this.option("autoFocus") && !this.isClosing && this.checkFocus();
    }), this.option("dragToClose") && (Re.on("Panzoom.afterTransform", ($e, Be) => {
      const Ne = this.getSlide();
      if (Ne && e(Ne.el)) return;
      const ze = this.container;
      if (ze) {
        const Ae = Math.abs(Be.current.f), Ie = Ae < 1 ? "" : Math.max(0.5, Math.min(1, 1 - Ae / Be.contentRect.fitHeight * 1.5));
        ze.style.setProperty("--fancybox-ts", Ie ? "0s" : ""), ze.style.setProperty("--fancybox-opacity", Ie + "");
      }
    }), Re.on("Panzoom.touchEnd", ($e, Be, Ne) => {
      var ze;
      const Ae = this.getSlide();
      if (Ae && e(Ae.el) || Be.isMobile && document.activeElement && ["TEXTAREA", "INPUT"].indexOf((ze = document.activeElement) === null || ze === void 0 ? void 0 : ze.nodeName) !== -1) return;
      const Ie = Math.abs(Be.dragOffset.y);
      Be.lockedAxis === "y" && (Ie >= 200 || Ie >= 50 && Be.dragOffset.time < 300) && (Ne && Ne.cancelable && Ne.preventDefault(), this.close(Ne, "f-throwOut" + (Be.current.f < 0 ? "Up" : "Down")));
    })), Re.on("change", ($e) => {
      var Be;
      let Ne = (Be = this.getSlide()) === null || Be === void 0 ? void 0 : Be.triggerEl;
      if (Ne) {
        const ze = new CustomEvent("slideTo", { bubbles: !0, cancelable: !0, detail: $e.page });
        Ne.dispatchEvent(ze);
      }
    }), Re.on(["refresh", "change"], ($e) => {
      const Be = this.container;
      if (!Be) return;
      for (const Ae of Be.querySelectorAll("[data-fancybox-current-index]")) Ae.innerHTML = $e.page + 1;
      for (const Ae of Be.querySelectorAll("[data-fancybox-count]")) Ae.innerHTML = $e.pages.length;
      if (!$e.isInfinite) {
        for (const Ae of Be.querySelectorAll("[data-fancybox-next]")) $e.page < $e.pages.length - 1 ? (Ae.removeAttribute(ue), Ae.removeAttribute(pe)) : (Ae.setAttribute(ue, ""), Ae.setAttribute(pe, "-1"));
        for (const Ae of Be.querySelectorAll("[data-fancybox-prev]")) $e.page > 0 ? (Ae.removeAttribute(ue), Ae.removeAttribute(pe)) : (Ae.setAttribute(ue, ""), Ae.setAttribute(pe, "-1"));
      }
      const Ne = this.getSlide();
      if (!Ne) return;
      let ze = Ne.downloadSrc || "";
      ze || Ne.type !== "image" || Ne.error || !ve(Ne[me]) || (ze = Ne[me]);
      for (const Ae of Be.querySelectorAll("[data-fancybox-download]")) {
        const Ie = Ne.downloadFilename;
        ze ? (Ae.removeAttribute(ue), Ae.removeAttribute(pe), Ae.setAttribute(ge, ze), Ae.setAttribute(fe, Ie || ze), Ae.setAttribute("target", "_blank")) : (Ae.setAttribute(ue, ""), Ae.setAttribute(pe, "-1"), Ae.removeAttribute(ge), Ae.removeAttribute(fe));
      }
    }), this.emit("initCarousel");
  }
  attachEvents() {
    const _e = this, ke = _e.container;
    if (!ke) return;
    ke.addEventListener("click", _e.onClick, { passive: !1, capture: !1 }), ke.addEventListener("wheel", _e.onWheel, { passive: !1, capture: !1 }), document.addEventListener("keydown", _e.onKeydown, { passive: !1, capture: !0 }), document.addEventListener("visibilitychange", _e.onVisibilityChange, !1), document.addEventListener("mousemove", _e.onMousemove), _e.option("trapFocus") && document.addEventListener("focus", _e.onFocus, !0), window.addEventListener("resize", _e.onResize);
    const De = window.visualViewport;
    De && (De.addEventListener("scroll", _e.onResize), De.addEventListener("resize", _e.onResize));
  }
  detachEvents() {
    const _e = this, ke = _e.container;
    if (!ke) return;
    document.removeEventListener("keydown", _e.onKeydown, { passive: !1, capture: !0 }), ke.removeEventListener("wheel", _e.onWheel, { passive: !1, capture: !1 }), ke.removeEventListener("click", _e.onClick, { passive: !1, capture: !1 }), document.removeEventListener("mousemove", _e.onMousemove), window.removeEventListener("resize", _e.onResize);
    const De = window.visualViewport;
    De && (De.removeEventListener("resize", _e.onResize), De.removeEventListener("scroll", _e.onResize)), document.removeEventListener("visibilitychange", _e.onVisibilityChange, !1), document.removeEventListener("focus", _e.onFocus, !0);
  }
  scale() {
    const _e = this.container;
    if (!_e) return;
    const ke = window.visualViewport, De = Math.max(1, (ke == null ? void 0 : ke.scale) || 1);
    let Re = "", $e = "", Be = "";
    if (ke && De > 1) {
      let Ne = `${ke.offsetLeft}px`, ze = `${ke.offsetTop}px`;
      Re = ke.width * De + "px", $e = ke.height * De + "px", Be = `translate3d(${Ne}, ${ze}, 0) scale(${1 / De})`;
    }
    _e.style.transform = Be, _e.style.width = Re, _e.style.height = $e;
  }
  onClick(_e) {
    var ke;
    const { container: De, isCompact: Re } = this;
    if (!De || this.isClosing()) return;
    !Re && this.option("idle") && this.resetIdle();
    const $e = _e.composedPath()[0];
    if ($e.closest(".fancybox-spinner") || $e.closest("[data-fancybox-close]")) return _e.preventDefault(), void this.close(_e);
    if ($e.closest("[data-fancybox-prev]")) return _e.preventDefault(), void this.prev();
    if ($e.closest("[data-fancybox-next]")) return _e.preventDefault(), void this.next();
    if (_e.type === "click" && _e.detail === 0 || Math.abs(_e.pageX - Ee) > 30 || Math.abs(_e.pageY - Se) > 30) return;
    const Be = document.activeElement;
    if (be() && Be && De.contains(Be)) return;
    if (Re && ((ke = this.getSlide()) === null || ke === void 0 ? void 0 : ke.type) === "image") return void (this.clickTimer ? (clearTimeout(this.clickTimer), this.clickTimer = null) : this.clickTimer = setTimeout(() => {
      this.toggleIdle(), this.clickTimer = null;
    }, 350));
    if (this.emit("click", _e), _e.defaultPrevented) return;
    let Ne = !1;
    if ($e.closest(".fancybox__content")) {
      if (Be) {
        if (Be.closest("[contenteditable]")) return;
        $e.matches(nt) || Be.blur();
      }
      if (be()) return;
      Ne = this.option("contentClick");
    } else $e.closest(".fancybox__carousel") && !$e.matches(nt) && (Ne = this.option("backdropClick"));
    Ne === "close" ? (_e.preventDefault(), this.close(_e)) : Ne === "next" ? (_e.preventDefault(), this.next()) : Ne === "prev" && (_e.preventDefault(), this.prev());
  }
  onWheel(_e) {
    const ke = _e.target;
    let De = this.option("wheel", _e);
    ke.closest(".fancybox__thumbs") && (De = "slide");
    const Re = De === "slide", $e = [-_e.deltaX || 0, -_e.deltaY || 0, -_e.detail || 0].reduce(function(ze, Ae) {
      return Math.abs(Ae) > Math.abs(ze) ? Ae : ze;
    }), Be = Math.max(-1, Math.min(1, $e)), Ne = Date.now();
    this.pwt && Ne - this.pwt < 300 ? Re && _e.preventDefault() : (this.pwt = Ne, this.emit("wheel", _e, Be), _e.defaultPrevented || (De === "close" ? (_e.preventDefault(), this.close(_e)) : De === "slide" && (i(ke) || (_e.preventDefault(), this[Be > 0 ? "prev" : "next"]()))));
  }
  onScroll() {
    window.scrollTo(Pe, Ce);
  }
  onKeydown(_e) {
    if (!this.isTopmost()) return;
    this.isCompact || !this.option("idle") || this.isClosing() || this.resetIdle();
    const ke = _e.key, De = this.option("keyboard");
    if (!De) return;
    const Re = _e.composedPath()[0], $e = document.activeElement && document.activeElement.classList, Be = $e && $e.contains("f-button") || Re.dataset.carouselPage || Re.dataset.carouselIndex;
    if (ke !== "Escape" && !Be && E(Re) && (Re.isContentEditable || ["TEXTAREA", "OPTION", "INPUT", "SELECT", "VIDEO"].indexOf(Re.nodeName) !== -1) || (_e.key === "Tab" ? P(this.container, ae) : S(this.container, ae), _e.ctrlKey || _e.altKey || _e.shiftKey)) return;
    this.emit("keydown", ke, _e);
    const Ne = De[ke];
    Ne && typeof this[Ne] == "function" && (_e.preventDefault(), this[Ne]());
  }
  onResize() {
    const _e = this.container;
    if (!_e) return;
    const ke = this.isCompact;
    _e.classList.toggle(le, ke), this.manageCaption(this.getSlide()), this.isCompact ? this.clearIdle() : this.endIdle(), this.scale(), this.emit("resize");
  }
  onFocus(_e) {
    this.isTopmost() && this.checkFocus(_e);
  }
  onMousemove(_e) {
    this.prevMouseMoveEvent = _e, !this.isCompact && this.option("idle") && this.resetIdle();
  }
  onVisibilityChange() {
    document.visibilityState === "visible" ? this.checkFocus() : this.endIdle();
  }
  manageCloseBtn(_e) {
    const ke = this.optionFor(_e, "closeButton") || !1;
    if (ke === "auto") {
      const Re = this.plugins.Toolbar;
      if (Re && Re.state === Zt.Ready) return;
    }
    if (!ke || !_e.contentEl || _e.closeBtnEl) return;
    const De = this.option("tpl.closeButton");
    if (De) {
      const Re = n(this.localize(De));
      _e.closeBtnEl = _e.contentEl.appendChild(Re), _e.el && P(_e.el, "has-close-btn");
    }
  }
  manageCaption(_e = void 0) {
    var ke, De;
    const Re = "fancybox__caption", $e = this.container;
    if (!$e) return;
    S($e, de);
    const Be = this.isCompact || this.option("commonCaption"), Ne = !Be;
    if (this.caption && this.stop(this.caption), Ne && this.caption && (this.caption.remove(), this.caption = null), Be && !this.caption) for (const je of ((ke = this.carousel) === null || ke === void 0 ? void 0 : ke.slides) || []) je.captionEl && (je.captionEl.remove(), je.captionEl = void 0, S(je.el, de), (De = je.el) === null || De === void 0 || De.removeAttribute("aria-labelledby"));
    if (_e || (_e = this.getSlide()), !_e || Be && !this.isCurrentSlide(_e)) return;
    const ze = _e.el;
    let Ae = this.optionFor(_e, "caption", "");
    if (!Ae) return void (Be && this.caption && this.animate(this.caption, "f-fadeOut", () => {
      this.caption && (this.caption.innerHTML = "");
    }));
    let Ie = null;
    if (Ne) {
      if (Ie = _e.captionEl || null, ze && !Ie) {
        const je = Re + `_${this.id}_${_e.index}`;
        Ie = document.createElement("div"), P(Ie, Re), Ie.setAttribute("id", je), _e.captionEl = ze.appendChild(Ie), P(ze, de), ze.setAttribute("aria-labelledby", je);
      }
    } else
      Ie = this.caption, Ie || (Ie = $e.querySelector("." + Re)), !Ie && (Ie = document.createElement("div"), Ie.dataset.fancyboxCaption = "", P(Ie, Re), (this.footer || $e).prepend(Ie)), P($e, de), this.caption = Ie;
    Ie && (Ie.innerHTML = "", ve(Ae) || typeof Ae == "number" ? Ie.innerHTML = Ae + "" : Ae instanceof HTMLElement && Ie.appendChild(Ae));
  }
  checkFocus(_e) {
    this.focus(_e);
  }
  focus(_e) {
    var ke;
    if (this.ignoreFocusChange) return;
    const De = document.activeElement || null, Re = (_e == null ? void 0 : _e.target) || null, $e = this.container, Be = (ke = this.carousel) === null || ke === void 0 ? void 0 : ke.viewport;
    if (!$e || !Be || !_e && De && $e.contains(De)) return;
    const Ne = this.getSlide(), ze = Ne && Ne.state === lt.Ready ? Ne.el : null;
    if (!ze || ze.contains(De) || $e === De) return;
    _e && _e.cancelable && _e.preventDefault(), this.ignoreFocusChange = !0;
    const Ae = Array.from($e.querySelectorAll(nt));
    let Ie = [], je = null;
    for (let Ve of Ae) {
      const He = !Ve.offsetParent || !!Ve.closest('[aria-hidden="true"]'), We = ze && ze.contains(Ve), Xe = !Be.contains(Ve);
      if (Ve === $e || (We || Xe) && !He) {
        Ie.push(Ve);
        const Ye = Ve.dataset.origTabindex;
        Ye !== void 0 && Ye && (Ve.tabIndex = parseFloat(Ye)), Ve.removeAttribute("data-orig-tabindex"), !Ve.hasAttribute("autoFocus") && je || (je = Ve);
      } else {
        const Ye = Ve.dataset.origTabindex === void 0 ? Ve.getAttribute("tabindex") || "" : Ve.dataset.origTabindex;
        Ye && (Ve.dataset.origTabindex = Ye), Ve.tabIndex = -1;
      }
    }
    let Fe = null;
    _e ? (!Re || Ie.indexOf(Re) < 0) && (Fe = je || $e, Ie.length && (De === xe ? Fe = Ie[0] : this.lastFocus !== $e && De !== we || (Fe = Ie[Ie.length - 1]))) : Fe = Ne && Ne.type === "image" ? $e : je || $e, Fe && st(Fe), this.lastFocus = document.activeElement, this.ignoreFocusChange = !1;
  }
  next() {
    const _e = this.carousel;
    _e && _e.pages.length > 1 && _e.slideNext();
  }
  prev() {
    const _e = this.carousel;
    _e && _e.pages.length > 1 && _e.slidePrev();
  }
  jumpTo(..._e) {
    this.carousel && this.carousel.slideTo(..._e);
  }
  isTopmost() {
    var _e;
    return ((_e = Oe.getInstance()) === null || _e === void 0 ? void 0 : _e.id) == this.id;
  }
  animate(_e = null, ke = "", De) {
    if (!_e || !ke) return void (De && De());
    this.stop(_e);
    const Re = ($e) => {
      $e.target === _e && _e.dataset.animationName && (_e.removeEventListener("animationend", Re), delete _e.dataset.animationName, De && De(), S(_e, ke));
    };
    _e.dataset.animationName = ke, _e.addEventListener("animationend", Re), P(_e, ke);
  }
  stop(_e) {
    _e && _e.dispatchEvent(new CustomEvent("animationend", { bubbles: !1, cancelable: !0, currentTarget: _e }));
  }
  setContent(_e, ke = "", De = !0) {
    if (this.isClosing()) return;
    const Re = _e.el;
    if (!Re) return;
    let $e = null;
    if (E(ke) ? $e = ke : ($e = n(ke + ""), E($e) || ($e = document.createElement("div"), $e.innerHTML = ke + "")), ["img", "picture", "iframe", "video", "audio"].includes($e.nodeName.toLowerCase())) {
      const Be = document.createElement("div");
      Be.appendChild($e), $e = Be;
    }
    E($e) && _e.filter && !_e.error && ($e = $e.querySelector(_e.filter)), $e && E($e) ? (P($e, "fancybox__content"), _e.id && $e.setAttribute("id", _e.id), Re.classList.add(`has-${_e.error ? "error" : _e.type || "unknown"}`), Re.prepend($e), $e.style.display === "none" && ($e.style.display = ""), getComputedStyle($e).getPropertyValue("display") === "none" && ($e.style.display = _e.display || this.option("defaultDisplay") || "flex"), _e.contentEl = $e, De && this.revealContent(_e), this.manageCloseBtn(_e), this.manageCaption(_e)) : this.setError(_e, "{{ELEMENT_NOT_FOUND}}");
  }
  revealContent(_e, ke) {
    const De = _e.el, Re = _e.contentEl;
    De && Re && (this.emit("reveal", _e), this.hideLoading(_e), _e.state = lt.Opening, (ke = this.isOpeningSlide(_e) ? ke === void 0 ? this.optionFor(_e, "showClass") : ke : "f-fadeIn") ? this.animate(Re, ke, () => {
      this.done(_e);
    }) : this.done(_e));
  }
  done(_e) {
    this.isClosing() || (_e.state = lt.Ready, this.emit("done", _e), P(_e.el, "is-done"), this.isCurrentSlide(_e) && this.option("autoFocus") && queueMicrotask(() => {
      var ke;
      (ke = _e.panzoom) === null || ke === void 0 || ke.updateControls(), this.option("autoFocus") && this.focus();
    }), this.isOpeningSlide(_e) && (S(this.container, he), !this.isCompact && this.option("idle") && this.setIdle()));
  }
  isCurrentSlide(_e) {
    const ke = this.getSlide();
    return !(!_e || !ke) && ke.index === _e.index;
  }
  isOpeningSlide(_e) {
    var ke, De;
    return ((ke = this.carousel) === null || ke === void 0 ? void 0 : ke.prevPage) === null && _e && _e.index === ((De = this.getSlide()) === null || De === void 0 ? void 0 : De.index);
  }
  showLoading(_e) {
    _e.state = lt.Loading;
    const ke = _e.el;
    ke && (P(ke, ce), this.emit("loading", _e), _e.spinnerEl || setTimeout(() => {
      if (!this.isClosing() && !_e.spinnerEl && _e.state === lt.Loading) {
        let De = n(x);
        P(De, "fancybox-spinner"), _e.spinnerEl = De, ke.prepend(De), this.animate(De, "f-fadeIn");
      }
    }, 250));
  }
  hideLoading(_e) {
    const ke = _e.el;
    if (!ke) return;
    const De = _e.spinnerEl;
    this.isClosing() ? De == null || De.remove() : (S(ke, ce), De && this.animate(De, "f-fadeOut", () => {
      De.remove();
    }), _e.state === lt.Loading && (this.emit("loaded", _e), _e.state = lt.Ready));
  }
  setError(_e, ke) {
    if (this.isClosing()) return;
    const De = new Event("error", { bubbles: !0, cancelable: !0 });
    if (this.emit("error", De, _e), De.defaultPrevented) return;
    _e.error = ke, this.hideLoading(_e), this.clearContent(_e);
    const Re = document.createElement("div");
    Re.classList.add("fancybox-error"), Re.innerHTML = this.localize(ke || "<p>{{ERROR}}</p>"), this.setContent(_e, Re);
  }
  clearContent(_e) {
    if (_e.state === void 0) return;
    this.emit("clearContent", _e), _e.contentEl && (_e.contentEl.remove(), _e.contentEl = void 0);
    const ke = _e.el;
    ke && (S(ke, "has-error"), S(ke, "has-unknown"), S(ke, `has-${_e.type || "unknown"}`)), _e.closeBtnEl && _e.closeBtnEl.remove(), _e.closeBtnEl = void 0, _e.captionEl && _e.captionEl.remove(), _e.captionEl = void 0, _e.spinnerEl && _e.spinnerEl.remove(), _e.spinnerEl = void 0;
  }
  getSlide() {
    var _e;
    const ke = this.carousel;
    return ((_e = ke == null ? void 0 : ke.pages[ke == null ? void 0 : ke.page]) === null || _e === void 0 ? void 0 : _e.slides[0]) || void 0;
  }
  close(_e, ke) {
    if (this.isClosing()) return;
    const De = new Event("shouldClose", { bubbles: !0, cancelable: !0 });
    if (this.emit("shouldClose", De, _e), De.defaultPrevented) return;
    _e && _e.cancelable && (_e.preventDefault(), _e.stopPropagation());
    const Re = () => {
      this.proceedClose(_e, ke);
    };
    this.startedFs && ye && ye.isFullscreen() ? Promise.resolve(ye.exit()).then(() => Re()) : Re();
  }
  clearIdle() {
    this.idleTimer && clearTimeout(this.idleTimer), this.idleTimer = null;
  }
  setIdle(_e = !1) {
    const ke = () => {
      this.clearIdle(), this.idle = !0, P(this.container, "is-idle"), this.emit("setIdle");
    };
    if (this.clearIdle(), !this.isClosing()) if (_e) ke();
    else {
      const De = this.option("idle");
      De && (this.idleTimer = setTimeout(ke, De));
    }
  }
  endIdle() {
    this.clearIdle(), this.idle && !this.isClosing() && (this.idle = !1, S(this.container, "is-idle"), this.emit("endIdle"));
  }
  resetIdle() {
    this.endIdle(), this.setIdle();
  }
  toggleIdle() {
    this.idle ? this.endIdle() : this.setIdle(!0);
  }
  toggleFullscreen() {
    ye && (ye.isFullscreen() ? ye.exit() : ye.request().then(() => {
      this.startedFs = !0;
    }));
  }
  isClosing() {
    return [rt.Closing, rt.CustomClosing, rt.Destroy].includes(this.state);
  }
  proceedClose(_e, ke) {
    var De, Re;
    this.state = rt.Closing, this.clearIdle(), this.detachEvents();
    const $e = this.container, Be = this.carousel, Ne = this.getSlide(), ze = Ne && this.option("placeFocusBack") ? Ne.triggerEl || this.option("triggerEl") : null;
    if (ze && (tt(ze) ? st(ze) : ze.focus()), $e && (S($e, he), P($e, "is-closing"), $e.setAttribute(oe, "true"), this.option("animated") && P($e, re), $e.style.pointerEvents = "none"), Be) {
      Be.clearTransitions(), (De = Be.panzoom) === null || De === void 0 || De.destroy(), (Re = Be.plugins.Navigation) === null || Re === void 0 || Re.detach();
      for (const Ae of Be.slides) {
        Ae.state = lt.Closing, this.hideLoading(Ae);
        const Ie = Ae.contentEl;
        Ie && this.stop(Ie);
        const je = Ae == null ? void 0 : Ae.panzoom;
        je && (je.stop(), je.detachEvents(), je.detachObserver()), this.isCurrentSlide(Ae) || Be.emit("removeSlide", Ae);
      }
    }
    Pe = window.scrollX, Ce = window.scrollY, window.addEventListener("scroll", this.onScroll), this.emit("close", _e), this.state !== rt.CustomClosing ? (ke === void 0 && Ne && (ke = this.optionFor(Ne, "hideClass")), ke && Ne ? (this.animate(Ne.contentEl, ke, () => {
      Be && Be.emit("removeSlide", Ne);
    }), setTimeout(() => {
      this.destroy();
    }, 500)) : this.destroy()) : setTimeout(() => {
      this.destroy();
    }, 500);
  }
  destroy() {
    var _e;
    if (this.state === rt.Destroy) return;
    window.removeEventListener("scroll", this.onScroll), this.state = rt.Destroy, (_e = this.carousel) === null || _e === void 0 || _e.destroy();
    const ke = this.container;
    ke && ke.remove(), Te.delete(this.id);
    const De = Oe.getInstance();
    De ? De.focus() : (we && (we.remove(), we = null), xe && (xe.remove(), xe = null), S(document.documentElement, ee), (() => {
      if (!et) return;
      const Re = document, $e = Re.body;
      $e.classList.remove(ie), $e.style.setProperty(se, ""), Re.documentElement.style.setProperty(ne, "");
    })(), this.emit("destroy"));
  }
  static bind(_e, ke, De) {
    if (!et) return;
    let Re, $e = "", Be = {};
    if (_e === void 0 ? Re = document.body : ve(_e) ? (Re = document.body, $e = _e, typeof ke == "object" && (Be = ke || {})) : (Re = _e, ve(ke) && ($e = ke), typeof De == "object" && (Be = De || {})), !Re || !E(Re)) return;
    $e = $e || "[data-fancybox]";
    const Ne = Oe.openers.get(Re) || /* @__PURE__ */ new Map();
    Ne.set($e, Be), Oe.openers.set(Re, Ne), Ne.size === 1 && Re.addEventListener("click", Oe.fromEvent);
  }
  static unbind(_e, ke) {
    let De, Re = "";
    if (ve(_e) ? (De = document.body, Re = _e) : (De = _e, ve(ke) && (Re = ke)), !De) return;
    const $e = Oe.openers.get(De);
    $e && Re && $e.delete(Re), Re && $e || (Oe.openers.delete(De), De.removeEventListener("click", Oe.fromEvent));
  }
  static destroy() {
    let _e;
    for (; _e = Oe.getInstance(); ) _e.destroy();
    for (const ke of Oe.openers.keys()) ke.removeEventListener("click", Oe.fromEvent);
    Oe.openers = /* @__PURE__ */ new Map();
  }
  static fromEvent(_e) {
    if (_e.defaultPrevented || _e.button && _e.button !== 0 || _e.ctrlKey || _e.metaKey || _e.shiftKey) return;
    let ke = _e.composedPath()[0];
    const De = ke.closest("[data-fancybox-trigger]");
    if (De) {
      const He = De.dataset.fancyboxTrigger || "", We = document.querySelectorAll(`[data-fancybox="${He}"]`), Xe = parseInt(De.dataset.fancyboxIndex || "", 10) || 0;
      ke = We[Xe] || ke;
    }
    if (!(ke && ke instanceof Element)) return;
    let Re, $e, Be, Ne;
    if ([...Oe.openers].reverse().find(([He, We]) => !(!He.contains(ke) || ![...We].reverse().find(([Xe, Ye]) => {
      let Ze = ke.closest(Xe);
      return !!Ze && (Re = He, $e = Xe, Be = Ze, Ne = Ye, !0);
    }))), !Re || !$e || !Be) return;
    Ne = Ne || {}, _e.preventDefault(), ke = Be;
    let ze = [], Ae = u({}, at, Ne);
    Ae.event = _e, Ae.triggerEl = ke, Ae.delegate = De;
    const Ie = Ae.groupAll, je = Ae.groupAttr, Fe = je && ke ? ke.getAttribute(`${je}`) : "";
    if ((!ke || Fe || Ie) && (ze = [].slice.call(Re.querySelectorAll($e))), ke && !Ie && (ze = Fe ? ze.filter((He) => He.getAttribute(`${je}`) === Fe) : [ke]), !ze.length) return;
    const Ve = Oe.getInstance();
    return Ve && Ve.options.triggerEl && ze.indexOf(Ve.options.triggerEl) > -1 ? void 0 : (ke && (Ae.startIndex = ze.indexOf(ke)), Oe.fromNodes(ze, Ae));
  }
  static fromSelector(_e, ke, De) {
    let Re = null, $e = "", Be = {};
    if (ve(_e) ? (Re = document.body, $e = _e, typeof ke == "object" && (Be = ke || {})) : _e instanceof HTMLElement && ve(ke) && (Re = _e, $e = ke, typeof De == "object" && (Be = De || {})), !Re || !$e) return !1;
    const Ne = Oe.openers.get(Re);
    return !!Ne && (Be = u({}, Ne.get($e) || {}, Be), !!Be && Oe.fromNodes(Array.from(Re.querySelectorAll($e)), Be));
  }
  static fromNodes(_e, ke) {
    ke = u({}, at, ke || {});
    const De = [];
    for (const Re of _e) {
      const $e = Re.dataset || {}, Be = $e[me] || Re.getAttribute(ge) || Re.getAttribute("currentSrc") || Re.getAttribute(me) || void 0;
      let Ne;
      const ze = ke.delegate;
      let Ae;
      ze && De.length === ke.startIndex && (Ne = ze instanceof HTMLImageElement ? ze : ze.querySelector("img:not([aria-hidden])")), Ne || (Ne = Re instanceof HTMLImageElement ? Re : Re.querySelector("img:not([aria-hidden])")), Ne && (Ae = Ne.currentSrc || Ne[me] || void 0, !Ae && Ne.dataset && (Ae = Ne.dataset.lazySrc || Ne.dataset[me] || void 0));
      const Ie = { src: Be, triggerEl: Re, thumbEl: Ne, thumbElSrc: Ae, thumbSrc: Ae };
      for (const je in $e) {
        let Fe = $e[je] + "";
        Fe = Fe !== "false" && (Fe === "true" || Fe), Ie[je] = Fe;
      }
      De.push(Ie);
    }
    return new Oe(De, ke);
  }
  static getInstance(_e) {
    return _e ? Te.get(_e) : Array.from(Te.values()).reverse().find((ke) => !ke.isClosing() && ke) || null;
  }
  static getSlide() {
    var _e;
    return ((_e = Oe.getInstance()) === null || _e === void 0 ? void 0 : _e.getSlide()) || null;
  }
  static show(_e = [], ke = {}) {
    return new Oe(_e, ke);
  }
  static next() {
    const _e = Oe.getInstance();
    _e && _e.next();
  }
  static prev() {
    const _e = Oe.getInstance();
    _e && _e.prev();
  }
  static close(_e = !0, ...ke) {
    if (_e) for (const De of Te.values()) De.close(...ke);
    else {
      const De = Oe.getInstance();
      De && De.close(...ke);
    }
  }
}
Object.defineProperty(Oe, "version", { enumerable: !0, configurable: !0, writable: !0, value: "5.0.36" }), Object.defineProperty(Oe, "defaults", { enumerable: !0, configurable: !0, writable: !0, value: at }), Object.defineProperty(Oe, "Plugins", { enumerable: !0, configurable: !0, writable: !0, value: te }), Object.defineProperty(Oe, "openers", { enumerable: !0, configurable: !0, writable: !0, value: /* @__PURE__ */ new Map() });
const _sfc_main$b = {
  props: {
    options: Object
  },
  mounted() {
    Oe.bind(this.$refs.container, "[data-fancybox]", {
      ...this.options || {}
    });
  },
  updated() {
    Oe.unbind(this.$refs.container), Oe.close(), Oe.bind(this.$refs.container, "[data-fancybox]", {
      ...this.options || {}
    });
  },
  unmounted() {
    Oe.destroy();
  }
}, _hoisted_1$7 = { ref: "container" };
function _sfc_render$1(Le, _e, ke, De, Re, $e) {
  return openBlock(), createElementBlock("div", _hoisted_1$7, [
    renderSlot(Le.$slots, "default")
  ], 512);
}
const FancyBoxComp = /* @__PURE__ */ _export_sfc(_sfc_main$b, [["render", _sfc_render$1]]), _sfc_main$a = /* @__PURE__ */ defineComponent({
  __name: "Button",
  props: {
    title: {},
    active: { type: Boolean }
  },
  setup(Le) {
    return (_e, ke) => (openBlock(), createElementBlock("div", {
      class: normalizeClass(["ire-group", {
        "flat-preview-button--active !ire-bg-primary !ire-text-white": _e.active
      }])
    }, [
      renderSlot(_e.$slots, "icon"),
      createElementVNode("div", {
        class: normalizeClass(["group-hover:!ire-text-white", {
          "!ire-text-white": _e.active,
          "!ire-text-black": !_e.active
        }])
      }, toDisplayString(_e.title), 3)
    ], 2));
  }
}), _hoisted_1$6 = { class: "ire-flex ire-h-fit ire-w-fit ire-flex-col ire-items-center" }, _hoisted_2$4 = { class: "flat-preview-value ire-min-w-max ire-text-center !ire-text-2xl ire-capitalize" }, _hoisted_3$4 = { class: "flat-preview-text ire-border-b ire-border-solid ire-border-b-gray-200 ire-py-2 ire-text-sm ire-capitalize ire-text-gray-600" }, _sfc_main$9 = /* @__PURE__ */ defineComponent({
  __name: "FlatPreviewKeyValue",
  props: {
    keyName: {},
    value: {}
  },
  setup(Le) {
    return (_e, ke) => (openBlock(), createElementBlock("div", _hoisted_1$6, [
      renderSlot(_e.$slots, "top"),
      createElementVNode("div", _hoisted_2$4, [
        createTextVNode(toDisplayString(_e.value) + " ", 1),
        renderSlot(_e.$slots, "sufix")
      ]),
      createElementVNode("div", _hoisted_3$4, toDisplayString(_e.keyName), 1)
    ]));
  }
}), _hoisted_1$5 = { class: "irep-flat-preview ire-flex ire-flex-col ire-items-start ire-justify-center lg:ire-flex-row" }, _hoisted_2$3 = { class: "irep-flat-preview__left ire-flex ire-w-full ire-flex-col ire-items-center ire-justify-center ire-bg-gray-50 ire-p-4 lg:ire-w-auto [&_img]:ire-rounded-none" }, _hoisted_3$3 = {
  key: 0,
  class: "irep-flat-preview__left-conf ire-w-full ire-p-3 ire-text-start ire-capitalize"
}, _hoisted_4$2 = ["href"], _hoisted_5 = ["src"], _hoisted_6 = ["href"], _hoisted_7 = ["src"], _hoisted_8 = { class: "ire-mt-5 ire-flex ire-flex-col ire-items-center ire-gap-3 lg:ire-flex-row" }, _hoisted_9 = { class: "ire-flex ire-w-fit ire-items-center ire-gap-1 ire-border-gray-400 ire-p-1" }, _hoisted_10 = {
  key: 0,
  class: "irep-flat-preview__left-pagination ire-ml-4 ire-flex ire-items-center ire-gap-1"
}, _hoisted_11 = ["onClick"], _hoisted_12 = { class: "irep-flat-preview__right ire-flex ire-w-full ire-flex-col ire-items-center ire-gap-6 ire-px-6 ire-py-4 lg:ire-w-[380px]" }, _hoisted_13 = {
  key: 1,
  class: "flat-preview__type ire-text-center"
}, _hoisted_14 = { class: "flat-preview__type-title !ire-text-lg ire-font-medium" }, _hoisted_15 = { class: "flat-preview__type-teaser ire-mt-1 ire-text-gray-600" }, _hoisted_16 = { class: "ire-mt-4 ire-flex ire-w-full ire-flex-wrap ire-items-center ire-justify-center ire-gap-x-16 ire-gap-y-8" }, _hoisted_17 = { class: "flat-preview-price-through-value ire-text-base ire-line-through ire-decoration-black/50" }, _sfc_main$8 = /* @__PURE__ */ defineComponent({
  __name: "FlatPreview",
  props: {
    flat: {},
    floors: {}
  },
  emits: ["changeComponent"],
  setup(Le) {
    const _e = Le, ke = ref(!1), De = ref(0), Re = computed$1(() => {
      var Be, Ne, ze, Ae, Ie, je;
      const $e = ke.value ? (ze = (Ne = (Be = _e.flat) == null ? void 0 : Be.type) == null ? void 0 : Ne.image_2d) == null ? void 0 : ze.length : (je = (Ie = (Ae = _e.flat) == null ? void 0 : Ae.type) == null ? void 0 : Ie.image_3d) == null ? void 0 : je.length;
      return ["I", "II", "III"].slice(0, $e);
    });
    return watch(
      () => ke.value,
      () => {
        De.value = 0;
      }
    ), onMounted(() => {
      var $e, Be;
      Object.keys(((Be = ($e = _e.flat) == null ? void 0 : $e.type) == null ? void 0 : Be.image_3d) || {}).length || (ke.value = !0);
    }), ($e, Be) => {
      var Ne, ze, Ae, Ie, je, Fe, Ve, He, We, Xe, Ye, Ze, Ke, qe, Ue, Qe, Je, Ge, ei, ii, oi, ni, ti, si, ai, ri, li, ui, di, fi;
      return openBlock(), createElementBlock("div", _hoisted_1$5, [
        createElementVNode("div", _hoisted_2$3, [
          (Ne = $e.flat) != null && Ne.conf ? (openBlock(), createElementBlock("div", _hoisted_3$3, toDisplayString(unref(tr)($e.flat.conf)), 1)) : createCommentVNode("", !0),
          createVNode(FancyBoxComp, { options: {} }, {
            default: withCtx(() => [
              createVNode(Transition, {
                name: "ire-fade-in-out",
                mode: "out-in"
              }, {
                default: withCtx(() => {
                  var ci, hi, pi, mi, gi, vi, bi, yi, _i, wi, xi, Si, Ei, ki, Ci, Pi, Ti, Mi, Oi, Di, Ri, $i, Bi, Li, Ni, Ai, zi, Ii, ji, Vi, Fi, Hi;
                  return [
                    ke.value && ((mi = (pi = (hi = (ci = $e.flat) == null ? void 0 : ci.type) == null ? void 0 : hi.image_2d) == null ? void 0 : pi[De.value]) != null && mi.url) ? (openBlock(), createElementBlock("a", {
                      key: 0,
                      "data-fancybox": "",
                      href: (yi = (bi = (vi = (gi = $e.flat) == null ? void 0 : gi.type) == null ? void 0 : vi.image_2d) == null ? void 0 : bi[De.value]) == null ? void 0 : yi.url,
                      class: "irep-flat-preview__left-2d"
                    }, [
                      (openBlock(), createElementBlock("img", {
                        key: (Si = (xi = (wi = (_i = $e.flat) == null ? void 0 : _i.type) == null ? void 0 : wi.image_2d) == null ? void 0 : xi[De.value]) == null ? void 0 : Si.url,
                        src: (Pi = (Ci = (ki = (Ei = $e.flat) == null ? void 0 : Ei.type) == null ? void 0 : ki.image_2d) == null ? void 0 : Ci[De.value]) == null ? void 0 : Pi.url,
                        class: "ire-preview-img"
                      }, null, 8, _hoisted_5))
                    ], 8, _hoisted_4$2)) : (Di = (Oi = (Mi = (Ti = $e.flat) == null ? void 0 : Ti.type) == null ? void 0 : Mi.image_3d) == null ? void 0 : Oi[De.value]) != null && Di.url ? (openBlock(), createElementBlock("a", {
                      key: 1,
                      "data-fancybox": "",
                      href: (Li = (Bi = ($i = (Ri = $e.flat) == null ? void 0 : Ri.type) == null ? void 0 : $i.image_3d) == null ? void 0 : Bi[De.value]) == null ? void 0 : Li.url,
                      class: "irep-flat-preview__left-3d"
                    }, [
                      (openBlock(), createElementBlock("img", {
                        key: (Ii = (zi = (Ai = (Ni = $e.flat) == null ? void 0 : Ni.type) == null ? void 0 : Ai.image_3d) == null ? void 0 : zi[De.value]) == null ? void 0 : Ii.url,
                        src: (Hi = (Fi = (Vi = (ji = $e.flat) == null ? void 0 : ji.type) == null ? void 0 : Vi.image_3d) == null ? void 0 : Fi[De.value]) == null ? void 0 : Hi.url,
                        class: "ire-preview-img"
                      }, null, 8, _hoisted_7))
                    ], 8, _hoisted_6)) : createCommentVNode("", !0)
                  ];
                }),
                _: 1
              })
            ]),
            _: 1
          }),
          createElementVNode("div", _hoisted_8, [
            createElementVNode("div", _hoisted_9, [
              (je = (Ie = (Ae = (ze = $e.flat) == null ? void 0 : ze.type) == null ? void 0 : Ae.image_3d) == null ? void 0 : Ie[0]) != null && je.url ? (openBlock(), createBlock(_sfc_main$a, {
                key: 0,
                title: unref(tr)("3d plan"),
                active: !ke.value,
                class: "flat-preview-button",
                onClick: Be[0] || (Be[0] = (ci) => ke.value = !1)
              }, {
                icon: withCtx(() => [
                  createVNode(FlatIcon, {
                    class: normalizeClass(["[&_path]:ire-stroke-black group-hover:[&_path]:ire-stroke-white", { "[&_path]:!ire-stroke-white": !ke.value }])
                  }, null, 8, ["class"])
                ]),
                _: 1
              }, 8, ["title", "active"])) : createCommentVNode("", !0),
              (We = (He = (Ve = (Fe = $e.flat) == null ? void 0 : Fe.type) == null ? void 0 : Ve.image_2d) == null ? void 0 : He[0]) != null && We.url ? (openBlock(), createBlock(_sfc_main$a, {
                key: 1,
                title: unref(tr)("2d plan"),
                active: ke.value,
                class: "flat-preview-button",
                onClick: Be[1] || (Be[1] = (ci) => ke.value = !0)
              }, {
                icon: withCtx(() => [
                  createVNode(FlatIcon, {
                    class: normalizeClass(["[&_path]:ire-stroke-black group-hover:[&_path]:ire-stroke-white", { "[&_path]:!ire-stroke-white": ke.value }])
                  }, null, 8, ["class"])
                ]),
                _: 1
              }, 8, ["title", "active"])) : createCommentVNode("", !0)
            ]),
            ((Xe = Re.value) == null ? void 0 : Xe.length) > 1 ? (openBlock(), createElementBlock("div", _hoisted_10, [
              (openBlock(!0), createElementBlock(Fragment, null, renderList(Re.value, (ci, hi) => (openBlock(), createElementBlock("div", {
                key: ci,
                class: normalizeClass(["irep-flat-preview__left-pagination-item ire-flex ire-h-10 ire-w-10 ire-cursor-pointer ire-items-center ire-justify-center ire-rounded-lg ire-p-2 ire-transition-all hover:ire-bg-black hover:ire-text-white", {
                  "irep-flat-preview__left-pagination-item--active ire-bg-black ire-text-white": De.value === hi
                }]),
                onClick: (pi) => De.value = hi
              }, toDisplayString(ci), 11, _hoisted_11))), 128))
            ])) : createCommentVNode("", !0)
          ])
        ]),
        createElementVNode("div", _hoisted_12, [
          (Ye = $e.flat) != null && Ye.flat_number ? (openBlock(), createBlock(_sfc_main$9, {
            key: 0,
            keyName: unref(tr)("apartment"),
            value: $e.flat.flat_number,
            class: "[&_.flat-preview-value]:ire-min-w-fit [&_.flat-preview-value]:ire-font-semibold"
          }, null, 8, ["keyName", "value"])) : createCommentVNode("", !0),
          (Ke = (Ze = $e.flat) == null ? void 0 : Ze.type) != null && Ke.title || (Ue = (qe = $e.flat) == null ? void 0 : qe.type) != null && Ue.teaser ? (openBlock(), createElementBlock("div", _hoisted_13, [
            createElementVNode("div", _hoisted_14, toDisplayString((Je = (Qe = $e.flat) == null ? void 0 : Qe.type) == null ? void 0 : Je.title), 1),
            createElementVNode("div", _hoisted_15, toDisplayString((ei = (Ge = $e.flat) == null ? void 0 : Ge.type) == null ? void 0 : ei.teaser), 1)
          ])) : createCommentVNode("", !0),
          createElementVNode("div", _hoisted_16, [
            (ii = $e.flat) != null && ii.floor_number ? (openBlock(), createBlock(_sfc_main$9, {
              key: 0,
              keyName: unref(tr)("floor"),
              value: (oi = $e.flat) == null ? void 0 : oi.floor_number
            }, null, 8, ["keyName", "value"])) : createCommentVNode("", !0),
            (ti = (ni = $e.flat) == null ? void 0 : ni.type) != null && ti.area_m2 ? (openBlock(), createBlock(_sfc_main$9, {
              key: 1,
              keyName: unref(tr)("area"),
              value: unref(getArea)(Number((si = $e.flat) == null ? void 0 : si.type.area_m2))
            }, {
              sufix: withCtx(() => Be[2] || (Be[2] = [
                createElementVNode("span", null, [
                  createTextVNode(" m "),
                  createElementVNode("sup", { class: "ire-inline-block -ire-translate-x-1 !ire-text-sm" }, " 2 ")
                ], -1)
              ])),
              _: 1
            }, 8, ["keyName", "value"])) : createCommentVNode("", !0),
            (ri = (ai = $e.flat) == null ? void 0 : ai.type) != null && ri.rooms_count ? (openBlock(), createBlock(_sfc_main$9, {
              key: 2,
              keyName: unref(tr)("room"),
              value: $e.flat.type.rooms_count
            }, null, 8, ["keyName", "value"])) : createCommentVNode("", !0),
            (li = $e.flat) != null && li.offer_price ? (openBlock(), createBlock(_sfc_main$9, {
              key: 3,
              keyName: unref(tr)("price"),
              value: unref(getPrice)(Number((ui = $e.flat) == null ? void 0 : ui.offer_price))
            }, {
              top: withCtx(() => {
                var ci;
                return [
                  createElementVNode("div", _hoisted_17, [
                    createTextVNode(toDisplayString(unref(getPrice)(Number((ci = $e.flat) == null ? void 0 : ci.price))) + " ", 1),
                    createElementVNode("span", null, toDisplayString(unref(currencySymbol)()), 1)
                  ])
                ];
              }),
              sufix: withCtx(() => [
                createElementVNode("span", null, toDisplayString(unref(currencySymbol)()), 1)
              ]),
              _: 1
            }, 8, ["keyName", "value"])) : (di = $e.flat) != null && di.price ? (openBlock(), createBlock(_sfc_main$9, {
              key: 4,
              keyName: unref(tr)("price"),
              value: unref(getPrice)(Number((fi = $e.flat) == null ? void 0 : fi.price))
            }, {
              sufix: withCtx(() => [
                createElementVNode("span", null, toDisplayString(unref(currencySymbol)()), 1)
              ]),
              _: 1
            }, 8, ["keyName", "value"])) : createCommentVNode("", !0)
          ])
        ])
      ]);
    };
  }
}), _sfc_main$7 = {}, _hoisted_1$4 = {
  xmlns: "http://www.w3.org/2000/svg",
  x: "0px",
  y: "0px",
  width: "20",
  height: "20",
  viewBox: "0 0 50 50"
};
function _sfc_render(Le, _e) {
  return openBlock(), createElementBlock("svg", _hoisted_1$4, _e[0] || (_e[0] = [
    createElementVNode("path", { d: "M 9.15625 6.3125 L 6.3125 9.15625 L 22.15625 25 L 6.21875 40.96875 L 9.03125 43.78125 L 25 27.84375 L 40.9375 43.78125 L 43.78125 40.9375 L 27.84375 25 L 43.6875 9.15625 L 40.84375 6.3125 L 25 22.15625 Z" }, null, -1)
  ]));
}
const Close = /* @__PURE__ */ _export_sfc(_sfc_main$7, [["render", _sfc_render]]), _hoisted_1$3 = { class: "ire-fixed ire-left-0 ire-top-0 ire-z-[99999] ire-flex ire-h-full ire-w-full ire-cursor-pointer ire-items-center ire-justify-center ire-p-4 lg:ire-p-32" }, _hoisted_2$2 = { class: "ire-relative ire-min-w-full ire-max-w-[1920px] ire-cursor-default ire-overflow-hidden ire-rounded-lg ire-bg-white lg:ire-min-w-[500px]" }, _hoisted_3$2 = { class: "ire-absolute ire-right-0 ire-top-0 ire-flex ire-w-full ire-flex-row-reverse" }, _hoisted_4$1 = { class: "ire-h-fit ire-max-h-[95svh] ire-overflow-y-auto" }, _sfc_main$6 = /* @__PURE__ */ defineComponent({
  __name: "PreviewModal",
  emits: ["close"],
  setup(Le) {
    return onMounted(() => {
      const _e = window.innerWidth - document.documentElement.clientWidth;
      document.body.style.overflow = "hidden", document.body.style.paddingRight = `${_e}px`;
    }), onUnmounted(() => {
      setTimeout(() => {
        document.body.style.overflow = "auto", document.body.style.paddingRight = "0";
      }, 500);
    }), (_e, ke) => (openBlock(), createElementBlock("div", _hoisted_1$3, [
      createElementVNode("div", {
        class: "ire-absolute ire-left-0 ire-top-0 ire-h-full ire-w-full ire-bg-black/40 ire-transition-all",
        onClick: ke[0] || (ke[0] = (De) => _e.$emit("close"))
      }),
      createElementVNode("div", _hoisted_2$2, [
        createElementVNode("div", _hoisted_3$2, [
          createElementVNode("div", {
            class: "ire-z-[999] ire-mx-3 ire-my-2 ire-w-fit ire-cursor-pointer ire-rounded-full ire-bg-white ire-p-1 ire-transition-all hover:ire-bg-gray-600 [&_path]:ire-fill-gray-400 [&_path]:hover:ire-fill-white [&_svg]:ire-h-3 [&_svg]:ire-w-3",
            onClick: ke[1] || (ke[1] = (De) => _e.$emit("close"))
          }, [
            createVNode(Close)
          ])
        ]),
        createElementVNode("div", _hoisted_4$1, [
          renderSlot(_e.$slots, "default")
        ])
      ])
    ]));
  }
}), _hoisted_1$2 = ["innerHTML"], _sfc_main$5 = /* @__PURE__ */ defineComponent({
  __name: "BaseEditor",
  props: {
    editor: {}
  },
  setup(Le) {
    return (_e, ke) => (openBlock(), createElementBlock("div", {
      class: "[&_ul]:ire-columns-1 [&_a]:ire-cursor-pointer [&_a]:ire-text-[#2980b9] [&_a]:ire-underline [&_ul]:ire-flex [&_ul]:ire-flex-col [&_ul]:ire-gap-2 [&_ul_li]:ire-relative [&_ul_li]:ire-pl-[20px] [&_ul_li]:after:ire-absolute [&_ul_li]:after:ire-left-2 [&_ul_li]:after:ire-top-[10px] [&_ul_li]:after:ire-h-[4px] [&_ul_li]:after:ire-w-[4px] [&_ul_li]:after:ire-rounded-[50%] [&_ul_li]:after:ire-bg-black",
      innerHTML: _e.editor
    }, null, 8, _hoisted_1$2));
  }
}), _hoisted_1$1 = { class: "ire-p-5" }, _hoisted_2$1 = { class: "ire-mb-3 !ire-text-3xl ire-font-bold" }, _hoisted_3$1 = ["src"], _sfc_main$4 = /* @__PURE__ */ defineComponent({
  __name: "ActionModal",
  props: {
    modalData: {}
  },
  setup(Le) {
    return (_e, ke) => {
      var De, Re, $e, Be, Ne, ze, Ae, Ie, je, Fe, Ve, He;
      return openBlock(), createElementBlock("div", _hoisted_1$1, [
        createElementVNode("p", _hoisted_2$1, toDisplayString((Re = (De = _e.modalData) == null ? void 0 : De.modalObject) == null ? void 0 : Re.title), 1),
        createVNode(_sfc_main$5, {
          editor: (Be = ($e = _e.modalData) == null ? void 0 : $e.modalObject) == null ? void 0 : Be.description
        }, null, 8, ["editor"]),
        (Ie = (Ae = (ze = (Ne = _e.modalData) == null ? void 0 : Ne.modalObject) == null ? void 0 : ze.modalImage) == null ? void 0 : Ae[0]) != null && Ie.url ? (openBlock(), createElementBlock("img", {
          key: 0,
          src: (He = (Ve = (Fe = (je = _e.modalData) == null ? void 0 : je.modalObject) == null ? void 0 : Fe.modalImage) == null ? void 0 : Ve[0]) == null ? void 0 : He.url,
          alt: "",
          class: "ire-mt-5 ire-h-[400px] ire-w-full ire-object-contain"
        }, null, 8, _hoisted_3$1)) : createCommentVNode("", !0)
      ]);
    };
  }
}), _hoisted_1 = { class: "block-title lg:!ire-text-xl" }, _hoisted_2 = { class: "ire-relative ire-h-full ire-select-none ire-overflow-hidden" }, _hoisted_3 = ["src"], _hoisted_4 = ["innerHTML"], _sfc_main$3 = /* @__PURE__ */ defineComponent({
  __name: "BlockPreview",
  props: {
    block: {},
    flats: {},
    floors: {},
    actions: {}
  },
  emits: ["changeComponent"],
  setup(Le, { emit: _e }) {
    const ke = _e, De = Le, Re = inject("showFlatModal"), $e = useGlobalStore(), { openReservedFlat: Be, openSoldFlat: Ne } = storeToRefs($e), ze = ref(), Ae = ref(null), Ie = ref(), je = ref(), Fe = computed$1(() => {
      var We, Xe;
      if ((We = De.block) != null && We.svg)
        return (Xe = De.block) == null ? void 0 : Xe.svg;
    }), Ve = (We) => {
      const Xe = We.target;
      Xe && (Ae.value = Xe);
    }, He = (We) => {
      var Ye, Ze, Ke;
      const Xe = We.target;
      (Xe == null ? void 0 : Xe.nodeName) === "path" && (((Ye = je.value) == null ? void 0 : Ye.conf) === "reserved" && !Be.value || ((Ze = je.value) == null ? void 0 : Ze.conf) === "sold" && !Ne.value || ke(
        "changeComponent",
        ((Ke = Ie.value) == null ? void 0 : Ke.type) || "",
        je.value
      ));
    };
    return watch(
      () => Re == null ? void 0 : Re.value,
      () => {
        Re != null && Re.value || (Ae.value = null, Ie.value = null);
      }
    ), watch(
      () => Ae.value,
      (We) => {
        var Ye, Ze, Ke, qe, Ue, Qe, Je, Ge;
        if (!We) return;
        $e.hoverdSvg = We;
        const Xe = We == null ? void 0 : We.parentElement;
        if (Xe && (Xe == null ? void 0 : Xe.nodeName) === "g") {
          const ei = Xe == null ? void 0 : Xe.getAttribute("id");
          if (!ei || (Ie.value = ((Ze = (Ye = De.block) == null ? void 0 : Ye.polygon_data) == null ? void 0 : Ze.find((ii) => (ii == null ? void 0 : ii.key) === ei)) || null, !Ie.value)) return;
          if (((Ke = Ie.value) == null ? void 0 : Ke.type) === "floor") {
            const ii = (qe = De.floors) == null ? void 0 : qe.find(
              (oi) => {
                var ni;
                return (oi == null ? void 0 : oi.id) === ((ni = Ie.value) == null ? void 0 : ni.id);
              }
            );
            je.value = ii;
          } else if (((Ue = Ie.value) == null ? void 0 : Ue.type) === "flat") {
            const ii = (Qe = De.flats) == null ? void 0 : Qe.find(
              (oi) => {
                var ni;
                return (oi == null ? void 0 : oi.id) === ((ni = Ie.value) == null ? void 0 : ni.id);
              }
            );
            je.value = ii;
          } else if (((Je = Ie.value) == null ? void 0 : Je.type) === "tooltip") {
            const ii = (Ge = De.actions) == null ? void 0 : Ge.find(
              (oi) => {
                var ni;
                return (oi == null ? void 0 : oi.id) === ((ni = Ie.value) == null ? void 0 : ni.id);
              }
            );
            je.value = ii;
          } else
            je.value = null;
        } else
          Ie.value = null, je.value = null;
      }
    ), onMounted(() => {
      document.addEventListener("mousemove", Ve);
    }), onUnmounted(() => {
      document.removeEventListener("mousemove", Ve);
    }), (We, Xe) => {
      var Ye;
      return openBlock(), createBlock(_sfc_main$i, {
        hoverdData: je.value,
        type: (Ye = Ie.value) == null ? void 0 : Ye.type
      }, {
        header: withCtx(() => {
          var Ze;
          return [
            createVNode(_sfc_main$e, {
              onClick: Xe[0] || (Xe[0] = (Ke) => We.$emit("changeComponent", "project", null))
            }),
            createElementVNode("div", _hoisted_1, toDisplayString((Ze = We.block) == null ? void 0 : Ze.title), 1)
          ];
        }),
        default: withCtx(() => {
          var Ze, Ke, qe, Ue, Qe, Je;
          return [
            createElementVNode("div", _hoisted_2, [
              createElementVNode("img", {
                src: ((qe = (Ke = (Ze = We.block) == null ? void 0 : Ze.block_image) == null ? void 0 : Ke[0]) == null ? void 0 : qe.url) || "",
                alt: "",
                class: "ire-left-0 ire-top-0 ire-h-full ire-w-full"
              }, null, 8, _hoisted_3),
              (openBlock(), createElementBlock("div", {
                ref_key: "svgRef",
                ref: ze,
                innerHTML: Fe.value,
                key: Fe.value,
                class: normalizeClass(["canvas ire-absolute ire-left-0 ire-top-0 ire-h-full ire-w-full [&_path]:ire-cursor-pointer [&_path]:ire-fill-[var(--path-color)] [&_path]:ire-transition-all [&_svg]:ire-h-full [&_svg]:ire-w-full", [
                  {
                    "hover:[&_path]:ire-fill-[var(--reserved-color)]": ((Ue = je.value) == null ? void 0 : Ue.conf) === "reserved",
                    "hover:[&_path]:ire-fill-[var(--sold-color)]": ((Qe = je.value) == null ? void 0 : Qe.conf) === "sold",
                    "hover:[&_path]:ire-fill-[var(--path-hover-color)]": !((Je = je.value) != null && Je.conf)
                  }
                ]]),
                onClick: He
              }, null, 10, _hoisted_4))
            ])
          ];
        }),
        _: 1
      }, 8, ["hoverdData", "type"]);
    };
  }
}), _sfc_main$2 = /* @__PURE__ */ defineComponent({
  __name: "MouseTracker",
  setup(Le) {
    const _e = useGlobalStore(), ke = ref(!0), De = ref(-400), Re = ref(-400), $e = ref(null);
    let Be = null, Ne = 0, ze = 0;
    const Ae = (Fe, Ve, He) => Fe * (1 - He) + Ve * He, Ie = () => {
      if (Be) return;
      const Fe = () => {
        De.value = Ae(De.value, Ne, 0.06), Re.value = Ae(Re.value, ze, 0.06), Math.abs(De.value - Ne) > 0.06 || Math.abs(Re.value - ze) > 0.06 ? Be = requestAnimationFrame(Fe) : Be = null;
      };
      Be = requestAnimationFrame(Fe);
    }, je = (Fe) => {
      var Qe;
      const Ve = document.querySelector(".irep-tooltip"), He = ((Qe = _e.hoverdSvg) == null ? void 0 : Qe.nodeName) === "path" ? _e.hoverdSvg : null;
      if (!$e.value || !Ve || !He)
        return;
      const We = $e.value.getBoundingClientRect(), Xe = He.getBoundingClientRect(), Ye = Ve.getBoundingClientRect(), Ze = We.left + We.width / 2, Ke = We.top + We.height / 2, qe = Xe.left > Ze, Ue = Xe.bottom > Ke;
      Ne = Fe.clientX - We.left - (qe ? Ye.width : -20), ze = Fe.clientY - We.top - (Ue ? Ye.height : -20), ke.value && (De.value = Ne, Re.value = ze), Ie(), ke.value = !1;
    };
    return onMounted(() => {
      document.addEventListener("mousemove", je);
    }), onUnmounted(() => {
      document.removeEventListener("mousemove", je), Be && cancelAnimationFrame(Be);
    }), provide("mouseX", De), provide("mouseY", Re), (Fe, Ve) => (openBlock(), createElementBlock("div", {
      ref_key: "canvasRef",
      ref: $e
    }, [
      renderSlot(Fe.$slots, "default")
    ], 512));
  }
}), _sfc_main$1 = /* @__PURE__ */ defineComponent({
  __name: "Preview",
  props: {
    shortcodeDataProps: {}
  },
  setup(__props) {
    var Le, _e, ke, De, Re, $e, Be;
    const props = __props, globalStore = useGlobalStore(), { getMetaValue } = globalStore, constants = ref({
      PREVIEW_PATH_COLOR: getMetaValue("path_color") || "rgba(255, 255, 255, 0.3)",
      PREVIEW_PATH_HOVER_COLOR: getMetaValue("path_hover_color") || "rgba(250, 250, 250, 0.54)",
      PREVIEW_RESERVED_COLOR: getMetaValue("reserved_color") || "rgba(255, 247, 89, 0.53)",
      PREVIEW_SOLD_COLOR: getMetaValue("sold_color") || "rgba(219, 64, 64, 0.45)",
      PREVIEW_STROKE_COLOR: getMetaValue("stroke_color") || "rgba(0, 0, 0,  1)",
      PREVIEW_STROKE_WIDTH: +getMetaValue("stroke_width") || 1,
      PREVIEW_BORDER_RADIUS: +getMetaValue("border_radius") || 0
    }), colors = reactive({
      path: (Le = constants.value) == null ? void 0 : Le.PREVIEW_PATH_COLOR,
      path_hover: (_e = constants.value) == null ? void 0 : _e.PREVIEW_PATH_HOVER_COLOR,
      reserved: (ke = constants.value) == null ? void 0 : ke.PREVIEW_RESERVED_COLOR,
      sold: (De = constants.value) == null ? void 0 : De.PREVIEW_SOLD_COLOR,
      stroke_color: (Re = constants.value) == null ? void 0 : Re.PREVIEW_STROKE_COLOR,
      stroke_width: ($e = constants.value) == null ? void 0 : $e.PREVIEW_STROKE_WIDTH,
      border_radius: (Be = constants.value) == null ? void 0 : Be.PREVIEW_BORDER_RADIUS
    }), cssVariables = computed$1(() => ({
      "--reserved-color": colors.reserved,
      "--sold-color": colors.sold,
      "--path-hover-color": colors.path_hover,
      "--path-color": colors.path,
      "--stroke-color": colors.stroke_color,
      "--stroke-width": colors.stroke_width + "px",
      "--border-radius": colors.border_radius + "px"
    })), shortcodeData = ref(props.shortcodeDataProps), flow = ref(
      "projectFlow"
    ), hoveredData = ref(), showModal = ref(!1), activeBlock = ref(), activeFloor = ref(), showFlatModal = ref(), project = computed$1(() => {
      var Ne;
      if (shortcodeData.value)
        return (Ne = shortcodeData.value) == null ? void 0 : Ne.project;
    }), floors = computed$1(() => {
      var Ne, ze;
      if (shortcodeData.value)
        return (Ne = shortcodeData.value.floors) == null || Ne.forEach((Ae) => {
          var Fe, Ve;
          const Ie = (Ve = (Fe = shortcodeData.value) == null ? void 0 : Fe.flats) == null ? void 0 : Ve.filter((He) => {
            var We;
            return (He == null ? void 0 : He.floor_number) !== ((We = Ae == null ? void 0 : Ae.floor_number) == null ? void 0 : We.toString()) ? !1 : Ae != null && Ae.polygon_data ? Object == null ? void 0 : Object.values(Ae == null ? void 0 : Ae.polygon_data).some(
              (Ye) => {
                var Ze;
                return Ye != null && Ye.type && (Ye == null ? void 0 : Ye.type) === "flat" && (Ye == null ? void 0 : Ye.id) === (He == null ? void 0 : He.id) ? Ae != null && Ae.block_id ? (He == null ? void 0 : He.block_id) === ((Ze = Ae == null ? void 0 : Ae.block_id) == null ? void 0 : Ze.toString()) : !(He != null && He.block_id) : !1;
              }
            ) : !1;
          });
          Ae.flats = Ie;
          const { conf: je } = Ae || {};
          if (Ie != null && Ie.length && !je) {
            const He = Ie == null ? void 0 : Ie.every((Xe) => (Xe == null ? void 0 : Xe.conf) === "reserved"), We = Ie == null ? void 0 : Ie.every((Xe) => (Xe == null ? void 0 : Xe.conf) === "sold");
            He ? Ae.conf = "reserved" : We && (Ae.conf = "sold");
          }
        }), (ze = shortcodeData.value) == null ? void 0 : ze.floors;
    }), blocks = computed$1(() => {
      if (shortcodeData.value)
        return shortcodeData.value.blocks;
    }), types = computed$1(() => {
      if (shortcodeData.value)
        return shortcodeData.value.types;
    }), flats = computed$1(() => {
      var Ne, ze;
      if (shortcodeData.value)
        return (ze = (Ne = shortcodeData.value) == null ? void 0 : Ne.flats) == null ? void 0 : ze.map((Ae) => {
          var Ie;
          if (Ae != null && Ae.use_type || !(Ae != null && Ae.type)) {
            const je = (Ie = types.value) == null ? void 0 : Ie.find((Fe) => (Fe == null ? void 0 : Fe.id) === (Ae == null ? void 0 : Ae.type_id));
            je && (Ae.type = je);
          }
          return Ae;
        });
    }), actions = computed$1(() => {
      var Ne;
      if (shortcodeData.value)
        return (Ne = shortcodeData.value) == null ? void 0 : Ne.actions;
    }), projectMeta = computed$1(() => {
      var Ne;
      if (shortcodeData.value)
        return (Ne = shortcodeData.value) == null ? void 0 : Ne.meta;
    }), changeRoute = (flowType, polygonItem) => {
      switch (flowType) {
        case "project":
          flow.value = "projectFlow";
          break;
        case "floor":
          flow.value = "floorFlow", hoveredData.value = polygonItem, activeFloor.value = polygonItem;
          break;
        case "block":
          flow.value = "blockFlow", hoveredData.value = polygonItem, activeBlock.value = polygonItem;
          break;
        case "flat":
          showFlatModal.value = !0, hoveredData.value = polygonItem;
          break;
        case "tooltip":
          const actionData = polygonItem == null ? void 0 : polygonItem.data;
          if (hoveredData.value = actionData, (actionData == null ? void 0 : actionData.actionType) === "url")
            window.open(
              actionData == null ? void 0 : actionData.url,
              actionData != null && actionData.targetBlank ? "_blank" : "_self"
            );
          else if ((actionData == null ? void 0 : actionData.actionType) === "modal")
            showModal.value = !0;
          else if ((actionData == null ? void 0 : actionData.actionType) === "script")
            try {
              eval(actionData == null ? void 0 : actionData.script);
            } catch (Ne) {
              console.error("Error executing script:", Ne);
            }
          break;
      }
    };
    return watch(
      () => projectMeta.value,
      () => {
        const Ne = getMetaValue("path_color"), ze = getMetaValue("path_hover_color"), Ae = getMetaValue("reserved_color"), Ie = getMetaValue("sold_color"), je = getMetaValue("stroke_color"), Fe = getMetaValue("stroke_width");
        Ne && (colors.path = Ne.toString()), ze && (colors.path_hover = ze.toString()), Ae && (colors.reserved = Ae.toString()), Ie && (colors.sold = Ie.toString()), je && (colors.stroke_color = je.toString()), Fe && (colors.stroke_width = Number(Fe));
      }
    ), provide("showFlatModal", showFlatModal), (Ne, ze) => (openBlock(), createBlock(_sfc_main$2, { class: "interactive-real-estate ire-text-[16px]" }, {
      default: withCtx(() => [
        createVNode(Transition, {
          name: "ire-fade-in-out",
          mode: "out-in"
        }, {
          default: withCtx(() => [
            shortcodeData.value ? (openBlock(), createElementBlock("div", {
              key: flow.value,
              style: normalizeStyle(cssVariables.value)
            }, [
              flow.value === "projectFlow" ? (openBlock(), createBlock(_sfc_main$h, {
                key: 0,
                project: project.value,
                floors: floors.value,
                flats: flats.value,
                projectMeta: projectMeta.value,
                blocks: blocks.value,
                actions: actions.value,
                onChangeComponent: ze[0] || (ze[0] = (Ae, Ie) => changeRoute(Ae, Ie))
              }, null, 8, ["project", "floors", "flats", "projectMeta", "blocks", "actions"])) : flow.value === "blockFlow" && flats.value && floors.value && blocks.value && activeBlock.value ? (openBlock(), createBlock(_sfc_main$3, {
                key: 1,
                block: activeBlock.value,
                flats: flats.value,
                floors: floors.value,
                actions: actions.value,
                onChangeComponent: ze[1] || (ze[1] = (Ae, Ie) => changeRoute(Ae, Ie))
              }, null, 8, ["block", "flats", "floors", "actions"])) : flow.value === "floorFlow" && floors.value && activeFloor.value ? (openBlock(), createBlock(_sfc_main$d, {
                key: 2,
                flats: flats.value,
                floor: activeFloor.value,
                floors: floors.value,
                blocks: blocks.value,
                actions: actions.value,
                onChangeComponent: ze[2] || (ze[2] = (Ae, Ie) => changeRoute(Ae, Ie))
              }, null, 8, ["flats", "floor", "floors", "blocks", "actions"])) : createCommentVNode("", !0)
            ], 4)) : createCommentVNode("", !0)
          ]),
          _: 1
        }),
        (openBlock(), createBlock(Teleport, { to: "body" }, [
          createVNode(Transition, {
            name: "ire-fade-in-out",
            appear: ""
          }, {
            default: withCtx(() => [
              showFlatModal.value ? (openBlock(), createBlock(_sfc_main$6, {
                key: 0,
                onClose: ze[4] || (ze[4] = (Ae) => showFlatModal.value = !1)
              }, {
                default: withCtx(() => [
                  createVNode(_sfc_main$8, {
                    flat: hoveredData.value,
                    floors: floors.value,
                    onChangeComponent: ze[3] || (ze[3] = (Ae, Ie) => changeRoute(Ae, Ie))
                  }, null, 8, ["flat", "floors"])
                ]),
                _: 1
              })) : createCommentVNode("", !0)
            ]),
            _: 1
          })
        ])),
        (openBlock(), createBlock(Teleport, { to: "body" }, [
          createVNode(Transition, {
            name: "ire-fade-in-out",
            appear: ""
          }, {
            default: withCtx(() => [
              showModal.value ? (openBlock(), createBlock(_sfc_main$6, {
                key: 0,
                onClose: ze[5] || (ze[5] = (Ae) => showModal.value = !1)
              }, {
                default: withCtx(() => [
                  createVNode(_sfc_main$4, { modalData: hoveredData.value }, null, 8, ["modalData"])
                ]),
                _: 1
              })) : createCommentVNode("", !0)
            ]),
            _: 1
          })
        ]))
      ]),
      _: 1
    }));
  }
}), _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "Project",
  props: {
    data: {},
    translations: {}
  },
  setup(Le) {
    const _e = Le, ke = useGlobalStore();
    return ke.setData(_e.data), ke.translations = _e.translations, (De, Re) => (openBlock(), createElementBlock("div", null, [
      createVNode(_sfc_main$1, { "shortcode-data-props": De.data }, null, 8, ["shortcode-data-props"])
    ]));
  }
}), IrePreview = {
  install(Le) {
    const _e = createPinia();
    Le.use(_e), Le.component("Project", _sfc_main);
  }
};
export {
  _sfc_main as Project,
  IrePreview as default
};

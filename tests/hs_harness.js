/* Arnés mínimo de DOM para ejecutar el script de la app en JavaScriptCore
   y comprobar de verdad la vista nueva (pestaña Rutina). */
var LS = {};
var localStorage = {
  getItem: function (k) { return Object.prototype.hasOwnProperty.call(LS, k) ? LS[k] : null; },
  setItem: function (k, v) { LS[k] = String(v); },
  removeItem: function (k) { delete LS[k]; }
};

function CL() {
  var s = {};
  return {
    add: function (c) { s[c] = 1; }, remove: function (c) { delete s[c]; },
    toggle: function (c, f) { if (f === undefined) f = !s[c]; if (f) s[c] = 1; else delete s[c]; },
    contains: function (c) { return !!s[c]; }
  };
}
function EL(id) {
  return {
    id: id, innerHTML: "", textContent: "", value: "", className: "", offsetWidth: 1, children: [],
    style: { cssText: "", setProperty: function () {} }, dataset: {}, classList: CL(),
    appendChild: function () {}, removeChild: function () {}, setAttribute: function () {},
    getAttribute: function () { return null; }, addEventListener: function () {},
    querySelector: function () { return null; }, querySelectorAll: function () { return []; },
    closest: function () { return null; }, scrollIntoView: function () {},
    getBoundingClientRect: function () { return { bottom: 0, top: 0 }; },
    getContext: function () { return null; }, toDataURL: function () { return ""; }
  };
}
var ELS = {};
var document = {
  documentElement: EL("html"), body: EL("body"), head: EL("head"),
  getElementById: function (id) { return ELS[id] || (ELS[id] = EL(id)); },
  createElement: function () { return EL("new"); },
  querySelector: function () { return null; },
  addEventListener: function (t, f) { (document._h = document._h || {})[t] = f; }
};
var navigator = { language: "es", vibrate: null, serviceWorker: null };
var screen = { width: 390, height: 844 };
var location = { protocol: "file:" };
var window = {
  supabase: null, matchMedia: function () { return { matches: false }; },
  visualViewport: null, innerWidth: 390, innerHeight: 844,
  scrollTo: function () {}, addEventListener: function () {}, navigator: navigator
};
function getComputedStyle() { return { paddingBottom: "0px" }; }
var _timers = 0;
function setInterval() { return ++_timers; }
function clearInterval() {}
function setTimeout(f) { return ++_timers; }
function requestAnimationFrame(f) { return 0; }
var Notification = undefined;

/* El harness es SOLO los stubs del DOM. Antes cargaba él mismo /tmp/hs_check.js
   —una copia congelada del script de la app— y /tmp/hs_tests.js, así que en
   cada ejecución corría una versión vieja además de la que se le pasaba, y sus
   fallos quedaban tapados por el `tail -1` del lanzador. El script de la app y
   la suite los pasa quien lanza:  jsc hs_harness.js hs_app.js hs_suite.js  */

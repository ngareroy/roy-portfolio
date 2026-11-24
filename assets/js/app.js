/*!
 * Roy Nyamiaka · portfolio app
 * Plain JavaScript, no build step. Content comes from data/content.js.
 */
(function () {
  'use strict';

  var RN = window.RN;
  var C = null;
  var $app, $hdr, $ftr, $mnav, $live;
  var PREVIEW = /[?&]preview=1\b/.test(location.search);
  var assets = {};
  var CONTACT = '#/quote?type=job';
  /* The employer (CV) site is the same app with RN_SITE.variant = 'employer', set by the build in its index.html:
     no rates, prices or quote basket, and "Contact me" in place of "Get a quote". It reads its content (and
     uploaded files) from the freelance site at RN_SITE.contentUrl, so editor changes show on both sites. */
  var SITE = window.RN_SITE || {};
  // The editor's preview can show the CV site too (index.html?preview=1&variant=employer).
  var EMPLOYER = SITE.variant === 'employer' || (PREVIEW && /[?&]variant=employer\b/.test(location.search));
  var remoteBase = '';   // set when the content came from SITE.contentUrl

  /* ---------- storage (never throws) ---------- */
  function mkStore(kind) {
    return {
      get: function (k, d) {
        try { var v = window[kind].getItem('rn:' + k); return v == null ? d : JSON.parse(v); } catch (e) { return d; }
      },
      set: function (k, v) {
        try { window[kind].setItem('rn:' + k, JSON.stringify(v)); } catch (e) { /* storage unavailable */ }
      }
    };
  }
  var store = mkStore('localStorage');
  var sstore = mkStore('sessionStorage');

  var state = {
    currency: store.get('currency', 'KES'),
    basket: store.get('basket', []),
    skill: null,
    pStatus: 'all',
    pCat: 'all',
    cvView: 'full',
    cvSkill: '',
    rq: '',
    enquiry: sstore.get('enquiry', 'quote'),
    form: sstore.get('form', {}),
    tried: false,
    sending: false,
    sent: null,
    sendError: null,
    shareKey: 'profile',
    lastKey: null
  };

  /* ---------- icons (24px, stroke) ---------- */
  var I = {
    arrowRight: '<path d="M5 12h14M13 6l6 6-6 6"/>',
    arrowLeft: '<path d="M19 12H5M11 18l-6-6 6-6"/>',
    arrowUpRight: '<path d="M7 17 17 7M8 7h9v9"/>',
    check: '<path d="M5 12.5 9.5 17 19 7"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    x: '<path d="M6 6l12 12M18 6 6 18"/>',
    menu: '<path d="M4 7h16M4 12h16M4 17h16"/>',
    sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2.5v2M12 19.5v2M4.6 4.6l1.4 1.4M18 18l1.4 1.4M2.5 12h2M19.5 12h2M4.6 19.4 6 18M18 6l1.4-1.4"/>',
    moon: '<path d="M20 14.5A8 8 0 0 1 9.5 4a7.5 7.5 0 1 0 10.5 10.5Z"/>',
    share: '<path d="M12 15V3M8 7l4-4 4 4"/><path d="M5 12v7a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-7"/>',
    copy: '<rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15V6a2 2 0 0 1 2-2h9"/>',
    download: '<path d="M12 4v11M7 10l5 5 5-5M5 20h14"/>',
    printer: '<path d="M7 9V3h10v6M7 17H5a2 2 0 0 1-2-2v-4a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2h-2"/><path d="M7 14h10v7H7z"/>',
    mail: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3.5 7 8.5 6 8.5-6"/>',
    phone: '<path d="M5 3.5h3.5l2 5L8 10a11.5 11.5 0 0 0 6 6l1.5-2.5 5 2V19a2 2 0 0 1-2 2A16.5 16.5 0 0 1 3 5.5a2 2 0 0 1 2-2Z"/>',
    chat: '<path d="M20.5 11.6a8.4 8.4 0 0 1-12.4 7.4L3.5 20.5 5 16a8.4 8.4 0 1 1 15.5-4.4Z"/><path d="M8.5 11.5h.01M12 11.5h.01M15.5 11.5h.01"/>',
    pin: '<path d="M12 21s-7-6.1-7-11.4A7 7 0 0 1 19 9.6C19 14.9 12 21 12 21Z"/><circle cx="12" cy="9.6" r="2.5"/>',
    globe: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"/>',
    link: '<path d="M10 14a4.5 4.5 0 0 0 6.4 0l3-3a4.5 4.5 0 0 0-6.4-6.4l-1 1"/><path d="M14 10a4.5 4.5 0 0 0-6.4 0l-3 3a4.5 4.5 0 0 0 6.4 6.4l1-1"/>',
    external: '<path d="M14 4h6v6M10 14 20 4"/><path d="M19 13.5V19a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1h5.5"/>',
    search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    tag: '<path d="M3 12V4h8l10 10-8 8L3 12Z"/><circle cx="7.5" cy="8.5" r="1.3"/>',
    briefcase: '<rect x="3" y="7" width="18" height="13" rx="2"/><path d="M8 7V5.5A1.5 1.5 0 0 1 9.5 4h5A1.5 1.5 0 0 1 16 5.5V7M3 12.5h18"/>',
    folder: '<path d="M3 7a2 2 0 0 1 2-2h4l2 2.5h8a2 2 0 0 1 2 2V18a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7Z"/>',
    layers: '<path d="m12 3 9 5-9 5-9-5 9-5Z"/><path d="m3 13 9 5 9-5"/>',
    alert: '<circle cx="12" cy="12" r="9"/><path d="M12 7.5v5.5M12 16.5h.01"/>',
    qr: '<path d="M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h2v2h-2zM18 14h2v2M14 18h2v2M18 18h2v2"/>',
    send: '<path d="M21 3 10 14M21 3l-7 18-4-7-7-4 18-7Z"/>',
    user: '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
    database: '<ellipse cx="12" cy="5.5" rx="7.5" ry="2.8"/><path d="M4.5 5.5v6.5c0 1.5 3.4 2.8 7.5 2.8s7.5-1.3 7.5-2.8V5.5"/><path d="M4.5 12v6.5c0 1.5 3.4 2.8 7.5 2.8s7.5-1.3 7.5-2.8V12"/>',
    server: '<rect x="3.5" y="4" width="17" height="7" rx="2"/><rect x="3.5" y="13" width="17" height="7" rx="2"/><path d="M7.5 7.5h.01M7.5 16.5h.01M11 7.5h5M11 16.5h5"/>',
    chart: '<path d="M4 20V10M10 20V4M16 20v-7M21 20H3"/>',
    shield: '<path d="M12 3 4.5 6v5.5c0 4.6 3.2 8.4 7.5 9.5 4.3-1.1 7.5-4.9 7.5-9.5V6L12 3Z"/><path d="m9 12 2.2 2.2L15.5 10"/>',
    code: '<rect x="3" y="4" width="18" height="16" rx="2"/><path d="m9.5 10-2.5 2.5 2.5 2.5M14.5 10l2.5 2.5-2.5 2.5"/>',
    graduation: '<path d="m2.5 9 9.5-4.5L21.5 9 12 13.5 2.5 9Z"/><path d="M6.5 11v4.5c1.8 1.6 3.6 2.4 5.5 2.4s3.7-.8 5.5-2.4V11M21.5 9v5"/>',
    bus: '<rect x="4" y="3.5" width="16" height="14" rx="3"/><path d="M4 10.5h16M8 21v-3.5M16 21v-3.5M8 14h.01M16 14h.01"/>',
    cloud: '<path d="M7 18.5h10a4 4 0 0 0 .6-7.96A5.5 5.5 0 0 0 7.1 9.1 4.75 4.75 0 0 0 7 18.5Z"/>'
  };
  function catIcon(cat, extra) {
    var c = (String(cat || '') + ' ' + String(extra || '')).toLowerCase();
    if (/transport|bus/.test(c)) return 'bus';
    if (/workspace|cloud|email/.test(c)) return 'cloud';
    if (/website|web site|seo/.test(c)) return 'code';
    if (/school|mis|record/.test(c)) return 'database';
    if (/infra|network|support|hardware/.test(c)) return 'server';
    if (/data|ai|analy/.test(c)) return 'chart';
    if (/secur|forensic/.test(c)) return 'shield';
    if (/web|app|site|design/.test(c)) return 'code';
    if (/train|literacy|teach/.test(c)) return 'graduation';
    return 'folder';
  }
  function icon(name, cls) {
    return '<svg class="ic' + (cls ? ' ' + cls : '') + '" viewBox="0 0 24 24" aria-hidden="true" focusable="false">' + (I[name] || '') + '</svg>';
  }

  /* ---------- small helpers ---------- */
  var e = RN.esc;
  function f(t) { return RN.fill(t, C); }
  function ef(t) { return e(f(t)); }
  function asset(p) {
    if (assets[p]) return assets[p];
    // Files uploaded in the editor live on the freelance site; the CV site links to them there.
    if (remoteBase && /^assets\/(uploads|docs)\//.test(p)) return remoteBase + p;
    return p;
  }
  function arr(v) { return Array.isArray(v) ? v : (v ? [v] : []); }
  function byId(list, id) { for (var i = 0; i < list.length; i++) if (list[i].id === id) return list[i]; return null; }
  function digits(s) { return String(s || '').replace(/\D/g, ''); }
  function waLink(text, number) {
    var n = number === '' ? '' : digits(number || C.profile.whatsapp || C.profile.phone);
    return 'https://wa.me/' + n + (text ? '?text=' + encodeURIComponent(text) : '');
  }
  function telLink() { return 'tel:' + String(C.profile.phone || '').replace(/[^\d+]/g, ''); }
  function mailLink(subject, body) {
    return 'mailto:' + (C.profile.email || '') + '?subject=' + encodeURIComponent(subject || '') + (body ? '&body=' + encodeURIComponent(body) : '');
  }
  function usdRate() { return (C.settings.currency && C.settings.currency.usdRate) || 129; }
  function hasPrice(it) { return it && it.price !== '' && it.price != null && !isNaN(+it.price); }
  function price(amount) { return RN.money(amount, state.currency, usdRate()) || 'On request'; }
  function dateLabel(iso) {
    var m = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso || '');
    if (!m) return '';
    return (+m[3]) + ' ' + ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][+m[2] - 1] + ' ' + m[1];
  }
  function announce(msg) { if ($live) { $live.textContent = ''; setTimeout(function () { $live.textContent = msg; }, 30); } }
  function toast(msg) {
    var old = document.querySelector('.toast');
    if (old) old.remove();
    var t = document.createElement('div');
    t.className = 'toast';
    t.setAttribute('role', 'status');
    t.innerHTML = icon('check') + '<span>' + e(msg) + '</span>';
    document.body.appendChild(t);
    setTimeout(function () { t.remove(); }, 2600);
  }
  function loadScript(src) {
    return new Promise(function (res, rej) {
      var s = document.createElement('script');
      s.src = src; s.onload = res; s.onerror = function () { rej(new Error('Could not load ' + src)); };
      document.head.appendChild(s);
    });
  }
  /* Replace a container's HTML and keep keyboard focus where it was. */
  function swap(id, html) {
    var el = document.getElementById(id);
    if (!el) return;
    var act = document.activeElement;
    var key = act && el.contains(act) ? act.getAttribute('data-fk') : null;
    el.innerHTML = html;
    if (key) {
      var again = el.querySelector('[data-fk="' + key.replace(/"/g, '\\"') + '"]');
      if (again) again.focus({ preventScroll: true });
    }
  }

  /* ---------- content ---------- */
  function normalize(c) {
    c.meta = c.meta || {};
    c.settings = c.settings || {};
    c.settings.currency = c.settings.currency || { code: 'KES', usdRate: 129, showUsdToggle: true };
    c.settings.form = c.settings.form || { provider: 'email' };
    c.profile = c.profile || {};
    var p = c.profile;
    if (p.focusAreas == null && p.marquee != null) p.focusAreas = p.marquee;
    ['summary', 'workModes', 'languages', 'socials', 'facts', 'focusAreas', 'highlights', 'workedWith', 'additional'].forEach(function (k) { p[k] = arr(p[k]); });
    p.availability = p.availability || {};
    ['serviceGroups', 'services', 'skills', 'projects', 'experience', 'education', 'certifications', 'testimonials'].forEach(function (k) { c[k] = arr(c[k]); });
    c.services.forEach(function (s) { s.deliverables = arr(s.deliverables); s.tags = arr(s.tags); s.skills = arr(s.skills); });
    c.skills.forEach(function (g) { g.items = arr(g.items); });
    c.projects.forEach(function (x) { ['stack', 'skills', 'services', 'links', 'images', 'features'].forEach(function (k) { x[k] = arr(x[k]); }); });
    c.experience.forEach(function (x) { x.points = arr(x.points); x.skills = arr(x.skills); });
    c.education.forEach(function (x) { x.details = arr(x.details); });
    c.rates = c.rates || {};
    c.rates.categories = arr(c.rates.categories);
    c.rates.terms = arr(c.rates.terms);
    c.rates.categories.forEach(function (cat) { cat.items = arr(cat.items); cat.items.forEach(function (it) { it.includes = arr(it.includes); it.options = arr(it.options).filter(function (o) { return o && o.id; }); }); });
    c.share = c.share || {};
    // Drop basket entries that no longer exist (an entry is a plain item or one option of an item).
    var ids = RN.rateChoices(c).map(function (x) { return x.id; });
    state.basket = arr(state.basket).filter(function (b) { return b && ids.indexOf(b.id) >= 0; });
  }
  function loadScript(src) {
    return new Promise(function (res, rej) {
      var s = document.createElement('script');
      s.src = src + '?v=' + Math.floor(Date.now() / 60000);
      s.onload = function () {
        if (window.PORTFOLIO) res(window.PORTFOLIO);
        else rej(new Error(src + ' loaded, but it has a syntax error, so window.PORTFOLIO was not set.'));
      };
      s.onerror = function () { rej(new Error('Could not load ' + src + '.')); };
      document.head.appendChild(s);
    });
  }
  function loadContent() {
    if (window.PORTFOLIO) return Promise.resolve(window.PORTFOLIO);
    // The CV site prefers the freelance site's live content (kept current by the editor); its own copy is the fallback.
    if (SITE.contentUrl && location.protocol !== 'file:') {
      var base = RN.normBase(SITE.contentUrl);
      return loadScript(base + 'data/content.js').then(function (c) { remoteBase = base; return c; }, function () {
        window.PORTFOLIO = undefined;
        return loadScript('data/content.js');
      });
    }
    return loadScript('data/content.js');
  }

  /* ---------- theme & accent ---------- */
  function currentTheme() {
    var t = store.get('theme', null);
    if (t === 'light' || t === 'dark') return t;
    var d = C && C.settings.defaultTheme;
    if (d === 'light' || d === 'dark') return d;
    return window.matchMedia && matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  function applyTheme() {
    var t = currentTheme();
    document.documentElement.setAttribute('data-theme', t);
    var label = t === 'dark' ? 'Switch to light theme' : 'Switch to dark theme';
    document.querySelectorAll('[data-action="theme"]').forEach(function (b) {
      if (b.classList.contains('iconbtn')) {
        b.setAttribute('aria-label', label);
        b.innerHTML = icon(t === 'dark' ? 'sun' : 'moon');
      } else {
        b.innerHTML = icon(t === 'dark' ? 'sun' : 'moon') + (t === 'dark' ? 'Light mode' : 'Dark mode');
      }
    });
  }
  function applyAccent() {
    var t = RN.accentTokens(C.settings.accent || '#3E6B52');
    var s = document.documentElement.style;
    s.setProperty('--accent', t.accent);
    s.setProperty('--on-accent', t.onAccent);
    s.setProperty('--accent-text-light', t.accentTextLight);
    s.setProperty('--accent-text-dark', t.accentTextDark);
    s.setProperty('--accent-soft-light', t.accentSoftLight);
    s.setProperty('--accent-soft-dark', t.accentSoftDark);
    var m = document.querySelector('meta[name="theme-color"]');
    if (m) m.setAttribute('content', t.accent);
  }

  /* ---------- links to pages ---------- */
  function baseUrl() {
    var b = RN.normBase(EMPLOYER ? C.settings.cvSiteUrl : C.settings.siteUrl);
    if (b) return b;
    if (location.protocol === 'file:' || PREVIEW) return '';
    return location.origin + location.pathname.replace(/[^/]*$/, '');
  }
  function pageUrl(key) {
    var b = baseUrl();
    var p = RN.PAGES[key] || RN.PAGES.profile;
    if (!b) return location.href.split('#')[0].split('?')[0] + p.hash;
    return b + p.path;
  }

  /* ---------- basket ---------- */
  function inBasket(id) { return state.basket.some(function (b) { return b.id === id; }); }
  function saveBasket() { store.set('basket', state.basket); }
  function toggleBasket(id) {
    if (inBasket(id)) state.basket = state.basket.filter(function (b) { return b.id !== id; });
    else state.basket.push({ id: id, qty: 1 });
    saveBasket();
    updateBasketUI();
  }
  function basketItems() {
    var all = RN.rateChoices(C);
    return state.basket.map(function (b) {
      var it = byId(all, b.id);
      return it ? Object.assign({ qty: Math.max(1, +b.qty || 1) }, it) : null;
    }).filter(Boolean);
  }
  function basketTotal() {
    var items = basketItems(), total = 0, from = false, onRequest = 0;
    items.forEach(function (i) {
      if (!hasPrice(i)) { onRequest += 1; return; }
      total += (+i.price) * i.qty; if (i.from) from = true;
    });
    return { items: items, total: total, from: from, onRequest: onRequest };
  }
  function updateBasketUI() {
    var n = state.basket.length;
    document.querySelectorAll('[data-basket-count]').forEach(function (el) {
      el.textContent = n; el.hidden = !n;
    });
    document.querySelectorAll('[data-action="basket"]').forEach(function (b) {
      var on = inBasket(b.getAttribute('data-item'));
      b.setAttribute('aria-pressed', on ? 'true' : 'false');
      b.innerHTML = on ? icon('check') + 'Added' : icon('plus') + 'Add to quote';
    });
    document.querySelectorAll('.rate[data-id], .rateopt[data-id]').forEach(function (row) {
      row.classList.toggle('is-selected', inBasket(row.getAttribute('data-id')));
    });
    renderBasketBar();
    if (document.getElementById('basketbox')) swap('basketbox', basketBox());
  }
  function renderBasketBar() {
    var r = parse();
    var show = !EMPLOYER && state.basket.length && (r.name === 'rates' || r.name === 'services' || r.name === 'home');
    var bar = document.getElementById('basketbar');
    document.body.classList.toggle('has-basketbar', !!show);
    if (!show) { if (bar) bar.remove(); return; }
    var t = basketTotal();
    var html = '<p class="basketbar__txt">' + t.items.length + (t.items.length === 1 ? ' service' : ' services') + ' in your quote' +
      '<small>' + (t.total ? (t.from ? 'From ' : 'Estimated ') + e(RN.money(t.total, 'KES')) : 'Priced on request') + (t.total && t.onRequest ? ' + ' + t.onRequest + ' on request' : '') + '</small></p>' +
      '<button class="btn btn--sm" data-action="basket-clear">Clear</button>' +
      '<a class="btn btn--sm btn--primary" href="#/quote">Request quote ' + icon('arrowRight') + '</a>';
    if (!bar) {
      bar = document.createElement('div');
      bar.id = 'basketbar';
      bar.className = 'basketbar no-print';
      bar.setAttribute('role', 'region');
      bar.setAttribute('aria-label', 'Your quote');
      document.body.appendChild(bar);
    }
    bar.innerHTML = html;
  }

  /* ---------- router ---------- */
  function parse() {
    var h = location.hash || '';
    if (h.indexOf('#/') === 0) h = h.slice(1);
    else {
      h = h.replace(/^#/, '');
      h = /^(services|projects|cv|rates|quote)\b/.test(h) ? '/' + h : '/';
    }
    var q = '', qi = h.indexOf('?');
    if (qi >= 0) { q = h.slice(qi + 1); h = h.slice(0, qi); }
    var parts = h.split('/').filter(Boolean).map(function (x) { try { return decodeURIComponent(x); } catch (err) { return x; } });
    return { name: parts[0] || 'home', id: parts[1] || '', q: new URLSearchParams(q) };
  }
  var VIEWS = {};
  function route() {
    var r = parse();
    var key = r.name + '/' + r.id;
    var same = state.lastKey === key;
    if (r.name === 'quote') applyQuoteQuery(r.q);
    var view = VIEWS[r.name];
    var html;
    try { html = view ? view(r) : vNotFound(); }
    catch (err) { html = vError(err); if (window.console) console.error(err); }
    $app.innerHTML = '<div class="view' + (same ? ' view--same' : '') + '">' + html + '</div>';
    if (same) $app.firstChild.style.animation = 'none';
    setTitle(r);
    setNav(r);
    closeMenu(true);
    state.lastKey = key;
    afterRender(r, same);
  }
  function setTitle(r) {
    var p = C.profile, t;
    if (r.name === 'home') t = p.name + ' · ' + (p.title || '');
    else if (r.name === 'services') t = 'Services · ' + p.name;
    else if (r.name === 'projects' && r.id) { var pr = byId(C.projects, r.id); t = (pr ? pr.title : 'Project') + ' · ' + p.name; }
    else if (r.name === 'projects') t = 'Projects · ' + p.name;
    else if (r.name === 'cv') t = (p.fullName || p.name) + ' · CV';
    else if (r.name === 'rates') t = (EMPLOYER ? 'Freelance rates · ' : 'Rate card · ') + p.name;
    else if (r.name === 'quote') t = (EMPLOYER ? 'Contact · ' : 'Request a quote · ') + p.name;
    else t = 'Page not found · ' + p.name;
    document.title = t;
  }
  function setNav(r) {
    document.querySelectorAll('[data-nav]').forEach(function (a) {
      if (a.getAttribute('data-nav') === r.name) a.setAttribute('aria-current', 'page');
      else a.removeAttribute('aria-current');
    });
  }
  function afterRender(r, same) {
    if (!same) {
      var target = null;
      if (r.name === 'services' && r.id) target = document.getElementById('svc-' + r.id);
      if (r.name === 'rates' && r.q.get('c')) target = document.getElementById('rc-' + r.q.get('c'));
      if (target) {
        target.classList.add('is-target');
        setTimeout(function () { target.scrollIntoView({ block: 'start' }); }, 30);
      } else window.scrollTo(0, 0);
      // Move focus to the new page for keyboard and screen reader users. Inside the editor's live preview,
      // only do that if the preview already has focus: otherwise it would take focus from the field being typed in.
      var main = document.getElementById('main');
      if (main && (!PREVIEW || document.hasFocus())) main.focus({ preventScroll: true });
      announce(document.title);
    }
    updateBasketUI();
    onScroll();
  }

  /* =========================================================
     VIEWS
     ========================================================= */
  function eyebrow(label) { return '<p class="eyebrow">' + e(label) + '</p>'; }
  function statusBadge(p) {
    var s = p.status === 'ongoing' ? 'ongoing' : (p.status === 'paused' ? 'paused' : 'completed');
    var label = s === 'ongoing' ? 'Ongoing' : (s === 'paused' ? 'Paused' : 'Completed');
    return '<span class="badge badge--' + s + '"><span class="dot"></span>' + label + '</span>';
  }
  function coverInner(p) {
    return '<span class="cover__icon">' + icon(catIcon(p.category, p.title + ' ' + (p.cover || ''))) + '</span>' +
      '<span><span class="cover__word">' + e(p.cover || p.category || p.title) + '</span>' + (p.period ? '<br><span class="cover__num">' + e(p.period) + '</span>' : '') + '</span>';
  }
  function cover(p, i) {
    var img = p.images && p.images[0];
    var tones = ['accent', 'ink', 'alt'];
    if (img) return '<div class="pcard__cover pcard__cover--img"><img src="' + e(asset(img)) + '" alt="" loading="lazy"></div>';
    return '<div class="pcard__cover" data-tone="' + tones[i % 3] + '" aria-hidden="true">' + coverInner(p) + '</div>';
  }
  function projectCard(p, i, wide) {
    var idx = C.projects.indexOf(p);
    return '<a class="pcard' + (wide ? ' pcard--wide' : '') + '" href="#/projects/' + encodeURIComponent(p.id) + '">' +
      cover(p, idx < 0 ? i : idx) +
      '<div class="pcard__body">' +
      '<div class="pcard__meta">' + statusBadge(p) + '<span>' + e(p.category || '') + '</span>' + (p.statusNote && p.status !== 'ongoing' ? '<span>' + e(p.statusNote) + '</span>' : '') + '</div>' +
      '<h3 class="pcard__title">' + e(p.title) + '</h3>' +
      (p.client ? '<p class="pcard__client">' + e(p.client) + '</p>' : '') +
      '<p class="pcard__sum">' + ef(p.summary) + '</p>' +
      (p.stack.length ? '<ul class="chips">' + p.stack.slice(0, 5).map(function (s) { return '<li class="chip">' + e(s) + '</li>'; }).join('') + '</ul>' : '') +
      '</div></a>';
  }

  /* ----- home ----- */
  VIEWS.home = function () {
    // The CV site leads with the CV: summary, experience and skills, then projects and what I do.
    if (EMPLOYER) return hero() + facts() + about() + experienceHome() + skillsSection() + projectsHome() + educationHome() + servicesHome() + testimonials() + ctaBand();
    return hero() + facts() + about() + servicesHome() + projectsHome() + skillsSection() +
      experienceHome() + ratesTeaser() + testimonials() + ctaBand();
  };
  function contactRows() {
    var p = C.profile, out = '';
    if (p.whatsapp || p.phone) out += '<a class="qc" href="' + e(waLink('Hi ' + RN.firstName(p.name) + ', ')) + '" target="_blank" rel="noopener">' + icon('chat') + '<span><span class="qc__label">WhatsApp</span><span class="qc__val">' + e(p.phone) + '</span></span>' + icon('arrowUpRight') + '</a>';
    if (p.phone) out += '<a class="qc" href="' + e(telLink()) + '">' + icon('phone') + '<span><span class="qc__label">Call</span><span class="qc__val">' + e(p.phone) + '</span></span>' + icon('arrowUpRight') + '</a>';
    if (p.email) out += '<a class="qc" href="' + e(mailLink('Hello ' + RN.firstName(p.name))) + '">' + icon('mail') + '<span><span class="qc__label">Email</span><span class="qc__val">' + e(p.email) + '</span></span>' + icon('arrowUpRight') + '</a>';
    return out;
  }
  function hero() {
    var p = C.profile, av = p.availability || {};
    return '<section class="hero" aria-labelledby="hero-name"><div class="wrap hero__in">' +
      '<div class="hero__main">' +
      (av.label ? '<p class="status status--' + e(av.status || 'available') + '"><span class="dot"></span>' + ef(av.label) + '</p>' : '') +
      '<h1 class="hero__name" id="hero-name">' + e(p.name) + '</h1>' +
      (p.title ? '<p class="hero__title">' + e(p.title) + '</p>' : '') +
      '<p class="hero__lede">' + ef(p.headline) + '</p>' +
      ((p.intro || p.location) ? '<p class="hero__sub">' + icon('pin') + '<span>' + ef(p.intro || p.location) + '</span></p>' : '') +
      '<div class="hero__ctas">' +
      (EMPLOYER
        ? '<a class="btn btn--primary" href="#/cv">View full CV ' + icon('arrowRight') + '</a>' +
          (p.cvPdf ? '<a class="btn" href="' + e(asset(p.cvPdf)) + '" download>' + icon('download') + 'Download CV (PDF)</a>' : '') +
          '<a class="btn" href="' + CONTACT + '">Contact me</a>'
        : '<a class="btn btn--primary" href="#/quote">Get a quote ' + icon('arrowRight') + '</a>' +
          '<a class="btn" href="#/cv">View CV</a>' +
          '<a class="btn" href="#/rates">Rate card</a>') +
      '</div>' +
      (p.focusAreas.length ? '<ul class="chips hero__focus" aria-label="Focus areas">' + p.focusAreas.map(function (w) { return '<li class="chip">' + e(w) + '</li>'; }).join('') + '</ul>' : '') +
      '</div>' +
      '<aside class="hero__card" aria-label="Contact">' +
      (p.photo ? '<img class="hero__photo" src="' + e(asset(p.photo)) + '" alt="' + e(p.name) + '" width="600" height="600">' : '') +
      '<p class="hero__card-h">Get in touch</p>' +
      contactRows() +
      (p.workModes.length ? '<div class="hero__modes">' + p.workModes.map(function (m) { return '<span>' + ef(m) + '</span>'; }).join('') + '</div>' : '') +
      '</aside></div></section>';
  }
  function facts() {
    var list = C.profile.facts;
    if (!list.length) return '';
    return '<section class="facts wrap" aria-label="Key facts"><ul class="facts__list">' +
      list.map(function (x) { return '<li><b class="facts__num">' + ef(x.value) + '</b><span class="facts__label">' + ef(x.label) + '</span></li>'; }).join('') +
      '</ul></section>';
  }
  function about() {
    var p = C.profile;
    if (!p.summary.length && !p.highlights.length) return '';
    return '<section class="sec" id="about" aria-labelledby="about-h"><div class="wrap about">' +
      '<header class="sec__head">' + eyebrow('About') + '<h2 class="sec__title" id="about-h">Hands-on IT, with security built in</h2></header>' +
      '<div class="about__body">' + p.summary.map(function (s) { return '<p>' + ef(s) + '</p>'; }).join('') +
      (p.highlights.length ? '<ul class="hl">' + p.highlights.map(function (h) { return '<li>' + icon('check') + '<span>' + ef(h) + '</span></li>'; }).join('') + '</ul>' : '') +
      (p.workedWith.length ? '<div class="ww"><p class="eyebrow muted">Experience with</p><ul class="ww__list">' + p.workedWith.map(function (w) { return '<li>' + e(w) + '</li>'; }).join('') + '</ul></div>' : '') +
      '</div></div></section>';
  }
  function servicesHome() {
    if (!C.services.length) return '';
    var n = 0;
    var groups = C.serviceGroups.length ? C.serviceGroups : [{ id: '', title: 'Services', blurb: '' }];
    var body = groups.map(function (g) {
      var list = C.services.filter(function (s) { return !g.id || s.group === g.id; });
      if (!list.length) return '';
      return '<div class="svc__group"><div><h3 class="svc__gtitle">' + e(g.title) + '</h3>' + (g.blurb ? '<p class="svc__gblurb">' + ef(g.blurb) + '</p>' : '') + '</div>' +
        '<ul class="svc__list">' + list.map(function (s) {
          n += 1;
          var from = EMPLOYER ? null : RN.serviceFromPrice(C, s.id);
          return '<li><a class="svc__row" href="#/services/' + encodeURIComponent(s.id) + '">' +
            '<span class="svc__num">' + (n < 10 ? '0' : '') + n + '</span>' +
            '<span class="svc__name">' + e(s.title) + '</span>' +
            (from !== null ? '<span class="svc__price">from ' + e(price(from)) + '</span>' : '<span></span>') +
            '<span class="svc__go">' + icon('arrowRight') + '</span>' +
            '<span class="svc__sum">' + ef(s.summary) + '</span></a></li>';
        }).join('') + '</ul></div>';
    }).join('');
    return '<section class="sec sec--alt" id="services" aria-labelledby="svc-h"><div class="wrap">' +
      '<header class="sec__head sec__head--split"><div>' + eyebrow(EMPLOYER ? 'What I do' : 'Services') + '<h2 class="sec__title" id="svc-h">' + (EMPLOYER ? 'Areas I work in' : 'What I can help with') + '</h2></div>' +
      '<a class="link-arrow" href="#/services">' + (EMPLOYER ? 'More detail' : 'Service details') + ' ' + icon('arrowRight') + '</a></header>' + body + '</div></section>';
  }
  function projectsHome() {
    if (!C.projects.length) return '';
    var list = C.projects.filter(function (p) { return p.featured; });
    if (!list.length) list = C.projects.slice(0, 4);
    list = list.slice(0, 5);
    var wideFirst = list.length % 2 === 1;
    return '<section class="sec" id="work" aria-labelledby="work-h"><div class="wrap">' +
      '<header class="sec__head sec__head--split"><div>' + eyebrow('Projects') + '<h2 class="sec__title" id="work-h">Selected work</h2></div>' +
      '<a class="link-arrow" href="#/projects">All ' + C.projects.length + ' projects ' + icon('arrowRight') + '</a></header>' +
      '<div class="pgrid">' + list.map(function (p, i) { return projectCard(p, i, wideFirst && i === 0); }).join('') + '</div></div></section>';
  }
  function skillsSection() {
    if (!C.skills.length) return '';
    return '<section class="sec sec--alt" id="skills" aria-labelledby="sk-h"><div class="wrap">' +
      '<header class="sec__head">' + eyebrow('Skills') + '<h2 class="sec__title" id="sk-h">Skills, with the proof behind them</h2>' +
      '<p class="sec__lede">Pick a skill to see the roles, projects and services where I use it.</p></header>' +
      '<div id="skx">' + skx() + '</div></div></section>';
  }
  function skx() {
    var idx = RN.skillIndex(C);
    var sel = state.skill ? idx[state.skill.toLowerCase()] : null;
    var groups = C.skills.map(function (g) {
      return '<div class="skx__group"><h3 class="skx__gtitle">' + e(g.title) + '</h3><div class="chips">' +
        g.items.map(function (name) {
          var d = idx[String(name).toLowerCase()] || { experience: [], projects: [], services: [] };
          var n = d.experience.length + d.projects.length;
          var on = sel && sel.name === name;
          return '<button type="button" class="chip" data-action="skill" data-skill="' + e(name) + '" data-fk="sk:' + e(name) + '" aria-pressed="' + (on ? 'true' : 'false') + '">' + e(name) + (n ? '<span class="chip__n">' + n + '</span>' : '') + '</button>';
        }).join('') + '</div></div>';
    }).join('');
    return '<div class="skx"><div class="skx__groups">' + groups + '</div>' +
      '<aside class="skx__panel" aria-live="polite">' + skPanel(sel) + '</aside></div>';
  }
  function skPanel(sel) {
    if (!sel) {
      return '<p class="eyebrow">Evidence</p><h3>Where I use each skill</h3>' +
        '<p class="skx__hint">Numbers on each skill show how many roles and projects use it. Choose one to see them listed here.</p>';
    }
    function list(ids, kind) {
      return ids.map(function (id) {
        if (kind === 'experience') {
          var r = byId(C.experience, id); if (!r) return '';
          return '<li><a href="#/cv">' + icon('briefcase') + '<span>' + e(r.role) + '<small>' + e(r.org) + ' · ' + e(RN.periodLabel(r.start, r.end)) + '</small></span></a></li>';
        }
        if (kind === 'projects') {
          var p = byId(C.projects, id); if (!p) return '';
          return '<li><a href="#/projects/' + encodeURIComponent(id) + '">' + icon('folder') + '<span>' + e(p.title) + '<small>' + e(p.client || p.category || '') + '</small></span></a></li>';
        }
        var s = byId(C.services, id); if (!s) return '';
        return '<li><a href="#/services/' + encodeURIComponent(id) + '">' + icon('layers') + '<span>' + e(s.title) + '<small>Service · see what is included</small></span></a></li>';
      }).join('');
    }
    var html = '<p class="eyebrow">' + e(sel.group) + '</p><h3>' + e(sel.name) + '</h3>';
    if (sel.experience.length) html += '<p class="skx__label">Roles (' + sel.experience.length + ')</p><ul class="skx__ev">' + list(sel.experience, 'experience') + '</ul>';
    if (sel.projects.length) html += '<p class="skx__label">Projects (' + sel.projects.length + ')</p><ul class="skx__ev">' + list(sel.projects, 'projects') + '</ul>';
    if (sel.services.length) html += '<p class="skx__label">Offered as</p><ul class="skx__ev">' + list(sel.services, 'services') + '</ul>';
    if (!sel.experience.length && !sel.projects.length && !sel.services.length) html += '<p class="skx__hint">Ask me about this one; details coming soon.</p>';
    return html;
  }
  /* CV site only: education and certifications on the home page. */
  function educationHome() {
    if (!C.education.length && !C.certifications.length) return '';
    var edu = C.education.length ? '<div><h3 class="mini-h">Education</h3><div class="edu">' + C.education.map(function (x) {
      return '<div><h4>' + e(x.qualification) + '</h4><p>' + e([x.grade, x.institution, x.period].filter(Boolean).join(' · ')) + '</p></div>';
    }).join('') + '</div></div>' : '';
    var certs = C.certifications.length ? '<div><h3 class="mini-h">Certifications</h3><ul class="certs">' + C.certifications.map(function (x) {
      var name = x.url ? '<a href="' + e(x.url) + '" target="_blank" rel="noopener">' + e(x.name) + '</a>' : e(x.name);
      return '<li><div><b>' + name + '</b><br><span>' + e(x.issuer || '') + '</span></div><time>' + e(x.year || '') + '</time></li>';
    }).join('') + '</ul></div>' : '';
    return '<section class="sec" id="education" aria-labelledby="ed-h"><div class="wrap">' +
      '<header class="sec__head sec__head--split"><div>' + eyebrow('Education') + '<h2 class="sec__title" id="ed-h">Qualifications</h2></div>' +
      '<a class="link-arrow" href="#/cv">Full CV ' + icon('arrowRight') + '</a></header>' +
      '<div class="edu-home">' + edu + certs + '</div></div></section>';
  }
  function experienceHome() {
    if (!C.experience.length) return '';
    return '<section class="sec" id="experience" aria-labelledby="ex-h"><div class="wrap">' +
      '<header class="sec__head sec__head--split"><div>' + eyebrow('Experience') + '<h2 class="sec__title" id="ex-h">Where I have worked</h2></div>' +
      '<a class="link-arrow" href="#/cv">Full interactive CV ' + icon('arrowRight') + '</a></header>' +
      '<ol class="tl">' + C.experience.map(function (r) {
        return '<li class="tl__item"><span class="tl__when">' + e(RN.periodLabel(r.start, r.end)) + '<br>' + e(RN.durationLabel(r.start, r.end)) + '</span>' +
          '<div><h3 class="tl__role">' + e(r.role) + '</h3><p class="tl__org">' + e(r.org) + (r.location ? ' · ' + e(r.location) : '') + '</p></div>' +
          (r.type ? '<span class="chip">' + e(r.type) + '</span>' : '<span></span>') + '</li>';
      }).join('') + '</ol></div></section>';
  }
  function ratesTeaser() {
    var items = RN.rateItems(C);
    if (!items.length) return '';
    var pop = items.filter(function (x) { return x.popular; });
    if (!pop.length) pop = items.slice(0, 3);
    pop = pop.slice(0, 6);
    return '<section class="sec sec--alt" id="rates-teaser" aria-labelledby="rt-h"><div class="wrap">' +
      '<header class="sec__head sec__head--split"><div>' + eyebrow('Rates') + '<h2 class="sec__title" id="rt-h">Popular starting prices</h2></div>' +
      '<a class="link-arrow" href="#/rates">Full rate card ' + icon('arrowRight') + '</a></header>' +
      '<div class="ptags">' + pop.map(function (it) {
        var p = RN.rateDisplayPrice(it), opts = RN.hasOptions(it);
        var unit = opts ? it.options.length + ' options' : (it.unit || '');
        return '<article class="ptag"><span class="ptag__cat">' + e(it.categoryTitle) + '</span><h3 class="ptag__name">' + e(it.name) + '</h3>' +
          '<p class="ptag__amt"><small>' + (hasPrice(p) ? (p.from ? 'From' : 'Price') : 'Price') + '</small>' + e(price(p.price)) + '</p>' +
          '<p class="ptag__unit">' + e(unit) + (it.turnaround ? ' · ' + e(it.turnaround) : '') + '</p>' +
          (opts
            ? '<a class="btn btn--sm btn--add" href="#/rates?c=' + encodeURIComponent(it.category) + '" aria-label="Choose an option for ' + e(it.name) + '">' + icon('arrowRight') + 'Choose an option</a>'
            : '<button type="button" class="btn btn--sm btn--add" data-action="basket" data-item="' + e(it.id) + '" aria-label="Add ' + e(it.name) + ' to quote" aria-pressed="false">' + icon('plus') + 'Add to quote</button>') + '</article>';
      }).join('') + '</div>' +
      '<div class="sec__more"><a class="btn btn--primary" href="#/rates">See all ' + items.length + ' prices ' + icon('arrowRight') + '</a>' +
      '<button type="button" class="btn" data-action="share" data-page="rates">' + icon('share') + 'Share the rate card</button></div></div></section>';
  }
  function testimonials() {
    var list = C.testimonials.filter(function (t) { return t && t.quote; });
    if (!list.length) return '';
    return '<section class="sec" aria-labelledby="ts-h"><div class="wrap">' +
      '<header class="sec__head">' + eyebrow('Testimonials') + '<h2 class="sec__title" id="ts-h">What people say</h2></header>' +
      '<div class="tst">' + list.map(function (t) {
        return '<blockquote><p>“' + e(t.quote) + '”</p><footer><b>' + e(t.name || '') + '</b>' + e([t.role, t.org].filter(Boolean).join(', ')) + '</footer></blockquote>';
      }).join('') + '</div></div></section>';
  }
  function ctaBand() {
    var p = C.profile;
    if (EMPLOYER) {
      return '<section class="cta" aria-labelledby="cta-h"><div class="wrap"><div class="cta__panel">' +
        '<div><h2 class="cta__title" id="cta-h">Hiring for an ICT or web role?</h2>' +
        '<p class="cta__lede">Send me a message about the role, or download my CV.</p></div>' +
        '<div class="cta__actions"><a class="btn btn--primary" href="' + CONTACT + '">Invite me to interview ' + icon('arrowRight') + '</a>' +
        (p.cvPdf ? '<a class="btn" href="' + e(asset(p.cvPdf)) + '" download>' + icon('download') + 'CV (PDF)</a>' : '') +
        (p.email ? '<a class="btn" href="' + e(mailLink('Hello ' + RN.firstName(p.name))) + '">' + icon('mail') + 'Email</a>' : '') +
        '</div></div></div></section>';
    }
    return '<section class="cta" aria-labelledby="cta-h"><div class="wrap"><div class="cta__panel">' +
      '<div><h2 class="cta__title" id="cta-h">Have a project or an IT problem?</h2>' +
      '<p class="cta__lede">Tell me what you need. I will reply with questions or a clear quote.</p></div>' +
      '<div class="cta__actions"><a class="btn btn--primary" href="#/quote">Get a quote ' + icon('arrowRight') + '</a>' +
      ((p.whatsapp || p.phone) ? '<a class="btn" href="' + e(waLink('Hi ' + RN.firstName(p.name) + ', ')) + '" target="_blank" rel="noopener">' + icon('chat') + 'WhatsApp</a>' : '') +
      (p.email ? '<a class="btn" href="' + e(mailLink('Hello ' + RN.firstName(p.name))) + '">' + icon('mail') + 'Email</a>' : '') +
      '</div></div></div></section>';
  }

  /* ----- services ----- */
  VIEWS.services = function (r) {
    var n = 0;
    var groups = C.serviceGroups.length ? C.serviceGroups : [{ id: '', title: 'Services', blurb: '' }];
    var body = groups.map(function (g) {
      var list = C.services.filter(function (s) { return !g.id || s.group === g.id; });
      if (!list.length) return '';
      return '<section class="svcd__group" id="g-' + e(g.id) + '" aria-labelledby="gh-' + e(g.id) + '">' +
        '<div class="svcd__ghead"><h2 class="svcd__gtitle" id="gh-' + e(g.id) + '">' + e(g.title) + '</h2>' + (g.blurb ? '<p class="svcd__gblurb">' + ef(g.blurb) + '</p>' : '') + '</div>' +
        '<div class="svcd__list">' + list.map(function (s) { n += 1; return serviceItem(s, n, r.id === s.id); }).join('') + '</div></section>';
    }).join('');
    return '<section class="pagehead pagehead--accent"><div class="wrap">' +
      '<p class="eyebrow">' + (EMPLOYER ? 'Skills in practice' : 'Services') + '</p><h1 class="pagehead__title">What I do</h1>' +
      '<p class="pagehead__lede">' + (EMPLOYER
        ? C.services.length + ' areas across building, testing, support and growth, with the work that shows each one.'
        : C.services.length + ' services across building, testing, support and growth. Each one links to its starting price and a quote request.') + '</p>' +
      '<nav class="jump" aria-label="Service groups">' + groups.map(function (g) { return g.id ? '<a class="chip" href="#/services" data-action="scrollto" data-target="g-' + e(g.id) + '">' + e(g.title) + '</a>' : ''; }).join('') +
      (EMPLOYER ? '' : '<a class="chip" href="#/rates">Rate card ' + icon('arrowRight') + '</a>') + '</nav></div></section>' +
      '<div class="wrap">' + body + '</div>' + ctaBand();
  };
  function serviceItem(s, n, target) {
    var from = EMPLOYER ? null : RN.serviceFromPrice(C, s.id);
    var rel = C.projects.filter(function (p) { return p.services.indexOf(s.id) >= 0; });
    var cat = null;
    C.rates.categories.forEach(function (c) { if (!cat && c.items.some(function (it) { return it.service === s.id; })) cat = c.id; });
    return '<article class="svcd__item' + (target ? ' is-target' : '') + '" id="svc-' + e(s.id) + '" aria-labelledby="sh-' + e(s.id) + '">' +
      '<div class="svcd__top"><div><span class="svcd__num">' + (n < 10 ? '0' : '') + n + '</span><h3 class="svcd__title" id="sh-' + e(s.id) + '">' + e(s.title) + '</h3></div>' +
      (from !== null ? '<span class="svcd__price">from ' + e(price(from)) + '</span>' : '') + '</div>' +
      '<p class="svcd__sum">' + ef(s.summary) + '</p>' +
      (s.details ? '<p class="svcd__details">' + ef(s.details) + '</p>' : '') +
      '<div class="svcd__cols">' +
      (s.deliverables.length ? '<div><p class="mini-h">' + (EMPLOYER ? 'What it covers' : 'What you get') + '</p><ul class="ticks">' + s.deliverables.map(function (d) { return '<li>' + icon('check') + '<span>' + ef(d) + '</span></li>'; }).join('') + '</ul></div>' : '') +
      '<div>' + (rel.length ? '<p class="mini-h">Related work</p><ul class="rel">' + rel.map(function (p) { return '<li><a href="#/projects/' + encodeURIComponent(p.id) + '">' + e(p.title) + '</a></li>'; }).join('') + '</ul>' : '') +
      (s.tags.length ? '<p class="mini-h" style="margin-top:' + (rel.length ? '18px' : '0') + '">Keywords</p><ul class="chips">' + s.tags.map(function (t) { return '<li class="chip">' + e(t) + '</li>'; }).join('') + '</ul>' : '') + '</div>' +
      '</div>' +
      (EMPLOYER ? '' : '<div class="svcd__foot"><a class="btn btn--primary btn--sm" href="#/quote?service=' + encodeURIComponent(s.id) + '">Request a quote ' + icon('arrowRight') + '</a>' +
      (cat ? '<a class="btn btn--sm" href="#/rates?c=' + encodeURIComponent(cat) + '">See prices</a>' : '') + '</div>') + '</article>';
  }

  /* ----- projects ----- */
  VIEWS.projects = function (r) {
    if (r.id) return vProject(r.id);
    return '<section class="pagehead"><div class="wrap">' +
      '<p class="eyebrow">Projects</p><h1 class="pagehead__title">Work</h1>' +
      '<p class="pagehead__lede">Systems, infrastructure, data and web work, delivered and in progress.</p>' +
      '<div id="pfilters">' + projectFilters() + '</div></div></section>' +
      '<section class="wrap" aria-label="Project list"><div id="presults">' + projectResults() + '</div></section>' +
      '<div style="height:var(--sec)"></div>';
  };
  function projectFilters() {
    var cats = [];
    C.projects.forEach(function (p) { if (p.category && cats.indexOf(p.category) < 0) cats.push(p.category); });
    var count = function (fn) { return C.projects.filter(fn).length; };
    var st = [['all', 'All', count(function () { return true; })], ['completed', 'Completed', count(function (p) { return p.status !== 'ongoing' && p.status !== 'paused'; })], ['ongoing', 'Ongoing', count(function (p) { return p.status === 'ongoing'; })]];
    return '<div class="filters" role="group" aria-label="Filter projects">' +
      '<div class="filters__row"><span class="filters__label">Status</span>' + st.map(function (s) {
        return '<button type="button" class="chip" data-action="pfilter" data-kind="status" data-val="' + s[0] + '" data-fk="ps:' + s[0] + '" aria-pressed="' + (state.pStatus === s[0]) + '">' + s[1] + '<span class="chip__n">' + s[2] + '</span></button>';
      }).join('') + '</div>' +
      (cats.length > 1 ? '<div class="filters__row"><span class="filters__label">Type</span>' +
        '<button type="button" class="chip" data-action="pfilter" data-kind="cat" data-val="all" data-fk="pc:all" aria-pressed="' + (state.pCat === 'all') + '">All types</button>' +
        cats.map(function (c) {
          return '<button type="button" class="chip" data-action="pfilter" data-kind="cat" data-val="' + e(c) + '" data-fk="pc:' + e(c) + '" aria-pressed="' + (state.pCat === c) + '">' + e(c) + '<span class="chip__n">' + count(function (p) { return p.category === c; }) + '</span></button>';
        }).join('') + '</div>' : '') + '</div>';
  }
  function projectResults() {
    var list = C.projects.filter(function (p) {
      var okS = state.pStatus === 'all' || (state.pStatus === 'ongoing' ? p.status === 'ongoing' : (p.status !== 'ongoing' && p.status !== 'paused'));
      var okC = state.pCat === 'all' || p.category === state.pCat;
      return okS && okC;
    });
    if (!list.length) {
      return '<div class="empty" style="margin-top:32px"><h2>No projects match these filters</h2><p class="muted">Try another status or type.</p>' +
        '<button type="button" class="btn" data-action="preset">Show all projects</button></div>';
    }
    return '<p class="results-note" aria-live="polite">Showing ' + list.length + ' of ' + C.projects.length + ' projects</p>' +
      '<div class="pgrid">' + list.map(function (p, i) { return projectCard(p, i, false); }).join('') + '</div>';
  }
  function vProject(id) {
    var p = byId(C.projects, id);
    if (!p) return vNotFound('That project does not exist (any more).');
    var i = C.projects.indexOf(p);
    var prev = C.projects[(i - 1 + C.projects.length) % C.projects.length];
    var next = C.projects[(i + 1) % C.projects.length];
    var tones = ['accent', 'ink', 'alt'];
    var media = p.images.length ?
      '<div class="proj__gallery">' + p.images.map(function (src, k) { return '<a href="' + e(asset(src)) + '" target="_blank" rel="noopener"><img src="' + e(asset(src)) + '" alt="' + e(p.title) + ' screenshot ' + (k + 1) + '" loading="lazy"></a>'; }).join('') + '</div>' :
      '<div class="proj__cover pcard__cover" data-tone="' + tones[i % 3] + '" aria-hidden="true">' + coverInner(p) + '</div>';
    var story = [['The challenge', p.challenge], ['What I did', p.approach], ['Outcome', p.outcome]].filter(function (x) { return x[1]; });
    var feats = arr(p.features).filter(Boolean);
    var services = p.services.map(function (sid) { return byId(C.services, sid); }).filter(Boolean);
    var liveLinks = p.links.filter(function (l) { return l && /^https?:\/\//.test(l.url || ''); });
    return '<article><header class="pagehead proj__head"><div class="wrap">' +
      '<a class="back" href="#/projects">' + icon('arrowLeft') + 'All projects</a>' +
      '<h1 class="pagehead__title">' + e(p.title) + '</h1>' +
      '<div class="proj__meta">' + statusBadge(p) + (p.client ? '<span class="proj__client">' + e(p.client) + '</span>' : '') + (p.period ? '<span class="mono muted">' + e(p.period) + '</span>' : '') + '</div>' +
      '<p class="pagehead__lede" style="margin-top:18px">' + ef(p.summary) + '</p>' +
      // Live sites and demos as buttons under the summary, so they are easy to find.
      (liveLinks.length ? '<div class="pagehead__bar proj__links">' + liveLinks.map(function (l, k) {
        return '<a class="btn' + (k === 0 ? ' btn--primary' : '') + '" href="' + e(l.url) + '" target="_blank" rel="noopener">' + e(l.label || 'Open') + ' ' + icon('arrowUpRight') + '</a>';
      }).join('') + '</div>' : '') + media + '</div></header>' +
      '<div class="wrap proj__grid"><div class="story">' +
      (feats.length ? '<section><h2>Scope</h2><ul class="ticks ticks--lg">' + feats.map(function (x) { return '<li>' + icon('check') + '<span>' + ef(x) + '</span></li>'; }).join('') + '</ul></section>' : '') +
      story.map(function (s) { return '<section><h2>' + s[0] + '</h2><p>' + ef(s[1]) + '</p></section>'; }).join('') + '</div>' +
      '<aside class="side" aria-label="Project facts"><dl>' +
      (p.role ? '<div><dt>My role</dt><dd>' + e(p.role) + '</dd></div>' : '') +
      (p.client ? '<div><dt>Client</dt><dd>' + e(p.client) + '</dd></div>' : '') +
      '<div><dt>Status</dt><dd>' + (p.status === 'ongoing' ? 'Ongoing' : 'Completed') + (p.statusNote ? ' · ' + e(p.statusNote) : '') + '</dd></div>' +
      (p.category ? '<div><dt>Type</dt><dd>' + e(p.category) + '</dd></div>' : '') +
      (p.stack.length ? '<div><dt>Tools & methods</dt><dd><ul class="chips">' + p.stack.map(function (s) { return '<li class="chip">' + e(s) + '</li>'; }).join('') + '</ul></dd></div>' : '') +
      (services.length ? '<div><dt>Related services</dt><dd><ul class="rel">' + services.map(function (s) { return '<li><a href="#/services/' + encodeURIComponent(s.id) + '">' + e(s.title) + '</a></li>'; }).join('') + '</ul></dd></div>' : '') +
      (p.links.filter(function (l) { return l && l.url; }).length ? '<div><dt>Links</dt><dd><ul class="rel">' + p.links.filter(function (l) { return l && l.url; }).map(function (l) { return '<li><a href="' + e(l.url) + '" target="_blank" rel="noopener">' + e(l.label || l.url) + ' ' + icon('external') + '</a></li>'; }).join('') + '</ul></dd></div>' : '') +
      '</dl>' + (EMPLOYER
        ? '<a class="btn btn--primary btn--block" href="' + CONTACT + '">Contact me ' + icon('arrowRight') + '</a>'
        : '<a class="btn btn--primary btn--block" href="#/quote' + (services[0] ? '?service=' + encodeURIComponent(services[0].id) : '') + '">Need something similar? ' + icon('arrowRight') + '</a>') + '</aside></div>' +
      (C.projects.length > 1 ? '<nav class="wrap pager" aria-label="More projects"><a href="#/projects/' + encodeURIComponent(prev.id) + '"><small>Previous</small><b>' + e(prev.title) + '</b></a>' +
        '<a href="#/projects/' + encodeURIComponent(next.id) + '"><small>Next</small><b>' + e(next.title) + '</b></a></nav>' : '') +
      '<div style="height:var(--sec)"></div></article>';
  }

  /* ----- CV ----- */
  VIEWS.cv = function () {
    var p = C.profile;
    var opts = C.skills.map(function (g) {
      return '<optgroup label="' + e(g.title) + '">' + g.items.map(function (s) { return '<option value="' + e(s) + '"' + (state.cvSkill === s ? ' selected' : '') + '>' + e(s) + '</option>'; }).join('') + '</optgroup>';
    }).join('');
    return '<div class="cvbar no-print"><div class="wrap cvbar__in">' +
      '<div class="seg" role="group" aria-label="CV view">' +
      '<button type="button" data-action="cv-view" data-view="full" aria-pressed="' + (state.cvView === 'full') + '">Full CV</button>' +
      '<button type="button" data-action="cv-view" data-view="quick" aria-pressed="' + (state.cvView === 'quick') + '">30-second view</button></div>' +
      '<label for="cv-skill">' + icon('search') + '<span class="sr-only">Show where a skill was used</span>' +
      '<select id="cv-skill" data-change="cv-skill"><option value="">Filter by skill</option>' + opts + '</select></label>' +
      '<span class="cvbar__grow"></span>' +
      (p.cvPdf ? '<a class="btn btn--sm" href="' + e(asset(p.cvPdf)) + '" download>' + icon('download') + 'PDF</a>' : '') +
      '<button type="button" class="btn btn--sm" data-action="print">' + icon('printer') + 'Print / Save PDF</button>' +
      '<button type="button" class="btn btn--sm btn--ink" data-action="share" data-page="cv">' + icon('share') + 'Share</button>' +
      '</div></div>' +
      '<div class="wrap"><article class="sheet" id="cv-sheet" aria-label="Curriculum vitae">' + cvBody() + '</article></div>' +
      '<div style="height:clamp(32px,6vw,72px)"></div>';
  };
  function cvBody() {
    var p = C.profile;
    var site = RN.normBase(C.settings.siteUrl);
    var head = '<header class="cv__head"><div><h1 class="cv__name">' + e(p.fullName || p.name) + '</h1>' +
      '<p class="cv__title">' + e(p.title) + '</p></div>' +
      '<ul class="cv__contact">' +
      (p.email ? '<li><a href="mailto:' + e(p.email) + '">' + e(p.email) + '</a>' + icon('mail') + '</li>' : '') +
      (p.phone ? '<li><a href="' + e(telLink()) + '">' + e(p.phone) + '</a>' + icon('phone') + '</li>' : '') +
      (p.location ? '<li><span>' + e(p.location) + '</span>' + icon('pin') + '</li>' : '') +
      (site ? '<li><a href="' + e(site) + '">' + e(site.replace(/^https?:\/\//, '').replace(/\/$/, '')) + '</a>' + icon('globe') + '</li>' : '') +
      '</ul></header>';
    return head + (state.cvView === 'quick' ? cvQuick() : cvFull());
  }
  function sec(title, inner, cls) {
    return '<section class="cv__sec' + (cls ? ' ' + cls : '') + '"><h2 class="cv__h">' + e(title) + '</h2><div>' + inner + '</div></section>';
  }
  function cvFull() {
    var p = C.profile;
    var sk = state.cvSkill.toLowerCase();
    var out = '';
    out += sec('Profile', '<div class="cv__summary">' + p.summary.map(function (s) { return '<p>' + ef(s) + '</p>'; }).join('') + '</div>' +
      (p.facts.length ? '<ul class="cv__facts">' + p.facts.map(function (x) { return '<li><b>' + ef(x.value) + '</b><span>' + ef(x.label) + '</span></li>'; }).join('') + '</ul>' : ''));
    if (C.skills.length) {
      out += sec('Skills', '<div class="cv__skills">' + C.skills.map(function (g) {
        return '<div><h4>' + e(g.title) + '</h4><div class="chips">' + g.items.map(function (s) {
          return '<button type="button" class="chip" data-action="cv-skill" data-skill="' + e(s) + '" data-fk="cvs:' + e(s) + '" aria-pressed="' + (sk && s.toLowerCase() === sk ? 'true' : 'false') + '">' + e(s) + '</button>';
        }).join('') + '</div></div>';
      }).join('') + '</div>');
    }
    if (C.experience.length) {
      var matches = sk ? C.experience.filter(function (r) { return r.skills.some(function (s) { return s.toLowerCase() === sk; }); }).length : 0;
      var note = sk ? '<div class="cv__note no-print" role="status">' + icon('search') + '<span>' + (matches ? 'Used <b>' + e(state.cvSkill) + '</b> in ' + matches + (matches === 1 ? ' role' : ' roles') : 'No roles list <b>' + e(state.cvSkill) + '</b> yet') + '</span>' +
        '<button type="button" class="btn btn--sm" data-action="cv-clear">Clear filter</button></div>' : '';
      out += sec('Experience', note + C.experience.map(function (r) {
        var hit = sk && r.skills.some(function (s) { return s.toLowerCase() === sk; });
        var meta = [r.location, r.type].filter(function (x, i, a) { return x && a.indexOf(x) === i; }).join(' · ');
        var shown = r.skills.slice(0, 8);
        if (hit) {
          var hitName = r.skills.filter(function (s) { return s.toLowerCase() === sk; })[0];
          if (shown.indexOf(hitName) < 0) shown = shown.slice(0, 7).concat([hitName]);
        }
        var more = r.skills.length - shown.length;
        return '<div class="role' + (sk ? (hit ? ' is-match' : ' is-dim') : '') + '">' +
          '<p class="role__when"><b>' + e(RN.periodLabel(r.start, r.end)) + '</b><span>' + e(RN.durationLabel(r.start, r.end)) + '</span></p>' +
          '<h3 class="role__title">' + e(r.role) + '</h3><p class="role__org">' + e(r.org) + (meta ? ' <span>· ' + e(meta) + '</span>' : '') + '</p>' +
          (r.points.length ? '<ul>' + r.points.map(function (x) { return '<li>' + ef(x) + '</li>'; }).join('') + '</ul>' : '') +
          (shown.length ? '<ul class="chips" aria-label="Skills used">' + shown.map(function (s) { return '<li class="chip' + (sk && s.toLowerCase() === sk ? ' is-hit' : '') + '">' + e(s) + '</li>'; }).join('') +
            (more > 0 ? '<li class="chip chip--more">+' + more + ' more</li>' : '') + '</ul>' : '') +
          '</div>';
      }).join(''));
    }
    var sel = C.projects.filter(function (x) { return x.featured; });
    if (sel.length) {
      out += sec('Selected projects', '<div class="edu">' + sel.map(function (x) {
        return '<div><h3>' + e(x.title) + '</h3><p>' + e([x.client, x.status === 'ongoing' ? 'Ongoing' : (x.statusNote || 'Completed')].filter(Boolean).join(' · ')) + '</p><p>' + ef(x.summary) + '</p></div>';
      }).join('') + '</div>', 'cv__sec--projects');
    }
    if (C.education.length) {
      out += sec('Education', '<div class="edu">' + C.education.map(function (x) {
        return '<div><h3>' + e(x.qualification) + '</h3><p>' + e([x.grade, x.institution, x.location, x.period].filter(Boolean).join(' · ')) + '</p>' +
          (x.details.length ? '<p class="muted" style="margin-top:8px">Relevant coursework: ' + x.details.map(e).join('; ') + '.</p>' : '') + '</div>';
      }).join('') + '</div>');
    }
    if (C.certifications.length) {
      out += sec('Certifications', '<ul class="certs">' + C.certifications.map(function (x) {
        var name = x.url ? '<a href="' + e(x.url) + '" target="_blank" rel="noopener">' + e(x.name) + '</a>' : e(x.name);
        return '<li><div><b>' + name + '</b><br><span>' + e(x.issuer || '') + '</span></div><time>' + e(x.year || '') + '</time></li>';
      }).join('') + '</ul>');
    }
    var langs = p.languages.map(function (l) { return '<li><b>' + e(l.name) + '</b> <span class="muted">· ' + e(l.level || '') + '</span></li>'; }).join('');
    var extra = p.additional.map(function (x) { return '<li>' + ef(x) + '</li>'; }).join('');
    if (langs || extra) {
      out += sec('More', '<div class="cv__pair">' +
        (langs ? '<div><p class="mini-h">Languages</p><ul class="certs">' + langs + '</ul></div>' : '') +
        (extra ? '<div><p class="mini-h">Additional information</p><ul class="ticks">' + p.additional.map(function (x) { return '<li>' + icon('check') + '<span>' + ef(x) + '</span></li>'; }).join('') + '</ul></div>' : '') +
        '</div>');
    }
    return out;
  }
  function cvQuick() {
    var p = C.profile, out = '';
    out += sec('In 30 seconds', '<div class="cv__quick"><p style="font-size:1.15rem;font-weight:600">' + ef(p.headline) + '</p>' +
      (p.highlights.length ? '<ul class="hl">' + p.highlights.map(function (h) { return '<li>' + icon('check') + '<span>' + ef(h) + '</span></li>'; }).join('') + '</ul>' : '') + '</div>');
    if (p.facts.length) out += sec('Key facts', '<ul class="cv__facts">' + p.facts.map(function (x) { return '<li><b>' + ef(x.value) + '</b><span>' + ef(x.label) + '</span></li>'; }).join('') + '</ul>');
    if (C.experience.length) out += sec('Experience', '<ul class="certs">' + C.experience.map(function (r) {
      return '<li><div><b>' + e(r.role) + '</b><br><span>' + e(r.org) + (r.type ? ' · ' + e(r.type) : '') + '</span></div><time>' + e(RN.periodLabel(r.start, r.end)) + '</time></li>';
    }).join('') + '</ul>');
    if (C.skills.length) out += sec('Top skills', '<ul class="chips">' + C.skills.map(function (g) { return g.items.slice(0, 2).map(function (s) { return '<li class="chip">' + e(s) + '</li>'; }).join(''); }).join('') + '</ul>');
    if (C.education.length) out += sec('Education', '<ul class="certs">' + C.education.slice(0, 1).concat(C.certifications.slice(0, 1).map(function (c) { return { qualification: c.name, institution: c.issuer, period: c.year }; })).map(function (x) {
      return '<li><div><b>' + e(x.qualification) + '</b><br><span>' + e(x.institution || '') + '</span></div><time>' + e(x.period || '') + '</time></li>';
    }).join('') + '</ul>');
    out += sec('Next step', '<p>' + e(p.availability && p.availability.label ? f(p.availability.label) + '.' : '') + ' ' + e(p.location || '') + '.</p>' +
      '<div class="cv__cta no-print"><a class="btn btn--primary" href="#/quote?type=job">Invite me to interview ' + icon('arrowRight') + '</a>' +
      '<button type="button" class="btn" data-action="cv-view" data-view="full">Read the full CV</button></div>');
    return out;
  }

  /* ----- rates ----- */
  VIEWS.rates = function () {
    if (EMPLOYER) {
      // Old links from when this address forwarded to the freelance site (e.g. /#/rates) land here.
      var fl = freelanceUrl();
      return '<section class="nf"><div class="wrap"><p class="eyebrow">Freelance services</p><h1 class="pagehead__title pagehead__title--md">Rates are on my freelance site</h1>' +
        '<p class="pagehead__lede">This site is my CV. Prices, packages and quote requests are on my freelance site.</p>' +
        '<div class="pagehead__bar">' + (fl ? '<a class="btn btn--primary" href="' + e(fl + '#/rates') + '">Open the rate card ' + icon('arrowUpRight') + '</a>' : '') +
        '<a class="btn" href="#/cv">View CV</a></div></div></section>';
    }
    var cur = C.settings.currency || {};
    var cats = C.rates.categories;
    return '<section class="pagehead pagehead--accent"><div class="wrap">' +
      '<p class="eyebrow">Rate card' + (C.rates.updated ? ' · Updated ' + e(C.rates.updated) : '') + '</p>' +
      '<h1 class="pagehead__title">Rates</h1>' +
      '<p class="pagehead__lede">' + ef(C.rates.intro) + '</p>' +
      '<div class="pagehead__bar rates-tools">' +
      '<label class="search"><span class="sr-only">Search the rate card</span>' + icon('search') + '<input type="search" id="rate-q" data-input="rate-q" placeholder="Search services, e.g. domain, Wi-Fi, website" value="' + e(state.rq) + '" autocomplete="off"></label>' +
      (cur.showUsdToggle !== false ? '<div class="seg" role="group" aria-label="Currency"><button type="button" data-action="currency" data-cur="KES" aria-pressed="' + (state.currency === 'KES') + '">KES</button><button type="button" data-action="currency" data-cur="USD" aria-pressed="' + (state.currency === 'USD') + '">USD ≈</button></div>' : '') +
      '<span class="grow"></span>' +
      '<button type="button" class="btn" data-action="print">' + icon('printer') + 'Save as PDF</button>' +
      '<button type="button" class="btn btn--ink" data-action="share" data-page="rates">' + icon('share') + 'Share rate card</button>' +
      '</div></div></section>' +
      (cats.length > 1 ? '<nav class="ratenav no-print" aria-label="Rate categories"><div class="wrap ratenav__in">' + cats.map(function (c) {
        return '<a class="chip" href="#/rates?c=' + encodeURIComponent(c.id) + '" data-action="scrollto" data-target="rc-' + e(c.id) + '">' + e(c.title) + '</a>';
      }).join('') + '</div></nav>' : '') +
      '<div class="wrap"><div id="rates-list">' + ratesList() + '</div>' +
      (C.rates.terms.length ? '<section class="terms" aria-labelledby="terms-h"><h2 id="terms-h">Good to know</h2><ol>' + C.rates.terms.map(function (t) { return '<li>' + ef(t) + '</li>'; }).join('') + '</ol></section>' : '') +
      (state.currency === 'USD' ? '<p class="fineprint" style="padding-bottom:32px">USD prices are approximate, converted at ' + e(usdRate()) + ' KES per US dollar. Invoices are in KES unless agreed.</p>' : '') +
      '</div>' + ctaBand();
  };
  function ratesList() {
    var q = state.rq.trim().toLowerCase();
    var shown = 0;
    var html = C.rates.categories.map(function (cat) {
      var items = cat.items.filter(function (it) {
        if (!q) return true;
        var optText = it.options.map(function (o) { return o.name + ' ' + (o.note || '') + ' ' + (o.unit || ''); }).join(' ');
        return (it.name + ' ' + it.includes.join(' ') + ' ' + (it.unit || '') + ' ' + optText).toLowerCase().indexOf(q) >= 0;
      });
      shown += items.length;
      if (!items.length) return '';
      return '<section class="ratecat" id="rc-' + e(cat.id) + '" aria-labelledby="rch-' + e(cat.id) + '">' +
        '<header class="ratecat__head"><h2 class="ratecat__title" id="rch-' + e(cat.id) + '">' + e(cat.title) + '</h2>' +
        '<span class="mono muted">' + items.length + (items.length === 1 ? ' item' : ' items') + '</span>' +
        (cat.blurb ? '<p class="ratecat__blurb">' + ef(cat.blurb) + '</p>' : '') + '</header>' +
        '<ul class="ratelist">' + items.map(rateRow).join('') + '</ul></section>';
    }).join('');
    if (!shown) {
      return '<div class="empty" style="margin-block:40px"><h2>Nothing matches “' + e(state.rq) + '”</h2>' +
        '<p class="muted">Not on the list? I probably still do it. Ask for a custom quote.</p>' +
        '<div class="qactions" style="justify-content:center"><button type="button" class="btn" data-action="rate-clear">Clear search</button><a class="btn btn--primary" href="#/quote">Ask for a custom quote</a></div></div>';
    }
    return (q ? '<p class="results-note" role="status">' + shown + (shown === 1 ? ' matching price' : ' matching prices') + '</p>' : '') + html;
  }
  function ratePrice(p, cls) {
    var alt = state.currency === 'USD' && hasPrice(p) ? '<span class="rate__alt">' + e(RN.money(p.price, 'KES')) + '</span>' : '';
    // Rows keep an empty "From" line so prices line up; option prices sit on one line and show "From" only when needed.
    var from = p.from && hasPrice(p) ? 'From' : (cls ? '' : '&nbsp;');
    return '<div class="rate__price' + (cls ? ' ' + cls : '') + '">' + (from ? '<span class="rate__from">' + from + '</span>' : '') + '<span class="rate__amt' + (hasPrice(p) ? '' : ' rate__amt--req') + '">' + e(price(p.price)) + '</span>' + alt + '</div>';
  }
  function addBtn(id, label) {
    var on = inBasket(id);
    return '<button type="button" class="btn btn--sm btn--add" data-action="basket" data-item="' + e(id) + '" data-fk="b:' + e(id) + '" aria-label="Add ' + e(label) + ' to quote" aria-pressed="' + on + '">' + (on ? icon('check') + 'Added' : icon('plus') + 'Add to quote') + '</button>';
  }
  function rateRow(it) {
    var opts = RN.hasOptions(it);
    var on = !opts && inBasket(it.id);
    var head = '<div class="rate__main"><h3 class="rate__name" id="rn-' + e(it.id) + '">' + e(it.name) + (it.popular ? '<span class="badge badge--popular">Popular</span>' : '') + '</h3>' +
      '<p class="rate__meta">' + (it.unit ? '<span>' + icon('tag') + e(it.unit) + '</span>' : '') + (it.turnaround ? '<span>' + icon('clock') + e(it.turnaround) + '</span>' : '') +
      (opts ? '<span>' + it.options.length + ' options</span>' : '') + '</p>' +
      (it.includes.length ? '<details class="rate__inc"><summary>' + icon('plus') + 'What’s included</summary><ul class="ticks">' + it.includes.map(function (x) { return '<li>' + icon('check') + '<span>' + ef(x) + '</span></li>'; }).join('') + '</ul></details>' : '') +
      '</div>';
    if (!opts) {
      return '<li class="rate' + (on ? ' is-selected' : '') + '" data-id="' + e(it.id) + '">' + head + ratePrice(it) + addBtn(it.id, it.name) + '</li>';
    }
    // An item with options: one row, with each option (its own price and button) listed inside it.
    return '<li class="rate rate--opts" data-parent="' + e(it.id) + '">' + head + ratePrice(RN.rateDisplayPrice(it)) +
      '<ul class="rateopts" aria-labelledby="rn-' + e(it.id) + '">' + it.options.map(function (o) {
        var p = { price: o.price, from: !!o.from };
        var meta = [o.unit, o.turnaround].filter(Boolean);
        return '<li class="rateopt' + (inBasket(o.id) ? ' is-selected' : '') + '" data-id="' + e(o.id) + '">' +
          '<div class="rateopt__main"><span class="rateopt__name">' + e(o.name) + '</span>' + (o.note ? '<span class="rateopt__note">' + ef(o.note) + '</span>' : '') + (meta.length ? '<span class="rateopt__meta">' + e(meta.join(' · ')) + '</span>' : '') + '</div>' +
          ratePrice(p, 'rate__price--opt') + addBtn(o.id, it.name + ': ' + o.name) + '</li>';
      }).join('') + '</ul></li>';
  }

  /* ----- quote ----- */
  var TYPES = {
    quote: { label: 'Project or service quote', msg: 'Tell me about the project or problem', ph: 'What do you need, and what does done look like for you? Include any deadlines, number of devices or pages, links, etc.' },
    job: { label: 'Job or interview invitation', msg: 'About the role', ph: 'Role, responsibilities, location or remote, and how you would like to proceed.' },
    question: { label: 'General question', msg: 'Your message', ph: 'How can I help?' }
  };
  if (EMPLOYER) delete TYPES.quote; // the CV site has no quotes: job invitations and questions only
  var BUDGETS = ['Not sure yet', 'Under KES 10,000', 'KES 10,000 – 30,000', 'KES 30,000 – 80,000', 'KES 80,000 – 150,000', 'Over KES 150,000'];
  var TIMELINES = ['Flexible', 'As soon as possible', 'Within 2 weeks', 'Within a month', 'In 1–3 months'];
  var LOCATIONS = ['Remote / online', 'On-site in Malindi', 'On-site elsewhere in Kilifi County', 'Elsewhere in Kenya', 'Outside Kenya'];
  var JOBTYPES = ['Full-time', 'Part-time', 'Contract / consultancy', 'Remote'];
  var NETLIFY_FIELDS = ['reference', 'enquiry_type', 'name', 'email', 'phone', 'organisation', 'services', 'rate_items', 'estimate', 'budget', 'timeline', 'location', 'job_title', 'job_type', 'job_link', 'contact_method', 'message', 'page'];

  function applyQuoteQuery(q) {
    var changed = false;
    var t = q.get('type');
    if (t && TYPES[t] && state.enquiry !== t) { state.enquiry = t; changed = true; }
    var s = EMPLOYER ? null : q.get('service');
    if (s && byId(C.services, s)) {
      state.enquiry = 'quote';
      var list = arr(state.form.services);
      if (list.indexOf(s) < 0) { list.push(s); state.form.services = list; changed = true; }
    }
    var item = EMPLOYER ? null : q.get('item');
    if (item && !inBasket(item) && byId(RN.rateChoices(C), item)) { state.basket.push({ id: item, qty: 1 }); saveBasket(); }
    if (changed || s || t) { state.sent = null; saveForm(); }
  }
  function saveForm() { sstore.set('form', state.form); sstore.set('enquiry', state.enquiry); }

  VIEWS.quote = function () {
    var p = C.profile;
    if (EMPLOYER && !TYPES[state.enquiry]) state.enquiry = 'job';
    var head = EMPLOYER
      ? '<p class="eyebrow">Contact</p><h1 class="pagehead__title">Contact me</h1><p class="pagehead__lede">Invite me to an interview, ask about a role, or send a question.</p>'
      : '<p class="eyebrow">Quote request</p><h1 class="pagehead__title">Get a quote</h1><p class="pagehead__lede">Tell me what you need. I will reply with questions or a clear, fixed quote.</p>';
    var next = EMPLOYER
      ? '<div class="qcard"><h2>What happens next</h2><ol class="steps"><li>I read your message.</li><li>I reply the way you prefer: email, WhatsApp or a call.</li></ol></div>'
      : '<div class="qcard"><h2>What happens next</h2><ol class="steps"><li>I read your request and check anything unclear with you.</li><li>You get a fixed quote and a timeline.</li><li>Work starts once you approve it.</li></ol></div>' +
        '<div class="qcard"><h2>Not sure what to ask for?</h2><p>Browse starting prices and add items to your quote.</p><a class="link-arrow" href="#/rates">Open the rate card ' + icon('arrowRight') + '</a></div>';
    return '<section class="pagehead"><div class="wrap">' + head + '</div></section>' +
      '<div class="wrap quote"><div id="qform-wrap">' + quoteMain() + '</div>' +
      '<aside class="qside" aria-label="Other ways to reach me">' +
      '<div class="qcard qcard--accent"><h2>Prefer to talk?</h2><div class="qactions">' +
      ((p.whatsapp || p.phone) ? '<a class="btn btn--sm" href="' + e(waLink('Hi ' + RN.firstName(p.name) + ', ')) + '" target="_blank" rel="noopener">' + icon('chat') + 'WhatsApp</a>' : '') +
      (p.phone ? '<a class="btn btn--sm" href="' + e(telLink()) + '">' + icon('phone') + 'Call</a>' : '') +
      (p.email ? '<a class="btn btn--sm" href="' + e(mailLink(EMPLOYER ? 'About a role' : 'Quote request')) + '">' + icon('mail') + 'Email</a>' : '') +
      '</div><p style="margin-top:14px;font-weight:600">' + e(p.phone || '') + (p.phone && p.email ? '<br>' : '') + e(p.email || '') + '</p></div>' +
      next + '</aside></div>';
  };
  function quoteMain() {
    if (state.sent) return quoteDone();
    var fm = state.form, t = state.enquiry;
    function v(k) { return e(fm[k] || ''); }
    function field(k, label, opt) {
      opt = opt || {};
      var id = 'q-' + k;
      var ctrl;
      if (opt.select) {
        ctrl = '<select class="select" id="' + id + '" name="' + k + '" data-field="' + k + '">' + opt.select.map(function (o) { return '<option' + ((fm[k] || opt.select[0]) === o ? ' selected' : '') + '>' + e(o) + '</option>'; }).join('') + '</select>';
      } else if (opt.textarea) {
        ctrl = '<textarea class="textarea" id="' + id + '" name="' + k + '" data-field="' + k + '" rows="6" maxlength="3000" placeholder="' + e(opt.ph || '') + '"' + (opt.req ? ' required aria-required="true"' : '') + '>' + v(k) + '</textarea>';
      } else {
        ctrl = '<input class="input" id="' + id + '" name="' + k + '" data-field="' + k + '" type="' + (opt.type || 'text') + '" value="' + v(k) + '"' +
          (opt.auto ? ' autocomplete="' + opt.auto + '"' : '') + (opt.req ? ' required aria-required="true"' : '') + (opt.ph ? ' placeholder="' + e(opt.ph) + '"' : '') + (opt.inputmode ? ' inputmode="' + opt.inputmode + '"' : '') + '>';
      }
      return '<div class="field" data-for="' + k + '"><label for="' + id + '">' + e(label) + (opt.req ? '<span class="req" aria-hidden="true">*</span>' : '') +
        (opt.textarea ? '<span class="counter" data-counter="' + k + '">' + String(fm[k] || '').length + '/3000</span>' : '') + '</label>' + ctrl +
        (opt.hint ? '<span class="hint" id="' + id + '-hint">' + e(opt.hint) + '</span>' : '') + '</div>';
    }
    var typeSeg = '<fieldset class="fieldset"><legend class="legend">What is this about?</legend><div class="seg seg--wide">' +
      Object.keys(TYPES).map(function (k) {
        return '<label><input type="radio" name="enquiry" value="' + k + '" data-change="enquiry"' + (t === k ? ' checked' : '') + '><span>' + e(TYPES[k].label) + '</span></label>';
      }).join('') + '</div></fieldset>';
    var picked = arr(fm.services);
    var svcPick = C.services.length ? '<fieldset class="fieldset"><legend class="legend">Services you are interested in <span class="muted" style="font-weight:400">(optional)</span></legend><div class="pick">' +
      C.services.map(function (s) {
        return '<label><input type="checkbox" name="services" value="' + e(s.id) + '" data-change="service-pick"' + (picked.indexOf(s.id) >= 0 ? ' checked' : '') + '><span>' + icon('check') + e(s.title) + '</span></label>';
      }).join('') + '</div></fieldset>' : '';
    var contact = arr(fm.contact_method)[0] || fm.contact_method || 'Email';
    var methods = ['Email', 'WhatsApp', 'Phone call'];
    return '<form class="qform" id="qform" novalidate data-form="quote" aria-describedby="q-intro">' +
      '<p id="q-intro" class="sr-only">Fields marked with an asterisk are required.</p>' +
      typeSeg +
      '<div class="grid2">' + field('name', 'Your name', { req: true, auto: 'name' }) + field('email', 'Email', { req: true, type: 'email', auto: 'email', inputmode: 'email' }) + '</div>' +
      '<div class="grid2">' + field('phone', 'Phone or WhatsApp', { type: 'tel', auto: 'tel', hint: 'Optional, include the country code' }) +
      field('organisation', t === 'job' ? 'Company or organisation' : 'Business or organisation', { auto: 'organization', hint: 'Optional' }) + '</div>' +
      (t === 'quote' ? svcPick + '<div id="basketbox">' + basketBox() + '</div>' +
        '<div class="grid2">' + field('budget', 'Budget', { select: BUDGETS }) + field('timeline', 'Timeline', { select: TIMELINES }) + '</div>' +
        field('location', 'Where is the work?', { select: LOCATIONS }) : '') +
      (t === 'job' ? '<div class="grid2">' + field('job_title', 'Job title', { ph: 'e.g. ICT Officer' }) + field('job_type', 'Type of role', { select: JOBTYPES }) + '</div>' +
        field('job_link', 'Link to the job advert', { type: 'url', ph: 'https://', hint: 'Optional' }) : '') +
      field('message', TYPES[t].msg, { textarea: true, req: true, ph: TYPES[t].ph }) +
      '<fieldset class="fieldset"><legend class="legend">Best way to reach you</legend><div class="seg">' + methods.map(function (m) {
        return '<label><input type="radio" name="contact_method" value="' + m + '" data-change="contact"' + (contact === m ? ' checked' : '') + '><span>' + m + '</span></label>';
      }).join('') + '</div></fieldset>' +
      '<div class="hp" aria-hidden="true"><label for="q-website">Leave this empty</label><input id="q-website" name="website" type="text" tabindex="-1" autocomplete="off"></div>' +
      '<div id="q-alert" aria-live="assertive">' + (state.sendError ? sendErrorHtml() : '') + '</div>' +
      '<div class="qactions"><button type="submit" class="btn btn--primary" id="q-submit"' + (state.sending ? ' disabled' : '') + '>' + (state.sending ? 'Sending…' : 'Send request ' + icon('send')) + '</button>' +
      ((C.profile.whatsapp || C.profile.phone) ? '<button type="button" class="btn" data-action="wa-send">' + icon('chat') + 'Send on WhatsApp instead</button>' : '') + '</div>' +
      '<p class="fineprint">Your details are only used to reply to this request.</p>' +
      '</form>';
  }
  function basketBox() {
    var t = basketTotal();
    if (!t.items.length) {
      return '<div class="basketbox"><div class="basketbox__head"><b>Items from the rate card</b><a class="link-arrow" href="#/rates">Add items ' + icon('arrowRight') + '</a></div>' +
        '<p style="padding:14px 16px;margin:0" class="muted">Optional. Add priced items from the rate card for a quicker, more accurate quote.</p></div>';
    }
    return '<div class="basketbox"><div class="basketbox__head"><b>Items from the rate card (' + t.items.length + ')</b><a class="link-arrow" href="#/rates">Add more ' + icon('arrowRight') + '</a></div><ul>' +
      t.items.map(function (i) {
        return '<li><span class="basketbox__name">' + e(i.name) + '<small>' + (hasPrice(i) ? (i.from ? 'From ' : '') + e(RN.money(i.price, 'KES')) : 'Price on request') + (i.unit ? ' · ' + e(i.unit) : '') + '</small></span>' +
          '<label class="sr-only" for="qty-' + e(i.id) + '">Quantity for ' + e(i.name) + '</label>' +
          '<input type="number" id="qty-' + e(i.id) + '" min="1" max="99" value="' + i.qty + '" data-input="qty" data-item="' + e(i.id) + '" data-fk="q:' + e(i.id) + '">' +
          '<span class="basketbox__amt">' + (hasPrice(i) ? e(RN.money(i.price * i.qty, 'KES')) : 'On request') + '</span>' +
          '<button type="button" class="iconbtn" data-action="basket-remove" data-item="' + e(i.id) + '" aria-label="Remove ' + e(i.name) + '">' + icon('x') + '</button></li>';
      }).join('') + '</ul>' +
      '<div class="basketbox__total"><span>' + (t.from ? 'Estimated starting total' : 'Estimated total') + (t.onRequest ? '<small class="muted" style="display:block;font-weight:500">Plus ' + t.onRequest + (t.onRequest === 1 ? ' item' : ' items') + ' priced on request</small>' : '') + '</span><span>' + (t.total ? (t.from ? 'from ' : '') + e(RN.money(t.total, 'KES')) : 'On request') + '</span></div></div>';
  }
  function validateForm() {
    var fm = state.form, errs = {};
    if (!fm.name || String(fm.name).trim().length < 2) errs.name = 'Please enter your name.';
    if (!fm.email || !/^[^@\s]+@[^@\s]+\.[^@\s]{2,}$/.test(String(fm.email).trim())) errs.email = 'Please enter a valid email address, like name@example.com.';
    if (!fm.message || String(fm.message).trim().length < 10) errs.message = 'Please add a few words about what you need (at least 10 characters).';
    if (fm.job_link && !/^https?:\/\/\S+\.\S+/.test(fm.job_link)) errs.job_link = 'Links should start with https://';
    return errs;
  }
  function showErrors(errs) {
    document.querySelectorAll('#qform .field').forEach(function (fd) {
      var k = fd.getAttribute('data-for');
      var input = fd.querySelector('[data-field]');
      var old = fd.querySelector('.field__err');
      if (old) old.remove();
      fd.classList.toggle('is-error', !!errs[k]);
      if (!input) return;
      var hint = fd.querySelector('.hint');
      if (errs[k]) {
        var p = document.createElement('p');
        p.className = 'field__err'; p.id = 'q-' + k + '-err';
        p.innerHTML = icon('alert') + '<span>' + e(errs[k]) + '</span>';
        fd.appendChild(p);
        input.setAttribute('aria-invalid', 'true');
        input.setAttribute('aria-describedby', p.id + (hint ? ' ' + hint.id : ''));
      } else {
        input.removeAttribute('aria-invalid');
        if (hint) input.setAttribute('aria-describedby', hint.id); else input.removeAttribute('aria-describedby');
      }
    });
  }
  function serviceTitle(id) { var s = byId(C.services, id); return s ? s.title : id; }
  function buildPayload() {
    var fm = state.form, t = state.enquiry;
    var bt = basketTotal();
    var d = {
      reference: RN.reference(RN.initials(C.profile.name) || 'RN'),
      enquiry_type: TYPES[t].label,
      name: String(fm.name || '').trim(),
      email: String(fm.email || '').trim(),
      phone: String(fm.phone || '').trim(),
      organisation: String(fm.organisation || '').trim(),
      services: t === 'quote' ? arr(fm.services).map(serviceTitle).join(', ') : '',
      rate_items: t === 'quote' ? bt.items.map(function (i) { return i.name + ' x' + i.qty + ' (' + (hasPrice(i) ? (i.from ? 'from ' : '') + RN.money(i.price * i.qty, 'KES') : 'price on request') + ')'; }).join('; ') : '',
      estimate: t === 'quote' && bt.items.length ? (bt.total ? (bt.from ? 'from ' : '') + RN.money(bt.total, 'KES') : 'on request') + (bt.total && bt.onRequest ? ' + ' + bt.onRequest + ' on request' : '') : '',
      budget: t === 'quote' ? (fm.budget || BUDGETS[0]) : '',
      timeline: t === 'quote' ? (fm.timeline || TIMELINES[0]) : '',
      location: t === 'quote' ? (fm.location || LOCATIONS[0]) : '',
      job_title: t === 'job' ? String(fm.job_title || '').trim() : '',
      job_type: t === 'job' ? (fm.job_type || JOBTYPES[0]) : '',
      job_link: t === 'job' ? String(fm.job_link || '').trim() : '',
      contact_method: fm.contact_method || 'Email',
      message: String(fm.message || '').trim(),
      page: location.href.split('#')[0]
    };
    return d;
  }
  function payloadText(d) {
    var L = [];
    L.push('Hello ' + RN.firstName(C.profile.name) + ', this is ' + (d.name || '…') + (d.organisation ? ' from ' + d.organisation : '') + '.');
    L.push('');
    L.push('Request: ' + d.enquiry_type);
    if (d.services) L.push('Services: ' + d.services);
    if (d.rate_items) L.push('From your rate card: ' + d.rate_items);
    if (d.estimate) L.push('Estimate: ' + d.estimate);
    if (d.budget) L.push('Budget: ' + d.budget);
    if (d.timeline) L.push('Timeline: ' + d.timeline);
    if (d.location) L.push('Location: ' + d.location);
    if (d.job_title) L.push('Role: ' + d.job_title + (d.job_type ? ' (' + d.job_type + ')' : ''));
    if (d.job_link) L.push('Job advert: ' + d.job_link);
    L.push('');
    L.push(d.message || '');
    L.push('');
    if (d.email) L.push('Email: ' + d.email);
    if (d.phone) L.push('Phone: ' + d.phone);
    L.push('Best way to reach me: ' + d.contact_method);
    L.push('Ref: ' + d.reference);
    return L.join('\n');
  }
  function subjectLine(d) {
    var base = (C.settings.form && C.settings.form.subject) || 'New enquiry from your portfolio';
    return base + ': ' + d.enquiry_type + ' from ' + d.name;
  }
  function compact(d) {
    var o = {};
    Object.keys(d).forEach(function (k) { if (d[k]) o[k] = d[k]; });
    return o;
  }
  function sendPayload(d, hp) {
    var fs = C.settings.form || {};
    var provider = PREVIEW ? 'demo' : (fs.provider || 'email');
    if (hp) return Promise.resolve({ ok: true });
    if (provider === 'demo') return new Promise(function (res) { setTimeout(function () { res({ ok: true, demo: true }); }, 700); });
    if (provider === 'whatsapp') {
      window.open(waLink(payloadText(d)), '_blank', 'noopener');
      return Promise.resolve({ ok: true, handoff: 'whatsapp' });
    }
    if (provider === 'email') {
      location.href = mailLink(subjectLine(d), payloadText(d));
      return Promise.resolve({ ok: true, handoff: 'email' });
    }
    var req;
    if (provider === 'netlify') {
      var body = new URLSearchParams();
      body.append('form-name', fs.netlifyFormName || 'quote');
      NETLIFY_FIELDS.forEach(function (k) { body.append(k, d[k] || ''); });
      body.append('bot-field', '');
      req = fetch(location.pathname || '/', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: body.toString() })
        .then(function (r) { if (!r.ok) throw new Error('The form service answered with status ' + r.status + '.'); return { ok: true }; });
    } else if (provider === 'formsubmit') {
      var to = fs.email || C.profile.email;
      // Sent form-encoded on purpose: with only an Accept header this is a CORS "simple request",
      // so the browser skips the OPTIONS preflight. FormSubmit is often slow (10-30 s per round trip),
      // and the preflight alone could use up most of the time limit.
      var fsBody = new URLSearchParams();
      var fsData = Object.assign({ _subject: subjectLine(d), _template: 'table', _captcha: 'false', _replyto: d.email }, compact(d));
      Object.keys(fsData).forEach(function (k) { fsBody.append(k, fsData[k]); });
      req = fetch('https://formsubmit.co/ajax/' + encodeURIComponent(to), {
        method: 'POST',
        headers: { Accept: 'application/json' },
        body: fsBody
      }).then(function (r) {
        return r.json().catch(function () { return {}; }).then(function (j) {
          if (!r.ok || String(j.success) !== 'true') throw new Error(j.message || ('The form service answered with status ' + r.status + '.'));
          return { ok: true };
        });
      });
    } else if (provider === 'web3forms') {
      req = fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(Object.assign({ access_key: fs.web3formsKey, subject: subjectLine(d), from_name: d.name, replyto: d.email }, compact(d)))
      }).then(function (r) {
        return r.json().catch(function () { return {}; }).then(function (j) {
          if (!r.ok || j.success !== true) throw new Error(j.message || ('The form service answered with status ' + r.status + '.'));
          return { ok: true };
        });
      });
    } else if (provider === 'formspree') {
      req = fetch('https://formspree.io/f/' + encodeURIComponent(fs.formspreeId), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(Object.assign({ _subject: subjectLine(d), _replyto: d.email }, compact(d)))
      }).then(function (r) {
        if (!r.ok) return r.json().catch(function () { return {}; }).then(function (j) { throw new Error((j.errors && j.errors[0] && j.errors[0].message) || ('The form service answered with status ' + r.status + '.')); });
        return { ok: true };
      });
    } else {
      return Promise.reject(new Error('The form is not set up yet (unknown provider "' + provider + '").'));
    }
    var timeout = new Promise(function (_, rej) {
      setTimeout(function () { var err = new Error('The form service did not answer in time.'); err.timedOut = true; rej(err); }, FORM_TIMING.timeout);
    });
    return Promise.race([req, timeout]);
  }
  // How long to wait before showing "still sending" and before giving up. Tests may shorten these.
  var FORM_TIMING = Object.assign({ slow: 8000, timeout: 60000 }, window.__RN_FORM_TIMING || {});
  function submitQuote(form) {
    state.tried = true;
    var errs = validateForm();
    showErrors(errs);
    var keys = Object.keys(errs);
    if (keys.length) {
      var first = document.getElementById('q-' + keys[0]);
      if (first) first.focus();
      announce(keys.length === 1 ? 'There is 1 problem with the form.' : 'There are ' + keys.length + ' problems with the form.');
      return;
    }
    var hp = form.querySelector('#q-website');
    var d = buildPayload();
    state.sending = true;
    state.sendError = null;
    var btn = document.getElementById('q-submit');
    if (btn) { btn.disabled = true; btn.textContent = 'Sending…'; }
    form.setAttribute('aria-busy', 'true');
    var slowTimer = setTimeout(function () {
      if (!state.sending) return;
      var b = document.getElementById('q-submit');
      if (b) b.textContent = 'Still sending…';
      var al = document.getElementById('q-alert');
      if (al) al.innerHTML = '<p class="fineprint" id="q-slow">The form service is slow right now. Please keep this page open; it can take up to a minute.</p>';
    }, FORM_TIMING.slow);
    sendPayload(d, hp && hp.value).then(function (res) {
      clearTimeout(slowTimer);
      state.sending = false;
      state.sent = { ref: d.reference, name: d.name, method: d.contact_method, text: payloadText(d), demo: !!res.demo, handoff: res.handoff || '' };
      if (TYPES.quote && d.enquiry_type === TYPES.quote.label) { state.basket = []; saveBasket(); }
      state.form = { contact_method: state.form.contact_method };
      state.tried = false;
      saveForm();
      swap('qform-wrap', quoteMain());
      updateBasketUI();
      var h = document.getElementById('qdone-h');
      if (h) { h.focus(); }
      window.scrollTo({ top: Math.max(0, document.getElementById('qform-wrap').getBoundingClientRect().top + window.scrollY - 100) });
    }).catch(function (err) {
      clearTimeout(slowTimer);
      state.sending = false;
      state.sendError = { msg: err && err.message ? err.message : 'Something went wrong.', timedOut: !!(err && err.timedOut), text: payloadText(d), subject: subjectLine(d) };
      var b = document.getElementById('q-submit');
      if (b) { b.disabled = false; b.innerHTML = 'Try again ' + icon('send'); }
      form.removeAttribute('aria-busy');
      var al = document.getElementById('q-alert');
      if (al) al.innerHTML = sendErrorHtml();
    });
  }
  function sendErrorHtml() {
    var se = state.sendError;
    if (!se) return '';
    // A timeout does not mean the request failed: a slow service often still delivers it.
    var lead = se.timedOut
      ? '<b>Your request was not confirmed.</b> The form service did not answer within a minute, so it may still arrive. To be sure it reaches me, send it on WhatsApp or by email.'
      : '<b>Your request was not sent.</b> ' + e(se.msg);
    return '<div class="alert' + (se.timedOut ? ' alert--wait' : '') + '" role="alert">' + icon('alert') + '<div><p>' + lead + ' Nothing you typed has been lost.</p>' +
      '<div class="qactions">' +
      ((C.profile.whatsapp || C.profile.phone) ? '<a class="btn btn--sm btn--ink" href="' + e(waLink(se.text)) + '" target="_blank" rel="noopener">' + icon('chat') + 'Send on WhatsApp</a>' : '') +
      (C.profile.email ? '<a class="btn btn--sm" href="' + e(mailLink(se.subject, se.text)) + '">' + icon('mail') + 'Send by email</a>' : '') +
      '</div></div></div>';
  }
  function quoteDone() {
    var s = state.sent;
    var first = RN.firstName(s.name);
    var how = { Email: 'email', WhatsApp: 'WhatsApp', 'Phone call': 'phone' }[s.method] || 'email';
    var body;
    if (s.demo) body = '<p>This is a preview, so nothing was sent. On your live site this form delivers requests to you.</p>';
    else if (s.handoff === 'whatsapp') body = '<p>WhatsApp should have opened with your message ready. Press send there to reach me. If it did not open, use the button below.</p>';
    else if (s.handoff === 'email') body = '<p>Your email app should have opened with the message ready. Press send there. If nothing opened, use WhatsApp below or email ' + e(C.profile.email) + '.</p>';
    else body = '<p>I have your request and will get back to you by ' + e(how) + '. Your reference is <b class="mono">' + e(s.ref) + '</b>.</p>';
    return '<div class="qdone" role="status"><div class="qdone__icon">' + icon('check') + '</div>' +
      '<h2 id="qdone-h" tabindex="-1">' + (s.handoff ? 'Almost there, ' : 'Thank you, ') + e(first || 'there') + '.</h2>' + body +
      '<div class="qactions">' +
      ((C.profile.whatsapp || C.profile.phone) ? '<a class="btn btn--ink" href="' + e(waLink(s.text)) + '" target="_blank" rel="noopener">' + icon('chat') + (s.handoff === 'whatsapp' ? 'Open WhatsApp again' : 'Also send on WhatsApp') + '</a>' : '') +
      '<a class="btn" href="#/">Back to profile</a>' +
      '<button type="button" class="btn" data-action="new-request">New request</button></div></div>';
  }

  /* ----- not found / error ----- */
  function vNotFound(msg) {
    return '<section class="nf"><div class="wrap"><p class="eyebrow">Error 404</p><h1 class="pagehead__title">404</h1>' +
      '<p class="pagehead__lede">' + e(msg || 'This page does not exist. The link may be old or mistyped.') + '</p>' +
      '<div class="pagehead__bar"><a class="btn btn--primary" href="#/">Go to the profile</a>' +
      (EMPLOYER ? '<a class="btn" href="#/cv">View CV</a><a class="btn" href="' + CONTACT + '">Contact me</a>' : '<a class="btn" href="#/rates">Rate card</a><a class="btn" href="#/quote">Get a quote</a>') + '</div></div></section>';
  }
  function vError(err) {
    return '<section class="nf"><div class="wrap"><p class="eyebrow">Something broke</p><h1 class="pagehead__title" style="font-size:clamp(3rem,10vw,7rem)">Oops</h1>' +
      '<p class="pagehead__lede">This page could not be shown: ' + e(err && err.message) + '</p><div class="pagehead__bar"><a class="btn btn--primary" href="#/">Go to the profile</a></div></div></section>';
  }

  /* =========================================================
     CHROME: header, mobile menu, footer
     ========================================================= */
  var NAV = EMPLOYER
    ? [['home', 'Profile', '#/'], ['cv', 'CV', '#/cv'], ['projects', 'Projects', '#/projects'], ['services', 'What I do', '#/services']]
    : [['home', 'Profile', '#/'], ['services', 'Services', '#/services'], ['projects', 'Projects', '#/projects'], ['cv', 'CV', '#/cv'], ['rates', 'Rates', '#/rates']];
  var NAV_CTA = EMPLOYER ? ['quote', 'Contact me', CONTACT] : ['quote', 'Get a quote', '#/quote'];
  function freelanceUrl() { return RN.normBase(C.settings.siteUrl); }
  function cvSiteUrl() { return RN.normBase(C.settings.cvSiteUrl); }
  /* A quiet link between the two sites, in the footer. */
  function crossLink() {
    var u = EMPLOYER ? freelanceUrl() : cvSiteUrl();
    if (!u || (PREVIEW && !EMPLOYER)) return '';
    return '<a class="ftr__cross" href="' + e(u) + '">' + (EMPLOYER ? 'Freelance services and rates' : 'CV for employers') + ' ' + icon('arrowUpRight') + '</a>';
  }
  function renderChrome() {
    var p = C.profile;
    $hdr.innerHTML = '<div class="wrap hdr__in">' +
      '<a class="brand" href="#/" aria-label="' + e(p.name) + ', home"><span class="brand__mark" aria-hidden="true">' + e(RN.initials(p.name)) + '</span><span class="brand__name">' + e(p.name) + '</span></a>' +
      '<nav class="nav" aria-label="Main">' + NAV.map(function (n) { return '<a href="' + n[2] + '" data-nav="' + n[0] + '">' + n[1] + '</a>'; }).join('') + '</nav>' +
      '<div class="hdr__actions">' +
      '<button type="button" class="iconbtn hdr__share" data-action="share" aria-label="Share this site">' + icon('share') + '</button>' +
      '<button type="button" class="iconbtn" data-action="theme" aria-label="Switch theme">' + icon('moon') + '</button>' +
      (EMPLOYER
        ? '<a class="btn btn--primary btn--sm hdr__quote" href="' + CONTACT + '" data-nav="quote"><span class="hdr__quote-label">Contact me</span><span class="hdr__quote-short">Contact</span></a>'
        : '<a class="btn btn--primary btn--sm hdr__quote" href="#/quote" data-nav="quote"><span class="hdr__quote-label">Get a quote</span><span class="hdr__quote-short">Quote</span><span class="count" data-basket-count hidden></span></a>') +
      '<button type="button" class="iconbtn hdr__menu" data-action="menu" aria-expanded="false" aria-controls="mnav" aria-label="Open menu">' + icon('menu') + '</button>' +
      '</div></div>';
    $mnav.innerHTML = '<div class="mnav__top"><span class="brand"><span class="brand__mark" aria-hidden="true">' + e(RN.initials(p.name)) + '</span><span class="brand__name">' + e(p.name) + '</span></span>' +
      '<button type="button" class="iconbtn" data-action="menu-close" aria-label="Close menu">' + icon('x') + '</button></div>' +
      '<nav class="mnav__links" aria-label="Main">' + NAV.concat([NAV_CTA]).map(function (n, i) {
        return '<a href="' + n[2] + '" data-nav="' + n[0] + '"><span>0' + (i + 1) + '</span>' + n[1] + '</a>';
      }).join('') + '</nav>' +
      '<div class="mnav__actions"><button type="button" class="btn" data-action="share">' + icon('share') + 'Share</button>' +
      '<button type="button" class="btn" data-action="theme">' + icon('moon') + 'Dark mode</button>' +
      ((p.whatsapp || p.phone) ? '<a class="btn btn--ink" href="' + e(waLink('Hi ' + RN.firstName(p.name) + ', ')) + '" target="_blank" rel="noopener">' + icon('chat') + 'WhatsApp</a>' : '') + '</div>';
    var socials = p.socials.filter(function (s) { return s && s.url; });
    var year = new Date().getFullYear();
    $ftr.innerHTML = '<div class="wrap"><div class="ftr__grid">' +
      '<div><p class="ftr__name">' + e(p.name) + '</p><p class="ftr__muted">' + e(p.title || '') + (p.location ? '<br>' + e(p.location) : '') + '</p>' +
      '<p style="margin-top:20px"><button type="button" class="btn btn--sm" data-action="share" data-page="profile">' + icon('share') + 'Share this profile</button></p></div>' +
      '<div><p class="ftr__h">Explore</p><ul class="ftr__links">' + NAV.concat([NAV_CTA]).map(function (n) { return '<li><a href="' + n[2] + '">' + n[1] + '</a></li>'; }).join('') + '</ul></div>' +
      '<div><p class="ftr__h">Contact</p><ul class="ftr__links">' +
      ((p.whatsapp || p.phone) ? '<li><a href="' + e(waLink('Hi ' + RN.firstName(p.name) + ', ')) + '" target="_blank" rel="noopener">' + icon('chat') + 'WhatsApp</a></li>' : '') +
      (p.phone ? '<li><a href="' + e(telLink()) + '">' + icon('phone') + e(p.phone) + '</a></li>' : '') +
      (p.email ? '<li><a href="mailto:' + e(p.email) + '">' + icon('mail') + e(p.email) + '</a></li>' : '') + '</ul></div>' +
      '<div><p class="ftr__h">' + (socials.length ? 'Elsewhere' : 'Quick links') + '</p><ul class="ftr__links">' +
      (socials.length ? socials.map(function (s) { return '<li><a href="' + e(s.url) + '" target="_blank" rel="noopener me">' + icon('link') + e(s.label || s.url) + '</a></li>'; }).join('') :
        (EMPLOYER
          ? '<li><a href="#/cv">' + icon('user') + 'CV</a></li>' + (p.cvPdf ? '<li><a href="' + e(asset(p.cvPdf)) + '" download>' + icon('download') + 'CV (PDF)</a></li>' : '') +
            '<li><button type="button" class="btn btn--sm" data-action="share" data-page="profile" style="margin-top:6px">' + icon('qr') + 'QR code</button></li>'
          : '<li><a href="#/cv">' + icon('user') + 'CV</a></li><li><a href="#/rates">' + icon('tag') + 'Rate card</a></li><li><button type="button" class="btn btn--sm" data-action="share" data-page="quote" style="margin-top:6px">' + icon('qr') + 'QR code</button></li>')) +
      '</ul></div></div>' +
      '<div class="ftr__base"><span>© ' + year + ' ' + e(p.fullName || p.name) + '</span>' + crossLink() + '<span>' + (C.meta.updated ? 'Updated ' + e(dateLabel(C.meta.updated)) : '') + '</span></div></div>';
    applyTheme();
    updateBasketUI();
  }
  var lastMenuBtn = null;
  function openMenu() {
    $mnav.hidden = false;
    document.body.style.overflow = 'hidden';
    var b = $hdr.querySelector('[data-action="menu"]');
    if (b) b.setAttribute('aria-expanded', 'true');
    lastMenuBtn = b;
    var c = $mnav.querySelector('[data-action="menu-close"]');
    if (c) c.focus();
  }
  function closeMenu(silent) {
    if ($mnav.hidden) return;
    $mnav.hidden = true;
    document.body.style.overflow = '';
    var b = $hdr.querySelector('[data-action="menu"]');
    if (b) b.setAttribute('aria-expanded', 'false');
    if (!silent && lastMenuBtn) lastMenuBtn.focus();
  }
  function onScroll() {
    if ($hdr) $hdr.classList.toggle('is-stuck', window.scrollY > 6);
  }

  /* =========================================================
     SHARE DIALOG
     ========================================================= */
  var SHARE_KEYS = EMPLOYER
    ? [['profile', 'Full profile'], ['cv', 'CV'], ['projects', 'Projects']]
    : [['profile', 'Full profile'], ['cv', 'CV'], ['rates', 'Rate card'], ['quote', 'Quote form'], ['projects', 'Projects']];
  function openShare(key) {
    state.shareKey = key && RN.PAGES[key] && SHARE_KEYS.some(function (s) { return s[0] === key; }) ? key : 'profile';
    var d = document.getElementById('share-dlg');
    if (!d) {
      d = document.createElement('dialog');
      d.id = 'share-dlg';
      d.className = 'dlg';
      d.setAttribute('aria-labelledby', 'share-title');
      document.body.appendChild(d);
      d.addEventListener('click', function (ev) { if (ev.target === d) d.close(); });
    }
    d.innerHTML = shareHtml();
    if (!d.open) {
      if (typeof d.showModal === 'function') d.showModal(); else d.setAttribute('open', '');
    }
    drawQR();
  }
  function shareHtml() {
    var k = state.shareKey;
    var url = pageUrl(k);
    var caption = f(C.share[k] || '');
    var enc = encodeURIComponent;
    var nets = [
      ['WhatsApp', 'https://wa.me/?text=' + enc((caption ? caption + ' ' : '') + url)],
      ['LinkedIn', 'https://www.linkedin.com/sharing/share-offsite/?url=' + enc(url)],
      ['X', 'https://twitter.com/intent/tweet?text=' + enc(caption) + '&url=' + enc(url)],
      ['Facebook', 'https://www.facebook.com/sharer/sharer.php?u=' + enc(url)],
      ['Email', 'mailto:?subject=' + enc(RN.pageInfo(k, C).title) + '&body=' + enc((caption ? caption + '\n\n' : '') + url)]
    ];
    return '<div class="dlg__head"><h2 id="share-title">Share</h2><button type="button" class="iconbtn" data-action="dlg-close" aria-label="Close">' + icon('x') + '</button></div>' +
      '<div class="dlg__body">' +
      '<div class="share__tabs" role="group" aria-label="What to share">' + SHARE_KEYS.map(function (s) {
        return '<button type="button" class="chip" data-action="share-tab" data-page="' + s[0] + '" data-fk="st:' + s[0] + '" aria-pressed="' + (s[0] === k) + '">' + s[1] + '</button>';
      }).join('') + '</div>' +
      '<div class="share__grid"><div class="share__qr" id="share-qr"><span class="muted">Loading QR…</span></div>' +
      '<div style="display:grid;gap:14px">' +
      '<div class="share__url"><label class="sr-only" for="share-url">Link</label><input id="share-url" readonly value="' + e(url) + '"><button type="button" class="btn btn--ink" data-action="copy" data-copy="' + e(url) + '">' + icon('copy') + 'Copy</button></div>' +
      (caption ? '<div><p class="share__caption" id="share-cap">' + e(caption) + ' ' + e(url) + '</p><button type="button" class="btn btn--sm" style="margin-top:8px" data-action="copy" data-copy="' + e(caption + ' ' + url) + '">' + icon('copy') + 'Copy post text</button></div>' : '') +
      '<div class="share__nets">' + (navigator.share ? '<button type="button" class="btn btn--primary" data-action="native-share">' + icon('share') + 'Share…</button>' : '') +
      nets.map(function (n) { return '<a class="btn" href="' + e(n[1]) + '" target="_blank" rel="noopener">' + e(n[0]) + '</a>'; }).join('') + '</div>' +
      '<p class="fineprint">Tip: print the QR code on flyers or business cards, or add it to your WhatsApp status.</p>' +
      '</div></div></div>';
  }
  function qrModules(text) {
    var q = window.qrcode(0, 'M');
    q.addData(text);
    q.make();
    return q;
  }
  function drawQR() {
    var box = document.getElementById('share-qr');
    if (!box) return;
    var url = pageUrl(state.shareKey);
    var ready = window.qrcode ? Promise.resolve() : loadScript('assets/js/vendor/qrcode.js');
    ready.then(function () {
      var q = qrModules(url), n = q.getModuleCount(), path = '';
      for (var r = 0; r < n; r++) for (var c = 0; c < n; c++) if (q.isDark(r, c)) path += 'M' + c + ' ' + r + 'h1v1h-1z';
      var b = document.getElementById('share-qr');
      if (!b) return;
      b.innerHTML = '<svg viewBox="-2 -2 ' + (n + 4) + ' ' + (n + 4) + '" shape-rendering="crispEdges" role="img" aria-label="QR code for ' + e(url) + '"><rect x="-2" y="-2" width="' + (n + 4) + '" height="' + (n + 4) + '" fill="#fff"/><path d="' + path + '" fill="#121016"/></svg>' +
        '<small>Scan to open</small><button type="button" class="btn btn--sm" data-action="qr-download" style="color:#121016;border-color:#121016">' + icon('download') + 'Download PNG</button>';
    }).catch(function () {
      var b = document.getElementById('share-qr');
      if (b) b.innerHTML = '<span class="muted">QR code unavailable offline.</span>';
    });
  }
  function downloadQR() {
    if (!window.qrcode) return;
    var url = pageUrl(state.shareKey);
    var q = qrModules(url), n = q.getModuleCount(), s = 16, m = 4;
    var cv = document.createElement('canvas');
    cv.width = cv.height = (n + m * 2) * s;
    var g = cv.getContext('2d');
    g.fillStyle = '#fff'; g.fillRect(0, 0, cv.width, cv.height);
    g.fillStyle = '#121016';
    for (var r = 0; r < n; r++) for (var c = 0; c < n; c++) if (q.isDark(r, c)) g.fillRect((c + m) * s, (r + m) * s, s, s);
    var a = document.createElement('a');
    a.download = RN.slugify(C.profile.name) + '-' + state.shareKey + '-qr.png';
    a.href = cv.toDataURL('image/png');
    document.body.appendChild(a); a.click(); a.remove();
  }
  function copyText(text) {
    function fallback() {
      var ta = document.createElement('textarea');
      ta.value = text; ta.setAttribute('readonly', ''); ta.style.position = 'fixed'; ta.style.opacity = '0';
      document.body.appendChild(ta); ta.select();
      try { document.execCommand('copy'); toast('Copied'); } catch (err) { toast('Press Ctrl+C to copy'); }
      ta.remove();
    }
    if (navigator.clipboard && window.isSecureContext) navigator.clipboard.writeText(text).then(function () { toast('Copied'); }, fallback);
    else fallback();
  }

  /* =========================================================
     EVENTS
     ========================================================= */
  function preparePrint() {
    var opened = [];
    document.querySelectorAll('details:not([open])').forEach(function (d) { d.open = true; opened.push(d); });
    function restore() { opened.forEach(function (d) { d.open = false; }); window.removeEventListener('afterprint', restore); }
    window.addEventListener('afterprint', restore);
  }
  function onClick(ev) {
    var t = ev.target.closest('[data-action]');
    if (!t) return;
    var a = t.getAttribute('data-action');
    switch (a) {
      case 'theme': store.set('theme', currentTheme() === 'dark' ? 'light' : 'dark'); applyTheme(); break;
      case 'menu': if ($mnav.hidden) openMenu(); else closeMenu(); break;
      case 'menu-close': closeMenu(); break;
      case 'share': ev.preventDefault(); closeMenu(true); openShare(t.getAttribute('data-page') || shareKeyForRoute()); break;
      case 'share-tab': state.shareKey = t.getAttribute('data-page'); var d = document.getElementById('share-dlg'); if (d) { d.innerHTML = shareHtml(); var tb = d.querySelector('[data-fk="st:' + state.shareKey + '"]'); if (tb) tb.focus(); drawQR(); } break;
      case 'dlg-close': var dd = t.closest('dialog'); if (dd) dd.close(); break;
      case 'copy': copyText(t.getAttribute('data-copy') || ''); break;
      case 'native-share':
        var k = state.shareKey;
        navigator.share({ title: RN.pageInfo(k, C).title, text: f(C.share[k] || ''), url: pageUrl(k) }).catch(function () { /* cancelled */ });
        break;
      case 'qr-download': downloadQR(); break;
      case 'skill':
        var sk = t.getAttribute('data-skill');
        state.skill = state.skill === sk ? null : sk;
        swap('skx', skx());
        if (state.skill && window.matchMedia('(max-width: 900px)').matches) {
          var panel = document.querySelector('.skx__panel');
          if (panel) panel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
        break;
      case 'pfilter':
        if (t.getAttribute('data-kind') === 'status') state.pStatus = t.getAttribute('data-val'); else state.pCat = t.getAttribute('data-val');
        swap('pfilters', projectFilters()); swap('presults', projectResults()); break;
      case 'preset': state.pStatus = 'all'; state.pCat = 'all'; swap('pfilters', projectFilters()); swap('presults', projectResults()); break;
      case 'cv-view':
        state.cvView = t.getAttribute('data-view');
        document.querySelectorAll('[data-action="cv-view"]').forEach(function (b) { if (b.closest('.cvbar')) b.setAttribute('aria-pressed', b.getAttribute('data-view') === state.cvView ? 'true' : 'false'); });
        swap('cv-sheet', cvBody());
        if (!t.closest('.cvbar')) { var bar = document.querySelector('.cvbar [data-view="' + state.cvView + '"]'); if (bar) bar.focus(); window.scrollTo(0, 0); }
        break;
      case 'cv-skill':
        var s2 = t.getAttribute('data-skill');
        state.cvSkill = state.cvSkill === s2 ? '' : s2;
        state.cvView = 'full';
        var sel = document.getElementById('cv-skill'); if (sel) sel.value = state.cvSkill;
        swap('cv-sheet', cvBody());
        break;
      case 'cv-clear': state.cvSkill = ''; var sel2 = document.getElementById('cv-skill'); if (sel2) { sel2.value = ''; } swap('cv-sheet', cvBody()); if (sel2) sel2.focus(); break;
      case 'print': preparePrint(); window.print(); break;
      case 'currency':
        state.currency = t.getAttribute('data-cur') === 'USD' ? 'USD' : 'KES';
        store.set('currency', state.currency);
        route();
        var cb = document.querySelector('[data-action="currency"][data-cur="' + state.currency + '"]'); if (cb) cb.focus({ preventScroll: true });
        break;
      case 'basket': toggleBasket(t.getAttribute('data-item')); break;
      case 'basket-remove': state.basket = state.basket.filter(function (b) { return b.id !== t.getAttribute('data-item'); }); saveBasket(); updateBasketUI(); break;
      case 'basket-clear': state.basket = []; saveBasket(); updateBasketUI(); toast('Quote cleared'); break;
      case 'rate-clear': state.rq = ''; var rq = document.getElementById('rate-q'); if (rq) { rq.value = ''; rq.focus(); } swap('rates-list', ratesList()); updateBasketUI(); break;
      case 'scrollto':
        ev.preventDefault();
        var el = document.getElementById(t.getAttribute('data-target'));
        if (el) { el.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' }); el.setAttribute('tabindex', '-1'); el.focus({ preventScroll: true }); }
        break;
      case 'skip': ev.preventDefault(); var m = document.getElementById('main'); if (m) { m.focus(); m.scrollIntoView(); } break;
      case 'wa-send':
        var dd2 = buildPayload();
        window.open(waLink(payloadText(dd2)), '_blank', 'noopener');
        break;
      case 'new-request': state.sent = null; state.sendError = null; swap('qform-wrap', quoteMain()); var n1 = document.getElementById('q-name'); if (n1) n1.focus(); break;
    }
  }
  function shareKeyForRoute() {
    var r = parse();
    return { cv: 'cv', rates: 'rates', quote: 'quote', projects: 'projects' }[r.name] || 'profile';
  }
  function onInput(ev) {
    var t = ev.target;
    var fld = t.getAttribute && t.getAttribute('data-field');
    if (fld) {
      state.form[fld] = t.value;
      saveForm();
      if (fld === 'message') { var c = document.querySelector('[data-counter="message"]'); if (c) c.textContent = t.value.length + '/3000'; }
      if (state.tried) { var errs = validateForm(); var one = {}; if (errs[fld]) one[fld] = errs[fld]; showFieldError(fld, one[fld]); }
      return;
    }
    var di = t.getAttribute && t.getAttribute('data-input');
    if (di === 'rate-q') { state.rq = t.value; swap('rates-list', ratesList()); updateBasketUI(); }
    if (di === 'qty') {
      var id = t.getAttribute('data-item'), v = Math.max(1, Math.min(99, parseInt(t.value, 10) || 1));
      state.basket.forEach(function (b) { if (b.id === id) b.qty = v; });
      saveBasket();
      clearTimeout(onInput._q);
      onInput._q = setTimeout(function () { swap('basketbox', basketBox()); }, 350);
    }
  }
  function showFieldError(k, msg) {
    var fd = document.querySelector('#qform .field[data-for="' + k + '"]');
    if (!fd) return;
    var cur = {};
    if (msg) cur[k] = msg;
    var input = fd.querySelector('[data-field]');
    var old = fd.querySelector('.field__err');
    if (!msg && old) { old.remove(); fd.classList.remove('is-error'); if (input) input.removeAttribute('aria-invalid'); }
    if (msg && !old) showErrors(Object.assign(validateForm()));
  }
  function onChange(ev) {
    var t = ev.target;
    var ch = t.getAttribute && t.getAttribute('data-change');
    if (!ch) {
      var fld = t.getAttribute && t.getAttribute('data-field');
      if (fld) { state.form[fld] = t.value; saveForm(); }
      return;
    }
    if (ch === 'enquiry') { state.enquiry = t.value; saveForm(); swap('qform-wrap', quoteMain()); var r = document.querySelector('#qform input[name="enquiry"][value="' + t.value + '"]'); if (r) r.focus(); if (state.tried) showErrors(validateForm()); }
    if (ch === 'service-pick') {
      var list = Array.prototype.map.call(document.querySelectorAll('#qform input[name="services"]:checked'), function (x) { return x.value; });
      state.form.services = list; saveForm();
    }
    if (ch === 'contact') { state.form.contact_method = t.value; saveForm(); }
    if (ch === 'cv-skill') { state.cvSkill = t.value; state.cvView = 'full'; document.querySelectorAll('.cvbar [data-action="cv-view"]').forEach(function (b) { b.setAttribute('aria-pressed', b.getAttribute('data-view') === 'full' ? 'true' : 'false'); }); swap('cv-sheet', cvBody()); }
  }
  function onSubmit(ev) {
    var form = ev.target;
    if (form.getAttribute('data-form') === 'quote') { ev.preventDefault(); if (!state.sending) submitQuote(form); }
  }
  function onKey(ev) {
    if (ev.key === 'Escape' && !$mnav.hidden) closeMenu();
    if (ev.key === 'Tab' && !$mnav.hidden) {
      var items = $mnav.querySelectorAll('a[href], button');
      if (!items.length) return;
      var first = items[0], last = items[items.length - 1];
      if (ev.shiftKey && document.activeElement === first) { ev.preventDefault(); last.focus(); }
      else if (!ev.shiftKey && document.activeElement === last) { ev.preventDefault(); first.focus(); }
    }
  }

  /* =========================================================
     BOOT
     ========================================================= */
  function start(content) {
    C = content;
    normalize(C);
    applyAccent();
    renderChrome();
    route();
  }
  function showFatal(err) {
    $app.innerHTML = '<section class="boot"><div><div class="boot__mark" style="animation:none"></div><h1 style="font-size:2rem;margin-bottom:10px">The site content could not load</h1>' +
      '<p class="muted">' + e(err && err.message) + '</p><p class="muted">If you just edited <code>data/content.js</code>, open the editor (admin.html) and use “Raw JSON” to find the mistake, or restore the previous version.</p></div></section>';
  }
  function boot() {
    $app = document.getElementById('app');
    $hdr = document.getElementById('site-header');
    $ftr = document.getElementById('site-footer');
    $mnav = document.getElementById('mnav');
    $live = document.getElementById('live');
    document.addEventListener('click', onClick);
    document.addEventListener('input', onInput);
    document.addEventListener('change', onChange);
    document.addEventListener('submit', onSubmit);
    document.addEventListener('keydown', onKey);
    window.addEventListener('hashchange', function () { if (C) route(); });
    window.addEventListener('scroll', onScroll, { passive: true });
    if (window.matchMedia) {
      var mq = matchMedia('(prefers-color-scheme: dark)');
      var onMq = function () { if (!store.get('theme', null)) applyTheme(); };
      if (mq.addEventListener) mq.addEventListener('change', onMq); else if (mq.addListener) mq.addListener(onMq);
    }
    if (PREVIEW) {
      var flag = document.createElement('div');
      flag.className = 'preview-flag'; flag.textContent = 'Preview';
      document.body.appendChild(flag);
      window.addEventListener('message', function (ev) {
        if (ev.origin !== location.origin) return;
        var d = ev.data || {};
        if (d.type !== 'rn-preview' || !d.content) return;
        assets = d.assets || {};
        var y = window.scrollY;
        start(JSON.parse(JSON.stringify(d.content)));
        if (d.route && location.hash !== d.route) location.hash = d.route;
        else window.scrollTo(0, y);
      });
    }
    loadContent().then(function (c) {
      start(c);
      if (PREVIEW && window.parent !== window) window.parent.postMessage({ type: 'rn-preview-ready' }, location.origin);
    }).catch(showFatal);
  }

  window.RNApp = { version: '1.0.0' };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
})();

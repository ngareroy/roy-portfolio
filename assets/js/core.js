/*!
 * Portfolio core helpers, shared by the site (app.js), the editor (admin.js)
 * and the build script (Node). No dependencies.
 */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.RN = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  var INK = '#2B2723';
  var PAPER = '#FAF8F4';
  var PAPER_ALT = '#F3EFE8';
  var DARK_BG = '#1A1815';
  var DARK_SURFACE = '#26231F';

  /* ---------- strings ---------- */
  function esc(v) {
    return String(v == null ? '' : v)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }
  function slugify(s) {
    return String(s || '').toLowerCase().normalize('NFKD').replace(/[̀-ͯ]/g, '')
      .replace(/&/g, ' and ').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 60);
  }
  function initials(name) {
    return String(name || '').split(/\s+/).filter(Boolean).slice(0, 2).map(function (p) { return p[0]; }).join('').toUpperCase();
  }
  function firstName(name) { return String(name || '').trim().split(/\s+/)[0] || ''; }

  /* ---------- objects ---------- */
  function getPath(obj, path) {
    var parts = Array.isArray(path) ? path : String(path).split('.');
    var cur = obj;
    for (var i = 0; i < parts.length; i++) {
      if (cur == null) return undefined;
      cur = cur[parts[i]];
    }
    return cur;
  }
  function setPath(obj, path, value) {
    var parts = Array.isArray(path) ? path : String(path).split('.');
    var cur = obj;
    for (var i = 0; i < parts.length - 1; i++) {
      var k = parts[i];
      if (cur[k] == null || typeof cur[k] !== 'object') cur[k] = /^\d+$/.test(parts[i + 1]) ? [] : {};
      cur = cur[k];
    }
    cur[parts[parts.length - 1]] = value;
    return obj;
  }
  function clone(v) { return JSON.parse(JSON.stringify(v)); }

  /* ---------- colour ---------- */
  function hexToRgb(hex) {
    var h = String(hex || '').trim().replace('#', '');
    if (h.length === 3) h = h.split('').map(function (x) { return x + x; }).join('');
    if (!/^[0-9a-f]{6}$/i.test(h)) h = '3E6B52';
    var n = parseInt(h, 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  }
  function rgbToHex(rgb) {
    return '#' + rgb.map(function (x) {
      return Math.round(Math.max(0, Math.min(255, x))).toString(16).padStart(2, '0');
    }).join('').toUpperCase();
  }
  function isHex(v) { return /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i.test(String(v || '').trim()); }
  function luminance(hex) {
    var c = hexToRgb(hex).map(function (v) {
      v /= 255;
      return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
  }
  function contrast(a, b) {
    var la = luminance(a), lb = luminance(b);
    return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
  }
  function mix(a, b, t) {
    var A = hexToRgb(a), B = hexToRgb(b);
    return rgbToHex(A.map(function (v, i) { return v + (B[i] - v) * t; }));
  }
  /* Move colour towards target until it reaches the contrast ratio min against bg. */
  function towards(color, target, bg, min) {
    for (var t = 0; t <= 1.0001; t += 0.02) {
      var c = mix(color, target, t);
      if (contrast(c, bg) >= min) return c;
    }
    return target;
  }
  /* Everything the stylesheet needs from one accent colour. */
  function accentTokens(accent) {
    var a = rgbToHex(hexToRgb(accent));
    var onAccent = contrast(INK, a) >= contrast('#FFFFFF', a) ? INK : '#FFFFFF';
    var softLight = mix(a, PAPER, 0.88), softDark = mix(a, DARK_BG, 0.72);
    // Accent-coloured text must stay readable on every background it sits on.
    var lightBg = luminance(softLight) < luminance(PAPER_ALT) ? softLight : PAPER_ALT;
    var darkBg = luminance(softDark) > luminance(DARK_SURFACE) ? softDark : DARK_SURFACE;
    return {
      accent: a,
      onAccent: onAccent,
      accentTextLight: towards(a, INK, lightBg, 4.6),
      accentTextDark: towards(a, PAPER, darkBg, 4.6),
      accentSoftLight: softLight,
      accentSoftDark: softDark
    };
  }

  /* ---------- dates & numbers ---------- */
  var MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  function parseMonth(s) {
    var m = /^(\d{4})(?:-(\d{1,2}))?/.exec(String(s || ''));
    if (!m) return null;
    return { y: +m[1], m: m[2] ? Math.min(12, Math.max(1, +m[2])) : 1 };
  }
  function monthLabel(s) {
    var p = parseMonth(s);
    return p ? MONTHS[p.m - 1] + ' ' + p.y : '';
  }
  function periodLabel(start, end) {
    var a = monthLabel(start);
    var b = end ? monthLabel(end) : 'Present';
    return a ? a + ' – ' + b : '';
  }
  function monthsBetween(start, end, now) {
    var a = parseMonth(start);
    if (!a) return 0;
    var d = now || new Date();
    var b = end ? parseMonth(end) : { y: d.getFullYear(), m: d.getMonth() + 1 };
    return Math.max(1, (b.y - a.y) * 12 + (b.m - a.m) + 1);
  }
  function durationLabel(start, end, now) {
    var n = monthsBetween(start, end, now);
    if (!n) return '';
    var y = Math.floor(n / 12), m = n % 12, out = [];
    if (y) out.push(y + (y === 1 ? ' yr' : ' yrs'));
    if (m) out.push(m + (m === 1 ? ' mo' : ' mos'));
    return out.join(' ');
  }
  function yearsSince(start, now) {
    var a = parseMonth(start);
    if (!a) return 0;
    var d = now || new Date();
    var months = (d.getFullYear() - a.y) * 12 + (d.getMonth() + 1 - a.m);
    return Math.max(0, Math.floor(months / 12));
  }
  function fill(text, content) {
    if (text == null) return '';
    var p = (content && content.profile) || {};
    return String(text)
      .replace(/\{years\}/g, String(yearsSince(p.careerStart)))
      .replace(/\{name\}/g, p.name || '');
  }
  function num(n) {
    var v = Math.round(Number(n) || 0);
    return v.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  }
  function money(amount, currency, usdRate) {
    if (amount == null || amount === '' || isNaN(Number(amount))) return '';
    if (currency === 'USD') {
      var r = Number(usdRate) || 129;
      var usd = Number(amount) / r;
      return '$' + num(usd < 10 ? Math.max(1, Math.round(usd)) : Math.round(usd));
    }
    return 'KES ' + num(amount);
  }

  /* ---------- content file ---------- */
  var FILE_HEADER = [
    '/*',
    '  Roy Nyamiaka: portfolio content',
    '  -------------------------------------------------------------',
    '  Everything on the site comes from this one file.',
    '  The easiest way to change it is the editor: open /admin.html on your site.',
    '  If you edit by hand, keep the data below valid JSON',
    '  (double quotes, no trailing commas).',
    '  Tip: writing {years} in any text shows your years of experience,',
    '  counted from profile.careerStart.',
    '*/'
  ].join('\n');

  function pretty(v, ind) {
    ind = ind || 0;
    var pad = new Array(ind + 1).join('  '), pad1 = pad + '  ';
    if (Array.isArray(v)) {
      if (!v.length) return '[]';
      var simple = v.every(function (x) { return typeof x !== 'object' || x === null; });
      var one = JSON.stringify(v);
      if (simple && one.length <= 100) return one.replace(/","/g, '", "');
      var flatObjs = v.every(function (x) {
        return x && typeof x === 'object' && !Array.isArray(x) && JSON.stringify(x).length <= 110 &&
          Object.keys(x).every(function (k) { return typeof x[k] !== 'object' || x[k] === null; });
      });
      if (flatObjs) {
        return '[\n' + v.map(function (x) {
          return pad1 + '{ ' + Object.keys(x).map(function (k) { return JSON.stringify(k) + ': ' + JSON.stringify(x[k]); }).join(', ') + ' }';
        }).join(',\n') + '\n' + pad + ']';
      }
      return '[\n' + v.map(function (x) { return pad1 + pretty(x, ind + 1); }).join(',\n') + '\n' + pad + ']';
    }
    if (v && typeof v === 'object') {
      var ks = Object.keys(v);
      if (!ks.length) return '{}';
      return '{\n' + ks.map(function (k) { return pad1 + JSON.stringify(k) + ': ' + pretty(v[k], ind + 1); }).join(',\n') + '\n' + pad + '}';
    }
    return JSON.stringify(v === undefined ? null : v);
  }
  function serializeContent(content) {
    return FILE_HEADER + '\nwindow.PORTFOLIO = ' + pretty(content, 0) + ';\n';
  }
  function parseContentJs(src) {
    var m = /^\s*window\.PORTFOLIO\s*=\s*/m.exec(src);
    if (!m) {
      var t = String(src).trim();
      if (t[0] === '{') return JSON.parse(t);
      throw new Error('Could not find "window.PORTFOLIO =" in the content file.');
    }
    var body = src.slice(m.index + m[0].length);
    var end = body.lastIndexOf('}');
    var json = body.slice(0, end + 1);
    try { return JSON.parse(json); }
    catch (err) {
      // Hand-edited file with JS syntax (comments, trailing commas): evaluate it in isolation.
      try {
        var sandbox = {};
        /* eslint-disable no-new-func */
        new Function('window', String(src))(sandbox);
        if (sandbox.PORTFOLIO) return sandbox.PORTFOLIO;
      } catch (e2) { /* fall through */ }
      throw new Error('The content file is not valid: ' + err.message);
    }
  }

  /* ---------- pages, links & social meta ---------- */
  var PAGES = {
    profile: { path: '', hash: '#/', image: 'og-profile.png' },
    projects: { path: 'projects/', hash: '#/projects', image: 'og-projects.png' },
    cv: { path: 'cv/', hash: '#/cv', image: 'og-cv.png' },
    rates: { path: 'rates/', hash: '#/rates', image: 'og-rates.png' },
    quote: { path: 'quote/', hash: '#/quote', image: 'og-quote.png' }
  };
  function normBase(url) {
    var u = String(url || '').trim();
    if (!u) return '';
    if (!/^https?:\/\//i.test(u)) u = 'https://' + u;
    return u.replace(/\/?(index\.html)?$/i, '/');
  }
  function pageInfo(key, c) {
    var p = c.profile || {};
    var title = p.title || '';
    var info = {
      profile: {
        title: p.name + (title ? ' · ' + title : ''),
        description: fill(p.headline || '', c) + (p.intro ? ' ' + fill(p.intro, c) : '')
      },
      projects: {
        title: 'Projects · ' + p.name,
        description: fill((c.share && c.share.projects) || 'Projects delivered and in progress.', c).replace(/:\s*$/, '.')
      },
      cv: {
        title: (p.fullName || p.name) + ' · CV',
        description: 'CV of ' + (p.fullName || p.name) + ', ' + title + '. ' + yearsSince(p.careerStart) + '+ years of experience. ' + (p.location || '')
      },
      rates: {
        title: 'Rate card · ' + p.name,
        description: fill((c.rates && c.rates.intro) || '', c)
      },
      quote: {
        title: 'Request a quote · ' + p.name,
        description: fill((c.share && c.share.quote) || 'Tell me what you need and I will reply with a quote.', c).replace(/:\s*$/, '.')
      }
    };
    return info[key] || info.profile;
  }
  /* depth: 0 for the root index.html, 1 for cv/index.html etc. */
  function metaTags(key, c, depth) {
    var base = normBase(c.settings && c.settings.siteUrl);
    var page = PAGES[key] || PAGES.profile;
    var info = pageInfo(key, c);
    var rel = depth ? new Array(depth + 1).join('../') : '';
    var img = base ? base + 'assets/img/' + page.image : rel + 'assets/img/' + page.image;
    var url = base ? base + page.path : '';
    var tok = accentTokens((c.settings && c.settings.accent) || '#3E6B52');
    var t = esc(info.title), d = esc(info.description.slice(0, 300));
    var out = [
      '<title>' + t + '</title>',
      '<meta name="description" content="' + d + '">',
      '<meta name="theme-color" content="' + tok.accent + '">',
      '<meta property="og:type" content="website">',
      '<meta property="og:site_name" content="' + esc((c.profile || {}).name || '') + '">',
      '<meta property="og:title" content="' + t + '">',
      '<meta property="og:description" content="' + d + '">',
      '<meta property="og:image" content="' + esc(img) + '">',
      '<meta property="og:image:width" content="1200">',
      '<meta property="og:image:height" content="630">',
      '<meta name="twitter:card" content="summary_large_image">',
      '<meta name="twitter:title" content="' + t + '">',
      '<meta name="twitter:description" content="' + d + '">',
      '<meta name="twitter:image" content="' + esc(img) + '">'
    ];
    if (url) {
      out.splice(3, 0, '<link rel="canonical" href="' + esc(url) + '">');
      out.push('<meta property="og:url" content="' + esc(url) + '">');
    }
    return out.join('\n    ');
  }
  function replaceBlock(html, name, inner) {
    var re = new RegExp('(<!-- ' + name + ':START -->)[\\s\\S]*?(<!-- ' + name + ':END -->)');
    if (!re.test(html)) return html;
    return html.replace(re, '$1\n    ' + inner + '\n    $2');
  }
  /* A tiny HTML page at /cv/, /rates/ ... that has its own social preview and forwards to the app. */
  function sharePage(key, c) {
    var page = PAGES[key];
    var tok = accentTokens((c.settings && c.settings.accent) || '#3E6B52');
    var target = '../' + page.hash;
    return [
      '<!DOCTYPE html>',
      '<html lang="en">',
      '<head>',
      '    <meta charset="utf-8">',
      '    <meta name="viewport" content="width=device-width, initial-scale=1">',
      '    <!-- SOCIAL-META:START -->',
      '    ' + metaTags(key, c, 1),
      '    <!-- SOCIAL-META:END -->',
      '    <link rel="icon" href="../assets/img/favicon.svg" type="image/svg+xml">',
      '    <script>location.replace(' + JSON.stringify(target) + ' + location.search);</script>',
      '    <style>body{font:18px/1.5 system-ui,sans-serif;background:' + PAPER + ';color:' + INK + ';display:grid;place-items:center;min-height:100vh;margin:0}a{color:' + tok.accentTextLight + '}</style>',
      '</head>',
      '<body>',
      '    <p>Opening… <a href="' + esc(target) + '">Continue</a></p>',
      '</body>',
      '</html>',
      ''
    ].join('\n');
  }

  function noscriptHtml(c, variant) {
    var p = c.profile || {};
    return [
      '<section class="wrap" style="padding:48px 20px">',
      '                <h1>' + esc(p.name || '') + '</h1>',
      '                <p>' + esc([p.title, p.location].filter(Boolean).join(' · ')) + '</p>',
      '                <p>' + (p.email ? 'Email: <a href="mailto:' + esc(p.email) + '">' + esc(p.email) + '</a>' : '') + (p.phone ? ' · Phone: ' + esc(p.phone) : '') + '</p>',
      '                <p>Please enable JavaScript to see the full ' + (variant === 'employer' ? 'profile and CV' : 'portfolio, CV and rate card') + '.</p>',
      '            </section>'
    ].join('\n');
  }
  /* Update the generated parts of index.html (social preview tags + no-JS fallback).
     opts.site (build only) is written between the SITE-CONFIG markers as window.RN_SITE, e.g. the CV site's
     {variant: 'employer', contentUrl: ...}; without it that block is left as it is. */
  function updateIndexHtml(html, c, opts) {
    opts = opts || {};
    html = replaceBlock(html, 'SOCIAL-META', metaTags('profile', c, 0));
    var re = /(<!-- NOSCRIPT:START -->)[\s\S]*?(<!-- NOSCRIPT:END -->)/;
    if (re.test(html)) html = html.replace(re, '$1\n            ' + noscriptHtml(c, opts.site && opts.site.variant) + '\n            $2');
    if (opts.site) html = replaceBlock(html, 'SITE-CONFIG', '<script>window.RN_SITE = ' + JSON.stringify(opts.site).replace(/</g, '\\u003c') + ';</script>');
    return html;
  }

  /* ---------- relationships ---------- */
  function skillIndex(c) {
    var idx = {};
    (c.skills || []).forEach(function (g) {
      (g.items || []).forEach(function (name) {
        idx[String(name).toLowerCase()] = { name: name, group: g.title, groupId: g.id, experience: [], projects: [], services: [] };
      });
    });
    function add(list, key) {
      (list || []).forEach(function (item) {
        (item.skills || []).forEach(function (s) {
          var k = String(s).toLowerCase();
          if (idx[k] && idx[k][key].indexOf(item.id) < 0) idx[k][key].push(item.id);
        });
      });
    }
    add(c.experience, 'experience');
    add(c.projects, 'projects');
    add(c.services, 'services');
    return idx;
  }
  /* Lowest "from" price for a service. Add-ons and time-based prices (per hour,
     per month, per session) are skipped unless they are all the service has. */
  function serviceFromPrice(c, serviceId) {
    var all = rateChoices(c).filter(function (it) {
      return it.service === serviceId && it.price !== '' && it.price != null && !isNaN(+it.price);
    });
    if (!all.length) return null;
    var timeBased = /month|hour|session|week|day\b/i;
    var main = all.filter(function (it) { return !it.addon && !timeBased.test(it.unit || ''); });
    var pool = main.length ? main : all;
    return pool.reduce(function (m, it) { return Math.min(m, +it.price); }, Infinity);
  }
  /* Rate card rows, one per item (an item with options is still one row). */
  function rateItems(c) {
    var out = [];
    ((c.rates && c.rates.categories) || []).forEach(function (cat) {
      (cat.items || []).forEach(function (it) { out.push(Object.assign({ category: cat.id, categoryTitle: cat.title }, it)); });
    });
    return out;
  }
  function hasOptions(it) { return !!(it && Array.isArray(it.options) && it.options.length); }
  /* What a visitor can add to a quote: plain items, and each option of an item that has options.
     An option keeps the item's details (service, add-on, includes) and has its own id, price and unit. */
  function rateChoices(c) {
    var out = [];
    rateItems(c).forEach(function (it) {
      if (!hasOptions(it)) { out.push(it); return; }
      it.options.forEach(function (o) {
        var x = Object.assign({}, it);
        delete x.options;
        out.push(Object.assign(x, {
          id: o.id, parentId: it.id, parentName: it.name, optionName: o.name || '',
          name: it.name + (o.name ? ': ' + o.name : ''),
          price: o.price, unit: o.unit || it.unit || '', from: !!o.from,
          turnaround: o.turnaround || it.turnaround || '', popular: false
        }));
      });
    });
    return out;
  }
  /* The price to show for a row: the item's own, or the lowest option price ("From" when options differ). */
  function rateDisplayPrice(it) {
    if (!hasOptions(it)) return { price: it.price, from: !!it.from };
    var priced = it.options.filter(function (o) { return o.price !== '' && o.price != null && !isNaN(+o.price); });
    if (!priced.length) return { price: '', from: false };
    var low = priced.reduce(function (m, o) { return +o.price < +m.price ? o : m; });
    return { price: low.price, from: !!low.from || it.options.length > 1 };
  }

  /* ---------- validation (used by the editor before saving) ---------- */
  function validate(c) {
    var issues = [];
    function err(path, msg) { issues.push({ level: 'error', path: path, msg: msg }); }
    function warn(path, msg) { issues.push({ level: 'warn', path: path, msg: msg }); }
    var p = c.profile || {};
    if (!p.name) err('profile.name', 'Your display name is empty.');
    if (!p.email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(p.email)) err('profile.email', 'Your email address looks wrong.');
    if (p.careerStart && !parseMonth(p.careerStart)) err('profile.careerStart', 'Career start should look like 2020-01.');
    if (!isHex((c.settings || {}).accent)) err('settings.accent', 'Accent colour should be a hex value like #3E6B52.');
    function uniq(list, label, base) {
      var seen = {};
      (list || []).forEach(function (x, i) {
        if (!x.id) err(base + '.' + i + '.id', label + ' #' + (i + 1) + ' has no ID.');
        else if (seen[x.id]) err(base + '.' + i + '.id', label + ' ID "' + x.id + '" is used twice.');
        seen[x.id] = 1;
      });
    }
    uniq(c.services, 'Service', 'services');
    uniq(c.projects, 'Project', 'projects');
    uniq(c.experience, 'Role', 'experience');
    uniq(c.serviceGroups, 'Service group', 'serviceGroups');
    // Item and option IDs share one namespace: both are used in quote links (#/quote?item=<id>).
    var allItems = [];
    ((c.rates && c.rates.categories) || []).forEach(function (cat, ci) {
      (cat.items || []).forEach(function (it, ii) {
        var base = 'rates.categories.' + ci + '.items.' + ii;
        allItems.push(it);
        if (it.price !== '' && it.price != null && isNaN(+it.price)) err(base + '.price', '"' + it.name + '" has a price that is not a number.');
        (Array.isArray(it.options) ? it.options : []).forEach(function (o, oi) {
          allItems.push(o);
          if (!o.name) err(base + '.options.' + oi + '.name', '"' + it.name + '" has an option without a name.');
          if (o.price !== '' && o.price != null && isNaN(+o.price)) err(base + '.options.' + oi + '.price', 'The option "' + o.name + '" of "' + it.name + '" has a price that is not a number.');
        });
      });
    });
    uniq(allItems, 'Rate item or option', 'rates');
    var skills = skillIndex(c);
    [['experience', 'Role'], ['projects', 'Project'], ['services', 'Service']].forEach(function (pair) {
      (c[pair[0]] || []).forEach(function (x, i) {
        (x.skills || []).forEach(function (s) {
          if (!skills[String(s).toLowerCase()]) warn(pair[0] + '.' + i + '.skills', pair[1] + ' "' + (x.title || x.role || x.id) + '" mentions the skill "' + s + '", which is not in your Skills list.');
        });
      });
    });
    var groupIds = (c.serviceGroups || []).map(function (g) { return g.id; });
    (c.services || []).forEach(function (s, i) {
      if (groupIds.indexOf(s.group) < 0) warn('services.' + i + '.group', 'Service "' + s.title + '" is in a group that does not exist ("' + s.group + '").');
    });
    (c.experience || []).forEach(function (r, i) {
      if (!parseMonth(r.start)) err('experience.' + i + '.start', 'Role "' + r.role + '" needs a start month like 2023-02.');
      if (r.end && !parseMonth(r.end)) err('experience.' + i + '.end', 'Role "' + r.role + '" has an end month that is not like 2023-02.');
    });
    var f = (c.settings && c.settings.form) || {};
    if (f.provider === 'web3forms' && !f.web3formsKey) err('settings.form.web3formsKey', 'Web3Forms is selected but the access key is empty.');
    if (f.provider === 'formspree' && !f.formspreeId) err('settings.form.formspreeId', 'Formspree is selected but the form ID is empty.');
    if (f.provider === 'formsubmit' && !f.email) err('settings.form.email', 'FormSubmit is selected but the email is empty.');
    return issues;
  }

  function reference(prefix) {
    var d = new Date();
    var pad = function (n) { return String(n).padStart(2, '0'); };
    return (prefix || 'RN') + '-' + String(d.getFullYear()).slice(2) + pad(d.getMonth() + 1) + pad(d.getDate()) + '-' + Math.floor(1000 + Math.random() * 9000);
  }

  return {
    INK: INK, PAPER: PAPER, DARK_BG: DARK_BG,
    esc: esc, slugify: slugify, initials: initials, firstName: firstName,
    getPath: getPath, setPath: setPath, clone: clone,
    hexToRgb: hexToRgb, rgbToHex: rgbToHex, isHex: isHex, luminance: luminance, contrast: contrast, mix: mix, accentTokens: accentTokens,
    parseMonth: parseMonth, monthLabel: monthLabel, periodLabel: periodLabel, durationLabel: durationLabel, monthsBetween: monthsBetween,
    yearsSince: yearsSince, fill: fill, num: num, money: money,
    pretty: pretty, serializeContent: serializeContent, parseContentJs: parseContentJs,
    PAGES: PAGES, normBase: normBase, pageInfo: pageInfo, metaTags: metaTags, replaceBlock: replaceBlock, sharePage: sharePage,
    noscriptHtml: noscriptHtml, updateIndexHtml: updateIndexHtml,
    skillIndex: skillIndex, serviceFromPrice: serviceFromPrice, rateItems: rateItems,
    rateChoices: rateChoices, rateDisplayPrice: rateDisplayPrice, hasOptions: hasOptions,
    validate: validate, reference: reference
  };
});

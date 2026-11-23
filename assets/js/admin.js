/*!
 * Portfolio editor. Edits data/content.js with forms and a live preview, then
 * either commits the changes to GitHub (one commit) or downloads them as a zip.
 * The GitHub token only ever lives in this browser.
 */
(function () {
  'use strict';

  var RN = window.RN;
  var esc = RN.esc;
  var draft = null, original = null, baseSha = null;
  var pending = {};                 // uploaded files waiting to be saved: path -> {blob, b64, url}
  var openItems = {};               // list items that are expanded
  var lists = {};                   // list path -> schema (filled while rendering)
  var current = 'profile';
  var dirty = false, previewReady = false, lastDeleted = null, ghBusy = false, forceOverwrite = false;
  var frame, main, nav, statusEl;
  var ghState = { ok: false, msg: '' };

  function mkStore(kind) {
    return {
      get: function (k, d) { try { var v = window[kind].getItem('rn-admin:' + k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } },
      set: function (k, v) { try { window[kind].setItem('rn-admin:' + k, JSON.stringify(v)); return true; } catch (e) { return false; } },
      del: function (k) { try { window[kind].removeItem('rn-admin:' + k); } catch (e) { /* ignore */ } }
    };
  }
  var LS = mkStore('localStorage'), SS = mkStore('sessionStorage');

  function today() { var d = new Date(); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); }
  function clone(v) { return JSON.parse(JSON.stringify(v)); }
  function arr(v) { return Array.isArray(v) ? v : (v == null || v === '' ? [] : [v]); }

  /* =========================================================
     SCHEMA: what each section edits
     ========================================================= */
  function skillNames() { return [].concat.apply([], (draft.skills || []).map(function (g) { return arr(g.items); })); }
  function serviceOpts() { return (draft.services || []).map(function (s) { return [s.id, s.title || s.id]; }); }
  function serviceOptsNone() { return [['', 'None']].concat(serviceOpts()); }
  function groupOpts() { return (draft.serviceGroups || []).map(function (g) { return [g.id, g.title || g.id]; }); }
  function projCats() { var o = []; (draft.projects || []).forEach(function (p) { if (p.category && o.indexOf(p.category) < 0) o.push(p.category); }); return o; }
  function provider() { return ((draft.settings || {}).form || {}).provider; }
  function link2(label) { return [{ row: [{ k: 'label', t: 'text', label: label || 'Label' }, { k: 'url', t: 'url', label: 'URL' }] }]; }

  var SECTIONS = [
    { id: 'profile', label: 'Profile', route: '#/', keys: ['profile'],
      lede: 'Your name, headline, about text and contact details. They appear across the whole site and on your CV.',
      fields: [
        { row: [{ k: 'profile.name', t: 'text', label: 'Display name', req: true, help: 'Shown in the header and the big hero.' }, { k: 'profile.fullName', t: 'text', label: 'Full name on your CV' }] },
        { k: 'profile.title', t: 'text', label: 'Job title', help: 'For example: ICT Administrator & Web Systems Developer' },
        { k: 'profile.headline', t: 'textarea', rows: 2, label: 'Headline', help: 'The big sentence at the top of your profile. One or two lines works best.' },
        { k: 'profile.intro', t: 'textarea', rows: 2, label: 'Short intro under the headline' },
        { row: [{ k: 'profile.availability.status', t: 'select', label: 'Availability', options: [['available', 'Available (green dot)'], ['limited', 'Limited (amber dot)'], ['unavailable', 'Not available (grey dot)']] }, { k: 'profile.availability.label', t: 'text', label: 'Availability text' }] },
        { k: 'profile.photo', t: 'image', label: 'Profile photo', max: 900, help: 'Optional. A square photo looks best. It appears in the contact card at the top.' },
        { group: 'About' },
        { k: 'profile.summary', t: 'paras', rows: 10, label: 'About you', help: 'Leave an empty line between paragraphs. Write {years} to show your years of experience automatically.' },
        { k: 'profile.highlights', t: 'lines', rows: 5, label: 'Highlights', help: 'One per line. Shown as a ticked list in About and in the 30-second CV.' },
        { row: [{ k: 'profile.careerStart', t: 'month', label: 'Career start', help: 'Used for {years}. Format 2020-01.' }, { k: 'profile.nationality', t: 'text', label: 'Nationality' }] },
        { k: 'profile.facts', t: 'list', label: 'Key facts (big numbers)', itemLabel: 'value', itemSub: 'label', addLabel: 'Add a fact', item: [{ row: [{ k: 'value', t: 'text', label: 'Number or short text' }, { k: 'label', t: 'text', label: 'What it means' }] }] },
        { k: 'profile.workedWith', t: 'tags', label: 'Organisations you have worked with' },
        { k: 'profile.focusAreas', t: 'tags', label: 'Focus areas', help: 'Short words shown as tags under your headline, for example Websites or Networks.' },
        { group: 'Contact' },
        { row: [{ k: 'profile.email', t: 'email', label: 'Email', req: true }, { k: 'profile.phone', t: 'tel', label: 'Phone (as shown on the site)' }] },
        { row: [{ k: 'profile.whatsapp', t: 'tel', label: 'WhatsApp number', help: 'Country code and number, digits only, e.g. 254708061237.' }, { k: 'profile.location', t: 'text', label: 'Location' }] },
        { k: 'profile.workModes', t: 'lines', rows: 2, label: 'Where you work', help: 'One per line.' },
        { k: 'profile.socials', t: 'list', label: 'Social links', itemLabel: 'label', itemSub: 'url', addLabel: 'Add a link', help: 'Links without a URL stay hidden on the site.', item: link2('Name, e.g. LinkedIn') },
        { group: 'CV extras' },
        { k: 'profile.languages', t: 'list', label: 'Languages', itemLabel: 'name', itemSub: 'level', addLabel: 'Add a language', item: [{ row: [{ k: 'name', t: 'text', label: 'Language' }, { k: 'level', t: 'text', label: 'Level' }] }] },
        { k: 'profile.additional', t: 'lines', rows: 3, label: 'Additional information', help: 'One per line. Shown at the end of your CV.' },
        { k: 'profile.cvPdf', t: 'file', label: 'Downloadable CV (PDF)', accept: 'application/pdf', dir: 'assets/docs', help: 'Optional. Adds a PDF button to the CV page. Tip: open your CV page, choose Print / Save PDF, then upload that file here.' }
      ] },
    { id: 'services', label: 'Services', route: '#/services', keys: ['serviceGroups', 'services'],
      lede: 'What you offer. Each service links to its cheapest price in the rate card automatically.',
      fields: [
        { k: 'serviceGroups', t: 'list', label: 'Groups', itemLabel: 'title', idFrom: 'title', addLabel: 'Add a group', item: [{ row: [{ k: 'title', t: 'text', label: 'Group name' }, { k: 'id', t: 'slug', label: 'ID' }] }, { k: 'blurb', t: 'textarea', rows: 2, label: 'Short description' }] },
        { k: 'services', t: 'list', label: 'Services', itemLabel: 'title', itemSub: 'group', idFrom: 'title', filter: true, addLabel: 'Add a service', item: [
          { row: [{ k: 'title', t: 'text', label: 'Service name' }, { k: 'group', t: 'select', label: 'Group', options: groupOpts }] },
          { k: 'summary', t: 'textarea', rows: 2, label: 'One-line summary' },
          { k: 'details', t: 'textarea', rows: 3, label: 'Details' },
          { k: 'deliverables', t: 'lines', rows: 4, label: 'What you get', help: 'One per line.' },
          { k: 'tags', t: 'tags', label: 'Keywords' },
          { k: 'skills', t: 'tags', label: 'Skills used', suggest: skillNames, help: 'Connects this service to the Skills explorer.' },
          { k: 'id', t: 'slug', label: 'ID (used in links)', help: 'Lowercase, no spaces. Changing it breaks old links to this service.' }
        ] }
      ] },
    { id: 'skills', label: 'Skills', route: '#/cv', keys: ['skills'],
      lede: 'Your skills, grouped. Roles, projects and services refer to these exact names, which powers the "where I used it" feature.',
      fields: [
        { k: 'skills', t: 'list', label: 'Skill groups', itemLabel: 'title', idFrom: 'title', addLabel: 'Add a group', item: [{ row: [{ k: 'title', t: 'text', label: 'Group name' }, { k: 'id', t: 'slug', label: 'ID' }] }, { k: 'items', t: 'lines', rows: 7, label: 'Skills', help: 'One per line. If you rename a skill, update it in your roles and projects too.' }] }
      ] },
    { id: 'projects', label: 'Projects', route: '#/projects', keys: ['projects'],
      lede: 'Work you have done and work in progress. Featured projects also show on the profile page and in your CV.',
      fields: [
        { k: 'projects', t: 'list', label: 'Projects', itemLabel: 'title', itemSub: 'status', idFrom: 'title', filter: true, addLabel: 'Add a project', newItem: { status: 'ongoing' }, item: [
          { row: [{ k: 'title', t: 'text', label: 'Project name' }, { k: 'client', t: 'text', label: 'Client or organisation' }] },
          { row: [{ k: 'status', t: 'select', label: 'Status', options: [['completed', 'Completed'], ['ongoing', 'Ongoing'], ['paused', 'Paused']] }, { k: 'statusNote', t: 'text', label: 'Status note', help: 'e.g. In daily use' }, { k: 'period', t: 'text', label: 'Period', help: 'e.g. 2024, or 2023 – present' }] },
          { row: [{ k: 'category', t: 'text', label: 'Type', suggest: projCats }, { k: 'cover', t: 'text', label: 'Cover word', help: 'Big word on the card when there is no image.' }] },
          { k: 'featured', t: 'bool', label: 'Feature on the profile page and CV' },
          { k: 'summary', t: 'textarea', rows: 2, label: 'Summary' },
          { k: 'features', t: 'lines', rows: 5, label: 'Scope: what it does or what you did', help: 'One point per line. Shown as a ticked list on the project page.' },
          { k: 'challenge', t: 'textarea', rows: 3, label: 'The challenge (optional)' },
          { k: 'approach', t: 'textarea', rows: 3, label: 'What you did (optional)' },
          { k: 'outcome', t: 'textarea', rows: 2, label: 'Outcome (optional)', help: 'Only add results you can back up.' },
          { k: 'role', t: 'text', label: 'Your role' },
          { k: 'stack', t: 'tags', label: 'Tools & methods' },
          { k: 'skills', t: 'tags', label: 'Skills used', suggest: skillNames },
          { k: 'services', t: 'picks', label: 'Related services', options: serviceOpts },
          { k: 'images', t: 'images', label: 'Screenshots or photos', max: 1600, help: 'The first image becomes the card cover.' },
          { k: 'links', t: 'list', label: 'Links', itemLabel: 'label', itemSub: 'url', addLabel: 'Add a link', item: link2('Label, e.g. Live site') },
          { k: 'id', t: 'slug', label: 'ID (used in the project link)' }
        ] }
      ] },
    { id: 'experience', label: 'Experience', route: '#/cv', keys: ['experience'],
      lede: 'Your roles, newest first. Durations are calculated from the start and end months.',
      fields: [
        { k: 'experience', t: 'list', label: 'Roles', itemLabel: 'role', itemSub: 'org', idFrom: 'role', addLabel: 'Add a role', item: [
          { row: [{ k: 'role', t: 'text', label: 'Job title' }, { k: 'org', t: 'text', label: 'Organisation' }] },
          { row: [{ k: 'location', t: 'text', label: 'Location' }, { k: 'type', t: 'text', label: 'Type', suggest: function () { return ['Full-time', 'Part-time', 'Contract', 'Remote', 'Internship', 'Volunteer']; } }] },
          { row: [{ k: 'start', t: 'month', label: 'Start', help: 'Format 2023-02' }, { k: 'end', t: 'month', label: 'End', help: 'Leave empty for your current role.' }] },
          { k: 'points', t: 'lines', rows: 6, label: 'What you did', help: 'One achievement or duty per line.' },
          { k: 'skills', t: 'tags', label: 'Skills used', suggest: skillNames },
          { k: 'id', t: 'slug', label: 'ID' }
        ] }
      ] },
    { id: 'education', label: 'Education', route: '#/cv', keys: ['education', 'certifications'],
      lede: 'Qualifications and certifications for your CV.',
      fields: [
        { k: 'education', t: 'list', label: 'Education', itemLabel: 'qualification', itemSub: 'institution', addLabel: 'Add a qualification', item: [
          { k: 'qualification', t: 'text', label: 'Qualification' },
          { row: [{ k: 'grade', t: 'text', label: 'Grade or honours' }, { k: 'period', t: 'text', label: 'Year(s)' }] },
          { row: [{ k: 'institution', t: 'text', label: 'Institution' }, { k: 'location', t: 'text', label: 'Location' }] },
          { k: 'details', t: 'lines', rows: 4, label: 'Relevant coursework', help: 'One per line.' }
        ] },
        { k: 'certifications', t: 'list', label: 'Certifications', itemLabel: 'name', itemSub: 'year', addLabel: 'Add a certification', item: [
          { k: 'name', t: 'text', label: 'Name' },
          { row: [{ k: 'issuer', t: 'text', label: 'Issuer' }, { k: 'year', t: 'text', label: 'Year' }] },
          { k: 'url', t: 'url', label: 'Verification link (optional)' }
        ] }
      ] },
    { id: 'rates', label: 'Rate card', route: '#/rates', keys: ['rates', 'settings.currency'],
      lede: 'Your prices in KES. Mark starting prices as "From". Visitors can add items to a quote request.',
      fields: [
        { k: 'rates.intro', t: 'textarea', rows: 2, label: 'Intro' },
        { row: [{ k: 'rates.updated', t: 'text', label: '"Updated" label', help: 'e.g. November 2026' }, { k: 'settings.currency.usdRate', t: 'number', label: 'KES per US dollar', help: 'For the approximate USD prices.' }] },
        { k: 'settings.currency.showUsdToggle', t: 'bool', label: 'Show the KES / USD switch' },
        { k: 'rates.categories', t: 'list', label: 'Categories', itemLabel: 'title', idFrom: 'title', addLabel: 'Add a category', item: [
          { row: [{ k: 'title', t: 'text', label: 'Category name' }, { k: 'id', t: 'slug', label: 'ID' }] },
          { k: 'blurb', t: 'text', label: 'Short description' },
          { k: 'items', t: 'list', label: 'Prices', itemLabel: 'name', itemSub: 'price', idFrom: 'name', addLabel: 'Add a price', newItem: { from: true, unit: 'one-off' }, item: [
            { k: 'name', t: 'text', label: 'Item name' },
            { row: [{ k: 'price', t: 'number', label: 'Price (KES)', help: 'Leave empty to show “On request”.' }, { k: 'unit', t: 'text', label: 'Unit', help: 'e.g. one-off, per month, per device' }, { k: 'turnaround', t: 'text', label: 'Turnaround' }] },
            { row: [{ k: 'from', t: 'bool', label: 'Starting price ("From")' }, { k: 'popular', t: 'bool', label: 'Popular (shown on profile)' }, { k: 'addon', t: 'bool', label: 'Add-on (ignored for service "from" prices)' }] },
            { k: 'service', t: 'select', label: 'Linked service', options: serviceOptsNone },
            { k: 'includes', t: 'lines', rows: 4, label: 'What’s included', help: 'One per line.' },
            { k: 'id', t: 'slug', label: 'ID' }
          ] }
        ] },
        { k: 'rates.terms', t: 'lines', rows: 6, label: 'Good to know (terms)', help: 'One per line. Check these match how you actually work.' }
      ] },
    { id: 'testimonials', label: 'Testimonials', route: '#/', keys: ['testimonials'],
      lede: 'Real quotes from clients or employers, shared with their permission. The section stays hidden until you add one.',
      fields: [
        { k: 'testimonials', t: 'list', label: 'Testimonials', itemLabel: 'name', itemSub: 'org', addLabel: 'Add a testimonial', item: [
          { k: 'quote', t: 'textarea', rows: 3, label: 'Quote' },
          { row: [{ k: 'name', t: 'text', label: 'Name' }, { k: 'role', t: 'text', label: 'Role' }, { k: 'org', t: 'text', label: 'Organisation' }] }
        ] }
      ] },
    { id: 'share', label: 'Share texts', route: '#/', keys: ['share'],
      lede: 'Captions the Share panel suggests when someone shares a page on WhatsApp, LinkedIn, X, Facebook or by email. The link is added automatically.',
      fields: [
        { k: 'share.profile', t: 'textarea', rows: 3, label: 'Full profile' },
        { k: 'share.cv', t: 'textarea', rows: 3, label: 'CV' },
        { k: 'share.rates', t: 'textarea', rows: 3, label: 'Rate card' },
        { k: 'share.quote', t: 'textarea', rows: 3, label: 'Quote form' },
        { k: 'share.projects', t: 'textarea', rows: 3, label: 'Projects' }
      ] },
    { id: 'settings', label: 'Settings', route: '#/', keys: ['settings.siteUrl', 'settings.accent', 'settings.defaultTheme', 'settings.form', 'settings.editor'],
      lede: 'Site address, colours, where quote requests go and how this editor saves.',
      fields: [
        { k: 'settings.siteUrl', t: 'url', label: 'Your site address', help: 'e.g. https://roynyamiaka.netlify.app or https://yourname.github.io/portfolio/. Used for share links, QR codes and social previews.' },
        { k: 'settings.accent', t: 'color', label: 'Accent colour', help: 'Text on and around the colour adjusts automatically to stay readable.' },
        { k: 'settings.defaultTheme', t: 'select', label: 'Default theme', options: [['auto', 'Follow the visitor’s device'], ['light', 'Light'], ['dark', 'Dark']] },
        { group: 'Quote form' },
        { k: 'settings.form.provider', t: 'select', label: 'Where quote requests go', rerender: true, options: [['netlify', 'Netlify Forms (only on Netlify)'], ['formsubmit', 'FormSubmit: emails you, no account needed'], ['web3forms', 'Web3Forms: emails you, needs a free access key'], ['formspree', 'Formspree: needs a form ID'], ['whatsapp', 'Open WhatsApp with the request filled in'], ['email', 'Open the visitor’s email app']] },
        { k: 'settings.form.email', t: 'email', label: 'Send requests to this email', showIf: function () { return provider() === 'formsubmit'; }, help: 'The first request triggers a one-time "Activate form" email from FormSubmit. Click it, and requests arrive from then on.' },
        { k: 'settings.form.web3formsKey', t: 'text', label: 'Web3Forms access key', showIf: function () { return provider() === 'web3forms'; }, help: 'Get a free key at web3forms.com by entering your email.' },
        { k: 'settings.form.formspreeId', t: 'text', label: 'Formspree form ID', showIf: function () { return provider() === 'formspree'; }, help: 'The part after formspree.io/f/' },
        { k: 'settings.form.netlifyFormName', t: 'text', label: 'Netlify form name', showIf: function () { return provider() === 'netlify'; }, help: 'Keep "quote" unless you renamed the hidden form in index.html.' },
        { k: 'settings.form.subject', t: 'text', label: 'Email subject for new requests' },
        { group: 'Editor' },
        { k: 'settings.editor.mode', t: 'select', label: 'How this editor saves', rerender: true, options: [['github', 'Commit straight to GitHub'], ['download', 'Download files (Netlify and other hosts)']] },
        { row: [{ k: 'settings.editor.owner', t: 'text', label: 'GitHub username' }, { k: 'settings.editor.repo', t: 'text', label: 'Repository name' }, { k: 'settings.editor.branch', t: 'text', label: 'Branch' }] }
      ] },
    { id: 'json', label: 'Raw JSON', special: true, route: '#/' },
    { id: 'publish', label: 'Save & publish', special: true, route: '#/' }
  ];
  function section(id) { for (var i = 0; i < SECTIONS.length; i++) if (SECTIONS[i].id === id) return SECTIONS[i]; return SECTIONS[0]; }

  /* =========================================================
     FIELD RENDERING
     ========================================================= */
  function fid(path) { return 'f-' + String(path).replace(/[^a-zA-Z0-9]+/g, '-'); }
  function wrapField(inner, cls) { return '<div class="ed-field' + (cls ? ' ' + cls : '') + '">' + inner + '</div>'; }
  function opts(f) { return typeof f.options === 'function' ? f.options() : (f.options || []); }
  function previewSrc(p) { return pending[p] ? pending[p].url : p; }

  function fieldHtml(f, base) {
    if (f.group) return '<h2 class="ed-group">' + esc(f.group) + '</h2>';
    if (f.row) return '<div class="ed-row">' + f.row.map(function (x) { return fieldHtml(x, base); }).join('') + '</div>';
    if (f.showIf && !f.showIf()) return '';
    var path = base ? base + '.' + f.k : f.k;
    var id = fid(path);
    var v = RN.getPath(draft, path);
    var helpId = id + '-h';
    var help = f.help ? '<span class="ed-help" id="' + helpId + '">' + esc(f.help) + '</span>' : '';
    var desc = f.help ? ' aria-describedby="' + helpId + '"' : '';
    var label = '<label for="' + id + '">' + esc(f.label) + (f.req ? ' <span class="ed-req" aria-hidden="true">*</span>' : '') + '</label>';
    var common = ' id="' + id + '" data-path="' + esc(path) + '" data-type="' + f.t + '"' + desc + (f.req ? ' required' : '') + (f.rerender ? ' data-rerender="1"' : '');
    var dl = '';
    if (f.suggest) dl = '<datalist id="dl-' + id + '">' + f.suggest().map(function (o) { return '<option value="' + esc(o) + '">'; }).join('') + '</datalist>';
    switch (f.t) {
      case 'text': case 'email': case 'url': case 'tel': case 'slug': case 'month':
        var type = { email: 'email', url: 'url', tel: 'tel' }[f.t] || 'text';
        return wrapField(label + '<input class="ed-input' + (f.t === 'slug' || f.t === 'month' ? ' ed-input--mono' : '') + '" type="' + type + '"' + common +
          (f.suggest ? ' list="dl-' + id + '"' : '') + (f.t === 'month' ? ' placeholder="YYYY-MM" inputmode="numeric"' : '') + (f.t === 'url' ? ' placeholder="https://"' : '') +
          ' value="' + esc(v == null ? '' : v) + '" autocomplete="off">' + dl + help);
      case 'number':
        return wrapField(label + '<input class="ed-input" type="number" min="0" step="any" inputmode="decimal"' + common + ' value="' + esc(v == null ? '' : v) + '">' + help);
      case 'textarea':
        return wrapField(label + '<textarea class="ed-textarea" rows="' + (f.rows || 3) + '"' + common + '>' + esc(v || '') + '</textarea>' + help);
      case 'lines':
        return wrapField(label + '<textarea class="ed-textarea" rows="' + (f.rows || 4) + '"' + common + '>' + esc(arr(v).join('\n')) + '</textarea>' + help);
      case 'paras':
        return wrapField(label + '<textarea class="ed-textarea" rows="' + (f.rows || 8) + '"' + common + '>' + esc(arr(v).join('\n\n')) + '</textarea>' + help);
      case 'select':
        var o = opts(f).slice();
        if (v != null && v !== '' && !o.some(function (x) { return x[0] === v; })) o.push([v, v + ' (missing)']);
        return wrapField(label + '<select class="ed-select"' + common + '>' + o.map(function (x) { return '<option value="' + esc(x[0]) + '"' + (x[0] === (v == null ? '' : v) ? ' selected' : '') + '>' + esc(x[1]) + '</option>'; }).join('') + '</select>' + help);
      case 'bool':
        return wrapField('<label class="ed-check"><input type="checkbox"' + common + (v ? ' checked' : '') + '> ' + esc(f.label) + '</label>' + help);
      case 'color':
        var hex = RN.isHex(v) ? RN.rgbToHex(RN.hexToRgb(v)) : '#3E6B52';
        var sw = ['#3E6B52', '#0F766E', '#2F5D7E', '#3F5A8C', '#6B4E71', '#9A5638', '#8A6A1F', '#2B2723'];
        return wrapField(label + '<div class="ed-color"><input type="color" value="' + esc(hex) + '" data-path="' + esc(path) + '" data-type="color" aria-label="Pick a colour">' +
          '<input class="ed-input" type="text"' + common + ' value="' + esc(v || '') + '" maxlength="7"><div class="ed-swatches" role="group" aria-label="Suggested colours">' +
          sw.map(function (c) { return '<button type="button" style="background:' + c + '" data-act="swatch" data-path="' + esc(path) + '" data-color="' + c + '" aria-label="Use ' + c + '"></button>'; }).join('') + '</div></div>' + help);
      case 'tags':
        return tagsHtml(f, path, v, id, help, dl);
      case 'picks':
        var picked = arr(v);
        return wrapField('<span class="ed-label" id="' + id + '-l">' + esc(f.label) + '</span><div class="ed-picks" role="group" aria-labelledby="' + id + '-l" data-picks="' + esc(path) + '">' +
          opts(f).map(function (x) { return '<label><input type="checkbox" value="' + esc(x[0]) + '"' + (picked.indexOf(x[0]) >= 0 ? ' checked' : '') + ' data-pick="' + esc(path) + '"> ' + esc(x[1]) + '</label>'; }).join('') + '</div>' + help);
      case 'image':
        return wrapField('<span class="ed-label">' + esc(f.label) + '</span><div class="ed-img">' +
          (v ? '<img class="ed-img__thumb" src="' + esc(previewSrc(v)) + '" alt="">' : '<div class="ed-img__thumb ed-img__thumb--empty">No image</div>') +
          '<div class="ed-img__side"><label class="sr-only" for="' + id + '">' + esc(f.label) + ' path</label><input class="ed-input ed-input--mono" type="text"' + common + ' value="' + esc(v || '') + '" placeholder="assets/uploads/photo.webp">' +
          '<div class="ed-img__btns"><span class="ed-btn ed-btn--sm ed-file">Upload image<input type="file" accept="image/*" data-upload="' + esc(path) + '" data-max="' + (f.max || 1600) + '" data-dir="' + esc(f.dir || 'assets/uploads') + '" aria-label="Upload ' + esc(f.label) + '"></span>' +
          (v ? '<button type="button" class="ed-btn ed-btn--sm ed-btn--danger" data-act="clear" data-path="' + esc(path) + '">Remove</button>' : '') + '</div>' +
          (pending[v] ? '<span class="ed-pending">New upload: saved when you publish</span>' : '') + help + '</div></div>');
      case 'file':
        return wrapField('<span class="ed-label">' + esc(f.label) + '</span><div class="ed-img__side"><label class="sr-only" for="' + id + '">' + esc(f.label) + ' path</label><input class="ed-input ed-input--mono" type="text"' + common + ' value="' + esc(v || '') + '" placeholder="assets/docs/cv.pdf">' +
          '<div class="ed-img__btns"><span class="ed-btn ed-btn--sm ed-file">Upload file<input type="file" accept="' + esc(f.accept || '*/*') + '" data-upload="' + esc(path) + '" data-dir="' + esc(f.dir || 'assets/uploads') + '" aria-label="Upload ' + esc(f.label) + '"></span>' +
          (v ? '<a class="ed-btn ed-btn--sm" href="' + esc(previewSrc(v)) + '" target="_blank" rel="noopener">Open</a><button type="button" class="ed-btn ed-btn--sm ed-btn--danger" data-act="clear" data-path="' + esc(path) + '">Remove</button>' : '') + '</div>' +
          (pending[v] ? '<span class="ed-pending">New upload: saved when you publish</span>' : '') + help + '</div>');
      case 'images':
        var list = arr(v);
        return wrapField('<span class="ed-label">' + esc(f.label) + '</span><div class="ed-gallery">' + list.map(function (p, i) {
          return '<div class="ed-gallery__item"><img src="' + esc(previewSrc(p)) + '" alt="Image ' + (i + 1) + '"><div>' +
            '<button type="button" class="ed-icon" data-act="img-left" data-path="' + esc(path) + '" data-i="' + i + '" aria-label="Move image ' + (i + 1) + ' left"' + (i === 0 ? ' disabled' : '') + '>←</button>' +
            '<button type="button" class="ed-icon" data-act="img-right" data-path="' + esc(path) + '" data-i="' + i + '" aria-label="Move image ' + (i + 1) + ' right"' + (i === list.length - 1 ? ' disabled' : '') + '>→</button>' +
            '<button type="button" class="ed-icon ed-icon--danger" data-act="img-del" data-path="' + esc(path) + '" data-i="' + i + '" aria-label="Remove image ' + (i + 1) + '">✕</button></div>' +
            (pending[p] ? '<span class="ed-pending">New</span>' : '') + '</div>';
        }).join('') + '<span class="ed-btn ed-btn--sm ed-file" style="align-self:center">+ Add image<input type="file" accept="image/*" data-upload="' + esc(path) + '" data-mode="append" data-max="' + (f.max || 1600) + '" data-dir="' + esc(f.dir || 'assets/uploads') + '" aria-label="Add an image to ' + esc(f.label) + '"></span></div>' + help);
      case 'list':
        return listHtml(f, path);
    }
    return '';
  }
  function tagsHtml(f, path, v, id, help, dl) {
    var known = f.suggest === skillNames;
    var names = known ? skillNames().map(function (s) { return s.toLowerCase(); }) : null;
    return wrapField('<span class="ed-label" id="' + id + '-l">' + esc(f.label) + '</span><div class="ed-tags" data-tags="' + esc(path) + '"' + (known ? ' data-known="skills"' : '') + '>' +
      arr(v).map(function (t, i) { return tagChip(path, t, i, names); }).join('') +
      '<input type="text" data-tag-input="' + esc(path) + '" aria-labelledby="' + id + '-l"' + (f.help ? ' aria-describedby="' + id + '-h"' : '') + ' placeholder="Type, then press Enter"' + (f.suggest ? ' list="dl-' + id + '"' : '') + ' autocomplete="off"></div>' + dl + help);
  }
  function tagChip(path, t, i, names) {
    var unknown = names && names.indexOf(String(t).toLowerCase()) < 0;
    return '<span class="ed-tag' + (unknown ? ' is-unknown' : '') + '"' + (unknown ? ' title="Not in your Skills list"' : '') + '>' + esc(t) +
      '<button type="button" data-act="tag-del" data-path="' + esc(path) + '" data-i="' + i + '" aria-label="Remove ' + esc(t) + '">×</button></span>';
  }
  function listHtml(f, path) {
    var list = RN.getPath(draft, path);
    if (!Array.isArray(list)) { list = []; RN.setPath(draft, path, list); }
    lists[path] = f;
    var head = '<div class="ed-list__head"><h3>' + esc(f.label) + '</h3><span class="ed-count">' + list.length + '</span>' +
      (f.filter && list.length > 6 ? '<input class="ed-list__filter" type="search" placeholder="Filter…" data-filter-list="' + esc(path) + '" aria-label="Filter ' + esc(f.label) + '">' : '') + '</div>';
    var items = list.map(function (item, i) { return itemHtml(f, path, item, i, list.length); }).join('');
    return '<div class="ed-list" data-list="' + esc(path) + '">' + head + (f.help ? '<p class="ed-help" style="margin:-2px 0 10px">' + esc(f.help) + '</p>' : '') +
      (items || '<div class="ed-empty">Nothing here yet.</div>') +
      '<button type="button" class="ed-btn ed-add" data-act="add" data-path="' + esc(path) + '">+ ' + esc(f.addLabel || 'Add') + '</button></div>';
  }
  function itemTitle(f, item) {
    var label = item && item[f.itemLabel];
    var sub = '';
    if (f.itemSub && item) {
      var s = item[f.itemSub];
      if (f.itemSub === 'price') sub = s === '' || s == null ? 'On request' : RN.money(s, 'KES');
      else if (f.itemSub === 'status') sub = { completed: 'Completed', ongoing: 'Ongoing', paused: 'Paused' }[s] || s || '';
      else if (f.itemSub === 'group') { var g = (draft.serviceGroups || []).filter(function (x) { return x.id === s; })[0]; sub = g ? g.title : s || ''; }
      else sub = s || '';
    }
    return esc(label || '(untitled)') + (sub ? '<small>' + esc(sub) + '</small>' : '');
  }
  function itemHtml(f, path, item, i, n) {
    var ip = path + '.' + i;
    var open = !!openItems[ip];
    var name = esc((item && item[f.itemLabel]) || 'item ' + (i + 1));
    return '<details class="ed-item" data-item="' + esc(ip) + '"' + (open ? ' open' : '') + '>' +
      '<summary><span class="ed-item__title" data-title-of="' + esc(ip) + '">' + itemTitle(f, item) + '</span><span class="ed-item__actions">' +
      '<button type="button" class="ed-icon" data-act="up" data-path="' + esc(ip) + '" aria-label="Move ' + name + ' up"' + (i === 0 ? ' disabled' : '') + '>↑</button>' +
      '<button type="button" class="ed-icon" data-act="down" data-path="' + esc(ip) + '" aria-label="Move ' + name + ' down"' + (i === n - 1 ? ' disabled' : '') + '>↓</button>' +
      '<button type="button" class="ed-icon" data-act="dup" data-path="' + esc(ip) + '" aria-label="Duplicate ' + name + '">⧉</button>' +
      '<button type="button" class="ed-icon ed-icon--danger" data-act="del" data-path="' + esc(ip) + '" aria-label="Delete ' + name + '">✕</button>' +
      '</span></summary><div class="ed-item__body">' + (open ? f.item.map(function (x) { return fieldHtml(x, ip); }).join('') : '') + '</div></details>';
  }
  function defaults(fields, extra) {
    var o = {};
    (function walk(list) {
      list.forEach(function (f) {
        if (f.row) return walk(f.row);
        if (f.group || !f.k) return;
        var d = '';
        if (['tags', 'lines', 'paras', 'picks', 'images', 'list'].indexOf(f.t) >= 0) d = [];
        else if (f.t === 'bool') d = false;
        else if (f.t === 'select') { var o2 = opts(f); d = o2.length ? o2[0][0] : ''; }
        o[f.k] = d;
      });
    })(fields);
    return Object.assign(o, extra || {});
  }
  function uniqueId(list, base, self) {
    var id = RN.slugify(base) || 'item', n = 2, out = id;
    while (list.some(function (x) { return x !== self && x.id === out; })) out = id + '-' + (n++);
    return out;
  }
  /* Give every list item that needs an ID one, based on its title. */
  function ensureIds() {
    SECTIONS.forEach(function (s) {
      (function walk(fields, base) {
        (fields || []).forEach(function (f) {
          if (f.row) return walk(f.row, base);
          if (f.t !== 'list') return;
          var path = base ? base + '.' + f.k : f.k;
          var list = RN.getPath(draft, path);
          if (!Array.isArray(list)) return;
          list.forEach(function (item, i) {
            if (f.idFrom && item && !item.id) item.id = uniqueId(list, item[f.idFrom] || 'item', item);
            walk(f.item, path + '.' + i);
          });
        });
      })(s.fields, '');
    });
  }

  /* =========================================================
     SECTIONS & NAV
     ========================================================= */
  function sectionChanged(s) {
    if (!s.keys) return false;
    return s.keys.some(function (k) { return JSON.stringify(RN.getPath(draft, k)) !== JSON.stringify(RN.getPath(original, k)); });
  }
  function changedLabels() { return SECTIONS.filter(function (s) { return !s.special && sectionChanged(s); }).map(function (s) { return s.label; }); }
  function counts(s) {
    var map = { services: draft.services, skills: draft.skills, projects: draft.projects, experience: draft.experience, education: (draft.education || []).concat(draft.certifications || []), testimonials: draft.testimonials, rates: RN.rateItems(draft) };
    var v = map[s.id];
    return Array.isArray(v) ? v.length : '';
  }
  function renderNav() {
    nav.innerHTML = SECTIONS.map(function (s, i) {
      var sep = s.id === 'json' ? '<hr>' : '';
      var ch = sectionChanged(s);
      return sep + '<a href="#' + s.id + '" data-sec="' + s.id + '"' + (s.id === current ? ' aria-current="page"' : '') + '><span>' + esc(s.label) + '</span>' +
        (ch ? '<span class="ed-nav__dot" title="Unsaved changes"></span>' : (counts(s) !== '' ? '<small>' + counts(s) + '</small>' : '')) + '</a>';
    }).join('');
  }
  function renderSection(keepScroll) {
    var s = section(current);
    var y = keepScroll ? (main.scrollTop || 0) : 0, wy = keepScroll ? window.scrollY : 0;
    lists = {};
    var html = '';
    if (s.id === 'publish') html = publishHtml();
    else if (s.id === 'json') html = jsonHtml();
    else {
      html = draftBanner() + '<h1 class="ed-h1">' + esc(s.label) + '</h1><p class="ed-lede">' + esc(s.lede || '') + '</p>' +
        s.fields.map(function (f) { return fieldHtml(f, ''); }).join('');
    }
    main.innerHTML = html;
    if (keepScroll) { main.scrollTop = y; window.scrollTo(0, wy); }
    else { main.scrollTop = 0; window.scrollTo(0, 0); }
  }
  function go(id, opts2) {
    current = section(id).id;
    if (location.hash.slice(1) !== current) history.replaceState(null, '', '#' + current);
    renderNav();
    renderSection(false);
    if (!opts2 || !opts2.keepFocus) main.focus({ preventScroll: true });
    navigatePreview();
  }

  /* =========================================================
     STATE CHANGES
     ========================================================= */
  function flushDraft() {
    if (!draft || !original) return;
    clearTimeout(touch.t);
    dirty = JSON.stringify(draft) !== JSON.stringify(original) || Object.keys(pending).length > 0;
    if (dirty) LS.set('draft', { content: draft, at: Date.now() });
  }
  function touch(immediate) {
    dirty = true;
    setStatus('Unsaved changes', true);
    clearTimeout(touch.t);
    touch.t = setTimeout(function () {
      dirty = JSON.stringify(draft) !== JSON.stringify(original) || Object.keys(pending).length > 0;
      setStatus(dirty ? 'Unsaved changes' : 'All changes saved', dirty);
      if (dirty) { if (!LS.set('draft', { content: draft, at: Date.now() })) { /* storage full: ignore */ } } else LS.del('draft');
      sendPreview();
      renderNav();
    }, immediate ? 0 : 350);
  }
  function setStatus(text, isDirty) {
    statusEl.textContent = text;
    statusEl.classList.toggle('is-dirty', !!isDirty);
  }
  function parentList(path) {
    var parts = path.split('.');
    for (var i = parts.length - 1; i >= 0; i--) {
      if (/^\d+$/.test(parts[i])) return { list: parts.slice(0, i).join('.'), item: parts.slice(0, i + 1).join('.'), key: parts.slice(i + 1).join('.') };
    }
    return null;
  }
  function readValue(el) {
    var t = el.getAttribute('data-type'), v = el.value;
    if (t === 'number') return v === '' ? '' : Number(v);
    if (t === 'bool') return el.checked;
    if (t === 'lines') return v.split('\n').map(function (s) { return s.trim(); }).filter(Boolean);
    if (t === 'paras') return v.split(/\n\s*\n/).map(function (s) { return s.replace(/\s*\n\s*/g, ' ').trim(); }).filter(Boolean);
    if (t === 'color') return v.trim().toUpperCase();
    if (t === 'month') return v.trim();
    return v;
  }
  function onInput(ev) {
    var el = ev.target;
    if (el.hasAttribute('data-filter-list')) return filterList(el);
    if (el.hasAttribute('data-tag-input')) {
      // A suggestion picked from the list is added straight away.
      if ((ev.inputType === 'insertReplacementText' || !ev.inputType) && el.list) {
        var match = Array.prototype.some.call(el.list.options, function (o) { return o.value === el.value; });
        if (match) addTag(el);
      }
      return;
    }
    var path = el.getAttribute('data-path');
    if (!path) return;
    var v = readValue(el);
    RN.setPath(draft, path, v);
    if (el.getAttribute('data-type') === 'color') {
      document.querySelectorAll('[data-path="' + cssEsc(path) + '"]').forEach(function (o) { if (o !== el) o.value = o.type === 'color' ? (RN.isHex(v) ? RN.rgbToHex(RN.hexToRgb(v)) : o.value) : v; });
      var mark = document.getElementById('ed-mark'); if (mark && RN.isHex(v)) applyAccent(v);
    }
    var pl = parentList(path);
    if (pl && lists[pl.list]) {
      var f = lists[pl.list];
      if (pl.key === f.itemLabel || pl.key === f.itemSub) {
        var t = document.querySelector('[data-title-of="' + cssEsc(pl.item) + '"]');
        if (t) t.innerHTML = itemTitle(f, RN.getPath(draft, pl.item));
      }
    }
    touch();
  }
  function onChange(ev) {
    var el = ev.target;
    if (el.hasAttribute('data-upload')) return onUpload(el);
    if (el.hasAttribute('data-pick')) {
      var p = el.getAttribute('data-pick');
      var vals = Array.prototype.map.call(document.querySelectorAll('[data-pick="' + cssEsc(p) + '"]:checked'), function (x) { return x.value; });
      RN.setPath(draft, p, vals); touch(); return;
    }
    if (el.id === 'gh-token' || el.id === 'gh-remember') return saveToken();
    var path = el.getAttribute('data-path');
    if (!path) return;
    var type = el.getAttribute('data-type');
    if (type === 'select' || type === 'bool' || type === 'color') { RN.setPath(draft, path, readValue(el)); touch(); }
    if (type === 'slug') { var s = RN.slugify(el.value); el.value = s; RN.setPath(draft, path, s); touch(); }
    // Fill an empty ID from the title the first time it is typed.
    var pl = parentList(path);
    if (pl && lists[pl.list] && lists[pl.list].idFrom === pl.key) {
      var item = RN.getPath(draft, pl.item);
      if (item && !item.id && item[pl.key]) {
        item.id = uniqueId(RN.getPath(draft, pl.list), item[pl.key], item);
        var idEl = document.querySelector('[data-path="' + cssEsc(pl.item + '.id') + '"]');
        if (idEl) idEl.value = item.id;
        touch();
      }
    }
    if (el.hasAttribute('data-rerender')) { renderSection(true); updateMode(); }
    if (path === 'settings.editor.owner' || path === 'settings.editor.repo' || path === 'settings.editor.branch') updateMode();
  }
  function cssEsc(s) { return window.CSS && CSS.escape ? CSS.escape(s) : String(s).replace(/"/g, '\\"'); }
  function filterList(input) {
    var q = input.value.trim().toLowerCase();
    var box = input.closest('.ed-list');
    box.querySelectorAll(':scope > .ed-item').forEach(function (d) {
      var t = (d.querySelector('.ed-item__title') || {}).textContent || '';
      d.hidden = q && t.toLowerCase().indexOf(q) < 0;
    });
  }
  function addTag(input) {
    var path = input.getAttribute('data-tag-input');
    var val = input.value.trim();
    if (!val) return;
    var list = arr(RN.getPath(draft, path)).slice();
    if (!list.some(function (x) { return String(x).toLowerCase() === val.toLowerCase(); })) list.push(val);
    RN.setPath(draft, path, list);
    input.value = '';
    refreshTags(input.closest('.ed-tags'));
    input.focus();
    touch();
  }
  function refreshTags(box) {
    var path = box.getAttribute('data-tags');
    var names = box.getAttribute('data-known') === 'skills' ? skillNames().map(function (s) { return s.toLowerCase(); }) : null;
    var input = box.querySelector('input');
    box.querySelectorAll('.ed-tag').forEach(function (n) { n.remove(); });
    var tmp = document.createElement('div');
    tmp.innerHTML = arr(RN.getPath(draft, path)).map(function (t, i) { return tagChip(path, t, i, names); }).join('');
    while (tmp.firstChild) box.insertBefore(tmp.firstChild, input);
  }
  function onKeydown(ev) {
    var el = ev.target;
    if ((ev.ctrlKey || ev.metaKey) && ev.key.toLowerCase() === 's') {
      ev.preventDefault();
      if (mode() === 'github' && ghReady()) { go('publish'); ghSave(); } else go('publish');
      return;
    }
    if (el.hasAttribute && el.hasAttribute('data-tag-input')) {
      if (ev.key === 'Enter') { ev.preventDefault(); addTag(el); }
      else if (ev.key === 'Backspace' && !el.value) {
        var path = el.getAttribute('data-tag-input');
        var list = arr(RN.getPath(draft, path)).slice();
        if (list.length) { list.pop(); RN.setPath(draft, path, list); refreshTags(el.closest('.ed-tags')); touch(); }
      }
    }
  }
  function onToggle(ev) {
    var d = ev.target;
    if (!d.classList || !d.classList.contains('ed-item')) return;
    var ip = d.getAttribute('data-item');
    if (d.open) {
      openItems[ip] = true;
      var body = d.querySelector(':scope > .ed-item__body');
      if (body && !body.innerHTML) {
        var pl = parentList(ip + '.x');
        var f = lists[pl.list];
        if (f) body.innerHTML = f.item.map(function (x) { return fieldHtml(x, ip); }).join('');
      }
    } else delete openItems[ip];
  }
  function moveOpen(fromPath, toPath) {
    var a = !!openItems[fromPath], b = !!openItems[toPath];
    if (b) openItems[fromPath] = true; else delete openItems[fromPath];
    if (a) openItems[toPath] = true; else delete openItems[toPath];
  }
  function onClick(ev) {
    var navLink = ev.target.closest('[data-sec]');
    if (navLink) { ev.preventDefault(); go(navLink.getAttribute('data-sec')); return; }
    var b = ev.target.closest('[data-act]');
    if (!b) return;
    var act = b.getAttribute('data-act');
    var path = b.getAttribute('data-path');
    if (b.closest('summary')) ev.preventDefault();
    var pl, list, idx, item;
    switch (act) {
      case 'add':
        list = RN.getPath(draft, path);
        var f = lists[path];
        if (!f) return;
        item = defaults(f.item, f.newItem);
        list.push(item);
        openItems[path + '.' + (list.length - 1)] = true;
        renderSection(true); touch();
        var nd = document.querySelector('[data-item="' + cssEsc(path + '.' + (list.length - 1)) + '"] input, [data-item="' + cssEsc(path + '.' + (list.length - 1)) + '"] textarea');
        if (nd) { nd.focus(); nd.scrollIntoView({ block: 'center' }); }
        break;
      case 'up': case 'down': case 'dup': case 'del':
        pl = parentList(path + '.x');
        list = RN.getPath(draft, pl.list);
        idx = +path.split('.').pop();
        if (act === 'up' && idx > 0) { list.splice(idx - 1, 0, list.splice(idx, 1)[0]); moveOpen(pl.list + '.' + idx, pl.list + '.' + (idx - 1)); }
        if (act === 'down' && idx < list.length - 1) { list.splice(idx + 1, 0, list.splice(idx, 1)[0]); moveOpen(pl.list + '.' + idx, pl.list + '.' + (idx + 1)); }
        if (act === 'dup') {
          item = clone(list[idx]);
          var lf = lists[pl.list];
          if (lf && lf.itemLabel && item[lf.itemLabel]) item[lf.itemLabel] += ' (copy)';
          if ('id' in item) item.id = uniqueId(list, (item.id || 'item') + '-copy', item);
          list.splice(idx + 1, 0, item);
          openItems[pl.list + '.' + (idx + 1)] = true;
        }
        if (act === 'del') {
          var gone = list.splice(idx, 1)[0];
          lastDeleted = { list: pl.list, index: idx, item: gone };
          Object.keys(openItems).forEach(function (k) { if (k.indexOf(pl.list + '.') === 0) delete openItems[k]; });
          var lf2 = lists[pl.list];
          toast('Deleted “' + ((lf2 && gone && gone[lf2.itemLabel]) || 'item') + '”', 'Undo', function () {
            var l = RN.getPath(draft, lastDeleted.list);
            l.splice(lastDeleted.index, 0, lastDeleted.item);
            lastDeleted = null; renderSection(true); touch();
          });
        }
        renderSection(true); touch();
        var mv = act === 'up' ? idx - 1 : act === 'down' ? idx + 1 : idx;
        var again = document.querySelector('[data-path="' + cssEsc(pl.list + '.' + mv) + '"][data-act="' + act + '"]');
        if (again && !again.disabled) again.focus(); else { var any = document.querySelector('[data-path="' + cssEsc(pl.list + '.' + mv) + '"][data-act]'); if (any) any.focus(); }
        break;
      case 'tag-del':
        list = arr(RN.getPath(draft, path)).slice();
        list.splice(+b.getAttribute('data-i'), 1);
        RN.setPath(draft, path, list);
        var box = b.closest('.ed-tags');
        refreshTags(box); box.querySelector('input').focus(); touch();
        break;
      case 'clear': RN.setPath(draft, path, ''); renderSection(true); touch(); break;
      case 'swatch': RN.setPath(draft, path, b.getAttribute('data-color')); applyAccent(b.getAttribute('data-color')); renderSection(true); touch(); break;
      case 'img-left': case 'img-right': case 'img-del':
        list = arr(RN.getPath(draft, path)).slice(); idx = +b.getAttribute('data-i');
        if (act === 'img-del') list.splice(idx, 1);
        else { var to = act === 'img-left' ? idx - 1 : idx + 1; list.splice(to, 0, list.splice(idx, 1)[0]); }
        RN.setPath(draft, path, list); renderSection(true); touch();
        break;
      case 'toggle-preview': togglePreview(); break;
      case 'psize':
        document.querySelectorAll('[data-act="psize"]').forEach(function (x) { x.setAttribute('aria-pressed', x === b ? 'true' : 'false'); });
        document.getElementById('ed-frame-wrap').classList.toggle('is-phone', b.getAttribute('data-size') === 'phone');
        break;
      case 'go-publish': go('publish'); break;
      case 'go': go(b.getAttribute('data-to')); break;
      case 'restore-draft':
        var d0 = LS.get('draft', null);
        if (d0 && d0.content) { draft = d0.content; normalizeDraft(); renderSection(false); touch(true); toast('Your unsaved edits are back.'); }
        break;
      case 'discard-draft': LS.del('draft'); renderSection(true); toast('Old edits discarded.'); break;
      case 'discard-all':
        draft = clone(original); pending = {}; normalizeDraft(); applyAccent(draft.settings.accent); LS.del('draft'); renderSection(false); touch(true); toast('All unsaved changes discarded.');
        break;
      case 'json-apply': applyJson(); break;
      case 'json-format': var ta = document.getElementById('ed-json'); try { ta.value = JSON.stringify(JSON.parse(ta.value), null, 2); } catch (e) { jsonError(e); } break;
      case 'json-reset': document.getElementById('ed-json').value = JSON.stringify(draft, null, 2); document.getElementById('ed-json-msg').innerHTML = ''; break;
      case 'gh-connect': ghConnect(); break;
      case 'gh-load': ghLoad(false); break;
      case 'gh-save': forceOverwrite = false; ghSave(); break;
      case 'gh-force': forceOverwrite = true; ghSave(); break;
      case 'gh-forget': LS.del('gh-token'); SS.del('gh-token'); ghState = { ok: false, msg: 'Token removed from this browser.' }; renderSection(true); break;
      case 'dl-full': downloadFull(); break;
      case 'dl-changed': downloadChanged(); break;
      case 'dl-content': saveBlob(new Blob([buildContentFile()], { type: 'text/javascript' }), 'content.js'); toast('Downloaded content.js. Put it in your site’s data folder.'); break;
      case 'dl-backup': saveBlob(new Blob([JSON.stringify(draft, null, 2)], { type: 'application/json' }), 'portfolio-backup-' + today() + '.json'); break;
      case 'import': document.getElementById('ed-import').click(); break;
      case 'set-mode': RN.setPath(draft, 'settings.editor.mode', b.getAttribute('data-mode')); touch(); updateMode(); renderSection(true); break;
    }
  }

  /* =========================================================
     UPLOADS
     ========================================================= */
  function resizeImage(file, max) {
    return new Promise(function (res) {
      var img = new Image(), url = URL.createObjectURL(file);
      img.onload = function () {
        var s = Math.min(1, max / Math.max(img.naturalWidth, img.naturalHeight));
        var w = Math.max(1, Math.round(img.naturalWidth * s)), h = Math.max(1, Math.round(img.naturalHeight * s));
        var c = document.createElement('canvas'); c.width = w; c.height = h;
        var g = c.getContext('2d'); g.drawImage(img, 0, 0, w, h);
        URL.revokeObjectURL(url);
        c.toBlob(function (b) {
          if (b && b.type === 'image/webp') return res(b);
          g.globalCompositeOperation = 'destination-over'; g.fillStyle = '#fff'; g.fillRect(0, 0, w, h);
          c.toBlob(function (b2) { res(b2 || file); }, 'image/jpeg', 0.86);
        }, 'image/webp', 0.84);
      };
      img.onerror = function () { URL.revokeObjectURL(url); res(file); };
      img.src = url;
    });
  }
  function blobToBase64(blob) {
    return new Promise(function (res, rej) {
      var r = new FileReader();
      r.onload = function () { res(String(r.result).split(',')[1] || ''); };
      r.onerror = function () { rej(r.error); };
      r.readAsDataURL(blob);
    });
  }
  function onUpload(input) {
    var file = input.files && input.files[0];
    if (!file) return;
    if (file.size > 15 * 1024 * 1024) { toast('That file is over 15 MB. Please use a smaller one.'); input.value = ''; return; }
    var path = input.getAttribute('data-upload'), dir = input.getAttribute('data-dir') || 'assets/uploads';
    var max = +input.getAttribute('data-max') || 1600, append = input.getAttribute('data-mode') === 'append';
    setStatus('Preparing upload…', true);
    var resize = /^image\/(jpeg|png|webp)$/.test(file.type) ? resizeImage(file, max) : Promise.resolve(file);
    resize.then(function (blob) {
      var ext = blob.type === 'image/webp' ? 'webp' : blob.type === 'image/jpeg' ? 'jpg' : (file.name.split('.').pop() || 'bin').toLowerCase();
      var name = dir + '/' + (RN.slugify(file.name.replace(/\.[^.]+$/, '')) || 'file') + '-' + Date.now().toString(36) + '.' + ext;
      return blobToBase64(blob).then(function (b64) {
        pending[name] = { blob: blob, b64: b64, url: URL.createObjectURL(blob), type: blob.type };
        if (append) { var l = arr(RN.getPath(draft, path)).slice(); l.push(name); RN.setPath(draft, path, l); }
        else RN.setPath(draft, path, name);
        renderSection(true); touch();
        toast('Added. It is uploaded when you save.');
      });
    }).catch(function (e) { toast('Could not read that file: ' + e.message); });
  }

  /* =========================================================
     PREVIEW
     ========================================================= */
  function sendPreview(route) {
    if (!previewReady || !frame.contentWindow) return;
    var a = {};
    Object.keys(pending).forEach(function (k) { a[k] = pending[k].url; });
    try { frame.contentWindow.postMessage({ type: 'rn-preview', content: draft, assets: a, route: route || null }, location.origin); } catch (e) { /* frame not ready */ }
  }
  function navigatePreview() { sendPreview(section(current).route); }
  function startPreview() {
    var wide = window.matchMedia('(min-width: 1181px)').matches;
    document.getElementById('ed-preview-btn').setAttribute('aria-pressed', wide ? 'true' : 'false');
    frame.src = 'index.html?preview=1' + section(current).route;
  }
  function togglePreview() {
    var shell = document.getElementById('ed-shell');
    var wide = window.matchMedia('(min-width: 1181px)').matches;
    var on;
    if (wide) { shell.classList.toggle('no-preview'); on = !shell.classList.contains('no-preview'); }
    else { shell.classList.toggle('preview-open'); on = shell.classList.contains('preview-open'); }
    var btn = document.getElementById('ed-preview-btn');
    btn.setAttribute('aria-pressed', on ? 'true' : 'false');
    if (on) sendPreview(section(current).route);
  }
  window.addEventListener('message', function (ev) {
    if (ev.origin !== location.origin || !ev.data) return;
    if (ev.data.type === 'rn-preview-ready') { previewReady = true; sendPreview(section(current).route); }
  });

  /* =========================================================
     RAW JSON
     ========================================================= */
  function jsonHtml() {
    return '<h1 class="ed-h1">Raw JSON</h1><p class="ed-lede">Everything on your site as data. Useful for bulk edits or pasting a backup. Changes apply only when you click Apply.</p>' +
      '<div class="ed-img__btns" style="margin-bottom:10px"><button type="button" class="ed-btn ed-btn--ink" data-act="json-apply">Apply changes</button><button type="button" class="ed-btn" data-act="json-format">Tidy formatting</button><button type="button" class="ed-btn" data-act="json-reset">Reset to current</button></div>' +
      '<div id="ed-json-msg" role="alert"></div><label class="sr-only" for="ed-json">Content as JSON</label><textarea class="ed-json" id="ed-json" spellcheck="false">' + esc(JSON.stringify(draft, null, 2)) + '</textarea>';
  }
  function jsonError(e) {
    var msg = document.getElementById('ed-json-msg');
    var ta = document.getElementById('ed-json');
    var m = /position (\d+)/.exec(e.message), where = '';
    if (m && ta) {
      var pos = +m[1], before = ta.value.slice(0, pos);
      where = ' (line ' + (before.split('\n').length) + ')';
      ta.focus(); ta.setSelectionRange(pos, pos + 1);
    }
    msg.innerHTML = '<ul class="ed-issues"><li class="ed-issue"><span class="ed-badge">Error</span><span>That is not valid JSON' + esc(where) + ': ' + esc(e.message) + '</span></li></ul>';
  }
  function applyJson() {
    var ta = document.getElementById('ed-json');
    try {
      var obj = JSON.parse(ta.value);
      if (!obj || typeof obj !== 'object' || !obj.profile) throw new Error('The data must be an object with at least a "profile" section.');
      draft = obj; normalizeDraft(); applyAccent(draft.settings.accent); touch(true); renderNav();
      document.getElementById('ed-json-msg').innerHTML = '<div class="ed-ok">Applied. Check the preview, then save.</div>';
    } catch (e) { jsonError(e); }
  }

  /* =========================================================
     GITHUB
     ========================================================= */
  function mode() { return (draft.settings.editor && draft.settings.editor.mode) === 'download' ? 'download' : 'github'; }
  function ghCfg() {
    var e2 = draft.settings.editor || {};
    return { owner: String(e2.owner || '').trim(), repo: String(e2.repo || '').trim(), branch: String(e2.branch || 'main').trim() || 'main', token: SS.get('gh-token', null) || LS.get('gh-token', null) || '' };
  }
  function ghReady() { var c = ghCfg(); return !!(c.owner && c.repo && c.token); }
  function saveToken() {
    var t = document.getElementById('gh-token'), r = document.getElementById('gh-remember');
    if (!t) return;
    var val = t.value.trim();
    LS.del('gh-token'); SS.del('gh-token');
    if (val) { if (r && r.checked) LS.set('gh-token', val); else SS.set('gh-token', val); }
  }
  function ghMessage(status, j) {
    var m = (j && j.message) || '';
    if (status === 401) return 'GitHub did not accept the token. It may be mistyped or expired. Create a new one and paste it again.';
    if (status === 403) return 'This token is not allowed to do that. It needs "Contents: Read and write" access to this repository. (' + m + ')';
    if (status === 404) return 'Not found. Check the username, repository and branch, and that the token was given access to this repository.';
    if (status === 409) return 'GitHub reported a conflict: ' + m + '. If the repository is empty, upload the site files once first (see README).';
    if (status === 422) return 'GitHub rejected the request: ' + m;
    return 'GitHub error ' + status + (m ? ': ' + m : '');
  }
  function gh(path, opts2) {
    var c = ghCfg();
    opts2 = opts2 || {};
    return fetch('https://api.github.com' + path, {
      method: opts2.method || 'GET',
      headers: { Authorization: 'Bearer ' + c.token, Accept: 'application/vnd.github+json', 'X-GitHub-Api-Version': '2022-11-28', 'Content-Type': 'application/json' },
      body: opts2.body ? JSON.stringify(opts2.body) : undefined,
      cache: 'no-store'
    }).then(function (r) {
      return r.text().then(function (t) {
        var j = {}; try { j = t ? JSON.parse(t) : {}; } catch (e) { j = {}; }
        if (!r.ok) { var err = new Error(ghMessage(r.status, j)); err.status = r.status; throw err; }
        return j;
      });
    }, function () { throw new Error('Could not reach GitHub. Check your internet connection.'); });
  }
  function repoPath() { var c = ghCfg(); return '/repos/' + encodeURIComponent(c.owner) + '/' + encodeURIComponent(c.repo); }
  function b64ToText(b64) {
    var bin = atob(String(b64 || '').replace(/\s/g, ''));
    var bytes = new Uint8Array(bin.length);
    for (var i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    return new TextDecoder().decode(bytes);
  }
  function ghGetFile(path) {
    var c = ghCfg();
    return gh(repoPath() + '/contents/' + path.split('/').map(encodeURIComponent).join('/') + '?ref=' + encodeURIComponent(c.branch)).then(function (j) {
      return { sha: j.sha, text: b64ToText(j.content) };
    });
  }
  function ghCommit(files, message) {
    var c = ghCfg(), rp = repoPath(), headSha, baseTree;
    return gh(rp + '/git/ref/heads/' + c.branch).then(function (ref) {
      headSha = ref.object.sha;
      return gh(rp + '/git/commits/' + headSha);
    }).then(function (commit) {
      baseTree = commit.tree.sha;
      var chain = Promise.resolve([]);
      files.forEach(function (f) {
        chain = chain.then(function (tree) {
          if (f.base64 == null) { tree.push({ path: f.path, mode: '100644', type: 'blob', content: f.text }); return tree; }
          return gh(rp + '/git/blobs', { method: 'POST', body: { content: f.base64, encoding: 'base64' } }).then(function (b) {
            tree.push({ path: f.path, mode: '100644', type: 'blob', sha: b.sha }); return tree;
          });
        });
      });
      return chain;
    }).then(function (tree) {
      return gh(rp + '/git/trees', { method: 'POST', body: { base_tree: baseTree, tree: tree } });
    }).then(function (newTree) {
      if (newTree.sha === baseTree) return { unchanged: true };
      return gh(rp + '/git/commits', { method: 'POST', body: { message: message, tree: newTree.sha, parents: [headSha] } }).then(function (cm) {
        return gh(rp + '/git/refs/heads/' + c.branch, { method: 'PATCH', body: { sha: cm.sha } }).then(function () { return { sha: cm.sha, url: cm.html_url }; });
      });
    });
  }
  function log(msg) {
    var el = document.getElementById('ed-log');
    if (!el) return;
    el.hidden = false;
    el.textContent += (el.textContent ? '\n' : '') + msg;
    el.scrollTop = el.scrollHeight;
  }
  function ghConnect() {
    saveToken();
    var c = ghCfg();
    if (!c.owner || !c.repo) { ghState = { ok: false, msg: 'Enter your GitHub username and repository name first.' }; renderSection(true); return; }
    if (!c.token) { ghState = { ok: false, msg: 'Paste your token first.' }; renderSection(true); return; }
    ghState = { ok: false, msg: 'Checking…', busy: true }; renderSection(true);
    gh(repoPath()).then(function (repo) {
      return gh(repoPath() + '/branches/' + encodeURIComponent(c.branch)).then(function () { return repo; });
    }).then(function (repo) {
      ghState = { ok: true, msg: 'Connected to ' + repo.full_name + ' (' + c.branch + ').', repo: repo };
      updateMode(); renderSection(true);
      if (baseSha) return;
      if (!dirty) return ghLoad(true);
      // Keep the edits made before connecting; remember which GitHub version they are based on.
      return ghGetFile('data/content.js').then(function (f) { baseSha = f.sha; }, function () { /* first save creates it */ });
    }).catch(function (e) { ghState = { ok: false, msg: e.message }; renderSection(true); });
  }
  function ghLoad(quiet) {
    if (dirty && !quiet && !window.confirm('Load the version on GitHub? Your unsaved changes here will be replaced.')) return Promise.resolve();
    setStatus('Loading from GitHub…', dirty);
    return ghGetFile('data/content.js').then(function (f) {
      var c = RN.parseContentJs(f.text);
      baseSha = f.sha;
      var keepEditor = draft && draft.settings && draft.settings.editor;
      original = clone(c); draft = clone(c);
      if (keepEditor && (!draft.settings.editor || !draft.settings.editor.owner)) draft.settings.editor = keepEditor;
      normalizeDraft(); applyAccent(draft.settings.accent);
      dirty = false; setStatus('Loaded the latest version from GitHub', false);
      renderNav(); renderSection(true); sendPreview();
      if (!quiet) toast('Loaded the latest content from GitHub.');
    }).catch(function (e) { setStatus('Could not load from GitHub', true); if (!quiet) toast(e.message); else ghState.msg = e.message; });
  }
  function buildContentFile() {
    ensureIds();
    draft.meta = draft.meta || {};
    draft.meta.updated = today();
    var out = clone(draft);
    if (out.settings && out.settings.editor) delete out.settings.editor.token;
    return RN.serializeContent(out);
  }
  function usedUploads() {
    var json = JSON.stringify(draft);
    return Object.keys(pending).filter(function (p) { return json.indexOf(JSON.stringify(p)) >= 0; });
  }
  function validationOrStop() {
    ensureIds();
    var issues = RN.validate(draft);
    var errors = issues.filter(function (i) { return i.level === 'error'; });
    if (errors.length) { renderSection(true); toast('Fix the ' + errors.length + ' problem' + (errors.length > 1 ? 's' : '') + ' listed before saving.'); return false; }
    return true;
  }
  function ghSave() {
    if (ghBusy) return;
    saveToken();
    if (!ghReady()) { ghState = { ok: false, msg: 'Connect to GitHub first.' }; renderSection(true); return; }
    if (!validationOrStop()) return;
    ghBusy = true;
    ghState.done = null; ghState.conflict = false;
    var doneEl = document.getElementById('gh-done'); if (doneEl) doneEl.remove();
    var msgEl = document.getElementById('gh-message');
    var message = (msgEl && msgEl.value.trim()) || defaultMessage();
    var btn = document.getElementById('gh-save-btn');
    if (btn) { btn.disabled = true; btn.innerHTML = '<span class="ed-spin"></span> Saving…'; }
    var logEl = document.getElementById('ed-log'); if (logEl) logEl.textContent = '';
    log('Checking for changes made on GitHub since you loaded…');
    ghGetFile('data/content.js').catch(function (e) { if (e.status === 404) return null; throw e; }).then(function (cur) {
      if (cur && baseSha && cur.sha !== baseSha && !forceOverwrite) {
        var stop = new Error('CONFLICT'); stop.conflict = true; throw stop;
      }
      var files = [{ path: 'data/content.js', text: buildContentFile() }];
      return ghGetFile('index.html').then(function (idx) {
        files.push({ path: 'index.html', text: RN.updateIndexHtml(idx.text, draft) });
      }).catch(function () { log('Note: could not update index.html social tags (skipped).'); }).then(function () {
        ['cv', 'rates', 'quote', 'projects'].forEach(function (k) { files.push({ path: k + '/index.html', text: RN.sharePage(k, draft) }); });
        usedUploads().forEach(function (p) { files.push({ path: p, base64: pending[p].b64 }); });
        log('Saving ' + files.length + ' files in one commit…');
        return ghCommit(files, message);
      });
    }).then(function (res) {
      return ghGetFile('data/content.js').then(function (f) { baseSha = f.sha; return res; }, function () { return res; });
    }).then(function (res) {
      original = clone(draft); pending = {}; dirty = false; LS.del('draft');
      setStatus('Published', false);
      var c = ghCfg();
      ghState = { ok: true, msg: 'Connected to ' + c.owner + '/' + c.repo + ' (' + c.branch + ').', done: res.unchanged ? 'Nothing had changed, so there was nothing to save.' : 'Saved to GitHub. Your site updates in about a minute.', commitUrl: res.url };
      ghBusy = false; forceOverwrite = false;
      renderNav(); renderSection(true);
      toast(res.unchanged ? 'No changes to save.' : 'Saved to GitHub.');
    }).catch(function (e) {
      ghBusy = false;
      if (e.conflict) { ghState.conflict = true; renderSection(true); return; }
      log('Failed: ' + e.message);
      if (btn) { btn.disabled = false; btn.textContent = 'Try again'; }
      toast('Not saved: ' + e.message);
    });
  }
  function defaultMessage() {
    var ch = changedLabels();
    return 'Update portfolio' + (ch.length ? ': ' + ch.join(', ').toLowerCase() : '');
  }
  function siteGuess() {
    var u = RN.normBase(draft.settings.siteUrl);
    if (u) return u;
    var c = ghCfg();
    if (c.owner && c.repo) return c.repo.toLowerCase() === (c.owner + '.github.io').toLowerCase() ? 'https://' + c.owner + '.github.io/' : 'https://' + c.owner + '.github.io/' + c.repo + '/';
    return '';
  }

  /* =========================================================
     DOWNLOADS (Netlify & any host)
     ========================================================= */
  var CRC = (function () { var t = []; for (var n = 0; n < 256; n++) { var c = n; for (var k = 0; k < 8; k++) c = c & 1 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1; t[n] = c >>> 0; } return t; })();
  function crc32(buf) { var c = 0xFFFFFFFF; for (var i = 0; i < buf.length; i++) c = CRC[(c ^ buf[i]) & 0xFF] ^ (c >>> 8); return (c ^ 0xFFFFFFFF) >>> 0; }
  function makeZip(files) {
    var enc = new TextEncoder(), parts = [], central = [], offset = 0;
    var d = new Date();
    var time = (d.getHours() << 11) | (d.getMinutes() << 5) | (d.getSeconds() >> 1);
    var date = ((d.getFullYear() - 1980) << 9) | ((d.getMonth() + 1) << 5) | d.getDate();
    files.forEach(function (f) {
      var name = enc.encode(f.name), data = f.data, crc = crc32(data);
      var lh = new DataView(new ArrayBuffer(30));
      lh.setUint32(0, 0x04034b50, true); lh.setUint16(4, 20, true); lh.setUint16(6, 0x0800, true); lh.setUint16(8, 0, true);
      lh.setUint16(10, time, true); lh.setUint16(12, date, true); lh.setUint32(14, crc, true);
      lh.setUint32(18, data.length, true); lh.setUint32(22, data.length, true); lh.setUint16(26, name.length, true); lh.setUint16(28, 0, true);
      parts.push(new Uint8Array(lh.buffer), name, data);
      var ch = new DataView(new ArrayBuffer(46));
      ch.setUint32(0, 0x02014b50, true); ch.setUint16(4, 20, true); ch.setUint16(6, 20, true); ch.setUint16(8, 0x0800, true); ch.setUint16(10, 0, true);
      ch.setUint16(12, time, true); ch.setUint16(14, date, true); ch.setUint32(16, crc, true); ch.setUint32(20, data.length, true); ch.setUint32(24, data.length, true);
      ch.setUint16(28, name.length, true); ch.setUint16(30, 0, true); ch.setUint16(32, 0, true); ch.setUint16(34, 0, true); ch.setUint16(36, 0, true);
      ch.setUint32(38, 0, true); ch.setUint32(42, offset, true);
      central.push(new Uint8Array(ch.buffer), name);
      offset += 30 + name.length + data.length;
    });
    var size = central.reduce(function (a, b) { return a + b.length; }, 0);
    var end = new DataView(new ArrayBuffer(22));
    end.setUint32(0, 0x06054b50, true); end.setUint16(4, 0, true); end.setUint16(6, 0, true);
    end.setUint16(8, files.length, true); end.setUint16(10, files.length, true); end.setUint32(12, size, true); end.setUint32(16, offset, true); end.setUint16(20, 0, true);
    return new Blob(parts.concat(central, [new Uint8Array(end.buffer)]), { type: 'application/zip' });
  }
  function saveBlob(blob, name) {
    var a = document.createElement('a');
    a.href = URL.createObjectURL(blob); a.download = name;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(function () { URL.revokeObjectURL(a.href); }, 4000);
  }
  function fetchBytes(p) {
    return fetch(p + (p.indexOf('?') < 0 ? '?v=' + Date.now() : ''), { cache: 'no-store' }).then(function (r) {
      if (!r.ok) throw new Error(p + ' (' + r.status + ')');
      return r.arrayBuffer();
    }).then(function (b) { return new Uint8Array(b); });
  }
  function changedFiles() {
    var enc = new TextEncoder();
    var files = [{ name: 'data/content.js', data: enc.encode(buildContentFile()) }];
    return fetchBytes('index.html').then(function (bytes) {
      files.push({ name: 'index.html', data: enc.encode(RN.updateIndexHtml(new TextDecoder().decode(bytes), draft)) });
    }).catch(function () { /* opened from disk: skip */ }).then(function () {
      ['cv', 'rates', 'quote', 'projects'].forEach(function (k) { files.push({ name: k + '/index.html', data: enc.encode(RN.sharePage(k, draft)) }); });
      return Promise.all(usedUploads().map(function (p) {
        return pending[p].blob.arrayBuffer().then(function (b) { files.push({ name: p, data: new Uint8Array(b) }); });
      }));
    }).then(function () { return files; });
  }
  function referencedAssets() {
    var out = [];
    (function walk(v) {
      if (typeof v === 'string') { if (/^assets\/(uploads|docs|img)\/[^\s"']+\.\w{2,5}$/.test(v) && out.indexOf(v) < 0) out.push(v); }
      else if (Array.isArray(v)) v.forEach(walk);
      else if (v && typeof v === 'object') Object.keys(v).forEach(function (k) { walk(v[k]); });
    })(draft);
    return out;
  }
  function busy(btnSel, on, label) {
    var b = document.querySelector(btnSel);
    if (!b) return;
    if (on) { b.dataset.label = b.textContent; b.disabled = true; b.innerHTML = '<span class="ed-spin"></span> ' + esc(label || 'Working…'); }
    else { b.disabled = false; b.textContent = b.dataset.label || 'Done'; }
  }
  function downloadChanged() {
    if (!validationOrStop()) return;
    busy('[data-act="dl-changed"]', true, 'Preparing…');
    changedFiles().then(function (files) {
      saveBlob(makeZip(files), 'portfolio-update-' + today() + '.zip');
      markSavedLocally('Downloaded the changed files.');
    }).catch(function (e) { toast('Could not prepare the download: ' + e.message); }).then(function () { busy('[data-act="dl-changed"]', false); });
  }
  function downloadFull() {
    if (!validationOrStop()) return;
    if (location.protocol === 'file:') { toast('Open the editor from your website (or a local server) to download the full site. You can still download content.js.'); return; }
    busy('[data-act="dl-full"]', true, 'Collecting files…');
    var manifest;
    fetch('assets/site-files.json?v=' + Date.now(), { cache: 'no-store' }).then(function (r) {
      if (!r.ok) throw new Error('assets/site-files.json is missing');
      return r.json();
    }).then(function (m) {
      manifest = m.files || [];
      return changedFiles();
    }).then(function (changed) {
      var byName = {};
      changed.forEach(function (f) { byName[f.name] = f; });
      var names = manifest.slice();
      referencedAssets().forEach(function (p) { if (names.indexOf(p) < 0 && !byName[p]) names.push(p); });
      var out = [];
      var chain = Promise.resolve();
      names.forEach(function (p) {
        if (p === 'assets/site-files.json') return;
        chain = chain.then(function () {
          if (byName[p]) { out.push(byName[p]); delete byName[p]; return; }
          return fetchBytes(p).then(function (bytes) { out.push({ name: p, data: bytes }); }, function () { /* file removed: skip */ });
        });
      });
      return chain.then(function () {
        Object.keys(byName).forEach(function (k) { out.push(byName[k]); });
        var list = out.map(function (f) { return f.name; }).concat(['assets/site-files.json']).sort();
        out.push({ name: 'assets/site-files.json', data: new TextEncoder().encode(JSON.stringify({ generated: today(), files: list }, null, 1)) });
        saveBlob(makeZip(out), 'portfolio-site-' + today() + '.zip');
        markSavedLocally('Downloaded your full site (' + out.length + ' files).');
      });
    }).catch(function (e) { toast('Could not build the zip: ' + e.message); }).then(function () { busy('[data-act="dl-full"]', false); });
  }
  function markSavedLocally(msg) {
    original = clone(draft);
    dirty = false; LS.del('draft');
    setStatus('Downloaded: upload it to publish', false);
    renderNav();
    toast(msg);
  }

  /* =========================================================
     PUBLISH SECTION
     ========================================================= */
  function issuesHtml() {
    ensureIds();
    var issues = RN.validate(draft);
    if (!issues.length) return '<div class="ed-ok">✓ Everything checks out.</div>';
    var secFor = function (p) {
      var top = p.split('.')[0];
      return { profile: 'profile', services: 'services', serviceGroups: 'services', projects: 'projects', experience: 'experience', settings: 'settings', rates: 'rates', skills: 'skills' }[top] || 'json';
    };
    return '<ul class="ed-issues">' + issues.map(function (i) {
      return '<li class="ed-issue' + (i.level === 'warn' ? ' ed-issue--warn' : '') + '"><span class="ed-badge' + (i.level === 'warn' ? ' ed-badge--warn' : '') + '">' + (i.level === 'warn' ? 'Check' : 'Fix') + '</span><span>' + esc(i.msg) + '</span>' +
        '<button type="button" class="ed-btn ed-btn--sm" data-act="go" data-to="' + secFor(i.path) + '">Open</button></li>';
    }).join('') + '</ul>';
  }
  function publishHtml() {
    var ch = changedLabels();
    var up = usedUploads().length;
    var c = ghCfg();
    var m = mode();
    var html = '<h1 class="ed-h1">Save & publish</h1>' +
      '<p class="ed-lede">' + (ch.length || up ? 'You have changed: ' : 'No unsaved changes yet. ') + '</p>' +
      (ch.length || up ? '<div class="ed-changes">' + ch.map(function (x) { return '<span>' + esc(x) + '</span>'; }).join('') + (up ? '<span>' + up + ' new upload' + (up > 1 ? 's' : '') + '</span>' : '') + '</div>' : '') +
      '<div class="ed-card"><h2>Checks</h2>' + issuesHtml() + '</div>' +
      '<div class="ed-tabs" role="group" aria-label="Save method"><button type="button" data-act="set-mode" data-mode="github" aria-pressed="' + (m === 'github') + '">Save to GitHub</button><button type="button" data-act="set-mode" data-mode="download" aria-pressed="' + (m === 'download') + '">Download for Netlify / other hosts</button></div>';
    if (m === 'github') {
      var token = c.token;
      html += '<div class="ed-card"><h2>1. Connect to GitHub</h2>' +
        (ghState.msg ? (ghState.ok ? '<div class="ed-ok">' + esc(ghState.msg) + '</div>' : '<ul class="ed-issues"><li class="ed-issue' + (ghState.busy ? ' ed-issue--warn' : '') + '"><span>' + (ghState.busy ? '<span class="ed-spin"></span> ' : '') + esc(ghState.msg) + '</span></li></ul>') : '') +
        '<div class="ed-row">' + fieldHtml({ k: 'settings.editor.owner', t: 'text', label: 'GitHub username' }, '') + fieldHtml({ k: 'settings.editor.repo', t: 'text', label: 'Repository name' }, '') + fieldHtml({ k: 'settings.editor.branch', t: 'text', label: 'Branch' }, '') + '</div>' +
        '<div class="ed-field"><label for="gh-token">Access token</label><input class="ed-input ed-input--mono" id="gh-token" type="password" autocomplete="off" spellcheck="false" placeholder="github_pat_…" value="' + esc(token) + '">' +
        '<span class="ed-help">Stays in this browser only. It is never saved to your site files.</span>' +
        '<label class="ed-check" style="margin-top:6px"><input type="checkbox" id="gh-remember"' + (LS.get('gh-token', null) ? ' checked' : '') + '> Remember on this device (only on your own computer)</label></div>' +
        '<div class="ed-img__btns"><button type="button" class="ed-btn ed-btn--ink" data-act="gh-connect">Connect & check</button>' +
        (ghState.ok ? '<button type="button" class="ed-btn" data-act="gh-load">Load latest from GitHub</button>' : '') +
        (token ? '<button type="button" class="ed-btn ed-btn--danger" data-act="gh-forget">Forget token</button>' : '') + '</div>' +
        '<details style="margin-top:14px"><summary><b>How do I get a token?</b></summary><ol class="ed-steps" style="margin-top:10px">' +
        '<li>On GitHub open <a href="https://github.com/settings/personal-access-tokens/new" target="_blank" rel="noopener">Settings → Developer settings → Fine-grained tokens → Generate new token</a>.</li>' +
        '<li>Name it “Portfolio editor”, and pick an expiry (e.g. 1 year).</li>' +
        '<li>Under <b>Repository access</b> choose <b>Only select repositories</b> and pick ' + esc(c.repo || 'your portfolio repository') + '.</li>' +
        '<li>Under <b>Permissions → Repository permissions</b> set <b>Contents</b> to <b>Read and write</b>. Nothing else is needed.</li>' +
        '<li>Generate, copy the token (starts with <span class="ed-kbd">github_pat_</span>) and paste it above.</li></ol></details></div>';
      html += '<div class="ed-card"><h2>2. Save</h2>' +
        (ghState.conflict ? '<ul class="ed-issues"><li class="ed-issue ed-issue--warn"><span>The content on GitHub changed since you loaded it (maybe edited on GitHub directly or from another device). Load it to keep those changes, or overwrite them with your version.</span></li></ul><div class="ed-img__btns" style="margin-bottom:12px"><button type="button" class="ed-btn" data-act="gh-load">Load the GitHub version</button><button type="button" class="ed-btn ed-btn--danger" data-act="gh-force">Overwrite with my version</button></div>' : '') +
        (ghState.done ? '<div class="ed-ok" id="gh-done">' + esc(ghState.done) + (ghState.commitUrl ? ' <a href="' + esc(ghState.commitUrl) + '" target="_blank" rel="noopener">View the commit</a>' : '') + '</div>' : '') +
        '<div class="ed-field"><label for="gh-message">Change note</label><input class="ed-input" id="gh-message" value="' + esc(defaultMessage()) + '"></div>' +
        '<div class="ed-img__btns"><button type="button" class="ed-btn ed-btn--primary" id="gh-save-btn" data-act="gh-save"' + (ghReady() ? '' : ' disabled') + '>Save to GitHub</button>' +
        (c.owner && c.repo ? '<a class="ed-btn" href="https://github.com/' + encodeURIComponent(c.owner) + '/' + encodeURIComponent(c.repo) + '/actions" target="_blank" rel="noopener">Watch it deploy</a>' : '') +
        (siteGuess() ? '<a class="ed-btn" href="' + esc(siteGuess()) + '" target="_blank" rel="noopener">Open live site</a>' : '') + '</div>' +
        '<p class="ed-help">Shortcut: <span class="ed-kbd">Ctrl</span> + <span class="ed-kbd">S</span>. GitHub Pages usually shows changes within 1–2 minutes; refresh the page if you still see the old version.</p>' +
        '<pre class="ed-log" id="ed-log" hidden></pre></div>';
    } else {
      html += '<div class="ed-card"><h2>Download your updated site</h2>' +
        '<ol class="ed-steps"><li>Click <b>Download full site</b>. You get a zip of your whole website with your changes.</li>' +
        '<li>Unzip it on your computer.</li>' +
        '<li>In Netlify open your site → <b>Deploys</b>, and drag the unzipped folder onto the “drag and drop your site output folder” box. Done.</li></ol>' +
        '<div class="ed-img__btns"><button type="button" class="ed-btn ed-btn--primary" data-act="dl-full">Download full site (.zip)</button>' +
        '<button type="button" class="ed-btn" data-act="dl-changed">Only the changed files (.zip)</button>' +
        '<button type="button" class="ed-btn" data-act="dl-content">Only content.js</button></div>' +
        '<p class="ed-help">Other hosts (Cloudflare Pages, cPanel, Vercel…): upload the unzipped files the same way you did the first time. If your Netlify site is connected to GitHub instead, switch to “Save to GitHub”.</p></div>';
    }
    html += '<div class="ed-card"><h2>Backup & restore</h2><p>Keep a copy of your content, or bring one back.</p><div class="ed-img__btns">' +
      '<button type="button" class="ed-btn" data-act="dl-backup">Download backup (.json)</button>' +
      '<button type="button" class="ed-btn" data-act="import">Import a backup…</button>' +
      '<button type="button" class="ed-btn ed-btn--danger" data-act="discard-all"' + (dirty ? '' : ' disabled') + '>Discard unsaved changes</button></div>' +
      '<input type="file" id="ed-import" accept="application/json,.json,.js" hidden></div>';
    return html;
  }
  function draftBanner() {
    var d = LS.get('draft', null);
    if (!d || !d.content || dirty) return '';
    if (JSON.stringify(d.content) === JSON.stringify(draft)) return '';
    var when = new Date(d.at || Date.now());
    return '<div class="ed-banner" role="status"><p><b>You have unsaved edits from ' + esc(when.toLocaleString()) + '.</b> Bring them back, or discard them.</p>' +
      '<button type="button" class="ed-btn ed-btn--ink" data-act="restore-draft">Restore edits</button><button type="button" class="ed-btn" data-act="discard-draft">Discard</button></div>';
  }
  function onImport(ev) {
    var file = ev.target.files && ev.target.files[0];
    if (!file) return;
    file.text().then(function (t) {
      var obj = /window\.PORTFOLIO/.test(t) ? RN.parseContentJs(t) : JSON.parse(t);
      if (!obj || !obj.profile) throw new Error('This file does not look like portfolio content.');
      draft = obj; normalizeDraft(); applyAccent(draft.settings.accent); renderSection(true); touch(true);
      toast('Imported. Check the preview, then save.');
    }).catch(function (e) { toast('Could not import: ' + e.message); });
  }

  /* =========================================================
     MISC UI
     ========================================================= */
  var toastTimer;
  function toast(msg, actionLabel, action) {
    var t = document.getElementById('ed-toast');
    t.innerHTML = '<span>' + esc(msg) + '</span>' + (actionLabel ? '<button type="button">' + esc(actionLabel) + '</button>' : '');
    t.hidden = false;
    if (actionLabel) t.querySelector('button').onclick = function () { t.hidden = true; action(); };
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { t.hidden = true; }, actionLabel ? 7000 : 4000);
  }
  function applyAccent(hex) {
    var tk = RN.accentTokens(hex || '#3E6B52');
    document.documentElement.style.setProperty('--accent', tk.accent);
    document.documentElement.style.setProperty('--on-accent', tk.onAccent);
    document.documentElement.style.setProperty('--accent-text', tk.accentTextLight);
  }
  function updateMode() {
    var el = document.getElementById('ed-mode');
    var c = ghCfg();
    var mark = document.getElementById('ed-mark');
    if (mark) mark.textContent = RN.initials(draft.profile.name) || 'RN';
    if (mode() === 'github') el.textContent = c.owner && c.repo ? 'GitHub · ' + c.owner + '/' + c.repo + (ghState.ok ? ' · connected' : '') : 'GitHub · not connected yet';
    else el.textContent = 'Download mode · Netlify & other hosts';
    var sb = document.getElementById('ed-save-btn');
    if (sb) sb.textContent = mode() === 'github' ? 'Save & publish' : 'Download update';
  }
  function normalizeDraft() {
    var d = draft;
    d.meta = d.meta || {};
    d.settings = d.settings || {};
    d.settings.currency = d.settings.currency || { code: 'KES', usdRate: 129, showUsdToggle: true };
    d.settings.form = d.settings.form || { provider: 'formsubmit', email: '' };
    d.settings.editor = d.settings.editor || { mode: 'github', owner: '', repo: '', branch: 'main' };
    delete d.settings.editor.token;
    d.profile = d.profile || {};
    d.profile.availability = d.profile.availability || { status: 'available', label: '' };
    ['serviceGroups', 'services', 'skills', 'projects', 'experience', 'education', 'certifications', 'testimonials'].forEach(function (k) { if (!Array.isArray(d[k])) d[k] = []; });
    d.rates = d.rates || {}; d.rates.categories = arr(d.rates.categories); d.rates.terms = arr(d.rates.terms);
    d.share = d.share || {};
  }
  function loadSiteContent() {
    return fetch('data/content.js?v=' + Date.now(), { cache: 'no-store' }).then(function (r) {
      if (!r.ok) throw new Error('status ' + r.status);
      return r.text();
    }).then(function (t) { return RN.parseContentJs(t); }).catch(function () {
      // Opened straight from disk (file://): fall back to a script tag.
      return new Promise(function (res, rej) {
        if (window.PORTFOLIO) return res(window.PORTFOLIO);
        var s = document.createElement('script');
        s.src = 'data/content.js?v=' + Date.now();
        s.onload = function () { window.PORTFOLIO ? res(window.PORTFOLIO) : rej(new Error('data/content.js has a syntax error.')); };
        s.onerror = function () { rej(new Error('Could not load data/content.js.')); };
        document.head.appendChild(s);
      });
    });
  }

  /* =========================================================
     BOOT
     ========================================================= */
  function boot() {
    frame = document.getElementById('ed-frame');
    main = document.getElementById('ed-main');
    nav = document.getElementById('ed-nav');
    statusEl = document.getElementById('ed-status');
    document.addEventListener('click', onClick);
    main.addEventListener('input', onInput);
    main.addEventListener('change', function (ev) { if (ev.target.id === 'ed-import') onImport(ev); else onChange(ev); });
    document.addEventListener('keydown', onKeydown);
    main.addEventListener('toggle', onToggle, true);
    window.addEventListener('beforeunload', function (ev) { flushDraft(); if (dirty) { ev.preventDefault(); ev.returnValue = ''; } });
    window.addEventListener('pagehide', flushDraft);
    document.addEventListener('visibilitychange', function () { if (document.visibilityState === 'hidden') flushDraft(); });
    window.addEventListener('hashchange', function () { var id = location.hash.slice(1); if (id && id !== current) go(id); });
    loadSiteContent().then(function (c) {
      original = clone(c); draft = clone(c);
      normalizeDraft();
      applyAccent(draft.settings.accent);
      var first = location.hash.slice(1);
      current = section(first || 'profile').id;
      updateMode();
      renderNav();
      renderSection(false);
      setStatus('No changes yet', false);
      startPreview();
      if (mode() === 'github' && ghReady()) {
        ghState = { ok: false, msg: 'Connecting to GitHub…', busy: true };
        gh(repoPath()).then(function (repo) {
          ghState = { ok: true, msg: 'Connected to ' + repo.full_name + ' (' + ghCfg().branch + ').' };
          updateMode();
          return ghLoad(true);
        }).catch(function (e) { ghState = { ok: false, msg: e.message }; updateMode(); if (current === 'publish') renderSection(true); });
      }
    }).catch(function (e) {
      main.innerHTML = '<h1 class="ed-h1">Could not load your content</h1><p class="ed-lede">' + esc(e.message) + '</p><p>Make sure this page sits next to <span class="ed-kbd">index.html</span> and the <span class="ed-kbd">data</span> folder.</p>';
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
})();

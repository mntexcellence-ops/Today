/* ============================================================
   quick-links.js — personal bookmark manager: CRUD, search,
   category filter, grid/list views, pinning, drag-and-drop
   reorder, favicons with fallback, import/export.
   Non http(s) URLs are refused with a warning (never opened).
   ============================================================ */
'use strict';
const QuickLinks = {
  links: [],
  view: 'grid',
  async load() {
    this.view = store.get('linksView', 'grid');
    const saved = store.get('quickLinks', null);
    if (saved && Array.isArray(saved)) { this.links = saved; return; }
    let data = null;
    try {
      const res = await fetch('data/quick-links.json');
      if (res.ok) data = await res.json();
    } catch (e) { /* offline/file: fallback */ }
    if (!data || !Array.isArray(data.links)) {
      data = (typeof FALLBACK_LINKS !== 'undefined') ? FALLBACK_LINKS : { links: [] };
    }
    this.links = data.links || [];
  },
  save() { store.set('quickLinks', this.links); },
  categories() {
    const cats = ['All'];
    this.links.forEach(l => { if (l.category && cats.indexOf(l.category) === -1) cats.push(l.category); });
    ['Work', 'Tools', 'Learning', 'Finance', 'Personal', 'Islamic Resources'].forEach(c => {
      if (cats.indexOf(c) === -1) cats.push(c);
    });
    return cats;
  },
  add(link) {
    if (!link.title || !link.title.trim()) return { ok: false, error: t('titleRequired') };
    if (!isHttpUrl(link.url)) return { ok: false, error: t('validUrl') };
    link.id = uid();
    link.pinned = !!link.pinned;
    this.links.unshift(link);
    this.save();
    return { ok: true };
  },
  update(id, patch) {
    const l = this.links.find(x => x.id === id);
    if (!l) return { ok: false, error: t('linkNotFound') };
    if (patch.url && !isHttpUrl(patch.url)) return { ok: false, error: t('validUrlShort') };
    Object.assign(l, patch);
    this.save();
    return { ok: true };
  },
  remove(id) { this.links = this.links.filter(l => l.id !== id); this.save(); },
  togglePin(id) {
    const l = this.links.find(x => x.id === id);
    if (l) { l.pinned = !l.pinned; this.save(); }
  },
  move(id, dir) {
    const i = this.links.findIndex(l => l.id === id);
    const j = i + dir;
    if (i < 0 || j < 0 || j >= this.links.length) return;
    const tmp = this.links[i]; this.links[i] = this.links[j]; this.links[j] = tmp;
    this.save();
  },
  render(targetId, opts) {
    const el = document.getElementById(targetId);
    if (!el) return;
    opts = opts || {};
    const q = (opts.q || '').toLowerCase();
    const cat = opts.cat || 'All';
    let list = this.links.filter(l =>
      (cat === 'All' || l.category === cat) &&
      (!q || l.title.toLowerCase().indexOf(q) !== -1 || l.url.toLowerCase().indexOf(q) !== -1));
    list = list.slice().sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0));
    if (!list.length) {
      el.innerHTML = '<div class="empty">' + t('noLinksMatch') + '</div>';
      return;
    }
    const cards = list.map(l => {
      const host = (() => { try { return new URL(l.url).hostname; } catch (e) { return ''; } })();
      const fav = host ? 'https://www.google.com/s2/favicons?domain=' + encodeURIComponent(host) + '&sz=64' : '';
      return '<div class="link-card" draggable="true" data-id="' + esc(l.id) + '">' +
        (opts.manage ? '<span class="grab" title="' + t('dragReorder') + '">⠿</span>' : '') +
        (fav
          ? '<img class="fav" src="' + esc(fav) + '" alt="" onerror="this.style.display=\'none\';this.nextElementSibling.style.display=\'grid\'"><span class="fav-fallback" style="display:none">' + esc((l.title || '?')[0].toUpperCase()) + '</span>'
          : '<span class="fav-fallback">' + esc((l.title || '?')[0].toUpperCase()) + '</span>') +
        '<div class="grow"><h4><a href="' + esc(l.url) + '" target="_blank" rel="noopener">' + esc(l.title) + '</a>' +
        (l.pinned ? ' <span title="' + t('pinnedTitle') + '">📌</span>' : '') + '</h4>' +
        '<p>' + esc(linkDesc(l) || host) + '</p>' +
        '<p><span class="tag">' + esc(linkCatLabel(l.category || 'Personal')) + '</span></p></div>' +
        (opts.manage
          ? '<div style="display:flex;flex-direction:column;gap:5px">' +
            '<button class="icon-btn" data-pin="' + esc(l.id) + '" title="' + t('pinUnpin') + '">' + (l.pinned ? '📍' : '📌') + '</button>' +
            '<button class="icon-btn" data-edit="' + esc(l.id) + '" title="' + t('editBtn') + '">✏️</button>' +
            '<button class="icon-btn" data-del="' + esc(l.id) + '" title="' + t('deleteBtn') + '">🗑️</button></div>'
          : '') +
        '</div>';
    }).join('');
    el.innerHTML = opts.manage
      ? (this.view === 'list' ? '<div class="list">' + cards + '</div>' : '<div class="links-grid">' + cards + '</div>')
      : '<div class="links-grid">' + cards + '</div>';
    if (opts.manage) this.bindManage(el);
  },
  bindManage(el) {
    el.querySelectorAll('[data-del]').forEach(b => {
      b.onclick = () => {
        if (confirm(t('deleteLinkQ'))) { this.remove(b.dataset.del); App.refreshLinks(); }
      };
    });
    el.querySelectorAll('[data-pin]').forEach(b => {
      b.onclick = () => { this.togglePin(b.dataset.pin); App.refreshLinks(); };
    });
    el.querySelectorAll('[data-edit]').forEach(b => {
      b.onclick = () => App.openLinkEditor(b.dataset.edit);
    });
    let dragId = null;
    el.querySelectorAll('.link-card').forEach(card => {
      card.addEventListener('dragstart', () => { dragId = card.dataset.id; card.classList.add('dragging'); });
      card.addEventListener('dragend', () => card.classList.remove('dragging'));
      card.addEventListener('dragover', e => e.preventDefault());
      card.addEventListener('drop', e => {
        e.preventDefault();
        if (!dragId || dragId === card.dataset.id) return;
        const from = this.links.findIndex(l => l.id === dragId);
        const to = this.links.findIndex(l => l.id === card.dataset.id);
        if (from < 0 || to < 0) return;
        const item = this.links.splice(from, 1)[0];
        this.links.splice(to, 0, item);
        this.save();
        App.refreshLinks();
      });
    });
  },
  exportJSON() { return { links: this.links }; },
  importJSON(arr) {
    if (!Array.isArray(arr)) return { ok: false, error: t('importLinksArray') };
    let n = 0;
    for (const l of arr) {
      if (!l || !l.title || !isHttpUrl(l.url)) return { ok: false, error: t('everyLinkNeeds') };
      this.links.push({ id: uid(), title: String(l.title), url: String(l.url), category: String(l.category || 'Personal'), description: String(l.description || ''), pinned: !!l.pinned });
      n++;
    }
    this.save();
    return { ok: true, count: n };
  },
};

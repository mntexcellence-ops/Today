/* ============================================================
   prophets-stories.js — daily rotation, navigation, search,
   filter, bookmarks, reading mode, text-to-speech.
   The daily index is a READING SCHEDULE (day-of-year modulo
   the number of stories). It does not claim any story happened
   on today's date. See data/prophets-stories.json notes.
   ============================================================ */
'use strict';
const Stories = {
  list: [],
  index: 0,
  bookmarks: [],
  async load() {
    const bn = curLang() === 'bn';
    let data = null;
    try {
      const res = await fetch(bn ? 'data/prophets-stories-bn.json' : 'data/prophets-stories.json');
      if (res.ok) data = await res.json();
    } catch (e) { /* offline/file: fallback */ }
    if (!data || !Array.isArray(data.stories)) {
      if (bn && typeof FALLBACK_STORIES_BN !== 'undefined') data = FALLBACK_STORIES_BN;
      else data = (typeof FALLBACK_STORIES !== 'undefined') ? FALLBACK_STORIES : { stories: [] };
    }
    this.list = data.stories || [];
    this.bookmarks = store.get('storyBookmarks', []);
    this.index = this.todayIndex();
  },
  todayIndex() {
    if (!this.list.length) return 0;
    return dayOfYear(new Date()) % this.list.length;
  },
  current() { return this.list[this.index] || null; },
  goToday() { this.index = this.todayIndex(); },
  step(dir) {
    if (!this.list.length) return;
    this.index = (this.index + dir + this.list.length) % this.list.length;
  },
  isBookmarked(id) { return this.bookmarks.indexOf(id) !== -1; },
  toggleBookmark(id) {
    const i = this.bookmarks.indexOf(id);
    if (i === -1) this.bookmarks.push(id); else this.bookmarks.splice(i, 1);
    store.set('storyBookmarks', this.bookmarks);
  },
  search(q, prophet) {
    const needle = (q || '').toLowerCase();
    return this.list.filter(s =>
      (!prophet || prophet === 'All' || s.prophet.en === prophet) &&
      (!needle ||
        s.title.toLowerCase().indexOf(needle) !== -1 ||
        s.prophet.en.toLowerCase().indexOf(needle) !== -1 ||
        s.prophet.bn.indexOf(needle) !== -1 ||
        s.summary.toLowerCase().indexOf(needle) !== -1));
  },
  prophets() {
    const out = ['All'];
    this.list.forEach(s => { if (out.indexOf(s.prophet.en) === -1) out.push(s.prophet.en); });
    return out;
  },
  speak(story) {
    if (!('speechSynthesis' in window)) { App.toast(t('ttsUnsupported'), true); return; }
    window.speechSynthesis.cancel();
    const lang = Settings.get().language === 'bn' ? 'bn-BD' : 'en-US';
    const text = story.title + '. ' + story.summary + ' ' + story.lessons.join(' ');
    const u = new SpeechSynthesisUtterance(text);
    u.lang = lang;
    const voices = window.speechSynthesis.getVoices();
    const v = voices.find(v => v.lang && v.lang.toLowerCase().startsWith(lang.slice(0, 2)));
    if (v) u.voice = v;
    window.speechSynthesis.speak(u);
  },
  stopSpeak() {
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
  },
  prophetSub(s) {
    return curLang() === 'bn' ? s.prophet.bn : s.prophet.en;
  },
  prophetShort(s) {
    const name = curLang() === 'bn' ? s.prophet.bn : s.prophet.en;
    return name + ' · ' + s.prophet.ar;
  },
  renderFeatured() {
    const s = this.current();
    const el = document.getElementById('storyCard');
    if (!el) return;
    if (!s) { el.innerHTML = '<div class="empty">' + t('noStoriesLoaded') + '</div>'; return; }
    const pos = this.index + 1;
    const pct = Math.round((pos / this.list.length) * 100);
    el.innerHTML =
      '<div class="story-prophet">' + esc(s.prophet.ar) + '</div>' +
      '<div class="story-title">' + esc(s.title) + '</div>' +
      '<p class="bn" style="font-size:15px;color:var(--muted)">' + esc(this.prophetSub(s)) + '</p>' +
      '<p>' + esc(s.summary) + '</p>' +
      '<p><span class="tag">' + tf('storyOf', { pos: pos, total: this.list.length }) + '</span> ' +
      '<span class="tag">' + esc(s.tradition === 'quran' ? t('tradQuran') : t('tradQuranScholar')) + '</span> ' +
      '<span class="tag">' + (s.readingMinutes || 4) + t('minRead') + '</span></p>' +
      '<div class="progress-track"><div class="progress-bar" style="width:' + pct + '%"></div></div>' +
      '<p style="margin-top:8px;font-size:13px;color:var(--muted)">' + t('quranLabel') +
      s.quran.map(q => esc(q.name) + ' ' + q.surah + ':' + q.verses).join(' · ') + '</p>' +
      '<div class="toolbar" style="margin-top:10px">' +
      '<button class="btn small" id="storyPrev">' + t('prevBtn') + '</button>' +
      '<button class="btn small gold" id="storyToday">' + t('todaysStory') + '</button>' +
      '<button class="btn small" id="storyNext">' + t('nextBtn') + '</button>' +
      '<button class="icon-btn" id="storyRead">' + t('readFullBtn') + '</button>' +
      '<button class="icon-btn" id="storySpeak">' + t('listenBtn') + '</button>' +
      '<button class="icon-btn" id="storyMark">' + (this.isBookmarked(s.id) ? t('bookmarkedBtn') : t('bookmarkBtn')) + '</button>' +
      '</div>';
    document.getElementById('storyPrev').onclick = () => { this.step(-1); this.renderFeatured(); };
    document.getElementById('storyNext').onclick = () => { this.step(1); this.renderFeatured(); };
    document.getElementById('storyToday').onclick = () => { this.goToday(); this.renderFeatured(); };
    document.getElementById('storyRead').onclick = () => App.openStory(s.id);
    document.getElementById('storySpeak').onclick = () => this.speak(s);
    document.getElementById('storyMark').onclick = () => { this.toggleBookmark(s.id); this.renderFeatured(); };
  },
  renderList(q, prophet) {
    const el = document.getElementById('storyList');
    if (!el) return;
    const list = this.search(q, prophet);
    if (!list.length) { el.innerHTML = '<div class="empty">' + t('noStoriesMatch') + '</div>'; return; }
    el.innerHTML = list.map(s => {
      const idx = this.list.indexOf(s);
      return '<div class="list-item"><div class="grow"><h4>' + esc(s.title) + '</h4>' +
        '<p>' + esc(this.prophetShort(s)) + '</p>' +
        '<p>' + esc(s.summary.slice(0, 130)) + (s.summary.length > 130 ? '…' : '') + '</p>' +
        '<p><span class="tag">' + tf('storyOf', { pos: idx + 1, total: this.list.length }) + '</span> ' +
        '<span class="tag">' + (s.readingMinutes || 4) + t('minShort') + '</span></p></div>' +
        '<button class="btn small" data-open="' + esc(s.id) + '">' + t('readBtn') + '</button></div>';
    }).join('');
    el.querySelectorAll('[data-open]').forEach(b => {
      b.onclick = () => App.openStory(b.dataset.open);
    });
  },
};

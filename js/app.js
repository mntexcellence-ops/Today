/* ============================================================
   app.js — boot, navigation, dashboard widgets, modals,
   toasts, settings screen wiring, profile & about rendering.
   ============================================================ */
'use strict';
const QUOTES = [
  { text: 'Indeed, with hardship comes ease.', textBn: 'নিশ্চয়ই কষ্টের সাথে স্বস্তি আছে।', source: 'Quran, Surah Ash-Sharh 94:6', sourceBn: 'কুরআন, Surah Ash-Sharh 94:6' },
  { text: 'So remember Me, I will remember you.', textBn: 'অতএব তোমরা আমাকে স্মরণ করো, আমিও তোমাদের স্মরণ করব।', source: 'Quran, Surah Al-Baqarah 2:152', sourceBn: 'কুরআন, Surah Al-Baqarah 2:152' },
  { text: 'Do not despair of the mercy of Allah.', textBn: 'আল্লাহর রহমত থেকে নিরাশ হয়ো না।', source: 'Quran, Surah Az-Zumar 39:53', sourceBn: 'কুরআন, Surah Az-Zumar 39:53' },
  { text: 'Allah does not burden a soul beyond what it can bear.', textBn: 'আল্লাহ কোনো প্রাণের ওপর তার সাধ্যের বাইরে বোঝা চাপান না।', source: 'Quran, Surah Al-Baqarah 2:286', sourceBn: 'কুরআন, Surah Al-Baqarah 2:286' },
  { text: 'Indeed, Allah will not change the condition of a people until they change what is in themselves.', textBn: 'নিশ্চয়ই আল্লাহ কোনো জাতির অবস্থা পরিবর্তন করেন না, যতক্ষণ না তারা নিজেরা নিজেদের অবস্থা পরিবর্তন করে।', source: "Quran, Surah Ar-Ra'd 13:11", sourceBn: "কুরআন, Surah Ar-Ra'd 13:11" },
  { text: 'And whoever relies upon Allah, then He is sufficient for him.', textBn: 'আর যে আল্লাহর ওপর ভরসা করে, তার জন্য তিনিই যথেষ্ট।', source: 'Quran, Surah At-Talaq 65:3', sourceBn: 'কুরআন, Surah At-Talaq 65:3' },
  { text: 'The best time to plant a tree was twenty years ago. The second best time is now.', textBn: 'গাছ লাগানোর সেরা সময় ছিল বিশ বছর আগে। দ্বিতীয় সেরা সময় এখন।', source: 'Proverb', sourceBn: 'প্রবাদ' },
];
const App = {
  currentView: 'dashboard',
  init() {
    this.bindNav();
    this.bindChrome();
    this.renderProfile();
    this.renderDashboard();
    this.refreshLinks();
    this.refreshTasks();
    this.renderStoriesSection();
    this.renderSettingsForm();
    this.renderAbout();
    this.showView('dashboard');
  },
  bindNav() {
    document.querySelectorAll('[data-nav]').forEach(b => {
      b.onclick = () => this.showView(b.dataset.nav);
    });
  },
  bindChrome() {
    const themeBtn = document.getElementById('themeToggle');
    if (themeBtn) themeBtn.onclick = () => {
      const s = Settings.get();
      Settings.update({ theme: s.theme === 'dark' ? 'light' : 'dark' });
      App.toast(s.theme === 'dark' ? t('lightThemeOn') : t('darkThemeOn'));
    };
    const langBtn = document.getElementById('langToggle');
    if (langBtn) langBtn.onclick = () => {
      const s = Settings.get();
      this.setLanguage(s.language === 'bn' ? 'en' : 'bn');
    };
    const burger = document.getElementById('burger');
    const sidebar = document.getElementById('sidebar');
    const backdrop = document.getElementById('sidebarBackdrop');
    if (burger) burger.onclick = () => { sidebar.classList.add('open'); backdrop.classList.add('open'); };
    if (backdrop) backdrop.onclick = () => { sidebar.classList.remove('open'); backdrop.classList.remove('open'); };
    const modalBg = document.getElementById('modalBg');
    if (modalBg) modalBg.addEventListener('click', e => { if (e.target === modalBg) this.closeModal(); });
    const modalClose = document.getElementById('modalClose');
    if (modalClose) modalClose.onclick = () => this.closeModal();
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape') this.closeModal();
    });
    const headDate = document.getElementById('headDate');
    if (headDate) {
      headDate.textContent = fmtShort(new Date());
    }
  },
  showView(name) {
    this.currentView = name;
    document.querySelectorAll('[data-view]').forEach(v => v.classList.toggle('on', v.dataset.view === name));
    document.querySelectorAll('[data-nav]').forEach(b => b.classList.toggle('active', b.dataset.nav === name));
    document.getElementById('sidebar').classList.remove('open');
    document.getElementById('sidebarBackdrop').classList.remove('open');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    this.refreshTitle();
  },
  refreshTitle() {
    const titleEl = document.getElementById('pageTitle');
    if (titleEl) {
      const key = 'sec' + this.currentView.charAt(0).toUpperCase() + this.currentView.slice(1);
      const val = t(key);
      titleEl.textContent = val !== key ? val : this.currentView;
    }
    document.title = (titleEl ? titleEl.textContent : this.currentView) + ' — ' + t('siteTitle');
  },
  renderAll() {
    this.renderProfile();
    this.renderDashboard();
    this.refreshLinks();
    this.refreshTasks();
    this.renderStoriesSection();
    this.renderSettingsForm();
    this.renderAbout();
    this.renderHolidays();
    if (typeof Calendar !== 'undefined') {
      Calendar.system = Settings.get().defaultCalendar;
      if (Calendar.selected) Calendar.syncFromDate(Calendar.selected);
      Calendar.render();
    }
    if (typeof Clock !== 'undefined') Clock.tick();
    const hd = document.getElementById('headDate');
    if (hd) hd.textContent = fmtShort(new Date());
    this.refreshTitle();
  },
  setLanguage(lang) {
    Settings.update({
      language: lang,
      numerals: lang === 'bn' ? 'bengali' : 'latin',
      defaultCalendar: lang === 'bn' ? 'bengali' : 'gregorian',
    });
  },
  toast(msg, isErr) {
    const wrap = document.getElementById('toastWrap');
    const t = document.createElement('div');
    t.className = 'toast' + (isErr ? ' err' : '');
    t.textContent = msg;
    wrap.appendChild(t);
    setTimeout(() => t.remove(), 4200);
  },
  openModal(html) {
    document.getElementById('modalBody').innerHTML = html;
    document.getElementById('modalBg').classList.add('open');
  },
  closeModal() {
    document.getElementById('modalBg').classList.remove('open');
    Stories.stopSpeak();
  },
  showHoliday(h) {
    this.openModal(
      '<h3>' + esc(holName(h)) + '</h3>' +
      '<p>' + holidayBadge(h) + ' <span class="tag">' + esc(h.date) + '</span>' +
      (h.hijri ? ' <span class="tag">' + t('hijriLabel') + ' ' + esc(h.hijri) + '</span>' : '') + '</p>' +
      '<p>' + esc(holDesc(h)) + '</p>' +
      '<p style="font-size:13px;color:var(--muted)">' + t('sourceLabel') + esc(h.source || '—') + '</p>' +
      '<button class="btn" onclick="App.closeModal()">' + t('closeBtn') + '</button>');
  },
  openStory(id) {
    const s = Stories.list.find(x => x.id === id);
    if (!s) return;
    const idx = Stories.list.indexOf(s);
    this.openModal(
      '<div class="story-prophet">' + esc(s.prophet.ar) + '</div>' +
      '<h3 class="story-title">' + esc(s.title) + '</h3>' +
      '<p class="bn" style="color:var(--muted)">' + esc(Stories.prophetSub(s)) + '</p>' +
      '<p><span class="tag">' + tf('storyOf', { pos: idx + 1, total: Stories.list.length }) + '</span> ' +
      '<span class="tag">' + esc(s.tradition === 'quran' ? t('tradQuran') : t('tradQuranScholar')) + '</span></p>' +
      '<div id="storyFullBody" class="story-body"><p>' + esc(s.summary) + '</p>' +
      '<h4>' + t('histContext') + '</h4><p>' + esc(s.context) + '</p>' +
      '<h4>' + t('lessonsToday') + '</h4><ul>' + s.lessons.map(l => '<li>' + esc(l) + '</li>').join('') + '</ul>' +
      '<h4>' + t('quranRefs') + '</h4><p>' + s.quran.map(q => esc(q.name) + ' ' + q.surah + ':' + q.verses).join(' · ') + '</p>' +
      (s.tradition !== 'quran' ? '<p style="font-size:13px;color:var(--muted)">' + t('storyNote') + '</p>' : '') +
      '</div>' +
      '<div class="toolbar"><button class="btn small" id="mStoryPrev">' + t('prevBtn') + '</button>' +
      '<button class="btn small" id="mStoryNext">' + t('nextBtn') + '</button>' +
      '<button class="icon-btn" id="mStoryLarge">' + t('largerText') + '</button>' +
      '<button class="icon-btn" id="mStorySpeak">' + t('listenBtn') + '</button>' +
      '<button class="icon-btn" id="mStoryMark">' + (Stories.isBookmarked(s.id) ? t('bookmarkedBtn') : t('bookmarkBtn')) + '</button></div>');
    document.getElementById('mStoryPrev').onclick = () => { Stories.index = (idx - 1 + Stories.list.length) % Stories.list.length; this.openStory(Stories.list[Stories.index].id); };
    document.getElementById('mStoryNext').onclick = () => { Stories.index = (idx + 1) % Stories.list.length; this.openStory(Stories.list[Stories.index].id); };
    document.getElementById('mStoryLarge').onclick = () => document.getElementById('storyFullBody').classList.toggle('large');
    document.getElementById('mStorySpeak').onclick = () => Stories.speak(s);
    document.getElementById('mStoryMark').onclick = () => { Stories.toggleBookmark(s.id); this.openStory(s.id); };
  },
  openLinkEditor(id) {
    const l = id ? QuickLinks.links.find(x => x.id === id) : null;
    this.openModal(
      '<h3>' + (l ? t('editLink') : t('addLinkTitle')) + '</h3>' +
      '<div class="form-row two" style="margin-bottom:12px">' +
      '<div><label class="f">' + t('linkTitleLabel') + '</label><input class="input" id="leTitle" value="' + esc(l ? l.title : '') + '"></div>' +
      '<div><label class="f">' + t('linkUrlLabel') + '</label><input class="input" id="leUrl" value="' + esc(l ? l.url : '') + '" placeholder="https://example.com"></div></div>' +
      '<div class="form-row two" style="margin-bottom:12px">' +
      '<div><label class="f">' + t('linkCatLabel') + '</label><select class="select" id="leCat">' +
      ['Work', 'Tools', 'Learning', 'Finance', 'Personal', 'Islamic Resources'].map(c =>
        '<option value="' + c + '"' + (l && l.category === c ? ' selected' : '') + '>' + esc(linkCatLabel(c)) + '</option>').join('') + '</select></div>' +
      '<div><label class="f">' + t('linkDescLabel') + '</label><input class="input" id="leDesc" value="' + esc(l ? l.description : '') + '"></div></div>' +
      '<label class="switch"><input type="checkbox" id="lePin" ' + (l && l.pinned ? 'checked' : '') + '> ' + t('pinFav') + '</label>' +
      '<div class="toolbar" style="margin-top:14px"><button class="btn" id="leSave">' + t('saveLinkBtn') + '</button>' +
      '<button class="btn ghost" onclick="App.closeModal()">' + t('cancelBtn') + '</button></div>');
    document.getElementById('leSave').onclick = () => {
      const data = {
        title: document.getElementById('leTitle').value.trim(),
        url: document.getElementById('leUrl').value.trim(),
        category: document.getElementById('leCat').value,
        description: document.getElementById('leDesc').value.trim(),
        pinned: document.getElementById('lePin').checked,
      };
      const res = l ? QuickLinks.update(l.id, data) : QuickLinks.add(data);
      if (!res.ok) { App.toast(res.error, true); return; }
      App.closeModal();
      App.refreshLinks();
      App.toast(l ? t('linkUpdated') : t('linkAdded'));
    };
  },
  /* ---------- dashboard ---------- */
  renderDashboard() {
    const s = Settings.get();
    const wrap = document.getElementById('dashWidgets');
    if (!wrap) return;
    const profile = Settings.profile();
    const now = new Date();
    const hour = now.getHours();
    const greet = hour < 12 ? t('greetMorning') : hour < 18 ? t('greetAfternoon') : t('greetEvening');
    const bn = gregToBengali(now);
    const hj = hijriParts(now, s.hijriAdjust);
    const cats = s.holidayCategories || [];
    const todayHols = Holidays.forDate(now).filter(h => cats.indexOf(h.category) !== -1);
    const nextHols = Holidays.upcoming(now, 3, cats);
    const story = Stories.current();
    const tasks = Tasks.list.filter(t => !t.done).slice(0, 5);
    const notes = Tasks.notes.slice(0, 3);
    const quote = QUOTES[dayOfYear(now) % QUOTES.length];
    const cards = {
      welcome: '<div class="card s12"><h3><span class="dot"></span>' + t('welcome') + '</h3>' +
        '<p style="font-size:19px;font-weight:700;margin:4px 0">' + esc(greet) + ', ' + esc(profile.name) + '.</p>' +
        '<p style="color:var(--muted)">' + esc(fmtGreg(now)) + ' · ' + esc(profile.location || '') + '</p></div>',
      triple: '<div class="card s4"><h3><span class="dot"></span>' + t('tripleTitle') + '</h3>' +
        '<p>' + t('gregLabel') + ' <b>' + esc(fmtGreg(now)) + '</b><br>' + t('bengLabel') + ' <b>' + esc(toNumerals(bn.day, s.numerals) + ' ' + (curLang() === 'bn' ? bn.monthBn : bn.monthEn) + ' ' + toNumerals(bn.year, s.numerals)) + '</b>' +
        '<br>' + t('hijriLabel') + ' <b>' + (hj ? esc(toNumerals(hj.day, s.numerals) + ' ' + hijriMonthName(hj.month) + ' ' + toNumerals(hj.year, s.numerals) + ' ' + t('ahSuffix')) : t('hijriUnavailable')) + '</b></p>' +
        '<p style="font-size:12px;color:var(--muted)">' + t('hijriNote') + '</p></div>',
      clock: '<div class="card s4"><h3><span class="dot"></span>' + t('liveClock') + '</h3>' +
        '<div class="clock-big" id="dashClockTime">--:--:--</div>' +
        '<div class="clock-sub" id="dashClockDate"></div>' +
        '<p style="margin-top:8px"><button class="btn small ghost" onclick="App.showView(\'clock\')">' + t('openWorldClock') + '</button></p></div>',
      holiday: '<div class="card s4"><h3><span class="dot"></span>' + t('holidaysWidget') + '</h3>' +
        (todayHols.length
          ? '<p>🎉 ' + t('todayLabel') + ' <b>' + esc(todayHols.map(h => holName(h)).join(', ')) + '</b></p>'
          : '<p>' + t('noHolidayToday') + '</p>') +
        (nextHols.length ? '<p>' + t('nextLabel') + ' <b>' + esc(holName(nextHols[0])) + '</b> — ' + esc(nextHols[0].date) + '</p>' : '') +
        '<p><button class="btn small ghost" onclick="App.showView(\'holidays\')">' + t('allHolidays') + '</button></p></div>',
      story: story ? '<div class="card s6"><h3><span class="dot"></span>' + t('dailyStory') + '</h3>' +
        '<p style="font-size:17px;font-weight:700">' + esc(story.title) + '</p>' +
        '<p>' + esc(story.summary.slice(0, 160)) + '…</p>' +
        '<p><button class="btn small" onclick="App.openStory(\'' + esc(story.id) + '\')">' + t('readFullStory') + '</button> ' +
        '<button class="btn small ghost" onclick="App.showView(\'stories\')">' + t('allStories') + '</button></p></div>' : '',
      links: '<div class="card s6"><h3><span class="dot"></span>' + t('myQuickAccess') + '</h3><div id="dashLinks"></div></div>',
      tasks: '<div class="card s6"><h3><span class="dot"></span>' + t('todaysTasks') + '</h3>' +
        (tasks.length ? tasks.map(t => '<p>' + (t.done ? '✅' : '⬜') + ' ' + esc(t.title) + (t.due ? ' <span class="tag">' + esc(t.due) + '</span>' : '') + '</p>').join('')
          : '<p style="color:var(--muted)">' + t('noPendingTasks') + '</p>') +
        '<p><button class="btn small ghost" onclick="App.showView(\'tasks\')">' + t('manageTasks') + '</button></p></div>',
      notes: '<div class="card s6"><h3><span class="dot"></span>' + t('dailyNotes') + '</h3>' +
        (notes.length ? notes.map(n => '<p><b>' + esc(n.title || t('noteFallback')) + ':</b> ' + esc(n.body.slice(0, 110)) + '</p>').join('')
          : '<p style="color:var(--muted)">' + t('noNotesYet') + '</p>') + '</div>',
      week: '<div class="card s6"><h3><span class="dot"></span>' + t('thisWeek') + '</h3><div class="mini-cal">' +
        t('dowShort').map(d => '<div style="font-weight:700;color:var(--muted)">' + d + '</div>').join('') +
        (() => {
          const start = addDays(now, -now.getDay());
          let h = '';
          for (let i = 0; i < 7; i++) {
            const d = addDays(start, i);
            const isToday = todayISO(d) === todayISO(now);
            const hasHol = Holidays.forDate(d).some(x => cats.indexOf(x.category) !== -1);
            h += '<div class="' + (isToday ? 'today' : '') + (hasHol ? ' has-dot' : '') + '">' + d.getDate() + '</div>';
          }
          return h;
        })() + '</div></div>',
      quote: '<div class="card s6"><h3><span class="dot"></span>' + t('dailyInspiration') + '</h3>' +
        '<p class="quote">“' + esc(curLang() === 'bn' && quote.textBn ? quote.textBn : quote.text) + '”<cite>— ' + esc(curLang() === 'bn' && quote.sourceBn ? quote.sourceBn : quote.source) + '</cite></p></div>',
    };
    wrap.innerHTML = (s.widgets || []).map(w => cards[w] || '').join('');
    QuickLinks.render('dashLinks', {});
    // Keep the dashboard clock in sync via the main tick (see clock.js).
    if (window.Clock) Clock.tick();
  },
  refreshLinks() {
    const q = (document.getElementById('linkSearch') || {}).value || '';
    const cat = (document.getElementById('linkCat') || {}).value || 'All';
    const catSel = document.getElementById('linkCat');
    if (catSel) {
      const cur = catSel.value;
      catSel.innerHTML = QuickLinks.categories().map(c => '<option value="' + esc(c) + '"' + (c === cur ? ' selected' : '') + '>' + esc(c === 'All' ? t('all') : linkCatLabel(c)) + '</option>').join('');
    }
    QuickLinks.render('linksGrid', { manage: true, q, cat });
    QuickLinks.render('dashLinks', {});
  },
  refreshTasks() {
    const filter = (document.getElementById('taskFilter') || {}).value || 'all';
    const q = (document.getElementById('taskSearch') || {}).value || '';
    Tasks.renderList(filter === 'all' ? null : filter, q);
    Tasks.renderNotes((document.getElementById('noteSearch') || {}).value || '');
    this.renderDashboard();
  },
  renderStoriesSection() {
    const sel = document.getElementById('storyProphet');
    if (sel) {
      const cur = sel.value;
      sel.innerHTML = Stories.prophets().map(p => '<option value="' + esc(p) + '"' + (p === cur ? ' selected' : '') + '>' + esc(p === 'All' ? t('all') : p) + '</option>').join('');
    }
    Stories.renderFeatured();
    Stories.renderList(
      (document.getElementById('storySearch') || {}).value || '',
      (document.getElementById('storyProphet') || {}).value || 'All');
  },
  renderProfile() {
    const p = Settings.profile();
    const nameEl = document.getElementById('profileName');
    if (nameEl) nameEl.textContent = p.name;
    const roleEl = document.getElementById('profileRole');
    if (roleEl) roleEl.textContent = p.role;
    const avEl = document.getElementById('profileAvatar');
    if (avEl) avEl.textContent = (p.name || '?').trim()[0].toUpperCase();
  },
  renderAbout() {
    const p = Settings.profile();
    const el = document.getElementById('aboutBody');
    if (!el) return;
    el.innerHTML =
      '<div style="display:flex;gap:18px;align-items:center;flex-wrap:wrap">' +
      '<div class="avatar" style="width:84px;height:84px;border-radius:50%;background:var(--gold);color:#111827;display:grid;place-items:center;font-weight:800;font-size:34px">' + esc((p.name || '?').trim()[0].toUpperCase()) + '</div>' +
      '<div><h3 style="margin:0;font-size:22px">' + esc(p.name) + '</h3><p style="color:var(--muted);margin:2px 0">' + esc(p.role) + ' · ' + esc(p.location || '') + '</p>' +
      (p.email ? '<p><a href="mailto:' + esc(p.email) + '">' + esc(p.email) + '</a></p>' : '') + '</div></div>' +
      '<p style="margin-top:14px;max-width:70ch">' + esc(p.bio) + '</p>' +
      '<p style="color:var(--muted)">' + t('aboutBodyNote') + '</p>';
  },
  renderSettingsForm() {
    const s = Settings.get();
    const set = (id, val) => { const el = document.getElementById(id); if (el) el.value = val; };
    set('setTheme', s.theme);
    set('setLanguage', s.language);
    set('setDefaultCalendar', s.defaultCalendar);
    set('setDateFormat', s.dateFormat);
    set('setClockFormat', s.clockFormat);
    set('setTimezone', s.timezone);
    set('setNumerals', s.numerals);
    set('setHijriAdjust', s.hijriAdjust);
    const p = Settings.profile();
    set('profName', p.name); set('profRole', p.role); set('profBio', p.bio);
    set('profEmail', p.email || ''); set('profLocation', p.location || '');
    const wWrap = document.getElementById('widgetSettings');
    if (wWrap) {
      wWrap.innerHTML = (s.widgets || []).map((w, i) =>
        '<div class="list-item"><div class="grow"><h4>' + esc(t('widget_' + w)) + '</h4></div>' +
        '<button class="icon-btn" data-wup="' + i + '">↑</button>' +
        '<button class="icon-btn" data-wdown="' + i + '">↓</button></div>').join('') +
        '<p style="font-size:12.5px;color:var(--muted)">' + t('widgetReorderNote') + '</p>';
      wWrap.querySelectorAll('[data-wup]').forEach(b => {
        b.onclick = () => {
          const st = Settings.get(); const i = +b.dataset.wup;
          if (i > 0) { const t = st.widgets[i - 1]; st.widgets[i - 1] = st.widgets[i]; st.widgets[i] = t; Settings.update({ widgets: st.widgets }); App.renderSettingsForm(); App.renderDashboard(); }
        };
      });
      wWrap.querySelectorAll('[data-wdown]').forEach(b => {
        b.onclick = () => {
          const st = Settings.get(); const i = +b.dataset.wdown;
          if (i < st.widgets.length - 1) { const t = st.widgets[i + 1]; st.widgets[i + 1] = st.widgets[i]; st.widgets[i] = t; Settings.update({ widgets: st.widgets }); App.renderSettingsForm(); App.renderDashboard(); }
        };
      });
    }
    const hWrap = document.getElementById('holCatSettings');
    if (hWrap) {
      hWrap.innerHTML = Object.keys(HOLIDAY_CATS).map(c =>
        '<label class="switch"><input type="checkbox" data-holcat="' + c + '" ' + ((s.holidayCategories || []).indexOf(c) !== -1 ? 'checked' : '') + '> ' + catLabel(c) + '</label>').join(' ');
      hWrap.querySelectorAll('[data-holcat]').forEach(cb => {
        cb.onchange = () => {
          const st = Settings.get();
          let cats = st.holidayCategories || [];
          if (cb.checked) { if (cats.indexOf(cb.dataset.holcat) === -1) cats.push(cb.dataset.holcat); }
          else cats = cats.filter(x => x !== cb.dataset.holcat);
          Settings.update({ holidayCategories: cats });
          App.renderDashboard();
          if (window.Calendar) Calendar.render();
        };
      });
    }
    // Widget visibility checkboxes.
    const visWrap = document.getElementById('widgetVisibility');
    if (visWrap) {
      visWrap.innerHTML = ['welcome', 'triple', 'clock', 'holiday', 'story', 'links', 'tasks', 'notes', 'week', 'quote'].map(w =>
        '<label class="switch"><input type="checkbox" data-vis="' + w + '" ' + ((s.widgets || []).indexOf(w) !== -1 ? 'checked' : '') + '> ' + esc(t('widget_' + w)) + '</label>').join(' ');
      visWrap.querySelectorAll('[data-vis]').forEach(cb => {
        cb.onchange = () => {
          const st = Settings.get();
          let widgets = st.widgets || [];
          if (cb.checked) { if (widgets.indexOf(cb.dataset.vis) === -1) widgets.push(cb.dataset.vis); }
          else widgets = widgets.filter(x => x !== cb.dataset.vis);
          Settings.update({ widgets });
          App.renderSettingsForm();
          App.renderDashboard();
        };
      });
    }
  },
  saveSettingsForm() {
    const get = id => (document.getElementById(id) || {}).value;
    const adj = parseInt(get('setHijriAdjust'), 10);
    Settings.update({
      theme: get('setTheme'),
      language: get('setLanguage'),
      defaultCalendar: get('setDefaultCalendar'),
      dateFormat: get('setDateFormat'),
      clockFormat: get('setClockFormat'),
      timezone: get('setTimezone'),
      numerals: get('setNumerals'),
      hijriAdjust: isNaN(adj) ? 0 : Math.max(-3, Math.min(3, adj)),
    });
    Settings.saveProfile({
      name: get('profName') || t('defaultName'),
      role: get('profRole') || '',
      bio: get('profBio') || '',
      email: get('profEmail') || '',
      location: get('profLocation') || '',
    });
    this.renderProfile();
    this.renderAbout();
    const hd = document.getElementById('headDate');
    if (hd) hd.textContent = fmtShort(new Date());
    if (window.Calendar) { Calendar.system = Settings.get().defaultCalendar; Calendar.syncFromDate(Calendar.selected); Calendar.render(); }
    if (window.Clock) { Clock.tick(); }
    this.renderDashboard();
    this.toast(t('settingsSaved'));
  },
  exportAll() {
    downloadJSON('personal-dashboard-backup.json', {
      exportedAt: new Date().toISOString(),
      settings: Settings.get(),
      profile: Settings.profile(),
      tasks: Tasks.list,
      notes: Tasks.notes,
      quickLinks: QuickLinks.links,
      customHolidays: Holidays.custom,
      storyBookmarks: Stories.bookmarks,
      worldClocks: Clock.cities(),
    });
  },
  async importAll(file) {
    try {
      const data = await readJSONFile(file);
      if (!data || typeof data !== 'object') throw new Error(t('invalidBackup'));
      if (data.settings) store.set('settings', data.settings);
      if (data.profile) store.set('profile', data.profile);
      if (Array.isArray(data.tasks)) store.set('tasks', data.tasks);
      if (Array.isArray(data.notes)) store.set('notes', data.notes);
      if (Array.isArray(data.quickLinks)) store.set('quickLinks', data.quickLinks);
      if (Array.isArray(data.customHolidays)) store.set('customHolidays', data.customHolidays);
      if (Array.isArray(data.storyBookmarks)) store.set('storyBookmarks', data.storyBookmarks);
      if (Array.isArray(data.worldClocks)) store.set('worldClocks', data.worldClocks);
      location.reload();
    } catch (e) { App.toast(e.message || t('importFailed'), true); }
  },
  resetAll() {
    if (!confirm(t('resetConfirm'))) return;
    Object.keys(localStorage).forEach(k => { if (k.indexOf('ppd:') === 0) localStorage.removeItem(k); });
    location.reload();
  },
};
/* ---------- boot ---------- */
document.addEventListener('DOMContentLoaded', async () => {
  Settings.apply();
  await Holidays.load();
  await QuickLinks.load();
  await Stories.load();
  Tasks.load();
  Clock.init();
  Calendar.init();
  App.init();
  // Section-specific bindings that need the DOM ready.
  const bind = (id, fn) => { const el = document.getElementById(id); if (el) el.addEventListener('input', fn); };
  bind('linkSearch', () => App.refreshLinks());
  const linkCat = document.getElementById('linkCat');
  if (linkCat) linkCat.addEventListener('change', () => App.refreshLinks());
  const addLinkBtn = document.getElementById('addLinkBtn');
  if (addLinkBtn) addLinkBtn.onclick = () => App.openLinkEditor(null);
  const linkView = document.getElementById('linkView');
  if (linkView) linkView.onchange = e => {
    QuickLinks.view = e.target.value;
    store.set('linksView', QuickLinks.view);
    App.refreshLinks();
  };
  const linkExport = document.getElementById('linkExport');
  if (linkExport) linkExport.onclick = () => downloadJSON('quick-links.json', QuickLinks.exportJSON());
  const linkImport = document.getElementById('linkImport');
  if (linkImport) linkImport.onchange = async e => {
    if (!e.target.files[0]) return;
    try {
      const data = await readJSONFile(e.target.files[0]);
      const arr = Array.isArray(data) ? data : data.links;
      const res = QuickLinks.importJSON(arr);
      if (!res.ok) App.toast(res.error, true); else { App.toast(tf('importedLinks', { n: res.count })); App.refreshLinks(); }
    } catch (err) { App.toast(err.message, true); }
    e.target.value = '';
  };
  const taskForm = document.getElementById('taskForm');
  if (taskForm) taskForm.addEventListener('submit', e => {
    e.preventDefault();
    const res = Tasks.addTask({
      title: document.getElementById('taskTitle').value.trim(),
      due: document.getElementById('taskDue').value || '',
      priority: document.getElementById('taskPriority').value,
      important: document.getElementById('taskImportant').checked,
    });
    if (!res.ok) { App.toast(res.error, true); return; }
    taskForm.reset();
    App.refreshTasks();
  });
  const taskFilter = document.getElementById('taskFilter');
  if (taskFilter) taskFilter.onchange = () => App.refreshTasks();
  bind('taskSearch', () => App.refreshTasks());
  const noteForm = document.getElementById('noteForm');
  if (noteForm) noteForm.addEventListener('submit', e => {
    e.preventDefault();
    const res = Tasks.addNote({
      title: document.getElementById('noteTitle').value.trim(),
      body: document.getElementById('noteBody').value.trim(),
    });
    if (!res.ok) { App.toast(res.error, true); return; }
    noteForm.reset();
    App.refreshTasks();
  });
  bind('noteSearch', () => App.refreshTasks());
  bind('storySearch', () => App.renderStoriesSection());
  const storyProphet = document.getElementById('storyProphet');
  if (storyProphet) storyProphet.onchange = () => App.renderStoriesSection();
  const holSearch = document.getElementById('holSearch');
  if (holSearch) holSearch.addEventListener('input', () => App.renderHolidays());
  const holCat = document.getElementById('holCat');
  if (holCat) holCat.onchange = () => App.renderHolidays();
  const holAdd = document.getElementById('holAddForm');
  if (holAdd) holAdd.addEventListener('submit', e => {
    e.preventDefault();
    const name = document.getElementById('holName').value.trim();
    const date = document.getElementById('holDate').value;
    const recurring = document.getElementById('holRecurring').checked;
    if (!name) { App.toast(t('holNameRequired'), true); return; }
    let entry = { name, nameBn: document.getElementById('holNameBn').value.trim(), description: document.getElementById('holDesc').value.trim(), source: t('customSource'), status: 'confirmed' };
    if (recurring) {
      if (!date) { App.toast(t('pickRecurringDate'), true); return; }
      const d = parseISO(date);
      entry = Object.assign(entry, { recurring: true, month: d.getMonth() + 1, day: d.getDate() });
    } else {
      if (!date) { App.toast(t('pickDate'), true); return; }
      entry = Object.assign(entry, { recurring: false, date });
    }
    Holidays.addCustom(entry);
    holAdd.reset();
    App.renderHolidays();
    App.toast(t('customAdded'));
  });
  const holExport = document.getElementById('holExport');
  if (holExport) holExport.onclick = () => downloadJSON('holidays.json', { holidays: Holidays.all() });
  const holImport = document.getElementById('holImport');
  if (holImport) holImport.onchange = async e => {
    if (!e.target.files[0]) return;
    try {
      const data = await readJSONFile(e.target.files[0]);
      const arr = Array.isArray(data) ? data : data.holidays;
      const res = Holidays.importJSON(arr);
      if (!res.ok) App.toast(res.error, true); else { App.toast(tf('importedHolidays', { n: res.count })); App.renderHolidays(); }
    } catch (err) { App.toast(err.message, true); }
    e.target.value = '';
  };
  const saveSettings = document.getElementById('saveSettings');
  if (saveSettings) saveSettings.onclick = () => App.saveSettingsForm();
  const exportAll = document.getElementById('exportAll');
  if (exportAll) exportAll.onclick = () => App.exportAll();
  const importAll = document.getElementById('importAll');
  if (importAll) importAll.onchange = e => { if (e.target.files[0]) App.importAll(e.target.files[0]); e.target.value = ''; };
  const resetAll = document.getElementById('resetAll');
  if (resetAll) resetAll.onclick = () => App.resetAll();
  App.renderHolidays();
  if (window.lucide) lucide.createIcons();
});
/* Holiday section rendering (kept on App for reuse). */
App.renderHolidays = function () {
  const el = document.getElementById('holList');
  if (!el) return;
  const q = ((document.getElementById('holSearch') || {}).value || '').toLowerCase();
  const cat = (document.getElementById('holCat') || {}).value || 'All';
  const now = new Date();
  const upcoming = Holidays.upcoming(now, 200, null);
  const list = upcoming.filter(h =>
    (cat === 'All' || h.category === cat) &&
    (!q || h.name.toLowerCase().indexOf(q) !== -1 || (h.nameBn || '').indexOf(q) !== -1));
  const upEl = document.getElementById('holUpcoming');
  if (upEl) {
    const next = Holidays.upcoming(now, 3, Settings.get().holidayCategories || null);
    upEl.innerHTML = next.length
      ? next.map(h => '<p>🎉 <b>' + esc(holName(h)) + '</b> — ' + esc(h.date) + ' ' + holidayBadge(h) + '</p>').join('')
      : '<p style="color:var(--muted)">' + t('noUpcoming') + '</p>';
  }
  if (!list.length) { el.innerHTML = '<div class="empty">' + t('noHolidaysMatch') + '</div>'; return; }
  el.innerHTML = list.map(h =>
    '<div class="list-item"><div class="grow"><h4>' + esc(holName(h)) + ' <span class="tag">' + esc(h.date) + '</span></h4>' +
    '<p>' + holidayBadge(h) + '</p>' +
    '<p>' + esc(holDesc(h)) + '</p></div>' +
    '<button class="btn small ghost" data-hol="' + esc(h.id) + '">' + t('detailsBtn') + '</button>' +
    (h.id.indexOf('custom-') === 0 ? '<button class="icon-btn" data-del="' + esc(h.id) + '">🗑️</button>' : '') + '</div>').join('');
  el.querySelectorAll('[data-hol]').forEach(b => {
    b.onclick = () => {
      const h = list.find(x => x.id === b.dataset.hol) || Holidays.all().find(x => x.id === b.dataset.hol);
      if (h) App.showHoliday(h);
    };
  });
  el.querySelectorAll('[data-del]').forEach(b => {
    b.onclick = () => {
      if (confirm(t('deleteCustomHol'))) { Holidays.deleteCustom(b.dataset.del); App.renderHolidays(); }
    };
  });
};

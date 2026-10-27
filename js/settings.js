/* ============================================================
   settings.js — user preferences, profile, widget visibility
   and order, Hijri adjustment. Persisted in localStorage.
   Language switching is full-mode: Settings.apply() re-applies
   every data-i18n string and, when the language actually
   changed, reloads the stories dataset and re-renders the
   whole app — Bengali means all Bengali, English all English.
   ============================================================ */
'use strict';
const DEFAULT_SETTINGS = {
  theme: 'light',
  language: 'bn',            // 'en' | 'bn' — full UI language
  defaultCalendar: 'bengali',
  dateFormat: 'DD MMM YYYY',
  clockFormat: '12',
  timezone: 'Asia/Dhaka',
  numerals: 'bengali',       // 'latin' | 'bengali' | 'arabic'
  hijriAdjust: 0,            // days, -2..+2 recommended
  widgets: ['welcome', 'triple', 'clock', 'holiday', 'story', 'links', 'tasks', 'notes', 'week', 'quote'],
  holidayCategories: ['bangladesh', 'islamic', 'bengali', 'international', 'personal'],
};
const Settings = {
  _appliedLang: undefined,
  get() {
    const saved = store.get('settings', {});
    return Object.assign({}, DEFAULT_SETTINGS, saved);
  },
  update(patch) {
    const next = Object.assign(this.get(), patch);
    store.set('settings', next);
    this.apply(next);
    return next;
  },
  apply(s) {
    s = s || this.get();
    const prevLang = this._appliedLang;
    const langChanged = prevLang !== undefined && prevLang !== s.language;
    this._appliedLang = s.language;
    if (document.documentElement) document.documentElement.lang = s.language === 'bn' ? 'bn' : 'en';
    if (document.documentElement) document.documentElement.dataset.theme = s.theme === 'dark' ? 'dark' : 'light';
    try {
      if (document.body && document.body.classList) document.body.classList.toggle('reduce-motion', !!window.matchMedia('(prefers-reduced-motion: reduce)').matches);
    } catch (e) { /* matchMedia unavailable */ }
    const themeBtn = document.getElementById('themeToggle');
    if (themeBtn) themeBtn.textContent = s.theme === 'dark' ? t('themeLight') : t('themeDark');
    const langBtn = document.getElementById('langToggle');
    if (langBtn) langBtn.textContent = s.language === 'bn' ? '🌐 English' : '🌐 বাংলা';
    const langSel = document.getElementById('setLanguage');
    if (langSel) langSel.value = s.language;
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.dataset.i18n;
      const val = t(key);
      if (val !== key) el.textContent = val;
    });
    document.querySelectorAll('[data-i18n-ph]').forEach(el => {
      const key = el.dataset.i18nPh;
      const val = t(key);
      if (val !== key) el.placeholder = val;
    });
    if (langChanged) {
      const rerender = () => { if (typeof App !== 'undefined' && App.renderAll) App.renderAll(); };
      if (typeof Stories !== 'undefined' && Stories.load) Stories.load().then(rerender);
      else rerender();
    }
  },
  profile() {
    const fb = {
      name: t('defaultName'), role: t('defaultRole'), bio: t('defaultBio'),
      email: '', location: t('defaultLocation'),
    };
    return store.get('profile', fb);
  },
  saveProfile(p) { store.set('profile', p); },
};

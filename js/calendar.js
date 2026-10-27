/* ============================================================
   calendar.js — interactive triple calendar (Gregorian /
   Bengali / Hijri) with month, week and day views.
   The grid is built from real dates: for Bengali and Hijri
   systems the month's days are converted back to Gregorian
   dates (see date-converter.js), so every cell shows all
   three calendar dates for the same day.
   ============================================================ */
'use strict';
const Calendar = {
  system: 'gregorian',
  year: 0, month: 0,           // year + 0-based month in the current system
  selected: null, view: 'month',
  init() {
    const s = Settings.get();
    this.system = s.defaultCalendar || 'gregorian';
    this.selected = new Date();
    this.view = 'month';
    this.syncFromDate(this.selected);
    this.bind();
    this.render();
  },
  bind() {
    const $ = id => document.getElementById(id);
    $('calPrev').onclick = () => this.step(-1);
    $('calNext').onclick = () => this.step(1);
    $('calToday').onclick = () => this.goToday();
    $('calPrevDay').onclick = () => this.stepDay(-1);
    $('calNextDay').onclick = () => this.stepDay(1);
    $('calSystem').onchange = e => { this.system = e.target.value; this.syncFromDate(this.selected); this.render(); };
    $('calYear').onchange = e => { this.year = +e.target.value; this.render(); };
    $('calMonth').onchange = e => { this.month = +e.target.value; this.render(); };
    document.querySelectorAll('[data-calview]').forEach(b => {
      b.onclick = () => { this.view = b.dataset.calview; this.render(); };
    });
  },
  /* Set year/month from a Gregorian date in the current system. */
  syncFromDate(date) {
    if (this.system === 'bengali') {
      const b = gregToBengali(date);
      this.year = b.year; this.month = b.month;
    } else if (this.system === 'hijri') {
      const h = hijriParts(date, Settings.get().hijriAdjust);
      if (h) { this.year = h.year; this.month = h.month; }
      else { this.year = date.getFullYear(); this.month = date.getMonth(); }
    } else {
      this.year = date.getFullYear(); this.month = date.getMonth();
    }
  },
  /* Gregorian dates of every day in the displayed month. */
  monthDays() {
    const days = [];
    if (this.system === 'bengali') {
      const len = bengaliMonthLength(this.year, this.month);
      for (let d = 1; d <= len; d++) days.push(bengaliToGreg(this.year, this.month, d));
    } else if (this.system === 'hijri') {
      const len = hijriMonthLength(this.year, this.month, Settings.get().hijriAdjust);
      for (let d = 1; d <= len; d++) {
        const g = hijriToGreg(this.year, this.month, d, Settings.get().hijriAdjust);
        if (g) days.push(g);
      }
    } else {
      const len = new Date(this.year, this.month + 1, 0).getDate();
      for (let d = 1; d <= len; d++) days.push(new Date(this.year, this.month, d));
    }
    return days;
  },
  monthName() {
    if (this.system === 'bengali') {
      return Settings.get().language === 'bn' ? BN_MONTHS_BN[this.month] : BN_MONTHS_EN[this.month];
    }
    if (this.system === 'hijri') {
      return Settings.get().language === 'bn' ? HIJRI_MONTHS_BN[this.month] : HIJRI_MONTHS_EN[this.month];
    }
    try {
      return new Intl.DateTimeFormat(curLocale(), { month: 'long' }).format(new Date(this.year, this.month, 1));
    } catch (e) { return 'Month ' + (this.month + 1); }
  },
  step(dir) {
    this.month += dir;
    if (this.month < 0) { this.month = 11; this.year--; }
    if (this.month > 11) { this.month = 0; this.year++; }
    this.render();
  },
  stepDay(dir) {
    this.selected = addDays(this.selected, dir);
    this.syncFromDate(this.selected);
    this.render();
  },
  goToday() {
    this.selected = new Date();
    this.syncFromDate(this.selected);
    this.render();
  },
  select(date) { this.selected = date; this.syncFromDate(date); this.render(); },
  render() {
    if (!this.selected) this.selected = new Date();
    const s = Settings.get();
    const nums = s.numerals || 'latin';
    document.getElementById('calSystem').value = this.system;
    this.renderSelectors();
    document.querySelectorAll('[data-calview]').forEach(b => {
      b.classList.toggle('gold', b.dataset.calview === this.view);
    });
    document.getElementById('calTitle').textContent =
      this.monthName() + ' ' + toNumerals(this.year, nums);
    document.getElementById('calSubtitle').textContent = this.systemTitle();
    if (this.view === 'day') this.renderDay();
    else if (this.view === 'week') this.renderWeek();
    else this.renderMonth();
    this.renderDetail();
    this.renderMonthHolidays();
  },
  systemTitle() {
    const d = this.selected;
    const bn = gregToBengali(d);
    const hj = hijriParts(d, Settings.get().hijriAdjust);
    const nums = Settings.get().numerals || 'latin';
    const bnStr = toNumerals(bn.day, nums) + ' ' + (Settings.get().language === 'bn' ? bn.monthBn : bn.monthEn) + ' ' + toNumerals(bn.year, nums);
    const hjStr = hj ? toNumerals(hj.day, nums) + ' ' + hijriMonthName(hj.month) + ' ' + toNumerals(hj.year, nums) + ' ' + t('ahSuffix') : t('hijriUnavailable');
    return t('selectedLabel') + ' ' + fmtGreg(d) + '  ·  ' + t('bengLabel') + ' ' + bnStr + '  ·  ' + t('hijriLabel') + ' ' + hjStr;
  },
  renderSelectors() {
    const yearSel = document.getElementById('calYear');
    const monthSel = document.getElementById('calMonth');
    const ranges = { gregorian: [2000, 2100], bengali: [1400, 1500], hijri: [1400, 1500] };
    const [lo, hi] = ranges[this.system] || ranges.gregorian;
    let yHtml = '';
    for (let y = lo; y <= hi; y++) yHtml += '<option value="' + y + '"' + (y === this.year ? ' selected' : '') + '>' + toNumerals(y, Settings.get().numerals) + '</option>';
    yearSel.innerHTML = yHtml;
    let mHtml = '';
    for (let m = 0; m < 12; m++) {
      let name;
      if (this.system === 'bengali') name = Settings.get().language === 'bn' ? BN_MONTHS_BN[m] : BN_MONTHS_EN[m];
      else if (this.system === 'hijri') name = Settings.get().language === 'bn' ? HIJRI_MONTHS_BN[m] : HIJRI_MONTHS_EN[m];
      else { try { name = new Intl.DateTimeFormat(curLocale(), { month: 'long' }).format(new Date(2000, m, 1)); } catch (e) { name = 'Month ' + (m + 1); } }
      mHtml += '<option value="' + m + '"' + (m === this.month ? ' selected' : '') + '>' + name + '</option>';
    }
    monthSel.innerHTML = mHtml;
  },
  cellHTML(date) {
    const s = Settings.get();
    const nums = s.numerals || 'latin';
    const bn = gregToBengali(date);
    const hj = hijriParts(date, s.hijriAdjust);
    const today = todayISO(date) === todayISO(new Date());
    const sel = todayISO(date) === todayISO(this.selected);
    const dow = date.getDay();
    const cats = Settings.get().holidayCategories || [];
    const hols = Holidays.forDate(date).filter(h => cats.indexOf(h.category) !== -1);
    const cls = ['cal-cell'];
    if (today) cls.push('today');
    if (dow === 5) cls.push('friday');
    if (sel) cls.push('selected');
    const dots = hols.map(h => '<span class="dot ' + esc(h.category) + '" title="' + esc(h.name) + '"></span>').join('');
    const inMonth = this.monthDays().some(d => todayISO(d) === todayISO(date));
    if (!inMonth) cls.push('outside');
    return '<button type="button" class="' + cls.join(' ') + '" data-date="' + todayISO(date) + '" aria-label="' + esc(fmtGreg(date)) + '">' +
      '<div class="g">' + toNumerals(date.getDate(), nums) + '</div>' +
      '<div class="b">' + toNumerals(bn.day, nums) + ' ' + (s.language === 'bn' ? bn.monthBn : bn.monthEn) + '</div>' +
      '<div class="h">' + (hj ? toNumerals(hj.day, nums) + ' ' + hijriMonthName(hj.month) : '—') + '</div>' +
      '<div class="dots">' + dots + '</div></button>';
  },
  renderMonth() {
    const days = this.monthDays();
    const firstDow = days.length ? days[0].getDay() : 0;
    let html = '<div class="cal-grid">' +
      t('dowShort').map(d => '<div class="cal-dow">' + d + '</div>').join('');
    for (let i = 0; i < firstDow; i++) html += '<div></div>';
    days.forEach(d => { html += this.cellHTML(d); });
    html += '</div>';
    const el = document.getElementById('calGrid');
    el.innerHTML = html;
    el.querySelectorAll('[data-date]').forEach(b => {
      b.onclick = () => this.select(parseISO(b.dataset.date));
    });
  },
  renderWeek() {
    const start = addDays(this.selected, -this.selected.getDay());
    let html = '<div class="cal-grid">' +
      t('dowShort').map(d => '<div class="cal-dow">' + d + '</div>').join('');
    for (let i = 0; i < 7; i++) html += this.cellHTML(addDays(start, i));
    html += '</div>';
    const el = document.getElementById('calGrid');
    el.innerHTML = html;
    el.querySelectorAll('[data-date]').forEach(b => {
      b.onclick = () => this.select(parseISO(b.dataset.date));
    });
  },
  renderDay() {
    document.getElementById('calGrid').innerHTML =
      '<div class="cal-day-detail"><h4>' + esc(fmtGreg(this.selected)) + '</h4><p>' + esc(this.systemTitle()) + '</p></div>';
  },
  renderDetail() {
    const d = this.selected;
    const nums = Settings.get().numerals || 'latin';
    const cats = Settings.get().holidayCategories || [];
    const hols = Holidays.forDate(d).filter(h => cats.indexOf(h.category) !== -1);
    const bn = gregToBengali(d);
    const hj = hijriParts(d, Settings.get().hijriAdjust);
    let html = '<h4>' + esc(fmtGreg(d)) + '</h4>';
    html += '<p>' + t('gregLabel') + ' ' + esc(fmtGreg(d)) + '<br>' + t('bengLabel') + ' ' + esc(toNumerals(bn.day, nums) + ' ' + (curLang() === 'bn' ? bn.monthBn : bn.monthEn) + ' ' + toNumerals(bn.year, nums)) + '<br>';
    html += t('hijriLabel') + ' ' + (hj ? esc(toNumerals(hj.day, nums) + ' ' + hijriMonthName(hj.month) + ' ' + toNumerals(hj.year, nums) + ' ' + t('ahSuffix') + t('hijriCalcNote')) : t('hijriNotAvailable')) + '</p>';
    if (d.getDay() === 5) html += '<p><span class="badge bengali">' + t('fridayBadge') + '</span> ' + t('weekendNote') + '</p>';
    if (hols.length) {
      html += '<h4>' + esc(t('holidaysObservances')) + '</h4>';
      hols.forEach(h => {
        html += '<div class="list-item"><div class="grow"><h4>' + esc(holName(h)) + '</h4><p>' + holidayBadge(h) + '</p><p>' + esc(holDesc(h)) + '</p></div></div>';
      });
    } else {
      html += '<p>' + t('noHolidayDate') + '</p>';
    }
    document.getElementById('calDetail').innerHTML = html;
  },
  renderMonthHolidays() {
    const days = this.monthDays();
    const cats = Settings.get().holidayCategories || [];
    const seen = new Set(), list = [];
    days.forEach(d => {
      Holidays.forDate(d).filter(h => cats.indexOf(h.category) !== -1).forEach(h => {
        if (!seen.has(h.id + h.date)) { seen.add(h.id + h.date); list.push(h); }
      });
    });
    const el = document.getElementById('calMonthHolidays');
    if (!list.length) { el.innerHTML = '<div class="empty">' + t('noHolidaysMonth') + '</div>'; return; }
    el.innerHTML = list.map(h =>
      '<div class="list-item"><div class="grow"><h4>' + esc(holName(h)) + ' <span class="tag">' + esc(h.date) + '</span></h4>' +
      '<p>' + holidayBadge(h) + '</p></div>' +
      '<button class="icon-btn" data-hol="' + esc(h.id) + '">' + t('detailsBtn') + '</button></div>').join('');
    el.querySelectorAll('[data-hol]').forEach(b => {
      b.onclick = () => {
        const h = list.find(x => x.id === b.dataset.hol);
        if (h) App.showHoliday(h);
      };
    });
  },
};

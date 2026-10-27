/* ============================================================
   clock.js — one 1-second interval drives the main clock,
   the analog clock and every world clock. Timezones use
   Intl with IANA names; abbreviations come from Intl parts.
   ============================================================ */
'use strict';
const Clock = {
  timer: null,
  init() {
    this.renderWorldList();
    document.getElementById('clockFormat').onchange = e => {
      Settings.update({ clockFormat: e.target.value }); this.tick();
    };
    document.getElementById('clockTz').onchange = e => {
      Settings.update({ timezone: e.target.value }); this.tick();
    };
    document.getElementById('addCity').onclick = () => this.addCity();
    if (!this.timer) this.timer = setInterval(() => this.tick(), 1000);
    this.tick();
  },
  fmtTime(date, tz, hour12) {
    try {
      return new Intl.DateTimeFormat(curLocale(), {
        timeZone: tz, hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: !!hour12,
      }).format(date);
    } catch (e) { return date.toLocaleTimeString(); }
  },
  tzAbbr(date, tz) {
    try {
      const parts = new Intl.DateTimeFormat('en-US', { timeZone: tz, timeZoneName: 'short' }).formatToParts(date);
      const p = parts.find(x => x.type === 'timeZoneName');
      return p ? p.value : tz;
    } catch (e) { return tz; }
  },
  utcOffset(date, tz) {
    try {
      const here = new Intl.DateTimeFormat('en-US', { timeZone: 'UTC', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).format(date);
      const there = new Intl.DateTimeFormat('en-US', { timeZone: tz, hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).format(date);
      const toMin = s => { const [h, m] = s.split(':').map(Number); return h * 60 + m; };
      let diff = toMin(there) - toMin(here);
      if (diff > 720) diff -= 1440;
      if (diff < -720) diff += 1440;
      const sign = diff >= 0 ? '+' : '-';
      const a = Math.abs(diff);
      return 'UTC' + sign + String(Math.floor(a / 60)).padStart(2, '0') + ':' + String(a % 60).padStart(2, '0');
    } catch (e) { return ''; }
  },
  tick() {
    const s = Settings.get();
    const now = new Date();
    const hour12 = s.clockFormat === '12';
    const tz = s.timezone || 'Asia/Dhaka';
    const tEl = document.getElementById('mainClock');
    if (tEl) tEl.textContent = this.fmtTime(now, tz, hour12);
    const dEl = document.getElementById('mainClockDate');
    if (dEl) {
      try {
        dEl.textContent = new Intl.DateTimeFormat(curLocale(), { timeZone: tz, weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(now) +
          ' · ' + this.tzAbbr(now, tz) + ' (' + this.utcOffset(now, tz) + ')' + (hour12 ? ' · ' + t('hour12') : ' · ' + t('hour24'));
      } catch (e) { dEl.textContent = now.toDateString(); }
    }
    // Analog hands (local time of the chosen timezone, derived from Intl parts).
    try {
      const parts = new Intl.DateTimeFormat('en-US', { timeZone: tz, hour: 'numeric', minute: 'numeric', second: 'numeric', hourCycle: 'h23' }).formatToParts(now);
      const get = t => Number((parts.find(p => p.type === t) || {}).value || 0);
      const h = get('hour') % 12, m = get('minute'), sec = get('second');
      const setRot = (id, deg) => { const el = document.getElementById(id); if (el) el.setAttribute('transform', 'rotate(' + deg + ' 75 75)'); };
      setRot('handH', (h + m / 60) * 30);
      setRot('handM', (m + sec / 60) * 6);
      setRot('handS', sec * 6);
    } catch (e) { /* analog stays still if Intl fails */ }
    // World clocks.
    document.querySelectorAll('[data-wtz]').forEach(el => {
      const tz2 = el.dataset.wtz;
      const t = el.querySelector('.wt-time');
      if (t) t.textContent = this.fmtTime(now, tz2, hour12);
      const d = el.querySelector('.wt-date');
      if (d) {
        try { d.textContent = new Intl.DateTimeFormat(curLocale(), { timeZone: tz2, weekday: 'short', day: 'numeric', month: 'short' }).format(now); }
        catch (e) { d.textContent = ''; }
      }
    });
    // Dashboard header clock (if present).
    const head = document.getElementById('headClock');
    if (head) head.textContent = this.fmtTime(now, tz, hour12);
    // Dashboard clock widget (if present).
    const dashT = document.getElementById('dashClockTime');
    if (dashT) dashT.textContent = this.fmtTime(now, tz, hour12);
    const dashD = document.getElementById('dashClockDate');
    if (dashD) {
      try {
        dashD.textContent = new Intl.DateTimeFormat(curLocale(), { timeZone: tz, weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(now) +
          ' · ' + this.tzAbbr(now, tz) + ' (' + this.utcOffset(now, tz) + ')';
      } catch (e) { dashD.textContent = now.toDateString(); }
    }
  },
  cities() { return store.get('worldClocks', null) || [
    { id: 'c1', label: 'Dhaka', tz: 'Asia/Dhaka' },
    { id: 'c2', label: 'Tokyo', tz: 'Asia/Tokyo' },
    { id: 'c3', label: 'London', tz: 'Europe/London' },
    { id: 'c4', label: 'New York', tz: 'America/New_York' },
    { id: 'c5', label: 'Makkah', tz: 'Asia/Riyadh' },
    { id: 'c6', label: 'Dubai', tz: 'Asia/Dubai' },
  ]; },
  saveCities(list) { store.set('worldClocks', list); },
  renderWorldList() {
    const el = document.getElementById('worldList');
    if (!el) return;
    const list = this.cities();
    if (!list.length) { el.innerHTML = '<div class="empty">' + t('noWorldClocks') + '</div>'; return; }
    el.innerHTML = list.map((c, i) =>
      '<div class="list-item" data-wtz="' + esc(c.tz) + '"><div class="grow"><h4>' + esc(c.label) + ' <span class="tag">' + esc(c.tz) + '</span></h4>' +
      '<p><span class="wt-date"></span> · <span class="tag">' + esc(this.tzAbbr(new Date(), c.tz)) + '</span></p></div>' +
      '<div style="font-size:20px;font-weight:800;font-variant-numeric:tabular-nums" class="wt-time">--:--:--</div>' +
      '<button class="icon-btn" data-up="' + i + '" aria-label="' + t('moveUp') + '">↑</button>' +
      '<button class="icon-btn" data-down="' + i + '" aria-label="' + t('moveDown') + '">↓</button>' +
      '<button class="icon-btn" data-del="' + c.id + '" aria-label="' + t('removeCity') + '">✕</button></div>').join('');
    el.querySelectorAll('[data-del]').forEach(b => { b.onclick = () => { this.saveCities(this.cities().filter(c => c.id !== b.dataset.del)); this.renderWorldList(); }; });
    el.querySelectorAll('[data-up]').forEach(b => {
      b.onclick = () => {
        const list2 = this.cities(); const i = +b.dataset.up;
        if (i > 0) { const tmp = list2[i - 1]; list2[i - 1] = list2[i]; list2[i] = tmp; this.saveCities(list2); this.renderWorldList(); }
      };
    });
    el.querySelectorAll('[data-down]').forEach(b => {
      b.onclick = () => {
        const list2 = this.cities(); const i = +b.dataset.down;
        if (i < list2.length - 1) { const tmp = list2[i + 1]; list2[i + 1] = list2[i]; list2[i] = tmp; this.saveCities(list2); this.renderWorldList(); }
      };
    });
    this.tick();
  },
  addCity() {
    const label = document.getElementById('cityLabel').value.trim();
    const tz = document.getElementById('cityTz').value.trim();
    if (!label) { App.toast(t('enterCity'), true); return; }
    try { new Intl.DateTimeFormat('en-US', { timeZone: tz }); }
    catch (e) { App.toast(t('unknownTz'), true); return; }
    const list = this.cities();
    list.push({ id: uid(), label, tz });
    this.saveCities(list);
    document.getElementById('cityLabel').value = '';
    this.renderWorldList();
    App.toast(t('worldClockAdded'));
  },
};

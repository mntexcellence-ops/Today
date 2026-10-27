/* ============================================================
   holidays.js — holiday dataset, matching, upcoming list,
   custom-holiday CRUD, import/export.
   Schema (data/holidays.json):
     recurring: {id, name, nameBn, category, month, day, ...}
     specific:  {id, name, nameBn, category, date, hijri?, ...}
   Custom holidays are stored in localStorage and merged in.
   ============================================================ */
'use strict';
const HOLIDAY_CATS = {
  bangladesh: 'Bangladesh', islamic: 'Islamic', bengali: 'Bengali',
  international: 'International', personal: 'Personal',
};
const Holidays = {
  builtin: [],
  custom: [],
  async load() {
    let data = null;
    try {
      const res = await fetch('data/holidays.json');
      if (res.ok) data = await res.json();
    } catch (e) { /* file:// or offline: use fallback below */ }
    if (!data || !Array.isArray(data.holidays)) {
      data = (typeof FALLBACK_HOLIDAYS !== 'undefined') ? FALLBACK_HOLIDAYS : { holidays: [] };
    }
    this.builtin = (data.holidays || []).filter(h => h && h.name);
    this.custom = store.get('customHolidays', []).filter(h => h && h.name);
  },
  all() { return this.builtin.concat(this.custom); },
  /* Resolve a stored entry to a concrete date in a Gregorian year. */
  resolve(entry, year) {
    if (entry.recurring) {
      if (!entry.month || !entry.day) return null;
      const d = new Date(year, entry.month - 1, entry.day);
      if (d.getMonth() !== entry.month - 1) return null;
      return d;
    }
    if (entry.date) return parseISO(entry.date);
    return null;
  },
  /* All holidays falling on one Gregorian date. */
  forDate(date) {
    const iso = todayISO(date);
    const out = [];
    this.all().forEach(h => {
      if (h.recurring) {
        if (h.month === date.getMonth() + 1 && h.day === date.getDate()) {
          out.push(Object.assign({}, h, { date: iso, year: date.getFullYear() }));
        }
      } else if (h.date === iso) {
        out.push(Object.assign({}, h, { date: iso, year: date.getFullYear() }));
      }
    });
    return out;
  },
  /* All holidays in a Gregorian month (year, month 0-11). */
  forMonth(year, month) {
    const out = [];
    this.all().forEach(h => {
      if (h.recurring) {
        if (h.month === month + 1) {
          const d = new Date(year, month, h.day);
          if (d.getMonth() === month) out.push(Object.assign({}, h, { date: todayISO(d), year }));
        }
      } else {
        const d = parseISO(h.date);
        if (d.getFullYear() === year && d.getMonth() === month) out.push(Object.assign({}, h, { year }));
      }
    });
    out.sort((a, b) => a.date < b.date ? -1 : 1);
    return out;
  },
  /* Next N holidays from a date (recurring rolls to next year). */
  upcoming(fromDate, limit, categories) {
    const from = new Date(fromDate.getFullYear(), fromDate.getMonth(), fromDate.getDate());
    const out = [];
    this.all().forEach(h => {
      if (categories && categories.length && categories.indexOf(h.category) === -1) return;
      if (h.recurring) {
        let d = new Date(from.getFullYear(), h.month - 1, h.day);
        if (d < from) d = new Date(from.getFullYear() + 1, h.month - 1, h.day);
        if (d.getMonth() === h.month - 1) out.push(Object.assign({}, h, { date: todayISO(d), year: d.getFullYear() }));
      } else {
        const d = parseISO(h.date);
        if (d >= from) out.push(Object.assign({}, h, { year: d.getFullYear() }));
      }
    });
    out.sort((a, b) => a.date < b.date ? -1 : 1);
    return out.slice(0, limit || 8);
  },
  addCustom(h) {
    h.id = 'custom-' + uid();
    h.category = 'personal';
    this.custom.push(h);
    store.set('customHolidays', this.custom);
    return h;
  },
  updateCustom(id, patch) {
    const i = this.custom.findIndex(h => h.id === id);
    if (i === -1) return false;
    this.custom[i] = Object.assign({}, this.custom[i], patch);
    store.set('customHolidays', this.custom);
    return true;
  },
  deleteCustom(id) {
    const before = this.custom.length;
    this.custom = this.custom.filter(h => h.id !== id);
    store.set('customHolidays', this.custom);
    return this.custom.length !== before;
  },
  validateImport(arr) {
    if (!Array.isArray(arr)) return t('importHolidaysArray');
    for (const h of arr) {
      if (!h || typeof h.name !== 'string' || !h.name.trim()) return t('holNeedsName');
      if (!HOLIDAY_CATS[h.category]) return tf('unknownCategory', { cat: h.category });
      if (h.recurring) {
        if (!h.month || !h.day) return t('recurringNeed');
      } else if (!h.date || isNaN(parseISO(h.date).getTime())) {
        return t('holValidDate');
      }
    }
    return null;
  },
  importJSON(arr) {
    const err = this.validateImport(arr);
    if (err) return { ok: false, error: err };
    let n = 0;
    arr.forEach(h => {
      const copy = Object.assign({}, h, { id: 'custom-' + uid(), category: 'personal', source: h.source || t('importedSource') });
      this.custom.push(copy); n++;
    });
    store.set('customHolidays', this.custom);
    return { ok: true, count: n };
  },
};
function holidayBadge(h) {
  const label = catLabel(h.category);
  let html = '<span class="badge ' + esc(h.category) + '">' + esc(label) + '</span>';
  if (h.status === 'tentative') html += ' <span class="badge tentative">' + t('tentative') + '</span>';
  return html;
}

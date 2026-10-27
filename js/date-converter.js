/* ============================================================
   date-converter.js — Gregorian <-> Bengali (Bangladesh rules)
   and Gregorian <-> Hijri (Umm al-Qura tabular via Intl).

   BENGALI CALENDAR — Bangladesh revised calendar (2019 rules):
   * Year starts on Pohela Boishakh = 14 April.
   * Month lengths: Boishakh, Joishtho, Asharh, Srabon, Bhadro,
     Ashwin = 31 days; Kartik, Ogrohayon, Poush, Magh = 30 days;
     Falgun = 29 days, 30 days when the Gregorian year containing
     Falgun (Feb–Mar) is a leap year; Choitro = 30 days.
     (The leap day falls inside Falgun, so every month always
     starts on the same Gregorian date.)
   * Bengali year = Gregorian year − 593 for dates on/after
     14 April, otherwise − 594.
   Verified anchors: 21 Feb 1952 = 8 Falgun 1358;
   14 Apr 2025 = 1 Boishakh 1432; 14 Feb = 1 Falgun.

   HIJRI CALENDAR — computed with Intl 'islamic-umalqura'
   (the tabular Umm al-Qura calendar). It is a CALCULATION and
   may differ by a day from official local moon-sighting
   announcements. The user setting `hijriAdjust` (days) shifts
   the result; see settings.js.
   ============================================================ */
'use strict';
const BN_MONTHS_EN = ['Boishakh', 'Joishtho', 'Asharh', 'Srabon', 'Bhadro', 'Ashwin', 'Kartik', 'Ogrohayon', 'Poush', 'Magh', 'Falgun', 'Choitro'];
const BN_MONTHS_BN = ['বৈশাখ', 'জ্যৈষ্ঠ', 'আষাঢ়', 'শ্রাবণ', 'ভাদ্র', 'আশ্বিন', 'কার্তিক', 'অগ্রহায়ণ', 'পৌষ', 'মাঘ', 'ফাল্গুন', 'চৈত্র'];
const HIJRI_MONTHS_EN = ['Muharram', 'Safar', 'Rabi al-awwal', 'Rabi al-thani', 'Jumada al-awwal', 'Jumada al-thani', 'Rajab', 'Shaban', 'Ramadan', 'Shawwal', 'Dhul-Qadah', 'Dhul-Hijjah'];
const HIJRI_MONTHS_BN = ['মুহাররম', 'সফর', 'রবিউল আউয়াল', 'রবিউস সানি', 'জমাদিউল আউয়াল', 'জমাদিউস সানি', 'রজব', 'শাবান', 'রমজান', 'শাওয়াল', 'জিলকদ', 'জিলহজ'];
const HIJRI_MONTHS_AR = ['محرم', 'صفر', 'ربيع الأول', 'ربيع الآخر', 'جمادى الأولى', 'جمادى الآخرة', 'رجب', 'شعبان', 'رمضان', 'شوال', 'ذو القعدة', 'ذو الحجة'];
const BN_DIGITS = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
const AR_DIGITS = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];

function isGregLeap(y) { return (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0; }
function bnMonthLengths(startGregYear) {
  const l = [31, 31, 31, 31, 31, 31, 30, 30, 30, 30, 29, 30];
  l[10] = isGregLeap(startGregYear + 1) ? 30 : 29;
  return l;
}
/* Gregorian Date -> {day, month (0-11), year, monthEn, monthBn} */
function gregToBengali(date) {
  const y = date.getFullYear();
  const afterNewYear = date.getMonth() > 3 || (date.getMonth() === 3 && date.getDate() >= 14);
  const startYear = afterNewYear ? y : y - 1;
  const start = new Date(startYear, 3, 14);
  let days = Math.floor((date - start) / 86400000);
  const lens = bnMonthLengths(startYear);
  let m = 0;
  while (m < 11 && days >= lens[m]) { days -= lens[m]; m++; }
  return { day: days + 1, month: m, year: startYear - 593, monthEn: BN_MONTHS_EN[m], monthBn: BN_MONTHS_BN[m] };
}
/* Bengali {year, month 0-11, day} -> Gregorian Date */
function bengaliToGreg(y, m, d) {
  const startYear = y + 593;
  const lens = bnMonthLengths(startYear);
  let offset = d - 1;
  for (let i = 0; i < m; i++) offset += lens[i];
  const start = new Date(startYear, 3, 14);
  start.setDate(start.getDate() + offset);
  return start;
}
function bengaliMonthLength(y, m) { return bnMonthLengths(y + 593)[m]; }

/* ---- Hijri via Intl (Umm al-Qura) ---- */
let _hijriFmt = null, _hijriSupported = null;
function hijriSupported() {
  if (_hijriSupported !== null) return _hijriSupported;
  try {
    _hijriFmt = new Intl.DateTimeFormat('en-u-ca-islamic-umalqura', { day: 'numeric', month: 'numeric', year: 'numeric' });
    const p = hijriPartsRaw(new Date());
    _hijriSupported = !!(p && p.year > 1300);
  } catch (e) { _hijriSupported = false; }
  return _hijriSupported;
}
function hijriPartsRaw(date) {
  try {
    const out = {};
    _hijriFmt.formatToParts(date).forEach(part => { if (part.type !== 'literal') out[part.type] = Number(part.value); });
    return out;
  } catch (e) { return null; }
}
/* Apply the user's Hijri day adjustment, then read Intl parts. */
function hijriParts(date, adjust) {
  if (!hijriSupported()) return null;
  const shifted = addDays(date, -(adjust || 0));
  const p = hijriPartsRaw(shifted);
  if (!p || !p.year) return null;
  return { day: p.day, month: p.month - 1, year: p.year };
}
const _hijriStartCache = {};
function hijriMonthStart(hy, hm, adjust) {
  const key = hy + '-' + hm + '-' + (adjust || 0);
  if (_hijriStartCache[key]) return new Date(_hijriStartCache[key]);
  let lo = new Date(2020, 0, 1).getTime(), hi = new Date(2035, 11, 31).getTime(), found = null;
  while (lo <= hi) {
    const mid = new Date(Math.floor((lo + hi) / 2));
    const p = hijriParts(mid, adjust);
    if (!p) break;
    const cmp = p.year !== hy ? (p.year - hy) : (p.month - hm);
    if (cmp < 0) lo = mid.getTime() + 86400000;
    else if (cmp > 0) hi = mid.getTime() - 86400000;
    else { found = mid; hi = mid.getTime() - 86400000; }
  }
  if (!found) return null;
  // Walk back to the exact 1st of the month.
  let d = new Date(found.getFullYear(), found.getMonth(), found.getDate());
  while (true) {
    const prev = addDays(d, -1);
    const p = hijriParts(prev, adjust);
    if (!p || p.year !== hy || p.month !== hm) break;
    d = prev;
  }
  _hijriStartCache[key] = d.getTime();
  return d;
}
function hijriMonthLength(hy, hm, adjust) {
  const s = hijriMonthStart(hy, hm, adjust);
  if (!s) return 30;
  let nm = hm + 1, ny = hy;
  if (nm > 11) { nm = 0; ny++; }
  const ns = hijriMonthStart(ny, nm, adjust);
  if (!ns) return 30;
  return Math.round((ns - s) / 86400000);
}
function hijriToGreg(hy, hm, d, adjust) {
  const s = hijriMonthStart(hy, hm, adjust);
  if (!s) return null;
  return addDays(s, d - 1);
}
/* ---- Numerals & formatting ---- */
function toNumerals(value, system) {
  const s = String(value);
  if (system === 'bengali') return s.replace(/\d/g, d => BN_DIGITS[+d]);
  if (system === 'arabic') return s.replace(/\d/g, d => AR_DIGITS[+d]);
  return s;
}
function fmtGreg(date, locale) {
  try {
    return new Intl.DateTimeFormat(locale || curLocale(), { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(date);
  } catch (e) { return date.toDateString(); }
}
/* Short date honouring Settings.dateFormat (used for header/welcome). */
function fmtShort(date) {
  const dd = String(date.getDate()).padStart(2, '0');
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const yyyy = date.getFullYear();
  let f = 'DD MMM YYYY';
  try { if (typeof Settings !== 'undefined') f = Settings.get().dateFormat || f; } catch (e) {}
  let mon = '';
  try { mon = new Intl.DateTimeFormat(curLocale(), { month: 'short' }).format(date); } catch (e) { mon = mm; }
  if (f === 'DD/MM/YYYY') return dd + '/' + mm + '/' + yyyy;
  if (f === 'MM/DD/YYYY') return mm + '/' + dd + '/' + yyyy;
  if (f === 'YYYY-MM-DD') return yyyy + '-' + mm + '-' + dd;
  return dd + ' ' + mon + ' ' + yyyy;
}
function tripleDate(date, adjust) {
  const bn = gregToBengali(date);
  const hj = hijriParts(date, adjust);
  return { greg: date, bengali: bn, hijri: hj };
}

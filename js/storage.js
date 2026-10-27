/* ============================================================
   storage.js — safe localStorage helpers + app defaults.
   All user data lives under the "ppd:" prefix.
   ============================================================ */
'use strict';
const store = {
  get(key, fallback) {
    try {
      const raw = localStorage.getItem('ppd:' + key);
      if (raw === null || raw === undefined) return fallback;
      return JSON.parse(raw);
    } catch (e) { return fallback; }
  },
  set(key, value) {
    try { localStorage.setItem('ppd:' + key, JSON.stringify(value)); return true; }
    catch (e) { return false; }
  },
  remove(key) { try { localStorage.removeItem('ppd:' + key); } catch (e) {} },
};
function uid() {
  return 'x' + Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}
function esc(s) {
  return String(s == null ? '' : s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}
function downloadJSON(filename, obj) {
  const blob = new Blob([JSON.stringify(obj, null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 2000);
}
function readJSONFile(file) {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => {
      try { resolve(JSON.parse(r.result)); }
      catch (e) { reject(new Error('Invalid JSON file.')); }
    };
    r.onerror = () => reject(new Error('Could not read file.'));
    r.readAsText(file);
  });
}
function isHttpUrl(u) {
  try {
    const p = new URL(u);
    return p.protocol === 'http:' || p.protocol === 'https:';
  } catch (e) { return false; }
}
function todayISO(d) {
  d = d || new Date();
  const y = d.getFullYear(), m = String(d.getMonth() + 1).padStart(2, '0'), day = String(d.getDate()).padStart(2, '0');
  return y + '-' + m + '-' + day;
}
function parseISO(iso) {
  const parts = String(iso).split('-').map(Number);
  return new Date(parts[0], parts[1] - 1, parts[2]);
}
function addDays(date, n) {
  const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  d.setDate(d.getDate() + n);
  return d;
}
function dayOfYear(d) {
  return Math.floor((d - new Date(d.getFullYear(), 0, 0)) / 86400000);
}

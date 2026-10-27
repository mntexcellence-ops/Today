/* ============================================================
   tasks.js — tasks and daily notes, stored in localStorage.
   ============================================================ */
'use strict';
const Tasks = {
  list: [],
  notes: [],
  load() {
    this.list = store.get('tasks', []);
    this.notes = store.get('notes', []);
  },
  save() { store.set('tasks', this.list); store.set('notes', this.notes); },
  addTask(t) {
    if (!t.title || !t.title.trim()) return { ok: false, error: t('taskTitleRequired') };
    this.list.unshift(Object.assign({ id: uid(), done: false, important: false, created: todayISO() }, t));
    this.save();
    return { ok: true };
  },
  updateTask(id, patch) {
    const t = this.list.find(x => x.id === id);
    if (!t) return false;
    Object.assign(t, patch);
    this.save();
    return true;
  },
  deleteTask(id) { this.list = this.list.filter(t => t.id !== id); this.save(); },
  overdue(t) {
    return !t.done && t.due && t.due < todayISO();
  },
  filtered(filter, q) {
    const needle = (q || '').toLowerCase();
    return this.list.filter(t => {
      if (filter === 'pending' && t.done) return false;
      if (filter === 'completed' && !t.done) return false;
      if (filter === 'overdue' && !this.overdue(t)) return false;
      if (needle && t.title.toLowerCase().indexOf(needle) === -1) return false;
      return true;
    });
  },
  progress() {
    const total = this.list.length;
    const done = this.list.filter(t => t.done).length;
    return { total, done, pct: total ? Math.round((done / total) * 100) : 0 };
  },
  addNote(n) {
    if (!n.body || !n.body.trim()) return { ok: false, error: t('noteTextRequired') };
    this.notes.unshift(Object.assign({ id: uid(), date: todayISO() }, n));
    this.save();
    return { ok: true };
  },
  deleteNote(id) { this.notes = this.notes.filter(n => n.id !== id); this.save(); },
  renderList(filter, q) {
    const el = document.getElementById('taskList');
    if (!el) return;
    const list = this.filtered(filter, q);
    const p = this.progress();
    const prog = document.getElementById('taskProgress');
    if (prog) prog.innerHTML = '<div class="progress-track"><div class="progress-bar" style="width:' + p.pct + '%"></div></div>' +
      '<p style="font-size:13px;color:var(--muted)">' + tf('tasksDoneLine', { done: p.done, total: p.total, pct: p.pct, n: this.list.filter(t => this.overdue(t)).length }) + '</p>';
    if (!list.length) { el.innerHTML = '<div class="empty">' + t('noTasksHere') + '</div>'; return; }
    el.innerHTML = list.map(t =>
      '<div class="list-item"><input type="checkbox" ' + (t.done ? 'checked' : '') + ' data-done="' + esc(t.id) + '" aria-label="' + t('markDone') + '" style="width:18px;height:18px;margin-top:3px">' +
      '<div class="grow"><h4 style="' + (t.done ? 'text-decoration:line-through;color:var(--muted)' : '') + '">' +
      (t.important ? '⭐ ' : '') + esc(t.title) + '</h4>' +
      '<p>' + (t.due ? t('duePrefix') + esc(t.due) + ' · ' : '') + t('priorityPrefix') + esc(priLabel(t.priority || 'Medium')) +
      (this.overdue(t) ? ' · <span class="badge tentative">' + t('overdueBadge') + '</span>' : '') + '</p></div>' +
      '<button class="icon-btn" data-imp="' + esc(t.id) + '" title="' + t('importantBtn') + '">' + (t.important ? '⭐' : '☆') + '</button>' +
      '<button class="icon-btn" data-del="' + esc(t.id) + '" title="' + t('deleteBtn') + '">🗑️</button></div>').join('');
    el.querySelectorAll('[data-done]').forEach(cb => {
      cb.onchange = () => { this.updateTask(cb.dataset.done, { done: cb.checked }); App.refreshTasks(); };
    });
    el.querySelectorAll('[data-imp]').forEach(b => {
      b.onclick = () => {
        const t = this.list.find(x => x.id === b.dataset.imp);
        if (t) { this.updateTask(t.id, { important: !t.important }); App.refreshTasks(); }
      };
    });
    el.querySelectorAll('[data-del]').forEach(b => {
      b.onclick = () => { if (confirm(t('deleteTaskQ'))) { this.deleteTask(b.dataset.del); App.refreshTasks(); } };
    });
  },
  renderNotes(q) {
    const el = document.getElementById('noteList');
    if (!el) return;
    const needle = (q || '').toLowerCase();
    const list = this.notes.filter(n =>
      !needle || (n.title || '').toLowerCase().indexOf(needle) !== -1 || n.body.toLowerCase().indexOf(needle) !== -1);
    if (!list.length) { el.innerHTML = '<div class="empty">' + t('noNotesYet') + '</div>'; return; }
    el.innerHTML = list.map(n =>
      '<div class="list-item"><div class="grow"><h4>' + esc(n.title || t('noteFallback')) + ' <span class="tag">' + esc(n.date) + '</span></h4>' +
      '<p>' + esc(n.body) + '</p></div>' +
      '<button class="icon-btn" data-del="' + esc(n.id) + '">🗑️</button></div>').join('');
    el.querySelectorAll('[data-del]').forEach(b => {
      b.onclick = () => { if (confirm(t('deleteNoteQ'))) { this.deleteNote(b.dataset.del); App.refreshTasks(); } };
    });
  },
};

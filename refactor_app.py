# -*- coding: utf-8 -*-
"""Refactor part 2: app.js string swaps for full bilingual i18n."""
BASE = '/home/hatch/workspace/projects/personal-dashboard/'

def patch(path, pairs):
    fp = BASE + path
    text = open(fp, encoding='utf-8').read()
    missing = []
    for old, new in pairs:
        if old not in text:
            missing.append(old)
        else:
            text = text.replace(old, new)
    open(fp, 'w', encoding='utf-8').write(text)
    print('%s: %d/%d applied, %d missing' % (path, len(pairs) - len(missing), len(pairs), len(missing)))
    for m in missing:
        print('  MISSING:', m[:150])
    return missing

patch('js/app.js', [
    ("{ text: 'Indeed, with hardship comes ease.', source: 'Quran, Surah Ash-Sharh 94:6' },",
     "{ text: 'Indeed, with hardship comes ease.', textBn: 'নিশ্চয়ই কষ্টের সাথে স্বস্তি আছে।', source: 'Quran, Surah Ash-Sharh 94:6', sourceBn: 'কুরআন, Surah Ash-Sharh 94:6' },"),
    ("{ text: 'So remember Me, I will remember you.', source: 'Quran, Surah Al-Baqarah 2:152' },",
     "{ text: 'So remember Me, I will remember you.', textBn: 'অতএব তোমরা আমাকে স্মরণ করো, আমিও তোমাদের স্মরণ করব।', source: 'Quran, Surah Al-Baqarah 2:152', sourceBn: 'কুরআন, Surah Al-Baqarah 2:152' },"),
    ("{ text: 'Do not despair of the mercy of Allah.', source: 'Quran, Surah Az-Zumar 39:53' },",
     "{ text: 'Do not despair of the mercy of Allah.', textBn: 'আল্লাহর রহমত থেকে নিরাশ হয়ো না।', source: 'Quran, Surah Az-Zumar 39:53', sourceBn: 'কুরআন, Surah Az-Zumar 39:53' },"),
    ("{ text: 'Allah does not burden a soul beyond what it can bear.', source: 'Quran, Surah Al-Baqarah 2:286' },",
     "{ text: 'Allah does not burden a soul beyond what it can bear.', textBn: 'আল্লাহ কোনো প্রাণের ওপর তার সাধ্যের বাইরে বোঝা চাপান না।', source: 'Quran, Surah Al-Baqarah 2:286', sourceBn: 'কুরআন, Surah Al-Baqarah 2:286' },"),
    ("""{ text: 'Indeed, Allah will not change the condition of a people until they change what is in themselves.', source: "Quran, Surah Ar-Ra'd 13:11" },""",
     """{ text: 'Indeed, Allah will not change the condition of a people until they change what is in themselves.', textBn: 'নিশ্চয়ই আল্লাহ কোনো জাতির অবস্থা পরিবর্তন করেন না, যতক্ষণ না তারা নিজেরা নিজেদের অবস্থা পরিবর্তন করে।', source: "Quran, Surah Ar-Ra'd 13:11", sourceBn: "কুরআন, Surah Ar-Ra'd 13:11" },"""),
    ("{ text: 'And whoever relies upon Allah, then He is sufficient for him.', source: 'Quran, Surah At-Talaq 65:3' },",
     "{ text: 'And whoever relies upon Allah, then He is sufficient for him.', textBn: 'আর যে আল্লাহর ওপর ভরসা করে, তার জন্য তিনিই যথেষ্ট।', source: 'Quran, Surah At-Talaq 65:3', sourceBn: 'কুরআন, Surah At-Talaq 65:3' },"),
    ("{ text: 'The best time to plant a tree was twenty years ago. The second best time is now.', source: 'Proverb' },",
     "{ text: 'The best time to plant a tree was twenty years ago. The second best time is now.', textBn: 'গাছ লাগানোর সেরা সময় ছিল বিশ বছর আগে। দ্বিতীয় সেরা সময় এখন।', source: 'Proverb', sourceBn: 'প্রবাদ' },"),
    ("""const WIDGET_META = {
  welcome: 'Welcome & date', triple: 'Triple-calendar summary', clock: 'Live clock',
  holiday: 'Holidays', story: "Prophet's story", links: 'Quick links',
  tasks: 'Tasks preview', notes: 'Notes preview', week: 'Week preview', quote: 'Daily quote',
};
""", ""),
    ("""    const i18n = I18N[Settings.get().language] || I18N.en;
    const titleEl = document.getElementById('pageTitle');
    if (titleEl) {
      const key = 'sec' + name.charAt(0).toUpperCase() + name.slice(1);
      titleEl.textContent = i18n[key] || name;
    }
""",
     """    this.refreshTitle();
"""),
    ("""  toast(msg, isErr) {""",
     """  refreshTitle() {
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
  toast(msg, isErr) {"""),
    ("""      App.toast(s.theme === 'dark' ? 'Light theme on.' : 'Dark theme on.');""",
     """      App.toast(s.theme === 'dark' ? t('lightThemeOn') : t('darkThemeOn'));"""),
    ("""    const burger = document.getElementById('burger');""",
     """    const langBtn = document.getElementById('langToggle');
    if (langBtn) langBtn.onclick = () => {
      const s = Settings.get();
      this.setLanguage(s.language === 'bn' ? 'en' : 'bn');
    };
    const burger = document.getElementById('burger');"""),
    ("""      '<h3>' + esc(h.name) + '</h3>' +
      '<p class="bn" style="color:var(--muted)">' + esc(h.nameBn || '') + '</p>' +""",
     """      '<h3>' + esc(holName(h)) + '</h3>' +"""),
    ("""      '<p>' + holidayBadge(h) + ' <span class="tag">' + esc(h.date) + '</span>' +
      (h.hijri ? ' <span class="tag">Hijri: ' + esc(h.hijri) + '</span>' : '') + '</p>' +
      '<p>' + esc(h.description || '') + '</p>' +
      '<p style="font-size:13px;color:var(--muted)">Source: ' + esc(h.source || '—') + '</p>' +
      '<button class="btn" onclick="App.closeModal()">Close</button>');""",
     """      '<p>' + holidayBadge(h) + ' <span class="tag">' + esc(h.date) + '</span>' +
      (h.hijri ? ' <span class="tag">' + t('hijriLabel') + ' ' + esc(h.hijri) + '</span>' : '') + '</p>' +
      '<p>' + esc(holDesc(h)) + '</p>' +
      '<p style="font-size:13px;color:var(--muted)">' + t('sourceLabel') + esc(h.source || '—') + '</p>' +
      '<button class="btn" onclick="App.closeModal()">' + t('closeBtn') + '</button>');"""),
    ("""      '<p class="bn" style="color:var(--muted)">' + esc(s.titleBn) + ' · ' + esc(s.prophet.bn) + ' (' + esc(s.prophet.en) + ')</p>' +""",
     """      '<p class="bn" style="color:var(--muted)">' + esc(Stories.prophetSub(s)) + '</p>' +"""),
    ("""      '<p><span class="tag">Story ' + (idx + 1) + ' of ' + Stories.list.length + '</span> ' +
      '<span class="tag">' + esc(s.tradition === 'quran' ? 'Quranic account' : 'Quranic account + classical scholarship') + '</span></p>' +""",
     """      '<p><span class="tag">' + tf('storyOf', { pos: idx + 1, total: Stories.list.length }) + '</span> ' +
      '<span class="tag">' + esc(s.tradition === 'quran' ? t('tradQuran') : t('tradQuranScholar')) + '</span></p>' +"""),
    ("""      '<h4>Historical context</h4><p>' + esc(s.context) + '</p>' +
      '<h4>Lessons for today</h4><ul>' + s.lessons.map(l => '<li>' + esc(l) + '</li>').join('') + '</ul>' +
      '<h4>Quran references</h4><p>' + s.quran.map(q => esc(q.name) + ' ' + q.surah + ':' + q.verses).join(' · ') + '</p>' +
      (s.tradition !== 'quran' ? '<p style="font-size:13px;color:var(--muted)">Note: the Quran gives a brief account here; further detail comes from classical scholarly retellings and is labelled as such.</p>' : '') +""",
     """      '<h4>' + t('histContext') + '</h4><p>' + esc(s.context) + '</p>' +
      '<h4>' + t('lessonsToday') + '</h4><ul>' + s.lessons.map(l => '<li>' + esc(l) + '</li>').join('') + '</ul>' +
      '<h4>' + t('quranRefs') + '</h4><p>' + s.quran.map(q => esc(q.name) + ' ' + q.surah + ':' + q.verses).join(' · ') + '</p>' +
      (s.tradition !== 'quran' ? '<p style="font-size:13px;color:var(--muted)">' + t('storyNote') + '</p>' : '') +"""),
    ("""      '<div class="toolbar"><button class="btn small" id="mStoryPrev">← Previous</button>' +
      '<button class="btn small" id="mStoryNext">Next →</button>' +
      '<button class="icon-btn" id="mStoryLarge">A+ Larger text</button>' +
      '<button class="icon-btn" id="mStorySpeak">🔊 Listen</button>' +
      '<button class="icon-btn" id="mStoryMark">' + (Stories.isBookmarked(s.id) ? '★ Bookmarked' : '☆ Bookmark') + '</button></div>');""",
     """      '<div class="toolbar"><button class="btn small" id="mStoryPrev">' + t('prevBtn') + '</button>' +
      '<button class="btn small" id="mStoryNext">' + t('nextBtn') + '</button>' +
      '<button class="icon-btn" id="mStoryLarge">' + t('largerText') + '</button>' +
      '<button class="icon-btn" id="mStorySpeak">' + t('listenBtn') + '</button>' +
      '<button class="icon-btn" id="mStoryMark">' + (Stories.isBookmarked(s.id) ? t('bookmarkedBtn') : t('bookmarkBtn')) + '</button></div>');"""),
    ("""      '<h3>' + (l ? 'Edit link' : 'Add link') + '</h3>' +""",
     """      '<h3>' + (l ? t('editLink') : t('addLinkTitle')) + '</h3>' +"""),
    ("""      '<div><label class="f">Title *</label><input class="input" id="leTitle" value="' + esc(l ? l.title : '') + '"></div>' +
      '<div><label class="f">URL (http/https) *</label><input class="input" id="leUrl" value="' + esc(l ? l.url : '') + '" placeholder="https://example.com"></div></div>' +""",
     """      '<div><label class="f">' + t('linkTitleLabel') + '</label><input class="input" id="leTitle" value="' + esc(l ? l.title : '') + '"></div>' +
      '<div><label class="f">' + t('linkUrlLabel') + '</label><input class="input" id="leUrl" value="' + esc(l ? l.url : '') + '" placeholder="https://example.com"></div></div>' +"""),
    ("""      '<div><label class="f">Category</label><select class="select" id="leCat">' +
      ['Work', 'Tools', 'Learning', 'Finance', 'Personal', 'Islamic Resources'].map(c =>
        '<option' + (l && l.category === c ? ' selected' : '') + '>' + c + '</option>').join('') + '</select></div>' +
      '<div><label class="f">Description</label><input class="input" id="leDesc" value="' + esc(l ? l.description : '') + '"></div></div>' +""",
     """      '<div><label class="f">' + t('linkCatLabel') + '</label><select class="select" id="leCat">' +
      ['Work', 'Tools', 'Learning', 'Finance', 'Personal', 'Islamic Resources'].map(c =>
        '<option value="' + c + '"' + (l && l.category === c ? ' selected' : '') + '>' + esc(linkCatLabel(c)) + '</option>').join('') + '</select></div>' +
      '<div><label class="f">' + t('linkDescLabel') + '</label><input class="input" id="leDesc" value="' + esc(l ? l.description : '') + '"></div></div>' +"""),
    ("""      '<label class="switch"><input type="checkbox" id="lePin" ' + (l && l.pinned ? 'checked' : '') + '> Pin as favourite</label>' +""",
     """      '<label class="switch"><input type="checkbox" id="lePin" ' + (l && l.pinned ? 'checked' : '') + '> ' + t('pinFav') + '</label>' +"""),
    ("""      '<div class="toolbar" style="margin-top:14px"><button class="btn" id="leSave">Save link</button>' +
      '<button class="btn ghost" onclick="App.closeModal()">Cancel</button></div>');""",
     """      '<div class="toolbar" style="margin-top:14px"><button class="btn" id="leSave">' + t('saveLinkBtn') + '</button>' +
      '<button class="btn ghost" onclick="App.closeModal()">' + t('cancelBtn') + '</button></div>');"""),
    ("""      App.toast(l ? 'Link updated.' : 'Link added.');""",
     """      App.toast(l ? t('linkUpdated') : t('linkAdded'));"""),
    ("""    const greet = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';""",
     """    const greet = hour < 12 ? t('greetMorning') : hour < 18 ? t('greetAfternoon') : t('greetEvening');"""),
    ("""      welcome: '<div class="card s12"><h3><span class="dot"></span>Welcome</h3>' +""",
     """      welcome: '<div class="card s12"><h3><span class="dot"></span>' + t('welcome') + '</h3>' +"""),
    ("""      triple: '<div class="card s4"><h3><span class="dot"></span>Today in three calendars</h3>' +
        '<p>Gregorian: <b>' + esc(fmtGreg(now)) + '</b><br>Bengali: <b>' + esc(bn.day + ' ' + bn.monthEn + ' ' + bn.year) + '</b> <span class="bn">(' + esc(bn.day + ' ' + bn.monthBn + ' ' + bn.year) + ')</span>' +
        '<br>Hijri: <b>' + (hj ? esc(hj.day + ' ' + HIJRI_MONTHS_EN[hj.month] + ' ' + hj.year + ' AH') : 'Unavailable') + '</b></p>' +
        '<p style="font-size:12px;color:var(--muted)">Hijri is calculated (Umm al-Qura) and may differ by a day from local moon sighting. Adjust it in Settings.</p></div>',""",
     """      triple: '<div class="card s4"><h3><span class="dot"></span>' + t('tripleTitle') + '</h3>' +
        '<p>' + t('gregLabel') + ' <b>' + esc(fmtGreg(now)) + '</b><br>' + t('bengLabel') + ' <b>' + esc(toNumerals(bn.day, s.numerals) + ' ' + (curLang() === 'bn' ? bn.monthBn : bn.monthEn) + ' ' + toNumerals(bn.year, s.numerals)) + '</b>' +
        '<br>' + t('hijriLabel') + ' <b>' + (hj ? esc(toNumerals(hj.day, s.numerals) + ' ' + hijriMonthName(hj.month) + ' ' + toNumerals(hj.year, s.numerals) + ' ' + t('ahSuffix')) : t('hijriUnavailable')) + '</b></p>' +
        '<p style="font-size:12px;color:var(--muted)">' + t('hijriNote') + '</p></div>',"""),
    ("""      clock: '<div class="card s4"><h3><span class="dot"></span>Live clock</h3>' +""",
     """      clock: '<div class="card s4"><h3><span class="dot"></span>' + t('liveClock') + '</h3>' +"""),
    ("""        '<p style="margin-top:8px"><button class="btn small ghost" onclick="App.showView(\\'clock\\')">Open world clock →</button></p></div>',""",
     """        '<p style="margin-top:8px"><button class="btn small ghost" onclick="App.showView(\\'clock\\')">' + t('openWorldClock') + '</button></p></div>',"""),
    ("""      holiday: '<div class="card s4"><h3><span class="dot"></span>Holidays</h3>' +
        (todayHols.length
          ? '<p>🎉 Today: <b>' + esc(todayHols.map(h => h.name).join(', ')) + '</b></p>'
          : '<p>No holiday today.</p>') +
        (nextHols.length ? '<p>Next: <b>' + esc(nextHols[0].name) + '</b> — ' + esc(nextHols[0].date) + '</p>' : '') +
        '<p><button class="btn small ghost" onclick="App.showView(\\'holidays\\')">All holidays →</button></p></div>',""",
     """      holiday: '<div class="card s4"><h3><span class="dot"></span>' + t('holidaysWidget') + '</h3>' +
        (todayHols.length
          ? '<p>🎉 ' + t('todayLabel') + ' <b>' + esc(todayHols.map(h => holName(h)).join(', ')) + '</b></p>'
          : '<p>' + t('noHolidayToday') + '</p>') +
        (nextHols.length ? '<p>' + t('nextLabel') + ' <b>' + esc(holName(nextHols[0])) + '</b> — ' + esc(nextHols[0].date) + '</p>' : '') +
        '<p><button class="btn small ghost" onclick="App.showView(\\'holidays\\')">' + t('allHolidays') + '</button></p></div>',"""),
    ("""      story: story ? '<div class="card s6"><h3><span class="dot"></span>Daily Prophet\\'s Story</h3>' +""",
     """      story: story ? '<div class="card s6"><h3><span class="dot"></span>' + t('dailyStory') + '</h3>' +"""),
    ("""        '<p><button class="btn small" onclick="App.openStory(\\'' + esc(story.id) + '\\')">Read full story</button> ' +
        '<button class="btn small ghost" onclick="App.showView(\\'stories\\')">All stories →</button></p></div>' : '',""",
     """        '<p><button class="btn small" onclick="App.openStory(\\'' + esc(story.id) + '\\')">' + t('readFullStory') + '</button> ' +
        '<button class="btn small ghost" onclick="App.showView(\\'stories\\')">' + t('allStories') + '</button></p></div>' : '',"""),
    ("""      tasks: '<div class="card s6"><h3><span class="dot"></span>Today\\'s tasks</h3>' +""",
     """      tasks: '<div class="card s6"><h3><span class="dot"></span>' + t('todaysTasks') + '</h3>' +"""),
    ("""          : '<p style="color:var(--muted)">No pending tasks. Add one from Tasks &amp; Notes.</p>') +
        '<p><button class="btn small ghost" onclick="App.showView(\\'tasks\\')">Manage tasks →</button></p></div>',""",
     """          : '<p style="color:var(--muted)">' + t('noPendingTasks') + '</p>') +
        '<p><button class="btn small ghost" onclick="App.showView(\\'tasks\\')">' + t('manageTasks') + '</button></p></div>',"""),
    ("""      notes: '<div class="card s6"><h3><span class="dot"></span>Daily notes</h3>' +
        (notes.length ? notes.map(n => '<p><b>' + esc(n.title || 'Note') + ':</b> ' + esc(n.body.slice(0, 110)) + '</p>').join('')
          : '<p style="color:var(--muted)">No notes yet.</p>') + '</div>',""",
     """      notes: '<div class="card s6"><h3><span class="dot"></span>' + t('dailyNotes') + '</h3>' +
        (notes.length ? notes.map(n => '<p><b>' + esc(n.title || t('noteFallback')) + ':</b> ' + esc(n.body.slice(0, 110)) + '</p>').join('')
          : '<p style="color:var(--muted)">' + t('noNotesYet') + '</p>') + '</div>',"""),
    ("""      week: '<div class="card s6"><h3><span class="dot"></span>This week</h3><div class="mini-cal">' +
        ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => '<div style="font-weight:700;color:var(--muted)">' + d + '</div>').join('') +""",
     """      week: '<div class="card s6"><h3><span class="dot"></span>' + t('thisWeek') + '</h3><div class="mini-cal">' +
        t('dowShort').map(d => '<div style="font-weight:700;color:var(--muted)">' + d + '</div>').join('') +"""),
    ("""      quote: '<div class="card s6"><h3><span class="dot"></span>Daily inspiration</h3>' +
        '<p class="quote">“' + esc(quote.text) + '”<cite>— ' + esc(quote.source) + '</cite></p></div>',""",
     """      quote: '<div class="card s6"><h3><span class="dot"></span>' + t('dailyInspiration') + '</h3>' +
        '<p class="quote">“' + esc(curLang() === 'bn' && quote.textBn ? quote.textBn : quote.text) + '”<cite>— ' + esc(curLang() === 'bn' && quote.sourceBn ? quote.sourceBn : quote.source) + '</cite></p></div>',"""),
    ("""      links: '<div class="card s6"><h3><span class="dot"></span>My Quick Access</h3><div id="dashLinks"></div></div>',""",
     """      links: '<div class="card s6"><h3><span class="dot"></span>' + t('myQuickAccess') + '</h3><div id="dashLinks"></div></div>',"""),
    ("""      catSel.innerHTML = QuickLinks.categories().map(c => '<option' + (c === cur ? ' selected' : '') + '>' + esc(c) + '</option>').join('');""",
     """      catSel.innerHTML = QuickLinks.categories().map(c => '<option value="' + esc(c) + '"' + (c === cur ? ' selected' : '') + '>' + esc(c === 'All' ? t('all') : linkCatLabel(c)) + '</option>').join('');"""),
    ("""      sel.innerHTML = Stories.prophets().map(p => '<option' + (p === cur ? ' selected' : '') + '>' + esc(p) + '</option>').join('');""",
     """      sel.innerHTML = Stories.prophets().map(p => '<option value="' + esc(p) + '"' + (p === cur ? ' selected' : '') + '>' + esc(p === 'All' ? t('all') : p) + '</option>').join('');"""),
    ("""        '<div class="list-item"><div class="grow"><h4>' + esc(WIDGET_META[w] || w) + '</h4></div>' +""",
     """        '<div class="list-item"><div class="grow"><h4>' + esc(t('widget_' + w)) + '</h4></div>' +"""),
    ("""        '<p style="font-size:12.5px;color:var(--muted)">Use the arrows to reorder dashboard widgets. To hide a widget, remove it from this list with the ✕ button on its row in a future edit — for now, reorder here and toggle visibility below.</p>';""",
     """        '<p style="font-size:12.5px;color:var(--muted)">' + t('widgetReorderNote') + '</p>';"""),
    ("""        '<label class="switch"><input type="checkbox" data-holcat="' + c + '" ' + ((s.holidayCategories || []).indexOf(c) !== -1 ? 'checked' : '') + '> ' + HOLIDAY_CATS[c] + '</label>').join(' ');""",
     """        '<label class="switch"><input type="checkbox" data-holcat="' + c + '" ' + ((s.holidayCategories || []).indexOf(c) !== -1 ? 'checked' : '') + '> ' + catLabel(c) + '</label>').join(' ');"""),
    ("""      visWrap.innerHTML = Object.keys(WIDGET_META).map(w =>""",
     """      visWrap.innerHTML = ['welcome', 'triple', 'clock', 'holiday', 'story', 'links', 'tasks', 'notes', 'week', 'quote'].map(w =>"""),
    ("""        '<label class="switch"><input type="checkbox" data-vis="' + w + '" ' + ((s.widgets || []).indexOf(w) !== -1 ? 'checked' : '') + '> ' + esc(WIDGET_META[w]) + '</label>').join(' ');""",
     """        '<label class="switch"><input type="checkbox" data-vis="' + w + '" ' + ((s.widgets || []).indexOf(w) !== -1 ? 'checked' : '') + '> ' + esc(t('widget_' + w)) + '</label>').join(' ');"""),
    ("""      '<p style="color:var(--muted)">Edit this profile any time from Settings → Profile. This portfolio section is a starting template: replace the bio, add your projects, skills and contact links as you like.</p>';""",
     """      '<p style="color:var(--muted)">' + t('aboutBodyNote') + '</p>';"""),
    ("""      name: get('profName') || 'Your Name',""",
     """      name: get('profName') || t('defaultName'),"""),
    ("""    this.toast('Settings saved.');""",
     """    this.toast(t('settingsSaved'));"""),
    ("""      if (!data || typeof data !== 'object') throw new Error('Invalid backup file.');""",
     """      if (!data || typeof data !== 'object') throw new Error(t('invalidBackup'));"""),
    ("""    } catch (e) { App.toast(e.message || 'Import failed.', true); }""",
     """    } catch (e) { App.toast(e.message || t('importFailed'), true); }"""),
    ("""    if (!confirm('Reset ALL local data (settings, tasks, notes, links, custom holidays, bookmarks)? This cannot be undone.')) return;""",
     """    if (!confirm(t('resetConfirm'))) return;"""),
    ("""      if (!res.ok) App.toast(res.error, true); else { App.toast('Imported ' + res.count + ' links.'); App.refreshLinks(); }""",
     """      if (!res.ok) App.toast(res.error, true); else { App.toast(tf('importedLinks', { n: res.count })); App.refreshLinks(); }"""),
    ("""    if (!name) { App.toast('Holiday name is required.', true); return; }""",
     """    if (!name) { App.toast(t('holNameRequired'), true); return; }"""),
    ("""      if (!date) { App.toast('Pick a date for the recurring holiday.', true); return; }""",
     """      if (!date) { App.toast(t('pickRecurringDate'), true); return; }"""),
    ("""      if (!date) { App.toast('Pick a date.', true); return; }""",
     """      if (!date) { App.toast(t('pickDate'), true); return; }"""),
    ("""    let entry = { name, nameBn: document.getElementById('holNameBn').value.trim(), description: document.getElementById('holDesc').value.trim(), source: 'Custom holiday (added by user)', status: 'confirmed' };""",
     """    let entry = { name, nameBn: document.getElementById('holNameBn').value.trim(), description: document.getElementById('holDesc').value.trim(), source: t('customSource'), status: 'confirmed' };"""),
    ("""    App.toast('Custom holiday added.');""",
     """    App.toast(t('customAdded'));"""),
    ("""      if (!res.ok) App.toast(res.error, true); else { App.toast('Imported ' + res.count + ' holidays.'); App.renderHolidays(); }""",
     """      if (!res.ok) App.toast(res.error, true); else { App.toast(tf('importedHolidays', { n: res.count })); App.renderHolidays(); }"""),
    ("""      ? next.map(h => '<p>🎉 <b>' + esc(h.name) + '</b> — ' + esc(h.date) + ' ' + holidayBadge(h) + '</p>').join('')
      : '<p style="color:var(--muted)">No upcoming holidays found.</p>';""",
     """      ? next.map(h => '<p>🎉 <b>' + esc(holName(h)) + '</b> — ' + esc(h.date) + ' ' + holidayBadge(h) + '</p>').join('')
      : '<p style="color:var(--muted)">' + t('noUpcoming') + '</p>';"""),
    ("""  if (!list.length) { el.innerHTML = '<div class="empty">No holidays match.</div>'; return; }""",
     """  if (!list.length) { el.innerHTML = '<div class="empty">' + t('noHolidaysMatch') + '</div>'; return; }"""),
    ("""    '<div class="list-item"><div class="grow"><h4>' + esc(h.name) + ' <span class="tag">' + esc(h.date) + '</span></h4>' +
    '<p>' + esc(h.nameBn || '') + ' · ' + holidayBadge(h) + '</p>' +
    '<p>' + esc(h.description || '') + '</p></div>' +
    '<button class="btn small ghost" data-hol="' + esc(h.id) + '">Details</button>' +""",
     """    '<div class="list-item"><div class="grow"><h4>' + esc(holName(h)) + ' <span class="tag">' + esc(h.date) + '</span></h4>' +
    '<p>' + holidayBadge(h) + '</p>' +
    '<p>' + esc(holDesc(h)) + '</p></div>' +
    '<button class="btn small ghost" data-hol="' + esc(h.id) + '">' + t('detailsBtn') + '</button>' +"""),
    ("""      if (confirm('Delete this custom holiday?')) { Holidays.deleteCustom(b.dataset.del); App.renderHolidays(); }""",
     """      if (confirm(t('deleteCustomHol'))) { Holidays.deleteCustom(b.dataset.del); App.renderHolidays(); }"""),
])
print('--- refactor part 2 done (app.js) ---')

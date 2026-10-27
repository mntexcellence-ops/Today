# -*- coding: utf-8 -*-
"""Refactor the Personal Dashboard to full bilingual i18n.

- index.html: data-i18n attributes, lang toggle button, i18n.js include.
- js/*.js: replace hardcoded English UI strings with t()/tf() lookups.
- data/holidays.json + quick-links.json: add descBn fields.
- js/fallback-data.js: regenerate incl. FALLBACK_STORIES_BN.
Reports any pair whose old string is not found, so typos surface.
"""
import json, os

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

# ---------------------------------------------------------------- i18n.js
patch('js/i18n.js', [
    ("    footerText: 'Personal Portfolio & Smart Daily Dashboard · Built with vanilla HTML, CSS & JavaScript · Your data stays in your browser.',",
     "    footerText: 'Personal Portfolio & Smart Daily Dashboard · Built with vanilla HTML, CSS & JavaScript · Your data stays in your browser.',\n    siteTitle: 'Personal Portfolio & Smart Daily Dashboard',"),
    ("    footerText: 'ব্যক্তিগত পোর্টফোলিও ও স্মার্ট ডেইলি ড্যাশবোর্ড · ভ্যানিলা HTML, CSS ও JavaScript দিয়ে তৈরি · আপনার ডাটা শুধু আপনার ব্রাউজারেই থাকে।',",
     "    footerText: 'ব্যক্তিগত পোর্টফোলিও ও স্মার্ট ডেইলি ড্যাশবোর্ড · ভ্যানিলা HTML, CSS ও JavaScript দিয়ে তৈরি · আপনার ডাটা শুধু আপনার ব্রাউজারেই থাকে।',\n    siteTitle: 'ব্যক্তিগত পোর্টফোলিও ও স্মার্ট ডেইলি ড্যাশবোর্ড',"),
])
# aboutDashHead keys (insert after sec lines)
_text = open(BASE + 'js/i18n.js', encoding='utf-8').read()
_text = _text.replace("    secDashboard: 'Dashboard', secCalendar: 'Triple Calendar', secHolidays: 'Holidays', secClock: 'World Clock',",
                      "    secDashboard: 'Dashboard', secCalendar: 'Triple Calendar', secHolidays: 'Holidays', secClock: 'World Clock',\n    aboutDashHead: 'About this dashboard',", 1)
_text = _text.replace("    secDashboard: 'ড্যাশবোর্ড', secCalendar: 'ত্রৈধ ক্যালেন্ডার', secHolidays: 'ছুটির দিন', secClock: 'বিশ্ব ঘড়ি',",
                      "    secDashboard: 'ড্যাশবোর্ড', secCalendar: 'ত্রৈধ ক্যালেন্ডার', secHolidays: 'ছুটির দিন', secClock: 'বিশ্ব ঘড়ি',\n    aboutDashHead: 'এই ড্যাশবোর্ড সম্পর্কে',", 1)
open(BASE + 'js/i18n.js', 'w', encoding='utf-8').write(_text)
print('i18n.js: siteTitle + aboutDashHead keys added')

# ---------------------------------------------------------------- index.html
H = [
    ('<html lang="en" data-theme="light">', '<html lang="bn" data-theme="light">'),
    ('<script src="js/storage.js"></script>', '<script src="js/storage.js"></script>\n<script src="js/i18n.js"></script>'),
    ('<button class="burger" id="burger" aria-label="Open menu">☰ Menu</button>',
     '<button class="burger" id="burger" aria-label="Open menu" data-i18n="menu">☰ Menu</button>'),
    ('<button class="btn ghost" id="themeToggle" aria-label="Toggle dark/light theme">🌙 Dark</button>',
     '<button class="btn ghost" id="langToggle">🌐 English</button>\n        <button class="btn ghost" id="themeToggle" aria-label="Toggle dark/light theme">🌙 Dark</button>'),
    ('<p>Triple calendar: Gregorian · Bengali · Hijri (calculated). Hijri dates may differ by a day from local moon sighting — adjust in Settings.</p>',
     '<p data-i18n="sidebarFoot">Triple calendar: Gregorian · Bengali · Hijri (calculated). Hijri dates may differ by a day from local moon sighting — adjust in Settings.</p>'),
    ('<h2 data-i18n="secDashboard">Dashboard</h2><p>Your day at a glance. Reorder or hide widgets from Settings.</p>',
     '<h2 data-i18n="secDashboard">Dashboard</h2><p data-i18n="descDashboard">Your day at a glance. Reorder or hide widgets from Settings.</p>'),
    ('<h2 data-i18n="secCalendar">Triple Calendar</h2><p>Gregorian, Bengali and Hijri dates together. Fridays are marked gold; weekend in Bangladesh is Friday–Saturday.</p>',
     '<h2 data-i18n="secCalendar">Triple Calendar</h2><p data-i18n="descCalendar">Gregorian, Bengali and Hijri dates together. Fridays are marked gold; weekend in Bangladesh is Friday–Saturday.</p>'),
    ('<h2 data-i18n="secHolidays">Holidays</h2><p>Bangladesh public holidays, Islamic observances (tentative where calculated), Bengali festivals, international days and your own events.</p>',
     '<h2 data-i18n="secHolidays">Holidays</h2><p data-i18n="descHolidays">Bangladesh public holidays, Islamic observances (tentative where calculated), Bengali festivals, international days and your own events.</p>'),
    ('<h2 data-i18n="secClock">World Clock</h2><p>One timer drives every clock on this page. Times use IANA timezones.</p>',
     '<h2 data-i18n="secClock">World Clock</h2><p data-i18n="descClock">One timer drives every clock on this page. Times use IANA timezones.</p>'),
    ('<h2 data-i18n="secLinks">Quick Links</h2><p>Your personal bookmarks. Drag cards to reorder. Only http(s) links are opened.</p>',
     '<h2 data-i18n="secLinks">Quick Links</h2><p data-i18n="descLinks">Your personal bookmarks. Drag cards to reorder. Only http(s) links are opened.</p>'),
    ('<h2 data-i18n="secStories">Prophets\' Stories</h2><p>One story a day as a reading schedule — not a claim that the event happened on today\'s date. Quranic accounts are distinguished from classical scholarship.</p>',
     '<h2 data-i18n="secStories">Prophets\' Stories</h2><p data-i18n="descStories">One story a day as a reading schedule — not a claim that the event happened on today\'s date. Quranic accounts are distinguished from classical scholarship.</p>'),
    ('<h2 data-i18n="secTasks">Tasks &amp; Notes</h2><p>Lightweight productivity, saved in your browser.</p>',
     '<h2 data-i18n="secTasks">Tasks &amp; Notes</h2><p data-i18n="descTasks">Lightweight productivity, saved in your browser.</p>'),
    ('<h2 data-i18n="secSettings">Settings</h2><p>Everything is saved in your browser (localStorage). No account, no server, no tracking.</p>',
     '<h2 data-i18n="secSettings">Settings</h2><p data-i18n="descSettings">Everything is saved in your browser (localStorage). No account, no server, no tracking.</p>'),
    ('<h2 data-i18n="secAbout">About / Portfolio</h2><p>Your personal introduction. Edit it from Settings → Profile.</p>',
     '<h2 data-i18n="secAbout">About / Portfolio</h2><p data-i18n="descAbout">Your personal introduction. Edit it from Settings → Profile.</p>'),
    # calendar toolbar
    ('<option value="gregorian">Gregorian</option>', '<option value="gregorian" data-i18n="sysGregorian">Gregorian</option>'),
    ('<option value="bengali">Bengali</option>', '<option value="bengali" data-i18n="sysBengali">Bengali</option>'),
    ('<option value="hijri">Hijri</option>', '<option value="hijri" data-i18n="sysHijri">Hijri</option>'),
    ('<button class="btn ghost" id="calPrev">← Prev</button>', '<button class="btn ghost" id="calPrev" data-i18n="calPrev">← Prev</button>'),
    ('<button class="btn ghost" id="calNext">Next →</button>', '<button class="btn ghost" id="calNext" data-i18n="calNext">Next →</button>'),
    ('<button class="btn gold" id="calToday">Today</button>', '<button class="btn gold" id="calToday" data-i18n="calToday">Today</button>'),
    ('<button class="btn ghost small" data-calview="month">Month view</button>', '<button class="btn ghost small" data-calview="month" data-i18n="monthView">Month view</button>'),
    ('<button class="btn ghost small" data-calview="week">Week view</button>', '<button class="btn ghost small" data-calview="week" data-i18n="weekView">Week view</button>'),
    ('<button class="btn ghost small" data-calview="day">Day view</button>', '<button class="btn ghost small" data-calview="day" data-i18n="dayView">Day view</button>'),
    ('<button class="btn ghost small" id="calPrevDay">← Prev day</button>', '<button class="btn ghost small" id="calPrevDay" data-i18n="prevDay">← Prev day</button>'),
    ('<button class="btn ghost small" id="calNextDay">Next day →</button>', '<button class="btn ghost small" id="calNextDay" data-i18n="nextDay">Next day →</button>'),
    ('<h3><span class="dot"></span>Holidays in this month</h3>', '<h3><span class="dot"></span><span data-i18n="holidaysInMonth">Holidays in this month</span></h3>'),
    # holidays
    ('<h3><span class="dot"></span>Upcoming holidays</h3>', '<h3><span class="dot"></span><span data-i18n="upcomingHolidays">Upcoming holidays</span></h3>'),
    ('<option value="All">All categories</option>', '<option value="All" data-i18n="allCategories">All categories</option>'),
    ('<option value="bangladesh">Bangladesh</option>', '<option value="bangladesh" data-i18n="cat_bangladesh">Bangladesh</option>'),
    ('<option value="islamic">Islamic</option>', '<option value="islamic" data-i18n="cat_islamic">Islamic</option>'),
    ('<option value="international">International</option>', '<option value="international" data-i18n="cat_international">International</option>'),
    ('<option value="personal">Personal</option>', '<option value="personal" data-i18n="cat_personal">Personal</option>'),
    ('<button class="btn ghost" id="holExport">Export JSON</button>', '<button class="btn ghost" id="holExport" data-i18n="exportJson">Export JSON</button>'),
    ('<label class="btn ghost" style="cursor:pointer">Import JSON<input type="file" id="holImport" accept=".json,application/json" hidden></label>',
     '<label class="btn ghost" style="cursor:pointer"><span data-i18n="importJson">Import JSON</span><input type="file" id="holImport" accept=".json,application/json" hidden></label>'),
    ('<h3><span class="dot"></span>Add a custom holiday / personal event</h3>', '<h3><span class="dot"></span><span data-i18n="addCustomHoliday">Add a custom holiday / personal event</span></h3>'),
    ('<label class="f">Name *</label>', '<label class="f" data-i18n="holNameLabel">Name *</label>'),
    ('<label class="f">Name (Bengali, optional)</label>', '<label class="f" data-i18n="holNameBnLabel">Name (Bengali, optional)</label>'),
    ('<label class="f">Date *</label>', '<label class="f" data-i18n="holDateLabel">Date *</label>'),
    ('<label class="switch"><input type="checkbox" id="holRecurring"> Recurring every year on this month/day</label>',
     '<label class="switch"><input type="checkbox" id="holRecurring"> <span data-i18n="holRecurring">Recurring every year on this month/day</span></label>'),
    ('<label class="f">Description</label>', '<label class="f" data-i18n="holDescLabel">Description</label>'),
    ('<button class="btn" type="submit">Add holiday</button>', '<button class="btn" type="submit" data-i18n="addHolidayBtn">Add holiday</button>'),
    # clock
    ('<h3><span class="dot"></span>Main clock</h3>', '<h3><span class="dot"></span><span data-i18n="mainClock">Main clock</span></h3>'),
    ('<label class="f">Clock format</label>', '<label class="f" data-i18n="clockFormatLabel">Clock format</label>'),
    ('<option value="12">12-hour</option>', '<option value="12" data-i18n="hour12">12-hour</option>'),
    ('<option value="24">24-hour</option>', '<option value="24" data-i18n="hour24">24-hour</option>'),
    ('<label class="f">Timezone</label>', '<label class="f" data-i18n="timezoneLabel">Timezone</label>'),
    ('<h3><span class="dot"></span>World clocks</h3>', '<h3><span class="dot"></span><span data-i18n="worldClocks">World clocks</span></h3>'),
    ('<label class="f">City name</label>', '<label class="f" data-i18n="cityLabel">City name</label>'),
    ('placeholder="e.g. Singapore"', 'placeholder="e.g. Singapore" data-i18n-ph="cityPh"'),
    ('<label class="f">IANA timezone</label>', '<label class="f" data-i18n="tzLabel">IANA timezone</label>'),
    ('placeholder="e.g. Asia/Singapore"', 'placeholder="e.g. Asia/Singapore" data-i18n-ph="tzPh"'),
    ('<button class="btn" id="addCity">Add city</button>', '<button class="btn" id="addCity" data-i18n="addCityBtn">Add city</button>'),
    # links
    ('<option value="grid">Grid view</option>', '<option value="grid" data-i18n="gridView">Grid view</option>'),
    ('<option value="list">List view</option>', '<option value="list" data-i18n="listView">List view</option>'),
    ('<button class="btn ghost" id="linkExport">Export JSON</button>', '<button class="btn ghost" id="linkExport" data-i18n="exportJson">Export JSON</button>'),
    ('<label class="btn ghost" style="cursor:pointer">Import JSON<input type="file" id="linkImport" accept=".json,application/json" hidden></label>',
     '<label class="btn ghost" style="cursor:pointer"><span data-i18n="importJson">Import JSON</span><input type="file" id="linkImport" accept=".json,application/json" hidden></label>'),
    # stories
    ('<h3><span class="dot"></span>Featured story</h3>', '<h3><span class="dot"></span><span data-i18n="featuredStory">Featured story</span></h3>'),
    # tasks
    ('<h3><span class="dot"></span>Tasks</h3>', '<h3><span class="dot"></span><span data-i18n="tasksTitle">Tasks</span></h3>'),
    ('<label class="f">Task *</label>', '<label class="f" data-i18n="taskLabel">Task *</label>'),
    ('<label class="f">Due date</label>', '<label class="f" data-i18n="dueLabel">Due date</label>'),
    ('<label class="f">Priority</label>', '<label class="f" data-i18n="priorityLabel">Priority</label>'),
    ('<option>Low</option>', '<option value="Low" data-i18n="priLow">Low</option>'),
    ('<option selected>Medium</option>', '<option value="Medium" data-i18n="priMedium" selected>Medium</option>'),
    ('<option>High</option>', '<option value="High" data-i18n="priHigh">High</option>'),
    ('<label class="switch"><input type="checkbox" id="taskImportant"> Important</label>',
     '<label class="switch"><input type="checkbox" id="taskImportant"> <span data-i18n="importantLabel">Important</span></label>'),
    ('<option value="all">All</option>', '<option value="all" data-i18n="allFilter">All</option>'),
    ('<option value="pending">Pending</option>', '<option value="pending" data-i18n="pendingFilter">Pending</option>'),
    ('<option value="completed">Completed</option>', '<option value="completed" data-i18n="completedFilter">Completed</option>'),
    ('<option value="overdue">Overdue</option>', '<option value="overdue" data-i18n="overdueFilter">Overdue</option>'),
    ('<h3><span class="dot"></span>Daily notes</h3>', '<h3><span class="dot"></span><span data-i18n="dailyNotes">Daily notes</span></h3>'),
    ('<label class="f">Title</label>', '<label class="f" data-i18n="noteTitleLabel">Title</label>'),
    ('<label class="f">Note *</label>', '<label class="f" data-i18n="noteLabel">Note *</label>'),
    ('<button class="btn" type="submit">Save note</button>', '<button class="btn" type="submit" data-i18n="saveNoteBtn">Save note</button>'),
    # settings
    ('<h3><span class="dot"></span>Appearance &amp; language</h3>', '<h3><span class="dot"></span><span data-i18n="appearanceLang">Appearance &amp; language</span></h3>'),
    ('<label class="f">Theme</label>', '<label class="f" data-i18n="themeLabel">Theme</label>'),
    ('<option value="light">Light</option>', '<option value="light" data-i18n="lightOpt">Light</option>'),
    ('<option value="dark">Dark</option>', '<option value="dark" data-i18n="darkOpt">Dark</option>'),
    ('<label class="f">Interface language</label>', '<label class="f" data-i18n="langLabel">Interface language</label>'),
    ('<label class="f">Numeral system</label>', '<label class="f" data-i18n="numeralsLabel">Numeral system</label>'),
    ('<option value="latin">Latin (0–9)</option>', '<option value="latin" data-i18n="numeralsLatin">Latin (0–9)</option>'),
    ('<option value="bengali">Bengali (০–৯)</option>', '<option value="bengali" data-i18n="numeralsBengali">Bengali (০–৯)</option>'),
    ('<option value="arabic">Arabic-Indic (٠–٩)</option>', '<option value="arabic" data-i18n="numeralsArabic">Arabic-Indic (٠–٩)</option>'),
    ('<label class="f">Date format (short dates)</label>', '<label class="f" data-i18n="dateFormatLabel">Date format (short dates)</label>'),
    ('<h3><span class="dot"></span>Calendar &amp; clock</h3>', '<h3><span class="dot"></span><span data-i18n="calendarClock">Calendar &amp; clock</span></h3>'),
    ('<label class="f">Default calendar system</label>', '<label class="f" data-i18n="defaultCalLabel">Default calendar system</label>'),
    ('<label class="f">Main timezone</label>', '<label class="f" data-i18n="mainTzLabel">Main timezone</label>'),
    ('<label class="f">Hijri date adjustment (days, −3…+3)</label>', '<label class="f" data-i18n="hijriAdjustLabel">Hijri date adjustment (days, −3…+3)</label>'),
    ('<p style="font-size:12px;color:var(--muted)">Use this when the calculated Hijri date differs from your local moon-sighting announcement.</p>',
     '<p style="font-size:12px;color:var(--muted)" data-i18n="hijriAdjustNote">Use this when the calculated Hijri date differs from your local moon-sighting announcement.</p>'),
    ('<h3><span class="dot"></span>Profile (shown in the sidebar &amp; About)</h3>', '<h3><span class="dot"></span><span data-i18n="profileHead">Profile (shown in the sidebar &amp; About)</span></h3>'),
    ('<label class="f">Name</label>', '<label class="f" data-i18n="nameLabel">Name</label>'),
    ('<label class="f">Role / title</label>', '<label class="f" data-i18n="roleLabel">Role / title</label>'),
    ('<label class="f">Email</label>', '<label class="f" data-i18n="emailLabel">Email</label>'),
    ('<label class="f">Location</label>', '<label class="f" data-i18n="locationLabel">Location</label>'),
    ('<label class="f">Bio</label>', '<label class="f" data-i18n="bioLabel">Bio</label>'),
    ('<h3><span class="dot"></span>Dashboard widgets</h3>', '<h3><span class="dot"></span><span data-i18n="widgetsHead">Dashboard widgets</span></h3>'),
    ('<p class="s">Show / hide widgets:</p>', '<p class="s" data-i18n="showHideWidgets">Show / hide widgets:</p>'),
    ('<p class="s">Reorder widgets (top = first on the dashboard):</p>', '<p class="s" data-i18n="reorderWidgets">Reorder widgets (top = first on the dashboard):</p>'),
    ('<h3><span class="dot"></span>Holiday categories shown</h3>', '<h3><span class="dot"></span><span data-i18n="holCatsHead">Holiday categories shown</span></h3>'),
    ('<h3><span class="dot"></span>Data</h3>', '<h3><span class="dot"></span><span data-i18n="dataHead">Data</span></h3>'),
    ('<p class="s">Export everything as one backup JSON, or restore from a backup. Reset clears all local data after confirmation.</p>',
     '<p class="s" data-i18n="exportDataNote">Export everything as one backup JSON, or restore from a backup. Reset clears all local data after confirmation.</p>'),
    ('<button class="btn" id="saveSettings">Save settings</button>', '<button class="btn" id="saveSettings" data-i18n="saveSettingsBtn">Save settings</button>'),
    ('<button class="btn ghost" id="exportAll">Export all data</button>', '<button class="btn ghost" id="exportAll" data-i18n="exportAllBtn">Export all data</button>'),
    ('<label class="btn ghost" style="cursor:pointer">Import backup<input type="file" id="importAll" accept=".json,application/json" hidden></label>',
     '<label class="btn ghost" style="cursor:pointer"><span data-i18n="importBackupBtn">Import backup</span><input type="file" id="importAll" accept=".json,application/json" hidden></label>'),
    ('<button class="btn danger" id="resetAll">Reset all local data</button>', '<button class="btn danger" id="resetAll" data-i18n="resetAllBtn">Reset all local data</button>'),
    # about
    ('<h3><span class="dot"></span>About this dashboard</h3>', '<h3><span class="dot"></span><span data-i18n="aboutDashHead">About this dashboard</span></h3>'),
    ('<p>Built with HTML5, CSS3 and vanilla JavaScript (ES6+) — no frontend framework. Data lives in JSON files (<code>data/</code>) and your own entries in localStorage.',
     '<p data-i18n="aboutPara">Built with HTML5, CSS3 and vanilla JavaScript (ES6+) — no frontend framework. Data lives in JSON files (data/) and your own entries in localStorage.'),
    ('<p class="foot">Personal Portfolio &amp; Smart Daily Dashboard · Built with vanilla HTML, CSS &amp; JavaScript · Your data stays in your browser.</p>',
     '<p class="foot" data-i18n="footerText">Personal Portfolio &amp; Smart Daily Dashboard · Built with vanilla HTML, CSS &amp; JavaScript · Your data stays in your browser.</p>'),
]
patch('index.html', H)

# ---------------------------------------------------------------- date-converter.js
patch('js/date-converter.js', [
    ("new Intl.DateTimeFormat(locale || 'en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })",
     "new Intl.DateTimeFormat(locale || curLocale(), { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })"),
    ("new Intl.DateTimeFormat('en-GB', { month: 'short' })",
     "new Intl.DateTimeFormat(curLocale(), { month: 'short' })"),
])

# ---------------------------------------------------------------- calendar.js
patch('js/calendar.js', [
    ("new Intl.DateTimeFormat('en-GB', { month: 'long' })",
     "new Intl.DateTimeFormat(curLocale(), { month: 'long' })"),
    ("return 'Selected: ' + fmtGreg(d) + '  ·  Bengali: ' + bnStr + '  ·  Hijri: ' + hjStr;",
     "return t('selectedLabel') + ' ' + fmtGreg(d) + '  ·  ' + t('bengLabel') + ' ' + bnStr + '  ·  ' + t('hijriLabel') + ' ' + hjStr;"),
    ("const hjStr = hj ? toNumerals(hj.day, nums) + ' ' + HIJRI_MONTHS_EN[hj.month] + ' ' + toNumerals(hj.year, nums) + ' AH' : 'Hijri unavailable';",
     "const hjStr = hj ? toNumerals(hj.day, nums) + ' ' + hijriMonthName(hj.month) + ' ' + toNumerals(hj.year, nums) + ' ' + t('ahSuffix') : t('hijriUnavailable');"),
    ("HIJRI_MONTHS_EN[hj.month]", "hijriMonthName(hj.month)"),
    ("['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => '<div class=\"cal-dow\">' + d + '</div>')",
     "t('dowShort').map(d => '<div class=\"cal-dow\">' + d + '</div>')"),
    ("  renderDetail() {\n    const d = this.selected;",
     "  renderDetail() {\n    const d = this.selected;\n    const nums = Settings.get().numerals || 'latin';"),
    ("html += '<p>Gregorian: ' + esc(fmtGreg(d)) + '<br>Bengali: ' + esc(bn.day + ' ' + bn.monthEn + ' ' + bn.year + ' (' + bn.day + ' ' + bn.monthBn + ' ' + bn.year + ')') + '<br>';",
     "html += '<p>' + t('gregLabel') + ' ' + esc(fmtGreg(d)) + '<br>' + t('bengLabel') + ' ' + esc(toNumerals(bn.day, nums) + ' ' + (curLang() === 'bn' ? bn.monthBn : bn.monthEn) + ' ' + toNumerals(bn.year, nums)) + '<br>';"),
    ("html += 'Hijri: ' + (hj ? esc(hj.day + ' ' + hijriMonthName(hj.month) + ' ' + hj.year + ' AH — calculated (Umm al-Qura), may differ by a day from local moon sighting') : 'Hijri calendar is not available in this browser.') + '</p>';",
     "html += t('hijriLabel') + ' ' + (hj ? esc(toNumerals(hj.day, nums) + ' ' + hijriMonthName(hj.month) + ' ' + toNumerals(hj.year, nums) + ' ' + t('ahSuffix') + t('hijriCalcNote')) : t('hijriNotAvailable')) + '</p>';"),
    ("html += '<p><span class=\"badge bengali\">Friday</span> Weekend day in Bangladesh.</p>';",
     "html += '<p><span class=\"badge bengali\">' + t('fridayBadge') + '</span> ' + t('weekendNote') + '</p>';"),
    ("html += '<h4>Holidays &amp; observances</h4>';",
     "html += '<h4>' + esc(t('holidaysObservances')) + '</h4>';"),
    ("html += '<div class=\"list-item\"><div class=\"grow\"><h4>' + esc(h.name) + '</h4><p>' + esc(h.nameBn || '') + ' · ' + holidayBadge(h) + '</p><p>' + esc(h.description || '') + '</p></div></div>';",
     "html += '<div class=\"list-item\"><div class=\"grow\"><h4>' + esc(holName(h)) + '</h4><p>' + holidayBadge(h) + '</p><p>' + esc(holDesc(h)) + '</p></div></div>';"),
    ("html += '<p>No holiday or observance on this date.</p>';",
     "html += '<p>' + t('noHolidayDate') + '</p>';"),
    ("if (!list.length) { el.innerHTML = '<div class=\"empty\">No holidays in this month.</div>'; return; }",
     "if (!list.length) { el.innerHTML = '<div class=\"empty\">' + t('noHolidaysMonth') + '</div>'; return; }"),
    ("'<div class=\"list-item\"><div class=\"grow\"><h4>' + esc(h.name) + ' <span class=\"tag\">' + esc(h.date) + '</span></h4>' +\n      '<p>' + esc(h.nameBn || '') + ' · ' + holidayBadge(h) + '</p></div>' +",
     "'<div class=\"list-item\"><div class=\"grow\"><h4>' + esc(holName(h)) + ' <span class=\"tag\">' + esc(h.date) + '</span></h4>' +\n      '<p>' + holidayBadge(h) + '</p></div>' +"),
    ("data-hol=\"' + esc(h.id) + '\">Details</button>", "data-hol=\"' + esc(h.id) + '\">' + t('detailsBtn') + '</button>"),
])

# ---------------------------------------------------------------- clock.js
patch('js/clock.js', [
    ("'en-GB'", "curLocale()"),
    ("+ (hour12 ? ' · 12-hour' : ' · 24-hour')", "+ (hour12 ? ' · ' + t('hour12') : ' · ' + t('hour24'))"),
    ("el.innerHTML = '<div class=\"empty\">No world clocks yet. Add a city below.</div>';",
     "el.innerHTML = '<div class=\"empty\">' + t('noWorldClocks') + '</div>';"),
    ('aria-label="Move up"', 'aria-label="\' + t(\'moveUp\') + \'"'),
    ('aria-label="Move down"', 'aria-label="\' + t(\'moveDown\') + \'"'),
    ('aria-label="Remove"', 'aria-label="\' + t(\'removeCity\') + \'"'),
    ("App.toast('Please enter a city name.', true);", "App.toast(t('enterCity'), true);"),
    ("App.toast('Unknown timezone. Use an IANA name like Asia/Dhaka.', true);", "App.toast(t('unknownTz'), true);"),
    ("App.toast('World clock added.');", "App.toast(t('worldClockAdded'));"),
])

# ---------------------------------------------------------------- holidays.js
patch('js/holidays.js', [
    ("const label = HOLIDAY_CATS[h.category] || h.category;", "const label = catLabel(h.category);"),
    ("html += ' <span class=\"badge tentative\">Tentative</span>';", "html += ' <span class=\"badge tentative\">' + t('tentative') + '</span>';"),
    ("if (!Array.isArray(arr)) return 'Import must be a JSON array of holidays.';", "if (!Array.isArray(arr)) return t('importHolidaysArray');"),
    ("if (!h || typeof h.name !== 'string' || !h.name.trim()) return 'Every holiday needs a name.';", "if (!h || typeof h.name !== 'string' || !h.name.trim()) return t('holNeedsName');"),
    ("if (!HOLIDAY_CATS[h.category]) return 'Unknown category: ' + h.category;", "if (!HOLIDAY_CATS[h.category]) return tf('unknownCategory', { cat: h.category });"),
    ("if (!h.month || !h.day) return 'Recurring holidays need month and day.';", "if (!h.month || !h.day) return t('recurringNeed');"),
    ("return 'Each holiday needs a valid date (YYYY-MM-DD) or recurring month/day.';", "return t('holValidDate');"),
    ("source: h.source || 'Imported JSON'", "source: h.source || t('importedSource')"),
])

# ---------------------------------------------------------------- quick-links.js
patch('js/quick-links.js', [
    ("el.innerHTML = '<div class=\"empty\">No links match. Add your first quick link below.</div>';",
     "el.innerHTML = '<div class=\"empty\">' + t('noLinksMatch') + '</div>';"),
    ('title="Drag to reorder"', 'title="\' + t(\'dragReorder\') + \'"'),
    ('title="Pinned"', 'title="\' + t(\'pinnedTitle\') + \'"'),
    ('title="Pin/unpin"', 'title="\' + t(\'pinUnpin\') + \'"'),
    ('title="Edit"', 'title="\' + t(\'editBtn\') + \'"'),
    ('title="Delete"', 'title="\' + t(\'deleteBtn\') + \'"'),
    ("'<p>' + esc(l.description || host) + '</p>'", "'<p>' + esc(linkDesc(l) || host) + '</p>'"),
    ("'<p><span class=\"tag\">' + esc(l.category || 'Personal') + '</span></p></div>'",
     "'<p><span class=\"tag\">' + esc(linkCatLabel(l.category || 'Personal')) + '</span></p></div>'"),
    ("if (confirm('Delete this link?'))", "if (confirm(t('deleteLinkQ')))"),
    ("if (!link.title || !link.title.trim()) return { ok: false, error: 'Title is required.' };",
     "if (!link.title || !link.title.trim()) return { ok: false, error: t('titleRequired') };"),
    ("if (!isHttpUrl(link.url)) return { ok: false, error: 'Please enter a valid http(s) URL. Other schemes are not opened for safety.' };",
     "if (!isHttpUrl(link.url)) return { ok: false, error: t('validUrl') };"),
    ("if (!l) return { ok: false, error: 'Link not found.' };",
     "if (!l) return { ok: false, error: t('linkNotFound') };"),
    ("if (patch.url && !isHttpUrl(patch.url)) return { ok: false, error: 'Please enter a valid http(s) URL.' };",
     "if (patch.url && !isHttpUrl(patch.url)) return { ok: false, error: t('validUrlShort') };"),
    ("if (!Array.isArray(arr)) return { ok: false, error: 'Import must be a JSON array of links.' };",
     "if (!Array.isArray(arr)) return { ok: false, error: t('importLinksArray') };"),
    ("if (!l || !l.title || !isHttpUrl(l.url)) return { ok: false, error: 'Every link needs a title and a valid http(s) URL.' };",
     "if (!l || !l.title || !isHttpUrl(l.url)) return { ok: false, error: t('everyLinkNeeds') };"),
])

# ---------------------------------------------------------------- tasks.js
patch('js/tasks.js', [
    ("if (!t.title || !t.title.trim()) return { ok: false, error: 'Task title is required.' };",
     "if (!t.title || !t.title.trim()) return { ok: false, error: t('taskTitleRequired') };"),
    ("if (!n.body || !n.body.trim()) return { ok: false, error: 'Note text is required.' };",
     "if (!n.body || !n.body.trim()) return { ok: false, error: t('noteTextRequired') };"),
    ("'<p style=\"font-size:13px;color:var(--muted)\">' + p.done + ' of ' + p.total + ' tasks done (' + p.pct + '%) · ' +\n      this.list.filter(t => this.overdue(t)).length + ' overdue</p>';",
     "'<p style=\"font-size:13px;color:var(--muted)\">' + tf('tasksDoneLine', { done: p.done, total: p.total, pct: p.pct, n: this.list.filter(t => this.overdue(t)).length }) + '</p>';"),
    ("el.innerHTML = '<div class=\"empty\">No tasks here. Add one below.</div>';",
     "el.innerHTML = '<div class=\"empty\">' + t('noTasksHere') + '</div>';"),
    ("el.innerHTML = '<div class=\"empty\">No notes yet.</div>';",
     "el.innerHTML = '<div class=\"empty\">' + t('noNotesYet') + '</div>';"),
    ("'<p>' + (t.due ? 'Due ' + esc(t.due) + ' · ' : '') + 'Priority: ' + esc(t.priority || 'Medium') +",
     "'<p>' + (t.due ? t('duePrefix') + esc(t.due) + ' · ' : '') + t('priorityPrefix') + esc(priLabel(t.priority || 'Medium')) +"),
    ("(this.overdue(t) ? ' · <span class=\"badge tentative\">Overdue</span>' : '')",
     "(this.overdue(t) ? ' · <span class=\"badge tentative\">' + t('overdueBadge') + '</span>' : '')"),
    ('aria-label="Mark done"', 'aria-label="\' + t(\'markDone\') + \'"'),
    ('title="Important"', 'title="\' + t(\'importantBtn\') + \'"'),
    ('title="Delete"', 'title="\' + t(\'deleteBtn\') + \'"'),
    ("if (confirm('Delete this task?'))", "if (confirm(t('deleteTaskQ')))"),
    ("if (confirm('Delete this note?'))", "if (confirm(t('deleteNoteQ')))"),
    ("esc(n.title || 'Note')", "esc(n.title || t('noteFallback'))"),
])

# ---------------------------------------------------------------- prophets-stories.js
patch('js/prophets-stories.js', [
    ("""  async load() {
    let data = null;
    try {
      const res = await fetch('data/prophets-stories.json');
      if (res.ok) data = await res.json();
    } catch (e) { /* offline/file: fallback */ }
    if (!data || !Array.isArray(data.stories)) {
      data = (typeof FALLBACK_STORIES !== 'undefined') ? FALLBACK_STORIES : { stories: [] };
    }""",
     """  async load() {
    const bn = curLang() === 'bn';
    let data = null;
    try {
      const res = await fetch(bn ? 'data/prophets-stories-bn.json' : 'data/prophets-stories.json');
      if (res.ok) data = await res.json();
    } catch (e) { /* offline/file: fallback */ }
    if (!data || !Array.isArray(data.stories)) {
      if (bn && typeof FALLBACK_STORIES_BN !== 'undefined') data = FALLBACK_STORIES_BN;
      else data = (typeof FALLBACK_STORIES !== 'undefined') ? FALLBACK_STORIES : { stories: [] };
    }"""),
    ("if (!('speechSynthesis' in window)) { App.toast('Text-to-speech is not supported in this browser.', true); return; }",
     "if (!('speechSynthesis' in window)) { App.toast(t('ttsUnsupported'), true); return; }"),
    ("""  renderFeatured() {""",
     """  prophetSub(s) {
    return (s.titleBn && s.titleBn !== s.title ? s.titleBn + ' · ' : '') + s.prophet.bn +
      (s.prophet.en !== s.prophet.bn ? ' (' + s.prophet.en + ')' : '');
  },
  prophetShort(s) {
    return s.prophet.en !== s.prophet.bn
      ? s.prophet.en + ' · ' + s.prophet.bn + ' · ' + s.prophet.ar
      : s.prophet.bn + ' · ' + s.prophet.ar;
  },
  renderFeatured() {"""),
    ("if (!s) { el.innerHTML = '<div class=\"empty\">No stories loaded.</div>'; return; }",
     "if (!s) { el.innerHTML = '<div class=\"empty\">' + t('noStoriesLoaded') + '</div>'; return; }"),
    ("'<p class=\"bn\" style=\"font-size:15px;color:var(--muted)\">' + esc(s.titleBn) + ' · ' + esc(s.prophet.bn) + ' (' + esc(s.prophet.en) + ')</p>' +",
     "'<p class=\"bn\" style=\"font-size:15px;color:var(--muted)\">' + esc(this.prophetSub(s)) + '</p>' +"),
    ("'<p><span class=\"tag\">Story ' + pos + ' of ' + this.list.length + '</span> ' +",
     "'<p><span class=\"tag\">' + tf('storyOf', { pos: pos, total: this.list.length }) + '</span> ' +"),
    ("'<span class=\"tag\">' + esc(s.tradition === 'quran' ? 'Quranic account' : 'Quranic account + classical scholarship') + '</span> ' +",
     "'<span class=\"tag\">' + esc(s.tradition === 'quran' ? t('tradQuran') : t('tradQuranScholar')) + '</span> ' +"),
    ("'<span class=\"tag\">' + (s.readingMinutes || 4) + ' min read</span></p>' +",
     "'<span class=\"tag\">' + (s.readingMinutes || 4) + t('minRead') + '</span></p>' +"),
    ("'<p style=\"margin-top:8px;font-size:13px;color:var(--muted)\">Quran: ' +",
     "'<p style=\"margin-top:8px;font-size:13px;color:var(--muted)\">' + t('quranLabel') +"),
    ("'<button class=\"btn small\" id=\"storyPrev\">← Previous</button>' +",
     "'<button class=\"btn small\" id=\"storyPrev\">' + t('prevBtn') + '</button>' +"),
    ("'<button class=\"btn small gold\" id=\"storyToday\">Today\\'s Story</button>' +",
     "'<button class=\"btn small gold\" id=\"storyToday\">' + t('todaysStory') + '</button>' +"),
    ("'<button class=\"btn small\" id=\"storyNext\">Next →</button>' +",
     "'<button class=\"btn small\" id=\"storyNext\">' + t('nextBtn') + '</button>' +"),
    ("'<button class=\"icon-btn\" id=\"storyRead\">📖 Read full</button>' +",
     "'<button class=\"icon-btn\" id=\"storyRead\">' + t('readFullBtn') + '</button>' +"),
    ("'<button class=\"icon-btn\" id=\"storySpeak\">🔊 Listen</button>' +",
     "'<button class=\"icon-btn\" id=\"storySpeak\">' + t('listenBtn') + '</button>' +"),
    ("'<button class=\"icon-btn\" id=\"storyMark\">' + (this.isBookmarked(s.id) ? '★ Bookmarked' : '☆ Bookmark') + '</button>' +",
     "'<button class=\"icon-btn\" id=\"storyMark\">' + (this.isBookmarked(s.id) ? t('bookmarkedBtn') : t('bookmarkBtn')) + '</button>' +"),
    ("if (!list.length) { el.innerHTML = '<div class=\"empty\">No stories match your search.</div>'; return; }",
     "if (!list.length) { el.innerHTML = '<div class=\"empty\">' + t('noStoriesMatch') + '</div>'; return; }"),
    ("'<p>' + esc(s.prophet.en) + ' · ' + esc(s.prophet.bn) + ' · ' + esc(s.prophet.ar) + '</p>' +",
     "'<p>' + esc(this.prophetShort(s)) + '</p>' +"),
    ("'<p><span class=\"tag\">Story ' + (idx + 1) + ' of ' + this.list.length + '</span> ' +",
     "'<p><span class=\"tag\">' + tf('storyOf', { pos: idx + 1, total: this.list.length }) + '</span> ' +"),
    ("'<span class=\"tag\">' + (s.readingMinutes || 4) + ' min</span></p></div>' +",
     "'<span class=\"tag\">' + (s.readingMinutes || 4) + t('minShort') + '</span></p></div>' +"),
    ("'<button class=\"btn small\" data-open=\"' + esc(s.id) + '\">Read</button></div>';",
     "'<button class=\"btn small\" data-open=\"' + esc(s.id) + '\">' + t('readBtn') + '</button></div>';"),
])

print('--- refactor part 1 done (index, converter, calendar, clock, holidays, links, tasks, stories) ---')

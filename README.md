# Ultimate Personal Portfolio & Smart Daily Dashboard

A premium, fully functional personal portfolio and daily-life dashboard built with
**HTML5, CSS3, vanilla JavaScript (ES6+) and JSON** — no frontend framework.

## Features

- **Dashboard home page** — welcome message, triple-calendar summary, live clock,
  today's & next holiday, daily Prophet's story, quick links, tasks, notes,
  week preview and a sourced daily quote. Widgets can be shown/hidden and
  reordered from Settings.
- **Triple calendar** — Gregorian, Bengali and Hijri in one grid, with month,
  week and day views, year/month selectors, prev/next/today controls, a
  click-to-open day detail panel, Friday/weekend highlighting, holiday dots,
  and a holiday list for the displayed month.
- **Holiday management** — Bangladesh public holidays, Islamic observances,
  Bengali festivals, international days and your own custom events. Search,
  category filters, details modal, add/edit/delete for custom entries, and
  JSON import/export.
- **Live clock & world clock** — one 1-second timer drives the digital clock,
  the analog clock and every world clock. 12/24-hour toggle, IANA timezones,
  abbreviations and UTC offsets, add/remove/reorder cities.
- **Quick links manager** — add/edit/delete/pin links, search, category
  filter, grid/list views, drag-and-drop reorder, favicons with fallback,
  JSON import/export. Only `http(s)` URLs are opened.
- **Daily Prophets' Stories** — 40 curated stories with previous/next/
  today's navigation, progress indicator, search, prophet filter, bookmarks,
  larger-text reading mode and browser text-to-speech.
- **Tasks & notes** — add/edit/complete/delete tasks with due dates,
  priorities and "important" flags; pending/completed/overdue filters;
  progress summary; daily notes with search.
- **Settings & personalization** — dark/light theme, full interface language
  (English / বাংলা — the topbar 🌐 button switches *everything*: all text,
  numerals and the calendar system; Settings lets you mix them if you like),
  numeral system (Latin / Bengali / Arabic-Indic),
  date format, default calendar system, clock format, timezone, Hijri day
  adjustment, widget visibility/order, holiday categories, full data
  export/import and a confirmed reset.
- **Portfolio / About** — editable profile (name, role, bio, email,
  location) shown in the sidebar and the About section.

## Quick start (recommended: local server)

The app loads `data/*.json` with `fetch()`. Browsers block `fetch()` for
`file://` pages, so run a local server instead of double-clicking
`index.html`:

```bash
# Python 3 (from inside the project folder)
python3 -m http.server 8000
# then open http://localhost:8000
```

Or use the **VS Code Live Server** extension: right-click `index.html` →
"Open with Live Server".

> Opening `index.html` directly still works: if `fetch()` fails, the app
> falls back to the embedded copy of the same datasets in
> `js/fallback-data.js`. (Regenerate that file after editing any JSON —
> see below.)

## Project structure

```
personal-dashboard/
├── index.html
├── css/
│   ├── style.css        # tokens, layout, components, themes
│   ├── calendar.css     # calendar grids and day cells
│   └── responsive.css   # breakpoints
├── js/
│   ├── storage.js       # localStorage helpers, escaping, download
│   ├── date-converter.js# Gregorian <-> Bengali, Gregorian <-> Hijri
│   ├── holidays.js      # holiday dataset logic, CRUD, import/export
│   ├── calendar.js      # triple calendar views and detail panel
│   ├── clock.js         # main + analog + world clocks (one timer)
│   ├── quick-links.js   # bookmark CRUD, drag-drop, import/export
│   ├── prophets-stories.js # daily rotation, search, TTS, bookmarks
│   ├── tasks.js         # tasks + notes
│   ├── settings.js      # preferences, profile, i18n dictionary
│   ├── fallback-data.js # GENERATED copy of data/*.json (offline fallback)
│   └── app.js           # boot, navigation, dashboard, modals, settings UI
├── data/
│   ├── holidays.json
│   ├── prophets-stories.json
│   └── quick-links.json
└── README.md
```

## Calendar accuracy — read this

### Bengali calendar (Bangladesh revised calendar, 2019 rules)

Implemented in `js/date-converter.js` from documented rules, not from the
browser's `Intl` API (which has no Bengali calendar):

- The year starts on **Pohela Boishakh = 14 April**.
- Month lengths: Boishakh, Joishtho, Asharh, Srabon, Bhadro, Ashwin = 31
  days; Kartik, Ogrohayon, Poush, Magh = 30 days; Falgun = 29 days, or
  30 days when the Gregorian year containing Falgun is a leap year;
  Choitro = 30 days. (The leap day falls inside Falgun, so every month
  always starts on the same Gregorian date.)
- Bengali year = Gregorian year − 593 on/after 14 April, else − 594.

Verified anchors: **21 February 1952 = 8 Falgun 1358**; **14 April 2025 =
1 Boishakh 1432**; **14 February = 1 Falgun**.

### Hijri calendar

Hijri dates are computed with the browser's `Intl` API using the
**Umm al-Qura tabular calendar** (`islamic-umalqura`). This is a
**calculation**, clearly labelled in the UI, and it **may differ by a day**
from the dates officially announced in Bangladesh after local moon
sighting. If your local announcement differs, set **Settings → Hijri date
adjustment** (± days) and the whole app follows it.

### Holidays — what is confirmed and what is tentative

- Fixed-date Bangladesh public holidays (21 Feb, 26 Mar, 1 May, 16 Dec,
  25 Dec), Bengali festivals (14 Feb Pohela Falgun, 13 Apr Chaitra
  Sankranti, 14 Apr Pohela Boishakh) and UN international days are
  recurring annual dates, marked `confirmed`.
- Islamic observances for 2026–2027 (Eid-ul-Fitr, Eid-ul-Adha, Ashura,
  Shab-e-Barat, Shab-e-Meraj, Eid-e-Miladunnabi, Islamic New Year) are
  **calculated** from the Umm al-Qura calendar and marked `tentative`.
  Eid holidays in Bangladesh run for several days; the exact days follow
  the official announcement — check the gazette before planning travel.
- Variable-date holidays announced each year by government gazette
  (e.g. Durga Puja / Bijoya Dashami, Buddha Purnima) are **intentionally
  not given fixed dates** here. Add them as custom holidays when
  announced.

## Prophets' stories — source policy

- Summaries **paraphrase** the Quranic passages cited for each story.
- No quotations, events, dates or hadith references have been invented.
  Hadith references are omitted unless verified — add them only with a
  checked source.
- Each story is labelled `Quranic account` or `Quranic account +
  classical scholarship` (the latter where the Quran gives a brief account
  and further detail comes from classical retellings).
- The **daily rotation is a reading schedule** (day-of-year modulo 40).
  It does **not** claim any prophet's story happened on today's date.

## Data & privacy

- Your entries (tasks, notes, links, custom holidays, bookmarks, world
  clocks, settings, profile) are stored only in your browser's
  `localStorage` under the `ppd:` prefix. Nothing is sent to any server.
- Export everything from Settings → Data → "Export all data"; restore
  with "Import backup". "Reset all local data" asks for confirmation
  first.
- Imported JSON is validated (holiday schema, link URLs, backup shape)
  before anything is stored. User content is HTML-escaped before display.
- No API keys or credentials are embedded anywhere.

## External resources (optional)

- **Lucide Icons** (CDN) for icons — every button also has a text label,
  so the app stays fully usable if the CDN fails.
- **Google Fonts** (Inter, Noto Serif Bengali, Amiri) — system fonts are
  the fallback if fonts fail to load.
- **Favicon service** (`google.com/s2/favicons`) for link icons, with a
  letter-tile fallback when a favicon is unavailable.

## Regenerating the offline fallback

After editing any file in `data/`, regenerate `js/fallback-data.js`
(includes the Bengali stories fallback):

```bash
python3 enrich_data.py
```

## Building the single file

`build_single.py` inlines all CSS and JS into one self-contained file
(works by double-clicking, no server needed):

```bash
python3 build_single.py   # writes ~/workspace/your_files/Personal_Dashboard.html
```

## Testing notes

Logic verified during development (Node):

- Bengali conversion anchors: 1952-02-21 → 8 Falgun 1358; 2025-04-14 →
  1 Boishakh 1432; 2026-02-14 → 1 Falgun 1432; leap-year Falgun
  (2024-02-29 → 16 Falgun 1430).
- Hijri month starts are found by binary search over the Intl
  Umm al-Qura calendar, so month lengths and year boundaries (including
  the 1447 → 1448 transition) come from the platform calendar, not
  from hand-coded tables.
- Month/year boundary navigation, task overdue computation, URL
  validation (non-`http(s)` schemes refused), holiday recurrence
  rollover to the next year, and story wrap-around (story 40 → story 1)
  are all handled in the modules above.

## License

Free to use and adapt for personal projects.

# -*- coding: utf-8 -*-
"""Build the unified single-file dashboard: Personal_Dashboard.html.

Inlines all CSS + JS from the project into index.html, so the file
works by double-clicking (file://). Language is fully bilingual:
the topbar 🌐 button and Settings → Interface language switch
EVERYTHING between English and Bengali (text, numerals, calendar).
Replaces the old EN-only and BN-only single files.
"""
import re

BASE = '/home/hatch/workspace/projects/personal-dashboard/'
OUT = '/home/hatch/workspace/your_files/Personal_Dashboard.html'

html = open(BASE + 'index.html', encoding='utf-8').read()

css = ''
for f in ['css/style.css', 'css/calendar.css', 'css/responsive.css']:
    css += open(BASE + f, encoding='utf-8').read() + '\n'
html = html.replace(
    '<link rel="stylesheet" href="css/style.css">\n<link rel="stylesheet" href="css/calendar.css">\n<link rel="stylesheet" href="css/responsive.css">',
    '<style>\n' + css + '</style>')

js_order = ['js/storage.js', 'js/i18n.js', 'js/date-converter.js', 'js/holidays.js',
            'js/clock.js', 'js/quick-links.js', 'js/prophets-stories.js', 'js/tasks.js',
            'js/settings.js', 'js/calendar.js', 'js/fallback-data.js', 'js/app.js']
scripts = ''
for f in js_order:
    scripts += open(BASE + f, encoding='utf-8').read() + '\n;\n'
old_block = ''.join('<script src="%s"></script>\n' % f for f in js_order)
assert old_block in html, 'script block not found in index.html'
html = html.replace(old_block, '<script>\n' + scripts + '</script>\n')

open(OUT, 'w', encoding='utf-8').write(html)

leftover = re.findall(r'(?:href|src)="(?:css|js|data)/[^"]*"', html)
print('written:', OUT)
print('leftover local refs:', leftover)
import os
print('bytes:', os.path.getsize(OUT))

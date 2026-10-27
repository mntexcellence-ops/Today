# -*- coding: utf-8 -*-
"""Add descBn to holidays/links JSON and regenerate fallback-data.js."""
import json

BASE = '/home/hatch/workspace/projects/personal-dashboard/'

HOL_BN = {
    'bd-shaheed': '১৯৫২ সালের ২১ ফেব্রুয়ারির ভাষা শহীদদের স্মরণে, বিশ্বজুড়ে আন্তর্জাতিক মাতৃভাষা দিবস হিসেবে পালিত।',
    'bd-independence': '১৯৭১ সালের ২৬ মার্চ বাংলাদেশের স্বাধীনতা ঘোষণার দিন।',
    'bd-mayday': 'আন্তর্জাতিক শ্রমিক দিবস, বাংলাদেশে সরকারি ছুটি।',
    'bd-victory': '১৯৭১ সালের ১৬ ডিসেম্বর মুক্তিযুদ্ধে বাংলাদেশের বিজয়ের দিন।',
    'bd-christmas': 'বড়দিন, বাংলাদেশে সরকারি ছুটি।',
    'bn-falgun': 'ফাল্গুনের প্রথম দিন, বাংলার বসন্ত উৎসব — হলুদ রঙ ও ফুলে উদযাপিত।',
    'bn-chaitra': 'বাংলা বছরের শেষ দিন, মেলা ও ঐতিহ্যবাহী উৎসবে পালিত।',
    'bn-boishakh': 'বাংলা নববর্ষ, সরকারি ছুটি ও বাংলার সবচেয়ে বড় সাংস্কৃতিক উৎসব।',
    'int-newyear': 'গ্রেগরিয়ান বছরের প্রথম দিন।',
    'int-women': 'নারীদের অর্জন উদযাপনের বিশ্ব দিবস।',
    'int-environment': 'পরিবেশ সুরক্ষায় পদক্ষেপ নিতে জাতিসংঘের প্রধান দিবস।',
    'int-peace': 'শান্তির আদর্শকে শক্তিশালী করার দিন।',
    'int-humanrights': 'মানবাধিকারের সার্বজনীন ঘোষণা গৃহীত হওয়ার স্মরণে।',
}
ISL_BN = {
    'meraj': 'নবীজির মেরাজ ও ঊর্ধ্বারোহণের সাথে সম্পর্কিত রাতের ইবাদত। তারিখ হিসাব করা, আনুষ্ঠানিকভাবে নিশ্চিত নয়।',
    'barat': 'শাবান মাসের মধ্যরাত, দোয়া ও আত্মসমালোচনার রাত। তারিখ হিসাব করা, আনুষ্ঠানিকভাবে নিশ্চিত নয়।',
    'fitr': 'রমজান শেষের উৎসব। বাংলাদেশে কয়েক দিনের সরকারি ছুটি; সঠিক দিন চাঁদ দেখার আনুষ্ঠানিক ঘোষণা অনুযায়ী।',
    'adha': 'হজের সময় কুরবানির উৎসব। বাংলাদেশে কয়েক দিনের সরকারি ছুটি; সঠিক দিন আনুষ্ঠানিক ঘোষণা অনুযায়ী।',
    'newyear': 'হিজরি বছরের প্রথম দিন। তারিখ হিসাব করা, আনুষ্ঠানিকভাবে নিশ্চিত নয়।',
    'ashura': 'মুহাররমের ১০ তারিখ, রোজা ও স্মরণের দিন। তারিখ হিসাব করা, আনুষ্ঠানিকভাবে নিশ্চিত নয়।',
    'mawlid': 'নবী মুহাম্মদ (সা.)-এর জন্মদিন পালন। তারিখ হিসাব করা, আনুষ্ঠানিকভাবে নিশ্চিত নয়।',
}
hol = json.load(open(BASE + 'data/holidays.json', encoding='utf-8'))
for h in hol['holidays']:
    if h['id'] in HOL_BN:
        h['descBn'] = HOL_BN[h['id']]
    else:
        parts = h['id'].split('-')
        assert len(parts) >= 2 and parts[1] in ISL_BN, h['id']
        h['descBn'] = ISL_BN[parts[1]]
json.dump(hol, open(BASE + 'data/holidays.json', 'w', encoding='utf-8'),
          ensure_ascii=False, sort_keys=True, separators=(',', ':'))
print('holidays.json: descBn added to', len(hol['holidays']), 'entries')

LINK_BN = {
    'ql-drive': 'ক্লাউড ডকুমেন্ট ও শিট।',
    'ql-gmail': 'ইমেইল ইনবক্স।',
    'ql-powerbi': 'বিজনেস রিপোর্ট ও ড্যাশবোর্ড।',
    'ql-sharepoint': 'টিম সাইট ও শেয়ার করা ডকুমেন্ট।',
    'ql-khan': 'নানা বিষয়ে ফ্রি কোর্স।',
    'ql-coursera': 'বিশ্ববিদ্যালয়ের অনলাইন কোর্স।',
    'ql-quran': 'পবিত্র কুরআন পড়ুন ও খুঁজুন।',
    'ql-sunnah': 'হাদিস সংকলন (উদ্ধৃতির আগে সূত্র যাচাই করুন)।',
    'ql-github': 'কোড হোস্টিং ও সহযোগিতা।',
    'ql-youtube': 'ভিডিও লেকচার ও শেখা।',
}
lnk = json.load(open(BASE + 'data/quick-links.json', encoding='utf-8'))
for l in lnk['links']:
    assert l['id'] in LINK_BN, l['id']
    l['descBn'] = LINK_BN[l['id']]
json.dump(lnk, open(BASE + 'data/quick-links.json', 'w', encoding='utf-8'),
          ensure_ascii=False, sort_keys=True, separators=(',', ':'))
print('quick-links.json: descBn added to', len(lnk['links']), 'entries')

def load_json(p):
    return json.load(open(BASE + p, encoding='utf-8'))

fb = []
fb.append('/* fallback-data.js — generated from data/*.json. Used when the app is opened directly (file://) so fetch() of the JSON files fails. Regenerate with enrich_data.py. */')
fb.append('var FALLBACK_HOLIDAYS = ' + json.dumps(load_json('data/holidays.json'), ensure_ascii=False, separators=(',', ':')) + ';')
fb.append('var FALLBACK_STORIES = ' + json.dumps(load_json('data/prophets-stories.json'), ensure_ascii=False, separators=(',', ':')) + ';')
fb.append('var FALLBACK_STORIES_BN = ' + json.dumps(load_json('data/prophets-stories-bn.json'), ensure_ascii=False, separators=(',', ':')) + ';')
fb.append('var FALLBACK_LINKS = ' + json.dumps(load_json('data/quick-links.json'), ensure_ascii=False, separators=(',', ':')) + ';')
open(BASE + 'js/fallback-data.js', 'w', encoding='utf-8').write('\n'.join(fb) + '\n')
print('fallback-data.js regenerated (incl. FALLBACK_STORIES_BN)')

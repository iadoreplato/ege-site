#!/usr/bin/env node
// Проверка тренировочных вариантов: node scripts/check-variants.mjs
// Аудирование и чтение проверяют make-audio.mjs --check и check-reading.mjs; здесь Use of English, письмо, устная часть и комплектность.
import { readFileSync, existsSync, readdirSync } from 'node:fs'
import { join } from 'node:path'

const C = 'src/content', IMG = 'public/img'
const read = (p) => JSON.parse(readFileSync(join(C, p + '.json'), 'utf8'))
const words = (s) => s.trim().split(/\s+/).length
const imgs = existsSync(IMG) ? new Set(readdirSync(IMG).map((f) => f.replace(/\.svg$/, ''))) : null
const run = (a) => a.reduce((m, v, i) => { let r = 1; while (a[i + r] === v) r++; return Math.max(m, r) }, 0)
let bad = 0

const variants = readdirSync(join(C, 'writing')).filter((f) => /^variant-\d+\.json$/.test(f)).map((f) => +f.match(/\d+/)[0]).sort()
if (variants.length < 3) { console.log('✗ нужно не менее 3 вариантов'); bad++ }

for (const n of variants) {
  const err = [], need = (c, m) => { if (!c) err.push(m) }
  const must = [`listening/variant-${n}-t1`, `listening/variant-${n}-t2`, `listening/variant-${n}-t3`, `reading/variant-${n}-t10`, `reading/variant-${n}-t11`, `reading/variant-${n}-t12`, `use-of-english/variant-${n}-t19`, `use-of-english/variant-${n}-t25`, `use-of-english/variant-${n}-t30`, `writing/variant-${n}`, `speaking/variant-${n}`]
  for (const m of must) need(existsSync(join(C, m + '.json')), `нет файла ${m}.json`)
  if (!err.length) {
    for (const [t, from, to] of [[19, 19, 24], [25, 25, 29]]) {
      const u = read(`use-of-english/variant-${n}-t${t}`), k = to - from + 1
      need(u.rows.length === k && u.key.length === k, `задание ${t}: нужно ${k} пропусков и ${k} ответов`)
      u.rows.forEach((r, i) => { need(r[0] === from + i && /^[A-Z]+$/.test(r[3]) && u.key[i], `задание ${t}: строка ${i + 1}`) })
    }
    const c = read(`use-of-english/variant-${n}-t30`)
    need(c.opts.length === 7 && c.key.length === 7, 'задание 30–36: 7 пропусков')
    c.opts.forEach((o, i) => { need(o[0] === 30 + i && o.length === 5 && new Set(o.slice(1)).size === 4, `пропуск ${30 + i}: 4 разных варианта`); need(c.text.includes(`<b>${30 + i}</b>`), `в тексте нет пропуска ${30 + i}`); need(c.key[i] >= 1 && c.key[i] <= 4, `ключ ${30 + i}`) })
    need(run(c.key) < 3, 'в ключе 30–36 три одинаковых подряд')
    const [em, es] = read(`writing/variant-${n}`).tasks
    need(em.type === 'email' && em.sender && em.subject && em.text && em.ask && em.pool?.answers?.length && em.pool?.questions?.length, 'письмо 37: sender, subject, text, ask, pool')
    need(es.type === 'essay' && es.data.length === 5 && es.data.reduce((s, d) => s + d[1], 0) === 100 && es.data.every((d, i, a) => !i || a[i - 1][1] >= d[1]), 'задание 38: 5 вариантов, сумма 100, по убыванию')
    need(es.q && es.problem && es.conclusion && es.focus4 && es.pool?.length >= 8, 'задание 38: q, problem, conclusion, focus4, pool')
    const [rd, ad, iv, ph] = read(`speaking/variant-${n}`).tasks
    need(rd.type === 'reading' && words(rd.text) >= 90 && words(rd.text) <= 130, `чтение вслух: ${rd.text ? words(rd.text) : 0} слов (нужно 90–130)`)
    need(ad.type === 'ad' && ad.points.length === 4 && ad.questions?.length === 4, 'реклама: 4 пункта и 4 вопроса')
    need(iv.type === 'interview' && iv.questions.length === 5 && iv.questions.every((q) => q.q && q.pool?.length >= 3), 'интервью: 5 вопросов с подсказками')
    need(ph.type === 'photo' && ph.p1 && ph.p2 && ph.pool?.describe && ph.pool?.difference && ph.pool?.pros && ph.pool?.cons, 'фото: p1, p2 и pool')
    if (imgs) for (const name of [ad.img, ...ph.p1[0], ...ph.p2[0]]) need(imgs.has(name), `нет картинки ${name}.svg`)
    // темы не должны повторяться между вариантами в одном разделе
  }
  console.log(`variant-${n}: ${err.length ? '✗' : '✓'}`); err.forEach((m) => console.log('  · ' + m)); bad += err.length
}
const titles = (sub, re) => variants.flatMap((n) => readdirSync(join(C, sub)).filter((f) => re(n).test(f)).map((f) => read(`${sub}/${f.replace('.json', '')}`).title))
const dupe = (a) => a.length !== new Set(a).size
if (dupe(titles('reading', (n) => new RegExp(`^variant-${n}-t(10|11|12)\\.json$`)))) { console.log('✗ названия заданий повторяются'); bad++ }
if (bad) { console.log(`\nОшибок: ${bad}`); process.exit(1) }
console.log('\nПроверка вариантов пройдена.')

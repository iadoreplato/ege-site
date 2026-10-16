#!/usr/bin/env node
// Проверка заданий по аудированию на соответствие принципам (docs/task-design-principles.md).
// Запуск: node scripts/check-listening.mjs [id ...]
// Ошибки (✗) блокируют, предупреждения (!) нужно либо исправить, либо осознанно принять.
import fs from 'node:fs'
import path from 'node:path'

const DIR = 'src/content/listening'
const words = s => (s.match(/[A-Za-z’'\-]+/g) || []).length
const STOP = new Set('that this with from they have what when will would could their there which about into than then them been were more most some very just only also does your people usually can may not for and the are but you our can\'s should from'.split(' '))
const stem = w => w.replace(/(ing|ed|es|s|ly|er)$/, '')
const content = s => new Set((s.toLowerCase().match(/[a-z]+/g) || []).filter(w => w.length > 3 && !STOP.has(w)).map(stem))
const overlap = (a, b) => { const A = content(a), B = content(b); let n = 0; for (const x of A) if (B.has(x)) n++; return n }

const only = new Set(process.argv.slice(2))
const files = fs.readdirSync(DIR).filter(f => f.endsWith('.json') && f !== 'voices.json' && (!only.size || only.has(f.replace('.json', ''))))
let errors = 0, warns = 0
const err = (id, m) => { errors++; console.log(`  ✗ ${m}`) }
const warn = (id, m) => { warns++; console.log(`  ! ${m}`) }

for (const f of files) {
  const d = JSON.parse(fs.readFileSync(path.join(DIR, f), 'utf8'))
  console.log(`${d.id} (задание ${d.task})`)
  const turns = d.script.filter(x => x.who !== 'Announcer')
  const total = turns.reduce((s, x) => s + words(x.text), 0)

  if (d.task === 1) {
    // 6 высказываний, 7 утверждений, одно лишнее
    if (turns.length !== 6) err(d.id, `должно быть 6 высказываний, а не ${turns.length}`)
    if (d.options.length !== 7) err(d.id, `должно быть 7 утверждений, а не ${d.options.length}`)
    if (new Set(d.key).size !== 6 || d.key.some(k => k < 1 || k > 7)) err(d.id, `ключ должен быть 6 разных цифр от 1 до 7: ${d.key}`)
    turns.forEach((t, i) => {
      const n = words(t.text)
      if (n < 65 || n > 90) err(d.id, `${'ABCDEF'[i]}: ${n} слов (допустимо 65–90, цель 70–85)`)
      else if (n < 70 || n > 85) warn(d.id, `${'ABCDEF'[i]}: ${n} слов (цель 70–85)`)
    })
    d.options.forEach((o, i) => { const n = words(o); if (n < 6 || n > 14) warn(d.id, `утверждение ${i + 1}: ${n} слов (цель 6–14)`) })
    // ловушки: у каждого говорящего должно быть неверное утверждение с ≥2 общими основами; общего с верным не больше, чем с ловушкой хотя бы у половины
    let trapFirst = 0, strongTraps = 0
    turns.forEach((t, i) => {
      const k = d.key[i] - 1
      const ov = d.options.map(o => overlap(t.text, o))
      const traps = ov.map((v, j) => (j !== k && v >= 2 ? j + 1 : null)).filter(Boolean)
      const weak = ov.some((v, j) => j !== k && v >= 1)
      if (!weak) warn(d.id, `${'ABCDEF'[i]}: нет ловушки — ни одно неверное утверждение не пересекается с текстом по словам`)
      if (traps.length) strongTraps++
      if (Math.max(...ov.filter((_, j) => j !== k)) >= ov[k]) trapFirst++
    })
    if (strongTraps < 4) warn(d.id, `сильная ловушка (≥2 общих слов с неверным утверждением) только у ${strongTraps} из 6 говорящих (цель ≥4)`)
    if (trapFirst < 3) warn(d.id, `ловушка «сильнее» верного ответа по словам только у ${trapFirst} из 6 (цель ≥3)`)
    // лишнее утверждение должно «цеплять» хотя бы двух говорящих
    const extra = [1, 2, 3, 4, 5, 6, 7].find(x => !d.key.includes(x))
    const hit = turns.filter(t => overlap(t.text, d.options[extra - 1]) >= 1).length
    if (hit < 2) warn(d.id, `лишнее утверждение ${extra} не перекликается с текстами (${hit}); оно должно быть настоящим отвлекающим`)
    // итоговые афоризмы
    turns.forEach((t, i) => { const last = t.text.trim().split(/(?<=[.!?])\s+/).pop(); if (/\b(that's|this is) (the|what) (real|key|point)|in short|to sum up|so (i|we) (think|believe)|the lesson/i.test(last)) warn(d.id, `${'ABCDEF'[i]}: последняя фраза похожа на итог/мораль`) })
  }

  if (d.task === 2) {
    const n = d.statements.length
    if (n !== 7) err(d.id, `должно быть 7 утверждений, а не ${n}`)
    const c = { 1: 0, 2: 0, 3: 0 }; d.key.forEach(k => c[k]++)
    if (c[3] < 2 || c[3] > 3) err(d.id, `«Not stated»: ${c[3]} (должно быть 2–3; в демо 2027 их 3)`)
    if (c[1] < 2 || c[2] < 2) err(d.id, `True/False распределены неровно: T=${c[1]}, F=${c[2]}, NS=${c[3]}`)
    if (total < 280 || total > 500) warn(d.id, `диалог ${total} слов (ориентир 280–480)`)
    d.statements.forEach((s, i) => { if (/\b(always|never|all|none|only|every|completely)\b/i.test(s)) warn(d.id, `утверждение ${'ABCDEFG'[i]}: слово-абсолют (${s.match(/\b(always|never|all|none|only|every|completely)\b/i)[0]}) подсказывает ответ`) })
    if (d.statements.some((s, i) => d.key[i] === 1 && words(s) > 0 && overlap(s, d.script.map(x => x.text).join(' ')) < 2)) warn(d.id, 'у «True»-утверждения почти нет общих слов с диалогом — проверьте парафраз')
    const same = d.key.every((k, i, a) => i === 0 || k === a[i - 1]); if (same) err(d.id, 'ключ из одинаковых ответов')
  }

  if (d.task === 3) {
    if (d.questions.length !== 7) err(d.id, `должно быть 7 вопросов, а не ${d.questions.length}`)
    d.questions.forEach((q, i) => {
      if (q.options.length !== 3) err(d.id, `вопрос ${i + 3}: вариантов ${q.options.length}, должно быть 3 (Coombe: для аудирования три)`)
      const lens = q.options.map(words)
      if (Math.max(...lens) >= 2 * Math.min(...lens) + 3) warn(d.id, `вопрос ${i + 3}: варианты непараллельны по длине (${lens})`)
      if (d.key[i] && lens[d.key[i] - 1] === Math.max(...lens) && Math.max(...lens) > Math.min(...lens) + 2) warn(d.id, `вопрос ${i + 3}: верный вариант самый длинный`)
      if (/\b(all|none) of the above|both\b/i.test(q.options.join(' '))) err(d.id, `вопрос ${i + 3}: запрещены варианты вида «all of the above»`)
    })
    const c = { 1: 0, 2: 0, 3: 0 }; d.key.forEach(k => c[k]++)
    if (Object.values(c).some(v => v < 2 || v > 3)) warn(d.id, `ключи распределены неровно: ${JSON.stringify(c)} (цель по 2–3)`)
    let longest = d.questions.filter((q, i) => { const l = q.options.map(words); return l[d.key[i] - 1] === Math.max(...l) && Math.max(...l) > Math.min(...l) }).length
    if (longest > 3) warn(d.id, `верный вариант самый длинный в ${longest} вопросах из 7`)
    if (total < 400 || total > 720) warn(d.id, `интервью ${total} слов (ориентир 400–700; в демо 2027 около 650)`)
    const guest = turns.filter(x => x.who !== turns[0].who)
    const long = guest.filter(x => words(x.text) > 120)
    if (long.length) warn(d.id, `${long.length} реплик гостя длиннее 120 слов — трудно удержать в памяти`)
  }
}
console.log(`\nИтого: ошибок ${errors}, предупреждений ${warns}`)
process.exit(errors ? 1 : 0)

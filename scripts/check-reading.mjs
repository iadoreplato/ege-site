#!/usr/bin/env node
// Проверка заданий на чтение: node scripts/check-reading.mjs
// Форматы по демоверсии ЕГЭ 2027: 10 (7 текстов A–G, 8 заголовков), 11 (6 пропусков A–F, 7 частей), 12–18 (текст и 7 вопросов по 4 варианта).
import { readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'

const DIR = 'src/content/reading'
const SPEC = { 10: { items: 7, options: 8 }, 11: { items: 6, options: 7 }, 12: { items: 7, options: 4 } }
const toks = (s) => s.toLowerCase().replace(/[^a-z0-9' ]+/g, ' ').split(/\s+/).filter(Boolean)
const words = (s) => toks(s).length
const maxRun = (a) => a.reduce((m, v, i) => { let r = 1; while (a[i + r] === v) r++; return Math.max(m, r) }, 0)

let errors = 0
for (const f of readdirSync(DIR).filter((x) => x.endsWith('.json'))) {
  const t = JSON.parse(readFileSync(join(DIR, f), 'utf8')), err = [], warn = []
  const need = (c, m) => { if (!c) err.push(m) }
  const sp = SPEC[t.task]
  need(t.id === f.replace('.json', ''), 'id должен совпадать с именем файла')
  need(t.section === 'reading' && sp && t.module && Number.isInteger(t.unit) && t.level, 'нужны section, task (10|11|12), module, unit, level')
  need(Array.isArray(t.discuss) && t.discuss.length >= 3, 'нужно не менее 3 вопросов для обсуждения (discuss)')
  if (sp) {
    const key = t.key
    need(Array.isArray(key) && key.length === sp.items && key.every((k) => Number.isInteger(k) && k >= 1 && k <= sp.options), `key: ${sp.items} чисел от 1 до ${sp.options}`)
    let source = '', options = []
    if (t.task === 10) {
      need(t.texts?.length === 7 && t.headings?.length === 8, '7 текстов и 8 заголовков')
      need(new Set(key).size === 7, 'в задании 10 заголовки не повторяются')
      source = (t.texts || []).join(' '); options = t.headings || []
      ;(t.texts || []).forEach((x, i) => { const n = words(x); if (n < 55 || n > 80) warn.push(`текст ${'ABCDEFG'[i]}: ${n} слов (в сборнике ЕГЭ 50–75)`) })
      ;(t.headings || []).forEach((h, i) => { const n = words(h); if (n > 4) warn.push(`заголовок ${i + 1}: ${n} слов (нужно 2–4)`) })
    } else if (t.task === 11) {
      need(t.parts?.length === 7 && typeof t.text === 'string', 'текст и 7 частей предложений')
      need(new Set(key).size === 6, 'в задании 11 части не повторяются')
      need('ABCDEF'.split('').every((c) => (t.text || '').includes(`{${c}}`)), 'в тексте должны быть метки {A}…{F}')
      source = t.text || ''; options = t.parts || []
      const n = words(source); if (n < 150 || n > 260) warn.push(`текст: ${n} слов (в демоверсии около 200)`)
      const extra = [1, 2, 3, 4, 5, 6, 7].find((n) => !key.includes(n)); if (extra) warn.push(`лишняя часть: ${extra}`)
    } else {
      need(t.questions?.length === 7 && t.questions.every((q) => q.options?.length === 4), '7 вопросов по 4 варианта')
      source = (t.text || []).join(' '); options = (t.questions || []).flatMap((q) => q.options || [])
      const n = words(source); if (n < 580 || n > 680) warn.push(`текст: ${n} слов (в демоверсии около 600–650)`)
      const qs = (t.questions || []).map((q) => q.q)
      if (!qs.some((q) => /NOT/.test(q))) warn.push('нет вопроса «NOT mentioned»')
      if (!qs.some((q) => /mean/.test(q))) warn.push('нет вопроса на значение выражения')
      if (!qs.some((q) => /refer/.test(q))) warn.push('нет вопроса на отсылку местоимения')
      ;(t.questions || []).forEach((q, i) => {
        const L = q.options.map((o) => o.length)
        if (Math.max(...L) / Math.min(...L) > 2.2 && !/mean/.test(q.q)) warn.push(`вопрос ${12 + i}: варианты сильно отличаются по длине`)
      })
      const cnt = [1, 2, 3, 4].map((n) => key.filter((k) => k === n).length)
      if (Math.max(...cnt) > 3) warn.push(`ключ: ответ повторяется слишком часто (${cnt.join('/')})`)
    }
    if (maxRun(key || []) >= 3) warn.push('ключ: три одинаковых ответа подряд')
    // перефраз: 4 слова подряд из вариантов не должны совпадать с текстом
    const st = toks(source), g = new Set()
    for (let i = 0; i + 4 <= st.length; i++) g.add(st.slice(i, i + 4).join(' '))
    if (t.task !== 11) for (const o of options) { const w = toks(o); for (let i = 0; i + 4 <= w.length; i++) if (g.has(w.slice(i, i + 4).join(' '))) { warn.push(`дословный повтор текста: «${w.slice(i, i + 4).join(' ')}…»`); break } }
  }
  console.log(`\n${f} · ${t.level || ''}`); err.forEach((e) => console.log(`  ✗ ${e}`)); warn.forEach((w) => console.log(`  · ${w}`)); errors += err.length
}
if (errors) { console.error(`\nОшибок: ${errors}`); process.exit(1) } else console.log('\nПроверка чтения пройдена.')

#!/usr/bin/env node
// Озвучка заданий на аудирование через ElevenLabs.
//
//   node scripts/make-audio.mjs --check        проверить задания, ничего не тратится
//   node scripts/make-audio.mjs --voices       показать голоса аккаунта и их ID
//   node scripts/make-audio.mjs --try <voice_id>   пробная фраза диктора этим голосом → public/audio/_try.mp3
//   node scripts/make-audio.mjs --mock         тестовые «тихие» mp3 (бесплатно, для проверки сайта)
//   node scripts/make-audio.mjs                озвучить новые и изменённые задания
//   node scripts/make-audio.mjs --only <id>    озвучить одно задание
//   node scripts/make-audio.mjs --force        перегенерировать всё (тратит кредиты)
//
// Ключ: файл .env в корне проекта, строка  ELEVENLABS_API_KEY=...  (в чат и в код не вставлять).
// Задания: src/content/listening/*.json. Голоса: src/content/listening/voices.json.
// Результат: public/audio/<id>.mp3, public/audio/manifest.json, review/<id>.md (для вычитки).
// Нужен Node 18+. Внешних пакетов нет.

import { readFileSync, writeFileSync, existsSync, mkdirSync, readdirSync } from 'node:fs'
import { join } from 'node:path'
import { createHash } from 'node:crypto'
import { spawnSync } from 'node:child_process'

// ───────────── Настройки (меняйте здесь) ─────────────
const DIR = { tasks: 'src/content/listening', out: 'public/audio', cache: '.audio-cache', review: 'review' }
const MODEL = 'eleven_v4'   // модель ElevenLabs; список: GET /v1/models
// Диктор (инструкции и «Speaker A.») озвучивается отдельно, с регулируемой скоростью.
// У eleven_v3 нет параметра скорости, поэтому для диктора берём multilingual_v2: speed 1.0 = норма, максимум 1.2.
const ANNOUNCER_MODEL = 'eleven_multilingual_v2'
const ANNOUNCER_SPEED = 1
const ANNOUNCER_SETTINGS = { speed: ANNOUNCER_SPEED }   // сюда можно добавить stability, similarity_boost, style
const MAX_CHARS = 1800      // лимит API 2000 знаков на запрос, берём с запасом
// Структура записи по официальному скрипту демоверсии ЕГЭ 2027 (Приложение 1). Все паузы входят в аудиофайл.
const READ = { 1: 20, 2: 20, 3: 50 }            // секунды на ознакомление с заданием
const PAUSE = { task: 15, check: 15, end: 3 }   // пауза на выполнение после 1-го прослушивания, пауза на проверку, тишина в конце
const GAP = { 1: 3, 2: 0.7, 3: 0.7 }            // пауза между кусками записи, сек
// Состав заданий (по демоверсии ЕГЭ 2027). Если в официальной демоверсии иначе, поменяйте числа здесь.
const SPEC = { 1: { speakers: 6, options: 7 }, 2: { statements: 7 }, 3: { questions: 7 } }
// Русские инструкции (дословно из демоверсии). Читает диктор. Цифры написаны словами, чтобы голос не путался.
const RU = {
  1: 'Вы услышите шесть высказываний. Установите соответствие между высказываниями каждого говорящего от эй до эф и утверждениями, данными в списке от один до семь. Используйте каждое утверждение, обозначенное соответствующей цифрой, только один раз. В задании есть одно лишнее утверждение.  Вы услышите запись дважды.  Занесите свои ответы в таблицу.  У Вас есть двадцать секунд, чтобы ознакомиться с заданием.',
  2: 'Вы услышите диалог. Определите, какие из приведённых утверждений от эй до джи соответствуют содержанию текста (один – True), какие не соответствуют (два – False) и о чём в тексте не сказано, то есть на основании текста нельзя дать ни положительного, ни отрицательного ответа (три – Not stated). Занесите номер выбранного Вами варианта ответа в таблицу. Вы услышите запись дважды. У Вас есть двадцать секунд, чтобы ознакомиться с заданием.',
  3: 'Вы услышите интервью. В заданиях с третьего по девятое запишите в поле ответа цифру один, два или три, соответствующую выбранному Вами варианту ответа. Вы услышите запись дважды. У Вас есть пятьдесят секунд, чтобы ознакомиться с заданиями.',
}
// Английские реплики диктора (дословно из демоверсии)
const EN = {
  start: 'Now we are ready to start.',
  complete: 'You have 15 seconds to complete the task.',
  again: { 1: 'Now you will hear the texts again.', 2: 'Now you will hear the text again.', 3: 'Now you will hear the text again.' },
  check: 'This is the end of the task. You now have 15 seconds to check your answers.',
  endTest: 'This is the end of the Listening test.', // только если в задании "endOfTest": true (после задания 3)
}
// ──────────────────────────────────────────────────────

const args = process.argv.slice(2)
const flag = (n) => args.includes(`--${n}`)
const only = args.includes('--only') ? args[args.indexOf('--only') + 1] : null

// ключ из .env
if (existsSync('.env')) {
  for (const l of readFileSync('.env', 'utf8').split(/\r?\n/)) {
    const m = l.match(/^\s*([A-Z_]+)\s*=\s*(.*?)\s*$/)
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '')
  }
}
const KEY = process.env.ELEVENLABS_API_KEY

// ───────────── Тишина и склейка mp3 (без ffmpeg) ─────────────
// Пустой кадр MPEG-1 Layer III, 128 кбит/с, 44,1 кГц, моно: 417 байт ≈ 26,12 мс
const FRAME = Buffer.concat([Buffer.from([0xff, 0xfb, 0x90, 0xc0]), Buffer.alloc(413)])
const silence = (sec) => Buffer.concat(Array(Math.max(0, Math.round((sec * 44100) / 1152))).fill(FRAME))
const stripId3 = (b) => (b.subarray(0, 3).toString() === 'ID3'
  ? b.subarray(10 + ((b[6] & 127) << 21 | (b[7] & 127) << 14 | (b[8] & 127) << 7 | (b[9] & 127))) : b)

// Приводит кусок mp3 к «чистому» виду для склейки: убирает всё до первого кадра и служебный кадр Xing/Info
// (в нём записана длина одного куска, из-за него плеер неверно считает время и «прыгает» при перемотке).
const BR = [0, 32, 40, 48, 56, 64, 80, 96, 112, 128, 160, 192, 224, 256, 320]
const SR = [44100, 48000, 32000]
function clean(b) {
  let i = 0
  while (i < b.length - 4 && !(b[i] === 0xff && (b[i + 1] & 0xe0) === 0xe0)) i++
  b = b.subarray(i)
  const head = b.subarray(0, 80).toString('latin1')
  if (/Xing|Info/.test(head) && (b[1] >> 3 & 3) === 3 && BR[b[2] >> 4] && SR[b[2] >> 2 & 3]) {
    b = b.subarray(Math.floor(144000 * BR[b[2] >> 4] / SR[b[2] >> 2 & 3]) + (b[2] >> 1 & 1))
  }
  return b
}
// Если в системе есть ffmpeg, перекодируем итоговый файл в единый mp3 (самый надёжный вариант для плееров).
function finalize(mp3) {
  const has = spawnSync('ffmpeg', ['-version'])
  if (has.error || has.status !== 0) return { buf: mp3, ffmpeg: false }
  const r = spawnSync('ffmpeg', ['-v', 'error', '-f', 'mp3', '-i', 'pipe:0', '-c:a', 'libmp3lame', '-b:a', '128k', '-ar', '44100', '-ac', '1', '-f', 'mp3', 'pipe:1'],
    { input: mp3, maxBuffer: 1 << 29 })
  return r.status === 0 && r.stdout.length ? { buf: r.stdout, ffmpeg: true } : { buf: mp3, ffmpeg: false }
}

// ───────────── Загрузка файлов ─────────────
const readJson = (p) => JSON.parse(readFileSync(p, 'utf8'))
const loadTasks = () => readdirSync(DIR.tasks)
  .filter((f) => f.endsWith('.json') && f !== 'voices.json')
  .map((f) => ({ file: f, ...readJson(join(DIR.tasks, f)) }))
const voices = existsSync(join(DIR.tasks, 'voices.json')) ? readJson(join(DIR.tasks, 'voices.json')) : {}

// ───────────── Проверка заданий ─────────────
const ANNOUNCER = 'Announcer' // реплики диктора («Speaker one.») озвучиваются голосом announcer
const words = (s) => s.trim().split(/\s+/).filter(Boolean).length
const maxRun = (a) => a.reduce((m, v, i) => { let r = 1; while (a[i + r] === v) r++; return Math.max(m, r) }, 0)

function validate(t, ids) {
  const err = [], warn = []
  const need = (c, m) => { if (!c) err.push(m) }
  need(t.id && t.id === t.file.replace(/\.json$/, ''), `id должен совпадать с именем файла (${t.file})`)
  need(ids.filter((i) => i === t.id).length === 1, 'id повторяется')
  need([1, 2, 3].includes(t.task), 'task должен быть 1, 2 или 3')
  need(Number.isInteger(t.unit) && t.module, 'нужны module и unit')
  need(t.speakers && Array.isArray(t.script) && t.script.length, 'нужны speakers и script')
  if (err.length) return { err, warn }

  for (const s of t.script) {
    need(s.who === ANNOUNCER || t.speakers[s.who], `говорящий «${s.who}» не описан в speakers`)
    need(s.text && s.text.trim(), `пустая реплика у «${s.who}»`)
    need(!/[а-яё]/i.test(s.text || ''), `русские буквы в реплике: «${(s.text || '').slice(0, 30)}…»`)
    need((s.text || '').length <= MAX_CHARS, `реплика длиннее ${MAX_CHARS} знаков`)
  }
  for (const [who, role] of Object.entries(t.speakers)) {
    const v = voices[role]
    if (!v || /^PUT_/.test(v)) warn.push(`для роли «${role}» (${who}) в voices.json не указан ID голоса`)
  }
  if (!voices.announcer || /^PUT_/.test(voices.announcer)) warn.push('для announcer в voices.json не указан ID голоса')
  const used = Object.entries(t.speakers).map(([who, role]) => [who, voices[role]]).filter(([, v]) => v && !/^PUT_/.test(v))
  for (const [who, v] of used) {
    const same = used.filter(([w, x]) => x === v && w !== who).map(([w]) => w)
    if (same.length && who < same[0]) warn.push(`у «${who}» и «${same[0]}» один и тот же голос: их будет трудно различить`)
  }

  const total = t.script.reduce((n, s) => n + words(s.text), 0)
  warn.push(`${total} слов, около ${(total / 130).toFixed(1)} мин без пауз; ${t.script.reduce((n, s) => n + s.text.length, 0)} знаков`)

  const key = t.key
  const sp = SPEC[t.task]
  if (t.task === 1) {
    const speak = t.script.filter((x) => x.who !== ANNOUNCER)
    need(speak.length === sp.speakers, `в задании 1 должно быть ${sp.speakers} говорящих (реплики Announcer не считаются)`)
    warn.push(`слов у говорящих: ${speak.map((x) => words(x.text)).join(', ')}`)
    need(Array.isArray(t.options) && t.options.length === sp.options, `в задании 1 нужно ${sp.options} утверждений (1–${sp.options}) в options`)
    need(Array.isArray(key) && key.length === sp.speakers && new Set(key).size === sp.speakers && key.every((k) => Number.isInteger(k) && k >= 1 && k <= sp.options),
      `key задания 1: ${sp.speakers} разных чисел от 1 до ${sp.options} (по порядку говорящих A, B, C…)`)
  } else if (t.task === 2) {
    need(Array.isArray(t.statements) && t.statements.length === sp.statements, `в задании 2 нужно ${sp.statements} утверждений (A–${'ABCDEFGHI'[sp.statements - 1]}) в statements`)
    need(Array.isArray(key) && key.length === sp.statements && key.every((k) => [1, 2, 3].includes(k)), `key задания 2: ${sp.statements} чисел 1–3`)
  } else {
    need(Array.isArray(t.questions) && t.questions.length === sp.questions && t.questions.every((q) => q.options?.length === 3),
      `в задании 3 нужно ${sp.questions} вопросов с 3 вариантами в questions`)
    need(Array.isArray(key) && key.length === sp.questions && key.every((k) => [1, 2, 3].includes(k)), `key задания 3: ${sp.questions} чисел 1–3`)
  }
  if (!err.length && Array.isArray(key) && t.task !== 1) {
    const cnt = [1, 2, 3].map((n) => key.filter((k) => k === n).length)
    if (maxRun(key) >= 3) warn.push('ключ: три одинаковых ответа подряд, перемешайте')
    if (t.task === 2 && cnt.includes(0)) warn.push('ключ: не использован один из вариантов True / False / Not stated')
    if (Math.max(...cnt) > Math.ceil(key.length / 2)) warn.push(`ключ: ответ повторяется слишком часто (1:${cnt[0]}, 2:${cnt[1]}, 3:${cnt[2]})`)
  }
  return { err, warn }
}

// ───────────── Страница для вычитки ─────────────
function review(t, res) {
  const L = [`# ${t.id}: ${t.title || ''}`, `Задание ${t.task}, юнит ${t.unit}, модуль ${t.module}`, '', '## Текст записи']
  for (const s of t.script) L.push(`**${s.who}:** ${s.text}`, '')
  L.push('## Задание')
  if (t.task === 1) {
    t.options.forEach((o, i) => L.push(`- ${i + 1}. ${o}`))
    L.push('', `**Ключ:** ${t.key.map((k, i) => `${'ABCDEF'[i]}–${k}`).join(', ')}`)
  } else if (t.task === 2) {
    t.statements.forEach((o, i) => L.push(`- ${'ABCDEFGHI'[i]}. ${o}  → **${['', 'True', 'False', 'Not stated'][t.key[i]]}**`))
  } else {
    t.questions.forEach((q, i) => {
      L.push(`${i + 1}. ${q.q}`)
      q.options.forEach((o, j) => L.push(`   ${j + 1}) ${o}${t.key[i] === j + 1 ? '  ✔' : ''}`))
    })
  }
  L.push('', '## Что проверить вручную',
    '- [ ] Каждый ответ однозначно следует из текста (или однозначно не следует, для Not stated)',
    '- [ ] В тексте нет прямых повторов формулировок утверждений: нужен перефраз',
    '- [ ] Уровень лексики B2–B2+, нет ошибок и неестественных оборотов',
    '- [ ] Тема и лексика юнита встречаются в записи', '',
    '## Автоматическая проверка', ...res.err.map((e) => `- ОШИБКА: ${e}`), ...res.warn.map((w) => `- ${w}`))
  mkdirSync(DIR.review, { recursive: true })
  writeFileSync(join(DIR.review, `${t.id}.md`), L.join('\n') + '\n')
}

// ───────────── ElevenLabs ─────────────
async function api(url, init) {
  for (let i = 0; i < 4; i++) {
    const r = await fetch(url, { ...init, headers: { 'xi-api-key': KEY, 'Content-Type': 'application/json' } })
    if (r.ok) return r
    if ((r.status === 429 || r.status >= 500) && i < 3) { await new Promise((ok) => setTimeout(ok, 3000 * (i + 1))); continue }
    throw new Error(`ElevenLabs ${r.status}: ${(await r.text()).slice(0, 300)}`)
  }
}

async function renderAnnouncer(text, voice_id) {
  const h = createHash('sha256').update(JSON.stringify({ ANNOUNCER_MODEL, ANNOUNCER_SETTINGS, text, voice_id })).digest('hex').slice(0, 24)
  const cache = join(DIR.cache, `${h}.mp3`)
  if (existsSync(cache)) return clean(readFileSync(cache))
  if (flag('mock')) return silence(text.length / (14 * ANNOUNCER_SPEED))
  const r = await api(`https://api.elevenlabs.io/v1/text-to-speech/${voice_id}?output_format=mp3_44100_128`, {
    method: 'POST',
    body: JSON.stringify({ text, model_id: ANNOUNCER_MODEL, voice_settings: ANNOUNCER_SETTINGS }),
  })
  const buf = stripId3(Buffer.from(await r.arrayBuffer()))
  mkdirSync(DIR.cache, { recursive: true }); writeFileSync(cache, buf)
  return clean(buf)
}

async function render(inputs, seed) {
  const h = createHash('sha256').update(JSON.stringify({ MODEL, inputs, seed })).digest('hex').slice(0, 24)
  const cache = join(DIR.cache, `${h}.mp3`)
  if (existsSync(cache)) return clean(readFileSync(cache))
  let buf
  if (flag('mock')) buf = silence(inputs.reduce((n, i) => n + i.text.length, 0) / 14) // ≈14 знаков в секунду
  else {
    const r = await api('https://api.elevenlabs.io/v1/text-to-dialogue?output_format=mp3_44100_128', {
      method: 'POST',
      body: JSON.stringify({ inputs, model_id: MODEL, ...(seed != null && { seed }) }),
    })
    buf = stripId3(Buffer.from(await r.arrayBuffer()))
  }
  if (!flag('mock')) { mkdirSync(DIR.cache, { recursive: true }); writeFileSync(cache, buf) }
  return clean(buf)
}

function chunk(turns) {
  const out = []; let cur = [], n = 0
  for (const t of turns) {
    if (cur.length && n + t.text.length > MAX_CHARS) { out.push(cur); cur = []; n = 0 }
    cur.push(t); n += t.text.length
  }
  return cur.length ? [...out, cur] : out
}

async function build(t) {
  const pause = { ...PAUSE, ...t.pauses }
  const turns = t.script.map((s) => ({ text: s.text, voice_id: voices[s.who === ANNOUNCER ? 'announcer' : t.speakers[s.who]], isAnnouncer: s.who === ANNOUNCER }))
  let groups
  if (t.task === 1) { // каждый говорящий отдельной записью, перед ним реплика диктора
    groups = []; let cur = []
    t.script.forEach((s, i) => { cur.push(turns[i]); if (s.who !== ANNOUNCER) { groups.push(cur); cur = [] } })
  } else groups = chunk(turns)
  const parts = []
  for (const [i, g] of groups.entries()) {
    if (i) parts.push(silence(GAP[t.task]))
    const lead = g[0].isAnnouncer ? g.shift() : null
    if (lead) { parts.push(await renderAnnouncer(lead.text, lead.voice_id)); parts.push(silence(0.6)) }
    parts.push(await render(g, t.seed))
  }
  const body = Buffer.concat(parts)

  const say = (text, role = 'announcer') => renderAnnouncer(text, voices[role] && !/^PUT_/.test(voices[role]) ? voices[role] : voices.announcer)
  const ru = (text) => say(text, 'announcer_ru') // отдельный русскоязычный голос диктора, если задан
  const short = silence(0.8)
  return Buffer.concat([
    await ru(t.ru || RU[t.task]), silence(READ[t.task]),
    await say(EN.start), short, body, short,
    await say(EN.complete), silence(pause.task),
    await say(EN.again[t.task]), short, body, short,
    await say(EN.check), silence(pause.check),
    ...(t.endOfTest ? [await say(EN.endTest), silence(1)] : []),
    silence(pause.end),
  ])
}

// ───────────── Запуск ─────────────
async function main() {
  if (flag('voices')) {
    if (!KEY) throw new Error('Нет ELEVENLABS_API_KEY в .env')
    const r = await api('https://api.elevenlabs.io/v2/voices?page_size=100')
    for (const v of (await r.json()).voices) console.log(`${v.name.padEnd(28)} ${v.voice_id}  ${Object.values(v.labels || {}).join(', ')}`)
    return
  }
  if (flag('try')) {
    const id = args[args.indexOf('--try') + 1]
    if (!KEY || !id || id.startsWith('--')) throw new Error('Нужен ключ в .env и ID голоса: --try <voice_id>')
    mkdirSync(DIR.out, { recursive: true })
    writeFileSync(join(DIR.out, '_try.mp3'), await renderAnnouncer('Задание 1. Вы услышите шесть высказываний. Now we are ready to start. Speaker A.', id))
    console.log(`Готово: ${join(DIR.out, '_try.mp3')}. Откройте и послушайте.`)
    return
  }
  const tasks = loadTasks(), ids = tasks.map((t) => t.id)
  let bad = 0
  const todo = []
  for (const t of tasks) {
    const res = validate(t, ids)
    console.log(`\n${t.file}`); res.err.forEach((e) => console.log(`  ✗ ${e}`)); res.warn.forEach((w) => console.log(`  · ${w}`))
    if (!res.err.length) { review(t, res); if (!only || only === t.id) todo.push(t) }
    bad += res.err.length
  }
  if (bad) { console.error(`\nОшибок: ${bad}. Исправьте и запустите снова.`); process.exit(1) }
  if (flag('check')) return console.log('\nПроверка пройдена. Тексты для вычитки: папка review/')
  if (!flag('mock') && !KEY) throw new Error('Нет ELEVENLABS_API_KEY в .env (или запустите с --mock для теста)')

  mkdirSync(DIR.out, { recursive: true })
  const mpath = join(DIR.out, 'manifest.json')
  const manifest = existsSync(mpath) ? readJson(mpath) : {}
  for (const t of todo) {
    const hash = createHash('sha256').update(JSON.stringify([t.script, t.speakers, t.pauses, t.ru, t.endOfTest, t.seed, MODEL, ANNOUNCER_MODEL, ANNOUNCER_SETTINGS, voices, flag('mock'), PAUSE, READ, RU[t.task], EN])).digest('hex').slice(0, 16)
    if (manifest[t.id]?.hash === hash && existsSync(join(DIR.out, t.id + '.mp3')) && !flag('force')) { console.log(`= ${t.id}: без изменений, пропуск`); continue }
    const vid = (r) => (voices[r] && !/^PUT_/.test(voices[r]) ? voices[r] : voices.announcer)
    console.log(`→ ${t.id}: озвучиваю…`)
    console.log(`   файл voices.json: ${join(process.cwd(), DIR.tasks, 'voices.json')}`)
    console.log(`   диктор (английский): ${voices.announcer}`)
    console.log(`   диктор (русский):    ${vid('announcer_ru')}${voices.announcer_ru ? '' : '  ← announcer_ru не задан, используется announcer'}`)
    const built = finalize(await build(t)), mp3 = built.buf
    if (!built.ffmpeg) console.log('   ffmpeg не найден: файл склеен без перекодирования. Если плеер прыгает, установите ffmpeg (brew install ffmpeg) и запустите с --force')
    writeFileSync(join(DIR.out, `${t.id}.mp3`), mp3)
    manifest[t.id] = { file: `${t.id}.mp3`, seconds: Math.round(mp3.length / 16000), hash, mock: flag('mock') }
    console.log(`✓ ${t.id}: ${Math.round(mp3.length / 16000)} с → ${join(process.cwd(), DIR.out, t.id + '.mp3')}`)
  }
  writeFileSync(mpath, JSON.stringify(manifest, null, 2) + '\n')
}

main().catch((e) => { console.error(`\nОшибка: ${e.message}`); process.exit(1) })

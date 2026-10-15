/* СТРАНИЦА ЮНИТА (с вкладками) И БАНК СРАВНЕНИЙ для задания 4.
   Вкладки юнита: 0 Vocabulary, 1 Memorise, 2 Practice, затем разделы ЕГЭ: 3 Listening, 4 Reading, 5 Use of English,
   6 Writing, 7 Speaking (вкладка раздела без заданий не показывается).
   Каждая вкладка берёт свой кусок данных юнита и передаёт его своему компоненту. */
import { Topic, Unit } from "../types";
import { Img } from "./text";
import { Banner } from "./ui";
import VocabBlock, { Legend } from "./Vocab";
import ExerciseView from "./Exercises";
import SpeechView from "./Speech";
import { slotName } from "./Photo";
import Speaking from "./Speaking";
import { FlashCards, MatchPairs, QuickTest, unitCards } from "./Cards";
import { rabbitSay } from "./Rabbit";
import { useEffect, useRef } from "react";
import ListeningCard, { listeningFor, useAudio } from "./Listening";
import ReadingCard, { readingFor } from "./Reading";
import { TaskHead } from "./Task";
import { SECTIONS, sectionOfType } from "../sections";

/** Units already greeted by the rabbit during this visit
    Юниты, с которыми кролик уже поздоровался за этот визит (чтобы не здороваться повторно). Set — набор без повторов */
const greeted = new Set<string>();

/** Банк сравнений (задание 4): карточки «занятие A vs занятие B» с плюсами и минусами.
    Каждая запись typology — массив из 10 элементов строго по порядку (см. docs/CODE.md, 3.3):
    ia, a — картинка и название A; ib, b — картинка и название B; basis — основание сравнения;
    ap, am — плюсы и минусы A; bp, bm — плюсы и минусы B; diff — как описать разницу */
export function TypologyBank({ topic }: { topic: Topic }) {
  return <section className="page">
    <Banner kick="Task 4 · comparison bank" title="Types of activity: pros and cons" lede="Find the basis for comparison first, then choose pros and cons" pics={["handshake", "light_bulb"]} />
    <div className="comparison-bank">{topic.typology.map(([ia, a, ib, b, basis, ap, am, bp, bm, diff]: any) => (
      <div className="comparison-card" key={a}>
        <div className="comparison-card__header"><div className="comparison-card__activity"><Img name={ia} className="comparison-card__picture" /><b className="comparison-card__name">{a}</b></div><div className="comparison-card__versus"><i className="comparison-card__versus-word">vs</i><span className="comparison-card__basis">{basis}</span></div><div className="comparison-card__activity comparison-card__activity--right"><b className="comparison-card__name">{b}</b><Img name={ib} className="comparison-card__picture" /></div></div>
        <div className="comparison-card__columns">{[[ap, am], [bp, bm]].map(([p, m]: any, i) => <div key={i}><ul className="comparison-card__list comparison-card__list--pros">{p.map((x: string) => <li className="comparison-card__list-item" key={x}>{x}</li>)}</ul><ul className="comparison-card__list comparison-card__list--cons">{m.map((x: string) => <li className="comparison-card__list-item" key={x}>{x}</li>)}</ul></div>)}</div>
        <div className="comparison-card__difference"><span className="comparison-card__difference-label">to describe the difference:</span> {diff}</div>
      </div>))}</div>
  </section>;
}

/* Tab numbers are fixed (route.ts TABS)
   Подписи вкладок. Номера вкладок постоянные (как TABS в route.ts): 0–2 свои, 3–7 — разделы ЕГЭ из sections.json
   (Listening, Reading, Use of English, Writing, Speaking) */
const TABS = ["Vocabulary", "Memorise", "Practice", ...SECTIONS.map(s => s.label)];
/** The open tab lives in the page address (see route.ts), so App passes it in
    Страница юнита. tab — открытая вкладка (берётся из адреса), onTab — переключить вкладку (меняет адрес в App) */
export function UnitView({ unit, topic, tab, onTab }: { unit: Unit; topic: Topic; tab: number; onTab: (tab: number) => void }) {
  const cards = unitCards(unit); // все слова юнита для карточек и «Match the pairs»
  const listening = listeningFor(topic.id, unit.num); // задание на аудирование этого юнита (может не быть)
  const audio = useAudio(listening?.id);              // его запись: undefined — ещё читаем manifest, null — нет
  const reading = readingFor(topic.id, unit.num);     // задание на чтение (может не быть)
  // экзаменационные задания unit.speech по разделам (по типу из sections.json), порядок как в JSON
  const speech = unit.speech.flat();
  const of = (id: string) => speech.filter(s => sectionOfType(s.type)?.id === id);
  const writing = of("writing"), speaking = of("speaking");
  // есть ли задания в разделе; раздела без заданий (пока Use of English) нет среди вкладок
  const has: Record<string, boolean> = { listening: !!listening && audio !== null, reading: !!reading, writing: writing.length > 0, speaking: speaking.length > 0 || !!unit.speaking };
  const tabs = TABS.map((_, i) => i).filter(i => i < 3 || has[SECTIONS[i - 3].id]);
  const cur = tabs.includes(tab) ? tab : 0; // ссылка на вкладку, которой у юнита нет, открывает Vocabulary
  const sec = SECTIONS[cur - 3]; // открытый раздел ЕГЭ (undefined на вкладках 0–2)
  // на телефоне вкладки листаются вбок: открытую вкладку прокручиваем в видимую часть полосы
  const nav = useRef<HTMLElement>(null);
  useEffect(() => {
    const n = nav.current, b = n?.querySelector<HTMLElement>(".unit-tabs__tab--active");
    if (n && b) n.scrollLeft = b.offsetLeft - n.offsetLeft - (n.clientWidth - b.offsetWidth) / 2;
  }, [cur]);
  // при первом открытии юнита кролик здоровается
  useEffect(() => {
    const id = `${topic.id}-${unit.num}`;
    if (!greeted.has(id)) { greeted.add(id); rabbitSay("curious", `Unit ${unit.num}`, `${unit.title}. Let's get started!`); }
  }, [topic.id, unit.num]);
  // номер эссе в юните: от него зависит, таблица или круговая диаграмма (Speech.tsx)
  let essayIdx = 0;
  // имя файла фото/записи для каждого задания: считаем, какое по счёту это задание своего типа в юните
  const seen: Record<string, number> = {};
  const slot = (type: string) => slotName(topic.id, unit.num, type, seen[type] = (seen[type] || 0) + 1);
  return <section className="page">
    <Banner kick={`Unit ${unit.num}`} title={unit.title} lede={unit.lede} pics={unit.pics} />
    <nav className="unit-tabs" ref={nav}>{tabs.map((i, k) => <button key={i} className={`unit-tabs__tab${i === cur ? " unit-tabs__tab--active" : ""}`} onClick={() => onTab(i)}><b className="unit-tabs__number">{k + 1}</b>{TABS[i]}</button>)}</nav>
    {cur === 0 && <><Legend />{unit.vocab.map((b, i) => <VocabBlock key={i} b={b} />)}</>}
    {cur === 1 && <>
      <h3 className="section-heading">1 · Cards</h3><FlashCards cards={cards} />
      <h3 className="section-heading">2 · Match the pairs</h3><MatchPairs cards={cards} number={1} />
      {unit.cards && <><h3 className="section-heading">3 · Test</h3><QuickTest tests={unit.cards} number={1} /></>}
    </>}
    {cur === 2 && unit.exercises.map((e, i) => <ExerciseView key={i} e={e} n={i + 1} />)}
    {/* разделы ЕГЭ: строка «Listening · Tasks 1–9 · 30 min» из sections.json, затем задания раздела */}
    {sec && <h3 className="section-heading">{sec.label} · {sec.ege}{sec.minutes ? ` · ${sec.minutes} min` : ""}</h3>}
    {sec?.id === "listening" && listening && audio && <ListeningCard key={listening.id} t={listening} audio={audio} />}
    {sec?.id === "reading" && reading && <ReadingCard key={reading.id} t={reading} />}
    {/* задания нумеруются подряд внутри раздела: Task 1, Task 2… */}
    {(sec?.id === "writing" || sec?.id === "speaking") && (sec.id === "writing" ? writing : speaking).map((s, i) =>
      <SpeechView key={i} s={s} topic={topic} idx={s.type === "essay" ? essayIdx++ : 0} slot={slot(s.type)} head={<TaskHead where={`Unit ${unit.num}`} section={sec.id} n={i + 1} type={s.type} />} />)}
    {/* бывшая вкладка Speaking: задания вне формата экзамена, без номеров ЕГЭ */}
    {sec?.id === "speaking" && unit.speaking && <><h3 className="section-heading">More speaking practice</h3><Speaking tasks={unit.speaking} /></>}
  </section>;
}

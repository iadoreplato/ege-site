/* ТРЕНИРОВОЧНЫЙ ВАРИАНТ ЕГЭ (бесплатная часть, меню «Practice tests»). Данные — обычные папки контента, module = "variant",
   unit = номер варианта: listening/variant-N-t1…t3, reading/variant-N-t10…t12, use-of-english/variant-N-t19, -t25, -t30,
   writing/variant-N (tasks: email, essay), speaking/variant-N (tasks: reading, ad, interview, photo).
   Вкладки — разделы ЕГЭ, где у варианта есть задания, и «Result»: баллы по заданиям, слабые места и где их тренировать.
   Блока Discuss в вариантах нет (как на экзамене). Карточка аудирования появляется, когда готова запись (manifest.json).
   Баллы: 1–36 — по проверке (лучший результат), 37–38 — ИИ-проверка или самооценка, устная часть — самооценка по критериям.
   Максимумы заданий — scale.json (points). Всё хранится в браузере. */
import { useEffect, useState } from "react";
import { AudioInfo, RichText, Topic } from "../types";
import { SECTIONS, egeNumber, sectionById, sectionOfType } from "../sections";
import { VTABS } from "../route";
import scale from "../content/scale.json";
import { record } from "../demo";
import ListeningCard, { getManifest, listeningOf } from "./Listening";
import ReadingCard, { readingOf } from "./Reading";
import SpeechView from "./Speech";
import { Cloze, Gaps } from "./UseOfEnglish";
import { TaskHead, bestOf } from "./Task";
import { practice } from "./Cabinet";
import { Banner, Timer } from "./ui";

type File = { id: string; module: string; unit: number; task?: number; title?: string; tasks?: any[]; rows?: any; key?: any; text?: string; opts?: any[] };
const ofVariants = (files: Record<string, File>) => Object.values(files).filter(f => f.module === "variant");
const USE = ofVariants(import.meta.glob<File>("../content/use-of-english/*.json", { eager: true, import: "default" }));
const WRITING = ofVariants(import.meta.glob<File>("../content/writing/*.json", { eager: true, import: "default" }));
const SPEAKING = ofVariants(import.meta.glob<File>("../content/speaking/*.json", { eager: true, import: "default" }));

/** Подсказки в вариантах (trap, focus4) пришли с <b>…</b> и <i>…</i>: превращаем в RichText — <b> ключевые слова, <i> примеры */
const rich = (s?: string): RichText | undefined => {
  if (!s || !/<[bi]>/.test(s)) return s;
  const all = (tag: string) => [...s.matchAll(new RegExp(`<${tag}>(.*?)</${tag}>`, "g"))].map(m => m[1]);
  return { text: s.replace(/<\/?[bi]>/g, ""), key: all("b"), example: all("i") };
};

/** Номера вариантов — из всех файлов с module = "variant"; у каждого варианта — его задания по разделам */
const NUMS = [...new Set([...listeningOf("variant"), ...readingOf("variant"), ...USE, ...WRITING, ...SPEAKING].map(f => f.unit))].sort((a, b) => a - b);
const VARIANTS = NUMS.map(n => ({
  n, id: `variant-${n}`, title: `Variant ${n}`, lede: "A practice test in the EGE 2027 format",
  listening: listeningOf("variant").filter(t => t.unit === n),
  reading: readingOf("variant").filter(t => t.unit === n),
  use: USE.filter(u => u.unit === n).sort((a, b) => a.task! - b.task!),
  writing: (WRITING.find(w => w.unit === n)?.tasks ?? []).map(t => ({ ...t, focus4: rich(t.focus4) })),
  speaking: (SPEAKING.find(w => w.unit === n)?.tasks ?? []).map(t => ({ ...t, trap: rich(t.trap) })),
}));
/** Все варианты по порядку (меню «Practice tests», страница бесплатной части) */
export const variants = () => VARIANTS;

/* Результат задания варианта, кроме 1–18: «variant:variant-1:writing:email» → {"score": 5, "max": 6, "by": "check" | "ai" | "self"} */
type Score = { score: number; max: number; by: "check" | "ai" | "self" };
const loadScore = (k: string): Score | null => { try { return JSON.parse(localStorage.getItem(k) ?? "null"); } catch { return null; } };
const saveScore = (k: string, s: Score) => { try { localStorage.setItem(k, JSON.stringify(s)); } catch { /* private mode */ } };
/** максимум первичных баллов задания ЕГЭ (scale.json); ключ — «раздел:тип» */
const POINTS = scale.points as Record<string, number>;

/** Самооценка по критериям ФИПИ (письмо и устная часть); ИИ-проверка, если подключена, ставит балл сама */
function SelfScore({ max, value, onChange }: { max: number; value: Score | null; onChange: (s: Score) => void }) {
  return <label className="self-score">Your score by the FIPI criteria
    <select value={value ? value.score : ""} onChange={e => onChange({ score: Number(e.target.value), max, by: "self" })}>
      <option value="" disabled>—</option>{Array.from({ length: max + 1 }, (_, n) => <option key={n} value={n}>{n} of {max}</option>)}
    </select>{value?.by === "ai" && <em className="self-score__ai">set by the AI check</em>}</label>;
}

/** Страница варианта i: вкладки разделов и итог */
export default function VariantView({ i, tab, onTab, topics }: { i: number; tab: number; onTab: (t: number) => void; topics: Topic[] }) {
  const v = VARIANTS[i];
  const [, redraw] = useState(0);
  // записи аудирования: undefined — ещё читаем manifest.json; в карточки идут только готовые (не заглушки)
  const [audio, setAudio] = useState<Record<string, AudioInfo>>();
  useEffect(() => { let on = true; getManifest().then(m => on && setAudio(m)); return () => { on = false; }; }, []);
  if (!v) return <section className="page"><Banner kick="Practice tests" title="Variant not found" /><a href="#/free">All variants</a></section>;
  const where = v.title;
  const { listening, reading, use, writing, speaking } = v;
  const heard = listening.filter(t => audio?.[t.id]?.mock === false);
  const has: Record<string, boolean> = { listening: listening.length > 0, reading: reading.length > 0, "use-of-english": use.length > 0, writing: writing.length > 0, speaking: speaking.length > 0, result: true };
  const tabs = VTABS.map((_, n) => n).filter(n => has[VTABS[n]]);
  const cur = tabs.includes(tab) ? tab : tabs[0];
  const sec = SECTIONS.find(s => s.id === VTABS[cur]);
  const key = (skill: string) => `variant:${v.id}:${skill}`;
  /** сохранить результат задания, записать в кабинет ученика, перерисовать итог */
  const setScore = (skill: string, s: Score) => { saveScore(key(skill), s); record({ skill, title: `${where} · ${sectionById(skill.split(":")[0]).label}`, score: s.score, max: s.max, href: location.hash }); redraw(n => n + 1); };
  // образцы вопросов к рекламе — из поля questions задания; ad_keys модуля пустые, чтобы не подставились вопросы из учебника
  const topic = { ...topics[0], ad_keys: [] };
  /** письменное или устное задание + самооценка */
  const card = (s: any, n: number, section: string) => <div key={n}>
    <SpeechView s={s} topic={topic} idx={0} slot={`${v.id}-${s.type}`} head={<TaskHead where={where} section={section} n={n + 1} type={s.type} />}
      onScore={(score, max) => setScore(`${section}:${s.type}`, { score, max, by: "ai" })} />
    <SelfScore max={POINTS[`${section}:${s.type}`]} value={loadScore(key(`${section}:${s.type}`))} onChange={x => setScore(`${section}:${s.type}`, x)} />
  </div>;
  /** задание 19–36: Gaps для 19 и 25, Cloze для 30; счёт после проверки идёт в итог */
  const useTask = (u: File, n: number) => { const skill = `use-of-english:${u.task}`, onCheck = (score: number, max: number) => setScore(skill, { score, max, by: "check" });
    return <div key={u.id}><TaskHead where={where} section="use-of-english" n={n + 1} type={String(u.task)} />
      {u.task === 30 ? <Cloze text={u.text!} opts={u.opts!} answers={u.key} onCheck={onCheck} /> : <Gaps rows={u.rows} keys={u.key} type={String(u.task) as "19" | "25"} onCheck={onCheck} />}</div>; };

  // итог: строка на задание ЕГЭ. p — результат (верных ответов или баллов из скольких); points — первичные баллы, если их можно посчитать
  const rows = [
    ...listening.map(t => ({ skill: `listening:${t.task}`, title: t.title, p: bestOf("listening", t.id) })),
    ...reading.map(t => ({ skill: `reading:${t.task}`, title: t.title, p: bestOf("reading", t.id) })),
    ...use.map(u => { const s = loadScore(key(`use-of-english:${u.task}`)); return { skill: `use-of-english:${u.task}`, title: u.title ?? "", p: s && { best: s.score, max: s.max } }; }),
    ...[...writing, ...speaking].map(w => { const skill = `${sectionOfType(w.type)!.id}:${w.type}`, s = loadScore(key(skill));
      return { skill, title: w.type === "email" ? `An email to ${w.sender}` : w.type === "essay" ? w.subject[0].toUpperCase() + w.subject.slice(1) : sectionById("speaking").types[w.type] ?? w.type, p: s && { best: s.score, max: s.max } }; }),
  ].map(r => ({ ...r, max: POINTS[r.skill], points: r.p && r.p.max === POINTS[r.skill] ? r.p.best : null }));
  // задания 1, 2, 10, 11: за 6–7 ответов ставят 2–3 балла; пока схема частичных баллов не подтверждена (scale.json: partial), баллы не считаем
  const done = rows.filter(r => r.p), counted = done.filter(r => r.points !== null);
  const got = counted.reduce((n, r) => n + r.points!, 0), of = counted.reduce((n, r) => n + r.max, 0);
  const complete = counted.length === rows.length && of === scale.max;
  const weak = done.filter(r => r.p!.best / r.p!.max < .6);

  return <section className="page">
    <Banner kick="Free · Practice test" title={v.title} lede={v.lede} pics={["memo", "stopwatch"]} />
    <nav className="unit-tabs">{tabs.map((n, k) => <button key={n} className={`unit-tabs__tab${n === cur ? " unit-tabs__tab--active" : ""}`} onClick={() => onTab(n)}><b className="unit-tabs__number">{k + 1}</b>{SECTIONS.find(s => s.id === VTABS[n])?.label ?? "Result"}</button>)}</nav>
    {sec && <><h3 className="section-heading">{sec.label} · {sec.ege}{sec.minutes ? ` · ${sec.minutes} min` : ""}</h3>
      {sec.minutes && <Timer key={sec.id} seconds={sec.minutes * 60} label="Section time" />}</>}
    {VTABS[cur] === "listening" && audio && (heard.length ? heard.map((t, n) => <ListeningCard key={t.id} t={t} audio={audio[t.id]} where={where} n={n + 1} discuss={false} />)
      : <p className="note">The recordings for this variant are being prepared.</p>)}
    {VTABS[cur] === "reading" && reading.map((t, n) => <ReadingCard key={t.id} t={t} where={where} n={n + 1} discuss={false} />)}
    {VTABS[cur] === "use-of-english" && use.map(useTask)}
    {VTABS[cur] === "writing" && writing.map((w, n) => card(w, n, "writing"))}
    {VTABS[cur] === "speaking" && speaking.map((w, n) => card(w, n, "speaking"))}
    {VTABS[cur] === "result" && <>
      <h3 className="section-heading">Your result</h3>
      <div className="result-total"><b className="result-total__value">{got} / {of}</b><span>primary points in the tasks scored so far ({done.length} of {rows.length} tasks done)</span></div>
      {complete ? <p className="result-total__test">Test score: <b>{scale.test[got]}</b> of 100 ({scale.year} scale; pass mark {scale.pass})</p>
        : <p className="note">The test score ({scale.year} scale, {scale.max} primary points) appears when every task is done and scored. Tasks 1, 2, 10 and 11 give 2–3 points for 6–7 answers, so for now they show correct answers only.</p>}
      <div className="cabinet-scroll"><table className="class-table"><thead><tr><th>EGE</th><th>Task</th><th>Result</th><th>Points</th></tr></thead><tbody>
        {rows.map(r => { const [s, t] = r.skill.split(":"); return <tr key={r.skill}><td>{egeNumber(sectionById(s), t)}</td><td>{sectionById(s).label} · {r.title}</td>
          <td>{r.p ? `${r.p.best} / ${r.p.max}` : <a href={`#/free/variant/${i + 1}/${s}`}>not done</a>}</td><td>{r.points !== null ? `${r.points} / ${r.max}` : `? / ${r.max}`}</td></tr>; })}</tbody></table></div>
      <h3 className="section-heading">What to work on</h3>
      {weak.length ? <ul className="review-list">{weak.map(r => { const [s, t] = r.skill.split(":"), p = practice(r.skill, topics);
        return <li key={r.skill}><b>{sectionById(s).label} · {sectionById(s).types[t]}</b> · {Math.round(100 * r.p!.best / r.p!.max)}% {p && <a href={p.href}>practise in the textbook: {p.title} →</a>}</li>; })}</ul>
        : <p className="note">{done.length ? "No weak points in the tasks you have done: well done!" : "Do the tasks to see your weak points here."}</p>}
    </>}
  </section>;
}

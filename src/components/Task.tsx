/* ОБЩИЕ ЧАСТИ ЗАДАНИЙ ПО РАЗДЕЛАМ ЕГЭ (вкладки Listening, Reading, Writing, Speaking):
   строка-заголовок карточки, ответы с проверкой (Check / Show answers / Try again), выпадающий список, варианты-кружки
   и блок Discuss. Прогресс хранится только в браузере (localStorage); если хранилище недоступно, сайт всё равно работает. */
import { ReactNode, useState } from "react";
import { egeNumber, sectionById } from "../sections";
import { cheer } from "./Rabbit";
import { record } from "../demo";

/** Строка-заголовок карточки: «Unit 3 · Reading · Task 2», метка «EGE 11» и подпись типа из sections.json.
    where — где задание («Unit 3» или «Variant 1»); n — номер задания по порядку в разделе; type — тип из sections.json ("11", "interview", "essay"…) */
export function TaskHead({ where, section, n, type }: { where: string; section: string; n: number; type: string }) {
  const s = sectionById(section);
  return <div className="task-head"><span className="task-head__name">{where} · {s.label} · Task {n}</span><span className="task-head__ege">EGE {egeNumber(s, type)}</span><span className="task-head__type">{s.types[type]}</span></div>;
}

/** Карточка задания listening или reading: заголовок, название, русская формулировка (поле ru в sections.json), содержимое.
    column — варианты ответа столбиком (вопросы 3–9 и 12–18) */
export function TaskCard({ where, n = 1, section, type, title, column, children }: { where: string; n?: number; section: string; type: string; title: string; column?: boolean; children: ReactNode }) {
  const ru = sectionById(section).ru?.[type];
  return <div className={`exercise task-card${column ? " task-card--column" : ""}`}>
    <TaskHead where={where} section={section} n={n} type={type} />
    <h4 className="task-card__title">{title}</h4>
    {ru && <p className="russian-instruction">{ru}</p>}
    {children}
  </div>;
}

/* Прогресс: «listening:sport-u1» или «reading:sport-u1» → {"best": 5, "max": 6} */
type Progress = { best: number; max: number };
const load = (k: string): Progress | null => { try { return JSON.parse(localStorage.getItem(k) ?? "null"); } catch { return null; } };
/** Задание уже проверялось? section — "listening" или "reading", id — id задания */
export const isDone = (section: string, id: string) => !!load(`${section}:${id}`);
/** Лучший результат задания или null (для итога варианта) */
export const bestOf = (section: string, id: string) => load(`${section}:${id}`);

/** Ответы ученика на задание с ключом key: ans — выбранные цифры по порядку (0 или пусто — не выбрано),
    checked — нажата Check, shown — нажата Show answers. Check запоминает лучший результат, записывает результат
    в кабинет ученика (demo.ts: навык «section:type») и зовёт кролика */
export function useAnswers(section: string, type: string, where: string, id: string, key: number[]) {
  const [ans, setAns] = useState<number[]>([]);
  const [checked, setChecked] = useState(false);
  const [shown, setShown] = useState(false);
  const score = key.filter((k, i) => ans[i] === k).length;
  return {
    key, ans, checked, shown, score,
    pick: (i: number, v: number) => { if (!checked) { const a = [...ans]; a[i] = v; setAns(a); } },
    /** класс строки ответа: после проверки — зелёная или розовая метка */
    row: (i: number) => `task-card__row${checked ? (ans[i] === key[i] ? " task-card__row--right" : " task-card__row--wrong") : ""}`,
    check() {
      setChecked(true);
      const k = `${section}:${id}`;
      try { localStorage.setItem(k, JSON.stringify({ best: Math.max(score, load(k)?.best ?? 0), max: key.length })); } catch { /* хранилище недоступно */ }
      record({ skill: `${section}:${type}`, title: `${where} · ${sectionById(section).label}`, score, max: key.length, href: location.hash });
      cheer(score, key.length);
    },
    show: () => setShown(true),
    reset: () => { setAns([]); setChecked(false); setShown(false); },
  };
}
export type Answers = ReturnType<typeof useAnswers>;

/** Выпадающий список 1…n для строки i. После проверки цифра, выбранная несколько раз, обводится пунктиром
    (в заданиях 1 и 10 каждая цифра — один раз); при Show answers рядом — верный ответ */
export function Select({ a, i, n, label }: { a: Answers; i: number; n: number; label: string }) {
  const repeat = a.checked && !!a.ans[i] && a.ans.filter(x => x === a.ans[i]).length > 1;
  return <>
    <select className={`task-card__select${repeat ? " task-card__select--repeat" : ""}`} value={a.ans[i] ?? 0} disabled={a.checked} onChange={e => a.pick(i, Number(e.target.value))} aria-label={label}>
      <option value={0}>—</option>{Array.from({ length: n }, (_, j) => <option key={j} value={j + 1}>{j + 1}</option>)}
    </select>
    {repeat && <span className="task-card__hint">{a.ans[i]} is used more than once</span>}
    {a.shown && <span className="task-card__hint">answer: {a.key[i]}</span>}
  </>;
}

/** Варианты-кружки строки i. После проверки выбранный — зелёный или розовый, верный при Show answers — с рамкой.
    numbered — цифра перед вариантом (вопросы 3–9 и 12–18) */
export const Choices = ({ a, i, name, options, numbered }: { a: Answers; i: number; name: string; options: string[]; numbered?: boolean }) =>
  <div className="task-card__choices">{options.map((o, j) => {
    const v = j + 1, mark = a.checked && a.ans[i] === v ? (v === a.key[i] ? " task-card__choice--right" : " task-card__choice--wrong") : "";
    return <label key={j} className={`task-card__choice${mark}${a.shown && v === a.key[i] ? " task-card__choice--key" : ""}`}>
      <input type="radio" name={`${name}-${i}`} checked={a.ans[i] === v} disabled={a.checked} onChange={() => a.pick(i, v)} />{numbered && <b>{v}</b>}{o}</label>;
  })}</div>;

/** Панель под заданием: Check → «N of M», Show answers, Try again. После Show answers — ключ таблицей, как в бланке ЕГЭ.
    labels — подписи ячеек таблицы (A–F, 3–9, 12–18) */
export const AnswerBar = ({ a, labels }: { a: Answers; labels: string[] }) => <>
  <div className="exercise__check-bar">{!a.checked
    ? <button className="button button--primary" onClick={a.check}>Check</button>
    : <><span className="exercise__score">{a.score} of {a.key.length}</span>
      {!a.shown && <button className="button button--secondary" onClick={a.show}>Show answers</button>}
      <button className="button button--secondary" onClick={a.reset}>Try again</button></>}</div>
  {a.shown && <table className="task-card__key"><tbody>
    <tr>{labels.map(l => <th key={l}>{l}</th>)}</tr>
    <tr>{a.key.map((k, i) => <td key={i}>{k}</td>)}</tr>
  </tbody></table>}
</>;

/** Блок Discuss под заданием: вопросы из поля discuss (не придумываются) для обсуждения с учителем. Нет вопросов — блока нет */
export function Discuss({ questions }: { questions?: string[] }) {
  if (!questions?.length) return null;
  return <div className="discuss">
    <h4 className="discuss__title">Discuss</h4><p className="discuss__hint">Talk it over with your tutor or partner</p>
    <ol className="discuss__list">{questions.map((q, i) => <li key={i}>{q}</li>)}</ol>
  </div>;
}

/* ЗАДАНИЕ НА АУДИРОВАНИЕ (вкладка Exam tasks, подраздел Listening). Один компонент на три формата:
   task 1 — говорящие A–F и утверждения 1–7 (выпадающие списки); task 2 — утверждения A–G, True / False / Not stated;
   task 3 — вопросы 3–9 по три варианта. Данные — src/content/listening/<module>-u<N>.json, звук — public/audio/<id>.mp3.
   Текст записи (script) показывается только после проверки. Результат хранится только в браузере (localStorage). */
import { useEffect, useState } from "react";
import { AudioInfo, ListeningTask } from "../types";
import { LISTENING_INSTRUCTIONS } from "../texts";
import Player from "./Player";
import { cheer } from "./Rabbit";

/* Все задания из папки listening, кроме voices.json (это настройки голосов для озвучки, на сайте не нужны) */
const files = import.meta.glob<ListeningTask>(["../content/listening/*.json", "!../content/listening/voices.json"], { eager: true, import: "default" });
const TASKS = Object.values(files);
/** Задание для юнита: module — id модуля ("sport"), unit — номер юнита */
export const listeningFor = (module: string, unit: number) => TASKS.find(t => t.module === module && t.unit === unit);

/* manifest.json читается один раз за визит. Нет файла или ошибка сети — пустой список, карточки не показываются */
let manifest: Promise<Record<string, AudioInfo>> | undefined;
const getManifest = (): Promise<Record<string, AudioInfo>> => manifest ??= fetch(`${import.meta.env.BASE_URL}audio/manifest.json`).then(r => r.ok ? r.json() : {}).catch(() => ({}));

/* Прогресс: «listening:sport-u1» → {"best": 5, "max": 6}. Хранилище может быть недоступно — тогда просто не запоминаем */
type Progress = { best: number; max: number };
const loadProgress = (id: string): Progress | null => { try { return JSON.parse(localStorage.getItem(`listening:${id}`) ?? "null"); } catch { return null; } };
const saveProgress = (id: string, p: Progress) => { try { localStorage.setItem(`listening:${id}`, JSON.stringify(p)); } catch { /* private mode */ } };
/** Задание этого юнита уже проверялось? (отметка «done» в оглавлении, Cover.tsx) */
export const listeningDone = (module: string, unit: number) => { const t = listeningFor(module, unit); return !!t && !!loadProgress(t.id); };

const LETTERS = "ABCDEFG";
const TF = ["True", "False", "Not stated"]; // task 2: ответ 1, 2, 3

/** Карточка задания. Не показывается, пока не прочитан manifest, и совсем — если записи нет или она mock */
export default function ListeningCard({ t }: { t: ListeningTask }) {
  const [audio, setAudio] = useState<AudioInfo | null>(null);
  const [ans, setAns] = useState<number[]>([]); // ответы ученика по порядку, 0 — не выбран
  const [checked, setChecked] = useState(false);
  const [shown, setShown] = useState(false); // нажата Show answers
  useEffect(() => { let on = true; getManifest().then(m => on && setAudio(m[t.id]?.mock === false ? m[t.id] : null)); return () => { on = false; }; }, [t.id]);
  if (!audio) return null;

  const n = t.key.length;
  const score = t.key.filter((k, i) => ans[i] === k).length;
  // подписи строк: A–F (task 1), A–G (task 2), 3–9 (task 3)
  const label = (i: number) => t.task === 3 ? String(i + 3) : LETTERS[i];
  const pick = (i: number, v: number) => { if (!checked) { const a = [...ans]; a[i] = v; setAns(a); } };
  // task 1: один номер у нескольких говорящих — не запрещаем, но после проверки подсвечиваем
  const repeated = (i: number) => t.task === 1 && !!ans[i] && ans.filter(x => x === ans[i]).length > 1;
  const rowClass = (i: number) => `listening__row${checked ? (ans[i] === t.key[i] ? " listening__row--right" : " listening__row--wrong") : ""}`;

  function check() {
    setChecked(true);
    const prev = loadProgress(t.id);
    saveProgress(t.id, { best: Math.max(score, prev?.best ?? 0), max: n });
    cheer(score, n);
  }
  const reset = () => { setAns([]); setChecked(false); setShown(false); };

  /** Варианты-кружки одной строки (task 2 и 3). Выбранный после проверки — зелёный или розовый, верный при Show answers — с рамкой */
  const choices = (i: number, opts: string[]) => <div className="listening__choices">{opts.map((o, j) => {
    const v = j + 1, mark = checked && ans[i] === v ? (v === t.key[i] ? " listening__choice--right" : " listening__choice--wrong") : "";
    return <label key={j} className={`listening__choice${mark}${shown && v === t.key[i] ? " listening__choice--key" : ""}`}>
      <input type="radio" name={`${t.id}-${i}`} checked={ans[i] === v} disabled={checked} onChange={() => pick(i, v)} />{t.task === 3 && <b>{v}</b>}{o}</label>;
  })}</div>;

  // заголовок подраздела — внутри карточки, чтобы без записи не было пустого «Listening»
  return <><h3 className="section-heading">Listening</h3><div className={`exercise listening listening--task-${t.task}`}>
    <h4 className="listening__title">{t.title}</h4>
    <p className="listening__instruction">{LISTENING_INSTRUCTIONS[t.task]}</p>
    <Player src={`${import.meta.env.BASE_URL}audio/${audio.file}`} seconds={audio.seconds} onMissing={() => setAudio(null)} />

    {t.task === 1 && <>
      <ol className="listening__options">{t.options.map((o, i) => <li key={i}>{o}</li>)}</ol>
      {t.key.map((k, i) => <div key={i} className={rowClass(i)}>
        <span className="listening__label">Speaker {LETTERS[i]}</span>
        <select className={`listening__select${checked && repeated(i) ? " listening__select--repeat" : ""}`} value={ans[i] ?? 0} disabled={checked} onChange={e => pick(i, Number(e.target.value))} aria-label={`Speaker ${LETTERS[i]}`}>
          <option value={0}>—</option>{t.options.map((_, j) => <option key={j} value={j + 1}>{j + 1}</option>)}
        </select>
        {checked && repeated(i) && <span className="listening__hint">{ans[i]} is used more than once</span>}
        {shown && <span className="listening__hint">answer: {k}</span>}
      </div>)}
    </>}
    {t.task === 2 && t.statements.map((s, i) => <div key={i} className={rowClass(i)}><span className="listening__label">{LETTERS[i]}</span><p className="listening__text">{s}</p>{choices(i, TF)}</div>)}
    {t.task === 3 && t.questions.map((q, i) => <div key={i} className={rowClass(i)}><span className="listening__label">{label(i)}</span><p className="listening__text">{q.q}</p>{choices(i, q.options)}</div>)}

    <div className="exercise__check-bar">{!checked
      ? <button className="button button--primary" onClick={check}>Check</button>
      : <><span className="exercise__score">{score} of {n}</span>
        {!shown && <button className="button button--secondary" onClick={() => setShown(true)}>Show answers</button>}
        <button className="button button--secondary" onClick={reset}>Try again</button></>}</div>

    {/* ответы как в бланке ЕГЭ: таблица «буква/номер задания → цифра» */}
    {shown && <table className="listening__key"><tbody>
      <tr>{t.key.map((_, i) => <th key={i}>{label(i)}</th>)}</tr>
      <tr>{t.key.map((k, i) => <td key={i}>{k}</td>)}</tr>
    </tbody></table>}
    {checked && <details className="listening__transcript"><summary>Transcript</summary>
      {/* реплики диктора «Speaker A» — подзаголовки, остальные — «Имя: текст» (имя не повторяем сразу после такого подзаголовка) */}
      {t.script.map((s, i) => s.who === "Announcer" ? <h5 key={i} className="listening__announce">{s.text}</h5>
        : <p key={i}>{s.who !== t.script[i - 1]?.text && <b>{s.who}: </b>}{s.text}</p>)}
    </details>}
  </div></>;
}

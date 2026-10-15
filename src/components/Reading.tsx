/* ЗАДАНИЕ НА ЧТЕНИЕ (вкладка Reading). Один компонент на три формата:
   task 10 — 7 текстов A–G и 8 заголовков (выпадающие списки 1–8); task 11 — текст с пропусками A–F и 7 частей;
   task 12 — текст и вопросы 12–18 по четыре варианта. Данные — src/content/reading/<module>-u<N>.json.
   Тексты и блок Discuss видны всегда. Общие части — Task.tsx.
   Текст с пропусками (GappedText) общий: его же показывает задание 11 в Revision.tsx. */
import { DropdownMenu } from "radix-ui";
import { ReadingTask } from "../types";
import { Text } from "./text";
import { AnswerBar, Choices, Discuss, Select, TaskCard, useAnswers } from "./Task";

const files = import.meta.glob<ReadingTask>("../content/reading/*.json", { eager: true, import: "default" });
const TASKS = Object.values(files);
/** Задание для юнита: module — id модуля ("sport"), unit — номер юнита */
export const readingFor = (module: string, unit: number) => TASKS.find(t => t.module === module && t.unit === unit);
/** Все задания модуля или вариантов ("variant") по порядку номеров */
export const readingOf = (module: string) => TASKS.filter(t => t.module === module).sort((a, b) => a.task - b.task);

const LETTERS = "ABCDEFG";

/** Answer 1–7 for Task 11: a drop-down in the site's own style instead of the browser's list
    Выпадающий список 1–7 для задания 11 в стиле сайта. state — "correct" / "wrong" после проверки */
function NumberChoice({ value, disabled, state, onChange }: { value?: number; disabled: boolean; state: string; onChange: (v: number) => void }) {
  return <DropdownMenu.Root modal={false}>
    <DropdownMenu.Trigger className={`number-choice${state ? ` number-choice--${state}` : ""}`} disabled={disabled}>{value || "—"}<span className="number-choice__arrow" aria-hidden="true">▾</span></DropdownMenu.Trigger>
    <DropdownMenu.Portal><DropdownMenu.Content className="dropdown dropdown--numbers" sideOffset={6}>
      {[1, 2, 3, 4, 5, 6, 7].map(n => <DropdownMenu.Item key={n} className="dropdown__link" onSelect={() => onChange(n)}>{n}</DropdownMenu.Item>)}
    </DropdownMenu.Content></DropdownMenu.Portal>
  </DropdownMenu.Root>;
}

/** Задание 11: текст с пропусками {A}…{F} и 7 частей предложений (одна лишняя). keys и ans — цифры по пропускам A–F;
    reveal — показать верную цифру рядом с неверным ответом; title — заголовок внутри текста (в юните он над карточкой).
    text.split по {A}… даёт [текст, "A", текст, "B", …]: чётные куски — текст, нечётные — буквы пропусков */
export function GappedText({ title, text, parts, keys, ans, checked, reveal, pick }: { title?: string; text: string; parts: string[]; keys: number[]; ans: number[]; checked: boolean; reveal: boolean; pick: (i: number, v: number) => void }) {
  return <div className="sentence-gaps"><div className="sentence-gaps__text">{title && <><b className="sentence-gaps__title">{title}</b><br /></>}{text.split(/\{([A-F])\}/).map((p, i) => {
    if (i % 2 === 0) return <Text key={i} value={p} />;
    const n = LETTERS.indexOf(p), ok = ans[n] === keys[n];
    return <span key={i} className="sentence-gaps__gap"><b className="sentence-gaps__letter">{p}</b><NumberChoice value={ans[n]} disabled={checked} state={checked ? (ok ? "correct" : "wrong") : ""} onChange={v => pick(n, v)} />{reveal && !ok && <em className="exercise__answer exercise__answer--inline">✓ {keys[n]}</em>}</span>;
  })}</div>
    <div className="sentence-gaps__parts">{parts.map((p, i) => <div className="sentence-gaps__part" key={i}><span className="exercise__item-number">{i + 1}.</span>{p}</div>)}</div></div>;
}

/** Карточка задания на чтение t; where, n и discuss — как в ListeningCard */
export default function ReadingCard({ t, where = `Unit ${t.unit}`, n = 1, discuss = true }: { t: ReadingTask; where?: string; n?: number; discuss?: boolean }) {
  const a = useAnswers("reading", String(t.task), where, t.id, t.key);
  // подписи ответов: A–G (task 10), A–F (task 11), 12–18 (task 12)
  const labels = t.key.map((_, i) => t.task === 12 ? String(i + 12) : LETTERS[i]);
  return <TaskCard where={where} n={n} section="reading" type={String(t.task)} title={t.title} column={t.task === 12}>
    {t.task === 10 && <>
      <ol className="task-card__options">{t.headings.map((h, i) => <li key={i}>{h}</li>)}</ol>
      {t.texts.map((x, i) => <div key={i} className={a.row(i)}><span className="task-card__label">{labels[i]}</span><p className="task-card__text">{x}</p><Select a={a} i={i} n={t.headings.length} label={`Text ${labels[i]}`} /></div>)}
    </>}
    {t.task === 11 && <GappedText text={t.text} parts={t.parts} keys={t.key} ans={a.ans} checked={a.checked} reveal={a.shown} pick={a.pick} />}
    {t.task === 12 && <>
      <div className="reading-text">{t.text.map((p, i) => <p key={i}>{p}</p>)}</div>
      {t.questions.map((q, i) => <div key={i} className={a.row(i)}><span className="task-card__label">{labels[i]}</span><p className="task-card__text">{q.q}</p><Choices a={a} i={i} name={t.id} options={q.options} numbered /></div>)}
    </>}
    <AnswerBar a={a} labels={labels} />
    {discuss && <Discuss questions={t.discuss} />}
  </TaskCard>;
}

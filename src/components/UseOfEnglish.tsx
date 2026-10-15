/* ЗАДАНИЯ 19–36 (Use of English): общие для Revision, мини-повторений и вариантов ЕГЭ.
   - Gaps — задания 19–24 и 25–29: строки с пропуском и СЛОВОМ справа;
   - Cloze — задания 30–36: текст с пропусками и по 4 варианта на пропуск.
   Русские формулировки — из sections.json (раздел use-of-english, поле ru). */
import { useState } from "react";
import { isCorrect, Text } from "./text";
import { CheckBar } from "./Exercises";
import { sectionById } from "../sections";

const ru = (type: string) => sectionById("use-of-english").ru![type];

/** Задания 19–24 (type "19") и 25–29 (type "25"): строка = [номер, текст до пропуска, текст после, СЛОВО справа].
    keys — правильные ответы в том же порядке, что строки («a / b» — допустимые варианты); onCheck — кому сообщить счёт (вариант ЕГЭ) */
export function Gaps({ rows, keys, type, onCheck }: { rows: [number, string, string, string][]; keys: string[]; type: "19" | "25"; onCheck?: (score: number, total: number) => void }) {
  const [val, setVal] = useState<Record<number, string>>({});
  const [checked, setChecked] = useState(false);
  const score = rows.filter(([n], i) => isCorrect(val[n] || "", keys[i])).length;
  return <div className="exercise"><p className="russian-instruction">{ru(type)}</p><div className="word-gaps">{rows.map(([n, a, b, w], i) => {
    const ok = isCorrect(val[n] || "", keys[i]), state = checked ? (ok ? " answer-input--correct" : " answer-input--wrong") : "";
    return <div className="word-gaps__item" key={n}><span className="exercise__item-number">{n}</span><span className="word-gaps__sentence">{a} <input className={`answer-input${state}`} value={val[n] || ""} disabled={checked} onChange={e => setVal({ ...val, [n]: e.target.value })} /> {b}
      {checked && !ok && <em className="exercise__answer exercise__answer--inline">✓ {keys[i]}</em>}</span><span className="word-gaps__word">{w}</span></div>;
  })}</div><CheckBar big checked={checked} score={score} total={rows.length} onCheck={() => { setChecked(true); onCheck?.(score, rows.length); }} onReset={() => { setChecked(false); setVal({}); }} /></div>;
}

/** Задания 30–36: текст с номерами пропусков — {30} (модули) или <b>30</b> ______ (варианты); opts — [номер, вариант1, …, вариант4];
    answers — номер правильного варианта для каждого пропуска по порядку [3, 1, …]; onCheck — как у Gaps */
export function Cloze({ text, opts, answers, onCheck }: { text: string; opts: any[]; answers: number[]; onCheck?: (score: number, total: number) => void }) {
  const [val, setVal] = useState<Record<string, string>>({});
  const [checked, setChecked] = useState(false);
  const key3: Record<string, string> = Object.fromEntries(opts.map(([n], j) => [n, String(answers[j])])); // { "30": "3", … }
  const score = opts.filter(([n]) => val[n] === key3[n]).length;
  return <div className="exercise"><p className="russian-instruction">{ru("30")}</p><div className="cloze-text">{text.split(/(?:\{|<b>)(\d+)(?:\}|<\/b>\s*_*)/).map((part, i) => i % 2 === 0 ? <Text key={i} value={part} /> :
      <span key={i}><b className="cloze-text__number">{part}</b><span className="gap-line" /></span>)}</div>
    {opts.map(([n, ...ws]) => <div className="exercise__item exercise__item--collocation" key={n}><span className="exercise__item-number">{n}</span><div className="exercise__options">{ws.map((w: string, i: number) => {
      const v = String(i + 1), chosen = val[n] === v;
      const state = checked ? (v === key3[n] ? " option--correct" : chosen ? " option--wrong" : "") : chosen ? " option--selected" : "";
      return <button key={i} className={`option${state}`} onClick={() => !checked && setVal({ ...val, [n]: v })}>{i + 1}) {w}</button>;
    })}</div></div>)}
    <CheckBar big checked={checked} score={score} total={opts.length} onCheck={() => { setChecked(true); onCheck?.(score, opts.length); }} onReset={() => { setChecked(false); setVal({}); }} /></div>;
}

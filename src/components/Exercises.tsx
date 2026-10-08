import { useState } from "react";
import { Exercise } from "../types";
import { isCorrect, Slots } from "./text";
import { cheer } from "./Rabbit";

export const Head = ({ n, title, instr }: { n: number; title: string; instr: string }) =>
  <div className="exercise__header"><span className="exercise__number">{n}</span><div><div className="exercise__title">{title}</div><div className="exercise__instruction">{instr}</div></div></div>;

/** Footer with Check / Reset; after checking, the correct answers are shown.
    `big`: a large task (Revision, exam formats), the rabbit praises it more brightly */
export const CheckBar = ({ checked, score, total, onCheck, onReset, big }: { checked: boolean; score: number; total: number; onCheck: () => void; onReset: () => void; big?: boolean }) => (
  <div className="exercise__check-bar">{!checked ? <button className="button button--primary" onClick={() => { onCheck(); cheer(score, total, big); }}>Check answers</button>
    : <><span className="exercise__score">{score} / {total} correct</span><button className="button button--secondary" onClick={onReset}>Try again</button></>}</div>
);

/** Answer field state after checking: "answer-input--correct" / "--wrong" */
const fieldState = (checked: boolean, ok: boolean) => checked ? (ok ? " answer-input--correct" : " answer-input--wrong") : "";

/** collocation: [phrase, options, answer] · choose: [sentence with {a|b|c}, answer] */
function Pick({ items, kind }: { items: any[]; kind: "collocation" | "choose" }) {
  const [pick, setPick] = useState<Record<number, string>>({});
  const [checked, setChecked] = useState(false);
  const answers = items.map(it => (kind === "choose" ? it[1] : it[2]));
  const score = answers.filter((a, i) => pick[i] === a).length;
  const option = (i: number, o: string) => {
    const state = !checked ? (pick[i] === o ? " option--selected" : "") : o === answers[i] ? " option--correct" : pick[i] === o ? " option--wrong" : "";
    return <button key={o} className={`option${state}`} onClick={() => !checked && setPick({ ...pick, [i]: o })}>{o}</button>;
  };
  return <>
    <div className="exercise__items">{items.map((it, i) => kind === "collocation" ? (
      <div className="exercise__item exercise__item--collocation" key={i}><span className="exercise__item-number">{i + 1}</span><b className="exercise__phrase"><Slots text={it[0]} /></b>
        <div className="exercise__options">{it[1].map((o: string) => option(i, o))}</div></div>
    ) : (
      <div className="exercise__item exercise__item--sentence" key={i}><span className="exercise__item-number">{i + 1}</span><span className="exercise__sentence">{it[0].split(/\{([^}]*)\}/).map((p: string, j: number) => j % 2 === 0 ? p :
        <span className="exercise__inline-options" key={j}>{p.split("|").map(o => option(i, o))}</span>)}</span></div>
    ))}</div>
    <CheckBar checked={checked} score={score} total={items.length} onCheck={() => setChecked(true)} onReset={() => { setChecked(false); setPick({}); }} />
  </>;
}

export function Transform({ items, big }: { items: [string, string, string, string][]; big?: boolean }) {
  const [val, setVal] = useState<Record<number, string>>({});
  const [checked, setChecked] = useState(false);
  const score = items.filter((it, i) => isCorrect(val[i] || "", it[3])).length;
  return <>
    <div className="exercise__items">{items.map(([a, k, b, ans], i) => {
      const [before, after] = b.split("___"), ok = isCorrect(val[i] || "", ans);
      return <div className="exercise__item" key={i}><span className="exercise__item-number">{i + 1}</span><div className="exercise__content"><p className="exercise__source">{a}</p>
        <div className="exercise__target"><span className="exercise__keyword">{k}</span>{before}<input className={`answer-input${fieldState(checked, ok)}`} value={val[i] || ""} disabled={checked} onChange={e => setVal({ ...val, [i]: e.target.value })} />{after}</div>
        {checked && !ok && <div className="exercise__answer">✓ {ans}</div>}</div></div>;
    })}</div>
    <CheckBar big={big} checked={checked} score={score} total={items.length} onCheck={() => setChecked(true)} onReset={() => { setChecked(false); setVal({}); }} />
  </>;
}

/** Quick gaps: type the missing word; its first letter is shown as a hint. Items: [sentence with ___, answer] */
export function QuickGaps({ items }: { items: [string, string][] }) {
  const [val, setVal] = useState<Record<number, string>>({});
  const [checked, setChecked] = useState(false);
  const score = items.filter(([, a], i) => isCorrect(val[i] || "", a)).length;
  return <>
    <div className="exercise__items">{items.map(([text, ans], i) => {
      const [before, after] = text.split("___"), ok = isCorrect(val[i] || "", ans);
      return <div className="exercise__item" key={i}><span className="exercise__item-number">{i + 1}</span><div className="exercise__target">{before}
        <input className={`answer-input answer-input--short${fieldState(checked, ok)}`} value={val[i] || ""} disabled={checked} placeholder={`${ans[0]}…`} onChange={e => setVal({ ...val, [i]: e.target.value })} />{after}
        {checked && !ok && <span className="exercise__answer exercise__answer--inline">✓ {ans.split("/")[0]}</span>}</div></div>;
    })}</div>
    <CheckBar checked={checked} score={score} total={items.length} onCheck={() => setChecked(true)} onReset={() => { setChecked(false); setVal({}); }} />
  </>;
}

export function Translate({ items }: { items: [string, string][] }) {
  const [shown, setShown] = useState(false);
  return <>
    <div className="exercise__items">{items.map(([ru, en], i) => <div className="exercise__item" key={i}><span className="exercise__item-number">{i + 1}</span><div className="exercise__content"><p className="exercise__source exercise__source--plain">{ru}</p><textarea className="answer-textarea" rows={2} />{shown && <div className="exercise__answer">✓ {en}</div>}</div></div>)}</div>
    <div className="exercise__check-bar"><button className="button button--primary" onClick={() => setShown(!shown)}>{shown ? "Hide model answers" : "Show model answers"}</button></div>
  </>;
}

export default function ExerciseView({ e, n }: { e: Exercise; n: number }) {
  return <div className="exercise"><Head n={n} title={e.title} instr={e.instr} />
    {(e.type === "collocation" || e.type === "choose") && <Pick items={e.items} kind={e.type} />}
    {e.type === "transform" && <Transform items={e.items} />}
    {e.type === "translate" && <Translate items={e.items} />}
    {e.type === "gaps" && <QuickGaps items={e.items} />}
  </div>;
}

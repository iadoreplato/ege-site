import { useState } from "react";
import { Exercise } from "../types";
import { isCorrect, Slots } from "./text";

const Head = ({ n, title, instr }: { n: number; title: string; instr: string }) =>
  <div className="exh"><span className="exn">{n}</span><div><div className="ext">{title}</div><div className="exi">{instr}</div></div></div>;

/** Footer with Check / Reset; after checking, the correct answers are shown */
export const CheckBar = ({ checked, score, total, onCheck, onReset }: { checked: boolean; score: number; total: number; onCheck: () => void; onReset: () => void }) => (
  <div className="checkbar">{!checked ? <button className="big" onClick={onCheck}>Check answers</button>
    : <><span className="score">{score} / {total} correct</span><button className="mini" onClick={onReset}>Try again</button></>}</div>
);

function Pick({ items, kind }: { items: any[]; kind: "collocation" | "choose" }) {
  const [pick, setPick] = useState<Record<number, string>>({});
  const [checked, setChecked] = useState(false);
  const answers = items.map(it => (kind === "collocation" ? it[2] : it[1]));
  const score = answers.filter((a, i) => pick[i] === a).length;
  const cls = (i: number, o: string) => {
    if (!checked) return pick[i] === o ? "sel" : "";
    if (o === answers[i]) return "ok";
    return pick[i] === o ? "bad" : "";
  };
  const set = (i: number, o: string) => !checked && setPick({ ...pick, [i]: o });
  return <>
    {items.map((it, i) => kind === "collocation" ? (
      <div className="co" key={i}><span className="nn">{i + 1}</span><b><Slots text={it[0]} /></b>
        <div className="co-o">{it[1].map((o: string) => <button key={o} className={cls(i, o)} onClick={() => set(i, o)}>{o}</button>)}</div></div>
    ) : (
      <div className="gs" key={i}><span className="nn">{i + 1}</span><span>{it[0].split(/\{([^}]*)\}/).map((p: string, j: number) => j % 2 === 0 ? p :
        <span className="opts" key={j}>{p.split("|").map(o => <button key={o} className={cls(i, o)} onClick={() => set(i, o)}>{o}</button>)}</span>)}</span></div>
    ))}
    <CheckBar checked={checked} score={score} total={items.length} onCheck={() => setChecked(true)} onReset={() => { setChecked(false); setPick({}); }} />
  </>;
}

export function Transform({ items }: { items: [string, string, string, string][] }) {
  const [val, setVal] = useState<Record<number, string>>({});
  const [checked, setChecked] = useState(false);
  const score = items.filter((it, i) => isCorrect(val[i] || "", it[3])).length;
  return <>
    {items.map(([a, k, b, ans], i) => {
      const [before, after] = b.split("___");
      const st = checked ? (isCorrect(val[i] || "", ans) ? "ok" : "bad") : "";
      return <div className="kw" key={i}><span className="nn">{i + 1}</span><div><p>{a}</p>
        <div className="kw-2"><span className="kw-k">{k}</span>{before}<input className={st} value={val[i] || ""} disabled={checked} onChange={e => setVal({ ...val, [i]: e.target.value })} />{after}</div>
        {checked && st === "bad" && <div className="key">✓ {ans}</div>}</div></div>;
    })}
    <CheckBar checked={checked} score={score} total={items.length} onCheck={() => setChecked(true)} onReset={() => { setChecked(false); setVal({}); }} />
  </>;
}

export function Translate({ items }: { items: [string, string][] }) {
  const [shown, setShown] = useState(false);
  return <>
    {items.map(([ru, en], i) => <div className="tr" key={i}><span className="nn">{i + 1}</span><div><p>{ru}</p><textarea rows={2} />{shown && <div className="key">✓ {en}</div>}</div></div>)}
    <div className="checkbar"><button className="big" onClick={() => setShown(!shown)}>{shown ? "Hide model answers" : "Show model answers"}</button></div>
  </>;
}

export default function ExerciseView({ e, n }: { e: Exercise; n: number }) {
  return <div className="exb"><Head n={n} title={e.title} instr={e.instr} />
    {(e.type === "collocation" || e.type === "choose") && <Pick items={e.items} kind={e.type} />}
    {e.type === "transform" && <Transform items={e.items} />}
    {e.type === "translate" && <Translate items={e.items} />}
  </div>;
}

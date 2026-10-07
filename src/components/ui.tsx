import { useEffect, useState } from "react";
import { Img, Rich } from "./text";

export const Banner = ({ kick, title, lede, pics = [] }: { kick: string; title: string; lede?: string; pics?: string[] }) => (
  <header className="bn">
    <div className="bn-t"><div className="bn-k">{kick}</div><h2>{title}</h2>{lede && <p>{lede}</p>}</div>
    <div className="bn-p">{pics.map(p => <Img key={p} name={p} className="bn-im" />)}</div>
  </header>
);

export const Fipi = ({ items }: { items: [string, string][] }) => (
  <div className="fipi">
    <div className="fipi-h"><Img name="warning" className="fp-ic" /><span>Watch out</span><em>FIPI report · EGE 2026</em></div>
    {items.map(([k, t], i) => <Rich key={i} as="div" className={`fp ${k}`} html={t} />)}
  </div>
);

export function Timer({ seconds, label }: { seconds: number; label: string }) {
  const [left, setLeft] = useState(seconds);
  const [run, setRun] = useState(false);
  useEffect(() => {
    if (!run) return;
    if (left <= 0) { setRun(false); return; }
    const id = setTimeout(() => setLeft(l => l - 1), 1000);
    return () => clearTimeout(id);
  }, [run, left]);
  return (
    <div className={`timer${left === 0 ? " done" : ""}`}>
      <span className="timer-l">{label}</span><b>{Math.floor(left / 60)}:{String(left % 60).padStart(2, "0")}</b>
      <button onClick={() => setRun(r => !r)}>{run ? "Pause" : "Start"}</button>
      <button onClick={() => { setRun(false); setLeft(seconds); }}>Reset</button>
    </div>
  );
}

/** EGE word count: every token separated by spaces counts; 25%, can't, good-looking = one word */
export const countWords = (t: string) => (t.trim() ? t.trim().split(/\s+/).length : 0);
export function WordStatus({ n, min, max, ok }: { n: number; min: number; max: number; ok: [number, number] }) {
  const st = n === 0 ? "" : n < min ? `under ${min} words: the answer gets 0` : n > max ? `over ${max}: only the first ${ok[1]} words are checked` : n < ok[0] || n > ok[1] ? "within the ±10% tolerance" : "word count OK";
  return <div className="wc-b"><b>{n}</b> words · target {ok[0]}–{ok[1]} · <span>{st}</span></div>;
}

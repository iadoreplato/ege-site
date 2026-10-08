import { useEffect, useState } from "react";
import { Img, Text } from "./text";
import { RichText } from "../types";
import { rabbitSay } from "./Rabbit";

export const Banner = ({ kick, title, lede, pics = [] }: { kick: string; title: string; lede?: string; pics?: string[] }) => (
  <header className="page-banner">
    <div className="page-banner__text"><div className="page-banner__kicker">{kick}</div><h2 className="page-banner__title">{title}</h2>{lede && <p className="page-banner__lead">{lede}</p>}</div>
    <div className="page-banner__pictures">{pics.map(p => <Img key={p} name={p} className="page-banner__picture" />)}</div>
  </header>
);

/** Typical mistakes from the FIPI report; data marks each line "no" (mistake) or "yes" (correct) */
export const Fipi = ({ items }: { items: [string, RichText][] }) => (
  <div className="exam-warnings">
    <div className="exam-warnings__header"><Img name="warning" className="exam-warnings__icon" /><span className="exam-warnings__title">Watch out</span><em className="exam-warnings__source">FIPI report · EGE 2026</em></div>
    {items.map(([k, t], i) => <Text key={i} as="div" className={`exam-warnings__item exam-warnings__item--${k === "yes" ? "correct" : "mistake"}`} value={t} />)}
  </div>
);

export function Timer({ seconds, label }: { seconds: number; label: string }) {
  const [left, setLeft] = useState(seconds);
  const [running, setRunning] = useState(false);
  useEffect(() => {
    if (!running) return;
    if (left <= 0) { setRunning(false); rabbitSay("surprised", "Time's up!", "How did it go?"); return; }
    const id = setTimeout(() => setLeft(l => l - 1), 1000);
    return () => clearTimeout(id);
  }, [running, left]);
  return (
    <div className={`timer${left === 0 ? " timer--finished" : ""}`}>
      <span className="timer__label">{label}</span><b className="timer__time">{Math.floor(left / 60)}:{String(left % 60).padStart(2, "0")}</b>
      <button className="timer__button" onClick={() => setRunning(r => !r)}>{running ? "Pause" : "Start"}</button>
      <button className="timer__button" onClick={() => { setRunning(false); setLeft(seconds); }}>Reset</button>
    </div>
  );
}

/** EGE word count: every token separated by spaces counts; 25%, can't, good-looking = one word */
export const countWords = (t: string) => (t.trim() ? t.trim().split(/\s+/).length : 0);
export function WordStatus({ n, min, max, ok }: { n: number; min: number; max: number; ok: [number, number] }) {
  const status = n === 0 ? "" : n < min ? `under ${min} words: the answer gets 0` : n > max ? `over ${max}: only the first ${ok[1]} words are checked` : n < ok[0] || n > ok[1] ? "within the ±10% tolerance" : "word count OK";
  return <div className="word-count"><b className="word-count__number">{n}</b> words · target {ok[0]}–{ok[1]} · <span className="word-count__status">{status}</span></div>;
}

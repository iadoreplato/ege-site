/* ОБЩИЕ ДЕТАЛИ СТРАНИЦ: баннер вверху страницы, блок «Обратите внимание» из отчёта ФИПИ,
   таймер и счётчик слов для письменных заданий. */
import { useEffect, useState } from "react";
import { Img, Text } from "./text";
import { RichText } from "../types";
import { rabbitSay } from "./Rabbit";
import { play } from "../sound";

/** Баннер вверху страницы: kick — маленькая надпись над заголовком, title — заголовок, lede — подзаголовок, pics — картинки справа */
export const Banner = ({ kick, title, lede, pics = [] }: { kick: string; title: string; lede?: string; pics?: string[] }) => (
  <header className="page-banner">
    <div className="page-banner__text"><div className="page-banner__kicker">{kick}</div><h2 className="page-banner__title">{title}</h2>{lede && <p className="page-banner__lead">{lede}</p>}</div>
    <div className="page-banner__pictures">{pics.map(p => <Img key={p} name={p} className="page-banner__picture" />)}</div>
  </header>
);

/** Typical mistakes from the FIPI report; data marks each line "no" (mistake) or "yes" (correct)
    Блок «Обратите внимание»: типичные ошибки из отчёта ФИПИ. Каждая строка — ["no" или "yes", текст]: no — ошибка, yes — как надо */
export const Fipi = ({ items }: { items: [string, RichText][] }) => (
  <div className="exam-warnings">
    <div className="exam-warnings__header"><Img name="warning" className="exam-warnings__icon" /><span className="exam-warnings__title">Обратите внимание</span><em className="exam-warnings__source">Отчёт ФИПИ · ЕГЭ 2026</em></div>
    {items.map(([k, t], i) => <Text key={i} as="div" className={`exam-warnings__item exam-warnings__item--${k === "yes" ? "correct" : "mistake"}`} value={t} />)}
  </div>
);

/** Таймер обратного отсчёта: seconds — сколько секунд, label — подпись. Кнопки Start/Pause и Reset (таймер есть только в юнитах и вариантах — они на английском).
    Когда время вышло, кролик говорит «Time's up!» */
export function Timer({ seconds, label }: { seconds: number; label: string }) {
  const [left, setLeft] = useState(seconds);       // сколько секунд осталось
  const [running, setRunning] = useState(false);   // идёт ли отсчёт
  // каждую секунду уменьшаем left на 1; эффект перезапускается при каждом изменении left
  useEffect(() => {
    if (!running) return;
    if (left <= 0) { setRunning(false); play("bell"); rabbitSay("surprised", "Time's up!", "How did it go?"); return; }
    const id = setTimeout(() => setLeft(l => l - 1), 1000);
    return () => clearTimeout(id);
  }, [running, left]);
  // время показывается как минуты:секунды, секунды всегда двумя цифрами (1:05)
  return (
    <div className={`timer${left === 0 ? " timer--finished" : ""}`}>
      <span className="timer__label">{label}</span><b className="timer__time">{Math.floor(left / 60)}:{String(left % 60).padStart(2, "0")}</b>
      <button className="timer__button" onClick={() => setRunning(r => !r)}>{running ? "Pause" : "Start"}</button>
      <button className="timer__button" onClick={() => { setRunning(false); setLeft(seconds); }}>Reset</button>
    </div>
  );
}

/** EGE word count: every token separated by spaces counts; 25%, can't, good-looking = one word
    Подсчёт слов по правилам ЕГЭ: словом считается всё, что отделено пробелами */
export const countWords = (t: string) => (t.trim() ? t.trim().split(/\s+/).length : 0);
/** Строка под полем письма/эссе: «N words · target 100–140 · статус».
    min — меньше этого 0 баллов; max — больше этого проверяется только начало; ok — целевой диапазон из задания */
export function WordStatus({ n, min, max, ok }: { n: number; min: number; max: number; ok: [number, number] }) {
  const status = n === 0 ? "" : n < min ? `under ${min} words: the answer gets 0` : n > max ? `over ${max}: only the first ${ok[1]} words are checked` : n < ok[0] || n > ok[1] ? "within the ±10% tolerance" : "word count OK";
  return <div className="word-count"><b className="word-count__number">{n}</b> words · target {ok[0]}–{ok[1]} · <span className="word-count__status">{status}</span></div>;
}

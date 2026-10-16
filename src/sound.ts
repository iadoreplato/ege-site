/* ЗВУКИ И ВИБРАЦИЯ. Звуки не файлы: короткие ноты синтезируются в браузере (Web Audio), поэтому сайт не тяжелеет.
   Вибрация работает только на телефонах Android (iPhone её сайтам не даёт) — там просто тишина.
   Кнопка в шапке выключает и звук, и вибрацию; выбор хранится только в этом браузере (ячейка ege:sound).
   ЧТОБЫ ДОБАВИТЬ ЗВУК: новая строка в SOUNDS и вызов play("имя") в нужном месте. */
import { useEffect, useState } from "react";

const KEY = "ege:sound";
export const soundOn = () => { try { return localStorage.getItem(KEY) !== "off"; } catch { return true; } };
export function setSound(on: boolean) {
  try { on ? localStorage.removeItem(KEY) : localStorage.setItem(KEY, "off"); } catch { /* private mode */ }
  window.dispatchEvent(new Event("sound-change"));
  if (on) play("pop");
}
/** Хук для кнопки в шапке: включён ли звук; перерисовывается после переключения */
export function useSound() {
  const [on, setOn] = useState(soundOn);
  useEffect(() => { const f = () => setOn(soundOn()); window.addEventListener("sound-change", f); return () => window.removeEventListener("sound-change", f); }, []);
  return on;
}

/** Нота: частота (Гц), через сколько секунд начать, длительность, форма волны, громкость; to — плавно уйти к этой частоте */
type Note = { f: number; at?: number; len?: number; wave?: OscillatorType; vol?: number; to?: number };
/** Звуки сайта: ноты и рисунок вибрации (мс: вибрация, пауза, вибрация…) */
const SOUNDS = {
  perfect: { notes: [523, 659, 784, 1047].map((f, i) => ({ f, at: i * .07, len: .35 })), buzz: [20, 40, 20, 40, 40] },  // 90 % и больше: аккорд вверх
  good: { notes: [{ f: 784, len: .25 }, { f: 1047, at: .08, len: .35 }], buzz: [25] },                                   // 60–89 %: два звонких тона
  soft: { notes: [{ f: 440, len: .3, vol: .08 }, { f: 392, at: .12, len: .4, vol: .08 }], buzz: [] },                    // ниже 60 %: мягко, не «ошибка»
  pop: { notes: [{ f: 660, to: 990, len: .12, wave: "sine" }], buzz: [12] },                                              // пара найдена, «Done»
  miss: { notes: [{ f: 220, to: 180, len: .15, vol: .07 }], buzz: [35] },                                                // не та пара
  flip: { notes: [{ f: 1200, to: 700, len: .07, wave: "sine", vol: .05 }], buzz: [] },                                   // карточка перевернулась
  bell: { notes: [{ f: 880, len: 1.2, wave: "sine" }, { f: 880, at: .45, len: 1.2, wave: "sine" }], buzz: [200, 100, 200] }, // время вышло
} satisfies Record<string, { notes: Note[]; buzz: number[] }>;
export type SoundName = keyof typeof SOUNDS;

let ctx: AudioContext | null = null;
/** Проиграть звук и, где можно, коротко вибрировать. Ничего не делает, если звук выключен или браузер не умеет */
export function play(name: SoundName) {
  if (!soundOn()) return;
  const s = SOUNDS[name];
  try { if (s.buzz.length) navigator.vibrate?.(s.buzz); } catch { /* no vibration */ }
  try {
    ctx ??= new AudioContext();
    if (ctx.state === "suspended") void ctx.resume();
    const t0 = ctx.currentTime + .01;
    for (const n of s.notes as Note[]) {
      const o = ctx.createOscillator(), g = ctx.createGain(), t = t0 + (n.at ?? 0), len = n.len ?? .2;
      o.type = n.wave ?? "triangle";
      o.frequency.setValueAtTime(n.f, t);
      if (n.to) o.frequency.exponentialRampToValueAtTime(n.to, t + len);
      // мягкое начало и затухание, чтобы не было щелчка
      g.gain.setValueAtTime(0, t);
      g.gain.linearRampToValueAtTime(n.vol ?? .12, t + .01);
      g.gain.exponentialRampToValueAtTime(.0001, t + len);
      o.connect(g).connect(ctx.destination);
      o.start(t); o.stop(t + len + .05);
    }
  } catch { /* no Web Audio */ }
}

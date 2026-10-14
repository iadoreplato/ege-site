/* АУДИОПЛЕЕР для заданий на аудирование: ▶/❚❚, ползунок перемотки, −10 s / +10 s, время «0:00 / 6:56».
   Паузы и два прослушивания уже есть в самой записи, поэтому ни счётчика повторов, ни выбора скорости нет. */
import { useEffect, useRef, useState } from "react";

/** 75 → "1:15" */
const clock = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;

/** src — адрес mp3; seconds — длительность из public/audio/manifest.json; onMissing — файла нет (карточку скрываем) */
export default function Player({ src, seconds, onMissing }: { src: string; seconds: number; onMissing: () => void }) {
  const audio = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [time, setTime] = useState(0);
  // drag — куда сейчас тянут ползунок. Пока палец не отпущен, меняется только цифра, запись не перематывается
  const [drag, setDrag] = useState<number | null>(null);
  useEffect(() => () => audio.current?.pause(), []); // ушли со страницы — звук выключается

  /** Перемотать на t секунд (не дальше начала и конца) */
  const seek = (t: number) => { if (audio.current) audio.current.currentTime = Math.min(Math.max(t, 0), seconds); setDrag(null); };
  const toggle = () => { const a = audio.current; if (a) a.paused ? a.play().catch(() => {}) : a.pause(); };
  const shown = drag ?? time;

  return <div className="player">
    {/* preload="none": запись скачивается только после ▶, чтобы не тратить мобильный интернет */}
    <audio ref={audio} src={src} preload="none" onPlay={() => setPlaying(true)} onPause={() => setPlaying(false)}
      onTimeUpdate={e => setTime(e.currentTarget.currentTime)} onError={onMissing} />
    <button className="player__play" onClick={toggle} aria-label={playing ? "Pause" : "Play"}>{playing ? "❚❚" : "▶"}</button>
    <button className="player__skip" onClick={() => seek(time - 10)} aria-label="Back 10 seconds">−10 s</button>
    <input className="player__bar" type="range" min={0} max={seconds} step={1} value={shown} aria-label="Position"
      onChange={e => setDrag(Number(e.target.value))}
      onPointerUp={e => seek(Number(e.currentTarget.value))} onKeyUp={e => seek(Number(e.currentTarget.value))} />
    <button className="player__skip" onClick={() => seek(time + 10)} aria-label="Forward 10 seconds">+10 s</button>
    <span className="player__time">{clock(shown)} / {clock(seconds)}</span>
  </div>;
}

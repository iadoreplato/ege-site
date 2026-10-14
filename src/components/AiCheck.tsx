/* ИИ-ПРОВЕРКА ОТКРЫТЫХ ЗАДАНИЙ (37, 38 и расшифровки 3–4) через YandexGPT.
   Кнопка «Check with AI» отправляет ответ серверной функции /api/check (netlify/functions/check.mjs),
   затем каждые 3 секунды спрашивает, готова ли проверка, и показывает баллы, ошибки, исправленную версию и советы.
   Работает только на сайте в Netlify: на GitHub Pages серверной функции нет. */
import { useEffect, useRef, useState } from "react";
import { cheer } from "./Rabbit";

/** Балл по одному критерию: id (K1…), название, балл, максимум, комментарий */
type Criterion = { id: string; name: string; score: number; max: number; comment: string };
/** Одна ошибка: как было (wrong), как надо (right), тип (grammar, vocabulary…), объяснение */
type Mistake = { wrong: string; right: string; type: string; explanation: string };
/** What the serverless function returns when the check is ready (netlify/functions/check.mjs)
    Результат проверки: итог, максимум, критерии, ошибки, исправленный текст, советы, note — пометка (например, про обрезку длинного текста) */
type Result = { total: number; max: number; criteria: Criterion[]; errors: Mistake[]; corrected: string; tips: string[]; note?: string };

const POLL_MS = 3000, POLL_LIMIT = 60; // ask every 3 seconds, give up after 3 minutes · спрашивать каждые 3 с, не дольше 3 минут
/** Пауза на ms миллисекунд */
const wait = (ms: number) => new Promise(r => setTimeout(r, ms));

/** Reads the function's reply; an error reply carries {error: "..."}
    Читает ответ сервера. Если сервер вернул ошибку — выбрасывает её текст, и он показывается под кнопкой.
    404 — функции нет (сайт открыт не на Netlify) */
async function ask(r: Response) {
  const data = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(r.status === 404 ? "The checking service is not connected yet (see docs/GUIDE.md: AI check)." : data.error || `Error ${r.status}`);
  return data;
}

/** Sends an open answer to the serverless function /api/check (YandexGPT, see netlify/functions/check.mjs):
    starts the check, then asks every few seconds whether it is ready
    task — какое задание ("37", "38", "S3" — задание 3, "S4" — задание 4); prompt — описание задания для ИИ;
    answer — текст ученика. res — результат, busy — идёт проверка, err — текст ошибки */
export default function AiCheck({ task, prompt, answer }: { task: "37" | "38" | "S3" | "S4"; prompt: string; answer: string }) {
  const [res, setRes] = useState<Result | null>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const alive = useRef(true); // false after the student leaves the page: stop asking
  useEffect(() => () => { alive.current = false; }, []);

  /** Шаг 1: POST — начать проверку (сервер вернёт id проверки или сразу готовый результат, если текст слишком короткий).
      Шаг 2: GET с этим id каждые 3 секунды, пока не придёт done: true. Потом показать результат и позвать кролика */
  async function run() {
    setBusy(true); setErr(""); setRes(null);
    try {
      let data = await ask(await fetch("/api/check", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ task, prompt, answer }) }));
      const query = new URLSearchParams({ id: data.id ?? "", task, note: data.note ?? "" });
      for (let i = 0; !data.done; i++) {
        if (i >= POLL_LIMIT) throw new Error("The check is taking too long. Try again later.");
        await wait(POLL_MS);
        if (!alive.current) return;
        data = await ask(await fetch(`/api/check?${query}`));
      }
      if (!alive.current) return;
      setRes(data.result);
      cheer(data.result.total, data.result.max, true);
    } catch (e: any) { if (alive.current) setErr(e.message); } finally { if (alive.current) setBusy(false); }
  }

  return (
    <div className="ai-check">
      <button className="button button--primary" disabled={busy || !answer.trim()} onClick={run}>{busy ? "Checking… (up to a minute)" : "Check with AI"}</button>
      {err && <p className="error-text">{err}</p>}
      {res && <div className="ai-check__result">
        <div className="ai-check__total">Estimated score: <b className="ai-check__score">{res.total}</b> / {res.max}</div>
        {res.note && <p className="note">{res.note}</p>}
        {res.criteria.map(c => <div className="ai-check__criterion" key={c.id}><b>{c.id} {c.name}: {c.score}/{c.max}</b><p className="ai-check__comment">{c.comment}</p></div>)}
        {res.errors.length > 0 && <div className="ai-check__criterion"><b>Mistakes</b><ul className="ai-check__corrections">{res.errors.map((x, i) =>
          <li className="ai-check__mistake" key={i}><s className="ai-check__wrong">{x.wrong}</s> → <b className="ai-check__right">{x.right}</b>{x.type && <span className="ai-check__type">{x.type}</span>}{x.explanation && <span className="ai-check__explanation">{x.explanation}</span>}</li>)}</ul></div>}
        {res.corrected && <details className="ai-check__criterion"><summary className="ai-check__summary">Corrected version</summary><p className="ai-check__corrected">{res.corrected}</p></details>}
        {res.tips.length > 0 && <div className="ai-check__criterion"><b>What to work on</b><ul className="ai-check__corrections">{res.tips.map((x, i) => <li key={i}>{x}</li>)}</ul></div>}
        <p className="note">This is an automatic estimate based on the FIPI criteria, not an official mark.</p>
      </div>}
    </div>
  );
}

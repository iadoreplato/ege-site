/* ЗАДАНИЕ НА АУДИРОВАНИЕ (вкладка Listening). Один компонент на три формата:
   task 1 — говорящие A–F и утверждения 1–7 (выпадающие списки); task 2 — утверждения A–G, True / False / Not stated;
   task 3 — вопросы 3–9 по три варианта. Данные — src/content/listening/<module>-u<N>.json, звук — public/audio/<id>.mp3.
   Текст записи (script) показывается только после проверки, блок Discuss виден всегда. Общие части — Task.tsx. */
import { useEffect, useState } from "react";
import { AudioInfo, ListeningTask } from "../types";
import Player from "./Player";
import { AnswerBar, Choices, Discuss, Select, TaskCard, useAnswers } from "./Task";

/* Все задания из папки listening, кроме voices.json (это настройки голосов для озвучки, на сайте не нужны) */
const files = import.meta.glob<ListeningTask>(["../content/listening/*.json", "!../content/listening/voices.json"], { eager: true, import: "default" });
const TASKS = Object.values(files);
/** Задание для юнита: module — id модуля ("sport"), unit — номер юнита */
export const listeningFor = (module: string, unit: number) => TASKS.find(t => t.module === module && t.unit === unit);
/** Все задания модуля или вариантов ("variant") по порядку номеров */
export const listeningOf = (module: string) => TASKS.filter(t => t.module === module).sort((a, b) => a.task - b.task);

/* manifest.json читается один раз за визит. Нет файла или ошибка сети — пустой список, карточки не показываются */
let manifest: Promise<Record<string, AudioInfo>> | undefined;
export const getManifest = (): Promise<Record<string, AudioInfo>> => manifest ??= fetch(`${import.meta.env.BASE_URL}audio/manifest.json`).then(r => r.ok ? r.json() : {}).catch(() => ({}));
/** Запись задания id из manifest.json: undefined — ещё читаем, null — записи нет или она заглушка (mock: true) */
export function useAudio(id?: string) {
  const [audio, setAudio] = useState<AudioInfo | null>();
  useEffect(() => { if (!id) return; let on = true; getManifest().then(m => on && setAudio(m[id]?.mock === false ? m[id] : null)); return () => { on = false; }; }, [id]);
  return id ? audio : null;
}

const LETTERS = "ABCDEFG";
const TF = ["True", "False", "Not stated"]; // task 2: ответ 1, 2, 3

/** Карточка задания t с записью audio. Если файл не открылся, карточка исчезает.
    where и n — для заголовка («Variant 1 · Listening · Task 2»); по умолчанию «Unit N · … · Task 1».
    discuss — показывать ли блок Discuss (в учебнике да, в вариантах ЕГЭ нет) */
export default function ListeningCard({ t, audio, where = `Unit ${t.unit}`, n = 1, discuss = true }: { t: ListeningTask; audio: AudioInfo; where?: string; n?: number; discuss?: boolean }) {
  const a = useAnswers("listening", String(t.task), where, t.id, t.key);
  const [missing, setMissing] = useState(false);
  if (missing) return null;
  // подписи строк: A–F (task 1), A–G (task 2), 3–9 (task 3)
  const labels = t.key.map((_, i) => t.task === 3 ? String(i + 3) : LETTERS[i]);
  const lines = t.script.filter(s => s.who !== "Announcer"); // в расшифровке без реплик диктора

  return <TaskCard where={where} n={n} section="listening" type={String(t.task)} title={t.title} column={t.task === 3}>
    <Player src={`${import.meta.env.BASE_URL}audio/${audio.file}`} seconds={audio.seconds} onMissing={() => setMissing(true)} />
    {t.task === 1 && <>
      <ol className="task-card__options">{t.options.map((o, i) => <li key={i}>{o}</li>)}</ol>
      {t.key.map((_, i) => <div key={i} className={a.row(i)}><span className="task-card__label">Speaker {LETTERS[i]}</span><Select a={a} i={i} n={t.options.length} label={`Speaker ${LETTERS[i]}`} /></div>)}
    </>}
    {t.task === 2 && t.statements.map((s, i) => <div key={i} className={a.row(i)}><span className="task-card__label">{labels[i]}</span><p className="task-card__text">{s}</p><Choices a={a} i={i} name={t.id} options={TF} /></div>)}
    {t.task === 3 && t.questions.map((q, i) => <div key={i} className={a.row(i)}><span className="task-card__label">{labels[i]}</span><p className="task-card__text">{q.q}</p><Choices a={a} i={i} name={t.id} options={q.options} numbered /></div>)}
    <AnswerBar a={a} labels={labels} />
    {/* имя говорящего — в начале каждой его реплики (подряд у одного говорящего не повторяется) */}
    {a.checked && <details className="listening__transcript"><summary>Transcript</summary>
      {lines.map((s, i) => <p key={i}>{s.who !== lines[i - 1]?.who && <b>{s.who}: </b>}{s.text}</p>)}
    </details>}
    {discuss && <Discuss questions={t.discuss} />}
  </TaskCard>;
}

/* ПОВТОРЕНИЕ:
   - Revision — итоговое повторение модуля в формате ЕГЭ: задание 11, 19–24, 25–29, 30–36, перефраз, перевод;
   - Review — мини-повторение после юнитов: тексты 30–36 + перефраз.
   Данные — поля revision и reviews модуля (docs/CODE.md, 3.5 и 3.6). Формат ключей строгий: «A — 2 · B — 4», «30 — 3». */
import { useState } from "react";
import { Topic } from "../types";
import { reviewTitle } from "../route";
import { Banner } from "./ui";
import { CheckBar, Transform, Translate } from "./Exercises";
import { GappedText } from "./Reading";
import { Cloze, Gaps } from "./UseOfEnglish";
import { sectionById } from "../sections";

/** Задание 11: текст с пропусками (общий компонент GappedText из Reading.tsx, его же показывает вкладка Reading).
    key — ключ из строки "A — 2 · B — 4 · …" → цифры по порядку пропусков [2, 4, …]; ans — ответы ученика.
    Формулировка — из sections.json (раздел reading, тип 11) */
function Task11({ r }: { r: any }) {
  const byLetter = Object.fromEntries([...r.key.matchAll(/([A-F]) — (\d)/g)].map(m => [m[1], Number(m[2])]));
  const keys = "ABCDEF".split("").map(c => byLetter[c]);
  const [ans, setAns] = useState<number[]>([]);
  const [checked, setChecked] = useState(false);
  const score = keys.filter((k, i) => ans[i] === k).length;
  return <div className="exercise">
    <p className="russian-instruction">{sectionById("reading").ru!["11"]}</p>
    <GappedText title={r.title} text={r.text} parts={r.parts} keys={keys} ans={ans} checked={checked} reveal={checked} pick={(i, v) => { const a = [...ans]; a[i] = v; setAns(a); }} />
    <CheckBar big checked={checked} score={score} total={6} onCheck={() => setChecked(true)} onReset={() => { setChecked(false); setAns([]); }} />
  </div>;
}

/** Mini-review after every two units (topic.reviews): Tasks 30–36 format + harder paraphrase
    Мини-повторение i: каждый текст cloze + перефраз. Ключ — массив номеров вариантов */
export function Review({ topic, i }: { topic: Topic; i: number }) {
  const r = topic.reviews![i];
  return <section className="page">
    <Banner kick={topic.title} title={reviewTitle(topic, i)} lede="Exam-style multiple choice and paraphrase on the vocabulary of these units" pics={["check_mark_button", "memo"]} />
    {r.cloze.map((c, k) => <div key={k}><h3 className="section-heading">Vocabulary · Tasks 30–36 · {c.title}</h3>
      <Cloze text={c.text} opts={c.opts} answers={c.key} /></div>)}
    <h3 className="section-heading">Paraphrase: key word transformation</h3><div className="exercise"><Transform big items={r.transform} /></div>
  </section>;
}

/** Итоговый Revision модуля. k — ключи из revision.keys: { "19–24": "ответ · ответ…", "25–29": …, "30–36": … };
    answers — для 30–36 из строки "30 — 3 overcome · 31 — 2 take" берём номер варианта по порядку пропусков.
    Заголовок — первая часть названия модуля (до «:» и « &»): «Sport & Healthy Lifestyle» → «Sport» */
export default function Revision({ topic }: { topic: Topic }) {
  const R = topic.revision;
  const k = Object.fromEntries(R.keys as [string, string][]);
  const answers = k["30–36"].split(" · ").map((x: string) => Number(x.match(/^\d+ — (\d)/)![1]));
  return <section className="page">
    <Banner kick="Revision" title={`Revision · ${topic.title.split(":")[0].split(" &")[0]}`} lede="Exam-format tasks on the whole module" pics={["check_mark_button", "memo"]} />
    <h3 className="section-heading">Reading · Task 11</h3><Task11 r={R.reading11} />
    <h3 className="section-heading">Grammar · Tasks 19–24</h3><Gaps rows={R.g1} keys={k["19–24"].split(" · ")} type="19" />
    <h3 className="section-heading">Word formation · Tasks 25–29</h3><Gaps rows={R.g2} keys={k["25–29"].split(" · ")} type="25" />
    <h3 className="section-heading">Vocabulary · Tasks 30–36</h3><Cloze text={R.cloze} opts={R.opts} answers={answers} />
    <h3 className="section-heading">Paraphrase: key word transformation</h3><div className="exercise"><Transform big items={R.transform} /></div>
    <h3 className="section-heading">Translation</h3><div className="exercise"><Translate items={R.translate} /></div>
  </section>;
}

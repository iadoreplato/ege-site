import { useState } from "react";
import { DropdownMenu } from "radix-ui";
import { Topic } from "../types";
import { reviewTitle } from "../route";
import { isCorrect, Text } from "./text";
import { Banner } from "./ui";
import { CheckBar, Transform, Translate } from "./Exercises";

const RU = {
  t11: "Прочитайте текст и заполните пропуски A–F частями предложений, обозначенными цифрами 1–7. Одна из частей в списке 1–7 лишняя. Занесите цифры, обозначающие соответствующие части предложений, в таблицу.",
  t19: "Прочитайте приведённый ниже текст. Преобразуйте, если необходимо, слова, напечатанные заглавными буквами в конце строк, обозначенных номерами 19–24, так, чтобы они грамматически соответствовали содержанию текста. Заполните пропуски полученными словами. Каждый пропуск соответствует отдельному заданию из группы 19–24.",
  t25: "Прочитайте приведённый ниже текст. Образуйте от слов, напечатанных заглавными буквами в конце строк, обозначенных номерами 25–29, однокоренные слова, так, чтобы они грамматически и лексически соответствовали содержанию текста. Заполните пропуски полученными словами. Каждый пропуск соответствует отдельному заданию из группы 25–29.",
  t30: "Прочитайте текст с пропусками, обозначенными номерами 30–36. Эти номера соответствуют заданиям 30–36, в которых представлены возможные варианты ответов. Запишите в поле ответа цифру 1, 2, 3 или 4, соответствующую выбранному Вами варианту ответа.",
};

/** Answer 1–7 for Task 11: a drop-down in the site's own style instead of the browser's list */
function NumberChoice({ value, disabled, state, onChange }: { value: string; disabled: boolean; state: string; onChange: (v: string) => void }) {
  return <DropdownMenu.Root modal={false}>
    <DropdownMenu.Trigger className={`number-choice${state ? ` number-choice--${state}` : ""}`} disabled={disabled}>{value || "—"}<span className="number-choice__arrow" aria-hidden="true">▾</span></DropdownMenu.Trigger>
    <DropdownMenu.Portal><DropdownMenu.Content className="dropdown dropdown--numbers" sideOffset={6}>
      {["1", "2", "3", "4", "5", "6", "7"].map(n => <DropdownMenu.Item key={n} className="dropdown__link" onSelect={() => onChange(n)}>{n}</DropdownMenu.Item>)}
    </DropdownMenu.Content></DropdownMenu.Portal>
  </DropdownMenu.Root>;
}

function Task11({ r }: { r: any }) {
  const key = Object.fromEntries([...r.key.matchAll(/([A-F]) — (\d)/g)].map(m => [m[1], m[2]]));
  const [val, setVal] = useState<Record<string, string>>({});
  const [checked, setChecked] = useState(false);
  const score = "ABCDEF".split("").filter(c => val[c] === key[c]).length;
  const parts = r.text.split(/\{([A-F])\}/);
  return <div className="exercise">
    <p className="russian-instruction">{RU.t11}</p>
    <div className="sentence-gaps"><div className="sentence-gaps__text"><b className="sentence-gaps__title">{r.title}</b><br />{parts.map((p: string, i: number) => i % 2 === 0 ? <Text key={i} value={p} /> :
      <span key={i} className="sentence-gaps__gap"><b className="sentence-gaps__letter">{p}</b><NumberChoice value={val[p] || ""} disabled={checked} state={checked ? (val[p] === key[p] ? "correct" : "wrong") : ""} onChange={v => setVal({ ...val, [p]: v })} />{checked && val[p] !== key[p] && <em className="exercise__answer exercise__answer--inline">✓ {key[p]}</em>}</span>)}</div>
      <div className="sentence-gaps__parts">{r.parts.map((p: string, i: number) => <div className="sentence-gaps__part" key={i}><span className="exercise__item-number">{i + 1}.</span>{p}</div>)}</div></div>
    <CheckBar big checked={checked} score={score} total={6} onCheck={() => setChecked(true)} onReset={() => { setChecked(false); setVal({}); }} />
  </div>;
}

function Gaps({ rows, keys, instr }: { rows: [number, string, string, string][]; keys: string[]; instr: string }) {
  const [val, setVal] = useState<Record<number, string>>({});
  const [checked, setChecked] = useState(false);
  const score = rows.filter(([n], i) => isCorrect(val[n] || "", keys[i])).length;
  return <div className="exercise"><p className="russian-instruction">{instr}</p><div className="word-gaps">{rows.map(([n, a, b, w], i) => {
    const ok = isCorrect(val[n] || "", keys[i]), state = checked ? (ok ? " answer-input--correct" : " answer-input--wrong") : "";
    return <div className="word-gaps__item" key={n}><span className="exercise__item-number">{n}</span><span className="word-gaps__sentence">{a} <input className={`answer-input${state}`} value={val[n] || ""} disabled={checked} onChange={e => setVal({ ...val, [n]: e.target.value })} /> {b}
      {checked && !ok && <em className="exercise__answer exercise__answer--inline">✓ {keys[i]}</em>}</span><span className="word-gaps__word">{w}</span></div>;
  })}</div><CheckBar big checked={checked} score={score} total={rows.length} onCheck={() => setChecked(true)} onReset={() => { setChecked(false); setVal({}); }} /></div>;
}

function Cloze({ text, opts, key3 }: { text: string; opts: any[]; key3: Record<string, string> }) {
  const [val, setVal] = useState<Record<string, string>>({});
  const [checked, setChecked] = useState(false);
  const score = opts.filter(([n]) => val[n] === key3[n]).length;
  return <div className="exercise"><p className="russian-instruction">{RU.t30}</p><div className="cloze-text">{text.split(/\{(\d+)\}/).map((part, i) => i % 2 === 0 ? <Text key={i} value={part} /> :
      <span key={i}><b className="cloze-text__number">{part}</b><span className="gap-line" /></span>)}</div>
    {opts.map(([n, ...ws]) => <div className="exercise__item exercise__item--collocation" key={n}><span className="exercise__item-number">{n}</span><div className="exercise__options">{ws.map((w: string, i: number) => {
      const v = String(i + 1), chosen = val[n] === v;
      const state = checked ? (v === key3[n] ? " option--correct" : chosen ? " option--wrong" : "") : chosen ? " option--selected" : "";
      return <button key={i} className={`option${state}`} onClick={() => !checked && setVal({ ...val, [n]: v })}>{i + 1}) {w}</button>;
    })}</div></div>)}
    <CheckBar big checked={checked} score={score} total={opts.length} onCheck={() => setChecked(true)} onReset={() => { setChecked(false); setVal({}); }} /></div>;
}

/** Mini-review after every two units (topic.reviews): Tasks 30–36 format + harder paraphrase */
export function Review({ topic, i }: { topic: Topic; i: number }) {
  const r = topic.reviews![i];
  return <section className="page">
    <Banner kick={topic.title} title={reviewTitle(topic, i)} lede="Exam-style multiple choice and paraphrase on the vocabulary of these units" pics={["check_mark_button", "memo"]} />
    {r.cloze.map((c, k) => <div key={k}><h3 className="section-heading">Vocabulary · Tasks 30–36 · {c.title}</h3>
      <Cloze text={c.text} opts={c.opts} key3={Object.fromEntries(c.opts.map(([n], j) => [n, String(c.key[j])]))} /></div>)}
    <h3 className="section-heading">Paraphrase: key word transformation</h3><div className="exercise"><Transform big items={r.transform} /></div>
  </section>;
}

export default function Revision({ topic }: { topic: Topic }) {
  const R = topic.revision;
  const k = Object.fromEntries(R.keys as [string, string][]);
  const key3 = Object.fromEntries(k["30–36"].split(" · ").map((x: string) => { const m = x.match(/^(\d+) — (\d)/)!; return [m[1], m[2]]; }));
  return <section className="page">
    <Banner kick="Revision" title={`Revision · ${topic.title.split(":")[0].split(" &")[0]}`} lede="Exam-format tasks on the whole module" pics={["check_mark_button", "memo"]} />
    <h3 className="section-heading">Reading · Task 11</h3><Task11 r={R.reading11} />
    <h3 className="section-heading">Grammar · Tasks 19–24</h3><Gaps rows={R.g1} keys={k["19–24"].split(" · ")} instr={RU.t19} />
    <h3 className="section-heading">Word formation · Tasks 25–29</h3><Gaps rows={R.g2} keys={k["25–29"].split(" · ")} instr={RU.t25} />
    <h3 className="section-heading">Vocabulary · Tasks 30–36</h3><Cloze text={R.cloze} opts={R.opts} key3={key3} />
    <h3 className="section-heading">Paraphrase: key word transformation</h3><div className="exercise"><Transform big items={R.transform} /></div>
    <h3 className="section-heading">Translation</h3><div className="exercise"><Translate items={R.translate} /></div>
  </section>;
}

import { useState } from "react";
import { Topic } from "../types";
import { isCorrect } from "./text";
import { Banner } from "./ui";
import { CheckBar, Transform, Translate } from "./Exercises";

const RU = {
  t11: "Прочитайте текст и заполните пропуски A–F частями предложений, обозначенными цифрами 1–7. Одна из частей в списке 1–7 лишняя. Занесите цифры, обозначающие соответствующие части предложений, в таблицу.",
  t19: "Прочитайте приведённый ниже текст. Преобразуйте, если необходимо, слова, напечатанные заглавными буквами в конце строк, обозначенных номерами 19–24, так, чтобы они грамматически соответствовали содержанию текста. Заполните пропуски полученными словами. Каждый пропуск соответствует отдельному заданию из группы 19–24.",
  t25: "Прочитайте приведённый ниже текст. Образуйте от слов, напечатанных заглавными буквами в конце строк, обозначенных номерами 25–29, однокоренные слова, так, чтобы они грамматически и лексически соответствовали содержанию текста. Заполните пропуски полученными словами. Каждый пропуск соответствует отдельному заданию из группы 25–29.",
  t30: "Прочитайте текст с пропусками, обозначенными номерами 30–36. Эти номера соответствуют заданиям 30–36, в которых представлены возможные варианты ответов. Запишите в поле ответа цифру 1, 2, 3 или 4, соответствующую выбранному Вами варианту ответа.",
};

function Task11({ r }: { r: any }) {
  const key = Object.fromEntries([...r.key.matchAll(/([A-F]) — (\d)/g)].map(m => [m[1], m[2]]));
  const [val, setVal] = useState<Record<string, string>>({});
  const [checked, setChecked] = useState(false);
  const score = "ABCDEF".split("").filter(c => val[c] === key[c]).length;
  const parts = r.text.split(/\{([A-F])\}/);
  return <div className="exb">
    <p className="ruinstr">{RU.t11}</p>
    <div className="r11"><div className="r11-t"><b>{r.title}</b><br />{parts.map((p: string, i: number) => i % 2 === 0 ? <span key={i} dangerouslySetInnerHTML={{ __html: p }} /> :
      <span key={i} className="gl-wrap"><b className="gl">{p}</b><select className={checked ? (val[p] === key[p] ? "ok" : "bad") : ""} value={val[p] || ""} disabled={checked} onChange={e => setVal({ ...val, [p]: e.target.value })}>
        <option value="">—</option>{[1, 2, 3, 4, 5, 6, 7].map(n => <option key={n}>{n}</option>)}</select>{checked && val[p] !== key[p] && <em className="key-in">✓ {key[p]}</em>}</span>)}</div>
      <div className="r11-p">{r.parts.map((p: string, i: number) => <div className="p11" key={i}><span className="nn">{i + 1}.</span>{p}</div>)}</div></div>
    <CheckBar checked={checked} score={score} total={6} onCheck={() => setChecked(true)} onReset={() => { setChecked(false); setVal({}); }} />
  </div>;
}

function Gaps({ rows, keys, instr }: { rows: [number, string, string, string][]; keys: string[]; instr: string }) {
  const [val, setVal] = useState<Record<number, string>>({});
  const [checked, setChecked] = useState(false);
  const score = rows.filter(([n], i) => isCorrect(val[n] || "", keys[i])).length;
  return <div className="exb"><p className="ruinstr">{instr}</p><div className="gaps">{rows.map(([n, a, b, w], i) => {
    const st = checked ? (isCorrect(val[n] || "", keys[i]) ? "ok" : "bad") : "";
    return <div className="g" key={n}><span className="nn">{n}</span><span className="gt">{a} <input className={st} value={val[n] || ""} disabled={checked} onChange={e => setVal({ ...val, [n]: e.target.value })} /> {b}
      {checked && st === "bad" && <em className="key-in">✓ {keys[i]}</em>}</span><span className="gw">{w}</span></div>;
  })}</div><CheckBar checked={checked} score={score} total={rows.length} onCheck={() => setChecked(true)} onReset={() => { setChecked(false); setVal({}); }} /></div>;
}

function Cloze({ text, opts, key3 }: { text: string; opts: any[]; key3: Record<string, string> }) {
  const [val, setVal] = useState<Record<string, string>>({});
  const [checked, setChecked] = useState(false);
  const score = opts.filter(([n]) => val[n] === key3[n]).length;
  return <div className="exb"><p className="ruinstr">{RU.t30}</p><div className="cloze" dangerouslySetInnerHTML={{ __html: text }} />
    {opts.map(([n, ...ws]) => <div className="op" key={n}><span className="nn">{n}</span>{ws.map((w: string, i: number) => {
      const v = String(i + 1), chosen = val[n] === v;
      const c = checked ? (v === key3[n] ? "ok" : chosen ? "bad" : "") : chosen ? "sel" : "";
      return <button key={i} className={c} onClick={() => !checked && setVal({ ...val, [n]: v })}>{i + 1}) {w}</button>;
    })}</div>)}
    <CheckBar checked={checked} score={score} total={opts.length} onCheck={() => setChecked(true)} onReset={() => { setChecked(false); setVal({}); }} /></div>;
}

export default function Revision({ topic }: { topic: Topic }) {
  const R = topic.revision;
  const k = Object.fromEntries(R.keys as [string, string][]);
  const key3 = Object.fromEntries(k["30–36"].split(" · ").map((x: string) => { const m = x.match(/^(\d+) — (\d)/)!; return [m[1], m[2]]; }));
  return <section className="page">
    <Banner kick="Revision" title={`Revision · ${topic.title.split(":")[0].split(" &")[0]}`} lede="Exam-format tasks on the whole module" pics={["check_mark_button", "memo"]} />
    <h3 className="sub">Reading · Task 11</h3><Task11 r={R.reading11} />
    <h3 className="sub">Grammar · Tasks 19–24</h3><Gaps rows={R.g1} keys={k["19–24"].split(" · ")} instr={RU.t19} />
    <h3 className="sub">Word formation · Tasks 25–29</h3><Gaps rows={R.g2} keys={k["25–29"].split(" · ")} instr={RU.t25} />
    <h3 className="sub">Vocabulary · Tasks 30–36</h3><Cloze text={R.cloze} opts={R.opts} key3={key3} />
    <h3 className="sub">Paraphrase: key word transformation</h3><div className="exb"><Transform items={R.transform} /></div>
    <h3 className="sub">Translation</h3><div className="exb"><Translate items={R.translate} /></div>
  </section>;
}

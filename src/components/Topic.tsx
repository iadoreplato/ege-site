import { Topic, Unit } from "../types";
import { Img } from "./text";
import { Banner } from "./ui";
import VocabBlock, { Legend } from "./Vocab";
import ExerciseView from "./Exercises";
import SpeechView from "./Speech";

export function TypologyBank({ topic }: { topic: Topic }) {
  return <section className="page">
    <Banner kick="Task 4 · comparison bank" title="Types of activity: pros and cons" lede="Find the basis for comparison first, then choose pros and cons" pics={["handshake", "light_bulb"]} />
    <div className="tbs">{topic.typology.map(([ia, a, ib, b, basis, ap, am, bp, bm, diff]: any) => (
      <div className="tb" key={a}>
        <div className="tb-h"><div className="tb-a"><Img name={ia} className="tb-im" /><b>{a}</b></div><div className="tb-vs"><i>vs</i><span>{basis}</span></div><div className="tb-a r"><b>{b}</b><Img name={ib} className="tb-im" /></div></div>
        <div className="tb-row">{[[ap, am], [bp, bm]].map(([p, m]: any, i) => <div key={i}><ul className="plus">{p.map((x: string) => <li key={x}>{x}</li>)}</ul><ul className="minus">{m.map((x: string) => <li key={x}>{x}</li>)}</ul></div>)}</div>
        <div className="tb-d"><span>to describe the difference:</span> {diff}</div>
      </div>))}</div>
  </section>;
}

const TABS = ["Vocabulary", "Practice", "Exam tasks"];
/** The open tab lives in the page address (see route.ts), so App passes it in */
export function UnitView({ unit, topic, tab, onTab }: { unit: Unit; topic: Topic; tab: number; onTab: (tab: number) => void }) {
  let essayIdx = 0;
  return <section className="page">
    <Banner kick={`Unit ${unit.num}`} title={unit.title} lede={unit.lede} pics={unit.pics} />
    <nav className="track">{TABS.map((t, i) => <button key={t} className={i === tab ? "on" : ""} onClick={() => onTab(i)}><b>{i + 1}</b>{t}</button>)}</nav>
    {tab === 0 && <><Legend />{unit.vocab.map((b, i) => <VocabBlock key={i} b={b} />)}</>}
    {tab === 1 && unit.exercises.map((e, i) => <ExerciseView key={i} e={e} n={i + 1} />)}
    {tab === 2 && unit.speech.flat().map((s, i) => <SpeechView key={i} s={s} topic={topic} idx={s.type === "essay" ? essayIdx++ : 0} />)}
  </section>;
}

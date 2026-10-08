import { Topic, Unit } from "../types";
import { Img } from "./text";
import { Banner } from "./ui";
import VocabBlock, { Legend } from "./Vocab";
import ExerciseView from "./Exercises";
import SpeechView from "./Speech";
import { slotName } from "./Photo";
import Speaking from "./Speaking";
import { FlashCards, MatchPairs, QuickTest, unitCards } from "./Cards";

export function TypologyBank({ topic }: { topic: Topic }) {
  return <section className="page">
    <Banner kick="Task 4 · comparison bank" title="Types of activity: pros and cons" lede="Find the basis for comparison first, then choose pros and cons" pics={["handshake", "light_bulb"]} />
    <div className="comparison-bank">{topic.typology.map(([ia, a, ib, b, basis, ap, am, bp, bm, diff]: any) => (
      <div className="comparison-card" key={a}>
        <div className="comparison-card__header"><div className="comparison-card__activity"><Img name={ia} className="comparison-card__picture" /><b className="comparison-card__name">{a}</b></div><div className="comparison-card__versus"><i className="comparison-card__versus-word">vs</i><span className="comparison-card__basis">{basis}</span></div><div className="comparison-card__activity comparison-card__activity--right"><b className="comparison-card__name">{b}</b><Img name={ib} className="comparison-card__picture" /></div></div>
        <div className="comparison-card__columns">{[[ap, am], [bp, bm]].map(([p, m]: any, i) => <div key={i}><ul className="comparison-card__list comparison-card__list--pros">{p.map((x: string) => <li className="comparison-card__list-item" key={x}>{x}</li>)}</ul><ul className="comparison-card__list comparison-card__list--cons">{m.map((x: string) => <li className="comparison-card__list-item" key={x}>{x}</li>)}</ul></div>)}</div>
        <div className="comparison-card__difference"><span className="comparison-card__difference-label">to describe the difference:</span> {diff}</div>
      </div>))}</div>
  </section>;
}

/* Tab numbers are fixed (route.ts TABS); "Speaking" is shown only when the unit has a `speaking` field */
const TABS = ["Vocabulary", "Memorise", "Practice", "Speaking", "Exam tasks"];
/** The open tab lives in the page address (see route.ts), so App passes it in */
export function UnitView({ unit, topic, tab, onTab }: { unit: Unit; topic: Topic; tab: number; onTab: (tab: number) => void }) {
  const tabs = unit.speaking ? [0, 1, 2, 3, 4] : [0, 1, 2, 4];
  const cur = tabs.includes(tab) ? tab : 4; // a /speaking link to a unit without that tab opens Exam tasks
  const cards = unitCards(unit);
  let essayIdx = 0;
  const seen: Record<string, number> = {};
  const slot = (type: string) => slotName(topic.id, unit.num, type, seen[type] = (seen[type] || 0) + 1);
  return <section className="page">
    <Banner kick={`Unit ${unit.num}`} title={unit.title} lede={unit.lede} pics={unit.pics} />
    <nav className="unit-tabs">{tabs.map((i, k) => <button key={i} className={`unit-tabs__tab${i === cur ? " unit-tabs__tab--active" : ""}`} onClick={() => onTab(i)}><b className="unit-tabs__number">{k + 1}</b>{TABS[i]}</button>)}</nav>
    {cur === 0 && <><Legend />{unit.vocab.map((b, i) => <VocabBlock key={i} b={b} />)}</>}
    {cur === 1 && <>
      <h3 className="section-heading">1 · Cards</h3><FlashCards cards={cards} />
      <h3 className="section-heading">2 · Match the pairs</h3><MatchPairs cards={cards} number={1} />
      {unit.cards && <><h3 className="section-heading">3 · Test</h3><QuickTest tests={unit.cards} number={1} /></>}
    </>}
    {cur === 2 && unit.exercises.map((e, i) => <ExerciseView key={i} e={e} n={i + 1} />)}
    {cur === 3 && unit.speaking && <Speaking tasks={unit.speaking} />}
    {cur === 4 && unit.speech.flat().map((s, i) => <SpeechView key={i} s={s} topic={topic} idx={s.type === "essay" ? essayIdx++ : 0} slot={slot(s.type)} />)}
  </section>;
}

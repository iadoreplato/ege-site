import { Topic, Universal } from "../types";
import { View, label, moduleItems, samePage, toHash } from "../route";
import { Img } from "./text";
import { RabbitReader } from "./Rabbit";

type Props = { topics: Topic[]; universal: Universal; here: View; last: View | null; onPick?: () => void };

/** One line of the contents: number · title · dotted leader · tag */
function Line({ v, no, title, tag, p }: { v: View; no?: string | number; title: string; tag?: string; p: Props }) {
  const isHere = samePage(v, p.here), isLast = !!p.last && p.here.k === "home" && samePage(v, p.last);
  return <a className={`contents__link${isLast ? " contents__link--last" : ""}`} href={"#" + toHash(v, p.topics)} aria-current={isHere ? "page" : undefined} onClick={p.onPick}>
    <span className="contents__link-number">{no}</span><span className="contents__link-title">{title}</span><i className="contents__link-leader" />{isLast ? <em className="contents__last-badge">you stopped here</em> : tag && <span className="contents__link-tag">{tag}</span>}
  </a>;
}

/** Table of contents of the whole course; used on the cover and as the phone menu */
export function Contents(p: Props) {
  const { topics, universal } = p;
  return <div className="contents">
    <section className="contents__module">
      <div className="contents__module-header"><span className="contents__module-number">0</span><div><h3 className="contents__module-title">About the exam</h3><p className="contents__module-text">{universal.subtitle}</p></div></div>
      {universal.pages.map((pg, i) => <Line key={i} p={p} v={{ k: "u", i }} no={i + 1} title={pg.title} tag={pg.kick} />)}
    </section>
    {topics.map((t, ti) => <section className="contents__module" key={t.id}>
      <div className="contents__module-header"><span className="contents__module-number">{ti + 1}</span><div><h3 className="contents__module-title">{t.title}</h3><div className="contents__pictures">{t.cover_pics.slice(0, 6).map(x => <Img key={x} name={x} className="contents__picture" />)}</div></div></div>
      {moduleItems(t, ti).map(x => <Line key={x.title} p={p} {...x} />)}
    </section>)}
  </div>;
}

export default function Cover(p: Props) {
  const { topics, universal, last } = p;
  const units = topics.reduce((n, t) => n + t.units.length, 0);
  const start: View = last ?? { k: "u", i: 0 };
  return <div className="cover">
    <section className="cover__hero">
      <div className="cover__text">
        <h1 className="cover__title">EGE English<em className="cover__subtitle">a topic-based exam course</em></h1>
        <p className="cover__lead">A universal block with exam structure, criteria and frames, plus topic modules with B2–B2+ vocabulary, practice and exam tasks.</p>
        <div className="cover__actions">
          <a className="cover__button" href={"#" + toHash(start, topics)}>{last ? "Continue" : "Start with the exam"} <span className="cover__button-arrow" aria-hidden="true">→</span></a>
          {last && <span className="cover__last-page">{label(last, topics, universal)}</span>}
        </div>
        <ul className="cover__facts">{[[topics.length, "topic modules"], [units, "units"], ["B2–B2+", "level"], ["EGE 2027", "format"]].map(([n, t]) =>
          <li className="cover__fact" key={t}><b className="cover__fact-number">{n}</b> {t}</li>)}</ul>
      </div>
      <div className="cover__illustration"><RabbitReader /></div>
    </section>
    <section className="cover__contents" aria-labelledby="contents-title">
      <h2 className="cover__contents-title" id="contents-title">Contents</h2>
      <Contents {...p} />
    </section>
  </div>;
}

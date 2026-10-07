import { Topic, Universal } from "../types";
import { View, label, samePage, toHash } from "../route";
import { Img } from "./text";
import { RabbitReader } from "./Rabbit";

type Props = { topics: Topic[]; universal: Universal; here: View; last: View | null; onPick?: () => void };

/** One line of the contents: number · title · dotted leader · tag */
function Line({ v, no, title, tag, p }: { v: View; no?: string | number; title: string; tag?: string; p: Props }) {
  const isHere = samePage(v, p.here), isLast = !!p.last && p.here.k === "home" && samePage(v, p.last);
  return <a className={`toc-l${isLast ? " last" : ""}`} href={"#" + toHash(v, p.topics)} aria-current={isHere ? "page" : undefined} onClick={p.onPick}>
    <span className="toc-no">{no}</span><span className="toc-t">{title}</span><i />{isLast ? <em>you stopped here</em> : tag && <span className="toc-tag">{tag}</span>}
  </a>;
}

/** Table of contents of the whole course; used on the cover and as the phone menu */
export function Contents(p: Props) {
  const { topics, universal } = p;
  return <div className="toc">
    <section className="toc-m">
      <div className="toc-h"><span className="toc-big">0</span><div><h3>About the exam</h3><p>{universal.subtitle}</p></div></div>
      {universal.pages.map((pg, i) => <Line key={i} p={p} v={{ k: "u", i }} no={i + 1} title={pg.title} tag={pg.kick} />)}
    </section>
    {topics.map((t, ti) => <section className="toc-m" key={t.id}>
      <div className="toc-h"><span className="toc-big">{ti + 1}</span><div><h3>{t.title}</h3><div className="toc-pics">{t.cover_pics.slice(0, 6).map(x => <Img key={x} name={x} />)}</div></div></div>
      <Line p={p} v={{ k: "bank", t: ti }} no="·" title="Comparison bank" tag="Task 4" />
      {t.units.map((u, i) => <Line key={u.num} p={p} v={{ k: "unit", t: ti, i, tab: 0 }} no={u.num} title={u.title} />)}
      <Line p={p} v={{ k: "rev", t: ti }} no="·" title="Revision" tag="Tasks 11, 19–36" />
    </section>)}
  </div>;
}

export default function Cover(p: Props) {
  const { topics, universal, last } = p;
  const units = topics.reduce((n, t) => n + t.units.length, 0);
  const start: View = last ?? { k: "u", i: 0 };
  return <div className="cover">
    <section className="cv">
      <div className="cv-t">
        <h1>EGE English<em>a topic-based exam course</em></h1>
        <p>A universal block with exam structure, criteria and frames, plus topic modules with B2–B2+ vocabulary, practice and exam tasks.</p>
        <div className="cv-go">
          <a className="cv-btn" href={"#" + toHash(start, topics)}>{last ? "Continue" : "Start with the exam"} <span aria-hidden="true">→</span></a>
          {last && <span className="cv-where">{label(last, topics, universal)}</span>}
        </div>
        <ul className="cv-facts"><li><b>{topics.length}</b> topic modules</li><li><b>{units}</b> units</li><li><b>B2–B2+</b> level</li><li><b>EGE 2027</b> format</li></ul>
      </div>
      <div className="cv-art"><RabbitReader /></div>
    </section>
    <section className="cv-toc" aria-labelledby="toc-h">
      <h2 id="toc-h">Contents</h2>
      <Contents {...p} />
    </section>
  </div>;
}

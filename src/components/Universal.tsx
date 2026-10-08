import { Page } from "../types";
import { Card, Chips, Img, Text, Slots } from "./text";
import { Banner, Fipi } from "./ui";

/** "t37" in the data → "task-37" modifier */
const task = (tone: string) => tone.replace(/^t/, "task-");

function Block({ b }: { b: any }) {
  switch (b.type) {
    case "demo": return <div className="demo-wording"><div className="demo-wording__title">Task wording · EGE 2027 demo version</div><p className="demo-wording__text">{b.text}</p></div>;
    case "table": return <Card title={b.title} icon={b.icon}><div className="table-scroll"><table className="info-table"><thead><tr>{b.head.map((h: string) => <th className="info-table__heading" key={h}>{h}</th>)}</tr></thead>
      <tbody>{b.rows.map((r: any[], i: number) => <tr className="info-table__row" key={i}>{r.map((c, j) => <td className="info-table__cell" key={j} data-label={b.head[j]}><Text value={c} /></td>)}</tr>)}</tbody></table></div>{b.note && <p className="note">{b.note}</p>}</Card>;
    case "stats": return <div className="exam-stats">{b.items.map(([a, c, d]: string[]) => <div className="exam-stats__item" key={c}><b className="exam-stats__number">{a}</b><span className="exam-stats__label">{c}</span><em className="exam-stats__comment">{d}</em></div>)}</div>;
    case "criteria_detail": {
      const pts = (s: string) => `${s} pt${s === "1" ? "" : "s"}`;
      return <div className={`criteria criteria--${task(b.tone)}`}>
        <div className="criteria__header"><Img name={b.icon} className="criteria__icon" /><span className="criteria__task">Task {b.task}</span><span>{b.title}</span></div>
        <div className="criteria__body"><div className="table-scroll"><table className="criteria-table"><thead><tr><th className="criteria-table__heading" />{b.scores.map((s: string) => <th className="criteria-table__heading" key={s}>{pts(s)}</th>)}</tr></thead>
          <tbody>{b.rows.map(([n, cells]: [string, string[]]) => <tr className="criteria-table__row" key={n}><td className="criteria-table__criterion">{n}</td>{cells.map((c, i) => <td className="criteria-table__cell" key={i} data-label={pts(b.scores[i])}><Text value={c} /></td>)}</tr>)}</tbody></table></div>
          {b.aspects && <div className="criteria__aspects"><span className="criteria__aspects-title">Aspects checked</span>{b.aspects.map((a: string, i: number) => <em className="criteria__aspect" key={i}><b className="criteria__aspect-number">{i + 1}</b>{a}</em>)}</div>}
          {b.checklist && <p className="note">{b.checklist}</p>}</div>
      </div>;
    }
    case "rules": case "wordcount": return <Card title={b.title} icon={b.icon} soft={b.type === "wordcount"}><ul className="dash-list">{b.items.map((x: any, i: number) => <Text key={i} as="li" className="dash-list__item" value={x} />)}</ul></Card>;
    case "a2list": return <Card title={b.title} icon="check_mark_button" soft><Chips items={b.items} /></Card>;
    case "steps": return <Card title={b.title} icon={b.icon}><ol className="steps-list">{b.items.map((x: any, i: number) => <Text key={i} as="li" className="steps-list__item" value={x} />)}</ol></Card>;
    case "pairs": return <Card title={b.title} icon={b.icon} soft><div className="pairs-grid">{b.items.map((x: any, i: number) => <Text className="pairs-grid__item" key={i} value={x} />)}</div></Card>;
    case "fipi": return <Fipi items={b.items} />;
    case "frame": return <Card title={b.title} icon={b.icon}><div className="answer-frame">{b.slots.map((s: string) => <span className="answer-frame__slot" key={s}>{s}</span>)}</div>
      {b.examples.map((e: any, i: number) => <Text as="div" className="answer-frame__example" key={i} value={e} />)}</Card>;
    case "pool": return <Card title={b.title} icon={b.icon} soft><Pool groups={b.groups} /></Card>;
    case "formula": return <div className="formula">{b.items.map((x: any, i: number) => <span key={i} className="formula__step">{i > 0 && <i className="formula__arrow">→</i>}<Text className="formula__text" value={x} /></span>)}</div>;
    case "rule": return <Card title={b.title} icon={b.icon}><div className="usage-rule">{b.items.map(([k, x]: string[], i: number) => <Text key={i} className={`usage-rule__line usage-rule__line--${k === "yes" ? "correct" : "mistake"}`} value={x} />)}{b.note && <p className="usage-rule__note">{b.note}</p>}</div></Card>;
    case "skeleton": return <Card title={b.title} icon={b.icon}><Skel lines={b.lines} /></Card>;
    case "basis": return <Card title={b.title} soft><div className="comparison-basis">{b.items.map(([a, s]: any[], i: number) => <div className="comparison-basis__item" key={i}><b className="comparison-basis__name">{a}</b><Text value={s} /></div>)}</div></Card>;
    case "thesis": return <Card title={b.title} icon={b.icon} soft><div className="thesis-list">{b.items.map((x: string, i: number) => <div className="thesis-list__item" key={i}><b className="thesis-list__number">{i + 1}</b><Text value={x} /></div>)}</div></Card>;
    case "compare": return <div className="compare-cards">{b.items.map(([a, s, e]: string[]) => <div className="compare-cards__item" key={a}><b className="compare-cards__title">{a}</b><Text value={s} /><Text as="em" className="compare-cards__example" value={e} /></div>)}</div>;
    default: return null;
  }
}

/** Groups of ready-made phrases: [group name, phrases] */
export const Pool = ({ groups }: { groups: [string, string[]][] }) =>
  <div className="vocabulary-pool">{groups.map(([h, xs]) => <div className="vocabulary-pool__group" key={h}><span className="vocabulary-pool__title">{h}</span><Chips items={xs} /></div>)}</div>;

export const Skel = ({ lines, small }: { lines: [string, string][]; small?: boolean }) => (
  <div className={`answer-skeleton${small ? " answer-skeleton--small" : ""}`}>{lines.map(([a, s], i) => <div className="answer-skeleton__line" key={i}><span className="answer-skeleton__label">{a}</span><p className="answer-skeleton__text"><Slots text={s} /></p></div>)}</div>
);

export default function UniversalPage({ page }: { page: Page }) {
  return <section className="page"><Banner kick={page.kick} title={page.title} lede={page.lede} pics={page.pics} />
    <div className="page__blocks">{page.blocks.map((b, i) => <Block key={i} b={b} />)}</div></section>;
}

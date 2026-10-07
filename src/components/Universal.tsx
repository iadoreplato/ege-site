import { Page } from "../types";
import { Card, Chips, Img, Rich, Slots } from "./text";
import { Banner, Fipi } from "./ui";

function Block({ b }: { b: any }) {
  switch (b.type) {
    case "demo": return <div className="demo"><div className="demo-h">Task wording · EGE 2027 demo version</div><p>{b.text}</p></div>;
    case "table": return <Card title={b.title} icon={b.icon}><div className="scroll"><table className="tb1"><thead><tr>{b.head.map((h: string) => <th key={h}>{h}</th>)}</tr></thead>
      <tbody>{b.rows.map((r: string[], i: number) => <tr key={i}>{r.map((c, j) => <td key={j}>{c}</td>)}</tr>)}</tbody></table></div>{b.note && <p className="note">{b.note}</p>}</Card>;
    case "stats": return <div className="stats">{b.items.map(([a, c, d]: string[]) => <div key={c}><b>{a}</b><span>{c}</span><em>{d}</em></div>)}</div>;
    case "criteria_detail": return (
      <div className={`cd ${b.tone}`}>
        <div className="cd-h"><Img name={b.icon} className="tc-ic" /><span className="tc-l">Task {b.task}</span><span>{b.title}</span></div>
        <div className="cd-b"><div className="scroll"><table className="cdt"><thead><tr><th />{b.scores.map((s: string) => <th key={s}>{s} pt{s === "1" ? "" : "s"}</th>)}</tr></thead>
          <tbody>{b.rows.map(([n, cells]: [string, string[]]) => <tr key={n}><td className="cn">{n}</td>{cells.map((c, i) => <td key={i}><Rich html={c} /></td>)}</tr>)}</tbody></table></div>
          {b.aspects && <div className="asp"><span>Aspects checked</span>{b.aspects.map((a: string, i: number) => <em key={i}><b>{i + 1}</b>{a}</em>)}</div>}
          {b.checklist && <p className="note">{b.checklist}</p>}</div>
      </div>);
    case "rules": case "wordcount": return <Card title={b.title} icon={b.icon} soft={b.type === "wordcount"}><ul className="dash">{b.items.map((x: string, i: number) => <Rich key={i} as="li" html={x} />)}</ul></Card>;
    case "a2list": return <Card title={b.title} icon="check_mark_button" soft><Chips items={b.items} /></Card>;
    case "steps": return <Card title={b.title} icon={b.icon}><ol className="steps">{b.items.map((x: string, i: number) => <Rich key={i} as="li" html={x} />)}</ol></Card>;
    case "pairs": return <Card title={b.title} icon={b.icon} soft><div className="mp2">{b.items.map((x: string) => <span key={x}>{x}</span>)}</div></Card>;
    case "fipi": return <Fipi items={b.items} />;
    case "frame": return <Card title={b.title} icon={b.icon}><div className="fr">{b.slots.map((s: string) => <span className="fr-s" key={s}>{s}</span>)}</div>
      {b.examples.map((e: string) => <div className="fr-e" key={e}>{e}</div>)}</Card>;
    case "pool": return <Card title={b.title} icon={b.icon} soft>{b.groups.map(([h, xs]: [string, string[]]) => <div className="pl-g" key={h}><span className="pl-h">{h}</span><Chips items={xs} /></div>)}</Card>;
    case "formula": return <div className="formula">{b.items.map((x: string, i: number) => <span key={x} className="f-it">{i > 0 && <i>→</i>}<span>{x}</span></span>)}</div>;
    case "rule": return <Card title={b.title} icon={b.icon}><div className="rule">{b.items.map(([k, x]: string[], i: number) => <Rich key={i} className={k} html={x} />)}{b.note && <p>{b.note}</p>}</div></Card>;
    case "skeleton": return <Card title={b.title} icon={b.icon}><Skel lines={b.lines} /></Card>;
    case "basis": return <Card title={b.title} soft><div className="basis">{b.items.map(([a, s]: string[]) => <div key={a}><b>{a}</b><span>{s}</span></div>)}</div></Card>;
    case "thesis": return <Card title={b.title} icon={b.icon} soft><div className="tp">{b.items.map((x: string, i: number) => <div key={i}><b>{i + 1}</b><span>{x}</span></div>)}</div></Card>;
    case "compare": return <div className="cmp2">{b.items.map(([a, s, e]: string[]) => <div key={a}><b>{a}</b><Rich html={s} /><em>{e}</em></div>)}</div>;
    default: return null;
  }
}

export const Skel = ({ lines, small }: { lines: [string, string][]; small?: boolean }) => (
  <div className={`skel${small ? " sm" : ""}`}>{lines.map(([a, s], i) => <div className="sk" key={i}><span>{a}</span><p><Slots text={s} /></p></div>)}</div>
);

export default function UniversalPage({ page }: { page: Page }) {
  return <section className="page"><Banner kick={page.kick} title={page.title} lede={page.lede} pics={page.pics} />
    <div className="flow">{page.blocks.map((b, i) => <Block key={i} b={b} />)}</div></section>;
}

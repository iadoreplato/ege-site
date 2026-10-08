import { ReactNode } from "react";
import { VocabItem } from "../types";
import { Card, Img, Text } from "./text";

/** A field of a vocabulary entry with that entry's key elements highlighted */
const field = (x: VocabItem, f: "en" | "ex" | "prep" | "note") => ({ text: x[f] ?? "", key: x.key, uncountable: f === "en" && x.uncountable });

/** Entries with the same `group` number in a row are shown as one line: "a competitor · an opponent · a rival" */
const merge = (items: VocabItem[]) => items.reduce<VocabItem[][]>((rows, x) => {
  const last = rows[rows.length - 1];
  if (last && x.group != null && last[0].group === x.group) last.push(x); else rows.push([x]);
  return rows;
}, []);
const joined = (row: VocabItem[], f: "en" | "prep" | "note") => row.map((x, i) => <span key={i}>{i > 0 && " · "}<Text value={field(x, f)} /></span>);
const translation = (row: VocabItem[]) => [...new Set(row.map(x => x.ru).filter(Boolean))].join(" · ");
const example = (row: VocabItem[]) => row.find(x => x.ex);

const PicGrid = ({ items, cols }: { items: VocabItem[]; cols: number }) => (
  <div className={`picture-grid picture-grid--columns-${cols}`}>
    {merge(items).map(row => <div className="picture-grid__item" key={row[0].en}><Img name={row[0].img!} className="picture-grid__picture" />
      <b className="picture-grid__word">{joined(row, "en")}</b>{translation(row) && <span className="picture-grid__translation">{translation(row)}</span>}</div>)}
  </div>
);
const List = ({ items, expressions }: { items: VocabItem[]; expressions?: boolean }) => (
  <div className={`word-list${expressions ? " word-list--expressions" : ""}`}>{merge(items).map(row => {
    const withExample = example(row);
    return <div className="word-list__item" key={row[0].en}><div className="word-list__heading"><b className="word-list__phrase">{joined(row, "en")}</b><span className="word-list__translation">{translation(row)}</span></div>
      {withExample && <Text as="div" className="word-list__example" value={field(withExample, "ex")} />}</div>;
  })}</div>
);
const Key = ({ children }: { children: string }) => <mark className="key-element">{children}</mark>;
const Heading = ({ children }: { children: ReactNode }) => <h3 className="section-heading">{children}</h3>;

export const Legend = () => <div className="legend">
  <span className="legend__item"><Key>on</Key> key element to remember</span>
  <span className="legend__item"><span className="uncountable">U</span> uncountable: no a/an, no plural</span>
  <span className="legend__item"><span className="grammar-pattern">sb · sth · + -ing</span> grammar pattern</span>
</div>;

export default function VocabBlock({ b }: { b: any }) {
  switch (b.type) {
    case "gpd": return <div className="verb-groups">{b.groups.map(([h, sub, items]: [string, string, VocabItem[]]) =>
      <div className="verb-group" key={h}><div className="verb-group__title">{h}<small className="verb-group__subtitle">{sub}</small></div><PicGrid items={items} cols={2} /></div>)}</div>;
    case "venues": return <>
      <Heading>{b.title}</Heading>
      <div className="venue-table">
        <div className="venue-table__row venue-table__row--header"><span className="venue-table__picture" /><div className="venue-table__word">word</div><div className="venue-table__sports">which sports</div><div className="venue-table__preposition">preposition</div><div className="venue-table__note">note</div></div>
        {merge(b.items).map(row => <div className="venue-table__row" key={row[0].en}><Img name={row[0].img!} className="venue-table__picture" /><div className="venue-table__word"><b>{joined(row, "en")}</b><span className="venue-table__translation">{translation(row)}</span></div>
          <div className="venue-table__sports">{row[0].sports}</div><Text as="div" className="venue-table__preposition" value={field(row[0], "prep")} /><Text as="div" className="venue-table__note" value={field(row[0], "note")} /></div>)}
      </div>
      <Card title="Tricky for Russian speakers" icon="light_bulb" soft><p className="info-card__text">«поле» can be a <Key>pitch</Key> (football), a <Key>field</Key> (baseball, lapta) or a <Key>course</Key> (golf). «площадка» is usually a <Key>court</Key>. «дорожка» is a <Key>track</Key> for running but a <Key>lane</Key> in a pool. <Key>ring</Key> = boxing, <Key>rink</Key> = ice. <Key>on</Key> the pitch / court / track / rink / slopes, but <Key>in</Key> the pool / ring / gym.</p></Card>
    </>;
    case "list": return <><Heading>{b.title}</Heading><List items={b.items} /></>;
    case "expressions": return <><Heading><span className="section-heading__level">B2+</span>{b.title}</Heading><List items={b.items} expressions /></>;
    case "pics": return <><Heading><Text value={b.title} /></Heading><PicGrid items={b.items} cols={b.cols} /></>;
    case "note": return <Card title={b.title} icon="light_bulb" soft><Text as="p" className="info-card__text" value={b.text} /></Card>;
    case "definition": return <Text as="p" className="definition" value={b.text} />;
    case "trio": return <div className="three-types">{b.items.map(([im, h, r, d]: string[]) => <div className="three-types__item" key={h}><Img name={im} className="three-types__picture" /><div className="three-types__title">{h}</div><div className="three-types__subtitle">{r}</div><p className="three-types__text">{d}</p></div>)}</div>;
    default: return null;
  }
}

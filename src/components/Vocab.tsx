import { Card, Img, Rich } from "./text";

const PicGrid = ({ items, cols }: { items: any[]; cols: number }) => (
  <div className={`picture-grid picture-grid--columns-${cols}`}>
    {items.map(x => <div className="picture-grid__item" key={x.en}><Img name={x.img} className="picture-grid__picture" /><Rich as="b" className="picture-grid__word" html={x.en} />{x.ru && <span className="picture-grid__translation">{x.ru}</span>}</div>)}
  </div>
);
const List = ({ items, expressions }: { items: any[]; expressions?: boolean }) => (
  <div className={`word-list${expressions ? " word-list--expressions" : ""}`}>{items.map(x => (
    <div className="word-list__item" key={x.en}><div className="word-list__heading"><Rich as="b" className="word-list__phrase" html={x.en} /><span className="word-list__translation">{x.ru}</span></div>{x.ex && <Rich as="div" className="word-list__example" html={x.ex} />}</div>))}</div>
);
const Key = ({ children }: { children: string }) => <mark className="key-element">{children}</mark>;
const Heading = ({ children }: { children: React.ReactNode }) => <h3 className="section-heading">{children}</h3>;

export const Legend = () => <div className="legend">
  <span className="legend__item"><Key>on</Key> key element to remember</span>
  <span className="legend__item"><span className="uncountable">U</span> uncountable: no a/an, no plural</span>
  <span className="legend__item"><span className="grammar-pattern">sb · sth · + -ing</span> grammar pattern</span>
</div>;

export default function VocabBlock({ b }: { b: any }) {
  switch (b.type) {
    case "gpd": return <div className="verb-groups">{b.groups.map(([h, sub, items]: [string, string, any[]]) =>
      <div className="verb-group" key={h}><div className="verb-group__title">{h}<small className="verb-group__subtitle">{sub}</small></div><PicGrid items={items} cols={2} /></div>)}</div>;
    case "venues": return <>
      <Heading>{b.title}</Heading>
      <div className="venue-table">
        <div className="venue-table__row venue-table__row--header"><span className="venue-table__picture" /><div className="venue-table__word">word</div><div className="venue-table__sports">which sports</div><div className="venue-table__preposition">preposition</div><div className="venue-table__note">note</div></div>
        {b.items.map((v: any) => <div className="venue-table__row" key={v.en}><Img name={v.img} className="venue-table__picture" /><div className="venue-table__word"><b>{v.en}</b><span className="venue-table__translation">{v.ru}</span></div>
          <div className="venue-table__sports">{v.sports}</div><Rich as="div" className="venue-table__preposition" html={v.prep} /><Rich as="div" className="venue-table__note" html={v.note} /></div>)}
      </div>
      <Card title="Tricky for Russian speakers" icon="light_bulb" soft><p className="info-card__text">«поле» can be a <Key>pitch</Key> (football), a <Key>field</Key> (baseball, lapta) or a <Key>course</Key> (golf). «площадка» is usually a <Key>court</Key>. «дорожка» is a <Key>track</Key> for running but a <Key>lane</Key> in a pool. <Key>ring</Key> = boxing, <Key>rink</Key> = ice. <Key>on</Key> the pitch / court / track / rink / slopes, but <Key>in</Key> the pool / ring / gym.</p></Card>
    </>;
    case "list": return <><Heading>{b.title}</Heading><List items={b.items} /></>;
    case "expressions": return <><Heading><span className="section-heading__level">B2+</span>{b.title}</Heading><List items={b.items} expressions /></>;
    case "pics": return <><Heading><Rich html={b.title} /></Heading><PicGrid items={b.items} cols={b.cols} /></>;
    case "note": return <Card title={b.title} icon="light_bulb" soft><Rich as="p" className="info-card__text" html={b.html} /></Card>;
    case "definition": return <Rich as="p" className="definition" html={b.html} />;
    case "trio": return <div className="three-types">{b.items.map(([im, h, r, d]: string[]) => <div className="three-types__item" key={h}><Img name={im} className="three-types__picture" /><div className="three-types__title">{h}</div><div className="three-types__subtitle">{r}</div><p className="three-types__text">{d}</p></div>)}</div>;
    default: return null;
  }
}

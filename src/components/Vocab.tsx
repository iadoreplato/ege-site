import { Card, Img, Rich } from "./text";

const PicGrid = ({ items, cols }: { items: any[]; cols: number }) => (
  <div className="pg" style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}>
    {items.map(x => <div className="pt" key={x.en}><Img name={x.img} className="pt-im" /><Rich as="b" html={x.en} />{x.ru && <span>{x.ru}</span>}</div>)}
  </div>
);
const List = ({ items, exp }: { items: any[]; exp?: boolean }) => (
  <div className={`vocab${exp ? " exp" : ""}`}>{items.map(x => (
    <div className="v" key={x.en}><div className="v-top"><Rich as="b" html={x.en} /><span className="ru">{x.ru}</span></div>{x.ex && <Rich as="div" className="ex" html={x.ex} />}</div>))}</div>
);

export const Legend = () => <div className="legend"><span><mark className="k">on</mark> key element to remember</span><span><span className="u">U</span> uncountable: no a/an, no plural</span><span><span className="gr">sb · sth · + -ing</span> grammar pattern</span></div>;

export default function VocabBlock({ b }: { b: any }) {
  switch (b.type) {
    case "gpd": return <div className="gpd">{b.groups.map(([h, sub, items]: [string, string, any[]]) =>
      <div className="gp" key={h}><div className="gp-h">{h}<small>{sub}</small></div><PicGrid items={items} cols={2} /></div>)}</div>;
    case "venues": return <>
      <h3 className="sub">{b.title}</h3>
      <div className="venues"><div className="vn vh"><span /><div className="vn-w">word</div><div className="vn-s">which sports</div><div className="vn-p">preposition</div><div className="vn-n">note</div></div>
        {b.items.map((v: any) => <div className="vn" key={v.en}><Img name={v.img} className="vn-im" /><div className="vn-w"><b>{v.en}</b><span>{v.ru}</span></div>
          <div className="vn-s">{v.sports}</div><Rich as="div" className="vn-p" html={v.prep} /><Rich as="div" className="vn-n" html={v.note} /></div>)}</div>
      <Card title="Tricky for Russian speakers" icon="light_bulb" soft><p className="small">«поле» can be a <mark className="k">pitch</mark> (football), a <mark className="k">field</mark> (baseball, lapta) or a <mark className="k">course</mark> (golf). «площадка» is usually a <mark className="k">court</mark>. «дорожка» is a <mark className="k">track</mark> for running but a <mark className="k">lane</mark> in a pool. <mark className="k">ring</mark> = boxing, <mark className="k">rink</mark> = ice. <mark className="k">on</mark> the pitch / court / track / rink / slopes, but <mark className="k">in</mark> the pool / ring / gym.</p></Card>
    </>;
    case "list": return <><h3 className="sub">{b.title}</h3><List items={b.items} /></>;
    case "expressions": return <><h3 className="sub"><span className="lvl">B2+</span>{b.title}</h3><List items={b.items} exp /></>;
    case "pics": return <><h3 className="sub"><Rich html={b.title} /></h3><PicGrid items={b.items} cols={b.cols} /></>;
    case "note": return <Card title={b.title} icon="light_bulb" soft><Rich as="p" className="small" html={b.html} /></Card>;
    case "definition": return <Rich as="p" className="def" html={b.html} />;
    case "trio": return <div className="trio">{b.items.map(([im, h, r, d]: string[]) => <div key={h}><Img name={im} className="tr-im" /><div className="tr-h">{h}</div><div className="tr-r">{r}</div><p>{d}</p></div>)}</div>;
    default: return null;
  }
}

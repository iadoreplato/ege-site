import { useState } from "react";
import universalData from "./content/universal.json";
import sportData from "./content/sport.json";
import russiaData from "./content/russia.json";
import { Topic, Universal } from "./types";
import UniversalPage from "./components/Universal";
import { TypologyBank, UnitView } from "./components/Topic";
import Revision from "./components/Revision";
import { Img } from "./components/text";

const universal = universalData as unknown as Universal;
// New topic modules: import the JSON and add it here
const topics = [sportData, russiaData] as unknown as Topic[];

type View = { k: "home" } | { k: "u"; i: number } | { k: "bank"; t: number } | { k: "unit"; t: number; i: number } | { k: "rev"; t: number };

export default function App() {
  const [view, setView] = useState<View>({ k: "home" });
  const [menu, setMenu] = useState(false);
  const go = (v: View) => { setView(v); setMenu(false); window.scrollTo(0, 0); };
  const on = (v: View) => (JSON.stringify(v) === JSON.stringify(view) ? "on" : "");
  return (
    <div className="app">
      <button className="burger" onClick={() => setMenu(!menu)} aria-label="Menu">☰</button>
      <aside className={menu ? "open" : ""}>
        <div className="logo" onClick={() => go({ k: "home" })}>EGE · English</div>
        <div className="nav-h">About the exam</div>
        {universal.pages.map((p, i) => <button key={i} className={on({ k: "u", i })} onClick={() => go({ k: "u", i })}>{p.title}</button>)}
        {topics.map((t, ti) => <div key={t.id}>
          <div className="nav-h">Module {ti + 1} · {t.title}</div>
          <button className={on({ k: "bank", t: ti })} onClick={() => go({ k: "bank", t: ti })}>Comparison bank</button>
          {t.units.map((u, i) => <button key={u.num} className={on({ k: "unit", t: ti, i })} onClick={() => go({ k: "unit", t: ti, i })}>{u.num}. {u.title}</button>)}
          <button className={on({ k: "rev", t: ti })} onClick={() => go({ k: "rev", t: ti })}>Revision</button>
        </div>)}
      </aside>
      <main>
        {view.k === "home" && <section className="page home">
          <div className="hero"><div className="bn-k">EGE English</div><h1>Topic-based exam course</h1>
            <p>A universal block with exam structure, criteria and frames, plus topic modules with B2–B2+ vocabulary, practice and exam tasks.</p></div>
          <div className="tiles">
            <button onClick={() => go({ k: "u", i: 0 })}><div className="tile-p">{universal.cover_pics.slice(0, 4).map(p => <Img key={p} name={p} />)}</div><b>About the exam</b><span>Universal: structure, criteria, frames, typical mistakes</span></button>
            {topics.map((t, ti) => <button key={t.id} onClick={() => go({ k: "unit", t: ti, i: 0 })}><div className="tile-p">{t.cover_pics.slice(0, 4).map(p => <Img key={p} name={p} />)}</div><b>Module {ti + 1}</b><span>{t.title}</span></button>)}
          </div>
        </section>}
        {view.k === "u" && <UniversalPage page={universal.pages[view.i]} />}
        {view.k === "bank" && <TypologyBank topic={topics[view.t]} />}
        {view.k === "unit" && <UnitView key={`${view.t}-${view.i}`} unit={topics[view.t].units[view.i]} topic={topics[view.t]} />}
        {view.k === "rev" && <Revision key={view.t} topic={topics[view.t]} />}
      </main>
    </div>
  );
}

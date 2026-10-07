import { useEffect, useState } from "react";
import universalData from "./content/universal.json";
import sportData from "./content/sport.json";
import russiaData from "./content/russia.json";
import { Topic, Universal } from "./types";
import UniversalPage from "./components/Universal";
import { TypologyBank, UnitView } from "./components/Topic";
import Revision from "./components/Revision";
import Header from "./components/Header";
import Cover from "./components/Cover";
import { View, fromHash, label, samePage, sequence, toHash } from "./route";

const universal = universalData as unknown as Universal;
// New topic modules: import the JSON and add it here
const topics = [sportData, russiaData] as unknown as Topic[];
const order = sequence(topics, universal);

/* The last open page and scroll position are kept in this browser only (localStorage), nothing goes to a server */
const LAST = "ege:last", SCROLL = "ege:scroll";
const load = (k: string) => { try { return localStorage.getItem(k); } catch { return null; } };
const save = (k: string, v: string) => { try { localStorage.setItem(k, v); } catch { /* private mode: just don't remember */ } };
const read = (h: string) => fromHash(h, topics, universal);
const name = (v: View) => label(v, topics, universal);
const href = (v: View) => "#" + toHash(v, topics);

/** Page to show on start: the address if there is one, otherwise the page where the reader stopped last time */
function start(): { view: View; restored: boolean } {
  if (location.hash.replace(/^#/, "")) return { view: read(location.hash), restored: false };
  const saved = load(LAST);
  if (!saved) return { view: { k: "home" }, restored: false };
  history.replaceState(null, "", "#" + saved);
  return { view: read(saved), restored: true };
}
const first = start();

export default function App() {
  const [view, setView] = useState<View>(first.view);
  const [last, setLast] = useState<View | null>(() => { const s = load(LAST); const v = s ? read(s) : null; return v && v.k !== "home" ? v : null; });

  // Links change the address; the page follows it (this also makes the browser's Back button work)
  useEffect(() => {
    const onHash = () => { setView(read(location.hash)); window.scrollTo(0, 0); };
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  // Remember the open page and its scroll position
  useEffect(() => {
    document.title = view.k === "home" ? "EGE English · topic-based exam course" : `${name(view)} · EGE English`;
    if (view.k === "home") return;
    const h = toHash(view, topics);
    save(LAST, h); setLast(view);
    let timer = 0;
    const onScroll = () => { clearTimeout(timer); timer = window.setTimeout(() => save(SCROLL, JSON.stringify({ h, y: Math.round(scrollY) })), 250); };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => { clearTimeout(timer); window.removeEventListener("scroll", onScroll); };
  }, [view]);

  // On start, return to the same place on the page
  useEffect(() => {
    if (!first.restored) return;
    try {
      const { h, y } = JSON.parse(load(SCROLL) || "{}");
      if (h === toHash(first.view, topics) && y > 0) requestAnimationFrame(() => window.scrollTo(0, y));
    } catch { /* nothing saved */ }
  }, []);

  // Switching tabs inside a unit updates the address without adding a Back step
  const setTab = (tab: number) => {
    if (view.k !== "unit") return;
    const v = { ...view, tab };
    history.replaceState(null, "", href(v));
    setView(v);
  };

  const at = order.findIndex(v => samePage(v, view));
  const prev = order[at - 1], next = order[at + 1];
  return (
    <div className="app">
      <Header topics={topics} universal={universal} here={view} last={last} />
      <main>
        {view.k === "home" && <Cover topics={topics} universal={universal} here={view} last={last} />}
        {view.k === "u" && <UniversalPage page={universal.pages[view.i]} />}
        {view.k === "bank" && <TypologyBank topic={topics[view.t]} />}
        {view.k === "unit" && <UnitView key={`${view.t}-${view.i}`} unit={topics[view.t].units[view.i]} topic={topics[view.t]} tab={view.tab} onTab={setTab} />}
        {view.k === "rev" && <Revision key={view.t} topic={topics[view.t]} />}
        {at >= 0 && <nav className="pager" aria-label="Previous and next page">
          {prev ? <a className="pg prev" href={href(prev)}><span>← Previous</span><b>{name(prev)}</b></a> : <i />}
          {next ? <a className="pg next" href={href(next)}><span>Next →</span><b>{name(next)}</b></a> : <a className="pg next" href="#/"><span>Done →</span><b>Back to contents</b></a>}
        </nav>}
      </main>
    </div>
  );
}

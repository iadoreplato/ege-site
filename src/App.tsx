/* ГЛАВНЫЙ КОМПОНЕНТ сайта. Загружает весь контент (JSON), следит за адресом страницы
   и решает, какую страницу показать. Шапка и кролики показываются поверх любой страницы. */
import { useEffect, useState } from "react";
import universalData from "./content/universal.json";
import sportData from "./content/sport.json";
import russiaData from "./content/russia.json";
import { Topic, Universal } from "./types";
import UniversalPage from "./components/Universal";
import { TypologyBank, UnitView } from "./components/Topic";
import Revision, { Review } from "./components/Revision";
import Header from "./components/Header";
import Cover from "./components/Cover";
import { Praise, Peeker } from "./components/Rabbit";
import { View, fromHash, label, toHash } from "./route";

// «as unknown as …» — говорим TypeScript: «поверь, данные такого вида» (полностью JSON он не сверяет)
const universal = universalData as unknown as Universal;
// New topic modules: import the JSON and add it here
// НОВЫЙ МОДУЛЬ: импортируйте его JSON выше и добавьте в этот массив. Порядок в массиве = номер модуля в меню
const topics = [sportData, russiaData] as unknown as Topic[];

/* The last open page and scroll position are kept in this browser only (localStorage), nothing goes to a server
   Последняя открытая страница и место прокрутки хранятся только в браузере ученика (localStorage), на сервер ничего не уходит */
const LAST = "ege:last", SCROLL = "ege:scroll"; // названия ячеек в памяти браузера
// чтение и запись в память браузера; try/catch — в приватном режиме память может быть недоступна, тогда просто ничего не делаем
const load = (k: string) => { try { return localStorage.getItem(k); } catch { return null; } };
const save = (k: string, v: string) => { try { localStorage.setItem(k, v); } catch { /* private mode: just don't remember */ } };
// короткие обёртки, чтобы не передавать каждый раз topics и universal
const read = (h: string) => fromHash(h, topics, universal); // адрес → страница
const name = (v: View) => label(v, topics, universal);      // страница → название
const href = (v: View) => "#" + toHash(v, topics);           // страница → ссылка

/** Page to show on start: the address if there is one, otherwise the page where the reader stopped last time
    Какую страницу открыть при запуске: из адреса, если он есть; иначе ту, где ученик остановился; иначе обложку.
    restored = true, если страница взята из памяти (тогда вернём и прокрутку) */
function start(): { view: View; restored: boolean } {
  if (location.hash.replace(/^#/, "")) return { view: read(location.hash), restored: false };
  const saved = load(LAST);
  if (!saved) return { view: { k: "home" }, restored: false };
  history.replaceState(null, "", "#" + saved); // подставить сохранённый адрес, не добавляя шаг в историю «Назад»
  return { view: read(saved), restored: true };
}
const first = start(); // вычисляется один раз при загрузке сайта

export default function App() {
  // view — открытая сейчас страница
  const [view, setView] = useState<View>(first.view);
  // last — последняя открытая страница (не обложка): для кнопки «Continue» и метки «you stopped here»
  const [last, setLast] = useState<View | null>(() => { const s = load(LAST); const v = s ? read(s) : null; return v && v.k !== "home" ? v : null; });

  // Links change the address; the page follows it (this also makes the browser's Back button work)
  // Ссылки меняют адрес, а страница следует за адресом (поэтому работает кнопка «Назад»)
  useEffect(() => {
    const onHash = () => { setView(read(location.hash)); window.scrollTo(0, 0); };
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash); // уборка: перестать слушать
  }, []);

  // Remember the open page and its scroll position
  // При смене страницы: заголовок вкладки браузера, запомнить страницу и место прокрутки
  useEffect(() => {
    document.title = view.k === "home" ? "EGE English · topic-based exam course" : `${name(view)} · EGE English`;
    if (view.k === "home") return;
    const h = toHash(view, topics);
    save(LAST, h); setLast(view);
    // прокрутку запоминаем не на каждый пиксель, а через 250 мс после остановки
    let timer = 0;
    const onScroll = () => { clearTimeout(timer); timer = window.setTimeout(() => save(SCROLL, JSON.stringify({ h, y: Math.round(scrollY) })), 250); };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => { clearTimeout(timer); window.removeEventListener("scroll", onScroll); };
  }, [view]);

  // On start, return to the same place on the page
  // При запуске вернуть прокрутку туда, где ученик остановился (только если это та же страница)
  useEffect(() => {
    if (!first.restored) return;
    try {
      const { h, y } = JSON.parse(load(SCROLL) || "{}");
      if (h === toHash(first.view, topics) && y > 0) requestAnimationFrame(() => window.scrollTo(0, y));
    } catch { /* nothing saved */ }
  }, []);

  // Switching tabs inside a unit updates the address without adding a Back step
  // Переключение вкладки юнита: меняем адрес, но без нового шага в истории «Назад»
  const setTab = (tab: number) => {
    if (view.k !== "unit") return;
    const v = { ...view, tab };
    history.replaceState(null, "", href(v));
    setView(v);
  };

  // Разметка: шапка, одна страница по виду view.k, кролик-похвала и выглядывающий кролик (не на обложке).
  // key={…} заставляет React создать страницу заново при смене юнита, чтобы ответы прошлого юнита не остались
  return (
    <div className="site">
      <Header topics={topics} universal={universal} here={view} last={last} />
      <main className="site__main">
        {view.k === "home" && <Cover topics={topics} universal={universal} here={view} last={last} />}
        {view.k === "u" && <UniversalPage page={universal.pages[view.i]} />}
        {view.k === "bank" && <TypologyBank topic={topics[view.t]} />}
        {view.k === "unit" && <UnitView key={`${view.t}-${view.i}`} unit={topics[view.t].units[view.i]} topic={topics[view.t]} tab={view.tab} onTab={setTab} />}
        {view.k === "rev" && <Revision key={view.t} topic={topics[view.t]} />}
        {view.k === "review" && <Review key={`${view.t}-${view.i}`} topic={topics[view.t]} i={view.i} />}
      </main>
      <Praise />
      {view.k !== "home" && <Peeker />}
    </div>
  );
}

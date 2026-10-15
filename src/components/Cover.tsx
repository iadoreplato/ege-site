/* ОБЛОЖКА (главная страница) И ОГЛАВЛЕНИЕ курса.
   Оглавление (Contents) используется в двух местах: на обложке и во всплывающей панели «Contents» в шапке. */
import { Topic, Universal } from "../types";
import { View, label, moduleItems, samePage, toHash } from "../route";
import { Img } from "./text";
import { RabbitReader } from "./Rabbit";
import { listeningFor } from "./Listening";
import { readingFor } from "./Reading";
import { isDone } from "./Task";

/** Юнит пройден: все его задания на аудирование и чтение хотя бы раз проверены (отметка «✓ done» в оглавлении) */
function unitDone(module: string, unit: number) {
  const tasks = [["listening", listeningFor(module, unit)], ["reading", readingFor(module, unit)]] as const;
  const present = tasks.filter(([, t]) => t);
  return present.length > 0 && present.every(([s, t]) => isDone(s, t!.id));
}

/** here — открытая страница; last — где ученик остановился; onPick — что сделать после выбора пункта (закрыть панель) */
type Props = { topics: Topic[]; universal: Universal; here: View; last: View | null; onPick?: () => void };

/** One line of the contents: number · title · dotted leader · tag
    Строка оглавления: номер · название · точки · пометка. На обложке у последней открытой страницы
    вместо пометки — «you stopped here». done — юнит пройден (unitDone): «✓ done» (видно и на телефоне) */
function Line({ v, no, title, tag, done, p }: { v: View; no?: string | number; title: string; tag?: string; done?: boolean; p: Props }) {
  const isHere = samePage(v, p.here), isLast = !!p.last && p.here.k === "home" && samePage(v, p.last);
  return <a className={`contents__link${isLast ? " contents__link--last" : ""}`} href={"#" + toHash(v, p.topics)} aria-current={isHere ? "page" : undefined} onClick={p.onPick}>
    <span className="contents__link-number">{no}</span><span className="contents__link-title">{title}</span><i className="contents__link-leader" />{done && <span className="contents__done">✓ done</span>}{isLast ? <em className="contents__last-badge">you stopped here</em> : tag && <span className="contents__link-tag">{tag}</span>}
  </a>;
}

/** Table of contents of the whole course; used on the cover and as the phone menu
    Оглавление всего курса: раздел 0 «About the exam», затем каждый модуль со своими страницами */
export function Contents(p: Props) {
  const { topics, universal } = p;
  return <div className="contents">
    <section className="contents__module">
      <div className="contents__module-header"><span className="contents__module-number">0</span><div><h3 className="contents__module-title">About the exam</h3><p className="contents__module-text">{universal.subtitle}</p></div></div>
      {universal.pages.map((pg, i) => <Line key={i} p={p} v={{ k: "u", i }} no={i + 1} title={pg.title} tag={pg.kick} />)}
    </section>
    {topics.map((t, ti) => <section className="contents__module" key={t.id}>
      <div className="contents__module-header"><span className="contents__module-number">{ti + 1}</span><div><h3 className="contents__module-title">{t.title}</h3><div className="contents__pictures">{t.cover_pics.slice(0, 6).map(x => <Img key={x} name={x} className="contents__picture" />)}</div></div></div>
      {/* у пройденного юнита (проверены Listening и Reading) пометка «✓ done» */}
      {moduleItems(t, ti).map(x => <Line key={x.title} p={p} {...x} done={x.v.k === "unit" && unitDone(t.id, t.units[x.v.i].num)} />)}
    </section>)}
  </div>;
}

/** Обложка: заголовок, кнопка «Start with the exam» (или «Continue», если ученик уже был на сайте),
    цифры о курсе, кролик с книгой и оглавление. units — сколько всего юнитов во всех модулях */
export default function Cover(p: Props) {
  const { topics, universal, last } = p;
  const units = topics.reduce((n, t) => n + t.units.length, 0);
  const start: View = last ?? { k: "u", i: 0 }; // куда ведёт главная кнопка; ?? — «если last пусто, то…»
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

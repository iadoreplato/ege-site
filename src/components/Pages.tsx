/* ДОМАШНИЕ СТРАНИЦЫ И ВХОД (МОДЕЛЬ):
   - Landing — главная: первый экран, два раздела (бесплатные варианты ЕГЭ и учебник по подписке), три шага, цифры курса;
   - FreeHome — домашняя страница бесплатных вариантов;
   - Login — демо-вход: выбрать, кем войти (без пароля, всё остаётся в браузере);
   - Locked — что видит гость на странице учебника. */
import { SECTIONS } from "../sections";
import scale from "../content/scale.json";
import { USERS, login, logout, useUser } from "../demo";
import { Banner } from "./ui";
import { variants } from "./Variant";
import { Topic } from "../types";
import { unitCards } from "./Cards";
import { RabbitReader } from "./Rabbit";

/** Два раздела сайта: что внутри (три пункта) и куда ведёт кнопка */
const PATHS = [
  { kick: "Free", title: "Practice tests", text: "Full EGE variants in the 2027 format.", points: ["All 38 tasks, with real exam audio", "Tasks 1–36 checked at once", "Your score and your weak points"] },
  { kick: "Subscription", title: "Textbook", text: "Topic units that close the gaps.", points: ["B2–B2+ topics with exam tasks", "Vocabulary, practice, speaking", "Progress your teacher can see"] },
];
/** Как это работает: три шага */
const STEPS = [["Take a test", "A full variant, section by section."], ["See your gaps", "Your score and weak skills, right away."], ["Close them", "Every gap links to the unit that trains it."]];

/** Главная: крупный первый экран, два раздела, три шага, цифры курса и финальная кнопка.
    Цифры считаются по контенту (варианты, юниты, слова, экзаменационные задания), не вписываются руками */
export function Landing({ topics }: { topics: Topic[] }) {
  const user = useUser();
  const units = topics.flatMap(t => t.units);
  const facts: [number, string][] = [
    [variants().length, "practice tests"], [units.length, "topic units"],
    [units.reduce((n, u) => n + unitCards(u).length, 0), "words and phrases"],
    [units.reduce((n, u) => n + u.speech.flat().length, 0), "exam tasks in the textbook"],
  ];
  const book = user ? "#/book" : "#/login";
  return <section className="page landing">
    <div className="hero">
      <div className="hero__text">
        <p className="hero__kick">EGE English · 2027 format</p>
        <h1 className="hero__title">Ready for the exam, <em className="hero__accent">one step at a time</em></h1>
        <p className="hero__lead">Start with a free practice test. See your score and weak points, then close the gaps with the topic-based textbook.</p>
        <div className="hero__actions">
          <a className="hero__button" href="#/free">Start a free test <span aria-hidden="true">→</span></a>
          <a className="hero__button hero__button--ghost" href={book}>{user ? "Open the textbook" : "Log in to the textbook"}</a>
        </div>
        <ul className="hero__chips">{["FIPI criteria", "Instant feedback", "No account for tests"].map(x => <li className="hero__chip" key={x}>✓ {x}</li>)}</ul>
      </div>
      <div className="hero__art" aria-hidden="true">
        <RabbitReader />
        <span className="hero__float hero__float--1"><b>Listening · Task 1</b>6 / 6 ✓</span>
        <span className="hero__float hero__float--2"><b>Essay · Task 38</b>AI feedback</span>
        <span className="hero__float hero__float--3"><b>Weak spot</b>practise in Unit 3 →</span>
      </div>
    </div>

    <div className="paths">{PATHS.map((p, i) => <a key={p.title} className={`path reveal${i ? " path--book" : ""}`} href={i ? book : "#/free"}>
      <span className="path__kick">{p.kick}</span><b className="path__title">{p.title}</b><span className="path__text">{p.text}</span>
      <ul className="path__list">{p.points.map(x => <li key={x}>{x}</li>)}</ul>
      <span className="path__go">{i ? (user ? "Open the textbook" : "Log in") : "Choose a test"} →</span></a>)}</div>

    <ol className="how reveal">{STEPS.map(([t, x], i) => <li className="how__step" key={t}><b className="how__number">{i + 1}</b><b className="how__title">{t}</b><span className="how__text">{x}</span></li>)}</ol>

    <div className="band reveal">
      <ul className="band__numbers">{facts.map(([n, t]) => <li key={t}><b className="band__value">{n}</b>{t}</li>)}</ul>
      <div className="band__cta"><b className="band__title">See where you are today</b><a className="hero__button" href="#/free">Start a free test <span aria-hidden="true">→</span></a></div>
    </div>
  </section>;
}

/** Домашняя страница бесплатных вариантов: устройство экзамена (из sections.json), баллы (scale.json), список вариантов */
export function FreeHome() {
  return <section className="page">
    <Banner kick="Free" title="Practice tests" lede="EGE variants in the 2027 format with checking and feedback" pics={["memo", "check_mark_button"]} />
    <h3 className="section-heading">The exam at a glance</h3>
    <div className="exam-glance">{SECTIONS.map(s => <div className="exam-glance__item" key={s.id}><b className="exam-glance__name">{s.label}</b><span>{s.ege}</span>{s.minutes && <span className="exam-glance__time">{s.minutes} min</span>}</div>)}</div>
    <p className="note">Maximum {scale.max} primary points: written part {scale.parts.written}, oral part {scale.parts.oral}. Your result is converted to test points ({scale.year} scale); the pass mark is {scale.pass} test points.</p>
    <h3 className="section-heading">Variants</h3>
    {variants().map((v, i) => <a className="exercise variant-card" key={v.id} href={`#/free/variant/${i + 1}`}><div><b className="variant-card__title">{v.title}</b><p className="note">{v.lede}</p></div><span className="variant-card__go">Start →</span></a>)}
  </section>;
}

/** Демо-вход: карточки пользователей из demo.json */
export function Login() {
  const user = useUser();
  const enter = (id: string) => { login(id); location.hash = "#/cabinet"; };
  return <section className="page">
    <Banner kick="Demo" title="Log in" lede="This is a model of the site: choose who you are. No password is needed, and nothing leaves this browser." pics={["admission_tickets"]} />
    {user && <p className="note">You are logged in as <b>{user.name}</b>. <button className="button button--secondary" onClick={logout}>Log out</button></p>}
    <div className="login-cards">{USERS.map(u => <button key={u.id} className={`login-card${u.id === user?.id ? " login-card--current" : ""}`} onClick={() => enter(u.id)}>
      <b className="login-card__name">{u.name}</b><span className="login-card__role">{u.role === "teacher" ? "Teacher" : `Student · ${USERS.find(t => t.id === u.teacher)?.name}'s class`}</span></button>)}</div>
  </section>;
}

/** Страница учебника для гостя */
export const Locked = () => <section className="page">
  <Banner kick="Textbook · subscription" title="Log in to open the textbook" lede="Topic modules with vocabulary, practice and exam tasks are part of the subscription" pics={["books", "admission_tickets"]} />
  <p>In this model, log in as any demo student or as the teacher.</p>
  <a className="button button--primary" href="#/login">Log in</a>
  <p className="note">The exam variants and the <a href="#/exam/1">About the exam</a> pages are free.</p>
</section>;

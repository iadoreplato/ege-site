/* ДОМАШНИЕ СТРАНИЦЫ И ВХОД (МОДЕЛЬ):
   - Landing — главная: два раздела сайта, бесплатные варианты ЕГЭ и учебник по подписке;
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

/** Как устроена подготовка: три шага */
const STEPS = [
  ["Try a free variant", "Do a full exam variant in the 2027 format, in exam mode with a timer or in practice mode."],
  ["See your score and weak points", "Tasks 1–36 are checked at once; writing and speaking get AI feedback by the FIPI criteria. You see your test score and which skills need work."],
  ["Practise with the textbook", "Each weak point links to the unit and task type that trains it. Your teacher sees your progress and sets homework."],
];
/** Методика: на чём построены задания и кабинеты */
const METHODS = [
  ["Practice by skill, not just by score", "Every task is linked to an exam skill, such as listening for detail or word formation. A skill counts as weak only after several attempts, so one bad day does not change the picture."],
  ["Feedback straight after the answer", "The student sees the correct answer and the transcript or text right away, while the task is still fresh."],
  ["Exam criteria from FIPI", "Writing and speaking are assessed by the official criteria, so the feedback matches what examiners look for."],
  ["Words in many formats", "Vocabulary is practised in several formats: cards, pairs, gaps and exam tasks, so students recall words rather than just reread them."],
  ["The teacher stays in charge", "Discussion questions are for the lesson, and the teacher's account suggests what to do next for the class and for each student."],
];
/** Частые вопросы */
const FAQ = [
  ["Is it really free?", "Yes: exam variants with checking and feedback are free. The topic-based textbook is part of the subscription."],
  ["Do I need an account?", "Not for the free variants. To open the textbook and save progress, students and teachers log in to their accounts."],
  ["Which exam format is used?", "The EGE 2027 format: listening, reading, grammar and vocabulary, writing (tasks 37–38) and the oral part (tasks 1–4)."],
  ["Who can see my results?", "Only you and your teacher. In this model of the site, results are kept in your browser and are not sent anywhere."],
];

/** Главная: о сайте, два раздела, как это работает, для кого, методика, что внутри учебника, вопросы.
    Цифры о курсе считаются по контенту (topics), не вписываются руками */
export function Landing({ topics }: { topics: Topic[] }) {
  const user = useUser();
  const units = topics.flatMap(t => t.units);
  const facts: [number, string][] = [
    [topics.length, "topic modules"], [units.length, "units"],
    [units.reduce((n, u) => n + unitCards(u).length, 0), "words and phrases"],
    [units.reduce((n, u) => n + u.exercises.length, 0), "practice exercises"],
    [units.reduce((n, u) => n + u.speech.flat().length, 0), "exam tasks"],
  ];
  const book = user ? "#/book" : "#/login";
  return <section className="page landing">
    <div className="cover__hero">
      <div className="cover__text">
        <h1 className="cover__title">EGE English<em className="cover__subtitle">exam variants and a topic-based textbook</em></h1>
        <p className="cover__lead">Check your level with a free exam variant, get feedback on every section, then close the gaps with B2–B2+ topic units. Teachers see their students' progress and weak points.</p>
        <div className="cover__actions">
          <a className="cover__button" href="#/free">Try a free variant <span className="cover__button-arrow" aria-hidden="true">→</span></a>
          <a className="landing__link" href={book}>{user ? "Open the textbook" : "Log in to the textbook"}</a>
        </div>
        <ul className="cover__facts">{[["EGE 2027", "format"], ["1–38", "all exam tasks"], ["B2–B2+", "level"], ["FIPI", "criteria"]].map(([n, t]) =>
          <li className="cover__fact" key={t}><b className="cover__fact-number">{n}</b> {t}</li>)}</ul>
      </div>
      <div className="cover__illustration"><RabbitReader /></div>
    </div>

    <div className="home-cards">
      <a className="home-card" href="#/free"><span className="home-card__kick">Free</span><b className="home-card__title">EGE variants</b>
        <span className="home-card__text">Full exam variants in the 2027 format. Automatic checking, AI feedback on writing and speaking, your score and your weak points.</span>
        <span className="home-card__action">Try a variant →</span></a>
      <a className="home-card home-card--book" href={book}><span className="home-card__kick">Subscription</span><b className="home-card__title">Textbook</b>
        <span className="home-card__text">Topic modules: vocabulary, practice and exam tasks for every section. Progress is saved; teachers see their students' strengths and weak points.</span>
        <span className="home-card__action">{user ? "Open the textbook →" : "Log in →"}</span></a>
    </div>

    <h3 className="section-heading">How it works</h3>
    <ol className="steps">{STEPS.map(([t, x], i) => <li className="steps__item" key={t}><b className="steps__number">{i + 1}</b><b className="steps__title">{t}</b><span>{x}</span></li>)}</ol>

    <h3 className="section-heading">For students and teachers</h3>
    <div className="home-cards">
      <div className="exercise audience"><b className="audience__title">Students</b><ul className="plan-list">
        {["Exam tasks in the real format, with timers and audio", "Instant checking and a clear explanation of the score", "Your skills, homework and what to review today in one place", "Record your speaking answers and listen back"].map(x => <li className="plan-list__item" key={x}>{x}</li>)}</ul></div>
      <div className="exercise audience"><b className="audience__title">Teachers</b><ul className="plan-list">
        {["Your class at a glance: activity, average score, weak points", "A skills map for every student and the whole class", "Hints on what to do next: whole-class topics, students who need a nudge, progress to praise", "Set homework from any unit or exam task with a due date"].map(x => <li className="plan-list__item" key={x}>{x}</li>)}</ul></div>
    </div>

    <h3 className="section-heading">The exam at a glance</h3>
    <div className="exam-glance">{SECTIONS.map(s => <div className="exam-glance__item" key={s.id}><b className="exam-glance__name">{s.label}</b><span>{s.ege}</span>{s.minutes && <span className="exam-glance__time">{s.minutes} min</span>}</div>)}</div>
    <p className="note">Maximum {scale.max} primary points: written part {scale.parts.written}, oral part {scale.parts.oral}. More in <a href="#/exam/1">About the exam</a>.</p>

    <h3 className="section-heading">How we teach</h3>
    <div className="methods">{METHODS.map(([t, x]) => <div className="methods__item" key={t}><b className="methods__title">{t}</b><p className="methods__text">{x}</p></div>)}</div>

    <h3 className="section-heading">Inside the textbook</h3>
    <ul className="numbers">{facts.map(([n, t]) => <li className="numbers__item" key={t}><b className="numbers__value">{n}</b>{t}</li>)}</ul>
    <p className="note">Every unit: vocabulary, memory cards, practice in Cambridge exam formats, and exam tasks for listening, reading, writing and speaking.</p>

    <h3 className="section-heading">Questions</h3>
    <div className="faq">{FAQ.map(([q, a]) => <details className="faq__item" key={q}><summary className="faq__question">{q}</summary><p className="faq__answer">{a}</p></details>)}</div>

    <div className="landing__final"><b className="landing__final-title">Ready to see where you are?</b><a className="cover__button" href="#/free">Try a free variant <span className="cover__button-arrow" aria-hidden="true">→</span></a></div>
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

/* ЛИЧНЫЕ КАБИНЕТЫ (МОДЕЛЬ). Данные — только через demo.ts.
   Ученик: «Next step» (одно главное действие), дни занятий за неделю, 5 разделов ЕГЭ кольцами, что повторить,
   домашние задания; подробности (все типы заданий, последние результаты) — под «Show details».
   Учитель: 3 цифры о классе, «Needs attention» (не больше трёх карточек с кнопкой действия), ученики с графиком
   и двумя слабыми местами, класс × 5 разделов цветной сеткой, карточка ученика по нажатию, выдача домашнего задания.
   Принципы: оценка по навыкам, а не только «N из M»; уровень — по нескольким попыткам; учителю — не цифры ради цифр,
   а подсказка, что делать дальше. */
import { useState } from "react";
import { Topic } from "../types";
import { SECTIONS, sectionOfType } from "../sections";
import { Homework, Result, Skill, User, ago, assign, homework, logout, markDone, results, skillLabel, skills, studentsOf } from "../demo";
import { listeningFor } from "./Listening";
import { readingFor } from "./Reading";
import { Banner } from "./ui";
import { play } from "../sound";

const DAY = 86400000;
const LEVEL = { strong: "strong", developing: "developing", weak: "needs work", new: "first try" };
const pct = (r: Result) => Math.round(100 * r.score / r.max);
const mean = (a: number[]) => a.length ? Math.round(a.reduce((x, y) => x + y, 0) / a.length) : null;
/** уровень по проценту — те же границы, что у навыков в demo.ts: ≥ 80 strong, < 60 needs work */
const levelOf = (v: number | null) => v === null ? "none" : v >= 80 ? "strong" : v < 60 ? "weak" : "developing";
/** короткое имя модуля: «Sport & Healthy Lifestyle» → «Sport» */
const short = (t: Topic) => t.title.split(":")[0].split(" &")[0];

/** Что можно задать или потренировать: вкладки разделов ЕГЭ во всех юнитах. skill — навык «раздел:тип» этой вкладки */
function tasksOf(topics: Topic[]) {
  return topics.flatMap(t => [...t.units.flatMap(u => {
    const l = listeningFor(t.id, u.num), r = readingFor(t.id, u.num);
    const speech = u.speech.flat().map((s: any) => [sectionOfType(s.type)?.id, s.type]);
    const items: { module: string; title: string; href: string; skills: string[] }[] = [];
    const add = (sec: string, label: string, sk: string[]) => items.push({ module: short(t), title: `${short(t)} · Unit ${u.num} · ${label}`, href: `#/${t.id}/unit/${u.num}/${sec}`, skills: sk });
    if (l) add("listening", "Listening", [`listening:${l.task}`]);
    if (r) add("reading", "Reading", [`reading:${r.task}`]);
    for (const sec of ["writing", "speaking"]) {
      const sk = speech.filter(([s]) => s === sec).map(([s, type]) => `${s}:${type}`);
      if (sk.length) add(sec, sec === "writing" ? "Writing" : "Speaking", sk);
    }
    return items;
  }), { module: short(t), title: `${short(t)} · Revision`, href: `#/${t.id}/revision`, skills: ["use-of-english:19", "use-of-english:25", "use-of-english:30", "reading:11"] }]);
}
/** Где потренировать навык: первое подходящее задание учебника */
export const practice = (skill: string, topics: Topic[]) => tasksOf(topics).find(x => x.skills.includes(skill));

/** Пять разделов ЕГЭ: средний процент последних пяти результатов раздела и изменение (последние 3 против трёх до них) */
function sectionsOf(rs: Result[]) {
  return SECTIONS.map(s => {
    const p = rs.filter(r => r.skill.startsWith(s.id + ":")).map(pct);
    const last = mean(p.slice(-3)), before = mean(p.slice(-6, -3));
    return { id: s.id, label: s.label, value: mean(p.slice(-5)), trend: p.length >= 4 && last !== null && before !== null ? last - before : 0 };
  });
}
/** короткая подпись навыка для меток: «EGE 38 · Project essay with data» */
const chip = (skill: string) => { const l = skillLabel(skill); return `EGE ${l.ege} · ${l.name.split(" · ")[1]}`; };

/** Линия результатов (проценты по порядку). big — крупный график в карточке ученика */
function Spark({ values, big }: { values: number[]; big?: boolean }) {
  if (values.length < 2) return <span className="spark spark--empty">—</span>;
  const w = 100, h = 32, x = (i: number) => (i / (values.length - 1)) * w, y = (v: number) => h - (v / 100) * h;
  const line = values.map((v, i) => `${x(i).toFixed(1)},${y(v).toFixed(1)}`).join(" ");
  return <svg className={`spark${big ? " spark--big" : ""}`} viewBox={`0 -2 ${w} ${h + 4}`} preserveAspectRatio="none" aria-hidden="true">
    <line className="spark__goal" x1="0" x2={w} y1={y(80)} y2={y(80)} />
    <polyline className="spark__area" points={`0,${h} ${line} ${w},${h}`} /><polyline className="spark__line" points={line} />
  </svg>;
}
/** Кольцо раздела: процент, уровень, изменение */
function Ring({ label, value, trend }: { label: string; value: number | null; trend: number }) {
  const c = 2 * Math.PI * 16;
  return <div className={`section-ring section-ring--${levelOf(value)}`}>
    <svg className="section-ring__svg" viewBox="0 0 40 40" aria-hidden="true"><circle className="section-ring__track" cx="20" cy="20" r="16" />
      {value !== null && <circle className="section-ring__value" cx="20" cy="20" r="16" strokeDasharray={`${(value / 100) * c} ${c}`} />}</svg>
    <b className="section-ring__number">{value === null ? "—" : `${value}%`}</b>
    <span className="section-ring__label">{label}</span>
    <span className="section-ring__note">{value === null ? "not tried yet" : trend > 0 ? `▲ ${trend}` : trend < 0 ? `▼ ${-trend}` : "steady"}</span>
  </div>;
}
/** Полоска навыка: название, номер ЕГЭ, процент, уровень, изменение */
function SkillRow({ s }: { s: Skill }) {
  const l = skillLabel(s.skill);
  return <div className={`skill skill--${s.level}`}>
    <span className="skill__name">{l.name} <span className="skill__ege">EGE {l.ege}</span></span>
    <span className="skill__bar"><i style={{ width: `${s.recent}%` }} /></span>
    <span className="skill__value">{s.recent}%</span>
    <span className="skill__level">{LEVEL[s.level]}{s.attempts > 1 && s.trend !== 0 && <em className={s.trend > 0 ? "skill__up" : "skill__down"}> {s.trend > 0 ? "▲" : "▼"} {Math.abs(s.trend)}</em>}</span>
  </div>;
}
/** Последние результаты */
const Recent = ({ rs }: { rs: Result[] }) => <ul className="recent">{rs.slice(-8).reverse().map((r, i) =>
  <li key={i} className="recent__item"><span className="recent__when">{ago(r.at)}</span><span className="recent__title">{r.title}</span><b className="recent__score">{r.score}/{r.max}</b></li>)}</ul>;
/** срок домашнего задания словами */
const dueText = (h: Homework) => { const d = Math.ceil((h.due - Date.now()) / DAY); return h.done ? "done" : d < 0 ? "overdue" : d === 0 ? "due today" : `due in ${d} day${d > 1 ? "s" : ""}`; };
/** Список домашних заданий; mark — ученик может отметить «Done» */
const HomeworkList = ({ hw, mark }: { hw: Homework[]; mark?: boolean }) => hw.length ? <ul className="homework">{hw.map(h =>
  <li key={h.id} className={`homework__item${h.done ? " homework__item--done" : ""}${!h.done && h.due < Date.now() ? " homework__item--late" : ""}`}><a href={h.href}>{h.title}</a>
    <span className="homework__due">{dueText(h)}</span>
    {mark && !h.done && <button className="button button--secondary" onClick={() => { markDone(h.id); play("pop"); }}>Done</button>}</li>)}</ul> : <p className="note">No homework.</p>;

/** Кабинет ученика */
function StudentCabinet({ user, topics }: { user: User; topics: Topic[] }) {
  const rs = results(user.id), sk = skills(rs), hw = homework(user.id), open = hw.filter(h => !h.done);
  // повторить: слабые навыки (не больше трёх); если слабых нет — самый низкий из развивающихся
  const review = sk.filter(s => s.level === "weak").slice(0, 3);
  if (!review.length && sk[0] && sk[0].level === "developing") review.push(sk[0]);
  // следующий шаг: ближайшее домашнее задание, иначе самое слабое место, иначе вариант ЕГЭ
  const weakest = review[0] && practice(review[0].skill, topics);
  const next = open[0] ? { kick: `Homework · ${dueText(open[0])}`, title: open[0].title, href: open[0].href, go: "Start" }
    : weakest ? { kick: `Review · ${review[0].recent}% so far`, title: skillLabel(review[0].skill).name, href: weakest.href, go: "Practise" }
    : { kick: "Check your level", title: "Try a practice test", href: "#/free", go: "Open" };
  // дни занятий: последние 7 дней, сегодня — справа
  const days = Array.from({ length: 7 }, (_, i) => { const start = new Date(); start.setHours(0, 0, 0, 0); const t = start.getTime() - (6 - i) * DAY;
    return { label: new Date(t).toLocaleDateString("en-GB", { weekday: "narrow" }), on: rs.some(r => r.at >= t && r.at < t + DAY) }; });
  return <>
    <div className="cabinet-top">
      <a className="next-step" href={next.href}><span className="next-step__kick">{next.kick}</span><b className="next-step__title">{next.title}</b><span className="next-step__go">{next.go} →</span></a>
      <div className="week"><span className="week__title">This week</span><div className="week__days">{days.map((d, i) => <span key={i} className={`week__day${d.on ? " week__day--on" : ""}`}>{d.label}</span>)}</div>
        <span className="week__note">{days.filter(d => d.on).length} of 7 days with practice</span></div>
    </div>
    <h3 className="section-heading">My exam sections</h3>
    {rs.length ? <><div className="section-rings">{sectionsOf(rs).map(s => <Ring key={s.id} {...s} />)}</div>
      <p className="note">Average of your last five results in each section; ▲▼ — change since the three results before.</p></>
      : <p className="cabinet-empty">No results yet. Check any task in the textbook or a practice test, and your scores by exam section will appear here.</p>}
    {review.length > 0 && <><h3 className="section-heading">Review next</h3>
      <ul className="focus-list">{review.map(s => { const p = practice(s.skill, topics);
        return <li key={s.skill} className="focus-list__item"><span><b>{skillLabel(s.skill).name}</b> <span className="focus-list__meta">EGE {skillLabel(s.skill).ege} · {s.recent}%</span></span>{p && <a className="focus-list__go" href={p.href}>Practise →</a>}</li>; })}</ul></>}
    <h3 className="section-heading">Homework</h3><HomeworkList hw={hw} mark />
    {rs.length > 0 && <details className="details"><summary className="details__summary">Show details: every task type and recent results</summary>
      <p className="note">Based on your last three attempts at each kind of task. One bad try won't make a skill “needs work”.</p>
      <div className="skills">{sk.map(s => <SkillRow key={s.skill} s={s} />)}</div>
      <h4 className="student-card__heading">Recent results</h4><Recent rs={rs} />
    </details>}
  </>;
}

/** Кабинет учителя */
function TeacherCabinet({ user, topics }: { user: User; topics: Topic[] }) {
  const now = Date.now();
  const students = studentsOf(user.id).map(u => { const rs = results(u.id), sk = skills(rs); return { u, rs, sk, hw: homework(u.id), sec: sectionsOf(rs), avg: mean(rs.slice(-10).map(pct)), last: rs[rs.length - 1]?.at ?? 0 }; });
  const tasks = tasksOf(topics);
  const [open, setOpen] = useState<string | null>(null);
  const [to, setTo] = useState("all"), [what, setWhat] = useState(0), [days, setDays] = useState(7), [sent, setSent] = useState("");
  /** заполнить форму домашнего задания и прокрутить к ней (кнопки в «Needs attention» и в карточке ученика) */
  const prefill = (who: string, skill?: string) => { setTo(who); const i = skill ? tasks.findIndex(t => t.skills.includes(skill)) : -1; if (i >= 0) setWhat(i); setSent("");
    document.getElementById("set-homework")?.scrollIntoView({ behavior: "smooth", block: "center" }); };
  function give() {
    const t = tasks[what], who = to === "all" ? students.map(s => s.u) : students.filter(s => s.u.id === to).map(s => s.u);
    who.forEach(u => assign({ to: u.id, title: t.title, href: t.href, due: Date.now() + days * DAY }));
    setSent(`${t.title} → ${who.map(u => u.name).join(", ")}`);
  }

  // три цифры о классе: средний процент (последние 2 недели, изменение к двум неделям до них), занимались за неделю, домашние задания
  const inWindow = (from: number, to: number) => students.flatMap(s => s.rs.filter(r => now - r.at >= from * DAY && now - r.at < to * DAY).map(pct));
  const avgNow = mean(inWindow(0, 14)), avgBefore = mean(inWindow(14, 28));
  const active = students.filter(s => now - s.last < 7 * DAY).length;
  const started = students.some(s => s.rs.length); // есть ли у класса хоть один результат
  const hwAll = students.flatMap(s => s.hw), hwLate = hwAll.filter(h => !h.done && h.due < now).length;

  // «Needs attention»: просрочено → давно не занимался → общая слабая зона; показываем не больше трёх. Отдельно — кого похвалить
  type Alert = { kind: "late" | "idle" | "class"; text: string; action: string; run: () => void };
  const alerts: Alert[] = [];
  for (const s of students) { const late = s.hw.filter(h => !h.done && h.due < now); if (late.length) alerts.push({ kind: "late", text: `${s.u.name}: overdue homework — ${late.map(h => h.title).join(", ")}`, action: "Open", run: () => setOpen(s.u.id) }); }
  // «лёгкое задание» — по самому сильному навыку ученика (skills отсортированы от слабого к сильному)
  for (const s of students) { const d = Math.floor((now - s.last) / DAY); const easy = [...s.sk].reverse().find(x => practice(x.skill, topics));
    if (s.rs.length && d >= 5) alerts.push({ kind: "idle", text: `${s.u.name} has not practised for ${d} days`, action: "Set an easy task", run: () => prefill(s.u.id, easy?.skill) }); }
  const shared = [...new Set(students.flatMap(s => s.sk.map(x => x.skill)))].map(k => ({ k, who: students.filter(s => s.sk.find(x => x.skill === k)?.level === "weak") }))
    .filter(x => x.who.length >= 2).sort((a, b) => b.who.length - a.who.length);
  for (const x of shared) alerts.push({ kind: "class", text: `${skillLabel(x.k).name} is weak for ${x.who.map(s => s.u.name).join(" and ")}`, action: "Set for the class", run: () => prefill("all", x.k) });
  const praise = students.map(s => ({ s, up: s.sk.filter(x => x.attempts > 1 && x.trend >= 15).sort((a, b) => b.trend - a.trend)[0] })).filter(x => x.up);
  const ICON = { late: "⏰", idle: "💤", class: "◎" };

  return <>
    <div className="kpis">
      <div className="kpi"><span className="kpi__label">Class average</span><b className="kpi__value">{avgNow ?? "—"}{avgNow !== null && "%"}</b>
        <span className="kpi__note">{avgNow !== null && avgBefore !== null ? `${avgNow >= avgBefore ? "▲" : "▼"} ${Math.abs(avgNow - avgBefore)} vs the two weeks before` : "last two weeks"}</span></div>
      <div className="kpi"><span className="kpi__label">Practised this week</span><b className="kpi__value">{active} <small>of {students.length}</small></b><span className="kpi__note">students</span></div>
      <div className="kpi"><span className="kpi__label">Homework</span><b className="kpi__value">{hwAll.filter(h => h.done).length} <small>of {hwAll.length} done</small></b><span className={`kpi__note${hwLate ? " kpi__note--bad" : ""}`}>{hwLate ? `${hwLate} overdue` : "nothing overdue"}</span></div>
    </div>

    <h3 className="section-heading">Needs attention</h3>
    {alerts.length ? <ul className="alerts">{alerts.slice(0, 3).map(a => <li key={a.text} className={`alert alert--${a.kind}`}><span className="alert__icon" aria-hidden="true">{ICON[a.kind]}</span>
      <span className="alert__text">{a.text}</span><button className="button button--secondary" onClick={a.run}>{a.action}</button></li>)}</ul>
      : <p className="note">Nothing needs attention right now.</p>}
    {!started && <p className="cabinet-empty">No results yet. When your students check tasks on the site, their scores, weak spots and progress appear here. Start by setting homework below.</p>}
    {praise.length > 0 && <p className="cabinet-praise">👏 Worth praising: {praise.map(({ s, up }) => `${s.u.name} (${chip(up!.skill)}, +${up!.trend}%)`).join(" · ")}</p>}

    <h3 className="section-heading">Students</h3>
    <ul className="students">{students.map(s => { const weak = s.sk.filter(x => x.level === "weak").slice(0, 2);
      return <li key={s.u.id}><button className={`student-row${open === s.u.id ? " student-row--open" : ""}`} aria-expanded={open === s.u.id} onClick={() => setOpen(open === s.u.id ? null : s.u.id)}>
        <b className="student-row__avatar" aria-hidden="true">{s.u.name[0]}</b>
        <span className="student-row__who"><b className="student-row__name">{s.u.name}</b><span className="student-row__last">{s.rs.length ? `active ${ago(s.last)}` : "no activity yet"}</span></span>
        <Spark values={s.rs.slice(-12).map(pct)} />
        <b className={`student-row__avg student-row__avg--${levelOf(s.avg)}`}>{s.avg ?? "—"}{s.avg !== null && "%"}</b>
        <span className="student-row__weak">{weak.length ? weak.map(x => <span key={x.skill} className="tag tag--weak">{chip(x.skill)}</span>) : s.rs.length > 0 && <span className="tag tag--ok">no weak spots</span>}</span>
      </button>
      {open === s.u.id && <div className="student-card">
        <div className="student-card__chart"><span className="note">Last {Math.min(20, s.rs.length)} results, % (dotted line — 80 %)</span><Spark values={s.rs.slice(-20).map(pct)} big /></div>
        <div className="section-rings section-rings--small">{s.sec.map(x => <Ring key={x.id} {...x} />)}</div>
        <h4 className="student-card__heading">Work on next</h4>
        {s.sk.filter(x => x.level === "weak" || x.level === "developing").slice(0, 3).map(x => { const p = practice(x.skill, topics);
          return <div key={x.skill} className="focus-list__item"><span><b>{skillLabel(x.skill).name}</b> <span className="focus-list__meta">EGE {skillLabel(x.skill).ege} · {x.recent}%</span></span>
            {p && <button className="focus-list__go" onClick={() => prefill(s.u.id, x.skill)}>Set as homework →</button>}</div>; })}
        <h4 className="student-card__heading">Homework</h4><HomeworkList hw={s.hw} />
        <details className="details"><summary className="details__summary">Every task type and recent results</summary>
          <div className="skills">{s.sk.map(x => <SkillRow key={x.skill} s={x} />)}</div><Recent rs={s.rs} /></details>
      </div>}</li>; })}</ul>

    {started && <><h3 className="section-heading">Class by exam section</h3>
    <div className="cabinet-scroll"><table className="heat"><thead><tr><th />{SECTIONS.map(s => <th key={s.id}>{s.label}</th>)}</tr></thead>
      <tbody>{students.map(s => <tr key={s.u.id}><th>{s.u.name}</th>{s.sec.map(x => <td key={x.id} className={`heat__cell heat__cell--${levelOf(x.value)}`}>{x.value === null ? "—" : `${x.value}%`}</td>)}</tr>)}
        <tr className="heat__total"><th>Class</th>{SECTIONS.map((sec, i) => { const v = mean(students.map(s => s.sec[i].value).filter((x): x is number => x !== null));
          return <td key={sec.id} className={`heat__cell heat__cell--${levelOf(v)}`}>{v === null ? "—" : `${v}%`}</td>; })}</tr></tbody></table></div>
    <p className="heat__legend"><span className="heat__key heat__key--strong" />80 % and more <span className="heat__key heat__key--developing" />60–79 % <span className="heat__key heat__key--weak" />under 60 %</p></>}

    <h3 className="section-heading" id="set-homework">Set homework</h3>
    <div className="exercise assign">
      <label className="assign__field">To <select value={to} onChange={e => setTo(e.target.value)}><option value="all">the whole class</option>{students.map(s => <option key={s.u.id} value={s.u.id}>{s.u.name}</option>)}</select></label>
      <label className="assign__field assign__field--wide">Task <select value={what} onChange={e => setWhat(Number(e.target.value))}>
        {[...new Set(tasks.map(t => t.module))].map(m => <optgroup key={m} label={m}>{tasks.map((t, i) => t.module === m && <option key={i} value={i}>{t.title.slice(m.length + 3)}</option>)}</optgroup>)}</select></label>
      <label className="assign__field">Due in <select value={days} onChange={e => setDays(Number(e.target.value))}>{[2, 3, 7, 14].map(d => <option key={d} value={d}>{d} days</option>)}</select></label>
      <button className="button button--primary" onClick={give}>Set</button>
      {sent && <p className="note assign__sent">✓ Set: {sent}</p>}
    </div>
  </>;
}

/** Кабинет: какой — зависит от роли вошедшего. Без входа — приглашение войти */
export default function Cabinet({ user, topics }: { user: User | null; topics: Topic[] }) {
  if (!user) return <section className="page"><Banner kick="My account" title="Please log in" pics={["admission_tickets"]} /><a className="button button--primary" href="#/login">Log in</a></section>;
  const teacher = user.role === "teacher";
  return <section className="page cabinet">
    <Banner kick={teacher ? "Teacher's account" : "Student's account"} title={`Hi, ${user.name}!`} lede={teacher ? "Who needs help, with what, and what to set next" : "Your next step, your progress and your homework"} pics={teacher ? ["bar_chart", "clipboard"] : ["chart_increasing", "bullseye"]} />
    <p className="cabinet__actions"><a className="button button--secondary" href="#/book">Textbook</a> <a className="button button--secondary" href="#/free">Practice tests</a> <button className="button button--secondary" onClick={() => { logout(); location.hash = "#/"; }}>Log out</button></p>
    {teacher ? <TeacherCabinet user={user} topics={topics} /> : <StudentCabinet user={user} topics={topics} />}
    <p className="note">Demo model: progress is stored only in this browser.</p>
  </section>;
}

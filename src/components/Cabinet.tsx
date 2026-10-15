/* ЛИЧНЫЕ КАБИНЕТЫ (МОДЕЛЬ). Данные — только через demo.ts.
   Ученик: домашние задания, «Review today» (слабые навыки со ссылкой на задание), навыки, последние результаты.
   Учитель: таблица класса, карта «ученик × навык», подсказки по классу, карточка ученика, выдача домашнего задания.
   Принципы: оценка по навыкам, а не только «N из M»; уровень — по нескольким попыткам; учителю — не только цифры,
   но и подсказка, что делать дальше; повторение слабого — с возвратом к нему через несколько дней. */
import { useState } from "react";
import { Topic } from "../types";
import { SECTIONS, sectionOfType } from "../sections";
import { Homework, Result, Skill, User, ago, assign, homework, logout, markDone, results, skillLabel, skills, studentsOf } from "../demo";
import { listeningFor } from "./Listening";
import { readingFor } from "./Reading";
import { Banner } from "./ui";

const LEVEL = { strong: "strong", developing: "developing", weak: "needs work", new: "first try" };
const pct = (r: Result) => Math.round(100 * r.score / r.max);

/** Что можно задать или потренировать: вкладки разделов ЕГЭ во всех юнитах. skill — навык «раздел:тип» этой вкладки */
function tasksOf(topics: Topic[]) {
  return topics.flatMap(t => t.units.flatMap(u => {
    const l = listeningFor(t.id, u.num), r = readingFor(t.id, u.num);
    const speech = u.speech.flat().map((s: any) => [sectionOfType(s.type)?.id, s.type]);
    const items: { title: string; href: string; skills: string[] }[] = [];
    if (l) items.push({ title: `Unit ${u.num} · Listening`, href: `#/${t.id}/unit/${u.num}/listening`, skills: [`listening:${l.task}`] });
    if (r) items.push({ title: `Unit ${u.num} · Reading`, href: `#/${t.id}/unit/${u.num}/reading`, skills: [`reading:${r.task}`] });
    for (const sec of ["writing", "speaking"]) {
      const sk = speech.filter(([s]) => s === sec).map(([s, type]) => `${s}:${type}`);
      if (sk.length) items.push({ title: `Unit ${u.num} · ${sec === "writing" ? "Writing" : "Speaking"}`, href: `#/${t.id}/unit/${u.num}/${sec}`, skills: sk });
    }
    return items;
  })).concat(topics.map(t => ({ title: `${t.title.split(":")[0].split(" &")[0]} · Revision`, href: `#/${t.id}/revision`, skills: ["use-of-english:19", "use-of-english:25", "use-of-english:30", "reading:11"] })));
}
/** Где потренировать навык: первое подходящее задание учебника */
export const practice = (skill: string, topics: Topic[]) => tasksOf(topics).find(x => x.skills.includes(skill));

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

/** Список домашних заданий; mark — ученик может отметить «Done» */
const HomeworkList = ({ hw, mark }: { hw: Homework[]; mark?: boolean }) => hw.length ? <ul className="homework">{hw.map(h => {
  const days = Math.ceil((h.due - Date.now()) / 86400000);
  return <li key={h.id} className={`homework__item${h.done ? " homework__item--done" : ""}`}><a href={h.href}>{h.title}</a>
    <span className="homework__due">{h.done ? "done" : days < 0 ? "overdue" : days === 0 ? "due today" : `due in ${days} day${days > 1 ? "s" : ""}`}</span>
    {mark && !h.done && <button className="button button--secondary" onClick={() => markDone(h.id)}>Done</button>}</li>;
})}</ul> : <p className="note">No homework.</p>;

/** Кабинет ученика */
function StudentCabinet({ user, topics }: { user: User; topics: Topic[] }) {
  const rs = results(user.id), sk = skills(rs);
  // повторить сегодня: слабые навыки (не больше трёх); если слабых нет — самый низкий из развивающихся
  const review = sk.filter(s => s.level === "weak").slice(0, 3);
  if (!review.length && sk[0] && sk[0].level === "developing") review.push(sk[0]);
  return <>
    <h3 className="section-heading">Homework</h3><HomeworkList hw={homework(user.id)} mark />
    <h3 className="section-heading">Review today</h3>
    {review.length ? <ul className="review-list">{review.map(s => { const p = practice(s.skill, topics); return <li key={s.skill}><b>{skillLabel(s.skill).name}</b> · {s.recent}% {p && <a href={p.href}>practise: {p.title} →</a>}</li>; })}</ul>
      : <p className="note">{sk.length ? "Nothing urgent: keep practising new tasks." : "Do a Listening or Reading task in the textbook to see your skills here."}</p>}
    <h3 className="section-heading">My skills</h3>
    <p className="note">Based on your last three attempts at each kind of task. One bad try won't make a skill “needs work”.</p>
    <div className="skills">{sk.map(s => <SkillRow key={s.skill} s={s} />)}</div>
    <h3 className="section-heading">Recent results</h3><Recent rs={rs} />
  </>;
}

/** Кабинет учителя */
function TeacherCabinet({ user, topics }: { user: User; topics: Topic[] }) {
  const students = studentsOf(user.id).map(u => { const rs = results(u.id); return { u, rs, sk: skills(rs) }; });
  const [open, setOpen] = useState<string | null>(null);
  // все навыки класса в порядке разделов из sections.json
  const order = SECTIONS.flatMap(s => Object.keys(s.types).map(t => `${s.id}:${t}`));
  const cols = order.filter(k => students.some(s => s.sk.some(x => x.skill === k)));
  // подсказки: общая слабая зона, давно не занимался, заметный рост, просроченное домашнее задание
  const tips: string[] = [];
  for (const k of cols) {
    const weak = students.filter(s => s.sk.find(x => x.skill === k)?.level === "weak").map(s => s.u.name);
    if (weak.length >= 2) tips.push(`${skillLabel(k).name}: needs work for ${weak.join(", ")}. Worth a whole-class lesson on this task type.`);
  }
  for (const s of students) {
    const last = s.rs[s.rs.length - 1]?.at ?? 0, days = Math.floor((Date.now() - last) / 86400000);
    if (days >= 5) tips.push(`${s.u.name} has not practised for ${days} days. A short message or an easy task may help to restart.`);
    const up = s.sk.filter(x => x.attempts > 1 && x.trend >= 15).sort((a, b) => b.trend - a.trend)[0];
    if (up) tips.push(`${s.u.name} improved in ${skillLabel(up.skill).name} (+${up.trend}%). Praise the progress.`);
    const late = homework(s.u.id).filter(h => !h.done && h.due < Date.now());
    if (late.length) tips.push(`${s.u.name}: ${late.length} overdue homework.`);
  }
  const avg = (rs: Result[]) => rs.length ? Math.round(rs.slice(-10).reduce((a, r) => a + pct(r), 0) / Math.min(10, rs.length)) : 0;
  const week = (rs: Result[]) => rs.filter(r => Date.now() - r.at < 7 * 86400000).length;

  // выдача домашнего задания
  const tasks = tasksOf(topics);
  const [to, setTo] = useState("all"), [what, setWhat] = useState(0), [days, setDays] = useState(7), [sent, setSent] = useState("");
  function give() {
    const t = tasks[what], who = to === "all" ? students.map(s => s.u) : students.filter(s => s.u.id === to).map(s => s.u);
    who.forEach(u => assign({ to: u.id, title: t.title, href: t.href, due: Date.now() + days * 86400000 }));
    setSent(`${t.title} → ${who.map(u => u.name).join(", ")}`);
  }

  return <>
    <h3 className="section-heading">Class · {students.length} students</h3>
    <div className="cabinet-scroll"><table className="class-table"><thead><tr><th>Student</th><th>Last activity</th><th>Tasks this week</th><th>Average</th><th>Needs work</th></tr></thead>
      <tbody>{students.map(s => <tr key={s.u.id}><td><button className="class-table__name" onClick={() => setOpen(open === s.u.id ? null : s.u.id)}>{s.u.name}</button></td>
        <td>{s.rs.length ? ago(s.rs[s.rs.length - 1].at) : "—"}</td><td>{week(s.rs)}</td><td>{avg(s.rs)}%</td>
        <td>{s.sk.filter(x => x.level === "weak").map(x => skillLabel(x.skill).name).join("; ") || "—"}</td></tr>)}</tbody></table></div>

    {open && (() => { const s = students.find(x => x.u.id === open)!; return <div className="exercise student-card">
      <b className="student-card__name">{s.u.name}</b>
      <p className="note">Strong: {s.sk.filter(x => x.level === "strong").map(x => skillLabel(x.skill).name).join("; ") || "—"}</p>
      <div className="skills">{s.sk.map(x => <SkillRow key={x.skill} s={x} />)}</div>
      <h4 className="student-card__heading">Homework</h4><HomeworkList hw={homework(s.u.id)} />
      <h4 className="student-card__heading">Recent results</h4><Recent rs={s.rs} />
    </div>; })()}

    <h3 className="section-heading">Skills map</h3>
    <p className="note">Average of the last three attempts. Click a name in the table above for details.</p>
    <div className="cabinet-scroll"><table className="skills-map"><thead><tr><th />{cols.map(k => <th key={k} title={skillLabel(k).name}>EGE {skillLabel(k).ege}<small>{k.split(":")[0]}</small></th>)}</tr></thead>
      <tbody>{students.map(s => <tr key={s.u.id}><th>{s.u.name}</th>{cols.map(k => { const x = s.sk.find(y => y.skill === k);
        return <td key={k} className={x ? `skills-map__cell skills-map__cell--${x.level}` : "skills-map__cell"}>{x ? `${x.recent}%` : ""}</td>; })}</tr>)}</tbody></table></div>

    <h3 className="section-heading">What to do next</h3>
    {tips.length ? <ul className="review-list">{tips.map(t => <li key={t}>{t}</li>)}</ul> : <p className="note">Nothing needs attention.</p>}

    <h3 className="section-heading">Set homework</h3>
    <div className="exercise assign">
      <label className="assign__field">To <select value={to} onChange={e => setTo(e.target.value)}><option value="all">the whole class</option>{students.map(s => <option key={s.u.id} value={s.u.id}>{s.u.name}</option>)}</select></label>
      <label className="assign__field">Task <select value={what} onChange={e => setWhat(Number(e.target.value))}>{tasks.map((t, i) => <option key={i} value={i}>{t.title}</option>)}</select></label>
      <label className="assign__field">Due in <select value={days} onChange={e => setDays(Number(e.target.value))}>{[2, 3, 7, 14].map(d => <option key={d} value={d}>{d} days</option>)}</select></label>
      <button className="button button--primary" onClick={give}>Set</button>
      {sent && <p className="note">Set: {sent}</p>}
    </div>
  </>;
}

/** Кабинет: какой — зависит от роли вошедшего. Без входа — приглашение войти */
export default function Cabinet({ user, topics }: { user: User | null; topics: Topic[] }) {
  if (!user) return <section className="page"><Banner kick="My account" title="Please log in" pics={["admission_tickets"]} /><a className="button button--primary" href="#/login">Log in</a></section>;
  const teacher = user.role === "teacher";
  return <section className="page">
    <Banner kick={teacher ? "Teacher's account" : "Student's account"} title={`Hi, ${user.name}!`} lede={teacher ? "Your class at a glance: progress, strengths and weak points" : "Your homework, your skills and what to review today"} pics={teacher ? ["bar_chart", "clipboard"] : ["chart_increasing", "bullseye"]} />
    <p className="cabinet__actions"><a className="button button--secondary" href="#/book">Textbook</a> <a className="button button--secondary" href="#/free">EGE variants</a> <button className="button button--secondary" onClick={() => { logout(); location.hash = "#/"; }}>Log out</button></p>
    {teacher ? <TeacherCabinet user={user} topics={topics} /> : <StudentCabinet user={user} topics={topics} />}
    <p className="note">Demo model: progress is stored only in this browser.</p>
  </section>;
}

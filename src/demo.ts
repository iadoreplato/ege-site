/* КАБИНЕТЫ (МОДЕЛЬ). Единственное место, где хранится всё про учеников и учителя: кто вошёл, результаты заданий,
   домашние задания. Сейчас это демо: вход без пароля, данные лежат только в этом браузере (localStorage),
   на сервер ничего не уходит. Пользователи и история занятий для примера — src/content/demo.json.
   Когда появится настоящий сервер, меняется только этот файл: страницы зовут те же функции. */
import { useEffect, useState } from "react";
import data from "./content/demo.json";
import { egeNumber, sectionById } from "./sections";

/** Пользователь: role — ученик или учитель; teacher — id учителя, к которому привязан ученик */
export type User = { id: string; name: string; role: "student" | "teacher"; teacher?: string };
/** Результат одного задания: skill — навык «раздел:тип» ("listening:3"), at — когда (мс), title — что делали, href — ссылка */
export type Result = { user: string; at: number; skill: string; title: string; score: number; max: number; href?: string };
/** Домашнее задание: to — кому, title и href — что и где, due — срок (мс), done — ученик отметил, что сделал */
export type Homework = { id: string; to: string; title: string; href: string; due: number; done?: boolean };

const DAY = 86400000;
export const USERS = data.users as User[];
const NOW = Date.now();
/** история из demo.json: «daysAgo» превращается в дату относительно сегодняшнего дня */
const SEED: Result[] = data.results.map(r => ({ user: r.user, at: NOW - r.daysAgo * DAY, skill: r.skill, title: r.title, score: r.score, max: r.max }));
const SEED_HW: Homework[] = data.homework.map((h, i) => ({ id: `seed-${i}`, to: h.to, title: h.title, href: h.href, due: NOW + h.daysLeft * DAY }));

/* память браузера; в приватном режиме недоступна — тогда модель работает, но ничего не запоминает */
const get = <T,>(k: string, empty: T): T => { try { return JSON.parse(localStorage.getItem(k) ?? "null") ?? empty; } catch { return empty; } };
const put = (k: string, v: unknown) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* private mode */ } };
/** сообщить открытым страницам, что данные изменились (шапка, кабинет перерисуются) */
const changed = () => window.dispatchEvent(new Event("demo-change"));

/** Кто вошёл (или null) */
export const currentUser = () => USERS.find(u => u.id === get<string | null>("demo:user", null)) ?? null;
export const login = (id: string) => { put("demo:user", id); changed(); };
export const logout = () => { try { localStorage.removeItem("demo:user"); } catch { /* ok */ } changed(); };
/** Хук: текущий пользователь; компонент перерисуется после входа, выхода и новых результатов */
export function useUser() {
  const [, tick] = useState(0);
  useEffect(() => { const f = () => tick(n => n + 1); window.addEventListener("demo-change", f); return () => window.removeEventListener("demo-change", f); }, []);
  return currentUser();
}

/** Записать результат вошедшего ученика (учитель и гость ничего не записывают) */
export function record(r: Omit<Result, "user" | "at">) {
  const u = currentUser();
  if (u?.role !== "student") return;
  put("demo:results", [...get<Result[]>("demo:results", []), { ...r, user: u.id, at: Date.now() }]);
  changed();
}
/** Все результаты ученика по времени: история из demo.json + то, что он сделал на сайте */
export const results = (user: string) => [...SEED, ...get<Result[]>("demo:results", [])].filter(r => r.user === user).sort((a, b) => a.at - b.at);
/** Ученики учителя */
export const studentsOf = (teacher: string) => USERS.filter(u => u.teacher === teacher);

/** Домашние задания ученика: из demo.json и заданные учителем на сайте; отметки «сделано» */
export function homework(user: string): Homework[] {
  const done = get<string[]>("demo:hw-done", []);
  return [...SEED_HW, ...get<Homework[]>("demo:homework", [])].filter(h => h.to === user).map(h => ({ ...h, done: done.includes(h.id) })).sort((a, b) => a.due - b.due);
}
export function assign(h: Omit<Homework, "id">) { put("demo:homework", [...get<Homework[]>("demo:homework", []), { ...h, id: `hw-${Date.now()}-${h.to}` }]); changed(); }
export function markDone(id: string) { put("demo:hw-done", [...get<string[]>("demo:hw-done", []), id]); changed(); }

/* НАВЫКИ И УРОВНИ. Навык = раздел и тип задания из sections.json. Оценка — по последним трём попыткам:
   одна неудачная попытка не делает навык «слабым», а уровень меняется, когда ученик действительно стал лучше */
/** «Listening · Interview: multiple choice» и номер ЕГЭ «3–9» */
export function skillLabel(skill: string) {
  const [sec, type] = skill.split(":"), s = sectionById(sec);
  return { name: `${s.label} · ${s.types[type] ?? type}`, ege: egeNumber(s, type) };
}
export type Level = "strong" | "developing" | "weak" | "new";
/** Навык ученика: attempts — сколько попыток; recent — средний процент последних трёх; trend — изменение
    от первой к последней из них (в процентах); level: ≥ 80 % — strong, < 60 % — weak, одна попытка — new */
export type Skill = { skill: string; attempts: number; recent: number; trend: number; level: Level; last: number };
export function skills(rs: Result[]): Skill[] {
  const by: Record<string, Result[]> = {};
  rs.forEach(r => (by[r.skill] ??= []).push(r));
  return Object.entries(by).map(([skill, list]) => {
    const pct = list.slice(-3).map(r => Math.round(100 * r.score / r.max));
    const recent = Math.round(pct.reduce((a, b) => a + b, 0) / pct.length);
    const level: Level = list.length < 2 ? "new" : recent >= 80 ? "strong" : recent < 60 ? "weak" : "developing";
    return { skill, attempts: list.length, recent, trend: pct[pct.length - 1] - pct[0], level, last: list[list.length - 1].at };
  }).sort((a, b) => a.recent - b.recent);
}
/** «3 days ago», «today» */
export const ago = (t: number) => { const d = Math.floor((Date.now() - t) / DAY); return d <= 0 ? "today" : d === 1 ? "yesterday" : `${d} days ago`; };

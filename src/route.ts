/* АДРЕСА СТРАНИЦ. Какая страница открыта, хранится в адресе после «#», например #/sport/unit/3/practice.
   Благодаря этому работают кнопка «Назад» в браузере и ссылки на конкретный юнит.
   Здесь два перевода: адрес → описание страницы (View) и обратно, плюс названия страниц для меню. */
import { Topic, Universal } from "./types";
import { SECTIONS } from "./sections";

/** Which page is open. Unit numbers and exam pages are stored as array indexes.
    Описание открытой страницы. Поле k (kind) — вид страницы:
    landing — главная с двумя разделами; free — домашняя страница бесплатных вариантов ЕГЭ;
    variant — вариант ЕГЭ i (с нуля), вкладка tab (раздел или итог, VTABS); login — вход (пока демо); cabinet — личный кабинет;
    home — обложка учебника; u — страница раздела «The exam»; bank — банк сравнений; unit — юнит; rev — итоговый Revision;
    review — мини-повторение. t — номер модуля, i — номер страницы/юнита, tab — номер вкладки.
    Все номера здесь с нуля (как в массиве), а в адресе — с единицы. */
export type View =
  | { k: "landing" }
  | { k: "free" }
  | { k: "variant"; i: number; tab: number }
  | { k: "login" }
  | { k: "cabinet" }
  | { k: "home" }
  | { k: "u"; i: number }
  | { k: "bank"; t: number }
  | { k: "unit"; t: number; i: number; tab: number }
  | { k: "rev"; t: number }
  | { k: "review"; t: number; i: number };

/** Названия вкладок юнита в адресе. Номер вкладки = позиция в этом массиве (0 — vocabulary).
    После первых трёх — разделы ЕГЭ из sections.json: listening, reading, use-of-english, writing, speaking */
export const TABS = ["vocabulary", "memorise", "practice", ...SECTIONS.map(s => s.id)];
/** Вкладки варианта ЕГЭ в адресе: разделы из sections.json и итог */
export const VTABS = [...SECTIONS.map(s => s.id), "result"];
/** Старые адреса вкладок: Exam tasks больше нет, такие ссылки открывают Speaking */
const OLD_TABS: Record<string, string> = { "exam-tasks": "speaking" };

/** View → address after "#", e.g. "/sport/unit/3/practice"
    Описание страницы → адрес. Вкладка 0 (Vocabulary) в адрес не пишется */
export function toHash(v: View, topics: Topic[]): string {
  switch (v.k) {
    case "landing": return "/";
    case "free": return "/free";
    case "variant": return `/free/variant/${v.i + 1}${v.tab ? `/${VTABS[v.tab]}` : ""}`;
    case "login": return "/login";
    case "cabinet": return "/cabinet";
    case "home": return "/book";
    case "u": return `/exam/${v.i + 1}`;
    case "bank": return `/${topics[v.t].id}/bank`;
    case "unit": return `/${topics[v.t].id}/unit/${v.i + 1}${v.tab ? `/${TABS[v.tab]}` : ""}`;
    case "rev": return `/${topics[v.t].id}/revision`;
    case "review": return `/${topics[v.t].id}/review/${v.i + 1}`;
  }
}

/** Страницы с постоянным адресом (без номеров): адрес → описание страницы */
const PAGES: Record<string, View> = { free: { k: "free" }, login: { k: "login" }, cabinet: { k: "cabinet" }, book: { k: "home" } };

/** Address → View; anything unknown or out of range opens the home page
    Адрес → описание страницы. Адрес делится по «/» на части a, b, c, d: например sport / unit / 3 / practice.
    Если такой страницы нет (неизвестный модуль, юнит 99), открывается главная */
export function fromHash(hash: string, topics: Topic[], universal: Universal): View {
  const [a, b, c, d] = hash.replace(/^#?\/?/, "").split("/"); // убрать «#/» в начале и разрезать по «/»
  if (a === "free" && b === "variant" && Number(c) >= 1) return { k: "variant", i: Number(c) - 1, tab: Math.max(0, VTABS.indexOf(d)) };
  if (PAGES[a]) return PAGES[a]; // страницы без номеров: free, login, cabinet, book
  if (a === "exam" && universal.pages[Number(b) - 1]) return { k: "u", i: Number(b) - 1 };
  const t = topics.findIndex(x => x.id === a); // номер модуля по его id; -1, если не найден
  if (t < 0) return { k: "landing" };
  if (b === "bank") return { k: "bank", t };
  if (b === "revision") return { k: "rev", t };
  if (b === "review" && topics[t].reviews?.[Number(c) - 1]) return { k: "review", t, i: Number(c) - 1 };
  const i = Number(c) - 1;
  // неизвестная вкладка (indexOf вернёт -1) → вкладка 0
  if (b === "unit" && topics[t].units[i]) return { k: "unit", t, i, tab: Math.max(0, TABS.indexOf(OLD_TABS[d] ?? d)) };
  return { k: "landing" };
}

/** Page of the paid textbook (needs a login)
    Страница учебника (платная часть): открывается только после входа. Раздел «The exam» и варианты — бесплатные */
export const isBook = (v: View) => ["home", "bank", "unit", "rev", "review"].includes(v.k);

/** Human-readable name of a page, for the "Continue" button and the browser tab
    Название страницы для людей: для кнопки «Continue» на обложке и для заголовка вкладки браузера */
export function label(v: View, topics: Topic[], universal: Universal): string {
  switch (v.k) {
    case "landing": return "Home";
    case "free": return "Free EGE variants";
    case "variant": return `Variant ${v.i + 1}`;
    case "login": return "Log in";
    case "cabinet": return "My account";
    case "home": return "Textbook";
    case "u": return universal.pages[v.i].title;
    case "bank": return `Module ${v.t + 1} · Comparison bank`;
    case "unit": return `Module ${v.t + 1} · Unit ${topics[v.t].units[v.i].num}. ${topics[v.t].units[v.i].title}`;
    case "rev": return `Module ${v.t + 1} · Revision`;
    case "review": return `Module ${v.t + 1} · ${reviewTitle(topics[v.t], v.i)}`;
  }
}

/** "Review: Units 1–2": from the unit after the previous review up to the one it follows
    Название мини-повторения: от юнита после предыдущего повторения (или от 1-го) до юнита `after` */
export const reviewTitle = (t: Topic, i: number) => `Review: Units ${i ? t.reviews![i - 1].after + 1 : 1}–${t.reviews![i].after}`;

/** Строка меню и оглавления: v — куда ведёт, no — номер слева, title — название, tag — пометка справа */
export type Item = { v: View; no: string | number; title: string; tag?: string };
/** Pages of one module in reading order; used by the header menu and the contents
    Все страницы модуля по порядку: банк сравнений → юниты (после нужного юнита — его мини-повторение) → Revision */
export const moduleItems = (t: Topic, ti: number): Item[] => [
  { v: { k: "bank", t: ti }, no: "·", title: "Comparison bank", tag: "Task 4" },
  ...t.units.flatMap((u, i): Item[] => [
    { v: { k: "unit", t: ti, i, tab: 0 }, no: u.num, title: u.title },
    // мини-повторения, у которых after совпадает с номером этого юнита
    ...(t.reviews ?? []).flatMap((r, ri): Item[] => r.after === u.num ? [{ v: { k: "review", t: ti, i: ri }, no: "·", title: reviewTitle(t, ri), tag: "Tasks 30–36 · paraphrase" }] : []),
  ]),
  { v: { k: "rev", t: ti }, no: "·", title: "Revision", tag: "Tasks 11, 19–36" },
];

/** Same page, ignoring the open tab
    Это та же страница? Вкладку не учитываем (для подсветки текущего пункта меню) */
export const samePage = (a: View, b: View) => JSON.stringify({ ...a, tab: 0 }) === JSON.stringify({ ...b, tab: 0 });

import { Topic, Universal } from "./types";

/** Which page is open. Unit numbers and exam pages are stored as array indexes. */
export type View =
  | { k: "home" }
  | { k: "u"; i: number }
  | { k: "bank"; t: number }
  | { k: "unit"; t: number; i: number; tab: number }
  | { k: "rev"; t: number }
  | { k: "review"; t: number; i: number };

export const TABS = ["vocabulary", "memorise", "practice", "speaking", "exam-tasks"];

/** View → address after "#", e.g. "/sport/unit/3/practice" */
export function toHash(v: View, topics: Topic[]): string {
  switch (v.k) {
    case "home": return "/";
    case "u": return `/exam/${v.i + 1}`;
    case "bank": return `/${topics[v.t].id}/bank`;
    case "unit": return `/${topics[v.t].id}/unit/${v.i + 1}${v.tab ? `/${TABS[v.tab]}` : ""}`;
    case "rev": return `/${topics[v.t].id}/revision`;
    case "review": return `/${topics[v.t].id}/review/${v.i + 1}`;
  }
}

/** Address → View; anything unknown or out of range opens the cover */
export function fromHash(hash: string, topics: Topic[], universal: Universal): View {
  const [a, b, c, d] = hash.replace(/^#?\/?/, "").split("/");
  if (a === "exam" && universal.pages[Number(b) - 1]) return { k: "u", i: Number(b) - 1 };
  const t = topics.findIndex(x => x.id === a);
  if (t < 0) return { k: "home" };
  if (b === "bank") return { k: "bank", t };
  if (b === "revision") return { k: "rev", t };
  if (b === "review" && topics[t].reviews?.[Number(c) - 1]) return { k: "review", t, i: Number(c) - 1 };
  const i = Number(c) - 1;
  if (b === "unit" && topics[t].units[i]) return { k: "unit", t, i, tab: Math.max(0, TABS.indexOf(d)) };
  return { k: "home" };
}

/** Human-readable name of a page, for the "Continue" button and the browser tab */
export function label(v: View, topics: Topic[], universal: Universal): string {
  switch (v.k) {
    case "home": return "Cover";
    case "u": return universal.pages[v.i].title;
    case "bank": return `Module ${v.t + 1} · Comparison bank`;
    case "unit": return `Module ${v.t + 1} · Unit ${topics[v.t].units[v.i].num}. ${topics[v.t].units[v.i].title}`;
    case "rev": return `Module ${v.t + 1} · Revision`;
    case "review": return `Module ${v.t + 1} · ${reviewTitle(topics[v.t], v.i)}`;
  }
}

/** "Review: Units 1–2": from the unit after the previous review up to the one it follows */
export const reviewTitle = (t: Topic, i: number) => `Review: Units ${i ? t.reviews![i - 1].after + 1 : 1}–${t.reviews![i].after}`;

export type Item = { v: View; no: string | number; title: string; tag?: string };
/** Pages of one module in reading order; used by the header menu and the contents */
export const moduleItems = (t: Topic, ti: number): Item[] => [
  { v: { k: "bank", t: ti }, no: "·", title: "Comparison bank", tag: "Task 4" },
  ...t.units.flatMap((u, i): Item[] => [
    { v: { k: "unit", t: ti, i, tab: 0 }, no: u.num, title: u.title },
    ...(t.reviews ?? []).flatMap((r, ri): Item[] => r.after === u.num ? [{ v: { k: "review", t: ti, i: ri }, no: "·", title: reviewTitle(t, ri), tag: "Tasks 30–36 · paraphrase" }] : []),
  ]),
  { v: { k: "rev", t: ti }, no: "·", title: "Revision", tag: "Tasks 11, 19–36" },
];

/** Same page, ignoring the open tab */
export const samePage = (a: View, b: View) => JSON.stringify({ ...a, tab: 0 }) === JSON.stringify({ ...b, tab: 0 });

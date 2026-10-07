import { Topic, Universal } from "./types";

/** Which page is open. Unit numbers and exam pages are stored as array indexes. */
export type View =
  | { k: "home" }
  | { k: "u"; i: number }
  | { k: "bank"; t: number }
  | { k: "unit"; t: number; i: number; tab: number }
  | { k: "rev"; t: number };

export const TABS = ["vocabulary", "practice", "exam-tasks"];

/** View → address after "#", e.g. "/sport/unit/3/practice" */
export function toHash(v: View, topics: Topic[]): string {
  switch (v.k) {
    case "home": return "/";
    case "u": return `/exam/${v.i + 1}`;
    case "bank": return `/${topics[v.t].id}/bank`;
    case "unit": return `/${topics[v.t].id}/unit/${v.i + 1}${v.tab ? `/${TABS[v.tab]}` : ""}`;
    case "rev": return `/${topics[v.t].id}/revision`;
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
  const i = Number(c) - 1;
  if (b === "unit" && topics[t].units[i]) return { k: "unit", t, i, tab: Math.max(0, TABS.indexOf(d)) };
  return { k: "home" };
}

/** Human-readable name of a page, for the "Continue" button and the pager */
export function label(v: View, topics: Topic[], universal: Universal): string {
  switch (v.k) {
    case "home": return "Cover";
    case "u": return universal.pages[v.i].title;
    case "bank": return `Module ${v.t + 1} · Comparison bank`;
    case "unit": return `Module ${v.t + 1} · Unit ${topics[v.t].units[v.i].num}. ${topics[v.t].units[v.i].title}`;
    case "rev": return `Module ${v.t + 1} · Revision`;
  }
}

/** Reading order of the whole course: exam pages, then each module (bank → units → revision) */
export function sequence(topics: Topic[], universal: Universal): View[] {
  return [
    ...universal.pages.map((_, i): View => ({ k: "u", i })),
    ...topics.flatMap((t, ti): View[] => [
      { k: "bank", t: ti },
      ...t.units.map((_, i): View => ({ k: "unit", t: ti, i, tab: 0 })),
      { k: "rev", t: ti },
    ]),
  ];
}

/** Same page, ignoring the open tab */
export const samePage = (a: View, b: View) => JSON.stringify({ ...a, tab: 0 }) === JSON.stringify({ ...b, tab: 0 });

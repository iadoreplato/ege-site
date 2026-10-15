/* РАЗДЕЛЫ ЕГЭ из src/content/sections.json: названия вкладок, номера заданий, подписи типов, русские формулировки.
   Всё, что сайт пишет о разделах, берётся отсюда; в компонентах эти тексты не повторяются (docs/CODE.md, 3.8). */
import data from "./content/sections.json";

/** Раздел: id — часть адреса вкладки; label — название; ege — номера заданий («Tasks 10–18»); minutes — время на экзамене;
    types — подписи типов заданий; ru — русские формулировки из демоверсии (есть не у всех разделов) */
export type Section = { id: string; label: string; ege: string; minutes?: number; types: Text; ru?: Text };
/** «тип → текст»; undefined допускается, потому что у разных разделов разные типы */
type Text = Record<string, string | undefined>;
export const SECTIONS: Section[] = data.sections;
export const sectionById = (id: string) => SECTIONS.find(s => s.id === id)!;
/** Раздел, к которому относится тип задания из unit.speech ("interview" → speaking, "essay" → writing) */
export const sectionOfType = (type: string) => SECTIONS.find(s => type in s.types);

/** Номер задания ЕГЭ по разделу и типу. Границы берутся из поля ege («Tasks 1–9» → от 1 до 9):
    - тип-число — это и есть номер, а последний из них занимает остаток диапазона (listening 3 → «3–9», reading 12 → «12–18»);
    - тип-слово — по порядку в types от начала диапазона (speaking: reading 1, ad 2, interview 3, photo 4; writing: email 37, essay 38) */
export function egeNumber(s: Section, type: string): string {
  const [from, to] = s.ege.match(/\d+/g)!.map(Number);
  const keys = Object.keys(s.types);
  if (!/^\d+$/.test(type)) return String(from + keys.indexOf(type));
  const n = Number(type), last = Math.max(...keys.map(Number));
  return n === last && n < to ? `${n}–${to}` : String(n);
}

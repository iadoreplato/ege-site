// Content types (loose on purpose: the JSON is the single source of truth for PDF and site)
export type Any = any;
export interface Universal { title: string; subtitle: string; source_note: string; cover_pics: string[]; pages: Page[]; frames: Record<string, [string, string][]> }
export interface Page { kick: string; title: string; lede: string; pics: string[]; blocks: Any[] }
export interface Unit { num: number; title: string; lede: string; pics: string[]; vocab: Any[]; exercises: Exercise[]; speech: Any[][]; speaking?: SpeakTask[]; cards?: CardTests }
/** Mini-review after every two units: EGE-style multiple choice (Tasks 30–36 format) + key word transformations.
    `after` = number of the unit it follows; cloze `key` = correct option (1–4) for each gap in order */
export interface Review { after: number; cloze: { title: string; text: string; opts: Any[]; key: number[] }[]; transform: [string, string, string, string][] }
/** Quick test in the Practice tab: quick gaps [sentence with ___, answer] and vocabulary in contrast [sentence with {a|b|c}, answer] */
export interface CardTests { gaps: [string, string][]; contrast: [string, string][] }
/** "Speaking" tab: a short task outside the exam format; `vocab` = useful language shown with the task */
export interface SpeakTask { title: string; task: string; prompts?: string[]; vocab: string[] }
export interface Exercise { type: "collocation" | "choose" | "transform" | "translate" | "gaps"; title: string; instr: string; items: Any[] }
export interface Topic {
  id: string; title: string; subtitle: string; cover_pics: string[]; typology: Any[]; units: Unit[];
  revision: Any; reviews?: Review[]; ad_keys: [string, string][]; photo_pool_base: { describe: string[]; opinion: string[]; close: string[] }; data_verbs: string[];
}

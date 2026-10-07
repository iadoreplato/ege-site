// Content types (loose on purpose: the JSON is the single source of truth for PDF and site)
export type Any = any;
export interface Universal { title: string; subtitle: string; source_note: string; cover_pics: string[]; pages: Page[]; frames: Record<string, [string, string][]> }
export interface Page { kick: string; title: string; lede: string; pics: string[]; blocks: Any[] }
export interface Unit { num: number; title: string; lede: string; pics: string[]; vocab: Any[]; exercises: Exercise[]; speech: Any[][] }
export interface Exercise { type: "collocation" | "choose" | "transform" | "translate"; title: string; instr: string; items: Any[] }
export interface Topic {
  id: string; title: string; subtitle: string; cover_pics: string[]; typology: Any[]; units: Unit[];
  revision: Any; ad_keys: [string, string][]; photo_pool_base: { describe: string[]; opinion: string[]; close: string[] }; data_verbs: string[];
}

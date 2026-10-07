import { ReactNode } from "react";

/** Converts content markup to HTML: [[x]] = key element, (U) = uncountable, sb/sth/+ -ing = grammar tags */
export function markup(s: string): string {
  return s
    .replace(/\[\[(.+?)\]\]/g, '<mark class="k">$1</mark>')
    .replace(/\(U\)/g, '<span class="u" title="uncountable">U</span>')
    .replace(/(\+ -ing|\+ noun|\bsb\b|\bsth\b|\((?:v|n|informal|formal|BrE|AmE)\))/g, '<span class="gr">$1</span>');
}
/** Renders trusted HTML from our own JSON */
export const Rich = ({ html, as: Tag = "span", className }: { html: string; as?: any; className?: string }) =>
  <Tag className={className} dangerouslySetInnerHTML={{ __html: markup(html) }} />;

/** "___" → visual gap */
export const Slots = ({ text }: { text: string }) => (
  <>{text.split("___").map((p, i, a) => <span key={i}><Rich html={p} />{i < a.length - 1 && <span className="slot" />}</span>)}</>
);

export const Img = ({ name, className = "im" }: { name: string; className?: string }) =>
  <img className={className} src={`${import.meta.env.BASE_URL}img/${name}.svg`} alt="" loading="lazy" />;

/** Answer normalisation: case, spaces, apostrophes; "/" = alternatives; "(…)" = optional part */
export const norm = (s: string) => s.toLowerCase().replace(/[’']/g, "'").replace(/\s+/g, " ").replace(/[.!?,]$/, "").trim();
export function variants(key: string): string[] {
  return key.split("/").flatMap(v => [norm(v.replace(/[()]/g, "")), norm(v.replace(/\([^)]*\)/g, "").replace(/\s+/g, " "))]);
}
export const isCorrect = (answer: string, key: string) => !!answer.trim() && variants(key).includes(norm(answer));

export const Chips = ({ items, className = "chips" }: { items: string[]; className?: string }) =>
  <div className={className}>{items.map((x, i) => <Rich key={i} html={x} />)}</div>;

export const Card = ({ title, icon, soft, children }: { title: string; icon?: string; soft?: boolean; children: ReactNode }) => (
  <div className={`card${soft ? " soft" : ""}`}>
    <div className="card-h">{icon && <Img name={icon} className="cd-ic" />}<Rich html={title} /></div>{children}
  </div>
);

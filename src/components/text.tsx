import { ReactNode } from "react";

/** Converts content markup to HTML: [[x]] = key element, (U) = uncountable, sb/sth/+ -ing = grammar tags */
export function markup(s: string): string {
  return s
    .replace(/\[\[(.+?)\]\]/g, '<mark class="key-element">$1</mark>')
    .replace(/\(U\)/g, '<span class="uncountable" title="uncountable">U</span>')
    .replace(/(\+ -ing|\+ noun|\bsb\b|\bsth\b|\((?:v|n|informal|formal|BrE|AmE)\))/g, '<span class="grammar-pattern">$1</span>');
}
/** Renders trusted HTML from our own JSON */
export const Rich = ({ html, as: Tag = "span", className }: { html: string; as?: any; className?: string }) =>
  <Tag className={className} dangerouslySetInnerHTML={{ __html: markup(html) }} />;

/** "___" → visual gap */
export const Slots = ({ text }: { text: string }) => (
  <>{text.split("___").map((p, i, a) => <span key={i}><Rich html={p} />{i < a.length - 1 && <span className="gap-line" />}</span>)}</>
);

export const Img = ({ name, className = "icon" }: { name: string; className?: string }) =>
  <img className={className} src={`${import.meta.env.BASE_URL}img/${name}.svg`} alt="" loading="lazy" />;

/** Answer normalisation: case, spaces, apostrophes; "/" = alternatives; "(…)" = optional part */
export const norm = (s: string) => s.toLowerCase().replace(/[’']/g, "'").replace(/\s+/g, " ").replace(/[.!?,]$/, "").trim();
export function variants(key: string): string[] {
  return key.split("/").flatMap(v => [norm(v.replace(/[()]/g, "")), norm(v.replace(/\([^)]*\)/g, "").replace(/\s+/g, " "))]);
}
export const isCorrect = (answer: string, key: string) => !!answer.trim() && variants(key).includes(norm(answer));

export const Chips = ({ items, className = "" }: { items: string[]; className?: string }) =>
  <div className={`chips ${className}`}>{items.map((x, i) => <Rich key={i} className="chips__item" html={x} />)}</div>;

export const Card = ({ title, icon, soft, children }: { title: string; icon?: string; soft?: boolean; children: ReactNode }) => (
  <div className={`info-card${soft ? " info-card--soft" : ""}`}>
    <div className="info-card__header">{icon && <Img name={icon} className="info-card__icon" />}<Rich html={title} /></div>{children}
  </div>
);

import { ReactNode } from "react";
import { RichText } from "../types";

/* Content JSON holds plain text plus meaning (types.ts, RichText): which words are key elements, which are
   language examples, what is uncountable. How that looks is decided here, not in the JSON. */

/** Grammar labels that are styled automatically: sb, sth, + -ing, + noun, (informal), (formal), (BrE), (AmE), (v), (n) */
const GRAMMAR = /\+ -ing|\+ noun|\bsb\b|\bsth\b|\((?:v|n|informal|formal|BrE|AmE)\)/g;
const isLetter = (c?: string) => !!c && /\p{L}/u.test(c);
const KEY = 1, EXAMPLE = 2, GRAMMAR_PATTERN = 4;

/** Where the key elements are: whole words or phrases; "-ing" means the ending of a word */
function keyRanges(text: string, keys: string[]): [number, number][] {
  const ranges: [number, number][] = [], lower = text.toLowerCase();
  for (const raw of keys) {
    const ending = raw.length > 1 && raw.startsWith("-"), key = (ending ? raw.slice(1) : raw).toLowerCase();
    for (let i = lower.indexOf(key); i >= 0; i = lower.indexOf(key, i + 1)) {
      const end = i + key.length;
      const startOk = ending ? isLetter(text[i - 1]) : !isLetter(text[i - 1]) || !isLetter(key[0]);
      const endOk = !isLetter(text[end]) || !isLetter(key[key.length - 1]);
      if (startOk && endOk) ranges.push([i, end]);
    }
  }
  return ranges;
}
const allRanges = (text: string, parts: string[]) =>
  parts.flatMap(part => { const r: [number, number][] = []; for (let i = text.indexOf(part); i >= 0; i = text.indexOf(part, i + 1)) r.push([i, i + part.length]); return r; });

const withBreaks = (text: string) => text.split("\n").flatMap((line, i) => (i ? [<br key={i} />, line] : [line]));

/** One run of text with the same meaning: a key element, a language example, a grammar label or plain text */
function Piece({ text, flags }: { text: string; flags: number }) {
  let node: ReactNode = withBreaks(text);
  if (flags & GRAMMAR_PATTERN) node = <span className="grammar-pattern">{node}</span>;
  if (flags & KEY) node = <mark className="key-element">{node}</mark>;
  if (flags & EXAMPLE) node = <em className="language-example">{node}</em>;
  return <>{node}</>;
}

/** Renders any text from the content JSON: a plain string or { text, key, example, uncountable } */
export function Text({ value, as: Tag = "span", className }: { value: RichText; as?: any; className?: string }) {
  const { text, key = [], example = [], uncountable } = typeof value === "string" ? { text: value } as Exclude<RichText, string> : value;
  const flags = new Uint8Array(text.length);
  const mark = (ranges: [number, number][], bit: number) => ranges.forEach(([a, b]) => { for (let i = a; i < b; i++) flags[i] |= bit; });
  mark(keyRanges(text, key), KEY);
  mark(allRanges(text, example), EXAMPLE);
  mark([...text.matchAll(GRAMMAR)].map(m => [m.index!, m.index! + m[0].length] as [number, number]), GRAMMAR_PATTERN);
  const pieces: ReactNode[] = [];
  for (let i = 0; i < text.length;) {
    let j = i; while (j < text.length && flags[j] === flags[i]) j++;
    pieces.push(<Piece key={i} text={text.slice(i, j)} flags={flags[i]} />); i = j;
  }
  return <Tag className={className}>{pieces}{uncountable && <span className="uncountable" title="uncountable">U</span>}</Tag>;
}

/** The words only, without any highlighting (flash cards, match the pairs) */
export const plainText = (value: RichText) => (typeof value === "string" ? value : value.text);

/** "___" → visual gap */
export const Slots = ({ text }: { text: string }) => (
  <>{text.split("___").map((p, i, a) => <span key={i}><Text value={p} />{i < a.length - 1 && <span className="gap-line" />}</span>)}</>
);

export const Img = ({ name, className = "icon" }: { name: string; className?: string }) =>
  <img className={className} src={`${import.meta.env.BASE_URL}img/${name}.svg`} alt="" loading="lazy" />;

/** Answer normalisation: case, spaces, apostrophes; "/" = alternatives; "(…)" = optional part */
export const norm = (s: string) => s.toLowerCase().replace(/[’']/g, "'").replace(/\s+/g, " ").replace(/[.!?,]$/, "").trim();
export function variants(key: string): string[] {
  return key.split("/").flatMap(v => [norm(v.replace(/[()]/g, "")), norm(v.replace(/\([^)]*\)/g, "").replace(/\s+/g, " "))]);
}
export const isCorrect = (answer: string, key: string) => !!answer.trim() && variants(key).includes(norm(answer));

export const Chips = ({ items, className = "" }: { items: RichText[]; className?: string }) =>
  <div className={`chips ${className}`}>{items.map((x, i) => <Text key={i} className="chips__item" value={x} />)}</div>;

export const Card = ({ title, icon, soft, children }: { title: RichText; icon?: string; soft?: boolean; children: ReactNode }) => (
  <div className={`info-card${soft ? " info-card--soft" : ""}`}>
    <div className="info-card__header">{icon && <Img name={icon} className="info-card__icon" />}<Text value={title} /></div>{children}
  </div>
);

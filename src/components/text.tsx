/* ТЕКСТ ИЗ JSON И ПРОВЕРКА ОТВЕТОВ. Здесь:
   - Text — показывает любой текст из контента с подсветкой ключевых слов, примеров и грамматических помет;
   - Slots, Img, Chips, Card — мелкие общие детали страниц;
   - norm, variants, isCorrect — сравнение ответа ученика с ключом. */
import { ReactNode } from "react";
import { RichText } from "../types";

/* Content JSON holds plain text plus meaning (types.ts, RichText): which words are key elements, which are
   language examples, what is uncountable. How that looks is decided here, not in the JSON.
   В JSON — только текст и его смысл (что ключевое, что пример, что неисчисляемое). Как это выглядит, решает этот файл. */

/** Grammar labels that are styled automatically: sb, sth, + -ing, + noun, (informal), (formal), (BrE), (AmE), (v), (n)
    Шаблон (регулярное выражение) для грамматических помет, которые оформляются сами. \b — граница слова */
const GRAMMAR = /\+ -ing|\+ noun|\bsb\b|\bsth\b|\((?:v|n|informal|formal|BrE|AmE)\)/g;
/** Это буква (любого алфавита)? Нужно, чтобы искать ключевые слова целиком, а не внутри других слов */
const isLetter = (c?: string) => !!c && /\p{L}/u.test(c);
// «флажки» оформления; их можно сочетать: 1 + 2 = ключевое слово внутри примера
const KEY = 1, EXAMPLE = 2, GRAMMAR_PATTERN = 4;

/** Where the key elements are: whole words or phrases; "-ing" means the ending of a word
    Где в тексте ключевые элементы: возвращает пары [начало, конец]. Слово ищется целиком (не внутри другого слова),
    без учёта регистра; ключ "-ing" — окончание, поэтому перед ним должна стоять буква */
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
/** Где в тексте примеры: все точные вхождения каждого куска */
const allRanges = (text: string, parts: string[]) =>
  parts.flatMap(part => { const r: [number, number][] = []; for (let i = text.indexOf(part); i >= 0; i = text.indexOf(part, i + 1)) r.push([i, i + part.length]); return r; });

/** "\n" в тексте → перенос строки <br> */
const withBreaks = (text: string) => text.split("\n").flatMap((line, i) => (i ? [<br key={i} />, line] : [line]));

/** One run of text with the same meaning: a key element, a language example, a grammar label or plain text
    Кусок текста с одинаковым оформлением: оборачивается в нужные теги по флажкам */
function Piece({ text, flags }: { text: string; flags: number }) {
  let node: ReactNode = withBreaks(text);
  if (flags & GRAMMAR_PATTERN) node = <span className="grammar-pattern">{node}</span>;
  if (flags & KEY) node = <mark className="key-element">{node}</mark>;
  if (flags & EXAMPLE) node = <em className="language-example">{node}</em>;
  return <>{node}</>;
}

/** Renders any text from the content JSON: a plain string or { text, key, example, uncountable }
    Показывает любой текст из JSON. as — какой тег использовать (span, li, p, div…), className — CSS-класс.
    Как работает: каждой букве ставятся флажки (ключевое / пример / помета), затем соседние буквы
    с одинаковыми флажками склеиваются в куски Piece. В конце — значок U для неисчисляемых */
export function Text({ value, as: Tag = "span", className }: { value: RichText; as?: any; className?: string }) {
  const { text, key = [], example = [], uncountable } = typeof value === "string" ? { text: value } as Exclude<RichText, string> : value;
  const flags = new Uint8Array(text.length); // по одному числу-флажку на каждую букву
  const mark = (ranges: [number, number][], bit: number) => ranges.forEach(([a, b]) => { for (let i = a; i < b; i++) flags[i] |= bit; });
  mark(keyRanges(text, key), KEY);
  mark(allRanges(text, example), EXAMPLE);
  mark([...text.matchAll(GRAMMAR)].map(m => [m.index!, m.index! + m[0].length] as [number, number]), GRAMMAR_PATTERN);
  const pieces: ReactNode[] = [];
  for (let i = 0; i < text.length;) {
    let j = i; while (j < text.length && flags[j] === flags[i]) j++; // идём, пока флажки те же
    pieces.push(<Piece key={i} text={text.slice(i, j)} flags={flags[i]} />); i = j;
  }
  return <Tag className={className}>{pieces}{uncountable && <span className="uncountable" title="uncountable">U</span>}</Tag>;
}

/** The words only, without any highlighting (flash cards, match the pairs)
    Только текст, без оформления (для карточек и «Match the pairs») */
export const plainText = (value: RichText) => (typeof value === "string" ? value : value.text);

/** "___" → visual gap
    Текст, в котором каждое «___» превращается в линию-пропуск */
export const Slots = ({ text }: { text: string }) => (
  <>{text.split("___").map((p, i, a) => <span key={i}><Text value={p} />{i < a.length - 1 && <span className="gap-line" />}</span>)}</>
);

/** Картинка из public/img/<name>.svg. BASE_URL — начало адреса сайта (на GitHub Pages это /ege-site/).
    loading="lazy" — картинка грузится, только когда до неё докрутили */
export const Img = ({ name, className = "icon" }: { name: string; className?: string }) =>
  <img className={className} src={`${import.meta.env.BASE_URL}img/${name}.svg`} alt="" loading="lazy" />;

/** Answer normalisation: case, spaces, apostrophes; "/" = alternatives; "(…)" = optional part
    Приведение ответа к единому виду: маленькие буквы, ’ → ', один пробел вместо нескольких, без точки/запятой в конце */
export const norm = (s: string) => s.toLowerCase().replace(/[’']/g, "'").replace(/\s+/g, " ").replace(/[.!?,]$/, "").trim();
/** Все допустимые ответы из ключа. "a/b" — подходит a или b; "(have) been" — со скобочной частью и без неё */
export function variants(key: string): string[] {
  return key.split("/").flatMap(v => [norm(v.replace(/[()]/g, "")), norm(v.replace(/\([^)]*\)/g, "").replace(/\s+/g, " "))]);
}
/** Верен ли ответ ученика: не пустой и совпадает с одним из вариантов ключа */
export const isCorrect = (answer: string, key: string) => !!answer.trim() && variants(key).includes(norm(answer));

/** Ряд «плашек» с текстом (готовые фразы, подсказки) */
export const Chips = ({ items, className = "" }: { items: RichText[]; className?: string }) =>
  <div className={`chips ${className}`}>{items.map((x, i) => <Text key={i} className="chips__item" value={x} />)}</div>;

/** Карточка с заголовком и иконкой; soft — мягкий фон; children — всё, что вложено внутрь тега <Card>…</Card> */
export const Card = ({ title, icon, soft, children }: { title: RichText; icon?: string; soft?: boolean; children: ReactNode }) => (
  <div className={`info-card${soft ? " info-card--soft" : ""}`}>
    <div className="info-card__header">{icon && <Img name={icon} className="info-card__icon" />}<Text value={title} /></div>{children}
  </div>
);

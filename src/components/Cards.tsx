/* ВКЛАДКА MEMORISE: карточки для заучивания, «Match the pairs» и быстрый тест.
   Слова для карточек и пар берутся автоматически из лексики юнита (vocab), отдельно их вписывать не нужно. */
import { useEffect, useMemo, useState } from "react";
import { CardTests, Unit, VocabItem } from "../types";
import ExerciseView, { Head } from "./Exercises";
import { cheer, rabbitSay } from "./Rabbit";
import { play } from "../sound";

/** Одна карточка: английский, русский, пример */
type Card = { en: string; ru: string; ex?: string };
/** Перемешать массив (возвращает новый, исходный не меняется) */
const shuffle = <T,>(items: T[]) => [...items].sort(() => Math.random() - 0.5);

/** Every word or phrase of the unit with a translation, each once; plain text, without the word-list highlighting
    Все слова юнита с переводом, каждое один раз: из items всех блоков и из groups блока gpd.
    Слова без перевода (ru) пропускаются; повторы ищутся без учёта регистра */
export const unitCards = (unit: Unit): Card[] =>
  unit.vocab.flatMap((block: any) => [...(block.items ?? []), ...(block.groups ?? []).flatMap((g: any[]) => g[2])])
    .filter((x: VocabItem) => x?.en && x.ru)
    .map((x: VocabItem) => ({ en: x.en, ru: x.ru, ex: x.ex }))
    .filter((c: Card, i: number, all: Card[]) => all.findIndex(o => o.en.toLowerCase() === c.en.toLowerCase()) === i);

/** Memorise tab, part 1: flash cards, Russian on the front, English and an example on the back
    Карточки: спереди русский, по нажатию — английский и пример. deck — колода (можно перемешать),
    index — номер открытой карточки, flipped — перевёрнута ли */
export function FlashCards({ cards }: { cards: Card[] }) {
  const [deck, setDeck] = useState(cards);
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  /** Перейти на step карточек вперёд (1) или назад (-1); по кругу. На последней кролик говорит, что карточки кончились */
  const go = (step: number) => {
    const next = (index + step + deck.length) % deck.length;
    if (next === deck.length - 1) rabbitSay("pleased", "That's all the cards!", `${deck.length} cards. Now try Match the pairs.`);
    setFlipped(false); setIndex(next);
  };
  const card = deck[index];
  if (!card) return null; // в юните нет слов с переводом
  return <div className="flash-cards">
    <button className={`flash-card${flipped ? " flash-card--flipped" : ""}`} onClick={() => { setFlipped(!flipped); play("flip"); }} aria-label="Turn the card over">
      <span className="flash-card__side flash-card__side--front"><small className="flash-card__language">Russian</small><b className="flash-card__phrase">{card.ru}</b><em className="flash-card__hint">tap to see the English</em></span>
      <span className="flash-card__side flash-card__side--back"><small className="flash-card__language">English</small><b className="flash-card__phrase">{card.en}</b>{card.ex && <em className="flash-card__hint">{card.ex}</em>}</span>
    </button>
    <div className="flash-cards__controls">
      <button className="button button--secondary" onClick={() => go(-1)}>← Back</button>
      <span className="flash-cards__counter">{index + 1} / {deck.length}</span>
      <button className="button button--secondary" onClick={() => go(1)}>Next →</button>
      <button className="button button--secondary" onClick={() => { setDeck(shuffle(deck)); setIndex(0); setFlipped(false); }}>Shuffle</button>
    </div>
  </div>;
}

/** Memorise tab, part 2: pair Russian and English phrases of the unit, eight at a time
    «Match the pairs»: 8 случайных пар за раз. Слева русский, справа английский (в другом порядке).
    round — номер набора: увеличивается кнопкой «New set», и useMemo выбирает новые 8 пар */
export function MatchPairs({ cards, number }: { cards: Card[]; number: number }) {
  const [round, setRound] = useState(0);
  // eight pairs with different Russian phrases, so every pair has only one right answer
  // 8 пар с разными русскими фразами, чтобы у каждой был только один правильный ответ
  const set = useMemo(() => shuffle(cards).filter((c, i, all) => all.findIndex(x => x.ru === c.ru) === i).slice(0, 8), [cards, round]);
  const english = useMemo(() => shuffle(set), [set]); // правая колонка в другом порядке
  const [selected, setSelected] = useState<Card | null>(null); // выбранная русская фраза
  const [matched, setMatched] = useState<Card[]>([]);           // уже найденные пары
  const [mistakes, setMistakes] = useState(0);
  const [wrong, setWrong] = useState<Card | null>(null);        // неверно нажатая английская фраза (мигает полсекунды)
  // новый набор — всё обнуляем
  useEffect(() => { setSelected(null); setMatched([]); setMistakes(0); }, [set]);
  /** Нажата английская фраза: верно — пара найдена; неверно — +1 ошибка. Когда всё найдено, кролик оценивает */
  const choose = (card: Card) => {
    if (!selected || matched.includes(card)) return;
    if (card !== selected) { play("miss"); setMistakes(mistakes + 1); setWrong(card); setTimeout(() => setWrong(null), 500); return; }
    const now = [...matched, card];
    setMatched(now); setSelected(null);
    if (now.length < set.length) play("pop"); // последняя пара — сразу похвала кролика со своим звуком
    if (now.length === set.length) cheer(Math.max(0, set.length - mistakes), set.length);
  };
  /** CSS-класс кнопки: найдена / выбрана / ошибка. extra — выбранная (слева) или ошибочная (справа) карточка */
  const state = (card: Card, extra: Card | null) =>
    `match__card${matched.includes(card) ? " match__card--matched" : card === extra ? (extra === wrong ? " match__card--wrong" : " match__card--selected") : ""}`;
  if (set.length < 2) return null; // слишком мало слов для игры
  return <div className="exercise">
    <Head n={number} title="Match the pairs" instr={`Tap a Russian phrase, then its English equivalent. Mistakes: ${mistakes}`} />
    <div className="match">
      <div className="match__column">{set.map(c => <button key={c.en} className={state(c, selected)} disabled={matched.includes(c)} onClick={() => setSelected(c)}>{c.ru}</button>)}</div>
      <div className="match__column">{english.map(c => <button key={c.en} className={state(c, wrong)} disabled={matched.includes(c)} onClick={() => choose(c)}>{c.en}</button>)}</div>
    </div>
    <div className="exercise__check-bar"><button className="button button--primary" onClick={() => setRound(round + 1)}>{matched.length === set.length ? "Next set" : "New set"}</button></div>
  </div>;
}

/** Memorise tab, part 3: quick gaps and word choice on the unit vocabulary (unit.cards)
    Быстрый тест из поля cards юнита: два обычных упражнения — gaps (пропуски) и choose (выбор слова) */
export const QuickTest = ({ tests, number }: { tests: CardTests; number: number }) => <>
  <ExerciseView n={number} e={{ type: "gaps", title: "Quick test: gaps", instr: "Type the missing word. The first letter is given.", items: tests.gaps }} />
  <ExerciseView n={number + 1} e={{ type: "choose", title: "Quick test: which word?", instr: "Choose the word that fits the sentence.", items: tests.contrast }} />
</>;

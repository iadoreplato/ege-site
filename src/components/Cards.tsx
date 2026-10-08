import { useEffect, useMemo, useState } from "react";
import { CardTests, Unit, VocabItem } from "../types";
import ExerciseView, { Head } from "./Exercises";
import { cheer } from "./Rabbit";

type Card = { en: string; ru: string; ex?: string };
const shuffle = <T,>(items: T[]) => [...items].sort(() => Math.random() - 0.5);

/** Every word or phrase of the unit with a translation, each once; plain text, without the word-list highlighting */
export const unitCards = (unit: Unit): Card[] =>
  unit.vocab.flatMap((block: any) => [...(block.items ?? []), ...(block.groups ?? []).flatMap((g: any[]) => g[2])])
    .filter((x: VocabItem) => x?.en && x.ru)
    .map((x: VocabItem) => ({ en: x.en, ru: x.ru, ex: x.ex }))
    .filter((c: Card, i: number, all: Card[]) => all.findIndex(o => o.en.toLowerCase() === c.en.toLowerCase()) === i);

/** Memorise tab, part 1: flash cards, Russian on the front, English and an example on the back */
export function FlashCards({ cards }: { cards: Card[] }) {
  const [deck, setDeck] = useState(cards);
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const go = (step: number) => { setFlipped(false); setIndex((index + step + deck.length) % deck.length); };
  const card = deck[index];
  if (!card) return null;
  return <div className="flash-cards">
    <button className={`flash-card${flipped ? " flash-card--flipped" : ""}`} onClick={() => setFlipped(!flipped)} aria-label="Turn the card over">
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

/** Memorise tab, part 2: pair Russian and English phrases of the unit, eight at a time */
export function MatchPairs({ cards, number }: { cards: Card[]; number: number }) {
  const [round, setRound] = useState(0);
  // eight pairs with different Russian phrases, so every pair has only one right answer
  const set = useMemo(() => shuffle(cards).filter((c, i, all) => all.findIndex(x => x.ru === c.ru) === i).slice(0, 8), [cards, round]);
  const english = useMemo(() => shuffle(set), [set]);
  const [selected, setSelected] = useState<Card | null>(null);
  const [matched, setMatched] = useState<Card[]>([]);
  const [mistakes, setMistakes] = useState(0);
  const [wrong, setWrong] = useState<Card | null>(null);
  useEffect(() => { setSelected(null); setMatched([]); setMistakes(0); }, [set]);
  const choose = (card: Card) => {
    if (!selected || matched.includes(card)) return;
    if (card !== selected) { setMistakes(mistakes + 1); setWrong(card); setTimeout(() => setWrong(null), 500); return; }
    const now = [...matched, card];
    setMatched(now); setSelected(null);
    if (now.length === set.length) cheer(Math.max(0, set.length - mistakes), set.length);
  };
  const state = (card: Card, extra: Card | null) =>
    `match__card${matched.includes(card) ? " match__card--matched" : card === extra ? (extra === wrong ? " match__card--wrong" : " match__card--selected") : ""}`;
  if (set.length < 2) return null;
  return <div className="exercise">
    <Head n={number} title="Match the pairs" instr={`Tap a Russian phrase, then its English equivalent. Mistakes: ${mistakes}`} />
    <div className="match">
      <div className="match__column">{set.map(c => <button key={c.en} className={state(c, selected)} disabled={matched.includes(c)} onClick={() => setSelected(c)}>{c.ru}</button>)}</div>
      <div className="match__column">{english.map(c => <button key={c.en} className={state(c, wrong)} disabled={matched.includes(c)} onClick={() => choose(c)}>{c.en}</button>)}</div>
    </div>
    <div className="exercise__check-bar"><button className="button button--primary" onClick={() => setRound(round + 1)}>{matched.length === set.length ? "Next set" : "New set"}</button></div>
  </div>;
}

/** Memorise tab, part 3: quick gaps and word choice on the unit vocabulary (unit.cards) */
export const QuickTest = ({ tests, number }: { tests: CardTests; number: number }) => <>
  <ExerciseView n={number} e={{ type: "gaps", title: "Quick test: gaps", instr: "Type the missing word. The first letter is given.", items: tests.gaps }} />
  <ExerciseView n={number + 1} e={{ type: "choose", title: "Quick test: which word?", instr: "Choose the word that fits the sentence.", items: tests.contrast }} />
</>;

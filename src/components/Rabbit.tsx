/* The course mascot: an original SVG rabbit. Colours are CSS variables --color-rabbit-* (styles.css, :root);
   animation lives in styles.css, sections "rabbit" and "praise". */
import { CSSProperties, RefObject, useEffect, useRef, useState } from "react";

/** Eyes and head follow the pointer: sets --rabbit-* offsets on the svg */
function useLook(ref: RefObject<SVGSVGElement>) {
  useEffect(() => {
    let raf = 0;
    const move = (e: PointerEvent) => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const el = ref.current;
        if (!el) return;
        const r = el.getBoundingClientRect();
        const dx = e.clientX - (r.left + r.width / 2), dy = e.clientY - (r.top + r.height * 0.35);
        const d = Math.hypot(dx, dy) || 1, k = Math.min(1, d / 250), x = dx / d * k, y = dy / d * k;
        const set = (name: string, v: number, unit: string) => el.style.setProperty(name, v.toFixed(2) + unit);
        set("--rabbit-head-rotation", x * 7, "deg"); set("--rabbit-head-x", x, "px"); set("--rabbit-head-y", y * 0.6, "px");
        set("--rabbit-pupils-x", x * 1.7, "px"); set("--rabbit-pupils-y", y * 1.4, "px");
      });
    };
    window.addEventListener("pointermove", move, { passive: true });
    return () => { cancelAnimationFrame(raf); window.removeEventListener("pointermove", move); };
  }, [ref]);
}

/** Head with ears, drawn in a 64×64 box; every rabbit scales it */
const Head = () => (
  <g className="rabbit__head">
    <g className="rabbit__ear rabbit__ear--left">
      <ellipse className="rabbit__fur" cx="24" cy="15" rx="6.5" ry="14" transform="rotate(-12 24 15)" />
      <ellipse className="rabbit__pink" cx="24" cy="16.5" rx="3.2" ry="10" transform="rotate(-12 24 16.5)" />
    </g>
    <g className="rabbit__ear rabbit__ear--right">
      <ellipse className="rabbit__fur" cx="40" cy="15" rx="6.5" ry="14" transform="rotate(12 40 15)" />
      <ellipse className="rabbit__pink" cx="40" cy="16.5" rx="3.2" ry="10" transform="rotate(12 40 16.5)" />
    </g>
    <ellipse className="rabbit__fur" cx="32" cy="41" rx="18" ry="16" />
    <ellipse className="rabbit__shadow" cx="32" cy="49" rx="9" ry="6" opacity=".55" />
    <circle className="rabbit__pink" cx="21.5" cy="46" r="3.2" opacity=".75" />
    <circle className="rabbit__pink" cx="42.5" cy="46" r="3.2" opacity=".75" />
    <g className="rabbit__eyes"><g className="rabbit__pupils">
      <ellipse className="rabbit__eye" cx="25" cy="39" rx="2.5" ry="3.1" />
      <ellipse className="rabbit__eye" cx="39" cy="39" rx="2.5" ry="3.1" />
      <circle className="rabbit__eye-glint" cx="25.9" cy="37.9" r=".9" />
      <circle className="rabbit__eye-glint" cx="39.9" cy="37.9" r=".9" />
    </g></g>
    <path className="rabbit__nose" d="M29.6 44.4Q32 43.2 34.4 44.4Q33.2 46.7 32 46.9Q30.8 46.7 29.6 44.4Z" />
    <path className="rabbit__mouth" d="M32 46.9v1.5m0 0q-1.9 1.7-3.5.5m3.5-.5q1.9 1.7 3.5.5" strokeWidth="1" />
  </g>
);

/** Rabbit head for the header logo */
export function RabbitMark() {
  const ref = useRef<SVGSVGElement>(null);
  useLook(ref);
  return <svg ref={ref} className="rabbit rabbit--logo" viewBox="0 0 64 64" aria-hidden="true"><Head /></svg>;
}

/** Rabbit reading an open book, for the cover; hops when clicked */
export function RabbitReader() {
  const ref = useRef<SVGSVGElement>(null);
  const [n, setN] = useState(0);
  useLook(ref);
  return <button className="cover__rabbit-button" onClick={() => setN(n + 1)} aria-label="Make the rabbit hop">
    <span key={n} className={`rabbit-hop${n ? " rabbit-hop--active" : ""}`}>
      <svg ref={ref} className="rabbit rabbit--reader" viewBox="0 0 240 240" aria-hidden="true">
        <ellipse className="rabbit__ground" cx="120" cy="222" rx="92" ry="9" />
        <ellipse className="rabbit__body rabbit__shadow" cx="120" cy="180" rx="42" ry="36" />
        <g transform="translate(38 0) scale(2.56)"><Head /></g>
        <path className="rabbit__book-cover" d="M44 184Q83 174 120 190Q157 174 196 184V218Q157 209 120 223Q83 209 44 218Z" />
        <path className="rabbit__book-page" d="M52 180Q88 170 120 186V216Q88 202 52 210Z" />
        <path className="rabbit__book-page rabbit__book-page--right" d="M188 180Q152 170 120 186V216Q152 202 188 210Z" />
        <path className="rabbit__book-lines" d="M64 186q22-6 46 2M64 194q22-6 46 2M64 202q14-4 28 0M130 188q22-8 46-2M130 196q22-8 46-2M130 204q14-5 30-2" strokeWidth="2.6" />
        <ellipse className="rabbit__fur" cx="92" cy="182" rx="11" ry="8.5" />
        <ellipse className="rabbit__fur" cx="148" cy="182" rx="11" ry="8.5" />
        <path className="rabbit__toe-lines" d="M88 178.5v5M96 178.5v5M144 178.5v5M152 178.5v5" strokeWidth="1.6" />
      </svg>
    </span>
  </button>;
}

/** Whole rabbit: big head, small body. Peeks up from the bottom edge to praise */
const PraiseRabbit = ({ svgRef }: { svgRef: RefObject<SVGSVGElement> }) => (
  <svg ref={svgRef} className="rabbit rabbit--praise" viewBox="0 0 120 156" aria-hidden="true">
    <g className="rabbit__body">
      <ellipse className="rabbit__fur" cx="60" cy="120" rx="22" ry="24" />
      <ellipse className="rabbit__belly" cx="60" cy="124" rx="13" ry="15" />
      <ellipse className="rabbit__fur rabbit__fur--outlined" cx="46" cy="144" rx="11" ry="5.5" strokeWidth="1.2" />
      <ellipse className="rabbit__fur rabbit__fur--outlined" cx="74" cy="144" rx="11" ry="5.5" strokeWidth="1.2" />
    </g>
    <g transform="translate(8.8 2) scale(1.6)"><Head /></g>
    <g className="rabbit__paws">
      <ellipse className="rabbit__fur rabbit__fur--outlined" cx="48" cy="101" rx="7" ry="6.5" strokeWidth="1.2" />
      <ellipse className="rabbit__fur rabbit__fur--outlined" cx="72" cy="101" rx="7" ry="6.5" strokeWidth="1.2" />
    </g>
  </svg>
);

/** Report a finished task to the rabbit (from "Check answers" and the AI check). `big` = large task: brighter praise */
export const cheer = (score: number, total: number, big = total >= 15) =>
  window.dispatchEvent(new CustomEvent("praise", { detail: { score, total, big } }));

const pick = (xs: string[]) => xs[Math.floor(Math.random() * xs.length)];
/** Always positive: the wording only gets warmer as the score grows */
function praise(score: number, total: number, big: boolean): [string, string] {
  const r = total ? score / total : 0, s = `${score} / ${total}`;
  if (big) return r >= 0.8 ? [pick(["Amazing work!", "Outstanding!", "You nailed it!"]), `${s} on a big task. Be proud of that!`]
    : r >= 0.5 ? [pick(["Great effort!", "Well done!"]), `${s} on a big task. Check the corrections and you're there.`]
    : ["You finished it!", `${s}. Big tasks take practice. Have another go!`];
  return r >= 0.9 ? [pick(["Brilliant!", "Spot on!", "Top marks!"]), s]
    : r >= 0.6 ? [pick(["Nice work!", "Good job!"]), `${s}. Look at the corrections.`]
    : ["Good try!", `${s}. Have another go!`];
}

/* Confetti for big tasks: end positions as ready-made values (no calc in CSS) */
const BITS = Array.from({ length: 14 }, (_, i) => {
  const a = -Math.PI * (0.1 + 0.8 * i / 13), d = 70 + (i % 3) * 22;
  return { "--confetti-x": `${Math.round(Math.cos(a) * d)}px`, "--confetti-y": `${Math.round(Math.sin(a) * d)}px`, "--confetti-rotation": `${(i * 67) % 360}deg` } as CSSProperties;
});

/** Rabbit that peeks out and praises after a finished task; hidden the rest of the time */
export function Praise() {
  const ref = useRef<SVGSVGElement>(null);
  const [show, setShow] = useState<{ n: number; big: boolean; title: string; text: string } | null>(null);
  useLook(ref);
  useEffect(() => {
    let n = 0;
    const on = (e: Event) => {
      const { score, total, big } = (e as CustomEvent<{ score: number; total: number; big: boolean }>).detail;
      const [title, text] = praise(score, total, big);
      setShow({ n: ++n, big, title, text });
    };
    window.addEventListener("praise", on);
    return () => window.removeEventListener("praise", on);
  }, []);
  if (!show) return null;
  return <div key={show.n} className={`praise${show.big ? " praise--big" : ""}`} onAnimationEnd={e => e.target === e.currentTarget && setShow(null)}>
    <p className="praise__speech" role="status"><b className="praise__speech-title">{show.title}</b> {show.text}</p>
    <button className="praise__rabbit-button" onClick={() => setShow(null)} aria-label="Close">
      <PraiseRabbit svgRef={ref} />
      {show.big && <span className="praise__confetti" aria-hidden="true">{BITS.map((style, i) => <i className="praise__confetti-piece" key={i} style={style} />)}</span>}
    </button>
  </div>;
}

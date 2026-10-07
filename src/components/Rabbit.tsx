/* The course mascot: an original SVG rabbit. Animation (blinking, ears, head tilt, hops) lives in styles.css, section "rabbit". */
import { RefObject, useEffect, useRef, useState } from "react";

const FUR = "#F3E7D7", SHADE = "#E2CFB6", BELLY = "#FBF5EC", EAR = "#EFAF95", CHEEK = "#F4BFA6", NAVY = "#1D2B4A", TERRA = "#C2643A";

/** Eyes and head follow the pointer: sets --rb-* offsets on the svg (used in styles.css, section "rabbit") */
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
        const d = Math.hypot(dx, dy) || 1, k = Math.min(1, d / 250);
        const x = dx / d * k, y = dy / d * k;
        const set = (name: string, v: number, unit: string) => el.style.setProperty(name, v.toFixed(2) + unit);
        set("--rb-rot", x * 7, "deg"); set("--rb-hx", x, "px"); set("--rb-hy", y * 0.6, "px");
        set("--rb-ex", x * 1.7, "px"); set("--rb-ey", y * 1.4, "px");
      });
    };
    window.addEventListener("pointermove", move, { passive: true });
    return () => { cancelAnimationFrame(raf); window.removeEventListener("pointermove", move); };
  }, [ref]);
}

/** Head with ears, drawn in a 64×64 box; the bigger rabbits scale it */
const Head = () => (
  <g className="rb-head">
    <g className="rb-ear rb-ear-l">
      <ellipse cx="24" cy="15" rx="6.5" ry="14" fill={FUR} transform="rotate(-12 24 15)" />
      <ellipse cx="24" cy="16.5" rx="3.2" ry="10" fill={EAR} transform="rotate(-12 24 16.5)" />
    </g>
    <g className="rb-ear rb-ear-r">
      <ellipse cx="40" cy="15" rx="6.5" ry="14" fill={FUR} transform="rotate(12 40 15)" />
      <ellipse cx="40" cy="16.5" rx="3.2" ry="10" fill={EAR} transform="rotate(12 40 16.5)" />
    </g>
    <ellipse cx="32" cy="41" rx="18" ry="16" fill={FUR} />
    <ellipse cx="32" cy="49" rx="9" ry="6" fill={SHADE} opacity=".55" />
    <circle cx="21.5" cy="46" r="3.2" fill={CHEEK} opacity=".75" />
    <circle cx="42.5" cy="46" r="3.2" fill={CHEEK} opacity=".75" />
    <g className="rb-eyes"><g className="rb-look">
      <ellipse cx="25" cy="39" rx="2.5" ry="3.1" fill={NAVY} />
      <ellipse cx="39" cy="39" rx="2.5" ry="3.1" fill={NAVY} />
      <circle cx="25.9" cy="37.9" r=".9" fill="#fff" />
      <circle cx="39.9" cy="37.9" r=".9" fill="#fff" />
    </g></g>
    <path className="rb-nose" d="M29.6 44.4Q32 43.2 34.4 44.4Q33.2 46.7 32 46.9Q30.8 46.7 29.6 44.4Z" fill={TERRA} />
    <path d="M32 46.9v1.5m0 0q-1.9 1.7-3.5.5m3.5-.5q1.9 1.7 3.5.5" fill="none" stroke={NAVY} strokeWidth="1" strokeLinecap="round" />
  </g>
);

/** Rabbit head for the header logo */
export function RabbitMark() {
  const ref = useRef<SVGSVGElement>(null);
  useLook(ref);
  return <svg ref={ref} className="rb rb-mark" viewBox="0 0 64 64" aria-hidden="true"><Head /></svg>;
}

/** Rabbit reading an open book, for the cover; hops when clicked */
export function RabbitReader() {
  const ref = useRef<SVGSVGElement>(null);
  const [n, setN] = useState(0);
  useLook(ref);
  return <button className="rb-btn" onClick={() => setN(n + 1)} aria-label="Make the rabbit hop">
    <span key={n} className={`rb-fx${n ? " hop" : ""}`}>
      <svg ref={ref} className="rb rb-reader" viewBox="0 0 240 240" aria-hidden="true">
        <ellipse cx="120" cy="222" rx="92" ry="9" fill="#000" opacity=".18" />
        <ellipse className="rb-body" cx="120" cy="178" rx="54" ry="44" fill={SHADE} />
        <g transform="translate(46 8) scale(2.3)"><Head /></g>
        <path d="M44 184Q83 174 120 190Q157 174 196 184V218Q157 209 120 223Q83 209 44 218Z" fill={TERRA} />
        <path d="M52 180Q88 170 120 186V216Q88 202 52 210Z" fill="#FFFDF9" />
        <path d="M188 180Q152 170 120 186V216Q152 202 188 210Z" fill="#FBF3E8" />
        <path d="M64 186q22-6 46 2M64 194q22-6 46 2M64 202q14-4 28 0M130 188q22-8 46-2M130 196q22-8 46-2M130 204q14-5 30-2" fill="none" stroke="#D9C8B0" strokeWidth="2.6" strokeLinecap="round" />
        <ellipse cx="92" cy="182" rx="11" ry="8.5" fill={FUR} />
        <ellipse cx="148" cy="182" rx="11" ry="8.5" fill={FUR} />
        <path d="M88 178.5v5M96 178.5v5M144 178.5v5M152 178.5v5" stroke={SHADE} strokeWidth="1.6" strokeLinecap="round" />
      </svg>
    </span>
  </button>;
}

/** Sitting rabbit for the corner companion */
const BuddySvg = ({ svgRef }: { svgRef: RefObject<SVGSVGElement> }) => (
  <svg ref={svgRef} className="rb rb-buddy" viewBox="0 0 120 142" aria-hidden="true">
    <ellipse cx="60" cy="137" rx="36" ry="5" fill="#1D2B4A" opacity=".16" />
    <g className="rb-body">
      <ellipse cx="60" cy="98" rx="31" ry="36" fill={FUR} />
      <ellipse cx="60" cy="106" rx="17" ry="22" fill={BELLY} />
      <ellipse cx="49" cy="93" rx="6.5" ry="8" fill={FUR} stroke={SHADE} strokeWidth="1.2" />
      <ellipse cx="71" cy="93" rx="6.5" ry="8" fill={FUR} stroke={SHADE} strokeWidth="1.2" />
      <ellipse cx="43" cy="131" rx="13" ry="6.5" fill={FUR} stroke={SHADE} strokeWidth="1.2" />
      <ellipse cx="77" cy="131" rx="13" ry="6.5" fill={FUR} stroke={SHADE} strokeWidth="1.2" />
    </g>
    <g transform="translate(24 -2) scale(1.125)"><Head /></g>
  </svg>
);

const TIPS = [
  "Say new phrases out loud: it helps them stick.",
  "Learn words in pairs: take a risk, face your fears.",
  "Read the task twice before you start writing.",
  "Check your word count before you finish an essay.",
  "Stuck? Do the Vocabulary tab first, then come back.",
];

/** Tell the corner rabbit how an exercise went (called by the "Check answers" button) */
export const cheer = (score: number, total: number) => window.dispatchEvent(new CustomEvent("buddy", { detail: { score, total } }));

type Mood = "hop" | "happy" | "sad";

/** Corner companion on every page except the cover: hops on page change, gives tips, reacts to checked answers */
export function Buddy({ page }: { page: string }) {
  const ref = useRef<SVGSVGElement>(null);
  const [hidden, setHidden] = useState(() => { try { return localStorage.getItem("ege:buddy") === "off"; } catch { return false; } });
  const [act, setAct] = useState<{ mood: Mood; n: number }>({ mood: "hop", n: 0 });
  const [say, setSay] = useState("");
  const tip = useRef(0);
  useLook(ref);

  const play = (mood: Mood, text = "") => { setAct(a => ({ mood, n: a.n + 1 })); setSay(text); };
  const toggle = (off: boolean) => { setHidden(off); try { localStorage.setItem("ege:buddy", off ? "off" : "on"); } catch { /* not remembered */ } };

  const first = useRef(true);
  useEffect(() => { if (first.current) { first.current = false; return; } play("hop"); }, [page]);

  useEffect(() => {
    const on = (e: Event) => {
      const { score, total } = (e as CustomEvent<{ score: number; total: number }>).detail;
      const r = total ? score / total : 0;
      if (r >= 0.9) play("happy", `Brilliant! ${score} / ${total}`);
      else if (r >= 0.6) play("happy", `Nice work: ${score} / ${total}. Look at the corrections and try again.`);
      else play("sad", `${score} / ${total}. Don't give up: look at the corrections and try again.`);
    };
    window.addEventListener("buddy", on);
    return () => window.removeEventListener("buddy", on);
  }, []);

  useEffect(() => { if (!say) return; const id = setTimeout(() => setSay(""), 5000); return () => clearTimeout(id); }, [say, act.n]);

  if (hidden) return <button className="bd-peek" onClick={() => toggle(false)} aria-label="Show the rabbit">
    <svg viewBox="0 0 40 26" aria-hidden="true"><g transform="translate(-4 -2)"><ellipse cx="16" cy="18" rx="5.5" ry="14" fill={FUR} transform="rotate(-10 16 18)" /><ellipse cx="16" cy="19" rx="2.6" ry="10" fill={EAR} transform="rotate(-10 16 19)" /><ellipse cx="32" cy="18" rx="5.5" ry="14" fill={FUR} transform="rotate(10 32 18)" /><ellipse cx="32" cy="19" rx="2.6" ry="10" fill={EAR} transform="rotate(10 32 19)" /></g></svg>
  </button>;

  return <div className="bd">
    <p className={`bd-say${say ? " on" : ""}`} role="status">{say}</p>
    <button className="bd-me" onClick={() => play("hop", TIPS[tip.current++ % TIPS.length])} aria-label="Rabbit: tap for a study tip">
      <span key={act.n} className={`rb-fx ${act.n ? act.mood : ""}`}>
        <BuddySvg svgRef={ref} />
        {act.mood === "happy" && act.n > 0 && <span className="bd-hearts" aria-hidden="true"><i>♥</i><i>✦</i><i>♥</i></span>}
      </span>
    </button>
    <button className="bd-x" onClick={() => toggle(true)} aria-label="Hide the rabbit">×</button>
  </div>;
}

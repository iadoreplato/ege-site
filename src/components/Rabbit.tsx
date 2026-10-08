/* The course mascot: an original SVG rabbit. Colours are CSS variables --color-rabbit-* (styles.css, :root);
   faces and animation live in styles.css, sections "rabbit", "praise" and "wandering rabbit". */
import { CSSProperties, RefObject, useEffect, useRef, useState } from "react";

/** The rabbit's moods; each one has its own face and movement (styles.css, .rabbit--<mood>) */
export type Mood = "delighted" | "pleased" | "thoughtful" | "upset" | "curious" | "surprised";

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

/** Light and shade that make the rabbit look round: light from the upper left, darker towards the edges.
    Stop colours come from CSS (.rabbit__light, .rabbit__tone, .rabbit__edge…); every rabbit svg carries the same defs */
const Gradients = () => (
  <defs>
    <radialGradient id="rabbit-fur" cx=".36" cy=".3" r=".85"><stop offset="0" className="rabbit__light" /><stop offset=".45" className="rabbit__tone" /><stop offset="1" className="rabbit__edge" /></radialGradient>
    <radialGradient id="rabbit-belly" cx=".45" cy=".35" r=".75"><stop offset="0" className="rabbit__light" /><stop offset="1" className="rabbit__tone" /></radialGradient>
    <radialGradient id="rabbit-ear" cx=".5" cy=".4" r=".7"><stop offset="0" className="rabbit__pink-light" /><stop offset="1" className="rabbit__pink-edge" /></radialGradient>
    <radialGradient id="rabbit-eye" cx=".35" cy=".3" r=".8"><stop offset="0" className="rabbit__eye-light" /><stop offset="1" className="rabbit__eye-edge" /></radialGradient>
    <radialGradient id="rabbit-nose" cx=".35" cy=".3" r=".8"><stop offset="0" className="rabbit__nose-light" /><stop offset="1" className="rabbit__nose-edge" /></radialGradient>
  </defs>
);

/** Head with ears, drawn in a 64×64 box; every rabbit scales it. Faces for all moods are drawn, CSS shows the right one */
const Head = () => (
  <g className="rabbit__head">
    <g className="rabbit__ear rabbit__ear--left">
      <ellipse className="rabbit__fur" cx="24" cy="15" rx="6.5" ry="14" transform="rotate(-12 24 15)" />
      <ellipse className="rabbit__ear-inner" cx="24" cy="16.5" rx="3.2" ry="10" transform="rotate(-12 24 16.5)" />
    </g>
    <g className="rabbit__ear rabbit__ear--right">
      <ellipse className="rabbit__fur" cx="40" cy="15" rx="6.5" ry="14" transform="rotate(12 40 15)" />
      <ellipse className="rabbit__ear-inner" cx="40" cy="16.5" rx="3.2" ry="10" transform="rotate(12 40 16.5)" />
    </g>
    <ellipse className="rabbit__fur" cx="32" cy="41" rx="18" ry="16" />
    <ellipse className="rabbit__shadow" cx="32" cy="49" rx="9" ry="6" opacity=".55" />
    <circle className="rabbit__pink rabbit__cheek" cx="21.5" cy="46" r="3.2" />
    <circle className="rabbit__pink rabbit__cheek" cx="42.5" cy="46" r="3.2" />
    <g className="rabbit__eyes"><g className="rabbit__pupils">
      <ellipse className="rabbit__eye" cx="25" cy="39" rx="2.5" ry="3.1" />
      <ellipse className="rabbit__eye" cx="39" cy="39" rx="2.5" ry="3.1" />
      <circle className="rabbit__eye-glint" cx="25.9" cy="37.9" r=".9" />
      <circle className="rabbit__eye-glint" cx="39.9" cy="37.9" r=".9" />
      <circle className="rabbit__eye-glint rabbit__eye-glint--small" cx="24.2" cy="40.5" r=".45" />
      <circle className="rabbit__eye-glint rabbit__eye-glint--small" cx="38.2" cy="40.5" r=".45" />
    </g></g>
    <path className="rabbit__line rabbit__happy-eyes" d="M22.3 40q2.7-3.4 5.4 0M36.3 40q2.7-3.4 5.4 0" strokeWidth="1.4" />
    <path className="rabbit__line rabbit__brows" d="M21.3 33.6l5.6-1.7M42.7 33.6l-5.6-1.7" strokeWidth="1.2" />
    <path className="rabbit__tear" d="M41.2 42.2q1.4 2.3 0 3.3q-1.4-1 0-3.3Z" />
    <path className="rabbit__nose" d="M29.6 44.4Q32 43.2 34.4 44.4Q33.2 46.7 32 46.9Q30.8 46.7 29.6 44.4Z" />
    <ellipse className="rabbit__nose-glint" cx="31.2" cy="44.5" rx=".8" ry=".4" />
    <path className="rabbit__line rabbit__mouth rabbit__mouth--calm" d="M32 46.9v1.5m0 0q-1.9 1.7-3.5.5m3.5-.5q1.9 1.7 3.5.5" strokeWidth="1" />
    <path className="rabbit__line rabbit__mouth rabbit__mouth--smile" d="M28.2 47.4q3.8 4 7.6 0" strokeWidth="1.2" />
    <path className="rabbit__line rabbit__mouth rabbit__mouth--sad" d="M29 49.8q3-2.4 6 0" strokeWidth="1.2" />
    <ellipse className="rabbit__mouth rabbit__mouth--open" cx="32" cy="49.4" rx="1.3" ry="1.7" />
  </g>
);

/** Whole rabbit facing the viewer: big head, small body. Used for praise and when the wandering rabbit stops */
const SittingRabbit = ({ svgRef, mood }: { svgRef?: RefObject<SVGSVGElement>; mood?: Mood }) => (
  <svg ref={svgRef} className={`rabbit rabbit--sitting${mood ? ` rabbit--${mood}` : ""}`} viewBox="0 0 120 156" aria-hidden="true">
    <Gradients />
    <ellipse className="rabbit__ground rabbit__ground--soft" cx="60" cy="150" rx="30" ry="4" />
    <g className="rabbit__body">
      <ellipse className="rabbit__fur" cx="60" cy="120" rx="22" ry="24" />
      <ellipse className="rabbit__belly" cx="60" cy="124" rx="13" ry="15" />
      <ellipse className="rabbit__fur rabbit__fur--outlined" cx="46" cy="144" rx="11" ry="5.5" strokeWidth="1.2" />
      <ellipse className="rabbit__fur rabbit__fur--outlined" cx="74" cy="144" rx="11" ry="5.5" strokeWidth="1.2" />
      <ellipse className="rabbit__contact-shadow" cx="60" cy="98" rx="21" ry="6" />
    </g>
    <g transform="translate(8.8 2) scale(1.6)"><Head /></g>
    <g className="rabbit__paws">
      <ellipse className="rabbit__fur rabbit__fur--outlined" cx="48" cy="101" rx="7" ry="6.5" strokeWidth="1.2" />
      <ellipse className="rabbit__fur rabbit__fur--outlined" cx="72" cy="101" rx="7" ry="6.5" strokeWidth="1.2" />
    </g>
  </svg>
);

/** Rabbit head for the header logo */
export function RabbitMark() {
  const ref = useRef<SVGSVGElement>(null);
  useLook(ref);
  return <svg ref={ref} className="rabbit rabbit--logo" viewBox="0 0 64 64" aria-hidden="true"><Gradients /><Head /></svg>;
}

/* What the cover rabbit does when it is clicked, in turn */
const COVER_REACTIONS: { mood: Mood; text: string }[] = [
  { mood: "delighted", text: "Hi! Ready to practise?" },
  { mood: "surprised", text: "Oh! You found me." },
  { mood: "curious", text: "What are we learning today?" },
  { mood: "pleased", text: "Pick a unit and let's go!" },
  { mood: "delighted", text: "Hey, that tickles!" },
  { mood: "thoughtful", text: "Tip: start with the Vocabulary tab." },
];

/** Rabbit reading an open book, for the cover: smiles on hover, reacts to every click with a new mood and a few words */
export function RabbitReader() {
  const ref = useRef<SVGSVGElement>(null);
  const [n, setN] = useState(0);
  useLook(ref);
  const reaction = n ? COVER_REACTIONS[(n - 1) % COVER_REACTIONS.length] : null;
  return <button className="cover__rabbit-button" onClick={() => setN(n + 1)} aria-label="Talk to the rabbit">
    {reaction && <span key={n} className="cover__rabbit-speech" role="status">{reaction.text}</span>}
    <span key={`hop${n}`} className={`rabbit-hop${n ? " rabbit-hop--active" : ""}`}>
      <svg ref={ref} className={`rabbit rabbit--reader rabbit--${reaction ? reaction.mood : "calm"}`} viewBox="0 0 240 240" aria-hidden="true">
        <Gradients />
        <ellipse className="rabbit__ground" cx="120" cy="222" rx="92" ry="9" />
        <ellipse className="rabbit__body rabbit__fur" cx="120" cy="180" rx="42" ry="36" />
        <ellipse className="rabbit__contact-shadow" cx="120" cy="146" rx="38" ry="9" />
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

/** Ask the rabbit to peek out with a mood and a short message (big = jumps out fully) */
export const rabbitSay = (mood: Mood, title: string, text = "", big = false) =>
  window.dispatchEvent(new CustomEvent("rabbit-say", { detail: { mood, title, text, big } }));

const pick = (xs: string[]) => xs[Math.floor(Math.random() * xs.length)];
/** Reaction to a finished task: glad when it went well, a little upset (but encouraging) when it did not */
export function cheer(score: number, total: number, big = total >= 15) {
  const r = total ? score / total : 0, s = `${score} / ${total}`;
  if (r >= 0.9) return rabbitSay("delighted", pick(big ? ["Amazing work!", "Outstanding!", "You nailed it!"] : ["Brilliant!", "Spot on!", "Top marks!"]), big ? `${s} on a big task. Be proud of that!` : s, big);
  if (r >= 0.6) return rabbitSay("pleased", pick(["Nice work!", "Good job!"]), `${s}. Look at the corrections.`, big);
  if (r >= 0.3) return rabbitSay("thoughtful", pick(["Almost there…", "Not bad…"]), `${s}. Check the corrections and try again.`);
  rabbitSay("upset", pick(["Oh no…", "Hmm, that was tricky."]), `${s}. Don't worry: look at the corrections and have another go.`);
}

/* Confetti for big tasks: end positions as ready-made values (no calc in CSS) */
const BITS = Array.from({ length: 14 }, (_, i) => {
  const a = -Math.PI * (0.1 + 0.8 * i / 13), d = 70 + (i % 3) * 22;
  return { "--confetti-x": `${Math.round(Math.cos(a) * d)}px`, "--confetti-y": `${Math.round(Math.sin(a) * d)}px`, "--confetti-rotation": `${(i * 67) % 360}deg` } as CSSProperties;
});

type Message = { n: number; mood: Mood; title: string; text: string; big: boolean };

/** Rabbit that peeks up from the bottom edge to react to what the student does; hidden the rest of the time */
export function Praise() {
  const ref = useRef<SVGSVGElement>(null);
  const [show, setShow] = useState<Message | null>(null);
  useLook(ref);
  useEffect(() => {
    let n = 0;
    const on = (e: Event) => setShow({ n: ++n, ...(e as CustomEvent<Omit<Message, "n">>).detail });
    window.addEventListener("rabbit-say", on);
    return () => window.removeEventListener("rabbit-say", on);
  }, []);
  if (!show) return null;
  return <div key={show.n} className={`praise praise--${show.mood}${show.big ? " praise--big" : ""}`} onAnimationEnd={e => e.target === e.currentTarget && setShow(null)}>
    <p className="praise__speech" role="status"><b className="praise__speech-title">{show.title}</b> {show.text}</p>
    <button className="praise__rabbit-button" onClick={() => setShow(null)} aria-label="Close">
      <SittingRabbit svgRef={ref} mood={show.mood} />
      {show.mood === "delighted" && <span className="praise__hearts" aria-hidden="true"><i>♥</i><i>♥</i><i>♥</i></span>}
      {show.big && show.mood === "delighted" && <span className="praise__confetti" aria-hidden="true">{BITS.map((style, i) => <i className="praise__confetti-piece" key={i} style={style} />)}</span>}
    </button>
  </div>;
}

/** The rabbit in profile, facing right, for walking; legs and head move in CSS (.rabbit--side) */
const SideRabbit = () => (
  <svg className="rabbit rabbit--side" viewBox="0 0 120 100" aria-hidden="true">
    <Gradients />
    <ellipse className="rabbit__ground rabbit__ground--soft" cx="56" cy="95" rx="40" ry="3.5" />
    <ellipse className="rabbit__fur rabbit__leg rabbit__leg--back" cx="40" cy="86" rx="15" ry="5" />
    <ellipse className="rabbit__fur" cx="50" cy="63" rx="30" ry="22" />
    <ellipse className="rabbit__fur" cx="35" cy="68" rx="16" ry="15" />
    <circle className="rabbit__belly" cx="19" cy="57" r="7" />
    <ellipse className="rabbit__fur rabbit__leg rabbit__leg--front" cx="72" cy="81" rx="5" ry="9" />
    <g className="rabbit__profile-head">
      <ellipse className="rabbit__fur rabbit__ear--far" cx="67" cy="20" rx="5" ry="14" transform="rotate(-32 67 20)" />
      <g className="rabbit__ear rabbit__ear--left">
        <ellipse className="rabbit__fur" cx="75" cy="18" rx="5.5" ry="15" transform="rotate(-18 75 18)" />
        <ellipse className="rabbit__ear-inner" cx="75" cy="19" rx="2.6" ry="10.5" transform="rotate(-18 75 19)" />
      </g>
      <ellipse className="rabbit__fur" cx="82" cy="42" rx="17" ry="15" />
      <ellipse className="rabbit__fur" cx="95" cy="47" rx="7" ry="6" />
      <circle className="rabbit__pink rabbit__cheek" cx="89" cy="50" r="3" />
      <g className="rabbit__eyes">
        <ellipse className="rabbit__eye" cx="88" cy="39" rx="2.4" ry="3" />
        <circle className="rabbit__eye-glint" cx="88.8" cy="38" r=".8" />
      </g>
      <ellipse className="rabbit__nose" cx="101" cy="46" rx="1.8" ry="1.4" />
      <path className="rabbit__line" d="M100.5 48q-1.5 2.5-4 2" strokeWidth="1" />
    </g>
  </svg>
);

const random = (min: number, max: number) => min + Math.random() * (max - min);
const reducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const hasMouse = () => window.matchMedia("(pointer: fine)").matches;
const WIDTH = 96; // px, wanderer size on the screen (.wanderer__rabbit)

type Phase = "enter" | "walk" | "look" | "greet" | "turn" | "leave";
/** x, y: where the rabbit stops (px from the left / from the bottom); from: side it comes from; back: leaves the same way */
type Walk = { n: number; from: "left" | "right"; x: number; y: number; back: boolean; phase: Phase };
const PHASES: Record<Phase, [Phase | null, number]> = { enter: ["walk", 50], walk: ["look", 3000], look: ["turn", 3400], greet: ["turn", 1800], turn: ["leave", 50], leave: [null, 3000] };

/** Now and then a rabbit hops along the bottom of the page in profile, turns to look around and hops away.
    With a mouse: when the cursor rests in one place, the rabbit hops over at that height and looks at it. Tap it to say hello */
export function Wanderer() {
  const ref = useRef<SVGSVGElement>(null);
  const [walk, setWalk] = useState<Walk | null>(null);
  const busy = useRef(false), lastVisit = useRef(0), n = useRef(0);
  const to = (phase: Phase) => setWalk(w => (w ? { ...w, phase } : w));
  useLook(ref);
  busy.current = !!walk;

  useEffect(() => {
    if (reducedMotion()) return;
    const go = (w: Omit<Walk, "n" | "phase">) => { if (!busy.current && !document.hidden) setWalk({ ...w, n: ++n.current, phase: "enter" }); };
    // a stroll along the bottom every 1–2 minutes
    let stroll = 0;
    const plan = (delay: number) => { stroll = window.setTimeout(() => { go({ from: Math.random() < .5 ? "left" : "right", x: innerWidth * random(.25, .65), y: 0, back: false }); plan(random(60, 120) * 1000); }, delay); };
    plan(random(30, 60) * 1000);
    // a visit to the place where the cursor has rested for 5 seconds (at most every 45 seconds)
    let idle = 0;
    const onMove = (e: PointerEvent) => {
      clearTimeout(idle);
      if (!hasMouse()) return;
      const { clientX: cx, clientY: cy } = e;
      idle = window.setTimeout(() => {
        if (Date.now() - lastVisit.current < 45000 || document.activeElement?.matches("input, textarea")) return;
        lastVisit.current = Date.now();
        const from = cx > innerWidth / 2 ? "right" : "left";
        const x = from === "left" ? Math.max(8, cx - WIDTH - 24) : Math.min(innerWidth - WIDTH - 8, cx + 24);
        go({ from, x, y: Math.max(0, innerHeight - cy - WIDTH * 0.6), back: true });
      }, 5000);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => { clearTimeout(stroll); clearTimeout(idle); window.removeEventListener("pointermove", onMove); };
  }, []);

  // enter → walk to the stop → turn and look around → turn back → leave
  useEffect(() => {
    if (!walk) return;
    const [phase, delay] = PHASES[walk.phase];
    const id = window.setTimeout(() => (phase ? to(phase) : setWalk(null)), delay);
    return () => clearTimeout(id);
  }, [walk?.n, walk?.phase]);

  if (!walk) return null;
  const { from, x, y, back, phase } = walk;
  const outside = (side: "left" | "right") => (side === "left" ? -WIDTH - 20 : innerWidth + 20);
  const exit = back ? from : from === "left" ? "right" : "left";
  const left = phase === "enter" ? outside(from) : phase === "leave" ? outside(exit) : x;
  const moving = phase === "walk" || phase === "leave";
  const facing = phase === "leave" || phase === "turn" ? (exit === "right" ? "right" : "left") : (from === "left" ? "right" : "left");
  return <div className={`wanderer${moving ? " wanderer--moving" : ""} wanderer--facing-${facing}`} style={{ left, bottom: y }}>
    {phase === "greet" && <span className="wanderer__speech" role="status">Hi there!</span>}
    <button className="wanderer__rabbit" onClick={() => (phase === "look" || phase === "walk") && to("greet")} aria-label="Say hello to the rabbit">
      {phase === "look" || phase === "greet"
        ? <span className="wanderer__turn"><SittingRabbit svgRef={ref} mood={phase === "look" ? "curious" : "delighted"} /></span>
        : <span className="wanderer__body"><SideRabbit /></span>}
    </button>
  </div>;
}

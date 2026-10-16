/* The course mascot: an original SVG rabbit. Colours are CSS variables --color-rabbit-* (styles.css, :root);
   faces and animation live in styles.css, sections "rabbit", "praise" and "peeking rabbit".
   КРОЛИК-МАСКОТ. Нарисован в SVG прямо в коде; цвета — переменные --color-rabbit-* в styles.css,
   лица и движения — в styles.css (разделы rabbit, praise, peeking rabbit). Здесь:
   - RabbitMark — голова в логотипе; RabbitReader — кролик с книгой на обложке;
   - rabbitSay, cheer — «позвать» кролика из любого места сайта; Praise — кролик, который хвалит;
   - Peeker — кролик, который раз в 4–5 минут выглядывает из-за края экрана. */
import { CSSProperties, RefObject, useEffect, useRef, useState } from "react";
import { play } from "../sound";

/** The rabbit's moods; each one has its own face and movement (styles.css, .rabbit--<mood>)
    Настроения: delighted — восторг, pleased — доволен, thoughtful — задумался, upset — огорчён,
    curious — любопытство, surprised — удивление. У каждого своё лицо и движение (класс rabbit--<настроение>) */
export type Mood = "delighted" | "pleased" | "thoughtful" | "upset" | "curious" | "surprised";

/** Eyes and head follow the pointer: sets --rabbit-* offsets on the svg
    Свой хук: глаза и голова кролика следят за курсором. На каждое движение мыши считает, куда смотреть
    (направление от кролика к курсору), и записывает сдвиги в CSS-переменные --rabbit-* на рисунке.
    requestAnimationFrame — пересчёт не чаще, чем обновляется экран. ref — ссылка на нужный рисунок <svg> */
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
    Stop colours come from CSS (.rabbit__light, .rabbit__tone, .rabbit__edge…); every rabbit svg carries the same defs
    Градиенты для объёма: свет слева сверху, к краям темнее. Цвета задаются в CSS. Каждый рисунок кролика включает их */
const Gradients = () => (
  <defs>
    <radialGradient id="rabbit-fur" cx=".36" cy=".3" r=".85"><stop offset="0" className="rabbit__light" /><stop offset=".45" className="rabbit__tone" /><stop offset="1" className="rabbit__edge" /></radialGradient>
    <radialGradient id="rabbit-belly" cx=".45" cy=".35" r=".75"><stop offset="0" className="rabbit__light" /><stop offset="1" className="rabbit__tone" /></radialGradient>
    <radialGradient id="rabbit-ear" cx=".5" cy=".4" r=".7"><stop offset="0" className="rabbit__pink-light" /><stop offset="1" className="rabbit__pink-edge" /></radialGradient>
    <radialGradient id="rabbit-eye" cx=".35" cy=".3" r=".8"><stop offset="0" className="rabbit__eye-light" /><stop offset="1" className="rabbit__eye-edge" /></radialGradient>
    <radialGradient id="rabbit-nose" cx=".35" cy=".3" r=".8"><stop offset="0" className="rabbit__nose-light" /><stop offset="1" className="rabbit__nose-edge" /></radialGradient>
  </defs>
);

/** Head with ears, drawn in a 64×64 box; every rabbit scales it. Faces for all moods are drawn, CSS shows the right one
    Голова с ушами в квадрате 64×64; каждый кролик масштабирует её под себя (transform scale).
    Нарисованы сразу все лица (глаза, брови, слеза, разные рты), а CSS по настроению показывает нужные */
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

/** Whole rabbit facing the viewer: big head, small body. Used for praise and for the rabbit peeking out from the screen edge
    Кролик целиком, сидя лицом к нам: большая голова, маленькое тело. Для похвалы (Praise) и выглядывания (Peeker).
    svgRef — ссылка на рисунок (для слежения за курсором), mood — настроение */
const SittingRabbit = ({ svgRef, mood }: { svgRef?: RefObject<SVGSVGElement>; mood?: Mood }) => (
  <svg ref={svgRef} className={`rabbit rabbit--sitting${mood ? ` rabbit--${mood}` : ""}`} viewBox="0 0 120 156" aria-hidden="true">
    <Gradients />
    <ellipse className="rabbit__ground rabbit__ground--soft" cx="60" cy="150" rx="30" ry="4" />
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

/** Rabbit head for the header logo
    Голова кролика в логотипе шапки; следит за курсором, при наведении шевелит ушами (CSS) */
export function RabbitMark() {
  const ref = useRef<SVGSVGElement>(null);
  useLook(ref);
  return <svg ref={ref} className="rabbit rabbit--logo" viewBox="0 0 64 64" aria-hidden="true"><Gradients /><Head /></svg>;
}

/* What the cover rabbit does when it is clicked, in turn
   Реакции кролика на обложке по кругу: настроение и фраза. Можно менять тексты и добавлять строки */
const COVER_REACTIONS: { mood: Mood; text: string }[] = [
  { mood: "delighted", text: "Hi! Ready to practise?" },
  { mood: "surprised", text: "Oh! You found me." },
  { mood: "curious", text: "What are we learning today?" },
  { mood: "pleased", text: "Pick a unit and let's go!" },
  { mood: "delighted", text: "Hey, that tickles!" },
  { mood: "thoughtful", text: "Tip: start with the Vocabulary tab." },
];

/** Rabbit reading an open book, for the cover: smiles on hover, reacts to every click with a new mood and a few words
    Кролик с книгой на обложке. n — сколько раз нажали; реакция берётся из COVER_REACTIONS по кругу (остаток от деления).
    key={n} заставляет React пересоздать реплику и прыжок, чтобы анимация проигрывалась заново при каждом нажатии */
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

/** Ask the rabbit to peek out with a mood and a short message (big = jumps out fully)
    ПОЗВАТЬ КРОЛИКА ИЗ ЛЮБОГО МЕСТА САЙТА: rabbitSay("pleased", "Заголовок", "текст").
    Отправляет событие "rabbit-say" на всё окно; его слушает компонент Praise. big — выпрыгнуть целиком с конфетти */
export const rabbitSay = (mood: Mood, title: string, text = "", big = false) =>
  window.dispatchEvent(new CustomEvent("rabbit-say", { detail: { mood, title, text, big } }));

/** Случайный элемент массива (чтобы фразы похвалы не повторялись) */
const pick = (xs: string[]) => xs[Math.floor(Math.random() * xs.length)];
/** Reaction to a finished task: glad when it went well, a little upset (but encouraging) when it did not
    Реакция на результат: score — сколько верно, total — сколько всего. Доля верных r:
    90 % и больше — восторг, 60 % — доволен, 30 % — задумался, меньше — огорчён, но подбадривает.
    big (по умолчанию — если 15 пунктов и больше) — крупное задание: другие фразы и прыжок с конфетти */
export function cheer(score: number, total: number, big = total >= 15) {
  const r = total ? score / total : 0, s = `${score} / ${total}`;
  play(r >= 0.9 ? "perfect" : r >= 0.6 ? "good" : "soft"); // звук и вибрация (sound.ts)
  if (r >= 0.9) return rabbitSay("delighted", pick(big ? ["Amazing work!", "Outstanding!", "You nailed it!"] : ["Brilliant!", "Spot on!", "Top marks!"]), big ? `${s} on a big task. Be proud of that!` : s, big);
  if (r >= 0.6) return rabbitSay("pleased", pick(["Nice work!", "Good job!"]), `${s}. Look at the corrections.`, big);
  if (r >= 0.3) return rabbitSay("thoughtful", pick(["Almost there…", "Not bad…"]), `${s}. Check the corrections and try again.`);
  rabbitSay("upset", pick(["Oh no…", "Hmm, that was tricky."]), `${s}. Don't worry: look at the corrections and have another go.`);
}

/* Confetti for big tasks: end positions as ready-made values (no calc in CSS)
   Конфетти для крупных заданий: 14 кусочков разлетаются веером вверх. Конечные точки считаются здесь, в JS
   (сборщик зависает на calc в CSS), и передаются в CSS-переменных --confetti-x, --confetti-y, --confetti-rotation */
const BITS = Array.from({ length: 14 }, (_, i) => {
  const a = -Math.PI * (0.1 + 0.8 * i / 13), d = 70 + (i % 3) * 22;
  return { "--confetti-x": `${Math.round(Math.cos(a) * d)}px`, "--confetti-y": `${Math.round(Math.sin(a) * d)}px`, "--confetti-rotation": `${(i * 67) % 360}deg` } as CSSProperties;
});

/** Одна реплика кролика: n — порядковый номер (чтобы новая реплика перезапускала анимацию), настроение, заголовок, текст */
type Message = { n: number; mood: Mood; title: string; text: string; big: boolean };

/** Rabbit that peeks up from the bottom edge to react to what the student does; hidden the rest of the time
    Кролик-похвала: слушает событие "rabbit-say" и выглядывает снизу справа с репликой. Исчезает сам,
    когда закончится CSS-анимация (onAnimationEnd), или по нажатию. Остальное время его нет на странице */
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

/** Случайное число от min до max */
const random = (min: number, max: number) => min + Math.random() * (max - min);
/** Пользователь отключил анимацию в настройках системы? Тогда кролик не выглядывает */
const reducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/** Край экрана: снизу, слева, справа */
type Edge = "bottom" | "left" | "right";
/** edge: where the rabbit peeks out from; at: its place along that edge (% of the screen width or height)
    Одно появление: edge — из-за какого края, at — место вдоль края (% ширины или высоты экрана), greet — нажали ли на кролика */
type Peek = { n: number; edge: Edge; at: number; greet: boolean };
/** Из-за каких краёв выглядывать; "bottom" указан дважды — снизу кролик появляется чаще. Убрать слово — край отключится */
const EDGES: Edge[] = ["bottom", "bottom", "left", "right"];

/** Every 4–5 minutes the rabbit peeks out from behind an edge of the screen (bottom, left or right), looks about and hides.
    Tap it to say hello
    Выглядывающий кролик. ЧАСТОТА: random(240, 300) * 1000 — раз в 240–300 секунд (4–5 минут).
    plan() ставит таймер; когда он срабатывает, выбирается край и место, и сразу планируется следующее появление.
    Если вкладка свёрнута (document.hidden), появление пропускается. Движение «выглянуть и спрятаться» — в CSS (.peeker) */
export function Peeker() {
  const ref = useRef<SVGSVGElement>(null);
  const [peek, setPeek] = useState<Peek | null>(null);
  useLook(ref);

  useEffect(() => {
    if (reducedMotion()) return;
    let n = 0, id = 0;
    const plan = () => {
      id = window.setTimeout(() => {
        const edge = EDGES[Math.floor(Math.random() * EDGES.length)];
        if (!document.hidden) setPeek({ n: ++n, edge, at: edge === "bottom" ? random(10, 80) : random(20, 60), greet: false });
        plan();
      }, random(240, 300) * 1000);
    };
    plan();
    return () => clearTimeout(id);
  }, []);

  if (!peek) return null;
  const { edge, at, greet } = peek;
  return <div key={peek.n} className={`peeker peeker--${edge}`} style={{ "--peek-at": `${at}%` } as CSSProperties}>
    {greet && <span className="peeker__speech" role="status">Hi there!</span>}
    <button className="peeker__rabbit" onClick={() => setPeek({ ...peek, greet: true })} onAnimationEnd={e => e.target === e.currentTarget && setPeek(null)} aria-label="Say hello to the rabbit">
      {/* on the side edges the rabbit is turned, so its eyes do not follow the pointer there */}
      <SittingRabbit svgRef={edge === "bottom" ? ref : undefined} mood={greet ? "delighted" : "curious"} />
    </button>
  </div>;
}

import { SpeakTask } from "../types";
import { Chips, Rich } from "./text";
import { Head } from "./Exercises";

/** "Speaking" tab: short tasks outside the exam format that make students use the unit vocabulary aloud */
export default function Speaking({ tasks }: { tasks: SpeakTask[] }) {
  return <>{tasks.map((t, i) => <div className="exercise" key={t.title}>
    <Head n={i + 1} title={t.title} instr={t.task} />
    {t.prompts && <ul className="plan-list">{t.prompts.map(p => <Rich as="li" className="plan-list__item" key={p} html={p} />)}</ul>}
    <div className="useful-language"><span className="useful-language__title">Useful language</span><Chips items={t.vocab} /></div>
  </div>)}</>;
}

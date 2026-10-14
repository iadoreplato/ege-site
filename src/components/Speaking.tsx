/* ВКЛАДКА SPEAKING: короткие задания вне формата экзамена (работа в парах), чтобы использовать лексику юнита вслух.
   Ничего не проверяется. Вкладка показывается, только если у юнита в JSON есть поле `speaking`. */
import { SpeakTask } from "../types";
import { Chips, Text } from "./text";
import { Head } from "./Exercises";

/** "Speaking" tab: short tasks outside the exam format that make students use the unit vocabulary aloud
    Каждое задание: заголовок с номером, текст задания, подсказки (prompts, если есть) и «Useful language» (vocab) */
export default function Speaking({ tasks }: { tasks: SpeakTask[] }) {
  return <>{tasks.map((t, i) => <div className="exercise" key={t.title}>
    <Head n={i + 1} title={t.title} instr={t.task} />
    {t.prompts && <ul className="plan-list">{t.prompts.map((p, k) => <Text as="li" className="plan-list__item" key={k} value={p} />)}</ul>}
    <div className="useful-language"><span className="useful-language__title">Useful language</span><Chips items={t.vocab} /></div>
  </div>)}</>;
}

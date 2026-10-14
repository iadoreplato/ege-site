/* ТИПЫ ДАННЫХ: как выглядит контент из src/content/*.json.
   Тип — это описание: какие поля есть у объекта и что в них лежит. На сайт типы не влияют,
   их проверяет TypeScript при `npm run build` и подсказывает, если перепутано поле.
   Как читать: `title: string` — строка; `num: number` — число; `?` — поле необязательное;
   `X[]` — массив из X; `[string, string]` — пара строк; `"a" | "b"` — одно из двух значений.
   Типы нарочно нестрогие (много `any`): JSON — единственный источник и для сайта, и для PDF. */

// Content types (loose on purpose: the JSON is the single source of truth for PDF and site)
/** «Что угодно»: проверка типа отключена. Для разнообразных блоков, где поля зависят от `type` */
export type Any = any;
/** Text from the content: a plain string, or the text plus its meaning. key = key elements to highlight
    (whole words; "-ing" = a word ending), example = language examples, uncountable = show the (U) badge
    Текст из JSON: просто строка или объект { text, key, example, uncountable } (см. docs/CODE.md, 3.1) */
export type RichText = string | { text: string; key?: string[]; example?: string[]; uncountable?: boolean };
/** Vocabulary entry: one word or phrase. Entries with the same `group` number are shown together in the word list
    Запись лексики. en — слово, ru — перевод, ex — пример, key — что подсветить, group — номер строки для синонимов,
    img — картинка; sports, prep, note — только для таблицы «где занимаются спортом» (блок venues) */
export interface VocabItem { en: string; ru: string; ex?: string; key?: string[]; uncountable?: boolean; group?: number; img?: string; sports?: string; prep?: string; note?: string }
/** Весь universal.json: страницы раздела «The exam» и шаблоны ответов frames (t4, t37, t38) */
export interface Universal { title: string; subtitle: string; source_note: string; cover_pics: string[]; pages: Page[]; frames: Record<string, [string, string][]> }
/** Страница универсального блока: kick — надпись над заголовком, lede — подзаголовок, pics — картинки, blocks — содержимое */
export interface Page { kick: string; title: string; lede: string; pics: string[]; blocks: Any[] }
/** Юнит модуля: лексика (vocab), упражнения (exercises), экзаменационные задания (speech — массив групп),
    вкладка Speaking (speaking, необязательно) и быстрый тест для вкладки Memorise (cards, необязательно) */
export interface Unit { num: number; title: string; lede: string; pics: string[]; vocab: Any[]; exercises: Exercise[]; speech: Any[][]; speaking?: SpeakTask[]; cards?: CardTests }
/** Mini-review after every two units: EGE-style multiple choice (Tasks 30–36 format) + key word transformations.
    `after` = number of the unit it follows; cloze `key` = correct option (1–4) for each gap in order
    Мини-повторение: after — после какого юнита; cloze — тексты в формате 30–36; key — номера верных вариантов по порядку;
    transform — перефраз [исходное, КЛЮЧЕВОЕ СЛОВО, начало ___ конец, ответ] */
export interface Review { after: number; cloze: { title: string; text: string; opts: Any[]; key: number[] }[]; transform: [string, string, string, string][] }
/** Quick test in the Practice tab: quick gaps [sentence with ___, answer] and vocabulary in contrast [sentence with {a|b|c}, answer]
    Быстрый тест: gaps — [предложение с ___, ответ]; contrast — [предложение с {a|b|c}, ответ] */
export interface CardTests { gaps: [string, string][]; contrast: [string, string][] }
/** "Speaking" tab: a short task outside the exam format; `vocab` = useful language shown with the task
    Задание вкладки Speaking: заголовок, текст задания, подсказки (prompts) и полезные фразы (vocab) */
export interface SpeakTask { title: string; task: string; prompts?: RichText[]; vocab: RichText[] }
/** Упражнение вкладки Practice: вид (type), заголовок, инструкция (instr) и пункты (items; формат зависит от type) */
export interface Exercise { type: "collocation" | "choose" | "transform" | "translate" | "gaps"; title: string; instr: string; items: Any[] }
/** Весь модуль (sport.json, russia.json). id — часть адреса страницы; typology — банк сравнений для задания 4;
    revision — итоговое повторение; reviews — мини-повторения; ad_keys — образцы вопросов к заданию 2;
    photo_pool_base — общие фразы к заданию 4; data_verbs — глаголы для описания данных в задании 38 */
export interface Topic {
  id: string; title: string; subtitle: string; cover_pics: string[]; typology: Any[]; units: Unit[];
  revision: Any; reviews?: Review[]; ad_keys: [string, string][]; photo_pool_base: { describe: string[]; opinion: string[]; close: string[] }; data_verbs: string[];
}

/* LISTENING: задания на аудирование из src/content/listening/<module>-u<N>.json (см. docs/CODE.md, 3.7).
   Общие поля у всех трёх форматов; поле task говорит, какой формат, и от него зависят остальные поля
   (это «дискриминируемый union»: TypeScript по значению task знает, есть ли options, statements или questions). */
/** Общие поля. speakers — кто какой голос озвучивает (на сайте не показывается); script — текст записи по репликам
    (who — кто говорит, text — что); key — правильные ответы по порядку */
interface ListeningBase { id: string; module: string; unit: number; title: string; speakers: Record<string, string>; script: { who: string; text: string }[]; key: number[] }
/** Задание 1: 6 говорящих A–F, 7 утверждений (options), key — номер утверждения для каждого говорящего */
export interface Listening1 extends ListeningBase { task: 1; options: string[] }
/** Задание 2: 7 утверждений A–G, key — 1 True, 2 False, 3 Not stated */
export interface Listening2 extends ListeningBase { task: 2; statements: string[] }
/** Задания 3–9: 7 вопросов по 3 варианта (q — вопрос, options — варианты), key — номер верного варианта (1–3) */
export interface Listening3 extends ListeningBase { task: 3; questions: { q: string; options: string[] }[] }
export type ListeningTask = Listening1 | Listening2 | Listening3;
/** Запись в public/audio/manifest.json: файл, длительность в секундах, mock — запись-заглушка (такую не показываем) */
export type AudioInfo = { file: string; seconds: number; hash?: string; mock?: boolean };

# План доработки (от 2026-10-08)

Исходное задание Дарьи: 13 пунктов (карточки, упражнения, кролик, мобильная версия, значок U, блок Speaking,
мини-Revision, уровень B2+, одна запись на задание 3, таймер у говорения, фото в заданиях 2–4, структура
«Чтение» и «Аудирование»). Общие требования: все цвета только через переменные в `:root` (styles.css),
код без дублирования, проверка контента. Правила контента — в CLAUDE.md.

Решения Дарьи:
- PDF пока не собираем (но названия старых полей JSON не менять, новое — новыми полями).
- Коммиты в git Дарья делает сама.
- Контент пишем только для модуля Sport, юниты 1 и 2. Структура — для всего сайта.
- После каждого этапа: `npm run build` и короткий отчёт.

## Этапы
1. [x] Цвета → `:root` с комментарием (styles.css, Speech.tsx, tailwind.css, components/ui);
   значок (U) — `.u.u.u.u` кружок 15px; мобильная версия 430px — блок «phones» в конце styles.css,
   все 52 маршрута без горизонтальной прокрутки.
2. [x] Кролик (Rabbit.tsx: Praise + cheer(score,total,big); CheckBar big; Revision big; AiCheck → cheer): перерисовать (голова крупнее, тело меньше, уши прежние), цвета — переменные `--rb-*`;
   выглядывает снизу и хвалит после «Check answers»; крупные задания (15+ пунктов, Revision, 11, 30–36) — ярче;
   только позитив; CSS-анимация; prefers-reduced-motion.
3. [x] (SpeakBar в Recorder.tsx, Photo.tsx + slotName, public/photos/README.md со списком имён) Задание 3: одна запись на всё интервью; таймер без записи рядом с кнопкой записи во всех заданиях
   говорения; фото в заданиях 2/3/4 из `public/photos/<модуль>-u<юнит>-task<N>-photo<k>.jpg`, иначе иконка.
4. [x] Проверка и усиление контента Sport u1–u2 (+ их задания в Revision), список исправлений.
5. [x] Упражнения Sport u1–u2: 4 старых до 12 пунктов + 2 новых по 12 (форматы collocation / choose).
6. [x] Вкладка Speaking (Vocabulary → Practice → Speaking → Exam tasks), поле `speaking` в юните;
   контент для u1–u2; вкладка скрыта, если данных нет.
7. [x] Мини-Revision после каждых двух юнитов (поле `reviews` в модуле): multiple choice в стиле ЕГЭ
   + сложный перефраз B2+; контент — после u1–u2. Итоговый Revision модуля остаётся.
8. [x] Раздел «Карточки» в меню: заучивание (переворот RU→EN, из лексики всех модулей),
   проверка (соотнести пары), тест (пропуски + Vocabulary in contrast; поле `cards`, контент для u1–u2).
9. [x] «Свободная практика»: «Чтение» и «Аудирование» — только структура, компоненты и шаблоны
   `src/content/reading.json`, `src/content/listening.json` (текст/лексика/задания; аудиофайл, видео
   или текст для озвучки голосом браузера, задания).

В конце — отчёт по 13 пунктам, что Дарья может менять сама (цвета, фото), список исправлений контента.

Важно: проект перенесён из iCloud (Рабочий стол), потому что iCloud выгружал файлы и сборка зависала.
Сборщик тормозит на `calc(var(...))` и `color-mix(...)` в CSS — не использовать, готовые значения
считать в JS или задавать в `:root`.

## Журнал исправлений контента (для итогового отчёта)
Sport, юнит 1:
- Сочетания: 9 «a house game» → дистрактор «a guest game» (калька «гостевой матч»); 10 «do a penalty» → «make a penalty».
- Выбор слова: 3 перемешан порядок вариантов; 4 бессмысленный вариант «defeated to» → «won over», счёт 2:1 → 2–1.
- Перефраз: 3, 5, 7, 9 — добавлены допустимые варианты ответа (was a draw, got knocked out и др.);
  10 — нелогично «champion for three years … for the fourth time» → переписан.
- Лексика: счёт «3:1», «0:1» → английский формат «3–1», «lost 1–0».
- Задание 3: «tell about your region» → «tell us about»; «What kind of sports is…» → «sport»;
  непараллельное «to go to the stadium or at home» → «going to the stadium or watching it at home».
Sport, юнит 2:
- Сочетания: «build a muscle» тоже было неверным (два ответа) → «tear a muscle»; убраны повторы «make/play»
  как ответов; новые дистракторы-кальки: hold fit, come into shape, make exercise, earn stamina.
- Выбор слова: «heavy exercise», «out of form» тоже верны (два ответа) → заменены; бессмысленные
  «warm on», «cold down», «cool off down», «staying» → правдоподобные (warm out, calm down, chill down, durability);
  пункт 8 дублировал пункт 6 (overdo it) → новый пункт про pull a muscle.
- Перефраз: 2, 3, 4 — допустимые варианты; 7 был тривиальным (копирование) → ABLE «you won't be able to».
- Лексика: muscle помечено (U); пример «Ten minutes of skipping will work up a sweat» (неверный субъект) → исправлен.
- Задание 4: «Outdoors physical activities» → «Outdoor».
Итоговый Revision Sport: перефраз 6 пунктов уровня B1 (more popular than, LAST time) → 12 пунктов B2+
(since I last went, by far the most popular, despite being, were made to run, would rather, third conditional, no point in…).

## Второй раунд (замечания Дарьи, 2026-10-08)
- [x] Этап 1: меню Practice/Reading/Listening убраны (файлы удалены); Previous/Next убраны; карточки внутри юнита:
  Vocabulary → Memorise (Cards.tsx), Practice → Match the pairs + Quick test (поле `cards` у юнита);
  Speaking без таймера/записи; в задании 3 «Record your answer».
- [x] Этап 2: styles.css переписан: ~22 цветовые переменные по назначению (--color-main, --color-accent…),
  все классы по БЭМ полными словами, размеры в rem, html font-size растёт с экраном, .page до 90rem,
  пункты упражнений в 2 колонки на широком экране, кролик-похвала растёт с шириной экрана.
  Задание 11: кастомный выпадающий список (NumberChoice в Revision.tsx).
- [x] Этап 3: контент Sport u3–u7 «как в u1–u2»: аудит, 4 упражнения до 12 + 2 новых по 12,
  speaking (4 задания), cards (gaps + contrast), reviews после u4 и u6; убрать тривиальные пункты
  на словообразование (flexible/flexibility, workout/work out, looser/loser) в u1–u2.
Sport, юнит 3: сочетания 9 «a tall risk» (неправдоподобно) → «a strong risk»; выбор слова 2 «extreme/extremely» и 8 «gears»
(тривиальные формы) → life-threatening, calculated risk; 10 повторял пункт 4 (let down) → go it alone; 9 порядок вариантов;
перефраз 2, 3, 6, 10 — допустимые варианты (aren't allowed, 'd rather, I'd tried).
Sport, юнит 4: сочетания — ответ «make» повторялся трижды → «carry pressure», «attract sb to take up sport»;
выбор слова 1 «accuracy/accurate/accurately» и 8 «defence/defend/defensive» (тривиальные формы) → outstanding/outgoing,
handle pressure; 6 бессмысленный «definition» → determinism; перефраз 1, 2 — допустимые варианты.
Sport, юнит 5: сочетания 8 «do a check-up» (говорят и так — два ответа) → «pass a check-up» (калька); 10 повтор ответа «make»
→ «hold a temperature»; выбор слова 2 «harmless/harmful/harm», 3 «recovering/recovered/recover» (тривиальные формы) → eyesight,
recover; 9 повторял пункт 4 → chronic; перефраз 7 повторял пункт 1 (gave up) → kicked the habit; 1, 4, 8 — допустимые варианты.
Sport, юнит 6: сочетания — ответы make/miss/do повторялись → catch a routine, hold an incentive, win a sense of achievement,
pull interest, run back on track; выбор слова 6 и 10 (тривиальные формы achievement/achieving, realistic/real) и 8 (повтор afford)
→ victory/achievement, apologies/excuses, facilities/equipments; перефраз 8 повторял пункт 1 (afford) → tracking my progress;
1, 3, 4 — допустимые варианты.
Sport, юнит 7: выбор слова 5 «spend/pass/lose hours» — «pass hours» тоже верно (два ответа) → spend hours + -ing;
3, 9, 10 — порядок вариантов; сочетания 7, 10 — порядок; перефраз 1, 2, 5 — допустимые варианты ('ve been collecting и др.).
Sport, юниты 1–2 (дополнительно): тривиальные пункты на словоформы заменены — «flexible/flexibility/flexibly» → agility/agitation,
«workout/work out/working-out» → design a programme, «looser/losing/loser» → thrill the crowd.

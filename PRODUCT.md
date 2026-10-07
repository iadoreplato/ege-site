# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

- **Students in grades 10–11 preparing for the EGE in English (ЕГЭ по английскому), target level B2–B2+.** They use the site in two settings, equally: in class alongside the teacher, and at home on their own, finishing exercises and checking themselves. At home they are often on a phone.
- **Teachers.** The author, Daria, teaches with it in class: she leads the lesson from the site, and the students work through the tasks with her. Other teachers are an intended audience too: the plan is to share the textbook with colleagues (or sell it to them), so they need to understand and use it without the author there.

## Product Purpose

A topic-based course for the EGE in English. A universal block covers the exam structure, the FIPI assessment criteria, answer frames and typical mistakes. Topic modules (currently Sport and Russia) each pair B2–B2+ vocabulary with practice in Cambridge formats and with exam tasks in the official format. Success: a student can work through a module in class or alone, get feedback on every answer, and come to the exam with transferable answer frames and topic vocabulary.

## Positioning

What sets it apart from ordinary EGE practice books is the combination of four things:
- **Topic modules.** Vocabulary and every exam task format are built around one topic, not grouped by task number.
- **Shared answer frames** for Tasks 4, 37 and 38. They are reused across every topic.
- **Instant self-check** on every exercise, plus an AI estimate of open tasks (37, 38 and transcripts of 3–4) against the FIPI criteria.
- **A single source for the site and the PDF.** The same JSON content builds the website and the print version.

## Operating Context

- Classroom: the teacher leads the lesson on screen; the class works through units together.
- Home: students complete units and revision on their own, often on a phone. For the speaking tasks they use the built-in voice recorder and send the recording to the teacher via the phone's share menu. The writing tasks show a word counter with the EGE limits.
- Structure: universal block → modules (comparison bank, numbered units, revision) → the same content as a PDF.

## Capabilities and Constraints

- React + Vite site; all teaching content lives in `src/content/*.json` and also feeds the PDF. The JSON structure is a hard constraint.
- Markup conventions inside the content: `[[key element]]`, `(U)`, `sb/sth/+ -ing`, `___` gaps, `{a|b|c}` choices.
- The AI check runs through a Netlify function (`/api/check`); the API key never reaches the browser. The AI score is an estimate, not an official mark.
- No student accounts and no server-side storage of student work or personal data.
- Content language: English throughout, except for word translations, Russian sentences for translation, and the official Russian instructions for Tasks 11 and 19–36. Task wording for Tasks 1–4, 37 and 38 is verbatim from the EGE 2027 demo version.
- Open: the distribution model for other teachers (free sharing or sale) is not yet decided.

## Brand Commitments

- Working name: "EGE · English", a topic-based exam course.
- Content standard: original material or official FIPI materials only, with no text from paid practice books.
- Illustrations: Microsoft Fluent Emoji (MIT), `public/img/`.

## Evidence on Hand

- Content: the universal block (`src/content/universal.json`) and two full modules (`sport.json`, `russia.json`).
- No testimonials, student results, usage figures or pricing exist yet. Do not invent any.

## Product Principles

1. **Exam truth first.** Formats, wording and criteria match the official EGE/FIPI materials exactly; anything presented as official is official.
2. **Works in both settings.** Every unit must work both projected in class and on a student's phone at home.
3. **Feedback on every answer.** Students should never be left wondering whether they got it right.
4. **Content is data.** A teacher, not a developer, writes the modules; the site and the PDF render whatever the JSON says.
5. **Usable without the author.** Another teacher should be able to pick it up and teach from it.

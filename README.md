# EGE English · topic-based course (site)

## Run locally
1. Install Node.js 18+ (nodejs.org).
2. Open this folder in VS Code → Terminal → New Terminal.
3. `npm install` (once), then `npm run dev` and open the address shown (usually http://localhost:5173).
   Go Live does NOT work with the source files. For Go Live, open `dist/index.html` (after `npm run build`).

## Content
- `src/content/universal.json` — Block 0 + answer frames (`frames.t4`, `frames.t37`, `frames.t38`).
- `src/content/sport.json`, `src/content/russia.json` — topic modules.
- Markup inside texts: `[[word]]` = highlighted key element, `(U)` = uncountable, `sb/sth/+ -ing` = grammar tags.
- New module: copy a topic JSON, change the content, import it in `src/App.tsx` and add it to `topics`.
- The same JSON files build the PDF version, so edit content only there.

## Features
- Every exercise has **Check answers**: correct / wrong answers are highlighted and the correct answer is shown.
- Speaking tasks: **voice recorder** (listen, download, send via the phone's share menu).
- Writing tasks: word counter with EGE limits.
- **Check with Claude** (Tasks 37, 38, and typed transcripts of Tasks 3–4).

## AI check: how to switch it on
It needs a small server function because the API key must never be in the browser.
1. Create an API key at https://console.anthropic.com (pay-as-you-go; each check costs a few cents or less).
2. Put the project on GitHub and connect it to Netlify (netlify.com → Add new site → Import from Git).
3. Netlify → Site configuration → Environment variables → add `ANTHROPIC_API_KEY` = your key.
4. Deploy. The function `netlify/functions/check.mjs` answers at `/api/check`.
   Locally: `npm i -g netlify-cli` and run `netlify dev` instead of `npm run dev`.
Tip: set a monthly spending limit in the Anthropic console.
The AI score is an estimate based on the FIPI criteria, not an official mark.

Illustrations: Microsoft Fluent Emoji (MIT licence).

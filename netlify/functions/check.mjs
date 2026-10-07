// Serverless AI check for open tasks (Netlify Functions v2).
// Set ANTHROPIC_API_KEY in Netlify: Site settings → Environment variables. Optional: ANTHROPIC_MODEL.
const CRITERIA = {
  "37": `EGE Task 37 (personal email, max 6). C1 Task completion (0–2): 6 aspects — answers to 3 questions; 3 questions on the given topic; politeness (thanks / positive emotions + hope for future contact); informal style (greeting, closing phrase, signature). 2 = all aspects, 1 incomplete allowed; 0 = 3+ aspects missing, or all 6 incomplete, or 1 missing + 4–5 incomplete, or 2 missing + 2–4 incomplete, or length outside 90–154 words; 1 = all other cases. C2 Organisation (0–2): logic, paragraphs, linking, greeting / closing phrase / signature on separate lines; 2 = max 1 error, 1 = 2–3 errors, 0 = 4+. C3 Language (0–2): 2 = max 1–2 lexico-grammatical and 1–2 spelling/punctuation errors, 1 = 3–4, 0 = 5+. If C1 = 0, total = 0. Over 154 words: only the first 140 are assessed.`,
  "38": `EGE Task 38 (essay based on survey data, max 14). C1 (0–3): 6 aspects — introduction on the project topic; 2–3 facts; 1–2 comparisons with comment; a problem from the area in the plan + solution; conclusion with opinion on the question in the plan + reason; neutral style. 3 = all full (1 incomplete aspect and 1 style violation allowed); 2 = 1 missing, or 1 missing + 1 incomplete, or 2–3 incomplete, 2–3 style violations; 1 = 1 missing + 2–3 incomplete, or 2 missing, or 2 missing + 1 incomplete, or 4–5 incomplete, 4 style violations; 0 = other cases or length outside 180–275. C2 Organisation (0–3): 3 = no errors, 2 = 1–3, 1 = 4–5 or no intro/conclusion, 0 = 6+ or no paragraphs / plan not followed. C3 Vocabulary (0–3): 3 = max 1 error, 2 = 2–3, 1 = 4, 0 = 5+. C4 Grammar (0–3): 3 = max 1–2, 2 = 3–4, 1 = 5–7, 0 = 8+. C5 Spelling & punctuation (0–2): 2 = max 1+1, 1 = 2–4, 0 = 5+. If C1 = 0, total = 0. Respondents "choose/opt for" options; "mention" is a content error. Keep the same survey audience throughout.`,
  "S3": `EGE Speaking Task 3 (interview, 5 answers × 1 point). Each answer: 1 = 2–3 full, relevant sentences with no elementary (A2) lexico-grammatical errors; 0 = no answer, wrong content, fewer than 2 sentences, or elementary errors. The student typed a transcript of their answers.`,
  "S4": `EGE Speaking Task 4 (photo monologue, max 10). Aspects: 1) choice of photos explained: description, differences, link to the project; 2) advantages (1–2); 3) disadvantages (1–2); 4) opinion with reason. C1 Content 0–4 (4 = all aspects, 12–15 sentences; 3 = 1 missing or 1–2 incomplete; 2 = 1 missing + 1 incomplete or 3 incomplete, 10–11 sentences; 1 = 8–9 sentences etc.; 0 = 7 or fewer sentences or <50%). C2 Organisation 0–3: opening with address to the friend AND closing required; linking devices. C3 Language 0–3 (3 = max 3 minor errors; 2 = 4–5 incl. max 2 gross; 1 = 6–7 incl. max 3 gross; 0 = 8+ or 4+ gross). If C1 = 0, total = 0. Assess the typed transcript only (pronunciation cannot be judged).`,
};
const MAX = { "37": 6, "38": 14, "S3": 5, "S4": 10 };

export default async (req) => {
  if (req.method !== "POST") return new Response("Method not allowed", { status: 405 });
  const { task, prompt, answer } = await req.json();
  if (!CRITERIA[task] || !answer || answer.length > 6000) return new Response("Bad request", { status: 400 });
  const system = `You are an experienced EGE (Russian State Exam) English examiner. Assess strictly according to the official criteria below. ${CRITERIA[task]}
Reply ONLY with JSON, no markdown: {"total": number, "max": ${MAX[task]}, "criteria": [{"name": string, "score": number, "max": number, "comment": string}], "corrections": [string]}.
Comments must be short, in simple English, and quote the student's exact words when pointing out an error. "corrections" = up to 8 items in the form "wrong → right".`;
  const r = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "x-api-key": process.env.ANTHROPIC_API_KEY, "anthropic-version": "2023-06-01", "content-type": "application/json" },
    body: JSON.stringify({ model: process.env.ANTHROPIC_MODEL || "claude-sonnet-5", max_tokens: 1500, system,
      messages: [{ role: "user", content: `TASK:\n${prompt}\n\nSTUDENT'S ANSWER:\n${answer}` }] }),
  });
  if (!r.ok) return new Response(await r.text(), { status: 502 });
  const data = await r.json();
  const text = data.content.filter((b) => b.type === "text").map((b) => b.text).join("").replace(/```json|```/g, "").trim();
  try { return Response.json(JSON.parse(text)); } catch { return new Response("Could not parse the model's reply", { status: 502 }); }
};
export const config = { path: "/api/check" };

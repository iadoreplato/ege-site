import { useState } from "react";

/** Sends an open answer to the serverless function /api/check (see netlify/functions/check.mjs) */
export default function AiCheck({ task, prompt, answer }: { task: "37" | "38" | "S3" | "S4"; prompt: string; answer: string }) {
  const [res, setRes] = useState<any>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  async function run() {
    setBusy(true); setErr(""); setRes(null);
    try {
      const r = await fetch("/api/check", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ task, prompt, answer }) });
      if (!r.ok) throw new Error(r.status === 404 ? "The checking service is not connected yet (see README: AI check)." : `Error ${r.status}`);
      setRes(await r.json());
    } catch (e: any) { setErr(e.message); } finally { setBusy(false); }
  }
  return (
    <div className="ai">
      <button className="big" disabled={busy || !answer.trim()} onClick={run}>{busy ? "Checking…" : "Check with Claude"}</button>
      {err && <p className="err">{err}</p>}
      {res && <div className="ai-res">
        <div className="ai-total">Estimated score: <b>{res.total}</b> / {res.max}</div>
        {res.criteria?.map((c: any) => <div className="ai-c" key={c.name}><b>{c.name}: {c.score}/{c.max}</b><p>{c.comment}</p></div>)}
        {res.corrections?.length > 0 && <div className="ai-c"><b>Corrections</b><ul>{res.corrections.map((x: string, i: number) => <li key={i}>{x}</li>)}</ul></div>}
        <p className="note">This is an automatic estimate based on the FIPI criteria, not an official mark.</p>
      </div>}
    </div>
  );
}

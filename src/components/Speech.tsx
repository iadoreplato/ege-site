import { useState } from "react";
import { Topic } from "../types";
import { Chips, Img, Rich } from "./text";
import { countWords, Timer, WordStatus } from "./ui";
import { Skel } from "./Universal";
import Recorder from "./Recorder";
import AiCheck from "./AiCheck";
import universal from "../content/universal.json";

const FR = (universal as any).frames as Record<string, [string, string][]>;
const HER = new Set(["Ella", "Sophia", "Helen"]);

const Pool = ({ groups }: { groups: [string, string[]][] }) =>
  <div className="pool">{groups.map(([h, xs]) => <div className="pl-g" key={h}><span className="pl-h">{h}</span><Chips items={xs} /></div>)}</div>;

const TCard = ({ kind, label, title, icon, children }: any) =>
  <div className={`tc ${kind}`}><div className="tc-h"><Img name={icon} className="tc-ic" /><span className="tc-l">{label}</span><span className="tc-t">{title}</span></div><div className="tc-b">{children}</div></div>;

/** Pool + frame is hidden until the student asks for support */
function Support({ children }: { children: any }) {
  const [open, setOpen] = useState(false);
  return <div className="support"><button className="mini" onClick={() => setOpen(!open)}>{open ? "Hide support" : "Show support: vocabulary pool and frame"}</button>{open && <div className="two">{children}</div>}</div>;
}

function Pie({ data }: { data: [string, number][] }) {
  const cols = ["#7A4B63", "#B98FA3", "#C2643A", "#E8A988", "#3B5B8C", "#9FB3D1"];
  let a0 = -Math.PI / 2;
  return <div className="pie"><svg viewBox="0 0 120 120" width="150" height="150">{data.map(([, v], i) => {
    const a1 = a0 + (2 * Math.PI * v) / 100, r = 56;
    const d = `M60,60 L${60 + r * Math.cos(a0)},${60 + r * Math.sin(a0)} A${r},${r} 0 ${v > 50 ? 1 : 0},1 ${60 + r * Math.cos(a1)},${60 + r * Math.sin(a1)} Z`;
    const am = (a0 + a1) / 2; a0 = a1;
    return <g key={i}><path d={d} fill={cols[i % 6]} stroke="#fff" strokeWidth="1.5" /><text x={60 + 37 * Math.cos(am)} y={63 + 37 * Math.sin(am)} fontSize="9" fontWeight="800" fill="#fff" textAnchor="middle">{v}%</text></g>;
  })}</svg><div className="pie-l">{data.map(([l], i) => <div key={l}><i style={{ background: cols[i % 6] }} />{l}</div>)}</div></div>;
}

function Writing({ min, max, ok, task, prompt }: { min: number; max: number; ok: [number, number]; task: "37" | "38"; prompt: string }) {
  const [text, setText] = useState("");
  return <div className="wc"><textarea rows={12} value={text} onChange={e => setText(e.target.value)} placeholder="Write your answer here…" />
    <WordStatus n={countWords(text)} min={min} max={max} ok={ok} /><AiCheck task={task} prompt={prompt} answer={text} /></div>;
}

function Transcript({ task, prompt }: { task: "S3" | "S4"; prompt: string }) {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  return <div className="support"><button className="mini" onClick={() => setOpen(!open)}>{open ? "Hide" : "Type what you said and check it with Claude"}</button>
    {open && <div className="wc"><textarea rows={6} value={text} onChange={e => setText(e.target.value)} placeholder="Type your answer as you said it…" /><AiCheck task={task} prompt={prompt} answer={text} /></div>}</div>;
}

export default function SpeechView({ s, topic, idx }: { s: any; topic: Topic; idx: number }) {
  const [showKey, setShowKey] = useState(false);
  const [adAns, setAdAns] = useState<Record<number, string>>({});
  switch (s.type) {
    case "interview": {
      const topicText = s.topic[0].toLowerCase() + s.topic.slice(1);
      const prompt = `Task 3 interview on ${topicText}. Questions: ${s.questions.map((q: any, i: number) => `${i + 1}) ${q.q}`).join(" ")}`;
      return <TCard kind="t3" label="Task 3" title="Interview" icon="studio_microphone">
        <p className="dw">You are going to give an interview. You have to answer five questions. Give full answers to the questions (2–3 sentences). Remember that you have 40 seconds to answer each question.</p>
        <p className="tape"><b>Interviewer:</b> Hello! It's Teenagers Round the World Channel. Our guest today is a teenager from Russia and we are going to discuss {topicText}. We'd like to know our guest's point of view on this issue. Please answer five questions. So, let's get started.</p>
        {s.questions.map((q: any, i: number) => <div className="iq" key={i}><div className="iq-q"><span className="nn">{i + 1}</span><span><b>Interviewer:</b> {q.q}</span></div>
          <Chips items={q.pool} className="chips iqp" /><Recorder name={`task3-q${i + 1}`} maxSeconds={40} /></div>)}
        <p className="tape"><b>Interviewer:</b> Thank you very much for your interview.</p>
        {s.trap && <div className="trap"><b>Watch out</b><Rich html={s.trap} /></div>}
        <Transcript task="S3" prompt={prompt} />
      </TCard>;
    }
    case "photo": {
      const pb = topic.photo_pool_base, p = s.pool;
      const prompt = `Task 4 project "${s.project}". Photo 1: ${s.p1[1]}. Photo 2: ${s.p2[1]}. Plan: explain the choice, differences; advantages (1–2) of ${s.focus}; disadvantages (1–2) of ${s.focus}; opinion — ${s.opinion}.`;
      return <TCard kind="t4" label="Task 4" title={`Project “${s.project}”`} icon="speaking_head">
        <p className="dw">Imagine that you and your friend are doing a school project “{s.project}”. You have found some photos to illustrate it but for technical reasons you cannot send them now. Leave a voice message to your friend explaining your choice of the photos and sharing some ideas about the project.</p>
        <div className="phs">{[s.p1, s.p2].map((ph: any, i: number) => <div className="ph" key={i}><div className="ph-art">{ph[0].map((x: string) => <Img key={x} name={x} className="ph-im" />)}</div><div className="ph-c"><span>Photo {i + 1}</span>{ph[1]}</div></div>)}</div>
        <p className="dw">In 2.5 minutes be ready to:</p>
        <ul className="tplan dwl"><li>explain the choice of the illustrations for the project by briefly describing them and noting the differences;</li><li>mention the advantages (1–2) of {s.focus};</li>
          <li>mention the disadvantages (1–2) of {s.focus};</li><li>express your opinion on the subject of the project – say {s.opinion}.</li></ul>
        <p className="dw">You will speak for not more than 3 minutes (12–15 sentences). You have to talk continuously.</p>
        <div className="timers"><Timer seconds={150} label="Preparation" /></div>
        <Recorder name="task4-monologue" maxSeconds={180} />
        <Support><div><div className="typ"><span>Basis for comparison</span><b>{s.basis}</b></div>
          <Pool groups={[["describe", p.describe], ["difference", p.difference], ["pros", p.pros], ["cons", p.cons], ["opinion", pb.opinion], ["goodbye", pb.close]]} /></div><Skel lines={FR.t4} small /></Support>
        <Transcript task="S4" prompt={prompt} />
      </TCard>;
    }
    case "essay": {
      const pie = idx % 2 === 1;
      const prompt = `Task 38. Project on ${s.subject}. Survey among ${s.audience}. Question: ${s.q} (choose one option). Data: ${s.data.map((d: any) => `${d[0]} ${d[1]}%`).join("; ")}. Plan point 4: outline a problem ${s.problem} and suggest a solution. Point 5: opinion on ${s.conclusion}.`;
      return <TCard kind="t38" label="Task 38" title={s.subject[0].toUpperCase() + s.subject.slice(1)} icon="bar_chart">
        <p className="dw">Imagine that you are doing a project on {s.subject}. You have found some data on the subject – the results of a survey conducted among {s.audience} (see the {pie ? "pie chart" : "table"} below).</p>
        <p className="dw">Comment on the survey data and give your opinion on the subject of the project.</p>
        <div className="sq"><span>The survey question:</span><b>{s.q}</b><em>Choose one option</em></div>
        {pie ? <Pie data={s.data} /> : <table className="dt"><thead><tr><th>Options</th><th>Number of respondents (%)</th></tr></thead><tbody>{s.data.map(([l, v]: [string, number]) => <tr key={l}><td>{l}</td><td>{v}</td></tr>)}</tbody></table>}
        <p className="dw">Write 200–250 words.<br />Use the following plan:</p>
        <ul className="tplan dwl"><li>make an opening statement on the subject of the project;</li><li>select and report 2–3 facts;</li><li>make 1–2 comparisons where relevant and give your comments;</li>
          <li>outline a problem {s.problem} and suggest a way of solving it;</li><li>conclude by giving and explaining your opinion on {s.conclusion}.</li></ul>
        <p className="ruinstr">В ответе на задание 38 числительные пишите цифрами.</p>
        <Support><div><div className="typ"><span>Point 4</span><b><Rich html={s.focus4} /> · audience throughout: {s.audience}</b></div><Pool groups={[["topic", s.pool], ["data", topic.data_verbs]]} /></div><Skel lines={FR.t38} small /></Support>
        <Writing min={180} max={275} ok={[200, 250]} task="38" prompt={prompt} />
      </TCard>;
    }
    case "email": {
      const pr = HER.has(s.sender) ? "her" : "his";
      const prompt = `Task 37. Email from ${s.sender}, subject "${s.subject}": ${s.text.replace(/<br>/g, " ")} Task: answer ${pr} questions; ask 3 questions ${s.ask}.`;
      return <TCard kind="t37" label="Task 37" title={`An email from ${s.sender}`} icon="envelope">
        <p className="dw">You have received an email message from your English-speaking pen-friend {s.sender}:</p>
        <div className="em"><div className="em-h"><span>From: {s.sender}@mail.uk</span><span>To: Russian_friend@ege.ru</span><span>Subject: {s.subject}</span></div><Rich as="p" html={s.text} /></div>
        <p className="dw">Write an email to {s.sender}.<br />In your message:</p>
        <ul className="tplan dwl"><li>answer {pr} questions;</li><li>ask 3 questions {s.ask}.</li></ul>
        <p className="dw">Write 100–140 words.<br />Remember the rules of email writing.</p>
        <Support><Pool groups={[["answers", s.pool.answers], ["questions", s.pool.questions]]} /><Skel lines={FR.t37} small /></Support>
        <Writing min={90} max={154} ok={[100, 140]} task="37" prompt={prompt} />
      </TCard>;
    }
    case "ad": {
      const key = topic.ad_keys.find(([t]) => t === s.title) || topic.ad_keys.find(([t]) => s.title.toLowerCase().includes(t.toLowerCase().split(" ")[0]));
      return <TCard kind="t2" label="Task 2" title="Direct questions" icon="speech_balloon">
        <p className="dw">Study the advertisement.</p>
        <div className="ad-top"><Img name={s.img} className="ad-im" /><div><div className="ad-t">{s.title}</div><div className="ad-s">“{s.slogan}”</div></div></div>
        <p className="dw">You are considering {s.consider} and now you'd like to get more information. In 1.5 minutes you are to ask four direct questions to find out about the following:</p>
        {s.points.map((p: string, i: number) => <div className="adp" key={p}><span className="nn">{i + 1})</span><b>{p}{i < 3 ? ";" : "."}</b><input value={adAns[i] || ""} onChange={e => setAdAns({ ...adAns, [i]: e.target.value })} placeholder="Type your question…" /></div>)}
        <p className="dw">You have 20 seconds to ask each question.</p>
        <Recorder name="task2-questions" maxSeconds={90} />
        <div className="fr sm">{["Wh-word", "do / does / is / can", "the / your + noun", "verb", "?"].map(x => <span className="fr-s" key={x}>{x}</span>)}</div>
        {key && <div className="checkbar"><button className="big" onClick={() => setShowKey(!showKey)}>{showKey ? "Hide sample questions" : "Show sample questions"}</button></div>}
        {showKey && key && <div className="key">{key[1]}</div>}
      </TCard>;
    }
    case "reading":
      return <TCard kind="t1" label="Task 1" title="Reading aloud" icon="open_book">
        <p className="dw">Imagine that you are preparing a project with your friend. You have found some interesting material for the presentation and you want to read this text to your friend. You have 1.5 minutes to read the text silently, then be ready to read it out aloud. You will not have more than 1.5 minutes to read it.</p>
        <div className="timers"><Timer seconds={90} label="Silent reading" /></div>
        <div className="rd"><b>{s.title}</b><br />{s.text}</div>
        <Recorder name="task1-reading" maxSeconds={90} />
      </TCard>;
    default: return null;
  }
}

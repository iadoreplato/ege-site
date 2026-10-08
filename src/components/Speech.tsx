import { ReactNode, useState } from "react";
import { Topic } from "../types";
import { Chips, Img, Rich } from "./text";
import { countWords, Timer, WordStatus } from "./ui";
import { Pool, Skel } from "./Universal";
import { SpeakBar } from "./Recorder";
import { Photo } from "./Photo";
import AiCheck from "./AiCheck";
import universal from "../content/universal.json";

const FR = (universal as any).frames as Record<string, [string, string][]>;
const HER = new Set(["Ella", "Sophia", "Helen"]);

/** Card of one exam task; `task` = task number, used for the header colour */
const TCard = ({ task, title, icon, children }: { task: number; title: string; icon: string; children: ReactNode }) =>
  <div className={`exam-task exam-task--task-${task}`}><div className="exam-task__header"><Img name={icon} className="exam-task__icon" /><span className="exam-task__label">Task {task}</span><span className="exam-task__title">{title}</span></div><div className="exam-task__body">{children}</div></div>;

/** Pool + frame is hidden until the student asks for support */
function Support({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  return <div className="support"><button className="button button--secondary" onClick={() => setOpen(!open)}>{open ? "Hide support" : "Show support: vocabulary pool and frame"}</button>{open && <div className="support__content">{children}</div>}</div>;
}

const CHART = ["--color-task-38", "--color-accent", "--color-task-2", "--color-task-37", "--color-task-1", "--color-text-muted"];
function Pie({ data }: { data: [string, number][] }) {
  const color = (i: number) => `var(${CHART[i % CHART.length]})`;
  let a0 = -Math.PI / 2;
  return <div className="pie-chart"><svg className="pie-chart__circle" viewBox="0 0 120 120">{data.map(([, v], i) => {
    const a1 = a0 + (2 * Math.PI * v) / 100, r = 56;
    const d = `M60,60 L${60 + r * Math.cos(a0)},${60 + r * Math.sin(a0)} A${r},${r} 0 ${v > 50 ? 1 : 0},1 ${60 + r * Math.cos(a1)},${60 + r * Math.sin(a1)} Z`;
    const am = (a0 + a1) / 2; a0 = a1;
    return <g key={i}><path className="pie-chart__slice" d={d} style={{ fill: color(i) }} /><text className="pie-chart__value" x={60 + 37 * Math.cos(am)} y={63 + 37 * Math.sin(am)}>{v}%</text></g>;
  })}</svg><div className="pie-chart__legend">{data.map(([l], i) => <div className="pie-chart__legend-item" key={l}><i className="pie-chart__swatch" style={{ background: color(i) }} />{l}</div>)}</div></div>;
}

const Instruction = ({ children }: { children: ReactNode }) => <p className="exam-task__instruction">{children}</p>;
const Plan = ({ items }: { items: ReactNode[] }) => <ul className="plan-list exam-task__plan">{items.map((x, i) => <li className="plan-list__item" key={i}>{x}</li>)}</ul>;

function Writing({ min, max, ok, task, prompt }: { min: number; max: number; ok: [number, number]; task: "37" | "38"; prompt: string }) {
  const [text, setText] = useState("");
  return <div className="writing"><textarea className="answer-textarea answer-textarea--long" rows={12} value={text} onChange={e => setText(e.target.value)} placeholder="Write your answer here…" />
    <WordStatus n={countWords(text)} min={min} max={max} ok={ok} /><AiCheck task={task} prompt={prompt} answer={text} /></div>;
}

function Transcript({ task, prompt }: { task: "S3" | "S4"; prompt: string }) {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  return <div className="support"><button className="button button--secondary" onClick={() => setOpen(!open)}>{open ? "Hide" : "Type what you said and check it with Claude"}</button>
    {open && <div className="writing"><textarea className="answer-textarea" rows={6} value={text} onChange={e => setText(e.target.value)} placeholder="Type your answer as you said it…" /><AiCheck task={task} prompt={prompt} answer={text} /></div>}</div>;
}

/** `slot`: base file name for this task's photos and recording, see Photo.tsx */
export default function SpeechView({ s, topic, idx, slot }: { s: any; topic: Topic; idx: number; slot: string }) {
  const [showKey, setShowKey] = useState(false);
  const [adAns, setAdAns] = useState<Record<number, string>>({});
  switch (s.type) {
    case "interview": {
      const topicText = s.topic[0].toLowerCase() + s.topic.slice(1);
      const prompt = `Task 3 interview on ${topicText}. Questions: ${s.questions.map((q: any, i: number) => `${i + 1}) ${q.q}`).join(" ")}`;
      return <TCard task={3} title="Interview" icon="studio_microphone">
        <Instruction>You are going to give an interview. You have to answer five questions. Give full answers to the questions (2–3 sentences). Remember that you have 40 seconds to answer each question.</Instruction>
        <Photo name={slot} alt={`Interview: ${s.topic}`} className="exam-task__photo" />
        <SpeakBar name={slot} seconds={40} label="Each answer" maxSeconds={260} />
        <p className="interviewer-line"><b>Interviewer:</b> Hello! It's Teenagers Round the World Channel. Our guest today is a teenager from Russia and we are going to discuss {topicText}. We'd like to know our guest's point of view on this issue. Please answer five questions. So, let's get started.</p>
        {s.questions.map((q: any, i: number) => <div className="interview-question" key={i}><div className="interview-question__text"><span className="interview-question__number">{i + 1}</span><span><b>Interviewer:</b> {q.q}</span></div>
          <Chips items={q.pool} className="interview-question__support" /></div>)}
        <p className="interviewer-line"><b>Interviewer:</b> Thank you very much for your interview.</p>
        {s.trap && <div className="exam-tip"><b className="exam-tip__title">Watch out</b><Rich html={s.trap} /></div>}
        <Transcript task="S3" prompt={prompt} />
      </TCard>;
    }
    case "photo": {
      const pb = topic.photo_pool_base, p = s.pool;
      const prompt = `Task 4 project "${s.project}". Photo 1: ${s.p1[1]}. Photo 2: ${s.p2[1]}. Plan: explain the choice, differences; advantages (1–2) of ${s.focus}; disadvantages (1–2) of ${s.focus}; opinion — ${s.opinion}.`;
      return <TCard task={4} title={`Project “${s.project}”`} icon="speaking_head">
        <Instruction>Imagine that you and your friend are doing a school project “{s.project}”. You have found some photos to illustrate it but for technical reasons you cannot send them now. Leave a voice message to your friend explaining your choice of the photos and sharing some ideas about the project.</Instruction>
        <div className="photo-pair">{[s.p1, s.p2].map((ph: any, i: number) => <div className="photo-pair__item" key={i}><div className="photo-pair__picture"><Photo name={`${slot}-photo${i + 1}`} alt={ph[1]} className="photo-pair__photo">{ph[0].map((x: string) => <Img key={x} name={x} className="photo-pair__icon" />)}</Photo></div><div className="photo-pair__caption"><span className="photo-pair__label">Photo {i + 1}</span>{ph[1]}</div></div>)}</div>
        <Instruction>In 2.5 minutes be ready to:</Instruction>
        <Plan items={["explain the choice of the illustrations for the project by briefly describing them and noting the differences;", `mention the advantages (1–2) of ${s.focus};`,
          `mention the disadvantages (1–2) of ${s.focus};`, `express your opinion on the subject of the project – say ${s.opinion}.`]} />
        <Instruction>You will speak for not more than 3 minutes (12–15 sentences). You have to talk continuously.</Instruction>
        <SpeakBar name={slot} seconds={180} label="Speaking" preparation={150} />
        <Support><div><div className="support__focus"><span className="support__focus-label">Basis for comparison</span><b className="support__focus-text">{s.basis}</b></div>
          <Pool groups={[["describe", p.describe], ["difference", p.difference], ["pros", p.pros], ["cons", p.cons], ["opinion", pb.opinion], ["goodbye", pb.close]]} /></div><Skel lines={FR.t4} small /></Support>
        <Transcript task="S4" prompt={prompt} />
      </TCard>;
    }
    case "essay": {
      const pie = idx % 2 === 1;
      const prompt = `Task 38. Project on ${s.subject}. Survey among ${s.audience}. Question: ${s.q} (choose one option). Data: ${s.data.map((d: any) => `${d[0]} ${d[1]}%`).join("; ")}. Plan point 4: outline a problem ${s.problem} and suggest a solution. Point 5: opinion on ${s.conclusion}.`;
      return <TCard task={38} title={s.subject[0].toUpperCase() + s.subject.slice(1)} icon="bar_chart">
        <Instruction>Imagine that you are doing a project on {s.subject}. You have found some data on the subject – the results of a survey conducted among {s.audience} (see the {pie ? "pie chart" : "table"} below).</Instruction>
        <Instruction>Comment on the survey data and give your opinion on the subject of the project.</Instruction>
        <div className="survey-question"><span className="survey-question__label">The survey question:</span><b>{s.q}</b><em className="survey-question__hint">Choose one option</em></div>
        {pie ? <Pie data={s.data} /> : <table className="survey-table"><thead><tr><th className="survey-table__heading">Options</th><th className="survey-table__heading">Number of respondents (%)</th></tr></thead><tbody>{s.data.map(([l, v]: [string, number]) => <tr key={l}><td className="survey-table__cell">{l}</td><td className="survey-table__cell survey-table__cell--number">{v}</td></tr>)}</tbody></table>}
        <Instruction>Write 200–250 words.<br />Use the following plan:</Instruction>
        <Plan items={["make an opening statement on the subject of the project;", "select and report 2–3 facts;", "make 1–2 comparisons where relevant and give your comments;",
          `outline a problem ${s.problem} and suggest a way of solving it;`, `conclude by giving and explaining your opinion on ${s.conclusion}.`]} />
        <p className="russian-instruction">В ответе на задание 38 числительные пишите цифрами.</p>
        <Support><div><div className="support__focus"><span className="support__focus-label">Point 4</span><b className="support__focus-text"><Rich html={s.focus4} /> · audience throughout: {s.audience}</b></div><Pool groups={[["topic", s.pool], ["data", topic.data_verbs]]} /></div><Skel lines={FR.t38} small /></Support>
        <Writing min={180} max={275} ok={[200, 250]} task="38" prompt={prompt} />
      </TCard>;
    }
    case "email": {
      const pr = HER.has(s.sender) ? "her" : "his";
      const prompt = `Task 37. Email from ${s.sender}, subject "${s.subject}": ${s.text.replace(/<br>/g, " ")} Task: answer ${pr} questions; ask 3 questions ${s.ask}.`;
      return <TCard task={37} title={`An email from ${s.sender}`} icon="envelope">
        <Instruction>You have received an email message from your English-speaking pen-friend {s.sender}:</Instruction>
        <div className="email-message"><div className="email-message__header"><span>From: {s.sender}@mail.uk</span><span>To: Russian_friend@ege.ru</span><span>Subject: {s.subject}</span></div><Rich as="p" className="email-message__text" html={s.text} /></div>
        <Instruction>Write an email to {s.sender}.<br />In your message:</Instruction>
        <Plan items={[`answer ${pr} questions;`, `ask 3 questions ${s.ask}.`]} />
        <Instruction>Write 100–140 words.<br />Remember the rules of email writing.</Instruction>
        <Support><Pool groups={[["answers", s.pool.answers], ["questions", s.pool.questions]]} /><Skel lines={FR.t37} small /></Support>
        <Writing min={90} max={154} ok={[100, 140]} task="37" prompt={prompt} />
      </TCard>;
    }
    case "ad": {
      const key = topic.ad_keys.find(([t]) => t === s.title) || topic.ad_keys.find(([t]) => s.title.toLowerCase().includes(t.toLowerCase().split(" ")[0]));
      return <TCard task={2} title="Direct questions" icon="speech_balloon">
        <Instruction>Study the advertisement.</Instruction>
        <div className="advert"><Photo name={slot} alt={s.title} className="advert__photo"><Img name={s.img} className="advert__icon" /></Photo><div><div className="advert__title">{s.title}</div><div className="advert__slogan">“{s.slogan}”</div></div></div>
        <Instruction>You are considering {s.consider} and now you'd like to get more information. In 1.5 minutes you are to ask four direct questions to find out about the following:</Instruction>
        {s.points.map((p: string, i: number) => <div className="question-point" key={p}><span className="question-point__number">{i + 1})</span><b className="question-point__topic">{p}{i < 3 ? ";" : "."}</b><input className="answer-input question-point__input" value={adAns[i] || ""} onChange={e => setAdAns({ ...adAns, [i]: e.target.value })} placeholder="Type your question…" /></div>)}
        <Instruction>You have 20 seconds to ask each question.</Instruction>
        <SpeakBar name={slot} seconds={20} label="Each question" maxSeconds={90} />
        <div className="answer-frame answer-frame--small">{["Wh-word", "do / does / is / can", "the / your + noun", "verb", "?"].map(x => <span className="answer-frame__slot" key={x}>{x}</span>)}</div>
        {key && <div className="exercise__check-bar"><button className="button button--primary" onClick={() => setShowKey(!showKey)}>{showKey ? "Hide sample questions" : "Show sample questions"}</button></div>}
        {showKey && key && <div className="exercise__answer">{key[1]}</div>}
      </TCard>;
    }
    case "reading":
      return <TCard task={1} title="Reading aloud" icon="open_book">
        <Instruction>Imagine that you are preparing a project with your friend. You have found some interesting material for the presentation and you want to read this text to your friend. You have 1.5 minutes to read the text silently, then be ready to read it out aloud. You will not have more than 1.5 minutes to read it.</Instruction>
        <Timer seconds={90} label="Silent reading" />
        <div className="read-aloud-text"><b className="read-aloud-text__title">{s.title}</b><br />{s.text}</div>
        <SpeakBar name={slot} seconds={90} label="Reading aloud" />
      </TCard>;
    default: return null;
  }
}

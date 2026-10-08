import { useEffect, useRef, useState } from "react";
import { Timer } from "./ui";

/** Records the student's spoken answer; lets them listen, download and share the file */
export default function Recorder({ name, maxSeconds }: { name: string; maxSeconds: number }) {
  const [state, setState] = useState<"idle" | "rec" | "done" | "error">("idle");
  const [url, setUrl] = useState<string>("");
  const [blob, setBlob] = useState<Blob | null>(null);
  const [sec, setSec] = useState(0);
  const rec = useRef<MediaRecorder | null>(null);
  const timer = useRef<number>();

  useEffect(() => () => { if (url) URL.revokeObjectURL(url); clearInterval(timer.current); }, [url]);

  async function start() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mr = new MediaRecorder(stream);
      const chunks: BlobPart[] = [];
      mr.ondataavailable = e => chunks.push(e.data);
      mr.onstop = () => {
        const b = new Blob(chunks, { type: mr.mimeType || "audio/webm" });
        setBlob(b); setUrl(URL.createObjectURL(b)); setState("done");
        stream.getTracks().forEach(t => t.stop()); clearInterval(timer.current);
      };
      rec.current = mr; mr.start(); setSec(0); setState("rec");
      timer.current = window.setInterval(() => setSec(s => {
        if (s + 1 >= maxSeconds) mr.state === "recording" && mr.stop();
        return s + 1;
      }), 1000);
    } catch { setState("error"); }
  }
  const stop = () => rec.current?.state === "recording" && rec.current.stop();
  const ext = blob?.type.includes("mp4") ? "m4a" : blob?.type.includes("ogg") ? "ogg" : "webm";
  const fileName = `${name}.${ext}`;

  async function share() {
    if (!blob) return;
    const file = new File([blob], fileName, { type: blob.type });
    const nav = navigator as any;
    if (nav.canShare?.({ files: [file] })) await nav.share({ files: [file], title: fileName });
    else alert("Sharing is not supported in this browser. Download the file and send it to your teacher.");
  }

  return (
    <div className="recorder">
      <span className="recorder__label">🎙 Record your answer</span>
      {state !== "rec" && <button className="recorder__button" onClick={start}>{state === "done" ? "Record again" : "Start recording"}</button>}
      {state === "rec" && <><span className="recorder__dot" /><b className="recorder__time">{Math.floor(sec / 60)}:{String(sec % 60).padStart(2, "0")}</b><span className="recorder__limit">/ {Math.floor(maxSeconds / 60)}:{String(maxSeconds % 60).padStart(2, "0")}</span><button className="recorder__button" onClick={stop}>Stop</button></>}
      {state === "done" && url && <><audio className="recorder__audio" controls src={url} /><a className="button button--secondary" href={url} download={fileName}>Download</a><button className="button button--secondary" onClick={share}>Send</button></>}
      {state === "error" && <span className="error-text">No access to the microphone. Allow it in the browser settings.</span>}
    </div>
  );
}

/** Speaking tools in one row that wraps when it doesn't fit: an optional preparation timer,
    a timer for answering aloud without recording, and the recorder */
export const SpeakBar = ({ name, seconds, label, maxSeconds = seconds, preparation }: { name: string; seconds: number; label: string; maxSeconds?: number; preparation?: number }) =>
  <div className="speaking-tools">{preparation && <Timer seconds={preparation} label="Preparation" />}<Timer seconds={seconds} label={label} /><Recorder name={name} maxSeconds={maxSeconds} /></div>;

import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState, type ReactNode } from "react";
import { analyzeResume, type Analysis } from "@/lib/analyze.functions";
import { jobTemplates } from "@/lib/job-templates";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Resumind — AI Resume Analyzer" },
      { name: "description", content: "Get an instant AI score, ATS check, job match and rewritten bullet points for your resume." },
      { property: "og:title", content: "Resumind — AI Resume Analyzer" },
      { property: "og:description", content: "Instant AI resume score, ATS check and job match." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

async function readFile(file: File): Promise<string> {
  if (file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf")) {
    const { extractText, getDocumentProxy } = await import("unpdf");
    const pdf = await getDocumentProxy(new Uint8Array(await file.arrayBuffer()));
    const { text } = await extractText(pdf, { mergePages: true });
    return text;
  }
  return file.text();
}

function tone(n: number) {
  return n >= 75 ? "text-success" : n >= 50 ? "text-warning" : "text-destructive";
}
function barTone(n: number) {
  return n >= 75 ? "bg-success" : n >= 50 ? "bg-warning" : "bg-destructive";
}

function Ring({ value, label }: { value: number; label: string }) {
  const r = 42, c = 2 * Math.PI * r;
  return (
    <div className="flex flex-col items-center">
      <svg width="110" height="110" viewBox="0 0 100 100" className={tone(value)}>
        <circle cx="50" cy="50" r={r} fill="none" stroke="var(--muted)" strokeWidth="8" />
        <circle cx="50" cy="50" r={r} fill="none" stroke="currentColor" strokeWidth="8" strokeLinecap="round"
          strokeDasharray={c} strokeDashoffset={c - (c * value) / 100} transform="rotate(-90 50 50)" />
        <text x="50" y="57" textAnchor="middle" fontSize="24" fontWeight="700" fill="var(--foreground)">{value}</text>
      </svg>
      <span className="mt-1 text-sm font-semibold text-muted-foreground">{label}</span>
    </div>
  );
}

function Card({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="rounded-xl border bg-card p-6 shadow-sm">
      <h3 className="mb-4 text-xl font-semibold">{title}</h3>
      {children}
    </section>
  );
}

function Index() {
  const analyze = useServerFn(analyzeResume);
  const [resume, setResume] = useState("");
  const [job, setJob] = useState("");
  const [jobRole, setJobRole] = useState("");
  const [fileName, setFileName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<Analysis | null>(null);

  async function onFile(f?: File) {
    if (!f) return;
    setError("");
    try {
      setFileName(f.name);
      setResume((await readFile(f)).trim());
    } catch {
      setError("Couldn't read that file. Try pasting the text instead.");
    }
  }

  async function run() {
    setLoading(true); setError(""); setResult(null);
    try {
      const r = await analyze({ data: { resume, job } });
      if (r.ok) setResult(r.analysis); else setError(r.error);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
    } finally { setLoading(false); }
  }

  return (
    <div className="min-h-screen paper-grid">
      <header className="mx-auto max-w-5xl px-6 pt-14 pb-8">
        <p className="text-sm font-bold uppercase tracking-widest text-accent">Resumind</p>
        <h1 className="mt-2 text-5xl font-bold leading-tight md:text-6xl">Your resume, read by<br />a recruiter that never sleeps.</h1>
        <p className="mt-4 max-w-xl text-lg text-muted-foreground">Upload a PDF or paste your resume. Add a job post to see how well you match.</p>
      </header>

      <main className="mx-auto max-w-5xl space-y-6 px-6 pb-20">
        <div className="grid gap-6 md:grid-cols-2">
          <div className="rounded-xl border bg-card p-5 shadow-sm">
            <div className="mb-3 flex items-center justify-between">
              <label className="font-semibold">Your resume</label>
              <label className="cursor-pointer rounded-md bg-secondary px-3 py-1.5 text-sm font-semibold text-secondary-foreground hover:bg-muted">
                {fileName || "Upload PDF / TXT"}
                <input type="file" accept=".pdf,.txt,.md" className="hidden" onChange={(e) => onFile(e.target.files?.[0])} />
              </label>
            </div>
            <textarea value={resume} onChange={(e) => setResume(e.target.value)} rows={14}
              placeholder="Paste your resume text here…"
              className="w-full resize-y rounded-md border bg-background p-3 text-sm outline-none focus:ring-2 focus:ring-ring" />
          </div>
          <div className="rounded-xl border bg-card p-5 shadow-sm">
            <label htmlFor="job-role" className="mb-2 block font-semibold">
              Job description{" "}
              <span className="font-normal text-muted-foreground">(optional)</span>
            </label>
            <select
              id="job-role"
              value={jobRole}
              onChange={(e) => {
                const selectedRole = e.target.value;
                setJobRole(selectedRole);
                const template = jobTemplates.find((item) => item.title === selectedRole);
                if (template) setJob(template.description);
              }}
              className="mb-3 w-full rounded-md border bg-background p-3 text-sm outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="">Choose a job role to load a sample description…</option>
              {jobTemplates.map((template) => (
                <option key={template.title} value={template.title}>
                  {template.title}
                </option>
              ))}
              <option value="custom">Custom / paste my own</option>
            </select>
            <textarea
              aria-label="Job description text"
              value={job}
              onChange={(e) => {
                setJob(e.target.value);
                if (jobRole !== "custom") setJobRole("custom");
              }}
              rows={14}
              placeholder="Paste the job posting to get a match score…"
              className="w-full resize-y rounded-md border bg-background p-3 text-sm outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button onClick={run} disabled={loading || resume.trim().length < 100}
            className="rounded-lg bg-primary px-8 py-3 font-bold text-primary-foreground shadow-md transition hover:opacity-90 disabled:opacity-40">
            {loading ? "Analyzing…" : "Analyze resume"}
          </button>
          {error && <p className="text-sm font-medium text-destructive">{error}</p>}
        </div>

        {loading && <div className="h-2 w-full overflow-hidden rounded bg-muted"><div className="h-full w-1/3 animate-pulse rounded bg-accent" /></div>}

        {result && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
            <section className="rounded-xl border bg-card p-6 shadow-sm">
              <div className="flex flex-wrap items-center justify-around gap-6">
                <Ring value={result.overallScore} label="Overall" />
                <Ring value={result.atsScore} label="ATS friendly" />
                {result.jobMatchScore !== null && <Ring value={result.jobMatchScore} label="Job match" />}
              </div>
              <div className="mt-6 border-t pt-4">
                <p className="text-sm text-muted-foreground">{result.detectedRole} · {result.experienceLevel}</p>
                <p className="mt-2">{result.summary}</p>
              </div>
            </section>

            <Card title="Section breakdown">
              <div className="space-y-4">
                {result.sections.map((s) => (
                  <div key={s.name}>
                    <div className="flex justify-between text-sm font-semibold"><span>{s.name}</span><span className={tone(s.score)}>{s.score}</span></div>
                    <div className="mt-1 h-2 rounded bg-muted"><div className={`h-2 rounded ${barTone(s.score)}`} style={{ width: `${s.score}%` }} /></div>
                    <p className="mt-1 text-sm text-muted-foreground">{s.feedback}</p>
                  </div>
                ))}
              </div>
            </Card>

            <div className="grid gap-6 md:grid-cols-2">
              <Card title="Strengths"><ul className="list-disc space-y-2 pl-5">{result.strengths.map((s) => <li key={s}>{s}</li>)}</ul></Card>
              <Card title="Fix these"><ul className="list-disc space-y-2 pl-5">{result.weaknesses.map((s) => <li key={s}>{s}</li>)}</ul></Card>
            </div>

            <Card title="Keywords">
              {result.matchedKeywords.length > 0 && <>
                <p className="mb-2 text-sm font-semibold text-muted-foreground">Found</p>
                <div className="mb-4 flex flex-wrap gap-2">{result.matchedKeywords.map((k) => <span key={k} className="rounded-full bg-secondary px-3 py-1 text-sm">{k}</span>)}</div>
              </>}
              <p className="mb-2 text-sm font-semibold text-muted-foreground">Missing</p>
              <div className="flex flex-wrap gap-2">{result.missingKeywords.map((k) => <span key={k} className="rounded-full border border-accent px-3 py-1 text-sm">+ {k}</span>)}</div>
            </Card>

            <Card title="Rewritten bullet points">
              <div className="space-y-4">
                {result.improvedBullets.map((b) => (
                  <div key={b.original} className="rounded-lg bg-muted p-4 text-sm">
                    <p className="text-muted-foreground line-through">{b.original}</p>
                    <p className="mt-2 font-medium">→ {b.improved}</p>
                  </div>
                ))}
              </div>
            </Card>

            <div className="grid gap-6 md:grid-cols-2">
              <Card title="Likely interview questions"><ol className="list-decimal space-y-2 pl-5">{result.interviewQuestions.map((q) => <li key={q}>{q}</li>)}</ol></Card>
              <Card title="Career paths"><ul className="list-disc space-y-2 pl-5">{result.careerPaths.map((q) => <li key={q}>{q}</li>)}</ul></Card>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

# Resumind — Resume Analyzer
Full-stack TanStack Start (React 19 + server functions) app.
- Upload PDF/TXT or paste a resume, optionally a job description
- Choose a job role to load an editable sample job description
- Local analysis returns overall, ATS and job-match scores, section breakdown, strengths/weaknesses,
  matched & missing keywords, rewritten bullets, interview questions, career paths
Backend: src/lib/analyze.functions.ts (server function) and src/lib/resume-analysis.ts (local ATS analysis)
Frontend: src/routes/index.tsx
Run: bun install && bun run dev (no API key or external AI service required)

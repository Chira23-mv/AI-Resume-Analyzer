import { createServerFn } from "@tanstack/react-start";
import { analyzeResumeText, type Analysis } from "./resume-analysis";

export type { Analysis } from "./resume-analysis";

export const analyzeResume = createServerFn({ method: "POST" })
  .validator((input: { resume: string; job?: string }) => {
    const resume = String(input?.resume ?? "")
      .trim()
      .slice(0, 30000);
    const job = String(input?.job ?? "")
      .trim()
      .slice(0, 10000);
    if (resume.length < 100) throw new Error("Resume text is too short to analyze.");
    return { resume, job };
  })
  .handler(
    async ({ data }): Promise<{ ok: true; analysis: Analysis } | { ok: false; error: string }> => {
      try {
        return { ok: true, analysis: analyzeResumeText(data.resume, data.job) };
      } catch (error) {
        console.error("Resume analysis failed.", error);
        return { ok: false, error: "Couldn't analyze this resume. Check the text and try again." };
      }
    },
  );

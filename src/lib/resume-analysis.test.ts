import { describe, expect, it } from "vitest";
import { analyzeResumeText, extractJobKeywords, reconcileJobKeywords } from "./resume-analysis";
import { jobTemplates } from "./job-templates";

describe("reconcileJobKeywords", () => {
  it("scores only requirements that occur in the job post and resume", () => {
    expect(
      reconcileJobKeywords(
        "Required: TypeScript, React, and PostgreSQL experience.",
        "Built React apps and used TypeScript.",
        ["TypeScript", "React", "PostgreSQL", "Kubernetes"],
      ),
    ).toEqual({
      matchedKeywords: ["typescript", "react"],
      missingKeywords: ["postgresql"],
      jobMatchScore: 67,
    });
  });

  it("matches phrases case-insensitively without matching inside other words", () => {
    expect(
      reconcileJobKeywords(
        "Experience with machine learning and Java.",
        "Machine learning specialist with JavaScript experience.",
        ["machine learning", "Java"],
      ),
    ).toEqual({
      matchedKeywords: ["machine learning"],
      missingKeywords: ["java"],
      jobMatchScore: 50,
    });
  });

  it("deduplicates keywords and returns zero when no requirements were extracted", () => {
    expect(reconcileJobKeywords("Engineer needed", "Engineer", ["", "Python", "Python"])).toEqual({
      matchedKeywords: [],
      missingKeywords: [],
      jobMatchScore: 0,
    });
  });

  it("extracts job requirements and returns a complete local analysis", () => {
    const resume = `Jordan Lee
jordan@example.com | 555-123-4567
Professional Summary
Software engineer with experience building web applications.
Experience
Software Engineer, 2022-2025
Built React applications with TypeScript and Python.
Improved application response time by 30 percent.
Skills
React, TypeScript, Python
Education
Bachelor of Computer Science, 2022`;
    const job =
      "Software engineer wanted. Required skills: React, TypeScript, Python, AWS, and SQL.";

    expect(extractJobKeywords(job)).toEqual(
      expect.arrayContaining(["react", "typescript", "python", "aws", "sql"]),
    );
    const result = analyzeResumeText(resume, job);
    expect(result.jobMatchScore).toBeGreaterThan(0);
    expect(result.matchedKeywords).toEqual(
      expect.arrayContaining(["react", "typescript", "python"]),
    );
    expect(result.missingKeywords).toEqual(expect.arrayContaining(["aws", "sql"]));
    expect(result.detectedRole).toBe("Software Engineer");
    expect(result.sections).toHaveLength(7);
    expect(result.interviewQuestions).toHaveLength(5);
    expect(result.careerPaths).toHaveLength(3);
    expect(result.atsScore).toBeGreaterThanOrEqual(0);
    expect(result.atsScore).toBeLessThanOrEqual(100);
  });

  it("returns an ATS assessment without requiring a job description", () => {
    const result = analyzeResumeText(
      "Alex Morgan\nalex@example.com\nProfessional Summary\nSoftware engineer.\nExperience\nBuilt and tested applications with JavaScript.\nEducation\nComputer Science degree.",
    );

    expect(result.jobMatchScore).toBeNull();
    expect(result.detectedRole).toBe("Software Engineer");
    expect(result.missingKeywords.length).toBeGreaterThan(0);
    expect(result.sections.every((section) => section.score >= 0 && section.score <= 100)).toBe(
      true,
    );
  });

  it("provides analyzable, role-specific descriptions for each job option", () => {
    expect(jobTemplates.length).toBeGreaterThanOrEqual(10);
    for (const template of jobTemplates) {
      expect(template.description).toContain(template.title);
      const keywords = extractJobKeywords(template.description);
      expect(keywords.length).toBeGreaterThan(0);
      expect(keywords.length).toBeLessThanOrEqual(15);
      expect(keywords).not.toContain("responsibilities");
      expect(keywords).not.toContain("qualifications");
      expect(analyzeResumeText(template.description).detectedRole).not.toBe("Professional");
    }
  });
});

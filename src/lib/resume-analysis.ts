export type Analysis = {
  overallScore: number;
  atsScore: number;
  jobMatchScore: number | null;
  summary: string;
  detectedRole: string;
  experienceLevel: string;
  sections: { name: string; score: number; feedback: string }[];
  strengths: string[];
  weaknesses: string[];
  matchedKeywords: string[];
  missingKeywords: string[];
  improvedBullets: { original: string; improved: string }[];
  interviewQuestions: string[];
  careerPaths: string[];
};

const skillKeywords = [
  "amazon web services",
  "machine learning",
  "project management",
  "data analysis",
  "data engineering",
  "product management",
  "user experience",
  "user interface",
  "artificial intelligence",
  "natural language processing",
  "deep learning",
  "continuous integration",
  "continuous delivery",
  "test automation",
  "api development",
  "full stack",
  "front end",
  "back end",
  "data visualization",
  "cloud computing",
  "information security",
  "cyber security",
  "customer service",
  "salesforce",
  "kubernetes",
  "typescript",
  "javascript",
  "postgresql",
  "microservices",
  "communication",
  "leadership",
  "collaboration",
  "problem solving",
  "stakeholder",
  "management",
  "recruiting",
  "accounting",
  "marketing",
  "sales",
  "research",
  "strategy",
  "forecasting",
  "budgeting",
  "negotiation",
  "training",
  "compliance",
  "operations",
  "analytics",
  "reporting",
  "agile",
  "scrum",
  "kanban",
  "react",
  "angular",
  "vue",
  "node.js",
  "python",
  "java",
  "golang",
  "rust",
  "c++",
  "c#",
  ".net",
  "sql",
  "nosql",
  "mongodb",
  "mysql",
  "redis",
  "aws",
  "azure",
  "gcp",
  "docker",
  "terraform",
  "linux",
  "git",
  "rest",
  "graphql",
  "html",
  "css",
  "swift",
  "kotlin",
  "ruby",
  "php",
  "figma",
  "tableau",
  "power bi",
  "excel",
  "pandas",
  "pytorch",
  "tensorflow",
  "spark",
  "hadoop",
  "jenkins",
  "github actions",
  "rest api",
  "unit testing",
  "accessibility",
  "seo",
  "crm",
  "erp",
  "financial modeling",
  "human resources",
  "public speaking",
];

const stopWords = new Set(
  `a an and are as at be been being by can candidate candidates will would should could
  do does for from has have in is it its of on or our must required requirements the
  their them they this that these those to we with you your who what which while
  work working worked experience experienced year years ability strong excellent
  good great preferred plus including include including responsible responsibility
  role position job team company across within using use used build building develop
  developing support supporting knowledge understanding skills qualification
  qualifications responsibilities ensure ensuring new well proven demonstrate demonstrated
  join joining ideal looking seeking opportunity apply application remote hybrid
  onsite salary benefits compensation inclusive equal opportunity`.split(/\s+/),
);

const sectionPatterns: Record<string, RegExp> = {
  Contact: /\b[\w.+-]+@[\w.-]+\.[a-z]{2,}\b|\b(?:\+?\d[\d\s().-]{7,}\d)\b/i,
  Summary: /\b(?:summary|profile|objective|about me)\b/i,
  Experience: /\b(?:work experience|professional experience|employment history|experience)\b/i,
  Skills: /\b(?:technical skills|skills|core competencies|technologies)\b/i,
  Education: /\b(?:education|academic background|qualifications)\b/i,
  Projects: /\b(?:projects|selected projects|personal projects|portfolio)\b/i,
  Formatting: /^\s*(?:[-*•▪]|\d{4}\s*[-–—]|[A-Z][A-Z &/]{2,})/m,
};

const rolePatterns: Array<[string, RegExp]> = [
  [
    "Software Engineer",
    /\b(?:software|full[\s-]?stack|front[\s-]?end|back[\s-]?end|web) engineer\b|\bdeveloper\b/i,
  ],
  ["Data Analyst", /\bdata analyst\b|\banalyst\b|\bdata analytics\b/i],
  ["Data Scientist", /\bdata scientist\b|\bmachine learning\b/i],
  ["Product Manager", /\bproduct manager\b|\bproduct management\b/i],
  ["Project Manager", /\bproject manager\b|\bproject management\b/i],
  ["UX/UI Designer", /\b(?:ux\/ui|ux|ui|user experience|user interface) designer\b/i],
  ["Marketing Specialist", /\bmarketing\b|\bseo\b|\bcontent strategist\b/i],
  ["Sales Professional", /\b(?:sales|account executive|business development)\b/i],
  [
    "Customer Success Specialist",
    /\bcustomer success\b|\bcustomer service\b|\bsupport specialist\b/i,
  ],
  ["Operations Specialist", /\boperations\b|\boperations manager\b/i],
  ["Human Resources Specialist", /\b(?:human resources|hr|recruiter|recruiting)\b/i],
];

const roleCareerPaths: Record<string, string[]> = {
  "Software Engineer": ["Senior Software Engineer", "Technical Lead", "Software Architect"],
  "Data Analyst": ["Senior Data Analyst", "Business Intelligence Analyst", "Analytics Manager"],
  "Data Scientist": ["Senior Data Scientist", "Machine Learning Engineer", "AI Research Scientist"],
  "Product Manager": ["Senior Product Manager", "Group Product Manager", "Product Director"],
  "Project Manager": [
    "Senior Project Manager",
    "Program Manager",
    "Project Management Office Lead",
  ],
  "UX/UI Designer": ["Senior Product Designer", "UX Researcher", "Design Lead"],
  "Marketing Specialist": [
    "Growth Marketing Manager",
    "Marketing Strategist",
    "Marketing Director",
  ],
  "Sales Professional": ["Senior Account Executive", "Sales Manager", "Sales Director"],
  "Customer Success Specialist": [
    "Customer Success Manager",
    "Implementation Consultant",
    "Customer Experience Lead",
  ],
  "Operations Specialist": [
    "Operations Manager",
    "Business Operations Analyst",
    "Director of Operations",
  ],
  "Human Resources Specialist": [
    "HR Business Partner",
    "Talent Acquisition Manager",
    "People Operations Lead",
  ],
};

const roleRecommendations: Record<string, string[]> = {
  "Software Engineer": ["TypeScript", "SQL", "REST API", "unit testing", "cloud computing"],
  "Data Analyst": ["SQL", "Python", "data visualization", "Power BI", "statistics"],
  "Data Scientist": ["Python", "SQL", "machine learning", "statistics", "data visualization"],
  "Product Manager": ["product management", "analytics", "roadmapping", "stakeholder", "Agile"],
  "Project Manager": ["project management", "Agile", "budgeting", "risk management", "stakeholder"],
  "UX/UI Designer": ["Figma", "accessibility", "user research", "prototyping", "design systems"],
  "Marketing Specialist": ["SEO", "analytics", "content strategy", "campaign management", "CRM"],
  "Sales Professional": [
    "CRM",
    "negotiation",
    "forecasting",
    "account management",
    "communication",
  ],
  "Customer Success Specialist": [
    "customer success",
    "CRM",
    "communication",
    "analytics",
    "problem solving",
  ],
  "Operations Specialist": [
    "project management",
    "process improvement",
    "analytics",
    "Excel",
    "reporting",
  ],
  "Human Resources Specialist": [
    "recruiting",
    "human resources",
    "communication",
    "compliance",
    "HRIS",
  ],
};

export function extractJobKeywords(job: string): string[] {
  const text = normalizeText(job);
  const known = skillKeywords
    .filter((keyword) => containsPhrase(text, keyword.trim()))
    .sort((a, b) => b.length - a.length);
  const coveredWords = new Set(known.flatMap((keyword) => keyword.trim().split(/\s+/)));
  const fallback = [...new Set(text.match(/[\p{L}][\p{L}\p{N}+#.-]{2,}/gu) ?? [])].filter(
    (word) => !stopWords.has(word) && !coveredWords.has(word) && !/^\d+$/.test(word),
  );
  return [...new Set([...known.map((word) => word.trim()), ...fallback])].slice(0, 15);
}

export function reconcileJobKeywords(
  job: string,
  resume: string,
  keywords: string[],
): { matchedKeywords: string[]; missingKeywords: string[]; jobMatchScore: number } {
  const jobText = normalizeText(job);
  const resumeText = normalizeText(resume);
  const requirements = [...new Set(keywords.map(normalizeKeyword).filter(Boolean))].filter(
    (keyword) => containsPhrase(jobText, keyword),
  );
  const matchedKeywords = requirements.filter((keyword) => containsPhrase(resumeText, keyword));
  const missingKeywords = requirements.filter((keyword) => !containsPhrase(resumeText, keyword));

  return {
    matchedKeywords,
    missingKeywords,
    jobMatchScore: requirements.length
      ? Math.round((matchedKeywords.length / requirements.length) * 100)
      : 0,
  };
}

export function analyzeResumeText(resume: string, job = ""): Analysis {
  const normalizedResume = normalizeText(resume);
  const normalizedJob = normalizeText(job);
  const role = detectRole(normalizedJob || normalizedResume);
  const jobKeywords = job.trim() ? extractJobKeywords(job) : [];
  const { matchedKeywords, missingKeywords, jobMatchScore } = job.trim()
    ? reconcileJobKeywords(job, resume, jobKeywords)
    : {
        matchedKeywords: [],
        missingKeywords: (roleRecommendations[role] ?? skillKeywords.slice(0, 5))
          .filter((keyword) => !containsPhrase(normalizedResume, normalizeKeyword(keyword)))
          .slice(0, 10),
        jobMatchScore: null,
      };

  const sections = scoreSections(resume, normalizedResume, jobKeywords);
  const atsScore = scoreAts(resume, normalizedResume, jobKeywords);
  const overallScore = Math.round(
    atsScore * 0.55 + average(sections.map((section) => section.score)) * 0.45,
  );
  const experienceLevel = detectExperienceLevel(resume);
  const strengths = buildStrengths(resume, normalizedResume, matchedKeywords);
  const weaknesses = buildWeaknesses(resume, normalizedResume, jobKeywords, missingKeywords);

  return {
    overallScore,
    atsScore,
    jobMatchScore,
    summary: buildSummary(
      role,
      experienceLevel,
      atsScore,
      jobMatchScore,
      matchedKeywords.length,
      missingKeywords.length,
    ),
    detectedRole: role,
    experienceLevel,
    sections,
    strengths,
    weaknesses,
    matchedKeywords,
    missingKeywords,
    improvedBullets: buildImprovedBullets(resume),
    interviewQuestions: buildInterviewQuestions(role, matchedKeywords),
    careerPaths: roleCareerPaths[role] ?? ["Senior Specialist", "Team Lead", "Department Manager"],
  };
}

function scoreSections(
  resume: string,
  normalizedResume: string,
  jobKeywords: string[],
): Analysis["sections"] {
  const experienceLines = meaningfulLines(resume).filter((line) => /\b(?:19|20)\d{2}\b/.test(line));
  const skillCount = skillKeywords.filter((keyword) =>
    containsPhrase(normalizedResume, keyword.trim()),
  ).length;
  const scores: Record<string, number> = {
    Contact: Math.min(
      100,
      (/\b[\w.+-]+@[\w.-]+\.[a-z]{2,}\b/i.test(resume) ? 55 : 0) +
        (/\b(?:\+?\d[\d\s().-]{7,}\d)\b/.test(resume) ? 45 : 0),
    ),
    Summary: sectionPatterns.Summary.test(resume) ? 85 : resume.length > 500 ? 45 : 25,
    Experience: sectionPatterns.Experience.test(resume)
      ? Math.min(
          100,
          55 + (experienceLines.length > 0 ? 25 : 0) + (/\b(?:19|20)\d{2}\b/.test(resume) ? 20 : 0),
        )
      : 25,
    Skills: jobKeywords.length
      ? Math.round(
          (jobKeywords.filter((keyword) => containsPhrase(normalizedResume, keyword)).length /
            jobKeywords.length) *
            100,
        )
      : Math.min(100, skillCount * 14),
    Education: sectionPatterns.Education.test(resume) ? 85 : 25,
    Projects: sectionPatterns.Projects.test(resume) ? 85 : 35,
    Formatting: Math.min(
      100,
      35 + (meaningfulLines(resume).length >= 5 ? 35 : 0) + (sectionHeadings(resume) >= 3 ? 30 : 0),
    ),
  };
  return Object.entries(scores).map(([name, score]) => ({
    name,
    score,
    feedback: sectionFeedback(name, score),
  }));
}

function scoreAts(resume: string, normalizedResume: string, jobKeywords: string[]): number {
  const hasEmail = /\b[\w.+-]+@[\w.-]+\.[a-z]{2,}\b/i.test(resume);
  const hasPhone = /\b(?:\+?\d[\d\s().-]{7,}\d)\b/.test(resume);
  const headingCount = sectionHeadings(resume);
  const lines = meaningfulLines(resume);
  const formattingPoints = resume.length >= 200 ? 10 : resume.length >= 100 ? 6 : 2;
  const readableLines = lines.length >= 8 ? 5 : lines.length >= 4 ? 3 : 1;
  const keywordScore = jobKeywords.length
    ? Math.round(
        (jobKeywords.filter((keyword) => containsPhrase(normalizedResume, keyword)).length /
          jobKeywords.length) *
          25,
      )
    : Math.min(
        25,
        skillKeywords.filter((keyword) => containsPhrase(normalizedResume, keyword.trim())).length *
          4,
      );
  const metricLines = lines.filter((line) =>
    /\d+(?:\.\d+)?\s*(?:%|percent|[x×]|users|customers|revenue|hours|days|weeks|months|years|projects|people|team)/i.test(
      line,
    ),
  ).length;
  const hasDates = /\b(?:19|20)\d{2}\b/.test(resume);
  const clarity = resume.length / Math.max(lines.length, 1) < 500 ? 5 : 3;
  return clamp(
    (hasEmail ? 5 : 0) +
      (hasPhone ? 5 : 0) +
      Math.min(20, headingCount === 0 ? 0 : 5 + headingCount * 3) +
      formattingPoints +
      readableLines +
      keywordScore +
      Math.min(15, metricLines * 5) +
      (hasDates ? 10 : 3) +
      clarity,
  );
}

function sectionFeedback(name: string, score: number): string {
  const tips: Record<string, [string, string]> = {
    Contact: [
      "Add a professional email address and phone number near the top.",
      "Contact details are easy for a recruiter to find.",
    ],
    Summary: [
      "Add a short professional summary tailored to the role.",
      "A profile or summary helps introduce your experience.",
    ],
    Experience: [
      "Add a clearly labeled experience section with roles and dates.",
      "Use dated roles and achievement-focused bullet points.",
    ],
    Skills: [
      "Add a dedicated skills section and include relevant job-post terms you can support.",
      "Your resume includes relevant skills; tailor them to each posting.",
    ],
    Education: [
      "Add an education section with your qualification and institution.",
      "Education details are clearly represented.",
    ],
    Projects: [
      "Add relevant projects if they demonstrate skills not covered in work history.",
      "Projects give recruiters additional evidence of your skills.",
    ],
    Formatting: [
      "Use standard section headings and short, clearly separated lines.",
      "The text has a readable structure with recognizable sections.",
    ],
  };
  const [low, high] = tips[name] ?? [
    "Review this section for clarity.",
    "This section is represented in the resume.",
  ];
  return score < 60 ? low : high;
}

function buildStrengths(resume: string, text: string, matched: string[]): string[] {
  const strengths: string[] = [];
  if (/\b[\w.+-]+@[\w.-]+\.[a-z]{2,}\b/i.test(resume)) strengths.push("Contact email is included.");
  if (sectionPatterns.Experience.test(resume))
    strengths.push("Work experience is clearly labeled.");
  if (sectionPatterns.Skills.test(resume))
    strengths.push("Skills are grouped in a dedicated section.");
  if (/\b(?:19|20)\d{2}\b/.test(resume))
    strengths.push("Employment or education dates are included.");
  const metrics = meaningfulLines(resume).filter((line) =>
    /\d+(?:\.\d+)?\s*(?:%|percent|users|customers|revenue|hours|projects|people)/i.test(line),
  ).length;
  if (metrics)
    strengths.push(`${metrics} achievement${metrics === 1 ? "" : "s"} include measurable results.`);
  if (matched.length)
    strengths.push(
      `${matched.length} job requirement${matched.length === 1 ? "" : "s"} match the resume.`,
    );
  if (text.length > 700)
    strengths.push("The resume contains enough detail for a useful assessment.");
  return strengths.length
    ? strengths.slice(0, 6)
    : ["Resume text was provided and is ready to be tailored to a specific role."];
}

function buildWeaknesses(
  resume: string,
  text: string,
  jobKeywords: string[],
  missingKeywords: string[],
): string[] {
  const weaknesses: string[] = [];
  if (!/\b[\w.+-]+@[\w.-]+\.[a-z]{2,}\b/i.test(resume))
    weaknesses.push("Add a professional email address so recruiters can contact you.");
  if (!/\b(?:\+?\d[\d\s().-]{7,}\d)\b/.test(resume))
    weaknesses.push("Add a phone number or another reliable contact method.");
  if (!sectionPatterns.Experience.test(resume))
    weaknesses.push(
      "Use a standard Experience heading so applicant tracking systems can identify your work history.",
    );
  if (!/\b(?:19|20)\d{2}\b/.test(resume))
    weaknesses.push("Add dates to roles and education to make your timeline clear.");
  if (!/\d+(?:\.\d+)?\s*(?:%|percent|users|customers|revenue|hours|projects|people)/i.test(resume))
    weaknesses.push("Where accurate, add measurable outcomes to experience bullets.");
  if (sectionPatterns.Skills.test(resume) === false)
    weaknesses.push("Add a dedicated Skills section with relevant tools and qualifications.");
  if (jobKeywords.length && missingKeywords.length) {
    weaknesses.push(
      `The resume does not mention ${missingKeywords.slice(0, 4).join(", ")} from the job posting.`,
    );
  } else if (!jobKeywords.length && !text.includes("summary")) {
    weaknesses.push("Add a brief summary tailored to the roles you are targeting.");
  }
  return weaknesses.slice(0, 6);
}

function buildImprovedBullets(resume: string): Analysis["improvedBullets"] {
  const candidates = meaningfulLines(resume)
    .map((line) => line.replace(/^[\s•▪*-]+/, "").trim())
    .filter(
      (line) => line.length >= 30 && line.length <= 240 && !sectionPatterns.Contact.test(line),
    )
    .slice(0, 3);
  return candidates.map((original) => {
    const clean = original.replace(/[.!?]+$/, "");
    const weakStart = /^(?:responsible for|tasked with|was responsible for)\s+/i;
    const passiveStart = /^(?:helped|worked on|assisted with|participated in|was involved in)\s+/i;
    const improved = weakStart.test(clean)
      ? clean.replace(weakStart, "Managed ")
      : passiveStart.test(clean)
        ? clean.replace(passiveStart, (prefix) =>
            /^worked on/i.test(prefix) ||
            /^participated in/i.test(prefix) ||
            /^was involved in/i.test(prefix)
              ? "Contributed to "
              : "Supported ",
          )
        : `Consider adding a specific, verified result to: ${clean}`;
    return { original, improved: `${improved}.` };
  });
}

function buildInterviewQuestions(role: string, keywords: string[]): string[] {
  const firstKeyword = keywords[0];
  const secondKeyword = keywords[1];
  return [
    `Walk me through your experience and how it prepares you for a ${role} role.`,
    firstKeyword
      ? `Describe a project where you used ${firstKeyword}. What was your contribution?`
      : "Which accomplishment best demonstrates the skills you would bring to this role?",
    secondKeyword
      ? `How have you applied ${secondKeyword} to solve a practical challenge?`
      : "How do you prioritize competing tasks and deadlines?",
    "Tell me about a difficult problem you solved and how you measured the result.",
    "What would you like to learn or accomplish in your next role?",
  ];
}

function buildSummary(
  role: string,
  level: string,
  atsScore: number,
  matchScore: number | null,
  matchedCount: number,
  missingCount: number,
): string {
  const matchSummary =
    matchScore === null
      ? "Add a job description for a role-specific match score and keyword comparison."
      : `The resume matches ${matchedCount} job keywords and is missing ${missingCount}; its job match is ${matchScore}%.`;
  return `${level} ${role} profile. ATS readability score: ${atsScore}/100. ${matchSummary}`;
}

function detectRole(text: string): string {
  return rolePatterns.find(([, pattern]) => pattern.test(text))?.[0] ?? "Professional";
}

function detectExperienceLevel(resume: string): string {
  const years = [...resume.matchAll(/\b(19|20)\d{2}\b/g)].map((match) => Number(match[0]));
  const yearSpan = years.length > 1 ? Math.max(...years) - Math.min(...years) : 0;
  if (/\b(?:senior|principal|staff|director|head of)\b/i.test(resume) || yearSpan >= 8)
    return "Senior";
  if (
    /\b(?:intern|student|graduate|entry.level|junior)\b/i.test(resume) ||
    (years.length > 1 && yearSpan <= 2)
  )
    return "Early-career";
  if (years.length > 1) return "Mid-career";
  return "Experience level unclear";
}

function sectionHeadings(resume: string): number {
  return Object.entries(sectionPatterns).filter(
    ([name, pattern]) => name !== "Contact" && name !== "Formatting" && pattern.test(resume),
  ).length;
}

function meaningfulLines(resume: string): string[] {
  return resume
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
}

function normalizeKeyword(keyword: string): string {
  return normalizeText(keyword).replace(/\s+/g, " ").trim();
}

function normalizeText(text: string): string {
  return text.toLowerCase().replace(/\s+/g, " ").trim();
}

function containsPhrase(text: string, phrase: string): boolean {
  const escapedPhrase = phrase.replace(/[.*+?^${}()|[\]\\]/g, "\\$&").replace(/ /g, "\\s+");
  return new RegExp(`(?:^|[^\\p{L}\\p{N}])${escapedPhrase}(?:$|[^\\p{L}\\p{N}])`, "iu").test(text);
}

function average(scores: number[]): number {
  return scores.length ? scores.reduce((sum, score) => sum + score, 0) / scores.length : 0;
}

function clamp(score: number): number {
  return Math.max(0, Math.min(100, Math.round(score)));
}

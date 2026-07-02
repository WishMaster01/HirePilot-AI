const jsonRules = `Return JSON only. Do not use markdown. Do not include explanations outside JSON. Use scores from 0 to 100.`;

const resumeShape = `{
  "resumeScore": 0,
  "atsScore": 0,
  "summary": "",
  "strengths": [],
  "weaknesses": [],
  "missingKeywords": [],
  "missingSkills": [],
  "missingProjects": [],
  "missingCertifications": [],
  "improvedSummary": "",
  "bulletImprovements": [],
  "actionPlan": []
}`;

export const buildResumeAnalysisPrompt = (resumeText, targetRole) => `
Analyze this resume for ${targetRole || "the target role"}.
Focus on ATS readiness, student/job-seeker employability, projects, skills, and placement preparation.
${jsonRules}

Resume:
${resumeText || ""}

JSON shape:
${resumeShape}
`;

export const buildATSCheckPrompt = (resumeText, jobDescription) => `
Compare this resume against the job description for ATS matching and recruiter relevance.
${jsonRules}

Resume:
${resumeText || ""}

Job description:
${jobDescription || ""}

JSON shape:
${resumeShape}
`;

export const buildResumeRewritePrompt = (resumeText, targetRole) => `
Rewrite and improve this resume for ${targetRole || "the target role"} while preserving truthful content.
${jsonRules}

Resume:
${resumeText || ""}

JSON shape:
${resumeShape}
`;

export const buildKeywordOptimizationPrompt = (resumeText, jobDescription) => `
Find missing keywords and natural insertion opportunities for this resume.
${jsonRules}

Resume:
${resumeText || ""}

Job description:
${jobDescription || ""}

JSON shape:
${resumeShape}
`;

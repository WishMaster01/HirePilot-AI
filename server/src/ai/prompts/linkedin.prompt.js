const jsonRules = `Return JSON only. Do not use markdown. Do not include explanations outside JSON. Use scores from 0 to 100.`;

export const buildLinkedInAnalysisPrompt = (profileText, targetRole) => `
Optimize this LinkedIn profile for recruiter visibility and target role positioning.
${jsonRules}

Target role:
${targetRole || ""}

Profile text:
${profileText || ""}

JSON shape:
{
  "linkedinScore": 0,
  "recruiterVisibilityScore": 0,
  "headline": "",
  "aboutSection": "",
  "skills": [],
  "keywords": [],
  "weaknesses": [],
  "improvements": [],
  "connectionMessage": ""
}
`;

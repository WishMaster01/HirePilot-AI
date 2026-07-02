const jsonRules = `Return JSON only. Do not use markdown. Do not include explanations outside JSON. Use scores from 0 to 100.`;

export const buildCareerProfileAnalysisPrompt = (profile) => `
You are HirePilot AI, a career-tech coach for Indian and global job seekers.
Analyze this career profile and return actionable career readiness insights.
${jsonRules}

Profile:
${JSON.stringify(profile || {}, null, 2)}

JSON shape:
{
  "careerScore": 0,
  "strengthScore": 0,
  "weaknessScore": 0,
  "employabilityScore": 0,
  "readinessScore": 0,
  "strongAreas": [],
  "weakAreas": [],
  "missingSkills": [],
  "recommendedRoles": [],
  "nextSteps": []
}
`;

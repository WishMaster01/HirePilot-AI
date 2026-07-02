const jsonRules = `Return JSON only. Do not use markdown. Do not include explanations outside JSON. Use scores from 0 to 100.`;

export const buildJobMatchingPrompt = (profile, resumeText, jobs) => `
Match this candidate to suitable jobs and roles for Indian and global placement preparation.
${jsonRules}

Profile:
${JSON.stringify(profile || {}, null, 2)}

Resume:
${resumeText || ""}

Jobs:
${JSON.stringify(jobs || [], null, 2)}

JSON shape:
{
  "overallMatchScore": 0,
  "recommendedRoles": [],
  "matchedJobs": [
    {
      "title": "",
      "company": "",
      "matchPercentage": 0,
      "matchedSkills": [],
      "missingSkills": [],
      "reason": ""
    }
  ],
  "improvementPlan": []
}
`;

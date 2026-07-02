const jsonRules = `Return JSON only. Do not use markdown. Do not include explanations outside JSON. Use scores from 0 to 100.`;

export const buildPlacementReportPrompt = (applications) => `
Analyze placement application progress and create a weekly improvement plan.
${jsonRules}

Applications:
${JSON.stringify(applications || [], null, 2)}

JSON shape:
{
  "successProbability": 0,
  "applicationStats": {},
  "weakStages": [],
  "strongStages": [],
  "weeklyProgressReport": "",
  "recommendations": [],
  "nextWeekPlan": []
}
`;

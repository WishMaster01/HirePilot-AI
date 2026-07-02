const jsonRules = `Return JSON only. Do not use markdown. Do not include explanations outside JSON. Use scores from 0 to 100.`;

export const buildProjectAnalyzerPrompt = ({ githubUrl, readme, packageJson, fileStructure } = {}) => `
Analyze this software project for architecture, resume value, production readiness, and interview preparation.
${jsonRules}

Context:
${JSON.stringify({ githubUrl, readme, packageJson, fileStructure }, null, 2)}

JSON shape:
{
  "projectScore": 0,
  "architectureScore": 0,
  "resumeValueScore": 0,
  "productionReadinessScore": 0,
  "strengths": [],
  "weaknesses": [],
  "missingFeatures": [],
  "securityIssues": [],
  "scalabilitySuggestions": [],
  "resumeDescription": "",
  "interviewQuestions": [],
  "improvementRoadmap": []
}
`;

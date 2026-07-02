const jsonRules = `Return JSON only. Do not use markdown. Do not include explanations outside JSON. Use scores from 0 to 100.`;

export const buildCodeReviewPrompt = ({ code, language, projectContext } = {}) => `
Review this code for quality, bugs, security, performance, and best practices.
${jsonRules}

Context:
${JSON.stringify({ code, language, projectContext }, null, 2)}

JSON shape:
{
  "codeQualityScore": 0,
  "readabilityScore": 0,
  "securityScore": 0,
  "performanceScore": 0,
  "bugs": [],
  "securityIssues": [],
  "performanceIssues": [],
  "bestPracticeSuggestions": [],
  "refactoredCode": "",
  "summary": ""
}
`;

const jsonRules = `Return JSON only. Do not use markdown. Do not include explanations outside JSON. Use scores from 0 to 100.`;

const dsaShape = `{
  "dsaScore": 0,
  "topicWiseScore": {},
  "strongTopics": [],
  "weakTopics": [],
  "recommendedProblems": [],
  "solutionFeedback": "",
  "timeComplexity": "",
  "spaceComplexity": "",
  "optimizedApproach": "",
  "nextPracticePlan": []
}`;

export const buildDSAAssessmentPrompt = ({ language, solvedTopics, targetCompany } = {}) => `
Assess DSA readiness for placements and coding interviews.
${jsonRules}

Context:
${JSON.stringify({ language, solvedTopics, targetCompany }, null, 2)}

JSON shape:
${dsaShape}
`;

export const buildDSAProblemExplanationPrompt = (problem) => `
Explain the DSA problem and ideal approach for a learner.
${jsonRules}

Problem:
${JSON.stringify(problem || {}, null, 2)}

JSON shape:
${dsaShape}
`;

export const buildDSAFeedbackPrompt = ({ problem, code, language } = {}) => `
Review this DSA solution for correctness, complexity, and optimization.
${jsonRules}

Context:
${JSON.stringify({ problem, code, language }, null, 2)}

JSON shape:
${dsaShape}
`;

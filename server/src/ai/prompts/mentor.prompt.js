const jsonRules = `Return JSON only. Do not use markdown. Do not include explanations outside JSON.`;

export const buildMentorChatPrompt = ({ userProfile, chatHistory, userMessage } = {}) => `
Act as a concise, practical AI career mentor for HirePilot AI.
Answer the user's question with student/job-seeker focused guidance.
${jsonRules}

Context:
${JSON.stringify({ userProfile, chatHistory, userMessage }, null, 2)}

JSON shape:
{
  "reply": "",
  "suggestedActions": [],
  "recommendedResources": [],
  "nextQuestions": []
}
`;

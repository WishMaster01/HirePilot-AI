const jsonRules = `Return JSON only. Do not use markdown. Do not include explanations outside JSON. Use scores from 0 to 100.`;

export const buildVideoAnalysisPrompt = (transcript, metadata) => `
Analyze interview communication signals from transcript and metadata.
Focus on confidence, communication, professionalism, filler words, and practice advice.
${jsonRules}

Transcript:
${transcript || ""}

Metadata:
${JSON.stringify(metadata || {}, null, 2)}

JSON shape:
{
  "confidenceScore": 0,
  "communicationScore": 0,
  "professionalismScore": 0,
  "speakingSpeedFeedback": "",
  "fillerWords": [],
  "eyeContactFeedback": "",
  "facialExpressionFeedback": "",
  "strengths": [],
  "improvements": [],
  "practicePlan": []
}
`;

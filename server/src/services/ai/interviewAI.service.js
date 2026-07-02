import { callAIJson } from "./baseAI.service.js";
import { buildInterviewFeedbackPrompt, buildInterviewQuestionPrompt } from "../../ai/prompts/interview.prompt.js";

export const generateInterviewQuestionsAI = async ({ role, mode, company, difficulty }) => {
  const fallback = {
    questions: Array.from({ length: 5 }, (_, index) => ({
      question: `For a ${role || "target"} role, explain how you would handle a practical ${mode || "interview"} scenario number ${index + 1}.`,
      difficulty: index < 2 ? "easy" : index < 4 ? "medium" : difficulty || "hard",
      timeLimit: [60, 60, 90, 90, 120][index],
      order: index + 1,
    })),
  };

  const result = await callAIJson({
    prompt: buildInterviewQuestionPrompt({ role, interviewType: mode, company, difficulty }),
    fallback,
    schemaName: "interviewQuestions",
  });
  const data = result.data || fallback;
  result.data = {
    ...data,
    questions: (data.questions || fallback.questions).map((item, index) => ({
      question: item.question,
      difficulty: item.difficulty || (index < 2 ? "easy" : index < 4 ? "medium" : difficulty || "hard"),
      timeLimit: item.timeLimit || [60, 60, 90, 90, 120][index] || 90,
      order: item.order ?? index,
    })),
  };
  return result;
};

export const generateInterviewFeedbackAI = async ({ question, answer }) => {
  const weak = !answer || answer.length < 30;
  const fallback = {
    confidence: weak ? 4 : 8,
    communication: weak ? 5 : 8,
    correctness: weak ? 4 : 7,
    finalScore: weak ? 4.3 : 7.7,
    feedback: weak ? "Add more structure, examples, and confidence." : "Clear answer with good structure; add more measurable detail.",
  };

  const result = await callAIJson({
    prompt: buildInterviewFeedbackPrompt({ question, answer }),
    fallback,
    schemaName: "interviewFeedback",
  });
  const data = result.data || fallback;
  const finalScore = data.finalScore ?? data.score ?? fallback.finalScore;
  result.data = {
    confidence: data.confidence ?? data.confidenceScore ?? fallback.confidence,
    communication: data.communication ?? data.communicationScore ?? fallback.communication,
    correctness: data.correctness ?? data.technicalScore ?? fallback.correctness,
    finalScore,
    feedback: data.feedback || [...(data.strengths || []), ...(data.improvementTips || [])].slice(0, 3).join(" ") || fallback.feedback,
  };
  return result;
};

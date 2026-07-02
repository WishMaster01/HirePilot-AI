export * from "../../services/razorpay.service.js";
export * from "../../services/credit.service.js";

const featureCreditCosts = {
  resumeAnalysis: 2,
  atsCheck: 2,
  jobMatching: 3,
  interviewQuestions: 3,
  interviewFeedback: 5,
  videoAnalysis: 8,
  roadmapGeneration: 3,
  dsaReview: 4,
  projectAnalysis: 4,
  linkedinAnalysis: 2,
  mentorChat: 1,
};

export const calculateCreditCost = (featureName) => featureCreditCosts[String(featureName || "")] || 1;

export const hasEnoughCredits = (userCredits = 0, requiredCredits = 0) => Number(userCredits) >= Number(requiredCredits);

export const calculatePlanUsagePercentage = (used = 0, limit = 0) => {
  if (!limit || limit <= 0) return 0;
  return Math.min(100, Math.round((Number(used || 0) / Number(limit)) * 100));
};

export const rankPaymentFailuresByPriority = (failedPayments = []) => {
  if (!Array.isArray(failedPayments)) return [];
  return [...failedPayments].sort((a, b) => {
    const amountDiff = (Number(b.amount) || 0) - (Number(a.amount) || 0);
    if (amountDiff) return amountDiff;
    return new Date(a.createdAt || 0) - new Date(b.createdAt || 0);
  });
};

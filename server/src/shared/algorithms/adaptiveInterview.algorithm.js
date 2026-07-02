const order = ["easy", "medium", "hard"];

export const adjustDifficulty = (currentDifficulty = "medium", answerScore = 50) => {
  const index = Math.max(0, order.indexOf(String(currentDifficulty).toLowerCase()));
  if (answerScore >= 80) return order[Math.min(order.length - 1, index + 1)];
  if (answerScore < 50) return order[Math.max(0, index - 1)];
  return order[index] || "medium";
};

// Queue selection prefers the next question matching the adjusted difficulty.
export const getNextQuestion = (questionQueue = [], previousAnswerScore = 50) => {
  if (!Array.isArray(questionQueue) || !questionQueue.length) return null;
  const currentDifficulty = questionQueue[0]?.difficulty || "medium";
  const targetDifficulty = adjustDifficulty(currentDifficulty, previousAnswerScore);
  return questionQueue.find((question) => String(question.difficulty).toLowerCase() === targetDifficulty) || questionQueue[0];
};

export const calculateInterviewScore = (feedbackList = []) => {
  if (!Array.isArray(feedbackList) || !feedbackList.length) return 0;
  return Math.round(feedbackList.reduce((sum, item) => sum + (Number(item.finalScore ?? item.score) || 0), 0) / feedbackList.length);
};

export const generateInterviewProgress = (answered = 0, total = 0) => ({
  answered: Math.max(0, Number(answered) || 0),
  total: Math.max(0, Number(total) || 0),
  percentage: total ? Math.round((answered / total) * 100) : 0,
});

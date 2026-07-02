export const calculateDSAScore = (submissions = []) => {
  if (!Array.isArray(submissions) || !submissions.length) return 0;
  return Math.round(submissions.reduce((sum, item) => sum + (Number(item.score) || 0), 0) / submissions.length);
};

export const detectWeakTopics = (topicStats = {}) =>
  Object.entries(topicStats || {}).filter(([, stat]) => (Number(stat.score ?? stat) || 0) < 60).map(([topic]) => topic);

export const recommendProblemsByWeakTopics = (weakTopics = [], problemBank = []) => {
  const weak = new Set((Array.isArray(weakTopics) ? weakTopics : []).map(String));
  return (Array.isArray(problemBank) ? problemBank : []).filter((problem) => weak.has(String(problem.topic)));
};

export const classifyComplexity = (codeOrMetadata = "") => {
  const text = typeof codeOrMetadata === "string" ? codeOrMetadata : JSON.stringify(codeOrMetadata || {});
  if (/for\s*\([^)]*\).*for\s*\(/s.test(text)) return "O(n^2)";
  if (/while|for\s*\(/.test(text)) return "O(n)";
  return "O(1)";
};

export const calculatePracticeStreak = (solvedDates = []) => {
  const days = [...new Set((Array.isArray(solvedDates) ? solvedDates : []).map((date) => new Date(date).toISOString().slice(0, 10)))].sort().reverse();
  let streak = 0;
  let cursor = new Date();
  for (const day of days) {
    const expected = cursor.toISOString().slice(0, 10);
    if (day !== expected) break;
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
};

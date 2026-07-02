const fillerWords = ["um", "uh", "like", "actually", "basically", "you know", "sort of", "kind of"];

export const calculateWordsPerMinute = (transcript = "", durationSeconds = 60) => {
  const words = typeof transcript === "string" ? transcript.trim().split(/\s+/).filter(Boolean).length : 0;
  return durationSeconds > 0 ? Math.round((words / durationSeconds) * 60) : 0;
};

export const countFillerWords = (transcript = "") => {
  const value = typeof transcript === "string" ? transcript.toLowerCase() : "";
  return fillerWords.reduce((count, word) => count + (value.match(new RegExp(`\\b${word}\\b`, "g")) || []).length, 0);
};

// Pause score rewards steady pauses and penalizes very long silence.
export const calculatePauseScore = (pauses = []) => {
  if (!Array.isArray(pauses) || !pauses.length) return 75;
  const average = pauses.reduce((sum, value) => sum + Number(value || 0), 0) / pauses.length;
  return Math.max(0, Math.min(100, Math.round(100 - Math.max(0, average - 1.5) * 20)));
};

export const calculateMovingAverage = (values = [], windowSize = 3) => {
  if (!Array.isArray(values) || windowSize <= 0) return [];
  return values.map((_, index) => {
    const window = values.slice(Math.max(0, index - windowSize + 1), index + 1).map(Number);
    return Math.round(window.reduce((sum, value) => sum + value, 0) / window.length);
  });
};

export const calculateCommunicationScore = ({ wpm = 0, fillerCount = 0, pauseScore = 75, confidenceSignals = 60 } = {}) => {
  const speedScore = wpm >= 110 && wpm <= 160 ? 100 : Math.max(30, 100 - Math.abs(135 - wpm));
  const fillerScore = Math.max(0, 100 - fillerCount * 8);
  return Math.round(speedScore * 0.3 + fillerScore * 0.25 + pauseScore * 0.25 + confidenceSignals * 0.2);
};

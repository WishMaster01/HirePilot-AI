import { calculateCosineSimilarity, calculateJaccardSimilarity } from "./similarity.algorithm.js";

const tokenize = (text) => (typeof text === "string" ? text.toLowerCase().match(/[a-z0-9+#.-]+/g) || [] : []);

export const extractKeywordFrequency = (text) => {
  const frequency = {};
  tokenize(text).forEach((word) => {
    if (word.length > 1) frequency[word] = (frequency[word] || 0) + 1;
  });
  return frequency;
};

export const findMatchedAndMissingKeywords = (resumeKeywords, jobKeywords) => {
  const resumeSet = new Set(Array.isArray(resumeKeywords) ? resumeKeywords.map((item) => String(item).toLowerCase()) : Object.keys(resumeKeywords || {}));
  const target = Array.isArray(jobKeywords) ? jobKeywords.map((item) => String(item).toLowerCase()) : Object.keys(jobKeywords || {});
  const matchedKeywords = target.filter((keyword) => resumeSet.has(keyword));
  const missingKeywords = target.filter((keyword) => !resumeSet.has(keyword));
  return { matchedKeywords, missingKeywords };
};

// ATS score blends keyword coverage with text similarity for a practical resume-job match signal.
export const calculateATSScore = (resumeText, jobDescription) => {
  const resumeFrequency = extractKeywordFrequency(resumeText);
  const jobFrequency = extractKeywordFrequency(jobDescription);
  const { matchedKeywords, missingKeywords } = findMatchedAndMissingKeywords(resumeFrequency, jobFrequency);
  const totalKeywords = Object.keys(jobFrequency).length || 1;
  const keywordScore = Math.round((matchedKeywords.length / totalKeywords) * 100);
  const similarityScore = Math.round((calculateCosineSimilarity(resumeText, jobDescription) + calculateJaccardSimilarity(Object.keys(resumeFrequency), Object.keys(jobFrequency))) / 2);
  const atsScore = Math.round(keywordScore * 0.65 + similarityScore * 0.35);
  return { atsScore, keywordScore, similarityScore, matchedKeywords, missingKeywords };
};

export const findMissingLinkedInKeywords = (profileText, keywords) => {
  const profileFrequency = extractKeywordFrequency(profileText);
  return findMatchedAndMissingKeywords(profileFrequency, keywords).missingKeywords;
};

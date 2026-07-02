const toTokens = (value) => {
  if (Array.isArray(value)) return value.map(String).map((item) => item.toLowerCase().trim()).filter(Boolean);
  if (typeof value !== "string") return [];
  return value.toLowerCase().match(/[a-z0-9+#.-]+/g) || [];
};

const frequencyMap = (tokens) => tokens.reduce((map, token) => map.set(token, (map.get(token) || 0) + 1), new Map());

export const calculateJaccardSimilarity = (listA, listB) => {
  const setA = new Set(toTokens(listA));
  const setB = new Set(toTokens(listB));
  if (!setA.size && !setB.size) return 0;
  const intersection = [...setA].filter((item) => setB.has(item)).length;
  const union = new Set([...setA, ...setB]).size || 1;
  return Math.round((intersection / union) * 100);
};

// Cosine similarity compares term-frequency vectors from two text bodies.
export const calculateCosineSimilarity = (textA, textB) => {
  const freqA = frequencyMap(toTokens(textA));
  const freqB = frequencyMap(toTokens(textB));
  const keys = new Set([...freqA.keys(), ...freqB.keys()]);
  if (!keys.size) return 0;

  let dot = 0;
  let magA = 0;
  let magB = 0;
  keys.forEach((key) => {
    const a = freqA.get(key) || 0;
    const b = freqB.get(key) || 0;
    dot += a * b;
    magA += a * a;
    magB += b * b;
  });

  if (!magA || !magB) return 0;
  return Math.round((dot / (Math.sqrt(magA) * Math.sqrt(magB))) * 100);
};

export const calculateMessageSimilarity = (messageA, messageB) => calculateCosineSimilarity(messageA, messageB);

export const calculateSkillOverlap = (userSkills, jobSkills) => {
  const userSet = new Set(toTokens(userSkills));
  const jobSet = new Set(toTokens(jobSkills));
  if (!jobSet.size) return { score: 0, matchedSkills: [], missingSkills: [] };
  const matchedSkills = [...jobSet].filter((skill) => userSet.has(skill));
  const missingSkills = [...jobSet].filter((skill) => !userSet.has(skill));
  return { score: Math.round((matchedSkills.length / jobSet.size) * 100), matchedSkills, missingSkills };
};

export const findMissingSkills = (userSkills, targetRoleSkills) => calculateSkillOverlap(userSkills, targetRoleSkills).missingSkills;

import { calculateCosineSimilarity, calculateSkillOverlap } from "./similarity.algorithm.js";

export const getTopKMatches = (items = [], k = 5, scoreKey = "score") => {
  if (!Array.isArray(items)) return [];
  return [...items].sort((a, b) => (Number(b?.[scoreKey]) || 0) - (Number(a?.[scoreKey]) || 0)).slice(0, Math.max(0, k));
};

export const rankRecommendedRoles = (profile = {}, roleDatabase = []) => {
  if (!Array.isArray(roleDatabase)) return [];
  const skills = profile.skills || profile.techStack || [];
  return roleDatabase
    .map((role) => ({ ...role, score: calculateSkillOverlap(skills, role.skills || role.requiredSkills || []).score }))
    .sort((a, b) => b.score - a.score);
};

export const calculateJobMatchScore = (userProfile = {}, job = {}) => {
  const skillMatch = calculateSkillOverlap(userProfile.skills || userProfile.techStack || [], job.skills || job.requiredSkills || []).score;
  const experienceMatch = job.experience && userProfile.experience ? calculateCosineSimilarity(userProfile.experience, job.experience) : 50;
  const projectMatch = calculateCosineSimilarity((userProfile.projects || []).join(" "), `${job.description || ""} ${(job.skills || []).join(" ")}`);
  const locationMatch = !job.location || !userProfile.location || job.location === userProfile.location ? 100 : 40;
  const preferenceMatch = calculateCosineSimilarity((userProfile.interests || []).join(" "), `${job.role || ""} ${job.jobType || ""}`);
  return Math.round(skillMatch * 0.4 + experienceMatch * 0.2 + projectMatch * 0.2 + locationMatch * 0.1 + preferenceMatch * 0.1);
};

export const rankJobsForUser = (userProfile = {}, jobs = []) =>
  (Array.isArray(jobs) ? jobs : []).map((job) => ({ ...job, matchScore: calculateJobMatchScore(userProfile, job) })).sort((a, b) => b.matchScore - a.matchScore);

export const rankRelevantUserContext = (userMessage = "", contextItems = []) =>
  (Array.isArray(contextItems) ? contextItems : [])
    .map((item) => ({ ...item, relevanceScore: calculateCosineSimilarity(userMessage, item.text || item.content || JSON.stringify(item)) }))
    .sort((a, b) => b.relevanceScore - a.relevanceScore);

export const selectTopKContext = (contextItems = [], k = 5) => getTopKMatches(contextItems, k, "relevanceScore");

export const calculateTrendingScore = ({ likes = 0, comments = 0, shares = 0, createdAt } = {}) => {
  const ageHours = createdAt ? Math.max(1, (Date.now() - new Date(createdAt).getTime()) / 36e5) : 24;
  const commentCount = Array.isArray(comments) ? comments.length : Number(comments) || 0;
  return Math.round((Number(likes) * 2 + commentCount * 3 + Number(shares) * 4) / Math.pow(ageHours, 0.35));
};

export const rankCommunityPosts = (posts = []) =>
  (Array.isArray(posts) ? posts : []).map((post) => ({ ...post, trendingScore: calculateTrendingScore(post) })).sort((a, b) => b.trendingScore - a.trendingScore);

export const recommendPeers = (userProfile = {}, users = []) =>
  (Array.isArray(users) ? users : []).map((user) => ({ ...user, peerScore: calculateSkillOverlap(userProfile.skills || [], user.skills || []).score })).sort((a, b) => b.peerScore - a.peerScore);

export const rankUsersByXP = (users = []) =>
  (Array.isArray(users) ? users : []).sort((a, b) => (Number(b.xp || b.totalXP) || 0) - (Number(a.xp || a.totalXP) || 0));

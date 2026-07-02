const clampScore = (value) => Math.max(0, Math.min(100, Math.round(Number(value) || 0)));

export const calculateWeightedScore = (scores = {}, weights = {}) => {
  const keys = Object.keys(weights || {});
  if (!keys.length) return 0;
  const totalWeight = keys.reduce((sum, key) => sum + Math.max(0, Number(weights[key]) || 0), 0) || 1;
  const score = keys.reduce((sum, key) => sum + clampScore(scores?.[key]) * (Number(weights[key]) || 0), 0) / totalWeight;
  return clampScore(score);
};

const countScore = (items, target = 6) => clampScore(((Array.isArray(items) ? items.length : 0) / target) * 100);

export const calculateCareerScore = (profile = {}) =>
  calculateWeightedScore(
    {
      skills: countScore(profile.skills || profile.techStack, 8),
      projects: countScore(profile.projects, 4),
      resume: profile.resumeScore || profile.resume || 50,
      interviews: profile.interviewScore || profile.interviews || 50,
      dsa: profile.dsaScore || profile.dsa || 45,
      experience: profile.experience ? 75 : 35,
    },
    { skills: 25, projects: 20, resume: 20, interviews: 15, dsa: 10, experience: 10 }
  );

export const calculateEmployabilityScore = (profile = {}) =>
  calculateWeightedScore(
    {
      career: calculateCareerScore(profile),
      projectDepth: countScore(profile.projects, 5),
      marketFit: countScore(profile.interests, 4),
      stackDepth: countScore(profile.techStack || profile.skills, 8),
    },
    { career: 40, projectDepth: 25, marketFit: 15, stackDepth: 20 }
  );

export const calculateInterviewScore = (feedbackList = []) => {
  if (!Array.isArray(feedbackList) || !feedbackList.length) return 0;
  const average = feedbackList.reduce((sum, item) => sum + (Number(item.finalScore ?? item.score) || 0), 0) / feedbackList.length;
  return clampScore(average);
};

export const calculateProjectResumeValue = (projectData = {}) =>
  calculateWeightedScore(
    {
      architecture: projectData.architectureScore,
      completeness: projectData.completenessScore,
      security: 100 - clampScore(projectData.securityRiskScore),
      businessValue: projectData.businessValueScore || 60,
    },
    { architecture: 35, completeness: 25, security: 20, businessValue: 20 }
  );

export const calculateLinkedInScore = (profileText = "", targetRoleKeywords = []) => {
  const text = typeof profileText === "string" ? profileText.toLowerCase() : "";
  const keywords = Array.isArray(targetRoleKeywords) ? targetRoleKeywords : [];
  const matched = keywords.filter((keyword) => text.includes(String(keyword).toLowerCase()));
  return clampScore((matched.length / (keywords.length || 1)) * 100);
};

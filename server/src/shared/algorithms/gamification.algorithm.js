export const calculateXP = (activity = {}) => {
  const type = String(activity.type || activity.featureName || "").toLowerCase();
  const base = { interview: 80, dsa: 60, resume: 40, roadmap: 35, community: 20, mentor: 15 };
  const matchedKey = Object.keys(base).find((key) => type.includes(key));
  return base[matchedKey] || 10;
};

export const calculateUserLevel = (totalXP = 0) => {
  const xp = Math.max(0, Number(totalXP) || 0);
  if (xp >= 15000) return 50;
  if (xp >= 5000) return 25 + Math.floor((xp - 5000) / 400);
  if (xp >= 1000) return 10 + Math.floor((xp - 1000) / 267);
  return 1 + Math.floor(xp / 111);
};

export const calculateStreak = (activityDates = []) => {
  const days = [...new Set((Array.isArray(activityDates) ? activityDates : []).map((date) => new Date(date).toISOString().slice(0, 10)))].sort().reverse();
  let streak = 0;
  let cursor = new Date();
  for (const day of days) {
    if (day !== cursor.toISOString().slice(0, 10)) break;
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
};

export const unlockBadges = (userStats = {}) => {
  const badges = [];
  if ((userStats.interviews || 0) >= 5) badges.push("interview-starter");
  if ((userStats.dsaSolved || 0) >= 25) badges.push("dsa-builder");
  if ((userStats.resumeScore || 0) >= 85) badges.push("resume-ready");
  if ((userStats.streak || 0) >= 7) badges.push("weekly-streak");
  return badges;
};

export const rankLeaderboard = (users = []) =>
  (Array.isArray(users) ? users : []).sort((a, b) => (Number(b.totalXP || b.xp) || 0) - (Number(a.totalXP || a.xp) || 0));

export const calculatePracticeStreak = calculateStreak;

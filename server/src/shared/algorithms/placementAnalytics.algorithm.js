const stages = ["applied", "onlineAssessment", "technicalInterview", "hrInterview", "offer", "rejected"];

export const calculateApplicationStats = (applications = []) => {
  const stats = Object.fromEntries(stages.map((stage) => [stage, 0]));
  (Array.isArray(applications) ? applications : []).forEach((app) => {
    const key = String(app.status || "applied").replaceAll("_", "").toLowerCase();
    const stage = stages.find((item) => item.toLowerCase() === key) || "applied";
    stats[stage] += 1;
  });
  return { total: Array.isArray(applications) ? applications.length : 0, ...stats };
};

export const calculateSuccessProbability = (applications = []) => {
  const stats = calculateApplicationStats(applications);
  if (!stats.total) return 0;
  return Math.round(((stats.offer * 100) + (stats.hrInterview * 55) + (stats.technicalInterview * 35) + (stats.onlineAssessment * 20)) / stats.total);
};

export const detectWeakPlacementStage = (applications = []) => {
  const stats = calculateApplicationStats(applications);
  if (stats.onlineAssessment < stats.applied * 0.25) return "onlineAssessment";
  if (stats.technicalInterview < stats.onlineAssessment * 0.35) return "technicalInterview";
  if (stats.offer < stats.hrInterview * 0.25) return "offer";
  return "none";
};

export const sortApplicationsByDeadline = (applications = []) =>
  (Array.isArray(applications) ? applications : []).sort((a, b) => new Date(a.deadline || 8640000000000000) - new Date(b.deadline || 8640000000000000));

export const generateWeeklyProgressMetrics = (applications = []) => {
  const oneWeekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  const weekly = (Array.isArray(applications) ? applications : []).filter((app) => new Date(app.createdAt || app.updatedAt || 0).getTime() >= oneWeekAgo);
  return { newApplications: weekly.length, successProbability: calculateSuccessProbability(weekly), weakStage: detectWeakPlacementStage(applications) };
};

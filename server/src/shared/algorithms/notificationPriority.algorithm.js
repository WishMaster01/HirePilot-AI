const priorityWeights = {
  payment_failure: 100,
  interview_reminder: 85,
  placement_deadline: 80,
  roadmap_reminder: 55,
  community_update: 25,
};

export const calculateDeadlineUrgency = (deadline) => {
  if (!deadline) return 0;
  const hours = (new Date(deadline).getTime() - Date.now()) / 36e5;
  if (hours <= 0) return 100;
  if (hours <= 24) return 85;
  if (hours <= 72) return 60;
  return 20;
};

export const calculateNotificationPriority = (notification = {}) => {
  const type = String(notification.type || notification.category || "").toLowerCase();
  const base = priorityWeights[type] || 30;
  const urgency = calculateDeadlineUrgency(notification.deadline);
  const unreadBoost = notification.read ? 0 : 10;
  return Math.min(100, Math.round(base * 0.75 + urgency * 0.2 + unreadBoost));
};

export const rankNotifications = (notifications = []) =>
  (Array.isArray(notifications) ? notifications : [])
    .map((notification) => ({ ...notification, priorityScore: calculateNotificationPriority(notification) }))
    .sort((a, b) => b.priorityScore - a.priorityScore);

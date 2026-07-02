export const aggregateUsersByPlan = (users = []) =>
  (Array.isArray(users) ? users : []).reduce((acc, user) => {
    const plan = user.plan || user.subscriptions?.[0]?.plan || "FREE";
    acc[plan] = (acc[plan] || 0) + 1;
    return acc;
  }, {});

export const aggregateAIUsageByFeature = (aiUsage = []) =>
  (Array.isArray(aiUsage) ? aiUsage : []).reduce((acc, item) => {
    const feature = item.featureName || "unknown";
    acc[feature] = {
      requests: (acc[feature]?.requests || 0) + 1,
      creditsConsumed: (acc[feature]?.creditsConsumed || 0) + (Number(item.creditsConsumed) || 0),
      tokensUsed: (acc[feature]?.tokensUsed || 0) + (Number(item.tokensUsed) || 0),
    };
    return acc;
  }, {});

export const calculateRevenueMetrics = (payments = []) => {
  const paid = (Array.isArray(payments) ? payments : []).filter((payment) => payment.status === "PAID");
  const totalRevenue = paid.reduce((sum, payment) => sum + (Number(payment.amount) || 0), 0);
  return { totalRevenue, paidPayments: paid.length, averageOrderValue: paid.length ? Math.round(totalRevenue / paid.length) : 0 };
};

export const detectAbnormalAIUsage = (aiUsage = []) => {
  const byUser = (Array.isArray(aiUsage) ? aiUsage : []).reduce((acc, item) => {
    acc[item.userId] = (acc[item.userId] || 0) + (Number(item.creditsConsumed) || 0);
    return acc;
  }, {});
  const values = Object.values(byUser);
  const average = values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : 0;
  return Object.entries(byUser).filter(([, credits]) => credits > average * 3).map(([userId, credits]) => ({ userId, credits }));
};

export const rankMostActiveUsers = (users = []) =>
  (Array.isArray(users) ? users : []).sort((a, b) => (b.creditUsage?.length || b.interviews?.length || 0) - (a.creditUsage?.length || a.interviews?.length || 0));

export const calculateDashboardKPIs = (data = {}) => ({
  users: Array.isArray(data.users) ? data.users.length : 0,
  revenue: calculateRevenueMetrics(data.payments).totalRevenue,
  aiRequests: Array.isArray(data.aiUsage) ? data.aiUsage.length : 0,
  activeSubscriptions: (Array.isArray(data.subscriptions) ? data.subscriptions : []).filter((item) => item.status === "ACTIVE").length,
});
